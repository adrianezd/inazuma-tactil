/* Códigos de Puntos de Espíritu (en Ajustes, ver renderAjustes en backup.js).
   Los códigos no están escritos aquí: solo su huella SHA-256, para que no
   se puedan leer en el código de la web. Cada uno se puede canjear un
   número de veces; los usos van en G.meta.codes (junto a los Puntos de
   Espíritu, así viajan con las partidas guardadas). Para añadir uno:
   node -e "console.log(require('crypto').createHash('sha256').update('CODIGO').digest('hex'))" */
var PROMO_CODES = {
  '228f36dd92b1337062cea5b5068f66f846eccac8f03a1643a67b6678635199f9': { points: 5000, uses: 3 }
};
function promoCodeHash(text) {
  var bytes = new TextEncoder().encode(text);
  return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  });
}
function promoCodeMsg(text, type) {
  // Se guarda para que sobreviva al render() que sigue al canje.
  G.promoMsg = { text: text, type: type };
  var el = document.getElementById('promoCodeMsg');
  if (!el) return;
  el.textContent = text;
  el.className = 'promo-msg promo-msg-' + type;
}
window.actionRedeemCode = function (ev) {
  if (ev) ev.preventDefault();
  var input = document.getElementById('promoCodeInput');
  var code = (input && input.value || '').trim().toUpperCase();
  if (!code) return false;
  if (!window.crypto || !crypto.subtle) { promoCodeMsg('Tu navegador no puede canjear códigos.', 'bad'); return false; }
  promoCodeHash(code).then(function (h) {
    var promo = PROMO_CODES[h];
    if (!promo) { promoCodeMsg('Código no válido.', 'bad'); return; }
    G.meta.codes = G.meta.codes || {};
    var used = G.meta.codes[h] || 0;
    if (used >= promo.uses) { promoCodeMsg('Ya has usado este código todas las veces.', 'bad'); return; }
    G.meta.codes[h] = used + 1;
    G.meta.points += promo.points;
    saveMeta(G.meta);
    input.value = '';
    var left = promo.uses - used - 1;
    promoCodeMsg('+' + promo.points + ' Puntos de Espíritu' + (left > 1 ? ' · te quedan ' + left + ' usos' : left ? ' · te queda 1 uso' : ' · era el último uso'), 'good');
    if (typeof fxToast === 'function') fxToast('+' + promo.points + ' Puntos de Espíritu', 'good');
    if (typeof fxConfetti === 'function') fxConfetti('small');
    render();
  });
  return false;
};
