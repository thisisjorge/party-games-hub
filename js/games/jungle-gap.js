/* PGH Jungle Gap — tactical MOBA decisions; widescreen fit-to-viewport
   HARDENED: 30s timer, tactical SVG map, scenario-driven, replay */
(function(){
"use strict";

/* ─── TIMING ─── */
const ROUNDS = 5;
const Q_MS = 30000;        // 30s standard
const INSTINCT_MS = 10000; // 10s instinct (last round or INSTINCT_ALL mod)
const NO_THINK_MS = 8000;  // 8s NO_THINK mod
const REVEAL_MS = 4500;
const VERDICT_MS = 10000;  // longer for replay
const TIER_PTS = {G:1000, O:700, R:300, I:0};
const TIER_LABEL = {G:"BEST CALL", O:"GOOD", R:"RISKY", I:"INT"};

let myPick = null, lastJgSec = -1, lastRound = -1;
let renderReadyAt = 0; // track when render completed

const MOD_TYPES = {
  OBJECTIVE:["objective trade","scuttle","vision"],
  TRACKER:["tracking","countergank","invade"],
  GANK_FARM:["gank window","pathing","tempo","reset timing","lane priority","bad dive","cross-map"]
};

function pickScenarios(mod){
  let pool = (window.PGH_JUNGLE||[]).slice();
  const want = mod && MOD_TYPES[mod];
  if(want && want.length){
    const pref = pool.filter(function(s){ return want.indexOf(s.type)>=0; });
    const rest = pool.filter(function(s){ return want.indexOf(s.type)<0; });
    shuffle(pref); shuffle(rest);
    pool = pref.concat(rest);
  } else { shuffle(pool); }
  return pool.slice(0, Math.min(ROUNDS, pool.length));
}

function shuffle(arr){ for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=arr[i];arr[i]=arr[j];arr[j]=t;} }

function isInstinct(st){ return st.mod==="INSTINCT_ALL" || st.roundIndex===st.scenarios.length-1; }

function qmsFor(st, roundIdx){
  if(st.mod==="INSTINCT_ALL") return INSTINCT_MS;
  if(st.mod==="NO_THINK") return NO_THINK_MS;
  return (roundIdx===st.scenarios.length-1) ? INSTINCT_MS : Q_MS;
}

/* ─── STATE ─── */
function createInitialState(playerIds, opts){
  const mod = (opts&&opts.mod)||null;
  const scenarios = opts?.scenarios?opts.scenarios.slice(0,5):pickScenarios(mod).slice(0,opts?.short?1:ROUNDS);
  const scores = {}; playerIds.forEach(function(id){ scores[id]=0; });
  const st = {
    phase:"question", mod:mod, rounds:scenarios.length, roundIndex:0,
    scenarios:scenarios, answers:{}, scores:scores, greats:{},
    roundEndsAt:0, lastPicks:[], lastVerdict:null, history:[],
    renderReady:false
  };
  // Give extra 2s for initial render before timer starts
  st.roundEndsAt = Date.now() + 2000 + qmsFor(st,0);
  return st;
}

function answeredCount(st){ return Object.keys(st.answers).length; }
function activePlayers(st){ return Object.keys(st.scores); }
function expectedPlayers(st){
  return activePlayers(st).filter(function(id){
    const p = typeof PGHHelpers!=="undefined" ? PGHHelpers.getPlayer(id) : null;
    return !!p && p.connected;
  });
}

function standingsOf(st){
  return Object.keys(st.scores).map(function(id){
    return {playerId:id, points:st.scores[id]||0, greats:st.greats[id]||0};
  }).sort(function(a,b){ return b.points-a.points; });
}

function gotoReveal(st,h){
  st.phase = "reveal";
  const sc = st.scenarios[st.roundIndex];
  st.lastPicks = Object.keys(st.answers).map(function(pid){
    return {playerId:pid, opt:st.answers[pid], label:sc.opts[st.answers[pid]][0]};
  });
  activePlayers(st).forEach(function(id){
    if(st.answers[id]===undefined){
      st.lastPicks.push({playerId:id, opt:-1, label:"⏱ SEM RESPOSTA"});
    }
  });
  st.roundEndsAt = Date.now() + (st.mod==="NO_THINK" ? 2500 : REVEAL_MS);
  h.broadcastState();
}

function gotoVerdict(st,h){
  st.phase = "verdict";
  const sc = st.scenarios[st.roundIndex];
  const gained = {};
  activePlayers(st).forEach(function(id){
    const oi = st.answers[id];
    const tier = (oi===undefined||oi<0) ? "I" : sc.opts[oi][1];
    const pts = TIER_PTS[tier]||0;
    st.scores[id] = (st.scores[id]||0) + pts;
    gained[id] = {tier:tier, points:pts};
    if(tier==="G") st.greats[id] = (st.greats[id]||0)+1;
  });
  const bestIdx = sc.opts.findIndex(function(o){ return o[1]==="G"; });
  st.lastVerdict = {gained:gained, best:bestIdx>=0?sc.opts[bestIdx][0]:"?", exp:sc.exp};
  st.history.push({round:st.roundIndex, picks:st.lastPicks.slice()});
  st.roundEndsAt = Date.now() + (st.mod==="NO_THINK" ? 5000 : VERDICT_MS);
  h.broadcastState();
}

function nextRound(st,h){
  st.roundIndex++; st.answers={}; st.lastPicks=[]; st.lastVerdict=null; myPick=null;
  if(st.roundIndex >= st.scenarios.length){
    st.phase = "ended"; h.broadcastState();
    const std = standingsOf(st);
    setTimeout(function(){ h.finish(std,{}); }, 800);
    return;
  }
  st.phase = "question";
  st.roundEndsAt = Date.now() + 2000 + qmsFor(st, st.roundIndex); // 2s render buffer
  h.broadcastState();
}

function hostAction(st,playerId,action,value,h){
  if(st.phase!=="question" || action!=="answer" || Date.now()>st.roundEndsAt) return;
  if(st.answers[playerId]!==undefined) return;
  if(activePlayers(st).indexOf(playerId)<0) return;
  const oi = parseInt(value&&value.opt, 10);
  const sc = st.scenarios[st.roundIndex];
  if(isNaN(oi) || oi<0 || oi>=sc.opts.length) return;
  st.answers[playerId] = oi;
  h.unicast(playerId, {ok:true, opt:oi});
  if(answeredCount(st) >= expectedPlayers(st).length){ gotoReveal(st,h); return; }
  h.broadcastState();
}

function hostTick(st,h){
  if(st.phase==="ended") return;
  if(Date.now() > st.roundEndsAt){
    if(st.phase==="question") gotoReveal(st,h);
    else if(st.phase==="reveal") gotoVerdict(st,h);
    else if(st.phase==="verdict") nextRound(st,h);
  }
}

function stripScenario(sc){
  return {
    id:sc.id,type:sc.type,time:sc.time,you:sc.you,hp:sc.hp,ult:sc.ult,
    top:sc.top,mid:sc.mid,bot:sc.bot,obj:sc.obj,ej:sc.ej,gold:sc.gold||null,
    opts:sc.opts.map(o=>o[0]),state:window.PGH_SCENARIO_STATE.publicState(sc.state)
  };
}

function getPublicState(st){
  const sc = st.scenarios[st.roundIndex];
  const base = {
    phase:st.phase, roundIndex:st.roundIndex, rounds:st.rounds,
    endsAt:st.roundEndsAt, scores:st.scores,
    instinct:st.phase==="question" && isInstinct(st),
    answeredCount:answeredCount(st), total:expectedPlayers(st).length,
    answeredList:Object.keys(st.answers)
  };
  if(st.phase==="question") base.scenario = sc ? stripScenario(sc) : null;
  if(st.phase==="reveal"){ base.scenario = sc ? stripScenario(sc) : null; base.picks = st.lastPicks; }
  if(st.phase==="verdict"){ base.scenario = sc ? stripScenario(sc) : null; base.picks = st.lastPicks; base.verdict = st.lastVerdict; }
  return base;
}

/* ─── CLIENT: HELPERS ─── */
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function pcts(s){ const m=String(s||"").match(/(\d+)\s*%/g)||[]; return m.map(function(x){ return Math.max(0,Math.min(100,parseInt(x,10))); }); }
function firstPct(s,d){ const p=pcts(s); return p.length?p[0]:(d==null?100:d); }
function hpColor(p){return p>50?'#39ff6a':p>25?'#ffd319':'#ff3b3b';}

function tacticalMapSVG(sc,vm){
  const G=window.PGH_LANE_GEOMETRY;
  let svg='<g class="jg-layer-structures">';
  for(const s of Object.values(vm.structures))if(s.state!=='DESTROYED'){
    const size=s.type==='INHIBITOR'?39:s.type==='NEXUS'?47:47,x=s.x*1000,y=s.y*1000;
    svg+='<g data-structure-id="'+s.id+'" data-structure-type="'+s.type+'" data-state="'+s.state+'" data-x="'+s.x+'" data-y="'+s.y+'"><title>'+s.id+' · '+s.state+'</title>';
    svg+='<image href="'+s.asset+'" x="'+(x-size/2)+'" y="'+(y-size/2)+'" width="'+size+'" height="'+size+'"/>';
    if(s.type==='T1'&&s.platesRemaining>0)svg+='<text x="'+x+'" y="'+(y+2)+'" text-anchor="middle" fill="'+(s.team==='blue'?'#58d7ef':'#ff6575')+'" font-family="monospace" font-size="20" font-weight="900" data-plates="'+s.platesRemaining+'">'+s.platesRemaining+'</text>';
    if(s.state==='DAMAGED')svg+='<path d="M '+(x-2)+' '+(y-12)+' l -5 10 8 3 -5 10" fill="none" stroke="#ffd319" stroke-width="3"/>';
    svg+='</g>';
  }
  svg+='</g>';
  const objectiveLabels={dragon:'DRG',baron:'BRN',herald:'HER',grubs:'GRB',scuttleTop:'CRAB',scuttleBot:'CRAB',mark:'MARCA'};
  svg+='<g class="jg-layer-objectives">';
  for(const [id,o] of Object.entries(vm.objectives))if(o.state==='UP'||o.state==='SPAWNING'){
    const x=o.x*1000,y=o.y*1000;
    svg+='<g data-objective="'+esc(id)+'" data-state="'+o.state+'"><circle cx="'+x+'" cy="'+y+'" r="29" fill="#07101c" stroke="#dfb5ff" stroke-width="3"/>';
    svg+='<text x="'+x+'" y="'+(y+7)+'" text-anchor="middle" fill="#dfb5ff" font-size="19" font-family="monospace">'+objectiveLabels[id]+'</text>';
    if(o.seconds!==undefined)svg+='<text x="'+x+'" y="'+(y+47)+'" text-anchor="middle" fill="#fff" stroke="#07101c" stroke-width="4" paint-order="stroke" font-size="21">'+o.seconds+'s</text>';
    svg+='</g>';
  }
  svg+='</g><g class="jg-layer-waves">';
  for(const [lane,l] of Object.entries(vm.lanes))for(const w of l.waves){
    const n=G.normalOnLane(lane,w.t),color=w.team==='blue'?'#22e6ff':'#ff507d';
    svg+='<g class="wave-marker '+w.team+'-wave" data-lane="'+lane+'" data-wave-state="'+l.waveState+'" data-front-t="'+l.waveFrontT+'">';
    for(const offset of [-.020,0,.020])svg+='<rect x="'+((w.x+n.x*offset)*1000-5)+'" y="'+((w.y+n.y*offset)*1000-5)+'" width="10" height="10" rx="2" fill="'+color+'" stroke="#031016" stroke-width="2"/>';
    svg+='</g>';
  }
  svg+='</g><g class="jg-layer-actors">';
  for(const a of vm.mapActors){
    const x=a.renderX*1000,y=a.renderY*1000,color=a.team==='blue'?'#22e6ff':'#ff507d',you=a.team==='blue'&&a.role==='JUNGLE';
    svg+='<g data-actor-id="'+esc(a.id)+'" data-champion="'+esc(a.champion)+'" data-role="'+a.role+'" data-team="'+a.team+'" data-state="'+a.state+'" data-x="'+a.renderX+'" data-y="'+a.renderY+'"><title>'+esc(a.champion+' — '+a.cardLabel)+'</title>';
    if(you)svg+='<circle cx="'+x+'" cy="'+y+'" r="30" fill="none" stroke="#ffd319" stroke-width="4"/>';
    svg+='<circle cx="'+x+'" cy="'+y+'" r="22" fill="#07111d" stroke="'+color+'" stroke-width="5"/>';
    svg+='<text x="'+x+'" y="'+(y+9)+'" text-anchor="middle" font-size="29" font-weight="900" font-family="monospace" fill="'+color+'">'+a.number+'</text></g>';
  }
  svg+='</g><g class="jg-layer-vision">';
  for(const a of vm.lastSeenActors){
    const color=a.team==='blue'?'#22e6ff':'#ff507d',x=a.x*1000,y=a.y*1000;
    svg+='<g data-last-seen-id="'+esc(a.id)+'"><title>'+esc(a.champion)+' — última visão, não é posição atual</title><circle cx="'+x+'" cy="'+y+'" r="24" fill="#07111d" stroke="'+color+'" stroke-width="3" stroke-dasharray="5 5" opacity=".8"/><text x="'+x+'" y="'+(y+8)+'" text-anchor="middle" font-size="23" fill="'+color+'">'+a.number+'?</text></g>';
  }
  svg+='</g>';
  svg+='<g class="jg-layer-tactical"></g>';
  return '<div class="jg-map-plane"><img src="assets/maps/terrain-base.png" class="jg-map-base jg-layer-terrain" alt="Minimapa: base azul embaixo à esquerda, base vermelha em cima à direita"><svg class="jg-map-overlay" viewBox="0 0 1000 1000" role="img" aria-label="Estruturas, posições, waves e objetivos">'+svg+'</svg></div>';
}

function jgLaneCard(label,lane,sc,vm){
  const card=vm.cardLanes[lane];
  return '<div class="jg-lc neutral" data-lane="'+lane+'"><div class="jg-lc-label">'+label+'</div><div class="jg-wave-state">WAVE '+esc(card.label)+'</div><div class="jg-lc-actors">'+card.actors.map(renderActorRow).join('')+'</div></div>';
}
function renderActorRow(a){
  return '<div class="jg-actor-row '+(a.team==='blue'?'ally':'enemy')+'" data-actor-id="'+esc(a.id)+'" data-state="'+a.state+'"><span class="jg-actor-number">'+a.number+'</span><span class="jg-actor-champ">'+esc(a.champion)+'</span><span class="jg-actor-state">'+esc(a.cardLabel)+'</span></div>';
}

function optIcon(label){
  const s = String(label||"").toUpperCase();
  // Use simple text symbols for arcade feel
  if(/DRAGON|DRAKE/.test(s)) return "◆";
  if(/BARON/.test(s)) return "◈";
  if(/HERALD|ARAUTO/.test(s)) return "◉";
  if(/SCUTTLE|CRAB/.test(s)) return "≋";
  if(/COUNTER/.test(s)) return "⊕";
  if(/DIVE/.test(s)) return "⊗";
  if(/INVADE|INVAD/.test(s)) return "⚔";
  if(/GANK/.test(s)) return "⚡";
  if(/VISION|WARD|SWEEP|VISÃO/.test(s)) return "◎";
  if(/RESET|RECALL|BASE/.test(s)) return "⌂";
  if(/FARM|CLEAR/.test(s)) return "∴";
  if(/PUSH|SHOVE/.test(s)) return "»";
  if(/ROAM/.test(s)) return "↗";
  if(/FIGHT|LUTAR|FORCE|CONTEST/.test(s)) return "✦";
  if(/TRADE|TROCAR/.test(s)) return "⇄";
  if(/WAIT|ESPERAR|DEFEND|PEEL|GIVE|DAR /.test(s)) return "◷";
  if(/ULT/.test(s)) return "★";
  if(/TOP/.test(s)) return "↑";
  if(/MID/.test(s)) return "→";
  if(/BOT/.test(s)) return "↓";
  return "▸";
}

/* ─── RENDER ─── */
function render(ps){
  const root = document.getElementById("game-root");
  if(!root) return;
  const sc = ps.scenario || {};
  const isMobile = window.innerWidth < 800;
  
  let html = '';
  
  // Header bar with title + timer
  html += '<div class="jg-topbar">';
  html += '<div class="jg-topbar-left">';
  html += '<span class="jg-title">🌲 JUNGLE GAP</span>';
  html += '<span class="jg-round">R'+(ps.roundIndex+1)+'/'+ps.rounds+'</span>';
  if(ps.instinct) html += '<span class="jg-instinct-badge">⚡INSTINCT</span>';
  html += '</div>';
  html += '<div class="jg-topbar-right">';
  html += '<span class="jg-status">'+(ps.phase==="question"?("Vote! "+ps.answeredCount+"/"+ps.total+" LOCKED"):(ps.phase==="reveal"?"👀 REVEAL...":"📢 VERDICT"))+'</span>';
  html += '<span id="jg-timer" class="jg-timer-display font-mono2">--</span>';
  html += '</div>';
  html += '</div>';
  
  // Timer bar
  html += '<div class="g-timer-wrap" style="margin:6px 0"><div class="g-timer-fill" id="jg-bar" style="width:100%"></div></div>';
  
  if(ps.phase==="question"){
    const hpP = firstPct(sc.hp, 100);
    
    // Context strip (time, you, HP, ult, gold)
    html += '<div class="jg-ctx">';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">TIME</span><span class="jg-ctx-val">'+esc(sc.time||"—")+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">YOU</span><span class="jg-ctx-val jg-ctx-you">'+esc(sc.you||"—")+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">HP</span><span class="jg-ctx-val" style="color:'+hpColor(hpP)+'">'+esc(sc.hp||"—")+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">ULT</span><span class="jg-ctx-val'+(String(sc.ult||"").indexOf("READY")>=0?" jg-ctx-on":"")+'">'+esc(sc.ult||"—")+'</span></div>';
    if(sc.gold) html += '<div class="jg-ctx-item"><span class="jg-ctx-label">GOLD</span><span class="jg-ctx-val">'+esc(sc.gold)+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">TYPE</span><span class="jg-ctx-val jg-ctx-type">'+esc((sc.type||"DECISION").toUpperCase())+'</span></div>';
    html += '</div>';
    
    // Main layout: map + info panels (widescreen)
    html += '<div class="jg-main">';
    
    // Map (left/center)
    html += '<div class="jg-map-wrap">';
    // ═══ BUILD VIEW MODEL ═══
    let vm;
    try { vm=window.PGH_SCENARIO_STATE.buildJungleScenarioViewModel(sc); }
    catch(error){
      console.error('[Jungle Gap] Invalid scenario',sc.id,error);
      root.innerHTML='<div class="jg-data-error" role="alert">Cenário indisponível: '+esc(error.message)+'</div>';
      return;
    }
    html += '<div class="jg-map">'+tacticalMapSVG(sc, vm)+'</div>';
    html += '</div>';
    
    // Side info (right on desktop, below on mobile)
    html += '<div class="jg-side">';
    html += '<div class="jg-lane-cards">';
    html += jgLaneCard("TOP", "top", sc, vm);
    html += jgLaneCard("MID", "mid", sc, vm);
    html += jgLaneCard("BOT", "bot", sc, vm);
    html += '</div>';
    html += '<div class="jg-info"><div class="jg-info-label">JUNGLE · 2 = VOCÊ / INIMIGO</div>'+vm.jungleActors.map(renderActorRow).join('');
    html += '<div class="jg-info-row bad">'+esc(sc.ej||'')+'</div>';
    html += '<div class="jg-info-row good"><span class="jg-info-label">OBJECTIVES</span><span>'+esc(sc.obj||"—")+'</span></div>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>'; // end jg-main
    html += '<div class="jg-map-key">Azul = seu time · Rosa = inimigo · 1 TOP · 2 JG · 3 MID · 4 ADC · 5 SUP · ? última visão</div>';
    html += '<details class="jg-context-details"><summary>HP, feitiços e contexto das lanes</summary><div>'+['top','mid','bot'].map(l=>'<p><b>'+l.toUpperCase()+':</b> '+esc(sc[l]||'—')+'</p>').join('')+'</div></details>';
    
    // Options
    html += '<div class="jg-question">WHAT\'S THE PLAY?</div>';
    html += '<div class="jg-options">';
    const letters = ["A","B","C","D"];
    (sc.opts||[]).forEach(function(op, i){
      const picked = myPick===i;
      html += '<button class="jg-opt'+(picked?" picked":"")+'" data-o="'+i+'" '+(myPick!==null?"disabled":"")+'>';
      html += '<span class="opt-letter">'+letters[i]+'</span>';
      html += '<span class="jg-opt-icon">'+optIcon(op)+'</span>';
      html += '<span class="jg-opt-text">'+esc(op)+'</span>';
      if(picked) html += '<span class="jg-locked">🔒 LOCKED</span>';
      html += '</button>';
    });
    html += '</div>';
    
    if(myPick!==null) html += '<div class="g-sub" style="margin-top:6px;font-size:11px">✅ Locked in · '+ps.answeredCount+'/'+ps.total+'</div>';
    
    // Scores strip
    html += '<div class="jg-scores-strip">';
    Object.keys(ps.scores||{}).sort(function(a,b){ return (ps.scores[b]||0)-(ps.scores[a]||0); }).forEach(function(id){
      const p = PGHHelpers.getPlayer(id);
      if(!p) return;
      const ans = (ps.answeredList||[]).indexOf(id)>=0;
      html += '<span class="jg-score-chip'+(ans?" locked":"")+'">'+esc(p.nickname)+' '+(ans?"🔒":"⏳")+' '+(ps.scores[id]||0)+'</span>';
    });
    html += '</div>';
    
  } else if(ps.phase==="reveal"){
    html += '<div class="jg-question">👀 AS CALLS FORAM...</div>';
    html += '<div class="jg-picks">';
    (ps.picks||[]).forEach(function(pk, i){
      const p = PGHHelpers.getPlayer(pk.playerId);
      html += '<div class="g-leader-row jg-pick-in" style="animation-delay:'+(i*350)+'ms"><span class="ava"><img src="'+(window.portraitSrc?portraitSrc(p,"NORMAL"):"")+'" alt=""></span><span class="nm">'+esc(p?p.nickname:"???")+'</span><span class="vl">→ '+esc(pk.label)+'</span></div>';
    });
    html += '</div>';
    html += '<div class="g-sub" style="margin-top:10px">revelando veredito...</div>';
    if(typeof AudioManager!=="undefined"){
      AudioManager.play("reveal");
      (ps.picks||[]).forEach(function(_, i){ setTimeout(function(){ AudioManager.play("drum"); }, i*350); });
    }
    
  } else if(ps.phase==="verdict"){
    const v = ps.verdict || {gained:{}, best:"?", exp:""};
    const mine = v.gained[PGHStore.playerId] || {tier:"I", points:0};
    if(window.Daily) Daily.track("JG_TIER", {tier:mine.tier, round:ps.roundIndex});
    
    const vcls = mine.tier==="G"?"great":mine.tier==="O"?"good":mine.tier==="R"?"risky":"int";
    html += '<div class="jg-verdict '+vcls+' pop">'+esc(TIER_LABEL[mine.tier]||"")+' · +'+mine.points+'</div>';
    
    // Tactical replay
    html += '<div class="jg-replay">';
    html += '<div class="jg-replay-row"><span class="jg-replay-label">YOUR CALL</span><span class="jg-replay-val">';
    const myPickIdx = ps.picks ? ps.picks.find(function(p){ return p.playerId===PGHStore.playerId; }) : null;
    html += esc(myPickIdx ? myPickIdx.label : "—");
    html += '</span></div>';
    html += '<div class="jg-replay-row"><span class="jg-replay-label">BEST CALL</span><span class="jg-replay-val jg-replay-best">'+esc(v.best)+'</span></div>';
    html += '</div>';
    
    // Avatar
    const meP = typeof PGHHelpers!=="undefined" ? PGHHelpers.myPlayer() : null;
    const meExpr = (mine.tier==="G"||mine.tier==="O") ? "HAPPY" : "SHOCKED";
    if(meP && window.portraitSrc) html += '<div class="avatar-preview '+ProfileManager.frameClass(meP.frame)+'" style="width:72px;height:72px;margin:8px auto"><img class="'+(meExpr==="HAPPY"?"expr-pop":"expr-shake")+'" src="'+portraitSrc(meP,meExpr)+'" alt=""></div>';
    
    // Explanation
    html += '<div class="jg-explain">🧠 '+esc(v.exp)+'</div>';
    
    // Round scores
    html += '<div class="jg-picks" style="margin-top:8px">';
    (ps.picks||[]).forEach(function(pk){
      const p = PGHHelpers.getPlayer(pk.playerId);
      const gn = v.gained[pk.playerId] || {tier:"I", points:0};
      const pe = gn.tier==="I" ? "KO" : (gn.tier==="R"?"SHOCKED":"HAPPY");
      html += '<div class="g-leader-row"><span class="ava"><img src="'+(window.portraitSrc?portraitSrc(p,pe):"")+'" alt=""></span><span class="nm">'+esc(p?p.nickname:"???")+' → '+esc(pk.label)+'</span><span class="vl">'+esc(TIER_LABEL[gn.tier])+' +'+gn.points+'</span></div>';
    });
    html += '</div>';
    
    if(mine.tier==="G"){ if(typeof AudioManager!=="undefined") AudioManager.play("correct"); if(typeof UI!=="undefined") UI.confetti(30); }
    else if(mine.tier==="I"){ if(typeof AudioManager!=="undefined") AudioManager.play("wrong"); }
  }
  
  root.innerHTML = html;
  
  // Note: overlay is already rendered by tacticalMapSVG() with correct state
  // Do NOT re-render here as it would overwrite with incorrect data
  
  // Bind option clicks
  root.querySelectorAll(".jg-opt").forEach(function(b){
    b.addEventListener("click", function(){
      if(myPick!==null) return;
      myPick = parseInt(b.getAttribute("data-o"), 10);
      GameManager.sendAction("jungle","answer", {opt:myPick});
      if(typeof AudioManager!=="undefined") AudioManager.play("select");
      const ps2 = GameManager.publicState;
      if(ps2) render(ps2);
    });
  });
  
  // Mark render complete — timer buffer starts from here
  renderReadyAt = Date.now();
  tickUI(ps);
}

function tickUI(ps){
  const t = document.getElementById("jg-timer"), bar = document.getElementById("jg-bar");
  if(!ps.endsAt) return;
  const rem = Math.max(0, ps.endsAt - PGHHelpers.hostTime());
  if(t) t.textContent = Math.ceil(rem/1000);
  if(bar){
    const nt = PGHStore.currentMod==="NO_THINK";
    const total = ps.phase==="question" ? (ps.instinct ? INSTINCT_MS : (nt ? NO_THINK_MS : Q_MS)) :
                  ps.phase==="reveal" ? (nt ? 2500 : REVEAL_MS) :
                  (nt ? 5000 : VERDICT_MS);
    // Subtract the 2s render buffer from total for accurate bar
    const effectiveTotal = total + 2000;
    bar.style.width = Math.max(0, Math.min(100, rem/effectiveTotal*100)) + "%";
  }
  if(ps.phase==="question" && rem < 8000 && rem > 0){
    const sec = Math.ceil(rem/1000);
    if(sec !== lastJgSec){
      lastJgSec = sec;
      if(typeof AudioManager!=="undefined") AudioManager.play("tick");
    }
  } else if(rem <= 0) lastJgSec = -1;
}

function onActionResult(pl){ if(pl.ok && pl.opt!==undefined){ myPick = pl.opt; } }

function renderResult(pl, myPlace, res){
  const root = document.getElementById("game-root");
  if(!root) return;
  const standings = (pl.standings||[]).slice().sort(function(a,b){ return (b.points||0)-(a.points||0); });
  const myGreats = (standings.find(function(s){ return s.playerId===PGHStore.playerId; })||{}).greats||0;
  if(typeof Achievements!=="undefined") Achievements.checkJungle(myGreats);
  
  let html = '<div class="result-hero"><div class="result-crown">'+(myPlace===1?"👑":"🌲")+'</div><div class="g-title">JUNGLE GAP · FIM</div>';
  html += '<div class="g-sub">Você ficou em '+myPlace+'º · '+myGreats+' BEST CALLS · +'+res.xp+' XP · +'+res.tokens+' 🪙</div></div><div class="result-table"><div class="g-leader">';
  standings.forEach(function(s,i){
    const p = PGHHelpers.getPlayer(s.playerId);
    html += '<div class="g-leader-row"><span class="font-mono2">'+String(i+1).padStart(2,"0")+'</span><span class="nm">'+esc(p?p.nickname:"???")+'</span><span class="vl">'+(s.points||0)+' PTS</span></div>';
  });
  html += "</div></div>";
  html += (window.Daily ? Daily.resultButtonsHTML() : '<div class="g-row" style="margin-top:16px"><button class="btn-arcade primary" id="btn-again">↻ DE NOVO</button><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>');
  root.innerHTML = html;
  if(window.Daily) Daily.bindResultButtons();
  else {
    const a = document.getElementById("btn-again");
    if(a) a.addEventListener("click", function(){ GameManager.startGame(); });
    document.getElementById("btn-tolobby").addEventListener("click", function(){ GameManager.quitToLobby(); });
  }
}

function cleanup(){ myPick=null; lastRound=-1; lastJgSec=-1; }

GameManager.register({
  id:"jungle", name:"Jungle Gap", tag:"★ JG ★", icon:"🌲",
  desc:"Decisões de jungle: gank, objetivo ou reset?",
  players:"2–12 · simultâneo",
  createInitialState:createInitialState,
  hostAction:hostAction, hostTick:hostTick,
  getPublicState:getPublicState,
  render:function(ps){ if(ps.roundIndex!==lastRound){ lastRound=ps.roundIndex; myPick=null; } render(ps); },
  tickUI:tickUI, onActionResult:onActionResult,
  renderResult:renderResult, cleanup:cleanup
});
})();
