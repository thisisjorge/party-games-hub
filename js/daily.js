/* PGH Daily Arcade — seed diária determinística (America/Sao_Paulo), rotação,
   modificadores, missões, party mix, eventos raros, histórico. §17-§52.
   DAILY cria novidade; FREE PLAY preserva liberdade; CAREER nunca reseta. */
(function(){
"use strict";
const TZ = "America/Sao_Paulo";
const LS_KEY = "pgh_daily_v1";
const MIX_CLEAR_XP = 150, MIX_CLEAR_TOK = 50, CLEAR_XP = 250, CLEAR_TOK = 100, BONUS_TOK = 100;

const MODS = {
  wordbomb: [
    { id: "SHORT_FUSE", name: "SHORT FUSE", desc: "−25% de tempo no pavio", icon: "⏱" },
    { id: "ONE_LIFE", name: "ONE LIFE", desc: "todos começam com 1 vida", icon: "💔" },
    { id: "COMBO_MANIA", name: "COMBO MANIA", desc: "parte combo vale 2x", icon: "⚡" },
    { id: "LONG_WORDS", name: "LONG WORDS", desc: "+50% em palavras 7+", icon: "📏" },
    { id: "HOT_POTATO", name: "HOT POTATO", desc: "pavio encolhe a cada passe", icon: "🥔" }
  ],
  termo: [
    { id: "SPEED_TERMO", name: "SPEED TERMO", desc: "90s pra todo mundo", icon: "⏱" },
    { id: "FIRST_BLOOD", name: "FIRST BLOOD", desc: "+300 pro 1º solve", icon: "🩸" },
    { id: "NO_PANIC", name: "NO PANIC", desc: "8 tentativas", icon: "🧘" }
  ],
  riftle: [
    { id: "OLD_SCHOOL", name: "OLD SCHOOL", desc: "só clássicos (≤2011)", icon: "📼" },
    { id: "REGION_DAY", name: "REGION DAY", desc: "pool de 1 região", icon: "🗺" },
    { id: "SPEED_RIFTLE", name: "SPEED RIFTLE", desc: "60s no relógio", icon: "⏱" },
    { id: "ONE_SHOT", name: "ONE SHOT", desc: "bônus gigante cedo", icon: "🎯" },
    { id: "ROLE_LOCK", name: "ROLE LOCK", desc: "1 rota em foco", icon: "🛡" }
  ],
  jungle: [
    { id: "INSTINCT_ALL", name: "JUNGLE INSTINCT", desc: "todas as decisões em 10s", icon: "⚡" },
    { id: "OBJECTIVE", name: "OBJECTIVE CONTROL", desc: "cenários de objetivo", icon: "🐉" },
    { id: "TRACKER", name: "TRACK THE JUNGLER", desc: "cenários de tracking", icon: "👁" },
    { id: "GANK_FARM", name: "GANK OR FARM", desc: "tempo e pathing", icon: "🌾" },
    { id: "NO_THINK", name: "NO TIME TO THINK", desc: "8s + reveal rápido", icon: "💨" }
  ]
};
const MISSIONS = [
  { key: "wb_pass5", text: "Sobreviva a 5 passes no WordBomb", target: 5, xp: 100, tok: 30 },
  { key: "wb_combo4", text: "Combo 4x+ no WordBomb", target: 1, xp: 120, tok: 40 },
  { key: "termo_solve", text: "Resolva o Termo", target: 1, xp: 100, tok: 30 },
  { key: "riftle_4", text: "Resolva o Riftle em ≤4 tentativas", target: 1, xp: 120, tok: 40 },
  { key: "jg_great3", text: "3 GREAT CALLS no Jungle Gap", target: 3, xp: 150, tok: 50 },
  { key: "win1", text: "Vença 1 minigame", target: 1, xp: 120, tok: 40 },
  { key: "games3", text: "Jogue 3 partidas", target: 3, xp: 100, tok: 30 },
  { key: "jg_pts", text: "3000+ pts em 1 Jungle Gap", target: 1, xp: 150, tok: 50 },
  { key: "mix_done", text: "Complete o Daily Mix", target: 1, xp: 150, tok: 50 }
];
const REGIONS = ["Ionia", "Noxus", "Freljord", "Demacia", "Zaun", "Runeterra", "Ilhas das Sombras", "Águas de Sentina", "Shurima", "Piltover", "Vazio", "Targon", "Ixtal", "Bandle"];
const ROLES = ["TOP", "JG", "MID", "ADC", "SUP"];
const GAMES4 = ["wordbomb", "termo", "riftle", "jungle"];

/* ---------- seed / data ---------- */
function xfnv1a(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function spParts(d){
  try{
    const p = new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",weekday:"short",hour12:false}).formatToParts(d||new Date());
    const o={}; p.forEach(function(x){o[x.type]=x.value;}); return o;
  }catch(e){ const d2=d||new Date(); return {year:String(d2.getFullYear()),month:String(d2.getMonth()+1).padStart(2,"0"),day:String(d2.getDate()).padStart(2,"0"),hour:"12",minute:"00",second:"00",weekday:"Mon"}; }
}
function spDayId(offsetDays){
  const d = new Date(Date.now() + (offsetDays||0)*86400000);
  const p = spParts(d);
  return p.year+"-"+p.month+"-"+p.day;
}
function daySeed(dayId, salt){ return xfnv1a("PARTY_GAMES_HUB_"+dayId+"_"+(salt||0)); }
function msToReset(){
  const p = spParts(new Date());
  const elapsed = (+p.hour%24)*3600000 + (+p.minute)*60000 + (+p.second)*1000;
  return Math.max(0, 86400000 - elapsed);
}
function isWeekend(dayId){
  const p = spParts(new Date());
  const today = p.year+"-"+p.month+"-"+p.day;
  if(dayId===today) return p.weekday==="Sat"||p.weekday==="Sun";
  const d = new Date(dayId+"T12:00:00");
  if(isNaN(d)) return false;
  const w = spParts(d).weekday;
  return w==="Sat"||w==="Sun";
}

/* ---------- config ---------- */
function pickMod(rng, game){
  const arr = MODS[game];
  const m = arr[Math.floor(rng()*arr.length)%arr.length];
  let param = null;
  if(m.id==="REGION_DAY") param = REGIONS[Math.floor(rng()*REGIONS.length)%REGIONS.length];
  if(m.id==="ROLE_LOCK") param = ROLES[Math.floor(rng()*ROLES.length)%ROLES.length];
  return { mod: m.id, param: param };
}
function rollEvent(rng, weekend){
  const r = rng();
  const pD = weekend?0.18:0.10, pG = weekend?0.10:0.05, pM = weekend?0.12:0.08;
  if(r<pD) return "DOUBLE";
  if(r<pD+pG) return "GOLDEN";
  if(r<pD+pG+pM) return "MYSTERY";
  return null;
}
function buildMix(rng, mods, weekend){
  const n = 5;
  const order = ['wordbomb','termo','riftle','jungle','stop','fake','reflex'];
  for(let i=order.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); const t=order[i]; order[i]=order[j]; order[j]=t; }
  const queue=[]; let guard=0;
  while(queue.length<n&&guard<60){
    guard++;
    const g = order[queue.length];
    if(queue.length&&queue[queue.length-1].game===g) continue;
    queue.push({ game:g, mod:mods[g]?.mod||null, param:mods[g]?.param||null, event:rollEvent(rng,weekend) });
  }
  if(!queue.some(function(s){return s.event;})) queue[1+Math.floor(rng()*(queue.length-1))].event = rng()<0.5?"DOUBLE":"MYSTERY";
  return queue;
}
function configSignature(cfg){
  return GAMES4.map(function(g){return cfg.modifiers[g].mod;}).join(",")+"|"+cfg.partyMix.map(function(s){return s.game;}).join(",");
}
function prevDayIdOf(dayId){
  const d = new Date(dayId+"T12:00:00");
  if(isNaN(d)) return null;
  const p = new Date(d.getTime()-86400000);
  return p.getFullYear()+"-"+String(p.getMonth()+1).padStart(2,"0")+"-"+String(p.getDate()).padStart(2,"0");
}
function buildConfig(dayId, salt){
  const rng = mulberry32(daySeed(dayId, salt));
  const weekend = isWeekend(dayId);
  const modifiers = {};
  GAMES4.forEach(function(g){ modifiers[g]=pickMod(rng,g); });
  const pool = MISSIONS.slice();
  for(let i=pool.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); const t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
  const challenges = pool.slice(0,3);
  const partyMix = buildMix(rng, modifiers, weekend);
  const bg = GAMES4[Math.floor(rng()*GAMES4.length)%GAMES4.length];
  const frames = ["pink","gold","toxic","void","rift"];
  return { id:dayId, seed:daySeed(dayId,salt), weekend:weekend,
    featuredGames:GAMES4.slice(), modifiers:modifiers, challenges:challenges,
    partyMix:partyMix, bonusGame:{game:bg,mod:modifiers[bg].mod,param:modifiers[bg].param},
    specialEvent: partyMix.some(function(s){return s.event==="GOLDEN";})?"GOLDEN":(partyMix.some(function(s){return s.event==="DOUBLE";})?"DOUBLE":null),
    cosmeticSpotlight:frames[Math.floor(rng()*frames.length)%frames.length] };
}
function configFor(dayId, salt){
  salt = salt||0;
  let prevSig = null;
  try{ const pd = prevDayIdOf(dayId); if(pd) prevSig = configSignature(buildConfig(pd, 0)); }catch(e){ prevSig = null; }
  let attempt = 0, cfg = null;
  while(attempt<4){
    cfg = buildConfig(dayId, salt+attempt*101);
    if(prevSig && configSignature(cfg)===prevSig){ attempt++; continue; } // §50: evita repetição
    break;
  }
  return cfg;
}

/* ---------- storage ---------- */
const mem = {};
function lsGet(k){ try{ return window.localStorage.getItem(k); }catch(e){ return (k in mem)?mem[k]:null; } }
function lsSet(k,v){ v=String(v); try{ window.localStorage.setItem(k,v); }catch(e){ mem[k]=v; } }
function freshDay(){ return { score:0, best:0, games:0, wins:0, mixDone:false, bonusClaimed:false, clearClaimed:false, m:{}, jgSeen:{} }; }
function loadState(){
  let st = null;
  try{ st = JSON.parse(lsGet(LS_KEY)); }catch(e){ st=null; }
  if(!st||typeof st!=="object") st = { v:1, lastId:null, lastSeen:null, days:{}, hist:[] };
  st.days = st.days||{}; st.hist = st.hist||[];
  return st;
}
function saveState(){ try{ lsSet(LS_KEY, JSON.stringify(state)); }catch(e){} }
let state = loadState();
let debugDayOffset = 0, debugSalt = 0, debugEvent = null, gameNonce = 0;

/* ---------- dia atual / rollover ---------- */
function currentId(){ return spDayId(debugDayOffset); }
function current(){ return configFor(currentId(), debugSalt); }
function day(){ const id=((PGHStore.gamePhase==='playing'||PGHStore.gamePhase==='intro'||PGHStore.gamePhase==='ended')&&PGHStore.daily?.id)||currentId(); if(!state.days[id])state.days[id]=freshDay(); return state.days[id]; }
function ensureDay(){
  const id = currentId();
  if(state.lastId===id){ if(!state.days[id]){state.days[id]=freshDay();saveState();} return false; }
  if(state.lastId && state.days[state.lastId]){
    const d = state.days[state.lastId];
    state.hist.unshift({ id:state.lastId, played:d.games>0, best:d.score });
    state.hist = state.hist.slice(0,30);
    delete state.days[state.lastId];
  }
  Object.keys(state.days).forEach(function(k){ if(k!==id)delete state.days[k]; });
  state.days[id] = freshDay();
  state.lastId = id;
  saveState();
  return true;
}
function onLobbyHome(){ // §49: rollover só fora de partida
  const rolled = ensureDay();
  if(rolled){
    try{ UI.toast("★ DAILY ROTATION UPDATED ★","success"); AudioManager.play("coin"); }catch(e){}
    try{ if(PGHStore.isHost&&PGHStore.roomCode){ PGHStore.daily=current(); Rooms.broadcastFullSync(); } }catch(e){}
  }
  if(PGHStore.screen==="home"){ try{ renderHome(); }catch(e){} }
}

/* ---------- missões ---------- */
function missionDef(key){ for(let i=0;i<MISSIONS.length;i++) if(MISSIONS[i].key===key) return MISSIONS[i]; return null; }
function missionState(key){ const d=day(); if(!d.m[key])d.m[key]={p:0,done:false}; return d.m[key]; }
function todayChallenges(){ const cfg=(PGHStore.roomCode&&PGHStore.daily&&PGHStore.daily.id)?PGHStore.daily:current(); return cfg.challenges||[]; }
function progressMission(key, n){
  const ch = todayChallenges();
  let active = false;
  for(let i=0;i<ch.length;i++) if(ch[i].key===key) active=true;
  if(!active) return;
  const def = missionDef(key); if(!def) return;
  const ms = missionState(key);
  if(ms.done) return;
  ms.p = Math.min(def.target, ms.p+(n||1));
  if(ms.p>=def.target){
    ms.done = true;
    try{
      ProfileManager.addXP(def.xp);
      PGHStore.profile.tokens+=def.tok;
      PGHStorage.saveProfile(PGHStore.profile); PGHBus.emit("profile",PGHStore.profile);
      UI.toast("✅ MISSÃO: "+def.text+" · +"+def.xp+" XP +"+def.tok+" 🪙","success",4000);
      AudioManager.play("achievement"); UI.confetti(40);
    }catch(e){}
  }
  saveState();
  checkClear();
  try{ if(PGHStore.screen==="home")renderHome(); }catch(e){}
}
function checkClear(){
  const d = day();
  if(d.clearClaimed) return;
  const ch = todayChallenges();
  for(let i=0;i<ch.length;i++){ const ms=d.m[ch[i].key]; if(!ms||!ms.done) return; }
  d.clearClaimed = true; saveState();
  try{
    ProfileManager.addXP(CLEAR_XP);
    PGHStore.profile.tokens+=CLEAR_TOK;
    PGHStorage.saveProfile(PGHStore.profile); PGHBus.emit("profile",PGHStore.profile);
  }catch(e){}
  try{
    const p = PGHStore.profile||{};
    const src = window.portraitSrc?portraitSrc(p,"WIN"):(p.avatar||"");
    const m = UI.openModal("<h3>★ DAILY CLEAR! ★</h3><div class='avatar-preview' style='width:110px;height:110px;margin:8px auto'><img class='expr-pop' src='"+src+"' alt=''></div><div style='text-align:center;font-family:var(--font-pixel);font-size:13px;color:var(--yellow)'>TODAS AS MISSÕES!</div><div style='text-align:center;margin-top:6px'>+"+CLEAR_XP+" XP · +"+CLEAR_TOK+" 🪙</div><button class='btn-arcade primary big w-full' id='daily-clear-ok' style='margin-top:12px'>BOA! ✓</button>");
    AudioManager.play("victory"); UI.confetti(120);
    const close = function(){ try{UI.closeModal();}catch(e){} };
    m.querySelector("#daily-clear-ok").addEventListener("click",close);
    setTimeout(close, 5000);
  }catch(e){}
}
function track(ev, data){
  data = data||{};
  try{
    const d = day();
    if(ev==="WB_PASS"){ progressMission("wb_pass5",1); if((data.combo||0)>=4)progressMission("wb_combo4",1); }
    else if(ev==="TERMO_SOLVE"){ progressMission("termo_solve",1); }
    else if(ev==="RIFTLE_SOLVE"){ if((data.guesses||99)<=4)progressMission("riftle_4",1); }
    else if(ev==="JG_TIER"){
      const k = gameNonce+":"+data.round;
      if(!d.jgSeen[k]){ d.jgSeen[k]=1; saveState(); if(data.tier==="G")progressMission("jg_great3",1); }
    }
    else if(ev==="MIX_DONE"){ progressMission("mix_done",1); }
  }catch(e){}
}
function onGameEnd(info){
  try{
    const d = day();
    d.games++; d.score += (info.points||0);
    if(d.score>d.best)d.best=d.score;
    if(info.placement===1){ d.wins++; progressMission("win1",1); }
    progressMission("games3",1);
    if(info.game==="jungle"&&(info.points||0)>=3000)progressMission("jg_pts",1);
    // bonus game: jogar o jogo+bônus do dia com o mod certo
    const cfg = (PGHStore.roomCode&&PGHStore.daily&&PGHStore.daily.id)?PGHStore.daily:current();
    if(cfg&&cfg.bonusGame&&!d.bonusClaimed&&info.mod&&cfg.bonusGame.game===info.game&&cfg.bonusGame.mod===info.mod){
      d.bonusClaimed = true;
      PGHStore.profile.tokens+=BONUS_TOK;
      PGHStorage.saveProfile(PGHStore.profile); PGHBus.emit("profile",PGHStore.profile);
      UI.toast("🎁 BONUS GAME! +"+BONUS_TOK+" 🪙","success",4000); AudioManager.play("coin");
    }
    saveState();
  }catch(e){}
}

/* ---------- sala / modo ---------- */
function hostInit(){
  PGHStore.daily = current();
  PGHStore.dailyMix = null;
  PGHStore.dailyMode = false;
  PGHStore.currentMod = null; PGHStore.currentParam = null; PGHStore.currentEvent = null;
}
function hostQuitToLobby(){ clearEventVisual(); } // mix ativo sobrevive: continua no lobby
function toggleMode(){
  if(!PGHStore.isHost)return;
  PGHStore.dailyMode = !PGHStore.dailyMode;
  try{
    AudioManager.play("coin");
    if(PGHStore.dailyMode){ const m=PGHStore.daily&&PGHStore.daily.modifiers&&PGHStore.daily.modifiers[PGHStore.selectedGame]; UI.toast(m?("★ DAILY ON · "+modName(PGHStore.selectedGame,m.mod)):"★ DAILY ON","success"); }
    else UI.toast("🎲 FREE PLAY · sem modificadores","warn");
    Rooms.broadcastFullSync(); Rooms.renderLobby();
  }catch(e){}
}
function getStartSlot(){
  const mix = PGHStore.dailyMix;
  if(mix&&mix.active&&mix.queue&&mix.queue[mix.idx]){
    const s = mix.queue[mix.idx];
    return { game:s.game, mod:s.mod||null, param:s.param||null, event:(debugEvent||s.event||null), mix:{idx:mix.idx,total:mix.queue.length} };
  }
  if(PGHStore.dailyMode&&PGHStore.daily&&PGHStore.daily.modifiers&&PGHStore.selectedGame){
    const m = PGHStore.daily.modifiers[PGHStore.selectedGame];
    if(m) return { game:PGHStore.selectedGame, mod:m.mod||null, param:m.param||null, event:debugEvent||null, mix:null };
  }
  if(debugEvent) return { game:PGHStore.selectedGame, mod:null, param:null, event:debugEvent, mix:null };
  return null;
}
function scoreMult(){ const e=PGHStore.currentEvent; return (e==="DOUBLE"||e==="GOLDEN")?2:1; }
function eventNote(){
  const e = PGHStore.currentEvent;
  if(e==="DOUBLE") return "×2 DOUBLE SCORE!";
  if(e==="GOLDEN") return "×2 GOLDEN ROUND!";
  return null;
}
function modDef(game, modId){
  const arr = MODS[game]||[];
  for(let i=0;i<arr.length;i++) if(arr[i].id===modId) return arr[i];
  return null;
}
function modName(game, modId){ const m=modDef(game,modId); return m?(m.icon+" "+m.name):""; }
function gameName(id){ try{ const g=GameManager.get(id); return g?g.name:id; }catch(e){ return id; } }
function gameIcon(id){ try{ const g=GameManager.get(id); return g?g.icon:"🎮"; }catch(e){ return "🎮"; } }
function nameTag(g){
  let t = g.name.toUpperCase();
  if(PGHStore.currentMod){ const m=modDef(g.id,PGHStore.currentMod); if(m)t+=" · "+m.name; }
  if(PGHStore.currentEvent==="GOLDEN")t+=" ✦";
  return t;
}
function newGameNonce(){ gameNonce++; }
function applyEventVisual(ev){
  try{
    document.body.classList.remove("golden-round");
    if(ev==="GOLDEN"&&!(PGHStore.settings&&PGHStore.settings.reducedEffects))document.body.classList.add("golden-round");
  }catch(e){}
}
function clearEventVisual(){ try{ document.body.classList.remove("golden-round"); }catch(e){} }

/* ---------- party mix ---------- */
function endMix(){
  if(!PGHStore.isHost)return;
  PGHStore.dailyMix = null;
  try{ Rooms.broadcastFullSync(); Rooms.renderLobby(); }catch(e){}
  try{ UI.toast("MIX encerrado · FREE PLAY","warn"); }catch(e){}
}
function startMix(){
  if(!PGHStore.isHost||!PGHStore.daily)return;
  if(PGHStore.gamePhase!=="lobby"){ UI.toast("Termine a partida atual primeiro","warn"); return; }
  const mx0 = PGHStore.dailyMix;
  if(mx0&&mx0.active&&mx0.queue&&mx0.queue[mx0.idx]){ GameManager.startGame(); return; } // continua do slot atual
  const count=PGHStore.players.filter(p=>p.connected).length;
  if(count<2){UI.toast('Party Mix precisa de pelo menos 2 jogadores','warn');return;}
  const queue=PGHStore.daily.partyMix.map(s=>{const g=GameManager.get(s.game);return count<(g?.minPlayers||1)||count>(g?.maxPlayers||12)?{game:'jungle',mod:null,param:null,event:s.event}:s;});
  PGHStore.dailyMix = { active:true, queue, idx:0, baseScores:Object.fromEntries(PGHStore.players.map(p=>[p.id,p.sessionScore||0])) };
  AudioManager.play("coin"); UI.confetti(80);
  Chat.sys("★ DAILY MIX iniciado! "+PGHStore.dailyMix.queue.length+" jogos na sequência.");
  try{ Rooms.broadcastFullSync(); }catch(e){}
  GameManager.startGame();
}
function nextGame(){
  if(!PGHStore.isHost)return;
  const mix = PGHStore.dailyMix;
  if(!mix||!mix.active||PGHStore.gamePhase!=='ended'||mix.idx>=mix.queue.length-1)return;
  mix.idx++;
  try{ Rooms.broadcastFullSync(); }catch(e){}
  GameManager.startGame();
}
function resultButtonsHTML(){
  const mix = PGHStore.dailyMix;
  if(PGHStore.isHost){
    if(mix&&mix.active&&mix.queue){
      if(mix.idx<mix.queue.length-1){
        const nx = mix.queue[mix.idx+1];
        const label = nx.event==="MYSTERY"?"??? MYSTERY MACHINE →":("PRÓXIMO: "+gameIcon(nx.game)+" "+gameName(nx.game)+(nx.mod?" · "+modName(nx.game,nx.mod):"")+" →");
        return '<div class="g-row" style="margin-top:16px"><button class="btn-arcade primary" id="btn-mixnext">'+label+'</button><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>';
      }
      return '<div class="g-row" style="margin-top:16px"><button class="btn-arcade secondary" id="btn-podium">★ VER PODIUM</button><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>';
    }
    return '<div class="g-row" style="margin-top:16px"><button class="btn-arcade primary" id="btn-again">↻ JOGAR DE NOVO</button><button class="btn-arcade secondary" id="btn-change-game">TROCAR JOGO</button><button class="btn-arcade ghost" id="btn-tolobby">VOLTAR AO LOBBY</button></div>';
  }
  const mixw=PGHStore.dailyMix;
  const wait=(mixw&&mixw.active)?'<div class="g-sub" style="margin-top:16px">Aguardando HOST avançar o MIX ★ '+(mixw.idx+1)+'/'+mixw.queue.length+'...</div>':'<div class="g-sub" style="margin-top:16px">Aguardando HOST voltar ao lobby...</div>';
  return wait+'<div class="g-row"><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>';
}
function bindResultButtons(){
  const q = function(id){ return document.getElementById(id); };
  const ag=q("btn-again"); if(ag)ag.addEventListener("click",function(){ GameManager.startGame(); });
  const cg=q('btn-change-game');if(cg)cg.addEventListener('click',function(){GameManager.quitToLobby();document.getElementById('machines-grid')?.scrollIntoView({block:'center'});});
  const nx=q("btn-mixnext"); if(nx)nx.addEventListener("click",function(){ AudioManager.play("coin"); nextGame(); });
  const pd=q("btn-podium"); if(pd)pd.addEventListener("click",function(){ showPodium(true); });
  const lb=q("btn-tolobby"); if(lb)lb.addEventListener("click",function(){ GameManager.quitToLobby(); });
}
function decorateResult(){
  try{
    const root = document.getElementById("game-root"); if(!root||!root.firstChild)return;
    const bits = [];
    if(PGHStore.currentMod){ const g = GameManager.current; const m = g?modDef(g,PGHStore.currentMod):null; if(m)bits.push("<span class='res-mod'>"+m.icon+" "+m.name+"</span>"); }
    const en = eventNote(); if(en)bits.push("<span class='res-event'>"+en+"</span>");
    const mix = PGHStore.dailyMix;
    if(mix&&mix.active&&mix.queue)bits.push("<span class='res-mix'>★ MIX "+(mix.idx+1)+"/"+mix.queue.length+"</span>");
    if(!bits.length)return;
    const d = document.createElement("div"); d.className="res-daily"; d.innerHTML = bits.join(" ");
    root.insertBefore(d, root.firstChild);
  }catch(e){}
}
function showPodium(asHost){
  try{
    const base=PGHStore.dailyMix?.baseScores||{};
    const sorted = PGHStore.players.map(p=>({...p,sessionScore:(p.sessionScore||0)-(base[p.id]||0)})).sort(function(a,b){return(b.sessionScore||0)-(a.sessionScore||0);});
    const top = sorted.slice(0,3);
    const exprs = ["WIN","HAPPY","NORMAL"];
    const medals = ["🥇","🥈","🥉"];
    let html = "<h3>★ DAILY CHAMPION ★</h3>";
    html += "<div class='podium'>";
    top.forEach(function(p,i){
      const src = window.portraitSrc?portraitSrc(p,exprs[i]):(p.avatar||"");
      html += "<div class='podium-slot place-"+(i+1)+"'><div class='pod-medal'>"+medals[i]+"</div><div class='avatar-preview frame-neon' style='width:"+(i===0?"96px":"72px")+";height:"+(i===0?"96px":"72px")+";margin:4px auto'><img class='expr-pop' src='"+src+"' alt=''></div><div class='pod-nick font-pixel'>"+String(p.nickname||"???").toUpperCase()+"</div><div class='pod-pts font-mono2'>"+(p.sessionScore||0)+" PTS</div></div>";
    });
    html += "</div>";
    const champ = top[0];
    html += "<div class='pod-champ'>👑 "+String(champ?champ.nickname:"—").toUpperCase()+"</div>";
    html += "<div class='g-sub' style='text-align:center'>campeão do Daily Mix desta sala</div>";
    html += "<button class='btn-arcade primary big w-full' id='pod-lobby' style='margin-top:12px'>LOBBY →</button>";
    if(PGHStore.isHost)html+="<button class='btn-arcade secondary w-full' id='pod-again' style='margin-top:12px'>JOGAR MIX DE NOVO</button>";
    const m = UI.openModal(html);
    m.querySelector('#pod-again')?.addEventListener('click',function(){UI.closeModal();PGHStore.dailyMix=null;GameManager.quitToLobby();startMix();});
    AudioManager.play("victory"); UI.confetti(160);
    // recompensa de conclusão (1x/dia, cada jogador na própria máquina)
    const d = day();
    if(!d.mixDone){
      d.mixDone = true; saveState();
      ProfileManager.addXP(MIX_CLEAR_XP);
      PGHStore.profile.tokens+=MIX_CLEAR_TOK;
      PGHStorage.saveProfile(PGHStore.profile); PGHBus.emit("profile",PGHStore.profile);
      UI.toast("★ MIX COMPLETO! +"+MIX_CLEAR_XP+" XP +"+MIX_CLEAR_TOK+" 🪙","success",4000);
      track("MIX_DONE",{});
    }
    m.querySelector("#pod-lobby").addEventListener("click",function(){
      UI.closeModal();
      if(asHost&&PGHStore.isHost){ PGHStore.dailyMix=null; try{Rooms.broadcastFullSync();}catch(e){} }
      GameManager.quitToLobby();
    });
    if(asHost&&PGHStore.isHost){ try{ Net.hostBroadcastRaw(Net.mkMsg("MIX_PODIUM",{})); }catch(e){} }
  }catch(e){}
}

/* ---------- spotlight ---------- */
function spotFrameId(){ const cfg=(PGHStore.daily&&PGHStore.daily.id)?PGHStore.daily:current(); return (cfg&&cfg.cosmeticSpotlight)||null; }
function spotPrice(f){
  if(f&&f.id&&f.id===spotFrameId()&&f.price>0) return Math.max(1,Math.ceil(f.price*0.75));
  return f?f.price:0;
}

/* ---------- home UI ---------- */
function fmtCountdown(ms){
  const s = Math.floor(ms/1000);
  const h = String(Math.floor(s/3600)).padStart(2,"0"), m = String(Math.floor(s%3600/60)).padStart(2,"0"), ss = String(s%60).padStart(2,"0");
  return h+":"+m+":"+ss;
}
function tickCountdown(){
  try{
    const el = document.getElementById("daily-countdown");
    if(el&&PGHStore.screen==="home")el.textContent = fmtCountdown(msToReset());
  }catch(e){}
}
function renderHome(){
  const panel = document.getElementById("daily-panel"); if(!panel)return;
  ensureDay();
  const cfg = current();
  const d = day();
  const isNew = state.lastSeen!==cfg.id;
  let html = "<div class='daily-marquee font-pixel'><span>★ DAILY ARCADE ★ NEW ROTATION ★ DAILY ARCADE ★ NEW ROTATION ★&nbsp;</span><span>★ DAILY ARCADE ★ NEW ROTATION ★ DAILY ARCADE ★ NEW ROTATION ★&nbsp;</span></div>";
  if(isNew)html += "<div id='daily-newflag' class='daily-newflag pop'>✦ NEW DAILY ROTATION ✦<small>toque pra dispensar</small></div>";
  html += "<div class='daily-grid'>";
  // lineup
  html += "<div class='daily-box'><div class='daily-box-t font-pixel'>TODAY'S LINEUP</div><div class='daily-lineup'>";
  cfg.featuredGames.forEach(function(gid){
    const md = cfg.modifiers[gid]; const m = modDef(gid, md.mod);
    html += "<div class='daily-game' title='"+m.name+" · "+m.desc+"'><div class='dg-icon'>"+gameIcon(gid)+"</div><div class='dg-name'>"+gameName(gid)+"</div><div class='dg-mod'>"+m.icon+" "+m.name+"</div>"+(md.param?"<div class='dg-param'>"+md.param+"</div>":"")+"</div>";
  });
  html += "</div>";
  if(cfg.specialEvent)html += "<div class='daily-special'>✦ EVENTO RARO HOJE: "+(cfg.specialEvent==="GOLDEN"?"GOLDEN ROUND":"DOUBLE SCORE")+" ✦</div>";
  html += "<div class='daily-bonus'>🎁 BONUS GAME: <b>"+gameIcon(cfg.bonusGame.game)+" "+gameName(cfg.bonusGame.game)+"</b> com "+modName(cfg.bonusGame.game,cfg.bonusGame.mod)+" → +"+BONUS_TOK+" 🪙</div>";
  html += "</div>";
  // missions + score
  html += "<div class='daily-box'><div class='daily-box-t font-pixel'>DAILY MISSIONS</div><div class='daily-missions'>";
  cfg.challenges.forEach(function(c){
    const ms = d.m[c.key]||{p:0,done:false};
    const pct = Math.min(100,Math.round(ms.p/c.target*100));
    html += "<div class='mission"+(ms.done?" done":"")+"'><div class='m-check'>"+(ms.done?"☑":"□")+"</div><div class='m-body'><div class='m-text'>"+c.text+"</div><div class='m-bar'><div style='width:"+pct+"%'></div></div></div><div class='m-rew'>+"+c.xp+" XP<br>+"+c.tok+" 🪙</div></div>";
  });
  html += "</div>";
  html += "<div class='daily-score'>TODAY <b>"+d.score+"</b> PTS · BEST <b>"+d.best+"</b> · GAMES <b>"+d.games+"</b> · WINS <b>"+d.wins+"</b>"+(d.mixDone?" · ★ MIX ✓":"")+"</div>";
  // spotlight
  try{
    const fr = ProfileManager.FRAMES.find(function(f){return f.id===cfg.cosmeticSpotlight;});
    if(fr)html += "<div class='daily-spot'>✨ SPOTLIGHT: "+fr.icon+" "+fr.name+" FRAME · <s>"+fr.price+"🪙</s> <b>"+spotPrice(fr)+"🪙</b> hoje!</div>";
  }catch(e){}
  // reset + history
  html += "<div class='daily-reset'>NEXT ROTATION · <span id='daily-countdown' class='font-mono2'>"+fmtCountdown(msToReset())+"</span>"+(cfg.weekend?" · 🎪 WEEKEND CHAOS (mix 6!)":"")+"</div>";
  if(state.hist.length){
    html += "<div class='daily-hist'>";
    state.hist.slice(0,5).forEach(function(hh){
      html += "<span class='hist-day"+(hh.played?" played":"")+"' title='"+hh.id+" · best "+hh.best+"'>"+hh.id.slice(5)+" "+(hh.played?"✓":"·")+"</span>";
    });
    html += "</div>";
  }
  html += "</div></div>";
  panel.innerHTML = html;
  const nf = document.getElementById("daily-newflag");
  if(nf){
    state.lastSeen = cfg.id; saveState();
    const hide = function(){ try{nf.remove();}catch(e){} };
    nf.addEventListener("click",hide);
    setTimeout(hide, 8000);
  }
}
function maybeFirstOpen(){ /* banner é tratado no renderHome; sem modal bloqueante */ }

/* ---------- lobby UI ---------- */
function renderLobbyBits(){
  try{
    const isH = PGHStore.isHost;
    const dm = document.getElementById("btn-dmode");
    if(dm){
      dm.classList.toggle("hidden",!isH);
      dm.innerHTML = PGHStore.dailyMode?"<span>★ DAILY</span>":"<span>🎲 FREE</span>";
      dm.classList.toggle("daily-on",!!PGHStore.dailyMode);
    }
    const mx = document.getElementById("btn-mix");
    const mixActive = PGHStore.dailyMix&&PGHStore.dailyMix.active;
    if(mx){
      mx.classList.toggle("hidden",!isH);
      mx.innerHTML = mixActive?("<span>CONTINUAR MIX ★ "+(PGHStore.dailyMix.idx+1)+"/"+PGHStore.dailyMix.queue.length+"</span>"):("<span>★ DAILY MIX</span>");
    }
    const hint = document.getElementById("selected-game-hint");
    if(hint&&PGHStore.dailyMode&&PGHStore.daily){
      const md = PGHStore.daily.modifiers&&PGHStore.daily.modifiers[PGHStore.selectedGame];
      if(md)hint.textContent = "· ★ DAILY "+modName(PGHStore.selectedGame,md.mod);
    }
    // badges de mod nas máquinas
    const grid = document.getElementById("machines-grid");
    if(grid&&PGHStore.daily&&PGHStore.daily.modifiers){
      Array.prototype.forEach.call(grid.children,function(el){
        const gid = el.getAttribute&&el.getAttribute("data-game");
        const md = gid&&PGHStore.daily.modifiers[gid];
        let b = el.querySelector?el.querySelector(".mod-badge"):null;
        if(md){
          const m = modDef(gid,md.mod);
          if(!b){ b=document.createElement("div"); b.className="mod-badge"; el.appendChild(b); }
          b.textContent = m.icon+" "+m.name+(md.param?" · "+md.param:"");
          b.classList.toggle("applied",!!PGHStore.dailyMode);
        }else if(b){ b.remove(); }
      });
    }
    // painel do mix
    const mp = document.getElementById("mix-panel");
    if(mp){
      if(mixActive){
        mp.classList.remove("hidden");
        let mh = "<div class='mix-title font-pixel'>★ DAILY MIX · "+(PGHStore.dailyMix.idx+1)+"/"+PGHStore.dailyMix.queue.length+(isH?" <button id='mix-end' class='mix-end' title='encerrar mix'>✕</button>":"")+"</div><div class='mix-slots'>";
        PGHStore.dailyMix.queue.forEach(function(s,i){
          const st = i<PGHStore.dailyMix.idx?"done":(i===PGHStore.dailyMix.idx?"cur":"todo");
          const hidden = s.event==="MYSTERY"&&i>PGHStore.dailyMix.idx;
          mh += "<div class='mix-slot "+st+"'>"+(hidden?"<div class='ms-icon'>?</div><div class='ms-name'>???</div><div class='ms-mod'>MYSTERY</div>":"<div class='ms-icon'>"+gameIcon(s.game)+"</div><div class='ms-name'>"+gameName(s.game)+"</div><div class='ms-mod'>"+(s.mod?modName(s.game,s.mod):"")+"</div>")+(s.event==="DOUBLE"?"<div class='ms-ev'>×2</div>":s.event==="GOLDEN"?"<div class='ms-ev gold'>✦×2</div>":"")+"</div>";
        });
        mp.innerHTML = mh+"</div>";
        const me = document.getElementById("mix-end");
        if(me)me.addEventListener("click",function(){ endMix(); });
      }else mp.classList.add("hidden");
    }
  }catch(e){}
}

/* ---------- debug ---------- */
function renderDebug(){
  try{
    if(!/[\?&]debug=1/.test(location.search))return;
    if(document.getElementById("debug-daily"))return;
    const d = document.createElement("div");
    d.id = "debug-daily";
    d.innerHTML = "<b>DAILY-DBG</b> <span id='dbg-day'></span><br>"+
      "<button data-d='prev'>−1 DIA</button> <button data-d='next'>+1 DIA</button> <button data-d='reroll'>REROLL</button><br>"+
      "<button data-d='mission'>COMPLETE MISSION</button> <button data-d='reset'>RESET DAILY</button> <button data-d='rare'>FORCE RARE</button>";
    document.body.appendChild(d);
    const upd = function(){ const s=document.getElementById("dbg-day"); if(s)s.textContent=currentId()+" salt:"+debugSalt+(debugEvent?" ev:"+debugEvent:""); };
    upd();
    d.addEventListener("click",function(e){
      const b = e.target.getAttribute&&e.target.getAttribute("data-d"); if(!b)return;
      if(b==="prev")debugDayOffset--;
      if(b==="next")debugDayOffset++;
      if(b==="reroll")debugSalt++;
      if(b==="reset"){ state={v:1,lastId:null,lastSeen:null,days:{},hist:[]}; debugDayOffset=0; debugSalt=0; debugEvent=null; saveState(); ensureDay(); }
      if(b==="mission"){ const ch=current().challenges; const dd=day(); for(let i=0;i<ch.length;i++){ const ms=missionState(ch[i].key); if(!ms.done){ progressMission(ch[i].key, 999); break; } } }
      if(b==="rare"){ debugEvent = debugEvent==="GOLDEN"?"DOUBLE":debugEvent==="DOUBLE"?null:"GOLDEN"; UI.toast("FORCE RARE: "+(debugEvent||"off"),"warn"); }
      upd();
      try{ if(PGHStore.screen==="home")renderHome(); }catch(e){}
    });
  }catch(e){}
}

/* ---------- init ---------- */
function init(){
  PGHStore.daily = PGHStore.daily||null;
  PGHStore.dailyMix = PGHStore.dailyMix||null;
  PGHStore.dailyMode = !!PGHStore.dailyMode;
  PGHStore.currentMod = PGHStore.currentMod||null;
  PGHStore.currentParam = PGHStore.currentParam||null;
  PGHStore.currentEvent = PGHStore.currentEvent||null;
  ensureDay();
  renderDebug();
  try{
    setInterval(tickCountdown,1000);
    setInterval(function(){ try{ if(PGHStore.screen==="home"||PGHStore.screen==="lobby")onLobbyHome(); }catch(e){} },30000);
  }catch(e){}
}
window.Daily = { MODS:MODS, MISSIONS:MISSIONS, spDayId:spDayId, daySeed:daySeed, configFor:configFor, current:current, currentId:currentId,
  msToReset:msToReset, ensureDay:ensureDay, onLobbyHome:onLobbyHome, day:day, track:track, onGameEnd:onGameEnd,
  hostInit:hostInit, hostQuitToLobby:hostQuitToLobby, toggleMode:toggleMode, getStartSlot:getStartSlot,
  scoreMult:scoreMult, eventNote:eventNote, modDef:modDef, modName:modName, gameName:gameName, gameIcon:gameIcon,
  nameTag:nameTag, newGameNonce:newGameNonce, applyEventVisual:applyEventVisual, clearEventVisual:clearEventVisual,
  startMix:startMix, endMix:endMix, nextGame:nextGame, resultButtonsHTML:resultButtonsHTML, bindResultButtons:bindResultButtons,
  decorateResult:decorateResult, showPodium:showPodium, spotFrameId:spotFrameId, spotPrice:spotPrice,
  renderHome:renderHome, tickCountdown:tickCountdown, maybeFirstOpen:maybeFirstOpen, renderLobbyBits:renderLobbyBits,
  renderDebug:renderDebug, init:init,
  _state:function(){return state;}, _debug:function(){return{off:debugDayOffset,salt:debugSalt,ev:debugEvent};} };
})();
