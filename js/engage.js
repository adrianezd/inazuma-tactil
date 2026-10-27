/* ---------------------------------------------------------------------
   VOLVER CADA DÍA: racha de días, misiones diarias y semanales, temporada
   del mes con nivel de entrenador, fin de semana con Puntos de Espíritu
   dobles, equipo destacado de la semana, garantía y álbumes de Fichajes,
   y jugar contra el once que te comparte un amigo.
   Todo se guarda en G.meta (login, missions, season, xpTotal, freeSpins,
   gachaPity, albums, mySquad). Los ganchos son engageOnMatch (desde
   profileRecord), engageOnTitle (profileTitle) y engageOnGacha (spinGacha).
   --------------------------------------------------------------------- */

function engageMeta() {
  var m = G.meta;
  if (!m.login) m.login = { last: '', streak: 0 };
  if (!m.missions) m.missions = {};
  if (!m.season) m.season = { id: '', xp: 0, got: [] };
  if (!Array.isArray(m.season.got)) m.season.got = [];
  if (!Array.isArray(m.albums)) m.albums = [];
  m.xpTotal = m.xpTotal || 0;
  m.freeSpins = m.freeSpins || 0;
  m.gachaPity = m.gachaPity || 0;
  return m;
}
function engageDayKey(offset) { var d = new Date(); d.setDate(d.getDate() + (offset || 0)); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function engageIsWeekend() { var g = new Date().getDay(); return g === 0 || g === 6; }
// semana que empieza el lunes: clave y número (para rotar el equipo destacado)
function engageWeek() {
  var d = new Date(), mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7);
  return { id: mon.getFullYear() + '-' + (mon.getMonth() + 1) + '-' + mon.getDate(), n: Math.round((mon - new Date(2026, 0, 5)) / (7 * 864e5)) };
}
function engageSeeded(key) {
  var s = 7;
  for (var i = 0; i < key.length; i++) s = (s * 31 + key.charCodeAt(i)) % 233280;
  return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/* ===== Premios ===== */
// Jugador al azar que aún no tienes; best: solo oro o vibranium (si quedan)
function engageRandomPlayer(best, preferVib) {
  var pool = typeof gachaLockedPool === 'function' ? gachaLockedPool() : [];
  if (best) {
    var top = pool.filter(function (p) { var r = gachaRarityOf(p); return preferVib ? r === 'vibranium' : (r === 'oro' || r === 'vibranium'); });
    if (!top.length && preferVib) top = pool.filter(function (p) { var r = gachaRarityOf(p); return r === 'oro' || r === 'vibranium'; });
    if (top.length) pool = top;
  }
  if (!pool.length) return null;
  var p = choice(pool);
  G.meta.unlocked.push(p.id);
  return p;
}
function engageRandomShield() {
  var pool = typeof shieldGachaLockedPool === 'function' ? shieldGachaLockedPool() : [];
  if (!pool.length) return null;
  var s = choice(pool);
  G.meta.unlockedShields = G.meta.unlockedShields || [];
  G.meta.unlockedShields.push(s);
  return s;
}
// rw: { points, spins, shield, player: 'oro' | 'vibranium' }; da el premio y devuelve el texto
function engageGive(rw) {
  var m = engageMeta(), out = [];
  if (rw.points) { m.points += rw.points; out.push('+' + rw.points + ' Puntos de Espíritu'); }
  if (rw.spins) { m.freeSpins += rw.spins; out.push(rw.spins === 1 ? '1 tirada gratis' : rw.spins + ' tiradas gratis'); }
  if (rw.shield) { var s = engageRandomShield(); if (s) out.push('Escudo de ' + s); else { m.points += 60; out.push('+60 Puntos de Espíritu'); } }
  if (rw.player) {
    var p = engageRandomPlayer(true, rw.player === 'vibranium');
    if (p) { out.push('¡Fichaje: ' + p.nombre + '!'); G.engageNewPlayer = p.id; }
    else { m.points += 150; out.push('+150 Puntos de Espíritu'); }
  }
  saveMeta(m);
  return out.join(' · ');
}
function engageRewardText(rw) {
  if (rw.player) return rw.player === 'vibranium' ? 'Jugador vibranium' : 'Jugador de oro';
  if (rw.shield) return 'Escudo al azar';
  if (rw.spins) return rw.spins === 1 ? 'Tirada gratis' : rw.spins + ' tiradas gratis';
  return '+' + rw.points + ' puntos';
}
function engageRewardIcon(rw) { return rw.player ? '🌟' : rw.shield ? '🛡️' : rw.spins ? '🎰' : '✨'; }

/* ===== Nivel de entrenador y temporada ===== */
// Puntos de experiencia: suben el nivel de entrenador (para siempre) y la temporada (cada mes)
var SEASON_LEVELS = 30, SEASON_XP = 100;
var SEASON_THEMES = [
  { name: 'Temporada Raimon', icon: '⚡', color: '#ffcf33' },
  { name: 'Temporada Royal Academy', icon: '👑', color: '#9aa7ff' },
  { name: 'Temporada Zeus', icon: '🌩️', color: '#7fd6ff' },
  { name: 'Temporada Alius', icon: '🌑', color: '#c04bff' },
  { name: 'Temporada Inazuma Japón', icon: '🗾', color: '#4fa3ff' },
  { name: 'Temporada Fútbol Frontier', icon: '🏟️', color: '#ff7a3c' }
];
function seasonTheme() { var d = new Date(); return SEASON_THEMES[(d.getFullYear() * 12 + d.getMonth()) % SEASON_THEMES.length]; }
function seasonState() {
  var m = engageMeta(), d = new Date(), id = d.getFullYear() + '-' + (d.getMonth() + 1);
  if (m.season.id !== id) m.season = { id: id, xp: 0, got: [] };
  return m.season;
}
function seasonLevel() { return Math.min(SEASON_LEVELS, Math.floor(seasonState().xp / SEASON_XP)); }
function seasonDaysLeft() { var d = new Date(), end = new Date(d.getFullYear(), d.getMonth() + 1, 1); return Math.max(1, Math.ceil((end - d) / 864e5)); }
function seasonReward(lv) {
  if (lv === 30) return { player: 'vibranium' };
  if (lv === 10 || lv === 20) return { player: 'oro' };
  if (lv % 5 === 0) return { spins: 2 };
  if (lv % 4 === 0) return { shield: true };
  if (lv % 3 === 0) return { spins: 1 };
  return { points: 25 + lv * 3 };
}
function seasonReady(lv) { return lv <= seasonLevel() && seasonState().got.indexOf(lv) === -1; }
function seasonPending() { var n = 0; for (var l = 1; l <= seasonLevel(); l++) if (seasonReady(l)) n++; return n; }
// nivel de entrenador: cada nivel pide 100 + 25 por nivel
function trainerInfo(xp) {
  var lv = 1, need = 100;
  while (xp >= need) { xp -= need; lv++; need = 100 + 25 * (lv - 1); }
  return { lv: lv, xp: xp, need: need };
}
function engageAddXp(n) {
  if (!n) return;
  var m = engageMeta(), lv0 = trainerInfo(m.xpTotal).lv, s0 = seasonLevel();
  m.xpTotal += n;
  seasonState().xp += n;
  var lv1 = trainerInfo(m.xpTotal).lv;
  if (lv1 > lv0) {
    var pts = 20 + 5 * lv1;
    m.points += pts;
    if (typeof fxToast === 'function') fxToast('📈 Entrenador nivel ' + lv1 + ' · +' + pts + ' Puntos de Espíritu', 'good');
  }
  if (seasonLevel() > s0 && typeof fxToast === 'function') fxToast(seasonTheme().icon + ' Nivel ' + seasonLevel() + ' de la temporada: cobra tu premio', 'good');
}

/* ===== Racha de días ===== */
var LOGIN_REWARDS = [{ points: 20 }, { points: 30 }, { spins: 1 }, { points: 40 }, { points: 60 }, { shield: true }, { player: 'oro', points: 50 }];
function loginReady() { return engageMeta().login.last !== engageDayKey(0); }
function loginDay() {
  var l = engageMeta().login, alive = l.last === engageDayKey(-1) || l.last === engageDayKey(0);
  var streak = alive ? l.streak : 0;
  return loginReady() ? streak % 7 + 1 : ((streak - 1) % 7) + 1;
}
window.actionClaimLogin = function () {
  if (!loginReady()) { G.showLogin = false; render(); return; }
  var l = engageMeta().login;
  l.streak = l.last === engageDayKey(-1) ? l.streak + 1 : 1;
  l.last = engageDayKey(0);
  var day = (l.streak - 1) % 7;
  var txt = engageGive(LOGIN_REWARDS[day]);
  engageAddXp(15);
  saveMeta(G.meta);
  G.showLogin = false;
  if (typeof fxToast === 'function') fxToast('📅 Día ' + (day + 1) + ': ' + txt, 'good');
  if (typeof fxConfetti === 'function' && day === 6) fxConfetti('big');
  render();
};
function renderLoginModal() {
  var day = loginDay();
  var cells = LOGIN_REWARDS.map(function (rw, i) {
    var st = i + 1 < day ? ' got' : i + 1 === day ? ' today' : '';
    return '<div class="lg-day' + st + (i === 6 ? ' big' : '') + '"><small>Día ' + (i + 1) + '</small><span class="lg-ico">' + engageRewardIcon(rw) + '</span><b>' + escapeHtml(engageRewardText(rw)) + '</b></div>';
  }).join('');
  return '<div class="modal-overlay">' +
    '<div class="jugador-trophy-card" data-nofx="1" onclick="event.stopPropagation()" style="max-width:360px">' +
      '<div class="jugador-trophy-icon">📅</div>' +
      '<h3 style="margin-bottom:4px">Racha de días</h3>' +
      '<p class="dim small" style="margin-bottom:8px">Entra cada día. El séptimo, un jugador de oro.</p>' +
      '<div class="lg-grid">' + cells + '</div>' +
      '<button class="btn btn-primary btn-block mt" onclick="actionClaimLogin()">Cobrar día ' + day + '</button>' +
    '</div>' +
  '</div>';
}

/* ===== Misiones diarias y semanales ===== */
// text: [singular, plural] · d / w: meta del día y de la semana · stat: lo que cuenta
var MISSION_POOL = [
  { k: 'partidos', text: ['Juega {n} partido', 'Juega {n} partidos'], d: 3, w: 15 },
  { k: 'victorias', text: ['Gana {n} partido', 'Gana {n} partidos'], d: 2, w: 10 },
  { k: 'goles', text: ['Marca {n} gol', 'Marca {n} goles'], d: 6, w: 30 },
  { k: 'ceros', text: ['Deja la portería a cero {n} vez', 'Deja la portería a cero {n} veces'], d: 1, w: 5 },
  { k: 'goleada', text: ['Gana un partido por 3 goles o más', 'Gana {n} partidos por 3 goles o más'], d: 1, w: 3 },
  { k: 'm_carrera', text: ['Juega {n} partido en Modo Carrera', 'Juega {n} partidos en Modo Carrera'], d: 2, w: 8 },
  { k: 'm_futdraft', text: ['Juega {n} partido de FutDraft', 'Juega {n} partidos de FutDraft'], d: 2, w: 6 },
  { k: 'm_rapido', text: ['Juega {n} partido suelto', 'Juega {n} partidos sueltos'], d: 1, w: 5 },
  { k: 'm_liga', text: ['Juega {n} partido de Liga', 'Juega {n} partidos de Liga'], d: 2, w: 6 },
  { k: 'm_mundial', text: ['Juega {n} partido del Modo Historia', 'Juega {n} partidos del Modo Historia'], d: 1, w: 5 },
  { k: 'm_jugador', text: ['Juega {n} partido en Carrera de jugador', 'Juega {n} partidos en Carrera de jugador'], d: 2, w: 8 },
  { k: 'fichajes', text: ['Haz {n} tirada de fichajes', 'Haz {n} tiradas de fichajes'], d: 1, w: 5 },
  { k: 'titulos', text: ['Gana {n} título', 'Gana {n} títulos'], d: 1, w: 2 }
];
var MISSION_REWARD = { d: { points: 40, xp: 25 }, w: { points: 150, xp: 80 } };
function missionDef(k) { return MISSION_POOL.filter(function (x) { return x.k === k; })[0]; }
function missionText(m) { var d = missionDef(m.k); return (m.goal === 1 ? d.text[0] : d.text[1]).replace('{n}', m.goal); }
function engageMakeMissions(key, kind) {
  var r = engageSeeded(key + kind), pool = MISSION_POOL.slice(), out = [];
  while (out.length < 3 && pool.length) {
    var def = pool.splice(Math.floor(r() * pool.length), 1)[0];
    out.push({ k: def.k, goal: def[kind], prog: 0, got: false });
  }
  return out;
}
function engageMissions() {
  var m = engageMeta().missions, day = engageDayKey(0), wk = engageWeek().id;
  if (m.day !== day) { m.day = day; m.daily = engageMakeMissions(day, 'd'); m.dailyBonus = false; }
  if (m.week !== wk) { m.week = wk; m.weekly = engageMakeMissions(wk, 'w'); }
  return m;
}
function missionsPending() {
  var m = engageMissions(), n = 0;
  m.daily.concat(m.weekly).forEach(function (x) { if (!x.got && x.prog >= x.goal) n++; });
  if (!m.dailyBonus && m.daily.every(function (x) { return x.got; })) n++;
  return n;
}
// suma progreso y devuelve la misión que más ha avanzado (para el aviso)
function engageProgress(k, v) {
  if (!v) return null;
  var m = engageMissions(), best = null;
  m.daily.concat(m.weekly).forEach(function (x) {
    if (x.k !== k || x.got || x.prog >= x.goal) return;
    x.prog = Math.min(x.goal, x.prog + v);
    if (!best || x.prog / x.goal > best.prog / best.goal) best = x;
  });
  return best;
}
window.actionClaimMission = function (kind, i) {
  var m = engageMissions(), list = kind === 'w' ? m.weekly : m.daily, x = list[i];
  if (!x || x.got || x.prog < x.goal) return;
  x.got = true;
  var rw = MISSION_REWARD[kind];
  G.meta.points += rw.points;
  engageAddXp(rw.xp);
  saveMeta(G.meta);
  if (typeof fxToast === 'function') fxToast('✅ ' + missionText(x) + ' · +' + rw.points + ' Puntos de Espíritu', 'good');
  render();
};
window.actionClaimMissionBonus = function () {
  var m = engageMissions();
  if (m.dailyBonus || !m.daily.every(function (x) { return x.got; })) return;
  m.dailyBonus = true;
  var txt = engageGive({ spins: 1, points: 30 });
  engageAddXp(30);
  saveMeta(G.meta);
  if (typeof fxToast === 'function') fxToast('🎁 Premio del día: ' + txt, 'good');
  render();
};

/* ===== Ganchos ===== */
var ENGAGE_MODE_MISSION = { carrera: 'm_carrera', futdraft: 'm_futdraft', rapido: 'm_rapido', liga: 'm_liga', mundial: 'm_mundial', jugador: 'm_jugador' };
function engageOnMatch(mode, gf, ga, won) {
  try {
    var hits = [];
    hits.push(engageProgress('partidos', 1));
    if (won) hits.push(engageProgress('victorias', 1));
    hits.push(engageProgress('goles', gf));
    if (ga === 0) hits.push(engageProgress('ceros', 1));
    if (won && gf - ga >= 3) hits.push(engageProgress('goleada', 1));
    if (ENGAGE_MODE_MISSION[mode]) hits.push(engageProgress(ENGAGE_MODE_MISSION[mode], 1));
    engageAddXp(10 + (won ? 10 : 0) + Math.min(gf, 5) * 2);
    engageNotify(hits);
  } catch (e) {}
}
function engageOnTitle() { try { engageNotify([engageProgress('titulos', 1)]); engageAddXp(40); } catch (e) {} }
function engageOnGacha() { try { engageNotify([engageProgress('fichajes', 1)]); engageAddXp(5); } catch (e) {} }
// Un solo aviso por partido: misión cumplida o, si no, la que se te queda cerca
function engageNotify(hits) {
  hits = hits.filter(Boolean);
  if (!hits.length || typeof fxToast !== 'function') return;
  var done = hits.filter(function (x) { return x.prog >= x.goal; })[0];
  if (done) { fxToast('✅ Misión cumplida: ' + missionText(done) + '. Cóbrala en Misiones', 'good'); return; }
  var near = hits.sort(function (a, b) { return b.prog / b.goal - a.prog / a.goal; })[0];
  if (near.prog / near.goal >= 0.5) fxToast('🎯 ' + missionText(near) + ' · ' + near.prog + '/' + near.goal);
}

/* ===== Menú: tira con temporada, entrenador y lo siguiente ===== */
function engageNextGoal() {
  var m = engageMissions();
  var near = m.daily.concat(m.weekly).filter(function (x) { return !x.got && x.prog < x.goal; })
    .sort(function (a, b) { return b.prog / b.goal - a.prog / a.goal; })[0];
  if (near && near.prog) return 'Misión: ' + missionText(near) + ' · ' + near.prog + '/' + near.goal;
  var al = albumList().filter(function (a) { return !a.claimed && a.left > 0 && a.left <= 3; })[0];
  if (al) return 'Álbum de ' + al.team + ': ' + (al.left === 1 ? 'te falta 1 jugador' : 'te faltan ' + al.left + ' jugadores');
  if (G.meta.points < GACHA_COST) return 'Te faltan ' + (GACHA_COST - G.meta.points) + ' puntos para una tirada de fichajes';
  return '¡Ya puedes hacer una tirada de fichajes!';
}
function engageMenuStripHtml() {
  var th = seasonTheme(), lv = seasonLevel(), xp = seasonState().xp, tr = trainerInfo(engageMeta().xpTotal);
  var pend = seasonPending(), mp = missionsPending(), max = lv >= SEASON_LEVELS;
  return '<button class="eg-strip" onclick="actionGoSeason()" style="--sc:' + th.color + '">' +
      '<span class="eg-lv"><small>Nivel</small><b>' + lv + '</b></span>' +
      '<span class="eg-body"><strong>' + th.icon + ' ' + escapeHtml(th.name) + '</strong>' +
        '<i class="eg-bar"><i style="width:' + (max ? 100 : xp % SEASON_XP) + '%"></i></i>' +
        '<em>' + escapeHtml(engageNextGoal()) + '</em></span>' +
      (pend ? '<span class="eg-dot">' + pend + '</span>' : '') +
    '</button>' +
    '<div class="eg-chips">' +
      '<button class="eg-chip' + (mp ? ' ready' : '') + '" onclick="actionGoMissions()">🎯 Misiones' + (mp ? ' <em class="chip-count">' + mp + '</em>' : '') + '</button>' +
      '<span class="eg-chip">📈 Entrenador ' + tr.lv + '</span>' +
      '<span class="eg-chip">📅 Racha ' + (engageMeta().login.streak || 0) + '</span>' +
      (engageIsWeekend() ? '<span class="eg-chip gold">✨ Puntos dobles</span>' : '') +
    '</div>';
}

/* ===== Pantallas: misiones y temporada ===== */
window.actionGoMissions = function () { G.screen = 'misiones'; render(); };
window.actionGoSeason = function () { G.screen = 'temporada'; render(); };
function missionRowHtml(x, i, kind) {
  var done = x.prog >= x.goal, rw = MISSION_REWARD[kind];
  return '<div class="ms-row' + (x.got ? ' got' : done ? ' ready' : '') + '">' +
    '<div class="ms-body"><strong>' + escapeHtml(missionText(x)) + '</strong>' +
    '<i class="ach-bar"><i style="width:' + Math.round(x.prog / x.goal * 100) + '%"></i></i>' +
    '<em>' + x.prog + '/' + x.goal + ' · ' + spiritIcon() + ' ' + rw.points + '</em></div>' +
    (x.got ? '<span class="ms-ok">✓</span>' : '<button class="btn btn-primary btn-tiny"' + (done ? '' : ' disabled') + ' onclick="actionClaimMission(\'' + kind + '\',' + i + ')">Cobrar</button>') +
  '</div>';
}
function renderMissions() {
  var m = engageMissions(), allDaily = m.daily.every(function (x) { return x.got; });
  var now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  var h = Math.max(1, Math.ceil((mid - now) / 36e5));
  return '<div class="screen">' + pageTopHtml('actionBackToMenu()', 'Misiones', '🎯') +
    '<div class="panel"><h3 class="prof-h3">Del día <span class="dim small">· nuevas en ' + h + ' h</span></h3>' +
      m.daily.map(function (x, i) { return missionRowHtml(x, i, 'd'); }).join('') +
      '<div class="ms-row ms-bonus' + (m.dailyBonus ? ' got' : allDaily ? ' ready' : '') + '"><div class="ms-body"><strong>Premio del día</strong><em>Cobra las tres: tirada gratis y 30 puntos</em></div>' +
        (m.dailyBonus ? '<span class="ms-ok">✓</span>' : '<button class="btn btn-primary btn-tiny"' + (allDaily ? '' : ' disabled') + ' onclick="actionClaimMissionBonus()">Abrir</button>') + '</div>' +
    '</div>' +
    '<div class="panel"><h3 class="prof-h3">De la semana <span class="dim small">· nuevas el lunes</span></h3>' +
      m.weekly.map(function (x, i) { return missionRowHtml(x, i, 'w'); }).join('') +
    '</div>' +
    '<p class="dim small center-text">Todos los modos cuentan. Cada misión da también experiencia para la temporada.</p>' +
  '</div>';
}
window.actionClaimSeason = function (lv) {
  if (!seasonReady(lv)) return;
  seasonState().got.push(lv);
  var txt = engageGive(seasonReward(lv));
  if (typeof fxToast === 'function') fxToast('🏅 Nivel ' + lv + ': ' + txt, 'good');
  if (seasonReward(lv).player && typeof fxConfetti === 'function') fxConfetti('big');
  render();
};
function renderSeason() {
  var th = seasonTheme(), lv = seasonLevel(), xp = seasonState().xp, d = seasonDaysLeft(), tr = trainerInfo(engageMeta().xpTotal);
  var rows = [];
  for (var l = 1; l <= SEASON_LEVELS; l++) {
    var rw = seasonReward(l), got = seasonState().got.indexOf(l) !== -1, ready = seasonReady(l);
    rows.push('<div class="ss-row' + (got ? ' got' : ready ? ' ready' : l <= lv ? '' : ' lock') + (rw.player ? ' star' : '') + '">' +
      '<span class="ss-n">' + l + '</span><span class="ss-ico">' + engageRewardIcon(rw) + '</span><strong>' + escapeHtml(engageRewardText(rw)) + '</strong>' +
      (got ? '<span class="ms-ok">✓</span>' : ready ? '<button class="btn btn-primary btn-tiny" onclick="actionClaimSeason(' + l + ')">Cobrar</button>' : '<span class="dim small">🔒</span>') + '</div>');
  }
  return '<div class="screen">' + pageTopHtml('actionBackToMenu()', 'Temporada', th.icon) +
    '<div class="panel eg-season-head" style="--sc:' + th.color + '"><span class="eg-lv big"><small>Nivel</small><b>' + lv + '</b></span>' +
      '<div class="eg-body"><strong>' + escapeHtml(th.name) + '</strong><span class="dim small">' + (d === 1 ? 'Acaba hoy' : 'Quedan ' + d + ' días') + '</span>' +
      '<i class="eg-bar"><i style="width:' + (lv >= SEASON_LEVELS ? 100 : xp % SEASON_XP) + '%"></i></i><em>' + (lv >= SEASON_LEVELS ? 'Completa' : xp % SEASON_XP + '/' + SEASON_XP + ' de experiencia') + '</em></div></div>' +
    '<div class="panel eg-trainer"><strong>📈 Entrenador nivel ' + tr.lv + '</strong><i class="eg-bar"><i style="width:' + Math.round(tr.xp / tr.need * 100) + '%"></i></i><em class="dim small">' + tr.xp + '/' + tr.need + ' · cada nivel da Puntos de Espíritu</em></div>' +
    '<p class="dim small center-text">Ganas experiencia en cualquier modo, con las misiones y con la racha. Cada mes empieza una temporada nueva: cobra antes lo que tengas.</p>' +
    '<div class="panel">' + rows.join('') + '</div>' +
  '</div>';
}

/* ===== Fichajes: garantía, equipo destacado y álbumes ===== */
var GACHA_PITY = 10;
// equipo destacado de la semana (de los que tienen al menos 12 jugadores)
function featuredTeam() {
  var count = {};
  ROSTER.forEach(function (p) { if (p.locked && p.equipo) count[p.equipo] = (count[p.equipo] || 0) + 1; });
  var teams = Object.keys(count).filter(function (t) { return count[t] >= 12; }).sort();
  if (!teams.length) return null;
  var w = engageWeek().n;
  return teams[((w % teams.length) + teams.length) % teams.length];
}
// elige el fichaje de la tirada: garantía de oro y más probabilidad del destacado
function engagePickGacha(pool) {
  var m = engageMeta(), list = pool;
  var top = pool.filter(function (p) { var r = gachaRarityOf(p); return r === 'oro' || r === 'vibranium'; });
  if (m.gachaPity >= GACHA_PITY - 1 && top.length) list = top;
  var ft = featuredTeam();
  if (ft && Math.random() < 0.5) {
    var fp = list.filter(function (p) { return p.equipo === ft; });
    if (fp.length) list = fp;
  }
  var won = choice(list), r = gachaRarityOf(won);
  m.gachaPity = r === 'oro' || r === 'vibranium' ? 0 : m.gachaPity + 1;
  return won;
}
function gachaExtrasHtml() {
  var m = engageMeta(), ft = featuredTeam(), left = GACHA_PITY - m.gachaPity;
  var ftHtml = '';
  if (ft) {
    var all = ROSTER.filter(function (p) { return p.equipo === ft && p.locked; });
    var own = all.filter(function (p) { return m.unlocked.indexOf(p.id) !== -1; }).length;
    ftHtml = '<div class="eg-featured"><img src="' + escapeHtml(teamShieldPath(ft)) + '" alt=""><div><strong>Destacado de la semana: ' + escapeHtml(ft) + '</strong><span class="dim small">La mitad de las tiradas salen de este equipo · tienes ' + own + '/' + all.length + '</span></div></div>';
  }
  return ftHtml + '<p class="eg-pity">⭐ Jugador de oro seguro como mucho en <strong>' + left + (left === 1 ? ' tirada' : ' tiradas') + '</strong></p>' +
    (m.freeSpins ? '<button class="btn btn-primary btn-block mt" onclick="spinGacha(true)">Tirada gratis <span class="btn-cost">' + m.freeSpins + '</span></button>' : '');
}
// álbum de cada equipo: los jugadores de su plantilla que hay que fichar
// (los que vienen abiertos de serie no cuentan)
function albumList() {
  var m = G.meta, by = {};
  ROSTER.forEach(function (p) {
    if (!p.equipo || !p.locked) return;
    var a = by[p.equipo] || (by[p.equipo] = { team: p.equipo, total: 0, own: 0 });
    a.total++;
    if (m.unlocked.indexOf(p.id) !== -1) a.own++;
  });
  var claimed = engageMeta().albums;
  return Object.keys(by).map(function (k) { var a = by[k]; a.left = a.total - a.own; a.claimed = claimed.indexOf(k) !== -1; return a; })
    .filter(function (a) { return a.total >= 4; })
    .sort(function (a, b) { return (a.claimed - b.claimed) || ((b.left === 0) - (a.left === 0)) || (b.own / b.total - a.own / a.total); });
}
function albumReward(a) { return 50 + a.total * 5; }
window.actionClaimAlbum = function (team) {
  var a = albumList().filter(function (x) { return x.team === team; })[0];
  if (!a || a.claimed || a.left) return;
  engageMeta().albums.push(team);
  G.meta.points += albumReward(a);
  var extra = '';
  if (typeof TEAM_SHIELD_FILES !== 'undefined' && TEAM_SHIELD_FILES[team]) {
    G.meta.unlockedShields = G.meta.unlockedShields || [];
    if (G.meta.unlockedShields.indexOf(team) === -1) { G.meta.unlockedShields.push(team); extra = ' y su escudo'; }
  }
  engageAddXp(50);
  saveMeta(G.meta);
  if (typeof fxToast === 'function') fxToast('📖 Álbum de ' + team + ' completo: +' + albumReward(a) + ' puntos' + extra, 'good');
  if (typeof fxConfetti === 'function') fxConfetti('big');
  render();
};
window.actionToggleAlbums = function () { G.albumsOpen = !G.albumsOpen; render(); };
function albumsHtml() {
  var list = albumList(), show = G.albumsOpen ? list : list.slice(0, 6);
  var done = list.filter(function (a) { return a.claimed; }).length;
  return '<div class="panel"><h3 style="margin-bottom:4px">Álbumes por equipo</h3>' +
    '<p class="dim small">Completa la plantilla de un equipo para cobrar su premio y su escudo. Completados: ' + done + '/' + list.length + '</p>' +
    show.map(function (a) {
      return '<div class="ms-row' + (a.claimed ? ' got' : !a.left ? ' ready' : '') + '"><img class="eg-alb-shield" src="' + escapeHtml(teamShieldPath(a.team)) + '" alt="">' +
        '<div class="ms-body"><strong>' + escapeHtml(a.team) + '</strong><i class="ach-bar"><i style="width:' + Math.round(a.own / a.total * 100) + '%"></i></i><em>' + a.own + '/' + a.total + ' · ' + spiritIcon() + ' ' + albumReward(a) + '</em></div>' +
        (a.claimed ? '<span class="ms-ok">✓</span>' : '<button class="btn btn-primary btn-tiny"' + (a.left ? ' disabled' : '') + ' onclick="actionClaimAlbum(\'' + escapeHtml(a.team).replace(/'/g, '\\\'') + '\')">Cobrar</button>') + '</div>';
    }).join('') +
    '<button class="btn btn-outline btn-block mt" onclick="actionToggleAlbums()">' + (G.albumsOpen ? 'Ver menos' : 'Ver todos') + '</button></div>';
}

/* ===== Jugar contra el once que te comparten ===== */
// tu último once de FutDraft (se guarda al compartirlo o al acabar el draft)
function engageSaveMySquad(summary) { if (summary && summary.lineup && summary.lineup.length) { engageMeta().mySquad = summary; saveMeta(G.meta); } }
window.actionPlaySharedSquad = function () {
  var mine = engageMeta().mySquad, theirs = G.futdraftSharedSquad;
  if (!mine || !theirs) return;
  var a = futDraftRebuildSharedSquad(mine), b = futDraftRebuildSharedSquad(theirs);
  if (a.lineup.length < 11 || b.lineup.length < 11) { if (typeof fxToast === 'function') fxToast('Alguna plantilla está incompleta'); return; }
  var tac = function () { return { style: 'equilibrado', foul: 'medio', intensity: 'media' }; };
  G.futdraftVs = {
    names: { A: 'Tu equipo', B: 'Su equipo' }, shields: { A: G.meta.equippedShield || '', B: '' },
    squadA: a.lineup.map(function (s) { return s.player; }).concat(a.bench), squadB: b.lineup.map(function (s) { return s.player; }).concat(b.bench),
    formationId: mine.formation, formationBy: { A: mine.formation, B: theirs.formation },
    lineupA: a.lineup, lineupB: b.lineup, benchA: a.bench, benchB: b.bench,
    captainA: mine.captainId || null, captainB: theirs.captainId || null,
    coachBy: { A: null, B: null }, tacticsBy: { A: tac(), B: tac() }, prepTurn: 'B', fromShare: true
  };
  G.screen = 'futdraftVsReady';
  render();
};
function sharedSquadPlayHtml() {
  var mine = engageMeta().mySquad;
  return mine
    ? '<button class="btn btn-primary btn-block" onclick="actionPlaySharedSquad()">Jugar contra este once</button><p class="dim small center-text">Con tu último once de FutDraft</p>'
    : '<p class="dim small center-text">Haz un FutDraft para jugar contra este once con el tuyo.</p>';
}
// resumen de un once de FutDraft (el mismo formato que el enlace de compartir)
function engageSquadSummary(f) {
  if (!f || !f.lineup || f.lineup.length < 11) return null;
  return {
    mode: f.mode, formation: f.formation, captainId: f.captainId || null,
    score: typeof futDraftScoreBreakdown === 'function' ? futDraftScoreBreakdown(f.lineup, f.captainId).total : 0,
    lineup: f.lineup.map(function (s) { return { pos: s.pos, id: s.player.id }; }),
    bench: (f.bench || []).map(function (p) { return p.id; })
  };
}
