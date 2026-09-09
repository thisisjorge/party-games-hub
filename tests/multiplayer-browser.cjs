const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=process.env.JG_QA_OUT||path.join(__dirname,'results');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:process.env.JG_BROWSER_CHANNEL||'msedge',headless:true});
 const errors=[],report={};
 try{
  async function player(name){const ctx=await browser.newContext({viewport:{width:1366,height:768},ignoreHTTPSErrors:true});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.JG_URL||'http://127.0.0.1:8080',{waitUntil:'domcontentloaded'});await p.locator('#profile-nickname').fill(name);await p.locator('#btn-create-profile').click();return p;}
  const host=await player('Host QA');await host.locator('#btn-create-room').click();await host.locator('#rc-enter').click({timeout:30000});
  const code=await host.locator('#lobby-room-code').innerText();const client=await player('Client QA');await client.locator('#btn-join-room').click();await client.locator('#join-modal-input').fill(code);await client.locator('#join-go').click();
  await host.waitForFunction(()=>PGHStore.players.filter(p=>p.connected).length===2);
  await client.locator('#screen-lobby.active').waitFor();report.realPeerConnection=true;
  await client.locator('#btn-ready').click();await host.locator('#machines-grid [data-game="jungle"]').click();await host.locator('#btn-start-game').click();
  await Promise.all([host.locator('.jg-options').waitFor(),client.locator('.jg-options').waitFor()]);
  const h=await host.evaluate(()=>GameManager.publicState),c=await client.evaluate(()=>GameManager.publicState);
  assert.deepEqual(c,h);assert.equal(Object.keys(h.scenario.state.actors).length,10);assert.ok(!JSON.stringify(h).includes('realPosition'));report.identicalPublicState=true;
  assert.equal(await client.evaluate(()=>PGHDebug.hostState()),null);report.clientHasNoHostState=true;
  await host.screenshot({path:path.join(out,'multiplayer-host.png'),fullPage:true});await client.screenshot({path:path.join(out,'multiplayer-client.png'),fullPage:true});
  await client.locator('.jg-opt').nth(1).click();await host.waitForFunction(()=>GameManager.publicState.answeredCount===1);
  assert.equal(await client.locator('.jg-opt:disabled').count(),4);report.clientVoteLocked=true;
  await host.locator('.jg-opt').nth(0).click();await host.waitForFunction(()=>GameManager.publicState.phase==='reveal');await client.waitForFunction(()=>GameManager.publicState.phase==='reveal');
  await host.evaluate(()=>PGHDebug.fastForward());await host.waitForFunction(()=>GameManager.publicState.phase==='verdict');await client.waitForFunction(()=>GameManager.publicState.phase==='verdict');
  assert.deepEqual(await host.evaluate(()=>GameManager.publicState.scores),await client.evaluate(()=>GameManager.publicState.scores));report.synchronizedVerdict=true;
  await host.evaluate(()=>PGHDebug.fastForward());await host.waitForFunction(()=>GameManager.publicState.phase==='question');await client.waitForFunction(()=>GameManager.publicState.phase==='question');
  assert.equal(await client.locator('.jg-opt:not(:disabled)').count(),4);report.nextRoundReset=true;
  report.errors=errors;assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'multiplayer.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
