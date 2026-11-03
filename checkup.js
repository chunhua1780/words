/* ================= Daily check-up: a 15-question mini test that follows the Year 5 school year =================
   The school's own plan is not published, so the units follow the order most English primary schools
   use (White Rose Maths, Year 5) on the 2026-27 term dates. A parent can pick the unit by hand instead.
   8 questions come from the current unit and 7 revise earlier units. One try per question and no marks
   until the end; then a report shows the score, how each area went, and what to practise.
   A check-up is stored in book.maths.days under "test-YYYY-MM-DD", so it syncs with the other maths. */
const CU_N=15, CU_NOW=8;
const isMDA=o=>/10, 100 and 1,000|mentally/.test(o);
const CU_UNITS=[
  {k:"pv",from:"2026-09-03",name:"Place value",about:"numbers to 1,000,000, Roman numerals, rounding",
    has:q=>q.t==="Place value"||q.t==="Roman numerals"||(q.t==="Rounding"&&!/decimal/i.test(q.o))},
  {k:"as",from:"2026-10-01",name:"Addition and subtraction",about:"mental and written methods, checking, problems",has:q=>q.t==="Addition and subtraction"},
  {k:"mda",from:"2026-10-15",name:"Multiplication and division 1",about:"multiples, factors, primes, square and cube numbers, × and ÷ by 10, 100, 1,000",
    has:q=>q.t==="Multiples, factors and primes"||q.t==="Squares and cubes"||(q.t==="Multiplication and division"&&isMDA(q.o))},
  {k:"fra",from:"2026-11-16",name:"Fractions 1",about:"equivalent fractions, mixed numbers, comparing and ordering",
    has:q=>q.t==="Fractions"&&/equivalent|improper|mixed numbers to|Compare|diagram/i.test(q.o)},
  {k:"mdb",from:"2027-01-05",name:"Multiplication and division 2",about:"written methods, short division, remainders, problems",
    has:q=>q.t==="Multiplication and division"&&!isMDA(q.o)},
  {k:"frb",from:"2027-01-26",name:"Fractions 2",about:"adding and taking away fractions, × by a whole number, fractions of amounts",
    has:q=>q.t==="Fractions"&&/Add and subtract|Multiply|amounts/.test(q.o)},
  {k:"dp",from:"2027-02-22",name:"Decimals and percentages",about:"tenths, hundredths, thousandths, rounding decimals, percentages",
    has:q=>(q.t==="Decimals"&&!/Add and subtract/.test(q.o))||q.t==="Percentages"||(q.t==="Rounding"&&/decimal/i.test(q.o))},
  {k:"pa",from:"2027-03-15",name:"Perimeter and area",about:"perimeter, area of rectangles and rectilinear shapes",has:q=>q.t==="Measurement"&&/perimeter|area/i.test(q.o)},
  {k:"st",from:"2027-03-22",name:"Statistics",about:"tables, line graphs, bar charts",has:q=>q.t==="Statistics"},
  {k:"sh",from:"2027-04-12",name:"Shape",about:"angles, regular polygons, 3-D shapes",has:q=>q.t==="Geometry"&&!/reflection|translation/.test(q.o)},
  {k:"pd",from:"2027-05-04",name:"Position and direction",about:"reflection and translation",has:q=>q.t==="Geometry"&&/reflection|translation/.test(q.o)},
  {k:"dec",from:"2027-05-13",name:"Decimals",about:"adding and taking away decimals, money",has:q=>(q.t==="Decimals"&&/Add and subtract/.test(q.o))||q.t==="Money"},
  {k:"neg",from:"2027-06-07",name:"Negative numbers",about:"counting through zero, temperatures",has:q=>q.t==="Negative numbers"},
  {k:"cu",from:"2027-06-14",name:"Converting units",about:"metric and imperial units, time",has:q=>(q.t==="Measurement"&&/Convert|imperial/.test(q.o))||q.t==="Time"},
  {k:"vol",from:"2027-06-28",name:"Volume",about:"counting cubes, cuboids",has:q=>q.t==="Measurement"&&/volume/i.test(q.o)},
];
const CU_BY=Object.fromEntries(CU_UNITS.map(u=>[u.k,u]));
for(const u of CU_UNITS)u.ids=MATHS.filter(q=>u.has(q)).map(q=>q.id);
const cuUnitOf=id=>CU_UNITS.find(u=>u.has(MQ[id]))||null;

/* The unit taught now: the parent's choice if set, otherwise the last one whose start date has passed */
function cuCurrent(date=today()){
  const pick=(B().prefs||{}).cuUnit;
  if(pick&&CU_BY[pick])return {unit:CU_BY[pick],auto:false};
  let u=CU_UNITS[0]; for(const x of CU_UNITS)if(x.from<=date)u=x;
  return {unit:u,auto:true};
}
function cuSetUnit(k){const b=B();b.prefs=b.prefs||{};if(k)b.prefs.cuUnit=k;else delete b.prefs.cuUnit;b.prefs.u=Date.now();Store.save();}

const cuKey=d=>"test-"+d;
function cuGet(date=today()){return MB().days[cuKey(date)]||null;}
function cuCreate(date=today()){
  const M=MB(), key=cuKey(date); if(M.days[key])return M.days[key];
  const rnd=seedRand((Store.user||"")+"|"+date+"|check-up"), st=M.q, {unit}=cuCurrent(date);
  const today20=new Set(((M.days[date]||{}).ids)||[]);
  const mix=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  // unseen questions first, then ones got wrong, then the rest; spread across the unit's kinds of question
  const order=ids=>{const ok=ids.filter(id=>!today20.has(id));
    const byKind=g=>{const m={};for(const id of g)(m[MQ[id].o]=m[MQ[id].o]||[]).push(id);const ks=mix(Object.keys(m)),out=[];for(let i=0;out.length<g.length;i++)for(const k of ks)if(m[k][i])out.push(m[k][i]);return out;};
    return [...byKind(mix(ok.filter(id=>!st[id]))),...mix(ok.filter(id=>st[id]&&st[id].ok===false)),...mix(ok.filter(id=>st[id]&&st[id].ok!==false))];};
  const now=order(unit.ids).slice(0,CU_NOW);
  const earlier=CU_UNITS.filter(u=>u.from<unit.from&&u.ids.length);
  const pools=(earlier.length?earlier:CU_UNITS.filter(u=>u!==unit)).map(u=>{
    const wrong=mix(u.ids.filter(id=>st[id]&&st[id].ok===false&&!today20.has(id)));
    return [...wrong,...order(u.ids).filter(id=>!wrong.includes(id))];});
  const back=[]; for(let i=0;back.length<CU_N-now.length&&i<40;i++)for(const p of mix(pools))if(p[i]&&back.length<CU_N-now.length&&!now.includes(p[i])&&!back.includes(p[i]))back.push(p[i]);
  M.days[key]={ids:[...now,...back],ans:{},unit:unit.k,t0:0,u:Date.now()};
  Store.save();
  return M.days[key];
}
function openCheckup(date=today()){
  const d=cuCreate(date);
  if(!d.t0){d.t0=Date.now();d.u=Date.now();}
  openMaths({kind:"test",key:cuKey(date),date,ids:d.ids,topic:"Daily check-up"});
}

/* ---------- the card on the Maths page ---------- */
function checkupCard(){
  const d=cuGet(), {unit,auto}=cuCurrent(), done=d?Object.keys(d.ans).length:0, right=d?Object.values(d.ans).filter(a=>a.ok).length:0;
  const past=cuHistory(7);
  return `<div class="card cu-card stack">
    <div class="row" style="justify-content:space-between;align-items:flex-start;gap:12px">
      <div class="stack tight" style="gap:4px"><span class="kind-tag" style="--kc:var(--c-purple)">${ic("doc")}Daily check-up · Year 5</span>
        <h3 style="margin:0">${d&&done===d.ids.length?`Today: ${right} out of ${d.ids.length}`:`A ${CU_N}-question mini test`}</h3>
        <span class="muted small">Now at school: <b>${esc(unit.name)}</b> (${esc(unit.about)})${auto?"":" · chosen by a parent"}</span></div>
      ${past.length?`<div class="cu-spark" title="Last check-ups">${past.map(h=>`<i style="height:${Math.max(8,h.pct)}%" class="${h.pct>=80?"g":h.pct>=60?"o":"r"}" title="${h.date}: ${h.right}/${h.n}"></i>`).join("")}</div>`:""}
    </div>
    <p class="muted small" style="margin:0">One try per question, like a real test. You see your marks and what to practise at the end.</p>
    <div class="row"><button class="btn primary big" data-cu="go">${ic("doc")}${!d||done===0?"Start today’s check-up":done<d.ids.length?`Continue · ${d.ids.length-done} left`:"See my report"}</button></div>
  </div>`;
}
function cuHistory(n){
  const M=MB(), out=[];
  for(let k=13;k>=0&&out.length<99;k--){const date=addDays(today(),-k), d=M.days[cuKey(date)];
    if(d&&Object.keys(d.ans).length===d.ids.length){const r=Object.values(d.ans).filter(a=>a.ok).length;out.push({date,right:r,n:d.ids.length,pct:Math.round(r/d.ids.length*100)});}}
  return out.slice(-n);
}

/* ---------- the report ---------- */
function cuAreas(d){
  // group by unit; within the current unit also by kind of question
  const rows={};
  for(const id of d.ids){const q=MQ[id]; if(!q)continue; const u=cuUnitOf(id), a=d.ans[id];
    const key=u&&u.k===d.unit?q.o:(u?u.name:q.t);
    const r=rows[key]||(rows[key]={label:key,cur:u&&u.k===d.unit,topic:q.t,n:0,ok:0,ids:[]});
    r.n++; if(a&&a.ok)r.ok++; r.ids.push(id);}
  return Object.values(rows).sort((a,b)=>(b.cur-a.cur)||(a.ok/a.n-b.ok/b.n));
}
function renderCheckupReport(){
  const d=MB().days[MS.key], ids=d.ids, right=ids.filter(id=>d.ans[id]&&d.ans[id].ok).length, n=ids.length, pct=Math.round(right/n*100);
  if(!d.t1){d.t1=Date.now();d.u=Date.now();Store.save();}
  const mins=d.t0?Math.max(1,Math.round((d.t1-d.t0)/60000)):null, unit=CU_BY[d.unit]||cuCurrent().unit;
  const areas=cuAreas(d), gaps=areas.filter(a=>a.ok<a.n), stars=pct>=90?3:pct>=70?2:pct>=40?1:0;
  const grade=pct>=90?"Excellent: working at a strong level":pct>=75?"Good: secure, with a few slips":pct>=50?"Getting there: some gaps to fill":"Needs practice: let's work on the basics";
  if(!MS.cheered){MS.cheered=true;beep(true,true);}
  const hist=cuHistory(7);
  $("#mBody").innerHTML=`<div class="m-q m-results cu-report">
    <div class="stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div>
    <h2>${right} out of ${n} · ${pct}%</h2>
    <p class="cu-grade ${pct>=75?"g":pct>=50?"o":"r"}">${grade}</p>
    <p class="muted" style="margin:0">Unit at school: ${esc(unit.name)}${mins?` · took about ${mins} minute${mins>1?"s":""}`:""}</p>
    ${hist.length>1?`<div class="cu-hist">${hist.map(h=>`<div><i style="height:${Math.max(6,h.pct)}%" class="${h.pct>=80?"g":h.pct>=60?"o":"r"}"></i><span>${h.pct}%</span><small>${shortDate(h.date)}</small></div>`).join("")}</div>`:""}
    <div class="card stack cu-areas"><h3 style="margin:0">How each area went</h3>
      ${areas.map(a=>{const p=a.ok/a.n;return `<div class="cu-area"><span class="cu-dot ${p===1?"g":p>=.5?"o":"r"}"></span><div class="grow"><div>${esc(a.label)}${a.cur?` <span class="muted small">· this unit</span>`:` <span class="muted small">· revision</span>`}</div></div><b>${a.ok}/${a.n}</b></div>`;}).join("")}
    </div>
    ${gaps.length?`<div class="card stack"><h3 style="margin:0">Gaps to work on</h3>
      ${[...new Set(gaps.map(g=>g.topic))].map(t=>`<div class="row" style="justify-content:space-between;gap:10px"><span>${esc(t)}</span><button class="btn" data-cu-topic="${esc(t)}">Practise ${esc(t.toLowerCase())}</button></div>`).join("")}
      <p class="muted small" style="margin:0">Questions you got wrong also come back in your daily ${MDAY}.</p></div>`
      :`<p class="cu-grade g">No gaps today. Brilliant!</p>`}
    <h3 style="margin:8px 0 0">All the questions</h3>
    <div class="group">${ids.map((id,i)=>{const q=MQ[id],a=d.ans[id]||{},ok=a.ok;return `<div class="cell m-row"><div class="badge ${ok?"green":"red"}">${ic(ok?"check":"x")}</div><div class="grow"><div class="ttl">${i+1}. ${mt(q.q)}</div>${ok?"":`<div class="sub">You wrote: ${esc(a.v||"–")} · Answer: <b>${esc(showAns(q))}</b> · ${mt(q.w)}</div>`}</div></div>`;}).join("")}</div>
    <button class="btn primary big" id="mDone">Done</button>
  </div>`;
  $("#mDone").onclick=closeMaths;
  document.querySelectorAll("[data-cu-topic]").forEach(b=>b.onclick=()=>{const t=b.dataset.cuTopic;closeMaths();openMaths({kind:"topic",topic:t,ids:topicSet(t)});});
}
