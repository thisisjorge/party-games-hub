const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=process.env.HUB_QA_OUT||path.join(__dirname,'results-responsive');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const errors=[],results=[];try{
 const p=await b.newPage({ignoreHTTPSErrors:true});p.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1920,1080],[1536,864],[1366,768],[1280,720],[430,932],[390,844],[360,800]]){
  await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:8080/jungle.html');await p.screenshot({path:path.join(out,`solo-landing-${width}.png`),fullPage:true});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'landing overflow '+width);
  await p.locator('#solo-daily').click();const seed=await p.evaluate(()=>JungleSolo.state.scenarios.map(s=>s.id));
  for(let i=0;i<5;i++){if(i===0){await p.screenshot({path:path.join(out,`solo-play-${width}.png`),fullPage:true});assert.equal(await p.locator('.jg-opt').count(),4);}await p.locator('.jg-opt').first().click();await p.locator('#solo-next').waitFor();if(i===0)await p.screenshot({path:path.join(out,`solo-verdict-${width}.png`),fullPage:true});await p.locator('#solo-next').click();}
  await p.locator('#solo-share').waitFor();assert.ok(await p.evaluate(()=>JungleSolo.result&&Number.isFinite(JungleSolo.result.score)),'solo result');await p.screenshot({path:path.join(out,`solo-result-${width}.png`),fullPage:true});await p.locator('#solo-share').click();const challenge=await p.evaluate(()=>JungleSolo.result.seed);await p.goto('http://127.0.0.1:8080/jungle.html?challenge='+challenge);assert.deepEqual(await p.evaluate(()=>JungleSolo.state.scenarios.map(s=>s.id)),seed,'shared deterministic sequence');
  await p.goto('http://127.0.0.1:8080');await p.waitForFunction(()=>window.GameManager&&window.Rooms);await p.waitForTimeout(2300);
  await p.evaluate(()=>{PGHStore.profile={nickname:'Visual QA',avatar:'',character:null,level:1};PGHStore.settings={reducedEffects:true};PGHStore.playerId='a';PGHStore.isHost=true;PGHStore.roomCode='QA123';PGHStore.players=['a','b','c'].map(id=>({id,nickname:'Jogador '+id,connected:true,ready:true,sessionScore:0}));});
  for(const id of ['wordbomb','termo','riftle','jungle','stop','fake','reflex']){
   await p.evaluate(id=>{GameManager.list().forEach(g=>g.cleanup?.());PGHStore.gamePhase='playing';UI.showScreen('game');document.getElementById('game-layout').style.visibility='visible';const g=GameManager.get(id),s=g.createInitialState(['a','b','c'],{});g.render(g.getPublicState(s));},id);await p.waitForTimeout(100);
   const bounds=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,root:document.getElementById('game-root').getBoundingClientRect().width}));assert.ok(bounds.scroll<=width+1,`${id} ${width}: overflow ${bounds.scroll}`);await p.screenshot({path:path.join(out,`${id}-${width}.png`),fullPage:true});results.push({id,width,height,overflow:false});
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'responsive.json'),JSON.stringify({cases:results,soloViewports:7,soloFlows:7,errors},null,2));console.log({hubLayouts:results.length,soloFlows:7,errors});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
