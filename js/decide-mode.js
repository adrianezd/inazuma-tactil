/* ---------------------------------------------------------------------
   TÚ DECIDES: el partido de Ver partido (js/match-engine.js), pero sin
   guion de goles. En los momentos clave el juego se para y eliges:
   con balón, pasar, regatear o tirar; sin balón, robar o aguantar. Tus
   goles solo salen de tus tiros, y los del rival de sus ataques (que
   puedes cortar robando). live.decide activa los ganchos del motor:
   mrDecideAttackHook (mrCarrierLogic), mrDecideDefendHook (mrTackles) y
   mrDecideAiShot (tiros de la CPU).
   --------------------------------------------------------------------- */

// Cada cuánto (en minutos de partido) puede volver a pararse la jugada.
var DECIDE_GAP_ATTACK = 1.6, DECIDE_GAP_DEFEND = 2.4;

function decideStat(p, k) { return (p && typeof p[k] === 'number') ? p[k] : 70; }
function decideOdds(v) { return Math.round(v * 100) + '%'; }
// Ventaja elemental en cada duelo (Fuego, Bosque, Viento, Montaña), solo
// en partidos de Modo Carrera: un pellizco a favor o en contra.
var DECIDE_ELEM_EDGE = 0.07;
function decideElem(live, a, b) { return live && live.isCareer && typeof typeAdvantage === 'function' && a && b ? typeAdvantage(a.tipo, b.tipo) * DECIDE_ELEM_EDGE : 0; }

// Probabilidades de cada opción con balón.
function decideAttackOdds(live, owner) {
  var opp = live.dotsState.opp;
  var nearest = futDraftNearestActive(opp, owner);
  var pressure = nearest ? mrDist(nearest, owner) : 99;
  var edge = mrEdge(live, 'me');
  var me = owner.player || {};
  var target = mrPickPass(live, owner, false) || mrPickPass(live, owner, true);
  var open = 12;
  if (target) { var tn = futDraftNearestActive(opp, target); open = tn ? Math.min(mrDist(tn, target), 12) : 12; }
  var pass = target ? clamp(0.5 + (decideStat(me, 'pase') - 75) / 120 + open * 0.02 - (pressure < 3 ? 0.12 : 0) + edge, 0.25, 0.9) : 0;
  var defPl = nearest && nearest.player ? nearest.player : {};
  var drib = clamp(0.4 + ((decideStat(me, 'tiro') + decideStat(me, 'especial')) / 2 - decideStat(defPl, 'defensa')) / 120 + edge + decideElem(live, me, defPl) - (pressure < 2 ? 0.06 : 0), 0.15, 0.78);
  var dist = Math.hypot(MR_W - owner.x, owner.y - MR_CY);
  var angle = Math.abs(owner.y - MR_CY) / Math.max(dist, 1);
  var keeper = opp.find(function (d) { return d.line === 0 && !d.off; });
  var kp = keeper && keeper.player ? keeper.player : {};
  var shot = 0.7 - dist * 0.014 - angle * 0.12 + (decideStat(me, 'tiro') - decideStat(kp, 'defensa')) / 220 + edge * 0.6 + decideElem(live, me, kp) * 0.7 - (pressure < 2 ? 0.05 : 0);
  shot = clamp(shot, 0.02, 0.7);
  return { pass: pass, drib: drib, shot: shot, target: target, defender: nearest };
}
function decideDefendOdds(live, owner, d) {
  var att = owner.player || {};
  var me = d.player || {};
  var steal = clamp(0.45 + (decideStat(me, 'defensa') - (decideStat(att, 'tiro') + decideStat(att, 'especial')) / 2) / 90 + mrEdge(live, 'me') + decideElem(live, me, att), 0.15, 0.85);
  // Aguantar: probabilidad de que su próximo tiro NO entre (cerráis espacios).
  var hold = 1 - decideAiGoalChance(live, owner) * 0.55;
  return { steal: steal, hold: hold };
}

// Solo tu jugador (live.decideSolo = su id, Modo Jugador y Carrera de
// jugador, a petición explícita: "que solo controles a tu jugador"): el
// partido solo se para cuando el balón o la jugada pasan por él; el resto
// del equipo juega solo, tira y marca por su cuenta.
function decideIsMine(live, d) { return !!(d && d.player && d.player.id === live.decideSolo); }
function decideSoloDot(live) {
  return live.dotsState.me.find(function (d) { return !d.off && decideIsMine(live, d); }) || null;
}
// ----- Ganchos del motor -----
// Con balón tuyo en campo rival (o apretado por un rival), se para y eliges.
function mrDecideAttackHook(live, owner) {
  if (owner.side !== 'me' || owner.line === 0 || live.decision || live.mr.grace > 0) return false;
  if (live.decideSolo && !decideIsMine(live, owner)) return false;
  if (live.minute < (live.decideNextMin || 0)) return false;
  var fx = mrFx('me', owner.x);
  var nearest = futDraftNearestActive(live.dotsState.opp, owner);
  var pressure = nearest ? mrDist(nearest, owner) : 99;
  if (live.decideSolo ? (fx < 24 && !(pressure < 4 && fx > 12)) : (fx < 52 && !(pressure < 3 && fx > 30))) return false;
  var odds = decideAttackOdds(live, owner);
  live.decision = { kind: 'attack', owner: { side: owner.side, num: owner.num }, odds: odds };
  decideShowBox(live);
  return true;
}
// Rival con balón en tu campo y uno de los tuyos cerca: robar o aguantar.
function mrDecideDefendHook(live, owner) {
  if (owner.side !== 'opp' || owner.line === 0 || live.decision || live.mr.grace > 0) return false;
  if (live.minute < (live.decideNextDefMin || 0)) return false;
  if (mrFx('opp', owner.x) < (live.decideSolo ? 30 : 48)) return false;
  var d;
  if (live.decideSolo) {
    // Solo si tu jugador está cerca del que lleva el balón.
    d = decideSoloDot(live);
    if (!d || d.line === 0 || mrDist(d, owner) > 11) return false;
  } else {
    var mine = mrActive(live.dotsState.me).filter(function (d) { return d.line > 0; });
    d = futDraftNearestActive(mine, owner);
    if (!d || mrDist(d, owner) > 6) return false;
  }
  live.decision = { kind: 'defend', owner: { side: owner.side, num: owner.num }, def: { side: d.side, num: d.num }, odds: decideDefendOdds(live, owner, d) };
  decideShowBox(live);
  return true;
}
// El rival va a tirar y tu portero tiene supertécnica de parada lista:
// se para para que elijas parada normal o cuál de sus técnicas usar.
var DECIDE_GAP_SAVE = 3;
function mrDecideSaveHook(live, owner) {
  if (live.decision || live.mr.grace > 0 || live.minute < (live.decideNextSaveMin || 0) || (!live.decideSolo && decideTechWait(live, 'me') > 0)) return false;
  var keeper = live.dotsState.me.find(function (d) { return d.line === 0 && !d.off; });
  if (live.decideSolo) {
    // Solo si el portero eres tú; entonces paras siempre tú, con o sin técnica.
    if (!decideIsMine(live, keeper)) return false;
  } else if (!keeper || !keeper.player || !mrTechList(keeper.player, 'portero', live, 'me').length) return false;
  var goal = decideAiGoalChance(live, owner) * (live.minute < (live.coverUntil || 0) ? 0.55 : 1);
  live.decision = { kind: 'save', owner: { side: owner.side, num: owner.num }, def: { side: keeper.side, num: keeper.num }, odds: { save: 1 - goal, goal: goal } };
  decideShowBox(live);
  return true;
}
// Tiro de la CPU: gol según la fuerza de cada equipo, la zona y si aguantaste.
function decideAiGoalChance(live, owner) {
  var fx = mrFx(owner.side, owner.x), central = Math.abs(owner.y - MR_CY);
  var zone = fx > 86 && central < 20 ? 1.25 : fx > 72 ? 0.85 : 0.5;
  return clamp(0.27 + mrEdge(live, owner.side) * 0.8, 0.1, 0.45) * zone;
}
function mrDecideAiShot(live, owner) {
  var p = decideAiGoalChance(live, owner);
  if (owner.side === 'opp' && live.minute < (live.coverUntil || 0)) p *= 0.55;
  if (Math.random() < p) {
    live.pending.unshift({ side: owner.side, minute: Math.max(1, Math.floor(live.minute)), scorer: owner.player || null, assist: null });
    return 'goal';
  }
  return Math.random() < 0.6 ? 'save' : 'wide';
}

// ----- Recuadro con las opciones -----
function decideBoxEl() {
  var box = document.getElementById('decideBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'decideBox';
    document.body.appendChild(box);
  }
  if (box.parentNode !== document.body) document.body.appendChild(box);
  box.className = 'decide-box';
  return box;
}
function decideBtn(action, label, odds, cls) {
  return '<button class="decide-btn' + (cls ? ' ' + cls : '') + '" onclick="actionDecide(\'' + action + '\')">' +
    '<span class="decide-btn-label">' + label + '</span>' +
    (odds !== null ? '<span class="decide-btn-odds">' + odds + '</span>' : '') +
  '</button>';
}
function decideShowBox(live) {
  var dc = live.decision;
  var box = decideBoxEl();
  if (!dc) { box.classList.remove('on'); box.innerHTML = ''; return; }
  var who = mrDot(live, dc.kind === 'attack' ? dc.owner : dc.def);
  var p = who && who.player;
  var question = dc.kind === 'attack' ? '¿Qué haces con el balón?' : (dc.kind === 'save' ? '¡Te tiran a puerta!' : '¿Vas a por él?');
  var head = p ? '<div class="decide-head">' + avatarHtml(p) + '<div><strong>' + escapeHtml(p.nombre) + '</strong><span class="dim small">' + question + '</span></div>%CHARGES%</div>' : '';
  var o = dc.odds;
  var sups = decideSuperOptions(live, dc, who);
  dc.sups = sups;
  var wait = decideTechWait(live, 'me');
  // Una fila por cada supertécnica que pueda usar: si tiene dos de tiro
  // (o de regate, o de defensa), eliges cuál.
  var superHtml = sups.map(function (sup, i) {
    return '<button class="decide-super" style="--tech:' + sup.tech.color + '" onclick="actionDecide(&quot;' + sup.action + '&quot;, ' + i + ')">' + (sup.tech.element && typeof techElementIconHtml === 'function' ? '<span class="decide-super-elem">' + techElementIconHtml(sup.tech.element, 22) + '</span>' : '') + '<span class="decide-super-kicker">⚡ ' + sup.label + '</span><strong>' + escapeHtml(sup.tech.name) + '</strong><span class="decide-btn-odds">' + decideOdds(sup.odds) + '</span></button>';
  }).join('');
  var charges = '<span class="decide-charges" title="Supertécnica del equipo">⚡ ' + (wait ? Math.ceil(wait) + ' min' : 'Lista') + '</span>';
  var btns = dc.kind === 'save' ? decideBtn('ksave', 'Parada normal', decideOdds(o.save))
    : dc.kind === 'attack'
    ? (o.target ? decideBtn('pass', 'Pasar', decideOdds(o.pass)) : '') + decideBtn('drib', 'Regatear', decideOdds(o.drib)) + decideBtn('shot', 'Tirar', decideOdds(o.shot), 'decide-btn-shot')
    : decideBtn('steal', 'Robar', decideOdds(o.steal), 'decide-btn-shot') + decideBtn('cover', 'Aguantar', decideOdds(o.hold));
  var hint = dc.kind !== 'defend'
    ? 'Cada porcentaje es la probabilidad de que salga bien.'
    : 'Robar: si falla, te supera. Aguantar: no entras y, si tira, es más difícil que marque.';
  box.innerHTML = head.replace('%CHARGES%', charges) + superHtml + '<div class="decide-btns">' + btns + '</div><p class="decide-hint">' + hint + (wait ? ' Supertécnica lista en ' + Math.ceil(wait) + ' min.' : '') + '</p>';
  box.classList.add('on');
}

window.actionDecide = function (choice, supIdx) {
  var live = G.futdraft && G.futdraft.live;
  if (!live || !live.decision || live.done) return;
  var dc = live.decision;
  live.decision = null;
  decideShowBox(live);
  var mr = live.mr;
  var owner = mrDot(live, dc.owner);
  if (!owner || mr.ball.mode !== 'owned' || !mr.ball.owner || mr.ball.owner.num !== owner.num || mr.ball.owner.side !== owner.side) return;
  live.decisionsTaken = (live.decisionsTaken || 0) + 1;
  if (dc.kind === 'save') {
    live.decideNextSaveMin = live.minute + DECIDE_GAP_SAVE;
    var ks = choice === 'tsave' ? (dc.sups || [])[supIdx || 0] : null;
    if (ks) {
      decideTechMark(live, 'me', ks.tech);
      var scored = Math.random() >= ks.odds;
      if (scored) live.pending.unshift({ side: owner.side, minute: Math.max(1, Math.floor(live.minute)), scorer: owner.player || null, assist: null });
      else live.forceKeeperTech = ks.tech;
      mrShoot(live, owner, scored ? 'goal' : 'save');
      live.forceKeeperTech = null;
    } else {
      mrShoot(live, owner, mrDecideAiShot(live, owner));
    }
    return;
  }
  if (choice === 'tshot' || choice === 'tdrib' || choice === 'tsteal') {
    var sup = (dc.sups || [])[supIdx || 0];
    if (!sup || sup.action !== choice) return;
    decideTechMark(live, 'me', sup.tech);
    decideRunSuper(live, dc, sup, owner);
    return;
  }
  if (dc.kind === 'attack') {
    live.decideNextMin = live.minute + DECIDE_GAP_ATTACK;
    var o = decideAttackOdds(live, owner);
    if (choice === 'pass' && o.target) {
      if (Math.random() < o.pass) {
        live.cleanPass = true; mrPass(live, owner, o.target); live.cleanPass = false;
        // El que recibe puede decidir enseguida.
        live.decideNextMin = live.minute + 0.5;
      }
      else {
        // Pase cortado: se lo queda el rival más cercano al receptor.
        var cut = futDraftNearestActive(live.dotsState.opp.filter(function (d) { return d.line > 0; }), o.target) || o.defender;
        if (cut) {
          mrKick(live, owner, cut.x, cut.y, MR_SPEED.pass, 'pass', { receiver: { side: cut.side, num: cut.num }, possSide: owner.side });
          mr.ball.intercept = true;
          mrMaybeTech(live, cut, 'defensa', 0.35);
        }
      }
      return;
    }
    if (choice === 'drib') {
      var def = o.defender;
      if (Math.random() < o.drib) {
        if (def) def.stun = 1.6;
        owner.burst = 1.6;
        // Se planta unos metros más cerca de la portería, sin nadie encima.
        owner.x = Math.min(MR_W - 8, owner.x + 7);
        owner.y += (MR_CY - owner.y) * 0.25;
        mrMaybeTech(live, owner, 'regate', 0.6);
        // Tras irse de su marca, enseguida se puede volver a decidir.
        live.decideNextMin = live.minute + 0.6;
      } else if (def) {
        owner.stun = 0.8;
        mrGiveBall(live, def, 0.1);
        mrMaybeTech(live, def, 'defensa', 0.45);
      }
      return;
    }
    if (choice === 'shot') {
      if (Math.random() < o.shot) {
        live.pending.unshift({ side: 'me', minute: Math.max(1, Math.floor(live.minute)), scorer: owner.player || null, assist: null });
        mrShoot(live, owner, 'goal');
      } else {
        mrShoot(live, owner, Math.random() < 0.6 ? 'save' : 'wide');
      }
    }
    return;
  }
  // Defensa.
  live.decideNextDefMin = live.minute + DECIDE_GAP_DEFEND;
  var d = mrDot(live, dc.def);
  if (choice === 'steal' && d) {
    var odds = decideDefendOdds(live, owner, d);
    if (Math.random() < odds.steal) {
      d.x = owner.x - 0.6; d.y = owner.y;
      owner.stun = 0.9;
      mrGiveBall(live, d, 0.1);
      mrMaybeTech(live, d, 'defensa', 0.5);
    } else if (Math.random() < 0.18) {
      mrFoul(live, d, owner);
    } else {
      d.stun = 1.3;
      owner.burst = 1.1;
      mrMaybeTech(live, owner, 'regate', 0.4);
    }
    return;
  }
  // Aguantar: cerráis espacios y su próximo tiro entra menos.
  live.coverUntil = live.minute + 4;
};

// ----- Supertécnicas con recarga -----
// Cada equipo puede usar una cada 10 minutos de partido, y la misma técnica
// no se repite hasta pasados 15. Las tuyas solo salen si las eliges (Robar
// o Tirar a secas nunca la sacan); las del rival salen solas, con las
// mismas recargas.
var DECIDE_TEAM_TECH_GAP = 10, DECIDE_SAME_TECH_GAP = 15;
function decideTechWait(live, side) {
  var last = live.techLast && live.techLast[side];
  return last == null ? 0 : Math.max(0, last + DECIDE_TEAM_TECH_GAP - (live.minute || 0));
}
function decideTechCooling(live, side, name) {
  var at = live.techNames && live.techNames[side + '|' + name];
  return at != null && (live.minute || 0) - at < DECIDE_SAME_TECH_GAP;
}
function decideTechMark(live, side, tech) {
  live.techLast = live.techLast || {};
  live.techNames = live.techNames || {};
  live.techLast[side] = live.minute || 0;
  live.techNames[side + '|' + tech.name] = live.minute || 0;
}
function decideTechTake(live, side, tech) {
  if (side === 'me' || decideTechWait(live, side) > 0 || decideTechCooling(live, side, tech.name)) return false;
  decideTechMark(live, side, tech);
  return true;
}
function decideSuperOptions(live, dc, who) {
  if (!who || !who.player || decideTechWait(live, 'me') > 0) return [];
  var o = dc.odds;
  // La potencia de cada técnica (y su afinidad con el jugador) mueve su
  // probabilidad, a petición explícita (js/techniques.js).
  function opts(list, action, label, odds) {
    return list.map(function (t) {
      var bonus = typeof techOddsBonus === 'function' ? techOddsBonus(t.name, who.player) : 0;
      // Cada botón con el color y el icono del elemento de su técnica (no el del jugador).
      var el = typeof techInfo === 'function' ? techInfo(t.name, who.player).element : null;
      var tech = { name: t.name, color: (el && MR_ELEM_COLOR[el]) || t.color, element: el };
      return { action: action, label: label, tech: tech, odds: clamp(odds + bonus, 0.05, 0.95) };
    });
  }
  if (dc.kind === 'attack') {
    var shotTechs = mrTechList(who.player, 'tiro', live, 'me'), dribTechs = mrTechList(who.player, 'regate', live, 'me');
    var fx = mrFx('me', who.x);
    if (shotTechs.length && (fx > 60 || !dribTechs.length)) return opts(shotTechs, 'tshot', 'Supertiro', clamp(o.shot * 1.9 + 0.08, 0.06, 0.82));
    return opts(dribTechs, 'tdrib', 'Superregate', clamp(o.drib + 0.22, 0.3, 0.92));
  }
  if (dc.kind === 'save') return opts(mrTechList(who.player, 'portero', live, 'me'), 'tsave', 'Superparada', clamp(1 - o.goal * 0.4, 0.5, 0.95));
  return opts(mrTechList(who.player, 'defensa', live, 'me'), 'tsteal', 'Superrobo', clamp(o.steal + 0.25, 0.3, 0.92));
}
// La técnica se ve (vídeo si lo tiene; si no, su nombre con el brillo).
function decideTechShow(live, d, tech) {
  // Nunca dos vídeos a la vez: si sigue el de antes (p.ej. la técnica del rival), se corta.
  mrVidStop();
  if (mrTechVideoSrc(tech.name)) { mrTechHold(live, tech, d, null); return; }
  live.mr.techLabel = { text: tech.name, color: tech.color, side: d.side, num: d.num, until: Date.now() + 1800 };
  if (typeof fxHaptic === 'function') fxHaptic('tech');
  d.techGlow = { color: tech.color, until: Date.now() + 1500 };
}
function decideRunSuper(live, dc, sup, owner) {
  if (sup.action === 'tshot') {
    live.decideNextMin = live.minute + DECIDE_GAP_ATTACK;
    var goal = Math.random() < sup.odds;
    if (goal) live.pending.unshift({ side: 'me', minute: Math.max(1, Math.floor(live.minute)), scorer: owner.player || null, assist: null });
    live.forceTech = sup.tech;
    mrShoot(live, owner, goal ? 'goal' : (Math.random() < 0.7 ? 'save' : 'wide'));
    live.forceTech = null;
    return;
  }
  if (sup.action === 'tdrib') {
    var def = futDraftNearestActive(live.dotsState.opp, owner);
    var ok = Math.random() < sup.odds;
    decideTechShow(live, owner, sup.tech);
    if (ok) {
      if (def) def.stun = 2;
      owner.burst = 2;
      owner.x = Math.min(MR_W - 7, owner.x + 10);
      owner.y += (MR_CY - owner.y) * 0.35;
      live.decideNextMin = live.minute + 0.5;
    } else if (def) {
      owner.stun = 0.8;
      mrGiveBall(live, def, 0.1);
      live.decideNextMin = live.minute + DECIDE_GAP_ATTACK;
    }
    return;
  }
  // Superrobo.
  live.decideNextDefMin = live.minute + DECIDE_GAP_DEFEND;
  var d = mrDot(live, dc.def);
  if (!d) return;
  var won = Math.random() < sup.odds;
  decideTechShow(live, d, sup.tech);
  // A veces la entrada con técnica se pasa de dura y es falta.
  if (won && Math.random() < 0.12) { mrFoul(live, d, owner); return; }
  if (won) { d.x = owner.x - 0.6; d.y = owner.y; owner.stun = 1; mrGiveBall(live, d, 0.1); }
  else { d.stun = 1.3; owner.burst = 1.1; }
}

// Convierte un partido recién creado de cualquier modo (Carrera, FutDraft,
// Historia, Liga...) en Tú decides: sin guion y en el campo. Si hace falta
// desempatar, prórroga y luego penaltis jugables (futDraftLivePenaltyGate).
function decideConvertLive(live) {
  live.decide = true;
  live.visualMode = 'dots';
  live.pending = [];
  live.finalMyGoals = 0;
  live.finalOppGoals = 0;
}

// Si el partido se cierra o se sale de la pantalla, fuera el recuadro.
function decideCleanup() {
  var box = document.getElementById('decideBox');
  if (box && !(G.screen === 'futdraftLive' && G.futdraft && G.futdraft.live && G.futdraft.live.decision)) { box.classList.remove('on'); box.innerHTML = ''; }
}
