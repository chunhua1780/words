/* ================= 本周学习计划 · The weekly plan: each child's tasks adjust to how she is really doing =================
   Shared by both study sites (the same file in each repo).
   Once a week (from Monday, or when a parent presses 重新分析) the plan looks at the last 14 days of real work:
   the report scores (rpScores in report.js), the AI diary marks (ideas, structure, punctuation, vocabulary, spelling),
   the meaning quiz, maths topics and the mistakes list. From that it
   - adds up to 2 extra must-do blocks for the week where she is weakest (e.g. daily science reading, rounding),
   - picks one diary focus, shown to the child above her diary every day,
   - lists what is strong (those parts keep levelling up on their own).
   Google AI (when a key is set) then writes the parent a Chinese plan and 3 goals for the child, in English and Chinese.
   Nothing is made up: an area with too little work (below the report's minimum) is not judged.
   Saved in book.eng.ai["plan-<Monday>"] = {week, made, add, focus, strong, diary, ai, u}. A parent can switch the
   automatic changes off (book.prefs.planOff); the plan is still shown, but adds no blocks. */
const PL_PARTS={ideas:"内容和细节",structure:"结构和顺序",punctuation:"标点和大写",vocabulary:"词汇",spelling:"拼写"};
const PL_DIARY_TIP={
  ideas:["Add details: who was there, where you were, what you saw and how you felt.","写出细节：和谁、在哪里、看到了什么、心情怎样。"],
  structure:["Write in time order: First… Then… After that… Finally…","按时间顺序写：First… Then… After that… Finally…"],
  punctuation:["Every sentence starts with a capital letter and ends with a full stop.","每句话开头大写，结尾加句号。"],
  vocabulary:["Use 3 interesting words: a describing word, a strong verb and a joining word (because, but, so).","用 3 个好词：一个形容词、一个有力的动词、一个连词（because, but, so）。"],
  spelling:["When you finish, read it again slowly and check every long word.","写完后慢慢再读一遍，检查每个长单词的拼写。"]};
const weekStart=(t=today())=>addDays(t,-((pdate(t).getDay()+6)%7)); // the Monday of that week
const planKey=(t=today())=>"plan-"+weekStart(t);

/* the facts the plan is made from (last 14 days, real answers only) */
function planData(b=B()){
  const t=today(), from=addDays(t,-13), E=b.eng||{}, sc=rpScores(b,from,t);
  const ais=Object.entries(E.diary||{}).filter(([d,v])=>d>=from&&v&&v.ai&&v.ai.parts).map(([,v])=>v.ai);
  const parts={}; for(const k of Object.keys(PL_PARTS)){const xs=ais.map(a=>+a.parts[k]).filter(x=>!isNaN(x));if(xs.length)parts[k]=Math.round(xs.reduce((s,x)=>s+x,0)/xs.length*10)/10;}
  const aiScore=ais.length?Math.round(ais.reduce((s,a)=>s+(+a.score||0),0)/ais.length*10)/10:null;
  const mk=[], vm={n:0,r:0};
  for(const [d,p] of Object.entries(E.plog||{}))if(d>=from){(p.mk||[]).forEach(m=>mk.push(m));vm.n+=p.vn||0;vm.r+=p.vr||0;}
  const weak=typeof weakTopics==="function"&&b===B()?weakTopics():[];
  return {from,to:t,sc,parts,aiScore,aiN:ais.length,mk,vm,weak,improve:ais.flatMap(a=>(a.improve||[]).map(x=>x.zh||x.en)).slice(-6)};
}

/* the rules: weak → an extra block this week; strong → keeps levelling up */
function planMake(b=B()){
  const D=planData(b), s=D.sc, y5=typeof PAPER_TYPES==="undefined", site=typeof mustSite==="function"?mustSite():[], focus=[], strong=[], add=[];
  const S=k=>s[k]&&s[k].enough?s[k].score:null;
  const F=(area,score,why,act,key)=>{focus.push({area,score,why,act});if(key&&(site.includes(key)||key==="round"||key==="fracs")&&!add.includes(key))add.push(key);};
  if(S("vocab")!=null&&S("vocab")<75)F("Vocabulary 单词",S("vocab"),`拼写/听写正确率 ${S("vocab")}%（${s.vocab.r}/${s.vocab.n}）`,y5?"每天的听写一定要做完；单词难度暂时不升级":"每天加做错题重做",y5?"dict":"fix");
  if(D.vm.n>=10&&D.vm.r/D.vm.n<.7)F("Word meanings 词义",Math.round(D.vm.r/D.vm.n*100),`词义题 ${D.vm.r}/${D.vm.n} 对`,"每天做 10 道词义题","vocab");
  if(y5&&S("phonics")!=null&&S("phonics")<75)F("Phonics 拼读",S("phonics"),`拼读正确率 ${S("phonics")}%`,"每天的拼读课保留，错得多的题型多出","phonics");
  if(S("reading")!=null&&S("reading")<70)F("Reading 阅读",S("reading"),`阅读题正确率 ${S("reading")}%（${s.reading.texts} 篇）`,"每天阅读 10 分钟并答题；阅读难度暂不升级","read");
  if(S("science")!=null&&S("science")<70)F("Science reading 科学阅读",S("science"),`科学阅读题 ${s.science.r}/${s.science.n} 对`,"科学阅读从每周一、三、五改为每天","science");
  if(y5&&D.weak.some(t=>/round/i.test(t))&&typeof topicSet==="function")F("Maths: rounding 四舍五入",null,`最近错得多的题型：${D.weak.join("、")}`,"每天加 10 道四舍五入","round");
  if(y5&&D.weak.some(t=>/fraction/i.test(t))&&typeof frSet==="function")F("Maths: fractions 分数",null,`最近错得多的题型：${D.weak.join("、")}`,"每天加 10 道分数题","fracs");
  if(S("maths")!=null&&S("maths")<75)F("Maths 数学",S("maths"),`数学正确率 ${S("maths")}%${D.weak.length?`，弱项：${D.weak.join("、")}`:""}`,"每天加做错题重做","fix");
  /* diary: the weakest part of the AI marks, or of the app's own rubric when there are no AI marks yet */
  let diary=null;
  const pk=Object.entries(D.parts).sort((a,c)=>a[1]-c[1])[0];
  if(pk&&pk[1]<8)diary=pk[0];
  else if(s.diary.enough&&s.diary.rub.length){const avg=k=>s.diary.rub.reduce((a,r)=>a+r[k],0)/s.diary.rub.length;
    const r={punctuation:avg("punct")/25,spelling:avg("spelling")/25,vocabulary:avg("vocab")/25,ideas:avg("length")/25};const w=Object.entries(r).sort((a,c)=>a[1]-c[1])[0];if(w[1]<.8)diary=w[0];}
  if(diary)focus.push({area:"Diary 日记",score:D.parts[diary]!=null?Math.round(D.parts[diary]*10):S("diary"),why:D.parts[diary]!=null?`AI 打分里最弱的是「${PL_PARTS[diary]}」：平均 ${D.parts[diary]}/10（${D.aiN} 篇）`:`日记评分里最弱的是「${PL_PARTS[diary]}」`,act:"本周每天写日记前提醒："+PL_DIARY_TIP[diary][1]});
  for(const k of Object.keys(RP_NAMES)){const v=S(k);if(v!=null&&v>=90)strong.push(`${RP_NAMES[k]} ${v}`);}
  const base=typeof mustCfg0==="function"?mustCfg0().items:[]; // only blocks she does not already have every day
  return {week:weekStart(),made:today(),add:add.filter(k=>!base.includes(k)).slice(0,2),focus,strong,diary,data:{scores:Object.fromEntries(Object.keys(RP_NAMES).map(k=>[k,S(k)])),parts:D.parts,aiScore:D.aiScore,weak:D.weak},u:Date.now()};
}
/* this week's plan: made once a week and saved, so it stays the same all week */
function planGet(make=true){
  const b=Store.book&&B(); if(!b||typeof rpScores!=="function")return null;
  const E=b.eng||(b.eng={}); E.ai=E.ai||{}; const k=planKey();
  if(!E.ai[k]&&make){E.ai[k]=planMake(b);Store.save();}
  return E.ai[k]||null;
}
const planOn=()=>!(((B()||{}).prefs||{}).planOff);
/* must.js asks for the extra blocks */
function planExtra(){try{const p=planOn()&&planGet();return p?p.add||[]:[];}catch(e){return [];}}
/* the diary shows this every day */
function planDiaryTip(){try{const p=planGet();return p&&p.diary?PL_DIARY_TIP[p.diary]:null;}catch(e){return null;}}

/* ---------- Google AI: a Chinese plan for the parent and 3 goals for the child ---------- */
async function aiPlan(){
  const p=planGet(); if(!p)throw new Error("No data yet.");
  const D=planData(), stats=typeof aiStats==="function"?aiStats(14):{};
  const facts={plan_rules:{focus:p.focus,strong:p.strong,extra_blocks:p.add,diary_focus:p.diary},scores_0_100:p.data.scores,diary_ai_parts_0_10:D.parts,diary_ai_average:D.aiScore,
    recent_mistakes:D.mk.slice(-30).map(m=>({kind:m.k,word:m.w,wrote:m.v,type:m.e})),teacher_comments_on_diaries:D.improve,maths_weak_topics:D.weak,app_stats:stats};
  const system=`你是一位熟悉英国学校课程的辅导老师（孩子是 Year ${typeof aiYear==="function"?aiYear():5}）。根据孩子最近 14 天在学习软件里的真实数据，为下周制定学习计划。只能使用给出的数据，不要编造成绩；数据不够的科目要说明“数据不够”。
只回复 JSON：{"summary_zh":"3–4 句：总体表现和最需要改进的地方，带具体数字","plan_zh":["4–6 条具体可执行的计划，每条写清楚：练什么、每天多少、为什么（引用数据或错例）"],"goals":[{"en":"给孩子看的本周目标（简单英文，一句）","zh":"中文"}],"parent_zh":"家长可以怎么配合，1–2 句"}。goals 正好 3 个。`;
  const r=await aiCall(system,"数据（JSON）：\n"+JSON.stringify(facts),true);
  const E=B().eng, k=planKey(); E.ai[k]={...E.ai[k],ai:{summary:r.summary_zh||"",plan:(r.plan_zh||[]).slice(0,6),goals:(r.goals||[]).slice(0,3),parent:r.parent_zh||"",at:Date.now()},u:Date.now()};
  Store.save(); return E.ai[k];
}
/* the child's app makes the week's AI plan by itself once (after the diaries are marked) */
async function aiPlanAuto(){try{const p=planGet();if(p&&!p.ai&&typeof aiReady==="function"&&aiReady()&&!window.__busy)await aiPlan();}catch(e){}}

/* ---------- what the child sees: this week's goals (on the must-do card) ---------- */
function planGoalsHtml(){
  const p=planGet(false); if(!p)return "";
  const g=(p.ai&&p.ai.goals||[]).filter(x=>x&&x.en); const tip=p.diary?PL_DIARY_TIP[p.diary]:null;
  if(!g.length&&!tip)return "";
  return `<div class="plan-goals"><b>${ic("star")} This week’s goals · 本周目标</b><ul>${g.length?g.map(x=>`<li>${esc(x.en)}<span class="tz">${esc(x.zh||"")}</span></li>`).join(""):`<li>Diary: ${esc(tip[0])}<span class="tz">${esc(tip[1])}</span></li>`}</ul></div>`;
}

/* ---------- the parent page ---------- */
let PL_MSG="", PL_BUSY=false;
function planParent(){
  const p=planGet(); if(!p)return "";
  const on=planOn(), ai=p.ai, extra=(p.add||[]).map(k=>MUST_ALL[k]?`${MUST_ALL[k].tz}（${MUST_ALL[k].t}）`:k);
  return `<div class="card stack no-zh plan-card">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">${ic("star")} 本周学习计划 · This week’s plan</h3><span class="muted small">${esc(niceDate(p.week))} 这一周 · 根据 ${esc(shortDate(addDays(p.made,-13)))}–${esc(shortDate(p.made))} 的真实练习制定</span></div>
    ${p.focus.length?`<table class="plan-table"><thead><tr><th>要加强的</th><th>依据（真实数据）</th><th>本周怎么做</th></tr></thead><tbody>${p.focus.map(f=>`<tr><td><b>${esc(f.area)}</b>${f.score!=null?`<small>${f.score} 分</small>`:""}</td><td>${esc(f.why)}</td><td>${esc(f.act)}</td></tr>`).join("")}</tbody></table>`
      :`<div class="notice">最近 14 天各科都达标（或练习量还不够评分），本周按原计划学习。</div>`}
    ${p.strong.length?`<div class="small">${ic("check")} <b>做得好的：</b>${esc(p.strong.join("，"))}。这些部分会按正确率自动升级难度。</div>`:""}
    <div class="small">${extra.length?`<b>本周自动加入今日必做：</b>${esc(extra.join("、"))}`:"本周没有额外加必做项目。"}${p.diary?` · <b>日记重点：</b>${esc(PL_DIARY_TIP[p.diary][1])}`:""}</div>
    <label class="row" style="gap:8px"><input type="checkbox" id="planOn" ${on?"checked":""}> 按计划自动调整孩子的必做项目（推荐）</label>
    ${ai?`<div class="ai-out"><h4>AI 分析</h4><p>${esc(ai.summary)}</p>${ai.plan.length?`<h4>下周计划</h4><ul>${ai.plan.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
      ${ai.goals.length?`<h4>给孩子的 3 个目标（孩子在必做卡片上能看到）</h4><ul>${ai.goals.map(g=>`<li>${esc(g.en)} · ${esc(g.zh||"")}</li>`).join("")}</ul>`:""}
      ${ai.parent?`<p><b>家长配合：</b>${esc(ai.parent)}</p>`:""}<div class="muted tiny">Google AI · ${esc(new Date(ai.at).toLocaleString("zh-CN"))}</div></div>`
      :`<div class="muted small">${typeof aiReady==="function"&&aiReady()?"AI 分析还没有生成：点下面的按钮，或等孩子打开网站时自动生成。":"在下面「AI 学习报告」里填上 Google AI Key 后，AI 会写出详细的计划和孩子的目标。"}</div>`}
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" id="planRe">${ic("check")}重新分析（用最新数据）</button>${typeof aiReady==="function"&&aiReady()?`<button class="btn primary" id="planAi" ${PL_BUSY?"disabled":""}>${ic("sparkle")}${PL_BUSY?"AI 正在分析…":"AI 写本周计划"}</button>`:""}</div>
    ${PL_MSG?`<div class="notice warn">${esc(PL_MSG)}</div>`:""}
  </div>`;
}
function planParentBind(){
  const on=$("#planOn"); if(on)on.onchange=()=>{const b=B();b.prefs={...b.prefs,planOff:!on.checked,u:Date.now()};Store.save();render();};
  const re=$("#planRe"); if(re)re.onclick=()=>{B().eng.ai[planKey()]=planMake();Store.save();PL_MSG="";render();};
  const ai=$("#planAi"); if(ai)ai.onclick=async()=>{PL_BUSY=true;PL_MSG="";render();try{await aiPlan();}catch(e){PL_MSG=typeof aiErr==="function"?aiErr(e):e.message;}PL_BUSY=false;render();};
}
