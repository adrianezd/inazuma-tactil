/* ---------------------------------------------------------------------
   TARJETA DE JUGADOR Y MODO MOVER: al tocar a un jugador en el campo (en
   cualquier modo con alineación: FutDraft, Liga, Modo Mundial, FutDraft 2
   jugadores y Modo Carrera) se abre una tarjeta con sus datos, en vez de
   entrar directo en el modo de cambiar titulares. Para cambiar jugadores
   hay que activar antes el botón "Mover", que deja el campo como estaba
   siempre (tocar dos jugadores para intercambiarlos). También un selector
   de formación plegable, para no enseñar siempre las 9 formaciones.
   La tarjeta tiene flechas para pasar al jugador anterior/siguiente de la
   misma plantilla (once + banquillo) sin tener que cerrarla y volver a
   tocar otro.
   --------------------------------------------------------------------- */
window.actionOpenPlayerCard = function (ctx, id) {
  if (typeof event !== 'undefined' && event) event.stopPropagation();
  G.playerCard = { ctx: ctx, id: id };
  render();
};
window.actionClosePlayerCard = function () { G.playerCard = null; render(); };

// Lista ordenada (once + banquillo) de la plantilla que corresponda al contexto en el que se abrió la tarjeta.
function playerCardSquadPlayers(ctx) {
  if (ctx === 'market') return [];
  if (ctx === 'career' && G.career) return G.career.lineup.map(function (s) { return s.player; }).concat(G.career.bench);
  if (ctx === 'vs' && G.futdraftVs && G.futdraftVs.prepTurn) {
    var side = G.futdraftVs.prepTurn;
    return futDraftVsLineup(side).map(function (s) { return s.player; }).concat(futDraftVsBench(side));
  }
  if (G.futdraft) return G.futdraft.lineup.map(function (s) { return s.player; }).concat(G.futdraft.bench || []);
  return [];
}
window.actionPlayerCardStep = function (dir) {
  if (typeof event !== 'undefined' && event) event.stopPropagation();
  var pc = G.playerCard;
  if (!pc) return;
  var list = playerCardSquadPlayers(pc.ctx);
  var idx = list.findIndex(function (p) { return p.id === pc.id; });
  if (idx === -1 || list.length < 2) return;
  var next = list[(idx + dir + list.length) % list.length];
  G.playerCard = { ctx: pc.ctx, id: next.id };
  render();
};

var PCARD_TYPE_GRAD = {
  Fuego: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--fuego) 55%, #fff), var(--fuego) 60%, #1b0d08 145%)',
  Bosque: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--bosque) 55%, #fff), var(--bosque) 60%, #071b0e 145%)',
  Viento: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--viento) 55%, #fff), var(--viento) 60%, #071523 145%)',
  Montaña: 'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--montana) 55%, #fff), var(--montana) 60%, #1c1408 145%)'
};

function playerCardRow(label, value, accent) {
  if (value === null || value === undefined || value === '') return '';
  return '<div class="pcard-row"><span>' + label + '</span><strong' + (accent ? ' style="color:var(--accent-2)"' : '') + '>' + value + '</strong></div>';
}
function renderPlayerCardModal() {
  var pc = G.playerCard;
  if (!pc) return '';
  var p = ROSTER.find(function (x) { return x.id === pc.id; });
  if (!p) { G.playerCard = null; return ''; }
  // Desde el Mercado de Carrera: misma ficha con media, valor y potencial de Carrera.
  var isCareer = pc.ctx === 'career' || pc.ctx === 'market';
  var c = G.career;
  // Fuera de Carrera, la ficha de tu plantilla (en Modo Mundial los
  // jugadores tienen su propia media, distinta de la del roster).
  var squadP = isCareer ? null : playerCardSquadPlayers(pc.ctx).find(function (x) { return x.id === p.id; });
  var statsP = squadP || p;
  var score = Math.round(isCareer && typeof careerPlayerScore === 'function' ? careerPlayerScore(p) : futDraftPlayerScore(statsP));
  // En Carrera, el club ACTUAL en esta partida (el tuyo si es de tu
  // plantilla), no el de origen, a petición explícita.
  var clubNow = G.career && typeof careerCurrentClubOf === 'function' && (isCareer || G.screen === 'careerMode') ? careerCurrentClubOf(G.career, p.id) : p.equipo;
  var rows = playerCardRow('Posición', positionIconHtml(p.posicion, 16) + ' ' + p.posicion) +
    playerCardRow('Equipo', clubNow ? escapeHtml(clubNow) : '—');
  if (isCareer && c) {
    // Historial de esta temporada (Liga): partidos, goles y asistencias, a petición explícita
    // ("historial de un jugador dentro de su tarjeta").
    var apps = (c.seasonAppearances && c.seasonAppearances[p.id]) || 0;
    var goals = (c.league && c.league.stats && c.league.stats.scorers[p.id] && c.league.stats.scorers[p.id].count) || 0;
    var assists = (c.league && c.league.stats && c.league.stats.assists[p.id] && c.league.stats.assists[p.id].count) || 0;
    if (apps || goals || assists) rows += playerCardRow('Esta temporada', apps + ' PJ · ' + goals + ' G · ' + assists + ' A');
    var value = typeof careerPlayerValue === 'function' ? careerPlayerValue(p) : null;
    if (value !== null) rows += playerCardRow('Valor de mercado', value + ' M€', true);
    var delta = c.lastPlayerProgressionDelta ? c.lastPlayerProgressionDelta[p.id] : null;
    if (pc.ctx !== 'market') rows += playerCardRow('Entrenamiento', typeof delta === 'number' ? ((delta > 0 ? '+' : '') + Math.round(delta * 10) / 10 + ' la última temporada') : 'Aún sin datos esta temporada');
    if (typeof careerPlayerGrowthTier === 'function' && typeof careerGrowthArrowHtml === 'function') {
      rows += playerCardRow('Potencial', careerGrowthArrowHtml(careerPlayerGrowthTier(c, p), c.hideProdigy));
    }
    if (typeof careerPlayerStatus === 'function') {
      var st = careerPlayerStatus(c, p.id);
      if (st) rows += playerCardRow('Estado', st.type === 'injury' ? '🩹 Lesionado, ' + st.left + ' partido' + (st.left === 1 ? '' : 's') : '🟥 Sancionado por roja');
    }
    if (typeof careerFatigueOf === 'function') {
      var fat = careerFatigueOf(c, p.id);
      if (fat > 0) rows += playerCardRow('Cansancio', '<span class="pcard-meter"><span style="width:' + Math.min(100, fat) + '%"></span></span> ' + fat + ' / 100');
    }
  }
  var list = playerCardSquadPlayers(pc.ctx);
  var canStep = list.length > 1;
  var grad = PCARD_TYPE_GRAD[p.tipo] || PCARD_TYPE_GRAD.Bosque;
  // Tarjeta que gira al tocarla (a petición explícita): delante sus datos,
  // detrás sus estadísticas, sus supertécnicas y su descripción.
  var src = ROSTER.find(function (x) { return x.id === p.id; }) || p;
  var TECH_KIND = { tiro: 'Tiro', regate: 'Regate', portero: 'Portero', defensa: 'Defensa', pase: 'Pase' };
  var elemColor = { Fuego: 'var(--fuego)', Bosque: 'var(--bosque)', Viento: 'var(--viento)', 'Montaña': 'var(--montana)' }[p.tipo] || 'var(--accent-2)';
  // En Carrera, con tus jugadores: la tercera bloqueada hasta 85 de media
  // y las que les hayas enseñado. Cada una con su potencia y su afinidad.
  var inCareerSquad = typeof careerTechView === 'function' && G.career && G.screen === 'careerMode' && careerIsSquadPlayer(G.career, p.id);
  var techView = inCareerSquad ? careerTechView(G.career, p) : playerTechs(p).map(function (h) { return { name: h }; });
  var backHiss = techView.map(function (t) {
    var h = t.name;
    var techKind = TECH_KIND[hissatsuTipo(h, src)] || '';
    var info = typeof techInfo === 'function' ? techInfo(h, src) : null;
    var powHtml = info ? '<span class="pcard-tech-pow' + (techHasAffinity(h, src) ? ' aff' : '') + '" title="Potencia, afinidad ' + escapeHtml(info.element) + '">' + techElementIconHtml(info.element, 14) + techEffectivePower(h, src) + '</span>' : '';
    var tag = t.locked ? '🔒 ' + (typeof CAREER_THIRD_TECH_SCORE !== 'undefined' ? CAREER_THIRD_TECH_SCORE : 85) : (t.learned ? 'Aprendida' : techKind);
    return '<div class="pcard-tech' + (t.locked ? ' locked' : '') + '" style="--elem:' + elemColor + '"><span class="pcard-tech-name">⚡ ' + escapeHtml(h) + '</span>' + powHtml + (tag ? '<span class="pcard-tech-kind">' + tag + '</span>' : '') + '</div>';
  }).join('');
  var front =
    '<div class="pcard pcard-front">' +
      '<div class="pcard-banner" style="background:' + grad + '">' +
        '<button class="pcard-close" onclick="event.stopPropagation();actionClosePlayerCard()" aria-label="Cerrar">&times;</button>' +
        '<span class="pcard-type-chip">' + getTypeSymbol(p.tipo) + ' ' + escapeHtml(p.tipo) + '</span>' +
        '<div class="pcard-avatar-wrap">' + avatarHtml(p, 'pcard-avatar') + '<div class="pcard-score-badge" style="background:' + mediaBadgeColor(score) + '">' + score + '</div></div>' +
      '</div>' +
      '<div class="pcard-body">' +
        '<div class="pcard-name">' + escapeHtml(p.nombre) + '</div>' +
        '<div class="pcard-rows">' + rows + '</div>' +
        '<div class="pcard-flip-hint">↻ Toca para girar</div>' +
      '</div>' +
    '</div>';
  var back =
    '<div class="pcard pcard-back">' +
      '<div class="pcard-back-head" style="background:' + grad + '">' +
        '<button class="pcard-close" onclick="event.stopPropagation();actionClosePlayerCard()" aria-label="Cerrar">&times;</button>' +
        avatarHtml(p) +
        '<div><div class="pcard-back-name">' + escapeHtml(p.nombre) + '</div><div class="pcard-back-sub">' + escapeHtml(p.posicion) + ' · ' + score + ' de media</div></div>' +
      '</div>' +
      '<div class="pcard-body pcard-back-body">' +
        '<div class="pcard-hiss-title">Estadísticas</div>' +
        statBarsHtml({ tiro: Math.round(statsP.tiro), pase: Math.round(statsP.pase), defensa: Math.round(statsP.defensa), especial: Math.round(statsP.especial) }) +
        (backHiss ? '<div class="pcard-hiss-title">Supertécnicas</div><div class="pcard-techs">' + backHiss + '</div>' : '') +
        (src.desc ? '<p class="dim small center-text pcard-back-desc">' + escapeHtml(src.desc) + '</p>' : '') +
        '<div class="pcard-flip-hint">↻ Toca para girar</div>' +
      '</div>' +
    '</div>';
  return '<div class="modal-overlay pcard-overlay" onclick="actionClosePlayerCard()">' +
    (canStep ? '<button class="pcard-nav pcard-nav-left" onclick="event.stopPropagation();actionPlayerCardStep(-1)" aria-label="Jugador anterior">&#10094;</button>' : '') +
    '<div class="pcard-flip" onclick="event.stopPropagation();this.classList.toggle(\'flipped\')"><div class="pcard-inner">' + front + back + '</div></div>' +
    (canStep ? '<button class="pcard-nav pcard-nav-right" onclick="event.stopPropagation();actionPlayerCardStep(1)" aria-label="Jugador siguiente">&#10095;</button>' : '') +
  '</div>';
}

// ===== Selector de formación plegable =====
window.actionToggleFormationPicker = function (key) {
  G.formationExpand = G.formationExpand || {};
  G.formationExpand[key] = !G.formationExpand[key];
  render();
};
function formationPickerHtml(key, currentId, formations, onSelectFn) {
  var open = !!(G.formationExpand && G.formationExpand[key]);
  var cur = formations.find(function (f) { return f.id === currentId; });
  if (!open) {
    return '<button class="btn btn-tiny active" onclick="actionToggleFormationPicker(\'' + key + '\')">' + (cur ? cur.name : currentId) + ' <span style="opacity:.65">&#9662;</span></button>';
  }
  return '<div class="view-toggle view-toggle-wrap">' + formations.map(function (f) {
    return '<button class="btn-tiny' + (f.id === currentId ? ' active' : '') + '" onclick="' + onSelectFn + '(\'' + f.id + '\');actionToggleFormationPicker(\'' + key + '\')">' + f.name + '</button>';
  }).join('') + '</div>';
}

// ===== Modo Mover: sin él, tocar a un jugador abre su tarjeta en vez de entrar en modo cambio =====
window.actionToggleFutDraftMove = function () {
  var f = G.futdraft;
  f.moveMode = !f.moveMode;
  f.swapSelectedId = null;
  render();
};
window.actionToggleCareerMove = function () {
  var c = G.career;
  c.moveMode = !c.moveMode;
  c.swapSelectedId = null;
  render();
};
// Mostrar todo: cansancio y crecimiento de cada jugador en el campo.
window.actionToggleCareerShowAll = function () {
  var c = G.career;
  c.showAllInfo = !c.showAllInfo;
  render();
};
window.actionToggleFutDraftVsMove = function () {
  var s = G.futdraftVs;
  s.moveMode = !s.moveMode;
  s.swapSelectedId = null;
  render();
};

// ===== Tarjeta de equipo (rival o el tuyo): mismo lenguaje visual que la de jugador =====
window.actionOpenTeamCard = function (name, league, idx) {
  if (typeof event !== 'undefined' && event) event.stopPropagation();
  G.teamCard = { name: name, league: league || null, idx: typeof idx === 'number' ? idx : null };
  render();
};
window.actionCloseTeamCard = function () { G.teamCard = null; render(); };
function renderTeamCardModal() {
  var tc = G.teamCard;
  if (!tc) return '';
  var name = tc.name;
  var isMineCareer = G.career && typeof careerClubDisplayName === 'function' && careerClubDisplayName(G.career) === name;
  var isMineWorldTour = G.worldTour && G.worldTour.teamName === name;
  var isMine = isMineCareer || isMineWorldTour;
  var power = isMineCareer && typeof careerMatchTeamScore === 'function' ? Math.round(careerMatchTeamScore(G.career))
    : isMineWorldTour && typeof worldTourTeamScore === 'function' ? Math.round(worldTourTeamScore())
    : (typeof careerRivalPower === 'function' && G.career ? Math.round(careerRivalPower(name)) : (typeof TEAM_POWER !== 'undefined' && TEAM_POWER[name] ? Math.round(TEAM_POWER[name]) : null));
  var season = typeof TEAM_SEASON !== 'undefined' && TEAM_SEASON[name] && typeof TEAM_SEASON_LABELS !== 'undefined' ? TEAM_SEASON_LABELS[TEAM_SEASON[name]] : null;
  var rows = playerCardRow(isMine ? 'Tu equipo' : 'Potencia', power !== null ? power : '—', true) + (isMine ? '' : playerCardRow('Procedencia', season || '—'));
  if (tc.league && typeof ligaSortedTable === 'function' && typeof tc.idx === 'number') {
    var sorted = ligaSortedTable(tc.league.table);
    var rank = sorted.findIndex(function (t) { return t.idx === tc.idx; }) + 1;
    var row = tc.league.table[tc.idx];
    if (row) {
      rows += playerCardRow('Posición en Liga', rank + 'º') + playerCardRow('Puntos', row.pts);
      if (typeof ligaFormHtml === 'function' && row.form) rows += playerCardRow('Forma', ligaFormHtml(row.form));
    }
  }
  // En Carrera, la plantilla ACTUAL del rival en tu partida (con sus
  // fichajes y sin los que ya son tuyos), a petición explícita.
  var inCareer = G.career && G.screen === 'careerMode' && typeof careerRivalSquad === 'function';
  var pool = inCareer && !isMine ? careerRivalSquad(G.career, name) : (typeof ROSTER !== 'undefined' ? teamMembers(name) : []);
  if (pool.length) rows += playerCardRow(inCareer ? 'Plantilla' : 'Jugadores en el roster', pool.length);
  // Jugadores clave del rival (los de mejor media según futDraftPlayerScore),
  // a petición explícita ("pon jugadores claves en cada equipo... al darle
  // al equipo, en la previa del partido"). No se muestra en tu propio
  // equipo -- tu plantilla ya se gestiona entera en Mi equipo/Plantilla.
  var keyPlayersHtml = '';
  if (!isMine && pool.length && typeof futDraftPlayerScore === 'function') {
    var scoreOf = inCareer ? function (p) { return careerPlayerScore(p); } : function (p) { return futDraftPlayerScore(p); };
    var keyPlayers = pool.slice().sort(function (a, b) { return scoreOf(b) - scoreOf(a); }).slice(0, inCareer ? 5 : 4);
    keyPlayersHtml = '<p class="dim small" style="margin:12px 0 6px;text-align:left">Jugadores clave</p><div class="pcard-key-players">' +
      keyPlayers.map(function (p) {
        return '<div class="pcard-key-player">' + avatarHtml(p) + '<span>' + escapeHtml(p.nombre) + '</span>' + (inCareer ? '<strong class="pcard-key-score" style="background:' + mediaBadgeColor(Math.round(scoreOf(p))) + '">' + Math.round(scoreOf(p)) + '</strong>' : '') + '</div>';
      }).join('') + '</div>';
  }
  // Alineación en pequeño, a petición explícita ("si le das al escudo del
  // equipo... carga también la alineación en una pequeña previa, para ver
  // qué plantilla tienen"). En Carrera, el mejor once de su plantilla
  // actual; fuera, el once real con el que sale en Partido rápido.
  var lineupHtml = '';
  if (!isMine && typeof qmTeamEleven === 'function') {
    var xi = inCareer ? qmBestEleven(pool, function (p) { return careerPlayerScore(p); }) : qmTeamEleven(name, [], true);
    if (xi.length) {
      lineupHtml = '<p class="dim small" style="margin:12px 0 6px;text-align:left">' + (inCareer ? 'Once probable' : 'Once titular') + '</p>' +
        qmMiniPitchHtml(xi, inCareer ? function (p) { return careerPlayerScore(p); } : null);
    }
  }
  return '<div class="modal-overlay pcard-overlay" onclick="actionCloseTeamCard()">' +
    '<div class="pcard" onclick="event.stopPropagation()">' +
      '<div class="pcard-banner" style="background:linear-gradient(160deg, rgba(255,255,255,0.14), var(--panel-2) 65%)">' +
        '<button class="pcard-close" onclick="actionCloseTeamCard()" aria-label="Cerrar">&times;</button>' +
        '<div class="pcard-avatar-wrap" style="background:none"><img class="team-shield pcard-team-shield" src="' + escapeHtml(isMineCareer ? careerClubShieldPath(G.career) : isMineWorldTour ? worldTourShieldPath() : teamShieldPath(name)) + '" alt=""></div>' +
      '</div>' +
      '<div class="pcard-body">' +
        '<div class="pcard-name">' + escapeHtml(name) + '</div>' +
        '<div class="pcard-rows">' + rows + '</div>' +
        keyPlayersHtml +
        lineupHtml +
      '</div>' +
    '</div>' +
  '</div>';
}

// ===== Chip del capitán: texto plano si no hay, tarjeta con brazalete si lo hay =====
function captainChipHtml(captain, hintHtml) {
  if (!captain) return '<p class="dim small">' + hintHtml + '</p>';
  return '<div class="captain-chip"><span class="captain-armband captain-chip-armband">C</span><span class="captain-chip-text">' + hintHtml + '</span></div>';
}

// ===== Grupo de acciones del campo (icono + etiqueta), más videojuego que texto plano =====
function pitchActionBtn(icon, label, activeLabel, active, onclick, disabled) {
  return '<button class="pitch-action-btn' + (active ? ' active' : '') + '"' + (disabled ? ' disabled' : '') + ' onclick="' + onclick + '"><span class="pab-icon">' + icon + '</span><span class="pab-label">' + (active && activeLabel ? activeLabel : label) + '</span></button>';
}
