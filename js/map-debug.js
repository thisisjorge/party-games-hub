/* Opt-in development overlay. All coordinates come from the production VM/atlas. */
(function(){
'use strict';const enabled=new URLSearchParams(location.search).has('mapdebug');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function compact(id){return id.replace(/^blue/,'B').replace(/^red/,'R').replace('TopT','T').replace('MidT','M').replace('BotT','B').replace('TopInhib','TI').replace('MidInhib','MI').replace('BotInhib','BI').replace('NexusTower','NT').replace('Nexus','N');}
function mark(id,x,y,color,size=0){x*=1000;y*=1000;return '<g><path d="M'+(x-10)+' '+y+'h20 M'+x+' '+(y-10)+'v20" stroke="'+color+'" stroke-width="1.5"/>'+(size?'<rect x="'+(x-size/2)+'" y="'+(y-size/2)+'" width="'+size+'" height="'+size+'" fill="none" stroke="'+color+'" stroke-width="1"/>':'')+'<text x="'+(x+8)+'" y="'+(y-12)+'" fill="'+color+'" stroke="#031015" stroke-width="3" paint-order="stroke" font-family="monospace" font-size="12">'+esc(id)+' '+(x/1000).toFixed(3)+','+(y/1000).toFixed(3)+'</text></g>';}
function overlay(vm){if(!enabled)return '';const on=window.PGH_MAP_DEBUG_GROUPS||['structures','paths','pits','actors','waves'];let s='<g class="jg-map-debug" pointer-events="none">';
 if(on.includes('paths'))for(const [lane,ps] of Object.entries(PGH_LANE_GEOMETRY.LANE_PATHS))s+='<polyline data-debug-lane="'+lane+'" points="'+ps.map(p=>p.x*1000+','+p.y*1000).join(' ')+'" fill="none" stroke="#fff" stroke-dasharray="6 6" stroke-width="2"/>';
 if(on.includes('structures'))for(const a of Object.values(vm.structures))s+=mark(compact(a.id),a.x,a.y,a.team==='blue'?'#4affff':'#ff88ab',(window.PGH_MAP_SIZE_PRESET||PGH_JUNGLE_STRUCTURES.sizes)[a.type]);
 if(on.includes('pits'))for(const id of ['heraldPitAnchor','baronPitAnchor','dragonPitAnchor','grubsAnchor','topScuttleAnchor','botScuttleAnchor']){const p=PGH_LANE_GEOMETRY.resolvePosition(id);s+=mark(id,p.x,p.y,'#ffdf66',58);}
 if(on.includes('actors'))for(const a of vm.mapActors)s+=mark(a.id,a.renderX,a.renderY,'#a4ffa9',44);
 if(on.includes('waves'))for(const [lane,l] of Object.entries(vm.lanes)){const p=PGH_LANE_GEOMETRY.pointOnLane(lane,l.waveFrontT);s+=mark(lane+' front '+l.waveFrontT,p.x,p.y,'#ffffff');}
 return s+'</g>';}
window.PGHMapDebug={enabled,overlay};
})();
