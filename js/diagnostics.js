(function(){
'use strict';const events=[];
function record(kind,message){events.push({at:new Date().toISOString(),kind,message:String(message).slice(0,180)});if(events.length>30)events.shift();}
window.addEventListener('error',e=>record('error',e.message||'Falha ao carregar recurso'));
window.addEventListener('unhandledrejection',e=>record('promise',e.reason?.message||e.reason));
window.PGHDiagnostics={snapshot:()=>({version:PGH_CONFIG.version,at:new Date().toISOString(),screen:PGHStore.screen,game:GameManager.current,phase:PGHStore.gamePhase,host:PGHStore.isHost,players:PGHStore.players.filter(p=>p.connected).length,ping:PGHStore.pingMs,viewport:[innerWidth,innerHeight],online:navigator.onLine,events:events.slice()})};
const b=document.createElement('button');b.className='rc-version';b.textContent='RC1 · diagnóstico';b.title='Copiar versão e informações de diagnóstico';b.onclick=async()=>{const value=JSON.stringify(PGHDiagnostics.snapshot(),null,2);try{await navigator.clipboard.writeText(value);UI.toast('Diagnóstico copiado','success');}catch(e){const modal=UI.openModal('<h3>Diagnóstico RC1</h3><textarea id="diag-copy" readonly style="width:100%;height:260px"></textarea><button id="diag-close" class="btn-arcade">FECHAR</button>');modal.querySelector('textarea').value=value;modal.querySelector('button').onclick=()=>UI.closeModal();}};document.body.appendChild(b);
})();
