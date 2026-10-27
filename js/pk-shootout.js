/* ---------------------------------------------------------------------
   TANDA DE PENALTIS JUGABLE: la usan Juega tú, Tú decides y cualquier
   partido jugado con Decidir (Carrera, FutDraft, Historia...), a petición
   explícita ("los penaltis en jugar tienes que jugarlos"). Tiran los
   jugadores reales de cada equipo (futDraftPenaltyOrder).
   - Tu tiro: eliges una de las 6 zonas de la portería y paras la barra de
     potencia. En la franja verde va con fuerza; muy fuerte, por arriba
     se puede ir alto; muy flojo, el portero lo para si adivina el lado.
   - Su tiro: eliges hacia dónde te tiras. Si aciertas columna (y fila,
     o el tiro va flojo), lo paras.
   Las stats cuentan: tiro del lanzador contra defensa del portero.
   pkStart(opts) -> opts.onDone({ myGoals, oppGoals }).
   --------------------------------------------------------------------- */
var PK_ROUNDS = 5;
var PK = null;

function pkStart(opts) {
  var myOrder = futDraftPenaltyOrder(opts.myPlayers.slice());
  var oppOrder = futDraftPenaltyOrder(opts.oppPlayers.slice());
  var keeperOf = function (list) { return list.find(function (p) { return p.posicion === 'Portero'; }) || list[list.length - 1]; };
  PK = {
    youName: opts.youName, youShield: opts.youShield, oppName: opts.oppName, oppShield: opts.oppShield,
    myOrder: myOrder, oppOrder: oppOrder, myKeeper: keeperOf(opts.myPlayers), oppKeeper: keeperOf(opts.oppPlayers),
    my: [], opp: [], turn: opts.youFirst === false ? 'opp' : 'me', stage: 'aim', zone: null,
    power: 0, powerDir: 1, result: null, onDone: opts.onDone, kicker: null, keeper: null, done: false
  };
  pkPrepareTurn();
  G.screen = 'pkShootout';
  render();
}
function pkTaker(side) {
  var list = side === 'me' ? PK.myOrder : PK.oppOrder;
  var n = (side === 'me' ? PK.my : PK.opp).length;
  return list[n % list.length];
}
function pkPrepareTurn() {
  PK.kicker = pkTaker(PK.turn);
  PK.keeper = PK.turn === 'me' ? PK.oppKeeper : PK.myKeeper;
  PK.stage = PK.turn === 'me' ? 'aim' : 'dive';
  PK.zone = null; PK.result = null; PK.power = 0;
}
// Zonas: 0-2 arriba (izquierda, centro, derecha), 3-5 abajo.
function pkCol(z) { return z % 3; }
function pkRow(z) { return z < 3 ? 0 : 1; }

window.pkPickZone = function (z) {
  if (!PK || PK.result) return;
  if (PK.stage === 'aim') {
    PK.zone = z;
    PK.stage = 'power';
    PK.power = 0; PK.powerDir = 1;
    render();
    pkPowerLoop();
    return;
  }
  if (PK.stage === 'dive') pkResolveTheirShot(z);
};
function pkPowerLoop() {
  if (!PK || PK.stage !== 'power' || G.screen !== 'pkShootout') return;
  // Más rápida cuanto peor tira el lanzador.
  var speed = 0.022 + (100 - (PK.kicker.tiro || 70)) / 4000;
  PK.power += PK.powerDir * speed;
  if (PK.power >= 1) { PK.power = 1; PK.powerDir = -1; }
  if (PK.power <= 0) { PK.power = 0; PK.powerDir = 1; }
  var bar = document.getElementById('pkPowerFill');
  if (bar) bar.style.left = (PK.power * 100) + '%';
  requestAnimationFrame(pkPowerLoop);
}
window.pkShoot = function () {
  if (!PK || PK.stage !== 'power') return;
  PK.stage = 'flight';
  var z = PK.zone, pw = PK.power;
  var keeperZone = pkKeeperGuess();
  var tiro = PK.kicker.tiro || 70, def = PK.keeper.defensa || 70;
  var outcome;
  if (pw > 0.93 && pkRow(z) === 0) outcome = 'miss';
  else if (pw > 0.97) outcome = 'miss';
  else {
    var weak = pw < 0.35;
    var sameCol = pkCol(keeperZone) === pkCol(z);
    var saved = sameCol && (pkRow(keeperZone) === pkRow(z) || weak || Math.random() < (def - tiro + 20) / 120);
    // Al palo raso y con fuerza, a veces ni adivinando llega.
    if (saved && !weak && pkCol(z) !== 1 && Math.random() < (tiro - def + 30) / 160) saved = false;
    outcome = saved ? 'save' : 'goal';
  }
  pkShow(z, keeperZone, outcome, 'me');
};
// El portero rival se tira: más a los lados que al centro.
function pkKeeperGuess() {
  var r = Math.random();
  var col = r < 0.4 ? 0 : r < 0.8 ? 2 : 1;
  var row = Math.random() < 0.6 ? 1 : 0;
  return row * 3 + col;
}
function pkResolveTheirShot(diveZone) {
  PK.stage = 'flight';
  var tiro = PK.kicker.tiro || 70, def = PK.keeper.defensa || 70;
  // Los buenos lanzadores buscan más las esquinas.
  var corner = Math.random() < 0.5 + (tiro - 70) / 100;
  var col = corner ? (Math.random() < 0.5 ? 0 : 2) : [0, 1, 2][Math.floor(Math.random() * 3)];
  var row = corner && Math.random() < 0.5 ? 0 : 1;
  var z = row * 3 + col;
  var outcome;
  if (Math.random() < clamp(0.1 - (tiro - 70) / 300, 0.03, 0.16)) outcome = 'miss';
  else {
    var sameCol = pkCol(diveZone) === col;
    var saved = sameCol && (pkRow(diveZone) === row || Math.random() < (def - tiro + 25) / 110);
    outcome = saved ? 'save' : 'goal';
  }
  pkShow(z, diveZone, outcome, 'opp');
}
function pkShow(z, keeperZone, outcome, side) {
  PK.shot = { z: z, k: keeperZone, outcome: outcome };
  render();
  // Dos fotogramas para que la transición del balón y del portero se vea.
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    var ball = document.getElementById('pkBall'), keeper = document.getElementById('pkKeeper');
    if (ball) ball.className = 'pk-ball pk-ball-z' + z + (outcome === 'miss' ? ' pk-ball-miss' : '');
    if (keeper) keeper.className = 'pk-keeper pk-keeper-z' + keeperZone;
  }); });
  setTimeout(function () {
    if (!PK) return;
    (side === 'me' ? PK.my : PK.opp).push(outcome === 'goal');
    PK.result = outcome;
    if (outcome === 'goal' && typeof playGoalSound === 'function') playGoalSound();
    render();
    setTimeout(pkNext, 1300);
  }, 750);
}
function pkScore(list) { return list.filter(Boolean).length; }
function pkDecided() {
  var m = PK.my.length, o = PK.opp.length, gm = pkScore(PK.my), go = pkScore(PK.opp);
  if (m <= PK_ROUNDS && o <= PK_ROUNDS) {
    if (gm + (PK_ROUNDS - m) < go) return true;
    if (go + (PK_ROUNDS - o) < gm) return true;
    if (m === PK_ROUNDS && o === PK_ROUNDS) return gm !== go;
    return false;
  }
  return m === o && gm !== go;
}
function pkNext() {
  if (!PK || PK.done) return;
  if (pkDecided()) { PK.done = true; render(); return; }
  PK.turn = PK.turn === 'me' ? 'opp' : 'me';
  pkPrepareTurn();
  render();
}
window.pkFinish = function () {
  if (!PK) return;
  var cb = PK.onDone, res = { myGoals: pkScore(PK.my), oppGoals: pkScore(PK.opp) };
  PK = null;
  if (cb) cb(res);
};

function pkDotsHtml(list) {
  var n = Math.max(PK_ROUNDS, list.length);
  var out = '';
  for (var i = 0; i < n; i++) out += '<span class="pk-dot' + (i < list.length ? (list[i] ? ' pk-dot-goal' : ' pk-dot-miss') : '') + '"></span>';
  return out;
}
function renderPkShootout() {
  if (!PK) return renderMenu();
  var myTurn = PK.turn === 'me';
  var shot = PK.stage === 'flight' && PK.shot;
  var head = PK.done
    ? (pkScore(PK.my) > pkScore(PK.opp) ? '¡Ganas la tanda!' : 'Pierdes la tanda')
    : PK.result ? ({ goal: '¡Gol!', save: '¡Parada!', miss: '¡Fuera!' })[PK.result]
    : myTurn ? (PK.stage === 'aim' ? 'Elige dónde tirar' : PK.stage === 'power' ? 'Para la barra en el verde' : 'Tiras…')
    : (PK.stage === 'dive' ? 'Elige hacia dónde tirarte' : 'Tira el rival…');
  var who = myTurn ? PK.kicker : PK.keeper;
  var zones = '';
  for (var z = 0; z < 6; z++) {
    var sel = PK.zone === z ? ' on' : '';
    var clickable = !PK.result && !PK.done && (PK.stage === 'aim' || PK.stage === 'dive');
    zones += '<button class="pk-zone' + sel + '"' + (clickable ? ' onclick="pkPickZone(' + z + ')"' : ' disabled') + ' aria-label="Zona ' + (z + 1) + '"></button>';
  }
  var kickerAv = '<div class="pk-person"><span class="pk-tag">Tira</span>' + avatarHtml(PK.kicker) + '<strong>' + escapeHtml(PK.kicker.nombre) + '</strong></div>';
  var keeperAv = '<div class="pk-person"><span class="pk-tag">Portero</span>' + avatarHtml(PK.keeper) + '<strong>' + escapeHtml(PK.keeper.nombre) + '</strong></div>';
  return (
    '<div class="screen pk-screen">' +
      '<div class="pk-board">' +
        '<div class="pk-team"><img src="' + escapeHtml(PK.youShield) + '" alt=""><span>' + escapeHtml(PK.youName) + '</span><div class="pk-dots">' + pkDotsHtml(PK.my) + '</div></div>' +
        '<div class="pk-total">' + pkScore(PK.my) + ' - ' + pkScore(PK.opp) + '<small>Penaltis</small></div>' +
        '<div class="pk-team pk-team-b"><img src="' + escapeHtml(PK.oppShield) + '" alt=""><span>' + escapeHtml(PK.oppName) + '</span><div class="pk-dots">' + pkDotsHtml(PK.opp) + '</div></div>' +
      '</div>' +
      '<div class="pk-headline' + (PK.result ? ' pk-headline-' + PK.result : '') + '">' + head + '</div>' +
      '<div class="pk-people">' + (myTurn ? kickerAv + keeperAv : keeperAv.replace('Portero', 'Tu portero') + kickerAv.replace('Tira', 'Tira ' + escapeHtml(PK.oppName))) + '</div>' +
      '<div class="pk-goal-wrap">' +
        '<div class="pk-goal">' +
          '<div class="pk-net"></div>' +
          '<div class="pk-zones">' + zones + '</div>' +
          '<div class="pk-keeper" id="pkKeeper">' + avatarHtml(PK.keeper) + '</div>' +
        '</div>' +
        '<div class="pk-spot"></div>' +
        '<div class="pk-ball" id="pkBall">⚽</div>' +
      '</div>' +
      (PK.stage === 'power' && !PK.result
        ? '<div class="pk-power"><div class="pk-power-track"><span class="pk-power-ok"></span><span class="pk-power-fill" id="pkPowerFill"></span></div>' +
          '<button class="btn btn-primary btn-block mt" onclick="pkShoot()">Chutar</button><p class="dim small center-text">Flojo, el portero lo para si adivina. Demasiado fuerte, se va alto.</p></div>'
        : '') +
      (PK.done ? '<button class="btn btn-primary btn-block mt" onclick="pkFinish()">Continuar</button>' : '') +
      (!PK.done && !shot && !PK.result ? '<p class="dim small center-text">' + (myTurn ? 'Toca una de las seis zonas de la portería.' : 'Toca la zona donde crees que va a tirar ' + escapeHtml(PK.kicker.nombre) + '.') + '</p>' : '') +
    '</div>'
  );
}
