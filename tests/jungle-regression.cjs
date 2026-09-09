const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
global.window=global;const root=path.join(__dirname,'..');
for(const f of ['data/jungle-structures.js','data/lane-geometry.js','data/scenario-state-model.js','tests/jungle-fixtures.js'])vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
const M=PGH_SCENARIO_STATE,G=PGH_LANE_GEOMETRY;let checks=0;
const check=(v,m)=>{checks++;assert.ok(v,m)};
function validate(sc){
  const before=JSON.stringify(sc),v=M.buildJungleScenarioViewModel(sc),values=Object.values(v.actors);
  check(before===JSON.stringify(sc),'pure projection');check(values.length===10,'10 actors');
  check(new Set(v.mapActors.map(a=>a.id)).size===v.mapActors.length,'unique map IDs');
  for(const a of values){
    check(a.cardLabel,'label '+a.id);
    if(a.positionMode==='UNKNOWN'){check(a.renderX===null && !v.mapActors.includes(a),'hidden '+a.id);continue;}
    check(v.mapActors.includes(a),'no missing '+a.id);
    check(Number.isFinite(a.renderX)&&a.renderX>=0&&a.renderX<=1&&Number.isFinite(a.renderY)&&a.renderY>=0&&a.renderY<=1,'valid position');
    if(a.homeLane!=='jungle')check(v.cardLanes[a.homeLane].actors.includes(a),'same card/map object');
    if(a.positionMode==='LANE_RELATIVE'){
      const l=v.lanes[a.homeLane],front=l.waveFrontT;
      check(a.team==='blue'?a.renderT<front:a.renderT>front,'actor behind own wave');
      check(a.state===M.WAVE_RULES[l.waveState][a.team],'wave disposition');
    }
  }
  for(const [lane,l] of Object.entries(v.lanes))for(const wave of l.waves){
    check(!l.structures.blueT1||wave.t>=G.TOWERS[lane].blueT1,'blue T1 boundary');check(!l.structures.redT1||wave.t<=G.TOWERS[lane].redT1,'red T1 boundary');
  }
  check(JSON.stringify(v)===JSON.stringify(M.buildJungleScenarioViewModel(sc)),'deterministic');
  return v;
}
for(const sc of JG_FIXTURES.cases)validate(sc);
for(const wave of Object.keys(M.WAVE_RULES))for(const absent of [null,'blue-adc','red-adc','blue-support','red-top']){
  const sc=JG_FIXTURES.fixture(wave,wave);if(absent)Object.assign(sc.state.actors[absent],{state:'DEAD'});validate(sc);
}
for(const state of M.SPECIAL){
  const sc=JG_FIXTURES.fixture(state);Object.assign(sc.state.actors['blue-support'],{state,currentPosition:'midRiver'});const v=validate(sc);
  if(!['DEAD','MISSING','UNKNOWN','LAST_SEEN'].includes(state))check(v.actors['blue-support'].positionMode==='EXPLICIT','special stays off lane '+state);
}
const missing=JG_FIXTURES.cases.find(s=>s.id==='enemy-missing'),pub=M.publicState(missing.state);
check(!JSON.stringify(pub).includes('blueBase'),'no real position leak');check(!JSON.stringify(pub).includes('realPosition'),'no private property');
const broken=JG_FIXTURES.fixture('invalid');broken.state.actors['red-adc'].role='SUPPORT';assert.throws(()=>M.buildJungleScenarioViewModel(broken));
const boundary=JG_FIXTURES.fixture('invalid-wave');boundary.state.lanes.top.frontT=.2;boundary.state.lanes.top.reason='tower down';assert.throws(()=>M.buildJungleScenarioViewModel(boundary));
boundary.state.structures={blueTopT1:'DESTROYED'};validate(boundary);
let production=[];
vm.runInThisContext(fs.readFileSync(path.join(root,'tests/structure-fixtures.js'),'utf8'));
for(const sc of JG_STRUCTURE_FIXTURES){const v=validate(sc);check(Object.keys(v.structures).length===30,'30 structures');for(const [id,s] of Object.entries(v.structures)){check(s.x===PGH_JUNGLE_STRUCTURES.anchors[id].x && s.y===PGH_JUNGLE_STRUCTURES.anchors[id].y,'stable anchor');if(s.type!=='T1')check(s.platesRemaining===undefined,'no plates on other structures');}}
assert.throws(()=>PGH_JUNGLE_STRUCTURES.resolve({redMidT2:{platesRemaining:5}}));
assert.throws(()=>PGH_JUNGLE_STRUCTURES.resolve({redTopT1:{platesRemaining:6}}));
assert.throws(()=>PGH_JUNGLE_STRUCTURES.resolve({fakeTower:'ALIVE'}));
check(PGH_JUNGLE_STRUCTURES.resolve({blueTopT1:{state:'PLATED',platesRemaining:2}}).blueTopT1.platesRemaining===2,'dynamic plate count');
for(const type of ['t1','t2','t3','inhib','nexus-tower','nexus']){const art=team=>fs.readFileSync(path.join(root,'assets/structures',team,type+'.svg'),'utf8').replace(/#[0-9a-f]{6}/gi,'#COLOR');check(art('blue')===art('red'),'paired silhouette '+type);}
const inner=JG_FIXTURES.fixture('inner-boundary');inner.state.structures={redTopT1:'DESTROYED'};inner.state.lanes.top.frontT=.90;inner.state.lanes.top.reason='T1 down';assert.throws(()=>M.buildJungleScenarioViewModel(inner));inner.state.structures.redTopT2='DESTROYED';validate(inner);
check(G.resolvePosition('heraldPitAnchor').x===438/1254,'measured herald center');check(G.resolvePosition('dragonPitAnchor').x===829/1254,'measured dragon center');
if(process.argv.includes('--production')){
 vm.runInThisContext(fs.readFileSync(path.join(root,'data/jungle-scenarios.js'),'utf8'));check(PGH_JUNGLE.length===52,'52 scenarios');
 for(const sc of PGH_JUNGLE){validate(sc);production.push({id:sc.id,result:'PASS'});}
}
console.log(JSON.stringify({fixtures:JG_FIXTURES.cases.length,waveAbsenceCases:45,specialStates:M.SPECIAL.size,checks,production},null,2));
