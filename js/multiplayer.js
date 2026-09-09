/* PGH Net — transporte P2P (PeerJS) + protocolo de mensagens + clock sync + reconexão */
(function(){
"use strict";
const PREFIX="pgh-v1-", HOST_PREFIX="pgh-v1-room-";
const seenIds=new Set();
let peer=null, hostConn=null; // hostConn: conexão do client -> host
const conns={}; // host: playerId -> DataConnection
let pingTimer=null, syncTimer=null, reconnectTimer=null, migrateTimer=null;
let joinResolve=null, joinReject=null;
let pingSentAt=0, lastPongId=0;
let ensureReject=null;

function hostPeerId(code){ return HOST_PREFIX+code; }
function mkMsg(type,payload){
  return {type:type,senderId:PGHStore.playerId,roomCode:PGHStore.roomCode,messageId:PGHHelpers.uid("m_"),timestamp:Date.now(),payload:payload||{}};
}
function seen(id){ if(!id)return false; if(seenIds.has(id))return true; seenIds.add(id); if(seenIds.size>800){ const it=seenIds.values(); for(let i=0;i<200;i++)seenIds.delete(it.next().value); } return false; }
function destroyPeer(){
  try{
    if(pingTimer){clearInterval(pingTimer);pingTimer=null;}
    if(syncTimer){clearInterval(syncTimer);syncTimer=null;}
    if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null;}
    Object.keys(conns).forEach(function(k){ try{conns[k].close();}catch(e){} delete conns[k]; });
    if(hostConn){try{hostConn.close();}catch(e){}hostConn=null;}
    if(peer){try{peer.destroy();}catch(e){}peer=null;}
  }catch(e){}
}
async function ensurePeer(id){
  const endpoint=window.PGH_CONFIG?.iceEndpoint;
  if(endpoint){
    const url=new URL(endpoint,location.href);
    if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('ICE_ENDPOINT_HTTPS_REQUIRED');
    const response=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error('ICE_ENDPOINT_UNAVAILABLE');
    const data=await response.json();
    if(!Array.isArray(data.iceServers)||!data.iceServers.length||data.iceServers.length>8||!Number.isFinite(data.expiresAt)||data.expiresAt<=Date.now()+30000)throw new Error('ICE_CREDENTIALS_INVALID');
    window.PGH_ICE=data.iceServers;
  }
  return new Promise(function(res,rej){
    if(typeof Peer==="undefined"){ rej(new Error("P2P_OFFLINE")); return; } // CDN PeerJS bloqueado/offline
    try{
      if(peer){try{peer.destroy();}catch(e){}peer=null;}
      peer=new Peer(id,Object.assign({debug:0},window.PGH_CONFIG?.peer||{},window.PGH_ICE?{config:{iceServers:window.PGH_ICE}}:{}));
      const openingPeer=peer;
      const openingTimer=setTimeout(function(){if(peer===openingPeer&&ensureReject){ensureReject=null;openingPeer.destroy();rej(new Error('SIGNALING_TIMEOUT'));}},20000);
      PGHStore.peerId=id;
      ensureReject=rej;
      peer.on("open",function(pid){ clearTimeout(openingTimer);ensureReject=null; PGHStore.peerId=pid; UI.updateDebug(); res(pid); });
      peer.on("error",function(err){
        console.warn("[net] peer error",err&&err.type,err);
        if(err&&err.type==="unavailable-id"&&ensureReject){ const r=ensureReject; ensureReject=null; try{peer.destroy();}catch(e){} peer=null; r(new Error("ID_TAKEN")); return; }
        if(joinReject&&(err.type==="peer-unavailable"||err.type==="network"||err.type==="server-error")){
          const r=joinReject; joinReject=null; joinResolve=null; r(new Error(err.type==="peer-unavailable"?"ROOM_NOT_FOUND":String(err.type)));
        }
        if(err&&err.type==="network"&&!PGHStore.isHost&&PGHStore.roomCode){ scheduleReconnect("NETWORK"); }
      });
      peer.on("disconnected",function(){ try{peer.reconnect();}catch(e){ if(!PGHStore.isHost)scheduleReconnect("DISCONNECTED"); } });
    }catch(e){ rej(e); }
  });
}
/* ---------- HOST ---------- */
function createHost(roomCode,playerInfo,attempt){
  destroyPeer(); seenIds.clear();
  PGHStore.isHost=true; PGHStore.roomCode=roomCode;
  attempt=attempt||1;
  return new Promise(function(res,rej){
    ensurePeer(hostPeerId(roomCode)).then(function(pid){
      if(!peer) { rej(new Error("PEER_FAIL")); return; }
      peer.on("connection",onHostConnection);
      // heartbeat: full sync periódico
      syncTimer=setInterval(function(){ Rooms.broadcastFullSync(); },10000);
      // host ping próprio = 0
      PGHStore.pingMs=0;
      // registra host como player 0
      PGHStore.players=[Object.assign({},playerInfo,{id:PGHStore.playerId,isHost:true,ready:true,connected:true,joinOrder:0,sessionScore:0})];
      Rooms.persistSnapshot();
      PGHStorage.saveSession({roomCode:roomCode,playerId:PGHStore.playerId,nickname:playerInfo.nickname,wasHost:true});
      res({peerId:pid});
    }).catch(function(e){
      if(e&&e.message==="ID_TAKEN"&&attempt<4){
        // colisão: tenta outro código
        const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s="";
        for(let i=0;i<5;i++)s+=chars[Math.floor(Math.random()*chars.length)];
        createHost(s,playerInfo,attempt+1).then(res,rej);
      } else rej(e);
    });
  });
}
function onHostConnection(conn){
  conn.on("data",function(msg){ handleMessage(msg,conn); });
  conn.on("close",function(){ onHostConnClosed(conn); });
  conn.on("error",function(){ onHostConnClosed(conn); });
  conn.on("open",function(){ /* aguarda JOIN_REQUEST */ });
}
function onHostConnClosed(conn){
  const pid=conn._playerId;
  if(!pid)return;
  if(conns[pid]!==conn)return;
  const pl=PGHHelpers.getPlayer(pid);
  if(pl&&pl.connected){
    pl.connected=false; pl.ready=false;
    delete conns[pid];
    Chat.sys("⚡ "+pl.nickname+" desconectou");
    AudioManager.play("leave");
    Rooms.broadcastFullSync();
    // remove após 45s se não voltar
    setTimeout(function(){
      const p2=PGHHelpers.getPlayer(pid);
      if(p2&&!p2.connected&&PGHStore.isHost){
        PGHStore.players=PGHStore.players.filter(function(p){return p.id!==pid;});
        Chat.sys("🚪 "+p2.nickname+" saiu da sala");
        Rooms.broadcastFullSync();
      }
    },45000);
  }
}
/* ---------- CLIENT ---------- */
function joinRoom(roomCode,playerInfo,isReconnect){
  destroyPeer(); seenIds.clear();
  PGHStore.isHost=false; PGHStore.roomCode=roomCode;
  const myPeerId=PREFIX+"c-"+PGHHelpers.uid("");
  return new Promise(function(res,rej){
    joinResolve=res; joinReject=rej;
    ensurePeer(myPeerId).then(function(){
      const hp=hostPeerId(roomCode);
      hostConn=peer.connect(hp,{reliable:true,metadata:{playerId:PGHStore.playerId}});
      hostConn.on("open",function(){
        sendToHost({type:"JOIN_REQUEST",payload:{player:playerInfo,reconnect:!!isReconnect}});
        // timeout de join
        setTimeout(function(){ if(joinReject){ const r=joinReject;joinReject=null;joinResolve=null;r(new Error("JOIN_TIMEOUT")); } },12000);
      });
      hostConn.on("data",function(msg){ handleMessage(msg,hostConn); });
      hostConn.on("close",function(){ onClientConnClosed(); });
      hostConn.on("error",function(){ onClientConnClosed(); });
      hostConn.on("iceStateChanged",function(s){ if(s==="disconnected"||s==="failed")onClientConnClosed(); });
      // ping loop
      pingTimer=setInterval(function(){
        if(hostConn&&hostConn.open){ pingSentAt=Date.now(); lastPongId++; sendToHost({type:"PING",payload:{t:pingSentAt,id:lastPongId}}); }
      },4000);
    }).catch(function(e){ joinReject=null;joinResolve=null; rej(e); });
    PGHStorage.saveSession({roomCode:roomCode,playerId:PGHStore.playerId,nickname:playerInfo.nickname,wasHost:false});
  });
}
let clientClosed=false;
function onClientConnClosed(){
  if(clientClosed)return; clientClosed=true;
  setTimeout(function(){clientClosed=false;},3000);
  if(!PGHStore.roomCode)return;
  if(PGHStore.screen==="HOME"||!PGHStore.roomCode)return;
  // host saiu? tenta migração/reconexão
  scheduleReconnect("HOST_LOST");
}
function scheduleReconnect(reason){
  if(PGHStore.isHost||!PGHStore.roomCode||PGHStore.reconnecting||PGHStore.screen==="HOME")return;
  PGHStore.reconnecting=true;
  Rooms.setConnStatus("reconnect","RECONNECTING...");
  Chat.sys("⚡ Conexão perdida ("+reason+"). Reconectando...");
  let attempts=0;
  function attempt(){
    if(PGHStore.screen==="HOME"||!PGHStore.roomCode){PGHStore.reconnecting=false;return;}
    attempts++;
    if(attempts===3){PGHStore.reconnecting=false;Rooms.roomClosed('Host indisponível. A partida foi encerrada sem alterar os pontos já ganhos. Crie ou entre em uma sala.');return;}
    if(attempts>8){
      PGHStore.reconnecting=false;
      Rooms.roomClosed("Não foi possível reconectar. A sala pode ter sido fechada.");
      return;
    }
    Rooms.setConnStatus("reconnect","RECONNECTING... ("+attempts+")");
    const sess=PGHStorage.loadSession();
    const me=PGHStore.profile;
    // tenta reconectar ao host original
    try{
      const hp=hostPeerId(PGHStore.roomCode);
      if(!peer||peer.destroyed){ ensurePeer(PREFIX+"c-"+PGHHelpers.uid("")).then(doConnect).catch(retry); }
      else doConnect();
      function doConnect(){
        try{
          const c=peer.connect(hp,{reliable:true});
          c.on("open",function(){
            hostConn=c;
            c.on("data",function(msg){ handleMessage(msg,c); });
            c.on("close",function(){ onClientConnClosed(); });
            c.on("error",function(){});
            const pl=PGHHelpers.myPlayer();
            sendToHost({type:"JOIN_REQUEST",payload:{player:{
              id:PGHStore.playerId,nickname:me.nickname,avatar:me.avatar,avatarStyle:me.avatarStyle,avatarSeed:me.avatarSeed,frame:me.avatarFrame
            },reconnect:true}});
            PGHStore.reconnecting=false;
            Rooms.setConnStatus("ok","CONNECTED");
            Chat.sys("✅ Reconectado!");
          });
          c.on("error",function(){ retry(); });
          setTimeout(function(){ if(PGHStore.reconnecting) { try{c.close();}catch(e){} retry(); } },5000);
        }catch(e){ retry(); }
      }
    }catch(e){ retry(); }
    function retry(){ reconnectTimer=setTimeout(attempt,2500); }
  }
  attempt();
}
/* migração simples: o client mais antigo tenta virar host */
function tryHostMigration(){
  if(PGHStore.isHost||migrateTimer)return;
  const snap=PGHStore.lastSnapshot;
  if(!snap||!snap.players){return;}
  const connected=snap.players.filter(function(p){return p.connected&&p.id!==snap.hostId;}).sort(function(a,b){return a.joinOrder-b.joinOrder;});
  if(connected.length===0)return;
  if(connected[0].id!==PGHStore.playerId)return; // só o mais antigo migra
  migrateTimer=setTimeout(function(){migrateTimer=null;},20000);
  Chat.sys("👑 Tentando migrar host...");
  const code=PGHStore.roomCode;
  destroyPeer();
  ensurePeer(hostPeerId(code)).then(function(){
    // virei host!
    PGHStore.isHost=true;
    peer.on("connection",onHostConnection);
    syncTimer=setInterval(function(){ Rooms.broadcastFullSync(); },10000);
    PGHStore.players=snap.players.map(function(p){
      if(p.id===PGHStore.playerId)return Object.assign({},p,{isHost:true,connected:true,ready:true});
      if(p.id===snap.hostId)return Object.assign({},p,{connected:false});
      return Object.assign({},p,{connected:false});
    });
    Chat.sys("👑 Você virou o HOST (migração)");
    UI.toast("Você agora é o HOST da sala","warn");
    Rooms.broadcastFullSync();
    PGHStore.reconnecting=false;
    Rooms.setConnStatus("ok","CONNECTED");
    PGHBus.emit("room",{});
  }).catch(function(){
    // alguém já virou host; volta a ser client e tenta conectar
    PGHStore.reconnecting=false;
    scheduleReconnect("MIGRATE_LOST");
  });
}
/* ---------- send ---------- */
function sendToHost(m){
  if(!hostConn||!hostConn.open)return false;
  try{ hostConn.send(Object.assign(mkMsg(m.type,m.payload),{senderId:PGHStore.playerId})); return true; }catch(e){ return false; }
}
function sendTo(playerId,msg){
  if(PGHStore.isHost){
    const c=conns[playerId];
    if(!c||!c.open)return false;
    try{ c.send(Object.assign(mkMsg(msg.type,msg.payload),{})); return true; }catch(e){ return false; }
  }else{
    // client->client via host relay
    return sendToHost({type:"RELAY",payload:{to:playerId,inner:msg}});
  }
}
function broadcast(msg){
  const full=mkMsg(msg.type,msg.payload);
  if(PGHStore.isHost){
    Object.keys(conns).forEach(function(pid){ try{ if(conns[pid].open)conns[pid].send(full); }catch(e){} });
  }else{
    sendToHost({type:full.type,payload:full.payload});
  }
}
function hostBroadcastRaw(full){
  Object.keys(conns).forEach(function(pid){ try{ if(conns[pid].open)conns[pid].send(full); }catch(e){} });
}
/* ---------- receive ---------- */
function handleMessage(msg,conn){
  try{
    if(!msg||!msg.type)return;
    if(msg.roomCode&&PGHStore.roomCode&&msg.roomCode!==PGHStore.roomCode)return;
    if(msg.messageId&&seen(msg.messageId))return;
    if(PGHStore.isHost&&conn){
      const allowed=['JOIN_REQUEST','PLAYER_READY','PLAYER_LEFT','CHAT_MESSAGE','REACTION','GAME_ACTION','PING'];
      if(!allowed.includes(msg.type))return;
      if(msg.type==='JOIN_REQUEST'){
        if(conn._playerId&&conn._playerId!==msg.senderId)return;
        if(msg.payload?.player?.id&&msg.payload.player.id!==msg.senderId)return;
        conn._playerId=msg.senderId;
      }else if(!conn._playerId||conn._playerId!==msg.senderId||conns[msg.senderId]!==conn)return;
    }
    // relay host->dest
    if(msg.type==="RELAY"&&PGHStore.isHost){
      const to=msg.payload&&msg.payload.to, inner=msg.payload&&msg.payload.inner;
      if(to&&inner){ const c=conns[to]; if(c&&c.open){ try{c.send(mkMsg(inner.type,inner.payload));}catch(e){} } }
      return;
    }
    switch(msg.type){
      case "JOIN_REQUEST": if(PGHStore.isHost)Rooms.onJoinRequest(msg,conn); break;
      case "JOIN_ACCEPTED": onJoinAccepted(msg); break;
      case "JOIN_REJECTED": if(joinReject){const r=joinReject;joinReject=null;joinResolve=null;r(new Error(msg.payload&&msg.payload.reason||"REJECTED"));} break;
      case "FULL_STATE_SYNC": Rooms.onFullSync(msg.payload); break;
      case "PLAYER_READY": if(PGHStore.isHost)Rooms.onReady(msg); break;
      case "PLAYER_LEFT":
        if(PGHStore.isHost){
          const lp=PGHHelpers.getPlayer(msg.senderId);
          PGHStore.players=PGHStore.players.filter(function(p){return p.id!==msg.senderId;});
          try{ const c=conns[msg.senderId]; if(c)c.close(); }catch(e){}
          delete conns[msg.senderId];
          if(lp)Chat.sys("🚪 "+lp.nickname+" saiu da sala");
          Rooms.broadcastFullSync();
        }
        break;
      case "CHAT_MESSAGE":
        if(PGHStore.isHost){ hostBroadcastRaw(msg); } // host rebroadcast
        if(msg.senderId!==PGHStore.playerId)Chat.receive(msg.payload);
        break;
      case "REACTION":
        if(PGHStore.isHost){ hostBroadcastRaw(msg); }
        if(msg.senderId!==PGHStore.playerId)Chat.receiveReaction(msg.payload.emoji,msg.payload.nickname);
        break;
      case "GAME_SELECTED": case "GAME_STARTING": case "GAME_STARTED": case "GAME_STATE":
      case "GAME_ACTION": case "GAME_ACTION_RESULT": case "ROUND_STARTED": case "ROUND_ENDED":
      case "GAME_ENDED": case "SCORE_UPDATE":
        GameManager.netHandler(msg); break;
      case "PING":
        if(PGHStore.isHost){ // responde pong unicast
          const c=conns[msg.senderId];
          if(c&&c.open){try{c.send({type:"PONG",senderId:PGHStore.playerId,roomCode:PGHStore.roomCode,messageId:PGHHelpers.uid("m_"),timestamp:Date.now(),payload:{t:msg.payload.t,hostTime:Date.now(),id:msg.payload.id}});}catch(e){}}
        }
        break;
      case "PONG": {
        const rtt=Date.now()-(msg.payload.t||Date.now());
        PGHStore.pingMs=Math.max(1,Math.round(rtt));
        PGHStore.clockOffset=Math.round((msg.payload.hostTime||Date.now())+rtt/2-Date.now());
        Rooms.updatePingUI(); UI.updateDebug();
        break;
      }
      case "KICKED":
        if(!PGHStore.isHost){ Rooms.leaveRoom(); UI.toast("Você foi removido da sala","error"); }
        break;
      case "HOST_TRANSFER": Rooms.onFullSync(msg.payload); break;
      case "MIX_PODIUM":
        if(!PGHStore.isHost&&window.Daily)Daily.showPodium(false);
        break;
      case "ROOM_CLOSED":
        if(!PGHStore.isHost){ Rooms.roomClosed("A sala foi fechada pelo host."); }
        break;
    }
    UI.updateDebug();
  }catch(e){ console.error("[net] handle",e); }
}
function onJoinAccepted(msg){
  const p=msg.payload||{};
  PGHStore.players=p.players||[];
  PGHStore.selectedGame=p.selectedGame||null;
  PGHStore.reconnecting=false;
  PGHStorage.saveSession({roomCode:PGHStore.roomCode,playerId:PGHStore.playerId,nickname:PGHStore.profile.nickname,wasHost:false});
  Rooms.persistSnapshot();
  Rooms.setConnStatus("ok","CONNECTED");
  if(joinResolve){const r=joinResolve;joinResolve=null;joinReject=null;r({players:PGHStore.players});}
  PGHBus.emit("room",{});
}
window.Net={
  createHost:createHost,joinRoom:joinRoom,handleMessage:handleMessage,
  sendToHost:sendToHost,sendTo:sendTo,broadcast:broadcast,hostBroadcastRaw:hostBroadcastRaw,mkMsg:mkMsg,
  disconnect:destroyPeer,
  conns:conns,
  get peer(){return peer;},
  hostPeerId:hostPeerId
};
})();
