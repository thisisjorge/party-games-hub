/* Structure atlas: pixel centers measured on the supplied 586 x 588 artwork.
   One reusable SVG per team/type; state is always supplied by scenario.state.structures. */
(function(){
  'use strict';
  const TYPES=['T1','T2','T3','INHIBITOR','NEXUS_TURRET','NEXUS'];
  const raw={
    blueTopT1:[62,183,'T1'],blueTopT2:[81,322,'T2'],blueTopT3:[69,406,'T3'],blueTopInhib:[68,435,'INHIBITOR'],
    blueMidT1:[236,329,'T1'],blueMidT2:[211,391,'T2'],blueMidT3:[158,426,'T3'],blueMidInhib:[143,449,'INHIBITOR'],
    blueBotT1:[407,521,'T1'],blueBotT2:[277,513,'T2'],blueBotT3:[182,521,'T3'],blueBotInhib:[153,521,'INHIBITOR'],
    redTopT1:[183,64,'T1'],redTopT2:[315,77,'T2'],redTopT3:[407,69,'T3'],redTopInhib:[436,69,'INHIBITOR'],
    redMidT1:[351,256,'T1'],redMidT2:[380,199,'T2'],redMidT3:[431,159,'T3'],redMidInhib:[448,140,'INHIBITOR'],
    redBotT1:[529,397,'T1'],redBotT2:[510,265,'T2'],redBotT3:[520,181,'T3'],redBotInhib:[520,155,'INHIBITOR'],
    blueNexusTowerA:[89,481,'NEXUS_TURRET'],blueNexusTowerB:[104,497,'NEXUS_TURRET'],blueNexus:[81,507,'NEXUS'],
    redNexusTowerA:[483,91,'NEXUS_TURRET'],redNexusTowerB:[499,108,'NEXUS_TURRET'],redNexus:[508,85,'NEXUS']
  };
  const files={T1:'t1',T2:'t2',T3:'t3',INHIBITOR:'inhib',NEXUS_TURRET:'nexus-tower',NEXUS:'nexus'};
  const anchors=Object.fromEntries(Object.entries(raw).map(([id,[x,y,type]])=>{
    const team=id.startsWith('blue')?'blue':'red';
    return [id,{id,type,team,x:x/586,y:y/588,asset:'assets/structures/'+team+'/'+files[type]+'.svg'}];
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
  window.PGH_JUNGLE_STRUCTURES={TYPES,anchors,resolve};
})();
