/* PGH UI — navegação, toasts, modais, confete, partículas, CRT, debug, settings */
(function(){
"use strict";
function $(id){ return document.getElementById(id); }
function showScreen(name){
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });
  const el=$("screen-"+name);
  if(el)el.classList.add("active");
  PGHStore.screen=name; PGHBus.emit("screen",name);
  if(window.Daily&&(name==="home"||name==="lobby")){ try{Daily.onLobbyHome();}catch(e){} }
  window.scrollTo(0,0);
  refreshIcons();
}
function refreshIcons(){ try{ if(window.lucide)lucide.createIcons(); }catch(e){} }
function toast(msg,type,ms){
  const root=$("toast-root"); if(!root)return;
  const t=document.createElement("div"); t.className="toast "+(type||"");
  t.textContent=msg; root.appendChild(t);
  while(root.children.length>4)root.removeChild(root.firstChild);
  setTimeout(function(){ t.classList.add("out"); setTimeout(function(){ if(t.parentNode)t.parentNode.removeChild(t); },320); },ms||2600);
}
function openModal(html){
  const root=$("modal-root");
  root.innerHTML="";
  const back=document.createElement("div"); back.className="modal-back";
  const m=document.createElement("div"); m.className="modal"; m.innerHTML=html;
  back.appendChild(m); root.appendChild(back);
  back.addEventListener("click",function(e){ if(e.target===back)closeModal(); });
  refreshIcons(); return m;
}
function closeModal(){ $("modal-root").innerHTML=""; }
/* ─── ARCADE CONFIRM (replaces native confirm()) ─── */
function arcadeConfirm(opts){
  return new Promise(function(resolve){
    opts = opts || {};
    var title = opts.title || "CONFIRMAR";
    var msg = opts.message || "";
    var confirmLabel = opts.confirmLabel || "CONFIRMAR";
    var cancelLabel = opts.cancelLabel || "CANCELAR";
    var danger = !!opts.danger;
    var icon = opts.icon || "⚠";
    var root = $("modal-root");
    root.innerHTML = "";
    var back = document.createElement("div");
    back.className = "modal-back arcade-confirm-back";
    back.setAttribute("role","dialog");
    back.setAttribute("aria-modal","true");
    back.setAttribute("aria-label", title);
    var m = document.createElement("div");
    m.className = "modal arcade-confirm";
    m.innerHTML = '<div class="ac-icon">'+icon+'</div>'
      + '<div class="ac-title font-pixel">'+title+'</div>'
      + (msg ? '<div class="ac-msg">'+msg+'</div>' : '')
      + '<div class="ac-buttons">'
      + '<button class="btn-arcade ghost ac-cancel">'+cancelLabel+'</button>'
      + '<button class="btn-arcade '+(danger?'danger':'primary')+' ac-confirm">'+confirmLabel+'</button>'
      + '</div>';
    back.appendChild(m);
    root.appendChild(back);
    refreshIcons();
    var btnC = m.querySelector(".ac-cancel");
    var btnOk = m.querySelector(".ac-confirm");
    function done(v){ root.innerHTML=""; resolve(v); }
    btnC.addEventListener("click",function(){ AudioManager.play("back"); done(false); });
    btnOk.addEventListener("click",function(){ AudioManager.play("select"); done(true); });
    back.addEventListener("click",function(e){ if(e.target===back){ AudioManager.play("back"); done(false); } });
    // Keyboard: ESC → cancel; Enter does NOT confirm (prevent accidental destructive action)
    function onKey(e){
      if(e.key==="Escape"){ e.preventDefault(); done(false); document.removeEventListener("keydown",onKey,true); }
    }
    document.addEventListener("keydown",onKey,true);
    btnC.focus();
  });
}
function bootOverlay(text,ms){
  return new Promise(function(res){
    const o=document.createElement("div"); o.className="boot-overlay";
    const mini=document.createElement("div"); mini.className="boot-mini";
    const t=document.createElement("div"); t.className="font-pixel boot-mini-title"; t.textContent=text;
    const bar=document.createElement("div"); bar.className="boot-bar";
    const fill=document.createElement("div"); bar.appendChild(fill);
    const sub=document.createElement("div"); sub.className="font-mono2 boot-mini-sub"; sub.textContent="PGH·OS // NET BOOT";
    mini.appendChild(t); mini.appendChild(bar); mini.appendChild(sub); o.appendChild(mini);
    document.body.appendChild(o);
    AudioManager.play("roundStart");
    const t0=Date.now(), total=ms||1400;
    const iv=setInterval(function(){
      const p=Math.min(100,(Date.now()-t0)/total*100);
      fill.style.width=p+"%";
      if(p>=100){ clearInterval(iv); o.classList.add("done"); setTimeout(function(){ if(o.parentNode)o.parentNode.removeChild(o); res(); },220); }
    },50);
  });
}
function flash(color,ms){
  const f=$("flash-overlay"); if(!f)return;
  f.className=color||""; f.style.transition="none"; f.style.opacity="0.9";
  requestAnimationFrame(function(){ f.style.transition="opacity "+(ms||400)+"ms"; f.style.opacity="0"; });
}
function shakeScreen(){ document.body.classList.remove("shake"); void document.body.offsetWidth; document.body.classList.add("shake"); setTimeout(function(){document.body.classList.remove("shake");},500); }
/* confete pixel */
let confettiParts=[],confettiRAF=null;
function confetti(n){
  if(PGHStore.settings&&PGHStore.settings.reducedEffects)return;
  const cv=$("confetti-canvas"); if(!cv)return;
  cv.width=window.innerWidth; cv.height=window.innerHeight;
  const colors=["#ff2d78","#22e6ff","#ffd319","#39ff6a","#a06bff","#ff8a00"];
  for(let i=0;i<(n||80);i++)confettiParts.push({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*0.3,w:4+Math.random()*7,h:6+Math.random()*8,c:colors[i%colors.length],vy:2+Math.random()*4,vx:-2+Math.random()*4,r:Math.random()*Math.PI,vr:-0.2+Math.random()*0.4});
  if(!confettiRAF)confettiLoop();
}
function confettiLoop(){
  const cv=$("confetti-canvas"); if(!cv){confettiRAF=null;return;}
  const g=cv.getContext("2d"); g.clearRect(0,0,cv.width,cv.height);
  confettiParts.forEach(function(p){ p.x+=p.vx;p.y+=p.vy;p.r+=p.vr; g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore(); });
  confettiParts=confettiParts.filter(function(p){return p.y<cv.height+30;});
  if(confettiParts.length>0)confettiRAF=requestAnimationFrame(confettiLoop);
  else{confettiRAF=null;g.clearRect(0,0,cv.width,cv.height);}
}
/* partículas fundo */
let parts=[],pRAF=null;
function initParticles(){
  const cv=$("particles-canvas"); if(!cv)return;
  function size(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
  size(); window.addEventListener("resize",size);
  const colors=["255,45,120","34,230,255","255,211,25","160,107,255"];
  for(let i=0;i<50;i++)parts.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,s:Math.random()*2+0.5,v:0.2+Math.random()*0.7,c:colors[i%4],a:Math.random()*0.5+0.15});
  function loop(){
    if(PGHStore.settings&&PGHStore.settings.reducedEffects){pRAF=requestAnimationFrame(loop);return;}
    const g=cv.getContext("2d"); g.clearRect(0,0,cv.width,cv.height);
    parts.forEach(function(p){ p.y-=p.v; if(p.y<-5){p.y=cv.height+5;p.x=Math.random()*cv.width;}
      g.fillStyle="rgba("+p.c+","+p.a+")"; g.fillRect(p.x,p.y,p.s,p.s); });
    pRAF=requestAnimationFrame(loop);
  }
  loop();
}
/* reações flutuantes */
let lastReactionAt=0;
function flyReaction(emoji,nickname){
  if(PGHStore.settings&&PGHStore.settings.reducedEffects)return;
  const layer=$("reaction-layer"); if(!layer)return;
  const s=document.createElement("div"); s.className="fly-reaction"; s.textContent=emoji;
  s.style.left=(10+Math.random()*80)+"vw"; s.style.bottom="12vh"; s.title=nickname||"";
  layer.appendChild(s); setTimeout(function(){ if(s.parentNode)s.parentNode.removeChild(s); },1700);
}
function canReact(){ const n=Date.now(); if(n-lastReactionAt<900)return false; lastReactionAt=n; return true; }
/* debug */
function updateDebug(){
  const d=$("debug-panel"); if(!d||d.classList.contains("hidden"))return;
  const g=GameManager?GameManager.current:null;
  d.textContent="peer: "+(PGHStore.peerId||"-")+"\nhost: "+(PGHStore.isHost?"YES":"no")+"\nroom: "+(PGHStore.roomCode||"-")+"\nping: "+(PGHStore.pingMs==null?"-":PGHStore.pingMs+"ms")+"\nplayers: "+PGHStore.players.length+"\nscreen: "+PGHStore.screen+"\ngame: "+(PGHStore.selectedGame||"-")+" / "+PGHStore.gamePhase+"\ndaily: "+((PGHStore.daily&&PGHStore.daily.id)||"-");
}
/* settings modal */
function openSettings(){
  const s=PGHStore.settings;
  const m=openModal("<h3>⚙ CONFIG</h3>"+
    row("EFEITO CRT","crt",s.crt)+row("SOM SYNTH","sound",s.sound)+row("EFEITOS REDUZIDOS","reduced",s.reducedEffects)+
    '<div class="modal-row"><span>VOLUME</span><input id="set-volume" type="range" min="0" max="1" step="0.1" value="'+s.volume+'" style="width:140px"></div>'+
    '<div style="display:flex;gap:8px;margin-top:14px"><button class="btn-arcade ghost" id="set-close" style="flex:1">FECHAR</button><button class="btn-arcade danger sm" id="set-wipe">RESET PERFIL</button></div>');
  function row(label,key,on){ return '<div class="modal-row"><span>'+label+'</span><button class="toggle '+(on?"on":"")+'" data-k="'+key+'" aria-label="'+label+'"></button></div>'; }
  m.querySelectorAll(".toggle").forEach(function(t){ t.addEventListener("click",function(){
    const k=t.getAttribute("data-k"); t.classList.toggle("on"); const on=t.classList.contains("on");
    if(k==="crt"){s.crt=on;document.body.classList.toggle("crt-on",on);}
    if(k==="sound")AudioManager.setEnabled(on);
    if(k==="reduced"){s.reducedEffects=on;document.body.classList.toggle("reduced-effects",on);}
    PGHStorage.saveSettings(s); AudioManager.play("select");
  });});
  m.querySelector("#set-volume").addEventListener("input",function(e){ AudioManager.setVolume(parseFloat(e.target.value)); });
  m.querySelector("#set-close").addEventListener("click",function(){closeModal();});
  m.querySelector("#set-wipe").addEventListener("click",async function(){
    closeModal();
    var ok=await arcadeConfirm({title:"APAGAR PERFIL?",message:"Apagar perfil local (XP, tokens, conquistas)? Esta ação não pode ser desfeita.",confirmLabel:"APAGAR TUDO",cancelLabel:"CANCELAR",danger:true,icon:'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'});
    if(ok){ PGHStorage.clearProfile(); location.reload(); }
  });
}
function openTrophies(){
  const defs=Achievements.DEFS, un=PGHStore.profile.achievements||{};
  let html="<h3>🏆 CONQUISTAS</h3>";
  defs.forEach(function(a){ const has=!!un[a.id];
    html+='<div class="ach-row '+(has?"unlocked":"locked")+'"><div class="ach-ico">'+(has?a.icon:"🔒")+'</div><div><b>'+a.name+'</b><p>'+a.desc+'</p></div></div>'; });
  html+='<button class="btn-arcade ghost w-full" id="ach-close" style="margin-top:8px">FECHAR</button>';
  const m=openModal(html); m.querySelector("#ach-close").addEventListener("click",closeModal);
}
function openShop(){
  const p=PGHStore.profile; let html="<h3>🛒 MOLDURAS · 🪙 "+p.tokens+'</h3><div class="frame-grid">';
  ProfileManager.FRAMES.forEach(function(f){
    const owned=p.cosmetics.frames.indexOf(f.id)>=0, sel=p.avatarFrame===f.id;
    const pr=(window.Daily?Daily.spotPrice(f):f.price), spot=!owned&&pr!==f.price;
    html+='<button class="frame-opt '+f.cls+(sel?" selected":"")+(!owned?" locked":"")+'" data-f="'+f.id+'" title="'+f.name+" — "+(owned?"owned":pr+" 🪙"+(spot?" ★HOJE −25%":""))+'">'+f.icon+(owned?"":'<span class="lock">'+(spot?"★":"")+pr+"🪙</span>")+"</button>";
  });
  html+='</div><button class="btn-arcade ghost w-full" id="shop-close" style="margin-top:12px">FECHAR</button>';
  const m=openModal(html);
  m.querySelectorAll(".frame-opt").forEach(function(b){ b.addEventListener("click",function(){ ProfileManager.buyFrame(b.getAttribute("data-f")); openShop(); if(typeof renderHomeProfile==="function")renderHomeProfile(); }); });
  m.querySelector("#shop-close").addEventListener("click",closeModal);
}
window.UI={showScreen:showScreen,toast:toast,openModal:openModal,closeModal:closeModal,bootOverlay:bootOverlay,flash:flash,shakeScreen:shakeScreen,confetti:confetti,initParticles:initParticles,flyReaction:flyReaction,canReact:canReact,updateDebug:updateDebug,openSettings:openSettings,openTrophies:openTrophies,openShop:openShop,refreshIcons:refreshIcons,arcadeConfirm:arcadeConfirm,$:$};
})();
