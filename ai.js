/* ================= Google AI (Gemini): diary marking and learning reports (both sites; the same file in each repo) =================
   A parent pastes a Gemini API key on the parent page (from aistudio.google.com → Get API key). It is saved in
   the child's account settings (book.prefs.ai), so the child's device can use it too.
   - Diary: when a diary is handed in, Gemini gives a score out of 10 (ideas, structure, punctuation, vocabulary,
     spelling), what was good, 2–3 things to improve, one sentence rewritten better, and how it compares with the
     last few diaries. Saved with the diary (book.eng.diary[date].ai).
   - Learning report (parent page): the last 14 days of answers, mistakes, time, phonics and diaries are summed up
     and Gemini writes a report in Chinese for the parent: weak question types with examples, signs of guessing or
     skipping, and what to practise next. Saved in book.eng.ai["report-<date>"].
   Everything sent is study data only (no names other than the account's first name, no passwords). */
const AI_MODELS=["gemini-2.5-flash","gemini-flash-latest","gemini-2.0-flash"];
const aiCfg=()=>((B()||{}).prefs||{}).ai||{};
const aiReady=()=>!!aiCfg().key;
async function aiCall(system,prompt,json){
  const c=aiCfg(); if(!c.key)throw new Error("no_key");
  let last=null; const tried=[...new Set([c.model,(()=>{try{return localStorage.getItem("ai-model");}catch(e){return null;}})(),...AI_MODELS].filter(Boolean))];
  for(const m of tried){
    let r; try{
      const ac=new AbortController(); setTimeout(()=>ac.abort(),60000);
      r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`,{method:"POST",signal:ac.signal,
        headers:{"Content-Type":"application/json","x-goog-api-key":c.key},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:"user",parts:[{text:prompt}]}],
          generationConfig:{temperature:.5,...(json?{responseMimeType:"application/json"}:{})}})});
    }catch(e){last=new Error("offline");continue;}
    const j=await r.json().catch(()=>null);
    if(r.status===404||r.status===400&&/not found|not supported/i.test(JSON.stringify(j||""))){last=new Error("model "+m+" not available");continue;}
    if(!r.ok){const msg=(j&&j.error&&j.error.message)||("HTTP "+r.status);throw new Error(r.status===400&&/API key/i.test(msg)?"bad_key":msg);}
    const text=(((j||{}).candidates||[])[0]||{}).content?.parts?.map(p=>p.text||"").join("")||"";
    try{localStorage.setItem("ai-model",m);}catch(e){}
    if(!json)return text;
    try{return JSON.parse(text.replace(/^```(json)?|```$/g,"").trim());}catch(e){throw new Error("The AI answer could not be read. Try again.");}
  }
  throw last||new Error("No Gemini model is available for this key.");
}
const aiErr=e=>e.message==="no_key"?"Ask a parent to add the Google AI key on the parent page.":e.message==="bad_key"?"The Google AI key is not valid. Check it on the parent page.":e.message==="offline"?"Can’t reach Google AI: check the internet.":"Google AI: "+e.message;
const aiYear=()=>typeof PAPER_TYPES!=="undefined"?7:5;

/* ---------- the diary ---------- */
async function aiDiary(date=today()){
  const E=B().eng, d=E.diary[date]; if(!d||!d.text)throw new Error("No diary on that day.");
  const prev=Object.entries(E.diary).filter(([k,v])=>k<date&&v.text&&v.done).sort((a,b)=>a[0]<b[0]?1:-1).slice(0,3).reverse()
    .map(([k,v])=>({date:k,words:wordsOfText(v.text).length,score:v.ai&&v.ai.score,spelling_mistakes:(v.fix||[]).length,text:v.text.slice(0,700)}));
  const system=`You are a warm, encouraging but honest teacher in an English school. You mark a Year ${aiYear()} pupil's daily diary (age ${aiYear()===5?"9–10":"11–12"}). The pupil's family speaks Chinese, so every comment has an English version for the child and a Chinese translation for the parent. Judge it for this age: ideas and detail, structure (time order, paragraphs), sentences and punctuation (capitals, full stops, commas, speech marks), vocabulary (adjectives, joining words, interesting verbs) and spelling. Be specific: quote the pupil's own words. Keep English simple enough for the child to read.
Reply only with JSON: {"score":0-10,"parts":{"ideas":0-10,"structure":0-10,"punctuation":0-10,"vocabulary":0-10,"spelling":0-10},"praise_en":"1–2 sentences","praise_zh":"…","improve":[{"en":"one concrete thing to do next time, with an example","zh":"…"}],"example":{"before":"a sentence from the diary","after":"the same sentence written better"},"progress_en":"how this compares with the earlier diaries (better, the same or worse, and in what)","progress_zh":"…"}. Give 2 or 3 items in improve.`;
  const prompt=`Today's diary (${date}, ${wordsOfText(d.text).length} words; the app's spelling check already found: ${(d.fix||[]).map(x=>x.join(" → ")).join(", ")||"none"}):\n"""${d.text}"""\n\nEarlier diaries (oldest first): ${JSON.stringify(prev)}`;
  const r=await aiCall(system,prompt,true);
  const ai={score:Math.max(0,Math.min(10,Math.round(+r.score||0))),parts:r.parts||{},praise_en:r.praise_en||"",praise_zh:r.praise_zh||"",improve:(r.improve||[]).slice(0,3),example:r.example||null,progress_en:r.progress_en||"",progress_zh:r.progress_zh||"",at:Date.now()};
  const E2=B().eng; E2.diary[date]={...E2.diary[date],ai,u:Date.now()}; Store.save();
  return ai;
}
/* the marking, for the child (English, Chinese under it when 中文 is on) and the parent */
function aiDiaryHtml(ai){
  if(!ai)return "";
  const bar=(k,lab)=>{const v=+((ai.parts||{})[k]||0);return `<div class="ai-part"><span>${lab}</span><span class="ai-bar"><i style="width:${v*10}%"></i></span><b>${v}</b></div>`;};
  return `<div class="card ai-card stack tight"><div class="row" style="justify-content:space-between;gap:10px;flex-wrap:wrap"><b>${ic("sparkle")} Teacher’s marking (Google AI) 老师点评</b><span class="ai-score">${ai.score}<small>/10</small></span></div>
    <div class="ai-parts">${bar("ideas","Ideas 内容")}${bar("structure","Structure 结构")}${bar("punctuation","Punctuation 标点")}${bar("vocabulary","Words 用词")}${bar("spelling","Spelling 拼写")}</div>
    <div><b>Well done:</b> ${esc(ai.praise_en)} ${esc(ai.praise_zh)}</div>
    ${(ai.improve||[]).length?`<div><b>Next time:</b><ul class="ai-list">${ai.improve.map(x=>`<li>${esc(x.en||"")} ${esc(x.zh||"")}</li>`).join("")}</ul></div>`:""}
    ${ai.example&&ai.example.before?`<div class="ai-ex"><div><s>${esc(ai.example.before)}</s></div><div>→ <b>${esc(ai.example.after||"")}</b></div></div>`:""}
    ${ai.progress_en?`<div class="muted small">${esc(ai.progress_en)} ${esc(ai.progress_zh)}</div>`:""}
  </div>`;
}

/* ---------- the learning report for the parent ---------- */
function aiStats(days=14){
  const b=B(), t=today(), M=(b.maths||{}), L=M.log||{}, H=M.hist||{}, E=b.eng||{}, out={site:`Year ${aiYear()} (England)`,name:b.name,days:[]};
  for(let k=days-1;k>=0;k--){
    const d=addDays(t,-k), tm=(b.time||{})[d]||{}, h=H[d]||[], by={};
    h.forEach(x=>{const s=by[x.s]=by[x.s]||{n:0,right:0};s.n++;if(x.ok)s.right++;});
    const ph=(E.plog||{})[d], di=(E.diary||{})[d];
    out.days.push({date:d,minutes:Math.round(Object.values(tm).reduce((s,x)=>s+x,0)/60),minutes_by_part:Object.fromEntries(Object.entries(tm).filter(([,v])=>v>=60).map(([k,v])=>[k,Math.round(v/60)])),
      maths_total:(L[d]||{}).n||0,maths_right:(L[d]||{}).r||0,maths_by_set:by,guesses:(L["gs:"+d]||{}).n||0,
      phonics:ph?{questions:ph.n,right:ph.r,spelt:ph.sn||0,spelt_right:ph.sr||0}:null,
      diary:di&&di.text?{words:wordsOfText(di.text).length,handed_in:!!di.done,spelling_mistakes:(di.fix||[]).length,ai_score:di.ai&&di.ai.score}:null,
      must_do:typeof mustStatus==="function"&&typeof mustCfg==="function"?mustCfg().items.map(k=>`${k}:${mustStatus(k,d).done?"done":"not done"}`).join(", "):""});
  }
  if(typeof topicStats==="function"){const ts=topicStats();out.topics=Object.fromEntries(Object.entries(ts).filter(([,s])=>s.n).map(([k,s])=>[k,`${s.r}/${s.n} right`]));}
  const wrong=[]; for(let k=0;k<days;k++)for(const x of (H[addDays(t,-k)]||[]))if(!x.ok&&wrong.length<60)wrong.push({date:addDays(t,-k),set:x.s,question:x.q.slice(0,160),child_answer:x.v,right_answer:x.a});
  out.wrong_answers=wrong;
  return out;
}
async function aiReport(){
  const stats=aiStats(14);
  const system=`你是一位熟悉英国学校课程（${stats.site}）的辅导老师。根据孩子最近14天在学习软件里的数据，给家长写一份中文学习报告。要具体、有数据、有例子，语气客观友好。格式：用"## "开头的小标题，下面用"- "开头的要点，重要的词用**加粗**。必须包含这几部分：
## 总体情况（每天学了多久、哪几天没学、今日必做完成情况）
## 数学：最常错的题型（按题型列出，带孩子的错误答案和正确答案的例子，分析错误原因，比如负数、没排序、看错图例、概念混淆）
## 是否有乱按/猜答案（guesses 数字、像 222、3333 这样的答案、很快就答错）
## 英语：拼读、听写、日记（日记分数有没有进步、常见问题）
## 下周重点练习建议（3–5条，具体到题型和每天做多少）`;
  const text=await aiCall(system,"孩子的数据（JSON）：\n"+JSON.stringify(stats),false);
  const E=B().eng; E.ai=E.ai||{}; E.ai["report-"+today()]={text,at:Date.now(),u:Date.now()}; Store.save();
  return text;
}
function aiMd(t){ // the few bits of Markdown the report uses
  return esc(t).split(/\n/).map(l=>/^#{1,3} /.test(l)?`<h4>${l.replace(/^#+ /,"")}</h4>`:/^\s*[-*] /.test(l)?`<li>${l.replace(/^\s*[-*] /,"")}</li>`:l.trim()?`<p>${l}</p>`:"").join("")
    .replace(/(<li>.*?<\/li>)+/g,m=>`<ul>${m}</ul>`).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
}

/* ---------- the parent page block ---------- */
let AI_BUSY="", AI_MSG="";
function aiParent(){
  const c=aiCfg(), E=(B().eng||{}), reps=Object.entries(E.ai||{}).filter(([k])=>k.startsWith("report-")).sort((a,b)=>a[0]<b[0]?1:-1);
  return `<div class="card stack no-zh" id="aiPar">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">${ic("sparkle")} AI 学习报告 · Google AI</h3>
      ${c.key?`<span class="muted small">已接入 Google AI ✓ <button class="btn ghost" id="aiOff" style="padding:4px 10px">移除 Key</button></span>`:""}</div>
    ${c.key?`<div class="muted small">每天的日记交上去后会自动打分点评。点下面的按钮，AI 会根据最近14天的数据写一份学习报告：哪些题型经常错、有没有乱按、日记有没有进步、下周练什么。</div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" id="aiRep" ${AI_BUSY?"disabled":""}>${AI_BUSY==="rep"?"正在生成报告…（约半分钟）":"生成学习报告（最近14天）"}</button></div>`
     :`<div class="muted small">粘贴一个 Google Gemini API Key 就能开通：日记自动打分点评、AI 学习报告。获取方法：用谷歌账号打开 <b>aistudio.google.com</b> → 左下角 <b>Get API key</b> → <b>Create API key</b> → 复制。两个孩子的家长页各粘贴一次。Key 保存在孩子的账号设置里，孩子的设备也能用它给日记打分。</div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><input id="aiKey" class="plain" placeholder="AIza…" autocomplete="off" autocapitalize="none" spellcheck="false" style="flex:1;min-width:220px"><button class="btn primary" id="aiSave">保存并测试</button></div>`}
    ${AI_MSG?`<div class="notice">${esc(AI_MSG)}</div>`:""}
    ${reps.length?reps.slice(0,4).map(([k,v],i)=>`<details class="ai-rep" ${i===0?"open":""}><summary><b>${esc(niceDate(k.slice(7)))}</b> 的学习报告</summary><div class="ai-md">${aiMd(v.text)}</div></details>`).join(""):""}
  </div>`;
}
function aiParentBind(){
  const sv=$("#aiSave"); if(sv)sv.onclick=async()=>{const k=$("#aiKey").value.trim(); if(!/^[A-Za-z0-9_\-]{20,}$/.test(k)){AI_MSG="这看起来不像 API Key，请重新复制。";render();return;}
    const b=B(); b.prefs={...b.prefs,ai:{key:k},u:Date.now()}; AI_MSG="正在测试…"; render();
    try{await aiCall("Reply with the single word OK.","Say OK.",false);AI_MSG="接入成功！之后交的日记会自动打分点评。";Store.save();}
    catch(e){AI_MSG="测试没有通过："+aiErr(e)+"（Key 没有保存）";const b2=B();const p={...b2.prefs};delete p.ai;b2.prefs={...p,u:Date.now()};Store.save();}
    render();};
  const off=$("#aiOff"); if(off)off.onclick=()=>{if(!confirm("移除 Google AI Key？"))return;const b=B();const p={...b.prefs};delete p.ai;b.prefs={...p,u:Date.now()};Store.save();AI_MSG="";render();};
  const rp=$("#aiRep"); if(rp)rp.onclick=async()=>{AI_BUSY="rep";AI_MSG="";render();try{await aiReport();AI_MSG="";}catch(e){AI_MSG=aiErr(e);}AI_BUSY="";render();};
  document.querySelectorAll("[data-aidiary]").forEach(b=>b.onclick=async()=>{b.disabled=true;b.textContent="AI 正在看…";try{await aiDiary(b.dataset.aidiary);}catch(e){AI_MSG=aiErr(e);}render();});
}
