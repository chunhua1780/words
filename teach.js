/* ================= Help · 老师一步步教我: a gentle teacher writes and says each step =================
   Shared by both study sites (the same file in each repo). On a maths question the child taps "Help":
   a board opens with the question; a teacher writes each step by hand (the letters appear as she writes,
   with a pencil) and reads it aloud in a soft female British voice. Then the next step, and so on.
   Before the child has answered, the teacher stops before the last step ("Now you try the last step"),
   so the child still works out the answer; after a wrong answer she shows the whole working.
   Using Help is noted with the answer (h:1 in book.maths.hist) so the parent page can show it. */
const TEACH_VOICES=["Martha","Kate","Serena","Stephanie","Libby","Sonia","Hazel","Google UK English Female","Fiona","Moira","Karen","Samantha"];
let TV=null, TEACH=null;
function teachVoice(){
  if(TV!==null||!("speechSynthesis" in window))return TV;
  const vs=speechSynthesis.getVoices(); if(!vs.length)return null;
  const en=vs.filter(v=>/^en/i.test(v.lang)), sc=v=>{const i=TEACH_VOICES.findIndex(n=>v.name.includes(n));return (i<0?99:i)+(/GB/i.test(v.lang)?0:20)+(/Enhanced|Premium|Natural/.test(v.name)?-10:0);};
  const best=en.sort((a,b)=>sc(a)-sc(b))[0]; TV=best&&sc(best)<90?best:false; return TV;
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
  if(typeof MS!=="undefined"&&MS){MS.helped=MS.helped||{};MS.helped[q.id]=1;}
  const el=teachEl(); el.hidden=false; document.body.style.overflow="hidden";
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
