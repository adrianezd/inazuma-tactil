/* ---------------------------------------------------------------------
   EDITOR DE CARA de la Carrera de jugador, a petición explícita ("mete un
   editor de personaje ahí para crear tu cara", "pelo, boca, ojos,
   facciones... y colores"). La cara es un SVG propio, hecho con formas
   (sin arte oficial), que se guarda como un objeto pequeño (s.face) y se
   pinta como data URI: así sirve de "sprite" en cualquier sitio que use
   avatarHtml, también en el campo durante los partidos.
   --------------------------------------------------------------------- */

var FACE_SKINS = ['#ffe0c7', '#f9d1ae', '#f1c27d', '#e0ac69', '#c68642', '#a86b3c', '#8d5524', '#5c3a1e'];
var FACE_HAIR_COLORS = ['#1b1b1f', '#4a2c17', '#7b4a24', '#c58a3e', '#f2d16b', '#e8e8ee', '#d9482b', '#ff8a2a', '#2f6fe0', '#29c7c7', '#3fae4f', '#9b59d0', '#ff5fa2', '#7d8597'];
var FACE_EYE_COLORS = ['#3b2414', '#6b4423', '#2e7d32', '#1e88e5', '#29c7c7', '#8e44ad', '#c0392b', '#f1c40f', '#566573'];
var FACE_ACC_COLORS = ['#ff7a1a', '#e74c3c', '#2f6fe0', '#ffffff', '#1b1b1f', '#3fae4f', '#f1c40f', '#9b59d0'];
var FACE_SHIRT_COLORS = ['#2f6fe0', '#e74c3c', '#ffb020', '#3fae4f', '#1b1b1f', '#ffffff', '#9b59d0', '#29c7c7', '#ff7a1a', '#8b1e3f'];
var FACE_SHAPES = [{ id: 'redonda', name: 'Redonda' }, { id: 'ovalada', name: 'Ovalada' }, { id: 'cuadrada', name: 'Cuadrada' }, { id: 'fina', name: 'Fina' }, { id: 'ancha', name: 'Ancha' }];
var FACE_HAIRS = [
  { id: 'pinchos', name: 'Pinchos' }, { id: 'corto', name: 'Corto' }, { id: 'flequillo', name: 'Flequillo' },
  { id: 'raya', name: 'Raya al lado' }, { id: 'melena', name: 'Melena' }, { id: 'largo', name: 'Largo' },
  { id: 'coleta', name: 'Coleta' }, { id: 'mono', name: 'Moño' }, { id: 'afro', name: 'Afro' },
  { id: 'rizos', name: 'Rizos' }, { id: 'mohicano', name: 'Mohicano' }, { id: 'tupe', name: 'Tupé' },
  { id: 'rastas', name: 'Rastas' }, { id: 'rapado', name: 'Rapado' }, { id: 'calvo', name: 'Calvo' }
];
var FACE_EYES = [{ id: 'normal', name: 'Normales' }, { id: 'anime', name: 'Grandes' }, { id: 'rasgados', name: 'Rasgados' }, { id: 'decididos', name: 'Decididos' }, { id: 'feliz', name: 'Felices' }, { id: 'serios', name: 'Serios' }];
var FACE_BROWS = [{ id: 'normal', name: 'Normales' }, { id: 'gruesas', name: 'Gruesas' }, { id: 'enfado', name: 'Enfadado' }, { id: 'finas', name: 'Finas' }, { id: 'altas', name: 'Sorpresa' }];
var FACE_NOSES = [{ id: 'punto', name: 'Pequeña' }, { id: 'recta', name: 'Recta' }, { id: 'redonda', name: 'Redonda' }, { id: 'grande', name: 'Grande' }];
var FACE_MOUTHS = [{ id: 'sonrisa', name: 'Sonrisa' }, { id: 'dientes', name: 'Dientes' }, { id: 'abierta', name: 'Grito' }, { id: 'ladeada', name: 'Pícara' }, { id: 'seria', name: 'Seria' }, { id: 'mueca', name: 'Mueca' }];
var FACE_BEARDS = [{ id: 'nada', name: 'Nada' }, { id: 'bigote', name: 'Bigote' }, { id: 'perilla', name: 'Perilla' }, { id: 'barba', name: 'Barba' }, { id: 'sombra', name: 'Sombra' }];
var FACE_ACCS = [{ id: 'nada', name: 'Nada' }, { id: 'cinta', name: 'Cinta' }, { id: 'gafas', name: 'Gafas' }, { id: 'sol', name: 'Gafas de sol' }, { id: 'goggles', name: 'Goggles' }, { id: 'tirita', name: 'Tirita' }, { id: 'pendiente', name: 'Pendiente' }];
var FACE_MARKS = [{ id: 'nada', name: 'Nada' }, { id: 'pecas', name: 'Pecas' }, { id: 'rubor', name: 'Rubor' }, { id: 'cicatriz', name: 'Cicatriz' }, { id: 'pintura', name: 'Pintura' }];

function faceDefault() {
  return { shape: 'redonda', skin: '#f1c27d', hair: 'pinchos', hairColor: '#4a2c17', eyes: 'anime', eyeColor: '#3b2414', brows: 'normal', nose: 'punto', mouth: 'sonrisa', beard: 'nada', acc: 'nada', accColor: '#ff7a1a', mark: 'nada', shirt: '#2f6fe0' };
}
function faceRandom() {
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  return {
    shape: pick(FACE_SHAPES).id, skin: pick(FACE_SKINS), hair: pick(FACE_HAIRS).id, hairColor: pick(FACE_HAIR_COLORS),
    eyes: pick(FACE_EYES).id, eyeColor: pick(FACE_EYE_COLORS), brows: pick(FACE_BROWS).id, nose: pick(FACE_NOSES).id,
    mouth: pick(FACE_MOUTHS).id, beard: Math.random() < 0.75 ? 'nada' : pick(FACE_BEARDS).id,
    acc: Math.random() < 0.55 ? 'nada' : pick(FACE_ACCS).id, accColor: pick(FACE_ACC_COLORS),
    mark: Math.random() < 0.6 ? 'nada' : pick(FACE_MARKS).id, shirt: pick(FACE_SHIRT_COLORS)
  };
}
// Aclara (amt > 0) u oscurece (amt < 0) un color #rrggbb.
function faceShade(hex, amt) {
  var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return hex;
  var n = parseInt(m[1], 16);
  var ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (c) {
    var v = amt < 0 ? c * (1 + amt) : c + (255 - c) * amt;
    return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2);
  });
  return '#' + ch.join('');
}
function faceSafeColor(c, fallback) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : fallback; }

function faceHeadPath(shape) {
  return {
    ovalada: 'M50 19C69 19 75 34 75 48C75 66 64 79 50 79C36 79 25 66 25 48C25 34 31 19 50 19Z',
    cuadrada: 'M25 36Q25 20 50 20Q75 20 75 36L75 58Q73 77 50 78Q27 77 25 58Z',
    fina: 'M50 19C67 19 72 33 72 48C72 68 60 80 50 80C40 80 28 68 28 48C28 33 33 19 50 19Z',
    ancha: 'M50 21C72 21 78 34 78 48C78 66 66 77 50 77C34 77 22 66 22 48C22 34 28 21 50 21Z'
  }[shape] || 'M50 20C70 20 76 33 76 48C76 65 65 77 50 77C35 77 24 65 24 48C24 33 30 20 50 20Z';
}
// Pelo por detrás de la cabeza (melenas, coletas, afro...).
function faceHairBack(f, c, dk) {
  switch (f.hair) {
    case 'largo': return '<path d="M22 46C18 20 34 11 50 11C66 11 82 20 78 46L83 86L66 86L69 52L31 52L34 86L17 86Z" fill="' + c + '"/>';
    case 'melena': return '<path d="M21 48C18 24 34 12 50 12C66 12 82 24 79 48L80 70L68 66L70 50L30 50L32 66L20 70Z" fill="' + c + '"/>';
    case 'coleta': return '<path d="M68 26C92 24 96 58 86 76C84 60 80 46 70 40Z" fill="' + c + '"/><circle cx="74" cy="31" r="4" fill="' + faceShade(c, -0.35) + '"/>';
    case 'mono': return '<circle cx="50" cy="12" r="9" fill="' + c + '"/><path d="M44 12Q50 7 56 12" stroke="' + dk + '" stroke-width="1.4" fill="none"/>';
    case 'afro': return '<circle cx="50" cy="38" r="31" fill="' + c + '"/><circle cx="24" cy="44" r="10" fill="' + c + '"/><circle cx="76" cy="44" r="10" fill="' + c + '"/>';
    case 'rastas': return [24, 31, 69, 76].map(function (x, i) { return '<rect x="' + (x - 3) + '" y="34" width="6" height="' + (38 + (i % 2) * 6) + '" rx="3" fill="' + c + '" stroke="' + dk + '" stroke-width=".8"/>'; }).join('');
    case 'rizos': return '<circle cx="25" cy="44" r="7" fill="' + c + '"/><circle cx="75" cy="44" r="7" fill="' + c + '"/>';
    default: return '';
  }
}
// Pelo por delante (encima de la frente).
function faceHairFront(f, c, dk, lt) {
  var shine = '<path d="M36 22Q46 17 58 19" stroke="' + lt + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/>';
  switch (f.hair) {
    case 'pinchos': return '<path d="M23 46L15 31L26 31L21 16L35 22L36 6L47 17L56 3L60 18L73 9L71 24L85 24L77 46C72 33 62 29 50 29C38 29 29 33 23 46Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1.2" stroke-linejoin="round"/>' + shine;
    case 'corto': return '<path d="M24 44C22 22 36 14 50 14C65 14 79 22 76 44C72 34 65 28 50 28C37 28 29 32 24 44Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1"/>' + shine;
    case 'flequillo': return '<path d="M24 47C20 22 36 13 50 13C66 13 81 22 76 47L72 37L66 41L62 33L55 40L49 32L41 39L36 33L30 41Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1" stroke-linejoin="round"/>' + shine;
    case 'raya': return '<path d="M24 46C21 22 36 13 52 13C67 13 80 22 76 46C74 36 70 30 62 28C52 34 38 32 30 30C27 34 25 40 24 46Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1"/><path d="M61 15Q60 22 62 28" stroke="' + dk + '" stroke-width="1.2" fill="none"/>' + shine;
    case 'melena': return '<path d="M22 50C17 22 34 12 52 12C70 12 83 24 78 50L74 40C70 30 60 26 44 34C36 38 28 44 22 50Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1"/>' + shine;
    case 'largo': return '<path d="M24 46C22 24 36 14 50 14C64 14 78 24 76 46C70 34 62 30 50 30L50 22C46 28 34 34 24 46Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1"/>' + shine;
    case 'coleta': case 'mono': return '<path d="M25 42C24 23 37 16 50 16C63 16 76 23 75 42C70 31 62 27 50 27C38 27 30 31 25 42Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1"/>' + shine;
    case 'afro': return '<path d="M24 46C20 30 34 21 50 21C66 21 80 30 76 46C72 37 64 33 50 33C36 33 28 37 24 46Z" fill="' + c + '"/>';
    case 'rizos': return [[30, 30], [38, 22], [48, 19], [58, 20], [67, 25], [73, 34], [26, 38], [42, 28], [55, 27], [64, 31]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="' + c + '" stroke="' + dk + '" stroke-width=".9"/>'; }).join('');
    case 'mohicano': return '<path d="M25 42C24 25 36 19 50 19C64 19 76 25 75 42C70 31 62 27 50 27C38 27 30 31 25 42Z" fill="' + c + '" opacity=".35"/><path d="M43 30L40 4L47 11L50 1L54 11L61 5L57 30Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1" stroke-linejoin="round"/>';
    case 'tupe': return '<path d="M25 42C24 25 36 19 50 19C64 19 76 25 75 42C70 31 62 27 50 27C38 27 30 31 25 42Z" fill="' + c + '"/><path d="M30 30C28 12 48 4 66 10C76 14 78 24 72 30C64 22 46 22 30 30Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1"/><path d="M40 18Q54 10 68 15" stroke="' + lt + '" stroke-width="2" fill="none" opacity=".55"/>';
    case 'rastas': return '<path d="M24 44C22 22 36 14 50 14C65 14 79 22 76 44C72 34 65 28 50 28C37 28 29 32 24 44Z" fill="' + c + '" stroke="' + dk + '" stroke-width="1"/>' + [34, 42, 50, 58, 66].map(function (x) { return '<path d="M' + x + ' 18L' + (x - 1) + ' 31" stroke="' + dk + '" stroke-width="1.2"/>'; }).join('');
    case 'rapado': return '<path d="M25 42C24 25 36 19 50 19C64 19 76 25 75 42C70 31 62 27 50 27C38 27 30 31 25 42Z" fill="' + c + '" opacity=".45"/>';
    default: return '';
  }
}
function faceEyesSvg(f, ec) {
  function eye(cx, flip) {
    var s = flip ? -1 : 1;
    switch (f.eyes) {
      case 'anime': return '<ellipse cx="' + cx + '" cy="50" rx="5.6" ry="6.6" fill="#fff" stroke="#1b1b1f" stroke-width="1.1"/><ellipse cx="' + cx + '" cy="51" rx="3.8" ry="5" fill="' + ec + '"/><circle cx="' + cx + '" cy="51.5" r="2" fill="#111"/><circle cx="' + (cx + 1.4 * s) + '" cy="48.6" r="1.4" fill="#fff"/><circle cx="' + (cx - 1.2 * s) + '" cy="53.4" r=".7" fill="#fff"/><path d="M' + (cx - 6.4) + ' 45.6Q' + cx + ' 42.4 ' + (cx + 6.4) + ' 45.6" stroke="#1b1b1f" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
      case 'rasgados': return '<path d="M' + (cx - 6) + ' 51Q' + cx + ' 46 ' + (cx + 6) + ' 50Q' + cx + ' 53.5 ' + (cx - 6) + ' 51Z" fill="#fff" stroke="#1b1b1f" stroke-width="1.1"/><circle cx="' + cx + '" cy="50.4" r="2.3" fill="' + ec + '"/><circle cx="' + cx + '" cy="50.4" r="1.1" fill="#111"/>';
      case 'feliz': return '<path d="M' + (cx - 5) + ' 51.5Q' + cx + ' 45.5 ' + (cx + 5) + ' 51.5" stroke="#1b1b1f" stroke-width="2" fill="none" stroke-linecap="round"/>';
      case 'serios': return '<path d="M' + (cx - 5.5) + ' 50H' + (cx + 5.5) + '" stroke="#1b1b1f" stroke-width="1.6" stroke-linecap="round"/><path d="M' + (cx - 4.5) + ' 50Q' + cx + ' 54 ' + (cx + 4.5) + ' 50" fill="#fff" stroke="#1b1b1f" stroke-width="1"/><circle cx="' + cx + '" cy="51.2" r="1.7" fill="' + ec + '"/>';
      case 'decididos': return '<ellipse cx="' + cx + '" cy="51" rx="5" ry="4.2" fill="#fff" stroke="#1b1b1f" stroke-width="1.1"/><circle cx="' + cx + '" cy="51.4" r="2.8" fill="' + ec + '"/><circle cx="' + cx + '" cy="51.4" r="1.3" fill="#111"/><circle cx="' + (cx + 1 * s) + '" cy="50" r=".8" fill="#fff"/><path d="M' + (cx - 6 * s) + ' ' + (flip ? 45.6 : 47.4) + 'L' + (cx + 6 * s) + ' ' + (flip ? 47.4 : 45.6) + '" stroke="#1b1b1f" stroke-width="2.2" stroke-linecap="round"/>';
      default: return '<ellipse cx="' + cx + '" cy="50" rx="5" ry="4.3" fill="#fff" stroke="#1b1b1f" stroke-width="1.1"/><circle cx="' + cx + '" cy="50.3" r="2.8" fill="' + ec + '"/><circle cx="' + cx + '" cy="50.3" r="1.3" fill="#111"/><circle cx="' + (cx + 1 * s) + '" cy="49" r=".8" fill="#fff"/>';
    }
  }
  return eye(39, false) + eye(61, true);
}
function faceBrowsSvg(f, c) {
  var d = {
    normal: ['M33 43Q39 40 45 42', 'M55 42Q61 40 67 43', 2],
    gruesas: ['M32 43Q39 38.5 46 41.5', 'M54 41.5Q61 38.5 68 43', 3.6],
    enfado: ['M33 40L46 44', 'M54 44L67 40', 2.8],
    finas: ['M34 42.5Q39 41 44 42', 'M56 42Q61 41 66 42.5', 1.2],
    altas: ['M33 40Q39 35.5 45 38.5', 'M55 38.5Q61 35.5 67 40', 2]
  }[f.brows] || ['M33 43Q39 40 45 42', 'M55 42Q61 40 67 43', 2];
  return '<path d="' + d[0] + '" stroke="' + c + '" stroke-width="' + d[2] + '" fill="none" stroke-linecap="round"/><path d="' + d[1] + '" stroke="' + c + '" stroke-width="' + d[2] + '" fill="none" stroke-linecap="round"/>';
}
function faceNoseSvg(f, sk) {
  var dk = faceShade(sk, -0.28);
  switch (f.nose) {
    case 'recta': return '<path d="M50 52L48 60L52 60.5" stroke="' + dk + '" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    case 'redonda': return '<ellipse cx="50" cy="59" rx="3.2" ry="2.4" fill="' + dk + '" opacity=".55"/>';
    case 'grande': return '<path d="M49 52Q46 60 47 61Q50 63 53 61Q54 60 51 52" stroke="' + dk + '" stroke-width="1.4" fill="' + faceShade(sk, -0.1) + '"/>';
    default: return '<path d="M48.5 59.5Q50 61 51.5 59.5" stroke="' + dk + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
  }
}
function faceMouthSvg(f) {
  switch (f.mouth) {
    case 'dientes': return '<path d="M42 65Q50 73 58 65Z" fill="#7a1f2b" stroke="#1b1b1f" stroke-width="1.1" stroke-linejoin="round"/><path d="M43.2 65.6H56.8L56 67H44Z" fill="#fff"/>';
    case 'abierta': return '<ellipse cx="50" cy="67.5" rx="5" ry="4.6" fill="#7a1f2b" stroke="#1b1b1f" stroke-width="1.1"/><ellipse cx="50" cy="69.5" rx="3" ry="1.6" fill="#ff7f8f"/>';
    case 'ladeada': return '<path d="M43 67Q51 70 58 64" stroke="#1b1b1f" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    case 'seria': return '<path d="M44 67H56" stroke="#1b1b1f" stroke-width="1.8" stroke-linecap="round"/>';
    case 'mueca': return '<path d="M43 69Q50 64 57 69" stroke="#1b1b1f" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    default: return '<path d="M43 65.5Q50 71.5 57 65.5" stroke="#1b1b1f" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  }
}
function faceBeardSvg(f, c) {
  switch (f.beard) {
    case 'bigote': return '<path d="M42 63.5Q46 60.5 50 62.5Q54 60.5 58 63.5Q54 64.5 50 63.6Q46 64.5 42 63.5Z" fill="' + c + '"/>';
    case 'perilla': return '<path d="M46 71Q50 79 54 71Q50 73 46 71Z" fill="' + c + '"/><path d="M44 63.5Q50 61 56 63.5" stroke="' + c + '" stroke-width="1.6" fill="none"/>';
    case 'barba': return '<path d="M26 54Q28 76 50 79Q72 76 74 54Q70 66 60 70Q50 74 40 70Q30 66 26 54Z" fill="' + c + '"/><path d="M42 63.5Q46 60.5 50 62.5Q54 60.5 58 63.5Q54 64.5 50 63.6Q46 64.5 42 63.5Z" fill="' + c + '"/>';
    case 'sombra': return '<path d="M27 56Q30 76 50 78Q70 76 73 56Q66 70 50 72Q34 70 27 56Z" fill="' + c + '" opacity=".25"/>';
    default: return '';
  }
}
function faceMarkSvg(f, sk) {
  switch (f.mark) {
    case 'pecas': return [[33, 58], [36, 60], [38, 57], [62, 57], [64, 60], [67, 58]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".9" fill="' + faceShade(sk, -0.4) + '"/>'; }).join('');
    case 'rubor': return '<ellipse cx="33" cy="60" rx="4.5" ry="2.6" fill="#ff6b81" opacity=".45"/><ellipse cx="67" cy="60" rx="4.5" ry="2.6" fill="#ff6b81" opacity=".45"/>';
    case 'cicatriz': return '<path d="M62 41L68 56" stroke="' + faceShade(sk, -0.35) + '" stroke-width="1.4"/><path d="M63 46L66 45M64 50L67 49" stroke="' + faceShade(sk, -0.35) + '" stroke-width="1.1"/>';
    case 'pintura': return '<path d="M29 57H39M29 60.5H38" stroke="' + faceSafeColor(f.accColor, '#ff7a1a') + '" stroke-width="2" stroke-linecap="round"/><path d="M61 57H71M62 60.5H71" stroke="' + faceSafeColor(f.accColor, '#ff7a1a') + '" stroke-width="2" stroke-linecap="round"/>';
    default: return '';
  }
}
function faceAccSvg(f) {
  var c = faceSafeColor(f.accColor, '#ff7a1a');
  switch (f.acc) {
    case 'cinta': return '<path d="M23.5 35Q50 26 76.5 35L76 41Q50 32 24 41Z" fill="' + c + '" stroke="' + faceShade(c, -0.35) + '" stroke-width="1"/><path d="M76 36L86 31L84 40L77 40Z" fill="' + c + '"/><path d="M45 32.6Q50 31.6 55 32.6" stroke="#fff" stroke-width="1.2" opacity=".7"/>';
    case 'gafas': return '<circle cx="39" cy="50.5" r="7.2" fill="rgba(255,255,255,.15)" stroke="' + c + '" stroke-width="1.8"/><circle cx="61" cy="50.5" r="7.2" fill="rgba(255,255,255,.15)" stroke="' + c + '" stroke-width="1.8"/><path d="M46.2 50Q50 48 53.8 50M31.8 49L25 47M68.2 49L75 47" stroke="' + c + '" stroke-width="1.6" fill="none"/>';
    case 'sol': return '<path d="M30 46H48Q48 56 39 56Q30 56 30 46ZM52 46H70Q70 56 61 56Q52 56 52 46Z" fill="#14161c" stroke="' + c + '" stroke-width="1.3"/><path d="M48 47.5H52M30 46.5L25 45M70 46.5L75 45" stroke="' + c + '" stroke-width="1.6"/><path d="M33 48L37 48" stroke="#fff" stroke-width="1" opacity=".5"/>';
    case 'goggles': return '<path d="M24 38Q50 31 76 38" stroke="' + faceShade(c, -0.4) + '" stroke-width="3" fill="none"/><rect x="31" y="31" width="16" height="10" rx="5" fill="' + c + '" stroke="#1b1b1f" stroke-width="1.2" opacity=".9"/><rect x="53" y="31" width="16" height="10" rx="5" fill="' + c + '" stroke="#1b1b1f" stroke-width="1.2" opacity=".9"/>';
    case 'tirita': return '<g transform="rotate(-25 66 60)"><rect x="60" y="57.5" width="12" height="5" rx="2" fill="#f3c08f" stroke="#c08a5a" stroke-width=".8"/><path d="M64 58.5V61.5M66 58.5V61.5M68 58.5V61.5" stroke="#c08a5a" stroke-width=".6"/></g>';
    case 'pendiente': return '<circle cx="24" cy="60" r="2" fill="none" stroke="' + c + '" stroke-width="1.4"/><circle cx="76" cy="60" r="2" fill="none" stroke="' + c + '" stroke-width="1.4"/>';
    default: return '';
  }
}
// La cara entera. opts.bust: con hombros y camiseta (por defecto sí).
function faceSvg(face, opts) {
  var f = Object.assign(faceDefault(), face || {});
  opts = opts || {};
  var sk = faceSafeColor(f.skin, '#f1c27d'), hc = faceSafeColor(f.hairColor, '#4a2c17'), ec = faceSafeColor(f.eyeColor, '#3b2414'), sh = faceSafeColor(f.shirt, '#2f6fe0');
  var hdk = faceShade(hc, -0.38), hlt = faceShade(hc, 0.45), skd = faceShade(sk, -0.18);
  var browC = f.hair === 'calvo' || f.hair === 'rapado' ? faceShade(hc, -0.2) : hdk;
  var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">';
  if (opts.bust !== false) {
    out += '<path d="M10 100Q12 80 50 77Q88 80 90 100Z" fill="' + sh + '" stroke="' + faceShade(sh, -0.35) + '" stroke-width="1.2"/>' +
      '<path d="M40 77L50 88L60 77" fill="' + faceShade(sh, 0.35) + '" stroke="' + faceShade(sh, -0.35) + '" stroke-width="1.2"/>';
    if (opts.number != null) out += '<text x="50" y="98" font-family="Pixelify Sans,Arial,sans-serif" font-weight="700" font-size="9" text-anchor="middle" fill="' + faceShade(sh, sh === '#ffffff' ? -0.7 : 0.75) + '">' + String(opts.number).replace(/[^0-9]/g, '') + '</text>';
  }
  out += '<rect x="42" y="64" width="16" height="15" rx="5" fill="' + skd + '"/>';
  out += faceHairBack(f, hc, hdk);
  out += '<ellipse cx="24.5" cy="52" rx="4.6" ry="6" fill="' + sk + '" stroke="' + skd + '" stroke-width="1"/><ellipse cx="75.5" cy="52" rx="4.6" ry="6" fill="' + sk + '" stroke="' + skd + '" stroke-width="1"/>';
  out += '<path d="' + faceHeadPath(f.shape) + '" fill="' + sk + '" stroke="' + faceShade(sk, -0.3) + '" stroke-width="1.2"/>';
  out += faceMarkSvg(f, sk) + faceBeardSvg(f, hdk === '#000000' ? '#222' : hc) + faceEyesSvg(f, ec) + faceBrowsSvg(f, browC) + faceNoseSvg(f, sk) + faceMouthSvg(f);
  out += faceHairFront(f, hc, hdk, hlt);
  out += faceAccSvg(f);
  return out + '</svg>';
}
function faceDataUri(face, opts) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(faceSvg(face, opts)); }

// ===== Editor =====
var FACE_TABS = [
  { id: 'cara', name: 'Cara', icon: '🙂' }, { id: 'pelo', name: 'Pelo', icon: '💇' }, { id: 'ojos', name: 'Ojos', icon: '👀' },
  { id: 'boca', name: 'Boca', icon: '👄' }, { id: 'extras', name: 'Extras', icon: '🕶️' }
];
function faceOptionsGrid(face, field, list) {
  return '<div class="face-grid">' + list.map(function (o) {
    var test = Object.assign({}, face); test[field] = o.id;
    var on = face[field] === o.id;
    return '<button class="face-opt' + (on ? ' on' : '') + '" onclick="actionFaceSet(\'' + field + '\', \'' + o.id + '\')"><img src="' + faceDataUri(test, { bust: false }) + '" alt=""><span>' + escapeHtml(o.name) + '</span></button>';
  }).join('') + '</div>';
}
function faceSwatches(face, field, list) {
  var cur = face[field];
  return '<div class="face-swatches">' + list.map(function (c) {
    return '<button class="face-sw' + (cur === c ? ' on' : '') + '" style="--sw:' + c + '" aria-label="' + c + '" onclick="actionFaceSet(\'' + field + '\', \'' + c + '\')"></button>';
  }).join('') +
    '<label class="face-sw face-sw-custom' + (list.indexOf(cur) === -1 ? ' on' : '') + '" style="--sw:' + faceSafeColor(cur, '#888888') + '" title="Color libre">🎨<input type="color" value="' + faceSafeColor(cur, '#888888') + '" onchange="actionFaceSet(\'' + field + '\', this.value)"></label>' +
  '</div>';
}
function faceSection(title, body) { return '<div class="face-sec"><h4>' + title + '</h4>' + body + '</div>'; }
// Editor completo (sin botones de navegación: los pone quien lo usa).
function faceEditorHtml(face, tab, number) {
  tab = FACE_TABS.some(function (t) { return t.id === tab; }) ? tab : 'cara';
  var body;
  if (tab === 'pelo') body = faceSection('Peinado', faceOptionsGrid(face, 'hair', FACE_HAIRS)) + faceSection('Color de pelo', faceSwatches(face, 'hairColor', FACE_HAIR_COLORS));
  else if (tab === 'ojos') body = faceSection('Ojos', faceOptionsGrid(face, 'eyes', FACE_EYES)) + faceSection('Color de ojos', faceSwatches(face, 'eyeColor', FACE_EYE_COLORS)) + faceSection('Cejas', faceOptionsGrid(face, 'brows', FACE_BROWS));
  else if (tab === 'boca') body = faceSection('Boca', faceOptionsGrid(face, 'mouth', FACE_MOUTHS)) + faceSection('Nariz', faceOptionsGrid(face, 'nose', FACE_NOSES)) + faceSection('Barba', faceOptionsGrid(face, 'beard', FACE_BEARDS));
  else if (tab === 'extras') body = faceSection('Accesorio', faceOptionsGrid(face, 'acc', FACE_ACCS)) + faceSection('Color del accesorio', faceSwatches(face, 'accColor', FACE_ACC_COLORS)) + faceSection('Marcas', faceOptionsGrid(face, 'mark', FACE_MARKS)) + faceSection('Camiseta', faceSwatches(face, 'shirt', FACE_SHIRT_COLORS));
  else body = faceSection('Forma de la cara', faceOptionsGrid(face, 'shape', FACE_SHAPES)) + faceSection('Tono de piel', faceSwatches(face, 'skin', FACE_SKINS));
  return '<div class="face-editor">' +
    '<div class="face-stage"><div class="face-stage-ring"><img src="' + faceDataUri(face, { number: number }) + '" alt="Tu cara"></div>' +
      '<button class="btn btn-tiny face-dice" onclick="actionFaceRandom()">🎲 Aleatoria</button></div>' +
    '<div class="seg-tabs face-tabs" role="tablist">' + FACE_TABS.map(function (t) {
      return '<button role="tab" class="seg-tab' + (t.id === tab ? ' on' : '') + '" onclick="actionFaceTab(\'' + t.id + '\')">' + t.icon + ' ' + t.name + '</button>';
    }).join('') + '</div>' +
    body +
  '</div>';
}
// El editor trabaja sobre G.faceEdit = { face, tab, onChange }.
window.actionFaceSet = function (field, value) {
  var fe = G.faceEdit;
  if (!fe) return;
  fe.face[field] = value;
  if (fe.onChange) fe.onChange(fe.face);
  render();
};
window.actionFaceTab = function (t) { if (G.faceEdit) { G.faceEdit.tab = t; render(); } };
window.actionFaceRandom = function () {
  var fe = G.faceEdit;
  if (!fe) return;
  fe.face = faceRandom();
  if (fe.onChange) fe.onChange(fe.face);
  render();
};
