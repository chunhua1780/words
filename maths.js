/* ================= Maths: UK Year 5 (National Curriculum for England) =================
   The question bank (MATHS, MATHS_TOPICS) comes from maths-bank.js, built by tools/build_maths.py.
   Progress lives in book.maths: q (per question), days (the daily 20), log (answered per day). */
const MDAY=20, MTOPIC=10;
const MQ=Object.fromEntries(MATHS.map(q=>[q.id,q]));
const TI=t=>MATHS_TOPICS.indexOf(t);
const TCOL=["blue","teal","purple","pink","orange","green"];
const topicColor=t=>`var(--c-${TCOL[TI(t)%TCOL.length]})`;
const TOPIC_COUNT={}; MATHS.forEach(q=>TOPIC_COUNT[q.t]=(TOPIC_COUNT[q.t]||0)+1);

function MB(){const b=B();b.maths=b.maths||{};b.maths.q=b.maths.q||{};b.maths.days=b.maths.days||{};b.maths.log=b.maths.log||{};return b.maths;}
function seedRand(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

/* Today's 20: up to 5 questions answered wrongly before, then new questions spread across all topics */
function dailySet(date,create=true){
  const M=MB(); if(M.days[date]&&(M.days[date].ids||[]).length)return M.days[date];
  if(!create)return null;
  const rnd=seedRand((Store.user||"")+"|"+date), st=M.q;
  const retry=Object.entries(st).filter(([id,s])=>MQ[id]&&s.ok===false&&(s.last||"")<date).sort((a,b)=>(a[1].last||"")<(b[1].last||"")?-1:1).slice(0,5).map(x=>x[0]);
  const byT={}; for(const q of MATHS)if(!st[q.id]&&!retry.includes(q.id))(byT[q.t]=byT[q.t]||[]).push(q.id);
  const need=MDAY-retry.length, picked=[], cnt={};
  for(let g=0;picked.length<need&&g<400;g++){
    const ts=Object.keys(byT).filter(t=>byT[t].length&&(cnt[t]||0)<3); if(!ts.length)break;
    let r=rnd()*ts.reduce((s,t)=>s+byT[t].length,0), t=ts[ts.length-1];
    for(const x of ts){r-=byT[x].length;if(r<0){t=x;break;}}
    picked.push(byT[t].splice(Math.floor(rnd()*byT[t].length),1)[0]); cnt[t]=(cnt[t]||0)+1;
  }
  if(picked.length<need){ // the whole bank has been seen: bring back the oldest ones
    const old=Object.entries(st).filter(([id])=>MQ[id]&&!retry.includes(id)).sort((a,b)=>(a[1].last||"")<(b[1].last||"")?-1:1);
    for(const [id] of old){if(picked.length>=need)break;picked.push(id);}
  }
  const ids=[...retry,...picked].sort((a,b)=>TI(MQ[a].t)-TI(MQ[b].t)||(a<b?-1:1));
  M.days[date]={ids,ans:{},u:Date.now()}; Store.save();
  return M.days[date];
}
// Take one question of each kind in turn, so a set of 10 mixes the kinds instead of repeating one
function mixKinds(ids){
  const g={}; for(const id of ids)(g[MQ[id].o]=g[MQ[id].o]||[]).push(id);
  const ks=shuffle(Object.keys(g)), out=[];
  for(let i=0;out.length<ids.length;i++)for(const k of ks)if(g[k][i])out.push(g[k][i]);
  return out;
}
function topicSet(t){
  const st=MB().q, all=MATHS.filter(q=>q.t===t).map(q=>q.id);
  const fresh=mixKinds(shuffle(all.filter(id=>!st[id]))), wrong=shuffle(all.filter(id=>st[id]&&st[id].ok===false)),
    old=all.filter(id=>st[id]&&st[id].ok!==false).sort((a,b)=>(st[a].last||"")<(st[b].last||"")?-1:1);
  return [...wrong.slice(0,3),...fresh,...old].slice(0,MTOPIC);
}
function topicStats(){
  const st=MB().q, out={};
  for(const t of MATHS_TOPICS)out[t]={seen:0,n:0,r:0,total:TOPIC_COUNT[t]};
  for(const [id,s] of Object.entries(st)){const q=MQ[id];if(!q)continue;const o=out[q.t];o.seen++;o.n+=s.n||0;o.r+=s.r||0;}
  return out;
}
const dayScore=d=>{const a=Object.values(d.ans||{});return {done:a.length,right:a.filter(x=>x.ok).length,n:(d.ids||[]).length};};

/* ---------- answers ---------- */
const MINUS=/[−–—]/g;
const mt=s=>esc(s).replace(/(^|[\s(,:])-(\d)/g,"$1−$2");
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
function sayMaths(text){
  say(text.replace(/×/g," times ").replace(/÷/g," divided by ").replace(/−/g," minus ").replace(/²/g," squared").replace(/³/g," cubed")
    .replace(/(\d)\/(\d+)/g,"$1 over $2").replace(/\?/g," what ").replace(/…/g,"."));
}

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
  const total=Object.values(M.log).reduce((s,x)=>s+(x.n||0),0), right=Object.values(M.log).reduce((s,x)=>s+(x.r||0),0);
  const seen=Object.keys(M.q).length;
  return `<div class="stack">
    <div class="page-head"><div><div class="eyebrow">Maths · Year 5</div><h1>Daily maths</h1></div></div>
    <div class="card maths-hero">
      <div class="stack" style="gap:12px">
        <div class="muted">${MDAY} questions every day from the Year 5 curriculum. Work them out on paper if you need to, then type or tap your answer. You get two tries.</div>
        <div class="row" style="gap:14px">${week.map(w=>{const x=M.days[w],s=x?dayScore(x):null;return `<div class="wk"><div class="ring" style="--p:${s?s.done/s.n*100:0}"><span>${s&&s.done?s.right:""}</span></div><div class="muted">${w===t?"Today":WEEK[pdate(w).getDay()]}</div></div>`;}).join("")}</div>
        <div class="row"><button class="btn primary big" data-maths="day">${ic("maths")}${sc.done===0?"Start today’s 20":sc.done<sc.n?`Continue · ${sc.n-sc.done} left`:"See today’s results"}</button>
          ${sc.done===sc.n?`<span class="muted">${sc.right}/${sc.n} correct today</span>`:""}</div>
      </div>
      <div class="hero-num"><b>${sc.done}<small>/${sc.n}</small></b><span class="muted small">answered today</span></div>
    </div>
    <div class="kpis">
      <div class="kpi"><b>${total}</b><span>questions answered</span></div>
      <div class="kpi"><b>${total?Math.round(right/total*100)+"%":"–"}</b><span>correct</span></div>
      <div class="kpi"><b>${seen}<small>/${MATHS.length}</small></b><span>of the question bank</span></div>
    </div>
    <div class="section-title"><h3 style="margin:0">Practise a topic</h3><span class="muted small">${MTOPIC} questions at a time</span></div>
    <div class="topics">${MATHS_TOPICS.map(t=>{const s=ts[t];return `<button class="topic" data-maths="topic" data-topic="${esc(t)}" style="--tc:${topicColor(t)}">
      <b>${esc(t)}</b><span class="muted small">${s.n?`${Math.round(s.r/s.n*100)}% correct · `:""}${s.seen} of ${s.total} done</span>
      <span class="bar"><i style="width:${s.seen/s.total*100}%"></i></span></button>`;}).join("")}</div>
  </div>`;
}
function bindMaths(){
  document.querySelectorAll("#view [data-maths]").forEach(b=>b.onclick=()=>{
    if(b.dataset.maths==="day"){const d=dailySet(today());openMaths({kind:"day",date:today(),ids:d.ids});}
    else openMaths({kind:"topic",topic:b.dataset.topic,ids:topicSet(b.dataset.topic)});
  });
}

/* ---------- the question screen ---------- */
let MS=null;
function openMaths(o){
  MS={...o,i:0,tries:0,input:"",state:"ask",res:{},wrongPick:[]};
  if(o.kind==="day"){const d=MB().days[o.date];Object.entries(d.ans||{}).forEach(([id,a])=>MS.res[id]=a.ok);
    const first=o.ids.findIndex(id=>!(id in d.ans)); MS.i=first<0?o.ids.length:first;}
  window.__busy=true; $("#maths").hidden=false; document.body.style.overflow="hidden";
  $("#mLabel").textContent=o.kind==="day"?`Daily maths · ${shortDate(o.date)}`:o.topic;
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
  $("#mProg").style.width=(Math.min(MS.i,n)/n*100)+"%";
  if(MS.i>=n){renderMResults();return;}
  const q=MQ[MS.ids[MS.i]], st=MS.state, done=st==="right"||st==="shown";
  $("#maths").style.setProperty("--tc",topicColor(q.t));
  const unit=q.u&&q.k==="n"?q.u:"", pre=unit==="£"?"£":"", post=unit&&unit!=="£"?unit:"";
  body.innerHTML=`<div class="m-q">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:${topicColor(q.t)}">${esc(q.t)}</span><span class="muted small">Question ${MS.i+1} of ${n}</span></div>
    <div class="m-text">${mt(q.q)} <button class="icon-btn sm" id="mSay" aria-label="Read the question">${ic("speaker")}</button></div>
    ${mFig(q.f)}
    ${q.k==="c"?`<div class="m-opts">${q.c.map((c,i)=>`<button class="opt-btn m-opt ${done&&i===q.a?"right":""} ${MS.wrongPick.includes(i)?"wrong":""}" data-opt="${i}" ${done||MS.wrongPick.includes(i)?"disabled":""}>${esc(c)}</button>`).join("")}</div>`
    :`<div class="m-answer ${st}"><span class="pre">${pre}</span><span class="val">${esc(q.k==="n"?MS.input.replace(/^(−?)(\d{4,})/,(m,s,d)=>s+(+d).toLocaleString("en-GB")):MS.input)}${done?"":`<i class="caret"></i>`}</span><span class="post">${esc(post)}</span></div>
      ${done?"":`<div class="keypad ${q.k}">${keysFor(q).map(k=>`<button data-key="${k}" class="${k==="⌫"?"del":k==="space"?"sp":""}">${k==="⌫"?ic("back"):k==="space"?"space":k}</button>`).join("")}</div>
      <button class="btn primary big" id="mCheck" ${MS.input.trim()?"":"disabled"}>Check</button>`}`}
    <div class="m-feedback">${feedback(q)}</div>
  </div>`;
  $("#mSay").onclick=()=>sayMaths(q.q);
  body.querySelectorAll("[data-opt]").forEach(b=>b.onclick=()=>answer(q,+b.dataset.opt));
  body.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>press(b.dataset.key));
  const c=$("#mCheck"); if(c)c.onclick=()=>answer(q,MS.input);
  const nx=$("#mNext"); if(nx){nx.onclick=nextQ;nx.focus({preventScroll:true});}
}
function feedback(q){
  const st=MS.state;
  if(st==="retry")return `<div class="mfb warn">${ic("x")}<div><b>Not quite. Have another go.</b><span>Read the question again carefully.</span></div></div>`;
  if(st==="right")return `<div class="mfb ok">${ic("check")}<div><b>${MS.tries>1?"Correct on your second try!":"Correct!"}</b><span>${mt(q.w)}</span></div></div><button class="btn primary big" id="mNext">${MS.i+1<MS.ids.length?"Next question":"See results"}</button>`;
  if(st==="shown")return `<div class="mfb bad">${ic("x")}<div><b>The answer is ${esc(showAns(q))}</b><span>${mt(q.w)}</span></div></div><button class="btn primary big" id="mNext">${MS.i+1<MS.ids.length?"Next question":"See results"}</button>`;
  return "";
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
function answer(q,v){
  const ok=q.k==="c"?v===q.a:checkAns(q,v);
  MS.tries++;
  if(ok){MS.state="right";beep(true,false);}
  else if(MS.tries<2){MS.state="retry";beep(false);if(q.k==="c")MS.wrongPick.push(v);else MS.input="";renderMQ();return;}
  else{MS.state="shown";beep(false);if(q.k==="c")MS.wrongPick.push(v);}
  record(q,ok,q.k==="c"?q.c[v]:v);
  renderMQ();
}
function record(q,ok,given){
  const M=MB(), t=today(), s=M.q[q.id]||{};
  M.q[q.id]={n:(s.n||0)+1,r:(s.r||0)+(ok?1:0),ok,last:t,u:Date.now()};
  const L=M.log[t]=M.log[t]||{n:0,r:0}; L.n++; if(ok)L.r++;
  if(MS.kind==="day"){const d=M.days[MS.date];d.ans[q.id]={v:String(given).slice(0,20),ok,tries:MS.tries};d.u=Date.now();}
  MS.res[q.id]=ok; Store.save();
}
function nextQ(){MS.i++;MS.tries=0;MS.input="";MS.state="ask";MS.wrongPick=[];renderMQ();window.scrollTo(0,0);$("#mBody").scrollTop=0;}
function renderMResults(){
  const ids=MS.ids, right=ids.filter(id=>MS.res[id]).length, n=ids.length, pct=right/n;
  const stars=pct>=.9?3:pct>=.7?2:pct>=.4?1:0;
  if(!MS.cheered){MS.cheered=true;beep(true,true);}
  $("#mBody").innerHTML=`<div class="m-q m-results">
    <div class="stars">${"★".repeat(stars)}${"☆".repeat(3-stars)}</div>
    <h2>${right} out of ${n} correct</h2>
    <p class="muted">${pct>=.9?"Superb work!":pct>=.7?"Great effort. Check the ones you missed below.":pct>=.4?"Good try. Read through the working for the ones you missed.":"Keep going. Every question you try helps you learn."}${MS.kind==="day"?" Questions you got wrong will come back on another day.":""}</p>
    <div class="group">${ids.map(id=>{const q=MQ[id],ok=MS.res[id];return `<div class="cell m-row"><div class="badge ${ok?"green":"red"}">${ic(ok?"check":"x")}</div><div class="grow"><div class="ttl">${mt(q.q)}</div>${ok?"":`<div class="sub">Answer: <b>${esc(showAns(q))}</b> · ${mt(q.w)}</div>`}</div></div>`;}).join("")}</div>
    <button class="btn primary big" id="mDone">Done</button>
  </div>`;
  $("#mDone").onclick=closeMaths;
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
