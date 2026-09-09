/* PGH Achievements — conquistas locais */
(function(){
"use strict";
const DEFS=[
{id:"first_blood",icon:"🩸",name:"FIRST BLOOD",desc:"Vença sua primeira partida"},
{id:"word_wizard",icon:"📖",name:"WORD WIZARD",desc:"5 acertos seguidos no WordBomb"},
{id:"word_god",icon:"🌪️",name:"WORD GOD",desc:"Combo x4+ no WordBomb"},
{id:"bomb_survivor",icon:"💣",name:"BOMB SURVIVOR",desc:"Vença o WordBomb sem perder vida"},
{id:"termo_champ",icon:"🟩",name:"TERMO CHAMP",desc:"Vença uma Termo Battle"},
{id:"termo_sniper",icon:"🎯",name:"TERMO SNIPER",desc:"Acerte o Termo em até 3 tentativas"},
{id:"rift_scholar",icon:"🔮",name:"RIFT SCHOLAR",desc:"Resolva o Riftle em até 4 palpites"},
{id:"rift_champ",icon:"🏆",name:"RIFT CHAMP",desc:"Vença uma Riftle"},
{id:"jungle_gap",icon:"🌲",name:"JUNGLE GAP",desc:"Pontuação perfeita num round Jungle (5x GREAT)"},
{id:"jungle_champ",icon:"🧠",name:"JUNGLE MIND",desc:"Vença um Jungle Gap"},
{id:"speed_demon",icon:"⚡",name:"SPEED DEMON",desc:"Vença 3 partidas no total"},
{id:"big_brain",icon:"🧪",name:"BIG BRAIN",desc:"Jogue 10 partidas"},
{id:"party_animal",icon:"🎉",name:"PARTY ANIMAL",desc:"Jogue com 5+ players na sala"},
{id:"social",icon:"💬",name:"SOCIAL",desc:"Envie 25 mensagens no chat"},
{id:"rich",icon:"💰",name:"RICH",desc:"Acumule 1000 tokens"}
];
let chatCount=0;
function unlock(id){
  const p=PGHStore.profile; if(!p)return;
  if(p.achievements[id])return;
  const def=DEFS.find(function(d){return d.id===id;}); if(!def)return;
  p.achievements[id]=Date.now(); p.tokens+=80;
  PGHStorage.saveProfile(p); PGHBus.emit("profile",p);
  AudioManager.play("achievement"); UI.confetti(60);
  UI.toast("🏆 "+def.name+"! +80 🪙","achievement",3400);
}
function checkPostGame(gameId,r){
  if(r.won)unlock("first_blood");
  if(PGHStore.profile.totalWins>=3)unlock("speed_demon");
  if(PGHStore.profile.gamesPlayed>=10)unlock("big_brain");
  if(PGHStore.players.length>=5)unlock("party_animal");
  if(PGHStore.profile.tokens>=1000)unlock("rich");
  if(gameId==="termo"&&r.won)unlock("termo_champ");
  if(gameId==="riftle"&&r.won)unlock("rift_champ");
  if(gameId==="jungle"&&r.won)unlock("jungle_champ");
  if(gameId==="wordbomb"&&r.won&&r.noDamage)unlock("bomb_survivor");
}
window.Achievements={DEFS:DEFS,unlock:unlock,checkPostGame:checkPostGame,
  bumpChat(){ chatCount++; if(chatCount>=25)unlock("social"); },
  checkWordCombo(c){ if(c>=5)unlock("word_wizard"); if(c>=4)unlock("word_god"); },
  checkTermo(tries){ if(tries<=3)unlock("termo_sniper"); },
  checkRiftle(guesses){ if(guesses<=4)unlock("rift_scholar"); },
  checkJungle(greats){ if(greats>=5)unlock("jungle_gap"); }
};
})();
