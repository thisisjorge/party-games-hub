/* Two static frontends assembled from the same source files. No bundler required. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
function copy(relative,target){const src=path.join(root,relative),dest=path.join(target,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.cpSync(src,dest,{recursive:true});}
function references(html){return [...html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)].map(m=>m[1]).filter(p=>!p.includes(':')&&!p.startsWith('#')&&/\.(js|css)$/.test(p));}
for(const [name,entry] of [['hub','index.html'],['jungle','jungle.html']]){
 const dest=path.resolve(dist,name);
 if(dest!==path.join(root,'dist',name)||!dest.startsWith(root+path.sep))throw new Error('Invalid build directory');
 if(fs.existsSync(dest)&&fs.realpathSync(dest)!==dest)throw new Error('Refusing linked build directory');
 fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(dest,{recursive:true});
 let html=fs.readFileSync(path.join(root,entry),'utf8');
 if(name==='jungle')html=html.replaceAll('href="jungle.html"','href="index.html"');
 fs.writeFileSync(path.join(dest,'index.html'),html);
 for(const f of references(html))copy(f,dest);
 copy('assets/maps/terrain-base.png',dest);copy('assets/structures',dest);
 copy('licenses',dest);copy('THIRD-PARTY.md',dest);
  if(name==='hub'){
  copy('assets/fonts',dest);
  copy('jungle.html',dest);for(const f of references(fs.readFileSync(path.join(root,'jungle.html'),'utf8')))copy(f,dest);
 }
 let config=fs.readFileSync(path.join(root,'config.js'),'utf8');
 if(process.env.PGH_HUB_URL){const url=new URL(process.env.PGH_HUB_URL);if(url.protocol!=='https:')throw new Error('PGH_HUB_URL must use HTTPS');config+='\nPGH_CONFIG.hubUrl='+JSON.stringify(url.href)+';\n';}
 if(name==='jungle'&&!process.env.PGH_HUB_URL)config+='\nPGH_CONFIG.hubUrl="./hub-unavailable.html";\n';
 fs.writeFileSync(path.join(dest,'config.js'),config);
 if(name==='jungle')fs.writeFileSync(path.join(dest,'hub-unavailable.html'),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Party Games Hub</title><body style="background:#090d17;color:#e8f1eb;font:20px sans-serif;padding:8vw"><h1>Party Games Hub</h1><p>O endereço multiplayer será informado quando a publicação do Hub estiver concluída.</p><a style="color:#70efae" href="index.html">Voltar ao treino</a></body></html>');
 fs.writeFileSync(path.join(dest,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/config.js\n  Cache-Control: no-store\n');
 const hashes={};function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,item.name);if(item.isDirectory())walk(f);else hashes[path.relative(dest,f).replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');}}walk(dest);
 fs.writeFileSync(path.join(dest,'build-manifest.json'),JSON.stringify({version:'1.0.0-rc.1',product:name,files:hashes},null,2));
 console.log(name+': '+Object.keys(hashes).length+' files → '+path.relative(root,dest));
}
for(const file of ['js/games/jungle-gap.js','data/scenario-state-model.js','data/lane-geometry.js','data/jungle-structures.js','data/jungle-scenarios.js']){
 if(!fs.readFileSync(path.join(dist,'hub',file)).equals(fs.readFileSync(path.join(dist,'jungle',file))))throw new Error('Shared core diverged: '+file);
}
