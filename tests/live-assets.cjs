const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const report={assets:[],pages:[],errors:[],localRequests:[],failed:[]};try{
 for(const site of ['https://party-games-hub-jorge.pages.dev','https://jungle-gap-jorge.pages.dev']){
  const ctx=await b.newContext({ignoreHTTPSErrors:true});const response=await ctx.request.get(site+'/build-manifest.json');assert.equal(response.status(),200);const manifest=await response.json();const files=Object.entries(manifest.files);let cursor=0;
  await Promise.all(Array.from({length:6},async()=>{while(cursor<files.length){const [file,hash]=files[cursor++];if(file==='_headers')continue;const r=await ctx.request.get(site+'/'+file);assert.equal(r.status(),200,file);const actual=crypto.createHash('sha256').update(await r.body()).digest('hex');assert.equal(actual,hash,file+' deployed content differs');report.assets.push({site,file,status:r.status(),sha256:actual});}}));
  const p=await ctx.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('request',r=>{if(/https?:\/\/(localhost|127\.0\.0\.1)/.test(r.url()))report.localRequests.push(r.url());});p.on('response',r=>{if(r.status()>=400)report.failed.push({url:r.url(),status:r.status()});});
  for(const viewport of [{width:1366,height:768},{width:390,height:844},{width:360,height:800}]){await p.setViewportSize(viewport);await p.goto(site,{waitUntil:'networkidle'});await p.waitForTimeout(2300);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.pages.push({site,...viewport,overflow:false});}
  await ctx.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.localRequests,[]);assert.deepEqual(report.failed,[]);fs.mkdirSync('../live-assets',{recursive:true});fs.writeFileSync('../live-assets/report.json',JSON.stringify(report,null,2));console.log({verifiedAssets:report.assets.length,pages:report.pages.length,errors:report.errors,localRequests:report.localRequests,failed:report.failed});
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
