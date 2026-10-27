/* ---------------------------------------------------------------------
   18. MODO MUNDIAL: recorres los equipos de Inazuma Eleven 1 empezando
   por el Occult, con TU equipo (el Raimon base de la temporada 1, o uno
   aleatorio, siempre con media por debajo de 75) -- a petición explícita
   ("recorrieras el mundo de Inazuma... primero juegas contra el Occult...
   una vez les ganes, tus jugadores subirán un poquito de media, y además
   puedes fichar uno de los tres/cinco. Eso tiene que ser como un draft").
   Cada victoria: +1 de media para todo tu equipo y un draft de 1 entre 3
   jugadores reales del equipo que acabas de ganar, que se suma a tu
   plantilla. Usa el mismo motor de partido que el resto de la app
   (futDraftSimulateMatchCore/futDraftLiveTick), con los 3 mismos botones
   que en Jornada de Modo Carrera: Jugar (puntitos), Simular, Saltar.
   Los jugadores de este modo son SIEMPRE clones de personajes reales del
   ROSTER (mismo id/nombre/tipo/posicion/sprite, así que avatarHtml enseña
   su cara real) con las 4 stats aplanadas a un "ovr" propio de este modo
   (independiente de sus stats reales, para mantener el tope de 75 al
   empezar) -- a petición explícita ("tienen que salir con caras y
   basarse en los personajes ya existentes del roster").
   --------------------------------------------------------------------- */

// Jude, Erik y Bobby empiezan de titulares en la Temporada 2 (no en el banquillo): sacan del once a
// los 3 más flojos de su misma línea, que pasan al banquillo junto con Willy. Reutilizable también al
// entrar en la Temporada 2 desde el modo Saga (ver worldTourAdvanceSaga).
function worldTourAddT2Joins(squad) {
  if (squad.some(function (p) { return p.id === 'r04'; })) return squad;
  var joins = wtSquad([['r04', 58], ['r10', 52], ['r16', 50]]);
  var byId = function (id) { return squad.find(function (p) { return p.id === id; }); };
  var gk = byId('r01'), willy = byId('r40');
  var df = ['r03', 'r06', 'r49', 'r12'].map(byId).filter(Boolean).sort(function (a, b) { return a.tiro - b.tiro; });
  var md = ['r46', 'r47', 'r178', 'r48'].map(byId).filter(Boolean).sort(function (a, b) { return a.tiro - b.tiro; });
  var fw = ['r02', 'r05'].map(byId).filter(Boolean);
  var rest = squad.filter(function (p) { return [gk, willy].concat(df, md, fw).indexOf(p) === -1; });
  var droppedDf = df.length ? df.shift() : null, droppedMd1 = md.length ? md.shift() : null, droppedMd2 = md.length ? md.shift() : null;
  var jude = joins[0], erik = joins[1], bobby = joins[2];
  return [gk].filter(Boolean).concat(df, [bobby], md, [jude, erik], fw, [droppedDf, droppedMd1, droppedMd2, willy].filter(Boolean), rest);
}
function wtFromRoster(id, ovr) {
  var src = ROSTER.find(function (p) { return p.id === id; });
  if (!src) return null;
  return { id: src.id, nombre: src.nombre, posicion: src.posicion, tipo: src.tipo, sprite: src.sprite || null, hissatsu: src.hissatsu || [], tiro: ovr, pase: ovr, defensa: ovr, especial: ovr };
}
function wtSquad(defs) {
  return defs.map(function (d) { return wtFromRoster(d[0], d[1]); }).filter(Boolean);
}

// Once base del Raimon en Inazuma Eleven 1 (temporada 1, antes de que el
// equipo se hiciera fuerte de verdad): jugadores reales del roster, todos
// por debajo de 75 de media, a petición explícita.
// Once real de la temporada 1 (Saga de Mark) según la wiki de Inazuma
// (https://inazuma.fandom.com/es/wiki/Instituto_Raimon, dorsales 1-11):
// Mark, Nathan, Jack, Jim, Tod, Steve, Timmy, Sam, Max, Axel y Kevin.
// Jude Sharp (dorsal 14) es un fichaje real de la Royal Academy y Erik
// Eagle (16) y Bobby Shearer (13) se unen más tarde, contra el Kirkwood
// -- a petición explícita, empiezan en el banquillo, no en el once
// inicial. Todos personajes reales y "normales" (nunca versiones "Osc."
// ni de otra línea temporal).
var WORLD_TOUR_RAIMON_BASE = wtSquad([
  ['r01', 52],                                                          // Mark Evans (portero)
  ['r03', 50], ['r06', 48], ['r49', 47], ['r12', 46],                   // Nathan, Jack, Jim, Tod
  ['r46', 51], ['r47', 49], ['r178', 50], ['r48', 49],                  // Steve, Timmy, Sam, Max
  ['r02', 58], ['r05', 53],                                             // Axel, Kevin
  // banquillo: reservas de la época (Jude, Erik y Bobby NO están aquí --
  // se unen más adelante como en la historia real, ver
  // WORLD_TOUR_STORY_JOINS).
  ['r40', 46]                                                           // Willy
]);
// Fichajes que se unen solos durante el recorrido, como en la historia
// real (a petición explícita): Jude Sharp llega al ganar a la Royal
// Academy, Erik Eagle y Bobby Shearer al ganar al Kirkwood -- solo si
// empezaste con el Raimon (con un equipo aleatorio no aplica). El número
// ya NO es su media fija: es un extra sobre la media actual de tu equipo
// (worldTourTeamScore) en ese momento, a petición explícita ("jude tiene
// que salir con más media cuando se una") -- así siempre llega siendo una
// mejora de verdad, no un fichaje flojo si ya vas muy por encima del
// número fijo de antes. Jude (fichaje "estrella") sube más que Erik/Bobby.
var WORLD_TOUR_STORY_JOINS = {
  royal: [['r04', 8, 'Jude Sharp']],
  kirkwood: [['r10', 4, 'Erik Eagle'], ['r16', 3, 'Bobby Shearer']]
};
// Personajes "especiales" (secundarios/de refuerzo, no del once fijo de
// la temporada 1): Austin Hobbs, Shadow Cimmerian y Paul Peabody -- a
// petición explícita, con un botón propio para incluirlos o no en el
// banquillo del Raimon.
var WORLD_TOUR_RAIMON_SPECIALS = wtSquad([['r09', 46], ['r39', 45], ['r41', 44]]);
// Jugadores especiales por temporada: T1 Shadow Cimmerian y Paul Peabody, T2 solo Paul Peabody, T3 ninguno.
var WORLD_TOUR_SPECIAL_IDS = { 1: ['r39', 'r41'], 2: ['r41'], 3: [] };
var WORLD_TOUR_SPECIAL_NAMES = { 1: 'Shadow Cimmerian y Paul Peabody', 2: 'Paul Peabody', 3: '' };
function worldTourSpecialsFor(season) { return WORLD_TOUR_RAIMON_SPECIALS.filter(function (p) { return (WORLD_TOUR_SPECIAL_IDS[season] || []).indexOf(p.id) !== -1; }); }

// Equipos de Inazuma Eleven 1, en el orden real del torneo Fútbol
// Frontier (Occult primero) más el Equipo Ogro como rival final tras el
// Zeus, a petición explícita. Todos los jugadores son reales del roster
// con el once titular real de cada equipo (dorsales 1-11 de la wiki).
// Orden corregido a petición explícita, con los amistosos y equipos que
// faltaban: Occult, Inazuma Kids (amistoso), Wild, Umbrella (amistoso),
// Brain, Otaku, Royal Academy, Shuriken, Farm, Kirkwood, Zeus y el Equipo
// Ogro al final. SIEMPRE se juega el recorrido entero (sin elección de
// corto/completo, a petición explícita: "no pongas dos modos... son
// iguales").
var WORLD_TOUR_STAGES = [
  {
    id: 'occult', name: 'Occult', power: 48,
    players: wtSquad([['r80', 57], ['r94', 54], ['r95', 52], ['r96', 51], ['r97', 51], ['r98', 53], ['r99', 50], ['r100', 53], ['r82', 60], ['r81', 58], ['r101', 52]])
  },
  {
    id: 'inazuma-kids', name: 'Inazuma Kids', power: 40,
    players: wtSquad([['r387', 42], ['r388', 40], ['r389', 40], ['r567', 39], ['r568', 39], ['r569', 40], ['r390', 41], ['r391', 41], ['r392', 44], ['r570', 40], ['r393', 45]])
  },
  {
    id: 'wild', name: 'Wild', power: 53,
    players: wtSquad([['r83', 59], ['r84', 60], ['r85', 55], ['r86', 54], ['r87', 55], ['r88', 54], ['r89', 56], ['r90', 55], ['r91', 58], ['r92', 57], ['r93', 61]])
  },
  {
    id: 'umbrella', name: 'Umbrella', power: 44,
    players: wtSquad([['r370', 47], ['r371', 45], ['r372', 45], ['r373', 45], ['r374', 44], ['r375', 44], ['r376', 46], ['r377', 44], ['r378', 49], ['r379', 48], ['r380', 47]])
  },
  {
    id: 'brain', name: 'Brain', power: 58,
    players: wtSquad([['r151', 61], ['r548', 57], ['r153', 58], ['r152', 58], ['r549', 57], ['r550', 59], ['r154', 62], ['r155', 63], ['r156', 60], ['r551', 59], ['r157', 59]])
  },
  {
    id: 'otaku', name: 'Otaku', power: 45,
    players: wtSquad([['r381', 50], ['r552', 48], ['r382', 48], ['r383', 52], ['r553', 48], ['r554', 50], ['r555', 50], ['r556', 49], ['r384', 51], ['r385', 53], ['r386', 50]])
  },
  {
    // Sin Jude Sharp: se une a tu equipo al ganar (WORLD_TOUR_STORY_JOINS).
    id: 'royal', name: 'Royal Academy', power: 65,
    players: wtSquad([['r13', 66], ['r537', 63], ['r538', 63], ['r131', 64], ['r539', 63], ['r540', 64], ['r541', 64], ['r186', 66], ['r185', 64], ['r22', 67]])
  },
  {
    id: 'shuriken', name: 'Shuriken', power: 68,
    players: wtSquad([['r557', 66], ['r558', 65], ['r158', 65], ['r559', 65], ['r560', 64], ['r159', 64], ['r561', 66], ['r160', 68], ['r161', 67], ['r162', 66], ['r163', 69]])
  },
  {
    id: 'farm', name: 'Farm', power: 70,
    players: wtSquad([['r164', 65], ['r562', 67], ['r563', 67], ['r165', 67], ['r166', 66], ['r167', 71], ['r564', 68], ['r168', 70], ['r565', 68], ['r169', 69], ['r566', 70]])
  },
  {
    // Su once real del primer anime más los hermanos Ash (r236-238, la
    // plantilla fuerte de una saga posterior), a petición explícita.
    id: 'kirkwood', name: 'Kirkwood', power: 73,
    players: wtSquad([['r543', 62], ['r394', 60], ['r395', 60], ['r544', 60], ['r396', 59], ['r545', 63], ['r546', 63], ['r547', 63], ['r397', 65], ['r398', 62], ['r399', 61], ['r236', 74], ['r237', 72], ['r238', 71]])
  },
  {
    id: 'zeus', name: 'Zeus', power: 76,
    players: wtSquad([['r51', 71], ['r102', 73], ['r103', 73], ['r104', 73], ['r105', 72], ['r542', 74], ['r106', 74], ['r107', 74], ['r108', 75], ['r20', 77], ['r109', 75]])
  },
  {
    // Rival final, tras el Zeus, a petición explícita -- el Equipo Ogro,
    // el más fuerte de todos (ids r400-r407 nuevos + r45/r73/r74, que ya
    // estaban en el roster con esos ids para Bash Lancer/Escavan Malice/
    // Mystral Callous -- no se duplican). Sin recorrido corto/completo
    // por separado: SIEMPRE se llega hasta aquí.
    id: 'ogro', name: 'Equipo Ogro', power: 82,
    players: wtSquad([['r400', 77], ['r401', 76], ['r402', 76], ['r403', 76], ['r404', 76], ['r405', 76], ['r406', 77], ['r407', 78], ['r74', 80], ['r73', 81], ['r45', 83]])
  }
];

// Cuánto sube la media de TODO tu equipo tras cada victoria (aparte del
// jugador nuevo que fichas por el draft) -- a petición explícita ("tus
// jugadores subirán un poquito de media").
// Subida de media por victoria: antes un fijo +1.2, ahora un rango de 2 a
// 4 puntos por partido (sorteado cada vez), a petición explícita ("haz
// que los jugadores suban de 2 a 4 puntos por partido"). wt.lastBoost
// guarda el valor exacto de la última victoria para poder enseñarlo en
// la pantalla del draft (antes era el mismo número siempre, ahora toca
// recordarlo).
// ===== Temporada 2 (Alius Academy): rivales con su once real del roster =====
// Orden de los partidos según la serie (de memoria, ajustable aquí): cada
// equipo usa a sus jugadores del roster y, si le faltan, se completa con
// otros jugadores de la Academia Alius para poder ofrecer draft al ganar.
// Once titular real (dorsales 1-11 de la wiki) de los rivales de la
// Temporada 2 y 3: si el equipo está aquí, wtTeamStage usa estos 11.
var WT_REAL_ELEVEN = {
  'Zeus': ['r51', 'r102', 'r103', 'r104', 'r105', 'r542', 'r106', 'r107', 'r108', 'r20', 'r109'],
  'Alpino': ['r346', 'r349', 'r347', 'r348', 'r354', 'r351', 'r352', 'r355', 'r08', 'r350', 'r353'],
  'Caos': ['r179', 'r594', 'r183', 'r122', 'r123', 'r125', 'r595', 'r596', 'r17', 'r19', 'r597'],
  'Emperadores Oscuros': ['r247', 'r248', 'r254', 'r250', 'r251', 'r252', 'r253', 'r255', 'r249', 'r256', 'r257'],
  'Épsilon': ['r54', 'r456', 'r598', 'r599', 'r600', 'r457', 'r601', 'r458', 'r459', 'r455', 'r55'],
  'Épsilon Plus': ['r54', 'r461', 'r598', 'r599', 'r600', 'r462', 'r601', 'r463', 'r464', 'r460', 'r55'],
  'Fauxshore': ['r11', 'r417', 'r602', 'r603', 'r416', 'r604', 'r605', 'r606', 'r607', 'r414', 'r413'],
  'Genesis': ['r110', 'r111', 'r112', 'r113', 'r114', 'r115', 'r116', 'r117', 'r118', 'r53', 'r150'],
  'Mary Times': ['r427', 'r608', 'r429', 'r18', 'r430', 'r609', 'r130', 'r431', 'r610', 'r611', 'r432'],
  'Polvo de Diamante': ['r182', 'r612', 'r183', 'r122', 'r613', 'r614', 'r595', 'r596', 'r615', 'r17', 'r181'],
  'Prominence': ['r179', 'r594', 'r180', 'r616', 'r123', 'r125', 'r126', 'r617', 'r618', 'r19', 'r597'],
  'Servicio Secreto': ['r331', 'r332', 'r334', 'r333', 'r335', 'r337', 'r338', 'r343', 'r339', 'r52', 'r342'],
  'Triple C': ['r418', 'r419', 'r420', 'r619', 'r620', 'r621', 'r622', 'r623', 'r421', 'r56', 'r624'],
  'Royal Academy Redux': ['r423', 'r426', 'r425', 'r625', 'r626', 'r627', 'r628', 'r629', 'r630', 'r07', 'r424'],
  'Claustro Sagrado': ['r320', 'r631', 'r325', 'r632', 'r324', 'r329', 'r328', 'r330', 'r323', 'r321', 'r322'],
  'Tormenta de Géminis': ['r184', 'r633', 'r634', 'r635', 'r636', 'r452', 'r454', 'r637', 'r451', 'r15', 'r450'],
  'Academia Ogre': ['r400', 'r402', 'r401', 'r403', 'r404', 'r405', 'r406', 'r407', 'r73', 'r45', 'r74'],
  'Big Waves': ['r504', 'r505', 'r638', 'r639', 'r640', 'r506', 'r641', 'r642', 'r188', 'r507', 'r508'],
  'Dragones de Fuego': ['r643', 'r644', 'r645', 'r646', 'r647', 'r648', 'r129', 'r512', 'r509', 'r510', 'r511'],
  'Inazuma Japon': ['r01', 'r03', 'r06', 'r18', 'r21', 'r23', 'r07', 'r08', 'r02', 'r09', 'r42'],
  'Leones del desierto': ['r499', 'r500', 'r187', 'r501', 'r502', 'r503', 'r649', 'r650', 'r651', 'r652', 'r653'],
  'Los Emperadores': ['r654', 'r62', 'r655', 'r656', 'r657', 'r658', 'r659', 'r660', 'r661', 'r662', 'r663'],
  'Neo Japón': ['r13', 'r131', 'r113', 'r625', 'r185', 'r157', 'r163', 'r82', 'r118', 'r43', 'r55'],
  'Orfeo': ['r149', 'r664', 'r665', 'r666', 'r65', 'r64', 'r63', 'r667', 'r668', 'r61', 'r669'],
  'Os Reis': ['r489', 'r490', 'r670', 'r671', 'r491', 'r672', 'r673', 'r674', 'r492', 'r148', 'r675'],
  'Pequeños Gigantes': ['r119', 'r494', 'r495', 'r676', 'r677', 'r678', 'r679', 'r680', 'r498', 'r496', 'r497'],
  'Ángeles Oscuros': ['r681', 'r682', 'r683', 'r684', 'r685', 'r686', 'r687', 'r688', 'r689', 'r690', 'r71'],
  'Knights': ['r513', 'r514', 'r515', 'r516', 'r691', 'r692', 'r693', 'r694', 'r695', 'r58', 'r696'],
  'Unicorn': ['r697', 'r698', 'r699', 'r700', 'r487', 'r701', 'r486', 'r702', 'r59', 'r60', 'r488'],
  'Zoolan Team': ['r703', 'r704', 'r189', 'r705', 'r706', 'r707', 'r708', 'r709', 'r710', 'r711', 'r712'],
  // Inazuma Eleven GO 1 (dorsales 1-11 de la wiki en español): no hay
  // etapas de Modo Historia, pero Partido rápido y la previa del escudo
  // usan este once (ver qmRealElevenIds).
  'Raimon GO': ['r38', 'r37', 'r32', 'r133', 'r713', 'r714', 'r715', 'r30', 'r31', 'r34', 'r716'],
  'Poderosa Fe': ['r720', 'r721', 'r722', 'r723', 'r724', 'r725', 'r726', 'r727', 'r728', 'r234', 'r233'],
  'Royal Academy GO': ['r734', 'r735', 'r736', 'r737', 'r231', 'r738', 'r739', 'r740', 'r741', 'r742', 'r232'],
  'Cala Pirata': ['r748', 'r235', 'r749', 'r750', 'r751', 'r752', 'r753', 'r754', 'r755', 'r128', 'r756'],
  'Mar de Luna': ['r228', 'r762', 'r763', 'r764', 'r765', 'r766', 'r767', 'r768', 'r769', 'r227', 'r770'],
  'Instituto Espejismo': ['r776', 'r777', 'r778', 'r779', 'r780', 'r781', 'r782', 'r783', 'r224', 'r225', 'r226'],
  'Academia Universal': ['r223', 'r789', 'r790', 'r791', 'r792', 'r793', 'r794', 'r795', 'r796', 'r797', 'r121'],
  'Dragon Link': ['r220', 'r221', 'r803', 'r804', 'r805', 'r806', 'r807', 'r808', 'r809', 'r810', 'r222'],
  'Equipo Zero': ['r816', 'r817', 'r818', 'r819', 'r191', 'r820', 'r821', 'r822', 'r823', 'r76', 'r77'],
  'Vía Láctea': ['r824', 'r825', 'r826', 'r827', 'r828', 'r829', 'r830', 'r831', 'r832', 'r833', 'r834'],
  'Ultramegahiedra': ['r840', 'r841', 'r842', 'r843', 'r844', 'r845', 'r846', 'r847', 'r848', 'r849', 'r850'],
  'Alpino GO': ['r856', 'r857', 'r858', 'r859', 'r860', 'r861', 'r862', 'r863', 'r864', 'r865', 'r866'],
  'Kirkwood GO': ['r872', 'r873', 'r874', 'r875', 'r876', 'r877', 'r878', 'r879', 'r236', 'r237'],
  'Monte Olimpo': ['r885', 'r886', 'r887', 'r888', 'r889', 'r890', 'r891', 'r892', 'r229', 'r893', 'r894'],
  'Garras del Sur': ['r900', 'r901', 'r902', 'r903', 'r904', 'r905', 'r906', 'r907', 'r908', 'r909', 'r910'],
  'Colmillos del Norte': ['r911', 'r912', 'r913', 'r914', 'r915', 'r916', 'r917', 'r918', 'r919', 'r920', 'r921'],
  'Cuerno Demoníaco': ['r900', 'r901', 'r912', 'r914', 'r905', 'r907', 'r918', 'r908', 'r910', 'r921', 'r922'],
  'Sector Quinto': ['r220', 'r235', 'r221', 'r755', 'r231', 'r829', 'r234', 'r233', 'r832', 'r128', 'r232']
};
var WT_T2_ALIUS_POOL = ['Genesis', 'Caos', 'Épsilon', 'Tormenta de Géminis', 'Diamond Dust', 'Polvo de Diamante', 'Prominence'];
function wtTeamStage(id, name, ownTeams, power, fillPool) {
  fillPool = fillPool || WT_T2_ALIUS_POOL;
  var own = ROSTER.filter(function (p) { return ownTeams.indexOf(p.equipo) !== -1 && p.posicion !== 'Portero'; });
  var fill = ROSTER.filter(function (p) { return fillPool.indexOf(p.equipo) !== -1 && ownTeams.indexOf(p.equipo) === -1 && p.posicion !== 'Portero'; });
  var eleven = WT_REAL_ELEVEN[ownTeams[0]];
  if (eleven) {
    own = eleven.map(function (id) { return ROSTER.find(function (p) { return p.id === id; }); }).filter(Boolean);
    own.sort(function (a, b) { return (b.tiro + b.pase + b.defensa + b.especial) - (a.tiro + a.pase + a.defensa + a.especial); });
  }
  var picked = eleven ? own.slice() : own.slice(0, 6);
  // Solo se rellena con jugadores de otros equipos si el propio tiene menos de 3.
  for (var i = 0; picked.length < 3 && i < fill.length; i++) picked.push(fill[i]);
  return { id: id, name: name, power: power, ownIds: own.map(function (p) { return p.id; }), players: wtSquad(picked.map(function (p, k) { return [p.id, Math.round(power + 8 - k * 1.5)]; })) };
}
// Recorrido real de Inazuma Eleven 2 (dado por el usuario). Extras por etapa:
// forcedLoss (derrota de guion), injures (lesionados, con el Raimon), leaves (se va),
// joins ([id, delta de media, nombre], se une siempre con el Raimon).
function wtStageExtra(stage, extra) { return Object.assign(stage, extra); }
function wtUmbrellaStage(id, power) {
  var base = WORLD_TOUR_STAGES.find(function (st) { return st.id === 'umbrella'; });
  return { id: id, name: 'Umbrella', power: power, players: base.players };
}
var WORLD_TOUR_STAGES_T2 = [
  wtStageExtra(wtTeamStage('t2-geminis1', 'Tormenta de Géminis', ['Tormenta de Géminis'], 70), { forcedLoss: true, forcedScore: { my: 0, opp: 40 }, injures: ['r47', 'r46', 'r49'], lossMessage: 'Derrota inevitable ante Tormenta de Géminis: Timmy, Steve y Jim se lesionan y dejan el equipo.' }),
  wtUmbrellaStage('t2-umbrella', 46),
  wtStageExtra(wtTeamStage('t2-servicio', 'Servicio Secreto', ['Servicio Secreto'], 55), { joins: [['r57', -3, 'Conwell']] }),
  wtStageExtra(wtTeamStage('t2-geminis2', 'Tormenta de Géminis', ['Tormenta de Géminis'], 66), { forcedDraw: true, forcedScore: { my: 2, opp: 2 }, leaves: ['r02'], leaveMessage: 'Axel se marcha del equipo.', drawMessage: 'Empate de guion ante Tormenta de Géminis. Axel se marcha del equipo.' }),
  wtStageExtra(wtTeamStage('t2-alpino', 'Alpino', ['Alpino'], 50), { joins: [['r08', -3, 'Shawn']] }),
  wtTeamStage('t2-geminis3', 'Tormenta de Géminis', ['Tormenta de Géminis'], 68),
  wtStageExtra(wtTeamStage('t2-claustro', 'Claustro Sagrado', ['Claustro Sagrado'], 60), { joins: [['r412', -3, 'Scotty']] }),
  wtTeamStage('t2-epsilon1', 'Épsilon', ['Épsilon'], 70),
  wtTeamStage('t2-redux', 'Royal Academy Redux', ['Royal Academy Redux'], 70),
  wtStageExtra(wtTeamStage('t2-triplec', 'Triple C', ['Triple C'], 50), { joins: [['r56', -3, 'Suzette']] }),
  wtTeamStage('t2-epsilon2', 'Épsilon', ['Épsilon'], 72),
  wtStageExtra(wtTeamStage('t2-fauxshore', 'Fauxshore', ['Fauxshore'], 42), { joins: [['r11', -3, 'Darren']] }),
  wtStageExtra(wtTeamStage('t2-genesis1', 'Genesis', ['Genesis'], 91), { forcedLoss: true, injures: ['r03', 'r12', 'r05'], lossMessage: 'Derrota inevitable ante Genesis: Nathan, Tod y Kevin se lesionan y dejan el equipo.' }),
  wtStageExtra(wtTeamStage('t2-marytimes', 'Mary Times', ['Mary Times'], 40), { joins: [['r18', -3, 'Hurley']] }),
  wtStageExtra(wtTeamStage('t2-epsilonplus', 'Épsilon Plus', ['Épsilon Plus'], 78), { joins: [['r42', -2, 'Thor'], ['r02', -2, 'Axel']] }),
  wtStageExtra(wtTeamStage('t2-zeus', 'Zeus', ['Zeus'], 75), { joins: [['r20', -2, 'Byron']] }),
  wtTeamStage('t2-genesis2', 'Genesis', ['Genesis'], 88),
  wtTeamStage('t2-emperadores', 'Emperadores Oscuros', ['Emperadores Oscuros'], 90),
  wtTeamStage('t2-caos', 'Caos', ['Caos'], 94)
];
// ===== Temporada 3 (FFI): rivales de los mundiales, Inazuma Japón =====
// Orden de memoria (ajustable aquí). Reserva de jugadores: equipos de la temporada 3.
var WT_T3_POOL = ['Neo Japón', 'Tarjeteros', 'Ángeles Oscuros', 'FFI Estrellas', 'Orfeo', 'Unicorn', 'Pequeños Gigantes', 'Academia Ogre'];
var WORLD_TOUR_STAGES_T3 = [
  wtTeamStage('t3-leones', 'Leones del desierto', ['Leones del desierto'], 58, WT_T3_POOL),
  wtTeamStage('t3-waves', 'Big Waves', ['Big Waves'], 62, WT_T3_POOL),
  wtTeamStage('t3-neo', 'Neo Japón', ['Neo Japón'], 64, WT_T3_POOL),
  wtTeamStage('t3-dragones', 'Dragones de Fuego', ['Dragones de Fuego'], 68, WT_T3_POOL),
  wtTeamStage('t3-osreis', 'Os Reis', ['Os Reis'], 72, WT_T3_POOL),
  wtTeamStage('t3-knights', 'Knights', ['Knights'], 76, WT_T3_POOL),
  wtTeamStage('t3-orfeo', 'Orfeo', ['Orfeo'], 80, WT_T3_POOL),
  wtTeamStage('t3-angeles', 'Ángeles Oscuros', ['Ángeles Oscuros'], 85, WT_T3_POOL),
  wtTeamStage('t3-gigantes', 'Pequeños Gigantes', ['Pequeños Gigantes'], 90, WT_T3_POOL)
];
// Plantilla por defecto de Inazuma Japón (Temporada 3), con los jugadores reales del roster.
var WORLD_TOUR_IJ_BASE_IDS = [['r01', 72], ['r02', 74], ['r03', 71], ['r04', 73], ['r05', 72], ['r08', 70], ['r11', 69], ['r12', 68], ['r15', 69], ['r18', 68], ['r20', 72], ['r23', 69], ['r42', 70], ['r50', 68], ['r46', 64], ['r47', 64]];
function worldTourSetupSeason() { return G.worldTourSetupSeason === 3 ? 3 : (G.worldTourSetupSeason === 2 ? 2 : 1); }
function worldTourSetupSaga() { return !!G.worldTourSetupSaga; }
window.actionSetWorldTourSaga = function (on) { G.worldTourSetupSaga = !!on; if (on) G.worldTourSetupSeason = 1; render(); };
window.actionSetWorldTourSeason = function (s) { G.worldTourSetupSeason = s === 3 ? 3 : (s === 2 ? 2 : 1); render(); };
var WORLD_TOUR_WIN_BOOST_MIN = 2;
var WORLD_TOUR_WIN_BOOST_MAX = 4;
var WORLD_TOUR_DEFAULT_FORMATION = '442';

function worldTourRandomSquad() {
  // Equipo aleatorio: 11 jugadores reales del ROSTER (cualquier equipo,
  // cualquier época) pero con su media rebajada a menos de 75 para este
  // modo, a petición explícita ("también podrías tener un equipo
  // aleatorio, todos con media de menos de 75").
  var byPos = { Portero: [], Defensa: [], Centrocampista: [], Delantero: [] };
  ROSTER.forEach(function (p) { if (byPos[p.posicion]) byPos[p.posicion].push(p); });
  var need = { Portero: 1, Defensa: 4, Centrocampista: 4, Delantero: 2 };
  var squad = [];
  Object.keys(need).forEach(function (pos) {
    var pool = byPos[pos].slice().sort(function () { return Math.random() - 0.5; });
    for (var i = 0; i < need[pos] && i < pool.length; i++) {
      var src = pool[i];
      var realOvr = (src.tiro + src.pase + src.defensa + src.especial) / 4;
      var ovr = Math.round(clamp(realOvr * 0.68, 42, 74));
      var clone = wtFromRoster(src.id, ovr);
      if (clone) squad.push(clone);
    }
  });
  return squad;
}

// Modo al perder (a petición explícita, "haz dos modos... que se
// reintente desde cero, o que empiezas desde cero pero conservando las
// mejoras de las medias"): 'libre' te deja reintentar el mismo rival sin
// más; 'duro' te manda otra vez al primer rival (Occult) al perder, pero
// tu plantilla conserva todo lo ganado hasta entonces (media y fichajes).
function worldTourSetupMode() { return (G.worldTourSetupMode === 'duro' || G.worldTourSetupMode === 'dificil') ? G.worldTourSetupMode : 'libre'; }
window.actionSetWorldTourSetupMode = function (mode) { G.worldTourSetupMode = mode; render(); };
function worldTourSetupSpecials() { return G.worldTourSetupSpecials !== false; }
window.actionSetWorldTourSpecials = function (on) { G.worldTourSetupSpecials = !!on; render(); };
// 2 opciones más al empezar, a petición explícita: tamaño del draft (1 de
// 3, más control, o 1 de 5, más variedad) y modo Leyenda (los rivales
// suben de fuerza cada vez que completas el recorrido -- se cuenta en
// localStorage, independiente de cada partida). Antes también se podía
// elegir un recorrido corto (hasta el Brain) o completo (hasta el Zeus),
// pero a petición explícita ("no pongas dos modos... son iguales") ya no
// hay elección: SIEMPRE se juega el recorrido completo, con el Ogro
// (equipo final) al terminar el Zeus.
var WORLD_TOUR_LEGEND_KEY = 'inazumaTactilWorldTour_legendWins';
function worldTourLegendWins() { try { return parseInt(localStorage.getItem(WORLD_TOUR_LEGEND_KEY), 10) || 0; } catch (e) { return 0; } }
function worldTourSetupDraftSize() { return G.worldTourSetupDraftSize === 5 ? 5 : 3; }
window.actionSetWorldTourDraftSize = function (n) { G.worldTourSetupDraftSize = n; render(); };
function worldTourSetupLegend() { return !!G.worldTourSetupLegend; }
window.actionSetWorldTourLegend = function (on) { G.worldTourSetupLegend = !!on; render(); };
function worldTourSetupSquadType() { return G.worldTourSetupSquadType === 'random' ? 'random' : 'raimon'; }
window.actionSetWorldTourSquadType = function (type) { G.worldTourSetupSquadType = type; render(); };
// Escudo por defecto del Raimon (no está en TEAM_SHIELD_FILES porque ese
// registro es de equipos RIVALES, pero el archivo sí existe).
var WORLD_TOUR_RAIMON_SHIELD = 'https://inazumarun.es/assets/escudos/raimon.webp';
window.actionSetWorldTourName = function (value) { G.worldTourSetupName = value; };
window.actionSetWorldTourShield = function (name) { G.worldTourSetupShield = name || null; render(); };
function renderWorldTourSetup() {
  var mode = worldTourSetupMode();
  var squadType = worldTourSetupSquadType();
  var customNameHtml = '';
  if (squadType === 'random') {
    var shieldNames = Object.keys(TEAM_SHIELD_FILES).sort(function (a, b) { return a.localeCompare(b); });
    var options = '<option value="">Escudo por defecto</option>' + shieldNames.map(function (n) {
      return '<option value="' + escapeHtml(n) + '"' + (G.worldTourSetupShield === n ? ' selected' : '') + '>' + escapeHtml(n) + '</option>';
    }).join('');
    var shieldPreview = G.worldTourSetupShield ? teamShieldPath(G.worldTourSetupShield) : PLAYER_SHIELD;
    // Mismo patrón que FutDraft 2 jugadores: nombre + escudo elegibles.
    customNameHtml =
      '<div class="panel">' +
        '<h3 style="margin-bottom:8px">Nombre y escudo</h3>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<img class="team-shield" style="width:56px;height:56px;margin:0" src="' + escapeHtml(shieldPreview) + '" alt="">' +
          '<div style="flex:1;min-width:0">' +
            '<label class="dim small">Nombre del equipo</label>' +
            '<input class="select-field" type="text" maxlength="24" data-focus-key="wt-name" placeholder="Tu Equipo" value="' + escapeHtml(G.worldTourSetupName || '') + '" oninput="actionSetWorldTourName(this.value)">' +
          '</div>' +
        '</div>' +
        '<label class="dim small mt">Escudo</label>' +
        '<select class="select-field" onchange="actionSetWorldTourShield(this.value)">' + options + '</select>' +
      '</div>';
  }
  return (
    '<div class="screen">' +
      pageTopHtml('actionBackToMenu()', 'Modo Historia', '🌍') +
      '<div class="panel center-text page-intro">' +
        '<p class="dim small">Recorre los equipos de Inazuma Eleven 1, empezando por el Occult. Cada victoria sube un poco tu media y te deja fichar a un jugador real del equipo derrotado (como un draft).</p>' +
      '</div>' +
      setupFoldStart('mundial-temporada', 'Temporada') +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-tiny' + (worldTourSetupSeason() === 1 ? ' active' : '') + '"' + (worldTourSetupSaga() ? ' disabled' : '') + ' onclick="actionSetWorldTourSeason(1)">Temporada 1</button>' +
          '<button class="btn btn-tiny' + (worldTourSetupSeason() === 2 ? ' active' : '') + '"' + (worldTourSetupSaga() ? ' disabled' : '') + ' onclick="actionSetWorldTourSeason(2)">Temporada 2</button>' +
          '<button class="btn btn-tiny' + (worldTourSetupSeason() === 3 ? ' active' : '') + '"' + (worldTourSetupSaga() ? ' disabled' : '') + ' onclick="actionSetWorldTourSeason(3)">Temporada 3</button>' +
        '</div>' +
        '<p class="dim small center-text mt">' + (worldTourSetupSeason() === 1 ? 'Los equipos de Inazuma Eleven 1, del Occult al Equipo Ogro.' : worldTourSetupSeason() === 2 ? 'Los partidos de la Academia Alius de Inazuma Eleven 2, de Tormenta de Géminis a Caos.' : 'El torneo mundial de Inazuma Eleven 3, con Inazuma Japón, de los Leones del desierto a los Pequeños Gigantes.') + '</p>' +
        '<div class="btn-row mt" style="justify-content:center">' +
          '<button class="btn btn-tiny' + (worldTourSetupSaga() ? ' active' : '') + '" onclick="actionSetWorldTourSaga(true)">Conectar temporadas</button>' +
          '<button class="btn btn-tiny' + (!worldTourSetupSaga() ? ' active' : '') + '" onclick="actionSetWorldTourSaga(false)">Solo esta</button>' +
        '</div>' +
        '<p class="dim small center-text mt">Al completar una temporada, se pasa a la siguiente con tu misma plantilla (moderando la media si va muy alta), hasta terminar la Temporada 3.</p>' +
      setupFoldEnd() +
      setupFoldStart('mundial-tu-equipo', 'Tu equipo') +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-tiny' + (squadType === 'raimon' ? ' active' : '') + '" onclick="actionSetWorldTourSquadType(\'raimon\')">Raimon</button>' +
          '<button class="btn btn-tiny' + (squadType === 'random' ? ' active' : '') + '" onclick="actionSetWorldTourSquadType(\'random\')">Aleatorio</button>' +
        '</div>' +
        '<p class="dim small center-text mt">' + (squadType === 'raimon' ? 'El once base de Inazuma Eleven 1, todos por debajo de 75 de media.' : '11 jugadores al azar de toda la franquicia, también por debajo de 75.') + '</p>' +
      setupFoldEnd() +
      customNameHtml +
      setupFoldStart('mundial-al-perder', 'Al perder') +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-tiny' + (mode === 'libre' ? ' active' : '') + '" onclick="actionSetWorldTourSetupMode(\'libre\')">Reintentar</button>' +
          '<button class="btn btn-tiny' + (mode === 'duro' ? ' active' : '') + '" onclick="actionSetWorldTourSetupMode(\'duro\')">Racha</button>' +
          '<button class="btn btn-tiny' + (mode === 'dificil' ? ' active' : '') + '" onclick="actionSetWorldTourSetupMode(\'dificil\')">Difícil</button>' +
        '</div>' +
        '<p class="dim small center-text mt">' + (mode === 'libre' ? 'Si pierdes, te quedas en el mismo rival y lo repites.' : mode === 'duro' ? 'Si pierdes, vuelves al Occult, pero tu plantilla conserva la media y los fichajes ganados.' : 'Si pierdes, vuelves al Occult con la plantilla inicial de cero, sin ninguna mejora ni fichaje ganado.') + '</p>' +
      setupFoldEnd() +
      setupFoldStart('mundial-draft', 'Draft') +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-tiny' + (worldTourSetupDraftSize() === 3 ? ' active' : '') + '" onclick="actionSetWorldTourDraftSize(3)">1 de 3</button>' +
          '<button class="btn btn-tiny' + (worldTourSetupDraftSize() === 5 ? ' active' : '') + '" onclick="actionSetWorldTourDraftSize(5)">1 de 5</button>' +
        '</div>' +
        '<p class="dim small center-text mt">' + (worldTourSetupDraftSize() === 3 ? 'Menos opciones, más control sobre quién sale.' : 'Más variedad, menos control.') + '</p>' +
      setupFoldEnd() +
      setupFoldStart('mundial-modo-leyenda', 'Modo Leyenda') +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-tiny' + (worldTourSetupLegend() ? ' active' : '') + '" onclick="actionSetWorldTourLegend(true)">Sí</button>' +
          '<button class="btn btn-tiny' + (!worldTourSetupLegend() ? ' active' : '') + '" onclick="actionSetWorldTourLegend(false)">No</button>' +
        '</div>' +
        '<p class="dim small center-text mt">Los rivales suben de fuerza con cada recorrido completo que ya hayas terminado (llevas ' + worldTourLegendWins() + ').</p>' +
      setupFoldEnd() +
      (squadType === 'raimon' ? (
      '<div class="panel">' +
        '<h3 style="margin-bottom:8px" class="center-text">Especiales</h3>' +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn-tiny' + (worldTourSetupSpecials() ? ' active' : '') + '" onclick="actionSetWorldTourSpecials(true)">Sí</button>' +
          '<button class="btn btn-tiny' + (!worldTourSetupSpecials() ? ' active' : '') + '" onclick="actionSetWorldTourSpecials(false)">No</button>' +
        '</div>' +
        '<p class="dim small center-text mt">' + (WORLD_TOUR_SPECIAL_NAMES[worldTourSetupSeason()] ? WORLD_TOUR_SPECIAL_NAMES[worldTourSetupSeason()] + ' en el banquillo (personajes secundarios de refuerzo).' : 'Esta temporada no tiene jugadores especiales.') + '</p>' +
      '</div>') : '') +
      '<div class="panel center-text">' +
        '<button class="btn btn-primary btn-block" onclick="actionStartWorldTour()">Listo</button>' +
      '</div>' +
    '</div>'
  );
}
window.actionGoWorldTour = function () {
  G.screen = 'worldTourSetup';
  render();
};
window.actionStartWorldTour = function () {
  var useRandom = worldTourSetupSquadType() === 'random';
  var squad = useRandom ? worldTourRandomSquad() : (worldTourSetupSeason() === 3 ? wtSquad(WORLD_TOUR_IJ_BASE_IDS) : WORLD_TOUR_RAIMON_BASE.map(function (p) { return Object.assign({}, p); }));
  if (!useRandom && worldTourSetupSpecials()) squad = squad.concat(worldTourSpecialsFor(worldTourSetupSeason()).map(function (p) { return Object.assign({}, p); }));
  var legend = worldTourSetupLegend();
  var legendBoost = legend ? worldTourLegendWins() * 3 : 0;
  // Modo Leyenda: los rivales suben de fuerza según cuántos recorridos
  // completos llevas ya terminados (contador en localStorage, no en esta
  // partida) -- clonado aparte para no tocar nunca la potencia base.
  // Siempre el recorrido completo (ver comentario de arriba).
  var saga = worldTourSetupSaga();
  var season = saga ? 1 : worldTourSetupSeason();
  if (season === 2 && !useRandom) squad = worldTourAddT2Joins(squad);
  var seasonBoost = season === 2 ? 10 : 0;
  if (seasonBoost && !useRandom) squad.forEach(function (p) { p.tiro += seasonBoost; p.pase += seasonBoost; p.defensa += seasonBoost; p.especial += seasonBoost; });
  var stages = (season === 3 ? WORLD_TOUR_STAGES_T3 : season === 2 ? WORLD_TOUR_STAGES_T2 : WORLD_TOUR_STAGES).slice().map(function (st) {
    return legendBoost ? Object.assign({}, st, { power: Math.min(99, st.power + legendBoost) }) : st;
  });
  G.worldTour = {
    squad: squad,
    // Plantilla inicial guardada tal cual (clones aparte, no referencias)
    // para el modo Difícil: al perder, se vuelve a ESTA plantilla exacta,
    // sin ninguna de las mejoras ni fichajes ganados -- a petición
    // explícita ("un modo donde cuando pierdes, vuelves a empezar desde
    // el Occult y sin las mejoras ni nada, como un modo difícil").
    startingSquad: squad.map(function (p) { return Object.assign({}, p); }),
    isRaimon: !useRandom,
    season: season,
    saga: saga,
    teamName: useRandom ? ((G.worldTourSetupName || '').trim() || 'Tu Equipo') : (season === 3 ? 'Inazuma Japón' : 'Raimon'),
    teamShieldName: useRandom ? (G.worldTourSetupShield || null) : null,
    formationId: WORLD_TOUR_DEFAULT_FORMATION,
    captainId: null,
    stages: stages,
    draftSize: worldTourSetupDraftSize(),
    legend: legend,
    stageIndex: 0,
    cleared: [],
    pendingDraft: null,
    pendingEvent: null,
    won: false,
    mode: worldTourSetupMode(),
    // Entrenador por defecto: Hillman con el Raimon, uno al azar con un
    // equipo aleatorio (se puede cambiar en Alineación).
    coachId: !useRandom ? 'c01' : COACHES[Math.floor(Math.random() * COACHES.length)].id,
    lastLossMessage: null,
    lastJoinMessage: null,
    injuries: [],
    suspended: [],
    eventMessage: null
  };
  G.screen = 'worldTourHome';
  render();
};
// Misma tarjeta de "Tú vs rival" que Modo Carrera, pero con tu nombre y
// escudo del Modo Mundial (antes salía "Tú" con el escudo de la web,
// otro sitio donde se coló el mismo bug).
function worldTourMatchupCardHtml(oppName, contextLabel) {
  var wt = G.worldTour;
  var youSideHtml =
    '<div class="matchup-side" onclick="actionOpenTeamCard(\'' + wt.teamName.replace(/'/g, '') + '\')">' +
      '<img class="matchup-shield" src="' + escapeHtml(worldTourShieldPath()) + '" alt="">' +
      '<div class="matchup-name">' + escapeHtml(wt.teamName) + '</div>' +
    '</div>';
  var oppSideHtml =
    '<div class="matchup-side" onclick="actionOpenTeamCard(\'' + oppName.replace(/'/g, '') + '\')">' +
      '<img class="matchup-shield" src="' + escapeHtml(teamShieldPath(oppName)) + '" alt="">' +
      '<div class="matchup-name">' + escapeHtml(oppName) + '</div>' +
    '</div>';
  return '<div class="panel matchup-card">' +
    (contextLabel ? '<p class="dim small center-text">' + contextLabel + '</p>' : '') +
    '<div class="matchup-row">' + youSideHtml + '<div class="matchup-vs">VS</div>' + oppSideHtml + '</div>' +
  '</div>';
}
function worldTourShieldPath() {
  var wt = G.worldTour;
  if (!wt) return WORLD_TOUR_RAIMON_SHIELD;
  if (wt.isRaimon) return wt.season === 3 ? teamShieldPath('Inazuma Japon') : WORLD_TOUR_RAIMON_SHIELD;
  return wt.teamShieldName ? teamShieldPath(wt.teamShieldName) : PLAYER_SHIELD;
}

// Evento aleatorio entre partido y partido (a petición explícita: "que
// alguno suba 5 puntos, alguno pierda 4, algún jugador se lesione y no
// pueda jugar"). Se resuelve después de CADA partido (ganado o perdido).
// Las lesiones se cuentan en partidos, no en tiempo -- cada partido que
// juegas les resta 1 (worldTourTickInjuries); mientras dura, el jugador
// se manda al fondo de la plantilla para que slice(0, 11) no lo escoja
// solo en las pantallas que ya construyen el once así (Alineación, la
// vista previa y el propio partido).
function worldTourTickInjuries(wt) {
  wt.squad.forEach(function (p) { if (p.injuredMatches > 0) p.injuredMatches--; });
}
// Solo tras GANAR (nunca al perder) -- a petición explícita. Se guarda
// como wt.pendingEvent (no un simple texto) para poder enseñarlo en su
// propia pantalla con dibujo, en vez de una línea suelta en Jornada.
function worldTourRandomEvent(wt) {
  worldTourTickInjuries(wt);
  wt.pendingEvent = null;
  if (Math.random() > 0.5 || !wt.squad.length) return;
  var pool = wt.squad.filter(function (p) { return !(p.injuredMatches > 0); });
  if (!pool.length) return;
  var p = pool[Math.floor(Math.random() * pool.length)];
  var roll = Math.random();
  if (roll < 0.4) {
    p.tiro += 5; p.pase += 5; p.defensa += 5; p.especial += 5;
    wt.pendingEvent = { kind: 'boost', player: p, title: '¡Racha de forma!', text: p.nombre + ' sube +5 de media.' };
  } else if (roll < 0.75) {
    p.tiro = Math.max(20, p.tiro - 4); p.pase = Math.max(20, p.pase - 4); p.defensa = Math.max(20, p.defensa - 4); p.especial = Math.max(20, p.especial - 4);
    wt.pendingEvent = { kind: 'drop', player: p, title: 'Bajón de forma', text: p.nombre + ' baja -4 de media.' };
  } else {
    var matches = rand(1, 2);
    p.injuredMatches = matches;
    var idx = wt.squad.indexOf(p);
    if (idx !== -1) { wt.squad.splice(idx, 1); wt.squad.push(p); }
    wt.pendingEvent = { kind: 'injury', player: p, title: 'Lesión', text: p.nombre + ' no podrá jugar ' + matches + ' partido' + (matches > 1 ? 's' : '') + '.' };
  }
}

// ===== Lesiones y rojas en el Modo Mundial =====
function worldTourPlayerStatus(id) {
  var wt = G.worldTour;
  if (!wt) return null;
  var inj = (wt.injuries || []).find(function (i) { return i.id === id; });
  if (inj) return { type: 'injury', left: inj.matchesLeft };
  if ((wt.suspended || []).indexOf(id) !== -1) return { type: 'red' };
  return null;
}
function playerStatusHook(id) {
  if (!G.worldTour || String(G.screen).indexOf('worldTour') !== 0) return null;
  return worldTourPlayerStatus(id);
}
// Los no disponibles salen del once: se cambian por el mejor suplente disponible (misma posición si hay).
function worldTourAutoBench() {
  var wt = G.worldTour;
  for (var i = 0; i < Math.min(11, wt.squad.length); i++) {
    if (!worldTourPlayerStatus(wt.squad[i].id)) continue;
    var best = -1;
    for (var j = 11; j < wt.squad.length; j++) {
      if (worldTourPlayerStatus(wt.squad[j].id)) continue;
      var better = best === -1 || (wt.squad[j].posicion === wt.squad[i].posicion && wt.squad[best].posicion !== wt.squad[i].posicion) || (((wt.squad[j].posicion === wt.squad[i].posicion) === (wt.squad[best].posicion === wt.squad[i].posicion)) && futDraftPlayerScore(wt.squad[j]) > futDraftPlayerScore(wt.squad[best]));
      if (better) best = j;
    }
    if (best !== -1) { var tmp = wt.squad[i]; wt.squad[i] = wt.squad[best]; wt.squad[best] = tmp; if (wt.captainId === tmp.id) wt.captainId = null; }
  }
}
// Tras cada partido: se cumplen las bajas anteriores y se anotan las nuevas (del partido en vivo o al azar).
function worldTourApplyMatchEvents(wt, live) {
  wt.injuries = (wt.injuries || []).map(function (i) { return { id: i.id, matchesLeft: i.matchesLeft - 1 }; }).filter(function (i) { return i.matchesLeft > 0; });
  wt.suspended = [];
  var starters = wt.squad.slice(0, 11);
  var sent = ((live && live.sentOff) || []).slice();
  var hurt = ((live && live.injured) || []).slice();
  if (!(live && live.visualMode === 'dots')) {
    if (starters.length && Math.random() < 0.03) sent.push(starters[Math.floor(Math.random() * starters.length)].id);
    if (starters.length && Math.random() < 0.04) hurt.push(starters[Math.floor(Math.random() * starters.length)].id);
  }
  var names = [];
  sent.forEach(function (id) { var p = wt.squad.find(function (x) { return x.id === id; }); if (p && wt.suspended.indexOf(id) === -1) { wt.suspended.push(id); names.push(p.nombre + ' sancionado por roja, se pierde el próximo partido'); } });
  hurt.forEach(function (id) { var p = wt.squad.find(function (x) { return x.id === id; }); if (p && !wt.injuries.some(function (i) { return i.id === id; }) && wt.suspended.indexOf(id) === -1) { var n = 1 + Math.floor(Math.random() * 3); wt.injuries.push({ id: id, matchesLeft: n }); names.push(p.nombre + ' lesionado, ' + n + ' partido' + (n === 1 ? '' : 's')); } });
  wt.eventMessage = names.length ? names.join('. ') + '.' : null;
  worldTourAutoBench();
}
// ===== Modo Saga: conectar las 3 temporadas =====
// Media máxima con la que se entra a cada temporada siguiente (si el equipo va más alto, se modera).
var WORLD_TOUR_SAGA_CAPS = { 2: 64, 3: 84 };
// Con el Raimon, al pasar a la Temporada 2 solo sigues con los del Raimon
// (plantilla inicial y los que se unen por historia) y 7 más que eliges a
// mano entre el resto de tu plantilla, a petición explícita.
var WORLD_TOUR_SAGA_KEEP_EXTRAS = 7;
function worldTourSagaRaimonIds(wt) {
  var ids = (wt.startingSquad || []).map(function (p) { return p.id; }).concat(['r04', 'r10', 'r16']);
  Object.keys(WORLD_TOUR_STORY_JOINS).forEach(function (k) { WORLD_TOUR_STORY_JOINS[k].forEach(function (j) { ids.push(j[0]); }); });
  return ids;
}
function worldTourSagaExtras(wt) {
  var ids = worldTourSagaRaimonIds(wt);
  return wt.squad.filter(function (p) { return ids.indexOf(p.id) === -1; });
}
function worldTourAdvanceSaga(wt) {
  var nextSeason = wt.season + 1;
  var cap = WORLD_TOUR_SAGA_CAPS[nextSeason];
  var avg = wt.squad.reduce(function (s, p) { return s + (p.tiro + p.pase + p.defensa + p.especial) / 4; }, 0) / wt.squad.length;
  var moderated = avg > cap;
  if (moderated) {
    var factor = cap / avg;
    wt.squad.forEach(function (p) { ['tiro', 'pase', 'defensa', 'especial'].forEach(function (k) { p[k] = Math.max(30, Math.round(p[k] * factor)); }); });
  }
  if (nextSeason === 2 && wt.isRaimon) wt.squad = worldTourAddT2Joins(wt.squad);
  if (nextSeason === 3 && wt.isRaimon) wt.teamName = 'Inazuma Japón';
  wt.season = nextSeason;
  wt.stages = (nextSeason === 3 ? WORLD_TOUR_STAGES_T3 : WORLD_TOUR_STAGES_T2).slice();
  wt.stageIndex = 0;
  wt.cleared = [];
  wt.pendingDraft = null;
  wt.lastJoinMessage = null;
  wt.sagaMessage = '🏆 Empieza la Temporada ' + nextSeason + '.' + (moderated ? ' Tu equipo se ha moderado a un nivel razonable para esta etapa.' : '');
}
function worldTourLineup() {
  return futDraftBuildLineup(G.worldTour.squad.slice(0, 11), G.worldTour.formationId || WORLD_TOUR_DEFAULT_FORMATION);
}
function worldTourTeamScore() {
  return futDraftTeamScore(worldTourLineup(), G.worldTour.captainId || null);
}
var WT_ALIUS_STRONG_TEAMS = ["Tormenta de Géminis", "Genesis", "Épsilon", "Épsilon Plus", "Emperadores Oscuros", "Caos"];
// Dificultad progresiva en la Temporada 2: el rival nunca va muy por debajo de tu nivel actual
// (si vas a 75 y el rival de base es 40, sube a al menos 70), y los equipos fuertes de la Academia
// Alius (Tormenta de Géminis, Genesis, Épsilon, Épsilon Plus, Emperadores Oscuros, Caos) llevan un
// extra encima de eso -- a petición explícita.
function worldTourEffectivePower(stage) {
  var wt = G.worldTour;
  var power = stage.power;
  if (wt && wt.season === 2) {
    var myScore = worldTourTeamScore();
    power = Math.max(power, myScore - 5);
    if (WT_ALIUS_STRONG_TEAMS.indexOf(stage.name) !== -1) power += 6;
  }
  return Math.min(99, Math.round(power));
}
function worldTourStage() {
  return (G.worldTour.stages || WORLD_TOUR_STAGES)[G.worldTour.stageIndex];
}

// ===== Alineación ("Prepartido"): misma pantalla y mecánica que "Tu
// once inicial" de FutDraft (renderFutDraftTeam/selectFutDraftPlayer/
// setFutDraftFormation), puenteando G.futdraft con la plantilla del
// Modo Mundial -- a petición explícita ("que tenga el formato que hay
// en mi plantilla... poner alineación, prepartido, elegir bien a los
// jugadores"). Al salir se guarda de vuelta en G.worldTour.
window.actionGoWorldTourLineup = function () {
  var wt = G.worldTour;
  G.futdraft = {
    lineup: futDraftBuildLineup(wt.squad.slice(0, 11), wt.formationId || WORLD_TOUR_DEFAULT_FORMATION),
    bench: wt.squad.slice(11),
    captainId: wt.captainId || null,
    formation: wt.formationId || WORLD_TOUR_DEFAULT_FORMATION,
    mode: 'worldTour',
    swapSelectedId: null, pickingCaptain: false
  };
  G.screen = 'worldTourLineup';
  render();
};
window.actionWorldTourLineupDone = function () {
  var wt = G.worldTour, f = G.futdraft;
  wt.squad = f.lineup.map(function (s) { return s.player; }).concat(f.bench);
  wt.formationId = f.formation;
  wt.captainId = f.captainId;
  worldTourAutoBench();
  G.screen = 'worldTourHome';
  render();
};
// Misma pantalla que renderFutDraftTeam (js/futdraft-draft.js), pero con
// el botón de salida propio del Modo Mundial en vez de "Volver al menú"
// y sin el pie de compartir/empezar torneo (no aplica aquí).
function renderWorldTourLineup() {
  var f = G.futdraft;
  var hasBench = f.bench.length > 0;
  var breakdown = futDraftScoreBreakdown(f.lineup, f.captainId);
  var captain = f.captainId ? f.lineup.find(function (s) { return s.player.id === f.captainId; }) : null;
  var styleOptionsHtml = CAREER_PLAY_STYLES.map(function (s) {
    return '<option value="' + s.id + '"' + (s.id === worldTourPlayStyle(G.worldTour).id ? ' selected' : '') + '>' + s.name + '</option>';
  }).join('');
  var captainHint = !captain
    ? 'Sin capitán elegido.'
    : 'Capitán: <strong>' + escapeHtml(captain.player.nombre) + '</strong> (' + (breakdown.captainBonus > 0 ? '+' : '') + breakdown.captainBonus + ' a la puntuación).';
  var elementCounts = futDraftElementCounts(f);
  var elementCountsHtml = TYPES.map(function (t) {
    return '<span class="type-badge type-' + t.toLowerCase().replace('ñ', 'n') + '" style="margin:2px">' + getTypeSymbol(t) + ' ' + elementCounts[t] + '/' + FUTDRAFT_SYNERGY_THRESHOLD + '</span>';
  }).join(' ');
  var benchHtml = '';
  if (hasBench) {
    var benchItemsHtml = f.bench.map(function (p) {
      var cls = 'pitch-player futdraft-swappable' + (f.swapSelectedId === p.id ? ' selected' : '');
      var injured = p.injuredMatches > 0;
      return '<div class="' + cls + '" onclick="selectFutDraftPlayer(\'' + p.id + '\')">' + (f.captainId === p.id ? '<span class="futdraft-captain-badge" title="Capitán"><span class="captain-armband">C</span></span>' : '') + pitchMediaBadgeHtml(p) + pitchAffinityBadgeHtml(p) + avatarHtml(p) + '<span class="pitch-player-name">' + escapeHtml(p.nombre) + (injured ? ' 🤕' : '') + '</span></div>';
    }).join('');
    benchHtml = '<div class="panel"><h3 style="margin-bottom:4px">Banquillo</h3><div class="pitch-row" style="justify-content:center;flex-wrap:wrap">' + benchItemsHtml + '</div></div>';
  }
  return (
    '<div class="screen">' +
      '<div class="panel center-text">' +
        '<button class="btn btn-outline btn-block" onclick="actionWorldTourLineupDone()">Listo</button>' +
        '<h2 class="panel-title mt mb0">Alineación</h2>' +
        '<p class="dim small">Puntuación de equipo: <strong style="color:var(--accent-2)">' + breakdown.total + '</strong> / 100</p>' +
        '<p class="dim small">' + (f.moveMode ? 'Toca a dos jugadores para cambiarlos.' : 'Toca a un jugador para ver su tarjeta. Activa Mover para cambiar titulares.') + '</p>' +
        (f.blockedMsg ? '<p class="dim small" style="color:var(--danger)">' + escapeHtml(f.blockedMsg) + '</p>' : '') +
        captainChipHtml(captain, captainHint) +
        '<div class="pitch-actions">' +
          pitchActionBtn('<span class="captain-armband captain-armband-icon">C</span>', 'Capitán', 'Toca un titular…', f.pickingCaptain, 'toggleFutDraftCaptainMode()') +
          pitchActionBtn('🔀', 'Mover', 'Mover activado', f.moveMode, 'actionToggleFutDraftMove()') +
        '</div>' +
      '</div>' +
      tacTabsHtml() +
      (G.tacTab === 'tactica'
        ? '<div class="panel">' +
            '<h3 style="margin-bottom:8px">Estilo de juego</h3>' +
            '<select class="select-field" onchange="actionSetWorldTourPlayStyle(this.value)">' + styleOptionsHtml + '</select>' +
          '</div>' +
          '<div class="panel">' +
            '<h3 style="margin-bottom:4px">Entrenador</h3>' +
            '<p class="dim small">Suma ataque y defensa, y con su intensidad.</p>' +
            (coachById(G.worldTour.coachId) ? coachCardHtml(coachById(G.worldTour.coachId), true, '') : '') +
          '</div>' +
          tacticsPanelHtml({ foul: G.worldTour.foulStyle || 'medio', intensity: G.worldTour.intensity || 'media' }, 'actionSetWorldTourTactic', false)
        : '<div class="panel">' +
            '<h3 style="margin-bottom:8px">Formación</h3>' +
            formationPickerHtml('mundial', f.formation, futDraftAvailableFormations(), 'setFutDraftFormation') +
            renderFutDraftLineupPitch(f) +
          '</div>' +
          benchHtml +
          '<div class="panel center-text">' +
            '<h3 style="margin-bottom:8px">Bonificación de atributo</h3>' +
            '<div>' + elementCountsHtml + '</div>' +
          '</div>') +
    '</div>'
  );
}

// Mini-mapa de progreso: una tira horizontal con un punto por rival
// (recorrido, actual, bloqueado) unidos por una línea, en vez de solo el
// texto "Equipo X de Y" -- a petición explícita ("un mini-mapa de progreso...
// como el mapa de un roguelike de verdad"). El punto actual lleva un id
// fijo para que worldTourScrollMiniMap lo centre tras cada render.
function worldTourMiniMapHtml(wt) {
  var nodes = wt.stages.map(function (st, i) {
    var state = i < wt.stageIndex ? 'done' : (i === wt.stageIndex ? 'current' : 'locked');
    // Escudo real del equipo en vez de solo un número, a petición explícita
    // ("pon escudos y dejalo mas bonito"), con una insignia de check verde
    // encima para los ya superados y candado para los que aún no tocan.
    var badge = state === 'done' ? '<span class="wt-minimap-badge wt-minimap-badge-done">✓</span>' : (state === 'locked' ? '<span class="wt-minimap-badge wt-minimap-badge-locked">🔒</span>' : '');
    return (
      '<div class="wt-minimap-node wt-minimap-node-' + state + '"' + (state === 'current' ? ' id="wtMinimapCurrent"' : '') + '>' +
        '<span class="wt-minimap-dot"><img src="' + escapeHtml(teamShieldPath(st.name)) + '" alt="">' + badge + '</span>' +
        '<span class="wt-minimap-label">' + escapeHtml(st.name) + '</span>' +
      '</div>'
    );
  }).join('');
  var progressPct = wt.stages.length > 1 ? (wt.stageIndex / (wt.stages.length - 1)) * 100 : 0;
  return '<div class="wt-minimap" id="wtMinimapScroll"><div class="wt-minimap-track" style="--wt-progress:' + progressPct.toFixed(1) + '%">' + nodes + '</div></div>';
}
// Centra el punto actual del mini-mapa tras pintarlo -- llamado desde
// render() en state-nav.js, mismo patrón que drawMapConnections() para el
// mapa del roguelike clásico.
function worldTourScrollMiniMap() {
  var el = document.getElementById('wtMinimapCurrent');
  if (!el) return;
  try { el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: (G.meta && G.meta.reduceMotion) ? 'auto' : 'smooth' }); } catch (e) {}
}
function renderWorldTourSagaPick() {
  var wt = G.worldTour;
  var sel = wt.pendingSagaPick.selected;
  var extras = worldTourSagaExtras(wt).slice().sort(function (a, b) { return b.tiro - a.tiro; });
  var itemsHtml = extras.map(function (p) {
    var on = sel.indexOf(p.id) !== -1;
    return '<button class="shop-item" style="width:100%;text-align:left' + (on ? ';border-color:var(--accent-2);box-shadow:0 0 0 2px var(--accent-2)' : '') + '" onclick="actionToggleWorldTourSagaPick(\'' + p.id + '\')">' +
      avatarHtml(p) +
      '<div style="flex:1"><strong>' + escapeHtml(p.nombre) + '</strong><div class="dim small">' + escapeHtml(p.posicion) + ' · ' + Math.round(p.tiro) + ' de media</div></div>' +
      (on ? '<span style="color:var(--accent-2);font-size:1.3rem">✓</span>' : '') +
    '</button>';
  }).join('');
  var ready = sel.length === WORLD_TOUR_SAGA_KEEP_EXTRAS;
  return (
    '<div class="screen">' +
      '<div class="panel center-text">' +
        '<h2 class="panel-title mb0">🏆 Temporada 1 completada</h2>' +
        '<p class="dim small">En la Temporada 2 sigues con los del Raimon. Elige ' + WORLD_TOUR_SAGA_KEEP_EXTRAS + ' jugadores más de tu plantilla para llevarte: <strong style="color:var(--accent-2)">' + sel.length + ' de ' + WORLD_TOUR_SAGA_KEEP_EXTRAS + '</strong></p>' +
      '</div>' +
      '<div class="panel">' + itemsHtml + '</div>' +
      '<div class="panel center-text"><button class="btn btn-primary btn-block"' + (ready ? '' : ' disabled') + ' onclick="actionConfirmWorldTourSagaPick()">Empezar Temporada 2</button></div>' +
    '</div>'
  );
}
window.actionToggleWorldTourSagaPick = function (id) {
  var pick = G.worldTour && G.worldTour.pendingSagaPick;
  if (!pick) return;
  var i = pick.selected.indexOf(id);
  if (i !== -1) pick.selected.splice(i, 1);
  else if (pick.selected.length < WORLD_TOUR_SAGA_KEEP_EXTRAS) pick.selected.push(id);
  render();
};
window.actionConfirmWorldTourSagaPick = function () {
  var wt = G.worldTour;
  var pick = wt && wt.pendingSagaPick;
  if (!pick || pick.selected.length !== WORLD_TOUR_SAGA_KEEP_EXTRAS) return;
  var raimonIds = worldTourSagaRaimonIds(wt);
  wt.squad = wt.squad.filter(function (p) { return raimonIds.indexOf(p.id) !== -1 || pick.selected.indexOf(p.id) !== -1; });
  if (wt.captainId && !wt.squad.some(function (p) { return p.id === wt.captainId; })) wt.captainId = null;
  wt.injuries = (wt.injuries || []).filter(function (inj) { return wt.squad.some(function (p) { return p.id === inj.id; }); });
  wt.suspended = (wt.suspended || []).filter(function (id) { return wt.squad.some(function (p) { return p.id === id; }); });
  wt.pendingSagaPick = null;
  worldTourAdvanceSaga(wt);
  G.screen = 'worldTourHome';
  render();
};
function renderWorldTourHome() {
  var wt = G.worldTour;
  if (wt.pendingSagaPick) return renderWorldTourSagaPick();
  if (wt.won) {
    return '<div class="screen">' +
      '<div class="panel center-text">' +
        '<h2 class="panel-title mb0">🏆 ¡Recorrido completo!</h2>' +
        '<p class="dim small">Has ganado a todos los equipos, incluido el ' + escapeHtml(wt.stages[wt.stages.length - 1].name) + '. Media final del equipo: <strong style="color:var(--accent-2)">' + worldTourTeamScore() + '</strong> / 100.</p>' +
      '</div>' +
      '<div class="panel">' + renderFutDraftPitch(wt.squad.slice(0, 11), wt.formationId || WORLD_TOUR_DEFAULT_FORMATION, false, coachById(wt.coachId) || null) + '</div>' +
      '<div class="panel center-text"><button class="btn btn-primary btn-block" onclick="actionGoWorldTour()">Repetir</button><button class="btn btn-outline btn-block mt" onclick="actionBackToMenu()">Menú</button></div>' +
    '</div>';
  }
  var stage = worldTourStage();
  var score = worldTourTeamScore();
  return (
    '<div class="screen">' +
      pageTopHtml('actionBackToMenu()', 'Modo Historia', '🌍') +
      '<div class="panel center-text page-intro">' +
        '<p class="dim small">Equipo ' + (wt.stageIndex + 1) + ' de ' + wt.stages.length + ' · Tu media: <strong style="color:var(--accent-2)">' + score + '</strong> / 100 · Plantilla: ' + wt.squad.length + '</p>' +
      '</div>' +
      worldTourMiniMapHtml(wt) +
      (wt.lastLossMessage ? '<div class="panel center-text"><p class="dim small">' + escapeHtml(wt.lastLossMessage) + '</p></div>' : '') +
      (wt.lastJoinMessage ? '<div class="panel center-text"><p class="dim small">' + escapeHtml(wt.lastJoinMessage) + '</p></div>' : '') +
      (wt.sagaMessage ? '<div class="panel center-text" style="border-color:var(--accent-2)"><p class="dim small" style="color:var(--accent-2)">' + escapeHtml(wt.sagaMessage) + '</p></div>' : '') +
      (wt.eventMessage ? '<div class="panel center-text"><p class="dim small" style="color:var(--danger)">' + escapeHtml(wt.eventMessage) + '</p></div>' : '') +
      worldTourMatchupCardHtml(stage.name, 'Rival ' + (wt.stageIndex + 1)) +
      '<div class="panel">' +
        '' + matchModePickerHtml({ ver: 'actionPlayWorldTourMatch()', decidir: 'actionPlayWorldTourMatch()', simular: 'actionSimulateWorldTourMatch()', saltar: 'actionSkipWorldTourMatch()' }) + '' +
        '<button class="btn btn-outline btn-block mt" onclick="actionGoWorldTourLineup()">Alineación</button>' +
      '</div>' +
      '<div class="panel"><h3 style="margin-bottom:8px">Tu once</h3>' + renderFutDraftPitch(wt.squad.slice(0, 11), wt.formationId || WORLD_TOUR_DEFAULT_FORMATION, false, coachById(wt.coachId) || null) + '</div>' +
    '</div>'
  );
}

// Las 3 formas de vivir el partido (mismo patrón que Jornada de Modo
// Carrera): puentea G.futdraft con la plantilla del Modo Mundial y
// reutiliza el motor de FutDraft/Liga tal cual.
// Estilo de juego (muy defensiva/defensiva/equilibrado/ofensiva/muy
// ofensiva), igual que Gestionar plantilla de Modo Carrera -- a petición
// explícita ("haz que en modo mundial puedas configurar formación y
// defensivo, muy defensivo, equilibrado, ofensivo... como en modo
// carrera"). Reutiliza CAREER_PLAY_STYLES/CAREER_PLAY_STYLE_CONTRADICTION_DAMPEN
// tal cual (misma escala, mismo criterio de sinergia con la formación).
function worldTourPlayStyle(wt) {
  return CAREER_PLAY_STYLES.find(function (s) { return s.id === wt.playStyle; }) || CAREER_PLAY_STYLES[2];
}
function worldTourPlayStyleModifiers(wt) {
  var style = worldTourPlayStyle(wt);
  var formation = FUTDRAFT_FORMATIONS.find(function (ft) { return ft.id === (wt.formationId || WORLD_TOUR_DEFAULT_FORMATION); }) || FUTDRAFT_FORMATIONS[0];
  var styleLean = style.atk - style.def;
  var formationLean = formation.atk - formation.def;
  var aligned = styleLean === 0 || formationLean === 0 || (styleLean > 0) === (formationLean > 0);
  var blend = aligned ? 1 : CAREER_PLAY_STYLE_CONTRADICTION_DAMPEN;
  return { atk: 1 + (style.atk - 1) * blend, def: 1 + (style.def - 1) * blend };
}
window.actionSetWorldTourTactic = function (key, val) {
  var wt = G.worldTour;
  if (key === 'foul') wt.foulStyle = val; else if (key === 'intensity') wt.intensity = val;
  render();
};
window.actionSetWorldTourPlayStyle = function (id) {
  if (!CAREER_PLAY_STYLES.some(function (s) { return s.id === id; })) return;
  G.worldTour.playStyle = id;
  render();
};
function worldTourBridgeFutdraft(stage) {
  var wt = G.worldTour;
  worldTourAutoBench();
  // El aviso de "fulano se une al equipo" solo tiene sentido justo tras
  // la victoria que lo trae -- antes se quedaba pegado en pantalla en
  // TODOS los partidos siguientes hasta el próximo fichaje, a petición
  // explícita ("el mensaje de jude sharp se une al equipo no tiene que
  // quedarse para todos los partidos"). Se borra en cuanto empiezas el
  // partido siguiente (Jugar/Simular/Saltar), que es cuando ya lo has visto.
  wt.lastJoinMessage = null;
  wt.sagaMessage = null;
  var lineup = worldTourLineup();
  // Goleadores rivales reales del equipo de la etapa (no del pool
  // genérico de "no drafteados"), sin porteros -- a petición explícita
  // ("los jugadores que te puedan meter gol en cada equipo, sean los de
  // su propio equipo... menos los porteros").
  var oppPlayersOverride = stage ? stage.players.filter(function (p) { return p.posicion !== 'Portero'; }) : null;
  // Contra un equipo, solo juegan sus propios jugadores (el relleno de otros equipos es solo para el draft).
  if (stage && stage.ownIds && stage.ownIds.length) {
    var ownOnlyOpp = oppPlayersOverride.filter(function (p) { return stage.ownIds.indexOf(p.id) !== -1; });
    if (ownOnlyOpp.length) oppPlayersOverride = ownOnlyOpp;
  }
  var styleMods = worldTourPlayStyleModifiers(wt);
  G.futdraft = { coach: coachById(wt.coachId), coachChosenStyle: wt.playStyle || 'equilibrado', lineup: lineup, squad: wt.squad.slice(), captainId: wt.captainId || null, formation: wt.formationId || WORLD_TOUR_DEFAULT_FORMATION, condition: 'ninguna', tactics: { foul: wt.foulStyle || 'medio', intensity: wt.intensity || 'media' }, teamScoreOverride: futDraftTeamScore(lineup, wt.captainId || null), oppPlayersOverride: oppPlayersOverride && oppPlayersOverride.length ? oppPlayersOverride : null, styleAtkMult: styleMods.atk, styleDefMult: styleMods.def };
}
window.actionSimulateWorldTourMatch = function (visualMode) {
  var stage = worldTourStage();
  if (!stage || G.worldTour.won) return;
  worldTourBridgeFutdraft(stage);
  var sim = worldTourRigSim(stage, futDraftSimulateMatchCore(worldTourEffectivePower(stage)));
  G.futdraft.live = {
    oppSide: { name: stage.name }, modifier: sim.modifier,
    minute: 0, pending: sim.timeline.slice(), revealed: [],
    myGoals: 0, oppGoals: 0, finalMyGoals: sim.myGoals, finalOppGoals: sim.oppGoals,
    myAtk: sim.myAtk, myDef: sim.myDef, effectiveOppPower: sim.effectiveOppPower,
    inExtraTime: false, allowDraw: false, onFinish: finishWorldTourMatch,
    isCareer: false, isWorldTour: true, youAreHome: true,
    visualMode: visualMode || 'avatars',
    done: false
  };
  G.screen = 'futdraftLive';
  playKickoffSound();
  render();
  futDraftLiveTick();
};
window.actionPlayWorldTourMatch = function () { actionSimulateWorldTourMatch('dots'); };
window.actionSkipWorldTourMatch = function () {
  var stage = worldTourStage();
  if (!stage || G.worldTour.won) return;
  worldTourBridgeFutdraft(stage);
  var sim = worldTourRigSim(stage, futDraftSimulateMatchCore(worldTourEffectivePower(stage)));
  G.futdraft.live = { oppSide: { name: stage.name }, modifier: sim.modifier, myGoals: sim.myGoals, oppGoals: sim.oppGoals, finalMyGoals: sim.myGoals, finalOppGoals: sim.oppGoals, revealed: sim.timeline, myAtk: sim.myAtk, myDef: sim.myDef, effectiveOppPower: sim.effectiveOppPower, isWorldTour: true, youAreHome: true };
  finishWorldTourMatch();
};
// Empate: se decide con una tanda de penaltis resumida (mismo criterio
// que la Copa del Rey de Modo Carrera, careerCupPenaltyShootout), sin
// pantalla de tanda completa, para no salirse del flujo de 3 botones.
function worldTourRigSim(stage, sim) {
  if (!stage.forcedLoss && !stage.forcedDraw) return sim;
  if (stage.forcedLoss && !stage.forcedScore && sim.myGoals < sim.oppGoals) return sim;
  if (stage.forcedDraw && sim.myGoals === sim.oppGoals && !stage.forcedScore) return sim;
  var f = G.futdraft;
  var myPlayers = f.lineup.map(function (s) { return s.player; });
  var oppPlayers = (f.oppPlayersOverride && f.oppPlayersOverride.length) ? f.oppPlayersOverride : stage.players;
  if (stage.forcedScore) { sim.myGoals = stage.forcedScore.my; sim.oppGoals = stage.forcedScore.opp; }
  else if (stage.forcedDraw) { sim.oppGoals = sim.myGoals; }
  else sim.oppGoals = sim.myGoals + 1 + (Math.random() < 0.5 ? 1 : 0);
  sim.timeline = futDraftBuildTimeline(sim.myGoals, sim.oppGoals, myPlayers, oppPlayers);
  // Goles repartidos entre todos los rivales (no siempre el mismo delantero).
  var ownOnly = stage.ownIds && stage.ownIds.length ? oppPlayers.filter(function (p) { return stage.ownIds.indexOf(p.id) !== -1; }) : [];
  var rotation = (ownOnly.length ? ownOnly : oppPlayers).slice().sort(function () { return Math.random() - 0.5; });
  var oi = 0;
  sim.timeline.forEach(function (ev) { if (ev.side === 'opp' && rotation.length) { ev.scorer = rotation[oi % rotation.length]; ev.assist = rotation[(oi + 1) % rotation.length] === ev.scorer ? null : rotation[(oi + 1) % rotation.length]; oi++; } });
  return sim;
}
function worldTourPenaltyShootout(oppPower) {
  if (G.futdraft && G.futdraft.live && G.futdraft.live.penaltyResult) return G.futdraft.live.penaltyResult;
  var myScore = worldTourTeamScore();
  var diff = myScore - oppPower;
  var myChance = futDraftPenaltyShotChance(diff);
  var rivalChance = futDraftPenaltyShotChance(-diff);
  var myGoals = 0, rivalGoals = 0, round = 1;
  while (true) {
    if (Math.random() < myChance) myGoals++;
    if (Math.random() < rivalChance) rivalGoals++;
    if (round >= PENALTY_MODE_ROUNDS && myGoals !== rivalGoals) break;
    round++;
  }
  return { myGoals: myGoals, oppGoals: rivalGoals };
}
function finishWorldTourMatch() {
  var wt = G.worldTour;
  var stage = worldTourStage();
  var live = G.futdraft.live;
  var myGoals = live.finalMyGoals, oppGoals = live.finalOppGoals;
  if (!stage.forcedDraw && futDraftLivePenaltyGate(live, stage.name || (G.futdraft.oppName) || 'Rival', worldTourTeamScore() - worldTourEffectivePower(stage), myGoals === oppGoals, finishWorldTourMatch)) return;
  var penalty = (!stage.forcedDraw && myGoals === oppGoals) ? worldTourPenaltyShootout(worldTourEffectivePower(stage)) : null;
  var playerWon = penalty ? penalty.myGoals > penalty.oppGoals : myGoals > oppGoals;
  if (stage.forcedLoss) playerWon = false;
  worldTourApplyMatchEvents(wt, live);

  if (stage.forcedDraw) {
    // Empate de guion: la historia sigue, sin subida de media ni draft, como una derrota de guion pero sin perder.
    wt.stageIndex++;
    wt.lastLossMessage = wt.isRaimon ? (stage.drawMessage || 'Empate de guion.') : 'Empate inevitable: la historia sigue.';
    if (wt.isRaimon && stage.leaves) wt.squad = wt.squad.filter(function (p) { return stage.leaves.indexOf(p.id) === -1; });
  } else if (stage.forcedLoss) {
    // Derrota de guion (como en la serie): la historia sigue sin repetir el partido.
    wt.stageIndex++;
    wt.lastLossMessage = wt.isRaimon ? stage.lossMessage : 'Derrota inevitable: la historia sigue.';
    if (wt.isRaimon && stage.injures) {
      var hurt = [];
      stage.injures.forEach(function (id) {
        var i = wt.squad.findIndex(function (p) { return p.id === id; });
        if (i === -1) return;
        var pl = wt.squad.splice(i, 1)[0];
        hurt.push(pl.nombre);
      });
    }
  } else if (playerWon) {
    var boostMult = wt.season === 2 ? 0.5 : 1;
    var boost = Math.round(rand(WORLD_TOUR_WIN_BOOST_MIN, WORLD_TOUR_WIN_BOOST_MAX) * boostMult * 10) / 10;
    wt.lastBoost = boost;
    wt.squad.forEach(function (p) { p.tiro += boost; p.pase += boost; p.defensa += boost; p.especial += boost; });
    wt.cleared.push(stage.id);
    // No ofrecer en el draft a jugadores que ya tienes en la plantilla --
    // a petición explícita.
    var squadIds = wt.squad.map(function (p) { return p.id; });
    var joinIds = (stage.joins || []).map(function (j) { return j[0]; });
    var available = stage.players.filter(function (p) { return squadIds.indexOf(p.id) === -1 && joinIds.indexOf(p.id) === -1; });
    var options = available.slice().sort(function () { return Math.random() - 0.5; }).slice(0, wt.draftSize || 3);
    // Los fichajes del draft ya no salen con la media fija de la etapa
    // (quedaban flojísimos a mitad de recorrido, cuando tu equipo ya ha
    // subido mucho más) -- ahora se reescalan a la media ACTUAL de tu
    // equipo, como mucho +2 por encima y como mínimo -4 por debajo, a
    // petición explícita. Clones aparte (no se toca stage.players, que se
    // reutiliza cada vez que se enseña esta etapa).
    var myScore = worldTourTeamScore();
    options = options.map(function (p) {
      var ovr = Math.round(clamp(myScore + rand(-4, 2), 30, 99));
      return wtFromRoster(p.id, ovr) || p;
    });
    if (options.length) wt.pendingDraft = { stageId: stage.id, options: options };
    wt.stageIndex++;
    wt.lastLossMessage = null;
    // Fichajes que se unen solos, como en la historia real (solo con el
    // Raimon) -- a petición explícita. Su media ya no es fija (ver
    // WORLD_TOUR_STORY_JOINS): se calcula sobre tu media actual, tras
    // aplicar ya la subida por la victoria de esta etapa.
    if (wt.isRaimon && stage.leaves) {
      wt.squad = wt.squad.filter(function (p) { return stage.leaves.indexOf(p.id) === -1; });
    }
    if (wt.isRaimon && (stage.joins || WORLD_TOUR_STORY_JOINS[stage.id])) {
      var joinedNames = [];
      var teamScoreForJoins = worldTourTeamScore();
      (stage.joins || WORLD_TOUR_STORY_JOINS[stage.id]).forEach(function (j) {
        var already = wt.squad.some(function (p) { return p.id === j[0]; });
        if (already) return;
        var joinOvr = Math.round(clamp(teamScoreForJoins + j[1], 30, 99));
        var clone = wtFromRoster(j[0], joinOvr);
        if (clone) { wt.squad.push(clone); joinedNames.push(j[2]); }
      });
      if (joinedNames.length) wt.lastJoinMessage = '🆕 ' + joinedNames.join(' y ') + ' se une' + (joinedNames.length > 1 ? 'n' : '') + ' al equipo.';
    }
    if (wt.stageIndex >= wt.stages.length) {
      if (wt.saga && wt.season < 3) {
        if (wt.isRaimon && wt.season === 1 && worldTourSagaExtras(wt).length > WORLD_TOUR_SAGA_KEEP_EXTRAS) {
          wt.pendingDraft = null;
          wt.pendingSagaPick = { selected: [] };
        } else {
          worldTourAdvanceSaga(wt);
        }
      } else {
        wt.won = true;
        profileTitle('mundial');
        // Modo Leyenda: se cuenta cada vez que se termina el recorrido
        // entero (siempre completo ahora, ver comentario de arriba).
        try { localStorage.setItem(WORLD_TOUR_LEGEND_KEY, String(worldTourLegendWins() + 1)); } catch (e) {}
      }
    }
    // El evento aleatorio solo pasa al GANAR, nunca al perder -- a
    // petición explícita.
    if (!wt.pendingSagaPick) worldTourRandomEvent(wt);
  } else if (wt.mode === 'dificil') {
    // Difícil: pierdes, vuelves al Occult con la plantilla inicial EXACTA
    // (startingSquad, clonada de nuevo para no compartir referencias),
    // perdiendo toda la media ganada y los fichajes del draft -- a
    // petición explícita ("vuelves a empezar desde el Occult y sin las
    // mejoras ni nada, como un modo difícil").
    wt.stageIndex = 0;
    wt.cleared = [];
    wt.squad = wt.startingSquad.map(function (p) { return Object.assign({}, p); });
    wt.pendingDraft = null;
    wt.lastLossMessage = 'Derrota en modo Difícil: vuelves al Occult con la plantilla inicial, sin mejoras ni fichajes.';
  } else if (wt.mode === 'duro' && wt.stageIndex > 0) {
    // Racha: pierdes, vuelves al Occult -- pero la plantilla conserva
    // todo lo ganado (media y fichajes), a petición explícita.
    wt.stageIndex = 0;
    wt.cleared = [];
    wt.lastLossMessage = 'Racha rota: vuelves al Occult, pero tu plantilla conserva lo ganado.';
  }

  G.futdraft.lastMatchResult = {
    oppName: stage.name, oppShield: teamShieldPath(stage.name), oppPower: worldTourEffectivePower(stage),
    myGoals: myGoals, oppGoals: oppGoals, playerWon: playerWon,
    timeline: live.revealed, modifier: live.modifier, isWorldTour: true, youAreHome: true, penalty: penalty
  };
  G.futdraft.live = null;
  G.screen = 'futdraftMatchResult';
  render();
}
window.continueWorldTourMatch = function () {
  var wt = G.worldTour;
  G.screen = wt.pendingEvent ? 'worldTourEvent' : wt.pendingDraft ? 'worldTourDraft' : 'worldTourHome';
  render();
};
// Pantalla propia con dibujo para el evento aleatorio (antes solo era una
// línea de texto en Jornada) -- a petición explícita ("que tenga una
// pantalla especial con dibujos, no que salga como ahora").
var WORLD_TOUR_EVENT_STYLE = {
  boost: { icon: '📈', color: 'var(--success)' },
  drop: { icon: '📉', color: 'var(--danger)' },
  injury: { icon: '🤕', color: 'var(--danger)' }
};
function renderWorldTourEvent() {
  var wt = G.worldTour;
  var ev = wt.pendingEvent;
  if (!ev) { G.screen = wt.pendingDraft ? 'worldTourDraft' : 'worldTourHome'; return wt.pendingDraft ? renderWorldTourDraft() : renderWorldTourHome(); }
  var style = WORLD_TOUR_EVENT_STYLE[ev.kind];
  return (
    '<div class="screen">' +
      '<div class="panel center-text" style="border:2px solid ' + style.color + '">' +
        '<div style="font-size:3.4rem;line-height:1">' + style.icon + '</div>' +
        '<h2 class="panel-title mt mb0">' + escapeHtml(ev.title) + '</h2>' +
        '<div class="mt" style="display:flex;justify-content:center">' + avatarHtml(ev.player) + '</div>' +
        '<p class="dim small mt">' + escapeHtml(ev.text) + '</p>' +
      '</div>' +
      '<div class="panel center-text"><button class="btn btn-primary btn-block" onclick="actionDismissWorldTourEvent()">Seguir</button></div>' +
    '</div>'
  );
}
window.actionDismissWorldTourEvent = function () {
  var wt = G.worldTour;
  wt.pendingEvent = null;
  G.screen = wt.pendingDraft ? 'worldTourDraft' : 'worldTourHome';
  render();
};

function renderWorldTourDraft() {
  var wt = G.worldTour;
  var draft = wt.pendingDraft;
  if (!draft) { G.screen = 'worldTourHome'; return renderWorldTourHome(); }
  var itemsHtml = draft.options.map(function (p, idx) {
    return '<button class="shop-item" style="width:100%;text-align:left" onclick="actionPickWorldTourDraft(' + idx + ')">' +
      avatarHtml(p) +
      '<div style="flex:1"><strong>' + escapeHtml(p.nombre) + '</strong><div class="dim small">' + escapeHtml(p.posicion) + ' · ' + Math.round(p.tiro) + ' de media</div></div>' +
    '</button>';
  }).join('');
  return (
    '<div class="screen">' +
      '<div class="panel center-text">' +
        '<h2 class="panel-title mb0">🎉 ¡Has ganado!</h2>' +
        '<p class="dim small">Tu equipo sube +' + (wt.lastBoost || WORLD_TOUR_WIN_BOOST_MIN) + ' de media. Elige a uno de estos jugadores para fichar:</p>' +
      '</div>' +
      '<div class="panel">' + itemsHtml + '</div>' +
    '</div>'
  );
}
window.actionPickWorldTourDraft = function (idx) {
  var wt = G.worldTour;
  var draft = wt.pendingDraft;
  if (!draft) return;
  var picked = draft.options[idx];
  if (!picked) return;
  wt.squad.push(Object.assign({}, picked));
  wt.pendingDraft = null;
  G.screen = 'worldTourHome';
  render();
};
