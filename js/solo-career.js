/* ---------------------------------------------------------------------
   CARRERA DE JUGADOR: la carrera de un solo futbolista, temporada a
   temporada y partido a partido, a petición explícita ("crea un modo
   carrera de 1 jugador, donde vas temporada a temporada y partido a
   partido, puedes ver, simular... con tu propio jugador, y en decidir,
   decides solo de tu jugador"). A diferencia de Modo Jugador (saltos de
   2 años), aquí juegas cada partido de tu club.
   - Creación: nombre, dorsal, posición y afinidad; tu cara (editor en
     js/solo-face.js); la primera supertécnica entre varias (con "otras
     opciones"); y la cantera en la que empiezas.
   - Cada temporada: Liga, Copa (16 equipos, a partido único), Champions
     si tu club se clasifica (top 3 de la liga anterior o club grande) y
     Supercopa si el año anterior ganaste Liga o Copa con ese club. Todo va
     en un calendario (s.cal) que se juega en orden.
   - En cada partido el míster decide si eres titular, suplente o no vas
     convocado. Partido: Jugar (Decidir, solo tu jugador), Ver o Simular.
     De suplente también juegas: entras en la segunda parte (live.subIn en
     js/match-engine.js) y desde ahí controlas tú a tu jugador.
   - Al acabar la temporada creces o bajas según edad, minutos y notas,
     te llegan ofertas de otros clubes y aprendes técnicas nuevas.
   Estado en G.solo, guardado en localStorage (SOLO_SAVE_KEY).
   --------------------------------------------------------------------- */

var SOLO_SAVE_KEY = 'inazumaTactilRoguelike_soloCareer';
var SOLO_ID = 'solo_me';
var SOLO_LEAGUE_SIZE = 12;
var SOLO_START_AGE = 16;
var SOLO_RETIRE_FROM = 32, SOLO_RETIRE_AT = 38;
var SOLO_START_OVR = { Portero: 52, Defensa: 54, Centrocampista: 55, Delantero: 56 };
var SOLO_TECH_MAX = 3;
// Primera técnica: de cualquier tipo de tu puesto y hasta esta potencia,
// 6 opciones y 3 tiradas de "otras opciones" sin repetir (a petición
// explícita: "haz que haya más técnicas aleatorias al principio para
// elegir, siempre me salen las mismas").
var SOLO_FIRST_TECH_MAX_POWER = 64;
var SOLO_FIRST_TECH_OPTIONS = 6;
var SOLO_FIRST_TECH_REROLLS = 3;
var SOLO_ROLE_LABEL = { titular: 'Titular', suplente: 'Suplente', fuera: 'No convocado', lesionado: 'Lesionado', sancionado: 'Sancionado' };
var SOLO_ROLE_ICON = { titular: '⭐', suplente: '🪑', fuera: '🚫', lesionado: '🤕', sancionado: '🟥' };
var SOLO_TABS = [
  { id: 'jornada', name: 'Partido', icon: '⚽' },
  { id: 'jugador', name: 'Jugador', icon: '👤' },
  { id: 'tecnicas', name: 'Técnicas', icon: '⚡' },
  { id: 'liga', name: 'Liga', icon: '📊' },
  { id: 'copas', name: 'Copas', icon: '🏆' },
  { id: 'historial', name: 'Palmarés', icon: '📜' }
];
// Competiciones (a petición explícita: "añade también champions, copa...").
var SOLO_COMPS = {
  liga: { name: 'Liga', icon: '🏟️' },
  copa: { name: 'Copa', icon: '🏆' },
  champions: { name: 'Champions', icon: '⭐' },
  supercopa: { name: 'Supercopa', icon: '🥇' }
};
// Antes de qué jornada de liga va cada ronda (la liga tiene 22 jornadas).
var SOLO_COPA_AT = [2, 7, 12, 17];
var SOLO_CHAMPIONS_AT = [4, 9, 14, 19];
var SOLO_CHAMPIONS_TOP = 20;

// ===== Guardado =====
function soloSave() {
  try { if (G.solo) localStorage.setItem(SOLO_SAVE_KEY, JSON.stringify(G.solo)); } catch (e) {}
}
function soloLoad() {
  try { var raw = localStorage.getItem(SOLO_SAVE_KEY); return raw ? soloMigrate(JSON.parse(raw)) : null; } catch (e) { return null; }
}
function soloDeleteSave() {
  try { localStorage.removeItem(SOLO_SAVE_KEY); } catch (e) {}
}
// Carreras guardadas antes de las copas y del editor de cara.
function soloMigrate(s) {
  if (!s) return s;
  if (!s.face) s.face = faceRandom();
  if (!s.comps) s.comps = {};
  if (!s.cal && s.league) {
    s.cal = s.league.schedule.map(function (r, md) { return { t: 'liga', md: md }; });
    s.calIdx = s.league.md;
  }
  if (s.seasonStats && !s.seasonStats.comp) s.seasonStats.comp = {};
  return s;
}

// ===== Tu jugador =====
function soloTechKinds(pos) {
  return { Portero: ['portero'], Defensa: ['defensa', 'regate', 'tiro'], Centrocampista: ['regate', 'tiro', 'defensa'], Delantero: ['tiro', 'regate'] }[pos] || ['tiro'];
}
function soloTechCost(e) { return e.power >= 80 ? 3 : (e.power >= 60 ? 2 : 1); }
// Ficha para el motor de partido: las stats salen de su media, de forma
// que futDraftPlayerScore(ficha) da justo esa media en su posición. La
// cara que te has hecho va de "sprite": se ve igual en el campo.
function soloMatchPlayer(s) {
  var o = Math.round(s.ovr);
  var st = { Portero: [o - 25, o - 10, o, o], Defensa: [o - 15, o - 3, o + 3, o], Centrocampista: [o, o + 3, o - 3, o], Delantero: [o + 3, o - 3, o - 25, o] }[s.posicion] || [o, o, o, o];
  var first = s.techs[0] ? techInfo(s.techs[0]).kind : soloTechKinds(s.posicion)[0];
  return { id: SOLO_ID, nombre: s.nombre, posicion: s.posicion, tipo: s.tipo, tiro: st[0], pase: st[1], defensa: st[2], especial: st[3], hissatsu: s.techs.slice(), tipoTecnica: first, dorsal: s.dorsal, desc: '', sprite: soloFaceUri(s) };
}
function soloFaceUri(s, bust) {
  var key = JSON.stringify(s.face || {}) + '|' + s.dorsal + '|' + (bust === false ? 0 : 1);
  soloFaceUri._c = soloFaceUri._c || {};
  if (!soloFaceUri._c[key]) soloFaceUri._c[key] = faceDataUri(s.face, bust === false ? { bust: false } : { number: s.dorsal });
  return soloFaceUri._c[key];
}
function soloElemCls(tipo) { return String(tipo || '').toLowerCase().replace('ñ', 'n'); }
function soloAvatarHtml(s, size) {
  return '<span class="solo-avatar elem-' + soloElemCls(s.tipo) + (size ? ' solo-avatar-' + size : '') + '"><img class="solo-avatar-face" src="' + soloFaceUri(s) + '" alt=""><b>' + s.dorsal + '</b></span>';
}

// ===== Equipos =====
var _soloElevenCache = {};
function soloClubEleven(name) {
  if (!_soloElevenCache[name]) _soloElevenCache[name] = qmTeamEleven(name, []);
  return _soloElevenCache[name].slice();
}
// El once de tu club contigo dentro (si juegas): sustituyes al más flojo de tu puesto.
function soloElevenWithMe(s, withMe) {
  var eleven = soloClubEleven(s.club);
  if (!withMe) return eleven;
  var same = eleven.filter(function (x) { return x.posicion === s.posicion; });
  if (!same.length) same = eleven.filter(function (x) { return x.posicion !== 'Portero'; });
  var out = same.sort(function (a, b) { return futDraftPlayerScore(a) - futDraftPlayerScore(b); })[0];
  eleven[eleven.indexOf(out)] = soloMatchPlayer(s);
  return eleven;
}
// Media del titular más flojo de un puesto en un club: la que tienes que
// superar para jugar.
function soloBarFor(club, pos) {
  var eleven = soloClubEleven(club);
  var same = eleven.filter(function (x) { return x.posicion === pos; });
  if (!same.length) same = eleven.filter(function (x) { return x.posicion !== 'Portero'; });
  return Math.round(Math.min.apply(null, same.map(futDraftPlayerScore)));
}
function soloStarterBar(s) { return soloBarFor(s.club, s.posicion); }
// Si juegas, el equipo gana o pierde lo que tú mejoras o empeoras al que sustituyes.
function soloTeamPower(s, role) {
  var base = qmPower(s.club);
  return role === 'titular' ? base + (s.ovr - soloStarterBar(s)) / 11 : base;
}
function soloClubChoices(n, center, spread, exclude, pos) {
  var teams = qmTeams().filter(function (t) { return (exclude || []).indexOf(t) === -1 && soloClubEleven(t).length >= 11; });
  return teams.map(function (t) { return { t: t, d: Math.abs(soloBarFor(t, pos) - center) + Math.random() * spread }; })
    .sort(function (a, b) { return a.d - b.d; }).slice(0, n).map(function (x) { return x.t; });
}
// Goles de un partido entre dos clubes que no son el tuyo (con su fuerza real).
function soloCpuGoals(a, b) {
  var pa = qmPower(a), pb = qmPower(b);
  return [futDraftRandomGoals(futDraftExpectedGoals(pa, pb)), futDraftRandomGoals(futDraftExpectedGoals(pb, pa))];
}
function soloShuffle(list) { return list.slice().sort(function () { return Math.random() - 0.5; }); }

// ===== Liga =====
function soloNewLeague(s) {
  var club = s.club, power = qmPower(club);
  var rivals = qmTeams().filter(function (t) { return t !== club; })
    .map(function (t) { return { t: t, d: Math.abs(qmPower(t) - power) + Math.random() * 6 }; })
    .sort(function (a, b) { return a.d - b.d; }).slice(0, SOLO_LEAGUE_SIZE - 1).map(function (x) { return x.t; });
  var teams = [club].concat(rivals);
  var first = generateRoundRobin(SOLO_LEAGUE_SIZE).sort(function () { return Math.random() - 0.5; });
  var second = first.map(function (r) { return r.map(function (fx) { return [fx[1], fx[0]]; }); });
  s.league = {
    teams: teams,
    table: teams.map(function (name) { return { name: name, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0, form: [] }; }),
    schedule: first.concat(second),
    md: 0
  };
  s.roleMd = -1;
}
function soloLeaguePosition(s) {
  var sorted = ligaSortedTable(s.league.table);
  return sorted.findIndex(function (r) { return r.idx === 0; }) + 1;
}

// ===== Copas (eliminatorias a partido único) =====
function soloKoRoundName(n) { return n === 1 ? 'Final' : n === 2 ? 'Semifinales' : n === 4 ? 'Cuartos' : n === 8 ? 'Octavos' : 'Ronda'; }
function soloKoPairs(teams) {
  var r = [];
  for (var i = 0; i + 1 < teams.length; i += 2) r.push({ a: teams[i], b: teams[i + 1], ga: null, gb: null, pa: null, pb: null, w: null });
  return r;
}
function soloNewKo(id, teams) {
  return { id: id, teams: teams.slice(), rounds: [soloKoPairs(teams)], out: false, champion: null, exit: null };
}
function soloKoMyMatch(s, comp) {
  var round = comp.rounds[comp.rounds.length - 1];
  return round.find(function (m) { return !m.w && (m.a === s.club || m.b === s.club); }) || null;
}
// Penaltis entre dos equipos: gana más a menudo el más fuerte.
function soloPenalties(powA, powB) {
  var pa = 0, pb = 0, chA = clamp(0.74 + (powA - powB) / 120, 0.55, 0.9), chB = clamp(0.74 + (powB - powA) / 120, 0.55, 0.9);
  for (var r = 1; r < 30; r++) {
    if (Math.random() < chA) pa++;
    if (Math.random() < chB) pb++;
    if (r >= 5 && pa !== pb) break;
  }
  if (pa === pb) pa++;
  return [pa, pb];
}
function soloKoSetResult(m, ga, gb, pen) {
  m.ga = ga; m.gb = gb;
  if (ga === gb) {
    var p = pen || soloPenalties(qmPower(m.a), qmPower(m.b));
    m.pa = p[0]; m.pb = p[1];
    m.w = p[0] > p[1] ? m.a : m.b;
  } else m.w = ga > gb ? m.a : m.b;
}
// Juega los partidos que quedan de la ronda actual y prepara la siguiente.
function soloKoFinishRound(comp) {
  var round = comp.rounds[comp.rounds.length - 1];
  round.forEach(function (m) {
    if (m.w) return;
    var g = soloCpuGoals(m.a, m.b);
    soloKoSetResult(m, g[0], g[1]);
  });
  var winners = round.map(function (m) { return m.w; });
  if (winners.length > 1) comp.rounds.push(soloKoPairs(winners));
  else comp.champion = winners[0];
}
// Equipos y calendario de la temporada: Liga + Copa + Champions/Supercopa.
function soloNewComps(s) {
  var lg = s.league;
  var prev = s.prevSeason || null;
  var stayed = prev && prev.club === s.club;
  s.comps = {};
  // Copa: los de tu liga y 4 más de nivel parecido.
  var extra = soloShuffle(qmTeams().filter(function (t) { return lg.teams.indexOf(t) === -1; })
    .map(function (t) { return { t: t, d: Math.abs(qmPower(t) - qmPower(s.club)) + Math.random() * 10 }; })
    .sort(function (a, b) { return a.d - b.d; }).slice(0, 4).map(function (x) { return x.t; }));
  s.comps.copa = soloNewKo('copa', soloShuffle(lg.teams.concat(extra)));
  // Champions: top 3 de tu liga el año pasado o uno de los grandes.
  var rank = qmTeams().indexOf(s.club);
  if ((stayed && prev.pos <= 3) || rank < SOLO_CHAMPIONS_TOP) {
    var elite = soloShuffle(qmTeams().slice(0, 40).filter(function (t) { return t !== s.club; })).slice(0, 15);
    s.comps.champions = soloNewKo('champions', soloShuffle([s.club].concat(elite)));
  }
  // Supercopa: campeón de Liga o Copa contra otro grande.
  if (stayed && (prev.liga || prev.copa)) {
    var rival = choice(qmTeams().slice(0, 25).filter(function (t) { return t !== s.club; }));
    s.comps.supercopa = soloNewKo('supercopa', Math.random() < 0.5 ? [s.club, rival] : [rival, s.club]);
  }
  var cal = [];
  lg.schedule.forEach(function (r, md) {
    if (md === 0 && s.comps.supercopa) cal.push({ t: 'supercopa' });
    if (SOLO_COPA_AT.indexOf(md) !== -1) cal.push({ t: 'copa' });
    if (s.comps.champions && SOLO_CHAMPIONS_AT.indexOf(md) !== -1) cal.push({ t: 'champions' });
    cal.push({ t: 'liga', md: md });
  });
  s.cal = cal;
  s.calIdx = 0;
}
// Salta (simulando) las rondas de copas en las que ya no estás.
function soloSkipDeadEvents(s) {
  while (s.calIdx < s.cal.length) {
    var ev = s.cal[s.calIdx];
    if (ev.t === 'liga') return;
    var comp = s.comps[ev.t];
    if (comp && !comp.champion && soloKoMyMatch(s, comp)) return;
    if (comp && !comp.champion) soloKoFinishRound(comp);
    s.calIdx++;
  }
}

// ===== Próximo partido =====
function soloMyFixture(s) {
  if (!s.cal || s.calIdx >= s.cal.length) return null;
  var ev = s.cal[s.calIdx];
  if (ev.t === 'liga') {
    var lg = s.league;
    var fx = lg.schedule[ev.md].find(function (f) { return f[0] === 0 || f[1] === 0; });
    var home = fx[0] === 0;
    return { comp: 'liga', ko: false, fx: fx, md: ev.md, home: home, opp: lg.teams[home ? fx[1] : fx[0]], label: 'Jornada ' + (ev.md + 1) };
  }
  var comp = s.comps[ev.t];
  var m = comp && soloKoMyMatch(s, comp);
  if (!m) return null;
  var round = comp.rounds[comp.rounds.length - 1];
  var roundName = soloKoRoundName(round.length);
  return { comp: ev.t, ko: true, m: m, home: m.a === s.club, opp: m.a === s.club ? m.b : m.a, roundName: roundName, label: roundName, final: round.length === 1 };
}

// ===== Rol en cada partido =====
function soloRoleFor(s) {
  if (s.roleMd === s.calIdx && s.role) return s.role;
  var role;
  if (s.injury > 0) role = 'lesionado';
  else if (s.suspended > 0) role = 'sancionado';
  else {
    var notas = s.seasonStats.notas.slice(-3);
    var form = notas.length ? (notas.reduce(function (a, b) { return a + b; }, 0) / notas.length - 6.5) * 2 : 0;
    var mine = s.ovr + (s.happiness - 50) * 0.12 + form - (s.cantera ? 2 : 0);
    var diff = mine - soloStarterBar(s);
    var pTit = clamp(0.5 + diff * 0.07, 0.04, 0.96);
    if (Math.random() < pTit) role = 'titular';
    else role = diff > -16 || Math.random() < 0.35 ? 'suplente' : 'fuera';
  }
  s.role = role;
  s.roleMd = s.calIdx;
  soloSave();
  return role;
}

// ===== Partido =====
// Nota del partido (de 3 a 10) según goles, asistencias, resultado y puesto.
function soloRating(s, res) {
  var n = 6 + res.gls * 1.2 + res.ast * 0.7 + (res.myG > res.oppG ? 0.5 : res.myG < res.oppG ? -0.4 : 0) + (s.ovr - qmPower(res.opp)) / 25 + (Math.random() * 1.6 - 0.8);
  if (s.posicion === 'Portero' || s.posicion === 'Defensa') n += res.oppG === 0 ? 0.8 : -0.3 * Math.min(res.oppG, 4);
  if (res.role === 'suplente') n = 6 + (n - 6) * 0.6;
  return Math.round(clamp(n, 3, 10) * 10) / 10;
}
// De suplente sin ver tu entrada (Simular o saltar): goles y asistencias
// tuyos al azar desde el minuto en que entras.
function soloBenchContribution(s, timeline, entry) {
  if (s.posicion === 'Portero') return;
  var me = soloMatchPlayer(s);
  var pg = { Delantero: 0.3, Centrocampista: 0.18, Defensa: 0.06 }[s.posicion] || 0;
  var pa = { Delantero: 0.12, Centrocampista: 0.25, Defensa: 0.1 }[s.posicion] || 0;
  timeline.forEach(function (ev) {
    if (ev.side !== 'me' || ev.minute < entry) return;
    if (Math.random() < pg) ev.scorer = me;
    else if (Math.random() < pa) ev.assist = me;
    if (ev.assist && ev.scorer && ev.assist.id === ev.scorer.id) ev.assist = null;
  });
}
// Simular: goles por la fuerza de cada equipo, con tu media dentro si juegas.
function soloSimulateScore(s, role, fix) {
  var myPow = soloTeamPower(s, role) + (fix.home ? 2 : 0);
  var oppPow = qmPower(fix.opp) + (fix.home ? 0 : 2);
  var myG = futDraftRandomGoals(futDraftExpectedGoals(myPow, oppPow));
  var oppG = futDraftRandomGoals(futDraftExpectedGoals(oppPow, myPow));
  var mine = soloElevenWithMe(s, role === 'titular');
  var theirs = qmTeamEleven(fix.opp, mine.map(function (p) { return p.id; }));
  var timeline = futDraftBuildTimeline(myG, oppG, mine, theirs);
  var me = soloMatchPlayer(s);
  var entry = role === 'suplente' ? rand(55, 72) : 0;
  timeline.forEach(function (ev) {
    if (ev.side !== 'me') return;
    if (role === 'titular' && s.posicion !== 'Portero' && (!ev.scorer || ev.scorer.id !== SOLO_ID)) {
      var extra = ({ Delantero: 0.1, Centrocampista: 0.05, Defensa: 0.01 }[s.posicion] || 0) + clamp((s.ovr - soloStarterBar(s)) / 60, 0, 0.2);
      if (Math.random() < extra) ev.scorer = me;
    }
    if (ev.assist && ev.scorer && ev.assist.id === ev.scorer.id) ev.assist = null;
  });
  if (role === 'suplente') soloBenchContribution(s, timeline, entry);
  var pen = null;
  if (fix.ko && myG === oppG) pen = soloPenalties(myPow, oppPow);
  return { myG: myG, oppG: oppG, timeline: timeline, entry: entry, pen: pen };
}
// Crecimiento según cómo juegas, pero no partido a partido: cada partido
// suma a una bolsa (s.growthPool) y la media cambia en la revisión de
// cada SOLO_GROWTH_EVERY partidos y al acabar la temporada.
var SOLO_IN_SEASON_SHARE = 0.6;
var SOLO_GROWTH_EVERY = 6;
function soloMatchGrowth(s, nota, role, won, lost) {
  var base = soloAgeGrowth(s.age), per = base / 26;
  var g;
  if (nota === null) g = base > 0 ? per * 0.15 : per * 0.5;
  else {
    g = base > 0 ? per * SOLO_IN_SEASON_SHARE * (nota / 6.5) * (role === 'titular' ? 1 : 0.6) : per * SOLO_IN_SEASON_SHARE * (nota >= 7.5 ? 0.5 : 1);
    g += won ? 0.04 : lost ? -0.03 : 0;
    g += nota >= 8 ? 0.06 : nota < 5 ? -0.06 : 0;
  }
  s.growthPool = (s.growthPool || 0) + g;
  s.growthCount = (s.growthCount || 0) + 1;
  return s.growthCount >= SOLO_GROWTH_EVERY ? soloApplyGrowthPool(s) : 0;
}
function soloApplyGrowthPool(s) {
  var before = s.ovr;
  s.ovr = Math.round(clamp(s.ovr + (s.growthPool || 0), 40, Math.max(s.pot, before)) * 100) / 100;
  s.growthPool = 0;
  s.growthCount = 0;
  return Math.round((s.ovr - before) * 100) / 100;
}
function soloFmtDelta(d) { return (d >= 0 ? '+' : '') + (Math.round(d * 10) / 10).toFixed(1).replace('.', ','); }
// Aplica tu partido (de cualquier competición) y avanza el calendario.
// r.pen: [tus penaltis, los suyos] si fue eliminatoria con empate.
function soloApplyMatch(s, r) {
  var fix = soloMyFixture(s);
  var role = r.role;
  s.eventMessage = null; s.seasonNote = null;
  var played = role === 'titular' || role === 'suplente';
  var notes = [];
  var penMine = null;
  if (fix.comp === 'liga') {
    var lg = s.league;
    var hg = fix.home ? r.myG : r.oppG, ag = fix.home ? r.oppG : r.myG;
    ligaApplyResult(lg.table, fix.fx[0], fix.fx[1], hg, ag);
    lg.schedule[fix.md].forEach(function (f) {
      if (f === fix.fx) return;
      var g = soloCpuGoals(lg.teams[f[0]], lg.teams[f[1]]);
      ligaApplyResult(lg.table, f[0], f[1], g[0], g[1]);
    });
    lg.md = fix.md + 1;
  } else {
    var comp = s.comps[fix.comp], m = fix.m;
    var pen = r.myG === r.oppG ? (r.pen || soloPenalties(qmPower(s.club), qmPower(fix.opp))) : null;
    penMine = pen;
    if (fix.home) soloKoSetResult(m, r.myG, r.oppG, pen);
    else soloKoSetResult(m, r.oppG, r.myG, pen ? [pen[1], pen[0]] : null);
    var won = m.w === s.club;
    soloKoFinishRound(comp);
    if (!won) {
      comp.out = true;
      comp.exit = fix.final ? 'Subcampeón' : fix.roundName;
      notes.push(fix.final ? '🥈 Perdéis la final de la ' + SOLO_COMPS[fix.comp].name : '❌ Eliminados de la ' + SOLO_COMPS[fix.comp].name + ' en ' + fix.roundName.toLowerCase());
    } else if (comp.champion === s.club) {
      s.titles.push({ season: s.season, club: s.club, name: SOLO_COMPS[fix.comp].name });
      if (typeof profileTitle === 'function') profileTitle(fix.comp);
      s.techPoints++;
      s.happiness = clamp(s.happiness + 6, 0, 100);
      s.fame = clamp(s.fame + (fix.comp === 'champions' ? 10 : 4), 0, 100);
      notes.push('🏆 ¡Campeones de la ' + SOLO_COMPS[fix.comp].name + '! (+1 punto de técnica)');
      if (typeof awardSpiritPoints === 'function') awardSpiritPoints(fix.comp === 'champions' ? 40 : 15);
      if (typeof fxToast === 'function') fxToast('🏆 ¡Campeones de la ' + SOLO_COMPS[fix.comp].name + '!', 'good');
    } else notes.push('✅ Pasáis a ' + soloKoRoundName(comp.rounds[comp.rounds.length - 1].length).toLowerCase());
  }
  var gls = 0, ast = 0;
  (r.timeline || []).forEach(function (ev) {
    if (ev.side !== 'me') return;
    if (ev.scorer && ev.scorer.id === SOLO_ID) gls++;
    else if (ev.assist && ev.assist.id === SOLO_ID) ast++;
  });
  var ss = s.seasonStats;
  var nota = null;
  ss.mt = (ss.mt || 0) + 1;
  if (played) {
    nota = soloRating(s, { gls: gls, ast: ast, myG: r.myG, oppG: r.oppG, opp: fix.opp, role: role });
    ss.pj++; if (role === 'titular') ss.tit++;
    ss.gls += gls; ss.ast += ast; ss.notas.push(nota);
    var cs = ss.comp[fix.comp] = ss.comp[fix.comp] || { pj: 0, gls: 0, ast: 0 };
    cs.pj++; cs.gls += gls; cs.ast += ast;
    s.totals.pj++; s.totals.gls += gls; s.totals.ast += ast;
    var mood = role === 'titular' ? (nota - 6.3) * 1.8 : (nota - 6.3) * 1;
    s.happiness = clamp(Math.round(s.happiness + mood + (r.myG > r.oppG ? 0.5 : 0)), 0, 100);
    if (nota >= 8.5) {
      ss.mvp++;
      notes.push('⭐ Mejor jugador del partido');
      if (ss.mvp % 2 === 0) { s.techPoints++; notes.push('Ganas un punto de técnica'); }
    }
    if (Math.random() < 0.025) { s.injury = rand(1, 3); notes.push('🤕 Te lesionas: baja ' + s.injury + ' partido' + (s.injury === 1 ? '' : 's')); }
    else if (Math.random() < 0.015) { s.suspended = 1; notes.push('🟥 Ves la roja: te pierdes el próximo partido'); }
  } else {
    if (role === 'lesionado') s.injury = Math.max(0, s.injury - 1);
    else if (role === 'sancionado') s.suspended = Math.max(0, s.suspended - 1);
    else s.happiness = clamp(s.happiness - 1, 0, 100);
  }
  if (typeof profileRecord === 'function') profileRecord('jugador', r.myG, r.oppG, penMine ? penMine[0] > penMine[1] : null, fix.opp);
  var growth = soloMatchGrowth(s, nota, role, r.myG > r.oppG, r.myG < r.oppG);
  s.lastMatch = { growth: growth, comp: fix.comp, label: fix.label, opp: fix.opp, home: fix.home, myG: r.myG, oppG: r.oppG, pen: penMine, role: role, nota: nota, gls: gls, ast: ast, notes: notes, entry: r.entry || null };
  s.calIdx++;
  s.role = null; s.roleMd = -1;
  soloSkipDeadEvents(s);
  if (s.calIdx >= s.cal.length) soloEndSeason(s);
  soloSave();
}
window.actionSoloSimMatch = function () {
  var s = G.solo;
  if (!s || s.phase !== 'season') return;
  var fix = soloMyFixture(s);
  if (!fix) return;
  var role = soloRoleFor(s);
  var r = soloSimulateScore(s, role, fix);
  r.role = role;
  soloApplyMatch(s, r);
  render();
};
// Simula seguidos el resto de partidos de la temporada.
window.actionSoloSimSeason = function () {
  var s = G.solo;
  if (!s || s.phase !== 'season') return;
  var played = 0, ovr0 = s.ovr, n = 0;
  var incidents = [];
  for (var guard = 0; guard < 80 && s.phase === 'season'; guard++) {
    var fix = soloMyFixture(s);
    if (!fix) break;
    var role = soloRoleFor(s);
    var r = soloSimulateScore(s, role, fix);
    r.role = role;
    soloApplyMatch(s, r);
    n++;
    if (s.lastMatch.nota !== null) played++;
    (s.lastMatch.notes || []).forEach(function (t) { if (/🤕|🟥|🏆|❌|🥈/.test(t)) incidents.push(t); });
  }
  s.simNote = 'Simulados ' + n + ' partidos: jugaste ' + played + ' (media ' + soloFmtDelta(s.ovr - ovr0) + ').' + (incidents.length ? ' ' + incidents.join(' · ') : '');
  soloSave();
  render();
};

// Jugar (Decidir) o Ver: el motor en tiempo real con tu club y tu jugador.
// De suplente empiezas en el banquillo y entras en la segunda parte
// (live.subIn); en Jugar, desde que entras el partido se para cuando la
// jugada pasa por ti.
window.actionSoloLiveMatch = function (mode) {
  var s = G.solo;
  if (!s || s.phase !== 'season') return;
  var fix = soloMyFixture(s);
  if (!fix) return;
  var role = soloRoleFor(s);
  var canPlay = role === 'titular' || role === 'suplente';
  var decide = mode === 'decide' && canPlay;
  var eleven = soloElevenWithMe(s, role === 'titular');
  var elevenB = qmTeamEleven(fix.opp, eleven.map(function (x) { return x.id; }));
  var myPow = Math.round(soloTeamPower(s, role) + (fix.home ? 2 : 0));
  var oppPow = Math.round(qmPower(fix.opp) + (fix.home ? 0 : 2));
  G.soloSavedFutdraft = G.futdraft;
  G.futdraft = {
    lineup: qmLineupOf(eleven), squad: eleven.slice(), captainId: null, formation: QM_FORMATION, condition: 'ninguna',
    tactics: { foul: 'medio', intensity: 'media' }, teamScoreOverride: myPow,
    oppPlayersOverride: elevenB, oppGhostPool: elevenB
  };
  var sim = futDraftSimulateMatchCore(oppPow);
  G.futdraft.live = {
    oppSide: { name: fix.opp }, modifier: sim.modifier,
    minute: 0, pending: decide ? [] : sim.timeline.slice(), revealed: [],
    myGoals: 0, oppGoals: 0, finalMyGoals: decide ? 0 : sim.myGoals, finalOppGoals: decide ? 0 : sim.oppGoals,
    myAtk: sim.myAtk, myDef: sim.myDef, effectiveOppPower: sim.effectiveOppPower,
    inExtraTime: false, allowDraw: !fix.ko, onFinish: finishSoloLiveMatch,
    isCareer: false, isWorldTour: false, youAreHome: fix.home, decide: decide, decideSolo: decide ? SOLO_ID : null,
    youName: s.club, youShield: teamShieldPath(s.club),
    oppFormation: { id: 'real', rows: qmRowsOf(elevenB) },
    subIn: role === 'suplente' ? { minute: rand(55, 70), player: soloMatchPlayer(s) } : null,
    soloMatch: { opp: fix.opp, oppPow: oppPow, myPow: myPow, role: role, comp: fix.comp, label: fix.label, ko: fix.ko },
    visualMode: 'dots', done: false
  };
  G.screen = 'futdraftLive';
  if (typeof playKickoffSound === 'function') playKickoffSound();
  render();
  futDraftLiveTick();
};
function finishSoloLiveMatch() {
  var s = G.solo;
  var live = G.futdraft.live;
  var sm = live.soloMatch;
  var myG = live.finalMyGoals, oppG = live.finalOppGoals;
  // Eliminatoria empatada tras la prórroga: tanda de penaltis.
  if (sm.ko && futDraftLivePenaltyGate(live, sm.opp, sm.myPow - sm.oppPow, myG === oppG, finishSoloLiveMatch)) return;
  var pen = sm.ko && myG === oppG && live.penaltyResult ? [live.penaltyResult.myGoals, live.penaltyResult.oppGoals] : null;
  var timeline = live.revealed.slice();
  // Suplente que no llegó a ver su entrada (saltó la simulación).
  var entry = live.subIn ? (live.subIn.done ? live.subIn.at : live.subIn.minute) : null;
  if (sm.role === 'suplente' && live.subIn && !live.subIn.done) soloBenchContribution(s, timeline, entry);
  soloApplyMatch(s, { myG: myG, oppG: oppG, timeline: timeline, role: sm.role, pen: pen, entry: entry });
  var lm = s.lastMatch;
  var won = sm.ko ? (pen ? pen[0] > pen[1] : myG > oppG) : myG > oppG;
  G.futdraft.lastMatchResult = {
    oppName: sm.opp, oppShield: teamShieldPath(sm.opp), oppPower: sm.oppPow,
    myGoals: myG, oppGoals: oppG, playerWon: won,
    penalty: pen ? { myGoals: pen[0], oppGoals: pen[1] } : null,
    timeline: timeline, modifier: live.modifier, youAreHome: lm.home,
    youName: s.club, youShield: teamShieldPath(s.club), youPower: sm.myPow,
    _profileDone: true,
    kicker: SOLO_COMPS[sm.comp].name + ' · ' + sm.label + (lm.nota !== null ? ' · Tu nota ' + lm.nota : ''),
    buttonsHtml: '<button class="btn btn-primary btn-block mt" onclick="actionSoloBackFromMatch()">Volver a tu carrera</button>'
  };
  G.futdraft.live = null;
  G.screen = 'futdraftMatchResult';
  render();
}
window.actionSoloBackFromMatch = function () {
  G.futdraft = G.soloSavedFutdraft || null;
  G.soloSavedFutdraft = null;
  G.screen = 'soloCareer';
  if (G.solo) G.solo.tab = 'jornada';
  render();
};

// ===== Final de temporada =====
function soloAgeGrowth(age) {
  if (age <= 18) return 5;
  if (age <= 21) return 4;
  if (age <= 24) return 2.5;
  if (age <= 27) return 1;
  if (age <= 30) return 0;
  if (age <= 32) return -1.5;
  return -3;
}
function soloCompOutcome(s, id) {
  var c = s.comps && s.comps[id];
  if (!c) return null;
  if (c.champion === s.club) return 'Campeón';
  return c.exit || (c.champion ? 'Eliminado' : null);
}
/* Veteranía (de los 27 en adelante, cuando la media ya apenas sube): cada
   temporada un objetivo según el puesto; si lo cumples, la media sube 1,5,
   ganas un punto de técnica, fama y Puntos de Espíritu. Con el club contento
   y fuera de la cantera, además, eres el capitán. */
function soloSetVeteranGoal(s) {
  if (s.age < 27) { s.vetGoal = null; s.captain = false; return; }
  var pos = s.posicion;
  s.vetGoal = pos === 'Delantero' ? { kind: 'gls', target: 15, label: 'Marca 15 goles' }
    : pos === 'Centrocampista' ? { kind: 'ga', target: 14, label: 'Suma 14 goles y asistencias' }
    : { kind: 'nota', target: 7, label: 'Nota media de 7 en 15 partidos' };
  s.captain = !s.cantera && s.happiness >= 65;
}
function soloVeteranValue(s) {
  var g = s.vetGoal, ss = s.seasonStats;
  if (!g || !ss) return 0;
  if (g.kind === 'gls') return ss.gls;
  if (g.kind === 'ga') return ss.gls + ss.ast;
  if (ss.pj < 15 || !ss.notas.length) return 0;
  return Math.round(ss.notas.reduce(function (a, b) { return a + b; }, 0) / ss.notas.length * 10) / 10;
}
function soloVeteranDone(s) { return !!s.vetGoal && soloVeteranValue(s) >= s.vetGoal.target; }
function soloEndSeason(s) {
  var lg = s.league, ss = s.seasonStats;
  var vetDone = soloVeteranDone(s);
  var pos = soloLeaguePosition(s);
  var avg = ss.notas.length ? ss.notas.reduce(function (a, b) { return a + b; }, 0) / ss.notas.length : 0;
  var champion = pos === 1;
  var ratio = ss.pj / Math.max(1, ss.mt || lg.schedule.length);
  var base = soloAgeGrowth(s.age);
  var delta = base * (base > 0 ? (0.45 + 0.55 * ratio) * (avg ? clamp(avg / 6.5, 0.7, 1.3) : 0.8) : 1) + (Math.random() * 1.4 - 0.7);
  delta *= 1 - SOLO_IN_SEASON_SHARE;
  soloApplyGrowthPool(s);
  var ovrBefore = Math.round(s.seasonStartOvr != null ? s.seasonStartOvr : s.ovr);
  s.ovr = Math.round((delta > 0 ? Math.min(s.pot, s.ovr + delta) : Math.max(40, s.ovr + delta)) * 100) / 100;
  if (champion) {
    s.titles.push({ season: s.season, club: s.club, name: 'Liga' });
    if (typeof profileTitle === 'function') profileTitle('liga');
    s.happiness = clamp(s.happiness + 8, 0, 100);
    s.techPoints++;
  }
  s.techPoints++;
  if (vetDone) {
    s.ovr = Math.round(Math.min(s.pot + 3, s.ovr + 1.5) * 100) / 100;
    s.pot = Math.max(s.pot, Math.round(s.ovr));
    s.techPoints++;
    s.fame = clamp(s.fame + 5, 0, 100);
    if (typeof awardSpiritPoints === 'function') awardSpiritPoints(40);
    if (typeof fxToast === 'function') fxToast('🎖️ Objetivo de veterano cumplido: ' + s.vetGoal.label, 'good');
  }
  if (s.captain) s.fame = clamp(s.fame + 3, 0, 100);
  s.fame = clamp(Math.round(s.fame + (avg ? (avg - 6.3) * 6 : -2) + (champion ? 5 : 0) + Math.min(ss.gls + ss.ast, 30) * 0.2), 0, 100);
  var copa = soloCompOutcome(s, 'copa'), champ = soloCompOutcome(s, 'champions'), sup = soloCompOutcome(s, 'supercopa');
  var rec = { vet: vetDone, captain: !!s.captain, season: s.season, age: s.age, club: s.club, cantera: !!s.cantera, pj: ss.pj, tit: ss.tit, gls: ss.gls, ast: ss.ast, nota: avg ? Math.round(avg * 10) / 10 : null, mvp: ss.mvp, pos: pos, ovrBefore: ovrBefore, ovrAfter: Math.round(s.ovr), champion: champion, happiness: s.happiness, matches: ss.mt || lg.schedule.length, copa: copa, champions: champ, supercopa: sup };
  s.history.push(rec);
  s.lastSeason = rec;
  s.prevSeason = { club: s.club, pos: pos, liga: champion, copa: copa === 'Campeón' };
  s.age++;
  s.learnOptions = null;
  s.offers = soloGenerateOffers(s, avg);
  s.stayAllowed = s.happiness >= 30;
  s.phase = s.age > SOLO_RETIRE_AT ? 'retired' : 'offers';
  if (typeof awardSpiritPoints === 'function') awardSpiritPoints(15 + (champion ? 30 : 0));
}
// Ofertas de otros clubes: mejores cuanto mejor ha ido la temporada.
function soloGenerateOffers(s, avg) {
  var good = avg ? avg - 6.4 : -1;
  var n = clamp(1 + (good > 0.4 ? 1 : 0) + (good > 1 ? 1 : 0) + (s.happiness < 30 ? 1 : 0), 1, 3);
  var target = s.ovr + good * 5 + s.fame / 20;
  var picks = soloClubChoices(8, target, 10, [s.club], s.posicion).sort(function () { return Math.random() - 0.5; }).slice(0, n);
  return picks.map(function (club) {
    var bar = soloBarFor(club, s.posicion);
    return { club: club, power: qmPower(club), promise: s.ovr >= bar - 2 ? 'Titular' : (s.ovr >= bar - 10 ? 'Rotación' : 'Suplente'), champions: qmTeams().indexOf(club) < SOLO_CHAMPIONS_TOP };
  });
}
window.actionSoloChooseClub = function (idx) {
  var s = G.solo;
  if (!s || s.phase !== 'offers') return;
  if (idx === 'stay') {
    if (!s.stayAllowed) return;
    if (s.cantera && (s.happiness >= 45 || s.ovr >= qmPower(s.club) - 12)) { s.cantera = false; s.eventMessage = '¡Subes al primer equipo de ' + s.club + '!'; }
    else s.eventMessage = 'Sigues en ' + s.club + '.';
    s.happiness = clamp(s.happiness + 3, 0, 100);
  } else {
    var o = s.offers[idx];
    if (!o) return;
    s.club = o.club;
    s.cantera = false;
    s.happiness = o.promise === 'Titular' ? 60 : 52;
    s.eventMessage = '¡Fichas por ' + o.club + '!';
    if (typeof fxToast === 'function') fxToast('✍️ Fichas por ' + o.club, 'good');
  }
  soloStartSeason(s);
  render();
};
window.actionSoloRetire = function () {
  var s = G.solo;
  if (!s || s.phase !== 'offers' || s.age < SOLO_RETIRE_FROM) return;
  s.phase = 'retired';
  soloSave();
  render();
};
function soloStartSeason(s) {
  s.season++;
  s.offers = null;
  s.seasonStats = { pj: 0, tit: 0, gls: 0, ast: 0, mvp: 0, notas: [], mt: 0, comp: {} };
  s.seasonStartOvr = s.ovr;
  s.lastMatch = null;
  s.simNote = null;
  s.injury = 0; s.suspended = 0;
  soloSetVeteranGoal(s);
  soloNewLeague(s);
  soloNewComps(s);
  var c = s.comps;
  var extra = [c.champions ? '⭐ Champions' : '', c.supercopa ? '🥇 Supercopa' : ''].filter(Boolean);
  s.seasonNote = 'Temporada ' + s.season + ': Liga, Copa' + (extra.length ? ', ' + extra.join(', ') : '') + '.';
  s.phase = 'season';
  s.tab = 'jornada';
  soloSave();
}

// ===== Supertécnicas =====
function soloTechPool(s, maxPower) {
  var kinds = soloTechKinds(s.posicion);
  return techCatalog().list.filter(function (e) {
    return kinds.indexOf(e.kind) !== -1 && e.power <= maxPower && s.techs.indexOf(e.name) === -1;
  });
}
// n opciones al azar: un par de tu afinidad, al menos una de cada tipo de
// tu puesto y el resto de cualquiera.
function soloPickTechOptions(pool, n, tipo, kinds) {
  var shuffled = soloShuffle(pool), out = [];
  function add(e) { if (e && out.indexOf(e) === -1 && out.length < n) out.push(e); }
  shuffled.filter(function (e) { return e.element === tipo; }).slice(0, 2).forEach(add);
  (kinds || []).forEach(function (k) { if (!out.some(function (e) { return e.kind === k; })) add(shuffled.find(function (e) { return e.kind === k && out.indexOf(e) === -1; })); });
  shuffled.forEach(add);
  return soloShuffle(out).map(function (e) { return e.name; });
}
function soloLearnOptions(s) {
  if (!s.learnOptions) {
    s.learnOptions = soloPickTechOptions(soloTechPool(s, s.ovr + 10), 5, s.tipo, soloTechKinds(s.posicion));
    soloSave();
  }
  return s.learnOptions;
}
window.actionSoloLearnTech = function (name) {
  var s = G.solo;
  var e = techCatalog().map[hissatsuTipoKey(name)];
  if (!s || !e || s.techs.indexOf(e.name) !== -1) return;
  if (s.techs.length >= SOLO_TECH_MAX) { s.techMsg = 'Ya dominas ' + SOLO_TECH_MAX + ' supertécnicas. Olvida una para aprender otra.'; render(); return; }
  var cost = soloTechCost(e);
  if (s.techPoints < cost) return;
  s.techPoints -= cost;
  s.techs.push(e.name);
  s.learnOptions = (s.learnOptions || []).filter(function (n) { return n !== e.name; });
  s.techMsg = '¡Has aprendido ' + e.name + '!';
  if (typeof fxToast === 'function') fxToast('⚡ Aprendes ' + e.name, 'good');
  soloSave();
  render();
};
window.actionSoloForgetTech = function (idx) {
  var s = G.solo;
  if (!s || !s.techs[idx] || s.techs.length <= 1) return;
  s.techMsg = 'Has olvidado ' + s.techs[idx] + '.';
  s.techs.splice(idx, 1);
  soloSave();
  render();
};

// ===== Elegir cómo vivir la carrera =====
// Modo Jugador (saltos de 2 años con decisiones, js/player-mode.js) va
// aquí dentro como "Carrera rápida", a petición explícita: tener dos modos
// de "carrera de un futbolista" en el menú confundía.
window.actionGoSoloHub = function () {
  if (!G.solo) G.solo = soloLoad();
  G.screen = 'soloHub';
  render();
};
window.actionSoloHubNew = function () {
  if (G.solo && G.solo.phase !== 'retired' && !confirm('Ya tienes una carrera partido a partido. ¿Borrarla y empezar otra?')) return;
  G.solo = null;
  soloDeleteSave();
  actionSoloNewSetup();
};
window.actionSoloHubQuick = function (fresh) {
  if (fresh && G.playerCareer && !confirm('¿Empezar otra carrera rápida? La actual se pierde.')) return;
  if (fresh) G.playerCareer = null;
  actionGoModoJugador();
};
function renderSoloHub() {
  var s = G.solo, q = G.playerCareer;
  var cont = s ? '<button class="hub-card hub-continue elem-' + soloElemCls(s.tipo) + '" onclick="actionGoSoloCareer()">' +
      soloAvatarHtml(s, 'lg') +
      '<span class="hub-txt"><em>Continuar</em><strong>' + escapeHtml(s.nombre) + '</strong><small>' + escapeHtml(s.club) + ' · Temporada ' + s.season + ' · ' + s.age + ' años · Media ' + Math.round(s.ovr) + '</small></span><span class="hub-go">›</span></button>' : '';
  var qcont = q ? '<button class="hub-card hub-continue" onclick="actionSoloHubQuick(false)"><span class="hub-ico">⏩</span>' +
      '<span class="hub-txt"><em>Continuar rápida</em><strong>' + escapeHtml(q.apellido || 'Tu jugador') + '</strong><small>' + (q.club ? escapeHtml(q.club) + ' · ' : '') + (q.edad ? q.edad + ' años · Media ' + Math.round(q.ovr) : 'Carrera rápida') + '</small></span><span class="hub-go">›</span></button>' : '';
  return '<div class="screen solo-screen">' +
    pageTopHtml('doBackToMenuNow()', 'Carrera de jugador', '🌟') +
    '<div class="solo-setup-title"><h2>Vive la carrera de un futbolista</h2><p>Desde los 16 años hasta el retiro. Elige cómo quieres jugarla.</p></div>' +
    (cont || qcont ? '<div class="hub-list">' + cont + qcont + '</div>' : '') +
    '<div class="hub-modes">' +
      '<button class="hub-mode hub-mode-main" onclick="actionSoloHubNew()">' +
        '<span class="hub-badge">Recomendada</span><span class="hub-mode-ico">⚽</span>' +
        '<strong>Partido a partido</strong>' +
        '<small>Juegas cada partido: Liga, Copa, Champions y Supercopa. Crea tu cara, gana minutos al míster y entra de suplente en la segunda parte.</small>' +
        '<span class="hub-tags"><i>~25 partidos por temporada</i><i>Editor de cara</i><i>Jugar · Ver · Simular</i></span>' +
        '<span class="hub-cta">' + (s ? 'Nueva carrera' : 'Empezar') + '</span>' +
      '</button>' +
      '<button class="hub-mode" onclick="actionSoloHubQuick(true)">' +
        '<span class="hub-mode-ico">⏩</span>' +
        '<strong>Rápida</strong>' +
        '<small>Saltos de 2 en 2 años con decisiones de carrera, eventos, selección nacional y 3 o 4 partidos clave por temporada en los que decides tú.</small>' +
        '<span class="hub-tags"><i>Una carrera en 10 minutos</i><i>Decisiones</i></span>' +
        '<span class="hub-cta">' + (q ? 'Nueva rápida' : 'Empezar') + '</span>' +
      '</button>' +
    '</div>' +
  '</div>';
}

// ===== Creación =====
var SOLO_SETUP_STEPS = ['Jugador', 'Cara', 'Técnica', 'Cantera'];
window.actionGoSoloCareer = function () {
  var saved = G.solo ? soloMigrate(G.solo) : soloLoad();
  if (saved) { G.solo = saved; G.screen = 'soloCareer'; render(); return; }
  actionSoloNewSetup();
};
window.actionSoloNewSetup = function () {
  G.soloSetup = { step: 1, nombre: '', dorsal: 10, posicion: 'Delantero', tipo: 'Fuego', face: faceRandom(), tech: null, techOptions: null, techSeen: [], rerolls: SOLO_FIRST_TECH_REROLLS, club: null, clubOptions: null };
  G.screen = 'soloSetup';
  render();
};
window.actionSoloSetupField = function (field, value) {
  var c = G.soloSetup;
  if (!c) return;
  c[field] = value;
  if (field === 'nombre' || field === 'dorsal') {
    var btn = document.querySelector('[data-solo-next]');
    if (btn) btn.disabled = !String(c.nombre).trim();
    var nm = document.querySelector('[data-solo-preview-name]');
    if (nm) nm.textContent = String(c.nombre).trim() || 'TU NOMBRE';
    var dn = document.querySelector('[data-solo-preview-num]');
    if (dn) dn.textContent = clamp(parseInt(c.dorsal, 10) || 10, 1, 99);
    return;
  }
  if (field === 'posicion' || field === 'tipo') { c.techOptions = null; c.tech = null; c.techSeen = []; c.rerolls = SOLO_FIRST_TECH_REROLLS; }
  render();
};
window.actionSoloSetupStep = function (step) {
  var c = G.soloSetup;
  if (!c) return;
  if (step > 1 && !String(c.nombre).trim()) return;
  if (step > 3 && !c.tech) return;
  c.step = step;
  render();
};
window.actionSoloRerollTechs = function () {
  var c = G.soloSetup;
  if (!c || c.rerolls <= 0) return;
  c.techSeen = (c.techSeen || []).concat(c.techOptions || []);
  c.rerolls--;
  c.techOptions = null;
  if (c.tech && c.techSeen.indexOf(c.tech) !== -1) c.tech = null;
  render();
};
function soloSetupTechOptions(c) {
  if (!c.techOptions) {
    var pool = soloTechPool({ posicion: c.posicion, techs: [] }, SOLO_FIRST_TECH_MAX_POWER);
    var fresh = pool.filter(function (e) { return (c.techSeen || []).indexOf(e.name) === -1; });
    if (fresh.length < SOLO_FIRST_TECH_OPTIONS) { fresh = pool; c.techSeen = []; }
    c.techOptions = soloPickTechOptions(fresh, SOLO_FIRST_TECH_OPTIONS, c.tipo, soloTechKinds(c.posicion));
  }
  return c.techOptions;
}
// Canteras: 6 clubes de nivel variado según lo lejos que está el titular
// de tu puesto; cuanto más fuerte el club, más cuesta jugar al principio.
function soloCanteraOptions(pos) {
  var ovr = SOLO_START_OVR[pos] || 55;
  var teams = qmTeams().filter(function (t) { return soloClubEleven(t).length >= 11; });
  var bands = [[-8, 1], [1, 5], [5, 10], [10, 16], [16, 24], [24, 45]];
  var used = [];
  return bands.map(function (b) {
    var pool = teams.filter(function (t) { var g = soloBarFor(t, pos) - ovr; return g >= b[0] && g <= b[1] && used.indexOf(t) === -1; });
    var t = pool.length ? choice(pool) : null;
    if (t) used.push(t);
    return t;
  }).filter(Boolean);
}
window.actionSoloConfirmSetup = function () {
  var c = G.soloSetup;
  if (!c || !c.club || !c.tech || !String(c.nombre).trim()) return;
  var s = {
    v: 2, nombre: String(c.nombre).trim().slice(0, 16), dorsal: clamp(parseInt(c.dorsal, 10) || 10, 1, 99),
    posicion: c.posicion, tipo: c.tipo, face: c.face, techs: [c.tech], techPoints: 0,
    age: SOLO_START_AGE, ovr: SOLO_START_OVR[c.posicion] || 55, pot: rand(82, 99),
    season: 0, club: c.club, cantera: true, happiness: 55, fame: 10,
    totals: { pj: 0, gls: 0, ast: 0 }, titles: [], history: [],
    injury: 0, suspended: 0, tab: 'jornada'
  };
  G.solo = s;
  G.soloSetup = null;
  G.faceEdit = null;
  soloStartSeason(s);
  s.eventMessage = 'Empiezas en la cantera de ' + s.club + '. Gánate al míster para jugar.';
  soloSave();
  G.screen = 'soloCareer';
  render();
};
// Tarjeta de tu jugador que se ve en toda la creación.
function soloSetupPreviewHtml(c) {
  var ovr = SOLO_START_OVR[c.posicion] || 55;
  var fake = { face: c.face, dorsal: clamp(parseInt(c.dorsal, 10) || 10, 1, 99), tipo: c.tipo };
  return '<div class="solo-card elem-' + soloElemCls(c.tipo) + '">' +
    '<div class="solo-card-ovr"><b>' + ovr + '</b><span>' + escapeHtml(c.posicion.slice(0, 3).toUpperCase()) + '</span>' + techElementIconHtml(c.tipo, 18) + '</div>' +
    '<img class="solo-card-face" src="' + soloFaceUri(fake) + '" alt="">' +
    '<div class="solo-card-name"><span data-solo-preview-name>' + escapeHtml(String(c.nombre).trim() || 'TU NOMBRE') + '</span><em>#<i data-solo-preview-num>' + fake.dorsal + '</i></em></div>' +
    (c.tech ? '<div class="solo-card-tech">' + (TECH_KIND_ICON[techInfo(c.tech).kind] || '⚡') + ' ' + escapeHtml(c.tech) + '</div>' : '') +
    (c.club ? '<div class="solo-card-club"><img src="' + escapeHtml(teamShieldPath(c.club)) + '" alt="">' + escapeHtml(c.club) + '</div>' : '') +
  '</div>';
}
function soloStepperHtml(step) {
  return '<div class="solo-stepper">' + SOLO_SETUP_STEPS.map(function (name, i) {
    var n = i + 1;
    return '<div class="solo-step' + (n === step ? ' on' : n < step ? ' done' : '') + '"><i>' + (n < step ? '✓' : n) + '</i><span>' + name + '</span></div>';
  }).join('<b class="solo-step-line"></b>') + '</div>';
}
function renderSoloSetup() {
  var c = G.soloSetup;
  if (!c) { actionSoloNewSetup(); return ''; }
  var back = c.step === 1 ? 'actionGoSoloHub()' : 'actionSoloSetupStep(' + (c.step - 1) + ')';
  var top = pageTopHtml(back, 'Carrera de jugador', '🌟') +
    soloStepperHtml(c.step);
  var title = function (t, sub) { return '<div class="solo-setup-title"><h2>' + t + '</h2><p>' + sub + '</p></div>'; };
  var nextBtn = function (ok, onclick, label, extra) {
    return '<div class="solo-setup-foot"><button class="btn btn-primary btn-block solo-cta" ' + (extra || '') + ' ' + (ok ? '' : 'disabled') + ' onclick="' + onclick + '">' + label + '</button></div>';
  };
  if (c.step === 2) {
    G.faceEdit = G.faceEdit && G.faceEdit.owner === 'setup' ? G.faceEdit : { owner: 'setup', face: c.face, tab: 'cara' };
    G.faceEdit.face = c.face;
    G.faceEdit.onChange = function (f) { c.face = f; };
    return '<div class="screen solo-screen">' + top +
      title('Crea tu cara', 'Peinado, ojos, boca, facciones, accesorios y colores. Así te verás en el campo.') +
      '<div class="panel solo-glass">' + faceEditorHtml(c.face, G.faceEdit.tab, c.dorsal) + '</div>' +
      nextBtn(true, 'actionSoloSetupStep(3)', 'Siguiente: tu supertécnica →') + '</div>';
  }
  if (c.step === 3) {
    var opts = soloSetupTechOptions(c);
    var me = { id: SOLO_ID, tipo: c.tipo, posicion: c.posicion };
    var cards = opts.map(function (name) {
      var e = techInfo(name), on = c.tech === name, aff = e.element === c.tipo;
      return '<button class="solo-tech-card' + (on ? ' on' : '') + (aff ? ' aff' : '') + ' kind-' + e.kind + '" onclick="actionSoloSetupField(\'tech\', \'' + escapeHtml(name).replace(/'/g, "\\'") + '\')">' +
        '<span class="stc-kind">' + (TECH_KIND_ICON[e.kind] || '⚡') + ' ' + (TECH_KIND_LABEL[e.kind] || '') + '</span>' +
        '<strong>' + escapeHtml(name) + '</strong>' +
        '<span class="stc-meta">' + techElementIconHtml(e.element, 16) + '<b>' + techEffectivePower(name, me) + '</b><em>' + (aff ? '¡Tu afinidad! +15%' : escapeHtml(e.element)) + '</em></span>' +
        (on ? '<span class="stc-check">✓</span>' : '') +
      '</button>';
    }).join('');
    return '<div class="screen solo-screen">' + top + soloSetupPreviewHtml(c) +
      title('Tu primera supertécnica', 'Elige con cuál empiezas. Luego aprenderás más con puntos de técnica.') +
      '<div class="solo-tech-grid">' + cards + '</div>' +
      '<button class="btn btn-outline btn-block solo-reroll" ' + (c.rerolls > 0 ? '' : 'disabled') + ' onclick="actionSoloRerollTechs()">🎲 Otras opciones <span class="pill">' + c.rerolls + '</span></button>' +
      nextBtn(!!c.tech, 'actionSoloSetupStep(4)', 'Siguiente: tu cantera →') + '</div>';
  }
  if (c.step === 4) {
    if (!c.clubOptions || c.clubPos !== c.posicion) { c.clubOptions = soloCanteraOptions(c.posicion); c.clubPos = c.posicion; }
    var ovr = SOLO_START_OVR[c.posicion] || 55;
    var items = c.clubOptions.map(function (name) {
      var gap = soloBarFor(name, c.posicion) - ovr;
      var lvl = gap < 2 ? 4 : gap < 10 ? 3 : gap < 18 ? 2 : 1;
      var mins = ['', 'Casi sin minutos', 'Pocos minutos', 'Algunos minutos', 'Muchos minutos'][lvl];
      var on = c.club === name;
      return '<button class="solo-club-card' + (on ? ' on' : '') + '" onclick="actionSoloSetupField(\'club\', \'' + escapeHtml(name).replace(/'/g, "\\'") + '\')">' +
        '<img src="' + escapeHtml(teamShieldPath(name)) + '" alt="">' +
        '<strong>' + escapeHtml(name) + '</strong>' +
        '<span class="scc-pow">Fuerza <b>' + qmPower(name) + '</b>' + (qmTeams().indexOf(name) < SOLO_CHAMPIONS_TOP ? ' · ⭐' : '') + '</span>' +
        '<span class="scc-mins">' + '<i class="scc-bars">' + [1, 2, 3, 4].map(function (k) { return '<i class="' + (k <= lvl ? 'on' : '') + '"></i>'; }).join('') + '</i>' + mins + '</span>' +
      '</button>';
    }).join('');
    return '<div class="screen solo-screen">' + top + soloSetupPreviewHtml(c) +
      title('Elige tu cantera', 'Empiezas con 16 años y ' + ovr + ' de media. En un club grande cuesta más jugar, pero juega la Champions (⭐).') +
      '<div class="solo-club-grid">' + items + '</div>' +
      nextBtn(!!c.club, 'actionSoloConfirmSetup()', '⚽ Empezar carrera') + '</div>';
  }
  var posBtns = POSITIONS.map(function (pos) {
    return '<button class="solo-pos' + (c.posicion === pos ? ' on' : '') + '" onclick="actionSoloSetupField(\'posicion\', \'' + pos + '\')">' +
      '<img src="' + positionIconPath(pos) + '" alt=""><span>' + pos + '</span><em>' + (SOLO_START_OVR[pos] || 55) + '</em></button>';
  }).join('');
  var elemBtns = TECH_ELEMENTS.map(function (el) {
    return '<button class="solo-elem elem-' + soloElemCls(el) + (c.tipo === el ? ' on' : '') + '" onclick="actionSoloSetupField(\'tipo\', \'' + el + '\')">' + techElementIconHtml(el, 28) + '<span>' + el + '</span></button>';
  }).join('');
  return '<div class="screen solo-screen">' + top + soloSetupPreviewHtml(c) +
    title('Tu jugador', 'Vas a vivir la carrera de un futbolista: Liga, Copa y Champions, partido a partido.') +
    '<div class="panel solo-glass">' +
      '<div class="solo-field-row">' +
        '<label class="solo-field"><span>Nombre en la camiseta</span><input class="select-field" type="text" maxlength="16" data-focus-key="solo-nombre" value="' + escapeHtml(c.nombre) + '" oninput="actionSoloSetupField(\'nombre\', this.value)" placeholder="NOMBRE"></label>' +
        '<label class="solo-field solo-field-num"><span>Dorsal</span><input class="select-field" type="number" min="1" max="99" data-focus-key="solo-dorsal" value="' + c.dorsal + '" oninput="actionSoloSetupField(\'dorsal\', this.value)"></label>' +
      '</div>' +
      '<p class="solo-label">Posición</p><div class="solo-pos-grid">' + posBtns + '</div>' +
      '<p class="solo-label">Afinidad</p><div class="solo-elem-row">' + elemBtns + '</div>' +
      '<p class="dim small">Las supertécnicas de tu afinidad rinden un 15% más.</p>' +
    '</div>' +
    nextBtn(String(c.nombre).trim(), 'actionSoloSetupStep(2)', 'Siguiente: tu cara →', 'data-solo-next') + '</div>';
}

// Editar la cara durante la carrera (pestaña Jugador).
window.actionSoloEditFace = function () {
  var s = G.solo;
  if (!s) return;
  G.faceEdit = { owner: 'career', face: Object.assign({}, s.face), tab: 'cara' };
  G.screen = 'soloFace';
  render();
};
window.actionSoloSaveFace = function (keep) {
  var s = G.solo;
  if (s && keep && G.faceEdit) { s.face = G.faceEdit.face; soloSave(); if (typeof fxToast === 'function') fxToast('✨ Cara guardada', 'good'); }
  G.faceEdit = null;
  G.screen = 'soloCareer';
  render();
};
function renderSoloFace() {
  var s = G.solo;
  if (!s || !G.faceEdit) { G.screen = 'soloCareer'; return renderSoloCareer(); }
  return '<div class="screen solo-screen">' +
    pageTopHtml('actionSoloSaveFace(false)', 'Editor de cara', '🎨') +
    '<div class="panel solo-glass">' + faceEditorHtml(G.faceEdit.face, G.faceEdit.tab, s.dorsal) + '</div>' +
    '<div class="solo-setup-foot"><button class="btn btn-primary btn-block solo-cta" onclick="actionSoloSaveFace(true)">Guardar cara</button></div>' +
  '</div>';
}

// ===== Pantalla principal =====
window.actionSoloTab = function (t) { G.solo.tab = t; render(); };
window.actionSoloDismissMsg = function () { G.solo.eventMessage = null; G.solo.simNote = null; G.solo.seasonNote = null; render(); };
window.actionSoloAbandon = function () {
  if (!confirm('¿Borrar esta carrera y empezar otra?')) return;
  G.solo = null;
  soloDeleteSave();
  actionSoloNewSetup();
};
function soloMoodText(h) { return h >= 75 ? 'Encantados contigo' : h >= 55 ? 'Contentos' : h >= 35 ? 'Con dudas' : h >= 20 ? 'Descontentos' : 'Quieren venderte'; }
function soloOvrProgressHtml(s) {
  var n = s.growthCount || 0;
  var season = s.seasonStartOvr != null ? s.ovr - s.seasonStartOvr : 0;
  return '<i class="solo-ovr-bar" title="Revisión de media en ' + (SOLO_GROWTH_EVERY - n) + ' partidos"><i style="width:' + Math.round(n / SOLO_GROWTH_EVERY * 100) + '%"></i></i>' +
    (Math.abs(season) >= 0.05 ? '<em class="' + (season > 0 ? 'up' : 'down') + '">' + soloFmtDelta(season) + '</em>' : '');
}
function soloHeaderHtml(s) {
  var h = s.happiness;
  var moodCls = h >= 55 ? 'good' : h >= 30 ? 'mid' : 'bad';
  var done = s.calIdx || 0, total = s.cal ? s.cal.length : 1;
  return '<div class="solo-hero elem-' + soloElemCls(s.tipo) + '">' +
    '<div class="solo-hero-top">' + soloAvatarHtml(s, 'lg') +
      '<div class="solo-hero-txt"><span class="solo-kicker">Temporada ' + s.season + ' · ' + s.age + ' años</span><strong>' + escapeHtml(s.nombre) + '</strong>' +
        '<span class="solo-chips"><span class="solo-chip"><img src="' + escapeHtml(positionIconPath(s.posicion)) + '" alt="">' + escapeHtml(s.posicion) + '</span><span class="solo-chip">' + techElementIconHtml(s.tipo, 13) + escapeHtml(s.tipo) + '</span></span>' +
        '<span class="solo-hero-club"><img src="' + escapeHtml(teamShieldPath(s.club)) + '" alt="">' + escapeHtml(s.club) + (s.cantera ? '<span class="solo-tag">Cantera</span>' : '') + '</span></div>' +
      '<div class="solo-ovr"><b>' + Math.round(s.ovr) + '</b><span>MEDIA</span>' + soloOvrProgressHtml(s) + '</div>' +
    '</div>' +
    '<div class="solo-hero-bars">' +
      '<div class="solo-meter"><div class="solo-meter-row"><span>😊 Club</span><b>' + soloMoodText(h) + '</b></div><div class="solo-meter-track"><i class="' + moodCls + '" style="width:' + h + '%"></i></div></div>' +
      '<div class="solo-meter"><div class="solo-meter-row"><span>📅 Temporada</span><b>' + Math.min(done, total) + '/' + total + '</b></div><div class="solo-meter-track"><i class="season" style="width:' + Math.round(Math.min(done, total) / total * 100) + '%"></i></div></div>' +
      soloVeteranMeterHtml(s) +
    '</div>' +
  '</div>';
}
function soloVeteranMeterHtml(s) {
  if (!s.vetGoal && s.age >= 27 && s.phase === 'season') soloSetVeteranGoal(s);
  var g = s.vetGoal;
  if (!g) return '';
  var v = soloVeteranValue(s), pct = Math.min(100, Math.round(v / g.target * 100));
  return '<div class="solo-meter"><div class="solo-meter-row"><span>🎖️ ' + escapeHtml(g.label) + (s.captain ? ' · Capitán' : '') + '</span><b>' + (soloVeteranDone(s) ? '¡Hecho!' : v + '/' + g.target) + '</b></div>' +
    '<div class="solo-meter-track"><i class="good" style="width:' + pct + '%"></i></div></div>';
}
function soloCompBadge(comp, extra) {
  return '<span class="solo-comp solo-comp-' + comp + '">' + SOLO_COMPS[comp].icon + ' ' + SOLO_COMPS[comp].name + (extra ? ' · ' + escapeHtml(extra) : '') + '</span>';
}
function soloLastMatchHtml(s) {
  var m = s.lastMatch;
  if (!m) return '';
  var won = m.pen ? m.pen[0] > m.pen[1] : m.myG > m.oppG;
  var res = won ? 'w' : (m.myG < m.oppG || m.pen) ? 'l' : 'd';
  var score = m.home ? m.myG + ' - ' + m.oppG : m.oppG + ' - ' + m.myG;
  var penTxt = m.pen ? '<small>(' + (m.home ? m.pen[0] + '-' + m.pen[1] : m.pen[1] + '-' + m.pen[0]) + ' pen.)</small>' : '';
  var stats = m.nota !== null
    ? '<div class="solo-last-stats"><span class="solo-nota nota-' + (m.nota >= 8 ? 'top' : m.nota >= 6.5 ? 'ok' : m.nota >= 5 ? 'mid' : 'bad') + '">' + m.nota.toFixed(1).replace('.', ',') + '</span><span>' + SOLO_ROLE_ICON[m.role] + ' ' + SOLO_ROLE_LABEL[m.role] + (m.role === 'suplente' && m.entry ? ' (' + m.entry + "')" : '') + '</span>' + (m.gls ? '<span>⚽ ' + m.gls + '</span>' : '') + (m.ast ? '<span>🎯 ' + m.ast + '</span>' : '') + '</div>'
    : '<div class="solo-last-stats"><span>' + SOLO_ROLE_ICON[m.role] + ' ' + SOLO_ROLE_LABEL[m.role] + '</span></div>';
  var review = m.growth ? '<p class="solo-review">📈 Revisión de media: <b class="' + (m.growth > 0 ? 'up' : 'down') + '">' + soloFmtDelta(m.growth) + '</b></p>' : '';
  return '<div class="panel solo-last solo-last-' + res + '">' +
    '<div class="solo-last-head">' + soloCompBadge(m.comp || 'liga', m.label || '') + '<span class="solo-res solo-res-' + res + '">' + (res === 'w' ? 'Victoria' : res === 'l' ? 'Derrota' : 'Empate') + '</span></div>' +
    '<div class="solo-last-score">' +
      '<img src="' + escapeHtml(teamShieldPath(m.home ? s.club : m.opp)) + '" alt=""><b>' + score + penTxt + '</b><img src="' + escapeHtml(teamShieldPath(m.home ? m.opp : s.club)) + '" alt="">' +
    '</div>' + stats + review +
    (m.notes && m.notes.length ? '<div class="solo-notes">' + m.notes.map(function (n) { return '<span>' + escapeHtml(n) + '</span>'; }).join('') + '</div>' : '') +
  '</div>';
}
// Próximos partidos del calendario (lo que ya se sabe).
function soloUpcomingHtml(s) {
  var out = [];
  for (var i = s.calIdx + 1; i < s.cal.length && out.length < 6; i++) {
    var ev = s.cal[i], opp = null, home = true;
    if (ev.t === 'liga') {
      var fx = s.league.schedule[ev.md].find(function (f) { return f[0] === 0 || f[1] === 0; });
      home = fx[0] === 0; opp = s.league.teams[home ? fx[1] : fx[0]];
    } else {
      var comp = s.comps[ev.t];
      if (!comp || comp.out || comp.champion) continue;
    }
    out.push('<div class="solo-up solo-up-' + ev.t + '"><span class="solo-up-ico">' + SOLO_COMPS[ev.t].icon + '</span>' +
      (opp ? '<img src="' + escapeHtml(teamShieldPath(opp)) + '" alt="" title="' + escapeHtml(opp) + '"><em>' + (home ? 'Casa' : 'Fuera') + '</em>' : '<i>?</i><em>' + SOLO_COMPS[ev.t].name + '</em>') + '</div>');
  }
  return out.length ? '<div class="solo-upcoming"><span class="solo-label">Próximos</span><div class="solo-up-row">' + out.join('') + '</div></div>' : '';
}
function soloNextMatchHtml(s) {
  var fix = soloMyFixture(s);
  if (!fix) return '';
  var role = soloRoleFor(s);
  var playing = role === 'titular' || role === 'suplente';
  var why = role === 'titular' ? 'El míster cuenta contigo de inicio.'
    : role === 'suplente' ? 'Empiezas en el banquillo: entras en la segunda parte y, en Jugar, desde ahí decides tú.'
    : role === 'fuera' ? 'Esta vez no entras en la convocatoria. Sube tu media o tu nota para jugar.'
    : role === 'lesionado' ? 'Estás lesionado: te quedan ' + s.injury + ' partido' + (s.injury === 1 ? '' : 's') + ' de baja.'
    : 'Cumples sanción por la roja.';
  var homeName = fix.home ? s.club : fix.opp, awayName = fix.home ? fix.opp : s.club;
  var where = fix.final ? 'Final' : fix.home ? 'En casa' : 'Fuera';
  return '<div class="panel solo-next solo-next-' + fix.comp + '">' +
    '<div class="solo-next-head">' + soloCompBadge(fix.comp, fix.label) + '<span class="solo-where">' + where + '</span></div>' +
    '<div class="solo-next-teams">' +
      '<div class="' + (homeName === s.club ? 'mine' : '') + '"><img src="' + escapeHtml(teamShieldPath(homeName)) + '" alt=""><span>' + escapeHtml(homeName) + '</span><em>' + qmPower(homeName) + '</em></div>' +
      '<b class="solo-vs">VS</b>' +
      '<div class="' + (awayName === s.club ? 'mine' : '') + '"><img src="' + escapeHtml(teamShieldPath(awayName)) + '" alt=""><span>' + escapeHtml(awayName) + '</span><em>' + qmPower(awayName) + '</em></div>' +
    '</div>' +
    (fix.ko ? '<p class="solo-ko-note">Eliminatoria a partido único: si hay empate, prórroga y penaltis.</p>' : '') +
    '<div class="solo-role-box solo-role-' + role + '"><span class="solo-role-ico">' + SOLO_ROLE_ICON[role] + '</span><div><b>' + SOLO_ROLE_LABEL[role] + '</b><span>' + why + '</span></div></div>' +
    '<div class="solo-actions">' +
      (playing ? '<button class="solo-act solo-act-play" onclick="actionSoloLiveMatch(\'decide\')"><span>🎮</span><b>Jugar</b><em>' + (role === 'suplente' ? 'Sales en la 2ª parte' : 'Tú decides') + '</em></button>' : '') +
      '<button class="solo-act" onclick="actionSoloLiveMatch(\'watch\')"><span>👀</span><b>Ver</b><em>' + (playing ? 'En directo' : 'Desde la grada') + '</em></button>' +
      '<button class="solo-act" onclick="actionSoloSimMatch()"><span>⏩</span><b>Simular</b><em>Resultado</em></button>' +
    '</div>' +
    '<button class="btn btn-outline btn-block mt solo-simseason" onclick="actionSoloSimSeason()">⏭️ Simular el resto de la temporada</button>' +
  '</div>' + soloUpcomingHtml(s);
}
function soloSeasonEndHtml(s) {
  var r = s.lastSeason;
  if (!r) return '';
  var diff = r.ovrAfter - r.ovrBefore;
  var cups = [['copa', r.copa], ['champions', r.champions], ['supercopa', r.supercopa]].filter(function (x) { return x[1]; })
    .map(function (x) { return '<span class="solo-cup-res' + (x[1] === 'Campeón' ? ' win' : '') + '">' + SOLO_COMPS[x[0]].icon + ' ' + SOLO_COMPS[x[0]].name + ': <b>' + escapeHtml(x[1]) + '</b></span>'; }).join('');
  return '<div class="panel solo-season-end' + (r.champion ? ' champ' : '') + '">' +
    '<div class="solo-kicker">Fin de la temporada ' + r.season + '</div>' +
    '<h3>' + (r.champion ? '🏆 ¡Campeones de Liga!' : escapeHtml(r.club) + ' acaba ' + r.pos + 'º en Liga') + '</h3>' +
    (cups ? '<div class="solo-cups-row">' + cups + '</div>' : '') +
    '<div class="sim-sum-tiles mt">' +
      '<div class="sim-sum-tile"><b>' + r.pj + '</b><span>Partidos</span></div>' +
      '<div class="sim-sum-tile"><b>' + r.gls + '</b><span>Goles</span></div>' +
      '<div class="sim-sum-tile"><b>' + r.ast + '</b><span>Asistencias</span></div>' +
    '</div>' +
    '<p class="small mt">Nota media <b>' + (r.nota !== null ? r.nota : 'sin jugar') + '</b> · Media ' + r.ovrBefore + ' → <b>' + r.ovrAfter + '</b> ' + (diff > 0 ? '<span class="up">▲ ' + diff + '</span>' : diff < 0 ? '<span class="down">▼ ' + (-diff) + '</span>' : '') + '</p>' +
  '</div>';
}
function soloOffersHtml(s) {
  var stay = s.stayAllowed
    ? '<button class="solo-offer solo-offer-stay" onclick="actionSoloChooseClub(\'stay\')"><img src="' + escapeHtml(teamShieldPath(s.club)) + '" alt=""><div><strong>Seguir en ' + escapeHtml(s.club) + '</strong><span>' + (s.cantera ? 'Si el club confía en ti, subes al primer equipo' : 'Renuevas con tu club') + '</span></div><em>Renovar</em></button>'
    : '<p class="solo-warn">' + escapeHtml(s.club) + ' no cuenta contigo: tienes que buscar club.</p>';
  var offers = s.offers.map(function (o, i) {
    return '<button class="solo-offer" onclick="actionSoloChooseClub(' + i + ')"><img src="' + escapeHtml(teamShieldPath(o.club)) + '" alt="">' +
      '<div><strong>' + escapeHtml(o.club) + '</strong><span>Fuerza ' + o.power + ' · Te ven como <b>' + o.promise.toLowerCase() + '</b>' + (o.champions ? ' · ⭐ Champions' : '') + '</span></div><em>Fichar</em></button>';
  }).join('');
  return '<div class="panel solo-glass">' +
    '<h3 class="solo-h3">📨 Ofertas</h3>' +
    '<p class="dim small">Tienes ' + s.age + ' años. Elige dónde juegas la próxima temporada.</p>' +
    stay + offers +
    (s.age >= SOLO_RETIRE_FROM ? '<button class="btn btn-outline btn-block mt" onclick="actionSoloRetire()">Retirarme</button>' : '') +
  '</div>';
}
function soloRetiredHtml(s) {
  return '<div class="panel solo-season-end champ">' +
    '<div class="solo-retired-face">' + soloAvatarHtml(s, 'xl') + '</div>' +
    '<h2 class="panel-title">👋 Fin de tu carrera</h2>' +
    '<p class="small">' + escapeHtml(s.nombre) + ' se retira con ' + s.age + ' años.</p>' +
    '<div class="sim-sum-tiles">' +
      '<div class="sim-sum-tile"><b>' + s.totals.pj + '</b><span>Partidos</span></div>' +
      '<div class="sim-sum-tile"><b>' + s.totals.gls + '</b><span>Goles</span></div>' +
      '<div class="sim-sum-tile"><b>' + s.titles.length + '</b><span>Títulos</span></div>' +
    '</div>' +
    '<button class="btn btn-primary btn-block mt" onclick="actionSoloAbandonNow()">Nueva carrera</button>' +
  '</div>';
}
window.actionSoloAbandonNow = function () { G.solo = null; soloDeleteSave(); actionSoloNewSetup(); };
function soloJornadaTab(s) {
  var msg = [s.eventMessage, s.seasonNote, s.simNote].filter(Boolean).join(' ');
  var msgHtml = msg ? '<div class="solo-msg"><span>📣</span><p>' + escapeHtml(msg) + '</p><button class="btn btn-tiny" onclick="actionSoloDismissMsg()">Vale</button></div>' : '';
  if (s.phase === 'retired') return soloSeasonEndHtml(s) + soloRetiredHtml(s);
  if (s.phase === 'offers') return msgHtml + soloSeasonEndHtml(s) + soloOffersHtml(s);
  return msgHtml + soloLastMatchHtml(s) + soloNextMatchHtml(s);
}
function soloStatTile(v, label, cls) { return '<div class="solo-stat' + (cls ? ' ' + cls : '') + '"><b>' + v + '</b><span>' + label + '</span></div>'; }
function soloJugadorTab(s) {
  var ss = s.seasonStats;
  var avg = ss.notas.length ? (Math.round(ss.notas.reduce(function (a, b) { return a + b; }, 0) / ss.notas.length * 10) / 10).toFixed(1).replace('.', ',') : '-';
  var potText = s.pot >= 95 ? 'Altísimo' : s.pot >= 90 ? 'Alto' : s.pot >= 86 ? 'Bueno' : 'Normal';
  var me = soloMatchPlayer(s);
  var statBar = function (label, v) { return '<div class="solo-attr"><span>' + label + '</span><i><i style="width:' + clamp(v, 0, 99) + '%"></i></i><b>' + v + '</b></div>'; };
  var compRows = Object.keys(SOLO_COMPS).filter(function (k) { return ss.comp && ss.comp[k]; }).map(function (k) {
    var c = ss.comp[k];
    return '<div class="solo-comp-row">' + soloCompBadge(k) + '<span>' + c.pj + ' PJ · ⚽ ' + c.gls + ' · 🎯 ' + c.ast + '</span></div>';
  }).join('');
  return '<div class="panel solo-glass solo-face-panel">' +
    '<div class="solo-face-big elem-' + soloElemCls(s.tipo) + '"><img src="' + soloFaceUri(s) + '" alt=""></div>' +
    '<div class="solo-face-side"><h3 class="solo-h3">' + escapeHtml(s.nombre) + ' <small>#' + s.dorsal + '</small></h3>' +
      statBar('Tiro', me.tiro) + statBar('Pase', me.pase) + statBar('Defensa', me.defensa) + statBar('Especial', me.especial) +
      '<button class="btn btn-tiny btn-primary mt" onclick="actionSoloEditFace()">✏️ Editar cara</button></div>' +
  '</div>' +
  '<div class="panel solo-glass">' +
    '<h3 class="solo-h3">Esta temporada</h3>' +
    '<div class="solo-stats">' + soloStatTile(ss.pj, 'Partidos') + soloStatTile(ss.tit, 'Titular') + soloStatTile(avg, 'Nota', 'gold') +
      soloStatTile(ss.gls, 'Goles') + soloStatTile(ss.ast, 'Asist.') + soloStatTile(ss.mvp, 'MVP', 'gold') + '</div>' +
    (compRows ? '<div class="solo-comp-rows">' + compRows + '</div>' : '') +
  '</div>' +
  '<div class="panel solo-glass">' +
    '<h3 class="solo-h3">Ficha</h3>' +
    '<div class="solo-kv"><span>Media</span><b>' + (Math.round(s.ovr * 10) / 10).toFixed(1).replace('.', ',') + '</b></div>' +
    '<div class="solo-kv"><span>Para ser titular</span><b>' + soloStarterBar(s) + '</b></div>' +
    '<div class="solo-kv"><span>Potencial</span><b>' + potText + '</b></div>' +
    '<div class="solo-kv"><span>Fama</span><b>' + s.fame + '</b></div>' +
    '<div class="solo-kv"><span>Carrera</span><b>' + s.totals.pj + ' PJ · ' + s.totals.gls + ' G · ' + s.totals.ast + ' A</b></div>' +
    '<p class="dim small mt">Cuanto mejor sea tu nota, más contento estará el club y más jugarás. Tu media se revisa cada ' + SOLO_GROWTH_EVERY + ' partidos según tus notas, si eres titular y cómo le va al equipo, y otra vez al acabar la temporada según tu edad y minutos. Próxima revisión en ' + (SOLO_GROWTH_EVERY - (s.growthCount || 0)) + ' partidos.</p>' +
  '</div>';
}
function soloTecnicasTab(s) {
  var me = soloMatchPlayer(s);
  var mine = s.techs.map(function (n, i) {
    return '<div class="solo-tech-row solo-tech-mine">' + techChipHtml(n, me) + (s.techs.length > 1 ? '<button class="btn btn-tiny" onclick="actionSoloForgetTech(' + i + ')">Olvidar</button>' : '') + '</div>';
  }).join('');
  var slots = '';
  for (var k = s.techs.length; k < SOLO_TECH_MAX; k++) slots += '<div class="solo-tech-slot">Hueco libre</div>';
  var learn = soloLearnOptions(s).map(function (n) {
    var e = techInfo(n), cost = soloTechCost(e);
    var can = s.techPoints >= cost && s.techs.length < SOLO_TECH_MAX;
    return '<div class="solo-tech-row">' + techChipHtml(n, me) +
      '<button class="btn btn-tiny' + (can ? ' btn-primary' : '') + '" ' + (can ? '' : 'disabled') + ' onclick="actionSoloLearnTech(\'' + escapeHtml(n).replace(/'/g, "\\'") + '\')">Aprender · ' + cost + '</button></div>';
  }).join('');
  return '<div class="panel solo-glass">' +
    '<div class="solo-h3-row"><h3 class="solo-h3">Tus supertécnicas</h3><span class="solo-points">⚡ ' + s.techPoints + '</span></div>' +
    '<p class="dim small">Hasta ' + SOLO_TECH_MAX + '. Ganas puntos al acabar cada temporada, por cada título y por cada dos veces que eres el mejor del partido.</p>' +
    (s.techMsg ? '<p class="small solo-tech-msg">' + escapeHtml(s.techMsg) + '</p>' : '') +
    mine + slots +
  '</div>' +
  '<div class="panel solo-glass">' +
    '<h3 class="solo-h3">Puedes aprender</h3>' +
    '<p class="dim small">Cambian cada temporada. Solo salen las que no te quedan grandes (hasta tu media + 10).</p>' +
    (learn || '<p class="dim small">No hay técnicas nuevas a tu alcance esta temporada.</p>') +
  '</div>';
}
function soloLigaTab(s) {
  var sorted = ligaSortedTable(s.league.table);
  var rows = sorted.map(function (r, i) {
    var zone = i < 3 ? 'z-champ' : i >= sorted.length - 2 ? 'z-down' : '';
    var form = (r.form || []).slice(-5).map(function (f) { return '<i class="f-' + String(f).toLowerCase() + '"></i>'; }).join('');
    return '<tr class="' + zone + (r.idx === 0 ? ' solo-me-row' : '') + '"><td><span class="solo-pos-n">' + (i + 1) + '</span></td><td class="solo-tbl-team"><img src="' + escapeHtml(teamShieldPath(r.name)) + '" alt=""><span>' + escapeHtml(r.name) + '</span></td><td>' + r.pj + '</td><td>' + (r.gf - r.gc > 0 ? '+' : '') + (r.gf - r.gc) + '</td><td class="solo-form">' + form + '</td><td><b>' + r.pts + '</b></td></tr>';
  }).join('');
  return '<div class="panel solo-glass"><div class="solo-h3-row"><h3 class="solo-h3">🏟️ Liga</h3><span class="dim small">Temporada ' + s.season + ' · Jornada ' + Math.min(s.league.md + 1, s.league.schedule.length) + '/' + s.league.schedule.length + '</span></div>' +
    '<table class="solo-table"><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>DG</th><th>Forma</th><th>Pts</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '<p class="solo-legend"><i class="z-champ"></i> Champions <i class="z-down"></i> Zona baja</p></div>';
}
// Cuadro de una eliminatoria, ronda a ronda.
function soloKoHtml(s, id) {
  var comp = s.comps && s.comps[id];
  var info = SOLO_COMPS[id];
  if (!comp) {
    var why = id === 'champions' ? 'Tu club no juega la Champions este año: acaba entre los 3 primeros de la liga o ficha por un grande (⭐).' : 'Gana la Liga o la Copa para jugar la Supercopa del año que viene.';
    return '<div class="panel solo-ko solo-ko-' + id + ' off"><div class="solo-ko-head"><span>' + info.icon + '</span><h3>' + info.name + '</h3></div><p class="dim small">' + why + '</p></div>';
  }
  var status = comp.champion === s.club ? '<span class="solo-ko-status win">🏆 ¡Campeones!</span>'
    : comp.out ? '<span class="solo-ko-status out">' + (comp.exit === 'Subcampeón' ? '🥈 Subcampeones' : 'Eliminados en ' + escapeHtml(String(comp.exit).toLowerCase())) + '</span>'
    : comp.champion ? '<span class="solo-ko-status">Campeón: ' + escapeHtml(comp.champion) + '</span>'
    : '<span class="solo-ko-status live">En juego</span>';
  var rounds = comp.rounds.map(function (round) {
    var ms = round.map(function (m) {
      var mine = m.a === s.club || m.b === s.club;
      var side = function (t, g, p) {
        return '<div class="solo-km-t' + (m.w === t ? ' w' : m.w ? ' l' : '') + (t === s.club ? ' me' : '') + '"><img src="' + escapeHtml(teamShieldPath(t)) + '" alt=""><span>' + escapeHtml(t) + '</span><b>' + (g === null ? '' : g) + (p !== null && p !== undefined ? '<small>(' + p + ')</small>' : '') + '</b></div>';
      };
      return '<div class="solo-km' + (mine ? ' mine' : '') + '">' + side(m.a, m.ga, m.pa) + side(m.b, m.gb, m.pb) + '</div>';
    }).join('');
    return '<div class="solo-kr"><div class="solo-kr-name">' + soloKoRoundName(round.length) + '</div><div class="solo-kr-list">' + ms + '</div></div>';
  }).reverse().join('');
  return '<div class="panel solo-ko solo-ko-' + id + '"><div class="solo-ko-head"><span>' + info.icon + '</span><h3>' + info.name + '</h3>' + status + '</div>' + rounds + '</div>';
}
function soloCopasTab(s) {
  return soloKoHtml(s, 'champions') + soloKoHtml(s, 'copa') + soloKoHtml(s, 'supercopa');
}
function soloHistorialTab(s) {
  var count = {};
  s.titles.forEach(function (t) { count[t.name] = (count[t.name] || 0) + 1; });
  var cabinet = ['Champions', 'Liga', 'Copa', 'Supercopa'].map(function (n) {
    var k = n === 'Liga' ? 'liga' : n.toLowerCase();
    return '<div class="solo-trophy' + (count[n] ? ' has' : '') + ' solo-trophy-' + k + '"><span>' + SOLO_COMPS[k].icon + '</span><b>' + (count[n] || 0) + '</b><em>' + n + '</em></div>';
  }).join('');
  var rows = s.history.slice().reverse().map(function (r) {
    var cups = [r.champions === 'Campeón' ? '⭐' : '', r.copa === 'Campeón' ? '🏆' : '', r.supercopa === 'Campeón' ? '🥇' : '', r.champion ? '🏟️' : ''].join('');
    return '<div class="solo-hist"><img src="' + escapeHtml(teamShieldPath(r.club)) + '" alt="">' +
      '<div><strong>T' + r.season + ' · ' + escapeHtml(r.club) + (r.cantera ? ' <span class="solo-tag">Cantera</span>' : '') + ' ' + cups + '</strong>' +
      '<span>' + r.age + ' años · ' + r.pj + ' PJ · ' + r.gls + ' G · ' + r.ast + ' A · Nota ' + (r.nota !== null ? r.nota : '-') + ' · ' + r.pos + 'º</span></div>' +
      '<b>' + r.ovrAfter + '</b></div>';
  }).join('');
  return '<div class="panel solo-glass"><h3 class="solo-h3">Vitrina</h3><div class="solo-cabinet">' + cabinet + '</div></div>' +
    '<div class="panel solo-glass"><h3 class="solo-h3">Temporadas</h3>' + (rows || '<p class="dim small">Aún no has terminado ninguna temporada.</p>') + '</div>' +
    '<div class="panel"><button class="btn btn-outline btn-block" onclick="actionSoloAbandon()">Nueva carrera</button></div>';
}
function renderSoloCareer() {
  var s = G.solo;
  if (!s) { actionGoSoloCareer(); return ''; }
  soloMigrate(s);
  var tab = SOLO_TABS.some(function (t) { return t.id === s.tab; }) ? s.tab : 'jornada';
  var body = tab === 'jugador' ? soloJugadorTab(s) : tab === 'tecnicas' ? soloTecnicasTab(s) : tab === 'liga' ? soloLigaTab(s) : tab === 'copas' ? soloCopasTab(s) : tab === 'historial' ? soloHistorialTab(s) : soloJornadaTab(s);
  return '<div class="screen solo-screen">' +
    pageTopHtml('doBackToMenuNow()', 'Carrera de jugador', '🌟') +
    soloHeaderHtml(s) +
    '<div class="solo-tabs" role="tablist">' + SOLO_TABS.map(function (t) {
      return '<button role="tab" class="solo-tab' + (t.id === tab ? ' on' : '') + '" onclick="actionSoloTab(\'' + t.id + '\')"><span>' + t.icon + '</span>' + t.name + '</button>';
    }).join('') + '</div>' +
    body +
  '</div>';
}
