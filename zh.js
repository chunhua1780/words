/* ================= Reading maths questions aloud, and Chinese translation =================
   Shared by both study sites (same file in each repo).

   readAloud: the device's own voice reads first. It works offline and copes with long questions, which
   the online voice could not (Google only reads up to about 200 letters, so long questions stayed silent).
   The text is cut into sentences so no browser stops part way. If the device voice does not start within
   1.5 seconds, the sentences are played one after another from Google's voice instead. Tapping the
   speaker again stops it.

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
  t.split(/(?<=[.?!:;])\s+/).forEach(s=>{
    while(s.length>180){ // too long for one go: cut at a comma, else at a space
      let cut=s.lastIndexOf(", ",180); if(cut<60)cut=s.lastIndexOf(" ",180); if(cut<1)cut=180;
      out.push(s.slice(0,cut+1).trim()); s=s.slice(cut+1).trim();
    }
    if(s)out.push(s);
  });
  return out;
}
let raBtn=null;
function raDone(){if(raBtn)raBtn.classList.remove("playing");raBtn=null;}
function readAloud(text,btn){
  if(btn&&btn.classList.contains("playing")){stopAudio();raDone();return;} // second tap stops it
  stopAudio(); raDone();
  const chunks=raChunks(speakPrep(text)); if(!chunks.length)return;
  const id=++speakId;
  raBtn=btn||null; if(btn)btn.classList.add("playing");
  const fin=()=>{if(id===speakId)raDone();};
  setTimeout(fin,4000+chunks.join(" ").length*120); // never leave the button stuck
  let online=false;
  const viaGoogle=()=>{
    if(id!==speakId||online)return; online=true;
    try{speechSynthesis.cancel();}catch(e){}
    if(navigator.onLine===false){showSoundTip();fin();return;}
    let i=0;
    const next=()=>{
      if(id!==speakId)return;
      if(i>=chunks.length){fin();return;}
      const k=i++;
      player.onended=next; player.onplaying=null;
      player.onerror=()=>{if(id===speakId&&i===k+1)next();};
      player.src=googleUrl(chunks[k]);
      try{player.playbackRate=1;player.defaultPlaybackRate=1;}catch(e){}
      player.play().catch(err=>{if(id!==speakId||i!==k+1)return; if(err&&err.name==="NotAllowedError"){showSoundTip();fin();} else next();});
    };
    next();
  };
  if(!("speechSynthesis" in window)){viaGoogle();return;}
  const ss=speechSynthesis; let started=false;
  try{ss.cancel();ss.resume();}catch(e){}
  chunks.forEach((c,k)=>{
    const u=new SpeechSynthesisUtterance(c); u.lang="en-GB"; u.rate=.9; if(voice)u.voice=voice;
    u.onstart=()=>{started=true;};
    if(k===chunks.length-1)u.onend=fin;
    u.onerror=e=>{if(id===speakId&&!started&&!/interrupted|canceled/.test(e.error||""))viaGoogle();};
    ss.speak(u);
  });
  setTimeout(()=>{if(id===speakId&&!started&&!ss.speaking)viaGoogle();},1500);
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
