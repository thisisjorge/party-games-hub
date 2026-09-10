/* One pure projection: canonical scenario.state -> map, cards, waves and objectives.
   Normal laners have identity only; their disposition and location come from the wave.
   Only explicit actions may leave that formation. No text inference or legacy fallback. */
(function(){
  'use strict';
  const LANES=['top','mid','bot'], ROLES=['TOP','JUNGLE','MID','ADC','SUPPORT'];
  const SPECIAL=new Set(['ROAMING','ROTATING','RESETTING','RECALLING','GANKING','DIVING','TAKING_OBJECTIVE','SETTING_OBJECTIVE','TAKING_DRAGON','TAKING_BARON','TAKING_GRUBS','INVADING','HOVERING','WARDING','CONTESTING','ACTIVE','VISIBLE','DEAD','MISSING','UNKNOWN','LAST_SEEN']);
  const HIDDEN=new Set(['MISSING','UNKNOWN','LAST_SEEN']);
  const LABELS={FARMING:'farmando',PLAYING_WITH_WAVE:'com a wave',DEFENDING:'defendendo',CLEARING_WAVE:'limpando wave',FREEZING:'segurando freeze',ROAMING:'roamando',ROTATING:'rotacionando',RESETTING:'resetando',RECALLING:'canalizando recall',GANKING:'gankando',DIVING:'divando',TAKING_OBJECTIVE:'fazendo objetivo',SETTING_OBJECTIVE:'preparando objetivo',TAKING_DRAGON:'no dragão',TAKING_BARON:'no baron',TAKING_GRUBS:'nas vastilarvas',INVADING:'invadindo',HOVERING:'dando cobertura',WARDING:'colocando visão',CONTESTING:'contestando',ACTIVE:'ativo',VISIBLE:'visível',DEAD:'morto',MISSING:'sumido',UNKNOWN:'sem visão',LAST_SEEN:'visto por último'};
  const WAVE_RULES={
    NEUTRAL:{front:.50,blue:'FARMING',red:'FARMING',label:'NEUTRA'},
    BLUE_PUSHING:{front:.59,blue:'PLAYING_WITH_WAVE',red:'DEFENDING',label:'SEU TIME PUXANDO'},
    RED_PUSHING:{front:.41,blue:'DEFENDING',red:'PLAYING_WITH_WAVE',label:'INIMIGO PUXANDO'},
    BLUE_CRASHING:{front:.685,blue:'PLAYING_WITH_WAVE',red:'CLEARING_WAVE',label:'SEU TIME CRASHANDO'},
    RED_CRASHING:{front:.315,blue:'CLEARING_WAVE',red:'PLAYING_WITH_WAVE',label:'INIMIGO CRASHANDO'},
    BLUE_FREEZE:{front:.37,blue:'FREEZING',red:'PLAYING_WITH_WAVE',label:'SEU TIME FREEZANDO'},
    RED_FREEZE:{front:.63,blue:'PLAYING_WITH_WAVE',red:'FREEZING',label:'INIMIGO FREEZANDO'},
    BLUE_SLOW_PUSH:{front:.55,blue:'PLAYING_WITH_WAVE',red:'DEFENDING',label:'SEU TIME SLOW PUSH'},
    RED_SLOW_PUSH:{front:.45,blue:'DEFENDING',red:'PLAYING_WITH_WAVE',label:'INIMIGO SLOW PUSH'}
  };
  const DESTINATIONS={topRiver:'rio top',midRiver:'rio mid',botRiver:'rio bot',blueBase:'base azul',redBase:'base vermelha',grubsPit:'vastilarvas',heraldPit:'arauto',dragonPit:'dragão',baronPit:'baron',grubsEntrance:'entrada das vastilarvas',blueTopJungle:'selva azul top',blueBotJungle:'selva azul bot',redTopJungle:'selva vermelha top',redBotJungle:'selva vermelha bot'};
  const clone=x=>JSON.parse(JSON.stringify(x));
  // Whitelist at the network boundary. Hidden true coordinates never enter the public VM.
  function publicState(state){
    if(!state || !state.actors || !state.lanes)throw new Error('Jungle Gap: missing canonical state');
    const out={actors:{},lanes:{},objectives:{},structures:{}};
    for(const [id,s] of Object.entries(window.PGH_JUNGLE_STRUCTURES.resolve(state.structures))){
      out.structures[id]={state:s.state};
      if(s.platesRemaining!==undefined)out.structures[id].platesRemaining=s.platesRemaining;
    }
    for(const [id,a] of Object.entries(state.actors)){
      const knowledge=HIDDEN.has(a.knownState)?a.knownState:HIDDEN.has(a.state)?a.state:HIDDEN.has(a.visibility)?a.visibility:null;
      const p={champion:a.champion,role:a.role,team:a.team,homeLane:a.homeLane};
      if(knowledge)p.state=knowledge;
      else if(a.state)p.state=a.state;
      if(!knowledge && a.state!=='DEAD' && SPECIAL.has(a.state) && a.currentPosition)p.currentPosition=clone(a.currentPosition);
      if(knowledge && a.lastSeen && a.lastSeen.position){
        p.lastSeen={position:clone(a.lastSeen.position)};
        if(Number.isFinite(a.lastSeen.secondsAgo))p.lastSeen.secondsAgo=a.lastSeen.secondsAgo;
      }
      out.actors[id]=p;
    }
    for(const lane of LANES){
      const l=state.lanes[lane];if(!l)throw new Error('Missing lane '+lane);
      out.lanes[lane]={waveState:l.waveState};
      if(Number.isFinite(l.frontT))out.lanes[lane].frontT=l.frontT;
      if(l.reason)out.lanes[lane].reason=String(l.reason);
    }
    for(const [id,o] of Object.entries(state.objectives||{})){
      out.objectives[id]={state:o.state};
      if(Number.isFinite(o.seconds))out.objectives[id].seconds=o.seconds;
    }
    return out;
  }
  function buildJungleScenarioViewModel(sc){
    const state=publicState(sc.state),G=window.PGH_LANE_GEOMETRY;
    const vm={actors:{},mapActors:[],lastSeenActors:[],lanes:{},cardLanes:{},objectives:{},jungleActors:[],structures:window.PGH_JUNGLE_STRUCTURES.resolve(state.structures)};
    if(Object.keys(state.actors).length!==10)throw new Error('Expected exactly 10 unique actors');
    const identities=new Set();
    for(const lane of LANES){
      const l=state.lanes[lane],rule=WAVE_RULES[l.waveState];
      if(!rule)throw new Error('Unknown wave state: '+l.waveState);
      const front=l.frontT??rule.front,towers=G.TOWERS[lane];
      if(front<.05 || front>.95)throw new Error('Invalid wave front');
      if(l.frontT!==undefined && !l.reason)throw new Error('Custom wave front requires an explicit reason');
      const suffix=lane[0].toUpperCase()+lane.slice(1),structures={};
      for(const team of ['blue','red'])for(const tier of ['T1','T2','T3'])structures[team+tier]=vm.structures[team+suffix+tier].state!=='DESTROYED';
      for(const team of ['blue','red']){
        const tier=['T1','T2','T3'].find(t=>structures[team+t]);
        if(tier&&(team==='blue'?front-.012<towers[team+tier]:front+.012>towers[team+tier]))throw new Error('Wave behind intact '+team+' '+tier+': '+lane);
      }
      vm.lanes[lane]={waveState:l.waveState,waveFrontT:front,label:rule.label,structures,waves:['blue','red'].map(team=>({team,...G.pointOnLane(lane,front+(team==='blue'?-.012:.012))}))};
      vm.cardLanes[lane]={...vm.lanes[lane],actors:[]};
    }
    for(const [id,raw] of Object.entries(state.actors)){
      const identity=raw.team+'-'+raw.role;
      if(!['blue','red'].includes(raw.team)||!ROLES.includes(raw.role)||identities.has(identity))throw new Error('Duplicate/invalid team role '+identity);
      identities.add(identity);
      const home=raw.role==='JUNGLE'?'jungle':raw.role==='TOP'?'top':raw.role==='MID'?'mid':'bot';
      if(raw.homeLane!==home)throw new Error('Invalid home lane '+id);
      if(raw.state && !SPECIAL.has(raw.state))throw new Error('Normal actors cannot store independent state: '+id);
      const actor={id,champion:raw.champion,role:raw.role,team:raw.team,homeLane:home,number:ROLES.indexOf(raw.role)+1,renderX:null,renderY:null,renderT:null,currentPosition:null};
      if(HIDDEN.has(raw.state)||raw.state==='DEAD'){
        actor.state=raw.state;actor.positionMode='UNKNOWN';actor.hiddenReason=raw.state;
        if(HIDDEN.has(raw.state) && raw.lastSeen){
          const p=G.resolvePosition(raw.lastSeen.position);if(!p)throw new Error('Invalid last seen position '+id);
          actor.lastSeen={...raw.lastSeen};vm.lastSeenActors.push({id,team:raw.team,number:actor.number,champion:raw.champion,x:p.x,y:p.y,secondsAgo:raw.lastSeen.secondsAgo});
        }
      } else if(raw.state || raw.role==='JUNGLE'){
        actor.state=raw.state||'ACTIVE';actor.positionMode='EXPLICIT';
        const p=G.resolvePosition(raw.currentPosition);
        if(!p)throw new Error('Explicit actor requires valid currentPosition: '+id);
        actor.currentPosition=raw.currentPosition;actor.renderX=p.x;actor.renderY=p.y;
      } else {
        const lane=vm.lanes[home],rule=WAVE_RULES[lane.waveState];
        actor.state=rule[raw.team];actor.positionMode='LANE_RELATIVE';
        // Both teams remain behind their own minions. Supports have a perpendicular formation slot.
        const t=lane.waveFrontT+(raw.team==='blue'?-.075:.075);
        const p=G.pointOnLane(home,t),n=G.normalOnLane(home,t);
        const offset=raw.role==='SUPPORT'?.033:raw.role==='ADC'?-.033:0;
        actor.renderT=t;actor.renderX=p.x+n.x*offset;actor.renderY=p.y+n.y*offset;
      }
      actor.cardLabel=LABELS[actor.state];
      if(actor.positionMode==='EXPLICIT'){
        const dest=DESTINATIONS[actor.currentPosition]||(/^(top|mid|bot)/.exec(actor.currentPosition||'')||[])[1];
        if(dest)actor.cardLabel+=' · '+dest;
      }
      if(actor.lastSeen)actor.cardLabel+=' ('+(actor.lastSeen.secondsAgo===undefined?'tempo desconhecido':actor.lastSeen.secondsAgo+'s')+')';
      vm.actors[id]=actor;
      if(home==='jungle')vm.jungleActors.push(actor);else vm.cardLanes[home].actors.push(actor);
      if(actor.renderX!==null)vm.mapActors.push(actor);
    }
    // Separate coincident explicit actors for legibility, retaining the semantic location.
    const groups=new Map();
    for(const a of vm.mapActors.filter(a=>a.positionMode==='EXPLICIT')){
      const key=a.renderX+','+a.renderY;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(a);
    }
    for(const group of groups.values())if(group.length>1)group.sort((a,b)=>a.id.localeCompare(b.id)).forEach((a,i)=>{const angle=2*Math.PI*i/group.length;a.renderX=Math.max(.03,Math.min(.97,a.renderX+Math.cos(angle)*.038));a.renderY=Math.max(.03,Math.min(.97,a.renderY+Math.sin(angle)*.038));});
    const objectivePositions={dragon:'dragonPitAnchor',baron:'baronPitAnchor',herald:'heraldPitAnchor',grubs:'grubsAnchor',scuttleTop:'topScuttleAnchor',scuttleBot:'botScuttleAnchor',mark:'grompRed'};
    for(const [id,o] of Object.entries(state.objectives)){
      const p=G.resolvePosition(objectivePositions[id]);if(!p)throw new Error('Unknown objective '+id);
      if(!['UP','SPAWNING','DEAD','UNKNOWN'].includes(o.state))throw new Error('Invalid objective state');
      vm.objectives[id]={...o,x:p.x,y:p.y};
    }
    return vm;
  }
  window.PGH_SCENARIO_STATE={buildJungleScenarioViewModel,publicState,WAVE_RULES,SPECIAL};
})();
