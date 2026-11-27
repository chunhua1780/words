/* ================= 20以内加减 · Adding and taking away within 20, from memory (no fingers) =================
   Year 5 site. The facts are learned strategy by strategy, each shown on ten-frames (dots in rows of 5 and 10),
   so the answer comes from a picture in her head instead of counting on fingers:
     1 Pairs to 10 (7 + 3, 10 − 4)   2 Doubles (6 + 6, 14 − 7)   3 Ten and some more (10 + 6, 16 − 6, 16 − 10)
     4 Near doubles (6 + 7)          5 Make 10 (8 + 5 → 8 + 2 + 3)   6 Back to 10 (13 − 5 → 13 − 3 − 2)
     7 Think addition (12 − 8: 8 + ? = 12)   8 Everything mixed, fast
   Each day: the strategy is shown with a short cartoon and a recorded voice the first time, then 25 typed answers:
   most from the strategy being learned, some review of earlier ones. An answer counts as "quick" when it is right
   within 3 seconds (no time to count). A slow or wrong one shows the ten-frame picture and the tip, and comes back
   3 questions later. A strategy is passed when 85% of its facts have been quick twice in a row; then the next one starts.
   Facts share their records with Quick facts (book.maths.q["f:…"]); the day is book.maths.log["a20:<date>"],
   the strategy reached book.maths.log["a20lv"]. */
const A20_FAST=3000, A20_N=25;
const A20_G=[
  {k:"b10",name:"Pairs to 10",zh:"凑十",tip:"Two numbers that make 10. See the empty spaces in the ten-frame.",
    facts:()=>[...fRange(1,9).map(a=>mkAdd([a,10-a])),...fRange(1,9).map(a=>mkSub([10-a,a]))]},
  {k:"dbl",name:"Doubles",zh:"双数（相同的数相加）",tip:"The same number twice. Doubles are easy to remember.",
    facts:()=>[...fRange(1,10).map(a=>mkAdd([a,a])),...fRange(1,10).map(a=>mkSub([a,a]))]},
  {k:"t10",name:"Ten and some more",zh:"十加几、十几减几",tip:"Ten and some more: 10 + 6 is sixteen. The ones stay the same.",
    facts:()=>[...fRange(1,9).map(a=>mkAdd([10,a])),...fRange(1,9).map(a=>mkAdd([a,10])),...fRange(1,9).map(a=>mkSub([10,a])),...fRange(1,9).map(a=>mkSub([a,10]))]},
  {k:"near",name:"Near doubles",zh:"接近双数",tip:"Use the double, then one more: 6 + 7 is 6 + 6, and 1 more.",
    facts:()=>[...fRange(1,9).map(a=>mkAdd([a,a+1])),...fRange(1,9).map(a=>mkAdd([a+1,a])),...fRange(1,9).map(a=>mkSub([a+1,a]))]},
  {k:"m10",name:"Make 10",zh:"凑十法",tip:"Fill up to 10 first, then add the rest: 8 + 5 is 8 + 2 = 10, then 3 more = 13.",
    facts:()=>fGrid(2,9,(a,b)=>a+b>10&&Math.abs(a-b)>1).map(mkAdd)},
  {k:"bk10",name:"Back to 10",zh:"破十法（先减到10）",tip:"Take away down to 10 first, then the rest: 13 − 5 is 13 − 3 = 10, then 2 more = 8.",
    facts:()=>fGrid(2,9,(a,b)=>a+b>10).map(mkSub)},
  {k:"fam",name:"Think addition",zh:"想加算减",tip:"Taking away is adding backwards: 12 − 8 → 8 + what = 12? 4.",
    facts:()=>fGrid(1,9,(a,b)=>a+b<=10&&a+b!==10).map(mkSub)},
  {k:"all",name:"Everything, fast",zh:"全部混合，越快越好",tip:"All of them mixed. Answer from memory, quickly.",
    facts:()=>[...fGrid(1,10).map(mkAdd),...fGrid(1,10).map(mkSub)]},
];
A20_G.forEach(g=>{const seen=new Set();g.list=g.facts().filter(f=>!seen.has(f.id)&&seen.add(f.id));});
/* the cartoon for each strategy: [voice line, ten-frame picture] — the lines are recorded (audio/a20/<k>-<n>.mp3) */
const A20_INTRO={
  b10:[["These are ten-frames. Each one has room for ten dots, in two rows of five.",{a:7,b:0}],["Here are 7 red dots. How many more make 10? Look at the empty spaces: 3.",{a:7,b:3}],["So 7 plus 3 is 10, and 10 take away 3 is 7. These are pairs to 10. Learn them by heart!",{a:7,b:3,txt:"7 + 3 = 10"}]],
  dbl:[["Doubles mean the same number twice.",{a:6,b:0,c:6}],["6 and 6. Two rows the same make 12.",{a:6,b:0,c:6,txt:"6 + 6 = 12"}],["So 12 take away 6 is 6. Doubles are easy to remember, so learn them first.",{a:6,b:0,c:6,txt:"12 − 6 = 6"}]],
  t10:[["Here is a full ten-frame. That is 10.",{a:10,b:0}],["Add 6 more. 10 and 6 is sixteen. The 6 stays the same!",{a:10,b:0,c:6,txt:"10 + 6 = 16"}],["And 16 take away 6 is 10. 16 take away 10 is 6.",{a:10,b:0,c:6,txt:"16 − 6 = 10"}]],
  near:[["Near doubles are next to each other, like 6 and 7.",{a:6,b:0,c:7}],["Think of the double: 6 plus 6 is 12.",{a:6,b:0,c:6,txt:"6 + 6 = 12"}],["7 is one more than 6, so 6 plus 7 is one more: 13.",{a:6,b:0,c:7,txt:"6 + 7 = 13"}]],
  m10:[["8 plus 5. Don't count on your fingers! Make 10 first.",{a:8,b:0,c:5}],["8 needs 2 more to make 10. Move 2 dots across.",{a:8,b:2,c:3}],["Now we have 10 and 3 more. That is 13. So 8 plus 5 is 13.",{a:8,b:2,c:3,txt:"8 + 5 = 13"}]],
  bk10:[["13 take away 5. Go back to 10 first.",{a:10,b:0,c:3}],["Take away the 3 to get to 10. We still need to take away 2 more.",{a:10,b:0,c:3,x:3}],["10 take away 2 is 8. So 13 take away 5 is 8.",{a:10,b:0,c:3,x:3,xa:2,txt:"13 − 5 = 8"}]],
  fam:[["Taking away is adding backwards.",{a:8,b:0,c:4}],["12 take away 8. Think: 8 plus what makes 12?",{a:8,b:2,c:2}],["8 plus 4 is 12, so 12 take away 8 is 4. Facts come in families!",{a:8,b:2,c:2,txt:"8 + 4 = 12 → 12 − 8 = 4"}]],
  all:[["Now all the facts are mixed. You know the tricks: pairs to 10, doubles, make 10, and back to 10.",{a:10,b:0,c:10}],["Try to answer straight away, from memory. Quick answers turn green!",{a:10,b:0,c:10}]],
};
const a20Lv=()=>{const l=(MB().log||{}).a20lv;return l&&l.g!=null?l.g:0;};
const a20Rec=id=>MB().q[id]||null;
const a20Known=f=>{const s=a20Rec(f.id);return !!s&&(s.st||0)>=2&&(s.ms||9e9)<=A20_FAST+500;};
const a20Pct=g=>Math.round(A20_G[g].list.filter(a20Known).length/A20_G[g].list.length*100);
const a20Log=(t=today())=>MB().log["a20:"+t]||null;
function a20Status(t=today()){const L=a20Log(t)||{n:0,r:0,q:0};const g=a20Lv();
  return {done:(L.n||0)>=A20_N,p:Math.min(1,(L.n||0)/A20_N),sub:`${Math.min(A20_N,L.n||0)} of ${A20_N} · ${A20_G[g].name} ${a20Pct(g)}%${L.n?` · ${L.q||0} quick`:""}`,acc:L.n?{r:L.r||0,n:L.n}:null};}

/* the day's questions */
function a20Pick(){
  const g=a20Lv(), cur=A20_G[g].list, st=MB().q, earlier=A20_G.slice(0,g).flatMap(x=>x.list);
  const need=(fs,n)=>{const miss=fs.filter(f=>st[f.id]&&st[f.id].ok===false), slow=fs.filter(f=>st[f.id]&&!a20Known(f)&&st[f.id].ok!==false).sort((a,b)=>(st[b.id].ms||0)-(st[a.id].ms||0)), fresh=shuffle(fs.filter(f=>!st[f.id])), known=shuffle(fs.filter(a20Known));
    return [...shuffle(miss),...slow,...fresh,...known].slice(0,n);};
  const out=[...need(cur,g===7?A20_N:17)];
  if(earlier.length)out.push(...need(earlier,A20_N-out.length));
  while(out.length<A20_N)out.push(cur[Math.floor(Math.random()*cur.length)]);
  return shuffle(out.slice(0,A20_N));
}

/* ten-frames */
function a20Frame(o){
  const cell=(i,cls)=>{const x=10+(i%5)*30,y=10+Math.floor(i/5)*30;return `<rect x="${x}" y="${y}" width="28" height="28" rx="5" class="tf-c"/>${cls?`<circle cx="${x+14}" cy="${y+14}" r="10" class="${cls}" style="--d:${i*.05}s"/>`:""}`;};
  const frame=(fill,dx)=>`<g transform="translate(${dx},0)"><rect x="6" y="6" width="158" height="68" rx="9" class="tf-box"/>${fill.map((c,i)=>cell(i,c)).join("")}</g>`;
  const a=o.a||0,b=o.b||0,c=o.c||0,x=o.x||0,xa=o.xa||0;
  const f1=[...Array(10)].map((_,i)=>i<a?(i>=a-xa?"tf-r tf-x":"tf-r"):i<a+b?"tf-b tf-move":"");
  const two=c||o.c===0&&false;
  const f2=[...Array(10)].map((_,i)=>i<c?(i>=c-x?"tf-b tf-x":"tf-b"):"");
  return `<svg class="tf-svg" viewBox="0 0 ${two?340:170} 80">${frame(f1,0)}${two?frame(f2,170):""}</svg>${o.txt?`<div class="tf-txt">${esc(o.txt)}</div>`:""}`;
}
/* a picture for one fact: how to see it */
function a20Pic(f){
  const {op,x,y,ans}=f;
  if(op==="+"){const [big,sm]=x>=y?[x,y]:[y,x];
    if(ans<=10)return a20Frame({a:big,b:sm});
    if(big===10)return a20Frame({a:10,c:sm});
    const need=10-big;return a20Frame({a:big,b:need,c:sm-need,txt:`${big} + ${need} = 10, then ${sm-need} more = ${ans}`});}
  const c=x+y;
  if(c<=10)return a20Frame({a:c,xa:y,txt:`${c} − ${y} = ${ans}`});
  const ones=c-10; if(y===10)return a20Frame({a:10,c:ones,txt:`${c} − 10 = ${ones}`}); if(y===ones)return a20Frame({a:10,c:ones,x:ones,txt:`${c} − ${y} = 10`});
  if(y>ones)return a20Frame({a:10,c:ones,x:ones,xa:y-ones,txt:`${c} − ${ones} = 10, then − ${y-ones} = ${ans}`});
  return a20Frame({a:10,c:ones,x:y,txt:`${c} − ${y} = ${ans}`});
}

/* ---------- the session ---------- */
let A2=null;
function a20El(){let el=document.getElementById("a20Ov");if(el)return el;
  el=document.createElement("section");el.id="a20Ov";el.hidden=true;el.setAttribute("aria-label","Within 20");
  el.innerHTML=`<div class="s-top"><button class="icon-btn" id="a20Close" aria-label="Close">${ic("x")}</button><span class="s-label">+ − within 20 · 20以内加减</span><span class="muted small" id="a20Prog" style="margin-left:auto"></span></div><div class="s-body" id="a20Body"></div>`;
  document.body.appendChild(el);el.querySelector("#a20Close").onclick=closeAdd20;return el;}
function openAdd20(){
  window.__busy=true;a20El().hidden=false;document.body.style.overflow="hidden";
  const g=a20Lv(), seen=(()=>{try{return localStorage.getItem("a20-intro:"+A20_G[g].k);}catch(e){return null;}})();
  A2={g,q:a20Pick(),i:0,input:"",state:"ask",t0:0,again:[],intro:!seen,ii:0};
  a20Show();
}
function closeAdd20(){clearInterval(A2&&A2.tm);if(typeof ctStop==="function")ctStop();window.__busy=false;a20El().hidden=true;document.body.style.overflow="";A2=null;Store.save();if(typeof render==="function")render();}
function a20Audio(k,i,text,done){const a=new Audio(`audio/a20/${k}-${i}.mp3`);let fin=false;const end=()=>{if(!fin){fin=true;done&&done();}};
  a.onended=end;a.onerror=()=>{if(typeof teachSay==="function")teachSay(text,end);else end();};const p=a.play();if(p&&p.catch)p.catch(()=>a.onerror());setTimeout(end,3500+text.length*90);A2.aud=a;}
function a20Show(){
  const body=$("#a20Body"), G=A20_G[A2.g];
  if(A2.intro){const L=A20_INTRO[G.k], [line,pic]=L[A2.ii];
    body.innerHTML=`<div class="m-q fl-q"><span class="kind-tag">${esc(G.name)} · ${esc(G.zh)}</span><div class="a20-stage">${a20Frame(pic)}</div><div class="ct-cap">${esc(line)}</div>
      <div class="row" style="gap:8px;justify-content:space-between"><span class="ct-dots">${L.map((_,j)=>j<=A2.ii?"●":"○").join(" ")}</span><button class="btn primary big" id="a20Go" disabled>${A2.ii<L.length-1?"Next 下一步":"Let's practise! 开始练习"}</button></div></div>`;
    a20Audio(G.k,A2.ii,line,()=>{const b=$("#a20Go");if(b)b.disabled=false;});
    $("#a20Go").onclick=()=>{try{A2.aud&&A2.aud.pause();}catch(e){} if(A2.ii<L.length-1){A2.ii++;}else{A2.intro=false;try{localStorage.setItem("a20-intro:"+G.k,"1");}catch(e){}} a20Show();};
    return;}
  if(A2.i>=A2.q.length)return a20End();
  const f=A2.q[A2.i]; $("#a20Prog").textContent=`${A2.i+1} / ${A2.q.length}`;
  const st=A2.state, done=st!=="ask";
  body.innerHTML=`<div class="m-q a20-q">
    <div class="row" style="justify-content:space-between"><span class="kind-tag">${esc(G.name)} · ${esc(G.zh)}</span><span class="muted small">${a20Pct(A2.g)}% known</span></div>
    <div class="a20-sum">${esc(f.q)} = <span class="a20-ans ${st}">${esc(A2.input||(done?String(f.ans):"?"))}</span></div>
    <div class="a20-clock"><i id="a20Bar"></i></div>
    ${done?`<div class="mfb ${st==="quick"?"ok":st==="slow"?"warn":"bad"}">${ic(st==="wrong"?"x":"check")}<div><b>${st==="quick"?"Quick! From memory. 真快！":st==="slow"?"Right, but slow: try to remember it, not count. 对了，但有点慢":"Not quite: "+esc(f.q)+" = "+f.ans}</b><span>${esc(factTip(f))}</span></div></div>
      ${st!=="quick"?`<div class="a20-stage">${a20Pic(f)}</div>`:""}<button class="btn primary big" id="a20Next">Next</button>`
    :`<div class="keypad n a20-pad">${["7","8","9","4","5","6","1","2","3","⌫","0","✓"].map(k=>`<button data-k="${k}" class="${k==="⌫"?"del":k==="✓"?"ok":""}">${k==="⌫"?ic("back"):k}</button>`).join("")}</div>`}
  </div>`;
  if(done){const nx=$("#a20Next");nx.onclick=a20Next;if(st==="quick")A2.auto=setTimeout(()=>{if(A2&&A2.state==="quick")a20Next();},700);return;}
  if(!A2.t0)A2.t0=Date.now();
  clearInterval(A2.tm);A2.tm=setInterval(()=>{const b=$("#a20Bar");if(!b||!A2)return;const e=Date.now()-A2.t0;b.style.width=Math.max(0,100-e/A20_FAST*100)+"%";b.className=e>A20_FAST?"late":"";},80);
  body.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>a20Key(b.dataset.k));
}
function a20Key(k){
  if(!A2||A2.state!=="ask")return;
  if(k==="⌫")A2.input=A2.input.slice(0,-1); else if(k==="✓"){if(A2.input)return a20Check();} else if(A2.input.length<2)A2.input+=k;
  const f=A2.q[A2.i]; if(A2.input&&String(f.ans).length===A2.input.length&&+A2.input===f.ans)return a20Check(); // right: no need to press ✓
  const el=document.querySelector(".a20-ans");if(el)el.textContent=A2.input||"?";
}
function a20Check(){
  const f=A2.q[A2.i], ms=Date.now()-A2.t0, ok=+A2.input===f.ans, quick=ok&&ms<=A20_FAST; clearInterval(A2.tm);
  if(typeof recordFact==="function"){const M=MB(),s=M.q[f.id]||{};M.q[f.id]={n:(s.n||0)+1,r:(s.r||0)+(ok?1:0),ok,ms:Math.round(ms),st:quick?(s.st||0)+1:0,last:today(),u:Date.now()};}
  const t=today(),L=MB().log["a20:"+t]=MB().log["a20:"+t]||{n:0,r:0,q:0}; if(!f.again){L.n++;if(ok)L.r++;if(quick)L.q++;} L.ms=Math.round(((L.ms||0)*(L.n-1)+ms)/Math.max(1,L.n));L.u=Date.now();
  if(!quick){if(!ok){const H=MB().hist[t]=MB().hist[t]||[];if(H.length<400)H.push({q:f.q,a:String(f.ans),v:A2.input,ok:false,t:"Number facts within 20",s:"+ − within 20",w:factTip(f)});}}
  A2.state=quick?"quick":ok?"slow":"wrong"; if(typeof beep==="function")beep(ok);
  Store.save(); a20Show();
}
function a20Next(){clearTimeout(A2.auto);A2.i++;A2.input="";A2.state="ask";A2.t0=0;a20Show();}
function a20End(){
  const t=today(), L=a20Log(t)||{n:0,r:0,q:0}, g=A2.g; let up="";
  if(g<A20_G.length-1&&a20Pct(g)>=85){MB().log.a20lv={g:g+1,u:Date.now()};up=`<div class="notice">🎉 ${esc(A20_G[g].name)} passed! Next: <b>${esc(A20_G[g+1].name)}</b> · ${esc(A20_G[g+1].zh)}</div>`;}
  Store.save(); $("#a20Prog").textContent="";
  $("#a20Body").innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(L.n?Math.round(L.q/L.n*3):0)}${"☆".repeat(3-(L.n?Math.round(L.q/L.n*3):0))}</div>
    <h2>${L.q||0} of ${L.n} quick from memory</h2><p class="muted">${L.r} right · average ${((L.ms||0)/1000).toFixed(1)} s. Quick = right within 3 seconds, without counting. 3 秒内答对算“快”。</p>${up}
    <div class="a20-groups">${A20_G.map((x,i)=>`<span class="${i<a20Lv()?"ok":i===a20Lv()?"on":""}">${esc(x.name)}<small>${a20Pct(i)}%</small></span>`).join("")}</div>
    <button class="btn primary big" id="a20Done">Done</button></div>`;
  $("#a20Done").onclick=closeAdd20; if(typeof beep==="function")beep(true,true);
}
/* parent page */
function a20Parent(){
  const g=a20Lv(), st=MB().q, slow=A20_G.slice(0,g+1).flatMap(x=>x.list).filter(f=>st[f.id]&&!a20Known(f)).sort((a,b)=>(st[b.id].ms||0)-(st[a.id].ms||0)).slice(0,16);
  const days=[...Array(7)].map((_,k)=>addDays(today(),-k)).map(d=>[d,a20Log(d)]).filter(([,l])=>l&&l.n);
  return `<div class="card stack no-zh fl-par"><h3 style="margin:0">${ic("maths")} 20以内加减 · No more counting on fingers</h3>
    <div class="muted small">按方法一步步学：凑十 → 双数 → 十加几 → 接近双数 → 凑十法 → 破十法 → 想加算减 → 全部混合。每天 25 题，要求打字作答，3 秒内答对才算“熟练”（来不及数手指）。慢或错的题会配十格图提示，过 3 题再出一次。一个方法 85% 熟练后自动进入下一个。</div>
    <div class="a20-groups">${A20_G.map((x,i)=>`<span class="${i<g?"ok":i===g?"on":""}">${esc(x.zh)}<small>${a20Pct(i)}%</small></span>`).join("")}</div>
    ${days.length?`<div class="small">最近：${days.map(([d,l])=>`${esc(shortDate(d))} 快 ${l.q||0}/${l.n}，平均 ${((l.ms||0)/1000).toFixed(1)} 秒`).join("；")}</div>`:""}
    ${slow.length?`<div class="small"><b>还慢或常错的：</b>${slow.map(f=>`${esc(f.q)} = ${f.ans} <span class="muted">(${((st[f.id].ms||0)/1000).toFixed(1)}s${st[f.id].ok===false?"，错":""})</span>`).join("，")}</div>`:""}
  </div>`;
}
