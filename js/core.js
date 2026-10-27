'use strict';
/* =========================================================================
   INAZUMA ELEVEN ROGUELIKE (fan, no oficial)
   Juego de fútbol por turnos con elementos reales de Inazuma Eleven.
   Sin frameworks, sin backend. El estado de la partida vive en memoria;
   el meta-progreso (Puntos de Espíritu, desbloqueos, mejores marcas) se
   guarda en localStorage.
   ========================================================================= */

/* ---------------------------------------------------------------------
   0. MODO DÍA / NOCHE (tema visual, independiente del meta-progreso)
   --------------------------------------------------------------------- */

var THEME_KEY = 'inazumaTactilRoguelike_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  var btn = document.getElementById('themeToggle');
  if (btn) {
    btn.textContent = theme === 'light' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo noche' : 'Cambiar a modo día');
  }
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#f3f0e8' : '#080d22');
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  var next = current === 'light' ? 'dark' : 'light';
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* almacenamiento no disponible */ }
  applyTheme(next);
}

(function initTheme() {
  // El botón de día está oculto y la identidad nueva (skin.css) es de noche: siempre oscuro.
  applyTheme('dark');
})();

/* ---------------------------------------------------------------------
   1. CONSTANTES DERIVADAS DE LOS DATOS REALES (roster-data.js)
   --------------------------------------------------------------------- */

// TYPES, CYCLE, POSITIONS, TYPE_MARK, RIVAL_TEAM_NAMES, ROSTER vienen de roster-data.js

var POSITION_TEMPLATES = {
  Portero: { tiro: 20, pase: 50, defensa: 78, especial: 52, variance: 6 },
  Defensa: { tiro: 38, pase: 52, defensa: 72, especial: 50, variance: 6 },
  Centrocampista: { tiro: 54, pase: 72, defensa: 50, especial: 58, variance: 6 },
  Delantero: { tiro: 74, pase: 46, defensa: 34, especial: 62, variance: 6 }
};

var MAX_SQUAD = 4;
var MATCH_TURNS = 14; // 7 ataques para cada equipo (antes 10/5; cada turno es una interacción rápida sin animaciones bloqueantes, así que un partido más largo sigue siendo ágil en móvil y deja mucho más margen para usar la especial)
var SPIRIT_PER_NODE = 4;
var SPIRIT_PER_MATCH = 10;
var SPIRIT_PER_BOSS = 30;

// Bonificación de rival "jefe": crece PROPORCIONALMENTE a la profundidad del
// nodo en vez de ser un bonus plano idéntico para todos los jefes. Esto evita
// el "muro" artificial de dificultad detectado y corregido en el proyecto
// hermano (Elemental Strikers): allí un jefe de la fila 4 (40% de la
// temporada) recibía el mismo bonus absoluto que el jefe final de la fila 9,
// lo que producía una tasa de victoria en jefes muy inferior a la de
// partidos normales. Aquí el bonus base es pequeño y además escala con depth.
function bossBonusRange(depth) {
  var d = depth || 0;
  return {
    statMin: 2 + Math.floor(d * 0.25),
    statMax: 5 + Math.floor(d * 0.35),
    specialMin: 3 + Math.floor(d * 0.3),
    specialMax: 6 + Math.floor(d * 0.4) // -1 desde el original (7): pequeño ajuste a la baja del techo del bonus especial de los jefes, para que sean "un pelín" más fáciles sin tocar el resto del diseño ya validado por simulación
  };
}

/* ---------------------------------------------------------------------
   2. UTILIDADES
   --------------------------------------------------------------------- */

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
// rand() es para enteros (rand(1, 6) es un dado); con decimales hay que usar randf.
function randf(min, max) { return min + Math.random() * (max - min); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
// Convierte un diccionario {clave: {..., count}} (goleadores/asistentes,
// de partidos por turnos o de FutDraft/Liga) en una lista ordenada de
// mayor a menor count. Uso compartido por renderSummary y las pantallas
// de resumen de FutDraft/Liga.
function sortedStatsList(dict) {
  return Object.keys(dict || {}).map(function (k) { return dict[k]; }).sort(function (a, b) { return b.count - a.count; });
}

// Generador determinista (mulberry32), usado SOLO para el Modo Diario: hace
// que la plantilla y el mapa sean iguales para todo el mundo ese día. El
// combate en sí sigue usando el azar real de siempre (no tendría sentido
// "predecir" un partido, solo el reto de partida/plantel debe ser igual).
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function todayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function dailySeed() {
  var key = todayKey();
  var hash = 0;
  for (var i = 0; i < key.length; i++) { hash = (hash * 31 + key.charCodeAt(i)) | 0; }
  return hash;
}
// Sustituye Math.random por una versión con semilla SOLO durante fn(), y la
// restaura al terminar (incluso si fn lanza un error).
function withSeededRandom(seed, fn) {
  var original = Math.random;
  Math.random = mulberry32(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

// Aplica un cambio PERMANENTE (para esta partida) a una estadística de un
// jugador y marca visualmente la dirección del último cambio: verde si
// subió, rojo si bajó. La marca se queda toda la partida (no se limpia),
// salvo que otro cambio posterior a esa misma stat vaya en la dirección
// contraria. No se usa para la fatiga (efecto temporal y reversible, con
// su propio indicador ya existente).
function applyStatChange(player, stat, delta) {
  // Sin techo: un jugador muy entrenado puede superar el 99 "de manual" y
  // seguir subiendo (ver statBarsHtml, que lo pinta en verde en vez del
  // antiguo blanco de "al máximo").
  player[stat] = Math.max(0, player[stat] + delta);
  player.boostedStats = player.boostedStats || [];
  player.reducedStats = player.reducedStats || [];
  if (delta > 0) {
    if (player.boostedStats.indexOf(stat) === -1) player.boostedStats.push(stat);
    var ri = player.reducedStats.indexOf(stat);
    if (ri !== -1) player.reducedStats.splice(ri, 1);
  } else if (delta < 0) {
    if (player.reducedStats.indexOf(stat) === -1) player.reducedStats.push(stat);
    var bi = player.boostedStats.indexOf(stat);
    if (bi !== -1) player.boostedStats.splice(bi, 1);
  }
}
function choice(arr) { return arr[rand(0, arr.length - 1)]; }

// ----- Jugadores en varios equipos -----
// Un jugador es de su equipo, de los de equiposExtra (los del Protocolo
// Omega que repiten entre versiones) y de los equipos que toman prestados
// a los suyos (TEAM_BORROWS_FROM: Alius Masters con los de la Academia Alius).
function playerTeams(p) {
  var teams = [p.equipo].concat(p.equiposExtra || []);
  Object.keys(TEAM_BORROWS_FROM).forEach(function (t) {
    if (teams.indexOf(t) === -1 && TEAM_BORROWS_FROM[t].some(function (src) { return teams.indexOf(src) !== -1; })) teams.push(t);
  });
  return teams;
}
function playerInTeam(p, name) { return playerTeams(p).indexOf(name) !== -1; }
// Plantilla de un equipo: primero los suyos de verdad (en orden del
// roster), luego los que comparte con otros equipos (equiposExtra) y por
// último los prestados; esos dos grupos, de mejor a peor.
function teamMembers(name) {
  var own = [], shared = [], borrowed = [];
  ROSTER.forEach(function (p) {
    if (p.equipo === name) own.push(p);
    else if ((p.equiposExtra || []).indexOf(name) !== -1) shared.push(p);
    else if (playerInTeam(p, name)) borrowed.push(p);
  });
  if (typeof futDraftPlayerScore === 'function') {
    var byScore = function (a, b) { return futDraftPlayerScore(b) - futDraftPlayerScore(a); };
    shared.sort(byScore); borrowed.sort(byScore);
  }
  return own.concat(shared, borrowed);
}
// Equipos que no pueden coincidir con `name` en la misma carrera o cuadro:
// los de su grupo exclusivo y, si comparten jugadores prestados, el otro lado.
function teamConflicts(name) {
  var out = [];
  TEAM_EXCLUSIVE_GROUPS.forEach(function (g) {
    if (g.indexOf(name) !== -1) g.forEach(function (t) { if (t !== name) out.push(t); });
  });
  Object.keys(TEAM_BORROWS_FROM).forEach(function (t) {
    if (t === name) out = out.concat(TEAM_BORROWS_FROM[t]);
    else if (TEAM_BORROWS_FROM[t].indexOf(name) !== -1) out.push(t);
  });
  return out;
}
function uid() { return 'p' + Math.random().toString(36).slice(2, 10); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Cabecera común de pantalla (a petición explícita: unificar el estilo,
// antes unas pantallas tenían un "Volver" a todo lo ancho con título azul
// y otras una barra compacta). back: código del onclick; right: un emoji
// (se pinta como chip) o HTML propio (p. ej. un botón de dado).
function pageTopHtml(back, title, right) {
  var r = right ? (String(right).charAt(0) === '<' ? right : '<span class="page-ico" aria-hidden="true">' + right + '</span>') : '<span class="page-ico page-ico-empty" aria-hidden="true"></span>';
  return '<div class="page-top">' +
    (back ? '<button class="page-back" onclick="' + back + '" aria-label="Volver"><span aria-hidden="true">‹</span><em>Volver</em></button>' : '<span class="page-back page-back-empty" aria-hidden="true"></span>') +
    '<h2 class="page-title">' + title + '</h2>' + r +
  '</div>';
}

// Codifica/decodifica un objeto cualquiera en un parámetro de URL
// (JSON -> UTF-8 -> base64), para "compartir con un enlace" sin
// necesidad de backend -- usado por Modo Jugador y FutDraft (plantilla
// y resultado de torneo). unescape/escape con encodeURIComponent/
// decodeURIComponent es el truco de siempre para que btoa/atob (que solo
// entienden Latin1) no rompan con acentos/ñ.
function encodeShareParam(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
function decodeShareParam(encoded) {
  try { return JSON.parse(decodeURIComponent(escape(atob(encoded)))); } catch (e) { return null; }
}

/* ---------------------------------------------------------------------
   2b. CONDICIÓN DE TERRENO: con baja probabilidad (5%), un partido puede
   arrancar con una condición climática que da un pequeño empujón o
   penalización -- solo variedad, el 95% de las veces no hay ninguna.
   Se usa tanto en los partidos por turnos (resolveAttack) como en
   FutDraft (que no resuelve ataque a ataque, así que usa un multiplicador
   simétrico sobre la puntuación de equipo en vez de un ajuste por tipo).
   --------------------------------------------------------------------- */
var WEATHER_CHANCE = 0.05;
var WEATHER_CONDITIONS = {
  lluvia: { label: 'Lluvia', desc: 'El balón resbala: cuesta más acertar los tiros.' },
  viento: { label: 'Viento fuerte', desc: 'Favorece a los jugadores de tipo Viento.' },
  barro: { label: 'Terreno embarrado', desc: 'Favorece la fuerza física (tipo Montaña), penaliza la velocidad (Bosque y Viento).' }
};
function rollWeather() {
  if (Math.random() >= WEATHER_CHANCE) return null;
  var keys = Object.keys(WEATHER_CONDITIONS);
  return keys[rand(0, keys.length - 1)];
}
// Ajuste de "chance" de acierto en partidos por turnos, según la acción y
// el tipo elemental de quien ataca.
function weatherChanceDelta(weather, action, attackerTipo) {
  if (!weather) return 0;
  if (weather === 'lluvia') return (action === 'tiro' || action === 'regate') ? -4 : 0;
  if (weather === 'viento') return attackerTipo === 'Viento' ? 6 : -2;
  if (weather === 'barro') {
    if (attackerTipo === 'Montaña') return 6;
    if (attackerTipo === 'Bosque' || attackerTipo === 'Viento') return -3;
    return 0;
  }
  return 0;
}
function typeAdvantage(a, b) {
  if (a === b) return 0;
  var ia = CYCLE.indexOf(a), ib = CYCLE.indexOf(b);
  if (ia === -1 || ib === -1) return 0;
  if ((ia + 1) % CYCLE.length === ib) return 1;  // a vence a b
  if ((ib + 1) % CYCLE.length === ia) return -1; // b vence a a
  return 0;
}

// Tipo de una supertécnica concreta (tiro, regate, defensa, portero o
// pase): primero la tabla por técnica (HISSATSU_TIPO en roster-data.js) y
// si no está, el tipoTecnica de su jugador, normalizando valores sueltos.
// La tabla se mira sin tildes ni mayúsculas ("Hora celestial" = "Hora
// Celestial"), así una técnica no cae en el tipo de su jugador por cómo
// esté escrita.
var _hissatsuTipoKey = null;
function hissatsuTipoKey(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function hissatsuTipo(name, player) {
  if (typeof HISSATSU_TIPO !== 'undefined') {
    if (HISSATSU_TIPO[name]) return HISSATSU_TIPO[name];
    if (!_hissatsuTipoKey) {
      _hissatsuTipoKey = {};
      Object.keys(HISSATSU_TIPO).forEach(function (k) { _hissatsuTipoKey[hissatsuTipoKey(k)] = HISSATSU_TIPO[k]; });
    }
    var fixed = _hissatsuTipoKey[hissatsuTipoKey(name)];
    if (fixed) return fixed;
  }
  var src = player && player.id ? ROSTER.find(function (p) { return p.id === player.id; }) : null;
  // Jugador creado (Modo Jugador, Carrera de jugador): sin ficha en el
  // roster, la técnica tiene el tipo que le da quien la usa de verdad.
  if (!src && typeof techCatalog === 'function') {
    var known = techCatalog().map[hissatsuTipoKey(name)];
    if (known && known.owners.length) return hissatsuTipo(name, known.owners[0]);
  }
  var t = (src && src.tipoTecnica) || (player && player.tipoTecnica) || '';
  return { parada: 'portero', tirregate: 'regate' }[t] || t;
}
// Supertécnicas de un jugador (hasta 3), siempre las de su ficha del
// roster: las copias guardadas en partidas viejas llevan la lista antigua.
function playerTechs(p) {
  if (!p) return [];
  if (typeof careerRandomTechsFor === 'function') { var rt = careerRandomTechsFor(p); if (rt) return rt; }
  var src = p.id && typeof ROSTER !== 'undefined' ? ROSTER.find(function (x) { return x.id === p.id; }) : null;
  return ((src && src.hissatsu && src.hissatsu.length ? src.hissatsu : p.hissatsu) || []).slice(0, 3);
}
// Técnicas que un jugador puede usar en el partido: en Carrera, las de tu
// plantilla dependen de su media y de las que le hayas enseñado
// (careerMatchTechs); si no, las de su ficha del roster.
function matchTechsOf(player) {
  if (!player) return [];
  if (typeof careerMatchTechs === 'function') { var ct = careerMatchTechs(player); if (ct) return ct; }
  if (typeof careerRandomTechsFor === 'function') { var rt = careerRandomTechsFor(player); if (rt) return rt; }
  var src = player.id && typeof ROSTER !== 'undefined' ? ROSTER.find(function (p) { return p.id === player.id; }) : null;
  return (src && src.hissatsu && src.hissatsu.length ? src.hissatsu : player.hissatsu) || [];
}
function getTypeSymbol(tipo) {
  var baseUrl = '';
  var paths = {
    'Fuego': baseUrl + 'https://inazumarun.es/assets/elementos/fuego.png',
    'Bosque': baseUrl + 'https://inazumarun.es/assets/elementos/bosque.png',
    'Viento': baseUrl + 'https://inazumarun.es/assets/elementos/viento.png',
    'Montaña': baseUrl + 'https://inazumarun.es/assets/elementos/montaña.png'
  };
  var path = paths[tipo];
  return path ? '<img src="' + path + '" style="width:22px;height:22px;vertical-align:middle;border-radius:3px;" alt="' + tipo + '" />' : '⭕';
}

function typeBadge(tipo) {
  return '<span class="type-badge type-' + tipo.toLowerCase().replace('ñ', 'n') + '">' +
    '<span class="type-symbol">' + getTypeSymbol(tipo) + '</span>' +
    '<span class="type-mark" aria-hidden="true">' + TYPE_MARK[tipo] + '</span>' + tipo + '</span>';
}

function initials(nombre) {
  var parts = String(nombre).trim().split(/\s+/);
  var a = parts[0] ? parts[0][0] : '';
  var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

// Insignia de posición: badge PNG con las siglas reales (PR/DF/MD/DL) en
// assets/posiciones, en la esquina del avatar.
function positionIconPath(pos) {
  switch (pos) {
    case 'Portero': return 'https://inazumarun.es/assets/posiciones/PR.png';
    case 'Defensa': return 'https://inazumarun.es/assets/posiciones/DF.png';
    case 'Centrocampista': return 'https://inazumarun.es/assets/posiciones/MD.png';
    case 'Delantero': return 'https://inazumarun.es/assets/posiciones/DL.png';
    default: return '';
  }
}

// Soporte genérico para sprite propio/libre: se prueba automáticamente
// "https://inazumarun.es/assets/sprites/{id}.png" para cada jugador (o la ruta de su campo
// "sprite" si se define una distinta a mano). Si el archivo no existe
// todavía, el navegador dispara "onerror" y se cae a las iniciales de
// siempre sin romper nada -- así puedes ir soltando sprites de uno en uno
// sin tener que tocar roster-data.js cada vez.
// extraClass (opcional): clases de más en el span exterior -- usado por
// Modo Carrera para el aura de los jugadores potenciados (ver
// careerAvatarHtml/actionBoostCareerPlayer), a petición explícita
// ("tienen un aura alrededor del círculo").
function avatarHtml(p, extraClass) {
  var av = avatarBaseHtml(p, extraClass);
  var st = typeof playerStatusHook === 'function' ? playerStatusHook(p.id) : null;
  if (!st) return av;
  return '<span class="avatar-status">' + av + '<span class="status-badge status-badge-' + st.type + '" title="' + (st.type === 'injury' ? 'Lesionado' : 'Sancionado por roja') + '">' + (st.type === 'injury' ? '+' : '') + '</span></span>';
}
// Rareza por media del jugador, aplicada como marco de color al avatar en
// CUALQUIER lista (plantilla, mercado, draft...), no solo en la tarjeta
// grande del draft -- a petición explícita ("colores de rareza por
// coste/media... también en el marco del avatar en listas, no solo en el
// draft"). Usa futDraftPlayerScore (definida en futdraft-draft.js, cargado
// después de este archivo) -- funciona igualmente porque las funciones no
// se llaman hasta el primer render(), momento en el que ya está todo cargado.
function avatarRarityClass(p) {
  var score = Math.round(futDraftPlayerScore(p));
  if (score >= 90) return 'avatar-rarity-vibranium';
  if (score >= 80) return 'avatar-rarity-oro';
  if (score >= 70) return 'avatar-rarity-plata';
  return 'avatar-rarity-bronce';
}
function avatarBaseHtml(p, extraClass) {
  var spritePath = p.sprite || ('https://inazumarun.es/assets/sprites/' + p.id + '.png');
  var sprite = '<img class="avatar-sprite" src="' + escapeHtml(spritePath) + '" alt="" loading="lazy" ' +
    'onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'\';">';
  return '<span class="avatar ' + avatarRarityClass(p) + ' type-bg-' + p.tipo.toLowerCase().replace('ñ', 'n') + (extraClass ? ' ' + extraClass : '') + '" aria-hidden="true">' +
    sprite +
    '<span class="avatar-initials" style="display:none">' + initials(p.nombre) + '</span>' +
    '<span class="avatar-pos-badge"><img src="' + escapeHtml(positionIconPath(p.posicion)) + '" alt="' + escapeHtml(p.posicion) + '" onerror="this.parentElement.style.display=\'none\';"></span>' +
    '</span>';
}

