/* PGH Rooms — criar/entrar/sair, ready, sync, lobby render */
(function(){
"use strict";
const CODE_CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
let lastReady={};
function genCode(){
  let s=""; for(let i=0;i<5;i++)s+=CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)];
  return s;
}
function myInfo(){
  const p=PGHStore.profile;
  return {id:PGHStore.playerId,nickname:p.nickname,avatar:p.avatar,avatarStyle:p.avatarStyle,avatarSeed:p.avatarSeed,character:p.character||null,frame:p.avatarFrame,level:p.level||1,title:ProfileManager.titleForLevel(p.level||1)};
}
function setConnStatus(kind,text){
  const el=document.getElementById("connection-status"); if(!el)return;
  el.className="conn-pill "+(kind==="ok"?"ok":kind==="bad"?"bad":"");
  el.innerHTML='<span class="pulse"></span> '+text;
}
function updatePingUI(){
  const p=document.getElementById("ping-display"), g=document.getElementById("game-ping");
  const t=PGHStore.pingMs==null?"— ms":PGHStore.pingMs+" ms";
  if(p)p.textContent=t; if(g)g.textContent=t;
  const foot=document.getElementById("foot-peer"); if(foot)foot.textContent=PGHStore.peerId||"—";
}
function persistSnapshot(){
  PGHStore.lastSnapshot={roomCode:PGHStore.roomCode,hostId:(PGHHelpers.hostPlayer()||{}).id||null,players:JSON.parse(JSON.stringify(PGHStore.players)),selectedGame:PGHStore.selectedGame,at:Date.now()};
}
/* ---- host: join request ---- */
function onJoinRequest(msg,conn){
  const pl=(msg.payload&&msg.payload.player)||{};
  const isRe=!!(msg.payload&&msg.payload.reconnect);
  if(!pl.nickname){ try{conn.send(Net.mkMsg("JOIN_REJECTED",{reason:"NO_NICK"}));}catch(e){} return; }
  let existing=PGHHelpers.getPlayer(pl.id||msg.senderId);
    if(existing){
      if(existing.connected&&Net.conns[existing.id]!==conn){try{conn.send(Net.mkMsg('JOIN_REJECTED',{reason:'ALREADY_CONNECTED'}));}catch(e){}return;}
    // reconexão: reutiliza slot, sem duplicar
    existing.connected=true; existing.nickname=String(pl.nickname).slice(0,14);
    existing.avatar=pl.avatar||existing.avatar; existing.frame=pl.frame||existing.frame;
    if(pl.character!==undefined)existing.character=pl.character||null;
    if(pl.level)existing.level=pl.level; if(pl.title)existing.title=pl.title;
    Net.conns[existing.id]=conn;
    try{conn.send(Net.mkMsg("JOIN_ACCEPTED",{players:PGHStore.players,selectedGame:PGHStore.selectedGame,reconnected:true}));}catch(e){}
    Chat.sys("🔌 "+existing.nickname+" reconectou");
      if(PGHStore.gamePhase==='playing'||PGHStore.gamePhase==='intro'){GameManager.quitToLobby();Chat.sys('Reconexão: rodada cancelada; sala pronta para jogar novamente.');}
      broadcastFullSync(); return;
  }
  if(PGHStore.players.length>=12){ try{conn.send(Net.mkMsg("JOIN_REJECTED",{reason:"ROOM_FULL"}));}catch(e){} return; }
  if(PGHStore.gamePhase!=="lobby"){ try{conn.send(Net.mkMsg("JOIN_REJECTED",{reason:"GAME_RUNNING"}));}catch(e){} return; }
  const maxOrder=PGHStore.players.reduce(function(m,p){return Math.max(m,p.joinOrder||0);},0);
  const np={id:pl.id||msg.senderId,nickname:String(pl.nickname||"???").slice(0,14),avatar:pl.avatar||ProfileManager.avatarUrl("pixel-art",pl.id||"x"),avatarStyle:pl.avatarStyle||"pixel-art",avatarSeed:pl.avatarSeed||"x",character:pl.character||null,frame:pl.frame||"neon",level:pl.level||1,title:pl.title||"ROOKIE",ready:false,connected:true,joinOrder:maxOrder+1,sessionScore:0,isHost:false};
  PGHStore.players.push(np);
  Net.conns[np.id]=conn;
  try{conn.send(Net.mkMsg("JOIN_ACCEPTED",{players:PGHStore.players,selectedGame:PGHStore.selectedGame}));}catch(e){}
  Chat.sys("🎮 "+np.nickname+" entrou na sala");
  AudioManager.play("join");
  broadcastFullSync();
}
function onReady(msg){
  const p=PGHHelpers.getPlayer(msg.senderId); if(!p)return;
  p.ready=!!(msg.payload&&msg.payload.ready);
  broadcastFullSync();
}
function broadcastFullSync(){
  if(!PGHStore.isHost)return;
  persistSnapshot();
  const full=Net.mkMsg("FULL_STATE_SYNC",{players:PGHStore.players,selectedGame:PGHStore.selectedGame,gamePhase:PGHStore.gamePhase,daily:PGHStore.daily||null,dailyMix:PGHStore.dailyMix||null,dailyMode:!!PGHStore.dailyMode});
  Net.hostBroadcastRaw(full);
  PGHBus.emit("room",{});
}
function onFullSync(payload){
  if(!payload)return;
  if(payload.players)PGHStore.players=payload.players;
  if(payload.selectedGame!==undefined)PGHStore.selectedGame=payload.selectedGame;
  if(payload.gamePhase)PGHStore.gamePhase=payload.gamePhase;
  if(payload.daily!==undefined)PGHStore.daily=payload.daily||null;
  if(payload.dailyMix!==undefined)PGHStore.dailyMix=payload.dailyMix||null;
  if(payload.dailyMode!==undefined)PGHStore.dailyMode=!!payload.dailyMode;
  persistSnapshot();
  PGHBus.emit("room",{});
}
/* ---- ações ---- */
function createRoom(){
  PGHStore.playerId=PGHHelpers.uid("pl_");
  let code=genCode();
  UI.showScreen("lobby"); setConnStatus("","CRIANDO...");
  return Net.createHost(code,myInfo()).then(function(){
    code=PGHStore.roomCode; // pode ter mudado se houve colisão de ID
    PGHStore.players[0].sessionScore=0;
    if(window.Daily)Daily.hostInit();
    Chat.clear(); Chat.sys("🕹️ Sala "+code+" criada! Compartilhe o código.");
    renderLobby(); setConnStatus("ok","HOSTING");
    document.getElementById("lobby-room-code").textContent=code;
    document.getElementById("host-badge").classList.add("show");
    document.getElementById("btn-start-game").classList.remove("hidden");
    document.getElementById("btn-ready").classList.add("hidden");
    AudioManager.play("coin");
    return code;
  }).catch(function(e){
    console.error(e); UI.showScreen("home");
    const m=String(e&&e.message||"");
    UI.toast(m.indexOf("P2P_OFFLINE")>=0?"📡 SEM CONEXÃO P2P — multiplayer indisponível offline":"Falha ao criar sala. Tente de novo.","error");
    throw e;
  });
}
function joinRoom(code){
  code=String(code||"").trim().toUpperCase().replace(/[^A-Z2-9]/g,"");
  if(code.length!==5){ UI.toast("Código inválido — 5 caracteres","warn"); return Promise.reject(new Error("BAD_CODE")); }
  PGHStore.playerId=PGHHelpers.uid("pl_");
  UI.showScreen("lobby"); setConnStatus("","CONECTANDO...");
  return Net.joinRoom(code,myInfo(),false).then(function(){
    Chat.clear(); Chat.sys("🕹️ Você entrou na sala "+code);
    renderLobby(); setConnStatus("ok","CONNECTED");
    document.getElementById("lobby-room-code").textContent=code;
    document.getElementById("host-badge").classList.remove("show");
    document.getElementById("btn-start-game").classList.add("hidden");
    document.getElementById("btn-ready").classList.remove("hidden");
    AudioManager.play("join");
    return code;
  }).catch(function(e){
    console.error(e); UI.showScreen("home");
    const m=String(e&&e.message||"");
    UI.toast(m.indexOf("ROOM_NOT_FOUND")>=0?"Sala não encontrada. Confira o código.":m.indexOf("ROOM_FULL")>=0?"Sala cheia!":m.indexOf("GAME_RUNNING")>=0?"Jogo em andamento — tente em instantes.":"Falha ao entrar. Tente de novo.","error");
    throw e;
  });
}
function leaveRoom(){
  if(PGHStore.isHost){
    try{ Net.hostBroadcastRaw(Net.mkMsg("ROOM_CLOSED",{})); }catch(e){}
    setTimeout(doLeave,350); // dá tempo do ROOM_CLOSED chegar
  }else{
    try{ Net.sendToHost({type:"PLAYER_LEFT",payload:{}}); }catch(e){}
    setTimeout(doLeave,150);
  }
}
function doLeave(){
  Net.disconnect();
  PGHStorage.clearSession();
  PGHStore.roomCode=null; PGHStore.players=[]; PGHStore.selectedGame=null; PGHStore.gamePhase="lobby"; PGHStore.isHost=false; PGHStore.reconnecting=false;
  if(window.Daily)Daily.hostInit();
  GameManager.cleanup();
  UI.showScreen("home");
  if(typeof renderHomeProfile==="function")renderHomeProfile();
}
function roomClosed(msg){
  Net.disconnect(); PGHStorage.clearSession();
  PGHStore.roomCode=null; PGHStore.players=[]; PGHStore.selectedGame=null; PGHStore.gamePhase="lobby"; PGHStore.reconnecting=false;
  if(window.Daily)Daily.hostInit();
  GameManager.cleanup(); UI.showScreen("home");
  UI.toast(msg||"ROOM CLOSED","error",3500);
  if(typeof renderHomeProfile==="function")renderHomeProfile();
}
function toggleReady(){
  const me=PGHHelpers.myPlayer();
  if(PGHStore.isHost)return;
  const v=!(me&&me.ready);
  Net.sendToHost({type:"PLAYER_READY",payload:{ready:v}});
  if(me)me.ready=v; renderLobby(); AudioManager.play("select");
}
function kickPlayer(id){
  if(!PGHStore.isHost)return;
  const c=Net.conns[id];
  try{ if(c&&c.open)c.send(Net.mkMsg("KICKED",{})); }catch(e){}
  setTimeout(function(){ try{if(c)c.close();}catch(e){} },400);
  PGHStore.players=PGHStore.players.filter(function(p){return p.id!==id;});
  delete Net.conns[id];
  broadcastFullSync();
}
/* ---- lobby render ---- */
function renderLobby(){
  const grid=document.getElementById("players-grid"); if(!grid)return;
  document.getElementById("players-count").textContent=PGHStore.players.length+"/12";
  grid.innerHTML="";
  const sorted=PGHStore.players.slice().sort(function(a,b){return(a.joinOrder||0)-(b.joinOrder||0);});
  sorted.forEach(function(p){
    const card=document.createElement("div");
    card.className="player-card"+(p.ready?" ready":"")+(p.isHost?" host":"")+(!p.connected?" disconnected":"");
    const ava=document.createElement("div"); ava.className="p-ava "+ProfileManager.frameClass(p.frame);
    const img=document.createElement("img"); img.alt=""; img.loading="lazy";
    img.src=window.portraitSrc?portraitSrc(p):(p.avatar||ProfileManager.avatarUrl("pixel-art",p.id));
    ava.appendChild(img);
    const nick=document.createElement("div"); nick.className="p-nick"; nick.textContent=(p.isHost?"👑 ":"")+p.nickname;
    const lvl=document.createElement("div"); lvl.className="p-lvl"; lvl.textContent="LV."+(p.level||1)+" · "+(p.title||"ROOKIE");
    const tags=document.createElement("div"); tags.className="p-tags";
    if(p.isHost){const t=document.createElement("span");t.className="ptag host";t.textContent="HOST";tags.appendChild(t);}
    if(p.id===PGHStore.playerId){const t=document.createElement("span");t.className="ptag you";t.textContent="YOU";tags.appendChild(t);}
    if(p.ready){const t=document.createElement("span");t.className="ptag ready";t.textContent="READY";tags.appendChild(t);}
    if(!p.connected){const t=document.createElement("span");t.className="ptag off";t.textContent="OFF";tags.appendChild(t);}
    const sc=document.createElement("div"); sc.className="p-score"; sc.textContent=(p.sessionScore||0)+" PTS";
    card.appendChild(ava); card.appendChild(nick); card.appendChild(lvl); card.appendChild(tags); card.appendChild(sc);
    if(PGHStore.isHost&&p.id!==PGHStore.playerId){
      const k=document.createElement("button"); k.className="p-kick"; k.textContent="×"; k.title="Remover";
      k.addEventListener("click",function(){kickPlayer(p.id);});
      card.appendChild(k);
    }
    grid.appendChild(card);
  });
  // som de PLAYER READY nas transições (máquina "ligando")
  sorted.forEach(function(p){
    const was=lastReady[p.id];
    if(p.ready&&was===false&&p.connected)AudioManager.play("ready");
    lastReady[p.id]=!!p.ready;
  });
  Object.keys(lastReady).forEach(function(id){ if(!PGHHelpers.getPlayer(id))delete lastReady[id]; });
  const rdy=document.getElementById("lobby-readystate");
  if(rdy){ const n=PGHStore.players.filter(function(p){return p.ready&&p.connected;}).length; rdy.textContent=n>0?("· "+n+"/"+PGHStore.players.length+" READY"):""; }
  // ready state hint
  const me=PGHHelpers.myPlayer();
  const rb=document.getElementById("btn-ready");
  if(rb&&me){ rb.classList.toggle("ready-on",!!me.ready); const sp=rb.querySelector("span"); if(sp)sp.textContent=me.ready?"PRONTO! ✓":"READY!"; }
  renderMachines(); renderHighscores();
  if(window.Daily)Daily.renderLobbyBits();
  UI.updateDebug();
}
function renderMachines(){
  const grid=document.getElementById("machines-grid"); if(!grid)return;
  grid.innerHTML="";
  GameManager.list().forEach(function(g){
    const d=document.createElement("div");
    d.className="machine"+(PGHStore.selectedGame===g.id?" selected":"");
    d.tabIndex=0;d.setAttribute('role','button');d.setAttribute('aria-label',g.name+' — '+g.players);
    d.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();d.click();}});
    d.setAttribute("data-game",g.id);
    d.innerHTML='<div class="cab-top">'+g.tag+'</div><div class="cab-screen">'+g.icon+'</div><div class="cab-info"><b>'+g.name+'</b><p>'+g.desc+'</p><span class="cab-players">'+g.players+'</span></div>';
    d.addEventListener("click",function(){
      AudioManager.play("select");
      if(!PGHStore.isHost){ UI.toast("Só o HOST escolhe a máquina","warn"); return; }
      GameManager.selectGame(g.id);
    });
    d.addEventListener("mouseenter",function(){AudioManager.play("hover");});
    grid.appendChild(d);
  });
  const hint=document.getElementById("selected-game-hint");
  if(hint){ const g=GameManager.get(PGHStore.selectedGame); hint.textContent=g?("· "+g.name.toUpperCase()+" SELECIONADO"):""; }
}
function renderHighscores(){
  const ol=document.getElementById("highscores-list"); if(!ol)return;
  const prevTops={};
  Array.prototype.forEach.call(ol.children,function(li){ const id=li.getAttribute&&li.getAttribute("data-pid"); if(id&&li.getBoundingClientRect)prevTops[id]=li.getBoundingClientRect().top; });
  ol.innerHTML="";
  const sorted=PGHStore.players.slice().sort(function(a,b){return(b.sessionScore||0)-(a.sessionScore||0);});
  if(sorted.length===0){ol.innerHTML='<li><span class="rank">--</span> aguardando players <span class="dots"></span></li>';return;}
  sorted.forEach(function(p,i){
    const li=document.createElement("li"); li.setAttribute("data-pid",p.id);
    const r=document.createElement("span"); r.className="rank"; r.textContent=String(i+1).padStart(2,"0");
    const av=document.createElement("span"); av.className="hs-ava";
    const img=document.createElement("img"); img.alt=""; img.src=window.portraitSrc?portraitSrc(p):(p.avatar||ProfileManager.avatarUrl("pixel-art",p.id));
    av.appendChild(img);
    const nm=document.createElement("span"); nm.textContent=p.nickname;
    const dots=document.createElement("span"); dots.className="dots";
    const pts=document.createElement("span"); pts.className="pts"; pts.textContent=(p.sessionScore||0)+" PTS";
    li.appendChild(r);li.appendChild(av);li.appendChild(nm);li.appendChild(dots);li.appendChild(pts);
    ol.appendChild(li);
  });
  // FLIP: anima jogadores trocando de posição
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
window.Rooms={genCode:genCode,createRoom:createRoom,joinRoom:joinRoom,leaveRoom:leaveRoom,roomClosed:roomClosed,toggleReady:toggleReady,kickPlayer:kickPlayer,onJoinRequest:onJoinRequest,onReady:onReady,broadcastFullSync:broadcastFullSync,onFullSync:onFullSync,renderLobby:renderLobby,renderHighscores:renderHighscores,setConnStatus:setConnStatus,updatePingUI:updatePingUI,persistSnapshot:persistSnapshot};
})();
