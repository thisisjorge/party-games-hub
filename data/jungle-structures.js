/* Structure atlas: pixel centers calibrated on the CURRENT 1254 x 1254 terrain.
   One reusable SVG per team/type; state is always supplied by scenario.state.structures. */
(function(){
  'use strict';
  const TYPES=['T1','T2','T3','INHIBITOR','NEXUS_TURRET','NEXUS'];
  const raw={
    blueTopT1:[156,392,'T1'],blueTopT2:[153,687,'T2'],blueTopT3:[153,850,'T3'],blueTopInhib:[153,920,'INHIBITOR'],
    blueMidT1:[554,706,'T1'],blueMidT2:[452,808,'T2'],blueMidT3:[355,904,'T3'],blueMidInhib:[303,960,'INHIBITOR'],
    blueBotT1:[862,1108,'T1'],blueBotT2:[592,1108,'T2'],blueBotT3:[393,1108,'T3'],blueBotInhib:[318,1108,'INHIBITOR'],
    redTopT1:[392,150,'T1'],redTopT2:[687,150,'T2'],redTopT3:[850,150,'T3'],redTopInhib:[925,150,'INHIBITOR'],
    redMidT1:[725,555,'T1'],redMidT2:[823,457,'T2'],redMidT3:[912,368,'T3'],redMidInhib:[966,312,'INHIBITOR'],
    redBotT1:[1107,862,'T1'],redBotT2:[1107,592,'T2'],redBotT3:[1107,395,'T3'],redBotInhib:[1107,320,'INHIBITOR'],
    blueNexusTowerA:[184,994,'NEXUS_TURRET'],blueNexusTowerB:[249,1059,'NEXUS_TURRET'],blueNexus:[154,1088,'NEXUS'],
    redNexusTowerA:[1005,195,'NEXUS_TURRET'],redNexusTowerB:[1070,260,'NEXUS_TURRET'],redNexus:[1100,166,'NEXUS']
  };
  const files={T1:'t1',T2:'t2',T3:'t3',INHIBITOR:'inhib',NEXUS_TURRET:'nexus-tower',NEXUS:'nexus'};
  const sizes={T1:73.4,T2:67.56,T3:67.56,INHIBITOR:63.28,NEXUS_TURRET:56.4,NEXUS:67.56};
  const anchors=Object.fromEntries(Object.entries(raw).map(([id,[x,y,type]])=>{
    const team=id.startsWith('blue')?'blue':'red';
    return [id,{id,type,team,x:x/1254,y:y/1254,asset:'assets/structures/'+team+'/'+files[type]+'.svg'}];
  }));
  function resolve(overrides={}){
    for(const id of Object.keys(overrides))if(!anchors[id])throw new Error('Unknown structure '+id);
    return Object.fromEntries(Object.entries(anchors).map(([id,a])=>{
      const raw=overrides[id],o=typeof raw==='string'?{state:raw}:raw||{};
      const state=o.state||(a.type==='T1'?'PLATED':'ALIVE');
      if(!['ALIVE','DESTROYED','DAMAGED','PLATED'].includes(state))throw new Error('Invalid structure state '+id);
      if(a.type!=='T1' && (state==='PLATED'||o.platesRemaining!==undefined))throw new Error('Only T1 has plates: '+id);
      const resolved={...a,state};
      if(a.type==='T1'){
        resolved.platesRemaining=state==='DESTROYED'?0:o.platesRemaining??(state==='PLATED'?5:0);
        if(!Number.isInteger(resolved.platesRemaining)||resolved.platesRemaining<0||resolved.platesRemaining>5)throw new Error('Invalid plate count '+id);
      }
      return [id,resolved];
    }));
  }
  window.PGH_JUNGLE_STRUCTURES={TYPES,anchors,resolve,sizes};
})();
