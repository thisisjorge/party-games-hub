/* STOP: private drafts, five distinct categories, timed peer review. */
(function(){
'use strict';
const C=PGHParty,categories=['NOME','ANIMAL','COMIDA','LUGAR','OBJETO','PROFISSÃO','PERSONAGEM','MARCA','FILME OU SÉRIE','VERBO'];
function begin(st){st.phase='writing';st.letter=st.letters[st.round-1];st.categories=C.shuffle(categories).slice(0,5);st.answers={};st.ready={};st.challenges={};st.category=0;st.review=[];st.endsAt=Date.now()+60000;st.stopper=null;}
function createInitialState(ids,opts){const st={ids,round:1,rounds:opts?.short?1:3,scores:Object.fromEntries(ids.map(id=>[id,0])),letters:C.shuffle('ABCDEFGILMNOPRSTV'.split(''))};begin(st);return st;}
const clean=a=>Array.from({length:5},(_,i)=>String(a?.[i]||'').trim().slice(0,48));
const valid=(s,st)=>/^[A-Z]/.test(C.norm(s))&&C.norm(s).startsWith(st.letter)&&C.norm(s).length>=2;
function hostAction(st,id,action,v,h){
 if(!C.active(st).includes(id)||Date.now()>st.endsAt)return;
 if((st.phase==='writing'||st.phase==='grace')&&(action==='draft'||action==='stop')){
  st.answers[id]=clean(v?.answers);const n=st.answers[id].filter(a=>valid(a,st)).length,changed=st.ready[id]!==n;st.ready[id]=n;
  if(action==='stop'&&n>=4&&st.phase==='writing'){st.phase='grace';st.endsAt=Date.now()+5000;st.stopper=id;h.broadcastState();}else if(changed)h.broadcastState();
 }else if(st.phase==='review'&&action==='challenge'){
  const owner=v?.owner;if(!st.ids.includes(owner)||owner===id||!valid(st.answers[owner]?.[st.category],st))return;
  st.challenges[owner]||={};st.challenges[owner][id]=false;h.broadcastState();
 }else if(st.phase==='review'&&action==='judge'){
  const owner=v?.owner;if(owner===id||!st.challenges[owner]||typeof v?.accept!=='boolean')return;
  st.challenges[owner][id]=v.accept;h.broadcastState();
 }
}
function scoreCategory(st){
 const accepted={};st.ids.forEach(id=>{const voters=C.active(st).filter(x=>x!==id),no=voters.filter(x=>st.challenges[id]?.[x]===false).length;accepted[id]=valid(st.answers[id]?.[st.category],st)&&no<=voters.length/2;});
 const rows=st.ids.map(id=>{const answer=st.answers[id]?.[st.category]||'',duplicate=st.ids.some(other=>other!==id&&accepted[other]&&C.norm(st.answers[other]?.[st.category])===C.norm(answer)),points=accepted[id]?(duplicate?5:10):0;st.scores[id]+=points;return {id,answer,points};});st.review.push({category:st.categories[st.category],rows});
}
function hostTick(st,h){
 if(!st||st.phase==='ended'||Date.now()<=st.endsAt)return;
 if(st.phase==='writing'||st.phase==='grace'){st.phase='review';st.endsAt=Date.now()+18000;}
 else if(st.phase==='review'){scoreCategory(st);st.category++;st.challenges={};if(st.category<5)st.endsAt=Date.now()+18000;else{st.phase='roundResult';st.endsAt=Date.now()+9000;}}
 else if(st.phase==='roundResult'){if(st.round>=st.rounds){st.phase='ended';h.finish(C.scores(st),{rounds:st.rounds});return;}st.round++;begin(st);}h.broadcastState();
}
function getPublicState(st){
 const ps={phase:st.phase,round:st.round,rounds:st.rounds,letter:st.letter,categories:st.categories,scores:{...st.scores},ready:{...st.ready},endsAt:st.endsAt,stopper:st.stopper};
 if(st.phase==='review'){ps.category=st.category;ps.rows=st.ids.map(id=>({id,answer:st.answers[id]?.[st.category]||'',challenge:st.challenges[id]||null}));}
 if(st.phase==='roundResult')ps.review=st.review;return ps;
}
function render(ps){
 let body='<div class="party-letter">'+ps.letter+'</div>';
 if(ps.phase==='writing'||ps.phase==='grace'){
  body+='<p class="g-sub">'+(ps.stopper?C.name(ps.stopper)+' pediu STOP! Últimos 5 segundos.':'Preencha 4 categorias para pedir STOP. Acentos são aceitos.')+'</p><div class="stop-fields">'+ps.categories.map((c,i)=>'<label>'+C.esc(c)+'<input class="arcade-input" id="stop-'+ps.round+'-'+i+'" data-answer maxlength="48" autocomplete="off" placeholder="Começa com '+ps.letter+'"></label>').join('')+'</div>'+C.button('stop-now','🛑 STOP!',ps.phase==='grace')+'<p class="g-sub">'+Object.entries(ps.ready).map(([id,n])=>C.name(id)+': '+n+'/5').join(' · ')+'</p>';
 }else if(ps.phase==='review'){
  body+='<h2 class="g-title">'+C.esc(ps.categories[ps.category])+' · '+(ps.category+1)+'/5</h2><p class="g-sub">Conteste respostas fora da categoria. Maioria dos outros jogadores rejeita; empate mantém. Única: 10 · repetida: 5.</p>';
  body+=ps.rows.map(r=>'<article class="party-review"><b>'+C.name(r.id)+'</b><span>'+C.esc(r.answer||'—')+'</span>'+(r.id===PGHStore.playerId?'':r.challenge?'<div><button class="btn-arcade sm" data-judge="'+r.id+'" data-accept="true">Vale ✓</button><button class="btn-arcade sm" data-judge="'+r.id+'" data-accept="false">Não vale ×</button></div>':'<button class="btn-arcade ghost sm" data-challenge="'+r.id+'">Contestar</button>')+(r.challenge?'<small>Votos: '+Object.values(r.challenge).filter(Boolean).length+' sim / '+Object.values(r.challenge).filter(v=>!v).length+' não</small>':'')+'</article>').join('');
 }else if(ps.phase==='roundResult')body+='<h2 class="g-title">PONTOS DA RODADA</h2>'+ps.review.map(c=>'<details><summary>'+C.esc(c.category)+'</summary>'+c.rows.map(r=>'<p>'+C.name(r.id)+' · '+C.esc(r.answer||'—')+' · +'+r.points+'</p>').join('')+'</details>').join('');
 const root=C.shell(ps,'🛑 STOP!',body);if(!root)return;
 const send=action=>GameManager.sendAction('stop',action,{answers:Array.from(root.querySelectorAll('[data-answer]'),e=>e.value)});
 root.querySelectorAll('[data-answer]').forEach(e=>e.addEventListener('input',()=>send('draft')));
 root.querySelector('#stop-now')?.addEventListener('click',()=>send('stop'));
 root.querySelectorAll('[data-challenge]').forEach(e=>e.onclick=()=>GameManager.sendAction('stop','challenge',{owner:e.dataset.challenge}));
 root.querySelectorAll('[data-judge]').forEach(e=>e.onclick=()=>GameManager.sendAction('stop','judge',{owner:e.dataset.judge,accept:e.dataset.accept==='true'}));
}
GameManager.register({id:'stop',name:'STOP!',tag:'★ STOP ★',icon:'🛑',desc:'5 categorias, respostas privadas e revisão da sala',players:'2–8 · social',minPlayers:2,maxPlayers:8,createInitialState,hostAction,hostTick,getPublicState,render,tickUI:C.clock,cleanup(){}});
})();
