/* ================= Roman numerals corner =================
   Learn the seven letters, flashcards, five games (flip-and-match, drag-and-match, build it,
   put in order, 60-second quiz) and levelled practice questions (from maths-roman.js, field lv).
   Game best scores are kept on this device only (localStorage); practice answers are saved like
   all other maths questions. */
const RN_VALS=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
const RN_ONE={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
function toRoman(n){let s="";for(const [v,r] of RN_VALS)while(n>=v){s+=r;n-=v;}return s;}
function rnParts(n){const out=[];for(const [v,r] of RN_VALS)while(n>=v){out.push([r,v]);n-=v;}return out;}
/* "XIV = X (10) + IV (5 − 1 = 4) = 14" · "XL: X before L means 50 − 10 = 40" */
const rnN=v=>v.toLocaleString("en-GB");
function rnExplain(n){
  const p=rnParts(n);
  if(p.length===1){const [r,v]=p[0];return r.length===2?`${r}: ${r[0]} before ${r[1]} means ${rnN(RN_ONE[r[1]])} − ${rnN(RN_ONE[r[0]])} = ${rnN(v)}`:`${r} = ${rnN(v)}`;}
  const bit=([r,v])=>r.length===2?`${r} (${rnN(RN_ONE[r[1]])} − ${rnN(RN_ONE[r[0]])} = ${rnN(v)})`:`${r} (${rnN(v)})`;
  return `${toRoman(n)} = ${p.map(bit).join(" + ")} = ${rnN(n)}`;
}
/* A hint that shows the pieces without giving the letters away */
function rnHint(n){
  return `${rnN(n)} = ${rnParts(n).map(([r,v])=>r.length===2?`${rnN(v)} (a small letter before a big one: ${rnN(RN_ONE[r[1]])} − ${rnN(RN_ONE[r[0]])})`:rnN(v)).join(" + ")}`;
}
const RN_LETTERS=[
  {l:"I",v:1,pic:"☝️",hint:"One finger held up."},
  {l:"V",v:5,pic:"✋",hint:"One hand: your thumb and first finger make a V. 5 fingers."},
  {l:"X",v:10,pic:"🙌",hint:"Two V's joined point to point: two hands, 10 fingers."},
  {l:"L",v:50,pic:"🍭",hint:"L for Lollipops: imagine a jar of 50 lollipops."},
  {l:"C",v:100,pic:"💯",hint:"C for Century: a century is 100 years (cent means 100)."},
  {l:"D",v:500,pic:"🌗",hint:"D is half of M: half of 1,000 is 500."},
  {l:"M",v:1000,pic:"🏰",hint:"M for Millennium: 1,000 years (mille means 1,000)."},
];
const RN_LEVELS=[[1,"1 – 10"],[2,"to 20 + tens"],[3,"to 100"],[4,"to 1,000"]];
const RN_TRAY={1:"IVX",2:"IVXLC",3:"IVXLC",4:"IVXLCDM"};
const rnGet=(k,d)=>{try{const v=localStorage.getItem("rn-"+k);return v==null?d:JSON.parse(v);}catch(e){return d;}};
const rnSet=(k,v)=>{try{localStorage.setItem("rn-"+k,JSON.stringify(v));}catch(e){}};
let RL=rnGet("level",1);
function rnPick(lv){
  const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  if(lv===1)return r(1,10);
  if(lv===2)return Math.random()<.6?r(11,20):r(1,10)*10;
  if(lv===3)return r(1,100);
  return Math.random()<.4?r(1,10)*100:Math.random()<.2?[50,500,1000][r(0,2)]:r(100,1000);
}
function rnNums(lv,k){const s=new Set();let g=0;while(s.size<k&&g++<500)s.add(rnPick(lv));return [...s];}

/* ---------- drag (finger or mouse) with tap-tap as the fallback ---------- */
function rnDrag(el,{onDrop,onTap}){
  el.addEventListener("pointerdown",e=>{
    if(e.button>0)return; e.preventDefault();
    const r=el.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top, sx=e.clientX, sy=e.clientY;
    let moved=false, over=null, ghost=null;
    const move=ev=>{
      if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>6){
        moved=true; ghost=el.cloneNode(true); ghost.classList.add("rn-ghost");
        Object.assign(ghost.style,{width:r.width+"px",height:r.height+"px"}); document.body.appendChild(ghost); el.classList.add("rn-lift");
      }
      if(!moved)return;
      ghost.style.transform=`translate(${ev.clientX-dx}px,${ev.clientY-dy}px)`;
      const t=document.elementFromPoint(ev.clientX,ev.clientY)?.closest("[data-drop]");
      if(t!==over){over?.classList.remove("rn-over");over=t;over?.classList.add("rn-over");}
    };
    const up=()=>{
      window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);
      ghost?.remove(); el.classList.remove("rn-lift"); over?.classList.remove("rn-over");
      if(moved){if(over)onDrop(over);} else onTap&&onTap();
    };
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  });
}

/* ---------- the screen ---------- */
let RNV=null, RNG=null, rnTimer=null;
function openRoman(view="hub"){
  window.__busy=true; $("#roman").hidden=false; document.body.style.overflow="hidden"; rnShow(view);
}
function closeRoman(){clearInterval(rnTimer);RNG=null;window.__busy=false;$("#roman").hidden=true;document.body.style.overflow="";render();}
$("#rnClose").innerHTML=ic("x"); $("#rnClose").onclick=closeRoman;
function rnShow(view){
  clearInterval(rnTimer); RNV=view; $("#rnBody").scrollTop=0;
  $("#rnLabel").textContent={hub:"Roman numerals",learn:"Learn the letters",flash:"Flashcards",pairs:"Flip and match",drag:"Drag and match",build:"Build it",order:"Put in order",quiz:"60-second quiz"}[view]||"Roman numerals";
  ({hub:rnHub,learn:rnLearn,flash:rnFlash,pairs:rnPairs,drag:rnDragGame,build:rnBuild,order:rnOrder,quiz:rnQuiz})[view]();
}
const rnBack=`<button class="btn rn-back" data-rn="hub">${ic("back")}All Roman numerals</button>`;
const rnLevelBar=()=>`<div class="seg rn-levels" role="group" aria-label="Numbers">${RN_LEVELS.map(([k,n])=>`<button data-lv="${k}" class="${k===RL?"on":""}">${n}</button>`).join("")}</div>`;
function rnBind(root=$("#rnBody")){
  root.querySelectorAll("[data-rn]").forEach(b=>b.onclick=()=>rnShow(b.dataset.rn));
  root.querySelectorAll("[data-lv]").forEach(b=>b.onclick=()=>{RL=+b.dataset.lv;rnSet("level",RL);rnShow(RNV);});
}
function rnFinish(title,line,starsN,again){
  beep(true,true);
  $("#rnBody").innerHTML=`<div class="rn-wrap"><div class="card rn-done stack">
    <div class="stars">${"★".repeat(starsN)}<span style="opacity:.25">${"★".repeat(3-starsN)}</span></div>
    <h2>${title}</h2><p class="muted">${line}</p>
    <div class="row" style="justify-content:center"><button class="btn primary big" id="rnAgain">Play again</button>${rnBack}</div></div></div>`;
  $("#rnAgain").onclick=again; rnBind();
}

/* ---------- hub ---------- */
function romanLevelSet(lv){
  const st=MB().q, all=MATHS.filter(q=>q.lv===lv).map(q=>q.id);
  const fresh=mixKinds(shuffle(all.filter(id=>!st[id]))), wrong=shuffle(all.filter(id=>st[id]&&st[id].ok===false)),
    old=all.filter(id=>st[id]&&st[id].ok!==false).sort((a,b)=>(st[a].last||"")<(st[b].last||"")?-1:1);
  return [...wrong.slice(0,3),...fresh,...old].slice(0,MTOPIC);
}
function rnHub(){
  const st=MB().q, best=k=>rnGet(`best-${k}-${RL}`,null);
  const G=(k,emo,t,d,b)=>`<button class="card rn-game" data-rn="${k}"><span class="rn-emo">${emo}</span><b>${t}</b><span class="muted small">${d}</span>${b!=null?`<span class="rn-best">Best: ${b}</span>`:""}</button>`;
  $("#rnBody").innerHTML=`<div class="rn-wrap stack">
    <div class="card rn-hero"><div class="rn-hero-letters">${RN_LETTERS.map(x=>`<span><b>${x.l}</b>${x.v.toLocaleString("en-GB")}</span>`).join("")}</div>
      <p class="muted" style="margin:0">Learn the seven letters first, then play the games. Finish with some practice questions.</p>
      <div class="row"><button class="btn primary big" data-rn="learn">${ic("book")}Learn the letters</button><button class="btn big" data-rn="flash">${ic("layers")}Flashcards</button></div></div>
    <div class="section-title"><h3 style="margin:0">Games</h3><span class="muted small">Numbers:</span></div>
    ${rnLevelBar()}
    <div class="rn-games">
      ${G("pairs","🃏","Flip and match","Find each Roman numeral and its number.",best("pairs")!=null?best("pairs")+" moves":null)}
      ${G("drag","🧲","Drag and match","Drag each card onto its partner.",best("drag")!=null?best("drag")+"/15":null)}
      ${G("build","🧱","Build it","Drag the letters to make the number.",best("build")!=null?best("build")+"/8":null)}
      ${G("order","📶","Put in order","Smallest to largest.",best("order")!=null?best("order")+"/5":null)}
      ${G("quiz","⏱️","60-second quiz","How many can you get in a minute?",best("quiz"))}
    </div>
    <div class="section-title"><h3 style="margin:0">Practice questions</h3><span class="muted small">${MTOPIC} at a time · saved with your maths</span></div>
    <div class="topics">${RN_LEVELS.map(([lv])=>{const ids=MATHS.filter(q=>q.lv===lv).map(q=>q.id), seen=ids.filter(id=>st[id]).length, ok=ids.filter(id=>st[id]&&st[id].ok).length;
      return `<button class="topic" data-rnq="${lv}" style="--tc:var(--c-pink)"><b>${esc(ROMAN_LEVELS[lv])}</b><span class="muted small">${seen?`${Math.round(ok/seen*100)}% correct · `:""}${seen} of ${ids.length} done</span><span class="bar"><i style="width:${seen/ids.length*100}%"></i></span></button>`;}).join("")}
      <button class="topic" data-rnq="all" style="--tc:var(--c-pink)"><b>Everything mixed</b><span class="muted small">Adding, taking away, comparing and more</span><span class="bar"><i style="width:0"></i></span></button></div>
  </div>`;
  rnBind();
  document.querySelectorAll("[data-rnq]").forEach(b=>b.onclick=()=>{
    const lv=b.dataset.rnq; closeRoman();
    openMaths(lv==="all"?{kind:"topic",topic:"Roman numerals",ids:topicSet("Roman numerals")}:{kind:"topic",topic:`Roman numerals · ${ROMAN_LEVELS[lv]}`,ids:romanLevelSet(+lv)});
  });
}

/* ---------- learn ---------- */
function rnLearn(){
  const row=(title,list)=>`<div class="rn-trow"><div class="muted small">${title}</div><div class="rn-table">${list.map(n=>`<button class="rn-cell" data-n="${n}"><b>${toRoman(n)}</b><span>${n.toLocaleString("en-GB")}</span></button>`).join("")}</div></div>`;
  $("#rnBody").innerHTML=`<div class="rn-wrap stack">${rnBack}
    <div class="card stack"><h3 style="margin:0">The seven letters</h3>
      <p class="rn-sentence">To remember the order: <b>I</b> <b>V</b>alue <b>X</b>ylophones <b>L</b>ike <b>C</b>ows <b>D</b>o <b>M</b>ilk</p>
      <div class="rn-letters">${RN_LETTERS.map(x=>`<button class="rn-letter" data-say="${x.v}"><span class="rn-pic">${x.pic}</span><b>${x.l}</b><span class="rn-val">${x.v.toLocaleString("en-GB")}</span><span class="muted small">${x.hint}</span></button>`).join("")}</div>
      <p class="muted small" style="margin:0">Tap a card to hear its number.</p></div>
    <div class="card stack"><h3 style="margin:0">Four rules</h3>
      <div class="rn-rules">
        <div><b>1. Same letters add up</b><span>II = 1 + 1 = 2 · XXX = 30 · CC = 200</span></div>
        <div><b>2. Smaller after bigger: add</b><span>VI = 5 + 1 = 6 · LX = 50 + 10 = 60</span></div>
        <div><b>3. Smaller before bigger: take away</b><span>IV = 5 − 1 = 4 · IX = 9 · XL = 40 · XC = 90 · CD = 400 · CM = 900</span></div>
        <div><b>4. Never more than three in a row</b><span>4 is IV, not IIII · 40 is XL, not XXXX</span></div>
      </div>
      <p class="muted small" style="margin:0">Big numbers: write the hundreds, then the tens, then the ones. 347 = CCC + XL + VII = CCCXLVII.</p></div>
    <div class="card stack"><h3 style="margin:0">Tap any number to see how it is made</h3>
      ${row("Ones",[1,2,3,4,5,6,7,8,9,10])}${row("Tens",[10,20,30,40,50,60,70,80,90,100])}${row("Hundreds",[100,200,300,400,500,600,700,800,900,1000])}
      <div class="rn-explain" id="rnEx">Tap a number above.</div></div>
    <div class="row" style="justify-content:center"><button class="btn primary big" data-rn="flash">${ic("layers")}Test yourself with flashcards</button></div>
  </div>`;
  rnBind();
  document.querySelectorAll(".rn-letter").forEach(b=>b.onclick=()=>say(b.dataset.say));
  document.querySelectorAll(".rn-cell").forEach(b=>b.onclick=()=>{document.querySelectorAll(".rn-cell.on").forEach(x=>x.classList.remove("on"));b.classList.add("on");$("#rnEx").textContent=rnExplain(+b.dataset.n);say(b.dataset.n);});
}

/* ---------- flashcards ---------- */
function rnFlash(){
  const nums=RL===1?shuffle([1,2,3,4,5,6,7,8,9,10]):rnNums(RL,12);
  RNG={q:nums.map(n=>({n,dir:Math.random()<.5})),known:0,flipped:false,total:nums.length};
  const draw=()=>{
    if(!RNG.q.length){rnFinish("Deck finished!",`You went through all ${RNG.total} cards.`,3,rnFlash);return;}
    const c=RNG.q[0], front=c.dir?toRoman(c.n):c.n.toLocaleString("en-GB"), back=c.dir?c.n.toLocaleString("en-GB"):toRoman(c.n);
    $("#rnBody").innerHTML=`<div class="rn-wrap stack">${rnBack}${rnLevelBar()}
      <div class="muted center">${RNG.total-RNG.q.length+1} of ${RNG.total} · ${c.dir?"What number is this?":"Write it in Roman numerals"} Tap the card to turn it over.</div>
      <button class="rn-flash ${RNG.flipped?"flip":""}" id="rnCard"><span class="f">${front}</span><span class="b">${back}<small>${esc(rnExplain(c.n))}</small></span></button>
      <div class="row" style="justify-content:center" ${RNG.flipped?"":"hidden"} id="rnFb"><button class="btn big" id="rnAgainC">Not yet</button><button class="btn primary big" id="rnKnew">I knew it</button></div></div>`;
    rnBind();
    $("#rnCard").onclick=()=>{RNG.flipped=!RNG.flipped;$("#rnCard").classList.toggle("flip",RNG.flipped);$("#rnFb").hidden=!RNG.flipped;if(RNG.flipped)say(String(c.n));};
    $("#rnKnew").onclick=()=>{RNG.q.shift();RNG.flipped=false;beep(true);draw();};
    $("#rnAgainC").onclick=()=>{const x=RNG.q.shift();RNG.q.splice(Math.min(3,RNG.q.length),0,x);RNG.flipped=false;draw();};
  };
  draw();
}

/* ---------- game 1: flip and match ---------- */
function rnPairs(){
  const nums=rnNums(RL,6);
  RNG={cards:shuffle(nums.flatMap(n=>[{n,t:toRoman(n),r:true},{n,t:n.toLocaleString("en-GB"),r:false}])),open:[],done:new Set(),moves:0,lock:false};
  const draw=()=>{
    $("#rnBody").innerHTML=`<div class="rn-wrap stack">${rnBack}${rnLevelBar()}
      <div class="muted center">Turn over two cards. Find a Roman numeral and its number. Moves: <b>${RNG.moves}</b></div>
      <div class="rn-pairs">${RNG.cards.map((c,i)=>{const up=RNG.open.includes(i)||RNG.done.has(c.n);return `<button class="rn-pc ${up?"up":""} ${RNG.done.has(c.n)?"ok":""} ${c.r?"rom":""}" data-i="${i}">${up?c.t:"?"}</button>`;}).join("")}</div></div>`;
    rnBind();
    document.querySelectorAll(".rn-pc").forEach(b=>b.onclick=()=>{
      const i=+b.dataset.i, c=RNG.cards[i];
      if(RNG.lock||RNG.open.includes(i)||RNG.done.has(c.n))return;
      RNG.open.push(i);
      if(RNG.open.length===2){
        RNG.moves++; const [a,b2]=RNG.open.map(k=>RNG.cards[k]);
        if(a.n===b2.n&&a.r!==b2.r){RNG.done.add(a.n);RNG.open=[];beep(true);
          if(RNG.done.size===6){const m=RNG.moves,b0=rnGet(`best-pairs-${RL}`,null);if(b0==null||m<b0)rnSet(`best-pairs-${RL}`,m);
            setTimeout(()=>rnFinish("All matched!",`You found all 6 pairs in ${m} moves.`,m<=8?3:m<=12?2:1,rnPairs),500);}
        }else{RNG.lock=true;beep(false);setTimeout(()=>{RNG.open=[];RNG.lock=false;draw();},900);}
      }
      draw();
    });
  };
  draw();
}

/* ---------- game 2: drag and match ---------- */
function rnDragGame(){
  RNG={round:0,score:0};
  const round=()=>{
    if(RNG.round===3){const s=RNG.score,b=rnGet(`best-drag-${RL}`,null);if(b==null||s>b)rnSet(`best-drag-${RL}`,s);
      rnFinish("Well done!",`${s} of 15 matched on the first try.`,s>=14?3:s>=10?2:1,rnDragGame);return;}
    const nums=rnNums(RL,5), romanTiles=RNG.round!==1; // round 2 turns it round: drag numbers onto Roman numerals
    const tiles=shuffle(nums), targets=shuffle(nums); let left=5, sel=null; const tried=new Set();
    $("#rnBody").innerHTML=`<div class="rn-wrap stack">${rnBack}${rnLevelBar()}
      <div class="muted center">Round ${RNG.round+1} of 3 · Drag each card onto its partner (or tap a card, then tap where it goes).</div>
      <div class="rn-tiles">${tiles.map(n=>`<div class="rn-tile ${romanTiles?"rom":""}" data-n="${n}">${romanTiles?toRoman(n):n.toLocaleString("en-GB")}</div>`).join("")}</div>
      <div class="rn-targets">${targets.map(n=>`<div class="rn-target" data-drop data-n="${n}"><span>${romanTiles?n.toLocaleString("en-GB"):toRoman(n)}</span><i></i></div>`).join("")}</div>
      <div class="rn-explain" id="rnEx">Score: ${RNG.score}</div></div>`;
    rnBind();
    const tryDrop=(tile,target)=>{
      const n=+tile.dataset.n;
      if(+target.dataset.n===n&&!target.classList.contains("ok")){
        target.classList.add("ok"); target.querySelector("i").textContent=tile.textContent; tile.remove(); beep(true);
        if(!tried.has(n))RNG.score++; $("#rnEx").textContent=rnExplain(n);
        if(--left===0){RNG.round++;setTimeout(round,900);}
      }else if(!target.classList.contains("ok")){tried.add(n);beep(false);target.classList.add("bad");setTimeout(()=>target.classList.remove("bad"),500);
        $("#rnEx").textContent=`Not that one. ${tile.textContent} → think again.`;}
      sel?.classList.remove("sel"); sel=null;
    };
    document.querySelectorAll(".rn-tile").forEach(t=>rnDrag(t,{onDrop:tg=>tryDrop(t,tg),onTap:()=>{sel?.classList.remove("sel");sel=t;t.classList.add("sel");}}));
    document.querySelectorAll(".rn-target").forEach(tg=>tg.onclick=()=>{if(sel&&document.body.contains(sel))tryDrop(sel,tg);});
  };
  round();
}

/* ---------- game 3: build it ---------- */
function rnBuild(){
  RNG={list:rnNums(RL,8),i:0,score:0,miss:0,ans:[]};
  const draw=(msg="")=>{
    if(RNG.i>=RNG.list.length){const s=RNG.score,b=rnGet(`best-build-${RL}`,null);if(b==null||s>b)rnSet(`best-build-${RL}`,s);
      rnFinish("Builder's badge!",`${s} of 8 built on the first try.`,s>=7?3:s>=5?2:1,rnBuild);return;}
    const n=RNG.list[RNG.i];
    $("#rnBody").innerHTML=`<div class="rn-wrap stack">${rnBack}${rnLevelBar()}
      <div class="muted center">${RNG.i+1} of 8 · Drag (or tap) letters into the box to make the number.</div>
      <div class="rn-make">Make <b>${n.toLocaleString("en-GB")}</b></div>
      <div class="rn-slot" data-drop id="rnSlot">${RNG.ans.length?RNG.ans.map((c,k)=>`<button class="rn-chip" data-k="${k}">${c}</button>`).join(""):`<span class="muted">Drop letters here</span>`}</div>
      <div class="rn-tray">${[...RN_TRAY[RL]].map(c=>`<div class="rn-tile rom" data-c="${c}"><b>${c}</b><small>${RN_ONE[c].toLocaleString("en-GB")}</small></div>`).join("")}</div>
      <div class="row" style="justify-content:center"><button class="btn big" id="rnClear">Clear</button><button class="btn primary big" id="rnCheck" ${RNG.ans.length?"":"disabled"}>Check</button></div>
      <div class="rn-explain ${msg?"show":""}" id="rnEx">${msg||"Tap a letter in the box to take it out."}</div></div>`;
    rnBind();
    const put=c=>{if(RNG.ans.length<15){RNG.ans.push(c);draw(msg);}};
    document.querySelectorAll(".rn-tray .rn-tile").forEach(t=>rnDrag(t,{onDrop:()=>put(t.dataset.c),onTap:()=>put(t.dataset.c)}));
    document.querySelectorAll(".rn-chip").forEach(b=>b.onclick=()=>{RNG.ans.splice(+b.dataset.k,1);draw(msg);});
    $("#rnClear").onclick=()=>{RNG.ans=[];draw(msg);};
    $("#rnCheck").onclick=()=>{
      const got=RNG.ans.join("");
      if(got===toRoman(n)){beep(true);if(!RNG.miss)RNG.score++;RNG.i++;RNG.miss=0;RNG.ans=[];draw();return;}
      RNG.miss++; beep(false);
      if(RNG.miss>=2){const right=rnExplain(n);RNG.i++;RNG.miss=0;RNG.ans=[];draw(`The answer was ${right}. Next one!`);}
      else draw(`Not quite. Think of it in parts: ${rnHint(n)}. Try again.`);
    };
  };
  draw();
}

/* ---------- game 4: put in order ---------- */
function rnOrder(){
  RNG={round:0,score:0,miss:0};
  const round=(keep)=>{
    if(RNG.round===5){const s=RNG.score,b=rnGet(`best-order-${RL}`,null);if(b==null||s>b)rnSet(`best-order-${RL}`,s);
      rnFinish("In order!",`${s} of 5 rows right on the first try.`,s>=5?3:s>=3?2:1,rnOrder);return;}
    const row=keep||shuffle(rnNums(RL,5)); let sel=null;
    $("#rnBody").innerHTML=`<div class="rn-wrap stack">${rnBack}${rnLevelBar()}
      <div class="muted center">Round ${RNG.round+1} of 5 · Drag the cards (or tap two cards to swap them) so they go from smallest to largest.</div>
      <div class="rn-order">${row.map((n,k)=>`<div class="rn-tile rom" data-drop data-k="${k}">${toRoman(n)}</div>`).join("")}</div>
      <div class="rn-arrow muted small"><span>smallest</span><span>largest</span></div>
      <div class="row" style="justify-content:center"><button class="btn primary big" id="rnCheck">Check</button></div>
      <div class="rn-explain" id="rnEx"></div></div>`;
    rnBind();
    const swap=(a,b)=>{if(a===b)return;[row[a],row[b]]=[row[b],row[a]];round(row);};
    document.querySelectorAll(".rn-order .rn-tile").forEach(t=>rnDrag(t,{onDrop:tg=>swap(+t.dataset.k,+tg.dataset.k),
      onTap:()=>{if(sel==null){sel=+t.dataset.k;t.classList.add("sel");}else{const a=sel;sel=null;swap(a,+t.dataset.k);}}}));
    $("#rnCheck").onclick=()=>{
      const ok=row.every((n,k)=>k===0||row[k-1]<n);
      if(ok){beep(true);if(!RNG.miss)RNG.score++;RNG.miss=0;RNG.round++;
        $("#rnEx").textContent=row.map(n=>`${toRoman(n)} = ${n.toLocaleString("en-GB")}`).join(" < ");$("#rnEx").classList.add("show");setTimeout(()=>round(),1400);}
      else{beep(false);RNG.miss++;$("#rnEx").textContent=`Not yet. Work out each one: ${row.map(n=>`${toRoman(n)} = ?`).join(", ")}`;$("#rnEx").classList.add("show");
        if(RNG.miss>=2)$("#rnEx").textContent=`Hint: ${row.map(n=>`${toRoman(n)} = ${n.toLocaleString("en-GB")}`).join(", ")}`;}
    };
  };
  round();
}

/* ---------- game 5: 60-second quiz ---------- */
function rnQuiz(){
  RNG={score:0,left:60,lock:false};
  const end=()=>{clearInterval(rnTimer);const s=RNG.score,b=rnGet(`best-quiz-${RL}`,null);if(b==null||s>b)rnSet(`best-quiz-${RL}`,s);
    rnFinish("Time's up!",`You got ${s} right in 60 seconds.${b!=null&&s>b?" New best!":b!=null?` Your best is ${Math.max(b,s)}.`:""}`,s>=15?3:s>=8?2:1,rnQuiz);};
  const ask=()=>{
    const n=rnPick(RL), dir=Math.random()<.5, opts=new Set([n]); let g=0;
    while(opts.size<4&&g++<200){const d=[1,-1,2,-2,4,-4,5,-5,9,-9,10,-10,50,-50,100,-100][Math.floor(Math.random()*16)]*(RL===4&&Math.random()<.5?10:1);const x=n+d;if(x>0&&x<=1000)opts.add(x);}
    const list=shuffle([...opts]);
    $("#rnQ").innerHTML=`<div class="rn-make">${dir?`What number is <b>${toRoman(n)}</b>?`:`Which is <b>${n.toLocaleString("en-GB")}</b>?`}</div>
      <div class="m-opts">${list.map(x=>`<button class="opt-btn m-opt" data-x="${x}">${dir?x.toLocaleString("en-GB"):toRoman(x)}</button>`).join("")}</div>`;
    document.querySelectorAll("#rnQ [data-x]").forEach(b=>b.onclick=()=>{
      if(RNG.lock)return; const ok=+b.dataset.x===n; b.classList.add(ok?"right":"wrong");
      if(ok){RNG.score++;beep(true);}else{beep(false);document.querySelector(`#rnQ [data-x="${n}"]`)?.classList.add("right");}
      $("#rnScore").textContent=RNG.score; RNG.lock=true; setTimeout(()=>{RNG.lock=false;if(RNG.left>0)ask();},ok?350:1100);
    });
  };
  $("#rnBody").innerHTML=`<div class="rn-wrap stack">${rnBack}${rnLevelBar()}
    <div class="rn-quizbar"><span>Score <b id="rnScore">0</b></span><div class="prog"><i id="rnTime" style="width:100%"></i></div><span id="rnSecs">60s</span></div>
    <div id="rnQ"></div></div>`;
  rnBind(); ask();
  rnTimer=setInterval(()=>{if(RNV!=="quiz"||$("#roman").hidden){clearInterval(rnTimer);return;}
    RNG.left--; $("#rnTime").style.width=RNG.left/60*100+"%"; $("#rnSecs").textContent=RNG.left+"s"; if(RNG.left<=0)end();},1000);
}
