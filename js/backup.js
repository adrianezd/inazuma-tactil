/* ---------------------------------------------------------------------
   AJUSTES Y COPIA DE SEGURIDAD.
   Todas las partidas viven en el navegador (localStorage): si se borran
   los datos de la web, se pierde todo. Desde Ajustes se puede:
   - Descargar copia: un archivo .json con todas las partidas.
   - Cargar copia: elegir ese archivo (en este móvil o en otro).
   - Copiar código / Pegar código: lo mismo como texto comprimido, para
     pasarlo por WhatsApp o notas sin manejar archivos.
   Se guardan las mismas claves que pasa importar.js (inazumaTactilRoguelike* y
   inazumaTactilWorldTour*), menos el tema. Al cargar, se sustituyen las partidas
   actuales y se recarga la página.
   --------------------------------------------------------------------- */
var BACKUP_KEYS_RE = /^(inazumaTactilRoguelike|inazumaTactilWorldTour)/;
var BACKUP_SKIP = { inazumaTactilRoguelike_theme: 1, inazumaTactilRoguelike_migrado: 1 };
var BACKUP_REMIND_DAYS = 14;

function backupCollect() {
  var datos = {}, n = 0;
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (BACKUP_KEYS_RE.test(k) && !BACKUP_SKIP[k]) { datos[k] = localStorage.getItem(k); n++; }
    }
  } catch (e) {}
  return { app: 'inazuma-tactil', v: 1, version: APP_VERSION, fecha: new Date().toISOString(), n: n, datos: datos };
}
// Resumen legible de lo que hay en una copia (para confirmar antes de cargar).
function backupSummary(datos) {
  var parts = [];
  var slots = Object.keys(datos).filter(function (k) { return /^inazumaTactilRoguelike_career_slot_/.test(k); }).length;
  if (slots) parts.push(slots + (slots === 1 ? ' partida' : ' partidas') + ' de Modo Carrera');
  if (datos.inazumaTactilRoguelike_soloCareer) parts.push('Carrera de jugador');
  try {
    var meta = datos.inazumaTactilRoguelike_v2 ? JSON.parse(datos.inazumaTactilRoguelike_v2) : null;
    if (meta) {
      parts.push((meta.points || 0) + ' Puntos de Espíritu');
      parts.push((meta.unlocked || []).length + ' personajes desbloqueados');
    }
  } catch (e) {}
  return parts.length ? parts.join(' · ') : 'Sin partidas';
}
function backupHasProgress() {
  var d = backupCollect().datos;
  return Object.keys(d).some(function (k) { return k !== 'inazumaTactilRoguelike_v2'; }) || (G.meta && ((G.meta.points || 0) > 0 || (G.meta.runsPlayed || 0) > 0));
}
// Punto rojo en el botón de Ajustes si hay progreso y no hay copia reciente.
function backupNeedsReminder() {
  if (!G.meta || !backupHasProgress()) return false;
  var last = G.meta.lastBackupAt ? Date.parse(G.meta.lastBackupAt) : 0;
  return !last || Date.now() - last > BACKUP_REMIND_DAYS * 86400000;
}
function backupMarkDone() {
  G.meta.lastBackupAt = new Date().toISOString();
  saveMeta(G.meta);
}
function backupFileName() {
  var d = new Date();
  var p = function (x) { return (x < 10 ? '0' : '') + x; };
  return 'inazumarun-partidas-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '.json';
}

// ----- Código de texto: gzip + base64 (IR1.), o JSON en base64 si el navegador no comprime (IR0.) -----
function backupB64(bytes) {
  var bin = '';
  for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function backupFromB64(b64) {
  var bin = atob(b64), bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function backupEncode(obj) {
  var json = JSON.stringify(obj);
  var raw = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'undefined') return Promise.resolve('IR0.' + backupB64(raw));
  return new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()
    .then(function (buf) { return 'IR1.' + backupB64(new Uint8Array(buf)); });
}
function backupDecode(text) {
  var t = String(text || '').trim().replace(/\s+/g, '');
  // Un archivo .json pegado tal cual también vale.
  if (t.charAt(0) === '{') return Promise.resolve(JSON.parse(String(text)));
  var m = t.match(/^IR([01])\.(.+)$/);
  if (!m) return Promise.reject(new Error('formato'));
  var bytes = backupFromB64(m[2]);
  if (m[1] === '0') return Promise.resolve(JSON.parse(new TextDecoder().decode(bytes)));
  if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('navegador'));
  return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text().then(JSON.parse);
}
function backupValidate(obj) {
  if (!obj || obj.app !== 'inazuma-tactil' || !obj.datos || typeof obj.datos !== 'object') return null;
  var datos = {};
  Object.keys(obj.datos).forEach(function (k) { if (BACKUP_KEYS_RE.test(k) && !BACKUP_SKIP[k] && typeof obj.datos[k] === 'string') datos[k] = obj.datos[k]; });
  return Object.keys(datos).length ? { fecha: obj.fecha, version: obj.version, datos: datos } : null;
}

// ----- Acciones -----
window.actionGoAjustes = function () {
  G.ajustes = { msg: null, pending: null, paste: false };
  G.promoMsg = null;
  G.screen = 'ajustes';
  render();
};
function ajustesMsg(text, kind) {
  G.ajustes = G.ajustes || {};
  G.ajustes.msg = { text: text, kind: kind || 'good' };
  render();
}
window.actionBackupDownload = function () {
  var obj = backupCollect();
  try {
    var blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = backupFileName();
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    backupMarkDone();
    ajustesMsg('Copia descargada. Guárdala en un sitio seguro, por ejemplo en tu nube.');
  } catch (e) {
    ajustesMsg('No se ha podido descargar. Prueba con Copiar código.', 'bad');
  }
};
window.actionBackupCopyCode = function () {
  backupEncode(backupCollect()).then(function (code) {
    var done = function () { backupMarkDone(); ajustesMsg('Código copiado. Pégalo en un mensaje o una nota para guardarlo.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, function () { backupShowCode(code); });
    } else backupShowCode(code);
  }).catch(function () { ajustesMsg('No se ha podido crear el código.', 'bad'); });
};
// Si el navegador no deja copiar solo, se enseña el código para copiarlo a mano.
function backupShowCode(code) {
  G.ajustes.code = code;
  backupMarkDone();
  ajustesMsg('Mantén pulsado el código para copiarlo.', 'info');
}
window.actionBackupPickFile = function (input) {
  var file = input && input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () { backupPrepare(String(reader.result)); };
  reader.onerror = function () { ajustesMsg('No se ha podido leer el archivo.', 'bad'); };
  reader.readAsText(file);
  input.value = '';
};
window.actionBackupTogglePaste = function () {
  G.ajustes.paste = !G.ajustes.paste;
  G.ajustes.msg = null;
  render();
};
window.actionBackupPasteGo = function () {
  var el = document.getElementById('backupPasteBox');
  backupPrepare(el ? el.value : '');
};
function backupPrepare(text) {
  backupDecode(text).then(function (obj) {
    var ok = backupValidate(obj);
    if (!ok) { ajustesMsg('Eso no es una copia de IE Táctil.', 'bad'); return; }
    G.ajustes.pending = ok;
    G.ajustes.paste = false;
    G.ajustes.msg = null;
    render();
  }).catch(function (e) {
    ajustesMsg(e && e.message === 'navegador' ? 'Este navegador no puede abrir ese código. Prueba con el archivo.' : 'El código o el archivo no es válido.', 'bad');
  });
}
window.actionBackupCancel = function () { G.ajustes.pending = null; render(); };
window.actionBackupRestore = function () {
  var p = G.ajustes && G.ajustes.pending;
  if (!p) return;
  try {
    var mine = [];
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (BACKUP_KEYS_RE.test(k) && !BACKUP_SKIP[k]) mine.push(k); }
    mine.forEach(function (k) { localStorage.removeItem(k); });
    Object.keys(p.datos).forEach(function (k) { localStorage.setItem(k, p.datos[k]); });
    sessionStorage.setItem('inazumaTactilBackupRestored', '1');
  } catch (e) {
    ajustesMsg('No se ha podido cargar: el navegador no deja guardar más datos.', 'bad');
    return;
  }
  location.reload();
};
// Aviso tras recargar con la copia cargada.
(function () {
  try {
    if (sessionStorage.getItem('inazumaTactilBackupRestored')) {
      sessionStorage.removeItem('inazumaTactilBackupRestored');
      window.addEventListener('load', function () { if (typeof fxToast === 'function') fxToast('Copia cargada: tus partidas ya están aquí', 'good'); });
    }
  } catch (e) {}
})();

// ----- Pantalla -----
function ajustesToggleRow(title, sub, on, onclick) {
  return '<div class="ajustes-row"><div><strong>' + title + '</strong><span>' + sub + '</span></div>' +
    '<button class="ajustes-switch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" aria-label="' + title + '" onclick="' + onclick + '"><i></i></button></div>';
}
function backupFmtDate(iso) {
  var d = iso ? new Date(iso) : null;
  if (!d || isNaN(d)) return null;
  var days = Math.floor((Date.now() - d.getTime()) / 86400000);
  return days <= 0 ? 'hoy' : days === 1 ? 'ayer' : 'hace ' + days + ' días';
}
function renderAjustes() {
  var a = G.ajustes = G.ajustes || {};
  var meta = G.meta;
  var last = backupFmtDate(meta.lastBackupAt);
  var current = backupCollect();
  var msg = a.msg ? '<p class="ajustes-msg ajustes-msg-' + a.msg.kind + '">' + escapeHtml(a.msg.text) + '</p>' : '';
  var backupBody;
  if (a.pending) {
    var when = backupFmtDate(a.pending.fecha);
    backupBody =
      '<div class="backup-confirm">' +
        '<div class="backup-confirm-ico">📦</div>' +
        '<strong>¿Cargar esta copia?</strong>' +
        '<p>' + escapeHtml(backupSummary(a.pending.datos)) + '</p>' +
        '<p class="dim small">' + (when ? 'Hecha ' + when : 'Sin fecha') + (a.pending.version ? ' · versión ' + escapeHtml(a.pending.version) : '') + '</p>' +
        '<p class="backup-warn">Sustituye a las partidas que tienes ahora en este móvil.</p>' +
        '<button class="btn btn-primary btn-block" onclick="actionBackupRestore()">Cargar copia</button>' +
        '<button class="btn btn-outline btn-block mt" onclick="actionBackupCancel()">Cancelar</button>' +
      '</div>';
  } else {
    backupBody =
      '<p class="dim small">Tus partidas se guardan solo en este navegador. Haz una copia para no perderlas si borras los datos o cambias de móvil.</p>' +
      '<div class="backup-now"><span>Ahora tienes</span><strong>' + escapeHtml(backupSummary(current.datos)) + '</strong></div>' +
      '<div class="backup-grid">' +
        '<button class="btn btn-primary" onclick="actionBackupDownload()">⬇️ Descargar</button>' +
        '<label class="btn">⬆️ Cargar<input type="file" accept=".json,application/json,text/plain" onchange="actionBackupPickFile(this)" hidden></label>' +
        '<button class="btn btn-outline" onclick="actionBackupCopyCode()">📋 Copiar código</button>' +
        '<button class="btn btn-outline" onclick="actionBackupTogglePaste()">📥 Pegar código</button>' +
      '</div>' +
      (a.paste
        ? '<div class="backup-paste"><textarea id="backupPasteBox" rows="4" placeholder="Pega aquí el código de tu copia" spellcheck="false"></textarea>' +
            '<button class="btn btn-primary btn-block mt" onclick="actionBackupPasteGo()">Usar este código</button></div>'
        : '') +
      (a.code ? '<textarea class="backup-code" rows="4" readonly onclick="this.select()">' + escapeHtml(a.code) + '</textarea>' : '') +
      '<p class="backup-last' + (backupNeedsReminder() ? ' warn' : '') + '">' + (last ? 'Última copia: ' + last : 'Aún no has hecho ninguna copia') + '</p>';
  }
  return (
    '<div class="screen">' +
      pageTopHtml('actionBackToMenu()', 'Ajustes', '⚙️') +
      '<div class="panel">' +
        '<h2 class="panel-title">Copia de seguridad</h2>' + msg + backupBody +
      '</div>' +
      '<div class="panel">' +
        '<h2 class="panel-title">Código de regalo</h2>' +
        '<form class="promo-form" onsubmit="return actionRedeemCode(event)" autocomplete="off">' +
          '<input id="promoCodeInput" class="promo-input" type="text" maxlength="24" placeholder="¿Tienes un código?" aria-label="Código" spellcheck="false" autocapitalize="characters" data-focus-key="promo">' +
          '<button class="btn btn-primary promo-btn" type="submit">Canjear</button>' +
        '</form>' +
        '<p id="promoCodeMsg" class="promo-msg' + (G.promoMsg ? ' promo-msg-' + G.promoMsg.type : '') + '" aria-live="polite">' + (G.promoMsg ? escapeHtml(G.promoMsg.text) : '') + '</p>' +
      '</div>' +
      '<div class="panel">' +
        '<h2 class="panel-title">Sonido y vibración</h2>' +
        ajustesToggleRow('Sonido', 'Silbato de inicio y fanfarria de gol.', soundEnabled(), 'actionToggleSound()') +
        ajustesToggleRow('Sonidos al tocar', 'Un toque suave en cada botón.', meta.uiSounds !== false, 'actionToggleUiSounds()') +
        ajustesToggleRow('Vibración', canVibrate() ? 'Al tocar, al marcar y con las supertécnicas.' : 'Este navegador no deja vibrar (en iPhone no se puede).', hapticsEnabled(), 'actionToggleHaptics()') +
        ajustesToggleRow('Animaciones', 'Entradas y transiciones de pantalla.', !meta.reduceMotion, 'actionToggleReduceMotion()') +
      '</div>' +
      '<div class="panel center-text">' +
        '<p class="dim small" style="margin:0 0 10px">Inazuma Run · versión ' + escapeHtml(APP_VERSION) + '</p>' +
        '<button class="btn btn-outline btn-block" onclick="actionOpenPatchNotes()">📣 Novedades</button>' +
      '</div>' +
    '</div>'
  );
}
