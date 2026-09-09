/* PGH GameManager — registry + ciclo de vida + roteamento host/client */
(function(){
"use strict";
const games={};
let current=null; // gameId
let hostState=null; // host authoritative full state
let publicState=null; // last public state (all)
let currentMatch=null;
const rewardedMatches=new Set();
let hostTickTimer=null, introTimer=null, uiTimer=null;
function register(def){ games[def.id]=def; }
function list(){ return Object.keys(games).map(function(k){return games[k];}); }
function get(id){ return games[id]||null; }

function selectGame(id){
  if(!PGHStore.isHost||!games[id])return;
  if(PGHStore.gamePhase==='intro'||PGHStore.gamePhase==='playing')return;
  if(PGHStore.dailyMix?.active&&PGHStore.dailyMix.queue[PGHStore.dailyMix.idx]?.game!==id){PGHStore.dailyMix=null;}
  PGHStore.selectedGame=id;
  Net.hostBroadcastRaw(Net.mkMsg("GAME_SELECTED",{gameId:id}));
  Rooms.broadcastFullSync();
  try{ Rooms.renderLobby(); }catch(e){}
  AudioManager.play("coin");
}
function startGame(){
  if(!PGHStore.isHost)return;
  if(PGHStore.gamePhase==='intro'||PGHStore.gamePhase==='playing')return;
  const slot=(window.Daily&&Daily.getStartSlot)?Daily.getStartSlot():null;
  if(slot&&slot.game)PGHStore.selectedGame=slot.game;
  const g=games[PGHStore.selectedGame];
  if(!g){ UI.toast("HOST: escolha uma máquina primeiro","warn"); return; }
  const connected=PGHStore.players.filter(function(p){return p.connected;});
  if(connected.length<(g.minPlayers||1)||connected.length>(g.maxPlayers||12)){UI.toast(g.name+': '+(g.minPlayers||1)+' a '+(g.maxPlayers||12)+' jogadores','warn');return;}
  stopHostTick();stopIntro();stopUiTimer();
  currentMatch=PGHHelpers.uid('match_');
  const matchId=currentMatch;
  // reseta ready + estado efêmero dos jogos (restart limpo)
  PGHStore.players.forEach(function(p){ if(!p.isHost)p.ready=false; });
  Object.keys(games).forEach(function(k){ try{ if(games[k].cleanup)games[k].cleanup(); }catch(e){} });
  PGHStore.gamePhase="intro";
  const endsAt=Date.now()+3600;
  const dMod=slot?slot.mod:null, dParam=slot?slot.param:null, dEvent=slot?slot.event:null;
  PGHStore.currentMod=dMod; PGHStore.currentParam=dParam; PGHStore.currentEvent=dEvent;
  if(window.Daily){Daily.newGameNonce();Daily.applyEventVisual(dEvent);}
  Net.hostBroadcastRaw(Net.mkMsg("GAME_STARTING",{gameId:g.id,matchId,endsAt:endsAt,mod:dMod,param:dParam,event:dEvent,mix:slot?slot.mix:null}));
  Rooms.broadcastFullSync();
  showIntro(g,endsAt,function(){
    // host cria estado e inicia
    if(currentMatch!==matchId||!PGHStore.isHost)return;
    hostState=g.createInitialState(connected.map(function(p){return p.id;}),{mod:dMod,param:dParam,short:!!(PGHStore.dailyMix&&PGHStore.dailyMix.active)});
    hostState._gameId=g.id; hostState._startedAt=Date.now();
    if(g.hostStart)g.hostStart(hostState,hostHelpers(g));
    PGHStore.gamePhase="playing";
    Net.hostBroadcastRaw(Net.mkMsg("GAME_STARTED",{gameId:g.id,matchId}));
    broadcastState();
    if(g.hostTick){ stopHostTick(); hostTickTimer=setInterval(function(){ try{ if(hostState&&currentMatch===matchId)g.hostTick(hostState,hostHelpers(g)); }catch(e){console.error(e);} },100); }
    Rooms.broadcastFullSync();
  });
}
function hostHelpers(g){
  const expected=hostState,match=currentMatch;
  const valid=()=>hostState===expected&&expected&&currentMatch===match&&PGHStore.gamePhase==='playing';
  return {
    unicast:function(playerId,payload){
      if(!valid())return;
      const full=Object.assign({gameId:g.id,matchId:match},payload);
      if(playerId===PGHStore.playerId){ // host jogando: entrega local direta
        setTimeout(function(){ try{ if(valid()&&g.onActionResult)g.onActionResult(full); }catch(e){console.error(e);} },0);
        return;
      }
      Net.sendTo(playerId,{type:"GAME_ACTION_RESULT",payload:full});
    },
    broadcastState:function(){ if(valid())broadcastState(); },
    finish:function(standings,extra){ if(valid())finishGame(g,standings,extra); },
    addScore:function(playerId,pts){ const p=PGHHelpers.getPlayer(playerId); if(p)p.sessionScore=(p.sessionScore||0)+pts; },
    setScore:function(playerId,pts){ const p=PGHHelpers.getPlayer(playerId); if(p)p.sessionScore=pts; }
  };
}
function broadcastState(){
  if(!PGHStore.isHost||!hostState)return;
  const g=games[hostState._gameId]; if(!g)return;
  current=hostState._gameId;
  const pub=g.getPublicState(hostState);
  Net.hostBroadcastRaw(Net.mkMsg("GAME_STATE",{gameId:g.id,matchId:currentMatch,state:pub}));
  // host também renderiza como client
  publicState=pub;
  renderCurrent();
  broadcastScores();
}
function broadcastScores(){
  if(!PGHStore.isHost)return;
  Net.hostBroadcastRaw(Net.mkMsg("SCORE_UPDATE",{scores:PGHStore.players.map(function(p){return{id:p.id,sessionScore:p.sessionScore||0};})}));
  renderGameScores();
}
function finishGame(g,standings,extra){
  stopHostTick();
  // standings: [{playerId, points}] points = session points earned this game
  const dMult=(window.Daily?Daily.scoreMult():1);
  if(dMult>1)standings.forEach(function(s){ s.points=(s.points||0)*dMult; });
  standings.forEach(function(s){ const p=PGHHelpers.getPlayer(s.playerId); if(p)p.sessionScore=(p.sessionScore||0)+(s.points||0); });
  PGHStore.gamePhase="ended";
  Net.hostBroadcastRaw(Net.mkMsg("GAME_ENDED",{gameId:g.id,matchId:currentMatch,standings:standings,extra:extra||{}}));
  broadcastScores(); Rooms.broadcastFullSync();
  // host renderiza fim local
  onGameEnded({gameId:g.id,matchId:currentMatch,standings:standings,extra:extra||{}});
}
function quitToLobby(){
  if(window.Daily&&PGHStore.isHost)Daily.hostQuitToLobby();
  if(window.Daily)Daily.clearEventVisual();
  if(PGHStore.isHost){
    stopHostTick(); hostState=null;
    PGHStore.gamePhase="lobby";
    Net.hostBroadcastRaw(Net.mkMsg("GAME_STATE",{gameId:null,state:{phase:"lobby"}}));
    Rooms.broadcastFullSync();
  }
  cleanup();
  UI.showScreen("lobby"); Rooms.renderLobby();
}
function cleanup(){
  stopHostTick(); stopIntro(); stopUiTimer();
  if(window.Daily)Daily.clearEventVisual();
  current=null; hostState=null; publicState=null;currentMatch=null;
  Object.keys(games).forEach(function(k){ try{if(games[k].cleanup)games[k].cleanup();}catch(e){} });
  const root=document.getElementById("game-root"); if(root)root.innerHTML="";
}
function stopHostTick(){ if(hostTickTimer){clearInterval(hostTickTimer);hostTickTimer=null;} }
function stopIntro(){ if(introTimer){clearInterval(introTimer);introTimer=null;} const el=document.getElementById("game-intro"); if(el)el.classList.add("hidden"); }
function stopUiTimer(){ if(uiTimer){clearInterval(uiTimer);uiTimer=null;} }

function showIntro(g,endsAt,done){
  UI.showScreen("game");
  document.getElementById("game-name-tag").textContent=(window.Daily?Daily.nameTag(g):g.name.toUpperCase());
  document.getElementById("game-room-code").textContent=PGHStore.roomCode||"";
  const intro=document.getElementById("game-intro");
  document.getElementById("game-intro-name").textContent=g.name.toUpperCase();
  intro.classList.remove("hidden");
  document.getElementById("game-layout").style.visibility="hidden";
  AudioManager.play("roundStart");
  if(introTimer)clearInterval(introTimer);
  let lastShown=99, warned=false;
  const nameEl=document.getElementById("game-intro-name");
  introTimer=setInterval(function(){
    const rem=Math.max(0,endsAt-PGHHelpers.hostTime());
    const n=Math.ceil(rem/1000);
    const c=document.getElementById("game-intro-count");
    if(g.introWarn&&rem>2600){
      if(nameEl){nameEl.textContent=g.introWarn;nameEl.classList.add("intro-warn");}
      c.textContent="💥";
      if(!warned){warned=true;AudioManager.play("wrong");AudioManager.play("reveal");}
      return;
    }
    if(nameEl&&warned){nameEl.textContent=g.name.toUpperCase();nameEl.classList.remove("intro-warn");}
    if(rem<=500){ c.textContent="GO!"; }
    else if(n!==lastShown){ lastShown=n; c.textContent=String(Math.min(3,Math.max(1,n-1))); AudioManager.play("countdown"); }
    if(rem<=0){ clearInterval(introTimer); introTimer=null;
      intro.classList.add("hidden"); document.getElementById("game-layout").style.visibility="visible";
      AudioManager.play("go"); if(done)done();
    }
  },200);
}
/* client intro (sem done de host) */
function showIntroClient(g,endsAt){
  UI.showScreen("game");
  document.getElementById("game-name-tag").textContent=(window.Daily?Daily.nameTag(g):g.name.toUpperCase());
  document.getElementById("game-room-code").textContent=PGHStore.roomCode||"";
  const intro=document.getElementById("game-intro");
  document.getElementById("game-intro-name").textContent=g.name.toUpperCase();
  intro.classList.remove("hidden");
  document.getElementById("game-layout").style.visibility="hidden";
  if(introTimer)clearInterval(introTimer);
  let lastShown=99, warned=false;
  const nameEl=document.getElementById("game-intro-name");
  introTimer=setInterval(function(){
    const rem=Math.max(0,endsAt-PGHHelpers.hostTime());
    const c=document.getElementById("game-intro-count");
    if(g.introWarn&&rem>2600){
      if(nameEl){nameEl.textContent=g.introWarn;nameEl.classList.add("intro-warn");}
      c.textContent="💥";
      if(!warned){warned=true;AudioManager.play("wrong");AudioManager.play("reveal");}
      return;
    }
    if(nameEl&&warned){nameEl.textContent=g.name.toUpperCase();nameEl.classList.remove("intro-warn");}
    if(rem<=500){ c.textContent="GO!"; }
    else{ const n=Math.ceil(rem/1000); if(n!==lastShown){lastShown=n;c.textContent=String(Math.min(3,Math.max(1,n-1)));AudioManager.play("countdown");} }
    if(rem<=0){ clearInterval(introTimer); introTimer=null;
      intro.classList.add("hidden"); document.getElementById("game-layout").style.visibility="visible";
      AudioManager.play("go");
    }
  },200);
}
function renderCurrent(){
  if(!current||!publicState)return;
  const g=games[current]; if(!g)return;
  const badge=document.getElementById("game-phase-badge");
  if(badge)badge.textContent=(publicState.phase||"PLAYING").toUpperCase();
  try{ g.render(publicState); }catch(e){ console.error("[render]",current,e); }
  renderGameScores();
  // ui timer para countdowns (500ms)
  if(!uiTimer){ uiTimer=setInterval(function(){ try{ if(current&&publicState&&games[current]&&games[current].tickUI)games[current].tickUI(publicState); }catch(e){} },250); }
}
function renderGameScores(){
  const ol=document.getElementById("game-score-list"); if(!ol)return;
  const prevTops={};
  Array.prototype.forEach.call(ol.children,function(li){ const id=li.getAttribute&&li.getAttribute("data-pid"); if(id&&li.getBoundingClientRect)prevTops[id]=li.getBoundingClientRect().top; });
  ol.innerHTML="";
  PGHStore.players.slice().sort(function(a,b){return(b.sessionScore||0)-(a.sessionScore||0);}).forEach(function(p,i){
    const li=document.createElement("li"); li.setAttribute("data-pid",p.id);
    const r=document.createElement("span");r.className="rank";r.textContent=String(i+1).padStart(2,"0");
    const av=document.createElement("span");av.className="hs-ava";
    const img=document.createElement("img");img.alt="";img.src=window.portraitSrc?portraitSrc(p):(p.avatar||ProfileManager.avatarUrl("pixel-art",p.id));
    av.appendChild(img);
    const nm=document.createElement("span");nm.textContent=p.nickname;
    const dots=document.createElement("span");dots.className="dots";
    const pts=document.createElement("span");pts.className="pts";pts.textContent=(p.sessionScore||0);
    li.appendChild(r);li.appendChild(av);li.appendChild(nm);li.appendChild(dots);li.appendChild(pts);
    ol.appendChild(li);
  });
  if(PGHStore.settings&&PGHStore.settings.reducedEffects)return;
  Array.prototype.forEach.call(ol.children,function(li){
    const id=li.getAttribute("data-pid"); const prev=prevTops[id];
    if(prev===undefined||!li.getBoundingClientRect)return;
    const dy=prev-li.getBoundingClientRect().top;
    if(Math.abs(dy)>2){
      li.style.transition="none"; li.style.transform="translateY("+dy+"px)";
      requestAnimationFrame(function(){ li.style.transition="transform .45s ease"; li.style.transform=""; });
    }
  });
}
/* ---- rede ---- */
function netHandler(msg){
  const pl=msg.payload||{};
  if(['GAME_STARTED','GAME_STATE','GAME_ENDED','GAME_ACTION_RESULT'].includes(msg.type)&&pl.gameId!==null&&pl.matchId!==currentMatch)return;
  switch(msg.type){
    case "GAME_SELECTED":
      PGHStore.selectedGame=pl.gameId; Rooms.renderLobby(); break;
    case "GAME_STARTING": {
      const g=games[pl.gameId]; if(!g)break;
      Object.keys(games).forEach(function(k){ try{ if(games[k].cleanup)games[k].cleanup(); }catch(e){} });
      stopUiTimer();currentMatch=pl.matchId;current=pl.gameId; PGHStore.selectedGame=pl.gameId; PGHStore.gamePhase="intro";
      PGHStore.currentMod=pl.mod||null; PGHStore.currentParam=pl.param||null; PGHStore.currentEvent=pl.event||null;
      if(window.Daily){Daily.newGameNonce();Daily.applyEventVisual(pl.event||null);}
      if(PGHStore.isHost){ /* host já mostra via startGame */ }
      else showIntroClient(g,pl.endsAt||Date.now()+3000);
      break;
    }
    case "GAME_STARTED": {
      const g=games[pl.gameId]; if(!g)break;
      current=pl.gameId; PGHStore.gamePhase="playing";
      if(!PGHStore.isHost){ UI.showScreen("game"); document.getElementById("game-name-tag").textContent=(window.Daily?Daily.nameTag(g):g.name.toUpperCase()); document.getElementById("game-room-code").textContent=PGHStore.roomCode||""; }
      Chat.sys("▶ "+g.name+" começou!");
      break;
    }
    case "GAME_STATE":
      if(pl.gameId==null){ // voltou pro lobby
        cleanup(); UI.showScreen("lobby"); Rooms.renderLobby(); break;
      }
      if(PGHStore.gamePhase==='ended')break;
      current=pl.gameId; publicState=pl.state;
      if(PGHStore.screen!=="game"&&PGHStore.gamePhase!=="intro"){ UI.showScreen("game"); }
      renderCurrent();
      break;
    case "GAME_ACTION":
      if(PGHStore.isHost&&hostState){
        const g=games[hostState._gameId];
        if(g&&g.hostAction&&pl.gameId===g.id&&pl.matchId===currentMatch&&PGHStore.gamePhase==='playing'){
          try{ g.hostAction(hostState,msg.senderId,pl.action,pl.value,hostHelpers(g)); }catch(e){console.error(e);}
        }
      }
      break;
    case "GAME_ACTION_RESULT": {
      if(pl.matchId!==currentMatch||PGHStore.gamePhase==='ended')break;
      const g=games[pl.gameId]; if(g&&g.onActionResult){ try{g.onActionResult(pl);}catch(e){console.error(e);} }
      break;
    }
    case "GAME_ENDED": onGameEnded(pl); break;
    case "SCORE_UPDATE":
      (pl.scores||[]).forEach(function(s){ const p=PGHHelpers.getPlayer(s.id); if(p)p.sessionScore=s.points||s.sessionScore||0; });
      renderGameScores(); break;
  }
  UI.updateDebug();
}
function onGameEnded(pl){
  const g=games[pl.gameId]; if(!g)return;
  if(!pl.matchId||pl.matchId!==currentMatch||rewardedMatches.has(pl.matchId))return;
  rewardedMatches.add(pl.matchId);if(rewardedMatches.size>100)rewardedMatches.delete(rewardedMatches.values().next().value);
  PGHStore.gamePhase="ended";
  stopHostTick(); stopUiTimer();
  if(PGHStore.isHost){hostState=null;}
  // atualiza carreira local
  const standings=(pl.standings||[]).slice().sort(function(a,b){return(b.points||0)-(a.points||0);});
  let myPlace=standings.findIndex(function(s){return s.playerId===PGHStore.playerId;})+1;
  if(myPlace<1)myPlace=standings.length||1;
  const myPts=(standings.find(function(s){return s.playerId===PGHStore.playerId;})||{}).points||0;
  const res=ProfileManager.recordGameResult(pl.gameId,myPlace,standings.length,myPts);
  try{ if(window.Daily)Daily.onGameEnd({game:pl.gameId,placement:myPlace,points:myPts,mod:PGHStore.currentMod,param:PGHStore.currentParam,event:PGHStore.currentEvent,mix:(PGHStore.dailyMix&&PGHStore.dailyMix.active)}); }catch(e){console.error(e);}
  if(typeof renderHomeProfile==="function")renderHomeProfile();
  // render resultado via jogo (com fallback genérico)
  UI.showScreen("game");
  document.getElementById("game-name-tag").textContent=g.name.toUpperCase()+" · RESULT";
  const badge=document.getElementById("game-phase-badge"); if(badge)badge.textContent="RESULT";
  try{
    if(g.renderResult)g.renderResult(pl,myPlace,res);
    else renderGenericResult(g,pl,myPlace,res);
  }catch(e){ console.error(e); renderGenericResult(g,pl,myPlace,res); }
  try{ if(window.Daily){Daily.decorateResult();Daily.clearEventVisual();} }catch(e){}
  renderGameScores();
  const winner=standings[0]&&PGHHelpers.getPlayer(standings[0].playerId);
  Chat.sys("🏁 "+g.name+" terminou! Vencedor: "+(winner?winner.nickname:"—"));
  if(myPlace===1){ AudioManager.play("victory"); UI.confetti(140); }
  else AudioManager.play("defeat");
}
function renderGenericResult(g,pl,myPlace,res){
  const root=document.getElementById("game-root"); if(!root)return;
  const standings=(pl.standings||[]).slice().sort(function(a,b){return(b.points||0)-(a.points||0);});
  let html='<div class="result-hero"><div class="result-crown">'+(myPlace===1?"👑":"🎮")+'</div>';
  html+='<div class="g-title">'+g.name.toUpperCase()+' · FIM DE JOGO</div>';
  const w=standings[0]&&PGHHelpers.getPlayer(standings[0].playerId);
  html+='<div class="result-winner">'+escapeHtml(w?w.nickname:"—")+' VENCEU!</div>';
  html+='<div class="g-sub">Você ficou em '+myPlace+'º · +'+myPts(standings)+' session pts · +'+res.xp+' XP · +'+res.tokens+' 🪙</div></div>';
  html+='<div class="result-table"><div class="g-leader">';
  standings.forEach(function(s,i){
    const p=PGHHelpers.getPlayer(s.playerId);
    html+='<div class="g-leader-row"><span class="font-mono2">'+String(i+1).padStart(2,"0")+'</span><span class="nm">'+escapeHtml(p?p.nickname:"???")+'</span><span class="vl">'+(s.points||0)+' PTS</span></div>';
  });
  html+="</div></div>";
    html+=(window.Daily?Daily.resultButtonsHTML():'<div class="g-row" style="margin-top:16px"><button class="btn-arcade primary" id="btn-again">↻ JOGAR DE NOVO</button><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>');
  root.innerHTML=html;
  if(window.Daily)Daily.bindResultButtons();
  else{ const a=document.getElementById("btn-again"); if(a)a.addEventListener("click",function(){GameManager.startGame();}); document.getElementById("btn-tolobby").addEventListener("click",function(){GameManager.quitToLobby();}); }
  function myPts(st){ const f=st.find(function(s){return s.playerId===PGHStore.playerId;}); return f?f.points||0:0; }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
}
function sendAction(gameId,action,value){
  if(PGHStore.isHost&&hostState){
    const g=games[gameId];
    if(g&&g.id===hostState._gameId&&g.hostAction&&PGHStore.gamePhase==='playing'){ try{g.hostAction(hostState,PGHStore.playerId,action,value,hostHelpers(g));}catch(e){console.error(e);} }
  }else{
    Net.sendToHost({type:"GAME_ACTION",payload:{gameId:gameId,matchId:currentMatch,action:action,value:value}});
  }
}
window.GameManager={register:register,list:list,get:get,selectGame:selectGame,startGame:startGame,quitToLobby:quitToLobby,netHandler:netHandler,sendAction:sendAction,renderGameScores:renderGameScores,cleanup:cleanup,
  get current(){return current;}, get publicState(){return publicState;}};
/* Hook de debug/teste: expõe estado da MESMA aba (host vê o que já é dele; clients têm hostState null).
   Não trafega nada pela rede — seguro. Usado pelo ?debug=1 e pela suíte QA. */
window.PGHDebug={
  hostState:function(){ return hostState; },
  publicState:function(){ return publicState; },
  fastForward:function(){ if(hostState&&hostState.roundEndsAt)hostState.roundEndsAt=Date.now()-1; if(hostState&&hostState.endsAt)hostState.endsAt=Date.now()-1; return !!hostState; }
};
})();
