/* ================= 公式四步 · Formulas in 4 steps: perimeter, area and volume, learned for good =================
   Shared by both study sites (the same file in each repo; it uses the formulas and pictures in shapes.js).
   Every formula goes up a ladder, one step a day:
     1 Learn  (看): picture, the formula, how it is worked out step by step, an example; then a question where the
                    right answer is shown ("this one"), so the first time is always right.
     2 Choose (选): two multiple-choice questions on her own (which formula; which shape uses it).
     3 Build  (拼): put the formula together from tiles at the bottom (tap or drag them up), e.g. A = π r ².
     4 Write  (写): write the formula by hand. Google AI reads the handwriting (with a key); otherwise she checks
                    it against the answer herself.
   After step 4 the formula is reviewed at growing gaps (1, 3, 7, 14, 30 days: spaced practice), alternating
   building and writing. A mistake: the answer and the working are shown at once, the question comes back at the
   end of the session until it is right (retrieval practice), and the formula goes one step back for the next day.
   One new formula a day, only while no more than 3 are still being learned.
   Saved (synced): book.maths.q["fl:<formula>"] = {s: next step 1–5, box, due, n, r, wr, u}; book.maths.log["fl:<date>"] = {n, r, done, u}. */
const FL_ORDER=typeof PAPER_TYPES!=="undefined"
  ?["rect-p","rect-a","sq-a","tri-a","circ-c","circ-a","par-a","trap-a","cuboid-v","cube-v","prism-v","cyl-v","cube-sa","cuboid-sa","cyl-sa","sq-p","tri-p"]
  :["rect-p","sq-p","rect-a","sq-a","tri-p","cuboid-v","cube-v","tri-a","circ-c","circ-a"]; // Year 5: the circle comes last, as a challenge
const FL_GAP=[1,3,7,14,30], FL_DAY=6;
const flKeys=()=>FL_ORDER.filter(k=>typeof FM_BY!=="undefined"&&FM_BY[k]);
const flSt=k=>(MB().q["fl:"+k])||{s:0};
const flSet=(k,v)=>{MB().q["fl:"+k]={...flSt(k),...v,u:Date.now()};};
const flF=k=>{const F=FM_BY[k];return k==="circ-c"?{...F,f:"C = 2πr"}:F;};
const flWhat=F=>`the ${fmMeasure(F)} of a${/^[aeiou]/i.test(F.name)?"n":""} ${F.name.toLowerCase().replace(/ \(.*\)/,"")}`;
const flLog=(t=today())=>MB().log["fl:"+t]||null;

/* today's list: reviews that are due and formulas half way up the ladder, then one new formula */
function flToday(t=today()){
  const L=flLog(t); if(L&&L.items)return L.items;
  const ks=flKeys(), st=Object.fromEntries(ks.map(k=>[k,flSt(k)]));
  const due=ks.filter(k=>st[k].s>=2&&(st[k].due||"")<=t).sort((a,b)=>(st[a].s-st[b].s)||((st[a].due||"")<(st[b].due||"")?-1:1));
  const items=due.slice(0,FL_DAY).map(k=>({k,step:st[k].s>=5?((st[k].box||0)%2?4:3):st[k].s}));
  const learning=ks.filter(k=>st[k].s>=1&&st[k].s<5).length, fresh=ks.filter(k=>!st[k].s);
  const nNew=items.length>=FL_DAY?0:learning<=1?2:learning<=3?1:0;
  fresh.slice(0,nNew).forEach(k=>items.push({k,step:1}));
  if(!items.length){const old=ks.filter(k=>st[k].s>=5).sort((a,b)=>(st[a].due||"")<(st[b].due||"")?-1:1).slice(0,3);old.forEach(k=>items.push({k,step:3+(Math.random()<.5?1:0)}));} // all learned: a short extra review
  MB().log["fl:"+t]={n:0,r:0,done:false,items,u:Date.now()}; Store.save();
  return items;
}
function flStatus(t=today()){
  const L=flLog(t), items=L&&L.items?L.items:null, n=items?items.length:0, d=L&&L.fin?L.fin.length:0;
  return {done:!!(L&&L.done),p:n?Math.min(1,d/n):0,sub:L&&L.done?`All ${n} done · ${L.r}/${L.n} right first time`:n?`${d} of ${n} formulas`:"Perimeter, area and volume formulas",acc:L&&L.n?{r:L.r,n:L.n}:null};
}

/* ---------- the session ---------- */
let FL=null;
function flEl(){
  let el=document.getElementById("flOv"); if(el)return el;
  el=document.createElement("section"); el.id="flOv"; el.hidden=true; el.setAttribute("aria-label","Formulas");
  el.innerHTML=`<div class="s-top"><button class="icon-btn" id="flClose" aria-label="Close">${ic("x")}</button><span class="s-label">Formulas · 公式四步</span><span class="muted small" id="flProg" style="margin-left:auto"></span></div><div class="s-body" id="flBody"></div>`;
  document.body.appendChild(el); el.querySelector("#flClose").onclick=closeFormulas; return el;
}
function openFormulas(){
  if(typeof FM_BY==="undefined"){toast("Formulas are not available.");return;}
  const items=flToday(), L=flLog(), fin=new Set(L.fin||[]);
  const q=items.filter(x=>!fin.has(x.k)).map(x=>({...x}));
  window.__busy=true; flEl().hidden=false; document.body.style.overflow="hidden";
  FL={q,i:0,total:items.length,first:{},sub:0};
  if(!q.length)return flEnd();
  flShow();
}
function closeFormulas(){window.__busy=false;flEl().hidden=true;document.body.style.overflow="";FL=null;Store.save();if(typeof render==="function")render();}
const STEP_NAME={1:["Learn","看懂"],2:["Choose","选一选"],3:["Build","拼公式"],4:["Write","写公式"]};
function flHead(F,step){
  return `<div class="fl-steps">${[1,2,3,4].map(s=>`<span class="${s===step?"on":s<step?"done":""}"><b>${s}</b>${STEP_NAME[s][0]}<small>${STEP_NAME[s][1]}</small></span>`).join("")}</div>
    <div class="fl-pic" style="--mc:${FM_M[F.m]}">${shapeSVG(F.sh,F.lab)}</div>`;
}
function flShow(){
  const it=FL.q[FL.i]; if(!it)return flEnd();
  const F=flF(it.k), body=$("#flBody"); body.scrollTop=0;
  $("#flProg").textContent=`${Math.min(FL.total,(flLog().fin||[]).length+1)} / ${FL.total}`;
  ({1:flLearn,2:flChoose,3:flBuild,4:flWrite})[it.step](F,it,body);
  if(typeof zhFill==="function")zhFill(body);
}
/* the result of one step for one formula */
function flResult(it,ok){
  const t=today(), st=flSt(it.k), L=MB().log["fl:"+t];
  if(!(it.k in FL.first)){FL.first[it.k]=ok;L.n=(L.n||0)+1;if(ok)L.r=(L.r||0)+1;
    const n=(st.n||0)+1,r=(st.r||0)+(ok?1:0);
    if(ok){ if(st.s>=5||it.step>=4){const box=Math.min(FL_GAP.length-1,st.s>=5?(st.box||0)+1:0);flSet(it.k,{s:5,box,due:addDays(t,FL_GAP[box]),n,r});}
            else flSet(it.k,{s:it.step+1,due:addDays(t,1),n,r}); }
    else{ flSet(it.k,{s:Math.max(1,Math.min(st.s||1,it.step)-(it.step>=3?1:0)),box:0,due:addDays(t,1),n,r,wr:(st.wr||0)+1});
      const H=MB().hist[t]=MB().hist[t]||[]; if(H.length<400)H.push({q:`Formula (${STEP_NAME[it.step][0]}): ${flWhat(flF(it.k))}`,a:flF(it.k).f,v:String(it.given||"").slice(0,40),ok:false,t:"Formulas",w:`${flF(it.k).f} (${flF(it.k).vars})`});}
  }
  L.u=Date.now();
  if(ok){L.fin=[...new Set([...(L.fin||[]),it.k])];if(L.fin.length>=(L.items||[]).length)L.done=true;}
  else FL.q.push({...it,again:true}); // it comes back at the end until it is right
  Store.save();
}
function flNext(){FL.i++;FL.sub=0;flShow();}
function flEnd(){
  const L=flLog(), n=(L.items||[]).length;
  $("#flProg").textContent="";
  $("#flBody").innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(L.n?Math.round(L.r/L.n*3):3)}${"☆".repeat(3-(L.n?Math.round(L.r/L.n*3):3))}</div>
    <h2>${n} formula${n===1?"":"s"} done today</h2><p class="muted">${L.n?`${L.r} of ${L.n} right first time. `:""}Each formula comes back on the right day so you never forget it. 每个公式会按时复习，记得牢牢的。</p>
    <div class="fl-ladder">${flKeys().map(k=>{const s=flSt(k).s||0;return `<span class="${s>=5?"ok":s?"mid":""}" title="${esc(FM_BY[k].f)}">${esc(FM_BY[k].name.replace(/ \(.*\)/,""))} ${esc(FM_BY[k].m==="Perimeter"&&k!=="circ-c"?"P":FM_BY[k].m==="Area"?"A":FM_BY[k].m==="Volume"?"V":k==="circ-c"?"C":"SA")}<small>${s>=5?"✓":s?`${s-1}/4`:"–"}</small></span>`;}).join("")}</div>
    <button class="btn primary big" id="flDone">Done</button></div>`;
  $("#flDone").onclick=closeFormulas; if(typeof beep==="function")beep(true,true);
}
const flSay=t=>{if(typeof say==="function")say(t);};
const flBtnNext=(lab="Next")=>`<button class="btn primary big" id="flNext">${lab}</button>`;

/* 1 · Learn */
function flLearn(F,it,body){
  const C=F.calc(), opts=shuffle([F.f,...shuffle(F.wrong).slice(0,3)]);
  if(FL.sub===0){
    body.innerHTML=`<div class="m-q fl-q">${flHead(F,1)}
      <div class="fl-formula" style="--mc:${FM_M[F.m]}"><small>${esc(F.m)} · ${esc(F.name)}</small><span>${esc(F.f)}</span><small>${esc(F.vars)}</small></div>
      <ol class="fl-how">${F.frames.map(fr=>`<li>${esc(fr[1])}</li>`).join("")}</ol>
      <div class="fl-ex"><b>Example 例子</b><div class="fl-pic sm" style="--mc:${FM_M[F.m]}">${shapeSVG(F.sh,C.lab)}</div>
        <ol><li>Write the formula: <b>${esc(F.f)}</b></li><li>Put the numbers in: ${esc(C.sub)}</li>${C.work.map(w=>`<li>${esc(w)}</li>`).join("")}<li><b>${esc(F.name.replace(/ \(.*\)/,""))} ${esc(fmMeasure(F))} = ${fmN(C.a)} ${fmUnit(F)}</b></li></ol></div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" id="flRead">${ic("speaker")}Read it to me</button>${flBtnNext("I understand · 我看懂了")}</div></div>`;
    $("#flRead").onclick=()=>flSay(`${F.m} of a ${F.name}. ${F.f.replace(/π/g,"pi").replace(/²/g," squared").replace(/³/g," cubed").replace(/½/g,"half")}. ${F.frames.map(f=>f[1]).join(" ")}`);
    $("#flNext").onclick=()=>{FL.sub=1;flShow();};
    return;
  }
  /* the guided question: the right answer is shown, she taps it */
  body.innerHTML=`<div class="m-q fl-q">${flHead(F,1)}
    <div class="m-text">Which formula gives ${esc(flWhat(F))}?</div>
    <div class="notice">👉 This time the answer is shown: tap the glowing one and remember it. 这次告诉你答案：点亮着的那个，记住它。</div>
    <div class="m-opts">${opts.map((o,i)=>`<button class="opt-btn m-opt ${o===F.f?"fl-glow":""}" data-o="${i}" ${o===F.f?"":"disabled"}>${esc(o)}</button>`).join("")}</div><div id="flFb"></div></div>`;
  body.querySelector(".fl-glow").onclick=()=>{
    body.querySelectorAll("[data-o]").forEach(b=>b.disabled=true); body.querySelector(".fl-glow").classList.add("right");
    $("#flFb").innerHTML=`<div class="mfb ok">${ic("check")}<div><b>${esc(F.f)}</b><span>${esc(F.vars)}</span></div></div>${flBtnNext()}`;
    if(typeof beep==="function")beep(true); flResult(it,true); $("#flNext").onclick=flNext;};
}
/* 2 · Choose: which formula, then which shape */
function flChoose(F,it,body){
  const others=shuffle(flKeys().filter(k=>FM_BY[k].sh!==F.sh).map(k=>FM_BY[k].sh).filter((s,i,a)=>a.indexOf(s)===i)).slice(0,3);
  const Q=FL.sub===0?{q:`Which formula gives ${flWhat(F)}?`,opts:shuffle([F.f,...shuffle(F.wrong).slice(0,3)]),ans:F.f,pic:true}
    :{q:`For which shape do you use ${F.f} to find the ${fmMeasure(F)}?`,shapes:shuffle([F.sh,...others]),ans:F.sh};
  const opts=Q.opts||Q.shapes;
  body.innerHTML=`<div class="m-q fl-q">${Q.pic?flHead(F,2):flHead(F,2).replace(/<div class="fl-pic"[\s\S]*$/,"")}
    <div class="m-text">${esc(Q.q)} <span class="muted small">(${FL.sub+1} of 2)</span></div>
    <div class="${Q.shapes?"fl-shapes":"m-opts"}">${opts.map((o,i)=>`<button class="${Q.shapes?"fl-shape":"opt-btn m-opt"}" data-o="${i}">${Q.shapes?`<b>${"ABCD"[i]}</b>${shapeSVG(o,{})}`:esc(o)}</button>`).join("")}</div><div id="flFb"></div></div>`;
  body.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{
    const v=opts[+b.dataset.o], ok=v===Q.ans; body.querySelectorAll("[data-o]").forEach(x=>{x.disabled=true;if(opts[+x.dataset.o]===Q.ans)x.classList.add("right");});
    if(!ok)b.classList.add("wrong"); if(typeof beep==="function")beep(ok);
    $("#flFb").innerHTML=`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Correct!":"Not this time."} ${esc(F.f)}</b><span>${esc(F.name)}: ${esc(F.vars)}. ${esc(F.frames[F.frames.length-1][1])}</span></div></div>${flBtnNext()}`;
    if(!ok){it.given=Q.shapes?"shape":v;FL.bad=true;}
    $("#flNext").onclick=()=>{if(FL.sub===0&&ok){FL.sub=1;flShow();return;}flResult(it,ok&&!FL.bad);FL.bad=false;flNext();};});
}
/* 3 · Build: tiles from the bottom go up into the boxes */
const flTok=f=>f.match(/SA|area of cross-section|length|[A-Za-z]|\d+|½|π|²|³|[()+×=−]/g)||[];
function flBuild(F,it,body){
  const want=flTok(F.f), pool=new Set(want), extra=shuffle([...new Set(F.wrong.flatMap(flTok))].filter(x=>!pool.has(x))).slice(0,3);
  if(!FL.tiles){FL.tiles=shuffle([...want,...extra].map((t,i)=>({t,i})));FL.put=want.map(()=>null);FL.tries=0;FL.mark=null;FL.over=false;}
  const full=()=>FL.put.every(Boolean);
  const draw=()=>{
    const used=new Set(FL.put.filter(Boolean).map(p=>p.i));
    body.innerHTML=`<div class="m-q fl-q">${flHead(F,3)}
      <div class="m-text">Build the formula for <b>${esc(flWhat(F))}</b>. 用下面的方块拼出公式。</div>
      <div class="fl-slots">${want.map((_,j)=>{const p=FL.put[j];return `<button class="fl-slot ${p?"full":""} ${FL.mark?(FL.mark[j]?"good":"bad"):""}" data-slot="${j}">${p?esc(p.t):""}</button>`;}).join("")}</div>
      <div class="muted tiny" style="text-align:center">Tap a tile or drag it up into the boxes. Tap a box to take a tile back. 点方块或往上拖；点上面的格子可以拿回来。</div>
      <div class="fl-tiles">${FL.tiles.map(x=>`<button class="fl-tile" data-tile="${x.i}" ${used.has(x.i)||FL.over?"disabled":""}>${esc(x.t)}</button>`).join("")}</div>
      <div id="flFb">${FL.msg||""}${full()&&!FL.over?`<button class="btn primary big" id="flCheck">${ic("check")}Check 检查</button>`:""}</div></div>`;
    body.querySelectorAll("[data-tile]").forEach(b=>{const i=+b.dataset.tile;let y0=null;
      b.onpointerdown=e=>{y0=e.clientY;try{b.setPointerCapture(e.pointerId);}catch(_){}};
      b.onpointermove=e=>{if(y0!=null)b.style.transform=`translateY(${Math.min(0,e.clientY-y0)}px)`;};
      b.onpointerup=()=>{y0=null;b.style.transform="";const j=FL.put.indexOf(null);if(FL.over||j<0)return;FL.put[j]=FL.tiles.find(x=>x.i===i);FL.mark=null;FL.msg="";draw();};
      b.onpointercancel=()=>{y0=null;b.style.transform="";};});
    body.querySelectorAll("[data-slot]").forEach(s=>s.onclick=()=>{const j=+s.dataset.slot;if(FL.over||!FL.put[j])return;FL.put[j]=null;FL.mark=null;FL.msg="";draw();});
    const ck=$("#flCheck"); if(ck)ck.onclick=()=>{
      FL.tries++; FL.mark=want.map((w,j)=>FL.put[j].t===w); const ok=FL.mark.every(Boolean); if(typeof beep==="function")beep(ok);
      if(ok||FL.tries>=2){FL.over=true;FL.msg="";draw();
        $("#flFb").innerHTML=`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Perfect!":"The formula is:"} ${esc(F.f)}</b><span>${esc(F.vars)}</span></div></div>${flBtnNext()}`;
        it.given=FL.put.map(p=>p.t).join(" "); const first=ok&&FL.tries===1;
        $("#flNext").onclick=()=>{FL.tiles=null;FL.mark=null;FL.over=false;FL.msg="";flResult(it,first);flNext();};
      }else{const m=FL.mark;FL.put=FL.put.map((p,j)=>m[j]?p:null);FL.mark=m.map(x=>x||false);FL.msg=`<div class="notice warn">The red boxes were wrong and are empty again. Fill them and check once more. 红色的格子错了，重新放。</div>`;draw();}
    };
  };
  draw();
}
/* 4 · Write: by hand, read by Google AI (or checked by herself) */
function flWrite(F,it,body){
  body.innerHTML=`<div class="m-q fl-q">${flHead(F,4)}
    <div class="m-text">Write the formula for <b>${esc(flWhat(F))}</b> from memory. 凭记忆把公式写下来。</div>
    <div class="fl-pad" id="flPad"></div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" id="flClear">Clear 擦掉</button><button class="btn primary big" id="flCheck">${ic("check")}Check 检查</button></div>
    <div id="flFb"></div></div>`;
  const box=$("#flPad"), pad=typeof writePad==="function"?writePad(box):null;
  $("#flClear").onclick=()=>pad&&pad.clear();
  const done=ok=>{const first=ok&&!FL.wtry;$("#flFb").innerHTML+=flBtnNext();$("#flNext").onclick=()=>{FL.wtry=0;flResult(it,first);flNext();};};
  const self=()=>{$("#flFb").innerHTML=`<div class="mfb">${ic("doc")}<div><b>The formula: ${esc(F.f)}</b><span>${esc(F.vars)}. Look at yours: is it the same? 和你写的一样吗？</span></div></div>
      <div class="row" style="gap:8px"><button class="btn primary" id="flYes">${ic("check")}Mine is right 写对了</button><button class="btn" id="flNo">${ic("x")}Not quite 不太对</button></div>`;
    $("#flYes").onclick=()=>{$("#flFb").innerHTML=`<div class="mfb ok">${ic("check")}<div><b>${esc(F.f)}</b></div></div>`;if(typeof beep==="function")beep(true);done(true);};
    $("#flNo").onclick=()=>{FL.wtry=(FL.wtry||0)+1;it.given="(self-checked: wrong)";flWrite(F,it,body);$("#flFb").innerHTML=`<div class="notice warn">Look once more: <b>${esc(F.f)}</b>, then write it again. 再看一眼，然后再写一遍。</div>`;};};
  $("#flCheck").onclick=async()=>{
    if(pad&&pad.empty()){toast("Write the formula first.");return;}
    const cv=box.querySelector("canvas");
    if(cv&&typeof aiReady==="function"&&aiReady()){
      $("#flCheck").disabled=true; $("#flFb").innerHTML=`<div class="notice">Google AI is reading your writing… AI 正在看你写的…</div>`;
      try{
        const img=cv.toDataURL("image/png").split(",")[1];
        const r=await aiCall(`You check a child's handwritten maths formula. The correct formula is "${F.f}" (${F.vars}). Read the handwriting in the image. Accept it if it means the same formula: ignore spacing, accept * or x or a dot for ×, accept pi for π, ^2 for ², 1/2 for ½, letters in a different order in a product (l × w = w × l), and with or without the "${F.f.split("=")[0].trim()} =" at the start. Do not accept a different formula, a missing square or cube, or a missing ½ or 2. Reply only with JSON {"read":"what is written","ok":true or false,"tip":"if wrong: what is missing or different, in simple English"}`,`Check this handwriting.`,true,img);
        if(r&&r.ok){$("#flFb").innerHTML=`<div class="mfb ok">${ic("check")}<div><b>Correct! ${esc(F.f)}</b><span>AI read: ${esc(r.read||"")}</span></div></div>`;if(typeof beep==="function")beep(true);done(true);}
        else{FL.wtry=(FL.wtry||0)+1;it.given=r&&r.read||"";if(typeof beep==="function")beep(false);
          $("#flFb").innerHTML=`<div class="mfb bad">${ic("x")}<div><b>Not quite. The formula is ${esc(F.f)}</b><span>AI read: ${esc(r&&r.read||"?")}. ${esc(r&&r.tip||"")}</span></div></div><div class="row" style="gap:8px"><button class="btn primary" id="flAgain">Write it again 再写一遍</button><button class="btn" id="flSelf">AI read it wrong · AI 看错了</button></div>`;
          $("#flAgain").onclick=()=>flWrite(F,it,body); $("#flSelf").onclick=self;}
      }catch(e){self();}
      return;
    }
    self();
  };
}

/* ---------- the parent page: where each formula is ---------- */
function flParent(){
  if(typeof FM_BY==="undefined")return "";
  const t=today(), days=[...Array(7)].map((_,k)=>addDays(t,-k)), logs=days.map(d=>[d,MB().log["fl:"+d]]).filter(([,l])=>l&&l.n);
  return `<div class="card stack no-zh fl-par"><h3 style="margin:0">${ic("layers")} 公式四步 · Formulas</h3>
    <div class="muted small">每个公式分四步学：1 看懂 → 2 选择题 → 3 拼公式 → 4 手写公式，之后按 1、3、7、14、30 天间隔复习。做错会退回一步，第二天再练。</div>
    <table class="plan-table"><thead><tr><th>公式</th><th>进度</th><th>对/做</th><th>下次</th></tr></thead><tbody>${flKeys().map(k=>{const F=FM_BY[k],s=flSt(k);
      return `<tr><td><b>${esc(F.m)}: ${esc(F.name)}</b><small>${esc(flF(k).f)}</small></td><td>${s.s>=5?`✓ 已掌握（复习第 ${(s.box||0)+1} 轮）`:s.s?`第 ${s.s} 步：${STEP_NAME[s.s][1]}`:"还没开始"}${s.wr?`<small>错过 ${s.wr} 次</small>`:""}</td><td>${s.n?`${s.r}/${s.n}`:"–"}</td><td>${s.due?esc(shortDate(s.due)):"–"}</td></tr>`;}).join("")}</tbody></table>
    ${logs.length?`<div class="small">最近：${logs.map(([d,l])=>`${esc(shortDate(d))} ${l.r}/${l.n}${l.done?" ✓":""}`).join("，")}</div>`:""}
  </div>`;
}
