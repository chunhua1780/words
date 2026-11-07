/* ================= Quick facts: + − × ÷ to answer from memory, not on fingers =================
   Each fact (e.g. 7 + 8) has its own record in book.maths.q under an id starting "f:", so it syncs
   and merges like any maths answer: n tries, r right, ok last result, ms last time taken,
   st = quick right answers in a row. A fact is "known" after FACT_KNOWN quick right answers in a row. */
const FACT_KNOWN=3, FACT_SESSION=60;
/* Time settings on this device: the speed goal (default 5 s) and the sprint length (default 2 minutes) */
const fxPref=(k,d)=>{try{const v=+localStorage.getItem("fx-"+k);return v||d;}catch(e){return d;}};
const fxSetPref=(k,v)=>{try{localStorage.setItem("fx-"+k,v);}catch(e){}};
const fxGoal=()=>fxPref("goal",5)*1000, fxMins=()=>fxPref("mins",2);
const fRange=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const fGrid=(lo,hi,ok=()=>true)=>fRange(lo,hi).flatMap(a=>fRange(lo,hi).filter(b=>ok(a,b)).map(b=>[a,b]));
const mkAdd=([a,b])=>({id:`f:+:${a}:${b}`,op:"+",x:a,y:b,q:`${a} + ${b}`,ans:a+b});
const mkSub=([a,b])=>({id:`f:-:${a+b}:${b}`,op:"−",x:a,y:b,q:`${a+b} − ${b}`,ans:a});
const mkMul=([a,b])=>({id:`f:x:${a}:${b}`,op:"×",x:a,y:b,q:`${a} × ${b}`,ans:a*b});
const mkDiv=([a,b])=>({id:`f:/:${a*b}:${b}`,op:"÷",x:a,y:b,q:`${a*b} ÷ ${b}`,ans:a});
const small=(a,b)=>a*b<=20;
const FACT_SETS={
  add:{name:"Adding",sub:"within 20",sym:"+",col:"blue",lo:1,hi:10,facts:fGrid(1,10).map(mkAdd)},
  sub:{name:"Taking away",sub:"within 20",sym:"−",col:"green",lo:1,hi:10,facts:fGrid(1,10).map(mkSub)},
  mul20:{name:"Times",sub:"answers up to 20",sym:"×",col:"orange",lo:1,hi:10,facts:fGrid(1,10,small).map(mkMul)},
  div20:{name:"Sharing",sub:"numbers up to 20",sym:"÷",col:"purple",lo:1,hi:10,facts:fGrid(1,10,small).map(mkDiv)},
  mix20:{name:"All four mixed",sub:"within 20",sym:"±",col:"pink",mix:["add","sub","mul20","div20"]},
  mul10:{name:"Times tables",sub:"up to 10 × 10",sym:"×",col:"orange",lo:1,hi:10,facts:fGrid(1,10).map(mkMul)},
  div10:{name:"Division facts",sub:"up to 10 × 10",sym:"÷",col:"purple",lo:1,hi:10,facts:fGrid(1,10).map(mkDiv)},
  mul12:{name:"Times tables",sub:"up to 12 × 12",sym:"×",col:"orange",lo:2,hi:12,facts:fGrid(2,12).map(mkMul)},
  div12:{name:"Division facts",sub:"up to 12 × 12",sym:"÷",col:"purple",lo:2,hi:12,facts:fGrid(2,12).map(mkDiv)},
};
FACT_SETS.mix20.facts=FACT_SETS.mix20.mix.flatMap(k=>FACT_SETS[k].facts);
FACT_SETS.mul1x={name:"Times tables",sub:"1 to 12",sym:"×",col:"orange",lo:1,hi:12,facts:fGrid(1,12).map(mkMul)};
FACT_SETS.div1x={name:"Division facts",sub:"1 to 12",sym:"÷",col:"purple",lo:1,hi:12,facts:fGrid(1,12).map(mkDiv)};
FACT_SETS.mix12={name:"All four mixed",sub:"+ − within 20, × ÷ to 12 × 12",sym:"±",col:"pink",mix:["add","sub","mul1x","div1x"]};
FACT_SETS.mix12.facts=FACT_SETS.mix12.mix.flatMap(k=>FACT_SETS[k].facts);
const FACT_BY_ID={}; for(const s of Object.values(FACT_SETS))for(const f of s.facts)FACT_BY_ID[f.id]=f;

function factRec(id){return MB().q[id]||null;}
function factState(id){const s=factRec(id);if(!s)return "new";if((s.st||0)>=FACT_KNOWN)return "known";if(s.ok===false)return "missed";return "learning";}
function factStats(key){
  const fs=FACT_SETS[key].facts, c={known:0,learning:0,missed:0,new:0};
  for(const f of fs)c[factState(f.id)]++;
  return {...c,total:fs.length};
}
function recordFact(f,ok,ms){
  const M=MB(), s=M.q[f.id]||{}, t=today(), fast=ok&&ms<=fxGoal();
  M.q[f.id]={n:(s.n||0)+1,r:(s.r||0)+(ok?1:0),ok,ms:Math.round(ms),st:fast?(s.st||0)+1:0,last:t,u:Date.now()};
  return fast;
}

/* ---------- how to work it out without fingers ---------- */
function factTip(f){
  const {op,x,y,ans}=f;
  if(op==="+"){
    const [big,sm]=x>=y?[x,y]:[y,x];
    if(x===y)return `Double: ${x} + ${x} = ${ans}. Learn the doubles by heart.`;
    if(Math.abs(x-y)===1)return `Near double: ${sm} + ${sm} = ${sm*2}, and one more is ${ans}.`;
    if(sm===10||big===10)return `Adding 10: the ones stay the same, so ${ans}.`;
    if(sm===9||big===9){const o=sm===9?big:sm;return `Adding 9: add 10, then take 1. ${o} + 10 = ${o+10}, take 1 = ${ans}.`;}
    if(ans>10){const need=10-big;return `Make 10: ${big} + ${need} = 10, then ${sm-need} more is ${ans}.`;}
    return `Count on from the bigger number: ${big}, then ${sm} more is ${ans}. Better still, remember ${x} + ${y} = ${ans}.`;
  }
  if(op==="−"){const c=x+y;
    if(c>10&&y>c-10)return `Think addition: ${y} + ? = ${c}. Or go back to 10 first: ${c} − ${c-10} = 10, then take ${y-(c-10)} more = ${ans}.`;
    return `Think addition: ${y} + ${ans} = ${c}, so ${c} − ${y} = ${ans}.`;}
  if(op==="×"){
    const t=[x,y].includes(10)?10:[x,y].includes(2)?2:[x,y].includes(5)?5:[x,y].includes(9)?9:[x,y].includes(4)?4:[x,y].includes(11)?11:Math.max(x,y), o=t===x?y:x;
    const tips={1:`Times 1 keeps the number: ${ans}.`,2:`Times 2 is double: double ${o} is ${ans}.`,10:`Times 10: put a 0 on the end: ${ans}.`,
      5:`Times 5 is half of times 10: ${o} × 10 = ${o*10}, half is ${ans}.`,9:`Times 9 is times 10, take one lot: ${o*10} − ${o} = ${ans}.`,
      4:`Times 4 is double, double: ${o} → ${o*2} → ${ans}.`,3:`Times 3 is double and one more lot: ${o*2} + ${o} = ${ans}.`,
      6:`Times 6 is times 5 and one more lot: ${o*5} + ${o} = ${ans}.`,7:`Times 7 is times 5 plus times 2: ${o*5} + ${o*2} = ${ans}.`,
      8:`Times 8 is double, double, double: ${o} → ${o*2} → ${o*4} → ${ans}.`,11:`Times 11 is times 10 and one more lot: ${o*10} + ${o} = ${ans}.`,
      12:`Times 12 is times 10 plus times 2: ${o*10} + ${o*2} = ${ans}.`};
    return (tips[t]||`${x} × ${y} = ${ans}.`)+(x!==y?` ${y} × ${x} is the same.`:"");
  }
  return `Think times: ${y} × ? = ${x*y}. ${y} × ${x} = ${x*y}, so ${x*y} ÷ ${y} = ${ans}.`;
}
const FACT_HOW={
  "+":["Make 10: 8 + 5 → 8 + 2 = 10, then 3 more = 13.","Doubles: 6 + 6 = 12, 7 + 7 = 14. Near doubles: 6 + 7 = 6 + 6 + 1 = 13.","Adding 9: add 10, take 1. 7 + 9 → 17 − 1 = 16.","Start from the bigger number: 2 + 9 is 9 + 2."],
  "−":["Think addition: 13 − 5 → 5 + ? = 13 → 8.","Back to 10: 14 − 6 → 14 − 4 = 10, then take 2 more = 8.","Facts come in families: 6 + 7 = 13, so 13 − 7 = 6 and 13 − 6 = 7."],
  "×":["Times 2 = double. Times 4 = double double. Times 8 = double three times.","Times 5 = half of times 10. Times 9 = times 10, take one lot.","Swap them round: 3 × 7 is the same as 7 × 3. Learn one, get two."],
  "÷":["Division is times backwards: 18 ÷ 3 → 3 × ? = 18 → 6.","Every times fact gives two division facts: 4 × 5 = 20, so 20 ÷ 5 = 4 and 20 ÷ 4 = 5."],
};

/* ---------- choosing questions: missed and slow facts first, new ones next, known ones now and then ---------- */
function factPick(key,k){
  const fs=FACT_SETS[key].facts, st=MB().q;
  const age=f=>st[f.id]?st[f.id].u||0:0;
  const missed=shuffle(fs.filter(f=>factState(f.id)==="missed"));
  const learning=fs.filter(f=>factState(f.id)==="learning").sort((a,b)=>(st[a.id].st||0)-(st[b.id].st||0)||(st[b.id].ms||0)-(st[a.id].ms||0));
  const fresh=shuffle(fs.filter(f=>factState(f.id)==="new"));
  const known=fs.filter(f=>factState(f.id)==="known").sort((a,b)=>age(a)-age(b));
  const out=[...missed.slice(0,6),...learning.slice(0,8)];
  for(const f of fresh){if(out.length>=k-Math.min(4,known.length))break;out.push(f);}
  for(const f of [...learning.slice(8),...known])if(out.length<k&&!out.includes(f))out.push(f);
  while(out.length<k)out.push(fs[Math.floor(Math.random()*fs.length)]);
  return shuffle(out.slice(0,k));
}

/* ---------- screen ---------- */
let FX=null, fxTimer=null;
const fxBestKey=k=>"fx-best-"+k+(fxMins()===1?"":`-${fxMins()}m`);
const fxBest=k=>{try{return +localStorage.getItem(fxBestKey(k))||0;}catch(e){return 0;}};
const fxSetBest=(k,v)=>{try{localStorage.setItem(fxBestKey(k),v);}catch(e){}};
const fxTimeBar=()=>`<div class="fx-times">
  <div><span class="muted small">Speed goal</span><div class="seg">${[3,5,8].map(g=>`<button data-goal="${g}" class="${g*1000===fxGoal()?"on":""}">${g} s</button>`).join("")}</div></div>
  <div><span class="muted small">Sprint</span><div class="seg">${[1,2,3].map(m=>`<button data-mins="${m}" class="${m===fxMins()?"on":""}">${m} min</button>`).join("")}</div></div></div>`;
const fxBindTimes=()=>{
  document.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{fxSetPref("goal",+b.dataset.goal);fxShow(FX.view,FX.key);});
  document.querySelectorAll("[data-mins]").forEach(b=>b.onclick=()=>{fxSetPref("mins",+b.dataset.mins);fxShow(FX.view,FX.key);});
};
function openFacts(view="hub",key){window.__busy=true;$("#facts").hidden=false;document.body.style.overflow="hidden";fxShow(view,key);}
function closeFacts(){clearInterval(fxTimer);FX=null;window.__busy=false;$("#facts").hidden=true;document.body.style.overflow="";Store.save();render();}
if($("#facts")){$("#fxClose").innerHTML=ic("x");$("#fxClose").onclick=closeFacts;
  document.addEventListener("keydown",e=>{if($("#facts").hidden||!FX||!FX.q)return;
    if(/^\d$/.test(e.key))fxKey(e.key);else if(e.key==="Backspace")fxKey("⌫");});}
function fxShow(view,key){
  clearInterval(fxTimer); FX={view,key}; $("#fxBody").scrollTop=0;
  const S=key&&FACT_SETS[key];
  $("#fxLabel").textContent=view==="hub"?"Quick facts":`${S.name} · ${S.sub}`;
  ({hub:fxHub,set:fxSet,run:fxRun,sprint:fxRun})[view](key);
}
const fxBar=st=>{const t=st.total||1;return `<span class="fx-bar"><i class="k" style="width:${st.known/t*100}%"></i><i class="l" style="width:${st.learning/t*100}%"></i><i class="m" style="width:${st.missed/t*100}%"></i></span>`;};
function fxCard(key){
  const S=FACT_SETS[key], st=factStats(key);
  return `<button class="card fx-set t-${S.col}" data-fx="${key}"><span class="fx-sym">${S.sym}</span><span class="stack tight" style="gap:4px;flex:1;min-width:0">
    <b>${S.name} <span class="muted">${S.sub}</span></b>${fxBar(st)}<span class="muted small">${st.known} of ${st.total} known${fxBest(key)?` · sprint best ${fxBest(key)}`:""}</span></span>${ic("chevron")}</button>`;
}
function fxHub(){
  $("#fxBody").innerHTML=`<div class="rn-wrap stack">
    <div class="card fx-intro"><div class="fx-big">⚡</div><div class="stack tight" style="gap:6px">
      <h3 style="margin:0">Answer from memory, not on your fingers</h3>
      <p class="muted" style="margin:0">Type the answer as fast as you can; it checks itself. Within your speed goal gets a ⚡ (start with 5 or 8 seconds, then go faster). Three ⚡ in a row on the same fact and you know it. Facts you miss or answer slowly come back more often.</p>
      ${fxTimeBar()}</div></div>
    <div class="section-title"><h3 style="margin:0">Within 20</h3><span class="muted small">Start here</span></div>
    <div class="fx-sets">${["add","sub","mul20","div20","mix20","mix12"].map(fxCard).join("")}</div>
    <div class="section-title"><h3 style="margin:0">Times tables</h3><span class="muted small">Next step</span></div>
    <div class="fx-sets">${["mul10","div10","mul12","div12"].map(fxCard).join("")}</div>
    <div class="fx-legend muted small"><span><i class="k"></i>Know it</span><span><i class="l"></i>Learning</span><span><i class="m"></i>Missed last time</span><span><i class="n"></i>Not tried</span></div>
  </div>`;
  document.querySelectorAll("#fxBody [data-fx]").forEach(b=>b.onclick=()=>fxShow("set",b.dataset.fx));
  fxBindTimes();
}
function fxSet(key){
  const S=FACT_SETS[key], st=factStats(key), ops=S.mix?[...new Set(S.mix.map(k=>FACT_SETS[k].sym))]:[S.sym];
  const mapFor=k=>{const T=FACT_SETS[k], cell=new Map(T.facts.map(f=>[`${f.x},${f.y}`,f]));
    return `<div class="fx-map-wrap"><div class="muted small">${T.name} ${T.sub}</div><div class="fx-map" style="--n:${T.hi-T.lo+1}">${fRange(T.lo,T.hi).map(a=>fRange(T.lo,T.hi).map(b=>{const f=cell.get(`${a},${b}`);
      return f?`<span class="fx-cell ${factState(f.id)}" title="${f.q} = ${f.ans}">${f.q.replace(/ /g,"")}</span>`:`<span class="fx-cell off"></span>`;}).join("")).join("")}</div></div>`;};
  $("#fxBody").innerHTML=`<div class="rn-wrap stack">
    <button class="btn rn-back" id="fxBack">${ic("back")}All quick facts</button>
    <div class="card stack">
      <div class="row" style="justify-content:space-between;align-items:flex-start;gap:12px"><div class="stack tight" style="gap:4px"><h2 style="margin:0">${S.name} <span class="muted">${S.sub}</span></h2>
        <span class="muted">${st.known} of ${st.total} known · ${st.learning} learning · ${st.missed} missed · ${st.new} not tried</span></div>
        <div class="fx-best"><b>${fxBest(key)||"–"}</b><span class="muted small">sprint best</span></div></div>
      ${fxBar(st)}
      <div class="row"><button class="btn primary big" id="fxGo">${ic("sparkle")}Practise ${FACT_SESSION} facts</button><button class="btn big" id="fxSprint">⏱️ ${fxMins()}-minute sprint</button></div>
      ${fxTimeBar()}</div>
    <div class="card stack"><h3 style="margin:0">No fingers needed: use these tricks</h3>
      ${ops.map(o=>`<ul class="fx-how">${FACT_HOW[o].map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`).join("")}</div>
    <div class="card stack"><h3 style="margin:0">My facts</h3>${(S.mix||[key]).map(mapFor).join("")}
      <div class="fx-legend muted small"><span><i class="k"></i>Know it</span><span><i class="l"></i>Learning</span><span><i class="m"></i>Missed last time</span><span><i class="n"></i>Not tried</span></div></div>
  </div>`;
  $("#fxBack").onclick=()=>fxShow("hub");
  $("#fxGo").onclick=()=>fxShow("run",key);
  $("#fxSprint").onclick=()=>fxShow("sprint",key);
  fxBindTimes();
}

/* ---------- answering ---------- */
function fxRun(key){
  const sprint=FX.view==="sprint";
  Object.assign(FX,{sprint,list:sprint?[]:factPick(key,FACT_SESSION),i:0,right:0,fast:0,done:0,missed:[],left:fxMins()*60,total:fxMins()*60,q:null,input:"",t0:0,again:new Set()});
  $("#fxBody").innerHTML=`<div class="rn-wrap stack fx-run">
    <div class="fx-top"><span id="fxCount"></span><div class="prog"><i id="fxProg"></i></div><span id="fxScore"></span></div>
    <div class="fx-q" id="fxQ"></div>
    <div class="fx-speed"><i id="fxSpeed"></i></div>
    <div class="fx-msg" id="fxMsg"></div>
    <div class="keypad fx-keys">${["7","8","9","4","5","6","1","2","3","","0","⌫"].map(k=>k?`<button data-k="${k}" class="${k==="⌫"?"del":""}">${k==="⌫"?ic("back"):k}</button>`:`<span></span>`).join("")}</div>
  </div>`;
  document.querySelectorAll(".fx-keys [data-k]").forEach(b=>b.onclick=()=>fxKey(b.dataset.k));
  if(sprint)fxTimer=setInterval(()=>{if(!FX||FX.view!=="sprint"){clearInterval(fxTimer);return;}FX.left--;fxHead();if(FX.left<=0){clearInterval(fxTimer);fxEnd();}},1000);
  fxNext();
}
function fxHead(){
  if(FX.sprint){$("#fxCount").textContent=`${Math.floor(FX.left/60)}:${String(FX.left%60).padStart(2,"0")}`;$("#fxProg").style.width=FX.left/FX.total*100+"%";$("#fxScore").textContent=`${FX.right} right`;}
  else{$("#fxCount").textContent=`${Math.min(FX.i+1,FX.list.length)} of ${FX.list.length}`;$("#fxProg").style.width=FX.i/FX.list.length*100+"%";$("#fxScore").textContent=`⚡ ${FX.fast}`;}
}
function fxNext(){
  if(!FX.sprint&&FX.i>=FX.list.length){fxEnd();return;}
  FX.q=FX.sprint?factPick(FX.key,1)[0]:FX.list[FX.i]; FX.input=""; FX.lock=false; FX.t0=performance.now();
  $("#fxQ").innerHTML=`<span>${FX.q.q} =</span> <b id="fxIn" class="fx-in">?</b>`; $("#fxMsg").textContent=""; $("#fxMsg").className="fx-msg";
  const sp=$("#fxSpeed"); sp.style.transition="none"; sp.style.width="100%"; sp.className=""; void sp.offsetWidth;
  sp.style.transition=`width ${fxGoal()}ms linear`; sp.style.width="0%";
  fxHead();
}
function fxKey(k){
  if(!FX||!FX.q||FX.lock)return;
  if(k==="⌫")FX.input=FX.input.slice(0,-1); else if(FX.input.length<3)FX.input+=k;
  $("#fxIn").textContent=FX.input||"?";
  const want=String(FX.q.ans);
  if(FX.input.length>=want.length)fxCheck();
}
function fxCheck(){
  const f=FX.q, ms=performance.now()-FX.t0, ok=+FX.input===f.ans; FX.lock=true;
  const fast=recordFact(f,ok,ms); FX.done++;
  if(ok){FX.right++; if(fast)FX.fast++; beep(true);
    $("#fxIn").classList.add("ok"); $("#fxMsg").textContent=fast?"⚡ Quick!":`Right, but try to remember it faster next time (${(ms/1000).toFixed(1)} s).`;
    $("#fxMsg").className="fx-msg "+(fast?"ok":"slow");
    if(!fast&&!FX.sprint&&!FX.again.has(f.id)){FX.again.add(f.id);FX.list.splice(Math.min(FX.i+4,FX.list.length),0,f);}
    setTimeout(()=>{FX.i++;fxNext();},fast?450:1500);
  }else{beep(false); FX.missed.push(f);
    $("#fxIn").textContent=f.ans; $("#fxIn").classList.add("bad");
    $("#fxMsg").innerHTML=`<b>${f.q} = ${f.ans}</b><br>${esc(factTip(f))}`; $("#fxMsg").className="fx-msg bad";
    if(!FX.sprint&&!FX.again.has(f.id)){FX.again.add(f.id);FX.list.splice(Math.min(FX.i+3,FX.list.length),0,f);}
    setTimeout(()=>{FX.i++;fxNext();},FX.sprint?2200:3200);
  }
  Store.save();
}
function fxEnd(){
  clearInterval(fxTimer); const key=FX.key, st=factStats(key);
  let best="";
  if(FX.sprint){const b=fxBest(key);if(FX.right>b){fxSetBest(key,FX.right);best=b?" New best!":"";}}
  const pct=FX.done?FX.right/FX.done:0, stars=FX.sprint?(FX.right>=12*FX.total/60?3:FX.right>=7*FX.total/60?2:1):(pct>=.9&&FX.fast>=FX.done*.7?3:pct>=.7?2:1);
  beep(true,true); FX.q=null;
  const miss=[...new Map(FX.missed.map(f=>[f.id,f])).values()];
  $("#fxBody").innerHTML=`<div class="rn-wrap stack"><div class="card rn-done stack">
    <div class="stars">${"★".repeat(stars)}<span style="opacity:.25">${"★".repeat(3-stars)}</span></div>
    <h2>${FX.sprint?`${FX.right} right in ${FX.total/60} minute${FX.total>60?"s":""}!${best}`:`${FX.right} of ${FX.done} right · ⚡ ${FX.fast} quick`}</h2>
    <p class="muted">${st.known} of ${st.total} facts known in ${FACT_SETS[key].name.toLowerCase()} ${FACT_SETS[key].sub}.</p>
    ${miss.length?`<div class="fx-missed"><div class="muted small">Learn these ones:</div>${miss.map(f=>`<div><b>${f.q} = ${f.ans}</b><span class="muted small">${esc(factTip(f))}</span></div>`).join("")}</div>`:""}
    <div class="row" style="justify-content:center"><button class="btn primary big" id="fxAgain">Go again</button><button class="btn big" id="fxBack">${ic("back")}Back</button></div></div></div>`;
  $("#fxAgain").onclick=()=>fxShow(FX.sprint?"sprint":"run",key);
  $("#fxBack").onclick=()=>fxShow("set",key);
  Store.save();
}
