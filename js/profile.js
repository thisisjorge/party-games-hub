/* PGH Profile — perfil local sem login: XP, level, tokens, stats, achievements, cosmetics */
(function(){
"use strict";
const AVATAR_STYLES=[
  {id:"pixel-art",label:"Pixel Art"},
  {id:"bottts",label:"Bottts"},
  {id:"adventurer",label:"Adventurer"},
  {id:"fun-emoji",label:"Fun Emoji"},
  {id:"lorelei",label:"Lorelei"}
];
const FRAMES=[
  {id:"neon",cls:"frame-neon",icon:"🖼️",name:"Neon",price:0},
  {id:"pink",cls:"frame-pink",icon:"💖",name:"Pink",price:100},
  {id:"gold",cls:"frame-gold",icon:"👑",name:"Gold",price:300},
  {id:"toxic",cls:"frame-toxic",icon:"☢️",name:"Toxic",price:300},
  {id:"void",cls:"frame-void",icon:"🌀",name:"Void",price:500},
  {id:"rift",cls:"frame-rift",icon:"💠",name:"Rift",price:500}
];
function xpForLevel(level){ return 100+(level-1)*75; }
const TITLES=[
  {min:30,name:"HALL OF FAME"},
  {min:22,name:"PIXEL LEGEND"},
  {min:16,name:"NEON MASTER"},
  {min:12,name:"ARCADE STAR"},
  {min:8,name:"VETERAN"},
  {min:5,name:"GAMER"},
  {min:3,name:"CONTENDER"},
  {min:1,name:"ROOKIE"}
];
function titleForLevel(level){ for(let i=0;i<TITLES.length;i++){ if(level>=TITLES[i].min)return TITLES[i].name; } return "ROOKIE"; }
function avatarUrl(style,seed){
  return "https://api.dicebear.com/9.x/"+style+"/svg?seed="+encodeURIComponent(seed)+"&backgroundColor=0a0a18";
}
function defaultProfile(){
  return {profileVersion:2,profileId:PGHHelpers.uid("p_"),nickname:"",avatar:"",avatarStyle:"pixel-art",avatarSeed:"hero"+Math.floor(Math.random()*9999),avatarFrame:"neon",character:null,
    totalXP:0,level:1,totalPoints:0,totalWins:0,gamesPlayed:0,bestStreak:0,currentStreak:0,tokens:100,
    achievements:{},gameStats:{},recentGames:[],cosmetics:{frames:["neon"]}};
}
function ensure(p){
  const d=defaultProfile();
  if(!p||typeof p!=="object") p={};
  Object.keys(d).forEach(function(k){ if(p[k]===undefined)p[k]=d[k]; });
  if(!p.profileVersion||p.profileVersion<2){ if(p.nickname&&p.character===undefined)p.character=null; p.profileVersion=2; } // legado: mantém DiceBear
  if(p.character===undefined)p.character=null;
  p.cosmetics=p.cosmetics||{frames:["neon"]};
  p.cosmetics.frames=p.cosmetics.frames||["neon"];
  p.achievements=p.achievements||{}; p.gameStats=p.gameStats||{}; p.recentGames=p.recentGames||[];
  return p;
}
function addXP(amount){
  const p=PGHStore.profile; if(!p)return{leveled:false};
  p.totalXP+=amount; let leveled=false,need=xpForLevel(p.level);
  let guard=0;
  while(p.totalXP>=need&&guard<50){ p.totalXP-=need; p.level++; leveled=true; p.tokens+=50; need=xpForLevel(p.level); guard++; }
  PGHStorage.saveProfile(p); PGHBus.emit("profile",p);
  if(leveled){ AudioManager.play("levelup"); UI.toast("⬆ LEVEL "+p.level+"! +50 🪙","success"); UI.confetti(90); }
  return{leveled:leveled};
}
function recordGameResult(gameId,placement,totalPlayers,sessionPoints){
  const p=PGHStore.profile; if(!p)return;
  p.gamesPlayed++;
  const won=placement===1;
  if(won){ p.totalWins++; p.currentStreak=(p.currentStreak||0)+1; p.bestStreak=Math.max(p.bestStreak||0,p.currentStreak); }
  else p.currentStreak=0;
  const xp=40+Math.max(0,(totalPlayers-placement))*15+(won?60:0)+Math.min(60,Math.floor(sessionPoints/200));
  const tok=20+Math.max(0,(totalPlayers-placement))*5+(won?40:0);
  p.tokens+=tok; p.totalPoints+=sessionPoints;
  const gs=p.gameStats[gameId]=p.gameStats[gameId]||{played:0,wins:0,best:0};
  gs.played++; if(won)gs.wins++; gs.best=Math.max(gs.best||0,sessionPoints);
  p.recentGames.unshift({g:gameId,place:placement,n:totalPlayers,pts:sessionPoints,at:Date.now()});
  p.recentGames=p.recentGames.slice(0,10);
  PGHStorage.saveProfile(p);
  addXP(xp);
  if(typeof Achievements!=="undefined") Achievements.checkPostGame(gameId,{placement:placement,won:won,points:sessionPoints});
  return{xp:xp,tokens:tok};
}
window.ProfileManager={
  AVATAR_STYLES:AVATAR_STYLES, FRAMES:FRAMES, xpForLevel:xpForLevel, titleForLevel:titleForLevel, avatarUrl:avatarUrl,
  load(){ const p=ensure(PGHStorage.loadProfile()); PGHStore.profile=p; return p; },
  hasProfile(){ return !!(PGHStore.profile&&PGHStore.profile.nickname); },
  create(nickname,style,seed,frame,character){
    const p=ensure(PGHStore.profile||null);
    p.nickname=String(nickname||"").trim().slice(0,14);
    p.avatarStyle=style; p.avatarSeed=seed; p.avatarFrame=frame;
    p.character=(character!==undefined?character:p.character)||null;
    p.avatar=avatarUrl(style,seed); // DiceBear sempre atualizado como fallback/alternativa
    PGHStore.profile=p; PGHStorage.saveProfile(p); PGHBus.emit("profile",p);
    return p;
  },
  update(fields){ Object.assign(PGHStore.profile,fields);
    if(fields.avatarStyle||fields.avatarSeed) PGHStore.profile.avatar=avatarUrl(PGHStore.profile.avatarStyle,PGHStore.profile.avatarSeed);
    PGHStorage.saveProfile(PGHStore.profile); PGHBus.emit("profile",PGHStore.profile); },
  buyFrame(id){
    const f=FRAMES.find(function(x){return x.id===id;}); if(!f)return false;
    const p=PGHStore.profile;
    const price=(window.Daily?Daily.spotPrice(f):f.price);
    if(p.cosmetics.frames.indexOf(id)>=0){ p.avatarFrame=id; PGHStorage.saveProfile(p); PGHBus.emit("profile",p); return true; }
    if(p.tokens<price){ UI.toast("Tokens insuficientes! Jogue para ganhar 🪙","warn"); return false; }
    p.tokens-=price; p.cosmetics.frames.push(id); p.avatarFrame=id;
    PGHStorage.saveProfile(p); PGHBus.emit("profile",p); AudioManager.play("coin");
    UI.toast("Moldura "+f.name+" desbloqueada!","success"); return true;
  },
  addXP:addXP, recordGameResult:recordGameResult,
  frameClass(id){ const f=FRAMES.find(function(x){return x.id===id;}); return f?f.cls:"frame-neon"; }
};
})();
