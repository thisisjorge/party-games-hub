(function(){
'use strict';const g=PGH_SOLO_GAME,$=id=>document.getElementById(id);let state=null,run=0,seed='',mode='',pending=false,lastResult=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function deck(s){let n=2166136261;for(const ch of s)n=Math.imul(n^ch.charCodeAt(0),16777619);const random=()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};const pool=PGH_JUNGLE.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,5);}
function helpers(){const generation=run;return {unicast(id,p){g.onActionResult(p);},broadcastState(){if(generation!==run)return;GameManager.publicState=g.getPublicState(state);schedule();},finish(standings){if(generation===run)finish(standings);}};}
function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;if(state)paint();});}
function paint(){
 if(state.phase==='ended')return;const ps=GameManager.publicState;g.render(ps);$('solo-score').textContent=state.scores.solo+' PTS';
 if(state.phase==='verdict'){$('jg-timer').textContent='✓';$('jg-bar').style.width='100%';$('solo-controls').innerHTML='<button id="solo-next" class="btn-arcade primary">'+(state.roundIndex===4?'VER RESULTADO':'PRÓXIMA SITUAÇÃO')+' →</button>';$('solo-next').onclick=next;}
 else $('solo-controls').innerHTML='';
}
function start(s,kind){
 run++;g.cleanup();seed=s;mode=kind;lastResult=null;state=g.createInitialState(['solo'],{scenarios:deck(s)});GameManager.publicState=g.getPublicState(state);
 $('solo-landing').hidden=true;$('solo-session').hidden=false;$('solo-mode').textContent=kind==='daily'?'DESAFIO DO DIA':kind==='challenge'?'DESAFIO COMPARTILHADO':'TREINO LIVRE';paint();window.scrollTo(0,0);
}
function settle(){if(state?.phase==='reveal'){state.roundEndsAt=Date.now()-1;g.hostTick(state,helpers());}}
function act(action,value){if(!state||state.phase!=='question')return;g.hostAction(state,'solo',action,value,helpers());settle();schedule();}
function next(){if(state?.phase!=='verdict')return;state.roundEndsAt=Date.now()-1;g.hostTick(state,helpers());window.scrollTo(0,0);}
function finish(standings){
 const score=standings[0]?.points||0,greats=standings[0]?.greats||0;lastResult={score,greats,seed,mode};
 try{const key='jg-solo-results-v1',history=JSON.parse(localStorage.getItem(key)||'{}');if(!history[seed]||history[seed].score<score)history[seed]={score,greats,date:new Date().toISOString()};const recent=Object.entries(history).slice(-100);localStorage.setItem(key,JSON.stringify(Object.fromEntries(recent)));}catch(e){}
 $('game-root').innerHTML='<div class="solo-results"><p class="solo-eyebrow">'+(mode==='daily'?'DESAFIO DO DIA CONCLUÍDO':'TREINO CONCLUÍDO')+'</p><h1>'+greats+' / 5 MELHORES CALLS</h1><div class="solo-final-score">'+score+' <small>/ 5000</small></div><p>'+ (greats>=4?'Boa leitura de mapa. Agora teste outra sequência.':greats>=2?'Você encontrou boas janelas. Revise o custo das jogadas arriscadas.':'Cada erro mostrou uma pista. Tente de novo e observe a prioridade das lanes.')+'</p><div class="solo-result-actions"><button id="solo-retry" class="btn-arcade primary">'+(mode==='daily'?'CONTINUAR NO TREINO LIVRE':'MAIS 5 SITUAÇÕES')+'</button><button id="solo-share" class="btn-arcade ghost">COMPARTILHAR DESAFIO</button><button id="solo-result-home" class="btn-arcade ghost">VOLTAR AOS MODOS</button></div><div id="solo-share-text"></div></div>';$('solo-controls').innerHTML='';$('solo-retry').onclick=()=>start(randomSeed(),'training');$('solo-share').onclick=share;$('solo-result-home').onclick=home;refreshMenu();
}
async function share(){const url=new URL(location.href);url.search='';url.searchParams.set('challenge',seed);const text='Jungle Gap · '+lastResult.score+'/5000 · '+lastResult.greats+'/5 Best Calls\nConsegue superar? Mesmos cinco cenários:\n'+url.href;try{await navigator.clipboard.writeText(text);$('solo-feedback').textContent='Desafio copiado!';}catch(e){$('solo-share-text').innerHTML='<label>Copie e compartilhe<textarea readonly>'+esc(text)+'</textarea></label>';}}
function randomSeed(){return 't-'+Array.from(crypto.getRandomValues(new Uint32Array(2)),n=>n.toString(36)).join('');}
function daySeed(){return 'd-'+new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function refreshMenu(){let best=null;try{best=JSON.parse(localStorage.getItem('jg-solo-results-v1')||'{}')[daySeed()];}catch(e){}$('solo-date').textContent=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Fortaleza',day:'2-digit',month:'short',year:'numeric'}).format(new Date()).replaceAll('.','').toUpperCase();$('solo-best').textContent=(best?best.score:'—')+' / 5000';$('solo-daily-label').textContent=best?'REJOGAR DESAFIO':'JOGAR DESAFIO';$('solo-landing').classList.toggle('daily-done',!!best);$('solo-daily-note').textContent=best?'Desafio concluído. Continue no treino ou tente melhorar sua pontuação.':'O mesmo desafio para todo mundo. Renova à meia-noite (Brasília).';}
function home(){refreshMenu();run++;state=null;g.cleanup();$('solo-session').hidden=true;$('solo-landing').hidden=false;$('solo-controls').innerHTML='';window.scrollTo(0,0);}
window.JungleSolo={act,start,deck,get state(){return state;},get result(){return lastResult;}};
const preview=g.createInitialState(['solo'],{scenarios:[PGH_JUNGLE[41]]});GameManager.publicState=g.getPublicState(preview);g.render(GameManager.publicState);$('solo-preview').innerHTML=document.querySelector('.jg-map')?.innerHTML||'';$('game-root').innerHTML='';g.cleanup();
if(PGH_CONFIG.hubUrl)$('solo-hub').href=PGH_CONFIG.hubUrl;
refreshMenu();$('solo-practice').onclick=()=>start(randomSeed(),'training');$('solo-start').onclick=()=>start(randomSeed(),'training');$('solo-daily').onclick=()=>start(daySeed(),'daily');$('solo-exit').onclick=home;
const challenge=new URLSearchParams(location.search).get('challenge');if(challenge&&/^[a-zA-Z0-9-]{1,40}$/.test(challenge))start(challenge,'challenge');
setInterval(()=>{if(state?.phase==='question'){g.hostTick(state,helpers());settle();g.tickUI(GameManager.publicState);}},100);
})();
