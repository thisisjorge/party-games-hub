/* PGH Characters — elenco arcade original: render de portraits pixel-art 16x16 + expressões.
   Data em data/characters.js. Sem DOM aqui (só strings) — testável em node. */
(function(){
"use strict";
function list(){ return window.PGH_CHARACTERS || []; }
function get(id){ const l=list(); for(let i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return null; }
function has(id){ return !!get(id); }
function randomId(rng){ const l=list(); if(!l.length) return null; const r=rng?rng():Math.random(); return l[Math.floor(r*l.length)%l.length].id; }
function applyExpr(ch, expr){
  const rows = ch.map.slice();
  const E = (window.PGH_EXPRESSIONS||{})[expr||"NORMAL"];
  if(!E) return rows;
  function seg(ri, s){
    if(ri==null || s==null || !rows[ri]) return;
    rows[ri] = rows[ri].slice(0,3) + s + rows[ri].slice(13);
  }
  seg(ch.face.brow, E.brow);
  if(ch.face.eyes && E.eyes){ seg(ch.face.eyes[0], E.eyes[0]); seg(ch.face.eyes[1], E.eyes[1]); }
  seg(ch.face.mouth, E.mouth);
  return rows;
}
function rowsToSVG(rows, pal){
  const byColor = {};
  for(let y=0;y<16;y++){
    const row = rows[y] || "";
    let x = 0;
    while(x<16){
      const k = row[x];
      if(k==="." || !pal[k]){ x++; continue; }
      let x2=x;
      while(x2+1<16 && row[x2+1]===k) x2++;
      (byColor[k] = byColor[k] || []).push([x, y, x2-x+1]);
      x = x2+1;
    }
  }
  let paths = "";
  Object.keys(byColor).forEach(function(k){
    let d = "";
    byColor[k].forEach(function(r){ d += "M"+r[0]+" "+r[1]+"h"+r[2]+"v1h-"+r[2]+"z"; });
    paths += "<path fill='"+pal[k]+"' d='"+d+"'/>";
  });
  return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'>"+paths+"</svg>";
}
function toSVG(id, expr){
  const ch = get(id); if(!ch) return "";
  return rowsToSVG(applyExpr(ch, expr), ch.palette);
}
function dataURI(id, expr){
  const s = toSVG(id, expr); if(!s) return "";
  return "data:image/svg+xml,"+encodeURIComponent(s);
}
/* Fonte de portrait p/ qualquer player/profile: elenco (c/ expressão) ou DiceBear legado. */
function portraitSrc(pl, expr){
  try{
    if(pl && pl.character && has(pl.character)) return dataURI(pl.character, expr||"NORMAL");
  }catch(e){}
  const u = (pl && (pl.avatar||"")) || "";
  if(u) return u;
  try{ if(window.ProfileManager) return ProfileManager.avatarUrl("pixel-art","x"); }catch(e){}
  return "";
}
window.CharPortraits = { list:list, get:get, has:has, randomId:randomId, applyExpr:applyExpr, rowsToSVG:rowsToSVG, toSVG:toSVG, dataURI:dataURI, portraitSrc:portraitSrc };
window.portraitSrc = portraitSrc;
})();
