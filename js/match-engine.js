// =========================================================================
// MOTOR EN TIEMPO REAL DE "VER PARTIDO" (modo puntitos), rehecho a petición
// explícita: "quiero que simules un partido real con movimientos, tiros a
// puerta, paradas de portero, movimientos reales de jugadores... la pelota
// a veces pasa de mi al rival automaticamente, sin que se vea al rival
// robando el balon... sin necesidad de decir robo ni pase ni nada".
//
// En vez de ticks de 600 ms con saltos y transiciones CSS, ahora hay un
// bucle a 60 fps (requestAnimationFrame) con posiciones en METROS (campo
// de 105x68) y velocidades reales:
// - Cada jugador corre hacia un objetivo con aceleración, según su papel:
//   bloque que sube al atacar y se repliega al defender, los dos rivales
//   más cercanos presionan al que lleva el balón, desmarques de delanteros.
// - El balón es un objeto físico: pegado a los pies de quien lo lleva, o
//   volando (pase, tiro) hacia un punto concreto. Nunca se teletransporta.
// - Un robo solo pasa cuando un rival LLEGA de verdad al que lleva el balón
//   (entrada) o se cruza en la línea de un pase (intercepción).
// - Tiros de verdad: parada del portero, fuera, o gol. Los goles siguen
//   saliendo del resultado ya calculado (live.pending): el equipo al que le
//   toca marcar empuja más y su tiro entra; el resto de tiros nunca entran.
// - Sin carteles de "robo" o "pase": solo el aviso de gol y el descanso.
// =========================================================================
var MR_W = 105, MR_H = 68, MR_CY = 34;
// Postes alineados con la portería que se dibuja (30% del alto del campo).
var MR_GOAL_Y1 = 24.5, MR_GOAL_Y2 = 43.5;
var MR_MIN_PER_SEC = 90 / 80;
// Profundidad base de cada línea (metros desde tu portería) en el saque.
var MR_LINE_BASE = [2, 19, 35, 47];
var MR_SPEED = { jog: 5.2, sprint: 7.8, dribble: 6.2, keeper: 6, dive: 12, pass: 27, shot: 32 };

function mrToPct(x, y) { return { l: 4 + (x / MR_W) * 92, t: 4 + (y / MR_H) * 92 }; }
function mrFx(side, x) { return side === 'me' ? x : MR_W - x; }
function mrWorldX(side, fx) { return side === 'me' ? fx : MR_W - fx; }
function mrOther(side) { return side === 'me' ? 'opp' : 'me'; }
function mrDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function mrActive(list) { return list.filter(function (d) { return !d.off; }); }
function mrDot(live, ref) { return ref ? live.dotsState[ref.side].find(function (d) { return d.num === ref.num; }) : null; }

function mrHomeYs(count) {
  var ys = [];
  for (var i = 0; i < count; i++) ys.push(count === 1 ? MR_CY : 9 + i * (50 / (count - 1)) + rand(-2, 2));
  return ys;
}
function futDraftBuildDotsState(live) {
  var lineup = (G.career && live.isCareer) ? G.career.lineup : G.futdraft.lineup;
  var formation = FUTDRAFT_FORMATIONS.find(function (f) { return f.id === (G.career && live.isCareer ? G.career.formation : G.futdraft.formation); }) || FUTDRAFT_FORMATIONS[0];
  var order = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];
  function mk(side, line, num, hy, player) {
    return { side: side, line: line, num: num, hy: hy, x: mrWorldX(side, MR_LINE_BASE[line]), y: hy, vx: 0, vy: 0, ox: 0, oy: 0, wobT: 0, stun: 0, tackleCd: 0, player: player };
  }
  var meDots = [], oppDots = [], num = 1;
  order.forEach(function (pos, line) {
    var slots = lineup.filter(function (s) { return s.pos === pos; });
    var ys = mrHomeYs(slots.length);
    slots.forEach(function (s, i) { meDots.push(mk('me', line, num++, ys[i], s.player)); });
  });
  var pickOpp = mrOppPicker(live, meDots);
  // live.oppFormation: el rival sale con su dibujo real (Partido rápido,
  // con su once de verdad, o el 4 vs 4) en vez de uno al azar. Si no lo
  // trae, se arma con su plantilla un once con dibujo de verdad
  // (qmFitFormation), a petición explícita ("que fuerce a todas las
  // plantillas a jugar con alineaciones reales").
  var oppFormation = live.oppFormation;
  if (!oppFormation) {
    var fitXi = mrOppFittedEleven(live, meDots);
    if (fitXi) {
      oppFormation = { id: 'real', rows: qmRowsOf(fitXi) };
      var basePick = pickOpp;
      pickOpp = function (pos) {
        var k = fitXi.findIndex(function (p) { return p.posicion === pos; });
        if (k === -1) return basePick(pos);
        return fitXi.splice(k, 1)[0];
      };
    }
  }
  if (!oppFormation) oppFormation = mrOppFormation(formation, live.oppSide ? live.oppSide.name : '', meDots);
  live.oppFormationId = oppFormation.id;
  var oppNum = 1;
  order.forEach(function (pos, line) {
    var row = oppFormation.rows.find(function (r) { return r.pos === pos; });
    var count = row ? row.count : 0;
    var ys = mrHomeYs(count);
    for (var i = 0; i < count; i++) oppDots.push(mk('opp', line, oppNum++, ys[i], pickOpp(pos)));
  });
  return { me: meDots, opp: oppDots };
}
// Once rival con dibujo real a partir de su plantilla (la fija de Carrera,
// la del modo o la del roster), sin nadie de tu equipo; null si no le
// llegan 11 jugadores con foto (entonces se rellena como siempre).
function mrOppFittedEleven(live, meDots) {
  if (typeof qmFitFormation !== 'function' || typeof qmBestEleven !== 'function') return null;
  var f = G.futdraft || {};
  var mine = {};
  meDots.forEach(function (d) { if (d.player) mine[d.player.id] = true; });
  var oppName = live.oppSide ? live.oppSide.name : '';
  var raw = (f.oppGhostPool && f.oppGhostPool.length ? f.oppGhostPool : (f.oppPlayersOverride && f.oppPlayersOverride.length ? f.oppPlayersOverride : (oppName ? teamMembers(oppName) : [])));
  var seen = {};
  var pool = raw.filter(function (p) {
    if (!p || !p.id || mine[p.id] || seen[p.id]) return false;
    seen[p.id] = true;
    return ROSTER.some(function (r) { return r.id === p.id; });
  }).map(function (p) { return Object.assign({}, ROSTER.find(function (r) { return r.id === p.id; }), p); });
  if (pool.length < 11) return null;
  var scoreFn = G.career && live.isCareer && typeof careerPlayerScore === 'function' ? careerPlayerScore : futDraftPlayerScore;
  var xi = qmBestEleven(pool, scoreFn);
  return xi.length === 11 ? qmFitFormation(xi) : null;
}
// El rival no copia tu dibujo: sale con otra formación al azar, entre las
// que más jugadores suyos dejan jugar (si tiene 3 delanteros, no un 4-5-1).
function mrOppFormation(mine, oppName, meDots) {
  var others = FUTDRAFT_FORMATIONS.filter(function (f) { return f.id !== mine.id; });
  if (!others.length) return mine;
  var mineIds = {};
  meDots.forEach(function (d) { if (d.player) mineIds[d.player.id] = true; });
  var have = {};
  (oppName ? teamMembers(oppName) : []).forEach(function (p) { if (!mineIds[p.id]) have[p.posicion] = (have[p.posicion] || 0) + 1; });
  function unused(f) {
    return f.rows.reduce(function (sum, r) { return sum + Math.max(0, (have[r.pos] || 0) - r.count); }, 0);
  }
  var best = Math.min.apply(null, others.map(unused));
  var fits = others.filter(function (f) { return unused(f) === best; });
  return fits[Math.floor(Math.random() * fits.length)];
}
// Once rival SIN repetir a nadie (antes, con pocos jugadores en la lista
// del rival, salía el mismo varias veces: "el Occult tiene 5 Talisman") y
// todos con foto. Orden de preferencia: plantilla fija de Carrera, el
// equipo real del roster (con su portero), la lista del modo, jugadores de
// equipos de la misma temporada y, por último, cualquiera con foto.
function mrOppPicker(live, meDots) {
  var f = G.futdraft || {};
  var used = {};
  meDots.forEach(function (d) { if (d.player) used[d.player.id] = true; });
  var oppName = live.oppSide ? live.oppSide.name : '';
  var withFace = function (p) { return p && p.id && ROSTER.some(function (r) { return r.id === p.id; }); };
  var season = typeof TEAM_SEASON !== 'undefined' ? TEAM_SEASON[oppName] : null;
  var tiers = [
    f.oppGhostPool || [],
    teamMembers(oppName),
    f.oppPlayersOverride || [],
    season ? ROSTER.filter(function (p) { return p.equipo !== oppName && TEAM_SEASON[p.equipo] === season; }) : [],
    ROSTER
  ].map(function (list) { return list.filter(withFace); });
  // Los de relleno (niveles 3 y 4) se barajan para no sacar siempre los mismos.
  tiers[3] = tiers[3].slice().sort(function () { return Math.random() - 0.5; });
  tiers[4] = tiers[4].slice().sort(function () { return Math.random() - 0.5; });
  function take(p) { used[p.id] = true; var src = ROSTER.find(function (r) { return r.id === p.id; }); return Object.assign({}, src, p); }
  return function (pos) {
    var i, j, list;
    for (i = 0; i < tiers.length; i++) {
      list = tiers[i];
      for (j = 0; j < list.length; j++) if (!used[list[j].id] && list[j].posicion === pos) return take(list[j]);
    }
    for (i = 0; i < tiers.length; i++) {
      list = tiers[i];
      for (j = 0; j < list.length; j++) if (!used[list[j].id] && (pos === 'Portero') === (list[j].posicion === 'Portero')) return take(list[j]);
    }
    return null;
  };
}

// ----- Estado inicial y fases -----
function mrInit(live) {
  if (!live.dotsState) { live.dotsState = futDraftBuildDotsState(live); mrVidPreload(live); }
  if (live.mr) return;
  live.mr = { ball: { x: MR_W / 2, y: MR_CY, mode: 'owned', owner: null, possSide: 'me' }, decideT: 0.4, pressT: 0, pressers: {}, grace: 0 };
  mrSetupKickoff(live, 'me', true);
}
function mrEnterPhase(live, phase, secs) {
  live.phase = phase;
  live.mr.phaseT = secs;
}
// Coloca (instantáneo si snap, si no como objetivo para ir andando) a
// todos en su mitad, y el que saca en el círculo central.
function mrKickoffSpot(live, d, kickSide) {
  var fx = Math.min(MR_LINE_BASE[d.line], 47);
  var y = d.hy;
  if (d.side === kickSide && d === mrKickTaker(live, kickSide)) { fx = MR_W / 2 - 0.6; y = MR_CY; }
  return { x: mrWorldX(d.side, fx), y: y };
}
function mrKickTaker(live, side) {
  var list = mrActive(live.dotsState[side]);
  var fw = list.filter(function (d) { return d.line === 3; });
  var pool = fw.length ? fw : list.filter(function (d) { return d.line === 2; });
  if (!pool.length) pool = list;
  return pool.slice().sort(function (a, b) { return Math.abs(a.hy - MR_CY) - Math.abs(b.hy - MR_CY); })[0];
}
function mrSetupKickoff(live, side, snap) {
  var mr = live.mr;
  mr.kickSide = side;
  ['me', 'opp'].forEach(function (s) {
    live.dotsState[s].forEach(function (d) {
      var p = mrKickoffSpot(live, d, side);
      d.kx = p.x; d.ky = p.y;
      if (snap) { d.x = p.x; d.y = p.y; d.vx = 0; d.vy = 0; }
    });
  });
  if (snap) {
    var taker = mrKickTaker(live, side);
    mr.ball = { x: MR_W / 2, y: MR_CY, mode: 'owned', owner: { side: side, num: taker.num }, possSide: side };
    mrEnterPhase(live, 'kickoff', 1.0);
  } else {
    mr.ball.mode = 'dead';
    mrEnterPhase(live, 'reset', 2.4);
  }
}

// ----- Bucle -----
var _mrLive = null, _mrLast = 0;
function futDraftRtStart(live) {
  mrInit(live);
  if (_mrLive === live) return;
  _mrLive = live;
  _mrLast = 0;
  requestAnimationFrame(futDraftRtLoop);
}
function futDraftRtLoop(ts) {
  var live = G.futdraft && G.futdraft.live;
  if (G.screen !== 'futdraftLive' || !live || live !== _mrLive || live.done) { if (_mrLive === live) _mrLive = null; mrVidReleaseAll(); if (typeof decideCleanup === 'function') decideCleanup(); return; }
  var dt = _mrLast ? Math.min(0.05, (ts - _mrLast) / 1000) : 0.016;
  _mrLast = ts;
  // 4 vs 4 (campo pequeño): todo va más deprisa, como en un campo de
  // fútbol sala, y el partido dura menos.
  if (live.small4) dt *= 1.35;
  // x2/x4/x8: 2, 4 u 8 pasos de simulación por fotograma (la física va igual de fina).
  futDraftRtStep(live, dt);
  // Suplente con "Ir a mi entrada": el partido corre deprisa hasta que entras.
  var steps = live.subIn && !live.subIn.done && live.subIn.ff ? 14 : (G.matchSpeed || 1);
  for (var extra = 1; extra < steps && !live.done && G.futdraft && G.futdraft.live === live; extra++) futDraftRtStep(live, dt);
  if (live.done) { mrVidReleaseAll(); return; }
  futDraftRtDraw(live);
  requestAnimationFrame(futDraftRtLoop);
}

function futDraftRtStep(live, dt) {
  var mr = live.mr;
  if (mr && mr.techHold && mrTechHoldStep(live)) return;
  // Tú decides (js/decide-mode.js): la jugada espera a que elijas.
  if (live.decision) return;
  if (live.phase === 'penalties') { mrPenStep(live, dt); return; }
  mrUpdateBall(live, dt);
  if (live.phase === 'setpiece') { mrAdvanceClock(live, dt); mrMovePlayers(live, dt); mrSetpieceStep(live, dt); return; }
  if (live.phase !== 'play') {
    mr.phaseT -= dt;
    if (live.phase === 'goal' || live.phase === 'reset') mrMovePlayers(live, dt);
    if (live.phase === 'reset') {
      var settled = ['me', 'opp'].every(function (s) { return mrActive(live.dotsState[s]).every(function (d) { return Math.hypot(d.x - d.kx, d.y - d.ky) < 1.2; }); });
      if (settled && mrDist(mr.ball, { x: MR_W / 2, y: MR_CY }) < 0.5) mr.phaseT = Math.min(mr.phaseT, 0);
    }
    if (mr.phaseT <= 0) mrEndPhase(live);
    return;
  }

  var cap = mrAdvanceClock(live, dt);
  if (live.subIn && !live.subIn.done) mrMaybeSubIn(live);
  var ballOwned = mr.ball.mode === 'owned';
  // Descanso: al 45' (más el descuento) y también a mitad de la prórroga
  // (105'), con su cambio de campo en los dos casos.
  var htMinute = live.inExtraTime ? 105 : (live.halfLen || 45);
  var htDone = live.inExtraTime ? live.etHalfShown : live.halfTimeShown;
  var halfGoalLeft = live.pending[0] && live.pending[0].minute <= htMinute;
  // Córner en juego: el árbitro no pita (ni el descanso ni el final)
  // hasta que se resuelve la jugada -- antes pitaba con el balón aún en
  // la esquina, un bug real ("pitar final en medio de un córner").
  if (mr.cornerT > 0) {
    mr.cornerT -= dt;
    if (!ballOwned || mr.ball.possSide !== mr.cornerSide) mr.cornerT = Math.min(mr.cornerT, 0.6);
  }
  var cornerLive = mr.cornerT > 0;
  if (!htDone && !cornerLive && live.minute >= htMinute && (live.added || 0) >= mrStoppage(live) && !halfGoalLeft && ballOwned) {
    if (live.inExtraTime) live.etHalfShown = true; else live.halfTimeShown = true;
    live.added = 0;
    live.statsForceSync = true;
    mrEnterPhase(live, 'halftime', live.inExtraTime ? 2.4 : 3.4);
    return;
  }
  if (live.minute >= cap && (live.added || 0) >= mrStoppage(live) && !live.pending.length && ballOwned && !cornerLive) { mrFinish(live); return; }

  mrTrackPossession(live);
  mr.grace = Math.max(0, mr.grace - dt);
  if (ballOwned) mrCarrierLogic(live, dt);
  mrMovePlayers(live, dt);
  if (mr.ball.mode === 'owned') mrTackles(live);
}

// Reloj: nunca pasa de largo un gol pendiente ni el descanso. Si el gol
// que toca se retrasa, va más despacio en vez de pararse de golpe (el
// minuto del gol será el que marque al entrar).
// Descuento (a petición explícita): de 1 a 5 minutos al azar al final de
// cada parte. live.minute se queda en 45 o 90 y corre live.added ("45+2'").
function mrStoppage(live) {
  // 4 vs 4: descuento corto, de 0 a 1 minuto.
  if (!live.stoppage) live.stoppage = live.halfLen ? { h1: Math.floor(Math.random() * 2), h2: Math.floor(Math.random() * 2) } : { h1: 1 + Math.floor(Math.random() * 5), h2: 1 + Math.floor(Math.random() * 5) };
  if (live.inExtraTime) return 0;
  return live.halfTimeShown ? live.stoppage.h2 : live.stoppage.h1;
}
// live.halfLen: duración de cada parte si no es la de siempre (25 en el
// 4 vs 4, que además corre algo más despacio: dura casi un minuto real).
function mrAdvanceClock(live, dt) {
  var half = live.halfLen || 45;
  var cap = live.inExtraTime ? 120 : half * 2;
  var halfEnd = live.inExtraTime ? (live.etHalfShown ? 120 : 105) : (live.halfTimeShown ? half * 2 : half);
  var next = live.pending[0];
  var limit = halfEnd, rate = MR_MIN_PER_SEC * (live.halfLen ? 0.6 : 1);
  if (next) { limit = Math.min(limit, next.minute + 6); if (live.minute > next.minute + 1) rate *= 0.35; }
  if (live.minute < halfEnd) live.minute = Math.min(limit, live.minute + rate * dt);
  else live.added = Math.min(mrStoppage(live), (live.added || 0) + rate * dt);
  return cap;
}
function mrPlusNow(live) { return live.added > 0 ? Math.min(Math.floor(live.added) + 1, mrStoppage(live)) : 0; }

// Cambio de campo en el descanso y al empezar la prórroga, como en el
// fútbol: por dentro "me" ataca siempre hacia x creciente y solo se
// invierte el dibujo (mrFlip). Al cambiar, se reflejan las posiciones para
// que nadie salte de sitio: cruzan el campo andando hasta su nueva mitad.
// Los escudos de los lados del campo no se mueven (a petición explícita).
function mrFlip(live) { return (live.youAreHome === false) !== !!(live.mr && live.mr.swapped); }
function mrSwapEnds(live) {
  var mr = live.mr;
  mr.swapped = !mr.swapped;
  ['me', 'opp'].forEach(function (s) {
    live.dotsState[s].forEach(function (d) { d.x = MR_W - d.x; d.vx = -d.vx; });
  });
  mr.ball.x = MR_W - mr.ball.x;
  if (mr.ball.mode === 'air') { mr.ball.fromX = MR_W - mr.ball.fromX; mr.ball.toX = MR_W - mr.ball.toX; }
  if (typeof _mrDom !== 'undefined' && _mrDom) _mrDom.trailPts = [];
}

function mrFinish(live) {
  // Tú decides: el marcador es el que se ha jugado, no el del guion.
  if (live.decide) { live.finalMyGoals = live.myGoals; live.finalOppGoals = live.oppGoals; }
  // live.noExtraTime (4 vs 4): del empate se pasa directo a penaltis.
  if (futDraftLiveNeedsExtraTime(live)) {
    var myPlayers = G.futdraft.lineup.map(function (s) { return s.player; });
    futDraftAddExtraTime(live, myPlayers);
    live.added = 0;
    mrSwapEnds(live);
    render();
    mrSetupKickoff(live, 'me', false);
    live.mr.phaseT = 6;
    return;
  }
  live.done = true;
  G.futdraft.lastLiveStats = { cards: live.cards || [], poss_ticks: live.poss_ticks || { me: 0, opp: 0 } };
  futDraftRtDraw(live);
  setTimeout(live.onFinish, 700);
}

// Cambio en directo (live.subIn = { minute, player }): a petición explícita
// ("los partidos que eres suplente también puedas jugarlos, se supone que
// entras en la segunda parte"). A partir de ese minuto, en cuanto el
// balón no lo lleve ni vaya hacia él, tu jugador sustituye al de su línea
// más flojo; con live.decideSolo desde ese momento juegas tú.
function mrMaybeSubIn(live) {
  var sub = live.subIn, mr = live.mr;
  if (live.minute < sub.minute || live.phase === 'penalties') return;
  var line = FUTDRAFT_LINE_POS.indexOf(sub.player.posicion);
  var busy = function (d) {
    var b = mr.ball;
    return (b.owner && b.owner.side === 'me' && b.owner.num === d.num) || (b.mode === 'air' && b.receiver && b.receiver.side === 'me' && b.receiver.num === d.num);
  };
  var pool = mrActive(live.dotsState.me).filter(function (d) { return d.line === line && !busy(d); });
  if (!pool.length && line > 0) pool = mrActive(live.dotsState.me).filter(function (d) { return d.line > 0 && !busy(d); });
  if (!pool.length) return;
  var score = typeof futDraftPlayerScore === 'function' ? futDraftPlayerScore : function () { return 0; };
  var out = pool.slice().sort(function (a, b) { return (a.player ? score(a.player) : 0) - (b.player ? score(b.player) : 0); })[0];
  var outPlayer = out.player;
  out.player = sub.player;
  out.techGlow = { color: '#ffb020', until: Date.now() + 2600 };
  var lineup = G.futdraft && G.futdraft.lineup;
  if (lineup && outPlayer) lineup.forEach(function (s) { if (s.player && s.player.id === outPlayer.id) s.player = sub.player; });
  sub.done = true;
  sub.outName = outPlayer ? outPlayer.nombre : '';
  sub.at = Math.floor(live.minute);
  live.subFlashUntil = Date.now() + 2600;
  mrVidPreload(live);
  if (typeof fxToast === 'function') fxToast('🔄 ¡Entras al campo! (' + sub.at + "')", 'good');
  if (typeof sub.onEnter === 'function') sub.onEnter(live);
  render();
}

function mrEndPhase(live) {
  var mr = live.mr;
  var phase = live.phase;
  // 4 vs 4: el primero en llegar a live.firstTo goles gana y se acaba.
  if (phase === 'goal' && live.firstTo && Math.max(live.myGoals, live.oppGoals) >= live.firstTo) { mrFinish(live); return; }
  if (phase === 'goal') { mrSetupKickoff(live, mr.concededSide, false); return; }
  if (phase === 'halftime') { mrSwapEnds(live); mrSetupKickoff(live, 'opp', false); mr.phaseT = 6; return; }
  if (phase === 'reset') {
    var side = mr.kickSide;
    var taker = mrKickTaker(live, side);
    mr.ball = { x: MR_W / 2, y: MR_CY, mode: 'owned', owner: { side: side, num: taker.num }, possSide: side };
    mrEnterPhase(live, 'kickoff', 0.8);
    return;
  }
  if (phase === 'kickoff') {
    live.phase = 'play';
    mr.decideT = 0.15;
    mr.forceBackPass = true;
    mr.grace = 1.2;
    return;
  }
  // 'card' (falta), 'out' (saque de puerta) y cualquier otra: se sigue.
  live.phase = 'play';
  mr.grace = 0.8;
  mr.decideT = 0.4;
}

// ----- Balón -----
function mrFeet(d) {
  var dir = d.side === 'me' ? 1 : -1;
  // Delante del jugador según hacia dónde corre (a poca velocidad, hacia
  // la portería rival); mrUpdateBall ya lo acerca sin saltos.
  var sp = Math.hypot(d.vx, d.vy), k = clamp(sp / 3, 0, 1);
  var fx = sp > 0.01 ? d.vx / sp : 0, fy = sp > 0.01 ? d.vy / sp : 0;
  return { x: d.x + (fx * k + dir * (1 - k)) * 0.9, y: d.y + fy * k * 0.9 };
}
function mrUpdateBall(live, dt) {
  var b = live.mr.ball;
  if (b.mode === 'air') {
    b.t += dt;
    var k = Math.min(1, b.t / b.dur);
    // Frenado suave al final del recorrido (como un balón rodando).
    var e = b.kind === 'shot' ? k : 1 - Math.pow(1 - k, 1.6);
    b.x = b.fromX + (b.toX - b.fromX) * e;
    b.y = b.fromY + (b.toY - b.fromY) * e;
    b.h = b.lofted ? Math.sin(Math.PI * k) : 0;
    if (b.keeperTech && !b.keeperTechDone && k >= 0.7) {
      b.keeperTechDone = true;
      var gk = live.dotsState[mrOther(b.kicker.side)].find(function (d) { return d.line === 0 && !d.off; });
      if (gk) { mrTechHold(live, b.keeperTech, gk, null); return; }
    }
    if (k >= 1) mrBallArrived(live);
    return;
  }
  b.h = 0;
  var target = null;
  if (b.mode === 'owned') { var o = mrDot(live, b.owner); if (o) target = mrFeet(o); }
  else if (b.mode === 'dead' && live.phase === 'reset') target = { x: MR_W / 2, y: MR_CY };
  else if (b.mode === 'dead' && live.phase === 'setpiece' && live.mr.sp) target = live.mr.sp.spot;
  if (!target) return;
  // El balón nunca salta: se acerca a los pies de su dueño como mucho a
  // 24 m/s (si ya está pegado, lo sigue sin más).
  var dx = target.x - b.x, dy = target.y - b.y, dist = Math.hypot(dx, dy);
  var maxStep = (b.mode === 'dead' ? 30 : 24) * dt;
  if (dist <= maxStep) { b.x = target.x; b.y = target.y; }
  else { b.x += (dx / dist) * maxStep; b.y += (dy / dist) * maxStep; }
}
function mrKick(live, from, toX, toY, speed, kind, extra) {
  var b = live.mr.ball;
  var dist = Math.hypot(toX - b.x, toY - b.y);
  live.mr.ball = Object.assign({
    mode: 'air', kind: kind, x: b.x, y: b.y, fromX: b.x, fromY: b.y, toX: toX, toY: toY,
    t: 0, dur: clamp(dist / speed, kind === 'shot' ? 0.3 : 0.35, 1.3), lofted: kind !== 'shot' && dist > 26,
    possSide: from.side, kicker: { side: from.side, num: from.num }
  }, extra || {});
}
function mrBallArrived(live) {
  var mr = live.mr, b = mr.ball;
  if (b.out) { mrStartRestart(live, b); return; }
  if (b.kind === 'pass') {
    var r = mrDot(live, b.receiver);
    if (!r || r.off) r = futDraftNearestActive(live.dotsState[b.possSide], b);
    mrGiveBall(live, r, 0.25);
    if (b.cross) { mr.afterCross = r.side === b.kicker.side ? 'shot' : 'clear'; mr.decideT = 0.08; mr.grace = 0.5; }
    return;
  }
  // Tiro
  if (b.outcome === 'goal') { mrScoreGoal(live); return; }
  var keeper = live.dotsState[mrOther(b.kicker.side)].find(function (d) { return d.line === 0 && !d.off; }) || futDraftNearestActive(live.dotsState[mrOther(b.kicker.side)], b);
  if (b.outcome === 'save') {
    keeper.diveY = null;
    // A veces la saca a córner en vez de blocarla.
    if (Math.random() < 0.4) {
      var ownGoalX = keeper.side === 'me' ? -2 : MR_W + 2;
      mrKick(live, keeper, ownGoalX, b.y < MR_CY ? rand(6, 18) : rand(MR_H - 18, MR_H - 6), 16, 'pass', { out: true });
      return;
    }
    mrGiveBall(live, keeper, 0);
    mr.keeperHold = 1.1;
    // Si ya hizo su técnica con vídeo, no se repite el nombre.
    var kTech = b.keeperTechDone ? null : mrTech(keeper.player, 'portero', live, keeper.side);
    if (kTech && !mrTechVideoSrc(kTech.name) && Math.random() < 0.55 && mrTechGate(live, keeper.side, kTech)) mrShowTech(live, kTech, keeper);
    return;
  }
  // Fuera: saque de puerta del portero rival tras un momento (o córner
  // si la ha tocado antes un defensa).
  keeper.diveY = null;
  if (b.deflected) { mrStartCorner(live, b.kicker.side, b.y < MR_CY ? 'top' : 'bottom'); return; }
  mr.ball = { x: b.x, y: b.y, mode: 'owned', owner: { side: keeper.side, num: keeper.num }, possSide: keeper.side };
  mr.keeperHold = 0.9;
  mrEnterPhase(live, 'out', 0.9);
}
function futDraftNearestActive(list, from) {
  var best = null, bd = Infinity;
  mrActive(list).forEach(function (d) { var dd = mrDist(d, from); if (dd < bd) { bd = dd; best = d; } });
  return best;
}
function mrGiveBall(live, d, decide) {
  var mr = live.mr;
  var prevSide = mr.ball.possSide;
  mr.ball = { x: mr.ball.x, y: mr.ball.y, mode: 'owned', owner: { side: d.side, num: d.num }, possSide: d.side };
  // Cerca del área rival se decide rápido (control y remate).
  mr.decideT = decide + (mrFx(d.side, d.x) > 70 ? randf(0.1, 0.35) : randf(0.25, 0.7));
  if (prevSide !== d.side) mr.grace = 0.6;
}

// ----- Saques de banda y córners -----
// El balón ha salido del campo: según por dónde y quién la tocó por
// última vez, saque de banda, córner o saque de puerta.
function mrStartRestart(live, b) {
  var last = b.kicker.side;
  if (b.toY < 0 || b.toY > MR_H) {
    mrStartSetpiece(live, 'throw', mrOther(last), { x: clamp(b.toX, 3, MR_W - 3), y: b.toY < 0 ? 0.3 : MR_H - 0.3 });
    return;
  }
  var goalOwner = b.toX < 0 ? 'me' : 'opp';
  if (last === goalOwner) { mrStartCorner(live, mrOther(goalOwner), b.toY < MR_CY ? 'top' : 'bottom'); return; }
  var keeper = live.dotsState[goalOwner].find(function (d) { return d.line === 0 && !d.off; }) || futDraftNearestActive(live.dotsState[goalOwner], b);
  live.mr.ball = { x: b.x, y: b.y, mode: 'owned', owner: { side: keeper.side, num: keeper.num }, possSide: keeper.side };
  live.mr.keeperHold = 0.9;
  mrEnterPhase(live, 'out', 0.9);
}
function mrStartCorner(live, side, end) {
  var goalX = side === 'me' ? MR_W - 0.3 : 0.3;
  mrStartSetpiece(live, 'corner', side, { x: goalX, y: end === 'top' ? 0.3 : MR_H - 0.3 });
}
function mrStartSetpiece(live, kind, side, spot) {
  var mr = live.mr;
  var outfield = mrActive(live.dotsState[side]).filter(function (d) { return d.line > 0; });
  var mids = outfield.filter(function (d) { return d.line === 2; });
  var taker = futDraftNearestActive(kind === 'corner' && mids.length ? mids : outfield, spot);
  mr.sp = { kind: kind, side: side, spot: spot, taker: { side: side, num: taker.num }, t: 0 };
  mr.ball = { x: mr.ball.x, y: mr.ball.y, mode: 'dead', possSide: side };
  ['me', 'opp'].forEach(function (s) { live.dotsState[s].forEach(function (d) { d.diveY = null; d.spX = null; d.mark = null; }); });
  if (kind === 'corner') {
    // Rematadores repartidos por el área (menos 2 defensas que se quedan
    // atrás) y cada defensor rival marcando a uno.
    var others = outfield.filter(function (d) { return d !== taker; });
    var stayBack = others.filter(function (d) { return d.line === 1; }).slice(0, 2);
    var boxers = others.filter(function (d) { return stayBack.indexOf(d) === -1; });
    boxers.forEach(function (d, i) {
      d.spX = mrWorldX(side, 87 + (i % 3) * 4 + rand(-1, 1));
      d.spY = 24 + (i / Math.max(1, boxers.length - 1)) * 20 + randf(-1.5, 1.5);
    });
    stayBack.forEach(function (d, i) { d.spX = mrWorldX(side, 52); d.spY = 22 + i * 24; });
    var defSide = mrOther(side);
    mrActive(live.dotsState[defSide]).forEach(function (d, i) {
      if (d.line === 1 || d.line === 2) d.mark = boxers.length ? { side: side, num: boxers[i % boxers.length].num } : null;
      else if (d.line === 3) { d.spX = mrWorldX(defSide, 44); d.spY = 24 + (i % 2) * 18; }
    });
  }
  mrEnterPhase(live, 'setpiece', 99);
}
function mrSetpieceTarget(live, d) {
  var sp = live.mr.sp;
  if (!sp) return null;
  if (sp.taker.side === d.side && sp.taker.num === d.num) {
    // En la banda, el que saca se pone justo fuera de la línea.
    return sp.kind === 'throw' ? { x: sp.spot.x, y: sp.spot.y < MR_CY ? sp.spot.y + 0.2 : sp.spot.y - 0.2 } : { x: sp.spot.x, y: sp.spot.y };
  }
  if (sp.kind !== 'corner') return null;
  if (d.line === 0) return { x: mrWorldX(d.side, 1.2), y: MR_CY + (sp.spot.y < MR_CY ? -2 : 2) };
  if (d.spX != null) return { x: d.spX, y: d.spY };
  if (d.mark) {
    var m = mrDot(live, d.mark);
    if (m) { var dir = mrWorldX(d.side, 0) > m.x ? 1 : -1; return { x: m.x + dir * 3, y: m.y + (m.num % 2 ? 1.8 : -1.8) }; }
  }
  return null;
}
function mrSetpieceStep(live, dt) {
  var mr = live.mr, sp = mr.sp;
  sp.t += dt;
  var taker = mrDot(live, sp.taker);
  var ready = taker && mrDist(taker, sp.spot) < 1.2 && mrDist(mr.ball, sp.spot) < 0.4;
  var wait = sp.kind === 'corner' ? 1.2 : 0.8;
  // En el córner, además, espera a que los rematadores estén en el área.
  if (ready && sp.kind === 'corner') {
    ready = ['me', 'opp'].every(function (side) { return mrActive(live.dotsState[side]).every(function (d) { var tg = mrSetpieceTarget(live, d); return !tg || Math.hypot(d.x - tg.x, d.y - tg.y) < 2.5; }); });
  }
  if (!((ready && sp.t > wait) || sp.t > 4.5)) return;
  mr.ball = { x: sp.spot.x, y: sp.spot.y, mode: 'owned', owner: { side: sp.side, num: taker.num }, possSide: sp.side };
  live.phase = 'play';
  mr.grace = 0.8;
  mr.decideT = 0.6;
  if (sp.kind === 'corner') { mr.cornerT = 5; mr.cornerSide = sp.side; }
  if (sp.kind === 'throw') {
    var opp = live.dotsState[mrOther(sp.side)];
    var best = null, bs = -Infinity;
    mrActive(live.dotsState[sp.side]).forEach(function (d) {
      if (d === taker || d.line === 0) return;
      var dist = mrDist(d, taker);
      if (dist < 4 || dist > 22) return;
      var n = futDraftNearestActive(opp, d);
      var sc = (n ? Math.min(mrDist(n, d), 10) : 10) - dist * 0.15 + rand(0, 4);
      if (sc > bs) { bs = sc; best = d; }
    });
    if (best) mrKick(live, taker, clamp(best.x + best.vx * 0.3, 1.5, MR_W - 1.5), clamp(best.y + best.vy * 0.3, 2, MR_H - 2), 18, 'pass', { receiver: { side: best.side, num: best.num } });
  } else {
    // Centro al área: lo gana un rematador o un defensa (según la fuerza,
    // y siempre el que ataca si le toca marcar el gol del guion).
    var due = mrDue(live);
    var target = { x: mrWorldX(sp.side, rand(90, 98)), y: rand(27, 41) };
    var pAtk = 0.5 * (1 + mrEdge(live, sp.side) * 1.5);
    if (due.side === sp.side) pAtk = 1; else if (due.side === mrOther(sp.side)) pAtk = 0.15;
    var winSide = Math.random() < pAtk ? sp.side : mrOther(sp.side);
    var winner = futDraftNearestActive(mrActive(live.dotsState[winSide]).filter(function (d) { return d.line > 0 && d !== taker; }), target);
    if (winner) {
      if (winSide === sp.side) live.lastPasser = { side: sp.side, num: taker.num };
      mrKick(live, taker, target.x, target.y, 22, 'pass', { receiver: { side: winner.side, num: winner.num }, cross: true, lofted: true });
    }
  }
  ['me', 'opp'].forEach(function (s) { live.dotsState[s].forEach(function (d) { d.spX = null; d.mark = null; }); });
  mr.sp = null;
}

// ----- Fuerza relativa y guion de goles -----
function mrEdge(live, side) {
  var e = 0;
  if (typeof live.myAtk === 'number' && typeof live.effectiveOppPower === 'number') e = clamp(((live.myAtk + live.myDef) / 2 - live.effectiveOppPower) / 120, -0.2, 0.2);
  var red = live.redCards || { me: 0, opp: 0 };
  var adv = Math.min(Math.abs(red.opp - red.me), 2) * 0.05 * (red.opp > red.me ? 1 : red.opp < red.me ? -1 : 0);
  e += adv;
  return side === 'me' ? e : -e;
}
function mrDue(live) {
  var next = live.pending[0];
  if (!next) return { side: null, overdue: false };
  var now = live.minute + (live.added || 0);
  return { side: now >= next.minute - 1.5 ? next.side : null, overdue: now >= next.minute + 0.8 };
}

// ----- Quien lleva el balón -----
function mrCarrierLogic(live, dt) {
  var mr = live.mr, b = mr.ball;
  var owner = mrDot(live, b.owner);
  if (!owner || owner.off) { var n = futDraftNearestActive(live.dotsState[b.possSide], b); if (n) mrGiveBall(live, n, 0); return; }
  if (owner.line === 0 && mr.keeperHold > 0) { mr.keeperHold -= dt; if (mr.keeperHold > 0) return; mrKeeperDistribute(live, owner); return; }
  if (live.decide && mrDecideAttackHook(live, owner)) return;
  mr.decideT -= dt;
  if (mr.decideT > 0) return;
  mr.decideT = randf(0.4, 0.95);
  var side = owner.side, opp = mrOther(side);
  var fx = mrFx(side, owner.x);
  var due = mrDue(live);
  var scripted = due.side === side;
  var nearestOpp = futDraftNearestActive(live.dotsState[opp], owner);
  var pressure = nearestOpp ? mrDist(nearestOpp, owner) : 99;
  var central = Math.abs(owner.y - MR_CY);

  if (mr.afterCross) {
    var ac = mr.afterCross;
    mr.afterCross = null;
    // Remate de cabeza tras el córner, o despeje del defensa.
    if (ac === 'shot' && owner.line > 0) { mrShoot(live, owner, scripted ? 'goal' : (Math.random() < 0.55 ? 'save' : 'wide')); return; }
    if (ac === 'clear') { var cl = mrPickPass(live, owner, false); if (cl) { mrPass(live, owner, cl); return; } }
  }
  if (mr.forceBackPass) { mr.forceBackPass = false; var back = mrPickPass(live, owner, true); if (back) { mrPass(live, owner, back); return; } }
  if (owner.line === 0) { mrKeeperDistribute(live, owner); return; }

  if (scripted && fx > (due.overdue ? 55 : 70) && central < (due.overdue ? 30 : 26)) { mrShoot(live, owner, 'goal'); return; }
  var inBox = fx > 86 && central < 20;
  var shootChance = inBox ? 0.8 : (fx > 72 && central < 26) ? 0.5 : (fx > 58 && central < 18) ? 0.22 : 0;
  // En Tú decides tus tiros los eliges tú; los del rival se resuelven por fuerza.
  // Con live.decideSolo solo eliges los tiros de tu jugador; los demás tiran solos.
  if (live.decide && side === 'me' && (!live.decideSolo || (owner.player && owner.player.id === live.decideSolo))) shootChance = 0;
  if (!scripted && Math.random() < shootChance) {
    // Tú decides: si tu portero tiene supertécnica de parada, eliges cuál.
    if (live.decide && side === 'opp' && mrDecideSaveHook(live, owner)) return;
    mrShoot(live, owner, live.decide ? mrDecideAiShot(live, owner) : (Math.random() < 0.65 ? 'save' : 'wide')); return;
  }
  var passChance = pressure < 4 ? 0.85 : pressure < 8 ? 0.55 : 0.36;
  if (scripted && fx > 55) passChance *= 0.5;
  if (Math.random() < passChance) {
    var target = mrPickPass(live, owner, false);
    if (target) { mrPass(live, owner, target); return; }
  }
  // Si no, sigue conduciendo (el movimiento lo lleva mrMovePlayers).
}
function mrKeeperDistribute(live, keeper) {
  var mates = mrActive(live.dotsState[keeper.side]).filter(function (d) { return d !== keeper; });
  var opp = live.dotsState[mrOther(keeper.side)];
  var scored = mates.map(function (d) {
    var nearest = futDraftNearestActive(opp, d);
    var open = nearest ? Math.min(mrDist(nearest, d), 14) : 14;
    return { d: d, s: open + (d.line === 1 ? 3 : d.line === 2 ? 1 : -2) + rand(0, 5) };
  }).sort(function (a, b) { return b.s - a.s; });
  if (scored.length) mrPass(live, keeper, scored[0].d);
}
function mrPickPass(live, owner, backwards) {
  var side = owner.side, opp = live.dotsState[mrOther(side)];
  var fxO = mrFx(side, owner.x);
  var due = mrDue(live);
  var wFwd = due.side === side ? 0.9 : 0.5;
  var best = null, bestS = -Infinity;
  mrActive(live.dotsState[side]).forEach(function (d) {
    if (d === owner) return;
    if (d.line === 0 && !(fxO < 30 && backwards)) return;
    var dist = mrDist(d, owner);
    if (dist < 5 || dist > 38) return;
    var gain = mrFx(side, d.x) - fxO;
    if (backwards && gain > 0) return;
    var nearest = futDraftNearestActive(opp, d);
    var open = nearest ? Math.min(mrDist(nearest, d), 12) : 12;
    var s = (backwards ? -gain * 0.2 : gain * (fxO > 50 && d.line === 3 ? wFwd + 0.3 : wFwd)) + open * 0.9 - Math.abs(dist - 14) * 0.2 + rand(0, 6);
    // Controlando solo a tu jugador, tus compañeros te buscan más.
    if (live.decideSolo && side === 'me' && d.player && d.player.id === live.decideSolo) s += 9;
    if (s > bestS) { bestS = s; best = d; }
  });
  return best;
}
function mrPass(live, owner, target) {
  var mr = live.mr;
  var lead = 0.45;
  var tx = clamp(target.x + target.vx * lead, 1.5, MR_W - 1.5), ty = clamp(target.y + target.vy * lead, 2, MR_H - 2);
  // ¿Algún rival se cruza en la línea del pase? Entonces va a por él y
  // el balón acaba en SU sitio (intercepción visible).
  var ax = mr.ball.x, ay = mr.ball.y, vx = tx - ax, vy = ty - ay, len2 = vx * vx + vy * vy;
  var due = mrDue(live);
  var cands = [];
  // Pase bueno elegido en Tú decides: nadie lo corta.
  if (!live.cleanPass) mrActive(live.dotsState[mrOther(owner.side)]).forEach(function (d) {
    if (d.line === 0 && mrFx(d.side, d.x) > 8) return;
    var t = len2 ? ((d.x - ax) * vx + (d.y - ay) * vy) / len2 : 0;
    if (t < 0.18 || t > 0.92) return;
    var px = ax + vx * t, py = ay + vy * t;
    var perp = Math.hypot(d.x - px, d.y - py);
    if (perp > 3.2) return;
    cands.push({ d: d, t: t, px: px, py: py, perp: perp });
  });
  cands.sort(function (a, b) { return a.t - b.t; });
  for (var i = 0; i < cands.length; i++) {
    var c = cands[i];
    var p = (0.5 - c.perp * 0.11) * (1 + mrEdge(live, c.d.side) * 1.5);
    if (due.side === owner.side) p *= due.overdue ? 0 : 0.25;
    else if (due.side === c.d.side) p = due.overdue ? 0.9 : p * 1.8;
    if (Math.random() < p) {
      mrKick(live, owner, c.px, c.py, MR_SPEED.pass, 'pass', { receiver: { side: c.d.side, num: c.d.num }, possSide: owner.side });
      mr.ball.intercept = true;
      mrMaybeTech(live, c.d, 'defensa', 0.2);
      live.lastPasser = null;
      return;
    }
  }
  live.lastPasser = { side: owner.side, num: owner.num };
  // Pase pasado de fuerza que se va por la banda (saque de banda rival).
  var nearLine = Math.min(ty, MR_H - ty) < 14;
  if (owner.line > 0 && Math.random() < (nearLine ? 0.11 : 0.03)) {
    mrKick(live, owner, clamp(tx + rand(-3, 3), 2, MR_W - 2), ty < MR_CY ? -2.5 : MR_H + 2.5, MR_SPEED.pass, 'pass', { receiver: { side: target.side, num: target.num }, out: true });
    return;
  }
  mrKick(live, owner, tx, ty, MR_SPEED.pass, 'pass', { receiver: { side: target.side, num: target.num } });
}
function mrShoot(live, owner, outcome) {
  var mr = live.mr, side = owner.side;
  var goalX = side === 'me' ? MR_W : 0;
  var inward = side === 'me' ? 1 : -1;
  var keeper = live.dotsState[mrOther(side)].find(function (d) { return d.line === 0 && !d.off; });
  var ty, tx, extra = { outcome: outcome };
  if (outcome === 'goal') {
    var ev = live.pending.shift();
    ev.minute = Math.max(1, Math.floor(live.minute));
    ev.plus = mrPlusNow(live);
    ev.scorer = owner.player || futDraftBallCarrierPlayer(live, { side: side, line: 3 }) || ev.scorer;
    var passer = live.lastPasser && live.lastPasser.side === side ? mrDot(live, live.lastPasser) : null;
    ev.assist = passer && passer.player && (!ev.scorer || passer.player.id !== ev.scorer.id) && Math.random() < 0.8 ? passer.player : (ev.assist || null);
    // El asistente previsto puede ser quien acaba marcando: entonces no hay asistencia.
    if (ev.assist && ev.scorer && ev.assist.id === ev.scorer.id) ev.assist = null;
    extra.ev = ev;
    // Pegado a un palo, y el portero se tira tarde o al otro lado.
    ty = Math.random() < 0.5 ? randf(MR_GOAL_Y1 + 1.2, MR_GOAL_Y1 + 5) : randf(MR_GOAL_Y2 - 5, MR_GOAL_Y2 - 1.2);
    tx = goalX + inward * 0.8;
    if (keeper) keeper.diveY = ty + (ty < MR_CY ? 6 : -6) * (Math.random() < 0.6 ? 1 : 0.4);
  } else if (outcome === 'save') {
    ty = clamp((keeper ? keeper.y : MR_CY) + rand(-5, 5), MR_GOAL_Y1 + 1.5, MR_GOAL_Y2 - 1.5);
    tx = goalX - inward * 1.8;
    if (keeper) keeper.diveY = ty;
  } else {
    ty = Math.random() < 0.5 ? MR_GOAL_Y1 - randf(1.5, 6) : MR_GOAL_Y2 + randf(1.5, 6);
    tx = goalX + inward * 2.5;
    extra.deflected = Math.random() < 0.5;
    if (keeper) keeper.diveY = clamp(ty, MR_GOAL_Y1 + 1, MR_GOAL_Y2 - 1);
  }
  live.shots = live.shots || { me: 0, opp: 0 };
  live.shots[side]++;
  // Supertécnica de tiro: estela del color de su elemento y su nombre un
  // instante (más a menudo en los goles).
  var tech = live.forceTech || mrTech(owner.player, 'tiro', live, side);
  var shotChance = tech && mrTechVideoSrc(tech.name) ? 0.85 : (outcome === 'goal' ? 0.7 : 0.35);
  // Supertiro elegido en Tú decides: sale siempre.
  var useTech = tech && (!!live.forceTech || (Math.random() < shotChance && mrTechGate(live, side, tech)));
  // Parada con vídeo: el portero hace su técnica cuando le llega el balón.
  if (outcome === 'save' && keeper) {
    var kTech = live.forceKeeperTech || mrTech(keeper.player, 'portero', live, keeper.side);
    if (live.forceKeeperTech) { if (mrTechVideoSrc(kTech.name)) extra.keeperTech = kTech; else decideTechShow(live, keeper, kTech); }
    else if (kTech && mrTechVideoSrc(kTech.name) && Math.random() < 0.85 && mrTechGate(live, keeper.side, kTech)) extra.keeperTech = kTech;
  }
  if (useTech) extra.tech = tech;
  if (useTech && mrTechVideoSrc(tech.name)) {
    mrTechHold(live, tech, owner, function () { mrKick(live, owner, tx, ty, MR_SPEED.shot, 'shot', extra); });
    return;
  }
  if (useTech) mrShowTech(live, tech, owner);
  mrKick(live, owner, tx, ty, MR_SPEED.shot, 'shot', extra);
}
function mrScoreGoal(live) {
  var mr = live.mr, ev = mr.ball.ev;
  if (ev.side === 'me') live.myGoals++; else live.oppGoals++;
  live.revealed.push(ev);
  live.lastGoalSide = ev.side;
  live.goalSeq = (live.goalSeq || 0) + 1;
  mr.concededSide = mrOther(ev.side);
  mr.scorer = mr.ball.kicker;
  mr.ball.mode = 'dead';
  ['me', 'opp'].forEach(function (s) { live.dotsState[s].forEach(function (d) { d.diveY = null; }); });
  if (typeof playGoalSound === 'function') playGoalSound();
  if (typeof fxGoalFlash === 'function' && (ev.side === 'me' || live.isQuick)) fxGoalFlash();
  mrEnterPhase(live, 'goal', live.pending.length > 6 ? 0.9 : 2.0);
}

// ----- Entradas (robos de verdad, cuerpo a cuerpo) y faltas -----
function mrTackles(live) {
  var mr = live.mr;
  if (mr.grace > 0) return;
  var owner = mrDot(live, mr.ball.owner);
  if (!owner || owner.line === 0) return;
  if (live.decide && mrDecideDefendHook(live, owner)) return;
  var due = mrDue(live);
  var defs = mrActive(live.dotsState[mrOther(owner.side)]);
  for (var i = 0; i < defs.length; i++) {
    var d = defs[i];
    if (d.line === 0 || d.tackleCd > 0 || mrDist(d, owner) > 1.7) continue;
    // Si el gol que toca ya va con retraso, al que ataca no se le roba.
    if (due.overdue && due.side === owner.side) continue;
    d.tackleCd = 1.1;
    if (Math.random() < 0.11) { mrFoul(live, d, owner); return; }
    var p = 0.3 * (1 + mrEdge(live, d.side) * 1.6);
    if (due.side === owner.side) p *= 0.25;
    else if (due.side === d.side) p = due.overdue ? 1 : p * 2.2;
    if (Math.random() < p) {
      owner.stun = 0.7;
      // A veces la entrada con supertécnica de defensa se pasa de dura y
      // es falta (a petición explícita): sale la técnica, pero pita el
      // árbitro y el balón sigue siendo del que atacaba.
      var foulTech = Math.random() < 0.12 ? mrTech(d.player, 'defensa', live, d.side) : null;
      if (foulTech && mrTechGate(live, d.side, foulTech)) {
        mr.techLabel = { text: foulTech.name + ' · ¡Falta!', color: foulTech.color, side: d.side, num: d.num, until: Date.now() + 1800 };
        d.techGlow = { color: foulTech.color, until: Date.now() + 1200 };
        mrFoul(live, d, owner);
        return;
      }
      // Pegado a la banda, la entrada muchas veces la manda fuera.
      // Metido en su área, el defensa despeja muchas veces a córner.
      if (mrFx(d.side, d.x) < 17 && Math.random() < 0.35) {
        mrKick(live, d, mrWorldX(d.side, -2), owner.y < MR_CY ? rand(4, 20) : rand(MR_H - 20, MR_H - 4), 16, 'pass', { out: true });
        return;
      }
      if (Math.min(owner.y, MR_H - owner.y) < 7 && Math.random() < 0.45) {
        mrKick(live, d, clamp(mr.ball.x + rand(-3, 3), 2, MR_W - 2), owner.y < MR_CY ? -2 : MR_H + 2, 14, 'pass', { out: true });
        return;
      }
      mrGiveBall(live, d, 0.1);
      mrMaybeTech(live, d, 'defensa', 0.35);
      return;
    }
    d.stun = 0.8;
    // Se va de la entrada: a veces con su supertécnica de regate.
    mrMaybeTech(live, owner, 'regate', 0.5);
    owner.burst = 0.8;
  }
}
function mrFoul(live, fouler, victim) {
  var mr = live.mr;
  live.cards = live.cards || [];
  live.redCards = live.redCards || { me: 0, opp: 0 };
  var tacFx = G.futdraft && G.futdraft.tactics ? futDraftTacticsMods(G.futdraft.tactics, false) : null;
  var redMult = typeof live.redCardFreqMult === 'number' ? live.redCardFreqMult : (tacFx ? tacFx.foul : 1);
  var injuryMult = typeof live.injuryFreqMult === 'number' ? live.injuryFreqMult : (tacFx ? tacFx.foul : 1);
  var yellowMult = typeof live.yellowFreqMult === 'number' ? live.yellowFreqMult : (tacFx ? tacFx.foul : 1);
  if (typeof live.injuryFreqMult !== 'number' && tacFx) injuryMult = tacFx.injury;
  var who = fouler.player || futDraftBallCarrierPlayer(live, { side: fouler.side, line: fouler.line });
  var minute = Math.max(1, Math.floor(live.minute));
  var pause = 0.7;
  var r = Math.random();
  if (who && r < 0.26 * yellowMult) {
    live.cards.push({ side: fouler.side, minute: minute, plus: mrPlusNow(live), type: 'yellow', name: who.nombre, id: who.id || null });
    live.cardFlash = { side: fouler.side, num: fouler.num, icon: '🟨', until: Date.now() + 2400 };
    pause = 1.2;
  } else if (who && redMult > 0 && r < 0.26 * yellowMult + 0.035 * redMult) {
    live.cards.push({ side: fouler.side, minute: minute, plus: mrPlusNow(live), type: 'red', name: who.nombre, id: who.id || null });
    live.cardFlash = { side: fouler.side, num: fouler.num, icon: '🟥', until: Date.now() + 2400 };
    live.redCards[fouler.side]++;
    fouler.off = true;
    if (who.id) {
      var key = fouler.side === 'me' ? 'sentOff' : 'sentOffOpp';
      live[key] = live[key] || [];
      if (live[key].indexOf(who.id) === -1) live[key].push(who.id);
    }
    pause = 1.4;
  }
  var victimPlayer = victim.player || futDraftBallCarrierPlayer(live, { side: victim.side, line: victim.line });
  if (victimPlayer && injuryMult > 0 && Math.random() < 0.08 * injuryMult) {
    live.cards.push({ side: victim.side, minute: minute, plus: mrPlusNow(live), type: 'injury', name: victimPlayer.nombre, id: victimPlayer.id || null });
    live.cardFlash = { side: victim.side, num: victim.num, icon: '🩹', until: Date.now() + 2400 };
    if (victim.side === 'me' && victimPlayer.id) { live.injured = live.injured || []; live.injured.push(victimPlayer.id); }
    pause = 1.4;
  }
  live.statsForceSync = true;
  fouler.stun = 1;
  mrEnterPhase(live, 'card', pause);
}

// ----- Movimiento -----
function mrPressers(live) {
  var mr = live.mr, b = mr.ball;
  var res = {};
  ['me', 'opp'].forEach(function (side) {
    if (b.possSide === side && !b.intercept) { res[side] = []; return; }
    var from = b.mode === 'air' ? { x: b.toX, y: b.toY } : b;
    res[side] = mrActive(live.dotsState[side]).filter(function (d) { return d.line !== 0; })
      .sort(function (a, c) { return mrDist(a, from) - mrDist(c, from); }).slice(0, 2);
  });
  return res;
}
function mrMovePlayers(live, dt) {
  var mr = live.mr, b = mr.ball;
  mr.pressT = (mr.pressT || 0) - dt;
  if (mr.pressT <= 0) { mr.pressers = mrPressers(live); mr.pressT = 0.3; }
  var owner = b.mode === 'owned' ? mrDot(live, b.owner) : null;
  var receiver = b.mode === 'air' && b.kind === 'pass' ? mrDot(live, b.receiver) : null;
  var scorer = live.phase === 'goal' ? mrDot(live, mr.scorer) : null;
  var due = mrDue(live);
  ['me', 'opp'].forEach(function (side) {
    var attacking = b.possSide === side && !(b.mode === 'air' && b.intercept);
    // Línea defensiva rival (el defensa de campo más retrasado, visto
    // desde el que ataca): los delanteros se colocan a su altura para
    // pedir el pase al hueco, como en un partido de verdad.
    var oppLine = 0;
    mrActive(live.dotsState[mrOther(side)]).forEach(function (o) { if (o.line > 0) oppLine = Math.max(oppLine, mrFx(side, o.x)); });
    var bfx = mrFx(side, b.mode === 'air' ? b.toX : b.x);
    var pressers = live.phase === 'setpiece' ? [] : (mr.pressers[side] || []);
    live.dotsState[side].forEach(function (d) {
      if (d.off) return;
      d.stun = Math.max(0, d.stun - dt);
      d.burst = Math.max(0, (d.burst || 0) - dt);
      d.tackleCd = Math.max(0, d.tackleCd - dt);
      d.wobT -= dt;
      if (d.wobT <= 0) {
        d.wobT = randf(1.6, 3.4);
        var runner = attacking && d.line >= 2 && Math.random() < 0.45;
        d.ox = runner ? rand(3, 11) : rand(-3, 3);
        d.oy = rand(-5, 5);
      }
      var tx, ty, speed = MR_SPEED.jog;
      var spT = live.phase === 'setpiece' ? mrSetpieceTarget(live, d) : null;
      if (spT) { tx = spT.x; ty = spT.y; speed = 11; }
      else if (live.phase === 'reset') { tx = d.kx; ty = d.ky; speed = 16; }
      else if (live.phase === 'goal') {
        if (scorer && side === scorer.side && d.line > 0) { tx = scorer.x + rand(-2, 2); ty = scorer.y + rand(-2, 2); speed = MR_SPEED.sprint; }
        else { tx = d.x; ty = d.y; }
      } else if (d === owner) {
        if (d.line === 0) { tx = d.x; ty = d.y; }
        else {
          var fx = mrFx(side, d.x);
          var nOpp = futDraftNearestActive(live.dotsState[mrOther(side)], d);
          var dodge = 0;
          if (nOpp && mrDist(nOpp, d) < 7) dodge = (d.y >= nOpp.y ? 1 : -1) * 5;
          var aimY = fx > 68 ? d.y + (MR_CY - d.y) * 0.45 : d.y + d.oy * 0.4;
          tx = mrWorldX(side, Math.min(fx + 10, MR_W - 4));
          ty = aimY + dodge;
          speed = MR_SPEED.dribble * (due.side === side ? (due.overdue ? 1.3 : 1.12) : 1) * (d.burst > 0 ? 1.25 : 1);
        }
      } else if (d === receiver) {
        tx = b.toX; ty = b.toY; speed = MR_SPEED.sprint;
      } else if (d.line === 0) {
        var gx = mrWorldX(side, attacking ? Math.min(2 + Math.max(0, bfx - 55) * 0.2, 9) : 2);
        tx = gx;
        if (d.diveY != null) { ty = d.diveY; speed = MR_SPEED.dive; tx = mrWorldX(side, 1.8); }
        else { ty = clamp(MR_CY + (b.y - MR_CY) * 0.3, MR_GOAL_Y1 + 1.5, MR_GOAL_Y2 - 1.5); speed = MR_SPEED.keeper; }
      } else if (pressers.indexOf(d) === 0) {
        var tgt = b.mode === 'air' ? { x: b.toX, y: b.toY } : b;
        tx = tgt.x; ty = tgt.y; speed = MR_SPEED.sprint * (due.side === side ? 1.12 : 1);
      } else if (pressers.indexOf(d) === 1) {
        var tg = b.mode === 'air' ? { x: b.toX, y: b.toY } : b;
        var ownGoal = { x: mrWorldX(side, 0), y: MR_CY };
        var k = clamp(7 / Math.max(1, mrDist(tg, ownGoal)), 0, 1);
        tx = tg.x + (ownGoal.x - tg.x) * k; ty = tg.y + (MR_CY - tg.y) * k; speed = MR_SPEED.sprint * 0.9;
      } else if (attacking) {
        var push = clamp((bfx - 25) * 0.75, 0, 44);
        var mult = [0, 0.8, 1, 1.05][d.line];
        var capFx = [9, 58, 82, 94][d.line];
        var afx = Math.min(MR_LINE_BASE[d.line] + push * mult + d.ox, capFx);
        if (d.line === 3) afx = Math.max(afx, Math.min(oppLine - 1 + d.ox * 0.5, 95));
        else if (d.line === 2) afx = Math.max(afx, Math.min(oppLine - 12 + d.ox, 84));
        tx = mrWorldX(side, afx);
        ty = MR_CY + (d.hy - MR_CY) * 1.15 + (b.y - MR_CY) * 0.15 + d.oy;
      } else {
        var shift = clamp((bfx - 38) * 0.55, -8, 28);
        var minFx = [2, 8, 16, 26][d.line];
        tx = mrWorldX(side, Math.max(minFx, MR_LINE_BASE[d.line] + shift + d.ox * 0.4));
        ty = MR_CY + (d.hy - MR_CY) * 0.75 + (b.y - MR_CY) * 0.4 + d.oy * 0.5;
      }
      tx = spT ? clamp(tx, 0.2, MR_W - 0.2) : clamp(tx, 0.8, MR_W - 0.8);
      ty = spT ? clamp(ty, 0.2, MR_H - 0.2) : clamp(ty, 1.5, MR_H - 1.5);
      if (d.stun > 0) speed *= 0.3;
      var dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy);
      var want = dist < 0.25 ? 0 : Math.min(speed, dist * 2.4);
      var dvx = dist ? (dx / dist) * want : 0, dvy = dist ? (dy / dist) * want : 0;
      var acc = Math.min(1, dt * (d.diveY != null ? 10 : 4.5));
      d.vx += (dvx - d.vx) * acc;
      d.vy += (dvy - d.vy) * acc;
    });
  });
  // Separación suave entre compañeros para que no se amontonen.
  ['me', 'opp'].forEach(function (side) {
    var list = mrActive(live.dotsState[side]);
    for (var i = 0; i < list.length; i++) {
      for (var j = i + 1; j < list.length; j++) {
        var a = list[i], c = list[j];
        var dx = c.x - a.x, dy = c.y - a.y, dd = Math.hypot(dx, dy);
        if (dd > 0.01 && dd < 4) {
          var push2 = (4 - dd) * 0.9;
          a.vx -= (dx / dd) * push2 * dt * 3; a.vy -= (dy / dd) * push2 * dt * 3;
          c.vx += (dx / dd) * push2 * dt * 3; c.vy += (dy / dd) * push2 * dt * 3;
        }
      }
    }
    list.forEach(function (d) {
      d.x = clamp(d.x + d.vx * dt, 0.2, MR_W - 0.2);
      d.y = clamp(d.y + d.vy * dt, 0.2, MR_H - 0.2);
    });
  });
}

function mrTrackPossession(live) {
  var side = live.mr.ball.possSide;
  if (!live.poss_ticks) live.poss_ticks = { me: 0, opp: 0 };
  live.poss_ticks[side]++;
  var checkpoint = Math.floor(live.minute / 2);
  if (live.possBarCheckpoint === undefined || checkpoint > live.possBarCheckpoint) {
    live.possBarCheckpoint = checkpoint;
    var total = live.poss_ticks.me + live.poss_ticks.opp;
    // En los primeros minutos aún no hay muestra: se queda al 50%.
    live.possBarPct = total && live.minute >= 4 ? Math.round((live.poss_ticks.me / total) * 100) : 50;
    live.statsForceSync = true;
  }
}

// ----- Pintado (solo toca left/top de lo que ya existe) -----
var _mrDom = null;
// Botón x1/x2/x4 dentro del propio partido (se recuerda para los siguientes).
window.actionToggleMatchSpeed = function (ev) {
  if (ev) ev.stopPropagation();
  var next = { 1: 2, 2: 4, 4: 8, 8: 1 }[G.matchSpeed || 1];
  G.matchSpeed = next;
  document.querySelectorAll('.pitch-speed-btn').forEach(function (b) {
    b.textContent = 'x' + next;
    b.classList.toggle('on', next > 1);
  });
};

// ----- Supertécnicas visibles -----
var MR_ELEM_COLOR = { Fuego: '#ff7a2f', Bosque: '#4cd964', Viento: '#5ac8fa', 'Montaña': '#d19a55' };
// Técnica del tipo pedido ('tiro', 'portero'...) del jugador, mirando su
// ficha del roster (los clones de los modos no siempre la copian). En Tú
// decides, con live y side, se saltan las que aún están recargando.
// Todas las técnicas de ese tipo que el jugador puede usar ahora (Tú
// decides deja elegir entre ellas, ver decideSuperOptions).
function mrTechList(player, kind, live, side) {
  if (!player) return [];
  var src = player.id ? ROSTER.find(function (p) { return p.id === player.id; }) : null;
  var list = matchTechsOf(player);
  list = list.filter(function (h) { return hissatsuTipo(h, player) === kind; });
  if (live && live.decide && side) list = list.filter(function (h) { return !decideTechCooling(live, side, h); });
  var color = MR_ELEM_COLOR[player.tipo || (src && src.tipo)] || '#ffd166';
  return list.filter(function (h, i) { return list.indexOf(h) === i; }).map(function (h) { return { name: h, color: color }; });
}
function mrTech(player, kind, live, side) {
  if (!player) return null;
  var src = player.id ? ROSTER.find(function (p) { return p.id === player.id; }) : null;
  // Primero la ficha del roster: así las partidas guardadas con nombres
  // antiguos de técnicas salen con el nombre (y el vídeo) actual.
  var list = matchTechsOf(player);
  // Solo las técnicas de ese tipo (una técnica de defensa ya no sale en un tiro).
  list = list.filter(function (h) { return hissatsuTipo(h, player) === kind; });
  if (live && live.decide && side) list = list.filter(function (h) { return !decideTechCooling(live, side, h); });
  if (!list.length) return null;
  // Si alguna tiene vídeo, sale esa (así se ven más los vídeos).
  var withVideo = list.filter(function (h) { return mrTechVideoSrc(h); });
  if (withVideo.length) list = withVideo;
  return { name: list[Math.floor(Math.random() * list.length)], color: MR_ELEM_COLOR[player.tipo || (src && src.tipo)] || '#ffd166' };
}
// Técnicas de regate/defensa: solo si no hay ya otra en pantalla. Con
// vídeo, la jugada se congela igual que en el tiro y la parada; como robos
// y regates pasan mucho, entre dos de estos vídeos hay un respiro para que
// el partido no esté parado a cada rato. En ese rato no se usa: una técnica
// con vídeo siempre sale con su vídeo, nunca solo con el nombre.
var MR_DUEL_VIDEO_GAP_MS = 15000;
function mrMaybeTech(live, d, kind, chance) {
  var cur = live.mr.techLabel;
  if (cur && cur.until > Date.now()) return;
  var tech = mrTech(d.player, kind, live, d.side);
  if (!tech) return;
  // Con vídeo sale al menos la mitad de las veces; si no, se verían poco.
  var video = !!mrTechVideoSrc(tech.name);
  if (video && Date.now() - (live.mr.duelVideoAt || 0) <= MR_DUEL_VIDEO_GAP_MS) return;
  if (Math.random() >= (video ? Math.max(chance, 0.5) : chance)) return;
  if (!mrTechGate(live, d.side, tech)) return;
  if (video) {
    live.mr.duelVideoAt = Date.now();
    mrTechHold(live, tech, d, null);
    return;
  }
  live.mr.techLabel = { text: tech.name, color: tech.color, side: d.side, num: d.num, until: Date.now() + 1500 };
  if (typeof fxHaptic === 'function') fxHaptic('tech');
  d.techGlow = { color: tech.color, until: Date.now() + 1200 };
}
// Fuera de Tú decides, siempre. Dentro, las tuyas solo salen si las eliges
// y las del rival respetan las recargas (ver decideTechTake).
function mrTechGate(live, side, tech) {
  return !live.decide || decideTechTake(live, side, tech);
}
function mrShowTech(live, tech, d) {
  live.mr.techLabel = { text: tech.name, color: tech.color, side: d.side, num: d.num, until: Date.now() + 1500 };
  if (typeof fxHaptic === 'function') fxHaptic('tech');
  d.techGlow = { color: tech.color, until: Date.now() + 1200 };
  mrPlayTechVideo(live, tech, d);
}

// ----- Vídeos de supertécnicas (assets/tecnicas) -----
// Cuando alguien usa una técnica que tiene vídeo, se ve en un recuadro
// dentro del campo mientras el partido sigue. Cada vídeo está dos veces:
// .webm (más ligero) y .mp4 (iPhone/Safari, que no reproduce bien WebM
// VP9). Nombres de archivo sin extensión ni tildes: se buscan sin tildes
// ni mayúsculas y valen también para sus versiones ("Tornado de fuego A").
// Solo están los de técnicas que llevan los jugadores; scripts/
// descargar-tecnicas.py los baja todos y scripts/publicar.js sube estos.
var MR_TECH_VIDEO_FILES = [
  'agujero-blanco', 'agujero-de-gusano', 'agujero-negro', 'agujon-letal', 'aikido', 'arco-iris',
  'astrorremate', 'aullido-de-licantropo', 'baile-de-llamas', 'balon-de-plasma', 'balon-iceberg',
  'barrido-defensivo', 'bloque-de-hielo', 'bola-angelical', 'brisa-deslizante', 'cabezazo-kung-fu',
  'canon-de-meteoritos', 'canon-dragon', 'canon-todopoderoso', 'canonazo-de-fragmentos', 'carga-de-poder',
  'carga-negativa', 'carrera-a-tres-piernas', 'cascabel', 'ceniza-negra', 'chilena-de-pinguino',
  'chut-ancestral', 'ciclon', 'cinto-astral', 'colmillo-de-pantera', 'cortafuegos', 'corte-de-vacio',
  'corte-diabolico', 'corte-giratorio', 'corte-volcan', 'cruz-del-sur', 'cuchilla-asesina',
  'despeje-de-lenador', 'destrozataladros', 'disparo', 'disparo-doble', 'doppelganger', 'el-icaro', 'el-muro',
  'entrada-huracan', 'escaneo-de-ataque', 'espada-de-odin', 'espejismo-de-balon', 'estrella-fugaz',
  'excalibur', 'fenix-oscuro', 'flecha-de-cupido', 'flechas-divinas', 'garra-salvaje', 'giro-de-bobina',
  'giro-de-mono', 'golpe-cataclismo', 'golpe-samba', 'golpe-sobrenatural', 'gran-lobo',
  'granizado-de-fuego-alto', 'gravitacion', 'grumo-pegajoso', 'guardia-del-coliseo', 'juego-de-pies',
  'la-tierro', 'lanza-de-odin', 'lanza-letal', 'lanzallamas', 'lecho-de-rosas', 'llamarada-atomica',
  'lluvia-de-meteoros', 'lluvia-letal', 'magnetism', 'mano-celestial', 'mano-celestial-x', 'martillo-de-roca',
  'mate-salvaje', 'mega-terremoto', 'megalodon', 'mordisco-de-vampiro', 'muralla-gigante', 'muro-de-atlantis',
  'muro-de-hierro', 'niebla-mistica', 'paisaje-helado', 'parada-celestial', 'peces-voladores', 'pentagrama',
  'palmada-nitro', 'pinguino-emperador-7', 'pinguino-emperador-n-3', 'pinguino-emperador-x', 'pinguino-espacial',
  'piroquinetico', 'pisoton-de-sumo', 'puno-cohete', 'rayo-ganimedes', 'red-del-cazador', 'regate-aurora',
  'regate-enganoso', 'remate-dragon', 'remate-gafas', 'remate-guiverno', 'remate-rebotado', 'remate-tsunami',
  'rizo-de-dragon', 'robo-planetario', 'sabiduria-divina', 'super-armadillo', 'supernova', 'telarana',
  'tiro-cometa', 'tiro-congelante', 'tiro-dinamita', 'tiro-fantasma', 'tiro-giratorio', 'tiro-sonico',
  'tiro-supermasivo', 'tornado-de-fuego', 'tornado-oscuro', 'triangulo-z', 'zona-sigma',
  'acelerador-de-carrera', 'acelerrelampago', 'andanada-de-balista', 'arana-gigante', 'arrancada', 'asterocas', 'ataque-de-cuchilla', 'atardecer', 'baile-de-mariposas', 'balon-falso', 'barrera-de-cristal', 'barrida-lateral', 'bateo-total', 'bloque-dureza', 'bloqueo-circense', 'bola-de-tierra', 'bola-diabolica', 'bomba-rebotante', 'bombardero-acrobatico', 'cabezazo-conductor', 'caida-de-tacon', 'carrera-de-perro', 'chasquido-de-latigo', 'clon-falso', 'confusion', 'corre-balon-corre', 'cortador-de-aliento', 'cortar-y-trocear', 'corte-copia', 'corte-torbellino', 'cosecha', 'coz-3', 'danza-del-dios-del-viento', 'dedos-de-gaia', 'defensa-clon', 'desenfunde-rapido', 'deslizamiento-de-porteria', 'deslizamiento-rodante', 'desollador-de-ozono', 'despeje-explosivo', 'doble-ciclon', 'doble-mandibula', 'doble-toque', 'dragon-ascendente', 'dragon-terrestre', 'el-fenix', 'el-final', 'engano-bumeran', 'entrada-de-llamas', 'escudo-corporal', 'esferas-luminosas', 'espiral-de-distorsion', 'estalactita', 'estrella-total', 'explosion-aguila', 'explosion-cosmica', 'finta-del-topo', 'flechas-entropicas', 'fuego-infernal', 'fuerza-torbellino', 'gancho-relampago', 'golpe-de-paladin', 'gran-muralla', 'gran-slam', 'granada-doble', 'guardia-acrobatica', 'imagen-residual', 'impulso-brillante', 'impulso-cruzado', 'impulso-warp', 'lapida', 'llama-veloz', 'llama-zigzag', 'magia', 'magia-negra', 'manos-capaces', 'mina-explosiva', 'niebla-misteriosa', 'ojo-del-ladron', 'ola-fuga', 'oliteral', 'orca-asesina', 'pajaro-de-fuego', 'parada-combustion', 'parada-de-valor-total', 'parada-sombra', 'parador-de-tiros', 'patada-canguro', 'patron-de-bambu', 'payaso-de-rodeo', 'pellizco-de-pinzas', 'picada-del-condor', 'poder-floral', 'prision-de-piedra', 'proyectil-letal', 'puente-a-la-nada', 'punetazo-a-presion', 'puntada-de-sombra', 'remate-combinado', 'remolino', 'revolucion-v', 'robo-helado', 'rodillo-de-tronco', 'rompedor-reflejo', 'ruptura-gaia', 'salto-incandescente', 'salto-lunar', 'sandwich-gigante', 'sello-de-voltereta', 'sin-escape', 'snakebite', 'sorpresa-solar', 'super-pisoton-de-sumo', 'taladro-de-fuego', 'terremoto', 'tiro-de-campanario', 'tiro-de-furia', 'tiro-espejismo', 'tiro-espiral', 'tiro-granada', 'tiro-patriota', 'tiro-pegaso', 'tiro-vendaval', 'tiron-fantasma', 'torbellino-giratorio', 'tormenta-de-carrera', 'tornado-trasero', 'trampolin-relampago', 'trayectoria-optima', 'tren-de-cuernos', 'tren-desbocado', 'triangulo-letal', 'truco-del-balon-grande', 'ultra-luna', 'ultrasonico', 'valor-pesado', 'velo-de-agua', 'velo-de-llamas', 'ventisca-eterna', 'visto-y-no-visto', 'zona-perimetral',
  // Vídeos que ya estaban descargados y no se usaban
  'acelerador-de-particulas', 'acrobotica', 'amanecer', 'amplificador-magico', 'angel-de-nieve', 'arco-psiquico',
  'asteride', 'ataque-meteoro', 'aullido-de-lobo', 'baile-aereo', 'bajo-minero', 'bala-de-arcabuz',
  'barrera-de-coral', 'barrida-dramatica', 'big-bang', 'bloqueo-holografico', 'bloqueo-telequinetico',
  'bobina-tesla', 'bofeton-latigo', 'bomba-ardiente', 'brisa-puntiaguda', 'bucle-de-aro', 'buzo-profundo',
  'cabeza-de-guerra', 'cabezazo-gigaton', 'cabezazo-volcan', 'caida-superrelampago', 'campo-de-fuerza-defensivo', 'carrera-del-esfuerzo',
  'carrera-vendaval', 'cascada', 'cataratas-del-niagara', 'ciclon-oscuro', 'codo-amenazador', 'contraataque-directo',
  'contraataque-golondrina', 'contraataque-halcon', 'corte-de-guadana-bajo', 'corte-de-guadana-central', 'corte-de-plasma', 'corte-z',
  'cortina-aurora', 'cruz-creciente', 'cyber-realm', 'defensa-panqueque', 'deriva-del-desierto', 'derrape',
  'descenso-estelar', 'desfiladero-okehazama', 'desfile-del-pinguino-real', 'despeje-virtual', 'despliegue-de-senuelos', 'destello-de-fuerza',
  'diluvio-dimensional', 'dispositivo-transportador', 'divisor-de-sol', 'doble-cohete', 'doble-tiro-de-furia', 'doble-tornado',
  'double-helix', 'eclispe-lunar', 'ecuacion-defensiva', 'engranajes-aceleradores', 'entrecruzado', 'escudo-de-poder',
  'espada-de-atlas', 'estrella-de-energia-oscura', 'explosion-de-arena', 'explosion-de-bungee', 'explosion-del-desierto', 'explosion-tramposa',
  'fiebre-del-oro', 'fiesta-floral', 'finta-del-matador', 'finura-helada', 'flechas-huracan', 'flujo-hidraulico',
  'formacion-defensiva', 'formateo-de-disco', 'formula-de-bloqueo', 'fortaleza-nocturna', 'fuego-rapido', 'fuerza-de-colmillo',
  'garra-de-fuerza', 'giro-y-golpe', 'golpe-de-soles-gemelos', 'golpe-saltarin', 'gran-explosion', 'gran-minero',
  'gran-resplandor', 'gravity-dune', 'grito-del-eden', 'himno-de-atenea', 'huracan-blanco', 'impedancia-electrica',
  'impulso-del-equipo-definitivo', 'impulso-del-tigre', 'impulso-solucion', 'impulso-unicornio', 'jabalina-de-polvo', 'jungla-profunda',
  'la-fortaleza', 'la-montana', 'la-torre', 'latido-amplificado', 'leon-devordor', 'leopardo-de-ventisca',
  'lijadora-rotativa', 'luz-del-mariscal', 'maestro-del-giro', 'magmire', 'mano-demoniaca', 'marlin-volador',
  'martillo-metalico', 'mate-del-dragon', 'mira-bola-de-arroz', 'mirada-al-futuro', 'mirada-amenazante', 'mirada-fantasmal',
  'muralla-de-escudos', 'muro-tsunami', 'niebla-oscura', 'niebla-venenosa', 'ojo-del-huracan',
  'ojo-matriz', 'palo-del-valor', 'parada-tornado', 'parador-de-pisotones', 'pase-doble', 'patada-de-tacon',
  'patada-rodante', 'patada-tarzan', 'pirueta-rascacielos', 'pisoton-vigoroso', 'planeo-impulso', 'planeta-cayendo',
  'polvo-del-sueno', 'portal-espacial', 'porton-del-castillo', 'presa-de-zarcillo', 'prima-donna', 'problema-de-burbujas',
  'puno-ardiente', 'rayo-de-puno', 'rayo-sombra', 'rayos-del-juicio', 'regate-fantasma', 'relampago-volcanico',
  'remate-orbital', 'repelente-fractal', 'ritmo-agresivo', 'robo-sigiloso', 'roca-volcanica', 'rodillo-sagrado',
  'rugido-de-dinosaurio', 'ruta-de-la-seda', 'sacrificio', 'salto-de-champinon', 'silent-inkstroke', 'sprint-ciclon',
  'super-barrida', 'super-elastico', 'tirachinas', 'tiro-clon', 'tiro-de-francotirador', 'tiro-de-seguridad',
  'tiro-del-corazon-real', 'tiro-psiquico', 'tiro-remolino', 'tiro-serpiente', 'tormenta-doble', 'tormenta-tornado-huracan',
  'toro-desbocado', 'tortuga-giratoria', 'trampa-venus', 'triangulo-letal-final', 'triple-amenaza', 'triturador-de-geiser',
  'trueno-celestial', 'tunel-tornado', 'varsovia', 'viaje-aereo', 'vuelo-volcanico', 'electric-trap',
  'canon-x', 'desgaste', 'tiro-fuego-fatuo', 'choque-fotonico', 'gyro-blocker',
  'acorde-difuso', 'alba-oscura', 'arrollador-floral', 'ataque-omega', 'cabezazo-megaton', 'caida-torbellino', 'ciclon-humano', 'circulo-de-espadas', 'colmillo-de-cocodrilo', 'combate-kung-fu', 'cometa-legendario', 'defensa-triple', 'despeje-de-fuego', 'disparo-sagrado', 'escudo-de-fuerza-total', 'fuego-total', 'furia-de-los-elementos', 'giro-atomico', 'golpe-doble', 'gran-tifon', 'jinete-de-la-tormenta', 'la-aurora', 'la-bestia-trueno', 'lluvia-de-azufre', 'mangual-leteal', 'mano-espiritual', 'martillo-de-agujas', 'poder-parkour', 'red-procyon', 'remate-combinado-f', 'remolino-de-hojas', 'ruptura-kabuki', 'ruptura-relampago', 'superremate-rebotado', 'tiro-amasado', 'tormenta-de-fuego', 'tormenta-estelar', 'tornado-de-fuego-dt', 'tornado-dragon', 'torre-perfecta', 'trueno-de-primavera', 'ventisca-de-fuego', 'volteador-de-mesas', 'zero-magnum',
  'puno-ardiente', 'mano-celestial-doble'
];
function mrTechKey(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
// Técnicas que en el juego se escriben distinto que su vídeo.
var MR_TECH_VIDEO_ALIAS = { 'electrotrampa': 'electric-trap',
  // Nombres oficiales de las técnicas que en la web de vídeos se llaman distinto.
  'remate-de-hielo': 'tiro-congelante', 'diluvio-letal': 'lluvia-letal', 'regate-espejismo': 'regate-enganoso', 'despeje-cohete': 'puno-cohete', 'icaro': 'el-icaro', 'fenix': 'el-fenix', 'a-todo-vapor': 'tren-desbocado', 'remate-en-v': 'revolucion-v', 'remate-de-gaia': 'ruptura-gaia', 'tiro-torre-de-osaka': 'tiro-de-campanario', 'aguijones-escarlata': 'flechas-entropicas', 'superaceleracion': 'acelerador-de-carrera', 'robo-veloz': 'desenfunde-rapido', 'embestida': 'tren-de-cuernos', 'gravedad': 'tiron-fantasma', 'maldicion': 'magia-negra', 'apisonadora': 'pisoton-de-sumo', 'finta-boomerang': 'engano-bumeran', 'rompehielos': 'robo-helado', 'copia-y-corta': 'corte-copia', 'espejismo': 'imagen-residual', 'chut-granada': 'tiro-granada', 'remolino-cortante': 'corte-torbellino', 'superbalon-rodante': 'corre-balon-corre', 'disparo-con-rebotes': 'rompedor-reflejo', 'chut-de-los-100-toques': 'tiro-de-furia', 'remate-misil': 'tiro-patriota', 'picadora': 'cortar-y-trocear', 'danza-del-viento': 'danza-del-dios-del-viento', 'ilusion-deslumbrante': 'oliteral', 'rompetiros': 'parador-de-tiros', 'barrera-de-gaia': 'dedos-de-gaia', 'remate-pegaso': 'tiro-pegaso', 'mandril': 'parada-de-valor-total', 'ataque-cortante': 'ataque-de-cuchilla', 'parada-ardiente': 'parada-combustion', 'equilibrismo': 'payaso-de-rodeo', 'despeje-a-presion': 'punetazo-a-presion', 'disparo-cosmico': 'explosion-cosmica', 'truco-de-magia': 'magia', 'tormenta-de-petalos': 'poder-floral', 'regate-multiple': 'clon-falso', 'manos-liberadas': 'manos-capaces', 'remolino-acuatico': 'rodillo-de-tronco', 'pase-cruzado': 'impulso-cruzado', 'teleportacion': 'impulso-warp', 'gravedad-grave': 'valor-pesado', 'cabezazo-catapulta': 'cabezazo-conductor', 'tornado-inverso': 'tornado-trasero', 'gran-seismo': 'terremoto', 'mandibulas-dobles': 'doble-mandibula', 'puente-sin-final': 'puente-a-la-nada', 'proyectil-de-ozono': 'desollador-de-ozono', 'estrella-de-roca': 'asterocas', 'circulo-de-hielo': 'estalactita', 'captura-excelente': 'cortador-de-aliento', 'barreno-de-fuego': 'taladro-de-fuego', 'mirada-ladrona': 'ojo-del-ladron', 'zona-de-seguridad': 'zona-perimetral', 'ataque-de-las-sombras': 'puntada-de-sombra', 'bola-falsa': 'balon-falso', 'torbellino-dragon': 'torbellino-giratorio', 'trama-trama': 'patron-de-bambu', 'regate-topo': 'finta-del-topo', 'tiro-cegador': 'impulso-brillante', 'bomba-geiser': 'velo-de-agua', 'remate-en-espiral': 'tiro-espiral', 'emboscada-defensiva': 'sin-escape', 'voltereta-circense': 'bloqueo-circense', 'carrera-relampago': 'acelerrelampago', 'entrada-rodante': 'deslizamiento-rodante', 'remate-del-aguila': 'explosion-aguila', 'pantalla-ignea': 'velo-de-llamas', 'luna-creciente': 'salto-lunar', 'dientes-de-roca': 'lapida', 'estela-ignea': 'llama-veloz', 'entrada-tormenta': 'tormenta-de-carrera', 'zigzag-de-fuego': 'llama-zigzag', 'balon-galgo': 'carrera-de-perro', 'llamarada-infernal': 'fuego-infernal', 'ataque-de-condor': 'picada-del-condor', 'pared-solitaria': 'doble-toque', 'jaula-de-piedra': 'prision-de-piedra', 'segadora': 'cosecha', 'ciclon-doble': 'doble-ciclon', 'bomba-acrobatica': 'bombardero-acrobatico', 'el-olvido': 'el-final', 'balon-diabolico': 'bola-diabolica', 'ultra-lunar': 'ultra-luna', 'ataque-de-paladin': 'golpe-de-paladin', 'golpes-de-luz': 'gancho-relampago', 'ultrasonidos': 'ultrasonico', 'carga-de-elefantes': 'sandwich-gigante', 'ataque-de-la-ballena': 'orca-asesina', 'la-niebla': 'niebla-misteriosa', 'bomba-saltarina': 'bomba-rebotante', 'despeje-de-fuerza': 'despeje-explosivo', 'gran-torbellino': 'remolino', 'trayectoria-perfecta': 'trayectoria-optima', 'punos-certeros': 'chasquido-de-latigo', 'truco-balonazo': 'truco-del-balon-grande', 'rodillazos-atomicos': 'gran-slam', 'la-gran-muralla': 'gran-muralla', 'campo-torbellino': 'fuerza-torbellino', 'mina-terrestre': 'mina-explosiva', 'pinzas-cortantes': 'pellizco-de-pinzas', 'presa-de-sombras': 'parada-sombra', 'mordisco-de-serpiente': 'snakebite', 'luz-cegadora': 'sorpresa-solar', 'trance-melodico': 'ola-fuga', 'estrella-reflectante': 'estrella-total', 'tiro-balista': 'andanada-de-balista', 'salto-dimensional': 'barrida-lateral', 'parada-en-pirueta': 'sello-de-voltereta',
  'rechace-de-fuego': 'palmada-nitro',
  'astro-remate': 'astrorremate', 'giro-bobina': 'giro-de-bobina', 'golpe-de-samba': 'golpe-samba',
  'rayo-de-ganimedes': 'rayo-ganimedes', 'superarmadillo': 'super-armadillo', 'tiro-del-cometa': 'tiro-cometa',
  'aguijon-letal': 'agujon-letal', 'chut-ancestal': 'chut-ancestral', 'cortefuegos': 'cortafuegos',
  'escaner-ataque': 'escaneo-de-ataque', 'flecha-divina': 'flechas-divinas', 'la-tierra': 'la-tierro',
  'magnetismo': 'magnetism', 'canon-de-fragmentos': 'canonazo-de-fragmentos', 'pinguino-emperador-n-7': 'pinguino-emperador-7',
  'corte-volcanico': 'corte-volcan', 'muralla-de-atlantis': 'muro-de-atlantis',
  'grumo-pegapasta': 'grumo-pegajoso', 'red-de-caza': 'red-del-cazador', 'piroquinesis': 'piroquinetico',
  'martillo-rocoso': 'martillo-de-roca', 'juego-de-piernas': 'juego-de-pies',
  'carga-poderosa': 'carga-de-poder', 'robo-planeta': 'robo-planetario', 'balon-angelical': 'bola-angelical',
  'chut-congelante': 'tiro-congelante', 'tiro-sobrenatural': 'golpe-sobrenatural',
  'disparo-dual': 'disparo-doble', 'remate-arcoiris': 'arco-iris', 'vuelo-de-icaro': 'el-icaro',
  'granizado-de-fuego': 'granizado-de-fuego-alto',
  'pinguino-emperador-iii': 'pinguino-emperador-n-3',
  // Nombres de la wiki en español con el vídeo de su técnica (por su nombre japonés)
  'remate-del-tigre': 'impulso-del-tigre', 'escudo-de-fuerza': 'escudo-de-poder', 'golpe-de-vacio': 'corte-de-vacio', 'disparo-rodante': 'patada-rodante',
  'torre-inexpugnable': 'la-torre', 'remate-unicornio': 'impulso-unicornio', 'engano-torero': 'finta-del-matador', 'remate-tarzan': 'patada-tarzan',
  'disparo-x': 'canon-x', 'parada-en-plancha': 'golpe-saltarin', 'parada-mate': 'mate-salvaje', 'canonazo': 'disparo',
  'remate-multiple': 'tiro-clon', 'bola-de-fango': 'bola-de-tierra', 'canon-celestial': 'canon-todopoderoso', 'combustion': 'desgaste',
  'tiro-espectral': 'tiro-fuego-fatuo', 'arcoiris-luminoso': 'arco-iris', 'placaje-extremo': 'carga-de-poder', 'flash-de-fotones': 'choque-fotonico',
  'maza-rocosa': 'martillo-de-roca', 'patin-aereo': 'viaje-aereo', 'tacon-infernal': 'caida-de-tacon', 'giroparada': 'gyro-blocker',
  'bobina-electrica': 'bobina-tesla', 'barrena-voladora': 'derrape', 'defensa-multiple': 'defensa-clon', 'caida-a-los-infiernos': 'atardecer',
  'defensa-propulsada': 'defensa-panqueque', 'fuerza-centrifuga': 'sprint-ciclon', 'cruce-explosivo': 'entrecruzado', 'despeje-explosivo': 'puno-ardiente', 'bimano-celestial': 'mano-celestial-doble',
  'cabezazo-cohete': 'cabeza-de-guerra', 'corte-magico': 'portal-espacial', 'leopardo-de-la-ventisca': 'leopardo-de-ventisca', 'gran-barrera-de-coral': 'barrera-de-coral',
  'aplastamiento': 'parador-de-pisotones', 'tiro-rotativo': 'maestro-del-giro', 'salto-explosivo': 'explosion-de-bungee', 'caida-planetaria': 'planeta-cayendo',
  'ataque-de-garza': 'contraataque-golondrina', 'estrella-oscura': 'estrella-de-energia-oscura', 'corte-de-arena': 'lijadora-rotativa', 'doble-helice': 'double-helix',
  'presa-fractal': 'repelente-fractal', 'robo-fantastico': 'super-barrida', 'el-ojo-del-huracan': 'ojo-del-huracan', 'campo-minado': 'acelerador-de-particulas',
  'rematerializacion': 'dispositivo-transportador', 'tormenta-dimensional': 'diluvio-dimensional', 'onda-chispeante': 'asteride', 'pasos-aereos': 'baile-aereo',
  'avance-chispeante': 'corte-de-plasma', 'acrobacia-robotica': 'acrobotica', 'doble-trallazo-planetario': 'golpe-de-soles-gemelos', 'despeje-medialuna': 'cruz-creciente',
  'muralla-de-las-montanas': 'desfiladero-okehazama', 'tiro-de-arcabuz': 'bala-de-arcabuz', 'ciclon-blanco': 'huracan-blanco', 'obstruccion-electrica': 'impedancia-electrica',
  'salto-champinon': 'salto-de-champinon', 'trampa-vegetal': 'trampa-venus', 'regate-en-z': 'corte-z', 'cabezazo-volcanico': 'cabezazo-volcan',
  'lecho-de-lava': 'magmire', 'bolea-ignea': 'bomba-ardiente', 'viento-celestial': 'rodillo-sagrado', 'defensa-holografica': 'bloqueo-holografico',
  'rayo-del-juicio': 'rayos-del-juicio', 'ofensiva-danzarina': 'juego-de-pies', 'misil-arenoso': 'jabalina-de-polvo', 'excavacion': 'gran-minero',
  'puno-de-arena': 'explosion-de-arena', 'tuneladora': 'bajo-minero', 'tiro-efervescente': 'problema-de-burbujas', 'gran-catarata': 'cascada',
  'chorro-rebotante': 'flujo-hidraulico', 'zarpazo-poderoso': 'garra-de-fuerza', 'olor-embriagador': 'polvo-del-sueno', 'tiro-pirueta': 'patada-de-tacon',
  'tiro-elefante': 'fuerza-de-colmillo', 'siega-central': 'corte-de-guadana-central', 'parada-de-codo': 'codo-amenazador', 'la-fiebre-del-oro': 'fiebre-del-oro',
  'despeje-retorcido': 'giro-y-golpe', 'defensa-radial': 'varsovia', 'tormenta-de-arena': 'explosion-del-desierto', 'deriva-desertica': 'deriva-del-desierto',
  'balon-de-petroleo': 'triturador-de-geiser', 'subida-a-los-cielos': 'amanecer', 'potenciacion': 'planeo-impulso', 'ataque-meteorito': 'ataque-meteoro',
  'duo-magma': 'tormenta-doble', 'chut-de-los-200-toques': 'doble-tiro-de-furia', 'muralla-tsunami': 'muro-tsunami',
  'psicorremate': 'tiro-psiquico', 'flecha-huracan': 'flechas-huracan', 'niebla-sombria': 'niebla-oscura', 'supertrampolin-relampago': 'caida-superrelampago',
  'tornado-doble': 'doble-tornado', 'formula-matematica': 'formula-de-bloqueo', 'golf-total': 'palo-del-valor', 'remate-dinosaurio': 'rugido-de-dinosaurio',
  'mano-diabolica': 'mano-demoniaca', 'lluvia-oscura': 'rayo-sombra', 'avance-flamigero': 'carrera-vendaval', 'punos-voladores': 'doble-cohete',
  'contra': 'contraataque-directo', 'duna-gravitacional': 'gravity-dune', 'espada-solar': 'divisor-de-sol', 'desfile-de-pinguinos': 'desfile-del-pinguino-real',
  'el-fuerte': 'la-fortaleza', 'tiro-tramposo': 'explosion-tramposa', 'extramundo': 'cyber-realm', 'remate-de-seguridad': 'tiro-de-seguridad',
  'mirada-asesina': 'mirada-fantasmal', 'pincelada-silenciosa': 'silent-inkstroke', 'regate-fantasmal': 'regate-fantasma', 'vision-de-matriz': 'ojo-matriz',
  'robo-teatral': 'barrida-dramatica', 'hala-una-bola-de-arroz': 'mira-bola-de-arroz', 'ritmo-electrico': 'latido-amplificado', 'circulo-elegante': 'finura-helada',
  'impulso-de-resolucion': 'impulso-solucion', 'brisa-de-la-cuspide': 'brisa-puntiaguda', 'tortuga-danzarina': 'tortuga-giratoria', 'contragolpe-de-halcon': 'contraataque-halcon',
  'tiro-rotatorio': 'tiro-remolino', 'maza-metalica': 'martillo-metalico', 'aro-hula-hoop': 'bucle-de-aro', 'toro-a-la-fuga': 'toro-desbocado'
};
// Primero el nombre tal cual; si no, sin la versión del final ("V2",
// "A"...), así "Tornado de fuego A" usa el de Tornado de fuego. La "X" no
// cuenta como versión: es parte del nombre (Disparo X, Mano celestial X) y
// quitándola salía el vídeo de otra técnica.
function mrTechVideoSrc(name) {
  var k = mrTechKey(name);
  var v = k.match(/^(.+)-(v\d+|[a-wyz]|\d+)$/);
  var keys = v ? [k, v[1]] : [k];
  for (var i = 0; i < keys.length; i++) {
    var f = MR_TECH_VIDEO_ALIAS[keys[i]] || keys[i];
    if (MR_TECH_VIDEO_FILES.indexOf(f) !== -1) return 'https://inazumarun.es/assets/tecnicas/' + f;
  }
  return null;
}
// Un solo recuadro para todo el partido; los <video> se guardan por
// archivo para no volver a descargarlos.
// El recuadro no va dentro del campo sino en un marco fijo sobre la
// página que se coloca encima del campo en cada fotograma: Safari de
// iPhone no pinta vídeos dentro de cajas recortadas y transformadas como
// la tarjeta del campo (se veía negro o nada en vertical).
// En ordenador (Chrome, Brave, Edge...) el <video> no va en la página: se
// reproduce aparte y cada fotograma se copia a un <canvas>. Esos
// navegadores pintan los <video> visibles con la tarjeta gráfica y, al
// ocultarlos al acabar la técnica, a veces se veía un pantallazo blanco
// en toda la página. En iPhone/Safari (sin WebM) se queda el <video>.
var _mrVid = { frame: null, panel: null, cap: null, videos: {}, cur: null, queue: null, canvas: null };
function mrVidUseCanvas() {
  if (_mrVid.useCanvas === undefined) {
    var t = document.createElement('video');
    _mrVid.useCanvas = t.canPlayType('video/webm; codecs="vp9, opus"') === 'probably' && !!document.createElement('canvas').getContext;
  }
  return _mrVid.useCanvas;
}
// Pinta mientras ESTE vídeo sea el que se enseña (mrVidEnded/mrVidStop
// quitan _mrVid.cur y el bucle se corta solo). Antes se paraba con
// v.ended, y la segunda vez que salía la misma técnica el vídeo aún
// seguía "terminado" de la vez anterior al arrancar el bucle: se cortaba
// en el primer fotograma y el panel se quedaba en negro.
function mrVidDraw(v) {
  var c = _mrVid.canvas;
  if (!c || !_mrVid.cur || _mrVid.cur.video !== v) { v._mrDrawing = false; return; }
  if (v.videoWidth && (c.width !== v.videoWidth || c.height !== v.videoHeight)) { c.width = v.videoWidth; c.height = v.videoHeight; }
  if (v.readyState >= 2 && !v.seeking) c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  requestAnimationFrame(function () { mrVidDraw(v); });
}
function mrVidPanel() {
  if (_mrVid.panel) return _mrVid.panel;
  var frame = document.createElement('div');
  frame.className = 'pitch-tech-video-frame';
  var panel = document.createElement('div');
  panel.className = 'pitch-tech-video';
  var cap = document.createElement('div');
  cap.className = 'pitch-tech-video-cap';
  if (mrVidUseCanvas()) {
    var canvas = document.createElement('canvas');
    canvas.className = 'pitch-tech-canvas';
    canvas.width = 640; canvas.height = 360;
    panel.appendChild(canvas);
    _mrVid.canvas = canvas;
  }
  panel.appendChild(cap);
  frame.appendChild(panel);
  _mrVid.frame = frame; _mrVid.panel = panel; _mrVid.cap = cap;
  return panel;
}
// WebM solo si el navegador lo reproduce seguro; si no, o si falla al
// cargar, MP4.
// Memoria: en el iPhone (sin WebM, el <video> va en la página) cada vídeo
// cargado ocupa mucho y Safari cerraba la pestaña ("ha generado problemas
// repetidamente") tras varios vídeos seguidos. Por eso hay un tope de vídeos
// en memoria (los más antiguos se liberan) y al acabar el partido se sueltan
// todos (mrVidReleaseAll).
function mrVidLowMem() {
  if (_mrVid.lowMem === undefined) {
    var coarse = false;
    try { coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches; } catch (e) {}
    var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    _mrVid.lowMem = !mrVidUseCanvas() || ios || coarse || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  }
  return _mrVid.lowMem;
}
function mrVidMax() { return mrVidLowMem() ? 3 : 8; }
function mrVidFree(v) {
  try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {}
  if (v.parentNode) v.parentNode.removeChild(v);
}
function mrVidTrim(keep) {
  var order = _mrVid.order || (_mrVid.order = []);
  while (order.length > mrVidMax()) {
    var idx = order.findIndex(function (k) { var o = _mrVid.videos[k]; return o && o !== keep && !(_mrVid.cur && _mrVid.cur.video === o); });
    if (idx < 0) break;
    var key = order.splice(idx, 1)[0];
    mrVidFree(_mrVid.videos[key]);
    delete _mrVid.videos[key];
  }
}
function mrVidReleaseAll() {
  _mrVid.queue = null;
  _mrVid.cur = null;
  Object.keys(_mrVid.videos).forEach(function (k) { mrVidFree(_mrVid.videos[k]); });
  _mrVid.videos = {};
  _mrVid.order = [];
  if (_mrVid.panel) _mrVid.panel.classList.remove('on');
}
function mrVidElement(src) {
  var order = _mrVid.order || (_mrVid.order = []);
  if (_mrVid.videos[src]) {
    var at = order.indexOf(src);
    if (at >= 0) order.splice(at, 1);
    order.push(src);
    return _mrVid.videos[src];
  }
  var v = document.createElement('video');
  v.preload = mrVidLowMem() ? 'metadata' : 'auto'; v.muted = true; v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.setAttribute('webkit-playsinline', '');
  var webm = v.canPlayType('video/webm; codecs="vp9, opus"') === 'probably';
  v.src = src + (webm ? '.webm' : '.mp4');
  v.addEventListener('ended', mrVidEnded);
  v.addEventListener('error', function () {
    if (/\.webm$/.test(v.src)) {
      var wasOn = _mrVid.cur && _mrVid.cur.video === v;
      v.src = src + '.mp4';
      v.load();
      if (wasOn) v.play().catch(function () { v.muted = true; v.play().catch(function () {}); });
      return;
    }
    mrVidEnded();
  });
  _mrVid.videos[src] = v;
  order.push(src);
  mrVidTrim(v);
  return v;
}
// Al empezar el partido se precargan los vídeos de las técnicas de los 22
// (en ordenador). En el iPhone no: se cargan al ir a verse, por memoria.
function mrVidPreload(live) {
  if (mrVidLowMem()) return;
  ['me', 'opp'].forEach(function (side) {
    live.dotsState[side].forEach(function (d) {
      var src = d.player && d.player.id ? ROSTER.find(function (p) { return p.id === d.player.id; }) : null;
      var list = (d.player && d.player.hissatsu && d.player.hissatsu.length ? d.player.hissatsu : (src && src.hissatsu)) || [];
      list.forEach(function (h) { var vs = mrTechVideoSrc(h); if (vs) mrVidElement(vs).load(); });
    });
  });
}
function mrVidRate() { return Math.min(G.matchSpeed || 1, 2); }
function mrPlayTechVideo(live, tech, d) {
  var src = mrTechVideoSrc(tech.name);
  if (!src) return;
  var cur = _mrVid.cur;
  // Si otro vídeo va por la mitad (el tiro y justo después la parada), este
  // espera a que acabe; si el anterior ya casi termina, lo sustituye.
  if (cur && !cur.video.ended && cur.video.duration && cur.video.currentTime < cur.video.duration * 0.6) {
    _mrVid.queue = { live: live, tech: tech, side: d.side, num: d.num, player: d.player, at: Date.now() };
    return;
  }
  mrVidStart(live, src, tech, d);
}
function mrVidStart(live, src, tech, who) {
  var player = who.player;
  var panel = mrVidPanel();
  var v = mrVidElement(src);
  if (_mrVid.cur && _mrVid.cur.video !== v) _mrVid.cur.video.pause();
  Object.keys(_mrVid.videos).forEach(function (k) { var o = _mrVid.videos[k]; if (o !== v && o.parentNode) o.parentNode.removeChild(o); });
  if (_mrVid.canvas) {
    var ctx = _mrVid.canvas.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, _mrVid.canvas.width, _mrVid.canvas.height);
  } else if (v.parentNode !== panel) panel.insertBefore(v, _mrVid.cap);
  _mrVid.cap.textContent = tech.name + (player && player.nombre ? ' · ' + player.nombre : '');
  panel.style.setProperty('--tech', tech.color);
  // En la mitad del campo contraria a quien hace la técnica, para no tapar la jugada.
  var at = mrDot(live, who) || live.mr.ball;
  var bl = mrToPct(at.x, at.y).l;
  if (mrFlip(live)) bl = 100 - bl;
  panel.classList.toggle('pitch-tech-video-left', bl >= 50);
  _mrVid.cur = { video: v, live: live };
  try { v.currentTime = 0; } catch (e) {}
  if (_mrVid.canvas && !v._mrDrawing) { v._mrDrawing = true; mrVidDraw(v); }
  v.playbackRate = mrVidRate();
  v.muted = !(typeof soundEnabled === 'function' && soundEnabled());
  var p = v.play();
  // Sin permiso para sonar, se ve sin sonido.
  if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
  panel.classList.add('on');
}
function mrVidEnded() {
  var hold = _mrLive && _mrLive.mr && _mrLive.mr.techHold;
  if (hold) hold.videoDone = true;
  var q = _mrVid.queue;
  _mrVid.queue = null;
  if (q && Date.now() - q.at < 7000 && q.live === _mrLive && !q.live.done) {
    mrVidStart(q.live, mrTechVideoSrc(q.tech.name), q.tech, q);
    return;
  }
  _mrVid.cur = null;
  if (_mrVid.panel) _mrVid.panel.classList.remove('on');
}
function mrVidStop() {
  _mrVid.queue = null;
  if (_mrVid.cur) _mrVid.cur.video.pause();
  _mrVid.cur = null;
  if (_mrVid.panel) _mrVid.panel.classList.remove('on');
}
// Cada fotograma: el marco se coloca justo encima del campo actual (también
// en pantalla completa) y el vídeo va a la velocidad del partido.
function mrVidSync(field) {
  var frame = _mrVid.frame;
  if (!frame) return;
  if (frame.parentNode !== document.body) document.body.appendChild(frame);
  var r = field.getBoundingClientRect();
  var st = frame.style;
  st.left = r.left + 'px'; st.top = r.top + 'px'; st.width = r.width + 'px'; st.height = r.height + 'px';
  frame.classList.toggle('pitch-tech-video-frame-expanded', field.classList.contains('pitch-expanded'));
  if (_mrVid.cur && _mrVid.cur.video.playbackRate !== mrVidRate()) _mrVid.cur.video.playbackRate = mrVidRate();
}

// ----- Técnica con vídeo: primero la técnica, luego el tiro o la parada -----
// La jugada se congela (reloj y jugadores quietos) mientras se ve el vídeo
// y al acabar sigue con lo que tocaba (then). Si el vídeo no arranca,
// sigue igual a los pocos segundos.
var MR_TECH_HOLD_MAX_MS = 9000;
function mrTechHold(live, tech, d, then) {
  var now = Date.now();
  live.mr.techLabel = { text: tech.name, color: tech.color, side: d.side, num: d.num, until: now + MR_TECH_HOLD_MAX_MS };
  if (typeof fxHaptic === 'function') fxHaptic('tech');
  d.techGlow = { color: tech.color, until: now + MR_TECH_HOLD_MAX_MS };
  live.mr.techHold = { at: now, videoDone: false, then: then, who: { side: d.side, num: d.num } };
  _mrVid.queue = null;
  mrVidStart(live, mrTechVideoSrc(tech.name), tech, d);
}
// true mientras la jugada siga congelada.
function mrTechHoldStep(live) {
  var h = live.mr.techHold;
  var el = Date.now() - h.at;
  var v = _mrVid.cur && _mrVid.cur.video;
  // Si el vídeo aún se está descargando (móvil con poca cobertura), se le
  // espera más antes de darlo por perdido y dejar solo el nombre.
  var stuck = el > 2000 && (!v || (v.paused && v.currentTime < 0.1 && (v.readyState >= 2 || el > 6500)));
  if (!((h.videoDone && el >= 800) || stuck || el >= MR_TECH_HOLD_MAX_MS)) return true;
  live.mr.techHold = null;
  var now = Date.now();
  if (live.mr.techLabel) live.mr.techLabel.until = now + 500;
  var d = mrDot(live, h.who);
  if (d && d.techGlow) d.techGlow.until = now + 400;
  if (stuck) mrVidStop();
  if (h.then) h.then();
  return false;
}
// En Partido rápido no juegas con ninguno: dice de quién es el gol.
function mrGoalText(live) {
  if (live.isQuick) return '¡Gol de ' + escapeHtml(live.lastGoalSide === 'me' ? live.youName : live.oppSide.name) + '! ⚽';
  return live.lastGoalSide === 'me' ? '¡GOOOL! ⚽' : 'Gol rival ⚽';
}
function mrOverlayHtml(live) {
  if (live.phase === 'penalties') return mrPenBoardHtml(live);
  if (live.phase === 'goal') return '<div class="pitch-goal-flash pitch-goal-flash-' + live.lastGoalSide + '">' + mrGoalText(live) + '</div>';
  if (live.phase === 'halftime') return futDraftHalfTimeHtml(live);
  if (live.subIn && live.subIn.done && Date.now() < (live.subFlashUntil || 0)) return '<div class="pitch-goal-flash pitch-sub-flash">🔄 Entra ' + escapeHtml(live.subIn.player.nombre) + '</div>';
  return '';
}
function futDraftRtDraw(live) {
  var field = document.querySelector('.pitch-dots-field');
  if (!field) return;
  if (!_mrDom || _mrDom.field !== field) {
    var dots = {};
    field.querySelectorAll('[data-dot]').forEach(function (el) { dots[el.getAttribute('data-dot')] = el; });
    _mrDom = { field: field, dots: dots, ball: field.querySelector('.pitch-ball-wrap'), ballInner: field.querySelector('.pitch-ball'), chip: field.querySelector('.pitch-minute-chip'), overlay: field.querySelector('.pitch-overlay'), phase: null, cards: -1, minuteText: '' };
    field.classList.add('pitch-rt');
    // Estela del balón (supertécnica), nombre de la técnica y nombre del
    // que lleva el balón: se crean una vez y luego solo se mueven.
    _mrDom.trail = [];
    for (var ti = 0; ti < 9; ti++) {
      var tEl = document.createElement('div');
      tEl.className = 'pitch-trail';
      field.appendChild(tEl);
      _mrDom.trail.push(tEl);
    }
    _mrDom.tech = document.createElement('div');
    _mrDom.tech.className = 'pitch-tech-label';
    field.appendChild(_mrDom.tech);
    _mrDom.carrier = document.createElement('div');
    _mrDom.carrier.className = 'pitch-carrier-name';
    field.appendChild(_mrDom.carrier);
    _mrDom.trailPts = [];
  }
  var dom = _mrDom;
  mrVidSync(field);
  var flip = mrFlip(live);
  var b = live.mr.ball;
  var owner = b.mode === 'owned' ? b.owner : null;
  var now = Date.now();
  function screenPos(x, y) { var q = mrToPct(x, y); return { l: flip ? 100 - q.l : q.l, t: q.t }; }
  ['me', 'opp'].forEach(function (side) {
    live.dotsState[side].forEach(function (d) {
      var el = dom.dots[side + d.num];
      if (!el) return;
      var p = mrToPct(d.x, d.y);
      el.style.left = (flip ? 100 - p.l : p.l).toFixed(2) + '%';
      el.style.top = p.t.toFixed(2) + '%';
      el.classList.toggle('pitch-dot-active', !!(owner && owner.side === side && owner.num === d.num));
      el.classList.toggle('pitch-dot-off', !!d.off);
      var icon = pitchDotCardIcon(live, side, d);
      if (el.getAttribute('data-card') !== icon) el.setAttribute('data-card', icon);
      var glow = d.techGlow && d.techGlow.until > now ? d.techGlow.color : '';
      if (el.getAttribute('data-glow') !== glow) {
        el.setAttribute('data-glow', glow);
        el.classList.toggle('pitch-dot-tech', !!glow);
        el.style.setProperty('--tech', glow || 'transparent');
      }
    });
  });
  // Estela: últimas posiciones del balón mientras vuela un tiro con técnica.
  // Cada punto se va apagando con el tiempo (dura algo más que el vuelo).
  var TRAIL_MS = 650;
  if (b.mode === 'air' && b.tech) { dom.trailPts.unshift({ x: b.x, y: b.y, t: now }); dom.trailColor = b.tech.color; }
  while (dom.trailPts.length && now - dom.trailPts[dom.trailPts.length - 1].t > TRAIL_MS) dom.trailPts.pop();
  var nPts = dom.trailPts.length;
  dom.trail.forEach(function (el, i) {
    var pt = nPts ? dom.trailPts[Math.min(nPts - 1, Math.round(i * (nPts - 1) / Math.max(1, dom.trail.length - 1)))] : null;
    if (!pt) { if (el.style.opacity !== '0') el.style.opacity = '0'; return; }
    var life = 1 - (now - pt.t) / TRAIL_MS;
    var sp = screenPos(pt.x, pt.y);
    el.style.left = sp.l.toFixed(2) + '%';
    el.style.top = sp.t.toFixed(2) + '%';
    el.style.opacity = Math.max(0, 0.9 * life * (1 - i / (dom.trail.length + 1))).toFixed(2);
    el.style.setProperty('--tech', dom.trailColor || '#fff');
    el.style.transform = 'translate(-50%, -50%) scale(' + Math.max(0.3, 1.1 - i / dom.trail.length).toFixed(2) + ')';
  });
  // Nombre de la técnica, un instante sobre quien la hace.
  var tl = live.mr.techLabel;
  var tDot = tl && tl.until > now ? mrDot(live, tl) : null;
  if (tDot) {
    var tp = screenPos(tDot.x, tDot.y);
    if (dom.tech.textContent !== tl.text) dom.tech.textContent = tl.text;
    dom.tech.style.left = tp.l.toFixed(2) + '%';
    dom.tech.style.top = tp.t.toFixed(2) + '%';
    dom.tech.style.setProperty('--tech', tl.color);
    if (!dom.tech.classList.contains('on')) dom.tech.classList.add('on');
  } else if (dom.tech.classList.contains('on')) dom.tech.classList.remove('on');
  // Nombre del que lleva el balón, pequeño debajo de su punto.
  var carrierDot = live.pen && live.pen.cur ? mrDot(live, live.pen.cur) : (owner && (live.phase === 'play' || live.phase === 'kickoff') ? mrDot(live, owner) : null);
  var carrierName = carrierDot && carrierDot.player ? carrierDot.player.nombre : '';
  if (carrierName && !tDot) {
    var cp = screenPos(carrierDot.x, carrierDot.y);
    if (dom.carrier.textContent !== carrierName) dom.carrier.textContent = carrierName;
    dom.carrier.style.left = cp.l.toFixed(2) + '%';
    dom.carrier.style.top = cp.t.toFixed(2) + '%';
    dom.carrier.classList.toggle('pitch-carrier-opp', carrierDot.side === 'opp');
    if (!dom.carrier.classList.contains('on')) dom.carrier.classList.add('on');
  } else if (dom.carrier.classList.contains('on')) dom.carrier.classList.remove('on');
  if (dom.ball) {
    var bp = mrToPct(b.x, b.y);
    dom.ball.style.left = (flip ? 100 - bp.l : bp.l).toFixed(2) + '%';
    dom.ball.style.top = bp.t.toFixed(2) + '%';
    if (dom.ballInner) dom.ballInner.style.transform = 'translate(-50%, -50%) scale(' + (1 + (b.h || 0) * 0.55).toFixed(3) + ')';
  }
  var txt = futDraftLiveIndicatorText(live);
  if (dom.chip && dom.minuteText !== txt) { dom.chip.textContent = txt; dom.minuteText = txt; }
  var ovSig = live.phase + (live.pen ? '|' + live.pen.sig : '') + (Date.now() < (live.subFlashUntil || 0) ? '|sub' : '');
  if (dom.overlay && dom.phase !== ovSig) { dom.overlay.innerHTML = mrOverlayHtml(live); dom.phase = ovSig; }
  var nums = document.querySelectorAll('.score-num');
  if (nums.length >= 2) {
    var youAreHome = live.youAreHome !== false;
    var a = youAreHome ? live.myGoals : live.oppGoals, c = youAreHome ? live.oppGoals : live.myGoals;
    if (nums[0].textContent !== String(a)) setScoreNum(nums[0], a);
    if (nums[1].textContent !== String(c)) setScoreNum(nums[1], c);
  }
  var timeline = document.querySelector('.futdraft-timeline[data-count]');
  if (timeline && timeline.getAttribute('data-count') !== String(live.revealed.length)) {
    timeline.innerHTML = futDraftLiveLogHtml(live) || '<p class="dim small center-text">Aún no ha pasado nada…</p>';
    timeline.setAttribute('data-count', String(live.revealed.length));
  }
  var cardsN = (live.cards || []).length;
  if (live.statsForceSync || dom.cards !== cardsN) {
    live.statsForceSync = false;
    dom.cards = cardsN;
    var box = document.getElementById('liveStatsBox');
    if (box) box.innerHTML = futDraftMatchStatsHtml(live);
  }
}


// =========================================================================
// TANDA DE PENALTIS EN EL CAMPO (a petición explícita: "que se vean los
// penaltis también... no puede lanzar 2 veces un penalti el mismo"). El
// resultado de cada lanzamiento ya viene decidido (futDraftPenaltyAttempts,
// sin repetir lanzador); aquí solo se escenifica: los jugadores esperan en
// el centro del campo, el lanzador va al punto, el portero se tira y el
// balón entra, lo para o se va fuera. Todos a la misma portería.
// =========================================================================
var MR_PEN_SPOT = { x: MR_W - 11, y: MR_CY };
function mrStartPenalties(live, attempts, onDone) {
  var mr = live.mr;
  live.done = false;
  live.pen = { attempts: attempts, i: 0, my: 0, opp: 0, stage: 'gather', t: 0, cur: null, results: [], onDone: onDone, sig: 0 };
  ['me', 'opp'].forEach(function (s) {
    var outfield = mrActive(live.dotsState[s]).filter(function (d) { return d.line > 0; });
    outfield.forEach(function (d, k) {
      d.penX = MR_W / 2 + (s === 'me' ? -1.6 : 1.6);
      d.penY = 14 + k * (40 / Math.max(1, outfield.length - 1));
    });
    live.dotsState[s].forEach(function (d) { d.diveY = null; });
  });
  mr.ball = { x: mr.ball.x, y: mr.ball.y, mode: 'dead', possSide: 'me' };
  live.phase = 'penalties';
  _mrLive = null;
  futDraftRtStart(live);
}
function mrPenKeeper(live, side) { return live.dotsState[side].find(function (d) { return d.line === 0 && !d.off; }) || null; }
function mrPenDotOf(live, att) {
  var list = live.dotsState[att.side];
  return list.find(function (d) { return !d.off && d.player && att.player && d.player.id === att.player.id; }) || mrActive(list)[0];
}
function mrPenTarget(live, d) {
  var pen = live.pen, att = pen.attempts[pen.i];
  if (pen.cur && d.side === pen.cur.side && d.num === pen.cur.num && (pen.stage === 'walk' || pen.stage === 'aim' || pen.stage === 'shot')) {
    if (pen.stage === 'shot') return { x: MR_PEN_SPOT.x + 0.6, y: MR_CY, speed: 7 };
    return { x: MR_PEN_SPOT.x - 1.4, y: MR_CY, speed: 6 };
  }
  if (d.line === 0) {
    var defending = att ? mrOther(att.side) : 'opp';
    // Desde su propia portería hay casi todo el campo: corre de verdad
    // hasta la línea (antes andaba y la tanda empezaba sin él, bug real).
    var far = Math.abs(d.x - (MR_W - 0.8)) > 6;
    if (d.side === defending) return { x: MR_W - 0.8, y: d.diveY != null ? d.diveY : MR_CY, speed: d.diveY != null ? 12 : (far ? 11 : 5) };
    return { x: MR_W - 16, y: d.side === 'me' ? 8 : 60, speed: far ? 9 : 5 };
  }
  return { x: d.penX, y: d.penY, speed: 5.5 };
}
function mrPenMove(live, dt) {
  ['me', 'opp'].forEach(function (s) {
    mrActive(live.dotsState[s]).forEach(function (d) {
      var tg = mrPenTarget(live, d);
      var dx = tg.x - d.x, dy = tg.y - d.y, dist = Math.hypot(dx, dy);
      var want = dist < 0.2 ? 0 : Math.min(tg.speed, dist * 2.4);
      var dvx = dist ? (dx / dist) * want : 0, dvy = dist ? (dy / dist) * want : 0;
      var acc = Math.min(1, dt * (d.diveY != null ? 10 : 4.5));
      d.vx += (dvx - d.vx) * acc;
      d.vy += (dvy - d.vy) * acc;
      d.x = clamp(d.x + d.vx * dt, 0.2, MR_W - 0.2);
      d.y = clamp(d.y + d.vy * dt, 0.2, MR_H - 0.2);
    });
  });
}
function mrPenStep(live, dt) {
  var pen = live.pen, mr = live.mr, b = mr.ball;
  if (!pen) return;
  pen.t += dt;
  mrPenMove(live, dt);
  // Balón: en el aire vuela a su destino; parado vuelve al punto de penalti.
  if (b.mode === 'air') {
    b.t += dt;
    var k = Math.min(1, b.t / b.dur);
    b.x = b.fromX + (b.toX - b.fromX) * k;
    b.y = b.fromY + (b.toY - b.fromY) * k;
    b.h = 0;
  } else if (pen.stage !== 'result' && pen.stage !== 'end') {
    var bx = MR_PEN_SPOT.x - b.x, by = MR_PEN_SPOT.y - b.y, bd = Math.hypot(bx, by), step = 28 * dt;
    if (bd <= step) { b.x = MR_PEN_SPOT.x; b.y = MR_PEN_SPOT.y; }
    else { b.x += (bx / bd) * step; b.y += (by / bd) * step; }
  }
  var att = pen.attempts[pen.i];
  if (pen.stage === 'gather') { if (pen.t > 2.2) mrPenNext(live); return; }
  if (pen.stage === 'walk') {
    var taker = mrDot(live, pen.cur), keeper = mrPenKeeper(live, mrOther(att.side));
    var keeperIn = !keeper || (Math.abs(keeper.x - (MR_W - 0.8)) < 1.2 && Math.abs(keeper.y - MR_CY) < 1.5);
    // Si algo lo atasca, el portero se coloca en su sitio antes de tirar:
    // nunca se tira con la portería vacía.
    if (keeper && !keeperIn && pen.t > 14) { keeper.x = MR_W - 0.8; keeper.y = MR_CY; keeper.vx = 0; keeper.vy = 0; keeperIn = true; }
    var ready = taker && mrDist(taker, { x: MR_PEN_SPOT.x - 1.4, y: MR_CY }) < 0.6 && mrDist(b, MR_PEN_SPOT) < 0.3 && keeperIn;
    if ((ready && pen.t > 0.8) || (keeperIn && pen.t > 7)) { pen.stage = 'aim'; pen.t = 0; }
    return;
  }
  if (pen.stage === 'aim') { if (pen.t > 0.7) mrPenKick(live, att); return; }
  if (pen.stage === 'shot') {
    if (b.t >= b.dur) {
      if (att.scored) {
        if (att.side === 'me') pen.my++; else pen.opp++;
        if (typeof playGoalSound === 'function') playGoalSound();
      }
      pen.results.push({ side: att.side, scored: att.scored, player: att.player });
      pen.sig++;
      b.mode = 'dead';
      pen.stage = 'result';
      pen.t = 0;
    }
    return;
  }
  if (pen.stage === 'result') {
    if (pen.t > 1.2) {
      ['me', 'opp'].forEach(function (s) { live.dotsState[s].forEach(function (d) { d.diveY = null; }); });
      pen.i++;
      if (pen.i >= pen.attempts.length) { pen.stage = 'end'; pen.t = 0; pen.cur = null; pen.sig++; }
      else mrPenNext(live);
    }
    return;
  }
  if (pen.stage === 'end' && pen.t > 2.6) mrPenFinishNow(live);
}
function mrPenNext(live) {
  var pen = live.pen, att = pen.attempts[pen.i];
  var d = mrPenDotOf(live, att);
  pen.cur = d ? { side: d.side, num: d.num } : null;
  pen.stage = 'walk';
  pen.t = 0;
  pen.sig++;
}
function mrPenKick(live, att) {
  var pen = live.pen, mr = live.mr;
  var keeper = mrPenKeeper(live, mrOther(att.side));
  var dir = Math.random() < 0.5 ? -1 : 1;
  var tx, ty;
  if (att.scored) {
    ty = MR_CY + dir * randf(3.5, 8); tx = MR_W + 0.8;
    if (keeper) keeper.diveY = Math.random() < 0.6 ? MR_CY - dir * rand(3, 7) : MR_CY + dir * rand(1, 3);
  } else if (Math.random() < 0.65) {
    // Parada
    ty = MR_CY + dir * rand(2, 7); tx = MR_W - 1;
    if (keeper) keeper.diveY = ty;
  } else {
    // Fuera
    ty = MR_CY + dir * randf(10.5, 13); tx = MR_W + 2.5;
    if (keeper) keeper.diveY = MR_CY - dir * rand(3, 6);
  }
  // En los penaltis no hay supertécnicas (a petición explícita).
  mr.ball = { mode: 'air', kind: 'shot', x: MR_PEN_SPOT.x, y: MR_PEN_SPOT.y, fromX: MR_PEN_SPOT.x, fromY: MR_PEN_SPOT.y, toX: tx, toY: ty, t: 0, dur: 0.45, h: 0, tech: null, possSide: att.side };
  pen.stage = 'shot';
  pen.t = 0;
}
// Acaba la tanda (sola al terminar, o de golpe con "Saltar simulación").
function mrPenFinishNow(live) {
  var pen = live.pen;
  if (!pen) return;
  var my = 0, opp = 0;
  pen.attempts.forEach(function (a) { if (a.scored) { if (a.side === 'me') my++; else opp++; } });
  live.pen = null;
  live.done = true;
  G.futdraft.lastLiveStats = { cards: live.cards || [], poss_ticks: live.poss_ticks || { me: 0, opp: 0 } };
  pen.onDone({ myGoals: my, oppGoals: opp });
}
// Marcador de la tanda sobre el campo, en el lado contrario a la portería
// donde se tira: un círculo por lanzamiento (verde gol, rojo fallo).
function mrPenBoardHtml(live) {
  var pen = live.pen;
  if (!pen) return '';
  var you = futDraftYouIdentity(live);
  var oppName = live.oppSide.name;
  function row(side, shield, name) {
    var shots = pen.results.filter(function (r) { return r.side === side; });
    var total = Math.max(5, shots.length);
    var dots = '';
    for (var k = 0; k < total; k++) {
      var r = shots[k];
      dots += '<span class="pen-dot' + (r ? (r.scored ? ' pen-dot-goal' : ' pen-dot-miss') : '') + '"></span>';
    }
    return '<div class="pen-row"><img src="' + escapeHtml(shield) + '" alt=""><span class="pen-name">' + escapeHtml(name) + '</span><span class="pen-dots">' + dots + '</span><strong>' + (side === 'me' ? pen.my : pen.opp) + '</strong></div>';
  }
  var rows = live.youAreHome === false
    ? row('opp', teamShieldPath(oppName), oppName) + row('me', you.shield, you.name)
    : row('me', you.shield, you.name) + row('opp', teamShieldPath(oppName), oppName);
  var endMsg = pen.stage === 'end' ? '<div class="pen-end">' + (pen.my > pen.opp ? '¡Ganas la tanda!' : 'Pierdes la tanda') + '</div>' : '';
  return '<div class="pen-board ' + (mrFlip(live) ? 'pen-board-right' : 'pen-board-left') + '"><div class="pen-title">Penaltis</div>' + rows + endMsg + '</div>';
}
