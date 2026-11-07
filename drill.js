/* ================= 口诀表 · Number facts within 20, step by step from the table to memory =================
   20 questions a day (+ − × ÷ within 20), each with four answers to choose from.
   Level 1: the whole table is on screen: find the answer in it (add/take away: the addition table;
            times/share: the times table).
   Level 2: part of the table is covered: the facts she already knows are hidden first.
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
/* the table: rows and columns 1–10; + and − use sums, × and ÷ use products */
function nfTable(f,lv,reveal){
  const add=f.op==="+"||f.op==="−", sym=add?"+":"×";
  // the cell that holds the answer to look for: + and × give the cell; − and ÷ give the row and the cell value
  const row=f.y, col=f.x; // every fact is stored as x (op) y with: x+y / x×y, or (x+y)−y / (x×y)÷y
  const hidden=(r,c)=>{if(lv<2)return false;const id=add?`f:+:${c}:${r}`:`f:x:${c}:${r}`;const st=(MB().q[id]||{}).st||0;
    if(st>=FACT_KNOWN)return true; return ((r*7+c*13+NF.i*3)%5)<2;}; // known facts first, then about 40% of the rest
  let h=`<table class="nf-table ${add?"add":"mul"}"><tr><th class="nf-sym">${sym}</th>${fRange(1,10).map(c=>`<th class="${reveal&&c===col?"hl":""}">${c}</th>`).join("")}</tr>`;
  for(const r of fRange(1,10)){
    h+=`<tr><th class="${reveal&&r===row?"hl":""}">${r}</th>`;
    for(const c of fRange(1,10)){const v=add?r+c:r*c, on=reveal&&r===row&&c===col, path=reveal&&((r===row&&c<=col)||(c===col&&r<=row));
      h+=`<td class="${on?"ans":path?"path":""} ${!reveal&&hidden(r,c)?"cov":""}">${!reveal&&hidden(r,c)?"":v}</td>`;}
    h+="</tr>";
  }
  return h+"</table>";
}
function nfHow(f){
  if(f.op==="+")return `Find ${f.x} along the top and ${f.y} down the side. Where they meet is the answer.`;
  if(f.op==="−")return `Find ${f.y} down the side, go along the row to ${f.x+f.y}, then look up: the number at the top is the answer.`;
  if(f.op==="×")return `Find ${f.x} along the top and ${f.y} down the side. Where they meet is the answer.`;
  return `Find ${f.y} down the side, go along the row to ${f.x*f.y}, then look up: the number at the top is the answer.`;
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
    ${done?`<div class="nf-fb ${ok?"ok":"bad"}"><div>${ok?"Correct! 对了！":`Not quite. ${esc(f.q)} = <b>${f.ans}</b>. ${esc(nfHow(f))}`}</div><div class="muted small">${esc(factTip(f))}</div></div>
      ${ok?"":`<button class="btn primary big" id="nfNext">Next 下一题</button>`}`:""}
    ${showT?`<div class="nf-tablebox">${lv===1&&!done?`<div class="muted small">${esc(nfHow(f))}</div>`:""}${nfTable(f,done?1:lv,done&&!ok)}</div>`
      :`<button class="btn" id="nfPeek">${ic("layers")}Peek at the table 看一眼表格</button>`}
  </div>`;
  body.querySelectorAll("[data-nf]").forEach(b=>b.onclick=()=>nfPick(+b.dataset.nf));
  const pk=$("#nfPeek"); if(pk)pk.onclick=()=>{NF.peek=true;nfShow();};
  const nx=$("#nfNext"); if(nx)nx.onclick=nfNext;
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
function nfNext(){NF.i++;NF.picked=null;NF.opts=null;NF.peek=false;NF.t0=0;nfShow();}
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
