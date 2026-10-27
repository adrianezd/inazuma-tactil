/* ---------------------------------------------------------------------
   PARTIDO TÁCTIL (Inazuma Táctil): el partido se juega con el dedo, en
   vertical, como en los Inazuma Eleven de la DS.
   - Desliza desde un jugador tuyo para dibujarle el camino (con balón,
     lo lleva conduciendo).
   - Con balón: toca a un compañero para pasarle, toca un hueco para
     pasar al espacio y toca la portería (o ¡Tirar!) para chutar.
   - Cuando dos jugadores se encuentran hay duelo: eliges Regate o Cuerpo
     (atacando), Entrada o Bloqueo (defendiendo), o una supertécnica si
     te llegan los PT. En los tiros eliges tiro normal o supertécnica, y
     en los del rival, cómo para tu portero.
   Sustituye a Ver partido y a Decidir en todos los modos: el resultado
   es el que juegues (sin guion), igual que en Tú decides.
   Coordenadas en metros: x de 0 a TC_W (ancho), y de 0 (portería rival,
   arriba) a TC_L (tu portería, abajo). Tú atacas siempre hacia arriba.
   --------------------------------------------------------------------- */
var TC_W = 68, TC_L = 105, TC_GOAL = 12, TC_BOX_W = 40, TC_BOX_D = 16.5;
var TC_HALF_SEC = 150, TC_ET_HALF_SEC = 55;
var TC_LINE_F = [0.03, 0.2, 0.39, 0.57];
var TC_VIEW_W = 38;
var TC_BEATS = { Fuego: 'Bosque', Bosque: 'Viento', Viento: 'Montaña', 'Montaña': 'Fuego' };
var TC_COLORS = { me: '#2f7bff', opp: '#ff3b4e' };
var TC_SHIRT = { me: ['#3d8bff', '#1c4fc4'], opp: ['#ff5a5a', '#b81e2e'] };
var TC = null;

// Ver partido y Decidir pasan por aquí. El banquillo de Carrera de jugador
// (entras más tarde) y "solo tu jugador" siguen con el motor de siempre.
var _tcOrigRtStart = futDraftRtStart;
futDraftRtStart = function (live) {
  if (live.subIn || live.decideSolo || live.pen) return _tcOrigRtStart(live);
  tcStart(live);
};

// ----- Utilidades -----
function tcDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function tcOther(side) { return side === 'me' ? 'opp' : 'me'; }
function tcTeam(side) { return side === 'me' ? TC.me : TC.opp; }
function tcKeeper(side) { return tcTeam(side).find(function (d) { return d.line === 0; }) || tcTeam(side)[0]; }
function tcWorld(side, x, f) { return { x: x, y: side === 'me' ? TC_L * (1 - f) : TC_L * f }; }
function tcF(side, y) { return side === 'me' ? 1 - y / TC_L : y / TC_L; }
function tcGoalOf(side) { return { x: TC_W / 2, y: side === 'me' ? TC_L : 0 }; } // portería que defiende side
function tcRnd(a, b) { return a + Math.random() * (b - a); }
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

// ----- Arranque -----
function tcMakeSide(side, dots, k) {
  return dots.map(function (dd, i) {
    var p = dd.player;
    var st = tcStatsOf(p, k);
    var tpMax = Math.round(70 + (p.especial || 60) * 0.5);
    return {
      side: side, p: p, line: dd.line, num: i + 1,
      hx: clamp((dd.hy || 34) / 68, 0.06, 0.94), hf: TC_LINE_F[dd.line] || 0.4,
      x: TC_W / 2, y: TC_L / 2, vx: 0, vy: 0, fx: 0, fy: side === 'me' ? -1 : 1,
      path: null, hold: 0, stun: 0, immune: 0, cd: 0, st: st,
      spd: dd.line === 0 ? 6.4 : 6.3 + clamp((st.esp + st.pase) / 2 - 50, 0, 50) / 50 * 2.1,
      tp: tpMax, tpMax: tpMax, img: tcImg(p)
    };
  });
}
function tcStart(live) {
  if (TC && TC.live === live && !TC.ended) return;
  // Sin guion: el marcador es el que se juega (como en Tú decides), con
  // prórroga y penaltis jugables si hace falta desempatar.
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
    ball: { x: TC_W / 2, y: TC_L / 2, mode: 'dead', owner: null },
    half: live.inExtraTime ? 3 : 1, t: 0, phase: 'kickoff', phaseT: 1.2,
    modal: null, paused: false, video: false, banner: null, cam: { x: TC_W / 2, y: TC_L / 2 },
    last: 0, poss: { me: 0, opp: 0 }, shots: { me: 0, opp: 0 }, aiT: 0.6, gkHold: 0,
    sel: null, drag: null, lastPass: null, ended: false
  };
  tcSetHalfLen();
  if (live.small4) TC.me.concat(TC.opp).forEach(function (d) { d.hf = Math.min(0.62, d.hf * 1.35); });
  tcBuildDom();
  tcKickoff('me', true);
  if (typeof playKickoffSound === 'function') playKickoffSound();
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
      var w = tcWorld(s, d.hx * TC_W, Math.min(d.hf, 0.44));
      d.kx = w.x; d.ky = w.y; d.path = null; d.hold = 0; d.stun = 0; d.immune = 0;
      if (snap) { d.x = w.x; d.y = w.y; }
    });
  });
  var fw = tcTeam(side).filter(function (d) { return d.line > 0; }).sort(function (a, b) { return b.hf - a.hf || Math.abs(a.hx - 0.5) - Math.abs(b.hx - 0.5); })[0] || tcTeam(side)[0];
  fw.kx = TC_W / 2; fw.ky = TC_L / 2 + (side === 'me' ? 1 : -1);
  if (snap) { fw.x = fw.kx; fw.y = fw.ky; }
  T.ball = { x: TC_W / 2, y: TC_L / 2, mode: 'owned', owner: fw };
  if (side === 'me') T.sel = fw;
  T.phase = 'kickoff';
  T.phaseT = snap ? 1.0 : 2.2;
  T.aiT = 1.2;
  T.msg = side === 'me' ? 'Saque: toca a un compañero para pasar' : 'Saca el rival';
}

// ----- Bucle -----
function tcLoop(ts) {
  if (!TC || TC.ended) return;
  var live = G.futdraft && G.futdraft.live;
  if (G.screen !== 'futdraftLive' || live !== TC.live) { tcTeardown(); return; }
  var dt = TC.last ? Math.min(0.05, (ts - TC.last) / 1000) : 0.016;
  TC.last = ts;
  if (!TC.modal && !TC.paused && !TC.video && !G.confirmLeaveOpen) tcStep(dt);
  tcDraw();
  if (TC && !TC.ended) requestAnimationFrame(tcLoop);
}
function tcStep(dt) {
  var T = TC, b = T.ball;
  if (T.banner && T.banner.until < Date.now()) T.banner = null;
  if (T.phase !== 'play') {
    T.phaseT -= dt;
    tcMoveAll(dt, true);
    if (T.phaseT <= 0) tcEndPhase();
    return;
  }
  T.t += dt;
  T.live.minute = tcMinute();
  if (T.t >= T.halfSec && (b.mode === 'owned' || b.mode === 'loose')) { tcHalfEnd(); return; }
  if (b.owner) T.poss[b.owner.side] += dt * 10;
  [T.me, T.opp].forEach(function (list) { list.forEach(function (d) { d.tp = Math.min(d.tpMax, d.tp + dt * 0.35); }); });
  tcAi(dt);
  tcMoveAll(dt, false);
  tcBall(dt);
  tcDuels();
}
function tcEndPhase() {
  var T = TC;
  if (T.phase === 'kickoff') { T.phase = 'play'; T.ball.owner.immune = 2.6; return; }
  if (T.phase === 'goal') {
    if (T.live.firstTo && Math.max(T.live.myGoals, T.live.oppGoals) >= T.live.firstTo) { tcFinish(); return; }
    tcKickoff(T.concede, false);
    return;
  }
  T.phase = 'play';
}

// ----- Movimiento -----
function tcHomeTarget(d) {
  var T = TC, b = T.ball;
  if (d.line === 0) {
    var g = tcGoalOf(d.side);
    var out = tcDist(b, g) < 20 ? 3.5 : 1.6;
    return { x: clamp(TC_W / 2 + (b.x - TC_W / 2) * 0.35, TC_W / 2 - 6, TC_W / 2 + 6), y: d.side === 'me' ? TC_L - out : out };
  }
  var attacking = !!(b.owner && b.owner.side === d.side);
  var f = d.hf + (attacking ? 0.15 : -0.04);
  f += (tcF(d.side, b.y) - 0.5) * 0.5;
  f = clamp(f, d.line === 1 ? 0.07 : 0.12, 0.88);
  var x = TC_W * 0.07 + d.hx * TC_W * 0.86;
  x += (b.x - x) * 0.22;
  return tcWorld(d.side, x, f);
}
// Quién va a por el balón: el más cercano de cada equipo (dos del rival
// si presiona). Los tuyos con camino dibujado no cuentan.
function tcChasers() {
  var T = TC, b = T.ball, res = [];
  var target = b.mode === 'pass' || b.mode === 'loose' ? { x: b.tx, y: b.ty } : b;
  ['me', 'opp'].forEach(function (s) {
    if (b.owner && b.owner.side === s) return;
    if (b.mode === 'pass' && b.to && b.to.side === s) return;
    var cands = tcTeam(s).filter(function (d) { return d.line > 0 && d.stun <= 0 && !(d.path && d.path.length) && d.hold <= 0; });
    cands.sort(function (a, c) { return tcDist(a, target) - tcDist(c, target); });
    var n = s === 'opp' ? 2 : 1;
    if (b.mode === 'loose') n = 1;
    for (var i = 0; i < n && i < cands.length; i++) res.push(cands[i]);
  });
  return res;
}
function tcMoveAll(dt, settle) {
  var T = TC, b = T.ball;
  var chasers = settle ? [] : tcChasers();
  [T.me, T.opp].forEach(function (list) {
    list.forEach(function (d) {
      d.immune = Math.max(0, d.immune - dt);
      d.cd = Math.max(0, d.cd - dt);
      if (d.stun > 0) { d.stun -= dt; d.vx = d.vy = 0; return; }
      var tx, ty, sp = d.spd;
      if (settle) { tx = d.kx; ty = d.ky; }
      else if (d.path && d.path.length) {
        var pt = d.path[0];
        if (Math.hypot(pt.x - d.x, pt.y - d.y) < 0.9) { d.path.shift(); if (!d.path.length) { d.path = null; d.hold = b.owner === d ? 0 : 2.2; } }
        if (d.path && d.path.length) { tx = d.path[0].x; ty = d.path[0].y; } else { tx = d.x; ty = d.y; }
        if (b.owner === d) sp *= 0.9;
      } else if (b.owner === d) {
        if (d.side === 'opp' && d.aiTo) { tx = d.aiTo.x; ty = d.aiTo.y; sp *= 0.88; } else { tx = d.x; ty = d.y; }
      } else if (d.hold > 0) { d.hold -= dt; tx = d.x; ty = d.y; }
      else if (chasers.indexOf(d) !== -1) {
        var tgt = b.mode === 'pass' || b.mode === 'loose' ? { x: b.tx, y: b.ty } : b;
        tx = tgt.x; ty = tgt.y;
        if (d.side === 'me') sp *= 0.92;
      } else {
        var h = tcHomeTarget(d); tx = h.x; ty = h.y; sp *= 0.8;
      }
      var dx = tx - d.x, dy = ty - d.y, dist = Math.hypot(dx, dy);
      if (dist > 0.15) {
        var v = Math.min(sp, dist / Math.max(dt, 0.001));
        d.vx = dx / dist * v; d.vy = dy / dist * v;
        d.x += d.vx * dt; d.y += d.vy * dt;
        d.fx = dx / dist; d.fy = dy / dist;
      } else { d.vx = d.vy = 0; }
      d.x = clamp(d.x, -1, TC_W + 1); d.y = clamp(d.y, -0.5, TC_L + 0.5);
    });
  });
  // Sin amontonarse: se separan un poco los que se pisan.
  var all = T.me.concat(T.opp);
  for (var i = 0; i < all.length; i++) for (var j = i + 1; j < all.length; j++) {
    var a = all[i], c = all[j], dd = tcDist(a, c);
    if (dd > 0.01 && dd < 1.3 && !(b.owner === a || b.owner === c) ) {
      var push = (1.3 - dd) / 2, ux = (a.x - c.x) / dd, uy = (a.y - c.y) / dd;
      a.x += ux * push; a.y += uy * push; c.x -= ux * push; c.y -= uy * push;
    }
  }
}

// ----- Balón -----
function tcBall(dt) {
  var T = TC, b = T.ball;
  if (b.mode === 'owned' && b.owner) {
    var o = b.owner;
    var fx = o.fx, fy = o.fy;
    if (!o.vx && !o.vy) { fx = 0; fy = o.side === 'me' ? -1 : 1; }
    b.x = o.x + fx * 0.8; b.y = o.y + fy * 0.8;
    if (o.side === 'me' && o.line === 0) {
      T.gkHold += dt;
      if (T.gkHold > 4) tcAutoPass(o);
    } else T.gkHold = 0;
    return;
  }
  if (b.mode === 'pass' || b.mode === 'shot') {
    b.t += dt;
    var k = Math.min(1, b.t / b.dur);
    b.x = b.fx + (b.tx - b.fx) * k; b.y = b.fy + (b.ty - b.fy) * k;
    if (b.mode === 'shot') { T.trail = (T.trail || []).concat([{ x: b.x, y: b.y }]).slice(-14); }
    if (k >= 1) {
      if (b.mode === 'shot') { tcShotArrived(); return; }
      if (b.to && tcDist(b.to, b) < 3 && b.to.stun <= 0) tcGive(b.to);
      else { b.mode = 'loose'; b.vx = (b.tx - b.fx) / b.dur * 0.25; b.vy = (b.ty - b.fy) / b.dur * 0.25; }
    }
    return;
  }
  if (b.mode === 'loose') {
    b.x += (b.vx || 0) * dt; b.y += (b.vy || 0) * dt;
    b.vx = (b.vx || 0) * Math.pow(0.2, dt); b.vy = (b.vy || 0) * Math.pow(0.2, dt);
    b.x = clamp(b.x, 0.5, TC_W - 0.5); b.y = clamp(b.y, 0.5, TC_L - 0.5);
    b.tx = b.x; b.ty = b.y;
    var best = null, bd = 1.4;
    T.me.concat(T.opp).forEach(function (d) { if (d.stun > 0 || d.cd > 0) return; var dd = tcDist(d, b); if (dd < bd) { bd = dd; best = d; } });
    if (best) tcGive(best);
  }
}
function tcGive(d) {
  var T = TC;
  T.ball = { x: d.x, y: d.y, mode: 'owned', owner: d };
  T.trail = null;
  d.immune = Math.max(d.immune, 0.7);
  d.path = d.path && d.path.length ? d.path : null;
  T.gkHold = 0;
  T.aiT = 0.5 + Math.random() * 0.4;
  if (d.side === 'me') { T.sel = d; T.msg = d.line === 0 ? 'Toca a un compañero para sacar' : 'Desliza desde él para conducir, toca a un compañero o la portería'; }
  else T.msg = 'Defiende: desliza a tus jugadores hacia el balón';
}
// Pase: al jugador (con algo de ventaja) o al espacio. Un rival cerca de
// la línea del pase puede cortarlo según su defensa y tu pase.
function tcKick(from, tx, ty, to) {
  var T = TC;
  tx = clamp(tx, 0.5, TC_W - 0.5); ty = clamp(ty, 0.5, TC_L - 0.5);
  var dist = Math.hypot(tx - from.x, ty - from.y);
  var cut = null;
  tcTeam(tcOther(from.side)).forEach(function (e) {
    if (cut || e.stun > 0) return;
    var vx = tx - from.x, vy = ty - from.y, len2 = vx * vx + vy * vy || 1;
    var u = ((e.x - from.x) * vx + (e.y - from.y) * vy) / len2;
    if (u < 0.15 || u > 0.92) return;
    var px = from.x + vx * u, py = from.y + vy * u;
    if (Math.hypot(e.x - px, e.y - py) > 2.3) return;
    var chance = clamp(0.22 + (e.st.def - from.st.pase) / 180 + (dist > 25 ? 0.12 : 0), 0.08, 0.6);
    if (Math.random() < chance) cut = { d: e, x: px, y: py };
  });
  T.lastPass = { p: from.p, side: from.side, at: T.t, half: T.half };
  if (cut) { tx = cut.x; ty = cut.y; to = cut.d; }
  T.ball = { x: from.x, y: from.y, mode: 'pass', owner: null, fx: from.x, fy: from.y, tx: tx, ty: ty, t: 0, dur: Math.max(0.25, dist / 23), to: to || null };
  from.cd = 0.5;
  if (to) { to.path = [{ x: tx, y: ty }]; to.hold = 0; }
  else {
    var mate = tcTeam(from.side).filter(function (d) { return d !== from && d.line > 0; }).sort(function (a, c) { return Math.hypot(a.x - tx, a.y - ty) - Math.hypot(c.x - tx, c.y - ty); })[0];
    if (mate) { mate.path = [{ x: tx, y: ty }]; mate.hold = 0; }
  }
}
function tcAutoPass(gk) {
  var mate = tcOpenMate(gk, false);
  if (mate) tcKick(gk, mate.x, mate.y, mate);
}
// El compañero más libre (más lejos del rival más cercano), mejor si está más adelantado.
function tcOpenMate(d, forward) {
  var rivals = tcTeam(tcOther(d.side));
  var best = null, bs = -Infinity;
  tcTeam(d.side).forEach(function (m) {
    if (m === d || m.line === 0 || m.stun > 0) return;
    var free = Math.min.apply(null, rivals.map(function (r) { return tcDist(r, m); }));
    var dist = tcDist(m, d);
    if (dist > 38) return;
    var ahead = tcF(d.side, m.y) - tcF(d.side, d.y);
    var s = Math.min(free, 9) + (forward ? ahead * 30 : ahead * 8) - dist * 0.08 + Math.random() * 2;
    if (s > bs) { bs = s; best = m; }
  });
  return best;
}

// ----- IA del rival (y del portero) -----
function tcAi(dt) {
  var T = TC, b = T.ball;
  if (!(b.mode === 'owned' && b.owner && b.owner.side === 'opp')) return;
  var c = b.owner;
  T.aiT -= dt;
  if (T.aiT > 0) return;
  T.aiT = 0.45 + Math.random() * 0.55;
  if (c.line === 0) { tcAutoPass(c); return; }
  var goal = tcGoalOf('me');
  var dg = tcDist(c, goal);
  var central = Math.abs(c.x - TC_W / 2) < 20;
  if ((dg < 23 && central && Math.random() < 0.6) || (dg < 14) || (dg < 30 && central && Math.random() < 0.1)) { tcRivalShoot(c); return; }
  var near = Math.min.apply(null, T.me.map(function (m) { return tcDist(m, c); }));
  if (near < 6 && Math.random() < 0.45) {
    var mate = tcOpenMate(c, true);
    if (mate) { tcKick(c, mate.x + mate.vx * 0.3, mate.y + mate.vy * 0.3, mate); return; }
  }
  // Conduce hacia tu portería esquivando al defensor más cercano.
  var closest = T.me.slice().sort(function (a, m) { return tcDist(a, c) - tcDist(m, c); })[0];
  var side = closest && closest.x > c.x ? -1 : 1;
  c.aiTo = { x: clamp(c.x + side * tcRnd(2, 7) + (TC_W / 2 - c.x) * 0.15, 3, TC_W - 3), y: Math.min(TC_L - 2, c.y + tcRnd(7, 12)) };
}

// ----- Duelos -----
function tcDuels() {
  var T = TC, b = T.ball;
  if (b.mode !== 'owned' || !b.owner) return;
  var c = b.owner;
  if (c.immune > 0 || c.line === 0) return;
  var rivals = tcTeam(tcOther(c.side));
  for (var i = 0; i < rivals.length; i++) {
    var d = rivals[i];
    if (d.stun > 0 || d.cd > 0) continue;
    if (d.line === 0 && tcF(d.side, c.y) > 0.17) continue;
    if (tcDist(c, d) < 1.8) { tcOpenDuel(c, d); return; }
  }
}
var TC_DUEL_OPTS = {
  att: [{ id: 'regate', label: 'Regate', sub: 'Control' }, { id: 'cuerpo', label: 'Cuerpo', sub: 'Físico' }],
  def: [{ id: 'entrada', label: 'Entrada', sub: 'Robo' }, { id: 'bloqueo', label: 'Bloqueo', sub: 'Aguante' }]
};
// Regate gana a Entrada y Cuerpo gana a Bloqueo; al revés, gana el defensor.
var TC_DUEL_WINS = { regate: 'entrada', cuerpo: 'bloqueo' };
function tcOpenDuel(att, def) {
  var T = TC;
  var mine = att.side === 'me' ? att : def;
  var role = att.side === 'me' ? 'att' : 'def';
  att.vx = att.vy = def.vx = def.vy = 0;
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
  T.modal = null;
  tcRenderModal();
  var vids = [];
  if (attCh.id === 'tech') vids.push({ tech: attCh.tech, who: att });
  if (defCh.id === 'tech') vids.push({ tech: defCh.tech, who: def });
  tcPlayTechs(vids, function () {
    var aName = { regate: 'Regate', cuerpo: 'Cuerpo a cuerpo', entrada: 'Entrada', bloqueo: 'Bloqueo' };
    if (attWin) {
      def.stun = 1.5; att.immune = 1.5;
      tcBanner(attCh.id === 'tech' ? attCh.tech.name : (aName[attCh.id] + ' de ' + att.p.nombre), att.side === 'me' ? '#5fe39a' : '#ff8a8a', 1100);
      tcTeam(def.side).forEach(function (d) { d.cd = Math.max(d.cd, 0.6); });
    } else {
      att.stun = 1.4; def.immune = 1.4;
      tcGive(def);
      tcBanner(defCh.id === 'tech' ? defCh.tech.name : '¡Balón robado!', def.side === 'me' ? '#5fe39a' : '#ff8a8a', 1100);
      tcTeam(att.side).forEach(function (d) { d.cd = Math.max(d.cd, 0.6); });
    }
  });
}

// ----- Tiros -----
function tcShootRange(d) { return tcDist(d, tcGoalOf('opp')); }
function tcAskShot() {
  var T = TC, b = T.ball, c = b.owner;
  if (!c || c.side !== 'me' || T.phase !== 'play' || T.modal) return;
  var dist = tcShootRange(c);
  if (dist > 40) { tcBanner('Demasiado lejos para tirar', '#ffd166', 900); return; }
  c.vx = c.vy = 0;
  T.modal = { type: 'shot', shooter: c, dist: dist, techs: tcTechs(c, 'tiro') };
  tcRenderModal();
}
function tcShotValue(d, tech, dist, keeperElem) {
  var v = d.st.tiro + Math.random() * 20 - Math.max(0, dist - 14) * 1.35;
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
  tcTakeShot(m.shooter, gk, tech, gTech, m.dist);
}
function tcRivalShoot(c) {
  var T = TC;
  var techs = tcTechs(c, 'tiro').filter(function (t) { return c.tp >= t.cost; });
  var dist = tcDist(c, tcGoalOf('me'));
  var tech = techs.length && Math.random() < (dist < 20 ? 0.55 : 0.3) ? techs[0] : null;
  c.vx = c.vy = 0;
  var gk = tcKeeper('me');
  T.modal = { type: 'save', shooter: c, keeper: gk, tech: tech, dist: dist, techs: tcTechs(gk, 'portero') };
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
  tcTakeShot(m.shooter, m.keeper, m.tech, gTech, m.dist);
}
function tcTakeShot(shooter, gk, tech, gTech, dist) {
  var T = TC;
  T.shots[shooter.side]++;
  var S = tcShotValue(shooter, tech, dist, gTech ? gTech.element : gk.p.tipo);
  var K = tcKeepValue(gk, gTech, tech ? tech.element : shooter.p.tipo);
  var goal = S > K;
  var vids = [];
  if (tech) vids.push({ tech: tech, who: shooter });
  if (gTech) vids.push({ tech: gTech, who: gk });
  tcPlayTechs(vids, function () {
    var g = tcGoalOf(tcOther(shooter.side));
    var tx = g.x + tcRnd(-TC_GOAL / 2 + 1, TC_GOAL / 2 - 1);
    var ty = shooter.side === 'me' ? -1.2 : TC_L + 1.2;
    if (!goal) { tx = clamp(tx, gk.x - 2, gk.x + 2); ty = shooter.side === 'me' ? 1 : TC_L - 1; }
    T.ball = { x: shooter.x, y: shooter.y, mode: 'shot', owner: null, fx: shooter.x, fy: shooter.y, tx: tx, ty: ty, t: 0, dur: 0.5, shooter: shooter, keeper: gk, goal: goal, tech: tech, gTech: gTech };
    T.trail = [];
  });
}
function tcShotArrived() {
  var T = TC, b = T.ball;
  if (b.goal) { tcGoal(b.shooter); return; }
  tcGive(b.keeper);
  b = T.ball;
  b.owner.immune = 1.5;
  tcBanner(b.owner.side === 'me' ? '¡Paradón de ' + b.owner.p.nombre + '!' : '¡Lo para ' + b.owner.p.nombre + '!', b.owner.side === 'me' ? '#5fe39a' : '#ff8a8a', 1200);
}
function tcGoal(shooter) {
  var T = TC, live = T.live, side = shooter.side;
  var lp = T.lastPass;
  var assist = lp && lp.side === side && lp.half === T.half && T.t - lp.at < 8 && lp.p !== shooter.p ? lp.p : null;
  var ev = { minute: tcMinute(), side: side, scorer: shooter.p, assist: assist };
  if (side === 'me') live.myGoals++; else live.oppGoals++;
  live.revealed.push(ev);
  live.lastGoalSide = side;
  live.goalSeq = (live.goalSeq || 0) + 1;
  T.concede = tcOther(side);
  T.ball.mode = 'dead';
  T.phase = 'goal';
  T.phaseT = 2.6;
  T.trail = null;
  tcTeam(side).forEach(function (d) { d.kx = d.x; d.ky = d.y; });
  tcTeam(T.concede).forEach(function (d) { d.kx = d.x; d.ky = d.y; });
  tcBanner('¡GOL de ' + shooter.p.nombre + '!', side === 'me' ? '#ffd23f' : '#ff8a8a', 2400);
  if (typeof playGoalSound === 'function') playGoalSound();
  if (side === 'me' && typeof fxConfetti === 'function') fxConfetti();
  tcHud(true);
}

// ----- Descanso, prórroga y final -----
function tcHalfEnd() {
  var T = TC, live = T.live;
  T.trail = null;
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
  T.me.concat(T.opp).forEach(function (d) { d.tp = Math.min(d.tpMax, d.tp + d.tpMax * 0.35); });
  tcRenderModal();
  tcKickoff(n % 2 === 0 ? 'opp' : 'me', false);
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
      var pool = tcTeam(side).filter(function (d) { return d.line > 0; });
      for (var i = 0; i < n; i++) {
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
}

// ----- Supertécnicas en pantalla (vídeo o rótulo grande) -----
function tcBanner(text, color, ms) { TC.banner = { text: text, color: color || '#fff', until: Date.now() + (ms || 1200), t0: Date.now() }; }
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
  tcVideoPlay(src, it.who.p.nombre + ' · ' + it.tech.name, it.tech.color, function () {
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

// ----- Pantalla -----
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
  var dpr = window.devicePixelRatio || 1;
  if (cv._w !== w || cv._h !== h || cv._dpr !== dpr) {
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv._w = w; cv._h = h; cv._dpr = dpr;
  }
  var viewW = w > h ? Math.min(TC_W + 10, TC_VIEW_W * w / h * 0.75) : TC_VIEW_W;
  var s = w / viewW;
  return { cv: cv, ctx: cv.getContext('2d'), w: w, h: h, dpr: dpr, s: s, vw: viewW, vh: h / s };
}
function tcCamUpdate(F) {
  var T = TC, b = T.ball;
  var tx = b.x, ty = b.y;
  if (T.drag && T.drag.d) { tx = (tx + T.drag.d.x) / 2; ty = (ty + T.drag.d.y) / 2; }
  var mx = 5, my = 7;
  var minX = F.vw / 2 - mx, maxX = TC_W + mx - F.vw / 2;
  var minY = F.vh / 2 - my, maxY = TC_L + my - F.vh / 2;
  tx = minX > maxX ? TC_W / 2 : clamp(tx, minX, maxX);
  ty = minY > maxY ? TC_L / 2 : clamp(ty, minY, maxY);
  T.cam.x += (tx - T.cam.x) * 0.08;
  T.cam.y += (ty - T.cam.y) * 0.08;
}
function tcDraw() {
  var T = TC;
  if (!T) return;
  tcHud(false);
  var F = tcFit();
  if (!F || !F.w || !F.h) return;
  tcCamUpdate(F);
  var ctx = F.ctx, s = F.s;
  var X = function (x) { return (x - T.cam.x) * s + F.w / 2; };
  var Y = function (y) { return (y - T.cam.y) * s + F.h / 2; };
  ctx.setTransform(F.dpr, 0, 0, F.dpr, 0, 0);
  // Césped a franjas, como en la DS.
  ctx.fillStyle = '#2f9a3a'; ctx.fillRect(0, 0, F.w, F.h);
  var band = TC_L / 14;
  for (var i = -2; i < 16; i++) { ctx.fillStyle = i % 2 ? '#3fb24a' : '#47be52'; ctx.fillRect(X(-8), Y(i * band), (TC_W + 16) * s, band * s + 1); }
  // Líneas.
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = Math.max(2, 0.18 * s);
  ctx.strokeRect(X(0), Y(0), TC_W * s, TC_L * s);
  ctx.beginPath(); ctx.moveTo(X(0), Y(TC_L / 2)); ctx.lineTo(X(TC_W), Y(TC_L / 2)); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(TC_W / 2), Y(TC_L / 2), 9.15 * s, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(TC_W / 2), Y(TC_L / 2), 0.35 * s, 0, Math.PI * 2); ctx.fill();
  [0, 1].forEach(function (top) {
    var y0 = top ? 0 : TC_L, dir = top ? 1 : -1;
    ctx.strokeRect(X((TC_W - TC_BOX_W) / 2), top ? Y(0) : Y(TC_L - TC_BOX_D), TC_BOX_W * s, TC_BOX_D * s);
    ctx.strokeRect(X((TC_W - 18.3) / 2), top ? Y(0) : Y(TC_L - 5.5), 18.3 * s, 5.5 * s);
    ctx.beginPath(); ctx.arc(X(TC_W / 2), Y(y0 + dir * 11), 0.3 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(X(TC_W / 2), Y(y0 + dir * 11), 9.15 * s, top ? 0.2 * Math.PI : 1.2 * Math.PI, top ? 0.8 * Math.PI : 1.8 * Math.PI); ctx.stroke();
    // Portería con red.
    var gx = X((TC_W - TC_GOAL) / 2), gw = TC_GOAL * s, gh = 2.4 * s, gy = top ? Y(0) - gh : Y(TC_L);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(gx, gy, gw, gh);
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1;
    for (var nx = gx; nx <= gx + gw; nx += 0.8 * s) { ctx.beginPath(); ctx.moveTo(nx, gy); ctx.lineTo(nx, gy + gh); ctx.stroke(); }
    for (var ny = gy; ny <= gy + gh; ny += 0.8 * s) { ctx.beginPath(); ctx.moveTo(gx, ny); ctx.lineTo(gx + gw, ny); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(3, 0.3 * s); ctx.strokeRect(gx, gy, gw, gh);
    ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = Math.max(2, 0.18 * s);
  });
  var now = Date.now(), b = T.ball;
  var mineBall = b.mode === 'owned' && b.owner && b.owner.side === 'me';
  // Portería rival resaltada cuando puedes tirar.
  if (mineBall && T.phase === 'play' && b.owner.line > 0 && tcShootRange(b.owner) < 32) {
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(now / 160) * 0.2;
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(X((TC_W - TC_GOAL) / 2 - 1), Y(-2.6), (TC_GOAL + 2) * s, 3.4 * s);
    ctx.restore();
  }
  // Caminos dibujados (flechas) y el trazo que estás haciendo.
  T.me.forEach(function (d) { if (d.path && d.path.length) tcDrawPath(ctx, [{ x: d.x, y: d.y }].concat(d.path), X, Y, s, b.owner === d ? '#ffd23f' : '#ffffff'); });
  if (T.drag && T.drag.d && T.drag.pts.length > 1) tcDrawPath(ctx, T.drag.pts, X, Y, s, '#ffe680');
  // Estela del tiro.
  if (b.mode === 'shot' && T.trail) {
    var col = b.tech ? b.tech.color : 'rgba(255,255,255,0.6)';
    T.trail.forEach(function (pt, k) { ctx.globalAlpha = (k + 1) / T.trail.length * (b.tech ? 0.9 : 0.5); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(pt.x), Y(pt.y), (b.tech ? 0.6 : 0.3) * s + k * 0.5, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
  }
  var r = Math.max(12, 1.5 * s);
  T.opp.concat(T.me).slice().sort(function (a, c) { return a.y - c.y; }).forEach(function (d) { tcDrawPlayer(ctx, d, X, Y, r, now); });
  // Balón.
  var bx = X(b.x), by = Y(b.y), br = Math.max(4, r * 0.38);
  if (b.mode !== 'dead') {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(bx + 2, by + 3, br, br * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(bx, by, br * 0.38, 0, Math.PI * 2); ctx.fill();
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
}
function tcDrawPath(ctx, pts, X, Y, s, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, 0.32 * s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
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
// Jugador con cuerpo de camiseta y la cara encima, al estilo chibi.
function tcDrawPlayer(ctx, d, X, Y, r, now) {
  var T = TC, x = X(d.x), y = Y(d.y);
  var owner = T.ball.owner === d;
  var sel = T.sel === d && d.side === 'me';
  ctx.save();
  if (d.stun > 0) ctx.globalAlpha = 0.55;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y + r * 1.25, r * 0.95, r * 0.36, 0, 0, Math.PI * 2); ctx.fill();
  if (owner || sel) {
    ctx.strokeStyle = owner ? '#ffd23f' : 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x, y + r * 1.25, r * (1.25 + Math.sin(now / 160) * 0.08), r * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // Cuerpo.
  var sh = TC_SHIRT[d.side];
  if (d.line === 0) sh = d.side === 'me' ? ['#ffb627', '#c77800'] : ['#9b6bff', '#5a2fc0'];
  var bw = r * 1.3, bh = r * 1.05, by = y + r * 0.25;
  var g = ctx.createLinearGradient(0, by, 0, by + bh);
  g.addColorStop(0, sh[0]); g.addColorStop(1, sh[1]);
  ctx.fillStyle = g; ctx.strokeStyle = '#0a1030'; ctx.lineWidth = 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - bw / 2, by, bw, bh, r * 0.35); else ctx.rect(x - bw / 2, by, bw, bh);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(r * 0.62) + 'px Pixelify Sans, system-ui, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(d.num), x, by + bh * 0.55);
  // Cabeza con su cara.
  var hy = y - r * 0.3, hr = r * 0.88;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, hy, hr, 0, Math.PI * 2); ctx.closePath();
  ctx.fillStyle = MR_ELEM_COLOR[d.p.tipo] || '#888'; ctx.fill();
  ctx.clip();
  if (d.img && d.img.complete && d.img.naturalWidth) ctx.drawImage(d.img, x - hr, hy - hr, hr * 2, hr * 2);
  else { ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(hr * 0.8) + 'px Pixelify Sans, system-ui'; ctx.fillText(initials(d.p.nombre), x, hy); }
  ctx.restore();
  ctx.lineWidth = 2.5; ctx.strokeStyle = TC_COLORS[d.side];
  ctx.beginPath(); ctx.arc(x, hy, hr, 0, Math.PI * 2); ctx.stroke();
  if (d.stun > 0) {
    ctx.fillStyle = '#ffe680'; ctx.font = '700 ' + Math.round(r * 0.7) + 'px system-ui';
    ctx.fillText('✦', x + Math.cos(now / 120) * hr, hy - hr - 4 + Math.sin(now / 120) * 3);
  }
  // Nombre del que lleva el balón y del seleccionado.
  if (owner || sel) {
    ctx.font = '700 ' + Math.max(11, Math.round(r * 0.66)) + 'px Pixelify Sans, system-ui, sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#0a1030'; ctx.fillStyle = owner ? '#ffe680' : '#fff';
    ctx.strokeText(d.p.nombre, x, hy - hr - 3); ctx.fillText(d.p.nombre, x, hy - hr - 3);
  }
  ctx.restore();
}
function tcDrawMinimap(ctx, F) {
  var T = TC;
  var mw = Math.round(Math.min(64, F.w * 0.17)), mh = Math.round(mw * TC_L / TC_W);
  var mx = F.w - mw - 8, my = 8, k = mw / TC_W;
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = '#1f7a2b'; ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(mx, my, mw, mh);
  ctx.beginPath(); ctx.moveTo(mx, my + mh / 2); ctx.lineTo(mx + mw, my + mh / 2); ctx.stroke();
  ctx.globalAlpha = 1;
  T.me.concat(T.opp).forEach(function (d) {
    ctx.fillStyle = TC_COLORS[d.side];
    ctx.beginPath(); ctx.arc(mx + d.x * k, my + d.y * k, 2.2, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx + T.ball.x * k, my + T.ball.y * k, 2.4, 0, Math.PI * 2); ctx.fill();
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
  var b = T.ball, c = b.mode === 'owned' && b.owner && b.owner.side === 'me' ? b.owner : null;
  var shoot = document.getElementById('tcShootBtn');
  if (shoot) {
    var on = !!(c && c.line > 0 && T.phase === 'play' && tcShootRange(c) < 40);
    if (shoot.classList.contains('on') !== on) shoot.classList.toggle('on', on);
  }
  var d = T.sel;
  var sel = document.getElementById('tcSel');
  if (sel && d) {
    var key = d.p.id + '|' + Math.round(d.tp);
    if (sel._k !== key || force) {
      sel._k = key;
      sel.innerHTML = '<span class="tc-sel-name">' + escapeHtml(d.p.nombre) + '</span>' +
        '<span class="tc-tp"><i style="width:' + Math.round(d.tp / d.tpMax * 100) + '%"></i></span><span class="tc-tp-num">PT ' + Math.round(d.tp) + '</span>';
    }
  }
  var msg = document.getElementById('tcMsg');
  if (msg && msg.textContent !== (T.msg || '')) msg.textContent = T.msg || '';
}

// ----- Ventanas: duelo, tiro, parada, descanso, pausa y ayuda -----
function tcFaceHtml(d) {
  var src = d.p.sprite || ('https://inazumarun.es/assets/sprites/' + d.p.id + '.png');
  return '<span class="tc-face tc-face-' + d.side + '" style="--el:' + (MR_ELEM_COLOR[d.p.tipo] || '#888') + '"><img src="' + escapeHtml(src) + '" alt="" onerror="this.style.visibility=\'hidden\'"></span>';
}
function tcTechBtnHtml(t, i, tp, fn) {
  var ok = tp >= t.cost;
  return '<button class="tc-opt tc-opt-tech" type="button" style="--tech:' + t.color + '"' + (ok ? '' : ' disabled') + ' onclick="' + fn + '(\'tech' + i + '\')">' +
    '<b>' + escapeHtml(t.name) + '</b><small>' + (typeof techElementIconHtml === 'function' ? techElementIconHtml(t.element, 14) : '') + ' Potencia ' + t.power + ' · <em>' + t.cost + ' PT</em></small></button>';
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
      '<div class="tc-card-foot">PT de ' + escapeHtml(m.mine.p.nombre) + ': <b>' + Math.round(m.mine.tp) + '</b></div>' +
    '</div>';
  } else if (m.type === 'shot') {
    var gk = tcKeeper('opp');
    html = '<div class="tc-card">' +
      '<div class="tc-card-kicker">¡Ocasión de gol!</div>' +
      '<div class="tc-vs">' + tcFaceHtml(m.shooter) + '<span class="tc-vs-mid">VS</span>' + tcFaceHtml(gk) + '</div>' +
      '<div class="tc-vs-names"><span>' + escapeHtml(m.shooter.p.nombre) + '</span><span>' + escapeHtml(gk.p.nombre) + '</span></div>' +
      '<p class="tc-card-note">A ' + Math.round(m.dist) + ' metros' + (m.dist > 24 ? ': de lejos cuesta más' : '') + '</p>' +
      '<div class="tc-opts"><button class="tc-opt" type="button" onclick="tcResolveMyShot(\'normal\')"><b>Tiro</b><small>Normal</small></button></div>' +
      (m.techs.length ? '<div class="tc-opts tc-opts-tech">' + m.techs.map(function (t, i) { return tcTechBtnHtml(t, i, m.shooter.tp, 'tcResolveMyShot'); }).join('') + '</div>' : '') +
      '<button class="tc-link" type="button" onclick="tcResolveMyShot(\'cancel\')">Mejor no tirar</button>' +
    '</div>';
  } else if (m.type === 'save') {
    html = '<div class="tc-card tc-card-danger">' +
      '<div class="tc-card-kicker">¡Tiro del rival!</div>' +
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
      '<p class="tc-card-note">Tus jugadores recuperan parte de sus PT.</p>' +
      '<div class="tc-opts"><button class="tc-opt tc-opt-go" type="button" onclick="tcStartHalf(' + m.next + ')"><b>' + (m.next === 3 ? 'Jugar la prórroga' : 'Segunda parte') + '</b></button></div>' +
      '<button class="tc-link" type="button" onclick="tcSimulateRest()">Simular el resto</button>' +
    '</div>';
  } else if (m.type === 'pause') {
    html = '<div class="tc-card">' +
      '<div class="tc-card-kicker">Pausa</div>' +
      '<div class="tc-big-score">' + T.live.myGoals + ' - ' + T.live.oppGoals + '</div>' +
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
        '<li>Con balón, <b>toca a un compañero</b> para pasarle o <b>toca un hueco</b> para pasar al espacio.</li>' +
        '<li>Cerca del área, <b>toca la portería</b> o el botón <b>¡Tirar!</b>.</li>' +
        '<li>Si te encuentras con un rival hay <b>duelo</b>: Regate gana a Entrada y Cuerpo gana a Bloqueo.</li>' +
        '<li>Las <b>supertécnicas</b> gastan PT. Su elemento cuenta: Fuego gana a Bosque, Bosque a Viento, Viento a Montaña y Montaña a Fuego.</li>' +
        '<li>Defendiendo, desliza a tus jugadores hacia el balón. El más cercano ya va solo.</li>' +
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

// ----- Toques y trazos -----
function tcToWorld(ev) {
  var cv = document.getElementById('tcCanvas');
  var rect = cv.getBoundingClientRect();
  var F = { w: rect.width, h: rect.height };
  var viewW = F.w > F.h ? Math.min(TC_W + 10, TC_VIEW_W * F.w / F.h * 0.75) : TC_VIEW_W;
  var s = F.w / viewW;
  return { x: (ev.clientX - rect.left - F.w / 2) / s + TC.cam.x, y: (ev.clientY - rect.top - F.h / 2) / s + TC.cam.y, s: s };
}
function tcPlayerAt(pt, side) {
  var T = TC, best = null, bd = Math.max(2.6, 30 / pt.s);
  var owner = T.ball.owner;
  if (owner && owner.side === side && tcDist(owner, { x: pt.x, y: pt.y - 0.4 }) < bd) return owner;
  tcTeam(side).forEach(function (d) { var dd = tcDist(d, { x: pt.x, y: pt.y - 0.4 }); if (dd < bd) { bd = dd; best = d; } });
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
  if (T.modal || T.video || T.phase !== 'play') return;
  var pt = tcToWorld(ev);
  var b = T.ball;
  var c = b.mode === 'owned' && b.owner && b.owner.side === 'me' ? b.owner : null;
  if (drag.d && drag.moved && drag.pts.length > 1) {
    drag.d.path = drag.pts.slice(1);
    drag.d.hold = 0;
    if (drag.d === c) T.msg = 'Toca a un compañero para pasar o la portería para tirar';
    return;
  }
  if (drag.moved) return;
  var tapped = tcPlayerAt(pt, 'me');
  if (c) {
    if (tapped && tapped !== c) { tcKick(c, tapped.x + tapped.vx * 0.35, tapped.y + tapped.vy * 0.35, tapped); return; }
    if (tapped === c) { c.path = null; return; }
    var inGoal = pt.y < 5 && Math.abs(pt.x - TC_W / 2) < TC_GOAL / 2 + 6;
    if (inGoal && c.line > 0) { tcAskShot(); return; }
    if (pt.x > 0 && pt.x < TC_W && pt.y > 0 && pt.y < TC_L) tcKick(c, pt.x, pt.y, null);
    return;
  }
  // Sin balón: el tuyo más cercano va adonde toques.
  if (tapped) { T.sel = tapped; return; }
  var near = T.me.filter(function (d) { return d.line > 0 && d.stun <= 0; }).sort(function (a, d) { return tcDist(a, pt) - tcDist(d, pt); })[0];
  if (near) { near.path = [{ x: clamp(pt.x, 0.5, TC_W - 0.5), y: clamp(pt.y, 0.5, TC_L - 0.5) }]; near.hold = 0; T.sel = near; }
}
