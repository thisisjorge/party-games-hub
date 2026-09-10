/* PGH Jungle Gap — tactical MOBA decisions; widescreen fit-to-viewport
   Configurable reading timer, tactical SVG map, scenario-driven, replay */
(function(){
"use strict";

/* ─── TIMING ─── */
const ROUNDS = 5;
const Q_MS = Math.max(10,Math.min(120,Number(window.PGH_CONFIG?.jungle?.roundSeconds)||50))*1000;
const INSTINCT_MS = 10000; // 10s only for the explicitly selected INSTINCT_ALL mod
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

function isInstinct(st){ return st.mod==="INSTINCT_ALL"; }

function qmsFor(st, roundIdx){
  if(st.mod==="INSTINCT_ALL") return INSTINCT_MS;
  if(st.mod==="NO_THINK") return NO_THINK_MS;
  return Q_MS;
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
    endsAt:st.roundEndsAt, scores:st.scores, questionMs:qmsFor(st,st.roundIndex),
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

let mapSerial=0;
function portraitFor(name){const id=window.PGH_JUNGLE_PORTRAITS?.[name];return id?'assets/champions/'+id+'.png':null;}
function champShort(name){return name==='JG INIMIGO'?'JG':String(name||'?').replace(/[^a-zA-ZÀ-ÿ]/g,'').slice(0,3).toUpperCase();}
// The abbreviation sits behind the image, so even a failed request leaves a readable identity.
document.addEventListener('error',event=>{if(event.target.matches?.('[data-jg-portrait]'))event.target.style.display='none';},true);
function actorPortrait(a,x,y,serial,lastSeen=false){
  const color=a.team==='blue'?'#22e6ff':'#ff507d',src=portraitFor(a.champion),clip='jg-face-'+serial+'-'+a.id;
  let svg='<circle cx="'+x+'" cy="'+y+'" r="31" fill="#07111d" stroke="#07111d" stroke-width="3"/>';
  svg+='<text class="jg-champ-fallback" x="'+x+'" y="'+(y+6)+'" text-anchor="middle" font-size="18" font-weight="900" font-family="monospace" fill="'+color+'">'+esc(champShort(a.champion))+'</text>';
  if(src)svg+='<defs><clipPath id="'+clip+'"><circle cx="'+x+'" cy="'+y+'" r="27"/></clipPath></defs><image data-jg-portrait="'+esc(a.champion)+'" href="'+src+'" x="'+(x-34)+'" y="'+(y-34)+'" width="68" height="68" clip-path="url(#'+clip+')"'+(lastSeen?' opacity=".48"':'')+'/>';
  svg+='<circle cx="'+x+'" cy="'+y+'" r="29" fill="none" stroke="'+color+'" stroke-width="4"'+(lastSeen?' stroke-dasharray="6 5"':'')+'/>';
  if(lastSeen)svg+='<circle cx="'+(x+23)+'" cy="'+(y-22)+'" r="12" fill="#07111d" stroke="'+color+'" stroke-width="2"/><text x="'+(x+23)+'" y="'+(y-15)+'" text-anchor="middle" font-size="20" font-family="monospace" font-weight="900" fill="#fff">?</text>';
  return svg;
}
function campGlyph(kind){
  return {
    gromp:'<path d="M-12 5Q-15-2-9-6L-9-10-3-7Q0-9 4-7L10-10 11-4Q17 7 8 9H-8Z"/><path d="M-7 2h2m8 0h2M-5 7h9" fill="none" stroke="#07111d"/>',
    blue:'<path d="M0-13 9-5 7 8 0 13-9 6-8-6Z"/><path d="M0-10V10M-6-4 0 0 7-4" fill="none" stroke="#07111d"/>',
    wolves:'<path d="M-10-11-3-6 3-6 10-11 8 2 0 11-8 2Z"/><path d="M-5 0-2 2M5 0 2 2M-2 7h4" fill="none" stroke="#07111d"/>',
    raptors:'<path d="M-13 1-4-3-3-11 3-6 10-5 5 0 12 7 3 6-1 11-6 5-13 6Z"/><path d="M-6 1 0 4 4 1" fill="none" stroke="#07111d"/>',
    red:'<path d="M-11 8-10-3-5 0 0-13 5-3 11-6 12 7 3 12-5 11Z"/><path d="M0-4 4 3 0 8-4 3Z" fill="#07111d" stroke="none"/>',
    krugs:'<path d="M-13 1-9-7-1-6 3 0 0 9-10 8ZM4 0 8-5 13-2 14 7 7 10 3 5Z"/>',
    scuttle:'<path d="M-8-5 7-5 11 0 7 6-8 6-11 0Z"/><path d="M-10-5-15-9M-11 1h-6M-10 6-15 10M10-5l5-4M11 1h6M10 6l5 4" fill="none"/>',
    pit:'<path d="M-8 8-10-2-5-10 0-5 6-10 11-1 7 8Z" fill="none"/><path d="M-5 2 0 6 5 2" fill="none"/>'
  }[kind];
}
function tacticalMapSVG(sc,vm){
  const G=window.PGH_LANE_GEOMETRY,serial=++mapSerial;
  let svg='<g class="jg-layer-camps">';
  for(const c of Object.values(G.camps)){
    svg+='<g data-camp-id="'+c.id+'" data-x="'+c.x+'" data-y="'+c.y+'" transform="translate('+(c.x*1000)+' '+(c.y*1000)+')"><title>'+esc(c.label+' · selva '+(c.side==='blue'?'aliada':'inimiga')+' · referência de localização')+'</title><circle r="18" fill="#07111d" fill-opacity=".78"/><g fill="'+c.color+'" stroke="'+c.color+'" stroke-width="1.8" stroke-linejoin="round">'+campGlyph(c.kind)+'</g></g>';
  }
  // Muted permanent landmarks are locations, not claims that a monster is alive.
  const landmarks={topScuttleAnchor:['scuttle','Aronguejo top'],botScuttleAnchor:['scuttle','Aronguejo bot'],heraldPitAnchor:['pit','Pit do Arauto / Baron'],dragonPitAnchor:['pit','Pit do Dragão']};
  for(const [id,[kind,label]] of Object.entries(landmarks)){
    const p=G.resolvePosition(id);svg+='<g data-landmark="'+id+'" transform="translate('+(p.x*1000)+' '+(p.y*1000)+')"><title>'+label+' · referência de localização</title><circle r="23" fill="#07111d" fill-opacity=".6" stroke="#8cabb1" stroke-width="2" stroke-dasharray="3 4"/><g fill="#a3bcc0" stroke="#a3bcc0" stroke-width="2">'+campGlyph(kind)+'</g></g>';
  }
  svg+='</g><g class="jg-layer-structures">';
  for(const s of Object.values(vm.structures))if(s.state!=='DESTROYED'){
    const size=window.PGHMapDebug?.enabled&&window.PGH_MAP_SIZE_PRESET?window.PGH_MAP_SIZE_PRESET[s.type]:window.PGH_MAP_SCALE_OVERRIDE?(s.type==='INHIBITOR'?39:47)*PGH_MAP_SCALE_OVERRIDE:PGH_JUNGLE_STRUCTURES.sizes[s.type],x=s.x*1000,y=s.y*1000;
    svg+='<g data-structure-id="'+s.id+'" data-structure-type="'+s.type+'" data-state="'+s.state+'" data-x="'+s.x+'" data-y="'+s.y+'"><title>'+s.id+' · '+s.state+'</title>';
    svg+='<image href="'+s.asset+'" x="'+(x-size/2)+'" y="'+(y-size/2)+'" width="'+size+'" height="'+size+'"/>';
    if(s.type==='T1'&&s.platesRemaining>0)svg+='<text x="'+x+'" y="'+(y+2)+'" text-anchor="middle" fill="'+(s.team==='blue'?'#58d7ef':'#ff6575')+'" font-family="monospace" font-size="20" font-weight="900" data-plates="'+s.platesRemaining+'">'+s.platesRemaining+'</text>';
    if(s.state==='DAMAGED')svg+='<path d="M '+(x-2)+' '+(y-12)+' l -5 10 8 3 -5 10" fill="none" stroke="#ffd319" stroke-width="3"/>';
    svg+='</g>';
  }
  svg+='</g>';
  const objectiveLabels={dragon:'DRAG',baron:'BARON',herald:'ARAUTO',grubs:'VAST',scuttleTop:'ARONG.',scuttleBot:'ARONG.'};
  svg+='<g class="jg-layer-objectives">';
  for(const [id,o] of Object.entries(vm.objectives))if(id!=='mark'&&(o.state==='UP'||o.state==='SPAWNING')){
    const x=o.x*1000,y=o.y*1000,occupied=vm.mapActors.some(a=>Math.abs(a.renderX-o.x)*1000<objectiveLabels[id].length*4.2+31&&Math.abs(a.renderY-o.y)*1000<39);
    let label={x,y:y+5};
    if(occupied){
      const candidates=[{x,y:y+55},{x,y:y-48},{x:x+65,y:y+5},{x:x-65,y:y+5},{x,y:y+80}];
      const halfWidth=objectiveLabels[id].length*5.4;
      label=candidates.find(p=>p.x>halfWidth&&p.x<1000-halfWidth&&p.y>15&&p.y<985&&vm.mapActors.every(a=>Math.abs(a.renderX*1000-p.x)>halfWidth+34||Math.abs(a.renderY*1000-(p.y-6))>44))||candidates[0];
    }
    svg+='<g data-objective="'+esc(id)+'" data-state="'+o.state+'"><title>'+(id==='grubs'?'Vastilarvas':objectiveLabels[id])+' · '+(o.state==='UP'?'disponível':'surgindo')+'</title>';
    svg+='<circle cx="'+x+'" cy="'+y+'" r="29" fill="#07101c" stroke="#dfb5ff" stroke-width="3"/>';
    svg+='<text x="'+label.x+'" y="'+label.y+'" text-anchor="middle" fill="#dfb5ff" stroke="#07101c" stroke-width="4" paint-order="stroke" font-size="'+(occupied?18:14)+'" font-weight="700" font-family="monospace">'+objectiveLabels[id]+'</text>';
    if(o.seconds!==undefined)svg+='<text x="'+label.x+'" y="'+(label.y+(occupied?25:42))+'" text-anchor="middle" fill="#fff" stroke="#07101c" stroke-width="4" paint-order="stroke" font-size="21">'+o.seconds+'s</text>';
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
    const x=a.renderX*1000,y=a.renderY*1000,you=a.team==='blue'&&a.role==='JUNGLE';
    svg+='<g data-actor-id="'+esc(a.id)+'" data-champion="'+esc(a.champion)+'" data-role="'+a.role+'" data-team="'+a.team+'" data-state="'+a.state+'" data-x="'+a.renderX+'" data-y="'+a.renderY+'"><title>'+esc(a.champion+' — '+a.cardLabel)+'</title>';
    if(you)svg+='<circle cx="'+x+'" cy="'+y+'" r="36" fill="none" stroke="#ffd319" stroke-width="4"/>';
    svg+=actorPortrait(a,x,y,serial)+'</g>';
  }
  svg+='</g><g class="jg-layer-vision">';
  for(const a of vm.lastSeenActors){
    svg+='<g data-last-seen-id="'+esc(a.id)+'"><title>'+esc(a.champion)+' — última visão, não é posição atual</title>'+actorPortrait(a,a.x*1000,a.y*1000,serial,true)+'</g>';
  }
  svg+='</g><g class="jg-layer-tactical">';
  const mark=vm.objectives.mark;
  if(mark&&['UP','SPAWNING'].includes(mark.state)&&mark.x!==null&&mark.y!==null){
    const x=mark.x*1000,y=mark.y*1000;
    svg+='<g data-objective="mark" data-target-kind="'+esc(mark.target.kind)+'" data-target-id="'+esc(mark.target.id)+'" data-x="'+mark.x+'" data-y="'+mark.y+'"><title>Marca dos Kindred · '+esc(mark.targetLabel)+'</title><circle cx="'+x+'" cy="'+y+'" r="38" fill="none" stroke="#07101c" stroke-width="9"/><circle cx="'+x+'" cy="'+y+'" r="38" fill="none" stroke="#ebc8ff" stroke-width="4" stroke-dasharray="42 9"/><path d="M '+x+' '+(y-49)+' l 7 9 -7 9 -7-9Z" fill="#ebc8ff" stroke="#07101c" stroke-width="2"/></g>';
  }
  svg+='</g>';
  if(window.PGHMapDebug)svg+=PGHMapDebug.overlay(vm);
  return '<div class="jg-map-plane"><img src="assets/maps/terrain-base.png" class="jg-map-base jg-layer-terrain" alt="Minimapa: base azul embaixo à esquerda, base vermelha em cima à direita"><svg class="jg-map-overlay" viewBox="0 0 1000 1000" role="img" aria-label="Champions, campos da selva, estruturas, waves e objetivos">'+svg+'</svg></div>';
}

function jgLaneCard(label,lane,sc,vm){
  const card=vm.cardLanes[lane];
  return '<div class="jg-lc neutral" data-lane="'+lane+'"><div class="jg-lc-label">'+label+'</div><div class="jg-wave-state">WAVE '+esc(card.label)+'</div><div class="jg-lc-actors">'+card.actors.map(renderActorRow).join('')+'</div></div>';
}
function renderActorRow(a){
  const src=portraitFor(a.champion);
  return '<div class="jg-actor-row '+(a.team==='blue'?'ally':'enemy')+'" data-actor-id="'+esc(a.id)+'" data-state="'+a.state+'"><span class="jg-portrait" title="'+esc(a.champion+' · '+a.role)+'">'+esc(champShort(a.champion))+(src?'<img data-jg-portrait="'+esc(a.champion)+'" src="'+src+'" alt="">':'')+'</span><span class="jg-actor-champ">'+esc(a.champion)+'</span><span class="jg-actor-state">'+esc(a.cardLabel)+'</span></div>';
}

function optIcon(label){
  const s = String(label||"").toUpperCase();
  // Use simple text symbols for arcade feel
  if(/DRAGON|DRAKE/.test(s)) return "◆";
  if(/BARON/.test(s)) return "◈";
  if(/HERALD|ARAUTO/.test(s)) return "◉";
  if(/SCUTTLE|CRAB|ARONGUEJO/.test(s)) return "≋";
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
  html += '<span class="jg-status">'+(ps.phase==="question"?("DECIDA! "+ps.answeredCount+"/"+ps.total):(ps.phase==="reveal"?"👀 REVELANDO...":"📢 VEREDITO"))+'</span>';
  html += '<span id="jg-timer" class="jg-timer-display font-mono2">--</span>';
  html += '</div>';
  html += '</div>';
  
  // Timer bar
  html += '<div class="g-timer-wrap" style="margin:6px 0"><div class="g-timer-fill" id="jg-bar" style="width:100%"></div></div>';
  
  if(ps.phase==="question"){
    const hpP = firstPct(sc.hp, 100);
    
    // Context strip (time, you, HP, ult, gold)
    html += '<div class="jg-ctx">';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">TEMPO</span><span class="jg-ctx-val">'+esc(sc.time||"—")+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">VOCÊ</span><span class="jg-ctx-val jg-ctx-you">'+esc(sc.you||"—")+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">HP</span><span class="jg-ctx-val" style="color:'+hpColor(hpP)+'">'+esc(sc.hp||"—")+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">ULT</span><span class="jg-ctx-val'+(String(sc.ult||"").indexOf("READY")>=0?" jg-ctx-on":"")+'">'+esc(sc.ult||"—")+'</span></div>';
    if(sc.gold) html += '<div class="jg-ctx-item"><span class="jg-ctx-label">GOLD</span><span class="jg-ctx-val">'+esc(sc.gold)+'</span></div>';
    html += '<div class="jg-ctx-item"><span class="jg-ctx-label">CENÁRIO</span><span class="jg-ctx-val jg-ctx-type">'+esc((sc.type||"DECISÃO").replace(/scuttle/ig,'aronguejo').replace(/herald/ig,'arauto').toUpperCase())+'</span></div>';
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
    html += '<div class="jg-info"><div class="jg-info-label">JUNGLE · VOCÊ / INIMIGO</div>'+vm.jungleActors.map(renderActorRow).join('');
    html += '<div class="jg-info-row bad">'+esc(sc.ej||'')+'</div>';
    html += '<div class="jg-info-row good"><span class="jg-info-label">OBJETIVOS</span><span>'+esc(vm.objectives.mark?("Marca dos Kindred · "+vm.objectives.mark.targetLabel):(sc.obj||"—"))+'</span></div>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>'; // end jg-main
    html += '<div class="jg-map-key">Azul: aliado · Rosa: inimigo · Dourado: você · ?: última visão · Camps: referência</div>';
    html += '<details class="jg-context-details"><summary>HP, feitiços e contexto das lanes</summary><div>'+['top','mid','bot'].map(l=>'<p><b>'+l.toUpperCase()+':</b> '+esc(sc[l]||'—')+'</p>').join('')+'</div></details>';
    
    // Options
    html += '<div class="jg-question">QUAL É A JOGADA?</div>';
    html += '<div class="jg-options">';
    const letters = ["A","B","C","D"];
    (sc.opts||[]).forEach(function(op, i){
      const picked = myPick===i;
      html += '<button class="jg-opt'+(picked?" picked":"")+'" data-o="'+i+'" '+(myPick!==null?"disabled":"")+'>';
      html += '<span class="opt-letter">'+letters[i]+'</span>';
      html += '<span class="jg-opt-icon">'+optIcon(op)+'</span>';
      html += '<span class="jg-opt-text">'+esc(op)+'</span>';
      if(picked) html += '<span class="jg-locked">🔒</span>';
      html += '</button>';
    });
    html += '</div>';
    
    if(myPick!==null) html += '<div class="g-sub" style="margin-top:6px;font-size:11px">✅ Confirmado · '+ps.answeredCount+'/'+ps.total+'</div>';
    
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
    html += '<div class="jg-replay-row"><span class="jg-replay-label">SUA CALL</span><span class="jg-replay-val">';
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
  if(t) t.textContent = Math.ceil((ps.phase==='question'?Math.min(rem,ps.questionMs||Q_MS):rem)/1000);
  if(bar){
    const nt = PGHStore.currentMod==="NO_THINK";
    const total = ps.phase==="question" ? (ps.questionMs || (ps.instinct ? INSTINCT_MS : (nt ? NO_THINK_MS : Q_MS))) :
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
  players:"2–12 · simultâneo", roundSeconds:Q_MS/1000,
  createInitialState:createInitialState,
  hostAction:hostAction, hostTick:hostTick,
  getPublicState:getPublicState,
  render:function(ps){ if(ps.roundIndex!==lastRound){ lastRound=ps.roundIndex; myPick=null; } render(ps); },
  tickUI:tickUI, onActionResult:onActionResult,
  renderResult:renderResult, cleanup:cleanup
});
})();
