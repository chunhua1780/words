/* ================= 学习报告 · The learning report for parents (both sites and the family page; the same file) =================
   Every number comes from the child's own saved answers; nothing is estimated. A score is shown only when there is
   enough work in the period (the minimum below), otherwise "not enough data".
   Scoring standard (0–100):
   - Vocabulary: % right of word practice and dictation answers + word-meaning questions. Minimum 20 answers.
   - Phonics: % right of all phonics questions (lesson, sounds, build, letters, hear-and-spell). Minimum 20 answers.
   - Reading: % of comprehension questions right in finished stories and non-fiction. Minimum 2 texts.
   - Science reading: % of questions right in finished science articles. Minimum 1 article.
   - Maths: % right of all maths answers. Minimum 20 answers.
   - Diary: average rubric score of handed-in diaries (length 25, sentences & punctuation 25, vocabulary & joining
     words 25, spelling 25); a Google AI mark out of 10 is shown beside it when there is one. Minimum 2 diaries.
   Grades: A 90–100 excellent · B 80–89 good · C 70–79 secure · D 60–69 needs practice · E under 60 needs help.
   Periods: last 7 days, 30 days, 90 days or everything; trends: the same score week by week for 8 weeks. */
const RP_MIN={vocab:20,phonics:20,reading:2,science:1,maths:20,diary:2};
const RP_NAMES={vocab:"Vocabulary 单词",phonics:"Phonics 拼读",reading:"Reading 阅读",science:"Science reading 科学阅读",maths:"Maths 数学",diary:"Diary 日记"};
const rpGrade=s=>s==null?null:s>=90?["A","excellent 优秀"]:s>=80?["B","good 良好"]:s>=70?["C","secure 达标"]:s>=60?["D","needs practice 需要练习"]:["E","needs help 需要帮助"];
const rpDays=(from,to)=>{const out=[];for(let d=from;d<=to;d=addDays(d,1))out.push(d);return out;};
function rpKind(id,x){if(x.kind)return x.kind;const r=typeof READINGS!=="undefined"&&READINGS.find(r=>r.id===id);return r?r.kind:(/^sc\d/.test(id)?"Science":"");}
function diaryRubric(d){
  const text=d.text||"", words=wordsOfText(text).length, target=DIARY_TARGET(), c=diaryCheck(text);
  const length=Math.min(1,words/target)*25;
  const punct=[c[1],c[2],c[3],c[4]].filter(x=>x.ok).length/4*25;
  const uniq=new Set(wordsOfText(text).map(w=>w.toLowerCase())).size, variety=words?Math.min(1,uniq/words/.6):0;
  const vocab=[c[5],c[6],c[7]].filter(x=>x.ok).length/3*15+variety*10;
  const errs=(d.fix||[]).length, spelling=25*Math.max(0,1-errs/Math.max(1,words)*10);
  return {total:Math.round(length+punct+vocab+spelling),length:Math.round(length),punct:Math.round(punct),vocab:Math.round(vocab),spelling:Math.round(spelling),words,errs};
}
/* all scores for one period */
function rpScores(b,from,to){
  const days=new Set(rpDays(from,to)), E=b.eng||{}, PL=E.plog||{}, M=b.maths||{}, out={};
  let n=0,r=0; for(const d of days){const l=(b.log||{})[d]||{};n+=l.done||0;r+=l.right||0;const p=PL[d]||{};n+=p.vn||0;r+=p.vr||0;} out.vocab={n,r};
  n=0;r=0; for(const d of days){const p=PL[d]||{};n+=(p.n||0)+(p.sn||0)+(p.cn||0)+(p.bn||0);r+=(p.r||0)+(p.sr||0)+(p.cr||0)+(p.br||0);}
  for(const [k,v] of Object.entries(E.phon||{}))if(k.startsWith("c:")&&v&&v.days)for(const [d,[a,c]] of Object.entries(v.days))if(days.has(d)){n+=a;r+=c;}
  out.phonics={n,r};
  const done=Object.entries((b.reading||{}).done||{}).filter(([,x])=>days.has(x.date));
  for(const key of ["reading","science"]){const xs=done.filter(([id,x])=>(rpKind(id,x)==="Science")===(key==="science"));
    out[key]={n:xs.reduce((s,[,x])=>s+(x.n||0),0),r:xs.reduce((s,[,x])=>s+(x.score||0),0),texts:xs.length,list:xs};}
  n=0;r=0; for(const d of days){const l=(M.log||{})[d]||{};n+=l.n||0;r+=l.r||0;} out.maths={n,r};
  const dia=Object.entries(E.diary||{}).filter(([d,v])=>days.has(d)&&v.done&&v.text);
  out.diary={list:dia,n:dia.length,rub:dia.map(([,v])=>diaryRubric(v)),ai:dia.filter(([,v])=>v.ai).map(([,v])=>v.ai.score)};
  for(const k of Object.keys(RP_NAMES)){const o=out[k];
    const vol=k==="reading"||k==="science"?o.texts:k==="diary"?o.n:o.n;
    o.enough=vol>=RP_MIN[k];
    o.score=!o.enough?null:k==="diary"?Math.round(o.rub.reduce((s,x)=>s+x.total,0)/o.rub.length):(o.n?Math.round(o.r/o.n*100):null);
    o.vol=vol;}
  return out;
}
let RP_RANGE=30;
function rpRange(){const t=today();return RP_RANGE?[addDays(t,-(RP_RANGE-1)),t]:["2020-01-01",t];}
/* the whole report for one child */
function reportHtml(b,opts={}){
  const [from,to]=rpRange(), S=rpScores(b,from,to), t=today(), E=b.eng||{}, PL=E.plog||{}, days=rpDays(from,to).filter(d=>d>="2026-01-01");
  const used=k=>!(k==="phonics"&&!S.phonics.n&&typeof PAPER_TYPES!=="undefined");
  const unit=k=>k==="reading"||k==="science"?"texts":k==="diary"?"diaries":"answers";
  // weekly trend (8 weeks), smaller minimum per week
  const weeks=[...Array(8)].map((_,i)=>{const end=addDays(t,-7*(7-i)),st=addDays(end,-6),w=rpScores(b,st,end);return {end,w};});
  const wk=(k)=>weeks.map(({end,w})=>{const o=w[k],vol=k==="reading"||k==="science"?o.texts:o.n,ok=k==="diary"?o.n>=1:k==="reading"||k==="science"?o.texts>=1:o.n>=5;
    const s=!ok?null:k==="diary"?Math.round(o.rub.reduce((a,x)=>a+x.total,0)/o.rub.length):Math.round(o.r/o.n*100);return {end,s};});
  // mistakes in the period
  const mk=[]; for(const d of days)for(const m of (PL[d]||{}).mk||[])mk.push({...m,d});
  const byWord={}; mk.filter(m=>!/^Phonics: choose|^Phonics: sounds/.test(m.k)).forEach(m=>{const o=byWord[m.w]=byWord[m.w]||{n:0,v:[],k:new Set()};o.n++;if(m.v)o.v.push(m.v);o.k.add(m.k);});
  const byType={}; mk.filter(m=>m.e&&/^Phonics/.test(m.k)).forEach(m=>{const o=byType[m.e]=byType[m.e]||{n:0,ex:[]};o.n++;if(o.ex.length<4)o.ex.push(m);});
  const mHist=[]; for(const d of days)for(const x of ((b.maths||{}).hist||{})[d]||[])mHist.push(x);
  const mTop={}; mHist.forEach(x=>{const k=x.t||x.s;const o=mTop[k]=mTop[k]||{n:0,r:0,wrong:[]};o.n++;if(x.ok)o.r++;else if(o.wrong.length<3)o.wrong.push(x);});
  // reading skills
  const skill={}; [...S.reading.list,...S.science.list].forEach(([id,x])=>{let sk=x.sk;
    if(!sk&&typeof READINGS!=="undefined"){const r=READINGS.find(r=>r.id===id);if(r&&x.answers){sk={};r.questions.forEach((q,i)=>{const o=sk[q.skill||"Other"]=sk[q.skill||"Other"]||[0,0];o[1]++;if(x.answers[i])o[0]++;});}}
    for(const [k,[a,n]] of Object.entries(sk||{})){const o=skill[k]=skill[k]||[0,0];o[0]+=a;o[1]+=n;}});
  // suggestions from the real results
  const tips=[];
  const scored=Object.keys(RP_NAMES).filter(k=>used(k)&&S[k].score!=null).sort((a,c)=>S[a].score-S[c].score);
  if(scored.length)tips.push(`最弱的一项是 <b>${RP_NAMES[scored[0]]}</b>（${S[scored[0]].score} 分）：优先加强。`);
  const notDone=Object.keys(RP_NAMES).filter(k=>used(k)&&!S[k].enough); if(notDone.length)tips.push(`做得太少、还不能评分：${notDone.map(k=>RP_NAMES[k]).join("、")}。请督促每天完成。`);
  const wt=Object.entries(mTop).filter(([,o])=>o.n>=3&&o.r/o.n<.7).sort((a,c)=>a[1].r/a[1].n-c[1].r/c[1].n).slice(0,3);
  if(wt.length)tips.push(`数学薄弱题型：${wt.map(([k,o])=>`${esc(k)}（${o.r}/${o.n}）`).join("、")}——这些题型会自动多出现，可以在数学页单独练。`);
  const tt=Object.entries(byType).sort((a,c)=>c[1].n-a[1].n)[0]; if(tt)tips.push(`拼读错误最多的类型：<b>${esc(tt[0])}</b>（${tt[1].n} 次），例如 ${tt[1].ex.slice(0,2).map(m=>`${esc(m.w)}`).join("、")}。`);
  const ws=Object.entries(byWord).sort((a,c)=>c[1].n-a[1].n).slice(0,8); if(ws.length)tips.push(`反复拼错的单词：${ws.map(([w,o])=>`${esc(w)}${o.n>1?`×${o.n}`:""}`).join("、")}——已在复习里，可以让孩子再听写一遍。`);
  const sk=Object.entries(skill).filter(([,[a,n]])=>n>=3).sort((a,c)=>a[1][0]/a[1][1]-c[1][0]/c[1][1])[0]; if(sk&&sk[1][0]/sk[1][1]<.8)tips.push(`阅读理解里最弱的是 <b>${esc(sk[0])}</b>（${sk[1][0]}/${sk[1][1]}）：读完后多问孩子"为什么""你怎么知道的"。`);
  if(S.diary.rub.length){const avg=k=>Math.round(S.diary.rub.reduce((s,x)=>s+x[k],0)/S.diary.rub.length);const parts={length:"长度",punct:"句子和标点",vocab:"用词和连接词",spelling:"拼写"},low=Object.keys(parts).sort((a,c)=>avg(a)-avg(c))[0];
    tips.push(`日记最需要提高的是 <b>${parts[low]}</b>（${avg(low)}/25）。`);}
  const trendTxt=k=>{const s=wk(k).map(x=>x.s).filter(x=>x!=null);if(s.length<3)return "";const a=s.slice(0,Math.floor(s.length/2)),c=s.slice(Math.floor(s.length/2)),d=c.reduce((x,y)=>x+y,0)/c.length-a.reduce((x,y)=>x+y,0)/a.length;
    return d>=5?`<span class="rp-up">↑ improving 进步 +${Math.round(d)}</span>`:d<=-5?`<span class="rp-down">↓ dropping 下降 ${Math.round(d)}</span>`:`<span class="muted">→ steady 平稳</span>`;};
  const spark=k=>`<span class="rp-spark">${wk(k).map(x=>`<i title="week to ${x.end}: ${x.s==null?"no data":x.s}" style="height:${x.s==null?3:Math.max(6,x.s*.32)}px;${x.s==null?"opacity:.25":""}" class="${x.s==null?"":x.s>=80?"g":x.s>=60?"o":"r"}"></i>`).join("")}</span>`;
  const R=k=>{const o=S[k],g=rpGrade(o.score);return `<tr><th>${RP_NAMES[k]}</th><td class="rp-score">${o.score==null?`<span class="muted small">not enough data 数据不足<br>(${o.vol} ${unit(k)}, need ${RP_MIN[k]})</span>`:`<b>${o.score}</b><span class="rp-g g${g[0]}">${g[0]}</span><div class="muted tiny">${g[1]}</div>`}</td>
    <td class="small">${k==="diary"?`${o.n} handed in${o.ai.length?` · AI ${(o.ai.reduce((a,x)=>a+x,0)/o.ai.length).toFixed(1)}/10`:""}`:k==="reading"||k==="science"?`${o.texts} texts · ${o.r}/${o.n} questions`:`${o.r}/${o.n} right`}</td><td>${spark(k)}<div>${trendTxt(k)}</div></td></tr>`;};
  const rangeBtns=[[7,"7 days"],[30,"30 days"],[90,"90 days"],[0,"All 全部"]].map(([v,l])=>`<button class="${RP_RANGE===v?"on":""}" data-rprange="${v}">${l}</button>`).join("");
  return `<div class="rp no-zh">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">学习报告 · Learning report</h3><div class="quick">${rangeBtns}</div></div>
    <div class="muted small">${from<"2026-01-01"?"All time":`${esc(shortDate(from))} – ${esc(shortDate(to))}`} · 所有分数都来自孩子真实完成的练习，做得太少的项目不评分。</div>
    <table class="rp-table"><thead><tr><th>Subject 科目</th><th>Score 分数</th><th>Work done 完成量</th><th>8 weeks 趋势</th></tr></thead><tbody>${Object.keys(RP_NAMES).filter(used).map(R).join("")}</tbody></table>
    ${tips.length?`<div class="rp-tips"><b>提升建议 · What to do next</b><ul>${tips.map(x=>`<li>${x}</li>`).join("")}</ul></div>`:""}
    ${opts.short?"":`
    <details ${Object.keys(byWord).length?"open":""}><summary><b>听错、拼错的单词 · Words spelt wrong (${Object.keys(byWord).length})</b></summary>
      ${Object.keys(byWord).length?`<div class="rp-words">${ws.concat(Object.entries(byWord).sort((a,c)=>c[1].n-a[1].n).slice(8,60)).map(([w,o])=>`<span><b>${esc(w)}</b>${o.n>1?` ×${o.n}`:""} <span class="muted tiny">wrote: ${o.v.slice(0,3).map(esc).join(", ")||"—"} · ${[...o.k].map(esc).join(", ")}</span></span>`).join("")}</div>`:`<div class="muted small">No spelling mistakes recorded in this period.</div>`}</details>
    <details><summary><b>拼读错误类型 · Phonics mistakes by type (${mk.filter(m=>m.e&&/^Phonics/.test(m.k)).length})</b></summary>
      ${Object.keys(byType).length?Object.entries(byType).sort((a,c)=>c[1].n-a[1].n).map(([k,o])=>`<div class="rp-type"><b>${esc(k)}</b> · ${o.n} mistakes<ul>${o.ex.map(m=>`<li>${esc(m.w)}: wrote/chose “${esc(m.v||"—")}”${m.y?` <span class="muted small">— ${esc(m.y)}</span>`:""}</li>`).join("")}</ul></div>`).join(""):`<div class="muted small">No phonics mistakes recorded in this period.</div>`}</details>
    <details><summary><b>数学题型 · Maths by topic (${mHist.length} questions)</b></summary>
      ${Object.keys(mTop).length?`<div class="hist-topics">${Object.entries(mTop).sort((a,c)=>a[1].r/a[1].n-c[1].r/c[1].n).map(([k,o])=>`<span class="${o.r/o.n<.7?"bad":"ok"}">${esc(k)} <b>${o.r}/${o.n}</b></span>`).join("")}</div>
        <div class="small" style="margin-top:6px">${Object.entries(mTop).filter(([,o])=>o.wrong.length).sort((a,c)=>a[1].r/a[1].n-c[1].r/c[1].n).slice(0,5).map(([k,o])=>`<div><b>${esc(k)}</b>: ${o.wrong.map(x=>`${esc(x.q.slice(0,70))} — gave <s>${esc(x.v)}</s>, right ${esc(x.a)}`).join("; ")}</div>`).join("")}</div>`:`<div class="muted small">No maths in this period.</div>`}</details>
    <details><summary><b>阅读报告 · Reading (${S.reading.texts+S.science.texts} texts)</b></summary>
      ${Object.keys(skill).length?`<div class="hist-topics">${Object.entries(skill).sort((a,c)=>a[1][0]/a[1][1]-c[1][0]/c[1][1]).map(([k,[a,n]])=>`<span class="${a/n<.7?"bad":"ok"}">${esc(k)} <b>${a}/${n}</b></span>`).join("")}</div>`:""}
      <div class="rp-reads">${[...S.reading.list,...S.science.list].sort((a,c)=>a[1].date<c[1].date?1:-1).map(([id,x])=>{const r=typeof READINGS!=="undefined"&&READINGS.find(r=>r.id===id);return `<div><span class="muted small">${esc(shortDate(x.date))}</span> <b>${esc(x.title||(r&&r.title)||id)}</b> <span class="hist-t">${esc(rpKind(id,x)||"")}</span> ${x.score}/${x.n}${r&&x.answers?` <span class="muted tiny">${r.questions.map((q,i)=>`${x.answers[i]?"✓":"✗"}${esc(q.skill||"")}`).join(" ")}</span>`:""}</div>`;}).join("")||`<div class="muted small">No reading finished in this period.</div>`}</div></details>
    <details><summary><b>日记全文和评分 · Diaries (${S.diary.n})</b></summary>
      ${S.diary.list.sort((a,c)=>a[0]<c[0]?1:-1).map(([d,v],i)=>{const rb=diaryRubric(v);return `<div class="rp-diary"><div class="row" style="justify-content:space-between;flex-wrap:wrap"><b>${esc(niceDate(d))}</b><span><b>${rb.total}/100</b> <span class="muted small">length ${rb.length} · sentences ${rb.punct} · vocabulary ${rb.vocab} · spelling ${rb.spelling} (/25 each)</span>${v.ai?` · <b>AI ${v.ai.score}/10</b>`:""}</span></div>
        <p class="dv-text">${diaryMarked(v.text,v.fix)}</p>${v.ai&&typeof aiDiaryHtml==="function"?aiDiaryHtml(v.ai):""}</div>`;}).join("")||`<div class="muted small">No diaries handed in during this period.</div>`}</details>
    <details><summary><b>评分标准 · How the scores are worked out</b></summary><div class="small rp-std">
      <p>分数 = 这段时间内孩子真实答题的正确率（0–100），只有完成量达到最低要求才评分：单词 ≥20 题，拼读 ≥20 题，阅读 ≥2 篇，科学阅读 ≥1 篇，数学 ≥20 题，日记 ≥2 篇。</p>
      <p>单词 = 单词练习和听写的正确率 + 词义题正确率。拼读 = 拼读课、发音练习、拼单词、选字母组合、听音写单词的总正确率。阅读 / 科学阅读 = 读完文章后理解题的正确率，并按技能（找信息、推断、词汇、概括、解释）分析。数学 = 所有数学题的正确率。</p>
      <p>日记（满分100）= 长度 25（达到目标字数得满分）+ 句子和标点 25（至少5句、句首大写、句末标点、I 大写）+ 用词 25（时间词、连接词、感受词各5分，用词丰富度10分）+ 拼写 25（每100词错10个得0分）。接入 Google AI 后另外显示 AI 老师评分（满分10）。</p>
      <p>等级：A 90–100 优秀 · B 80–89 良好 · C 70–79 达标 · D 60–69 需要练习 · E 60 以下 需要帮助。趋势图是最近8周每周的分数（每周至少5题/1篇才显示）。</p></div></details>`}
  </div>`;
}
function reportBind(root=document){root.querySelectorAll("[data-rprange]").forEach(b=>b.onclick=()=>{RP_RANGE=+b.dataset.rprange;if(typeof render==="function")render();});}
