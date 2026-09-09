/* PGH Riftle — adivinhe o campeão; host compara e nunca revela o segredo */
(function(){
"use strict";
const ROUND_MS=240000;
let history=[], solved=false, selIndex=0, currentList=[], animateLast=false;
function champs(){ return window.PGH_CHAMPIONS||[]; }
function findChamp(name){ const n=String(name||"").toLowerCase().trim(); return champs().find(function(c){return c.n.toLowerCase()===n;})||null; }
function sameSet(a,b){ if(a.length!==b.length)return false; return a.every(function(x){return b.indexOf(x)>=0;}); }
function overlap(a,b){ return a.some(function(x){return b.indexOf(x)>=0;}); }
function compare(g,t){
  const pos=sameSet(g.pos,t.pos)?"green":(overlap(g.pos,t.pos)?"yellow":"red");
  let yr="green",arrow="";
  if(g.yr!==t.yr){ yr="red"; arrow=t.yr>g.yr?" ↑":" ↓"; }
  return [
    {k:"Campeão",v:g.n,c:"none"},
    {k:"Gênero",v:g.g==="M"?"♂":g.g==="F"?"♀":"?",c:g.g===t.g?"green":"red"},
    {k:"Rota",v:g.pos.join("/"),c:pos},
    {k:"Espécie",v:g.sp,c:g.sp===t.sp?"green":"red"},
    {k:"Recurso",v:g.res,c:g.res===t.res?"green":"red"},
    {k:"Alcance",v:g.rng,c:g.rng===t.rng?"green":"red"},
    {k:"Região",v:g.reg,c:g.reg===t.reg?"green":"red"},
    {k:"Ano",v:String(g.yr)+arrow,c:yr}
  ];
}
function poolFor(desc){
  let pool=champs();
  if(desc&&desc.mod==="OLD_SCHOOL")pool=pool.filter(function(c){return c.yr<=2011;});
  if(desc&&desc.mod==="REGION_DAY"&&desc.param)pool=pool.filter(function(c){return c.reg===desc.param;});
  if(desc&&desc.mod==="ROLE_LOCK"&&desc.param)pool=pool.filter(function(c){return(c.pos||[]).indexOf(desc.param)>=0;});
  if(!pool.length)pool=champs();
  return pool;
}
function createInitialState(playerIds,opts){
  const players={};
  playerIds.forEach(function(id){players[id]={guesses:0,solved:false,solvedAt:0,done:false,names:[]};});
  const desc={mod:(opts&&opts.mod)||null,param:(opts&&opts.param)||null};
  const pool=poolFor(desc); desc.total=pool.length;
  const roundMs=opts?.short||desc.mod==="SPEED_RIFTLE"?60000:ROUND_MS;
  return {phase:"playing",secret:pool[Math.floor(Math.random()*pool.length)],roundEndsAt:Date.now()+roundMs,roundMs:roundMs,players:players,mod:desc.mod,poolDesc:desc};
}
function standingsOf(st){
  const start=st.roundEndsAt-(st.roundMs||ROUND_MS);
  return Object.keys(st.players).map(function(id){ const p=st.players[id]; let pts=0;
    if(p.solved){ const speed=Math.max(0,200-Math.floor((p.solvedAt-start)/1000)*2); pts=1200-(p.guesses-1)*100+speed; if(st.mod==="ONE_SHOT")pts+=p.guesses<=1?1500:p.guesses===2?800:p.guesses===3?400:0; }
    else pts=Math.min(100,p.guesses*10);
    return{playerId:id,points:Math.max(0,pts),guesses:p.guesses,solved:p.solved,solvedAt:p.solvedAt};
  }).sort(function(a,b){ if(a.solved!==b.solved)return(a.solved?-1:1); if(a.solved&&b.solved){if(a.guesses!==b.guesses)return a.guesses-b.guesses;return a.solvedAt-b.solvedAt;} return b.guesses-a.guesses; });
}
function hostAction(st,playerId,action,value,h){
  if(st.phase!=="playing"||action!=="guess"||Date.now()>st.roundEndsAt)return;
  const me=st.players[playerId]; if(!me||me.done)return;
  const champ=findChamp(value&&value.name);
  if(!champ){ h.unicast(playerId,{ok:false,reason:"Campeão não encontrado"}); return; }
  if(me.names.indexOf(champ.n)>=0){ h.unicast(playerId,{ok:false,reason:"Você já tentou "+champ.n}); return; }
  me.names.push(champ.n); me.guesses++;
  const comp=compare(champ,st.secret);
  const ok=champ.n===st.secret.n;
  if(ok){ me.solved=true; me.solvedAt=Date.now(); me.done=true; }
  if(me.guesses>=12)me.done=true;
  h.unicast(playerId,{ok:true,guess:champ.n,comp:comp,solved:ok,guesses:me.guesses,done:me.done});
  h.broadcastState();
  if(Object.keys(st.players).every(function(id){ const p=PGHHelpers.getPlayer(id); if(!p||!p.connected)return true; return st.players[id].done; })){
    st.phase="ended"; const std=standingsOf(st);
    setTimeout(function(){ h.finish(std,{secret:st.secret}); },1200);
  }
}
function hostTick(st,h){
  if(st.phase!=="playing")return;
  if(!st.hintRevealed&&Date.now()>st.roundEndsAt-(st.roundMs||ROUND_MS)/2){st.hintRevealed=true;h.broadcastState();}
  if(Date.now()>st.roundEndsAt){
    st.phase="ended";
    Object.keys(st.players).forEach(function(id){ st.players[id].done=true; h.unicast(id,{ok:true,timeout:true,done:true,solved:st.players[id].solved,guesses:st.players[id].guesses}); });
    h.broadcastState(); h.finish(standingsOf(st),{secret:st.secret});
  }
}
function getPublicState(st){
  const start=st.roundEndsAt-(st.roundMs||ROUND_MS);
  const showHint=!!st.hintRevealed;
  return {phase:st.phase,roundEndsAt:st.roundEndsAt,total:(st.poolDesc&&st.poolDesc.total)||champs().length,poolDesc:st.poolDesc||null,hint:showHint?st.secret.hint:null,
    progress:Object.keys(st.players).map(function(id){const p=st.players[id];return{playerId:id,guesses:p.guesses,solved:p.solved,done:p.done};})};
}
/* ---------- client ---------- */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function render(ps){
  const draft=document.getElementById('rift-input')?.value||'';
  const root=document.getElementById("game-root"); if(!root)return;
  const myPr=(ps.progress||[]).find(function(p){return p.playerId===PGHStore.playerId;});
  const done=myPr&&myPr.done;
  let html='<div class="g-title">🔮 RIFTLE · ADIVINHE O CAMPEÃO</div>';
  html+='<div class="g-sub">'+ps.total+' campeões · <span id="rift-timer" class="font-mono2">--:--</span>'+(ps.hint?(' · 💡 dica: <b style="color:var(--yellow)">'+esc(ps.hint)+'</b>'):"")+'</div>';
  if(!done){
    html+='<div class="rift-search"><div class="g-input-row" style="margin-top:0"><input id="rift-input" class="arcade-input" placeholder="digite o campeão... ex: mal" autocomplete="off" spellcheck="false"><button id="rift-send" class="btn-arcade secondary">GO</button></div><div id="rift-results" class="rift-results hidden"></div></div>';
  }else{
    html+='<div class="g-sub" style="margin-top:10px">'+(solved?"✅ VOCÊ ACERTOU em "+history.length+"! Aguardando...":"⏳ Aguardando os outros...")+'</div>';
  }
  html+='<div class="rift-wrap"><table class="rift-table"><thead><tr><th>CAMPEÃO</th><th>GÊN</th><th>ROTA</th><th>ESPÉCIE</th><th>RECURSO</th><th>ALCANCE</th><th>REGIÃO</th><th>ANO</th></tr></thead><tbody>';
  const doAnimate=animateLast; animateLast=false;
  history.slice().reverse().forEach(function(hh,ri){
    html+="<tr>";
    hh.comp.forEach(function(cell,ci){
      const cls=cell.c==="green"?"cell-green":cell.c==="yellow"?"cell-yellow":cell.c==="red"?"cell-red":"";
      const rc=(doAnimate&&ri===0)?" rcell":"";
      const dl=(doAnimate&&ri===0)?' style="animation-delay:'+(ci*130)+'ms"':"";
      html+='<td class="'+cls+rc+'"'+dl+'>'+esc(cell.v)+'</td>';
    });
    html+="</tr>";
  });
  if(doAnimate){ for(let i=0;i<8;i++)(function(k){ setTimeout(function(){ AudioManager.play("tick"); },k*130); })(i); }
  if(history.length===0)html+='<tr><td colspan="8" style="color:var(--muted)">Nenhum palpite ainda. 🟩 correto · 🟨 parcial · 🟥 errado · ↑↓ ano</td></tr>';
  html+="</tbody></table></div>";
  html+='<div class="g-title" style="margin-top:14px;font-size:11px">PROGRESSO (sem spoiler)</div><div class="g-leader">';
  (ps.progress||[]).forEach(function(pr){ const p=PGHHelpers.getPlayer(pr.playerId); if(!p)return;
    html+='<div class="g-leader-row"><span class="nm">'+esc(p.nickname)+'</span><span class="vl">'+(pr.solved?"SOLVED ✓":pr.guesses+" guesses")+'</span></div>'; });
  html+="</div>";
  root.innerHTML=html;
  const inp=document.getElementById("rift-input");
  if(inp){
    inp.value=draft;
    inp.focus();
    inp.addEventListener("input",function(){ renderResults(inp.value); });
    inp.addEventListener("keydown",function(ev){
      const box=document.getElementById("rift-results");
      if(ev.key==="ArrowDown"){ev.preventDefault();selIndex=Math.min(currentList.length-1,selIndex+1);paintSel(box);}
      else if(ev.key==="ArrowUp"){ev.preventDefault();selIndex=Math.max(0,selIndex-1);paintSel(box);}
      else if(ev.key==="Enter"){ev.preventDefault(); if(currentList[selIndex]){submitGuess(currentList[selIndex].n);} else submitGuess(inp.value);}
      else if(ev.key==="Escape"){box.classList.add("hidden");}
    });
    document.getElementById("rift-send").addEventListener("click",function(){ submitGuess(inp.value); });
  }
  tickUI(ps);
}
function renderResults(q){
  const box=document.getElementById("rift-results"); if(!box)return;
  q=String(q||"").toLowerCase().trim();
  if(q.length<1){box.classList.add("hidden");currentList=[];return;}
  const guessed=history.map(function(h){return h.guess;});
  currentList=poolFor(GameManager.publicState&&GameManager.publicState.poolDesc).filter(function(c){return c.n.toLowerCase().indexOf(q)>=0&&guessed.indexOf(c.n)<0;}).slice(0,8);
  selIndex=0;
  if(currentList.length===0){box.classList.add("hidden");return;}
  box.innerHTML="";
  currentList.forEach(function(c,i){
    const d=document.createElement("div"); d.className="rift-opt"+(i===0?" sel":"");
    const b=document.createElement("b"); b.textContent=c.n;
    const s=document.createElement("small"); s.textContent=c.pos.join("/")+" · "+c.reg;
    d.appendChild(b); d.appendChild(s);
    d.addEventListener("click",function(){ submitGuess(c.n); });
    box.appendChild(d);
  });
  box.classList.remove("hidden");
}
function paintSel(box){
  if(!box)return;
  Array.prototype.forEach.call(box.children,function(d,i){ d.classList.toggle("sel",i===selIndex); });
}
function submitGuess(name){
  name=String(name||"").trim(); if(!name)return;
  GameManager.sendAction("riftle","guess",{name:name});
  AudioManager.play("select");
}
function onActionResult(pl){
  if(pl.timeout){ const ps=GameManager.publicState; if(ps)render(ps); return; }
  if(!pl.ok){ UI.toast(pl.reason||"Inválido","warn"); AudioManager.play("wrong"); return; }
  history.push({guess:pl.guess,comp:pl.comp}); animateLast=true;
  if(pl.solved){ solved=true; AudioManager.play("correct"); Achievements.checkRiftle(pl.guesses); UI.confetti(50); UI.toast("SOLVED em "+pl.guesses+"! 🔮","success"); if(window.Daily)Daily.track("RIFTLE_SOLVE",{guesses:pl.guesses||0}); }
  else AudioManager.play("move");
  const ps=GameManager.publicState; if(ps)render(ps);
}
function tickUI(ps){
  const t=document.getElementById("rift-timer"); if(!t||!ps.roundEndsAt)return;
  const rem=Math.max(0,ps.roundEndsAt-PGHHelpers.hostTime());
  t.textContent=String(Math.floor(rem/60000))+":"+String(Math.floor(rem%60000/1000)).padStart(2,"0");
}
function renderResult(pl,myPlace,res){
  const root=document.getElementById("game-root"); if(!root)return;
  const standings=(pl.standings||[]).slice().sort(function(a,b){return(b.points||0)-(a.points||0);});
  const s=(pl.extra&&pl.extra.secret)||{n:"???"};
  let html='<div class="result-hero"><div class="result-crown">'+(myPlace===1?"👑":"🔮")+'</div><div class="g-title">RIFTLE · FIM</div>';
  html+='<div class="g-sub">O campeão era</div><div style="font-family:var(--font-pixel);font-size:20px;color:var(--cyan)">'+esc(s.n)+'</div>';
  html+='<div class="g-sub">'+esc(s.pos?s.pos.join("/"):"")+' · '+esc(s.reg||"")+' · '+esc(s.sp||"")+'</div>';
  html+='<div class="g-sub">Você ficou em '+myPlace+'º · +'+res.xp+' XP · +'+res.tokens+' 🪙</div></div><div class="result-table"><div class="g-leader">';
  standings.forEach(function(st,i){ const p=PGHHelpers.getPlayer(st.playerId);
    html+='<div class="g-leader-row"><span class="font-mono2">'+String(i+1).padStart(2,"0")+'</span><span class="nm">'+esc(p?p.nickname:"???")+'</span><span class="vl">'+(st.solved?st.guesses+" palp.":"✖")+' · '+(st.points||0)+'</span></div>'; });
  html+="</div></div>";
    html+=(window.Daily?Daily.resultButtonsHTML():'<div class="g-row" style="margin-top:16px"><button class="btn-arcade primary" id="btn-again">↻ DE NOVO</button><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>');
  root.innerHTML=html;
  if(window.Daily)Daily.bindResultButtons();
  else{ const a=document.getElementById("btn-again"); if(a)a.addEventListener("click",function(){GameManager.startGame();}); document.getElementById("btn-tolobby").addEventListener("click",function(){GameManager.quitToLobby();}); }
}
function cleanup(){ history=[]; solved=false; selIndex=0; currentList=[]; animateLast=false; }
GameManager.register({id:"riftle",name:"Riftle",tag:"★ RIFT ★",icon:"🔮",desc:"Adivinhe o campeão por atributos e dicas",players:"2–12 · simultâneo",createInitialState:createInitialState,hostAction:hostAction,hostTick:hostTick,getPublicState:getPublicState,render:render,tickUI:tickUI,onActionResult:onActionResult,renderResult:renderResult,cleanup:cleanup});
})();
