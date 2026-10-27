/* ---------------------------------------------------------------------
   PARTIDO RÁPIDO: eliges dos equipos cualquiera del juego y ves el
   partido en el campo (el mismo motor en tiempo real de Ver partido), a
   petición explícita ("modo partido rápido en el menú principal, donde
   eliges dos equipos cualquiera y ves partido... selectores de tarjetas
   donde vas viendo cada uno con escudo y la potencia"). Luego: "no están
   todos los equipos... ponlo mucho más bonito": salen TODOS los equipos del
   roster (75), con un cara a cara arriba y una cuadrícula filtrable por
   temporada para elegir Local y Visitante. Amistoso o eliminatoria.
   --------------------------------------------------------------------- */
var QM_FORMATION = '442';
var QM_ELEM_VAR = { Fuego: 'var(--fuego)', Bosque: 'var(--bosque)', Viento: 'var(--viento)', 'Montaña': 'var(--montana)' };

// Todos los equipos del roster, de más a menos potente.
function qmTeams() {
  if (qmTeams._cache) return qmTeams._cache;
  var seen = {};
  ROSTER.forEach(function (p) { if (p.equipo) seen[p.equipo] = true; });
  var list = Object.keys(seen);
  list.sort(function (a, b) { return qmPower(b) - qmPower(a) || a.localeCompare(b); });
  qmTeams._cache = list;
  return list;
}
// Potencia: la de TEAM_POWER si la tiene; si no, la media de sus 11 mejores.
function qmPower(name) {
  if (TEAM_POWER.hasOwnProperty(name)) return TEAM_POWER[name];
  qmPower._c = qmPower._c || {};
  if (qmPower._c[name] != null) return qmPower._c[name];
  var scores = teamMembers(name).map(function (p) { return futDraftPlayerScore(p); }).sort(function (a, b) { return b - a; }).slice(0, 11);
  var v = scores.length ? Math.round(scores.reduce(function (s, x) { return s + x; }, 0) / scores.length) : 50;
  qmPower._c[name] = v;
  return v;
}
function qmOwnPlayers(name) {
  return teamMembers(name).slice().sort(function (a, b) { return futDraftPlayerScore(b) - futDraftPlayerScore(a); });
}
// Color del equipo: el elemento más repetido entre sus jugadores.
function qmTeamColor(name) {
  var c = {};
  qmOwnPlayers(name).forEach(function (p) { c[p.tipo] = (c[p.tipo] || 0) + 1; });
  var best = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; })[0];
  return QM_ELEM_VAR[best] || 'var(--accent)';
}
// ===== Once de cada equipo =====
// El once real (el de Modo Historia: WT_REAL_ELEVEN o el de la etapa de
// la Temporada 1) si el equipo lo tiene; si no, sus mejores por puesto en
// 4-4-2. Lo usan el partido y la previa del escudo (renderTeamCardModal),
// así la alineación que ves en la previa es la que sale al campo.
var QM_LINE_ORDER = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];
function qmRosterById(id) {
  if (!qmRosterById._m) { qmRosterById._m = {}; ROSTER.forEach(function (p) { qmRosterById._m[p.id] = p; }); }
  return qmRosterById._m[id] || null;
}
function qmRealElevenIds(name) {
  if (typeof WT_REAL_ELEVEN !== 'undefined' && WT_REAL_ELEVEN[name]) return WT_REAL_ELEVEN[name];
  if (typeof WORLD_TOUR_STAGES !== 'undefined') {
    var st = WORLD_TOUR_STAGES.find(function (s) { return s.name === name && s.players && s.players.length >= 11; });
    if (st) return st.players.map(function (p) { return p.id; });
  }
  return null;
}
// Mejor once de una lista (1-4-4-2 por puntuación); si faltan puestos, los
// mejores que queden, nunca un segundo portero.
function qmBestEleven(pool, scoreFn) {
  scoreFn = scoreFn || futDraftPlayerScore;
  var need = { Portero: 1, Defensa: 4, Centrocampista: 4, Delantero: 2 };
  var sorted = pool.slice().sort(function (a, b) { return scoreFn(b) - scoreFn(a); });
  var out = [], used = {};
  QM_LINE_ORDER.forEach(function (pos) {
    sorted.forEach(function (p) { if (need[pos] > 0 && !used[p.id] && p.posicion === pos) { used[p.id] = true; need[pos]--; out.push(p); } });
  });
  sorted.forEach(function (p) { if (out.length < 11 && !used[p.id] && p.posicion !== 'Portero') { used[p.id] = true; out.push(p); } });
  return out;
}
// Todo once sale con un dibujo de fútbol de verdad (4-4-2, 4-3-3, 3-5-2...),
// a petición explícita ("que fuerce a todas las plantillas a jugar con
// alineaciones reales... Inazuma Japón o Artemisa tienen 1 defensa, hazlo
// real"): se elige la formación que obliga a mover a menos jugadores y los
// que sobran en una línea pasan a la que falta, los que mejor encajan por
// sus números (defensa, pase o tiro). Siempre un solo portero. Devuelve
// copias: los jugadores del roster nunca cambian de puesto.
var QM_LINE_STAT = { Defensa: 'defensa', Centrocampista: 'pase', Delantero: 'tiro' };
function qmFitFormation(eleven) {
  if (!eleven || eleven.length !== 11 || typeof FUTDRAFT_FORMATIONS === 'undefined') return eleven;
  var list = eleven.map(function (p) { return Object.assign({}, p); });
  var keepers = list.filter(function (p) { return p.posicion === 'Portero'; });
  // Sin portero: se pone de portero al de más defensa. Con dos o más, los
  // que sobran juegan de defensa.
  if (!keepers.length) {
    var gk = list.slice().sort(function (a, b) { return (b.defensa || 0) - (a.defensa || 0); })[0];
    gk.posicion = 'Portero';
  } else keepers.slice(1).forEach(function (p) { p.posicion = 'Defensa'; });
  function counts() {
    var c = { Defensa: 0, Centrocampista: 0, Delantero: 0 };
    list.forEach(function (p) { if (c[p.posicion] !== undefined) c[p.posicion]++; });
    return c;
  }
  var have = counts();
  var best = null, bestMoves = Infinity;
  FUTDRAFT_FORMATIONS.forEach(function (f) {
    var moves = 0;
    f.rows.forEach(function (r) { if (have[r.pos] !== undefined) moves += Math.max(0, have[r.pos] - r.count); });
    if (moves < bestMoves) { bestMoves = moves; best = f; }
  });
  if (!best || !bestMoves) return list;
  var need = {};
  best.rows.forEach(function (r) { need[r.pos] = r.count; });
  for (var guard = 0; guard < 11; guard++) {
    have = counts();
    var deficit = Object.keys(have).find(function (pos) { return have[pos] < (need[pos] || 0); });
    if (!deficit) break;
    var pick = null, pickFit = -Infinity;
    list.forEach(function (p) {
      var own = p.posicion;
      if (have[own] === undefined || have[own] <= (need[own] || 0)) return;
      var fit = (p[QM_LINE_STAT[deficit]] || 0) - (p[QM_LINE_STAT[own]] || 0);
      if (fit > pickFit) { pickFit = fit; pick = p; }
    });
    if (!pick) break;
    pick.posicion = deficit;
  }
  return list;
}
// noFill: la previa solo enseña jugadores del propio equipo, sin relleno.
function qmTeamEleven(name, excludeIds, noFill) {
  var used = {};
  (excludeIds || []).forEach(function (id) { used[id] = true; });
  var real = (qmRealElevenIds(name) || []).map(qmRosterById).filter(Boolean);
  var eleven = real.length >= 11 ? real.filter(function (p) { return !used[p.id]; }) : qmBestEleven(qmOwnPlayers(name).filter(function (p) { return !used[p.id]; }));
  eleven.forEach(function (p) { used[p.id] = true; });
  if (!noFill && eleven.length < 11) {
    // Huecos (jugador compartido con el rival o equipo corto): del propio
    // equipo primero, luego de su temporada y, si no, de cualquiera.
    var season = TEAM_SEASON[name];
    var tiers = [qmOwnPlayers(name),
      season ? ROSTER.filter(function (p) { return p.equipo !== name && TEAM_SEASON[p.equipo] === season; }).sort(function () { return Math.random() - 0.5; }) : [],
      ROSTER.slice().sort(function () { return Math.random() - 0.5; })];
    var want = { Portero: 1, Defensa: 4, Centrocampista: 4, Delantero: 2 };
    eleven.forEach(function (p) { if (want[p.posicion] > 0) want[p.posicion]--; });
    QM_LINE_ORDER.forEach(function (pos) {
      while (want[pos] > 0 && eleven.length < 11) {
        var pick = null;
        for (var t = 0; t < tiers.length && !pick; t++) pick = tiers[t].find(function (p) { return !used[p.id] && p.posicion === pos; });
        if (!pick) break;
        used[pick.id] = true; want[pos]--; eleven.push(pick);
      }
    });
    for (var k = 0; eleven.length < 11 && k < tiers[2].length; k++) if (!used[tiers[2][k].id] && tiers[2][k].posicion !== 'Portero') { used[tiers[2][k].id] = true; eleven.push(tiers[2][k]); }
  }
  // Sin portero (equipo corto o portero compartido con el rival): entra
  // uno del propio equipo, de su temporada o de cualquiera, por el peor.
  if (!noFill && eleven.length === 11 && !eleven.some(function (p) { return p.posicion === 'Portero'; })) {
    var season2 = TEAM_SEASON[name];
    var gkTiers = [qmOwnPlayers(name), season2 ? ROSTER.filter(function (p) { return TEAM_SEASON[p.equipo] === season2; }) : [], ROSTER];
    var keeper = null;
    for (var g = 0; g < gkTiers.length && !keeper; g++) keeper = gkTiers[g].find(function (p) { return !used[p.id] && p.posicion === 'Portero'; });
    if (keeper) {
      var worst = eleven.slice().sort(function (a, b) { return futDraftPlayerScore(a) - futDraftPlayerScore(b); })[0];
      eleven[eleven.indexOf(worst)] = keeper;
    }
  }
  return qmFitFormation(eleven.map(function (p) { return Object.assign({}, p); })).sort(function (a, b) { return QM_LINE_ORDER.indexOf(a.posicion) - QM_LINE_ORDER.indexOf(b.posicion); });
}
// Los cuatro del 4 vs 4: el mejor portero, defensa, centrocampista y
// delantero del equipo; si le falta alguno, de su temporada o de cualquiera.
function qmBuildFour(name, excludeIds) {
  var used = {};
  (excludeIds || []).forEach(function (id) { used[id] = true; });
  var season = TEAM_SEASON[name];
  var byScore = function (list) { return list.slice().sort(function (a, b) { return futDraftPlayerScore(b) - futDraftPlayerScore(a); }); };
  var tiers = [qmOwnPlayers(name), season ? byScore(ROSTER.filter(function (p) { return p.equipo !== name && TEAM_SEASON[p.equipo] === season; })) : [], byScore(ROSTER)];
  return QM_LINE_ORDER.map(function (pos) {
    var pick = null;
    for (var t = 0; t < tiers.length && !pick; t++) pick = tiers[t].find(function (p) { return !used[p.id] && p.posicion === pos; });
    used[pick.id] = true;
    return Object.assign({}, pick);
  });
}
function qmPower4(name) {
  qmPower4._c = qmPower4._c || {};
  if (qmPower4._c[name] == null) {
    var four = qmBuildFour(name, []);
    qmPower4._c[name] = Math.round(four.reduce(function (s, p) { return s + futDraftPlayerScore(p); }, 0) / four.length);
  }
  return qmPower4._c[name];
}
// Reglas del 4 vs 4, a petición explícita: dos partes de 25' o hasta que
// un equipo llegue a 3 goles. Más goles que en un partido de 11 (campo
// pequeño), repartidos entre el 1 y el 50; la lista se corta en el gol que
// da el 3, así el partido termina ahí.
var QM4_HALF = 25, QM4_FIRST_TO = 3, QM4_GOAL_BOOST = 1.45;
// half: duración de cada parte si no es la de siempre (la Aventura 4 vs 4
// juega partes de 15').
function qm4Goals(sim, myPlayers, oppPlayers, half) {
  var my = futDraftRandomGoals(futDraftExpectedGoals(sim.myAtk, sim.effectiveOppPower) * QM4_GOAL_BOOST);
  var opp = futDraftRandomGoals(futDraftExpectedGoals(sim.effectiveOppPower, sim.myDef) * QM4_GOAL_BOOST);
  var timeline = futDraftBuildTimeline(my, opp, myPlayers, oppPlayers, 1, (half || QM4_HALF) * 2);
  var m = 0, o = 0, cut = [];
  for (var i = 0; i < timeline.length; i++) {
    cut.push(timeline[i]);
    if (timeline[i].side === 'me') m++; else o++;
    if (m >= QM4_FIRST_TO || o >= QM4_FIRST_TO) break;
  }
  return { myGoals: m, oppGoals: o, timeline: cut };
}
function qm4LiveRules(live, half) {
  live.halfLen = half || QM4_HALF;
  live.firstTo = QM4_FIRST_TO;
  live.noExtraTime = true;
  live.small4 = true;
  return live;
}
function qmPowerFor(name) { return G.quickMatch && G.quickMatch.small ? qmPower4(name) : qmPower(name); }
function qmLineupOf(players) { return players.map(function (p) { return { pos: p.posicion, player: p }; }); }
function qmRowsOf(players) {
  return QM_LINE_ORDER.map(function (pos) { return { pos: pos, count: players.filter(function (p) { return p.posicion === pos; }).length }; }).filter(function (r) { return r.count > 0; });
}

// Alineación en pequeño para la previa del escudo, de delanteros (arriba)
// a portero (abajo).
function qmMiniPitchHtml(players, scoreFn) {
  scoreFn = scoreFn || futDraftPlayerScore;
  var rows = QM_LINE_ORDER.slice().reverse().map(function (pos) {
    var list = players.filter(function (p) { return p.posicion === pos; });
    if (!list.length) return '';
    return '<div class="pitch-row">' + list.map(function (p) {
      var sc = Math.round(scoreFn(p));
      return '<div class="pitch-player"><span class="pitch-media-badge" style="background:' + mediaBadgeColor(sc) + '">' + sc + '</span>' + avatarHtml(p) + '<span class="pitch-player-name">' + escapeHtml(p.nombre) + '</span></div>';
    }).join('') + '</div>';
  }).join('');
  return '<div class="pitch pitch-11 pitch-mini">' + rows + '<div class="pitch-center-line"></div><div class="pitch-center-circle"></div></div>';
}

// small: true abre el mismo selector en formato 4 vs 4 (campo pequeño).
window.actionGoQuickMatch = function (small) {
  var teams = qmTeams();
  if (!G.quickMatch || typeof G.quickMatch.a !== 'string') {
    G.quickMatch = { a: teams.indexOf('Raimon') !== -1 ? 'Raimon' : teams[0], b: teams.indexOf('Royal Academy') !== -1 ? 'Royal Academy' : teams[1], side: 'a', season: 'all', cup: false };
  }
  G.quickMatch.small = !!small;
  G.quickMatch.mode = null;
  G.screen = 'quickMatch';
  render();
};
// Juega tú (joystick) y Tú decides usan este mismo selector de equipos:
// el Local es tu equipo y el Visitante el rival.
window.actionGoPlayMode = function (mode) {
  window.actionGoQuickMatch(false);
  G.quickMatch.mode = mode;
  if (mode === 'joy' && !G.quickMatch.joyFormat) G.quickMatch.joyFormat = 5;
  render();
};
window.actionQuickMatchJoyFormat = function (n) { G.quickMatch.joyFormat = n; render(); };
var QM_MODE_TITLES = { joy: 'Juega tú', decide: 'Tú decides' };
window.actionQuickMatchSide = function (side) { G.quickMatch.side = side; render(); };
window.actionQuickMatchSeason = function (s) { G.quickMatch.season = s; render(); };
window.actionQuickMatchSearch = function (v) { G.quickMatch.search = v; render(); };
window.actionQuickMatchCup = function (on) { G.quickMatch.cup = !!on; render(); };
window.actionQuickMatchPick = function (idx) {
  var q = G.quickMatch, name = qmTeams()[idx];
  var other = q.side === 'a' ? 'b' : 'a';
  if (!name || q[other] === name) return;
  q[q.side] = name;
  // Tras elegir el local, pasa solo a elegir el visitante.
  if (q.side === 'a') q.side = 'b';
  render();
};
window.actionQuickMatchSwap = function () { var q = G.quickMatch, t = q.a; q.a = q.b; q.b = t; render(); };
window.actionQuickMatchRandom = function () {
  var teams = qmTeams(), q = G.quickMatch;
  q.a = teams[Math.floor(Math.random() * teams.length)];
  do { q.b = teams[Math.floor(Math.random() * teams.length)]; } while (q.b === q.a);
  render();
};

function qmHeroSideHtml(name, cls) {
  var stars = (G.quickMatch.small ? qmBuildFour(name, []) : qmOwnPlayers(name).slice(0, 3)).map(function (p) { return '<span class="qm-star">' + avatarHtml(p) + '</span>'; }).join('');
  return '<div class="qm-hero-side ' + cls + '" onclick="actionOpenTeamCard(\'' + name.replace(/'/g, '') + '\')">' +
    '<div class="qm-hero-shield-wrap"><img class="qm-hero-shield" src="' + escapeHtml(teamShieldPath(name)) + '" alt=""></div>' +
    '<div class="qm-hero-name">' + escapeHtml(name) + '</div>' +
    '<div class="qm-hero-season">' + escapeHtml(TEAM_SEASON_LABELS[TEAM_SEASON[name]] || '') + '</div>' +
    '<div class="qm-hero-stars">' + stars + '</div>' +
  '</div>';
}
function qmJoyOptionsHtml(q) {
  var n = q.joyFormat || 5;
  return '<div class="mode-pick-grid">' +
    '<button class="mode-pick-card' + (n === 5 ? ' active' : '') + '" onclick="actionQuickMatchJoyFormat(5)"><span class="mode-pick-icon">⚡</span><span class="mode-pick-text"><span class="mode-pick-name">5 vs 5</span><span class="mode-pick-desc">Rápido y directo</span></span></button>' +
    '<button class="mode-pick-card' + (n === 7 ? ' active' : '') + '" onclick="actionQuickMatchJoyFormat(7)"><span class="mode-pick-icon">🏟️</span><span class="mode-pick-text"><span class="mode-pick-name">7 vs 7</span><span class="mode-pick-desc">Más jugadores</span></span></button>' +
  '</div>' +
  '<div class="mode-pick-grid mt">' +
    '<button class="mode-pick-card' + (!q.cup ? ' active' : '') + '" onclick="actionQuickMatchCup(false)"><span class="mode-pick-icon">🤝</span><span class="mode-pick-text"><span class="mode-pick-name">Amistoso</span><span class="mode-pick-desc">El empate vale</span></span></button>' +
    '<button class="mode-pick-card' + (q.cup ? ' active' : '') + '" onclick="actionQuickMatchCup(true)"><span class="mode-pick-icon">🏆</span><span class="mode-pick-text"><span class="mode-pick-name">Eliminatoria</span><span class="mode-pick-desc">Penaltis jugables si hay empate</span></span></button>' +
  '</div>' +
  '<p class="dim small mt">Tu equipo es el Local. Joystick para moverte. Pasar: un toque, al compañero hacia donde apuntas. Tirar: mantén pulsado para cargar y suelta. Sin balón: Entrar para robar y Cambiar (o toca a un compañero en el campo). Técnica: usa la supertécnica de tu jugador para la jugada, gastando energía. Al empezar verás la explicación completa; luego, con el botón ?.</p>';
}
function renderQuickMatch() {
  var q = G.quickMatch;
  var teams = qmTeams();
  var pa = qmPowerFor(q.a), pb = qmPowerFor(q.b);
  var pctA = Math.round((pa / (pa + pb)) * 100);
  var hero =
    '<div class="qm-hero" style="--ca:' + qmTeamColor(q.a) + ';--cb:' + qmTeamColor(q.b) + '">' +
      '<div class="qm-hero-bg"></div>' +
      qmHeroSideHtml(q.a, 'qm-hero-a') +
      '<div class="qm-hero-vs"><span>VS</span></div>' +
      qmHeroSideHtml(q.b, 'qm-hero-b') +
      '<div class="qm-power-row">' +
        '<span class="qm-power-num" style="background:' + mediaBadgeColor(pa) + '">' + pa + '</span>' +
        '<div class="qm-power-bar"><span class="qm-power-a" style="width:' + pctA + '%"></span><span class="qm-power-b" style="width:' + (100 - pctA) + '%"></span></div>' +
        '<span class="qm-power-num" style="background:' + mediaBadgeColor(pb) + '">' + pb + '</span>' +
      '</div>' +
    '</div>';
  var seasons = TEAM_SEASON_ORDER.filter(function (s) { return teams.some(function (t) { return TEAM_SEASON[t] === s; }); });
  var qq = searchNorm(q.search || '');
  var shownCount = teams.filter(function (t) { return (q.season === 'all' || TEAM_SEASON[t] === q.season) && (!qq || searchNorm(t).indexOf(qq) !== -1); }).length;
  var chips = searchBoxHtml('qmQ', q.search || '', 'Busca un equipo', 'actionQuickMatchSearch(this.value)', shownCount) +
    '<div class="qm-chips">' +
    '<button class="qm-chip' + (q.season === 'all' ? ' on' : '') + '" onclick="actionQuickMatchSeason(\'all\')">Todos</button>' +
    seasons.map(function (s) { return '<button class="qm-chip' + (q.season === s ? ' on' : '') + '" onclick="actionQuickMatchSeason(\'' + s + '\')">' + escapeHtml(TEAM_SEASON_LABELS[s] || s) + '</button>'; }).join('') +
  '</div>';
  var other = q.side === 'a' ? q.b : q.a;
  var grid = '<div class="qm-grid">' + teams.map(function (t, i) {
    if (q.season !== 'all' && TEAM_SEASON[t] !== q.season) return '';
    if (qq && searchNorm(t).indexOf(qq) === -1) return '';
    var sel = t === q[q.side], taken = t === other;
    var pw = qmPowerFor(t);
    return '<button class="qm-tile' + (sel ? ' sel' : '') + (taken ? ' taken' : '') + '"' + (taken ? ' disabled' : '') + ' style="--tc:' + qmTeamColor(t) + '" onclick="actionQuickMatchPick(' + i + ')">' +
      '<img src="' + escapeHtml(teamShieldPath(t)) + '" alt="" loading="lazy">' +
      '<span class="qm-tile-name">' + escapeHtml(t) + '</span>' +
      '<span class="qm-tile-power" style="background:' + mediaBadgeColor(pw) + '">' + pw + '</span>' +
      (taken ? '<span class="qm-tile-tag">' + (q.side === 'a' ? 'Visitante' : 'Local') + '</span>' : '') +
    '</button>';
  }).join('') + '</div>';
  function tab(side, label) {
    var name = q[side];
    return '<button class="qm-tab' + (q.side === side ? ' on' : '') + '" style="--tc:' + qmTeamColor(name) + '" onclick="actionQuickMatchSide(\'' + side + '\')">' +
      '<span class="qm-tab-label">' + label + '</span>' +
      '<span class="qm-tab-team"><img src="' + escapeHtml(teamShieldPath(name)) + '" alt="">' + escapeHtml(name) + '</span>' +
    '</button>';
  }
  return (
    '<div class="screen qm-screen">' +
      pageTopHtml('actionBackToMenu()', (QM_MODE_TITLES[q.mode] || (q.small ? 'Partido 4 vs 4' : 'Partido rápido')), '<button class="page-ico page-ico-btn" onclick="actionQuickMatchRandom()" aria-label="Equipos al azar" title="Equipos al azar">🎲</button>') +
      hero +
      '<div class="panel qm-actions">' +
        (q.mode === 'joy' ? qmJoyOptionsHtml(q) :
        '<div class="mode-pick-grid">' +
          '<button class="mode-pick-card' + (!q.cup ? ' active' : '') + '" onclick="actionQuickMatchCup(false)"><span class="mode-pick-icon">🤝</span><span class="mode-pick-text"><span class="mode-pick-name">Amistoso</span><span class="mode-pick-desc">El empate vale</span></span></button>' +
          '<button class="mode-pick-card' + (q.cup ? ' active' : '') + '" onclick="actionQuickMatchCup(true)"><span class="mode-pick-icon">🏆</span><span class="mode-pick-text"><span class="mode-pick-name">Eliminatoria</span><span class="mode-pick-desc">' + (q.mode === 'decide' ? 'Penaltis si hay empate' : 'Prórroga y penaltis') + '</span></span></button>' +
        '</div>') +
        (q.mode === 'decide' ? '<p class="dim small mt">Tu equipo es el Local. El partido se para en los momentos clave y eliges: pasar, regatear o tirar con balón; robar o aguantar sin él. Cada opción enseña su probabilidad.</p>' : '') +
        (q.small ? '<p class="dim small mt">Campo pequeño, un portero y tres de campo por equipo. Dos partes de ' + QM4_HALF + '\' o hasta que un equipo llegue a ' + QM4_FIRST_TO + ' goles. En eliminatoria, el empate va a penaltis.</p>' : '') +
        '<button class="btn btn-primary btn-block mt qm-play" onclick="actionPlayQuickMatch()">' + (q.mode ? '🎮 Jugar' : '🎮 Jugar partido') + '</button>' +
      '</div>' +
      '<div class="panel qm-picker">' +
        '<div class="qm-tabs">' + tab('a', 'Local') + '<button class="qm-swap" onclick="actionQuickMatchSwap()" aria-label="Cambiar local y visitante">⇄</button>' + tab('b', 'Visitante') + '</div>' +
        chips +
        grid +
      '</div>' +
    '</div>'
  );
}

window.actionPlayQuickMatch = function () {
  var q = G.quickMatch;
  if (q.mode === 'joy') { joyStartMatch(q.a, q.b, q.joyFormat || 5, q.cup); return; }
  var decide = q.mode === 'decide';
  var nameA = q.a, nameB = q.b;
  var small = !!q.small;
  var powerA = small ? qmPower4(nameA) : qmPower(nameA), powerB = small ? qmPower4(nameB) : qmPower(nameB);
  // Once real de cada equipo con sus puestos de verdad (ver qmTeamEleven),
  // o sus cuatro mejores en el 4 vs 4.
  var elevenA = small ? qmBuildFour(nameA, []) : qmTeamEleven(nameA, []);
  var elevenB = small ? qmBuildFour(nameB, elevenA.map(function (p) { return p.id; })) : qmTeamEleven(nameB, elevenA.map(function (p) { return p.id; }));
  G.futdraft = {
    lineup: qmLineupOf(elevenA), squad: elevenA.slice(), captainId: null, formation: QM_FORMATION, condition: 'ninguna',
    tactics: { foul: 'medio', intensity: 'media' }, teamScoreOverride: powerA,
    oppPlayersOverride: elevenB, oppGhostPool: elevenB
  };
  var sim = futDraftSimulateMatchCore(powerB);
  if (small) { var g4 = qm4Goals(sim, elevenA, elevenB); sim.myGoals = g4.myGoals; sim.oppGoals = g4.oppGoals; sim.timeline = g4.timeline; }
  // Tú decides: sin guion, los goles salen de las decisiones (js/decide-mode.js).
  if (decide) { sim.myGoals = 0; sim.oppGoals = 0; sim.timeline = []; }
  G.futdraft.live = {
    oppSide: { name: nameB }, modifier: sim.modifier,
    minute: 0, pending: sim.timeline.slice(), revealed: [],
    myGoals: 0, oppGoals: 0, finalMyGoals: sim.myGoals, finalOppGoals: sim.oppGoals,
    myAtk: sim.myAtk, myDef: sim.myDef, effectiveOppPower: sim.effectiveOppPower,
    inExtraTime: false, allowDraw: !q.cup, onFinish: finishQuickMatch,
    isCareer: false, isWorldTour: false, isQuick: !decide, youAreHome: true,
    decide: decide,
    youName: nameA, youShield: teamShieldPath(nameA),
    oppFormation: { id: small ? '4v4' : 'real', rows: qmRowsOf(elevenB) }, small4: small,
    visualMode: 'dots', done: false
  };
  if (small) qm4LiveRules(G.futdraft.live);
  G.quickMatchTeams = { a: nameA, b: nameB, powerA: powerA, powerB: powerB };
  G.screen = 'futdraftLive';
  if (typeof playKickoffSound === 'function') playKickoffSound();
  render();
  futDraftLiveTick();
};
function finishQuickMatch() {
  var live = G.futdraft.live;
  var q0 = G.quickMatch || {};
  var t = G.quickMatchTeams;
  var myGoals = live.myGoals, oppGoals = live.oppGoals;
  if (!live.allowDraw && futDraftLivePenaltyGate(live, t.b, t.powerA - t.powerB, myGoals === oppGoals, finishQuickMatch)) return;
  var pen = live.penaltyResult || null;
  var playerWon = pen ? pen.myGoals > pen.oppGoals : myGoals > oppGoals;
  G.futdraft.lastMatchResult = {
    oppName: t.b, oppShield: teamShieldPath(t.b), oppPower: t.powerB,
    myGoals: myGoals, oppGoals: oppGoals, playerWon: playerWon,
    timeline: live.revealed, modifier: live.modifier, youAreHome: true,
    isQuick: true, profileMode: 'rapido', youName: t.a, youShield: teamShieldPath(t.a), youPower: t.powerA,
    penalty: pen
  };
  if (q0.mode === 'decide') {
    var r = G.futdraft.lastMatchResult;
    r.isQuick = false;
    r.kicker = 'Tú decides · Final';
    r.spiritPoints = awardSpiritPoints(myGoals === oppGoals && !pen ? SPIRIT_MATCH_DRAW : playerWon ? SPIRIT_MATCH_WIN : SPIRIT_MATCH_LOSS);
    r.buttonsHtml = '<button class="btn btn-primary btn-block mt" onclick="actionGoPlayMode(&quot;decide&quot;)">Otro partido</button><button class="btn btn-outline btn-block mt" onclick="actionBackToMenu()">Menú</button>';
  }
  G.futdraft.live = null;
  G.screen = 'futdraftMatchResult';
  render();
}
