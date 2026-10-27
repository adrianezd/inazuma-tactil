'use strict';
/* =========================================================================
   INAZUMA ELEVEN ROGUELIKE — DATOS REALES DEL UNIVERSO INAZUMA ELEVEN
   =========================================================================
   Proyecto de fan no oficial. No afiliado a Level-5 ni a los editores de
   Inazuma Eleven. Los nombres de personajes, equipos, elementos y jugadas
   "hissatsu" que aparecen aquí son datos reales de la franquicia, usados
   como texto plano con fines de homenaje. NINGÚN arte, sprite, logo ni
   audio oficial se usa en este proyecto: todo el aspecto visual del juego
   es original (formas geométricas / SVG, color por elemento, iniciales).

   NOTA DE TRANSPARENCIA SOBRE LAS FUENTES (ver también README.md):
   - Los 21 personajes de este archivo, su posición, su nombre de doblaje
     (se usa el nombre del doblaje en inglés/internacional, que es el mismo
     que usó el doblaje de España, confirmado mediante búsqueda) y al menos
     una jugada "hissatsu" real atribuida correctamente a cada uno han sido
     verificados mediante búsquedas específicas en wikis especializadas del
     universo Inazuma Eleven (Fandom, MyAnimeList, etc.) durante la
     construcción de este proyecto (los 16 primeros) y en una ronda
     posterior de ampliación (r17-r21). En esa segunda ronda se investigaron
     más de 10 personajes secundarios adicionales (p. ej. Sakuma Jirou,
     Tobitaka Seiya, Handa Shinichi, Shishido Sakichi, Hijikata Raiden,
     Fubuki Atsuya, Saginuma Osamu) que finalmente NO se incluyeron por no
     poder confirmar con confianza y sin contradicciones entre fuentes su
     posición, elemento o jugada "hissatsu" individual real.
   - La rueda de elementos (Fuego > Bosque > Viento > Montaña > Fuego) es la
     relación real de la franquicia, también confirmada por búsqueda.
   - Las estadísticas numéricas de juego (tiro/pase/defensa/especial) son
     una interpretación jugable propia inspirada en el rol canónico de cada
     personaje (p. ej. Axel Blaze como rematador letal, Mark Evans como
     portero legendario): no son estadísticas oficiales de ningún juego,
     porque la franquicia no publica una API ni una tabla numérica pública.
   - Se ha priorizado un plantel más pequeño y confiable frente a uno más
     grande con datos dudosos: varios personajes secundarios muy conocidos
     se dejaron fuera por no poder confirmar con confianza su jugada
     "hissatsu" concreta en el tiempo disponible.
   ========================================================================= */

// Los 4 elementos reales de Inazuma Eleven y su rueda de ventajas real:
// Fuego vence a Bosque, Bosque vence a Viento, Viento vence a Montaña,
// Montaña vence a Fuego.
var TYPES = ['Fuego', 'Bosque', 'Viento', 'Montaña'];
var CYCLE = ['Fuego', 'Bosque', 'Viento', 'Montaña'];

var POSITIONS = ['Portero', 'Defensa', 'Centrocampista', 'Delantero'];

// Marca de una letra por elemento, usada en insignias SVG originales (sin arte oficial)
var TYPE_MARK = { Fuego: 'F', Bosque: 'B', Viento: 'V', 'Montaña': 'M' };

// Nombres reales de equipos rivales de la franquicia (usados solo como texto
// para nombrar a los equipos generados proceduralmente que enfrenta el jugador;
// esos equipos NO usan nombres de personajes reales para no atribuir
// incorrectamente datos de jugadores concretos a plantillas ficticias).
// NOTA: los nombres de esta lista y de RIVAL_TEAM_BOSSES se verificaron con
// cuidado hasta "Instituto Aliea" (ver README). Los añadidos a partir de ahí
// (marcados abajo) son de menor confianza -- se recuerdan de la franquicia
// pero no se han verificado con la misma rigurosidad que el resto; revísalos
// si te importa la precisión exacta del doblaje español.
var RIVAL_TEAM_NAMES = [
  'Royal Academy', 'Zeus', 'Occult', 'Otaku',
  'Alpino', 'Unicorn', 'Big Waves',
  'Brain', 'Wild', 'Shuriken', 'Kirkwood', 'Umbrella',
  'Tarjeteros', 'Veteranos Inazuma', 'Instituto Alius',
  'Cala Pirata', 'Sallys', 'Leones del desierto',
  'Academia Universal', 'Instituto Plenilunio',
  'Raimon Inakuni', 'Mary Times', 'Mar de Luna', 'Farm', 'Fauxshore',
  'Neo Raimon', 'Raimon GO', 'Zoolan Team', 'Claustro Sagrado', 'Royal Academy GO', 'Instituto Espejismo', 'Poderosa Fe', 'Los arions', 'Servicio Secreto', 'Knights', 'Triple C', 'Royal Academy Redux', 'Mar de Árboles', 'Fertilia', 'Magmavis', 'Colina Verde', 'Barcelona Orb', 'Twinford', 'Northbright', 'Campeones Raimon',
  'Vía Láctea', 'Ultramegahiedra', 'Alpino GO', 'Kirkwood GO', 'Monte Olimpo',
  'Ciervo Blanco', 'Ejército de Terracota', 'Robots Futbolistas', 'Tigres Muay',
  'Brain Ares', 'Kirkwood Ares', 'Alpino Ares', 'Rampart', 'Everytown',
  'Academia Orquídea', 'Lawcrest', 'Alpino VR', 'West Manor', 'Crosswind-Fauxshore', 'Platos', 'South Cirrus', 'Back Alley Kickers', 'Seagull FC', 'Tenderos de South Cirrus'
];

var RIVAL_TEAM_BOSSES = [
  'Royal Academy', 'Zeus', 'Academia Ogre',
  'Instituto Alius','Emperadores Oscuros',
  'Genesis', 'Prominence', 'Polvo de Diamante', 'Tormenta de Géminis', 'Dragones de Fuego',
  'Pequeños Gigantes', 'Épsilon', 'Los Emperadores', 'Os Reis', 'Neo Japón',
  'Protocolo Omega', 'Caos', 'El Dorado 01', 'Resistencia Japon', 'Resistencia Japón GO',
  'Gir', 'Gar', 'Ragnah', 'Alius Masters', 'Inazuma Japon', 'Inazuma Japon GO',
  'Chrono Storm', 'Dragon Link', 'Desesperdidos', 'Dinastía Galáctica',
  'Earth Eleven', 'Eclipse de Orión', 'El Dorado 02', 'El Dorado 03', 
  'Protocolo Omega 2.0', 'Protocolo Omega 3.0', 'Zanark Domain', 'Equipo Zero',
  'Falam Medius', 'Flota Ixar', 'Guardianes de La Reina', 'Orfeo', 'Élite Omega',
  'Galanes Electrizantes', 'Los Cuatro Magníficos', 'Fertilia', 'Magmavis',
  'Chispas Perfectas', 'Artemisa de Mr.YI', 'Ángeles Oscuros', 'FFI Estrellas',
  'Garras del Sur', 'Colmillos del Norte', 'Cuerno Demoníaco', 'Sector Quinto',
  'Cascada Perfecta', 'Zan', 'Aullido Lunar', 'Caballeros de la Mesa Redonda', 'Silica', 'Naiadi', 'Big Waves GO', 'Dragones de Fuego GO', 'Lobos Tormenta', 'Shamshir',
  'Instituto Eisei', 'Instituto Estrella Polar', 'Royal Academy Ares', 'Zeus Ares', 'Los Invencibles', 'Ángeles Caídos', 'Star Unicorn', 'Ace Invaders', 'Sambassadors', 'Fénix de Arabia', 'Red Bisons', 'Eternal Dancers', 'Gatos Estelares', 'Acróbatas Vengadores',
  'Royal Academy VR', 'Solaria-Zeus', 'Academia IA', 'Eastwind', 'Destroyers', 'Gatekeepers', 'Stormridge', 'Noble Insight'
];

// Equipos que juntan a jugadores de otros: Alius Masters sale con los de
// todos los equipos de la Academia Alius (ver teamMembers en js/core.js).
var TEAM_BORROWS_FROM = {
  'Alius Masters': ['Tormenta de Géminis', 'Épsilon', 'Épsilon Plus', 'Prominence', 'Diamond Dust', 'Polvo de Diamante', 'Caos', 'Genesis', 'Instituto Alius']
};
// Equipos que comparten jugadores y no pueden coincidir en la misma
// carrera ni en el mismo cuadro (ver teamConflicts en js/core.js).
var TEAM_EXCLUSIVE_GROUPS = [
  ['Protocolo Omega', 'Protocolo Omega 2.0', 'Protocolo Omega 3.0']
];

// A qué temporada/juego de la franquicia pertenece cada equipo rival, a
// petición explícita ("un filtro para el modo carrera para que tú
// selecciones de que juegos elegir los equipos"): temp1/temp2/temp3
// (anime original), go1/go2/go3 (Inazuma Eleven GO), ares (Ares no
// Tenbin), orion (Orion no Kokuin), vr (Victory Road). Clasificación
// dada directamente por el usuario equipo a equipo -- los que no
// aparecen aquí (p.ej. 'Tormenta de Géminis', sin respuesta) se tratan
// como sin temporada conocida y NUNCA se filtran, para no perder equipos
// por un hueco en la clasificación. Ver careerSeasonFilteredPool.
var TEAM_SEASON = {
  'Academia Ogre': 'temp3', 'Academia Universal': 'go1', 'Alius Masters': 'temp2',
  'Alpino': 'temp2', 'Artemisa de Mr.YI': 'orion', 'Barcelona Orb': 'ares',
  'Big Waves': 'temp3', 'Brain': 'temp1', 'Cala Pirata': 'go1',
  'Campeones Raimon': 'vr', 'Caos': 'temp2', 'Chispas Perfectas': 'orion',
  'Chrono Storm': 'go2', 'Colina Verde': 'ares', 'Desesperdidos': 'go2',
  'Dinastía Galáctica': 'go3', 'Dragon Link': 'go1', 'Dragones de Fuego': 'temp3',
  'Earth Eleven': 'go3', 'Eclipse de Orión': 'orion', 'El Dorado 01': 'go2',
  'El Dorado 02': 'go2', 'El Dorado 03': 'go2', 'Élite Omega': 'go2',
  'Emperadores Oscuros': 'temp2', 'Épsilon': 'temp2', 'Equipo Zero': 'go1',
  'Falam Medius': 'go3', 'Farm': 'temp1', 'Fauxshore': 'temp2',
  'Fertilia': 'go3', 'Flota Ixar': 'go3', 'Galanes Electrizantes': 'temp3',
  'Gar': 'go2', 'Genesis': 'temp2', 'Gir': 'go2',
  'Guardianes de La Reina': 'orion', 'Inazuma Japon': 'temp3', 'Inazuma Japon GO': 'go2',
  'Instituto Alius': 'go2', 'Instituto Plenilunio': 'ares', 'Kirkwood': 'temp1',
  'Leones del desierto': 'temp3', 'Los arions': 'go2', 'Los Cuatro Magníficos': 'temp3',
  'Los Emperadores': 'temp3', 'Magmavis': 'go3', 'Mar de Árboles': 'temp2',
  'Mar de Luna': 'go1', 'Mary Times': 'temp2', 'Neo Japón': 'temp3',
  'Northbright': 'vr', 'Occult': 'temp1', 'Orfeo': 'temp3',
  'Os Reis': 'temp3', 'Otaku': 'temp1', 'Pequeños Gigantes': 'temp3',
  'Polvo de Diamante': 'temp2', 'Prominence': 'temp2', 'Protocolo Omega': 'go2',
  'Protocolo Omega 2.0': 'go2', 'Protocolo Omega 3.0': 'go2', 'Ragnah': 'go2',
  'Raimon Inakuni': 'ares', 'Resistencia Japon': 'temp2', 'Resistencia Japón GO': 'go3',
  'Royal Academy': 'temp1', 'Sallys': 'temp1', 'Shuriken': 'temp1',
  'Tarjeteros': 'temp3', 'Tormenta de Géminis': 'temp2', 'Ángeles Oscuros': 'temp3', 'Neo Raimon': 'temp1', 'Raimon': 'temp1', 'Diamond Dust': 'temp2', 'Knights': 'temp3', 'Criaturas de la Noche': 'go2', 'Nosfanáticos': 'go2', 'Servicio Secreto': 'temp2', 'Épsilon Plus': 'temp2', 'Triple C': 'temp2', 'Royal Academy Redux': 'temp2', 'Inazuma Kids': 'temp1', 'FFI Estrellas': 'temp3', 'Raimon GO': 'go1', 'Zoolan Team': 'temp3', 'Vía Láctea': 'go1', 'Ultramegahiedra': 'go1', 'Alpino GO': 'go1', 'Kirkwood GO': 'go1', 'Monte Olimpo': 'go1', 'Garras del Sur': 'go1', 'Colmillos del Norte': 'go1', 'Cuerno Demoníaco': 'go1', 'Sector Quinto': 'go1', 'Claustro Sagrado': 'temp2', 'Royal Academy GO': 'go1', 'Instituto Espejismo': 'go1', 'Poderosa Fe': 'go1', 'Twinford': 'vr', 'Umbrella': 'temp1',
  'Unicorn': 'temp3', 'Veteranos Inazuma': 'temp1', 'Wild': 'temp1',
  'Zanark Domain': 'go2', 'Zeus': 'temp1',
  'Cascada Perfecta': 'go2', 'Zan': 'go2', 'Aullido Lunar': 'go2', 'Ciervo Blanco': 'go2', 'Ejército de Terracota': 'go2', 'Caballeros de la Mesa Redonda': 'go2', 'Robots Futbolistas': 'go2', 'Silica': 'go3', 'Naiadi': 'go3', 'Big Waves GO': 'go3', 'Dragones de Fuego GO': 'go3', 'Tigres Muay': 'go3', 'Lobos Tormenta': 'go3', 'Shamshir': 'go3',
  'Instituto Eisei': 'ares', 'Instituto Estrella Polar': 'ares', 'Royal Academy Ares': 'ares', 'Zeus Ares': 'ares', 'Brain Ares': 'ares', 'Kirkwood Ares': 'ares', 'Alpino Ares': 'ares', 'Rampart': 'ares', 'Everytown': 'ares', 'Los Invencibles': 'orion', 'Ángeles Caídos': 'orion', 'Star Unicorn': 'orion', 'Ace Invaders': 'orion', 'Sambassadors': 'orion', 'Fénix de Arabia': 'orion', 'Red Bisons': 'orion', 'Eternal Dancers': 'orion', 'Gatos Estelares': 'orion', 'Acróbatas Vengadores': 'orion',
  'Royal Academy VR': 'vr', 'Solaria-Zeus': 'vr', 'Academia IA': 'vr', 'Eastwind': 'vr', 'Destroyers': 'vr', 'Gatekeepers': 'vr', 'Stormridge': 'vr', 'Noble Insight': 'vr', 'Academia Orquídea': 'vr', 'Lawcrest': 'vr', 'Alpino VR': 'vr', 'West Manor': 'vr', 'Crosswind-Fauxshore': 'vr', 'Platos': 'vr', 'South Cirrus': 'vr', 'Back Alley Kickers': 'vr', 'Seagull FC': 'vr', 'Tenderos de South Cirrus': 'vr'
};
var TEAM_SEASON_LABELS = {
  temp1: 'Temporada 1', temp2: 'Temporada 2', temp3: 'Temporada 3',
  go1: 'GO 1', go2: 'GO 2', go3: 'GO 3',
  ares: 'Ares no Tenbin', orion: 'Orion no Kokuin', vr: 'Victory Road'
};
var TEAM_SEASON_ORDER = ['temp1', 'temp2', 'temp3', 'go1', 'go2', 'go3', 'ares', 'orion', 'vr'];

// Puntuación de "fuerza" de cada equipo (1-100), usada para que la CPU
// resuelva enfrentamientos entre rivales (torneo, FutDraft) con más sentido
// que un dado puro: cuanto más alta, más gana. Son valores de partida
// (equipos de RIVAL_TEAM_NAMES más bajos, de RIVAL_TEAM_BOSSES más altos,
// los que aparecen en ambas listas a medio camino) pensados para ajustar a
// mano con el tiempo, no una medición objetiva de nada.
var TEAM_POWER = {
  // Solo en RIVAL_TEAM_NAMES (nivel normal)
  'Occult': 38,
  'Alpino': 43, 'Unicorn': 68, 'Big Waves': 60,
  'Brain': 45, 'Wild': 38, 'Shuriken': 47, 'Kirkwood': 49, 'Umbrella': 28,
  'Tarjeteros': 56, 'Veteranos Inazuma': 38,
  'Cala Pirata': 76, 'Sallys': 34, 'Leones del desierto': 59,
  'Academia Universal': 80, 'Instituto Plenilunio': 55,
  'Raimon Inakuni': 45, 'Mary Times': 36, 'Mar de Luna': 77, 'Farm': 42, 'Fauxshore': 39,
  'Los arions': 47, 'Mar de Árboles': 47, 'Otaku': 33,
  'Colina Verde': 65, 'Barcelona Orb': 70, 'Twinford': 55, 'Northbright': 64, 'Campeones Raimon': 77,
  // En las dos listas a la vez (versátiles, gama media-alta)
  'Royal Academy': 70, 'Zeus': 75, 'Instituto Alius': 75,
  'Fertilia': 70, 'Magmavis': 75,
  // Solo en RIVAL_TEAM_BOSSES (nivel jefe)
  'Academia Ogre': 75, 'Emperadores Oscuros': 93, 'Genesis': 91,
  'Prominence': 73, 'Polvo de Diamante': 73, 'Tormenta de Géminis': 70, 'Dragones de Fuego': 75,
  'Pequeños Gigantes': 90, 'Épsilon': 74, 'Los Emperadores': 75, 'Os Reis': 75, 'Neo Japón': 76,
  'Protocolo Omega': 66, 'Caos': 75, 'El Dorado 01': 70, 'Resistencia Japon': 80, 'Resistencia Japón GO': 70,
  'Gir': 66, 'Gar': 70, 'Ragnah': 80, 'Alius Masters': 92, 'Inazuma Japon': 92, 'Inazuma Japon GO': 90,
  'Chrono Storm': 95, 'Dragon Link': 82, 'Desesperdidos': 75, 'Dinastía Galáctica': 84,
  'Earth Eleven': 94, 'Eclipse de Orión': 85, 'El Dorado 02': 75, 'El Dorado 03': 79,
  'Protocolo Omega 2.0': 76, 'Protocolo Omega 3.0': 78, 'Zanark Domain': 78, 'Equipo Zero': 80,
  'Falam Medius': 83, 'Flota Ixar': 83, 'Guardianes de La Reina': 81, 'Orfeo': 80,
  'Élite Omega': 93, 'Galanes Electrizantes':70, 'Los Cuatro Magníficos': 70,
  'Chispas Perfectas': 85, 'Artemisa de Mr.YI': 90,
  // Añadidos por el usuario (escudo y media dados por él)
  'Ángeles Oscuros': 78, 'FFI Estrellas': 80, 'Neo Raimon': 75, 'Raimon GO': 78, 'Zoolan Team': 82, 'Vía Láctea': 70, 'Ultramegahiedra': 73, 'Alpino GO': 76, 'Kirkwood GO': 77, 'Monte Olimpo': 83, 'Garras del Sur': 82, 'Colmillos del Norte': 82, 'Cuerno Demoníaco': 83, 'Sector Quinto': 77, 'Claustro Sagrado': 60,
  'Royal Academy GO': 78, 'Instituto Espejismo': 78, 'Poderosa Fe': 75,
  'Servicio Secreto': 55, 'Épsilon Plus': 80, 'Knights': 72, 'Triple C': 50, 'Royal Academy Redux': 70,
  'Cascada Perfecta': 85, 'Zan': 82, 'Aullido Lunar': 80, 'Ciervo Blanco': 72, 'Ejército de Terracota': 74, 'Caballeros de la Mesa Redonda': 80, 'Robots Futbolistas': 68, 'Silica': 84, 'Naiadi': 84, 'Big Waves GO': 76, 'Dragones de Fuego GO': 79, 'Tigres Muay': 75, 'Lobos Tormenta': 78, 'Shamshir': 79,
  'Instituto Eisei': 80, 'Instituto Estrella Polar': 82, 'Royal Academy Ares': 78, 'Zeus Ares': 80, 'Brain Ares': 72, 'Kirkwood Ares': 70, 'Alpino Ares': 68, 'Rampart': 66, 'Everytown': 62, 'Los Invencibles': 84, 'Ángeles Caídos': 84, 'Star Unicorn': 84, 'Ace Invaders': 82, 'Sambassadors': 82, 'Fénix de Arabia': 80, 'Red Bisons': 80, 'Eternal Dancers': 78, 'Gatos Estelares': 78, 'Acróbatas Vengadores': 76,
  'Royal Academy VR': 80, 'Solaria-Zeus': 84, 'Academia IA': 82, 'Eastwind': 80, 'Destroyers': 80, 'Gatekeepers': 78, 'Stormridge': 76, 'Noble Insight': 76, 'Academia Orquídea': 74, 'Lawcrest': 74, 'Alpino VR': 72, 'West Manor': 72, 'Crosswind-Fauxshore': 70, 'Platos': 70, 'South Cirrus': 62, 'Back Alley Kickers': 66, 'Seagull FC': 64, 'Tenderos de South Cirrus': 58
};


// El plantel real: 16 personajes de Inazuma Eleven. "nombre" usa el nombre
// del doblaje en inglés/internacional (idéntico al usado en el doblaje de
// España). "original" es el nombre japonés de referencia. "hissatsu" son
// jugadas especiales reales atribuidas correctamente a cada personaje.
var ROSTER = [
  {
    id: 'r01', equipo:'Raimon', equiposExtra:['Artemisa de Mr.YI', 'Inazuma Japon', 'Los arions', 'Neo Raimon', 'Orfeo'], nombre: 'Mark Evans', original: 'Endou Mamoru',
    posicion: 'Portero', tipo: 'Montaña',
    tiro: 42, pase: 55, defensa: 88, especial: 88,
    hissatsu:['Mano Mágica', 'Mano Celestial', 'Defensa Triple'],tipoTecnica:'portero',
    desc: 'Portero legendario y capitán de corazón indomable.',
    locked: true, cost:200
  },
  {
    id: 'r02', equipo:'Raimon', equiposExtra:['Artemisa de Mr.YI', 'Inazuma Japon', 'Kirkwood', 'Neo Raimon', 'Kirkwood Ares', 'Raimon Inakuni'], nombre: 'Axel Blaze', original: 'Gouenji Shuuya',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 89, pase: 75, defensa: 32, especial: 87,
    hissatsu:['Tornado de Fuego', 'Trampolín relámpago', 'Entrada de llamas'],tipoTecnica:'tiro',
    desc: 'El delantero estrella, el mejor rematador del equipo.',
    locked: true, cost:210
  },
  {
    id: 'r03', equipo:'Raimon', equiposExtra:['Artemisa de Mr.YI', 'Inazuma Japon', 'Neo Raimon'], nombre: 'Nathan Swift', original: 'Kazemaru Ichirouta',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 75, pase: 76, defensa: 75, especial: 65,
    hissatsu:['Defensa Huracán', 'Entrada huracán', 'Pájaro de fuego'],tipoTecnica:'regate',
    desc: 'El jugador más veloz del Raimon.',
    locked: true, cost:126
  },
  {
    id: 'r04', equipo:'Raimon', equiposExtra:['Artemisa de Mr.YI', 'Inazuma Japon', 'Neo Raimon', 'Orfeo', 'Royal Academy', 'Instituto Estrella Polar'], nombre: 'Jude Sharp', original: 'Kidou Yuuto',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 80, pase: 85, defensa: 67, especial: 80,
    hissatsu:['Pingüino emperador n.º 3', 'Ruptura Relámpago', 'Espejismo de balón'],tipoTecnica:'regate',
    desc: 'Estratega frío y calculador, el cerebro del equipo.',
    locked: true, cost:79
  },
  {
    id: 'r05', equipo:'Raimon', equiposExtra:['Inazuma Japon'], nombre: 'Kevin Dragonfly', original: 'Someoka Ryuugo',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 78, pase: 71, defensa: 40, especial: 70,
    hissatsu:['Remate Dragón', 'Tornado dragón', 'Zig Zag Explosivo'],tipoTecnica:'tiro',
    desc: 'Delantero fogoso, uno de los fundadores del club.',
    locked: false
  },
  {
    id: 'r06', equipo:'Raimon', equiposExtra:['Inazuma Japon', 'Neo Raimon'], nombre: 'Jack Wallside', original: 'Kabeyama Heigorou',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 36, pase: 80, defensa: 88, especial: 82,
    hissatsu:['El Muro', 'Regate Topo', 'Mega Terremoto'],tipoTecnica:'defensa',
    desc: 'Un muro humano casi imposible de traspasar.',
    locked: true, cost:137
  },
  {
    id: 'r07', equipo:'Inazuma Japon', equiposExtra:['Artemisa de Mr.YI', 'Orfeo', 'Royal Academy Redux', 'Resistencia Japón GO', 'Royal Academy Ares'], nombre: 'Caleb Stonewall', original: 'Fudou Akio',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 74, pase: 80, defensa: 76, especial: 70,
    hissatsu:['Pingüino emperador n.º 3', 'Barrido Defensivo', 'Campo de fuerza'],tipoTecnica:'tiro',
    desc: 'Provocador y letal, juega sin reglas.',
    locked: true, cost:158
  },
  {
    id: 'r08', equipo:'Alpino', equiposExtra:['Inazuma Japon', 'Neo Raimon'], nombre: 'Shawn Froste', original: 'Fubuki Shirou',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 76, pase: 78, defensa: 80, especial: 80,
    hissatsu:['Paisaje Helado', 'Ventisca eterna', 'Aullido de lobo'],tipoTecnica:'defensa',
    desc: 'Frío como el hielo, letal frente a la portería.',
    locked: true, cost:151
  },
  {
    id: 'r09', equipo:'Inazuma Japon', nombre: 'Austin Hobbs', original: 'Toramaru Utsunomiya',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 78, pase: 70, defensa: 32, especial: 72,
    hissatsu:['Remate del Tigre', 'Pared solitaria', 'Tormenta del tigre'],tipoTecnica:'tiro',
    desc: 'El delantero más joven, con un instinto feroz.',
    locked: true, cost:101
  },
  {
    id: 'r10', equipo:'Raimon', equiposExtra:['Artemisa de Mr.YI', 'Unicorn', 'Star Unicorn', 'Ace Invaders'], nombre: 'Erik Eagle', original: 'Ichinose Kazuya',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 74, pase: 80, defensa: 70, especial: 75,
    hissatsu:['Fénix', 'Espejismo de balón', 'Tiro Giratorio'],tipoTecnica:'tiro',
    desc: 'Líder nato, siempre listo para resurgir.',
    locked: true, cost:166
  },
  {
    id: 'r11', equipo:'Inazuma Japon', equiposExtra:['Fauxshore'], nombre: 'Darren LaChance', original: 'Tachimukai Yuuki',
    posicion: 'Portero', tipo: 'Montaña',
    tiro: 20, pase: 48, defensa: 81, especial: 80,
    hissatsu:['Mano Mágica', 'Mano Celestial', 'Manos infinitas'],tipoTecnica:'portero',
    desc: 'Guardameta suplente que se ganó su titularidad a pulso.',
    locked: true, cost:87
  },
  {
    id: 'r12', equipo:'Raimon', nombre: 'Todd Ironside', original: 'Kurimatsu Teppei',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 34, pase: 71, defensa: 77, especial: 70,
    hissatsu:['Corte Giratorio', 'Tiro del cometa', 'Giro de Mono'],tipoTecnica:'defensa',
    desc: 'Defensa fornido con un don inesperado para el regate.',
    locked: false
  },
  // -- Personajes desbloqueables con Puntos de Espíritu en el Vestuario --
  {
    id: 'r13', equipo:'Royal Academy', equiposExtra:['Neo Japón'], nombre: 'Joseph King', original: 'Genda Koujirou',
    posicion: 'Portero', tipo: 'Fuego',
    tiro: 24, pase: 56, defensa: 83, especial: 81,
    hissatsu:['Escudo de Fuerza', 'Escudo de Fuerza Total', 'Corte Giratorio'],tipoTecnica:'portero',
    desc: 'Guardameta de la Royal, orgulloso e inquebrantable.',
    locked: true, cost:107
  },
  {
    id: 'r14', equipo: 'Inazuma Japon', equiposExtra:['Neo Raimon'], nombre: 'Xavier Foster', original: 'Kiyama Hiroto',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 87, pase: 81, defensa: 38, especial: 80,
    hissatsu:['Cañon de Meteoritos', 'La aurora', 'Descenso estelar'],tipoTecnica:'tiro',
    desc: 'Antiguo capitán de Genesis, ambicioso y brillante.',
    locked: true, cost:142
  },
  {
    id: 'r15', equipo:'Inazuma Japon', equiposExtra:['Alius Masters', 'Genesis', 'Tormenta de Géminis'], nombre: 'Jordan Greenway', original: 'Midorikawa Ryuuji',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 75, pase: 78, defensa: 74, especial: 77,
    hissatsu:['Puerta Astral', 'Astro Remate', 'Carrera relámpago'],tipoTecnica:'tiro',
    desc: 'Técnica exquisita y un gran corazón.',
    locked: true, cost:154
  },
  {
    id: 'r16', equipo:'Raimon', equiposExtra:['Royal Academy', 'Unicorn'], nombre: 'Bobby Shearer', original: 'Domon Asuka',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 42, pase: 58, defensa: 80, especial: 65,
    hissatsu:['Corte Volcánico', 'Barrido Defensivo', 'Tornado Inverso'],tipoTecnica:'tiro',
    desc: 'Defensor disciplinado, siempre el primero en el barro.',
    locked: true, cost:113
  },
  // -- Ampliación del plantel (segunda ronda de verificación, ver README) --
  {
    id: 'r17', equipo: 'Caos', equiposExtra:['Polvo de Diamante'], nombre: 'Bryce Withingale', original: 'Suzuno Fuusuke',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 84, pase: 80, defensa: 38, especial: 73,
    hissatsu:['Balón Iceberg', 'Ventisca de fuego', 'Bomba géiser'],tipoTecnica:'tiro',
    desc: 'Capitán de Diamond Dust, frío y calculador frente a la portería.',
    locked: true, cost:138
  },
  {
    id: 'r18', equipo:'Inazuma Japon', equiposExtra:['Mary Times'], nombre: 'Hurley Kane', original: 'Tsunami Jousuke',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 72, pase: 76, defensa: 78, especial: 80,
    hissatsu:['Remate Tsunami', 'Bloqueo Ballena', 'Gran tifón'],tipoTecnica:'tiro',
    desc: 'Surfista y defensa de Inazuma Japón, imparable con el viento a favor.',
    locked: true, cost:145
  },
  {
    id: 'r19', equipo:'Prominence', equiposExtra:['Alius Masters', 'Caos', 'Dragones de Fuego', 'Inazuma Japon'], nombre: 'Claude Beacons', original: 'Nagumo Haruya',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 85, pase: 75, defensa: 32, especial: 81,
    hissatsu:['Llamarada Atómica', 'Ventisca de fuego', 'Pantalla ígnea'],tipoTecnica:'tiro',
    desc: 'Capitán de Prominence, ambicioso y ardiente ante el gol.',
    locked: true, cost:110
  },
  {
    id: 'r20', equipo:'Zeus', equiposExtra:['Artemisa de Mr.YI', 'Dragones de Fuego', 'Inazuma Japon', 'Zeus Ares'], nombre: 'Byron Love', original: 'Afuro Terumi',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 87, pase: 87, defensa: 69, especial: 88,
    hissatsu:['Sabiduría Divina', 'Hora Celestial', 'Apisonadora'],tipoTecnica:'tiro',
    desc: 'Capitán de Zeus, el centrocampista más elegante y letal.',
    locked: true, cost:186
  },
  {
    id: 'r21', equipo:'Inazuma Japon', equiposExtra:['Claustro Sagrado'], nombre: 'Scott Banyan', original: 'Kogure Yuuya',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 38, pase: 69, defensa: 80, especial: 79,
    hissatsu:['Campo Torbellino', 'Sorpresa', 'Segadora'],tipoTecnica:'defensa',
    desc: 'Defensa travieso de Raimon, siempre lleno de recursos.',
    locked: true, cost:91
  },
  // -- Tercera ampliación del plantel (r22-r24, r30-r34, r36-r37) --
  // Este lote se incorporó inicialmente con el nombre original japonés en
  // el campo "nombre" (por velocidad de entrega), lo cual se corrigió
  // después: se buscó mediante búsquedas web el nombre real de doblaje en
  // inglés/internacional de cada uno (fichas de personaje de MyAnimeList,
  // listados de doblaje al castellano de Inazuma Eleven GO) y se sustituyó
  // en "nombre", dejando "original" como el nombre japonés de referencia,
  // igual que en el resto del plantel. Nishiki Ryouma (r36) es una
  // excepción real, no un descuido: las fuentes indican que su doblaje
  // conserva el nombre original sin traducir. Varios personajes de este
  // mismo lote (Kageno Jin, Shishido Sakichi, Handa Shinichi, Hijikata
  // Raiden, Saginuma Osamu, Fei Rune, Aoyama Shunsuke, Sangoku Taichi,
  // Amagi Daichi, Matatagi Hayato) se retiraron por completo del plantel
  // porque no se pudo confirmar un nombre de doblaje real para ellos —
  // se prefirió quitarlos antes que dejarlos en japonés o inventar un
  // nombre de doblaje que no existe.
  {
    id: 'r22', equipo:'Royal Academy', equiposExtra:['Inazuma Japon', 'Orfeo'], nombre: 'David Samford', original: 'Sakuma Jirou',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 78, pase: 79, defensa: 59, especial: 67,
    hissatsu:['Pingüino emperador n.º 2', 'Barrido Defensivo', 'Regate múltiple'],tipoTecnica:'regate',
    desc: 'Delantero de la royal, implacable y sin piedad en el choque.',
    locked: true, cost:119
  },
  {
    id: 'r23', equipo:'Inazuma Japon', equiposExtra:['Neo Raimon'], nombre: 'Archer Hawkins', original: 'Tobitaka Seiya',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 30, pase: 76, defensa: 83, especial: 82,
    hissatsu:['Golpe de vacío', 'Arrollador', 'Estrella de roca'],tipoTecnica:'tiro',
    desc: 'Guerrero solitario que rechazó el once titular por orgullo.',
    locked: true, cost:93
  },
  {
    id: 'r24', equipo:'Alpino', nombre: 'Aiden Froste', original: 'Fubuki Atsuya',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 86, pase: 72, defensa: 30, especial: 82,
    hissatsu:['Remate Cazaosos', 'Abrazo del Oso', 'Furia de oso'],tipoTecnica:'tiro',
    desc: 'El hermano de Shawn Froste, tan letal como frío en el área.',
    locked: true, cost:110
  },
  {
    id: 'r30', equipo:'Raimon GO', equiposExtra:['Earth Eleven'], nombre: 'Arion Sherwind', original: 'Matsukaze Tenma',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 84, pase: 82, defensa: 75, especial: 85,
    hissatsu:['Brisa deslizante', 'Tiro vendaval', 'Triple amenaza'],tipoTecnica:'regate',
    desc: 'Capitán de la nueva generación de Raimon, corazón indomable.',
    locked: true, cost:167,
  sprite:'https://inazumarun.es/assets/sprites/r30.webp'
  },
  {
    id: 'r31', equipo:'Raimon GO', equiposExtra:['Earth Eleven'], nombre: 'Riccardo Di Rigo', original: 'Shindou Takuto',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 79, pase: 87, defensa: 78, especial: 84,
    hissatsu:['Pentagrama', 'Himno de atenea', 'Visto y no visto'],tipoTecnica:'tiro',
    desc: 'Estratega de piano y balón, heredero del legado de Jude Sharp.',
    locked: false,
  sprite:'https://inazumarun.es/assets/sprites/r31.webp'
  },
  {
    id: 'r32', equipo:'Raimon GO', nombre: 'Gabriel García', original: 'Kirino Ranmaru',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 40, pase: 76, defensa: 81, especial: 80,
    hissatsu:['Niebla Mística', 'La niebla', 'Trance melódico'],tipoTecnica:'regate',
    desc: 'Defensa técnico y mejor amigo de Riccardo.',
    locked: false,
  sprite:'https://inazumarun.es/assets/sprites/r32.webp'
  },
  {
    id: 'r33', equipo:'Raimon GO', equiposExtra:['El Dorado 02', 'El Dorado 03', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre: 'Aitor Cazador', original: 'Kariya Masaki',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 44, pase: 79, defensa: 82, especial: 78,
    hissatsu:['Red de caza', 'Corte Mágico', 'Mina terrestre'],tipoTecnica:'portero',
    desc: 'Defensa travieso capaz de desaparecer entre rivales.',
    locked: true, cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r33.webp'
  },
  {
    id: 'r34', equipo:'Raimon GO', equiposExtra:['Earth Eleven', 'Falam Medius', 'Caballeros de la Mesa Redonda'], nombre: 'Víctor Blade', original: 'Tsurugi Kyousuke',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 85, pase: 78, defensa: 36, especial: 79,
    hissatsu:['Aguijón Letal', 'Proyectil letal', 'Tiro sobrenatural'],tipoTecnica:'tiro',
    desc: 'Delantero letal con una precisión de rapaz.',
    locked: true, cost:139,
  sprite:'https://inazumarun.es/assets/sprites/r34.webp'
  },
  {
    id: 'r36', equipo:'Raimon GO', nombre: 'Ryoma Nishiki', original: 'Nishiki Ryouma',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro: 80, pase: 73, defensa: 34, especial: 75,
    hissatsu:['Chut ancestral', 'Dragón ascendente', 'Guardia acrobática'],tipoTecnica:'tiro',
    desc: 'Delantero desenfadado con un don natural para el gol.',
    locked: false,
  sprite:'https://inazumarun.es/assets/sprites/r36.webp'
  },
  {
    id: 'r37', equipo:'Raimon GO', equiposExtra:['El Dorado 01', 'El Dorado 02', 'Caballeros de la Mesa Redonda'], nombre: 'Subaru Honda', original: 'Kurumada Gouichi',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 36, pase: 53, defensa: 75, especial: 70,
    hissatsu:['A todo vapor', 'Pinzas cortantes', 'Bateo total'],tipoTecnica:'regate',
    desc: 'Defensa colosal, un muro que pocos logran superar.',
    locked: true, cost:101,
  sprite:'https://inazumarun.es/assets/sprites/r37.webp'
  },
  {
    id: 'r38', equipo:'Raimon GO', equiposExtra:['El Dorado 01'], nombre: 'Samguk Han', original: "Sangoku Taichi",
    posicion: 'Portero', tipo: 'Fuego',
    tiro: 22, pase: 50, defensa: 75, especial: 75,
    hissatsu:['Parada ardiente', 'Barrera de Gaia', 'Manos liberadas'],tipoTecnica:'portero',
    desc: 'Portero del raimon, con reflejos felinos y un corazón ardiente.',
    locked: false,
  sprite:'https://inazumarun.es/assets/sprites/r38.webp'
  },
  {
    id: 'r39', equipo:'Neo Raimon', equiposExtra:['Brain', 'Emperadores Oscuros', 'Raimon', 'Tarjeteros'], nombre: 'Shadow Cimmerian', original: "Kageto Yamino",
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 79, pase: 76, defensa: 32, especial: 70,
    hissatsu:['Tornado oscuro', 'Ataque de las sombras', 'Triangulo letal'],tipoTecnica:'tiro',
    desc: 'Delantero misterioso, capaz de desaparecer entre las sombras.',
    locked: false
  },
  {
    id: 'r40', equipo:'Raimon', equiposExtra:['Neo Raimon'], nombre: 'William Glass', original: "Kakeru Megane",
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 68, pase: 60, defensa: 34, especial: 68,
    hissatsu:['Remate Gafas', 'Escáner Ataque', 'Flecha Divina'],tipoTecnica:'tiro',
    desc: 'Delantero elegante y preciso, con un toque de magia en sus pies.',
    locked: false
  },
  {
    id: 'r41', equipo:'Neo Raimon', equiposExtra:['Raimon'], nombre: 'Paul Peabody', original: "Goro Tamaro",
    posicion: 'Portero', tipo: 'Bosque',
    tiro: 48, pase: 52, defensa: 72, especial: 71,
    hissatsu:['Mano Celestial', 'Regate múltiple', 'Corte Giratorio'],tipoTecnica:'portero',
    desc: 'Portero experimentado con una visión única del juego.',
    locked: false
  },
  {
    id: 'r42', equipo:'Inazuma Japon', nombre: 'Thor Stoutberg', original: "Raiden Hijikata",
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 38, pase: 69, defensa: 80, especial: 80,
    hissatsu:['Pisotón de Sumo', 'Súper pisotón de sumo', 'Muro de piedra'],tipoTecnica:'defensa',
    desc: 'Defensa robusto y disciplinado, con un estilo de juego imponente.',
    locked: false
  },
  {
    id: 'r43', equipo:'Neo Japón', equiposExtra:['Tarjeteros'], nombre: 'Larry Pogue', original: "Saginuma Osamu",
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 75, pase: 75, defensa: 55, especial: 80,
    hissatsu:['Chut draconiano', 'Lanza de odín', 'Sabiduría Divina'],tipoTecnica:'tiro',
    desc: 'Centrocampista creativo, capaz de cambiar el rumbo del partido.',
    locked: false
  },
  {
    id: 'r44', equipo:'Los Cuatro Magníficos', nombre: 'Tom Skipper', original: "Yo Kabutenji",
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 83, pase: 73, defensa: 36, especial: 76,
    hissatsu:['La Tierra', 'Remate en espiral', 'Hora Celestial'],tipoTecnica:'defensa',
    desc: 'Delantero ágil y veloz, con un instinto asesino frente a la portería.',
    locked: true, cost:126
  },
  {
    id: 'r45', equipo:'Academia Ogre', nombre: 'Bash Lancer', original: "Baddap Sleep",
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 88, pase: 84, defensa: 34, especial: 85,
    hissatsu:['Lanza Letal', 'Mangual leteal', 'Coz 3'],tipoTecnica:'defensa',
    desc: 'Delantero y capitán de la Academia Ogro, con un estilo de juego agresivo y directo.',
    locked: true, cost:147
  },
    {
    id: 'r46', equipo:'Raimon', nombre: 'Steve Grim', original: 'Handa Shinichi',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 67, pase: 64, defensa: 61, especial: 52,
    hissatsu:['Disparo Rodante', 'Zig Zag Explosivo', 'Ciclón'],tipoTecnica:'tiro',
    desc: 'Centrocampista equilibrado de Raimon, fiable y trabajador.',
    locked: false, cost:68
  },
  {
    id: 'r47', equipo:'Raimon', nombre: 'Timmy Saunders', original: 'Shourinji Ayumu',
    posicion: 'Centrocampista', tipo: 'Montaña',
    tiro: 69, pase: 62, defensa: 58, especial: 63,
    hissatsu:['Cabezazo Kung Fu', 'Torbellino dragón', 'Remate Múltiple'],tipoTecnica:'tiro',
    desc: 'Pequeño pero valiente jugador de Raimon con gran espíritu de lucha.',
    locked: false, cost:61
  },
  {
    id: 'r48', equipo:'Raimon', nombre: 'Maxwell Carson', original: 'Matsuno Kuusuke',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 72, pase: 65, defensa: 44, especial: 64,
    hissatsu:['Remate en V', 'Entrada Tormenta', 'Disparo sagrado'],tipoTecnica:'tiro',
    desc: 'Centrocampista habilidoso de Raimon, siempre dispuesto a improvisar.',
    locked: false, cost:74
  },
  {
    id: 'r49', equipo:'Raimon', nombre: 'Jim Wraith', original: 'Kageno Jin',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 34, pase: 48, defensa: 71, especial: 72,
    hissatsu:['Trama trama', 'Golpe doble', 'Ataque de las sombras'],tipoTecnica:'defensa',
    desc: 'Defensa silencioso capaz de sorprender apareciendo de la nada.',
    locked: false, cost:71
  },
  {
    id: 'r50', equipo:'Inazuma Japon', nombre: 'Isaac Glass', original: 'Kazuto Megane', sprite: 'https://inazumarun.es/assets/sprites/r50.webp',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 69, pase: 62, defensa: 36, especial: 70,
    hissatsu:['Remate Gafas v2', 'Entrada huracán', 'Zona Sigma'],tipoTecnica:'tiro',
    desc: 'Delantero peculiar que sueña con convertirse en una estrella.',
    locked: false, cost:76
  },
  {
    id: 'r51', equipo:'Zeus', nombre: 'Paul Siddon', original: 'Donichi Posei',
    posicion: 'Portero', tipo: 'Montaña',
    tiro: 51, pase: 50, defensa: 79, especial: 80,
    hissatsu:['Muralla Gigante', 'Muralla tsunami', 'Apisonadora'],tipoTecnica:'portero',
    desc: 'Portero veterano del Zeus, conocido por su imponente presencia en la portería.',
    locked: true, cost:163
  },
  {
    id: 'r52', equipo:'Servicio Secreto', nombre: 'Tori Vanguard', original: 'Zaizen Touko',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 58, pase: 62, defensa: 74, especial: 72,
    hissatsu:['Torre Inexpugnable', 'Torre perfecta', 'Bomba acrobática'],tipoTecnica:'defensa',
    desc: 'Centrocampista de Viento con una gran capacidad defensiva.',
    locked: true, cost:121
  },
  {
    id: 'r53', equipo:'Genesis', equiposExtra:['Eclipse de Orión', 'Instituto Eisei'], nombre: 'Bellatrix', original: 'Reina Yagami',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 77, pase: 77, defensa: 64, especial: 75,
    hissatsu:['Pinguino Espacial', 'Astro Remate', 'Lluvia de Meteoros'],tipoTecnica:'regate',
    desc: 'Hermana de Xene, con un estilo de juego elegante y preciso.',
    locked: false, cost:63
  },
  {
    id: 'r54', equipo:'Épsilon', equiposExtra:['Épsilon Plus'], nombre: 'Dvalin', original: 'Saginuma Osamu',
    posicion: 'Portero', tipo: 'Viento',
    tiro: 64, pase: 65, defensa: 82, especial: 80,
    hissatsu:['Agujero de gusano', 'Destrozataladros', 'Robo veloz'],tipoTecnica:'portero',
    desc: 'Portero de Epsilon con reflejos sorprendentes y gran intuición para anticipar los tiros.',
    locked: true, cost:131
  },
  {
    id: 'r55', equipo:'Épsilon', equiposExtra:['Alius Masters', 'Neo Japón', 'Épsilon Plus'], nombre: 'Zeke Valanche', original: 'Desarm',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 75, pase: 57, defensa: 57, especial: 72,
    hissatsu:['Rayo de Ganímedes','Remate de Gaia'],tipoTecnica:'tiro',
    desc: 'Delantero de Epsilon con una presencia intimidante y gran potencia.',
    locked: true, cost:137
  },
  {
    id: 'r56', equipo:'Triple C', equiposExtra:['Inazuma Japon'], nombre: 'Suzette Hartland', original: 'Urabe Rika',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 70, pase: 54, defensa: 38, especial: 70,
    hissatsu:['Tiro torre de Osaka', 'Lecho de Rosas'],tipoTecnica:'defensa',
    desc: 'Delantera de Osaka con una personalidad tan intensa como su juego.',
    locked: false, cost:82
  },
  {
    id: 'r57', equipo:'Neo Japón', nombre: 'Eugene Conwell', original: 'Kogure Yuuya',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 69, pase: 69, defensa: 48, especial: 69,
    hissatsu:['Remate de hielo', 'Campo Torbellino', 'Sorpresa'],tipoTecnica:'tiro',
    desc: 'Cabeza bolo.',
    locked: false, cost:78
  },
  {
    id: 'r58', equipo:'Knights', nombre: 'Edgar Partinus', original: 'Edgar Valtinas',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 86, pase: 64, defensa: 38, especial: 78,
    hissatsu:['Ataque de paladín', 'Ultra lunar', 'Pentagrama'],tipoTecnica:'tiro',
    desc: 'Capitán de los Knights of Queen y elegante especialista del remate.',
    locked: true, cost:189
  },
  {
    id: 'r59', equipo:'Unicorn', nombre: 'Mark Krueger', original: 'Mark Kruger',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 76, pase: 80, defensa: 70, especial: 77,
    hissatsu:['Gran Lobo', 'Ícaro', 'Tri-Pegaso'],tipoTecnica:'tiro',
    desc: 'Capitán de Unicorn y uno de los grandes cerebros del fútbol americano.',
    locked: true, cost:179
  },
  {
    id: 'r60', equipo:'Unicorn', nombre: 'Dylan Keats', original: 'Dylan Keith',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 82, pase: 73, defensa: 36, especial: 77,
    hissatsu:['Remate Unicornio', 'Remate en V', 'Chicle burbuja'],tipoTecnica:'tiro',
    desc: 'Delantero de Unicorn conocido por su velocidad y precisión.',
    locked: true, cost:163
  },
  {
    id: 'r61', equipo:'Orfeo', equiposExtra:['Inazuma Japon', 'Neo Raimon'], nombre: 'Paolo Bianchi', original: 'Fidio Aldena',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 85, pase: 78, defensa: 34, especial: 82,
    hissatsu:['Espada de Odín', 'Pared solitaria', 'Flecha Divina'],tipoTecnica:'tiro',
    desc: 'Capitán de Orfeo y meteoro blanco del fútbol italiano.',
    locked: true, cost:200
  },
  {
    id: 'r62', equipo:'Los Emperadores', nombre: 'Tiago Torres', original: 'Teres Tolue',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 42, pase: 84, defensa: 88, especial: 84,
    hissatsu:['Muro de Hierro'],tipoTecnica:'defensa',
    desc: 'Capitán de Los Emperadores, especialista defensivo prácticamente impenetrable.',
    locked: true, cost:184
  },
  {
    id: 'r63', equipo:'Orfeo', nombre: 'Nakata Hidetoshi', original: 'Nakata Hidetoshi',
    posicion: 'Centrocampista', tipo: 'Montaña',
    tiro: 88, pase: 84, defensa: 80, especial: 88,
    hissatsu:['Disparo Valiente', 'Tiro valiente', 'Voltereta Círcense'],tipoTecnica:'tiro',
    desc: 'Veterano de gran talento que lidera el centro del campo con experiencia.',
    locked: true, cost:278
  },
  {
    id: 'r64', equipo:'Orfeo', nombre: 'Angelo Gabrini', original: 'Angelo Gabrini',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 70, pase: 74, defensa: 34, especial: 74,
    hissatsu:['Balon Angelical', 'Flecha Divina', 'Hora Celestial'],tipoTecnica:'tiro',
    desc: 'Centrocampista italiano de técnica refinada y gran capacidad goleadora.',
    locked: true, cost:152
  },
  {
    id: 'r65', equipo:'Orfeo', nombre: 'Marco Maserati', original: 'Marco Masato',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 52, pase: 70, defensa: 78, especial: 75,
    hissatsu:['Voltereta Círcense', 'Cúpula Sónica', 'Luna creciente'],tipoTecnica:'regate',
    desc: 'Defensa técnica de Orfeo con gran capacidad para combinar.',
    locked: false, cost:110
  },
  {
    id: 'r66', equipo:'Neo Raimon', nombre: 'Jimmy Mach', original: 'Maya Hayami',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 73, pase: 70, defensa: 34, especial: 70,
    hissatsu:['Tiro Giratorio', 'Sabiduría Divina'],tipoTecnica:'tiro',
    desc: 'Alcanza la velocidad del sonido y es capaz de rematar desde cualquier ángulo.',
    locked: false, cost:116
  },
  {
    id: 'r67', equipo:'Neo Raimon', nombre: 'Balt Decker', original: 'Balt Decker',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 50, pase: 65, defensa: 73, especial: 70,
    hissatsu:['Ciclón', 'Corte Giratorio'],tipoTecnica:'defensa',
    desc: 'Defensa de pequeño tamaño pero gran capacidad defensiva.',
    locked: false, cost:126
  },
  {
    id: 'r68', equipo:'Los arions', equiposExtra:['El Dorado 01', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre: 'Fei Rune', original: 'Fei Rune',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 85, pase: 79, defensa: 32, especial: 80,
    hissatsu:['Remate Rebotado', 'Superremate rebotado', 'Proyectil de Ozono'],tipoTecnica:'tiro',
    desc: 'Viajero del tiempo que ayudó a Arion a salvar el fútbol.',
    locked: true, cost: 99999
  },
  {
    id: 'r69', equipo:'Los arions', nombre: 'Vladimir Blade', original: 'Yuichi Tsurugi',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 88, pase: 64, defensa: 36, especial: 80,
    hissatsu:['Aguijones escarlata', 'Torbellino de fuego', 'Entrada huracán'],tipoTecnica:'tiro',
    desc: 'Hermano de Víctor Blade, un delantero letal con una precisión de rayo.',
    locked: true, cost: 99999
  },
  {
    id: 'r70', equipo:'Los arions', nombre: 'WonderBot', original: 'WonderBot',
    posicion: 'Portero', tipo: 'Montaña',
    tiro: 20, pase: 40, defensa: 90, especial: 80,
    hissatsu:['Defensa Automática'],tipoTecnica:'defensa',
    desc: 'Portero robotizado con reflejos sobrehumanos y una programación impecable.',
    locked: true, cost: 99999
  },
  {
    id: 'r71', equipo:'Ángeles Oscuros', nombre: 'Destra', original: 'Desuta',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro:90,pase:80,defensa:30,especial:88,
    hissatsu:['Carga Negativa', 'Lluvia oscura', 'Llamarada infernal'],tipoTecnica:'tiro',
    desc: 'Delantero de fuerza bruta, capaz de romper cualquier defensa.',
    locked: true, cost:189
  },
  {
    id: 'r72', equipo:'Ángeles Oscuros', nombre: 'Sael', original: 'Sael',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro:82,pase:78,defensa:34,especial:78,
    hissatsu:['Remate Celestial'],tipoTecnica:'tiro',
    desc: 'Delantero de origen desconocido, con un estilo de juego místico y poderoso.',
    locked: true, cost:168
  },
  {
  id: 'r73', equipo:'Academia Ogre', nombre: 'Escavan Malice', original: 'Eska Bannel',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro: 81, pase: 70, defensa: 30, especial: 80,
    hissatsu:['Diluvio letal', 'Balon Angelical'],tipoTecnica:'tiro',
    desc: 'Es tan temperamental que monta en cólera si pierde la ocasión de marcar',
    locked: true, cost:179
  },
  {
    id: 'r74', equipo:'Academia Ogre', nombre: 'Mystral Callous', original: 'Mistrene Callous',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro: 80, pase: 70, defensa: 30, especial: 80,
    hissatsu:['Diluvio letal', 'Balón diabólico', 'Lanza Letal'],tipoTecnica:'tiro',
    desc: 'Puede parecer una chica, pero, a la hora de jugar, es todo un salvaje.',
    locked: true, cost:184
  },
  {
    id: 'r75', equipo:'FFI Estrellas', nombre: 'Victor Garcia', original: 'Querardo Naval',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 50, pase: 79, defensa: 81, especial: 80,
    hissatsu:['Engaño Torero', 'Tirachinas', 'Balón yo-yo'],tipoTecnica:'regate',
    desc: 'Se crió en una finca con toros y sabe torear, pero no le gusta herir a los animales.',
    locked: true, cost:152
  },
  {
    id: 'r76', equipo:'Equipo Zero', equiposExtra:['Chrono Storm', 'El Dorado 03', 'Inazuma Japon GO', 'Resistencia Japon', 'Resistencia Japón GO'], nombre: 'Bai Long', original: 'Haikyuu',
    posicion: 'Delantero', tipo: 'Viento',
    tiro:89,pase:84,defensa:34,especial:88,
    hissatsu:['Rizo de Dragón'],tipoTecnica:'tiro',
    desc: 'Rival de Victor Blade. Se crió en el Santuario',
    locked: true, cost:163,
  sprite:'https://inazumarun.es/assets/sprites/r76.webp'
  },
  {
    id: 'r77', equipo:'Equipo Zero', nombre: 'Tezcat', original: 'Shuu',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro:80,pase:78,defensa:34,especial:81,
    hissatsu:['Ceniza Negra', 'Zero Magnum', 'Salto Dimensional'],tipoTecnica:'tiro',
    desc: 'Delantero misterioso con habilidades sobrenaturales.',
    locked: true, cost:163,
  sprite:'https://inazumarun.es/assets/sprites/r77.webp'
  },
  {
    id: 'r78', equipo:'Zanark Domain', equiposExtra:['El Dorado 02', 'El Dorado 03', 'Zan'], nombre: 'Zanark Avalonic', original: 'Zanark Avalonic',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro: 88, pase: 79, defensa: 34, especial: 88,
    hissatsu:['Golpe Cataclismo', 'Salto explosivo', 'Barreno de fuego'],tipoTecnica:'tiro',
    desc: 'Delantero de origen desconocido, con un estilo de juego imponente y poderoso.',
    locked: true, cost:210
  },
  {
    id: 'r79', equipo:'Emperadores Oscuros', nombre: 'Malcom Night Osc.', original: 'Malcom Night',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 50, pase: 80, defensa: 88, especial: 82,
    hissatsu:['Corte Giratorio'],tipoTecnica:'defensa',
    desc: 'Defensa de gran experiencia, capaz de anticipar cualquier jugada.',
    locked: true, cost:126
  },
  {
    id: 'r80', equipo:'Occult', nombre: 'Mask', original: 'Nathan Jones',
    posicion: 'Portero', tipo: 'Viento',
    tiro: 30, pase: 50, defensa: 76, especial: 75,
    hissatsu:['Cuchilla Asesina', 'Campo Torbellino', 'Ataque de la ballena'],tipoTecnica:'tiro',
    desc: 'Portero enmascarado con reflejos felinos y gran intuición para detener tiros.',
    locked: false
  },
  {
    id: 'r81', equipo:'Occult', nombre: 'Wolf', original: 'Troy Moon',
    posicion: 'Centrocampista', tipo: 'Montaña',
    tiro: 70, pase: 71, defensa: 60, especial: 70,
    hissatsu:['Tiro Fantasma', 'Tiro vendaval', 'Tiro rotativo'],tipoTecnica:'tiro',
    desc: 'Defensa que sale cuando hay Luna Llena.',
    locked: false
  },
  {
    id: 'r82', equipo:'Occult', equiposExtra:['Neo Japón'], nombre: 'Talisman', original: 'Johan Tassman',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 76, pase: 70, defensa: 50, especial: 70,
    hissatsu:['Tiro Fantasma', 'Astro Remate'],tipoTecnica:'tiro',
    desc: 'Mediocentro y capitán del Occult.',
    locked: false
  },
 // ============================================================
  // WILD - 11 TITULARES
  // ============================================================

  {
    id: 'r83', equipo:'Wild', nombre: 'Boar', original: 'Charlie Boardfield',
    posicion: 'Portero', tipo: 'Fuego',
    tiro: 18, pase: 48, defensa: 75, especial: 72,
    hissatsu:['Garra Salvaje', 'Parada fuerte', 'Volteador de mesas'],tipoTecnica:'tiro',
    desc: 'Portero del Wild, agresivo y poderoso como un jabalí.',
    locked: false, cost:110
  },
  {
    id: 'r84', equipo:'Wild', nombre: 'Chicken', original: 'Hugo Tallgeese',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 66, pase: 70, defensa: 61, especial: 68,
    hissatsu:['Superaceleración', 'Ataque de Cóndor'],tipoTecnica:'regate',
    desc: 'Capitán del Wild y cerebro del equipo.',
    locked: false, cost:121
  },
  {
    id: 'r85', equipo:'Wild', nombre: 'Fishman', original: 'Wilson Fishman', sprite: 'https://inazumarun.es/assets/sprites/r85.webp',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 38, pase: 52, defensa: 75, especial: 69,
    hissatsu:['Robo veloz', 'Corte Giratorio'],tipoTecnica:'defensa',
    desc: 'Defensa ágil especializado en robar balones.',
    locked: false, cost:95
  },
  {
    id: 'r86', equipo:'Wild', nombre: 'Toad', original: 'Peter Johnson', sprite: 'https://inazumarun.es/assets/sprites/r86.webp',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 34, pase: 46, defensa: 73, especial: 68,
    hissatsu:['Barrido Defensivo', 'Superaceleración'],tipoTecnica:'defensa',
    desc: 'Defensa resistente que utiliza movimientos rápidos para recuperar el balón.',
    locked: false, cost:92
  },
  {
    id: 'r87', equipo:'Wild', nombre: 'Lion', original: 'Leonard O\'Shea', sprite: 'https://inazumarun.es/assets/sprites/r87.webp',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 45, pase: 48, defensa: 78, especial: 72,
    hissatsu:['Embestida', 'Remate del águila', 'Tiro pirueta'],tipoTecnica:'regate',
    desc: 'Defensa poderoso que destaca por su fuerza física.',
    locked: false, cost:110
  },
  {
    id: 'r88', equipo:'Wild', nombre: 'Chameleon', original: 'Cham Lion', sprite: 'https://inazumarun.es/assets/sprites/r88.webp',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 42, pase: 75, defensa: 73, especial: 62,
    hissatsu:['Robo veloz', 'Espejismo'],tipoTecnica:'defensa',
    desc: 'Defensa imprevisible capaz de desaparecer entre los rivales.',
    locked: false, cost:97
  },
  {
    id: 'r89', equipo:'Wild', nombre: 'Eagle', original: 'Steve Eagle', sprite: 'https://inazumarun.es/assets/sprites/r89.webp',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 70, pase: 70, defensa: 48, especial: 70,
    hissatsu:['Ataque de Cóndor', 'Espejismo de balón'],tipoTecnica:'tiro',
    desc: 'Centrocampista veloz que domina el juego aéreo.',
    locked: false, cost:113
  },
  {
    id: 'r90', equipo:'Wild', nombre: 'Monkey', original: 'Bruce Monkey', sprite: 'https://inazumarun.es/assets/sprites/r90.webp',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 64, pase: 65, defensa: 66, especial: 68,
    hissatsu:['Giro de Mono', 'Remate Tarzán'],tipoTecnica:'regate',
    desc: 'Jugador imprevisible y escurridizo que puede aparecer en cualquier zona.',
    locked: false, cost:107
  },
  {
    id: 'r91', equipo:'Wild', nombre: 'Gorilla', original: 'Gary Lancaster', sprite: 'https://inazumarun.es/assets/sprites/r91.webp',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro: 75, pase: 72, defensa: 45, especial: 70,
    hissatsu:['Remate Tarzán'],tipoTecnica:'tiro',
    desc: 'Delantero de enorme fuerza física y potencia de remate.',
    locked: false, cost:126
  },
  {
    id: 'r92', equipo:'Wild', nombre: 'Snake', original: 'Harry Snake', sprite: 'https://inazumarun.es/assets/sprites/r92.webp',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 73, pase: 69, defensa: 38, especial: 72,
    hissatsu:['Remate Serpiente', 'Pase Cruzado'],tipoTecnica:'tiro',
    desc: 'Delantero ágil cuyos movimientos son difíciles de predecir.',
    locked: false, cost:121
  },
  {
    id: 'r93', equipo:'Wild', nombre: 'Cheetah', original: 'Adrian Speed',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 78, pase: 58, defensa: 34, especial: 78,
    hissatsu:['Remate Tarzán', 'Entrada huracán'],tipoTecnica:'tiro',
    desc: 'El delantero más veloz del Wild, capaz de dejar atrás a cualquier defensa.',
    locked: false, cost:137
  },

  {
    id: 'r94', equipo:'Occult', nombre: 'Styx', original: 'Russell Walk', sprite: 'https://inazumarun.es/assets/sprites/r94.webp',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 42, pase: 50, defensa: 73, especial: 72,
    hissatsu:['Gravedad', 'Tiro Fantasma'],tipoTecnica:'defensa',
    desc: 'Defensa del Occult vinculado al río de los muertos.',
    locked: false, cost:110
  },
  {
    id: 'r95', equipo:'Occult', equiposExtra:['Los arions'], nombre: 'Creepy', original: 'Jason Jones', sprite: 'https://inazumarun.es/assets/sprites/r95.webp',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 38, pase: 48, defensa: 72, especial: 70,
    hissatsu:['Doppelganger', 'Cabezazo cohete', 'Espejismo de balón'],tipoTecnica:'defensa',
    desc: 'Defensa siniestro capaz de confundir a sus rivales.',
    locked: false, cost:105
  },
  {
    id: 'r96', equipo:'Occult', nombre: 'Franky', original: 'Ken Furan', sprite: 'https://inazumarun.es/assets/sprites/r96.webp',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 38, pase: 45, defensa: 74, especial: 65,
    hissatsu:['Frankstein', 'Puño Vengativo', 'Despeje de fuerza'],tipoTecnica:'tiro',
    desc: 'Defensa corpulento obsesionado con crear vida artificial.',
    locked: false, cost:113
  },
  {
    id: 'r97', equipo:'Occult', nombre: 'Undead', original: 'Jerry Fulton', sprite: 'https://inazumarun.es/assets/sprites/r97.webp',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 40, pase: 47, defensa: 71, especial: 68,
    hissatsu:['Doppelganger', 'Ataque de las sombras', 'Tiro Fantasma'],tipoTecnica:'defensa',
    desc: 'Defensa que parece incapaz de sentir miedo o dolor.',
    locked: false, cost:107
  },
  {
    id: 'r98', equipo:'Occult', nombre: 'Jiangshi', original: 'Ray Mannings', sprite: 'https://inazumarun.es/assets/sprites/r98.webp',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 58, pase: 67, defensa: 50, especial: 73,
    hissatsu:['Gravedad', 'Ataque de las sombras'],tipoTecnica:'defensa',
    desc: 'Centrocampista que se mueve de forma extraña e imprevisible.',
    locked: false, cost:113
  },
  {
    id: 'r99', equipo:'Occult', nombre: 'Mummy', original: 'Robert Mayer', sprite: 'https://inazumarun.es/assets/sprites/r99.webp',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 56, pase: 64, defensa: 53, especial: 70,
    hissatsu:['Gravedad', 'Ataque de las sombras', 'Doppelganger'],tipoTecnica:'defensa',
    desc: 'Centrocampista envuelto en vendas y experto en controlar el ritmo.',
    locked: false, cost:107
  },
  {
    id: 'r100', equipo:'Occult', nombre: 'Grave', original: 'Alexander Brave', sprite: 'https://inazumarun.es/assets/sprites/r100.webp',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 69, pase: 69, defensa: 48, especial: 74,
    hissatsu:['Maldición', 'Ataque de las sombras', 'Tiro Fantasma'],tipoTecnica:'tiro',
    desc: 'Centrocampista que canaliza una energía oscura y misteriosa.',
    locked: false, cost:113
  },
  {
    id: 'r101', equipo:'Occult', nombre: 'Blood', original: 'Burt Wolf', sprite: 'https://inazumarun.es/assets/sprites/r101.webp',
    posicion: 'Centrocampista', tipo: 'Montaña',
    tiro: 64, pase: 61, defensa: 50, especial: 76,
    hissatsu:['Tiro Fantasma', 'Gravedad'],tipoTecnica:'tiro',
    desc: 'Centrocampista siniestro que utiliza técnicas de aspecto vampírico.',
    locked: false, cost:118
  },
    {
    id: 'r102', equipo:'Zeus', nombre: 'Apollo', original: 'Apollo Hikaru',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 38, pase: 78, defensa: 78, especial: 80,
    hissatsu:['Entrada Tormenta'],tipoTecnica:'regate',
    desc: 'Defensa del Zeus conocido por sus movimientos rápidos y precisos.',
    locked: false, cost:113
  },
  {
    id: 'r103', equipo:'Zeus', nombre: 'Hephestus', original: 'En Hephais',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 42, pase: 79, defensa: 79, especial: 79,
    hissatsu:['Mega Terremoto'],tipoTecnica:'tiro',
    desc: 'Defensa poderoso que utiliza su fuerza para detener los ataques.',
    locked: false, cost:118
  },
  {
    id: 'r104', equipo:'Zeus', nombre: 'Ares', original: 'Ran Aresu',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 40, pase: 79, defensa: 84, especial: 75,
    hissatsu:['Entrada Tormenta', 'Gravedad', 'Apisonadora'],tipoTecnica:'regate',
    desc: 'Defensa agresivo que destaca por sus entradas contundentes.',
    locked: false, cost:113
  },
  {
    id: 'r105', equipo:'Zeus', nombre: 'Dionyisus', original: 'Geki Deio',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 44, pase: 79, defensa: 80, especial: 79,
    hissatsu:['Mega Terremoto', 'Gran seísmo', 'Disparo con Rebotes'],tipoTecnica:'tiro',
    desc: 'Defensa del Zeus con una gran potencia física.',
    locked: false, cost:116
  },
  {
    id: 'r106', equipo:'Zeus', nombre: 'Hermes', original: 'Matsuaki Herume',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 68, pase: 81, defensa: 69, especial: 78,
    hissatsu:['Hora Celestial', 'Apisonadora', 'Fénix'],tipoTecnica:'tiro',
    desc: 'Centrocampista veloz especializado en superar rivales con su velocidad.',
    locked: false, cost:121
  },
  {
    id: 'r107', equipo:'Zeus', nombre: 'Athena', original: 'Tomo Atena',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 74, pase: 78, defensa: 74, especial: 74,
    hissatsu:['Sabiduría Divina', 'Entrada Tormenta', 'Escáner Ataque'],tipoTecnica:'defensa',
    desc: 'Centrocampista técnico capaz de controlar el ritmo del partido.',
    locked: false, cost:118
  },
  {
    id: 'r108', equipo:'Zeus', nombre: 'Demeter', original: 'Yutaka Demete',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 81, pase: 77, defensa: 39, especial: 77,
    hissatsu:['Disparo con Rebotes', 'Flecha Divina', 'Entrada Tormenta'],tipoTecnica:'tiro',
    desc: 'Delantero del zeus con potente disparo.',
    locked: false, cost:121
  },
  {
    id: 'r109', equipo:'Zeus', nombre: 'Hera', original: 'Tadashi Hera',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 76, pase: 77, defensa: 66, especial: 75,
    hissatsu:['Flecha Divina', 'Barrido Defensivo', 'Arrollador'],tipoTecnica:'tiro',
    desc: 'Centrocampista del Zeus capaz de lanzar poderosos disparos.',
    locked: false, cost:121
  },
  {
    id: 'r472', equipo:'Zeus', nombre: 'Hades', original: 'Hades',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 41, pase: 73, defensa: 85, especial: 78,
    hissatsu:['Apisonadora'],tipoTecnica:'defensa',
    desc: 'Defensa del Zeus, arrasa con todo lo que se le pone por delante.',
    locked: false, cost:121,
    sprite:'https://inazumarun.es/assets/sprites/r472.jpg'
  },
  {
    id: 'r473', equipo:'Zanark Domain', nombre: 'Cao Cao', original: 'Cao Cao',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 43, pase: 84, defensa: 88, especial: 82,
    hissatsu:['Muralla de Piedra', 'Corte Mágico', 'Estrella de roca'],tipoTecnica:'defensa',
    desc: 'Defensa del Zanark Domain, sólido como una montaña ante cualquier ataque.',
    locked: false, cost:222,
    sprite:'https://inazumarun.es/assets/sprites/r473.webp'
  },
  {
    id: 'r474', equipo:'Flota Ixar', nombre: 'Bitway Ozrock', original: 'Bitway Ozrock',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 91, pase: 80, defensa: 38, especial: 89,
    hissatsu:['Cañón Estelar', 'Rayo del juicio', 'Tormenta estelar'],tipoTecnica:'tiro',
    desc: 'Delantero de la Flota Ixar, uno de los atacantes más temidos por su potencia de disparo.',
    locked: false, cost:167,
    sprite:'https://inazumarun.es/assets/sprites/r474.webp'
  },
  {
    id: 'r475', equipo:'Flota Ixar', nombre: 'Meteo', original: 'Meteo',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 45, pase: 82, defensa: 88, especial: 85,
    hissatsu:['Impacto Meteórico'],tipoTecnica:'defensa',
    desc: 'Defensa de la Flota Ixar, tan firme y ardiente como una lluvia de meteoros.',
    locked: false, cost:130,
    sprite:'https://inazumarun.es/assets/sprites/r475.webp'
  },
  {
    id: 'r476', equipo:'Flota Ixar', nombre: 'Phobos', original: 'Phobos',
    posicion: 'Portero', tipo: 'Montaña',
    tiro: 20, pase: 55, defensa: 86, especial: 82,
    hissatsu:['Muro del Miedo'],tipoTecnica:'defensa',
    desc: 'Portero de la Flota Ixar, una muralla infranqueable bajo los tres palos.',
    locked: false, cost:127,
    sprite:'https://inazumarun.es/assets/sprites/r476.webp'
  },
  {
    id: 'r477', equipo:'Gar', nombre: 'Fei Osc.', original: 'Fei Rune',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 88, pase: 82, defensa: 45, especial: 85,
    hissatsu:['Remate Rebotado V2', 'Remate Rebotado', 'Superremate rebotado'],tipoTecnica:'tiro',
    desc: 'Capitán y delantero del Gar, hijo de Asurei Rune. Frío y calculador, detiene cualquier ataque con su sola presencia.',
    locked: true, cost:172,
    sprite:'https://inazumarun.es/assets/sprites/r477.webp'
  },
  {
    id: 'r478', equipo:'Gar', nombre: 'Yurkeh', original: 'Yokka',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 80, pase: 75, defensa: 80, especial: 82,
    hissatsu:['Meteoro Azul', 'Espada de Odín', 'Himno de atenea'],tipoTecnica:'tiro',
    desc: 'Conocido como el Meteoro Azul del Gar, un delantero veloz y letal de cara a portería.',
    locked: false, cost:150,
    sprite:'https://inazumarun.es/assets/sprites/r478.webp'
  },
  {
    id: 'r479', equipo:'Gar', nombre: 'Pino', original: 'Pino',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 82, pase: 70, defensa: 36, especial: 79,
    hissatsu:['Explosión Diminuta', 'Despliegue de señuelos', 'Cabezazo cohete'],tipoTecnica:'tiro',
    desc: 'Pese a su pequeño cuerpo desborda potencia; del Gar, siempre a punto de quedarse dormido.',
    locked: false, cost:145,
    sprite:'https://inazumarun.es/assets/sprites/r479.webp'
  },
  {
    id: 'r480', equipo:'Gar', nombre: 'Yuh', original: 'Yuichi',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 79, pase: 79, defensa: 42, especial: 77,
    hissatsu:['Muro Viviente', 'Aullido de lobo', 'Despliegue de señuelos'],tipoTecnica:'tiro',
    desc: 'Delantero del Gar de gran complexión y reflejos excelentes; es el pilar mental del equipo.',
    locked: false, cost:142,
    sprite:'https://inazumarun.es/assets/sprites/r480.webp'
  },
  {
    id: 'r481', equipo:'Gar', nombre: 'Chitoh', original: 'Chet',
    posicion: 'Portero', tipo: 'Bosque',
    tiro: 18, pase: 58, defensa: 82, especial: 80,
    hissatsu:['Furia Contenida', 'Repulsión', 'Presa de sombras'],tipoTecnica:'defensa',
    desc: 'Portero del Gar de apariencia amable, pero terrorífico cuando se enfada.',
    locked: false, cost:144,
    sprite:'https://inazumarun.es/assets/sprites/r481.webp'
  },
  {
    id: 'r482', equipo:'Gar', nombre: 'Fumh', original: 'Fuhmita',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 42, pase: 79, defensa: 82, especial: 78,
    hissatsu:['Muralla Táctica', 'Gran Torbellino', 'Campo Torbellino'],tipoTecnica:'defensa',
    desc: 'El cerebro del Gar; se dice que los movimientos del equipo dependen de su táctica.',
    locked: false, cost:141,
    sprite:'https://inazumarun.es/assets/sprites/r482.webp'
  },
  {
    id: 'r483', equipo:'Gar', nombre: 'Rokah', original: 'Rhoko',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 72, pase: 80, defensa: 78, especial: 84,
    hissatsu:['Dulce Euforia', 'Despliegue de señuelos', 'La niebla'],tipoTecnica:'regate',
    desc: 'Centrocampista del Gar, animada e inocente; dicen que su fuente de poder son los dulces.',
    locked: false, cost:148,
    sprite:'https://inazumarun.es/assets/sprites/r483.webp'
  },


  // ============================================================
  // GÉNESIS
  // Xene y Bellatrix ya están definidos.
  // ============================================================

  {
    id: 'r110', equipo:'Genesis', nombre: 'Nero', original: 'Nelson Rockwell',
    posicion: 'Portero', tipo: 'Bosque',
    tiro: 38, pase: 52, defensa: 84, especial: 76,
    hissatsu:['Muro Dimensional', 'Parada fuerte', 'Red procyon'],tipoTecnica:'defensa',
    desc: 'Portero del Génesis con una defensa prácticamente inexpugnable.',
    locked: false, cost:142
  },
  {
    id: 'r111', equipo:'Genesis', nombre: 'Gele', original: 'Gail Baker',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 40, pase: 72, defensa: 80, especial: 74,
    hissatsu:['Niebla Mística', 'Flash de fotones', 'Zona Sigma'],tipoTecnica:'regate',
    desc: 'Defensa del Génesis que confunde a sus rivales con movimientos impredecibles.',
    locked: false, cost:126
  },
  {
    id: 'r112', equipo:'Genesis', nombre: 'Kiburn', original: 'Kim Powell',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 44, pase: 70, defensa: 80, especial: 76,
    hissatsu:['Gravitación', 'Carrera relámpago'],tipoTecnica:'defensa',
    desc: 'Defensa extremadamente poderoso que utiliza la fuerza gravitatoria.',
    locked: false, cost:128
  },
  {
    id: 'r113', equipo:'Genesis', equiposExtra:['Alius Masters', 'Neo Japón'], nombre: 'Zohen', original: 'Zack Cummings',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 42, pase: 69, defensa: 80, especial: 70,
    hissatsu:['Robo Planeta', 'Gran seísmo', 'Gravitación'],tipoTecnica:'defensa',
    desc: 'Defensa resistente especializado en recuperar el balón.',
    locked: false, cost:126
  },
  {
    id: 'r114', equipo:'Genesis', nombre: 'Hauser', original: 'Hunt Mercer',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 40, pase: 69, defensa: 76, especial: 72,
    hissatsu:['Superarmadillo', 'Apisonadora'],tipoTecnica:'defensa',
    desc: 'Defensa de enorme resistencia física.',
    locked: false, cost:128
  },
  {
    id: 'r115', equipo:'Genesis', equiposExtra:['Alius Masters'], nombre: 'Kormer', original: 'Connor Murray',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 67, pase: 68, defensa: 68, especial: 78,
    hissatsu:['Rapto Divino', 'Carrera relámpago', 'Corte Giratorio'],tipoTecnica:'tiro',
    desc: 'Centrocampista del Génesis con gran capacidad para controlar el balón.',
    locked: false, cost:131
  },
  {
    id: 'r116', equipo:'Genesis', nombre: 'Kiwill', original: 'Katie Brown',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 65, pase: 75, defensa: 78, especial: 76,
    hissatsu:['Finta boomerang', 'Cruz del sur', 'Zona Sigma'],tipoTecnica:'regate',
    desc: 'Centrocampista técnica y ágil que destaca en el uno contra uno.',
    locked: false, cost:126
  },
  {
    id: 'r117', equipo:'Genesis', nombre: 'Ark', original: 'Ashton Malone',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 70, pase: 70, defensa: 65, especial: 80,
    hissatsu:['Cañón de Meteoritos', 'Carrera relámpago', 'Cruz del sur'],tipoTecnica:'tiro',
    desc: 'Centrocampista ofensivo con un disparo de enorme potencia.',
    locked: false, cost:137
  },
  {
    id: 'r118', equipo:'Genesis', equiposExtra:['Alius Masters', 'Neo Japón'], nombre: 'Wittz', original: 'Wilbur Watkins',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 82, pase: 78, defensa: 38, especial: 82,
    hissatsu:['Astro Remate', 'Rayo de Ganímedes'],tipoTecnica:'tiro',
    desc: 'Delantero del Génesis capaz de realizar potentes remates de origen cósmico.',
    locked: false, cost:142
  },
  {
    id: 'r119', equipo:'Pequeños Gigantes', nombre: 'Hector Helio', original: 'Rococo Ulpa',
    posicion: 'Portero', tipo: 'Montaña',
    tiro: 51, pase: 56, defensa: 87, especial: 82,
    hissatsu:['Mano Celestial X', 'Disparo X', 'Mano Espiritual'],tipoTecnica:'portero',
    desc: 'Procede de una remota región llamada Costail y tiene un potencial enorme.',
    locked: false, cost:200
  },
  {
    id: 'r120', equipo:'Pequeños Gigantes', nombre: 'Hector Helio', original: 'Rococo Ulpa',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro: 88, pase: 79, defensa: 38, especial: 85,
    hissatsu:['Disparo X', 'Mano Celestial X', 'Mano Espiritual'],tipoTecnica:'tiro',
    desc: 'Procede de una remota región llamada Costail y tiene un potencial enorme.',
    locked: false, cost:200
  },
  // r121-r129: ronda de ampliación adicional, misma confianza media que
  // r17-r21 (posición y elemento verificados por búsqueda, hissatsu real
  // atribuido correctamente cuando se ha podido confirmar con una fuente
  // clara). El elemento de Choi es una inferencia razonable a partir del
  // nombre de su equipo (Fire Dragon / Corea), no una confirmación directa
  // de su atributo personal -- revísalo si te importa la precisión exacta.
  {
    id: 'r121', equipo:'Academia Universal', equiposExtra:['Chrono Storm', 'El Dorado 03', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre: 'Sol Daystar', original: 'Amemiya Taiyou',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 85, pase: 80, defensa: 65, especial: 80,
    hissatsu:['Tormenta Solar', 'Luz Cegadora', 'Cañon de Meteoritos'],tipoTecnica:'tiro',
    desc: 'Capitán del Universal, considerado el genio del fútbol de su generación.',
    locked: false, cost:152,
  sprite:'https://inazumarun.es/assets/sprites/r121.webp'
  },
  {
    id: 'r122', equipo: 'Caos', equiposExtra:['Polvo de Diamante'], nombre: 'Gocker', original: 'Gokukawa Kantarou',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 25, pase: 79, defensa: 88, especial: 83,
    hissatsu:['Rompehielos', 'Apisonadora', 'Carga de Elefantes'],tipoTecnica:'defensa',
    desc: 'Defensa corpulento del Polvo de Diamantes, temido por su fuerza bruta.',
    locked: false, cost:158
  },
  {
    id: 'r123', equipo: 'Caos', equiposExtra:['Prominence'], nombre: 'Bomber', original: 'Honba Geki',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 30, pase:75, defensa: 86, especial: 80,
    hissatsu:['Cortafuegos', 'Muro Dimensional', 'Bomba Falsa'],tipoTecnica:'defensa',
    desc: 'Defensa de Prominence que forma una defensa temible junto a Gocker.',
    locked: false, cost:158
  },
  {
    id: 'r124', equipo:'Los arions', equiposExtra:['El Dorado 01', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre: 'Goldie Lemmon', original: 'Nanobana Kinako',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 68, pase: 83, defensa: 84, especial: 82,
    hissatsu:['Grumo Pegapasta', 'Tornado de Fuego DT', 'Pasos aéreos'],tipoTecnica:'portero',
    desc: 'Defensa polivalente que ha jugado en varios de los grandes equipos de su generación.',
    locked: false, cost:131
  },
  {
    id: 'r125', equipo: 'Caos', equiposExtra:['Prominence'], nombre: 'Heat', original: 'Atsuishi Shigeto',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 71, pase: 78, defensa: 74, especial: 74,
    hissatsu:['Lluvia de Meteoros', 'Remate combinado f', 'Remate de Gaia'],tipoTecnica:'tiro',
    desc: 'Centrocampista de Prominence, aprendió una técnica prohibida de un portero legendario.',
    locked: false, cost:124
  },
  {
    id: 'r126', equipo:'Prominence', nombre: 'Lean', original: 'Hasuike An',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 60, pase: 78, defensa: 60, especial: 70,
    hissatsu:['Cruz del sur', 'Llamarada Atómica', 'Astro Remate'],tipoTecnica:'tiro',
    desc: 'Centrocampista de Prominence con un regate entre los mejores de su generación.',
    locked: false, cost:128
  },
  {
    id: 'r127', equipo:'Orfeo', nombre: 'Julio Acuto', original: 'Demonio Strada',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 78, pase: 82, defensa: 73, especial: 85,
    hissatsu:['Pinguino Emperador X', 'Espejismo de balón', 'Ruptura Relámpago'],tipoTecnica:'regate',
    desc: 'Idéntico a Jude Sharp, del que llegó a ser una copia casi perfecta.',
    locked: false, cost:137
  },
  {
    id: 'r128', equipo:'Cala Pirata', equiposExtra:['Resistencia Japon', 'Resistencia Japón GO', 'Sector Quinto'], nombre: 'Davy Jones', original: 'Namikawa Rensuke',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 84, pase: 70, defensa: 42, especial: 80,
    hissatsu:['Peces Voladores', 'Danza del viento', 'Proyectil de Ozono'],tipoTecnica:'regate',
    desc: 'Capitán y delantero de Kaiou Gakuen, orgulloso de defender su honor.',
    locked: false, cost:134,
  sprite:'https://inazumarun.es/assets/sprites/r128.webp'
  },
  {
    id: 'r129', equipo:'Dragones de Fuego', nombre: 'Choi', original: 'Choi Chang-soo',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 65, pase: 87, defensa: 80, especial: 75,
    hissatsu:['Caída Infernal', 'Tacón infernal', 'Dragón terrestre'],tipoTecnica:'tiro',
    desc: 'Capitán de Fire Dragon, la selección de Corea, uno de los grandes creadores de juego.',
    locked: false, cost:134
  },
  {
    id: 'r130', equipo:'Mary Times', nombre: 'Soundtown', original: 'Cadence Soundtown',
    posicion: 'Centrocampista', tipo: 'Fuego',
    tiro: 71, pase: 82, defensa: 82, especial: 75,
    hissatsu:['Baile de Llamas', 'Mirada ladrona'],tipoTecnica:'tiro',
    desc: 'Capitán de Mary Times',
    locked: false, cost:134
  },
  {
    id: 'r131', equipo:'Royal Academy', equiposExtra:['Neo Japón'], nombre: 'Alan Master', original: 'Alan Master',
    posicion: 'Centrocampista', tipo: 'Bosque',
    tiro: 71, pase: 76, defensa: 73, especial: 65,
    hissatsu:['Robo veloz', 'Barrido Defensivo', 'Espejismo de balón'],tipoTecnica:'defensa',
    desc: 'Creador de juego de la Royal.',
    locked: false, cost:134
  },
    {id: 'r132', equipo:'Tormenta de Géminis', nombre: 'Ganymede', original: 'Ganymede',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 47, pase: 74, defensa: 83, especial: 80,
    hissatsu:['Gravitación', 'Rayo de Ganímedes'],tipoTecnica:'defensa',
    desc: 'Defensa de Tormenta de Géminis',
    locked: false, cost:134
  },
  {id: 'r133', equipo:'Raimon GO', nombre: 'Wanli Chang-Cheng', original: 'Wanli',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 45, pase: 66, defensa: 83, especial: 76,
    hissatsu:['Muralla de Atlantis'],tipoTecnica:'defensa',
    desc: 'Defensa Físico y amigable',
    locked: false, cost:134,
  sprite:'https://inazumarun.es/assets/sprites/r133.webp'
  },
  {
    id: 'r135', equipo:'Protocolo Omega 2.0', equiposExtra:['El Dorado 02', 'Élite Omega', 'Protocolo Omega', 'Ciervo Blanco'], nombre: 'Beta', original: 'Beta',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 85, pase: 79, defensa: 42, especial: 78,
    hissatsu:['Comando de Disparo 07', 'Ataque Omega', 'Barrena voladora'],tipoTecnica:'tiro',
    desc: 'Capitana del Protocolo Omega 2.0, capaz de cambiar por completo su personalidad durante los partidos.',
    locked: true, cost:189
  },
  {
    id: 'r136', equipo:'Protocolo Omega', nombre: 'Alpha', original: 'Alpha',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 84, pase: 78, defensa: 44, especial: 76,
    hissatsu:['Comando de Disparo 05', 'Tiro rotativo', 'Ataque Omega'],tipoTecnica:'tiro',
    desc: 'Capitán del Protocolo Omega 1.0, calculador y extremadamente preciso en el campo.',
    locked: true, cost:189
  },
  {
    id: 'r137', equipo:'Protocolo Omega 3.0', equiposExtra:['El Dorado 02', 'Élite Omega'], nombre: 'Gamma', original: 'Gamma',
    posicion: 'Delantero', tipo: 'Bosque',
    tiro: 86, pase: 78, defensa: 48, especial: 77,
    hissatsu:['Comando de Disparo 13', 'Giro atómico', 'Ataque Omega'],tipoTecnica:'tiro',
    desc: 'Líder del Protocolo Omega 3.0, un delantero frío que confía plenamente en sus capacidades.',
    locked: true, cost:179
  },
  {
    id: 'r138', equipo:'Earth Eleven', nombre: 'J.P. Lapin', original: 'Nishizono Shinsuke',
    posicion: 'Portero', tipo: 'Montaña',
    tiro: 42, pase: 55, defensa: 81, especial: 78,
    hissatsu:['Parada en Plancha', 'Defensa propulsada', 'Manos infinitas'],tipoTecnica:'portero',
    desc: 'Portero de pequeño tamaño pero enorme determinación, siempre dispuesto a proteger su portería.',
    locked: true, cost:147
  },
  {
    id: 'r139', equipo:'Earth Eleven', equiposExtra:['Mar de Luna'], nombre: 'Terry Archibald', original: 'Ibuki Munemasa',
    posicion: 'Portero', tipo: 'Viento',
    tiro: 45, pase: 58, defensa: 86, especial: 81,
    hissatsu:['Parada mate', 'Mate del dragón', 'Zarpazo poderoso'],tipoTecnica:'tiro',
    desc: 'Portero de largos brazos y enorme fuerza, antiguo jugador de baloncesto acostumbrado a actuar por su cuenta.',
    locked: true, cost:200
  },
  {
    id: 'r140', equipo:'Chispas Perfectas', equiposExtra:['Artemisa de Mr.YI', 'Instituto Plenilunio'], nombre: 'Lucas Star', original: 'Ichihoshi Hikaru',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 79, pase: 82, defensa: 80, especial: 80,
    hissatsu:['Órbita Celestial'],tipoTecnica:'tiro',
    desc: 'Centrocampista de enorme talento cuya verdadera identidad esconde una historia mucho más compleja.',
    locked: true, cost:189
  },
  {
    id: 'r141', equipo:'Earth Eleven', equiposExtra:['Poderosa Fe'], nombre: 'Frank Foreman', original: 'Tetsukado Shin',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 58, pase: 78, defensa: 83, especial: 80,
    hissatsu:['Juego de piernas', 'Contra', 'Cabezazo cohete'],tipoTecnica:'regate',
    desc: 'Defensa corpulento y directo, antiguo boxeador acostumbrado a enfrentarse a sus rivales sin miedo.',
    locked: true, cost:168
  },
  {
    id: 'r142', equipo:'Earth Eleven', equiposExtra:['Cala Pirata'], nombre: 'Falco Flashman', original: 'Matatagi Hayato',
    posicion: 'Delantero', tipo: 'Viento',
    tiro: 86, pase: 78, defensa: 38, especial: 80,
    hissatsu:['Taconazo Parkour', 'Alba Oscura', 'Poder parkour'],tipoTecnica:'regate',
    desc: 'Delantero extremadamente veloz y talentoso, capaz de convertirse en una amenaza constante para cualquier defensa.',
    locked: true, cost:173
  },
  {
    id: 'r143', equipo:'Earth Eleven', nombre: 'Keenan Sharpe', original: 'Minaho Kazuto',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 52, pase: 80, defensa: 87, especial: 80,
    hissatsu:['Copia y corta', 'Sincronía logística', 'Finta boomerang'],tipoTecnica:'regate',
    desc: 'Defensa inteligente y observador, destaca por analizar rápidamente las jugadas de sus rivales.',
    locked: true, cost:168
  },
  {
    id: 'r144', equipo:'Earth Eleven', nombre: 'Zippy Lermer', original: 'Manabe Jinichirou',
    posicion: 'Defensa', tipo: 'Viento',
    tiro: 48, pase: 83, defensa: 85, especial: 80,
    hissatsu:['Cálculo Perfecto', 'Sincronía logística', 'Ecuación defensiva'],tipoTecnica:'portero',
    desc: 'Defensa brillante capaz de analizar las trayectorias y calcular con precisión las jugadas del partido.',
    locked: true, cost:168
  },
  {
    id: 'r145', equipo:'Earth Eleven', nombre: 'Trina Verdure', original: 'Morimura Konoha',
    posicion: 'Defensa', tipo: 'Bosque',
    tiro: 42, pase: 75, defensa: 80, especial: 78,
    hissatsu:['Bola de Hojas', 'Remolino de hojas', 'Telaraña'],tipoTecnica:'tiro',
    desc: 'Defensa inicialmente tímida que consigue superar sus miedos y convertirse en una jugadora muy importante.',
    locked: true, cost:168
  },
  {
    id: 'r146', equipo:'Earth Eleven', nombre: 'Cerise Blossom', original: 'Nozaki Sakura',
    posicion: 'Centrocampista', tipo: 'Viento',
    tiro: 70, pase: 82, defensa: 61, especial: 84,
    hissatsu:['Aro-AleHop', 'Baile de mariposas', 'Choque Sirena'],tipoTecnica:'regate',
    desc: 'Centrocampista elegante y habilidosa, con una gran coordinación gracias a su experiencia en gimnasia rítmica.',
    locked: true, cost:158
  },
  {
    id: 'r147', equipo:'Ragnah', equiposExtra:['Chrono Storm'], nombre: 'Simeon Ayp', original: 'Saru',
    posicion: 'Delantero', tipo: 'Montaña',
    tiro: 89, pase: 86, defensa: 48, especial: 85,
    hissatsu:['Cañonazo de fragmentos', 'Despliegue de señuelos', 'Rizo de Dragón'],tipoTecnica:'tiro',
    desc: 'Líder y capitán del Ragnah y uno de los jugadores más poderosos de la era de Chrono Stone.',
    locked: true, cost:210
  },
  {
    id: 'r148', equipo:'Os Reis', nombre: 'Mac Robingo', original: 'Mac Robingo',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 89, pase: 78, defensa: 40, especial: 87,
    hissatsu:['Golpe de Samba'],tipoTecnica:'regate',
    desc: 'Delantero brasileño de gran potencia y presencia física, capaz de imponerse en el área rival.',
    locked: true, cost:210
  },
    {
    id: 'r149', equipo:'Orfeo', nombre: 'Gigi Blasi', original: 'Gigi Blasi',
    posicion: 'Portero', tipo: 'Viento',
    tiro: 38, pase: 51, defensa: 85, especial: 84,
    hissatsu:['Guardia del Coliseo', 'Muralla Gigante', 'Gran seísmo'],tipoTecnica:'defensa',
    desc: 'Guardameta italiano.',
    locked: true, cost:189
  },
    {
    id: 'r150', equipo:'Genesis', equiposExtra:['Alius Masters'], nombre: 'Xene', original: 'Xavier Foster',
    posicion: 'Delantero', tipo: 'Fuego',
    tiro: 87, pase: 79, defensa: 38, especial: 82,
    hissatsu:['Supernova', 'Cañon de Meteoritos', 'Cruz del sur'],tipoTecnica:'tiro',
    desc: 'Delantero del Génesis y capitán.',
    locked: false, cost:210
  },
  {
    id: 'r151', equipo:'Brain', equiposExtra:['Emperadores Oscuros'], nombre: 'Feldt', original: 'Thomas Feldt',
    posicion: 'Portero', tipo: 'Bosque',
    tiro: 18, pase: 55, defensa: 82, especial: 80,
    hissatsu:['Campo de fuerza', 'Parada fuerte', 'Despeje cohete'],tipoTecnica:'portero',
    desc: 'Capitán y portero del Brain. Un jugador inteligente que recupera su verdadero espíritu deportivo.',
    locked: true, cost:131
  },
  {
    id: 'r152', equipo:'Brain', nombre: 'Philip Marvel', original: 'Philip Marvel',
    posicion: 'Defensa', tipo: 'Montaña',
    tiro: 35, pase: 68, defensa: 78, especial: 71,
    hissatsu:['Escáner Defensa', 'Robo veloz', 'Picadora'],tipoTecnica:'defensa',
    desc: 'Defensa del Brain que destaca por su físico.',
    locked: true, cost:110
  },
  {
    id: 'r153', equipo:'Brain', nombre: 'Stronger', original: 'Terry Stronger',
    posicion: 'Defensa', tipo: 'Fuego',
    tiro: 48, pase: 58, defensa: 75, especial: 70,
    hissatsu:['Escáner Defensa', 'Corte Volcánico', 'Mirada al futuro'],tipoTecnica:'defensa',
    desc: 'Defensa de gran fuerza física que fue sometido al lavado de cerebro del Brain.',
    locked: true, cost:113
  },
  {
  id:'r154', equipo:'Brain', nombre:'Francis Tell', original:'Francis Tell',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:75,defensa:55,especial:76,
  hissatsu:['Cañonazo', 'Ataque de las sombras', 'Espejismo de balón'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Brain, especialista en analizar el juego rival.',
  locked:true,cost:158
},
{
  id:'r155', equipo:'Brain', nombre:'Samuel Buster', original:'Samuel Buster',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:72,pase:70,defensa:52,especial:75,
  hissatsu:['Tiro dinamita', 'Chut granada', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Brain con gran potencia de tiro.',
  locked:true,cost:158
},
{
  id:'r156', equipo:'Brain', nombre:'Jonathan Seller', original:'Jonathan Seller',
  posicion:'Delantero', tipo:'Viento',
  tiro:80,pase:65,defensa:38,especial:78,
  hissatsu:['Remate Misil', 'Tornado de Fuego', 'Regate múltiple'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Brain y uno de sus principales atacantes.',
  locked:true,cost:179
},
{
  id:'r157', equipo:'Brain', equiposExtra:['Neo Japón'], nombre:'Neil Turner', original:'Neil Turner',
  posicion:'Delantero', tipo:'Fuego',
  tiro:81,pase:70,defensa:42,especial:82,
  hissatsu:['Tornado de fuego', 'Remate Misil'],tipoTecnica:'tiro',
  desc:'Delantero estrella del Brain, conocido por su potente Tornado de fuego.',
  locked:true,cost:200
},
{
  id:'r158', equipo:'Shuriken', nombre:'Jim Hillfort', original:'Jim Hillfort', sprite:'https://inazumarun.es/assets/sprites/r158.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:67,defensa:78,especial:72,
  hissatsu:['Telaraña', 'Espejismo'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Shuriken, propenso a enfermar con facilidad.',
  locked:true,cost:137
},
{
  id:'r159', equipo:'Shuriken', nombre:'Phil Wingate', original:'Phil Wingate', sprite:'https://inazumarun.es/assets/sprites/r159.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:54,pase:64,defensa:70,especial:75,
  hissatsu:['Telaraña', 'Espejismo'],tipoTecnica:'defensa',
  desc:'Defensa del Shuriken que utiliza códigos para coordinar al equipo.',
  locked:true,cost:158
},
{
  id:'r160', equipo:'Shuriken', nombre:'Jupiter Jumper', original:'Jupiter Jumper', sprite:'https://inazumarun.es/assets/sprites/r160.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:63,pase:70,defensa:48,especial:73,
  hissatsu:['Giro de Mono', 'Bola de Fango'],tipoTecnica:'regate',
  desc:'Centrocampista del Shuriken, ágil y experto en desplazarse con rapidez.',
  locked:true,cost:147
},
{
  id:'r161', equipo:'Shuriken', nombre:'Sam Samurai', original:'Sam Samurai', sprite:'https://inazumarun.es/assets/sprites/r161.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:75,pase:57,defensa:40,especial:79,
  hissatsu:['Remate Múltiple', 'Robo veloz', 'Ataque de las sombras'],tipoTecnica:'tiro',
  desc:'Delantero del Shuriken y maestro de la espada.',
  locked:true,cost:179
},
{
  id:'r162', equipo:'Shuriken', nombre:'Hank Sullivan', original:'Hank Sullivan', sprite:'https://inazumarun.es/assets/sprites/r162.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:67,pase:76,defensa:52,especial:77,
  hissatsu:['Espejismo', 'Entrada huracán'],tipoTecnica:'regate',
  desc:'Centrocampista organizador del Shuriken, especializado en coordinar al equipo.',
  locked:true,cost:158
},
{
  id:'r163', equipo:'Shuriken', equiposExtra:['Neo Japón'], nombre:'Sail Bluesea', original:'Sail Bluesea', sprite:'https://inazumarun.es/assets/sprites/r163.webp',
  posicion:'Delantero', tipo:'Viento',
  tiro:81,pase:68,defensa:39,especial:84,
  hissatsu:['Bola de Fango', 'Espejismo'],tipoTecnica:'tiro',
  desc:'Capitán y delantero del Instituto Shuriken.',
  locked:true,cost:189
},
{
  id:'r164', equipo:'Farm', nombre:'Albert Green', original:'Albert Green', sprite:'https://inazumarun.es/assets/sprites/r164.webp',
  posicion:'Portero', tipo:'Fuego',
  tiro:35,pase:52,defensa:80,especial:84,
  hissatsu:['Despeje de leñador', 'Muralla infinita'],tipoTecnica:'portero',
  desc:'Capitán y portero del Instituto Farm, especialista en técnicas defensivas.',
  locked:true,cost:189
},
{
  id:'r165', equipo:'Farm', equiposExtra:['Neo Japón'], nombre:'Mark Hillvalley', original:'Mark Hillvalley', sprite:'https://inazumarun.es/assets/sprites/r165.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:72,defensa:84,especial:80,
  hissatsu:['Rueda infernal', 'Segadora', 'Gran seísmo'],tipoTecnica:'regate',
  desc:'Defensa del Instituto Farm, resistente y especializado en recuperar el balón.',
  locked:true,cost:158
},
{
  id:'r166', equipo:'Farm', nombre:'Herb Sherman', original:'Herb Sherman', sprite:'https://inazumarun.es/assets/sprites/r166.webp',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:69,defensa:79,especial:77,
  hissatsu:['Chut granada', 'Segadora'],tipoTecnica:'tiro',
  desc:'Defensa del Instituto Farm con un potente disparo como recurso ofensivo.',
  locked:true,cost:152
},
{
  id:'r167', equipo:'Farm', nombre:'Joe Small', original:'Joe Small', sprite:'https://inazumarun.es/assets/sprites/r167.webp',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:61,pase:70,defensa:57,especial:75,
  hissatsu:['Remolino cortante', 'Segadora', 'Corte Giratorio'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Farm, hábil y difícil de superar.',
  locked:true,cost:152
},
{
  id:'r168', equipo:'Farm', nombre:'Orville Newman', original:'Orville Newman', sprite:'https://inazumarun.es/assets/sprites/r168.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:68,defensa:51,especial:73,
  hissatsu:['Cabezazo Kung-fu', 'Tiro torre de Osaka'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Farm con buen control del balón.',
  locked:true,cost:147
},
{
  id:'r169', equipo:'Farm', nombre:'Daniel Dawson', original:'Daniel Dawson', sprite:'https://inazumarun.es/assets/sprites/r169.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:64,pase:72,defensa:53,especial:74,
  hissatsu:['Superbalón rodante', 'Regate Topo'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Farm, especialista en regates y jugadas rápidas.',
  locked:true,cost:152
},
{
  id:'r170', equipo:'Neo Japón', nombre:'Miles Ryan', original:'Miles Ryan', sprite:'https://inazumarun.es/assets/sprites/r170.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:64,pase:70,defensa:70,especial:71,
  hissatsu:['Ciclon', 'Entrada huracán', 'Ciclón doble'],tipoTecnica:'defensa',
  desc:'Amigo de Nathan, veloz como el viento',
  locked:true,cost:152
},

{
  id:'r171', equipo:'Neo Raimon', nombre:'Saggy', original:'Sagamineta', sprite:'https://inazumarun.es/assets/sprites/r171.webp',
  posicion:'Delantero', tipo:'Bosque',
  tiro:78,pase:77,defensa:60,especial:84,
  hissatsu:['Remate Misil', 'Disparo con Rebotes', 'Superaceleración'],tipoTecnica:'tiro',
  desc:'Delantero especial de Inazuma Eleven 2, conocido como Saggy.',
  locked:true,cost:168
},
{
  id:'r172', equipo:'Neo Raimon', nombre:'Syon Blaze', original:'Masato Goenji', sprite:'https://inazumarun.es/assets/sprites/r172.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:83,defensa:38,especial:84,
  hissatsu:['Tornado de Fuego', 'Trampolín relámpago', 'Tormenta de fuego'],tipoTecnica:'tiro',
  desc:'Extraordinario delantero y primo de Axel Blaze.',
  locked:true,cost:200
},
{
  id:'r173', equipo:'Neo Raimon', equiposExtra:['Inazuma Japon'], nombre:'Canon Evans', original:'Kanon Endou', sprite:'https://inazumarun.es/assets/sprites/r173.webp',
  posicion:'Delantero', tipo:'Viento',
  tiro:86,pase:81,defensa:40,especial:86,
  hissatsu:['Cañón Celestial', 'Cabezazo megatón'],tipoTecnica:'tiro',
  desc:'Delantero del futuro y descendiente de Mark Evans.',
  locked:true,cost:210
},
{
  id:'r174', equipo:'Neo Raimon', nombre:'Bay Froste', original:'Benkei Kumano', sprite:'https://inazumarun.es/assets/sprites/r174.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:65,pase:79,defensa:89,especial:86,
  hissatsu:['Hielo Futurista'],tipoTecnica:'tiro',
  desc:'Defensa del futuro y descendiente de Shawn.',
  locked:true,cost:210
},
{
  id:'r175', equipo:'Neo Raimon', nombre:'Mount Wallside', original:'Shiryu Shiratori', sprite:'https://inazumarun.es/assets/sprites/r175.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:84,pase:85,defensa:67,especial:83,
  hissatsu:['Remate del muro'],tipoTecnica:'tiro',
  desc:'Delantero del futuro y descendiente de Jack.',
  locked:true,cost:210
},
{
  id:'r176', equipo:'Neo Raimon', nombre:'Chester Horse Jr', original:'Chester Horse Jr', sprite:'https://inazumarun.es/assets/sprites/r176.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:67,pase:65,defensa:67,especial:81,
  hissatsu:['Remate Misil', 'Espejismo', 'Ataque de las sombras'],tipoTecnica:'tiro',
  desc:'Comentarista del Raimon.',
  locked:true,cost:105
},
{
  id:'r177', equipo:'Neo Raimon', nombre:'Rory Boomer', original:'Rory Boomer', sprite:'https://inazumarun.es/assets/sprites/r177.webp',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:71,defensa:67,especial:69,
  hissatsu:['Disparo con rebotes', 'Giro de Mono', 'Ataque de paladín'],tipoTecnica:'tiro',
  desc:'Tiene voz atronadora. Sus amigos se tapan los oídos cuando habla.',
  locked:true,cost:105
},
{
  id:'r178', equipo:'Raimon', equiposExtra:['Emperadores Oscuros'], nombre:'Sam Kincaid', original:'Shishido Sakichi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:60,defensa:52,especial:66,
  hissatsu:['Chut Granada', 'Confusión', 'Bola Falsa'],tipoTecnica:'tiro',
  desc:'Centrocampista del Raimon, creador de su propio Chut Granada en pleno partido.',
  locked:true,cost:137
},
{
  id:'r179', equipo:'Caos', equiposExtra:['Prominence'], nombre:'Grant Cook', original:'Ooiwa Kurando', sprite:'https://inazumarun.es/assets/sprites/r179.webp',
  posicion:'Portero', tipo:'Fuego',
  tiro:22,pase:52,defensa:83,especial:80,
  hissatsu:['Combustión', 'Cortafuegos', 'Despeje de Fuego'],tipoTecnica:'tiro',
  desc:'Portero del Prominence, del proyecto Aliea Academy, conocido como "Grent". Protege su portería con Burnout.',
  locked:true,cost:179
},
{
  id:'r180', equipo:'Caos', equiposExtra:['Prominence'], nombre:'Val Flamewood', original:'Hagakure Koutarou', sprite:'https://inazumarun.es/assets/sprites/r180.webp',
  posicion:'Defensa', tipo:'Fuego',
  tiro:40,pase:71,defensa:80,especial:78,
  hissatsu:['Gravitación', 'Cruz del sur', 'Remate Triple'],tipoTecnica:'defensa',
  desc:'Defensa del Prominence, conocido como "Bakurei". Su Gravitación es casi infranqueable.',
  locked:true,cost:173
},
{
  id:'r181', equipo:'Caos', equiposExtra:['Diamond Dust', 'Polvo de Diamante'], nombre:'Denzel Freezer', original:'Mikoori Rei', sprite:'https://inazumarun.es/assets/sprites/r181.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:82,pase:70,defensa:38,especial:88,
  hissatsu:['Bomba géiser', 'Astro Remate', 'Supernova'],tipoTecnica:'tiro',
  desc:'Delantero del Diamond Dust, conocido como "Frost". Su Supernova es una de las técnicas más temidas de Aliea Academy.',
  locked:true,cost:200
},
{
  id:'r182', equipo:'Caos', equiposExtra:['Diamond Dust', 'Polvo de Diamante'], nombre:'Ben North', original:'Shirai Ikkaku', sprite:'https://inazumarun.es/assets/sprites/r182.webp',
  posicion:'Portero', tipo:'Montaña',
  tiro:18,pase:48,defensa:83,especial:80,
  hissatsu:['Bloque de Hielo', 'Rompehielos', 'Barrera de cristal'],tipoTecnica:'portero',
  desc:'Portero del Diamond Dust, conocido como "Beluga". Nadie supera su Bloque de Hielo.',
  locked:true,cost:179
},
{
  id:'r183', equipo:'Caos', equiposExtra:['Alius Masters', 'Diamond Dust', 'Polvo de Diamante'], nombre:'Claire Lesnow', original:'Kurakake Clara', sprite:'https://inazumarun.es/assets/sprites/r183.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:36,pase:74,defensa:80,especial:76,
  hissatsu:['Rompehielos', 'Bomba géiser', 'Bloque de Hielo'],tipoTecnica:'defensa',
  desc:'Defensa del Diamond Dust, conocida como "Clear" y única chica del equipo. Protege su línea con Rompehielos.',
  locked:true,cost:168
},
{
  id:'r184', equipo:'Tormenta de Géminis', nombre:'Gordon Star', original:'Goryuu Reo', sprite:'https://inazumarun.es/assets/sprites/r184.webp',
  posicion:'Portero', tipo:'Bosque',
  tiro:22,pase:50,defensa:84,especial:78,
  hissatsu:['Agujero de Gusano', 'Destrozataladros', 'Agujero negro'],tipoTecnica:'portero',
  desc:'Portero del Gemini Storm, del proyecto Aliea Academy, conocido como "Gorleo". Su Agujero de Gusano se traga cualquier tiro.',
  locked:true,cost:176
},
{
  id:'r185', equipo:'Royal Academy', equiposExtra:['Neo Japón'], nombre:'Daniel Hatch', original:'Jimon Daiki', sprite:'https://inazumarun.es/assets/sprites/r185.webp',
  posicion:'Delantero', tipo:'Bosque',
  tiro:80,pase:68,defensa:36,especial:72,
  hissatsu:['Chut de los 100 toques', 'Barrido Defensivo', 'Remolino cortante'],tipoTecnica:'tiro',
  desc:'Delantero del Royal Academy, letal cerca del área con su Chut de los 100 toques.',
  locked:true,cost:158
},
{
  id:'r186', equipo:'Royal Academy', nombre:'Derek Swing', original:'Ena Kazuki', sprite:'https://inazumarun.es/assets/sprites/r186.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:75,defensa:58,especial:66,
  hissatsu:['Remate misil', 'Barrido Defensivo', 'Chut granada'],tipoTecnica:'tiro',
  desc:'Centrocampista del Royal Academy que sorprende al rival rematando desde su Remate misil.',
  locked:true,cost:147
},
{
  id:'r187', equipo:'Leones del desierto', nombre:'Bilal Kalil', original:'Bilal Kalil', sprite:'https://inazumarun.es/assets/sprites/r187.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:58,pase:75,defensa:86,especial:82,
  hissatsu:['Tormenta de Arena', 'Tiro espejismo'],tipoTecnica:'portero',
  desc:'Defensa de los Leones del Desierto y uno de los jugadores más destacados de Catar.',
  locked:true,cost:189
},
{
  id:'r188', equipo:'Big Waves', nombre:'Dolph Hensen', original:'Dolph Hensen', sprite:'https://inazumarun.es/assets/sprites/r188.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:78,defensa:59,especial:84,
  hissatsu:['Megalodon', 'Remate Tsunami'],tipoTecnica:'tiro',
  desc:'Centrocampista y capitán de los Big Waves, especialista en jugadas ofensivas.',
  locked:true,cost:189
},
{
  id:'r189', equipo:'Zoolan Team', nombre:'Phil A. Minion', original:'Phil A. Minion', sprite:'https://inazumarun.es/assets/sprites/r189.webp',
  posicion:'Defensa', tipo:'Fuego',
  tiro:62,pase:79,defensa:89,especial:87,
  hissatsu:['Piroquinesis', 'Coz 3', 'Corte Diabólico'],tipoTecnica:'regate',
  desc:'Defensa vinculado a Zoolan Rice y a sus equipos de jugadores seleccionados.',
  locked:true,cost:184
},
{
  id:'r190', equipo:'FFI Estrellas', nombre:'Julien Rousseau', original:'Julien Rousseau', sprite:'https://inazumarun.es/assets/sprites/r190.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:79,pase:79,defensa:70,especial:78,
  hissatsu:['Lecho de Rosas', 'Tri-Pegaso', 'Flash de fotones'],tipoTecnica:'tiro',
  desc:'Centrocampista francés de los Grifos de la Rosa.',
  locked:true,cost:168
},
{
  id:'r191', equipo:'Equipo Zero', nombre:'Blake Obscura', original:'Blake Obscura', sprite:'https://inazumarun.es/assets/sprites/r191.webp',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:75,defensa:80,especial:81,
  hissatsu:['Picadora', 'Corte Mágico', 'Mina terrestre'],tipoTecnica:'defensa',
  desc:'Defensa de Luz y Oscuridad y miembro del equipo Zero.',
  locked:true,cost:194
},
{
  id:'r192', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Wolfram Vulpeen', original:'Wolfram Vulpeen', sprite:'https://inazumarun.es/assets/sprites/r192.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:76,defensa:43,especial:90,
  hissatsu:['Aullido de Licántropo'],tipoTecnica:'tiro',
  desc:'Capitán de Aullido Lunar y segundo al mando de las Criaturas de la Noche. Miximax: Gen L.',
  locked:true,cost:221
},
{
  id:'r193', equipo:'Criaturas de la Noche', equiposExtra:['Nosfanáticos'], nombre:'Desmodus Drakul', original:'Desmodus Drakul', sprite:'https://inazumarun.es/assets/sprites/r193.webp',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:84,pase:82,defensa:69,especial:91,
  hissatsu:['Mordisco de Vampiro'],tipoTecnica:'tiro',
  desc:'Capitán de los Nosfanáticos y líder de las Criaturas de la Noche. Miximax: Gen V.',
  locked:true,cost:221
},
{
  id:'r194', equipo:'Ragnah', nombre:'Saru', original:'Simeon Ayp', sprite:'https://inazumarun.es/assets/sprites/r194.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:90,pase:88,defensa:45,especial:94,
  hissatsu:['Cañonazo de Fragmentos V2', 'Cañonazo de fragmentos'],tipoTecnica:'tiro',
  desc:'Saru en su versión Miximax con Gen S.',
  locked:true,cost:504
},
{
  id:'r195', equipo:'Desesperdidos', nombre:'Aster', original:'Aster', sprite:'https://inazumarun.es/assets/sprites/r195.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:87,pase:78,defensa:43,especial:88,
  hissatsu:['Tormenta Dimensional', 'Estrella de roca'],tipoTecnica:'tiro',
  desc:'Capitán de los Desesperdidos y compañero de Flora.',
  locked:true,cost:221
},
{
  id:'r196', equipo:'Desesperdidos', nombre:'Flora', original:'Flora', sprite:'https://inazumarun.es/assets/sprites/r196.webp',
  posicion:'Delantero', tipo:'Viento',
  tiro:88,pase:78,defensa:42,especial:91,
  hissatsu:['Tiro Supermasivo', 'Arrollador floral'],tipoTecnica:'tiro',
  desc:'Jugadora de los Desesperdidos. Puede realizar Miximax con Rosa Negra.',
  locked:true,cost:221
},
{
  id:'r197', equipo:'Desesperdidos', nombre:'Lotus', original:'Lotus', sprite:'https://inazumarun.es/assets/sprites/r197.webp',
  posicion:'Portero', tipo:'Montaña',
  tiro:35,pase:58,defensa:85,especial:85,
  hissatsu:['Agujero Blanco', 'Ciclón oscuro', 'Captura excelente'],tipoTecnica:'portero',
  desc:'Guardameta de los Desesperdidos y uno de los duplicados de Aster.',
  locked:true,cost:221
},
{
  id:'r198', equipo:'Nosfanáticos', equiposExtra:['Criaturas de la Noche'], nombre:'Holly Waters', original:'Holly Waters', sprite:'https://inazumarun.es/assets/sprites/r198.webp',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:63,defensa:81,especial:81,
  hissatsu:['Luz Cegadora', 'Salto explosivo'],tipoTecnica:'defensa',
  desc:'Defensa de los Nosfanáticos y de las Criaturas de la Noche.',
  locked:true,cost:200
},
{
  id:'r199', equipo:'Nosfanáticos', equiposExtra:['Criaturas de la Noche'], nombre:'Ron Innwater', original:'Ron Innwater', sprite:'https://inazumarun.es/assets/sprites/r199.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:65,defensa:81,especial:84,
  hissatsu:['Muralla de Atlantis', 'Rematerialización'],tipoTecnica:'defensa',
  desc:'Defensa de los Nosfanáticos y posteriormente de las Criaturas de la Noche.',
  locked:true,cost:194
},
{
  id:'r200', equipo:'Desesperdidos', nombre:'Magnol', original:'Magnol', sprite:'https://inazumarun.es/assets/sprites/r200.webp',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:67,defensa:81,especial:82,
  hissatsu:['Muralla de Atlantis', 'Fiesta floral', 'El Muro'],tipoTecnica:'defensa',
  desc:'Miembro de los Desesperdidos y uno de los duplicados de Aster.',
  locked:true,cost:189
},
{
  id:'r201', equipo:'Desesperdidos', nombre:'Gentian', original:'Gentian', sprite:'https://inazumarun.es/assets/sprites/r201.webp',
  posicion:'Delantero', tipo:'Bosque',
  tiro:83,pase:70,defensa:43,especial:85,
  hissatsu:['Polen Devastador', 'Arrollador floral', 'Fiesta floral'],tipoTecnica:'tiro',
  desc:'Delantero de los Desesperdidos, especializado en técnicas relacionadas con las plantas.',
  locked:true,cost:200
},
{
  id:'r202', equipo:'Desesperdidos', nombre:'Flora', original:'Flora', sprite:'https://inazumarun.es/assets/sprites/r202.webp',
  posicion:'Delantero', tipo:'Viento',
  tiro:91,pase:79,defensa:42,especial:91,
  hissatsu:['Tiro Supermasivo V2', 'Arrollador floral'],tipoTecnica:'tiro',
  desc:'Flora Miximax con Rosa Negra.',
  locked:true,cost:504
},
{
  id:'r203', equipo:'Gir', equiposExtra:['Ragnah'], nombre:'Mehr', original:'Mehr', sprite:'https://inazumarun.es/assets/sprites/r203.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:86,defensa:71,especial:83,
  hissatsu:['Danza del viento', 'Futuro Negativo'],tipoTecnica:'regate',
  desc:'Capitana del Gir y una de las líderes de los Chicos de la Segunda Fase. Posteriormente se une al Ragnah.',
  locked:true,cost:221
},
{
  id:'r204', equipo:'Gir', equiposExtra:['Ragnah'], nombre:'Ghiris', original:'Ghiris', sprite:'https://inazumarun.es/assets/sprites/r204.webp',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:82,pase:84,defensa:65,especial:83,
  hissatsu:['Futuro Negativo'],tipoTecnica:'tiro',
  desc:'Centrocampista del Gir y compañero de Mehr. Posteriormente se une al Ragnah.',
  locked:true,cost:215
},
{
  id:'r205', equipo:'Gir', nombre:'Chell', original:'Chell', sprite:'https://inazumarun.es/assets/sprites/r205.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:83,pase:70,defensa:60,especial:75,
  hissatsu:['Entrada huracán', 'Balón Iceberg'],tipoTecnica:'regate',
  desc:'Centrocampista destacado del Gir. Posee el Espíritu Guerrero Guerrero del Oeste, Baihu.',
  locked:true,cost:205
},
{
  id:'r206', equipo:'Gir', nombre:'Zetoh', original:'Zetoh', sprite:'https://inazumarun.es/assets/sprites/r206.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:83,pase:68,defensa:40,especial:74,
  hissatsu:['Llamarada atómica'],tipoTecnica:'tiro',
  desc:'Delantero del Gir, orgulloso y extremadamente trabajador. Posee el Espíritu Guerrero Gigante de Fuego, Surtur.',
  locked:true,cost:210
},
{
  id:'r207', equipo:'Ragnah', nombre:'Kyon Canis', original:'Kyon Canis', sprite:'https://inazumarun.es/assets/sprites/r207.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:85,pase:69,defensa:45,especial:75,
  hissatsu:['Lanza letal', 'Barrena voladora'],tipoTecnica:'tiro',
  desc:'Delantero del Ragnah con el Espíritu Guerrero Adalid leonino, Jmet.',
  locked:true,cost:205
},
{
  id:'r208', equipo:'Chrono Storm', equiposExtra:['Earth Eleven', 'El Dorado 03', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre:'Jean-Pierre Lapin', original:'Shinsuke Nishizono',
  sprite:'https://inazumarun.es/assets/sprites/r208.png',
  posicion:'Portero', tipo:'Montaña',
  tiro:62,pase:72,defensa:89,especial:91,
  hissatsu:['Romance de los Tres Reinos', 'Defensa propulsada', 'Parada en Plancha'],tipoTecnica:'portero',
  desc:'JP en su forma Miximax con Liu Bei. Portero del Chrono Storm.',
  locked:true,cost:693
},
{
  id:'r209', equipo:'Chrono Storm', equiposExtra:['El Dorado 03', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre:'Gabriel Garcia', original:'Kariya Masaki',
  sprite:'https://inazumarun.es/assets/sprites/r209.png',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:78,defensa:94,especial:91,
  hissatsu:['La Flamme', 'Corte Mágico', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Gabi en su forma Miximax con Juana de Arco. Defensa del Chrono Storm.',
  locked:true,cost:677
},
{
  id:'r210', equipo:'Chrono Storm', equiposExtra:['El Dorado 03', 'Caballeros de la Mesa Redonda'], nombre:'Sor', original:'Sor',
  sprite:'https://inazumarun.es/assets/sprites/r210.png',
  posicion:'Defensa', tipo:'Bosque',
  tiro:62,pase:87,defensa:91,especial:89,
  hissatsu:['Defensa de Quetzal', 'Carga de Elefantes'],tipoTecnica:'defensa',
  desc:'Sor en su forma Miximax con Papá Quetzalcoatlus. Defensa del Chrono Storm.',
  locked:true,cost:662
},
{
  id:'r211', equipo:'Chrono Storm', nombre:'Goldie Lemmon', original:'Nanobana Kinako',
  sprite:'https://inazumarun.es/assets/sprites/r211.png',
  posicion:'Defensa', tipo:'Fuego',
  tiro:78,pase:75,defensa:94,especial:93,
  hissatsu:['Ilusión deslumbrante', 'Grumo Pegapasta', 'Tornado de Fuego DT'],tipoTecnica:'defensa',
  desc:'Goldie en su forma Miximax con la Reina de los Dragones. Defensa del Chrono Storm.',
  locked:true,cost:693
},
{
  id:'r212', equipo:'Chrono Storm', equiposExtra:['El Dorado 02', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre:'Riccardo Di Rigo', original:'Shindou Takuto',
  sprite:'https://inazumarun.es/assets/sprites/r212.png',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:84,pase:96,defensa:81,especial:94,
  hissatsu:['Impulso efímero', 'Pentagrama', 'Himno de atenea'],tipoTecnica:'tiro',
  desc:'Riccardo en su forma Miximax con Nobunaga Oda. Director de juego del Chrono Storm.',
  locked:true,cost:709
},
{
  id:'r213', equipo:'Chrono Storm', equiposExtra:['El Dorado 01', 'Inazuma Japon GO'], nombre:'Victor Blade', original:'Tsurugi Kyousuke',
  sprite:'https://inazumarun.es/assets/sprites/r213.png',
  posicion:'Delantero', tipo:'Fuego',
  tiro:98,pase:72,defensa:42,especial:96,
  hissatsu:['Katana Fulminante', 'Proyectil letal', 'Aguijón Letal'],tipoTecnica:'tiro',
  desc:'Victor en su forma Miximax con Soji Okita. Delantero del Chrono Storm.',
  locked:true,cost:725
},
{
  id:'r214', equipo:'Chrono Storm', nombre:'Fei Rune', original:'Fei Rune',
  sprite:'https://inazumarun.es/assets/sprites/r214.png',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:92,pase:86,defensa:75,especial:94,
  hissatsu:['Chut prehistórico', 'Remate Rebotado', 'Proyectil de Ozono'],tipoTecnica:'tiro',
  desc:'Fei en su forma Miximax con Big. Jugador del Chrono Storm.',
  locked:true,cost:709
},
{
  id:'r215', equipo:'Chrono Storm', equiposExtra:['El Dorado 01', 'Inazuma Japon GO', 'Caballeros de la Mesa Redonda'], nombre:'Ryoma Nishiki', original:'Nishiki Ryoma',
  sprite:'https://inazumarun.es/assets/sprites/r215.png',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:89,pase:91,defensa:74,especial:93,
  hissatsu:['Corriente Negra', 'Chut ancestral', 'Dragón ascendente'],tipoTecnica:'regate',
  desc:'Roma en su forma Miximax con Ryoma Sakamoto. Centrocampista del Chrono Storm.',
  locked:true,cost:693
},
{
  id:'r216', equipo:'Chrono Storm', equiposExtra:['El Dorado 03', 'Inazuma Japon GO', 'Los arions', 'Caballeros de la Mesa Redonda'], nombre:'Arion Sherwind', original:'Matsukaze Tenma',
  sprite:'https://inazumarun.es/assets/sprites/r216.png',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:91,pase:94,defensa:80,especial:97,
  hissatsu:['Espada Real', 'Brisa deslizante', 'Tiro vendaval'],tipoTecnica:'regate',
  desc:'Arion en su forma Miximax con el Rey Arturo. Capitán del Chrono Storm.',
  locked:true,cost:725
},
{
  id:'r217', equipo:'Academia Universal', nombre:'Sol Daystar', original:'Kishibe Taiga',
  sprite:'https://inazumarun.es/assets/sprites/r217.png',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:96,pase:88,defensa:71,especial:95,
  hissatsu:['Tormenta Eléctrica', 'Triángulo ZZ', 'Guardia acrobática'],tipoTecnica:'tiro',
  desc:'Sol en su forma Miximax con Zhuge Liang. Forma del anime y de la versión Fuego.',
  locked:true,cost:709
},
{
  id:'r218', equipo:'Chrono Storm', equiposExtra:['Caballeros de la Mesa Redonda'], nombre:'Bailong', original:'Hakuryuu',
  sprite:'https://inazumarun.es/assets/sprites/r218.png',
  posicion:'Delantero', tipo:'Viento',
  tiro:99,pase:73,defensa:43,especial:97,
  hissatsu:['Tormenta Eléctrica', 'Ciclón blanco', 'Paso warp'],tipoTecnica:'tiro',
  desc:'Bailong en su forma Miximax con Zhuge Liang. Forma correspondiente a la versión Trueno.',
  locked:true,cost:740
},
{
  id:'r219', equipo:'Chrono Storm', nombre:'Zanark Avalonic', original:'Zanark Avalonic',
  sprite:'https://inazumarun.es/assets/sprites/r219.png',
  posicion:'Delantero', tipo:'Montaña',
  tiro:100,pase:86,defensa:47,especial:84,
  hissatsu:['Soy Todopoderoso', 'Golpe Cataclismo', 'Salto explosivo'],tipoTecnica:'tiro',
  desc:'Zanark en su forma Miximax con Huracán Zeta. Uno de los atacantes más poderosos del Chrono Storm.',
  locked:true,cost:756
},
{
  id:'r220', equipo:'Dragon Link', equiposExtra:['Resistencia Japon', 'Resistencia Japón GO', 'Sector Quinto'], nombre:'Quentin Cinquedea', original:'Senguuji Yamato', sprite:'https://inazumarun.es/assets/sprites/r220.webp',
  posicion:'Portero', tipo:'Fuego',
  tiro:42,pase:70,defensa:85,especial:84,
  hissatsu:['Rompetiros', 'Aguijones escarlata', 'Centro de Gravedad'],tipoTecnica:'portero',
  desc:'Capitán y guardameta de Dragon Link, uno de los jugadores más poderosos del Camino Imperial.',
  locked:true,cost:231
},
{
  id:'r221', equipo:'Dragon Link', equiposExtra:['Resistencia Japon', 'Resistencia Japón GO', 'Sector Quinto'], nombre:'Aimé Quintet', original:'Gomaki Tetsurou', sprite:'https://inazumarun.es/assets/sprites/r221.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:73,defensa:82,especial:82,
  hissatsu:['Salto Dimensional', 'Danza del viento', 'Proyectil de Ozono'],tipoTecnica:'defensa',
  desc:'Uno de los defensas principales de Dragon Link.',
  locked:true,cost:189
},
{
  id:'r222', equipo:'Dragon Link', nombre:'Erik Pentona', original:'Seijou Shougo', sprite:'https://inazumarun.es/assets/sprites/r222.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:81,pase:66,defensa:45,especial:79,
  hissatsu:['Remate Dragón', 'Aguijones escarlata', 'Esferas luminosas'],tipoTecnica:'tiro',
  desc:'Uno de los delanteros principales de Dragon Link.',
  locked:true,cost:200
},
{
  id:'r223', equipo:'Academia Universal', nombre:'Ringo Saturn', original:'Ringo Saturn', sprite:'https://inazumarun.es/assets/sprites/r223.webp',
  posicion:'Portero', tipo:'Montaña',
  tiro:31,pase:60,defensa:84,especial:84,
  hissatsu:['Estrella Reflectante', 'Parada fuerte', 'Manos liberadas'],tipoTecnica:'portero',
  desc:'Jugador destacado del Instituto Universal.',
  locked:true,cost:200
},
{
  id:'r224', equipo:'Instituto Espejismo', equiposExtra:['Resistencia Japon', 'Resistencia Japón GO'], nombre:'Harrold Houdini', original:'Harrold Houdini', sprite:'https://inazumarun.es/assets/sprites/r224.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:74,pase:85,defensa:70,especial:83,
  hissatsu:['Tiro Espectral'],tipoTecnica:'tiro',
  desc:'Habilidoso jugador del Instituto Espejismo, famoso por sus técnicas de engaño.',
  locked:true,cost:200
},
{
  id:'r225', equipo:'Instituto Espejismo', nombre:'Hocus Sesame', original:'Hocus Sesame', sprite:'https://inazumarun.es/assets/sprites/r225.webp',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:76,defensa:72,especial:80,
  hissatsu:['Espejismo', 'Truco balonazo', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Jugador del Instituto Espejismo.',
  locked:true,cost:158
},
{
  id:'r226', equipo:'Instituto Espejismo', nombre:'Pocus Sesame', original:'Pocus Sesame', sprite:'https://inazumarun.es/assets/sprites/r226.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:74,defensa:55,especial:79,
  hissatsu:['Espejismo', 'Truco balonazo', 'Pentagrama'],tipoTecnica:'regate',
  desc:'Jugador del Instituto Espejismo.',
  locked:true,cost:158
},
{
  id:'r227', equipo:'Resistencia Japon', equiposExtra:['Mar de Luna', 'Resistencia Japón GO'], nombre:'Doug McArthur', original:'Doug McArthur', sprite:'https://inazumarun.es/assets/sprites/r227.webp',
  posicion:'Delantero', tipo:'Viento',
  tiro:79,pase:79,defensa:59,especial:80,
  hissatsu:['Tiro Sónico', 'Mina terrestre'],tipoTecnica:'tiro',
  desc:'Delantero destacado del equipo que lucha contra el Imperio.',
  locked:true,cost:184
},
{
  id:'r228', equipo:'Mar de Luna', nombre:'Alessandro ilGrande', original:'Alessandro ilGrande', sprite:'https://inazumarun.es/assets/sprites/r228.webp',
  posicion:'Portero', tipo:'Montaña',
  tiro:28,pase:54,defensa:81,especial:81,
  hissatsu:['Barrera de Gaia'],tipoTecnica:'portero',
  desc:'Uno de los grandes porteros del Camino Imperial.',
  locked:true,cost:231
},
{
  id:'r229', equipo:'Monte Olimpo', equiposExtra:['Resistencia Japon', 'Resistencia Japón GO', 'Zeus'], nombre:'Cronus Fourseasons', original:'Cronus Fourseasons', sprite:'https://inazumarun.es/assets/sprites/r229.webp',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:84,pase:81,defensa:70,especial:80,
  hissatsu:['Tiro Balista'],tipoTecnica:'tiro',
  desc:'Jugador estrella del Monte Olimpo y uno de los más importantes del Camino Imperial.',
  locked:true,cost:221
},
{
  id:'r230', equipo:'Zeus', nombre:'Hyperion', original:'Hyperion', sprite:'https://inazumarun.es/assets/sprites/r230.webp',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:83,pase:72,defensa:68,especial:80,
  hissatsu:['Tiro Balista'],tipoTecnica:'tiro',
  desc:'Poderoso delantero asociado al Monte Olimpo.',
  locked:true,cost:210
},
{
  id:'r231', equipo:'Royal Academy GO', equiposExtra:['Sector Quinto'], nombre:'Dracon Yale', original:'Oji Ryuzaki', sprite:'https://inazumarun.es/assets/sprites/r231.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:66,pase:76,defensa:83,especial:85,
  hissatsu:['Gran Torbellino', 'Cruce explosivo', 'Pingüino emperador 7'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy GO y uno de los Imperiales más completos.',
  locked:true,cost:210
},
{
  id:'r232', equipo:'Royal Academy GO', equiposExtra:['Sector Quinto'], nombre:'Rex Remington', original:'Rex Remington', sprite:'https://inazumarun.es/assets/sprites/r232.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:81,pase:70,defensa:60,especial:80,
  hissatsu:['Pingüino emperador 7'],tipoTecnica:'tiro',
  desc:'Capitán de la Royal Academy GO.',
  locked:true,cost:215
},
{
  id:'r233', equipo:'Poderosa Fe', equiposExtra:['Sector Quinto'], nombre:'Infinity Beyond', original:'Infinity Beyond', sprite:'https://inazumarun.es/assets/sprites/r233.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:82,pase:70,defensa:40,especial:80,
  hissatsu:['Remate de Gaia', 'Bomba saltarina', 'Finta boomerang'],tipoTecnica:'tiro',
  desc:'Delantero destacado del Colegio Poderosa Fe.',
  locked:true,cost:205
},
{
  id:'r234', equipo:'Poderosa Fe', equiposExtra:['Sector Quinto'], nombre:'Maxim Millennium', original:'Maxim Millennium', sprite:'https://inazumarun.es/assets/sprites/r234.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:80,pase:74,defensa:52,especial:78,
  hissatsu:['Remate Misil', 'Bomba saltarina'],tipoTecnica:'tiro',
  desc:'Jugador destacado del Colegio Poderosa Fe.',
  locked:true,cost:200
},
{
  id:'r235', equipo:'Cala Pirata', equiposExtra:['Sector Quinto'], nombre:'Octavus Kraken', original:'Octavus Kraken', sprite:'https://inazumarun.es/assets/sprites/r235.webp',
  posicion:'Defensa', tipo:'Fuego',
  tiro:32,pase:67,defensa:81,especial:82,
  hissatsu:['Bloqueo Ballena', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de la Academia Cala Pirata.',
  locked:true,cost:189
},
{
  id:'r236', equipo:'Kirkwood GO', equiposExtra:['Resistencia Japon', 'Resistencia Japón GO', 'Kirkwood'], nombre:'Bay Laurel', original:'Bay Laurel', sprite:'https://inazumarun.es/assets/sprites/r236.webp',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:73,pase:82,defensa:80,especial:80,
  hissatsu:['Espejismo de balón', 'Triángulo ZZ', 'Cruce explosivo'],tipoTecnica:'regate',
  desc:'Uno de los hermanos Ash, jugador destacado del Kirkwood.',
  locked:true,cost:184
},
{
  id:'r237', equipo:'Kirkwood GO', equiposExtra:['Kirkwood'], nombre:'Langford Ash', original:'Langford Ash', sprite:'https://inazumarun.es/assets/sprites/r237.webp',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:74,pase:70,defensa:70,especial:78,
  hissatsu:['Tiro Balista', 'Cascabel'],tipoTecnica:'tiro',
  desc:'Hermano de Bay Laurel y jugador del Kirkwood.',
  locked:true,cost:173
},
{
  id:'r238', equipo:'Kirkwood GO', equiposExtra:['Kirkwood'], nombre:'Bradford Ash', original:'Bradford Ash', sprite:'https://inazumarun.es/assets/sprites/r238.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:80,pase:75,defensa:43,especial:72,
  hissatsu:['Tiro Balista', 'Triángulo ZZ', 'Salto incandescente'],tipoTecnica:'tiro',
  desc:'Hermano de Bay Laurel y Langford Ash.',
  locked:true,cost:194
},
{
  id:'r239', equipo:'Eclipse de Orión', nombre:'Jade Beor', original:'Yurika Beor', sprite:'https://inazumarun.es/assets/sprites/r239.webp',
  posicion:'Delantero', tipo:'Bosque',
  tiro:88,pase:82,defensa:42,especial:85,
  hissatsu:['Sombra de Orión', 'Campo Umbrío'],tipoTecnica:'tiro',
  desc:'Capitana de La Sombra de Orión y una de las armas más poderosas de la Fundación Orión.',
  locked:true,cost:225
},
{
  id:'r240', equipo:'Eclipse de Orión', nombre:'Betelgeuse', original:'Betelgeuse', sprite:'https://inazumarun.es/assets/sprites/r240.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:82,pase:70,defensa:40,especial:83,
  hissatsu:['Sombra de Orión', 'Cruce explosivo', 'Estrella fugaz'],tipoTecnica:'tiro',
  desc:'Uno de los principales delanteros de Eclipse de Orión, considerado inferior únicamente a Jade.',
  locked:true,cost:215
},
{
  id:'r241', equipo:'Eclipse de Orión', nombre:'Procyon', original:'Procyon', sprite:'https://inazumarun.es/assets/sprites/r241.webp',
  posicion:'Portero', tipo:'Bosque',
  tiro:51,pase:78,defensa:84,especial:84,
  hissatsu:['Escudo sombrío', 'Ciclón oscuro', 'Giroparada'],tipoTecnica:'portero',
  desc:'Uno de los miembros principales de Eclipse de Orión y Discípulo de Orión.',
  locked:true,cost:195
},
{
  id:'r242', equipo:'Alius Masters', nombre:'Xavier Schiller', original:'Kira Hiroto', sprite:'https://inazumarun.es/assets/sprites/r242.webp',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:78,defensa:40,especial:85,
  hissatsu:['Explosión', 'El detonador', 'Zigzag veloz'],tipoTecnica:'tiro',
  desc:'Delantero de Ares con un enorme talento goleador.',
  locked:true,cost:225
},
{
  id:'r243', equipo:'Zeus', nombre:'Perseo', original:'Percy Hurst', sprite:'https://inazumarun.es/assets/sprites/r243.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:82,pase:76,defensa:42,especial:81,
  hissatsu:['Tijera Celestial', 'Sierra celestial', 'Hora Celestial'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Zeus en la línea temporal de Ares.',
  locked:true,cost:175
},
{
  id:'r244', equipo:'Emperadores Oscuros', nombre:'Scotty Osc.', original:'Kogure Yuya', posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:78,defensa:86,especial:88,
  hissatsu:['Campo Torbellino V2', 'Campo Torbellino', 'Sorpresa'],tipoTecnica:'defensa',
  desc:'Defensa del Raimon, famoso por su velocidad, agilidad y su peculiar sentido del humor.',
  locked:true,cost:560,
  sprite:'https://inazumarun.es/assets/sprites/r244.webp'
},
{
  id:'r245', equipo:'Emperadores Oscuros', nombre:'Dvalin Osc.', original:'Dvalin', posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:80,defensa:53,especial:85,
  hissatsu:['Lanza de Odín V2', 'Agujero de gusano', 'Destrozataladros'],tipoTecnica:'tiro',
  desc:'Versión oscura de Dvalin, uno de los jugadores más poderosos del Épsilon.',
  locked:true,cost:630,
  sprite:'https://inazumarun.es/assets/sprites/r245.webp'
},
{
  id:'r246', equipo:'Emperadores Oscuros', nombre:'Zell Osc.', original:'Zell', posicion:'Portero', tipo:'Fuego',
  tiro:55,pase:56,defensa:84,especial:86,
  hissatsu:['Agujero de Gusano V2', 'Rayo de Ganímedes', 'Remate de Gaia'],tipoTecnica:'portero',
  desc:'Versión oscura de Zell, poderoso delantero del Épsilon.',
  locked:true,cost:630,
  sprite:'https://inazumarun.es/assets/sprites/r246.webp'
},
{
  id:'r247', equipo:'Emperadores Oscuros', nombre:'Thomas Feldt Osc.', original:'Sugimori Takeshi',
  posicion:'Portero', tipo:'Bosque',
  tiro:32,pase:55,defensa:84,especial:88,
  hissatsu:['Despeje cohete', 'Campo de fuerza defensivo', 'Puños voladores'],tipoTecnica:'portero',
  desc:'Guardameta de los Emperadores Oscuros y antiguo jugador del Instituto Brain.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r247.png'
},
{
  id:'r248', equipo:'Emperadores Oscuros', nombre:'Malcolm Night Osc.', original:'Nishigaki Mamoru',
  posicion:'Defensa', tipo:'Fuego',
  tiro:40,pase:78,defensa:85,especial:77,
  hissatsu:['Corte Giratorio', 'Superaceleración', 'Tri-Pegaso'],tipoTecnica:'defensa',
  desc:'Defensa de los Emperadores Oscuros y antiguo jugador de Kirkwood.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r248.png'
},
{
  id:'r249', equipo:'Emperadores Oscuros', nombre:'Shadow Osc.', original:'Yamino Kageto',
  posicion:'Delantero', tipo:'Bosque',
  tiro:87,pase:80,defensa:40,especial:88,
  hissatsu:['Tornado Oscuro', 'Ataque de las sombras', 'Aullido de lobo'],tipoTecnica:'tiro',
  desc:'Poderoso delantero de los Emperadores Oscuros, nacido de la oscuridad.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r249.png'
},
{
  id:'r250', equipo:'Emperadores Oscuros', nombre:'Jim Wraith Osc.', original:'Kageno Jin',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:77,defensa:84,especial:76,
  hissatsu:['Trama trama', 'Golpe doble', 'Ataque de las sombras'],tipoTecnica:'defensa',
  desc:'Defensa de los Emperadores Oscuros y antiguo jugador del Raimon.',
  locked:true,cost:330,
  sprite:'https://inazumarun.es/assets/sprites/r250.png'
},
{
  id:'r251', equipo:'Emperadores Oscuros', nombre:'Tod Ironside Osc.', original:'Kurimatsu Teppei',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:78,defensa:84,especial:80,
  hissatsu:['Estrella fugaz', 'Tiro del cometa', 'Giro de Mono'],tipoTecnica:'defensa',
  desc:'Defensa del Raimon convertido en miembro de los Emperadores Oscuros.',
  locked:true,cost:320,
  sprite:'https://inazumarun.es/assets/sprites/r251.png'
},
{
  id:'r252', equipo:'Emperadores Oscuros', nombre:'Steve Grim Osc.', original:'Handa Shinichi',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:80,pase:80,defensa:75,especial:71,
  hissatsu:['Remate en V', 'Zig Zag Explosivo', 'Disparo Rodante'],tipoTecnica:'tiro',
  desc:'Centrocampista equilibrado del Raimon que forma parte de los Emperadores Oscuros.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r252.png'
},
{
  id:'r253', equipo:'Emperadores Oscuros', nombre:'Tim Saunders Osc.', original:'Shourinji Ayumu',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:75,defensa:84,especial:85,
  hissatsu:['Estrella fugaz', 'Combate kung fu', 'Campo Torbellino'],tipoTecnica:'defensa',
  desc:'Centrocampista del Raimon convertido en miembro de los Emperadores Oscuros.',
  locked:true,cost:290,
  sprite:'https://inazumarun.es/assets/sprites/r253.png'
},
{
  id:'r254', equipo:'Emperadores Oscuros', nombre:'Sam Kincaid Osc.', original:'Shishidou Sakichi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:79,defensa:87,especial:85,
  hissatsu:['Estrella Fugaz', 'Confusión', 'Chut granada'],tipoTecnica:'defensa',
  desc:'Jugador del Raimon que forma parte de los Emperadores Oscuros.',
  locked:true,cost:290,
  sprite:'https://inazumarun.es/assets/sprites/r254.png'
},
{
  id:'r255', equipo:'Emperadores Oscuros', nombre:'Maxwell Carson Osc.', original:'Matsuno Kuusuke',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:84,defensa:76,especial:85,
  hissatsu:['Remate en V', 'Entrada Tormenta', 'Disparo sagrado'],tipoTecnica:'tiro',
  desc:'Centrocampista ofensivo de los Emperadores Oscuros, famoso por su velocidad.',
  locked:true,cost:310,
  sprite:'https://inazumarun.es/assets/sprites/r255.png'
},
{
  id:'r256', equipo:'Emperadores Oscuros', nombre:'Nathan Swift Osc.', original:'Kazemaru Ichirouta',
  posicion:'Delantero', tipo:'Viento',
  tiro:85,pase:86,defensa:51,especial:88,
  hissatsu:['Fénix Oscuro', 'Regate múltiple', 'Defensa múltiple'],tipoTecnica:'tiro',
  desc:'Capitán de los Emperadores Oscuros, dotado de una velocidad extraordinaria.',
  locked:true,cost:410,
  sprite:'https://inazumarun.es/assets/sprites/r256.png'
},
{
  id:'r257', equipo:'Emperadores Oscuros', nombre:'Kevin Dragonfly Osc.', original:'Someoka Ryuugo',
  posicion:'Delantero', tipo:'Bosque',
  tiro:88,pase:80,defensa:45,especial:85,
  hissatsu:['Remate Guiverno', 'Remate Dragón', 'Tornado dragón'],tipoTecnica:'tiro',
  desc:'Potente delantero de los Emperadores Oscuros y antiguo miembro del Raimon.',
  locked:true,cost:410,
  sprite:'https://inazumarun.es/assets/sprites/r257.png'
},
{
  id:'r258', equipo:'Los Cuatro Magníficos', nombre:'George Winters', original:'Fuyuki Genbu', posicion:'Delantero', tipo:'Bosque',
  tiro:85,pase:72,defensa:42,especial:88,
  hissatsu:['Fénix oscuro', 'Chut de los 100 toques', 'Regate múltiple'],tipoTecnica:'tiro',
  desc:'Uno de los Cuatro Magníficos. Delantero de elemento Bosque conocido por su gran potencia ofensiva.',
  locked:true,cost:420,
  sprite:'https://inazumarun.es/assets/sprites/r258.webp'
},

{
  id:'r259', equipo:'Los Cuatro Magníficos', nombre:'Alan Sumner', original:'Ryuu Suzuno', posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:76,defensa:83,especial:86,
  hissatsu:['Cinto astral', 'Gravitación', 'Carrera a tres piernas'],tipoTecnica:'defensa',
  desc:'Uno de los Cuatro Magníficos. Defensa de enorme solidez que destaca por su capacidad para frenar los ataques rivales.',
  locked:true,cost:410,
  sprite:'https://inazumarun.es/assets/sprites/r259.webp'
},

{
  id:'r260', equipo:'Los Cuatro Magníficos', nombre:'Verne Spring', original:'Shuu Seiryuu',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:82,pase:89,defensa:67,especial:88,
  hissatsu:['Cañón dragón', 'Chut granada', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Uno de los Cuatro Magníficos. Centrocampista de elemento Fuego con gran talento para organizar el juego y lanzar potentes tiros.',
  locked:true,cost:420,
  sprite:'https://inazumarun.es/assets/sprites/r260.jpg'
},

{
  id:'r261', equipo:'Los Cuatro Magníficos', nombre:'Ted Autumn', original:'Akihito Byakko', posicion:'Portero', tipo:'Viento',
  tiro:38,pase:61,defensa:85,especial:83,
  hissatsu:['Manos infinitas', 'Red procyon'],tipoTecnica:'portero',
  desc:'Uno de los Cuatro Magníficos. Portero de gran nivel famoso por sus extraordinarias técnicas de parada.',
  locked:true,cost:430,
  sprite:'https://inazumarun.es/assets/sprites/r261.webp'
},

{
  id:'r262', equipo:'Los Cuatro Magníficos', nombre:'Bernadette Stoker', original:'Karen Toga',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:75,defensa:44,especial:89,
  hissatsu:['Remate Pegaso', 'Chut granada', 'Tacón infernal'],tipoTecnica:'tiro',
  desc:'Capitana de Los Cuatro Magníficos y una de las delanteras más peligrosas del equipo.',
  locked:true,cost:430,
  sprite:'https://inazumarun.es/assets/sprites/r262.png'
},
{
  id:'r263', equipo:'Tarjeteros', nombre:'Clay Ellement', original:'Clay Ellement', posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:70,defensa:62,especial:66,
  hissatsu:['Escáner Defensa', 'Confusión', 'Jaula de piedra'],tipoTecnica:'defensa',
  desc:'Centrocampista de Tarjeteros, tranquilo y con un estilo de juego inteligente.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r263.webp'
},
{
  id:'r264', equipo:'Tarjeteros', nombre:'Gail Ellement', original:'Gail Ellement', posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:66,defensa:70,especial:70,
  hissatsu:['Escaner Defensa', 'Campo Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de Tarjeteros muy rápido y difícil de alcanzar.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r264.webp'
},
{
  id:'r265', equipo:'Tarjeteros', nombre:'Bernie Ellement', original:'Bernie Ellement', posicion:'Delantero', tipo:'Fuego',
  tiro:74,pase:68,defensa:40,especial:69,
  hissatsu:['Cañón Dragón', 'Flash de fotones', 'Tornado de Fuego'],tipoTecnica:'tiro',
  desc:'Delantero de Tarjeteros apasionado y especializado en el juego ofensivo.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r265.webp'
},
{
  id:'r266', equipo:'Tarjeteros', nombre:'Chucky Cardaway', original:'Chucky Cardaway', posicion:'Delantero', tipo:'Fuego',
  tiro:72,pase:70,defensa:43,especial:65,
  hissatsu:['Carta-Ataque', 'Pared solitaria', 'Bateo total'],tipoTecnica:'regate',
  desc:'Delantero de Tarjeteros de aspecto intimidante que busca a su hermano gemelo.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r266.webp'
},
{
  id:'r267', equipo:'Tarjeteros', nombre:'Woody Ellement', original:'Woody Ellement', posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:69,defensa:67,especial:68,
  hissatsu:['Descodificación', 'Espejismo de balón', 'Defensa múltiple'],tipoTecnica:'regate',
  desc:'Defensa de Tarjeteros rodeado de un aura enigmática y experto en tácticas ilusorias.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r267.webp'
},
{
  id:'r268', equipo:'Tarjeteros', nombre:'Lucien Rarey', original:'Lucien Rarey', posicion:'Centrocampista', tipo:'Viento',
  tiro:61,pase:64,defensa:65,especial:70,
  hissatsu:['Tiro Cegador', 'Bomba géiser', 'Ventisca eterna'],tipoTecnica:'tiro',
  desc:'Centrocampista de Tarjeteros con una presencia llamativa y brillante.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r268.webp'
},
{
  id:'r269', equipo:'Tarjeteros', nombre:'Stackem Skyhigh', original:'Stackem Skyhigh', posicion:'Delantero', tipo:'Fuego',
  tiro:70,pase:65,defensa:42,especial:68,
  hissatsu:['Tornado de Fuego', 'Carrera relámpago', 'Remate combinado'],tipoTecnica:'tiro',
  desc:'Delantero de Tarjeteros de gran presencia y apasionado por el fútbol.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r269.webp'
},
{
  id:'r270', equipo:'Tarjeteros', nombre:'Deck', original:'Deck', posicion:'Portero', tipo:'Viento',
  tiro:43,pase:56,defensa:72,especial:64,
  hissatsu:['Mandril', 'Lluvia de azufre', 'Choque directo'],tipoTecnica:'portero',
  desc:'Portero de Tarjeteros en Inazuma Eleven 3.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r270.webp'
},
{
  id:'r271', equipo:'Tarjeteros', nombre:'Cardson', original:'Cardson', posicion:'Defensa', tipo:'Fuego',
  tiro:55,pase:64,defensa:71,especial:67,
  hissatsu:['Pisotón de sumo'],tipoTecnica:'defensa',
  desc:'Defensa de Tarjeteros en Inazuma Eleven 3.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r271.webp'
},
{
  id:'r272', equipo:'Tarjeteros', nombre:'Binder', original:'Binder', posicion:'Centrocampista', tipo:'Fuego',
  tiro:66,pase:69,defensa:69,especial:65,
  hissatsu:['Ataque cortante'],tipoTecnica:'defensa',
  desc:'Centrocampista de Tarjeteros en Inazuma Eleven 3.',
  locked:false,
  sprite:'https://inazumarun.es/assets/sprites/r272.webp'
},
{
  id:'r273', equipo:'Neo Raimon', nombre:'Nev Erin', original:'Arashi Rokko', posicion:'Delantero', tipo:'Viento',
  tiro:78,pase:62,defensa:38,especial:70,
  hissatsu:['Tornado Oscuro', 'Tiro Giratorio', 'Entrada Tormenta'],tipoTecnica:'tiro',
  desc:'Un delantero veloz que juega con gran energía incluso en los días más fríos.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r273.webp'
},
{
  id:'r274', equipo:'Neo Raimon', nombre:'Christian Dear', original:'Shintaro Takasugi', posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:58,defensa:67,especial:55,
  hissatsu:['Corte Giratorio', 'Regate espejismo', 'Segadora'],tipoTecnica:'defensa',
  desc:'Un defensa de Raimon al que le encantan las novedades.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r274.webp'
},
{
  id:'r275', equipo:'Neo Raimon', nombre:'Beau Fort', original:'Sho Kazakiri', posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:65,defensa:69,especial:58,
  hissatsu:['Ciclón', 'Rompehielos', 'Entrada Tormenta'],tipoTecnica:'defensa',
  desc:'Un defensa aficionado al ciclismo que se deja llevar por el viento.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r275.webp'
},
{
  id:'r276', equipo:'Neo Raimon', nombre:'Alfie Fine', original:'Genki Mouri', posicion:'Portero', tipo:'Bosque',
  tiro:25,pase:42,defensa:68,especial:69,
  hissatsu:['Campo de Fuerza', 'Espiral de distorsión', 'Ultra lunar'],tipoTecnica:'portero',
  desc:'Un portero que destaca por sus técnicas defensivas.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r276.webp'
},
{
  id:'r277', equipo:'Neo Raimon', nombre:'Billy Blanc', original:'Shiroshi Billy', posicion:'Centrocampista', tipo:'Viento',
  tiro:51,pase:65,defensa:43,especial:57,
  hissatsu:['Superaceleración', 'Bomba géiser', 'La bestia trueno'],tipoTecnica:'regate',
  desc:'Un jugador ligero que destaca por su movilidad.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r277.webp'
},
{
  id:'r278', equipo:'Neo Raimon', nombre:'Slim Lanky', original:'Ko Hosoi', posicion:'Portero', tipo:'Viento',
  tiro:22,pase:45,defensa:52,especial:66,
  hissatsu:['Despeje explosivo', 'Parada fuerte', 'Paisaje Helado'],tipoTecnica:'portero',
  desc:'Un portero extremadamente alto y delgado.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r278.webp'
},
{
  id:'r279', equipo:'Neo Raimon', nombre:'Fane Club', original:'Club', posicion:'Portero', tipo:'Viento',
  tiro:20,pase:43,defensa:60,especial:63,
  hissatsu:['Despeje a Presión', 'Bloque de Hielo', 'Golpe de vacío'],tipoTecnica:'portero',
  desc:'Un aspirante a estrella del fútbol que idolatra a los grandes jugadores.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r279.webp'
},
{
  id:'r280', equipo:'Neo Raimon', nombre:'Dan Dandy', original:'Dando Dan', posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:55,defensa:64,especial:61,
  hissatsu:['Ataque cortante', 'Paisaje Helado'],tipoTecnica:'defensa',
  desc:'Un atleta especializado en salto de altura capaz de elevarse como un cohete.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r280.webp'
},
{
  id:'r281', equipo:'Neo Raimon', nombre:'Don Keys', original:'Keys', posicion:'Delantero', tipo:'Fuego',
  tiro:69,pase:58,defensa:32,especial:58,
  hissatsu:['Tiro Giratorio', 'Chut granada', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Un delantero de gran potencia ofensiva.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r281.webp'
},
{
  id:'r282', equipo:'Neo Raimon', nombre:'Marv Errick', original:'Errick', posicion:'Centrocampista', tipo:'Bosque',
  tiro:48,pase:63,defensa:45,especial:54,
  hissatsu:['Pase Cruzado', 'Pared solitaria', 'Mano Celestial X'],tipoTecnica:'tiro',
  desc:'Un jugador equilibrado que ayuda a conectar el centro del campo.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r282.webp'
},
{
  id:'r283', equipo:'Neo Raimon', nombre:'Tony Hacker', original:'Hacker', posicion:'Centrocampista', tipo:'Viento',
  tiro:50,pase:66,defensa:42,especial:59,
  hissatsu:['Regate Aurora', 'Brisa deslizante', 'Regate Topo'],tipoTecnica:'regate',
  desc:'Un centrocampista hábil capaz de encontrar espacios entre los rivales.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r283.webp'
},
{
  id:'r284', equipo:'Neo Raimon', nombre:'Iggy Loyaller', original:'Loyaller', posicion:'Delantero', tipo:'Bosque',
  tiro:67,pase:50,defensa:35,especial:55,
  hissatsu:['Tiro giratorio', 'Tiro Fantasma', 'Segadora'],tipoTecnica:'tiro',
  desc:'Un delantero fiel a su equipo y siempre dispuesto a luchar.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r284.webp'
},
{
  id:'r285', equipo:'Neo Raimon', nombre:'Alan Mode', original:'Mode', posicion:'Centrocampista', tipo:'Viento',
  tiro:46,pase:64,defensa:44,especial:56,
  hissatsu:['Regate espejismo', 'Regate Aurora', 'Ciclón'],tipoTecnica:'regate',
  desc:'Un jugador técnico que busca superar a sus rivales con habilidad.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r285.webp'
},
{
  id:'r286', equipo:'Neo Raimon', nombre:'Bill Moony', original:'Moony', posicion:'Delantero', tipo:'Viento',
  tiro:64,pase:53,defensa:34,especial:60,
  hissatsu:['Superaceleración', 'A todo vapor', 'Rematerialización'],tipoTecnica:'regate',
  desc:'Un delantero rápido que aprovecha su velocidad para atacar.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r286.webp'
},
{
  id:'r287', equipo:'Neo Raimon', nombre:"Vinny O'Gaines", original:"O'Gaines",
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:52,pase:61,defensa:47,especial:53,
  hissatsu:['Pase Cruzado', 'Espejismo', 'Superbalón rodante'],tipoTecnica:'tiro',
  desc:'Un centrocampista trabajador y equilibrado.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r287.webp'
},
{
  id:'r288', equipo:'Neo Raimon', nombre:'Joe Rassock', original:'Rassock', posicion:'Defensa', tipo:'Montaña',
  tiro:38,pase:51,defensa:67,especial:52,
  hissatsu:['Barrido Defensivo', 'Parada fuerte', 'Ataque de Cóndor'],tipoTecnica:'defensa',
  desc:'Un defensa físico especializado en recuperar balones.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r288.webp'
},
{
  id:'r289', equipo:'Neo Raimon', nombre:'Weathervane', original:'Gustav Weathervane',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:68,defensa:70,especial:70,
  hissatsu:['Ataque cortante', 'Entrada huracán', 'Ciclón doble'],tipoTecnica:'defensa',
  desc:'Un defensa fuerte que utiliza su físico para detener los ataques.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r289.webp'
},
{
  id:'r290', equipo:'Neo Raimon', nombre:'Roger Rocket', original:'Rocket',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:55,defensa:65,especial:59,
  hissatsu:['Corte Giratorio', 'Entrada huracán', 'Torre Inexpugnable'],tipoTecnica:'defensa',
  desc:'Un defensa rápido que puede incorporarse con velocidad.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r290.webp'
},
{
  id:'r291', equipo:'Neo Raimon', nombre:'Phil Rosey', original:'Rosey',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:49,pase:62,defensa:43,especial:55,
  hissatsu:['Pase Cruzado', 'Chut granada', 'Coz 3'],tipoTecnica:'tiro',
  desc:'Un centrocampista que mantiene el juego en movimiento.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r291.webp'
},
{
  id:'r292', equipo:'Neo Raimon', nombre:'Ringo Stagg', original:'Stagg', posicion:'Delantero', tipo:'Montaña',
  tiro:68,pase:47,defensa:36,especial:56,
  hissatsu:['Tiro giratorio', 'Corte Giratorio', 'Entrada Tormenta'],tipoTecnica:'tiro',
  desc:'Un delantero potente que busca finalizar las jugadas.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r292.webp'
},
{
  id:'r293', equipo:'Neo Raimon', nombre:'Joe Straiter', original:'Straiter',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:54,defensa:64,especial:51,
  hissatsu:['Corte Giratorio', 'Carrera relámpago', 'Lanzallamas'],tipoTecnica:'defensa',
  desc:'Un defensa disciplinado que mantiene su posición.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r293.webp'
},
{
  id:'r294', equipo:'Neo Raimon', nombre:'Barry Straw', original:'Straw',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:47,pase:60,defensa:42,especial:53,
  hissatsu:['Superaceleración', 'Tiro Giratorio', 'Hora Celestial'],tipoTecnica:'regate',
  desc:'Un jugador ágil que ayuda a mover el balón rápidamente.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r294.webp'
},
{
  id:'r295', equipo:'Neo Raimon', nombre:'Ifan Tassy', original:'Tassy',
  posicion:'Delantero', tipo:'Bosque',
  tiro:63,pase:52,defensa:34,especial:57,
  hissatsu:['Regate Aurora', 'Confusión', 'Muro de Hierro'],tipoTecnica:'regate',
  desc:'Un delantero técnico con recursos para superar defensas.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r295.webp'
},
{
  id:'r296', equipo:'Neo Raimon', nombre:'Bill Teller', original:'Teller', posicion:'Defensa', tipo:'Bosque',
  tiro:39,pase:56,defensa:66,especial:54,
  hissatsu:['Barrido Defensivo', 'Disparo Rodante', 'Telaraña'],tipoTecnica:'defensa',
  desc:'Un defensa de estilo sólido y trabajador.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r296.webp'
},
{
  id:'r297', equipo:'Neo Raimon', nombre:'Tim Toppel', original:'Toppel', posicion:'Portero', tipo:'Bosque',
  tiro:23,pase:45,defensa:50,especial:64,
  hissatsu:['Ultratécnica', 'Agujero de gusano', 'Ataque de las sombras'],tipoTecnica:'tiro',
  desc:'Un portero pequeño pero capaz de sorprender a jugadores más grandes.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r297.webp'
},
{
  id:'r298', equipo:'Neo Raimon', nombre:'Stan Trum', original:'Trum',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:50,pase:62,defensa:44,especial:54,
  hissatsu:['Regate espejismo', 'Chut granada', 'Coz 3'],tipoTecnica:'regate',
  desc:'Un centrocampista equilibrado con buen control del balón.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r298.webp'
},
{
  id:'r299', equipo:'Neo Raimon', nombre:'Doug Walker', original:'Walker',
  posicion:'Portero', tipo:'Montaña',
  tiro:21,pase:42,defensa:54,especial:67,
  hissatsu:['Despeje explosivo', 'Giro de Mono', 'Guardia del Coliseo'],tipoTecnica:'portero',
  desc:'Un portero robusto que utiliza su fuerza para detener disparos.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r299.webp'
},
{
  id:'r300', equipo:'Neo Raimon', nombre:'Rob Anchor', original:'Anchor',
  posicion:'Defensa', tipo:'Montaña',
  tiro:38,pase:49,defensa:69,especial:55,
  hissatsu:['Bloqueo', 'Torbellino dragón', 'Campo Torbellino'],tipoTecnica:'defensa',
  desc:'Un defensa sólido que actúa como un ancla para su equipo.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r300.webp'
},
{
  id:'r301', equipo:'Neo Raimon', nombre:'Lou Beigh', original:'Beigh', posicion:'Centrocampista', tipo:'Viento',
  tiro:46,pase:61,defensa:45,especial:57,
  hissatsu:['Ciclón', 'Espiral de distorsión', 'Ataque de las sombras'],tipoTecnica:'defensa',
  desc:'Un jugador técnico que se mueve con agilidad.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r301.webp'
},
{
  id:'r302', equipo:'Neo Raimon', nombre:'Eggbert Heading', original:'Heading',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:48,defensa:67,especial:52,
  hissatsu:['Cabeza Defensiva', 'Regate espejismo', 'Tornado oscuro'],tipoTecnica:'defensa',
  desc:'Un defensa fuerte en el juego aéreo.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r302.webp'
},
{
  id:'r303', equipo:'Neo Raimon', nombre:'Ace Irvin', original:'Irvin', posicion:'Delantero', tipo:'Viento',
  tiro:70,pase:52,defensa:34,especial:62,
  hissatsu:['Tornado Oscuro', 'Baile de Llamas', 'Tacón infernal'],tipoTecnica:'tiro',
  desc:'Un delantero veloz que busca abrir huecos en la defensa.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r303.webp'
},
{
  id:'r304', equipo:'Neo Raimon', nombre:'Hal Mullet', original:'Mullet',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:48,pase:60,defensa:46,especial:53,
  hissatsu:['Pase Cruzado', 'Flecha huracán'],tipoTecnica:'tiro',
  desc:'Un centrocampista versátil que ayuda tanto en ataque como en defensa.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r304.webp'
},
{
  id:'r305', equipo:'Neo Raimon', nombre:'Bobby Peel', original:'Peel', posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:53,defensa:63,especial:55,
  hissatsu:['Robo veloz', 'Giro de Mono', 'Dientes de roca'],tipoTecnica:'defensa',
  desc:'Un defensa ágil especializado en robar el balón.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r305.webp'
},
{
  id:'r306', equipo:'Neo Raimon', nombre:'Spike Pitt', original:'Pitt', posicion:'Delantero', tipo:'Fuego',
  tiro:67,pase:48,defensa:35,especial:57,
  hissatsu:['Carga Explosiva', 'Remate Tarzán', 'Regate Topo'],tipoTecnica:'tiro',
  desc:'Un delantero agresivo que apuesta por la potencia.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r306.webp'
},
{
  id:'r307', equipo:'Neo Raimon', nombre:'Dex Territy', original:'Territy', posicion:'Defensa', tipo:'Montaña',
  tiro:40,pase:50,defensa:68,especial:54,
  hissatsu:['Barrido Defensivo', 'Gravitación', 'Guardia del Coliseo'],tipoTecnica:'defensa',
  desc:'Un defensa resistente que dificulta el avance rival.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r307.webp'
},
{
  id:'r308', equipo:'Neo Raimon', nombre:'Buster Chopps', original:'Chopps', posicion:'Delantero', tipo:'Montaña',
  tiro:71,pase:45,defensa:37,especial:58,
  hissatsu:['Remate Poderoso', 'Despeje de fuego', 'Balón galgo'],tipoTecnica:'tiro',
  desc:'Un delantero que confía en su potencia física para disparar.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r308.webp'
},
{
  id:'r309', equipo:'Neo Raimon', nombre:'Graham Awn', original:'Graham Awn',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:75,defensa:65,especial:80,
  hissatsu:['Corte Giratorio', 'Ritmo agresivo', 'Cabezazo cohete'],tipoTecnica:'defensa',
  desc:'Un centrocampista disciplinado que busca cortar las jugadas rivales.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r309.webp'
},
{
  id:'r310', equipo:'Neo Raimon', nombre:'Lon Grainger', original:'Grainger',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:51,pase:63,defensa:43,especial:56,
  hissatsu:['Regate Aurora', 'Parada fuerte', 'Carrera relámpago'],tipoTecnica:'regate',
  desc:'Un centrocampista rápido con buen manejo del balón.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r310.webp'
},
{
  id:'r311', equipo:'Neo Raimon', nombre:'Vin Fleetwood', original:'Fleetwood', posicion:'Delantero', tipo:'Viento',
  tiro:66,pase:50,defensa:34,especial:60,
  hissatsu:['Superaceleración', 'Sabiduría Divina', 'Ángel de nieve'],tipoTecnica:'regate',
  desc:'Un delantero veloz que busca atacar los espacios.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r311.webp'
},
{
  id:'r312', equipo:'Neo Raimon', nombre:'Samuel Peeps', original:'Peeps',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:47,pase:64,defensa:45,especial:54,
  hissatsu:['Pase Cruzado', 'Chut granada', 'Corte Volcánico'],tipoTecnica:'tiro',
  desc:'Un centrocampista centrado en distribuir el balón.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r312.webp'
},
{
  id:'r313', equipo:'Neo Raimon', nombre:'Edward Albion', original:'Albion', posicion:'Portero', tipo:'Montaña',
  tiro:24,pase:43,defensa:53,especial:68,
  hissatsu:['Despeje explosivo', 'Parada fuerte', 'Confusión'],tipoTecnica:'portero',
  desc:'Un portero de gran fortaleza física.',
  locked:false,cost:17,
  sprite:'https://inazumarun.es/assets/sprites/r313.webp'
},
{
  id:'r314', equipo:'Neo Raimon', nombre:'Chunk Gorman', original:'Gorman', posicion:'Delantero', tipo:'Montaña',
  tiro:76,pase:45,defensa:37,especial:61,
  hissatsu:['Remate Poderoso', 'Remate de Gaia', 'Carrera a tres piernas'],tipoTecnica:'tiro',
  desc:'Un delantero corpulento al que le encanta comer grandes cantidades de arroz.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r314.webp'
},
{
  id:'r315', equipo:'Neo Raimon', nombre:'Ace Server', original:'Buruto Uin', posicion:'Portero', tipo:'Viento',
  tiro:24,pase:49,defensa:55,especial:72,
  hissatsu:['Despeje explosivo', 'Red procyon'],tipoTecnica:'portero',
  desc:'Un prodigio del tenis que destaca también bajo los palos.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r315.webp'
},
{
  id:'r316', equipo:'Neo Raimon', nombre:'Rush', original:'Kaito Kakki', posicion:'Centrocampista', tipo:'Bosque',
  tiro:54,pase:68,defensa:43,especial:64,
  hissatsu:['Regate Aurora', 'Espejismo', 'Telaraña'],tipoTecnica:'regate',
  desc:'Conocido como el relámpago púrpura, supera rivales gracias a su velocidad.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r316.webp'
},
{
  id:'r317', equipo:'Neo Raimon', nombre:'Joe Chugger', original:'Joe Chugger', posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:68,defensa:69,especial:64,
  hissatsu:['Baile de Llamas', 'Balón galgo'],tipoTecnica:'defensa',
  desc:'Si no se toma un café antes del partido, no logra concentrarse.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r317.webp'
},
{
  id:'r318', equipo:'Neo Raimon', nombre:'Mat Halled', original:'Mat Halled',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:68,defensa:73,especial:70,
  hissatsu:['Cortafuegos', 'Balón galgo'],tipoTecnica:'defensa',
  desc:'Su cinta parece que le da poder.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r318.png'
},
{
  id:'r319', equipo:'Neo Raimon', nombre:'Monarch Rome', original:'Monarch Rome', posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:72,defensa:72,especial:69,
  hissatsu:['Proyectil de Ozono', 'Rompehielos', 'Hora Celestial'],tipoTecnica:'defensa',
  desc:'Siempre está en calma.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r319.webp'
},

// Claustro Sagrado (datos aproximados: nombre real, resto estimado)
{
  id:'r320', equipo:'Claustro Sagrado', nombre:'Crane Kik', original:'Crane Kik', sprite:'https://inazumarun.es/assets/sprites/r320.webp',
  posicion:'Portero', tipo:'Bosque',
  tiro:56,pase:67,defensa:80,especial:72,
  hissatsu:['Lanzallamas', 'Despeje de leñador'],tipoTecnica:'portero',
  desc:'Capitán del Claustro Sagrado, busca la paz interior a través del fútbol.',
  locked:false,cost:18
},
{
  id:'r321', equipo:'Claustro Sagrado', nombre:'Tyke Wando', original:'Tyke Wando', sprite:'https://inazumarun.es/assets/sprites/r321.webp',
  posicion:'Delantero', tipo:'Bosque',
  tiro:78,pase:75,defensa:33,especial:69,
  hissatsu:['Tiro giratorio', 'Pared solitaria', 'Remate Dragón'],tipoTecnica:'tiro',
  desc:'Mano derecha del capitán, muy hábil con las artes marciales.',
  locked:false,cost:18
},
{
  id:'r322', equipo:'Claustro Sagrado', nombre:'Dirk Artz', original:'Dirk Artz', sprite:'https://inazumarun.es/assets/sprites/r322.webp',
  posicion:'Delantero', tipo:'Viento',
  tiro:75,pase:74,defensa:36,especial:71,
  hissatsu:['Cañonazo', 'Combate kung fu', 'Remate del águila'],tipoTecnica:'tiro',
  desc:'Delantero del Claustro Sagrado, hermano pequeño de Marshall.',
  locked:false,cost:18
},
{
  id:'r323', equipo:'Claustro Sagrado', nombre:'Marshall Artz', original:'Marshall Artz', sprite:'https://inazumarun.es/assets/sprites/r323.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:71,pase:76,defensa:40,especial:70,
  hissatsu:['Cañon Dragón', 'Combate kung fu', 'Torbellino dragón'],tipoTecnica:'tiro',
  desc:'Delantero disciplinado del Claustro Sagrado, hermano mayor de Dirk.',
  locked:false,cost:18
},
{
  id:'r324', equipo:'Claustro Sagrado', nombre:'Brendan Water', original:'Brendan Water', sprite:'https://inazumarun.es/assets/sprites/r324.webp',
  posicion:'Defensa', tipo:'Fuego',
  tiro:44,pase:72,defensa:74,especial:73,
  hissatsu:['Cabeza Defensiva', 'Apisonadora', 'Súper pisotón de sumo'],tipoTecnica:'defensa',
  desc:'Sereno y constante, no pierde la calma ni bajo presión.',
  locked:false,cost:18
},
{
  id:'r325', equipo:'Claustro Sagrado', nombre:'Bri Spark', original:'Bri Spark', sprite:'https://inazumarun.es/assets/sprites/r325.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:33,pase:68,defensa:72,especial:68,
  hissatsu:['Tiro Sónico', 'Ataque de las sombras', 'Combate kung fu'],tipoTecnica:'tiro',
  desc:'Rápido y con mucho carácter, siempre busca el remate.',
  locked:false,cost:18
},
{
  id:'r326', equipo:'Claustro Sagrado', nombre:'Don Ation', original:'Don Ation', sprite:'https://inazumarun.es/assets/sprites/r326.webp',
  posicion:'Delantero', tipo:'Viento',
  tiro:69,pase:71,defensa:32,especial:67,
  hissatsu:['Tiro Sónico', 'Cabezazo Kung Fu', 'Torbellino dragón'],tipoTecnica:'tiro',
  desc:'Centrocampista del Claustro Sagrado, entrena con los monjes.',
  locked:false,cost:18
},
{
  id:'r327', equipo:'Claustro Sagrado', nombre:'Earnest Bookworm', original:'Earnest Bookworm',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:62,defensa:70,especial:68,
  hissatsu:['Cabeza Defensiva', 'Parada fuerte', 'Fénix'],tipoTecnica:'defensa',
  desc:'Estudioso del juego, lee las jugadas antes de que ocurran.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r327.webp'
},
{
  id:'r328', equipo:'Claustro Sagrado', nombre:'Ian Telektual', original:'Ian Telektual', sprite:'https://inazumarun.es/assets/sprites/r328.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:74,defensa:65,especial:70,
  hissatsu:['Giro de Mono', 'Regate múltiple', 'Confusión'],tipoTecnica:'regate',
  desc:'Mediocentro de temple tranquilo, concentrado en cada disparo.',
  locked:false,cost:18
},
{
  id:'r329', equipo:'Claustro Sagrado', nombre:'Junior Fardream', original:'Junior Fardream', sprite:'https://inazumarun.es/assets/sprites/r329.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:70,defensa:60,especial:68,
  hissatsu:['Danza del viento', 'Pared solitaria', 'Ataque de las sombras'],tipoTecnica:'regate',
  desc:'Soñador que reparte juego con calma desde el centro del campo.',
  locked:false,cost:18
},
{
  id:'r330', equipo:'Claustro Sagrado', nombre:'Lee Dinglite', original:'Lee Dinglite', sprite:'https://inazumarun.es/assets/sprites/r330.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:61,defensa:65,especial:63,
  hissatsu:['Barrido Defensivo', 'Cabezazo Kung Fu', 'Regate múltiple'],tipoTecnica:'defensa',
  desc:'Defensa del Claustro Sagrado, firme en cada entrada.',
  locked:false,cost:18
},
// Servicio Secreto (datos aproximados: nombre real, resto estimado)
{
  id:'r331', equipo:'Servicio Secreto', nombre:'Ken Ironwall', original:'Ken Ironwall', sprite:'https://inazumarun.es/assets/sprites/r331.webp',
  posicion:'Portero', tipo:'Montaña',
  tiro:22,pase:52,defensa:64,especial:65,
  hissatsu:['Escudo de Fuerza', 'Muralla de escudos', 'Bloque dureza'],tipoTecnica:'portero',
  desc:'Un muro humano bajo los palos del Servicio Secreto.',
  locked:false,cost:18
},
{
  id:'r332', equipo:'Servicio Secreto', nombre:'Timothy Western', original:'Timothy Western', sprite:'https://inazumarun.es/assets/sprites/r332.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:69,defensa:66,especial:62,
  hissatsu:['Robo veloz', 'Giro de Mono', 'Zona de seguridad'],tipoTecnica:'defensa',
  desc:'Agente veterano, defiende sin perder nunca la posición.',
  locked:false,cost:18
},
{
  id:'r333', equipo:'Servicio Secreto', nombre:'Shirley Stevens', original:'Shirley Stevens', sprite:'https://inazumarun.es/assets/sprites/r333.webp',
  posicion:'Defensa', tipo:'Bosque',
  tiro:49,pase:68,defensa:71,especial:67,
  hissatsu:['Bloqueo', 'Zona de seguridad', 'Voltereta Círcense'],tipoTecnica:'defensa',
  desc:'Agente del Servicio Secreto, rápida leyendo al rival.',
  locked:false,cost:18
},
{
  id:'r334', equipo:'Servicio Secreto', nombre:'Wallace Hammond', original:'Wallace Hammond', sprite:'https://inazumarun.es/assets/sprites/r334.webp',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:67,defensa:72,especial:69,
  hissatsu:['Barrido Defensivo', 'Entrada huracán', 'Zona de seguridad'],tipoTecnica:'defensa',
  desc:'Contundente en cada balón dividido.',
  locked:false,cost:18
},
{
  id:'r335', equipo:'Servicio Secreto', nombre:'Ian Smith', original:'Ian Smith', sprite:'https://inazumarun.es/assets/sprites/r335.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:69,defensa:73,especial:65,
  hissatsu:['Cabeza Defensiva', 'Escudo corporal', 'Zona de seguridad'],tipoTecnica:'defensa',
  desc:'Defensa del Servicio Secreto, serio y fiable.',
  locked:false,cost:18
},
{
  id:'r336', equipo:'Servicio Secreto', nombre:'Sid Safehouse', original:'Sid Safehouse', sprite:'https://inazumarun.es/assets/sprites/r336.webp',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:60,defensa:66,especial:72,
  hissatsu:['Robo veloz', 'Apisonadora', 'Escudo corporal'],tipoTecnica:'defensa',
  desc:'Cierra los espacios como si guardara un refugio.',
  locked:false,cost:18
},
{
  id:'r337', equipo:'Servicio Secreto', nombre:'Taylor Firepool', original:'Taylor Firepool', sprite:'https://inazumarun.es/assets/sprites/r337.webp',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:58,pase:68,defensa:55,especial:71,
  hissatsu:['Aikido', 'Remate Misil'],tipoTecnica:'defensa',
  desc:'Centrocampista que combina el aikido con el fútbol junto a Marge Fielding.',
  locked:false,cost:18
},
{
  id:'r338', equipo:'Servicio Secreto', nombre:'Marge Fielding', original:'Marge Fielding', sprite:'https://inazumarun.es/assets/sprites/r338.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:65,defensa:65,especial:65,
  hissatsu:['Aikido', 'Torre Inexpugnable'],tipoTecnica:'defensa',
  desc:'Conocida como Agente M, domina el aikido junto a Taylor Firepool.',
  locked:false,cost:18
},
{
  id:'r339', equipo:'Servicio Secreto', nombre:'Holly Mirror', original:'Holly Mirror', sprite:'https://inazumarun.es/assets/sprites/r339.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:67,pase:68,defensa:52,especial:69,
  hissatsu:['Danza del viento', 'Remate de seguridad', 'Remate en espiral'],tipoTecnica:'regate',
  desc:'Centrocampista astuta, difícil de leer para el rival.',
  locked:false,cost:18
},
{
  id:'r340', equipo:'Servicio Secreto', nombre:'Ian Sights', original:'Ian Sights', sprite:'https://inazumarun.es/assets/sprites/r340.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:65,defensa:54,especial:65,
  hissatsu:['Tiro Sónico', 'Despeje cohete', 'Muralla de escudos'],tipoTecnica:'tiro',
  desc:'Siempre tiene el campo a la vista antes de pasar.',
  locked:false,cost:18
},
{
  id:'r341', equipo:'Servicio Secreto', nombre:'Ryan Tappin', original:'Ryan Tappin', sprite:'https://inazumarun.es/assets/sprites/r341.webp',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:57,pase:68,defensa:64,especial:63,
  hissatsu:['Tiro giratorio', 'Barrido Defensivo'],tipoTecnica:'tiro',
  desc:'Trabajador incansable en el centro del campo.',
  locked:false,cost:18
},
{
  id:'r342', equipo:'Servicio Secreto', nombre:'Joe Kenneddy', original:'Joe Kenneddy', sprite:'https://inazumarun.es/assets/sprites/r342.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:64,pase:66,defensa:32,especial:67,
  hissatsu:['Chut Granada', 'Bomba acrobática', 'Remate Misil'],tipoTecnica:'tiro',
  desc:'Delantero del Servicio Secreto, remata sin dudar.',
  locked:false,cost:18
},
{
  id:'r343', equipo:'Servicio Secreto', nombre:'Marshall Firsthand', original:'Marshall Firsthand', sprite:'https://inazumarun.es/assets/sprites/r343.webp',
  posicion:'Delantero', tipo:'Montaña',
  tiro:64,pase:63,defensa:43,especial:60,
  hissatsu:['Remate Múltiple', 'Bola Falsa', 'Zona de seguridad'],tipoTecnica:'tiro',
  desc:'Siempre llega primero al balón.',
  locked:false,cost:18
},
// {
//   id:'r344', equipo:'Alpino', nombre:'Greene Beray', original:'Greene Beray',
//   posicion:'Delantero', tipo:'Bosque',
//   tiro:66,pase:58,defensa:33,especial:68,
//   hissatsu:['Cañonazo'],tipoTecnica:'tiro',
//   desc:'Delantero paciente que espera su momento.',
//   locked:false,cost:18
// },
// {
//   id:'r345', equipo:'Alpino', nombre:'Linda Shadey', original:'Linda Shadey',
//   posicion:'Delantero', tipo:'Viento',
//   tiro:67,pase:58,defensa:34,especial:62,
//   hissatsu:['Tiro Sónico'],tipoTecnica:'tiro',
//   desc:'Se desmarca sin que el rival la vea llegar.',
//   locked:false,cost:18
// },
// Alpino (datos aproximados: nombre real, resto estimado)
{
  id:'r346', equipo:'Alpino', nombre:'Adam Ropes', original:'Adam Ropes',
  posicion:'Portero', tipo:'Montaña',
  tiro:22,pase:53,defensa:68,especial:74,
  hissatsu:['Manos infinitas', 'Bloque dureza', 'Bloque de Hielo'],tipoTecnica:'portero',
  desc:'Portero del Instituto Alpino, curtido en el frío.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r346.webp'
},
{
  id:'r347', equipo:'Alpino', nombre:'Milton Bindings', original:'Milton Bindings',
  posicion:'Defensa', tipo:'Viento',
  tiro:44,pase:78,defensa:75,especial:72,
  hissatsu:['Muro de Hierro', 'Gravedad', 'Paisaje Helado'],tipoTecnica:'defensa',
  desc:'Defensa del Alpino, aguanta cualquier embestida.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r347.webp'
},
{
  id:'r348', equipo:'Alpino', nombre:'Spike Gleeson', original:'Spike Gleeson',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:61,defensa:72,especial:61,
  hissatsu:['Robo veloz', 'Corte Giratorio', 'Regate Aurora'],tipoTecnica:'defensa',
  desc:'Defensa del Alpino, duro y rápido en la entrada.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r348.webp'
},
{
  id:'r349', equipo:'Alpino', nombre:'Joaquine Downtown', original:'Joaquine Downtown',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:75,defensa:76,especial:74,
  hissatsu:['Paisaje Helado', 'Arco iris'],tipoTecnica:'defensa',
  desc:'Defensa del Alpino que sale jugando desde atrás.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r349.webp'
},
{
  id:'r350', equipo:'Alpino', nombre:'Roland Climbstein', original:'Roland Climbstein',
  posicion:'Delantero', tipo:'Viento',
  tiro:77,pase:72,defensa:54,especial:72,
  hissatsu:['Remate de hielo', 'Paisaje Helado'],tipoTecnica:'tiro',
  desc:'Escalador nato, sube y baja la banda sin cansarse.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r350.webp'
},
{
  id:'r351', equipo:'Alpino', nombre:'Kerry Bootgaiter', original:'Kerry Bootgaiter',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:67,defensa:64,especial:70,
  hissatsu:['Espejismo', 'Torbellino dragón', 'Regate espejismo'],tipoTecnica:'regate',
  desc:'Centrocampista del Alpino, incansable en la nieve.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r351.webp'
},
{
  id:'r352', equipo:'Alpino', nombre:'Maddox Rock', original:'Maddox Rock',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:66,pase:72,defensa:60,especial:65,
  hissatsu:['Truco de Magia', 'Regate espejismo', 'Pared solitaria'],tipoTecnica:'regate',
  desc:'Centrocampista sólido como una roca.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r352.webp'
},
{
  id:'r353', equipo:'Alpino', nombre:'Quentin Rackner', original:'Quentin Rackner',
  posicion:'Delantero', tipo:'Bosque',
  tiro:76,pase:71,defensa:54,especial:67,
  hissatsu:['Remate de hielo', 'Entrada huracán'],tipoTecnica:'tiro',
  desc:'Reparte juego con precisión desde la mediapunta.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r353.webp'
},
{
  id:'r354', equipo:'Alpino', nombre:'Sean Snowfield', original:'Sean Snowfield',
  posicion:'Defensa', tipo:'Montaña',
  tiro:61,pase:74,defensa:77,especial:72,
  hissatsu:['Tiro giratorio', 'Súper pisotón de sumo', 'Mega Terremoto'],tipoTecnica:'tiro',
  desc:'Defensa del Alpino, frío ante la portería.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r354.webp'
},
{
  id:'r355', equipo:'Alpino', nombre:'Robert Skipolson', original:'Robert Skipolson',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:71,pase:55,defensa:70,especial:70,
  hissatsu:['Tiro Sónico', 'Pase Cruzado', 'Regate espejismo'],tipoTecnica:'tiro',
  desc:'Delantero del Alpino, potente y directo.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r355.webp'
},

// Raimon (Ares) (datos aproximados: nombre real, resto estimado)
{
  id:'r356', equipo:'Raimon Inakuni', equiposExtra:['Artemisa de Mr.YI', 'Chispas Perfectas'], nombre:'Sonny Wright', original:'Asuto Inamori', sprite:'https://inazumarun.es/assets/sprites/r356.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:84,pase:74,defensa:45,especial:80,
  hissatsu:['Ave goleadora', 'Entrada Relámpago', 'Gaviota dorada'],tipoTecnica:'tiro',
  desc:'Protagonista de la isla de Inakuni; capitán en la final del Fútbol Frontier.',
  locked:false,cost:18
},
{
  id:'r357', equipo:'Raimon Inakuni', nombre:'Maxime Dassier', original:'Tatsumi Michinari', sprite:'https://inazumarun.es/assets/sprites/r357.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:74,pase:74,defensa:70,especial:72,
  hissatsu:['Ofensiva danzarina', 'Superaceleración', 'Giro chispas'],tipoTecnica:'tiro',
  desc:'Capitán del Raimon Isla Remota durante el torneo.',
  locked:false,cost:18
},
{
  id:'r358', equipo:'Raimon Inakuni', nombre:'Basile Hardy', original:'Sasuke Kozoumaru', sprite:'https://inazumarun.es/assets/sprites/r358.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:79,pase:76,defensa:52,especial:75,
  hissatsu:['Tornado de fuego', 'Entrada de llamas', 'Bomba daruma'],tipoTecnica:'tiro',
  desc:'Delantero del Raimon Isla Remota, obsesionado con su Tornado de fuego.',
  locked:false,cost:18
},
{
  id:'r359', equipo:'Raimon Inakuni', nombre:'Cliff Parker', original:'Takashi Iwato', sprite:'https://inazumarun.es/assets/sprites/r359.webp',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:78,defensa:85,especial:80,
  hissatsu:['El muro', 'Mega Terremoto', 'Apisonadora'],tipoTecnica:'defensa',
  desc:'El Gólem de la isla: un muro imposible de pasar.',
  locked:false,cost:18
},

// Raimon (Ares) (datos aproximados: nombre real, resto estimado)
{
  id:'r360', equipo:'Raimon Inakuni', equiposExtra:['Artemisa de Mr.YI', 'Instituto Estrella Polar'], nombre:'Elliot Ember', original:'Ryouhei Haizaki', sprite:'https://inazumarun.es/assets/sprites/r360.webp',
  posicion:'Delantero', tipo:'Bosque',
  tiro:85,pase:80,defensa:40,especial:85,
  hissatsu:['Chilena de pingüino', 'Pingüino Aéreo', 'Pingüino perfecto'],tipoTecnica:'tiro',
  desc:'Estrella de Polaris que se une al Raimon Isla Remota contra el Plenilunio.',
  locked:false,cost:18
},
{
  id:'r361', equipo:'Instituto Plenilunio', equiposExtra:['Artemisa de Mr.YI'], nombre:'Heath Moore', original:'Yuuma Nosaka', sprite:'https://inazumarun.es/assets/sprites/r361.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:86,defensa:78,especial:85,
  hissatsu:['Regate Lunar', 'Lanza real', 'Pasos aéreos'],tipoTecnica:'regate',
  desc:'Centrocampista incansable del Plenilunio.',
  locked:false,cost:18
},
{
  id:'r362', equipo:'Raimon Inakuni', nombre:'Valentin Eisner', original:'Kirina Hiura', sprite:'https://inazumarun.es/assets/sprites/r362.webp',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:82,defensa:67,especial:70,
  hissatsu:['Flecha de hielo','Lanza polar','Tiro meteórico'],tipoTecnica:'tiro',
  desc:'Centrocampista del Raimon Isla Remota con técnicas de hielo.',
  locked:false,cost:18
},
{
  id:'r363', equipo:'Raimon Inakuni', nombre:'Nino Nango', original:'Hanta Hattori', sprite:'https://inazumarun.es/assets/sprites/r363.webp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:71,pase:70,defensa:78,especial:80,
  hissatsu:['Sapo ninja', 'Jaula gravitatoria', 'Espejismo'],tipoTecnica:'tiro',
  desc:'Centrocampista ágil del Raimon Isla Remota.',
  locked:false,cost:18
},
{
  id:'r364', equipo:'Raimon Inakuni', nombre:'César Montalbán', original:'Hiro Okuiri', sprite:'https://inazumarun.es/assets/sprites/r364.webp',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:72,defensa:68,especial:66,
  hissatsu:['Laberinto', 'Escáner Ataque', 'Jaula de gravedad'],tipoTecnica:'regate',
  desc:'Centrocampista que desorienta rivales con el Laberinto.',
  locked:false,cost:18
},
{
  id:'r365', equipo:'Raimon Inakuni', nombre:'Adriano Donati', original:'Tetsunosuke Goujin', sprite:'https://inazumarun.es/assets/sprites/r365.webp',
  posicion:'Delantero', tipo:'Fuego',
  tiro:82,pase:70,defensa:44,especial:81,
  hissatsu:['Cabezazo fiero', 'Granizado de fuego', 'Bateo total'],tipoTecnica:'tiro',
  desc:'Delantero del Raimon Isla Remota, letal de cabeza.',
  locked:false,cost:18
},
{
  id:'r366', equipo:'Raimon Inakuni', nombre:'Trevor Cook', original:'Yuuichirou Mansaku', sprite:'https://inazumarun.es/assets/sprites/r366.webp',
  posicion:'Defensa', tipo:'Viento',
  tiro:52,pase:75,defensa:79,especial:77,
  hissatsu:['Viento centelleante', 'Entrada Tormenta', 'Ciclón'],tipoTecnica:'regate',
  desc:'Defensa veloz del Raimon Isla Remota.',
  locked:false,cost:18
},
{
  id:'r367', equipo:'Raimon Inakuni', nombre:'Kiko Calavento', original:'Masakatsu Hiyori', sprite:'https://inazumarun.es/assets/sprites/r367.webp',
  posicion:'Defensa', tipo:'Bosque',
  tiro:54,pase:74,defensa:80,especial:74,
  hissatsu:['Torbellino interceptor', 'Jaula gravitatoria', 'Espejismo'],tipoTecnica:'defensa',
  desc:'Defensa del Raimon Isla Remota que recupera el balón con su Torbellino.',
  locked:false,cost:18
},
{
  id:'r368', equipo:'Raimon Inakuni', nombre:'Sandra Fischer', original:'Sandra Fischer', sprite:'https://inazumarun.es/assets/sprites/r368.webp',

  posicion:'Portero', tipo:'Viento',

  tiro:30,pase:52,defensa:78,especial:72,

  hissatsu:['Mano oceánica', 'Velo de sirena', 'Parada fuerte'],tipoTecnica:'portero',

  desc:'Portera del Raimon Isla Remota.',

  locked:false,cost:18
},

{
  id:'r369', equipo:'Raimon Inakuni', nombre:'Rolland Bowlby', original:'Rolland Bowlby', sprite:'https://inazumarun.es/assets/sprites/r369.webp',

  posicion:'Portero', tipo:'Fuego',

  tiro:28,pase:46,defensa:66,especial:66,

  hissatsu:['Parada ardiente', 'Mano Celestial'],tipoTecnica:'portero',

  desc:'Portero del Raimon Isla Remota en el manga de Atsushi Oba.',

  locked:false,cost:18
},

// Instituto Umbrella
{
  id:'r370', equipo:'Umbrella', nombre:'Joe Ingram', original:'Jo Ikegaki',
  posicion:'Portero', tipo:'Fuego',
  tiro:35,pase:48,defensa:72,especial:76,
  hissatsu:['Atajo Tornado', 'Fénix', 'Tiro Giratorio'],tipoTecnica:'portero',
  desc:'Portero titular del Instituto Umbrella.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r370.webp'
},
{
  id:'r371', equipo:'Umbrella', nombre:'Kendall Sefton', original:'Kendall Sefton',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:55,defensa:70,especial:67,
  hissatsu:['Corte Giratorio', 'Torbellino dragón'],tipoTecnica:'defensa',
  desc:'Defensa titular del Instituto Umbrella.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r371.webp'
},
{
  id:'r372', equipo:'Umbrella', nombre:'Jason Strike', original:'Yasuchi Kikuchi',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:58,defensa:69,especial:66,
  hissatsu:['Robo veloz', 'Ataque cortante', 'Disparo Rodante'],tipoTecnica:'defensa',
  desc:'Defensa del Umbrella, muy aficionado al deporte y al entrenamiento físico.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r372.webp'
},
{
  id:'r373', equipo:'Umbrella', nombre:'Norman Porter', original:'Norman Porter',
  posicion:'Defensa', tipo:'Montaña',
  tiro:40,pase:52,defensa:73,especial:68,
  hissatsu:['Barrido Defensivo', 'El Muro'],tipoTecnica:'defensa',
  desc:'Defensa titular del Instituto Umbrella.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r373.webp'
},
{
  id:'r374', equipo:'Umbrella', nombre:'Maxwell Claus', original:'Maxwell Claus',
  posicion:'Defensa', tipo:'Bosque',
  tiro:44,pase:54,defensa:71,especial:65,
  hissatsu:['Giro Bobina', 'Ataque cortante'],tipoTecnica:'defensa',
  desc:'Defensa del Umbrella, conocido por su apodo Chops.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r374.webp'
},
{
  id:'r375', equipo:'Umbrella', nombre:'Bruce Chaney', original:'Bruce Chaney',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:55,pase:64,defensa:50,especial:62,
  hissatsu:['Equilibrismo', 'Chut granada', 'Bateo total'],tipoTecnica:'regate',
  desc:'Centrocampista titular del Instituto Umbrella.',
  locked:false,cost:100,
  sprite:'https://inazumarun.es/assets/sprites/r375.webp'
},
{
  id:'r376', equipo:'Umbrella', nombre:'Leroy Rhymes', original:'Leroy Rhymes',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:58,pase:68,defensa:53,especial:70,
  hissatsu:['Equilibrismo', 'Superaceleración', 'Torbellino dragón'],tipoTecnica:'regate',
  desc:'Centrocampista del Umbrella con buenas capacidades de control del balón.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r376.webp'
},
{
  id:'r377', equipo:'Umbrella', nombre:'Mildford Scott', original:'Mildford Scott',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:52,pase:61,defensa:54,especial:64,
  hissatsu:['Escáner Ataque', 'Bola Falsa', 'Superaceleración'],tipoTecnica:'regate',
  desc:'Centrocampista titular del Instituto Umbrella.',
  locked:false,cost:100,
  sprite:'https://inazumarun.es/assets/sprites/r377.webp'
},
{
  id:'r378', equipo:'Umbrella', nombre:'Lou Edmonds', original:'Yo Idemae',
  posicion:'Delantero', tipo:'Fuego',
  tiro:70,pase:57,defensa:44,especial:72,
  hissatsu:['Tiro Giratorio', 'Entrada de llamas', 'Superaceleración'],tipoTecnica:'tiro',
  desc:'Capitán del Instituto Umbrella y uno de sus principales jugadores.',
  locked:false,cost:125,
  sprite:'https://inazumarun.es/assets/sprites/r378.webp'
},
{
  id:'r379', equipo:'Umbrella', nombre:'Cameron Morefield', original:'Hidetsugu Yasunaga',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:59,pase:67,defensa:52,especial:70,
  hissatsu:['Entrada Huracán', 'Chut Congelante', 'Tiro dinamita'],tipoTecnica:'regate',
  desc:'Centrocampista titular del Umbrella y antiguo tenista de gran talento.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r379.webp'
},
{
  id:'r380', equipo:'Umbrella', nombre:'Greg Bernard', original:'Seiji Mizuguchi',
  posicion:'Delantero', tipo:'Bosque',
  tiro:67,pase:72,defensa:51,especial:70,
  hissatsu:['Remate Serpiente', 'Remate Misil', 'Zig Zag Explosivo'],tipoTecnica:'tiro',
  desc:'Delantero del Umbrella, conocido como Cyborg por sus pases tan precisos.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r380.webp'
},
{
  id:'r381', equipo:'Otaku', nombre: 'Sam Idol', original:'Sam Idol',
  posicion:'Portero', tipo:'Montaña',
  tiro:21,pase:36,defensa:70,especial:70,
  hissatsu:['Deslizamiento de portería', 'Bloque dureza'],tipoTecnica:'portero',
  desc:'Portero del Otaku.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r381.webp'
},
{
  id:'r382', equipo:'Otaku', nombre: 'Light Nobel', original:'Light Nobel',
  posicion:'Defensa', tipo:'Bosque',
  tiro:25,pase:65,defensa:71,especial:68,
  hissatsu:['Bola Falsa', 'Bateo total'],tipoTecnica:'defensa',
  desc:'Defensa del Otaku.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r382.webp'
},
{
  id:'r383', equipo:'Otaku', nombre: 'Walter Valiant', original:'Walter Valiant',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:70,defensa:60,especial:60,
  hissatsu:['Regate Topo', 'Bola Falsa', 'Espejismo'],tipoTecnica:'regate',
  desc:'Centrocampista del Otaku.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r383.webp'
},
{
  id:'r384', equipo:'Otaku', nombre:'Gus Gamer', original:'Gus Gamer',
  posicion:'Delantero', tipo:'Fuego',
  tiro:72,pase:55,defensa:38,especial:70,
  hissatsu:['Bola Falsa', 'Bateo total', 'Confusión'],tipoTecnica:'defensa',
  desc:'Delantero del Otaku, de segundo curso.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r384.webp'
},
{
  // "Aire" no es un tipo elemental válido de la app (Fuego/Bosque/Viento/
  // Montaña) -- pasado a Viento, mismo criterio que el resto del roster.
  id:'r385', equipo:'Otaku', nombre:'Mark Gambling', original:'Mark Gambling',
  posicion:'Delantero', tipo:'Viento',
  tiro:74,pase:58,defensa:40,especial:72,
  hissatsu:['Combo Perfecto', 'Confusión', 'Bateo total'],tipoTecnica:'tiro',
  desc:'Capitán del Otaku (Manga de Tenya Yabuno), de segundo curso.',
  locked:false,cost:125,
  sprite:'https://inazumarun.es/assets/sprites/r385.webp'
},
{
  id:'r386', equipo:'Otaku', nombre:'Theodore Master', original:'Theodore Master',
  posicion:'Delantero', tipo:'Bosque',
  tiro:71,pase:56,defensa:39,especial:69,
  hissatsu:['Doble Salto', 'Confusión', 'Pase Cruzado'],tipoTecnica:'tiro',
  desc:'Delantero del Otaku, de tercer curso.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r386.webp'
},
// Inazuma Kids FC (wiki: https://inazuma.fandom.com/es/wiki/Inazuma_Kids_FC).
{
  id:'r387', equipo:'Inazuma Kids', nombre:'Herman Muller', original:'Herman Muller',
  posicion:'Portero', tipo:'Viento',
  tiro:28,pase:42,defensa:70,especial:72,
  hissatsu:['Despeje a presión', 'Despeje de fuego', 'Despeje cohete'],tipoTecnica:'portero',
  desc:'Portero del Inazuma Kids FC, dorsal 1.',
  locked:false,cost:16,
  sprite:'https://inazumarun.es/assets/sprites/r387.webp'
},
{
  id:'r388', equipo:'Inazuma Kids', nombre:'Keth Claus', original:'Keth Claus',
  posicion:'Defensa', tipo:'Viento',
  tiro:32,pase:46,defensa:70,especial:60,
  hissatsu:['Superaceleración', 'Barrido Defensivo'],
  desc:'Defensa del Inazuma Kids FC, dorsal 2.',
  locked:false,cost:14,
  sprite:'https://inazumarun.es/assets/sprites/r388.webp'
},
{
  id:'r389', equipo:'Inazuma Kids', nombre:'Robert Silver', original:'Robert Silver',
  posicion:'Defensa', tipo:'Viento',
  tiro:33,pase:45,defensa:71,especial:59,
  hissatsu:['Entrada huracán', 'Confusión'],
  desc:'Defensa del Inazuma Kids FC, dorsal 3.',
  locked:false,cost:14,
  sprite:'https://inazumarun.es/assets/sprites/r389.webp'
},
{
  id:'r390', equipo:'Inazuma Kids', nombre:'Taylor Higgins', original:'Taylor Higgins',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:40,pase:56,defensa:52,especial:58,
  hissatsu:['Giro Bobina'],
  desc:'Centrocampista del Inazuma Kids FC, dorsal 7.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r390.webp'
},
{
  id:'r391', equipo:'Inazuma Kids', nombre:'Jamie Cool', original:'Jamie Cool',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:41,pase:58,defensa:51,especial:60,
  hissatsu:['Entrada huracán', 'Robo veloz'],
  desc:'Centrocampista del Inazuma Kids FC, dorsal 8.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r391.webp'
},
{
  id:'r392', equipo:'Inazuma Kids', nombre:'Hans Randall', original:'Hans Randall',
  posicion:'Delantero', tipo:'Fuego',
  tiro:66,pase:44,defensa:36,especial:64,
  hissatsu:['Superaceleración','Tiro del cometa'],tipoTecnica:'tiro',
  desc:'Delantero del Inazuma Kids FC, dorsal 9.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r392.webp'
},
{
  id:'r393', equipo:'Inazuma Kids', nombre:'Maddie Moonlight', original:'Maddie Moonlight',
  posicion:'Delantero', tipo:'Bosque',
  tiro:68,pase:46,defensa:37,especial:66,
  hissatsu:['Tiro del cometa'],tipoTecnica:'tiro',
  desc:'Capitana del Inazuma Kids FC, dorsal 11.',
  locked:false,cost:20,
  sprite:'https://inazumarun.es/assets/sprites/r393.webp'
},
// Instituto Kirkwood, primer anime (wiki: https://inazuma.fandom.com/es/wiki/Instituto_Kirkwood)
{
  id:'r394', equipo:'Kirkwood', equiposExtra:['Emperadores Oscuros'], nombre:'Malcolm Night', original:'Malcolm Night',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:55,defensa:66,especial:60,
  hissatsu:['Corte Giratorio', 'Superaceleración'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood, dorsal 2.',
  locked:false,cost:100,
  sprite:'https://inazumarun.es/assets/sprites/r394.webp'
},
{
  id:'r395', equipo:'Kirkwood', nombre:'Alfred Meenan', original:'Alfred Meenan',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:56,defensa:68,especial:58,
  hissatsu:['Robo veloz', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood, dorsal 3.',
  locked:false,cost:100,
  sprite:'https://inazumarun.es/assets/sprites/r395.webp'
},
{
  id:'r396', equipo:'Kirkwood', nombre:'Ricky Clover', original:'Ricky Clover',
  posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:54,defensa:65,especial:59,
  hissatsu:['Giro Bobina', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood, dorsal 5.',
  locked:false,cost:100,
  sprite:'https://inazumarun.es/assets/sprites/r396.webp'
},
{
  id:'r397', equipo:'Kirkwood', nombre:'Marvin Murdock', original:'Marvin Murdock',
  posicion:'Delantero', tipo:'Fuego',
  tiro:70,pase:62,defensa:45,especial:72,
  hissatsu:['Triángulo Z', 'Espejismo de Balón', 'Tornado Inverso'],tipoTecnica:'tiro',
  desc:'Capitán del Instituto Kirkwood, dorsal 9.',
  locked:false,cost:125,
  sprite:'https://inazumarun.es/assets/sprites/r397.webp'
},
{
  id:'r398', equipo:'Kirkwood', nombre:'Thomas Murdock', original:'Thomas Murdock',
  posicion:'Delantero', tipo:'Viento',
  tiro:66,pase:58,defensa:42,especial:68,
  hissatsu:['Tornado Inverso', 'Barrido Defensivo'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Kirkwood, dorsal 10, hermano de Marvin y Tyler.',
  locked:false,cost:115,
  sprite:'https://inazumarun.es/assets/sprites/r398.webp'
},
{
  id:'r399', equipo:'Kirkwood', equiposExtra:['Neo Japón'], nombre:'Tyler Murdock', original:'Tyler Murdock',
  posicion:'Delantero', tipo:'Montaña',
  tiro:64,pase:57,defensa:43,especial:66,
  hissatsu:['Tornado Inverso', 'Corte Giratorio'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Kirkwood, dorsal 11, hermano de Marvin y Thomas.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r399.webp'
},
// Equipo Ogro (wiki: https://inazuma.fandom.com/es/wiki/Equipo_Ogro), el
// rival más fuerte de todos -- rival final del Modo Mundial tras el Zeus.
// Delantero, capitán (Bash Lancer, r45) y Mystral Callous (r74) ya
// estaban en el roster con otros ids (personajes repetidos), así que no
// se duplican aquí -- ver WORLD_TOUR_STAGES en world-tour.js. Elemento
// 'Aire' de la wiki pasado a Viento, igual que el resto del roster.
{
  id:'r400', equipo:'Academia Ogre', nombre:'Lars Luceafăr', original:'Lars Luceafăr',
  posicion:'Portero', tipo:'Montaña',
  tiro:40,pase:60,defensa:86,especial:86,
  hissatsu:['Electrotrampa', 'Parada fuerte', 'Martillo de agujas'],tipoTecnica:'portero',
  desc:'Portero del Equipo Ogro, dorsal 1.',
  locked:true,cost:210,
  sprite:'https://inazumarun.es/assets/sprites/r400.webp'
},
{
  id:'r401', equipo:'Academia Ogre', nombre:'Bump Trungus', original:'Bump Trungus',
  posicion:'Defensa', tipo:'Fuego',
  tiro:60,pase:65,defensa:90,especial:86,
  hissatsu:['Placaje Extremo', 'Zona Sigma', 'Mega Terremoto'],tipoTecnica:'defensa',
  desc:'Defensa del Equipo Ogro, dorsal 2.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r401.webp'
},
{
  id:'r402', equipo:'Academia Ogre', nombre:'Lump Trungus', original:'Lump Trungus',
  posicion:'Defensa', tipo:'Viento',
  tiro:58,pase:64,defensa:89,especial:85,
  hissatsu:['Corte Diabólico', 'Segadora'],tipoTecnica:'defensa',
  desc:'Defensa del Equipo Ogro, dorsal 3.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r402.webp'
},
{
  id:'r403', equipo:'Academia Ogre', nombre:'Radd Ischer', original:'Radd Ischer',
  posicion:'Defensa', tipo:'Bosque',
  tiro:56,pase:63,defensa:87,especial:82,
  hissatsu:['Carga de Elefantes', 'Corte Volcánico', 'Segadora'],tipoTecnica:'defensa',
  desc:'Defensa del Equipo Ogro, dorsal 4.',
  locked:true,cost:180,
  sprite:'https://inazumarun.es/assets/sprites/r403.webp'
},
{
  id:'r404', equipo:'Academia Ogre', nombre:'Jynx Jenkins', original:'Jynx Jenkins',
  posicion:'Defensa', tipo:'Bosque',
  tiro:57,pase:62,defensa:86,especial:81,
  hissatsu:['Corte Volcánico', 'Espejismo de balón'],tipoTecnica:'defensa',
  desc:'Defensa del Equipo Ogro, dorsal 5.',
  locked:true,cost:180,
  sprite:'https://inazumarun.es/assets/sprites/r404.webp'
},
{
  id:'r405', equipo:'Academia Ogre', nombre:'Oni Triumvir', original:'Oni Triumvir',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:70,pase:80,defensa:75,especial:88,
  hissatsu:['Gravitación', 'Coz 3'],tipoTecnica:'defensa',
  desc:'Centrocampista del Equipo Ogro, dorsal 6.',
  locked:true,cost:195,
  sprite:'https://inazumarun.es/assets/sprites/r405.webp'
},
{
  id:'r406', equipo:'Academia Ogre', nombre:'Drachen Gunther', original:'Drachen Gunther',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:72,pase:82,defensa:74,especial:87,
  hissatsu:['Zona Sigma', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Centrocampista del Equipo Ogro, dorsal 7.',
  locked:true,cost:195,
  sprite:'https://inazumarun.es/assets/sprites/r406.webp'
},
{
  id:'r407', equipo:'Academia Ogre', nombre:'Ichabod Stark', original:'Ichabod Stark',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:74,pase:81,defensa:76,especial:90,
  hissatsu:['Diluvio Letal', 'Gravitación'],tipoTecnica:'tiro',
  desc:'Centrocampista del Equipo Ogro, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r407.webp'
},
{
  id:'r408', equipo:'Genesis', nombre:'Xene B.', original:'Xene',
  posicion:'Delantero', tipo:'Fuego',
  tiro:90,pase:76,defensa:45,especial:90,
  hissatsu:['Cañon de Meteoritos'],tipoTecnica:'tiro',
  desc:'El verdadero Xene que se hizo amigo de Mark',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r408.webp'
},
{
  id:'r409', equipo:'Tormenta de Géminis', nombre:'Janus', original:'Janus',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:85,pase:90,defensa:79,especial:87,
  hissatsu:['Astro remate', 'Disparo cósmico', 'Carrera relámpago'],tipoTecnica:'tiro',
  desc:'Un alienígena que se dedica a destrozar institutos.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r409.webp'
},
{
  id:'r410', equipo:'Neo Raimon', nombre:'Zak Wallside', original:'Zak Wallside',
  posicion:'Defensa', tipo:'Montaña',
  tiro:16,pase:77,defensa:80,especial:70,
  hissatsu:['El muro'],tipoTecnica:'defensa',
  desc:'Hermano de Jack y aprendiz.',
  locked:true,cost:100,
  sprite:'https://inazumarun.es/assets/sprites/r410.webp'
},

// {
//   id:'r411', equipo:'Triple C', nombre:'Sue', original:'Rika Urabe',
//   posicion:'Delantero', tipo:'Bosque',
//   tiro:89,pase:78,defensa:45,especial:88,
//   hissatsu:['Lecho de rosas'],tipoTecnica:'tiro',
//   desc:'Capitana y principal delantera del Triple C de Osaka. Se une posteriormente al Raimon durante la lucha contra la Academia Alius.',
//   locked:true,cost:420,
//   sprite:'https://inazumarun.es/assets/sprites/r411.webp'
// },

{
  id:'r412', equipo:'Claustro Sagrado', nombre:'Scotty', original:'Yuya Kogure',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:72,defensa:80,especial:80,
  hissatsu:['Campo Torbellino', 'Sorpresa', 'Torbellino dragón'],tipoTecnica:'defensa',
  desc:'Defensa del Claustro Sagrado conocido por su carácter bromista y por su extraordinario dominio del Campo Torbellino.',
  locked:true,cost:410,
  sprite:'https://inazumarun.es/assets/sprites/r412.webp'
},

{
  id:'r413', equipo:'Fauxshore', nombre:'Jonathan Luckyman', original:'Yuichiro Toda',
  posicion:'Delantero', tipo:'Bosque',
  tiro:80,pase:75,defensa:42,especial:82,
  hissatsu:['Arcoiris luminoso', 'Carrera a tres piernas', 'Tiro dinamita'],tipoTecnica:'tiro',
  desc:'Capitán y delantero del Fauxshore. Es uno de los jugadores más destacados del equipo.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r413.webp'
},

{
  id:'r414', equipo:'Fauxshore', nombre:'Spencer Duskplay', original:'Yarimichi Kuroda',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:80,defensa:61,especial:80,
  hissatsu:['Truco de magia', 'Granada doble', 'Golf total'],tipoTecnica:'regate',
  desc:'Centrocampista del Fauxshore de personalidad recta y gran capacidad para controlar el juego.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r414.webp'
},

{
  id:'r415', equipo:'Fauxshore', nombre:'Joe Poker', original:'Yuu Matsubayashi',
  posicion:'Delantero', tipo:'Fuego',
  tiro:73,pase:82,defensa:69,especial:78,
  hissatsu:['Truco de Magia', 'Carrera a tres piernas', 'Bateo total'],tipoTecnica:'regate',
  desc:'Uno de los jugadores destacados del Fauxshore, con buenas capacidades para mover el balón en el centro del campo.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r415.webp'
},

{
  id:'r416', equipo:'Fauxshore', nombre:'Maurice Badgame', original:'Morihito Ishiyama',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:67,defensa:74,especial:76,
  hissatsu:['Pared rocosa', 'El Muro', 'Paipay gigante'],tipoTecnica:'defensa',
  desc:'Defensa del Fauxshore especializado en detener las ofensivas rivales mediante su fortaleza física.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r416.webp'
},

{
  id:'r417', equipo:'Fauxshore', nombre:'Drancis Fake', original:'Drancis Fake',
  posicion:'Defensa', tipo:'Viento',
  tiro:35,pase:58,defensa:80,especial:80,
  hissatsu:['Campo Torbellino', 'Voltereta Círcense', 'Giro Bobina'],tipoTecnica:'defensa',
  desc:'Uno de los defensas del Fauxshore y uno de los jugadores más reconocibles de la plantilla.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r417.webp'
},

{
  id:'r418', equipo:'Triple C', nombre:'Daisy Fields', original:'Koi Dosu',
  posicion:'Portero', tipo:'Fuego',
  tiro:30,pase:57,defensa:79,especial:85,
  hissatsu:['Tormenta de pétalos', 'Escudo Protector', 'Uñas Afiladas'],tipoTecnica:'parada',
  desc:'Portera titular del Triple C de Osaka. Destaca por su técnica Tormenta de pétalos.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r418.webp'
},

{
  id:'r419', equipo:'Triple C', nombre:'Alexia Sand', original:'Koko Torahama',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:70,defensa:84,especial:78,
  hissatsu:['Pared de fuego', 'Voltereta Círcense', 'Confusión'],tipoTecnica:'defensa',
  desc:'Defensa del Triple C de Osaka que forma parte del once principal del equipo.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r419.webp'
},

{
  id:'r420', equipo:'Triple C', nombre:'Hellen Hearth', original:'Michiko Hori',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:68,defensa:82,especial:76,
  hissatsu:['Corte giratorio', 'Lecho de Rosas', 'Olor embriagador'],tipoTecnica:'defensa',
  desc:'Defensa del Triple C de Osaka y una de las jugadoras principales de su formación.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r420.webp'
},

{
  id:'r421', equipo:'Triple C', nombre:'Mary Moor', original:'Mari Tennoji',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:66,pase:83,defensa:62,especial:79,
  hissatsu:['Regate múltiple', 'Disparo Rodante', 'Bateo total'],tipoTecnica:'regate',
  desc:'Centrocampista del Triple C de Osaka con buenas capacidades para organizar el juego.',
  locked:true,cost:375,
  sprite:'https://inazumarun.es/assets/sprites/r421.webp'
},

{
  id:'r422', equipo:'Royal Academy Redux', nombre:'Caleb Stonewall', original:'Akio Fudou',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:89,pase:86,defensa:72,especial:91,
  hissatsu:['Pingüino emperador n.º 1', 'Arrollador 3/Coz 3', 'Estela ígnea'],tipoTecnica:'tiro',
  desc:'Capitán de la Royal Academy Redux. Fue uno de los jugadores clave en la creación del equipo por parte de Ray Dark.',
  locked:true,cost:440,
  sprite:'https://inazumarun.es/assets/sprites/r422.webp'
},

{
  id:'r423', equipo:'Royal Academy Redux', nombre:'Joseph King', original:'Genou Ishikawa',
  posicion:'Portero', tipo:'Fuego',
  tiro:32,pase:63,defensa:87,especial:91,
  hissatsu:['Colmillo de pantera', 'Escudo de Fuerza', 'Escudo de fuerza total'],tipoTecnica:'parada',
  desc:'Portero de la Royal Academy Redux y antiguo guardameta de la Royal Academy.',
  locked:true,cost:430,
  sprite:'https://inazumarun.es/assets/sprites/r423.webp'
},

{
  id:'r424', equipo:'Royal Academy Redux', nombre:'David Samford', original:'Jirou Sakuma',
  posicion:'Delantero', tipo:'Bosque',
  tiro:91,pase:79,defensa:48,especial:90,
  hissatsu:['Pingüino emperador n.º 1', 'Pingüino emperador n.º 2', 'Arrollador'],tipoTecnica:'tiro',
  desc:'Delantero de enorme talento que se unió temporalmente a la Royal Academy Redux junto a Joseph King.',
  locked:true,cost:435,
  sprite:'https://inazumarun.es/assets/sprites/r424.webp'
},

{
  id:'r425', equipo:'Royal Academy Redux', nombre:'Blade Healen', original:'Masaru Hyoudou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:68,defensa:87,especial:81,
  hissatsu:['Barrido defensivo', 'Defensa múltiple'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy Redux que destaca por su capacidad para contener los ataques rivales.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r425.webp'
},

{
  id:'r426', equipo:'Royal Academy Redux', nombre:'Rowan Beltzer', original:'Gouenjiro Beltzer',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:70,defensa:84,especial:78,
  hissatsu:['Barrido defensivo', 'Ciclón', 'Ciclón doble'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy Redux y uno de los jugadores habituales de su formación.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r426.webp'
},

{
  id:'r427', equipo:'Mary Times', nombre:'Rocky Black', original:'Rocky Black',
  posicion:'Portero', tipo:'Fuego',
  tiro:34,pase:61,defensa:78,especial:76,
  hissatsu:['Mano celestial', 'Volteador de mesas', 'Muralla tsunami'],tipoTecnica:'parada',
  desc:'Portero del Mary Times y uno de los miembros principales de su formación.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r427.webp'
},

// {
//   id:'r428', equipo:'Mary Times', nombre:'Cadence Soundtown', original:'Gakuya Otomura',
//   posicion:'Centrocampista', tipo:'Bosque',
//   tiro:72,pase:88,defensa:65,especial:86,
//   hissatsu:['Ritmo musical'],tipoTecnica:'regate',
//   desc:'Capitán del Mary Times en los videojuegos. Su pasión por la música marca el particular estilo de juego del equipo.',
//   locked:true,cost:405,
//   sprite:'https://inazumarun.es/assets/sprites/r428.webp'
// },

{
  id:'r429', equipo:'Mary Times', nombre:'Victor Hills', original:'Hills',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:71,defensa:83,especial:77,
  hissatsu:['Pared de roca', 'Emboscada defensiva', 'Apisonadora'],tipoTecnica:'defensa',
  desc:'Defensa del Mary Times y uno de los jugadores principales de su formación.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r429.webp'
},

{
  id:'r430', equipo:'Mary Times', nombre:'Hector Redding', original:'Redding',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:62,pase:79,defensa:66,especial:75,
  hissatsu:['Regate múltiple', 'Barrido Defensivo', 'Entrada de llamas'],tipoTecnica:'regate',
  desc:'Centrocampista del Mary Times que participa habitualmente en la formación del equipo.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r430.webp'
},

{
  id:'r431', equipo:'Mary Times', nombre:'Dora Delight', original:'Dora Delight',
  posicion:'Delantero', tipo:'Viento',
  tiro:78,pase:72,defensa:45,especial:78,
  hissatsu:['Tiro giratorio', 'Baile de Llamas', 'Robo veloz'],tipoTecnica:'tiro',
  desc:'Delantera del Mary Times y una de las jugadoras principales de la plantilla.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r431.webp'
},
{
  id:'r432', equipo:'Mary Times', nombre:'Spring Milipond', original:'Spring Milipond',
  posicion:'Delantero', tipo:'Viento',
  tiro:79,pase:76,defensa:45,especial:78,
  hissatsu:['Remate Tsunami'],tipoTecnica:'tiro',
  desc:'Delantero del Mary Times y uno de las jugadoras principales de la plantilla.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r432.webp'
},

{
"id":"r433","equipo":"Campeones Raimon","nombre":"Fletch Blitzen","original":"Blitzen",
"posicion":"Delantero","tipo":"Viento",
"tiro":85,"pase":67,"defensa":43,"especial":82,
"hissatsu":["Relámpago veloz","Tiro rotativo","Círculo de hielo"],"tipoTecnica":"tiro",
"desc":"Delantero japonés de elemento Viento, conocido por su enorme velocidad y capacidad para lanzarse rápidamente hacia la portería rival.",
"locked":true,"cost":400,
"sprite":"https://inazumarun.es/assets/sprites/r433.webp"
},
{
"id":"r434","equipo":"Campeones Raimon","nombre":"Zander Warmington","original":"Warmington",
"posicion":"Portero","tipo":"Fuego",
"tiro":32,"pase":63,"defensa":80,"especial":84,
"hissatsu":["Manos liberadas","Despeje de fuego"],"tipoTecnica":"parada",
"desc":"Portero titular del Raimon y uno de los jugadores que sostiene la defensa del equipo.",
"locked":true,"cost":410,
"sprite":"https://inazumarun.es/assets/sprites/r434.webp"
},
{
"id":"r435","equipo":"Campeones Raimon","nombre":"Viorain Maleby","original":"Maleby",
"posicion":"Defensa","tipo":"Bosque",
"tiro":43,"pase":68,"defensa":80,"especial":77,
"hissatsu":["Guardián férreo","Corte Mágico","Bobina eléctrica"],"tipoTecnica":"defensa",
"desc":"Defensa titular del Raimon. Aunque suele mostrarse negativo, sus observaciones ayudan al equipo a encontrar soluciones.",
"locked":true,"cost":405,
"sprite":"https://inazumarun.es/assets/sprites/r435.webp"
},
{
"id":"r436","equipo":"Campeones Raimon","nombre":"Clement Mariner","original":"Mariner",
"posicion":"Defensa","tipo":"Viento",
"tiro":47,"pase":66,"defensa":82,"especial":77,
"hissatsu":["Remolino acuático","Remate Tsunami"],"tipoTecnica":"defensa",
"desc":"Defensa titular del Raimon, amante de la natación y conocido por su personalidad despreocupada.",
"locked":true,"cost":395,
"sprite":"https://inazumarun.es/assets/sprites/r436.webp"
},
{
"id":"r437","equipo":"Campeones Raimon","nombre":"Boone Wretman","original":"Wretman",
"posicion":"Defensa","tipo":"Viento",
"tiro":45,"pase":70,"defensa":76,"especial":79,
"hissatsu":["Bloqueo defensivo","Mirada al futuro","Torre Inexpugnable"],"tipoTecnica":"defensa",
"desc":"Defensa titular del Raimon, especialista en analizar las situaciones del partido y elaborar estrategias.",
"locked":true,"cost":400,
"sprite":"https://inazumarun.es/assets/sprites/r437.webp"
},
{
"id":"r438","equipo":"Campeones Raimon","nombre":"Jazmine Carmine","original":"Matsuri Akasode",
"posicion":"Centrocampista","tipo":"Fuego",
"tiro":63,"pase":82,"defensa":59,"especial":80,
"hissatsu":["Brisa deslizante","Esferas luminosas","Ícaro"],"tipoTecnica":"regate",
"desc":"Centrocampista titular del Raimon. Aunque tiene una actitud sombría, participa habitualmente en las actividades del equipo.",
"locked":true,"cost":400,
"sprite":"https://inazumarun.es/assets/sprites/r438.webp"
},
{
"id":"r439","equipo":"Campeones Raimon","nombre":"Colton Sharps","original":"Sharps",
"posicion":"Centrocampista","tipo":"Bosque",
"tiro":65,"pase":83,"defensa":62,"especial":78,
"hissatsu":["Pase cruzado","Espejismo de balón","Pingüino emperador n.º 2"],"tipoTecnica":"pase",
"desc":"Centrocampista titular del Raimon y uno de los jugadores habituales del centro del campo.",
"locked":true,"cost":400,
"sprite":"https://inazumarun.es/assets/sprites/r439.webp"
},
{
"id":"r440","equipo":"Campeones Raimon","nombre":"Maddock Jackson","original":"Jackson",
"posicion":"Centrocampista","tipo":"Montaña",
"tiro":68,"pase":79,"defensa":64,"especial":77,
"hissatsu":["Placaje extremo","Remate Bahamut","Entrada de llamas"],"tipoTecnica":"regate",
"desc":"Centrocampista titular del Raimon con un estilo de juego físico y directo.",
"locked":true,"cost":400,
"sprite":"https://inazumarun.es/assets/sprites/r440.webp"
},
{
"id":"r441","equipo":"Campeones Raimon","nombre":"Eleanor Estrella","original":"Estrella",
"posicion":"Centrocampista","tipo":"Viento",
"tiro":71,"pase":82,"defensa":58,"especial":81,
"hissatsu":["Ícaro","Túnel tornado","Pasos aéreos"],"tipoTecnica":"regate",
"desc":"Centrocampista titular del Raimon y una de las jugadoras más destacadas de la formación.",
"locked":true,"cost":405,
"sprite":"https://inazumarun.es/assets/sprites/r441.webp"
},
{
"id":"r442","equipo":"Campeones Raimon","equiposExtra":["West Manor"],"nombre":"Darian Moonward","original":"Moonward",
"posicion":"Centrocampista","tipo":"Bosque",
"tiro":82,"pase":91,"defensa":76,"especial":89,
"hissatsu":["Remate Bahamut","Visto y no visto"],"tipoTecnica":"tiro",
"desc":"Capitán del Raimon y uno de los principales líderes del equipo. Destaca por su capacidad para dirigir el juego.",
"locked":true,"cost":430,
"sprite":"https://inazumarun.es/assets/sprites/r442.webp"
},
{
"id":"r443","equipo":"Campeones Raimon","equiposExtra":["West Manor"],"nombre":"Harper Evans","original":"Haru Endou",
"posicion":"Delantero","tipo":"Montaña",
"tiro":94,"pase":82,"defensa":46,"especial":93,
"hissatsu":["Chilena","Ruptura Relámpago","Baile de Llamas"],"tipoTecnica":"tiro",
"desc":"El delantero estrella del Raimon y conocido como el monstruo del fútbol. Es hijo de Mark Evans y lleva el dorsal 10.",
"locked":true,"cost":450,
"sprite":"https://inazumarun.es/assets/sprites/r443.webp"
},
{
"id":"r444","equipo":"Campeones Raimon","nombre":"Talon Lewis","original":"Lewis",
"posicion":"Delantero","tipo":"Bosque",
"tiro":84,"pase":71,"defensa":44,"especial":82,
"hissatsu":["Remate potente","Remate Bahamut","Pájaro de fuego"],"tipoTecnica":"tiro",
"desc":"Delantero titular del Raimon que forma junto a Harper una de las principales amenazas ofensivas del equipo.",
"locked":true,"cost":415,
"sprite":"https://inazumarun.es/assets/sprites/r444.webp"
},
{
"id":"r445","equipo":"Campeones Raimon","nombre":"Nino Gamberini","original":"Natsuki Ebihara",
"posicion":"Delantero","tipo":"Fuego",
"tiro":79,"pase":65,"defensa":42,"especial":75,
"hissatsu":["Remate ardiente","Triángulo ZZ","Baile de Llamas"],"tipoTecnica":"tiro",
"desc":"Delantero suplente del Raimon que espera su oportunidad para entrar al terreno de juego y reforzar el ataque.",
"locked":true,"cost":375,
"sprite":"https://inazumarun.es/assets/sprites/r445.webp"
},
{
"id":"r446","equipo":"Campeones Raimon","nombre":"Hortensia Raintree","original":"Raintree",
"posicion":"Defensa","tipo":"Bosque",
"tiro":41,"pase":64,"defensa":77,"especial":72,
"hissatsu":["Corte defensivo","Torre Inexpugnable","Baile de mariposas"],"tipoTecnica":"defensa",
"desc":"Defensa suplente del Raimon que forma parte de la segunda unidad del equipo.",
"locked":true,"cost":365,
"sprite":"https://inazumarun.es/assets/sprites/r446.webp"
},
{
"id":"r447","equipo":"Campeones Raimon","nombre":"Milan McGrath","original":"McGrath",
"posicion":"Defensa","tipo":"Viento",
"tiro":43,"pase":63,"defensa":76,"especial":71,
"hissatsu":["Bloqueo de viento","Regate espejismo","Remate Bahamut"],"tipoTecnica":"defensa",
"desc":"Defensa suplente del Raimon que puede entrar para aportar solidez a la línea defensiva.",
"locked":true,"cost":360,
"sprite":"https://inazumarun.es/assets/sprites/r447.webp"
},
{
"id":"r448","equipo":"Campeones Raimon","nombre":"Kaeo Springfield","original":"Reo Kasuga",
"posicion":"Centrocampista","tipo":"Bosque",
"tiro":61,"pase":78,"defensa":59,"especial":74,
"hissatsu":["Pase preciso","Campo de fuerza","Regate Aurora"],"tipoTecnica":"pase",
"desc":"Centrocampista suplente del Raimon que forma parte del banquillo del equipo.",
"locked":true,"cost":365,
"sprite":"https://inazumarun.es/assets/sprites/r448.webp"
},
{
"id":"r449","equipo":"Campeones Raimon","nombre":"Mami Sigdale","original":"Mami Sigdale",
"posicion":"Portero","tipo":"Montaña",
"tiro":54,"pase":70,"defensa":79,"especial":73,
"hissatsu":["Parada Celestial"],"tipoTecnica":"parada",
"desc":"Portera suplente del Raimon que espera su oportunidad para entrar al terreno de juego y reforzar la porteria.",
"locked":true,"cost":375,
"sprite":"https://inazumarun.es/assets/sprites/r449.webp"
},
{
"id":"r450","equipo":"Tormenta de Géminis","nombre":"Diam","original":"Dylan Bluemoon",
"posicion":"Delantero","tipo":"Fuego",
"tiro":83,"pase":69,"defensa":43,"especial":81,
"hissatsu":["Astro remate","Disparo cósmico","Cinto astral"],"tipoTecnica":"tiro",
"desc":"Delantero de Tormenta de Géminis (dorsal 11).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r450.webp"
},
{
"id":"r451","equipo":"Tormenta de Géminis","nombre":"Ryhm","original":"Rhona Countdown",
"posicion":"Delantero","tipo":"Viento",
"tiro":82,"pase":76,"defensa":38,"especial":72,
"hissatsu":["Disparo cósmico"],"tipoTecnica":"tiro",
"desc":"Delantera de Tormenta de Géminis (dorsal 9).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r451.webp"
},
{
"id":"r452","equipo":"Tormenta de Géminis","nombre":"Pandora","original":"Pat Box",
"posicion":"Centrocampista","tipo":"Bosque",
"tiro":62,"pase":76,"defensa":58,"especial":72,
"hissatsu":["Gravitación","Teleportación","Bomba géiser"],"tipoTecnica":"regate",
"desc":"Centrocampista de Tormenta de Géminis (dorsal 6).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r452.webp"
},
{
"id":"r453","equipo":"Tormenta de Géminis","nombre":"Galileo","original":"Gordon Star",
"posicion":"Portero","tipo":"Viento",
"tiro":26,"pase":56,"defensa":80,"especial":76,
"hissatsu":["Agujero negro","Agujero de gusano"],"tipoTecnica":"parada",
"desc":"Portero de Tormenta de Géminis (dorsal 1).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r453.webp"
},
{
"id":"r454","equipo":"Tormenta de Géminis","nombre":"Grengo","original":"Gregory Saturn",
"posicion":"Centrocampista","tipo":"Bosque",
"tiro":62,"pase":76,"defensa":58,"especial":72,
"hissatsu":["Teleportación","Gravitación","Lanza de odín"],"tipoTecnica":"regate",
"desc":"Centrocampista de Tormenta de Géminis (dorsal 7).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r454.webp"
},
{
"id":"r455","equipo":"Épsilon","nombre":"Metron","original":"Ronny Metcalf",
"posicion":"Delantero","tipo":"Fuego",
"tiro":87,"pase":73,"defensa":47,"especial":85,
"hissatsu":["Remate de Gaia","Lluvia de meteoros"],"tipoTecnica":"tiro",
"desc":"Delantero de Épsilon (dorsal 10).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r455.webp"
},
{
"id":"r456","equipo":"Épsilon","nombre":"Kenville","original":"Craven Kenville",
"posicion":"Defensa","tipo":"Bosque",
"tiro":45,"pase":68,"defensa":80,"especial":74,
"hissatsu":["Teleportación","Gravedad grave","Cinto astral"],"tipoTecnica":"defensa",
"desc":"Defensa de Épsilon (dorsal 2).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r456.webp"
},
{
"id":"r457","equipo":"Épsilon","nombre":"Fedora","original":"Mads Hatter",
"posicion":"Centrocampista","tipo":"Bosque",
"tiro":66,"pase":80,"defensa":62,"especial":76,
"hissatsu":["Lluvia de meteoros","Flash de fotones"],"tipoTecnica":"regate",
"desc":"Centrocampista de Épsilon (dorsal 6).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r457.webp"
},
{
"id":"r458","equipo":"Épsilon","nombre":"Sworm","original":"Yakker Plantsworm",
"posicion":"Centrocampista","tipo":"Viento",
"tiro":66,"pase":80,"defensa":62,"especial":76,
"hissatsu":["Lluvia de meteoros","Flash de fotones"],"tipoTecnica":"regate",
"desc":"Centrocampista de Épsilon (dorsal 8).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r458.webp"
},
{
"id":"r459","equipo":"Épsilon","nombre":"Mercury","original":"Carrie McCuring",
"posicion":"Delantero","tipo":"Fuego",
"tiro":84,"pase":70,"defensa":44,"especial":82,
"hissatsu":["Remate de Gaia","Lluvia de meteoros"],"tipoTecnica":"tiro",
"desc":"Delantero de Épsilon (dorsal 9).",
"locked":true,"cost":390,
"sprite":"https://inazumarun.es/assets/sprites/r459.webp"
},
{
"id":"r460","equipo":"Épsilon Plus","nombre":"Metron Osc.","original":"Ronny Metcalf",
"posicion":"Delantero","tipo":"Fuego",
"tiro":88,"pase":78,"defensa":52,"especial":85,
"hissatsu":["Lluvia de meteoros","Remate de Gaia","Teleportación"],"tipoTecnica":"tiro",
"desc":"Versión oscura de Metron, dorsal 10 del Épsilon Plus, el equipo potenciado por la Piedra Alius.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r460.webp"
},
{
"id":"r461","equipo":"Épsilon Plus","nombre":"Kenville Osc.","original":"Craven Kenville",
"posicion":"Defensa","tipo":"Bosque",
"tiro":50,"pase":73,"defensa":85,"especial":79,
"hissatsu":["Gravedad grave","Teleportación"],"tipoTecnica":"defensa",
"desc":"Versión oscura de Kenville, dorsal 2 del Épsilon Plus, el equipo potenciado por la Piedra Alius.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r461.webp"
},
{
"id":"r462","equipo":"Épsilon Plus","nombre":"Fedora Osc.","original":"Mads Hatter",
"posicion":"Centrocampista","tipo":"Bosque",
"tiro":73,"pase":87,"defensa":69,"especial":83,
"hissatsu":["Lluvia de meteoros","Flash de fotones"],"tipoTecnica":"regate",
"desc":"Versión oscura de Fedora, dorsal 6 del Épsilon Plus, el equipo potenciado por la Piedra Alius.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r462.webp"
},
{
"id":"r463","equipo":"Épsilon Plus","nombre":"Sworm Osc.","original":"Yakker Plantsworm",
"posicion":"Centrocampista","tipo":"Viento",
"tiro":73,"pase":87,"defensa":69,"especial":83,
"hissatsu":["Lluvia de meteoros"],"tipoTecnica":"regate",
"desc":"Versión oscura de Sworm, dorsal 8 del Épsilon Plus, el equipo potenciado por la Piedra Alius.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r463.webp"
},
{
"id":"r464","equipo":"Épsilon Plus","nombre":"Mercury Osc.","original":"Carrie McCuring",
"posicion":"Delantero","tipo":"Fuego",
"tiro":89,"pase":78,"defensa":49,"especial":87,
"hissatsu":["Remate de Gaia"],"tipoTecnica":"tiro",
"desc":"Versión oscura de Mercury, dorsal 9 del Épsilon Plus, el equipo potenciado por la Piedra Alius.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r464.webp"
},
{
"id":"r465","equipo":"Earth Eleven","nombre":"Falco Osc.","original":"Matatagi Hayato",
"posicion":"Delantero","tipo":"Viento",
"tiro":86,"pase":84,"defensa":49,"especial":87,
"hissatsu":["Taconazo Parkour v2","Alba Oscura","Poder parkour"],"tipoTecnica":"tiro",
"desc":"Versión oscura de Falco.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r465.png"
},
{
"id":"r466","equipo":"Earth Eleven","nombre":"Buddy Fury","original":"Kusaka Ryuuji",
"posicion":"Centrocampista","tipo":"Montaña",
"tiro":73,"pase":72,"defensa":65,"especial":64,
"hissatsu":["Cabezazo catapulta","Mirada amenazante","Muro de Hierro"],"tipoTecnica":"tiro",
"desc":"Centrocampista risueño de earth eleven.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r466.png"
},
{
"id":"r467","equipo":"Earth Eleven","nombre":"Buddy Osc.","original":"Kusaka Ryuuji",
"posicion":"Centrocampista","tipo":"Montaña",
"tiro":84,"pase":84,"defensa":82,"especial":80,
"hissatsu":["Cabezazo catapulta v2","Mirada amenazante","Muro de Hierro"],"tipoTecnica":"tiro",
"desc":"Versión oscura de Buddy Fury.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r467.png"
},
{
"id":"r468","equipo":"Earth Eleven","nombre":"Zack Avalon","original":"Zack Avalon",
"posicion":"Delantero","tipo":"Montaña",
"tiro":86,"pase":80,"defensa":32,"especial":80,
"hissatsu":["Golpe Kabuki","Ruptura kabuki"],"tipoTecnica":"tiro",
"desc":"Antepasado de Zanark.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r468.png"
},
{
"id":"r469","equipo":"Zanark Domain","nombre":"Zanark Osc.","original":"Zanark Osc.",
"posicion":"Delantero","tipo":"Montaña",
"tiro":90,"pase":84,"defensa":32,"especial":86,
"hissatsu":["Golpe Cataclismo V2"],"tipoTecnica":"tiro",
"desc":"Zanark Miximax con Caocao",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r469.webp"
},
{
"id":"r470","equipo":"Earth Eleven","nombre":"Impostor de Victor","original":"Impostor de Victor",
"posicion":"Delantero","tipo":"Fuego",
"tiro":84,"pase":79,"defensa":32,"especial":80,
"hissatsu":["Tijera fulminante"],"tipoTecnica":"tiro",
"desc":"Impostor de Victor Blade.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r470.png"
},
{
"id":"r471","equipo":"Magmavis","equiposExtra":["Falam Medius","Silica"],"nombre":"Ogar Circes","original":"Varga Sachs",
"posicion":"Defensa","tipo":"Montaña",
"tiro":40,"pase":87,"defensa":89,"especial":85,
"hissatsu":["Maza rocosa","Deriva desértica","Muralla de Atlantis"],"tipoTecnica":"defensa",
"desc":"Defensa Extraterrestre.",
"locked":true,"cost":420,
"sprite":"https://inazumarun.es/assets/sprites/r471.webp"
},

// {
//   id:'r484', equipo:'Unicorn', nombre:'Mark Krueger', original:'Mark Krueger',
//   posicion:'Centrocampista', tipo:'Bosque',
//   tiro:86,pase:88,defensa:68,especial:87,
//   hissatsu:['Unicornio explosivo'],tipoTecnica:'tiro',
//   desc:'Capitán y as del Unicorn. Es uno de los jugadores más importantes de Estados Unidos.',
//   locked:true,cost:420,
//   sprite:'https://inazumarun.es/assets/sprites/r484.webp'
// },
// {
//   id:'r485', equipo:'Unicorn', nombre:'Dylan Keats', original:'Dylan Keats',
//   posicion:'Delantero', tipo:'Fuego',
//   tiro:88,pase:67,defensa:43,especial:84,
//   hissatsu:['Tridente de fuego'],tipoTecnica:'tiro',
//   desc:'Delantero estrella del Unicorn, famoso por su capacidad goleadora.',
//   locked:true,cost:410,
//   sprite:'https://inazumarun.es/assets/sprites/r485.webp'
// },
{
  id:'r486', equipo:'Unicorn', nombre:'Erik Eagle (IE3)', original:'Kazuya Ichinose',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:83,defensa:76,especial:85,
  hissatsu:['El huracán', 'Tiro Giratorio', 'Espejismo de balón'],tipoTecnica:'regate',
  desc:'Centrocampista del Unicorn y viejo conocido de Raimon. Un jugador extremadamente completo.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r486.webp'
},
{
  id:'r487', equipo:'Unicorn', nombre:'Bobby Shearer (IE3)', original:'Asuka Domon',
  posicion:'Defensa', tipo:'Bosque',
  tiro:57,pase:78,defensa:84,especial:79,
  hissatsu:['Muralla defensiva', 'Barrido Defensivo', 'Tornado Inverso'],tipoTecnica:'defensa',
  desc:'Defensa del Unicorn y compañero inseparable de Erik.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r487.webp'
},
{
  id:'r488', equipo:'Unicorn', nombre:'Gabriel Jax', original:'Gabriel Jax',
  posicion:'Delantero', tipo:'Montaña',
  tiro:78,pase:79,defensa:39,especial:72,
  hissatsu:['Tornado de tigre', 'Tripegaso'],tipoTecnica:'tiro',
  desc:'Delantero del Unicorn que completa el potente ataque estadounidense.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r488.webp'
},

{
  id:'r489', equipo:'Os Reis', nombre:'Falcão Da Silva', original:'Falcão Da Silva',
  posicion:'Portero', tipo:'Montaña',
  tiro:27,pase:58,defensa:83,especial:88,
  hissatsu:['Mano del Amazonas', 'Parada de Capoeira', 'Barajeo topo'],tipoTecnica:'portero',
  desc:'Portero titular de Os Reis, famoso por sus extraordinarios reflejos.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r489.webp'
},
{
  id:'r490', equipo:'Os Reis', nombre:'Carlos Lagarto', original:'Carlos Lagarto',
  posicion:'Defensa', tipo:'Bosque',
  tiro:49,pase:81,defensa:82,especial:80,
  hissatsu:['Samba defensiva', 'Ultra lunar', 'Entrada rodante'],tipoTecnica:'defensa',
  desc:'Defensa de Os Reis que se mueve con un estilo de juego inspirado en la samba.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r490.webp'
},
{
  id:'r491', equipo:'Os Reis', nombre:'Formiga Clemens', original:'Formiga Clemens',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:74,defensa:80,especial:76,
  hissatsu:['Carrera a tres piernas', 'Corte Volcánico', 'Lanzallamas'],tipoTecnica:'defensa',
  desc:'Defensa de Os Reis conocido por su pequeño tamaño y su enorme resistencia.',
  locked:true,cost:375,
  sprite:'https://inazumarun.es/assets/sprites/r491.webp'
},
{
  id:'r492', equipo:'Os Reis', nombre:'Leonardo Almeida', original:'Leonardo Almeida',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:75,pase:80,defensa:80,especial:78,
  hissatsu:['Pase brasileño', 'Cruz del sur', 'Entrada rodante'],tipoTecnica:'pase',
  desc:'Centrocampista de Os Reis que representa a una familia con una larga tradición futbolística.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r492.webp'
},
{
  id:'r493', equipo:'Os Reis', nombre:'Tigre Mendes', original:'Tigre Mendes',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:75,pase:78,defensa:75,especial:76,
  hissatsu:['Tornado inverso', 'Carrera a tres piernas', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Centrocampista de Os Reis que aumenta su intensidad conforme avanza el partido.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r493.webp'
},

{
  id:'r494', equipo:'Pequeños Gigantes', nombre:'Zephyr Vitesse', original:'Windy Fasta',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:83,defensa:82,especial:78,
  hissatsu:['Gran vendaval', 'Huracán', 'Patín Aereo'],tipoTecnica:'defensa',
  desc:'Defensa de los Pequeños Gigantes y viejo amigo de Héctor Helio.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r494.webp'
},
{
  id:'r495', equipo:'Pequeños Gigantes', nombre:'Walter Mountain', original:'Mountain',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:79,defensa:86,especial:76,
  hissatsu:['Gran seísmo', 'La montaña', 'Barajeo topo'],tipoTecnica:'defensa',
  desc:'Defensa corpulento de los Pequeños Gigantes, inspirado en Jack Wallside.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r495.webp'
},
{
  id:'r496', equipo:'Pequeños Gigantes', nombre:'Gareth Flare', original:'Gareth Flare',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:75,defensa:40,especial:87,
  hissatsu:['Disparo dual', 'Tornado de Fuego', 'Baile de Llamas'],tipoTecnica:'tiro',
  desc:'Delantero estrella de los Pequeños Gigantes y hermano de la jugadora que los acompaña.',
  locked:true,cost:410,
  sprite:'https://inazumarun.es/assets/sprites/r496.webp'
},
{
  id:'r497', equipo:'Pequeños Gigantes', nombre:'Drago Hill', original:'Drago Hill',
  posicion:'Delantero', tipo:'Bosque',
  tiro:87,pase:78,defensa:43,especial:84,
  hissatsu:['Mandíbulas dobles', 'Patín Aereo', 'Remate Dragón'],tipoTecnica:'tiro',
  desc:'Delantero de los Pequeños Gigantes que mantiene una fuerte rivalidad con Gareth Flare.',
  locked:true,cost:405,
  sprite:'https://inazumarun.es/assets/sprites/r497.webp'
},
{
  id:'r498', equipo:'Pequeños Gigantes', nombre:'Maximino Cruz', original:'Maximino',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:78,defensa:78,especial:78,
  hissatsu:['Patín Aereo', 'Remate de Gaia'],tipoTecnica:'tirregate',
  desc:'Centrocampista de los Pequeños Gigantes y contraparte de Max.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r498.webp'
},

{
  id:'r499', equipo:'Leones del desierto', nombre:'Nasir Mustafa', original:'Nasser Mustafa',
  posicion:'Portero', tipo:'Fuego',
  tiro:26,pase:54,defensa:81,especial:83,
  hissatsu:['Manos del desierto', 'Simún', 'Puño Vengativo'],tipoTecnica:'portero',
  desc:'Portero titular de los Leones del Desierto. Solo puede regresar a casa después de anunciar una victoria.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r499.webp'
},
{
  id:'r500', equipo:'Leones del desierto', nombre:'Faraz Farooq', original:'Faraz Farooq',
  posicion:'Defensa', tipo:'Bosque',
  tiro:47,pase:58,defensa:79,especial:70,
  hissatsu:['Muralla de arena', 'Confusión', 'Regate espejismo'],tipoTecnica:'defensa',
  desc:'Defensa de los Leones del Desierto, famoso por sus habilidades culinarias con dátiles.',
  locked:true,cost:360,
  sprite:'https://inazumarun.es/assets/sprites/r500.webp'
},
{
  id:'r501', equipo:'Leones del desierto', nombre:'Jamila Wali', original:'Jamila Wali',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:61,defensa:81,especial:72,
  hissatsu:['Muro del desierto', 'Ciclón doble', 'Pase Cruzado'],tipoTecnica:'defensa',
  desc:'Defensa de los Leones del Desierto con una gran pasión por viajar.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r501.webp'
},
{
  id:'r502', equipo:'Leones del desierto', nombre:'Musa Sylla', original:'Musa Sylla',
  posicion:'Defensa', tipo:'Bosque',
  tiro:43,pase:63,defensa:80,especial:68,
  hissatsu:['Corte del oasis', 'El Muro', 'Confusión'],tipoTecnica:'defensa',
  desc:'Defensa de los Leones del Desierto interesado en mejorar la industria de su país.',
  locked:true,cost:360,
  sprite:'https://inazumarun.es/assets/sprites/r502.webp'
},
{
  id:'r503', equipo:'Leones del desierto', nombre:'Yusuf Massoud', original:'Yusuf Massoud',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:61,pase:73,defensa:55,especial:69,
  hissatsu:['Danza del desierto', 'Entrada Tormenta', 'Carrera relámpago'],tipoTecnica:'regate',
  desc:'Centrocampista de los Leones del Desierto profundamente ligado a las tradiciones tribales.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r503.webp'
},

{
  id:'r504', equipo:'Big Waves', nombre:'Gene Whalon', original:'Jean Baker',
  posicion:'Portero', tipo:'Viento',
  tiro:25,pase:55,defensa:82,especial:86,
  hissatsu:['Parada oceánica', 'Muralla tsunami', 'Gran barrera de coral'],tipoTecnica:'portero',
  desc:'Portero estrella de Australia y uno de los principales jugadores de los Big Waves.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r504.webp'
},
{
  id:'r505', equipo:'Big Waves', nombre:'David Waterman', original:'David Waterman',
  posicion:'Defensa', tipo:'Viento',
  tiro:46,pase:64,defensa:78,especial:70,
  hissatsu:['Muro de coral', 'Cruz del sur', 'Dientes de roca'],tipoTecnica:'defensa',
  desc:'Defensa de los Big Waves que antes practicaba fútbol australiano.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r505.webp'
},
{
  id:'r506', equipo:'Big Waves', nombre:'Shawn Princeton', original:'Shawn Princeton',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:64,pase:76,defensa:58,especial:72,
  hissatsu:['Excavación relámpago', 'Bomba géiser', 'Dientes de roca'],tipoTecnica:'regate',
  desc:'Centrocampista de los Big Waves con un talento especial para encontrar minerales.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r506.webp'
},
{
  id:'r507', equipo:'Big Waves', nombre:'Hamilton Reith', original:'Hamilton Reith',
  posicion:'Delantero', tipo:'Bosque',
  tiro:79,pase:59,defensa:40,especial:73,
  hissatsu:['Megalodon', 'Regate múltiple'],tipoTecnica:'tiro',
  desc:'Delantero de los Big Waves apasionado por el buceo y la vida marina.',
  locked:true,cost:375,
  sprite:'https://inazumarun.es/assets/sprites/r507.webp'
},
{
  id:'r508', equipo:'Big Waves', nombre:'Joe Dawes', original:'Joe Jones',
  posicion:'Delantero', tipo:'Fuego',
  tiro:77,pase:55,defensa:38,especial:70,
  hissatsu:['Mordisco de tiburón', 'Bomba géiser', 'Mega Terremoto'],tipoTecnica:'tiro',
  desc:'Delantero de los Big Waves que espera pacientemente antes de lanzarse sobre sus rivales.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r508.webp'
},
{
  id:'r509', equipo:'Dragones de Fuego', nombre:'Byron Love IE3', original:'Terumi Afuro',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:91,pase:86,defensa:80,especial:92,
  hissatsu:['Remate celestial', 'Sabiduría Divina', 'Hora Celestial'],tipoTecnica:'tiro',
  desc:'As de los Dragones de Fuego y uno de sus jugadores más decisivos. Su técnica y visión de juego lo convierten en una amenaza constante.',
  locked:true,cost:430,
  sprite:'https://inazumarun.es/assets/sprites/r509.webp'
},
{
  id:'r510', equipo:'Dragones de Fuego', nombre:'Claude Beacons IE3', original:'Haruya Nagumo',
  posicion:'Delantero', tipo:'Fuego',
  tiro:90,pase:80,defensa:42,especial:88,
  hissatsu:['Llamarada atómica', 'Ventisca de fuego', 'Balón galgo'],tipoTecnica:'tiro',
  desc:'Delantero de los Dragones de Fuego conocido como Torch. Su potencia ofensiva es una de las grandes armas de Corea.',
  locked:true,cost:420,
  sprite:'https://inazumarun.es/assets/sprites/r510.webp'
},
{
  id:'r511', equipo:'Dragones de Fuego', nombre:'Bryce Whitingale IE3', original:'Fuusuke Suzuno',
  posicion:'Delantero', tipo:'Viento',
  tiro:89,pase:84,defensa:43,especial:88,
  hissatsu:['Balón iceberg', 'Ventisca de fuego', 'Hora Celestial'],tipoTecnica:'tiro',
  desc:'Delantero de los Dragones de Fuego conocido como Gazelle. Su velocidad y sus técnicas de hielo lo hacen especialmente peligroso.',
  locked:true,cost:420,
  sprite:'https://inazumarun.es/assets/sprites/r511.webp'
},
{
  id:'r512', equipo:'Dragones de Fuego', nombre:'Enyong Kim', original:'Kim Eunyeong',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:61,pase:69,defensa:65,especial:71,
  hissatsu:['Tacón infernal', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Dragones de Fuego que forma parte del bloque principal de la selección coreana.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r512.webp'
},

{
  id:'r513', equipo:'Knights', nombre:'Freddie McQueen', original:'Freddie McQueen',
  posicion:'Portero', tipo:'Viento',
  tiro:24,pase:55,defensa:79,especial:82,
  hissatsu:['Manos de caballero', 'Muralla de escudos', 'Espada Defensora'],tipoTecnica:'portero',
  desc:'Portero titular de los Knights of Queen y primera línea defensiva de la selección inglesa.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r513.webp'
},
{
  id:'r514', equipo:'Knights', nombre:'Johnny Gascoigne', original:'Johnny Gascoigne',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:57,defensa:78,especial:69,
  hissatsu:['Muro de hierro', 'Emboscada defensiva', 'Jaula de piedra'],tipoTecnica:'defensa',
  desc:'Defensa titular de los Knights of Queen que forma parte de la sólida línea defensiva inglesa.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r514.webp'
},
{
  id:'r515', equipo:'Knights', nombre:'David Buckingham', original:'David Buckingham',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:62,defensa:81,especial:73,
  hissatsu:['Defensa pingüino', 'Pingüino emperador n.º 2', 'Jaula de piedra'],tipoTecnica:'defensa',
  desc:'Defensa de los Knights of Queen. Su nombre y apariencia hacen referencia a la tradición de la guardia británica.',
  locked:true,cost:375,
  sprite:'https://inazumarun.es/assets/sprites/r515.webp'
},
{
  id:'r516', equipo:'Knights', nombre:'Lance Rotten', original:'Lance Rotten',
  posicion:'Defensa', tipo:'Viento',
  tiro:46,pase:59,defensa:76,especial:68,
  hissatsu:['Robo veloz', 'Jaula de piedra', 'Espada Defensora'],tipoTecnica:'defensa',
  desc:'Defensa titular de los Knights of Queen que ayuda a mantener la estructura defensiva inglesa.',
  locked:true,cost:360,
  sprite:'https://inazumarun.es/assets/sprites/r516.webp'
},
{
  id:'r517', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Lee Canthrup', original:'Lee Canthrup',
  posicion:'Portero', tipo:'Fuego',
  tiro:34,pase:56,defensa:84,especial:83,
  hissatsu:['Manos liberadas','Puente sin final'],tipoTecnica:'portero',
  desc:'Portero titular de las Criaturas de la Noche, procedente del Aullido Lunar.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r517.webp'
},
{
  id:'r518', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Gerald Fuss', original:'Gerald Fuss',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:62,defensa:80,especial:80,
  hissatsu:['Proyectil de ozono', 'Luz Cegadora', 'Avance chispeante'],tipoTecnica:'defensa',
  desc:'Defensa de las Criaturas de la Noche, procedente del Aullido Lunar.',
  locked:true,cost:194,
  sprite:'https://inazumarun.es/assets/sprites/r518.webp'
},
{
  id:'r519', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Kym Errer', original:'Kym Errer',
  posicion:'Defensa', tipo:'Viento',
  tiro:46,pase:64,defensa:81,especial:81,
  hissatsu:['Proyectil de ozono', 'Estrella de roca', 'Danza del viento'],tipoTecnica:'defensa',
  desc:'Defensa de las Criaturas de la Noche, procedente del Aullido Lunar.',
  locked:true,cost:194,
  sprite:'https://inazumarun.es/assets/sprites/r519.webp'
},
{
  id:'r520', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Terri Ann Thrope', original:'Terri Ann Thrope',
  posicion:'Delantero', tipo:'Viento',
  tiro:82,pase:74,defensa:44,especial:84,
  hissatsu:['Lanza letal', 'Tormenta Dimensional', 'Ruptura relámpago'],tipoTecnica:'tiro',
  desc:'Delantera del Aullido Lunar que juega de centrocampista en las Criaturas de la Noche.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r520.webp'
},
{
  id:'r521', equipo:'Criaturas de la Noche', equiposExtra:['Nosfanáticos'], nombre:'Dave Walker', original:'Dave Walker',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:66,pase:80,defensa:68,especial:82,
  hissatsu:['Corriente negra', 'Círculo de hielo', 'Golpe de vacío'],tipoTecnica:'regate',
  desc:'Centrocampista de las Criaturas de la Noche, procedente de los Nosfanáticos.',
  locked:true,cost:194,
  sprite:'https://inazumarun.es/assets/sprites/r521.webp'
},
{
  id:'r522', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Luke Kayon', original:'Luke Kayon',
  posicion:'Delantero', tipo:'Montaña',
  tiro:83,pase:72,defensa:45,especial:85,
  hissatsu:['Aguijón letal', 'Aullido de Licántropo', 'Dragón ascendente'],tipoTecnica:'tiro',
  desc:'Delantero de las Criaturas de la Noche, procedente del Aullido Lunar.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r522.webp'
},
{
  id:'r523', equipo:'Criaturas de la Noche', equiposExtra:['Nosfanáticos'], nombre:'Nora Flexion', original:'Nora Flexion',
  posicion:'Delantero', tipo:'Bosque',
  tiro:84,pase:73,defensa:42,especial:86,
  hissatsu:['Pingüino emperador 7', 'Golpe cataclismo', 'Giro atómico'],tipoTecnica:'tiro',
  desc:'Delantera de las Criaturas de la Noche, procedente de los Nosfanáticos.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r523.webp'
},
{
  id:'r524', equipo:'Protocolo Omega', equiposExtra:['Protocolo Omega 2.0', 'El Dorado 01', 'Élite Omega'], nombre:'Hotel', original:'Hotel',
  posicion:'Portero', tipo:'Montaña',
  tiro:34,pase:57,defensa:83,especial:80,
  hissatsu:['Giroparada', 'Captura excelente', 'Aplastamiento'],tipoTecnica:'portero',
  desc:'Guardameta del Protocolo Omega y del Protocolo Omega 2.0.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r524.webp'
},
{
  id:'r525', equipo:'Protocolo Omega', equiposExtra:['Protocolo Omega 2.0', 'Protocolo Omega 3.0', 'El Dorado 01', 'El Dorado 03', 'Élite Omega'], nombre:'Oscar', original:'Oscar',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:60,defensa:81,especial:79,
  hissatsu:['Bobina eléctrica', 'Magnetismo', 'Captura excelente'],tipoTecnica:'defensa',
  desc:'Defensa fijo en las tres versiones del Protocolo Omega.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r525.webp'
},
{
  id:'r526', equipo:'Protocolo Omega', equiposExtra:['Protocolo Omega 2.0', 'El Dorado 01', 'Élite Omega'], nombre:'Golf', original:'Golf',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:61,defensa:79,especial:77,
  hissatsu:['Bobina eléctrica', 'Barrena voladora'],tipoTecnica:'defensa',
  desc:'Defensa del Protocolo Omega y del Protocolo Omega 2.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r526.webp'
},
{
  id:'r527', equipo:'Protocolo Omega', equiposExtra:['Protocolo Omega 2.0', 'Protocolo Omega 3.0', 'El Dorado 01', 'Élite Omega'], nombre:'Lima', original:'Lima',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:68,pase:79,defensa:64,especial:79,
  hissatsu:['Choque directo', 'Cascabel', 'Barrena voladora'],tipoTecnica:'regate',
  desc:'Centrocampista fijo en las tres versiones del Protocolo Omega.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r527.webp'
},
{
  id:'r528', equipo:'Protocolo Omega', equiposExtra:['Protocolo Omega 2.0', 'El Dorado 02'], nombre:'India', original:'India',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:77,defensa:60,especial:78,
  hissatsu:['Flecha de cupido', 'Barrena voladora', 'Bobina eléctrica'],tipoTecnica:'tiro',
  desc:'Centrocampista del Protocolo Omega y del Protocolo Omega 2.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r528.webp'
},
{
  id:'r529', equipo:'Protocolo Omega', equiposExtra:['Protocolo Omega 2.0', 'Protocolo Omega 3.0', 'El Dorado 01', 'El Dorado 03', 'Élite Omega'], nombre:'Julieta', original:'Julieta',
  posicion:'Delantero', tipo:'Viento',
  tiro:81,pase:72,defensa:42,especial:79,
  hissatsu:['Tiro magnético', 'Balón de plasma'],tipoTecnica:'tiro',
  desc:'Delantera fija en las tres versiones del Protocolo Omega.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r529.webp'
},
{
  id:'r530', equipo:'Protocolo Omega', equiposExtra:['Protocolo Omega 2.0', 'Protocolo Omega 3.0', 'El Dorado 02', 'Élite Omega'], nombre:'Mike', original:'Mike',
  posicion:'Delantero', tipo:'Bosque',
  tiro:82,pase:71,defensa:43,especial:80,
  hissatsu:['Tijera fulminante', 'Tiro magnético', 'Visto y no visto'],tipoTecnica:'tiro',
  desc:'Delantero fijo en las tres versiones del Protocolo Omega.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r530.webp'
},
{
  id:'r531', equipo:'Protocolo Omega 2.0', equiposExtra:['Protocolo Omega 3.0', 'El Dorado 01', 'El Dorado 02', 'Élite Omega'], nombre:'Kilo', original:'Kilo',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:60,defensa:80,especial:78,
  hissatsu:['Magnetismo', 'Piroquinesis', 'Bobina eléctrica'],tipoTecnica:'defensa',
  desc:'Defensa del Protocolo Omega 2.0 y del Protocolo Omega 3.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r531.webp'
},
{
  id:'r532', equipo:'Protocolo Omega 2.0', equiposExtra:['Protocolo Omega 3.0', 'El Dorado 01', 'El Dorado 02', 'Élite Omega'], nombre:'Noviembre', original:'Noviembre',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:66,pase:76,defensa:68,especial:78,
  hissatsu:['Picadora', 'Flecha de cupido'],tipoTecnica:'defensa',
  desc:'Centrocampista del Protocolo Omega 2.0 y del Protocolo Omega 3.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r532.webp'
},
{
  id:'r533', equipo:'Protocolo Omega 3.0', equiposExtra:['El Dorado 02', 'Élite Omega'], nombre:'Romeo', original:'Romeo',
  posicion:'Portero', tipo:'Viento',
  tiro:33,pase:56,defensa:84,especial:81,
  hissatsu:['Giroparada', 'Agujero de gusano'],tipoTecnica:'portero',
  desc:'Guardameta del Protocolo Omega 3.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r533.webp'
},
{
  id:'r534', equipo:'Protocolo Omega 3.0', equiposExtra:['El Dorado 02', 'Élite Omega'], nombre:'Papa', original:'Papa',
  posicion:'Defensa', tipo:'Fuego',
  tiro:47,pase:59,defensa:80,especial:78,
  hissatsu:['Magnetismo', 'Barreno de fuego', 'Picadora'],tipoTecnica:'defensa',
  desc:'Defensa del Protocolo Omega 3.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r534.webp'
},
{
  id:'r535', equipo:'Protocolo Omega 3.0', equiposExtra:['El Dorado 03', 'Élite Omega'], nombre:'Quebec', original:'Quebec',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:67,pase:77,defensa:63,especial:78,
  hissatsu:['Choque directo', 'Balón de plasma'],tipoTecnica:'regate',
  desc:'Centrocampista del Protocolo Omega 3.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r535.webp'
},
{
  id:'r536', equipo:'Protocolo Omega 3.0', equiposExtra:['El Dorado 01', 'El Dorado 03', 'Élite Omega'], nombre:'Sierra', original:'Sierra',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:71,pase:76,defensa:58,especial:79,
  hissatsu:['Choque directo', 'Tiro sobrenatural', 'Balón de plasma'],tipoTecnica:'regate',
  desc:'Centrocampista del Protocolo Omega 3.0.',
  locked:true,cost:185,
  sprite:'https://inazumarun.es/assets/sprites/r536.webp'
},
// Once titular de los equipos de la Temporada 1 que faltaban (Royal
// Academy, Zeus, Kirkwood, Brain, Otaku, Shuriken, Farm, Inazuma Kids,
// Sallys y Veteranos Inazuma), con nombre, posición, elemento y técnicas
// de Victory Road; sprites con scripts/descargar-sprites.py.
{
  id:'r537', equipo:'Royal Academy', nombre:'Peter Drent', original:'Oono Densuke',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:60,defensa:80,especial:72,
  hissatsu:['Terremoto', 'Espejismo de balón', 'Disparo con Rebotes'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy, dorsal 2.',
  locked:true,cost:140,
  sprite:'https://inazumarun.es/assets/sprites/r537.webp'
},
{
  id:'r538', equipo:'Royal Academy', nombre:'Ben Simmons', original:'Banjou Kazumichi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:59,defensa:81,especial:72,
  hissatsu:['Ciclón', 'Barrido defensivo', 'Arrollador'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy, dorsal 3.',
  locked:true,cost:140,
  sprite:'https://inazumarun.es/assets/sprites/r538.webp'
},
{
  id:'r539', equipo:'Royal Academy', nombre:'Gus Martin', original:'Gojou Masaru',
  posicion:'Defensa', tipo:'Bosque',
  tiro:43,pase:60,defensa:80,especial:72,
  hissatsu:['Barrido defensivo', 'Regate múltiple', 'Escáner Ataque'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy, dorsal 5.',
  locked:true,cost:140,
  sprite:'https://inazumarun.es/assets/sprites/r539.webp'
},
{
  id:'r540', equipo:'Royal Academy', nombre:'Herman Waldon', original:'Henmi Wataru',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:79,defensa:58,especial:70,
  hissatsu:['Barrido defensivo', 'Ciclón', 'Triangulo letal'],tipoTecnica:'defensa',
  desc:'Centrocampista de la Royal Academy, dorsal 6.',
  locked:true,cost:145,
  sprite:'https://inazumarun.es/assets/sprites/r540.webp'
},
{
  id:'r541', equipo:'Royal Academy', nombre:'John Bloom', original:'Sakiyama Shuuji',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:79,defensa:58,especial:70,
  hissatsu:['Barrido defensivo', 'Chut de los 100 toques', 'Arrollador'],tipoTecnica:'defensa',
  desc:'Centrocampista de la Royal Academy, dorsal 7.',
  locked:true,cost:145,
  sprite:'https://inazumarun.es/assets/sprites/r541.webp'
},
{
  id:'r542', equipo:'Zeus', nombre:'Artie Mishman', original:'Arute Saneki',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:82,defensa:67,especial:77,
  hissatsu:['Hora celestial', 'Espejismo de balón', 'Flecha Divina'],tipoTecnica:'regate',
  desc:'Centrocampista del Zeus, dorsal 6.',
  locked:false,cost:121,
  sprite:'https://inazumarun.es/assets/sprites/r542.webp'
},
{
  id:'r543', equipo:'Kirkwood', nombre:'John Neville', original:'Nanzan Yowami',
  posicion:'Portero', tipo:'Fuego',
  tiro:26,pase:47,defensa:72,especial:70,
  hissatsu:['Parada fuerte', 'Bloque dureza', 'Muralla Gigante'],tipoTecnica:'portero',
  desc:'Portero del Instituto Kirkwood, dorsal 1.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r543.webp'
},
{
  id:'r544', equipo:'Kirkwood', nombre:'Dan Mirthful', original:'Mitsumune Dan',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:51,defensa:67,especial:60,
  hissatsu:['Corte giratorio', 'Terremoto', 'Tiro Cegador'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood, dorsal 4.',
  locked:false,cost:100,
  sprite:'https://inazumarun.es/assets/sprites/r544.webp'
},
{
  id:'r545', equipo:'Kirkwood', nombre:'Toby Damian', original:'Tobiyama Dan',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:59,pase:69,defensa:51,especial:64,
  hissatsu:['Tornado inverso', 'Robo veloz', 'Tiro Giratorio'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Kirkwood, dorsal 6.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r545.webp'
},
{
  id:'r546', equipo:'Kirkwood', nombre:'York Nashmith', original:'Yakata Naoto',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:59,pase:69,defensa:51,especial:64,
  hissatsu:['Giro de mono', 'Tornado inverso', 'Potenciación'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Kirkwood, dorsal 7.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r546.webp'
},
{
  id:'r547', equipo:'Kirkwood', nombre:'Zachary Moore', original:'Mogi Sakito',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:59,pase:69,defensa:51,especial:64,
  hissatsu:['Espejismo de balón', 'Remate combinado', 'Potenciación'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Kirkwood, dorsal 8.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r547.webp'
},
{
  id:'r548', equipo:'Brain', nombre:'Harry Leading', original:'Hiroyama Yuu',
  posicion:'Defensa', tipo:'Viento',
  tiro:38,pase:59,defensa:77,especial:70,
  hissatsu:['Remate misil', 'Mirada ladrona', 'Escáner Ataque'],tipoTecnica:'tiro',
  desc:'Defensa del Instituto Brain, dorsal 2.',
  locked:true,cost:112,
  sprite:'https://inazumarun.es/assets/sprites/r548.webp'
},
{
  id:'r549', equipo:'Brain', nombre:'Noel Good', original:'Inada Nori',
  posicion:'Defensa', tipo:'Bosque',
  tiro:39,pase:60,defensa:76,especial:70,
  hissatsu:['Zona de seguridad', 'Terremoto', 'Escáner Ataque'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Brain, dorsal 5.',
  locked:true,cost:112,
  sprite:'https://inazumarun.es/assets/sprites/r549.webp'
},
{
  id:'r550', equipo:'Brain', nombre:'Tyron Rock', original:'Terakawa Iwao',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:75,defensa:50,especial:74,
  hissatsu:['Remate misil', 'Visto y no visto', 'Disparo con Rebotes'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Brain, dorsal 6.',
  locked:true,cost:155,
  sprite:'https://inazumarun.es/assets/sprites/r550.webp'
},
{
  id:'r551', equipo:'Brain', nombre:'Victor Kind', original:'Oobe Shin',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:74,defensa:51,especial:74,
  hissatsu:['Remate combinado', 'Ataque de las sombras', 'Escáner Ataque'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Brain, dorsal 10.',
  locked:true,cost:155,
  sprite:'https://inazumarun.es/assets/sprites/r551.webp'
},
{
  id:'r552', equipo:'Otaku', nombre:'Marcus Train', original:'Sujimichi Tetsuo',
  posicion:'Defensa', tipo:'Fuego',
  tiro:21,pase:56,defensa:71,especial:66,
  hissatsu:['Bola falsa', 'Zig Zag Explosivo', 'Bateo total'],tipoTecnica:'defensa',
  desc:'Defensa del Otaku, dorsal 2.',
  locked:false,cost:118,
  sprite:'https://inazumarun.es/assets/sprites/r552.webp'
},
{
  id:'r553', equipo:'Otaku', nombre:'Spencer Gates', original:'Karisawa Sou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:21,pase:56,defensa:71,especial:66,
  hissatsu:['Bateo total', 'Bola falsa', 'Gran seísmo'],tipoTecnica:'tiro',
  desc:'Defensa del Otaku, dorsal 5.',
  locked:false,cost:118,
  sprite:'https://inazumarun.es/assets/sprites/r553.webp'
},
{
  id:'r554', equipo:'Otaku', nombre:'Josh Spear', original:'Onra Itsuki',
  posicion:'Delantero', tipo:'Bosque',
  tiro:75,pase:57,defensa:36,especial:70,
  hissatsu:['Confusión', 'Gravedad', 'Escáner Ataque'],tipoTecnica:'regate',
  desc:'Delantero del Otaku, dorsal 6.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r554.webp'
},
{
  id:'r555', equipo:'Otaku', nombre:'Gaby Farmer', original:'Onotomo Haru',
  posicion:'Delantero', tipo:'Viento',
  tiro:75,pase:57,defensa:36,especial:70,
  hissatsu:['Confusión', 'Ciclón', 'Chut Congelante'],tipoTecnica:'regate',
  desc:'Delantero del Otaku, dorsal 7.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r555.webp'
},
{
  id:'r556', equipo:'Otaku', nombre:'A. Woodbridge', original:'Robo Gouki',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:65,pase:71,defensa:54,especial:60,
  hissatsu:['Confusión', 'Bateo total', 'Giro Bobina'],tipoTecnica:'regate',
  desc:'Centrocampista del Otaku, dorsal 8.',
  locked:false,cost:118,
  sprite:'https://inazumarun.es/assets/sprites/r556.webp'
},
{
  id:'r557', equipo:'Shuriken', nombre:'Morgan Sanders', original:'Momochi Santa',
  posicion:'Portero', tipo:'Bosque',
  tiro:26,pase:52,defensa:78,especial:76,
  hissatsu:['Fénix', 'Espiral de distorsión', 'Regate múltiple'],tipoTecnica:'portero',
  desc:'Portero del Instituto Shuriken, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r557.webp'
},
{
  id:'r558', equipo:'Shuriken', nombre:'Newton Flust', original:'Fujibayashi Nagato',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:61,defensa:75,especial:72,
  hissatsu:['Ataque de las sombras', 'Regate múltiple', 'Confusión'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Shuriken, dorsal 2.',
  locked:true,cost:145,
  sprite:'https://inazumarun.es/assets/sprites/r558.webp'
},
{
  id:'r559', equipo:'Shuriken', nombre:'Galen Thunderbird', original:'Jiraiya Gamasuke',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:61,defensa:75,especial:72,
  hissatsu:['Pisotón de sumo', 'Ataque de las sombras', 'Telaraña'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Shuriken, dorsal 4.',
  locked:true,cost:145,
  sprite:'https://inazumarun.es/assets/sprites/r559.webp'
},
{
  id:'r560', equipo:'Shuriken', nombre:'Finn Stoned', original:'Ishikawa Goeta',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:61,defensa:75,especial:72,
  hissatsu:['Pisotón de sumo', 'Ataque de las sombras', 'Regate Topo'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Shuriken, dorsal 5.',
  locked:true,cost:145,
  sprite:'https://inazumarun.es/assets/sprites/r560.webp'
},
{
  id:'r561', equipo:'Shuriken', nombre:'Jez Shell', original:'Kouga Gen',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:64,pase:75,defensa:46,especial:74,
  hissatsu:['Regate múltiple', 'Tiro fantasma', 'Doppelganger'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Shuriken, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r561.webp'
},
{
  id:'r562', equipo:'Farm', nombre:'Seward Hayseed', original:'Sumino Eisuke',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:66,defensa:81,especial:78,
  hissatsu:['Cabezazo kung fu', 'Torbellino dragón', 'Sorpresa'],tipoTecnica:'tiro',
  desc:'Defensa del Instituto Farm, dorsal 2.',
  locked:true,cost:152,
  sprite:'https://inazumarun.es/assets/sprites/r562.webp'
},
{
  id:'r563', equipo:'Farm', nombre:'Kent Work', original:'Serizawa Kazunori',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:66,defensa:81,especial:78,
  hissatsu:['Robo veloz', 'Trama trama', 'Entrada huracán'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Farm, dorsal 3.',
  locked:true,cost:152,
  sprite:'https://inazumarun.es/assets/sprites/r563.webp'
},
{
  id:'r564', equipo:'Farm', nombre:'Ike Steiner', original:'Ikui Shouji',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:65,pase:73,defensa:50,especial:74,
  hissatsu:['Regate topo', 'Tiro cegador', 'Corte Giratorio'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Farm, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r564.webp'
},
{
  id:'r565', equipo:'Farm', nombre:'Tom Walters', original:'Harano Tooru',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:65,pase:73,defensa:50,especial:74,
  hissatsu:['Superbalón rodante', 'Torbellino dragón', 'Tiro Cegador'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Farm, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r565.webp'
},
{
  id:'r566', equipo:'Farm', nombre:'Stuart Racoonfur', original:'Tanushimaru Shigeki',
  posicion:'Delantero', tipo:'Bosque',
  tiro:81,pase:68,defensa:36,especial:74,
  hissatsu:['Tiro cegador', 'Entrada huracán', 'Remolino cortante'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Farm, dorsal 11.',
  locked:true,cost:165,
  sprite:'https://inazumarun.es/assets/sprites/r566.webp'
},
{
  id:'r567', equipo:'Inazuma Kids', nombre:'Izzy Island', original:'Sejima Itsuki',
  posicion:'Defensa', tipo:'Bosque',
  tiro:29,pase:43,defensa:70,especial:60,
  hissatsu:['Telaraña', 'Mirada ladrona', 'Escáner Ataque'],tipoTecnica:'defensa',
  desc:'Defensa del Inazuma Kids FC, dorsal 4.',
  locked:false,cost:14,
  sprite:'https://inazumarun.es/assets/sprites/r567.webp'
},
{
  id:'r568', equipo:'Inazuma Kids', nombre:'Sothern Newman', original:'Shintake Souta',
  posicion:'Defensa', tipo:'Montaña',
  tiro:29,pase:43,defensa:70,especial:60,
  hissatsu:['Superaceleración', 'Terremoto', 'Muralla Gigante'],tipoTecnica:'regate',
  desc:'Defensa del Inazuma Kids FC, dorsal 5.',
  locked:false,cost:14,
  sprite:'https://inazumarun.es/assets/sprites/r568.webp'
},
{
  id:'r569', equipo:'Inazuma Kids', nombre:'Irwin Hall', original:'Ikejiri Haru',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:39,pase:60,defensa:48,especial:59,
  hissatsu:['Superaceleración', 'Confusión', 'Sorpresa'],tipoTecnica:'regate',
  desc:'Centrocampista del Inazuma Kids FC, dorsal 6.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r569.webp'
},
{
  id:'r570', equipo:'Inazuma Kids', nombre:'Michael Riverside', original:'Morimoto Rikuto',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:39,pase:60,defensa:48,especial:59,
  hissatsu:['Superaceleración', 'Robo veloz', 'Remate Tarzán'],tipoTecnica:'regate',
  desc:'Centrocampista del Inazuma Kids FC, dorsal 10.',
  locked:false,cost:15,
  sprite:'https://inazumarun.es/assets/sprites/r570.webp'
},
{
  id:'r572', equipo:'Sallys', nombre:'Suzanne Yuma', original:'Yaono Sumiko',
  posicion:'Portero', tipo:'Montaña',
  tiro:26,pase:42,defensa:68,especial:68,
  hissatsu:['Parada fuerte', 'Bloque dureza', 'Despeje de leñador'],tipoTecnica:'portero',
  desc:'Portero de los Sallys, dorsal 1.',
  locked:false,cost:95,
  sprite:'https://inazumarun.es/assets/sprites/r572.webp'
},
{
  id:'r573', equipo:'Sallys', nombre:'Tammy Fielding', original:'Fudeyama Tome',
  posicion:'Defensa', tipo:'Bosque',
  tiro:34,pase:44,defensa:67,especial:62,
  hissatsu:['Espejismo', 'Ataque de las sombras', 'Trama trama'],tipoTecnica:'regate',
  desc:'Defensa de los Sallys, dorsal 2.',
  locked:false,cost:90,
  sprite:'https://inazumarun.es/assets/sprites/r573.webp'
},
{
  id:'r574', equipo:'Sallys', nombre:'Alex Lovely', original:'Ootama Konomi',
  posicion:'Defensa', tipo:'Viento',
  tiro:38,pase:48,defensa:66,especial:62,
  hissatsu:['Barrido defensivo', 'Robo veloz', 'Bola de Fango'],tipoTecnica:'defensa',
  desc:'Defensa de los Sallys, dorsal 3.',
  locked:false,cost:90,
  sprite:'https://inazumarun.es/assets/sprites/r574.webp'
},
{
  id:'r575', equipo:'Sallys', nombre:'Louis Hillside', original:'Honemaru Hitoshi',
  posicion:'Defensa', tipo:'Fuego',
  tiro:34,pase:44,defensa:67,especial:62,
  hissatsu:['Pisotón de sumo', 'Terremoto', 'Regate Topo'],tipoTecnica:'defensa',
  desc:'Defensa de los Sallys, dorsal 4.',
  locked:false,cost:90,
  sprite:'https://inazumarun.es/assets/sprites/r575.webp'
},
{
  id:'r576', equipo:'Sallys', nombre:'Ness Sheldon', original:'Shittou Nao',
  posicion:'Defensa', tipo:'Montaña',
  tiro:34,pase:44,defensa:67,especial:62,
  hissatsu:['Pisotón de sumo', 'Despeje de leñador', 'Ataque cortante'],tipoTecnica:'defensa',
  desc:'Defensa de los Sallys, dorsal 5.',
  locked:false,cost:90,
  sprite:'https://inazumarun.es/assets/sprites/r576.webp'
},
{
  id:'r577', equipo:'Sallys', nombre:'Lizzy Squirrel', original:'Tachimi Ritsuko',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:52,pase:62,defensa:45,especial:60,
  hissatsu:['Superaceleración', 'Barrido defensivo', 'Cabezazo Kung Fu'],tipoTecnica:'regate',
  desc:'Centrocampista de los Sallys, dorsal 6.',
  locked:false,cost:95,
  sprite:'https://inazumarun.es/assets/sprites/r577.webp'
},
{
  id:'r578', equipo:'Sallys', nombre:'Kippy Jones', original:'Misemachi Yasunori',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:52,pase:62,defensa:45,especial:60,
  hissatsu:['Barrido defensivo', 'Entrada huracán', 'Bola Falsa'],tipoTecnica:'defensa',
  desc:'Centrocampista de los Sallys, dorsal 7.',
  locked:false,cost:95,
  sprite:'https://inazumarun.es/assets/sprites/r578.webp'
},
{
  id:'r579', equipo:'Sallys', nombre:'Fayette Riversong', original:'Utagawa Makoto',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:51,pase:63,defensa:44,especial:60,
  hissatsu:['Chut granada', 'Superaceleración', 'Remate combinado'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Sallys, dorsal 8.',
  locked:false,cost:95,
  sprite:'https://inazumarun.es/assets/sprites/r579.webp'
},
{
  id:'r580', equipo:'Sallys', nombre:'Samantha Moonlight', original:'Kisaragi Sarina',
  posicion:'Delantero', tipo:'Viento',
  tiro:71,pase:56,defensa:34,especial:66,
  hissatsu:['Pase cruzado', 'Entrada de llamas', 'Tiro del cometa'],tipoTecnica:'tiro',
  desc:'Delantero de los Sallys, dorsal 9.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r580.webp'
},
{
  id:'r581', equipo:'Sallys', nombre:'Mitch Sandstone', original:'Mikawaya Saburou',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:51,pase:63,defensa:44,especial:60,
  hissatsu:['Chut granada', 'Remate dragón', 'Bateo total'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Sallys, dorsal 10.',
  locked:false,cost:95,
  sprite:'https://inazumarun.es/assets/sprites/r581.webp'
},
{
  id:'r582', equipo:'Sallys', nombre:'Eddie Prentice', original:'Purogure Iwao',
  posicion:'Delantero', tipo:'Montaña',
  tiro:71,pase:56,defensa:34,especial:66,
  hissatsu:['Entrada de llamas', 'Remate combinado', 'Tiro dinamita'],tipoTecnica:'regate',
  desc:'Delantero de los Sallys, dorsal 11.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r582.webp'
},
{
  id:'r583', equipo:'Veteranos Inazuma', nombre:'Seymour Hillman', original:'Hibiki Seigou',
  posicion:'Portero', tipo:'Montaña',
  tiro:29,pase:48,defensa:74,especial:74,
  hissatsu:['Mano celestial', 'Despeje explosivo', 'Mano Mágica'],tipoTecnica:'portero',
  desc:'Portero de los Veteranos Inazuma, dorsal 1.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r583.webp'
},
{
  id:'r584', equipo:'Veteranos Inazuma', nombre:'Charles Island', original:'Ukishima Kazuto',
  posicion:'Defensa', tipo:'Bosque',
  tiro:38,pase:49,defensa:73,especial:66,
  hissatsu:['Ciclón', 'Trampolín relámpago', 'Zig Zag Explosivo'],tipoTecnica:'defensa',
  desc:'Defensa de los Veteranos Inazuma, dorsal 2.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r584.webp'
},
{
  id:'r585', equipo:'Veteranos Inazuma', nombre:'Garret Hairtown', original:'Kamimura Kirito',
  posicion:'Defensa', tipo:'Viento',
  tiro:38,pase:48,defensa:73,especial:66,
  hissatsu:['Corte giratorio', 'Pájaro de fuego', 'Cabezazo Kung Fu'],tipoTecnica:'defensa',
  desc:'Defensa de los Veteranos Inazuma, dorsal 3.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r585.webp'
},
{
  id:'r586', equipo:'Veteranos Inazuma', nombre:'Arthur Sweet', original:'Aida Chikara',
  posicion:'Defensa', tipo:'Montaña',
  tiro:38,pase:49,defensa:73,especial:66,
  hissatsu:['Ciclón', 'Remate dragón', 'Tornado dragón'],tipoTecnica:'defensa',
  desc:'Defensa de los Veteranos Inazuma, dorsal 4.',
  locked:false,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r586.webp'
},
{
  id:'r587', equipo:'Veteranos Inazuma', nombre:'Peter Mildred', original:'Batora Manabu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:58,pase:68,defensa:49,especial:66,
  hissatsu:['Ataque cortante', 'Chut granada', 'Regate múltiple'],tipoTecnica:'defensa',
  desc:'Centrocampista de los Veteranos Inazuma, dorsal 5.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r587.webp'
},
{
  id:'r588', equipo:'Veteranos Inazuma', nombre:'Josh Nathaniel', original:'Nakama You',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:58,pase:68,defensa:49,especial:66,
  hissatsu:['Bateo total', 'Zig Zag Explosivo', 'Ataque cortante'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Veteranos Inazuma, dorsal 6.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r588.webp'
},
{
  id:'r589', equipo:'Veteranos Inazuma', nombre:'Edward Gladstone', original:'Ikari Gengorou',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:57,pase:69,defensa:48,especial:66,
  hissatsu:['Pase cruzado', 'Corte giratorio', 'Remate combinado'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Veteranos Inazuma, dorsal 7.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r589.webp'
},
{
  id:'r590', equipo:'Veteranos Inazuma', nombre:'Tyler Thomas', original:'Teira Tamotsu',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:57,pase:69,defensa:48,especial:66,
  hissatsu:['Pase cruzado', 'Espejismo de balón', 'Truco de Magia'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Veteranos Inazuma, dorsal 8.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r590.webp'
},
{
  id:'r591', equipo:'Veteranos Inazuma', nombre:'Joseph Yosemite', original:'Tamiyama You',
  posicion:'Delantero', tipo:'Viento',
  tiro:75,pase:62,defensa:38,especial:70,
  hissatsu:['Tiro fantasma', 'Trampolín relámpago', 'Robo veloz'],tipoTecnica:'tiro',
  desc:'Delantero de los Veteranos Inazuma, dorsal 9.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r591.webp'
},
{
  id:'r592', equipo:'Veteranos Inazuma', nombre:'Ian Suffolk', original:'Sugata Iwao',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:57,pase:69,defensa:48,especial:66,
  hissatsu:['Entrada de llamas', 'Zig Zag Explosivo', 'Sorpresa'],tipoTecnica:'regate',
  desc:'Centrocampista de los Veteranos Inazuma, dorsal 10.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r592.webp'
},
{
  id:'r593', equipo:'Veteranos Inazuma', nombre:'Constant Builder', original:'Biruda Kouichi',
  posicion:'Delantero', tipo:'Fuego',
  tiro:73,pase:61,defensa:39,especial:70,
  hissatsu:['Pájaro de fuego', 'Entrada de llamas', 'El Muro'],tipoTecnica:'tiro',
  desc:'Delantero de los Veteranos Inazuma, dorsal 11.',
  locked:false,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r593.webp'
},
// Once titular de los equipos de la Temporada 2 y 3 que faltaban, con
// nombre, posición, elemento y técnicas de Victory Road (o de la wiki,
// para los que no salen en él); sprites con scripts/descargar-sprites.py.
{
  id:'r594', equipo:'Prominence', equiposExtra:['Caos'], nombre:'Bonnie Sparks', original:'Barazono Hana',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:64,defensa:80,especial:74,
  hissatsu:['Cortafuegos', 'Escáner defensa', 'Combustión'],tipoTecnica:'defensa',
  desc:'Defensa del Prominence, dorsal 2.',
  locked:true,cost:128,
  sprite:'https://inazumarun.es/assets/sprites/r594.webp'
},
{
  id:'r595', equipo:'Polvo de Diamante', equiposExtra:['Diamond Dust', 'Caos'], nombre:'Dawson Foxx', original:'Kadomichi Tooru',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:78,defensa:66,especial:78,
  hissatsu:['Bomba géiser', 'Robo veloz', 'Disparo cósmico'],tipoTecnica:'regate',
  desc:'Centrocampista del Polvo de Diamante, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r595.webp'
},
{
  id:'r596', equipo:'Polvo de Diamante', equiposExtra:['Diamond Dust', 'Caos'], nombre:'Ving Rice', original:'Kurione Yuki',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:78,defensa:66,especial:78,
  hissatsu:['Bomba géiser', 'Remate en espiral', 'Carrera relámpago'],tipoTecnica:'regate',
  desc:'Centrocampista del Polvo de Diamante, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r596.webp'
},
{
  id:'r597', equipo:'Prominence', equiposExtra:['Caos'], nombre:'Nigel August', original:'Netsuha Natsuhiko',
  posicion:'Delantero', tipo:'Bosque',
  tiro:90,pase:77,defensa:28,especial:81,
  hissatsu:['Rayo de Ganímedes', 'Cortafuegos', 'Llamarada Atómica'],tipoTecnica:'tiro',
  desc:'Delantero del Prominence, dorsal 11.',
  locked:true,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r597.webp'
},
{
  id:'r598', equipo:'Épsilon', equiposExtra:['Épsilon Plus'], nombre:'Anna Mole', original:'Morino Rumi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:68,defensa:80,especial:74,
  hissatsu:['Teleportación', 'Destrozataladros', 'Flash de fotones'],tipoTecnica:'regate',
  desc:'Defensa del Épsilon, dorsal 3.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r598.webp'
},
{
  id:'r599', equipo:'Épsilon', equiposExtra:['Épsilon Plus'], nombre:'Kayson Wattever', original:'Murata Keisuke',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:68,defensa:80,especial:74,
  hissatsu:['Cinto astral', 'Gravedad grave', 'Arrollador'],tipoTecnica:'defensa',
  desc:'Defensa del Épsilon, dorsal 4.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r599.webp'
},
{
  id:'r600', equipo:'Épsilon', equiposExtra:['Épsilon Plus'], nombre:'Mike Tytan', original:'Tanba Taiji',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:68,defensa:80,especial:74,
  hissatsu:['Gravitación', 'Terremoto', 'Gravedad grave'],tipoTecnica:'defensa',
  desc:'Defensa del Épsilon, dorsal 5.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r600.webp'
},
{
  id:'r601', equipo:'Épsilon', equiposExtra:['Épsilon Plus'], nombre:'Karen Ripton', original:'Kuri Fuuko',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:80,defensa:62,especial:76,
  hissatsu:['Lluvia de meteoros', 'Astro remate', 'Cruz del sur'],tipoTecnica:'regate',
  desc:'Centrocampista del Épsilon, dorsal 7.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r601.webp'
},
{
  id:'r602', equipo:'Fauxshore', nombre:'Mick Mishap', original:'Oohori Michitoshi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:41,pase:63,defensa:81,especial:80,
  hissatsu:['Estrella fugaz', 'Entrada huracán', 'Embestida'],tipoTecnica:'defensa',
  desc:'Defensa del Fauxshore, dorsal 3.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r602.webp'
},
{
  id:'r603', equipo:'Fauxshore', nombre:'Louis Leave', original:'Genkai Namito',
  posicion:'Defensa', tipo:'Fuego',
  tiro:41,pase:63,defensa:81,especial:80,
  hissatsu:['Emboscada defensiva', 'Entrada de llamas', 'Golf total'],tipoTecnica:'defensa',
  desc:'Defensa del Fauxshore, dorsal 4.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r603.webp'
},
{
  id:'r604', equipo:'Fauxshore', nombre:'Cannon Random', original:'Shika Kaneaki',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:82,defensa:58,especial:80,
  hissatsu:['Robo veloz', 'Bateo total', 'Armadillo Circense'],tipoTecnica:'defensa',
  desc:'Centrocampista del Fauxshore, dorsal 6.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r604.webp'
},
{
  id:'r605', equipo:'Fauxshore', nombre:'Ulric Richmen', original:'Michihata Utau',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:69,pase:83,defensa:57,especial:80,
  hissatsu:['Voltereta circense', 'Bola de fango', 'Bomba acrobática'],tipoTecnica:'defensa',
  desc:'Centrocampista del Fauxshore, dorsal 7.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r605.webp'
},
{
  id:'r606', equipo:'Fauxshore', nombre:'Dave Fate', original:'Matsurida Wasshoi',
  posicion:'Delantero', tipo:'Montaña',
  tiro:85,pase:84,defensa:65,especial:82,
  hissatsu:['Pisotón de sumo', 'Súper pisotón de sumo', 'Paipay gigante'],tipoTecnica:'defensa',
  desc:'Delantero del Fauxshore, dorsal 8.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r606.webp'
},
{
  id:'r607', equipo:'Fauxshore', nombre:'Dany Destiny', original:'Kasayama Sou',
  posicion:'Defensa', tipo:'Fuego',
  tiro:42,pase:64,defensa:80,especial:80,
  hissatsu:['Carrera relámpago', 'Entrada rodante', 'Paipay gigante'],tipoTecnica:'regate',
  desc:'Defensa del Fauxshore, dorsal 9.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r607.webp'
},
{
  id:'r608', equipo:'Mary Times', nombre:'Chad Taylor', original:'Taira Moguru',
  posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:67,defensa:84,especial:77,
  hissatsu:['Giro bobina', 'Torbellino dragón', 'Bomba Falsa'],tipoTecnica:'defensa',
  desc:'Defensa del Mary Times, dorsal 2.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r608.webp'
},
{
  id:'r609', equipo:'Mary Times', nombre:'Mackenzie Fordline', original:'Toguchi Masahiro',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:85,defensa:78,especial:75,
  hissatsu:['Tiro fantasma', 'Ataque cortante', 'Ciclón'],tipoTecnica:'tiro',
  desc:'Centrocampista del Mary Times, dorsal 6.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r609.webp'
},
{
  id:'r610', equipo:'Mary Times', nombre:'Tom Contented', original:'Koja Hidenori',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:71,pase:84,defensa:79,especial:75,
  hissatsu:['Remate del águila', 'Giro de mono', 'Tiro pirueta'],tipoTecnica:'tiro',
  desc:'Centrocampista del Mary Times, dorsal 9.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r610.webp'
},
{
  id:'r611', equipo:'Mary Times', nombre:'Joston Easton', original:'Agarie Yasuo',
  posicion:'Delantero', tipo:'Viento',
  tiro:82,pase:77,defensa:42,especial:78,
  hissatsu:['Superaceleración', 'Bomba géiser', 'Chicle burbuja'],tipoTecnica:'regate',
  desc:'Delantero del Mary Times, dorsal 10.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r611.webp'
},
{
  id:'r612', equipo:'Polvo de Diamante', equiposExtra:['Diamond Dust'], nombre:'Alan Downhill', original:'Touchi Shuuji',
  posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:70,defensa:82,especial:77,
  hissatsu:['Rompehielos', 'Balon iceberg', 'Bloque de Hielo'],tipoTecnica:'defensa',
  desc:'Defensa del Polvo de Diamante, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r612.webp'
},
{
  id:'r613', equipo:'Polvo de Diamante', equiposExtra:['Diamond Dust'], nombre:'Lucy Hailstone', original:'Touchi Ai',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:78,defensa:66,especial:78,
  hissatsu:['Regate aurora', 'Rompehielos', 'Balón Iceberg'],tipoTecnica:'regate',
  desc:'Centrocampista del Polvo de Diamante, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r613.webp'
},
{
  id:'r614', equipo:'Polvo de Diamante', equiposExtra:['Diamond Dust'], nombre:'Brad Coldwater', original:'Toba Ren',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:78,defensa:66,especial:78,
  hissatsu:['Bomba géiser', 'Corte giratorio', 'Combate kung fu'],tipoTecnica:'regate',
  desc:'Centrocampista del Polvo de Diamante, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r614.webp'
},
{
  id:'r615', equipo:'Polvo de Diamante', equiposExtra:['Diamond Dust'], nombre:'Bernie White', original:'Tsumujino Touji',
  posicion:'Delantero', tipo:'Viento',
  tiro:85,pase:75,defensa:45,especial:81,
  hissatsu:['Astro remate', 'Balon iceberg', 'Bomba géiser'],tipoTecnica:'tiro',
  desc:'Delantero del Polvo de Diamante, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r615.webp'
},
{
  id:'r616', equipo:'Prominence', nombre:'Sean Ashford', original:'Satou Kazuo',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:67,defensa:79,especial:74,
  hissatsu:['Cortafuegos', 'Remate asalto', 'Gravedad grave'],tipoTecnica:'defensa',
  desc:'Defensa del Prominence, dorsal 4.',
  locked:true,cost:128,
  sprite:'https://inazumarun.es/assets/sprites/r616.webp'
},
{
  id:'r617', equipo:'Prominence', nombre:'Sam Bournes', original:'Nitou Honoka',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:60,pase:78,defensa:60,especial:70,
  hissatsu:['Pantalla ígnea', 'Lanza de odín', 'Lecho de Rosas'],tipoTecnica:'regate',
  desc:'Centrocampista del Prominence, dorsal 8.',
  locked:false,cost:128,
  sprite:'https://inazumarun.es/assets/sprites/r617.webp'
},
{
  id:'r618', equipo:'Prominence', nombre:'Jim Flareson', original:'Saiden Jou',
  posicion:'Delantero', tipo:'Fuego',
  tiro:85,pase:75,defensa:32,especial:81,
  hissatsu:['Astro remate', 'Llamarada atómica', 'Pájaro de fuego'],tipoTecnica:'tiro',
  desc:'Delantero del Prominence, dorsal 9.',
  locked:true,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r618.webp'
},
{
  id:'r619', equipo:'Triple C', nombre:'Rose Pinkpetal', original:'Umeda Harumi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:38,pase:66,defensa:85,especial:78,
  hissatsu:['Bola falsa', 'Ciclón', 'Bomba Falsa'],tipoTecnica:'defensa',
  desc:'Defensa del Triple C, dorsal 4.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r619.webp'
},
{
  id:'r620', equipo:'Triple C', nombre:'Esther Greenland', original:'Kushida Katsuyo',
  posicion:'Defensa', tipo:'Fuego',
  tiro:38,pase:66,defensa:85,especial:78,
  hissatsu:['Corte volcánico', 'Ataque cortante', 'Olor embriagador'],tipoTecnica:'defensa',
  desc:'Defensa del Triple C, dorsal 5.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r620.webp'
},
{
  id:'r621', equipo:'Triple C', nombre:'Bela Bluebells', original:'Yorozu Hiromi',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:85,defensa:59,especial:79,
  hissatsu:['Corte giratorio', 'Giro de mono', 'Sorpresa'],tipoTecnica:'defensa',
  desc:'Centrocampista del Triple C, dorsal 6.',
  locked:true,cost:375,
  sprite:'https://inazumarun.es/assets/sprites/r621.webp'
},
{
  id:'r622', equipo:'Triple C', nombre:'Natalie Sunrise', original:'Takoya Noriko',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:65,pase:86,defensa:58,especial:79,
  hissatsu:['Bola falsa', 'Corte volcánico', 'Bomba Falsa'],tipoTecnica:'defensa',
  desc:'Centrocampista del Triple C, dorsal 7.',
  locked:true,cost:375,
  sprite:'https://inazumarun.es/assets/sprites/r622.webp'
},
{
  id:'r623', equipo:'Triple C', nombre:'Hillary Bush', original:'Namikawa Hanako',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:65,pase:86,defensa:58,especial:79,
  hissatsu:['Remate en espiral', 'Giro bobina', 'Arcoiris luminoso'],tipoTecnica:'tiro',
  desc:'Centrocampista del Triple C, dorsal 8.',
  locked:true,cost:375,
  sprite:'https://inazumarun.es/assets/sprites/r623.webp'
},
{
  id:'r624', equipo:'Triple C', nombre:'Lily Willow', original:'Midou Reika',
  posicion:'Delantero', tipo:'Bosque',
  tiro:75,pase:56,defensa:34,especial:70,
  hissatsu:['Baile de mariposas', 'Olor embriagador', 'Engaño Torero'],tipoTecnica:'tiro',
  desc:'Delantero del Triple C, dorsal 11.',
  locked:false,cost:82,
  sprite:'https://inazumarun.es/assets/sprites/r624.webp'
},
{
  id:'r625', equipo:'Royal Academy Redux', equiposExtra:['Neo Japón'], nombre:'Argie Bargie', original:'Gouin Takeshi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:47,pase:68,defensa:87,especial:81,
  hissatsu:['Barrido defensivo', 'Mega terremoto', 'Remate Tarzán'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy Redux, dorsal 4.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r625.webp'
},
{
  id:'r626', equipo:'Royal Academy Redux', nombre:'Lee Bamboo', original:'Jikuwa Ryou',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:66,defensa:88,especial:81,
  hissatsu:['Barrido defensivo', 'Corte giratorio', 'Arrollador 2/Coz 2'],tipoTecnica:'defensa',
  desc:'Defensa de la Royal Academy Redux, dorsal 5.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r626.webp'
},
{
  id:'r627', equipo:'Royal Academy Redux', nombre:'Eton Messer', original:'Meza Aito',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:89,pase:88,defensa:69,especial:91,
  hissatsu:['Chut de los 100 toques', 'Barrido defensivo', 'Descodificación'],tipoTecnica:'tiro',
  desc:'Centrocampista de la Royal Academy Redux, dorsal 6.',
  locked:true,cost:440,
  sprite:'https://inazumarun.es/assets/sprites/r627.webp'
},
{
  id:'r628', equipo:'Royal Academy Redux', nombre:'Jonah Spark', original:'Hikara Yoshiteru',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:88,pase:89,defensa:68,especial:91,
  hissatsu:['Gravedad', 'Espejismo de balón', 'Ataque de las sombras'],tipoTecnica:'defensa',
  desc:'Centrocampista de la Royal Academy Redux, dorsal 7.',
  locked:true,cost:440,
  sprite:'https://inazumarun.es/assets/sprites/r628.webp'
},
{
  id:'r629', equipo:'Royal Academy Redux', nombre:'Sue Sparrow', original:'Takanashi Shinobu',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:89,pase:88,defensa:69,especial:91,
  hissatsu:['Tornado inverso', 'Ciclón', 'Regate múltiple'],tipoTecnica:'tiro',
  desc:'Centrocampista de la Royal Academy Redux, dorsal 8.',
  locked:true,cost:440,
  sprite:'https://inazumarun.es/assets/sprites/r629.webp'
},
{
  id:'r630', equipo:'Royal Academy Redux', nombre:'Riley Jamm', original:'Hie Ryousuke',
  posicion:'Delantero', tipo:'Bosque',
  tiro:91,pase:77,defensa:45,especial:87,
  hissatsu:['Chut de los 100 toques', 'Triangulo letal', 'Chut de los 200 toques'],tipoTecnica:'tiro',
  desc:'Delantero de la Royal Academy Redux, dorsal 9.',
  locked:true,cost:435,
  sprite:'https://inazumarun.es/assets/sprites/r630.webp'
},
{
  id:'r631', equipo:'Claustro Sagrado', nombre:'Parry Waxon', original:'Satori Kai',
  posicion:'Defensa', tipo:'Viento',
  tiro:40,pase:64,defensa:73,especial:68,
  hissatsu:['Telaraña', 'Defensa múltiple', 'Apisonadora'],tipoTecnica:'defensa',
  desc:'Defensa del Claustro Sagrado, dorsal 2.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r631.webp'
},
{
  id:'r632', equipo:'Claustro Sagrado', nombre:'Max Fortune', original:'Fukumi Miou',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:64,defensa:73,especial:68,
  hissatsu:['Torbellino dragón', 'Robo veloz', 'Combate kung fu'],tipoTecnica:'regate',
  desc:'Defensa del Claustro Sagrado, dorsal 4.',
  locked:false,cost:18,
  sprite:'https://inazumarun.es/assets/sprites/r632.webp'
},
{
  id:'r633', equipo:'Tormenta de Géminis', nombre:'Connor Shuttle', original:'Sango Yoshirou',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:74,defensa:83,especial:80,
  hissatsu:['Cinto astral', 'Luna creciente', 'Constelación Estelar'],tipoTecnica:'defensa',
  desc:'Defensa de Tormenta de Géminis, dorsal 2.',
  locked:false,cost:134,
  sprite:'https://inazumarun.es/assets/sprites/r633.webp'
},
{
  id:'r634', equipo:'Tormenta de Géminis', nombre:'Jim Landing', original:'Kikuma Shousuke',
  posicion:'Defensa', tipo:'Fuego',
  tiro:47,pase:74,defensa:83,especial:80,
  hissatsu:['Gravitación', 'Teleportación', 'Súper pisotón de sumo'],tipoTecnica:'defensa',
  desc:'Defensa de Tormenta de Géminis, dorsal 3.',
  locked:false,cost:134,
  sprite:'https://inazumarun.es/assets/sprites/r634.webp'
},
{
  id:'r635', equipo:'Tormenta de Géminis', nombre:'Grant Icewater', original:'Kanime Iderou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:70,defensa:84,especial:80,
  hissatsu:['Gravitación', 'Rayo de Ganímedes', 'Gravedad grave'],tipoTecnica:'defensa',
  desc:'Defensa de Tormenta de Géminis, dorsal 4.',
  locked:false,cost:134,
  sprite:'https://inazumarun.es/assets/sprites/r635.webp'
},
{
  id:'r636', equipo:'Tormenta de Géminis', nombre:'Charles Riverboat', original:'Karoku Satori',
  posicion:'Defensa', tipo:'Fuego',
  tiro:47,pase:74,defensa:83,especial:80,
  hissatsu:['Ciclón', 'Cinto astral', 'Astro Remate'],tipoTecnica:'defensa',
  desc:'Defensa de Tormenta de Géminis, dorsal 5.',
  locked:false,cost:134,
  sprite:'https://inazumarun.es/assets/sprites/r636.webp'
},
{
  id:'r637', equipo:'Tormenta de Géminis', nombre:'Izzy Jupiter', original:'Io Shuntarou',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:62,pase:76,defensa:58,especial:72,
  hissatsu:['Teleportación', 'Pantalla ígnea', 'Cañon de Meteoritos'],tipoTecnica:'regate',
  desc:'Centrocampista de Tormenta de Géminis, dorsal 8.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r637.webp'
},
{
  id:'r638', equipo:'Big Waves', nombre:'Sonny Shore', original:'Shine Beach',
  posicion:'Defensa', tipo:'Fuego',
  tiro:42,pase:60,defensa:79,especial:70,
  hissatsu:['Corte giratorio', 'Patada canguro', 'Corte Volcánico'],tipoTecnica:'defensa',
  desc:'Defensa de los Big Waves, dorsal 3.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r638.webp'
},
{
  id:'r639', equipo:'Big Waves', nombre:'Kjell Snapper', original:'Karmei Kohler',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:60,defensa:79,especial:70,
  hissatsu:['Dientes de roca', 'Terremoto', 'Bloqueo Ballena'],tipoTecnica:'defensa',
  desc:'Defensa de los Big Waves, dorsal 4.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r639.webp'
},
{
  id:'r640', equipo:'Big Waves', nombre:'Ken Crackham', original:'Clark Cain',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:60,defensa:79,especial:70,
  hissatsu:['Corte giratorio', 'Patada canguro', 'Escudo bárbaro'],tipoTecnica:'defensa',
  desc:'Defensa de los Big Waves, dorsal 5.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r640.webp'
},
{
  id:'r641', equipo:'Big Waves', nombre:'Matt Fischer', original:'Matt Angle',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:80,pase:81,defensa:55,especial:84,
  hissatsu:['Patada canguro', 'Telaraña', 'Remate Tsunami'],tipoTecnica:'regate',
  desc:'Centrocampista de los Big Waves, dorsal 7.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r641.webp'
},
{
  id:'r642', equipo:'Big Waves', nombre:'Hank Tennyson', original:'Surf Wyndhas',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:80,pase:81,defensa:55,especial:84,
  hissatsu:['Bomba géiser', 'Remate tsunami', 'Regate espejismo'],tipoTecnica:'regate',
  desc:'Centrocampista de los Big Waves, dorsal 8.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r642.webp'
},
{
  id:'r643', equipo:'Dragones de Fuego', nombre:'Jeongsu Cho', original:'Jo Jung-soo',
  posicion:'Portero', tipo:'Bosque',
  tiro:35,pase:58,defensa:80,especial:80,
  hissatsu:['Rechace de fuego', 'Parada fuerte', 'Combustión'],tipoTecnica:'portero',
  desc:'Portero de los Dragones de Fuego, dorsal 1.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r643.webp'
},
{
  id:'r644', equipo:'Dragones de Fuego', nombre:'Umi Hwang', original:'Hwang Woo-myang',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:69,defensa:86,especial:81,
  hissatsu:['Barrido defensivo', 'Estela ígnea', 'Estrella fugaz'],tipoTecnica:'defensa',
  desc:'Defensa de los Dragones de Fuego, dorsal 2.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r644.webp'
},
{
  id:'r645', equipo:'Dragones de Fuego', nombre:'Dooyoon Hong', original:'Hong Doo-yoon',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:69,defensa:86,especial:81,
  hissatsu:['Corte volcánico', 'Estela ígnea', 'Barrido Defensivo'],tipoTecnica:'defensa',
  desc:'Defensa de los Dragones de Fuego, dorsal 3.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r645.webp'
},
{
  id:'r646', equipo:'Dragones de Fuego', nombre:'Minho Cho', original:'Cho Myong-ho',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:69,defensa:86,especial:81,
  hissatsu:['Baile de llamas', 'Barrido defensivo', 'Flecha Divina'],tipoTecnica:'defensa',
  desc:'Defensa de los Dragones de Fuego, dorsal 4.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r646.webp'
},
{
  id:'r647', equipo:'Dragones de Fuego', nombre:'Songhwan Ko', original:'Ko Sung-hwan',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:69,defensa:86,especial:81,
  hissatsu:['Estela ígnea', 'Bateo total', 'Mandril'],tipoTecnica:'defensa',
  desc:'Defensa de los Dragones de Fuego, dorsal 5.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r647.webp'
},
{
  id:'r648', equipo:'Dragones de Fuego', nombre:'Paekyeong Park', original:'Park Baek-young',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:64,pase:90,defensa:76,especial:75,
  hissatsu:['Estela ígnea', 'Entrada de llamas', 'Pantalla ígnea'],tipoTecnica:'defensa',
  desc:'Centrocampista de los Dragones de Fuego, dorsal 6.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r648.webp'
},
{
  id:'r649', equipo:'Leones del desierto', nombre:'Sulayk Sulaiman', original:'Sulai Sulaiman',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:60,pase:76,defensa:51,especial:69,
  hissatsu:['Torbellino dragón', 'Bola falsa', 'Regate múltiple'],tipoTecnica:'regate',
  desc:'Centrocampista de los Leones del Desierto, dorsal 7.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r649.webp'
},
{
  id:'r650', equipo:'Leones del desierto', nombre:'Sayid Armand', original:'Seiyd Armand',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:60,pase:76,defensa:51,especial:69,
  hissatsu:['Entrada tormenta', 'Barrido defensivo', 'Arrollador 2/Coz 2'],tipoTecnica:'regate',
  desc:'Centrocampista de los Leones del Desierto, dorsal 8.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r650.webp'
},
{
  id:'r651', equipo:'Leones del desierto', nombre:'Mansur Jasim', original:'Messer Jassim',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:60,pase:76,defensa:51,especial:69,
  hissatsu:['Bola de fango', 'Escudo corporal', 'Arrollador 2/Coz 2'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Leones del Desierto, dorsal 9.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r651.webp'
},
{
  id:'r652', equipo:'Leones del desierto', nombre:'Zack Abdulla', original:'Zack Abdullah',
  posicion:'Delantero', tipo:'Fuego',
  tiro:85,pase:72,defensa:36,especial:77,
  hissatsu:['Tiro espejismo', 'Entrada tormenta', 'Colmillo de pantera'],tipoTecnica:'tiro',
  desc:'Delantero de los Leones del Desierto, dorsal 10.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r652.webp'
},
{
  id:'r653', equipo:'Leones del desierto', nombre:'Majdi Ismail', original:'Majidi Ismail',
  posicion:'Delantero', tipo:'Bosque',
  tiro:85,pase:72,defensa:36,especial:77,
  hissatsu:['Tiro espejismo', 'Astro remate', 'Garra Salvaje'],tipoTecnica:'tiro',
  desc:'Delantero de los Leones del Desierto, dorsal 11.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r653.webp'
},
{
  id:'r654', equipo:'Los Emperadores', nombre:'Jorge Ortega', original:'Jorge Ortega',
  posicion:'Portero', tipo:'Fuego',
  tiro:37,pase:60,defensa:84,especial:84,
  hissatsu:['Millón de manos', 'Muralla Infinita', 'Simún'],tipoTecnica:'portero',
  desc:'Portero de Los Emperadores, dorsal 1.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r654.webp'
},
{
  id:'r655', equipo:'Los Emperadores', nombre:'Julio Acosta', original:'Julio Acosta',
  posicion:'Defensa', tipo:'Bosque',
  tiro:39,pase:81,defensa:88,especial:84,
  hissatsu:['Bola falsa', 'Zigzag de fuego', 'Segadora'],tipoTecnica:'defensa',
  desc:'Defensa de Los Emperadores, dorsal 3.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r655.webp'
},
{
  id:'r656', equipo:'Los Emperadores', nombre:'Grande Díaz', original:'Gordo Díaz',
  posicion:'Defensa', tipo:'Bosque',
  tiro:38,pase:80,defensa:89,especial:84,
  hissatsu:['Zigzag de fuego', 'Millón de manos', 'Rueda infernal'],tipoTecnica:'defensa',
  desc:'Defensa de Los Emperadores, dorsal 4.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r656.webp'
},
{
  id:'r657', equipo:'Los Emperadores', nombre:'Ramón Martínez', original:'Ramón Martínez',
  posicion:'Defensa', tipo:'Montaña',
  tiro:38,pase:80,defensa:89,especial:84,
  hissatsu:['Voltereta circense', 'Estrella fugaz', 'Bomba acrobática'],tipoTecnica:'defensa',
  desc:'Defensa de Los Emperadores, dorsal 5.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r657.webp'
},
{
  id:'r658', equipo:'Los Emperadores', nombre:'Esteban Carlos', original:'Esteban Carlos',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:86,defensa:67,especial:83,
  hissatsu:['Balón galgo', 'Robo veloz', 'Corte Giratorio'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Emperadores, dorsal 6.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r658.webp'
},
{
  id:'r659', equipo:'Los Emperadores', nombre:'Sergio Pérez', original:'Sergio Pérez',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:76,pase:86,defensa:67,especial:83,
  hissatsu:['Espejismo', 'Zig Zag Explosivo', 'Carrera triple'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Emperadores, dorsal 7.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r659.webp'
},
{
  id:'r660', equipo:'Los Emperadores', nombre:'Roberto Torres', original:'Roberto Torres',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:86,defensa:67,especial:83,
  hissatsu:['Balón galgo', 'Ciclón', 'Puños voladores'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Emperadores, dorsal 8.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r660.webp'
},
{
  id:'r661', equipo:'Los Emperadores', nombre:'Pablo Castillo', original:'Pablo Castillo',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:86,defensa:67,especial:83,
  hissatsu:['Remate del águila', 'Zigzag de fuego', 'Triángulo Z'],tipoTecnica:'tiro',
  desc:'Centrocampista de Los Emperadores, dorsal 9.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r661.webp'
},
{
  id:'r662', equipo:'Los Emperadores', nombre:'Leone Badigo', original:'Leone Batigo',
  posicion:'Delantero', tipo:'Fuego',
  tiro:90,pase:79,defensa:46,especial:83,
  hissatsu:['Llamarada infernal', 'Ataque de cóndor', 'Remate del águila'],tipoTecnica:'tiro',
  desc:'Delantero de Los Emperadores, dorsal 10.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r662.webp'
},
{
  id:'r663', equipo:'Los Emperadores', nombre:'Diego Oro', original:'Diego Oro',
  posicion:'Delantero', tipo:'Montaña',
  tiro:88,pase:78,defensa:47,especial:83,
  hissatsu:['Llamarada infernal', 'Remate del águila', 'Paipay gigante'],tipoTecnica:'tiro',
  desc:'Delantero de Los Emperadores, dorsal 11.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r663.webp'
},
{
  id:'r664', equipo:'Orfeo', nombre:'Vento Galliano', original:'Vento Gagliano',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:66,defensa:79,especial:75,
  hissatsu:['Entrada huracán', 'Entrada tormenta', 'Escudo bárbaro'],tipoTecnica:'regate',
  desc:'Defensa del Orfeo, dorsal 2.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r664.webp'
},
{
  id:'r665', equipo:'Orfeo', nombre:'Otto Nobili', original:'Ottorino Nobili',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:66,defensa:79,especial:75,
  hissatsu:['Terremoto', 'Rayo de Ganímedes', 'Escudo de Fuerza Total'],tipoTecnica:'defensa',
  desc:'Defensa del Orfeo, dorsal 3.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r665.webp'
},
{
  id:'r666', equipo:'Orfeo', nombre:'Anton Graziuso', original:'Anton Gattsuso',
  posicion:'Defensa', tipo:'Fuego',
  tiro:49,pase:67,defensa:78,especial:75,
  hissatsu:['Pared solitaria', 'Defensa múltiple', 'Zona de seguridad'],tipoTecnica:'regate',
  desc:'Defensa del Orfeo, dorsal 4.',
  locked:false,cost:110,
  sprite:'https://inazumarun.es/assets/sprites/r666.webp'
},
{
  id:'r667', equipo:'Orfeo', nombre:'Giorgio Giannini', original:'Giorgio Giannini',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:77,pase:85,defensa:69,especial:85,
  hissatsu:['Ataque cortante', 'Hora celestial', 'Cúpula Sónica'],tipoTecnica:'defensa',
  desc:'Centrocampista del Orfeo, dorsal 8.',
  locked:true,cost:152,
  sprite:'https://inazumarun.es/assets/sprites/r667.webp'
},
{
  id:'r668', equipo:'Orfeo', nombre:'Dante Diavolo', original:'Dante Diavlo',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:85,defensa:69,especial:85,
  hissatsu:['Jaula de piedra', 'Segadora', 'Escudo bárbaro'],tipoTecnica:'defensa',
  desc:'Centrocampista del Orfeo, dorsal 9.',
  locked:true,cost:152,
  sprite:'https://inazumarun.es/assets/sprites/r668.webp'
},
{
  id:'r669', equipo:'Orfeo', nombre:'Raffaele Generani', original:'Raffaele Generani',
  posicion:'Delantero', tipo:'Montaña',
  tiro:88,pase:79,defensa:31,especial:82,
  hissatsu:['Remate de hielo', 'Robo veloz', 'Remate Triple'],tipoTecnica:'tiro',
  desc:'Delantero del Orfeo, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r669.webp'
},
{
  id:'r670', equipo:'Os Reis', nombre:'Antonio Bagre', original:'Bagre Antonio',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:77,defensa:83,especial:80,
  hissatsu:['Ciclón doble', 'Bomba acrobática', 'Segadora'],tipoTecnica:'defensa',
  desc:'Defensa de Os Reis, dorsal 3.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r670.webp'
},
{
  id:'r671', equipo:'Os Reis', nombre:'Monstro Ximenes', original:'Monstro',
  posicion:'Defensa', tipo:'Fuego',
  tiro:45,pase:77,defensa:83,especial:80,
  hissatsu:['Entrada rodante', 'Escudo Protector', 'Ataque cortante'],tipoTecnica:'defensa',
  desc:'Defensa de Os Reis, dorsal 4.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r671.webp'
},
{
  id:'r672', equipo:'Os Reis', nombre:'Presa Passos', original:'Presa',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:83,defensa:76,especial:78,
  hissatsu:['Entrada rodante', 'Zig Zag Explosivo', 'Danza del viento'],tipoTecnica:'defensa',
  desc:'Centrocampista de Os Reis, dorsal 6.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r672.webp'
},
{
  id:'r673', equipo:'Os Reis', nombre:'Borboleta Barboza', original:'Borboleta Barbosa',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:83,defensa:76,especial:78,
  hissatsu:['Regate espejismo', 'Tiro cegador', 'Tiro torre de Osaka'],tipoTecnica:'regate',
  desc:'Centrocampista de Os Reis, dorsal 7.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r673.webp'
},
{
  id:'r674', equipo:'Os Reis', nombre:'Coruja Cerezo', original:'Coruja Cerezo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:74,pase:83,defensa:76,especial:78,
  hissatsu:['Tiro cegador', 'Superaceleración', 'Superbalón rodante'],tipoTecnica:'tiro',
  desc:'Centrocampista de Os Reis, dorsal 8.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r674.webp'
},
{
  id:'r675', equipo:'Os Reis', nombre:'Gato Carvalho', original:'Gato',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:76,defensa:37,especial:84,
  hissatsu:['Tiro cegador', 'Balón galgo', 'Golpe de Samba'],tipoTecnica:'tiro',
  desc:'Delantero de Os Reis, dorsal 11.',
  locked:true,cost:210,
  sprite:'https://inazumarun.es/assets/sprites/r675.webp'
},
{
  id:'r676', equipo:'Pequeños Gigantes', nombre:'Jimi Gaines', original:'Jinny Geino',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:79,defensa:87,especial:78,
  hissatsu:['Ataque de las sombras', 'Espejismo', 'Ciclón doble'],tipoTecnica:'defensa',
  desc:'Defensa de los Pequeños Gigantes, dorsal 4.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r676.webp'
},
{
  id:'r677', equipo:'Pequeños Gigantes', nombre:'Ian Ferrum', original:'Marron Ian',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:79,defensa:87,especial:78,
  hissatsu:['Regate espejismo', 'Baile de llamas', 'Arcoiris luminoso'],tipoTecnica:'regate',
  desc:'Defensa de los Pequeños Gigantes, dorsal 5.',
  locked:true,cost:390,
  sprite:'https://inazumarun.es/assets/sprites/r677.webp'
},
{
  id:'r678', equipo:'Pequeños Gigantes', nombre:'Quint Hampton', original:'Shinti Hanpa',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:77,pase:81,defensa:74,especial:78,
  hissatsu:['Carrera relámpago', 'Estrella fugaz', 'Entrada Tormenta'],tipoTecnica:'regate',
  desc:'Centrocampista de los Pequeños Gigantes, dorsal 6.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r678.webp'
},
{
  id:'r679', equipo:'Pequeños Gigantes', nombre:'Yasir Haddad', original:'Yuumu Rinjie',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:81,defensa:74,especial:78,
  hissatsu:['Cabezazo kung fu', 'Torbellino dragón', 'Golpe doble'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Pequeños Gigantes, dorsal 7.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r679.webp'
},
{
  id:'r680', equipo:'Pequeños Gigantes', nombre:'Keith Ryan', original:'Keat Liando',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:81,defensa:74,especial:78,
  hissatsu:['Granada doble', 'Bola falsa', 'Bomba Falsa'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Pequeños Gigantes, dorsal 8.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r680.webp'
},
{
  id:'r681', equipo:'Ángeles Oscuros', nombre:'Astaroth', original:'Astaroth',
  posicion:'Portero', tipo:'Fuego',
  tiro:31,pase:54,defensa:81,especial:82,
  hissatsu:['El olvido', 'Araña gigante', 'Arrollador 3/Coz 3'],tipoTecnica:'portero',
  desc:'Portero de los Ángeles Oscuros, dorsal 1.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r681.webp'
},
{
  id:'r682', equipo:'Ángeles Oscuros', nombre:'Bael', original:'Beelzebu',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:65,defensa:77,especial:73,
  hissatsu:['Caída a los infiernos', 'Cinto astral', 'Gravitación'],tipoTecnica:'defensa',
  desc:'Defensa de los Ángeles Oscuros, dorsal 2.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r682.webp'
},
{
  id:'r683', equipo:'Ángeles Oscuros', nombre:'Abigor', original:'Abigorl',
  posicion:'Defensa', tipo:'Viento',
  tiro:44,pase:63,defensa:78,especial:73,
  hissatsu:['Balón diabólico', 'Gravitación', 'Campo de fuerza'],tipoTecnica:'regate',
  desc:'Defensa de los Ángeles Oscuros, dorsal 3.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r683.webp'
},
{
  id:'r684', equipo:'Ángeles Oscuros', nombre:'Behemoth', original:'Hebeemoth',
  posicion:'Defensa', tipo:'Bosque',
  tiro:44,pase:63,defensa:78,especial:73,
  hissatsu:['Caída a los infiernos', 'Gravitación', 'Escudo bárbaro'],tipoTecnica:'defensa',
  desc:'Defensa de los Ángeles Oscuros, dorsal 4.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r684.webp'
},
{
  id:'r685', equipo:'Ángeles Oscuros', nombre:'Belial', original:'Belial',
  posicion:'Defensa', tipo:'Viento',
  tiro:44,pase:63,defensa:78,especial:73,
  hissatsu:['Caída a los infiernos', 'Carga negativa', 'Gravedad grave'],tipoTecnica:'defensa',
  desc:'Defensa de los Ángeles Oscuros, dorsal 5.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r685.webp'
},
{
  id:'r686', equipo:'Ángeles Oscuros', nombre:'Malphas', original:'Mephisto',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:68,pase:76,defensa:58,especial:73,
  hissatsu:['Balón diabólico', 'Corte diabólico', 'Arrollador 2/Coz 2'],tipoTecnica:'regate',
  desc:'Centrocampista de los Ángeles Oscuros, dorsal 6.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r686.webp'
},
{
  id:'r687', equipo:'Ángeles Oscuros', nombre:'Glasya', original:'Glahsya',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:67,pase:77,defensa:57,especial:73,
  hissatsu:['Balón diabólico', 'Llamarada infernal', 'Escudo bárbaro'],tipoTecnica:'regate',
  desc:'Centrocampista de los Ángeles Oscuros, dorsal 7.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r687.webp'
},
{
  id:'r688', equipo:'Ángeles Oscuros', nombre:'Arachne', original:'Arachnes',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:77,defensa:57,especial:73,
  hissatsu:['Balón diabólico', 'Corte diabólico', 'Fuego total'],tipoTecnica:'regate',
  desc:'Centrocampista de los Ángeles Oscuros, dorsal 8.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r688.webp'
},
{
  id:'r689', equipo:'Ángeles Oscuros', nombre:'Jezebeth', original:'Barbatos',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:77,defensa:57,especial:73,
  hissatsu:['Caída a los infiernos', 'Lluvia de meteoros', 'Arrollador 2/Coz 2'],tipoTecnica:'defensa',
  desc:'Centrocampista de los Ángeles Oscuros, dorsal 9.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r689.webp'
},
{
  id:'r690', equipo:'Ángeles Oscuros', nombre:'Thanatos', original:'Satanatos',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:80,defensa:30,especial:77,
  hissatsu:['Carga negativa', 'Balón diabólico', 'Fénix Oscuro'],tipoTecnica:'tiro',
  desc:'Delantero de los Ángeles Oscuros, dorsal 10.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r690.webp'
},
{
  id:'r691', equipo:'Knights', nombre:'Edge Ripper', original:'Edge Ripper',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:55,defensa:79,especial:69,
  hissatsu:['Jaula de piedra', 'Corte giratorio', 'Golpe de vacío'],tipoTecnica:'defensa',
  desc:'Defensa de los Knights, dorsal 5.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r691.webp'
},
{
  id:'r692', equipo:'Knights', nombre:'Peter Cole', original:'Peter Cole',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:66,pase:76,defensa:57,especial:73,
  hissatsu:['Ultra lunar', 'Balón galgo', 'Cúpula Sónica'],tipoTecnica:'regate',
  desc:'Centrocampista de los Knights, dorsal 6.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r692.webp'
},
{
  id:'r693', equipo:'Knights', nombre:'Gary Mane', original:'Gary Links',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:66,pase:76,defensa:57,especial:73,
  hissatsu:['Ultra lunar', 'Giro bobina', 'Jaula de piedra'],tipoTecnica:'regate',
  desc:'Centrocampista de los Knights, dorsal 7.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r693.webp'
},
{
  id:'r694', equipo:'Knights', nombre:'Paul Appleton', original:'Paul Appleton',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:66,pase:76,defensa:57,especial:73,
  hissatsu:['Ultra lunar', 'Ciclón', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de los Knights, dorsal 8.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r694.webp'
},
{
  id:'r695', equipo:'Knights', nombre:'Eric Purpleton', original:'Eric Purpleton',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:66,pase:76,defensa:57,especial:73,
  hissatsu:['Ataque de paladín', 'Entrada de llamas', 'Carrera relámpago'],tipoTecnica:'tiro',
  desc:'Centrocampista de los Knights, dorsal 9.',
  locked:true,cost:365,
  sprite:'https://inazumarun.es/assets/sprites/r695.webp'
},
{
  id:'r696', equipo:'Knights', nombre:'Phillip Owen', original:'Philip Owen',
  posicion:'Delantero', tipo:'Montaña',
  tiro:89,pase:65,defensa:35,especial:78,
  hissatsu:['Ataque de paladín', 'Espejismo de balón', 'Carrera relámpago'],tipoTecnica:'tiro',
  desc:'Delantero de los Knights, dorsal 11.',
  locked:true,cost:189,
  sprite:'https://inazumarun.es/assets/sprites/r696.webp'
},
{
  id:'r697', equipo:'Unicorn', nombre:'Billy Dash', original:'Billy Rapid',
  posicion:'Portero', tipo:'Bosque',
  tiro:34,pase:57,defensa:84,especial:84,
  hissatsu:['Golpes de luz', 'Despeje cohete', 'Cañonazo'],tipoTecnica:'portero',
  desc:'Portero del Unicorn, dorsal 1.',
  locked:true,cost:370,
  sprite:'https://inazumarun.es/assets/sprites/r697.webp'
},
{
  id:'r698', equipo:'Unicorn', nombre:'Ted Bryant', original:'Ted Bryan',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:74,defensa:85,especial:79,
  hissatsu:['Robo veloz', 'Baile de llamas', 'Carga de poder'],tipoTecnica:'defensa',
  desc:'Defensa del Unicorn, dorsal 2.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r698.webp'
},
{
  id:'r699', equipo:'Unicorn', nombre:'Tony Strider', original:'Tony Stridas',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:75,defensa:84,especial:79,
  hissatsu:['Barrido defensivo', 'Ataque cortante', 'Remate Misil'],tipoTecnica:'defensa',
  desc:'Defensa del Unicorn, dorsal 3.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r699.webp'
},
{
  id:'r700', equipo:'Unicorn', nombre:'Drake Dynamo', original:'Dyke Dynamo',
  posicion:'Defensa', tipo:'Viento',
  tiro:54,pase:75,defensa:84,especial:79,
  hissatsu:['Ataque cortante', 'Mega terremoto', 'Golpes de luz'],tipoTecnica:'defensa',
  desc:'Defensa del Unicorn, dorsal 4.',
  locked:true,cost:380,
  sprite:'https://inazumarun.es/assets/sprites/r700.webp'
},
{
  id:'r701', equipo:'Unicorn', nombre:'Steve Woodmark', original:'Steve Woodmack',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:86,defensa:72,especial:85,
  hissatsu:['Barrido defensivo', 'Espejismo de balón', 'Ícaro'],tipoTecnica:'defensa',
  desc:'Centrocampista del Unicorn, dorsal 6.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r701.webp'
},
{
  id:'r702', equipo:'Unicorn', nombre:'Shane Pierce', original:'Sean Pierce',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:81,pase:86,defensa:72,especial:85,
  hissatsu:['Remate de hielo', 'Remate Pegaso', 'Zig Zag Explosivo'],tipoTecnica:'tiro',
  desc:'Centrocampista del Unicorn, dorsal 8.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r702.webp'
},
{
  id:'r703', equipo:'Zoolan Team', nombre:'Cyril Fox', original:'Fox',
  posicion:'Portero', tipo:'Montaña',
  tiro:41,pase:63,defensa:82,especial:84,
  hissatsu:['Parada fuerte', 'Araña gigante', 'Lluvia de Meteoros'],tipoTecnica:'portero',
  desc:'Portero del Zoolan Team, dorsal 1.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r703.webp'
},
{
  id:'r704', equipo:'Zoolan Team', nombre:'Jacques Allemand', original:'Jackal',
  posicion:'Defensa', tipo:'Bosque',
  tiro:58,pase:73,defensa:88,especial:85,
  hissatsu:['Ataque de las sombras', 'Tacón infernal', 'Corte Diabólico'],tipoTecnica:'defensa',
  desc:'Defensa del Zoolan Team, dorsal 2.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r704.webp'
},
{
  id:'r705', equipo:'Zoolan Team', nombre:'Buddy Plains', original:'Buffalo',
  posicion:'Defensa', tipo:'Bosque',
  tiro:58,pase:74,defensa:89,especial:86,
  hissatsu:['Coz 3', 'Corte diabólico', 'Arrollador 2/Coz 2'],tipoTecnica:'regate',
  desc:'Defensa del Zoolan Team, dorsal 4.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r705.webp'
},
{
  id:'r706', equipo:'Zoolan Team', nombre:'Dean Goddard', original:'Dingo',
  posicion:'Defensa', tipo:'Montaña',
  tiro:58,pase:73,defensa:88,especial:85,
  hissatsu:['Espejismo de balón', 'Cinto astral', 'Carrera a tres piernas'],tipoTecnica:'regate',
  desc:'Defensa del Zoolan Team, dorsal 5.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r706.webp'
},
{
  id:'r707', equipo:'Zoolan Team', nombre:'Cecil Crowley', original:'Owl',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:80,pase:90,defensa:71,especial:87,
  hissatsu:['Remate del águila', 'Coz 3', 'Estrella fugaz'],tipoTecnica:'tiro',
  desc:'Centrocampista del Zoolan Team, dorsal 6.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r707.webp'
},
{
  id:'r708', equipo:'Zoolan Team', nombre:'Seth Hedges', original:'Hedgehog',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:89,defensa:70,especial:86,
  hissatsu:['Escudo corporal', 'Ultra lunar', 'Gravedad grave'],tipoTecnica:'defensa',
  desc:'Centrocampista del Zoolan Team, dorsal 7.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r708.webp'
},
{
  id:'r709', equipo:'Zoolan Team', nombre:'Niccolo Mantegna', original:'Mantis',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:80,pase:90,defensa:71,especial:87,
  hissatsu:['Gravitación', 'Coz 3', 'Muro Dimensional'],tipoTecnica:'defensa',
  desc:'Centrocampista del Zoolan Team, dorsal 8.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r709.webp'
},
{
  id:'r710', equipo:'Zoolan Team', nombre:'Damien Crawford', original:'Crow',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:79,pase:89,defensa:70,especial:86,
  hissatsu:['Corte diabólico', 'Triangulo letal', 'Ancla de navío'],tipoTecnica:'defensa',
  desc:'Centrocampista del Zoolan Team, dorsal 9.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r710.webp'
},
{
  id:'r711', equipo:'Zoolan Team', nombre:'Avinash Chowdhury', original:'Coyote',
  posicion:'Delantero', tipo:'Viento',
  tiro:88,pase:78,defensa:51,especial:83,
  hissatsu:['Tornado oscuro', 'Cañonazo', 'Gravedad grave'],tipoTecnica:'tiro',
  desc:'Delantero del Zoolan Team, dorsal 10.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r711.webp'
},
{
  id:'r712', equipo:'Zoolan Team', nombre:'Sedgley Scofield', original:'Scorpio',
  posicion:'Delantero', tipo:'Bosque',
  tiro:87,pase:79,defensa:50,especial:83,
  hissatsu:['Entrada tormenta', 'Fénix oscuro', 'Rayo de Ganímedes'],tipoTecnica:'regate',
  desc:'Delantero del Zoolan Team, dorsal 11.',
  locked:true,cost:184,
  sprite:'https://inazumarun.es/assets/sprites/r712.webp'
},

// ===== Inazuma Eleven GO 1: plantillas completas (wiki en español) =====
{
  id:'r713', equipo:'Raimon GO', nombre:'Jean-Pierre Lapin', original:'Nishizono Shinsuke',
  posicion:'Defensa', tipo:'Montaña',
  tiro:51,pase:73,defensa:82,especial:79,
  hissatsu:['Salto incandescente', 'Defensa propulsada', 'Parada en Plancha'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Raimon en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r713.webp'
},
{
  id:'r714', equipo:'Raimon GO', equiposExtra:['Caballeros de la Mesa Redonda'], nombre:'Adé Kébé', original:'Adé Kébé',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:86,defensa:75,especial:82,
  hissatsu:['Remolino acuático', 'Peces voladores', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Centrocampista del Instituto Raimon en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r714.webp'
},
{
  id:'r715', equipo:'Raimon GO', nombre:'Eugene Peabody', original:'Eugene Peabody',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:86,defensa:71,especial:83,
  hissatsu:['Arrancada', 'Danza del viento'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Raimon en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r715.webp'
},
{
  id:'r716', equipo:'Raimon GO', equiposExtra:['Caballeros de la Mesa Redonda'], nombre:'Michael Ballzack', original:'Michael Ballzack',
  posicion:'Delantero', tipo:'Montaña',
  tiro:87,pase:72,defensa:48,especial:81,
  hissatsu:['Cascabel', 'Finta boomerang'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Raimon en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r716.webp'
},
{
  id:'r717', equipo:'Raimon GO', nombre:'Shunsuke Aoyama', original:'Shunsuke Aoyama',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:80,pase:86,defensa:74,especial:84,
  hissatsu:['Mirada ladrona', 'Visto y no visto', 'Pingüino emperador n.º 2'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Raimon en Inazuma Eleven GO, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r717.webp'
},
{
  id:'r718', equipo:'Raimon GO', nombre:'Hugues Baudet', original:'Hugues Baudet',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:80,pase:85,defensa:71,especial:84,
  hissatsu:['Danza del viento', 'Círculo de hielo'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Raimon en Inazuma Eleven GO, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r718.webp'
},
{
  id:'r719', equipo:'Raimon GO', equiposExtra:['Caballeros de la Mesa Redonda'], nombre:'Lucian Dark', original:'Kageyama Hikaru',
  posicion:'Delantero', tipo:'Bosque',
  tiro:87,pase:74,defensa:50,especial:79,
  hissatsu:['Pingüino emperador 7', 'Regate supersónico', 'Pingüino emperador n.º 2'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Raimon en Inazuma Eleven GO, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r719.webp'
},
{
  id:'r720', equipo:'Poderosa Fe', nombre:'Aum Nirvana', original:'Aum Nirvana',
  posicion:'Portero', tipo:'Viento',
  tiro:28,pase:63,defensa:75,especial:75,
  hissatsu:['Ultrasonidos', 'Barrera de cristal', 'Jinete de la tormenta'],tipoTecnica:'parada',
  desc:'Portero del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r720.webp'
},
{
  id:'r721', equipo:'Poderosa Fe', nombre:'Adamant Walhalla', original:'Adamant Walhalla',
  posicion:'Defensa', tipo:'Viento',
  tiro:40,pase:67,defensa:79,especial:76,
  hissatsu:['Carga de elefantes', 'Ataque de la ballena', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r721.webp'
},
{
  id:'r722', equipo:'Poderosa Fe', nombre:'Omega Elysium', original:'Omega Elysium',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:69,defensa:77,especial:73,
  hissatsu:['Carga de elefantes', 'A todo vapor'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r722.webp'
},
{
  id:'r723', equipo:'Poderosa Fe', nombre:'Fürimmer Jung', original:'Fürimmer Jung',
  posicion:'Defensa', tipo:'Bosque',
  tiro:53,pase:71,defensa:82,especial:75,
  hissatsu:['Carga de elefantes', 'Red de caza', 'Truco balonazo'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r723.webp'
},
{
  id:'r724', equipo:'Poderosa Fe', nombre:'Zenith Shangrila', original:'Zenith Shangrila',
  posicion:'Defensa', tipo:'Fuego',
  tiro:47,pase:72,defensa:81,especial:75,
  hissatsu:['Mirada ladrona', 'Finta boomerang'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r724.webp'
},
{
  id:'r725', equipo:'Poderosa Fe', nombre:'Optimum Limbo', original:'Optimum Limbo',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:74,pase:81,defensa:66,especial:75,
  hissatsu:['Finta boomerang', 'Cabezazo bazuca', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r725.webp'
},
{
  id:'r726', equipo:'Poderosa Fe', nombre:'Panacea Utopia', original:'Panacea Utopia',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:81,defensa:69,especial:76,
  hissatsu:['Finta boomerang', 'La niebla'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r726.webp'
},
{
  id:'r727', equipo:'Poderosa Fe', nombre:'Acme Rapture', original:'Acme Rapture',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:74,pase:82,defensa:63,especial:77,
  hissatsu:['Finta boomerang', 'Bomba saltarina'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r727.webp'
},
{
  id:'r728', equipo:'Poderosa Fe', nombre:'Ultima Nextworld', original:'Ultima Nextworld',
  posicion:'Delantero', tipo:'Viento',
  tiro:83,pase:69,defensa:42,especial:73,
  hissatsu:['Bomba saltarina', 'Finta boomerang'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r728.webp'
},
{
  id:'r729', equipo:'Poderosa Fe', nombre:'Apex Paradiso', original:'Apex Paradiso',
  posicion:'Portero', tipo:'Fuego',
  tiro:25,pase:59,defensa:69,especial:71,
  hissatsu:['Parada ardiente', 'Piroquinesis', 'Escudo de Fuerza'],tipoTecnica:'portero',
  desc:'Portero del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r729.webp'
},
{
  id:'r730', equipo:'Poderosa Fe', nombre:'Pearl Gates', original:'Pearl Gates',
  posicion:'Delantero', tipo:'Viento',
  tiro:72,pase:62,defensa:49,especial:67,
  hissatsu:['Bomba saltarina', 'Piroquinesis', 'Espejismo'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r730.webp'
},
{
  id:'r731', equipo:'Poderosa Fe', nombre:'Perpetuo Xanadu', original:'Perpetuo Xanadu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:73,defensa:61,especial:70,
  hissatsu:['Finta boomerang', 'Guardia acrobática'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r731.webp'
},
{
  id:'r732', equipo:'Poderosa Fe', nombre:'Sempiterno Bliss', original:'Sempiterno Bliss',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:76,defensa:56,especial:69,
  hissatsu:['Finta boomerang', 'Fuerza centrífuga'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r732.webp'
},
{
  id:'r733', equipo:'Poderosa Fe', nombre:'Myriad Arcadia', original:'Myriad Arcadia',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:64,defensa:76,especial:70,
  hissatsu:['Mirada ladrona', 'Finta boomerang'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Poderosa Fe en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r733.webp'
},
{
  id:'r734', equipo:'Royal Academy GO', nombre:'Preston Princeton', original:'Preston Princeton',
  posicion:'Portero', tipo:'Bosque',
  tiro:31,pase:52,defensa:82,especial:80,
  hissatsu:['Despeje de fuerza', 'Rotación inversa', 'Parada en pirueta'],tipoTecnica:'parada',
  desc:'Portero y capitán del Royal Academy en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r734.webp'
},
{
  id:'r735', equipo:'Royal Academy GO', nombre:'Duke Dartmouth', original:'Duke Dartmouth',
  posicion:'Defensa', tipo:'Montaña',
  tiro:51,pase:75,defensa:84,especial:78,
  hissatsu:['Gran torbellino', 'Picadora', 'Gran seísmo'],tipoTecnica:'defensa',
  desc:'Defensa del Royal Academy en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r735.webp'
},
{
  id:'r736', equipo:'Royal Academy GO', nombre:'Baron Oxford', original:'Baron Oxford',
  posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:74,defensa:83,especial:77,
  hissatsu:['Cruce explosivo', 'Picadora', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Royal Academy en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r736.webp'
},
{
  id:'r737', equipo:'Royal Academy GO', nombre:'Cameron Cambridge', original:'Cameron Cambridge',
  posicion:'Defensa', tipo:'Bosque',
  tiro:51,pase:73,defensa:83,especial:75,
  hissatsu:['Gran torbellino', 'Pingüino emperador 7'],tipoTecnica:'defensa',
  desc:'Defensa del Royal Academy en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r737.webp'
},
{
  id:'r738', equipo:'Royal Academy GO', nombre:'Caesar Cornell', original:'Caesar Cornell',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:83,defensa:71,especial:78,
  hissatsu:['Cruce explosivo', 'Gran torbellino'],tipoTecnica:'regate',
  desc:'Centrocampista del Royal Academy en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r738.webp'
},
{
  id:'r739', equipo:'Royal Academy GO', nombre:'Hampton Harvard', original:'Hampton Harvard',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:75,pase:87,defensa:67,especial:83,
  hissatsu:['Cruce explosivo', 'Defensa propulsada'],tipoTecnica:'regate',
  desc:'Centrocampista del Royal Academy en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r739.webp'
},
{
  id:'r740', equipo:'Royal Academy GO', nombre:'Earl Eton', original:'Earl Eton',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:87,defensa:69,especial:79,
  hissatsu:['A todo vapor', 'Gran torbellino'],tipoTecnica:'regate',
  desc:'Centrocampista del Royal Academy en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r740.webp'
},
{
  id:'r741', equipo:'Royal Academy GO', nombre:'Sterling Stanford', original:'Sterling Stanford',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:76,pase:86,defensa:65,especial:81,
  hissatsu:['Cruce explosivo', 'Trayectoria perfecta'],tipoTecnica:'regate',
  desc:'Centrocampista del Royal Academy en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r741.webp'
},
{
  id:'r742', equipo:'Royal Academy GO', nombre:'Colby Columbia', original:'Colby Columbia',
  posicion:'Delantero', tipo:'Fuego',
  tiro:83,pase:73,defensa:37,especial:78,
  hissatsu:['Pingüino emperador 7', 'Mirada ladrona'],tipoTecnica:'tiro',
  desc:'Delantero del Royal Academy en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r742.webp'
},
{
  id:'r743', equipo:'Royal Academy GO', nombre:'Fred Featherstonhaugh', original:'Fred Featherstonhaugh',
  posicion:'Portero', tipo:'Montaña',
  tiro:27,pase:53,defensa:72,especial:70,
  hissatsu:['Puños certeros', 'Despeje de fuerza', 'Rechace de fuego'],tipoTecnica:'parada',
  desc:'Portero del Royal Academy en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r743.webp'
},
{
  id:'r744', equipo:'Royal Academy GO', nombre:'Arthur Ascot', original:'Arthur Ascot',
  posicion:'Defensa', tipo:'Viento',
  tiro:55,pase:66,defensa:77,especial:73,
  hissatsu:['Pingüino emperador 7', 'Cruce explosivo'],tipoTecnica:'tiro',
  desc:'Defensa del Royal Academy en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r744.webp'
},
{
  id:'r745', equipo:'Royal Academy GO', nombre:'Stuart St. John', original:'Stuart St. John',
  posicion:'Defensa', tipo:'Bosque',
  tiro:39,pase:68,defensa:78,especial:73,
  hissatsu:['La niebla', 'Truco balonazo'],tipoTecnica:'defensa',
  desc:'Defensa del Royal Academy en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r745.webp'
},
{
  id:'r746', equipo:'Royal Academy GO', nombre:'Wenceslas Wales', original:'Wenceslas Wales',
  posicion:'Delantero', tipo:'Fuego',
  tiro:80,pase:66,defensa:36,especial:70,
  hissatsu:['Proyectil letal', 'Bomba saltarina'],tipoTecnica:'tiro',
  desc:'Delantero del Royal Academy en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r746.webp'
},
{
  id:'r747', equipo:'Royal Academy GO', nombre:'Yorick York', original:'Yorick York',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:80,defensa:62,especial:77,
  hissatsu:['Cruce explosivo', 'Arrancada'],tipoTecnica:'regate',
  desc:'Centrocampista del Royal Academy en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r747.webp'
},
{
  id:'r748', equipo:'Cala Pirata', nombre:'Ishmael Ahab', original:'Ishmael Ahab',
  posicion:'Portero', tipo:'Viento',
  tiro:25,pase:56,defensa:76,especial:76,
  hissatsu:['Ancla de navío', 'Puños certeros', 'Parada fuerte'],tipoTecnica:'parada',
  desc:'Portero del Academia Cala Pirata en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r748.webp'
},
{
  id:'r749', equipo:'Cala Pirata', nombre:'Roger Jolly', original:'Roger Jolly',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:67,defensa:81,especial:74,
  hissatsu:['Ataque de la ballena', 'Remolino acuático', 'Corte Giratorio'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Cala Pirata en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r749.webp'
},
{
  id:'r750', equipo:'Cala Pirata', nombre:'Sinbad Saylor', original:'Sinbad Saylor',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:67,defensa:79,especial:76,
  hissatsu:['Ataque de la ballena', 'Danza del viento', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Cala Pirata en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r750.webp'
},
{
  id:'r751', equipo:'Cala Pirata', nombre:'Rob Crusoe', original:'Rob Crusoe',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:70,defensa:85,especial:76,
  hissatsu:['Ataque de la ballena', 'Remolino ígneo', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Cala Pirata en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r751.webp'
},
{
  id:'r752', equipo:'Cala Pirata', nombre:'Cheung Po', original:'Cheung Po',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:74,pase:84,defensa:71,especial:83,
  hissatsu:['Remolino acuático', 'Gran torbellino'],tipoTecnica:'defensa',
  desc:'Centrocampista del Academia Cala Pirata en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r752.webp'
},
{
  id:'r753', equipo:'Cala Pirata', nombre:'William Kidd', original:'William Kidd',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:75,pase:81,defensa:64,especial:80,
  hissatsu:['Danza del viento', 'Peces voladores', 'Remolino acuático'],tipoTecnica:'regate',
  desc:'Centrocampista del Academia Cala Pirata en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r753.webp'
},
{
  id:'r754', equipo:'Cala Pirata', nombre:'Santelmo Phyre', original:'Santelmo Phyre',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:72,pase:85,defensa:63,especial:80,
  hissatsu:['Danza del viento', 'Ataque de la ballena', 'Gran Torbellino'],tipoTecnica:'regate',
  desc:'Centrocampista del Academia Cala Pirata en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r754.webp'
},
{
  id:'r755', equipo:'Cala Pirata', equiposExtra:['Sector Quinto'], nombre:'Dakkar Nemo', original:'Wanda Naoto',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:83,defensa:72,especial:81,
  hissatsu:['Cruce explosivo', 'Tiro Sónico', 'Ataque de la ballena'],tipoTecnica:'regate',
  desc:'Centrocampista del Academia Cala Pirata en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r755.webp'
},
{
  id:'r756', equipo:'Cala Pirata', nombre:'Calico Corsair', original:'Calico Corsair',
  posicion:'Delantero', tipo:'Bosque',
  tiro:83,pase:67,defensa:36,especial:75,
  hissatsu:['Peces voladores', 'Danza del viento'],tipoTecnica:'regate',
  desc:'Delantero del Academia Cala Pirata en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r756.webp'
},
{
  id:'r757', equipo:'Cala Pirata', nombre:'Nick Tofobia', original:'Nick Tofobia',
  posicion:'Portero', tipo:'Fuego',
  tiro:22,pase:58,defensa:73,especial:71,
  hissatsu:['Ultrasonidos', 'Ancla de navío', 'Parada fuerte'],tipoTecnica:'parada',
  desc:'Portero del Academia Cala Pirata en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r757.webp'
},
{
  id:'r758', equipo:'Cala Pirata', nombre:'Marley Hookson', original:'Marley Hookson',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:75,defensa:61,especial:73,
  hissatsu:['Peces voladores', 'Cabezazo bazuca', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Centrocampista del Academia Cala Pirata en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r758.webp'
},
{
  id:'r759', equipo:'Cala Pirata', nombre:'Bart Black', original:'Bart Black',
  posicion:'Defensa', tipo:'Viento',
  tiro:40,pase:67,defensa:75,especial:71,
  hissatsu:['Gran torbellino', 'Rodillazos atómicos', 'Proyectil de Ozono'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Cala Pirata en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r759.webp'
},
{
  id:'r760', equipo:'Cala Pirata', nombre:'Frank Drake', original:'Frank Drake',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:62,defensa:77,especial:71,
  hissatsu:['Gran torbellino', 'La gran muralla', 'Zona de seguridad'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Cala Pirata en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r760.webp'
},
{
  id:'r761', equipo:'Cala Pirata', nombre:'Barnabas Rossa', original:'Barnabas Rossa',
  posicion:'Delantero', tipo:'Bosque',
  tiro:76,pase:66,defensa:46,especial:68,
  hissatsu:['Peces voladores', 'Finta boomerang'],tipoTecnica:'regate',
  desc:'Delantero del Academia Cala Pirata en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r761.webp'
},
{
  id:'r762', equipo:'Mar de Luna', nombre:'Gene Ghiskhan', original:'Kanehira Tessai',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:71,defensa:86,especial:80,
  hissatsu:['Picadora', 'Carga de elefantes', 'El Muro'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r762.webp'
},
{
  id:'r763', equipo:'Mar de Luna', nombre:'Attila Hun', original:'Osafune Tenzen',
  posicion:'Defensa', tipo:'Fuego',
  tiro:45,pase:71,defensa:83,especial:77,
  hissatsu:['Picadora', 'Cabezazo bazuca', 'Pinzas cortantes'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r763.webp'
},
{
  id:'r764', equipo:'Mar de Luna', nombre:'Sun Tzu', original:'Hachisuka Tadatora',
  posicion:'Defensa', tipo:'Viento',
  tiro:44,pase:70,defensa:84,especial:77,
  hissatsu:['Picadora', 'Campo torbellino', 'Corte Giratorio'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r764.webp'
},
{
  id:'r765', equipo:'Mar de Luna', nombre:'Arty Xerxes', original:'Arty Xerxes',
  posicion:'Defensa', tipo:'Bosque',
  tiro:44,pase:71,defensa:81,especial:76,
  hissatsu:['Picadora', 'Espejismo de balón'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r765.webp'
},
{
  id:'r766', equipo:'Mar de Luna', nombre:'Darius Cyrus', original:'Darius Cyrus',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:85,defensa:68,especial:79,
  hissatsu:['Mina terrestre', 'Gran torbellino'],tipoTecnica:'regate',
  desc:'Centrocampista del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r766.webp'
},
{
  id:'r767', equipo:'Mar de Luna', nombre:'Jerry Onimo', original:'Jerry Onimo',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:84,defensa:73,especial:82,
  hissatsu:['Mina terrestre', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Centrocampista del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r767.webp'
},
{
  id:'r768', equipo:'Mar de Luna', nombre:'Leon Ohnepart', original:'Leon Ohnepart',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:81,defensa:67,especial:80,
  hissatsu:['Mina terrestre', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Centrocampista del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r768.webp'
},
{
  id:'r769', equipo:'Mar de Luna', nombre:'Robert Lee', original:'Robert Lee',
  posicion:'Delantero', tipo:'Montaña',
  tiro:82,pase:71,defensa:42,especial:75,
  hissatsu:['Cabezazo cohete', 'Cascabel'],tipoTecnica:'tiro',
  desc:'Delantero del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r769.webp'
},
{
  id:'r770', equipo:'Mar de Luna', nombre:'Nobby Naga', original:'Ichimonji Kirito',
  posicion:'Delantero', tipo:'Viento',
  tiro:81,pase:70,defensa:42,especial:74,
  hissatsu:['Cabezazo cohete', 'Tiro vendaval', 'Mina terrestre'],tipoTecnica:'tiro',
  desc:'Delantero del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r770.webp'
},
{
  id:'r771', equipo:'Mar de Luna', nombre:'Salvador Addin', original:'Salvador Addin',
  posicion:'Portero', tipo:'Viento',
  tiro:32,pase:51,defensa:72,especial:70,
  hissatsu:['Despeje de fuerza', 'Ataque de la ballena', 'Parada fuerte'],tipoTecnica:'parada',
  desc:'Portero del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r771.webp'
},
{
  id:'r772', equipo:'Mar de Luna', nombre:'Otto Bismark', original:'Otto Bismark',
  posicion:'Defensa', tipo:'Bosque',
  tiro:56,pase:68,defensa:76,especial:72,
  hissatsu:['Pentagrama', 'Visto y no visto', 'Mina terrestre'],tipoTecnica:'tiro',
  desc:'Defensa del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r772.webp'
},
{
  id:'r773', equipo:'Mar de Luna', nombre:'Jean Darc', original:'Jean Darc',
  posicion:'Defensa', tipo:'Bosque',
  tiro:57,pase:67,defensa:77,especial:72,
  hissatsu:['Defensa propulsada', 'Pinzas cortantes'],tipoTecnica:'defensa',
  desc:'Defensa del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r773.webp'
},
{
  id:'r774', equipo:'Mar de Luna', nombre:'Bobby Bruce', original:'Bobby Bruce',
  posicion:'Delantero', tipo:'Montaña',
  tiro:79,pase:66,defensa:38,especial:71,
  hissatsu:['Cabezazo bazuca', 'A todo vapor', 'Bomba saltarina'],tipoTecnica:'tiro',
  desc:'Delantero del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r774.webp'
},
{
  id:'r775', equipo:'Mar de Luna', nombre:'Hanny Bawl', original:'Hanny Bawl',
  posicion:'Delantero', tipo:'Viento',
  tiro:78,pase:67,defensa:41,especial:71,
  hissatsu:['Tiro sónico', 'Mirada ladrona'],tipoTecnica:'tiro',
  desc:'Delantero del Academia Militar Mar de Luna en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r775.webp'
},
{
  id:'r776', equipo:'Instituto Espejismo', nombre:'Abram Cadabra', original:'Abram Cadabra',
  posicion:'Portero', tipo:'Montaña',
  tiro:25,pase:53,defensa:82,especial:78,
  hissatsu:['Presa de sombras', 'Mordisco de serpiente'],tipoTecnica:'parada',
  desc:'Portero del Instituto Espejismo en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r776.webp'
},
{
  id:'r777', equipo:'Instituto Espejismo', nombre:'Jaymes Randie', original:'Jaymes Randie',
  posicion:'Defensa', tipo:'Bosque',
  tiro:56,pase:73,defensa:83,especial:81,
  hissatsu:['Corte Mágico', 'Niebla mística', 'Espejismo de balón'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Espejismo en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r777.webp'
},
{
  id:'r778', equipo:'Instituto Espejismo', nombre:'Daffyd Blayne', original:'Daffyd Blayne',
  posicion:'Defensa', tipo:'Fuego',
  tiro:41,pase:74,defensa:85,especial:78,
  hissatsu:['Finta boomerang', 'Corte Mágico'],tipoTecnica:'regate',
  desc:'Defensa del Instituto Espejismo en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r778.webp'
},
{
  id:'r779', equipo:'Instituto Espejismo', nombre:'Al Kazam', original:'Al Kazam',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:73,defensa:86,especial:81,
  hissatsu:['Danza del viento', 'Truco balonazo', 'Corte Mágico'],tipoTecnica:'regate',
  desc:'Defensa del Instituto Espejismo en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r779.webp'
},
{
  id:'r780', equipo:'Instituto Espejismo', nombre:'Sigfryd Roi', original:'Sigfryd Roi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:74,defensa:84,especial:79,
  hissatsu:['Corte Mágico', 'Cascabel'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Espejismo en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r780.webp'
},
{
  id:'r781', equipo:'Instituto Espejismo', nombre:'Dave Coppfielder', original:'Dave Coppfielder',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:75,pase:85,defensa:71,especial:81,
  hissatsu:['Truco balonazo', 'La niebla'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Espejismo en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r781.webp'
},
{
  id:'r782', equipo:'Instituto Espejismo', nombre:'Launce Berton', original:'Launce Berton',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:75,pase:86,defensa:71,especial:80,
  hissatsu:['Truco balonazo', 'Corte Mágico'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Espejismo en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r782.webp'
},
{
  id:'r783', equipo:'Instituto Espejismo', nombre:'Ledger Demain', original:'Ledger Demain',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:79,pase:88,defensa:66,especial:83,
  hissatsu:['Truco balonazo', 'La niebla', 'Corte Mágico'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Espejismo en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r783.webp'
},
{
  id:'r784', equipo:'Instituto Espejismo', nombre:'Pen Teller', original:'Pen Teller',
  posicion:'Portero', tipo:'Viento',
  tiro:33,pase:60,defensa:72,especial:72,
  hissatsu:['Ultrasonidos', 'Presa de sombras', 'Puente sin final'],tipoTecnica:'parada',
  desc:'Portero del Instituto Espejismo en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r784.webp'
},
{
  id:'r785', equipo:'Instituto Espejismo', nombre:'Petey Sorcar', original:'Petey Sorcar',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:67,defensa:80,especial:72,
  hissatsu:['Finta boomerang', 'La niebla', 'Espejismo de balón'],tipoTecnica:'regate',
  desc:'Defensa del Instituto Espejismo en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r785.webp'
},
{
  id:'r786', equipo:'Instituto Espejismo', nombre:'Trump Loyal', original:'Trump Loyal',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:79,defensa:60,especial:73,
  hissatsu:['Trayectoria perfecta', 'Visto y no visto'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Espejismo en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r786.webp'
},
{
  id:'r787', equipo:'Instituto Espejismo', nombre:'Daren Blakh', original:'Daren Blakh',
  posicion:'Delantero', tipo:'Viento',
  tiro:80,pase:68,defensa:48,especial:74,
  hissatsu:['Espejismo de balón', 'Ventisca eterna', 'Cascabel'],tipoTecnica:'regate',
  desc:'Delantero del Instituto Espejismo en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r787.webp'
},
{
  id:'r788', equipo:'Instituto Espejismo', nombre:'Billy Lingsoo', original:'Billy Lingsoo',
  posicion:'Delantero', tipo:'Fuego',
  tiro:81,pase:67,defensa:38,especial:74,
  hissatsu:['Cabezazo cohete', 'Remolino acuático'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Espejismo en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r788.webp'
},
{
  id:'r789', equipo:'Academia Universal', nombre:'Auberon Ouranos', original:'Auberon Ouranos',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:78,defensa:87,especial:81,
  hissatsu:['Luz cegadora', 'Mirada ladrona'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Universal en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r789.webp'
},
{
  id:'r790', equipo:'Academia Universal', nombre:'Manning Moon', original:'Manning Moon',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:76,defensa:87,especial:80,
  hissatsu:['Luz cegadora', 'Paisaje helado'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Universal en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r790.webp'
},
{
  id:'r791', equipo:'Academia Universal', nombre:'Terran Gaea', original:'Terran Gaea',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:74,defensa:85,especial:81,
  hissatsu:['Luz cegadora', 'Danza del viento'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Universal en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r791.webp'
},
{
  id:'r792', equipo:'Academia Universal', nombre:'Crateris Mercury', original:'Crateris Mercury',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:75,defensa:88,especial:80,
  hissatsu:['Luz cegadora', 'Brisa deslizante', 'Entrada huracán'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Universal en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r792.webp'
},
{
  id:'r793', equipo:'Academia Universal', nombre:'Nix Pluto', original:'Nix Pluto',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:79,pase:85,defensa:73,especial:83,
  hissatsu:['Trance melódico', 'Arrancada', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Universal en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r793.webp'
},
{
  id:'r794', equipo:'Academia Universal', nombre:'Neith Venus', original:'Neith Venus',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:80,pase:87,defensa:75,especial:82,
  hissatsu:['Trance melódico', 'Pentagrama', 'Flash de fotones'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Universal en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r794.webp'
},
{
  id:'r795', equipo:'Academia Universal', nombre:'Callis Jove', original:'Callis Jove',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:78,pase:84,defensa:68,especial:82,
  hissatsu:['Trance melódico', 'Visto y no visto', 'Esferas luminosas'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Universal en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r795.webp'
},
{
  id:'r796', equipo:'Academia Universal', nombre:'Deimos Mars', original:'Deimos Mars',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:85,defensa:70,especial:83,
  hissatsu:['Cañón de meteoritos', 'Piroquinesis', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Universal en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r796.webp'
},
{
  id:'r797', equipo:'Academia Universal', nombre:'Triton Nettuno', original:'Triton Nettuno',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:73,defensa:46,especial:80,
  hissatsu:['Cañón de meteoritos', 'Visto y no visto'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Universal en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r797.webp'
},
{
  id:'r798', equipo:'Academia Universal', nombre:'Astro Ceres', original:'Astro Ceres',
  posicion:'Portero', tipo:'Viento',
  tiro:20,pase:55,defensa:75,especial:73,
  hissatsu:['Mano celestial', 'Estrella reflectante', 'Parada fuerte'],tipoTecnica:'portero',
  desc:'Portero del Instituto Universal en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r798.webp'
},
{
  id:'r799', equipo:'Academia Universal', nombre:'Chiron Vestal', original:'Chiron Vestal',
  posicion:'Delantero', tipo:'Montaña',
  tiro:83,pase:68,defensa:47,especial:77,
  hissatsu:['Cascabel', 'Finta boomerang'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Universal en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r799.webp'
},
{
  id:'r800', equipo:'Academia Universal', nombre:'Xeno Eris', original:'Xeno Eris',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:70,pase:81,defensa:67,especial:78,
  hissatsu:['Pingüino emperador 7', 'Arrancada'],tipoTecnica:'tiro',
  desc:'Centrocampista del Instituto Universal en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r800.webp'
},
{
  id:'r801', equipo:'Academia Universal', nombre:'Namak Haumea', original:'Namak Haumea',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:68,defensa:77,especial:74,
  hissatsu:['Gran torbellino', 'Campo torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Universal en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r801.webp'
},
{
  id:'r802', equipo:'Academia Universal', nombre:'Mac Emake', original:'Mac Emake',
  posicion:'Defensa', tipo:'Montaña',
  tiro:39,pase:69,defensa:79,especial:74,
  hissatsu:['Bomba saltarina', 'Piroquinesis', 'A todo vapor'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Universal en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r802.webp'
},
{
  id:'r803', equipo:'Dragon Link', nombre:'Eljas Viisi', original:'Eljas Viisi',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:78,defensa:90,especial:87,
  hissatsu:['Proyectil de ozono', 'Salto Dimensional'],tipoTecnica:'defensa',
  desc:'Defensa del Dragon Link en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r803.webp'
},
{
  id:'r804', equipo:'Dragon Link', nombre:'Pentra Chek', original:'Pentra Chek',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:80,pase:89,defensa:73,especial:86,
  hissatsu:['Regate supersónico', 'Tiro balista', 'Dragón ascendente'],tipoTecnica:'regate',
  desc:'Centrocampista del Dragon Link en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r804.webp'
},
{
  id:'r805', equipo:'Dragon Link', nombre:'Federigo Cinco', original:'Federigo Cinco',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:83,pase:89,defensa:74,especial:86,
  hissatsu:['Visto y no visto', 'Tiro espectral'],tipoTecnica:'regate',
  desc:'Centrocampista del Dragon Link en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r805.webp'
},
{
  id:'r806', equipo:'Dragon Link', nombre:'Ferdinand Delafünfe', original:'Ferdinand Delafünfe',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:83,pase:89,defensa:75,especial:85,
  hissatsu:['Dragón ascendente', 'Tiro balista'],tipoTecnica:'regate',
  desc:'Centrocampista del Dragon Link en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r806.webp'
},
{
  id:'r807', equipo:'Dragon Link', nombre:'Quinque Flores', original:'Quinque Flores',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:73,defensa:40,especial:84,
  hissatsu:['Aguijones escarlata', 'Regate supersónico', 'Esferas luminosas'],tipoTecnica:'tiro',
  desc:'Delantero del Dragon Link en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r807.webp'
},
{
  id:'r808', equipo:'Dragon Link', nombre:'Jacques Cinquini', original:'Jacques Cinquini',
  posicion:'Delantero', tipo:'Montaña',
  tiro:91,pase:77,defensa:42,especial:84,
  hissatsu:['Regate supersónico', 'Tiro balista'],tipoTecnica:'tiro',
  desc:'Delantero del Dragon Link en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r808.webp'
},
{
  id:'r809', equipo:'Dragon Link', nombre:'Fivier Saviola', original:'Fivier Saviola',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:92,defensa:76,especial:87,
  hissatsu:['Regate supersónico', 'Salto dimensional'],tipoTecnica:'regate',
  desc:'Centrocampista del Dragon Link en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r809.webp'
},
{
  id:'r810', equipo:'Dragon Link', nombre:'David Quintola', original:'David Quintola',
  posicion:'Delantero', tipo:'Montaña',
  tiro:89,pase:79,defensa:38,especial:87,
  hissatsu:['Descarga de Ballesta', 'Tiro Balista'],tipoTecnica:'tiro',
  desc:'Delantero del Dragon Link en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r810.webp'
},
{
  id:'r811', equipo:'Dragon Link', nombre:'Leonidas Epsilon', original:'Leonidas Epsilon',
  posicion:'Portero', tipo:'Fuego',
  tiro:20,pase:56,defensa:77,especial:75,
  hissatsu:['Mano celestial', 'Aguijones escarlata', 'Rompetiros'],tipoTecnica:'portero',
  desc:'Portero del Dragon Link en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r811.webp'
},
{
  id:'r812', equipo:'Dragon Link', nombre:'George Wu', original:'George Wu',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:87,defensa:69,especial:83,
  hissatsu:['Dragón ascendente', 'Triángulo ZZ'],tipoTecnica:'regate',
  desc:'Centrocampista del Dragon Link en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r812.webp'
},
{
  id:'r813', equipo:'Dragon Link', nombre:'Geert Vandevijf', original:'Geert Vandevijf',
  posicion:'Delantero', tipo:'Fuego',
  tiro:83,pase:72,defensa:48,especial:79,
  hissatsu:['Cañón de meteoritos', 'Aguijones escarlata', 'Esferas luminosas'],tipoTecnica:'tiro',
  desc:'Delantero del Dragon Link en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r813.webp'
},
{
  id:'r814', equipo:'Dragon Link', nombre:'Folke Fem', original:'Folke Fem',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:87,defensa:70,especial:79,
  hissatsu:['Regate supersónico', 'Tiro balista', 'Dragón ascendente'],tipoTecnica:'regate',
  desc:'Centrocampista del Dragon Link en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r814.webp'
},
{
  id:'r815', equipo:'Dragon Link', nombre:'Naji Khamsa', original:'Naji Khamsa',
  posicion:'Defensa', tipo:'Bosque',
  tiro:39,pase:71,defensa:82,especial:75,
  hissatsu:['Visto y no visto', 'Cañón de meteoritos'],tipoTecnica:'defensa',
  desc:'Defensa del Dragon Link en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r815.webp'
},
{
  id:'r816', equipo:'Equipo Zero', nombre:'Albion Lumina', original:'Albion Lumina',
  posicion:'Portero', tipo:'Montaña',
  tiro:35,pase:64,defensa:83,especial:80,
  hissatsu:['Mordisco de serpiente', 'Red de caza', 'Parada fuerte'],tipoTecnica:'parada',
  desc:'Portero del Equipo Zero en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r816.webp'
},
{
  id:'r817', equipo:'Equipo Zero', nombre:'Candido Glow', original:'Candido Glow',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:74,defensa:85,especial:80,
  hissatsu:['Visto y no visto', 'Luz cegadora'],tipoTecnica:'defensa',
  desc:'Defensa del Equipo Zero en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r817.webp'
},
{
  id:'r818', equipo:'Equipo Zero', nombre:'Dwight Whittaker', original:'Dwight Whittaker',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:74,defensa:86,especial:79,
  hissatsu:['Mina terrestre', 'Muralla de Atlantis'],tipoTecnica:'defensa',
  desc:'Defensa del Equipo Zero en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r818.webp'
},
{
  id:'r819', equipo:'Equipo Zero', nombre:'Beamer Daye', original:'Beamer Daye',
  posicion:'Defensa', tipo:'Fuego',
  tiro:42,pase:77,defensa:85,especial:80,
  hissatsu:['Arrancada', 'Luz cegadora'],tipoTecnica:'defensa',
  desc:'Defensa del Equipo Zero en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r819.webp'
},
{
  id:'r820', equipo:'Equipo Zero', nombre:'Shady Shwartz', original:'Shady Shwartz',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:70,especial:84,
  hissatsu:['Tiro espectral', 'Trance melódico'],tipoTecnica:'tiro',
  desc:'Centrocampista del Equipo Zero en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r820.webp'
},
{
  id:'r821', equipo:'Equipo Zero', nombre:'Dawntavius Spectrum', original:'Dawntavius Spectrum',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:84,defensa:71,especial:81,
  hissatsu:['Bomba saltarina', 'Tornado de fuego'],tipoTecnica:'regate',
  desc:'Centrocampista del Equipo Zero en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r821.webp'
},
{
  id:'r822', equipo:'Equipo Zero', nombre:'Yang', original:'Yang',
  posicion:'Delantero', tipo:'Montaña',
  tiro:87,pase:76,defensa:42,especial:80,
  hissatsu:['Aguijón letal', 'Cruce explosivo'],tipoTecnica:'tiro',
  desc:'Delantero del Equipo Zero en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r822.webp'
},
{
  id:'r823', equipo:'Equipo Zero', nombre:'Tynan Crowe', original:'Tynan Crowe',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:80,pase:87,defensa:70,especial:83,
  hissatsu:['Tiro espectral', 'Mina terrestre'],tipoTecnica:'tiro',
  desc:'Centrocampista del Equipo Zero en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r823.webp'
},

// ===== Inazuma Eleven GO 1: equipos que faltaban, postgame incluido =====
{
  id:'r824', equipo:'Vía Láctea', nombre:'Starbuck Rogers', original:'Starbuck Rogers',
  posicion:'Portero', tipo:'Montaña',
  tiro:22,pase:59,defensa:73,especial:71,
  hissatsu:['Puños certeros', 'Rotación inversa', 'Parada ardiente'],tipoTecnica:'parada',
  desc:'Portero del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r824.webp'
},
{
  id:'r825', equipo:'Vía Láctea', nombre:'Worff Chewback', original:'Worff Chewback',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:65,defensa:73,especial:69,
  hissatsu:['Carga de elefantes', 'A todo vapor'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r825.webp'
},
{
  id:'r826', equipo:'Vía Láctea', nombre:'Dart H. Cylon', original:'Dart H. Cylon',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:66,defensa:76,especial:68,
  hissatsu:['Gran torbellino', 'Visto y no visto'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r826.webp'
},
{
  id:'r827', equipo:'Vía Láctea', nombre:'Scotty O\'Brien', original:'Scotty O\'Brien',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:66,defensa:76,especial:71,
  hissatsu:['Rodillazos atómicos', 'Ataque de la ballena', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r827.webp'
},
{
  id:'r828', equipo:'Vía Láctea', nombre:'Billy-Lee Adarma', original:'Billy-Lee Adarma',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:65,pase:74,defensa:63,especial:74,
  hissatsu:['Rodillazos atómicos', 'Piroquinesis', 'Superaceleración'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r828.webp'
},
{
  id:'r829', equipo:'Vía Láctea', equiposExtra:['Sector Quinto'], nombre:'Zaphod Riker', original:'Zaphod Riker',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:78,defensa:63,especial:72,
  hissatsu:['Rodillazos atómicos', 'Piroquinesis', 'Tiro Sónico'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r829.webp'
},
{
  id:'r830', equipo:'Vía Láctea', nombre:'Cyber Dalekman', original:'Cyber Dalekman',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:67,pase:74,defensa:62,especial:73,
  hissatsu:['Rodillazos atómicos', 'Defensa propulsada', 'Pasos aéreos'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r830.webp'
},
{
  id:'r831', equipo:'Vía Láctea', nombre:'Lucas Skywalk', original:'Lucas Skywalk',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:78,defensa:67,especial:76,
  hissatsu:['Cabezazo bazuca', 'Rodillazos atómicos', 'Cabezazo cohete'],tipoTecnica:'tiro',
  desc:'Centrocampista del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r831.webp'
},
{
  id:'r832', equipo:'Vía Láctea', equiposExtra:['Sector Quinto', 'Resistencia Japón GO'], nombre:'Jimmy Kyrk', original:'Kita Ichiban',
  posicion:'Delantero', tipo:'Bosque',
  tiro:77,pase:68,defensa:47,especial:74,
  hissatsu:['Cabezazo bazuca', 'Rodillazos atómicos', 'Triángulo ZZ'],tipoTecnica:'tiro',
  desc:'Delantero y capitán del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r832.webp'
},
{
  id:'r833', equipo:'Vía Láctea', nombre:'Harkness Torchwood', original:'Harkness Torchwood',
  posicion:'Delantero', tipo:'Montaña',
  tiro:74,pase:63,defensa:47,especial:70,
  hissatsu:['Cabezazo bazuca', 'Rodillazos atómicos', 'Truco balonazo'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r833.webp'
},
{
  id:'r834', equipo:'Vía Láctea', nombre:'Jean-Luc Janeway', original:'Jean-Luc Janeway',
  posicion:'Delantero', tipo:'Fuego',
  tiro:76,pase:61,defensa:38,especial:70,
  hissatsu:['Cabezazo bazuca', 'Piroquinesis', 'Finta boomerang'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r834.webp'
},
{
  id:'r835', equipo:'Vía Láctea', nombre:'Wesley Sheridan', original:'Wesley Sheridan',
  posicion:'Portero', tipo:'Viento',
  tiro:35,pase:61,defensa:68,especial:66,
  hissatsu:['Puños certeros', 'Parada ardiente', 'Parada fuerte'],tipoTecnica:'parada',
  desc:'Portero del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r835.webp'
},
{
  id:'r836', equipo:'Vía Láctea', nombre:'Sithri Peon', original:'Sithri Peon',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:56,defensa:70,especial:63,
  hissatsu:['Mirada ladrona', 'Carga de elefantes'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:105,
  sprite:'https://inazumarun.es/assets/sprites/r836.webp'
},
{
  id:'r837', equipo:'Vía Láctea', nombre:'Isaac Binks', original:'Isaac Binks',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:63,defensa:70,especial:65,
  hissatsu:['Mirada ladrona', 'Fuerza centrífuga'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r837.webp'
},
{
  id:'r838', equipo:'Vía Láctea', nombre:'Carl Rissian', original:'Carl Rissian',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:64,pase:74,defensa:58,especial:68,
  hissatsu:['Rodillazos atómicos', 'La gran muralla', 'Tacón infernal'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r838.webp'
},
{
  id:'r839', equipo:'Vía Láctea', nombre:'Robert Affett', original:'Robert Affett',
  posicion:'Delantero', tipo:'Fuego',
  tiro:72,pase:59,defensa:44,especial:64,
  hissatsu:['Cabezazo bazuca', 'Rodillazos atómicos', 'Cabezazo cohete'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Vía Láctea en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r839.webp'
},
{
  id:'r840', equipo:'Ultramegahiedra', nombre:'Clem Attish', original:'Shiyō Hanasaku',
  posicion:'Portero', tipo:'Viento',
  tiro:25,pase:57,defensa:75,especial:73,
  hissatsu:['Barrera de cristal', 'Estrella Reflectante', 'Puños certeros'],tipoTecnica:'parada',
  desc:'Portero del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r840.webp'
},
{
  id:'r841', equipo:'Ultramegahiedra', nombre:'Tyrian Purpel', original:'Sometani Tsutaru',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:76,defensa:66,especial:76,
  hissatsu:['Gran torbellino', 'Ataque de la ballena', 'Túnel tornado'],tipoTecnica:'defensa',
  desc:'Centrocampista del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r841.webp'
},
{
  id:'r842', equipo:'Ultramegahiedra', nombre:'Pike Pollack', original:'Ōmi Kunihiro',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:70,defensa:80,especial:72,
  hissatsu:['Danza del viento', 'Fuerza centrífuga', 'Ataque de la ballena'],tipoTecnica:'regate',
  desc:'Defensa del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r842.webp'
},
{
  id:'r843', equipo:'Ultramegahiedra', nombre:'Martin Blando', original:'Murasaki Yoshihiko',
  posicion:'Defensa', tipo:'Viento',
  tiro:54,pase:66,defensa:76,especial:68,
  hissatsu:['Arrancada', 'Fuerza centrífuga', 'Campo Torbellino'],tipoTecnica:'regate',
  desc:'Defensa del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r843.webp'
},
{
  id:'r844', equipo:'Ultramegahiedra', nombre:'Keane Gardner', original:'Koba Toshinori',
  posicion:'Defensa', tipo:'Viento',
  tiro:53,pase:66,defensa:78,especial:72,
  hissatsu:['Círculo de hielo', 'Proyectil de Ozono', 'Paisaje Helado'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r844.webp'
},
{
  id:'r845', equipo:'Ultramegahiedra', nombre:'Shaun Bonce', original:'Koiura Hajime',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:71,pase:80,defensa:61,especial:76,
  hissatsu:['Arrancada', 'Fuerza centrífuga', 'Remolino acuático'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r845.webp'
},
{
  id:'r846', equipo:'Ultramegahiedra', nombre:'Penn Minim', original:'Sumī Rei',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:71,pase:82,defensa:63,especial:76,
  hissatsu:['Brisa deslizante', 'Peces Voladores'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r846.webp'
},
{
  id:'r847', equipo:'Ultramegahiedra', nombre:'Brook Bold', original:'Aino Isami',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:71,pase:78,defensa:68,especial:79,
  hissatsu:['Entrada huracán', 'Círculo de hielo', 'Peces Voladores'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r847.webp'
},
{
  id:'r848', equipo:'Ultramegahiedra', nombre:'Francis Tuffnot', original:'Sōgetsu Nozomi',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:66,defensa:82,especial:74,
  hissatsu:['Campo Torbellino', 'Brisa deslizante', 'Tiro vendaval'],tipoTecnica:'defensa',
  desc:'Defensa y capitán del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r848.webp'
},
{
  id:'r849', equipo:'Ultramegahiedra', nombre:'Joshua Bleak', original:'Shian Haseru',
  posicion:'Delantero', tipo:'Viento',
  tiro:81,pase:66,defensa:40,especial:75,
  hissatsu:['Tiro sónico', 'Ventisca eterna', 'Arrancada'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r849.webp'
},
{
  id:'r850', equipo:'Ultramegahiedra', nombre:'Hayden Whyrl', original:'Azu Ryūichi',
  posicion:'Delantero', tipo:'Viento',
  tiro:77,pase:64,defensa:45,especial:72,
  hissatsu:['Peces voladores', 'Ventisca eterna', 'Barrena voladora'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r850.webp'
},
{
  id:'r851', equipo:'Ultramegahiedra', nombre:'Matt Durer', original:'Umeo Suzuto',
  posicion:'Portero', tipo:'Viento',
  tiro:31,pase:58,defensa:69,especial:67,
  hissatsu:['Parada en pirueta', 'Gran torbellino', 'Ancla de navío'],tipoTecnica:'parada',
  desc:'Portero del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r851.webp'
},
{
  id:'r852', equipo:'Ultramegahiedra', nombre:'Nixon Earlnight', original:'Asaga Nobuhiko',
  posicion:'Defensa', tipo:'Viento',
  tiro:55,pase:63,defensa:74,especial:64,
  hissatsu:['Fuerza centrífuga', 'Paisaje helado', 'Salto Dimensional'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r852.webp'
},
{
  id:'r853', equipo:'Ultramegahiedra', nombre:'Jack Balance', original:'Wakeru Kagehiro',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:68,pase:75,defensa:57,especial:72,
  hissatsu:['Remolino acuático', 'Pingüino emperador 7', 'Arrancada'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r853.webp'
},
{
  id:'r854', equipo:'Ultramegahiedra', nombre:'Skylar Lepton', original:'Hizu Takatoshi',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:63,pase:74,defensa:60,especial:71,
  hissatsu:['Salto incandescente', 'Gran torbellino', 'Ataque de la ballena'],tipoTecnica:'tiro',
  desc:'Centrocampista del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r854.webp'
},
{
  id:'r855', equipo:'Ultramegahiedra', nombre:'Tarquin Orchards', original:'Ōme Kenichirō',
  posicion:'Delantero', tipo:'Viento',
  tiro:71,pase:62,defensa:35,especial:68,
  hissatsu:['Peces Voladores', 'Ataque de la ballena', 'Tiro Sónico'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Ultramegahiedra en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r855.webp'
},
{
  id:'r856', equipo:'Alpino GO', nombre:'Wolfe Whyte', original:'Wolfe Whyte',
  posicion:'Portero', tipo:'Viento',
  tiro:32,pase:51,defensa:81,especial:79,
  hissatsu:['Barrera de cristal', 'Bloque de Hielo'],tipoTecnica:'parada',
  desc:'Portero y capitán del Instituto Alpino en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r856.webp'
},
{
  id:'r857', equipo:'Alpino GO', nombre:'Sascha Kotch', original:'Sascha Kotch',
  posicion:'Defensa', tipo:'Viento',
  tiro:51,pase:71,defensa:80,especial:74,
  hissatsu:['Paisaje helado', 'Gran torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Alpino en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r857.webp'
},
{
  id:'r858', equipo:'Alpino GO', nombre:'Guy l\'Acier', original:'Itō Torata',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:70,defensa:80,especial:72,
  hissatsu:['Paisaje helado', 'Danza del viento', 'Ventisca eterna'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Alpino en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r858.webp'
},
{
  id:'r859', equipo:'Alpino GO', nombre:'Matther Horne', original:'Matther Horne',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:71,defensa:80,especial:77,
  hissatsu:['Paisaje helado', 'Ataque de la ballena', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Alpino en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r859.webp'
},
{
  id:'r860', equipo:'Alpino GO', equiposExtra:['Resistencia Japón GO'], nombre:'Iggie Loo', original:'Makari Ginjirō',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:72,defensa:80,especial:76,
  hissatsu:['Paisaje helado', 'Espejismo de balón', 'Pingüino emperador n.º 2'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Alpino en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r860.webp'
},
{
  id:'r861', equipo:'Alpino GO', nombre:'Bob Sled', original:'Kitaki Tsuneo',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:75,pase:86,defensa:71,especial:80,
  hissatsu:['Círculo de hielo', 'Paisaje helado', 'Balón Iceberg'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Alpino en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r861.webp'
},
{
  id:'r862', equipo:'Alpino GO', nombre:'Blain Chills', original:'Blain Chills',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:82,defensa:66,especial:79,
  hissatsu:['Círculo de hielo', 'Pingüino emperador 7'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Alpino en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r862.webp'
},
{
  id:'r863', equipo:'Alpino GO', nombre:'Art Tundra', original:'Kōri Itsuki',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:84,defensa:70,especial:80,
  hissatsu:['Círculo de hielo', 'Ventisca eterna', 'Leopardo de la ventisca'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Alpino en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r863.webp'
},
{
  id:'r864', equipo:'Alpino GO', nombre:'Borel Aurora', original:'Borel Aurora',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:74,pase:81,defensa:70,especial:79,
  hissatsu:['Círculo de hielo', 'Peces voladores'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Alpino en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r864.webp'
},
{
  id:'r865', equipo:'Alpino GO', equiposExtra:['Inazuma Japon GO', 'Resistencia Japón GO'], nombre:'Njord Snio', original:'Yukimura Hyōga',
  posicion:'Delantero', tipo:'Viento',
  tiro:83,pase:67,defensa:43,especial:72,
  hissatsu:['Ventisca eterna', 'Leopardo de la ventisca', 'Círculo de hielo'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Alpino en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r865.webp'
},
{
  id:'r866', equipo:'Alpino GO', nombre:'Yule Hoarfrost', original:'Yule Hoarfrost',
  posicion:'Delantero', tipo:'Bosque',
  tiro:81,pase:66,defensa:45,especial:75,
  hissatsu:['Ventisca eterna', 'Paisaje helado'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Alpino en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r866.webp'
},
{
  id:'r867', equipo:'Alpino GO', nombre:'Suno Aisu', original:'Suno Aisu',
  posicion:'Portero', tipo:'Montaña',
  tiro:22,pase:56,defensa:72,especial:70,
  hissatsu:['Finta boomerang', 'Barrera de cristal', 'Parada en Plancha'],tipoTecnica:'regate',
  desc:'Portero del Instituto Alpino en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r867.webp'
},
{
  id:'r868', equipo:'Alpino GO', nombre:'Himesh Himalaya', original:'Himesh Himalaya',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:64,defensa:75,especial:68,
  hissatsu:['Círculo de hielo', 'La niebla'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Alpino en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:120,
  sprite:'https://inazumarun.es/assets/sprites/r868.webp'
},
{
  id:'r869', equipo:'Alpino GO', nombre:'Blake Wintry', original:'Blake Wintry',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:62,especial:75,
  hissatsu:['Círculo de hielo', 'Salto incandescente', 'Giro de Mono'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Alpino en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r869.webp'
},
{
  id:'r870', equipo:'Alpino GO', nombre:'Fritz Brisk', original:'Fritz Brisk',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:81,defensa:62,especial:75,
  hissatsu:['La niebla', 'Círculo de hielo'],tipoTecnica:'defensa',
  desc:'Centrocampista del Instituto Alpino en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r870.webp'
},
{
  id:'r871', equipo:'Alpino GO', nombre:'Grisley Bear', original:'Grisley Bear',
  posicion:'Delantero', tipo:'Fuego',
  tiro:79,pase:65,defensa:34,especial:69,
  hissatsu:['Rodillazos atómicos', 'A todo vapor', 'Disparo con Rebotes'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Alpino en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r871.webp'
},
{
  id:'r872', equipo:'Kirkwood GO', nombre:'Strom Boojum', original:'Katayama Tsuyoshi',
  posicion:'Portero', tipo:'Montaña',
  tiro:22,pase:57,defensa:76,especial:76,
  hissatsu:['Rotación inversa', 'Barrera de Gaia', 'Escudo de Fuerza'],tipoTecnica:'parada',
  desc:'Portero del Instituto Kirkwood en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r872.webp'
},
{
  id:'r873', equipo:'Kirkwood GO', nombre:'Dock Hickory', original:'Dock Hickory',
  posicion:'Defensa', tipo:'Bosque',
  tiro:56,pase:70,defensa:83,especial:78,
  hissatsu:['Pinzas cortantes', 'Remolino acuático'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r873.webp'
},
{
  id:'r874', equipo:'Kirkwood GO', nombre:'Bourne Birch', original:'Bourne Birch',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:73,defensa:83,especial:75,
  hissatsu:['Pinzas cortantes', 'Espejismo de balón'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r874.webp'
},
{
  id:'r875', equipo:'Kirkwood GO', nombre:'Flynt Pine', original:'Flynt Pine',
  posicion:'Defensa', tipo:'Fuego',
  tiro:38,pase:71,defensa:82,especial:75,
  hissatsu:['Pinzas cortantes', 'Aguijón letal', 'Picadora'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r875.webp'
},
{
  id:'r876', equipo:'Kirkwood GO', nombre:'Trent Poplar', original:'Trent Poplar',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:72,defensa:83,especial:76,
  hissatsu:['Pinzas cortantes', 'Remolino acuático'],tipoTecnica:'defensa',
  desc:'Defensa del Instituto Kirkwood en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r876.webp'
},
{
  id:'r877', equipo:'Kirkwood GO', nombre:'River Willows', original:'Shimizu Ryūto',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:86,defensa:73,especial:85,
  hissatsu:['Espejismo de balón', 'Pentagrama', 'Esferas luminosas'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Kirkwood en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r877.webp'
},
{
  id:'r878', equipo:'Kirkwood GO', nombre:'Beck Heath', original:'Beck Heath',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:83,defensa:70,especial:81,
  hissatsu:['Espejismo de balón', 'Brisa deslizante'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Kirkwood en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r878.webp'
},
{
  id:'r879', equipo:'Kirkwood GO', nombre:'Brook Linden', original:'Brook Linden',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:75,pase:83,defensa:70,especial:80,
  hissatsu:['Espejismo de balón', 'Bomba saltarina'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Kirkwood en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r879.webp'
},
{
  id:'r880', equipo:'Kirkwood GO', nombre:'Escott Aspen', original:'Escott Aspen',
  posicion:'Delantero', tipo:'Fuego',
  tiro:79,pase:65,defensa:37,especial:72,
  hissatsu:['Triángulo ZZ', 'Cabezazo cohete'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Kirkwood en Inazuma Eleven GO, dorsal 11, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r880.webp'
},
{
  id:'r881', equipo:'Kirkwood GO', nombre:'Maxwell Mahogany', original:'Maxwell Mahogany',
  posicion:'Portero', tipo:'Fuego',
  tiro:30,pase:66,defensa:74,especial:72,
  hissatsu:['Parada ardiente', 'Picadora', 'Parada fuerte'],tipoTecnica:'portero',
  desc:'Portero del Instituto Kirkwood en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r881.webp'
},
{
  id:'r882', equipo:'Kirkwood GO', nombre:'Calder Elm', original:'Calder Elm',
  posicion:'Delantero', tipo:'Viento',
  tiro:81,pase:63,defensa:39,especial:72,
  hissatsu:['Tiro sónico', 'Arrancada'],tipoTecnica:'tiro',
  desc:'Delantero del Instituto Kirkwood en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r882.webp'
},
{
  id:'r883', equipo:'Kirkwood GO', nombre:'Laike Alder', original:'Laike Alder',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:67,defensa:77,especial:72,
  hissatsu:['Finta boomerang', 'Gran torbellino', 'Defensa propulsada'],tipoTecnica:'regate',
  desc:'Defensa del Instituto Kirkwood en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r883.webp'
},
{
  id:'r884', equipo:'Kirkwood GO', nombre:'Tahoma Sequoia', original:'Tahoma Sequoia',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:70,pase:80,defensa:64,especial:78,
  hissatsu:['Espejismo de balón', 'Peces voladores'],tipoTecnica:'regate',
  desc:'Centrocampista del Instituto Kirkwood en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r884.webp'
},
{
  id:'r885', equipo:'Monte Olimpo', nombre:'Theo Divine', original:'Theo Divine',
  posicion:'Portero', tipo:'Montaña',
  tiro:21,pase:50,defensa:87,especial:83,
  hissatsu:['Rompetiros', 'Barrera de Gaia'],tipoTecnica:'portero',
  desc:'Portero del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r885.webp'
},
{
  id:'r886', equipo:'Monte Olimpo', nombre:'Mnemo Pool', original:'Mnemo Pool',
  posicion:'Defensa', tipo:'Viento',
  tiro:55,pase:76,defensa:90,especial:86,
  hissatsu:['Proyectil de ozono', 'Cruce explosivo'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r886.webp'
},
{
  id:'r887', equipo:'Monte Olimpo', nombre:'Perses Destroyer', original:'Perses Destroyer',
  posicion:'Defensa', tipo:'Montaña',
  tiro:51,pase:76,defensa:87,especial:83,
  hissatsu:['Proyectil de ozono', 'Mina terrestre'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r887.webp'
},
{
  id:'r888', equipo:'Monte Olimpo', nombre:'Iapetus Pierce', original:'Iapetus Pierce',
  posicion:'Defensa', tipo:'Bosque',
  tiro:57,pase:77,defensa:89,especial:83,
  hissatsu:['Proyectil de ozono', 'Círculo de hielo'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r888.webp'
},
{
  id:'r889', equipo:'Monte Olimpo', nombre:'Phoebus Moonlight', original:'Phoebus Moonlight',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:77,defensa:90,especial:85,
  hissatsu:['Proyectil de ozono', 'Guardia acrobática'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r889.webp'
},
{
  id:'r890', equipo:'Monte Olimpo', nombre:'Rae Godmother', original:'Rae Godmother',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:79,pase:89,defensa:76,especial:88,
  hissatsu:['Esferas luminosas', 'Pentagrama', 'Proyectil de Ozono'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r890.webp'
},
{
  id:'r891', equipo:'Monte Olimpo', nombre:'Hyperion Wise', original:'Hyperion Wise',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:71,especial:86,
  hissatsu:['Esferas luminosas', 'Cañón de meteoritos'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r891.webp'
},
{
  id:'r892', equipo:'Monte Olimpo', nombre:'Oceanus Worldstream', original:'Oceanus Worldstream',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:82,pase:91,defensa:77,especial:90,
  hissatsu:['Tornado de fuego', 'Regate supersónico', 'Esferas luminosas'],tipoTecnica:'tiro',
  desc:'Centrocampista del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r892.webp'
},
{
  id:'r893', equipo:'Monte Olimpo', nombre:'Coeus Heavens', original:'Coeus Heavens',
  posicion:'Delantero', tipo:'Viento',
  tiro:91,pase:73,defensa:37,especial:82,
  hissatsu:['Tiro balista', 'Proyectil de ozono', 'Guardia acrobática'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r893.webp'
},
{
  id:'r894', equipo:'Monte Olimpo', nombre:'Tet Aqua', original:'Tet Aqua',
  posicion:'Delantero', tipo:'Fuego',
  tiro:90,pase:75,defensa:46,especial:81,
  hissatsu:['Tiro balista', 'Trance melódico', 'Tornado de Fuego'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r894.webp'
},
{
  id:'r895', equipo:'Monte Olimpo', nombre:'Eos Dawn', original:'Eos Dawn',
  posicion:'Portero', tipo:'Viento',
  tiro:33,pase:63,defensa:82,especial:78,
  hissatsu:['Mano celestial', 'Tiro balista', 'Parada fuerte'],tipoTecnica:'portero',
  desc:'Portero del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 12, suplente.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r895.webp'
},
{
  id:'r896', equipo:'Monte Olimpo', nombre:'Pallas Brandish', original:'Pallas Brandish',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:73,defensa:84,especial:80,
  hissatsu:['Luz cegadora', 'Dragón terrestre', 'Dragón ascendente'],tipoTecnica:'defensa',
  desc:'Defensa del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 13, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r896.webp'
},
{
  id:'r897', equipo:'Monte Olimpo', nombre:'Themis Law', original:'Themis Law',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:82,defensa:70,especial:79,
  hissatsu:['Trayectoria perfecta', 'Red de caza'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 14, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r897.webp'
},
{
  id:'r898', equipo:'Monte Olimpo', nombre:'Atlas Carrier', original:'Atlas Carrier',
  posicion:'Delantero', tipo:'Montaña',
  tiro:87,pase:73,defensa:37,especial:80,
  hissatsu:['Rodillazos atómicos', 'Campo torbellino', 'Tiro Balista'],tipoTecnica:'tiro',
  desc:'Delantero del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 15, suplente.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r898.webp'
},
{
  id:'r899', equipo:'Monte Olimpo', nombre:'Orion Hunter', original:'Orion Hunter',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:75,pase:87,defensa:70,especial:80,
  hissatsu:['Fuerza centrífuga', 'Esferas luminosas'],tipoTecnica:'regate',
  desc:'Centrocampista del Colegio Monte Olimpo en Inazuma Eleven GO, dorsal 16, suplente.',
  locked:true,cost:190,
  sprite:'https://inazumarun.es/assets/sprites/r899.webp'
},
{
  id:'r900', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Xavier Shotwell', original:'Xavier Shotwell',
  posicion:'Portero', tipo:'Bosque',
  tiro:24,pase:53,defensa:83,especial:79,
  hissatsu:['Barrera de Gaia', 'Tiro balista', 'Parada fuerte'],tipoTecnica:'portero',
  desc:'Portero de las Garras del Sur en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r900.webp'
},
{
  id:'r901', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Crimson Wiseman', original:'Crimson Wiseman',
  posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:79,defensa:88,especial:82,
  hissatsu:['Arrancada', 'Niebla mística'],tipoTecnica:'defensa',
  desc:'Defensa de las Garras del Sur en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r901.webp'
},
{
  id:'r902', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Linden Haregrove', original:'Linden Haregrove',
  posicion:'Defensa', tipo:'Bosque',
  tiro:41,pase:75,defensa:90,especial:84,
  hissatsu:['Visto y no visto', 'La niebla'],tipoTecnica:'defensa',
  desc:'Defensa de las Garras del Sur en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r902.webp'
},
{
  id:'r903', equipo:'Garras del Sur', nombre:'Jared Dapplegrey', original:'Jared Dapplegrey',
  posicion:'Defensa', tipo:'Fuego',
  tiro:49,pase:79,defensa:86,especial:81,
  hissatsu:['Despeje de fuerza', 'Defensa propulsada'],tipoTecnica:'parada',
  desc:'Defensa de las Garras del Sur en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r903.webp'
},
{
  id:'r904', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Keith Wellington', original:'Keith Wellington',
  posicion:'Defensa', tipo:'Viento',
  tiro:46,pase:79,defensa:88,especial:82,
  hissatsu:['A todo vapor', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Defensa de las Garras del Sur en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r904.webp'
},
{
  id:'r905', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Cirrus Whisp', original:'Cirrus Whisp',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:91,defensa:76,especial:88,
  hissatsu:['Mina terrestre', 'Trance melódico', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Centrocampista y capitán de las Garras del Sur en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r905.webp'
},
{
  id:'r906', equipo:'Garras del Sur', nombre:'Gamal Everlast', original:'Gamal Everlast',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:79,pase:90,defensa:72,especial:87,
  hissatsu:['Mina terrestre', 'Cañón de meteoritos'],tipoTecnica:'defensa',
  desc:'Centrocampista de las Garras del Sur en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r906.webp'
},
{
  id:'r907', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Sandy Dryhill', original:'Sandy Dryhill',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:88,defensa:76,especial:84,
  hissatsu:['Picadora', 'Truco balonazo'],tipoTecnica:'defensa',
  desc:'Centrocampista de las Garras del Sur en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r907.webp'
},
{
  id:'r908', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Dryden Zephyr', original:'Dryden Zephyr',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:80,pase:90,defensa:74,especial:88,
  hissatsu:['Cruce explosivo', 'Tiro espectral'],tipoTecnica:'regate',
  desc:'Centrocampista de las Garras del Sur en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r908.webp'
},
{
  id:'r909', equipo:'Garras del Sur', nombre:'Solomon Roundhay', original:'Solomon Roundhay',
  posicion:'Delantero', tipo:'Viento',
  tiro:88,pase:72,defensa:44,especial:80,
  hissatsu:['Visto y no visto', 'Guardia acrobática'],tipoTecnica:'defensa',
  desc:'Delantero de las Garras del Sur en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r909.webp'
},
{
  id:'r910', equipo:'Garras del Sur', equiposExtra:['Cuerno Demoníaco'], nombre:'Harry Dwind', original:'Harry Dwind',
  posicion:'Delantero', tipo:'Bosque',
  tiro:89,pase:75,defensa:47,especial:82,
  hissatsu:['Cruce explosivo', 'Cascabel'],tipoTecnica:'regate',
  desc:'Delantero de las Garras del Sur en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r910.webp'
},
{
  id:'r911', equipo:'Colmillos del Norte', equiposExtra:['Cuerno Demoníaco'], nombre:'Brutus Nastion', original:'Brutus Nastion',
  posicion:'Portero', tipo:'Fuego',
  tiro:31,pase:56,defensa:82,especial:80,
  hissatsu:['Barrera de cristal', 'Picadora'],tipoTecnica:'parada',
  desc:'Portero de los Colmillos del Norte en Inazuma Eleven GO, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r911.webp'
},
{
  id:'r912', equipo:'Colmillos del Norte', equiposExtra:['Cuerno Demoníaco'], nombre:'Linder Loper', original:'Ninba Tsukio',
  posicion:'Defensa', tipo:'Bosque',
  tiro:56,pase:77,defensa:87,especial:79,
  hissatsu:['La niebla', 'Mina terrestre', 'Salto Dimensional'],tipoTecnica:'defensa',
  desc:'Defensa de los Colmillos del Norte en Inazuma Eleven GO, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r912.webp'
},
{
  id:'r913', equipo:'Colmillos del Norte', nombre:'Jude Osbourne', original:'Jude Osbourne',
  posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:76,defensa:90,especial:83,
  hissatsu:['La niebla', 'Defensa propulsada'],tipoTecnica:'defensa',
  desc:'Defensa de los Colmillos del Norte en Inazuma Eleven GO, dorsal 3.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r913.webp'
},
{
  id:'r914', equipo:'Colmillos del Norte', equiposExtra:['Cuerno Demoníaco'], nombre:'Locke Saflowe', original:'Locke Saflowe',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:79,defensa:89,especial:81,
  hissatsu:['Cruce explosivo', 'Mina terrestre'],tipoTecnica:'regate',
  desc:'Defensa de los Colmillos del Norte en Inazuma Eleven GO, dorsal 4.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r914.webp'
},
{
  id:'r915', equipo:'Colmillos del Norte', equiposExtra:['Cuerno Demoníaco'], nombre:'Nate Gobby', original:'Nate Gobby',
  posicion:'Defensa', tipo:'Bosque',
  tiro:43,pase:76,defensa:88,especial:82,
  hissatsu:['La gran muralla', 'Cabezazo cohete'],tipoTecnica:'defensa',
  desc:'Defensa de los Colmillos del Norte en Inazuma Eleven GO, dorsal 5.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r915.webp'
},
{
  id:'r916', equipo:'Colmillos del Norte', equiposExtra:['Cuerno Demoníaco'], nombre:'Reggie Alldark', original:'Reggie Alldark',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:80,pase:89,defensa:76,especial:83,
  hissatsu:['La niebla', 'Danza del viento'],tipoTecnica:'defensa',
  desc:'Centrocampista de los Colmillos del Norte en Inazuma Eleven GO, dorsal 6.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r916.webp'
},
{
  id:'r917', equipo:'Colmillos del Norte', nombre:'Bill Froger', original:'Bill Froger',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:91,defensa:77,especial:87,
  hissatsu:['Visto y no visto', 'Defensa propulsada'],tipoTecnica:'defensa',
  desc:'Centrocampista de los Colmillos del Norte en Inazuma Eleven GO, dorsal 7.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r917.webp'
},
{
  id:'r918', equipo:'Colmillos del Norte', equiposExtra:['Cuerno Demoníaco'], nombre:'Romeo Fitzroy', original:'Romeo Fitzroy',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:77,especial:84,
  hissatsu:['Trance melódico', 'Salto dimensional', 'Ataque de paladín'],tipoTecnica:'regate',
  desc:'Centrocampista de los Colmillos del Norte en Inazuma Eleven GO, dorsal 8.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r918.webp'
},
{
  id:'r919', equipo:'Colmillos del Norte', nombre:'Caesar Lionheart', original:'Caesar Lionheart',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:76,pase:89,defensa:76,especial:83,
  hissatsu:['Ataque de la ballena', 'Mina terrestre', 'Truco balonazo'],tipoTecnica:'defensa',
  desc:'Centrocampista de los Colmillos del Norte en Inazuma Eleven GO, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r919.webp'
},
{
  id:'r920', equipo:'Colmillos del Norte', nombre:'Stan Roller', original:'Stan Roller',
  posicion:'Delantero', tipo:'Viento',
  tiro:86,pase:76,defensa:38,especial:81,
  hissatsu:['Leopardo de la ventisca', 'Cañón de meteoritos'],tipoTecnica:'tiro',
  desc:'Delantero de los Colmillos del Norte en Inazuma Eleven GO, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r920.webp'
},
{
  id:'r921', equipo:'Colmillos del Norte', equiposExtra:['Cuerno Demoníaco'], nombre:'Bracknell Forge', original:'Bracknell Forge',
  posicion:'Delantero', tipo:'Montaña',
  tiro:93,pase:76,defensa:42,especial:83,
  hissatsu:['Leopardo de la ventisca', 'Remolino ígneo', 'Estrella oscura'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de los Colmillos del Norte en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r921.webp'
},
{
  id:'r922', equipo:'Cuerno Demoníaco', nombre:'Damien Blackloch', original:'Damien Blackloch',
  posicion:'Delantero', tipo:'Viento',
  tiro:92,pase:80,defensa:45,especial:86,
  hissatsu:['Ventisca eterna', 'Corte Mágico'],tipoTecnica:'tiro',
  desc:'Delantero y capitán del Cuerno Demoníaco en Inazuma Eleven GO, dorsal 11.',
  locked:true,cost:725,
  sprite:'https://inazumarun.es/assets/sprites/r922.webp'
},
// Fichajes especiales de Inazuma Eleven 3 (sin equipo propio). Posición y
// elemento según la wiki de Inazuma Eleven; añadidos a petición explícita.
{
  id:'r923', equipo:'Fichajes especiales', nombre:'Karl Kappa', original:'Kamezaki Kappa',
  posicion:'Portero', tipo:'Viento',
  tiro:40,pase:60,defensa:82,especial:80,
  hissatsu:['Gran barrera de coral', 'Ultratécnica', 'Peces Voladores'],tipoTecnica:'portero',
  desc:'Un kappa de verdad que juega al fútbol: ganó 17 a 1 una pachanga contra Xavier y Scotty.',
  locked:true,cost:180,
  sprite:'https://inazumarun.es/assets/sprites/r923.webp'
},
{
  id:'r924', equipo:'Fichajes especiales', nombre:'Dino Zolleta', original:'Dino Maldini',
  posicion:'Delantero', tipo:'Viento',
  tiro:84,pase:76,defensa:40,especial:80,
  hissatsu:['Flecha Divina', 'Espada de Odín', 'Astro Remate'],tipoTecnica:'tiro',
  desc:'Fichaje secreto de Inazuma Eleven 3. Le encanta el capuchino y frecuenta las cafeterías de moda.',
  locked:true,cost:180,
  sprite:'https://inazumarun.es/assets/sprites/r924.webp'
},
// Los cuatro de Halloween (fichajes por contraseña de Inazuma Eleven 3).
{
  id:'r925', equipo:'Fichajes especiales', nombre:'Howler', original:'Jinrou Kuniaki',
  posicion:'Portero', tipo:'Fuego',
  tiro:35,pase:55,defensa:80,especial:78,
  hissatsu:['Garra Salvaje', 'Escudo de Fuerza', 'Entrada rodante'],tipoTecnica:'portero',
  desc:'Hombre lobo del grupo de Halloween. Se ficha con la contraseña lunallena.',
  locked:true,cost:170,
  sprite:'https://inazumarun.es/assets/sprites/r925.webp'
},
{
  id:'r926', equipo:'Fichajes especiales', nombre:'Gouger', original:'Horigome Ranta',
  posicion:'Defensa', tipo:'Fuego',
  tiro:45,pase:66,defensa:80,especial:76,
  hissatsu:['Ciclón', 'Corte diabólico', 'Flash de fotones'],tipoTecnica:'defensa',
  desc:'Cabeza de calabaza del grupo de Halloween. Se ficha con la contraseña calabaza.',
  locked:true,cost:160,
  sprite:'https://inazumarun.es/assets/sprites/r926.webp'
},
{
  id:'r927', equipo:'Fichajes especiales', nombre:'Wraps', original:'Mami Iiko',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:70,pase:78,defensa:68,especial:76,
  hissatsu:['Superaceleración', 'Doppelganger', 'Regate espejismo'],tipoTecnica:'regate',
  desc:'Momia del grupo de Halloween. Se ficha con la contraseña todavendada.',
  locked:true,cost:160,
  sprite:'https://inazumarun.es/assets/sprites/r927.webp'
},
{
  id:'r928', equipo:'Fichajes especiales', nombre:'Vicked', original:'Kuroma Jouko',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:72,pase:80,defensa:62,especial:78,
  hissatsu:['Ataque de cóndor', 'Truco de magia', 'Pared solitaria'],tipoTecnica:'regate',
  desc:'Bruja del grupo de Halloween. Se ficha con la contraseña vuelaescoba.',
  locked:true,cost:165,
  sprite:'https://inazumarun.es/assets/sprites/r928.webp'
},
// Resto de Los Cuatro Magníficos (Juuni Tennou en Inazuma Eleven 3).
// Posición y elemento según la wiki de Inazuma Eleven.
{
  id:'r929', equipo:'Los Cuatro Magníficos', nombre:'Ray Pier', original:'Sword',
  posicion:'Delantero', tipo:'Viento',
  tiro:82,pase:74,defensa:36,especial:78,
  hissatsu:['Bomba tijera', 'Espada de Odín', 'Explosión confusa'],tipoTecnica:'tiro',
  desc:'La Pica de Los Cuatro Magníficos. Aprende esgrima al estilo occidental y sueña con llevar armadura de verdad.',
  locked:true,cost:180,
  sprite:'https://inazumarun.es/assets/sprites/r929.webp'
},
{
  id:'r930', equipo:'Los Cuatro Magníficos', nombre:'Seamus Rock', original:'Clover',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:70,defensa:80,especial:76,
  hissatsu:['Telaraña', 'Cinto astral', 'Segadora'],tipoTecnica:'defensa',
  desc:'El Trébol de Los Cuatro Magníficos. Si hubiera un torneo de buscar tréboles de cuatro hojas, sería temible.',
  locked:true,cost:170,
  sprite:'https://inazumarun.es/assets/sprites/r930.webp'
},
{
  id:'r931', equipo:'Los Cuatro Magníficos', nombre:'Jen Erris', original:'Heart',
  posicion:'Portero', tipo:'Fuego',
  tiro:33,pase:58,defensa:79,especial:77,
  hissatsu:['Garra cortante', 'Torre inexpugnable', 'Manos infinitas'],tipoTecnica:'portero',
  desc:'El Corazón de Los Cuatro Magníficos. Experta en el amor y siempre con una actitud positiva.',
  locked:true,cost:170,
  sprite:'https://inazumarun.es/assets/sprites/r931.webp'
},
{
  id:'r932', equipo:'Los Cuatro Magníficos', nombre:'Jude Ellery', original:'Dia',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:80,defensa:66,especial:77,
  hissatsu:['Patada canguro', 'Superarmadillo', 'Escudo corporal'],tipoTecnica:'regate',
  desc:'El Diamante de Los Cuatro Magníficos. Le apasiona la historia de la artesanía, sobre todo la joyería.',
  locked:true,cost:170,
  sprite:'https://inazumarun.es/assets/sprites/r932.webp'
},
{
  id:'r933', equipo:'Los Cuatro Magníficos', nombre:'Ian Flappable', original:'Kaoru',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:76,defensa:38,especial:84,
  hissatsu:['Flecha Divina', 'Hora celestial', 'Disparo sagrado'],tipoTecnica:'tiro',
  desc:'Delantero de Los Cuatro Magníficos que observa en silencio y sabe moverse en los momentos difíciles.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r933.webp'
},
{
  id:'r934', equipo:'Los Cuatro Magníficos', nombre:'Isla Pullens', original:'Pierrone',
  posicion:'Portero', tipo:'Montaña',
  tiro:30,pase:55,defensa:78,especial:76,
  hissatsu:['Espiral de distorsión', 'Escudo Protector', 'Uñas Afiladas'],tipoTecnica:'portero',
  desc:'Portera de Los Cuatro Magníficos. Su mirada atrae a cualquier chico que se cruce con ella.',
  locked:true,cost:165,
  sprite:'https://inazumarun.es/assets/sprites/r934.webp'
},
// Equipos de Inazuma Eleven GO Chrono Stone (GO 2) y Galaxy (GO 3), datos de la wiki de Inazuma Eleven
{
  id:'r935', equipo:'Protocolo Omega', nombre:'Tango', original:'Cople',
  posicion:'Defensa', tipo:'Fuego',
  tiro:53,pase:61,defensa:73,especial:66,
  hissatsu:['Bobina eléctrica', 'Barrena voladora', 'Acrobacia robótica'],tipoTecnica:'defensa',
  desc:'Defensa de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r935.webp'
},
{
  id:'r936', equipo:'Protocolo Omega', nombre:'Zulu', original:'Finik',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:65,pase:74,defensa:59,especial:68,
  hissatsu:['Barrena voladora', 'Bobina eléctrica', 'Dragón ascendente'],tipoTecnica:'regate',
  desc:'Centrocampista de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r936.webp'
},
{
  id:'r937', equipo:'Protocolo Omega', nombre:'Bravo', original:'Jini',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:64,pase:73,defensa:58,especial:71,
  hissatsu:['Barrena voladora', 'Carga de elefantes', 'Piroquinesis'],tipoTecnica:'regate',
  desc:'Centrocampista de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r937.webp'
},
{
  id:'r938', equipo:'Protocolo Omega', nombre:'Uniform', original:'Laszlo',
  posicion:'Portero', tipo:'Bosque',
  tiro:39,pase:53,defensa:69,especial:68,
  hissatsu:['Aplastamiento', 'Campo de fuerza defensivo', 'Corte de arena'],tipoTecnica:'portero',
  desc:'Portero de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r938.webp'
},
{
  id:'r939', equipo:'Protocolo Omega', nombre:'X-Ray', original:'Mechius',
  posicion:'Delantero', tipo:'Bosque',
  tiro:74,pase:58,defensa:37,especial:69,
  hissatsu:['Tiro rotativo', 'Bobina eléctrica', 'Barrena voladora'],tipoTecnica:'tiro',
  desc:'Delantero de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r939.webp'
},
{
  id:'r940', equipo:'Protocolo Omega', nombre:'Delta', original:'Minenne',
  posicion:'Delantero', tipo:'Viento',
  tiro:74,pase:58,defensa:37,especial:69,
  hissatsu:['Tiro rotativo', 'Pinzas cortantes', 'Doble trallazo planetario'],tipoTecnica:'tiro',
  desc:'Delantero de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r940.webp'
},
{
  id:'r941', equipo:'Protocolo Omega', nombre:'Charlie', original:'Netan',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:64,pase:73,defensa:58,especial:71,
  hissatsu:['Barrena voladora', 'Cabezazo bazuca', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Centrocampista de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r941.webp'
},
{
  id:'r942', equipo:'Protocolo Omega', nombre:'Echo', original:'Quor',
  posicion:'Defensa', tipo:'Bosque',
  tiro:49,pase:59,defensa:71,especial:68,
  hissatsu:['Bobina eléctrica', 'Campo de fuerza defensivo', 'Obstrucción eléctrica'],tipoTecnica:'defensa',
  desc:'Defensa de Protocolo Omega en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r942.webp'
},
{
  id:'r943', equipo:'Zanark Domain', nombre:'Panca', original:'Engil',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Salto explosivo', 'Zigzag explosivo', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r943.webp'
},
{
  id:'r944', equipo:'Zanark Domain', nombre:'Asta', original:'Goblis',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Salto explosivo', 'Magnetismo', 'Cruce explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r944.webp'
},
{
  id:'r945', equipo:'Zanark Domain', nombre:'Dva', original:'Gouzu',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:70,defensa:82,especial:79,
  hissatsu:['Barreno de fuego', 'Remate del tigre', 'Dragón ascendente'],tipoTecnica:'defensa',
  desc:'Defensa de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r945.webp'
},
{
  id:'r946', equipo:'Zanark Domain', equiposExtra:['Ejército de Terracota'], nombre:'Guan Yu', original:'Guanyu',
  posicion:'Defensa', tipo:'Bosque',
  tiro:43,pase:71,defensa:83,especial:80,
  hissatsu:['La gran muralla', 'Corte mágico', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Defensa de Zanark Domain en Inazuma Eleven GO Chrono Stone.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r946.webp'
},
{
  id:'r947', equipo:'Zanark Domain', nombre:'Sahasra', original:'Hannys',
  posicion:'Defensa', tipo:'Fuego',
  tiro:53,pase:71,defensa:83,especial:80,
  hissatsu:['Barreno de fuego', 'Salto explosivo', 'Corte de arena'],tipoTecnica:'defensa',
  desc:'Defensa de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r947.webp'
},
{
  id:'r948', equipo:'Zanark Domain', nombre:'Niyuta', original:'Kyuu',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:70,defensa:47,especial:81,
  hissatsu:['Caída planetaria', 'Salto explosivo', 'Tiro Espectral'],tipoTecnica:'tiro',
  desc:'Delantero de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r948.webp'
},
{
  id:'r949', equipo:'Zanark Domain', nombre:'Sas', original:'Meizu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Salto explosivo', 'Magnetismo', 'Corte Mágico'],tipoTecnica:'regate',
  desc:'Centrocampista de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r949.webp'
},
{
  id:'r950', equipo:'Zanark Domain', nombre:'Soji Okita', original:'Okita Souji',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:70,defensa:35,especial:81,
  hissatsu:['Ataque de garza', 'Triple amenaza', 'Chut ancestral'],tipoTecnica:'regate',
  desc:'Delantero de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 17.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r950.webp'
},
{
  id:'r951', equipo:'Zanark Domain', nombre:'Catvari', original:'Org',
  posicion:'Defensa', tipo:'Montaña',
  tiro:54,pase:70,defensa:82,especial:79,
  hissatsu:['Barreno de fuego', 'El muro', 'Estrella de roca'],tipoTecnica:'defensa',
  desc:'Defensa de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r951.webp'
},
{
  id:'r952', equipo:'Zanark Domain', nombre:'Dasan', original:'Rasetsu',
  posicion:'Delantero', tipo:'Fuego',
  tiro:87,pase:71,defensa:40,especial:78,
  hissatsu:['Caída planetaria', 'Estrella oscura', 'Cañon de Meteoritos'],tipoTecnica:'tiro',
  desc:'Delantero de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r952.webp'
},
{
  id:'r953', equipo:'Zanark Domain', nombre:'Sapta', original:'Shinjami',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Salto explosivo', 'Campo torbellino', 'Triángulo ZZ'],tipoTecnica:'regate',
  desc:'Centrocampista de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r953.webp'
},
{
  id:'r954', equipo:'Zanark Domain', nombre:'Eka', original:'Shuten',
  posicion:'Portero', tipo:'Viento',
  tiro:21,pase:59,defensa:83,especial:78,
  hissatsu:['Corte de arena', 'Agujero de gusano', 'Puente sin final'],tipoTecnica:'portero',
  desc:'Portero de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r954.webp'
},
{
  id:'r955', equipo:'Zanark Domain', nombre:'Navan', original:'Sura',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:71,defensa:44,especial:78,
  hissatsu:['Caída planetaria', 'Golpe de vacío', 'Ciclón blanco'],tipoTecnica:'tiro',
  desc:'Delantero de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r955.webp'
},
{
  id:'r956', equipo:'Zanark Domain', nombre:'Laksha', original:'Trall',
  posicion:'Delantero', tipo:'Montaña',
  tiro:85,pase:69,defensa:36,especial:80,
  hissatsu:['Caída planetaria', 'Bomba saltarina', 'Barreno de fuego'],tipoTecnica:'tiro',
  desc:'Delantero de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r956.webp'
},
{
  id:'r957', equipo:'Zanark Domain', nombre:'Sata', original:'Vanna',
  posicion:'Portero', tipo:'Bosque',
  tiro:30,pase:56,defensa:82,especial:81,
  hissatsu:['Corte de arena', 'Ultrasonidos', 'Presa de sombras'],tipoTecnica:'portero',
  desc:'Portero de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r957.webp'
},
{
  id:'r958', equipo:'Zanark Domain', nombre:'Tyrah', original:'Yaksha',
  posicion:'Defensa', tipo:'Fuego',
  tiro:55,pase:73,defensa:85,especial:78,
  hissatsu:['Barreno de fuego', 'Llamarada atómica', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Defensa de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r958.webp'
},
{
  id:'r959', equipo:'Zanark Domain', nombre:'Ayuta', original:'Zenki',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Salto explosivo', 'Campo torbellino', 'Balón de plasma'],tipoTecnica:'regate',
  desc:'Centrocampista de Zanark Domain en Inazuma Eleven GO Chrono Stone, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r959.webp'
},
{
  id:'r960', equipo:'Zanark Domain', equiposExtra:['Ejército de Terracota'], nombre:'Zhang Fei', original:'Zhangfei',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:70,defensa:39,especial:81,
  hissatsu:['Llamarada atómica', 'Remate del tigre', 'Avance chispeante'],tipoTecnica:'tiro',
  desc:'Delantero de Zanark Domain en Inazuma Eleven GO Chrono Stone.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r960.webp'
},
{
  id:'r961', equipo:'Gar', nombre:'Bhabass', original:'Babahs',
  posicion:'Portero', tipo:'Montaña',
  tiro:37,pase:59,defensa:75,especial:70,
  hissatsu:['Rayo de puño', 'Barrera de Gaia', 'Repulsión'],tipoTecnica:'portero',
  desc:'Portero de Gar en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r961.webp'
},
{
  id:'r962', equipo:'Gar', nombre:'Chikka', original:'Chikka',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:69,pase:78,defensa:63,especial:72,
  hissatsu:['Despliegue de señuelos', 'Regate topo', 'Visto y no visto'],tipoTecnica:'regate',
  desc:'Centrocampista de Gar en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r962.webp'
},
{
  id:'r963', equipo:'Gar', nombre:'Dekih', original:'Deck',
  posicion:'Delantero', tipo:'Bosque',
  tiro:79,pase:63,defensa:48,especial:70,
  hissatsu:['Gran Lobo', 'Lluvia de azufre', 'Choque directo'],tipoTecnica:'tiro',
  desc:'Delantero de Gar en Inazuma Eleven GO Chrono Stone, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r963.webp'
},
{
  id:'r964', equipo:'Gar', nombre:'Gumille', original:'Guumi',
  posicion:'Defensa', tipo:'Fuego',
  tiro:55,pase:63,defensa:75,especial:72,
  hissatsu:['Fiesta floral', 'Sello gigante', 'Grumo Pegapasta'],tipoTecnica:'defensa',
  desc:'Defensa de Gar en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r964.webp'
},
{
  id:'r965', equipo:'Gar', nombre:'Kazach', original:'Kazuchi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:63,defensa:75,especial:72,
  hissatsu:['Golpe de vacío', 'Finta boomerang', 'Muralla de las montañas'],tipoTecnica:'defensa',
  desc:'Defensa de Gar en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r965.webp'
},
{
  id:'r966', equipo:'Gar', nombre:'Mahrsa', original:'Masura',
  posicion:'Delantero', tipo:'Viento',
  tiro:79,pase:63,defensa:36,especial:70,
  hissatsu:['Doble hélice', 'Remolino acuático', 'Fuerza centrífuga'],tipoTecnica:'tiro',
  desc:'Delantero de Gar en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r966.webp'
},
{
  id:'r967', equipo:'Gar', nombre:'Sheenai', original:'Shiegetz',
  posicion:'Defensa', tipo:'Fuego',
  tiro:43,pase:65,defensa:77,especial:70,
  hissatsu:['Fiesta floral', 'Tormenta de pétalos', 'Estrella de roca'],tipoTecnica:'defensa',
  desc:'Defensa de Gar en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r967.webp'
},
{
  id:'r968', equipo:'Gar', nombre:'Tahk', original:'Takuji',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Despliegue de señuelos', 'Presa fractal', 'Tiro Balista'],tipoTecnica:'regate',
  desc:'Centrocampista de Gar en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r968.webp'
},
{
  id:'r969', equipo:'Gar', nombre:'Tessell', original:'Terau',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:63,especial:72,
  hissatsu:['Despliegue de señuelos', 'Finta boomerang', 'Carga de Elefantes'],tipoTecnica:'regate',
  desc:'Centrocampista de Gar en Inazuma Eleven GO Chrono Stone, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r969.webp'
},
{
  id:'r970', equipo:'Gir', nombre:'Bhufa', original:'Boofuu',
  posicion:'Portero', tipo:'Viento',
  tiro:24,pase:50,defensa:68,especial:67,
  hissatsu:['Campo de fuerza defensivo', 'Agujero de gusano', 'Repulsión'],tipoTecnica:'portero',
  desc:'Portero de Gir en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r970.webp'
},
{
  id:'r971', equipo:'Gir', nombre:'Darehn', original:'Deleine',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:60,defensa:72,especial:69,
  hissatsu:['Fiesta floral', 'Torre inexpugnable', 'Golpe de vacío'],tipoTecnica:'defensa',
  desc:'Defensa de Gir en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r971.webp'
},
{
  id:'r972', equipo:'Gir', nombre:'Enimaux', original:'Enimo',
  posicion:'Portero', tipo:'Fuego',
  tiro:34,pase:56,defensa:70,especial:69,
  hissatsu:['Tormenta de pétalos', 'Despeje explosivo', 'Repulsión'],tipoTecnica:'portero',
  desc:'Portero de Gir en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r972.webp'
},
{
  id:'r973', equipo:'Gir', nombre:'Ghimus', original:'Gims',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['Despliegue de señuelos', 'Carga de elefantes', 'Dragón ascendente'],tipoTecnica:'regate',
  desc:'Centrocampista de Gir en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r973.webp'
},
{
  id:'r974', equipo:'Gir', nombre:'Mabhi', original:'Mabi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['Despliegue de señuelos', 'A todo vapor', 'Hora Celestial'],tipoTecnica:'regate',
  desc:'Centrocampista de Gir en Inazuma Eleven GO Chrono Stone, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r974.webp'
},
{
  id:'r975', equipo:'Gir', nombre:'Miehd', original:'Mido',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['Despliegue de señuelos', 'Robo fantástico', 'Paisaje Helado'],tipoTecnica:'regate',
  desc:'Centrocampista de Gir en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r975.webp'
},
{
  id:'r976', equipo:'Gir', nombre:'Mustah', original:'Mista',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:58,defensa:70,especial:67,
  hissatsu:['Pinzas cortantes', 'A todo vapor', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Defensa de Gir en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r976.webp'
},
{
  id:'r977', equipo:'Gir', nombre:'Mohrir', original:'Molly',
  posicion:'Defensa', tipo:'Bosque',
  tiro:49,pase:59,defensa:71,especial:68,
  hissatsu:['Fiesta floral', 'Niebla mística', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Gir en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r977.webp'
},
{
  id:'r978', equipo:'Gir', nombre:'Nahrje', original:'Narje',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:64,pase:73,defensa:58,especial:71,
  hissatsu:['Despliegue de señuelos', 'Tiro vendaval', 'Picadora'],tipoTecnica:'regate',
  desc:'Centrocampista de Gir en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r978.webp'
},
{
  id:'r979', equipo:'Gir', nombre:'Veneth', original:'Veneto',
  posicion:'Delantero', tipo:'Montaña',
  tiro:75,pase:59,defensa:48,especial:66,
  hissatsu:['Doble hélice', 'Cascabel', 'Guardia acrobática'],tipoTecnica:'tiro',
  desc:'Delantero de Gir en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r979.webp'
},
{
  id:'r980', equipo:'Gir', nombre:'Tzeikh', original:'Zake',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:65,pase:74,defensa:59,especial:68,
  hissatsu:['Despliegue de señuelos', 'Presa fractal', 'Guardia acrobática'],tipoTecnica:'regate',
  desc:'Centrocampista de Gir en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r980.webp'
},
{
  id:'r981', equipo:'Gir', nombre:'Zohtan', original:'Zotan',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:58,defensa:70,especial:67,
  hissatsu:['Campo torbellino', 'La niebla', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Gir en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r981.webp'
},
{
  id:'r982', equipo:'Ragnah', nombre:'Lieva Snoshu', original:'Alica',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['El ojo del huracán', 'Tiro rotativo', 'Paisaje Helado'],tipoTecnica:'regate',
  desc:'Centrocampista de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r982.webp'
},
{
  id:'r983', equipo:'Ragnah', nombre:'Anas Eidah', original:'Dak',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:74,defensa:86,especial:83,
  hissatsu:['Campo minado', 'Doble hélice', 'Muralla de Atlantis'],tipoTecnica:'defensa',
  desc:'Defensa de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r983.webp'
},
{
  id:'r984', equipo:'Ragnah', nombre:'Russo Rosmarus', original:'Demeg',
  posicion:'Delantero', tipo:'Montaña',
  tiro:88,pase:72,defensa:39,especial:83,
  hissatsu:['Cabezazo gigatón', 'Cascabel', 'La gran muralla'],tipoTecnica:'tiro',
  desc:'Delantero de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r984.webp'
},
{
  id:'r985', equipo:'Ragnah', nombre:'Folie Vora', original:'Fetta',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['El ojo del huracán', 'Piroquinesis', 'Flecha de cupido'],tipoTecnica:'regate',
  desc:'Centrocampista de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r985.webp'
},
{
  id:'r986', equipo:'Ragnah', nombre:'Djung Hamstah', original:'Hams',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:73,defensa:85,especial:82,
  hissatsu:['Campo minado', 'Bobina eléctrica', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Defensa de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r986.webp'
},
{
  id:'r987', equipo:'Ragnah', nombre:'Hippos Kohlt', original:'Hos',
  posicion:'Portero', tipo:'Fuego',
  tiro:28,pase:50,defensa:82,especial:81,
  hissatsu:['Picadora', 'Manos liberadas', 'Recepción Negativa'],tipoTecnica:'portero',
  desc:'Portero de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r987.webp'
},
{
  id:'r988', equipo:'Ragnah', nombre:'Katya Felis', original:'Nike',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['El ojo del huracán', 'Barreno de fuego', 'Flecha de cupido'],tipoTecnica:'regate',
  desc:'Centrocampista de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r988.webp'
},
{
  id:'r989', equipo:'Ragnah', nombre:'Macah Psitta', original:'Omu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['El ojo del huracán', 'Tornado de fuego', 'Cruz del sur'],tipoTecnica:'regate',
  desc:'Centrocampista de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r989.webp'
},
{
  id:'r990', equipo:'Ragnah', nombre:'Pelta Chincha', original:'Peco',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:75,defensa:87,especial:80,
  hissatsu:['Campo minado', 'Remolino acuático', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r990.webp'
},
{
  id:'r991', equipo:'Ragnah', nombre:'Sus Swihn', original:'Pig',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['El ojo del huracán', 'Rematerialización', 'Despliegue de señuelos'],tipoTecnica:'regate',
  desc:'Centrocampista de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r991.webp'
},
{
  id:'r992', equipo:'Ragnah', nombre:'Ewa Mouton', original:'Sheep',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:73,defensa:85,especial:82,
  hissatsu:['Campo minado', 'Campo torbellino', 'Arrancada'],tipoTecnica:'defensa',
  desc:'Defensa de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r992.webp'
},
{
  id:'r993', equipo:'Ragnah', nombre:'Siid Sinapis', original:'Woods',
  posicion:'Portero', tipo:'Viento',
  tiro:34,pase:56,defensa:84,especial:83,
  hissatsu:['Puños certeros', 'Ancla de navío', 'Recepción Negativa'],tipoTecnica:'portero',
  desc:'Portero de Ragnah en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r993.webp'
},
{
  id:'r994', equipo:'Desesperdidos', nombre:'Chamomile', original:'Chamomi',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Formateo de disco', 'Fiesta floral', 'Lluvia de azufre'],tipoTecnica:'regate',
  desc:'Centrocampista de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r994.webp'
},
{
  id:'r995', equipo:'Desesperdidos', nombre:'Dandy', original:'Dande',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Formateo de disco', 'Proyectil letal', 'Estrella de roca'],tipoTecnica:'regate',
  desc:'Centrocampista de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r995.webp'
},
{
  id:'r996', equipo:'Desesperdidos', nombre:'Laven', original:'Laven',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Formateo de disco', 'Mordisco de serpiente', 'Pinzas cortantes'],tipoTecnica:'regate',
  desc:'Centrocampista de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r996.webp'
},
{
  id:'r997', equipo:'Desesperdidos', nombre:'Argyr', original:'Margar',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:69,defensa:81,especial:78,
  hissatsu:['Fiesta floral', 'Barrido defensivo', 'Agujero de gusano'],tipoTecnica:'defensa',
  desc:'Defensa de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r997.webp'
},
{
  id:'r998', equipo:'Desesperdidos', nombre:'Orchid', original:'Ochid',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Formateo de disco', 'Astro remate', 'Golpe de vacío'],tipoTecnica:'regate',
  desc:'Centrocampista de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r998.webp'
},
{
  id:'r999', equipo:'Desesperdidos', nombre:'Sterne', original:'Sun',
  posicion:'Delantero', tipo:'Bosque',
  tiro:81,pase:65,defensa:39,especial:76,
  hissatsu:['Engranajes aceleradores', 'Magnetismo', 'Triple amenaza'],tipoTecnica:'tiro',
  desc:'Delantero de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r999.webp'
},
{
  id:'r1000', equipo:'Desesperdidos', nombre:'Tulip', original:'Tuli',
  posicion:'Defensa', tipo:'Montaña',
  tiro:40,pase:69,defensa:81,especial:78,
  hissatsu:['Fiesta floral', 'Mina terrestre', 'La montaña'],tipoTecnica:'defensa',
  desc:'Defensa de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1000.webp'
},
{
  id:'r1001', equipo:'Desesperdidos', nombre:'Viol', original:'Viola',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:83,defensa:68,especial:77,
  hissatsu:['Formateo de disco', 'Despeje explosivo', 'Escudo de Fuerza'],tipoTecnica:'regate',
  desc:'Centrocampista de Desesperdidos en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1001.webp'
},
{
  id:'r1002', equipo:'Los arions', nombre:'Tiny', original:'Chibitto',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:43,pase:52,defensa:37,especial:50,
  hissatsu:['Espejismo de balón', 'Mirada ladrona', 'La niebla'],tipoTecnica:'regate',
  desc:'Centrocampista de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1002.webp'
},
{
  id:'r1003', equipo:'Los arions', nombre:'Clark von Wunderbar', original:'Clark Wonderbot',
  posicion:'Delantero', tipo:'Viento',
  tiro:56,pase:40,defensa:46,especial:47,
  hissatsu:['Remate Rebotado', 'Tormenta dimensional', 'Zig Zag Explosivo'],tipoTecnica:'tiro',
  desc:'Delantero de Los arions en Inazuma Eleven GO Chrono Stone.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1003.webp'
},
{
  id:'r1004', equipo:'Los arions', nombre:'Chunky', original:'Deboon',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:42,defensa:54,especial:47,
  hissatsu:['Presa fractal', 'Mirada al futuro', 'Mirada ladrona'],tipoTecnica:'defensa',
  desc:'Defensa de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1004.webp'
},
{
  id:'r1005', equipo:'Los arions', nombre:'Spikey', original:'Drill',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:44,pase:53,defensa:38,especial:51,
  hissatsu:['Espejismo de balón', 'Robo fantástico', 'Red de caza'],tipoTecnica:'regate',
  desc:'Centrocampista de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1005.webp'
},
{
  id:'r1006', equipo:'Los arions', nombre:'Biggsy', original:'Machos',
  posicion:'Portero', tipo:'Bosque',
  tiro:33,pase:59,defensa:52,especial:47,
  hissatsu:['Captura excelente', 'Despeje explosivo', 'Parada en Plancha'],tipoTecnica:'portero',
  desc:'Portero de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1006.webp'
},
{
  id:'r1007', equipo:'Los arions', nombre:'Hairy', original:'Manto',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:46,pase:55,defensa:40,especial:49,
  hissatsu:['Espejismo de balón', 'Campo torbellino', 'Cruz del sur'],tipoTecnica:'regate',
  desc:'Centrocampista de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1007.webp'
},
{
  id:'r1008', equipo:'Los arions', nombre:'Smiley', original:'Smile',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:39,defensa:51,especial:48,
  hissatsu:['Presa fractal', 'Onda chispeante', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1008.webp'
},
{
  id:'r1009', equipo:'Los arions', nombre:'Skinny', original:'Strow',
  posicion:'Defensa', tipo:'Bosque',
  tiro:49,pase:42,defensa:54,especial:47,
  hissatsu:['Presa fractal', 'Mirada al futuro', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1009.webp'
},
{
  id:'r1010', equipo:'Los arions', nombre:'Smarty', original:'Wally',
  posicion:'Defensa', tipo:'Bosque',
  tiro:57,pase:40,defensa:52,especial:49,
  hissatsu:['Presa fractal', 'Remolino acuático', 'Gran tifón'],tipoTecnica:'defensa',
  desc:'Defensa de Los arions en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1010.webp'
},
{
  id:'r1011', equipo:'Nosfanáticos', nombre:'Porphyria Filia', original:'Belia',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:83,defensa:68,especial:77,
  hissatsu:['Círculo de hielo', 'Fiesta floral', 'Despliegue de señuelos'],tipoTecnica:'regate',
  desc:'Centrocampista de Nosfanáticos en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1011.webp'
},
{
  id:'r1012', equipo:'Nosfanáticos', equiposExtra:['Criaturas de la Noche'], nombre:'Vince Sizor', original:'Frango',
  posicion:'Portero', tipo:'Bosque',
  tiro:25,pase:59,defensa:80,especial:75,
  hissatsu:['Gravitación', 'Bobina eléctrica', 'Bimano celestial'],tipoTecnica:'portero',
  desc:'Portero de Nosfanáticos en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1012.webp'
},
{
  id:'r1013', equipo:'Nosfanáticos', nombre:'Hugh Mumford', original:'Miira',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:71,pase:80,defensa:65,especial:78,
  hissatsu:['Pasos aéreos', 'Niebla mística', 'Tiro Espectral'],tipoTecnica:'regate',
  desc:'Centrocampista de Nosfanáticos en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1013.webp'
},
{
  id:'r1014', equipo:'Nosfanáticos', equiposExtra:['Criaturas de la Noche'], nombre:'Turner Fogg', original:'Porto',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:69,defensa:81,especial:78,
  hissatsu:['Muralla de Atlantis', 'Mina terrestre', 'Estrella de roca'],tipoTecnica:'defensa',
  desc:'Defensa de Nosfanáticos en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1014.webp'
},
{
  id:'r1015', equipo:'Nosfanáticos', nombre:'Sid Viper', original:'Snaker',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Himno de atenea', 'Corte mágico', 'Remate Rebotado'],tipoTecnica:'regate',
  desc:'Centrocampista de Nosfanáticos en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1015.webp'
},
{
  id:'r1016', equipo:'Nosfanáticos', equiposExtra:['Criaturas de la Noche'], nombre:'Woodrow Stake', original:'Vlad',
  posicion:'Delantero', tipo:'Bosque',
  tiro:84,pase:68,defensa:38,especial:75,
  hissatsu:['Balon iceberg', 'Trance melódico', 'Lluvia de azufre'],tipoTecnica:'tiro',
  desc:'Delantero de Nosfanáticos en Inazuma Eleven GO Chrono Stone, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1016.webp'
},
{
  id:'r1017', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Mona Selene', original:'Anansi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:71,pase:80,defensa:65,especial:78,
  hissatsu:['Avance chispeante', 'Fiesta floral', 'Luz Cegadora'],tipoTecnica:'regate',
  desc:'Centrocampista de Criaturas de la Noche en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1017.webp'
},
{
  id:'r1018', equipo:'Criaturas de la Noche', equiposExtra:['Aullido Lunar'], nombre:'Hunter O’Mann', original:'Jaega',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:71,pase:80,defensa:65,especial:78,
  hissatsu:['Avance chispeante', 'Torre inexpugnable', 'Cruz del sur'],tipoTecnica:'regate',
  desc:'Centrocampista de Criaturas de la Noche en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1018.webp'
},
{
  id:'r1019', equipo:'Cascada Perfecta', nombre:'Aye Nort', original:'A Simov',
  posicion:'Delantero', tipo:'Montaña',
  tiro:92,pase:76,defensa:40,especial:87,
  hissatsu:['Astro remate', 'Tiro sónico', 'Doble trallazo planetario'],tipoTecnica:'tiro',
  desc:'Delantero de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1019.webp'
},
{
  id:'r1020', equipo:'Cascada Perfecta', nombre:'Dee Vee', original:'Bado Addo',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:77,defensa:89,especial:86,
  hissatsu:['Acrobacia robótica', 'Estampida en línea', 'Cabezazo cohete'],tipoTecnica:'defensa',
  desc:'Defensa de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1020.webp'
},
{
  id:'r1021', equipo:'Cascada Perfecta', nombre:'Em Tee', original:'Bull Rex',
  posicion:'Delantero', tipo:'Montaña',
  tiro:91,pase:75,defensa:47,especial:86,
  hissatsu:['Doble trallazo planetario', 'Ventisca eterna', 'Tiro Sónico'],tipoTecnica:'tiro',
  desc:'Delantero de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1021.webp'
},
{
  id:'r1022', equipo:'Cascada Perfecta', nombre:'Cee Eff', original:'Dai Load',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:83,pase:92,defensa:77,especial:90,
  hissatsu:['Estampida en línea', 'La niebla', 'Tiro Sónico'],tipoTecnica:'regate',
  desc:'Centrocampista de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1022.webp'
},
{
  id:'r1023', equipo:'Cascada Perfecta', nombre:'Wun Ell', original:'Emi Ul',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:83,pase:92,defensa:77,especial:90,
  hissatsu:['Estampida en línea', 'Doble trallazo planetario', 'Acrobacia robótica'],tipoTecnica:'regate',
  desc:'Centrocampista de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1023.webp'
},
{
  id:'r1024', equipo:'Cascada Perfecta', nombre:'Zed Kyu', original:'Fa Neil',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Estampida en línea', 'Red de caza', 'Robo fantástico'],tipoTecnica:'regate',
  desc:'Centrocampista de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1024.webp'
},
{
  id:'r1025', equipo:'Cascada Perfecta', nombre:'Ough Cee', original:'Gra Fom',
  posicion:'Delantero', tipo:'Fuego',
  tiro:93,pase:77,defensa:35,especial:88,
  hissatsu:['Doble trallazo planetario', 'Proyectil letal', 'Torbellino de fuego'],tipoTecnica:'tiro',
  desc:'Delantero de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1025.webp'
},
{
  id:'r1026', equipo:'Cascada Perfecta', nombre:'Ji Tenn', original:'Il Mel',
  posicion:'Delantero', tipo:'Viento',
  tiro:92,pase:76,defensa:42,especial:87,
  hissatsu:['Ventisca eterna', 'Tiro sónico', 'Doble trallazo planetario'],tipoTecnica:'tiro',
  desc:'Delantero de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1026.webp'
},
{
  id:'r1027', equipo:'Cascada Perfecta', nombre:'Kay Zirro', original:'Kay Rowe',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Estampida en línea', 'Picadora', 'Bomba saltarina'],tipoTecnica:'regate',
  desc:'Centrocampista de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1027.webp'
},
{
  id:'r1028', equipo:'Cascada Perfecta', nombre:'Vee Wai', original:'Lau Sem',
  posicion:'Portero', tipo:'Bosque',
  tiro:39,pase:53,defensa:88,especial:87,
  hissatsu:['Despeje medialuna', 'Agujero de gusano', 'Mano Celestial'],tipoTecnica:'portero',
  desc:'Portero de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1028.webp'
},
{
  id:'r1029', equipo:'Cascada Perfecta', nombre:'Ayt Bee', original:'Lin Cool',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:77,defensa:89,especial:86,
  hissatsu:['Acrobacia robótica', 'Picadora', 'Remolino acuático'],tipoTecnica:'defensa',
  desc:'Defensa de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1029.webp'
},
{
  id:'r1030', equipo:'Cascada Perfecta', nombre:'En Sicks', original:'Ma Donel',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:79,defensa:91,especial:88,
  hissatsu:['Acrobacia robótica', 'Estampida en línea', 'La niebla'],tipoTecnica:'defensa',
  desc:'Defensa de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1030.webp'
},
{
  id:'r1031', equipo:'Cascada Perfecta', nombre:'Jay Yuu', original:'Nie Bell',
  posicion:'Portero', tipo:'Fuego',
  tiro:37,pase:59,defensa:90,especial:85,
  hissatsu:['Agujero de gusano', 'Rayo de puño', 'Despeje medialuna'],tipoTecnica:'portero',
  desc:'Portero de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1031.webp'
},
{
  id:'r1032', equipo:'Cascada Perfecta', nombre:'Ar Ecks', original:'Rei Rukh',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:86,pase:95,defensa:77,especial:93,
  hissatsu:['Estampida en línea', 'Doble trallazo planetario', 'Estrella oscura'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1032.webp'
},
{
  id:'r1033', equipo:'Cascada Perfecta', nombre:'Tu Eigh', original:'Sei Servo',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Estampida en línea', 'Red de caza', 'Salto incandescente'],tipoTecnica:'regate',
  desc:'Centrocampista de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1033.webp'
},
{
  id:'r1034', equipo:'Cascada Perfecta', nombre:'Faiv Ess', original:'Zara Kusu',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:79,defensa:91,especial:88,
  hissatsu:['Picadora', 'Bateo total', 'Rodillazos atómicos'],tipoTecnica:'defensa',
  desc:'Defensa de Cascada Perfecta en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1034.webp'
},
{
  id:'r1035', equipo:'Zan', nombre:'Kuhrach', original:'Clutch',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Tornado de fuego', 'Torbellino de fuego', 'Bomba saltarina'],tipoTecnica:'tiro',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1035.webp'
},
{
  id:'r1036', equipo:'Zan', nombre:'Dios', original:'Deos',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Despliegue de señuelos', 'Mina terrestre', 'Dragón ascendente'],tipoTecnica:'regate',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1036.webp'
},
{
  id:'r1037', equipo:'Zan', nombre:'Driss', original:'Doris',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:77,defensa:89,especial:82,
  hissatsu:['Barrido defensivo', 'Rodillazos atómicos', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Defensa de Zan en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1037.webp'
},
{
  id:'r1038', equipo:'Zan', nombre:'Feduhm', original:'Fadam',
  posicion:'Portero', tipo:'Viento',
  tiro:33,pase:59,defensa:87,especial:82,
  hissatsu:['Despeje explosivo', 'Escudo de fuerza', 'Repulsión'],tipoTecnica:'portero',
  desc:'Portero de Zan en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1038.webp'
},
{
  id:'r1039', equipo:'Zan', nombre:'Garreau', original:'Garo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:73,especial:86,
  hissatsu:['Lanza de odín', 'Picadora', 'Mina terrestre'],tipoTecnica:'tiro',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1039.webp'
},
{
  id:'r1040', equipo:'Zan', nombre:'Grigham', original:'Gigam',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Despliegue de señuelos', 'Entrada huracán', 'Danza del viento'],tipoTecnica:'regate',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1040.webp'
},
{
  id:'r1041', equipo:'Zan', nombre:'Heyze', original:'Haze',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Entrada huracán', 'Despliegue de señuelos', 'Danza del viento'],tipoTecnica:'regate',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1041.webp'
},
{
  id:'r1042', equipo:'Zan', nombre:'Djibz', original:'Jips',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:80,pase:89,defensa:74,especial:87,
  hissatsu:['Doble hélice', 'Despliegue de señuelos', 'Torbellino de fuego'],tipoTecnica:'tiro',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1042.webp'
},
{
  id:'r1043', equipo:'Zan', nombre:'Mhadoor', original:'Muddle',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:77,defensa:89,especial:82,
  hissatsu:['El muro', 'Barrido defensivo', 'Picadora'],tipoTecnica:'defensa',
  desc:'Defensa de Zan en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1043.webp'
},
{
  id:'r1044', equipo:'Zan', nombre:'Rodh', original:'Rodeo',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Despliegue de señuelos', 'Doble hélice', 'Círculo de hielo'],tipoTecnica:'regate',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1044.webp'
},
{
  id:'r1045', equipo:'Zan', nombre:'Ludeau', original:'Rude',
  posicion:'Defensa', tipo:'Montaña',
  tiro:56,pase:74,defensa:86,especial:83,
  hissatsu:['Carga de elefantes', 'Pinzas cortantes', 'Golpe de vacío'],tipoTecnica:'defensa',
  desc:'Defensa de Zan en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1045.webp'
},
{
  id:'r1046', equipo:'Zan', nombre:'Steiyah', original:'Stia',
  posicion:'Portero', tipo:'Montaña',
  tiro:21,pase:59,defensa:87,especial:82,
  hissatsu:['Mano celestial', 'Barrera de Gaia', 'Repulsión'],tipoTecnica:'portero',
  desc:'Portero de Zan en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1046.webp'
},
{
  id:'r1047', equipo:'Zan', nombre:'Tsync', original:'Sync',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:75,defensa:87,especial:84,
  hissatsu:['Picadora', 'Piroquinesis', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Defensa de Zan en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1047.webp'
},
{
  id:'r1048', equipo:'Zan', nombre:'Torhm', original:'Torm',
  posicion:'Delantero', tipo:'Bosque',
  tiro:90,pase:74,defensa:43,especial:85,
  hissatsu:['Doble hélice', 'Lanza de odín', 'Cañon de Meteoritos'],tipoTecnica:'tiro',
  desc:'Delantero de Zan en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1048.webp'
},
{
  id:'r1049', equipo:'Zan', nombre:'Zatang', original:'Zatan',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:80,pase:89,defensa:74,especial:87,
  hissatsu:['Despliegue de señuelos', 'Rodillazos atómicos', 'Avance chispeante'],tipoTecnica:'regate',
  desc:'Centrocampista de Zan en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1049.webp'
},
{
  id:'r1050', equipo:'Aullido Lunar', nombre:'Al Woo', original:'Nagun',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Cruz del sur', 'Robo fantástico', 'Himno de atenea'],tipoTecnica:'regate',
  desc:'Centrocampista de Aullido Lunar en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1050.webp'
},
{
  id:'r1051', equipo:'Aullido Lunar', nombre:'Sylvester Bullet', original:'Silva',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Cruz del sur', 'Robo fantástico', 'Proyectil de Ozono'],tipoTecnica:'regate',
  desc:'Centrocampista de Aullido Lunar en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1051.webp'
},
{
  id:'r1052', equipo:'Aullido Lunar', nombre:'Lou Garrou', original:'Tauros',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Remolino ígneo', 'Pinzas cortantes', 'Mina terrestre'],tipoTecnica:'regate',
  desc:'Centrocampista de Aullido Lunar en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1052.webp'
},
{
  id:'r1053', equipo:'Ciervo Blanco', nombre:'Denbee Asama', original:'Asama Denbei',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Ataque de garza', 'Campo torbellino', 'Danza del viento'],tipoTecnica:'regate',
  desc:'Centrocampista de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1053.webp'
},
{
  id:'r1054', equipo:'Ciervo Blanco', nombre:'Hoichiro Ashiguro', original:'Ashiguro Houichirou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:41,pase:67,defensa:79,especial:72,
  hissatsu:['Muralla de las montañas', 'Regate topo', 'Engranajes aceleradores'],tipoTecnica:'defensa',
  desc:'Defensa de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1054.webp'
},
{
  id:'r1055', equipo:'Ciervo Blanco', nombre:'Hokuro Ayabe', original:'Ayabe Houkurou',
  posicion:'Delantero', tipo:'Fuego',
  tiro:78,pase:62,defensa:45,especial:73,
  hissatsu:['Tiro de arcabuz', 'Confusión', 'Ataque de garza'],tipoTecnica:'tiro',
  desc:'Delantero de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1055.webp'
},
{
  id:'r1056', equipo:'Ciervo Blanco', nombre:'Norimaru Gazen', original:'Gazen Norimaru',
  posicion:'Portero', tipo:'Montaña',
  tiro:38,pase:56,defensa:76,especial:75,
  hissatsu:['Parada en plancha', 'Presa de sombras', 'Ciclón Humano'],tipoTecnica:'portero',
  desc:'Portero de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1056.webp'
},
{
  id:'r1057', equipo:'Ciervo Blanco', nombre:'Kaburo Hayama', original:'Hayama Kaburou',
  posicion:'Delantero', tipo:'Viento',
  tiro:78,pase:62,defensa:37,especial:73,
  hissatsu:['Tiro de arcabuz', 'Entrada huracán', 'Dragón ascendente'],tipoTecnica:'tiro',
  desc:'Delantero de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1057.webp'
},
{
  id:'r1058', equipo:'Ciervo Blanco', nombre:'Taian Inaba', original:'Inaba Taian',
  posicion:'Delantero', tipo:'Viento',
  tiro:81,pase:62,defensa:35,especial:76,
  hissatsu:['Tiro de arcabuz', 'Ataque de garza', 'Furia de los elementos'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 10.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1058.webp'
},
{
  id:'r1059', equipo:'Ciervo Blanco', nombre:'Ikkatsu Kano', original:'Kanou Ikkatsu',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Ataque de garza', 'La niebla', 'Fortaleza nocturna'],tipoTecnica:'regate',
  desc:'Centrocampista de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1059.webp'
},
{
  id:'r1060', equipo:'Ciervo Blanco', nombre:'Sokichi Kitagami', original:'Kitagami Soukichi',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:64,defensa:76,especial:73,
  hissatsu:['Muralla de las montañas', 'Campo torbellino', 'Golpe de vacío'],tipoTecnica:'defensa',
  desc:'Defensa de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1060.webp'
},
{
  id:'r1061', equipo:'Ciervo Blanco', nombre:'Senji Kudo', original:'Kutou Senji',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Ataque de garza', 'Tiro de arcabuz', 'Confusión'],tipoTecnica:'regate',
  desc:'Centrocampista de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1061.webp'
},
{
  id:'r1062', equipo:'Ciervo Blanco', nombre:'Korin Maebayashi', original:'Maebayashi Kourin',
  posicion:'Delantero', tipo:'Bosque',
  tiro:80,pase:64,defensa:45,especial:75,
  hissatsu:['Tiro de arcabuz', 'Chut ancestral', 'Ataque de garza'],tipoTecnica:'tiro',
  desc:'Delantero de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1062.webp'
},
{
  id:'r1063', equipo:'Ciervo Blanco', nombre:'Denrai Ochimura', original:'Ochimura Denrai',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:71,pase:80,defensa:65,especial:74,
  hissatsu:['Ataque de garza', 'A todo vapor', 'Piroquinesis'],tipoTecnica:'regate',
  desc:'Centrocampista de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1063.webp'
},
{
  id:'r1064', equipo:'Ciervo Blanco', nombre:'Ginji Santetsu', original:'Santetsu Ginji',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Ataque de garza', 'Impulso efímero', 'Muralla de las montañas'],tipoTecnica:'regate',
  desc:'Centrocampista de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1064.webp'
},
{
  id:'r1065', equipo:'Ciervo Blanco', nombre:'Mikimaru Ujiki', original:'Ujiki Mikimaru',
  posicion:'Portero', tipo:'Bosque',
  tiro:27,pase:53,defensa:75,especial:74,
  hissatsu:['Confusión', 'Ciclón blanco', 'Ciclón Humano'],tipoTecnica:'portero',
  desc:'Portero de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1065.webp'
},
{
  id:'r1066', equipo:'Ciervo Blanco', nombre:'Hanbee Yabe', original:'Yabe Hanbee',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:66,defensa:78,especial:75,
  hissatsu:['Muralla de las montañas', 'Bateo total', 'Tiro de arcabuz'],tipoTecnica:'defensa',
  desc:'Defensa de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1066.webp'
},
{
  id:'r1067', equipo:'Ciervo Blanco', nombre:'Tenkei Yazu', original:'Yazu Tenkei',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Entrada huracán', 'Campo torbellino', 'Golpe de vacío'],tipoTecnica:'regate',
  desc:'Centrocampista de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1067.webp'
},
{
  id:'r1068', equipo:'Ciervo Blanco', nombre:'Doshin Yomoyama', original:'Yomoyama Doushin',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:64,defensa:76,especial:73,
  hissatsu:['Ataque de garza', 'Fortaleza nocturna', 'Muralla de las montañas'],tipoTecnica:'regate',
  desc:'Defensa de Ciervo Blanco en Inazuma Eleven GO Chrono Stone, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1068.webp'
},
{
  id:'r1069', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 5', original:'Bingmayong no Go',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Rematerialización', 'Defensa propulsada', 'Carga de Elefantes'],tipoTecnica:'regate',
  desc:'Centrocampista de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1069.webp'
},
{
  id:'r1070', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 8', original:'Bingmayong no Hachi',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:73,pase:82,defensa:67,especial:76,
  hissatsu:['Rematerialización', 'Zigzag explosivo', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1070.webp'
},
{
  id:'r1071', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 1', original:'Bingmayong no Ichi',
  posicion:'Portero', tipo:'Viento',
  tiro:29,pase:59,defensa:82,especial:77,
  hissatsu:['Rayo de puño', 'Obstrucción eléctrica', 'Rotación inversa'],tipoTecnica:'portero',
  desc:'Portero y capitán de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1071.webp'
},
{
  id:'r1072', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 10', original:'Bingmayong no Juu',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Rematerialización', 'Picadora', 'Avance chispeante'],tipoTecnica:'regate',
  desc:'Centrocampista de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1072.webp'
},
{
  id:'r1073', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 11', original:'Bingmayong no Juuichi',
  posicion:'Delantero', tipo:'Montaña',
  tiro:81,pase:65,defensa:36,especial:76,
  hissatsu:['Engranajes aceleradores', 'Rematerialización', 'Mina terrestre'],tipoTecnica:'tiro',
  desc:'Delantero de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1073.webp'
},
{
  id:'r1074', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 9', original:'Bingmayong no Kyuu',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Rematerialización', 'Obstrucción eléctrica', 'Engranajes aceleradores'],tipoTecnica:'regate',
  desc:'Centrocampista de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1074.webp'
},
{
  id:'r1075', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 2', original:'Bingmayong no Ni',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:69,defensa:81,especial:74,
  hissatsu:['Obstrucción eléctrica', 'Rayo de puño', 'Fuerza centrífuga'],tipoTecnica:'defensa',
  desc:'Defensa de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1075.webp'
},
{
  id:'r1076', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 6', original:'Bingmayong no Roku',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:73,pase:82,defensa:67,especial:76,
  hissatsu:['Rematerialización', 'Obstrucción eléctrica', 'Defensa propulsada'],tipoTecnica:'regate',
  desc:'Centrocampista de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1076.webp'
},
{
  id:'r1077', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 3', original:'Bingmayong no San',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:68,defensa:80,especial:77,
  hissatsu:['Obstrucción eléctrica', 'Rematerialización', 'Rayo de puño'],tipoTecnica:'defensa',
  desc:'Defensa de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1077.webp'
},
{
  id:'r1078', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 7', original:'Bingmayong no Shichi',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Rematerialización', 'Fuerza centrífuga', 'Danza del viento'],tipoTecnica:'regate',
  desc:'Centrocampista de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1078.webp'
},
{
  id:'r1079', equipo:'Ejército de Terracota', nombre:'Guerrero de terracota 4', original:'Bingmayong no Yon',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:68,defensa:80,especial:77,
  hissatsu:['Obstrucción eléctrica', 'Piroquinesis', 'Niebla Mística'],tipoTecnica:'defensa',
  desc:'Defensa de Ejército de Terracota en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1079.webp'
},
{
  id:'r1080', equipo:'Caballeros de la Mesa Redonda', nombre:'King Arthur', original:'King Arthur',
  posicion:'Delantero', tipo:'Montaña',
  tiro:87,pase:71,defensa:42,especial:82,
  hissatsu:['Impulso del equipo definitivo', 'Espada de Odín', 'Trance melódico'],tipoTecnica:'tiro',
  desc:'Delantero de Caballeros de la Mesa Redonda en Inazuma Eleven GO Chrono Stone.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1080.webp'
},
{
  id:'r1081', equipo:'Robots Futbolistas', nombre:'FB-101X', original:'SR-101X',
  posicion:'Portero', tipo:'Montaña',
  tiro:32,pase:50,defensa:73,especial:72,
  hissatsu:['Rayo de puño', 'Parada en plancha', 'Estrella Reflectante'],tipoTecnica:'portero',
  desc:'Portero y capitán de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 1.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1081.webp'
},
{
  id:'r1082', equipo:'Robots Futbolistas', nombre:'FB-102X', original:'SR-102X',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:61,defensa:73,especial:70,
  hissatsu:['Obstrucción eléctrica', 'A todo vapor', 'Finta boomerang'],tipoTecnica:'defensa',
  desc:'Defensa de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1082.webp'
},
{
  id:'r1083', equipo:'Robots Futbolistas', nombre:'FB-103X', original:'SR-103X',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:62,defensa:74,especial:71,
  hissatsu:['Obstrucción eléctrica', 'Rematerialización', 'Copia y corta'],tipoTecnica:'defensa',
  desc:'Defensa de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1083.webp'
},
{
  id:'r1084', equipo:'Robots Futbolistas', nombre:'FB-104X', original:'SR-104X',
  posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:63,defensa:75,especial:68,
  hissatsu:['Obstrucción eléctrica', 'A todo vapor', 'Arrancada'],tipoTecnica:'defensa',
  desc:'Defensa de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1084.webp'
},
{
  id:'r1085', equipo:'Robots Futbolistas', nombre:'FB-105X', original:'SR-105X',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:64,pase:73,defensa:58,especial:71,
  hissatsu:['Obstrucción eléctrica', 'Rematerialización', 'Matriz selladora'],tipoTecnica:'defensa',
  desc:'Centrocampista de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1085.webp'
},
{
  id:'r1086', equipo:'Robots Futbolistas', nombre:'FB-106X', original:'SR-106X',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:65,pase:74,defensa:59,especial:72,
  hissatsu:['Rematerialización', 'Mirada al futuro', 'Cabezazo cohete'],tipoTecnica:'regate',
  desc:'Centrocampista de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1086.webp'
},
{
  id:'r1087', equipo:'Robots Futbolistas', nombre:'FB-107X', original:'SR-107X',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['Rematerialización', 'Trayectoria perfecta', 'Visto y no visto'],tipoTecnica:'regate',
  desc:'Centrocampista de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1087.webp'
},
{
  id:'r1088', equipo:'Robots Futbolistas', nombre:'FB-108X', original:'SR-108X',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:76,defensa:61,especial:70,
  hissatsu:['Rematerialización', 'Obstrucción eléctrica', 'Tiro Sónico'],tipoTecnica:'regate',
  desc:'Centrocampista de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1088.webp'
},
{
  id:'r1089', equipo:'Robots Futbolistas', nombre:'FB-109X', original:'SR-109X',
  posicion:'Delantero', tipo:'Montaña',
  tiro:74,pase:58,defensa:43,especial:69,
  hissatsu:['Engranajes aceleradores', 'Mirada al futuro', 'Onda chispeante'],tipoTecnica:'tiro',
  desc:'Delantero de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1089.webp'
},
{
  id:'r1090', equipo:'Robots Futbolistas', nombre:'FB-110X', original:'SR-110X',
  posicion:'Delantero', tipo:'Fuego',
  tiro:76,pase:60,defensa:39,especial:71,
  hissatsu:['Engranajes aceleradores', 'A todo vapor', 'Cabezazo cohete'],tipoTecnica:'tiro',
  desc:'Delantero de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1090.webp'
},
{
  id:'r1091', equipo:'Robots Futbolistas', nombre:'FB-111X', original:'SR-111X',
  posicion:'Delantero', tipo:'Bosque',
  tiro:77,pase:61,defensa:42,especial:68,
  hissatsu:['Engranajes aceleradores', 'Mirada ladrona', 'Piroquinesis'],tipoTecnica:'tiro',
  desc:'Delantero de Robots Futbolistas en Inazuma Eleven GO Chrono Stone, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1091.webp'
},
{
  id:'r1092', equipo:'Dinastía Galáctica', nombre:'Arculus Orbes', original:'Acrous Obies',
  posicion:'Delantero', tipo:'Viento',
  tiro:96,pase:77,defensa:36,especial:87,
  hissatsu:['Remate orbital', 'Arco psíquico', 'Supernova'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1092.webp'
},
{
  id:'r1093', equipo:'Dinastía Galáctica', nombre:'Apas Mulan', original:'Apas Muulan',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:77,defensa:89,especial:86,
  hissatsu:['Bloqueo telequinético', 'Pinzas cortantes', 'Dragón ascendente'],tipoTecnica:'defensa',
  desc:'Defensa de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1093.webp'
},
{
  id:'r1094', equipo:'Dinastía Galáctica', nombre:'Ashley Sarpala', original:'Ashley Sarpara',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Arco psíquico', 'Bofetón látigo', 'Bola de Hojas'],tipoTecnica:'regate',
  desc:'Centrocampista de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1094.webp'
},
{
  id:'r1095', equipo:'Dinastía Galáctica', nombre:'Ashvina Bharani', original:'Ashvina Bharani',
  posicion:'Portero', tipo:'Viento',
  tiro:33,pase:59,defensa:89,especial:84,
  hissatsu:['Sacrificio', 'Estrella reflectante', 'Dardo Acuático'],tipoTecnica:'portero',
  desc:'Portero de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1095.webp'
},
{
  id:'r1096', equipo:'Dinastía Galáctica', nombre:'Bambaros Tower', original:'Bambaros Tower',
  posicion:'Defensa', tipo:'Montaña',
  tiro:54,pase:78,defensa:90,especial:87,
  hissatsu:['Formación defensiva', 'Pinzas cortantes', 'Muro de Hierro'],tipoTecnica:'defensa',
  desc:'Defensa de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1096.webp'
},
{
  id:'r1097', equipo:'Dinastía Galáctica', nombre:'Bhaga Guni', original:'Bhaga Gouny',
  posicion:'Defensa', tipo:'Fuego',
  tiro:57,pase:79,defensa:91,especial:84,
  hissatsu:['Bloqueo telequinético', 'Cabezazo cohete', 'Vuelo volcánico'],tipoTecnica:'defensa',
  desc:'Defensa de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1097.webp'
},
{
  id:'r1098', equipo:'Dinastía Galáctica', nombre:'Bindal Hermit', original:'Bind Hermit',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Espada de  atlas', 'Magnetismo', 'El ojo del huracán'],tipoTecnica:'regate',
  desc:'Centrocampista de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1098.webp'
},
{
  id:'r1099', equipo:'Dinastía Galáctica', nombre:'Fow Tudas', original:'Fou Tudus',
  posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:79,defensa:91,especial:84,
  hissatsu:['Formación defensiva', 'Barrena voladora', 'Barreno de fuego'],tipoTecnica:'defensa',
  desc:'Defensa de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1099.webp'
},
{
  id:'r1100', equipo:'Dinastía Galáctica', nombre:'Indra Vayu', original:'Indra Vayu',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Arco psíquico', 'Visto y no visto', 'Golpe Cataclismo'],tipoTecnica:'regate',
  desc:'Centrocampista de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1100.webp'
},
{
  id:'r1101', equipo:'Dinastía Galáctica', nombre:'Joss Fool', original:'Joss Fool',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Espada de  atlas', 'Tiro sobrenatural', 'Ceniza Negra'],tipoTecnica:'regate',
  desc:'Centrocampista de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1101.webp'
},
{
  id:'r1102', equipo:'Dinastía Galáctica', nombre:'Madison Barada', original:'Madison Ballada',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:76,defensa:88,especial:85,
  hissatsu:['Formación defensiva', 'Carga de elefantes', 'Caída Prehistórica'],tipoTecnica:'defensa',
  desc:'Defensa de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1102.webp'
},
{
  id:'r1103', equipo:'Dinastía Galáctica', nombre:'Mitra Jeshu', original:'Mitra Jeshuu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Arco psíquico', 'Rayo de Ganímedes', 'El ojo del huracán'],tipoTecnica:'regate',
  desc:'Centrocampista de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1103.webp'
},
{
  id:'r1104', equipo:'Dinastía Galáctica', nombre:'Circulus', original:'Sarjes Luhg',
  posicion:'Delantero', tipo:'Fuego',
  tiro:90,pase:74,defensa:41,especial:85,
  hissatsu:['Tiro del corazón real', 'Espada de  atlas', 'Big bang'],tipoTecnica:'tiro',
  desc:'Delantero de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1104.webp'
},
{
  id:'r1105', equipo:'Dinastía Galáctica', nombre:'Soma Lobi', original:'Soma Rohby',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:78,defensa:90,especial:87,
  hissatsu:['Bloqueo telequinético', 'Zigzag explosivo', 'Zig Zag Explosivo'],tipoTecnica:'defensa',
  desc:'Defensa de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1105.webp'
},
{
  id:'r1106', equipo:'Dinastía Galáctica', nombre:'Strem Goozer', original:'Strem Gooser',
  posicion:'Portero', tipo:'Fuego',
  tiro:28,pase:50,defensa:86,especial:85,
  hissatsu:['Portón del castillo', 'Muralla Gigante', 'Manos liberadas'],tipoTecnica:'portero',
  desc:'Portero de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1106.webp'
},
{
  id:'r1107', equipo:'Dinastía Galáctica', nombre:'Zartan Walder', original:'Zahtan Worlder',
  posicion:'Defensa', tipo:'Fuego',
  tiro:47,pase:77,defensa:89,especial:86,
  hissatsu:['Formación defensiva', 'Piroquinesis', 'Salto explosivo'],tipoTecnica:'defensa',
  desc:'Defensa de Dinastía Galáctica en Inazuma Eleven GO Galaxy, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1107.webp'
},
{
  id:'r1108', equipo:'Fertilia', nombre:'Formiga', original:'Antwa Arley',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['Salto champiñón', 'Choque directo', 'Emboscada'],tipoTecnica:'regate',
  desc:'Centrocampista de Fertilia en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1108.webp'
},
{
  id:'r1109', equipo:'Fertilia', nombre:'Banda Crix', original:'Banda Koroegyu',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:76,defensa:61,especial:74,
  hissatsu:['Salto champiñón', 'Remate dragón', 'Bejuco Gigante'],tipoTecnica:'regate',
  desc:'Centrocampista de Fertilia en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1109.webp'
},
{
  id:'r1110', equipo:'Fertilia', nombre:'Banda Crix Junior', original:'Banda Koroegyu Jr.',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:69,pase:78,defensa:63,especial:72,
  hissatsu:['La niebla', 'Trance melódico', 'Bejuco Gigante'],tipoTecnica:'defensa',
  desc:'Centrocampista de Fertilia en Inazuma Eleven GO Galaxy, dorsal 21.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1110.webp'
},
{
  id:'r1111', equipo:'Fertilia', nombre:'Romborina Drohn', original:'Dron Naboon',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:64,defensa:76,especial:73,
  hissatsu:['Presa de zarcillo', 'Trampa vegetal', 'Emboscada'],tipoTecnica:'defensa',
  desc:'Defensa de Fertilia en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1111.webp'
},
{
  id:'r1112', equipo:'Fertilia', equiposExtra:['Falam Medius'], nombre:'Gandares Baran', original:'Gandares Baran',
  posicion:'Delantero', tipo:'Bosque',
  tiro:77,pase:61,defensa:36,especial:72,
  hissatsu:['Grito del edén', 'Corte de guadaña bajo', 'Lanza Letal'],tipoTecnica:'tiro',
  desc:'Delantero de Fertilia en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1112.webp'
},
{
  id:'r1113', equipo:'Fertilia', nombre:'Vespa', original:'Honet Harcha',
  posicion:'Delantero', tipo:'Viento',
  tiro:79,pase:63,defensa:48,especial:70,
  hissatsu:['Regate en Z', 'Trance melódico', 'Poder parkour'],tipoTecnica:'regate',
  desc:'Delantero de Fertilia en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1113.webp'
},
{
  id:'r1114', equipo:'Fertilia', nombre:'Caelif', original:'Hopper Bata',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['Salto champiñón', 'Presa de zarcillo', 'Bejuco Gigante'],tipoTecnica:'regate',
  desc:'Centrocampista de Fertilia en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1114.webp'
},
{
  id:'r1115', equipo:'Fertilia', nombre:'Elater Clicka', original:'Komecky Shoryou',
  posicion:'Delantero', tipo:'Bosque',
  tiro:76,pase:60,defensa:37,especial:71,
  hissatsu:['Rematerialización', 'Remate dragón', 'Ultra lunar'],tipoTecnica:'regate',
  desc:'Delantero de Fertilia en Inazuma Eleven GO Galaxy, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1115.webp'
},
{
  id:'r1116', equipo:'Fertilia', nombre:'Schisto', original:'Locus Inagus',
  posicion:'Delantero', tipo:'Bosque',
  tiro:77,pase:61,defensa:42,especial:72,
  hissatsu:['Espejismo de balón', 'Regate en Z', 'Lanza Letal'],tipoTecnica:'regate',
  desc:'Delantero de Fertilia en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1116.webp'
},
{
  id:'r1117', equipo:'Fertilia', nombre:'Ceram', original:'Longa Kamicula',
  posicion:'Portero', tipo:'Bosque',
  tiro:20,pase:50,defensa:72,especial:71,
  hissatsu:['Trampa vegetal', 'Presa de zarcillo', 'Centro de Gravedad'],tipoTecnica:'portero',
  desc:'Portero de Fertilia en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1117.webp'
},
{
  id:'r1118', equipo:'Fertilia', nombre:'Heterocera', original:'Moth Gar',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:64,defensa:76,especial:73,
  hissatsu:['Presa de zarcillo', 'Salto champiñón', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Defensa de Fertilia en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1118.webp'
},
{
  id:'r1119', equipo:'Fertilia', nombre:'Lepidoptera', original:'Putterf Chocho',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['Salto champiñón', 'Presa de zarcillo', 'Olor embriagador'],tipoTecnica:'regate',
  desc:'Centrocampista de Fertilia en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1119.webp'
},
{
  id:'r1120', equipo:'Fertilia', equiposExtra:['Falam Medius'], nombre:'Ruger Baran', original:'Ryugel Baran',
  posicion:'Delantero', tipo:'Bosque',
  tiro:76,pase:60,defensa:43,especial:71,
  hissatsu:['Grito del edén', 'Espejismo de balón', 'Tornado oscuro'],tipoTecnica:'tiro',
  desc:'Delantero de Fertilia en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1120.webp'
},
{
  id:'r1121', equipo:'Fertilia', nombre:'Lucan', original:'Stag Kuwatta',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:60,especial:76,
  hissatsu:['Salto champiñón', 'Presa de zarcillo', 'El ojo del huracán'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Fertilia en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1121.webp'
},
{
  id:'r1122', equipo:'Fertilia', nombre:'Theraphos Tranchla', original:'Tarran Tulakumo',
  posicion:'Delantero', tipo:'Montaña',
  tiro:76,pase:60,defensa:39,especial:71,
  hissatsu:['Copia y corta', 'Remate dragón', 'Aguijones escarlata'],tipoTecnica:'defensa',
  desc:'Delantero de Fertilia en Inazuma Eleven GO Galaxy, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1122.webp'
},
{
  id:'r1123', equipo:'Fertilia', nombre:'Mantodea', original:'Tis Khama',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Salto champiñón', 'Presa de zarcillo', 'Truco balonazo'],tipoTecnica:'regate',
  desc:'Centrocampista de Fertilia en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1123.webp'
},
{
  id:'r1124', equipo:'Magmavis', nombre:'Aoba Gyr', original:'Alvega Gordon',
  posicion:'Portero', tipo:'Fuego',
  tiro:33,pase:59,defensa:83,especial:78,
  hissatsu:['Cabezazo volcánico', 'Vuelo volcánico', 'Rayo de puño'],tipoTecnica:'portero',
  desc:'Portero y capitán de Magmavis en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1124.webp'
},
{
  id:'r1125', equipo:'Magmavis', nombre:'Cotopax', original:'Cotopak Gerigar',
  posicion:'Delantero', tipo:'Montaña',
  tiro:83,pase:67,defensa:45,especial:78,
  hissatsu:['Roca volcánica', 'Lecho de lava', 'Triángulo ZZ'],tipoTecnica:'tiro',
  desc:'Delantero de Magmavis en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1125.webp'
},
{
  id:'r1126', equipo:'Magmavis', nombre:'Etna', original:'Etuna Holk',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:74,pase:83,defensa:68,especial:77,
  hissatsu:['Lecho de lava', 'Roca volcánica', 'Vuelo volcánico'],tipoTecnica:'regate',
  desc:'Centrocampista de Magmavis en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1126.webp'
},
{
  id:'r1127', equipo:'Magmavis', nombre:'Mayon', original:'Mayon Creste',
  posicion:'Defensa', tipo:'Montaña',
  tiro:40,pase:69,defensa:81,especial:78,
  hissatsu:['Vuelo volcánico', 'Estela ígnea'],tipoTecnica:'defensa',
  desc:'Defensa de Magmavis en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1127.webp'
},
{
  id:'r1128', equipo:'Magmavis', nombre:'Merapil Sekretair', original:'Merapir Secreta',
  posicion:'Defensa', tipo:'Fuego',
  tiro:49,pase:68,defensa:80,especial:77,
  hissatsu:['Vuelo volcánico', 'Lecho de lava', 'Cabezazo volcánico'],tipoTecnica:'defensa',
  desc:'Defensa de Magmavis en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1128.webp'
},
{
  id:'r1129', equipo:'Magmavis', nombre:'Mistis', original:'Misti Oar',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:71,pase:80,defensa:65,especial:78,
  hissatsu:['Lecho de lava', 'Vuelo volcánico', 'Ataque de garza'],tipoTecnica:'regate',
  desc:'Centrocampista de Magmavis en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1129.webp'
},
{
  id:'r1130', equipo:'Magmavis', nombre:'Nevado', original:'Nevado Condarm',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Lecho de lava', 'Vuelo volcánico', 'Ataque de garza'],tipoTecnica:'regate',
  desc:'Centrocampista de Magmavis en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1130.webp'
},
{
  id:'r1131', equipo:'Magmavis', nombre:'Nyira', original:'Nyira Pheasun',
  posicion:'Delantero', tipo:'Montaña',
  tiro:84,pase:68,defensa:42,especial:75,
  hissatsu:['Roca volcánica', 'Lecho de lava', 'Tormenta Solar'],tipoTecnica:'tiro',
  desc:'Delantero de Magmavis en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1131.webp'
},
{
  id:'r1132', equipo:'Magmavis', nombre:'Proman', original:'Promo Shoebill',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Lecho de lava', 'Bolea ígnea', 'Salto explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Magmavis en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1132.webp'
},
{
  id:'r1133', equipo:'Magmavis', equiposExtra:['Falam Medius'], nombre:'Bala Gasgula', original:'Rodan Gasgus',
  posicion:'Delantero', tipo:'Fuego',
  tiro:81,pase:65,defensa:41,especial:76,
  hissatsu:['Relámpago volcánico', 'Estela ígnea', 'Llamarada infernal'],tipoTecnica:'tiro',
  desc:'Delantero de Magmavis en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1133.webp'
},
{
  id:'r1134', equipo:'Magmavis', nombre:'Tair', original:'Taal Parakee',
  posicion:'Delantero', tipo:'Montaña',
  tiro:82,pase:66,defensa:42,especial:77,
  hissatsu:['Roca volcánica', 'Vuelo volcánico', 'Ataque de garza'],tipoTecnica:'tiro',
  desc:'Delantero de Magmavis en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1134.webp'
},
{
  id:'r1135', equipo:'Magmavis', nombre:'Vesuvian', original:'Vesu Horne',
  posicion:'Delantero', tipo:'Fuego',
  tiro:85,pase:66,defensa:44,especial:80,
  hissatsu:['Roca volcánica', 'Cabezazo cohete', 'Aguijón Letal'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Magmavis en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1135.webp'
},
{
  id:'r1136', equipo:'Falam Medius', nombre:'Argon Bulgess', original:'Argo Burgess',
  posicion:'Portero', tipo:'Bosque',
  tiro:22,pase:56,defensa:90,especial:89,
  hissatsu:['Despeje virtual', 'Campo de fuerza defensivo', 'Recepción Negativa'],tipoTecnica:'portero',
  desc:'Portero y capitán de Falam Medius en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1136.webp'
},
{
  id:'r1137', equipo:'Falam Medius', equiposExtra:['Naiadi'], nombre:'Rondula Flehl', original:'Hilary Flail',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:80,pase:89,defensa:74,especial:87,
  hissatsu:['Bofetón látigo', 'Viento celestial'],tipoTecnica:'regate',
  desc:'Centrocampista de Falam Medius en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1137.webp'
},
{
  id:'r1138', equipo:'Falam Medius', nombre:'Neon', original:'Neol Lotz',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:82,pase:91,defensa:76,especial:85,
  hissatsu:['Defensa holográfica', 'Grumo pegapasta', 'Carrera a tres piernas'],tipoTecnica:'regate',
  desc:'Centrocampista de Falam Medius en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1138.webp'
},
{
  id:'r1139', equipo:'Falam Medius', nombre:'Radon Mons', original:'Radon Morm',
  posicion:'Defensa', tipo:'Fuego',
  tiro:45,pase:78,defensa:90,especial:83,
  hissatsu:['Robo sigiloso', 'Defensa holográfica', 'Estrella de roca'],tipoTecnica:'defensa',
  desc:'Defensa de Falam Medius en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1139.webp'
},
{
  id:'r1140', equipo:'Falam Medius', nombre:'Selenia', original:'Selen Melvil',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Defensa holográfica', 'Fiesta floral', 'Balón galgo'],tipoTecnica:'regate',
  desc:'Centrocampista de Falam Medius en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1140.webp'
},
{
  id:'r1141', equipo:'Falam Medius', nombre:'Brimstone', original:'Sulfer Berg',
  posicion:'Delantero', tipo:'Montaña',
  tiro:90,pase:74,defensa:40,especial:85,
  hissatsu:['Defensa holográfica', 'Caída planetaria', 'Espada de Odín'],tipoTecnica:'regate',
  desc:'Delantero de Falam Medius en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1141.webp'
},
{
  id:'r1142', equipo:'Falam Medius', nombre:'Xenon Reith', original:'Xeno Wolf',
  posicion:'Defensa', tipo:'Viento',
  tiro:40,pase:75,defensa:87,especial:84,
  hissatsu:['Robo sigiloso', 'Defensa holográfica', 'Corte Giratorio'],tipoTecnica:'defensa',
  desc:'Defensa de Falam Medius en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1142.webp'
},
{
  id:'r1143', equipo:'Flota Ixar', nombre:'Aegir Cepheid', original:'Aegir Cepheid',
  posicion:'Defensa', tipo:'Viento',
  tiro:52,pase:77,defensa:89,especial:86,
  hissatsu:['Rayo del juicio', 'Sincronía logística', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1143.webp'
},
{
  id:'r1144', equipo:'Flota Ixar', nombre:'Deimos Lepton', original:'Deimos Lepton',
  posicion:'Defensa', tipo:'Montaña',
  tiro:43,pase:76,defensa:88,especial:85,
  hissatsu:['Rayo del juicio', 'Ofensiva danzarina', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Defensa de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1144.webp'
},
{
  id:'r1145', equipo:'Flota Ixar', nombre:'Despina', original:'Despina Lax',
  posicion:'Delantero', tipo:'Montaña',
  tiro:92,pase:76,defensa:42,especial:83,
  hissatsu:['Amplificador mágico', 'Danza del viento', 'Remate Celestial'],tipoTecnica:'tiro',
  desc:'Delantero de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1145.webp'
},
{
  id:'r1146', equipo:'Flota Ixar', nombre:'Dione', original:'Dione Bulge',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:73,especial:86,
  hissatsu:['Arrancada', 'Estampida en línea', 'El ojo del huracán'],tipoTecnica:'regate',
  desc:'Centrocampista de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1146.webp'
},
{
  id:'r1147', equipo:'Flota Ixar', nombre:'Meteo Garnet', original:'Ishigashi Gorham',
  posicion:'Defensa', tipo:'Fuego',
  tiro:53,pase:76,defensa:88,especial:85,
  hissatsu:['Rayo del juicio', 'Trance melódico', 'Campo minado'],tipoTecnica:'defensa',
  desc:'Defensa de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1147.webp'
},
{
  id:'r1148', equipo:'Flota Ixar', nombre:'Loge Colles', original:'Loge Kolith',
  posicion:'Delantero', tipo:'Bosque',
  tiro:89,pase:73,defensa:37,especial:84,
  hissatsu:['Amplificador mágico', 'Salto explosivo', 'Carga Negativa'],tipoTecnica:'tiro',
  desc:'Delantero de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1148.webp'
},
{
  id:'r1149', equipo:'Flota Ixar', nombre:'Sinope Linea', original:'Sinope Rinoa',
  posicion:'Defensa', tipo:'Bosque',
  tiro:51,pase:78,defensa:90,especial:83,
  hissatsu:['Rayo del juicio', 'Paisaje helado', 'Acrobacia robótica'],tipoTecnica:'defensa',
  desc:'Defensa de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1149.webp'
},
{
  id:'r1150', equipo:'Flota Ixar', nombre:'Tarvos Boson', original:'Tarvos Boson',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Ofensiva danzarina', 'Cruce explosivo', 'Patín Aereo'],tipoTecnica:'defensa',
  desc:'Centrocampista de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1150.webp'
},
{
  id:'r1151', equipo:'Flota Ixar', nombre:'Ymir Catena', original:'Ymir Catena',
  posicion:'Defensa', tipo:'Viento',
  tiro:57,pase:78,defensa:90,especial:83,
  hissatsu:['Rayo del juicio', 'Barrena voladora', 'Caída Prehistórica'],tipoTecnica:'defensa',
  desc:'Defensa de Flota Ixar en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1151.webp'
},
{
  id:'r1152', equipo:'Silica', nombre:'A’tac', original:'Acker Tamal',
  posicion:'Delantero', tipo:'Montaña',
  tiro:93,pase:77,defensa:46,especial:84,
  hissatsu:['Misil arenoso', 'Excavación', 'Doble trallazo planetario'],tipoTecnica:'tiro',
  desc:'Delantero de Silica en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1152.webp'
},
{
  id:'r1153', equipo:'Silica', nombre:'B’adaen', original:'Badai Jaran',
  posicion:'Portero', tipo:'Montaña',
  tiro:33,pase:59,defensa:89,especial:84,
  hissatsu:['Puño de arena', 'Tuneladora', 'Barrera de Gaia'],tipoTecnica:'portero',
  desc:'Portero de Silica en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1153.webp'
},
{
  id:'r1154', equipo:'Silica', nombre:'A’ddah', original:'Duff Natter',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:77,defensa:89,especial:86,
  hissatsu:['Tuneladora', 'Puño de arena', 'Muralla de Atlantis'],tipoTecnica:'defensa',
  desc:'Defensa de Silica en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1154.webp'
},
{
  id:'r1155', equipo:'Silica', nombre:'K’al', original:'Gala Hariza',
  posicion:'Delantero', tipo:'Montaña',
  tiro:90,pase:74,defensa:37,especial:85,
  hissatsu:['Misil arenoso', 'Excavación', 'Remate del Tigre'],tipoTecnica:'tiro',
  desc:'Delantero de Silica en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1155.webp'
},
{
  id:'r1156', equipo:'Silica', nombre:'G’ob', original:'Gobila Mongo',
  posicion:'Defensa', tipo:'Fuego',
  tiro:40,pase:76,defensa:88,especial:85,
  hissatsu:['Tuneladora', 'Excavación', 'Salto explosivo'],tipoTecnica:'defensa',
  desc:'Defensa de Silica en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1156.webp'
},
{
  id:'r1157', equipo:'Silica', nombre:'K’aran Uogu', original:'Kazerma Worg',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:83,pase:92,defensa:74,especial:90,
  hissatsu:['Excavación', 'Misil arenoso', 'Caída planetaria'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Silica en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1157.webp'
},
{
  id:'r1158', equipo:'Silica', nombre:'N’ameeb', original:'Namiba Mib',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:76,defensa:88,especial:85,
  hissatsu:['Tuneladora', 'Excavación', 'Bola de Hojas'],tipoTecnica:'defensa',
  desc:'Defensa de Silica en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1158.webp'
},
{
  id:'r1159', equipo:'Silica', nombre:'R’adji', original:'Regi Stanin',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:78,defensa:90,especial:87,
  hissatsu:['Tuneladora', 'Misil arenoso', 'Excavación'],tipoTecnica:'defensa',
  desc:'Defensa de Silica en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1159.webp'
},
{
  id:'r1160', equipo:'Silica', nombre:'S’harqiyah', original:'Shar Qiyah',
  posicion:'Delantero', tipo:'Bosque',
  tiro:92,pase:76,defensa:43,especial:87,
  hissatsu:['Misil arenoso', 'Excavación', 'Tornado oscuro'],tipoTecnica:'tiro',
  desc:'Delantero de Silica en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1160.webp'
},
{
  id:'r1161', equipo:'Silica', nombre:'A’kra', original:'Takla Marker',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:77,defensa:89,especial:86,
  hissatsu:['Tuneladora', 'Mirada intimidante', 'Mirada amenazante'],tipoTecnica:'defensa',
  desc:'Defensa de Silica en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1161.webp'
},
{
  id:'r1162', equipo:'Silica', nombre:'S’haha', original:'Zaba Harler',
  posicion:'Delantero', tipo:'Fuego',
  tiro:92,pase:76,defensa:39,especial:87,
  hissatsu:['Misil arenoso', 'Excavación', 'Cabezazo gigatón'],tipoTecnica:'tiro',
  desc:'Delantero de Silica en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1162.webp'
},
{
  id:'r1163', equipo:'Naiadi', nombre:'Plip Batur', original:'Batur Dobo',
  posicion:'Delantero', tipo:'Montaña',
  tiro:92,pase:76,defensa:43,especial:87,
  hissatsu:['Tiro efervescente', 'Gran catarata', 'Aullido de lobo'],tipoTecnica:'tiro',
  desc:'Delantero de Naiadi en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1163.webp'
},
{
  id:'r1164', equipo:'Naiadi', nombre:'Puddel', original:'Capis Tamal',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Chorro rebotante', 'Tiro efervescente', 'Himno de atenea'],tipoTecnica:'regate',
  desc:'Centrocampista de Naiadi en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1164.webp'
},
{
  id:'r1165', equipo:'Naiadi', nombre:'Droplit', original:'Chuluka Potta',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Chorro rebotante', 'Tiro efervescente', 'Paisaje Helado'],tipoTecnica:'regate',
  desc:'Centrocampista de Naiadi en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1165.webp'
},
{
  id:'r1166', equipo:'Naiadi', nombre:'Sog', original:'Galila Zabu',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:78,defensa:90,especial:87,
  hissatsu:['Gran catarata', 'Barrena voladora', 'Dardo Acuático'],tipoTecnica:'defensa',
  desc:'Defensa de Naiadi en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1166.webp'
},
{
  id:'r1167', equipo:'Naiadi', nombre:'Squalcha', original:'Ness Biicha',
  posicion:'Defensa', tipo:'Bosque',
  tiro:47,pase:77,defensa:89,especial:86,
  hissatsu:['Gran catarata', 'Paisaje helado', 'Sincronía logística'],tipoTecnica:'defensa',
  desc:'Defensa de Naiadi en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1167.webp'
},
{
  id:'r1168', equipo:'Naiadi', nombre:'Plink Powai', original:'Powai Pichori',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:83,pase:92,defensa:74,especial:90,
  hissatsu:['Chorro rebotante', 'Gran catarata', 'Bofetón látigo'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Naiadi en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1168.webp'
},
{
  id:'r1169', equipo:'Naiadi', nombre:'Sploosh Saroma', original:'Sarama Sarasa',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Chorro rebotante', 'Tiro efervescente', 'Golpe de vacío'],tipoTecnica:'regate',
  desc:'Centrocampista de Naiadi en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1169.webp'
},
{
  id:'r1170', equipo:'Naiadi', nombre:'Serban', original:'Sevan Basha',
  posicion:'Delantero', tipo:'Viento',
  tiro:92,pase:76,defensa:35,especial:87,
  hissatsu:['Tiro efervescente', 'Chorro rebotante', 'Leopardo de la ventisca'],tipoTecnica:'tiro',
  desc:'Delantero de Naiadi en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1170.webp'
},
{
  id:'r1171', equipo:'Naiadi', nombre:'Tinkel Urmia', original:'Urmi Chapupu',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Chorro rebotante', 'Gran catarata', 'Tiro efervescente'],tipoTecnica:'regate',
  desc:'Centrocampista de Naiadi en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1171.webp'
},
{
  id:'r1172', equipo:'Naiadi', nombre:'Plunk', original:'Valha Poropo',
  posicion:'Delantero', tipo:'Bosque',
  tiro:93,pase:77,defensa:46,especial:84,
  hissatsu:['Tiro efervescente', 'Patín Aereo', 'Contra'],tipoTecnica:'tiro',
  desc:'Delantero de Naiadi en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1172.webp'
},
{
  id:'r1173', equipo:'Naiadi', nombre:'Van Tarel', original:'Van Tareru',
  posicion:'Portero', tipo:'Bosque',
  tiro:36,pase:50,defensa:86,especial:85,
  hissatsu:['Gran catarata', 'Zarpazo poderoso', 'Dardo Acuático'],tipoTecnica:'portero',
  desc:'Portero de Naiadi en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1173.webp'
},
{
  id:'r1174', equipo:'Big Waves GO', nombre:'Amanda Ray', original:'Amanda Turner',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Patada canguro', 'Olor embriagador', 'Pasos aéreos'],tipoTecnica:'regate',
  desc:'Centrocampista de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1174.webp'
},
{
  id:'r1175', equipo:'Big Waves GO', nombre:'Clem Chowdry', original:'Clam Childs',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:70,defensa:82,especial:79,
  hissatsu:['Gran torbellino', 'Visto y no visto', 'Golpe de Samba'],tipoTecnica:'defensa',
  desc:'Defensa de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1175.webp'
},
{
  id:'r1176', equipo:'Big Waves GO', nombre:'Cole', original:'Cole LaRuze',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:68,especial:84,
  hissatsu:['Patada canguro', 'Zig Zag Explosivo', 'Ícaro'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1176.webp'
},
{
  id:'r1177', equipo:'Big Waves GO', nombre:'Whaly Walker', original:'Hall Ales',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:68,defensa:80,especial:77,
  hissatsu:['Gran torbellino', 'Puños certeros', 'Mina terrestre'],tipoTecnica:'defensa',
  desc:'Defensa de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1177.webp'
},
{
  id:'r1178', equipo:'Big Waves GO', nombre:'Sunny Fishton', original:'Herman Beaumont',
  posicion:'Defensa', tipo:'Viento',
  tiro:56,pase:70,defensa:82,especial:79,
  hissatsu:['Gran torbellino', 'Entrada huracán', 'Patín Aereo'],tipoTecnica:'defensa',
  desc:'Defensa de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1178.webp'
},
{
  id:'r1179', equipo:'Big Waves GO', nombre:'Jude Gordon', original:'Jude Gordon',
  posicion:'Portero', tipo:'Viento',
  tiro:29,pase:59,defensa:81,especial:76,
  hissatsu:['Campo de fuerza defensivo', 'Ancla de navío', 'Colmillo de Cocodrilo'],tipoTecnica:'portero',
  desc:'Portero de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1179.webp'
},
{
  id:'r1180', equipo:'Big Waves GO', nombre:'Marsha Ark', original:'Marsha Ark',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Patada canguro', 'Telaraña', 'Trance melódico'],tipoTecnica:'regate',
  desc:'Centrocampista de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1180.webp'
},
{
  id:'r1181', equipo:'Big Waves GO', nombre:'Octa', original:'Octa Persun',
  posicion:'Delantero', tipo:'Viento',
  tiro:84,pase:68,defensa:43,especial:79,
  hissatsu:['Peces voladores', 'Gran tifón', 'Flecha Divina'],tipoTecnica:'tiro',
  desc:'Delantero de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1181.webp'
},
{
  id:'r1182', equipo:'Big Waves GO', nombre:'Owe Noyster', original:'Owen Easter',
  posicion:'Defensa', tipo:'Fuego',
  tiro:57,pase:71,defensa:83,especial:76,
  hissatsu:['Gran torbellino', 'La niebla', 'Presa de sombras'],tipoTecnica:'defensa',
  desc:'Defensa de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1182.webp'
},
{
  id:'r1183', equipo:'Big Waves GO', nombre:'Lob Stark', original:'Rob Stark',
  posicion:'Delantero', tipo:'Montaña',
  tiro:84,pase:68,defensa:47,especial:79,
  hissatsu:['Tiro pirueta', 'Aguijón Letal', 'Engranajes aceleradores'],tipoTecnica:'tiro',
  desc:'Delantero de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1183.webp'
},
{
  id:'r1184', equipo:'Big Waves GO', nombre:'Oscar Squidows', original:'Skwid White',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Patada canguro', 'Gran Torbellino', 'Himno de atenea'],tipoTecnica:'regate',
  desc:'Centrocampista de Big Waves GO en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1184.webp'
},
{
  id:'r1185', equipo:'Dragones de Fuego GO', nombre:'Noh-Bae', original:'Bae Jeong-ho',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:74,defensa:86,especial:79,
  hissatsu:['Estela ígnea', 'Barrido defensivo', 'Piroquinesis'],tipoTecnica:'defensa',
  desc:'Defensa de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1185.webp'
},
{
  id:'r1186', equipo:'Dragones de Fuego GO', nombre:'Hwang', original:'Byeon Min-seo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Bolea ígnea', 'Pompa de chicle', 'Chicle burbuja'],tipoTecnica:'regate',
  desc:'Centrocampista de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1186.webp'
},
{
  id:'r1187', equipo:'Dragones de Fuego GO', nombre:'Shinjae Choi', original:'Choi Shin-jae',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:71,defensa:83,especial:80,
  hissatsu:['Estela ígnea', 'A todo vapor', 'Juego de pies'],tipoTecnica:'defensa',
  desc:'Defensa de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1187.webp'
},
{
  id:'r1188', equipo:'Dragones de Fuego GO', nombre:'Joo-Won', original:'Hwang Joon-ho',
  posicion:'Delantero', tipo:'Viento',
  tiro:86,pase:70,defensa:44,especial:81,
  hissatsu:['Fuego rápido', 'Tiro sónico', 'Bomba saltarina'],tipoTecnica:'tiro',
  desc:'Delantero de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1188.webp'
},
{
  id:'r1189', equipo:'Dragones de Fuego GO', nombre:'Jun-Yeong Lee', original:'Lee Choon-yoon',
  posicion:'Delantero', tipo:'Bosque',
  tiro:91,pase:72,defensa:48,especial:82,
  hissatsu:['Fuego rápido', 'Rodillazos atómicos', 'Tornado oscuro'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1189.webp'
},
{
  id:'r1190', equipo:'Dragones de Fuego GO', nombre:'Do-Hyeon Nam', original:'Nam Do-hyeon',
  posicion:'Portero', tipo:'Fuego',
  tiro:27,pase:53,defensa:82,especial:81,
  hissatsu:['Rechace de fuego', 'Despeje explosivo', 'Corte de arena'],tipoTecnica:'portero',
  desc:'Portero de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1190.webp'
},
{
  id:'r1191', equipo:'Dragones de Fuego GO', nombre:'Yongjin Seo', original:'Seo Young-jin',
  posicion:'Defensa', tipo:'Fuego',
  tiro:47,pase:72,defensa:84,especial:81,
  hissatsu:['Estela ígnea', 'Pinzas cortantes', 'A todo vapor'],tipoTecnica:'defensa',
  desc:'Defensa de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1191.webp'
},
{
  id:'r1192', equipo:'Dragones de Fuego GO', nombre:'Soyeon Sim', original:'Shim Seo-yeon',
  posicion:'Delantero', tipo:'Montaña',
  tiro:87,pase:71,defensa:47,especial:82,
  hissatsu:['Fuego rápido', 'Bomba saltarina', 'Lecho de Rosas'],tipoTecnica:'tiro',
  desc:'Delantero de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1192.webp'
},
{
  id:'r1193', equipo:'Dragones de Fuego GO', nombre:'Ujin Shin', original:'Shin Woo-jin',
  posicion:'Defensa', tipo:'Fuego',
  tiro:41,pase:72,defensa:84,especial:81,
  hissatsu:['Estela ígnea', 'Bolea ígnea', 'Piroquinesis'],tipoTecnica:'defensa',
  desc:'Defensa de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1193.webp'
},
{
  id:'r1194', equipo:'Dragones de Fuego GO', nombre:'Jihun Song', original:'Sung Ji-hoon',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Bolea ígnea', 'Estela ígnea', 'Fuego rápido'],tipoTecnica:'regate',
  desc:'Centrocampista de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1194.webp'
},
{
  id:'r1195', equipo:'Dragones de Fuego GO', nombre:'Gunwoo Yang', original:'Yang Gun-woo',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Bolea ígnea', 'Rodillazos atómicos', 'Salto explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Dragones de Fuego GO en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1195.webp'
},
{
  id:'r1196', equipo:'Tigres Muay', nombre:'Bak', original:'Bark Sepakraw',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:71,pase:80,defensa:65,especial:78,
  hissatsu:['Corte de guadaña bajo', 'Tiro elefante', 'Tiro pirueta'],tipoTecnica:'regate',
  desc:'Centrocampista de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1196.webp'
},
{
  id:'r1197', equipo:'Tigres Muay', nombre:'Kaolan', original:'Kaolan Sagot',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Corte de guadaña bajo', 'Tiro elefante', 'Mirada amenazante'],tipoTecnica:'regate',
  desc:'Centrocampista de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1197.webp'
},
{
  id:'r1198', equipo:'Tigres Muay', nombre:'Mei', original:'Mei Chapati',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Corte de guadaña bajo', 'Visto y no visto', 'Olor embriagador'],tipoTecnica:'regate',
  desc:'Centrocampista de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1198.webp'
},
{
  id:'r1199', equipo:'Tigres Muay', nombre:'Naid Sirisukha', original:'Nadech Sirilak',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:69,defensa:81,especial:78,
  hissatsu:['Siega central', 'Corte de guadaña bajo', 'Mina terrestre'],tipoTecnica:'defensa',
  desc:'Defensa de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1199.webp'
},
{
  id:'r1200', equipo:'Tigres Muay', nombre:'Napa', original:'Napa Radam',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:70,defensa:85,especial:78,
  hissatsu:['Siega central', 'Truco balonazo', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Defensa y capitán de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1200.webp'
},
{
  id:'r1201', equipo:'Tigres Muay', nombre:'Nawarat', original:'Nawat Lam',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Corte de guadaña bajo', 'Siega central', 'Tiro elefante'],tipoTecnica:'regate',
  desc:'Centrocampista de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1201.webp'
},
{
  id:'r1202', equipo:'Tigres Muay', nombre:'Sulada', original:'Sarana Kukri',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:71,pase:80,defensa:65,especial:78,
  hissatsu:['Corte de guadaña bajo', 'Pompa de chicle', 'Salto incandescente'],tipoTecnica:'regate',
  desc:'Centrocampista de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1202.webp'
},
{
  id:'r1203', equipo:'Tigres Muay', nombre:'Suchart', original:'Sarit Charat',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Corte de guadaña bajo', 'Siega central', 'Bomba saltarina'],tipoTecnica:'regate',
  desc:'Centrocampista de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1203.webp'
},
{
  id:'r1204', equipo:'Tigres Muay', nombre:'Thanakorn Jaa', original:'Thamgan Jaa',
  posicion:'Delantero', tipo:'Bosque',
  tiro:83,pase:67,defensa:47,especial:78,
  hissatsu:['Tiro elefante', 'Corte de guadaña bajo', 'Remate del Tigre'],tipoTecnica:'tiro',
  desc:'Delantero de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1204.webp'
},
{
  id:'r1205', equipo:'Tigres Muay', nombre:'Udom', original:'Udom Keawchay',
  posicion:'Portero', tipo:'Viento',
  tiro:24,pase:50,defensa:77,especial:76,
  hissatsu:['Parada de codo', 'Puños certeros', 'Muralla Gigante'],tipoTecnica:'portero',
  desc:'Portero de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1205.webp'
},
{
  id:'r1206', equipo:'Tigres Muay', nombre:'Yuth Poonlarp', original:'Yam Poapan',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:69,defensa:81,especial:78,
  hissatsu:['Siega central', 'Parada de codo', 'Piroquinesis'],tipoTecnica:'defensa',
  desc:'Defensa de Tigres Muay en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1206.webp'
},
{
  id:'r1207', equipo:'Lobos Tormenta', nombre:'Aaron', original:'Aaron Gachinski',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Ruta de la seda', 'La fiebre del oro', 'Bateo total'],tipoTecnica:'regate',
  desc:'Centrocampista de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1207.webp'
},
{
  id:'r1208', equipo:'Lobos Tormenta', nombre:'Aleksei Karimov', original:'Alexei Karnov',
  posicion:'Portero', tipo:'Bosque',
  tiro:39,pase:53,defensa:81,especial:80,
  hissatsu:['Despeje retorcido', 'Estrella reflectante', 'Parada de Capoeira'],tipoTecnica:'portero',
  desc:'Portero de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1208.webp'
},
{
  id:'r1209', equipo:'Lobos Tormenta', nombre:'Dilshod', original:'Dmitri Sobirov',
  posicion:'Delantero', tipo:'Montaña',
  tiro:90,pase:71,defensa:38,especial:81,
  hissatsu:['La fiebre del oro', 'Ruta de la seda', 'Golpe Cataclismo'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1209.webp'
},
{
  id:'r1210', equipo:'Lobos Tormenta', nombre:'Kenja Jo’rayev', original:'Gennady Golibav',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:72,defensa:84,especial:81,
  hissatsu:['Defensa radial', 'Carga de elefantes', 'Mina terrestre'],tipoTecnica:'defensa',
  desc:'Defensa de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1210.webp'
},
{
  id:'r1211', equipo:'Lobos Tormenta', nombre:'Maksim Alimatov', original:'Maksim Adrov',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:70,defensa:47,especial:81,
  hissatsu:['La fiebre del oro', 'Cabezazo catapulta', 'Lluvia de azufre'],tipoTecnica:'tiro',
  desc:'Delantero de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1211.webp'
},
{
  id:'r1212', equipo:'Lobos Tormenta', nombre:'Mirjalor Afonin', original:'Mitya Eremin',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:72,defensa:84,especial:81,
  hissatsu:['Defensa radial', 'Tiro pirueta', 'Lanza de odín'],tipoTecnica:'defensa',
  desc:'Defensa de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1212.webp'
},
{
  id:'r1213', equipo:'Lobos Tormenta', nombre:'Leonid Mirzayev', original:'Rolan Lazarev',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:75,pase:84,defensa:69,especial:82,
  hissatsu:['Ruta de la seda', 'Picadora', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1213.webp'
},
{
  id:'r1214', equipo:'Lobos Tormenta', nombre:'Rustan', original:'Ruslan Kasimov',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Ruta de la seda', 'Defensa radial', 'La fiebre del oro'],tipoTecnica:'regate',
  desc:'Centrocampista de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1214.webp'
},
{
  id:'r1215', equipo:'Lobos Tormenta', nombre:'Server', original:'Sergei Chernov',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:72,defensa:84,especial:81,
  hissatsu:['Defensa radial', 'Despeje retorcido', 'Corte Giratorio'],tipoTecnica:'defensa',
  desc:'Defensa de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1215.webp'
},
{
  id:'r1216', equipo:'Lobos Tormenta', nombre:'Yuri', original:'Yuri Averin',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:70,defensa:82,especial:79,
  hissatsu:['Defensa radial', 'Ruta de la seda', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Defensa de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1216.webp'
},
{
  id:'r1217', equipo:'Lobos Tormenta', nombre:'Zafar', original:'Zaur Melev',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:71,defensa:36,especial:78,
  hissatsu:['La fiebre del oro', 'Tiro sónico', 'Cañon de Meteoritos'],tipoTecnica:'tiro',
  desc:'Delantero de Lobos Tormenta en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1217.webp'
},
{
  id:'r1218', equipo:'Shamshir', nombre:'Asad Gheisari', original:'Assad Gais',
  posicion:'Defensa', tipo:'Fuego',
  tiro:44,pase:71,defensa:83,especial:80,
  hissatsu:['Tormenta de arena', 'Ofensiva danzarina', 'Golpe Abrasador'],tipoTecnica:'defensa',
  desc:'Defensa de Shamshir en Inazuma Eleven GO Galaxy, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1218.webp'
},
{
  id:'r1219', equipo:'Shamshir', nombre:'Batal', original:'Batal Majid',
  posicion:'Defensa', tipo:'Montaña',
  tiro:41,pase:74,defensa:86,especial:79,
  hissatsu:['Tormenta de arena', 'Deriva desértica', 'Picadora'],tipoTecnica:'defensa',
  desc:'Defensa de Shamshir en Inazuma Eleven GO Galaxy, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1219.webp'
},
{
  id:'r1220', equipo:'Shamshir', nombre:'Qamar Sadir', original:'Kamil Sadid',
  posicion:'Defensa', tipo:'Bosque',
  tiro:41,pase:72,defensa:84,especial:81,
  hissatsu:['Tormenta de arena', 'Campo torbellino', 'Visto y no visto'],tipoTecnica:'defensa',
  desc:'Defensa de Shamshir en Inazuma Eleven GO Galaxy, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1220.webp'
},
{
  id:'r1221', equipo:'Shamshir', nombre:'Khalil Haddaoui', original:'Khalil Utbah',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:72,especial:81,
  hissatsu:['Deriva desértica', 'Balón de petróleo', 'Pinzas cortantes'],tipoTecnica:'regate',
  desc:'Centrocampista de Shamshir en Inazuma Eleven GO Galaxy, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1221.webp'
},
{
  id:'r1222', equipo:'Shamshir', nombre:'Nazim', original:'Nazim Nizar',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Deriva desértica', 'Tormenta de arena', 'Balón de petróleo'],tipoTecnica:'regate',
  desc:'Centrocampista de Shamshir en Inazuma Eleven GO Galaxy, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1222.webp'
},
{
  id:'r1223', equipo:'Shamshir', nombre:'Qasim Batal', original:'Qasim Badr',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:71,defensa:41,especial:82,
  hissatsu:['Balón de petróleo', 'Arrancada', 'Poder parkour'],tipoTecnica:'tiro',
  desc:'Delantero de Shamshir en Inazuma Eleven GO Galaxy, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1223.webp'
},
{
  id:'r1224', equipo:'Shamshir', nombre:'Rashid', original:'Rashid Hakim',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:72,especial:81,
  hissatsu:['Deriva desértica', 'Balón de petróleo', 'Tiro Balista'],tipoTecnica:'regate',
  desc:'Centrocampista de Shamshir en Inazuma Eleven GO Galaxy, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1224.webp'
},
{
  id:'r1225', equipo:'Shamshir', nombre:'Said', original:'Said Ashraf',
  posicion:'Delantero', tipo:'Montaña',
  tiro:88,pase:69,defensa:35,especial:83,
  hissatsu:['Balón de petróleo', 'Salto explosivo', 'Aguijones escarlata'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Shamshir en Inazuma Eleven GO Galaxy, dorsal 10.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1225.webp'
},
{
  id:'r1226', equipo:'Shamshir', nombre:'Shakir Zahir', original:'Shakir Zahar',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:73,defensa:85,especial:82,
  hissatsu:['Tormenta de arena', 'Barrido defensivo', 'Niebla Mística'],tipoTecnica:'defensa',
  desc:'Defensa de Shamshir en Inazuma Eleven GO Galaxy, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1226.webp'
},
{
  id:'r1227', equipo:'Shamshir', nombre:'Sultan', original:'Sultan Karam',
  posicion:'Portero', tipo:'Fuego',
  tiro:23,pase:53,defensa:82,especial:81,
  hissatsu:['Aplastamiento', 'Muralla Gigante', 'Golpe Abrasador'],tipoTecnica:'portero',
  desc:'Portero de Shamshir en Inazuma Eleven GO Galaxy, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1227.webp'
},
{
  id:'r1228', equipo:'Shamshir', nombre:'Tamir', original:'Tamir Nasr',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:78,pase:87,defensa:72,especial:81,
  hissatsu:['Deriva desértica', 'Coletazo de dragón', 'Red de caza'],tipoTecnica:'regate',
  desc:'Centrocampista de Shamshir en Inazuma Eleven GO Galaxy, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1228.webp'
},
// Equipos de Inazuma Eleven Ares y Orion, datos de la wiki de Inazuma Eleven
{
  id:'r1229', equipo:'Barcelona Orb', nombre:'Augusto Gomez', original:'Agapito Goméz',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:63,especial:72,
  hissatsu:['Engaño torero', 'Tirachinas', 'Explosión confusa'],tipoTecnica:'regate',
  desc:'Centrocampista de Barcelona Orb en Inazuma Eleven Ares, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1229.webp'
},
{
  id:'r1230', equipo:'Barcelona Orb', equiposExtra:['Los Invencibles'], nombre:'Salvador Castell', original:'Alonso Fibiano',
  posicion:'Portero', tipo:'Montaña',
  tiro:38,pase:56,defensa:74,especial:73,
  hissatsu:['Parada fuerte', 'Muralla Gigante', 'Mano Omega'],tipoTecnica:'portero',
  desc:'Portero de Barcelona Orb en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1230.webp'
},
{
  id:'r1231', equipo:'Barcelona Orb', equiposExtra:['Los Invencibles'], nombre:'Joan Asensi', original:'Bergamo Regult',
  posicion:'Delantero', tipo:'Fuego',
  tiro:78,pase:62,defensa:47,especial:73,
  hissatsu:['Descenso estelar', 'Entrada de llamas', 'Llamarada infernal'],tipoTecnica:'tiro',
  desc:'Delantero de Barcelona Orb en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1231.webp'
},
{
  id:'r1232', equipo:'Barcelona Orb', equiposExtra:['Artemisa de Mr.YI', 'Los Invencibles'], nombre:'Sergi Hernández', original:'Clario Orvan',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:60,especial:76,
  hissatsu:['Engaño torero'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Barcelona Orb en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1232.webp'
},
{
  id:'r1233', equipo:'Barcelona Orb', nombre:'Carles Ripoll', original:'Daniel Madrone',
  posicion:'Defensa', tipo:'Viento',
  tiro:57,pase:63,defensa:75,especial:72,
  hissatsu:['Amago de tiro', 'Tormenta de Arena', 'Balón yo-yo'],tipoTecnica:'defensa',
  desc:'Defensa de Barcelona Orb en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1233.webp'
},
{
  id:'r1234', equipo:'Barcelona Orb', nombre:'Ronaldo Ramallets', original:'Donnell Gotti',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:67,pase:76,defensa:61,especial:74,
  hissatsu:['Patada canguro', 'Tormenta de Arena', 'Entrada rodante'],tipoTecnica:'regate',
  desc:'Centrocampista de Barcelona Orb en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1234.webp'
},
{
  id:'r1235', equipo:'Barcelona Orb', nombre:'Jordi Belloch', original:'Federico Dazzlo',
  posicion:'Defensa', tipo:'Bosque',
  tiro:41,pase:65,defensa:77,especial:70,
  hissatsu:['Jaula de piedra', 'Subida a los cielos', 'Balón yo-yo'],tipoTecnica:'defensa',
  desc:'Defensa de Barcelona Orb en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1235.webp'
},
{
  id:'r1236', equipo:'Barcelona Orb', nombre:'Geraldo Enrique', original:'Gerard Enrique',
  posicion:'Delantero', tipo:'Fuego',
  tiro:76,pase:60,defensa:37,especial:71,
  hissatsu:['Engaño torero', 'Tirachinas', 'Bomba saltarina'],tipoTecnica:'regate',
  desc:'Delantero de Barcelona Orb en Inazuma Eleven Ares, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1236.webp'
},
{
  id:'r1237', equipo:'Barcelona Orb', nombre:'Gerard Carbonell', original:'Gregorio Jaballo',
  posicion:'Defensa', tipo:'Bosque',
  tiro:41,pase:63,defensa:75,especial:72,
  hissatsu:['Amago de tiro', 'Dientes de roca', 'Balón yo-yo'],tipoTecnica:'defensa',
  desc:'Defensa de Barcelona Orb en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1237.webp'
},
{
  id:'r1238', equipo:'Barcelona Orb', equiposExtra:['Los Invencibles'], nombre:'Leo Segarra', original:'Luther Fandam',
  posicion:'Delantero', tipo:'Fuego',
  tiro:77,pase:61,defensa:40,especial:72,
  hissatsu:['Cañón de meteoritos', 'Escáner Ataque'],tipoTecnica:'tiro',
  desc:'Delantero de Barcelona Orb en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1238.webp'
},
{
  id:'r1239', equipo:'Barcelona Orb', nombre:'Antoni Valls', original:'Oscar Agito',
  posicion:'Defensa', tipo:'Viento',
  tiro:44,pase:64,defensa:76,especial:73,
  hissatsu:['Jaula de piedra', 'Patín Aereo', 'Cúpula Sónica'],tipoTecnica:'defensa',
  desc:'Defensa de Barcelona Orb en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1239.webp'
},
{
  id:'r1240', equipo:'Barcelona Orb', nombre:'Josep Anglesola', original:'Rubérn Boigk',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Patada canguro', 'Entrada rodante'],tipoTecnica:'regate',
  desc:'Centrocampista de Barcelona Orb en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1240.webp'
},
{
  id:'r1241', equipo:'Barcelona Orb', nombre:'Xavi Casals', original:'Trancy Cornet',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Subida a los cielos', 'Ultra lunar', 'Llamarada infernal'],tipoTecnica:'regate',
  desc:'Centrocampista de Barcelona Orb en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1241.webp'
},
{
  id:'r1242', equipo:'Colina Verde', nombre:'Queintas Quillmere', original:'Abu Bunsaku',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:58,defensa:70,especial:67,
  hissatsu:['Agujero de gusano', 'Niebla Mística', 'Corte Diabólico'],tipoTecnica:'defensa',
  desc:'Defensa de Colina Verde en Inazuma Eleven Ares, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1242.webp'
},
{
  id:'r1243', equipo:'Colina Verde', nombre:'Wryn Twincrest', original:'Futakado Nirou',
  posicion:'Portero', tipo:'Montaña',
  tiro:30,pase:56,defensa:69,especial:68,
  hissatsu:['Remate tarzán', 'Romance de los Tres Reinos', 'Puño de Furia'],tipoTecnica:'portero',
  desc:'Portero de Colina Verde en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1243.webp'
},
{
  id:'r1244', equipo:'Colina Verde', nombre:'Galad Worden', original:'Gen Goroumaru',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['Cruz del sur', 'Campo de fuerza', 'Segadora'],tipoTecnica:'defensa',
  desc:'Centrocampista de Colina Verde en Inazuma Eleven Ares, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1244.webp'
},
{
  id:'r1245', equipo:'Colina Verde', nombre:'Plumian Whitlock', original:'Haneari Akiho',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['Remolino acuático', 'Caída torbellino', 'Entrada Tormenta'],tipoTecnica:'tiro',
  desc:'Centrocampista de Colina Verde en Inazuma Eleven Ares, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1245.webp'
},
{
  id:'r1246', equipo:'Colina Verde', nombre:'Merrick Seawell', original:'Hanmi Youta',
  posicion:'Delantero', tipo:'Fuego',
  tiro:74,pase:58,defensa:36,especial:65,
  hissatsu:['Fortaleza nocturna', 'Granada doble', 'Tornado de Fuego'],tipoTecnica:'tiro',
  desc:'Delantero de Colina Verde en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1246.webp'
},
{
  id:'r1247', equipo:'Colina Verde', nombre:'Aurel Ashdown', original:'Higurashi Yuuhi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:61,pase:70,defensa:55,especial:68,
  hissatsu:['Carrera relámpago', 'Ícaro', 'Granada doble'],tipoTecnica:'tiro',
  desc:'Centrocampista de Colina Verde en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1247.webp'
},
{
  id:'r1248', equipo:'Colina Verde', nombre:'Griffit Valiance', original:'Ikkaku Ooji',
  posicion:'Delantero', tipo:'Viento',
  tiro:74,pase:58,defensa:44,especial:65,
  hissatsu:['Ataque de cóndor', 'Aikido', 'Ventisca eterna'],tipoTecnica:'regate',
  desc:'Delantero de Colina Verde en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1248.webp'
},
{
  id:'r1249', equipo:'Colina Verde', nombre:'Corin Cainver', original:'Kama Touya',
  posicion:'Delantero', tipo:'Fuego',
  tiro:71,pase:55,defensa:47,especial:66,
  hissatsu:['Chut granada', 'Bateo total', 'Pájaro de fuego'],tipoTecnica:'defensa',
  desc:'Delantero de Colina Verde en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1249.webp'
},
{
  id:'r1250', equipo:'Colina Verde', nombre:'Sylvar Verdis', original:'Kanafumi Rokuri',
  posicion:'Defensa', tipo:'Bosque',
  tiro:54,pase:59,defensa:71,especial:68,
  hissatsu:['Gravedad', 'Corte Diabólico', 'Ataque de las sombras'],tipoTecnica:'regate',
  desc:'Defensa de Colina Verde en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1250.webp'
},
{
  id:'r1251', equipo:'Colina Verde', nombre:'Therion Daywick', original:'Kooro Norihiko',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:60,defensa:72,especial:65,
  hissatsu:['Gravitación', 'Acrobacia robótica', 'La montaña'],tipoTecnica:'regate',
  desc:'Defensa de Colina Verde en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1251.webp'
},
{
  id:'r1252', equipo:'Colina Verde', nombre:'Tarvon Runnel', original:'Mimizuki Kojirou',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['Giro bobina', 'Hora Celestial', 'Entrada Tormenta'],tipoTecnica:'regate',
  desc:'Centrocampista de Colina Verde en Inazuma Eleven Ares, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1252.webp'
},
{
  id:'r1253', equipo:'Colina Verde', nombre:'Aveline Morrin', original:'Miyama Ageha',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:61,pase:70,defensa:55,especial:68,
  hissatsu:['Bloque de Hielo', 'Hora Celestial', 'Entrada Tormenta'],tipoTecnica:'regate',
  desc:'Centrocampista de Colina Verde en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1253.webp'
},
{
  id:'r1254', equipo:'Colina Verde', nombre:'Corwin Lumen', original:'Tamamushi Mitsuki',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['Bola falsa', 'Himno de atenea', 'Engaño Torero'],tipoTecnica:'regate',
  desc:'Centrocampista de Colina Verde en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1254.webp'
},
{
  id:'r1255', equipo:'Colina Verde', nombre:'Orphion Ordain', original:'Tendou Nanase',
  posicion:'Defensa', tipo:'Bosque',
  tiro:49,pase:58,defensa:70,especial:67,
  hissatsu:['Zona Sigma', 'Corte Diabólico', 'Bloqueo Doble'],tipoTecnica:'portero',
  desc:'Defensa de Colina Verde en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1255.webp'
},
{
  id:'r1256', equipo:'Colina Verde', nombre:'Garvin Cliffmarch', original:'Tonobata Gakuto',
  posicion:'Defensa', tipo:'Bosque',
  tiro:53,pase:58,defensa:73,especial:70,
  hissatsu:['Remate dragón', 'Corte Diabólico', 'Ataque de las sombras'],tipoTecnica:'defensa',
  desc:'Defensa y capitán de Colina Verde en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1256.webp'
},
{
  id:'r1257', equipo:'Colina Verde', nombre:'Alaric Durnham', original:'Yasude Nagafumi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:64,pase:73,defensa:58,especial:67,
  hissatsu:['Ritmo agresivo', 'Ícaro', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Centrocampista de Colina Verde en Inazuma Eleven Ares, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1257.webp'
},
{
  id:'r1258', equipo:'Instituto Plenilunio', nombre:'Fedrin Fennley', original:'Fujiyabu Shigesato',
  posicion:'Defensa', tipo:'Viento',
  tiro:54,pase:47,defensa:59,especial:56,
  hissatsu:['Regate espejismo', 'Zona Sigma', 'Gravedad'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 25.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1258.webp'
},
{
  id:'r1259', equipo:'Instituto Plenilunio', nombre:'Bud Bloome', original:'Hanasaki Taizen',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:48,defensa:60,especial:57,
  hissatsu:['Corte giratorio', 'Pasos aéreos', 'Segadora'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1259.webp'
},
{
  id:'r1260', equipo:'Instituto Plenilunio', nombre:'Leif Bolt', original:'Haoto Ichiya',
  posicion:'Delantero', tipo:'Fuego',
  tiro:63,pase:47,defensa:39,especial:58,
  hissatsu:['Tornado de fuego', 'Avance flamígero', 'Entrada de llamas'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1260.webp'
},
{
  id:'r1261', equipo:'Instituto Plenilunio', nombre:'Oleander Meadows', original:'Kousaka Ranto',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:48,defensa:60,especial:57,
  hissatsu:['Torbellino interceptor', 'Trama trama', 'Pasos aéreos'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1261.webp'
},
{
  id:'r1262', equipo:'Instituto Plenilunio', nombre:'Raven Vale', original:'Kusaka Gen',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:53,pase:62,defensa:47,especial:60,
  hissatsu:['Sierra celestial', 'Visto y no visto', 'Superaceleración'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1262.webp'
},
{
  id:'r1263', equipo:'Instituto Plenilunio', nombre:'Solomon Owle', original:'Michiba Atsunori',
  posicion:'Defensa', tipo:'Viento',
  tiro:40,pase:49,defensa:61,especial:58,
  hissatsu:['Corte giratorio', 'Luna creciente', 'Escáner Ataque'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1263.webp'
},
{
  id:'r1264', equipo:'Instituto Plenilunio', nombre:'Duske Grayling', original:'Nishikage Seiya',
  posicion:'Portero', tipo:'Bosque',
  tiro:24,pase:50,defensa:57,especial:56,
  hissatsu:['Escudo lunar', 'Presa de sombras', 'Eclipse Lunar'],tipoTecnica:'portero',
  desc:'Portero de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1264.webp'
},
{
  id:'r1265', equipo:'Instituto Plenilunio', nombre:'Wolfe Redwood', original:'Okano Kousuke',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:52,pase:61,defensa:46,especial:59,
  hissatsu:['Pasos aéreos', 'Ultra lunar', 'Voltereta Círcense'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1265.webp'
},
{
  id:'r1266', equipo:'Instituto Plenilunio', nombre:'Reid Rivers', original:'Okuno Hosomichi',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:48,defensa:60,especial:57,
  hissatsu:['Torbellino interceptor', 'Ataque de garza', 'Superaceleración'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1266.webp'
},
{
  id:'r1267', equipo:'Instituto Plenilunio', nombre:'Piers Thornton', original:'Sakuraba Haruki',
  posicion:'Defensa', tipo:'Fuego',
  tiro:56,pase:47,defensa:59,especial:56,
  hissatsu:['Corte giratorio', 'Apisonadora', 'Estrella fugaz'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1267.webp'
},
{
  id:'r1268', equipo:'Instituto Plenilunio', nombre:'Elior March', original:'Shiina Issei',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:50,defensa:62,especial:55,
  hissatsu:['Regate divino', 'Giro Bobina', 'Robo veloz'],tipoTecnica:'regate',
  desc:'Defensa de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 23.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1268.webp'
},
{
  id:'r1269', equipo:'Instituto Plenilunio', nombre:'Lucian Skye', original:'Takemi Kousuke',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:51,pase:60,defensa:45,especial:58,
  hissatsu:['Cruz del sur', 'Visto y no visto', 'Trampa tornado'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 21.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1269.webp'
},
{
  id:'r1270', equipo:'Instituto Plenilunio', nombre:'Willow Proude', original:'Tanizaki Yoshiya',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:52,pase:61,defensa:46,especial:59,
  hissatsu:['Sierra celestial', 'Círculo de hielo', 'Engaño divino'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1270.webp'
},
{
  id:'r1271', equipo:'Instituto Plenilunio', nombre:'Raylon Highmoor', original:'Yamashiro Reihou',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:52,pase:61,defensa:46,especial:59,
  hissatsu:['Pasos aéreos', 'Espejismo', 'Robo veloz'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 24.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1271.webp'
},
{
  id:'r1272', equipo:'Instituto Plenilunio', nombre:'Solren Dawnwright', original:'Yudou Asahi',
  posicion:'Portero', tipo:'Montaña',
  tiro:30,pase:56,defensa:59,especial:58,
  hissatsu:['Campo de fuerza defensivo', 'Despeje cohete', 'Presa de sombras'],tipoTecnica:'portero',
  desc:'Portero de Instituto Plenilunio en Inazuma Eleven Ares, dorsal 22.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1272.webp'
},
{
  id:'r1273', equipo:'Artemisa de Mr.YI', equiposExtra:['Sambassadors'], nombre:'Alegre', original:'Arthur',
  posicion:'Delantero', tipo:'Bosque',
  tiro:98,pase:82,defensa:43,especial:93,
  hissatsu:['Tiro cegador', 'Golpe de Samba', 'Baile del Carnaval'],tipoTecnica:'tiro',
  desc:'Delantero de Artemisa de Mr.YI en Inazuma Eleven Orion, dorsal 20.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1273.webp'
},
{
  id:'r1274', equipo:'Artemisa de Mr.YI', equiposExtra:['Chispas Perfectas'], nombre:'Alexander Allegrov', original:'Froy Girikanan',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:88,pase:97,defensa:82,especial:95,
  hissatsu:['Túnel tornado'],tipoTecnica:'regate',
  desc:'Centrocampista de Artemisa de Mr.YI en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1274.webp'
},
{
  id:'r1275', equipo:'Artemisa de Mr.YI', equiposExtra:['Chispas Perfectas'], nombre:'Martemeli Prestov', original:'Lus Kasim',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:87,pase:96,defensa:81,especial:94,
  hissatsu:['Círculo de hielo', 'Ultra lunar'],tipoTecnica:'regate',
  desc:'Centrocampista de Artemisa de Mr.YI en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1275.webp'
},
{
  id:'r1276', equipo:'Artemisa de Mr.YI', equiposExtra:['Chispas Perfectas'], nombre:'Oleg Animatov', original:'Malik Kuabel',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:86,pase:95,defensa:80,especial:93,
  hissatsu:['Círculo de hielo', 'Ángel de nieve'],tipoTecnica:'regate',
  desc:'Centrocampista de Artemisa de Mr.YI en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1276.webp'
},
{
  id:'r1277', equipo:'Artemisa de Mr.YI', equiposExtra:['Guardianes de La Reina'], nombre:'Orlando', original:'Petronio Patti',
  posicion:'Delantero', tipo:'Montaña',
  tiro:96,pase:80,defensa:47,especial:91,
  hissatsu:['Luna creciente', 'Descodificación'],tipoTecnica:'tiro',
  desc:'Delantero de Artemisa de Mr.YI en Inazuma Eleven Orion, dorsal 19.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1277.webp'
},
{
  id:'r1278', equipo:'Chispas Perfectas', nombre:'Leonid Largov', original:'Alexei Trepov',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:79,defensa:91,especial:88,
  hissatsu:['Defensa múltiple', 'Emboscada defensiva', 'Regate Aurora'],tipoTecnica:'defensa',
  desc:'Defensa de Chispas Perfectas en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1278.webp'
},
{
  id:'r1279', equipo:'Chispas Perfectas', nombre:'Gregory Fortin', original:'Goran Vecilia',
  posicion:'Portero', tipo:'Fuego',
  tiro:26,pase:56,defensa:89,especial:88,
  hissatsu:['Bimano celestial', 'Bloque de Hielo', 'Barrera de cristal'],tipoTecnica:'portero',
  desc:'Portero de Chispas Perfectas en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1279.webp'
},
{
  id:'r1280', equipo:'Chispas Perfectas', nombre:'Nikolai Glisanderov', original:'Gwennady Zakharov',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:78,defensa:90,especial:87,
  hissatsu:['Sprint triple', 'Emboscada defensiva', 'Carrera triple'],tipoTecnica:'defensa',
  desc:'Defensa de Chispas Perfectas en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1280.webp'
},
{
  id:'r1281', equipo:'Chispas Perfectas', nombre:'Michael Vivacer', original:'Karl Senirov',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Potenciación', 'Regate Aurora', 'Subterfugio'],tipoTecnica:'regate',
  desc:'Centrocampista de Chispas Perfectas en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1281.webp'
},
{
  id:'r1282', equipo:'Chispas Perfectas', nombre:'Molev Misterioski', original:'Lasker Vagner',
  posicion:'Delantero', tipo:'Fuego',
  tiro:94,pase:78,defensa:44,especial:85,
  hissatsu:['Onda chispeante', 'Roca volcánica', 'Regate Aurora'],tipoTecnica:'tiro',
  desc:'Delantero de Chispas Perfectas en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1282.webp'
},
{
  id:'r1283', equipo:'Chispas Perfectas', nombre:'Marat Stakatov', original:'Marl Marat',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Onda chispeante', 'Regate Aurora', 'Ultra lunar'],tipoTecnica:'regate',
  desc:'Centrocampista de Chispas Perfectas en Inazuma Eleven Orion, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1283.webp'
},
{
  id:'r1284', equipo:'Chispas Perfectas', nombre:'Boris Kaprichyov', original:'Rabi Eremenko',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:77,defensa:89,especial:86,
  hissatsu:['Regate aurora', 'Muralla de Atlantis', 'Mega Terremoto'],tipoTecnica:'defensa',
  desc:'Defensa de Chispas Perfectas en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1284.webp'
},
{
  id:'r1285', equipo:'Chispas Perfectas', nombre:'Konstantin Furyozov', original:'Shamil Trubetskoy',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Mega terremoto', 'Emboscada defensiva', 'Subterfugio'],tipoTecnica:'regate',
  desc:'Centrocampista de Chispas Perfectas en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1285.webp'
},
{
  id:'r1286', equipo:'Chispas Perfectas', nombre:'Igor Pitsikatov', original:'Simon Zhitova',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Potenciación', 'Regate Aurora', 'Subterfugio'],tipoTecnica:'regate',
  desc:'Centrocampista de Chispas Perfectas en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1286.webp'
},
{
  id:'r1287', equipo:'Chispas Perfectas', nombre:'Yuri Rodina', original:'Yuri Rodina',
  posicion:'Delantero', tipo:'Viento',
  tiro:93,pase:77,defensa:39,especial:88,
  hissatsu:['Aullido de lobo', 'Leopardo de la ventisca', 'Regate Aurora'],tipoTecnica:'tiro',
  desc:'Delantero de Chispas Perfectas en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1287.webp'
},
{
  id:'r1288', equipo:'Chispas Perfectas', nombre:'Anton Kolosalyov', original:'Zaur Salenko',
  posicion:'Delantero', tipo:'Montaña',
  tiro:92,pase:76,defensa:48,especial:87,
  hissatsu:['Dragón terrestre', 'Tiro valiente', 'Subterfugio'],tipoTecnica:'tiro',
  desc:'Delantero de Chispas Perfectas en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1288.webp'
},
{
  id:'r1289', equipo:'Eclipse de Orión', nombre:'Alnilam', original:'Alnilam',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:83,pase:92,defensa:77,especial:90,
  hissatsu:['Gran catarata', 'Cruce explosivo', 'Leopardo de la ventisca'],tipoTecnica:'regate',
  desc:'Centrocampista de Eclipse de Orión en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1289.webp'
},
{
  id:'r1290', equipo:'Eclipse de Orión', nombre:'Alnitak', original:'Alnitak',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Gran catarata', 'Cruce explosivo', 'Leopardo de la ventisca'],tipoTecnica:'regate',
  desc:'Centrocampista de Eclipse de Orión en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1290.webp'
},
{
  id:'r1291', equipo:'Eclipse de Orión', nombre:'Hatysa', original:'Hatysa',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Cruce explosivo', 'Presa fractal', 'Cruz del sur'],tipoTecnica:'regate',
  desc:'Centrocampista de Eclipse de Orión en Inazuma Eleven Orion, dorsal 17.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1291.webp'
},
{
  id:'r1292', equipo:'Eclipse de Orión', nombre:'Kappa', original:'Kappa',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Cinto astral', 'Presa fractal', 'Lluvia de Meteoros'],tipoTecnica:'regate',
  desc:'Centrocampista de Eclipse de Orión en Inazuma Eleven Orion, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1292.webp'
},
{
  id:'r1293', equipo:'Eclipse de Orión', nombre:'Meissa', original:'Meissa',
  posicion:'Defensa', tipo:'Viento',
  tiro:56,pase:77,defensa:89,especial:86,
  hissatsu:['Gran catarata', 'Cruce explosivo', 'Presa fractal'],tipoTecnica:'defensa',
  desc:'Defensa de Eclipse de Orión en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1293.webp'
},
{
  id:'r1294', equipo:'Eclipse de Orión', nombre:'Mintaka', original:'Mintaka',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:84,pase:93,defensa:78,especial:87,
  hissatsu:['Jaula de piedra', 'Lluvia de Meteoros', 'Estrella fugaz'],tipoTecnica:'regate',
  desc:'Centrocampista de Eclipse de Orión en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1294.webp'
},
{
  id:'r1295', equipo:'Eclipse de Orión', nombre:'Rigel', original:'Rigel',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Ataque meteorito', 'Cometa legendario', 'Cruce explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Eclipse de Orión en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1295.webp'
},
{
  id:'r1296', equipo:'Eclipse de Orión', nombre:'Saiph', original:'Saiph',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:78,defensa:90,especial:87,
  hissatsu:['Gran catarata', 'Cruce explosivo', 'Presa fractal'],tipoTecnica:'defensa',
  desc:'Defensa de Eclipse de Orión en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1296.webp'
},
{
  id:'r1297', equipo:'Eclipse de Orión', nombre:'Sirius', original:'Sirius',
  posicion:'Defensa', tipo:'Fuego',
  tiro:43,pase:78,defensa:90,especial:87,
  hissatsu:['Cruce explosivo', 'Presa fractal', 'Gravitación'],tipoTecnica:'defensa',
  desc:'Defensa de Eclipse de Orión en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1297.webp'
},
{
  id:'r1298', equipo:'Eclipse de Orión', nombre:'Tabit', original:'Tabit',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:77,defensa:89,especial:86,
  hissatsu:['Gran catarata', 'Cruce explosivo', 'Presa fractal'],tipoTecnica:'defensa',
  desc:'Defensa de Eclipse de Orión en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1298.webp'
},
{
  id:'r1299', equipo:'Guardianes de La Reina', nombre:'Grandazzo', original:'Carlos Gallo',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:80,pase:89,defensa:74,especial:83,
  hissatsu:['Cortafuegos', 'Formación defensiva', 'Avance flamígero'],tipoTecnica:'regate',
  desc:'Centrocampista de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1299.webp'
},
{
  id:'r1300', equipo:'Guardianes de La Reina', nombre:'Bellona Orsini', original:'Diana Scola',
  posicion:'Defensa', tipo:'Fuego',
  tiro:41,pase:74,defensa:86,especial:83,
  hissatsu:['Entrada rodante', 'Visto y no visto'],tipoTecnica:'defensa',
  desc:'Defensa de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1300.webp'
},
{
  id:'r1301', equipo:'Guardianes de La Reina', nombre:'Camilla Gonzaga', original:'Elma Chiti',
  posicion:'Defensa', tipo:'Viento',
  tiro:46,pase:73,defensa:85,especial:82,
  hissatsu:['Entrada rodante', 'Proyectil de Ozono'],tipoTecnica:'defensa',
  desc:'Defensa de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1301.webp'
},
{
  id:'r1302', equipo:'Guardianes de La Reina', nombre:'Ruggiero Spinola', original:'Giustino Giovanni',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:74,defensa:86,especial:83,
  hissatsu:['Dúo magma', 'Pase doble', 'Estrella fugaz'],tipoTecnica:'defensa',
  desc:'Defensa de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1302.webp'
},
{
  id:'r1303', equipo:'Guardianes de La Reina', nombre:'Fantaghirò Petrucci', original:'Kakehashi Tsugu',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Arcoiris luminoso', 'Pase doble', 'Proyectil de Ozono'],tipoTecnica:'regate',
  desc:'Centrocampista de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1303.webp'
},
{
  id:'r1304', equipo:'Guardianes de La Reina', nombre:'Brandimarte Ruffo', original:'Luca Russo',
  posicion:'Delantero', tipo:'Montaña',
  tiro:88,pase:72,defensa:46,especial:83,
  hissatsu:['Himno de atenea', 'Formación defensiva', 'Espada de Odín'],tipoTecnica:'tiro',
  desc:'Delantero de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1304.webp'
},
{
  id:'r1305', equipo:'Guardianes de La Reina', nombre:'Dodone Barberini', original:'Matteo Domenico',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:71,defensa:41,especial:82,
  hissatsu:['Luna creciente', 'Tiro valiente', 'Carruaje Insano'],tipoTecnica:'tiro',
  desc:'Delantero de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1305.webp'
},
{
  id:'r1306', equipo:'Guardianes de La Reina', nombre:'Marfisa Corsi', original:'Monica Sala',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['Dúo magma', 'Estrella fugaz', 'Cúpula Sónica'],tipoTecnica:'regate',
  desc:'Centrocampista de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1306.webp'
},
{
  id:'r1307', equipo:'Guardianes de La Reina', nombre:'Zerbino Savelli', original:'Nestore Gatto',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Remolino cortante', 'Zona Sigma', 'Visto y no visto'],tipoTecnica:'regate',
  desc:'Centrocampista de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1307.webp'
},
{
  id:'r1308', equipo:'Guardianes de La Reina', nombre:'Dardinello Foscari', original:'Nicolò Fino',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Remolino cortante', 'Formación defensiva', 'Luna creciente'],tipoTecnica:'regate',
  desc:'Centrocampista de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1308.webp'
},
{
  id:'r1309', equipo:'Guardianes de La Reina', nombre:'Oliviero Albizzi', original:'Racerit Spto',
  posicion:'Portero', tipo:'Bosque',
  tiro:24,pase:50,defensa:83,especial:82,
  hissatsu:['Mate del dragón', 'Cabezazo volcánico', 'Dragón terrestre'],tipoTecnica:'portero',
  desc:'Portero de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1309.webp'
},
{
  id:'r1310', equipo:'Guardianes de La Reina', nombre:'Rinaldo Torelli', original:'Tonio Chiara',
  posicion:'Defensa', tipo:'Bosque',
  tiro:43,pase:74,defensa:86,especial:83,
  hissatsu:['Dúo magma', 'Pase doble', 'Balón yo-yo'],tipoTecnica:'defensa',
  desc:'Defensa de Guardianes de La Reina en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1310.webp'
},
{
  id:'r1311', equipo:'Instituto Eisei', nombre:'Bonnie Sparks', original:'Barazono Hana',
  posicion:'Defensa', tipo:'Bosque',
  tiro:44,pase:72,defensa:84,especial:81,
  hissatsu:['Gravedad', 'Cortafuegos', 'Zigzag de fuego'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Eisei en Inazuma Eleven Ares, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1311.webp'
},
{
  id:'r1312', equipo:'Instituto Eisei', nombre:'Ben Blowton', original:'Honba Geki',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Pompa de chicle', 'Cortafuegos', 'Bomba Falsa'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Eisei en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1312.webp'
},
{
  id:'r1313', equipo:'Instituto Eisei', nombre:'Grant Icewater', original:'Kanime Iderou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:75,defensa:87,especial:80,
  hissatsu:['Terremoto', 'Gravitación', 'Mega Terremoto'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Eisei en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1313.webp'
},
{
  id:'r1314', equipo:'Instituto Eisei', nombre:'Xavier Schiller', original:'Kira Hiroto',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:70,defensa:41,especial:81,
  hissatsu:['Chut de los 200 toques', 'El detonador', 'Zigzag veloz'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Eisei en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1314.webp'
},
{
  id:'r1315', equipo:'Instituto Eisei', nombre:'Claire Lesnow', original:'Kurakake Clara',
  posicion:'Defensa', tipo:'Viento',
  tiro:56,pase:72,defensa:84,especial:81,
  hissatsu:['Ecuación defensiva', 'Agujero de gusano', 'Flash de fotones'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Eisei en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1315.webp'
},
{
  id:'r1316', equipo:'Instituto Eisei', nombre:'Jordan Greenway', original:'Midorikawa Ryuuji',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Pase doble', 'Astro Remate', 'Carrera relámpago'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Eisei en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1316.webp'
},
{
  id:'r1317', equipo:'Instituto Eisei', nombre:'Ronny Metcalf', original:'Mutou Satoshi',
  posicion:'Delantero', tipo:'Viento',
  tiro:89,pase:73,defensa:36,especial:80,
  hissatsu:['Remate de Gaia', 'Teleportación', 'Pase Cruzado'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Eisei en Inazuma Eleven Ares, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1317.webp'
},
{
  id:'r1318', equipo:'Instituto Eisei', nombre:'Claude Beacons', original:'Nagumo Haruya',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:73,defensa:44,especial:80,
  hissatsu:['Tormenta solar', 'Llamarada Atómica', 'Ventisca de fuego'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Eisei en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1318.webp'
},
{
  id:'r1319', equipo:'Instituto Eisei', nombre:'Nigel August', original:'Netsuha Natsuhiko',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:70,defensa:39,especial:81,
  hissatsu:['Disparo rodante', 'Lluvia de Meteoros', 'Llamarada Atómica'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Eisei en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1319.webp'
},
{
  id:'r1320', equipo:'Instituto Eisei', nombre:'Zeke Valanche', original:'Segata Ryuuichirou',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:71,defensa:38,especial:82,
  hissatsu:['Victoria tricolor', 'Remate de Gaia', 'Agujero de gusano'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Eisei en Inazuma Eleven Ares, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1320.webp'
},
{
  id:'r1321', equipo:'Instituto Eisei', nombre:'Bryce Whitingale', original:'Suzuno Fuusuke',
  posicion:'Delantero', tipo:'Viento',
  tiro:86,pase:70,defensa:43,especial:81,
  hissatsu:['Ciclón blanco', 'Balón Iceberg', 'Bomba géiser'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Eisei en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1321.webp'
},
{
  id:'r1322', equipo:'Instituto Estrella Polar', nombre:'Mickey Way', original:'Amano Masamichi',
  posicion:'Portero', tipo:'Bosque',
  tiro:20,pase:50,defensa:84,especial:83,
  hissatsu:['Parada fuerte', 'Parada peliaguda', 'Bloque dureza'],tipoTecnica:'portero',
  desc:'Portero de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1322.webp'
},
{
  id:'r1323', equipo:'Instituto Estrella Polar', nombre:'Jimmy Nigh', original:'Futagotamagawa Tetsuya',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:80,pase:89,defensa:74,especial:87,
  hissatsu:['Zona de contención', 'Arrollador', 'Estrella fugaz'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1323.webp'
},
{
  id:'r1324', equipo:'Instituto Estrella Polar', nombre:'Konrad Hardin', original:'Kani Kenzou',
  posicion:'Portero', tipo:'Fuego',
  tiro:31,pase:53,defensa:85,especial:84,
  hissatsu:['Corte volcánico', 'Pinzas cortantes', 'A todo vapor'],tipoTecnica:'portero',
  desc:'Portero de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1324.webp'
},
{
  id:'r1325', equipo:'Instituto Estrella Polar', nombre:'Larry Lyre', original:'Kotono Tomio',
  posicion:'Defensa', tipo:'Fuego',
  tiro:46,pase:74,defensa:86,especial:83,
  hissatsu:['Corte giratorio', 'Baile de Llamas', 'Avance flamígero'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1325.webp'
},
{
  id:'r1326', equipo:'Instituto Estrella Polar', nombre:'Acker Reese', original:'Mizukamiya Seiryuu',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:75,defensa:90,especial:87,
  hissatsu:['Zona de contención', 'Pingüino emperador n.º 2', 'Campo de contención'],tipoTecnica:'defensa',
  desc:'Defensa y capitán de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1326.webp'
},
{
  id:'r1327', equipo:'Instituto Estrella Polar', nombre:'Holt Northam', original:'Okuma Hokuto',
  posicion:'Defensa', tipo:'Bosque',
  tiro:51,pase:75,defensa:87,especial:84,
  hissatsu:['Zona de contención', 'Barrido Defensivo', 'Luna creciente'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1327.webp'
},
{
  id:'r1328', equipo:'Instituto Estrella Polar', nombre:'Eddy O’Ryan', original:'Orio Fuyuki',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Triangulo letal', 'Arrollador', 'Barrido Defensivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1328.webp'
},
{
  id:'r1329', equipo:'Instituto Estrella Polar', nombre:'Oliver Golightly', original:'Saotome Seiya',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:79,pase:88,defensa:73,especial:86,
  hissatsu:['Regate divino', 'Himno de atenea', 'Remate en espiral'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1329.webp'
},
{
  id:'r1330', equipo:'Instituto Estrella Polar', nombre:'Oscar Pio', original:'Sasotsuka Eiji',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Triangulo letal', 'Escáner Ataque', 'Centrifugación Brutal'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1330.webp'
},
{
  id:'r1331', equipo:'Instituto Estrella Polar', nombre:'Cygnus Starkey', original:'Shiratori Tsumuki',
  posicion:'Defensa', tipo:'Bosque',
  tiro:57,pase:77,defensa:89,especial:82,
  hissatsu:['Regate divino', 'Baile de Llamas', 'Círculo de hielo'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1331.webp'
},
{
  id:'r1332', equipo:'Instituto Estrella Polar', nombre:'Braveon Halvors', original:'Shishitani Yuusuke',
  posicion:'Delantero', tipo:'Montaña',
  tiro:91,pase:75,defensa:40,especial:82,
  hissatsu:['Disparo con rebotes', 'Remate del águila', 'Carrera a tres piernas'],tipoTecnica:'tiro',
  desc:'Delantero de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1332.webp'
},
{
  id:'r1333', equipo:'Instituto Estrella Polar', nombre:'Caesar Pike', original:'Uoshima Sameharu',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Zona de contención', 'Disparo con Rebotes', 'Bola de Fango'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1333.webp'
},
{
  id:'r1334', equipo:'Instituto Estrella Polar', nombre:'Ari Zimmerman', original:'Yagihara Katsumi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:76,defensa:88,especial:85,
  hissatsu:['Barrido defensivo', 'Escáner Ataque', 'Campo de contención'],tipoTecnica:'defensa',
  desc:'Defensa de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1334.webp'
},
{
  id:'r1335', equipo:'Instituto Estrella Polar', nombre:'Aren Yarrow', original:'Yazu Meita',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Robo veloz', 'Superaceleración', 'Sorpresa'],tipoTecnica:'regate',
  desc:'Centrocampista de Instituto Estrella Polar en Inazuma Eleven Ares, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1335.webp'
},
{
  id:'r1336', equipo:'Royal Academy Ares', nombre:'Ben Simmons', original:'Banjou Kazumichi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:70,defensa:82,especial:79,
  hissatsu:['Ilusión deslumbrante', 'Ciclón', 'Ciclón doble'],tipoTecnica:'defensa',
  desc:'Defensa de Royal Academy Ares en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1336.webp'
},
{
  id:'r1337', equipo:'Royal Academy Ares', nombre:'Derek Swing', original:'Doumen Shuuichirou',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Remolino acuático', 'Regate múltiple', 'Triangulo letal'],tipoTecnica:'regate',
  desc:'Centrocampista de Royal Academy Ares en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1337.webp'
},
{
  id:'r1338', equipo:'Royal Academy Ares', nombre:'Joseph King', original:'Genda Koujirou',
  posicion:'Portero', tipo:'Fuego',
  tiro:31,pase:53,defensa:81,especial:80,
  hissatsu:['Lanzallamas', 'Escudo de Fuerza', 'Escudo de Fuerza Total'],tipoTecnica:'portero',
  desc:'Portero de Royal Academy Ares en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1338.webp'
},
{
  id:'r1339', equipo:'Royal Academy Ares', nombre:'Herman Waldon', original:'Henmi Wataru',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Barrena voladora', 'Barrido Defensivo', 'Ciclón'],tipoTecnica:'regate',
  desc:'Centrocampista de Royal Academy Ares en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1339.webp'
},
{
  id:'r1340', equipo:'Royal Academy Ares', nombre:'Daniel Hatch', original:'Jimon Daiki',
  posicion:'Delantero', tipo:'Bosque',
  tiro:85,pase:69,defensa:40,especial:80,
  hissatsu:['Triángulo letal final', 'Barrido Defensivo', 'Chut de los 100 toques'],tipoTecnica:'tiro',
  desc:'Delantero de Royal Academy Ares en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1340.webp'
},
{
  id:'r1341', equipo:'Royal Academy Ares', nombre:'Alan Master', original:'Narukami Kenya',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Patín aéreo', 'Barrido Defensivo', 'Espejismo de balón'],tipoTecnica:'regate',
  desc:'Centrocampista de Royal Academy Ares en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1341.webp'
},
{
  id:'r1342', equipo:'Royal Academy Ares', nombre:'Peter Drent', original:'Oono Densuke',
  posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:72,defensa:84,especial:81,
  hissatsu:['Dientes de roca', 'Disparo con Rebotes', 'Gran seísmo'],tipoTecnica:'defensa',
  desc:'Defensa de Royal Academy Ares en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1342.webp'
},
{
  id:'r1343', equipo:'Royal Academy Ares', nombre:'John Bloom', original:'Sakiyama Shuuji',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Ruta de la seda', 'Chut de los 100 toques', 'Barrido Defensivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Royal Academy Ares en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1343.webp'
},
{
  id:'r1344', equipo:'Royal Academy Ares', nombre:'David Samford', original:'Sakuma Jirou',
  posicion:'Delantero', tipo:'Bosque',
  tiro:90,pase:71,defensa:46,especial:81,
  hissatsu:['Pingüino perfecto', 'Pingüino emperador n.º 2', 'Barrido Defensivo'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Royal Academy Ares en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1344.webp'
},
{
  id:'r1345', equipo:'Zeus Ares', nombre:'Apollo Light', original:'Aporo Hikaru',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:75,defensa:87,especial:80,
  hissatsu:['Tiro cegador', 'Entrada Tormenta', 'Luz Cegadora'],tipoTecnica:'defensa',
  desc:'Defensa de Zeus Ares en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1345.webp'
},
{
  id:'r1346', equipo:'Zeus Ares', nombre:'Lane War', original:'Aresu Ran',
  posicion:'Defensa', tipo:'Montaña',
  tiro:57,pase:75,defensa:87,especial:80,
  hissatsu:['Pirueta rascacielos', 'Gravedad', 'Apisonadora'],tipoTecnica:'defensa',
  desc:'Defensa de Zeus Ares en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1346.webp'
},
{
  id:'r1347', equipo:'Zeus Ares', nombre:'Artie Mishman', original:'Arute Saneki',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Carrera del esfuerzo', 'Espejismo de balón', 'Hora Celestial'],tipoTecnica:'regate',
  desc:'Centrocampista de Zeus Ares en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1347.webp'
},
{
  id:'r1348', equipo:'Zeus Ares', nombre:'Wesley Knox', original:'Atena Tomo',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Mirada al futuro', 'Entrada Tormenta', 'Corte Giratorio'],tipoTecnica:'regate',
  desc:'Centrocampista de Zeus Ares en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1348.webp'
},
{
  id:'r1349', equipo:'Zeus Ares', nombre:'Danny Wood', original:'Deio Geki',
  posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:75,defensa:87,especial:80,
  hissatsu:['Ataque de la ballena', 'Mega Terremoto', 'Disparo con Rebotes'],tipoTecnica:'defensa',
  desc:'Defensa de Zeus Ares en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1349.webp'
},
{
  id:'r1350', equipo:'Zeus Ares', nombre:'Jonas Demetrius', original:'Demete Yutaka',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:73,defensa:40,especial:80,
  hissatsu:['Disparo con Rebotes', 'Flecha Divina', 'Entrada Tormenta'],tipoTecnica:'tiro',
  desc:'Delantero de Zeus Ares en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1350.webp'
},
{
  id:'r1351', equipo:'Zeus Ares', nombre:'Hadrian Diesel', original:'Hadeno Tetsu',
  posicion:'Defensa', tipo:'Viento',
  tiro:46,pase:72,defensa:84,especial:81,
  hissatsu:['Pisotón de sumo', 'Entrada Tormenta', 'Subida a los cielos'],tipoTecnica:'defensa',
  desc:'Defensa de Zeus Ares en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1351.webp'
},
{
  id:'r1352', equipo:'Zeus Ares', nombre:'Arion Matlock', original:'Herume Matsuaki',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Regate en Z', 'Hora Celestial', 'Ciclón'],tipoTecnica:'regate',
  desc:'Centrocampista de Zeus Ares en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1352.webp'
},
{
  id:'r1353', equipo:'Zeus Ares', nombre:'Percy Hurst', original:'Heruse Arisu',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:70,defensa:39,especial:81,
  hissatsu:['Diluvio letal', 'Hora Celestial', 'Subida a los cielos'],tipoTecnica:'tiro',
  desc:'Delantero de Zeus Ares en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1353.webp'
},
{
  id:'r1354', equipo:'Zeus Ares', nombre:'Ross Siddon', original:'Posei Donji',
  posicion:'Portero', tipo:'Montaña',
  tiro:22,pase:56,defensa:84,especial:83,
  hissatsu:['Parada fuerte', 'Muralla tsunami', 'Agujero Blanco'],tipoTecnica:'portero',
  desc:'Portero de Zeus Ares en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1354.webp'
},
{
  id:'r1355', equipo:'Brain Ares', nombre:'Darren Gouger', original:'Enami Michiru',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Inmersión', 'Subterfugio', 'Amago de tiro'],tipoTecnica:'regate',
  desc:'Centrocampista de Brain Ares en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1355.webp'
},
{
  id:'r1356', equipo:'Brain Ares', nombre:'Francis Tell', original:'Fujimaru Kei',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Teleportación', 'Ataque de las sombras', 'Cañonazo'],tipoTecnica:'regate',
  desc:'Centrocampista de Brain Ares en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1356.webp'
},
{
  id:'r1357', equipo:'Brain Ares', nombre:'Terry Stronger', original:'Hanaoka Tsuyoshi',
  posicion:'Defensa', tipo:'Fuego',
  tiro:57,pase:65,defensa:77,especial:74,
  hissatsu:['León devorador', 'Cabezazo Kung Fu', 'Escáner Ataque'],tipoTecnica:'defensa',
  desc:'Defensa de Brain Ares en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1357.webp'
},
{
  id:'r1358', equipo:'Brain Ares', nombre:'Harry Leading', original:'Hiroyama Yuu',
  posicion:'Defensa', tipo:'Viento',
  tiro:51,pase:65,defensa:77,especial:74,
  hissatsu:['Ángel de nieve', 'Remate Misil', 'Escáner Ataque'],tipoTecnica:'defensa',
  desc:'Defensa de Brain Ares en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1358.webp'
},
{
  id:'r1359', equipo:'Brain Ares', nombre:'Noel Good', original:'Inada Nori',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:65,defensa:77,especial:74,
  hissatsu:['Escudo bárbaro', 'Gran seísmo', 'Zona de seguridad'],tipoTecnica:'defensa',
  desc:'Defensa de Brain Ares en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1359.webp'
},
{
  id:'r1360', equipo:'Brain Ares', nombre:'Philip Marvel', original:'Murobushi Kyou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:64,defensa:76,especial:73,
  hissatsu:['Fiesta floral', 'Tiro dinamita', 'Escáner Ataque'],tipoTecnica:'defensa',
  desc:'Defensa de Brain Ares en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1360.webp'
},
{
  id:'r1361', equipo:'Brain Ares', nombre:'Gideon Poe', original:'Oma Nao',
  posicion:'Portero', tipo:'Fuego',
  tiro:31,pase:53,defensa:75,especial:74,
  hissatsu:['Campo de fuerza defensivo', 'Puños voladores', 'Despeje cohete'],tipoTecnica:'portero',
  desc:'Portero de Brain Ares en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1361.webp'
},
{
  id:'r1362', equipo:'Brain Ares', nombre:'Victor Kind', original:'Oobe Shin',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Himno de atenea', 'Remate combinado', 'Psicorremate'],tipoTecnica:'regate',
  desc:'Centrocampista de Brain Ares en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1362.webp'
},
{
  id:'r1363', equipo:'Brain Ares', nombre:'Electra Faraday', original:'Segawa Den',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Psicorremate', 'Disparo con Rebotes', 'Escáner Ataque'],tipoTecnica:'regate',
  desc:'Centrocampista de Brain Ares en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1363.webp'
},
{
  id:'r1364', equipo:'Brain Ares', nombre:'Neil Turner', original:'Shimozuru Arata',
  posicion:'Delantero', tipo:'Fuego',
  tiro:84,pase:65,defensa:46,especial:75,
  hissatsu:['Chilena de pingüino', 'Tornado de Fuego', 'Remate Misil'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Brain Ares en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1364.webp'
},
{
  id:'r1365', equipo:'Brain Ares', nombre:'Jonathan Seller', original:'Yamagishi Seri',
  posicion:'Delantero', tipo:'Viento',
  tiro:79,pase:63,defensa:36,especial:74,
  hissatsu:['Tormenta, tornado, huracán!', 'Tornado de Fuego', 'Psicorremate'],tipoTecnica:'tiro',
  desc:'Delantero de Brain Ares en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1365.webp'
},
{
  id:'r1366', equipo:'Kirkwood Ares', nombre:'Jodi Green', original:'Hoshino Madoka',
  posicion:'Defensa', tipo:'Fuego',
  tiro:43,pase:63,defensa:75,especial:72,
  hissatsu:['Flecha huracán', 'Potenciación', 'Estrella fugaz'],tipoTecnica:'defensa',
  desc:'Defensa de Kirkwood Ares en Inazuma Eleven Ares, dorsal 24.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1366.webp'
},
{
  id:'r1367', equipo:'Kirkwood Ares', nombre:'Ricky Clover', original:'Kurobe Ritsuki',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:63,defensa:75,especial:72,
  hissatsu:['La montaña', 'Flecha huracán', 'Tornado Inverso'],tipoTecnica:'defensa',
  desc:'Defensa de Kirkwood Ares en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1367.webp'
},
{
  id:'r1368', equipo:'Kirkwood Ares', nombre:'Alfred Meenan', original:'Megawa Akihi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:62,defensa:74,especial:71,
  hissatsu:['Niebla sombría', 'Flecha huracán', 'Robo veloz'],tipoTecnica:'defensa',
  desc:'Defensa de Kirkwood Ares en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1368.webp'
},
{
  id:'r1369', equipo:'Kirkwood Ares', nombre:'Hilary Prentice', original:'Mito Atomi',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:76,defensa:61,especial:74,
  hissatsu:['Flecha huracán', 'Potenciación', 'Tornado Inverso'],tipoTecnica:'regate',
  desc:'Centrocampista de Kirkwood Ares en Inazuma Eleven Ares, dorsal 23.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1369.webp'
},
{
  id:'r1370', equipo:'Kirkwood Ares', nombre:'Dan Mirthful', original:'Mitsumune Dan',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:64,defensa:76,especial:73,
  hissatsu:['Zona Sigma', 'Tiro Cegador', 'Corte Giratorio'],tipoTecnica:'defensa',
  desc:'Defensa de Kirkwood Ares en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1370.webp'
},
{
  id:'r1371', equipo:'Kirkwood Ares', nombre:'Zachary Moore', original:'Mogi Sakito',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:67,pase:76,defensa:61,especial:74,
  hissatsu:['Escáner ataque', 'Remate combinado', 'Espejismo de balón'],tipoTecnica:'regate',
  desc:'Centrocampista de Kirkwood Ares en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1371.webp'
},
{
  id:'r1372', equipo:'Kirkwood Ares', nombre:'Marvin Murdock', original:'Mukata Masaru',
  posicion:'Delantero', tipo:'Fuego',
  tiro:81,pase:62,defensa:35,especial:76,
  hissatsu:['Remate misil', 'Espejismo de balón', 'Triángulo Z'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Kirkwood Ares en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1372.webp'
},
{
  id:'r1373', equipo:'Kirkwood Ares', nombre:'Thomas Murdock', original:'Mukata Tomo',
  posicion:'Delantero', tipo:'Viento',
  tiro:78,pase:62,defensa:43,especial:73,
  hissatsu:['Tiro sónico', 'Triángulo Z', 'Tornado Inverso'],tipoTecnica:'tiro',
  desc:'Delantero de Kirkwood Ares en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1373.webp'
},
{
  id:'r1374', equipo:'Kirkwood Ares', nombre:'Tyler Murdock', original:'Mukata Tsutomu',
  posicion:'Delantero', tipo:'Montaña',
  tiro:76,pase:60,defensa:35,especial:71,
  hissatsu:['Cañón celestial', 'Corte Giratorio', 'Triángulo Z'],tipoTecnica:'tiro',
  desc:'Delantero de Kirkwood Ares en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1374.webp'
},
{
  id:'r1375', equipo:'Kirkwood Ares', nombre:'Malcolm Night', original:'Nishigaki Mamoru',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:62,defensa:74,especial:71,
  hissatsu:['Fortaleza nocturna', 'Superaceleración', 'Corte Giratorio'],tipoTecnica:'defensa',
  desc:'Defensa de Kirkwood Ares en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1375.webp'
},
{
  id:'r1376', equipo:'Kirkwood Ares', nombre:'Trice Topper', original:'Oogosho Yakata',
  posicion:'Portero', tipo:'Fuego',
  tiro:21,pase:59,defensa:75,especial:70,
  hissatsu:['Bloque dureza', 'Muralla Gigante', 'Despeje cohete'],tipoTecnica:'portero',
  desc:'Portero de Kirkwood Ares en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1376.webp'
},
{
  id:'r1377', equipo:'Kirkwood Ares', nombre:'Toby Damian', original:'Tobiyama Dan',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:67,pase:76,defensa:61,especial:74,
  hissatsu:['Arrancada', 'Tornado Inverso', 'Tiro Giratorio'],tipoTecnica:'regate',
  desc:'Centrocampista de Kirkwood Ares en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1377.webp'
},
{
  id:'r1378', equipo:'Kirkwood Ares', nombre:'York Nashmith', original:'Yakata Naoto',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Mirada al futuro', 'Tornado Inverso', 'Giro de Mono'],tipoTecnica:'regate',
  desc:'Centrocampista de Kirkwood Ares en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1378.webp'
},
{
  id:'r1379', equipo:'Alpino Ares', nombre:'Kerry Bootgaiter', original:'Araya Konko',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['Niebla venenosa', 'Regate espejismo', 'Remate en V'],tipoTecnica:'regate',
  desc:'Centrocampista de Alpino Ares en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1379.webp'
},
{
  id:'r1380', equipo:'Alpino Ares', nombre:'Aiden Froste', original:'Fubuki Atsuya',
  posicion:'Delantero', tipo:'Fuego',
  tiro:77,pase:61,defensa:46,especial:68,
  hissatsu:['Aullido de licantropo', 'Abrazo del Oso', 'Furia de oso'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino Ares en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1380.webp'
},
{
  id:'r1381', equipo:'Alpino Ares', nombre:'Shawn Froste', original:'Fubuki Shirou',
  posicion:'Delantero', tipo:'Viento',
  tiro:77,pase:58,defensa:47,especial:72,
  hissatsu:['Trampolín relámpago', 'Ventisca eterna', 'Paisaje Helado'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Alpino Ares en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1381.webp'
},
{
  id:'r1382', equipo:'Alpino Ares', nombre:'Adam Ropes', original:'Hakoda Tetsu',
  posicion:'Portero', tipo:'Viento',
  tiro:39,pase:53,defensa:71,especial:70,
  hissatsu:['Puños certeros', 'Paisaje Helado', 'Bloque de Hielo'],tipoTecnica:'portero',
  desc:'Portero de Alpino Ares en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1382.webp'
},
{
  id:'r1383', equipo:'Alpino Ares', nombre:'Roland Climbstein', original:'Hyoujou Retsuto',
  posicion:'Delantero', tipo:'Viento',
  tiro:75,pase:59,defensa:36,especial:70,
  hissatsu:['Supertrampolín relámpago', 'Paisaje Helado', 'Ventisca eterna'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino Ares en Inazuma Eleven Ares, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1383.webp'
},
{
  id:'r1384', equipo:'Alpino Ares', nombre:'Maddox Rock', original:'Iya Mafuru',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:67,pase:76,defensa:61,especial:70,
  hissatsu:['Maldición', 'Regate Aurora', 'Regate espejismo'],tipoTecnica:'regate',
  desc:'Centrocampista de Alpino Ares en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1384.webp'
},
{
  id:'r1385', equipo:'Alpino Ares', nombre:'Quentin Rackner', original:'Kitami Ryuu',
  posicion:'Delantero', tipo:'Bosque',
  tiro:74,pase:58,defensa:35,especial:69,
  hissatsu:['Tornado doble', 'Bomba géiser', 'Chut Congelante'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino Ares en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1385.webp'
},
{
  id:'r1386', equipo:'Alpino Ares', nombre:'Spike Gleeson', original:'Mabuka Souji',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:63,defensa:75,especial:68,
  hissatsu:['Fórmula matemática', 'Ataque de las sombras', 'Regate Aurora'],tipoTecnica:'defensa',
  desc:'Defensa de Alpino Ares en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1386.webp'
},
{
  id:'r1387', equipo:'Alpino Ares', nombre:'Joaquine Downtown', original:'Matoro Juka',
  posicion:'Defensa', tipo:'Fuego',
  tiro:45,pase:63,defensa:75,especial:68,
  hissatsu:['Pisotón de sumo', 'Paisaje Helado', 'Regate Aurora'],tipoTecnica:'defensa',
  desc:'Defensa de Alpino Ares en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1387.webp'
},
{
  id:'r1388', equipo:'Alpino Ares', nombre:'Milton Bindings', original:'Oshiya Manbe',
  posicion:'Defensa', tipo:'Viento',
  tiro:56,pase:62,defensa:74,especial:71,
  hissatsu:['Robo fantástico', 'Paisaje Helado', 'Superbalón rodante'],tipoTecnica:'defensa',
  desc:'Defensa de Alpino Ares en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1388.webp'
},
{
  id:'r1389', equipo:'Alpino Ares', nombre:'Bunny Cottontail', original:'Shiratoya Nae',
  posicion:'Delantero', tipo:'Viento',
  tiro:74,pase:58,defensa:39,especial:69,
  hissatsu:['Liebre blanca', 'Fiesta floral', 'Regate Aurora'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino Ares en Inazuma Eleven Ares, dorsal 17.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1389.webp'
},
{
  id:'r1390', equipo:'Alpino Ares', nombre:'Kevin Dragonfly', original:'Someoka Ryuugo',
  posicion:'Delantero', tipo:'Bosque',
  tiro:76,pase:60,defensa:35,especial:71,
  hissatsu:['Disparo cósmico', 'Remate Dragón', 'Tornado dragón'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino Ares en Inazuma Eleven Ares, dorsal 19.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1390.webp'
},
{
  id:'r1391', equipo:'Alpino Ares', nombre:'Robert Skipolson', original:'Sorano Rebun',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:64,pase:73,defensa:58,especial:71,
  hissatsu:['Choque directo', 'Regate espejismo', 'Pase Cruzado'],tipoTecnica:'regate',
  desc:'Centrocampista de Alpino Ares en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1391.webp'
},
{
  id:'r1392', equipo:'Alpino Ares', nombre:'Sean Snowfield', original:'Yukino Seiya',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['Mina terrestre', 'Mega Terremoto', 'Súper pisotón de sumo'],tipoTecnica:'regate',
  desc:'Centrocampista de Alpino Ares en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1392.webp'
},
{
  id:'r1393', equipo:'Rampart', nombre:'Barry Cade', original:'Banri Nagamine',
  posicion:'Defensa', tipo:'Montaña',
  tiro:54,pase:60,defensa:72,especial:69,
  hissatsu:['El muro', 'Mega Terremoto', 'Muro de piedra'],tipoTecnica:'defensa',
  desc:'Defensa de Rampart en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1393.webp'
},
{
  id:'r1394', equipo:'Rampart', nombre:'Rick Wall', original:'Buroku Tsumio',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['El muro', 'Tormenta de Arena', 'Voltereta Círcense'],tipoTecnica:'regate',
  desc:'Centrocampista de Rampart en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1394.webp'
},
{
  id:'r1395', equipo:'Rampart', nombre:'Lunk Ironbrow', original:'Hirata Taizou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:59,defensa:71,especial:68,
  hissatsu:['Frankendefensa', 'El Muro', 'Voltereta Círcense'],tipoTecnica:'defensa',
  desc:'Defensa de Rampart en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1395.webp'
},
{
  id:'r1396', equipo:'Rampart', nombre:'Iggy Motte', original:'Ishikabe Yamori',
  posicion:'Delantero', tipo:'Viento',
  tiro:75,pase:59,defensa:42,especial:66,
  hissatsu:['Remate dragón', 'Ataque de Cóndor', 'Regate Topo'],tipoTecnica:'tiro',
  desc:'Delantero de Rampart en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1396.webp'
},
{
  id:'r1397', equipo:'Rampart', nombre:'Sebastian Fortwright', original:'Iwagaki Noborou',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:77,defensa:59,especial:71,
  hissatsu:['El muro', 'Regate Topo', 'Cascabel'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Rampart en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1397.webp'
},
{
  id:'r1398', equipo:'Rampart', nombre:'Knox Loxley', original:'Jousai Kento',
  posicion:'Portero', tipo:'Fuego',
  tiro:34,pase:56,defensa:70,especial:69,
  hissatsu:['Parada fuerte', 'Bloque dureza', 'Combustión'],tipoTecnica:'portero',
  desc:'Portero de Rampart en Inazuma Eleven Ares, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1398.webp'
},
{
  id:'r1399', equipo:'Rampart', nombre:'Jack Wallside', original:'Kabeyama Heigorou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:41,pase:59,defensa:71,especial:68,
  hissatsu:['Carga de elefantes', 'El Muro', 'La montaña'],tipoTecnica:'defensa',
  desc:'Defensa de Rampart en Inazuma Eleven Ares, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1399.webp'
},
{
  id:'r1400', equipo:'Rampart', nombre:'Warden Watchford', original:'Kadotsu Keiei',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['El muro', 'Segadora', 'Bomba Falsa'],tipoTecnica:'regate',
  desc:'Centrocampista de Rampart en Inazuma Eleven Ares, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1400.webp'
},
{
  id:'r1401', equipo:'Rampart', nombre:'Corbin Brickham', original:'Kakoi Kouken',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:58,defensa:70,especial:67,
  hissatsu:['El muro', 'Tormenta de Arena', 'Carga de Elefantes'],tipoTecnica:'defensa',
  desc:'Defensa de Rampart en Inazuma Eleven Ares, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1401.webp'
},
{
  id:'r1402', equipo:'Rampart', nombre:'Helena Harwood', original:'Kofun Miko',
  posicion:'Portero', tipo:'Bosque',
  tiro:25,pase:59,defensa:71,especial:66,
  hissatsu:['Tormenta de pétalos', 'Muralla Infinita', 'Zona Sagrada'],tipoTecnica:'portero',
  desc:'Portero de Rampart en Inazuma Eleven Ares, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1402.webp'
},
{
  id:'r1403', equipo:'Rampart', nombre:'Björn Brocken', original:'Maeno Taihou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:58,defensa:70,especial:67,
  hissatsu:['El muro', 'Carga de Elefantes', 'Muro de piedra'],tipoTecnica:'defensa',
  desc:'Defensa de Rampart en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1403.webp'
},
{
  id:'r1404', equipo:'Rampart', nombre:'Hefton Bulk', original:'Moriagari Moko',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:61,defensa:73,especial:66,
  hissatsu:['Cabezazo moái', 'El Muro', 'Regate Topo'],tipoTecnica:'defensa',
  desc:'Defensa de Rampart en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1404.webp'
},
{
  id:'r1405', equipo:'Rampart', nombre:'Ivor Shield', original:'Tateno Tatsuo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['El muro', 'Tormenta de Arena', 'Voltereta Círcense'],tipoTecnica:'regate',
  desc:'Centrocampista de Rampart en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1405.webp'
},
{
  id:'r1406', equipo:'Rampart', nombre:'Rocky Hardcastle', original:'Tetsugoushi Kogorou',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['Aikido', 'Danza del viento', 'Pase Cruzado'],tipoTecnica:'regate',
  desc:'Centrocampista de Rampart en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1406.webp'
},
{
  id:'r1407', equipo:'Rampart', nombre:'Dane Upchurch', original:'Tsukauchi Ryuuki',
  posicion:'Delantero', tipo:'Montaña',
  tiro:74,pase:58,defensa:41,especial:69,
  hissatsu:['Golf total', 'Remate dinosaurio', 'Voltereta Círcense'],tipoTecnica:'regate',
  desc:'Delantero de Rampart en Inazuma Eleven Ares, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1407.webp'
},
{
  id:'r1408', equipo:'Rampart', nombre:'Waldo Gibbons', original:'Ugou Sarukichi',
  posicion:'Delantero', tipo:'Fuego',
  tiro:75,pase:59,defensa:48,especial:66,
  hissatsu:['Disparo con rebotes', 'Golf total', 'Llamarada infernal'],tipoTecnica:'tiro',
  desc:'Delantero de Rampart en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1408.webp'
},
{
  id:'r1409', equipo:'Everytown', nombre:'Dan Bowsun', original:'Dan Tetsuo',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:57,defensa:69,especial:62,
  hissatsu:['Dientes de roca', 'Trama trama', 'Defensa múltiple'],tipoTecnica:'defensa',
  desc:'Defensa de Everytown en Inazuma Eleven Ares, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1409.webp'
},
{
  id:'r1410', equipo:'Everytown', nombre:'Gaffer Mason', original:'Genba Kouji',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:59,pase:68,defensa:53,especial:66,
  hissatsu:['Paipay gigante', 'Ciclón doble', 'Dragón terrestre'],tipoTecnica:'regate',
  desc:'Centrocampista de Everytown en Inazuma Eleven Ares, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1410.webp'
},
{
  id:'r1411', equipo:'Everytown', nombre:'Burleigh Carpenter', original:'Hashiya Kousaku',
  posicion:'Defensa', tipo:'Montaña',
  tiro:54,pase:54,defensa:66,especial:63,
  hissatsu:['Superarmadillo', 'Trama trama', 'Armadillo Circense'],tipoTecnica:'defensa',
  desc:'Defensa de Everytown en Inazuma Eleven Ares, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1411.webp'
},
{
  id:'r1412', equipo:'Everytown', nombre:'Frey Fielding', original:'Hatake Masasada',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:61,pase:70,defensa:55,especial:64,
  hissatsu:['Carrera a tres piernas', 'Segadora', 'Superbalón rodante'],tipoTecnica:'regate',
  desc:'Centrocampista de Everytown en Inazuma Eleven Ares, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1412.webp'
},
{
  id:'r1413', equipo:'Everytown', nombre:'Neville Merchant', original:'Kaname Mizuho',
  posicion:'Delantero', tipo:'Viento',
  tiro:71,pase:55,defensa:38,especial:62,
  hissatsu:['Rizo de Dragón', 'Pared solitaria', 'Golpe doble'],tipoTecnica:'tiro',
  desc:'Delantero de Everytown en Inazuma Eleven Ares, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1413.webp'
},
{
  id:'r1414', equipo:'Everytown', nombre:'Jack Sawyer', original:'Kaneshiro Mitsunari',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:61,pase:70,defensa:52,especial:68,
  hissatsu:['Rizo de Dragón', 'Superaceleración', 'Sorpresa'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Everytown en Inazuma Eleven Ares, dorsal 3.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1414.webp'
},
{
  id:'r1415', equipo:'Everytown', nombre:'Tobin Harveston', original:'Komedawara Housaku',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:58,pase:67,defensa:52,especial:65,
  hissatsu:['Paipay gigante', 'Tiro amasado', 'Segadora'],tipoTecnica:'regate',
  desc:'Centrocampista de Everytown en Inazuma Eleven Ares, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1415.webp'
},
{
  id:'r1416', equipo:'Everytown', nombre:'Meriwether Beaumont', original:'Minoshima Toshiya',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:54,defensa:66,especial:63,
  hissatsu:['Carrera a tres piernas', 'Trama trama', 'Robo veloz'],tipoTecnica:'defensa',
  desc:'Defensa de Everytown en Inazuma Eleven Ares, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1416.webp'
},
{
  id:'r1417', equipo:'Everytown', nombre:'Luke Blank', original:'Muhyou Jou',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:59,pase:68,defensa:53,especial:66,
  hissatsu:['Remolino cortante', 'Tornado de Fuego', 'Ataque cortante'],tipoTecnica:'regate',
  desc:'Centrocampista de Everytown en Inazuma Eleven Ares, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1417.webp'
},
{
  id:'r1418', equipo:'Everytown', nombre:'Eamond Everwing', original:'Onba Nagomu',
  posicion:'Delantero', tipo:'Montaña',
  tiro:71,pase:55,defensa:40,especial:62,
  hissatsu:['Remate múltiple', 'Bola de Hojas', 'Emboscada'],tipoTecnica:'tiro',
  desc:'Delantero de Everytown en Inazuma Eleven Ares, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1418.webp'
},
{
  id:'r1419', equipo:'Everytown', nombre:'Billy Miller', original:'Sakanoue Noboru',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:54,defensa:66,especial:63,
  hissatsu:['Corte volcánico', 'Círculo de Espadas', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Everytown en Inazuma Eleven Ares, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1419.webp'
},
{
  id:'r1420', equipo:'Everytown', nombre:'Pacey Hawker', original:'Shimomachi Kakeru',
  posicion:'Delantero', tipo:'Bosque',
  tiro:71,pase:55,defensa:42,especial:62,
  hissatsu:['Rizo de Dragón', 'Avance flamígero', 'Dragón terrestre'],tipoTecnica:'tiro',
  desc:'Delantero de Everytown en Inazuma Eleven Ares, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1420.webp'
},
{
  id:'r1421', equipo:'Everytown', nombre:'Everest Brightwell', original:'Sumiyoshi Einosuke',
  posicion:'Defensa', tipo:'Bosque',
  tiro:41,pase:57,defensa:69,especial:62,
  hissatsu:['Patada canguro', 'Bola de Hojas', 'Dragón terrestre'],tipoTecnica:'regate',
  desc:'Defensa de Everytown en Inazuma Eleven Ares, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1421.webp'
},
{
  id:'r1422', equipo:'Everytown', nombre:'Giles Farmer', original:'Tanoue Ikuto',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:58,pase:67,defensa:52,especial:65,
  hissatsu:['Rizo de Dragón', 'Emboscada', 'Giro de Mono'],tipoTecnica:'regate',
  desc:'Centrocampista de Everytown en Inazuma Eleven Ares, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1422.webp'
},
{
  id:'r1423', equipo:'Everytown', nombre:'Kia Tanner', original:'Tanukigahara Ponko',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:59,pase:68,defensa:53,especial:66,
  hissatsu:['Patada canguro', 'Golpe doble', 'Torbellino dragón'],tipoTecnica:'regate',
  desc:'Centrocampista de Everytown en Inazuma Eleven Ares, dorsal 18.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1423.webp'
},
{
  id:'r1424', equipo:'Los Invencibles', nombre:'Chicho Muñoz', original:'Chico Allison',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Entrada de llamas', 'Balón de petróleo', 'Potenciación'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Invencibles en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1424.webp'
},
{
  id:'r1425', equipo:'Los Invencibles', nombre:'Manuel Gutiérrez', original:'Domelgo Domínguez',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:77,defensa:89,especial:86,
  hissatsu:['Voltereta circense', 'Jaula de piedra', 'Engaño Torero'],tipoTecnica:'defensa',
  desc:'Defensa de Los Invencibles en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1425.webp'
},
{
  id:'r1426', equipo:'Los Invencibles', nombre:'José Mari González', original:'Emerico Lorca',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Regate aurora', 'Ángel de nieve', 'Gran Torbellino'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Invencibles en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1426.webp'
},
{
  id:'r1427', equipo:'Los Invencibles', nombre:'Raúl Parejo', original:'Emilio Luján',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Luna creciente', 'Jaula de piedra', 'Amago de tiro'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Invencibles en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1427.webp'
},
{
  id:'r1428', equipo:'Los Invencibles', nombre:'Marcos Canales', original:'Fabio Esteve',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Ecuación defensiva', 'Luna creciente', 'Escáner Ataque'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Invencibles en Inazuma Eleven Orion, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1428.webp'
},
{
  id:'r1429', equipo:'Los Invencibles', nombre:'Andrés Alonso', original:'Fernando Davino',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Balón de petróleo', 'Carga de Elefantes'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Invencibles en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1429.webp'
},
{
  id:'r1430', equipo:'Los Invencibles', nombre:'Dani Ramos', original:'Reinaldo Baraja',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:77,defensa:89,especial:86,
  hissatsu:['Engaño yoyó', 'Balón yo-yo', 'Robo veloz'],tipoTecnica:'defensa',
  desc:'Defensa de Los Invencibles en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1430.webp'
},
{
  id:'r1431', equipo:'Los Invencibles', nombre:'Miguel Hontiveros', original:'Rufino Ávalos',
  posicion:'Defensa', tipo:'Fuego',
  tiro:43,pase:79,defensa:91,especial:84,
  hissatsu:['Corte volcánico', 'Giro supremo'],tipoTecnica:'defensa',
  desc:'Defensa de Los Invencibles en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1431.webp'
},
{
  id:'r1432', equipo:'Los Invencibles', nombre:'Álvaro Meléndez', original:'Velasco Meléndez',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Tirachinas', 'Tiro Balista', 'Patada canguro'],tipoTecnica:'regate',
  desc:'Centrocampista de Los Invencibles en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1432.webp'
},
{
  id:'r1433', equipo:'Ángeles Caídos', nombre:'Carlam Buer', original:'Agalia Rept',
  posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:78,defensa:90,especial:87,
  hissatsu:['Gravitación', 'Corte Diabólico', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Ángeles Caídos en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1433.webp'
},
{
  id:'r1434', equipo:'Ángeles Caídos', nombre:'Dante Dusias', original:'Amdu Scias',
  posicion:'Defensa', tipo:'Montaña',
  tiro:54,pase:76,defensa:88,especial:85,
  hissatsu:['Engaño yoyó', 'Corte Diabólico', 'La fiebre del oro'],tipoTecnica:'defensa',
  desc:'Defensa de Ángeles Caídos en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1434.webp'
},
{
  id:'r1435', equipo:'Ángeles Caídos', nombre:'Aster Roth', original:'As Taroth',
  posicion:'Delantero', tipo:'Montaña',
  tiro:90,pase:74,defensa:37,especial:85,
  hissatsu:['Sapo ninja', 'Tormenta Dimensional', 'Remate dinosaurio'],tipoTecnica:'tiro',
  desc:'Delantero de Ángeles Caídos en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1435.webp'
},
{
  id:'r1436', equipo:'Ángeles Caídos', nombre:'Ian Qubus', original:'Asmo Deus',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Balón galgo', 'Corte Diabólico', 'Balón diabólico'],tipoTecnica:'regate',
  desc:'Centrocampista de Ángeles Caídos en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1436.webp'
},
{
  id:'r1437', equipo:'Ángeles Caídos', nombre:'Beel Zebub', original:'Beelze Bub',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:80,pase:89,defensa:74,especial:87,
  hissatsu:['Piroquinesis', 'Corte Diabólico', 'Rodillazos atómicos'],tipoTecnica:'regate',
  desc:'Centrocampista de Ángeles Caídos en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1437.webp'
},
{
  id:'r1438', equipo:'Ángeles Caídos', nombre:'Malik Sinn', original:'Belial Noze',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Piroquinesis', 'Mina terrestre', 'Tornado Venenoso'],tipoTecnica:'regate',
  desc:'Centrocampista de Ángeles Caídos en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1438.webp'
},
{
  id:'r1439', equipo:'Ángeles Caídos', nombre:'Mortam Malius', original:'Belphegor Inos',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:77,defensa:89,especial:86,
  hissatsu:['Barreno de fuego', 'Corte Volcánico', 'Cortafuegos'],tipoTecnica:'defensa',
  desc:'Defensa de Ángeles Caídos en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1439.webp'
},
{
  id:'r1440', equipo:'Ángeles Caídos', nombre:'Damon Gorgon', original:'Demogorgon Anno',
  posicion:'Defensa', tipo:'Viento',
  tiro:57,pase:77,defensa:89,especial:86,
  hissatsu:['Corte diabólico', 'Mega Terremoto', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Ángeles Caídos en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1440.webp'
},
{
  id:'r1441', equipo:'Ángeles Caídos', nombre:'Zagan Barbatos', original:'Gaap Redel',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Corte diabólico', 'Esferas luminosas', 'Flecha huracán'],tipoTecnica:'regate',
  desc:'Centrocampista de Ángeles Caídos en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1441.webp'
},
{
  id:'r1442', equipo:'Ángeles Caídos', nombre:'Lu Jiver', original:'Luci Fanos',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Barrido defensivo', 'Piroclástico', 'Amago de tiro'],tipoTecnica:'regate',
  desc:'Centrocampista de Ángeles Caídos en Inazuma Eleven Orion, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1442.webp'
},
{
  id:'r1443', equipo:'Ángeles Caídos', nombre:'Pazuza Ross', original:'Pazuzu Zaham',
  posicion:'Portero', tipo:'Fuego',
  tiro:32,pase:50,defensa:86,especial:85,
  hissatsu:['Portón del castillo', 'Agujero Blanco', 'Simún'],tipoTecnica:'portero',
  desc:'Portero de Ángeles Caídos en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1443.webp'
},
{
  id:'r1444', equipo:'Ángeles Caídos', nombre:'Serge', original:'Sar Gatanas',
  posicion:'Delantero', tipo:'Viento',
  tiro:93,pase:77,defensa:42,especial:84,
  hissatsu:['Remate dinosaurio', 'Balón diabólico', 'Tacón infernal'],tipoTecnica:'tiro',
  desc:'Delantero de Ángeles Caídos en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1444.webp'
},
{
  id:'r1445', equipo:'Ángeles Caídos', nombre:'Beryl', original:'Satan Gaul',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:85,pase:94,defensa:76,especial:92,
  hissatsu:['Esferas luminosas', 'Piroclástico'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Ángeles Caídos en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1445.webp'
},
{
  id:'r1446', equipo:'Star Unicorn', nombre:'Alex Hawke', original:'Alex Hawk',
  posicion:'Portero', tipo:'Montaña',
  tiro:35,pase:53,defensa:87,especial:86,
  hissatsu:['Golpes de luz', 'Espejismo', 'Remate del águila'],tipoTecnica:'portero',
  desc:'Portero de Star Unicorn en Inazuma Eleven Orion, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1446.webp'
},
{
  id:'r1447', equipo:'Star Unicorn', nombre:'Billy Dash', original:'Billy Rapid',
  posicion:'Portero', tipo:'Bosque',
  tiro:30,pase:56,defensa:88,especial:87,
  hissatsu:['Mano diabólica', 'Golpes de luz', 'Despeje cohete'],tipoTecnica:'portero',
  desc:'Portero de Star Unicorn en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1447.webp'
},
{
  id:'r1448', equipo:'Star Unicorn', nombre:'Bob Bobbins', original:'Bob Bobbins',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:78,defensa:90,especial:87,
  hissatsu:['Ataque cortante', 'Bola Falsa', 'Confusión'],tipoTecnica:'defensa',
  desc:'Defensa de Star Unicorn en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1448.webp'
},
{
  id:'r1449', equipo:'Star Unicorn', nombre:'Drake Dynamo', original:'Dyke Dynamo',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:77,defensa:89,especial:86,
  hissatsu:['Campo torbellino', 'Mega Terremoto', 'Zigzag de fuego'],tipoTecnica:'defensa',
  desc:'Defensa de Star Unicorn en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1449.webp'
},
{
  id:'r1450', equipo:'Star Unicorn', nombre:'Norbert Poindexter', original:'Eddie Howard',
  posicion:'Delantero', tipo:'Fuego',
  tiro:92,pase:76,defensa:39,especial:87,
  hissatsu:['Corte giratorio', 'Estrella fugaz', 'Tiro Giratorio'],tipoTecnica:'tiro',
  desc:'Delantero de Star Unicorn en Inazuma Eleven Orion, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1450.webp'
},
{
  id:'r1451', equipo:'Star Unicorn', nombre:'Gabriel Jax', original:'Michele Jacks',
  posicion:'Delantero', tipo:'Montaña',
  tiro:93,pase:77,defensa:40,especial:84,
  hissatsu:['Lluvia oscura', 'Tri-Pegaso', 'Ultra lunar'],tipoTecnica:'tiro',
  desc:'Delantero de Star Unicorn en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1451.webp'
},
{
  id:'r1452', equipo:'Star Unicorn', nombre:'Corey Washington', original:'Rob Parker',
  posicion:'Defensa', tipo:'Viento',
  tiro:44,pase:78,defensa:90,especial:87,
  hissatsu:['Bomba acrobática', 'Ataque cortante', 'Remate Misil'],tipoTecnica:'defensa',
  desc:'Defensa de Star Unicorn en Inazuma Eleven Orion, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1452.webp'
},
{
  id:'r1453', equipo:'Star Unicorn', nombre:'Petie Pooma', original:'Sammy Dempsey',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Zigzag explosivo', 'Ciclón doble', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Star Unicorn en Inazuma Eleven Orion, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1453.webp'
},
{
  id:'r1454', equipo:'Star Unicorn', nombre:'Shane Pierce', original:'Sean Pierce',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Mirada intimidante', 'Remate Pegaso', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Star Unicorn en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1454.webp'
},
{
  id:'r1455', equipo:'Star Unicorn', nombre:'Steve Woodmark', original:'Steve Woodmack',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Pared solitaria', 'Remate combinado', 'Ícaro'],tipoTecnica:'regate',
  desc:'Centrocampista de Star Unicorn en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1455.webp'
},
{
  id:'r1456', equipo:'Star Unicorn', nombre:'Ted Bryant', original:'Ted Bryan',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:79,defensa:91,especial:84,
  hissatsu:['Carga de elefantes', 'Baile de Llamas', 'Robo veloz'],tipoTecnica:'defensa',
  desc:'Defensa de Star Unicorn en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1456.webp'
},
{
  id:'r1457', equipo:'Star Unicorn', nombre:'Tony Strider', original:'Tony Stridas',
  posicion:'Defensa', tipo:'Fuego',
  tiro:42,pase:76,defensa:88,especial:85,
  hissatsu:['Estrella fugaz', 'Remate Misil', 'Barrido Defensivo'],tipoTecnica:'defensa',
  desc:'Defensa de Star Unicorn en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1457.webp'
},
{
  id:'r1458', equipo:'Ace Invaders', nombre:'Bigman', original:'Bigman',
  posicion:'Portero', tipo:'Bosque',
  tiro:30,pase:56,defensa:86,especial:85,
  hissatsu:['Aguijón', 'Constelación Estelar', 'Cuchilla Asesina'],tipoTecnica:'portero',
  desc:'Portero de Ace Invaders en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1458.webp'
},
{
  id:'r1459', equipo:'Ace Invaders', nombre:'Cobra', original:'Cobra',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:77,defensa:89,especial:82,
  hissatsu:['Carga de elefantes', 'Barajeo topo', 'Telaraña'],tipoTecnica:'defensa',
  desc:'Defensa de Ace Invaders en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1459.webp'
},
{
  id:'r1460', equipo:'Ace Invaders', nombre:'Moai', original:'Convoy',
  posicion:'Delantero', tipo:'Bosque',
  tiro:90,pase:74,defensa:43,especial:85,
  hissatsu:['Remate del águila', 'Remate Tarzán', 'Obstrucción eléctrica'],tipoTecnica:'tiro',
  desc:'Delantero de Ace Invaders en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1460.webp'
},
{
  id:'r1461', equipo:'Ace Invaders', nombre:'Scuba', original:'Diver',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:76,defensa:88,especial:85,
  hissatsu:['Gran torbellino', 'Bomba géiser', 'Bloqueo Ballena'],tipoTecnica:'defensa',
  desc:'Defensa de Ace Invaders en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1461.webp'
},
{
  id:'r1462', equipo:'Ace Invaders', nombre:'Charmer', original:'Gentleman',
  posicion:'Defensa', tipo:'Montaña',
  tiro:57,pase:77,defensa:89,especial:82,
  hissatsu:['Ataque cortante', 'Muro de Hierro', 'Ultra lunar'],tipoTecnica:'defensa',
  desc:'Defensa de Ace Invaders en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1462.webp'
},
{
  id:'r1463', equipo:'Ace Invaders', nombre:'Horn', original:'Horn',
  posicion:'Portero', tipo:'Bosque',
  tiro:27,pase:53,defensa:85,especial:84,
  hissatsu:['Mano celestial', 'Ciclón oscuro', 'Muralla Gigante'],tipoTecnica:'portero',
  desc:'Portero de Ace Invaders en Inazuma Eleven Orion, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1463.webp'
},
{
  id:'r1464', equipo:'Ace Invaders', nombre:'Hunter', original:'Hunter',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:74,defensa:86,especial:83,
  hissatsu:['Red de caza', 'Barajeo topo', 'Obstrucción eléctrica'],tipoTecnica:'defensa',
  desc:'Defensa de Ace Invaders en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1464.webp'
},
{
  id:'r1465', equipo:'Ace Invaders', nombre:'Switch', original:'Jack',
  posicion:'Delantero', tipo:'Montaña',
  tiro:89,pase:73,defensa:48,especial:84,
  hissatsu:['Remate dinosaurio', 'Bola Falsa', 'Bala de Cañón'],tipoTecnica:'tiro',
  desc:'Delantero de Ace Invaders en Inazuma Eleven Orion, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1465.webp'
},
{
  id:'r1466', equipo:'Ace Invaders', nombre:'Judge', original:'Judge',
  posicion:'Defensa', tipo:'Fuego',
  tiro:55,pase:75,defensa:87,especial:84,
  hissatsu:['Entrada rodante', 'Segadora', 'Arrollador'],tipoTecnica:'defensa',
  desc:'Defensa de Ace Invaders en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1466.webp'
},
{
  id:'r1467', equipo:'Ace Invaders', nombre:'Hellion', original:'Lion',
  posicion:'Delantero', tipo:'Montaña',
  tiro:88,pase:72,defensa:45,especial:83,
  hissatsu:['Espada de Odín', 'Remate del águila', 'Remate Tarzán'],tipoTecnica:'tiro',
  desc:'Delantero de Ace Invaders en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1467.webp'
},
{
  id:'r1468', equipo:'Ace Invaders', nombre:'Wizard', original:'Magician',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Truco de magia', 'Entrada rodante', 'Bomba saltarina'],tipoTecnica:'regate',
  desc:'Centrocampista de Ace Invaders en Inazuma Eleven Orion, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1468.webp'
},
{
  id:'r1469', equipo:'Ace Invaders', nombre:'Mop', original:'Shakey',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:79,pase:88,defensa:73,especial:86,
  hissatsu:['Truco de magia', 'Jungla profunda', 'Patín Aereo'],tipoTecnica:'regate',
  desc:'Centrocampista de Ace Invaders en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1469.webp'
},
{
  id:'r1470', equipo:'Ace Invaders', nombre:'Smokestack', original:'Smokey',
  posicion:'Defensa', tipo:'Viento',
  tiro:48,pase:76,defensa:88,especial:85,
  hissatsu:['Ataque cortante', 'Entrada rodante', 'Bomba Falsa'],tipoTecnica:'defensa',
  desc:'Defensa de Ace Invaders en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1470.webp'
},
{
  id:'r1471', equipo:'Ace Invaders', nombre:'Yoga', original:'Yoga',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:72,especial:88,
  hissatsu:['Remolino cortante', 'Truco de Magia', 'Cañonazo'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Ace Invaders en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1471.webp'
},
{
  id:'r1472', equipo:'Sambassadors', nombre:'Igaçu', original:'Daninho',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Avance flamígero', 'Ultra lunar', 'Armadillo Circense'],tipoTecnica:'regate',
  desc:'Centrocampista de Sambassadors en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1472.webp'
},
{
  id:'r1473', equipo:'Sambassadors', nombre:'Luís', original:'Lucian',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Regate espejismo', 'Cruz del sur'],tipoTecnica:'regate',
  desc:'Centrocampista de Sambassadors en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1473.webp'
},
{
  id:'r1474', equipo:'Sambassadors', nombre:'Gonçalo', original:'Macero',
  posicion:'Portero', tipo:'Fuego',
  tiro:39,pase:53,defensa:85,especial:84,
  hissatsu:['Despeje a presión', 'Bloqueo Doble', 'Parada de Espaguetis'],tipoTecnica:'portero',
  desc:'Portero de Sambassadors en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1474.webp'
},
{
  id:'r1475', equipo:'Sambassadors', nombre:'João', original:'Marcelo',
  posicion:'Defensa', tipo:'Viento',
  tiro:53,pase:75,defensa:87,especial:84,
  hissatsu:['Baile de Llamas', 'Ataque de la ballena'],tipoTecnica:'defensa',
  desc:'Defensa de Sambassadors en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1475.webp'
},
{
  id:'r1476', equipo:'Sambassadors', nombre:'Maceió', original:'Matheus',
  posicion:'Defensa', tipo:'Fuego',
  tiro:43,pase:75,defensa:87,especial:84,
  hissatsu:['Baile de llamas', 'Cruz del sur', 'Ultra lunar'],tipoTecnica:'defensa',
  desc:'Defensa de Sambassadors en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1476.webp'
},
{
  id:'r1477', equipo:'Sambassadors', nombre:'Rio', original:'Miguel',
  posicion:'Delantero', tipo:'Fuego',
  tiro:91,pase:75,defensa:38,especial:82,
  hissatsu:['Regate aurora', 'Tiro Cegador', 'Golpe de Samba'],tipoTecnica:'tiro',
  desc:'Delantero de Sambassadors en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1477.webp'
},
{
  id:'r1478', equipo:'Sambassadors', nombre:'Paulo', original:'Paulo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:73,especial:86,
  hissatsu:['Gravedad grave', 'Armadillo Circense'],tipoTecnica:'regate',
  desc:'Centrocampista de Sambassadors en Inazuma Eleven Orion, dorsal 17.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1478.webp'
},
{
  id:'r1479', equipo:'Sambassadors', nombre:'Belém', original:'Raymond',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:76,defensa:88,especial:85,
  hissatsu:['Ultra lunar', 'Ataque de la ballena'],tipoTecnica:'defensa',
  desc:'Defensa de Sambassadors en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1479.webp'
},
{
  id:'r1480', equipo:'Sambassadors', nombre:'Belo', original:'Renato',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Ultra lunar', 'Luz Cegadora', 'Baile del Carnaval'],tipoTecnica:'regate',
  desc:'Centrocampista de Sambassadors en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1480.webp'
},
{
  id:'r1481', equipo:'Sambassadors', nombre:'Bernardo', original:'Ricardo',
  posicion:'Defensa', tipo:'Bosque',
  tiro:44,pase:74,defensa:86,especial:83,
  hissatsu:['Baile de llamas', 'Cruz del sur', 'Flash de fotones'],tipoTecnica:'defensa',
  desc:'Defensa de Sambassadors en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1481.webp'
},
{
  id:'r1482', equipo:'Sambassadors', nombre:'Manaus', original:'Rolan',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Patín aéreo', 'Entrada Tormenta'],tipoTecnica:'regate',
  desc:'Centrocampista de Sambassadors en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1482.webp'
},
{
  id:'r1483', equipo:'Sambassadors', nombre:'André', original:'Samuel',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Patín aéreo', 'Entrada Tormenta'],tipoTecnica:'regate',
  desc:'Centrocampista de Sambassadors en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1483.webp'
},
{
  id:'r1484', equipo:'Fénix de Arabia', nombre:'Perry Al-Surah', original:'Andreas Bebo',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:70,defensa:41,especial:81,
  hissatsu:['Piroquinesis', 'Llamarada Atómica', 'Bomba saltarina'],tipoTecnica:'tiro',
  desc:'Delantero de Fénix de Arabia en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1484.webp'
},
{
  id:'r1485', equipo:'Fénix de Arabia', nombre:'Condor', original:'Condor Willy',
  posicion:'Delantero', tipo:'Viento',
  tiro:86,pase:70,defensa:35,especial:81,
  hissatsu:['Ataque de cóndor', 'Remate del águila'],tipoTecnica:'tiro',
  desc:'Delantero de Fénix de Arabia en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1485.webp'
},
{
  id:'r1486', equipo:'Fénix de Arabia', nombre:'Buzzard Al-Sahma', original:'Dorgan Butler',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['Esferas luminosas', 'Teleportación', 'Cortafuegos'],tipoTecnica:'regate',
  desc:'Centrocampista de Fénix de Arabia en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1486.webp'
},
{
  id:'r1487', equipo:'Fénix de Arabia', nombre:'Falcon', original:'Falcon Ali',
  posicion:'Portero', tipo:'Viento',
  tiro:23,pase:53,defensa:86,especial:85,
  hissatsu:['Puños voladores', 'Rotación inversa', 'Despeje de fuerza'],tipoTecnica:'portero',
  desc:'Portero y capitán de Fénix de Arabia en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1487.webp'
},
{
  id:'r1488', equipo:'Fénix de Arabia', nombre:'Osprey Al-Bahar', original:'Gala Magos',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:74,defensa:86,especial:83,
  hissatsu:['Muralla de Atlantis', 'Embestida', 'Matriz selladora'],tipoTecnica:'defensa',
  desc:'Defensa de Fénix de Arabia en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1488.webp'
},
{
  id:'r1489', equipo:'Fénix de Arabia', nombre:'Griffon Al-Qahir', original:'Ghaddar Ghana',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Amago de tiro', 'Baile de Llamas', 'Luz Cegadora'],tipoTecnica:'regate',
  desc:'Centrocampista de Fénix de Arabia en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1489.webp'
},
{
  id:'r1490', equipo:'Fénix de Arabia', nombre:'Shrike Al-Jazzar', original:'Hisoka Masoka',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['Pantalla ígnea', 'Avance flamígero', 'Gravedad grave'],tipoTecnica:'regate',
  desc:'Centrocampista de Fénix de Arabia en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1490.webp'
},
{
  id:'r1491', equipo:'Fénix de Arabia', nombre:'Hawke Al-Bazzar', original:'Hulk Laios',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Teleportación', 'Esferas luminosas', 'Gravedad grave'],tipoTecnica:'regate',
  desc:'Centrocampista de Fénix de Arabia en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1491.webp'
},
{
  id:'r1492', equipo:'Fénix de Arabia', nombre:'Merlin Al-Yaman', original:'Pecka Rheam',
  posicion:'Defensa', tipo:'Fuego',
  tiro:45,pase:73,defensa:85,especial:82,
  hissatsu:['Muralla de Atlantis', 'Zigzag de fuego', 'Cortafuegos'],tipoTecnica:'defensa',
  desc:'Defensa de Fénix de Arabia en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1492.webp'
},
{
  id:'r1493', equipo:'Fénix de Arabia', nombre:'Harris Al-Suhra', original:'Pedro Amida',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Esferas luminosas', 'Espejismo'],tipoTecnica:'regate',
  desc:'Centrocampista de Fénix de Arabia en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1493.webp'
},
{
  id:'r1494', equipo:'Fénix de Arabia', nombre:'Kestrel Al-Sahir', original:'Sami Luis',
  posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:75,defensa:87,especial:80,
  hissatsu:['Defensa propulsada', 'Robo fantástico', 'Equilibrismo'],tipoTecnica:'defensa',
  desc:'Defensa de Fénix de Arabia en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1494.webp'
},
{
  id:'r1495', equipo:'Fénix de Arabia', nombre:'Eagle Al-Suhra', original:'Samir Amida',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Teleportación', 'Espejismo'],tipoTecnica:'regate',
  desc:'Centrocampista de Fénix de Arabia en Inazuma Eleven Orion, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1495.webp'
},
{
  id:'r1496', equipo:'Fénix de Arabia', nombre:'Robin Al-Ahmar', original:'Silva Leol',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Esferas luminosas', 'Finta boomerang', 'Pantalla ígnea'],tipoTecnica:'regate',
  desc:'Centrocampista de Fénix de Arabia en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1496.webp'
},
{
  id:'r1497', equipo:'Red Bisons', nombre:'Baek Bull-wo', original:'Baek Shi-woo',
  posicion:'Delantero', tipo:'Fuego',
  tiro:87,pase:71,defensa:36,especial:82,
  hissatsu:['Embestida', 'Cuerno de Bisonte', 'Cataclismo Rojo'],tipoTecnica:'tiro',
  desc:'Delantero de Red Bisons en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1497.webp'
},
{
  id:'r1498', equipo:'Red Bisons', nombre:'Harh Bull-gull', original:'Ha Jung-pyo',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:72,defensa:84,especial:81,
  hissatsu:['Gran Sabio', 'Emboscada defensiva', 'Mega muro'],tipoTecnica:'defensa',
  desc:'Defensa de Red Bisons en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1498.webp'
},
{
  id:'r1499', equipo:'Red Bisons', nombre:'Ho Bull-tong', original:'Heo Eun-chang',
  posicion:'Delantero', tipo:'Montaña',
  tiro:86,pase:70,defensa:35,especial:81,
  hissatsu:['Embestida', 'Tiro Balista', 'Pantalla ígnea'],tipoTecnica:'tiro',
  desc:'Delantero de Red Bisons en Inazuma Eleven Orion, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1499.webp'
},
{
  id:'r1500', equipo:'Red Bisons', nombre:'Hwang Bull-gim', original:'Hwang Do-yoon',
  posicion:'Defensa', tipo:'Viento',
  tiro:54,pase:74,defensa:86,especial:83,
  hissatsu:['Ciclón', 'Entrada Tormenta', 'Pase doble'],tipoTecnica:'defensa',
  desc:'Defensa de Red Bisons en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1500.webp'
},
{
  id:'r1501', equipo:'Red Bisons', nombre:'Kim Bull-bit', original:'Kim Young-woo',
  posicion:'Defensa', tipo:'Viento',
  tiro:51,pase:75,defensa:87,especial:80,
  hissatsu:['Estela ígnea', 'Pase doble', 'Dúo magma'],tipoTecnica:'defensa',
  desc:'Defensa de Red Bisons en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1501.webp'
},
{
  id:'r1502', equipo:'Red Bisons', nombre:'Lee San-bull', original:'Lee Dong-hyuk',
  posicion:'Delantero', tipo:'Fuego',
  tiro:86,pase:70,defensa:43,especial:81,
  hissatsu:['Embestida', 'Mina terrestre', 'Cuerno de Bisonte'],tipoTecnica:'tiro',
  desc:'Delantero de Red Bisons en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1502.webp'
},
{
  id:'r1503', equipo:'Red Bisons', nombre:'Lee Bull-gae', original:'Lee Seung-jin',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Embestida', 'Tacón infernal', 'Chicle burbuja'],tipoTecnica:'regate',
  desc:'Centrocampista de Red Bisons en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1503.webp'
},
{
  id:'r1504', equipo:'Red Bisons', nombre:'Shin Bull-kot', original:'Park Ji-won',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Embestida', 'Piroclástico', 'Piroquinesis'],tipoTecnica:'regate',
  desc:'Centrocampista de Red Bisons en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1504.webp'
},
{
  id:'r1505', equipo:'Red Bisons', nombre:'Han Bull-dang', original:'Park Yu-hwan',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:73,defensa:85,especial:82,
  hissatsu:['Carga de elefantes', 'Embestida', 'Picadora'],tipoTecnica:'defensa',
  desc:'Defensa de Red Bisons en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1505.webp'
},
{
  id:'r1506', equipo:'Red Bisons', nombre:'Seok Tel-bull', original:'Seok Min-woo',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:90,defensa:72,especial:88,
  hissatsu:['Embestida', 'Entrada de llamas', 'Espejismo de balón'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Red Bisons en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1506.webp'
},
{
  id:'r1507', equipo:'Red Bisons', nombre:'Park', original:'Shin Rae-won',
  posicion:'Portero', tipo:'Fuego',
  tiro:33,pase:59,defensa:85,especial:80,
  hissatsu:['Rompetiros', 'Malla Letal', 'Rechace de fuego'],tipoTecnica:'portero',
  desc:'Portero de Red Bisons en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1507.webp'
},
{
  id:'r1508', equipo:'Red Bisons', nombre:'Son Bull-gong', original:'Sung Min-soo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['Embestida', 'Pantalla ígnea', 'Cuerno de Bisonte'],tipoTecnica:'regate',
  desc:'Centrocampista de Red Bisons en Inazuma Eleven Orion, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1508.webp'
},
{
  id:'r1509', equipo:'Red Bisons', nombre:'Suna Bey-bull', original:'Sung Seo-ah',
  posicion:'Defensa', tipo:'Bosque',
  tiro:44,pase:72,defensa:84,especial:81,
  hissatsu:['Corte volcánico', 'Dúo magma', 'Pantalla ígnea'],tipoTecnica:'defensa',
  desc:'Defensa de Red Bisons en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1509.webp'
},
{
  id:'r1510', equipo:'Red Bisons', nombre:'Yeon Bull-say', original:'Young Ji-hoon',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Pompa de chicle', 'Chicle burbuja', 'Remolino acuático'],tipoTecnica:'regate',
  desc:'Centrocampista de Red Bisons en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1510.webp'
},
{
  id:'r1511', equipo:'Eternal Dancers', nombre:'Bolero Salimov', original:'Alek Akbar',
  posicion:'Portero', tipo:'Bosque',
  tiro:22,pase:56,defensa:82,especial:81,
  hissatsu:['Parada fuerte', 'Cortina aurora', 'Barrera de cristal'],tipoTecnica:'portero',
  desc:'Portero de Eternal Dancers en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1511.webp'
},
{
  id:'r1512', equipo:'Eternal Dancers', nombre:'Dost Gales', original:'Dost Gales',
  posicion:'Delantero', tipo:'Viento',
  tiro:84,pase:68,defensa:41,especial:79,
  hissatsu:['Contra', 'Acorde difuso', 'Paso warp'],tipoTecnica:'tiro',
  desc:'Delantero de Eternal Dancers en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1512.webp'
},
{
  id:'r1513', equipo:'Eternal Dancers', nombre:'Jazzar Belikov', original:'Farhad Gilik',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Sello gigante', 'Carga de Elefantes', 'Guardia acrobática'],tipoTecnica:'regate',
  desc:'Centrocampista de Eternal Dancers en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1513.webp'
},
{
  id:'r1514', equipo:'Eternal Dancers', nombre:'Kizomba Zakharov', original:'Ibrohim Abi',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:72,defensa:84,especial:81,
  hissatsu:['Embestida', 'Carga de Elefantes', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Eternal Dancers en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1514.webp'
},
{
  id:'r1515', equipo:'Eternal Dancers', nombre:'Bhangra Makarov', original:'Keldi Rozel',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:75,pase:84,defensa:69,especial:82,
  hissatsu:['Embestida', 'Patín Aereo', 'Chicle burbuja'],tipoTecnica:'regate',
  desc:'Centrocampista de Eternal Dancers en Inazuma Eleven Orion, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1515.webp'
},
{
  id:'r1516', equipo:'Eternal Dancers', nombre:'Hulan Nazarova', original:'Kumush Ize',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:75,pase:84,defensa:69,especial:82,
  hissatsu:['Ignición', 'Salto Dimensional', 'Explosión confusa'],tipoTecnica:'regate',
  desc:'Centrocampista de Eternal Dancers en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1516.webp'
},
{
  id:'r1517', equipo:'Eternal Dancers', nombre:'Merengue Muratov', original:'Majid Azer',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:73,defensa:85,especial:78,
  hissatsu:['Carga de elefantes', 'Salto Dimensional', 'Explosión confusa'],tipoTecnica:'defensa',
  desc:'Defensa de Eternal Dancers en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1517.webp'
},
{
  id:'r1518', equipo:'Eternal Dancers', nombre:'Limbo Zakharov', original:'Mo\'habbot Zark',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Sello gigante', 'Carga de Elefantes', 'Pase doble'],tipoTecnica:'regate',
  desc:'Centrocampista de Eternal Dancers en Inazuma Eleven Orion, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1518.webp'
},
{
  id:'r1519', equipo:'Eternal Dancers', nombre:'Rumba Mansurov', original:'Muhammad Hawk',
  posicion:'Defensa', tipo:'Fuego',
  tiro:45,pase:73,defensa:85,especial:78,
  hissatsu:['Embestida', 'Carga de Elefantes', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Eternal Dancers en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1519.webp'
},
{
  id:'r1520', equipo:'Eternal Dancers', nombre:'Cancan Popov', original:'Norkul Bugen',
  posicion:'Delantero', tipo:'Bosque',
  tiro:86,pase:70,defensa:41,especial:81,
  hissatsu:['Patín aéreo', 'Poder parkour', 'Chicle burbuja'],tipoTecnica:'tiro',
  desc:'Delantero de Eternal Dancers en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1520.webp'
},
{
  id:'r1521', equipo:'Eternal Dancers', nombre:'Samba Sokolov', original:'Onaxon Ims',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:68,especial:84,
  hissatsu:['Regate supersónico', 'Acorde difuso', 'Paso warp'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Eternal Dancers en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1521.webp'
},
{
  id:'r1522', equipo:'Eternal Dancers', nombre:'Polkan Ismailov', original:'Sarybek Nahar',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Sello gigante', 'Carga de Elefantes', 'Avance flamígero'],tipoTecnica:'regate',
  desc:'Centrocampista de Eternal Dancers en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1522.webp'
},
{
  id:'r1523', equipo:'Eternal Dancers', nombre:'Chacha Goncharov', original:'Zafar Gin',
  posicion:'Defensa', tipo:'Viento',
  tiro:52,pase:70,defensa:82,especial:79,
  hissatsu:['Salto dimensional', 'Danza del viento', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Eternal Dancers en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1523.webp'
},
{
  id:'r1524', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'Mars Hung', original:'Chao Mao',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Patada canguro', 'Dragón ascendente', 'Jaula de piedra'],tipoTecnica:'regate',
  desc:'Centrocampista de Gatos Estelares en Inazuma Eleven Orion, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1524.webp'
},
{
  id:'r1525', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'David Liang', original:'Che Lin',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Voltereta circense', 'Espejismo', 'Equilibrismo'],tipoTecnica:'regate',
  desc:'Centrocampista de Gatos Estelares en Inazuma Eleven Orion, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1525.webp'
},
{
  id:'r1526', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'Gordon Siu', original:'Chi Chinsu',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:70,defensa:82,especial:79,
  hissatsu:['Ciclón', 'Dragón ascendente', 'Voltereta Círcense'],tipoTecnica:'defensa',
  desc:'Defensa de Gatos Estelares en Inazuma Eleven Orion, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1526.webp'
},
{
  id:'r1527', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'Bruce Lau', original:'Kung Fuche',
  posicion:'Portero', tipo:'Fuego',
  tiro:32,pase:50,defensa:80,especial:79,
  hissatsu:['Parada fuerte', 'Lanzallamas', 'Manos liberadas'],tipoTecnica:'portero',
  desc:'Portero de Gatos Estelares en Inazuma Eleven Orion, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1527.webp'
},
{
  id:'r1528', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'Cindy Fong', original:'Tao Lu',
  posicion:'Defensa', tipo:'Fuego',
  tiro:53,pase:71,defensa:83,especial:80,
  hissatsu:['Baile de llamas', 'Fiesta floral', 'Entrada rodante'],tipoTecnica:'defensa',
  desc:'Defensa de Gatos Estelares en Inazuma Eleven Orion, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1528.webp'
},
{
  id:'r1529', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'Michelle Luo', original:'Xiao Lau',
  posicion:'Defensa', tipo:'Montaña',
  tiro:57,pase:71,defensa:83,especial:80,
  hissatsu:['Baile de llamas', 'Olor embriagador', 'Voltereta Círcense'],tipoTecnica:'defensa',
  desc:'Defensa de Gatos Estelares en Inazuma Eleven Orion, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1529.webp'
},
{
  id:'r1530', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'Stephen Chang', original:'Xiu Chuna',
  posicion:'Delantero', tipo:'Bosque',
  tiro:85,pase:69,defensa:36,especial:80,
  hissatsu:['Cabezazo kung fu', 'Danza del viento', 'Combate kung fu'],tipoTecnica:'tiro',
  desc:'Delantero de Gatos Estelares en Inazuma Eleven Orion, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1530.webp'
},
{
  id:'r1531', equipo:'Gatos Estelares', equiposExtra:['Acróbatas Vengadores'], nombre:'Jackie Tan', original:'Zhou Xing',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:70,especial:86,
  hissatsu:['Guardia acrobática', 'Tiro valiente', 'Rueda infernal'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Gatos Estelares en Inazuma Eleven Orion, dorsal 8.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1531.webp'
},
{
  id:'r1532', equipo:'Acróbatas Vengadores', nombre:'Sammo Tong', original:'Min Yingqi',
  posicion:'Defensa', tipo:'Fuego',
  tiro:49,pase:69,defensa:81,especial:78,
  hissatsu:['Muralla de Atlantis', 'Mega Terremoto', 'A todo vapor'],tipoTecnica:'defensa',
  desc:'Defensa de Acróbatas Vengadores en Inazuma Eleven Orion, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1532.webp'
},
{
  id:'r1533', equipo:'Acróbatas Vengadores', nombre:'Donnie Yang', original:'Tan Tanmin',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Ataque de garza', 'Espejismo', 'Tacón infernal'],tipoTecnica:'regate',
  desc:'Centrocampista de Acróbatas Vengadores en Inazuma Eleven Orion, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1533.webp'
},
{
  id:'r1534', equipo:'Acróbatas Vengadores', nombre:'Jet Long', original:'Wan Tanmeo',
  posicion:'Delantero', tipo:'Fuego',
  tiro:84,pase:68,defensa:45,especial:79,
  hissatsu:['Tiro pirueta', 'Rueda infernal', 'Avance flamígero'],tipoTecnica:'tiro',
  desc:'Delantero de Acróbatas Vengadores en Inazuma Eleven Orion, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1534.webp'
},
{
  id:'r1535', equipo:'Acróbatas Vengadores', nombre:'Bolo Cheung', original:'Wu Longchi',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Gran torbellino', 'Escudo corporal', 'Rueda infernal'],tipoTecnica:'regate',
  desc:'Centrocampista de Acróbatas Vengadores en Inazuma Eleven Orion, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1535.webp'
},
// Equipos de Inazuma Eleven: Victory Road, datos de la wiki de Inazuma Eleven
{
  id:'r1536', equipo:'Campeones Raimon', nombre:'Matilda Shadebough', original:'Sigdo Mama',
  posicion:'Portero', tipo:'Montaña',
  tiro:28,pase:50,defensa:79,especial:78,
  hissatsu:['Abrazo divino', 'Parada Celestial', 'Barrera de Gaia'],tipoTecnica:'portero',
  desc:'Portero de Campeones Raimon en Inazuma Eleven: Victory Road, dorsal 20.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1536.webp'
},
{
  id:'r1537', equipo:'Twinford', nombre:'Ronan Strongwood', original:'Gou Toshio',
  posicion:'Delantero', tipo:'Montaña',
  tiro:64,pase:48,defensa:38,especial:55,
  hissatsu:['A todo vapor', 'Disparo con Rebotes', 'Bola de Fango'],tipoTecnica:'tiro',
  desc:'Delantero de Twinford en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1537.webp'
},
{
  id:'r1538', equipo:'Twinford', nombre:'Orin Wildwood', original:'Ino Yatarou',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:54,pase:63,defensa:48,especial:57,
  hissatsu:['Regate topo', 'Disparo con Rebotes', 'Regate múltiple'],tipoTecnica:'regate',
  desc:'Centrocampista de Twinford en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1538.webp'
},
{
  id:'r1539', equipo:'Twinford', nombre:'Lachlan Hartwood', original:'Kabamoto Yasunobu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:51,pase:60,defensa:45,especial:58,
  hissatsu:['Pisotón de sumo', 'Súper pisotón de sumo', 'Gran seísmo'],tipoTecnica:'regate',
  desc:'Centrocampista de Twinford en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1539.webp'
},
{
  id:'r1540', equipo:'Twinford', nombre:'Nathaniel Whitewood', original:'Koba Emiko',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:51,pase:60,defensa:45,especial:58,
  hissatsu:['Giro bobina', 'Ultra lunar', 'Robo veloz'],tipoTecnica:'regate',
  desc:'Centrocampista de Twinford en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1540.webp'
},
{
  id:'r1541', equipo:'Twinford', nombre:'Alden Songwood', original:'Kubashira Kensuke',
  posicion:'Portero', tipo:'Fuego',
  tiro:22,pase:56,defensa:59,especial:58,
  hissatsu:['Despeje de leñador', 'Despeje de fuerza', 'Fénix'],tipoTecnica:'portero',
  desc:'Portero de Twinford en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1541.webp'
},
{
  id:'r1542', equipo:'Twinford', nombre:'Lila Glosswood', original:'Makita Kazuko',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:49,defensa:61,especial:58,
  hissatsu:['Corte volcánico', 'Pared solitaria', 'Flash de fotones'],tipoTecnica:'defensa',
  desc:'Defensa de Twinford en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1542.webp'
},
{
  id:'r1543', equipo:'Twinford', nombre:'Rowland Brightwood', original:'Mondo Kanta',
  posicion:'Defensa', tipo:'Bosque',
  tiro:52,pase:47,defensa:59,especial:56,
  hissatsu:['Robo veloz', 'Ataque de las sombras', 'Defensa múltiple'],tipoTecnica:'defensa',
  desc:'Defensa de Twinford en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1543.webp'
},
{
  id:'r1544', equipo:'Twinford', nombre:'Calvin Sixwood', original:'Mutsumi Hideo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:52,pase:61,defensa:46,especial:59,
  hissatsu:['Confusión', 'Guardia acrobática', 'Tiro Balista'],tipoTecnica:'regate',
  desc:'Centrocampista de Twinford en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1544.webp'
},
{
  id:'r1545', equipo:'Twinford', nombre:'Emory Plainwood', original:'Naoie Masaya',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:49,defensa:61,especial:58,
  hissatsu:['Mirada ladrona', 'Espejismo', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Defensa de Twinford en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1545.webp'
},
{
  id:'r1546', equipo:'Twinford', nombre:'Maris Hollowwood', original:'Omotedani Sonoko',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:52,pase:61,defensa:46,especial:59,
  hissatsu:['Corte volcánico', 'Tiro Cegador', 'Bola Falsa'],tipoTecnica:'regate',
  desc:'Centrocampista de Twinford en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1546.webp'
},
{
  id:'r1547', equipo:'Twinford', nombre:'Hobie Chartwood', original:'Oyobe Masao',
  posicion:'Portero', tipo:'Montaña',
  tiro:21,pase:59,defensa:60,especial:55,
  hissatsu:['Parada fuerte', 'Despeje de leñador', 'Muralla Gigante'],tipoTecnica:'portero',
  desc:'Portero de Twinford en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1547.webp'
},
{
  id:'r1548', equipo:'Twinford', nombre:'Asher Norwood', original:'Shizukawa Kazuo',
  posicion:'Delantero', tipo:'Viento',
  tiro:64,pase:48,defensa:46,especial:55,
  hissatsu:['Tornado inverso', 'Danza del viento', 'Flecha Divina'],tipoTecnica:'tiro',
  desc:'Delantero de Twinford en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1548.webp'
},
{
  id:'r1549', equipo:'Twinford', nombre:'Iris Nightwood', original:'Uwa Taeko',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:52,pase:61,defensa:46,especial:59,
  hissatsu:['Robo veloz', 'Ataque de las sombras', 'Pared solitaria'],tipoTecnica:'defensa',
  desc:'Centrocampista de Twinford en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1549.webp'
},
{
  id:'r1550', equipo:'Twinford', nombre:'Tristan Brookwood', original:'Yamame Yukio',
  posicion:'Defensa', tipo:'Viento',
  tiro:53,pase:50,defensa:62,especial:55,
  hissatsu:['Remolino acuático', 'Corte Giratorio', 'Regate Topo'],tipoTecnica:'defensa',
  desc:'Defensa de Twinford en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1550.webp'
},
{
  id:'r1551', equipo:'Twinford', nombre:'Vearn Dashwood', original:'Yomogi Kenta',
  posicion:'Delantero', tipo:'Montaña',
  tiro:62,pase:46,defensa:40,especial:57,
  hissatsu:['Pared solitaria', 'Tiro Cegador', 'Remate del Tigre'],tipoTecnica:'tiro',
  desc:'Delantero de Twinford en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1551.webp'
},
{
  id:'r1552', equipo:'Twinford', nombre:'Lydia Trailwood', original:'Yoyobi Yae',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:51,pase:60,defensa:45,especial:58,
  hissatsu:['Guardia acrobática', 'Pasos aéreos', 'Superbalón rodante'],tipoTecnica:'regate',
  desc:'Centrocampista de Twinford en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1552.webp'
},
{
  id:'r1553', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Chase Winthrop', original:'Hohira Ayumu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['Corte giratorio', 'Remate Misil', 'Ataque cortante'],tipoTecnica:'defensa',
  desc:'Centrocampista de Northbright en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1553.webp'
},
{
  id:'r1554', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Milo Rankin', original:'Jinnai Gohei',
  posicion:'Portero', tipo:'Montaña',
  tiro:27,pase:53,defensa:67,especial:66,
  hissatsu:['Duna gravitacional', 'Centro de Gravedad', 'Despeje cohete'],tipoTecnica:'portero',
  desc:'Portero de Northbright en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1554.webp'
},
{
  id:'r1555', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Sentry Scarborough', original:'Jouhekidou Sanpei',
  posicion:'Defensa', tipo:'Montaña',
  tiro:41,pase:59,defensa:71,especial:64,
  hissatsu:['Mega terremoto', 'Muralla de Atlantis', 'Muro de Hierro'],tipoTecnica:'defensa',
  desc:'Defensa de Northbright en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1555.webp'
},
{
  id:'r1556', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Hawky Savard', original:'Kishibe Towa',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['Gran resplandor', 'Avance chispeante', 'Chut Congelante'],tipoTecnica:'regate',
  desc:'Centrocampista de Northbright en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1556.webp'
},
{
  id:'r1557', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Armin Marshall', original:'Mutou Gunpei',
  posicion:'Portero', tipo:'Fuego',
  tiro:30,pase:56,defensa:68,especial:67,
  hissatsu:['Despeje cohete', 'Escudo de Fuerza Total', 'Despeje de fuerza'],tipoTecnica:'portero',
  desc:'Portero de Northbright en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1557.webp'
},
{
  id:'r1558', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Conley Quiver', original:'Sanbonya Motonari',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:58,defensa:70,especial:67,
  hissatsu:['Fórmula matemática', 'Flecha huracán', 'Robo veloz'],tipoTecnica:'regate',
  desc:'Defensa de Northbright en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1558.webp'
},
{
  id:'r1559', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Everett Shipman', original:'Sensha Susumu',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['Gran resplandor', 'Gravitación', 'Segadora'],tipoTecnica:'defensa',
  desc:'Centrocampista de Northbright en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1559.webp'
},
{
  id:'r1560', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Ivan Mercer', original:'Shinano Masashi',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['Gran resplandor', 'Remate Misil', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Northbright en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1560.webp'
},
{
  id:'r1561', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Taliesin Greenhunt', original:'Shinkari Eito',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['Gran resplandor', 'Bola Falsa', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Northbright en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1561.webp'
},
{
  id:'r1562', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Nikas Himmelstein', original:'Soramiya Sei',
  posicion:'Delantero', tipo:'Fuego',
  tiro:75,pase:56,defensa:37,especial:70,
  hissatsu:['Espada solar', 'Tornado de Fuego', 'Gran resplandor'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Northbright en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1562.webp'
},
{
  id:'r1563', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Denzel Harvest', original:'Taihou Ryuusuke',
  posicion:'Delantero', tipo:'Fuego',
  tiro:73,pase:57,defensa:44,especial:64,
  hissatsu:['Tiro fantasma', 'Esferas luminosas', 'Disparo con Rebotes'],tipoTecnica:'tiro',
  desc:'Delantero de Northbright en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1563.webp'
},
{
  id:'r1564', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Erdem Barath', original:'Tomobe Jin',
  posicion:'Delantero', tipo:'Bosque',
  tiro:71,pase:55,defensa:46,especial:66,
  hissatsu:['Tiro cegador', 'Flecha Divina', 'Gran resplandor'],tipoTecnica:'tiro',
  desc:'Delantero de Northbright en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1564.webp'
},
{
  id:'r1565', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Bodhi Field', original:'Tonda Mannen',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:63,pase:72,defensa:57,especial:66,
  hissatsu:['Fórmula matemática', 'Pared solitaria', 'Cabezazo Kung Fu'],tipoTecnica:'regate',
  desc:'Centrocampista de Northbright en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1565.webp'
},
{
  id:'r1566', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Peake Fletcher', original:'Yagura Takajin',
  posicion:'Defensa', tipo:'Bosque',
  tiro:41,pase:59,defensa:71,especial:64,
  hissatsu:['Fórmula matemática', 'Tacón infernal', 'Ataque de Cóndor'],tipoTecnica:'defensa',
  desc:'Defensa de Northbright en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1566.webp'
},
{
  id:'r1567', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Autry Rogers', original:'Yarisaki Yuuji',
  posicion:'Defensa', tipo:'Fuego',
  tiro:55,pase:57,defensa:69,especial:66,
  hissatsu:['Gran resplandor', 'Zigzag de fuego', 'Superaceleración'],tipoTecnica:'regate',
  desc:'Defensa de Northbright en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1567.webp'
},
{
  id:'r1568', equipo:'Northbright', equiposExtra:['South Cirrus'], nombre:'Hugh Pronghorn', original:'Yasha Mitsutoshi',
  posicion:'Delantero', tipo:'Viento',
  tiro:71,pase:55,defensa:42,especial:66,
  hissatsu:['Pase cruzado', 'Tiro Balista', 'Fórmula matemática'],tipoTecnica:'regate',
  desc:'Delantero de Northbright en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1568.webp'
},
{
  id:'r1569', equipo:'Royal Academy VR', nombre:'Vex Frieden', original:'Anza Naoichi',
  posicion:'Defensa', tipo:'Fuego',
  tiro:43,pase:73,defensa:85,especial:82,
  hissatsu:['Barrido defensivo', 'Arrollador 3/Coz 3', 'Campo de fuerza'],tipoTecnica:'defensa',
  desc:'Defensa de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1569.webp'
},
{
  id:'r1570', equipo:'Royal Academy VR', nombre:'Hudson Headland', original:'Erusaki Eichi',
  posicion:'Defensa', tipo:'Viento',
  tiro:42,pase:72,defensa:84,especial:81,
  hissatsu:['Ciclón', 'Cruce explosivo', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1570.webp'
},
{
  id:'r1571', equipo:'Royal Academy VR', nombre:'Syd Faircrest', original:'Homura Eisuke',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:72,especial:88,
  hissatsu:['Luz del mariscal', 'Remate combinado f', 'Cruce explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1571.webp'
},
{
  id:'r1572', equipo:'Royal Academy VR', nombre:'Ciel Natcherall', original:'Honnouji Nemi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['Espejismo de balón', 'Triangulo letal', 'Mirada ladrona'],tipoTecnica:'regate',
  desc:'Centrocampista de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1572.webp'
},
{
  id:'r1573', equipo:'Royal Academy VR', nombre:'Ophelia Ennercourt', original:'Horiuchi Honoka',
  posicion:'Delantero', tipo:'Bosque',
  tiro:89,pase:73,defensa:42,especial:80,
  hissatsu:['Balón diabólico', 'Pingüino emperador n.º 3', 'Campo de fuerza'],tipoTecnica:'tiro',
  desc:'Delantero de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1573.webp'
},
{
  id:'r1574', equipo:'Royal Academy VR', nombre:'Kyo Seestar', original:'Hoshimizawa Kyou',
  posicion:'Delantero', tipo:'Viento',
  tiro:88,pase:72,defensa:35,especial:83,
  hissatsu:['Desfile de pingüinos', 'Pingüino emperador 7', 'Lluvia de Meteoros'],tipoTecnica:'regate',
  desc:'Delantero de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1574.webp'
},
{
  id:'r1575', equipo:'Royal Academy VR', nombre:'Ruelle Neurivieu', original:'Inobe Kiko',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:75,defensa:87,especial:80,
  hissatsu:['Barrido defensivo', 'Gran Torbellino', 'Baile de mariposas'],tipoTecnica:'defensa',
  desc:'Defensa de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1575.webp'
},
{
  id:'r1576', equipo:'Royal Academy VR', nombre:'Ashlan Panoptos', original:'Jinno Ashley',
  posicion:'Portero', tipo:'Montaña',
  tiro:38,pase:56,defensa:84,especial:83,
  hissatsu:['Eclispe lunar', 'Escudo de Fuerza Total', 'Despeje de fuerza'],tipoTecnica:'portero',
  desc:'Portero de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1576.webp'
},
{
  id:'r1577', equipo:'Royal Academy VR', nombre:'Arran Realis', original:'Kanae Shana',
  posicion:'Defensa', tipo:'Fuego',
  tiro:49,pase:73,defensa:85,especial:82,
  hissatsu:['Barrido defensivo', 'Barreno de fuego', 'Flecha de cupido'],tipoTecnica:'defensa',
  desc:'Defensa de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1577.webp'
},
{
  id:'r1578', equipo:'Royal Academy VR', nombre:'Asten Royds', original:'Meteo Kirameki',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:75,defensa:87,especial:80,
  hissatsu:['Terremoto', 'Emboscada defensiva', 'Lluvia de Meteoros'],tipoTecnica:'defensa',
  desc:'Defensa de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1578.webp'
},
{
  id:'r1579', equipo:'Royal Academy VR', nombre:'Solan Brightmoor', original:'Motoyashiki Kuuki',
  posicion:'Delantero', tipo:'Bosque',
  tiro:88,pase:72,defensa:47,especial:83,
  hissatsu:['Luz del mariscal', 'Triángulo Letal 2', 'Picadora'],tipoTecnica:'tiro',
  desc:'Delantero de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1579.webp'
},
{
  id:'r1580', equipo:'Royal Academy VR', nombre:'Kaien Spiradawn', original:'Reidou Kaiya',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:71,defensa:48,especial:82,
  hissatsu:['Luz del mariscal', 'Pingüino emperador 7', 'Barrido Defensivo'],tipoTecnica:'tiro',
  desc:'Delantero de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1580.webp'
},
{
  id:'r1581', equipo:'Royal Academy VR', nombre:'Leticia Legatus', original:'Sendou Marin',
  posicion:'Portero', tipo:'Fuego',
  tiro:33,pase:59,defensa:85,especial:80,
  hissatsu:['Eclispe lunar', 'Escudo de Fuerza Total', 'Cruce explosivo'],tipoTecnica:'portero',
  desc:'Portero de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1581.webp'
},
{
  id:'r1582', equipo:'Royal Academy VR', nombre:'Riggs Fornstrut', original:'Tetsubashira Dousuke',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['El fuerte', 'A todo vapor', 'Gran seísmo'],tipoTecnica:'regate',
  desc:'Centrocampista de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1582.webp'
},
{
  id:'r1583', equipo:'Royal Academy VR', nombre:'Theon Stillcliffe', original:'Tonosaki Theo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:78,pase:87,defensa:72,especial:85,
  hissatsu:['Entrada de llamas', 'Bomba saltarina', 'Lanzallamas'],tipoTecnica:'regate',
  desc:'Centrocampista de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1583.webp'
},
{
  id:'r1584', equipo:'Royal Academy VR', nombre:'Lenox Grinder', original:'Yozakura Shishio',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:73,defensa:38,especial:80,
  hissatsu:['Remate combinado', 'Chut de los 100 toques', 'Espejismo de balón'],tipoTecnica:'tiro',
  desc:'Delantero de Royal Academy VR en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1584.webp'
},
{
  id:'r1585', equipo:'Solaria-Zeus', nombre:'Atol Lasalle', original:'Atora Suuri',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:83,pase:92,defensa:77,especial:86,
  hissatsu:['Cruce explosivo', 'Balon Angelical', 'Viento celestial'],tipoTecnica:'defensa',
  desc:'Centrocampista de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1585.webp'
},
{
  id:'r1586', equipo:'Solaria-Zeus', nombre:'Garrick Loventhal', original:'Enoguchi Aijirou',
  posicion:'Defensa', tipo:'Fuego',
  tiro:43,pase:79,defensa:91,especial:84,
  hissatsu:['Subida a los cielos', 'Hora Celestial', 'Niebla Mística'],tipoTecnica:'defensa',
  desc:'Defensa de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1586.webp'
},
{
  id:'r1587', equipo:'Solaria-Zeus', nombre:'Sampa Eonius', original:'Haie Kuon',
  posicion:'Defensa', tipo:'Montaña',
  tiro:40,pase:76,defensa:88,especial:85,
  hissatsu:['Entrada tormenta', 'Campo minado', 'Flecha Divina'],tipoTecnica:'defensa',
  desc:'Defensa de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1587.webp'
},
{
  id:'r1588', equipo:'Solaria-Zeus', nombre:'Harald Monet', original:'Harutani Moa',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Himno de atenea', 'Cometa legendario', 'Regate Aurora'],tipoTecnica:'tiro',
  desc:'Centrocampista de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1588.webp'
},
{
  id:'r1589', equipo:'Solaria-Zeus', nombre:'Cate Heckel', original:'Hekate Meika',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Flecha divina', 'Lluvia de Meteoros', 'Cruce explosivo'],tipoTecnica:'tiro',
  desc:'Centrocampista de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1589.webp'
},
{
  id:'r1590', equipo:'Solaria-Zeus', nombre:'Riza Nagivar', original:'Izana Giyuu',
  posicion:'Delantero', tipo:'Viento',
  tiro:92,pase:76,defensa:35,especial:87,
  hissatsu:['Caída planetaria', 'Hora Celestial', 'Peces Voladores'],tipoTecnica:'regate',
  desc:'Delantero de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1590.webp'
},
{
  id:'r1591', equipo:'Solaria-Zeus', nombre:'Orisa Namir', original:'Izana Mitsuji',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:80,pase:89,defensa:74,especial:87,
  hissatsu:['Entrada de llamas', 'Entrada Tormenta', 'Remate Celestial'],tipoTecnica:'defensa',
  desc:'Centrocampista de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1591.webp'
},
{
  id:'r1592', equipo:'Solaria-Zeus', nombre:'Kazimir Stormblade', original:'Mikazuchi Jinya',
  posicion:'Delantero', tipo:'Viento',
  tiro:92,pase:76,defensa:37,especial:87,
  hissatsu:['Golpe de vacío', 'Espada de Odín', 'Esferas luminosas'],tipoTecnica:'regate',
  desc:'Delantero de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1592.webp'
},
{
  id:'r1593', equipo:'Solaria-Zeus', nombre:'Iskandar Tarusian', original:'Otaruda Rousuke',
  posicion:'Portero', tipo:'Montaña',
  tiro:32,pase:50,defensa:86,especial:85,
  hissatsu:['Muralla Gigante', 'Muralla tsunami', 'Despeje de leñador'],tipoTecnica:'portero',
  desc:'Portero de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1593.webp'
},
{
  id:'r1594', equipo:'Solaria-Zeus', nombre:'Patrie Ambrosia', original:'Patry Ambrosia',
  posicion:'Defensa', tipo:'Bosque',
  tiro:40,pase:78,defensa:90,especial:87,
  hissatsu:['Torre inexpugnable', 'Subida a los cielos', 'Brisa Encabritada'],tipoTecnica:'regate',
  desc:'Defensa de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1594.webp'
},
{
  id:'r1595', equipo:'Solaria-Zeus', nombre:'Garci Stormdale', original:'Susano Ouji',
  posicion:'Portero', tipo:'Montaña',
  tiro:24,pase:50,defensa:86,especial:85,
  hissatsu:['Mano celestial', 'Parada Celestial', 'Muralla Gigante'],tipoTecnica:'portero',
  desc:'Portero de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1595.webp'
},
{
  id:'r1596', equipo:'Solaria-Zeus', nombre:'Burke Forzane', original:'Tajikarao Iwafumi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:76,defensa:88,especial:85,
  hissatsu:['Mega terremoto', 'Torre perfecta', 'Jaula de piedra'],tipoTecnica:'defensa',
  desc:'Defensa de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1596.webp'
},
{
  id:'r1597', equipo:'Solaria-Zeus', nombre:'Thaddeus Bellefax', original:'Teita Tanji',
  posicion:'Delantero', tipo:'Bosque',
  tiro:96,pase:77,defensa:48,especial:87,
  hissatsu:['Hora celestial', 'Disparo sagrado', 'Sabiduría Divina'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1597.webp'
},
{
  id:'r1598', equipo:'Solaria-Zeus', nombre:'Revea Ristair', original:'Uzukami Uzume',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:82,pase:91,defensa:76,especial:89,
  hissatsu:['Campo torbellino', 'Ícaro', 'Himno de atenea'],tipoTecnica:'regate',
  desc:'Centrocampista de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1598.webp'
},
{
  id:'r1599', equipo:'Solaria-Zeus', nombre:'Kenard Montemar', original:'Yamatsumi Kenou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:76,defensa:88,especial:85,
  hissatsu:['La montaña', 'Muralla de Atlantis', 'Segadora'],tipoTecnica:'tiro',
  desc:'Defensa de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1599.webp'
},
{
  id:'r1600', equipo:'Solaria-Zeus', nombre:'Ciro Zealon', original:'Zerosu Retsushi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:88,
  hissatsu:['Remate celestial', 'Danza del viento', 'Entrada de llamas'],tipoTecnica:'defensa',
  desc:'Centrocampista de Solaria-Zeus en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1600.webp'
},
{
  id:'r1601', equipo:'Academia IA', nombre:'Cognus Sention', original:'Amata Kiyohito',
  posicion:'Defensa', tipo:'Viento',
  tiro:56,pase:76,defensa:88,especial:85,
  hissatsu:['Entrada huracán', 'Danza del viento', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1601.webp'
},
{
  id:'r1602', equipo:'Academia IA', nombre:'Nettie Neuralyn', original:'Anjou Kazoe',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:77,defensa:89,especial:82,
  hissatsu:['Mirada ladrona', 'Zona de seguridad', 'Mirada al futuro'],tipoTecnica:'defensa',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1602.webp'
},
{
  id:'r1603', equipo:'Academia IA', nombre:'Bren Techner', original:'Enzan Suushi',
  posicion:'Portero', tipo:'Montaña',
  tiro:27,pase:53,defensa:85,especial:84,
  hissatsu:['Campo de fuerza defensivo', 'Agujero de gusano', 'Escudo de Fuerza Total'],tipoTecnica:'portero',
  desc:'Portero de Academia IA en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1603.webp'
},
{
  id:'r1604', equipo:'Academia IA', nombre:'Chayce Golana', original:'Fumikage Chino',
  posicion:'Defensa', tipo:'Bosque',
  tiro:42,pase:74,defensa:86,especial:83,
  hissatsu:['Truco balonazo', 'Regate espejismo', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1604.webp'
},
{
  id:'r1605', equipo:'Academia IA', nombre:'Reubel Kauntless', original:'Hakari Tomokazu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:81,pase:90,defensa:72,especial:88,
  hissatsu:['Parada fuerte', 'Obstrucción eléctrica', 'Rematerialización'],tipoTecnica:'portero',
  desc:'Centrocampista y capitán de Academia IA en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:400,
  sprite:'https://inazumarun.es/assets/sprites/r1605.webp'
},
{
  id:'r1606', equipo:'Academia IA', nombre:'Talim Muskel', original:'Kidera Dengo',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:75,defensa:87,especial:84,
  hissatsu:['A todo vapor', 'Carga de Elefantes', 'Zig Zag Explosivo'],tipoTecnica:'portero',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1606.webp'
},
{
  id:'r1607', equipo:'Academia IA', nombre:'Deacon Pewter', original:'Komatsuda Issen',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:77,defensa:89,especial:82,
  hissatsu:['Robo veloz', 'Guardia acrobática', 'Regate múltiple'],tipoTecnica:'defensa',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1607.webp'
},
{
  id:'r1608', equipo:'Academia IA', nombre:'Randon Datta', original:'Kurokura Mitsukuni',
  posicion:'Defensa', tipo:'Montaña',
  tiro:51,pase:75,defensa:87,especial:84,
  hissatsu:['Zona de seguridad', 'Mirada ladrona', 'Obstrucción eléctrica'],tipoTecnica:'defensa',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1608.webp'
},
{
  id:'r1609', equipo:'Academia IA', nombre:'Pradip Lurning', original:'Morito Ankou',
  posicion:'Defensa', tipo:'Fuego',
  tiro:56,pase:74,defensa:86,especial:83,
  hissatsu:['Zona de seguridad', 'Pared solitaria', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1609.webp'
},
{
  id:'r1610', equipo:'Academia IA', nombre:'Synthian Volkel', original:'Namikata Ryousei',
  posicion:'Defensa', tipo:'Bosque',
  tiro:54,pase:74,defensa:86,especial:83,
  hissatsu:['Fuerza centrífuga', 'Ataque de las sombras', 'Espejismo'],tipoTecnica:'regate',
  desc:'Defensa de Academia IA en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1610.webp'
},
{
  id:'r1611', equipo:'Academia IA', nombre:'Eugenio Provost', original:'Shikichi Enzou',
  posicion:'Portero', tipo:'Fuego',
  tiro:29,pase:59,defensa:87,especial:82,
  hissatsu:['Campo de fuerza defensivo', 'Despeje medialuna', 'Rayo de puño'],tipoTecnica:'portero',
  desc:'Portero de Academia IA en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1611.webp'
},
{
  id:'r1612', equipo:'Academia IA', nombre:'Manila Brickit', original:'Shoudou Ana',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:73,defensa:42,especial:84,
  hissatsu:['Trayectoria perfecta', 'Pasos aéreos', 'Zig Zag Explosivo'],tipoTecnica:'tiro',
  desc:'Delantero de Academia IA en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1612.webp'
},
{
  id:'r1613', equipo:'Academia IA', nombre:'Obert Deance', original:'Shunou Ronri',
  posicion:'Delantero', tipo:'Montaña',
  tiro:88,pase:72,defensa:47,especial:83,
  hissatsu:['Trayectoria perfecta', 'Doble trallazo planetario', 'Mirada al futuro'],tipoTecnica:'defensa',
  desc:'Delantero de Academia IA en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1613.webp'
},
{
  id:'r1614', equipo:'Academia IA', nombre:'Cleo Balbot', original:'Tamagiri Sanri',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:81,pase:90,defensa:75,especial:84,
  hissatsu:['Robo veloz', 'Esferas luminosas', 'Pasos aéreos'],tipoTecnica:'defensa',
  desc:'Centrocampista de Academia IA en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1614.webp'
},
{
  id:'r1615', equipo:'Academia IA', nombre:'Zuzu Intel', original:'Touda Ritsumi',
  posicion:'Delantero', tipo:'Bosque',
  tiro:90,pase:74,defensa:37,especial:85,
  hissatsu:['Astro remate', 'Estrella oscura', 'Barrena voladora'],tipoTecnica:'regate',
  desc:'Delantero de Academia IA en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1615.webp'
},
{
  id:'r1616', equipo:'Academia IA', nombre:'Annalisa Cubon', original:'Yotsukado Keiri',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:73,especial:86,
  hissatsu:['Mirada ladrona', 'Ultra lunar', 'Tiro Balista'],tipoTecnica:'tiro',
  desc:'Centrocampista de Academia IA en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:200,
  sprite:'https://inazumarun.es/assets/sprites/r1616.webp'
},
{
  id:'r1617', equipo:'Eastwind', nombre:'Kain Vijet', original:'Cain Widget',
  posicion:'Defensa', tipo:'Montaña',
  tiro:57,pase:75,defensa:87,especial:80,
  hissatsu:['Robo veloz', 'Jaula de piedra', 'Bola Falsa'],tipoTecnica:'defensa',
  desc:'Defensa de Eastwind en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1617.webp'
},
{
  id:'r1618', equipo:'Eastwind', nombre:'Edmond Pias', original:'Edmond Pierce',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:75,defensa:87,especial:80,
  hissatsu:['Robo veloz', 'Fortaleza nocturna', 'Ataque de garza'],tipoTecnica:'defensa',
  desc:'Defensa de Eastwind en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1618.webp'
},
{
  id:'r1619', equipo:'Eastwind', nombre:'Jenny Okutba', original:'Jenny October',
  posicion:'Defensa', tipo:'Viento',
  tiro:44,pase:74,defensa:86,especial:83,
  hissatsu:['Buzo profundo', 'Regate Aurora', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de Eastwind en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1619.webp'
},
{
  id:'r1620', equipo:'Eastwind', nombre:'Joey Beat', original:'John Beat',
  posicion:'Delantero', tipo:'Fuego',
  tiro:87,pase:71,defensa:42,especial:82,
  hissatsu:['Bomba saltarina', 'Baile de Llamas', 'Tacón infernal'],tipoTecnica:'tiro',
  desc:'Delantero de Eastwind en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1620.webp'
},
{
  id:'r1621', equipo:'Eastwind', nombre:'Judie Cassios', original:'Judie Cassios',
  posicion:'Defensa', tipo:'Fuego',
  tiro:48,pase:72,defensa:84,especial:81,
  hissatsu:['Bola falsa', 'Pasos aéreos', 'Voltereta Círcense'],tipoTecnica:'defensa',
  desc:'Defensa de Eastwind en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1621.webp'
},
{
  id:'r1622', equipo:'Eastwind', nombre:'Kai Yoshizaki', original:'Kai Yoshizaki',
  posicion:'Delantero', tipo:'Fuego',
  tiro:88,pase:72,defensa:39,especial:83,
  hissatsu:['Tiro tramposo', 'Zigzag de fuego', 'Llamarada infernal'],tipoTecnica:'tiro',
  desc:'Delantero de Eastwind en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1622.webp'
},
{
  id:'r1623', equipo:'Eastwind', nombre:'Kaos Dao', original:'Kaios Dao',
  posicion:'Portero', tipo:'Montaña',
  tiro:29,pase:59,defensa:85,especial:80,
  hissatsu:['Parada fuerte', 'Corte de arena', 'Muralla Gigante'],tipoTecnica:'portero',
  desc:'Portero de Eastwind en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1623.webp'
},
{
  id:'r1624', equipo:'Eastwind', nombre:'Gigy Maharaja', original:'Kiki Maharaja',
  posicion:'Defensa', tipo:'Fuego',
  tiro:49,pase:73,defensa:85,especial:82,
  hissatsu:['Cataratas del niágara', 'Carga de Elefantes', 'Gravitación'],tipoTecnica:'defensa',
  desc:'Defensa de Eastwind en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1624.webp'
},
{
  id:'r1625', equipo:'Eastwind', nombre:'Maribelle Flanmir', original:'Maribel Franmil',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Tiro Giratorio', 'Subida a los cielos', 'Ícaro'],tipoTecnica:'regate',
  desc:'Centrocampista de Eastwind en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1625.webp'
},
{
  id:'r1626', equipo:'Eastwind', nombre:'Martino Leone', original:'Martino Leone',
  posicion:'Portero', tipo:'Bosque',
  tiro:37,pase:59,defensa:85,especial:80,
  hissatsu:['Extramundo', 'Agujero de gusano', 'Espada Defensora'],tipoTecnica:'portero',
  desc:'Portero de Eastwind en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1626.webp'
},
{
  id:'r1627', equipo:'Eastwind', nombre:'Olson Carchis', original:'Olson Curtis',
  posicion:'Delantero', tipo:'Bosque',
  tiro:89,pase:73,defensa:38,especial:80,
  hissatsu:['Visto y no visto', 'Balon Angelical', 'Ataque de paladín'],tipoTecnica:'tiro',
  desc:'Delantero de Eastwind en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1627.webp'
},
{
  id:'r1628', equipo:'Eastwind', nombre:'Robart Anderson', original:'Roberto Anderson',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Cataratas del niágara', 'Ultra lunar', 'Entrada rodante'],tipoTecnica:'regate',
  desc:'Centrocampista de Eastwind en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1628.webp'
},
{
  id:'r1629', equipo:'Eastwind', nombre:'Sikuvot Shivan', original:'Squat Swan',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:71,defensa:40,especial:82,
  hissatsu:['Cataratas del niágara', 'Ultra lunar', 'Buzo profundo'],tipoTecnica:'tiro',
  desc:'Delantero de Eastwind en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1629.webp'
},
{
  id:'r1630', equipo:'Eastwind', nombre:'Mengmeng Wang', original:'Wang Mongmong',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['Balón galgo', 'Entrada Tormenta', 'Zigzag de fuego'],tipoTecnica:'regate',
  desc:'Centrocampista de Eastwind en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1630.webp'
},
{
  id:'r1631', equipo:'Eastwind', nombre:'Toyo Yamanouchi', original:'Yamanouchi Touyou',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:82,pase:91,defensa:73,especial:85,
  hissatsu:['Cataratas del niágara', 'Tiro Balista', 'Zig Zag Explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Eastwind en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1631.webp'
},
{
  id:'r1632', equipo:'Eastwind', nombre:'Ming Chow', original:'Zhou Mei',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Chut granada', 'Tacón infernal', 'Patada canguro'],tipoTecnica:'regate',
  desc:'Centrocampista de Eastwind en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1632.webp'
},
{
  id:'r1633', equipo:'Destroyers', nombre:'Arden Drax', original:'Arden Drayce',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:72,defensa:84,especial:81,
  hissatsu:['Estrella de roca', 'Fiesta floral', 'Acrobacia robótica'],tipoTecnica:'defensa',
  desc:'Defensa de Destroyers en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1633.webp'
},
{
  id:'r1634', equipo:'Destroyers', nombre:'Crysis Murdok', original:'Crisis Muller',
  posicion:'Portero', tipo:'Fuego',
  tiro:30,pase:56,defensa:84,especial:83,
  hissatsu:['Parada fuerte', 'Ciclón oscuro', 'Repulsión'],tipoTecnica:'portero',
  desc:'Portero de Destroyers en Inazuma Eleven: Victory Road, dorsal 20.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1634.webp'
},
{
  id:'r1635', equipo:'Destroyers', nombre:'Declan Jaxor', original:'Declan Jessup',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:77,pase:86,defensa:71,especial:84,
  hissatsu:['Magnetismo', 'Barreno de fuego', 'Ataque de garza'],tipoTecnica:'regate',
  desc:'Centrocampista de Destroyers en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1635.webp'
},
{
  id:'r1636', equipo:'Destroyers', nombre:'Denowar Krell', original:'Denebola Stoycho',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Balón de plasma', 'Avance chispeante', 'Rematerialización'],tipoTecnica:'regate',
  desc:'Centrocampista de Destroyers en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1636.webp'
},
{
  id:'r1637', equipo:'Destroyers', nombre:'Garruk Vynce', original:'Galala Vinci',
  posicion:'Portero', tipo:'Montaña',
  tiro:25,pase:59,defensa:85,especial:80,
  hissatsu:['Parada fuerte', 'Ciclón oscuro', 'Repulsión'],tipoTecnica:'portero',
  desc:'Portero de Destroyers en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1637.webp'
},
{
  id:'r1638', equipo:'Destroyers', nombre:'Grenadier Deton', original:'Grenier Pius',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Campo minado', 'Giro atómico', 'Avance chispeante'],tipoTecnica:'regate',
  desc:'Centrocampista de Destroyers en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1638.webp'
},
{
  id:'r1639', equipo:'Destroyers', nombre:'Keines Elvain', original:'Kinis Elvim',
  posicion:'Delantero', tipo:'Bosque',
  tiro:92,pase:73,defensa:46,especial:83,
  hissatsu:['Tormenta dimensional', 'Formateo de disco', 'Golpe Cataclismo'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de Destroyers en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1639.webp'
},
{
  id:'r1640', equipo:'Destroyers', nombre:'Rourik Bhatt', original:'Luol Batti',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:76,pase:85,defensa:70,especial:83,
  hissatsu:['Barreno de fuego', 'Túnel tornado', 'El ojo del huracán'],tipoTecnica:'regate',
  desc:'Centrocampista de Destroyers en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1640.webp'
},
{
  id:'r1641', equipo:'Destroyers', nombre:'Machina Dex', original:'Machina Dex',
  posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:74,defensa:86,especial:83,
  hissatsu:['Formateo de disco', 'Barreno de fuego', 'Barrena voladora'],tipoTecnica:'defensa',
  desc:'Defensa de Destroyers en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1641.webp'
},
{
  id:'r1642', equipo:'Destroyers', nombre:'Menox Kessler', original:'Menos Kessler',
  posicion:'Delantero', tipo:'Bosque',
  tiro:89,pase:73,defensa:36,especial:80,
  hissatsu:['Despliegue de señuelos', 'Onda chispeante', 'Giro atómico'],tipoTecnica:'tiro',
  desc:'Delantero de Destroyers en Inazuma Eleven: Victory Road, dorsal 18.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1642.webp'
},
{
  id:'r1643', equipo:'Destroyers', nombre:'Nebula Raime', original:'Nebula Raime',
  posicion:'Delantero', tipo:'Bosque',
  tiro:89,pase:73,defensa:44,especial:80,
  hissatsu:['Golpe cataclismo', 'El ojo del huracán', 'Estrella de roca'],tipoTecnica:'tiro',
  desc:'Delantero de Destroyers en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1643.webp'
},
{
  id:'r1644', equipo:'Destroyers', nombre:'Prisca Grav', original:'Priss Gallis',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:79,pase:88,defensa:73,especial:82,
  hissatsu:['Flecha de cupido', 'Fiesta floral', 'Salto explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Destroyers en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1644.webp'
},
{
  id:'r1645', equipo:'Destroyers', nombre:'Simen Thorne', original:'Simi Thorn',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:75,defensa:87,especial:80,
  hissatsu:['Obstrucción eléctrica', 'Acrobacia robótica', 'Estrella de roca'],tipoTecnica:'defensa',
  desc:'Defensa de Destroyers en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1645.webp'
},
{
  id:'r1646', equipo:'Destroyers', nombre:'Vector Vernam', original:'Vector Cunningham',
  posicion:'Delantero', tipo:'Fuego',
  tiro:89,pase:73,defensa:42,especial:80,
  hissatsu:['Caída planetaria', 'Tormenta Dimensional', 'Salto explosivo'],tipoTecnica:'tiro',
  desc:'Delantero de Destroyers en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1646.webp'
},
{
  id:'r1647', equipo:'Destroyers', nombre:'Xyron Madric', original:'Xyon Madner',
  posicion:'Defensa', tipo:'Fuego',
  tiro:57,pase:73,defensa:85,especial:82,
  hissatsu:['Campo minado', 'Acrobacia robótica', 'El ojo del huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Destroyers en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1647.webp'
},
{
  id:'r1648', equipo:'Destroyers', nombre:'Zyphar Doar', original:'Zippy Doerr',
  posicion:'Defensa', tipo:'Montaña',
  tiro:52,pase:72,defensa:84,especial:81,
  hissatsu:['El ojo del huracán', 'Acrobacia robótica', 'Estrella de roca'],tipoTecnica:'defensa',
  desc:'Defensa de Destroyers en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1648.webp'
},
{
  id:'r1649', equipo:'Gatekeepers', nombre:'Arwena Lark', original:'Allik Reginia',
  posicion:'Delantero', tipo:'Fuego',
  tiro:84,pase:68,defensa:39,especial:79,
  hissatsu:['Llamarada infernal', 'Fuego rápido', 'Mirada amenazante'],tipoTecnica:'tiro',
  desc:'Delantero de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1649.webp'
},
{
  id:'r1650', equipo:'Gatekeepers', nombre:'Kendra Pierce', original:'Chianti Paci',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Corte de guadaña bajo', 'Remate de seguridad', 'Robo veloz'],tipoTecnica:'regate',
  desc:'Centrocampista de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1650.webp'
},
{
  id:'r1651', equipo:'Gatekeepers', nombre:'Cecily Noire', original:'Cicely Noa',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:73,defensa:85,especial:78,
  hissatsu:['Zona de seguridad', 'Gravitación', 'Obstrucción eléctrica'],tipoTecnica:'defensa',
  desc:'Defensa de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1651.webp'
},
{
  id:'r1652', equipo:'Gatekeepers', nombre:'Cressida Octavia', original:'Cruel Octuelly',
  posicion:'Delantero', tipo:'Montaña',
  tiro:84,pase:68,defensa:47,especial:79,
  hissatsu:['Círculo de hielo', 'Engranajes aceleradores', 'Curve shot'],tipoTecnica:'tiro',
  desc:'Delantero de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 18.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1652.webp'
},
{
  id:'r1653', equipo:'Gatekeepers', nombre:'Amara Myles', original:'Emelia Myhra',
  posicion:'Portero', tipo:'Viento',
  tiro:34,pase:56,defensa:82,especial:81,
  hissatsu:['Muralla de escudos', 'Estrella reflectante', 'Golpe Abrasador'],tipoTecnica:'portero',
  desc:'Portero de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1653.webp'
},
{
  id:'r1654', equipo:'Gatekeepers', nombre:'Ivy Celeste', original:'Ilvy Celeste',
  posicion:'Defensa', tipo:'Fuego',
  tiro:41,pase:71,defensa:83,especial:80,
  hissatsu:['Obstrucción eléctrica', 'Despliegue de señuelos', 'Barreno de fuego'],tipoTecnica:'defensa',
  desc:'Defensa de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1654.webp'
},
{
  id:'r1655', equipo:'Gatekeepers', nombre:'Jackie Mulligan', original:'Jackie Mulligan',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Avance flamígero', 'Fuego rápido', 'Barreno de fuego'],tipoTecnica:'regate',
  desc:'Centrocampista de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1655.webp'
},
{
  id:'r1656', equipo:'Gatekeepers', nombre:'Julietta Belamy', original:'Juliet Love',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:71,defensa:83,especial:80,
  hissatsu:['Subida a los cielos', 'Formateo de disco', 'Trance melódico'],tipoTecnica:'defensa',
  desc:'Defensa de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1656.webp'
},
{
  id:'r1657', equipo:'Gatekeepers', nombre:'Catalina Riven', original:'Katarina Oleksia',
  posicion:'Portero', tipo:'Montaña',
  tiro:33,pase:59,defensa:83,especial:78,
  hissatsu:['Parada fuerte', 'Puño de arena', 'Muralla de escudos'],tipoTecnica:'portero',
  desc:'Portero de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 20.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1657.webp'
},
{
  id:'r1658', equipo:'Gatekeepers', nombre:'Keira Donnell', original:'Keira Donapehr',
  posicion:'Defensa', tipo:'Bosque',
  tiro:55,pase:71,defensa:83,especial:80,
  hissatsu:['Robo veloz', 'Corte de guadaña bajo', 'Zona de seguridad'],tipoTecnica:'defensa',
  desc:'Defensa de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1658.webp'
},
{
  id:'r1659', equipo:'Gatekeepers', nombre:'Lindalyn Berny', original:'Lindalin Bernie',
  posicion:'Delantero', tipo:'Viento',
  tiro:87,pase:68,defensa:37,especial:82,
  hissatsu:['Círculo de hielo', 'Remate de seguridad', 'Balón de plasma'],tipoTecnica:'regate',
  desc:'Delantero y capitán de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1659.webp'
},
{
  id:'r1660', equipo:'Gatekeepers', nombre:'Magda Dornel', original:'Maglia Dolphi',
  posicion:'Delantero', tipo:'Fuego',
  tiro:85,pase:69,defensa:40,especial:80,
  hissatsu:['Cañón Dragón', 'Cruce explosivo', 'Tornado doble'],tipoTecnica:'tiro',
  desc:'Delantero de Gatekeepers en Inazuma Eleven: Victory Road.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1660.webp'
},
{
  id:'r1661', equipo:'Gatekeepers', nombre:'Mira Lysander', original:'Migria Rusty',
  posicion:'Delantero', tipo:'Viento',
  tiro:84,pase:68,defensa:41,especial:79,
  hissatsu:['Tiro sónico', 'Engranajes aceleradores', 'Balón de plasma'],tipoTecnica:'tiro',
  desc:'Delantero de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1661.webp'
},
{
  id:'r1662', equipo:'Gatekeepers', nombre:'Norah Queensby', original:'Norma Quaid',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:77,pase:86,defensa:71,especial:80,
  hissatsu:['Trance melódico', 'Robo veloz', 'Tormenta Dimensional'],tipoTecnica:'regate',
  desc:'Centrocampista de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1662.webp'
},
{
  id:'r1663', equipo:'Gatekeepers', nombre:'Trixie Bren', original:'Trixie Bren',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Despliegue de señuelos', 'Engranajes aceleradores', 'Formateo de disco'],tipoTecnica:'regate',
  desc:'Centrocampista de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1663.webp'
},
{
  id:'r1664', equipo:'Gatekeepers', nombre:'Vivian Calder', original:'Vivi Malade',
  posicion:'Defensa', tipo:'Fuego',
  tiro:40,pase:70,defensa:82,especial:79,
  hissatsu:['Barreno de fuego', 'Estrella de roca', 'Avance flamígero'],tipoTecnica:'defensa',
  desc:'Defensa de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1664.webp'
},
{
  id:'r1665', equipo:'Gatekeepers', nombre:'Zora Selwick', original:'Zohra Seychet',
  posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:73,defensa:85,especial:78,
  hissatsu:['Proyectil de ozono', 'Subida a los cielos', 'Círculo de hielo'],tipoTecnica:'defensa',
  desc:'Defensa de Gatekeepers en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1665.webp'
},
{
  id:'r1666', equipo:'Stormridge', nombre:'Volk Lorius', original:'Dentouda Tokinosuke',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Mirada asesina', 'Defensa múltiple', 'Tiro Espectral'],tipoTecnica:'regate',
  desc:'Centrocampista de Stormridge en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1666.webp'
},
{
  id:'r1667', equipo:'Stormridge', nombre:'Floramira Pagotta', original:'Gojuudera Manaka',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Mirada asesina', 'Gravedad', 'Corte Mágico'],tipoTecnica:'regate',
  desc:'Centrocampista de Stormridge en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1667.webp'
},
{
  id:'r1668', equipo:'Stormridge', nombre:'Kaz Bloomfield', original:'Hanamaruya Kazu',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:70,defensa:82,especial:79,
  hissatsu:['Mirada asesina', 'Defensa múltiple', 'Gravedad'],tipoTecnica:'defensa',
  desc:'Defensa de Stormridge en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1668.webp'
},
{
  id:'r1669', equipo:'Stormridge', nombre:'Elijah Singleton', original:'Ikue Magoichi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:78,pase:87,defensa:69,especial:81,
  hissatsu:['Robo veloz', 'Trama trama', 'Superbalón rodante'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de Stormridge en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1669.webp'
},
{
  id:'r1670', equipo:'Stormridge', nombre:'Dawsey Geistfeld', original:'Kamata Mudou',
  posicion:'Delantero', tipo:'Viento',
  tiro:85,pase:69,defensa:40,especial:76,
  hissatsu:['Mirada asesina', 'Corte Mágico', 'Tornado oscuro'],tipoTecnica:'tiro',
  desc:'Delantero de Stormridge en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1670.webp'
},
{
  id:'r1671', equipo:'Stormridge', nombre:'Umbren Lightwood', original:'Kurashiki Akari',
  posicion:'Delantero', tipo:'Viento',
  tiro:83,pase:67,defensa:46,especial:78,
  hissatsu:['Tiro rotativo', 'Salto Dimensional', 'Esferas luminosas'],tipoTecnica:'tiro',
  desc:'Delantero de Stormridge en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1671.webp'
},
{
  id:'r1672', equipo:'Stormridge', nombre:'Drexel Kixley', original:'Masakari Kitaru',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:69,defensa:81,especial:78,
  hissatsu:['Carga de elefantes', 'Caída a los infiernos', 'Jaula de piedra'],tipoTecnica:'defensa',
  desc:'Defensa de Stormridge en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1672.webp'
},
{
  id:'r1673', equipo:'Stormridge', nombre:'Zelane Whitlow', original:'Nanakaidou Haku',
  posicion:'Portero', tipo:'Fuego',
  tiro:38,pase:56,defensa:80,especial:79,
  hissatsu:['Parada fuerte', 'Despeje cohete', 'Mordisco de serpiente'],tipoTecnica:'portero',
  desc:'Portero de Stormridge en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1673.webp'
},
{
  id:'r1674', equipo:'Stormridge', nombre:'Kiona Blackwell', original:'Niikuro Konami',
  posicion:'Portero', tipo:'Viento',
  tiro:34,pase:56,defensa:80,especial:79,
  hissatsu:['Pincelada silenciosa', 'Araña gigante', 'Presa de sombras'],tipoTecnica:'portero',
  desc:'Portero de Stormridge en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1674.webp'
},
{
  id:'r1675', equipo:'Stormridge', nombre:'Alistar Montero', original:'Renzan Hamato',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Visto y no visto', 'Guardia acrobática', 'Voltereta Círcense'],tipoTecnica:'regate',
  desc:'Centrocampista de Stormridge en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1675.webp'
},
{
  id:'r1676', equipo:'Stormridge', nombre:'Blaine Westbrook', original:'Saijou Lill',
  posicion:'Delantero', tipo:'Viento',
  tiro:82,pase:66,defensa:43,especial:77,
  hissatsu:['Mirada asesina', 'Campo de fuerza', 'Tiro Espectral'],tipoTecnica:'tiro',
  desc:'Delantero de Stormridge en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1676.webp'
},
{
  id:'r1677', equipo:'Stormridge', nombre:'Lennox Portsman', original:'Suzumori Saiya',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:71,defensa:83,especial:76,
  hissatsu:['A todo vapor', 'Emboscada defensiva', 'Carga de Elefantes'],tipoTecnica:'defensa',
  desc:'Defensa de Stormridge en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1677.webp'
},
{
  id:'r1678', equipo:'Stormridge', nombre:'Rael Abbeybogy', original:'Teramae Reiru',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:74,pase:83,defensa:68,especial:81,
  hissatsu:['Gravedad', 'Gravitación', 'Presa fractal'],tipoTecnica:'regate',
  desc:'Centrocampista de Stormridge en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1678.webp'
},
{
  id:'r1679', equipo:'Stormridge', nombre:'Marinus Courier', original:'Uchinari Kaiji',
  posicion:'Delantero', tipo:'Fuego',
  tiro:83,pase:67,defensa:46,especial:78,
  hissatsu:['Pared solitaria', 'Carrera relámpago', 'Cabezazo cohete'],tipoTecnica:'tiro',
  desc:'Delantero de Stormridge en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1679.webp'
},
{
  id:'r1680', equipo:'Stormridge', nombre:'Rohan Snatchett', original:'Ujiie Touichi',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:75,pase:84,defensa:69,especial:78,
  hissatsu:['Ataque de garza', 'Lluvia de Meteoros', 'Salto explosivo'],tipoTecnica:'regate',
  desc:'Centrocampista de Stormridge en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1680.webp'
},
{
  id:'r1681', equipo:'Stormridge', nombre:'Govin Castlehoven', original:'Yashiro Suberu',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:69,defensa:81,especial:78,
  hissatsu:['Mirada asesina', 'Salto Dimensional', 'Segadora'],tipoTecnica:'defensa',
  desc:'Defensa de Stormridge en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1681.webp'
},
{
  id:'r1682', equipo:'Noble Insight', nombre:'Histrion Etcher', original:'Fujino Kamatari',
  posicion:'Defensa', tipo:'Fuego',
  tiro:55,pase:69,defensa:81,especial:78,
  hissatsu:['Luz cegadora', 'Cortafuegos', 'Estela ígnea'],tipoTecnica:'defensa',
  desc:'Defensa de Noble Insight en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1682.webp'
},
{
  id:'r1683', equipo:'Noble Insight', nombre:'Elric Spiech', original:'Fukuzawa Doukichi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:50,pase:70,defensa:82,especial:79,
  hissatsu:['A todo vapor', 'Emboscada defensiva', 'Carga de Elefantes'],tipoTecnica:'defensa',
  desc:'Defensa de Noble Insight en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1683.webp'
},
{
  id:'r1684', equipo:'Noble Insight', nombre:'Keepie Upshire', original:'Futatsumiya Kinjirou',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:76,pase:85,defensa:67,especial:83,
  hissatsu:['Defensa múltiple', 'Regate espejismo', 'Gran resplandor'],tipoTecnica:'defensa',
  desc:'Centrocampista y capitán de Noble Insight en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:350,
  sprite:'https://inazumarun.es/assets/sprites/r1684.webp'
},
{
  id:'r1685', equipo:'Noble Insight', nombre:'Marcelline Memoir', original:'Higuchi Takeha',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Robo veloz', 'Lluvia de Meteoros', 'Remate Múltiple'],tipoTecnica:'tiro',
  desc:'Centrocampista de Noble Insight en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1685.webp'
},
{
  id:'r1686', equipo:'Noble Insight', nombre:'Aurelio Auditus', original:'Hijiri Tokutarou',
  posicion:'Delantero', tipo:'Bosque',
  tiro:85,pase:69,defensa:40,especial:76,
  hissatsu:['Tiro cegador', 'Remate de Gaia', 'Luz Cegadora'],tipoTecnica:'regate',
  desc:'Delantero de Noble Insight en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1686.webp'
},
{
  id:'r1687', equipo:'Noble Insight', nombre:'Horatio Tickner', original:'Inoguchi Hideyuki',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:68,defensa:80,especial:77,
  hissatsu:['Defensa propulsada', 'Red de caza', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Noble Insight en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1687.webp'
},
{
  id:'r1688', equipo:'Noble Insight', nombre:'Staton Folhard', original:'Ito Hiroyasu',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Engaño torero', 'Voltereta Círcense', 'Mirada al futuro'],tipoTecnica:'tiro',
  desc:'Centrocampista de Noble Insight en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1688.webp'
},
{
  id:'r1689', equipo:'Noble Insight', nombre:'Basil Wanderbilt', original:'Iwakura Tomotsugu',
  posicion:'Delantero', tipo:'Montaña',
  tiro:83,pase:67,defensa:38,especial:78,
  hissatsu:['Chut granada', 'Gran Torbellino', 'Llamarada infernal'],tipoTecnica:'regate',
  desc:'Delantero de Noble Insight en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1689.webp'
},
{
  id:'r1690', equipo:'Noble Insight', nombre:'Viki Devine', original:'Jinguu Kougetsu',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:73,pase:82,defensa:67,especial:80,
  hissatsu:['Luz cegadora', 'Doble trallazo planetario', 'Rematerialización'],tipoTecnica:'defensa',
  desc:'Centrocampista de Noble Insight en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1690.webp'
},
{
  id:'r1691', equipo:'Noble Insight', nombre:'Habib Liomont', original:'Kitazato Gakusaburou',
  posicion:'Defensa', tipo:'Montaña',
  tiro:42,pase:68,defensa:80,especial:77,
  hissatsu:['Mirada ladrona', 'Zona de seguridad', 'Mirada al futuro'],tipoTecnica:'defensa',
  desc:'Defensa de Noble Insight en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1691.webp'
},
{
  id:'r1692', equipo:'Noble Insight', nombre:'Chat Baltauk', original:'Nitobe Denzou',
  posicion:'Portero', tipo:'Bosque',
  tiro:26,pase:56,defensa:80,especial:79,
  hissatsu:['Captura excelente', 'Muralla Gigante', 'Puente sin final'],tipoTecnica:'portero',
  desc:'Portero de Noble Insight en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1692.webp'
},
{
  id:'r1693', equipo:'Noble Insight', nombre:'Nelvin Dustrie', original:'Shibusawa Eikou',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Pared solitaria', 'Voltereta Círcense', 'Tiro Balista'],tipoTecnica:'regate',
  desc:'Centrocampista de Noble Insight en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1693.webp'
},
{
  id:'r1694', equipo:'Noble Insight', nombre:'Jorna Privinski', original:'Shikino Murasaki',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:81,defensa:66,especial:79,
  hissatsu:['Gravedad', 'Regate espejismo', 'Tiro Espectral'],tipoTecnica:'defensa',
  desc:'Centrocampista de Noble Insight en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1694.webp'
},
{
  id:'r1695', equipo:'Noble Insight', nombre:'Barney Snellman', original:'Takabashi Korekiyo',
  posicion:'Portero', tipo:'Fuego',
  tiro:25,pase:59,defensa:81,especial:76,
  hissatsu:['Parada fuerte', 'Súper pisotón de sumo', 'Mano Celestial X'],tipoTecnica:'portero',
  desc:'Portero de Noble Insight en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1695.webp'
},
{
  id:'r1696', equipo:'Noble Insight', nombre:'Wilhelmina Goforth', original:'Umezu Yamako',
  posicion:'Delantero', tipo:'Fuego',
  tiro:82,pase:66,defensa:47,especial:77,
  hissatsu:['Cabezazo cohete', 'Remate Triple', 'Cortafuegos'],tipoTecnica:'tiro',
  desc:'Delantero de Noble Insight en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1696.webp'
},
{
  id:'r1697', equipo:'Noble Insight', nombre:'Odell Farley', original:'Wakeno Seima',
  posicion:'Defensa', tipo:'Viento',
  tiro:54,pase:68,defensa:80,especial:77,
  hissatsu:['Entrada huracán', 'Danza del viento', 'Ciclón doble'],tipoTecnica:'defensa',
  desc:'Defensa de Noble Insight en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:175,
  sprite:'https://inazumarun.es/assets/sprites/r1697.webp'
},
{
  id:'r1698', equipo:'Academia Orquídea', nombre:'Evelyn Hale', original:'Anegasaki Seiko',
  posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:69,defensa:81,especial:74,
  hissatsu:['Corte giratorio', 'Ciclón doble', 'Gran Torbellino'],tipoTecnica:'regate',
  desc:'Defensa de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1698.webp'
},
{
  id:'r1699', equipo:'Academia Orquídea', nombre:'Kiyora Asakiri', original:'Asagiri Kiyora',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:71,pase:80,defensa:65,especial:78,
  hissatsu:['Entrada huracán', 'Espejismo', 'Defensa múltiple'],tipoTecnica:'defensa',
  desc:'Centrocampista de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1699.webp'
},
{
  id:'r1700', equipo:'Academia Orquídea', nombre:'Adelina Gearhart', original:'Ayanokouji Misao',
  posicion:'Delantero', tipo:'Bosque',
  tiro:81,pase:65,defensa:48,especial:76,
  hissatsu:['Mirada al futuro', 'Regate espejismo', 'Mirada ladrona'],tipoTecnica:'regate',
  desc:'Delantero de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1700.webp'
},
{
  id:'r1701', equipo:'Academia Orquídea', nombre:'Elara Silvane', original:'Ginshou Kirei',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:67,defensa:79,especial:76,
  hissatsu:['Ataque de las sombras', 'Regate espejismo', 'Corte Mágico'],tipoTecnica:'portero',
  desc:'Defensa de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1701.webp'
},
{
  id:'r1702', equipo:'Academia Orquídea', nombre:'Margie Frostveil', original:'Hinagiku Himari',
  posicion:'Defensa', tipo:'Bosque',
  tiro:54,pase:66,defensa:78,especial:75,
  hissatsu:['Robo veloz', 'Balon Angelical', 'Flash de fotones'],tipoTecnica:'tiro',
  desc:'Defensa de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1702.webp'
},
{
  id:'r1703', equipo:'Academia Orquídea', nombre:'Elyse Reign', original:'Housen Ranka',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:74,pase:83,defensa:65,especial:81,
  hissatsu:['Baile de mariposas', 'Ultra lunar', 'Engaño Torero'],tipoTecnica:'tiro',
  desc:'Centrocampista y capitán de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1703.webp'
},
{
  id:'r1704', equipo:'Academia Orquídea', nombre:'Eliza Florence', original:'Kamurigi Eliza',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Visto y no visto', 'Cruce explosivo', 'Entrada rodante'],tipoTecnica:'tiro',
  desc:'Centrocampista de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1704.webp'
},
{
  id:'r1705', equipo:'Academia Orquídea', nombre:'Talia Jester', original:'Kazakari Emiri',
  posicion:'Portero', tipo:'Fuego',
  tiro:34,pase:56,defensa:78,especial:77,
  hissatsu:['Lanzallamas', 'Puños voladores', 'Rechace de fuego'],tipoTecnica:'portero',
  desc:'Portero de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1705.webp'
},
{
  id:'r1706', equipo:'Academia Orquídea', nombre:'Selene Trance', original:'Kisui Miyona',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Parada fuerte', 'Danza del viento', 'Gran Torbellino'],tipoTecnica:'portero',
  desc:'Centrocampista de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1706.webp'
},
{
  id:'r1707', equipo:'Academia Orquídea', nombre:'Clarisse Luxe', original:'Kiyomizu Chizuru',
  posicion:'Delantero', tipo:'Fuego',
  tiro:83,pase:67,defensa:38,especial:74,
  hissatsu:['Lecho de Rosas', 'Pájaro de fuego', 'Llamarada infernal'],tipoTecnica:'regate',
  desc:'Delantero de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1707.webp'
},
{
  id:'r1708', equipo:'Academia Orquídea', nombre:'Lilia Charmont', original:'Mikagami Seren',
  posicion:'Portero', tipo:'Montaña',
  tiro:33,pase:59,defensa:79,especial:74,
  hissatsu:['Tormenta de pétalos', 'Mordisco de serpiente', 'Despeje de fuerza'],tipoTecnica:'portero',
  desc:'Portero de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1708.webp'
},
{
  id:'r1709', equipo:'Academia Orquídea', nombre:'Lenora Graves', original:'Misono Rena',
  posicion:'Delantero', tipo:'Fuego',
  tiro:83,pase:67,defensa:48,especial:74,
  hissatsu:['Tiro fantasma', 'Espejismo', 'Gravedad'],tipoTecnica:'portero',
  desc:'Delantero de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1709.webp'
},
{
  id:'r1710', equipo:'Academia Orquídea', nombre:'Celina Lavelle', original:'Miyabina Reika',
  posicion:'Delantero', tipo:'Montaña',
  tiro:82,pase:66,defensa:41,especial:77,
  hissatsu:['Arcoiris luminoso', 'Baile de mariposas', 'Bomba saltarina'],tipoTecnica:'defensa',
  desc:'Delantero de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1710.webp'
},
{
  id:'r1711', equipo:'Academia Orquídea', nombre:'Amara Winslow', original:'Shinomiya Kasane',
  posicion:'Defensa', tipo:'Montaña',
  tiro:54,pase:68,defensa:80,especial:77,
  hissatsu:['Giro bobina', 'Ataque de las sombras', 'Regate múltiple'],tipoTecnica:'regate',
  desc:'Defensa de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1711.webp'
},
{
  id:'r1712', equipo:'Academia Orquídea', nombre:'Liliane Alban', original:'Shirayuri Sakiha',
  posicion:'Delantero', tipo:'Bosque',
  tiro:81,pase:65,defensa:40,especial:76,
  hissatsu:['Lecho de Rosas', 'Baile de mariposas', 'Engaño Torero'],tipoTecnica:'defensa',
  desc:'Delantero de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1712.webp'
},
{
  id:'r1713', equipo:'Academia Orquídea', nombre:'Galia Flair', original:'Tenjou Amami',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Ataque de garza', 'Cruce explosivo', 'Tiro de arcabuz'],tipoTecnica:'defensa',
  desc:'Centrocampista de Academia Orquídea en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1713.webp'
},
{
  id:'r1714', equipo:'Lawcrest', nombre:'Fabricius Cator', original:'Asagi Aruto',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Espejismo', 'Red de caza', 'Flecha huracán'],tipoTecnica:'regate',
  desc:'Centrocampista de Lawcrest en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1714.webp'
},
{
  id:'r1715', equipo:'Lawcrest', nombre:'Eames Rapport', original:'Daitou Ryouya',
  posicion:'Defensa', tipo:'Bosque',
  tiro:45,pase:67,defensa:82,especial:79,
  hissatsu:['Ciclón', 'Mirada ladrona', 'Zona de seguridad'],tipoTecnica:'defensa',
  desc:'Defensa y capitán de Lawcrest en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1715.webp'
},
{
  id:'r1716', equipo:'Lawcrest', nombre:'Faust Fennrick', original:'Fushimi Shishi',
  posicion:'Delantero', tipo:'Montaña',
  tiro:81,pase:65,defensa:42,especial:76,
  hissatsu:['Tiro fantasma', 'Trayectoria perfecta', 'Cascabel'],tipoTecnica:'regate',
  desc:'Delantero de Lawcrest en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1716.webp'
},
{
  id:'r1717', equipo:'Lawcrest', nombre:'Normon Peeveton', original:'Igari Tetsuta',
  posicion:'Defensa', tipo:'Montaña',
  tiro:46,pase:66,defensa:78,especial:75,
  hissatsu:['A todo vapor', 'Carga de Elefantes', 'Mina terrestre'],tipoTecnica:'defensa',
  desc:'Defensa de Lawcrest en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1717.webp'
},
{
  id:'r1718', equipo:'Lawcrest', nombre:'Rufery Faire', original:'Inazumi Sekirou',
  posicion:'Portero', tipo:'Fuego',
  tiro:39,pase:53,defensa:77,especial:76,
  hissatsu:['Parada ardiente', 'Manos liberadas', 'Super Puño Invencible'],tipoTecnica:'portero',
  desc:'Portero de Lawcrest en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1718.webp'
},
{
  id:'r1719', equipo:'Lawcrest', nombre:'Willard Headdon', original:'Kendou Yajirou',
  posicion:'Defensa', tipo:'Fuego',
  tiro:51,pase:67,defensa:79,especial:76,
  hissatsu:['Pinzas cortantes', 'Escudo corporal', 'Carrera a tres piernas'],tipoTecnica:'defensa',
  desc:'Defensa de Lawcrest en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1719.webp'
},
{
  id:'r1720', equipo:'Lawcrest', nombre:'Kieran Knavenly', original:'Kiriki Sousui',
  posicion:'Defensa', tipo:'Bosque',
  tiro:47,pase:67,defensa:79,especial:76,
  hissatsu:['La niebla', 'Ataque de garza', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Defensa de Lawcrest en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1720.webp'
},
{
  id:'r1721', equipo:'Lawcrest', nombre:'Norwin Naeve', original:'Koute Norimitsu',
  posicion:'Delantero', tipo:'Fuego',
  tiro:80,pase:64,defensa:35,especial:75,
  hissatsu:['Remate combinado', 'Remate Triple', 'Doble trallazo planetario'],tipoTecnica:'regate',
  desc:'Delantero de Lawcrest en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1721.webp'
},
{
  id:'r1722', equipo:'Lawcrest', nombre:'Prudence Witt', original:'Kureno Hanka',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:73,pase:82,defensa:67,especial:76,
  hissatsu:['Engaño torero', 'Acrobacia robótica', 'Lecho de Rosas'],tipoTecnica:'tiro',
  desc:'Centrocampista de Lawcrest en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1722.webp'
},
{
  id:'r1723', equipo:'Lawcrest', nombre:'Brie Brillante', original:'Makabe Shiro',
  posicion:'Portero', tipo:'Bosque',
  tiro:38,pase:56,defensa:78,especial:77,
  hissatsu:['Parada fuerte', 'Tormenta de pétalos', 'Bloque de Hielo'],tipoTecnica:'portero',
  desc:'Portero de Lawcrest en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1723.webp'
},
{
  id:'r1724', equipo:'Lawcrest', nombre:'Alzen Wasruff', original:'Nigoriya Naki',
  posicion:'Defensa', tipo:'Montaña',
  tiro:41,pase:67,defensa:79,especial:76,
  hissatsu:['Robo veloz', 'Gravitación', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Lawcrest en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1724.webp'
},
{
  id:'r1725', equipo:'Lawcrest', nombre:'Dion Arbiter', original:'Okitehara Zan',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:73,pase:82,defensa:67,especial:76,
  hissatsu:['Entrada huracán', 'Aikido', 'Proyectil de Ozono'],tipoTecnica:'defensa',
  desc:'Centrocampista de Lawcrest en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1725.webp'
},
{
  id:'r1726', equipo:'Lawcrest', nombre:'Cordelia Collison', original:'Ritsunomori Komachi',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:73,pase:82,defensa:67,especial:76,
  hissatsu:['Defensa propulsada', 'Visto y no visto', 'Corte Giratorio'],tipoTecnica:'regate',
  desc:'Centrocampista de Lawcrest en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1726.webp'
},
{
  id:'r1727', equipo:'Lawcrest', nombre:'Adamas Quarell', original:'Shimozuma Norimasa',
  posicion:'Delantero', tipo:'Montaña',
  tiro:83,pase:67,defensa:40,especial:74,
  hissatsu:['Cabezazo cohete', 'Bateo total', 'Carrera a tres piernas'],tipoTecnica:'defensa',
  desc:'Delantero de Lawcrest en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1727.webp'
},
{
  id:'r1728', equipo:'Lawcrest', nombre:'Gusto Reitonly', original:'Tadamichi Fuuki',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:68,defensa:80,especial:77,
  hissatsu:['Carrera del esfuerzo', 'Corte Volcánico', 'Estrella fugaz'],tipoTecnica:'defensa',
  desc:'Defensa de Lawcrest en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1728.webp'
},
{
  id:'r1729', equipo:'Lawcrest', nombre:'Recco Rectenwald', original:'Tadashiki Hanamaru',
  posicion:'Delantero', tipo:'Fuego',
  tiro:81,pase:65,defensa:44,especial:76,
  hissatsu:['Tiro cegador', 'Remate combinado', 'Bomba saltarina'],tipoTecnica:'tiro',
  desc:'Delantero de Lawcrest en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1729.webp'
},
{
  id:'r1730', equipo:'Alpino VR', nombre:'Targan Snowbringer', original:'Fuuren Shiroya',
  posicion:'Defensa', tipo:'Viento',
  tiro:54,pase:66,defensa:78,especial:75,
  hissatsu:['Paisaje helado', 'Fuerza centrífuga', 'Chut Congelante'],tipoTecnica:'regate',
  desc:'Defensa de Alpino VR en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1730.webp'
},
{
  id:'r1731', equipo:'Alpino VR', nombre:'Wren Habilton', original:'Hieizaka Ganto',
  posicion:'Delantero', tipo:'Viento',
  tiro:81,pase:65,defensa:42,especial:72,
  hissatsu:['Ventisca eterna', 'Leopardo de la ventisca', 'Gran Torbellino'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino VR en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1731.webp'
},
{
  id:'r1732', equipo:'Alpino VR', nombre:'Elon Entremet', original:'Kanbashi Suezou',
  posicion:'Defensa', tipo:'Bosque',
  tiro:44,pase:64,defensa:76,especial:73,
  hissatsu:['Defensa múltiple', 'Entrada rodante', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de Alpino VR en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1732.webp'
},
{
  id:'r1733', equipo:'Alpino VR', nombre:'Lev Langvil', original:'Kitahira Uryuu',
  posicion:'Delantero', tipo:'Bosque',
  tiro:79,pase:63,defensa:42,especial:74,
  hissatsu:['Ventisca eterna', 'Leopardo de la ventisca', 'Danza del viento'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino VR en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1733.webp'
},
{
  id:'r1734', equipo:'Alpino VR', nombre:'Berta Brunche', original:'Kumamori Nenemi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:49,pase:65,defensa:77,especial:74,
  hissatsu:['Rompehielos', 'Emboscada defensiva', 'Carga de Elefantes'],tipoTecnica:'regate',
  desc:'Defensa de Alpino VR en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1734.webp'
},
{
  id:'r1735', equipo:'Alpino VR', nombre:'Mateo Potensio', original:'Maruma Roman',
  posicion:'Defensa', tipo:'Viento',
  tiro:56,pase:64,defensa:76,especial:73,
  hissatsu:['Terremoto', 'Emboscada defensiva', 'Rompehielos'],tipoTecnica:'defensa',
  desc:'Defensa de Alpino VR en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1735.webp'
},
{
  id:'r1736', equipo:'Alpino VR', nombre:'Gael Vehemaint', original:'Mashuu Isshin',
  posicion:'Portero', tipo:'Viento',
  tiro:27,pase:53,defensa:75,especial:74,
  hissatsu:['Bloque de Hielo', 'Barrera de cristal', 'Fénix'],tipoTecnica:'portero',
  desc:'Portero de Alpino VR en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1736.webp'
},
{
  id:'r1737', equipo:'Alpino VR', nombre:'Fergat Silverpine', original:'Matsuka Motomichi',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Regate aurora', 'Círculo de hielo', 'Mirada al futuro'],tipoTecnica:'regate',
  desc:'Centrocampista de Alpino VR en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1737.webp'
},
{
  id:'r1738', equipo:'Alpino VR', nombre:'Hail Homestead', original:'Murazumi Hakka',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Bomba géiser', 'Regate Aurora', 'Danza del viento'],tipoTecnica:'tiro',
  desc:'Centrocampista de Alpino VR en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1738.webp'
},
{
  id:'r1739', equipo:'Alpino VR', nombre:'Yetzy Klaus', original:'Namihara Yoruna',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:67,defensa:79,especial:72,
  hissatsu:['Fuerza centrífuga', 'Gravedad', 'Red de caza'],tipoTecnica:'defensa',
  desc:'Defensa de Alpino VR en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1739.webp'
},
{
  id:'r1740', equipo:'Alpino VR', nombre:'Arlo Galbrash', original:'Sagae Kokichi',
  posicion:'Delantero', tipo:'Fuego',
  tiro:79,pase:63,defensa:42,especial:74,
  hissatsu:['Cabezazo cohete', 'Regate Aurora', 'Granada doble'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino VR en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1740.webp'
},
{
  id:'r1741', equipo:'Alpino VR', nombre:'Anastasia Mingler', original:'Shumari Horoka',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:72,pase:81,defensa:63,especial:79,
  hissatsu:['Ventisca eterna', 'Paisaje Helado', 'Círculo de hielo'],tipoTecnica:'portero',
  desc:'Centrocampista y capitán de Alpino VR en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1741.webp'
},
{
  id:'r1742', equipo:'Alpino VR', nombre:'Bayard Boreas', original:'Tenke Nomo',
  posicion:'Delantero', tipo:'Montaña',
  tiro:78,pase:62,defensa:39,especial:73,
  hissatsu:['Cascabel', 'Doble trallazo planetario', 'Remate en V'],tipoTecnica:'tiro',
  desc:'Delantero de Alpino VR en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1742.webp'
},
{
  id:'r1743', equipo:'Alpino VR', nombre:'Ivar Trialton', original:'Tobou Hatsuyuki',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:64,defensa:76,especial:73,
  hissatsu:['Paisaje helado', 'Acrobacia robótica', 'Voltereta Círcense'],tipoTecnica:'defensa',
  desc:'Defensa de Alpino VR en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1743.webp'
},
{
  id:'r1744', equipo:'Alpino VR', nombre:'Fifi Frostkin', original:'Tsumimori Umari',
  posicion:'Portero', tipo:'Bosque',
  tiro:39,pase:53,defensa:75,especial:74,
  hissatsu:['Fénix', 'Bloque de Hielo', 'Despeje de fuerza'],tipoTecnica:'portero',
  desc:'Portero de Alpino VR en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1744.webp'
},
{
  id:'r1745', equipo:'Alpino VR', nombre:'Zain Blizzard', original:'Tsunozaki Akaba',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Defensa múltiple', 'Salto Dimensional', 'Mina terrestre'],tipoTecnica:'regate',
  desc:'Centrocampista de Alpino VR en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1745.webp'
},
{
  id:'r1746', equipo:'West Manor', nombre:'Breppo Terrey', original:'Anba Touya',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:70,pase:79,defensa:64,especial:77,
  hissatsu:['Bola falsa', 'Rompehielos', 'Carrera del esfuerzo'],tipoTecnica:'regate',
  desc:'Centrocampista de West Manor en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1746.webp'
},
{
  id:'r1747', equipo:'West Manor', nombre:'Chicory Bellflower', original:'Henmi Kikyou',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:71,pase:80,defensa:65,especial:74,
  hissatsu:['Bola falsa', 'Giro Bobina', 'Torbellino dragón'],tipoTecnica:'regate',
  desc:'Centrocampista de West Manor en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1747.webp'
},
{
  id:'r1748', equipo:'West Manor', nombre:'Edgard Loathe', original:'Itoi Kou',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:73,pase:82,defensa:64,especial:80,
  hissatsu:['Visto y no visto', 'Danza del viento', 'Mirada al futuro'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de West Manor en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1748.webp'
},
{
  id:'r1749', equipo:'West Manor', nombre:'Edvan Trodden', original:'Jimichi Susumi',
  posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:65,defensa:77,especial:74,
  hissatsu:['Defensa múltiple', 'Cinto astral', 'Ciclón'],tipoTecnica:'defensa',
  desc:'Defensa de West Manor en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1749.webp'
},
{
  id:'r1750', equipo:'West Manor', nombre:'Drever Olflaire', original:'Karunori Katsuki',
  posicion:'Defensa', tipo:'Bosque',
  tiro:53,pase:65,defensa:77,especial:74,
  hissatsu:['Mirada ladrona', 'Entrada rodante', 'Robo veloz'],tipoTecnica:'defensa',
  desc:'Defensa de West Manor en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1750.webp'
},
{
  id:'r1751', equipo:'West Manor', nombre:'Frie Sorbet', original:'Kimitake Aisu',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:67,defensa:79,especial:72,
  hissatsu:['Mirada ladrona', 'Flash de fotones', 'Rompehielos'],tipoTecnica:'defensa',
  desc:'Defensa de West Manor en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1751.webp'
},
{
  id:'r1752', equipo:'West Manor', nombre:'Laymark Starwyn', original:'Kinboshi Yatsuru',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Tiro de francotirador', 'Mirada ladrona', 'Mirada al futuro'],tipoTecnica:'tiro',
  desc:'Centrocampista de West Manor en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1752.webp'
},
{
  id:'r1753', equipo:'West Manor', nombre:'Dax Prescott', original:'Konomachi Kiryou',
  posicion:'Portero', tipo:'Viento',
  tiro:20,pase:50,defensa:74,especial:73,
  hissatsu:['Parada ardiente', 'Manos liberadas', 'Despeje cohete'],tipoTecnica:'portero',
  desc:'Portero de West Manor en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1753.webp'
},
{
  id:'r1754', equipo:'West Manor', nombre:'Ernesta Beauregard', original:'Majime Naoko',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Disparo Rodante', 'Engaño Torero', 'Lecho de Rosas'],tipoTecnica:'regate',
  desc:'Centrocampista de West Manor en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1754.webp'
},
{
  id:'r1755', equipo:'West Manor', nombre:'Berdy Caster', original:'Manabiya Dento',
  posicion:'Delantero', tipo:'Bosque',
  tiro:80,pase:64,defensa:45,especial:75,
  hissatsu:['Mirada al futuro', 'Zig Zag Explosivo', 'Trayectoria perfecta'],tipoTecnica:'tiro',
  desc:'Delantero de West Manor en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1755.webp'
},
{
  id:'r1756', equipo:'West Manor', nombre:'Looke Raundoff', original:'Marume Mami',
  posicion:'Defensa', tipo:'Bosque',
  tiro:53,pase:67,defensa:79,especial:72,
  hissatsu:['Telaraña', 'Visto y no visto', 'Mirada ladrona'],tipoTecnica:'defensa',
  desc:'Defensa de West Manor en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1756.webp'
},
{
  id:'r1757', equipo:'West Manor', nombre:'Moby Tidbitt', original:'Mobunari Kako',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:63,especial:76,
  hissatsu:['Carrera del esfuerzo', 'Mirada ladrona', 'Bola Falsa'],tipoTecnica:'regate',
  desc:'Centrocampista de West Manor en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1757.webp'
},
{
  id:'r1758', equipo:'West Manor', nombre:'Flanko Midspringle', original:'Shikachi Ousuke',
  posicion:'Delantero', tipo:'Bosque',
  tiro:78,pase:62,defensa:39,especial:73,
  hissatsu:['Disparo rodante', 'Superaceleración', 'Superbalón rodante'],tipoTecnica:'tiro',
  desc:'Delantero de West Manor en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1758.webp'
},
{
  id:'r1759', equipo:'West Manor', nombre:'Rutheo Wheyston', original:'Shiraishi Michio',
  posicion:'Defensa', tipo:'Bosque',
  tiro:43,pase:67,defensa:79,especial:72,
  hissatsu:['Robo veloz', 'Carga de Elefantes', 'Espejismo'],tipoTecnica:'defensa',
  desc:'Defensa de West Manor en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1759.webp'
},
{
  id:'r1760', equipo:'West Manor', nombre:'Eddi Losse', original:'Tohou Kure',
  posicion:'Portero', tipo:'Viento',
  tiro:34,pase:56,defensa:76,especial:75,
  hissatsu:['Despeje de leñador', 'Simún', 'Superbalón rodante'],tipoTecnica:'portero',
  desc:'Portero de West Manor en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1760.webp'
},
{
  id:'r1761', equipo:'West Manor', nombre:'Aysen DeMacon', original:'Tsugino Ace',
  posicion:'Delantero', tipo:'Montaña',
  tiro:78,pase:62,defensa:35,especial:73,
  hissatsu:['Carrera del esfuerzo', 'Bateo total', 'Truco balonazo'],tipoTecnica:'tiro',
  desc:'Delantero de West Manor en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1761.webp'
},
{
  id:'r1762', equipo:'Crosswind-Fauxshore', nombre:'Vinda Koral', original:'Bandai Kuromi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:44,pase:64,defensa:76,especial:73,
  hissatsu:['Ataque de garza', 'Tiro de arcabuz', 'Guardia acrobática'],tipoTecnica:'portero',
  desc:'Defensa de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1762.webp'
},
{
  id:'r1763', equipo:'Crosswind-Fauxshore', nombre:'Benton Zellner', original:'Benzai Tenshin',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Parada fuerte', 'Tiro sónico', 'Danza del viento'],tipoTecnica:'portero',
  desc:'Centrocampista de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1763.webp'
},
{
  id:'r1764', equipo:'Crosswind-Fauxshore', nombre:'Ebiss Marlowe', original:'Ebisu Jougo',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['A todo vapor', 'Corte Volcánico', 'Pared solitaria'],tipoTecnica:'defensa',
  desc:'Centrocampista de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1764.webp'
},
{
  id:'r1765', equipo:'Crosswind-Fauxshore', nombre:'Froclan Junn', original:'Fukuroku Gouji',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['Remate misil', 'Mina terrestre', 'Red de caza'],tipoTecnica:'tiro',
  desc:'Centrocampista de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1765.webp'
},
{
  id:'r1766', equipo:'Crosswind-Fauxshore', nombre:'Vashan Morell', original:'Gadou Bishamaru',
  posicion:'Delantero', tipo:'Fuego',
  tiro:76,pase:60,defensa:43,especial:71,
  hissatsu:['Chut de los 100 toques', 'Ataque de garza', 'Tiro de arcabuz'],tipoTecnica:'defensa',
  desc:'Delantero de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1766.webp'
},
{
  id:'r1767', equipo:'Crosswind-Fauxshore', nombre:'Hathea Calmell', original:'Hatae Shizuna',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:69,pase:78,defensa:63,especial:72,
  hissatsu:['Parada fuerte', 'Corte giratorio', 'Regate Aurora'],tipoTecnica:'portero',
  desc:'Centrocampista de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1767.webp'
},
{
  id:'r1768', equipo:'Crosswind-Fauxshore', nombre:'Budan Ashwell', original:'Hotei Daikou',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:66,pase:75,defensa:60,especial:73,
  hissatsu:['A todo vapor', 'Carga de Elefantes', 'Flecha huracán'],tipoTecnica:'tiro',
  desc:'Centrocampista de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1768.webp'
},
{
  id:'r1769', equipo:'Crosswind-Fauxshore', nombre:'Itor Sheerman', original:'Itoshima Hanahiko',
  posicion:'Delantero', tipo:'Viento',
  tiro:82,pase:63,defensa:48,especial:73,
  hissatsu:['Entrada huracán', 'Entrada Tormenta', 'Flecha Divina'],tipoTecnica:'regate',
  desc:'Delantero y capitán de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1769.webp'
},
{
  id:'r1770', equipo:'Crosswind-Fauxshore', nombre:'Orfreya Newcomb', original:'Kushida Nui',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:65,defensa:77,especial:70,
  hissatsu:['Torre inexpugnable', 'Estrella fugaz', 'Estela ígnea'],tipoTecnica:'regate',
  desc:'Defensa de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1770.webp'
},
{
  id:'r1771', equipo:'Crosswind-Fauxshore', nombre:'Mayen Harmet', original:'Meinohama Youki',
  posicion:'Portero', tipo:'Bosque',
  tiro:28,pase:50,defensa:72,especial:71,
  hissatsu:['Mano celestial', 'Mano Mágica', 'Súper Relámpago'],tipoTecnica:'portero',
  desc:'Portero de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1771.webp'
},
{
  id:'r1772', equipo:'Crosswind-Fauxshore', nombre:'Jakob Serveraw', original:'Muromi Hiromitsu',
  posicion:'Portero', tipo:'Montaña',
  tiro:29,pase:59,defensa:75,especial:70,
  hissatsu:['Despeje explosivo', 'Barrera de Gaia', 'Parada ardiente'],tipoTecnica:'portero',
  desc:'Portero de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1772.webp'
},
{
  id:'r1773', equipo:'Crosswind-Fauxshore', nombre:'Clementine Weston', original:'Nishijin Yuzuha',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Visto y no visto', 'Tornado Inverso', 'Tiro Espectral'],tipoTecnica:'defensa',
  desc:'Centrocampista de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1773.webp'
},
{
  id:'r1774', equipo:'Crosswind-Fauxshore', nombre:'Susen Faircourt', original:'Susen Reita',
  posicion:'Defensa', tipo:'Viento',
  tiro:45,pase:65,defensa:77,especial:70,
  hissatsu:['Robo veloz', 'Ultra lunar', 'Ciclón'],tipoTecnica:'regate',
  desc:'Defensa de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1774.webp'
},
{
  id:'r1775', equipo:'Crosswind-Fauxshore', nombre:'Trevin Seabourne', original:'Takarabune Daiba',
  posicion:'Defensa', tipo:'Viento',
  tiro:47,pase:63,defensa:75,especial:72,
  hissatsu:['Corte giratorio', 'Danza del viento', 'Gran Torbellino'],tipoTecnica:'regate',
  desc:'Defensa de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1775.webp'
},
{
  id:'r1776', equipo:'Crosswind-Fauxshore', nombre:'Jory Jinx', original:'Takeriba Rouju',
  posicion:'Delantero', tipo:'Fuego',
  tiro:76,pase:60,defensa:45,especial:71,
  hissatsu:['Remate misil', 'Llamarada infernal', 'Entrada de llamas'],tipoTecnica:'defensa',
  desc:'Delantero de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1776.webp'
},
{
  id:'r1777', equipo:'Crosswind-Fauxshore', nombre:'Yarkin Cittey', original:'Yakuin Kouya',
  posicion:'Defensa', tipo:'Montaña',
  tiro:56,pase:62,defensa:74,especial:71,
  hissatsu:['Parada fuerte', 'Bola falsa', 'Estrella fugaz'],tipoTecnica:'portero',
  desc:'Defensa de Crosswind-Fauxshore en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1777.webp'
},
{
  id:'r1778', equipo:'Platos', nombre:'Eon McKeane', original:'Aeon McKean',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['El ojo del huracán', 'Cañonazo de fragmentos', 'Niebla Mística'],tipoTecnica:'regate',
  desc:'Centrocampista de Platos en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1778.webp'
},
{
  id:'r1779', equipo:'Platos', nombre:'Ash Barnes', original:'Ash Barnes',
  posicion:'Portero', tipo:'Viento',
  tiro:23,pase:53,defensa:73,especial:72,
  hissatsu:['Captura excelente', 'Despeje virtual', 'Recepción Negativa'],tipoTecnica:'portero',
  desc:'Portero de Platos en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1779.webp'
},
{
  id:'r1780', equipo:'Platos', nombre:'Dariusius Henletos', original:'Derios Henletti',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:67,pase:76,defensa:61,especial:74,
  hissatsu:['Presa fractal', 'Cañonazo de fragmentos', 'Pasos aéreos'],tipoTecnica:'regate',
  desc:'Centrocampista de Platos en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1780.webp'
},
{
  id:'r1781', equipo:'Platos', nombre:'Eosram Reeves', original:'Eosin Reese',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['El ojo del huracán', 'Cañonazo de fragmentos', 'Superremate rebotado'],tipoTecnica:'regate',
  desc:'Centrocampista de Platos en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1781.webp'
},
{
  id:'r1782', equipo:'Platos', nombre:'Pharos Radris', original:'Fado Lado',
  posicion:'Portero', tipo:'Fuego',
  tiro:26,pase:56,defensa:74,especial:73,
  hissatsu:['Corte de arena', 'Recepción Negativa', 'Captura excelente'],tipoTecnica:'portero',
  desc:'Portero de Platos en Inazuma Eleven: Victory Road, dorsal 20.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1782.webp'
},
{
  id:'r1783', equipo:'Platos', nombre:'Gilia Dandrel', original:'Gilia Dandelio',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Danza del viento', 'Estrella de roca', 'Proyectil de Ozono'],tipoTecnica:'tiro',
  desc:'Centrocampista de Platos en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1783.webp'
},
{
  id:'r1784', equipo:'Platos', nombre:'Hector Thareos', original:'Hicks Fraile',
  posicion:'Defensa', tipo:'Fuego',
  tiro:55,pase:63,defensa:75,especial:72,
  hissatsu:['Presa fractal', 'Jungla profunda', 'Dúo magma'],tipoTecnica:'defensa',
  desc:'Defensa de Platos en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1784.webp'
},
{
  id:'r1785', equipo:'Platos', nombre:'Hugo Severian', original:'Hugo Svate',
  posicion:'Delantero', tipo:'Montaña',
  tiro:76,pase:60,defensa:45,especial:71,
  hissatsu:['Gran explosión', 'Proyectil de Ozono', 'Balón de plasma'],tipoTecnica:'tiro',
  desc:'Delantero de Platos en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1785.webp'
},
{
  id:'r1786', equipo:'Platos', nombre:'Miles Euclid', original:'Miles Euclid',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:64,defensa:76,especial:73,
  hissatsu:['Jungla profunda', 'Presa fractal', 'Pasos aéreos'],tipoTecnica:'defensa',
  desc:'Defensa de Platos en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1786.webp'
},
{
  id:'r1787', equipo:'Platos', nombre:'Niana Cooke', original:'Niana Cook',
  posicion:'Defensa', tipo:'Montaña',
  tiro:47,pase:63,defensa:75,especial:72,
  hissatsu:['Pasos aéreos', 'Fiesta floral', 'Presa fractal'],tipoTecnica:'defensa',
  desc:'Defensa de Platos en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1787.webp'
},
{
  id:'r1788', equipo:'Platos', nombre:'Nikolaos Menandros', original:'Nicole Menon',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:69,pase:78,defensa:63,especial:72,
  hissatsu:['Niebla mística', 'Superremate rebotado', 'Pasos aéreos'],tipoTecnica:'regate',
  desc:'Centrocampista de Platos en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1788.webp'
},
{
  id:'r1789', equipo:'Platos', nombre:'Orpheus Clayridge', original:'Ortopi Clade',
  posicion:'Delantero', tipo:'Viento',
  tiro:76,pase:60,defensa:47,especial:71,
  hissatsu:['Gran explosión', 'Leopardo de la ventisca', 'Túnel tornado'],tipoTecnica:'tiro',
  desc:'Delantero de Platos en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1789.webp'
},
{
  id:'r1790', equipo:'Platos', nombre:'Rhea Loriandrin', original:'Romi Rhomin',
  posicion:'Defensa', tipo:'Montaña',
  tiro:56,pase:62,defensa:74,especial:71,
  hissatsu:['Fiesta floral', 'Dúo magma', 'Pasos aéreos'],tipoTecnica:'defensa',
  desc:'Defensa de Platos en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1790.webp'
},
{
  id:'r1791', equipo:'Platos', nombre:'Saros Algebra', original:'Serpo Alegre',
  posicion:'Defensa', tipo:'Bosque',
  tiro:43,pase:65,defensa:77,especial:70,
  hissatsu:['Robo fantástico', 'Jungla profunda', 'Túnel tornado'],tipoTecnica:'defensa',
  desc:'Defensa de Platos en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1791.webp'
},
{
  id:'r1792', equipo:'Platos', nombre:'Torin Sandels', original:'Torin Sanders',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:68,pase:77,defensa:62,especial:75,
  hissatsu:['Remate dinosaurio', 'Campo minado', 'Explosión confusa'],tipoTecnica:'regate',
  desc:'Centrocampista de Platos en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1792.webp'
},
{
  id:'r1793', equipo:'South Cirrus', nombre:'Lycus Foxworth', original:'Ayashino Ginrou',
  posicion:'Defensa', tipo:'Bosque',
  tiro:50,pase:54,defensa:66,especial:63,
  hissatsu:['Regate fantasmal', 'Salto Dimensional', 'Tiro Fantasma'],tipoTecnica:'defensa',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1793.webp'
},
{
  id:'r1794', equipo:'South Cirrus', nombre:'Tai Richter', original:'Banme Saito',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:61,pase:70,defensa:55,especial:64,
  hissatsu:['Visión de matriz', 'Gravitación', 'Defensa múltiple'],tipoTecnica:'regate',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1794.webp'
},
{
  id:'r1795', equipo:'South Cirrus', nombre:'Charis Benzaie', original:'Benten Kuroumaru',
  posicion:'Defensa', tipo:'Montaña',
  tiro:53,pase:55,defensa:67,especial:64,
  hissatsu:['Robo teatral', 'Ataque de las sombras', 'Regate múltiple'],tipoTecnica:'defensa',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1795.webp'
},
{
  id:'r1796', equipo:'South Cirrus', nombre:'Antonia Felicier', original:'Fukura Musubi',
  posicion:'Defensa', tipo:'Bosque',
  tiro:47,pase:57,defensa:69,especial:62,
  hissatsu:['¡Hala! ¡Una bola de arroz!', 'Balon Angelical', 'Trama trama'],tipoTecnica:'regate',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 22.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1796.webp'
},
{
  id:'r1797', equipo:'South Cirrus', nombre:'Florent Shorleigh', original:'Hamana Akiumi',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['Marlín volador', 'Patín Aereo', 'Remolino acuático'],tipoTecnica:'tiro',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 23.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1797.webp'
},
{
  id:'r1798', equipo:'South Cirrus', nombre:'Starla Thorn', original:'Hoshi Mikana',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:58,pase:67,defensa:52,especial:65,
  hissatsu:['Ritmo eléctrico', 'Avance chispeante', 'Barrido Defensivo'],tipoTecnica:'regate',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 18.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1798.webp'
},
{
  id:'r1799', equipo:'South Cirrus', nombre:'Marisol Cavallo', original:'Imasato Himana',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:56,defensa:68,especial:65,
  hissatsu:['Círculo elegante', 'Regate Aurora', 'Paisaje Helado'],tipoTecnica:'regate',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1799.webp'
},
{
  id:'r1800', equipo:'South Cirrus', nombre:'Maine Alsop', original:'Iseya Kaname',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['Impulso de resolución', 'Visto y no visto', 'Mirada ladrona'],tipoTecnica:'regate',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1800.webp'
},
{
  id:'r1801', equipo:'South Cirrus', nombre:'Dario Highton', original:'Itadaki Idomu',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:61,pase:70,defensa:55,especial:64,
  hissatsu:['Brisa de la cúspide', 'Zona Sigma', 'La montaña'],tipoTecnica:'defensa',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1801.webp'
},
{
  id:'r1802', equipo:'South Cirrus', equiposExtra:['Tenderos de South Cirrus'], nombre:'Cedric Freud', original:'Kisoji Heita',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['Regate múltiple', 'Regate Topo'],tipoTecnica:'regate',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1802.webp'
},
{
  id:'r1803', equipo:'South Cirrus', nombre:'Cade Shelby', original:'Kodoukai Kameo',
  posicion:'Defensa', tipo:'Viento',
  tiro:54,pase:56,defensa:68,especial:65,
  hissatsu:['Tortuga danzarina'],tipoTecnica:'defensa',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1803.webp'
},
{
  id:'r1804', equipo:'South Cirrus', nombre:'Meridia Althoff', original:'Koteuchi Nanami',
  posicion:'Defensa', tipo:'Viento',
  tiro:40,pase:56,defensa:68,especial:65,
  hissatsu:['Contragolpe de halcón', 'Torbellino dragón', 'Robo veloz'],tipoTecnica:'regate',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 17.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1804.webp'
},
{
  id:'r1805', equipo:'South Cirrus', nombre:'Lemmy Stretchen', original:'Kurohara Remon',
  posicion:'Defensa', tipo:'Fuego',
  tiro:54,pase:54,defensa:66,especial:63,
  hissatsu:['Niebla sombría', 'Corte Diabólico', 'Corte Mágico'],tipoTecnica:'defensa',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 21.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1805.webp'
},
{
  id:'r1806', equipo:'South Cirrus', nombre:'Winsor Compete', original:'Makushita Teru',
  posicion:'Defensa', tipo:'Montaña',
  tiro:57,pase:57,defensa:69,especial:62,
  hissatsu:['Pisotón vigoroso', 'El Muro', 'Apisonadora'],tipoTecnica:'defensa',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1806.webp'
},
{
  id:'r1807', equipo:'South Cirrus', equiposExtra:['Tenderos de South Cirrus'], nombre:'Briar Bloomhurst', original:'Sakurazaki Jouji',
  posicion:'Delantero', tipo:'Montaña',
  tiro:72,pase:53,defensa:44,especial:67,
  hissatsu:['Destello de fuerza', 'Trueno de primavera', 'Bounce shot'],tipoTecnica:'tiro',
  desc:'Delantero y capitán de South Cirrus en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1807.webp'
},
{
  id:'r1808', equipo:'South Cirrus', nombre:'Destin Billows', original:'Sasanami Unmei',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:62,pase:71,defensa:53,especial:69,
  hissatsu:['Himno de atenea'],tipoTecnica:'regate',
  desc:'Centrocampista y capitán de South Cirrus en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1808.webp'
},
{
  id:'r1809', equipo:'South Cirrus', nombre:'Raika Shinohara', original:'Shinohara Raika',
  posicion:'Delantero', tipo:'Fuego',
  tiro:71,pase:55,defensa:48,especial:62,
  hissatsu:['Tiro rotatorio', 'Entrada rodante', 'Disparo Rodante'],tipoTecnica:'tiro',
  desc:'Delantero de South Cirrus en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1809.webp'
},
{
  id:'r1810', equipo:'South Cirrus', nombre:'Alix La Fontaine', original:'Shisendou Garyuu',
  posicion:'Portero', tipo:'Viento',
  tiro:39,pase:53,defensa:65,especial:64,
  hissatsu:['Barrera de cristal', 'Danza Helada'],tipoTecnica:'portero',
  desc:'Portero de South Cirrus en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1810.webp'
},
{
  id:'r1811', equipo:'South Cirrus', nombre:'Kelvin Steelborne', original:'Tetsuno Kelvin',
  posicion:'Defensa', tipo:'Montaña',
  tiro:45,pase:55,defensa:67,especial:64,
  hissatsu:['Maza metálica', 'Muro de Hierro', 'Mina terrestre'],tipoTecnica:'defensa',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 24.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1811.webp'
},
{
  id:'r1812', equipo:'South Cirrus', nombre:'Amelia Rainwalker', original:'Udou Mirika',
  posicion:'Defensa', tipo:'Viento',
  tiro:50,pase:54,defensa:66,especial:63,
  hissatsu:['Aro hula hoop', 'Gravitación', 'Regate Aurora'],tipoTecnica:'regate',
  desc:'Defensa de South Cirrus en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1812.webp'
},
{
  id:'r1813', equipo:'South Cirrus', nombre:'Davin Bullock', original:'Ushijima Totsugorou',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:59,pase:68,defensa:53,especial:66,
  hissatsu:['Toro a la fuga', 'Zigzag de fuego', 'Engaño Torero'],tipoTecnica:'regate',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1813.webp'
},
{
  id:'r1814', equipo:'South Cirrus', nombre:'Thierry Reyes', original:'Yagyuu Suruga',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:61,pase:70,defensa:55,especial:64,
  hissatsu:['Trueno celestial', 'Mina terrestre'],tipoTecnica:'regate',
  desc:'Centrocampista de South Cirrus en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1814.webp'
},
{
  id:'r1815', equipo:'Back Alley Kickers', nombre:'Jazzmine Skylark', original:'Amakura Maasa',
  posicion:'Defensa', tipo:'Viento',
  tiro:51,pase:61,defensa:73,especial:66,
  hissatsu:['Baile de llamas', 'Danza del viento', 'Ciclón'],tipoTecnica:'regate',
  desc:'Defensa de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1815.webp'
},
{
  id:'r1816', equipo:'Back Alley Kickers', nombre:'Caius Rushford', original:'Hinode Rikiya',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:64,pase:73,defensa:58,especial:71,
  hissatsu:['A todo vapor', 'Carga de Elefantes', 'Mega Terremoto'],tipoTecnica:'tiro',
  desc:'Centrocampista de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1816.webp'
},
{
  id:'r1817', equipo:'Back Alley Kickers', nombre:'Chancer Cosgrave', original:'Inseki Gouhei',
  posicion:'Defensa', tipo:'Fuego',
  tiro:50,pase:60,defensa:72,especial:69,
  hissatsu:['A todo vapor', 'Carga de Elefantes', 'Súper pisotón de sumo'],tipoTecnica:'tiro',
  desc:'Defensa de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1817.webp'
},
{
  id:'r1818', equipo:'Back Alley Kickers', nombre:'June Davidson', original:'June Davidson',
  posicion:'Defensa', tipo:'Bosque',
  tiro:46,pase:58,defensa:70,especial:67,
  hissatsu:['Ataque cortante', 'Carga de Elefantes', 'Mina terrestre'],tipoTecnica:'portero',
  desc:'Defensa de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1818.webp'
},
{
  id:'r1819', equipo:'Back Alley Kickers', nombre:'Frederick Brandt', original:'Kajiwara Heiji',
  posicion:'Delantero', tipo:'Viento',
  tiro:75,pase:59,defensa:42,especial:66,
  hissatsu:['Tornado inverso', 'Tiro Sónico', 'Cañonazo'],tipoTecnica:'defensa',
  desc:'Delantero de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1819.webp'
},
{
  id:'r1820', equipo:'Back Alley Kickers', nombre:'Veril Golding', original:'Kanabuchi Makoto',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['Barrido defensivo', 'Tacón infernal', 'Flecha huracán'],tipoTecnica:'tiro',
  desc:'Centrocampista de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1820.webp'
},
{
  id:'r1821', equipo:'Back Alley Kickers', nombre:'Bogdan Berglund', original:'Kiyama Yoichi',
  posicion:'Delantero', tipo:'Fuego',
  tiro:73,pase:57,defensa:40,especial:68,
  hissatsu:['Remate misil', 'Tacón infernal', 'Bateo total'],tipoTecnica:'regate',
  desc:'Delantero de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1821.webp'
},
{
  id:'r1822', equipo:'Back Alley Kickers', nombre:'Jaxon Taggart', original:'Kunieda Daiju',
  posicion:'Portero', tipo:'Viento',
  tiro:32,pase:50,defensa:68,especial:67,
  hissatsu:['Escudo de fuerza', 'Despeje cohete', 'Despeje de fuerza'],tipoTecnica:'portero',
  desc:'Portero de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1822.webp'
},
{
  id:'r1823', equipo:'Back Alley Kickers', nombre:'Noctis Dunn', original:'Meidou Kazuomi',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['Astro remate', 'Entrada Tormenta', 'Gravitación'],tipoTecnica:'tiro',
  desc:'Centrocampista de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1823.webp'
},
{
  id:'r1824', equipo:'Back Alley Kickers', nombre:'Saburo Mizuki', original:'Mizuki Saburou',
  posicion:'Delantero', tipo:'Montaña',
  tiro:72,pase:56,defensa:39,especial:67,
  hissatsu:['Cañonazo', 'Mina terrestre', 'Disparo con Rebotes'],tipoTecnica:'tiro',
  desc:'Delantero de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1824.webp'
},
{
  id:'r1825', equipo:'Back Alley Kickers', nombre:'Drako Bonner', original:'Mutsui Tatsunosuke',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:65,pase:74,defensa:59,especial:68,
  hissatsu:['Estela ígnea', 'Ultra lunar', 'Barreno de fuego'],tipoTecnica:'defensa',
  desc:'Centrocampista de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1825.webp'
},
{
  id:'r1826', equipo:'Back Alley Kickers', nombre:'Deor Rummond', original:'Nagamine Kingo',
  posicion:'Delantero', tipo:'Fuego',
  tiro:72,pase:56,defensa:35,especial:67,
  hissatsu:['Llamarada infernal', 'Entrada de llamas', 'Apisonadora'],tipoTecnica:'portero',
  desc:'Delantero de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1826.webp'
},
{
  id:'r1827', equipo:'Back Alley Kickers', nombre:'Cobb Hightail', original:'Shiwasu Naota',
  posicion:'Portero', tipo:'Montaña',
  tiro:29,pase:59,defensa:71,especial:66,
  hissatsu:['Bloque dureza', 'Despeje cohete', 'Rechace de fuego'],tipoTecnica:'portero',
  desc:'Portero de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1827.webp'
},
{
  id:'r1828', equipo:'Back Alley Kickers', nombre:'Anson Barker', original:'Tsuchigami Isamu',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:63,pase:72,defensa:57,especial:70,
  hissatsu:['Barrido defensivo', 'Emboscada defensiva', 'Tacón infernal'],tipoTecnica:'defensa',
  desc:'Centrocampista de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1828.webp'
},
{
  id:'r1829', equipo:'Back Alley Kickers', nombre:'Holden Monday', original:'Tsukigawara Gensaku',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:66,pase:75,defensa:57,especial:73,
  hissatsu:['Barrido defensivo', 'Mina terrestre', 'Ataque de paladín'],tipoTecnica:'defensa',
  desc:'Centrocampista y capitán de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1829.webp'
},
{
  id:'r1830', equipo:'Back Alley Kickers', nombre:'Moray Delmar', original:'Umino Choujuurou',
  posicion:'Defensa', tipo:'Viento',
  tiro:43,pase:59,defensa:71,especial:68,
  hissatsu:['Corte giratorio', 'Gran Torbellino', 'Bomba géiser'],tipoTecnica:'regate',
  desc:'Defensa de Back Alley Kickers en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1830.webp'
},
{
  id:'r1831', equipo:'Seagull FC', nombre:'Kata Caballo', original:'Asuma Kazusa',
  posicion:'Portero', tipo:'Viento',
  tiro:24,pase:50,defensa:66,especial:65,
  hissatsu:['Despeje explosivo', 'Golpes de luz', 'Parada de Capoeira'],tipoTecnica:'portero',
  desc:'Portero de Seagull FC en Inazuma Eleven: Victory Road.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1831.webp'
},
{
  id:'r1832', equipo:'Seagull FC', nombre:'Chilton Churner', original:'Himitani Aizou',
  posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:59,defensa:71,especial:64,
  hissatsu:['Pisotón de sumo', 'Escudo corporal', 'Rompehielos'],tipoTecnica:'regate',
  desc:'Defensa de Seagull FC en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1832.webp'
},
{
  id:'r1833', equipo:'Seagull FC', nombre:'Peridot Runehart', original:'Hinaishi Noeru',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['Espejismo', 'Trama trama', 'Visto y no visto'],tipoTecnica:'tiro',
  desc:'Centrocampista de Seagull FC en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1833.webp'
},
{
  id:'r1834', equipo:'Seagull FC', nombre:'Jewel Tremaine', original:'Kanameno Juria',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:63,pase:72,defensa:57,especial:66,
  hissatsu:['Parada fuerte', 'Baile de mariposas', 'Regate espejismo'],tipoTecnica:'portero',
  desc:'Centrocampista de Seagull FC en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1834.webp'
},
{
  id:'r1835', equipo:'Seagull FC', nombre:'Kean Aimes', original:'Kudaira Eimu',
  posicion:'Delantero', tipo:'Fuego',
  tiro:74,pase:55,defensa:36,especial:69,
  hissatsu:['Chut granada', 'Cabezazo cohete', 'Pared solitaria'],tipoTecnica:'defensa',
  desc:'Delantero y capitán de Seagull FC en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1835.webp'
},
{
  id:'r1836', equipo:'Seagull FC', nombre:'Carlton Lawstrom', original:'Mase Rihito',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:63,pase:72,defensa:57,especial:66,
  hissatsu:['Tiro sónico', 'Bomba géiser', 'Remate en V'],tipoTecnica:'defensa',
  desc:'Centrocampista de Seagull FC en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1836.webp'
},
{
  id:'r1837', equipo:'Seagull FC', nombre:'Reamond Lockhard', original:'Mikuraba Real',
  posicion:'Delantero', tipo:'Viento',
  tiro:72,pase:56,defensa:45,especial:67,
  hissatsu:['Tornado inverso', 'Remolino acuático', 'Superbalón rodante'],tipoTecnica:'regate',
  desc:'Delantero de Seagull FC en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1837.webp'
},
{
  id:'r1838', equipo:'Seagull FC', nombre:'Imogen Greenbourne', original:'Nonomori Ema',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:60,pase:69,defensa:54,especial:67,
  hissatsu:['La niebla', 'Zona Sigma', 'Regate espejismo'],tipoTecnica:'defensa',
  desc:'Centrocampista de Seagull FC en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1838.webp'
},
{
  id:'r1839', equipo:'Seagull FC', nombre:'Quip Netley', original:'Rokuroda Jousei',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:62,pase:71,defensa:56,especial:69,
  hissatsu:['Superaceleración', 'Defensa múltiple', 'Finta boomerang'],tipoTecnica:'tiro',
  desc:'Centrocampista de Seagull FC en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1839.webp'
},
{
  id:'r1840', equipo:'Seagull FC', nombre:'Beryl Granger', original:'Saegusa Reira',
  posicion:'Delantero', tipo:'Bosque',
  tiro:70,pase:54,defensa:43,especial:65,
  hissatsu:['Trayectoria perfecta', 'Flecha Divina', 'Mirada al futuro'],tipoTecnica:'tiro',
  desc:'Delantero de Seagull FC en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1840.webp'
},
{
  id:'r1841', equipo:'Seagull FC', nombre:'Plume Hathaway', original:'Shishiba Yuuri',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:61,pase:70,defensa:55,especial:68,
  hissatsu:['Entrada huracán', 'Danza del viento', 'Gran Torbellino'],tipoTecnica:'regate',
  desc:'Centrocampista de Seagull FC en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1841.webp'
},
{
  id:'r1842', equipo:'Seagull FC', nombre:'Summers Laughlin', original:'Shounomiya Manatsu',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:61,pase:70,defensa:55,especial:68,
  hissatsu:['Entrada de llamas', 'Luz Cegadora', 'Corte Volcánico'],tipoTecnica:'defensa',
  desc:'Centrocampista de Seagull FC en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1842.webp'
},
{
  id:'r1843', equipo:'Seagull FC', nombre:'Asuna Sugami', original:'Sugami Asuna',
  posicion:'Delantero', tipo:'Viento',
  tiro:72,pase:56,defensa:39,especial:67,
  hissatsu:['Remolino acuático', 'Balon Angelical', 'Sabiduría Divina'],tipoTecnica:'tiro',
  desc:'Delantero de Seagull FC en Inazuma Eleven: Victory Road, dorsal 20.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1843.webp'
},
{
  id:'r1844', equipo:'Seagull FC', nombre:'Garrison Hayfield', original:'Tanomura Shousei',
  posicion:'Portero', tipo:'Montaña',
  tiro:29,pase:59,defensa:69,especial:64,
  hissatsu:['Parada ardiente', 'Despeje de leñador', 'Despeje de fuerza'],tipoTecnica:'portero',
  desc:'Portero de Seagull FC en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1844.webp'
},
{
  id:'r1845', equipo:'Seagull FC', nombre:'Swae Talltree', original:'Tayutai Yurano',
  posicion:'Defensa', tipo:'Viento',
  tiro:41,pase:59,defensa:71,especial:64,
  hissatsu:['Giro bobina', 'Regate Aurora', 'Gran Torbellino'],tipoTecnica:'regate',
  desc:'Defensa de Seagull FC en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1845.webp'
},
{
  id:'r1846', equipo:'Seagull FC', nombre:'Seon Gulliver', original:'Totogawa Theo',
  posicion:'Defensa', tipo:'Viento',
  tiro:56,pase:56,defensa:68,especial:65,
  hissatsu:['La niebla', 'Regate Aurora', 'Círculo de hielo'],tipoTecnica:'defensa',
  desc:'Defensa de Seagull FC en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1846.webp'
},
{
  id:'r1847', equipo:'Tenderos de South Cirrus', nombre:'Love Stirling', original:'Ai Tsumugu',
  posicion:'Delantero', tipo:'Montaña',
  tiro:64,pase:48,defensa:47,especial:59,
  hissatsu:['Disparo rodante', 'Pingüino emperador n.º 2', 'Lecho de Rosas'],tipoTecnica:'defensa',
  desc:'Delantero de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 10.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1847.webp'
},
{
  id:'r1848', equipo:'Tenderos de South Cirrus', nombre:'Primavera Bluefield', original:'Aota Harumi',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:57,pase:66,defensa:51,especial:60,
  hissatsu:['Bola falsa', 'Confusión', 'Arcoiris luminoso'],tipoTecnica:'defensa',
  desc:'Centrocampista de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 8.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1848.webp'
},
{
  id:'r1849', equipo:'Tenderos de South Cirrus', nombre:'Vera Presswell', original:'Aramine Kiyoko',
  posicion:'Centrocampista', tipo:'Viento',
  tiro:57,pase:66,defensa:51,especial:60,
  hissatsu:['Zigzag explosivo', 'Ciclón doble', 'Tornado Inverso'],tipoTecnica:'tiro',
  desc:'Centrocampista de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 15.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1849.webp'
},
{
  id:'r1850', equipo:'Tenderos de South Cirrus', nombre:'Alvaro Ventura', original:'Hayakaze Toshinobu',
  posicion:'Defensa', tipo:'Viento',
  tiro:49,pase:51,defensa:63,especial:60,
  hissatsu:['Superaceleración', 'Voltereta Círcense', 'Gran Torbellino'],tipoTecnica:'defensa',
  desc:'Defensa de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 4.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1850.webp'
},
{
  id:'r1851', equipo:'Tenderos de South Cirrus', nombre:'Sheila Threadwell', original:'Ishiuri Kiri',
  posicion:'Delantero', tipo:'Bosque',
  tiro:64,pase:48,defensa:39,especial:59,
  hissatsu:['Tiro fantasma', 'Regate espejismo', 'Tiro Espectral'],tipoTecnica:'regate',
  desc:'Delantero de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 11.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1851.webp'
},
{
  id:'r1852', equipo:'Tenderos de South Cirrus', nombre:'Cinnamon Dougherty', original:'Kitano Kaori',
  posicion:'Centrocampista', tipo:'Fuego',
  tiro:54,pase:63,defensa:48,especial:61,
  hissatsu:['Mirada al futuro', 'Lluvia de Meteoros', 'Mirada ladrona'],tipoTecnica:'portero',
  desc:'Centrocampista de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 7.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1852.webp'
},
{
  id:'r1853', equipo:'Tenderos de South Cirrus', nombre:'Brandy Ryehart', original:'Matsutake Umeyo',
  posicion:'Delantero', tipo:'Montaña',
  tiro:64,pase:48,defensa:43,especial:59,
  hissatsu:['Bola de fango', 'Bateo total', 'Arcoiris luminoso'],tipoTecnica:'tiro',
  desc:'Delantero de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 13.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1853.webp'
},
{
  id:'r1854', equipo:'Tenderos de South Cirrus', nombre:'Terra Hillcroft', original:'Miyazono Masako',
  posicion:'Portero', tipo:'Bosque',
  tiro:28,pase:50,defensa:60,especial:59,
  hissatsu:['Tormenta de pétalos', 'Espada Defensora', 'Parada en pirueta'],tipoTecnica:'portero',
  desc:'Portero de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 1.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1854.webp'
},
{
  id:'r1855', equipo:'Tenderos de South Cirrus', nombre:'Gibson Forte', original:'Otode Takehito',
  posicion:'Delantero', tipo:'Viento',
  tiro:64,pase:48,defensa:37,especial:59,
  hissatsu:['Chut de los 100 toques', 'Remate en V', 'Zig Zag Explosivo'],tipoTecnica:'tiro',
  desc:'Delantero de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 9.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1855.webp'
},
{
  id:'r1856', equipo:'Tenderos de South Cirrus', nombre:'He Liu', original:'Ryuu Kaku',
  posicion:'Portero', tipo:'Fuego',
  tiro:37,pase:59,defensa:63,especial:58,
  hissatsu:['Parada ardiente', 'Rechace de fuego', 'Combustión'],tipoTecnica:'portero',
  desc:'Portero de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 12.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1856.webp'
},
{
  id:'r1857', equipo:'Tenderos de South Cirrus', nombre:'Mirina Mackrell', original:'Saba Mirin',
  posicion:'Defensa', tipo:'Fuego',
  tiro:42,pase:50,defensa:62,especial:59,
  hissatsu:['Bola falsa', 'Emboscada defensiva', 'Carga de Elefantes'],tipoTecnica:'tiro',
  desc:'Defensa de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 3.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1857.webp'
},
{
  id:'r1858', equipo:'Tenderos de South Cirrus', nombre:'Marlin Sharkey', original:'Samekawa Hayate',
  posicion:'Defensa', tipo:'Bosque',
  tiro:48,pase:50,defensa:62,especial:59,
  hissatsu:['Ciclón', 'Gran Torbellino', 'Flecha huracán'],tipoTecnica:'defensa',
  desc:'Defensa de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 2.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1858.webp'
},
{
  id:'r1859', equipo:'Tenderos de South Cirrus', nombre:'Newman Wiford', original:'Sarai Shinta',
  posicion:'Centrocampista', tipo:'Bosque',
  tiro:55,pase:64,defensa:49,especial:62,
  hissatsu:['Defensa múltiple', 'Red de caza', 'Mirada ladrona'],tipoTecnica:'regate',
  desc:'Centrocampista de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 14.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1859.webp'
},
{
  id:'r1860', equipo:'Tenderos de South Cirrus', nombre:'Pattie Whitfield', original:'Shirota Manbee',
  posicion:'Defensa', tipo:'Montaña',
  tiro:48,pase:52,defensa:64,especial:61,
  hissatsu:['El muro', 'La gran muralla', 'Círculo de hielo'],tipoTecnica:'defensa',
  desc:'Defensa de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 16.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1860.webp'
},
{
  id:'r1861', equipo:'Tenderos de South Cirrus', nombre:'Lorcan Oxfield', original:'Ushida Takeomi',
  posicion:'Centrocampista', tipo:'Montaña',
  tiro:54,pase:63,defensa:48,especial:61,
  hissatsu:['A todo vapor', 'Carga de Elefantes', 'Remate Tarzán'],tipoTecnica:'regate',
  desc:'Centrocampista de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 6.',
  locked:true,cost:150,
  sprite:'https://inazumarun.es/assets/sprites/r1861.webp'
},
{
  id:'r1862', equipo:'Tenderos de South Cirrus', nombre:'Yelena Poplawska', original:'Yumoto Tsukimi',
  posicion:'Defensa', tipo:'Montaña',
  tiro:55,pase:53,defensa:68,especial:61,
  hissatsu:['Torre inexpugnable', 'Emboscada defensiva', 'Ultra lunar'],tipoTecnica:'regate',
  desc:'Defensa y capitán de Tenderos de South Cirrus en Inazuma Eleven: Victory Road, dorsal 5.',
  locked:true,cost:300,
  sprite:'https://inazumarun.es/assets/sprites/r1862.webp'
}
]

// Entrenadores (prueba con 5 conocidos, sin imagen): pertenecen a un equipo y
// dan un pequeño bonus numérico de ataque y de defensa (puntos sobre la
// escala 0-100 del partido), más su propia intensidad (baja/media/alta) y
// estilo de juego (muy_defensiva, defensiva, equilibrado, ofensiva,
// muy_ofensiva), a petición explícita. Se eligen en los drafts (FutDraft y
// Liga) y en el Modo Mundial (por defecto Hillman con el Raimon).
var COACHES = [
  { id: 'c01', nombre: 'Hillman', original: 'Michiya Kudou', equipo: 'Raimon', atk: 3, def: 3, intensidad: 'media', estilo: 'equilibrado', desc: 'El entrenador del Raimon, tranquilo y estratega.' },
  { id: 'c02', nombre: 'Comandante Hillman', original: 'Fuyuka Kudou', equipo: 'Equipo Ogro', atk: 4, def: 2, intensidad: 'alta', estilo: 'ofensiva', desc: 'Directora deportiva del Raimon, apuesta por el ataque.' },
  { id: 'c03', nombre: 'Ray Dark', original: 'Reiji Kageyama', equipo: 'Royal Academy', atk: 3, def: 2, intensidad: 'alta', estilo: 'muy_ofensiva', desc: 'Estratega implacable que lo arriesga todo al ataque.' },
  { id: 'c04', nombre: 'Elzes Killard', original: 'Elzes Killard', equipo: 'Neo Raimon', atk: 3, def: 3, intensidad: 'alta', estilo: 'ofensiva', desc: 'Director del Genesis, exige rendimiento máximo.' },
  { id: 'c05', nombre: 'Zoolan Rice', original: 'Zoolan Rice', equipo: 'Zoolan Team', atk: 2, def: 4, intensidad: 'baja', estilo: 'defensiva', desc: 'Prefiere un equipo cerrado y sin riesgos.' },
  { id: 'c06', nombre: 'Mr. D', original: 'Mr. D', equipo: 'Orfeo', atk: 2, def: 4, intensidad: 'alta', estilo: 'defensivo', desc: 'Frío y calculador, dirige con mano de hierro.' },
  { id: 'c07', nombre: 'Astero Black', original: 'Ray Dark', equipo: 'Earth Eleven', atk: 4, def: 3, intensidad: 'alta', estilo: 'muy_ofensiva', desc: 'Ray Dark, el líder oscuro que lo sacrifica todo por ganar.' },
  { id: 'c08', nombre: 'David Evans', original: 'Daisuke Endou', equipo: 'Pequeños Gigantes', atk: 3, def: 3, intensidad: 'media', estilo: 'equilibrado', desc: 'El entrenador de Inazuma Japón, siempre optimista.' },
  { id: 'c09', nombre: 'Hekyll Jyde', original: 'Hekyll Jyde', equipo: 'Occult', atk: 2, def: 1, intensidad: 'media', estilo: 'ofensiva', desc: 'Entrenador ambicioso que apuesta por el ataque.' },
  { id: 'c10', nombre: 'Stewart Vanguard', original: 'Stewart Vanguard', equipo: 'Servicio Secreto', atk: 2, def: 2, intensidad: 'baja', estilo: 'defensiva', desc: 'Estratega prudente que prioriza no encajar.' },
  { id: 'c11', nombre: 'Nerina Hartland', original: 'Nerina Hartland', equipo: 'Sallys', atk: 2, def: 2, intensidad: 'media', estilo: 'equilibrado', desc: 'Entrenadora equilibrada que cuida cada detalle.' },
  { id: 'c12', nombre: 'Percival Travis', original: 'Percival Travis', equipo: 'Inazuma Japón', atk: 3, def: 3, intensidad: 'media', estilo: 'equilibrado', desc: 'Entrenador de Inazuma Japón, serio y disciplinado.' },
  { id: 'c13', nombre: 'Wonderbot', original: 'Wonderbot', equipo: 'Los Arions', atk: 2, def: 3, intensidad: 'media', estilo: 'equilibrado', desc: 'El robot entrenador, siempre animando al equipo.' },
  { id: 'c14', nombre: 'Mark Evans adulto', original: 'Mark Evans', equipo: 'Raimon', atk: 4, def: 3, intensidad: 'alta', estilo: 'ofensiva', desc: 'El eterno capitán convertido en entrenador, todo pasión.' },
  { id: 'c15', nombre: 'Jude Sharp adulto', original: 'Jude Sharp', equipo: 'Royal Academy GO', atk: 3, def: 4, intensidad: 'media', estilo: 'equilibrado', desc: 'El estratega de las gafas, ahora desde el banquillo.' },
  { id: 'c16', nombre: 'Destiny Billows', original: 'Destin Billows', equipo: 'Neo Raimon', atk: 3, def: 3, intensidad: 'media', estilo: 'equilibrado', desc: 'Entrenador táctico de gran carisma.' },
  { id: 'c17', nombre: 'Dave Quagmire', original: 'Dave Quagmire', equipo: 'Kirkwood GO', atk: 3, def: 3, intensidad: 'media', estilo: 'equilibrado', desc: 'Entrenador pasional.' }

];

/* Tipo de CADA supertécnica. tipoTecnica va por jugador (uno para todas sus
   técnicas) y había muchas mal ("Defensa Huracán" salía como regate, los
   Pingüino Emperador como regate, paradas de portero como tiro...). Aquí
   se corrigen técnica a técnica; las que no están en esta lista siguen
   usando el tipoTecnica de su jugador. Tipos: tiro, regate, defensa,
   portero, pase. Ver hissatsuTipo() en js/core.js. */
var HISSATSU_TIPO = {
  // Técnicas añadidas al llevar cada jugador hasta 3; tipo según la wiki.
  'Defensa Triple': 'portero', 'Ruptura Relámpago': 'tiro', 'Tornado dragón': 'tiro', 'Zig Zag Explosivo': 'regate',
  'Tormenta del tigre': 'tiro', 'Escudo de Fuerza Total': 'portero', 'La aurora': 'tiro', 'Ventisca de fuego': 'tiro',
  'Gran tifón': 'tiro', 'Sorpresa': 'defensa', 'Arrollador': 'regate', 'Abrazo del Oso': 'defensa',
  'Furia de oso': 'tiro', 'Muro de piedra': 'defensa', 'Mangual leteal': 'tiro', 'Disparo sagrado': 'tiro',
  'Golpe doble': 'tiro', 'Torre perfecta': 'defensa', 'Tri-Pegaso': 'tiro', 'Chicle burbuja': 'regate',
  'Tiro valiente': 'tiro', 'Cúpula Sónica': 'regate', 'Superremate rebotado': 'tiro', 'Balón yo-yo': 'defensa',
  'Zero Magnum': 'tiro', 'Volteador de mesas': 'portero', 'Puño Vengativo': 'portero', 'Tormenta estelar': 'tiro',
  'Repulsión': 'portero', 'Red procyon': 'portero', 'Mano Espiritual': 'portero', 'Bomba Falsa': 'defensa',
  'Tornado de Fuego DT': 'tiro', 'Remate combinado f': 'tiro', 'Ataque Omega': 'tiro', 'Giro atómico': 'tiro',
  'Alba Oscura': 'tiro', 'Poder parkour': 'tiro', 'Remolino de hojas': 'regate', 'Choque Sirena': 'tiro',
  'Muralla infinita': 'portero', 'Tormenta de fuego': 'tiro', 'Cabezazo megatón': 'tiro', 'Despeje de Fuego': 'portero',
  'Remate Triple': 'tiro', 'Arrollador floral': 'tiro', 'Paso warp': 'regate', 'Centro de Gravedad': 'portero',
  'Campo Umbrío': 'tiro', 'El detonador': 'tiro', 'Zigzag veloz': 'tiro', 'Combate kung fu': 'tiro',
  'Lluvia de azufre': 'tiro', 'La bestia trueno': 'tiro', 'Despeje de fuego': 'portero', 'Arco iris': 'tiro',
  'Entrada Relámpago': 'regate', 'Gaviota dorada': 'tiro', 'Giro chispas': 'regate', 'Bomba daruma': 'tiro',
  'Pingüino Aéreo': 'tiro', 'Lanza real': 'tiro', 'Jaula de gravedad': 'defensa', 'Chut Congelante': 'tiro',
  'Martillo de agujas': 'portero', 'Escudo Protector': 'portero', 'Uñas Afiladas': 'portero', 'Arrollador 3/Coz 3': 'regate',
  'Escudo de fuerza total': 'portero', 'Mirada amenazante': 'regate', 'Ruptura kabuki': 'tiro', 'Tripegaso': 'tiro',
  'Parada de Capoeira': 'portero', 'Barajeo topo': 'regate', 'Huracán': 'tiro', 'Simún': 'portero',
  'Espada Defensora': 'portero', 'Ruptura relámpago': 'tiro', 'Armadillo Circense': 'regate', 'Remate asalto': 'tiro',
  'Arrollador 2/Coz 2': 'regate', 'Constelación Estelar': 'portero', 'Muralla Infinita': 'portero', 'Carrera triple': 'regate',
  'Fuego total': 'tiro', 'Carga de poder': 'defensa', 'Jinete de la tormenta': 'portero', 'Explosión confusa': 'regate',
  'Recepción Negativa': 'portero', 'Ciclón Humano': 'portero', 'Furia de los elementos': 'tiro', 'Matriz selladora': 'regate',
  'Dardo Acuático': 'portero', 'Caída Prehistórica': 'defensa', 'Emboscada': 'defensa', 'Bejuco Gigante': 'tiro',
  'Colmillo de Cocodrilo': 'portero', 'Juego de pies': 'defensa', 'Golpe Abrasador': 'portero', 'Mano Omega': 'portero',
  'Puño de Furia': 'portero', 'Caída torbellino': 'tiro', 'Bloqueo Doble': 'portero', 'Eclipse Lunar': 'portero',
  'Trampa tornado': 'defensa', 'Engaño divino': 'regate', 'Baile del Carnaval': 'tiro', 'Subterfugio': 'regate',
  'Cometa legendario': 'tiro', 'Carruaje Insano': 'tiro', 'Campo de contención': 'defensa', 'Centrifugación Brutal': 'tiro',
  'Zona Sagrada': 'portero', 'Tiro amasado': 'tiro', 'Círculo de Espadas': 'tiro', 'Giro supremo': 'defensa',
  'Tornado Venenoso': 'regate', 'Piroclástico': 'regate', 'Bala de Cañón': 'tiro', 'Parada de Espaguetis': 'portero',
  'Cuerno de Bisonte': 'tiro', 'Cataclismo Rojo': 'tiro', 'Mega muro': 'defensa', 'Malla Letal': 'portero',
  'Acorde difuso': 'regate', 'Triángulo Letal 2': 'tiro', 'Brisa Encabritada': 'regate', 'Super Puño Invencible': 'portero',
  'Súper Relámpago': 'tiro', 'Trueno de primavera': 'tiro', 'Danza Helada': 'portero',
  'Defensa Huracán': 'defensa', 'Entrada Huracán': 'regate', 'Entrada huracán': 'regate', 'Entrada Tormenta': 'regate',
  'Baile de Llamas': 'defensa', 'Corte Volcánico': 'defensa', 'Gravitación': 'defensa', 'Jaula gravitatoria': 'defensa',
  'Mega Terremoto': 'defensa', 'Muro Viviente': 'defensa', 'Cálculo Perfecto': 'defensa', 'Grumo Pegapasta': 'defensa',
  'Red de caza': 'defensa', 'Tormenta de Arena': 'defensa',
  'Pingüino emperador n.º 2': 'tiro', 'Pinguino Emperador X': 'tiro', 'Pinguino Espacial': 'tiro', 'Pingüino emperador n.º 3': 'tiro',
  'Pingüino Emperador Nº2': 'tiro', 'Pingüino emperador 7': 'tiro', 'Pingüino emperador n.º 1': 'tiro', 
  'Lanza Letal': 'tiro', 'Lanza letal': 'tiro', 'Sabiduría Divina': 'tiro',
  'Agujero negro': 'portero', 'Colmillo de pantera': 'portero', 'Mano celestial': 'portero', 'Manos liberadas': 'portero',
  'Parada Celestial': 'portero', 'Tormenta de pétalos': 'portero', 'Combustión': 'portero', 'Garra Salvaje': 'portero',
  'Parada mate': 'portero', 'Ultratécnica': 'portero', 'Furia Contenida': 'portero', 'Guardia del Coliseo': 'portero',
  'Muro Dimensional': 'portero', 'Muro del Miedo': 'portero', 'Defensa Automática': 'portero',
  'Bola Falsa': 'defensa', 'Espejismo de Balón': 'regate', 'Espejismo de balón': 'regate', 'Patín Aereo': 'regate',
  'Teleportación': 'regate', 'Superaceleración': 'regate', 'Lluvia de meteoros': 'regate', 'Lluvia de Meteoros': 'regate',
  'Agujero de gusano': 'portero', 'Barreno de fuego': 'defensa', 'Tiro sobrenatural': 'tiro', 'Balón de plasma': 'tiro',
  'Barrena voladora': 'regate', 'Piroquinesis': 'regate', 'Choque directo': 'regate', 'Cascabel': 'tiro', 'Flecha de cupido': 'tiro',
  'Pase Cruzado': 'tiro', 'Pase cruzado': 'tiro', 'Pase preciso': 'pase', 'Pase brasileño': 'pase',
  // Técnicas del once de la Temporada 1 (r537-r593)
  'Regate múltiple': 'regate', 'Chut de los 100 toques': 'tiro', 'Robo veloz': 'defensa', 'Tornado inverso': 'tiro', 'Remate combinado': 'tiro', 'Mirada ladrona': 'defensa', 'Visto y no visto': 'regate', 'Ataque de las sombras': 'defensa', 'Bola falsa': 'defensa', 'Gravedad': 'defensa', 'Ciclón': 'defensa', 'Bateo total': 'tiro', 'Tiro fantasma': 'tiro', 'Torbellino dragón': 'regate', 'Tiro cegador': 'tiro', 'Terremoto': 'defensa', 'Arcoiris luminoso': 'tiro', 'Barrido defensivo': 'defensa', 'Entrada de llamas': 'regate', 'Pájaro de fuego': 'tiro', 'Remate dragón': 'tiro', 'Chut granada': 'tiro', 'Corte giratorio': 'defensa',
  // Técnicas del once de la Temporada 2 y 3
  'Remate en espiral': 'tiro', 'Cortafuegos': 'defensa', 'Astro remate': 'tiro', 'Bola de fango': 'tiro', 'Entrada rodante': 'defensa', 'Ataque cortante': 'defensa', 'Giro de mono': 'regate', 'Balon iceberg': 'tiro', 'Rompehielos': 'defensa', 'Lanza de odín': 'tiro', 'Giro bobina': 'defensa', 'Luna creciente': 'regate', 'Rayo de Ganímedes': 'tiro', 'Patada canguro': 'regate', 'Telaraña': 'defensa', 'Remate tsunami': 'tiro', 'Escudo corporal': 'defensa', 'Entrada tormenta': 'regate', 'Zigzag de fuego': 'defensa', 'Defensa múltiple': 'defensa', 'Hora celestial': 'regate', 'Bomba acrobática': 'tiro', 'Balón galgo': 'regate', 'Espejismo': 'regate', 'Baile de llamas': 'defensa', 'Estrella fugaz': 'defensa', 'Carga negativa': 'tiro', 'Corte diabólico': 'defensa', 'Llamarada infernal': 'tiro', 'Balón diabólico': 'regate', 'Tacón infernal': 'regate', 'Cinto astral': 'defensa', 'Coz 3': 'regate', 'Ultra lunar': 'regate', 'Triangulo letal': 'tiro', 'Fénix oscuro': 'tiro',
  // Equipos de Inazuma Eleven GO Chrono Stone (GO 2) y Galaxy (GO 3), datos de la wiki de Inazuma Eleven
  'Bobina eléctrica': 'defensa', 'Carga de elefantes': 'defensa', 'Aplastamiento': 'portero', 'Campo de fuerza defensivo': 'portero', 'Tiro rotativo': 'tiro', 'Pinzas cortantes': 'defensa', 'Cabezazo bazuca': 'tiro', 'Salto explosivo': 'regate', 'Zigzag explosivo': 'regate', 'Magnetismo': 'defensa', 'Remate del tigre': 'tiro', 'La gran muralla': 'defensa', 'Corte mágico': 'defensa', 'Caída planetaria': 'tiro', 'Ataque de garza': 'regate', 'Triple amenaza': 'tiro', 'El muro': 'defensa', 'Estrella oscura': 'tiro', 'Campo torbellino': 'defensa', 'Corte de arena': 'portero', 'Golpe de vacío': 'defensa', 'Bomba saltarina': 'tiro', 'Ultrasonidos': 'portero', 'Llamarada atómica': 'tiro', 'Rayo de puño': 'portero', 'Barrera de Gaia': 'portero', 'Despliegue de señuelos': 'regate', 'Regate topo': 'regate', 'Gran Lobo': 'tiro', 'Fiesta floral': 'defensa', 'Sello gigante': 'regate', 'Finta boomerang': 'regate', 'Doble hélice': 'tiro', 'Remolino acuático': 'regate', 'Presa fractal': 'defensa', 'Torre inexpugnable': 'defensa', 'Despeje explosivo': 'portero', 'A todo vapor': 'defensa', 'Robo fantástico': 'defensa', 'Niebla mística': 'defensa', 'Tiro vendaval': 'tiro', 'La niebla': 'defensa', 'El ojo del huracán': 'regate', 'Campo minado': 'defensa', 'Cabezazo gigatón': 'tiro', 'Picadora': 'defensa', 'Tornado de fuego': 'tiro', 'Rematerialización': 'regate', 'Puños certeros': 'portero', 'Ancla de navío': 'portero', 'Formateo de disco': 'regate', 'Proyectil letal': 'tiro', 'Mordisco de serpiente': 'portero', 'Engranajes aceleradores': 'tiro', 'Mina terrestre': 'regate', 'Remate Rebotado': 'tiro', 'Tormenta dimensional': 'tiro', 'Mirada al futuro': 'regate', 'Captura excelente': 'portero', 'Onda chispeante': 'tiro', 'Círculo de hielo': 'regate', 'Pasos aéreos': 'regate', 'Muralla de Atlantis': 'defensa', 'Himno de atenea': 'regate', 'Trance melódico': 'regate', 'Avance chispeante': 'regate', 'Tiro sónico': 'tiro', 'Acrobacia robótica': 'defensa', 'Estampida en línea': 'regate', 'Doble trallazo planetario': 'tiro', 'Ventisca eterna': 'tiro', 'Despeje medialuna': 'portero', 'Torbellino de fuego': 'tiro', 'Rodillazos atómicos': 'regate', 'Escudo de fuerza': 'portero', 'Cruz del sur': 'regate', 'Remolino ígneo': 'regate', 'Muralla de las montañas': 'defensa', 'Tiro de arcabuz': 'tiro', 'Confusión': 'regate', 'Parada en plancha': 'portero', 'Presa de sombras': 'portero', 'Chut ancestral': 'tiro', 'Ciclón blanco': 'tiro', 'Fortaleza nocturna': 'defensa', 'Defensa propulsada': 'defensa', 'Obstrucción eléctrica': 'defensa', 'Fuerza centrífuga': 'defensa', 'Impulso del equipo definitivo': 'tiro', 'Espada de Odín': 'tiro', 'Trayectoria perfecta': 'tiro', 'Remate orbital': 'tiro', 'Arco psíquico': 'regate', 'Bloqueo telequinético': 'defensa', 'Bofetón látigo': 'regate', 'Sacrificio': 'portero', 'Estrella reflectante': 'portero', 'Formación defensiva': 'defensa', 'Cabezazo cohete': 'tiro', 'Espada de  atlas': 'regate', 'Tiro del corazón real': 'tiro', 'Portón del castillo': 'portero', 'Muralla Gigante': 'portero', 'Salto champiñón': 'regate', 'Presa de zarcillo': 'defensa', 'Trampa vegetal': 'portero', 'Grito del edén': 'tiro', 'Corte de guadaña bajo': 'regate', 'Regate en Z': 'regate', 'Copia y corta': 'defensa', 'Cabezazo volcánico': 'portero', 'Vuelo volcánico': 'defensa', 'Roca volcánica': 'tiro', 'Lecho de lava': 'regate', 'Estela ígnea': 'defensa', 'Bolea ígnea': 'regate', 'Relámpago volcánico': 'tiro', 'Despeje virtual': 'portero', 'Viento celestial': 'tiro', 'Defensa holográfica': 'regate', 'Grumo pegapasta': 'defensa', 'Robo sigiloso': 'defensa', 'Rayo del juicio': 'defensa', 'Sincronía logística': 'defensa', 'Ofensiva danzarina': 'tiro', 'Amplificador mágico': 'tiro', 'Danza del viento': 'regate', 'Arrancada': 'regate', 'Paisaje helado': 'defensa', 'Cruce explosivo': 'regate', 'Misil arenoso': 'tiro', 'Excavación': 'regate', 'Puño de arena': 'portero', 'Tuneladora': 'defensa', 'Mirada intimidante': 'regate', 'Tiro efervescente': 'tiro', 'Gran catarata': 'defensa', 'Chorro rebotante': 'regate', 'Megalodón': 'tiro', 'Zarpazo poderoso': 'portero', 'Olor embriagador': 'defensa', 'Gran torbellino': 'defensa', 'Peces voladores': 'tiro', 'Tiro pirueta': 'tiro', 'Pompa de chicle': 'regate', 'Fuego rápido': 'tiro', 'Rechace de fuego': 'portero', 'Tiro elefante': 'tiro', 'Siega central': 'defensa', 'Truco balonazo': 'regate', 'Parada de codo': 'portero', 'Ruta de la seda': 'regate', 'La fiebre del oro': 'tiro', 'Despeje retorcido': 'portero', 'Defensa radial': 'defensa', 'Cabezazo catapulta': 'tiro', 'Tormenta de arena': 'defensa', 'Deriva desértica': 'regate', 'Balón de petróleo': 'tiro', 'Coletazo de dragón': 'tiro',
  // Equipos de Inazuma Eleven Ares y Orion, datos de la wiki de Inazuma Eleven
  'Crosscut feint': 'regate', 'Engaño torero': 'regate', 'Parada fuerte': 'portero', 'Curve shot': 'tiro', 'Descenso estelar': 'tiro', 'Deceptive step': 'regate', 'Curving cut': 'defensa', 'Amago de tiro': 'regate', 'Jaula de piedra': 'defensa', 'Dust kick': 'regate', 'Cunning pull': 'defensa', 'Chip shot': 'tiro', 'Cañón de meteoritos': 'tiro', 'Heel flick': 'regate', 'Subida a los cielos': 'defensa', 'Mighty save': 'portero', 'Remate tarzán': 'tiro', 'Low drive': 'tiro', 'Power shot': 'tiro', 'Carrera relámpago': 'regate', 'Feint dash': 'regate', 'Ataque de cóndor': 'tiro', 'Feint play': 'defensa', 'Bloque de Hielo': 'portero', 'Nutmeg': 'regate', 'Zona Sigma': 'defensa', 'Ritmo agresivo': 'regate', 'Shoulder tackle': 'defensa', 'Regate espejismo': 'regate', 'Bounce shot': 'tiro', 'Torbellino interceptor': 'defensa', 'Sierra celestial': 'tiro', 'Escudo lunar': 'portero', 'Regate divino': 'regate', 'Túnel tornado': 'regate', 'Bimano celestial': 'portero', 'Sprint triple': 'regate', 'Potenciación': 'regate', 'Regate aurora': 'regate', 'Mega terremoto': 'defensa', 'Aullido de lobo': 'tiro', 'Dragón terrestre': 'tiro', 'Rolling steal': 'defensa', 'Ataque meteorito': 'tiro', 'Dúo magma': 'defensa', 'Remolino cortante': 'regate', 'Mate del dragón': 'portero', 'Chut de los 200 toques': 'tiro', 'Ecuación defensiva': 'defensa', 'Pase doble': 'regate', 'Excalibur': 'tiro', 'Tormenta solar': 'tiro', 'Disparo rodante': 'tiro', 'Victoria tricolor': 'tiro', 'Parada peliaguda': 'portero', 'Zona de contención': 'defensa', 'Strong punch': 'portero', 'Corte volcánico': 'defensa', 'Disparo con rebotes': 'tiro', 'Ilusión deslumbrante': 'defensa', 'Lanzallamas': 'portero', 'Triángulo letal final': 'tiro', 'Patín aéreo': 'regate', 'Dientes de roca': 'defensa', 'Pingüino perfecto': 'tiro', 'Pirueta rascacielos': 'defensa', 'Carrera del esfuerzo': 'regate', 'Ataque de la ballena': 'defensa', 'Big bang': 'tiro', 'Pisotón de sumo': 'defensa', 'Diluvio letal': 'tiro', 'Muralla tsunami': 'portero', 'Inmersión': 'regate', 'León devorador': 'defensa', 'Ángel de nieve': 'defensa', 'Escudo bárbaro': 'defensa', 'Psicorremate': 'tiro', 'Chilena de pingüino': 'tiro', 'Tormenta, tornado, huracán!': 'tiro', 'Flecha huracán': 'defensa', 'La montaña': 'defensa', 'Niebla sombría': 'defensa', 'Escáner ataque': 'regate', 'Remate misil': 'tiro', 'Cañón celestial': 'tiro', 'Bloque dureza': 'portero', 'Niebla venenosa': 'regate', 'Aullido de licantropo': 'tiro', 'Trampolín relámpago': 'tiro', 'Supertrampolín relámpago': 'tiro', 'Maldición': 'regate', 'Tornado doble': 'tiro', 'Fórmula matemática': 'defensa', 'Liebre blanca': 'tiro', 'Disparo cósmico': 'tiro', 'Frankendefensa': 'defensa', 'Cabezazo moái': 'defensa', 'Aikido': 'regate', 'Golf total': 'tiro', 'Paipay gigante': 'regate', 'Superarmadillo': 'regate', 'Carrera a tres piernas': 'regate', 'Rizo de Dragón': 'tiro', 'Remate múltiple': 'tiro', 'Voltereta circense': 'defensa', 'Engaño yoyó': 'defensa', 'Tirachinas': 'tiro', 'Sapo ninja': 'tiro', 'Remate dinosaurio': 'tiro', 'Esferas luminosas': 'regate', 'Golpes de luz': 'portero', 'Mano diabólica': 'portero', 'Lluvia oscura': 'tiro', 'Pared solitaria': 'regate', 'Aguijón': 'portero', 'Remate del águila': 'tiro', 'Truco de magia': 'regate', 'Avance flamígero': 'regate', 'Despeje a presión': 'portero', 'Súper elástico': 'regate', 'Gravedad grave': 'defensa', 'Puños voladores': 'portero', 'Pantalla ígnea': 'regate', 'Embestida': 'defensa', 'Gran Sabio': 'defensa', 'Rompetiros': 'portero', 'Cortina aurora': 'portero', 'Contra': 'tiro', 'Ignición': 'regate', 'Regate supersónico': 'regate', 'Salto dimensional': 'defensa', 'Cabezazo kung fu': 'tiro', 'Guardia acrobática': 'regate',
  // Equipos de Inazuma Eleven: Victory Road, datos de la wiki de Inazuma Eleven
  'Abrazo divino': 'portero', 'Despeje de leñador': 'portero', 'Duna gravitacional': 'portero', 'Gran resplandor': 'regate', 'Despeje cohete': 'portero', 'Espada solar': 'tiro', 'Luz del mariscal': 'regate', 'Desfile de pingüinos': 'tiro', 'Eclispe lunar': 'portero', 'El fuerte': 'defensa', 'Flecha divina': 'tiro', 'Remate celestial': 'tiro', 'Zona de seguridad': 'defensa', 'Buzo profundo': 'defensa', 'Tiro tramposo': 'tiro', 'Cataratas del niágara': 'regate', 'Tiro Giratorio': 'tiro', 'Extramundo': 'portero', 'Estrella de roca': 'defensa', 'Ciclón oscuro': 'portero', 'Golpe cataclismo': 'tiro', 'Remate de seguridad': 'tiro', 'Muralla de escudos': 'portero', 'Cañón Dragón': 'tiro', 'Proyectil de ozono': 'defensa', 'Mirada asesina': 'regate', 'Pincelada silenciosa': 'portero', 'Luz cegadora': 'defensa', 'Súper pisotón de sumo': 'defensa', 'Baile de mariposas': 'tiro', 'Prima donna': 'regate', 'Lecho de Rosas': 'tiro', 'Parada ardiente': 'portero', 'Bomba géiser': 'regate', 'Fénix': 'tiro', 'Tiro de francotirador': 'tiro', 'Gran explosión': 'tiro', 'Jungla profunda': 'defensa', 'Regate fantasmal': 'regate', 'Visión de matriz': 'regate', 'Robo teatral': 'defensa', '¡Hala! ¡Una bola de arroz!': 'regate', 'Marlín volador': 'tiro', 'Ritmo eléctrico': 'regate', 'Círculo elegante': 'regate', 'Impulso de resolución': 'tiro', 'Brisa de la cúspide': 'regate', 'Tortuga danzarina': 'defensa', 'Contragolpe de halcón': 'regate', 'Pisotón vigoroso': 'defensa', 'Destello de fuerza': 'tiro', 'Tiro rotatorio': 'tiro', 'Maza metálica': 'defensa', 'Aro hula hoop': 'regate', 'Toro a la fuga': 'defensa', 'Trueno celestial': 'tiro', 'Cañonazo': 'tiro', 
  // Tipo de cada técnica según la wiki (inazuma.fandom.com/es)
  'Mano Mágica': 'portero', 'Tornado de Fuego': 'tiro', 'Remate Dragón': 'tiro', 'El Muro': 'defensa', 'Paisaje Helado': 'defensa',
  'Remate del Tigre': 'tiro', 'Corte Giratorio': 'defensa', 'Escudo de Fuerza': 'portero', 'Cañon de Meteoritos': 'tiro', 'Puerta Astral': 'tiro',
  'Balón Iceberg': 'tiro', 'Remate Tsunami': 'tiro', 'Llamarada Atómica': 'tiro', 'Campo Torbellino': 'defensa', 'Remate Cazaosos': 'tiro',
  'Brisa deslizante': 'regate', 'Pentagrama': 'tiro', 'Niebla Mística': 'defensa', 'Aguijón Letal': 'tiro', 'Tornado oscuro': 'tiro',
  'Remate Gafas': 'tiro', 'Mano Celestial': 'portero', 'Pisotón de Sumo': 'defensa', 'La Tierra': 'tiro', 'Disparo Rodante': 'tiro',
  'Cabezazo Kung Fu': 'tiro', 'Remate en V': 'tiro', 'Doppelganger': 'defensa', 'Remate Gafas v2': 'tiro', 'Torre Inexpugnable': 'defensa',
  'Destrozataladros': 'portero', 'Remate de Gaia': 'tiro', 'Tiro torre de Osaka': 'tiro', 'Remate de hielo': 'tiro', 'Remate Unicornio': 'tiro',
  'Muro de Hierro': 'defensa', 'Disparo Valiente': 'tiro', 'Balon Angelical': 'regate', 'Voltereta Círcense': 'defensa', 'Aguijones escarlata': 'tiro',
  'Carga Negativa': 'tiro', 'Remate Celestial': 'tiro', 'Engaño Torero': 'regate', 'Ceniza Negra': 'tiro', 'Golpe Cataclismo': 'tiro',
  'Cuchilla Asesina': 'portero', 'Tiro Fantasma': 'tiro', 'Barrido Defensivo': 'defensa', 'Ataque de Cóndor': 'tiro', 'Giro de Mono': 'regate',
  'Remate Tarzán': 'tiro', 'Remate Serpiente': 'tiro', 'Doppelgänger': 'defensa', 'Hora Celestial': 'regate', 'Disparo con Rebotes': 'tiro',
  'Flecha Divina': 'tiro', 'Apisonadora': 'defensa', 'Remate Rebotado V2': 'tiro', 'Robo Planeta': 'defensa', 'Rapto Divino': 'tiro',
  'Cañón de Meteoritos': 'tiro', 'Astro Remate': 'tiro', 'Mano Celestial X': 'portero', 'Disparo X': 'tiro', 'Tormenta Solar': 'tiro',
  'Peces Voladores': 'tiro', 'Parada en Plancha': 'portero', 'Juego de piernas': 'defensa', 'Taconazo Parkour': 'tiro', 'Bola de Hojas': 'defensa',
  'Aro-AleHop': 'regate', 'Cañonazo de fragmentos': 'tiro', 'Golpe de Samba': 'tiro', 'Supernova': 'tiro', 'Campo de fuerza': 'regate',
  'Escáner Defensa': 'defensa', 'Tiro dinamita': 'tiro', 'Remate Misil': 'tiro', 'Remate Múltiple': 'tiro', 'Bola de Fango': 'tiro',
  'Rueda infernal': 'regate', 'Cabezazo Kung-fu': 'tiro', 'Superbalón rodante': 'tiro', 'Ciclon': 'defensa', 'Cañón Celestial': 'tiro',
  'Chut Granada': 'tiro', 'Agujero de Gusano': 'portero', 'Megalodon': 'tiro', 'Aullido de Licántropo': 'tiro', 'Mordisco de Vampiro': 'tiro',
  'Cañonazo de Fragmentos V2': 'tiro', 'Tormenta Dimensional': 'tiro', 'Tiro Supermasivo': 'tiro', 'Agujero Blanco': 'portero', 'Luz Cegadora': 'defensa',
  'Polen Devastador': 'tiro', 'Tiro Supermasivo V2': 'tiro', 'Futuro Negativo': 'tiro', 'Romance de los Tres Reinos': 'portero', 'La Flamme': 'defensa',
  'Chut prehistórico': 'tiro', 'Corriente Negra': 'regate', 'Espada Real': 'regate', 'Tormenta Eléctrica': 'tiro', 'Soy Todopoderoso': 'tiro',
  'Salto Dimensional': 'defensa', 'Estrella Reflectante': 'portero', 'Tiro Espectral': 'tiro', 'Tiro Sónico': 'tiro', 'Tiro Balista': 'tiro',
  'Gran Torbellino': 'defensa', 'Bloqueo Ballena': 'defensa', 'Sombra de Orión': 'tiro', 'Escudo sombrío': 'portero', 'Campo Torbellino V2': 'defensa',
  'Lanza de Odín V2': 'tiro', 'Agujero de Gusano V2': 'portero', 'Tornado Oscuro': 'tiro', 'Estrella Fugaz': 'defensa', 'Fénix Oscuro': 'tiro',
  'Remate Guiverno': 'tiro', 'Cañón dragón': 'tiro', 'Manos infinitas': 'portero', 'Remate Pegaso': 'tiro', 'Escaner Defensa': 'defensa',
  'Descodificación': 'regate', 'Tiro Cegador': 'tiro', 'Mandril': 'portero', 'Campo de Fuerza': 'regate', 'Despeje a Presión': 'portero',
  'Regate Aurora': 'regate', 'Proyectil de Ozono': 'defensa', 'Cañon Dragón': 'tiro', 'Truco de Magia': 'regate', 'Ave goleadora': 'tiro',
  'Flecha de hielo': 'pase', 'Lanza polar': 'tiro', 'Tiro meteórico': 'tiro', 'Laberinto': 'regate', 'Cabezazo fiero': 'tiro',
  'Granizado de fuego': 'tiro', 'Viento centelleante': 'regate', 'Mano oceánica': 'portero', 'Velo de sirena': 'portero', 'Atajo Tornado': 'portero',
  'Giro Bobina': 'defensa', 'Equilibrismo': 'regate', 'Escáner Ataque': 'regate', 'Deslizamiento de portería': 'portero', 'Regate Topo': 'regate',
  'Tiro del cometa': 'tiro', 'Triángulo Z': 'tiro', 'Tornado Inverso': 'tiro', 'Electrotrampa': 'portero', 'Placaje Extremo': 'defensa',
  'Corte Diabólico': 'defensa', 'Carga de Elefantes': 'defensa', 'Diluvio Letal': 'tiro', 'Placaje extremo': 'defensa', 'Ícaro': 'regate',
  'Remate Bahamut': 'tiro', 'Flash de fotones': 'defensa', 'Taconazo Parkour v2': 'tiro', 'Cabezazo catapulta v2': 'tiro', 'Golpe Kabuki': 'tiro',
  'Golpe Cataclismo V2': 'tiro', 'Tijera fulminante': 'tiro', 'Maza rocosa': 'defensa', 'El huracán': 'tiro', 'Gran seísmo': 'defensa',
  'Disparo dual': 'tiro', 'Mandíbulas dobles': 'tiro', 'Balón iceberg': 'tiro', 'Muro de hierro': 'defensa', 'Puente sin final': 'portero',
  'Corriente negra': 'regate', 'Aguijón letal': 'tiro', 'Giroparada': 'portero', 'Tiro magnético': 'tiro', 'Espiral de distorsión': 'portero',
  'Trama trama': 'defensa', 'Escáner defensa': 'defensa', 'Emboscada defensiva': 'defensa', 'Tiro espejismo': 'tiro', 'Millón de manos': 'portero',
  'Segadora': 'defensa', 'Ciclón doble': 'defensa', 'Granada doble': 'tiro', 'El olvido': 'portero', 'Araña gigante': 'portero',
  'Caída a los infiernos': 'defensa', 'Ataque de paladín': 'tiro', 'Salto incandescente': 'tiro', 'Barrera de cristal': 'portero', 'Despeje de fuerza': 'portero',
  'Rotación inversa': 'portero', 'Corte Mágico': 'defensa', 'Tiro balista': 'tiro', 'Tiro espectral': 'tiro', 'Dragón ascendente': 'regate',
  'Triángulo ZZ': 'tiro', 'Parada en pirueta': 'portero', 'Leopardo de la ventisca': 'tiro', 'Gran barrera de coral': 'portero', 'Pingüino emperador x': 'tiro',
  'Tiro giratorio': 'tiro', 'Impulso efímero': 'tiro'
};
