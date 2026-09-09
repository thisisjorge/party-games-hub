/* PGH App — boot, telas, bindings globais */
(function(){
"use strict";
const $=function(id){return document.getElementById(id);};
let avatarSeeds=[], curStyle="pixel-art", curSeed="", curFrame="neon", curChar=null, avatarMode="cast";
let pendingRoom=null;

/* ---------- BOOT ---------- */
function boot(){
  PGHStore.settings=PGHStorage.loadSettings();
  ProfileManager.load();
  if(window.Daily)Daily.init();
  document.body.classList.toggle("crt-on",!!PGHStore.settings.crt);
  document.body.classList.toggle("reduced-effects",!!PGHStore.settings.reducedEffects);
  UI.initParticles();
  bindGlobal();
  // debug?
  try{ if(new URLSearchParams(location.search).get("debug")==="1"){ $("debug-panel").classList.remove("hidden"); setInterval(UI.updateDebug,1000);} }catch(e){}
  // boot animation
  const bar=$("boot-progress"),st=$("boot-status");
  const steps=[["CARREGANDO CARTUCHOS...",20],["SINTETIZANDO SOM...",45],["CALIBRANDO CRT...",65],["CONECTANDO REDE P2P...",85],["PRONTO! PRESS START",100]];
  let i=0;
  AudioManager.unlock();
  function step(){
    if(i<steps.length){ st.textContent=steps[i][0]; bar.style.width=steps[i][1]+"%"; i++; setTimeout(step,260); }
    else setTimeout(enter,350);
  }
  step();
  UI.refreshIcons();
}
function enter(){
  try{ const q=(new URLSearchParams(location.search).get("room")||"").toUpperCase().replace(/[^A-Z2-9]/g,"").slice(0,5); if(q.length===5)pendingRoom=q; }catch(e){}
  if(ProfileManager.hasProfile()){ showHome(); if(!pendingRoom)maybeReconnect(); }
  else{ initProfileScreen(); UI.showScreen("profile"); }
}
/* ---------- PROFILE SCREEN ---------- */
let profileBound=false;
function initProfileScreen(){
  const p=PGHStore.profile;
  const editing=ProfileManager.hasProfile();
  curStyle=p.avatarStyle||"pixel-art"; curFrame=p.avatarFrame||"neon";
  const castList=(window.CharPortraits?CharPortraits.list():[]);
  if(editing){ curChar=p.character||null; avatarMode=p.character?"cast":"dice"; }
  else{ curChar=castList.length?castList[Math.floor(Math.random()*castList.length)].id:null; avatarMode="cast"; } // §10: inicial aleatório, sem protagonista
  $("profile-nickname").value=p.nickname||"";
  $("profile-panel-title").textContent=editing?"⌁ EDIT YOUR PLAYER":"⌁ CREATE YOUR PLAYER";
  $("btn-create-profile-label").textContent=editing?"SALVAR · VOLTAR":"CONFIRMAR · START";
  renderStyleTabs(); shuffleSeeds(editing?p.avatarSeed:null); renderFrames(); renderModeTabs(); renderCastGrid(); updatePreview();
  setTimeout(function(){ try{$("profile-nickname").focus();}catch(e){} },150);
  if(profileBound)return; profileBound=true; // listeners ligados uma única vez
  $("avatar-mode-tabs").addEventListener("click",function(e){
    const b=e.target.closest?e.target.closest("[data-amode]"):null; if(!b)return;
    avatarMode=b.getAttribute("data-amode"); AudioManager.play("move"); renderModeTabs(); updatePreview();
  });
  $("profile-nickname").addEventListener("input",updatePreview);
  $("profile-nickname").addEventListener("keydown",function(e){
    if(e.key==="Enter"&&!e.isComposing){e.preventDefault();$("btn-create-profile").click();}
  });
  $("btn-shuffle-avatars").addEventListener("click",function(){AudioManager.play("select");shuffleSeeds();});
  $("btn-create-profile").addEventListener("click",function(){
    const nick=$("profile-nickname").value.trim();
    if(nick.length<3){UI.toast("Nickname precisa de 3+ letras","warn");AudioManager.play("wrong");return;}
    if(!curSeed)curSeed=avatarSeeds[0];
    const wasNew=!ProfileManager.hasProfile();
    ProfileManager.create(nick,curStyle,curSeed,curFrame,avatarMode==="cast"?curChar:null); // preserva XP/tokens/stats
    AudioManager.play("coin"); UI.confetti(60);
    UI.toast(wasNew?("PLAYER CRIADO. BEM-VINDO, "+nick.toUpperCase()+"!"):"PERFIL ATUALIZADO. PROGRESSÃO MANTIDA ✓","success");
    showHome();
  });
  $("btn-settings-profile").addEventListener("click",function(){AudioManager.play("select");UI.openSettings();});
}
function renderModeTabs(){
  const tabs=$("avatar-mode-tabs"); if(!tabs)return;
  Array.prototype.forEach.call(tabs.querySelectorAll("[data-amode]"),function(b){
    b.classList.toggle("active",b.getAttribute("data-amode")===avatarMode);
  });
  $("cast-wrap").classList.toggle("hidden",avatarMode!=="cast");
  $("dice-wrap").classList.toggle("hidden",avatarMode!=="dice");
}
function renderCastGrid(){
  const grid=$("cast-grid"); if(!grid||!window.CharPortraits)return; grid.innerHTML="";
  CharPortraits.list().forEach(function(c,i){
    const b=document.createElement("button");
    b.className="cast-opt"+(c.id===curChar?" selected":""); b.type="button"; b.title=c.name;
    const img=document.createElement("img"); img.alt=c.name; img.loading="lazy";
    img.src=CharPortraits.dataURI(c.id,"NORMAL");
    const num=document.createElement("span"); num.className="num"; num.textContent=String(i+1).padStart(2,"0");
    b.appendChild(img); b.appendChild(num);
    b.addEventListener("click",function(){curChar=c.id;AudioManager.play("select");renderCastGrid();updatePreview();});
    grid.appendChild(b);
  });
}
function renderStyleTabs(){
  const tabs=$("avatar-style-tabs"); tabs.innerHTML="";
  ProfileManager.AVATAR_STYLES.forEach(function(s){
    const b=document.createElement("button");
    b.className="style-tab"+(s.id===curStyle?" active":""); b.textContent=s.label;
    b.addEventListener("click",function(){curStyle=s.id;AudioManager.play("move");renderStyleTabs();shuffleSeeds();});
    tabs.appendChild(b);
  });
}
function shuffleSeeds(keep){
  avatarSeeds=[]; const base=Math.random().toString(36).slice(2,7);
  if(keep)avatarSeeds.push(keep); // edição: avatar atual continua selecionável
  while(avatarSeeds.length<12){ const s=base+"-"+curStyle+"-"+avatarSeeds.length+"x"+Math.floor(Math.random()*9999); if(avatarSeeds.indexOf(s)<0)avatarSeeds.push(s); }
  curSeed=avatarSeeds[0]; renderAvatarGrid(); updatePreview();
}
function renderAvatarGrid(){
  const grid=$("avatar-grid"); grid.innerHTML="";
  avatarSeeds.forEach(function(seed){
    const d=document.createElement("button");
    d.className="avatar-opt"+(seed===curSeed?" selected":""); d.type="button";
    const img=document.createElement("img"); img.alt="avatar"; img.loading="lazy";
    img.src=ProfileManager.avatarUrl(curStyle,seed);
    d.appendChild(img);
    d.addEventListener("click",function(){curSeed=seed;AudioManager.play("select");renderAvatarGrid();updatePreview();});
    grid.appendChild(d);
  });
}
function renderFrames(){
  const grid=$("frame-grid"); grid.innerHTML="";
  const owned=(PGHStore.profile.cosmetics&&PGHStore.profile.cosmetics.frames)||["neon"];
  ProfileManager.FRAMES.forEach(function(f){
    const has=owned.indexOf(f.id)>=0;
    const b=document.createElement("button");
    b.className="frame-opt "+f.cls+(f.id===curFrame?" selected":"")+(!has?" locked":""); b.type="button"; b.title=f.name+(has?"":" — "+f.price+" 🪙");
    b.textContent=f.icon;
    if(!has){const l=document.createElement("span");l.className="lock";l.textContent=f.price+"🪙";b.appendChild(l);}
    b.addEventListener("click",function(){
      if(!has){openFrameUnlock(f);return;}
      curFrame=f.id;AudioManager.play("select");renderFrames();updatePreview();
    });
    grid.appendChild(b);
  });
}
function updatePreview(){
  const p=PGHStore.profile||{};
  const nick=$("profile-nickname").value.trim()||p.nickname||"JOGADOR";
  $("preview-nickname").textContent=nick.toUpperCase().slice(0,14);
  $("preview-title").textContent="★ "+ProfileManager.titleForLevel(p.level||1)+" ★";
  $("preview-level").textContent="LV. "+(p.level||1);
  const need=ProfileManager.xpForLevel(p.level||1);
  $("preview-xp-fill").style.width=Math.min(100,((p.totalXP||0)/need*100))+"%";
  $("preview-xp-text").textContent=(p.totalXP||0)+" / "+need+" XP";
  $("pv-wins").textContent=p.totalWins||0;
  $("pv-streak").textContent=p.bestStreak||0;
  $("pv-tokens").textContent=(p.tokens==null?100:p.tokens);
  const diceUrl=ProfileManager.avatarUrl(curStyle,curSeed||"preview");
  $("avatar-preview").src=window.portraitSrc?portraitSrc({character:avatarMode==="cast"?curChar:null,avatar:diceUrl}):diceUrl;
  $("avatar-preview-wrap").className="avatar-preview "+ProfileManager.frameClass(curFrame);
  const ch=(window.CharPortraits&&avatarMode==="cast")?CharPortraits.get(curChar):null;
  if($("cast-name-txt"))$("cast-name-txt").textContent=ch?("★ "+ch.name+" ★"):"—";
  if($("cast-desc-txt"))$("cast-desc-txt").textContent=ch?ch.desc:"";
}
function openFrameUnlock(f){
  AudioManager.play("select");
  const p=PGHStore.profile;
  const m=UI.openModal(
    "<h3>🔓 UNLOCK FRAME?</h3>"+
    "<div class='unlock-box'><div class='unlock-icon'>"+f.icon+"</div>"+
    "<div class='unlock-name'>"+f.name+" FRAME</div>"+
    "<div class='unlock-price'>🪙 "+(window.Daily?Daily.spotPrice(f):f.price)+" TOKENS"+((window.Daily&&Daily.spotPrice(f)!==f.price)?" <span style='color:var(--green)'>★ −25% HOJE</span>":"")+"</div>"+
    "<div class='unlock-balance'>seu saldo: 🪙 <span id='unlock-bal'>"+p.tokens+"</span></div>"+
    "<div class='unlock-error' id='unlock-err'></div></div>"+
    "<div style='display:flex;gap:8px;margin-top:12px'><button class='btn-arcade ghost' id='unlock-cancel' style='flex:1'>CANCEL</button><button class='btn-arcade primary' id='unlock-go' style='flex:1'>UNLOCK</button></div>");
  m.querySelector("#unlock-cancel").addEventListener("click",function(){AudioManager.play("back");UI.closeModal();});
  m.querySelector("#unlock-go").addEventListener("click",function(){
    if(p.tokens<(window.Daily?Daily.spotPrice(f):f.price)){
      const e=m.querySelector("#unlock-err");
      e.textContent="⚠ TOKENS INSUFICIENTES! Jogue partidas para ganhar 🪙";
      m.classList.remove("shake"); void m.offsetWidth; m.classList.add("shake");
      AudioManager.play("wrong"); return;
    }
    ProfileManager.buyFrame(f.id);
    curFrame=f.id; UI.closeModal(); UI.confetti(40);
    renderFrames(); updatePreview();
  });
}
/* ---------- HOME ---------- */
function showHome(){
  renderHomeProfile(); renderPreviewMachines(); UI.showScreen("home"); // Daily renderiza via onLobbyHome (1x)
  if(pendingRoom){ const c=pendingRoom; pendingRoom=null; try{history.replaceState(null,"",location.pathname);}catch(e){}
    UI.toast("Convite recebido! Entrando na sala "+c+"...","success");
    setTimeout(function(){ Rooms.joinRoom(c).catch(function(){}); },500); }
}
window.renderHomeProfile=function(){
  const p=PGHStore.profile; if(!p)return;
  $("home-avatar").src=window.portraitSrc?portraitSrc(p):(p.avatar||ProfileManager.avatarUrl(p.avatarStyle,p.avatarSeed));
  $("home-avatar-wrap").className="mini-avatar "+ProfileManager.frameClass(p.avatarFrame);
  $("home-nickname").textContent=(p.nickname||"???").toUpperCase();
  $("home-level").textContent="LV. "+p.level;
  const need=ProfileManager.xpForLevel(p.level);
  $("home-xp-fill").style.width=Math.min(100,(p.totalXP/need*100))+"%";
  $("home-xp-text").textContent=p.totalXP+" / "+need+" XP";
  $("st-wins").textContent=p.totalWins; $("st-streak").textContent=p.currentStreak||0;
  $("st-tokens").textContent=p.tokens; $("st-games").textContent=p.gamesPlayed;
};
function renderPreviewMachines(){
  const grid=$("games-preview-grid"); if(!grid)return; grid.innerHTML="";
  GameManager.list().forEach(function(g){
    const d=document.createElement("div");
    d.className="machine"; d.setAttribute("data-game",g.id);
    d.innerHTML='<div class="cab-top">'+g.tag+'</div><div class="cab-screen">'+g.icon+'</div><div class="cab-info"><b>'+g.name+'</b><p>'+g.desc+'</p><span class="cab-players">'+g.players+'</span></div><div class="cab-controls"><span class="arcade-btn red"></span><span class="arcade-btn yellow"></span><span class="arcade-btn green"></span></div>';
    d.addEventListener("click",function(){AudioManager.play("select");UI.toast("Crie ou entre numa sala pra jogar "+g.name+"!","warn");});
    grid.appendChild(d);
  });
}
function openRoomCreated(code){
  AudioManager.play("coin");
  const m=UI.openModal("<h3>🕹️ ROOM CREATED</h3><div class='room-created-code font-pixel'>"+code+"</div>"+
    "<p style='text-align:center;color:var(--muted);font-size:13px;margin:4px 0 0'>Mande o código ou o link pros amigos</p>"+
    "<div style='display:flex;gap:8px;margin-top:12px'><button class='btn-arcade secondary' id='rc-copy' style='flex:1'><span>COPY CODE</span></button><button class='btn-arcade ghost' id='rc-invite' style='flex:1'><span>COPY INVITE</span></button></div>"+
    "<button class='btn-arcade primary big w-full' id='rc-enter' style='margin-top:10px'><span>ENTER LOBBY →</span></button>");
  m.querySelector("#rc-copy").addEventListener("click",function(){ copyText(code,"Código "+code+" copiado! Mande pros amigos 🎮"); });
  m.querySelector("#rc-invite").addEventListener("click",function(){ copyText(inviteUrl(code),"Link de convite copiado! 🔗"); });
  m.querySelector("#rc-enter").addEventListener("click",function(){AudioManager.play("select");UI.closeModal();});
}
function inviteUrl(code){
  try{
    const base=(location.origin&&location.origin!=="null")?location.origin+location.pathname:location.href.split("?")[0];
    return base+"?room="+code;
  }catch(e){ return "?room="+code; }
}
function copyText(text,msg){
  function ok(){UI.toast(msg,"success");AudioManager.play("coin");}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(ok,function(){fallback();});
  else fallback();
  function fallback(){ const i=document.createElement("input");i.value=text;document.body.appendChild(i);i.select();try{document.execCommand("copy");ok();}catch(e){UI.toast(text,"warn");} try{document.body.removeChild(i);}catch(e){} }
}
function openJoinModal(prefill){
  AudioManager.play("select");
  const m=UI.openModal("<h3>🚪 ENTER ROOM CODE</h3>"+
    "<input id='join-modal-input' class='arcade-input code-input font-mono2 join-big' maxlength='5' placeholder='•••••' autocomplete='off' spellcheck='false'>"+
    "<div class='unlock-error' id='join-err'></div>"+
    "<div style='display:flex;gap:8px;margin-top:10px'><button class='btn-arcade ghost' id='join-cancel' style='flex:1'>CANCEL</button><button class='btn-arcade secondary' id='join-go' style='flex:1'>JOIN</button></div>");
  const inp=m.querySelector("#join-modal-input");
  inp.value=String(prefill||"").toUpperCase().replace(/[^A-Z2-9]/g,"").slice(0,5);
  inp.addEventListener("input",function(){ inp.value=inp.value.toUpperCase().replace(/[^A-Z2-9]/g,"").slice(0,5); });
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter"){e.preventDefault();doJoin();} });
  setTimeout(function(){ try{inp.focus();inp.select();}catch(e){} },120);
  m.querySelector("#join-cancel").addEventListener("click",function(){AudioManager.play("back");UI.closeModal();});
  m.querySelector("#join-go").addEventListener("click",doJoin);
  function doJoin(){
    const code=inp.value.trim();
    if(code.length!==5){
      m.querySelector("#join-err").textContent="⚠ CÓDIGO INVÁLIDO — 5 caracteres (A-Z, 2-9)";
      m.classList.remove("shake"); void m.offsetWidth; m.classList.add("shake");
      AudioManager.play("wrong"); return;
    }
    UI.closeModal(); Rooms.joinRoom(code).catch(function(){});
  }
}
function maybeReconnect(){
  const sess=PGHStorage.loadSession();
  if(!sess||!sess.roomCode||sess.wasHost){ if(sess&&sess.wasHost)PGHStorage.clearSession(); return; }
  PGHStorage.clearSession(); // consome; se falhar, some
  const safeCode=String(sess.roomCode||"").replace(/[^A-Z0-9]/g,"").slice(0,5);
  const m=UI.openModal("<h3>🔌 RECONECTAR?</h3><p style='color:var(--muted);font-size:14px'>Você estava na sala <b class='font-mono2' style='color:var(--yellow)'>"+safeCode+"</b>. Deseja voltar?</p><div style='display:flex;gap:8px;margin-top:14px'><button class='btn-arcade secondary' id='rc-yes' style='flex:1'>VOLTAR</button><button class='btn-arcade ghost' id='rc-no' style='flex:1'>IGNORAR</button></div>");
  m.querySelector("#rc-yes").addEventListener("click",function(){
    UI.closeModal();
    PGHStore.playerId=String(sess.playerId||"").replace(/[^a-zA-Z0-9_-]/g,"")||PGHHelpers.uid("pl_");
    const p=PGHStore.profile;
    UI.showScreen("lobby"); Rooms.setConnStatus("","RECONECTANDO...");
    document.getElementById("lobby-room-code").textContent=safeCode;
    Net.joinRoom(safeCode,{id:PGHStore.playerId,nickname:p.nickname,avatar:p.avatar,avatarStyle:p.avatarStyle,avatarSeed:p.avatarSeed,frame:p.avatarFrame},true).then(function(){
      Chat.clear(); Chat.sys("🔌 Reconectado à sala "+safeCode);
      Rooms.renderLobby();
      document.getElementById("host-badge").classList.remove("show");
      document.getElementById("btn-start-game").classList.add("hidden");
      document.getElementById("btn-ready").classList.remove("hidden");
    }).catch(function(){ UI.showScreen("home"); UI.toast("Não deu pra voltar pra sala","error"); });
  });
  m.querySelector("#rc-no").addEventListener("click",function(){UI.closeModal();});
}
/* ---------- GLOBAL BINDINGS ---------- */
function bindGlobal(){
  // fallback global p/ avatares (ex: DiceBear offline) — fantasma pixel inline
  const GHOST="data:image/svg+xml,"+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#151532'/><rect x='18' y='14' width='28' height='26' fill='#22e6ff'/><rect x='24' y='22' width='6' height='8' fill='#04222a'/><rect x='34' y='22' width='6' height='8' fill='#04222a'/><rect x='18' y='40' width='7' height='8' fill='#22e6ff'/><rect x='28' y='40' width='7' height='8' fill='#22e6ff'/><rect x='38' y='40' width='7' height='8' fill='#22e6ff'/></svg>");
  document.addEventListener("error",function(e){ const t=e.target; if(t&&t.tagName==="IMG"&&!t.dataset.fb){ t.dataset.fb="1"; t.src=GHOST; } },true);
  document.addEventListener("pointerdown",function(){AudioManager.unlock();},{passive:true});
  document.addEventListener("keydown",function(){AudioManager.unlock();});
  PGHBus.on("room",function(){ if(PGHStore.screen==="LOBBY"||PGHStore.screen==="lobby")Rooms.renderLobby(); Rooms.updatePingUI(); GameManager.renderGameScores(); });
  PGHBus.on("profile",function(){ if($("screen-home").classList.contains("active"))renderHomeProfile(); });
  setInterval(function(){ const c=$("home-clock"); if(c){const d=new Date();c.textContent=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0");} },1000);
  // home
  $("btn-create-room").addEventListener("click",function(){
    UI.bootOverlay("BOOTING ARCADE...",1300).then(function(){ Rooms.createRoom().then(openRoomCreated).catch(function(){}); });
  });
  $("btn-join-room").addEventListener("click",function(){ openJoinModal(""); });
  $("btn-settings").addEventListener("click",function(){AudioManager.play("select");UI.openSettings();});
  $("btn-trophies").addEventListener("click",function(){AudioManager.play("select");UI.openTrophies();});
  $("btn-shop").addEventListener("click",function(){AudioManager.play("select");UI.openShop();});
  $("btn-edit-profile").addEventListener("click",function(){AudioManager.play("back");initProfileScreen();UI.showScreen("profile");});
  // lobby
  $("btn-leave-room").addEventListener("click",async function(){AudioManager.play("back");var ok=await UI.arcadeConfirm({title:"SAIR DA SALA?",message:"Deseja realmente sair da sala atual?",confirmLabel:"SAIR",cancelLabel:"FICAR",danger:true,icon:'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'});if(ok)Rooms.leaveRoom();});
  $("btn-copy-code").addEventListener("click",function(){
    const code=PGHStore.roomCode||"";
    function ok(){UI.toast("Código "+code+" copiado! Mande pros amigos 🎮","success");AudioManager.play("coin");}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(ok,function(){fallback();});
    else fallback();
    function fallback(){ const i=document.createElement("input");i.value=code;document.body.appendChild(i);i.select();try{document.execCommand("copy");ok();}catch(e){UI.toast("Código: "+code,"warn");}document.body.removeChild(i); }
  });
  $("btn-ready").addEventListener("click",function(){Rooms.toggleReady();});
  $("btn-start-game").addEventListener("click",function(){GameManager.startGame();});
  const dm=$("btn-dmode"); if(dm)dm.addEventListener("click",function(){ if(window.Daily)Daily.toggleMode(); });
  const mx=$("btn-mix"); if(mx)mx.addEventListener("click",function(){ if(window.Daily)Daily.startMix(); });
  $("btn-send-chat").addEventListener("click",sendChat);
  $("chat-input").addEventListener("keydown",function(e){ if(e.key==="Enter"){e.preventDefault();sendChat();} });
  function sendChat(){ const i=$("chat-input"); if(Chat.send(i.value)){i.value="";Achievements.bumpChat();AudioManager.play("chat");} }
  document.querySelectorAll("#reactions-bar button").forEach(function(b){ b.addEventListener("click",function(){Chat.sendReaction(b.getAttribute("data-reaction"));}); });
  document.querySelectorAll("#taunt-row button").forEach(function(b){ b.addEventListener("click",function(){Chat.sendTaunt(b.getAttribute("data-taunt"));}); });
  $("btn-chat-fab").addEventListener("click",function(){
    document.querySelector(".lobby-side").classList.toggle("open");
    if(typeof ChatBumpReset==="function")ChatBumpReset(); AudioManager.play("select");
  });
  // game
  $("btn-quit-game").addEventListener("click",async function(){
    AudioManager.play("back");
    if(PGHStore.isHost){
      var ok=await UI.arcadeConfirm({title:"ENCERRAR PARTIDA?",message:"Encerrar a partida e voltar ao lobby? O progresso desta partida será perdido.",confirmLabel:"ENCERRAR",cancelLabel:"CONTINUAR JOGANDO",danger:true,icon:'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'});
      if(ok)GameManager.quitToLobby();
    }
    else{ UI.toast("Só o HOST encerra a partida","warn"); }
  });
  $("btn-game-chat-toggle").addEventListener("click",function(){
    $("game-chat-mini").classList.toggle("hidden"); AudioManager.play("select");
  });
  $("btn-game-send").addEventListener("click",sendGameChat);
  $("game-chat-input").addEventListener("keydown",function(e){ if(e.key==="Enter"){e.preventDefault();sendGameChat();} });
  function sendGameChat(){ const i=$("game-chat-input"); if(Chat.send(i.value)){i.value="";Achievements.bumpChat();} }
  // teclado físico -> termo
  document.addEventListener("keydown",function(e){
    if(GameManager.current!=="termo")return;
    if(PGHStore.screen!=="game"&&PGHStore.screen!=="GAME")return;
    const tag=(document.activeElement&&document.activeElement.tagName)||"";
    if(tag==="INPUT"&&document.activeElement.id!=="")return; // digitando no chat etc
    if(/^[a-zA-Z]$/.test(e.key))window.TermoPressKey(e.key.toUpperCase());
    else if(e.key==="Enter")window.TermoPressKey("ENTER");
    else if(e.key==="Backspace")window.TermoPressKey("BACK");
  });
  // antes de sair: mantém sessionStorage pra reconnect
  window.addEventListener("beforeunload",function(){ try{if(peerAlive()){};}catch(e){} });
  function peerAlive(){ return !!(Net.peer&&!Net.peer.destroyed); }
}
document.addEventListener("DOMContentLoaded",boot);
})();
