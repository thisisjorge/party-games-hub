/* PGH Chat — mensagens + reações (XSS-safe: sempre textContent) */
(function(){
"use strict";
function fmtTime(ts){ const d=new Date(ts); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function pushLocal(entry){
  PGHStore.sessionChat.push(entry);
  if(PGHStore.sessionChat.length>120)PGHStore.sessionChat.shift();
  renderAll();
}
function renderInto(containerId){
  const box=document.getElementById(containerId); if(!box)return;
  const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<90;
  box.innerHTML="";
  PGHStore.sessionChat.forEach(function(m){
    if(m.sys){ const s=document.createElement("div"); s.className="chat-msg sys"; s.textContent=m.text; box.appendChild(s); return; }
    const row=document.createElement("div"); row.className="chat-msg"+(m.taunt?" taunt":"");
    const ava=document.createElement("div"); ava.className="c-ava";
    const img=document.createElement("img"); img.alt=""; img.loading="lazy";
    img.src=window.portraitSrc?portraitSrc({character:m.character||null,avatar:m.avatar}):(m.avatar||ProfileManager.avatarUrl("pixel-art",m.senderId||"x"));
    ava.appendChild(img);
    const body=document.createElement("div"); body.className="c-body";
    const head=document.createElement("div"); head.className="c-head";
    const nick=document.createElement("span"); nick.className="c-nick"; nick.textContent=m.nickname||"???";
    const time=document.createElement("span"); time.className="c-time"; time.textContent=fmtTime(m.timestamp);
    head.appendChild(nick); head.appendChild(time);
    const txt=document.createElement("div"); txt.className="c-text"; txt.textContent=m.text;
    body.appendChild(head); body.appendChild(txt);
    row.appendChild(ava); row.appendChild(body); box.appendChild(row);
  });
  if(nearBottom)box.scrollTop=box.scrollHeight;
}
function renderAll(){
  renderInto("chat-messages"); renderInto("game-chat-messages");
}
function sys(text){
  const entry={sys:true,text:text,timestamp:Date.now()};
  pushLocal(entry);
  // host replica avisos do sistema para todos
  if(PGHStore.isHost&&PGHStore.roomCode){
    try{ Net.hostBroadcastRaw(Net.mkMsg("CHAT_MESSAGE",entry)); }catch(e){}
  }
}
window.Chat={
  renderAll:renderAll, sys:sys,
  clear(){ PGHStore.sessionChat=[]; renderAll(); },
  receive(entry){ pushLocal(entry); AudioManager.play("chat"); bumpUnread(); },
  send(text){
    text=String(text||"").trim().slice(0,200); if(!text)return false;
    const me=PGHHelpers.myPlayer();
    const entry={senderId:PGHStore.playerId,nickname:me?me.nickname:(PGHStore.profile.nickname||"EU"),avatar:me?me.avatar:PGHStore.profile.avatar,character:me?me.character:PGHStore.profile.character,text:text,timestamp:Date.now()};
    pushLocal(entry);
    Net.broadcast({type:"CHAT_MESSAGE",payload:entry});
    return true;
  },
  receiveReaction(emoji,nickname){ UI.flyReaction(emoji,nickname); AudioManager.play("reaction"); },
  sendReaction(emoji){
    if(!UI.canReact())return;
    UI.flyReaction(emoji,"você");
    Net.broadcast({type:"REACTION",payload:{emoji:emoji,nickname:PGHStore.profile.nickname}});
  },
  sendTaunt(text){
    if(!UI.canReact())return;
    const me=PGHHelpers.myPlayer();
    const entry={senderId:PGHStore.playerId,nickname:me?me.nickname:(PGHStore.profile.nickname||"EU"),avatar:me?me.avatar:PGHStore.profile.avatar,character:me?me.character:PGHStore.profile.character,text:String(text||"").slice(0,24),timestamp:Date.now(),taunt:true};
    pushLocal(entry);
    Net.broadcast({type:"CHAT_MESSAGE",payload:entry});
    AudioManager.play("reaction");
  }
};
function bumpUnread(){
  const side=document.querySelector(".lobby-side");
  if(window.innerWidth<=1000&&side&&!side.classList.contains("open")){
    const u=document.getElementById("chat-unread");
    if(u){ u.classList.remove("hidden"); u.textContent=String(Math.min(9,parseInt(u.textContent||"0",10)+1)); }
  }
}
window.ChatBumpReset=function(){ const u=document.getElementById("chat-unread"); if(u){u.classList.add("hidden");u.textContent="0";} };
})();
