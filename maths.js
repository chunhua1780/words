/* ================= Maths: UK Year 5 (National Curriculum for England) =================
   The question bank (MATHS, MATHS_TOPICS) comes from maths-bank.js, built by tools/build_maths.py.
   Progress lives in book.maths: q (per question), days (the daily 20), log (answered per day). */
const MDAY=20, MTOPIC=10;
/* Year 5 and below only (checked against the National Curriculum for England): reflecting in the axes and
   coordinates below zero are Year 6, common multiples are Year 6, and 5% is not one of the Year 5 percentage equivalents. */
const OUT_OF_YEAR=q=>/reflected in the [xy]-axis/.test(q.q)||(/translation/.test(q.o)&&/[−-]/.test(String(q.a)))||/^What is 5% of/.test(q.q)||/common multiples/.test(q.o) // common multiples are Year 6
  ||/highest common factor|lowest common multiple|largest prime factor|prime factori[sz]/i.test(q.q) // secondary-school (Year 7) wording: kept on Candy’s site only
  ||/[²³]\s*[+−×-]\s*\d+[²³]/.test(q.q); // sums of powers are Year 7 (order of operations with indices)
for(let i=MATHS.length-1;i>=0;i--)if(OUT_OF_YEAR(MATHS[i]))MATHS.splice(i,1);
const MQ=Object.fromEntries(MATHS.map(q=>[q.id,q]));
const TI=t=>MATHS_TOPICS.indexOf(t);
const TCOL=["blue","teal","purple","pink","orange","green"];
const topicColor=t=>`var(--c-${TCOL[TI(t)%TCOL.length]})`;
const TOPIC_COUNT={}; MATHS.forEach(q=>TOPIC_COUNT[q.t]=(TOPIC_COUNT[q.t]||0)+1);

/* Daily sets and tests are filed as "y5:<date>" so this site never picks up the other site's sets when
   both children use the same account. Older entries without the prefix still count if their questions are ours. */
const DAYP="y5:";
function dayOf(key){const M=MB();const d=M.days[DAYP+key];if(d)return d;const o=M.days[key];return o&&(o.ids||[]).length&&o.ids.every(id=>MQ[id])?o:null;}
function MB(){const b=B();b.maths=b.maths||{};b.maths.q=b.maths.q||{};b.maths.days=b.maths.days||{};b.maths.log=b.maths.log||{};b.maths.hist=b.maths.hist||{};return b.maths;}
function seedRand(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

/* Today's 20: up to 5 questions answered wrongly before, then new questions spread across all topics */
/* the questions of the last day with a set (up to 5 days back) that were never answered */
function mCarry(date){
  for(let k=1;k<=5;k++){const d=dayOf(addDays(date,-k)); if(!d||!(d.ids||[]).length)continue;
    return d.ids.filter(id=>!(id in (d.ans||{}))&&MQ[id]&&!/^g/.test(id)).slice(0,12);}
  return [];
}
function dailySet(date,create=true){
  const M=MB(), ex=dayOf(date); if(ex&&ex.ids.length)return ex;
  if(!create)return null;
  const rnd=seedRand((Store.user||"")+"|"+date), st=M.q;
  const retry=Object.entries(st).filter(([id,s])=>MQ[id]&&!id.startsWith("w:")&&s.ok===false&&(s.last||"")<date).sort((a,b)=>(a[1].last||"")<(b[1].last||"")?-1:1).slice(0,5).map(x=>x[0]);
  // spaced check: a question put right about a week ago comes back once, to see that it has stuck
  retry.push(...Object.entries(st).filter(([id,s])=>MQ[id]&&!id.startsWith("w:")&&s.ok===true&&s.fx&&!s.cf&&dayDiff(s.fx,date)>=6&&!retry.includes(id)).sort((a,b)=>(a[1].fx<b[1].fx?-1:1)).slice(0,2).map(x=>x[0]));
  retry.unshift(...mCarry(date).filter(id=>!retry.includes(id))); // a day missed or not finished: those questions come first today
  // 4 questions from the weakest topics (under 70% right), so the gaps get extra practice every day
  const weak=weakTopics(), focus=[]; for(const t of weak){const pool=MATHS.filter(q=>q.t===t&&!retry.includes(q.id)).map(q=>q.id).sort((a,b)=>lastSeen(a,st)-lastSeen(b,st)||rnd()-.5);
    for(const id of pool){if(focus.length>=4||focus.filter(x=>MQ[x].t===t).length>=2)break;focus.push(id);}}
  if(typeof w5School==="function")focus.push(...w5School(date,st,[...retry,...focus])); // 6 from the unit taught at school now (school5.js)
  const byT={}; for(const q of MATHS)if(!st[q.id]&&!SERVED[q.id]&&!retry.includes(q.id)&&!focus.includes(q.id))(byT[q.t]=byT[q.t]||[]).push(q.id);
  const need=MDAY-retry.length-focus.length, picked=[...focus], cnt={};
  for(let g=0;picked.length<need+focus.length&&g<400;g++){
    const ts=Object.keys(byT).filter(t=>byT[t].length&&(cnt[t]||0)<3); if(!ts.length)break;
    let r=rnd()*ts.reduce((s,t)=>s+byT[t].length,0), t=ts[ts.length-1];
    for(const x of ts){r-=byT[x].length;if(r<0){t=x;break;}}
    picked.push(byT[t].splice(Math.floor(rnd()*byT[t].length),1)[0]); cnt[t]=(cnt[t]||0)+1;
  }
  if(picked.length<need+focus.length){ // the whole bank has been seen: bring back the oldest ones
    const old=Object.entries(st).filter(([id])=>MQ[id]&&!id.startsWith("w:")&&!retry.includes(id)).sort((a,b)=>(a[1].last||"")<(b[1].last||"")?-1:1);
    for(const [id] of old){if(picked.length>=need+focus.length)break;if(!picked.includes(id))picked.push(id);}
  }
  const ids=[...retry,...picked].slice(0,MDAY).sort((a,b)=>TI(MQ[a].t)-TI(MQ[b].t)||(a<b?-1:1));
  M.days[DAYP+date]={ids,ans:{},u:Date.now()}; Store.save(); markServed(ids);
  return M.days[DAYP+date];
}
// Take one question of each kind in turn, so a set of 10 mixes the kinds instead of repeating one
function mixKinds(ids){
  const g={}; for(const id of ids)(g[MQ[id].o]=g[MQ[id].o]||[]).push(id);
  const ks=shuffle(Object.keys(g)), out=[];
  for(let i=0;out.length<ids.length;i++)for(const k of ks)if(g[k][i])out.push(g[k][i]);
  return out;
}
/* Questions already shown on this device (answered or not), so a new set does not repeat them until the
   topic has run out; then the ones seen longest ago come back first. Wrong answers return at most 3 per set,
   and not on the same day they were last seen. */
const SERVED=(()=>{try{return JSON.parse(localStorage.getItem("m-served")||"{}");}catch(e){return {};}})();
function markServed(ids){const t=Date.now();ids.forEach(id=>{if(MQ[id]&&!String(id).startsWith("g:"))SERVED[id]=t;});try{localStorage.setItem("m-served",JSON.stringify(SERVED));}catch(e){}}
const lastSeen=(id,st)=>Math.max(SERVED[id]||0,(st[id]&&st[id].u)||0);
function topicSet(t){
  const st=MB().q, all=MATHS.filter(q=>q.t===t).map(q=>q.id), now=Date.now();
  const wrong=shuffle(all.filter(id=>st[id]&&st[id].ok===false&&now-lastSeen(id,st)>18*3600e3)).slice(0,3);
  const fresh=mixKinds(shuffle(all.filter(id=>!st[id]&&!SERVED[id])));
  let ids=[...wrong,...fresh].slice(0,MTOPIC);
  if(ids.length<MTOPIC&&typeof reviewTopUp==="function")ids=ids.concat(reviewTopUp(t,MTOPIC-ids.length)); // brush-up: brand-new generated questions
  if(ids.length<MTOPIC){const used=new Set(ids);ids=ids.concat(all.filter(id=>!used.has(id)).sort((a,b)=>lastSeen(a,st)-lastSeen(b,st)).slice(0,MTOPIC-ids.length));}
  markServed(ids);
  return ids;
}
/* ---------- 错题本 · mistakes to practise again ----------
   Every question whose latest answer was wrong: bank questions by id, generated ones (test paper, brush-up,
   formulas, daily paper questions) saved with their text under "w:<id>". Answering one right takes it off. */
function registerMistakes(){const st=MB().q;for(const [k,v] of Object.entries(st))if(k.startsWith("w:")&&v.q&&!MQ[k])MQ[k]={...v.q,id:k};}
function mistakeIds(){
  registerMistakes(); const st=MB().q;
  return Object.entries(st).filter(([id,s])=>s.ok===false&&MQ[id]&&!/^(p:|f:)/.test(id)).sort((a,b)=>(a[1].u||0)-(b[1].u||0)).map(x=>x[0]);
}
function mistakesCard(){
  const ids=mistakeIds(), byT={}; ids.forEach(id=>{const t=MQ[id].t;byT[t]=(byT[t]||0)+1;});
  return `<div class="card mk-card row" style="justify-content:space-between;gap:14px;flex-wrap:wrap">
    <div class="stack tight" style="gap:4px;flex:1;min-width:240px"><span class="kind-tag" style="--kc:var(--c-red,#d64545)">${ic("x")}错题本 · Mistakes to fix</span>
      <h3 style="margin:0">${ids.length?`${ids.length} question${ids.length>1?"s":""} to try again`:"No mistakes waiting. Brilliant!"}</h3>
      <span class="muted small">${ids.length?Object.entries(byT).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([t,n])=>`${esc(t)} ${n}`).join(" · "):"Questions you get wrong are saved here so you can practise them again."}</span></div>
    ${ids.length?`<button class="btn primary big" data-mistakes style="background:var(--red)">${ic("check")}Practise ${Math.min(10,ids.length)} again</button>`:""}
  </div>`;
}
/* redo the ones just got wrong, straight away, again and again until all are right */
function redoIds(ids){registerMistakes();const st=MB().q;
  return [...new Set(ids.filter(id=>MS.res[id]===false).map(id=>{const q=MQ[id];return q&&q.gen?"w:"+String(id).replace(/^g[a-z]*:/,""):id;}))].filter(id=>MQ[id]&&st[id]&&st[id].ok===false);}
function redoBtn(){const r=redoIds(MS.ids);MS.redo=r;
  if(!r.length)return MS.fix?`<div class="notice" style="text-align:center">${ic("check")} 全部改对了！All fixed. Brilliant!</div>`:"";
  return `<button class="btn primary big" id="mRedo" style="background:var(--red)">${ic("check")}马上重做错题 · Redo the ${r.length} wrong one${r.length>1?"s":""}</button>
    <div class="muted small" style="text-align:center">${MS.fix?"Keep going until every one is right. 直到全部做对为止。":"Fix them now while you remember. 做错的题现在马上重做一遍。"}</div>`;}
function bindRedo(){const b=document.getElementById("mRedo");if(b)b.onclick=()=>{const r=MS.redo.slice(0,10);openMaths({kind:"topic",topic:"错题本 · Mistakes to fix",ids:r,fix:true});};}
function openMistakes(){const ids=mistakeIds().slice(0,10);if(!ids.length)return;openMaths({kind:"topic",topic:"错题本 · Mistakes to fix",ids,fix:true});}
function topicStats(){
  const st=MB().q, out={};
  for(const t of MATHS_TOPICS)out[t]={seen:0,n:0,r:0,total:TOPIC_COUNT[t]};
  for(const [id,s] of Object.entries(st)){const q=MQ[id];if(!q||id.startsWith("w:")||!out[q.t])continue;const o=out[q.t];o.seen++;o.n+=s.n||0;o.r+=s.r||0;}
  return out;
}
/* the weakest topics: answered at least 4 times and under 70% right, weakest first (at most 3) */
function weakTopics(){const ts=topicStats();return Object.entries(ts).filter(([t,s])=>s.n>=4&&s.r/s.n<.7).sort((a,b)=>a[1].r/a[1].n-b[1].r/b[1].n).slice(0,3).map(x=>x[0]);}
const dayScore=d=>{const a=Object.values(d.ans||{});return {done:a.length,right:a.filter(x=>x.ok).length,n:(d.ids||[]).length};};

/* ---------- answers ---------- */
const MINUS=/[−–—]/g;
const mt=s=>fracHtml(esc(s).replace(/(^|[\s(,:])-(\d)/g,"$1−$2"));
const fmtN=n=>(n<0?"−":"")+Math.abs(n).toLocaleString("en-GB",{maximumFractionDigits:3});
function showAns(q){
  if(q.k==="c")return q.c[q.a];
  if(q.k==="n"){if(q.u==="£")return "£"+Math.abs(q.a).toFixed(Number.isInteger(q.a)?0:2);return fmtN(q.a)+(q.u?(/^[°%]/.test(q.u)?"":" ")+q.u:"");}
  return String(q.a).replace(/-/g,"−");
}
function numOf(s){s=String(s).replace(MINUS,"-").replace(/[£,\s]/g,"");return /^-?(\d+\.?\d*|\.\d+)$/.test(s)?parseFloat(s):NaN;}
function frOf(s){s=String(s).trim().replace(/\s+/g," ");let m=s.match(/^(\d+)$/);if(m)return {w:+m[1],n:0,d:1};
  m=s.match(/^(?:(\d+) )?(\d+)\/(\d+)$/);if(!m||+m[3]===0)return null;return {w:m[1]?+m[1]:0,n:+m[2],d:+m[3]};}
const gcd=(a,b)=>b?gcd(b,a%b):a;
function checkAns(q,v){
  v=String(v).trim(); if(!v)return false;
  if(q.k==="n")return Math.abs(numOf(v)-q.a)<1e-9;
  if(q.k==="r")return v.toUpperCase().replace(/\s/g,"")===q.a;
  if(q.k==="t"){
    const nz=s=>String(s).replace(MINUS,"-").replace(/[\s()]/g,"");
    if(/^\d\d:\d\d$/.test(q.a)){const m=v.replace(/[.\s]/g,":").match(/^(\d{1,2}):?(\d\d)$/);return !!m&&`${m[1].padStart(2,"0")}:${m[2]}`===q.a;}
    return nz(v)===nz(q.a);
  }
  if(q.k==="f"){
    if(v.replace(/\s+/g," ")===q.a)return true;
    const a=frOf(q.a), b=frOf(v); if(!a||!b)return false;
    if((a.w*a.d+a.n)*b.d!==(b.w*b.d+b.n)*a.d)return false;
    const kind=f=>f.n===0?"whole":f.w?"mixed":f.n>=f.d?"improper":"proper";
    const loose=k=>k==="mixed"||k==="improper"?"over1":k;
    if(/mixed number|improper/i.test(q.q)?kind(a)!==kind(b):loose(kind(a))!==loose(kind(b)))return false;
    if(b.n&&b.n>=b.d&&b.w)return false;
    const den=q.q.match(/denominator (\d+)/); if(den&&b.d!==+den[1])return false;
    return gcd(b.n,b.d)===1||(!/simplest/i.test(q.q)&&gcd(a.n,a.d)===1);
  }
  return false;
}
function sayMaths(q,btn){readAloud(q.q,btn,mathsSpeech(q));} // the question and its answers to choose from

/* ---------- figures (inline SVG, colours from the page) ---------- */
const P=(cx,cy,r,a)=>[cx+r*Math.cos(a*Math.PI/180),cy-r*Math.sin(a*Math.PI/180)];
function arc(cx,cy,r,a0,a1){const [x0,y0]=P(cx,cy,r,a0),[x1,y1]=P(cx,cy,r,a1);return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1-a0>180?1:0} 0 ${x1.toFixed(1)} ${y1.toFixed(1)}`;}
function lbl(cx,cy,r,a,t,cls=""){const [x,y]=P(cx,cy,r,a);return `<text x="${x.toFixed(1)}" y="${(y+6).toFixed(1)}" text-anchor="middle" class="${cls}">${t}</text>`;}
function ray(cx,cy,r,a){const [x,y]=P(cx,cy,r,a);return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="stroke"/>`;}
function mFig(f){
  if(!f)return "";
  if(f.t==="table")return `<div class="m-table"><table><thead><tr>${f.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${f.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  let s="", vb="0 0 300 220";
  if(f.t==="fracbar"){
    const W=340/f.n; vb=`0 0 360 64`;
    for(let i=0;i<f.n;i++)s+=`<rect x="${(10+i*W).toFixed(1)}" y="8" width="${(W-3).toFixed(1)}" height="48" rx="6" class="${i<f.k?"fill":"empty"}"/>`;
  }else if(f.t==="angle"){
    const cx=150,cy=110; s=ray(cx,cy,100,0)+ray(cx,cy,100,f.d)+`<path d="${arc(cx,cy,f.d===90?0:30,0,f.d)}" class="arcl"/>`;
    if(f.d===90)s+=`<path d="M${cx+20} ${cy}V${cy-20}H${cx}" class="arcl"/>`;
    s+=lbl(cx,cy,f.d>180?52:58,f.d/2,f.d+"°")+`<circle cx="${cx}" cy="${cy}" r="3.5" class="dotf"/>`;
  }else if(f.t==="line"){
    const cx=150,cy=150; vb="0 0 300 170";
    s=`<line x1="14" y1="${cy}" x2="286" y2="${cy}" class="stroke"/>`+ray(cx,cy,118,f.a)+`<path d="${arc(cx,cy,32,0,f.a)}" class="arcl"/><path d="${arc(cx,cy,24,f.a,180)}" class="arcl q"/>`
      +lbl(cx,cy,62,f.a/2,f.a+"°")+lbl(cx,cy,52,(f.a+180)/2,"?","qt")+`<circle cx="${cx}" cy="${cy}" r="3.5" class="dotf"/>`;
  }else if(f.t==="point"){
    const cx=150,cy=110,a=f.a,b=f.b;
    s=ray(cx,cy,100,0)+ray(cx,cy,100,a)+ray(cx,cy,100,a+b)+`<path d="${arc(cx,cy,30,0,a)}" class="arcl"/><path d="${arc(cx,cy,36,a,a+b)}" class="arcl"/><path d="${arc(cx,cy,24,a+b,360)}" class="arcl q"/>`
      +lbl(cx,cy,62,a/2,a+"°")+lbl(cx,cy,66,a+b/2,b+"°")+lbl(cx,cy,52,(a+b+360)/2,"?","qt")+`<circle cx="${cx}" cy="${cy}" r="3.5" class="dotf"/>`;
  }else if(f.t==="rect"||f.t==="lshape"){
    const W=f.t==="rect"?f.a:f.W, H=f.t==="rect"?f.b:f.H, k=Math.min(210/W,140/H), w=W*k, h=H*k, x=(300-w)/2+6, y=(200-h)/2+4, u=f.u||"cm";
    if(f.t==="rect")s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="shape"/>`;
    else{const cw=f.w*k, ch=f.h*k;
      s=`<rect x="${x+w-cw}" y="${y}" width="${cw}" height="${ch}" class="cut"/><path d="M${x} ${y}H${x+w-cw}V${y+ch}H${x+w}V${y+h}H${x}Z" class="shape"/>`
        +`<text x="${x+w-cw/2}" y="${y-8}" text-anchor="middle" class="cutl">${f.w} ${u}</text><text x="${x+w+8}" y="${y+ch/2+5}" class="cutl">${f.h} ${u}</text>`;}
    s+=`<text x="${x+w/2}" y="${y+h+24}" text-anchor="middle">${W} ${u}</text><text x="${x-8}" y="${y+h/2+5}" text-anchor="end">${H} ${u}</text>`;
    vb="0 0 300 235";
  }else if(f.t==="bar"||f.t==="lgraph"){
    const vals=f.values, lo=Math.min(0,...vals), hi=Math.max(...vals), step=hi-lo>10?2:1, top=Math.ceil((hi+1)/step)*step, bot=Math.floor(lo/step)*step;
    const L=40,R=340,T=30,Bm=190, Y=v=>Bm-(v-bot)/(top-bot)*(Bm-T), n=vals.length, bw=(R-L)/n;
    vb="0 0 350 222";
    for(let v=bot;v<=top;v+=step)s+=`<line x1="${L}" x2="${R}" y1="${Y(v)}" y2="${Y(v)}" class="${v===0?"axis":"grid"}"/>`+`<text x="${L-6}" y="${Y(v)+4}" text-anchor="end" class="tick">${v<0?"−"+(-v):v}</text>`;
    if(f.t==="bar")vals.forEach((v,i)=>{const x=L+i*bw+bw*.22, wd=bw*.56, y=Y(v);s+=`<path d="M${x} ${Y(0)}V${y+4}Q${x} ${y} ${x+4} ${y}H${x+wd-4}Q${x+wd} ${y} ${x+wd} ${y+4}V${Y(0)}Z" class="bar"/>`;});
    else{const pts=vals.map((v,i)=>[L+i*bw+bw/2,Y(v)]);s+=`<polyline points="${pts.map(p=>p.join(",")).join(" ")}" class="gline"/>`+pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4.5" class="gdot"/>`).join("");}
    f.labels.forEach((l,i)=>s+=`<text x="${L+i*bw+bw/2}" y="${Bm+20}" text-anchor="middle" class="tick">${esc(l)}</text>`);
    s=`<text x="${L}" y="16" class="ttl">${esc(f.title)}</text>`+s;
  }
  return `<svg class="m-fig ${f.t}" viewBox="${vb}" role="img" aria-label="Diagram">${s}</svg>`;
}

/* ---------- Maths tab ---------- */
function mathsCard(){
  const t=today(), d=dailySet(t,false), sc=d?dayScore(d):{done:0,right:0,n:MDAY}, p=Math.round(sc.done/sc.n*100);
  return `<div class="card maths-card">
    <div class="badge lg teal">${ic("maths")}</div>
    <div class="grow stack tight" style="gap:4px"><span class="kind-tag teal">${ic("maths")}Daily maths · Year 5</span><h3 style="margin:0">Today’s ${MDAY} questions</h3>
      <div class="muted small">${sc.done===0?"Number, fractions, measures, shapes and more":sc.done<sc.n?`${sc.done} of ${sc.n} answered`:`Finished: ${sc.right} out of ${sc.n} correct`}</div></div>
    <div class="ring" style="--p:${p}"><span>${sc.done}/${sc.n}</span></div>
    <button class="btn primary" data-maths="day">${sc.done===0?"Start":sc.done<sc.n?"Continue":"See results"}</button>
  </div>`;
}
function viewMaths(){
  const t=today(), d=dailySet(t), sc=dayScore(d), M=MB(), ts=topicStats();
  const week=[...Array(7)].map((_,k)=>addDays(t,k-6));
  const dl=Object.entries(M.log).filter(([k])=>/^\d{4}-/.test(k)).map(x=>x[1]), total=dl.reduce((s,x)=>s+(x.n||0),0), right=dl.reduce((s,x)=>s+(x.r||0),0);
  const seen=Object.keys(M.q).filter(id=>MQ[id]).length; // quick-facts records (ids "f:…") are not bank questions
  return `<div class="stack">
    <div class="page-head"><div><div class="eyebrow">Maths · Year 5</div><h1>Daily maths</h1></div></div>
    <div class="card maths-hero">
      <div class="stack" style="gap:12px">
        <div class="muted">${MDAY} questions every day from the Year 5 curriculum. Work them out on paper if you need to, then type or tap your answer. You get two tries.</div>
        <div class="row" style="gap:14px">${week.map(w=>{const x=dayOf(w),s=x?dayScore(x):null;return `<div class="wk"><div class="ring" style="--p:${s?s.done/s.n*100:0}"><span>${s&&s.done?s.right:""}</span></div><div class="muted">${w===t?"Today":WEEK[pdate(w).getDay()]}</div></div>`;}).join("")}</div>
        <div class="row"><button class="btn primary big" data-maths="day">${ic("maths")}${sc.done===0?"Start today’s 20":sc.done<sc.n?`Continue · ${sc.n-sc.done} left`:"See today’s results"}</button>
          ${sc.done===sc.n?`<span class="muted">${sc.right}/${sc.n} correct today</span>`:""}</div>
      </div>
      <div class="hero-num"><b>${sc.done}<small>/${sc.n}</small></b><span class="muted small">answered today</span></div>
    </div>
    ${checkupCard()}
    ${typeof drillCard==="function"?drillCard():""}
    ${typeof calcCard==="function"?calcCard():""}
    ${mistakesCard()}
    <div class="kpis">
      <div class="kpi"><b>${total}</b><span>questions answered</span></div>
      <div class="kpi"><b>${total?Math.round(right/total*100)+"%":"–"}</b><span>correct</span></div>
      <div class="kpi"><b>${seen}<small>/${MATHS.length}</small></b><span>of the question bank</span></div>
    </div>
    <button class="card rn-entry fx-entry" data-facts><span class="rn-entry-l">7+8<br>18÷3</span>
      <span class="stack tight" style="gap:4px;text-align:left"><b>Quick facts: + − × ÷ within 20</b><span class="muted small">${(()=>{const k=["add","sub","mul20","div20"].reduce((a,x)=>a+factStats(x).known,0),n=["add","sub","mul20","div20"].reduce((a,x)=>a+factStats(x).total,0);return `Know them by heart, no fingers. ${k} of ${n} facts known.`;})()}</span></span>
      <span class="chev">${ic("chevron")}</span></button>
    <button class="card rn-entry" data-roman><span class="rn-entry-l">I V X<br>L C D M</span>
      <span class="stack tight" style="gap:4px;text-align:left"><b>Roman numerals corner</b><span class="muted small">Learn the seven letters, play drag-and-match games and practise changing numbers to and from Roman numerals.</span></span>
      <span class="chev">${ic("chevron")}</span></button>
    <div class="section-title"><h3 style="margin:0">Practise a Year 5 topic</h3><span class="muted small">${MTOPIC} questions at a time</span></div>
    <div class="topics">${MATHS_TOPICS.map(t=>{const s=ts[t];return `<button class="topic" data-maths="topic" data-topic="${esc(t)}" style="--tc:${topicColor(t)}">
      <b>${esc(t)}</b><span class="muted small">${s.n?`${Math.round(s.r/s.n*100)}% correct · `:""}${s.seen} of ${s.total} done</span>
      <span class="bar"><i style="width:${s.seen/s.total*100}%"></i></span></button>`;}).join("")}</div>
  </div>`;
}
function bindMaths(){
  document.querySelectorAll("#view [data-mistakes]").forEach(b=>b.onclick=openMistakes);
  document.querySelectorAll("#view [data-cu]").forEach(b=>b.onclick=()=>openCheckup());
  document.querySelectorAll("#view [data-roman]").forEach(b=>b.onclick=()=>openRoman());
  document.querySelectorAll("#view [data-facts]").forEach(b=>b.onclick=()=>openFacts());
  document.querySelectorAll("#view [data-maths]").forEach(b=>b.onclick=()=>{
    if(b.dataset.maths==="day"){const d=dailySet(today());openMaths({kind:"day",date:today(),ids:d.ids});}
    else openMaths({kind:"topic",topic:b.dataset.topic,ids:topicSet(b.dataset.topic)});
  });
}

/* ---------- the question screen ---------- */
let MS=null;
function openMaths(o){
  MS={...o,i:0,tries:0,input:"",state:"ask",res:{},wrongPick:[]};
  if(o.kind==="day"||o.kind==="test"){const d=dayOf(o.kind==="test"?o.key:o.date);Object.entries(d.ans||{}).forEach(([id,a])=>MS.res[id]=a.ok);
    const first=o.ids.findIndex(id=>!(id in d.ans)); MS.i=first<0?o.ids.length:first;}
  window.__busy=true; $("#maths").hidden=false; document.body.style.overflow="hidden";
  $("#mLabel").textContent=o.kind==="day"?`Daily maths · ${shortDate(o.date)}`:o.kind==="test"?`Daily check-up · ${shortDate(o.date)}`:o.topic;
  renderMQ();
}
function closeMaths(){MS=null;window.__busy=false;$("#maths").hidden=true;document.body.style.overflow="";Store.save();render();}
function keysFor(q){
  const D=["7","8","9","4","5","6","1","2","3"];
  if(q.k==="r")return ["I","V","X","L","C","D","M","⌫"];
  if(q.k==="f")return [...D,"space","0","/","⌫"];
  if(q.k==="t")return /:/.test(q.a)?[...D,":","0","⌫"]:[...D,"−","0",",","⌫"];
  return [...D,"−","0",".","⌫"];
}
function renderMQ(){
  const body=$("#mBody"), n=MS.ids.length;
  if(MS.t0i!==MS.i){MS.t0i=MS.i;MS.t0=Date.now();}
  $("#mProg").style.width=(Math.min(MS.i,n)/n*100)+"%";
  if(MS.i>=n){renderMResults();return;}
  const q=MQ[MS.ids[MS.i]], st=MS.state, done=st==="right"||st==="shown";
  $("#maths").style.setProperty("--tc",topicColor(q.t));
  const unit=q.u&&q.k==="n"?q.u:"", pre=unit==="£"?"£":"", post=unit&&unit!=="£"?unit:"";
  body.innerHTML=`<div class="m-q">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:${topicColor(q.t)}">${esc(q.t)}${q.example?" · 例题 Example":""}</span><span class="muted small">Question ${MS.i+1} of ${n}</span></div>
    <div class="m-text">${mt(q.q)} <span class="m-tools"><button class="icon-btn sm" id="mSay" aria-label="Read the question">${ic("speaker")}</button>${zhBtnHtml()}</span></div>${zhLine(q.q,"q")}
    ${mFig(q.f)}
    ${q.k==="c"?`<div class="m-opts">${q.c.map((c,i)=>`<button class="opt-btn m-opt ${done&&i===q.a?"right":""} ${MS.wrongPick.includes(i)?"wrong":""}" data-opt="${i}" ${done||MS.wrongPick.includes(i)?"disabled":""}>${fracHtml(esc(c))}${zhLine(c,"opt")}</button>`).join("")}</div>`
    :`<div class="m-answer ${st}"><span class="pre">${pre}</span><span class="val">${(q.k==="f"?fracHtml:x=>x)(esc(q.k==="n"?MS.input.replace(/^(−?)(\d{4,})/,(m,s,d)=>s+(+d).toLocaleString("en-GB")):MS.input))}${done?"":`<i class="caret"></i>`}</span><span class="post">${esc(post)}</span></div>
      ${done?"":`<div class="keypad ${q.k}">${keysFor(q).map(k=>`<button data-key="${k}" class="${k==="⌫"?"del":k==="space"?"sp":""}">${k==="⌫"?ic("back"):k==="space"?"space":k}</button>`).join("")}</div>
      <button class="btn primary big" id="mCheck" ${MS.input.trim()&&!(MS.wait&&Date.now()<MS.wait)?"":"disabled"}>${MS.kind==="test"?(MS.i+1<n?"Next":"Finish"):"Check"}</button>`}`}
    <div class="m-feedback">${feedback(q)}</div>
    ${typeof teachBtnHtml==="function"?teachBtnHtml(q):""}
  </div>`;
  $("#mSay").onclick=()=>sayMaths(q,$("#mSay"));
  $("#mZh").onclick=()=>{zhToggle();renderMQ();};
  bindExplain(body,renderMQ); if(typeof bindTeach==="function")bindTeach(body,q);
  zhFill(body);
  body.querySelectorAll("[data-opt]").forEach(b=>b.onclick=()=>answer(q,+b.dataset.opt));
  body.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>press(b.dataset.key));
  const c=$("#mCheck"); if(c)c.onclick=()=>answer(q,MS.input);
  const nx=$("#mNext"); if(nx){nx.onclick=nextQ;nx.focus({preventScroll:true});}
}
function feedback(q){
  const st=MS.state, nx=`<button class="btn primary big" id="mNext">${MS.i+1<MS.ids.length?"Next question":"See results"}</button>`;
  if(st==="retry")return `<div class="mfb warn">${ic("x")}<div><b>Not quite. Have another go.</b><span>Stuck? Tap 答疑 for help, one step at a time.</span></div></div>${explainBox(q,false)}`;
  if(st==="right"&&q.example)return `<div class="mfb ok">${ic("check")}<div><b>That was the example. Now try ones like it by yourself! 例题做完了，下面的同类题自己做！</b><span>${mt(q.w||"")}</span></div></div>`;
  if(st==="right"&&MS.helped&&MS.helped[q.id])return `<div class="mfb warn">${ic("check")}<div><b>Right, well done! But you used Help, so this one does not count yet.</b><span>A similar question comes next: try it by yourself. 答对了！不过用了帮助，这题先不算分。下一题是类似的，自己试试！</span></div></div>`;
  if(st==="right")return `<div class="mfb ok">${ic("check")}<div><b>${MS.tries>1?"Correct on your second try!":"Correct!"}</b><span>${mt(q.w)}</span></div></div>${explainBox(q,true)}${nx}`;
  if(st==="shown")return `<div class="mfb bad">${ic("x")}<div><b>The answer is ${fracHtml(esc(showAns(q)))}</b><span>Here is how to work it out, step by step:</span></div></div>${explainBox(q,true)}${nx}`;
  return MS.kind==="test"?"":explainBox(q,false); // before answering: help with the method only (not in a check-up)
}
function press(k){
  if(!MS||MS.state==="right"||MS.state==="shown")return;
  const q=MQ[MS.ids[MS.i]];
  if(k==="⌫")MS.input=MS.input.slice(0,-1);
  else if(MS.input.length<14){
    if(k==="space")k=" ";
    if(k==="−"&&q.k==="n"&&MS.input)return;
    MS.input+=k;
  }
  if(MS.state==="retry")MS.state="ask2";
  renderMQ();
}
/* A wild guess (keys tapped at random, e.g. 3333 or 55255, or a wrong number typed within 4 seconds) is not
   accepted: the child is asked to work it out, the first steps are shown, and Check waits a few seconds.
   Guesses are counted per day in book.maths.log["gs:<date>"] for the parent page. */
function looksLikeGuess(q,v){
  if(q.k==="c")return false; const d=String(v).replace(/[^\d]/g,""), a=String(q.a).replace(/[^\d]/g,"");
  if(/^(\d)\1{2,}$/.test(d)&&!/^(\d)\1{2,}$/.test(a))return true;            // 222, 3333
  if(/(\d\d)\1/.test(d)&&d.length>=4&&!a.includes(d.slice(0,2)))return true;   // 5252…
  if(Date.now()-(MS.t0||0)<4000&&String(v).length>0)return true;                  // no time to think
  if(q.k==="n"&&a.length>=3&&d.length&&(d.length<=a.length-3||d.length>=a.length+3))return true; // far too short or long
  return false;
}
function answer(q,v){
  const ok=q.k==="c"?v===q.a:checkAns(q,v);
  if(!ok&&looksLikeGuess(q,v)){
    const M=MB(),t=today(),G=M.log["gs:"+t]=M.log["gs:"+t]||{n:0};G.n++;G.u=Date.now();Store.save();
    if(typeof beep==="function")beep(false); MS.input=""; MS.exp=Math.max(MS.exp||0,1); MS.wait=Date.now()+6000;
    if(typeof toast==="function")toast("That looks like a guess. Work it out first: use paper or tap “Stuck?”. 这像是乱猜的，请先算一算。");
    renderMQ(); setTimeout(()=>{if(MS&&MS.wait&&Date.now()>=MS.wait){MS.wait=0;renderMQ();}},6100); return;
  }
  if(MS.kind==="test"){MS.tries=1;record(q,ok,q.k==="c"?q.c[v]:v);nextQ();return;} // a test: one try, marks only at the end
  MS.tries++;
  if(ok){MS.state="right";MS.exp=0;beep(true,false);}
  else if(MS.tries<2){MS.state="retry";beep(false);if(q.k==="c")MS.wrongPick.push(v);else MS.input="";renderMQ();return;}
  else{MS.state="shown";MS.exp=99;beep(false);if(q.k==="c")MS.wrongPick.push(v);}
  record(q,ok,q.k==="c"?q.c[v]:v);
  if(typeof teachTwin==="function")teachTwin(q); // used Help: a similar question comes next
  renderMQ();
}
function record(q,ok,given){
  const hp=!!(MS.helped&&MS.helped[q.id])||!!q.example, real=ok; if(hp&&!q.example)ok=false; // a worked example is not counted either // answered with Help: not counted as right, and it comes back later
  const M=MB(), t=today(), key=q.gen?"p:"+q.gen:q.id, s=M.q[key]||{}; // generated questions keep one record per type
  M.q[key]={n:(s.n||0)+1,r:(s.r||0)+(ok?1:0),ok,last:t,u:Date.now(),...(s.q?{q:s.q}:{}),
    ...(s.wr||!ok?{wr:1}:{}),...(ok&&s.ok===false?{fx:t}:s.fx?{fx:s.fx}:{}),...(s.cf?{cf:s.cf}:ok&&s.fx&&dayDiff(s.fx,t)>=6?{cf:t}:{})}; // wr: once wrong, fx: the day it was put right, cf: still right a week later (spaced check)
  if(q.gen&&!ok){const {id,gen,...keep}=q;M.q["w:"+String(q.id).replace(/^g[a-z]*:/,"")]={n:1,r:0,ok:false,last:t,u:Date.now(),q:keep};} // wrong: keep it for 错题本
  if(!hp){const L=M.log[t]=M.log[t]||{n:0,r:0}; L.n++; if(ok)L.r++;}
  if(MS.xk&&!q.gen){const X=M.log[MS.xk+":"+t]=M.log[MS.xk+":"+t]||{n:0,r:0};X.n++;if(ok)X.r++;X.u=Date.now();} // afternoon sets (must.js)
  if(q.gen&&!hp){const g=q.gen.split("-")[0],G=M.log[g+":"+t]=M.log[g+":"+t]||{n:0,r:0};G.n++;if(ok)G.r++;G.u=Date.now();
    const i=String(q.id).split(":").pop();if(g==="cc"){G.done=[...new Set([...(G.done||[]),i])];}} // per-day counts (must.js)
  if(MS.kind==="day"&&(dayOf(MS.date).ids||[]).includes(q.id)){const d=dayOf(MS.date);d.ans[q.id]={v:String(given).slice(0,20),ok,tries:MS.tries};d.u=Date.now();}
  if(MS.kind==="test"){const d=dayOf(MS.key);d.ans[q.id]={v:String(given).slice(0,20),ok};d.u=Date.now();}
  if(MS.fix){const F=M.log["fx:"+t]=M.log["fx:"+t]||{n:0,r:0};F.n++;if(ok)F.r++;F.left=mistakeIds().length;F.start=Math.max(F.start||0,F.left+(ok?1:0));F.u=Date.now();} // 错题重做 progress (must.js)
  // every answer of the day, for the parent page: the question, the child's answer, the right answer
  try{const H=M.hist[t]=M.hist[t]||[],n=new Date();if(H.length<400)H.push({...(MS.helped&&MS.helped[q.id]?{h:1}:{}),q:String(q.q||"").slice(0,240),a:String(showAns(q)).slice(0,40),v:String(given==null?"":given).slice(0,40),ok:real,t:String(q.t||"").slice(0,40),...(ok?{}:{w:String(q.w||(q.steps||[]).join(" ")||"").slice(0,320)}),
    s:MS.kind==="day"?"Daily 20":MS.kind==="test"?"Test":MS.fix?"Fix mistakes":String(MS.topic||"Practice").slice(0,40),tr:MS.tries||1,f:q.fig?1:0,tm:String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0")});}catch(e){}
  MS.res[q.id]=ok; Store.save();
}
function nextQ(){MS.i++;MS.exp=0;MS.tries=0;MS.input="";MS.state="ask";MS.wrongPick=[];renderMQ();window.scrollTo(0,0);$("#mBody").scrollTop=0;}
function renderMResults(){
  if(MS.kind==="test"){renderCheckupReport();return;}
  const ids=MS.ids, right=ids.filter(id=>MS.res[id]).length, n=ids.length, pct=right/n;
  const stars=pct>=.9?3:pct>=.7?2:pct>=.4?1:0;
  if(!MS.cheered){MS.cheered=true;beep(true,true);}
  $("#mBody").innerHTML=`<div class="m-q m-results">
    <div class="stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div>
    <h2>${right} out of ${n} correct</h2>
    <p class="muted">${pct>=.9?"Superb work!":pct>=.7?"Great effort. Check the ones you missed below.":pct>=.4?"Good try. Read through the working for the ones you missed.":"Keep going. Every question you try helps you learn."}${MS.kind==="day"?" Wrong ones are saved in 错题本 to fix.":""}</p>
    <div class="group">${ids.map(id=>{const q=MQ[id],ok=MS.res[id];return `<div class="cell m-row"><div class="badge ${ok?"green":"red"}">${ic(ok?"check":"x")}</div><div class="grow"><div class="ttl">${mt(q.q)}</div>${ok?"":`<div class="sub">Answer: <b>${fracHtml(esc(showAns(q)))}</b></div>`}${resultSteps(q)}</div></div>`;}).join("")}</div>
    ${redoBtn()}
    <button class="btn ${MS.redo.length?"":"primary "}big" id="mDone">Done</button>
  </div>`;
  $("#mDone").onclick=closeMaths; bindRedo();
  zhFill($("#mBody"));
}
document.addEventListener("keydown",e=>{
  if(!MS||$("#maths").hidden||e.metaKey||e.ctrlKey)return;
  const q=MQ[MS.ids[MS.i]]; if(!q)return;
  if(e.key==="Enter"){const b=$("#mNext")||$("#mCheck");if(b&&!b.disabled)b.click();e.preventDefault();return;}
  if(e.key==="Escape"){closeMaths();return;}
  if(q.k==="c"){const i=+e.key-1;if(i>=0&&i<q.c.length){const b=document.querySelector(`[data-opt="${i}"]`);if(b&&!b.disabled)b.click();}return;}
  let k=e.key;
  if(k==="Backspace")k="⌫"; else if(k==="-")k="−"; else if(k===" ")k="space"; else if(q.k==="r")k=k.toUpperCase();
  if(keysFor(q).includes(k)||(q.k==="t"&&/^[\d:,−]$/.test(k))){press(k);e.preventDefault();}
});

/* ---------- 每天做题记录 · every question of a day, for the parent page ----------
   From M.hist (saved since this was added); for older days, rebuilt from the daily 20 and the daily test. */
function histOf(date){
  const M=MB(); if((M.hist[date]||[]).length)return M.hist[date];
  const out=[], add=(d,src)=>{if(!d)return;for(const id of d.ids||[]){const a=(d.ans||{})[id],q=MQ[id];if(!a||!q)continue;
    out.push({q:String(q.q||""),a:String(showAns(q)),v:String(a.v==null?"":a.v),ok:!!a.ok,s:src,tr:a.tries||1,f:q.fig?1:0,tm:""});}};
  add(typeof dailySet==="function"?dailySet(date,false):dayOf(date),"Daily 20");
  if(typeof cuGet==="function")add(cuGet(date),"Test");
  return out;
}
let HIST_DAY=null, HIST_BAD=false, HIST_MON=null;
const H_FULL=60; // days with every answer kept; older days keep only the wrong answers (core.js)
const hMins=d=>Math.round(Object.values((B().time||{})[d]||{}).reduce((s,x)=>s+x,0)/60);
/* a month calendar: every day with its minutes and maths %, tap a day to see everything done that day */
function histCal(sel){
  const t=today(), m=HIST_MON||sel.slice(0,7), first=pdate(m+"-01"), y=first.getFullYear(), mo=first.getMonth(), nd=new Date(y,mo+1,0).getDate(), lead=(first.getDay()+6)%7;
  const ML=(MB().log)||{}, cells=[];
  for(let i=0;i<lead;i++)cells.push(`<span class="hc-e"></span>`);
  for(let k=1;k<=nd;k++){const d=`${m}-${String(k).padStart(2,"0")}`, mi=hMins(d), L=ML[d]||{}, di=((B().eng||{}).diary||{})[d], fut=d>t;
    const lv=fut?"fut":mi>=45?"h3":mi>=20?"h2":mi>0||L.n?"h1":"h0";
    cells.push(`<button class="hc-d ${lv} ${d===sel?"on":""} ${d===t?"today":""}" data-hday="${d}" ${fut?"disabled":""}><b>${k}</b>${!fut&&(mi||L.n)?`<small>${mi?mi+"′":""}${L.n?` ${Math.round((L.r||0)/L.n*100)}%`:""}</small>`:""}${di&&di.done?`<i class="hc-w" title="writing">✎</i>`:""}</button>`);}
  const prevM=dstr(new Date(y,mo-1,1)).slice(0,7), nextM=dstr(new Date(y,mo+1,1)).slice(0,7);
  return `<div class="hcal"><div class="hcal-h"><button class="icon-btn sm" data-hmon="${prevM}" aria-label="Previous month">‹</button><b>${first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</b><button class="icon-btn sm" data-hmon="${nextM}" ${nextM>t.slice(0,7)?"disabled":""} aria-label="Next month">›</button></div>
    <div class="hcal-g">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(w=>`<span class="hc-wd">${w}</span>`).join("")}${cells.join("")}</div>
    <div class="muted tiny">颜色越深学得越久 · 每格：分钟 和 数学正确率 · ✎ = 交了作文/日记</div></div>`;
}
/* everything else done on a day (not only maths) */
function histDay(d){
  const b=B(), E=b.eng||{}, M=MB(), out=[], T=(b.time||{})[d]||{};
  const secs=Object.entries(T).filter(([,s])=>s>=30).sort((x,y)=>y[1]-x[1]);
  if(typeof mustCfg==="function"){try{const items=mustCfg().items, st=items.map(k=>({k,...mustStatus(k,d)})), dn=st.filter(x=>x.done).length;
    out.push(`<div><b>今日必做 Must-do</b> <span class="muted small">${dn}/${st.length} done · ${hMins(d)} min</span><div class="hd-must">${st.map(x=>`<span class="${x.done?"ok":x.p>0?"part":""}" title="${esc(x.sub)}">${x.done?"✓":x.p>0?Math.round(x.p*100)+"%":"–"} ${esc(typeof mustTitle==="function"?mustTitle(x.k):x.k)}</span>`).join("")}</div>
      ${secs.length?`<div class="muted small">Time 时间: ${secs.map(([k,s])=>`${esc(k)} ${Math.round(s/60)} min`).join(" · ")}</div>`:""}</div>`);}catch(e){}}
  const dl=(E.daily||{})[d]; if(dl&&(dl.words||[]).length){const set=new Set(dl.words.map(norm)), ws=Object.values(b.words).filter(w=>set.has(norm(w.w)));
    out.push(`<div><b>New words 新单词</b> <span class="muted small">${dl.words.length}${dl.carried?` · ${dl.carried} carried over from an earlier day 前一天没学完的`:""}</span><div class="hd-words">${dl.words.map(w=>{const o=ws.find(x=>norm(x.w)===norm(w));return `<span class="${o&&o.stage>0?"ok":""}">${esc(w)}${o?`<small>${o.stage>0?"learned":"not yet"}${o.seen?` · ${o.right||0}/${o.seen}`:""}</small>`:""}</span>`;}).join("")}</div></div>`);}
  const wl=(b.log||{})[d]; if(wl&&wl.done)out.push(`<div class="small"><b>Spelling practice 拼写练习</b>: ${wl.right||0}/${wl.done} right</div>`);
  const rd=Object.entries((b.reading||{}).done||{}).filter(([,x])=>x.date===d);
  if(rd.length)out.push(`<div><b>Reading 阅读</b>${rd.map(([id,x])=>{const r=typeof READINGS!=="undefined"&&READINGS.find(y=>y.id===id);
    return `<details class="hd-read"><summary>${esc(x.title||(r&&r.title)||id)}${x.kind?` <span class="muted small">${esc(x.kind)}</span>`:""} · <b>${x.score}/${x.n}</b></summary>${r&&r.questions&&x.answers?`<ol class="small">${r.questions.map((q,i)=>{const ok=x.answers[i];return `<li><span class="${ok?"hist-right":"hist-wrong"}">${ok?"✓":ok===false?"✗":"–"}</span> ${esc(q.q)}${ok?"":`<br><span class="muted">Correct answer 正确答案:</span> <b>${esc(q.o?q.o[q.a]:String(q.a))}</b>${q.why?` <span class="muted">(${esc(q.why)})</span>`:""}`}${q.skill?` <span class="hist-t">${esc(q.skill)}</span>`:""}</li>`;}).join("")}</ol>`:`<div class="muted small">Answers not saved for this one.</div>`}</details>`;}).join("")}</div>`);
  const di=(E.diary||{})[d]; if(di&&di.text)out.push(`<details class="hd-read"><summary><b>Writing 作文/日记</b> · ${wordsOfText(di.text).length} words${di.kind&&di.kind!=="diary"?` · ${esc(di.kind)}`:""}${di.done?"":" · not handed in"}${di.ai?` · <b>AI ${di.ai.score}/10</b>`:""}${(di.fix||[]).length?` · ${(di.fix||[]).length} spelling mistakes`:""}</summary>
    <p class="dv-text">${typeof diaryMarked==="function"?diaryMarked(di.text,di.fix||[]):esc(di.text)}</p>${di.ai?`<div class="small">${esc(di.ai.praise_zh||di.ai.praise_en||"")}${(di.ai.improve||[]).map(x=>`<div>· ${esc(x.zh||x.en)}</div>`).join("")}</div>`:""}</details>`);
  const fl=M.log["fl:"+d], uc=M.log["uc:"+d], hp=M.log["hp:"+d];
  if(fl&&fl.n)out.push(`<div class="small"><b>Formulas 公式四步</b>: ${fl.r}/${fl.n} right first time${fl.done?" · all done ✓":""}${(fl.items||[]).length?` · ${fl.items.map(x=>esc((typeof FM_BY!=="undefined"&&FM_BY[x.k]?FM_BY[x.k].f:x.k))+` (step ${x.step})`).join(", ")}`:""}</div>`);
  if(uc&&uc.n)out.push(`<div class="small"><b>Units 单位换算</b>: ${uc.r}/${uc.n} right first time${uc.done?" · all done ✓":""}</div>`);
  if(hp&&hp.n)out.push(`<div class="small"><b>Help used 用了帮助</b>: ${hp.n} time${hp.n>1?"s":""} (those answers do not count)</div>`);
  return out.length?`<div class="hd">${out.join("")}</div>`:"";
}
function histBlock(){
  const t=today(), d=HIST_DAY||t, ML=(MB().log||{})[d]||{}, old=d<addDays(t,-H_FULL);
  const byQ=histOf.byQ||(histOf.byQ=Object.fromEntries(Object.values(MQ).map(q=>[String(q.q||"").slice(0,240),q])));
  const all=histOf(d).map(x=>{const q=byQ[x.q];return {...x,t:x.t||(q&&q.t)||"",w:x.w||(!x.ok&&q?String(q.w||(q.steps||[]).join(" ")).slice(0,320):"")};}),
    list=HIST_BAD?all.filter(x=>!x.ok):all, right=all.filter(x=>x.ok).length;
  const tp={}; all.forEach(x=>{const k=x.t||x.s;const o=tp[k]=tp[k]||{n:0,r:0};o.n++;if(x.ok)o.r++;});
  const E=(B().eng||{}), pl=(E.plog||{})[d]||{}, mk=pl.mk||[], di=(E.diary||{})[d];
  const by={}; list.forEach(x=>(by[x.s]=by[x.s]||[]).push(x));
  const nm=x=>x===t?"今天 Today":x===addDays(t,-1)?"昨天 Yesterday":x===addDays(t,-2)?"前天":shortDate(x);
  return `<div class="card stack" id="hist">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">每天做题记录 · Every question, every day</h3>
      <span class="muted small">${ML.n?`Maths ${ML.r||0} / ${ML.n} right (${Math.round((ML.r||0)/ML.n*100)}%)`:all.length?`${right} / ${all.length} right`:"Nothing answered"}</span></div>
    <div class="hnav"><button class="btn sm" data-hday="${addDays(d,-1)}">‹ Previous day 前一天</button><input type="date" id="histDate" value="${d}" max="${t}"><button class="btn sm" data-hday="${addDays(d,1)}" ${d>=t?"disabled":""}>Next day 后一天 ›</button>${d!==t?`<button class="btn sm" data-hday="${t}">Today 今天</button>`:""}</div>
    ${histCal(d)}
    <h4 style="margin:4px 0 0">${esc(niceDate(d))} · ${esc(nm(d))}</h4>
    ${histDay(d)}
    ${old?`<div class="notice">这一天比较久了：只保存了做错的题（每天的总数和正确率一直保存）。 Older than ${H_FULL} days: only the wrong answers are kept.</div>`:""}
    ${all.length?`<div><div class="muted small" style="margin-bottom:4px"><b>By topic 按题型</b> (weakest first 最弱的在前)</div><div class="hist-topics">${Object.entries(tp).sort((a,b)=>a[1].r/a[1].n-b[1].r/b[1].n).map(([k,o])=>`<span class="${o.r/o.n<.7?"bad":"ok"}">${esc(k)} <b>${o.r}/${o.n}</b></span>`).join("")}</div></div>`:""}
    ${mk.length||pl.n||pl.cn||di?`<div class="hist-eng"><b>English this day 英语</b>
      ${pl.n||pl.sn||pl.cn||pl.bn?`<div class="muted small">Phonics 拼读: ${[pl.cn?`sounds ${pl.cr||0}/${pl.cn}`:"",pl.bn?`build ${pl.br||0}/${pl.bn}`:"",pl.n?`letters ${pl.r||0}/${pl.n}`:"",pl.sn?`spell ${pl.sr||0}/${pl.sn}`:""].filter(Boolean).join(" · ")}</div>`:""}
      ${mk.length?`<div class="small">Spelling mistakes 拼写错误 (${mk.length}): ${mk.map(m=>`<span class="hist-mk2" title="${esc(m.k)}"><s>${esc(m.v||"—")}</s> → <b>${esc(m.w)}</b> <span class="muted tiny">${esc(m.k)}</span></span>`).join(" ")}</div>`:""}
      ${di&&di.text?`<div class="small">Diary 日记: ${wordsOfText(di.text).length} words${di.done?` · ${(di.fix||[]).length} spelling mistakes`:" · not handed in"}${di.ai?` · <b>AI score ${di.ai.score}/10</b>`:""} <span class="muted">(full text in the Diary section below 日记全文在下面)</span></div>`:""}</div>`:""}
    <label class="row" style="gap:6px"><input type="checkbox" id="histBad" ${HIST_BAD?"checked":""}> 只看做错的 · Only the wrong ones</label>
    ${list.length?Object.entries(by).map(([s,xs])=>`<div><div class="muted small" style="margin:6px 0 4px"><b>${esc(s)}</b> · ${xs.filter(x=>x.ok).length}/${xs.length} right</div>
      <div class="hist-list">${xs.map(x=>`<div class="hist-row ${x.ok?"ok":"bad"}"><span class="hist-mk">${x.ok?"✓":"✗"}</span>${x.h?`<span class="tag" title="用了 Help 老师讲解">Help</span>`:""}
        <div class="grow"><div>${mt(x.q)}${x.f?` <span class="muted tiny">(with a picture)</span>`:""}</div>
        <div class="small">Answer given · 孩子的答案: <b class="${x.ok?"":"hist-wrong"}">${x.v?fracHtml(esc(x.v)):"(blank)"}</b>${x.ok?(x.tr>1?` <span class="muted">· right on the 2nd try</span>`:""):` · Correct · 正确答案: <b class="hist-right">${fracHtml(esc(x.a))}</b>`}${x.t?` <span class="hist-t">${esc(x.t)}</span>`:""}</div>
        ${!x.ok&&x.w?`<details class="hist-why"><summary>Why / how to do it 为什么错、怎么做</summary><div class="small">${mt(x.w)}</div></details>`:""}</div>
        <span class="muted tiny">${esc(x.tm||"")}</span></div>`).join("")}</div></div>`).join("")
      :`<div class="muted small">${all.length?"No wrong answers on this day. 这天没有做错的题。":"No questions answered on this day. 这天没有做题。"}</div>`}
  </div>`;
}
function histBind(){
  const hd=document.getElementById("histDate"); if(hd)hd.onchange=()=>{if(!hd.value)return;HIST_DAY=hd.value>today()?today():hd.value;HIST_MON=null;render();setTimeout(()=>{const h=document.getElementById("hist");if(h)h.scrollIntoView({block:"start"});},50);};
  document.querySelectorAll("[data-hmon]").forEach(b=>b.onclick=()=>{HIST_MON=b.dataset.hmon;render();setTimeout(()=>{const h=document.getElementById("hist");if(h)h.scrollIntoView({block:"start"});},50);});
  document.querySelectorAll("[data-hday]").forEach(b=>b.onclick=()=>{HIST_DAY=b.dataset.hday;HIST_MON=null;render();setTimeout(()=>{const h=document.getElementById("hist");if(h)h.scrollIntoView({block:"start"});},50);});
  const hb=document.getElementById("histBad"); if(hb)hb.onchange=()=>{HIST_BAD=hb.checked;render();};
}
