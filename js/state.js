/* PGH State — AppState + Store central + mini event bus */
(function(){
"use strict";
window.AppState={BOOT:"BOOT",PROFILE:"PROFILE",HOME:"HOME",CONNECTING:"CONNECTING",LOBBY:"LOBBY",GAME_INTRO:"GAME_INTRO",GAME:"GAME",ROUND_RESULT:"ROUND_RESULT",GAME_RESULT:"GAME_RESULT"};
const listeners={};
window.PGHBus={
  on(ev,fn){ (listeners[ev]=listeners[ev]||[]).push(fn); },
  off(ev,fn){ if(!listeners[ev])return; const i=listeners[ev].indexOf(fn); if(i>=0)listeners[ev].splice(i,1); },
  emit(ev,data){ (listeners[ev]||[]).slice().forEach(function(fn){ try{fn(data);}catch(e){console.error("[bus]",ev,e);} }); }
};
window.PGHStore={
  screen:AppState.BOOT, profile:null, settings:null,
  roomCode:null, playerId:null, isHost:false, peerId:null,
  players:[], // {id,nickname,avatar,avatarStyle,avatarSeed,frame,ready,connected,joinOrder,sessionScore,isHost}
  selectedGame:null, gamePhase:"lobby", sessionChat:[],
  clockOffset:0, pingMs:null, lastSnapshot:null,
  reconnecting:false
};
window.PGHHelpers={
  myPlayer(){ return PGHStore.players.find(function(p){return p.id===PGHStore.playerId;})||null; },
  hostPlayer(){ return PGHStore.players.find(function(p){return p.isHost;})||null; },
  getPlayer(id){ return PGHStore.players.find(function(p){return p.id===id;})||null; },
  hostTime(){ return Date.now()+PGHStore.clockOffset; },
  uid(prefix){ return (prefix||"") + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); },
  esc(s){ return String(s==null?"":s); },
  now(){ return Date.now(); }
};
})();
