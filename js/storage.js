/* PGH Storage — localStorage (perfil/settings) + sessionStorage (sessão da sala).
   Blindado p/ contextos onde storage lança exceção (ex: iframe sandboxed / origin opaca):
   cai num fallback em memória sem quebrar o boot. Comportamento normal inalterado. */
(function(){
"use strict";
const LS_PROFILE="pgh_profile_v1", LS_SETTINGS="pgh_settings_v1", SS_SESSION="pgh_session_v1";
const memL={}, memS={};
function safeParse(s,f){ try{ const v=JSON.parse(s); return v==null?f:v; }catch(e){ return f; } }
function lsGet(k){ try{ const v=window.localStorage.getItem(k); return v==null?null:v; }catch(e){ return (k in memL)?memL[k]:null; } }
function lsSet(k,v){ v=String(v); try{ window.localStorage.setItem(k,v); }catch(e){ memL[k]=v; } }
function lsDel(k){ try{ window.localStorage.removeItem(k); }catch(e){ delete memL[k]; } }
function ssGet(k){ try{ const v=window.sessionStorage.getItem(k); return v==null?null:v; }catch(e){ return (k in memS)?memS[k]:null; } }
function ssSet(k,v){ v=String(v); try{ window.sessionStorage.setItem(k,v); }catch(e){ memS[k]=v; } }
function ssDel(k){ try{ window.sessionStorage.removeItem(k); }catch(e){ delete memS[k]; } }
window.PGHStorage={
  loadProfile(){ return safeParse(lsGet(LS_PROFILE),null); },
  saveProfile(p){ try{ lsSet(LS_PROFILE,JSON.stringify(p)); }catch(e){} },
  clearProfile(){ try{ lsDel(LS_PROFILE); }catch(e){} },
  loadSettings(){ return Object.assign({sound:true,volume:0.7,crt:true,reducedEffects:false}, safeParse(lsGet(LS_SETTINGS),{})); },
  saveSettings(s){ try{ lsSet(LS_SETTINGS,JSON.stringify(s)); }catch(e){} },
  saveSession(sess){ try{ ssSet(SS_SESSION,JSON.stringify(sess)); }catch(e){} },
  loadSession(){ return safeParse(ssGet(SS_SESSION),null); },
  clearSession(){ try{ ssDel(SS_SESSION); }catch(e){} }
};
})();
