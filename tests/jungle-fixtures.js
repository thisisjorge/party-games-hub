(function(){
  const names={blue:['Garen','Lee Sin','Azir','Jinx','Taric'],red:['Darius','Evelynn','Viktor','Caitlyn','Bard']};
  const roles=['TOP','JUNGLE','MID','ADC','SUPPORT'];
  function fixture(name,wave='NEUTRAL'){
    const actors={};
    for(const team of ['blue','red'])roles.forEach((role,i)=>{
      actors[team+'-'+role.toLowerCase()]={champion:names[team][i],role,team,homeLane:role==='JUNGLE'?'jungle':role==='TOP'?'top':role==='MID'?'mid':'bot'};
      if(role==='JUNGLE')Object.assign(actors[team+'-jungle'],{state:'ACTIVE',currentPosition:team+'TopJungle'});
    });
    return {id:name,type:name,time:'6:40',you:'Lee Sin',hp:'90%',ult:'READY',top:'',mid:'',bot:'',ej:'',obj:'',opts:[['GANK TOP','G'],['FARM','O'],['RESET','R'],['INVADIR','I']],exp:'Cenário determinístico.',state:{actors,lanes:Object.fromEntries(['top','mid','bot'].map(l=>[l,{waveState:wave}])),objectives:{}}};
  }
  const cases=[fixture('lane-neutra'),fixture('blue-push','BLUE_PUSHING'),fixture('red-push','RED_PUSHING'),fixture('crash','BLUE_CRASHING'),fixture('bot-2v2')];
  const roam=fixture('support-roam');Object.assign(roam.state.actors['blue-support'],{state:'ROAMING',currentPosition:'midRiver'});cases.push(roam);
  const rotation=fixture('mid-rotation');Object.assign(rotation.state.actors['blue-mid'],{state:'ROTATING',currentPosition:'topRiver'});cases.push(rotation);
  const trade=fixture('objective-trade');Object.assign(trade.state.actors['blue-support'],{state:'SETTING_OBJECTIVE',currentPosition:'grubsEntrance'});Object.assign(trade.state.actors['red-jungle'],{state:'TAKING_OBJECTIVE',currentPosition:'dragonPit'});trade.state.objectives={grubs:{state:'UP'},dragon:{state:'UP'}};cases.push(trade);
  const missing=fixture('enemy-missing');Object.assign(missing.state.actors['red-mid'],{state:'MISSING',currentPosition:'blueBase',realPosition:'blueBase',lastSeen:{position:'midRedSide',secondsAgo:12}});cases.push(missing);
  const gank=fixture('gank','RED_PUSHING');Object.assign(gank.state.actors['blue-jungle'],{state:'GANKING',currentPosition:'botBlueSide'});cases.push(gank);
  window.JG_FIXTURES={cases,fixture};
})();
