/* ================= Help · 老师一步步教我: a gentle teacher writes and says each step =================
   Shared by both study sites (the same file in each repo). On a maths question the child taps "Help":
   a board opens with the question; a teacher writes each step by hand (the letters appear as she writes,
   with a pencil) and reads it aloud in a soft female British voice. Then the next step, and so on.
   Before the child has answered, the teacher stops before the last step ("Now you try the last step"),
   so the child still works out the answer; after a wrong answer she shows the whole working.
   Help is not there at once: it appears under the Check button after 40 seconds of thinking or after a wrong try,
   at most 6 times a day. An answer given after Help does not count as right (it goes to the mistakes to do again,
   and the parent page marks it "Help"), and a similar question follows straight away. On that one the teacher
   first asks her to try by herself; Help opens there only after a wrong try. After 3 Helps in one go she is
   gently told to try more on her own. */
const HELP_WAIT=0, HELP_DAY=999;
const qEx=q=>!!(q&&(q.example||(typeof MS!=="undefined"&&MS&&MS.exIds&&MS.exIds.has(q.id)))); // a worked example (not counted)
const TEACH_VOICES=["Martha","Kate","Serena","Stephanie","Libby","Sonia","Hazel","Google UK English Female","Fiona","Moira","Karen","Samantha"];
let TV=null, TEACH=null;
function teachVoice(){
  if(TV!==null||!("speechSynthesis" in window))return TV;
  const vs=speechSynthesis.getVoices(); if(!vs.length)return null;
  const en=vs.filter(v=>/^en[-_]GB/i.test(v.lang)), sc=v=>{const i=TEACH_VOICES.findIndex(n=>v.name.includes(n));return (i<0?99:i)+(/Enhanced|Premium|Natural/.test(v.name)?-10:0);};
  const best=en.sort((a,b)=>sc(a)-sc(b))[0]; TV=best&&sc(best)<90?best:false; return TV; // British English women's voices only (else Google's British voice)
}
if("speechSynthesis" in window)try{speechSynthesis.addEventListener("voiceschanged",()=>{TV=null;teachVoice();});}catch(e){}
/* say maths aloud the way a teacher would */
function teachSpeech(t){
  return String(t).replace(/<[^>]+>/g,"").replace(/(\d)\s*\/\s*(\d)/g,"$1 over $2").replace(/×/g," times ").replace(/÷/g," divided by ").replace(/[−–]/g," minus ")
    .replace(/=/g," equals ").replace(/²/g," squared").replace(/³/g," cubed").replace(/π/g,"pi").replace(/½/g,"a half").replace(/¼/g,"a quarter").replace(/¾/g,"three quarters")
    .replace(/°/g," degrees").replace(/%/g," percent").replace(/≈/g," is about ").replace(/→/g," to ").replace(/£(\d)/g,"$1 pounds ").replace(/\s+/g," ").trim();
}
function teachSay(text,onend){
  const s=teachSpeech(text), v=teachVoice();
  if(v&&"speechSynthesis" in window){
    try{if(typeof stopAudio==="function")stopAudio();speechSynthesis.cancel();}catch(e){}
    const u=new SpeechSynthesisUtterance(s); u.voice=v; u.lang=v.lang; u.rate=.86; u.pitch=1.08;
    let done=false; const fin=()=>{if(!done){done=true;onend&&onend();}};
    u.onend=fin; u.onerror=fin; speechSynthesis.speak(u); setTimeout(fin,2500+s.length*95); return;
  }
  if(typeof say==="function")say(s,{onend}); else setTimeout(()=>onend&&onend(),1500+s.length*60); // Google's British voice (a woman's voice) when the device has none
}
function teachStop(){try{if(typeof stopAudio==="function")stopAudio();if("speechSynthesis" in window)speechSynthesis.cancel();}catch(e){}}

function teachEl(){
  let el=document.getElementById("teachOv"); if(el)return el;
  if(!document.getElementById("teachFont")){const l=document.createElement("link");l.id="teachFont";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap";document.head.appendChild(l);}
  el=document.createElement("section"); el.id="teachOv"; el.hidden=true; el.setAttribute("aria-label","Help");
  el.innerHTML=`<div class="tc-card">
    <div class="tc-top"><div class="tc-teacher" id="tcFace" aria-hidden="true"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" class="tc-bg"/><path d="M14 44c0-20 11-32 26-32s26 12 26 32c-3-10-8-15-14-17-6 6-18 9-30 8-3 3-6 6-8 9z" class="tc-hair"/><circle cx="40" cy="46" r="20" class="tc-skin"/><path d="M20 42c2-14 10-20 20-20s18 6 20 20c-6-8-14-11-24-9-6 1-11 4-16 9z" class="tc-hair"/><circle cx="33" cy="45" r="2.4" class="tc-eye"/><circle cx="47" cy="45" r="2.4" class="tc-eye"/><circle cx="29" cy="51" r="3" class="tc-cheek"/><circle cx="51" cy="51" r="3" class="tc-cheek"/><ellipse cx="40" cy="55" rx="5" ry="2" class="tc-mouth"/></svg></div>
      <div><b>Miss Help · 老师来教你</b><div class="muted small" id="tcSub"></div></div>
      <button class="icon-btn" id="tcClose" aria-label="Close">${ic("x")}</button></div>
    <div class="tc-board" id="tcBoard"></div>
    <div class="tc-nudge" id="tcNudge" hidden><button class="btn primary" id="tcTry">OK, I’ll try 我自己试试</button><button class="btn" id="tcStill" hidden>I still need help 还是需要帮助</button></div>
    <div class="tc-ctrl"><button class="btn" id="tcAgain">↻ Again 再讲一遍</button><button class="btn" id="tcPause">⏸ Pause 暂停</button><button class="btn primary" id="tcNext">Next step ⏭</button></div>
  </div>`;
  document.body.appendChild(el);
  el.querySelector("#tcClose").onclick=closeTeach;
  el.querySelector("#tcAgain").onclick=()=>{if(!TEACH)return;TEACH.i=0;TEACH.paused=false;teachRun();};
  el.querySelector("#tcPause").onclick=()=>{if(!TEACH)return;TEACH.paused=!TEACH.paused;if(TEACH.paused){teachStop();TEACH.tok++;teachFace(false);}else teachRun();teachBtns();};
  el.querySelector("#tcNext").onclick=()=>{if(!TEACH)return;if(TEACH.i>=TEACH.steps.length)return closeTeach();teachStop();TEACH.tok++;TEACH.shown=TEACH.i+1;TEACH.i++;TEACH.paused=false;teachDraw(true);teachRun();};
  return el;
}
/* open the teacher for a question; full = show the whole working (after a wrong answer) */
function openTeach(q,full){
  const all=typeof stepsFor==="function"?stepsFor(q):(q.steps||[]);
  let steps=full?all:(typeof hintSteps==="function"?hintSteps(q):all.slice(0,-1));
  if(!steps.length&&all.length>1)steps=all.slice(0,-1);
  if(!steps.length){if(typeof toast==="function")toast("No steps for this one yet. Try the 答疑 button.");return;}
  const end=full?"That’s how you do it. Now you know! 你学会了！":"Now you try the last step yourself. You can do it! 最后一步你自己来，你可以的！";
  TEACH={q,steps:[...steps,end],i:0,shown:0,paused:false,tok:0,full};
  if(typeof MS!=="undefined"&&MS&&!full&&(MS.state==="ask"||MS.state==="retry")){MS.helped=MS.helped||{};MS.helped[q.id]=1;}
  const el=teachEl(); el.hidden=false; document.body.style.overflow="hidden"; teachMode(false);
  $("#tcSub").textContent=full?"Here is the whole working, step by step.":"I’ll show you how to start. 我先带你做前面几步。";
  teachDraw(false); teachRun();
}
function closeTeach(){teachStop();if(TEACH)TEACH.tok++;TEACH=null;const el=document.getElementById("teachOv");if(el)el.hidden=true;document.body.style.overflow="";}
const teachFace=on=>{const f=document.getElementById("tcFace");if(f)f.classList.toggle("talk",!!on);};
function teachBtns(){if(!TEACH)return;$("#tcPause").textContent=TEACH.paused?"▶ Play 继续":"⏸ Pause 暂停";$("#tcNext").textContent=TEACH.i>=TEACH.steps.length?"Close · 我会了":"Next step ⏭";}
function teachDraw(){
  const T=TEACH, fmt=s=>typeof mt==="function"?mt(s):esc(s);
  $("#tcBoard").innerHTML=`<div class="tc-q">${fmt(T.q.q||"")}</div>
    ${typeof mFig==="function"&&T.q.f?`<div class="tc-fig">${(()=>{try{return mFig(T.q.f)||"";}catch(e){return "";}})()}</div>`:""}
    <ol class="tc-steps">${T.steps.map((s,i)=>i<T.shown?`<li class="${i===T.steps.length-1?"tc-end":""}">${fmt(s)}</li>`:i===T.shown?`<li class="tc-now ${i===T.steps.length-1?"tc-end":""}" id="tcNow"><span class="tc-ink"></span><span class="tc-pen">✏️</span></li>`:"").join("")}</ol>`;
  teachBtns();
}
/* write the current step letter by letter while it is read aloud, then go on */
function teachRun(){
  const T=TEACH; if(!T||T.paused)return;
  if(T.i>=T.steps.length){teachFace(false);teachBtns();return;}
  T.shown=T.i; teachDraw();
  const tok=++T.tok, text=String(T.steps[T.i]).replace(/<[^>]+>/g,""), li=$("#tcNow"), ink=li.querySelector(".tc-ink");
  li.scrollIntoView({block:"nearest",behavior:"smooth"});
  let k=0, wrote=false, spoke=false;
  const next=()=>{if(tok!==T.tok||!wrote||!spoke)return;teachFace(false);
    li.classList.remove("tc-now");li.innerHTML=typeof mt==="function"?mt(T.steps[T.i]):esc(T.steps[T.i]);
    T.i++;T.shown=T.i;teachBtns();setTimeout(()=>{if(tok===T.tok&&!T.paused)teachRun();},900);};
  const write=()=>{if(tok!==T.tok)return;k=Math.min(text.length,k+1);ink.textContent=text.slice(0,k);
    if(k<text.length)setTimeout(write,text[k-1]===" "?35:48);else{wrote=true;const p=li.querySelector(".tc-pen");if(p)p.remove();next();}};
  teachFace(true); write();
  teachSay(T.steps[T.i],()=>{if(tok!==T.tok)return;spoke=true;teachFace(false);next();});
}

/* ---------- when Help can be used ---------- */
const helpUsed=()=>((MB().log["hp:"+today()]||{}).n||0);
const helpLeft=()=>Math.max(0,HELP_DAY-helpUsed());
function teachBtnHtml(q){
  if(typeof MS==="undefined"||!MS||MS.kind==="test"||!(typeof stepsFor==="function"?stepsFor(q):q.steps||[]).length)return "";
  const st=MS.state;
  if(qEx(q))return `<div class="tc-fab-row"><span class="muted small" style="margin-right:auto">例题 · Example: watch how, then type the answer. It doesn’t count.</span><button class="btn teach-fab" data-teach="1">👩‍🏫 Watch the example · 看例题讲解</button></div>`;
  if(st==="right")return "";
  if(st==="shown")return `<div class="tc-fab-row"><button class="btn teach-fab" data-teach="1">👩‍🏫 Watch how · 看老师讲解</button></div>`;
  if(MS.helped&&MS.helped[q.id])return `<div class="tc-fab-row"><button class="btn teach-fab" data-teach="0">👩‍🏫 See it again · 再看一遍</button></div>`;
  return `<div class="tc-fab-row"><button class="btn teach-fab" data-teach="0">👩‍🏫 Help · 老师教我<small>Answers with Help don’t count</small></button></div>`;
}
let TEACH_TIMER=null;
function bindTeach(body,q){
  body.querySelectorAll("[data-teach]").forEach(b=>b.onclick=()=>teachAsk(q,b.dataset.teach==="1"));
  if(qEx(q)&&MS.state==="ask"){MS.exSeen=MS.exSeen||{};if(!MS.exSeen[q.id]){MS.exSeen[q.id]=1;setTimeout(()=>openTeach(q,true),400);}} // a worked example: the teacher shows it first
  clearInterval(TEACH_TIMER);
  const w=body.querySelector("[data-teachwait]"); if(!w)return;
  const i=MS.i;
  TEACH_TIMER=setInterval(()=>{if(!MS||MS.i!==i||MS.state==="right"||MS.state==="shown"){clearInterval(TEACH_TIMER);return;}
    const left=HELP_WAIT-(Date.now()-(MS.t0||0)), el=document.querySelector("[data-teachwait]"); if(!el){clearInterval(TEACH_TIMER);return;}
    if(left<=0){clearInterval(TEACH_TIMER);const row=el.parentNode;row.outerHTML=teachBtnHtml(q);document.querySelectorAll("#mBody [data-teach]").forEach(b=>b.onclick=()=>teachAsk(q,b.dataset.teach==="1"));}
    else el.textContent=`👩‍🏫 Help in ${Math.ceil(left/1000)} s · 先自己想一想`;},1000);
}
function teachAsk(q,full){
  if(full||(MS.helped&&MS.helped[q.id]))return openTeach(q,full);
  if(false)
    return teachNudge("Little one, try this one by yourself first, OK? It is just like the last one. If you really can’t do it, try once, and then I’ll help you. 小朋友，这道题和刚才那道很像，你先试着自己做一下好吗？实在做不出来，先答一次，再来找我帮忙。");
  const go=()=>{const L=MB().log["hp:"+today()]=MB().log["hp:"+today()]||{n:0};L.n=(L.n||0)+1;L.u=Date.now();Store.save();MS.hpN=(MS.hpN||0)+1;openTeach(q,false);};
  if(false){MS.nudged=1;
    return teachNudge("You’ve asked me for help quite a lot. Have a go by yourself first: mistakes help you learn, and if it’s wrong you’ll see how to do it. 你今天用了好几次帮助啦。先自己做做看，做错也没关系，错了会看到讲解。",go);}
  go();
}
function teachMode(nudge){const n=$("#tcNudge"),c=document.querySelector("#teachOv .tc-ctrl");if(n)n.hidden=!nudge;if(c)c.hidden=nudge;}
function teachNudge(msg,still){
  if(TEACH)TEACH.tok++; TEACH=null;
  const el=teachEl(); el.hidden=false; document.body.style.overflow="hidden"; teachMode(true);
  $("#tcSub").textContent="Have a go first · 先自己试试";
  $("#tcBoard").innerHTML=`<div class="tc-msg">${esc(msg.split(/(?<=[.!?])\s(?=[\u4e00-\u9fff])/)[0])}<div class="tc-msg-zh">${esc((msg.match(/[\u4e00-\u9fff].*$/)||[""])[0])}</div></div>`;
  $("#tcTry").onclick=closeTeach;
  const st=$("#tcStill"); st.hidden=!still; st.onclick=()=>{teachMode(false);still();};
  teachFace(true); teachSay(msg.replace(/[\u4e00-\u9fff，。、！？]+.*$/,""),()=>teachFace(false));
}
/* after an answer given with Help: a similar question comes next (up to two in a row) */
function similarQ(q){
  const g=q.gen||q.pg||""; let nq=null;
  try{
    if(g&&typeof PAPER_BY!=="undefined"&&PAPER_BY[g]){for(let i=0;i<40&&!nq;i++){const x=PAPER_BY[g].gen();if(x&&x.o===q.o)nq=x;}for(let i=0;i<10&&!nq;i++)nq=PAPER_BY[g].gen();}
    else if(g.startsWith("fm-")&&typeof fmQuestion==="function"&&typeof FM_BY!=="undefined"&&FM_BY[g.slice(3)])nq=fmQuestion(FM_BY[g.slice(3)]);
  }catch(e){nq=null;}
  if(nq&&!(nq.k==="n"&&!Number.isFinite(nq.a))){const id="g:tw:"+Date.now().toString(36)+Math.floor(Math.random()*1e4);MQ[id]={...nq,id,gen:g};return id;}
  if(typeof MATHS==="undefined")return null;
  const st=MB().q, used=new Set(MS.ids), ok=x=>x.id!==q.id&&!used.has(x.id)&&!(typeof PAPER_TYPES!=="undefined"&&typeof isPrimary==="function"&&isPrimary(x));
  let pool=MATHS.filter(x=>x.t===q.t&&x.o===q.o&&ok(x)); if(!pool.length)pool=MATHS.filter(x=>x.t===q.t&&ok(x)); if(!pool.length)return null;
  const fresh=pool.filter(x=>!st[x.id]), from=fresh.length?fresh:pool; return from[Math.floor(Math.random()*from.length)].id;
}
function teachTwin(q){
  return; // no extra questions: what she could not do comes back first thing the next day, with a worked example (maths.js)
  if(typeof MS==="undefined"||!MS||MS.kind==="test"||qEx(q)||!(MS.helped&&MS.helped[q.id]))return;
  MS.twin=MS.twin||{}; const depth=(MS.twin[q.id]||0)+1; if(depth>2)return;
  const id=similarQ(q); if(!id||!MQ[id])return;
  MS.ids.splice(MS.i+1,0,id); MS.twin[id]=depth;
  if(typeof toast==="function")toast("Next: a similar question. Try it by yourself! 下一题是类似的，自己试试！");
}
