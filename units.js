/* ================= 单位换算 · Converting units, step by step (Year 5 site) =================
   Each unit fact (1 km = 1000 m, 1 l = 1000 ml, 1 cm³ = 1 ml …) goes up a ladder, one step a day:
     1 Learn  (看): the fact, why (kilo = 1000, centi = 100th …), the rule (big → small: ×, small → big: ÷)
                    and two worked examples; then a question with the answer shown, so the first time is right.
     2 Choose (选): multiple choice on her own: the fact, then a conversion.
     3 Drag   (拖): drag the tiles into the gaps: the rule (× or ÷, by 10 / 100 / 1000) and the answer's number.
     4 Practise (练): 4 conversions typed in, both ways, with decimals; 3 right makes it pass.
   Then spaced review (1, 3, 7, 14, 30 days), alternating dragging and practising. A mistake shows the working
   at once, comes back at the end of the session and moves the fact one step back for the next day.
   Saved (synced): book.maths.q["uc:<fact>"] = {s, box, due, n, r, wr, u}; book.maths.log["uc:<date>"] = {n, r, done, items, fin}. */
const UC=[
  {k:"cm-mm",big:"cm",small:"mm",f:10,kind:"Length",bn:"centimetre",sn:"millimetre",why:"A centimetre is split into 10 tiny millimetres (look at your ruler)."},
  {k:"m-cm",big:"m",small:"cm",f:100,kind:"Length",bn:"metre",sn:"centimetre",why:"Centi means a hundredth: 100 centimetres make 1 metre (a metre stick has 100 cm)."},
  {k:"m-mm",big:"m",small:"mm",f:1000,kind:"Length",bn:"metre",sn:"millimetre",why:"Milli means a thousandth: 1000 millimetres make 1 metre (100 cm × 10 mm)."},
  {k:"km-m",big:"km",small:"m",f:1000,kind:"Length",bn:"kilometre",sn:"metre",why:"Kilo means 1000: a kilometre is 1000 metres (about 12 minutes' walk)."},
  {k:"kg-g",big:"kg",small:"g",f:1000,kind:"Mass",bn:"kilogram",sn:"gram",why:"Kilo means 1000: a kilogram is 1000 grams (a bag of sugar)."},
  {k:"l-ml",big:"l",small:"ml",f:1000,kind:"Capacity",bn:"litre",sn:"millilitre",why:"Milli means a thousandth: 1000 millilitres fill 1 litre (a big bottle of water)."},
  {k:"cl-ml",big:"cl",small:"ml",f:10,kind:"Capacity",bn:"centilitre",sn:"millilitre",why:"Like cm and mm: 1 centilitre is 10 millilitres."},
  {k:"l-cl",big:"l",small:"cl",f:100,kind:"Capacity",bn:"litre",sn:"centilitre",why:"Centi means a hundredth: 100 centilitres make 1 litre."},
  {k:"ml-cm3",big:"ml",small:"cm³",f:1,kind:"Volume",bn:"millilitre",sn:"cubic centimetre",why:"A 1 cm cube holds exactly 1 ml of water, so 1 ml = 1 cm³."},
  {k:"l-cm3",big:"l",small:"cm³",f:1000,kind:"Volume",bn:"litre",sn:"cubic centimetre",why:"1 l = 1000 ml and 1 ml = 1 cm³, so 1 litre = 1000 cm³ (a 10 cm × 10 cm × 10 cm cube)."},
  {k:"m3-l",big:"m³",small:"l",f:1000,kind:"Volume",bn:"cubic metre",sn:"litre",why:"A 1 m cube (100 cm each way) holds 1000 litres."},
  {k:"m3-cm3",big:"m³",small:"cm³",f:1000000,kind:"Volume",bn:"cubic metre",sn:"cubic centimetre",why:"100 × 100 × 100 = 1 000 000 cubes of 1 cm³ fit in 1 m³."},
];
const UC_BY=Object.fromEntries(UC.map(u=>[u.k,u])), UC_GAP=[1,3,7,14,30], UC_DAY=6;
const UC_KC={Length:"var(--c-blue,#2f6fec)",Mass:"var(--c-orange,#f08c00)",Capacity:"var(--c-teal,#1aa59a)",Volume:"var(--c-purple,#7a5af8)"};
const ucN=x=>{const v=Math.round(x*1e6)/1e6;return v.toLocaleString("en-GB",{maximumFractionDigits:6});};
const ucFact=u=>`1 ${u.big} = ${ucN(u.f)} ${u.small}`;
const ucSt=k=>(MB().q["uc:"+k])||{s:0};
const ucSet=(k,v)=>{MB().q["uc:"+k]={...ucSt(k),...v,u:Date.now()};};
const ucLog=(t=today())=>MB().log["uc:"+t]||null;
/* a conversion question: dir "down" = big → small (×), "up" = small → big (÷) */
function ucQ(u,dir){
  const nums=u.f>=1000?[2,3,4,5,6,7,8,9,1.5,2.5,3.2,0.5,0.25,4.75,12]:u.f===100?[2,3,4,5,7,1.5,2.4,0.6,0.35,3.08,12]:u.f===1?[5,12,40,250,750,1000]:[2,3,4,5,8,1.5,2.3,0.7,12,25];
  const x=nums[Math.floor(Math.random()*nums.length)], down=dir==="down";
  const from=down?x:x*u.f, to=down?x*u.f:x, a=down?u.big:u.small, b=down?u.small:u.big;
  const rule=u.f===1?"they are the same size, so the number stays the same":down?`${a} is the bigger unit, so you need more of the smaller ${b}: × ${ucN(u.f)}`:`${a} is the smaller unit, so you need fewer of the bigger ${b}: ÷ ${ucN(u.f)}`;
  return {q:`${ucN(from)} ${a} = ? ${b}`,from,to,a,b,op:u.f===1?"=":down?"×":"÷",steps:[`${ucFact(u)}.`,`${a} → ${b}: ${rule}.`,u.f===1?`${ucN(from)} ${a} = ${ucN(to)} ${b}.`:`${ucN(from)} ${down?"×":"÷"} ${ucN(u.f)} = ${ucN(to)}, so ${ucN(from)} ${a} = ${ucN(to)} ${b}.`]};
}
function ucToday(t=today()){
  const L=ucLog(t); if(L&&L.items)return L.items;
  const st=Object.fromEntries(UC.map(u=>[u.k,ucSt(u.k)]));
  const due=UC.filter(u=>st[u.k].s>=2&&(st[u.k].due||"")<=t).sort((a,b)=>st[a.k].s-st[b.k].s||((st[a.k].due||"")<(st[b.k].due||"")?-1:1));
  const items=due.slice(0,UC_DAY).map(u=>({k:u.k,step:st[u.k].s>=5?((st[u.k].box||0)%2?4:3):st[u.k].s}));
  const learning=UC.filter(u=>st[u.k].s>=1&&st[u.k].s<5).length, fresh=UC.filter(u=>!st[u.k].s);
  fresh.slice(0,items.length>=UC_DAY?0:learning<=1?2:learning<=3?1:0).forEach(u=>items.push({k:u.k,step:1}));
  if(!items.length)UC.filter(u=>st[u.k].s>=5).sort((a,b)=>(st[a.k].due||"")<(st[b.k].due||"")?-1:1).slice(0,3).forEach(u=>items.push({k:u.k,step:4}));
  MB().log["uc:"+t]={n:0,r:0,done:false,items,u:Date.now()}; Store.save(); return items;
}
function ucStatus(t=today()){
  const L=ucLog(t), n=L&&L.items?L.items.length:0, d=L&&L.fin?L.fin.length:0;
  return {done:!!(L&&L.done),p:n?Math.min(1,d/n):0,sub:L&&L.done?`All ${n} done · ${L.r}/${L.n} right first time`:n?`${d} of ${n} unit facts`:"km, m, cm, mm · kg, g · l, ml · cm³",acc:L&&L.n?{r:L.r,n:L.n}:null};
}

/* ---------- the session ---------- */
let UV=null;
function ucEl(){
  let el=document.getElementById("ucOv"); if(el)return el;
  el=document.createElement("section"); el.id="ucOv"; el.className="fl-ov"; el.hidden=true; el.setAttribute("aria-label","Units");
  el.innerHTML=`<div class="s-top"><button class="icon-btn" id="ucClose" aria-label="Close">${ic("x")}</button><span class="s-label">Units · 单位换算</span><span class="muted small" id="ucProg" style="margin-left:auto"></span></div><div class="s-body" id="ucBody"></div>`;
  document.body.appendChild(el); el.querySelector("#ucClose").onclick=closeUnits; return el;
}
function openUnits(){
  const items=ucToday(), L=ucLog(), fin=new Set(L.fin||[]);
  window.__busy=true; ucEl().hidden=false; document.body.style.overflow="hidden";
  UV={q:items.filter(x=>!fin.has(x.k)).map(x=>({...x})),i:0,total:items.length,first:{},sub:0};
  if(!UV.q.length)return ucEnd(); ucShow();
}
function closeUnits(){window.__busy=false;ucEl().hidden=true;document.body.style.overflow="";UV=null;Store.save();if(typeof render==="function")render();}
const UC_STEP={1:["Learn","看懂"],2:["Choose","选一选"],3:["Drag","拖一拖"],4:["Practise","练熟"]};
const ucHead=(u,step)=>`<div class="fl-steps">${[1,2,3,4].map(s=>`<span class="${s===step?"on":s<step?"done":""}"><b>${s}</b>${UC_STEP[s][0]}<small>${UC_STEP[s][1]}</small></span>`).join("")}</div>
  <div class="uc-fact" style="--mc:${UC_KC[u.kind]}"><small>${u.kind} · ${u.bn} and ${u.sn}</small>${step===1?`<span>${esc(ucFact(u))}</span>`:""}</div>`;
function ucShow(){
  const it=UV.q[UV.i]; if(!it)return ucEnd();
  const u=UC_BY[it.k], body=$("#ucBody"); body.scrollTop=0;
  $("#ucProg").textContent=`${Math.min(UV.total,(ucLog().fin||[]).length+1)} / ${UV.total}`;
  ({1:ucLearn,2:ucChoose,3:ucDrag,4:ucPractise})[it.step](u,it,body);
  if(typeof zhFill==="function")zhFill(body);
}
function ucResult(it,ok){
  const t=today(), st=ucSt(it.k), L=MB().log["uc:"+t];
  if(!(it.k in UV.first)){UV.first[it.k]=ok;L.n=(L.n||0)+1;if(ok)L.r=(L.r||0)+1;
    const n=(st.n||0)+1,r=(st.r||0)+(ok?1:0);
    if(ok){if(st.s>=5||it.step>=4){const box=Math.min(UC_GAP.length-1,st.s>=5?(st.box||0)+1:0);ucSet(it.k,{s:5,box,due:addDays(t,UC_GAP[box]),n,r});}else ucSet(it.k,{s:it.step+1,due:addDays(t,1),n,r});}
    else{ucSet(it.k,{s:Math.max(1,Math.min(st.s||1,it.step)-(it.step>=3?1:0)),box:0,due:addDays(t,1),n,r,wr:(st.wr||0)+1});
      const H=MB().hist[t]=MB().hist[t]||[]; if(H.length<400)H.push({q:`Units (${UC_STEP[it.step][0]}): ${it.qq||ucFact(UC_BY[it.k])}`,a:it.aa||ucFact(UC_BY[it.k]),v:String(it.given||"").slice(0,40),ok:false,t:"Units",w:UC_BY[it.k].why});}}
  L.u=Date.now();
  if(ok){L.fin=[...new Set([...(L.fin||[]),it.k])];if(L.fin.length>=(L.items||[]).length)L.done=true;}
  else{L.fin=[...new Set([...(L.fin||[]),it.k])];if(L.fin.length>=(L.items||[]).length)L.done=true;} // not repeated today: back tomorrow
  Store.save();
}
function ucNext(){UV.i++;UV.sub=0;UV.bad=false;ucShow();}
function ucEnd(){
  const L=ucLog(), n=(L.items||[]).length, k=L.n?Math.round(L.r/L.n*3):3;
  $("#ucProg").textContent="";
  $("#ucBody").innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(k)}${"☆".repeat(3-k)}</div><h2>${n} unit fact${n===1?"":"s"} done today</h2>
    <p class="muted">${L.n?`${L.r} of ${L.n} right first time. `:""}Each one comes back on the right day until you know it without thinking. 每个换算都会按时复习，直到脱口而出。</p>
    <div class="fl-ladder">${UC.map(u=>{const s=ucSt(u.k).s||0;return `<span class="${s>=5?"ok":s?"mid":""}">${esc(ucFact(u))}<small>${s>=5?"✓":s?`${s-1}/4`:"–"}</small></span>`;}).join("")}</div>
    <button class="btn primary big" id="ucDone">Done</button></div>`;
  $("#ucDone").onclick=closeUnits; if(typeof beep==="function")beep(true,true);
}
const ucNextBtn=(l="Next")=>`<button class="btn primary big" id="ucNext">${l}</button>`;
const ucOpts=(right,wrong)=>shuffle([right,...[...new Set(wrong.map(String))].filter(x=>x!==String(right))].slice(0,4));
const ucWrongNums=u=>[1,10,100,1000,10000,1000000].filter(x=>x!==u.f).map(ucN);

/* 1 · Learn */
function ucLearn(u,it,body){
  const e1=ucQ(u,"down"), e2=ucQ(u,"up");
  if(UV.sub===0){
    body.innerHTML=`<div class="m-q fl-q">${ucHead(u,1)}
      <ol class="fl-how"><li>${esc(u.why)}</li>
        ${u.f===1?`<li>They are the same amount, so the number does not change.</li>`:`<li><b>Big unit → small unit: × ${ucN(u.f)}</b> (more of the small ones). 大单位换小单位：乘 ${ucN(u.f)}。</li><li><b>Small unit → big unit: ÷ ${ucN(u.f)}</b> (fewer of the big ones). 小单位换大单位：除以 ${ucN(u.f)}。</li>`}</ol>
      <div class="fl-ex"><b>Examples 例子</b>${[e1,e2].map(e=>`<div><b>${esc(e.q.replace("?",ucN(e.to)))}</b><div class="small muted">${e.steps.slice(1).map(esc).join(" ")}</div></div>`).join("")}</div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" id="ucRead">${ic("speaker")}Read it to me</button>${ucNextBtn("I understand · 我看懂了")}</div></div>`;
    $("#ucRead").onclick=()=>typeof say==="function"&&say(`One ${u.bn} is ${ucN(u.f)} ${u.sn}s. ${u.why}`);
    $("#ucNext").onclick=()=>{UV.sub=1;ucShow();};return;
  }
  const opts=ucOpts(ucN(u.f),ucWrongNums(u));
  body.innerHTML=`<div class="m-q fl-q">${ucHead(u,1)}<div class="m-text">1 ${esc(u.big)} = ? ${esc(u.small)}</div>
    <div class="notice">👉 This time the answer is shown: tap the glowing one and remember it. 这次告诉你答案：点亮着的那个，记住它。</div>
    <div class="m-opts">${opts.map(o=>`<button class="opt-btn m-opt ${o===ucN(u.f)?"fl-glow":""}" ${o===ucN(u.f)?"":"disabled"}>${esc(o)} ${esc(u.small)}</button>`).join("")}</div><div id="ucFb"></div></div>`;
  body.querySelector(".fl-glow").onclick=e=>{e.currentTarget.classList.add("right");body.querySelectorAll(".m-opt").forEach(b=>b.disabled=true);
    $("#ucFb").innerHTML=`<div class="mfb ok">${ic("check")}<div><b>${esc(ucFact(u))}</b></div></div>${ucNextBtn()}`;if(typeof beep==="function")beep(true);ucResult(it,true);$("#ucNext").onclick=ucNext;};
}
/* 2 · Choose: the fact, then a conversion */
function ucChoose(u,it,body){
  let Q;
  if(UV.sub===0)Q={q:`1 ${u.big} = ? ${u.small}`,opts:ucOpts(ucN(u.f),ucWrongNums(u)).map(o=>o),ans:ucN(u.f),unit:u.small,steps:[u.why]};
  else{const c=ucQ(u,Math.random()<.5?"down":"up"), w=[c.to*10,c.to/10,c.to*100,c.to/100,c.from].map(ucN);Q={q:c.q,opts:ucOpts(ucN(c.to),w),ans:ucN(c.to),unit:c.b,steps:c.steps};}
  body.innerHTML=`<div class="m-q fl-q">${ucHead(u,2)}<div class="m-text">${esc(Q.q)} <span class="muted small">(${UV.sub+1} of 2)</span></div>
    <div class="m-opts">${Q.opts.map((o,i)=>`<button class="opt-btn m-opt" data-o="${i}">${esc(o)} ${esc(Q.unit)}</button>`).join("")}</div><div id="ucFb"></div></div>`;
  body.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const v=Q.opts[+b.dataset.o],ok=v===Q.ans;
    body.querySelectorAll("[data-o]").forEach(x=>{x.disabled=true;if(Q.opts[+x.dataset.o]===Q.ans)x.classList.add("right");}); if(!ok)b.classList.add("wrong"); if(typeof beep==="function")beep(ok);
    $("#ucFb").innerHTML=`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Correct!":"Not this time."} ${esc(Q.q.replace("?",Q.ans))}</b><span>${Q.steps.map(esc).join(" ")}</span></div></div>${ucNextBtn()}`;
    if(!ok){UV.bad=true;it.given=v;it.qq=Q.q;it.aa=Q.ans;}
    $("#ucNext").onclick=()=>{if(UV.sub===0&&ok){UV.sub=1;ucShow();return;}ucResult(it,ok&&!UV.bad);ucNext();};});
}
/* 3 · Drag: the rule and the answer, from tiles */
function ucDrag(u,it,body){
  if(!UV.d){const c=ucQ(u,Math.random()<.5?"down":"up");
    const want=u.f===1?["=",ucN(c.to)]:[c.op,ucN(u.f),ucN(c.to)];
    const extra=u.f===1?["×","÷",ucN(c.to*10)]:[c.op==="×"?"÷":"×",...[10,100,1000].map(ucN).filter(x=>x!==ucN(u.f)).slice(0,2),ucN(c.op==="×"?c.from/u.f:c.from*u.f)];
    UV.d={c,want,tiles:shuffle([...want,...extra.filter(x=>!want.includes(x))].map((t,i)=>({t,i}))),put:want.map(()=>null),tries:0,mark:null,over:false};}
  const D=UV.d, c=D.c, full=()=>D.put.every(Boolean);
  const slot=j=>{const p=D.put[j];return `<button class="fl-slot uc-slot ${p?"full":""} ${D.mark?(D.mark[j]?"good":"bad"):""}" data-slot="${j}">${p?esc(p.t):"?"}</button>`;};
  const draw=()=>{const used=new Set(D.put.filter(Boolean).map(p=>p.i));
    body.innerHTML=`<div class="m-q fl-q">${ucHead(u,3)}
      <div class="m-text">${esc(c.q)}</div>
      <div class="uc-sentence">${u.f===1?`${esc(ucN(c.from))} ${esc(c.a)} ${slot(0)} ${slot(1)} ${esc(c.b)}`:`<span>${esc(ucN(c.from))} ${esc(c.a)}</span> ${slot(0)} ${slot(1)} = ${slot(2)} <span>${esc(c.b)}</span>`}</div>
      <div class="muted tiny" style="text-align:center">${u.f===1?"Drag the tiles into the gaps.":`First the rule (× or ÷, and by how much), then the answer.`} 把方块拖进空格（或点一下）。点格子可以拿回来。</div>
      <div class="fl-tiles">${D.tiles.map(x=>`<button class="fl-tile" data-tile="${x.i}" ${used.has(x.i)||D.over?"disabled":""}>${esc(x.t)}</button>`).join("")}</div>
      <div id="ucFb">${D.msg||""}${full()&&!D.over?`<button class="btn primary big" id="ucCheck">${ic("check")}Check 检查</button>`:""}</div></div>`;
    body.querySelectorAll("[data-tile]").forEach(b=>{const i=+b.dataset.tile;let y0=null;
      b.onpointerdown=e=>{y0=e.clientY;try{b.setPointerCapture(e.pointerId);}catch(_){}};
      b.onpointermove=e=>{if(y0!=null)b.style.transform=`translateY(${Math.min(0,e.clientY-y0)}px)`;};
      b.onpointerup=()=>{y0=null;b.style.transform="";const j=D.put.indexOf(null);if(D.over||j<0)return;D.put[j]=D.tiles.find(x=>x.i===i);D.mark=null;D.msg="";draw();};
      b.onpointercancel=()=>{y0=null;b.style.transform="";};});
    body.querySelectorAll("[data-slot]").forEach(s=>s.onclick=()=>{const j=+s.dataset.slot;if(D.over||!D.put[j])return;D.put[j]=null;D.mark=null;D.msg="";draw();});
    const ck=$("#ucCheck"); if(ck)ck.onclick=()=>{D.tries++;D.mark=D.want.map((w,j)=>D.put[j].t===w);const ok=D.mark.every(Boolean);if(typeof beep==="function")beep(ok);
      if(ok||D.tries>=2){D.over=true;D.msg="";draw();
        $("#ucFb").innerHTML=`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${esc(c.q.replace("?",ucN(c.to)))}</b><span>${c.steps.map(esc).join(" ")}</span></div></div>${ucNextBtn()}`;
        it.given=D.put.map(p=>p.t).join(" ");it.qq=c.q;it.aa=ucN(c.to);const first=ok&&D.tries===1;
        $("#ucNext").onclick=()=>{UV.d=null;ucResult(it,first);ucNext();};}
      else{const m=D.mark;D.put=D.put.map((p,j)=>m[j]?p:null);D.msg=`<div class="notice warn">The red gaps were wrong. Think: bigger unit → smaller unit is ×, smaller → bigger is ÷. 红色的错了：大换小用乘，小换大用除。</div>`;draw();}};
  };
  draw();
}
/* 4 · Practise: 4 typed conversions, both ways; 3 right passes */
function ucPractise(u,it,body){
  if(!UV.p)UV.p={qs:[ucQ(u,"down"),ucQ(u,"up"),ucQ(u,"down"),ucQ(u,"up")],i:0,r:0,wrong:[]};
  const P=UV.p, c=P.qs[P.i];
  if(!c){const ok=P.r>=3;
    body.innerHTML=`<div class="m-q fl-q">${ucHead(u,4)}<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${P.r} of 4 right${ok?" · well done!":""}</b><span>${ok?esc(ucFact(u)):`Remember: ${esc(ucFact(u))}. Big → small ×, small → big ÷. It comes back at the end. 最后还会再练一次。`}</span></div></div>${ucNextBtn()}</div>`;
    $("#ucNext").onclick=()=>{UV.p=null;it.given=P.wrong.join("; ");it.qq=P.wrong.length?P.wrong[0]:"";ucResult(it,ok);ucNext();};return;}
  body.innerHTML=`<div class="m-q fl-q">${ucHead(u,4)}<div class="m-text">${esc(c.q)} <span class="muted small">(${P.i+1} of 4)</span></div>
    <div class="row uc-ans"><input id="ucIn" class="plain" inputmode="decimal" autocomplete="off" placeholder="?"><b>${esc(c.b)}</b></div>
    <div id="ucFb"><button class="btn primary big" id="ucCheck">${ic("check")}Check 检查</button></div></div>`;
  const inp=$("#ucIn"); inp.focus();
  const check=()=>{const v=parseFloat(String(inp.value).replace(/,/g,"").trim()); if(isNaN(v)){toast("Type a number.");return;}
    const ok=Math.abs(v-c.to)<1e-9*Math.max(1,c.to); if(ok)P.r++; else P.wrong.push(`${c.q} → ${inp.value} (${ucN(c.to)})`); inp.disabled=true; if(typeof beep==="function")beep(ok);
    $("#ucFb").innerHTML=`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Correct!":"Not quite."} ${esc(c.q.replace("?",ucN(c.to)))}</b><span>${c.steps.map(esc).join(" ")}</span></div></div>${ucNextBtn()}`;
    $("#ucNext").onclick=()=>{P.i++;ucShow();};};
  $("#ucCheck").onclick=check; inp.onkeydown=e=>{if(e.key==="Enter")check();};
}

/* ---------- the parent page ---------- */
function ucParent(){
  const t=today(), logs=[...Array(7)].map((_,k)=>addDays(t,-k)).map(d=>[d,MB().log["uc:"+d]]).filter(([,l])=>l&&l.n);
  return `<div class="card stack no-zh fl-par"><h3 style="margin:0">${ic("maths")} 单位换算 · Units</h3>
    <div class="muted small">每个换算分四步：1 看懂 → 2 选择题 → 3 拖拽（先拖规则 ×/÷ 和倍数，再拖答案）→ 4 自己输入 4 题（对 3 题才算过），之后按 1、3、7、14、30 天间隔复习。做错会退回一步。</div>
    <table class="plan-table"><thead><tr><th>换算</th><th>进度</th><th>对/做</th><th>下次</th></tr></thead><tbody>${UC.map(u=>{const s=ucSt(u.k);
      return `<tr><td><b>${esc(ucFact(u))}</b><small>${esc(u.kind)}</small></td><td>${s.s>=5?`✓ 已掌握（复习第 ${(s.box||0)+1} 轮）`:s.s?`第 ${s.s} 步：${UC_STEP[s.s][1]}`:"还没开始"}${s.wr?`<small>错过 ${s.wr} 次</small>`:""}</td><td>${s.n?`${s.r}/${s.n}`:"–"}</td><td>${s.due?esc(shortDate(s.due)):"–"}</td></tr>`;}).join("")}</tbody></table>
    ${logs.length?`<div class="small">最近：${logs.map(([d,l])=>`${esc(shortDate(d))} ${l.r}/${l.n}${l.done?" ✓":""}`).join("，")}</div>`:""}
  </div>`;
}
