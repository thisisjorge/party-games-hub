/* Geometry only. Coordinates calibrated against the current 1254px terrain.
   t runs from blue base to red base. No actor/wave state is inferred here. */
(function () {
  'use strict';
  const paths = {
    top: [[0,.14,.84],[.12,.12,.55],[.30,.105,.31],[.43,178/1254,255/1254],[.50,225/1254,205/1254],[.57,282/1254,173/1254],[.70,.31,.105],[.84,.54,.13],[1,.86,.14]],
    mid: [[0,.14,.84],[.18,.36,.66],[.30,.40,.56],[.50,.50,.49],[.70,.60,.43],[.84,.65,.34],[1,.86,.14]],
    bot: [[0,.14,.84],[.15,.47,.87],[.30,.69,.885],[.45,.82,.865],[.50,.86,.83],[.70,.90,.67],[.84,.87,.45],[1,.86,.14]]
  };
  const LANE_PATHS = Object.fromEntries(Object.entries(paths).map(([lane,p])=>[lane,p.map(([t,x,y])=>({t,x,y}))]));
  const TOWERS = Object.fromEntries(Object.keys(paths).map(l=>[l,{blueT1:.30,redT1:.70,blueT2:l==='top'?.12:l==='mid'?.18:.15,redT2:.84,blueT3:l==='mid'?.08:.06,redT3:.94}]));
  for(const [lane,p] of Object.entries(LANE_PATHS)){
    for(const team of ['blue','red'])for(const tier of ['T1','T2','T3']){
      const anchor=window.PGH_JUNGLE_STRUCTURES.anchors[team+lane[0].toUpperCase()+lane.slice(1)+tier],t=TOWERS[lane][team+tier];
      const node=p.find(n=>n.t===t);if(node){node.x=anchor.x;node.y=anchor.y;}else p.push({t,x:anchor.x,y:anchor.y});
    }p.sort((a,b)=>a.t-b.t);
  }
  function pointOnLane(lane,t) {
    const path=LANE_PATHS[lane];
    if(!path || !Number.isFinite(t)) throw new Error('Invalid lane coordinate: '+lane+'/'+t);
    t=Math.max(0,Math.min(1,t));
    for(let i=1;i<path.length;i++) if(t<=path[i].t){
      const a=path[i-1],b=path[i],f=(t-a.t)/(b.t-a.t);
      return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,t};
    }
  }
  function tangentOnLane(lane,t){
    const a=pointOnLane(lane,t-.002),b=pointOnLane(lane,t+.002);
    const length=Math.hypot(b.x-a.x,b.y-a.y)||1;
    return {x:(b.x-a.x)/length,y:(b.y-a.y)/length};
  }
  function normalOnLane(lane,t){const p=tangentOnLane(lane,t);return {x:-p.y,y:p.x};}
  const points={
    blueBase:{x:.14,y:.84},redBase:{x:.86,y:.14},
    topRiver:{x:320/1254,y:340/1254},midRiver:{x:.50,y:.49},botRiver:{x:930/1254,y:882/1254},
    // Measured centers on the 1254 x 1254 terrain; pit anchors are not river anchors.
    heraldPitAnchor:{x:438/1254,y:394/1254},baronPitAnchor:{x:438/1254,y:394/1254},grubsAnchor:{x:438/1254,y:394/1254},
    dragonPitAnchor:{x:829/1254,y:863/1254},topScuttleAnchor:{x:332/1254,y:452/1254},botScuttleAnchor:{x:902/1254,y:818/1254},
    grubsEntrance:{x:390/1254,y:450/1254},baronEntrance:{x:390/1254,y:450/1254},dragonEntrance:{x:891/1254,y:848/1254},
    blueTopJungle:{x:.27,y:.48},blueBotJungle:{x:581/1254,y:859/1254},redTopJungle:{x:664/1254,y:389/1254},redBotJungle:{x:918/1254,y:698/1254},
    blueTopRiverEntrance:{x:430/1254,y:530/1254},blueBotRiverEntrance:{x:.43,y:.59},redTopRiverEntrance:{x:.57,y:.40},redBotRiverEntrance:{x:.72,y:.59}

  };
  // Camp IDs name the owning SIDE, not the buff color. Blue team's blue quadrant is top-left.
  // Native terrain centers; each paired clearing is a 180-degree counterpart.
  const campTypes={gromp:{label:'Gromp',color:'#baa4d9'},blue:{label:'Blue',color:'#71c7ec'},wolves:{label:'Lobos',color:'#becbd0'},raptors:{label:'Acuâminas',color:'#ce9d8c'},red:{label:'Red',color:'#e1a077'},krugs:{label:'Krugs',color:'#bcb18f'}};
  const campPixels={grompBlue:[235,468,'gromp'],blueBuffBlue:[332,585,'blue'],wolvesBlue:[339,704,'wolves'],raptorsBlue:[605,805,'raptors'],redBuffBlue:[655,905,'red'],krugsBlue:[712,1022,'krugs'],grompRed:[1019,786,'gromp'],blueBuffRed:[922,669,'blue'],wolvesRed:[915,550,'wolves'],raptorsRed:[649,449,'raptors'],redBuffRed:[599,349,'red'],krugsRed:[542,232,'krugs']};
  const camps=Object.fromEntries(Object.entries(campPixels).map(([id,[x,y,kind]])=>[id,{id,kind,...campTypes[kind],side:id.endsWith('Blue')?'blue':'red',x:x/1254,y:y/1254}]));
  for(const [id,camp] of Object.entries(camps))points[id]={x:camp.x,y:camp.y};
  points.heraldPit=points.heraldPitAnchor;points.baronPit=points.baronPitAnchor;points.grubsPit=points.grubsAnchor;points.dragonPit=points.dragonPitAnchor;
  // Semantic lane anchors share the same calibrated paths as normal lane play.
  for(const lane of Object.keys(paths)){
    for(const [suffix,t] of Object.entries({BlueOuter:.30,BlueUnderT1:.30,BlueSide:.40,CenterBlue:.44,NeutralBlue:.44,Center:.50,CenterRed:.56,NeutralRed:.56,RedSide:.60,RedOuter:.70,RedUnderT1:.70,BlueBetweenT1T2:.21,RedBetweenT1T2:.77,BlueSafe:.26,RedSafe:.74})){
      points[lane+suffix]=pointOnLane(lane,t);
      if(lane==='bot')for(const role of ['ADC','Support'])points[lane+suffix+role]=points[lane+suffix];
    }
  }
  const formationSlots={blueTopJungle:[{x:342/1254,y:576/1254},{x:298/1254,y:644/1254}]};
  function resolvePosition(position){
    if(typeof position==='string')return points[position]||null;
    if(position && Number.isFinite(position.x) && Number.isFinite(position.y) && position.x>=0 && position.x<=1 && position.y>=0 && position.y<=1)return {x:position.x,y:position.y};
    return null;
  }
  window.PGH_JUNGLE_MAP_POINTS=points;
  window.PGH_LANE_GEOMETRY={LANE_PATHS,TOWERS,pointOnLane,tangentOnLane,normalOnLane,resolvePosition,camps,formationSlots};
})();
