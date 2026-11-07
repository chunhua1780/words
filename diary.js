/* ================= 日记 · My diary (both study sites: the same file in each repo) =================
   - One diary page a day, written with the app's own keyboard: the system keyboard (with its word
     suggestions and auto-correct) never opens, so every word is spelt by the child.
   - Nothing helps with spelling while writing. When the child taps Submit, the spelling is checked:
     each wrong word is shown with the right spelling next to it in red brackets, e.g.  becaus (because).
   - The corrected words go into the child's spelling practice (today's word list), so they are learnt
     and then come back in dictation by the memory plan.
   Saved in book.eng.diary[date] = {text, words, done, score, fix:[[wrong, right], ...], added:[...], u}. */
const DIARY_TARGET=()=>Math.max(30,+((B().prefs||{}).diaryWords)||60);
const DIARY_PROMPTS=[
  "What did you do today? Write about the best part of your day.",
  "Write about something you did at school today. What did you learn?",
  "Who did you spend time with today? What did you do together?",
  "Write about a meal you had today. What did it look, smell and taste like?",
  "What was the funniest or most surprising thing that happened today?",
  "Write about something you found hard today, and how you tried again.",
  "Where did you go today? Describe the place: what could you see and hear?",
];
const sentencesOf=txt=>String(txt).replace(/\s+/g," ").trim().replace(/([.!?]["”’]?)\s+/g,"$1\u0001").split("\u0001").filter(s=>/[a-z]/i.test(s));
const wordsOfText=txt=>(String(txt).match(/[A-Za-z’']+/g)||[]);
const DIARY_TIME="today,in the morning,first,next,then,after that,later,in the afternoon,in the evening,finally,yesterday,tonight";
const DIARY_JOIN="and,because,but,so,when,while,after,before,although";
const DIARY_FEEL="happy,excited,proud,tired,nervous,surprised,disappointed,worried,calm,curious,sad,angry,scared,glad,bored,upset";
/* What the diary does well and what to fix (a simple, kind check about the writing, never the spelling) */
function diaryCheck(txt){
  const ws=wordsOfText(txt), sents=sentencesOf(txt), low=" "+norm(txt).replace(/[.,!?;:]/g," ")+" ";
  const capsOK=sents.length>0&&sents.every(s=>/^["“‘(]?[A-Z]/.test(s.trim()));
  const stops=/[.!?]["”’]?\s*$/.test(String(txt).trim());
  const iOK=!/(^|[^A-Za-z’'])i([^A-Za-z’']|$)/.test(txt);
  const has=list=>list.split(",").some(x=>low.includes(" "+x+" "));
  return [
    {ok:ws.length>=DIARY_TARGET(),t:`At least ${DIARY_TARGET()} words (${ws.length} so far)`},
    {ok:sents.length>=5,t:`At least 5 sentences (${sents.length} so far)`},
    {ok:capsOK,t:"Every sentence starts with a capital letter"},
    {ok:stops&&sents.length>0,t:"Sentences end with . ! or ?"},
    {ok:iOK,t:"“I” is always a capital letter"},
    {ok:has(DIARY_TIME),t:"Uses a time word (First, Then, After that…)"},
    {ok:has(DIARY_JOIN),t:"Joins ideas with because, but, so or when"},
    {ok:has(DIARY_FEEL),t:"Says how you felt"},
  ];
}

/* ---------- spelling check: the 40,000 most common English words (words-common.js, loaded when needed) ---------- */
let COMMON=null, COMMON_RANK=null, commonLoading=null;
function loadCommon(){
  if(COMMON)return Promise.resolve(true);
  if(!commonLoading)commonLoading=new Promise(res=>{const s=document.createElement("script");s.src="words-common.js";
    s.onload=()=>{COMMON=new Set(COMMON_WORDS);COMMON_RANK=new Map(COMMON_WORDS.map((w,i)=>[w,i]));res(true);};s.onerror=()=>{commonLoading=null;res(false);};document.head.appendChild(s);});
  return commonLoading;
}
const CONTRACTIONS=new Set("i'm i've i'll i'd you're you've you'll you'd he's she's it's we're we've we'll they're they've they'll that's there's what's who's where's here's let's don't doesn't didn't can't couldn't won't wouldn't shouldn't isn't aren't wasn't weren't hasn't haven't hadn't mustn't".split(" "));
function knownWord(w){
  w=w.toLowerCase().replace(/’/g,"'"); if(w.length<2||!COMMON)return true;
  if(w.includes("'"))return CONTRACTIONS.has(w)||COMMON.has(w.replace(/'s$/,""))||COMMON.has(w.replace(/'/g,""));
  if(COMMON.has(w))return true;
  return wordsOf(B()).some(x=>norm(x.w)===w);
}
/* A rough "sounds like" key: delishus and delicious both give dVlVshVs */
function soundKey(w){
  return w.toLowerCase().replace(/ph/g,"f").replace(/wh/g,"w").replace(/gh/g,"").replace(/[ct]i([aou])/g,"sh$1").replace(/ch/g,"sh").replace(/ck|q|c([aoulrt]|$)|k/g,(m,a)=>"k"+(a||"")).replace(/c([eiy])/g,"s$1").replace(/x/g,"ks").replace(/z/g,"s")
    .replace(/(.)\1+/g,"$1").replace(/[aeiouy]+/g,"V").replace(/V$/,"").replace(/e$/,"");
}
function closeWords(w){
  if(!COMMON)return [];
  w=w.toLowerCase().replace(/’/g,"'"); const key=soundKey(w), out=[];
  const ed=(a,b)=>{if(Math.abs(a.length-b.length)>3)return 9;const m=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const t=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t;}}return m[b.length];};
  for(const c of COMMON_WORDS){
    if(c[0]!==w[0]&&!(/^[ck]/.test(c)&&/^[ck]/.test(w))||Math.abs(c.length-w.length)>3)continue;
    const d=ed(w,c), same=soundKey(c)===key; if(d>2&&!same)continue; if(d>3)continue;
    out.push([(same?0:2)+d+Math.log10(1+COMMON_RANK.get(c))/2,c]);
  }
  return out.sort((a,b)=>a[0]-b[0]).slice(0,3).map(x=>x[1]);
}
/* every wrong word of a text with its best correction ("" when there is no good guess) */
function diaryMistakes(txt){
  const sents=sentencesOf(txt), starts=new Set(sents.map(s=>(s.trim().match(/[A-Za-z’']+/)||[""])[0]));
  const seen=new Map();
  for(const w of wordsOfText(txt)){
    const lw=w.toLowerCase(); if(seen.has(lw))continue;
    if(/^[A-Z][a-z]/.test(w)&&w!=="I"&&!starts.has(w))continue; // a capital in the middle of a sentence: a name
    if(knownWord(w))continue;
    const c=closeWords(lw)[0]||""; seen.set(lw,c);
  }
  return [...seen.entries()];
}
/* the diary with each wrong word followed by the right spelling in red brackets */
function diaryMarked(txt,fix){
  const m=new Map((fix||[]).map(([a,b])=>[a,b]));
  return String(txt).split(/([A-Za-z’']+)/).map((p,i)=>{
    if(i%2===0)return esc(p).replace(/\n/g,"<br>");
    const lw=p.toLowerCase(); if(!m.has(lw))return esc(p);
    let c=m.get(lw); if(c&&/^[A-Z]/.test(p))c=c[0].toUpperCase()+c.slice(1);
    return `<span class="dv-bad">${esc(p)}</span><span class="dv-fix">(${c?esc(c):"?"})</span>`;
  }).join("");
}
/* the corrected words go into spelling practice: today's word list (and today's new words on the Year 5 site) */
function diaryAddWords(list){
  const b=B(), t=today(), have=new Map(wordsOf(b).map(w=>[norm(w.w),w])), fresh=[], again=[];
  for(const w of list){const o=have.get(norm(w));if(o){if(o.stage>0){o.due=t;o.u=Date.now();}again.push(w);}else fresh.push(w);}
  if(fresh.length){const r=addWordsToBook(b,fresh,{date:t});const l=b.lists[t];if(l&&!l.title){l.title="Diary words";l.u=Date.now();}
    r.added.forEach(w=>{w.diary=t;});
    if(b.eng&&b.eng.daily&&b.eng.daily[t]){const d=b.eng.daily[t];d.words=[...new Set([...d.words,...fresh])];d.u=Date.now();}
    if(typeof enrich==="function")Promise.all(r.added.map(w=>enrich(w).catch(()=>{}))).then(()=>Store.save());}
  return {fresh,again};
}

/* ---------- the diary screen with its own keyboard ---------- */
let DV=null;
function diaryEl(){
  let el=document.getElementById("diaryOv"); if(el)return el;
  el=document.createElement("section"); el.id="diaryOv"; el.hidden=true; el.setAttribute("aria-label","My diary");
  el.innerHTML=`<div class="s-top"><button class="icon-btn" id="dvClose" aria-label="Close">${ic("x")}</button><span class="s-label">My diary · 日记</span></div>
    <div class="s-body" id="dvBody"></div><div class="kbd" id="dvKbd" hidden></div>`;
  document.body.appendChild(el); el.querySelector("#dvClose").onclick=closeDiary; return el;
}
function openDiary(){window.__busy=true;diaryEl().hidden=false;document.body.style.overflow="hidden";DV={shift:false,caps:false,num:false};loadCommon();diaryView();}
function closeDiary(){if(DV&&DV.save)DV.save();window.__busy=false;diaryEl().hidden=true;document.body.style.overflow="";DV=null;if(typeof render==="function")render();}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-diary]");if(b&&Store.book){e.preventDefault();openDiary();}});

const KB_ROWS=[["q","w","e","r","t","y","u","i","o","p","⌫"],["a","s","d","f","g","h","j","k","l","'"],["⇧","z","x","c","v","b","n","m",",","."],["123","!","?","space","⏎"]];
const KB_NUM=[["1","2","3","4","5","6","7","8","9","0","⌫"],["-","/",":",";","(",")","£","&","\"","'"],["⇧","%","+","=","@","#","*",",","."],["abc","!","?","space","⏎"]];
function kbdHtml(){
  const rows=DV.num?KB_NUM:KB_ROWS, up=DV.shift||DV.caps;
  return rows.map(r=>`<div class="kbd-row">${r.map(k=>{const lab=k==="space"?"space":k==="⇧"?(DV.caps?"⇪":"⇧"):/^[a-z]$/.test(k)&&up?k.toUpperCase():k;
    const cls=k==="space"?"kb-space":["⌫","⇧","⏎","123","abc"].includes(k)?"kb-fn":"";
    return `<button type="button" class="kb ${cls} ${k==="⇧"&&up?"on":""}" data-k="${esc(k)}">${esc(lab)}</button>`;}).join("")}</div>`).join("");
}
// the book can be replaced by a sync while the diary is open: always write to the current one
const DE=()=>{const b=B();b.eng=b.eng||{diary:{},daily:{},phon:{},plog:{}};b.eng.diary=b.eng.diary||{};return b.eng;};
function diaryView(){
  const t=today(), E=DE();
  const d=E.diary[t]||{text:""}, prompt=DIARY_PROMPTS[Math.floor(pdate(t)/864e5)%DIARY_PROMPTS.length];
  const past=Object.entries(E.diary).filter(([k,v])=>k!==t&&v.text).sort((a,b)=>a[0]<b[0]?1:-1).slice(0,10);
  const body=$("#dvBody"), kb=$("#dvKbd");
  const pastHtml=past.length?`<div class="section-title"><h3 style="margin:0">Earlier diary pages</h3></div>${past.map(([k,v])=>`<details class="card dpast"><summary><b>${esc(niceDate(k))}</b> <span class="muted small">· ${wordsOfText(v.text).length} words${v.fix&&v.fix.length?` · ${v.fix.length} spelling${v.fix.length>1?"s":""} fixed`:""}</span></summary><p class="dv-text">${diaryMarked(v.text,v.fix)}</p></details>`).join("")}`:"";
  if(d.done){
    kb.hidden=true; DV.save=null;
    const fx=d.fix||[], good=fx.filter(x=>x[1]);
    body.innerHTML=`<div class="m-q eng-page diary">
      <div class="eyebrow">${esc(niceDate(t))}</div>
      <div class="mfb ok">${ic("check")}<div><b>Today’s diary is handed in. 今天的日记已提交！</b><span>${wordsOfText(d.text).length} words · ${d.score||0} of 8 on the checklist</span></div></div>
      <div class="card"><div class="muted small" style="margin-bottom:6px">${fx.length?`${fx.length} word${fx.length>1?"s":""} spelt wrong: the right spelling is in red brackets. 红色括号里是正确的拼写。`:"No spelling mistakes found. Brilliant! 没有拼写错误，太棒了！"}</div>
        <p class="dv-text">${diaryMarked(d.text,fx)}</p></div>
      ${good.length?`<div class="card stack tight"><b>Words to practise · 要练习的单词</b>
        <div class="row" style="gap:6px;flex-wrap:wrap">${good.map(([a,b])=>`<span class="dv-pair"><s>${esc(a)}</s> → <b>${esc(b)}</b> <button class="icon-btn sm" data-say-w="${esc(b)}" aria-label="Hear it">${ic("speaker")}</button></span>`).join("")}</div>
        <span class="muted small">These words are now in your spelling practice and dictation. 这些单词已经加进你的单词练习和听写里了。</span>
        <button class="btn primary" id="dvPractise">${ic("sparkle")}Practise them now · 现在就练</button></div>`:""}
      ${pastHtml}
    </div>`;
    body.querySelectorAll("[data-say-w]").forEach(b=>b.onclick=()=>typeof say==="function"&&say(b.dataset.sayW));
    const pr=$("#dvPractise"); if(pr)pr.onclick=()=>{const ws=wordsOf(B()).filter(w=>good.some(g=>norm(g[1])===norm(w.w)));closeDiary();
      const f=ws.filter(w=>w.stage===0);if(typeof startSession==="function")startSession(f.length?"learn":"review",(f.length?f:ws).map(w=>w.id),{listDate:t});};
    return;
  }
  body.innerHTML=`<div class="m-q eng-page diary">
    <div class="eyebrow">${esc(niceDate(t))}</div>
    <div class="card"><b>Today’s idea:</b> ${esc(prompt)}${typeof zhLine==="function"?zhLine(prompt):""}
      <div class="muted small" style="margin-top:6px">Think: Who? Where? What happened first, next and last? How did you feel? Spell every word yourself: the spelling is checked when you hand it in.</div></div>
    <textarea id="dText" rows="8" placeholder="Today I…" inputmode="none" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" writingsuggestions="false" data-gramm="false" data-enable-grammarly="false">${esc(d.text||"")}</textarea>
    <div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn" id="dRead">${ic("speaker")}Read it to me</button><button class="btn primary" id="dDone">${ic("check")}提交 · Hand it in</button><span class="muted small" id="dCount"></span></div>
    <div class="card stack tight" id="dChecks"></div>
    ${pastHtml}
  </div>`;
  if(typeof zhFill==="function")zhFill(body);
  const ta=$("#dText");
  const save=()=>{const E=DE();E.diary[t]={...(E.diary[t]||{}),text:ta.value,words:wordsOfText(ta.value).length,u:Date.now()};Store.save();};
  DV.save=save;
  const checks=()=>{const c=diaryCheck(ta.value);$("#dChecks").innerHTML=`<b>Checklist</b>${c.map(x=>`<div class="dchk ${x.ok?"ok":""}">${ic(x.ok?"check":"x")}<span>${esc(x.t)}</span></div>`).join("")}`;
    $("#dCount").textContent=`${wordsOfText(ta.value).length} / ${DIARY_TARGET()} words`;};
  let tm=null; const changed=()=>{checks();clearTimeout(tm);tm=setTimeout(save,700);};
  ta.oninput=changed; checks();
  // block the system's word suggestions and auto-correct: only plain typed letters get in
  ta.addEventListener("beforeinput",e=>{if(e.inputType==="insertReplacementText"||e.inputType==="insertFromPaste"||e.inputType==="insertFromDrop")e.preventDefault();});
  // the app's own keyboard
  kb.hidden=false; kb.innerHTML=kbdHtml();
  const ins=s=>{const v=ta.value,a=ta.selectionStart==null?v.length:ta.selectionStart,b=ta.selectionEnd==null?v.length:ta.selectionEnd;
    ta.value=v.slice(0,a)+s+v.slice(b);const p=a+s.length;ta.setSelectionRange(p,p);changed();keepVisible();};
  const del=()=>{const v=ta.value,a=ta.selectionStart==null?v.length:ta.selectionStart,b=ta.selectionEnd==null?v.length:ta.selectionEnd;
    if(a!==b){ta.value=v.slice(0,a)+v.slice(b);ta.setSelectionRange(a,a);}else if(a>0){ta.value=v.slice(0,a-1)+v.slice(a);ta.setSelectionRange(a-1,a-1);}changed();keepVisible();};
  const keepVisible=()=>{ta.scrollTop=ta.scrollHeight*(ta.selectionStart/Math.max(1,ta.value.length))-ta.clientHeight/2;};
  let lastShift=0;
  kb.onpointerdown=e=>{const b=e.target.closest(".kb");if(!b)return;e.preventDefault();const k=b.dataset.k;
    if(k==="⌫")del();
    else if(k==="⇧"){const now=Date.now();if(DV.caps){DV.caps=false;DV.shift=false;}else if(DV.shift&&now-lastShift<400){DV.caps=true;}else DV.shift=!DV.shift;lastShift=now;}
    else if(k==="123"){DV.num=true;}else if(k==="abc"){DV.num=false;}
    else if(k==="space")ins(" ");else if(k==="⏎")ins("\n");
    else{ins(/^[a-z]$/.test(k)&&(DV.shift||DV.caps)?k.toUpperCase():k);if(DV.shift&&!DV.caps)DV.shift=false;}
    kb.innerHTML=kbdHtml();b.blur&&b.blur();};
  // keep a held-down ⌫ deleting
  let rep=null; kb.addEventListener("pointerdown",e=>{const b=e.target.closest(".kb");if(b&&b.dataset.k==="⌫"){clearInterval(rep);rep=setTimeout(()=>{rep=setInterval(del,90);},450);}});
  ["pointerup","pointercancel","pointerleave"].forEach(ev=>kb.addEventListener(ev,()=>{clearTimeout(rep);clearInterval(rep);rep=null;}));
  $("#dRead").onclick=()=>readAloud(ta.value||"You have not written anything yet.",$("#dRead"));
  $("#dDone").onclick=async()=>{
    const n=wordsOfText(ta.value).length;
    if(n<DIARY_TARGET()){toast(`Keep going: ${DIARY_TARGET()-n} more words`);return;}
    save(); const btn=$("#dDone"); btn.disabled=true; btn.textContent="Checking the spelling…";
    const ok=await loadCommon(); if(!ok){btn.disabled=false;btn.innerHTML=`${ic("check")}提交 · Hand it in`;toast("Can’t check the spelling now: check the internet and try again.");return;}
    const fix=diaryMistakes(ta.value), c=diaryCheck(ta.value);
    const {fresh,again}=diaryAddWords(fix.map(x=>x[1]).filter(Boolean));
    const E2=DE(); E2.diary[t]={...E2.diary[t],text:ta.value,done:true,score:c.filter(x=>x.ok).length,fix,added:[...fresh,...again],u:Date.now()};
    Store.save(); if(typeof beep==="function")beep(true,true);
    toast(fix.length?`Handed in. ${fix.length} spelling${fix.length>1?"s":""} to learn.`:"Handed in. No spelling mistakes!");
    diaryView(); $("#dvBody").scrollTop=0;
  };
}

/* ---------- the parent page: each day's diary with the corrections ---------- */
function diaryParent(){
  const E=(B().eng||{}).diary||{}, P=B().prefs||{};
  const days=Object.entries(E).filter(([,v])=>v.text).sort((a,c)=>a[0]<c[0]?1:-1).slice(0,10);
  return `<div class="card stack" id="diaryPar">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">日记 · Diary</h3>
      <label class="muted small">Length: <select id="diaryWordsSel">${[30,40,60,80,100,120,150].map(n=>`<option value="${n}" ${(+P.diaryWords||60)===n?"selected":""}>at least ${n} words</option>`).join("")}</select></label></div>
    <div class="muted small">Written on the app’s own keyboard (no word suggestions). When it is handed in, each wrong word gets the right spelling in red brackets, and those words go into spelling practice and dictation. 错误的单词后面用红色括号标出正确拼写，并自动加入单词听写。</div>
    ${days.length?days.map(([d,v],i)=>`<details class="dpar" ${i===0?"open":""}><summary><b>${esc(niceDate(d))}</b> · ${wordsOfText(v.text).length} words${v.done?` · handed in · ${(v.fix||[]).length} spelling mistake${(v.fix||[]).length===1?"":"s"}`:" · not handed in yet"}</summary>
      <p class="dv-text">${diaryMarked(v.text,v.fix)}</p>${(v.fix||[]).length?`<div class="muted small">${v.fix.map(([a,b])=>`${esc(a)} → <b>${esc(b||"?")}</b>`).join(" · ")}</div>`:""}</details>`).join("")
      :`<div class="muted small">No diary yet.</div>`}
  </div>`;
}
function diaryParentBind(){const s=document.getElementById("diaryWordsSel");if(s)s.onchange=()=>{const b=B();b.prefs={...b.prefs,diaryWords:+s.value,u:Date.now()};Store.save();render();};}
