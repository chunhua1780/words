/* Word Speller phonics: splits a word into spelling chunks and gives each chunk its real sound.
   Sounds come from the CMU Pronouncing Dictionary (cmu.txt, US English, with stress).
   Each sound is written as a simple "say-it" spelling (e.g. "tial" -> "shul") that a voice engine reads correctly.
   Works in the browser and in Node (for testing). */
"use strict";
(function(root){
const PH_VERSION=5;

/* ---------- Spelling side ---------- */
const VOW="aeiou";
function vowelGroups(lw,opt){
  const n=lw.length;
  const isV=i=>VOW.includes(lw[i])||(lw[i]==="y"&&i>0&&!VOW.includes(lw[i-1]));
  const g=[]; for(let i=0;i<n;){if(isV(i)){let j=i;while(j<n&&isV(j))j++;g.push([i,j]);i=j;}else i++;}
  if(opt.keepE)return g;
  if(g.length>1){const last=g[g.length-1];
    if(last[0]===n-1&&lw[n-1]==="e"&&!(lw[n-2]==="l"&&n>2&&!isV(n-3)))g.pop();           // silent e (cake), but not ta-ble
    else if(last[0]===n-2&&/e[sd]$/.test(lw)&&!/[td]ed$|[sxz]es$|[cs]hes$|ges$/.test(lw))g.pop(); // jumped, cakes
  }
  return g;
}
/* Vowel pairs that are often two separate sounds (li-on, flu-ent, cre-ate) */
const HIATUS=["io","ia","iu","ue","ua","uo","ui","eo","ea","oe","ie","ao","ae","eu","oa","ei","uou","iou"];
function splitGroups(lw,g,want){
  g=g.map(x=>x.slice());
  for(const pair of HIATUS){
    for(let k=0;k<g.length&&g.length<want;k++){
      const [a,b]=g[k]; const s=lw.slice(a,b);
      const at=s.indexOf(pair.slice(0,2));
      if(b-a>=2&&at>=0){g.splice(k,1,[a,a+at+1],[a+at+1,b]);k++;}
    }
    if(g.length>=want)break;
  }
  return g;
}
/* Make the number of vowel groups match the number of spoken syllables (if known) */
function fitGroups(lw,want){
  let g=vowelGroups(lw,{});
  if(!want)return g;
  if(g.length<want){const s=splitGroups(lw,g,want);if(s.length===want)return s;}            // cre-ate, li-on, flu-ent
  if(g.length!==want){const k=vowelGroups(lw,{keepE:true});if(k.length===want)return k;}   // re-ci-pe
  if(g.length<want)g=splitGroups(lw,vowelGroups(lw,{keepE:true}),want);
  while(g.length>want){ // a vowel letter that is not spoken: Wednes-day, choc-late
    let best=-1;
    for(let k=1;k<g.length;k++){const v=lw.slice(g[k][0],g[k][1]);if(v.length===1&&k<g.length-1&&"eoia".includes(v)){best=k;break;}}
    if(best<0)best=g.length-1>0&&lw.slice(g[g.length-1][0])==="e"?g.length-1:1;
    const m=[g[best-1][0],g[best][1]];g.splice(best-1,2,m);
  }
  return g;
}
/* Where to cut between two vowel groups */
const DI=["ch","sh","th","ph","wh","gh"], AFTER=["ck","ng","x"], BL=["bl","br","cl","cr","dr","fl","fr","gl","gr","pl","pr","tr","wr","sc","sk","sp","st","sw","sm","sn","sl","tw","dw","qu"];
function cutsFor(lw,g){
  const n=lw.length, cuts=[];
  for(let k=0;k<g.length-1;k++){
    const s=g[k][1], e=g[k+1][0], num=e-s; let cut;
    if(k===g.length-2&&e===n-1&&lw[n-1]==="e"&&lw[n-2]==="l")cut=e-2;                  // ta-ble
    else if(num===0)cut=s;                                                                // li-on
    else if(num===1)cut=lw[s]==="x"?s+1:s;                                                // ti-ger, tax-i
    else{const p=lw.slice(s,s+2);
      if(num===2&&DI.includes(p))cut=s;                                                   // tea-cher
      else if(p==="ck"||(p==="ng"&&!"eiy".includes(lw[s+2])))cut=s+2;                    // chick-en, sing-er
      else if(num===2&&BL.slice(0,13).includes(p))cut=s;                                  // li-brar-y
      else if(num>=3)cut=BL.includes(lw.slice(e-2,e))||["ch","sh","th","ph","wh"].includes(lw.slice(e-2,e))?e-2:e-1; // sub-stan, chil-dren, Thurs-day, pump-kin
      else cut=s+1;}                                                                      // rab-bit, bas-ket
    if(cut>(cuts[cuts.length-1]||0)&&cut<n)cuts.push(cut);
  }
  return cuts;
}
/* Endings spelled differently from how they sound. They stay one chunk. */
const SUFFIX=[["tial","shul"],["cial","shul"],["tion","shun"],["sion","shun"],["cian","shun"],["cious","shus"],["tious","shus"],["ture","cher"],["sure","zher"],
  ["ous","us"],["ence","ens"],["ance","ans"],["ment","ment"],["ness","ness"],["less","less"],["ful","ful"],["ing","ing"]];
function spellChunks(word,want){
  const lw=word.toLowerCase();
  let suf=null;
  for(const [s] of SUFFIX)if(lw.endsWith(s)&&lw.length>=s.length+2){suf=s;break;}
  const stem=suf?word.slice(0,-suf.length):word, sl=stem.toLowerCase();
  const sufSyl=suf?1:0;
  const wantStem=want?want-sufSyl:null;
  let g=fitGroups(sl,wantStem);
  let parts;
  if(!sl.length||g.length===0)parts=sl.length?[stem]:[];
  else if(g.length===1)parts=[stem];
  else{const cuts=cutsFor(sl,g);parts=[];let p=0;cuts.forEach(c=>{parts.push(stem.slice(p,c));p=c;});parts.push(stem.slice(p));}
  // a stem with no vowel (e.g. "s" in "station" is never a stem) joins the suffix
  if(suf&&parts.length&&!/[aeiouy]/i.test(parts[parts.length-1])){const last=parts.pop();return {parts:[...parts,last+word.slice(-suf.length)],suf:null};}
  if(suf&&!parts.length)return {parts:[word],suf:null};
  return {parts:suf?[...parts,word.slice(-suf.length)]:parts,suf,sufSyl,stemGroups:g.length};
}

/* ---------- Sound side (ARPAbet from CMU) ---------- */
const VOWELS=new Set(["AA","AE","AH","AO","AW","AY","EH","ER","EY","IH","IY","OW","OY","UH","UW"]);
const parsePh=s=>s.trim().split(/\s+/).map(x=>{const m=x.match(/^([A-Z]+)([012])?$/);return {p:m[1],s:m[2]==null?null:+m[2]};});
const isVow=x=>VOWELS.has(x.p);
/* How many sounds a run of consonant letters usually makes */
function consUnits(str){
  let n=0,i=0;
  while(i<str.length){
    const two=str.slice(i,i+2);
    if(["sh","ch","th","ph","wh","ck","ng","gh","qu","dg"].includes(two)||(two.length===2&&two[0]===two[1])){n+=two==="qu"?2:1;i+=2;continue;}
    if(str[i]==="x"){n+=2;i++;continue;}
    if(str[i]==="h"&&i>0){i++;continue;}
    n++;i++;
  }
  return n;
}
/* Which letters can spell each consonant sound (longest first) */
const PH_LETTERS={B:["bb","b"],CH:["tch","ch","t","c"],D:["dd","d"],DH:["th"],F:["ff","ph","gh","f"],G:["gg","gh","g"],HH:["wh","h"],JH:["dg","j","g","d"],
  K:["ck","cc","ch","c","k","q","x"],L:["ll","l"],M:["mm","m"],N:["nn","kn","gn","n"],NG:["ng","n"],P:["pp","p"],R:["rr","wr","r"],S:["ss","sc","s","c","x","z"],
  SH:["ss","sh","ch","s","c","t"],T:["tt","t","d"],TH:["th"],V:["v","f"],W:["wh","w","u"],Y:["y","i","u","e"],Z:["zz","z","s","x"],ZH:["s","z","g"]};
const SILENT="ehwbkgdtur";
function matchLen(p,letters,pos){const c=PH_LETTERS[p]||[];for(const x of c)if(letters.startsWith(x,pos))return x.length;return 0;}
/* Split the phones into one piece per spelling chunk */
function alignPhones(parts,ph){
  const nuc=ph.map((x,i)=>isVow(x)?i:-1).filter(i=>i>=0);
  if(nuc.length!==parts.length)return null;
  const pieces=[]; let start=0;
  for(let k=0;k<parts.length;k++){
    if(k===parts.length-1){pieces.push(ph.slice(start));break;}
    const a=nuc[k], b=nuc[k+1], m=b-a-1;
    const left=parts[k].toLowerCase(), right=parts[k+1].toLowerCase();
    const coda=left.replace(/^[^aeiouy]*[aeiouy]+/,"").replace(/^y/,""), onset=(right.match(/^[^aeiouy]*/)||[""])[0];
    const cl=coda.replace(/e$/,"");
    let take=0, pos=0;
    for(let q=a+1;q<b&&pos<cl.length;q++){ // walk the coda letters and the sounds together, skipping silent letters
      let len=0, skip=0;
      while(pos+skip<cl.length&&skip<=2){len=matchLen(ph[q].p,cl,pos+skip);if(len||!SILENT.includes(cl[pos+skip]))break;skip++;}
      if(!len)break;
      take++; pos+=skip+len;
    }
    if(!onset&&take<m)take=m; // no consonant letters start the next chunk: all sounds stay here
    const doubled=cl&&onset&&cl[cl.length-1]===onset[0]&&take>0; // ap|ple, es|sen, tor|ren: the sound belongs to both chunks
    pieces.push(ph.slice(start,a+1+take));
    start=a+1+take-(doubled&&take>0&&matchLen(ph[a+take].p,onset,0)?1:0);
  }
  // an "er" sound swallowed the r that starts the next chunk (pre-fer-en-tial): give it back
  for(let k=1;k<pieces.length;k++)if(/^r/i.test(parts[k])&&pieces[k][0]&&isVow(pieces[k][0])&&pieces[k-1].some(x=>x.p==="ER"))pieces[k]=[{p:"R",s:null},...pieces[k]];
  return pieces;
}
/* Write a piece of pronunciation the way a voice engine will read it correctly */
const CONS={B:"b",CH:"ch",D:"d",DH:"th",F:"f",G:"g",HH:"h",JH:"j",K:"k",L:"l",M:"m",N:"n",NG:"ng",P:"p",R:"r",S:"s",SH:"sh",T:"t",TH:"th",V:"v",W:"w",Y:"y",Z:"z",ZH:"zh"};
function respell(piece,next){
  const vi=piece.findIndex(isVow); if(vi<0)return piece.map(x=>CONS[x.p]||"").join("");
  const onsetPh=piece.slice(0,vi), v=piece[vi]; let codaPh=piece.slice(vi+1);
  let on=onsetPh.map(x=>CONS[x.p]).join("");
  let rC=codaPh[0]&&codaPh[0].p==="R";
  if(rC)codaPh=codaPh.slice(1);
  codaPh=codaPh.filter((x,i)=>!(i===0&&(x.p==="W"||x.p==="Y")&&codaPh.length===1&&next));
  let co=codaPh.map(x=>CONS[x.p]).join("");
  if(!co&&!rC&&next&&(["AE","EH","IH","UH","AA"].includes(v.p)||(v.p==="AH"&&v.s>0))&&(v.s>0||v.p==="AE")){
    const n0=next[0]; if(n0&&!isVow(n0)&&CONS[n0.p]&&!["W","Y","HH","R"].includes(n0.p)){codaPh=[n0];co=CONS[n0.p];}
  }
  const open=!co&&!rC;
  let nucleus;
  switch(v.p){
    case "AA":nucleus=rC?"ar":open?"ah":"o";break;
    case "AE":nucleus=rC?"air":"a";break;
    case "AH":nucleus=rC?"er":open?"uh":"u";break;
    case "AO":nucleus=rC?"or":"aw";break;
    case "AW":nucleus=rC?"our":"ow";break;
    case "AY":nucleus=rC?"ire":open?(on?"y":"eye"):"i_e";break;
    case "EH":nucleus=rC?"air":open?"eh":"e";break;
    case "ER":nucleus=rC?"err":"er";break;
    case "EY":nucleus=rC?"air":open?"ay":"a_e";break;
    case "IH":nucleus=rC?"eer":open?"ih":"i";break;
    case "IY":nucleus=rC?"eer":"ee";break;
    case "OW":nucleus=rC?"ore":open?"oh":"o_e";break;
    case "OY":nucleus="oy";break;
    case "UH":nucleus=rC?"oor":"uu";break;
    case "UW":nucleus=rC?"oor":"oo";break;
  }
  if(nucleus.includes("_")){ // long vowel in a closed syllable: magic e (fine, tape, bone) or a vowel team
    const [vv]=nucleus.split("_");
    nucleus=codaPh.length===1?vv+co+"e":({i:"igh",a:"ai",o:"oa"}[vv])+co; co="";
  }
  if(/^(g)$/.test(on.slice(-1))&&/^[eiy]/.test(nucleus))on=on+"h";      // hard g before e/i: "gheh"
  if(on.endsWith("k")&&nucleus==="o"&&!co)nucleus="ah";
  let out=on+nucleus+co;
  if(out==="u"||out==="uh")out="uh";
  if(/^[a-z]$/.test(out))out=out+"h";
  return out;
}
const stressOf=piece=>{const v=piece.find(isVow);return v?v.s:0;};

/* Respelled sound for a chunk when the word is not in the dictionary */
function guessSound(chunk,isLast,sufInfo){
  const c=chunk.toLowerCase();
  if(isLast){const s=SUFFIX.find(([x])=>x===c);if(s)return s[1];}
  return c.replace(/^c(?=[aou])/,"k").replace(/^ph/,"f");
}

/* ---------- Dictionary loading ---------- */
let DICT_TEXT=null, loading=null;
function setDict(text){DICT_TEXT="\n"+text;}
function loadDict(url){
  if(DICT_TEXT)return Promise.resolve();
  if(!loading)loading=fetch(url||"cmu.txt").then(r=>{if(!r.ok)throw new Error("dict "+r.status);return r.text();}).then(setDict).catch(e=>{loading=null;throw e;});
  return loading;
}
function lookup(word){
  if(!DICT_TEXT)return null;
  const key="\n"+word.toLowerCase()+"\t", i=DICT_TEXT.indexOf(key);
  if(i<0)return null;
  const j=DICT_TEXT.indexOf("\n",i+key.length);
  return DICT_TEXT.slice(i+key.length,j<0?undefined:j);
}

/* ---------- Main: analyse one word ---------- */
/* Returns {v, c:[chunks], s:[sounds], st:index of the stressed chunk or -1, src:"dict"|"rules"} */
function analyse(word){
  word=String(word).trim();
  if(/\s/.test(word)){ // a phrase: analyse each word
    const out={v:PH_VERSION,c:[],s:[],st:-1,src:"dict",words:[]};
    word.split(/\s+/).forEach(w=>{const a=analyse(w);out.words.push(a.c.length);a.c.forEach((c,k)=>{out.c.push(c);out.s.push(a.s[k]);});if(a.src!=="dict")out.src="rules";});
    return out;
  }
  const pr=/^[a-z']+$/i.test(word)&&lookup(word.replace(/’/g,"'"));
  if(pr){
    const ph=parsePh(pr), N=ph.filter(isVow).length;
    let sp=spellChunks(word,N);
    let pieces=alignPhones(sp.parts,ph);
    if(!pieces&&sp.suf){ // try without keeping the ending as one chunk
      const lw=word.toLowerCase();const g=fitGroups(lw,N);
      if(g.length===N){const cuts=cutsFor(lw,g);const parts=[];let p=0;cuts.forEach(c=>{parts.push(word.slice(p,c));p=c;});parts.push(word.slice(p));sp={parts};pieces=alignPhones(parts,ph);}
    }
    if(pieces){
      const s=pieces.map((p,k)=>respell(p,pieces[k+1])), st=pieces.map(stressOf);
      return {v:PH_VERSION,c:sp.parts,s,st:st.indexOf(1),src:"dict",ph:pr};
    }
    if(N===1)return {v:PH_VERSION,c:[word],s:[respell(ph)],st:0,src:"dict",ph:pr};
  }
  const sp=spellChunks(word,null);
  return {v:PH_VERSION,c:sp.parts.length?sp.parts:[word],s:(sp.parts.length?sp.parts:[word]).map((c,k,a)=>guessSound(c,k===a.length-1)),st:-1,src:"rules"};
}

/* Things to watch out for when spelling the word */
function tricky(word,a){
  const lw=word.toLowerCase(), out=[];
  a=a||analyse(word);
  const last=a.c[a.c.length-1]||"", ls=last.toLowerCase(), suf=SUFFIX.find(([x])=>x===ls);
  if(a.c.length>1&&suf)out.push(["ending",`“${last}” sounds like “${a.s[a.s.length-1]}”`]);
  [...new Set(lw.match(/([bcdfgklmnprstz])\1/g)||[])].forEach(d=>out.push(["double",`Double letters: ${d}`]));
  if(/^kn/.test(lw))out.push(["silent","k is silent in kn"]);
  if(/^wr/.test(lw))out.push(["silent","w is silent in wr"]);
  if(/mb$/.test(lw))out.push(["silent","b is silent at the end"]);
  if(/igh|ght/.test(lw))out.push(["silent","gh is silent"]);
  if(/^ps|^pn/.test(lw))out.push(["silent","p is silent at the start"]);
  if(/[^c]ei/.test(lw)||/cei/.test(lw))out.push(["vowels","e before i here"]);
  if(/ie/.test(lw)&&!/ie$/.test(lw)&&!/ie[sd]$/.test(lw))out.push(["vowels","i before e here"]);
  if(a.src==="dict"&&a.ph){ // a vowel that sounds like "uh" is easy to misspell
    a.c.forEach((c,k)=>{if(k!==a.st&&/^[^aeiouy]*uh?[^aeiouy]*$/.test(a.s[k])&&/[aeio]/i.test(c)&&out.length<4&&!SUFFIX.some(([x])=>x===c.toLowerCase())){
      const v=(c.match(/[aeiouy]+/i)||[""])[0]; if(v&&v.toLowerCase()!=="u")out.push(["schwa",`In “${c}” the “${v}” sounds like “uh”`]);}});
  }
  return out.slice(0,4).map(x=>x[1]);
}

/* Letter names, written so every voice engine says the name (not the sound) */
const LETTER_NAMES={a:"A.",b:"B.",c:"C.",d:"D.",e:"E.",f:"F.",g:"G.",h:"H.",i:"I.",j:"J.",k:"K.",l:"L.",m:"M.",n:"N.",o:"O.",p:"P.",q:"Q.",r:"R.",s:"S.",t:"T.",u:"U.",v:"V.",w:"W.",x:"X.",y:"Y.",z:"Z."};
const LETTER_SAY={a:"ay",b:"bee",c:"see",d:"dee",e:"ee",f:"eff",g:"jee",h:"aitch",i:"eye",j:"jay",k:"kay",l:"ell",m:"em",n:"en",o:"oh",p:"pee",q:"cue",r:"are",s:"ess",t:"tee",u:"you",v:"vee",w:"double you",x:"ex",y:"why",z:"zee"};

const API={PH_VERSION,analyse,tricky,loadDict,setDict,lookup,spellChunks,respell,parsePh,alignPhones,SUFFIX,LETTER_NAMES,LETTER_SAY};
if(typeof module!=="undefined"&&module.exports)module.exports=API; else root.Phonics=API;
})(typeof window!=="undefined"?window:globalThis);
