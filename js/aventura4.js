/* ---------------------------------------------------------------------
   AVENTURA 4 VS 4, a petición explícita ("haz un modo aparte, donde
   combines el simular partidos de 4 vs 4, con lo de las tomas de
   decisiones y los drafts y los entrenamientos"). Es la Aventura de
   siempre (capitán, mapa, fichajes, entrenamientos, descansos, eventos y
   jefes), pero cada partido se juega en la pista de 4 vs 4 con el motor de
   Ver partido: dos partes de 25' o hasta 3 goles, y si hay empate,
   penaltis. Antes de cada partido eliges la táctica, y si aún no tienes
   4 jugadores, completan el equipo juveniles de nivel bajo.
   G.run.sim4 marca la partida; startMatch (combat.js) desvía aquí.
   --------------------------------------------------------------------- */
var AV4_TACTICS = [
  { id: 'ataque', icon: '⚔️', name: 'Al ataque', desc: 'Más goles a favor y en contra', atk: 1.18, def: 0.85 },
  { id: 'equilibrado', icon: '⚖️', name: 'Equilibrado', desc: 'Sin riesgos', atk: 1, def: 1 },
  { id: 'cerrojo', icon: '🧱', name: 'Cerrojo', desc: 'Cuesta marcar y encajar', atk: 0.85, def: 1.18 }
];
var AV4_FATIGUE_PENALTY = 10;
// Partidos más cortos que el 4 vs 4 suelto, a petición explícita: dos
// partes de 15' o a 3 goles.
var AV4_HALF = 15;

window.actionStartAventura4 = function () {
  G.pendingRunMode = 'normal';
  G.pendingSim4 = true;
  G.pendingCaptainOffers = offerCaptains();
  G.screen = 'captainSelect';
  render();
};

// Primer tramo, a petición explícita ("para así hacer un 4 vs 4 más
// justo... alarga, para que haya mínimo 3 fichajes y 1 entreno o 3
// fichajes y 1 evento especial"): las 3 primeras filas son todas de
// Fichaje y se mete una fila más, de Entrenamiento o Evento, justo antes
// del primer jefe. Vayas por donde vayas llegas a él con tus 4 jugadores
// y una mejora o evento.
var AV4_OPENING_RECRUIT_ROWS = 3;
function av4ForceOpeningRecruits(map) {
  if (!map) return;
  for (var r = 0; r < AV4_OPENING_RECRUIT_ROWS && r < map.rows.length; r++) {
    map.rows[r].forEach(function (n) { if (n.type !== 'jefe') n.type = 'fichaje'; });
  }
  var at = AV4_OPENING_RECRUIT_ROWS;
  var prev = map.rows[at - 1], next = map.rows[at];
  if (!prev || !next) return;
  var count = rand(3, 4);
  var extra = [];
  for (var c = 0; c < count; c++) extra.push({ id: 'av4x' + c, row: at, col: c, type: Math.random() < 0.6 ? 'entrenamiento' : 'evento', cleared: false });
  // Fila nueva entre la última de fichajes y la del jefe: cada nodo de
  // arriba va a los de la nueva fila que tiene cerca (en proporción), y
  // todos los nuevos van al jefe (o a los de la fila siguiente).
  prev.forEach(function (n) {
    var prop = prev.length > 1 ? (n.col / (prev.length - 1)) * (count - 1) : (count - 1) / 2;
    map.edges[n.id] = extra.filter(function (x) { return Math.abs(x.col - prop) <= 1; }).map(function (x) { return x.id; });
    if (!map.edges[n.id].length) map.edges[n.id] = [extra[Math.round(prop)].id];
  });
  extra.forEach(function (x) {
    var hasIn = prev.some(function (n) { return map.edges[n.id].indexOf(x.id) !== -1; });
    if (!hasIn) map.edges[prev[Math.min(x.col, prev.length - 1)].id].push(x.id);
    map.edges[x.id] = next.map(function (n) { return n.id; });
  });
  map.rows.splice(at, 0, extra);
  map.rows.forEach(function (row, ri) { row.forEach(function (n) { n.row = ri; }); });
}

function av4PlayerScore(p) {
  return futDraftPlayerScore(p) - (p.fatigado ? AV4_FATIGUE_PENALTY : 0);
}
// Tus cuatro: toda tu plantilla (máximo 4) y, en los huecos, juveniles del
// roster de media baja, empezando por el portero si no tienes.
function av4MyFour() {
  var squad = G.run.squad.slice(0, 4);
  var have = {};
  squad.forEach(function (p) { have[p.posicion] = (have[p.posicion] || 0) + 1; });
  var ids = {};
  squad.forEach(function (p) { ids[p.id] = true; });
  var missing = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'].filter(function (pos) { return !have[pos]; });
  var four = squad.slice();
  var youth = ROSTER.filter(function (p) { var s = futDraftPlayerScore(p); return s >= 58 && s <= 66 && !ids[p.id]; }).sort(function () { return Math.random() - 0.5; });
  while (four.length < 4) {
    var pos = missing.shift() || 'Centrocampista';
    var pick = youth.find(function (p) { return p.posicion === pos && !ids[p.id]; }) || youth.find(function (p) { return !ids[p.id] && p.posicion !== 'Portero'; });
    if (!pick) break;
    ids[pick.id] = true;
    four.push(Object.assign({}, pick, { juvenil: true, instanceId: 'juv-' + pick.id }));
  }
  return four.sort(function (a, b) { return QM_LINE_ORDER.indexOf(a.posicion) - QM_LINE_ORDER.indexOf(b.posicion); });
}
function av4TeamScore(four) {
  return Math.round(four.reduce(function (s, p) { return s + av4PlayerScore(p); }, 0) / four.length);
}

// Rival: un equipo real con sus cuatro mejores. Su nivel sube con la
// profundidad en el mapa (misma escala 0-10 que startMatch) y con los
// jefes, mezclado un poco con la media real del equipo.
function av4StartMatch(nodeId, isBoss) {
  var depth = mapDepth(nodeId, G.run.map);
  var maxDepth = G.run.map.rows.length - 1;
  var isFinalBoss = isBoss && depth === maxDepth;
  var normDepth = maxDepth > 0 ? (depth / maxDepth) * 10 : depth;
  av4SetupMatch({ nodeId: nodeId, isBoss: isBoss, isFinalBoss: isFinalBoss, normDepth: normDepth, oppName: randomTeamName(isBoss) });
}
// Aventura, Modo Diario, Supervivencia y Modo Torneo juegan ahora sus
// partidos en vivo, en la pista de 4 vs 4 y con Tú decides (a petición
// explícita: "rehacer Aventura y Diario con el motor de partido nuevo en
// vez del combate por turnos"). Sus funciones de inicio arman G.match como
// siempre (el partido por turnos) y llaman aquí: se va a la previa en vivo
// y G.match se guarda por si eliges jugarlo por turnos (clásico).
function runMatchStart(normDepth, isFinalBoss) {
  var m = G.match;
  if (G.meta && G.meta.classicCombat) { G.screen = 'match'; render(); return; }
  av4SetupMatch({ isBoss: !!m.isBoss, isFinalBoss: !!isFinalBoss, normDepth: Math.min(normDepth || 0, 14), oppName: String(m.oppName).replace(/^Jefe:\s*/, ''), classic: m });
}
window.actionPlayClassicMatch = function () {
  var a = G.av4;
  if (!a || !a.classic) return;
  G.match = a.classic;
  G.screen = 'match';
  render();
};
window.actionSetClassicCombat = function (on) {
  G.meta.classicCombat = !!on;
  saveMeta(G.meta);
  render();
};
var AV4_RUN_LABEL = { normal: 'Aventura', diario: 'Reto del día', supervivencia: 'Supervivencia', torneo: 'Modo Torneo' };
var AV4_RUN_ICON = { normal: '🗺️', diario: '📅', supervivencia: '🛡️', torneo: '🥇' };
function av4SetupMatch(o) {
  var isBoss = o.isBoss, isFinalBoss = o.isFinalBoss, normDepth = o.normDepth, nodeId = o.nodeId;
  var oppName = o.oppName;
  var four = av4MyFour();
  var myIds = four.map(function (p) { return p.id; });
  var oppFour = qmBuildFour(oppName, myIds);
  var target = 50 + normDepth * 3.2 + (isBoss ? 4 : 0) + (isFinalBoss ? 3 : 0) + (G.run.hardMode ? 4 : 0);
  var real = oppFour.reduce(function (s, p) { return s + futDraftPlayerScore(p); }, 0) / oppFour.length;
  G.av4 = {
    nodeId: nodeId, isBoss: isBoss, isFinalBoss: isFinalBoss,
    oppName: oppName, oppFour: oppFour, oppPower: clamp(Math.round(target * 0.75 + real * 0.25), 40, 97),
    tactic: (G.av4 && G.av4.tactic) || 'equilibrado', four: four, classic: o.classic || null
  };
  G.screen = 'av4Prematch';
  render();
}
window.actionAv4Tactic = function (id) { G.av4.tactic = id; render(); };

function av4TeamRowHtml(list, scoreFn) {
  return '<div class="av4-four">' + list.map(function (p) {
    var sc = Math.round(scoreFn(p));
    return '<div class="av4-player' + (p.fatigado ? ' av4-tired' : '') + '">' +
      '<span class="pitch-media-badge" style="background:' + mediaBadgeColor(sc) + '">' + sc + '</span>' +
      avatarHtml(p) +
      '<span class="av4-name">' + escapeHtml(p.nombre) + '</span>' +
      '<span class="av4-tag">' + (p.juvenil ? 'Juvenil' : p.fatigado ? 'Cansado' : escapeHtml(p.posicion)) + '</span>' +
    '</div>';
  }).join('') + '</div>';
}
function renderAv4Prematch() {
  var a = G.av4;
  var myPower = av4TeamScore(a.four);
  var pct = Math.round(myPower / (myPower + a.oppPower) * 100);
  var juveniles = a.four.filter(function (p) { return p.juvenil; }).length;
  var tiredCount = a.four.filter(function (p) { return p.fatigado; }).length;
  var tactics = '<div class="mode-pick-grid">' + AV4_TACTICS.map(function (t) {
    return '<button class="mode-pick-card' + (a.tactic === t.id ? ' active' : '') + '" onclick="actionAv4Tactic(\'' + t.id + '\')"><span class="mode-pick-icon">' + t.icon + '</span><span class="mode-pick-text"><span class="mode-pick-name">' + t.name + '</span><span class="mode-pick-desc">' + t.desc + '</span></span></button>';
  }).join('') + '</div>';
  var mode = G.run && G.run.sim4 ? 'sim4' : (G.run && G.run.mode) || 'normal';
  var label = mode === 'sim4' ? 'Aventura 4 vs 4' : (AV4_RUN_LABEL[mode] || 'Aventura');
  return (
    '<div class="screen">' +
      pageTopHtml(null, label, mode === 'sim4' ? '🧭' : (AV4_RUN_ICON[mode] || '🗺️')) +
      '<div class="panel center-text av4-pre-head' + (a.isBoss ? ' av4-boss' : '') + '">' +
        '<p class="av4-kicker">' + (a.isFinalBoss ? '👑 Jefe final' : a.isBoss ? '💀 Jefe' : '⚽ Partido') + ' · 4 vs 4 · dos partes de ' + AV4_HALF + '\' o a ' + QM4_FIRST_TO + ' goles</p>' +
        '<div class="av4-vs">' +
          '<div class="av4-side"><img class="team-shield" src="' + escapeHtml(getPlayerShieldPath()) + '" alt=""><strong>Tu equipo</strong><span class="qm-power-num" style="background:' + mediaBadgeColor(myPower) + '">' + myPower + '</span></div>' +
          '<span class="av4-vs-txt">VS</span>' +
          '<div class="av4-side" onclick="actionOpenTeamCard(\'' + a.oppName.replace(/'/g, '') + '\')"><img class="team-shield" src="' + escapeHtml(teamShieldPath(a.oppName)) + '" alt=""><strong>' + escapeHtml(a.oppName) + '</strong><span class="qm-power-num" style="background:' + mediaBadgeColor(a.oppPower) + '">' + a.oppPower + '</span></div>' +
        '</div>' +
        '<div class="qm-power-bar av4-power-bar" style="--ca:var(--accent);--cb:var(--danger)"><span class="qm-power-a" style="width:' + pct + '%"></span><span class="qm-power-b" style="width:' + (100 - pct) + '%"></span></div>' +
      '</div>' +
      '<div class="panel">' +
        '<h3 style="margin-bottom:6px">Tus cuatro</h3>' +
        av4TeamRowHtml(a.four, av4PlayerScore) +
        (juveniles ? '<p class="dim small mt">Te faltan jugadores: ' + juveniles + (juveniles === 1 ? ' juvenil completa' : ' juveniles completan') + ' el equipo solo en este partido. Ficha para sustituirlos.</p>' : '') +
        (tiredCount ? '<p class="dim small">Los cansados juegan con ' + AV4_FATIGUE_PENALTY + ' puntos menos. Descansa o gana a un jefe para recuperarlos.</p>' : '') +
        '<h3 style="margin:12px 0 6px">Rival</h3>' +
        av4TeamRowHtml(a.oppFour, futDraftPlayerScore) +
      '</div>' +
      '<div class="panel">' +
        '<h3 style="margin-bottom:8px">Táctica</h3>' +
        tactics +
        '<div class="av4-play">' +
          '<button class="av4-play-main" onclick="G.decideNext=true;actionAv4Play()"><span>⚽</span><b>Jugar</b><em>Con el dedo, como en la DS</em></button>' +
        '</div>' +
        (a.classic ? '<button class="av4-classic" onclick="actionPlayClassicMatch()">⚔️ Jugar por turnos</button>' : '') +
      '</div>' +
    '</div>'
  );
}

window.actionAv4Play = function () {
  var a = G.av4;
  var tactic = AV4_TACTICS.find(function (t) { return t.id === a.tactic; }) || AV4_TACTICS[1];
  // Cansancio: -10 a todas sus stats solo para este partido.
  var four = a.four.map(function (p) {
    if (!p.fatigado) return Object.assign({}, p);
    return Object.assign({}, p, { tiro: Math.max(5, p.tiro - AV4_FATIGUE_PENALTY), pase: Math.max(5, p.pase - AV4_FATIGUE_PENALTY), defensa: Math.max(5, p.defensa - AV4_FATIGUE_PENALTY), especial: Math.max(5, p.especial - AV4_FATIGUE_PENALTY) });
  });
  var myPower = av4TeamScore(a.four);
  G.futdraft = {
    lineup: qmLineupOf(four), squad: four.slice(), captainId: null, formation: '442', condition: 'ninguna',
    tactics: { foul: 'medio', intensity: 'media' }, teamScoreOverride: myPower,
    styleAtkMult: tactic.atk, styleDefMult: tactic.def,
    oppPlayersOverride: a.oppFour, oppGhostPool: a.oppFour
  };
  var sim = futDraftSimulateMatchCore(a.oppPower);
  var g4 = qm4Goals(sim, four, a.oppFour, AV4_HALF);
  G.futdraft.live = qm4LiveRules({
    oppSide: { name: a.oppName }, modifier: sim.modifier,
    minute: 0, pending: g4.timeline.slice(), revealed: [],
    myGoals: 0, oppGoals: 0, finalMyGoals: g4.myGoals, finalOppGoals: g4.oppGoals,
    myAtk: sim.myAtk, myDef: sim.myDef, effectiveOppPower: sim.effectiveOppPower,
    inExtraTime: false, allowDraw: false, onFinish: av4Finish,
    isCareer: false, isWorldTour: false, youAreHome: true,
    youName: 'Tu equipo', youShield: getPlayerShieldPath(),
    oppFormation: { id: '4v4', rows: qmRowsOf(a.oppFour) },
    visualMode: 'dots', done: false
  }, AV4_HALF);
  a.myPower = myPower;
  G.screen = 'futdraftLive';
  if (typeof playKickoffSound === 'function') playKickoffSound();
  render();
  futDraftLiveTick();
};

// Mismo final que un partido de la Aventura (finishMatch en combat.js):
// al ganar, Puntos de Espíritu, un jugador cansado y +5 a una stat de uno
// o dos jugadores; al perder se acaba la partida.
function av4Finish() {
  var live = G.futdraft.live;
  var a = G.av4;
  var tied = live.myGoals === live.oppGoals;
  if (futDraftLivePenaltyGate(live, a.oppName, a.myPower - a.oppPower, tied, av4Finish)) return;
  var pen = live.penaltyResult || null;
  var won = pen ? pen.myGoals > pen.oppGoals : live.myGoals > live.oppGoals;
  var squadIds = {};
  G.run.squad.forEach(function (p) { squadIds[p.id] = p; });
  live.revealed.forEach(function (ev) { if (ev.side === 'me' && ev.scorer && squadIds[ev.scorer.id]) recordRunGoalScorer(squadIds[ev.scorer.id], true); });
  if (typeof profileRecord === 'function') profileRecord('aventura', live.myGoals, live.oppGoals, pen ? won : null, a.oppName);
  var m = { isBoss: a.isBoss, oppName: a.oppName, playerScore: live.myGoals, oppScore: live.oppGoals, penalty: pen, won: won, timeline: live.revealed.slice(), log: [], finished: true, bonusesApplied: [] };
  if (won) {
    G.run.matchesWon++;
    var reward = SPIRIT_PER_MATCH + (a.isBoss ? SPIRIT_PER_BOSS : 0);
    G.run.spiritEarned += reward;
    m.reward = reward;
    var candidate = choice(G.run.squad);
    if (candidate) { candidate.fatigado = true; m.tired = candidate.nombre; }
    var shuffled = G.run.squad.slice().sort(function () { return Math.random() - 0.5; });
    shuffled.slice(0, Math.random() < 0.6 ? 1 : 2).forEach(function (p) {
      var stat = choice(['tiro', 'pase', 'defensa', 'especial']);
      var oldVal = p[stat];
      applyStatChange(p, stat, 5);
      m.bonusesApplied.push({ nombre: p.nombre, stat: stat, oldVal: oldVal, newVal: p[stat] });
    });
  }
  G.match = m;
  G.futdraft.live = null;
  G.screen = 'av4Result';
  render();
}

function renderAv4Result() {
  var m = G.match;
  var a = G.av4;
  var rows = m.timeline.map(function (ev) { return futDraftTimelineRowHtml(ev, m.oppName, getPlayerShieldPath(), true); }).join('');
  var bonuses = (m.bonusesApplied || []).map(function (b) {
    return '<p class="av4-bonus">' + escapeHtml(b.nombre) + ': ' + STAT_LABELS[b.stat] + ' +5 (' + b.oldVal + ' → ' + b.newVal + ')</p>';
  }).join('');
  return (
    '<div class="screen">' +
      '<div class="panel center-text">' +
        '<div class="result-kicker">' + (m.won ? 'Victoria' : 'Derrota') + (a.isBoss ? ' ante un jefe' : '') + '</div>' +
        '<div class="av4-vs">' +
          '<div class="av4-side"><img class="team-shield" src="' + escapeHtml(getPlayerShieldPath()) + '" alt=""><strong>Tu equipo</strong></div>' +
          '<span class="av4-score">' + m.playerScore + ' - ' + m.oppScore + '</span>' +
          '<div class="av4-side"><img class="team-shield" src="' + escapeHtml(teamShieldPath(m.oppName)) + '" alt=""><strong>' + escapeHtml(m.oppName) + '</strong></div>' +
        '</div>' +
        (m.penalty ? '<p class="dim small">Penaltis: ' + m.penalty.myGoals + ' - ' + m.penalty.oppGoals + '</p>' : '') +
      '</div>' +
      (rows ? '<div class="panel"><div class="futdraft-timeline">' + rows + '</div></div>' : '') +
      '<div class="panel center-text">' +
        (m.won
          ? '<p class="currency-display">' + spiritIcon() + ' +' + m.reward + ' Puntos de Espíritu al terminar</p>' +
            (bonuses ? '<div class="av4-bonuses"><p class="av4-bonus-title">Mejoras tras la victoria</p>' + bonuses + '</div>' : '') +
            (m.tired ? '<p class="dim small">' + escapeHtml(m.tired) + ' acaba cansado.</p>' : '') +
            '<button class="btn btn-primary btn-block mt" onclick="afterMatchWin()">Continuar</button>'
          : '<p class="dim">Tu aventura termina aquí.</p><button class="btn btn-danger btn-block" onclick="afterMatchLoss()">Ver resumen</button>') +
      '</div>' +
    '</div>'
  );
}
