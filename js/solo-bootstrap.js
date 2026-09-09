/* Frontend adapter only. The registered Hub game owns rules, map and scoring. */
window.PGHStore={playerId:'solo',players:[{id:'solo',nickname:'Você',connected:true}],currentMod:null};
window.PGHHelpers={getPlayer:id=>PGHStore.players.find(p=>p.id===id),myPlayer:()=>PGHStore.players[0],hostTime:()=>Date.now()};
window.GameManager={register:g=>window.PGH_SOLO_GAME=g,publicState:null,sendAction:(id,action,value)=>window.JungleSolo?.act(action,value)};
