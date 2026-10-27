/* ---------------------------------------------------------------------
   EFECTOS: confeti para goles y trofeos (solo DOM y CSS, sin
   librerías). fxConfetti('big') para títulos, fxConfetti('small') para
   tus goles. Respeta "reducir movimiento".
   --------------------------------------------------------------------- */
var FX_COLORS = ['#ffb020', '#ff4d4d', '#3aa0ff', '#3ddc84', '#ffffff', '#c77dff'];
function fxReducedMotion() {
  try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}
function fxConfetti(size) {
  if (fxReducedMotion() || typeof document === 'undefined') return;
  // 'mega' (título grande, tipo Champions) tira aún más confeti y más tiempo que 'big'
  // (resto de trofeos), a petición explícita ("que se note más según lo gordo que sea").
  var mega = size === 'mega';
  var big = size === 'big' || mega;
  var count = mega ? 150 : big ? 90 : 28;
  var layer = document.createElement('div');
  layer.className = 'fx-layer';
  for (var i = 0; i < count; i++) {
    var p = document.createElement('span');
    p.className = 'fx-piece';
    var startX = big ? Math.random() * 100 : 35 + Math.random() * 30;
    p.style.left = startX + '%';
    p.style.top = big ? '-8%' : '35%';
    p.style.background = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
    p.style.setProperty('--dx', ((Math.random() - 0.5) * (big ? 240 : 320)) + 'px');
    p.style.setProperty('--dy', (big ? 100 + Math.random() * 40 : 20 + Math.random() * 45) + 'vh');
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.animationDuration = (mega ? 2.8 + Math.random() * 2 : big ? 2.2 + Math.random() * 1.6 : 1.1 + Math.random() * 0.8) + 's';
    p.style.animationDelay = (Math.random() * (mega ? 0.9 : big ? 0.5 : 0.15)) + 's';
    if (Math.random() < 0.4) p.style.borderRadius = '50%';
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, mega ? 5800 : big ? 4500 : 2500);
}
// Gol tuyo: solo confeti. Antes había además un resplandor sobre toda la
// página, que justo después de un vídeo de técnica se veía como un
// pantallazo blanco. Se llama desde el motor y desde el refresco del
// partido: una sola vez por gol.
var _fxGoalAt = 0;
function fxGoalFlash() {
  if (fxReducedMotion() || typeof document === 'undefined') return;
  if (Date.now() - _fxGoalAt < 1500) return;
  _fxGoalAt = Date.now();
  fxConfetti('small');
}

// Toast flotante para feedback inmediato en acciones puntuales (fichar,
// vender...) que antes solo se notaban al ver la lista actualizarse, a
// petición explícita ("una notificación flotante... más feedback
// inmediato"). type: 'good' (verde, por defecto), 'bad' (rojo) o 'info'
// (azulado). Se apilan si se llama varias veces seguidas.
function fxToast(message, type) {
  if (typeof document === 'undefined') return;
  var stack = document.getElementById('fx-toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'fx-toast-stack';
    stack.className = 'fx-toast-stack';
    document.body.appendChild(stack);
  }
  var t = document.createElement('div');
  t.className = 'fx-toast fx-toast-' + (type || 'good');
  t.textContent = message;
  stack.appendChild(t);
  setTimeout(function () { t.classList.add('fx-toast-out'); }, 2200);
  setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
}
