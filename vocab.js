/* ================= 词义 · Word meanings: knowing what words mean, not only how to spell them =================
   10 questions a day from the child's own words that have a meaning (from the word lists or the dictionary):
   - "What does … mean?": choose the meaning (4 choices)
   - "Which word fits?": a sentence with a gap, choose the word (4 choices)
   Results: book.eng.plog[date].vn / .vr; wrong answers go to the day's mistakes ("Meaning") for the parent report. */
const VM_N=10;
let VM=null;
function vmWords(){
  const ws=Object.values(B().words).filter(w=>w.def&&String(w.def).length>8&&w.w.length>=4&&/^[a-z' -]+$/i.test(w.w));
  return ws.sort((a,b)=>(b.stage>0)-(a.stage>0)||(a.last||"")<(b.last||"")?-1:1);
}
function vmSet(ids){
  const all=vmWords(), only=ids?all.filter(w=>ids.includes(w.id)):null, ws=only&&only.length>=1?[...only,...all.filter(w=>!ids.includes(w.id))]:all; if(ws.length<4)return [];
  const pick=only&&only.length?shuffle(only).slice(0,VM_N):shuffle(ws.slice(0,40)).slice(0,VM_N), out=[];
  pick.forEach((w,i)=>{
    const others=shuffle(ws.filter(x=>x!==w)).slice(0,3);
    const re=new RegExp("\\b"+w.w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i");
    if((i%2||w.school)&&w.ex&&re.test(w.ex)&&!(w.school&&i%2))out.push({type:"gap",w,q:w.ex.replace(re,"_____"),opts:shuffle([w.w,...others.map(x=>x.w)]),ans:w.w});
    else out.push({type:"mean",w,q:`What does “${w.w}” mean?`,opts:shuffle([w.def,...others.map(x=>x.def)]),ans:w.def});
  });
  return out;
}
function vmEl(){
  let el=document.getElementById("vocabOv"); if(el)return el;
  el=document.createElement("section"); el.id="vocabOv"; el.hidden=true; el.setAttribute("aria-label","Word meanings");
  el.innerHTML=`<div class="s-top"><button class="icon-btn" id="vmClose" aria-label="Close">${ic("x")}</button><span class="s-label">Word meanings · 词义</span><span class="muted small" id="vmProg" style="margin-left:auto"></span></div><div class="s-body" id="vmBody"></div>`;
  document.body.appendChild(el); el.querySelector("#vmClose").onclick=closeVocab; return el;
}
function openVocab(ids){
  const set=vmSet(Array.isArray(ids)?ids:null); window.__busy=true; vmEl().hidden=false; document.body.style.overflow="hidden";
  VM={set,i:0,r:0,pick:null};
  if(!set.length){$("#vmBody").innerHTML=`<div class="m-q m-results"><h2>Not enough words with meanings yet</h2><p class="muted">Learn some new words first (their meanings come with them). 先学一些新单词。</p><button class="btn primary" id="vmDone">OK</button></div>`;$("#vmDone").onclick=closeVocab;return;}
  vmShow();
}
function closeVocab(){window.__busy=false;vmEl().hidden=true;document.body.style.overflow="";VM=null;Store.save();if(typeof render==="function")render();}
function vmShow(){
  const body=$("#vmBody"); $("#vmProg").textContent=VM.i<VM.set.length?`${VM.i+1} / ${VM.set.length}`:"";
  if(VM.i>=VM.set.length){
    const n=VM.set.length,r=VM.r,k=r>=n*.9?3:r>=n*.7?2:r>=n*.4?1:0;
    body.innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(k)}${"☆".repeat(3-k)}</div><h2>${r} out of ${n} right</h2><p class="muted">Words you got wrong come back soon. 错的单词很快会再出现。</p><button class="btn primary big" id="vmDone">Done</button></div>`;
    $("#vmDone").onclick=closeVocab; if(typeof beep==="function")beep(true,true); return;
  }
  const q=VM.set[VM.i], picked=VM.pick!=null, ok=picked&&q.opts[VM.pick]===q.ans;
  body.innerHTML=`<div class="m-q eng-page">
    <span class="kind-tag" style="--kc:var(--c-teal,#1aa59a)">${q.type==="gap"?"Which word fits? 选词填空":"What does it mean? 选词义"}</span>
    <div class="m-text">${q.type==="gap"?esc(q.q):`What does <b class="vm-w">${esc(q.w.w)}</b> mean?`} <button class="icon-btn sm" id="vmSay">${ic("speaker")}</button></div>
    <div class="m-opts vm-opts">${q.opts.map((o,i)=>`<button class="opt-btn m-opt ${picked&&o===q.ans?"right":""} ${picked&&i===VM.pick&&!ok?"wrong":""}" data-o="${i}" ${picked?"disabled":""}>${esc(o)}</button>`).join("")}</div>
    ${picked?`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Correct!":"Not quite."} ${esc(q.w.w)}: ${esc(q.w.def)}</b>${q.w.ex?`<span>${esc(q.w.ex)}</span>`:""}</div></div>
      <button class="btn primary big" id="vmNext">${VM.i+1<VM.set.length?"Next":"See results"}</button>`:""}
  </div>`;
  $("#vmSay").onclick=()=>say(q.type==="gap"?q.q.replace("_____","blank"):q.w.w);
  body.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{VM.pick=+b.dataset.o;const good=q.opts[VM.pick]===q.ans;if(typeof beep==="function")beep(good);if(good)VM.r++;
    const E=B().eng,t=today(),d=E.plog[t]||{n:0,r:0};E.plog[t]={...d,vn:(d.vn||0)+1,vr:(d.vr||0)+(good?1:0),u:Date.now()};
    if(!good){logEngMiss("Meaning",q.w.w,q.opts[VM.pick],"Word meaning");q.w.due=today();q.w.u=Date.now();}
    Store.save(); vmShow(); say(q.w.w);});
  const nx=$("#vmNext"); if(nx)nx.onclick=()=>{VM.i++;VM.pick=null;vmShow();};
}

/* ---------- 家长添加单词 · words a parent adds, with their meaning and an example sentence ----------
   One word per line: word | meaning | example sentence (meaning and example are optional; "-", "=" or "：" work too).
   They go into the chosen day's word list (and that day's new words on the Year 5 site), so they are learned,
   dictated and reviewed like every other word, and they appear in the Word meanings quiz. */
let CW_MSG="", CW_DATE=null;
function customWordsBlock(){
  const ws=Object.values(B().words).filter(w=>w.custom).sort((a,b)=>(b.added||"")<(a.added||"")?-1:1).slice(0,30);
  return `<div class="card stack no-zh" id="cwBox"><h3 style="margin:0">添加单词和释义 · Add words with meanings</h3>
    <div class="muted small">每行一个：<b>单词 | 中文或英文释义 | 例句</b>（释义和例句可以不写）。例如：<code>habitat | the natural home of an animal | A pond is a habitat for frogs.</code> 加入后会自动进入孩子当天的单词学习、听写、复习和词义练习。</div>
    <label class="field">Day 学习日期<input type="date" id="cwDate" value="${CW_DATE||today()}"></label>
    <textarea id="cwText" rows="5" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="habitat | the natural home of an animal | A pond is a habitat for frogs.&#10;evaporate | 蒸发 | Puddles evaporate in the sun."></textarea>
    <div class="row" style="gap:8px"><button class="btn primary" id="cwSave">${ic("plus")}Add words 添加</button></div>
    ${CW_MSG?`<div class="notice">${CW_MSG}</div>`:""}
    ${ws.length?`<details><summary><b>Words added by parents 家长加的单词 (${ws.length})</b></summary><div class="cw-list">${ws.map(w=>`<div><b>${esc(w.w)}</b> <span class="muted small">${esc(w.list||"")}</span><div class="small">${esc(w.def||"")}${w.ex?` · <i>${esc(w.ex)}</i>`:""}</div><span class="muted tiny">${w.stage>0?"learned":"not learned yet"} · right ${w.right||0}/${w.seen||0}</span></div>`).join("")}</div></details>`:""}
  </div>`;
}
function customWordsBind(){
  const sv=document.getElementById("cwSave"); if(!sv)return;
  const dt=document.getElementById("cwDate"); dt.onchange=()=>{CW_DATE=dt.value;};
  sv.onclick=()=>{
    const date=dt.value||today(), rows=document.getElementById("cwText").value.split(/\n/).map(l=>l.split(/\s*[|=：]\s*|\s+-\s+/).map(x=>x.trim())).filter(r=>r[0]&&/^[A-Za-z][A-Za-z' -]{0,30}$/.test(r[0]));
    if(!rows.length){CW_MSG="请按“单词 | 释义 | 例句”的格式输入，每行一个。";render();return;}
    const b=B(), r=addWordsToBook(b,rows.map(x=>x[0]),{date});
    for(const [w,def,ex] of rows){const o=Object.values(b.words).find(x=>x.list===date&&norm(x.w)===norm(w));if(!o)continue;o.custom=true;if(def)o.def=def;if(ex)o.ex=ex;o.u=Date.now();}
    if(b.eng&&b.eng.daily&&b.eng.daily[date]){const d=b.eng.daily[date];d.words=[...new Set([...d.words,...rows.map(x=>x[0])])];d.u=Date.now();}
    Store.save(); CW_DATE=date; CW_MSG=`已添加 ${r.added.length} 个单词到 ${esc(niceDate(date))}${r.reused.length?`（${r.reused.length} 个已经在了，释义已更新）`:""}。孩子那天学单词时就会学到它们。`; render();
  };
}
