const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.JG_QA_OUT||path.resolve(__dirname,'../../refinement/network');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],report={players:3,rounds:[]};try{
 async function player(name,mobile=false){const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:768},ignoreHTTPSErrors:true});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.HUB_URL||'http://127.0.0.1:8080',{waitUntil:'domcontentloaded'});await p.locator('#profile-nickname').fill(name);await p.locator('#profile-nickname').press('Enter');await p.locator('#screen-home.active').waitFor();return p;}
 const host=await player('Teste JG'),guest=await player('Convidado JG'),mobile=await player('Mobile JG',true),pages=[host,guest,mobile];
 await host.locator('#btn-create-room').click();await host.locator('#rc-enter').click();const code=await host.locator('#lobby-room-code').innerText();
 for(const p of [guest,mobile]){await p.locator('#btn-join-room').click();await p.locator('#join-modal-input').fill(code);await p.locator('#join-go').click();await p.locator('#screen-lobby.active').waitFor();await p.locator('#btn-ready').click();}
 await host.waitForFunction(()=>PGHStore.players.filter(p=>p.connected).length===3);await host.locator('#machines-grid [data-game="jungle"]').click();await host.locator('#btn-start-game').click();
 const phase=value=>Promise.all(pages.map(p=>p.waitForFunction(v=>GameManager.publicState?.phase===v,value)));
 const ff=()=>host.evaluate(()=>PGHDebug.fastForward());
 for(let round=0;round<5;round++){
  await phase('question');const states=await Promise.all(pages.map(p=>p.evaluate(()=>({id:GameManager.publicState.scenario.id,round:GameManager.publicState.roundIndex,ms:GameManager.publicState.questionMs,portraits:document.querySelectorAll('.jg-layer-actors image').length,camps:document.querySelectorAll('#game-root [data-camp-id]').length,noLeak:GameManager.publicState.scenario.opts.every(o=>typeof o==='string')}))));
  assert.ok(states.every(s=>s.id===states[0].id&&s.round===round&&s.ms===50000&&s.portraits>0&&s.camps===12&&s.noLeak));report.rounds.push(states);
  if(round===0){await host.screenshot({path:path.join(out,'hub-desktop.png'),fullPage:true});await mobile.screenshot({path:path.join(out,'hub-mobile.png'),fullPage:true});}
  for(const p of pages)await p.locator('.jg-opt').first().click();await phase('reveal');await ff();await phase('verdict');await ff();
 }
 await Promise.all(pages.map(p=>p.waitForFunction(()=>PGHStore.gamePhase==='ended')));
 const scores=await host.evaluate(()=>PGHStore.players.map(p=>p.sessionScore));await guest.waitForFunction(scores=>JSON.stringify(PGHStore.players.map(p=>p.sessionScore))===JSON.stringify(scores),scores);await host.screenshot({path:path.join(out,'hub-result.png'),fullPage:true});report.synchronizedScores=scores;
 await host.locator('#btn-tolobby').click();await Promise.all(pages.map(p=>p.locator('#screen-lobby.active').waitFor()));report.returnToLobby=true;
 await host.evaluate(()=>Rooms.leaveRoom());assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(path.join(out,'network.json'),JSON.stringify(report,null,2));console.log({realPeers:3,rounds:5,roundSeconds:50,synchronizedScores:true,errors});
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
