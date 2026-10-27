/* ---------------------------------------------------------------------
   PERFIL: estadísticas globales de todos los modos (partidos, goles y
   títulos), logros e historial de partidos, guardados en G.meta.profile.
   Se anotan solos al ver el resultado de un partido (profileHook, desde
   render) y con profileRecord en los partidos que no pasan por esa
   pantalla (Carrera saltada, Carrera de jugador, Aventura y retos).
   Logros e historial a petición explícita ("perfil con logros e
   historial").
   --------------------------------------------------------------------- */
var PROFILE_MODES = [
  { id: 'carrera', name: 'Modo Carrera', icon: '🏆' },
  { id: 'jugador', name: 'Carrera de jugador', icon: '🌟' },
  { id: 'futdraft', name: 'FutDraft', icon: '📋' },
  { id: 'liga', name: 'Liga', icon: '🏟️' },
  { id: 'mundial', name: 'Modo Historia', icon: '🌍' },
  { id: 'aventura', name: 'Aventura y retos', icon: '🗺️' },
  { id: 'rapido', name: 'Partidos sueltos', icon: '⚡' }
];
var PROFILE_HISTORY_MAX = 30;
function profileData() {
  var m = G.meta;
  if (!m.profile) m.profile = { modes: {}, titles: {} };
  if (!m.profile.modes) m.profile.modes = {};
  if (!m.profile.titles) m.profile.titles = {};
  if (!m.profile.history) m.profile.history = [];
  if (!m.profile.achieved) m.profile.achieved = {};
  return m.profile;
}
function profileModeStats(mode) {
  var p = profileData();
  if (!p.modes[mode]) p.modes[mode] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
  return p.modes[mode];
}
// oppName (opcional): para el historial.
function profileRecord(mode, myGoals, oppGoals, playerWon, oppName) {
  var p = profileData();
  var s = profileModeStats(mode);
  s.played++;
  s.gf += myGoals; s.ga += oppGoals;
  var won = myGoals > oppGoals || (myGoals === oppGoals && playerWon === true);
  var lost = myGoals < oppGoals || (myGoals === oppGoals && playerWon === false);
  if (won) s.won++; else if (lost) s.lost++; else s.drawn++;
  p.streak = won ? (p.streak || 0) + 1 : 0;
  p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
  if (won && myGoals - oppGoals >= 5) p.bigWin = true;
  if (won && myGoals >= 1 && oppGoals === 0) p.cleanSheets = (p.cleanSheets || 0) + 1;
  p.history.unshift({ m: mode, o: oppName || '', g: myGoals, c: oppGoals, r: won ? 'w' : lost ? 'l' : 'd', t: Date.now() });
  if (p.history.length > PROFILE_HISTORY_MAX) p.history.length = PROFILE_HISTORY_MAX;
  profileCheckAchievements();
  if (typeof engageOnMatch === 'function') engageOnMatch(mode, myGoals, oppGoals, won);
  saveMeta(G.meta);
}
function profileTitle(kind) {
  var p = profileData();
  p.titles[kind] = (p.titles[kind] || 0) + 1;
  profileCheckAchievements();
  if (typeof engageOnTitle === 'function') engageOnTitle(kind);
  saveMeta(G.meta);
}
// Llamado desde render(): anota el resultado mostrado (una sola vez por resultado).
function profileHook() {
  try {
    if (G.screen === 'futdraftMatchResult' && G.futdraft && G.futdraft.lastMatchResult) {
      var lm = G.futdraft.lastMatchResult;
      if (lm._profileDone) return;
      lm._profileDone = true;
      var mode = lm.profileMode || (lm.isCareer ? 'carrera' : (lm.isLiga ? 'liga' : (lm.isWorldTour ? 'mundial' : (lm.isQuick ? 'rapido' : 'futdraft'))));
      var tiedNoPen = lm.myGoals === lm.oppGoals && lm.isCareer && !lm.penalty;
      profileRecord(mode, lm.myGoals, lm.oppGoals, tiedNoPen ? null : lm.playerWon, lm.oppName);
    }
  } catch (e) {}
}
var PROFILE_TITLE_NAMES = { liga: 'Ligas', copa: 'Copas', champions: 'Champions', supercopa: 'Supercopas', mundial: 'Modo Historia', aventura: 'Aventuras', torneo: 'Torneos', diario: 'Retos del día' };

// ===== Logros =====
function profileContext() {
  var p = profileData(), meta = G.meta;
  var total = { played: 0, won: 0, gf: 0, modes: 0 };
  PROFILE_MODES.forEach(function (md) {
    var s = profileModeStats(md.id);
    total.played += s.played; total.won += s.won; total.gf += s.gf;
    if (s.played) total.modes++;
  });
  var titles = Object.keys(p.titles).reduce(function (n, k) { return n + (p.titles[k] || 0); }, 0);
  var unlocked = ROSTER.filter(function (c) { return !c.locked || meta.unlocked.indexOf(c.id) !== -1; }).length;
  var solo = null;
  try { solo = G.solo || JSON.parse(localStorage.getItem('inazumaTactilRoguelike_soloCareer') || 'null'); } catch (e) {}
  return { p: p, meta: meta, total: total, titles: titles, unlocked: unlocked, solo: solo };
}
// Cada logro: progreso (val) sobre una meta (goal).
var PROFILE_ACHIEVEMENTS = [
  { id: 'debut', icon: '👟', name: 'Debut', desc: 'Juega tu primer partido', goal: 1, val: function (c) { return c.total.played; } },
  { id: 'veterano', icon: '🎽', name: 'Veterano', desc: 'Juega 50 partidos', goal: 50, val: function (c) { return c.total.played; } },
  { id: 'centenario', icon: '💯', name: 'Centenario', desc: 'Juega 100 partidos', goal: 100, val: function (c) { return c.total.played; } },
  { id: 'goleador', icon: '⚽', name: 'Goleador', desc: 'Marca 50 goles', goal: 50, val: function (c) { return c.total.gf; } },
  { id: 'canonero', icon: '💥', name: 'Cañonero', desc: 'Marca 250 goles', goal: 250, val: function (c) { return c.total.gf; } },
  { id: 'racha', icon: '🔥', name: 'En racha', desc: 'Gana 5 partidos seguidos', goal: 5, val: function (c) { return c.p.bestStreak || 0; } },
  { id: 'imparable', icon: '⚡', name: 'Imparable', desc: 'Gana 10 partidos seguidos', goal: 10, val: function (c) { return c.p.bestStreak || 0; } },
  { id: 'goleada', icon: '🎯', name: 'Goleada', desc: 'Gana por 5 goles o más', goal: 1, val: function (c) { return c.p.bigWin ? 1 : 0; } },
  { id: 'muro', icon: '🧱', name: 'Muro', desc: 'Deja la portería a cero 10 veces', goal: 10, val: function (c) { return c.p.cleanSheets || 0; } },
  { id: 'trofeo', icon: '🏆', name: 'Primer trofeo', desc: 'Gana un título', goal: 1, val: function (c) { return c.titles; } },
  { id: 'vitrina', icon: '🗄️', name: 'Vitrina llena', desc: 'Gana 10 títulos', goal: 10, val: function (c) { return c.titles; } },
  { id: 'champions', icon: '⭐', name: 'Rey de Europa', desc: 'Gana la Champions', goal: 1, val: function (c) { return c.p.titles.champions || 0; } },
  { id: 'aventurero', icon: '🗺️', name: 'Aventurero', desc: 'Completa una Aventura', goal: 1, val: function (c) { return c.meta.normalWins || 0; } },
  { id: 'dificil', icon: '💀', name: 'Sin miedo', desc: 'Desbloquea el Modo Difícil', goal: 1, val: function () { return typeof hardModeUnlocked === 'function' && hardModeUnlocked() ? 1 : 0; } },
  { id: 'diario', icon: '📅', name: 'Constante', desc: 'Supera 3 retos del día', goal: 3, val: function (c) { return c.p.titles.diario || 0; } },
  { id: 'superviviente', icon: '🛡️', name: 'Superviviente', desc: 'Llega a la oleada 5', goal: 5, val: function (c) { return c.meta.bestSurvivalWave || 0; } },
  { id: 'coleccion', icon: '📖', name: 'Coleccionista', desc: 'Desbloquea 400 personajes', goal: 400, val: function (c) { return c.unlocked; } },
  { id: 'canterano', icon: '🌟', name: 'Canterano', desc: 'Llega a 5 temporadas en Carrera de jugador', goal: 5, val: function (c) { return c.solo ? (c.solo.history || []).length : 0; } },
  { id: 'crack', icon: '👑', name: 'Crack', desc: 'Llega a 85 de media en Carrera de jugador', goal: 85, val: function (c) { return c.solo ? Math.round(c.solo.ovr) : 0; } },
  { id: 'todoterreno', icon: '🎮', name: 'Todoterreno', desc: 'Juega en 5 modos distintos', goal: 5, val: function (c) { return c.total.modes; } }
];
// Marca los logros nuevos (con fecha) y avisa con un toast.
function profileCheckAchievements() {
  var c = profileContext();
  PROFILE_ACHIEVEMENTS.forEach(function (a) {
    if (c.p.achieved[a.id]) return;
    var v = 0;
    try { v = a.val(c); } catch (e) {}
    if (v >= a.goal) {
      c.p.achieved[a.id] = Date.now();
      if (typeof fxToast === 'function') fxToast('🏅 Logro: ' + a.name, 'good');
    }
  });
}

// ===== Pantalla =====
window.actionGoProfile = function () { profileCheckAchievements(); saveMeta(G.meta); G.screen = 'perfil'; render(); };
window.actionProfileTab = function (t) { G.profileTab = t; render(); };
function profileAgo(t) {
  var m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return 'hace ' + m + ' min';
  var h = Math.round(m / 60);
  if (h < 24) return 'hace ' + h + ' h';
  var d = Math.round(h / 24);
  return d === 1 ? 'ayer' : 'hace ' + d + ' días';
}
function renderProfile() {
  var c = profileContext(), p = c.p;
  var total = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
  PROFILE_MODES.forEach(function (md) {
    var s = profileModeStats(md.id);
    Object.keys(total).forEach(function (k) { total[k] += s[k]; });
  });
  var pct = total.played ? Math.round(total.won / total.played * 100) : 0;
  var dPct = total.played ? Math.round(total.drawn / total.played * 100) : 0;
  var done = PROFILE_ACHIEVEMENTS.filter(function (a) { return p.achieved[a.id]; }).length;
  var tab = ['resumen', 'logros', 'historial'].indexOf(G.profileTab) !== -1 ? G.profileTab : 'resumen';
  var tabs = '<div class="seg-tabs prof-tabs">' + [['resumen', '📊 Resumen'], ['logros', '🏅 Logros ' + done + '/' + PROFILE_ACHIEVEMENTS.length], ['historial', '🕒 Historial']].map(function (t) {
    return '<button class="seg-tab' + (tab === t[0] ? ' on' : '') + '" onclick="actionProfileTab(\'' + t[0] + '\')">' + t[1] + '</button>';
  }).join('') + '</div>';
  var hero = '<div class="prof-hero">' +
    '<div class="prof-ring" style="--w:' + pct + ';--d:' + dPct + '"><div><b>' + pct + '%</b><span>victorias</span></div></div>' +
    '<div class="prof-hero-stats">' +
      '<div><b>' + total.played + '</b><span>Partidos</span></div>' +
      '<div><b>' + total.gf + '</b><span>Goles</span></div>' +
      '<div><b>' + c.titles + '</b><span>Títulos</span></div>' +
      '<div><b>' + (p.bestStreak || 0) + '</b><span>Mejor racha</span></div>' +
    '</div>' +
    '<div class="prof-wdl"><span class="w">' + total.won + ' V</span><span class="d">' + total.drawn + ' E</span><span class="l">' + total.lost + ' D</span><span>' + total.gf + '-' + total.ga + '</span></div>' +
  '</div>';
  var body;
  if (tab === 'logros') {
    body = '<div class="ach-grid">' + PROFILE_ACHIEVEMENTS.map(function (a) {
      var v = 0;
      try { v = a.val(c); } catch (e) {}
      var got = !!p.achieved[a.id];
      var prog = Math.min(1, v / a.goal);
      return '<div class="ach' + (got ? ' got' : '') + '"><span class="ach-ico">' + a.icon + '</span>' +
        '<div class="ach-txt"><strong>' + a.name + '</strong><span>' + a.desc + '</span>' +
        (got ? '<em>Conseguido ' + profileAgo(p.achieved[a.id]) + '</em>' : '<i class="ach-bar"><i style="width:' + Math.round(prog * 100) + '%"></i></i><em>' + Math.min(v, a.goal) + ' / ' + a.goal + '</em>') +
        '</div></div>';
    }).join('') + '</div>';
  } else if (tab === 'historial') {
    var modeOf = {};
    PROFILE_MODES.forEach(function (md) { modeOf[md.id] = md; });
    body = p.history.length ? '<div class="col-list">' + p.history.map(function (h) {
      var md = modeOf[h.m] || { icon: '⚽', name: h.m };
      return '<div class="hist-row hist-' + h.r + '"><span class="hist-res">' + (h.r === 'w' ? 'V' : h.r === 'l' ? 'D' : 'E') + '</span>' +
        (h.o ? '<img src="' + escapeHtml(teamShieldPath(h.o)) + '" alt="">' : '<span class="hist-ico">' + md.icon + '</span>') +
        '<div class="col-txt"><strong>' + (h.o ? escapeHtml(h.o) : md.name) + '</strong><span>' + md.icon + ' ' + md.name + ' · ' + profileAgo(h.t) + '</span></div>' +
        '<b class="hist-score">' + h.g + ' - ' + h.c + '</b></div>';
    }).join('') + '</div>' : '<div class="panel center-text"><p class="dim">Aún no hay partidos. Juega uno y aparecerá aquí.</p></div>';
  } else {
    var modeRows = PROFILE_MODES.map(function (md) {
      var s = profileModeStats(md.id);
      var w = s.played ? Math.round(s.won / s.played * 100) : 0;
      return '<div class="prof-mode' + (s.played ? '' : ' empty') + '"><span class="prof-mode-ico">' + md.icon + '</span>' +
        '<div class="col-txt"><strong>' + md.name + '</strong><span>' + s.played + ' partidos · ' + s.won + 'V ' + s.drawn + 'E ' + s.lost + 'D · ' + s.gf + '-' + s.ga + '</span>' +
        '<i class="ach-bar"><i style="width:' + w + '%"></i></i></div><b>' + (s.played ? w + '%' : '–') + '</b></div>';
    }).join('');
    var titleCells = Object.keys(PROFILE_TITLE_NAMES).map(function (k) {
      return '<div class="prof-title' + (p.titles[k] ? ' has' : '') + '"><b>' + (p.titles[k] || 0) + '</b><span>' + PROFILE_TITLE_NAMES[k] + '</span></div>';
    }).join('');
    body = '<div class="panel"><h3 class="prof-h3">Por modo</h3>' + modeRows + '</div>' +
      '<div class="panel"><h3 class="prof-h3">Títulos</h3><div class="prof-titles">' + titleCells + '</div></div>';
  }
  return '<div class="screen">' +
    pageTopHtml('actionBackToMenu()', 'Mi perfil', '📊') +
    hero + tabs + body +
  '</div>';
}
