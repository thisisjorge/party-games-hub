const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=process.env.HUB_QA_OUT||path.join(__dirname,'results-hub');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const errors=[],report={games:{},players:3};
try{
 async function player(name,mobile=false){const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:768},isMobile:mobile,hasTouch:mobile,ignoreHTTPSErrors:true});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8080',{waitUntil:'domcontentloaded'});await p.locator('#profile-nickname').fill(name);await p.locator('#profile-nickname').press('Enter');await p.locator('#screen-home.active').waitFor();return p;}
 const host=await player('Host RC1'),b=await player('Bia RC1'),c=await player('Caio RC1',true),pages=[host,b,c];
 await host.locator('#btn-create-room').click();await host.locator('#rc-enter').click({timeout:30000});const code=await host.locator('#lobby-room-code').innerText();
 for(const p of [b,c]){await p.locator('#btn-join-room').click();await p.locator('#join-modal-input').fill(code);await p.locator('#join-go').click();await p.locator('#screen-lobby.active').waitFor();await p.locator('#btn-ready').click();}
  await host.waitForFunction(()=>PGHStore.players.filter(p=>p.connected).length===3);report.realPeers=true;
  await b.evaluate(()=>{const original=GameManager.netHandler;GameManager.netHandler=function(msg){if(msg.type==='GAME_ENDED')window.lastEnd=msg;return original(msg);};});
 const ff=async()=>{await host.evaluate(()=>PGHDebug.fastForward());await host.waitForTimeout(180);};
 async function phase(value){await Promise.all(pages.map(p=>p.waitForFunction(v=>GameManager.publicState?.phase===v,value)));}
 async function shot(label){await host.screenshot({path:path.join(out,label+'-desktop.png'),fullPage:true,animations:'disabled',timeout:60000});await c.screenshot({path:path.join(out,label+'-mobile.png'),fullPage:true,animations:'disabled',timeout:60000});}
 for(const id of process.env.HUB_MIX_ONLY?[]:['stop','fake','reflex','termo','riftle','wordbomb','jungle']){
  await host.locator('#machines-grid [data-game="'+id+'"]').click();await host.locator('#btn-start-game').click();await host.waitForFunction(id=>GameManager.current===id&&PGHStore.gamePhase==='playing',id);await Promise.all(pages.map(p=>p.waitForFunction(id=>GameManager.current===id&&!!GameManager.publicState,id)));await shot(id+'-play');
  assert.equal(await b.evaluate(()=>PGHDebug.hostState()),null);
  if(id==='stop'){
   const letter=await host.evaluate(()=>GameManager.publicState.letter);
   for(const p of pages){for(let i=0;i<5;i++)await p.locator('[data-answer]').nth(i).fill(letter+' Resposta '+i);}
   const pub=await b.evaluate(()=>GameManager.publicState);assert.ok(!JSON.stringify(pub).includes('Resposta'));await c.locator('#stop-now').click();await phase('grace');await ff();await phase('review');await shot('stop-review');
  }else if(id==='fake'){
   assert.equal(await b.evaluate(()=>GameManager.publicState.options),undefined);
   for(const [i,p] of pages.entries()){await p.locator('#fake-form input').fill('Blefe secreto '+i);await p.locator('#fake-send').click();}
   await phase('voting');const opts=await b.evaluate(()=>GameManager.publicState.options);assert.ok(opts.every(o=>Object.keys(o).length===2));await shot('fake-vote');
   const real=await host.evaluate(()=>PGHDebug.hostState().options.find(o=>o.truth).id);for(const p of pages)await p.locator('[data-choice="'+real+'"]').click();await phase('reveal');await shot('fake-reveal');
  }else if(id==='reflex'){
   await c.locator('[data-tap]').first().dispatchEvent('pointerdown');await host.waitForFunction(()=>Object.keys(GameManager.publicState.hits).length===1);
   await host.waitForFunction(()=>PGHHelpers.hostTime()>GameManager.publicState.goAt+180);
   const target=await host.evaluate(()=>PGHDebug.hostState().target),variant=await host.evaluate(()=>GameManager.publicState.variant);
   for(const p of [host,b])await p.locator('[data-tap]').nth(['green','fakeout'].includes(variant)?0:target).dispatchEvent('pointerdown');await phase('reveal');await shot('reflex-reveal');
  }else if(id==='termo'){
   const secret=await host.evaluate(()=>PGHDebug.hostState().secret);
   for(const p of pages){for(const ch of secret)await p.locator('[data-k="'+ch+'"]').click();await p.locator('[data-k="ENTER"]').click();}
  }else if(id==='riftle'){
   const secret=await host.evaluate(()=>PGHDebug.hostState().secret.n);for(const p of pages){await p.locator('#rift-input').fill(secret);await p.locator('#rift-send').click();}
  }else if(id==='jungle'){
   for(let r=0;r<5;r++){await phase('question');for(const p of pages)await p.locator('.jg-opt').first().click();await phase('reveal');await ff();await phase('verdict');if(r===0)await shot('jungle-verdict');await ff();}
  }
  for(let i=0;i<100;i++){if(await host.evaluate(()=>PGHStore.gamePhase==='ended'))break;await ff();}
  await Promise.all(pages.map(p=>p.waitForFunction(()=>PGHStore.gamePhase==='ended')));await host.locator('#btn-again').waitFor();await shot(id+'-result');
  const hs=await host.evaluate(()=>PGHStore.players.map(p=>p.sessionScore));await b.waitForFunction(scores=>JSON.stringify(PGHStore.players.map(p=>p.sessionScore))===JSON.stringify(scores),hs);
  const duplicate=await b.evaluate(()=>{const before=JSON.stringify(PGHStore.profile);GameManager.netHandler(window.lastEnd);GameManager.netHandler(window.lastEnd);return before===JSON.stringify(PGHStore.profile);});assert.ok(duplicate,'duplicate result cannot reward again');
  assert.ok(await c.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' mobile overflow');report.games[id]={flow:'start/action/reveal/result/lobby',synchronizedScores:true};
  await host.locator('#btn-tolobby').click();await Promise.all(pages.map(p=>p.locator('#screen-lobby.active').waitFor()));
 }
 // Party Mix has five short slots and its own score baseline.
 await host.evaluate(()=>Daily.startMix());await host.waitForFunction(()=>PGHStore.gamePhase==='playing');
 assert.equal(await host.evaluate(()=>PGHStore.dailyMix.queue.length),5);
 for(let slot=0;slot<5;slot++){
  await host.waitForFunction(()=>PGHStore.gamePhase==='playing');
  for(let i=0;i<80;i++){if(await host.evaluate(()=>PGHStore.gamePhase==='ended'))break;await ff();}
  await host.waitForFunction(()=>PGHStore.gamePhase==='ended');
  if(slot<4){await host.locator('#btn-mixnext').click();}else{await host.locator('#btn-podium').click();await host.locator('#pod-lobby').waitFor();await shot('party-mix-podium');}
 }
 report.partyMixFiveRounds=true;
 const rewards=await b.evaluate(()=>({xp:PGHStore.profile.xp,tokens:PGHStore.profile.tokens}));await b.evaluate(()=>Daily.showPodium(false));assert.deepEqual(await b.evaluate(()=>({xp:PGHStore.profile.xp,tokens:PGHStore.profile.tokens})),rewards,'mix reward is once per day');report.dailyRewardIdempotent=true;
 await host.locator('#pod-lobby').click();await b.evaluate(()=>UI.closeModal());await c.evaluate(()=>UI.closeModal());await host.locator('#screen-lobby.active').waitFor();
 // Rematch and orderly client departure keep the same room usable.
 await host.locator('#machines-grid [data-game="termo"]').click();await host.locator('#btn-start-game').click();await host.waitForFunction(()=>PGHStore.gamePhase==='playing');await ff();await host.locator('#btn-again').waitFor();await host.locator('#btn-again').click();await host.waitForFunction(()=>PGHStore.gamePhase==='playing');report.rematch=true;
 await b.evaluate(()=>Net.peer.destroy());await host.waitForFunction(()=>PGHStore.gamePhase==='lobby',{},{timeout:30000});await b.locator('#screen-lobby.active').waitFor();report.reconnectCancelsRoundToLobby=true;
 await c.evaluate(()=>Rooms.leaveRoom());await host.waitForFunction(()=>PGHStore.players.filter(p=>p.connected).length===2);await host.evaluate(()=>GameManager.quitToLobby());await b.locator('#screen-lobby.active').waitFor();report.clientLeave=true;
 await host.evaluate(()=>Rooms.leaveRoom());await b.locator('#screen-home.active').waitFor();report.hostLeaveReturnsHome=true;
 report.errors=errors;assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'multiplayer.json'),JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
