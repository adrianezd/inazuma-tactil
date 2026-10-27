/* ---------------------------------------------------------------------
   PARTIDO TÁCTIL (Inazuma Táctil): el partido se juega con el dedo, en
   vertical, como en los Inazuma Eleven de la DS, con un motor de fútbol
   de verdad por debajo.
   - Desliza desde un jugador tuyo para dibujarle el camino (con balón,
     lo lleva conduciendo).
   - Con balón: toca a un compañero para pasarle, toca un hueco para
     pasar al espacio (de lejos, el pase va por alto) y toca la portería
     (o ¡Tirar!) para chutar.
   - Duelos al chocar con un rival: Regate o Cuerpo atacando, Entrada o
     Bloqueo defendiendo, o una supertécnica si te llegan los PT.
   - Física del balón (rueda, vuela y bota), pases que se pueden cortar
     por el camino, saques de banda, córners, saques de puerta, faltas,
     penaltis, tarjetas y fuera de juego.
   - Jugadores con aceleración y cansancio. La IA defiende en bloque,
     marca al hombre, presiona y hace desmarques al espacio.
   Una sola máquina de estados (T.phase): kickoff, play, whistle,
   setpiece y goal.
   Coordenadas en metros: x de 0 a TC_W (ancho), y de 0 (portería rival,
   arriba) a TC_L (tu portería, abajo). Tú atacas siempre hacia arriba.
   --------------------------------------------------------------------- */
var TC_W = 68, TC_L = 105, TC_GOAL = 7.32, TC_BAR = 2.44, TC_BOX_W = 40.3, TC_BOX_D = 16.5, TC_SIX_W = 18.3, TC_SIX_D = 5.5;
var TC_HALF_SEC = 150, TC_ET_HALF_SEC = 55;
var TC_LINE_F = [0.03, 0.2, 0.39, 0.57];
var TC_VIEW_W = 36;
var TC_GRAV = 9.8, TC_ROLL = 3.1;
var TC_BEATS = { Fuego: 'Bosque', Bosque: 'Viento', Viento: 'Montaña', 'Montaña': 'Fuego' };
var TC_COLORS = { me: '#2f7bff', opp: '#ff3b4e' };
var TC_SHIRT = { me: ['#3d8bff', '#1c4fc4'], opp: ['#ff5a5a', '#b81e2e'] };
var TC_GK_SHIRT = { me: ['#ffb627', '#c77800'], opp: ['#9b6bff', '#5a2fc0'] };
var TC = null;

// Ver partido y Decidir pasan por aquí. El banquillo de Carrera de jugador
// (entras más tarde) y "solo tu jugador" siguen con el motor de siempre.
var _tcOrigRtStart = futDraftRtStart;
futDraftRtStart = function (live) {
  if (live.subIn || live.decideSolo || live.pen) return _tcOrigRtStart(live);
  tcStart(live);
};

/* =========================== Utilidades =========================== */
function tcDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function tcOther(side) { return side === 'me' ? 'opp' : 'me'; }
function tcTeam(side) { return side === 'me' ? TC.me : TC.opp; }
function tcKeeper(side) { return tcTeam(side).find(function (d) { return d.line === 0; }) || tcTeam(side)[0]; }
function tcWorld(side, x, f) { return { x: x, y: side === 'me' ? TC_L * (1 - f) : TC_L * f }; }
function tcF(side, y) { return side === 'me' ? 1 - y / TC_L : y / TC_L; }   // 0 en tu portería, 1 en la del rival
function tcGoalOf(side) { return { x: TC_W / 2, y: side === 'me' ? TC_L : 0 }; } // portería que defiende side
function tcRnd(a, b) { return a + Math.random() * (b - a); }
function tcName(d) { return d.p.nombre; }
function tcImg(p) {
  tcImg._c = tcImg._c || {};
  var key = p.id || p.nombre;
  if (!tcImg._c[key]) {
    var im = new Image();
    im.src = p.sprite || ('https://inazumarun.es/assets/sprites/' + p.id + '.png');
    tcImg._c[key] = im;
  }
  return tcImg._c[key];
}
function tcStatsOf(p, k) {
  var g = function (key) { return (typeof p[key] === 'number' ? p[key] : 65) * k; };
  return { tiro: g('tiro'), pase: g('pase'), def: g('defensa'), esp: g('especial') };
}
function tcAvgScore(list) {
  if (!list.length) return 70;
  return list.reduce(function (s, p) { return s + futDraftPlayerScore(p); }, 0) / list.length;
}
// Supertécnicas de un tipo, con su potencia, elemento y coste en PT.
function tcTechs(d, kind) {
  if (typeof mrTechList !== 'function') return [];
  return mrTechList(d.p, kind).slice(0, 2).map(function (t) {
    var info = typeof techInfo === 'function' ? techInfo(t.name, d.p) : { element: d.p.tipo, power: 55 };
    var pow = typeof techEffectivePower === 'function' ? techEffectivePower(t.name, d.p) : info.power;
    return { name: t.name, color: MR_ELEM_COLOR[info.element] || t.color, element: info.element, power: pow, cost: Math.round(14 + pow * 0.3) };
  });
}
function tcElemBonus(mine, theirs) {
  if (!mine || !theirs) return 0;
  if (TC_BEATS[mine] === theirs) return 10;
  if (TC_BEATS[theirs] === mine) return -6;
  return 0;
}
// Distancia de un punto al segmento a-b y cuánto avanza sobre él (0..1).
function tcSegDist(px, py, ax, ay, bx, by) {
  var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy || 1;
  var u = clamp(((px - ax) * vx + (py - ay) * vy) / l2, 0, 1);
  return { d: Math.hypot(px - (ax + vx * u), py - (ay + vy * u)), u: u };
}
function tcInBox(side, x, y) { // ¿está en el área que defiende side?
  if (Math.abs(x - TC_W / 2) > TC_BOX_W / 2) return false;
  return side === 'me' ? y > TC_L - TC_BOX_D : y < TC_BOX_D;
}
function tcStam(d) { return 0.8 + 0.2 * d.stam; }
function tcAlive(list) { return list.filter(function (d) { return !d.off; }); }

/* ============================ Arranque ============================ */
function tcMakeSide(side, dots, k) {
  return dots.map(function (dd, i) {
    var p = dd.player;
    var st = tcStatsOf(p, k);
    var tpMax = Math.round(70 + (p.especial || 60) * 0.5);
    var quick = clamp((st.esp + st.pase) / 2 - 50, 0, 50) / 50;
    return {
      side: side, p: p, line: dd.line, num: i + 1,
      hx: clamp((dd.hy || 34) / 68, 0.06, 0.94), hf: TC_LINE_F[dd.line] || 0.4,
      x: TC_W / 2, y: TC_L / 2, vx: 0, vy: 0, fx: 0, fy: side === 'me' ? -1 : 1,
      path: null, hold: 0, stun: 0, immune: 0, cd: 0, st: st,
      spd: dd.line === 0 ? 6.6 : 6.9 + quick * 1.9, stam: 1, run: null, anim: Math.random() * 6,
      tp: tpMax, tpMax: tpMax, img: tcImg(p), yellow: 0, off: false, dive: null, slide: 0, kickAnim: 0
    };
  });
}
function tcNewStats() { return { shots: 0, onTarget: 0, corners: 0, fouls: 0, offsides: 0, yellow: 0, red: 0, passes: 0, passOk: 0, saves: 0 }; }
function tcStart(live) {
  if (TC && TC.live === live && !TC.ended) return;
  // Sin guion: el marcador es el que se juega (como en Tú decides).
  if (!live.decide) {
    live.decide = true;
    live.pending = [];
    live.finalMyGoals = live.myGoals || 0;
    live.finalOppGoals = live.oppGoals || 0;
  }
  mrInit(live);
  var meDots = live.dotsState.me.filter(function (d) { return d.player && !d.off; });
  var oppDots = live.dotsState.opp.filter(function (d) { return d.player && !d.off; });
  var meList = meDots.map(function (d) { return d.player; }), oppList = oppDots.map(function (d) { return d.player; });
  var f = G.futdraft || {};
  var myAvg = tcAvgScore(meList), oppAvg = tcAvgScore(oppList);
  var myPow = typeof f.teamScoreOverride === 'number' ? f.teamScoreOverride : myAvg;
  var oppPow = live.effectiveOppPower || (live.oppSide && typeof teamPower === 'function' ? teamPower(live.oppSide) : oppAvg);
  var myK = clamp(myPow / myAvg, 0.88, 1.15), oppK = clamp(oppPow / oppAvg, 0.82, 1.22);
  TC = {
    live: live, me: tcMakeSide('me', meDots, myK), opp: tcMakeSide('opp', oppDots, oppK),
    oppQ: clamp((oppPow - 55) / 40, 0, 1),
    ball: { x: TC_W / 2, y: TC_L / 2, z: 0, vx: 0, vy: 0, vz: 0, owner: null, last: null, kick: null, spin: 0 },
    half: live.inExtraTime ? 3 : 1, t: 0, phase: 'kickoff', phaseT: 1.2, sp: null,
    modal: null, paused: false, video: false, banner: null, cam: { x: TC_W / 2, y: TC_L / 2, z: 1 },
    last: 0, poss: { me: 0, opp: 0 }, shots: { me: 0, opp: 0 }, stats: { me: tcNewStats(), opp: tcNewStats() },
    aiT: 0.6, gkHold: 0, sel: null, drag: null, lastPass: null, ended: false, feed: [], fx: [], net: null, view: null, crowd: 0.2
  };
  tcSetHalfLen();
  if (live.small4) TC.me.concat(TC.opp).forEach(function (d) { d.hf = Math.min(0.62, d.hf * 1.35); });
  tcBuildDom();
  tcKickoff('me', true);
  if (typeof playKickoffSound === 'function') playKickoffSound();
  tcCrowdStart();
  tcSay('¡Empieza el partido!');
  if (!(G.meta && G.meta.tactilHelpSeen)) tcOpenHelp();
  requestAnimationFrame(tcLoop);
}
function tcSetHalfLen() {
  var T = TC;
  var et = T.half >= 3;
  T.halfSec = et ? TC_ET_HALF_SEC : (T.live.small4 ? 100 : TC_HALF_SEC);
  T.halfMin = et ? 15 : (T.live.halfLen || 45);
  T.minBase = T.half === 1 ? 0 : T.half === 2 ? T.halfMin : T.half === 3 ? 90 : 105;
}
function tcMinute() { return Math.min(TC.minBase + TC.halfMin, TC.minBase + Math.floor(TC.t / TC.halfSec * TC.halfMin) + 1); }

function tcKickoff(side, snap) {
  var T = TC;
  ['me', 'opp'].forEach(function (s) {
    tcTeam(s).forEach(function (d) {
      var w = tcWorld(s, TC_W * 0.08 + d.hx * TC_W * 0.84, Math.min(d.hf, 0.44));
      if (d.line === 0) w = tcWorld(s, TC_W / 2, 0.02);
      d.kx = w.x; d.ky = w.y; d.path = null; d.hold = 0; d.stun = 0; d.immune = 0; d.run = null; d.dive = null;
      if (snap) { d.x = w.x; d.y = w.y; d.vx = d.vy = 0; }
    });
  });
  var fw = tcTeam(side).filter(function (d) { return d.line > 0; }).sort(function (a, b) { return b.hf - a.hf || Math.abs(a.hx - 0.5) - Math.abs(b.hx - 0.5); })[0] || tcTeam(side)[0];
  fw.kx = TC_W / 2; fw.ky = TC_L / 2 + (side === 'me' ? 0.8 : -0.8);
  if (snap) { fw.x = fw.kx; fw.y = fw.ky; }
  T.ball = { x: TC_W / 2, y: TC_L / 2, z: 0, vx: 0, vy: 0, vz: 0, owner: fw, last: fw, kick: null, spin: 0 };
  if (side === 'me') T.sel = fw;
  T.phase = 'kickoff';
  T.phaseT = snap ? 1.0 : 2.2;
  T.aiT = 1.2;
  T.sp = null;
  T.msg = side === 'me' ? 'Saque de centro: toca a un compañero para pasar' : 'Saca el rival';
}

/* ======================= Bucle y máquina de estados ======================= */
function tcLoop(ts) {
  if (!TC || TC.ended) return;
  var live = G.futdraft && G.futdraft.live;
  if (G.screen !== 'futdraftLive' || live !== TC.live) { tcTeardown(); return; }
  var dt = TC.last ? Math.min(0.05, (ts - TC.last) / 1000) : 0.016;
  TC.last = ts;
  if (!TC.modal && !TC.paused && !TC.video && !G.confirmLeaveOpen) tcStep(dt);
  tcDraw(dt);
  if (TC && !TC.ended) requestAnimationFrame(tcLoop);
}
function tcStep(dt) {
  var T = TC, b = T.ball;
  if (T.banner && T.banner.until < Date.now()) T.banner = null;
  T.fx = T.fx.filter(function (f) { f.t += dt; return f.t < f.life; });
  if (T.net) { T.net.t += dt; if (T.net.t > 1.4) T.net = null; }
  T.crowd += (tcCrowdTarget() - T.crowd) * Math.min(1, dt * 1.5);
  tcCrowdUpdate();
  if (T.phase === 'kickoff' || T.phase === 'goal' || T.phase === 'whistle') {
    T.phaseT -= dt;
    tcMoveAll(dt, true);
    if (T.phase === 'whistle') tcBallSetPieceHold();
    if (T.phaseT <= 0) tcEndPhase();
    return;
  }
  if (T.phase === 'setpiece') {
    T.t += dt * 0.5;
    T.live.minute = tcMinute();
    tcMoveAll(dt, true);
    tcBallSetPieceHold();
    T.sp.t += dt;
    var wait = T.sp.kind === 'corner' || (T.sp.kind === 'free' && tcDist(T.sp, tcGoalOf('me')) < 32) ? 3.2 : 1.5;
    if (T.sp.side === 'opp' && T.sp.t > wait) tcAiSetPiece();
    else if (T.sp.side === 'me' && T.sp.t > 9) tcAutoSetPiece();
    return;
  }
  T.t += dt;
  T.live.minute = tcMinute();
  if (T.t >= T.halfSec && !(b.kick && b.kick.shot)) { tcHalfEnd(); return; }
  if (b.owner) T.poss[b.owner.side] += dt * 10;
  else if (b.last) T.poss[b.last.side] += dt * 5;
  T.me.concat(T.opp).forEach(function (d) { d.tp = Math.min(d.tpMax, d.tp + dt * 0.35); });
  tcAi(dt);
  tcMoveAll(dt, false);
  tcBall(dt);
  if (T.phase !== 'play') return;
  tcDuels();
}
function tcEndPhase() {
  var T = TC;
  if (T.phase === 'kickoff') { T.phase = 'play'; if (T.ball.owner) T.ball.owner.immune = 2.6; return; }
  if (T.phase === 'goal') {
    if (T.live.firstTo && Math.max(T.live.myGoals, T.live.oppGoals) >= T.live.firstTo) { tcFinish(); return; }
    tcKickoff(T.concede, false);
    return;
  }
  if (T.phase === 'whistle') {
    T.phase = 'setpiece';
    var sp = T.sp;
    sp.taker.x = sp.x; sp.taker.y = sp.y; sp.taker.vx = sp.taker.vy = 0;
    T.ball = { x: sp.x, y: sp.y, z: 0, vx: 0, vy: 0, vz: 0, owner: sp.taker, last: sp.taker, kick: null, spin: 0 };
    if (sp.side === 'me') T.sel = sp.taker;
    if (sp.kind === 'penalty') {
      if (sp.side === 'me') tcOpenShotModal(sp.taker, 11, true);
      else tcRivalShoot(sp.taker, true);
    }
    return;
  }
  T.phase = 'play';
}

/* ============================ Movimiento ============================ */
// Lleva a d hacia (tx, ty) acelerando y frenando como una persona.
function tcSteer(d, tx, ty, urg, dt) {
  var dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy);
  var top = d.spd * tcStam(d) * urg;
  var want = dist < 0.25 ? 0 : Math.min(top, Math.sqrt(2 * 7 * dist));
  var wx = dist > 0.01 ? dx / dist * want : 0, wy = dist > 0.01 ? dy / dist * want : 0;
  var ax = wx - d.vx, ay = wy - d.vy, al = Math.hypot(ax, ay), acc = (want > Math.hypot(d.vx, d.vy) ? 8.5 : 13) * dt;
  if (al > acc) { ax = ax / al * acc; ay = ay / al * acc; }
  d.vx += ax; d.vy += ay;
  d.x += d.vx * dt; d.y += d.vy * dt;
  var sp = Math.hypot(d.vx, d.vy);
  if (sp > 0.4) { d.fx = d.vx / sp; d.fy = d.vy / sp; }
  d.anim += sp * dt * 1.6;
  // cansancio: correr a tope gasta, andar recupera
  var load = sp / 8.5;
  d.stam = clamp(d.stam - dt * (load > 0.7 ? 0.006 * load * load * load * 2 : -0.004), 0, 1);
}
// La línea del fuera de juego para side atacando: el penúltimo rival (en f de side).
function tcOffsideLineF(side) {
  var fs = tcAlive(tcTeam(tcOther(side))).map(function (d) { return tcF(side, d.y); }).sort(function (a, b) { return b - a; });
  return fs.length > 1 ? fs[1] : 0.5;
}
// Posición en el bloque del equipo según dónde esté el balón.
function tcShapeTarget(d, ballPos, attacking) {
  var side = d.side;
  if (d.line === 0) {
    var g = tcGoalOf(side), db = tcDist(ballPos, g);
    var out = db < 20 ? 3 : db < 35 ? 5 : 8;
    var gx = TC_W / 2 + (ballPos.x - TC_W / 2) * (db < 25 ? 0.18 : 0.08);
    return { x: clamp(gx, TC_W / 2 - 3, TC_W / 2 + 3), y: side === 'me' ? TC_L - out : out };
  }
  var bf = tcF(side, ballPos.y);
  var c = attacking ? clamp(bf * 0.72 + 0.2, 0.3, 0.74) : clamp(bf * 0.68 + 0.04, 0.2, 0.6);
  var f = c + (d.hf - 0.37) * (attacking ? 1.05 : 0.62);
  var slot = TC_W * 0.08 + d.hx * TC_W * 0.84;
  var cx = TC_W / 2 + (ballPos.x - TC_W / 2) * (attacking ? 0.22 : 0.42);
  var x = cx + (slot - TC_W / 2) * (attacking ? 1.02 : 0.72);
  // Los atacantes no se meten en fuera de juego (salvo que vayan en carrera).
  if (attacking && !d.run) f = Math.min(f, Math.max(tcOffsideLineF(side), bf) - 0.012);
  f = clamp(f, d.line === 1 ? 0.07 : 0.12, 0.9);
  return tcWorld(side, clamp(x, 2, TC_W - 2), f);
}
// Quién va a por el balón: el más cercano de cada equipo, y un segundo
// del rival si el balón está en su campo (presión).
function tcChasers() {
  var T = TC, b = T.ball, res = [];
  var target = b.owner ? b : tcBallLanding();
  ['me', 'opp'].forEach(function (s) {
    if (b.owner && b.owner.side === s) return;
    if (!b.owner && b.kick && b.kick.to && b.kick.to.side === s && !b.kick.shot) { res.push(b.kick.to); return; }
    var cands = tcAlive(tcTeam(s)).filter(function (d) { return d.line > 0 && d.stun <= 0 && !(d.path && d.path.length) && d.hold <= 0; });
    cands.sort(function (a, c) { return tcDist(a, target) - tcDist(c, target); });
    var n = 1;
    if (b.owner && tcF(s, b.y) < 0.55) n = 2;
    for (var i = 0; i < n && i < cands.length; i++) res.push(cands[i]);
  });
  return res;
}
// Dónde va a quedar el balón (para ir a por él): un poco por delante si rueda.
function tcBallLanding() {
  var b = TC.ball;
  if (b.owner) return b;
  if (b.z > 0.2 || b.vz > 0) {
    var tUp = (b.vz + Math.sqrt(b.vz * b.vz + 2 * TC_GRAV * b.z)) / TC_GRAV;
    return { x: clamp(b.x + b.vx * tUp, 0, TC_W), y: clamp(b.y + b.vy * tUp, 0, TC_L) };
  }
  var sp = Math.hypot(b.vx, b.vy), stop = sp * sp / (2 * TC_ROLL);
  var k = sp > 0.1 ? Math.min(stop, 6) / sp : 0;
  return { x: clamp(b.x + b.vx * k, 0, TC_W), y: clamp(b.y + b.vy * k, 0, TC_L) };
}
function tcMoveAll(dt, settle) {
  var T = TC, b = T.ball;
  var chasers = settle ? [] : tcChasers();
  var ballPos = settle && T.sp ? { x: T.sp.x, y: T.sp.y } : (b.owner ? b : tcBallLanding());
  var attSide = b.owner ? b.owner.side : (b.last ? b.last.side : 'me');
  var marks = settle ? {} : tcMarking(attSide, chasers);
  var spT = settle && T.sp ? (T.sp.map || (T.sp.map = tcSetPieceTargets(T.sp))) : null;
  ['me', 'opp'].forEach(function (s) {
    tcAlive(tcTeam(s)).forEach(function (d) {
      d.immune = Math.max(0, d.immune - dt);
      d.cd = Math.max(0, d.cd - dt);
      d.kickAnim = Math.max(0, d.kickAnim - dt);
      if (d.slide > 0) d.slide -= dt;
      if (d.dive) {
        d.dive.t += dt;
        d.x += (d.dive.tx - d.x) * Math.min(1, dt * 7);
        if (d.dive.t > 0.9) d.dive = null;
        return;
      }
      if (d.stun > 0) { d.stun -= dt; d.vx *= 0.8; d.vy *= 0.8; d.x += d.vx * dt; d.y += d.vy * dt; return; }
      var tx, ty, urg = 1;
      if (settle) {
        var tg = spT && spT.get(d);
        if (tg) { tx = tg.x; ty = tg.y; } else if (T.phase === 'kickoff' || T.phase === 'goal') { tx = d.kx; ty = d.ky; } else { var h0 = tcShapeTarget(d, ballPos, T.sp && T.sp.side === s); tx = h0.x; ty = h0.y; }
        if (T.sp && T.sp.taker === d && T.phase === 'setpiece') { tx = T.sp.x; ty = T.sp.y; }
      } else if (d.path && d.path.length) {
        var pt = d.path[0];
        if (Math.hypot(pt.x - d.x, pt.y - d.y) < 0.9) { d.path.shift(); if (!d.path.length) { d.path = null; d.hold = b.owner === d ? 0 : 1.8; } }
        if (d.path && d.path.length) { tx = d.path[0].x; ty = d.path[0].y; } else { tx = d.x + d.vx * 0.2; ty = d.y + d.vy * 0.2; }
        if (b.owner === d) urg = 0.86;
      } else if (b.owner === d) {
        if (d.side === 'opp' && d.aiTo) { tx = d.aiTo.x; ty = d.aiTo.y; urg = 0.84; }
        else { tx = d.x + d.vx * 0.15; ty = d.y + d.vy * 0.15; urg = 0.3; }
      } else if (d.hold > 0) { d.hold -= dt; tx = d.x; ty = d.y; urg = 0.3; }
      else if (chasers.indexOf(d) !== -1) {
        var tgt = b.owner ? b : tcBallLanding();
        // el segundo presionante tapa la línea de pase hacia atrás
        tx = tgt.x; ty = tgt.y;
        if (b.owner && chasers.filter(function (c) { return c.side === d.side; })[1] === d) {
          var g2 = tcGoalOf(d.side); tx = b.x + (g2.x - b.x) * 0.15; ty = b.y + (g2.y - b.y) * 0.15;
        }
        urg = d.side === 'me' ? 0.95 : 0.9 + T.oppQ * 0.1;
      } else if (d.run) {
        d.run.t -= dt;
        tx = d.run.x; ty = d.run.y; urg = 1;
        if (d.run.t <= 0 || Math.hypot(tx - d.x, ty - d.y) < 1) d.run = null;
      } else if (marks.get && marks.get(d)) {
        var m = marks.get(d); tx = m.x; ty = m.y; urg = 0.85;
      } else {
        var h = tcShapeTarget(d, ballPos, attSide === s); tx = h.x; ty = h.y; urg = 0.72;
        if (attSide === s && b.owner && b.owner.side === s) tcMaybeSupport(d, b.owner, h); else d.support = null;
        if (d.support) { tx = d.support.x; ty = d.support.y; urg = 0.85; }
      }
      // cuando ya están en su sitio no se quedan clavados: pasitos encarando el balón
      if (!settle && d.line > 0 && Math.hypot(tx - d.x, ty - d.y) < 1.2) {
        d.jig = (d.jig || Math.random() * 6) + dt;
        tx += Math.sin(d.jig * 1.7 + d.num) * 0.9; ty += Math.cos(d.jig * 1.3 + d.num * 2) * 0.6;
      }
      tcSteer(d, tx, ty, urg, dt);
      if (!settle && Math.hypot(d.vx, d.vy) < 1.5) { var bxp = (b.owner ? b : tcBallLanding()); var fl = Math.hypot(bxp.x - d.x, bxp.y - d.y) || 1; d.fx = (bxp.x - d.x) / fl; d.fy = (bxp.y - d.y) / fl; d.anim += dt * 2.2; }
      d.x = clamp(d.x, -2, TC_W + 2); d.y = clamp(d.y, -1.5, TC_L + 1.5);
    });
  });
  // Sin amontonarse: se separan un poco los que se pisan.
  var all = tcAlive(T.me.concat(T.opp));
  for (var i = 0; i < all.length; i++) for (var j = i + 1; j < all.length; j++) {
    var a = all[i], c = all[j], dd = tcDist(a, c);
    if (dd > 0.01 && dd < 1.2 && !(b.owner === a || b.owner === c)) {
      var push = (1.2 - dd) / 2, ux = (a.x - c.x) / dd, uy = (a.y - c.y) / dd;
      a.x += ux * push; a.y += uy * push; c.x -= ux * push; c.y -= uy * push;
    }
  }
}
// Marcaje: los defensores que no presionan se ponen entre su atacante y la portería.
function tcMarking(attSide, chasers) {
  var map = new Map();
  var defSide = tcOther(attSide);
  var attackers = tcAlive(tcTeam(attSide)).filter(function (d) { return d.line > 0 && d !== TC.ball.owner; });
  var defenders = tcAlive(tcTeam(defSide)).filter(function (d) { return d.line > 0 && chasers.indexOf(d) === -1 && !(d.path && d.path.length) && d.hold <= 0; });
  var g = tcGoalOf(defSide);
  var bp = TC.ball.owner ? TC.ball : tcBallLanding();
  // sólo marcan a los que están cerca de su zona y en su mitad defensiva
  var used = [];
  defenders.forEach(function (d) {
    var zone = tcShapeTarget(d, bp, false);
    var best = null, bd = 13;
    attackers.forEach(function (a) {
      if (used.indexOf(a) !== -1) return;
      if (tcF(defSide, a.y) > 0.72) return;
      var dz = tcDist(a, zone);
      if (dz < bd) { bd = dz; best = a; }
    });
    if (best) {
      used.push(best);
      var gx = g.x - best.x, gy = g.y - best.y, gl = Math.hypot(gx, gy) || 1;
      var tight = tcDist(best, bp) < 20 ? 1.6 : 3.2;
      map.set(d, { x: best.x + gx / gl * tight + (bp.x - best.x) * 0.08, y: best.y + gy / gl * tight });
    }
  });
  return map;
}
// Apoyo: el compañero más cercano se ofrece en diagonal; los delanteros
// a veces arrancan al espacio a la espalda de la defensa.
function tcMaybeSupport(d, carrier, home) {
  var T = TC;
  d.support = null;
  if (d.line === 0) return;
  var mates = tcAlive(tcTeam(d.side)).filter(function (m) { return m !== carrier && m.line > 0; }).sort(function (a, c) { return tcDist(a, carrier) - tcDist(c, carrier); });
  if (mates[0] === d && tcDist(d, carrier) > 6) {
    var side = d.x < carrier.x ? -1 : 1;
    var p = tcWorld(d.side, clamp(carrier.x + side * 9, 3, TC_W - 3), clamp(tcF(d.side, carrier.y) + 0.04, 0.08, 0.92));
    d.support = p;
    return;
  }
  var cf = tcF(d.side, carrier.y);
  if (d.line >= 2 && !d.run && cf > 0.3 && cf < 0.85 && Math.random() < (d.line === 3 ? 0.0035 : 0.0013)) {
    var off = tcOffsideLineF(d.side);
    if (tcF(d.side, d.y) > off - 0.06) {
      var rx = clamp(d.x + (TC_W / 2 - d.x) * 0.35 + tcRnd(-5, 5), 4, TC_W - 4);
      var dest = tcWorld(d.side, rx, Math.min(0.94, off + tcRnd(0.08, 0.15)));
      d.run = { x: dest.x, y: dest.y, t: 2.6 };
      if (d.side === 'me' && T.ball.owner && T.ball.owner.side === 'me') tcSay(tcName(d) + ' pide el balón al espacio');
    }
  }
}

/* ============================== Balón ============================== */
function tcBall(dt) {
  var T = TC, b = T.ball;
  if (b.owner) {
    var o = b.owner;
    var sp = Math.hypot(o.vx, o.vy);
    var fx = sp > 0.3 ? o.vx / sp : 0, fy = sp > 0.3 ? o.vy / sp : (o.side === 'me' ? -1 : 1);
    // el balón va un poco por delante y se toca al ritmo de la carrera
    var lead = 0.55 + Math.abs(Math.sin(o.anim * 1.1)) * 0.35 * Math.min(1, sp / 5);
    b.x = o.x + fx * lead; b.y = o.y + fy * lead; b.z = 0; b.vx = o.vx; b.vy = o.vy; b.vz = 0;
    b.spin += sp * dt * 2;
    if (o.side === 'me' && o.line === 0 && T.phase === 'play') {
      T.gkHold += dt;
      if (T.gkHold > 3.5) tcAiCarrier(o, true);
    } else T.gkHold = 0;
    return;
  }
  // vuelo y rodadura
  if (b.z > 0 || b.vz > 0) {
    b.vz -= TC_GRAV * dt;
    b.z += b.vz * dt;
    b.vx *= Math.pow(0.985, dt * 60 / 60); b.vy *= Math.pow(0.985, dt * 60 / 60);
    if (b.z <= 0) {
      b.z = 0;
      if (b.vz < -2.2) { b.vz = -b.vz * 0.42; b.vx *= 0.78; b.vy *= 0.78; tcFx('dust', b.x, b.y); }
      else b.vz = 0;
    }
  } else {
    var s = Math.hypot(b.vx, b.vy);
    if (s > 0) { var ns = Math.max(0, s - TC_ROLL * dt * (s > 14 ? 1.15 : 1)); b.vx *= ns / s; b.vy *= ns / s; }
  }
  b.x += b.vx * dt; b.y += b.vy * dt;
  b.spin += Math.hypot(b.vx, b.vy) * dt * 2;
  if (b.kick) b.kick.t += dt;
  // ¿pasa por la portería o sale del campo?
  if (tcCheckOut()) return;
  tcTryControl();
}
// Golpeo: pase raso, pase alto, centro, despeje o tiro.
function tcKick(from, tx, ty, to, type) {
  var T = TC, b = T.ball;
  tx = clamp(tx, 0.3, TC_W - 0.3); ty = clamp(ty, 0.3, TC_L - 0.3);
  var dist = Math.hypot(tx - from.x, ty - from.y);
  if (!type) type = dist > 27 || (to && tcLaneBlocked(from, tx, ty) && dist > 12) ? 'lofted' : 'ground';
  // precisión: peor de lejos, con mala pase y cansado
  var err = (1.12 - from.st.pase / 100) * 0.075 * (0.6 + dist / 25) * (1.25 - from.stam * 0.25);
  if (type === 'throw') err *= 0.5;
  var ang = Math.atan2(ty - from.y, tx - from.x) + tcRnd(-err, err);
  var dErr = dist * (1 + tcRnd(-err, err) * 0.8);
  var vx, vy, vz = 0, h;
  if (type === 'ground') {
    var ve = 3.2 + dist * 0.07;
    var v0 = Math.min(25, Math.sqrt(ve * ve + 2 * TC_ROLL * dErr));
    vx = Math.cos(ang) * v0; vy = Math.sin(ang) * v0;
  } else {
    var flight = type === 'throw' ? clamp(0.45 + dErr / 30, 0.5, 1.1) : clamp(0.75 + dErr / 32, 0.9, 2.3);
    vz = TC_GRAV * flight / 2;
    h = dErr / flight;
    vx = Math.cos(ang) * h; vy = Math.sin(ang) * h;
  }
  T.ball = { x: from.x + Math.cos(ang) * 0.6, y: from.y + Math.sin(ang) * 0.6, z: type === 'throw' ? 1.8 : 0.05, vx: vx, vy: vy, vz: type === 'throw' ? vz * 0.6 : vz, owner: null, last: from, spin: b.spin,
    kick: { from: from, to: to || null, type: type, t: 0, tried: [], offside: tcOffsideSnapshot(from, tx, ty) } };
  from.cd = 0.35; from.kickAnim = 0.25;
  if (from.side === 'me') T.msg = '';
  T.lastPass = { p: from.p, side: from.side, at: T.t, half: T.half };
  T.stats[from.side].passes++;
  if (type !== 'throw') tcSnd('kick');
  // quien recibe va a buscarlo (con pase alto, a donde cae)
  if (to) { to.path = [{ x: tx, y: ty }]; to.hold = 0; to.run = null; }
  else {
    var mate = tcAlive(tcTeam(from.side)).filter(function (d) { return d !== from && d.line > 0; }).sort(function (a, c) { return Math.hypot(a.x - tx, a.y - ty) - Math.hypot(c.x - tx, c.y - ty); })[0];
    if (mate) { mate.path = [{ x: tx, y: ty }]; mate.hold = 0; mate.run = null; T.ball.kick.to = mate; }
  }
  if (dist > 30) tcSay((type === 'lofted' ? 'Balón largo de ' : 'Pase largo de ') + tcName(from));
}
function tcLaneBlocked(from, tx, ty) {
  return tcAlive(tcTeam(tcOther(from.side))).some(function (e) {
    var sd = tcSegDist(e.x, e.y, from.x, from.y, tx, ty);
    return sd.u > 0.1 && sd.u < 0.95 && sd.d < 2.2;
  });
}
// Al pasar, se apunta quién está en fuera de juego (cuenta si lo toca él).
function tcOffsideSnapshot(from, tx, ty) {
  var side = from.side, line = tcOffsideLineF(side), bf = tcF(side, from.y);
  var res = [];
  tcAlive(tcTeam(side)).forEach(function (m) {
    if (m === from || m.line === 0) return;
    var f = tcF(side, m.y);
    if (f > 0.5 && f > bf + 0.004 && f > line + 0.004) res.push(m);
  });
  return res;
}
// Alguien llega al balón: control, cabezazo, corte o rebote.
function tcTryControl() {
  var T = TC, b = T.ball, k = b.kick || { t: 9, tried: [], from: null };
  var sp = Math.hypot(b.vx, b.vy);
  // balón lento o tras 1,2 s: ya es de quien llegue primero
  if (b.kick && !k.shot && (sp < 6 || k.t > 1.2) && b.z < 1) { b.kick = null; k = { t: 9, tried: [], from: null }; }
  var best = null, bd = 99;
  tcAlive(T.me.concat(T.opp)).forEach(function (d) {
    if (d.stun > 0 || d.cd > 0) return;
    if (d.dive && !(k.shot && k.shot.keeper === d)) return;
    if (k.from === d && k.t < 0.3) return;
    var gk = d.line === 0 && tcInBox(d.side, d.x, d.y);
    var reachH = gk ? 2.7 : 2.1;
    if (b.z > reachH) return;
    var reach = gk ? 1.5 : 1.05;
    var dd = tcDist(d, b);
    if (dd < reach && dd < bd) { bd = dd; best = d; }
  });
  if (!best) return;
  var d = best;
  var friendly = !k.from || k.from.side === d.side;
  if (!friendly && k.tried.indexOf(d) !== -1) return;
  // fuera de juego: lo toca un compañero que estaba adelantado
  if (k.offside && k.offside.indexOf(d) !== -1 && k.from && k.from.side === d.side && !k.shot) { tcOffside(d); return; }
  if (k.shot) { tcShotReach(d); return; }
  var header = b.z > 1.1;
  if (friendly) {
    var pc = clamp(0.8 + d.st.pase / 500 - Math.max(0, sp - 12) / 40 - (header ? 0.12 : 0), 0.45, 0.98);
    if (d.line === 0 && tcInBox(d.side, d.x, d.y)) pc = 0.98;
    if (Math.random() < pc || sp < 5) { tcGive(d, header); if (k.from && k.from !== d) T.stats[d.side].passOk++; return; }
    tcDeflect(d, 0.45);
    return;
  }
  k.tried.push(d);
  var chance = clamp(0.28 + (d.st.def - (k.from ? k.from.st.pase : 60)) / 160 + (1 - Math.min(sp, 26) / 26) * 0.35 - (header ? 0.08 : 0), 0.1, 0.8);
  if (d.line === 0 && tcInBox(d.side, d.x, d.y)) chance = 0.9;
  if (sp < 4.5) chance = 0.96;
  if (Math.random() < chance) {
    tcGive(d, header);
    if (k.from && sp > 4.5) tcSay((header ? 'Despeja de cabeza ' : 'Corta ') + tcName(d));
  } else if (Math.random() < 0.4) tcDeflect(d, 0.55);
}
function tcDeflect(d, keep) {
  var b = TC.ball, a = Math.atan2(b.vy, b.vx) + tcRnd(-1, 1), s = Math.hypot(b.vx, b.vy) * keep;
  b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s; b.vz = Math.max(b.vz, tcRnd(0, 3));
  b.last = d; d.cd = 0.45;
  if (b.kick) { b.kick.to = null; b.kick.offside = null; }
  tcFx('dust', b.x, b.y);
}
function tcGive(d, header) {
  var T = TC;
  T.ball = { x: d.x, y: d.y, z: 0, vx: d.vx, vy: d.vy, vz: 0, owner: d, last: d, kick: null, spin: T.ball.spin };
  d.immune = Math.max(d.immune, 0.6);
  d.run = null; d.support = null;
  d.path = d.path && d.path.length && d.side === 'me' ? d.path : null;
  T.gkHold = 0;
  T.aiT = 0.6 + Math.random() * 0.6;
  tcAlive(T.me.concat(T.opp)).forEach(function (m) { if (m !== d && m.side === d.side) m.support = null; });
  if (d.side === 'me') { T.sel = d; T.msg = d.line === 0 ? 'Toca a un compañero para sacar' : 'Desliza desde él para conducir, toca a un compañero o la portería'; }
  else T.msg = 'Defiende: desliza a tus jugadores hacia el balón';
  if (header && typeof fxHaptic === 'function') fxHaptic('tap');
}

/* ===================== Fuera de banda, córner y gol ===================== */
function tcCheckOut() {
  var T = TC, b = T.ball;
  var lastSide = b.last ? b.last.side : 'me';
  if (b.y < 0 || b.y > TC_L) {
    var goalSide = b.y < 0 ? 'opp' : 'me'; // quién defiende esa portería
    var inPosts = Math.abs(b.x - TC_W / 2) < TC_GOAL / 2 && b.z < TC_BAR;
    if (inPosts) {
      var scorerSide = tcOther(goalSide);
      var scorer = b.last && b.last.side === scorerSide ? b.last : (b.kick && b.kick.from) || b.last;
      tcGoal(scorer, scorerSide, b.last && b.last.side === goalSide);
      return true;
    }
    if (b.kick && b.kick.shot) tcSay(b.kick.shot.out ? '¡Fuera por poco!' : 'Se va por la línea de fondo');
    if (lastSide === goalSide) {
      var cx = b.x < TC_W / 2 ? 0.4 : TC_W - 0.4;
      tcWhistle('corner', scorerSideOf(goalSide), cx, goalSide === 'opp' ? 0.4 : TC_L - 0.4);
    } else {
      tcWhistle('goalkick', goalSide, TC_W / 2 + (b.x < TC_W / 2 ? -5 : 5), goalSide === 'opp' ? 5.5 : TC_L - 5.5);
    }
    return true;
  }
  if (b.x < 0 || b.x > TC_W) {
    tcWhistle('throw', tcOther(lastSide), b.x < 0 ? 0 : TC_W, clamp(b.y, 1, TC_L - 1));
    return true;
  }
  return false;
}
function scorerSideOf(goalSide) { return tcOther(goalSide); }
function tcGoal(shooter, side, own) {
  var T = TC, live = T.live;
  var lp = T.lastPass;
  var assist = !own && lp && lp.side === side && lp.half === T.half && T.t - lp.at < 8 && shooter && lp.p !== shooter.p ? lp.p : null;
  var scorerP = shooter ? shooter.p : tcTeam(side)[0].p;
  if (own) { var att = tcAlive(tcTeam(side)).filter(function (d) { return d.line > 0; }).sort(function (a, c) { return tcDist(a, T.ball) - tcDist(c, T.ball); })[0]; scorerP = att ? att.p : scorerP; }
  var ev = { minute: tcMinute(), side: side, scorer: scorerP, assist: assist };
  if (side === 'me') live.myGoals++; else live.oppGoals++;
  live.revealed.push(ev);
  live.lastGoalSide = side;
  live.goalSeq = (live.goalSeq || 0) + 1;
  T.concede = tcOther(side);
  T.net = { side: tcOther(side), x: clamp(T.ball.x, TC_W / 2 - TC_GOAL / 2, TC_W / 2 + TC_GOAL / 2), t: 0 };
  T.ball.vx *= 0.1; T.ball.vy = (side === 'me' ? -1 : 1) * 0.6; T.ball.kick = null; T.ball.owner = null;
  T.phase = 'goal';
  T.phaseT = 3;
  tcAlive(T.me.concat(T.opp)).forEach(function (d) { d.kx = d.x + tcRnd(-3, 3); d.ky = d.y + tcRnd(-3, 3); d.path = null; d.run = null; d.dive = null; });
  if (shooter && !own) { shooter.kx = clamp(shooter.x + (shooter.x < TC_W / 2 ? -9 : 9), 2, TC_W - 2); shooter.ky = clamp(shooter.y + (side === 'me' ? 6 : -6), 2, TC_L - 2); }
  tcBanner(own ? '¡Gol en propia puerta!' : '¡GOL de ' + scorerP.nombre + '!', side === 'me' ? '#ffd23f' : '#ff8a8a', 2600);
  tcSay(own ? 'Gol en propia puerta' : '¡Gol de ' + scorerP.nombre + (assist ? ', con pase de ' + assist.nombre : '') + '!');
  if (typeof playGoalSound === 'function') playGoalSound();
  tcRoar();
  if (side === 'me' && typeof fxConfetti === 'function') fxConfetti();
  tcHud(true);
}

/* ============================ Balón parado ============================ */
var TC_SP_NAMES = { throw: 'Saque de banda', corner: 'Córner', goalkick: 'Saque de puerta', free: 'Falta', penalty: '¡Penalti!' };
function tcWhistle(kind, side, x, y, taker) {
  var T = TC;
  if (T.phase !== 'play' && T.phase !== 'setpiece') return;
  var team = tcAlive(tcTeam(side));
  if (!taker) {
    if (kind === 'goalkick') taker = tcKeeper(side);
    else taker = team.filter(function (d) { return d.line > 0; }).sort(function (a, c) { return Math.hypot(a.x - x, a.y - y) - Math.hypot(c.x - x, c.y - y); })[0];
    if (kind === 'penalty' || (kind === 'free' && tcDist({ x: x, y: y }, tcGoalOf(tcOther(side))) < 30)) {
      taker = team.filter(function (d) { return d.line > 0; }).sort(function (a, c) { return c.st.tiro - a.st.tiro; })[0] || taker;
    }
  }
  T.sp = { kind: kind, side: side, x: x, y: y, taker: taker, t: 0 };
  T.phase = 'whistle';
  T.phaseT = kind === 'throw' ? 0.9 : 1.5;
  T.ball.kick = null; T.ball.owner = null;
  tcAlive(T.me.concat(T.opp)).forEach(function (d) { d.path = null; d.run = null; d.hold = 0; d.support = null; d.dive = null; });
  if (kind === 'corner') T.stats[side].corners++;
  tcSnd(kind === 'throw' ? 'whistleShort' : 'whistle');
  tcSay(TC_SP_NAMES[kind] + (kind === 'penalty' ? '' : ' para ' + (side === 'me' ? 'tu equipo' : 'el rival')));
  if (kind !== 'throw') tcBanner(TC_SP_NAMES[kind], side === 'me' ? '#5fe39a' : '#ff8a8a', 1100);
  T.msg = side === 'me' ? ({ throw: 'Toca a un compañero para sacar de banda', corner: 'Toca dentro del área para centrar', goalkick: 'Toca a un compañero para sacar', free: 'Toca a un compañero o la portería para tirar', penalty: 'Elige cómo tirar' })[kind] : 'Prepárate para defender';
}
// Mientras se prepara el balón parado, el balón está en el punto de saque.
function tcBallSetPieceHold() {
  var T = TC, sp = T.sp;
  if (!sp) return;
  if (T.phase === 'whistle') { T.ball.x += (sp.x - T.ball.x) * 0.2; T.ball.y += (sp.y - T.ball.y) * 0.2; T.ball.z = 0; T.ball.vx = T.ball.vy = 0; return; }
  T.ball.x = sp.x; T.ball.y = sp.y; T.ball.z = sp.kind === 'throw' ? 1.9 : 0;
}
// Dónde se coloca cada uno en el balón parado.
function tcSetPieceTargets(sp) {
  var map = new Map(), T = TC;
  var att = tcAlive(tcTeam(sp.side)), def = tcAlive(tcTeam(tcOther(sp.side)));
  var g = tcGoalOf(tcOther(sp.side));
  var dir = sp.side === 'me' ? 1 : -1; // hacia la portería rival, y crece "hacia atrás"
  map.set(sp.taker, { x: sp.x + (sp.kind === 'throw' ? (sp.x < 1 ? -0.6 : 0.6) : 0), y: sp.y + (sp.kind === 'corner' || sp.kind === 'throw' ? 0 : dir * 0.8) });
  if (sp.kind === 'corner') {
    var spots = [[-5, 7], [2, 6], [6, 9], [-1, 11], [0, 16], [-9, 13]];
    var heads = att.filter(function (d) { return d !== sp.taker && d.line > 0; }).sort(function (a, c) { return c.line - a.line || c.st.tiro - a.st.tiro; }).slice(0, spots.length);
    heads.forEach(function (d, i) { map.set(d, { x: g.x + spots[i][0], y: g.y + dir * spots[i][1] }); });
    var dk = def.filter(function (d) { return d.line > 0; });
    heads.forEach(function (a, i) { var m = dk[i]; if (m) { var t = map.get(a); map.set(m, { x: t.x + (g.x - t.x) * 0.15, y: t.y - dir * 1.2 }); } });
    var gk = tcKeeper(tcOther(sp.side)); map.set(gk, { x: g.x + (sp.x < TC_W / 2 ? -1 : 1), y: g.y + dir * 0.8 });
  } else if (sp.kind === 'penalty') {
    att.concat(def).forEach(function (d) {
      if (d === sp.taker) return;
      if (d.line === 0 && d.side !== sp.side) { map.set(d, { x: TC_W / 2, y: g.y + dir * 0.3 }); return; }
      if (d.line === 0) return;
      var x = clamp(d.x, TC_W / 2 - 18, TC_W / 2 + 18);
      map.set(d, { x: x, y: g.y + dir * tcRnd(19, 24) });
    });
  } else if (sp.kind === 'free' && tcDist(sp, g) < 32) {
    // barrera a 9,15 m entre el balón y la portería
    var vx = g.x - sp.x, vy = g.y - sp.y, l = Math.hypot(vx, vy) || 1, ux = vx / l, uy = vy / l;
    var wall = def.filter(function (d) { return d.line > 0; }).sort(function (a, c) { return tcDist(a, sp) - tcDist(c, sp); }).slice(0, 4);
    wall.forEach(function (d, i) { map.set(d, { x: sp.x + ux * 9.15 - uy * (i - 1.5) * 0.75, y: sp.y + uy * 9.15 + ux * (i - 1.5) * 0.75 }); });
  } else if (sp.kind === 'goalkick') {
    // el rival sale de su área y espera más arriba
    def.forEach(function (d) { if (d.line > 0 && tcInBox(sp.side, d.x, d.y)) map.set(d, { x: d.x, y: d.y + (sp.side === 'me' ? -14 : 14) }); });
  }
  // los demás rivales no pueden estar a menos de 9 m del balón
  def.forEach(function (d) {
    if (map.get(d) || sp.kind === 'throw') return;
    var dd = tcDist(d, sp);
    if (dd < 9.2) { var k = 9.4 / (dd || 1); map.set(d, { x: sp.x + (d.x - sp.x) * k, y: sp.y + (d.y - sp.y) * k }); }
  });
  return map;
}
function tcAiSetPiece() {
  var T = TC, sp = T.sp, c = sp.taker;
  if (sp.kind === 'penalty') return;
  T.phase = 'play';
  T.sp = null;
  if (sp.kind === 'free' && tcDist(c, tcGoalOf('me')) < 27 && Math.abs(c.x - TC_W / 2) < 16 && Math.random() < 0.65) { tcRivalShoot(c); return; }
  tcAiCarrier(c, true, sp.kind);
}
function tcAutoSetPiece() {
  var T = TC, sp = T.sp;
  if (sp.kind === 'penalty') return;
  T.phase = 'play'; T.sp = null;
  tcAiCarrier(sp.taker, true, sp.kind);
}
// Tu toque en un balón parado.
function tcMySetPieceTap(pt, tapped) {
  var T = TC, sp = T.sp, c = sp.taker;
  var goalTap = pt.y < 4 && Math.abs(pt.x - TC_W / 2) < TC_GOAL / 2 + 5;
  if (sp.kind === 'free' && goalTap) { T.phase = 'play'; T.sp = null; tcAskShot(true); return; }
  var tx = tapped && tapped !== c ? tapped.x : pt.x, ty = tapped && tapped !== c ? tapped.y : pt.y;
  var type = null;
  if (sp.kind === 'throw') {
    var d = Math.hypot(tx - c.x, ty - c.y);
    if (d > 26) { tx = c.x + (tx - c.x) / d * 26; ty = c.y + (ty - c.y) / d * 26; }
    type = 'throw';
  }
  if (sp.kind === 'corner') type = 'lofted';
  T.phase = 'play'; T.sp = null;
  tcKick(c, tx, ty, tapped && tapped !== c ? tapped : null, type);
  if (sp.kind === 'corner') tcSay('Centro de ' + tcName(c));
}

/* ================== Fuera de juego, faltas y tarjetas ================== */
function tcOffside(d) {
  var T = TC;
  T.stats[d.side].offsides++;
  tcBanner('Fuera de juego de ' + tcName(d), d.side === 'me' ? '#ff8a8a' : '#5fe39a', 1300);
  tcSay('¡Fuera de juego! El asistente levanta la bandera');
  T.flag = { x: d.side === 'me' ? -1 : TC_W + 1, y: d.y, t: Date.now() };
  tcWhistle('free', tcOther(d.side), d.x, d.y);
}
function tcFoul(def, att, x, y) {
  var T = TC;
  T.stats[def.side].fouls++;
  var inBox = tcInBox(def.side, x, y);
  var card = null;
  var rough = Math.random();
  if (rough < (inBox ? 0.35 : 0.22)) {
    def.yellow++;
    card = def.yellow >= 2 ? 'red' : 'yellow';
    T.stats[def.side].yellow++;
  } else if (rough > 0.985) card = 'red';
  tcSay('Falta de ' + tcName(def) + ' sobre ' + tcName(att));
  if (card) {
    T.cardShow = { d: def, card: card, t: Date.now() };
    tcBanner((card === 'red' ? 'Roja para ' : 'Amarilla para ') + tcName(def), card === 'red' ? '#ff4b4b' : '#ffd23f', 1500);
    if (card === 'red') { T.stats[def.side].red++; tcSendOff(def); }
  }
  att.stun = 0; def.stun = 0.6;
  tcWhistle(inBox ? 'penalty' : 'free', att.side, inBox ? TC_W / 2 : clamp(x, 1, TC_W - 1), inBox ? (att.side === 'me' ? 11 : TC_L - 11) : clamp(y, 1, TC_L - 1), inBox ? null : att);
}
function tcSendOff(d) {
  d.off = true;
  d.x = -6; d.y = TC_L / 2;
  if (TC.sel === d) TC.sel = null;
  tcSay(tcName(d) + ' se va a la caseta');
}

/* ======================== IA del que lleva el balón ======================== */
function tcAi(dt) {
  var T = TC, b = T.ball;
  if (!b.owner || b.owner.side !== 'opp') return;
  var c = b.owner;
  T.aiT -= dt;
  var pressed = tcAlive(T.me).some(function (m) { return tcDist(m, c) < 3.2; });
  if (T.aiT > 0 && !(pressed && T.aiT < 0.35)) return;
  T.aiT = 0.55 + Math.random() * 0.5 - T.oppQ * 0.1;
  tcAiCarrier(c, false, null, pressed);
}
// Decide qué hace quien lleva el balón: tirar, pasar, centrar o conducir.
function tcAiCarrier(c, forcePass, spKind, pressed) {
  var T = TC, side = c.side, foes = tcAlive(tcTeam(tcOther(side)));
  var goal = tcGoalOf(tcOther(side));
  var cf = tcF(side, c.y), dg = tcDist(c, goal), ang = Math.abs(c.x - TC_W / 2);
  var press = Math.min.apply(null, foes.map(function (f) { return tcDist(f, c); }));
  var noise = 0.35 - (side === 'opp' ? T.oppQ * 0.2 : 0.1);
  var best = { s: -9 };
  // tirar
  if (!forcePass && c.line > 0 && side === 'opp') {
    var sv = (dg < 32 ? (32 - dg) / 32 * 2.4 : -1) - ang / 34 - (press < 2 ? 0.15 : 0) + tcRnd(0, noise);
    if (dg < 12 && ang < 9) sv += 1;
    if (sv > best.s) best = { s: sv, act: 'shoot' };
  }
  // pases
  tcAlive(tcTeam(side)).forEach(function (m) {
    if (m === c || (m.line === 0 && cf > 0.3)) return;
    var lead = 0.45;
    var tx = m.x + m.vx * lead, ty = m.y + m.vy * lead;
    if (m.run) { tx = m.run.x; ty = m.run.y; }
    var d = Math.hypot(tx - c.x, ty - c.y);
    if (d < 5 || d > (spKind === 'throw' ? 24 : 48)) return;
    if (tcF(side, m.y) > tcOffsideLineF(side) + 0.01 && tcF(side, m.y) > cf && tcF(side, m.y) > 0.5 && !m.run) return; // en fuera de juego
    var open = Math.min.apply(null, foes.map(function (f) { return Math.hypot(f.x - tx, f.y - ty); }));
    var lofted = d > 27;
    var lane = 9;
    if (!lofted) foes.forEach(function (f) { var sd = tcSegDist(f.x, f.y, c.x, c.y, tx, ty); if (sd.u > 0.08 && sd.u < 0.96) lane = Math.min(lane, sd.d); });
    var prog = tcF(side, ty) - cf;
    var s = prog * 3 + Math.min(open, 10) / 10 * 0.8 + (lofted ? 0.25 : Math.min(lane, 5) / 5) * 1.1 - d * 0.01 - (lofted ? 0.3 : 0) + (m.run ? 0.6 : 0) + tcRnd(0, noise);
    if (!lofted && lane < 1.4) s -= 1.5;
    if (open < 1.8) s -= 1;
    if (s > best.s) best = { s: s, act: 'pass', m: m, tx: tx, ty: ty };
  });
  // centro desde la banda
  if (!forcePass && c.line > 0 && cf > 0.74 && ang > 15) {
    var target = tcAlive(tcTeam(side)).filter(function (m) { return m !== c && tcInBox(tcOther(side), m.x, m.y); }).sort(function (a, m) { return a.y - m.y; })[0];
    if (target) { var cs = 1.1 + tcRnd(0, noise); if (cs > best.s) best = { s: cs, act: 'cross', m: target }; }
  }
  // conducir hacia el espacio
  if (!forcePass && c.line > 0) {
    for (var k = -3; k <= 3; k++) {
      var a = Math.atan2(goal.y - c.y, goal.x - c.x) + k * 0.38;
      var px = clamp(c.x + Math.cos(a) * 9, 2, TC_W - 2), py = clamp(c.y + Math.sin(a) * 9, 1, TC_L - 1);
      var space = Math.min.apply(null, foes.map(function (f) { return Math.hypot(f.x - px, f.y - py); }));
      var s2 = (tcF(side, py) - cf) * 3.2 + Math.min(space, 10) / 10 * 1.1 - (press < 3 ? 0.45 : 0) + (cf > 0.55 ? 0.25 : 0) + (pressed ? 0 : 0.45) + tcRnd(0, noise);
      if (s2 > best.s) best = { s: s2, act: 'dribble', x: px, y: py };
    }
  }
  if (!best.act || (forcePass && best.act !== 'pass')) {
    // despeje largo hacia arriba
    var fw = tcWorld(side, clamp(c.x + tcRnd(-12, 12), 6, TC_W - 6), clamp(cf + 0.35, 0.3, 0.75));
    tcKick(c, fw.x, fw.y, null, 'lofted');
    return;
  }
  if (best.act === 'shoot') { if (side === 'opp') tcRivalShoot(c); return; }
  if (best.act === 'pass') { tcKick(c, best.tx, best.ty, best.m, spKind === 'throw' ? 'throw' : (spKind === 'corner' ? 'lofted' : null)); return; }
  if (best.act === 'cross') { tcKick(c, best.m.x + tcRnd(-2, 2), best.m.y + tcRnd(-2, 2), best.m, 'lofted'); tcSay('Centro de ' + tcName(c)); return; }
  if (best.act === 'dribble') c.aiTo = { x: best.x, y: best.y };
}

/* =============================== Duelos =============================== */
function tcDuels() {
  var T = TC, b = T.ball;
  if (!b.owner) return;
  var c = b.owner;
  if (c.immune > 0 || c.line === 0) return;
  var rivals = tcAlive(tcTeam(tcOther(c.side)));
  for (var i = 0; i < rivals.length; i++) {
    var d = rivals[i];
    if (d.stun > 0 || d.cd > 0 || d.dive) continue;
    if (d.line === 0 && tcF(d.side, c.y) > 0.17) continue;
    if (tcDist(c, d) < 1.6) { tcOpenDuel(c, d); return; }
  }
}
var TC_DUEL_OPTS = {
  att: [{ id: 'regate', label: 'Regate', sub: 'Control' }, { id: 'cuerpo', label: 'Cuerpo', sub: 'Físico' }],
  def: [{ id: 'entrada', label: 'Entrada', sub: 'Robo, puede ser falta' }, { id: 'bloqueo', label: 'Bloqueo', sub: 'Aguante' }]
};
// Regate gana a Entrada y Cuerpo gana a Bloqueo; al revés, gana el defensor.
var TC_DUEL_WINS = { regate: 'entrada', cuerpo: 'bloqueo' };
function tcOpenDuel(att, def) {
  var T = TC;
  var mine = att.side === 'me' ? att : def;
  var role = att.side === 'me' ? 'att' : 'def';
  att.vx *= 0.3; att.vy *= 0.3; def.vx *= 0.3; def.vy *= 0.3;
  T.modal = { type: 'duel', att: att, def: def, mine: mine, role: role, techs: tcTechs(mine, role === 'att' ? 'regate' : 'defensa') };
  if (typeof fxHaptic === 'function') fxHaptic('tech');
  tcRenderModal();
}
function tcAiDuelChoice(d, role) {
  var techs = tcTechs(d, role === 'att' ? 'regate' : 'defensa').filter(function (t) { return d.tp >= t.cost; });
  var nearGoal = role === 'att' ? tcF(d.side, d.y) > 0.6 : tcF(d.side, d.y) < 0.35;
  if (techs.length && Math.random() < (nearGoal ? 0.45 : 0.22)) return { id: 'tech', tech: techs[0] };
  var opts = TC_DUEL_OPTS[role];
  return { id: opts[Math.floor(Math.random() * 2)].id };
}
function tcDuelValue(d, ch, role, otherCh, otherElem) {
  var s = d.st, v;
  if (role === 'att') v = ch.id === 'cuerpo' ? s.def * 0.45 + s.tiro * 0.35 + s.esp * 0.2 : s.pase * 0.6 + s.esp * 0.4;
  else v = ch.id === 'bloqueo' ? s.def * 0.75 + s.esp * 0.25 : s.def * 0.85 + s.pase * 0.15;
  if (ch.id === 'tech') v = (role === 'att' ? s.pase * 0.6 + s.esp * 0.4 : s.def * 0.8 + s.esp * 0.2) + ch.tech.power * 0.45 + tcElemBonus(ch.tech.element, otherElem);
  else if (otherCh.id !== 'tech') {
    var attCh = role === 'att' ? ch.id : otherCh.id, defCh = role === 'att' ? otherCh.id : ch.id;
    var attWins = TC_DUEL_WINS[attCh] === defCh;
    if ((role === 'att') === attWins) v += 12;
  }
  v -= (1 - d.stam) * 10;
  return v + Math.random() * 22;
}
function tcResolveDuel(myChoiceId) {
  var T = TC, m = T.modal;
  if (!m || m.type !== 'duel') return;
  var att = m.att, def = m.def;
  var myCh = myChoiceId.indexOf('tech') === 0 ? { id: 'tech', tech: m.techs[+myChoiceId.slice(4)] } : { id: myChoiceId };
  if (myCh.id === 'tech' && (!myCh.tech || m.mine.tp < myCh.tech.cost)) return;
  var aiD = m.role === 'att' ? def : att;
  var aiCh = tcAiDuelChoice(aiD, m.role === 'att' ? 'def' : 'att');
  var attCh = m.role === 'att' ? myCh : aiCh, defCh = m.role === 'att' ? aiCh : myCh;
  if (attCh.id === 'tech') att.tp -= attCh.tech.cost;
  if (defCh.id === 'tech') def.tp -= defCh.tech.cost;
  var attElem = attCh.id === 'tech' ? attCh.tech.element : att.p.tipo, defElem = defCh.id === 'tech' ? defCh.tech.element : def.p.tipo;
  var A = tcDuelValue(att, attCh, 'att', defCh, defElem);
  var D = tcDuelValue(def, defCh, 'def', attCh, attElem);
  var attWin = A >= D;
  // una entrada que llega tarde puede ser falta
  var foul = attWin && defCh.id === 'entrada' && Math.random() < clamp(0.3 + (att.st.pase - def.st.def) / 220, 0.14, 0.45);
  T.modal = null;
  tcRenderModal();
  var vids = [];
  if (attCh.id === 'tech') vids.push({ tech: attCh.tech, who: att });
  if (defCh.id === 'tech') vids.push({ tech: defCh.tech, who: def });
  tcPlayTechs(vids, function () {
    var aName = { regate: 'Regate', cuerpo: 'Cuerpo a cuerpo', entrada: 'Entrada', bloqueo: 'Bloqueo' };
    if (defCh.id === 'entrada') def.slide = 0.5;
    if (foul) { tcFoul(def, att, att.x, att.y); return; }
    if (attWin) {
      def.stun = 1.4; att.immune = 1.5;
      // sale disparado hacia delante
      var g = tcGoalOf(tcOther(att.side)), gx = g.x - att.x, gy = g.y - att.y, gl = Math.hypot(gx, gy) || 1;
      att.vx = gx / gl * att.spd * 0.9; att.vy = gy / gl * att.spd * 0.9;
      tcBanner(attCh.id === 'tech' ? attCh.tech.name : (aName[attCh.id] + ' de ' + tcName(att)), att.side === 'me' ? '#5fe39a' : '#ff8a8a', 1100);
      tcSay(attCh.id === 'tech' ? tcName(att) + ' usa ' + attCh.tech.name : tcName(att) + ' se va de ' + tcName(def));
      tcTeam(def.side).forEach(function (d) { d.cd = Math.max(d.cd, 0.5); });
    } else {
      att.stun = 1.3; def.immune = 1.4;
      // a veces el balón queda suelto en vez de robado limpio
      if (defCh.id === 'bloqueo' && Math.random() < 0.4) {
        var b = TC.ball; TC.ball = { x: b.x, y: b.y, z: 0, vx: tcRnd(-5, 5), vy: tcRnd(-5, 5), vz: 1.5, owner: null, last: def, kick: null, spin: b.spin };
        tcSay('Choque y balón suelto');
      } else tcGive(def);
      tcBanner(defCh.id === 'tech' ? defCh.tech.name : '¡Balón robado!', def.side === 'me' ? '#5fe39a' : '#ff8a8a', 1100);
      if (defCh.id !== 'tech') tcSay(tcName(def) + ' le quita el balón a ' + tcName(att));
      tcTeam(att.side).forEach(function (d) { d.cd = Math.max(d.cd, 0.5); });
    }
  });
}

/* =============================== Tiros =============================== */
function tcShootRange(d) { return tcDist(d, tcGoalOf('opp')); }
function tcAskShot(freeKick) {
  var T = TC, b = T.ball, c = b.owner;
  if (!c || c.side !== 'me' || T.modal) return;
  if (T.phase === 'setpiece' && T.sp && T.sp.taker === c && T.sp.kind === 'free') { T.phase = 'play'; T.sp = null; }
  if (T.phase !== 'play') return;
  var dist = tcShootRange(c);
  if (dist > 40) { tcBanner('Demasiado lejos para tirar', '#ffd166', 900); return; }
  tcOpenShotModal(c, dist, false);
}
function tcOpenShotModal(c, dist, penalty) {
  var T = TC;
  c.vx = c.vy = 0;
  T.modal = { type: 'shot', shooter: c, dist: dist, penalty: penalty, techs: tcTechs(c, 'tiro') };
  tcRenderModal();
}
function tcShotValue(d, tech, dist, keeperElem) {
  var v = d.st.tiro + Math.random() * 20 - Math.max(0, dist - 14) * 1.35 - (1 - d.stam) * 6;
  if (tech) v += tech.power * 0.45 + tcElemBonus(tech.element, keeperElem);
  return v;
}
function tcKeepValue(k, tech, shotElem) {
  var v = k.st.def * 0.6 + k.st.esp * 0.4 + 6 + Math.random() * 20;
  if (tech) v += tech.power * 0.45 + tcElemBonus(tech.element, shotElem);
  return v;
}
function tcResolveMyShot(choiceId) {
  var T = TC, m = T.modal;
  if (!m || m.type !== 'shot') return;
  if (choiceId === 'cancel') { T.modal = null; tcRenderModal(); m.shooter.immune = 0.6; return; }
  var tech = choiceId.indexOf('tech') === 0 ? m.techs[+choiceId.slice(4)] : null;
  if (tech && m.shooter.tp < tech.cost) return;
  if (tech) m.shooter.tp -= tech.cost;
  var gk = tcKeeper('opp');
  var gTechs = tcTechs(gk, 'portero').filter(function (t) { return gk.tp >= t.cost; });
  var gTech = gTechs.length && Math.random() < (tech ? 0.65 : 0.25) ? gTechs[0] : null;
  if (gTech) gk.tp -= gTech.cost;
  T.modal = null;
  tcRenderModal();
  if (T.phase === 'setpiece') { T.phase = 'play'; T.sp = null; }
  tcTakeShot(m.shooter, gk, tech, gTech, m.dist, m.penalty);
}
function tcRivalShoot(c, penalty) {
  var T = TC;
  var techs = tcTechs(c, 'tiro').filter(function (t) { return c.tp >= t.cost; });
  var dist = tcDist(c, tcGoalOf('me'));
  var tech = techs.length && Math.random() < (dist < 20 ? 0.55 : 0.3) ? techs[0] : null;
  c.vx = c.vy = 0;
  var gk = tcKeeper('me');
  T.modal = { type: 'save', shooter: c, keeper: gk, tech: tech, dist: dist, penalty: penalty, techs: tcTechs(gk, 'portero') };
  tcRenderModal();
}
function tcResolveSave(choiceId) {
  var T = TC, m = T.modal;
  if (!m || m.type !== 'save') return;
  var gTech = choiceId.indexOf('tech') === 0 ? m.techs[+choiceId.slice(4)] : null;
  if (gTech && m.keeper.tp < gTech.cost) return;
  if (gTech) m.keeper.tp -= gTech.cost;
  if (m.tech) m.shooter.tp -= m.tech.cost;
  T.modal = null;
  tcRenderModal();
  if (T.phase === 'setpiece') { T.phase = 'play'; T.sp = null; }
  tcTakeShot(m.shooter, m.keeper, m.tech, gTech, m.dist, m.penalty);
}
// El tiro sale de verdad: puede ir fuera, chocar con un defensa, ser gol,
// o que el portero lo blocara o lo despeje (y quede el rechace).
function tcTakeShot(shooter, gk, tech, gTech, dist, penalty) {
  var T = TC, side = shooter.side;
  T.shots[side]++;
  T.stats[side].shots++;
  var S = tcShotValue(shooter, tech, dist, gTech ? gTech.element : gk.p.tipo);
  var K = tcKeepValue(gk, gTech, tech ? tech.element : shooter.p.tipo);
  if (penalty) S += 14;
  var onT = penalty ? 0.9 : clamp(0.5 + shooter.st.tiro / 260 - Math.max(0, dist - 16) * 0.013 + (tech ? 0.25 : 0) + shooter.stam * 0.05, 0.28, 0.96);
  var outcome;
  if (Math.random() > onT) outcome = 'wide';
  else if (S > K) outcome = 'goal';
  else outcome = K - S > 11 || Math.random() < 0.35 ? 'catch' : 'parry';
  // un defensa en la trayectoria puede tapar el tiro (no las supertécnicas)
  var g = tcGoalOf(tcOther(side));
  var blocker = null;
  if (!tech && !penalty && outcome !== 'wide') {
    tcAlive(tcTeam(tcOther(side))).forEach(function (d) {
      if (blocker || d.line === 0) return;
      var sd = tcSegDist(d.x, d.y, shooter.x, shooter.y, g.x, g.y);
      if (sd.u > 0.08 && sd.u < 0.85 && sd.d < 1.3 && Math.random() < 0.45) blocker = d;
    });
  }
  if (outcome !== 'wide') T.stats[side].onTarget++;
  var vids = [];
  if (tech) vids.push({ tech: tech, who: shooter });
  if (gTech) vids.push({ tech: gTech, who: gk });
  tcPlayTechs(vids, function () {
    var dir = side === 'me' ? -1 : 1;
    var gx, z;
    if (outcome === 'wide') {
      var over = Math.random() < 0.35;
      gx = over ? g.x + tcRnd(-TC_GOAL / 2, TC_GOAL / 2) : g.x + (Math.random() < 0.5 ? -1 : 1) * (TC_GOAL / 2 + tcRnd(0.4, 3.5));
      z = over ? TC_BAR + tcRnd(0.4, 2.2) : tcRnd(0.2, 2);
    } else if (outcome === 'goal') {
      gx = g.x + (Math.random() < 0.5 ? -1 : 1) * tcRnd(TC_GOAL * 0.18, TC_GOAL * 0.46);
      z = tcRnd(0.2, TC_BAR - 0.3);
    } else {
      gx = clamp(gk.x + tcRnd(-2.2, 2.2), g.x - TC_GOAL / 2 + 0.5, g.x + TC_GOAL / 2 - 0.5);
      z = tcRnd(0.3, 2);
    }
    var ty = g.y + dir * 0.6;
    var dx = gx - shooter.x, dy = ty - shooter.y, dd = Math.hypot(dx, dy);
    var speed = (tech ? 34 : 27) + shooter.st.tiro / 25 + tcRnd(-2, 2);
    var tFlight = dd / speed;
    var vz = (z + 0.5 * TC_GRAV * tFlight * tFlight) / tFlight;
    T.ball = { x: shooter.x, y: shooter.y, z: 0.2, vx: dx / dd * speed, vy: dy / dd * speed, vz: Math.min(vz, 9), owner: null, last: shooter, spin: 0,
      kick: { from: shooter, to: null, type: 'shot', t: 0, tried: [], shot: { outcome: outcome, keeper: gk, tech: tech, gTech: gTech, blocker: blocker, out: outcome === 'wide' } } };
    shooter.kickAnim = 0.35; shooter.cd = 0.5;
    T.trail = [];
    tcSnd('shot');
    // el portero se tira
    // por dónde pasa el balón a la altura del portero
    var kk = clamp((gk.y - shooter.y) / ((ty - shooter.y) || 1), 0, 1);
    var passX = shooter.x + (gx - shooter.x) * kk;
    var reachX = outcome === 'goal' ? passX + (gx > g.x ? -1 : 1) * tcRnd(1.8, 2.6) : passX;
    if (Math.abs(reachX - gk.x) > 0.8 || outcome !== 'catch') gk.dive = { t: -tFlight * 0.45, tx: reachX, dir: reachX > gk.x ? 1 : -1 };
    tcSay(tech ? tcName(shooter) + ': ¡' + tech.name + '!' : 'Dispara ' + tcName(shooter));
  });
}
// El balón de un tiro llega a alguien: bloqueo o portero.
function tcShotReach(d) {
  var T = TC, b = T.ball, sh = b.kick.shot;
  if (sh.blocker === d) {
    sh.blocker = null;
    tcSay('¡Tapa el tiro ' + tcName(d) + '!');
    tcDeflect(d, 0.35);
    b.kick = { from: d, to: null, type: 'block', t: 0, tried: [], offside: null };
    return;
  }
  if (d !== sh.keeper) return;
  if (sh.outcome === 'goal' || sh.outcome === 'wide') return;
  T.stats[d.side].saves++;
  if (sh.outcome === 'catch') {
    d.dive = null;
    tcGive(d);
    d.immune = 1.5;
    tcBanner(d.side === 'me' ? '¡Paradón de ' + tcName(d) + '!' : '¡La atrapa ' + tcName(d) + '!', d.side === 'me' ? '#5fe39a' : '#ff8a8a', 1200);
    tcSay((sh.gTech ? sh.gTech.name + ': ' : '') + 'blocaje de ' + tcName(d));
    return;
  }
  // despeje: el rechace queda vivo o se va a córner
  var toCorner = Math.random() < 0.4;
  var awayX = b.x < TC_W / 2 ? -1 : 1;
  var dirY = d.side === 'opp' ? 1 : -1;
  T.ball = { x: b.x, y: b.y, z: b.z, vx: awayX * tcRnd(6, 11), vy: toCorner ? -dirY * tcRnd(2, 6) : dirY * tcRnd(6, 11), vz: tcRnd(2, 5), owner: null, last: d, spin: b.spin,
    kick: { from: d, to: null, type: 'parry', t: 0, tried: [], offside: null } };
  d.cd = 0.6;
  tcBanner(d.side === 'me' ? '¡Despeja ' + tcName(d) + '!' : '¡Despeja ' + tcName(d) + '!', d.side === 'me' ? '#5fe39a' : '#ff8a8a', 1100);
  tcSay('Despeja ' + tcName(d) + '... ¡rechace!');
}

/* ===================== Descanso, prórroga y final ===================== */
function tcHalfEnd() {
  var T = TC, live = T.live;
  T.trail = null;
  tcSnd('whistleLong');
  if (T.half === 1 || T.half === 3) {
    T.modal = { type: 'break', title: T.half === 1 ? 'Descanso' : 'Mitad de la prórroga', next: T.half + 1 };
    tcRenderModal();
    return;
  }
  live.myGoals = live.myGoals || 0;
  if (T.half === 2 && typeof futDraftLiveNeedsExtraTime === 'function' && futDraftLiveNeedsExtraTime(live)) {
    var myPlayers = T.me.map(function (d) { return d.p; });
    futDraftAddExtraTime(live, myPlayers);
    T.modal = { type: 'break', title: 'Prórroga', next: 3 };
    tcRenderModal();
    return;
  }
  tcFinish();
}
function tcStartHalf(n) {
  var T = TC;
  T.modal = null;
  T.half = n;
  T.t = 0;
  tcSetHalfLen();
  T.me.concat(T.opp).forEach(function (d) { d.tp = Math.min(d.tpMax, d.tp + d.tpMax * 0.35); d.stam = Math.min(1, d.stam + 0.4); });
  tcRenderModal();
  tcKickoff(n % 2 === 0 ? 'opp' : 'me', true);
  if (typeof playKickoffSound === 'function') playKickoffSound();
}
function tcFinish() {
  var T = TC, live = T.live;
  if (!T || T.ended) return;
  live.finalMyGoals = live.myGoals;
  live.finalOppGoals = live.oppGoals;
  live.minute = live.inExtraTime ? 120 : (live.halfLen ? live.halfLen * 2 : 90);
  live.added = 0;
  live.poss_ticks = { me: Math.round(T.poss.me), opp: Math.round(T.poss.opp) };
  live.shots = T.shots;
  live.tactilStats = T.stats;
  live.done = true;
  G.futdraft.lastLiveStats = { cards: [], poss_ticks: live.poss_ticks };
  tcTeardown();
  setTimeout(live.onFinish, 250);
}
// Simular lo que queda con las fórmulas de siempre (Poisson por fuerza).
function tcSimulateRest() {
  var T = TC, live = T.live;
  if (!T || T.ended) return;
  var f = G.futdraft || {};
  var myPow = typeof f.teamScoreOverride === 'number' ? f.teamScoreOverride : tcAvgScore(T.me.map(function (d) { return d.p; }));
  var myAtk = live.myAtk || myPow, myDef = live.myDef || myPow;
  var oppPow = live.effectiveOppPower || (live.oppSide && typeof teamPower === 'function' ? teamPower(live.oppSide) : 70);
  function sim(fromMin, toMin, frac) {
    var mg = futDraftRandomGoals(futDraftExpectedGoals(myAtk, oppPow) * frac);
    var og = futDraftRandomGoals(futDraftExpectedGoals(oppPow, myDef) * frac);
    var add = function (side, n) {
      var pool = tcAlive(tcTeam(side)).filter(function (d) { return d.line > 0; });
      for (var i = 0; i < n && pool.length; i++) {
        var d = pool.slice().sort(function (a, c) { return (c.line * 10 + c.st.tiro / 10 + Math.random() * 12) - (a.line * 10 + a.st.tiro / 10 + Math.random() * 12); })[0];
        live.revealed.push({ minute: Math.round(tcRnd(fromMin, toMin)), side: side, scorer: d.p, assist: null });
        if (side === 'me') live.myGoals++; else live.oppGoals++;
      }
    };
    add('me', mg); add('opp', og);
  }
  var nowMin = tcMinute();
  if (T.half <= 2) {
    var total = T.halfMin * 2;
    sim(nowMin, total, Math.max(0, (total - nowMin) / total));
    if (!live.inExtraTime && futDraftLiveNeedsExtraTime(live)) futDraftAddExtraTime(live, T.me.map(function (d) { return d.p; }));
    if (live.inExtraTime) sim(91, 120, 1 / 3);
  } else {
    sim(nowMin, 120, Math.max(0, (120 - nowMin) / 90));
  }
  live.revealed.sort(function (a, c) { return a.minute - c.minute; });
  tcFinish();
}
function tcTeardown() {
  var root = document.getElementById('tcRoot');
  if (root) root.remove();
  document.body.classList.remove('tc-lock');
  if (TC) TC.ended = true;
  tcVideoStop();
  tcCrowdStop();
}

/* ======================= Narración y efectos ======================= */
function tcSay(text) {
  var T = TC;
  if (!T) return;
  T.feed.unshift({ text: text, min: tcMinute(), at: Date.now() });
  T.feed = T.feed.slice(0, 30);
  var el = document.getElementById('tcFeed');
  if (el) {
    el.innerHTML = '<span class="tc-feed-min">' + tcMinute() + '\'</span>' + escapeHtml(text);
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }
}
function tcFx(kind, x, y) { TC.fx.push({ k: kind, x: x, y: y, t: 0, life: kind === 'dust' ? 0.45 : 0.6 }); }
function tcBanner(text, color, ms) { TC.banner = { text: text, color: color || '#fff', until: Date.now() + (ms || 1200), t0: Date.now() }; }

/* ============================== Sonido ============================== */
function tcSnd(kind) {
  if (typeof soundEnabled !== 'function' || !soundEnabled() || typeof playTone !== 'function') return;
  if (kind === 'kick') { playTone(150, 0, 0.07, 'triangle', 0.16); playTone(90, 0.01, 0.06, 'sine', 0.12); }
  else if (kind === 'shot') { playTone(110, 0, 0.12, 'square', 0.18); playTone(70, 0.02, 0.15, 'sine', 0.2); }
  else if (kind === 'whistleShort') { playTone(2900, 0, 0.16, 'square', 0.05); }
  else if (kind === 'whistle') { playTone(2900, 0, 0.14, 'square', 0.05); playTone(3050, 0.18, 0.3, 'square', 0.05); }
  else if (kind === 'whistleLong') { [0, 0.3, 0.6].forEach(function (t, i) { playTone(2950, t, i === 2 ? 0.6 : 0.22, 'square', 0.05); }); }
}
// Ambiente de grada: ruido filtrado que sube con las ocasiones.
function tcCrowdStart() {
  if (typeof soundEnabled !== 'function' || !soundEnabled() || typeof soundCtx !== 'function') return;
  var ctx = soundCtx();
  if (!ctx) return;
  try {
    var len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; data[i] = last * 3.5; }
    var src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    var filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 520; filt.Q.value = 0.6;
    var g = ctx.createGain(); g.gain.value = 0.0001;
    src.connect(filt); filt.connect(g); g.connect(ctx.destination); src.start();
    TC.crowdNode = { src: src, g: g, ctx: ctx };
  } catch (e) {}
}
function tcCrowdTarget() {
  var T = TC, b = T.ball;
  if (T.phase === 'goal') return 1;
  var near = Math.min(b.y, TC_L - b.y); // cerca de alguna portería
  return clamp(0.18 + (near < 25 ? (25 - near) / 25 * 0.45 : 0) + (b.kick && b.kick.shot ? 0.35 : 0), 0.15, 0.9);
}
function tcCrowdUpdate() {
  var n = TC.crowdNode;
  if (!n) return;
  if (!soundEnabled()) { n.g.gain.value = 0.0001; return; }
  n.g.gain.setTargetAtTime(0.012 + TC.crowd * 0.07, n.ctx.currentTime, 0.2);
}
function tcRoar() { if (TC) TC.crowd = 1.4; }
function tcCrowdStop() {
  var n = TC && TC.crowdNode;
  if (!n) return;
  try { n.g.gain.setTargetAtTime(0.0001, n.ctx.currentTime, 0.1); n.src.stop(n.ctx.currentTime + 0.5); } catch (e) {}
  TC.crowdNode = null;
}

/* ========== Supertécnicas en pantalla (vídeo o rótulo grande) ========== */
function tcPlayTechs(list, done) {
  var T = TC;
  if (!list.length) { done(); return; }
  var it = list.shift();
  var src = typeof mrTechVideoSrc === 'function' ? mrTechVideoSrc(it.tech.name) : null;
  if (typeof fxHaptic === 'function') fxHaptic('tech');
  if (!src) {
    T.video = true;
    tcBanner(it.tech.name, it.tech.color, 1300);
    setTimeout(function () { if (!TC || TC !== T) return; T.video = false; tcPlayTechs(list, done); }, 1300);
    return;
  }
  T.video = true;
  tcVideoPlay(src, tcName(it.who) + ' · ' + it.tech.name, it.tech.color, function () {
    if (!TC || TC !== T) return;
    T.video = false;
    tcPlayTechs(list, done);
  });
}
function tcVideoPlay(src, caption, color, onEnd) {
  var box = document.getElementById('tcVideo');
  if (!box) { onEnd(); return; }
  var v = box.querySelector('video');
  var ended = false;
  var finish = function () { if (ended) return; ended = true; clearTimeout(guard); tcVideoStop(); onEnd(); };
  var guard = setTimeout(finish, 9000);
  box._finish = finish;
  var webm = v.canPlayType('video/webm; codecs="vp9, opus"') === 'probably';
  v.src = src + (webm ? '.webm' : '.mp4');
  v.onended = finish;
  v.onerror = function () { if (/\.webm$/.test(v.src)) { v.src = src + '.mp4'; v.play().catch(finish); } else finish(); };
  box.querySelector('.tc-video-cap').textContent = caption;
  box.style.setProperty('--tech', color || '#ffd23f');
  box.classList.add('on');
  v.muted = !(typeof soundEnabled === 'function' && soundEnabled());
  var p = v.play();
  if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(finish); });
}
function tcVideoStop() {
  var box = document.getElementById('tcVideo');
  if (!box) return;
  var v = box.querySelector('video');
  if (v) { v.onended = null; v.onerror = null; v.pause(); try { v.removeAttribute('src'); v.load(); } catch (e) {} }
  box.classList.remove('on');
}
window.tcSkipVideo = function () { var box = document.getElementById('tcVideo'); if (box && box._finish) box._finish(); };

/* ============================== Pantalla ============================== */
function tcBuildDom() {
  var old = document.getElementById('tcRoot');
  if (old) old.remove();
  var live = TC.live;
  var you = typeof futDraftYouIdentity === 'function' ? futDraftYouIdentity(live) : { name: 'Tú', shield: getPlayerShieldPath() };
  var oppName = live.oppSide ? live.oppSide.name : 'Rival';
  var root = document.createElement('div');
  root.id = 'tcRoot';
  root.className = 'tc-root';
  root.setAttribute('data-nofeel', '1');
  root.innerHTML =
    '<div class="tc-top">' +
      '<div class="tc-team"><img src="' + escapeHtml(you.shield) + '" alt=""><span>' + escapeHtml(you.name) + '</span></div>' +
      '<div class="tc-score"><b id="tcScore">0 - 0</b><em id="tcMinute">1\'</em></div>' +
      '<div class="tc-team tc-team-opp"><span>' + escapeHtml(oppName) + '</span><img src="' + escapeHtml(teamShieldPath(oppName)) + '" alt=""></div>' +
    '</div>' +
    '<div class="tc-feed" id="tcFeed"></div>' +
    '<div class="tc-field" id="tcField"><canvas id="tcCanvas"></canvas></div>' +
    '<div class="tc-bottom">' +
      '<div class="tc-sel" id="tcSel"></div>' +
      '<button class="tc-btn tc-btn-shoot" id="tcShootBtn" type="button" onclick="tcAskShot()">¡Tirar!</button>' +
      '<button class="tc-btn tc-btn-pause" type="button" onclick="tcPause()" aria-label="Pausa">II</button>' +
    '</div>' +
    '<div class="tc-msg" id="tcMsg"></div>' +
    '<div class="tc-modal" id="tcModal"></div>' +
    '<div class="tc-video" id="tcVideo" onclick="tcSkipVideo()"><div class="tc-video-frame"><video playsinline preload="auto"></video></div><div class="tc-video-cap"></div><div class="tc-video-skip">Toca para saltar</div></div>';
  document.body.appendChild(root);
  document.body.classList.add('tc-lock');
  var cv = root.querySelector('#tcCanvas');
  cv.addEventListener('pointerdown', tcPointerDown);
  cv.addEventListener('pointermove', tcPointerMove);
  cv.addEventListener('pointerup', tcPointerUp);
  cv.addEventListener('pointercancel', function () { if (TC) TC.drag = null; });
}
function tcFit() {
  var cv = document.getElementById('tcCanvas');
  if (!cv) return null;
  var wrap = cv.parentNode;
  var w = wrap.clientWidth, h = wrap.clientHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  if (cv._w !== w || cv._h !== h || cv._dpr !== dpr) {
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv._w = w; cv._h = h; cv._dpr = dpr;
  }
  var base = w > h ? Math.min(TC_W + 14, TC_VIEW_W * w / h * 0.75) : TC_VIEW_W;
  var viewW = base / (TC.cam.z || 1);
  var s = w / viewW;
  return { cv: cv, ctx: cv.getContext('2d'), w: w, h: h, dpr: dpr, s: s, vw: viewW, vh: h / s };
}
function tcCamUpdate(F, dt) {
  var T = TC, b = T.ball;
  // mira un poco por delante del balón; se aleja en los balones largos
  var tx = b.x + b.vx * 0.35, ty = b.y + b.vy * 0.35;
  if (T.sp && (T.phase === 'setpiece' || T.phase === 'whistle')) { tx = T.sp.x; ty = T.sp.y + (T.sp.side === 'me' ? -8 : 8); }
  if (T.drag && T.drag.d) { tx = (tx + T.drag.d.x) / 2; ty = (ty + T.drag.d.y) / 2; }
  var speed = Math.hypot(b.vx, b.vy);
  var zt = !b.owner && (b.z > 1.5 || speed > 18) ? 0.82 : (T.sp && T.sp.kind === 'corner' ? 0.9 : 1);
  if (T.phase === 'goal') zt = 1.12;
  T.cam.z += (zt - T.cam.z) * Math.min(1, dt * 1.6);
  var mx = 6, my = 9;
  var minX = F.vw / 2 - mx, maxX = TC_W + mx - F.vw / 2;
  var minY = F.vh / 2 - my, maxY = TC_L + my - F.vh / 2;
  tx = minX > maxX ? TC_W / 2 : clamp(tx, minX, maxX);
  ty = minY > maxY ? TC_L / 2 : clamp(ty, minY, maxY);
  var k = Math.min(1, dt * 4);
  T.cam.x += (tx - T.cam.x) * k;
  T.cam.y += (ty - T.cam.y) * k;
}
// El campo se pinta una vez en un lienzo aparte y luego se copia.
function tcPitchCanvas() {
  if (tcPitchCanvas._c) return tcPitchCanvas._c;
  var P = 12, m = 16; // píxeles por metro y margen
  var c = document.createElement('canvas');
  c.width = (TC_W + m * 2) * P; c.height = (TC_L + m * 2) * P;
  var x = c.getContext('2d');
  var X = function (v) { return (v + m) * P; };
  // grada
  x.fillStyle = '#1b2440'; x.fillRect(0, 0, c.width, c.height);
  for (var i = 0; i < 2600; i++) {
    var px = Math.random() * c.width, py = Math.random() * c.height;
    if (px > X(-7) && px < X(TC_W + 7) && py > X(-8) && py < X(TC_L + 8)) continue;
    x.fillStyle = ['#ff5a5a', '#3d8bff', '#ffd23f', '#ffffff', '#8bd17c', '#c79bff'][i % 6];
    x.globalAlpha = 0.55; x.fillRect(px, py, P * 0.55, P * 0.55);
  }
  x.globalAlpha = 1;
  // césped de alrededor y vallas publicitarias
  x.fillStyle = '#2b8a36'; x.fillRect(X(-7), X(-8), (TC_W + 14) * P, (TC_L + 16) * P);
  var ads = ['INAZUMA', 'RAIMON', 'FÚTBOL FRONTIER', 'SUPER ONCE', 'INAZUMA', 'ROYAL'];
  var adCols = [['#0b1638', '#ffd23f'], ['#c81e2e', '#ffffff'], ['#1f4fbf', '#ffffff'], ['#ffd23f', '#0b1638']];
  x.font = '700 ' + Math.round(P * 1.1) + 'px Pixelify Sans, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (var a = 0; a < 7; a++) {
    var col = adCols[a % adCols.length];
    [[X(-6.5), X(a * 16 - 4), P * 1.4, P * 15], [X(TC_W + 5.1), X(a * 16 - 4), P * 1.4, P * 15]].forEach(function (r, k) {
      x.fillStyle = col[0]; x.fillRect(r[0], r[1], r[2], r[3]);
      x.save(); x.translate(r[0] + r[2] / 2, r[1] + r[3] / 2); x.rotate(k ? Math.PI / 2 : -Math.PI / 2);
      x.fillStyle = col[1]; x.fillText(ads[a % ads.length], 0, 0); x.restore();
    });
  }
  for (var a2 = 0; a2 < 5; a2++) {
    var col2 = adCols[(a2 + 1) % adCols.length];
    [X(-7.5), X(TC_L + 6.1)].forEach(function (yy) {
      x.fillStyle = col2[0]; x.fillRect(X(a2 * 16 - 6), yy, P * 15, P * 1.4);
      x.fillStyle = col2[1]; x.fillText(ads[(a2 + 2) % ads.length], X(a2 * 16 - 6) + P * 7.5, yy + P * 0.72);
    });
  }
  // franjas de corte de césped
  var band = TC_L / 14;
  for (var s = 0; s < 14; s++) { x.fillStyle = s % 2 ? '#3daf48' : '#46bc51'; x.fillRect(X(-3), X(s * band), (TC_W + 6) * P, band * P + 1); }
  // textura
  for (var t = 0; t < 9000; t++) {
    x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    x.fillRect(X(-3) + Math.random() * (TC_W + 6) * P, X(-3) + Math.random() * (TC_L + 6) * P, 2, 3);
  }
  // líneas
  x.strokeStyle = 'rgba(255,255,255,0.92)'; x.lineWidth = P * 0.14; x.fillStyle = '#fff';
  x.strokeRect(X(0), X(0), TC_W * P, TC_L * P);
  x.beginPath(); x.moveTo(X(0), X(TC_L / 2)); x.lineTo(X(TC_W), X(TC_L / 2)); x.stroke();
  x.beginPath(); x.arc(X(TC_W / 2), X(TC_L / 2), 9.15 * P, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.arc(X(TC_W / 2), X(TC_L / 2), 0.3 * P, 0, Math.PI * 2); x.fill();
  [0, 1].forEach(function (top) {
    var y0 = top ? 0 : TC_L, dir = top ? 1 : -1;
    x.strokeRect(X((TC_W - TC_BOX_W) / 2), top ? X(0) : X(TC_L - TC_BOX_D), TC_BOX_W * P, TC_BOX_D * P);
    x.strokeRect(X((TC_W - TC_SIX_W) / 2), top ? X(0) : X(TC_L - TC_SIX_D), TC_SIX_W * P, TC_SIX_D * P);
    x.beginPath(); x.arc(X(TC_W / 2), X(y0 + dir * 11), 0.25 * P, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(X(TC_W / 2), X(y0 + dir * 11), 9.15 * P, top ? 0.205 * Math.PI : 1.205 * Math.PI, top ? 0.795 * Math.PI : 1.795 * Math.PI); x.stroke();
    [0, TC_W].forEach(function (cx) {
      x.beginPath(); x.arc(X(cx), X(y0), 1 * P, top ? (cx ? 0.5 * Math.PI : 0) : (cx ? Math.PI : 1.5 * Math.PI), top ? (cx ? Math.PI : 0.5 * Math.PI) : (cx ? 1.5 * Math.PI : 2 * Math.PI)); x.stroke();
    });
  });
  tcPitchCanvas._c = { c: c, P: P, m: m };
  return tcPitchCanvas._c;
}
function tcDraw(dt) {
  var T = TC;
  if (!T) return;
  tcHud(false);
  var F = tcFit();
  if (!F || !F.w || !F.h) return;
  tcCamUpdate(F, dt || 0.016);
  T.view = { s: F.s, w: F.w, h: F.h, cx: T.cam.x, cy: T.cam.y };
  var ctx = F.ctx, s = F.s;
  var X = function (x) { return (x - T.cam.x) * s + F.w / 2; };
  var Y = function (y) { return (y - T.cam.y) * s + F.h / 2; };
  ctx.setTransform(F.dpr, 0, 0, F.dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  var PC = tcPitchCanvas();
  ctx.fillStyle = '#1b2440'; ctx.fillRect(0, 0, F.w, F.h);
  ctx.drawImage(PC.c, X(-PC.m), Y(-PC.m), (TC_W + PC.m * 2) * s, (TC_L + PC.m * 2) * s);
  var now = Date.now(), b = T.ball;
  var mineBall = b.owner && b.owner.side === 'me';
  // Portería rival resaltada cuando puedes tirar.
  if (mineBall && T.phase === 'play' && b.owner.line > 0 && tcShootRange(b.owner) < 32) {
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(now / 160) * 0.15;
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(X(TC_W / 2 - TC_GOAL / 2 - 0.6), Y(-2.4), (TC_GOAL + 1.2) * s, 2.8 * s);
    ctx.restore();
  }
  // Línea del fuera de juego cuando atacas
  if (mineBall && T.phase === 'play') {
    var ol = tcOffsideLineF('me');
    if (ol > 0.5) { ctx.save(); ctx.strokeStyle = 'rgba(255,230,128,0.35)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; var oy = Y(TC_L * (1 - ol)); ctx.beginPath(); ctx.moveTo(X(0), oy); ctx.lineTo(X(TC_W), oy); ctx.stroke(); ctx.restore(); }
  }
  // efectos de suelo
  T.fx.forEach(function (f) {
    var k = f.t / f.life;
    if (f.k === 'dust') { ctx.fillStyle = 'rgba(230,220,180,' + (0.45 * (1 - k)) + ')'; ctx.beginPath(); ctx.ellipse(X(f.x), Y(f.y), (0.4 + k) * s, (0.25 + k * 0.5) * s, 0, 0, Math.PI * 2); ctx.fill(); }
  });
  // Caminos dibujados (flechas) y el trazo que estás haciendo.
  T.me.forEach(function (d) { if (!d.off && d.path && d.path.length) tcDrawPath(ctx, [{ x: d.x, y: d.y }].concat(d.path), X, Y, s, b.owner === d ? '#ffd23f' : '#ffffff'); });
  if (T.drag && T.drag.d && T.drag.pts.length > 1) tcDrawPath(ctx, T.drag.pts, X, Y, s, '#ffe680');
  // Punto de saque en los balones parados
  if (T.sp && (T.phase === 'setpiece' || T.phase === 'whistle')) {
    ctx.save(); ctx.strokeStyle = T.sp.side === 'me' ? '#5fe39a' : '#ff8a8a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(X(T.sp.x), Y(T.sp.y), (1.6 + Math.sin(now / 180) * 0.3) * s, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  // porterías de abajo (detrás de los jugadores)
  tcDrawGoal(ctx, X, Y, s, false, now);
  // Estela del tiro.
  if (b.kick && b.kick.shot && T.trail) {
    T.trail.push({ x: b.x, y: b.y, z: b.z }); if (T.trail.length > 16) T.trail.shift();
    var col = b.kick.shot.tech ? b.kick.shot.tech.color : 'rgba(255,255,255,0.7)';
    T.trail.forEach(function (pt, k) { ctx.globalAlpha = (k + 1) / T.trail.length * (b.kick.shot.tech ? 0.85 : 0.45); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(pt.x), Y(pt.y) - pt.z * s * 0.55, (b.kick.shot.tech ? 0.55 : 0.28) * s + k * 0.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
  }
  var r = Math.max(11, 1.35 * s);
  // jugadores y balón ordenados por profundidad
  var items = tcAlive(T.opp.concat(T.me)).map(function (d) { return { y: d.y, d: d }; });
  items.push({ y: b.y + 0.01, ball: true });
  items.sort(function (a, c) { return a.y - c.y; });
  items.forEach(function (it) { if (it.ball) tcDrawBall(ctx, X, Y, s, r); else tcDrawPlayer(ctx, it.d, X, Y, r, now); });
  // portería de arriba (por delante: la red tapa)
  tcDrawGoal(ctx, X, Y, s, true, now);
  // banderín del asistente
  if (T.flag && now - T.flag.t < 1800) {
    var fxp = X(T.flag.x), fyp = Y(T.flag.y);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(fxp - 2, fyp - r * 2.4, 3, r * 2); ctx.fillStyle = '#ff3b4e'; ctx.fillRect(fxp + 1, fyp - r * 2.4, r * 0.9, r * 0.6);
  }
  tcDrawMinimap(ctx, F);
  // Rótulo grande (supertécnicas, gol, paradas).
  if (T.banner) {
    var age = (now - T.banner.t0) / 1000;
    var sc = Math.min(1, age * 6);
    var fs = Math.round(Math.min(F.w / 11, 34) * (0.6 + 0.4 * sc));
    ctx.save();
    ctx.font = '700 ' + fs + 'px Pixelify Sans, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var ty = F.h * 0.42;
    var tw = Math.min(F.w - 20, ctx.measureText(T.banner.text).width + 36);
    ctx.fillStyle = 'rgba(8,16,48,0.82)';
    ctx.fillRect(F.w / 2 - tw / 2, ty - fs * 0.85, tw, fs * 1.7);
    ctx.fillStyle = T.banner.color; ctx.fillRect(F.w / 2 - tw / 2, ty - fs * 0.85, tw, 4); ctx.fillRect(F.w / 2 - tw / 2, ty + fs * 0.85 - 4, tw, 4);
    ctx.lineWidth = 5; ctx.strokeStyle = '#0a1030'; ctx.fillStyle = '#fff';
    ctx.strokeText(T.banner.text, F.w / 2, ty, F.w - 30); ctx.fillText(T.banner.text, F.w / 2, ty, F.w - 30);
    ctx.restore();
  }
  // tarjeta en grande
  if (T.cardShow && now - T.cardShow.t < 1600) {
    var cw = Math.min(70, F.w * 0.16), ch = cw * 1.4, k2 = Math.min(1, (now - T.cardShow.t) / 200);
    ctx.save(); ctx.translate(F.w / 2, F.h * 0.25); ctx.rotate(-0.12); ctx.scale(k2, k2);
    ctx.fillStyle = T.cardShow.card === 'red' ? '#e2232f' : '#ffd23f'; ctx.strokeStyle = '#0a1030'; ctx.lineWidth = 3;
    ctx.fillRect(-cw / 2, -ch / 2, cw, ch); ctx.strokeRect(-cw / 2, -ch / 2, cw, ch); ctx.restore();
  }
}
function tcDrawGoal(ctx, X, Y, s, top, now) {
  var T = TC, gx0 = TC_W / 2 - TC_GOAL / 2, gx1 = TC_W / 2 + TC_GOAL / 2, depth = 2.2;
  var y0 = top ? 0 : TC_L, back = top ? -depth : TC_L + depth;
  var lift = TC_BAR * s * 0.55;
  ctx.save();
  var ripple = T.net && ((T.net.side === 'opp') === top) ? Math.sin(T.net.t * 18) * (1.4 - T.net.t) * 0.5 : 0;
  // red
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.moveTo(X(gx0), Y(y0) - lift); ctx.lineTo(X(gx1), Y(y0) - lift); ctx.lineTo(X(gx1), Y(back + (top ? -ripple : ripple))); ctx.lineTo(X(gx0), Y(back + (top ? -ripple : ripple))); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
  for (var nx = gx0; nx <= gx1 + 0.01; nx += 0.6) { ctx.beginPath(); ctx.moveTo(X(nx), Y(y0) - lift); ctx.lineTo(X(nx), Y(back + (T.net && Math.abs(nx - T.net.x) < 1.5 ? (top ? -ripple * 2 : ripple * 2) : 0))); ctx.stroke(); }
  for (var k = 0; k <= 4; k++) { var yy = Y(y0) - lift + (Y(back) - (Y(y0) - lift)) * k / 4; ctx.beginPath(); ctx.moveTo(X(gx0), yy); ctx.lineTo(X(gx1), yy); ctx.stroke(); }
  // palos y larguero
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(3, 0.24 * s); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(X(gx0), Y(y0)); ctx.lineTo(X(gx0), Y(y0) - lift); ctx.lineTo(X(gx1), Y(y0) - lift); ctx.lineTo(X(gx1), Y(y0)); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(X(gx0) + 2, Y(y0) + 2); ctx.lineTo(X(gx1) + 2, Y(y0) + 2); ctx.stroke();
  ctx.restore();
}
function tcDrawBall(ctx, X, Y, s, r) {
  var T = TC, b = T.ball;
  if (T.phase === 'goal' && !b.owner && T.net) { /* dentro de la red */ }
  var bx = X(b.x), by = Y(b.y), br = Math.max(4, r * 0.34) * (1 + b.z * 0.06);
  var lift = b.z * s * 0.55;
  ctx.fillStyle = 'rgba(0,0,0,' + Math.max(0.12, 0.32 - b.z * 0.04) + ')';
  ctx.beginPath(); ctx.ellipse(bx + 1, by + br * 0.6, br * (1 - Math.min(0.4, b.z * 0.05)), br * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  var cy = by - lift;
  ctx.save();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(bx, cy, br, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.clip();
  // gajos que giran al rodar
  ctx.fillStyle = '#1b1b1b';
  var a = b.spin;
  for (var i = 0; i < 3; i++) {
    var px = bx + Math.cos(a + i * 2.1) * br * 0.55, py = cy + Math.sin(a * 0.7 + i * 2.1) * br * 0.55;
    ctx.beginPath(); ctx.arc(px, py, br * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function tcDrawPath(ctx, pts, X, Y, s, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, 0.3 * s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([Math.max(6, 0.8 * s), Math.max(5, 0.6 * s)]);
  ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.moveTo(X(pts[0].x), Y(pts[0].y));
  for (var i = 1; i < pts.length; i++) ctx.lineTo(X(pts[i].x), Y(pts[i].y));
  ctx.stroke();
  ctx.setLineDash([]);
  var a = pts[pts.length - 2] || pts[0], z = pts[pts.length - 1];
  var ang = Math.atan2(Y(z.y) - Y(a.y), X(z.x) - X(a.x)), L = Math.max(10, 1.1 * s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(X(z.x), Y(z.y));
  ctx.lineTo(X(z.x) - Math.cos(ang - 0.5) * L, Y(z.y) - Math.sin(ang - 0.5) * L);
  ctx.lineTo(X(z.x) - Math.cos(ang + 0.5) * L, Y(z.y) - Math.sin(ang + 0.5) * L);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
// Jugador chibi con piernas que corren, la cara de su ficha y su dorsal.
function tcDrawPlayer(ctx, d, X, Y, r, now) {
  var T = TC, x = X(d.x), y = Y(d.y);
  var owner = T.ball.owner === d;
  var sel = T.sel === d && d.side === 'me';
  var sp = Math.hypot(d.vx, d.vy);
  ctx.save();
  if (d.stun > 0) ctx.globalAlpha = 0.6;
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y + r * 1.25, r * 0.9, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  if (owner || sel) {
    ctx.strokeStyle = owner ? '#ffd23f' : 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x, y + r * 1.25, r * (1.2 + Math.sin(now / 160) * 0.08), r * 0.46, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // estirada del portero o entrada en plancha: todo el cuerpo inclinado
  var tilt = 0;
  if (d.dive && d.dive.t > 0) tilt = d.dive.dir * Math.min(1.25, d.dive.t * 5);
  else if (d.slide > 0) tilt = (d.fx >= 0 ? 1 : -1) * 0.9;
  else tilt = clamp(d.vx / 30, -0.18, 0.18);
  ctx.translate(x, y + r * 1.1); ctx.rotate(tilt); ctx.translate(-x, -(y + r * 1.1));
  var sh = d.line === 0 ? TC_GK_SHIRT[d.side] : TC_SHIRT[d.side];
  // piernas
  var swing = sp > 0.6 ? Math.sin(d.anim * 3.2) * Math.min(1, sp / 6) : (TC.phase === 'play' && d.line > 0 ? Math.sin(d.anim * 3.2) * 0.18 : 0);
  if (d.kickAnim > 0) swing = 1.2;
  ctx.strokeStyle = '#0a1030'; ctx.lineWidth = Math.max(3, r * 0.3); ctx.lineCap = 'round';
  var hipY = y + r * 1.05, legL = r * 0.55;
  [[-1, swing], [1, -swing]].forEach(function (lg) {
    var lx = x + lg[0] * r * 0.28;
    ctx.beginPath(); ctx.moveTo(lx, hipY); ctx.lineTo(lx + lg[1] * r * 0.35, hipY + legL * (1 - Math.abs(lg[1]) * 0.15)); ctx.stroke();
  });
  ctx.strokeStyle = d.side === 'me' ? '#e8eefc' : '#2a1a1a'; ctx.lineWidth = Math.max(2, r * 0.18);
  [[-1, swing], [1, -swing]].forEach(function (lg) {
    var lx = x + lg[0] * r * 0.28;
    ctx.beginPath(); ctx.moveTo(lx, hipY + legL * 0.35); ctx.lineTo(lx + lg[1] * r * 0.28, hipY + legL * 0.85); ctx.stroke();
  });
  // cuerpo
  var bw = r * 1.25, bh = r * 0.95, by = y + r * 0.2;
  var g = ctx.createLinearGradient(0, by, 0, by + bh);
  g.addColorStop(0, sh[0]); g.addColorStop(1, sh[1]);
  ctx.fillStyle = g; ctx.strokeStyle = '#0a1030'; ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - bw / 2, by, bw, bh, r * 0.32); else ctx.rect(x - bw / 2, by, bw, bh);
  ctx.fill(); ctx.stroke();
  // brazos
  ctx.strokeStyle = sh[1]; ctx.lineWidth = Math.max(2.5, r * 0.24);
  var arm = d.line === 0 && d.dive ? -1 : -swing * 0.8;
  ctx.beginPath(); ctx.moveTo(x - bw / 2 + 2, by + r * 0.2); ctx.lineTo(x - bw / 2 - r * 0.2, by + r * 0.55 + arm * r * 0.3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + bw / 2 - 2, by + r * 0.2); ctx.lineTo(x + bw / 2 + r * 0.2, by + r * 0.55 - arm * r * 0.3); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(r * 0.58) + 'px Pixelify Sans, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(d.num), x, by + bh * 0.55);
  // cabeza con su cara (bota un poco al correr)
  var hy = y - r * 0.32 - Math.abs(swing) * r * 0.06, hr = r * 0.84;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, hy, hr, 0, Math.PI * 2); ctx.closePath();
  ctx.fillStyle = MR_ELEM_COLOR[d.p.tipo] || '#888'; ctx.fill();
  ctx.clip();
  if (d.img && d.img.complete && d.img.naturalWidth) ctx.drawImage(d.img, x - hr, hy - hr, hr * 2, hr * 2);
  else { ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(hr * 0.8) + 'px Pixelify Sans, system-ui'; ctx.fillText(initials(d.p.nombre), x, hy); }
  ctx.restore();
  ctx.lineWidth = 2.5; ctx.strokeStyle = TC_COLORS[d.side];
  ctx.beginPath(); ctx.arc(x, hy, hr, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  if (d.stun > 0) {
    ctx.fillStyle = '#ffe680'; ctx.font = '700 ' + Math.round(r * 0.7) + 'px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('✦', x + Math.cos(now / 120) * r * 0.8, y - r * 1.4 + Math.sin(now / 120) * 3);
  }
  if (d.yellow) { ctx.fillStyle = '#ffd23f'; ctx.fillRect(x + r * 0.7, y - r * 1.1, r * 0.32, r * 0.44); }
  // cansancio: gota de sudor
  if (d.stam < 0.35 && d.side === 'me') { ctx.fillStyle = '#9fd8ff'; ctx.beginPath(); ctx.arc(x - r * 0.9, y - r * 0.9 + Math.sin(now / 200) * 2, r * 0.14, 0, Math.PI * 2); ctx.fill(); }
  // Nombre del que lleva el balón y del seleccionado.
  if (owner || sel || (d.run && d.side === 'me')) {
    ctx.font = '700 ' + Math.max(11, Math.round(r * 0.62)) + 'px Pixelify Sans, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#0a1030'; ctx.fillStyle = owner ? '#ffe680' : d.run ? '#9dffbf' : '#fff';
    var label = d.run && !owner ? '¡' + d.p.nombre + '!' : d.p.nombre;
    ctx.strokeText(label, x, hy - hr - 3); ctx.fillText(label, x, hy - hr - 3);
  }
}
function tcDrawMinimap(ctx, F) {
  var T = TC;
  var mw = Math.round(Math.min(62, F.w * 0.16)), mh = Math.round(mw * TC_L / TC_W);
  var mx = F.w - mw - 8, my = 8, k = mw / TC_W;
  ctx.save();
  ctx.globalAlpha = 0.86;
  ctx.fillStyle = '#1f7a2b'; ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(mx, my, mw, mh);
  ctx.beginPath(); ctx.moveTo(mx, my + mh / 2); ctx.lineTo(mx + mw, my + mh / 2); ctx.stroke();
  ctx.strokeRect(mx + (TC_W - TC_BOX_W) / 2 * k, my, TC_BOX_W * k, TC_BOX_D * k);
  ctx.strokeRect(mx + (TC_W - TC_BOX_W) / 2 * k, my + mh - TC_BOX_D * k, TC_BOX_W * k, TC_BOX_D * k);
  ctx.globalAlpha = 1;
  tcAlive(T.me.concat(T.opp)).forEach(function (d) {
    ctx.fillStyle = TC_COLORS[d.side];
    ctx.beginPath(); ctx.arc(mx + clamp(d.x, 0, TC_W) * k, my + clamp(d.y, 0, TC_L) * k, 2.2, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx + clamp(T.ball.x, 0, TC_W) * k, my + clamp(T.ball.y, 0, TC_L) * k, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,128,0.95)'; ctx.lineWidth = 1;
  ctx.strokeRect(mx + (T.cam.x - F.vw / 2) * k, my + (T.cam.y - F.vh / 2) * k, F.vw * k, F.vh * k);
  ctx.restore();
}
function tcHud(force) {
  var T = TC, live = T.live;
  var sc = document.getElementById('tcScore');
  if (sc) { var t = live.myGoals + ' - ' + live.oppGoals; if (sc.textContent !== t) sc.textContent = t; }
  var mn = document.getElementById('tcMinute');
  if (mn) { var m = (T.half >= 3 ? 'Prórroga · ' : '') + tcMinute() + '\''; if (mn.textContent !== m) mn.textContent = m; }
  var b = T.ball, c = b.owner && b.owner.side === 'me' ? b.owner : null;
  var shoot = document.getElementById('tcShootBtn');
  if (shoot) {
    var on = !!(c && c.line > 0 && (T.phase === 'play' || (T.phase === 'setpiece' && T.sp && T.sp.kind === 'free' && T.sp.taker === c)) && tcShootRange(c) < 40);
    if (shoot.classList.contains('on') !== on) shoot.classList.toggle('on', on);
  }
  var d = T.sel;
  var sel = document.getElementById('tcSel');
  if (sel && d) {
    var key = d.p.id + '|' + Math.round(d.tp) + '|' + Math.round(d.stam * 20);
    if (sel._k !== key || force) {
      sel._k = key;
      sel.innerHTML = '<span class="tc-sel-name">' + escapeHtml(d.p.nombre) + '</span>' +
        '<span class="tc-bars"><span class="tc-tp"><i style="width:' + Math.round(d.tp / d.tpMax * 100) + '%"></i></span><span class="tc-st"><i style="width:' + Math.round(d.stam * 100) + '%"></i></span></span>' +
        '<span class="tc-tp-num">PT ' + Math.round(d.tp) + '</span>';
    }
  }
  var msg = document.getElementById('tcMsg');
  if (msg && msg.textContent !== (T.msg || '')) msg.textContent = T.msg || '';
}

/* =========== Ventanas: duelo, tiro, parada, descanso, pausa y ayuda =========== */
function tcFaceHtml(d) {
  var src = d.p.sprite || ('https://inazumarun.es/assets/sprites/' + d.p.id + '.png');
  return '<span class="tc-face tc-face-' + d.side + '" style="--el:' + (MR_ELEM_COLOR[d.p.tipo] || '#888') + '"><img src="' + escapeHtml(src) + '" alt="" onerror="this.style.visibility=\'hidden\'"></span>';
}
function tcTechBtnHtml(t, i, tp, fn) {
  var ok = tp >= t.cost;
  return '<button class="tc-opt tc-opt-tech" type="button" style="--tech:' + t.color + '"' + (ok ? '' : ' disabled') + ' onclick="' + fn + '(\'tech' + i + '\')">' +
    '<b>' + escapeHtml(t.name) + '</b><small>' + (typeof techElementIconHtml === 'function' ? techElementIconHtml(t.element, 14) : '') + ' Potencia ' + t.power + ' · <em>' + t.cost + ' PT</em></small></button>';
}
function tcStatsHtml() {
  var T = TC, a = T.stats.me, o = T.stats.opp;
  var tot = (T.poss.me + T.poss.opp) || 1, pm = Math.round(T.poss.me / tot * 100);
  var row = function (label, x, y) { var s = (x + y) || 1; return '<div class="tc-stat"><b>' + x + '</b><span>' + label + '<i><em style="width:' + (x / s * 100) + '%"></em></i></span><b>' + y + '</b></div>'; };
  return '<div class="tc-stats">' +
    row('Posesión %', pm, 100 - pm) + row('Tiros', a.shots, o.shots) + row('A puerta', a.onTarget, o.onTarget) +
    row('Córners', a.corners, o.corners) + row('Faltas', a.fouls, o.fouls) + row('Fueras de juego', a.offsides, o.offsides) +
    row('Pases buenos', a.passOk, o.passOk) + (a.yellow + o.yellow ? row('Amarillas', a.yellow, o.yellow) : '') + (a.red + o.red ? row('Rojas', a.red, o.red) : '') +
    '</div>';
}
function tcRenderModal() {
  var box = document.getElementById('tcModal');
  if (!box) return;
  var T = TC, m = T.modal;
  if (!m) { box.classList.remove('on'); box.innerHTML = ''; return; }
  var html = '';
  if (m.type === 'duel') {
    var opts = TC_DUEL_OPTS[m.role];
    var other = m.role === 'att' ? m.def : m.att;
    html = '<div class="tc-card">' +
      '<div class="tc-card-kicker">' + (m.role === 'att' ? '¡Te salen al paso!' : '¡A por el balón!') + '</div>' +
      '<div class="tc-vs">' + tcFaceHtml(m.mine) + '<span class="tc-vs-mid">VS</span>' + tcFaceHtml(other) + '</div>' +
      '<div class="tc-vs-names"><span>' + escapeHtml(m.mine.p.nombre) + '</span><span>' + escapeHtml(other.p.nombre) + '</span></div>' +
      '<div class="tc-opts">' + opts.map(function (o) { return '<button class="tc-opt" type="button" onclick="tcResolveDuel(\'' + o.id + '\')"><b>' + o.label + '</b><small>' + o.sub + '</small></button>'; }).join('') + '</div>' +
      (m.techs.length ? '<div class="tc-opts tc-opts-tech">' + m.techs.map(function (t, i) { return tcTechBtnHtml(t, i, m.mine.tp, 'tcResolveDuel'); }).join('') + '</div>' : '') +
      '<div class="tc-card-foot">PT de ' + escapeHtml(m.mine.p.nombre) + ': <b>' + Math.round(m.mine.tp) + '</b> · Aire <b>' + Math.round(m.mine.stam * 100) + '%</b></div>' +
    '</div>';
  } else if (m.type === 'shot') {
    var gk = tcKeeper('opp');
    html = '<div class="tc-card">' +
      '<div class="tc-card-kicker">' + (m.penalty ? '¡Penalti!' : '¡Ocasión de gol!') + '</div>' +
      '<div class="tc-vs">' + tcFaceHtml(m.shooter) + '<span class="tc-vs-mid">VS</span>' + tcFaceHtml(gk) + '</div>' +
      '<div class="tc-vs-names"><span>' + escapeHtml(m.shooter.p.nombre) + '</span><span>' + escapeHtml(gk.p.nombre) + '</span></div>' +
      '<p class="tc-card-note">' + (m.penalty ? 'Desde los once metros' : 'A ' + Math.round(m.dist) + ' metros' + (m.dist > 24 ? ': de lejos cuesta más' : '')) + '</p>' +
      '<div class="tc-opts"><button class="tc-opt" type="button" onclick="tcResolveMyShot(\'normal\')"><b>Tiro</b><small>Normal</small></button></div>' +
      (m.techs.length ? '<div class="tc-opts tc-opts-tech">' + m.techs.map(function (t, i) { return tcTechBtnHtml(t, i, m.shooter.tp, 'tcResolveMyShot'); }).join('') + '</div>' : '') +
      (m.penalty ? '' : '<button class="tc-link" type="button" onclick="tcResolveMyShot(\'cancel\')">Mejor no tirar</button>') +
    '</div>';
  } else if (m.type === 'save') {
    html = '<div class="tc-card tc-card-danger">' +
      '<div class="tc-card-kicker">' + (m.penalty ? '¡Penalti en contra!' : '¡Tiro del rival!') + '</div>' +
      '<div class="tc-vs">' + tcFaceHtml(m.keeper) + '<span class="tc-vs-mid">VS</span>' + tcFaceHtml(m.shooter) + '</div>' +
      '<div class="tc-vs-names"><span>' + escapeHtml(m.keeper.p.nombre) + '</span><span>' + escapeHtml(m.shooter.p.nombre) + '</span></div>' +
      (m.tech ? '<p class="tc-card-note" style="color:' + m.tech.color + '">Va a usar ' + escapeHtml(m.tech.name) + ' · Potencia ' + m.tech.power + '</p>' : '<p class="tc-card-note">Tiro normal desde ' + Math.round(m.dist) + ' metros</p>') +
      '<div class="tc-opts"><button class="tc-opt" type="button" onclick="tcResolveSave(\'normal\')"><b>Atrapar</b><small>Parada normal</small></button></div>' +
      (m.techs.length ? '<div class="tc-opts tc-opts-tech">' + m.techs.map(function (t, i) { return tcTechBtnHtml(t, i, m.keeper.tp, 'tcResolveSave'); }).join('') + '</div>' : '') +
      '<div class="tc-card-foot">PT de ' + escapeHtml(m.keeper.p.nombre) + ': <b>' + Math.round(m.keeper.tp) + '</b></div>' +
    '</div>';
  } else if (m.type === 'break') {
    html = '<div class="tc-card">' +
      '<div class="tc-card-kicker">' + escapeHtml(m.title) + '</div>' +
      '<div class="tc-big-score">' + T.live.myGoals + ' - ' + T.live.oppGoals + '</div>' +
      tcStatsHtml() +
      '<p class="tc-card-note">Tus jugadores recuperan PT y aire.</p>' +
      '<div class="tc-opts"><button class="tc-opt tc-opt-go" type="button" onclick="tcStartHalf(' + m.next + ')"><b>' + (m.next === 3 ? 'Jugar la prórroga' : 'Segunda parte') + '</b></button></div>' +
      '<button class="tc-link" type="button" onclick="tcSimulateRest()">Simular el resto</button>' +
    '</div>';
  } else if (m.type === 'pause') {
    html = '<div class="tc-card">' +
      '<div class="tc-card-kicker">Pausa</div>' +
      '<div class="tc-big-score">' + T.live.myGoals + ' - ' + T.live.oppGoals + '</div>' +
      tcStatsHtml() +
      '<div class="tc-opts tc-opts-col">' +
        '<button class="tc-opt tc-opt-go" type="button" onclick="tcResume()"><b>Seguir</b></button>' +
        '<button class="tc-opt" type="button" onclick="tcOpenHelp()"><b>Cómo se juega</b></button>' +
        '<button class="tc-opt" type="button" onclick="tcSimulateRest()"><b>Simular el resto</b></button>' +
      '</div>' +
    '</div>';
  } else if (m.type === 'help') {
    html = '<div class="tc-card tc-card-help">' +
      '<div class="tc-card-kicker">Cómo se juega</div>' +
      '<ul class="tc-help">' +
        '<li><b>Desliza</b> desde un jugador tuyo para dibujarle el camino. Si lleva el balón, conduce por ahí.</li>' +
        '<li>Con balón, <b>toca a un compañero</b> para pasarle o <b>toca un hueco</b> para pasar al espacio. De lejos o con rivales en medio, el pase va por alto.</li>' +
        '<li>Los rivales pueden <b>cortar</b> el pase si pasa cerca. Los compañeros con el nombre en verde están pidiendo el balón al espacio.</li>' +
        '<li>Cuidado con el <b>fuera de juego</b>: la línea amarilla discontinua marca al penúltimo defensor.</li>' +
        '<li>Cerca del área, <b>toca la portería</b> o <b>¡Tirar!</b>. El tiro puede ir fuera, chocar con un defensa o que el portero lo despeje.</li>' +
        '<li>En los <b>duelos</b>, Regate gana a Entrada y Cuerpo gana a Bloqueo. Una entrada puede ser falta, y en el área, penalti.</li>' +
        '<li>Balón fuera: saque de banda, córner o saque de puerta. Tócale a quién sacar.</li>' +
        '<li>Las <b>supertécnicas</b> gastan PT. Correr a tope cansa: la barra verde es el aire.</li>' +
      '</ul>' +
      '<div class="tc-opts"><button class="tc-opt tc-opt-go" type="button" onclick="tcCloseHelp()"><b>¡A jugar!</b></button></div>' +
    '</div>';
  }
  box.innerHTML = html;
  box.classList.add('on');
}
window.tcPause = function () {
  if (!TC || TC.modal || TC.video) return;
  TC.modal = { type: 'pause' };
  tcRenderModal();
};
window.tcResume = function () { if (!TC) return; TC.modal = null; TC.last = 0; tcRenderModal(); };
function tcOpenHelp() {
  TC.helpBack = TC.modal && TC.modal.type === 'pause' ? TC.modal : null;
  TC.modal = { type: 'help' };
  tcRenderModal();
}
window.tcCloseHelp = function () {
  if (!TC) return;
  if (G.meta && !G.meta.tactilHelpSeen) { G.meta.tactilHelpSeen = true; if (typeof saveMeta === 'function') saveMeta(G.meta); }
  TC.modal = TC.helpBack || null;
  TC.helpBack = null;
  TC.last = 0;
  tcRenderModal();
};
window.tcAskShot = tcAskShot;
window.tcResolveDuel = tcResolveDuel;
window.tcResolveMyShot = tcResolveMyShot;
window.tcResolveSave = tcResolveSave;
window.tcStartHalf = tcStartHalf;
window.tcSimulateRest = tcSimulateRest;
window.tcOpenHelp = tcOpenHelp;

/* ============================ Toques y trazos ============================ */
function tcToWorld(ev) {
  var cv = document.getElementById('tcCanvas');
  var rect = cv.getBoundingClientRect();
  var V = TC.view || { s: rect.width / TC_VIEW_W, w: rect.width, h: rect.height, cx: TC.cam.x, cy: TC.cam.y };
  return { x: (ev.clientX - rect.left - V.w / 2) / V.s + V.cx, y: (ev.clientY - rect.top - V.h / 2) / V.s + V.cy, s: V.s };
}
function tcPlayerAt(pt, side) {
  var T = TC, best = null, bd = Math.max(2.4, 30 / pt.s);
  var owner = T.ball.owner;
  if (owner && owner.side === side && tcDist(owner, { x: pt.x, y: pt.y - 0.4 }) < bd) return owner;
  tcAlive(tcTeam(side)).forEach(function (d) { var dd = tcDist(d, { x: pt.x, y: pt.y - 0.4 }); if (dd < bd) { bd = dd; best = d; } });
  return best;
}
function tcPointerDown(ev) {
  var T = TC;
  if (!T || T.modal || T.video || T.paused) return;
  ev.preventDefault();
  try { ev.target.setPointerCapture(ev.pointerId); } catch (e) {}
  var pt = tcToWorld(ev);
  T.drag = { d: T.phase === 'play' ? tcPlayerAt(pt, 'me') : null, pts: [{ x: pt.x, y: pt.y }], start: pt, moved: false };
  if (T.drag.d) { T.drag.pts = [{ x: T.drag.d.x, y: T.drag.d.y }]; T.sel = T.drag.d; }
}
function tcPointerMove(ev) {
  var T = TC;
  if (!T || !T.drag) return;
  var pt = tcToWorld(ev);
  var last = T.drag.pts[T.drag.pts.length - 1];
  if (Math.hypot(pt.x - T.drag.start.x, pt.y - T.drag.start.y) > Math.max(1.6, 14 / pt.s)) T.drag.moved = true;
  if (T.drag.d && Math.hypot(pt.x - last.x, pt.y - last.y) > 1) {
    if (T.drag.pts.length < 60) T.drag.pts.push({ x: clamp(pt.x, 0.5, TC_W - 0.5), y: clamp(pt.y, 0.5, TC_L - 0.5) });
  }
}
function tcPointerUp(ev) {
  var T = TC;
  if (!T || !T.drag) return;
  var drag = T.drag;
  T.drag = null;
  if (T.modal || T.video) return;
  var pt = tcToWorld(ev);
  // balón parado tuyo: el toque decide el saque
  if (T.phase === 'setpiece' && T.sp && T.sp.side === 'me') {
    if (drag.moved) return;
    tcMySetPieceTap(pt, tcPlayerAt(pt, 'me'));
    return;
  }
  if (T.phase !== 'play') return;
  var b = T.ball;
  var c = b.owner && b.owner.side === 'me' ? b.owner : null;
  if (drag.d && drag.moved && drag.pts.length > 1) {
    drag.d.path = drag.pts.slice(1);
    drag.d.hold = 0; drag.d.run = null; drag.d.support = null;
    if (drag.d === c) T.msg = 'Toca a un compañero para pasar o la portería para tirar';
    return;
  }
  if (drag.moved) return;
  var tapped = tcPlayerAt(pt, 'me');
  if (c) {
    if (tapped && tapped !== c) {
      // al que va en carrera se le pasa al espacio, por delante
      var lx = tapped.run ? tapped.run.x : tapped.x + tapped.vx * 0.5, ly = tapped.run ? tapped.run.y : tapped.y + tapped.vy * 0.5;
      tcKick(c, lx, ly, tapped);
      return;
    }
    if (tapped === c) { c.path = null; return; }
    var inGoal = pt.y < 5 && Math.abs(pt.x - TC_W / 2) < TC_GOAL / 2 + 6;
    if (inGoal && c.line > 0) { tcAskShot(); return; }
    if (pt.x > 0 && pt.x < TC_W && pt.y > 0 && pt.y < TC_L) tcKick(c, pt.x, pt.y, null);
    return;
  }
  // Sin balón: el tuyo más cercano va adonde toques.
  if (tapped) { T.sel = tapped; return; }
  var near = tcAlive(T.me).filter(function (d) { return d.line > 0 && d.stun <= 0; }).sort(function (a, d) { return tcDist(a, pt) - tcDist(d, pt); })[0];
  if (near) { near.path = [{ x: clamp(pt.x, 0.5, TC_W - 0.5), y: clamp(pt.y, 0.5, TC_L - 0.5) }]; near.hold = 0; near.run = null; T.sel = near; }
}
