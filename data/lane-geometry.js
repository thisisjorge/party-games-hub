/* Geometry only. Coordinates calibrated against uploads/minimapa-lol-original.jpg.
   t runs from blue base to red base. No actor/wave state is inferred here. */
(function () {
  'use strict';
  const paths = {
    top: [[0,.14,.84],[.12,.12,.55],[.30,.105,.31],[.43,.11,.16],[.50,.15,.13],[.70,.31,.105],[.84,.54,.13],[1,.86,.14]],
    mid: [[0,.14,.84],[.18,.36,.66],[.30,.40,.56],[.50,.50,.49],[.70,.60,.43],[.84,.65,.34],[1,.86,.14]],
    bot: [[0,.14,.84],[.15,.47,.87],[.30,.69,.885],[.45,.82,.865],[.50,.86,.83],[.70,.90,.67],[.84,.87,.45],[1,.86,.14]]
  };
  const LANE_PATHS = Object.fromEntries(Object.entries(paths).map(([lane,p])=>[lane,p.map(([t,x,y])=>({t,x,y}))]));
  for(const [lane,p] of Object.entries(LANE_PATHS))for(const team of ['blue','red']){
    const anchor=window.PGH_JUNGLE_STRUCTURES.anchors[team+lane[0].toUpperCase()+lane.slice(1)+'T1'];
    const node=p.find(n=>n.t===(team==='blue'?.30:.70));node.x=anchor.x;node.y=anchor.y;
  }
  const TOWERS = Object.fromEntries(Object.keys(paths).map(l=>[l,{blueT1:.30,redT1:.70,blueT2:l==='top'?.12:l==='mid'?.18:.15,redT2:.84}]));
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
    topRiver:{x:.29,y:.27},midRiver:{x:.50,y:.49},botRiver:{x:.74,y:.73},
    dragonPit:{x:.68,y:.69},baronPit:{x:.32,y:.31},grubsPit:{x:.32,y:.31},heraldPit:{x:.32,y:.31},
    grubsEntrance:{x:.29,y:.39},baronEntrance:{x:.29,y:.39},dragonEntrance:{x:.62,y:.65},
    blueTopJungle:{x:.27,y:.48},blueBotJungle:{x:.45,y:.73},redTopJungle:{x:.56,y:.28},redBotJungle:{x:.74,y:.50},
    blueTopRiverEntrance:{x:.29,y:.40},blueBotRiverEntrance:{x:.43,y:.59},redTopRiverEntrance:{x:.57,y:.40},redBotRiverEntrance:{x:.72,y:.59},
    redBuffBlue:{x:.28,y:.47},wolvesBlue:{x:.27,y:.58},raptorsBlue:{x:.41,y:.61},blueBuffBlue:{x:.43,y:.74},grompBlue:{x:.31,y:.70},krugsBlue:{x:.43,y:.81},
    blueBuffRed:{x:.57,y:.25},grompRed:{x:.70,y:.29},wolvesRed:{x:.69,y:.39},raptorsRed:{x:.59,y:.38},redBuffRed:{x:.73,y:.50},krugsRed:{x:.82,y:.56}
  };
  // Semantic lane anchors share the same calibrated paths as normal lane play.
  for(const lane of Object.keys(paths)){
    for(const [suffix,t] of Object.entries({BlueOuter:.30,BlueUnderT1:.30,BlueSide:.40,CenterBlue:.44,NeutralBlue:.44,Center:.50,CenterRed:.56,NeutralRed:.56,RedSide:.60,RedOuter:.70,RedUnderT1:.70,BlueBetweenT1T2:.21,RedBetweenT1T2:.77,BlueSafe:.26,RedSafe:.74})){
      points[lane+suffix]=pointOnLane(lane,t);
      if(lane==='bot')for(const role of ['ADC','Support'])points[lane+suffix+role]=points[lane+suffix];
    }
  }
  function resolvePosition(position){
    if(typeof position==='string')return points[position]||null;
    if(position && Number.isFinite(position.x) && Number.isFinite(position.y) && position.x>=0 && position.x<=1 && position.y>=0 && position.y<=1)return {x:position.x,y:position.y};
    return null;
  }
  window.PGH_JUNGLE_MAP_POINTS=points;
  window.PGH_LANE_GEOMETRY={LANE_PATHS,TOWERS,pointOnLane,tangentOnLane,normalOnLane,resolvePosition};
})();
