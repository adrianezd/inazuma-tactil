/* ---------------------------------------------------------------------
   SUPERTÉCNICAS: potencia y afinidad de cada técnica, y el catálogo del
   menú (Colección > Supertécnicas), a petición explícita ("que haya
   potencia y afinidad en cada técnica", "ver supertécnicas en menú").
   La potencia (de 25 a 99) sale de lo bueno que es el mejor jugador que
   la usa, con un empujón a las versiones mejoradas (X, Z, V2, n.º 3...).
   La afinidad es el elemento de la técnica (el más repetido entre quienes
   la usan): si coincide con el del jugador que la lanza, rinde un 15% más.
   --------------------------------------------------------------------- */
var TECH_KIND_LABEL = { tiro: 'Tiro', regate: 'Regate', defensa: 'Defensa', portero: 'Portero', pase: 'Pase' };
var TECH_KIND_ICON = { tiro: '🔥', regate: '💨', defensa: '🛡️', portero: '🧤', pase: '🎯' };
// Icono de posición de cada tipo (DL tira, MD regatea, DF defiende, PR para).
var TECH_KIND_POS = { tiro: 'Delantero', regate: 'Centrocampista', defensa: 'Defensa', portero: 'Portero', pase: 'Centrocampista' };
function techKindIconHtml(kind) {
  return '<img src="' + positionIconPath(TECH_KIND_POS[kind] || 'Delantero') + '" alt="' + (TECH_KIND_LABEL[kind] || '') + '">';
}
var TECH_ELEMENTS = ['Fuego', 'Bosque', 'Viento', 'Montaña'];
var TECH_AFFINITY_MULT = 1.15;
var TECH_EVOLUTION_RE = /(^|\s)(x|z|v\d|g\d|\d|plus|final|n\.º\s*\d)$/i;
function techHash(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
// Potencia fijada a mano según lo fuerte que es cada técnica en los juegos
// de Inazuma Eleven (a petición explícita: "Fénix es mejor que Tiro
// giratorio, Triángulo letal mejor que Tornado oscuro"). Las que no están
// aquí la sacan del mejor jugador que la usa, como antes.
var TECH_POWER_IE = {
  // Tiro: básicos
  'Amago de tiro': 45, '¡Hala! ¡Una bola de arroz!': 45, 'Tiro amasado': 48, 'Tiro giratorio': 48,
  'Tiro rotatorio': 50, 'Tiro rotativo': 50, 'Chilena': 50, 'Curve shot': 50, 'Bounce shot': 50,
  'Golf total': 50, 'Truco balonazo': 50, 'Tirachinas': 50, 'Tiro efervescente': 50, 'Remate de seguridad': 50,
  'Remate tarzán': 52, 'Remate potente': 52, 'Cañonazo': 52, 'Tiro tramposo': 52, 'Bola falsa': 52, 'Bomba saltarina': 52,
  'Remate poderoso': 54, 'Bomba daruma': 54, 'Tiro elefante': 56, 'Tiro valiente': 56, 'Disparo valiente': 56, 'Remate en V': 56,
  'Cabezazo kung fu': 58, 'Remate misil': 58,
  // Tiro: medios
  'Remate dragón': 62, 'Tiro fantasma': 62, 'Disparo rodante': 62, 'Remate Gafas': 62,
  'Remate tsunami': 64, 'Trampolín relámpago': 64, 'Tiro espejismo': 64, 'Tiro sónico': 64, 'Remate Rebotado': 64,
  'Tornado de fuego': 66, 'Remate del tigre': 66, 'Remate del águila': 66, 'Tiro meteórico': 66, 'Tiro cegador': 66, 'Tiro espectral': 66,
  'Remate pegaso': 68, 'Remate múltiple': 68,
  'Tornado dragón': 70, 'Tornado oscuro': 70, 'Tornado inverso': 70, 'Remate celestial': 70, 'Tiro balista': 70,
  'Tiro del cometa': 70, 'Remate combinado': 70, 'Chilena de pingüino': 70, 'Astro remate': 70,
  'Tornado de tigre': 72, 'Tornado doble': 72, 'Ventisca eterna': 72, 'Lluvia de meteoros': 72, 'Desfile de pingüinos': 72,
  'Remate Guiverno': 74, 'Superremate rebotado': 74,
  // Tiro: fuertes
  'Pingüino emperador n.º 2': 76, 'Agujero de gusano': 76, 'Tormenta de fuego': 76, 'Disparo cósmico': 76,
  'Tiro Supermasivo': 78, 'Pingüino Aéreo': 78, 'Tornado de Fuego DT': 78,
  'Triángulo letal': 80, 'Supertrampolín relámpago': 80, 'Llamarada infernal': 80,
  'Fénix': 82, 'Tri-Pegaso': 82, 'Tripegaso': 82, 'Llamarada atómica': 82, 'Pingüino emperador n.º 1': 82,
  'Ventisca de fuego': 84, 'Tormenta del tigre': 84, 'Lanza de odín': 84, 'Pinguino Espacial': 84,
  'Triángulo letal 2': 86, 'Pingüino emperador 7': 86, 'Big bang': 86, 'Rayo del juicio': 86,
  // Tiro: definitivos
  'Pinguino Emperador X': 88, 'Pingüino emperador n.º 3': 88, 'Triángulo letal final': 92, 'Victoria tricolor': 88, 'Zero Magnum': 88,
  'Supernova': 90, 'Remate de Gaia': 90, 'Remate Bahamut': 92, 'Pingüino perfecto': 92, 'La Tierra': 99,
  // Portero
  'Parada en plancha': 50, 'Parada fuerte': 52, 'Bloque de hielo': 62, 'Escudo de fuerza': 66,
  'Mano celestial': 70, 'Muralla infinita': 70, 'Puño de Furia': 72,
  'Mano Mágica': 76, 'Mano diabólica': 76, 'Escudo de fuerza total': 76, 'Bimano celestial': 80,
  // Defensa
  'Barrido defensivo': 52, 'El muro': 58, 'Terremoto': 58, 'Telaraña': 58, 'Pisotón de sumo': 58,
  'Entrada huracán': 60, 'Entrada tormenta': 64,
  'Súper pisotón de sumo': 70, 'Ángel de nieve': 70, 'Mega terremoto': 72,
  // Regate
  'Espejismo de balón': 66
};
// Afinidad revisada a petición explícita ("revisa la afinidad de todas las
// supertécnicas"): antes era solo el elemento más repetido entre quienes la
// usan, y salían cosas como un Fénix de Bosque o La Tierra de Viento. Ahora
// manda, por este orden: la tabla de abajo, lo que dice el nombre (fuego,
// lava → Fuego; roca, arena, muro → Montaña; hielo, tornado, agua →
// Viento; hoja, flor → Bosque) y, si el nombre no dice nada, sus dueños.
var TECH_ELEMENT_IE = {
  'Mano Celestial': 'Montaña', 'Mano Celestial X': 'Montaña', 'Mano Mágica': 'Montaña', 'Manos infinitas': 'Montaña',
  'Tornado dragón': 'Fuego', 'Tornado oscuro': 'Fuego', 'Tornado de Fuego': 'Fuego', 'Fénix': 'Fuego',
  'Ventisca eterna': 'Viento', 'Paisaje Helado': 'Viento', 'Aullido de lobo': 'Viento',
  'El Muro': 'Montaña', 'Mega Terremoto': 'Montaña', 'La Tierra': 'Montaña'
};
var TECH_ELEMENT_WORDS = [
  ['Fuego', /fueg|llam|igne|ignic|fenix|infern|volcan|\blava\b|magma|ardiente|incandesc|solar|\bsol\b|abrasa|brasa|combusti|\bpiro|flamig|ceniza|azufre/],
  ['Montaña', /arena|desiert|\bduna|\broca|rocos|piedra|tierra|terremoto|seismo|gaia|montan|excavaci|\btopo\b|tunelad|cumbre|\bmuro|muralla|gravedad|gravita/],
  ['Viento', /viento|ventisca|huracan|tornado|ciclon|vendaval|tormenta|brisa|torbellino|tsunami|ballena|ocean|acuatic|sirena|coral|\bagua|catarat|niagara|nieve|hielo|helad|iceberg|polar|congela|tifon|simun|buzo|marlin|peces|megalodon|tiburon|\baire|aereo/],
  ['Bosque', /bosque|\bhoja|\bflor|petalo|\brosas?\b|polen|jungla|zarcillo|bejuco|vegetal|\beden\b|arbol|selva/]
];
var _techElementIeKey = null;
function techNamedElement(name) {
  if (!_techElementIeKey) {
    _techElementIeKey = {};
    Object.keys(TECH_ELEMENT_IE).forEach(function (k) { _techElementIeKey[hissatsuTipoKey(k)] = TECH_ELEMENT_IE[k]; });
  }
  var k = hissatsuTipoKey(name);
  if (_techElementIeKey[k]) return _techElementIeKey[k];
  for (var i = 0; i < TECH_ELEMENT_WORDS.length; i++) if (TECH_ELEMENT_WORDS[i][1].test(k)) return TECH_ELEMENT_WORDS[i][0];
  return null;
}
// Nivel de mejora por el sufijo: V2/X/Z/Plus = 1, V3/3/n.º 3 = 2... 0 si no es una mejora.
function techEvolutionLevel(name) {
  var m = String(name).trim().match(TECH_EVOLUTION_RE);
  if (!m) return 0;
  if (/final/i.test(m[2])) return 9;
  var n = parseInt(m[2].replace(/\D/g, ''), 10);
  return isNaN(n) ? 1 : Math.max(1, n - 1);
}
function techCatalog() {
  if (techCatalog._c) return techCatalog._c;
  var map = {}, list = [];
  ROSTER.forEach(function (p) {
    (p.hissatsu || []).slice(0, 3).forEach(function (h) {
      var k = hissatsuTipoKey(h);
      var e = map[k];
      if (!e) { e = map[k] = { name: h, owners: [] }; list.push(e); }
      if (e.owners.indexOf(p) === -1) e.owners.push(p);
    });
  });
  list.forEach(function (e) {
    var kind = hissatsuTipo(e.name, e.owners[0]);
    e.kind = TECH_KIND_LABEL[kind] ? kind : 'tiro';
    var cnt = {};
    e.owners.forEach(function (p) { if (p.tipo) cnt[p.tipo] = (cnt[p.tipo] || 0) + 1; });
    var h = techHash(e.name);
    e.element = techNamedElement(e.name) || Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; })[0] || TECH_ELEMENTS[h % 4];
    var best = e.owners.reduce(function (m, p) { return Math.max(m, futDraftPlayerScore(p)); }, 50);
    var evo = TECH_EVOLUTION_RE.test(e.name.trim()) ? 6 : 0;
    e.power = clamp(Math.round((best - 50) * 1.3 + 35 + (h % 9) - 4 + evo), 25, 99);
  });
  Object.keys(TECH_POWER_IE).forEach(function (n) {
    var e = map[hissatsuTipoKey(n)];
    if (e) e.power = TECH_POWER_IE[n];
  });
  // Una versión mejorada (V2, X, n.º 3...) siempre pega más que la técnica
  // con el mismo nombre sin el sufijo, y cuanto más alto el nivel, más.
  var chains = {};
  list.forEach(function (e) {
    if (!techEvolutionLevel(e.name)) return;
    var k = hissatsuTipoKey(e.name.trim().replace(TECH_EVOLUTION_RE, ''));
    if (map[k] && map[k] !== e) (chains[k] = chains[k] || []).push(e);
  });
  Object.keys(chains).forEach(function (k) {
    var steps = [map[k]].concat(chains[k].sort(function (a, b) { return techEvolutionLevel(a.name) - techEvolutionLevel(b.name); }));
    // Si la cadena no cabe por arriba, se baja la base para dejar hueco.
    steps[0].power = Math.min(steps[0].power, 99 - 5 * (steps.length - 1));
    for (var i = 1; i < steps.length; i++) steps[i].power = clamp(Math.max(steps[i].power, steps[i - 1].power + 5), 25, 99);
  });
  techCatalog._c = { map: map, list: list };
  return techCatalog._c;
}
function techInfo(name, player) {
  var e = techCatalog().map[hissatsuTipoKey(name)];
  if (e) return e;
  var h = techHash(String(name));
  var kind = hissatsuTipo(name, player);
  return { name: name, owners: [], kind: TECH_KIND_LABEL[kind] ? kind : 'tiro', element: techNamedElement(name) || (player && player.tipo) || TECH_ELEMENTS[h % 4], power: 40 + (h % 30) };
}
function techHasAffinity(name, player) { return !!(player && player.tipo) && techInfo(name, player).element === player.tipo; }
// Potencia real al usarla ese jugador: con afinidad, un 15% más.
function techEffectivePower(name, player) {
  var base = techInfo(name, player).power;
  return Math.round(base * (techHasAffinity(name, player) ? TECH_AFFINITY_MULT : 1));
}
// Ajuste de probabilidad en Tú decides según la potencia de la técnica:
// una de 60 no cambia nada; una de 90 con afinidad suma unos 15 puntos.
function techOddsBonus(name, player) { return (techEffectivePower(name, player) - 60) / 220; }
function techElementIconHtml(el, size) {
  return typeof getTypeSymbol === 'function' ? getTypeSymbol(el).replace(/22px/g, (size || 16) + 'px') : escapeHtml(el);
}
// Ficha compacta de una técnica: tipo, nombre, potencia y afinidad.
function techChipHtml(name, player, extraCls) {
  var e = techInfo(name, player);
  var aff = techHasAffinity(name, player);
  return '<span class="tech-chip' + (extraCls ? ' ' + extraCls : '') + '" title="' + escapeHtml(TECH_KIND_LABEL[e.kind] + ', afinidad ' + e.element) + '">' +
    '<span class="tech-chip-ico">' + (TECH_KIND_ICON[e.kind] || '⚡') + '</span>' +
    '<span class="tech-chip-name">' + escapeHtml(name) + '</span>' +
    '<span class="tech-chip-pow' + (aff ? ' aff' : '') + '">' + techElementIconHtml(e.element, 14) + (player ? techEffectivePower(name, player) : e.power) + '</span>' +
  '</span>';
}

// ===== Catálogo del menú =====
window.actionGoTechCatalog = function () {
  G.techCat = G.techCat || { kind: null, elem: null, q: '', sort: 'power', limit: 40, open: null };
  G.screen = 'techCatalog';
  render();
};
window.actionTechCatSet = function (field, value) {
  var t = G.techCat;
  t[field] = t[field] === value && field !== 'q' && field !== 'sort' ? null : value;
  if (field !== 'open') t.limit = 40;
  render();
};
window.actionTechCatMore = function () { G.techCat.limit += 40; render(); };
function techCatalogFiltered(t) {
  var q = hissatsuTipoKey(t.q || '');
  var list = techCatalog().list.filter(function (e) {
    if (t.kind && e.kind !== t.kind) return false;
    if (t.elem && e.element !== t.elem) return false;
    if (q && hissatsuTipoKey(e.name).indexOf(q) === -1 && !e.owners.some(function (p) { return hissatsuTipoKey(p.nombre).indexOf(q) !== -1; })) return false;
    return true;
  });
  return list.sort(t.sort === 'name'
    ? function (a, b) { return a.name.localeCompare(b.name); }
    : function (a, b) { return b.power - a.power || a.name.localeCompare(b.name); });
}
function techVideoHtml(name) {
  var src = typeof mrTechVideoSrc === 'function' ? mrTechVideoSrc(name) : null;
  if (!src) return '<p class="dim small center-text">Esta técnica todavía no tiene vídeo.</p>';
  return '<video class="tech-video" muted autoplay loop playsinline webkit-playsinline><source src="' + escapeHtml(src) + '.webm" type="video/webm"><source src="' + escapeHtml(src) + '.mp4" type="video/mp4"></video>';
}
function techCatalogRowHtml(e, open) {
  var hasVideo = typeof mrTechVideoSrc === 'function' && !!mrTechVideoSrc(e.name);
  var owners = e.owners.slice(0, 2).map(function (p) { return escapeHtml(p.nombre); }).join(', ') + (e.owners.length > 2 ? ' y ' + (e.owners.length - 2) + ' más' : '');
  var key = hissatsuTipoKey(e.name);
  return '<div class="tech-row' + (open ? ' open' : '') + '">' +
    '<button class="tech-row-main" onclick="actionTechCatSet(\'open\', \'' + key + '\')">' +
      '<span class="tech-row-kind" title="' + TECH_KIND_LABEL[e.kind] + '">' + techKindIconHtml(e.kind) + '</span>' +
      '<span class="tech-row-txt"><strong>' + escapeHtml(e.name) + (hasVideo ? ' <span class="tech-row-vid">🎬</span>' : '') + '</strong><em>' + owners + '</em></span>' +
      '<span class="tech-row-elem">' + techElementIconHtml(e.element, 18) + '</span>' +
      '<span class="tech-row-pow"><span class="tech-pow-bar"><span style="width:' + e.power + '%"></span></span><b>' + e.power + '</b></span>' +
    '</button>' +
    (open ? '<div class="tech-row-body">' + techVideoHtml(e.name) +
      '<p class="dim small">Afinidad <strong>' + escapeHtml(e.element) + '</strong>: un jugador de ese elemento la usa con un 15% más de potencia.</p>' +
      '<div class="tech-owners">' + e.owners.map(function (p) { return '<span class="tech-owner">' + avatarHtml(p) + escapeHtml(p.nombre) + '</span>'; }).join('') + '</div>' +
    '</div>' : '') +
  '</div>';
}
function renderTechCatalog() {
  var t = G.techCat || (G.techCat = { kind: null, elem: null, q: '', sort: 'power', limit: 40, open: null });
  var list = techCatalogFiltered(t);
  var kinds = [{ id: null, name: 'Todas' }].concat(['tiro', 'regate', 'defensa', 'portero'].map(function (k) { return { id: k, name: TECH_KIND_LABEL[k] }; }));
  var kindTabs = '<div class="seg-tabs tech-kind-tabs" role="tablist">' + kinds.map(function (k) {
    return '<button role="tab" class="seg-tab' + (t.kind === k.id ? ' on' : '') + '" aria-label="' + k.name + '" title="' + k.name + '" onclick="actionTechCatSet(\'kind\', ' + (k.id ? '\'' + k.id + '\'' : 'null') + ')">' + (k.id ? techKindIconHtml(k.id) : k.name) + '</button>';
  }).join('') + '</div>';
  var elemBtns = '<div class="tech-elem-row">' + TECH_ELEMENTS.map(function (el) {
    return '<button class="tech-elem-btn' + (t.elem === el ? ' on' : '') + '" onclick="actionTechCatSet(\'elem\', \'' + el + '\')" aria-label="' + el + '">' + techElementIconHtml(el, 22) + '</button>';
  }).join('') +
    '<button class="btn btn-tiny' + (t.sort === 'power' ? ' active' : '') + '" onclick="actionTechCatSet(\'sort\', \'power\')">Potencia</button>' +
    '<button class="btn btn-tiny' + (t.sort === 'name' ? ' active' : '') + '" onclick="actionTechCatSet(\'sort\', \'name\')">Nombre</button>' +
  '</div>';
  var rows = list.slice(0, t.limit).map(function (e) { return techCatalogRowHtml(e, t.open === hissatsuTipoKey(e.name)); }).join('');
  return '<div class="screen">' +
    pageTopHtml('actionBackToMenu()', 'Supertécnicas', '⚡') +
    '<div class="panel center-text page-intro">' +
      '<p class="dim small">' + techCatalog().list.length + ' técnicas, cada una con su potencia y su afinidad. Toca una para verla.</p>' +
    '</div>' +
    '<div class="panel">' + kindTabs + elemBtns +
      '<input class="select-field mt" type="text" data-focus-key="techCatQ" placeholder="Busca técnica o jugador" value="' + escapeHtml(t.q || '') + '" oninput="actionTechCatSet(\'q\', this.value)">' +
    '</div>' +
    '<div class="panel"><p class="dim small">' + list.length + ' resultados</p>' + (rows || '<p class="dim small center-text">No hay ninguna con esos filtros.</p>') +
      (list.length > t.limit ? '<button class="btn btn-outline btn-block mt" onclick="actionTechCatMore()">Ver más</button>' : '') +
    '</div>' +
  '</div>';
}
