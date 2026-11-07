// node jobs.js <repo dir> <book.json> <out jobs.json>   — lists everything to record, with the same chunking as the site
const fs=require('fs'), path=require('path');
const [repo,bookf,out]=process.argv.slice(2);
const zh=fs.readFileSync(path.join(repo,'zh.js'),'utf8');
const grab=name=>{const i=zh.indexOf('function '+name+'(');let d=0,j=zh.indexOf('{',i);for(let k=j;k<zh.length;k++){if(zh[k]==='{')d++;else if(zh[k]==='}'){d--;if(!d)return zh.slice(i,k+1);}}};
eval(grab('speakPrep')+';'+grab('raChunks')+';global.speakPrep=speakPrep;global.raChunks=raChunks;');
const key=t=>String(t).replace(/\s+/g," ").trim();
const hash=t=>{t=key(t);let h=0x811c9dc5;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,"0")+t.length.toString(36);};
const slug=w=>String(w).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
global.window={};global.document={addEventListener(){},createElement(){return {}},head:{appendChild(){}}};
const load=f=>{if(fs.existsSync(path.join(repo,f)))return fs.readFileSync(path.join(repo,f),'utf8').replace(/"use strict";/g,'');return '';};
let READ=[]; eval(load('readings.js')+load('readings-easy.js')+';READ=READINGS;');
const words=new Set(), sents=new Set();
const addW=w=>{w=String(w||"").trim().replace(/’/g,"'");if(/^[A-Za-z][A-Za-z' -]{0,30}$/.test(w))words.add(w);};
const addS=s=>{s=key(s);if(s&&s.length>3)sents.add(s);};
// statutory lists and phonics (Year 5 site)
const eng=load('english.js');
if(eng){for(const m of eng.matchAll(/words:"([^"]+)"\.split/g))m[1].split(" ").forEach(addW);
  for(const m of eng.matchAll(/,w:"([^"]+)"\}/g))m[1].replace(/[\[\]]/g,"").split(" ").forEach(addW);}
// Year 7 weekly words
const w7=load('words7.js'); if(w7){let WW;eval(w7+';WW=WEEK_WORDS;');for(const [,ws] of WW)for(const x of ws){addW(x[0]);if(x[2])addS(x[2]);}}
// the child's own words and example sentences
const bk=JSON.parse(fs.readFileSync(bookf,'utf8')).data; for(const w of Object.values(bk.words||{})){addW(w.w);if(w.ex)addS(w.ex);}
// diary ideas, sound test
const dj=load('diary.js'); for(const m of dj.matchAll(/^  "([^"]+)",$/gm))addS(m[1]);
addS("Hello! Let's practise some spellings.");
// reading passages: each paragraph cut exactly as the reader does
for(const r of READ)for(const p of r.text)for(const c of raChunks(speakPrep(p)))addS(c);
const jobs=[];
for(const w of words){jobs.push(["audio/w/"+slug(w)+".mp3",w,"-10%"]);jobs.push(["audio/ws/"+slug(w)+".mp3",w,"-45%"]);}
for(const s of sents)jobs.push(["audio/s/"+hash(s)+".mp3",s,"-6%"]);
"abcdefghijklmnopqrstuvwxyz".split("").forEach(l=>jobs.push(["audio/l/"+l+".mp3",l==="z"?"Zed.":l.toUpperCase()+".","-10%"]));
fs.writeFileSync(out,JSON.stringify(jobs));
fs.writeFileSync(out.replace('.json','-index.json'),JSON.stringify({w:[...new Set([...words].map(slug))].sort(),s:[...sents].map(hash).sort()}));
console.log(repo,'words',words.size,'sentences',sents.size,'chars',[...sents].join(' ').length);
