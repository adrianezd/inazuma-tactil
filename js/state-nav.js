/* ---------------------------------------------------------------------
   7. ESTADO GLOBAL
   --------------------------------------------------------------------- */

var G = {
  screen: 'menu',
  meta: (typeof localStorage !== 'undefined') ? loadMeta() : { points: 0, unlocked: [], bestNode: 0, bestWins: 0, runsPlayed: 0, normalWins: 0, bestSurvivalWave: 0, tournamentsWon: 0, dailyLastDate: null, dailyLastResult: null, ligaTierUnlocked: { normal: true, dificil: false, extremo: false }, unlockedShields: [], equippedShield: null },
  run: null,
  match: null,
  pendingCaptainOffers: null,
  pendingRecruits: null,
  pendingTraining: null,
  pendingRunMode: 'normal',
  pendingDraftMode: null,
  pendingDraftSquad: [],
  pendingDraftOptions: [],
  vestuarioFilter: { tipo: null, posicion: null },
  coleccionFilter: { tipo: null, posicion: null },
  gacha: { spinning: false, resultId: null }
};

// Acepta el booleano de siempre (true/false = difícil/normal) o, para los
// modos nuevos, una cadena directa ('torneo', 'supervivencia', 'diario').
function newRun(modeOrHard) {
  var mode = typeof modeOrHard === 'string' ? modeOrHard : (modeOrHard ? 'hard' : 'normal');
  var needsBranchedMap = mode === 'normal' || mode === 'hard';
  G.run = {
    squad: [],
    mode: mode,
    hardMode: mode === 'hard',
    map: needsBranchedMap ? generateMap(mode === 'hard') : null,
    currentNodeId: null,
    traversedEdges: {},
    clearedCount: 0,
    matchesWon: 0,
    spiritEarned: 0,
    victory: false,
    startedAt: Date.now(),
    // Goleadores de toda la partida (Normal/Difícil/Torneo/Supervivencia/
    // Diario): los rivales aquí no tienen identidad real (se regeneran de
    // cero en cada partido, ver generateRivalPlayer), así que se agregan
    // por su etiqueta genérica de posición ("Delantero rival", etc.).
    goalStats: { scorers: {} }
  };
}

// Se llama en cada gol de un partido por turnos (ver resolveAttack). No se
// usa en FutDraft/Liga, que llevan su propio sistema de goleadores +
// asistentes (ver futDraftRecordGoalEvents) porque ahí sí se puede simular
// una asistencia con sentido; en un partido por turnos no hay "pase que
// genera el disparo", así que aquí solo se cuenta goleador.
function recordRunGoalScorer(attackerRaw, isPlayerAttacking) {
  if (!G.run || !G.run.goalStats) return;
  // Solo se registran los goles del propio jugador: en un partido por turnos
  // el rival "no tiene identidad real" (se regenera de cero cada partido, ver
  // generateRivalPlayer) y no tiene sentido mostrar en el resumen quién te ha
  // metido gol -- eso solo se sabe (y se muestra) en FutDraft/Liga, que sí
  // simulan un partido real con jugadores reales.
  if (!isPlayerAttacking) return;
  var key = 'p:' + attackerRaw.id;
  var scorers = G.run.goalStats.scorers;
  var bucket = scorers[key] || { nombre: attackerRaw.nombre, count: 0 };
  bucket.count++;
  scorers[key] = bucket;
}

/* ---------------------------------------------------------------------
   8. RENDER: NAVEGACIÓN PRINCIPAL
   --------------------------------------------------------------------- */

var appEl = null;

// Todo render() reemplaza #app.innerHTML entero, así que cualquier
// <input> pierde el foco (y el cursor) en cada tecla -- a petición
// explícita ("en cuanto escribo una letra, tengo que volver a darle al
// cuadrado para escribir la siguiente, como que me quita el cursor").
// Arreglado de raíz aquí (no solo en el campo que se reportó): si el
// elemento con el foco lleva un atributo data-focus-key, se guarda antes
// de tirar el HTML viejo y se restaura (foco + posición del cursor) tras
// montar el nuevo -- los inputs que se re-renderizan en cada tecla
// (búsquedas de Mercado/Plantilla, apellido/dorsal de Modo Jugador) lo
// llevan puesto.
function captureFocusForRerender() {
  var active = document.activeElement;
  if (!active || !appEl || !appEl.contains(active) || !active.dataset || !active.dataset.focusKey) return null;
  return { key: active.dataset.focusKey, start: active.selectionStart, end: active.selectionEnd };
}
function restoreFocusAfterRerender(info) {
  if (!info) return;
  var el = appEl.querySelector('[data-focus-key="' + info.key + '"]');
  if (!el) return;
  el.focus();
  if (typeof el.setSelectionRange === 'function' && typeof info.start === 'number') {
    try { el.setSelectionRange(info.start, info.end); } catch (e) {}
  }
}
// Guarda contra render() REENTRANTE: restoreFocusAfterRerender llama a
// el.focus() justo después de reemplazar #app.innerHTML, y eso puede
// disparar un evento "blur" SÍNCRONO en el input que tenía el foco antes
// (útil por si algún input llega a llevar un onblur que llame a render();
// de hecho un intento así -- el dorsal de Modo Jugador -- llegó a
// colgar la pestaña antes de quitarlo, ver player-mode.js) --
// si ese blur llama a render() de nuevo mientras el render() de fuera
// todavía está a mitad de reemplazar el DOM, el navegador rompe con
// "Failed to set the 'innerHTML' property... the node to be removed is
// no longer a child of this node" (visto de verdad con Playwright al
// escribir en el dorsal). Con esta guarda, una llamada a render() que
// llega mientras ya hay una en curso solo queda marcada
// (pendingRerender) y se ejecuta justo después, nunca a la vez.
var isRendering = false;
var pendingRerender = false;
var lastRenderedScreen = null;
var lastMainViewKey = null;
function render() {
  if (isRendering) { pendingRerender = true; return; }
  isRendering = true;
  if (!appEl) appEl = document.getElementById('app');
  var focusInfo = captureFocusForRerender();
  if (typeof profileHook === 'function') profileHook();
  var html = '';
  switch (G.screen) {
    case 'menu': html = renderMenu(); break;
    case 'ajustes': html = renderAjustes(); break;
    case 'careerSlots': html = renderCareerSlots(); break;
    case 'careerSetup': html = renderCareerSetup(); break;
    case 'careerSquadPicker': html = renderCareerSquadPicker(); break;
    case 'careerMode': html = renderCareerMode(); break;
    case 'jugadorSetup': html = renderJugadorSetup(); break;
    case 'jugadorMode': html = renderJugadorMode(); break;
    case 'jugadorShared': html = renderJugadorShared(); break;
    case 'soloSetup': html = renderSoloSetup(); break;
    case 'soloCareer': html = renderSoloCareer(); break;
    case 'soloFace': html = renderSoloFace(); break;
    case 'soloHub': html = renderSoloHub(); break;
    case 'futdraftSharedSquad': html = renderFutDraftSharedSquad(); break;
    case 'futdraftSharedResult': html = renderFutDraftSharedResult(); break;
    case 'modeSelect': html = renderModeSelect(); break;
    case 'captainSelect': html = renderCaptainSelect(); break;
    case 'map': html = renderMap(); break;
    case 'match': html = renderMatch(); break;
    case 'entrenamiento': html = renderTraining(); break;
    case 'fichaje': html = renderRecruit(); break;
    case 'descanso': html = renderRest(); break;
    case 'evento': html = renderEvento(); break;
    case 'summary': html = renderSummary(); break;
    case 'gacha': html = renderGacha(); break;
    case 'penaltyMode': html = renderPenaltyMode(); break;
    case 'coleccion': html = renderColeccion(); break;
    case 'perfil': html = renderProfile(); break;
    case 'misiones': html = renderMissions(); break;
    case 'temporada': html = renderSeason(); break;
    case 'coleccionEquipos': html = renderColeccionEquipos(); break;
    case 'techCatalog': html = renderTechCatalog(); break;
    case 'miColeccion': html = renderMiColeccion(); break;
    case 'rewardMachine': html = renderRewardMachine(); break;
    case 'draftPick': html = renderDraftPick(); break;
    case 'dailyAlreadyPlayed': html = renderDailyAlreadyPlayed(); break;
    case 'survivalCashout': html = renderSurvivalCashout(); break;
    case 'torneoBracket': html = renderTournamentBracket(); break;
    case 'torneoSizeSelect': html = renderTorneoSizeSelect(); break;
    case 'futdraftModeSelect': html = renderFutDraftModeSelect(); break;
    case 'futdraftAffinitySelect': html = renderFutDraftAffinitySelect(); break;
    case 'futdraftFormationSelect': html = renderFutDraftFormationSelect(); break;
    case 'futdraftPick': html = renderFutDraftPick(); break;
    case 'futdraftTeam': html = renderFutDraftTeam(); break;
    case 'futdraftBracket': html = renderFutDraftBracket(); break;
    case 'futdraftLive': html = renderFutDraftLive(); break;
    case 'futdraftPenalty': html = renderFutDraftPenalty(); break;
    case 'futdraftMatchResult': html = renderFutDraftMatchResult(); break;
    case 'futdraftSummary': html = renderFutDraftSummary(); break;
    case 'futdraftVsSetup': html = renderFutDraftVsSetup(); break;
    case 'futdraftVsPick': html = renderFutDraftVsPick(); break;
    case 'futdraftVsPrep': html = renderFutDraftVsPrep(); break;
    case 'futdraftVsReady': html = renderFutDraftVsReady(); break;
    case 'futdraftVsLive': html = renderFutDraftVsLive(); break;
    case 'futdraftVsResult': html = renderFutDraftVsResult(); break;
    case 'ligaTierSelect': html = renderLigaTierSelect(); break;
    case 'ligaPoolSelect': html = renderLigaPoolSelect(); break;
    case 'ligaTable': html = renderLigaTable(); break;
    case 'ligaSummary': html = renderLigaSummary(); break;
    case 'worldTourSetup': html = renderWorldTourSetup(); break;
    case 'worldTourHome': html = renderWorldTourHome(); break;
    case 'worldTourDraft': html = renderWorldTourDraft(); break;
    case 'worldTourEvent': html = renderWorldTourEvent(); break;
    case 'worldTourLineup': html = renderWorldTourLineup(); break;
    case 'quickMatch': html = renderQuickMatch(); break;
    case 'joyMatch': html = renderJoyMatch(); break;
    case 'pkShootout': html = renderPkShootout(); break;
    case 'customTourney': html = renderCustomTourney(); break;
    case 'av4Prematch': html = renderAv4Prematch(); break;
    case 'av4Result': html = renderAv4Result(); break;
    default: html = renderMenu();
  }
  if (G.confirmLeaveOpen) html += renderConfirmLeaveModal();
  // racha del día antes que las novedades (una ventana cada vez)
  if (G.showLogin && G.screen === 'menu') html += renderLoginModal();
  else if (G.showPatchNotes) html += renderPatchNotesModal();
  if (G.playerCard) html += renderPlayerCardModal();
  if (G.teamCard) html += renderTeamCardModal();
  // Re-render de la misma pantalla (teclear, filtros, pestañas): sin repetir el fundido de entrada.
  // Solo se anima al cambiar de pantalla o de pestaña; acciones dentro de la misma vista (fichar, flechas, filtros) no repiten la animación.
  var viewKey = G.screen + '|' + G.tacTab + (G.screen === 'menu' && G.meta ? '|' + G.meta.menuTab : '');
  if (G.career && G.screen === 'careerMode') Object.keys(G.career).forEach(function (k) { if (/(Tab|Sub|View|tab)$/.test(k) && typeof G.career[k] === 'string') viewKey += '|' + k + ':' + G.career[k]; });
  var viewChanged = viewKey !== lastRenderedScreen;
  // Solo se vuelve arriba del todo al cambiar de pantalla o de pestaña
  // principal; al cambiar de submenú (Liga/Copa, Alineación/Plantilla...)
  // la página se queda donde estaba, a petición explícita.
  // Las pestañas del menú principal tampoco suben la página.
  var mainViewKey = G.screen + '|' + G.tacTab + (G.career && G.screen === 'careerMode' ? '|' + G.career.tab : '');
  var mainViewChanged = mainViewKey !== lastMainViewKey;
  lastMainViewKey = mainViewKey;
  appEl.classList.toggle('no-anim', !viewChanged || !!(G.meta && G.meta.reduceMotion));
  lastRenderedScreen = viewKey;
  appEl.innerHTML = html;
  // skin.css: la cabecera grande y el pie solo salen en el menú.
  document.body.setAttribute('data-screen', G.screen);
  if (typeof futDraftSyncDotsExpandAfterRender === 'function') futDraftSyncDotsExpandAfterRender();
  // Transición direccional entre pestañas hermanas (Jornada->Mi equipo desliza a la derecha,
  // el camino inverso a la izquierda), a petición explícita ("cambios profesionales al pasar
  // entre pantallas"); el resto de navegación se queda con el fundido de siempre.
  if (viewChanged && G.__navDir && !(G.meta && G.meta.reduceMotion)) {
    var screenEl = appEl.querySelector('.screen');
    if (screenEl) screenEl.classList.add(G.__navDir === 'back' ? 'nav-back' : 'nav-fwd');
  }
  G.__navDir = null;
  if (mainViewChanged && !(G.meta && G.meta.reduceMotion)) { try { window.scrollTo(0, 0); } catch (e) {} }
  if (typeof autoFoldPanels === 'function') autoFoldPanels(appEl);
  restoreFocusAfterRerender(focusInfo);
  // Confeti al aparecer una ventana de trofeo nueva (no en avisos con data-nofx).
  var trophyEl = appEl.querySelector('.jugador-trophy-card:not([data-nofx])');
  var trophyKey = trophyEl ? trophyEl.textContent : null;
  if (trophyKey && trophyKey !== window.__lastTrophyKey && typeof fxConfetti === 'function') {
    fxConfetti((G.careerTrophyPopup && G.careerTrophyPopup.fxTier) || 'big');
    if (typeof fxHaptic === 'function') fxHaptic('win');
  }
  window.__lastTrophyKey = trophyKey;
  if (G.screen === 'map') drawMapConnections();
  if (G.screen === 'worldTourHome' && typeof worldTourScrollMiniMap === 'function') worldTourScrollMiniMap();
  var howToEl = document.getElementById('como-jugar');
  if (howToEl) howToEl.hidden = G.screen !== 'menu';
  isRendering = false;
  if (pendingRerender) { pendingRerender = false; render(); }
}

// Menú principal organizado en secciones (Destacados / Competiciones / Retos
// / Colección / Próximamente) con tarjetas en vez de una lista larga de
// botones, a petición explícita ("organiza mucho mejor todo el menú
// principal, porque hay demasiados modos"). Cada tarjeta mantiene la misma
// acción de siempre.
// Selector común de cómo jugar un partido (Ver partido / Decidir / Simular /
// Saltar), a petición explícita ("mucho más estético... aplicable a todos los
// sitios donde están estos botones"). opts: { ver, decidir, simular, saltar }
// con el onclick de cada uno; los que falten no salen. Decidir pone
// G.decideNext antes de arrancar (ver decideConvertLive).
function matchModePickerHtml(opts) {
  function card(kind, icon, title, sub, onclick) {
    return '<button class="mm-card mm-' + kind + '" onclick="' + onclick + '">' +
      '<span class="mm-ico">' + icon + '</span>' +
      '<span class="mm-txt"><strong>' + title + '</strong><em>' + sub + '</em></span>' +
    '</button>';
  }
  var small = [];
  if (opts.decidir && !opts.ver) small.push(card('decidir', '🧠', 'Decidir', 'Tú eliges cada jugada', 'G.decideNext=true;' + opts.decidir));
  if (opts.simular) small.push(card('simular', '▶️', 'Simular', 'Minuto a minuto', opts.simular));
  if (opts.saltar) small.push(card('saltar', '⏭️', 'Saltar', 'Resultado al momento', opts.saltar));
  return '<div class="mm-picker">' +
    (opts.ver ? '<button class="mm-hero" onclick="' + opts.ver + '">' +
      '<span class="mm-hero-ico">⚽</span>' +
      '<span class="mm-txt"><strong>Jugar partido</strong><em>Con el dedo, como en la DS</em></span>' +
      '<span class="mm-hero-go">›</span>' +
    '</button>' : '') +
    (small.length ? '<div class="mm-row mm-row-' + small.length + '">' + small.join('') + '</div>' : '') +
  '</div>';
}
// Modos que se juegan menos: en una fila de chips debajo, para no abrumar con tarjetas.
function menuMoreHtml(list) {
  return '<div class="menu-more"><span class="menu-more-label">Más</span>' + list.map(function (m) {
    return '<button class="menu-more-chip" onclick="' + m[2] + '"><span aria-hidden="true">' + m[0] + '</span>' + m[1] + '</button>';
  }).join('') + '</div>';
}
function menuTile(icon, title, sub, onclick, cls, disabled) {
  return '<button class="menu-tile' + (cls ? ' ' + cls : '') + '"' + (disabled ? ' disabled' : ' onclick="' + onclick + '"') + '>' +
    '<span class="menu-tile-icon">' + icon + '</span>' +
    '<span class="menu-tile-title">' + title + '</span>' +
    '<span class="menu-tile-sub">' + sub + '</span>' +
  '</button>';
}
// Menú por pestañas, a petición explícita ("hay demasiados modos de juego
// en la pantalla inicial, agrúpalos... que parezca más profesional"): cada
// pestaña enseña solo su grupo de modos, con una cabecera que dice de qué
// va. La pestaña elegida se recuerda (G.meta.menuTab).
var MENU_TABS = [
  { id: 'inicio', name: 'Inicio', icon: '🏠', title: 'Modos principales', desc: 'Las experiencias más completas del juego.' },
  { id: 'partidos', name: 'Partidos', icon: '⚽', title: 'Partidos sueltos', desc: 'Juega tú, decide en cada jugada o mira el partido.' },
  { id: 'torneos', name: 'Torneos', icon: '🏆', title: 'Competiciones', desc: 'Ligas, cuadros y duelos contra un amigo.' },
  { id: 'retos', name: 'Retos', icon: '🔥', title: 'Retos', desc: 'Aventuras por mapa, oleadas y el reto del día.' },
  { id: 'coleccion', name: 'Colección', icon: '⭐', title: 'Colección', desc: 'Fichajes, personajes, escudos y tu perfil.' }
];
function menuTabTilesHtml(tab) {
  if (tab === 'partidos') return '<div class="menu-grid">' +
    menuTile('🎮', 'Juega tú', 'Joystick, pases y tiros', 'actionGoPlayMode(\'joy\')', 'menu-tile-hero menu-tile-new') +
    menuTile('🧠', 'Tú decides', 'Pasa, regatea, tira o roba', 'actionGoPlayMode(\'decide\')', 'menu-tile-hero menu-tile-new') +
    menuTile('⚡', 'Partido rápido', 'Elige dos equipos y mira el partido', 'actionGoQuickMatch()', 'menu-tile-wide') +
  '</div>' +
  menuMoreHtml([['🥅', '4 vs 4', 'actionGoQuickMatch(true)'], ['🎯', 'Penaltis', 'actionStartPenaltyMode()']]);
  if (tab === 'torneos') return '<div class="menu-grid">' +
    menuTile('🏟️', 'Liga', 'Temporada contra rivales', 'actionGoLigaTierSelect()', 'menu-tile-hero') +
    menuTile('🥇', 'Modo Torneo', 'Cuadro de eliminatorias', 'actionStartTournament()', 'menu-tile-hero') +
    menuTile('🏆', 'Torneo a medida', 'Tu equipo favorito, con tus fichajes', 'actionGoCustomTourney()') +
    menuTile('🤝', 'FutDraft 2 jugadores', 'Duelo en el mismo móvil', 'actionGoFutDraftVsSetup()') +
  '</div>';
  if (tab === 'retos') return '<div class="menu-grid">' +
    menuTile('📅', 'Modo Diario' + (G.meta.dailyLastDate === todayKey() ? ' ✓' : ''), 'Un reto nuevo cada día', 'actionStartDaily()', 'menu-tile-hero menu-tile-gold') +
    menuTile('🗺️', 'Aventura', 'Mapa con fichajes, eventos y jefes', 'actionStartRun()', 'menu-tile-hero') +
    menuTile('🛡️', 'Supervivencia', 'Aguanta el mayor número de oleadas', 'actionStartDraftMode(\'supervivencia\')', 'menu-tile-wide') +
  '</div>' +
  menuMoreHtml([['🧭', 'Aventura 4 vs 4', 'actionStartAventura4()']]);
  if (tab === 'coleccion') return '<div class="menu-grid">' +
    menuTile('🎰', 'Fichajes', 'Compra o prueba suerte', 'actionGoGacha()', 'menu-tile-hero menu-tile-gold') +
    menuTile('⭐', 'Mi Colección', 'Lo que has desbloqueado', 'actionGoMiColeccion()', 'menu-tile-hero') +
    menuTile('📖', 'Personajes', 'Todos los jugadores', 'actionGoColeccion()') +
    menuTile('🛡️', 'Equipos', 'Todos los equipos y escudos', 'actionGoColeccionEquipos()') +
    menuTile('⚡', 'Supertécnicas', 'Potencia, afinidad y vídeo', 'actionGoTechCatalog()', 'menu-tile-new') +
    menuTile('📊', 'Mi perfil', 'Tus estadísticas globales', 'actionGoProfile()') +
  '</div>';
  return '<div class="menu-grid">' +
    menuTile('🏆', 'Modo Carrera', 'Dirige tu club temporada a temporada', 'actionGoCareerMode()', 'menu-tile-hero menu-tile-gold') +
    menuTile('🌍', 'Modo Historia', 'Revive la historia de Inazuma', 'actionGoWorldTour()', 'menu-tile-hero') +
    menuTile('📋', 'FutDraft', 'Elige tu plantilla y compite', 'actionGoFutDraftModeSelect()', 'menu-tile-hero') +
    menuTile('🌟', 'Carrera de jugador', 'Tu futbolista: partido a partido o rápida', 'actionGoSoloHub()', 'menu-tile-hero menu-tile-new') +
  '</div>' +
  '<button class="menu-quick-strip" onclick="actionSetMenuTab(\'partidos\')"><span>🎮</span><span><strong>Nuevo: Juega tú y Tú decides</strong><em>Lleva tú el balón o decide cada jugada</em></span><span class="menu-quick-arrow">›</span></button>';
}
// "¿Por dónde empiezo?" (a petición explícita, en vez del "Cómo jugar" de
// la Aventura original, que ya no explicaba la app): 3 recomendaciones
// según lo que lleves jugado. Si tienes una carrera a medias, lo primero
// es seguirla; si eres nuevo, un partido corto para ver cómo va; el reto
// del día si no lo has hecho; y un modo largo para engancharte.
function menuStartGuideHtml() {
  var meta = G.meta;
  var played = 0;
  try { var pm = profileData().modes; Object.keys(pm).forEach(function (k) { played += pm[k].played || 0; }); } catch (e) {}
  var cands = [];
  var solo = null;
  try { solo = G.solo || JSON.parse(localStorage.getItem('inazumaTactilRoguelike_soloCareer') || 'null'); } catch (e) {}
  if (solo && solo.phase !== 'retired') cands.push({ icon: '🌟', tag: 'Continúa', title: 'Tu Carrera de jugador', why: escapeHtml(solo.nombre) + ' · ' + escapeHtml(solo.club) + ' · temporada ' + solo.season, go: 'actionGoSoloCareer()' });
  var slot = typeof careerLastSlot === 'function' ? careerLastSlot() : null;
  var sum = slot && typeof careerSlotSummary === 'function' ? careerSlotSummary(slot) : null;
  if (sum) cands.push({ icon: '🏆', tag: 'Continúa', title: 'Tu Modo Carrera', why: escapeHtml(sum.clubName) + ' · temporada ' + sum.season + ', jornada ' + sum.matchday, go: 'actionGoCareerMode()' });
  if (played < 3) cands.push({ icon: '🧠', tag: 'Empieza aquí', title: 'Tú decides', why: 'Un partido en el que eliges pasar, regatear, tirar o robar. La mejor forma de aprender cómo funciona todo.', go: 'actionGoPlayMode(\'decide\')' });
  if (meta.dailyLastDate !== todayKey()) cands.push({ icon: '📅', tag: 'Hoy', title: 'Reto del día', why: 'Un reto nuevo cada día, igual para todos. Unos minutos.', go: 'actionStartDaily()' });
  if (!solo) cands.push({ icon: '🌟', tag: 'Para engancharte', title: 'Carrera de jugador', why: 'Crea tu futbolista y tu cara, y juega Liga, Copa y Champions desde la cantera.', go: 'actionGoSoloHub()' });
  cands.push({ icon: '📋', tag: 'Sesión corta', title: 'FutDraft', why: 'Elige tu once entre jugadores al azar y gana el torneo.', go: 'actionGoFutDraftModeSelect()' });
  if (!sum) cands.push({ icon: '🏆', tag: 'Para largo', title: 'Modo Carrera', why: 'Dirige tu club: fichajes, liga, copas y ascensos.', go: 'actionGoCareerMode()' });
  cands.push({ icon: '⚡', tag: 'Rápido', title: 'Partido rápido', why: 'Elige dos equipos y mira el partido.', go: 'actionGoQuickMatch()' });
  var seen = {}, picks = [];
  cands.forEach(function (c) { if (picks.length < 3 && !seen[c.go]) { seen[c.go] = true; picks.push(c); } });
  return '<div class="start-guide">' +
    '<div class="start-guide-head"><h3>¿Por dónde empiezo?</h3><span>' + (played ? 'Según lo que llevas jugado' : 'Si es tu primera vez') + '</span></div>' +
    picks.map(function (c, i) {
      return '<button class="start-card" onclick="' + c.go + '"><span class="start-num">' + (i + 1) + '</span><span class="start-ico">' + c.icon + '</span>' +
        '<span class="start-txt"><em>' + c.tag + '</em><strong>' + c.title + '</strong><small>' + c.why + '</small></span><span class="start-go" aria-hidden="true">›</span></button>';
    }).join('') +
  '</div>';
}
window.actionSetMenuTab = function (tab) {
  G.meta.menuTab = tab;
  saveMeta(G.meta);
  render();
};
function renderMenu() {
  var m = G.meta;
  var tab = MENU_TABS.some(function (t) { return t.id === m.menuTab; }) ? m.menuTab : 'inicio';
  var info = MENU_TABS.find(function (t) { return t.id === tab; });
  return (
    '<div class="screen menu-screen">' +
      '<div class="menu-topbar">' +
        '<p class="currency-display" style="margin:0">' + spiritIcon() + ' ' + m.points + ' <span class="dim small">Puntos de Espíritu</span></p>' +
        '<div class="menu-top-actions">' +
          '<button class="menu-patch-btn' + (G.meta.lastSeenVersion !== APP_VERSION ? ' has-new' : '') + '" onclick="actionOpenPatchNotes()" aria-label="Parches y novedades" title="Parches y novedades"><span>&#128227;</span><em>Novedades</em></button>' +
          '<button class="menu-gear-btn' + (typeof backupNeedsReminder === 'function' && backupNeedsReminder() ? ' has-new' : '') + '" onclick="actionGoAjustes()" aria-label="Ajustes y copia de seguridad" title="Ajustes">⚙️</button>' +
        '</div>' +
      '</div>' +
      careerContinueCardHtml() +
      (typeof engageMenuStripHtml === 'function' ? engageMenuStripHtml() : '') +
      '<div class="menu-tabs" role="tablist">' + MENU_TABS.map(function (t) {
        return '<button role="tab" aria-selected="' + (t.id === tab) + '" class="menu-tab' + (t.id === tab ? ' on' : '') + '" onclick="actionSetMenuTab(\'' + t.id + '\')"><span class="menu-tab-icon">' + t.icon + '</span><span class="menu-tab-name">' + t.name + '</span></button>';
      }).join('') + '</div>' +
      (tab === 'inicio' ? menuStartGuideHtml() : '') +
      '<div class="menu-tab-head"><h2>' + info.title + '</h2><p>' + info.desc + '</p></div>' +
      menuTabTilesHtml(tab) +
      (tab === 'coleccion'
        ? '<div class="panel" style="margin-top:18px">' +
            '<h2 class="panel-title">La rueda elemental</h2>' +
            '<p class="dim small">Fuego vence a Bosque · Bosque vence a Viento · Viento vence a Montaña · Montaña vence a Fuego. Es la rueda de ventajas real de Inazuma Eleven.</p>' +
            '<div class="btn-row">' + TYPES.map(typeBadge).join('') + '</div>' +
            '<img src="https://inazumarun.es/assets/otros/Afinidades.webp" alt="Rueda de afinidades elementales" style="max-width:100%;margin-top:12px;border-radius:8px;">' +
          '</div>'
        : '') +
    '</div>'
  );
}

function spiritIcon() { return '<svg class="icon-inline" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L14.5 9 L22 9 L16 13.5 L18 21 L12 16.5 L6 21 L8 13.5 L2 9 L9.5 9 Z"/></svg>'; }

function hardModeUnlocked() {
  var meta = G.meta;
  var totalUnlocked = ROSTER.filter(function (p) { return !p.locked || meta.unlocked.indexOf(p.id) !== -1; }).length;
  return (meta.normalWins || 0) >= 3 && totalUnlocked > 10;
}

// Menú principal aplanado: antes "Jugar" pasaba por un hub intermedio
// (Modos clásicos / Otros modos, este último con Torneo/Supervivencia/
// Diario/Penaltis/FutDraft/Liga/Carrera escondidos detrás de un botón
// más) -- a petición explícita, ahora que FutDraft y Modo Carrera son
// los modos más jugados de largo, todo vive directo en el menú
// principal (renderMenu) sin ningún paso intermedio: "Jugar" salta
// derecho a elegir Normal/Difícil (actionStartRun), y el resto de modos
// son botones de primer nivel, con FutDraft/Carrera destacados arriba
// del todo por ser los más jugados.

function actionStartRun() { G.screen = 'modeSelect'; render(); }
function actionStartRunWithMode(mode) {
  if (mode === 'hard' && !hardModeUnlocked()) return;
  G.pendingSim4 = false;
  G.pendingRunMode = mode;
  G.pendingCaptainOffers = offerCaptains();
  G.screen = 'captainSelect';
  render();
}
function renderModeSelect() {
  var meta = G.meta;
  var unlocked = hardModeUnlocked();
  var totalUnlocked = ROSTER.filter(function (p) { return !p.locked || meta.unlocked.indexOf(p.id) !== -1; }).length;
  return (
    '<div class="screen">' +
      pageTopHtml('actionBackToMenu()', 'Elige el modo de juego', '🗺️') +
      '<div class="panel center-text page-intro">' +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-primary btn-block" onclick="actionStartRunWithMode(\'normal\')">Modo Normal</button>' +
        '</div>' +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-block" style="' + (unlocked ? 'background:#7a1212;color:#fff;' : '') + '" ' +
            (unlocked ? 'onclick="actionStartRunWithMode(\'hard\')"' : 'disabled') + '>' +
            'Modo Difícil' + (unlocked ? '' : ' 🔒') +
          '</button>' +
        '</div>' +
        (unlocked
          ? '<p class="dim small">Los rivales meten algún gol más y paran algo más. El mapa tiene 4 jefes en vez de 3 (el último, muy difícil), y en los eventos especiales puede aparecer un jefe por sorpresa.</p>'
          : '<p class="dim small">Se desbloquea ganando el Modo Normal 3 veces y teniendo más de 10 personajes desbloqueados. Progreso: ' + Math.min(meta.normalWins || 0, 3) + '/3 victorias' + ((meta.normalWins || 0) >= 3 ? ' ✓' : '') + ', ' + Math.min(totalUnlocked, 11) + '/11 personajes' + (totalUnlocked >= 11 ? ' ✓' : '') + '.</p>') +
        '<div class="engine-pick"><span>Partidos</span>' +
          '<button class="' + (!meta.classicCombat ? 'on' : '') + '" onclick="actionSetClassicCombat(false)">⚽ En vivo · Tú decides</button>' +
          '<button class="' + (meta.classicCombat ? 'on' : '') + '" onclick="actionSetClassicCombat(true)">⚔️ Por turnos</button></div>' +
        '<p class="dim small">Tiro y Regate (por turnos): puedes encadenar regates en el mismo turno. Cada uno sube tu probabilidad de gol (cada vez menos, según tu Regate) y la de perder el balón (cada vez más), hasta que decides tirar o te lo roban. Defensa y Especial funcionan igual que siempre.</p>' +
      '</div>' +
    '</div>'
  );
}
function actionGoColeccion() { G.screen = 'coleccion'; render(); }
function actionGoColeccionEquipos() { G.screen = 'coleccionEquipos'; render(); }
function actionGoMiColeccion() { G.screen = 'miColeccion'; render(); }

function actionEquipShield(name) {
  var meta = G.meta;
  if ((meta.unlockedShields || []).indexOf(name) === -1) return;
  meta.equippedShield = name;
  saveMeta(meta);
  render();
}
function actionUnequipShield() {
  var meta = G.meta;
  meta.equippedShield = null;
  saveMeta(meta);
  render();
}

// "Mi Colección": los personajes ya se ven completos en "Colección de
// personajes" (que además permite comprarlos directamente ahí, ver
// renderColeccion), así que meterlos aquí también era pura redundancia --
// esta pantalla se queda solo con lo que no vive en ningún otro sitio: el
// acceso a Vestuario y los escudos ganados en la Máquina de Premios (ver
// 15b-bis), con opción de equipar uno como tu escudo en partidos/marcadores.
function renderMiColeccion() {
  var meta = G.meta;
  var myShields = meta.unlockedShields || [];

  var defaultEquipped = !meta.equippedShield;
  var shieldsHtml =
    '<div class="shop-item" style="' + (defaultEquipped ? 'background:rgba(255,255,255,.06);' : '') + '">' +
      '<img class="team-shield-inline" src="' + PLAYER_SHIELD + '" alt="">' +
      '<div style="flex:1"><strong>Escudo por defecto</strong></div>' +
      '<div class="cost">' + (defaultEquipped ? '<span class="pill">Equipado</span>' : '<button class="btn btn-outline" onclick="actionUnequipShield()">Equipar</button>') + '</div>' +
    '</div>' +
    myShields.map(function (name) {
      var equipped = meta.equippedShield === name;
      return (
        '<div class="shop-item" style="' + (equipped ? 'background:rgba(255,255,255,.06);' : '') + '">' +
          '<img class="team-shield-inline" src="' + escapeHtml(teamShieldPath(name)) + '" alt="">' +
          '<div style="flex:1"><strong>' + escapeHtml(name) + '</strong></div>' +
          '<div class="cost">' + (equipped ? '<span class="pill">Equipado</span>' : '<button class="btn btn-outline" onclick="actionEquipShield(\'' + escapeHtml(name).replace(/'/g, "\\'") + '\')">Equipar</button>') + '</div>' +
        '</div>'
      );
    }).join('');

  return (
    '<div class="screen">' +
      pageTopHtml('actionBackToMenu()', 'Mi Colección', '⭐') +
      '<div class="panel center-text page-intro">' +
        '<p class="dim small">Tus personajes desbloqueados se ven en Colección de personajes. Para conseguir más (comprar uno concreto o al azar), ve a Fichajes. Aquí está el resto: tus escudos.</p>' +
        '<button class="btn btn-block" onclick="actionGoGacha()">Fichajes</button>' +
      '</div>' +
      '<div class="panel"><h3 style="margin-bottom:8px">Mis escudos (' + myShields.length + ')</h3><p class="dim small">Elige el que se muestra como el tuyo en partidos y marcadores.</p></div>' +
      shieldsHtml +
    '</div>'
  );
}

function renderColeccionEquipos() {
  var f = G.equiposFilter = Object.assign({ q: '', kind: null, sort: 'fuerza' }, G.equiposFilter || {});
  var q = searchNorm(f.q);
  var list = RIVAL_TEAM_NAMES.map(function (n) { return { name: n, boss: false }; }).concat(RIVAL_TEAM_BOSSES.map(function (n) { return { name: n, boss: true }; }));
  var filtered = list.filter(function (t) {
    if (f.kind === 'normal' && t.boss) return false;
    if (f.kind === 'jefe' && !t.boss) return false;
    return !q || searchNorm(t.name).indexOf(q) !== -1;
  });
  filtered.forEach(function (t) { t.power = qmPower(t.name); t.count = teamMembers(t.name).length; });
  filtered.sort(f.sort === 'nombre' ? function (a, b) { return a.name.localeCompare(b.name); } : function (a, b) { return b.power - a.power || a.name.localeCompare(b.name); });
  var items = filtered.map(function (t) {
    return '<button class="team-row" onclick="actionOpenTeamCard(\'' + escapeHtml(t.name).replace(/'/g, '') + '\')">' +
      '<img src="' + escapeHtml(teamShieldPath(t.name)) + '" alt="" loading="lazy">' +
      '<div class="col-txt"><strong>' + escapeHtml(t.name) + '</strong><span>' + (t.count ? t.count + ' jugadores' : 'Equipo rival') + '</span></div>' +
      (t.boss ? '<span class="pill">👑 Jefe</span>' : '') +
      '<span class="col-media" style="background:' + mediaBadgeColor(t.power) + '">' + t.power + '</span>' +
    '</button>';
  }).join('');
  return (
    '<div class="screen">' +
      pageTopHtml('actionBackToMenu()', 'Equipos', '🛡️') +
      '<div class="panel filter-panel">' +
        searchBoxHtml('eqQ', f.q, 'Busca un equipo', 'equiposFilterChange(\'q\', this.value)', filtered.length) +
        filterChipsHtml([{ id: null, label: 'Todos <em class="chip-count">' + list.length + '</em>' }, { id: 'normal', label: 'Normales' }, { id: 'jefe', label: '👑 Jefes' }], f.kind, 'equiposFilterChange(\'kind\', %)') +
        '<div class="filter-sort"><span>Ordenar</span>' + filterChipsHtml([{ id: 'fuerza', label: 'Fuerza' }, { id: 'nombre', label: 'A-Z' }], f.sort, 'equiposFilterChange(\'sort\', %)') + '</div>' +
      '</div>' +
      (items ? '<div class="col-list">' + items + '</div>' : '<div class="panel center-text"><p class="dim">Ningún equipo coincide.</p></div>') +
    '</div>'
  );
}
function equiposFilterChange(k, v) { G.equiposFilter = G.equiposFilter || {}; G.equiposFilter[k] = v; render(); }

// Búsqueda sin tildes ni mayúsculas ("fenix" encuentra "Fénix").
function searchNorm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
// Caja de búsqueda común (conserva foco y cursor al repintar, ver
// captureFocusForRerender): onInput recibe el texto en this.value.
function searchBoxHtml(key, value, placeholder, onInput, count) {
  return '<label class="search-box"><span aria-hidden="true">🔍</span>' +
    '<input type="search" data-focus-key="' + key + '" value="' + escapeHtml(value || '') + '" placeholder="' + escapeHtml(placeholder) + '" oninput="' + onInput + '" autocomplete="off" spellcheck="false">' +
    (count != null ? '<em>' + count + '</em>' : '') + '</label>';
}
function filterChipsHtml(list, current, onPick) {
  return '<div class="filter-chips">' + list.map(function (o) {
    return '<button class="filter-chip' + (current === o.id ? ' on' : '') + '" onclick="' + onPick.replace('%', o.id === null ? 'null' : '\'' + o.id + '\'') + '">' + o.label + '</button>';
  }).join('') + '</div>';
}

// Colección de personajes, a petición explícita ("buscador y filtros en
// Personajes, Partido rápido y Equipos"): búsqueda por nombre, nombre
// original, equipo o supertécnica; filtros de elemento y posición; ver
// solo los tuyos o todos (los bloqueados salen con candado); y orden.
var COLECCION_PAGE = 60;
function renderColeccion() {
  var meta = G.meta;
  var f = G.coleccionFilter = Object.assign({ tipo: null, posicion: null, q: '', sort: 'media', mine: true, limit: COLECCION_PAGE }, G.coleccionFilter || {});
  var isUnlocked = function (c) { return !c.locked || meta.unlocked.indexOf(c.id) !== -1; };
  var myCount = ROSTER.filter(isUnlocked).length;
  var q = searchNorm(f.q);
  var filtered = ROSTER.filter(function (c) {
    if (f.mine && !isUnlocked(c)) return false;
    if (f.tipo && c.tipo !== f.tipo) return false;
    if (f.posicion && c.posicion !== f.posicion) return false;
    if (q) {
      var hay = searchNorm([c.nombre, c.original, c.equipo].concat(c.equiposExtra || [], c.hissatsu || []).join(' '));
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
  var score = {};
  filtered.forEach(function (c) { score[c.id] = Math.round(futDraftPlayerScore(c)); });
  filtered.sort(f.sort === 'nombre' ? function (a, b) { return a.nombre.localeCompare(b.nombre); }
    : f.sort === 'equipo' ? function (a, b) { return String(a.equipo).localeCompare(String(b.equipo)) || score[b.id] - score[a.id]; }
    : function (a, b) { return score[b.id] - score[a.id]; });
  var shown = filtered.slice(0, f.limit);
  var items = shown.map(function (c) {
    var locked = !isUnlocked(c);
    var techs = (c.hissatsu || []).slice(0, 2).map(escapeHtml).join(' · ');
    return '<div class="col-row' + (locked ? ' locked' : '') + '">' +
      '<span class="col-media" style="background:' + mediaBadgeColor(score[c.id]) + '">' + score[c.id] + '</span>' +
      avatarHtml(c) +
      '<div class="col-txt"><strong>' + escapeHtml(c.nombre) + (locked ? ' 🔒' : '') + '</strong>' +
        '<span>' + escapeHtml(c.posicion) + (c.equipo ? ' · ' + escapeHtml(c.equipo) : '') + '</span>' +
        (techs ? '<em>' + techs + '</em>' : '') + '</div>' +
      typeBadge(c.tipo) +
    '</div>';
  }).join('');
  var all = { id: null, label: 'Todos' };
  return (
    '<div class="screen">' +
      pageTopHtml('actionBackToMenu()', 'Personajes', '📖') +
      '<div class="panel filter-panel">' +
        searchBoxHtml('colQ', f.q, 'Nombre, equipo o supertécnica', 'coleccionFilterChange(\'q\', this.value)', filtered.length) +
        filterChipsHtml([{ id: 'mine', label: '⭐ Míos <em class="chip-count">' + myCount + '</em>' }, { id: 'all', label: '📖 Todos <em class="chip-count">' + ROSTER.length + '</em>' }], f.mine ? 'mine' : 'all', 'coleccionFilterChange(\'mine\', %)') +
        filterChipsHtml([all].concat(TYPES.map(function (t) { return { id: t, label: t }; })), f.tipo, 'coleccionFilterChange(\'tipo\', %)') +
        filterChipsHtml([all].concat(POSITIONS.map(function (t) { return { id: t, label: t }; })), f.posicion, 'coleccionFilterChange(\'posicion\', %)') +
        '<div class="filter-sort"><span>Ordenar</span>' + filterChipsHtml([{ id: 'media', label: 'Media' }, { id: 'nombre', label: 'A-Z' }, { id: 'equipo', label: 'Equipo' }], f.sort, 'coleccionFilterChange(\'sort\', %)') + '</div>' +
        (f.mine && myCount < ROSTER.length ? '<p class="dim small">¿Quieres desbloquear más? Ve a <a href="#" onclick="actionGoGacha();return false">Fichajes</a>.</p>' : '') +
      '</div>' +
      (items ? '<div class="col-list">' + items + '</div>' : '<div class="panel center-text"><p class="dim">Nadie coincide con la búsqueda.</p></div>') +
      (filtered.length > shown.length ? '<button class="btn btn-outline btn-block" onclick="coleccionFilterChange(\'limit\', ' + (f.limit + COLECCION_PAGE) + ')">Mostrar más <span class="btn-cost">' + (filtered.length - shown.length) + '</span></button>' : '') +
    '</div>'
  );
}
function coleccionFilterChange(filterType, value) {
  var f = G.coleccionFilter = G.coleccionFilter || {};
  if (filterType === 'mine') value = value === 'mine';
  f[filterType] = value;
  if (filterType !== 'limit') f.limit = COLECCION_PAGE;
  render();
}
// Confirmación genérica antes de salir de un modo con progreso en curso,
// a petición explícita ("el volver siempre con confirmación en
// cualquier modo... preguntar si has guardado"). Antes era un
// window.confirm() nativo -- imposible de dar estilo, así que ahora es
// un modal propio (renderConfirmLeaveModal, pintado encima de lo que
// sea que haya en pantalla, ver el final de render()), a petición
// explícita ("tratamiento tipo tarjeta/insignia... se leería más rápido
// que texto corrido"). Como el modal es asíncrono (hay que esperar a que
// el usuario pulse un botón), requestConfirmLeave no puede devolver
// true/false al momento como el confirm() de antes -- en vez de eso
// guarda el NOMBRE de la función a llamar si confirman (G.pendingLeaveFn,
// buscada luego en window[...]) y solo pinta el modal. Solo se usa en
// botones que de verdad abandonan el modo (no en "Cancelar" de un
// diálogo suelto, que no pierde nada).
function requestConfirmLeave(fnName) {
  G.pendingLeaveFn = fnName;
  G.confirmLeaveOpen = true;
  render();
}
function actionConfirmLeaveYes() {
  var fn = G.pendingLeaveFn;
  G.pendingLeaveFn = null;
  G.confirmLeaveOpen = false;
  if (fn && typeof window[fn] === 'function') window[fn]();
  else render();
}
function actionConfirmLeaveNo() {
  G.pendingLeaveFn = null;
  G.confirmLeaveOpen = false;
  render();
}
function renderConfirmLeaveModal() {
  return (
    '<div class="modal-overlay">' +
      '<div class="modal-card center-text">' +
        '<div class="modal-icon">🚪</div>' +
        '<h3 style="margin-bottom:4px">¿Seguro que quieres salir?</h3>' +
        '<p class="dim small">Si no has guardado, perderás el progreso.</p>' +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-outline" onclick="actionConfirmLeaveNo()">Cancelar</button>' +
          '<button class="btn btn-danger" onclick="actionConfirmLeaveYes()">Salir sin guardar</button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}
// actionBackToMenu es el punto de entrada de ~18 botones "Volver" por
// toda la app (todos los modos MENOS Carrera). Volvió a navegar directo,
// sin pedir confirmación -- a petición explícita ("por qué pone en
// todos los volver salir sin guardar? eso solo tiene que ser para el
// modo carrera"): el aviso de "vas a perder el progreso" solo tiene
// sentido donde de verdad se puede perder algo guardable a mano (Modo
// Carrera, ver actionCareerBackToMenu en career-mode.js) -- el resto de
// modos (clásicos, FutDraft, Liga, Torneo, Modo Jugador...) no tienen
// nada que guardar de esa forma, así que preguntar ahí solo estorbaba.
function actionBackToMenu() {
  doBackToMenuNow();
}
function doBackToMenuNow() {
  G.shieldOverrides = null;
  G.screen = 'menu';
  render();
}

function renderCaptainSelect() {
  var cards = G.pendingCaptainOffers.map(function (c) {
    return playerCardHtml(c, 'selectCaptain(\'' + c.instanceId + '\')', false, false);
  }).join('');
  return (
    '<div class="screen">' +
      '<div class="panel">' +
        '<h2 class="panel-title">Elige a tu capitán</h2>' +
        '<p class="dim small">Este jugador iniciará tu plantilla. Podrás fichar hasta 3 compañeros más durante la partida.</p>' +
      '</div>' +
      '<div class="card-grid">' + cards + '</div>' +
    '</div>'
  );
}

function selectCaptain(instanceId) {
  var captain = G.pendingCaptainOffers.find(function (c) { return c.instanceId === instanceId; });
  newRun(G.pendingRunMode);
  G.run.sim4 = !!G.pendingSim4;
  if (G.run.sim4) av4ForceOpeningRecruits(G.run.map);
  G.run.squad.push(captain);
  G.screen = 'map';
  render();
}

// Color de la "media" (ver playerCardHtml): por debajo de 70 en naranja
// (floja), 70-75 amarillo, 75-80 verde clarito, y por encima de 80 sube de
// tono PROGRESIVAMENTE (verde cada vez más intenso/azulado) para que una
// plantilla de estrellas destaque de un vistazo frente a una simplemente
// "buena" -- no es un salto brusco más, es un degradado continuo.
function mediaBadgeColor(score) {
  if (score < 70) return 'hsl(28, 88%, 50%)';
  if (score < 75) return 'hsl(48, 88%, 50%)';
  if (score < 80) return 'hsl(95, 55%, 55%)';
  var t = clamp((score - 80) / 19, 0, 1);
  var hue = 100 + t * 60;   // 100 (verde) -> 160 (verde azulado)
  var sat = 60 + t * 25;    // 60% -> 85%
  var light = 45 - t * 10;  // 45% -> 35% (mas intenso/oscuro = mas "premium")
  return 'hsl(' + Math.round(hue) + ', ' + Math.round(sat) + '%, ' + Math.round(light) + '%)';
}

// showMedia: solo se pide en las tarjetas de un PICK de draft (FutDraft y
// Liga, que reutiliza el mismo motor de draft -- ver generateFutDraftOptions/
// pickFutDraftPlayer) para ayudar a decidir de un vistazo sin tener que leer
// las 4 barras de stats una a una. Es la misma media ponderada por posición
// que ya se usa para la puntuación de equipo (ver futDraftPlayerScore), así
// que el número no es nuevo, solo se hace visible en la tarjeta. El resto de
// tarjetas (plantel, capitán, ataque...) se quedan igual que siempre.
function playerCardHtml(p, onclickAttr, selected, disabled, showMedia) {
  var mediaScore = showMedia ? Math.round(futDraftPlayerScore(p)) : null;
  // Borde brillante y girando para los cracks del draft (85 de media o más), a petición
  // explícita: un envoltorio con el anillo de color que gira, y la tarjeta gira al revés
  // dentro para que su contenido se quede quieto (truco sin máscaras, fiable en cualquier navegador).
  var elite = mediaScore !== null && mediaScore >= 85;
  var cls = 'player-card' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + (p.fatigado ? ' fatigued' : '') + (elite ? ' player-card-elite' : '');
  var attr = disabled ? '' : ' onclick="' + onclickAttr + '"';
  var techs = playerTechs(p);
  var hissatsuHtml = techs.length ? '<div class="hissatsu-tag">' + techs.map(escapeHtml).join(' · ') + '</div>' : '';
  var origHtml = p.original ? '<span class="player-original">(' + escapeHtml(p.original) + ')</span>' : '';
  var mediaHtml = showMedia
    ? '<span class="media-badge" style="background:' + mediaBadgeColor(mediaScore) + '" title="Media según su posición">' + mediaScore + '</span>'
    : '';
  var accentVar = { Fuego: '--fuego', Bosque: '--bosque', Viento: '--viento', Montaña: '--montana' }[p.tipo] || '--border';
  var accentStyle = 'border-left:5px solid var(' + accentVar + ');background-image:radial-gradient(circle at 0% 0%, color-mix(in srgb, var(' + accentVar + ') 20%, transparent), transparent 65%);';
  var card =
    '<div class="' + cls + '"' + attr + ' style="' + accentStyle + '">' +
      '<div class="player-card-head">' +
        avatarHtml(p) +
        '<div class="player-head-text">' +
          '<span class="player-name">' + escapeHtml(p.nombre) + '</span>' + origHtml +
        '</div>' +
        typeBadge(p.tipo) +
        mediaHtml +
      '</div>' +
      statBarsHtml(p) +
      hissatsuHtml +
      (p.fatigado ? '<div class="fatigue-tag">Fatigado (-10 a todo)</div>' : '') +
    '</div>';
  return elite ? '<div class="player-card-elite-wrap">' + card + '</div>' : card;
}

function statBarsHtml(p) {
  var stats = [['Tiro', 'tiro', p.tiro], ['Regate', 'pase', p.pase], ['Defensa', 'defensa', p.defensa], ['Especial', 'especial', p.especial]];
  var boosted = p.boostedStats || [];
  var reduced = p.reducedStats || [];
  return '<div class="stat-bars">' + stats.map(function (s) {
    var label = s[0], key = s[1], value = s[2];
    // Sin techo de 99: una stat que lo supera (por entrenamiento/bonus) se
    // queda en verde -- antes se ponía en blanco al llegar justo a 99, lo
    // que además ocultaba que siguiera subiendo por encima.
    var isBoosted = boosted.indexOf(key) !== -1 || value > 99;
    var isReduced = reduced.indexOf(key) !== -1;
    var valueColor = isBoosted ? 'color:#7cfc00;font-weight:bold;' : (isReduced ? 'color:#ff5c5c;font-weight:bold;' : '');
    var barStyle = isBoosted ? 'background:#7cfc00;' : (isReduced ? 'background:#ff5c5c;' : '');
    return '<span class="stat-label">' + label + '</span>' +
      '<span class="stat-bar-track"><span class="stat-bar-fill" style="width:' + clamp(value, 0, 100) + '%;' + barStyle + '"></span></span>' +
      '<span class="stat-value" style="' + valueColor + '">' + value + '</span>';
  }).join('') + '</div>';
}

