/* PGH Termo Battle — todos jogam a mesma palavra; host guarda o segredo */
(function(){
"use strict";
const MAX_TRIES=6, ROUND_MS=180000;
let board={guesses:[],status:"playing",tries:0}; // client local
let curInput="";
let validWords=null;
function validWord(w){if(!validWords)validWords=new Set([...(window.PGH_WORDBOMB_LEXICON||[]),...(window.PGH_TERMO_WORDS||[])].map(x=>x.toUpperCase()).filter(x=>/^[A-Z]{5}$/.test(x)));return validWords.has(w);}
function pickSecret(){ const w=window.PGH_TERMO_WORDS||["TERMO"]; return w[Math.floor(Math.random()*w.length)]; }
function feedback(secret,guess){
  const s=secret.split(""),g=guess.split(""),fb=Array(5).fill("gray"),counts={};
  for(let i=0;i<5;i++){ if(g[i]===s[i])fb[i]="green"; else counts[s[i]]=(counts[s[i]]||0)+1; }
  for(let i=0;i<5;i++){ if(fb[i]!=="green"&&counts[g[i]]>0){fb[i]="yellow";counts[g[i]]--;} }
  return fb;
}
function createInitialState(playerIds,opts){
  const mod=(opts&&opts.mod)||null;
  const players={};
  playerIds.forEach(function(id){players[id]={guesses:[],solved:false,solvedAt:0,tries:0,done:false};});
  const maxTries=mod==="NO_PANIC"?8:MAX_TRIES, roundMs=opts?.short?60000:mod==="SPEED_TERMO"?90000:ROUND_MS;
  return {phase:"playing",secret:pickSecret(),roundEndsAt:Date.now()+roundMs,roundMs:roundMs,players:players,maxTries:maxTries,mod:mod};
}
function allDone(st){ return Object.keys(st.players).every(function(id){ const p=PGHHelpers.getPlayer(id); if(!p||!p.connected)return true; return st.players[id].done; }); }
function standingsOf(st){
  const now=Date.now(),start=st.roundEndsAt-(st.roundMs||ROUND_MS);
  const std=Object.keys(st.players).map(function(id){
    const p=st.players[id];
    let pts=0;
    if(p.solved){ const speed=Math.max(0,200-Math.floor(((p.solvedAt-start)/1000))*2); pts=1000-(p.tries-1)*120+speed; }
    else pts=p.tries*20;
    return{playerId:id,points:Math.max(0,pts),tries:p.tries,solved:p.solved,solvedAt:p.solvedAt};
  });
  if(st.mod==="FIRST_BLOOD"){ const sv=std.filter(function(s){return s.solved;}).sort(function(a,b){return a.solvedAt-b.solvedAt;}); if(sv[0])sv[0].points+=300; }
  return std.sort(function(a,b){ if(a.solved!==b.solved)return(a.solved?-1:1); if(a.solved&&b.solved){if(a.tries!==b.tries)return a.tries-b.tries;return a.solvedAt-b.solvedAt;} return b.tries-a.tries; });
}
function hostAction(st,playerId,action,value,h){
  if(st.phase!=="playing"||Date.now()>st.roundEndsAt)return;
  if(action!=="guess")return;
  const me=st.players[playerId]; if(!me||me.done)return;
  let w=String((value&&value.word)||"").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if(!/^[A-Z]{5}$/.test(w)||!validWord(w)){h.unicast(playerId,{ok:false,reason:'PALAVRA NÃO ENCONTRADA (5 LETRAS)'});return;}
  if(w.length!==5){ h.unicast(playerId,{ok:false,reason:"5 LETRAS!"}); return; }
  if(me.guesses.some(function(g){return g.word===w;})){ h.unicast(playerId,{ok:false,reason:"JÁ TENTOU!"}); return; }
  const fb=feedback(st.secret,w);
  me.guesses.push({word:w,fb:fb}); me.tries++;
  const solved=w===st.secret;
  if(solved){ me.solved=true; me.solvedAt=Date.now(); me.done=true; }
  else if(me.tries>=(st.maxTries||MAX_TRIES)){ me.done=true; }
  h.unicast(playerId,{ok:true,word:w,fb:fb,solved:solved,tries:me.tries,done:me.done});
  h.broadcastState();
  if(allDone(st)){
    st.phase="ended";
    const std=standingsOf(st);
    setTimeout(function(){ h.finish(std,{secret:st.secret}); },1200);
  }
}
function hostTick(st,h){
  if(st.phase!=="playing")return;
  if(Date.now()>st.roundEndsAt){
    st.phase="ended";
    Object.keys(st.players).forEach(function(id){ st.players[id].done=true; h.unicast(id,{ok:true,timeout:true,secret:st.secret,done:true,solved:st.players[id].solved,tries:st.players[id].tries}); });
    h.broadcastState();
    h.finish(standingsOf(st),{secret:st.secret});
  }
}
function getPublicState(st){
  return {phase:st.phase,maxTries:(st.maxTries||MAX_TRIES),roundEndsAt:st.roundEndsAt,
    progress:Object.keys(st.players).map(function(id){const p=st.players[id];
      let blocks="";for(let i=0;i<(st.maxTries||MAX_TRIES);i++)blocks+=i<p.tries?(p.solved&&i===p.tries-1?"✓":"█"):"░";
      return{playerId:id,tries:p.tries,solved:p.solved,done:p.done,blocks:blocks};})};
}
/* ---------- client ---------- */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function keyState(){
  const m={};
  board.guesses.forEach(function(g){ for(let i=0;i<5;i++){ const L=g.word[i],f=g.fb[i];
    if(f==="green")m[L]="green"; else if(f==="yellow"&&m[L]!=="green")m[L]="yellow"; else if(!m[L])m[L]="gray"; }});
  return m;
}
function render(ps){
  const root=document.getElementById("game-root"); if(!root)return;
  const rows=["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
  const ks=keyState();
  let html='<div class="g-title">🟩 TERMO BATTLE</div><div class="g-sub">Mesma palavra pra todos · '+(ps.maxTries||6)+' tentativas · <span id="termo-timer" class="font-mono2">--:--</span></div>';
  html+='<div class="termo-board" id="termo-board">';
  for(let r=0;r<(ps.maxTries||MAX_TRIES);r++){
    html+='<div class="termo-row">';
    for(let c=0;c<5;c++){
      let ch="",cls="";
      const g=board.guesses[r];
      if(g){ch=g.word[c];cls=g.fb[c];}
      else if(r===board.guesses.length&&board.status==="playing"&&curInput[c]){ch=curInput[c];cls="filled";}
      html+='<div class="termo-cell '+cls+'">'+esc(ch)+'</div>';
    }
    html+="</div>";
  }
  html+="</div>";
  if(board.status==="playing"&&!ps.progress.find(function(p){return p.playerId===PGHStore.playerId&&p.done;})){
    html+='<div class="termo-kb">';
    rows.forEach(function(row,ri){
      html+='<div class="kb-row">';
      if(ri===2)html+='<button class="kb-key" data-k="ENTER" style="min-width:52px">⏎</button>';
      row.split("").forEach(function(L){ html+='<button class="kb-key '+(ks[L]||"")+'" data-k="'+L+'">'+L+'</button>'; });
      if(ri===2)html+='<button class="kb-key" data-k="BACK" style="min-width:52px">⌫</button>';
      html+="</div>";
    });
    html+="</div>";
  }else{
    const solved=board.status==="solved";
    const secretLine=(board.status==="failed"&&board.secret)?(' A palavra era <b style="color:var(--yellow)">'+esc(board.secret)+'</b>.'):"";
    html+='<div class="g-sub" style="margin-top:10px">'+(solved?"✅ VOCÊ ACERTOU em "+board.tries+"! Aguardando os outros...":board.status==="failed"?("❌ Suas tentativas acabaram."+secretLine+" Aguardando..."):"Aguarde...")+'</div>';
  }
  html+='<div class="g-title" style="margin-top:14px;font-size:11px">PROGRESSO DA SALA (sem spoiler)</div><div class="g-leader">';
  const sorted=(ps.progress||[]).slice().sort(function(a,b){if(a.solved!==b.solved)return(a.solved?-1:1);return b.tries-a.tries;});
  sorted.forEach(function(pr){
    const p=PGHHelpers.getPlayer(pr.playerId); if(!p)return;
    html+='<div class="g-leader-row"><span class="nm">'+esc(p.nickname)+'</span><span class="termo-progress">'+esc(pr.blocks)+(pr.solved?" ✓":"")+'</span><span class="vl">'+pr.tries+'/'+(ps.maxTries||6)+'</span></div>';
  });
  html+="</div>";
  root.innerHTML=html;
  root.querySelectorAll(".kb-key").forEach(function(b){ b.addEventListener("click",function(){ pressKey(b.getAttribute("data-k")); }); });
  tickUI(ps);
}
function pressKey(k){
  if(board.status!=="playing")return;
  if(k==="BACK"){curInput=curInput.slice(0,-1);AudioManager.play("move");}
  else if(k==="ENTER"){
    if(curInput.length!==5){UI.toast("Digite 5 letras","warn");AudioManager.play("wrong");return;}
    GameManager.sendAction("termo","guess",{word:curInput}); curInput=""; AudioManager.play("select"); return;
  }
  else if(curInput.length<5&&/^[A-Z]$/.test(k)){curInput+=k;AudioManager.play("move");}
  else return;
  const ps=GameManager.publicState; if(ps)render(ps);
}
function onActionResult(pl){
  if(pl.secret)board.secret=pl.secret;
  if(pl.timeout){ board.status=pl.solved?"solved":"failed"; const ps=GameManager.publicState; if(ps)render(ps); return; }
  if(!pl.ok){
    UI.toast(pl.reason||"Inválido","warn"); AudioManager.play("wrong");
    const bd=document.getElementById("termo-board");
    if(bd){ bd.classList.remove("shake"); void bd.offsetWidth; bd.classList.add("shake"); }
    return;
  }
  if(pl.word){ board.guesses.push({word:pl.word,fb:pl.fb}); board.tries=pl.tries; }
  if(pl.solved){ board.status="solved"; AudioManager.play("correct"); Achievements.checkTermo(pl.tries); UI.confetti(40); if(window.Daily)Daily.track("TERMO_SOLVE",{tries:pl.tries||0}); }
  else if(pl.done){ board.status="failed"; AudioManager.play("wrong"); }
  else AudioManager.play("move");
  const ps=GameManager.publicState; if(ps)render(ps);
}
function tickUI(ps){
  const t=document.getElementById("termo-timer"); if(!t||!ps.roundEndsAt)return;
  const rem=Math.max(0,ps.roundEndsAt-PGHHelpers.hostTime());
  t.textContent=String(Math.floor(rem/60000))+":"+String(Math.floor(rem%60000/1000)).padStart(2,"0");
  if(rem<30000)t.style.color="var(--red)";
}
function renderResult(pl,myPlace,res){
  const root=document.getElementById("game-root"); if(!root)return;
  const standings=(pl.standings||[]).slice().sort(function(a,b){return(b.points||0)-(a.points||0);});
  const secret=(pl.extra&&pl.extra.secret)||"?????";
  let html='<div class="result-hero"><div class="result-crown">'+(myPlace===1?"👑":"🟩")+'</div><div class="g-title">TERMO BATTLE · FIM</div>';
  html+='<div class="g-sub">A palavra era</div><div class="wb-seq" style="position:static;transform:none;display:inline-block;font-size:26px">'+esc(secret)+'</div>';
  html+='<div class="g-sub" style="margin-top:10px">Você ficou em '+myPlace+'º · +'+res.xp+' XP · +'+res.tokens+' 🪙</div></div><div class="result-table"><div class="g-leader">';
  standings.forEach(function(s,i){ const p=PGHHelpers.getPlayer(s.playerId);
    html+='<div class="g-leader-row"><span class="font-mono2">'+String(i+1).padStart(2,"0")+'</span><span class="nm">'+esc(p?p.nickname:"???")+'</span><span class="vl">'+(s.solved?s.tries+" tent.":"✖")+' · '+(s.points||0)+'</span></div>'; });
  html+="</div></div>";
    html+=(window.Daily?Daily.resultButtonsHTML():'<div class="g-row" style="margin-top:16px"><button class="btn-arcade primary" id="btn-again">↻ DE NOVO</button><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>');
  root.innerHTML=html;
  if(window.Daily)Daily.bindResultButtons();
  else{ const a=document.getElementById("btn-again"); if(a)a.addEventListener("click",function(){GameManager.startGame();}); document.getElementById("btn-tolobby").addEventListener("click",function(){GameManager.quitToLobby();}); }
}
function cleanup(){ board={guesses:[],status:"playing",tries:0}; curInput=""; }
GameManager.register({id:"termo",name:"Termo Battle",tag:"★ LETRAS ★",icon:"🟩",desc:"Mesma palavra, 6 tentativas, quem resolve primeiro",players:"2–12 · simultâneo",createInitialState:createInitialState,hostAction:hostAction,hostTick:hostTick,getPublicState:getPublicState,render:render,tickUI:tickUI,onActionResult:onActionResult,renderResult:renderResult,cleanup:cleanup});
window.TermoPressKey=pressKey;
})();
