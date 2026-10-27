/* ---------------------------------------------------------------------
   17. SONIDOS, VERSIÓN/PARCHES Y AUTOGUARDADO DE MODO CARRERA
   A petición explícita: sonido de gol y de inicio de partido (sintetizados
   con Web Audio, sin depender de ningún archivo externo), un aviso de
   "Parches" que se enseña al cargar la página con lo último que se ha
   metido (se guarda la última versión vista en localStorage para no
   repetirlo cada vez), y el autoguardado de Modo Carrera (cada 3
   minutos, solo si está activado en Configuración).
   --------------------------------------------------------------------- */

// Sube este número (y añade una entrada arriba de APP_PATCH_NOTES) EN CADA
// SUBIDA A GITHUB, a petición explícita ("en cada subida a github,
// actualiza la version del parche"). Las notas se enseñan solo la
// versión más reciente (ver renderPatchNotesModal) -- lista corta, con
// los cambios más relevantes para quien juega, no un registro técnico
// completo (eso vive en el historial de git), a petición explícita
// ("acota la información, ahora mismo es demasiado grande").
var APP_VERSION = '1.1.0';
// "summary" (a petición explícita, "da info mas general de los parches"):
// una frase corta y general por versión, tipo titular ("Mejora visual de
// Ver partido"), no el detalle técnico. Se usa en la lista plegable de
// "Versiones anteriores" del aviso (ver renderPatchNotesModal) -- así no
// se pierde el resumen de rondas pasadas aunque solo se enseñen los
// "items" detallados de la última, a petición explícita ("guarda resumen
// de los parches anteriores").
var APP_PATCH_NOTES = [
  {
    version: '1.1.0',
    summary: 'Partidos mucho más reales: balón con física, balón parado, faltas y fuera de juego',
    items: [
      'El balón rueda, vuela y bota. Los pases largos o con rivales en medio van por alto y cualquiera que esté cerca puede cortarlos.',
      'Saques de banda, córners, saques de puerta, faltas con barrera y penaltis. Tú eliges a quién sacar.',
      'Las entradas pueden ser falta, con tarjetas amarillas y rojas. Y hay fuera de juego: la línea amarilla te marca al penúltimo defensor.',
      'Los jugadores aceleran, frenan y se cansan. La barra verde es el aire y se recupera en el descanso.',
      'Los defensas ya no se quedan quietos: presionan de dos en dos, marcan al hombre, cubren y la línea sube y baja con el balón.',
      'Los delanteros piden el balón al espacio (nombre en verde) y el rival juega con más cabeza: conduce, combina, centra desde la banda y tira.',
      'Los tiros pueden ir fuera, chocar con un defensa, ser blocados o despejados con rechace. El portero se tira de verdad.',
      'Estadio con vallas, público y red que se mueve con el gol, narración de cada jugada y estadísticas en el descanso.'
    ]
  },
  {
    version: '1.0.0',
    summary: 'Inazuma Táctil: los partidos se juegan con el dedo, como en la DS',
    items: [
      'Todo el juego de Inazuma Run, con los partidos nuevos: campo en vertical y tus jugadores se mueven con el dedo.',
      'Desliza desde un jugador para dibujarle el camino. Con balón, toca a un compañero para pasar, un hueco para pasar al espacio o la portería para tirar.',
      'Duelos al chocar con un rival: Regate, Cuerpo, Entrada o Bloqueo, o una supertécnica si tienes PT. El elemento de la técnica cuenta.',
      'En los tiros eliges tiro normal o supertécnica, y en los del rival, cómo para tu portero. Con su vídeo cuando lo hay.',
      'Vale para Carrera, Historia, Liga, Torneo, FutDraft, Partido rápido y los retos. Lo que juegas es el resultado.'
    ]
  }
];

// ===== Sonidos (Web Audio, sin archivos) =====
var _audioCtx = null;
function soundCtx() {
  if (typeof window === 'undefined') return null;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!_audioCtx) { try { _audioCtx = new AC(); } catch (e) { return null; } }
  if (_audioCtx.state === 'suspended') { try { _audioCtx.resume(); } catch (e) {} }
  return _audioCtx;
}
function soundEnabled() { return !G.meta || G.meta.soundEnabled !== false; }
// Nota corta con envolvente simple (ataque rápido, caída exponencial).
function playTone(freq, startAt, duration, type, gain) {
  var ctx = soundCtx();
  if (!ctx) return;
  var osc = ctx.createOscillator();
  var g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  var t0 = ctx.currentTime + (startAt || 0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain || 0.2, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + duration + 0.05);
}
// Fanfarria ascendente de 4 notas -- el "sonido de gol".
window.playGoalSound = function () {
  if (typeof fxHaptic === 'function') fxHaptic('goal');
  if (!soundEnabled()) return;
  [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { playTone(f, i * 0.09, 0.35, 'triangle', 0.22); });
};
// Silbato descendente corto -- el "sonido de inicio de partido".
window.playKickoffSound = function () {
  if (!soundEnabled()) return;
  var ctx = soundCtx();
  if (!ctx) return;
  var osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = 'square';
  var t0 = ctx.currentTime;
  osc.frequency.setValueAtTime(1800, t0);
  osc.frequency.exponentialRampToValueAtTime(900, t0 + 0.35);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.15, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + 0.45);
};
window.actionToggleSound = function () {
  G.meta.soundEnabled = !soundEnabled();
  saveMeta(G.meta);
  if (typeof feelAudioSession === 'function') feelAudioSession();
  if (G.meta.soundEnabled) playKickoffSound();
  render();
};

// ===== Aviso de "Parches" al cargar =====
window.actionOpenPatchNotes = function () { G.showPatchNotes = true; render(); };
// Solo se enseña la versión más reciente -- antes se acumulaban también
// las 2 versiones anteriores enteras y el aviso se hacía enorme, a
// petición explícita ("acota la información, ahora mismo es demasiado
// grande"). Quien quiera ver versiones más antiguas puede mirar el
// historial de git; este aviso es solo "qué ha cambiado desde la última
// vez que jugaste".
window.actionTogglePatchOlder = function () {
  G.patchOlderOpen = !G.patchOlderOpen;
  render();
};
// Versiones anteriores: una línea general por versión (su "summary"), no
// el detalle técnico -- a petición explícita ("guarda resumen de los
// parches anteriores, y da info mas general de los parches"). Plegado por
// defecto para no alargar el aviso.
function patchOlderListHtml() {
  var older = APP_PATCH_NOTES.slice(1);
  if (!older.length) return '';
  var open = !!G.patchOlderOpen;
  var rows = older.map(function (n) {
    return '<div class="pcard-row"><span>' + escapeHtml(n.version) + '</span><strong>' + escapeHtml(n.summary || n.items[0]) + '</strong></div>';
  }).join('');
  return '<button class="btn btn-outline btn-block mt" onclick="actionTogglePatchOlder()">' + (open ? 'Ocultar' : 'Ver') + ' versiones anteriores</button>' +
    (open ? '<div class="pcard-rows mt" style="text-align:left">' + rows + '</div>' : '');
}
function renderPatchNotesModal() {
  var latest = APP_PATCH_NOTES[0];
  return '<div class="modal-overlay" onclick="actionDismissPatchNotes()">' +
    '<div class="jugador-trophy-card" data-nofx="1" onclick="event.stopPropagation()" style="max-width:340px;max-height:80vh;overflow-y:auto">' +
      '<div class="jugador-trophy-icon">📣</div>' +
      '<h3 style="margin-bottom:4px">Versión ' + escapeHtml(APP_VERSION) + '</h3>' +
      '<p class="dim small" style="margin-bottom:6px">' + escapeHtml(latest.summary || '') + '</p>' +
      '<ul class="dim small" style="text-align:left;padding-left:18px;margin:0 0 8px">' +
        latest.items.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') +
      '</ul>' +
      patchOlderListHtml() +
      '<button class="btn btn-primary btn-block mt" onclick="actionDismissPatchNotes()">Aceptar</button>' +
    '</div>' +
  '</div>';
}
window.actionDismissPatchNotes = function () {
  G.showPatchNotes = false;
  G.meta.lastSeenVersion = APP_VERSION;
  saveMeta(G.meta);
  render();
};

// ===== Autoguardado de Modo Carrera =====
// Cada 3 minutos, si está activado en Configuración (c.autosave, se
// serializa con la partida) y hay una partida de Carrera con hueco
// activo, la guarda sola en su hueco -- sin sustituir al botón
// "Guardar" manual, que sigue funcionando igual.
var CAREER_AUTOSAVE_MS = 3 * 60 * 1000;
window.actionToggleCareerAutosave = function () {
  var c = G.career;
  if (!c) return;
  c.autosave = !c.autosave;
  render();
};
setInterval(function () {
  var c = G.career;
  if (c && c.autosave && G.careerActiveSlot && !c.fired) {
    var ok = saveCareerToSlot(G.careerActiveSlot);
    if (ok) { c.autosaveMessage = 'Autoguardado a las ' + new Date().toLocaleTimeString(); if (G.screen === 'careerMode' && c.tab === 'configuracion') render(); }
  }
}, CAREER_AUTOSAVE_MS);
