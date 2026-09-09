/* Honest-client reaction timing: pre-scheduled start, local paint clock, 100 ms score bands. */
(function(){
'use strict';const C=PGHParty,variants=['green','fakeout','odd','color'],colors=['AZUL','ROSA','VERDE','AMARELO'];let frame=null,viewKey='',shownAt=null,painted=false;
function begin(st){st.phase='ready';st.variant=st.order[(st.round-1)%4];st.goAt=Date.now()+2500+Math.floor(Math.random()*2500);st.fakeAt=st.goAt-900;st.endsAt=st.goAt+6000;st.hits={};st.target=Math.floor(Math.random()*4);st.grid=st.variant==='color'?C.shuffle(colors):Array.from({length:4},(_,i)=>i===st.target?'◆':'●');if(st.variant==='color')st.target=st.grid.indexOf(colors[Math.floor(Math.random()*4)]);}
function createInitialState(ids,opts){const st={ids,round:1,rounds:opts?.short?4:8,scores:Object.fromEntries(ids.map(id=>[id,0])),order:C.shuffle(variants)};begin(st);return st;}
function hostAction(st,id,action,v,h){
 if(!C.active(st).includes(id)||action!=='tap'||st.phase==='reveal'||st.phase==='ended'||st.hits[id]||Date.now()>st.endsAt)return;
 const elapsed=Number(v?.elapsed),choice=Number(v?.choice),now=Date.now();
 const early=v?.early===true||now<st.goAt||!Number.isFinite(elapsed)||elapsed<80||elapsed>6000;
 // Allow ordinary transport jitter without making arrival order the score.
 const plausible=Number.isFinite(elapsed)&&elapsed<=now-st.goAt+1000&&elapsed>=now-st.goAt-2000;
 const correct=!early&&plausible&&((st.variant==='green'||st.variant==='fakeout')||choice===st.target);
 const points=correct?Math.max(100,1000-Math.floor(elapsed/100)*100):0;
 st.hits[id]={elapsed:correct?Math.round(elapsed):null,points,reason:early?'QUEIMOU':correct?'ACERTOU':'ERROU'};st.scores[id]+=points;
 if(C.active(st).every(p=>st.hits[p])){st.phase='reveal';st.endsAt=Date.now()+3500;}h.broadcastState();
}
function hostTick(st,h){
 if(!st||st.phase==='ended')return;
 if(st.phase==='ready'&&Date.now()>=st.goAt){st.phase='go';h.broadcastState();}
 if(Date.now()<=st.endsAt)return;
 if(st.phase!=='reveal'){st.phase='reveal';st.endsAt=Date.now()+3500;st.ids.forEach(id=>{st.hits[id]||={elapsed:null,points:0,reason:'SEM TOQUE'};});}
 else if(st.round>=st.rounds){st.phase='ended';h.finish(C.scores(st),{});return;}else{st.round++;begin(st);}h.broadcastState();
}
function getPublicState(st){return {phase:st.phase,round:st.round,rounds:st.rounds,scores:{...st.scores},goAt:st.goAt,fakeAt:st.fakeAt,endsAt:st.endsAt,variant:st.variant,grid:st.grid,prompt:st.variant==='color'?st.grid[st.target]:null,hits:{...st.hits}};}
function paint(ps){
 const now=PGHHelpers.hostTime(),go=now>=ps.goAt;const board=document.getElementById('reflex-board'),cue=document.getElementById('reflex-cue');if(!board||!cue)return;
 if(go&&!painted){painted=true;shownAt=performance.now();}
 const fake=ps.variant==='fakeout'&&now>=ps.fakeAt&&now<ps.fakeAt+300;
 board.classList.toggle('is-go',go);board.classList.toggle('is-fake',fake);
 cue.textContent=go?(ps.variant==='color'?'TOQUE: '+ps.prompt:ps.variant==='odd'?'TOQUE NO DIFERENTE':'VERDE! TOQUE!'):fake?'QUASE… NÃO TOQUE!':'ESPERE O SINAL';
 board.querySelectorAll('[data-tap]').forEach((b,i)=>{b.textContent=go?(ps.variant==='color'||ps.variant==='odd'?ps.grid[i]:'TOQUE'):'…';if(ps.variant==='color'&&go)b.dataset.color=ps.grid[i];});
}
function animate(ps){cancelAnimationFrame(frame);paint(ps);if(ps.phase!=='reveal'&&ps.phase!=='ended')frame=requestAnimationFrame(()=>animate(ps));}
function render(ps){
 const key=ps.round+':'+ps.goAt;if(viewKey!==key){viewKey=key;shownAt=null;painted=false;}
 const labels={green:'SINAL VERDE',fakeout:'FINTA',odd:'O DIFERENTE',color:'COR CERTA'};
 let body='<p class="party-kicker">'+labels[ps.variant]+'</p><p class="g-sub">Espere o sinal. Uma tentativa · reação medida no seu aparelho · faixas de 100 ms.</p>';
 if(ps.phase==='reveal')body+='<h2 class="g-title">COMO FOI?</h2>'+Object.entries(ps.hits).map(([id,r])=>'<article class="party-review"><b>'+C.name(id)+'</b><span>'+r.reason+(r.elapsed!==null?' · '+r.elapsed+' ms':'')+'</span><strong>+'+r.points+'</strong></article>').join('');
 else body+='<div id="reflex-board"><h2 id="reflex-cue">ESPERE O SINAL</h2><div class="reflex-targets '+((ps.variant==='green'||ps.variant==='fakeout')?'single':'')+'">'+Array.from({length:(ps.variant==='green'||ps.variant==='fakeout')?1:4},(_,i)=>'<button data-tap="'+i+'" aria-label="Alvo '+(i+1)+'" '+(ps.hits[PGHStore.playerId]?'disabled':'')+'>…</button>').join('')+'</div></div>'+(ps.hits[PGHStore.playerId]?'<p class="party-notice">'+ps.hits[PGHStore.playerId].reason+' · +'+ps.hits[PGHStore.playerId].points+'</p>':'');
 const root=C.shell(ps,'⚡ REFLEX RUSH',body);if(!root)return;
 root.querySelectorAll('[data-tap]').forEach(e=>e.addEventListener('pointerdown',ev=>{ev.preventDefault();if(e.disabled)return;GameManager.sendAction('reflex','tap',{choice:Number(e.dataset.tap),early:!painted,elapsed:shownAt===null?0:performance.now()-shownAt});}));animate(ps);
}
GameManager.register({id:'reflex',name:'Reflex Rush',tag:'★ REFLEX ★',icon:'⚡',desc:'Verde, finta, diferença e cor — uma tentativa',players:'2–12 · reação',minPlayers:2,maxPlayers:12,createInitialState,hostAction,hostTick,getPublicState,render,tickUI:C.clock,cleanup(){cancelAnimationFrame(frame);frame=null;viewKey='';shownAt=null;painted=false;}});
})();
