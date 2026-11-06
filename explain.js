/* ================= 答疑: worked solutions, one step at a time =================
   Shared by both study sites (same file in each repo). Every maths question has steps:
   generated questions carry their own (q.steps), bank questions have theirs in maths-steps.js
   (MSTEPS, by id), and anything else is split from its explanation sentence by sentence.
   Before the answer is known the 答疑 button only shows the method (all steps but the last), so it
   helps without giving the answer away; after answering it shows the full working. */
/* Fractions written the textbook way: numerator over a straight line over denominator.
   "3/4" and the letter form "n/4" become stacked; "2 3/4" keeps the whole number in front. Works on escaped HTML. */
function fracHtml(h){
  const fr=(a,b)=>`<span class="fr"><span class="fn">${a}</span><span class="fd">${b}</span></span>`;
  return String(h).replace(/(^|[^\w\/.,:])(\d+|[a-z])\/(\d+)(?![\w\/])/g,(m,pre,a,b)=>pre+fr(a,b));
}
function stepsFor(q){
  if(!q)return [];
  if(q.steps&&q.steps.length)return q.steps;
  if(typeof MSTEPS!=="undefined"&&MSTEPS[q.id])return MSTEPS[q.id];
  const w=String(q.w||"").trim(); if(!w)return [];
  return w.split(/(?<=[.!?])\s+(?=[A-Z0-9(£−“"'√∛])/).map(s=>s.trim()).filter(Boolean);
}
/* The hint (before the answer is known) stops before the first step that states the answer */
const exNorm=s=>String(s).replace(/-/g,"−").replace(/(\d),(?=\d{3})/g,"$1").replace(/\s+/g," ").toLowerCase();
function hintSteps(q){
  const all=stepsFor(q); if(all.length<2)return [];
  let a=q.k==="c"?q.c[q.a]:q.k==="n"?fmtN(q.a):String(q.a); a=exNorm(a).trim();
  const e=a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const re=new RegExp("(=|:|→|≈|\\b(is|are|be|gets?|reach|so|answer|equals))\\s*[£(“\"']?"+e+"(?![\\d/.]*\\d)","i");
  let k=all.findIndex(t=>re.test(exNorm(t))); if(k<0)k=all.length-1;
  return all.slice(0,k);
}
function stepsHtml(steps,cls=""){return `<ol class="p-steps ${cls}">${steps.map((t,i)=>`<li style="--d:${i*.35}s">${mt(t)}</li>`).join("")}</ol>`;}
/* full: after answering (all steps). Otherwise a hint: every step except the one with the answer. */
function explainBox(q,full){
  const list=full?stepsFor(q):hintSteps(q);
  if(!list.length)return "";
  const n=Math.min(MS.exp||0,list.length);
  if(!n)return `<button class="btn ex-btn" id="mExp">${ic("sparkle")}<span>答疑</span><small>${full?"See how to work it out, step by step":"Stuck? Show me how to start"}</small></button>`;
  const anim=MS.exp>=99;
  return `<div class="ex-box ${full?"":"hint"}">
    <div class="ex-head"><b>答疑 · ${full?"Step by step":"How to start"}</b><span class="muted small">${n} of ${list.length}</span></div>
    <ol class="p-steps ex ${anim?"show":""}">${list.slice(0,n).map((t,i)=>`<li class="${!anim&&i===n-1?"new":""}" style="--d:${anim?i*.35:0}s">${mt(t)}</li>`).join("")}</ol>
    ${n<list.length?`<div class="ex-more"><button class="btn primary" id="mExpNext">Next step · 下一步</button><button class="btn ghost" id="mExpAll">Show all · 全部</button></div>`
      :full?"":`<p class="muted small ex-try">Now try the last step yourself.</p>`}
  </div>`;
}
function bindExplain(body,rerender){
  const step=k=>()=>{MS.exp=k==="all"?99:(MS.exp||0)+1; MS.expAnim=false; rerender();
    const li=body.querySelector(".ex-box li.new")||body.querySelector(".ex-box"); if(li)li.scrollIntoView({block:"nearest",behavior:"smooth"});};
  const a=body.querySelector("#mExp"); if(a)a.onclick=step(1);
  const b=body.querySelector("#mExpNext"); if(b)b.onclick=step(1);
  const c=body.querySelector("#mExpAll"); if(c)c.onclick=step("all");
}
/* Results page: every question gets a closed 答疑 row with its full working */
const resultSteps=q=>{const s=stepsFor(q);return s.length?`<details class="ex-row"><summary>答疑 · Step by step</summary>${stepsHtml(s)}</details>`:"";};
