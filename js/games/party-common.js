/* Shared presentation and round helpers. */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim().replace(/\s+/g,' ');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const active=st=>st.ids.filter(id=>{const p=PGHHelpers.getPlayer(id);return p&&p.connected;});
const name=id=>esc(PGHHelpers.getPlayer(id)?.nickname||'Jogador');
const scores=st=>st.ids.map(playerId=>({playerId,points:st.scores[playerId]||0})).sort((a,b)=>b.points-a.points);
function clock(ps){const el=document.getElementById('party-time');if(el)el.textContent=Math.ceil(Math.max(0,ps.endsAt-PGHHelpers.hostTime())/1000)+'s';}
function shell(ps,title,body){
 const root=document.getElementById('game-root');if(!root)return;
 const focused=document.activeElement,id=focused?.id,pos=focused?.selectionStart,draft={};
 root.querySelectorAll('input,textarea').forEach(e=>{if(e.id)draft[e.id]=e.value;});
 root.innerHTML='<section class="party-game"><div class="party-heading"><div><div class="g-title">'+title+'</div><div class="g-sub">RODADA '+ps.round+' / '+ps.rounds+'</div></div><strong id="party-time"></strong></div>'+body+'<div class="party-scores">'+Object.entries(ps.scores).map(([id,v])=>'<span>'+name(id)+' <b>'+v+'</b></span>').join('')+'</div></section>';
 root.querySelectorAll('input,textarea').forEach(e=>{if(draft[e.id]!==undefined)e.value=draft[e.id];});
 const next=id&&document.getElementById(id);if(next){next.focus({preventScroll:true});if(pos!==null&&next.setSelectionRange)next.setSelectionRange(pos,pos);}
 clock(ps);return root;
}
const button=(id,label,disabled=false)=>'<button class="btn-arcade primary" id="'+id+'" '+(disabled?'disabled':'')+'>'+label+'</button>';
window.PGHParty={esc,norm,shuffle,active,name,scores,clock,shell,button};
})();
