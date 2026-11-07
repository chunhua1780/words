/* ================= Reading maths questions aloud, and Chinese translation =================
   Shared by both study sites (same file in each repo).

   readAloud: the text is cut into sentences. Each sentence plays from a stored British recording when the
   site has one (audio/s/), otherwise from Google's British voice, and only then from the device's own
   voice. Tapping the speaker again stops it.

   Chinese: the 中 button shows a Chinese translation under the question, the answer choices, the
   feedback and the worked steps. It stays on for the next questions until it is tapped again. Translations
   come from Google Translate (MyMemory if that fails) and are kept on the device, so each sentence is
   only fetched once. */

/* ---------- reading aloud ---------- */
function speakPrep(t){
  return String(t)
    .replace(/(\d)\s*–\s*(\d)/g,"$1 to $2")
    .replace(/≤/g," less than or equal to ").replace(/≥/g," greater than or equal to ")
    .replace(/</g," less than ").replace(/>/g," greater than ")
    .replace(/×/g," times ").replace(/÷/g," divided by ").replace(/−/g," minus ").replace(/=/g," equals ")
    .replace(/²/g," squared").replace(/³/g," cubed").replace(/°/g," degrees")
    .replace(/(\d)\/(\d+)/g,"$1 over $2").replace(/…/g,".").replace(/⧸/g,"")
    .replace(/\s+/g," ").trim();
}
function raChunks(t){
  const out=[];
  t.replace(/([.?!:;])\s+/g,"$1\u0001").split("\u0001").forEach(s=>{
    while(s.length>180){ // too long for one go: cut at a comma, else at a space
      let cut=s.lastIndexOf(", ",180); if(cut<60)cut=s.lastIndexOf(" ",180); if(cut<1)cut=180;
      out.push(s.slice(0,cut+1).trim()); s=s.slice(cut+1).trim();
    }
    if(s)out.push(s);
  });
  return out;
}
/* stored recordings of sentences: audio/s/<hash>.mp3, listed in SENT_AUDIO (audio/index.js) */
function sentKey(t){t=String(t).replace(/\s+/g," ").trim();let h=0x811c9dc5;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,"0")+t.length.toString(36);}
function storedSent(t){if(typeof SENT_AUDIO==="undefined")return null;const k=sentKey(t);return SENT_AUDIO.has(k)?"audio/s/"+k+".mp3":null;}
/* Play sentences one after another: the stored British recording, else Google's British voice, else the device voice */
function playChunks(chunks,{id=++speakId,onend}={}){
  let i=0;
  const next=()=>{
    if(id!==speakId)return;
    if(i>=chunks.length){onend&&onend();return;}
    const c=chunks[i++], srcs=[storedSent(c),navigator.onLine===false?null:googleUrl(c)].filter(Boolean);
    let k=-1, started=false, done=false;
    const finish=()=>{if(!done&&id===speakId){done=true;next();}};
    const tryNext=()=>{
      if(id!==speakId||done)return; k++; started=false;
      if(k>=srcs.length){tts(c,{rate:.9,onend:finish,id});return;}
      player.onended=finish; player.onplaying=()=>{started=true;};
      player.onerror=()=>{if(id===speakId&&!started)tryNext();};
      player.src=srcs[k]; try{player.playbackRate=1;player.defaultPlaybackRate=1;}catch(e){}
      const kk=k;
      player.play().catch(err=>{if(id!==speakId||kk!==k)return;if(err&&err.name==="NotAllowedError"){showSoundTip();k=srcs.length;tryNext();}else tryNext();});
      setTimeout(()=>{if(id===speakId&&kk===k&&!started&&!done)tryNext();},3000);
    };
    tryNext();
  };
  next();
}
let raBtn=null;
function raDone(){if(raBtn)raBtn.classList.remove("playing");raBtn=null;}
function readAloud(text,btn){
  if(btn&&btn.classList.contains("playing")){stopAudio();raDone();return;} // second tap stops it
  stopAudio(); raDone();
  const chunks=raChunks(speakPrep(text)); if(!chunks.length)return;
  const id=++speakId;
  raBtn=btn||null; if(btn)btn.classList.add("playing");
  playChunks(chunks,{id,onend:()=>{if(id===speakId)raDone();}});
}

/* ---------- Chinese translation ---------- */
const zhOn=()=>{try{return localStorage.getItem("zh-on")==="1";}catch(e){return false;}};
function zhToggle(){try{localStorage.setItem("zh-on",zhOn()?"0":"1");}catch(e){}}
const ZH=new Map();
(()=>{try{Object.entries(JSON.parse(localStorage.getItem("zh-cache")||"{}")).forEach(([k,v])=>ZH.set(k,v));}catch(e){}})();
function zhSave(){
  try{const e=[...ZH.entries()].slice(-3000);localStorage.setItem("zh-cache",JSON.stringify(Object.fromEntries(e)));}catch(e){}
}
const zhKey=t=>String(t).replace(/\s+/g," ").trim();
/* Worth translating: has a real word in it (not just numbers or "Yes") */
const zhWorth=t=>/[A-Za-z]{2,}/.test(t)&&!/^(yes|no)$/i.test(zhKey(t));

async function zhGoogle(lines){
  const r=await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q="+encodeURIComponent(lines.join("\n")));
  if(!r.ok)throw new Error("google "+r.status);
  const j=await r.json(); const out=(j[0]||[]).map(s=>s[0]||"").join("").split("\n").map(s=>s.trim());
  if(out.length!==lines.length)throw new Error("lines");
  return out;
}
async function zhMyMemory(line){
  const r=await fetch("https://api.mymemory.translated.net/get?langpair=en|zh-CN&q="+encodeURIComponent(line.slice(0,480)));
  if(!r.ok)throw new Error("mymemory "+r.status);
  const j=await r.json(); const t=j&&j.responseData&&j.responseData.translatedText;
  if(!t||/MYMEMORY WARNING|QUERY LENGTH/i.test(t))throw new Error("mymemory");
  return t;
}
const zhWaiting=new Set();
async function zhFetch(lines){
  lines=lines.filter(l=>!ZH.has(l)&&!zhWaiting.has(l)); if(!lines.length)return;
  lines.forEach(l=>zhWaiting.add(l));
  try{
    for(let i=0;i<lines.length;i+=25){
      const part=lines.slice(i,i+25);
      let res=null;
      try{res=await zhGoogle(part);}catch(e){
        try{res=await Promise.all(part.map(l=>zhGoogle([l]).then(x=>x[0])));}catch(e2){
          res=[];for(const l of part){try{res.push(await zhMyMemory(l));}catch(e3){res.push(null);}}
        }
      }
      part.forEach((l,k)=>{if(res[k])ZH.set(l,res[k]);});
    }
    zhSave();
  }finally{lines.forEach(l=>zhWaiting.delete(l));}
}
/* Put a translation under each English line inside root:
   [data-zh] elements name their own text; feedback lines and worked steps are found automatically. */
function zhFill(root){
  if(!root||!zhOn())return;
  root.querySelectorAll(".mfb > div > span, .p-steps li, .p-hint > b").forEach(el=>{
    if(el.dataset.zhDone)return; el.dataset.zhDone="1";
    const t=el.textContent; if(!zhWorth(t))return;
    const d=document.createElement("div"); d.className="zh"; d.dataset.zh=zhKey(t); el.append(d);
  });
  const els=[...root.querySelectorAll("[data-zh]")], need=[];
  els.forEach(el=>{const k=el.dataset.zh; if(ZH.has(k))el.textContent=ZH.get(k); else{el.textContent="翻译中…";el.classList.add("wait");need.push(k);}});
  if(!need.length)return;
  if(navigator.onLine===false){els.forEach(el=>{if(!ZH.has(el.dataset.zh))el.textContent="(没有网络，暂时不能翻译)";});return;}
  zhFetch([...new Set(need)]).then(()=>{
    root.querySelectorAll("[data-zh]").forEach(el=>{const k=el.dataset.zh;
      if(ZH.has(k)){el.textContent=ZH.get(k);el.classList.remove("wait");}
      else if(!zhWaiting.has(k)){el.textContent="(翻译暂时连不上，请稍后再试)";el.classList.remove("wait");}});
  });
}
/* A translation line to put under some English text (empty when the switch is off) */
const zhLine=(t,cls="")=>zhOn()&&zhWorth(t)?`<div class="zh ${cls}" data-zh="${esc(zhKey(t))}"></div>`:"";
const zhBtnHtml=()=>`<button class="icon-btn sm zh-btn ${zhOn()?"on":""}" id="mZh" aria-label="Show Chinese translation" aria-pressed="${zhOn()}">中</button>`;
