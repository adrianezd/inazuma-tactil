/* ---------------------------------------------------------------------
   SENSACIÓN DE MÓVIL: vibración corta y sonidos suaves de interfaz.
   - Al tocar cualquier botón: un toque de vibración y un "tic" (más
     alegre en los botones principales).
   - Al marcar un gol y al lanzar una supertécnica: vibración más larga
     (fxHaptic('goal') / fxHaptic('tech'), llamadas desde los motores).
   Interruptores en Ajustes (G.meta.haptics y G.meta.uiSounds, activados
   por defecto). Los sonidos de interfaz además respetan el Sonido general.
   Va después de sound-version.js (usa soundCtx y soundEnabled).

   Por qué así (no se oía ni vibraba en el móvil):
   - Los navegadores solo dejan sonar y vibrar dentro de un gesto "de
     verdad": el click (al levantar el dedo), no el pointerdown del toque.
     Por eso se escucha 'click' en fase de captura, antes de que el
     onclick del botón repinte la pantalla.
   - El primer toque desbloquea el audio (resume + un sonido mudo), así
     los goles, que no vienen de un toque, ya suenan.
   - iPhone: Safari no tiene navigator.vibrate. Desde iOS 18, pulsar un
     interruptor <input type="checkbox" switch> da un toque háptico del
     sistema: se usa uno oculto, solo dentro de un toque. Y el audio web
     se calla con el interruptor de silencio del iPhone: con
     navigator.audioSession.type = 'playback' suena igual (si quitas el
     Sonido en Ajustes, vuelve a 'ambient' y no corta tu música).
   --------------------------------------------------------------------- */
var FEEL_PATTERNS = { tap: 10, primary: 18, tab: 8, goal: [40, 50, 90], tech: [18, 30, 40], win: [30, 40, 30, 40, 120], error: [60, 40, 60] };
function hapticsEnabled() { return !G.meta || G.meta.haptics !== false; }
function uiSoundsEnabled() { return soundEnabled() && (!G.meta || G.meta.uiSounds !== false); }
function canVibrate() { return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'; }
// iPhone con iOS 18 o más: interruptor nativo que da un toque háptico al pulsarlo.
var _feelIosSwitch = null;
function feelIsIos() { return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function canHaptic() { return canVibrate() || feelIsIos(); }
function feelIosTick() {
  try {
    if (!_feelIosSwitch) {
      var label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.setAttribute('data-nofeel', '1');
      label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
      _feelIosSwitch = label;
    }
    _feelIosSwitch.click();
  } catch (e) {}
}
var _feelInGesture = false;
function fxHaptic(kind) {
  if (!hapticsEnabled()) return;
  if (canVibrate()) { try { navigator.vibrate(FEEL_PATTERNS[kind] || FEEL_PATTERNS.tap); } catch (e) {} return; }
  // En iPhone solo funciona dentro de un toque (goles y técnicas sueltos no vibran).
  if (feelIsIos() && _feelInGesture) feelIosTick();
}
// Sesión de audio de iPhone: 'playback' suena aunque el móvil esté en silencio.
function feelAudioSession() {
  try { if (navigator.audioSession) navigator.audioSession.type = soundEnabled() ? 'playback' : 'ambient'; } catch (e) {}
}
// Desbloqueo del audio en el primer toque: reanuda el contexto y suena un búfer mudo.
var _feelUnlocked = false;
function feelUnlockAudio() {
  feelAudioSession();
  var ctx = soundCtx();
  if (!ctx) return;
  if (_feelUnlocked && ctx.state === 'running') return;
  try {
    var buf = ctx.createBuffer(1, 1, 22050);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    if (ctx.state !== 'running' && ctx.resume) ctx.resume();
    _feelUnlocked = true;
  } catch (e) {}
}
// Tic de interfaz: una nota muy corta con caída de tono.
function uiBlip(f1, f2, dur, gain, type) {
  var ctx = soundCtx();
  if (!ctx) return;
  var osc = ctx.createOscillator(), g = ctx.createGain();
  var t0 = ctx.currentTime + 0.005;
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(f1, t0);
  osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}
function fxUiSound(kind) {
  if (!uiSoundsEnabled()) return;
  if (kind === 'primary') { uiBlip(660, 990, 0.1, 0.16, 'triangle'); return; }
  if (kind === 'tab') { uiBlip(560, 470, 0.06, 0.1, 'triangle'); return; }
  if (kind === 'off') { uiBlip(300, 240, 0.07, 0.1, 'triangle'); return; }
  uiBlip(900, 640, 0.05, 0.12, 'triangle');
}
// Un solo oyente para toda la app: cada botón suena y vibra al tocarlo,
// sin tocar los cientos de botones que pinta cada modo.
var _feelLast = 0;
function feelOnPress(ev) {
  feelUnlockAudio();
  var t = ev.target && ev.target.closest ? ev.target.closest('button, [role=button], [role=tab], [role=switch], .menu-tile, label.btn, [onclick]') : null;
  if (!t || t.disabled || t.closest('input, textarea, select, .joy-controls, [data-nofeel]')) return;
  var now = Date.now();
  if (now - _feelLast < 40) return;
  _feelLast = now;
  var kind = t.classList.contains('btn-primary') || t.classList.contains('solo-cta') || t.classList.contains('decide-super') ? 'primary'
    : (t.classList.contains('menu-tab') || t.classList.contains('seg-tab') || t.getAttribute('role') === 'tab') ? 'tab' : 'tap';
  _feelInGesture = true;
  try { fxHaptic(kind); } finally { _feelInGesture = false; }
  fxUiSound(kind);
}
if (typeof document !== 'undefined') {
  document.addEventListener('click', feelOnPress, true);
  // El joystick y otros controles no hacen click: también desbloquean el audio.
  ['touchend', 'keydown'].forEach(function (evName) { document.addEventListener(evName, feelUnlockAudio, { passive: true, capture: true }); });
}

window.actionToggleHaptics = function () {
  G.meta.haptics = !hapticsEnabled();
  saveMeta(G.meta);
  render();
  if (G.meta.haptics) { _feelInGesture = true; try { fxHaptic('primary'); } finally { _feelInGesture = false; } }
};
window.actionToggleUiSounds = function () {
  G.meta.uiSounds = !(G.meta.uiSounds !== false);
  saveMeta(G.meta);
  render();
  if (G.meta.uiSounds !== false) fxUiSound('primary');
};
