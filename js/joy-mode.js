/* ---------------------------------------------------------------------
   JUEGA TÚ: partido 5 vs 5 o 7 vs 7 en el que llevas tú al jugador con
   joystick (o teclado). Con balón: Pasar y Tirar; sin balón: Entrar y
   Cambiar. La IA mueve a tus compañeros y al rival. Campo en vertical
   (atacas hacia arriba) para que quepa bien en el móvil. Motor propio y
   sencillo, aparte del de Ver partido (js/match-engine.js), porque aquí
   no hay guion: todo sale de lo que hagas.
   Coordenadas en metros: x de 0 a W (ancho), y de 0 (portería rival)
   a L (tu portería).
   --------------------------------------------------------------------- */
var JOY_CFG = {
  5: { W: 40, L: 60, goalW: 7, halfSec: 100, slots: [
    { pos: 'Portero', x: 0.5, f: 0.02 }, { pos: 'Defensa', x: 0.3, f: 0.22 }, { pos: 'Defensa', x: 0.7, f: 0.22 },
    { pos: 'Centrocampista', x: 0.5, f: 0.42 }, { pos: 'Delantero', x: 0.5, f: 0.62 }] },
  7: { W: 50, L: 74, goalW: 8, halfSec: 120, slots: [
    { pos: 'Portero', x: 0.5, f: 0.02 }, { pos: 'Defensa', x: 0.22, f: 0.2 }, { pos: 'Defensa', x: 0.5, f: 0.18 }, { pos: 'Defensa', x: 0.78, f: 0.2 },
    { pos: 'Centrocampista', x: 0.32, f: 0.42 }, { pos: 'Centrocampista', x: 0.68, f: 0.42 }, { pos: 'Delantero', x: 0.5, f: 0.62 }] }
};
var JOY_COLORS = { me: '#3ea6ff', opp: '#ff4d5e' };
var J = null;

// ----- Plantillas -----
function joyPickSquad(name, cfg, excludeIds) {
  var pool = qmTeamEleven(name, excludeIds || []).concat(qmOwnPlayers(name));
  var used = {};
  (excludeIds || []).forEach(function (id) { used[id] = true; });
  var byScore = function (a, b) { return futDraftPlayerScore(b) - futDraftPlayerScore(a); };
  pool.sort(byScore);
  return cfg.slots.map(function (slot) {
    var pick = pool.find(function (p) { return !used[p.id] && p.posicion === slot.pos; }) ||
      pool.find(function (p) { return !used[p.id] && (slot.pos === 'Portero') === (p.posicion === 'Portero'); }) ||
      ROSTER.find(function (p) { return !used[p.id] && p.posicion === slot.pos; });
    used[pick.id] = true;
    return pick;
  });
}
function joySkill(p, k) { return typeof p[k] === 'number' ? p[k] : 70; }
function joyImg(p) {
  joyImg._c = joyImg._c || {};
  if (!joyImg._c[p.id]) { var im = new Image(); im.src = p.sprite || ('https://inazumarun.es/assets/sprites/' + p.id + '.png'); joyImg._c[p.id] = im; }
  return joyImg._c[p.id];
}
function joyMakeSide(side, players, cfg) {
  return players.map(function (p, i) {
    var slot = cfg.slots[i];
    var sc = futDraftPlayerScore(p);
    return {
      side: side, i: i, p: p, pos: slot.pos, bx: slot.x, bf: slot.f,
      x: 0, y: 0, vx: 0, vy: 0, fx: 0, fy: side === 'me' ? -1 : 1,
      speed: (slot.pos === 'Portero' ? 6.2 : 6.6) * (0.86 + clamp(sc - 60, 0, 40) / 160),
      stun: 0, cd: 0, dash: 0, dribble: 0, img: joyImg(p), techs: joyTechsOf(p)
    };
  });
}
// Sus supertécnicas (hasta 3) por tipo; una por tipo para todo el partido.
function joyTechsOf(p) {
  var t = {};
  ['tiro', 'regate', 'defensa', 'portero'].forEach(function (k) { t[k] = typeof mrTech === 'function' ? mrTech(p, k) : null; });
  return t;
}
// Energía que gasta cada técnica (la barra va de 0 a 1).
var JOY_COST = { tiro: 0.6, regate: 0.35, defensa: 0.35 };
// Distancia a la portería rival desde la que sale el supertiro.
var JOY_SUPER_RANGE = 26;
// Coordenada "hacia la portería rival" (0 tu portería, 1 la rival) a mundo.
function joyWorld(side, xFrac, f) {
  var c = J.cfg;
  return side === 'me' ? { x: xFrac * c.W, y: c.L * (1 - f) } : { x: (1 - xFrac) * c.W, y: c.L * f };
}
function joyF(side, y) { return side === 'me' ? 1 - y / J.cfg.L : y / J.cfg.L; }
function joyDist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function joyOther(side) { return side === 'me' ? 'opp' : 'me'; }
function joyTeam(side) { return side === 'me' ? J.me : J.opp; }
function joyKeeper(side) { return joyTeam(side)[0]; }
function joyNearest(list, pt, skip) {
  var best = null, bd = Infinity;
  list.forEach(function (d) { if (d === skip) return; var dd = joyDist(d, pt); if (dd < bd) { bd = dd; best = d; } });
  return best;
}

// ----- Arranque -----
window.joyStartMatch = function (nameA, nameB, format, cup) {
  var cfg = JOY_CFG[format] || JOY_CFG[5];
  var myPlayers = joyPickSquad(nameA, cfg, []);
  var oppPlayers = joyPickSquad(nameB, cfg, myPlayers.map(function (p) { return p.id; }));
  J = {
    cfg: cfg, format: format, nameA: nameA, nameB: nameB,
    me: null, opp: null, ball: { x: cfg.W / 2, y: cfg.L / 2, vx: 0, vy: 0, owner: null, kind: null },
    t: 0, half: 1, score: { me: 0, opp: 0 }, events: [], ctrl: null,
    phase: 'kickoff', phaseT: 1.2, kickSide: 'me', msg: '¡A jugar!',
    energy: 0.3, keys: {}, stick: { x: 0, y: 0, on: false }, last: 0,
    poss: { me: 0, opp: 0 }, shots: { me: 0, opp: 0 }, hold: null, lastPass: null,
    cup: !!cup, cpuEnergy: 0.2, charge: null, duelVideoAt: 0,
    // La primera vez sale la explicación de los controles (luego, con el botón ?).
    showHelp: !(G.meta && G.meta.joyHelpSeen)
  };
  J.me = joyMakeSide('me', myPlayers, cfg);
  J.opp = joyMakeSide('opp', oppPlayers, cfg);
  joySetupKickoff('me');
  G.screen = 'joyMatch';
  if (typeof playKickoffSound === 'function') playKickoffSound();
  render();
  joyBindKeys();
  requestAnimationFrame(joyLoop);
};
function joySetupKickoff(side) {
  var c = J.cfg;
  ['me', 'opp'].forEach(function (s) {
    joyTeam(s).forEach(function (d) {
      var f = Math.min(d.bf, 0.46);
      var w = joyWorld(s, d.bx, f);
      d.x = w.x; d.y = w.y; d.vx = d.vy = 0; d.stun = 0; d.dash = 0;
    });
  });
  var taker = joyTeam(side)[joyTeam(side).length - 1];
  taker.x = c.W / 2; taker.y = c.L / 2 + (side === 'me' ? 0.8 : -0.8);
  J.ball = { x: c.W / 2, y: c.L / 2, vx: 0, vy: 0, owner: taker, kind: null };
  J.kickSide = side;
  J.ctrl = side === 'me' ? taker : joyTeam('me')[joyTeam('me').length - 1];
  J.aiT = 0.6;
}

// ----- Bucle -----
function joyLoop(ts) {
  if (G.screen !== 'joyMatch' || !J) { joyVideoStop(); return; }
  var dt = J.last ? Math.min(0.05, (ts - J.last) / 1000) : 0.016;
  J.last = ts;
  if (!G.confirmLeaveOpen && !J.showHelp && !J.quitAsk) joyStep(dt);
  joyDraw();
  if (J && J.phase !== 'done') requestAnimationFrame(joyLoop);
}
function joyStep(dt) {
  if (J.hold) { if (Date.now() < J.hold.until && !J.hold.done) return; var then = J.hold.then; J.hold = null; joyVideoStop(); if (then) then(); }
  if (J.phase !== 'play') {
    J.phaseT -= dt;
    if (J.phase === 'goal' || J.phase === 'half') joyMoveAll(dt, true);
    if (J.phaseT <= 0) joyEndPhase();
    return;
  }
  J.t += dt;
  var halfLen = J.cfg.halfSec;
  if (J.half === 1 && J.t >= halfLen) { J.half = 2; J.phase = 'half'; J.phaseT = 2.2; J.msg = 'Descanso'; return; }
  if (J.t >= halfLen * 2) { J.phase = 'end'; J.phaseT = 1.6; J.msg = 'Final del partido'; return; }
  J.energy = Math.min(1, J.energy + dt / 18);
  J.cpuEnergy = Math.min(1, J.cpuEnergy + dt / 28);
  if (J.charge && J.ball.owner !== J.charge.who) J.charge = null;
  if (J.ball.owner) J.poss[J.ball.owner.side] += dt;
  joyControl(dt);
  joyAi(dt);
  joyMoveAll(dt, false);
  joyBall(dt);
  joyTackles(dt);
}
function joyEndPhase() {
  if (J.phase === 'goal') { joySetupKickoff(J.kickSide); J.phase = 'kickoff'; J.phaseT = 1; J.msg = ''; return; }
  if (J.phase === 'half') { joySetupKickoff('opp'); J.phase = 'kickoff'; J.phaseT = 1; J.msg = 'Segunda parte'; return; }
  if (J.phase === 'end') {
    J.phase = 'done';
    // Eliminatoria empatada: tanda de penaltis jugable (js/pk-shootout.js).
    if (J.cup && J.score.me === J.score.opp) {
      var jj = J;
      pkStart({
        youName: jj.nameA, youShield: teamShieldPath(jj.nameA), oppName: jj.nameB, oppShield: teamShieldPath(jj.nameB),
        myPlayers: jj.me.map(function (d) { return d.p; }), oppPlayers: jj.opp.map(function (d) { return d.p; }),
        onDone: function (res) { J = jj; joyFinish(res); }
      });
      return;
    }
    joyFinish();
    return;
  }
  if (J.phase === 'restart') { J.phase = 'play'; J.msg = ''; return; }
  J.phase = 'play'; J.msg = '';
}
function joyMinute() { return Math.min(90, Math.floor(J.t / (J.cfg.halfSec * 2) * 90) + 1); }

// ----- Control del jugador -----
function joyInput() {
  var k = J.keys, x = J.stick.x, y = J.stick.y;
  var kx = (k.right ? 1 : 0) - (k.left ? 1 : 0), ky = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  if (kx || ky) { var m = Math.hypot(kx, ky); x = kx / m; y = ky / m; }
  return { x: x, y: y, mag: Math.min(1, Math.hypot(x, y)) };
}
function joyControl(dt) {
  var b = J.ball;
  // Con balón tuyo llevas siempre al que lo tiene (menos al portero).
  if (b.owner && b.owner.side === 'me' && b.owner.pos !== 'Portero') J.ctrl = b.owner;
  else if (b.intended && b.intended.side === 'me') J.ctrl = b.intended;
  if (!J.ctrl || J.ctrl.pos === 'Portero') J.ctrl = joyNearest(J.me.slice(1), b);
  // Balón suelto que no es un pase tuyo: pasas al que esté bastante más cerca.
  if (!b.owner && !(b.intended && b.intended.side === 'me')) {
    var near = joyNearest(J.me.slice(1), b);
    if (near && near !== J.ctrl && joyDist(J.ctrl, b) - joyDist(near, b) > 5) J.ctrl = near;
  }
  var d = J.ctrl, inp = joyInput();
  if (d.stun > 0) return;
  var sp = d.speed * (b.owner === d ? 0.9 : 1) * (d.dash > 0 ? 1.55 : 1);
  if (inp.mag > 0.12) {
    d.tx = d.x + inp.x * 6; d.ty = d.y + inp.y * 6;
    d.vx += (inp.x * sp * inp.mag - d.vx) * Math.min(1, dt * 9);
    d.vy += (inp.y * sp * inp.mag - d.vy) * Math.min(1, dt * 9);
    d.fx = inp.x; d.fy = inp.y;
  } else {
    d.vx *= Math.pow(0.02, dt); d.vy *= Math.pow(0.02, dt);
  }
  d.manual = true;
}
// Botones: a = Pasar o Entrar; b = Tirar (mantener y soltar) o Cambiar;
// c = Técnica (la del jugador que encaja ahora). up = true al soltar.
window.joyButton = function (which, ev, up) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  if (!J || J.showHelp || J.quitAsk) return;
  if (J.phase !== 'play' || J.hold) { if (up) J.charge = null; return; }
  var b = J.ball, d = J.ctrl;
  var mine = b.owner && b.owner.side === 'me' && b.owner === d;
  if (which === 'c') { if (!up) joyUseTech(); return; }
  if (which === 'b' && mine) {
    if (!up) { J.charge = { t0: performance.now(), who: d }; return; }
    if (J.charge && J.charge.who === d) { var pw = joyChargePower(); J.charge = null; joyShootFrom(d, joyInput(), pw); }
    return;
  }
  if (up) return;
  if (mine) { if (which === 'a') joyPassFrom(d, joyInput()); return; }
  if (which === 'a') joyTryTackle(d);
  else joySwitch();
};
function joyChargePower() { return J.charge ? Math.min(1, (performance.now() - J.charge.t0) / 900) : 0; }
function joySwitchCandidate() {
  var b = J.ball;
  return joyNearest(J.me.slice(1).filter(function (x) { return x !== J.ctrl; }), b.owner || b);
}
function joySwitch() { var c = joySwitchCandidate(); if (c) { J.ctrl = c; J.switchFlash = Date.now(); } }
// Tocar el campo: con balón, pasas a ese compañero; sin balón, pasas a llevarlo.
window.joyCanvasTap = function (ev) {
  if (!J || J.showHelp || J.phase !== 'play' || J.hold) return;
  var cv = document.getElementById('joyCanvas');
  if (!cv || !cv._s) return;
  var r = cv.getBoundingClientRect();
  var wx = (ev.clientX - r.left) / cv._s - JOY_M, wy = (ev.clientY - r.top) / cv._s - JOY_M;
  var pick = joyNearest(J.me, { x: wx, y: wy });
  if (!pick || joyDist(pick, { x: wx, y: wy }) > 4) return;
  var b = J.ball, d = J.ctrl;
  if (b.owner && b.owner === d && d.side === 'me') { if (pick !== d) joyKickPass(d, pick); return; }
  if (pick.pos !== 'Portero') { J.ctrl = pick; J.switchFlash = Date.now(); }
};
// Qué técnica tocaría ahora con el jugador que llevas: con balón cerca del
// área, su tiro; con balón más lejos, su regate (o su tiro, aún lejos); sin
// balón, su técnica de defensa. null si no tiene ninguna que encaje.
function joyTechAction() {
  var d = J.ctrl, b = J.ball;
  if (!d) return null;
  var t = d.techs || {};
  if (b.owner === d) {
    var near = Math.hypot(d.x - J.cfg.W / 2, d.y) < JOY_SUPER_RANGE;
    if (t.tiro && (near || !t.regate)) return { kind: 'tiro', tech: t.tiro, label: 'Supertiro', far: !near };
    if (t.regate) return { kind: 'regate', tech: t.regate, label: 'Regate' };
    return null;
  }
  if (t.defensa) return { kind: 'defensa', tech: t.defensa, label: 'Robo' };
  return null;
}
function joyTechReady(act) { return !!act && !act.far && J.energy >= JOY_COST[act.kind] - 1e-6; }
function joyUseTech() {
  var act = joyTechAction(), d = J.ctrl;
  if (!act) { J.flash = { text: 'Sin técnica para esto', until: Date.now() + 900 }; return; }
  if (act.far) { J.flash = { text: 'Acércate al área', until: Date.now() + 900 }; return; }
  if (J.energy < JOY_COST[act.kind] - 1e-6) { J.flash = { text: 'Falta energía', until: Date.now() + 900 }; return; }
  if (act.kind === 'defensa') {
    var carrier = J.ball.owner;
    if (!carrier || carrier.side !== 'opp' || carrier.pos === 'Portero' || joyDist(d, carrier) > 6 || d.stun > 0) { J.flash = { text: 'Muy lejos', until: Date.now() + 900 }; return; }
    J.energy -= JOY_COST.defensa;
    var dx = carrier.x - d.x, dy = carrier.y - d.y, m = Math.hypot(dx, dy) || 1;
    d.vx = dx / m * d.speed * 1.9; d.vy = dy / m * d.speed * 1.9;
    d.tackleOn = carrier; d.techTackle = true; d.dash = 0.6; d.cd = 0.9;
    joyShowTech(d, act.tech, false);
    return;
  }
  J.energy -= JOY_COST[act.kind];
  J.charge = null;
  if (act.kind === 'tiro') { joyShootFrom(d, joyInput(), 0.75, act.tech); return; }
  // Regate: acelera y se va de la siguiente entrada.
  d.dribble = 1.6; d.dash = 0.9;
  joyShowTech(d, act.tech, false);
}
// Nombre de la técnica en grande y, como mucho cada 12 s (o siempre si
// force), su vídeo con la jugada congelada.
function joyShowTech(d, t, force) {
  if (typeof fxHaptic === 'function') fxHaptic('tech');
  if (!t) return;
  joyTechBanner(t, d.p, d.side);
  var src = typeof mrTechVideoSrc === 'function' ? mrTechVideoSrc(t.name) : null;
  if (src && (force || Date.now() - J.duelVideoAt > 12000)) {
    J.duelVideoAt = Date.now();
    joyVideoPlay(src, t.name + ' · ' + d.p.nombre, t.color);
    J.hold = { until: Date.now() + 6000, then: null };
  }
}
function joyTryTackle(d) {
  if (!d || d.cd > 0 || d.stun > 0) return;
  d.cd = 0.9;
  d.dash = 0.35;
  var carrier = J.ball.owner;
  if (carrier && carrier.side === 'opp' && joyDist(d, carrier) < 4) {
    var dx = carrier.x - d.x, dy = carrier.y - d.y, m = Math.hypot(dx, dy) || 1;
    d.vx = dx / m * d.speed * 1.6; d.vy = dy / m * d.speed * 1.6;
    d.tackleOn = carrier; d.techTackle = false;
  }
}

// ----- IA -----
function joyAi(dt) {
  var b = J.ball;
  J.aiT -= dt;
  var carrier = b.owner;
  if (carrier && J.aiT <= 0) {
    J.aiT = 0.35 + Math.random() * 0.4;
    if (carrier.pos === 'Portero') {
      carrier.holdT = (carrier.holdT || 0) + 0.5;
      if (carrier.holdT > 0.8) { carrier.holdT = 0; joyAiPass(carrier, true); }
    } else if (carrier.side === 'opp') joyAiCarrier(carrier);
  }
  ['me', 'opp'].forEach(function (s) {
    var team = joyTeam(s), attacking = b.owner && b.owner.side === s;
    var loose = !b.owner;
    // Los que presionan o van a por el balón suelto.
    var free = team.slice(1).filter(function (d) { return d !== J.ctrl || s !== 'me'; });
    var chasers = [];
    if (!attacking) {
      // Presionan dos (tres en 7 vs 7) si el balón ya está en su mitad.
      var inOwnHalf = joyF(s, b.y) < 0.5;
      // Tus compañeros cubren y aprietas tú; el rival presiona con uno o dos más.
      var n = s === 'me' ? (J.format === 7 ? 1 : 0) + (inOwnHalf ? 1 : 0) : (J.format === 7 ? 2 : 1) + (inOwnHalf ? 1 : 0);
      chasers = free.slice().sort(function (a, c) { return joyDist(a, b) - joyDist(c, b); }).slice(0, n);
    }
    team.forEach(function (d) {
      if (s === 'me' && d === J.ctrl) return;
      if (b.owner === d) return;
      d.manual = false;
      if (d.pos === 'Portero') { joyKeeperTarget(d); return; }
      // El que recibe un pase va a por el balón.
      if (b.intended === d) { d.tx = b.x + b.vx * 0.25; d.ty = b.y + b.vy * 0.25; d.run = 1; return; }
      if (chasers.indexOf(d) !== -1 && (loose || !attacking)) { d.tx = b.x; d.ty = b.y; d.run = 1; return; }
      var bf = joyF(s, b.y);
      var f = d.bf + (attacking ? (d.pos === 'Delantero' ? 0.22 : 0.14) : -0.06) + (bf - 0.5) * 0.35;
      f = clamp(f, 0.08, attacking ? 0.9 : 0.7);
      var xFrac = clamp(d.bx + ((s === 'me' ? b.x : J.cfg.W - b.x) / J.cfg.W - 0.5) * 0.3, 0.06, 0.94);
      var w = joyWorld(s, xFrac, f);
      d.tx = w.x; d.ty = w.y; d.run = attacking ? 0.85 : 0.75;
    });
  });
}
function joyKeeperTarget(k) {
  var c = J.cfg, b = J.ball;
  var goalY = k.side === 'me' ? c.L : 0;
  var dir = k.side === 'me' ? -1 : 1;
  if (k.diveX !== undefined && k.diveX !== null) { k.tx = k.diveX; k.ty = goalY + dir * 1; k.run = 1.6; return; }
  // Balón suelto cerca de su área: sale a por él.
  if (!b.owner && Math.abs(b.y - goalY) < 9 && Math.abs(b.x - c.W / 2) < 10 && Math.hypot(b.vx, b.vy) < 9) { k.tx = b.x; k.ty = b.y; k.run = 1; return; }
  k.tx = clamp(c.W / 2 + (b.x - c.W / 2) * 0.35, c.W / 2 - c.goalW / 2 + 0.6, c.W / 2 + c.goalW / 2 - 0.6);
  k.ty = goalY + dir * (1.2 + Math.min(4, Math.abs(b.y - goalY) * 0.06));
  k.run = 0.8;
}
function joyAiCarrier(d) {
  var c = J.cfg, side = d.side, foes = joyTeam(joyOther(side));
  var goal = { x: c.W / 2, y: side === 'opp' ? c.L : 0 };
  var dist = joyDist(d, goal);
  var nearest = joyNearest(foes.slice(1), d);
  var pressure = nearest ? joyDist(nearest, d) : 99;
  if (dist < 21 && Math.random() < (dist < 10 ? 0.8 : dist < 15 ? 0.5 : 0.22)) {
    // El rival gasta su energía igual que tú: supertiro solo si la tiene.
    var cpuTech = J.cpuEnergy >= JOY_COST.tiro && d.techs.tiro && Math.random() < 0.5 ? d.techs.tiro : null;
    if (cpuTech) J.cpuEnergy -= JOY_COST.tiro;
    var myK = joyKeeper('me');
    var aim = Math.random() < 0.5 ? (myK.x < c.W / 2 ? 1 : -1) : (Math.random() < 0.5 ? 1 : -1);
    joyTechShot(d, goal.x + aim * c.goalW * (0.15 + Math.random() * 0.3), cpuTech, 0.55 + Math.random() * 0.3);
    return;
  }
  // Apretado y con energía: su regate.
  if (pressure < 3 && d.dribble <= 0 && d.techs.regate && J.cpuEnergy >= JOY_COST.regate && Math.random() < 0.3) {
    J.cpuEnergy -= JOY_COST.regate;
    d.dribble = 1.4; d.burst = 1;
    joyShowTech(d, d.techs.regate, false);
  }
  if ((pressure < 2.6 && Math.random() < 0.6) || Math.random() < 0.12) { if (joyAiPass(d, false)) return; }
  // Conduce hacia la portería, apartándose del que le cierra.
  var away = nearest && pressure < 5 ? (d.x < nearest.x ? -1 : 1) * 4 : 0;
  d.tx = clamp(goal.x + (Math.random() - 0.5) * 8 + away, 2, c.W - 2);
  d.ty = goal.y;
  d.run = 0.85;
}
function joyAiPass(d, safe) {
  var side = d.side, mates = joyTeam(side).filter(function (x) { return x !== d && x.pos !== 'Portero'; });
  var foes = joyTeam(joyOther(side));
  var best = null, bs = -Infinity;
  mates.forEach(function (m) {
    var dist = joyDist(m, d);
    if (dist < 3 || dist > 34) return;
    var fwd = joyF(side, m.y) - joyF(side, d.y);
    var n = joyNearest(foes, m);
    var open = n ? Math.min(joyDist(n, m), 10) : 10;
    var s = fwd * (safe ? 4 : 18) + open * 0.8 - Math.abs(dist - 12) * 0.08 + Math.random() * 2;
    if (s > bs) { bs = s; best = m; }
  });
  if (!best) return false;
  joyKickPass(d, best);
  return true;
}

// ----- Pases y tiros -----
function joyPassTarget(d, inp) {
  var dir = inp.mag > 0.3 ? { x: inp.x, y: inp.y } : { x: d.fx || 0, y: d.fy || -1 };
  var dm = Math.hypot(dir.x, dir.y) || 1; dir.x /= dm; dir.y /= dm;
  var best = null, bs = -Infinity;
  J.me.forEach(function (m) {
    if (m === d) return;
    var vx = m.x - d.x, vy = m.y - d.y, dist = Math.hypot(vx, vy);
    if (dist < 2.5 || dist > 40) return;
    var align = (vx * dir.x + vy * dir.y) / dist;
    var n = joyNearest(J.opp, m);
    var open = n ? Math.min(joyDist(n, m), 10) : 10;
    var sc = align * 4 + open * 0.15 - Math.abs(dist - 13) * 0.04 - (m.pos === 'Portero' ? 2 : 0);
    if (sc > bs) { bs = sc; best = m; }
  });
  return best;
}
function joyPassFrom(d, inp) {
  var best = joyPassTarget(d, inp);
  if (best) joyKickPass(d, best);
}
function joyKickPass(d, m) {
  var b = J.ball;
  var lead = 0.35;
  var tx = m.x + m.vx * lead, ty = m.y + m.vy * lead;
  var dist = Math.hypot(tx - d.x, ty - d.y);
  var sp = clamp(dist * 1.05 + 7, 12, 23);
  // Precisión según su pase: un pase flojo se desvía un poco.
  var err = (100 - joySkill(d.p, 'pase')) / 100 * 0.25;
  var ang = Math.atan2(ty - d.y, tx - d.x) + (Math.random() - 0.5) * err;
  b.owner = null; b.kind = 'pass'; b.intended = m; b.kicker = d; b.tried = [];
  b.x = d.x + Math.cos(ang) * 0.9; b.y = d.y + Math.sin(ang) * 0.9;
  b.vx = Math.cos(ang) * sp; b.vy = Math.sin(ang) * sp;
  b.free = 0.15;
  J.lastPass = { side: d.side, p: d.p, t: J.t };
  if (d.side === 'me') J.ctrl = m;
}
// Apuntas con el joystick a izquierda o derecha; sin apuntar, al palo
// contrario al que está el portero.
function joyShootFrom(d, inp, power, tech) {
  var c = J.cfg;
  var k = joyKeeper(joyOther(d.side));
  var dirX = inp.mag > 0.2 ? inp.x : (k.x < c.W / 2 ? 0.75 : -0.75) + (Math.random() - 0.5) * 0.3;
  var aim = c.W / 2 + clamp(dirX, -1, 1) * c.goalW * 0.42;
  joyTechShot(d, aim, tech || null, power);
}
// Tiro con supertécnica: su nombre en grande y, si tiene vídeo, el vídeo
// con la jugada congelada; luego sale el tiro.
function joyTechShot(d, aim, tech, power) {
  if (!tech) { joyShoot(d, aim, null, power); return; }
  joyTechBanner(tech, d.p, d.side);
  var src = typeof mrTechVideoSrc === 'function' ? mrTechVideoSrc(tech.name) : null;
  if (src) { joyVideoPlay(src, tech.name + ' · ' + d.p.nombre, tech.color); J.hold = { until: Date.now() + 7000, then: function () { joyShoot(d, aim, tech, power); } }; return; }
  joyShoot(d, aim, tech, power);
}
function joyTechBanner(tech, p, side) {
  J.techBanner = { name: tech.name, who: p.nombre, color: tech.color, side: side, until: Date.now() + 2300, id: Date.now() };
}
// Resultado del tiro decidido al chutar (gol, parada o fuera) según
// distancia, ángulo, tiro contra portero y si va con supertécnica.
function joyShoot(d, aimX, tech, power) {
  var pw = typeof power === 'number' ? power : 0.72;
  var c = J.cfg, b = J.ball, side = d.side;
  var goalY = side === 'me' ? 0 : c.L;
  var keeper = joyKeeper(joyOther(side));
  var dist = Math.hypot(d.x - c.W / 2, d.y - goalY);
  var angle = Math.abs(d.x - c.W / 2) / Math.max(dist, 1);
  var foes = joyTeam(joyOther(side)).slice(1);
  var n = joyNearest(foes, d);
  var pressured = n && joyDist(n, d) < 2;
  var pGoal = 0.58 - dist * 0.023 - angle * 0.2 + (joySkill(d.p, 'tiro') - joySkill(keeper.p, 'defensa')) / 220 - (pressured ? 0.08 : 0) + (tech ? 0.25 : 0);
  // Lejos del portero entra mejor; a sus manos, peor.
  pGoal += (Math.min(1.2, Math.abs(aimX - keeper.x) / (c.goalW / 2)) - 0.5) * 0.16;
  // Al supertiro el portero responde con su técnica de parada, si la tiene.
  var keeperTech = tech && keeper.techs && keeper.techs.portero ? keeper.techs.portero : null;
  if (keeperTech) pGoal -= 0.18;
  // Potencia: flojo lo para fácil; en la franja buena entra mejor; pasado de fuerza, fuera.
  pGoal += pw < 0.35 ? -0.15 : (pw >= 0.55 && pw <= 0.9 ? 0.05 : 0);
  pGoal = clamp(pGoal, 0.03, 0.85);
  var pMiss = clamp(0.12 + dist * 0.008 - (tech ? 0.1 : 0), 0.04, 0.4) + (pw > 0.92 ? 0.35 : 0);
  var r = Math.random();
  var outcome = r < pGoal ? 'goal' : r < pGoal + pMiss ? 'miss' : 'save';
  var tx = aimX, ty = goalY + (side === 'me' ? -1.2 : 1.2);
  if (outcome === 'miss') tx = c.W / 2 + (aimX >= c.W / 2 ? 1 : -1) * (c.goalW / 2 + 1 + Math.random() * 3);
  if (outcome === 'save') { ty = goalY + (side === 'me' ? 0.9 : -0.9); keeper.diveX = tx; }
  else if (outcome === 'goal') keeper.diveX = clamp(tx + (tx > c.W / 2 ? -1 : 1) * (2 + Math.random() * 2), c.W / 2 - c.goalW / 2, c.W / 2 + c.goalW / 2);
  var sp = (tech ? 30 : 24) * (0.7 + pw * 0.4);
  var ang = Math.atan2(ty - d.y, tx - d.x);
  b.owner = null; b.kind = 'shot'; b.outcome = outcome; b.kicker = d; b.intended = null; b.tech = tech; b.keeperTech = keeperTech;
  b.target = { x: tx, y: ty };
  b.x = d.x + Math.cos(ang) * 0.9; b.y = d.y + Math.sin(ang) * 0.9;
  b.vx = Math.cos(ang) * sp; b.vy = Math.sin(ang) * sp;
  b.free = 0.3;
  J.shots[side]++;
  J.trail = [];
}

// ----- Balón -----
function joyBall(dt) {
  var b = J.ball, c = J.cfg;
  if (b.owner) {
    var o = b.owner;
    var fm = Math.hypot(o.fx, o.fy) || 1;
    b.x += ((o.x + o.fx / fm * 0.8) - b.x) * Math.min(1, dt * 14);
    b.y += ((o.y + o.fy / fm * 0.8) - b.y) * Math.min(1, dt * 14);
    b.vx = b.vy = 0;
    return;
  }
  b.free = Math.max(0, (b.free || 0) - dt);
  b.x += b.vx * dt; b.y += b.vy * dt;
  if (b.kind === 'shot') {
    if (J.trail) { J.trail.push({ x: b.x, y: b.y }); if (J.trail.length > 10) J.trail.shift(); }
    var t = b.target;
    var arrived = (b.vy < 0 && b.y <= t.y) || (b.vy > 0 && b.y >= t.y);
    if (arrived) { joyShotArrived(); return; }
    return;
  }
  var k = b.kind === 'pass' ? 0.55 : 1.1;
  b.vx *= Math.exp(-k * dt); b.vy *= Math.exp(-k * dt);
  var speed = Math.hypot(b.vx, b.vy);
  if (speed < 0.4) { b.vx = b.vy = 0; b.kind = null; }
  // Fuera: saque para el otro equipo.
  if (b.x < 0 || b.x > c.W || b.y < 0 || b.y > c.L) { joyOut(); return; }
  if (b.free > 0) return;
  // Recoger el balón: el receptor siempre; un rival puede cortarlo.
  var all = J.me.concat(J.opp);
  for (var i = 0; i < all.length; i++) {
    var d = all[i];
    if (d.stun > 0) continue;
    var dd = joyDist(d, b);
    if (dd > (d.pos === 'Portero' ? 1.4 : 1.0)) continue;
    if (b.kind === 'pass' && b.intended && d.side !== b.intended.side && speed > 8) {
      // Pegado al que pasa no se corta: el pase ya ha salido.
      if (b.kicker && joyDist(d, b.kicker) < 2.5) continue;
      b.tried = b.tried || [];
      if (b.tried.indexOf(d) !== -1) continue;
      b.tried.push(d);
      if (Math.random() > clamp(0.14 + (joySkill(d.p, 'defensa') - 70) / 200, 0.06, 0.3)) continue;
    }
    joyGive(d);
    return;
  }
}
function joyGive(d) {
  var b = J.ball;
  var prevSide = b.lastSide;
  b.owner = d; b.kind = null; b.intended = null; b.lastSide = d.side;
  d.holdT = 0;
  if (d.side === 'me' && d.pos !== 'Portero') J.ctrl = d;
  if (prevSide && prevSide !== d.side) {
    if (d.side === 'me') J.energy = Math.min(1, J.energy + 0.12);
    if (d.side === 'opp') J.ctrl = joyNearest(J.me.slice(1), d);
  }
  J.aiT = 0.3;
  joyTeam('me').concat(joyTeam('opp')).forEach(function (x) { x.diveX = null; });
}
function joyShotArrived() {
  var b = J.ball, c = J.cfg, side = b.kicker.side;
  var keeper = joyKeeper(joyOther(side));
  keeper.diveX = null;
  if (b.outcome === 'goal') {
    // Su técnica no ha bastado: se ve igual, y luego el gol.
    if (b.keeperTech) { joyTechBanner(b.keeperTech, keeper.p, keeper.side); J.flash = { text: '¡La rompe!', until: Date.now() + 1200 }; }
    joyGoal(side, b.kicker);
    return;
  }
  if (b.outcome === 'save') {
    keeper.x = b.target.x; keeper.y = b.target.y;
    J.flash = { text: '¡Parada!', until: Date.now() + 1100 };
    joyGive(keeper);
    if (b.keeperTech) joyShowTech(keeper, b.keeperTech, true);
    return;
  }
  J.flash = { text: 'Fuera', until: Date.now() + 900 };
  joyGive(keeper);
  keeper.x = c.W / 2; keeper.y = side === 'me' ? 2 : c.L - 2;
}
function joyOut() {
  var b = J.ball, c = J.cfg;
  var last = b.kicker ? b.kicker.side : (b.lastSide || 'me');
  var side = joyOther(last);
  b.x = clamp(b.x, 0.5, c.W - 0.5); b.y = clamp(b.y, 0.5, c.L - 0.5);
  var taker;
  if (b.y <= 1 || b.y >= c.L - 1) taker = joyKeeper(b.y <= 1 ? 'opp' : 'me');
  else taker = joyNearest(joyTeam(side).slice(1), b);
  if (taker.pos === 'Portero') side = taker.side;
  taker.x = b.x; taker.y = b.y;
  joyGive(taker);
  J.phase = 'restart'; J.phaseT = 0.7;
  J.flash = { text: taker.pos === 'Portero' ? 'Saque de puerta' : 'Saque de banda', until: Date.now() + 900 };
}
function joyGoal(side, scorer) {
  J.score[side]++;
  var assist = J.lastPass && J.lastPass.side === side && J.t - J.lastPass.t < 6 && J.lastPass.p.id !== scorer.p.id ? J.lastPass.p : null;
  J.events.push({ minute: joyMinute(), side: side, scorer: scorer.p, assist: assist });
  J.ball.owner = null; J.ball.kind = null; J.ball.vx = J.ball.vy = 0;
  J.phase = 'goal'; J.phaseT = 2.2;
  J.kickSide = joyOther(side);
  J.msg = side === 'me' ? '¡GOOOL! ' + scorer.p.nombre : 'Gol de ' + J.nameB;
  if (typeof playGoalSound === 'function') playGoalSound();
  if (side === 'me' && typeof fxConfetti === 'function') fxConfetti('small');
}

// ----- Entradas -----
function joyTackles(dt) {
  var b = J.ball;
  var all = J.me.concat(J.opp);
  all.forEach(function (d) {
    d.cd = Math.max(0, d.cd - dt); d.stun = Math.max(0, d.stun - dt); d.dash = Math.max(0, d.dash - dt);
    d.dribble = Math.max(0, (d.dribble || 0) - dt);
    if (d.dash <= 0) d.techTackle = false;
  });
  var o = b.owner;
  if (!o || o.pos === 'Portero') return;
  var foes = joyTeam(joyOther(o.side));
  for (var i = 1; i < foes.length; i++) {
    var d = foes[i];
    if (d.stun > 0) continue;
    var dist = joyDist(d, o);
    var skillO = (joySkill(o.p, 'tiro') + joySkill(o.p, 'especial')) / 2;
    var skillD = joySkill(d.p, 'defensa');
    // Tu entrada (Entrar, o Técnica sin balón: más alcance y casi segura).
    if (d.tackleOn === o && d.dash > 0 && dist < (d.techTackle ? 1.8 : 1.5)) {
      d.tackleOn = null;
      var p = d.techTackle ? (o.dribble > 0 ? 0.55 : 0.85) : (o.dribble > 0 ? 0.08 : clamp(0.42 + (skillD - skillO) / 90, 0.12, 0.8));
      d.techTackle = false;
      if (Math.random() < p) { o.stun = 0.7; joyGive(d); }
      else if (Math.random() < 0.15) { J.flash = { text: 'Falta', until: Date.now() + 1000 }; d.stun = 0.6; J.phase = 'restart'; J.phaseT = 0.9; }
      else { d.stun = 0.6; o.burst = 0.6; }
      return;
    }
    if (d.side === 'me' && d === J.ctrl) continue;
    if (dist > 1.15 || d.cd > 0) continue;
    // Entradas de la IA (las de tus compañeros, algo menos). Con su regate
    // en marcha, el que lleva el balón se va.
    var rate = (d.side === 'opp' ? 1.15 : 0.38) * clamp(skillD / Math.max(skillO, 40), 0.6, 1.4);
    if (Math.random() < rate * dt * 2.2) {
      d.cd = 1.1;
      // El rival gasta energía en su técnica de robo, como tú.
      var useTech = d.side === 'opp' && d.techs.defensa && J.cpuEnergy >= JOY_COST.defensa && Math.random() < 0.35;
      if (useTech) { J.cpuEnergy -= JOY_COST.defensa; joyShowTech(d, d.techs.defensa, false); }
      var win = useTech ? (o.dribble > 0 ? 0.5 : 0.85) : (o.dribble > 0 ? 0 : 0.55);
      if (Math.random() < win) { o.stun = 0.55; joyGive(d); return; }
      d.stun = 0.5;
    }
  }
}

// ----- Movimiento -----
function joyMoveAll(dt, settle) {
  var c = J.cfg;
  J.me.concat(J.opp).forEach(function (d) {
    if (d.stun > 0) {
      d.vx *= Math.pow(0.05, dt); d.vy *= Math.pow(0.05, dt);
    } else if (!settle && d === J.ctrl && d.side === 'me') {
      // Tu jugador: ya lo ha movido el joystick (joyControl).
    } else if (typeof d.tx === 'number') {
      var dx = d.tx - d.x, dy = d.ty - d.y, m = Math.hypot(dx, dy);
      var want = m > 0.4 ? d.speed * (d.run || 0.8) * (d.burst > 0 ? 1.3 : 1) * (J.ball.owner === d ? 0.88 : 1) : 0;
      var vx = m > 0.01 ? dx / m * want : 0, vy = m > 0.01 ? dy / m * want : 0;
      d.vx += (vx - d.vx) * Math.min(1, dt * 6); d.vy += (vy - d.vy) * Math.min(1, dt * 6);
      if (want > 0.5) { d.fx = d.vx; d.fy = d.vy; }
    }
    if (settle) { d.vx *= 0.9; d.vy *= 0.9; }
    d.burst = Math.max(0, (d.burst || 0) - dt);
    d.x = clamp(d.x + d.vx * dt, 0.5, c.W - 0.5);
    d.y = clamp(d.y + d.vy * dt, 0.5, c.L - 0.5);
  });
  // Que no se monten unos encima de otros.
  var all = J.me.concat(J.opp);
  for (var i = 0; i < all.length; i++) for (var j = i + 1; j < all.length; j++) {
    var a = all[i], q = all[j], dx = q.x - a.x, dy = q.y - a.y, dd = Math.hypot(dx, dy);
    if (dd > 0.01 && dd < 1.1) { var push = (1.1 - dd) / 2; a.x -= dx / dd * push; a.y -= dy / dd * push; q.x += dx / dd * push; q.y += dy / dd * push; }
  }
}

// ----- Dibujo -----
// Margen alrededor del campo (en metros) para que se vean las porterías.
var JOY_M = 2.6;
function joyCanvasFit() {
  var cv = document.getElementById('joyCanvas');
  if (!cv) return null;
  var wrap = cv.parentNode;
  var c = J.cfg;
  var maxW = wrap.clientWidth || 360;
  var maxH = Math.max(220, wrap.clientHeight || (window.innerHeight - 250));
  var scale = Math.min(maxW / (c.W + JOY_M * 2), maxH / (c.L + JOY_M * 2));
  var w = Math.round((c.W + JOY_M * 2) * scale), h = Math.round((c.L + JOY_M * 2) * scale);
  var dpr = window.devicePixelRatio || 1;
  if (cv._w !== w || cv._h !== h || cv._dpr !== dpr) {
    cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv._w = w; cv._h = h; cv._dpr = dpr;
  }
  cv._s = scale;
  return { cv: cv, ctx: cv.getContext('2d'), s: scale, dpr: dpr, w: w, h: h };
}
function joyDraw() {
  if (!J) return;
  var F = joyCanvasFit();
  joyHud();
  if (!F) return;
  var ctx = F.ctx, s = F.s, c = J.cfg, M = JOY_M * s;
  var X = function (x) { return M + x * s; }, Y = function (y) { return M + y * s; };
  ctx.setTransform(F.dpr, 0, 0, F.dpr, 0, 0);
  // Fondo y césped segado a franjas.
  ctx.fillStyle = '#1f6b2e'; ctx.fillRect(0, 0, F.w, F.h);
  var bands = 12, bh = c.L * s / bands;
  for (var i = 0; i < bands; i++) { ctx.fillStyle = i % 2 ? '#2e8b3e' : '#349848'; ctx.fillRect(M, M + i * bh, c.W * s, bh + 1); }
  var g = ctx.createRadialGradient(F.w / 2, F.h / 2, 10, F.w / 2, F.h / 2, F.h * 0.7);
  g.addColorStop(0, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, F.w, F.h);
  // Líneas.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2;
  ctx.strokeRect(X(0), Y(0), c.W * s, c.L * s);
  ctx.beginPath(); ctx.moveTo(X(0), Y(c.L / 2)); ctx.lineTo(X(c.W), Y(c.L / 2)); ctx.stroke();
  ctx.beginPath(); ctx.arc(X(c.W / 2), Y(c.L / 2), 6 * s, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(c.W / 2), Y(c.L / 2), 2.5, 0, Math.PI * 2); ctx.fill();
  var boxW = c.goalW + 12, boxD = 8, smallW = c.goalW + 4, smallD = 3;
  [0, 1].forEach(function (top) {
    var y0 = top ? 0 : c.L, dir = top ? 1 : -1;
    ctx.strokeRect(X((c.W - boxW) / 2), top ? Y(0) : Y(c.L - boxD), boxW * s, boxD * s);
    ctx.strokeRect(X((c.W - smallW) / 2), top ? Y(0) : Y(c.L - smallD), smallW * s, smallD * s);
    ctx.beginPath(); ctx.arc(X(c.W / 2), Y(y0 + dir * 6), 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(X(c.W / 2), Y(y0 + dir * 6), 4 * s, top ? 0.2 * Math.PI : 1.2 * Math.PI, top ? 0.8 * Math.PI : 1.8 * Math.PI); ctx.stroke();
    // Portería con red.
    var gx = X((c.W - c.goalW) / 2), gw = c.goalW * s, gy = top ? Y(0) - M * 0.85 : Y(c.L), gh = M * 0.85;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
    for (var nx = gx; nx <= gx + gw; nx += 5) { ctx.beginPath(); ctx.moveTo(nx, gy); ctx.lineTo(nx, gy + gh); ctx.stroke(); }
    for (var ny = gy; ny <= gy + gh; ny += 5) { ctx.beginPath(); ctx.moveTo(gx, ny); ctx.lineTo(gx + gw, ny); ctx.stroke(); }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(gx, gy, gw, gh);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2;
  });
  // Estela del tiro.
  var b = J.ball;
  if (b.kind === 'shot' && J.trail) {
    var col = b.tech ? b.tech.color : 'rgba(255,255,255,0.55)';
    J.trail.forEach(function (pt, k) { ctx.globalAlpha = (k + 1) / J.trail.length * (b.tech ? 0.9 : 0.5); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(pt.x), Y(pt.y), (b.tech ? 0.55 : 0.32) * s + k * 0.4, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
  }
  var r = Math.max(9, 1.25 * s);
  var now = Date.now();
  // A quién pasarías (con balón) o a quién cambiarías (sin balón).
  var mineBall = b.owner && b.owner.side === 'me' && b.owner === J.ctrl;
  var hint = J.phase === 'play' ? (mineBall ? joyPassTarget(J.ctrl, joyInput()) : joySwitchCandidate()) : null;
  J.opp.concat(J.me).forEach(function (d) { joyDrawPlayer(ctx, d, X, Y, r, now, d === hint ? (mineBall ? 'pass' : 'switch') : null); });
  // Balón con sombra y gajos.
  var bx = X(b.x), by = Y(b.y), br = Math.max(4.5, r * 0.42);
  ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.beginPath(); ctx.ellipse(bx + 2, by + 3, br, br * 0.65, 0, 0, Math.PI * 2); ctx.fill();
  var bg = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.35, 1, bx, by, br);
  bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#cfd6dc');
  ctx.fillStyle = bg; ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.arc(bx, by, br * 0.38, 0, Math.PI * 2); ctx.fill();
}
function joyDrawPlayer(ctx, d, X, Y, r, now, hint) {
  var x = X(d.x), y = Y(d.y);
  var isCtrl = d === J.ctrl;
  // Sombra.
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x + 2, y + r * 0.8, r * 0.85, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  if (isCtrl) {
    var pulse = 1.45 + Math.sin(now / 180) * 0.12;
    ctx.fillStyle = 'rgba(255,214,0,0.22)'; ctx.beginPath(); ctx.arc(x, y, r * pulse * 1.15, 0, Math.PI * 2); ctx.fill();
    // Hacia dónde mira.
    var fm = Math.hypot(d.fx, d.fy) || 1, ax = d.fx / fm, ay = d.fy / fm;
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.moveTo(x + ax * r * 2.05, y + ay * r * 2.05);
    ctx.lineTo(x + ax * r * 1.45 - ay * r * 0.45, y + ay * r * 1.45 + ax * r * 0.45);
    ctx.lineTo(x + ax * r * 1.45 + ay * r * 0.45, y + ay * r * 1.45 - ax * r * 0.45);
    ctx.closePath(); ctx.fill();
  }
  if (hint) {
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = hint === 'pass' ? '#5fe39a' : 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (hint === 'switch') {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.moveTo(x, y - r * 1.6); ctx.lineTo(x - r * 0.45, y - r * 2.2); ctx.lineTo(x + r * 0.45, y - r * 2.2); ctx.closePath(); ctx.fill();
    }
  }
  var glow = J.techBanner && J.techBanner.until > now && J.techBanner.who === d.p.nombre;
  if (glow) { ctx.fillStyle = J.techBanner.color; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  // Con su regate o su robo en marcha, un aro del color de su elemento.
  if (d.dribble > 0 || d.techTackle) {
    ctx.strokeStyle = MR_ELEM_COLOR[d.p.tipo] || '#ffd166'; ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6 + Math.sin(now / 90) * 0.3;
    ctx.beginPath(); ctx.arc(x, y, r * 1.55, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath();
  ctx.fillStyle = MR_ELEM_COLOR[d.p.tipo] || '#888'; ctx.fill();
  ctx.clip();
  if (d.img && d.img.complete && d.img.naturalWidth) ctx.drawImage(d.img, x - r, y - r, r * 2, r * 2);
  else { ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(r * 0.8) + 'px Pixelify Sans, system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(initials(d.p.nombre), x, y); }
  ctx.restore();
  ctx.lineWidth = isCtrl ? 3.5 : 2.5;
  ctx.strokeStyle = isCtrl ? '#ffd600' : JOY_COLORS[d.side];
  if (d.stun > 0) ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
  if (isCtrl || J.ball.owner === d || hint === 'pass') {
    ctx.font = 'bold ' + Math.max(10, Math.round(r * 0.72)) + 'px Pixelify Sans, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.fillStyle = isCtrl ? '#ffe680' : '#fff';
    var ny = y - r - (hint === 'switch' ? r * 1.3 : 3);
    ctx.strokeText(d.p.nombre, x, ny); ctx.fillText(d.p.nombre, x, ny);
  }
}
function joyHud() {
  var sc = document.getElementById('joyScore');
  if (sc) { var t = J.score.me + ' - ' + J.score.opp; if (sc.textContent !== t) sc.textContent = t; }
  var mn = document.getElementById('joyMinute');
  if (mn) { var m = (J.half === 2 ? '2ª · ' : '1ª · ') + joyMinute() + '\''; if (mn.textContent !== m) mn.textContent = m; }
  var en = document.getElementById('joyEnergy');
  if (en) en.style.width = Math.round(J.energy * 100) + '%';
  var mine = J.ball.owner && J.ball.owner.side === 'me' && J.ball.owner === J.ctrl;
  var la = mine ? 'Pasar' : 'Entrar', lb = mine ? 'Tirar' : 'Cambiar';
  var ba = document.getElementById('joyBtnA'), bb = document.getElementById('joyBtnB');
  if (ba && ba.firstChild && ba.firstChild.textContent !== la) ba.firstChild.textContent = la;
  if (bb && bb.firstChild && bb.firstChild.textContent !== lb) bb.firstChild.textContent = lb;
  var subA = mine ? 'toca' : 'roba', subB = mine ? 'mantén y suelta' : 'compañero';
  if (ba && ba.lastChild && ba.lastChild.textContent !== subA) ba.lastChild.textContent = subA;
  if (bb && bb.lastChild && bb.lastChild.textContent !== subB) bb.lastChild.textContent = subB;
  // Botón de técnica: dice cuál saldría y se enciende si hay energía.
  var bc = document.getElementById('joyBtnC');
  if (bc) {
    var act = joyTechAction();
    var lc = act ? act.label : 'Técnica', subC = act ? act.tech.name : 'sin técnica';
    if (bc.firstChild.textContent !== lc) bc.firstChild.textContent = lc;
    if (bc.lastChild.textContent !== subC) bc.lastChild.textContent = subC;
    bc.classList.toggle('joy-btn-super', joyTechReady(act));
    bc.classList.toggle('joy-btn-off', !act);
    if (act) bc.style.setProperty('--tech', act.tech.color); else bc.style.removeProperty('--tech');
  }
  // Marcas de lo que cuesta cada técnica en la barra.
  var enWrap = document.getElementById('joyEnergyCost');
  if (enWrap) {
    var a2 = joyTechAction(), left = a2 && JOY_COST[a2.kind] ? Math.round(JOY_COST[a2.kind] * 100) + '%' : '';
    if (enWrap.style.left !== left) { enWrap.style.left = left; enWrap.style.display = left ? '' : 'none'; }
  }
  // Barra de potencia mientras cargas el tiro.
  var pw = document.getElementById('joyShotPower');
  if (pw) {
    var on = !!J.charge;
    pw.classList.toggle('on', on);
    if (on) pw.querySelector('i').style.width = Math.round(joyChargePower() * 100) + '%';
  }
  // Mensajes grandes (gol, descanso, saques) y técnica.
  var msgEl = document.getElementById('joyMsg');
  if (msgEl) {
    var now = Date.now();
    var text = J.phase !== 'play' && J.msg ? J.msg : (J.flash && J.flash.until > now ? J.flash.text : '');
    var cls = 'joy-msg' + (text ? ' on' : '') + (J.phase === 'goal' ? ' joy-msg-goal' : '');
    if (msgEl.textContent !== text) msgEl.textContent = text;
    if (msgEl.className !== cls) msgEl.className = cls;
  }
  var tb = document.getElementById('joyTech');
  if (tb) {
    var b2 = J.techBanner, onT = b2 && b2.until > Date.now();
    if (onT && tb.getAttribute('data-id') !== String(b2.id)) {
      tb.setAttribute('data-id', String(b2.id));
      tb.style.setProperty('--tech', b2.color);
      tb.innerHTML = '<span>⚡ ' + (b2.side === 'me' ? 'Supertécnica' : 'Supertécnica rival') + '</span><strong>' + escapeHtml(b2.name) + '</strong><em>' + escapeHtml(b2.who) + '</em>';
    }
    tb.classList.toggle('on', !!onT);
  }
}

// ----- Joystick en pantalla -----
window.joyStickEvent = function (ev, kind) {
  if (!J) return;
  ev.preventDefault();
  var base = document.getElementById('joyStick');
  var knob = document.getElementById('joyKnob');
  if (!base) return;
  if (kind === 'down') { try { base.setPointerCapture(ev.pointerId); } catch (e) {} J.stick.on = true; J.stick.id = ev.pointerId; }
  if (kind === 'up') { J.stick = { x: 0, y: 0, on: false }; if (knob) knob.style.transform = 'translate(-50%,-50%)'; return; }
  if (!J.stick.on) return;
  var r = base.getBoundingClientRect();
  var cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = r.width / 2;
  var dx = ev.clientX - cx, dy = ev.clientY - cy, m = Math.hypot(dx, dy);
  if (m > rad) { dx = dx / m * rad; dy = dy / m * rad; }
  J.stick.x = dx / rad; J.stick.y = dy / rad;
  if (knob) knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
};
function joyBindKeys() {
  if (joyBindKeys.done) return;
  joyBindKeys.done = true;
  var map = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  window.addEventListener('keydown', function (e) {
    if (!J || G.screen !== 'joyMatch') return;
    // Escape: abre o cierra el aviso de salir.
    if (e.code === 'Escape') { if (J.quitAsk) joyCancelQuit(); else if (J.showHelp) joyCloseHelp(); else joyAskQuit(); e.preventDefault(); return; }
    if (J.quitAsk || J.showHelp) return;
    if (map[e.code]) { J.keys[map[e.code]] = true; e.preventDefault(); }
    if (e.code === 'KeyJ' || e.code === 'Space') { joyButton('a'); e.preventDefault(); }
    if (e.code === 'KeyK' && !e.repeat) { joyButton('b', null, false); e.preventDefault(); }
    if (e.code === 'KeyL' && !e.repeat) { joySwitch(); e.preventDefault(); }
    if (e.code === 'KeyI' && !e.repeat) { joyButton('c'); e.preventDefault(); }
  });
  window.addEventListener('keyup', function (e) {
    if (!J || G.screen !== 'joyMatch') return;
    if (map[e.code]) J.keys[map[e.code]] = false;
    if (e.code === 'KeyK') joyButton('b', null, true);
  });
}

// ----- Vídeo de la supertécnica -----
function joyVideoPlay(src, caption, color) {
  var box = document.getElementById('joyVideo');
  if (!box) return;
  var v = box.querySelector('video');
  var webm = v.canPlayType('video/webm; codecs="vp9, opus"') === 'probably';
  v.src = src + (webm ? '.webm' : '.mp4');
  v.onended = function () { if (J && J.hold) J.hold.done = true; };
  v.onerror = function () { if (/\.webm$/.test(v.src)) { v.src = src + '.mp4'; v.play().catch(function () {}); } else if (J && J.hold) J.hold.done = true; };
  box.querySelector('.joy-video-cap').textContent = caption;
  if (color) box.style.setProperty('--tech', color);
  box.classList.add('on');
  v.muted = !(typeof soundEnabled === 'function' && soundEnabled());
  var p = v.play();
  if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () { if (J && J.hold) J.hold.done = true; }); });
}
function joyVideoStop() {
  var box = document.getElementById('joyVideo');
  if (!box) return;
  var v = box.querySelector('video');
  // Soltar el vídeo para no acumular memoria (iPhone).
  if (v) { v.pause(); try { v.removeAttribute('src'); v.load(); } catch (e) {} }
  box.classList.remove('on');
}

// ----- Pantalla -----
function joyHelpHtml() {
  return '<div class="joy-help">' +
    '<div class="joy-help-card">' +
      '<h2>Cómo se juega</h2>' +
      '<p class="joy-help-lead">Llevas al jugador con el aro amarillo. Atacas hacia arriba.</p>' +
      '<div class="joy-help-row"><span class="joy-help-ico joy-help-stick"></span><div><strong>Moverte</strong><p>Arrastra el joystick de la izquierda. La flecha amarilla dice hacia dónde miras.</p></div></div>' +
      '<div class="joy-help-row"><span class="joy-help-ico joy-btn-a">P</span><div><strong>Pasar · un toque</strong><p>Pase raso al compañero hacia donde apuntas con el joystick. El que va a recibir lleva un aro verde. También puedes tocar a un compañero en el campo para pasarle.</p></div></div>' +
      '<div class="joy-help-row"><span class="joy-help-ico joy-btn-b">T</span><div><strong>Tirar · mantén y suelta</strong><p>Mantén pulsado para cargar y suelta para chutar. Apunta a izquierda o derecha con el joystick. Flojo, el portero lo para; en la franja verde entra mejor; demasiado fuerte se va fuera.</p></div></div>' +
      '<div class="joy-help-row"><span class="joy-help-ico joy-btn-a">E</span><div><strong>Sin balón: Entrar</strong><p>Acércate al rival que lleva el balón y pulsa para robar. Si fallas, se te va.</p></div></div>' +
      '<div class="joy-help-row"><span class="joy-help-ico joy-btn-b">C</span><div><strong>Cambiar de jugador</strong><p>Pulsa Cambiar para llevar al compañero más cerca del balón (lo marca una flecha blanca), o toca a cualquier compañero en el campo.</p></div></div>' +
      '<div class="joy-help-row"><span class="joy-help-ico joy-help-super">⚡</span><div><strong>Técnica</strong><p>Usa la supertécnica de tu jugador que encaja en ese momento, y el botón dice cuál. Con balón cerca del área, su supertiro. Con balón más lejos, su regate: se va de la siguiente entrada. Sin balón, su robo: entrada desde más lejos y casi segura. Cada una gasta energía; la barra se llena con el tiempo y robando, y la raya marca lo que cuesta.</p></div></div>' +
      '<div class="joy-help-row"><span class="joy-help-ico joy-help-super">🧤</span><div><strong>Porteros y rival</strong><p>A un supertiro el portero responde con su técnica de parada si la tiene. El rival tiene su propia energía y usa sus técnicas igual que tú. Tira lejos del portero: sin apuntar, el tiro va al palo libre.</p></div></div>' +
      '<p class="joy-help-keys">Teclado: flechas o WASD para moverte · J pasar o entrar · K mantener para tirar · L cambiar · I técnica.</p>' +
      '<button class="btn btn-primary btn-block" onclick="joyCloseHelp()">¡A jugar!</button>' +
    '</div>' +
  '</div>';
}
window.joyOpenHelp = function () { if (!J) return; J.showHelp = true; J.charge = null; render(); };
window.joyCloseHelp = function () {
  if (!J) return;
  J.showHelp = false;
  if (G.meta) { G.meta.joyHelpSeen = true; saveMeta(G.meta); }
  J.last = 0;
  render();
};
function renderJoyMatch() {
  if (!J) return renderMenu();
  return (
    '<div class="screen joy-screen">' +
      '<div class="joy-top">' +
        '<div class="joy-side"><img src="' + escapeHtml(teamShieldPath(J.nameA)) + '" alt=""><span class="joy-team">' + escapeHtml(J.nameA) + '</span></div>' +
        '<div class="joy-mid"><span class="joy-score" id="joyScore">' + J.score.me + ' - ' + J.score.opp + '</span><span class="joy-minute" id="joyMinute">' + joyMinute() + '\'</span></div>' +
        '<div class="joy-side joy-side-b"><span class="joy-team">' + escapeHtml(J.nameB) + '</span><img src="' + escapeHtml(teamShieldPath(J.nameB)) + '" alt=""></div>' +
      '</div>' +
      '<div class="joy-sub">' +
        '<div class="joy-energy-wrap"><span class="joy-energy-label">⚡ Energía</span><div class="joy-energy"><span id="joyEnergy" style="width:' + Math.round(J.energy * 100) + '%"></span><i class="joy-energy-cost" id="joyEnergyCost"></i></div></div>' +
        '<button class="joy-round-btn" onclick="joyOpenHelp()" aria-label="Cómo se juega">?</button>' +
        '<button class="joy-round-btn" onclick="joyAskQuit()" aria-label="Salir">✕</button>' +
      '</div>' +
      '<div class="joy-field"><canvas id="joyCanvas" onpointerdown="joyCanvasTap(event)"></canvas>' +
        '<div class="joy-msg" id="joyMsg"></div>' +
        '<div class="joy-tech" id="joyTech"></div>' +
        '<div class="joy-shot-power" id="joyShotPower"><b></b><i></i></div>' +
        '<div class="joy-video" id="joyVideo"><video muted playsinline webkit-playsinline preload="auto"></video><div class="joy-video-cap"></div></div>' +
      '</div>' +
      '<div class="joy-controls">' +
        '<div class="joy-stick" id="joyStick" onpointerdown="joyStickEvent(event,\'down\')" onpointermove="joyStickEvent(event,\'move\')" onpointerup="joyStickEvent(event,\'up\')" onpointercancel="joyStickEvent(event,\'up\')"><div class="joy-knob" id="joyKnob"></div></div>' +
        '<div class="joy-btns">' +
        '<button class="joy-btn joy-btn-c" id="joyBtnC" onpointerdown="joyButton(\'c\', event)"><span>Técnica</span><small>sin técnica</small></button>' +
        '<div class="joy-btn-row">' +
          '<button class="joy-btn joy-btn-a" id="joyBtnA" onpointerdown="joyButton(\'a\', event)"><span>Pasar</span><small>toca</small></button>' +
          '<button class="joy-btn joy-btn-b" id="joyBtnB" onpointerdown="joyButton(\'b\', event)" onpointerup="joyButton(\'b\', event, true)" onpointercancel="joyButton(\'b\', event, true)" onpointerleave="joyButton(\'b\', event, true)"><span>Tirar</span><small>mantén y suelta</small></button>' +
        '</div>' +
        '</div>' +
      '</div>' +
      (J.showHelp ? joyHelpHtml() : '') +
      (J.quitAsk ? joyQuitHtml() : '') +
    '</div>'
  );
}
// Salir: aviso propio dentro del partido. El modal general de "¿Seguro que
// quieres salir?" quedaba por detrás de esta pantalla (que va por encima de
// todo) y el partido se quedaba en pausa sin que se viera nada.
function joyQuitHtml() {
  return '<div class="joy-help">' +
    '<div class="joy-help-card joy-quit-card">' +
      '<div class="modal-icon">🚪</div>' +
      '<h2>¿Salir del partido?</h2>' +
      '<p class="joy-help-lead">El partido no cuenta si sales ahora.</p>' +
      '<div class="joy-quit-btns">' +
        '<button class="btn btn-outline" onclick="joyCancelQuit()">Seguir jugando</button>' +
        '<button class="btn btn-danger" onclick="actionJoyQuit()">Salir</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}
window.joyAskQuit = function () { if (!J) return; J.quitAsk = true; J.charge = null; render(); };
window.joyCancelQuit = function () { if (!J) return; J.quitAsk = false; J.last = 0; render(); };
window.actionJoyQuit = function () {
  joyVideoStop();
  J = null;
  G.confirmLeaveOpen = false;
  G.pendingLeaveFn = null;
  actionBackToMenu();
};

// ----- Final: pantalla de resultado común -----
function joyFinish(pen) {
  joyVideoStop();
  var my = J.score.me, opp = J.score.opp;
  var won = pen ? pen.myGoals > pen.oppGoals : my > opp, draw = my === opp && !pen;
  var total = J.poss.me + J.poss.opp || 1;
  G.futdraft = G.futdraft || {};
  G.futdraft.live = null;
  G.futdraft.lastLiveStats = { cards: [], possBarPct: Math.round(J.poss.me / total * 100) };
  G.futdraft.lastMatchResult = {
    oppName: J.nameB, oppShield: teamShieldPath(J.nameB), oppPower: qmPower(J.nameB),
    myGoals: my, oppGoals: opp, playerWon: won, timeline: J.events, modifier: null, youAreHome: true,
    youName: J.nameA, youShield: teamShieldPath(J.nameA), penalty: pen || null, profileMode: 'rapido',
    kicker: 'Juega tú · ' + J.format + ' vs ' + J.format + (J.cup ? ' · Eliminatoria' : ''),
    spiritPoints: awardSpiritPoints(draw ? SPIRIT_MATCH_DRAW : won ? SPIRIT_MATCH_WIN : SPIRIT_MATCH_LOSS),
    buttonsHtml: '<button class="btn btn-primary btn-block mt" onclick="actionGoPlayMode(&quot;joy&quot;)">Otro partido</button><button class="btn btn-outline btn-block mt" onclick="actionBackToMenu()">Menú</button>'
  };
  J = null;
  G.screen = 'futdraftMatchResult';
  render();
}
