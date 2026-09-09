/* PGH AudioManager — sons 100% procedurais via Web Audio API */
(function(){
"use strict";
let ctx=null, master=null, noiseBuf=null;
function ensure(){
  if(ctx) { if(ctx.state==="suspended") ctx.resume(); return true; }
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false;
    ctx=new AC(); master=ctx.createGain();
    const st=PGHStore.settings||{volume:0.7,sound:true};
    master.gain.value=st.sound?st.volume:0; master.connect(ctx.destination);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*1,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    return true;
  }catch(e){ return false; }
}
function tone(freq,dur,type,vol,slideTo,delay){
  if(!ensure())return; const t0=ctx.currentTime+(delay||0);
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type||"square"; o.frequency.setValueAtTime(freq,t0);
  if(slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1,slideTo),t0+dur);
  g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(vol||0.2,t0+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0+dur+0.05);
}
function noise(dur,vol,filterFreq,delay){
  if(!ensure())return; const t0=ctx.currentTime+(delay||0);
  const src=ctx.createBufferSource(); src.buffer=noiseBuf; src.loop=true;
  const f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=filterFreq||1000;
  const g=ctx.createGain(); g.gain.setValueAtTime(vol||0.3,t0);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  src.connect(f); f.connect(g); g.connect(master); src.start(t0); src.stop(t0+dur+0.05);
}
const S={
  move(){tone(660,0.06,"square",0.08);},
  select(){tone(520,0.08,"square",0.14);tone(780,0.1,"square",0.14,null,0.07);},
  hover(){tone(440,0.04,"square",0.05);},
  coin(){tone(988,0.09,"square",0.16);tone(1319,0.25,"square",0.16,null,0.09);},
  back(){tone(330,0.1,"square",0.12,180);},
  chat(){tone(880,0.07,"sine",0.12);tone(1174,0.09,"sine",0.1,null,0.06);},
  reaction(){tone(700,0.08,"triangle",0.16,1200);},
  countdown(){tone(440,0.12,"square",0.2);},
  go(){tone(880,0.3,"square",0.22);tone(1320,0.4,"square",0.16,null,0.05);},
  correct(){tone(523,0.1,"square",0.16);tone(659,0.1,"square",0.16,null,0.09);tone(784,0.18,"square",0.18,null,0.18);},
  wrong(){tone(220,0.2,"sawtooth",0.18,110);tone(160,0.25,"sawtooth",0.14,90,0.12);},
  tick(){tone(1200,0.04,"square",0.1);},
  tickFast(){tone(1500,0.03,"square",0.12);},
  explosion(){noise(0.9,0.5,900);tone(120,0.7,"sawtooth",0.4,30);tone(60,0.9,"sine",0.4,25,0.05);},
  achievement(){[523,659,784,1046,1318].forEach(function(f,i){tone(f,0.16,"square",0.15,null,i*0.09);});},
  levelup(){[392,523,659,784,1046,784,1046].forEach(function(f,i){tone(f,0.14,"triangle",0.16,null,i*0.08);});},
  roundStart(){tone(330,0.1,"square",0.16);tone(440,0.1,"square",0.16,null,0.1);tone(660,0.2,"square",0.18,null,0.2);},
  victory(){[523,523,659,784,784,1046,784,1046,1318].forEach(function(f,i){tone(f,0.18,"square",0.16,null,i*0.13);});noise(0.4,0.1,4000,0.2);},
  defeat(){[400,350,300,200].forEach(function(f,i){tone(f,0.25,"sawtooth",0.14,f*0.8,i*0.18);});},
  kick(){tone(150,0.15,"sine",0.3,50);},
  ready(){tone(660,0.08,"square",0.15);tone(990,0.14,"square",0.15,null,0.08);},
  whoosh(){noise(0.25,0.2,2500);tone(300,0.22,"sine",0.12,900);},
  join(){tone(600,0.08,"triangle",0.14,900);},
  leave(){tone(500,0.12,"triangle",0.12,250);},
  reveal(){tone(200,0.4,"sawtooth",0.12,800);noise(0.3,0.08,3000,0.1);},
  drum(){tone(90,0.12,"sine",0.35,45);}
};
window.AudioManager={
  unlock(){ ensure(); },
  setEnabled(on){ const s=PGHStore.settings; if(s){s.sound=on;PGHStorage.saveSettings(s);} if(master)master.gain.value=on?(s? s.volume:0.7):0; },
  setVolume(v){ const s=PGHStore.settings; if(s){s.volume=v;PGHStorage.saveSettings(s); if(s.sound&&master)master.gain.value=v;} },
  play(name){ try{ if(PGHStore.settings&&!PGHStore.settings.sound)return; if(S[name])S[name](); }catch(e){} }
};
})();
