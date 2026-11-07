/* ================= 今日必做 · Today's must-do (set by a parent) =================
   Shared by both study sites (the same file in each repo; each site uses the parts it has).
   - A parent picks the must-do blocks on the parent page: every day, or for today only (e.g. when going
     out), and whether everything else stays locked until they are done.
   - When the child opens the app, a full-screen card with the blocks pops up. Each block opens its activity
     directly and ticks itself off when done. With the lock on, the card comes back after every activity
     until all blocks are done.
   - Time spent is counted per part of the app (only while the page is visible and in use) and saved in
     book.time, so the parent page can show minutes, progress and accuracy for each day.
   Settings live in book.prefs.must = {on, mode:"every"|"today", date, items:[...], lock}. */
const MUST_ALL={
  words:  {icon:"sparkle",  min:10, t:"New words",          tz:"新单词"},
  dict:   {icon:"headphones",min:10,t:"Dictation",          tz:"听写"},
  phonics:{icon:"wave",     min:10, t:"Phonics",            tz:"自然拼读"},
  read:   {icon:"book",     min:15, t:"Reading",            tz:"阅读"},
  write:  {icon:"pencil",   min:10, t:"Writing: my diary",  tz:"写作"},
  maths:  {icon:"maths",    min:15, t:"Maths: today’s 20",  tz:"每日20题"},
  test:   {icon:"doc",      min:15, t:"Maths test",         tz:"数学小测"},
  formula:{icon:"layers",   min:10, t:"Formula quiz",       tz:"公式练习"},
  paper:  {icon:"puzzle",   min:10, t:"Test paper practice",tz:"试卷题型"},
  fix:    {icon:"check",    min:10, t:"Fix my mistakes",    tz:"错题重做"},
  ftest:  {icon:"doc",      min:10, t:"Spelling test words",tz:"听写测验单词"},
};
const mustSite=()=>typeof PAPER_TYPES!=="undefined"?["words","read","write","maths","test","formula","paper","fix"]:["words","dict","phonics","read","write","maths","test","fix"];
/* the next spelling test (a word list marked as a test, e.g. every Friday), if one is open to practise */
function nextTestList(t=today()){
  const b=B(); if(!b||!b.lists)return null;
  return Object.values(b.lists).filter(l=>l.test&&l.date>=t&&listOpen(l)&&wordsIn(b,l.date).length).sort((a,c)=>a.date<c.date?-1:1)[0]||null;
}
/* Until a parent saves their own choice, a default must-do list is on (no lock) so the child always sees today's tasks */
const MUST_DEFAULT=()=>typeof PAPER_TYPES!=="undefined"?["maths","words","read","write","fix"]:["words","dict","phonics","read","write","maths"];
const mustCfg=()=>{const c=mustCfg0();if(c.on&&nextTestList()&&!c.items.includes("ftest"))c.items=["ftest",...c.items];return c;}; // a coming spelling test is always first
const mustCfg0=()=>{const m=(B().prefs||{}).must;
  if(!m||typeof m!=="object"||!("on" in m))return {on:true,mode:"every",date:"",items:MUST_DEFAULT(),lock:false,auto:true};
  return {on:!!m.on,mode:m.mode||"every",date:m.date||"",items:(m.items||[]).filter(k=>mustSite().includes(k)),lock:m.lock!==false};};
const mustActive=(t=today())=>{const m=mustCfg();return m.on&&m.items.length&&(m.mode==="every"||m.date===t);};

/* ---------- how each block is going (only reads saved data, so the parent page can use it too) ---------- */
const mLog=k=>((B().maths||{}).log||{})[k]||null;
function mustStatus(k,t=today()){
  const b=B(), acc=(r,n)=>n?{r,n}:null;
  if(k==="words"){
    const d=(b.eng||{}).daily&&b.eng.daily[t];
    if(d){const set=new Set(d.words.map(norm)),ws=Object.values(b.words).filter(w=>w.list===t&&set.has(norm(w.w))),l=ws.filter(w=>w.stage>0).length;
      return {done:ws.length>0&&l===ws.length,p:ws.length?l/ws.length:0,sub:`${l} of ${ws.length} learned`,acc:acc((b.log[t]||{}).right||0,(b.log[t]||{}).done||0)};}
    const lg=b.log[t]||{};return {done:(lg.done||0)>=10,p:Math.min(1,(lg.done||0)/10),sub:`${lg.done||0} of 10 words practised`,acc:acc(lg.right||0,lg.done||0)};
  }
  if(k==="dict"){
    const ws=Object.values(b.words).filter(w=>w.stage>0&&(w.due<=t||w.learnedOn===t||w.dict===t)&&listOpen(b.lists[w.list]||{date:t}));
    const left=ws.filter(w=>w.dict!==t).length;
    return {done:ws.length>0&&left===0,p:ws.length?(ws.length-left)/ws.length:0,sub:ws.length?(left?`${left} word${left>1?"s":""} to spell`:"All spelled"):"Learn new words first",acc:null};
  }
  if(k==="phonics"){const d=((b.eng||{}).plog||{})[t]||{n:0,r:0};return {done:d.n>=10,p:Math.min(1,d.n/10),sub:`${Math.min(10,d.n)} of 10 questions`,acc:acc(d.r,d.n)};}
  if(k==="read"){
    const secs=((b.reading.log[t]||{}).secs)||0, fin=Object.values(b.reading.done).filter(x=>x.date===t);
    return {done:secs>=600,p:Math.min(1,secs/600),sub:`${Math.floor(secs/60)} of 10 minutes${fin.length?` · ${fin.length} story finished`:""}`,acc:acc(fin.reduce((s,x)=>s+x.score,0),fin.reduce((s,x)=>s+x.n,0))};
  }
  if(k==="write"){const d=((b.eng||{}).diary||{})[t]||{},n=(String(d.text||"").match(/[A-Za-z’']+/g)||[]).length,goal=Math.max(30,+((b.prefs||{}).diaryWords)||60);
    return {done:!!d.done,p:d.done?1:Math.min(.95,n/goal),sub:d.done?`Finished · ${n} words`:`${n} of ${goal} words`,acc:d.score!=null?{r:d.score,n:8}:null};}
  if(k==="maths"){const d=typeof dayOf==="function"?dayOf(t):null,a=d?Object.values(d.ans||{}):[];const n=d?d.ids.length:20;
    return {done:!!d&&a.length>=n,p:a.length/n,sub:`${a.length} of ${n} answered`,acc:acc(a.filter(x=>x.ok).length,a.length)};}
  if(k==="test"){const d=typeof cuGet==="function"?cuGet(t):null,a=d?Object.values(d.ans||{}):[];const n=d?d.ids.length:15;
    return {done:!!d&&a.length>=n,p:a.length/n,sub:d&&a.length>=n?`Score ${a.filter(x=>x.ok).length}/${n}`:`${a.length} of ${n} answered`,acc:acc(a.filter(x=>x.ok).length,a.length)};}
  if(k==="formula"||k==="paper"){const g=mLog((k==="formula"?"fm:":"pp:")+t)||{n:0,r:0};return {done:g.n>=10,p:Math.min(1,g.n/10),sub:`${Math.min(10,g.n)} of 10 questions`,acc:acc(g.r,g.n)};}
  if(k==="ftest"){const l=nextTestList(t);if(!l)return {done:true,p:1,sub:"No spelling test coming up",acc:null};
    const p=listPlan(b,l.date,t),n=p.all.length,left=p.fresh.length+p.review.length;
    return {done:left===0,p:n?(n-Math.min(n,left))/n:1,sub:left?`${left} of ${n} words to practise · test ${shortDate(l.date)}`:`All ${n} practised today · test ${shortDate(l.date)}`,acc:null};}
  if(k==="fix"){const g=mLog("fx:"+t)||{n:0,r:0},left=t===today()?mustFixLeft():(g.left||0),start=Math.max(left,(g.start||0));
    return {done:left===0,p:start?1-left/start:1,sub:left?`${left} mistake${left>1?"s":""} to fix`:(g.n?`All fixed · ${g.r} put right`:"No mistakes to fix"),acc:acc(g.r,g.n)};}
  return {done:false,p:0,sub:"",acc:null};
}
/* mistakes still waiting: the latest answer was wrong (generated types p:/f: are only summaries) */
function mustFixLeft(){if(typeof mistakeIds==="function")return mistakeIds().length;const q=((B().maths||{}).q)||{};return Object.entries(q).filter(([id,s])=>s&&s.ok===false&&!/^(p:|f:)/.test(id)&&(typeof MQ==="undefined"||MQ[id]||(id.startsWith("w:")&&s.q))).length;}
const mustTz=k=>k==="words"&&typeof PAPER_TYPES!=="undefined"?"单词练习":MUST_ALL[k].tz;
const mustTitle=k=>k==="words"&&typeof PAPER_TYPES!=="undefined"?"Spelling practice":MUST_ALL[k].t;
/* time: seconds per part of the app on a day */
const mustSecs=(t,k)=>((B().time||{})[t]||{})[k]||0;
const fmtMin=s=>s<60?(s?"<1 min":"0 min"):Math.round(s/60)+" min";

/* ---------- the pop-up on the child's page ---------- */
function mustLaunch(k){
  const t=today(); mustHide();
  if(k==="words"){
    if(typeof dailyWordObjs==="function"&&B().eng&&B().eng.daily[t]){const ws=dailyWordObjs(t),f=ws.filter(w=>w.stage===0);
      if(f.length)return startSession("learn",f.map(w=>w.id),{listDate:t}); if(ws.length)return startSession("full",ws.map(w=>w.id),{listDate:t});}
    const d=typeof curDate==="function"&&curDate(); if(!d){toast("No word list yet: ask a parent to add words.");return mustGate(true);}
    const p=listPlan(B(),d); if(p.fresh.length)return startSession("learn",p.fresh.map(w=>w.id),{listDate:d});
    if(p.review.length)return startSession("review",p.review.map(w=>w.id),{listDate:d});
    return startSession("dict",p.all.map(w=>w.id),{listDate:d});
  }
  if(k==="dict"){const ws=dictLeft(t).length?dictLeft(t):dictSet(t);if(ws.length)return startSession("ddict",ws.map(w=>w.id),{listDate:t});toast("Learn today’s new words first.");return mustGate(true);}
  if(k==="phonics")return openEnglish("pq",{set:phQuiz(),i:0,r:0,pick:null});
  if(k==="read")return openReader(todaysReading().id);
  if(k==="write")return openDiary();
  if(k==="maths"){const d=dailySet(t);return openMaths({kind:"day",date:t,ids:d.ids});}
  if(k==="test")return openCheckup();
  if(k==="formula")return openMaths({kind:"topic",topic:"Formula quiz",ids:fmSet()});
  if(k==="paper")return openMaths({kind:"topic",topic:"Test paper: mixed",ids:paperSet("mix")});
  if(k==="ftest"){const l=nextTestList();if(!l){toast("No spelling test coming up.");return mustGate(true);}
    const p=listPlan(B(),l.date);if(p.fresh.length)return startSession("learn",p.fresh.map(w=>w.id),{listDate:l.date});
    if(p.review.length)return startSession("review",p.review.map(w=>w.id),{listDate:l.date});return startSession("dict",p.all.map(w=>w.id),{listDate:l.date});}
  if(k==="fix"){if(!mustFixLeft()){toast("No mistakes to fix. Brilliant!");return mustGate(true);}return openMistakes();}
}
function mustHide(){const e=document.getElementById("must");if(e)e.hidden=true;}
function mustGate(force){
  const el=document.getElementById("must"); if(!el)return;
  if(!Store.book||!mustActive()||window.__busy){el.hidden=true;return;}
  const m=mustCfg(), t=today(), st=m.items.map(k=>({k,...mustStatus(k,t)})), done=st.filter(x=>x.done).length, all=done===st.length;
  let later=false,cele=false; try{later=sessionStorage.getItem("must-later")===t;cele=localStorage.getItem("must-cele")===t;}catch(e){}
  if(all&&cele&&!force){el.hidden=true;return;}
  if(!all&&!m.lock&&later&&!force){el.hidden=true;return;}
  const mins=st.filter(x=>!x.done).reduce((s,x)=>s+MUST_ALL[x.k].min,0);
  el.innerHTML=`<div class="must-card">
    <div class="must-head"><div><div class="eyebrow">${esc(niceDate(t))}</div><h2>今日必做 · Today’s must-do</h2>
      <div class="muted">${all?"Everything is done. Well done! 全部完成，太棒了！":`Set by Mum or Dad. ${m.lock?"Finish these to unlock everything else.":"Please do these today."} About ${mins} minutes left.`}</div></div>
      <div class="ring lg" style="--p:${done/st.length*100}"><span>${done}/${st.length}</span></div></div>
    <div class="must-grid">${st.map((x,i)=>`<button class="must-tile ${x.done?"done":""}" data-must="${x.k}">
      <span class="must-n">${x.done?ic("check"):i+1}</span><span class="must-ic">${ic(MUST_ALL[x.k].icon)}</span>
      <b>${esc(mustTitle(x.k))}</b><span class="tz">${mustTz(x.k)}</span><span class="muted small">${esc(x.sub)}</span>
      <span class="must-bar"><i style="width:${Math.round(x.p*100)}%"></i></span><span class="muted tiny">${x.done?"Done":`About ${MUST_ALL[x.k].min} min`}</span></button>`).join("")}</div>
    ${all?`<button class="btn primary big" id="mustOk">${ic("check")}Great! Open the app</button>`:m.lock?`<p class="muted small" style="margin:0;text-align:center">${ic("lock")} The rest of the app opens when all ${st.length} are done.</p>`:`<button class="btn big" id="mustLater">Later</button>`}
  </div>`;
  el.hidden=false;
  if(all&&!cele){try{localStorage.setItem("must-cele",t);}catch(e){} if(typeof beep==="function")beep(true,true);}
  el.querySelectorAll("[data-must]").forEach(b=>b.onclick=()=>{const s=mustStatus(b.dataset.must);mustLaunch(b.dataset.must);if(s.done&&typeof toast==="function")toast("Already done. Extra practice is great!");});
  const ok=el.querySelector("#mustOk"); if(ok)ok.onclick=()=>{el.hidden=true;};
  const lt=el.querySelector("#mustLater"); if(lt)lt.onclick=()=>{try{sessionStorage.setItem("must-later",t);}catch(e){}el.hidden=true;};
}
/* after every render of the page: banner button, then the pop-up if it is needed */
function mustAfterRender(){document.querySelectorAll("#view [data-mustopen]").forEach(b=>b.onclick=()=>mustGate(true));
  document.querySelectorAll("#view [data-testmock]").forEach(b=>b.onclick=()=>{const ws=wordsIn(B(),b.dataset.testmock);if(ws.length)startSession("mock",ws.map(w=>w.id),{listDate:b.dataset.testmock});});
  document.querySelectorAll("#view [data-mustgo]").forEach(b=>b.onclick=()=>{const s=mustStatus(b.dataset.mustgo);mustLaunch(b.dataset.mustgo);if(s.done&&typeof toast==="function")toast("Already done. Extra practice is great!");});
  mustGate();}
/* the Today page: a big 今日必做 card at the top, one row per task with a Start button */
function testBanner(){
  const l=Store.book&&nextTestList(); if(!l)return "";
  const b=B(), t=today(), ws=wordsIn(b,l.date), n=ws.length, learned=ws.filter(w=>w.stage>0).length, strong=ws.filter(w=>w.stage>=3).length;
  const days=dayDiff(t,l.date), st=mustStatus("ftest");
  const when=days===0?"TODAY 今天":days===1?"TOMORROW 明天":`in ${days} days · 还有 ${days} 天`;
  return `<section class="card test-top">
    <div class="tt-date"><span>${esc(WEEK[pdate(l.date).getDay()].toUpperCase())}</span><b>${pdate(l.date).getDate()}</b><span>${esc(pdate(l.date).toLocaleDateString("en-GB",{month:"short"}))}</span></div>
    <div class="tt-main"><div class="eyebrow">听写测验 · Spelling test ${esc(when)}</div>
      <h2>${esc(l.title||"Spelling test")} · ${n} words</h2>
      <div class="muted small">${learned} of ${n} learned · ${strong} strong · ${st.done?"practised today ✓":esc(st.sub)}</div>
      <span class="must-bar"><i style="width:${n?Math.round(strong/n*100):0}%"></i></span></div>
    <div class="tt-btns"><button class="btn primary big" data-mustgo="ftest">${st.done?"Practise again":"Practise now 开始练习"}</button>
      <button class="btn" data-testmock="${l.date}">Practice test 模拟听写</button></div>
  </section>`;
}
function mustBanner(){
  if(!Store.book||!mustActive())return testBanner();
  return testBanner()+mustBanner0();
}
function mustBanner0(){
  const m=mustCfg(), st=m.items.map(k=>({k,...mustStatus(k)})), done=st.filter(x=>x.done).length, all=done===st.length;
  const left=st.filter(x=>!x.done).reduce((s,x)=>s+MUST_ALL[x.k].min,0), nextK=(st.find(x=>!x.done)||{}).k;
  return `<section class="card must-today ${all?"all":""}">
    <div class="mt-head"><div class="mt-title"><span class="mt-star">${ic("star")}</span><div><h2>今日必做 · Today’s must-do</h2>
      <div class="muted">${all?"All done today. Well done! 今天全部完成，太棒了！":`${st.length-done} left · about ${left} minutes · 还剩 ${st.length-done} 项`}</div></div></div>
      <div class="ring lg" style="--p:${st.length?done/st.length*100:0}"><span>${done}/${st.length}</span></div></div>
    <div class="mt-list">${st.map((x,i)=>`<button class="mt-row ${x.done?"done":""} ${x.k===nextK?"next":""}" data-mustgo="${x.k}">
      <span class="mt-n">${x.done?ic("check"):i+1}</span><span class="must-ic">${ic(MUST_ALL[x.k].icon)}</span>
      <span class="mt-txt"><b>${esc(mustTitle(x.k))} <span class="tz">${mustTz(x.k)}</span></b><span class="muted small">${esc(x.sub)}</span><span class="must-bar"><i style="width:${Math.round(x.p*100)}%"></i></span></span>
      <span class="mt-go">${x.done?"Done ✓":x.k===nextK?"Start 开始":"Go"}</span></button>`).join("")}</div>
  </section>`;
}

/* ---------- time spent, counted while the page is visible and in use ---------- */
let mustLastInput=Date.now(), mustTick=0;
["pointerdown","keydown","scroll","touchstart"].forEach(e=>document.addEventListener(e,()=>{mustLastInput=Date.now();},{capture:true,passive:true}));
function mustSection(){
  const vis=id=>{const e=document.getElementById(id);return !!e&&!e.hidden;};
  if(vis("session"))return typeof S!=="undefined"&&S&&S.mode==="ddict"?"dict":"words";
  if(vis("maths")){if(typeof MS==="undefined"||!MS)return "practice";const id=MS.ids&&MS.ids[0]||"";
    if(MS.fix)return "fix";
    return MS.kind==="test"?"test":MS.kind==="day"?"maths":String(id).startsWith("g:fm:")?"formula":/^g:(?!rv)/.test(id)?"paper":"practice";}
  if(vis("diaryOv"))return "write";
  if(vis("reader"))return "read";
  if(vis("eng"))return typeof EV!=="undefined"&&EV&&EV.view==="diary"?"write":"phonics";
  if(vis("shapes"))return "formula";
  if(vis("roman")||vis("facts"))return "practice";
  return "other";
}
if(document.getElementById("view"))setInterval(()=>{
  if(!Store.book||document.visibilityState!=="visible"||Date.now()-mustLastInput>180000)return;
  const t=today(), T=B().time||(B().time={}), d=T[t]||(T[t]={}), k=mustSection();
  d[k]=(d[k]||0)+15; mustTick=(mustTick+1)%4; if(!mustTick)Store.save();
},15000);

/* ---------- the parent page: settings and the last 7 days ---------- */
function mustParent(){
  const m=mustCfg(), t=today(), items=mustSite(), days=[...Array(7)].map((_,k)=>addDays(t,k-6)).reverse();
  const cols=m.items.length?m.items:items;
  const totalSecs=d=>Object.values((B().time||{})[d]||{}).reduce((s,x)=>s+x,0);
  const row=d=>{const sts=cols.map(k=>({k,...mustStatus(k,d)})),r=sts.reduce((s,x)=>s+(x.acc?x.acc.r:0),0),n=sts.reduce((s,x)=>s+(x.acc?x.acc.n:0),0);
    return `<tr><th>${d===t?"Today":esc(shortDate(d))}</th>${sts.map(x=>`<td class="${x.done?"ok":x.p>0?"part":""}" title="${esc(x.sub)}">${x.done?"✓":x.p>0?Math.round(x.p*100)+"%":"–"}${x.acc?`<small>${Math.round(x.acc.r/x.acc.n*100)}%</small>`:""}<small>${fmtMin(mustSecs(d,x.k))}</small></td>`).join("")}
      <td><b>${fmtMin(totalSecs(d))}</b>${n?`<small>${Math.round(r/n*100)}% right</small>`:""}</td></tr>`;};
  return `<div class="card stack must-parent">
    <div class="row" style="justify-content:space-between"><h3>今日必做 · Today’s must-do</h3><span class="muted small">Pops up when the app opens</span></div>
    <label class="row" style="gap:8px"><input type="checkbox" id="mustOn" ${m.on?"checked":""}> <b>Turn on today’s must-do</b></label>
    <div class="row" style="gap:16px;flex-wrap:wrap">
      <label class="row" style="gap:6px"><input type="radio" name="mustMode" value="every" ${m.mode==="every"?"checked":""}> Every day</label>
      <label class="row" style="gap:6px"><input type="radio" name="mustMode" value="today" ${m.mode==="today"?"checked":""}> Today only (e.g. when I’m out)</label>
      <label class="row" style="gap:6px"><input type="checkbox" id="mustLock" ${m.lock?"checked":""}> Lock the rest of the app until done</label>
    </div>
    <div class="must-picks">${items.map(k=>`<label class="must-pick ${m.items.includes(k)?"on":""}"><input type="checkbox" data-mustitem="${k}" ${m.items.includes(k)?"checked":""}><b>${esc(mustTitle(k))}</b><span class="muted tiny">${mustTz(k)} · ~${MUST_ALL[k].min} min</span></label>`).join("")}</div>
    ${m.auto?`<div class="notice">Using the default list until you change it here. 目前使用默认的必做项目，可以在这里修改。</div>`:""}
    <div class="muted small">${m.on?(m.mode==="today"&&m.date!==t?"Set for an earlier day: tick “Today only” again to set it for today.":`${m.items.length} block${m.items.length===1?"":"s"}, about ${m.items.reduce((s,k)=>s+MUST_ALL[k].min,0)} minutes.`):"Off: the child’s page opens as normal."}</div>
    <div class="must-table-wrap"><table class="must-table"><thead><tr><th></th>${cols.map(k=>`<th>${esc(mustTitle(k))}</th>`).join("")}<th>Time · right</th></tr></thead><tbody>${days.map(row).join("")}</tbody></table></div>
    <div class="muted tiny">Each cell: ✓ done (or how far), then the % of answers right, then the minutes spent on it. Time counts only while the page is open and in use.</div>
  </div>`;
}
function mustParentBind(){
  const save=ch=>{const b=B(),m={...mustCfg(),...ch};if(m.mode==="today")m.date=today();b.prefs={...b.prefs,must:m,u:Date.now()};Store.save();render();};
  const on=$("#mustOn"); if(on)on.onchange=()=>save({on:on.checked,items:mustCfg().items.length?mustCfg().items:mustSite().slice(0,4)});
  const lk=$("#mustLock"); if(lk)lk.onchange=()=>save({lock:lk.checked});
  document.querySelectorAll('input[name="mustMode"]').forEach(r=>r.onchange=()=>save({mode:r.value}));
  document.querySelectorAll("[data-mustitem]").forEach(c=>c.onchange=()=>{const set=new Set(mustCfg().items);c.checked?set.add(c.dataset.mustitem):set.delete(c.dataset.mustitem);save({items:mustSite().filter(k=>set.has(k))});});
}
