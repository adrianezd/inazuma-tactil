function setScoreNum(el, v) {
  if (String(el.textContent) === String(v)) return;
  el.textContent = v;
  el.classList.remove("score-pop"); void el.offsetWidth; el.classList.add("score-pop");
}
window.startFutDraftMatches = function () {
  // tu once se guarda para poder jugar contra los que te compartan (engage.js)
  if (typeof engageSaveMySquad === 'function') engageSaveMySquad(engageSquadSummary(G.futdraft));
  var size = futDraftBracketSize();
  var bracket = generateTournamentBracket(size);
  // Torneo a medida: tu casilla lleva el nombre de tu equipo, y ese mismo
  // equipo (o uno que choque con él) no puede salir de rival.
  var ct = G.futdraft.customTeam;
  if (ct) {
    var taken = {};
    taken[normalizeTeamKey(ct)] = true;
    teamConflicts(ct).forEach(function (t) { taken[normalizeTeamKey(t)] = true; });
    var spare = RIVAL_TEAM_BOSSES.concat(RIVAL_TEAM_NAMES).filter(function (n) {
      return !bracket.slots.some(function (s) { return !s.isPlayer && s.name === n; }) && !taken[normalizeTeamKey(n)];
    }).sort(function () { return Math.random() - 0.5; });
    bracket.slots.forEach(function (s) {
      if (s.isPlayer) { s.customName = ct; return; }
      if (taken[normalizeTeamKey(s.name)] && spare.length) s.name = spare.shift();
    });
  }
  var round1 = [];
  for (var i = 0; i < bracket.slots.length; i += 2) round1.push({ a: bracket.slots[i], b: bracket.slots[i + 1], winner: null });
  G.futdraft.tournament = { rounds: [round1], size: size };
  G.futdraft.champion = null;
  G.futdraft.eliminated = false;
  G.futdraft.winsCount = 0;
  G.futdraft.stats = { scorers: {}, assists: {} };
  G.screen = 'futdraftBracket';
  render();
};

function futDraftExpectedGoals(myAtk, oppDef) {
  return clamp(1.3 + (myAtk - oppDef) / 22, 0.2, 5);
}
// Goles con reparto de Poisson alrededor de lo esperado (el modelo de siempre
// en fútbol): cada punto de fuerza cuenta, hay empates como en la realidad
// (~26% entre iguales) y el débil puede dar la sorpresa de vez en cuando.
// Antes era expected + rand(-1.2, 1.2) con rand() entero: el azar iba a
// saltos y una diferencia de hasta ~9 puntos de fuerza no cambiaba nada.
function futDraftPoisson(lambda) {
  var L = Math.exp(-lambda), k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}
function futDraftRandomGoals(expected) {
  return clamp(futDraftPoisson(expected), 0, 8);
}
// Prórroga (30 min, minutos 91-120): un tercio de la duración de un
// partido completo, así que se prorratea la expectativa de gol a un
// tercio -- y con un rango más contenido, porque las prórrogas rara vez
// son goleadas.
function futDraftExtraTimeGoals(myAtk, oppDef) {
  var expected = futDraftExpectedGoals(myAtk, oppDef) / 3;
  return clamp(futDraftPoisson(expected), 0, 4);
}

// Los partidos de FutDraft no se juegan a golpes, pero se simula igualmente
// quién marca y quién da la asistencia en cada gol, tanto propio (tu
// plantel real) como rival (el pool de no drafteados, ver
// futDraftUndraftedPool) -- ponderado por puesto: un delantero marca mucho
// más que un defensa, un centrocampista asiste mucho más que nadie. El
// portero puede, rarísima vez, aparecer en cualquiera de los dos papeles
// (un gol o un pase muy largo y afortunado).
var FUTDRAFT_GOAL_WEIGHT = { Delantero: 6, Centrocampista: 3, Defensa: 1, Portero: 0.2 };
var FUTDRAFT_ASSIST_WEIGHT = { Centrocampista: 5, Delantero: 3, Defensa: 2, Portero: 0.3 };
function futDraftWeightedPick(players, weightMap) {
  var total = players.reduce(function (s, p) { return s + (weightMap[p.posicion] || 1); }, 0);
  var roll = Math.random() * total;
  for (var i = 0; i < players.length; i++) {
    roll -= (weightMap[players[i].posicion] || 1);
    if (roll <= 0) return players[i];
  }
  return players[players.length - 1];
}
function futDraftGoalEvent(myPlayers) {
  var scorer = futDraftWeightedPick(myPlayers, FUTDRAFT_GOAL_WEIGHT);
  var rest = myPlayers.filter(function (p) { return p.id !== scorer.id; });
  var assist = (rest.length && Math.random() < 0.75) ? futDraftWeightedPick(rest, FUTDRAFT_ASSIST_WEIGHT) : null;
  return { scorer: scorer, assist: assist };
}

// Jugadores reales del roster que NO se han drafteado en esta partida de
// FutDraft/Liga: sirven de plantel "fantasma" para el rival, que no tiene
// datos propios -- así sus goles y asistencias también se pueden atribuir
// a alguien con nombre real, en vez de quedar en blanco.
function futDraftUndraftedPool() {
  var f = G.futdraft;
  // Modo Carrera puede fijar f.oppGhostPool (careerTeamGhostPool) para
  // que el rival de Liga anote siempre con su MISMA plantilla fantasma
  // durante toda la temporada, en vez de un sorteo distinto entre todo
  // el roster cada vez -- así ese rival puede tener un máximo goleador
  // propio de verdad que le haga competencia al tuyo.
  if (f && f.oppGhostPool) return f.oppGhostPool;
  var squadIds = (f && f.squad ? f.squad : []).map(function (p) { return p.id; });
  return ROSTER.filter(function (p) { return squadIds.indexOf(p.id) === -1; });
}

// Construye la línea temporal entre minMinute y maxMinute (por defecto 1 a
// 90; la prórroga reutiliza esto mismo para 91-120): reparte tantos
// minutos distintos (sin repetir) como goles totales haya, los ordena, y
// decide al azar (barajando qué bando marca cada uno) quién anota en cada
// uno. Los goles propios usan tu plantel real; los del rival usan el pool
// de jugadores no drafteados (ver futDraftUndraftedPool) como plantel
// "fantasma", ya que el rival no tiene datos propios.
function futDraftBuildTimeline(myGoals, oppGoals, myPlayers, oppPlayers, minMinute, maxMinute) {
  minMinute = minMinute || 1;
  maxMinute = maxMinute || 90;
  var minutePool = [];
  for (var m = minMinute; m <= maxMinute; m++) minutePool.push(m);
  var shuffledMinutes = minutePool.sort(function () { return Math.random() - 0.5; }).slice(0, myGoals + oppGoals).sort(function (a, b) { return a - b; });
  var sides = [];
  for (var i = 0; i < myGoals; i++) sides.push('me');
  for (var j = 0; j < oppGoals; j++) sides.push('opp');
  sides = sides.sort(function () { return Math.random() - 0.5; });
  return shuffledMinutes.map(function (minute, idx) {
    var side = sides[idx];
    var ev = futDraftGoalEvent(side === 'me' ? myPlayers : oppPlayers);
    return { minute: minute, side: side, scorer: ev.scorer, assist: ev.assist };
  });
}

// Suma los goles/asistencias de una lista de eventos {scorer, assist} a un
// diccionario de estadísticas { scorers: {}, assists: {} }, etiquetados
// con el nombre del equipo al que pertenecían en ese partido concreto
// (informativo -- un jugador fantasma puede "jugar" para equipos
// distintos en partidos distintos, no se le fija ninguno).
function futDraftRecordGoalEvents(stats, events, teamLabel) {
  events.forEach(function (ev) {
    if (!ev.scorer) return;
    var sBucket = stats.scorers[ev.scorer.id] || { nombre: ev.scorer.nombre, team: teamLabel, count: 0, player: ev.scorer };
    sBucket.count++;
    sBucket.team = teamLabel;
    stats.scorers[ev.scorer.id] = sBucket;
    if (ev.assist && ev.assist.id !== ev.scorer.id) {
      var aBucket = stats.assists[ev.assist.id] || { nombre: ev.assist.nombre, team: teamLabel, count: 0, player: ev.assist };
      aBucket.count++;
      aBucket.team = teamLabel;
      stats.assists[ev.assist.id] = aBucket;
    }
  });
}

// El resultado (goles, timeline, clima) se calcula entero de golpe, pero
// se REVELA poco a poco -- ver renderFutDraftLive/futDraftLiveTick -- para
// que se sienta como un partido en marcha en vez de un número que aparece
// de la nada. Si acaba en empate, no se decide aquí: se pasa a una tanda
// de penaltis real al terminar los 90 minutos simulados.
// Núcleo de simulación compartido por el bracket de FutDraft y la Liga:
// calcula clima, ataque/defensa propios (con formación + capitán +
// sinergia ya incluidos vía futDraftTeamScore) y goles de los 90 minutos
// reglamentarios, con su línea temporal. No decide nada sobre el destino
// del partido (bracket vs liga, empate permitido o no) -- eso lo hace
// quien lo llama.
function futDraftModifierTypeFraction(lineup, tipo) {
  if (!lineup || !lineup.length) return 0;
  var n = 0;
  lineup.forEach(function (s) { if (s.player && s.player.tipo === tipo) n++; });
  return n / lineup.length;
}

// Multiplicadores del modificador que le haya tocado a ESTE partido
// (sorteado en futDraftRollMatchModifier a partir de f.condition -- ver
// FUTDRAFT_CONDITION_OPTIONS). bothMult toca ataque y defensa propios Y
// la fuerza del rival por igual (lluvia, cerrojo); los que favorecen un
// tipo elemental solo tocan a tu equipo, escalados por la fracción de tu
// once que sea de ese tipo (un once 100% de ese tipo llega a +50%,
// ninguno no da nada).
function futDraftModifierMultipliers(modifierId, lineup) {
  var mod = FUTDRAFT_MODIFIERS_BY_ID[modifierId] || FUTDRAFT_MODIFIERS_BY_ID.ninguno;
  var bothMult = mod.bothMult || 1;
  var myAtkMult = mod.myAtkMult || 1;
  var myDefMult = mod.myDefMult || 1;
  if (mod.favorType) {
    var bonus = 1 + futDraftModifierTypeFraction(lineup, mod.favorType) * 0.5;
    myAtkMult *= bonus;
    myDefMult *= bonus;
  }
  return { bothMult: bothMult, myAtkMult: myAtkMult, myDefMult: myDefMult };
}

function futDraftSimulateMatchCore(oppPower) {
  var f = G.futdraft;
  var formation = FUTDRAFT_FORMATIONS.find(function (ft) { return ft.id === f.formation; });
  // Modo Carrera pasa su propia puntuación (con la progresión de los jugadores)
  // en teamScoreOverride; el resto de modos usan las stats del roster de siempre.
  var score = typeof f.teamScoreOverride === 'number' ? f.teamScoreOverride : futDraftTeamScore(f.lineup, f.captainId);
  var modifier = futDraftRollMatchModifier(f.condition);
  var mods = futDraftModifierMultipliers(modifier, f.lineup);
  // f.styleAtkMult/f.styleDefMult: solo Modo Carrera los pone (estilo de
  // juego de Gestionar plantilla, ver careerPlayStyleModifiers) --
  // undefined en cualquier otro modo, así que por defecto no cambian nada.
  var styleAtkMult = typeof f.styleAtkMult === 'number' ? f.styleAtkMult : 1;
  var styleDefMult = typeof f.styleDefMult === 'number' ? f.styleDefMult : 1;
  var myAtk = score * formation.atk * mods.bothMult * mods.myAtkMult * styleAtkMult;
  var myDef = score * formation.def * mods.bothMult * mods.myDefMult * styleDefMult;
  // Táctica elegida fuera de Carrera (f.tactics): el estilo de juego solo
  // cuenta si el modo no puso ya el suyo (styleAtkMult, Carrera y Mundial).
  if (f.tactics) {
    var tacMods = futDraftTacticsMods(f.tactics, typeof f.styleAtkMult !== 'number');
    myAtk *= tacMods.atk;
    myDef *= tacMods.def;
  }
  // Entrenador (f.coach, ver COACHES/coachEffect): puntos de ataque y defensa
  // más los multiplicadores de su intensidad y estilo.
  if (f.coach) {
    var coachFx = coachEffect(f.coach, f.coachChosenStyle || (f.tactics && f.tactics.style) || null);
    myAtk = myAtk * coachFx.atkMult + coachFx.atkPts;
    myDef = myDef * coachFx.defMult + coachFx.defPts;
  }
  var effectiveOppPower = oppPower * mods.bothMult;
  var myGoals = futDraftRandomGoals(futDraftExpectedGoals(myAtk, effectiveOppPower));
  var oppGoals = futDraftRandomGoals(futDraftExpectedGoals(effectiveOppPower, myDef));
  var myPlayers = f.lineup.map(function (s) { return s.player; });
  // BUG REAL arreglado: el Modo Mundial sacaba los goleadores rivales de
  // un pool genérico de "no drafteados" de TODO el roster, así que un gol
  // del Occult podía salir de cualquiera, no de sus propios jugadores
  // reales (Talismán, Wolf...) -- a petición explícita. f.oppPlayersOverride
  // lo pone worldTourBridgeFutdraft con el once real de la etapa (sin
  // porteros, también a petición explícita) cuando lo hay.
  var oppPlayers = f.oppPlayersOverride || futDraftUndraftedPool();
  var timeline = futDraftBuildTimeline(myGoals, oppGoals, myPlayers, oppPlayers);
  return { myGoals: myGoals, oppGoals: oppGoals, modifier: modifier, timeline: timeline, myAtk: myAtk, myDef: myDef, effectiveOppPower: effectiveOppPower };
}

// visualMode 'dots': Ver partido en el campo, con el motor en tiempo
// real, a petición explícita ("mete lo de ver partido también en el modo
// FutDraft"). Sin nada, la simulación minuto a minuto de siempre.
window.playFutDraftMatch = function (visualMode) {
  var f = G.futdraft;
  var round = f.tournament.rounds[f.tournament.rounds.length - 1];
  var match = round.filter(function (m) { return (m.a.isPlayer || m.b.isPlayer) && m.winner === null; })[0];
  var oppSide = match.a.isPlayer ? match.b : match.a;
  var sim = futDraftSimulateMatchCore(teamPower(oppSide));

  f.live = {
    match: match, oppSide: oppSide, modifier: sim.modifier,
    minute: 0, pending: sim.timeline.slice(), revealed: [],
    myGoals: 0, oppGoals: 0, finalMyGoals: sim.myGoals, finalOppGoals: sim.oppGoals,
    // Se guardan para poder generar la prórroga más tarde sin recalcular
    // nada (mismo ataque/defensa/clima que ya se usaron en el 1-90).
    myAtk: sim.myAtk, myDef: sim.myDef, effectiveOppPower: sim.effectiveOppPower,
    inExtraTime: false, allowDraw: false, onFinish: finishFutDraftRegularTime,
    visualMode: visualMode === 'dots' ? 'dots' : 'avatars',
    done: false
  };
  if (f.customTeam) {
    // Torneo a medida: tu nombre y escudo, y el rival con su once real.
    f.live.youName = f.customTeam;
    f.live.youShield = f.customShield;
    var oppXi = qmTeamEleven(oppSide.name, f.lineup.map(function (s) { return s.player.id; }));
    f.oppGhostPool = oppXi;
    f.live.oppFormation = { id: 'real', rows: qmRowsOf(oppXi) };
  }
  G.screen = 'futdraftLive';
  if (typeof playKickoffSound === 'function') playKickoffSound();
  render();
  futDraftLiveTick();
};

// Se llama una sola vez, justo cuando el marcador sigue empatado al llegar
// al 90': genera los goles y la mini-timeline de la prórroga (91-120) y
// los añade a la simulación en curso para que el mismo ciclo de
// futDraftLiveTick los revele igual que los del tiempo reglamentario.
// ¿Toca prórroga? Empate al final del tiempo reglamentario en un partido
// que no admite empate. live.aggBase: goles de la ida en una vuelta de
// eliminatoria (Champions, Supercopa), para mirar el global y no solo
// este partido.
function futDraftLiveNeedsExtraTime(live) {
  if (live.inExtraTime || live.allowDraw || live.noExtraTime) return false;
  var base = live.aggBase || { my: 0, opp: 0 };
  return live.myGoals + base.my === live.oppGoals + base.opp;
}
function futDraftAddExtraTime(live, myPlayers) {
  // Tú decides: sin guion, los goles de la prórroga salen de lo que juegues.
  if (live.decide) { live.inExtraTime = true; live.added = 0; return; }
  var etMyGoals = futDraftExtraTimeGoals(live.myAtk, live.effectiveOppPower);
  var etOppGoals = futDraftExtraTimeGoals(live.effectiveOppPower, live.myDef);
  // Goleadores rivales de la prórroga: su propia plantilla si la hay
  // (Carrera, Historia, FutDraft de 2), no cualquiera del roster.
  var fd = G.futdraft || {};
  var oppPool = (fd.oppPlayersOverride && fd.oppPlayersOverride.length) ? fd.oppPlayersOverride : ((fd.oppGhostPool && fd.oppGhostPool.length) ? fd.oppGhostPool : futDraftUndraftedPool());
  var etTimeline = futDraftBuildTimeline(etMyGoals, etOppGoals, myPlayers, oppPool, 91, 120);
  live.pending = live.pending.concat(etTimeline);
  live.finalMyGoals += etMyGoals;
  live.finalOppGoals += etOppGoals;
  live.inExtraTime = true;
  live.added = 0;
}

// Resuelve lo que pasa una vez terminados los 90 minutos simulados (llega
// aquí tanto si se ha visto la simulación entera como si se ha saltado):
// empate real -> tanda de penaltis; si no, guarda el resultado y va a la
// pantalla de resultado de siempre.
function finishFutDraftRegularTime() {
  var f = G.futdraft;
  var live = f.live;
  var match = live.match, oppSide = live.oppSide;
  var myGoals = live.finalMyGoals, oppGoals = live.finalOppGoals;
  var oppPower = teamPower(oppSide);
  var timeline = live.revealed;
  if (f.customTeam) f.oppGhostPool = null;
  f.pendingDecide = !!live.decide;
  var modifier = live.modifier;
  f.live = null;
  futDraftRecordGoalEvents(f.stats, timeline.filter(function (e) { return e.side === 'me'; }), 'Tu equipo');
  futDraftRecordGoalEvents(f.stats, timeline.filter(function (e) { return e.side === 'opp'; }), oppSide.name);
  if (myGoals === oppGoals) {
    f.pendingMatch = match;
    f.pendingOppSide = oppSide;
    f.pendingRegularResult = { myGoals: myGoals, oppGoals: oppGoals, oppPower: oppPower, timeline: timeline, modifier: modifier };
    startFutDraftPenaltyShootout(oppSide);
    return;
  }
  var playerWon = myGoals > oppGoals;
  match.winner = playerWon ? (match.a.isPlayer ? match.a : match.b) : (match.a.isPlayer ? match.b : match.a);
  if (playerWon) f.winsCount++;
  f.lastMatchResult = { oppName: oppSide.name, oppShield: teamShieldPath(oppSide.name), oppPower: oppPower, myGoals: myGoals, oppGoals: oppGoals, playerWon: playerWon, timeline: timeline, modifier: modifier, youName: f.customTeam || null, youShield: f.customShield || null };
  G.screen = 'futdraftMatchResult';
  render();
}

// Avanza la simulación un puñado de minutos (3 a 7) cada 150ms y va
// revelando los goles cuyo minuto ya se ha alcanzado. Se reprograma solo
// mientras sigamos en la pantalla 'futdraftLive' con esta misma
// simulación activa -- así, si el jugador navega a otro sitio (o salta la
// simulación), la cadena se para sola en vez de seguir mutando estado en
// segundo plano.
// Simulación visual de posesión/pases para el modo "Jugar" (puntitos):
// un paseo aleatorio entre las 4 líneas de un equipo (0=portero...
// 3=delantera) que a veces pierde el balón hacia el otro equipo -- solo
// estético (no cambia el resultado, que ya sale de futDraftBuildTimeline),
// pero da tiempo a ver "pases" antes del siguiente gol, a petición
// explícita ("el partido tiene que ir más lento, para que dé tiempo a
// verse pases y ocasiones").
var FUTDRAFT_LINE_POS = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];
// Jugador "dueño" del balón ahora mismo -- de tu once real si es tu
// posesión, o un nombre genérico del rival (no hay plantilla rival real
// fuera de World Tour) si es la suya. Usado para las tarjetas/lesiones Y
// (en modo puntitos) para decidir quién marca de verdad -- nunca un
// jugador ya expulsado (live.sentOff), a petición explícita ("el jugador
// [con roja] ya no puede meter gol porque no está jugando").
function futDraftBallCarrierPlayer(live, poss) {
  if (poss.side !== 'me') {
    // Nombre real del rival cuando hay plantilla real de verdad (Modo
    // Mundial: oppPlayersOverride, ver worldTourBridgeFutdraft; Modo
    // Carrera: oppGhostPool, la plantilla fantasma fija de la temporada)
    // en vez de "Un jugador del Occult" siempre genérico -- a petición
    // explícita (tras preguntar "por qué sale esto... pon jugadores").
    var oppPool = (G.futdraft && (G.futdraft.oppPlayersOverride || G.futdraft.oppGhostPool)) || null;
    if (oppPool && oppPool.length) {
      var oppSentOff = live.sentOffOpp || [];
      if (oppSentOff.length) oppPool = oppPool.filter(function (pl) { return oppSentOff.indexOf(pl.id) === -1; });
      if (!oppPool.length) oppPool = (G.futdraft.oppPlayersOverride || G.futdraft.oppGhostPool);
      var oppPos = FUTDRAFT_LINE_POS[poss.line];
      var oppCandidates = oppPool.filter(function (pl) { return pl.posicion === oppPos; });
      var oppPick = (oppCandidates.length ? oppCandidates : oppPool)[Math.floor(Math.random() * (oppCandidates.length ? oppCandidates.length : oppPool.length))];
      if (oppPick) return oppPick;
    }
    return { nombre: 'Un jugador del ' + (live.oppSide ? live.oppSide.name : 'rival') };
  }
  var lineup = (G.career && live.isCareer) ? G.career.lineup : G.futdraft.lineup;
  if (!lineup) return null;
  var sentOff = live.sentOff || [];
  var onPitch = sentOff.length ? lineup.filter(function (s) { return sentOff.indexOf(s.player.id) === -1; }) : lineup;
  if (!onPitch.length) onPitch = lineup;
  var pos = FUTDRAFT_LINE_POS[poss.line];
  var candidates = onPitch.filter(function (s) { return s.pos === pos; });
  var pick = (candidates.length ? candidates : onPitch)[Math.floor(Math.random() * (candidates.length ? candidates.length : onPitch.length))];
  return pick ? pick.player : null;
}
// "Ver partido" (puntitos) va por su propio bucle en tiempo real (ver
// js/match-engine.js); aquí solo queda el minuto a minuto de "Simular".
function futDraftLiveTick() {
  if (G.screen !== 'futdraftLive' || !G.futdraft || !G.futdraft.live || G.futdraft.live.done) return;
  var live = G.futdraft.live;
  // Decidir (tarjeta de la previa en cualquier modo, ver decideConvertLive).
  if (G.decideNext && !live.decide && live.minute === 0) { G.decideNext = false; decideConvertLive(live); render(); }
  if (G.dotsNext && live.minute === 0) { G.dotsNext = false; if (live.visualMode !== 'dots') { live.visualMode = 'dots'; render(); } }
  if (live.visualMode === 'dots') { futDraftRtStart(live); return; }
  var cap = live.inExtraTime ? 120 : 90;
  // Descuento de 1 a 5 minutos en cada parte, igual que en Ver partido
  // (mrStoppage/mrPlusNow en match-engine.js): el minuto se queda en 45 o
  // 90 y avanza el añadido de uno en uno.
  var halfEnd = (!live.inExtraTime && !live.halfTimeShown) ? 45 : cap;
  if (live.minute >= halfEnd && !live.inExtraTime && (live.added || 0) < mrStoppage(live)) {
    live.added = (live.added || 0) + 1;
    futDraftLiveRefresh(live);
    setTimeout(futDraftLiveTick, 150);
    return;
  }
  if (halfEnd === 45 && live.minute >= 45) { live.halfTimeShown = true; live.added = 0; halfEnd = cap; }
  live.minute = Math.min(halfEnd, live.minute + rand(3, 7));
  while (live.pending.length && live.pending[0].minute <= live.minute) {
    var pev = live.pending.shift();
    if (pev.side === 'me') live.myGoals++; else live.oppGoals++;
    live.revealed.push(pev);
    live.lastGoalSide = pev.side;
    live.goalSeq = (live.goalSeq || 0) + 1;
    if (typeof playGoalSound === 'function') playGoalSound();
  }
  futDraftLiveRefresh(live);
  if (live.minute >= cap && (live.inExtraTime || (live.added || 0) >= mrStoppage(live))) {
    // En la Liga el empate es un resultado válido (allowDraw): no hay
    // prórroga ni penaltis, se queda como está y suma su punto a cada uno.
    if (futDraftLiveNeedsExtraTime(live)) {
      var myPlayers = G.futdraft.lineup.map(function (s) { return s.player; });
      futDraftAddExtraTime(live, myPlayers);
      setTimeout(futDraftLiveTick, 400);
      return;
    }
    live.done = true;
    G.futdraft.lastLiveStats = null;
    setTimeout(live.onFinish, 500);
  } else {
    setTimeout(futDraftLiveTick, 150);
  }
}

// Salta directamente al final: revela todos los goles pendientes de golpe
// (generando también la prórroga si sigue habiendo empate al 90' y no se
// permite empate, ver allowDraw) y resuelve el partido sin esperar a que
// el temporizador llegue solo.
window.futDraftSkipLive = function () {
  var live = G.futdraft.live;
  if (!live || live.done) return;
  if (live.pen) { mrPenFinishNow(live); return; }
  live.skipped = true;
  function dumpPending() {
    live.pending.forEach(function (ev) {
      if (ev.side === 'me') live.myGoals++; else live.oppGoals++;
      live.revealed.push(ev);
    });
    live.pending = [];
  }
  dumpPending();
  live.minute = live.halfLen ? live.halfLen * 2 : 90;
  if (futDraftLiveNeedsExtraTime(live)) {
    var myPlayers = G.futdraft.lineup.map(function (s) { return s.player; });
    futDraftAddExtraTime(live, myPlayers);
    dumpPending();
    live.minute = 120;
  }
  live.done = true;
  G.futdraft.lastLiveStats = live.visualMode === 'dots' ? { cards: live.cards || [], poss_ticks: live.poss_ticks || { me: 0, opp: 0 } } : null;
  live.onFinish();
};

// Fila de la línea temporal para un gol: el nombre real de quien marca
// (tuyo o del pool fantasma del rival) y su asistencia si la hubo. En los
// goles rivales se añade el nombre del equipo entre paréntesis, porque el
// nombre del jugador fantasma no dice por sí solo para quién "juega".
function futDraftTimelineRowHtml(ev, oppName, youShield, youAreHome) {
  var isOpp = ev.side !== 'me';
  var shieldSrc = isOpp ? teamShieldPath(oppName) : (youShield || getPlayerShieldPath());
  var text = '<strong>' + escapeHtml(ev.scorer.nombre) + '</strong>' +
    (ev.assist && !(ev.scorer && ev.scorer.id === ev.assist.id) ? ' <span class="dim">(asist. ' + escapeHtml(ev.assist.nombre) + ')</span>' : ' <span class="dim">(gol en solitario)</span>');
  if (isOpp) text += ' <span class="dim">· ' + escapeHtml(oppName) + '</span>';
  // BUG REAL arreglado: el gol se pintaba en espejo (a la derecha) solo
  // según si era del rival, SIN mirar si el marcador de arriba te ponía a
  // TI a la derecha (cuando juegas fuera de casa) -- así, de visitante,
  // tus propios goles salían pegados a la izquierda igual que si fueras
  // local, chocando con el marcador ("aunque soy visitante, los goles
  // salen a la izquierda"). Ahora el lado espejo es el que NO aparece a
  // la izquierda del marcador de verdad (el equipo local, youAreHome).
  var mirror = youAreHome === false ? !isOpp : isOpp;
  var rowClass = 'futdraft-timeline-row' + (mirror ? ' futdraft-timeline-row-opp' : '');
  return '<div class="' + rowClass + '"><span class="futdraft-timeline-minute">' + ev.minute + (ev.plus ? '+' + ev.plus : '') + '\'</span><img class="futdraft-timeline-shield" src="' + escapeHtml(shieldSrc) + '" alt="">' + avatarHtml(ev.scorer) + '<span>' + text + '</span></div>';
}

// Escudo/nombre propios durante el partido: los de Modo Carrera o Modo
// Mundial si vienen de ahí (careerClubShieldPath/worldTourShieldPath), no
// el equipado en la config general de la web -- compartido entre el
// marcador en vivo (renderFutDraftLive) y el resumen de goles (antes cada
// uno lo calculaba por su cuenta, y el resumen se quedaba sin pasarlo,
// bug real: "los goles que voy anotando, salen como si los hubiera
// metido con otro escudo").
function futDraftYouIdentity(live) {
  if (live.youName) return { shield: live.youShield, name: live.youName };
  var isCareer = live.isCareer && G.career;
  var isWorldTour = live.isWorldTour && G.worldTour;
  return {
    shield: isCareer ? careerClubShieldPath(G.career) : isWorldTour ? worldTourShieldPath() : getPlayerShieldPath(),
    name: isCareer ? careerClubDisplayName(G.career) : isWorldTour ? G.worldTour.teamName : 'Tú'
  };
}
// Texto del indicador de minuto y filas del resumen, compartidos entre el
// pintado completo y la actualización en sitio (futDraftLiveRefresh).
function futDraftLiveIndicatorText(live) {
  if (live.pen) return 'Penaltis';
  // live.minute es un número con decimales por dentro (avanza en
  // fracciones cada tick, ver futDraftLiveTick), pero en pantalla tiene
  // que verse un minuto entero de toda la vida (1, 2, 3...), no "19.8888"
  // -- a petición explícita.
  var m = Math.floor(live.minute);
  // Descuento: "Minuto 45+2'" mientras corre el añadido de cada parte.
  var plus = typeof mrPlusNow === 'function' && live.added > 0 ? mrPlusNow(live) : 0;
  var mm = m + (plus ? '+' + plus : '');
  if (live.halfLen) return 'Minuto ' + mm + '\' de ' + (live.halfLen * 2) + '\'' + (live.firstTo ? ' · a ' + live.firstTo + ' goles' : '');
  return live.inExtraTime ? 'Prórroga — minuto ' + mm + '\' de 120\'' : 'Minuto ' + mm + '\' de 90\'';
}
function futDraftLiveLogHtml(live) {
  var oppName = live.oppSide.name;
  var you = futDraftYouIdentity(live);
  var youAreHome = live.youAreHome !== false;
  return live.revealed.slice().reverse().map(function (ev) {
    return futDraftTimelineRowHtml(ev, oppName, you.shield, youAreHome);
  }).join('');
}
// Cada tick del partido en vivo (cada ~150 ms) antes repintaba TODA la
// pantalla con render(), y al recrear todos los escudos y avatares se veía
// un parpadeo constante ("que no parpadee al simular partido"). Ahora solo
// se cambian in situ el marcador, el minuto y la lista de goles; render()
// completo solo si cambia la estructura (empieza la prórroga) o si la
// pantalla aún no está pintada.
// Mini campo con puntitos numerados por su posición en el once (no hay
// dorsal real en los datos, así que se numeran 1-11 por equipo en el
// orden de la formación) más un balón que se desplaza hacia la portería
// que acaba de recibir el gol -- a petición explícita ("no quiero que
// enseñes los personajes, quiero que enseñes puntitos con los dorsales...
// y también el balón"). Solo para live.visualMode === 'dots'.
// Un color sólido por EQUIPO (no por posición): a petición explícita
// ("que haya un equipo de un color los 11 puntos y el otro de otro
// color"), para distinguir de un vistazo quién es quién sin tener que
// fijarse en el número.
var PITCH_DOT_TEAM_COLORS = { me: ['#4ecdc4', '#1f8f86'], opp: ['#ff6b7a', '#c92c48'] };
// Icono de tarjeta/lesión sobre el puntito, un momento (live.cardFlash),
// a petición explícita ("indicador de tarjeta amarilla/roja en el
// momento"). El propio atributo data-card se pinta con CSS (content:
// attr(data-card)), así que el refresco en vivo solo tiene que tocar el
// atributo (ver futDraftRtDraw) sin reconstruir el puntito entero.
function pitchDotCardIcon(live, side, d) {
  var cf = live.cardFlash;
  if (!cf || cf.side !== side || d.num !== cf.num || Date.now() >= cf.until) return '';
  return cf.icon;
}
function pitchDotHtml(d, side, live) {
  var pal = PITCH_DOT_TEAM_COLORS[side];
  var posStyle = 'left:' + d.x.toFixed(1) + '%;top:' + d.y.toFixed(1) + '%';
  // Tu equipo se ve con la cara real del jugador (avatarHtml, con sus
  // iniciales de respaldo si no tiene sprite, igual que en el resto de
  // pantallas) -- a petición explícita. El rival no tiene jugadores
  // individuales asignados (solo cuenta por línea), así que se queda
  // como puntito de color liso.
  var offCls = d.off ? ' pitch-dot-off' : '';
  var cardAttr = ' data-card="' + escapeHtml(live ? pitchDotCardIcon(live, side, d) : '') + '"';
  // Todos con su foto (también el rival, a petición explícita); el aro
  // azul o rojo (.pitch-dot-me / .pitch-dot-opp) dice de qué equipo es.
  if (d.player) {
    return '<div class="pitch-dot pitch-dot-face pitch-dot-' + side + (d.active ? ' pitch-dot-active' : '') + offCls + '" data-dot="' + side + d.num + '"' + cardAttr + ' style="' + posStyle + '">' + avatarHtml(d.player) + '</div>';
  }
  var style = posStyle + ';background:radial-gradient(circle at 35% 28%,' + pal[0] + ',' + pal[1] + ')';
  return '<div class="pitch-dot pitch-dot-' + side + (d.active ? ' pitch-dot-active' : '') + offCls + '" data-dot="' + side + d.num + '"' + cardAttr + ' style="' + style + '"><span>' + d.num + '</span></div>';
}
// Resumen debajo del campo: posesión (real, según qué equipo ha tenido
// el balón más ticks) y tarjetas/lesiones ocurridas -- a petición
// explícita ("haz que en el resumen de partido abajo, haya tarjetas, y
// posesión, mete eso").
function futDraftMatchStatsHtml(live) {
  if (!live) return '';
  // Solo se refresca cada 5 minutos de partido (live.possBarPct, puesto
  // en futDraftAdvancePossession) -- a petición explícita ("no que salga
  // una posesión con anillo en el balón... cada 5 minutos se vaya
  // actualizando la barra").
  var myPct = typeof live.possBarPct === 'number' ? live.possBarPct : 50;
  var cardsHtml = (live.cards || []).slice().reverse().map(function (c) {
    var icon = c.type === 'red' ? '🟥' : c.type === 'yellow' ? '🟨' : '🩹';
    var label = c.type === 'red' ? 'roja' : c.type === 'yellow' ? 'amarilla' : 'se resiente';
    return '<div class="futdraft-timeline-row' + (c.side === 'opp' ? ' futdraft-timeline-row-opp' : '') + '"><span class="futdraft-timeline-minute">' + c.minute + (c.plus ? '+' + c.plus : '') + '\'</span><span>' + icon + ' ' + escapeHtml(c.name) + ' — ' + label + '</span></div>';
  }).join('');
  return '<div class="panel">' +
    '<h3 style="margin-bottom:8px">Posesión</h3>' +
    '<div class="poss-bar">' +
      '<div class="poss-bar-fill poss-bar-fill-me" style="width:' + myPct + '%">' + (myPct >= 14 ? myPct + '%' : '') + '</div>' +
      '<div class="poss-bar-fill poss-bar-fill-opp" style="width:' + (100 - myPct) + '%">' + (100 - myPct >= 14 ? (100 - myPct) + '%' : '') + '</div>' +
    '</div>' +
    (cardsHtml ? '<h3 style="margin:12px 0 6px">Incidencias</h3><div class="futdraft-timeline">' + cardsHtml + '</div>' : '') +
  '</div>';
}
// Tarjeta de descanso al llegar al 45' (live.halfTimeUntil, ver
// futDraftLiveTick), con el marcador y cómo va el partido hasta ahora --
// a petición explícita ("haz que haya un descanso en el 45 donde de info
// de como va el partido").
function futDraftHalfTimeHtml(live) {
  var you = futDraftYouIdentity(live);
  var oppName = live.oppSide.name;
  var youAreHome = live.youAreHome !== false;
  var shown = { my: live.myGoals, opp: live.oppGoals };
  var myPct = typeof live.possBarPct === 'number' ? live.possBarPct : 50;
  var t = live.cards || [];
  var yellows = t.filter(function (c) { return c.type === 'yellow'; }).length;
  var reds = t.filter(function (c) { return c.type === 'red'; }).length;
  var injuries = t.filter(function (c) { return c.type === 'injury'; }).length;
  var incidentsLine = (yellows || reds || injuries)
    ? [yellows ? yellows + ' 🟨' : '', reds ? reds + ' 🟥' : '', injuries ? injuries + ' 🩹' : ''].filter(Boolean).join(' · ')
    : 'Sin incidencias';
  return '<div class="pitch-halftime-card">' +
    '<div class="pitch-halftime-title">Descanso</div>' +
    // Local a la izquierda, igual que el marcador de arriba: si juegas
    // fuera, primero el escudo y los goles del rival (antes los escudos
    // no se giraban y no cuadraban con el resultado).
    '<div class="pitch-halftime-score">' +
      '<img src="' + escapeHtml(youAreHome ? you.shield : teamShieldPath(oppName)) + '" alt="">' +
      '<span>' + (youAreHome ? shown.my + ' - ' + shown.opp : shown.opp + ' - ' + shown.my) + '</span>' +
      '<img src="' + escapeHtml(youAreHome ? teamShieldPath(oppName) : you.shield) + '" alt="">' +
    '</div>' +
    '<div class="pitch-halftime-row">Posesión: ' + (youAreHome ? myPct + '% - ' + (100 - myPct) : (100 - myPct) + '% - ' + myPct) + '%</div>' +
    '<div class="pitch-halftime-row">' + escapeHtml(incidentsLine) + '</div>' +
  '</div>';
}
// Expandir el campo de puntitos a pantalla completa, a petición explícita
// ("el campo cambialo a esto" con el icono de expandir de la referencia).
// No usa la Fullscreen API del navegador (poco fiable en Safari de
// iPhone para un div cualquiera, según ya se comprobó en este proyecto):
// en vez de eso, el campo pasa a position:fixed cubriendo la pantalla por
// CSS -- funciona igual en cualquier navegador, incluido iOS.
// Sacar el campo a document.body mientras está expandido (y devolverlo a
// su sitio al cerrar): position:fixed se calcula relativo al antepasado
// más cercano con transform/filter, no siempre al viewport -- como el
// campo vive dentro de paneles con su propia animación de entrada, se
// quedaba encajonado detrás de los paneles de abajo en vez de cubrir
// toda la pantalla. Sacándolo del todo a <body> se evita el problema
// pase lo que pase con sus antepasados.
// _dotsExpanded persiste el estado (no solo la clase CSS) porque un gol
// dispara un render() completo que crea un campo NUEVO dentro del panel
// de siempre -- sin recordar "estaba expandido" en una variable aparte,
// ese gol te sacaba de pantalla completa de golpe justo en el mejor
// momento, a petición explícita ("cuando pongo pantalla grande y hay
// gol, se sale de la pantalla grande").
var _dotsExpanded = false;
var _dotsFieldHome = null;
window.actionToggleDotsFullscreen = function (ev) {
  if (ev) ev.stopPropagation();
  futDraftApplyDotsExpand(!_dotsExpanded);
};
function futDraftApplyDotsExpand(expand) {
  _dotsExpanded = expand;
  var field = document.querySelector('.pitch-dots-field-h');
  if (!field) return;
  var btn = field.querySelector('.pitch-fullscreen-btn');
  if (expand) {
    if (field.parentNode !== document.body) {
      _dotsFieldHome = { parent: field.parentNode, next: field.nextSibling };
      document.body.appendChild(field);
    }
    field.classList.add('pitch-expanded');
    if (btn) { btn.textContent = '✕'; btn.setAttribute('aria-label', 'Salir de pantalla completa'); }
    document.body.classList.add('pitch-expanded-lock');
  } else {
    field.classList.remove('pitch-expanded');
    if (field.parentNode === document.body && _dotsFieldHome) { _dotsFieldHome.parent.insertBefore(field, _dotsFieldHome.next); }
    _dotsFieldHome = null;
    if (btn) { btn.textContent = '⛶'; btn.setAttribute('aria-label', 'Pantalla completa'); }
    document.body.classList.remove('pitch-expanded-lock');
  }
}
// Llamado desde render() (state-nav.js) justo después de reconstruir
// #app: limpia cualquier campo huérfano que se quedara en <body> de un
// render anterior y, si seguía expandido, vuelve a expandir el campo
// recién pintado (que empieza siempre sin expandir, dentro de su panel).
function futDraftSyncDotsExpandAfterRender() {
  var orphan = document.body.querySelector(':scope > .pitch-dots-field-h.pitch-expanded');
  if (orphan) orphan.remove();
  var stillLive = G.screen === 'futdraftLive' && G.futdraft && G.futdraft.live && G.futdraft.live.visualMode === 'dots';
  if (_dotsExpanded && stillLive) futDraftApplyDotsExpand(true);
  else { _dotsExpanded = false; document.body.classList.remove('pitch-expanded-lock'); }
}
function futDraftPitchDotsHtml(live) {
  mrInit(live);
  // Nombre y escudo de verdad en vez de "Tu equipo"/"Rival" fijos -- a
  // petición explícita ("pon Raimon si has elegido raimon... y pon el
  // del rival, si estoy jugando contra el occult, pon occult").
  var isCareerDots = live.isCareer && G.career;
  var isWorldTourDots = live.isWorldTour && G.worldTour;
  var oppName = live.oppSide.name;
  var youName = isCareerDots ? careerClubDisplayName(G.career) : isWorldTourDots ? G.worldTour.teamName : 'Tú';
  var youShield = isCareerDots ? careerClubShieldPath(G.career) : isWorldTourDots ? worldTourShieldPath() : getPlayerShieldPath();
  if (live.youName) { youName = live.youName; youShield = live.youShield; }
  var oppShield = teamShieldPath(oppName);
  var flip = mrFlip(live);
  var ball = live.mr.ball;
  var owner = ball.mode === 'owned' ? ball.owner : null;
  // Posiciones internas en metros (ver js/match-engine.js), pasadas a %.
  function onScreen(d, side) {
    var p = mrToPct(d.x, d.y);
    return Object.assign({}, d, { x: flip ? 100 - p.l : p.l, y: p.t, active: !!(owner && owner.side === side && owner.num === d.num) });
  }
  var dotsHtml = live.dotsState.me.map(function (d) { return pitchDotHtml(onScreen(d, 'me'), 'me', live); }).join('') + live.dotsState.opp.map(function (d) { return pitchDotHtml(onScreen(d, 'opp'), 'opp', live); }).join('');
  var bp = mrToPct(ball.x, ball.y);
  var ballX = flip ? 100 - bp.l : bp.l, ballY = bp.t;
  return '<div class="pitch pitch-dots-field pitch-dots-field-h' + (live.small4 ? ' pitch-small' : '') + '" data-phase="' + live.phase + '">' +
    '<div class="pitch-topbar">' +
      '<button class="pitch-fullscreen-btn" onclick="actionToggleDotsFullscreen(event)" aria-label="Pantalla completa">⛶</button>' +
      '<div class="pitch-minute-chip">' + futDraftLiveIndicatorText(live) + '</div>' +
      '<button class="pitch-speed-btn' + ((G.matchSpeed || 1) > 1 ? ' on' : '') + '" onclick="actionToggleMatchSpeed(event)" aria-label="Velocidad del partido">x' + (G.matchSpeed || 1) + '</button>' +
    '</div>' +
    '<div class="pitch-dots-field-stripes pitch-dots-field-stripes-h"></div>' +
    '<div class="pitch-crowd pitch-crowd-left"></div><div class="pitch-crowd pitch-crowd-right"></div>' +
    '<div class="pitch-goal pitch-goal-left"><div class="pitch-net"></div></div><div class="pitch-goal pitch-goal-right"><div class="pitch-net"></div></div>' +
    (live.youAreHome === false
      ? '<div class="pitch-side-label pitch-side-label-left"><img src="' + escapeHtml(oppShield) + '" alt=""><span>' + escapeHtml(oppName) + '</span></div>' +
        '<div class="pitch-side-label pitch-side-label-right"><span>' + escapeHtml(youName) + '</span><img src="' + escapeHtml(youShield) + '" alt=""></div>'
      : '<div class="pitch-side-label pitch-side-label-left"><img src="' + escapeHtml(youShield) + '" alt=""><span>' + escapeHtml(youName) + '</span></div>' +
        '<div class="pitch-side-label pitch-side-label-right"><span>' + escapeHtml(oppName) + '</span><img src="' + escapeHtml(oppShield) + '" alt=""></div>') +
    '<div class="pitch-center-line pitch-center-line-h"></div><div class="pitch-center-circle"></div><div class="pitch-center-dot"></div>' +
    '<div class="pitch-box pitch-box-left"></div><div class="pitch-box pitch-box-right"></div>' +
    '<div class="pitch-corner pitch-corner-tl"></div><div class="pitch-corner pitch-corner-bl"></div><div class="pitch-corner pitch-corner-tr"></div><div class="pitch-corner pitch-corner-br"></div>' +
    dotsHtml +
    '<div class="pitch-ball-wrap" style="left:' + ballX.toFixed(1) + '%;top:' + ballY.toFixed(1) + '%">' +
      '<div class="pitch-ball" style="left:0;top:0"><span class="pitch-ball-shadow"></span>⚽</div>' +
    '</div>' +
    '<div class="pitch-overlay">' + mrOverlayHtml(live) + '</div>' +
  '</div>';
}
function futDraftGoalFx(live) {
  var prev = live._fxMy === undefined ? 0 : live._fxMy;
  if (live.myGoals > prev && typeof fxGoalFlash === 'function') fxGoalFlash();
  live._fxMy = live.myGoals;
}
function futDraftLiveRefresh(live) {
  futDraftGoalFx(live);
  if (live.visualMode === 'dots') { futDraftRtDraw(live); return; }
  var root = document.querySelector('.screen[data-live]');
  var nums = root ? root.querySelectorAll('.score-num') : [];
  var indicator = root ? root.querySelector('.turn-indicator') : null;
  var timeline = root ? root.querySelector('.futdraft-timeline') : null;
  var note = String(!!(live.inExtraTime && live.minute <= 91));
  if (!root || nums.length < 2 || !indicator || !timeline || root.getAttribute('data-extra') !== String(!!live.inExtraTime) || root.getAttribute('data-note') !== note) { render(); return; }
  var youAreHome = live.youAreHome !== false;
  setScoreNum(nums[0], youAreHome ? live.myGoals : live.oppGoals);
  setScoreNum(nums[1], youAreHome ? live.oppGoals : live.myGoals);
  indicator.textContent = futDraftLiveIndicatorText(live);
  if (timeline.getAttribute('data-count') !== String(live.revealed.length)) {
    timeline.innerHTML = futDraftLiveLogHtml(live) || '<p class="dim small center-text">Aún no ha pasado nada…</p>';
    timeline.setAttribute('data-count', String(live.revealed.length));
  }
}
// Suplente (live.subIn, Carrera de jugador): aviso de que esperas en el
// banquillo y botón para ir deprisa hasta tu entrada; al entrar, quién sale.
function futDraftBenchBannerHtml(live) {
  var sub = live.subIn;
  if (!sub) return '';
  if (sub.done) return '<div class="bench-banner bench-in">🔄 Entraste en el ' + sub.at + "'" + (sub.outName ? ' por ' + escapeHtml(sub.outName) : '') + (live.decideSolo ? ' · ahora juegas tú' : '') + '</div>';
  return '<div class="bench-banner"><span>🪑 En el banquillo · calientas para entrar hacia el ' + sub.minute + "'</span>" +
    (sub.ff ? '<b>⏩ Avanzando…</b>' : '<button class="btn btn-tiny btn-primary" onclick="actionLiveGoToSub()">⏩ Ir a mi entrada</button>') + '</div>';
}
window.actionLiveGoToSub = function () {
  var live = G.futdraft && G.futdraft.live;
  if (!live || !live.subIn || live.subIn.done) return;
  live.subIn.ff = true;
  render();
};
function renderFutDraftLive() {
  var live = G.futdraft.live;
  var oppName = live.oppSide.name;
  var logHtml = futDraftLiveLogHtml(live);
  // En Modo Carrera, "tu" escudo/nombre son los que hayas elegido al
  // crear la partida (careerClubShieldPath/careerClubDisplayName), no el
  // escudo equipado en la web -- antes se usaba SIEMPRE getPlayerShieldPath()
  // aquí sin más, un bug real ("elijo un escudo... cuando le doy a
  // simular partido, me pone otro... el de la web, no el del modo
  // carrera"). Y el orden de los lados sigue si juegas en casa o fuera
  // (live.youAreHome, puesto por los 4 puentes de career-mode.js) --
  // antes siempre salías a la izquierda aunque fueras visitante ("mientras
  // se está simulando el partido siempre soy local"), otro bug real,
  // corregidos los dos a la vez.
  var you = futDraftYouIdentity(live);
  var youShield = you.shield;
  var youName = you.name;
  var youAreHome = live.youAreHome !== false;
  var youSideHtml = '<div class="score-side"><img class="team-shield" src="' + escapeHtml(youShield) + '" alt=""><div class="score-name">' + escapeHtml(youName) + '</div><div class="score-num">' + live.myGoals + '</div></div>';
  var oppSideHtml = '<div class="score-side"><img class="team-shield" src="' + escapeHtml(teamShieldPath(oppName)) + '" alt=""><div class="score-name">' + escapeHtml(oppName) + '</div><div class="score-num">' + live.oppGoals + '</div></div>';
  return (
    '<div class="screen" data-live="1" data-extra="' + String(!!live.inExtraTime) + '" data-note="' + String(!!(live.inExtraTime && live.minute <= 91)) + '">' +
      '<div class="match-scoreboard">' +
        (youAreHome ? youSideHtml : oppSideHtml) +
        '<div class="score-vs">VS</div>' +
        (youAreHome ? oppSideHtml : youSideHtml) +
      '</div>' +
      // En puntitos el minuto ya sale superpuesto dentro del propio campo
      // (pitch-minute-chip), a petición explícita de acercar el diseño a
      // un marcador de partido real -- así no se repite el mismo dato dos veces.
      (live.visualMode === 'dots' ? '' : '<div class="turn-indicator">' + futDraftLiveIndicatorText(live) + '</div>') +
      (live.inExtraTime && live.minute <= 91 ? '<p class="dim small center-text">Empate al término del tiempo reglamentario: se juega la prórroga.</p>' : '') +
      (live.modifier && live.modifier !== 'ninguno' ? '<p class="dim small center-text">🌦️ ' + FUTDRAFT_MODIFIERS_BY_ID[live.modifier].name + ': ' + FUTDRAFT_MODIFIERS_BY_ID[live.modifier].desc + '</p>' : '') +
      futDraftBenchBannerHtml(live) +
      (live.visualMode === 'dots' ? '<div class="panel">' + futDraftPitchDotsHtml(live) + '</div><div id="liveStatsBox">' + futDraftMatchStatsHtml(live) + '</div>' : '') +
      '<div class="panel">' +
        '<div class="futdraft-timeline" data-count="' + live.revealed.length + '">' + (logHtml || '<p class="dim small center-text">Aún no ha pasado nada…</p>') + '</div>' +
      '</div>' +
      (live.decide ? '' : '<button class="btn btn-outline btn-block" onclick="futDraftSkipLive()">Saltar simulación</button>') +
    '</div>'
  );
}

// Tanda de penaltis de FutDraft: a diferencia del Modo Penaltis
// independiente (que se sigue jugando a mano, zona a zona), aquí se
// SIMULA entera de golpe -- a petición explícita, para no interrumpir el
// ritmo de un torneo/temporada con una tanda manual cada vez que hay
// empate -- pero se REVELA lanzamiento a lanzamiento, rápido (ver
// futDraftPenaltyTick), igual que el minuto a minuto de un partido
// normal, en vez de aparecer el resultado final de golpe. La probabilidad
// de acierto de cada lanzamiento sale de comparar la puntuación de tu
// equipo (futDraftTeamScore) con la fuerza del rival (teamPower): con
// equipos parejos ronda el 72% típico de un penalti real, y se desplaza
// unos puntos a tu favor o en tu contra según quién sea mejor.
function futDraftPenaltyShotChance(favor) {
  return clamp(0.72 + favor / 250, 0.45, 0.92);
}

// Quién tira cada lanzamiento: de tu once real para tu equipo, del pool
// de no drafteados (mismo "plantel fantasma" que ya usan los goles del
// rival en el partido normal, ver futDraftUndraftedPool) para el rival.
// Reutiliza futDraftGoalEvent (mismo peso por posición que un gol de
// verdad, sin asistencia porque un penalti no la tiene) tanto si se
// marca como si se falla, para poder decir siempre quién tiró.
function simulateFutDraftPenaltyShootout(oppSide) {
  var f = G.futdraft;
  var myScore = futDraftTeamScore(f.lineup, f.captainId);
  var oppPower = teamPower(oppSide);
  var diff = myScore - oppPower;
  var myChance = futDraftPenaltyShotChance(diff);
  var rivalChance = futDraftPenaltyShotChance(-diff);
  var myPlayers = f.lineup.map(function (s) { return s.player; });
  var oppPlayers = futDraftUndraftedPool();
  var oppEleven = oppPlayers.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 11);
  var attempts = futDraftPenaltyAttempts(myPlayers, oppEleven, myChance, rivalChance);
  var playerGoals = attempts.filter(function (x) { return x.side === 'me' && x.scored; }).length;
  var rivalGoals = attempts.filter(function (x) { return x.side === 'opp' && x.scored; }).length;
  return { playerGoals: playerGoals, rivalGoals: rivalGoals, attempts: attempts };
}

// Con su propio estado (G.futdraft.penalty) para no interferir con el
// Modo Penaltis independiente, y que al acabar retoma el bracket de
// FutDraft en vez de terminar la tanda. Todo el resultado se calcula de
// golpe (simulateFutDraftPenaltyShootout) pero se revela lanzamiento a
// lanzamiento (futDraftPenaltyTick), no de golpe.
function startFutDraftPenaltyShootout(oppSide) {
  // Partido jugado con Decidir: la tanda la juegas tú.
  if (G.futdraft.pendingDecide) {
    G.futdraft.pendingDecide = false;
    var fd = G.futdraft;
    pkStart({
      youName: fd.customTeam || 'Tu equipo', youShield: fd.customShield || getPlayerShieldPath(),
      oppName: oppSide.name, oppShield: teamShieldPath(oppSide.name),
      myPlayers: fd.lineup.map(function (s) { return s.player; }),
      oppPlayers: (fd.oppGhostPool && fd.oppGhostPool.length ? fd.oppGhostPool : qmTeamEleven(oppSide.name, fd.lineup.map(function (s) { return s.player.id; }))),
      onDone: function (res) { fd.penalty = { playerGoals: res.myGoals, rivalGoals: res.oppGoals }; finishFutDraftPenaltyShootout(); }
    });
    return;
  }
  var sim = simulateFutDraftPenaltyShootout(oppSide);
  G.futdraft.penalty = {
    playerGoals: 0, rivalGoals: 0,
    pending: sim.attempts, revealed: [],
    oppName: oppSide.name, oppShield: teamShieldPath(oppSide.name),
    done: false
  };
  G.screen = 'futdraftPenalty';
  render();
  futDraftPenaltyTick();
}

// Revela un lanzamiento cada 450ms (más rápido que el minuto a minuto de
// un partido normal, a petición explícita, porque aquí no hay "minutos"
// de por medio que rellenar). Se para sola si se navega a otra pantalla,
// igual que futDraftLiveTick.
function futDraftPenaltyTick() {
  var p = G.futdraft && G.futdraft.penalty;
  if (G.screen !== 'futdraftPenalty' || !p || p.done) return;
  var ev = p.pending.shift();
  if (ev.scored) { if (ev.side === 'me') p.playerGoals++; else p.rivalGoals++; }
  p.revealed.push(ev);
  if (!p.pending.length) p.done = true;
  futDraftPenaltyRefresh(p);
  if (!p.done) setTimeout(futDraftPenaltyTick, 450);
}
// Igual que futDraftLiveRefresh: solo se cambian marcador y lista de
// lanzamientos en sitio (antes render() completo en cada lanzamiento hacía
// parpadear escudos y avatares); repintado completo al terminar la tanda
// (aparece el botón Continuar) o si la pantalla aún no está pintada.
function futDraftPenaltyRefresh(p) {
  var root = document.querySelector('.screen[data-pen]');
  var nums = root ? root.querySelectorAll('.score-num') : [];
  var timeline = root ? root.querySelector('.futdraft-timeline') : null;
  if (!root || nums.length < 2 || !timeline || p.done || root.getAttribute('data-done') === 'true') { render(); return; }
  setScoreNum(nums[0], p.playerGoals);
  setScoreNum(nums[1], p.rivalGoals);
  timeline.innerHTML = p.revealed.slice().reverse().map(function (ev) { return futDraftPenaltyRowHtml(ev, p.oppShield); }).join('');
}

window.futDraftSkipPenalty = function () {
  var p = G.futdraft.penalty;
  if (!p || p.done) return;
  p.pending.forEach(function (ev) {
    if (ev.scored) { if (ev.side === 'me') p.playerGoals++; else p.rivalGoals++; }
    p.revealed.push(ev);
  });
  p.pending = [];
  p.done = true;
  render();
};

// Tanda VISIBLE (lanzamiento a lanzamiento, como en FutDraft) para los
// partidos en vivo de Carrera y Modo Mundial que acaban empatados: antes el
// resultado de la tanda aparecía de golpe. Al acabar, guarda el resultado
// en live.penaltyResult y vuelve a llamar a la función de fin de partido.
function futDraftLivePenaltyGate(live, oppName, diff, tied, refinish) {
  if (!tied || live.penaltyResult) return false;
  var f = G.futdraft;
  if (live.decide) {
    var you = futDraftYouIdentity(live);
    var lineup = (G.career && live.isCareer && G.career.lineup) ? G.career.lineup : f.lineup;
    var mine = (lineup || []).map(function (s) { return s.player; }).filter(Boolean);
    var sent = live.sentOff || [];
    mine = mine.filter(function (p) { return sent.indexOf(p.id) === -1; });
    var opp = (f.oppGhostPool && f.oppGhostPool.length ? f.oppGhostPool : (f.oppPlayersOverride && f.oppPlayersOverride.length ? f.oppPlayersOverride : qmTeamEleven(oppName, mine.map(function (p) { return p.id; })))).slice(0, 11);
    pkStart({
      youName: you.name, youShield: you.shield, oppName: oppName, oppShield: teamShieldPath(oppName),
      myPlayers: mine, oppPlayers: opp,
      onDone: function (res) { live.penaltyResult = res; refinish(); }
    });
    return true;
  }
  var myChance = futDraftPenaltyShotChance(diff);
  var rivalChance = futDraftPenaltyShotChance(-diff);
  // En Ver partido la tanda se ve en el propio campo, con los 11 que
  // acaban el partido (sin expulsados); si no, la pantalla de siempre.
  var onPitch = live.visualMode === 'dots' && live.dotsState && live.mr && !live.skipped && typeof mrStartPenalties === 'function';
  var myPlayers, oppPlayers;
  if (onPitch) {
    myPlayers = live.dotsState.me.filter(function (d) { return !d.off && d.player; }).map(function (d) { return d.player; });
    oppPlayers = live.dotsState.opp.filter(function (d) { return !d.off && d.player; }).map(function (d) { return d.player; });
  } else {
    var sentOff = live.sentOff || [];
    myPlayers = f.lineup.map(function (s) { return s.player; }).filter(function (p) { return sentOff.indexOf(p.id) === -1; });
    oppPlayers = (f.oppGhostPool && f.oppGhostPool.length ? f.oppGhostPool : (f.oppPlayersOverride && f.oppPlayersOverride.length ? f.oppPlayersOverride : futDraftUndraftedPool())).slice(0, 11);
  }
  var attempts = futDraftPenaltyAttempts(myPlayers, oppPlayers, myChance, rivalChance);
  var onDone = function (res) { live.penaltyResult = res; refinish(); };
  if (onPitch) { mrStartPenalties(live, attempts, onDone); return true; }
  f.penalty = {
    playerGoals: 0, rivalGoals: 0, pending: attempts, revealed: [],
    oppName: oppName, oppShield: teamShieldPath(oppName), done: false,
    onDone: onDone
  };
  G.screen = 'futdraftPenalty';
  render();
  futDraftPenaltyTick();
  return true;
}
// Orden de lanzadores SIN repetir (a petición explícita): primero los de
// campo con mejor tiro y el portero el último; solo si se acaban todos en
// una muerte súbita muy larga vuelve a empezar la lista, como en el fútbol.
function futDraftPenaltyOrder(players) {
  var field = players.filter(function (p) { return p.posicion !== 'Portero'; }).sort(function (a, b) { return (b.tiro || 0) - (a.tiro || 0); });
  var keepers = players.filter(function (p) { return p.posicion === 'Portero'; });
  return field.concat(keepers);
}
// La tanda se acaba antes de las 5 rondas si uno ya no puede alcanzar al otro.
function futDraftPenDecided(mg, rg, myTaken, oppTaken) {
  var R = PENALTY_MODE_ROUNDS;
  return mg > rg + (R - oppTaken) || rg > mg + (R - myTaken);
}
function futDraftPenaltyAttempts(myPlayers, oppPlayers, myChance, rivalChance) {
  var myOrder = futDraftPenaltyOrder(myPlayers), oppOrder = futDraftPenaltyOrder(oppPlayers);
  var attempts = [], mg = 0, rg = 0, round = 1;
  while (true) {
    var ms = Math.random() < myChance; if (ms) mg++;
    attempts.push({ side: 'me', round: round, player: myOrder[(round - 1) % myOrder.length], scored: ms });
    if (round <= PENALTY_MODE_ROUNDS && futDraftPenDecided(mg, rg, round, round - 1)) break;
    var rs = Math.random() < rivalChance; if (rs) rg++;
    attempts.push({ side: 'opp', round: round, player: oppOrder[(round - 1) % oppOrder.length], scored: rs });
    if (round <= PENALTY_MODE_ROUNDS && futDraftPenDecided(mg, rg, round, round)) break;
    if (round >= PENALTY_MODE_ROUNDS && mg !== rg) break;
    round++;
  }
  return attempts;
}

function finishFutDraftPenaltyShootout() {
  var f = G.futdraft;
  var p = f.penalty;
  if (p.onDone) {
    var cb = p.onDone;
    f.penalty = null;
    cb({ myGoals: p.playerGoals, oppGoals: p.rivalGoals });
    return;
  }
  var match = f.pendingMatch;
  var oppSide = f.pendingOppSide;
  var regular = f.pendingRegularResult;
  var playerWon = p.playerGoals > p.rivalGoals;
  match.winner = playerWon ? (match.a.isPlayer ? match.a : match.b) : (match.a.isPlayer ? match.b : match.a);
  if (playerWon) f.winsCount++;
  f.lastMatchResult = {
    oppName: oppSide.name, oppShield: teamShieldPath(oppSide.name), oppPower: regular.oppPower,
    myGoals: regular.myGoals, oppGoals: regular.oppGoals, playerWon: playerWon,
    timeline: regular.timeline, modifier: regular.modifier,
    penalty: { myGoals: p.playerGoals, oppGoals: p.rivalGoals },
    youName: f.customTeam || null, youShield: f.customShield || null
  };
  f.penalty = null; f.pendingMatch = null; f.pendingOppSide = null; f.pendingRegularResult = null;
  G.screen = 'futdraftMatchResult';
  render();
}

// Fila de un lanzamiento revelado: mismo formato que una fila de gol del
// partido normal (futDraftTimelineRowHtml) -- escudo, avatar, nombre, y
// en espejo a la derecha si es del rival -- pero con la ronda en vez del
// minuto, y sin asistencia (un penalti no la tiene). Deliberadamente NO
// se llama a futDraftRecordGoalEvents con estos lanzamientos en ningún
// sitio: los goles de penaltis no cuentan para la tabla de goleadores del
// torneo, a petición explícita.
function futDraftPenaltyRowHtml(ev, oppShield) {
  var isOpp = ev.side === 'opp';
  var shieldSrc = isOpp ? oppShield : getPlayerShieldPath();
  var text = (ev.scored ? '⚽ ' : '🧤 ') + '<strong>' + escapeHtml(ev.player.nombre) + '</strong>' + (ev.scored ? ' ¡gol!' : ' — parada.');
  var rowClass = 'futdraft-timeline-row' + (isOpp ? ' futdraft-timeline-row-opp' : '');
  return '<div class="' + rowClass + '"><span class="futdraft-timeline-minute">R' + ev.round + '</span><img class="futdraft-timeline-shield" src="' + escapeHtml(shieldSrc) + '" alt="">' + avatarHtml(ev.player) + '<span>' + text + '</span></div>';
}

function renderFutDraftPenalty() {
  var p = G.futdraft.penalty;
  if (!p) return '';
  var logHtml = p.revealed.slice().reverse().map(function (ev) {
    return futDraftPenaltyRowHtml(ev, p.oppShield);
  }).join('');
  var playerWon = p.done && p.playerGoals > p.rivalGoals;
  return (
    '<div class="screen" data-pen="1" data-done="' + String(!!p.done) + '">' +
      '<div class="panel center-text">' +
        '<h2 class="panel-title mt mb0">Penaltis</h2>' +
        '<p class="dim small">Empate en el tiempo reglamentario contra ' + escapeHtml(p.oppName) + '. Tanda simulada a ' + PENALTY_MODE_ROUNDS + ', con muerte súbita si hay empate.</p>' +
      '</div>' +
      '<div class="match-scoreboard">' +
        '<div class="score-side"><img class="team-shield" src="' + getPlayerShieldPath() + '" alt=""><div class="score-name">Tú</div><div class="score-num">' + p.playerGoals + '</div></div>' +
        '<div class="score-vs">VS</div>' +
        '<div class="score-side"><img class="team-shield" src="' + escapeHtml(p.oppShield) + '" alt=""><div class="score-name">' + escapeHtml(p.oppName) + '</div><div class="score-num">' + p.rivalGoals + '</div></div>' +
      '</div>' +
      '<div class="panel"><div class="futdraft-timeline">' + (logHtml || '<p class="dim small center-text">Empieza la tanda…</p>') + '</div></div>' +
      (p.done
        ? '<div class="panel center-text"><h3 style="margin-bottom:4px">' + (playerWon ? '🏆 ¡Ganas la tanda!' : '💔 Pierdes la tanda.') + '</h3>' +
          '<button class="btn btn-primary btn-block mt" onclick="finishFutDraftPenaltyShootout()">Continuar</button></div>'
        : '<button class="btn btn-outline btn-block" onclick="futDraftSkipPenalty()">Saltar</button>') +
    '</div>'
  );
}

