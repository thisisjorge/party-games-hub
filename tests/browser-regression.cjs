const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=process.env.JG_QA_OUT||path.join(__dirname,'results');fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({channel:process.env.JG_BROWSER_CHANNEL||'msedge',headless:true});const report={cases:[],errors:[],failedRequests:[]};
try{
 const page=await browser.newPage({viewport:{width:1280,height:720},ignoreHTTPSErrors:true});page.on('pageerror',e=>report.errors.push(e.message));page.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()}));
 await page.goto(process.env.JG_URL||'http://127.0.0.1:8080',{waitUntil:'domcontentloaded'});await page.locator('#profile-nickname').waitFor();
 await page.addScriptTag({url:'/tests/jungle-fixtures.js'});await page.addScriptTag({url:'/tests/structure-fixtures.js'});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(['assets/maps/terrain-base.png',...new Set(Object.values(PGH_JUNGLE_STRUCTURES.anchors).map(a=>a.asset))].map(src=>new Promise((resolve,reject)=>{const i=new Image;i.onload=resolve;i.onerror=()=>reject(new Error(src));i.src=src;})));});
 await page.addStyleTag({content:'*,*::before,*::after{animation-duration:0s!important;transition:none!important}'});
 const count=await page.evaluate(()=>{window.qaCases=[...JG_FIXTURES.cases,...JG_STRUCTURE_FIXTURES,...PGH_JUNGLE];return qaCases.length;});
 for(const size of [{width:1366,height:768},{width:1280,height:720},{width:390,height:844}]){
  await page.setViewportSize(size);
  for(let i=0;i<count;i++){
   const row=await page.evaluate(index=>{
    const sc=qaCases[index],g=GameManager.get('jungle'),st=g.createInitialState([],{});st.scenarios=[sc];st.roundIndex=0;st.rounds=1;st.roundEndsAt=Date.now()+3600000;
    UI.showScreen('game');document.querySelector('#game-name-tag').textContent='JUNGLE GAP';const pub=g.getPublicState(st);g.render(pub);
    const v=PGH_SCENARIO_STATE.buildJungleScenarioViewModel(pub.scenario),root=document.querySelector('#game-root'),nodes=[...root.querySelectorAll('.jg-layer-actors [data-actor-id]')],cards=[...root.querySelectorAll('.jg-actor-row')],errors=[];
    if(nodes.length!==v.mapActors.length)errors.push('actor count');if(cards.length!==10)errors.push('card count');
    for(const a of Object.values(v.actors)){
      const card=cards.filter(e=>e.dataset.actorId===a.id);if(card.length!==1||card[0].dataset.state!==a.state||!card[0].innerText.includes(a.cardLabel))errors.push(a.id+' card mismatch');
      const ns=nodes.filter(n=>n.dataset.actorId===a.id);if(a.positionMode==='UNKNOWN'){if(ns.length)errors.push(a.id+' fog/dead leak');continue;}
      if(ns.length!==1){errors.push(a.id+' missing/duplicate');continue;}
      const el=ns[0];if(el.dataset.state!==a.state||+el.dataset.x!==a.renderX||+el.dataset.y!==a.renderY)errors.push(a.id+' position mismatch');
      const c=el.querySelector('circle');if(Math.abs(+c.getAttribute('cx')-a.renderX*1000)>.01||Math.abs(+c.getAttribute('cy')-a.renderY*1000)>.01)errors.push(a.id+' painted position mismatch');
    }
    const structureNodes=[...root.querySelectorAll('[data-structure-id]')];
    if(structureNodes.length!==Object.values(v.structures).filter(s=>s.state!=='DESTROYED').length)errors.push('structure count');
    for(const s of Object.values(v.structures)){
      const ns=structureNodes.filter(n=>n.dataset.structureId===s.id);if(s.state==='DESTROYED'){if(ns.length)errors.push(s.id+' destroyed still rendered');continue;}
      if(ns.length!==1||+ns[0].dataset.x!==s.x||+ns[0].dataset.y!==s.y)errors.push(s.id+' anchor drift');
    }
    if(root.querySelectorAll('.wave-marker').length!==6)errors.push('waves missing');
    const map=root.querySelector('.jg-map'),plane=root.querySelector('.jg-map-plane'),r=map.getBoundingClientRect(),p=plane.getBoundingClientRect();
    if(p.bottom>r.bottom+.5||p.right>r.right+.5||Math.abs(p.width-p.height)>1)errors.push('map clipped/stretched');
    if(document.documentElement.scrollWidth>innerWidth)errors.push('horizontal overflow');
    const bottom=root.querySelector('.jg-options').getBoundingClientRect().bottom;
    if(innerWidth>900&&bottom>innerHeight)errors.push('options below viewport '+bottom);
    if(root.querySelector('.jg-data-error'))errors.push('renderer failure');
    return {id:sc.id,width:innerWidth,actors:nodes.length,lastSeen:v.lastSeenActors.length,structures:structureNodes.length,optionsBottom:bottom,errors};
   },i);
   report.cases.push(row);
   if(!process.env.JG_NO_SHOTS&&(size.width===1280||['support-roam','mid-rotation','objective-trade','jg-42'].includes(row.id)))await page.screenshot({path:path.join(out,`${row.id}-${size.width}.png`),fullPage:true});
  }
 }
 report.passed=report.cases.filter(c=>!c.errors.length).length;fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log({cases:report.cases.length,passed:report.passed,failures:report.cases.filter(c=>c.errors.length),errors:report.errors});
 assert.deepEqual(report.errors,[]);assert.equal(report.passed,report.cases.length);
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
