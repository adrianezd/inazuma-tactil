/* ---------------------------------------------------------------------
   TORNEO A MEDIDA, a petición explícita ("crea un modo donde hagas un
   torneo, pero eligiendo tú a tu equipo, pudiendo elegir una plantilla
   existente y modificándola para ese torneo"). Eliges cualquier equipo
   del juego (mismo selector que Partido rápido), sale con su once real y
   el resto de su plantilla en el banquillo, y antes de empezar puedes
   fichar a quien quieras del roster o descartar suplentes. Luego es el
   torneo de FutDraft de siempre (cuadro, Ver partido, penaltis), con tu
   nombre y escudo de ese equipo. G.futdraft.mode = 'custom'.
   --------------------------------------------------------------------- */
var CT_BENCH_MAX = 12;
var CT_POSITIONS = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];

window.actionGoCustomTourney = function () {
  var teams = qmTeams();
  if (!G.customTourney) G.customTourney = { team: teams.indexOf('Raimon') !== -1 ? 'Raimon' : teams[0], season: 'all' };
  if (G.futdraftBracketSizeIdx === undefined) G.futdraftBracketSizeIdx = 0;
  G.screen = 'customTourney';
  render();
};
window.actionCustomTourneySeason = function (s) { G.customTourney.season = s; render(); };
window.actionCustomTourneyPick = function (idx) {
  var name = qmTeams()[idx];
  if (name) G.customTourney.team = name;
  render();
};

function renderCustomTourney() {
  var ct = G.customTourney;
  var teams = qmTeams();
  var seasons = TEAM_SEASON_ORDER.filter(function (s) { return teams.some(function (t) { return TEAM_SEASON[t] === s; }); });
  var chips = '<div class="qm-chips">' +
    '<button class="qm-chip' + (ct.season === 'all' ? ' on' : '') + '" onclick="actionCustomTourneySeason(\'all\')">Todos</button>' +
    seasons.map(function (s) { return '<button class="qm-chip' + (ct.season === s ? ' on' : '') + '" onclick="actionCustomTourneySeason(\'' + s + '\')">' + escapeHtml(TEAM_SEASON_LABELS[s] || s) + '</button>'; }).join('') +
  '</div>';
  var grid = '<div class="qm-grid">' + teams.map(function (t, i) {
    if (ct.season !== 'all' && TEAM_SEASON[t] !== ct.season) return '';
    var pw = qmPower(t);
    return '<button class="qm-tile' + (t === ct.team ? ' sel' : '') + '" style="--tc:' + qmTeamColor(t) + '" onclick="actionCustomTourneyPick(' + i + ')">' +
      '<img src="' + escapeHtml(teamShieldPath(t)) + '" alt="" loading="lazy">' +
      '<span class="qm-tile-name">' + escapeHtml(t) + '</span>' +
      '<span class="qm-tile-power" style="background:' + mediaBadgeColor(pw) + '">' + pw + '</span>' +
    '</button>';
  }).join('') + '</div>';
  var xi = qmTeamEleven(ct.team, [], true);
  return (
    '<div class="screen qm-screen">' +
      pageTopHtml('actionBackToMenu()', 'Torneo a medida', '🏆') +
      '<div class="panel center-text">' +
        '<div class="ct-team-head" onclick="actionOpenTeamCard(\'' + ct.team.replace(/'/g, '') + '\')">' +
          '<img class="team-shield" src="' + escapeHtml(teamShieldPath(ct.team)) + '" alt="">' +
          '<div><strong>' + escapeHtml(ct.team) + '</strong><div class="dim small">' + escapeHtml(TEAM_SEASON_LABELS[TEAM_SEASON[ct.team]] || '') + ' · ' + teamMembers(ct.team).length + ' jugadores</div></div>' +
        '</div>' +
        (xi.length ? qmMiniPitchHtml(xi) : '') +
        '<p class="dim small mt">Sales con su once y su plantilla. En el siguiente paso puedes fichar a cualquier jugador del juego y cambiar la alineación.</p>' +
        '<h3 style="margin:14px 0 8px">Tamaño del torneo</h3>' +
        futDraftBracketSizePickHtml() +
        '<h3 style="margin:14px 0 8px">Condiciones del partido</h3>' +
        futDraftConditionPickHtml() +
        '<button class="btn btn-primary btn-block mt" onclick="actionCustomTourneyBuild()">Preparar plantilla</button>' +
      '</div>' +
      '<div class="panel qm-picker">' +
        '<h3 style="margin-bottom:8px">Elige tu equipo</h3>' +
        chips + grid +
      '</div>' +
    '</div>'
  );
}

// Dibujo que encaja con su once real (4-3-3, 3-5-2...); si ninguno
// encaja, 4-4-2.
function ctFormationFor(players) {
  var c = {};
  players.forEach(function (p) { c[p.posicion] = (c[p.posicion] || 0) + 1; });
  var match = FUTDRAFT_FORMATIONS.find(function (f) { return f.rows.every(function (r) { return (c[r.pos] || 0) === r.count; }); });
  return match ? match.id : '442';
}

window.actionCustomTourneyBuild = function () {
  var name = G.customTourney.team;
  var eleven = qmTeamEleven(name, []);
  var ids = {};
  eleven.forEach(function (p) { ids[p.id] = true; });
  var bench = qmOwnPlayers(name).filter(function (p) { return !ids[p.id]; }).slice(0, CT_BENCH_MAX).map(function (p) { return Object.assign({}, p); });
  var formation = ctFormationFor(eleven);
  G.futdraftFormationChoices = null; // todas las formaciones disponibles
  G.futdraft = {
    squad: eleven.concat(bench), formation: formation, mode: 'custom',
    customTeam: name, customShield: teamShieldPath(name),
    condition: FUTDRAFT_CONDITION_OPTIONS[futDraftConditionChoiceIdx()].id,
    captainId: null, matches: [], matchIndex: 0,
    lineup: futDraftBuildLineup(eleven, formation), bench: bench, swapSelectedId: null
  };
  G.ctSearch = { q: '', pos: 'all' };
  G.screen = 'futdraftTeam';
  render();
};

window.actionCustomTourneySearch = function (v) { G.ctSearch.q = v; render(); };
window.actionCustomTourneySearchPos = function (pos) { G.ctSearch.pos = pos; render(); };
function ctSquadIds(f) {
  var ids = {};
  f.lineup.forEach(function (s) { ids[s.player.id] = true; });
  f.bench.forEach(function (p) { ids[p.id] = true; });
  return ids;
}
function ctSyncSquad(f) { f.squad = f.lineup.map(function (s) { return s.player; }).concat(f.bench); }
window.actionCustomTourneySign = function (id) {
  var f = G.futdraft;
  if (f.bench.length >= CT_BENCH_MAX || ctSquadIds(f)[id]) return;
  var p = ROSTER.find(function (r) { return r.id === id; });
  if (!p) return;
  f.bench.push(Object.assign({}, p));
  ctSyncSquad(f);
  render();
};
window.actionCustomTourneyRelease = function (id) {
  var f = G.futdraft;
  f.bench = f.bench.filter(function (p) { return p.id !== id; });
  if (f.swapSelectedId === id) f.swapSelectedId = null;
  ctSyncSquad(f);
  render();
};

// Panel de fichajes dentro de "Tu once inicial" (renderFutDraftTeam): los
// fichados entran al banquillo y con Mover se meten en el once.
function ctSigningPanelHtml(f) {
  var s = G.ctSearch || (G.ctSearch = { q: '', pos: 'all' });
  var owned = ctSquadIds(f);
  var q = s.q.trim().toLowerCase();
  var results = [];
  if (q.length >= 2 || s.pos !== 'all') {
    results = ROSTER.filter(function (p) {
      if (owned[p.id]) return false;
      if (s.pos !== 'all' && p.posicion !== s.pos) return false;
      return !q || p.nombre.toLowerCase().indexOf(q) !== -1 || (p.equipo || '').toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) { return futDraftPlayerScore(b) - futDraftPlayerScore(a); }).slice(0, 20);
  }
  var full = f.bench.length >= CT_BENCH_MAX;
  var posChips = '<div class="qm-chips">' + ['all'].concat(CT_POSITIONS).map(function (pos) {
    return '<button class="qm-chip' + (s.pos === pos ? ' on' : '') + '" onclick="actionCustomTourneySearchPos(\'' + pos + '\')">' + (pos === 'all' ? 'Todos' : pos) + '</button>';
  }).join('') + '</div>';
  var list = results.map(function (p) {
    var sc = Math.round(futDraftPlayerScore(p));
    return '<div class="ct-row">' + avatarHtml(p) +
      '<div class="ct-row-info"><strong>' + escapeHtml(p.nombre) + '</strong><span class="dim small">' + escapeHtml(p.posicion) + ' · ' + escapeHtml(p.equipo || '') + '</span></div>' +
      '<span class="pitch-media-badge ct-badge" style="background:' + mediaBadgeColor(sc) + '">' + sc + '</span>' +
      '<button class="btn btn-tiny"' + (full ? ' disabled' : '') + ' onclick="actionCustomTourneySign(\'' + p.id + '\')">Fichar</button>' +
    '</div>';
  }).join('');
  var benchList = f.bench.map(function (p) {
    return '<button class="qm-chip" onclick="actionCustomTourneyRelease(\'' + p.id + '\')" title="Quitar del banquillo">' + escapeHtml(p.nombre) + ' ✕</button>';
  }).join('');
  return '<div class="panel">' +
    '<h3 style="margin-bottom:4px">Fichajes para el torneo</h3>' +
    '<p class="dim small">Busca a cualquier jugador del juego. Entra al banquillo (' + f.bench.length + ' de ' + CT_BENCH_MAX + ') y con Mover lo pones de titular.</p>' +
    '<input class="select-field mt" type="text" placeholder="Nombre o equipo…" data-focus-key="ct-search" value="' + escapeHtml(s.q) + '" oninput="actionCustomTourneySearch(this.value)">' +
    posChips +
    (list ? '<div class="ct-list">' + list + '</div>' : '<p class="dim small">' + (q.length === 1 ? 'Escribe al menos dos letras.' : 'Escribe un nombre o elige un puesto.') + '</p>') +
    (f.bench.length ? '<h3 style="margin:12px 0 6px">Descartar suplentes</h3><div class="qm-chips">' + benchList + '</div>' : '') +
  '</div>';
}
