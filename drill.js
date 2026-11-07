/* ================= 口诀表 · Number facts within 20, step by step from the table to memory =================
   20 questions a day (+ − × ÷ within 20), each with four answers to choose from.
   Level 1: the 口诀 list for the question is on screen (e.g. "8 + …", "13 − …", "the 3 times table"):
            find the line; "Show me how" animates the three steps, and it plays by itself after a wrong answer.
   Level 2: part of the list is covered: the facts she already knows are hidden first.
   Level 3: no table: answer from memory (a "Peek" button shows the table, but that answer does not count as quick).
   After a day's 20: 18 or more right, mostly quick → next level; fewer than 12 right → back a level.
   A parent can fix the level on the parent page. Each fact also updates its Quick facts record ("f:…"),
   and the day's marks are kept in book.maths.log["nf:<date>"], the level in book.maths.log["nflv"]. */
const NF_N=20, NF_FAST=6000;
const nfLevel=()=>{const p=+((B().prefs||{}).nfLevel)||0;if(p)return p;const l=(MB().log||{}).nflv;return l&&l.lv?l.lv:1;};
const nfAuto=()=>!(+((B().prefs||{}).nfLevel));
let NF=null;
function nfEl(){
  let el=document.getElementById("drillOv"); if(el)return el;
  el=document.createElement("section"); el.id="drillOv"; el.hidden=true; el.setAttribute("aria-label","Number facts");
  el.innerHTML=`<div class="s-top"><button class="icon-btn" id="nfClose" aria-label="Close">${ic("x")}</button><span class="s-label">口诀表 · Number facts within 20</span><span class="muted small" id="nfProg" style="margin-left:auto"></span></div>
    <div class="s-body" id="nfBody"></div>`;
  document.body.appendChild(el); el.querySelector("#nfClose").onclick=closeDrill; return el;
}
function openDrill(){
  const facts=factPick("mix20",NF_N);
  NF={facts,i:0,r:0,ms:0,lv:nfLevel(),t0:0,picked:null,peek:false,res:[]};
  window.__busy=true; nfEl().hidden=false; document.body.style.overflow="hidden"; nfShow();
}
function closeDrill(){window.__busy=false;nfEl().hidden=true;document.body.style.overflow="";NF=null;Store.save();if(typeof render==="function")render();}
/* ---------- the 口诀 list for one question: one small table of whole sums, found line by line ----------
   +  8 + 5 → the "8 + …" list (8 + 1 = 9 … 8 + 10 = 18): find the line "8 + 5", the answer is after =
   −  13 − 5 → the "13 − …" list: find "13 − 5", the answer is after =
   ×  4 × 3 → the 3 times table (1 × 3 = 3 … 10 × 3 = 30): find "4 × 3", the answer is after =
   ÷  18 ÷ 3 → the 3 times table: find the line that ends "= 18"; its first number is the answer */
function nfLines(f){
  if(f.op==="+")return {title:`${f.x} 加几 · ${f.x} + …`,lines:fRange(1,10).map(n=>({n,l:`${f.x} + ${n}`,r:f.x+n})),target:f.y};
  if(f.op==="−"){const c=f.x+f.y;return {title:`${c} 减几 · ${c} − …`,lines:fRange(1,Math.min(10,c)).map(n=>({n,l:`${c} − ${n}`,r:c-n})),target:f.y};}
  return {title:`${f.y} 的乘法口诀 · ${f.y} times table`,lines:fRange(1,10).map(n=>({n,l:`${n} × ${f.y}`,r:n*f.y})),target:f.x};
}
function nfSteps(f){
  const c=f.x+f.y, p=f.x*f.y;
  if(f.op==="+")return [`第1步：看「${f.x} 加几」这张表。 Look at the ${f.x} + … list.`,`第2步：从上往下找到 ${f.x} + ${f.y} 这一行。 Go down to the line ${f.x} + ${f.y}.`,`第3步：等号后面的数就是答案：${f.x} + ${f.y} = ${f.ans}。 The number after = is the answer.`];
  if(f.op==="−")return [`第1步：看「${c} 减几」这张表。 Look at the ${c} − … list.`,`第2步：从上往下找到 ${c} − ${f.y} 这一行。 Go down to the line ${c} − ${f.y}.`,`第3步：等号后面的数就是答案：${c} − ${f.y} = ${f.ans}。 The number after = is the answer.`];
  if(f.op==="×")return [`第1步：看「${f.y} 的乘法口诀」。 Look at the ${f.y} times table.`,`第2步：从上往下找到 ${f.x} × ${f.y} 这一行。 Go down to the line ${f.x} × ${f.y}.`,`第3步：等号后面的数就是答案：${f.x} × ${f.y} = ${f.ans}。 The number after = is the answer.`];
  return [`第1步：除法就是倒过来的乘法。看「${f.y} 的乘法口诀」。 Division is times backwards: look at the ${f.y} times table.`,`第2步：从上往下找，等号后面是 ${p} 的那一行。 Go down until a line ends in = ${p}.`,`第3步：这一行最前面的数就是答案：${f.x} × ${f.y} = ${p}，所以 ${p} ÷ ${f.y} = ${f.x}。 The first number of that line is the answer.`];
}
function nfList(f,lv,reveal){
  const {title,lines,target}=nfLines(f), div=f.op==="÷";
  const cover=n=>{if(reveal||lv<2)return false;const id=f.op==="+"?`f:+:${f.x}:${n}`:f.op==="−"?`f:-:${f.x+f.y}:${n}`:`f:x:${n}:${f.y}`;
    if(((MB().q[id]||{}).st||0)>=FACT_KNOWN)return true; return ((n*7+NF.i*3)%5)<2;};
  return `<div class="nf-list ${reveal?"reveal":""}" id="nfList"><div class="nf-lt">${esc(title)}</div>
    ${lines.map(x=>{const hit=reveal&&x.n===target, c=cover(x.n);
      const left=div?`<span class="nf-a ${hit?"glow":""}">${x.n}</span> × ${f.y}`:esc(x.l);
      return `<div class="nf-line ${hit?"target":""}" data-l="${x.n}"><span class="nf-l">${left}</span><span class="nf-eq">=</span><span class="nf-r ${!div&&hit?"glow":""} ${div&&hit?"glow":""}">${c?`<i class="nf-cov">?</i>`:x.r}</span></div>`;}).join("")}
  </div>`;
}
/* the step-by-step demo: step 1 the list lights up, step 2 a marker goes down line by line, step 3 the answer */
let nfAnimT=[];
function nfAnimate(){
  nfAnimT.forEach(clearTimeout); nfAnimT=[];
  const f=NF.facts[NF.i], box=document.getElementById("nfList"), st=document.getElementById("nfSteps"); if(!box||!st)return;
  const {target,lines}=nfLines(f), steps=nfSteps(f), div=f.op==="÷", p=f.x*f.y;
  box.classList.remove("reveal"); box.querySelectorAll(".nf-line").forEach(l=>l.classList.remove("scan","target","seen"));
  box.querySelectorAll(".glow").forEach(e=>e.classList.remove("glow"));
  box.querySelectorAll(".nf-cov").forEach(e=>{const l=e.closest(".nf-line");const x=lines.find(y=>y.n===+l.dataset.l);e.outerHTML=String(x.r);});
  const show=k=>{st.innerHTML=steps.map((t,i)=>`<div class="nf-step ${i===k?"on":i<k?"past":""}"><b>${i+1}</b><span>${esc(t.replace(/^第\d步：/,""))}</span></div>`).join("");};
  const at=(ms,fn)=>nfAnimT.push(setTimeout(()=>{if(NF&&NF.facts[NF.i]===f)fn();},ms));
  show(0); box.classList.add("pulse"); at(1400,()=>box.classList.remove("pulse"));
  let t=1500; const order=lines.map(x=>x.n), stop=div?order.find(n=>n*f.y===p):target;
  at(t,()=>show(1));
  for(const n of order){
    at(t+=550,()=>{box.querySelectorAll(".nf-line.scan").forEach(l=>{l.classList.remove("scan");l.classList.add("seen");});const l=box.querySelector(`[data-l="${n}"]`);if(l){l.classList.add("scan");l.scrollIntoView({block:"nearest",behavior:"smooth"});}});
    if(n===stop)break;
  }
  at(t+=900,()=>{show(2);const l=box.querySelector(`[data-l="${stop}"]`);if(!l)return;l.classList.remove("scan");l.classList.add("target");
    (div?l.querySelector(".nf-a"):l.querySelector(".nf-r")).classList.add("glow");});
}
function nfOpts(f){
  const a=f.ans, s=new Set([a]), near=[a+1,a-1,a+2,a-2,a+10,a-10,f.op==="×"||f.op==="÷"?a+f.y:a+3].filter(x=>x>=0&&x!==a);
  for(const x of shuffle(near)){if(s.size>=4)break;s.add(x);}
  while(s.size<4)s.add(a+s.size+3);
  return shuffle([...s]);
}
function nfShow(){
  const body=$("#nfBody"); $("#nfProg").textContent=NF.i<NF.facts.length?`${NF.i+1} / ${NF.facts.length}`:"";
  if(NF.i>=NF.facts.length)return nfEnd();
  const f=NF.facts[NF.i], lv=NF.lv; NF.opts=NF.opts||nfOpts(f); NF.t0=NF.t0||Date.now();
  const done=NF.picked!=null, ok=done&&NF.picked===f.ans, showT=lv<3||NF.peek||done&&!ok;
  body.innerHTML=`<div class="nf-wrap">
    <div class="nf-lv">${[1,2,3].map(k=>`<span class="${k===lv?"on":k<lv?"past":""}">${k===1?"看表找答案 · Use the table":k===2?"表格遮住一部分 · Part covered":"背出来 · From memory"}</span>`).join("")}</div>
    <div class="nf-q">${f.q} = <b class="${done?(ok?"ok":"bad"):""}">${done?f.ans:"?"}</b></div>
    <div class="nf-opts">${NF.opts.map(o=>`<button class="nf-opt ${done&&o===f.ans?"right":""} ${done&&o===NF.picked&&!ok?"wrong":""}" data-nf="${o}" ${done?"disabled":""}>${o}</button>`).join("")}</div>
    ${done?`<div class="nf-fb ${ok?"ok":"bad"}"><div>${ok?"Correct! 对了！":`Not quite. ${esc(f.q)} = <b>${f.ans}</b>. Watch the steps below. 看下面的步骤。`}</div><div class="muted small">${esc(factTip(f))}</div></div>
      ${ok?"":`<button class="btn primary big" id="nfNext">Next 下一题</button>`}`:""}
    ${showT?`<div class="nf-tablebox">
        <button class="btn nf-demo" id="nfDemo">${ic("play")}演示怎么用表 · Show me how</button>
        <div class="nf-steps" id="nfSteps">${nfSteps(f).map((t,i)=>`<div class="nf-step"><b>${i+1}</b><span>${esc(t.replace(/^第\d步：/,""))}</span></div>`).join("")}</div>
        ${nfList(f,done?1:lv,done)}</div>`
      :`<button class="btn" id="nfPeek">${ic("layers")}Peek at the table 看一眼口诀表</button>`}
  </div>`;
  body.querySelectorAll("[data-nf]").forEach(b=>b.onclick=()=>nfPick(+b.dataset.nf));
  const pk=$("#nfPeek"); if(pk)pk.onclick=()=>{NF.peek=true;nfShow();};
  const nx=$("#nfNext"); if(nx)nx.onclick=nfNext;
  const dm=$("#nfDemo"); if(dm)dm.onclick=nfAnimate;
  if(done&&!ok)setTimeout(nfAnimate,300); // wrong: show how, step by step
  else if(!done&&lv===1&&NF.i===0&&!NF.demoed){NF.demoed=true;setTimeout(nfAnimate,500);} // the first question of a session at level 1
}
function nfPick(v){
  const f=NF.facts[NF.i], ms=Date.now()-NF.t0, ok=v===f.ans; NF.picked=v;
  recordFact(f,ok,NF.peek||NF.lv<3?Math.max(ms,fxGoal()+1):ms); // with the table on screen it is never counted as "known by heart"
  if(ok){NF.r++;NF.ms+=ms;} NF.res.push({q:f.q,a:f.ans,v,ok,ms});
  const M=MB(), t=today(), G=M.log["nf:"+t]=M.log["nf:"+t]||{n:0,r:0}; G.n++; if(ok)G.r++; G.lv=NF.lv; G.u=Date.now();
  try{const H=M.hist[t]=M.hist[t]||[],n=new Date();if(H.length<400)H.push({q:f.q,a:String(f.ans),v:String(v),ok,s:"口诀表 Number facts",tr:1,f:0,tm:String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0")});}catch(e){}
  if(typeof beep==="function")beep(ok);
  Store.save(); nfShow();
  if(ok)setTimeout(()=>{if(NF&&NF.picked===v&&NF.facts[NF.i]===f)nfNext();},700);
}
function nfNext(){nfAnimT.forEach(clearTimeout);nfAnimT=[];NF.i++;NF.picked=null;NF.opts=null;NF.peek=false;NF.t0=0;nfShow();}
function nfEnd(){
  const n=NF.facts.length, r=NF.r, avg=r?Math.round(NF.ms/r/100)/10:0, lv=NF.lv;
  let msg="", nlv=lv;
  if(nfAuto()){
    const quick=NF.res.filter(x=>x.ok&&x.ms<=NF_FAST).length;
    if(r>=18&&quick>=14&&lv<3){nlv=lv+1;msg=`Brilliant! Next time: level ${nlv}${nlv===2?" (part of the table is covered)":" (from memory)"}. 下次升级！`;}
    else if(r<12&&lv>1){nlv=lv-1;msg=`Next time the table helps a bit more (level ${nlv}). 下次多用表格帮忙。`;}
    else msg=lv<3?`Get 18 right, most within ${NF_FAST/1000} seconds, to move up a level. 答对18道、大部分6秒内，就能升级。`:"Keep it up: all from memory! 继续保持！";
    const M=MB(); M.log.nflv={lv:nlv,u:Date.now()};
  }
  Store.save(); if(typeof beep==="function")beep(true,true);
  $("#nfBody").innerHTML=`<div class="nf-wrap m-results">
    <div class="stars">${"★".repeat(r>=18?3:r>=14?2:r>=8?1:0)}${"☆".repeat(3-(r>=18?3:r>=14?2:r>=8?1:0))}</div>
    <h2>${r} out of ${n} right</h2><p class="muted">Average ${avg} seconds a question · level ${lv}</p>
    <div class="notice">${esc(msg)}</div>
    <div class="nf-sum">${NF.res.map(x=>`<span class="${x.ok?"ok":"bad"}">${esc(x.q)} = ${x.a}${x.ok?"":` <s>${x.v}</s>`}</span>`).join("")}</div>
    <button class="btn primary big" id="nfDone">Done</button></div>`;
  $("#nfDone").onclick=closeDrill;
}
function drillCard(){
  const g=((MB().log||{})["nf:"+today()])||{n:0,r:0}, lv=nfLevel();
  return `<div class="card maths-card"><div class="badge lg" style="background:var(--c-orange,#f08a24);color:#fff">±</div>
    <div class="grow stack tight" style="gap:4px"><span class="kind-tag">口诀表 · Number facts</span><h3 style="margin:0">+ − × ÷ within 20</h3>
      <div class="muted small">Level ${lv}: ${lv===1?"find the answer in the table":lv===2?"part of the table is covered":"from memory"}${g.n?` · today ${Math.min(g.n,NF_N)} done, ${g.r} right`:""}</div></div>
    <button class="btn primary" data-drill>${g.n>=NF_N?"Again":"Start"}</button></div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-drill]");if(b&&Store.book){e.preventDefault();openDrill();}});
