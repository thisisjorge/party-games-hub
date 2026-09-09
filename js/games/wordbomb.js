/* PGH WordBomb — bomba passa de player em player; host autoritativo
   HARDENED: normalização PT-BR, debug panel, feedback de rejeição, pool curado */
(function(){
"use strict";

/* ─── NORMALIZAÇÃO PT-BR ─── */
function norm(s){
  return String(s==null?"":s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")  // remove acentos
    .replace(/ç/g,"c")               // ç → c (redundante com NFD mas garante)
    .replace(/[^a-z]/g,"");          // remove não-letras (hífen, espaços, números)
}

/* ─── POOL DE SÍLABAS CURADO ─── */
/* Standard mode: 3-letter targets only. 2-letter only in CHAOS modifier.
   Verified against pythonprobr/palavras (310K+ words, MPL-2.0) */
const SEQS_EASY = ["TRA","PRO","CAO","MEN","ADO","EST","CON","QUE","VER","PRE","TER","COM","PAR","POR","MAR","CAR","TAR","TOR"];
const SEQS_NORMAL = ["BAR","PEL","DOR","CER","GAR","TIL","RIA","NHO","LHA","DAD","ICA","ICO","ALH","BRA","CRE","DRO","FEL","GRI","JAN","LHO","NCA","OCA","OLI","QUI","RAN","SAL","UAR","VIS","XAR","ZEL"];
const SEQS_HARD = ["BRI","CRI","DRI","FRI","GRI","PLA","PLE","PRI","SIL","TRE","VRI","BLI","CLI","FLA","FLO","GLI","GRA","GRU","SCR","STR"];
const ALL_SEQS = SEQS_EASY.concat(SEQS_NORMAL).concat(SEQS_HARD);

let DICT=null, DICT_ARRAY=null;
const sequenceCounts={};
let lastFeedback=null, lastTickSecond=-1, lastTurn=null, passLeft=false;
let dictInitTime=0, dictSource="";

/* ─── DICIONÁRIO (lazy init, uses pythonprobr/palavras MPL-2.0 if available) ─── */
function dict(){
  if(DICT) return DICT;
  const t0 = typeof performance!=="undefined" ? performance.now() : Date.now();
  // Prefer large PT-BR lexicon (310K+ words) over legacy ~3K corpus
  const lexicon = (window.PGH_WORDBOMB_LEXICON || []);
  if(lexicon.length > 0){
    // Lexicon is already normalized at build time
    DICT_ARRAY = lexicon;
    dictSource = "pythonprobr/palavras (MPL-2.0)";
  } else {
    // Fallback: merge PGH_WORDS + PGH_TERMO_WORDS
    const base = (window.PGH_WORDS||[]).map(norm);
    const termo = (window.PGH_TERMO_WORDS||[]).map(norm);
    DICT_ARRAY = [...new Set(base.concat(termo))];
    dictSource = "legacy PGH_WORDS";
  }
  DICT = new Set(DICT_ARRAY);
  const t1 = typeof performance!=="undefined" ? performance.now() : Date.now();
  dictInitTime = t1 - t0;
  console.log("[WordBomb] Lexicon: " + DICT.size + " words in " + dictInitTime.toFixed(1) + "ms (" + dictSource + ")");
  return DICT;
}

/* valida quantas palavras do dicionário contêm a sequência */
function countForSeq(seqNorm){
  if(sequenceCounts[seqNorm]!==undefined)return sequenceCounts[seqNorm];
  const d = DICT_ARRAY || [];
  let c = 0;
  for(let i=0;i<d.length;i++){ if(d[i].indexOf(seqNorm)>=0) c++; }
  return sequenceCounts[seqNorm]=c;
}

/* escolhe sílaba baseada na rodada (easy→normal→hard)
   Evita repetir sequências recentes (anti-repeat com histórico) */
function pickSeq(round, seqHistory){
  let pool;
  if(round<=2) pool = SEQS_EASY;
  else if(round<=5) pool = SEQS_EASY.concat(SEQS_NORMAL);
  else pool = ALL_SEQS;
  // filtra: mínimo 6 palavras
  const valid = [...new Set(pool)].filter(function(s){ return countForSeq(norm(s)) >= 40; });
  if(valid.length === 0) return "TRA"; // fallback
  // anti-repeat: evita últimos 3–5 do histórico
  const recent = (seqHistory||[]).slice(-3);
  const fresh = valid.filter(function(s){ return recent.indexOf(s) < 0; });
  const final = fresh.length > 0 ? fresh : valid;
  return final[Math.floor(Math.random()*final.length)];
}

function comboLabel(c){
  if(c>=6) return ["WORD GOD","god"];
  if(c>=4) return ["INSANE","insane"];
  if(c>=3) return ["GREAT","great"];
  return ["GOOD","good"];
}

function leds(n){
  let s="";
  n=Math.max(0,Math.min(3,n||0));
  for(let i=0;i<3;i++) s+='<span class="'+(i<n?"led-on":"led-off")+'">♥</span>';
  return s;
}

/* ─── DEBUG ─── */
function isDebug(){ return typeof location!=="undefined" && /[?&]debug=1/.test(location.search); }

/* ─── STATE ─── */
function createInitialState(playerIds,opts){
  const mod=(opts&&opts.mod)||null;
  const order=playerIds.slice();
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=order[i];order[i]=order[j];order[j]=t;}
  const lives={},alive={},scores={},combo={};
  const baseTurn = mod==="SHORT_FUSE" ? 9000 : 12000;
  const baseLives = mod==="ONE_LIFE"||opts?.short ? 1 : 3;
  order.forEach(function(id){ lives[id]=baseLives; alive[id]=true; scores[id]=0; combo[id]=0; });
  dict(); // init dict
  const seqHistory = [];
  const seq = pickSeq(1, seqHistory);
  seqHistory.push(seq);
  return {
    phase:"playing", mod:mod, baseTurn:baseTurn, order:order,
    turnIndex:0, currentPlayerId:order[0], sequence:seq,
    seqHistory:seqHistory,
    endsAt:Date.now()+baseTurn, turnDuration:baseTurn,matchEndsAt:Date.now()+(opts?.short?90000:300000),
    lives:lives, alive:alive, usedWords:[], scores:scores,
    combo:combo, round:1, lastResult:null, winnerId:null, exploded:null,
    debugLog:[]
  };
}

function aliveList(st){ return st.order.filter(function(id){return st.alive[id];}); }

function advanceTurn(st){
  const alive=aliveList(st);
  if(alive.length===0) return;
  let idx=alive.indexOf(st.currentPlayerId);
  idx=(idx+1)%alive.length;
  st.currentPlayerId=alive[idx];
  st.turnIndex++;
  if(st.turnIndex % Math.max(1,alive.length) === 0) st.round++;
  // timer diminui progressivamente: 12s → mín 6s
  st.turnDuration = Math.max(6000, (st.baseTurn||12000) - (st.round-1)*700);
  // nova sequência com anti-repeat
  const newSeq = pickSeq(st.round, st.seqHistory);
  st.seqHistory.push(newSeq);
  if(st.seqHistory.length > 5) st.seqHistory.shift();
  st.sequence = newSeq;
  st.endsAt = Date.now() + st.turnDuration;
}

function standingsOf(st){
  return st.order.map(function(id){
    const pts=(st.scores[id]||0) + (st.alive[id]?(st.lives[id]||0)*300:0) + ((aliveList(st).length===1&&st.alive[id])?500:0);
    return {playerId:id,points:pts,lives:st.lives[id]||0,alive:!!st.alive[id],score:st.scores[id]||0};
  }).sort(function(a,b){
    if(a.alive!==b.alive) return (a.alive?-1:1);
    if(a.lives!==b.lives) return b.lives-a.lives;
    return b.score-a.score;
  });
}

/* ─── HOST VALIDATION ─── */
function validateWord(st, playerId, rawWord){
  const w = norm(rawWord);
    const seq = norm(st.sequence);
    if(!/^[\p{L}\p{M}\s-]+$/u.test(String(rawWord)))return {ok:false,code:'INVALID_CHARACTERS',reason:'USE APENAS LETRAS',w,seq};
  
  // 1. É a vez?
  if(playerId !== st.currentPlayerId) return {ok:false, code:"NOT_YOUR_TURN", reason:"NÃO É SUA VEZ!", w:w, seq:seq};
  // 2. Vivo?
  if(!st.alive[playerId]) return {ok:false, code:"DEAD", reason:"VOCÊ JÁ FOI ELIMINADO!", w:w, seq:seq};
  // 3. Timer
  if(Date.now() > st.endsAt + 500) return {ok:false, code:"TIMEOUT", reason:"TEMPO ESGOTADO!", w:w, seq:seq};
  // 4. Tamanho mínimo
  if(w.length < 3) return {ok:false, code:"TOO_SHORT", reason:"MUITO CURTA! (mín 3 letras)", w:w, seq:seq};
  // 5. Contém a sequência?
  if(seq && w.indexOf(seq) < 0) return {ok:false, code:"MISSING_SEQUENCE", reason:'NÃO CONTÉM "'+st.sequence+'"!', w:w, seq:seq};
  // 6. Já usada?
  if(st.usedWords.indexOf(w) >= 0) return {ok:false, code:"ALREADY_USED", reason:"JÁ FOI USADA!", w:w, seq:seq};
  // 7. Existe no dicionário?
  if(!dict().has(w)) return {ok:false, code:"NOT_IN_DICTIONARY", reason:"PALAVRA NÃO ENCONTRADA!", w:w, seq:seq};
  
  return {ok:true, code:"VALID", reason:"", w:w, seq:seq};
}

function hostAction(st,playerId,action,value,h){
  if(st.phase!=="playing") return;
  if(action!=="submit") return;
  
  const raw = String((value&&value.word)||"");
  const v = validateWord(st, playerId, raw);
  
  // Debug log
  if(st.debugLog) {
    // Find matched dictionary entry (original form with accents)
    const matchedEntry = dict().has(v.w) ? v.w : null;
    st.debugLog.push({
      at:Date.now(), playerId:playerId,
      raw_input:raw, norm_input:v.w,
      matched_entry:matchedEntry||"—",
      norm_dict:v.w,
      target:st.sequence, norm_target:v.seq,
      dict:dict().has(v.w), contains:v.seq?v.w.indexOf(v.seq)>=0:false,
      used:st.usedWords.indexOf(v.w)>=0, turn:playerId===st.currentPlayerId,
      ok:v.ok, reason:v.reason, code:v.code
    });
    if(st.debugLog.length > 50) st.debugLog.shift();
  }
  
  if(!v.ok){
    st.lastResult={playerId:playerId, word:raw.toUpperCase().slice(0,24), ok:false, reason:v.reason, at:Date.now()};
    h.unicast(playerId, {ok:false, reason:v.reason, word:raw});
    h.broadcastState();
    return;
  }
  
  // Palavra válida!
  const combo = (st.combo[playerId]||0) + 1;
  st.combo[playerId] = combo;
  let gained = 50 + v.w.length*10 + (combo-1)*25;
  if(st.mod==="COMBO_MANIA") gained = 50 + v.w.length*10 + (combo-1)*50;
  if(st.mod==="LONG_WORDS" && v.w.length>=7) gained = Math.round(gained*1.5);
  st.scores[playerId] = (st.scores[playerId]||0) + gained;
  st.usedWords.push(v.w);
  const label = comboLabel(combo);
  st.lastResult = {playerId:playerId, word:raw.toUpperCase().slice(0,24), ok:true, combo:combo, label:label[0], gained:gained, at:Date.now()};
  st.exploded = null;
  h.unicast(playerId, {ok:true, combo:combo, gained:gained, label:label[0]});
  if(st.mod==="HOT_POTATO") st.baseTurn = Math.max(5000, (st.baseTurn||12000)-600);
  advanceTurn(st);
  h.broadcastState();
}

function hostTick(st,h){
  if(st.phase!=="playing") return;
  if(Date.now()>st.matchEndsAt){st.phase='ended';h.finish(standingsOf(st),{winnerId:null});return;}
  const cp = typeof PGHHelpers!=="undefined" ? PGHHelpers.getPlayer(st.currentPlayerId) : null;
  if(cp && !cp.connected) st.endsAt = Math.min(st.endsAt, Date.now());
  if(Date.now() > st.endsAt){
    const cur = st.currentPlayerId;
    st.lives[cur] = Math.max(0, (st.lives[cur]||0)-1);
    st.combo[cur] = 0;
    st.exploded = {playerId:cur, at:Date.now(), lives:st.lives[cur]};
    st.lastResult = {playerId:cur, word:"💥", ok:false, reason:"BOOM!", at:Date.now()};
    if(st.lives[cur] <= 0){
      st.alive[cur] = false;
    }
    const alive = aliveList(st);
    if(alive.length===0 || (alive.length===1 && st.order.length>1)){
      st.phase = "ended";
      st.winnerId = alive[0] || null;
      h.broadcastState();
      const std = standingsOf(st);
      setTimeout(function(){ h.finish(std, {winnerId:st.winnerId}); }, 1600);
      return;
    }
    if(!st.alive[cur]){
      let idx = st.order.indexOf(cur);
      for(let k=0; k<st.order.length; k++){
        idx = (idx+1) % st.order.length;
        if(st.alive[st.order[idx]]){ st.currentPlayerId = st.order[idx]; break; }
      }
      st.turnDuration = Math.max(6000, (st.baseTurn||12000) - (st.round-1)*700);
      // nova sequência com anti-repeat
      const newSeq = pickSeq(st.round, st.seqHistory);
      st.seqHistory.push(newSeq);
      if(st.seqHistory.length > 5) st.seqHistory.shift();
      st.sequence = newSeq;
      st.endsAt = Date.now() + st.turnDuration;
    } else {
      advanceTurn(st);
    }
    h.broadcastState();
  }
}

function getPublicState(st){
  const pub = {
    phase:st.phase, order:st.order, currentPlayerId:st.currentPlayerId,
    sequence:st.sequence, endsAt:st.endsAt, turnDuration:st.turnDuration,
    lives:st.lives, alive:st.alive, usedCount:st.usedWords.length,
    scores:st.scores, combo:st.combo, round:st.round,
    lastResult:st.lastResult, exploded:st.exploded, winnerId:st.winnerId,
    lastWords:st.usedWords.slice(-6).reverse()
  };
  if(isDebug()){
    pub.debug = {
      currentSeq:st.sequence, normSeq:norm(st.sequence),
      currentPlayer:st.currentPlayerId,
      turnDuration:st.turnDuration, round:st.round,
      usedTotal:st.usedWords.length,
      lastLog: (st.debugLog||[]).slice(-5)
    };
  }
  return pub;
}

/* ─── RENDER ─── */
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

function render(ps){
  const draft=document.getElementById('wb-input')?.value||'';
  const root = document.getElementById("game-root");
  if(!root) return;
  const me = PGHStore.playerId;
  const cur = PGHHelpers.getPlayer(ps.currentPlayerId);
  const myTurn = ps.currentPlayerId===me && ps.alive[me] && ps.phase==="playing";
  const curCombo = (ps.combo && ps.combo[me]) || 0;
  
  let passCls = "";
  if(lastTurn && lastTurn!==ps.currentPlayerId && ps.phase==="playing"){
    passLeft = !passLeft;
    passCls = passLeft ? " pass-l" : " pass-r";
    if(typeof AudioManager!=="undefined") AudioManager.play("whoosh");
  }
  lastTurn = ps.currentPlayerId;
  
  let html = '<div class="g-title">💣 WORDBOMB · ROUND '+ps.round+'</div>';
  html += '<div class="g-sub">Digite uma palavra com <b>'+esc(ps.sequence)+'</b> antes que exploda! · '+ps.usedCount+' usadas</div>';
  html += '<div class="wb-turn-banner">'+(ps.phase==="ended" ? "🏁 FIM DE JOGO" : (cur ? ("🎯 VEZ DE "+esc(cur.nickname).toUpperCase()+(myTurn?" — É VOCÊ!":"")) : ""))+'</div>';
  html += '<div class="g-timer-wrap"><div class="g-timer-fill" id="wb-timer" style="width:100%"></div></div>';
  html += '<div class="wb-fuse"><div class="wb-fuse-burn" id="wb-fuse" style="width:100%"></div><div class="wb-spark" id="wb-spark" style="left:100%">✸</div></div>';
  html += '<div class="wb-bomb-zone"><span class="wb-bomb'+passCls+'" id="wb-bomb">💣</span><div class="wb-seq">'+esc(ps.sequence)+'</div></div>';
  html += '<div class="wb-word-display" id="wb-echo"></div>';
  html += '<div class="wb-combo">'+(curCombo>1 ? ("COMBO x"+curCombo+" 🔥") : "")+'</div>';
  html += '<div class="wb-mylives">'+leds(ps.lives[me]||0)+'</div>';
  html += '<div class="wb-feedback" id="wb-feedback"></div>';
  
  if(ps.phase==="playing"){
    if(myTurn && ps.alive[me]){
      html += '<div class="g-input-row"><input id="wb-input" class="arcade-input" maxlength="24" placeholder="TYPE A WORD..." autocomplete="off" autocapitalize="off" spellcheck="false"><button id="wb-send" class="btn-arcade primary">💥</button></div>';
    } else {
      const reason = !ps.alive[me] ? "💀 Você explodiu! Assistindo..." : "Aguarde sua vez...";
      html += '<div class="g-sub" style="margin-top:12px">'+reason+'</div>';
    }
  }
  
  html += '<div class="g-leader">';
  ps.order.forEach(function(id){
    const p = PGHHelpers.getPlayer(id);
    if(!p) return;
    const lv = Math.max(0, ps.lives[id]||0);
    const hearts = ps.alive[id] ? leds(lv) : '<span class="ptag off">OUT</span>';
    html += '<div class="g-leader-row'+(id===ps.currentPlayerId?" turn":"")+(!ps.alive[id]?" dead":"")+'"><span class="ava"><img src="'+(window.portraitSrc?portraitSrc(p,!ps.alive[id]?"KO":"NORMAL"):esc(p.avatar||""))+'" alt=""></span><span class="nm">'+esc(p.nickname)+'</span><span>'+hearts+'</span><span class="vl">'+(ps.scores[id]||0)+'</span></div>';
  });
  html += "</div>";
  
  if(ps.lastWords && ps.lastWords.length) html += '<div class="g-sub" style="margin-top:10px">últimas: '+ps.lastWords.map(esc).join(" · ")+'</div>';
  
  // Debug panel
  if(ps.debug){
    html += '<div class="wb-debug"><div class="wb-debug-title">🔧 DEBUG PANEL</div>';
    html += '<div>SEQUENCE: <b>'+esc(ps.debug.currentSeq)+'</b> (norm: '+esc(ps.debug.normSeq)+')</div>';
    html += '<div>ROUND: '+ps.debug.round+' · TURN DUR: '+(ps.debug.turnDuration/1000).toFixed(1)+'s</div>';
    html += '<div>USED TOTAL: '+ps.debug.usedTotal+'</div>';
    if(ps.debug.lastLog && ps.debug.lastLog.length){
      html += '<div class="wb-debug-log">';
      ps.debug.lastLog.forEach(function(log){
        const p = PGHHelpers.getPlayer(log.playerId);
        html += '<div class="wb-debug-entry">';
        html += '<b>'+(p?esc(p.nickname):'?')+'</b><br>';
        html += 'INPUT: '+esc(log.raw_input)+' → NORM: '+esc(log.norm_input)+'<br>';
        html += 'MATCHED: '+esc(log.matched_entry)+'<br>';
        html += 'TARGET: '+esc(log.target)+' (norm: '+esc(log.norm_target)+')<br>';
        html += 'DICT:'+log.dict+' · CONTAINS:'+log.contains+' · USED:'+log.used+' · TURN:'+log.turn+'<br>';
        html += '<span class="'+(log.ok?"wb-debug-ok":"wb-debug-fail")+'">→ '+(log.ok?"VALID":esc(log.reason))+' ['+esc(log.code||'')+']</span>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
  }
  
  root.innerHTML = html;
  
  const inp = document.getElementById("wb-input");
  if(inp){
    inp.value=draft;
    inp.focus();
    inp.addEventListener("input",function(){
      const e = document.getElementById("wb-echo");
      if(e) e.textContent = inp.value.toUpperCase().slice(0,24);
    });
    inp.addEventListener("keydown",function(ev){
      if(ev.key==="Enter"){ ev.preventDefault(); submit(); }
    });
    document.getElementById("wb-send").addEventListener("click", submit);
    function submit(){
      const v = inp.value.trim();
      if(!v) return;
      GameManager.sendAction("wordbomb","submit",{word:v});
      inp.value = "";
      const e = document.getElementById("wb-echo");
      if(e) e.textContent = "";
    }
  }
  paintFeedback(ps);
  tickUI(ps);
}

function paintFeedback(ps){
  const f = document.getElementById("wb-feedback");
  if(!f) return;
  const lr = ps.lastResult;
  
  if(ps.exploded && Date.now()-ps.exploded.at < 2500){
    const victim = PGHHelpers.getPlayer(ps.exploded.playerId);
    f.textContent = "💥 BOOM! "+(victim?victim.nickname.toUpperCase():"")+" −1 ♥";
    f.className = "wb-feedback god pop";
    if(typeof UI!=="undefined"){ UI.flash("red",500); UI.shakeScreen(); }
    if(typeof AudioManager!=="undefined") AudioManager.play("explosion");
    return;
  }
  
  if(!lr || Date.now()-lr.at > 3000){ f.textContent=""; return; }
  
  if(lr.ok){
    f.textContent = "VALID! +"+lr.gained+"  ⚡"+lr.label;
    const cls = lr.combo>=6 ? "god" : lr.combo>=4 ? "insane" : lr.combo>=3 ? "great" : "good";
    f.className = "wb-feedback "+cls+" pop";
    f.style.color = "";
  } else {
    f.textContent = "✖ "+lr.reason;
    f.className = "wb-feedback pop";
    f.style.color = "var(--red)";
  }
}

function tickUI(ps){
  const bar = document.getElementById("wb-timer"), bomb = document.getElementById("wb-bomb");
  if(!bar || !ps.endsAt) return;
  const rem = Math.max(0, ps.endsAt - PGHHelpers.hostTime());
  const pct = Math.max(0, Math.min(100, rem/(ps.turnDuration||12000)*100));
  bar.style.width = pct+"%";
  
  const fuse = document.getElementById("wb-fuse"), spark = document.getElementById("wb-spark");
  if(fuse) fuse.style.width = pct+"%";
  if(spark) spark.style.left = pct+"%";
  
  const root = document.getElementById("game-root");
  const danger = ps.phase==="playing" && rem < 6000;
  if(root) root.classList.toggle("wb-danger", danger);
  
  const reduced = PGHStore.settings && PGHStore.settings.reducedEffects;
  try { document.body.classList.toggle("wb-danger", !!(danger && !reduced)); } catch(e){}
  
  if(bomb){
    bomb.classList.toggle("hot", danger);
    const heat = 1 - Math.min(1, rem/10000);
    bomb.style.filter = "drop-shadow(0 0 "+(16+heat*40)+"px rgba(255,"+Math.round(138-heat*100)+",0,"+(0.5+heat*0.5)+"))";
  }
  
  // tick sonoro acelerando
  const sec = Math.ceil(rem/1000);
  if(ps.phase==="playing" && rem < 6000 && sec !== lastTickSecond){
    lastTickSecond = sec;
    if(typeof AudioManager!=="undefined"){
      if(rem < 2500) AudioManager.play("tickFast");
      else AudioManager.play("tick");
    }
  }
  if(rem <= 0) lastTickSecond = -1;
}

function onActionResult(pl){
  const f = document.getElementById("wb-feedback");
  if(pl.ok){
    if(typeof AudioManager!=="undefined") AudioManager.play("correct");
    if(typeof Achievements!=="undefined") Achievements.checkWordCombo(pl.combo||0);
    if(window.Daily) Daily.track("WB_PASS", {combo:pl.combo||0});
  } else {
    if(typeof AudioManager!=="undefined") AudioManager.play("wrong");
    if(f){
      f.textContent = "✖ "+(pl.reason||"INVALID");
      f.className = "wb-feedback pop";
      f.style.color = "var(--red)";
    }
    if(typeof UI!=="undefined") UI.shakeScreen();
  }
}

function renderResult(pl,myPlace,res){
  const root = document.getElementById("game-root");
  if(!root) return;
  try { document.body.classList.remove("wb-danger"); } catch(e){}
  
  const standings = (pl.standings||[]).slice().sort(function(a,b){ return (b.points||0)-(a.points||0); });
  const w = standings[0] && PGHHelpers.getPlayer(standings[0].playerId);
  const myPts = (standings.find(function(s){ return s.playerId===PGHStore.playerId; })||{}).points||0;
  
  let html = '<div class="result-hero"><div class="result-crown">💣</div><div class="g-title">WORD BOMB CHAMPION</div>';
  if(w) html += '<div class="avatar-preview '+ProfileManager.frameClass(w.frame)+'" style="width:110px;height:110px;margin:10px auto"><img class="expr-pop" src="'+(window.portraitSrc?portraitSrc(w,"WIN"):esc(w.avatar||""))+'" alt=""></div>';
  html += '<div class="result-winner">'+esc(w?w.nickname:"—")+'</div>';
  html += '<div class="g-sub">'+myPts+' session pts · Você ficou em '+myPlace+'º · +'+res.xp+' XP · +'+res.tokens+' 🪙</div></div><div class="result-table"><div class="g-leader">';
  standings.forEach(function(s,i){
    const p = PGHHelpers.getPlayer(s.playerId);
    html += '<div class="g-leader-row"><span class="font-mono2">'+String(i+1).padStart(2,"0")+'</span><span class="nm">'+esc(p?p.nickname:"???")+'</span><span class="vl">'+(s.points||0)+' PTS</span></div>';
  });
  html += "</div></div>";
  html += (window.Daily ? Daily.resultButtonsHTML() : '<div class="g-row" style="margin-top:16px"><button class="btn-arcade primary" id="btn-again">↻ JOGAR DE NOVO</button><button class="btn-arcade ghost" id="btn-tolobby">LOBBY</button></div>');
  root.innerHTML = html;
  if(window.Daily) Daily.bindResultButtons();
  else {
    const a = document.getElementById("btn-again");
    if(a) a.addEventListener("click", function(){ GameManager.startGame(); });
    document.getElementById("btn-tolobby").addEventListener("click", function(){ GameManager.quitToLobby(); });
  }
}

function cleanup(){
  lastFeedback=null; lastTickSecond=-1; lastTurn=null;
  try { document.body.classList.remove("wb-danger"); const r=document.getElementById("game-root"); if(r) r.classList.remove("wb-danger"); } catch(e){}
}

GameManager.register({
  id:"wordbomb", name:"WordBomb", tag:"★ BOMBA ★", icon:"💣",
  desc:"Ache palavras com a sílaba antes de explodir",
  players:"2–12 · turnos",minPlayers:2, introWarn:"⚠ WARNING ⚠",
  createInitialState:createInitialState,
  hostAction:hostAction, hostTick:hostTick,
  getPublicState:getPublicState, render:render,
  tickUI:tickUI, onActionResult:onActionResult,
  renderResult:renderResult, cleanup:cleanup
});
})();
