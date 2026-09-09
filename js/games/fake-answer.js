(function(){
'use strict';const C=PGHParty;
function begin(st){st.phase='writing';st.question=st.deck[st.round-1];st.fakes={};st.votes={};st.options=[];st.endsAt=Date.now()+45000;}
function createInitialState(ids,opts){const st={ids,round:1,rounds:opts?.short?1:3,scores:Object.fromEntries(ids.map(id=>[id,0])),deck:C.shuffle(PGH_FAKE_QUESTIONS)};begin(st);return st;}
function votePhase(st,h){
 const grouped=[{text:st.question.a,truth:true,owners:[]}];
 Object.entries(st.fakes).forEach(([id,text])=>{let opt=grouped.find(o=>C.norm(o.text)===C.norm(text));if(!opt){opt={text,truth:false,owners:[]};grouped.push(opt);}opt.owners.push(id);});
 // One shuffle, opaque IDs independent of truth and authorship.
 st.options=C.shuffle(grouped).map((o,i)=>({...o,id:'choice-'+i}));st.phase='voting';st.endsAt=Date.now()+25000;h.broadcastState();
}
function reveal(st,h){
 const events=[];Object.entries(st.votes).forEach(([id,key])=>{const opt=st.options.find(o=>o.id===key);if(!opt)return;if(opt.truth){st.scores[id]+=500;events.push({voter:id,truth:true,owners:[],points:500});}else{opt.owners.forEach(owner=>st.scores[owner]+=300);events.push({voter:id,truth:false,owners:opt.owners,points:300});}});
 st.options.filter(o=>o.truth).forEach(o=>o.owners.forEach(id=>{st.scores[id]+=500;events.push({voter:id,truth:true,owners:[],points:500,wroteTruth:true});}));
 st.events=events;st.phase='reveal';st.endsAt=Date.now()+12000;h.broadcastState();
}
function hostAction(st,id,action,v,h){
 if(!C.active(st).includes(id)||Date.now()>st.endsAt)return;
 if(st.phase==='writing'&&action==='fake'&&st.fakes[id]===undefined){
  const answer=String(v?.answer||'').trim().replace(/\s+/g,' ').slice(0,80);if(answer.length<2){h.unicast(id,{ok:false,reason:'Escreva uma resposta com pelo menos 2 caracteres.'});return;}
  st.fakes[id]=answer;h.unicast(id,{ok:true});if(C.active(st).every(p=>st.fakes[p]!==undefined))votePhase(st,h);else h.broadcastState();
 }else if(st.phase==='voting'&&action==='vote'&&st.votes[id]===undefined){
  const opt=st.options.find(o=>o.id===v?.id);if(!opt||opt.owners.includes(id)){h.unicast(id,{ok:false,reason:'Escolha uma resposta que não seja a sua.'});return;}
  st.votes[id]=opt.id;h.unicast(id,{ok:true});if(C.active(st).every(p=>st.votes[p]!==undefined||st.options.every(o=>o.owners.includes(p))))reveal(st,h);else h.broadcastState();
 }
}
function hostTick(st,h){if(!st||st.phase==='ended'||Date.now()<=st.endsAt)return;if(st.phase==='writing')votePhase(st,h);else if(st.phase==='voting')reveal(st,h);else if(st.phase==='reveal'){if(st.round>=st.rounds){st.phase='ended';h.finish(C.scores(st),{});}else{st.round++;begin(st);h.broadcastState();}}}
function getPublicState(st){
 const ps={phase:st.phase,round:st.round,rounds:st.rounds,question:st.question.q,endsAt:st.endsAt,scores:{...st.scores},submitted:Object.keys(st.fakes),voted:Object.keys(st.votes)};
 if(st.phase==='voting')ps.options=st.options.map(o=>({id:o.id,text:o.text}));
 if(st.phase==='reveal'){ps.options=st.options;ps.events=st.events;ps.truth=st.question.a;ps.source=st.question.source;}return ps;
}
function render(ps){
 let body='<p class="party-kicker">EDIÇÃO COSMOS · BLEFE ENTRE AMIGOS</p><h2 class="party-question">'+C.esc(ps.question)+'</h2>';
 if(ps.phase==='writing')body+=ps.submitted.includes(PGHStore.playerId)?'<p class="party-notice">Resposta guardada. '+ps.submitted.length+' enviadas.</p>':'<p>Invente algo convincente. +300 por pessoa enganada · +500 por acertar.</p><form id="fake-form"><label for="fake-'+ps.round+'">Sua resposta falsa</label><input id="fake-'+ps.round+'" class="arcade-input" maxlength="80" autocomplete="off" required minlength="2">'+C.button('fake-send','GUARDAR BLEFE')+'</form>';
 if(ps.phase==='voting')body+='<p>Encontre a verdadeira. A autoria só aparece no final.</p><div class="party-options">'+ps.options.map(o=>'<button class="btn-arcade" data-choice="'+o.id+'" '+(ps.voted.includes(PGHStore.playerId)?'disabled':'')+'>'+C.esc(o.text)+'</button>').join('')+'</div>'+(ps.voted.includes(PGHStore.playerId)?'<p>Voto confirmado ✓</p>':'');
 if(ps.phase==='reveal')body+='<div class="party-notice">VERDADE: <b>'+C.esc(ps.truth)+'</b> · <a href="'+C.esc(ps.source)+'" target="_blank" rel="noopener">Fonte: NASA</a></div>'+ps.options.map(o=>'<article class="party-review"><b>'+C.esc(o.text)+'</b><span>'+(o.truth?'VERDADE':o.owners.map(C.name).join(' + '))+'</span></article>').join('')+ps.events.map(e=>'<p>'+C.name(e.voter)+(e.truth?(e.wroteTruth?' escreveu a verdade! +500':' acertou! +500'):' caiu no blefe de '+e.owners.map(C.name).join(' + ')+' · +300 para cada autor')+'</p>').join('');
 const root=C.shell(ps,'🎭 FAKE ANSWER',body);if(!root)return;
 root.querySelector('#fake-form')?.addEventListener('submit',e=>{e.preventDefault();GameManager.sendAction('fake','fake',{answer:root.querySelector('input').value});});
 root.querySelectorAll('[data-choice]').forEach(e=>e.onclick=()=>GameManager.sendAction('fake','vote',{id:e.dataset.choice}));
}
GameManager.register({id:'fake',name:'Fake Answer',tag:'★ FAKE ★',icon:'🎭',desc:'Blefe, encontre a verdade e descubra quem caiu',players:'3–12 · social',minPlayers:3,maxPlayers:12,createInitialState,hostAction,hostTick,getPublicState,render,tickUI:C.clock,onActionResult(p){if(!p.ok)UI.toast(p.reason,'warn');},cleanup(){}});
})();
