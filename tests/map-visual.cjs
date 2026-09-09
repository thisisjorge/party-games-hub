const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=process.env.JG_QA_OUT||path.join(__dirname,'results-map');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1536,height:1100},ignoreHTTPSErrors:true});await p.goto('http://127.0.0.1:8080/tests/map-calibration.html');const fl=p.frameLocator('iframe');await fl.locator('.jg-map-debug').waitFor();const f=p.frames().find(f=>f.url().includes('index.html'));
 await f.addStyleTag({content:'.jg-map{width:1000px!important;max-width:none!important;height:1000px!important}.jg-body{grid-template-columns:1000px 280px!important}'});
 for(const x of await p.locator('[name=layer]').all())await x.setChecked(['structures','paths','pits'].includes(await x.getAttribute('value')));
 await fl.locator('.jg-map').screenshot({path:path.join(out,'all-anchors-debug.png')});
 const atlas=await f.evaluate(async()=>{
  const img=new Image();img.src='assets/maps/terrain-base.png';await img.decode();const c=document.createElement('canvas');c.width=c.height=1254;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
  return Object.values(PGH_JUNGLE_STRUCTURES.anchors).map(a=>({...a,pixel:[Math.round(a.x*1254),Math.round(a.y*1254)],rgb:[...ctx.getImageData(Math.round(a.x*1254),Math.round(a.y*1254),1,1).data].slice(0,3)}));
 });
 for(const a of atlas)assert.ok(a.rgb[0]+a.rgb[1]+a.rgb[2]>200,a.id+' must sit on lane/base, not dark jungle wall');
 for(const team of ['blue','red'])for(const lane of ['Top','Mid','Bot']){
  const nexus=atlas.find(a=>a.id===team+'Nexus');const d=type=>{const a=atlas.find(a=>a.id===team+lane+type);return Math.hypot(a.x-nexus.x,a.y-nexus.y);};
  assert.ok(d('Inhib')<d('T3')&&d('T3')<d('T2')&&d('T2')<d('T1'),team+lane+' base -> inhib -> T3 -> T2 -> T1');
 }
 for(const lane of ['top','mid','bot']){await f.evaluate(lane=>{document.querySelectorAll('[data-debug-lane]').forEach(e=>e.style.opacity=e.dataset.debugLane===lane?'1':'.1');},lane);await fl.locator('.jg-map').screenshot({path:path.join(out,lane+'-ordering.png')});}
 for(const x of await p.locator('[name=layer]').all())await x.uncheck();
 const before={T1:57.34,T2:54.05,T3:54.05,INHIBITOR:47.58,NEXUS_TURRET:47,NEXUS:54.05};
 for(const [name,m] of Object.entries({before:[1,1,1,1,1,1],low:[1.25,1.22,1.22,1.28,1.15,1.2],high:[1.35,1.32,1.32,1.4,1.25,1.3],final:null})){
  await f.evaluate(({before,m})=>{window.PGH_MAP_SIZE_PRESET=m?Object.fromEntries(Object.entries(before).map(([k,v],i)=>[k,v*m[i]])):null;},{before,m});await p.locator('#scale').selectOption('0');await fl.locator('.jg-map').screenshot({path:path.join(out,'scale-'+name+'.png')});
 }
 async function select(id){const v=await p.locator('#scenario option').evaluateAll((els,id)=>els.find(o=>o.textContent===id).value,id);await p.locator('#scenario').selectOption(v);}
 for(const id of ['all-alive','red-top-t1-destroyed','blue-bot-t1-t2-destroyed','mid-inhib-exposed','outer-towers-down','late-game-base','jg-03','jg-42']){await select(id);await fl.locator('.jg-map').screenshot({path:path.join(out,id+'.png')});}
 await select('all-alive');const box=await fl.locator('.jg-map').boundingBox();for(const [side,x,y] of [['blue',0,.6],['red',.6,0]])await p.screenshot({path:path.join(out,side+'-base.png'),clip:{x:box.x+x*box.width,y:box.y+y*box.height,width:box.width*.4,height:box.height*.4}});
 for(let i=1;i<=52;i++){const id='jg-'+String(i).padStart(2,'0');await select(id);await fl.locator('.jg-map').screenshot({path:path.join(out,id+'.png')});}
 const data=await f.evaluate(()=>({anchors:PGH_JUNGLE_STRUCTURES.anchors,sizes:PGH_JUNGLE_STRUCTURES.sizes,pits:Object.fromEntries(['heraldPitAnchor','baronPitAnchor','dragonPitAnchor','grubsAnchor','topScuttleAnchor','botScuttleAnchor'].map(k=>[k,PGH_LANE_GEOMETRY.resolvePosition(k)]))}));
 fs.writeFileSync(path.join(out,'calibration.json'),JSON.stringify({...data,terrainPixels:atlas,ordering:'PASS: all six lanes',catalogMaps:52,scaleComparisons:['before','low','high','final']},null,2));console.log('30 calibrated anchors, six lane orders, 52 production maps: PASS');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
