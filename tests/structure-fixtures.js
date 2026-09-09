(function(){
  const definitions=[
    ['all-alive',{}],
    ['red-top-t1-destroyed',{redTopT1:'DESTROYED'}],
    ['blue-bot-t1-t2-destroyed',{blueBotT1:'DESTROYED',blueBotT2:'DESTROYED'}],
    ['blue-top-t1-destroyed',{blueTopT1:'DESTROYED'}],
    ['red-bot-t1-t2-destroyed',{redBotT1:'DESTROYED',redBotT2:'DESTROYED'}],
    ['mid-inhib-exposed',{redMidT1:'DESTROYED',redMidT2:'DESTROYED',redMidT3:'DESTROYED'}],
    ['outer-towers-down',{blueTopT1:'DESTROYED',blueMidT1:'DESTROYED',redBotT1:'DESTROYED',redMidT1:'DESTROYED'}],
    ['late-game-base',Object.fromEntries(Object.entries(PGH_JUNGLE_STRUCTURES.anchors).filter(([id,a])=>['T1','T2','T3'].includes(a.type)||['redMidInhib','redNexusTowerA'].includes(id)).map(([id])=>[id,'DESTROYED']))]
  ];
  window.JG_STRUCTURE_FIXTURES=definitions.map(([id,structures])=>{const sc=JG_FIXTURES.fixture(id);sc.state.structures=structures;return sc;});
})();
