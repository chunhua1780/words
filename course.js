/* ================= 系统拼读课 · The daily phonics lesson (Year 5 site) =================
   Built on how children learn to read and spell (England's Reading Framework; Ehri's orthographic mapping):
   - First a placement check finds which sounds and spellings she already knows; the course then teaches only the gaps.
   - Each day one new sound-spelling, in a fixed order (phonics-course.js), in five steps of about 15 minutes:
     1 Review: 5 earlier spellings (hear a word, choose how it is spelt)
     2 Learn: the new letters and their sound, then 6 words with sound buttons (tap a sound, then the word)
     3 Read: 5 words to sound out and blend, then check by listening
     4 Spell: 5 words: hear, build them sound by sound in boxes, then write the whole word ("say it, write it")
     5 Sentence: read a sentence with the sound, then hear it and write it
   - A spelling is "secure" after two days with 80% or more right; secure ones come back in the review.
   Progress lives in book.eng.phon under "c:<id>" (per spelling), "c:placed" and "c:today". */
const cRec=id=>(B().eng.phon||{})["c:"+id]||null;
const cSet=(id,v)=>{const E=B().eng;E.phon=E.phon||{};E.phon["c:"+id]={...(E.phon["c:"+id]||{}),...v,u:Date.now()};Store.save();};
const cState=c=>{const r=cRec(c.id);return r?r.st||"learning":"new";};
const cPlaced=()=>!!cRec("placed");
function cNext(){return COURSE.find(c=>!["known","secure"].includes(cState(c)))||null;}
function cToday(){
  const t=today(), r=cRec("today");
  if(r&&r.date===t&&COURSE.find(c=>c.id===r.id))return r;
  const c=cNext(); if(!c)return null;
  const v={date:t,id:c.id,step:0}; cSet("today",v); return v;
}
const cDone=(t=today())=>{const r=cRec("today");return !!r&&r.date===t&&r.step>=5;};
/* the other ways to write the same sound: the wrong choices */
function cAlts(c){const s=SOUND_BY[c.k];const alts=(s?s.sp.map(x=>x[0]):[]).filter(g=>g!==c.g);
  return [...new Set([...alts,...COURSE.filter(x=>x.k===c.k&&x.g!==c.g).map(x=>x.g)])];}
/* a word with the taught letters replaced: c[a]k[e] → c_k_ with "a-e" */
function cSwap(item,g){if(!item.parts.some(p=>p.on))return item.word;
  if(g.includes("-")){const [a,b]=g.split("-");let first=true;return item.parts.map(p=>p.on?(p.tail?b:a):p.t).join("");}
  return item.parts.map(p=>p.on&&!p.tail?g:p.on&&p.tail?"":p.t).join("");}
const cWord=it=>it.parts.map(p=>`<span class="cw-p ${p.on?"on":""}">${esc(p.t)}</span>`).join("");
function cButtons(it,k){
  return `<span class="cw">${it.parts.map((p,i)=>`<button class="cw-b ${p.on?"on":""} ${p.tail?"tail":""}" data-cs="${i}">${esc(p.t)}<i></i></button>`).join("")}</span>`;
}
function cBindButtons(el,it,c){
  el.querySelectorAll("[data-cs]").forEach(b=>b.onclick=e=>{e.stopPropagation();const p=it.parts[+b.dataset.cs];
    b.classList.add("hl");setTimeout(()=>b.classList.remove("hl"),500);
    if(p.on)playSound(c.k);else{const s=SOUNDS.find(s=>s.sp.some(x=>x[0]===p.t.toLowerCase()&&s.g!=="Long vowels"&&s.g!=="Other vowel sounds")||s.l===p.t.toLowerCase());s?playSound(s.k):say(p.t,{fragment:true});}});
}
const C_KEYS=[["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l","'"],["z","x","c","v","b","n","m",",",".","⌫"]];
const cKbd=(sentence)=>`<div class="ps-kbd">${C_KEYS.map(r=>`<div class="kbd-row">${r.map(k=>`<button type="button" class="kb ${k==="⌫"?"kb-fn":""}" data-k="${k}">${k}</button>`).join("")}</div>`).join("")}
  ${sentence?`<div class="kbd-row"><button type="button" class="kb kb-space" data-k=" ">space</button><button type="button" class="kb" data-k="?">?</button><button type="button" class="kb" data-k="!">!</button></div>`:""}</div>`;

/* ---------- placement: one question per spelling, in course order ---------- */
function cPlaceStart(){return {set:COURSE.filter(c=>c.items.length),i:0,r:0,pick:null};}
function cPlace(st){
  const body=$("#engBody");
  if(st.i>=st.set.length){
    cSet("placed",{done:true,date:today()}); const nk=COURSE.filter(c=>cState(c)==="known").length;
    body.innerHTML=`<div class="m-q m-results"><h2>Check finished · 测试完成</h2><p>You already know <b>${nk}</b> of ${COURSE.length} spellings. The lessons will teach the other ${COURSE.length-nk}, one a day. 已经会 ${nk} 个，其余的每天学一个。</p>
      <div class="fm-nav"><button class="btn primary big" id="cGo">${ic("sparkle")}Start today’s lesson 开始今天的课</button></div></div>`;
    $("#cGo").onclick=()=>engShow("lesson2"); return;
  }
  const c=st.set[st.i], it=c.items[st.i%c.items.length], opts=st.opts||(st.opts=shuffle([c.g,...shuffle(cAlts(c)).slice(0,3)]));
  const picked=st.pick!=null, ok=picked&&opts[st.pick]===c.g;
  body.innerHTML=`<div class="m-q eng-page">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:var(--c-pink)">Placement check · 摸底测试</span><span class="muted small">${st.i+1} of ${st.set.length}</span></div>
    <p class="muted" style="margin:0">Listen to the word. Which letters are missing? If you do not know, choose “I don’t know”. 不会就选最后一个按钮，不要猜。</p>
    <div class="ph-q"><button class="icon-btn" id="cSay">${ic("speaker")}</button><span class="ph-mask">${picked?cWord(it):esc(it.parts.map(p=>p.on?"_".repeat(p.t.length):p.t).join(""))}</span></div>
    <div class="m-opts">${opts.map((o,i)=>`<button class="opt-btn m-opt ${picked&&o===c.g?"right":""} ${picked&&i===st.pick&&!ok?"wrong":""}" data-o="${i}" ${picked?"disabled":""}>${esc(o)}</button>`).join("")}
      <button class="opt-btn m-opt ${picked&&st.pick===-1?"wrong":""}" data-o="-1" ${picked?"disabled":""}>I don’t know 不会</button></div>
    ${picked?`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Correct! 对了！":st.pick===-1?"That’s fine. 没关系。":"Not quite. 不对。"} “${esc(it.word)}” is spelt with <span class="cw-p on">${esc(c.g)}</span>.</b><span>${ok?"":"You will learn this in the lessons. 课程里会教这个。"}</span></div></div>
      <button class="btn primary big" id="cPNext">${st.i+1<st.set.length?"Next 下一题":"See results 看结果"}</button>`:""}
  </div>`;
  const sayIt=()=>say(it.word); $("#cSay").onclick=sayIt; if(!picked)setTimeout(sayIt,250);
  body.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{st.pick=+b.dataset.o;const good=st.pick>=0&&opts[st.pick]===c.g;
    if(good)cSet(c.id,{st:"known"});else if(!cRec(c.id))cSet(c.id,{st:"learning"});
    if(typeof beep==="function")beep(good); cPlace(st); setTimeout(sayIt,200);});
  const pn=$("#cPNext"); if(pn)pn.onclick=()=>{st.i++;st.pick=null;st.opts=null;cPlace(st);};
}

/* ---------- the lesson ---------- */
let CL=null;
function cLesson(){
  const body=$("#engBody");
  if(!cPlaced())return engShow("cplace",cPlaceStart());
  const td=cToday(); if(!td){body.innerHTML=`<div class="m-q m-results"><h2>All sounds learned! 全部学完了！</h2></div>`;return;}
  const c=COURSE.find(x=>x.id===td.id), s=SOUND_BY[c.k], n=COURSE.indexOf(c)+1;
  if(!CL||CL.id!==c.id||CL.date!==td.date)CL={id:c.id,date:td.date,i:0,r:0,n:0,input:"",pick:null};
  const steps=["Review 复习","Learn 学新音","Read 读","Spell 写","Sentence 句子"];
  const head=`<div class="cl-steps">${steps.map((x,i)=>`<span class="${i===td.step?"on":i<td.step?"past":""}">${i+1} ${esc(x)}</span>`).join("")}</div>
    <div class="row" style="justify-content:space-between;align-items:center"><span class="kind-tag" style="--kc:var(--c-pink)">Lesson ${n} of ${COURSE.length} · 第${n}课</span><span class="cl-g">${esc(c.g)} <small>/${esc(s?s.l:c.k)}/</small></span></div>`;
  const next=()=>{const r=cRec("today");cSet("today",{...r,step:r.step+1});CL.i=0;CL.input="";CL.pick=null;CL.tries=0;CL.built=null;CL.state=null;cLesson();$("#engBody").scrollTop=0;};
  const score=(ok)=>{CL.n++;if(ok)CL.r++;const r=cRec(c.id)||{},d=(r.days||{})[td.date]||[0,0];cSet(c.id,{st:r.st==="known"?"known":r.st||"learning",days:{...(r.days||{}),[td.date]:[d[0]+1,d[1]+(ok?1:0)]}});};
  // 1. review
  if(td.step===0){
    const old=COURSE.filter(x=>x!==c&&["secure","learning"].includes(cState(x))&&x.items.length).slice(0,COURSE.indexOf(c)), pool=shuffle(old.length?old:COURSE.slice(0,Math.max(1,COURSE.indexOf(c)))).slice(0,5);
    if(!pool.length||CL.i>=pool.length){if(!pool.length)return next();
      body.innerHTML=`<div class="m-q eng-page">${head}<div class="mfb ok">${ic("check")}<div><b>Review done: ${CL.rv||0} of ${pool.length} right.</b></div></div><button class="btn primary big" id="cNext">Next: learn today’s sound 下一步</button></div>`;
      $("#cNext").onclick=next; return;}
    CL.pool=CL.pool||pool; const x=CL.pool[CL.i], it=x.items[(CL.i+td.date.length)%x.items.length];
    const opts=CL.opts||(CL.opts=shuffle([x.g,...shuffle(cAlts(x)).slice(0,2)])), picked=CL.pick!=null, ok=picked&&opts[CL.pick]===x.g;
    body.innerHTML=`<div class="m-q eng-page">${head}<p class="muted" style="margin:0">Review: listen and choose how the word is spelt. 复习：听单词，选正确的拼写。</p>
      <div class="ph-q"><button class="icon-btn" id="cSay">${ic("speaker")}</button><span class="muted">${CL.i+1} / ${CL.pool.length}</span></div>
      <div class="m-opts">${opts.map((g,i)=>`<button class="opt-btn m-opt ${picked&&g===x.g?"right":""} ${picked&&i===CL.pick&&!ok?"wrong":""}" data-o="${i}" ${picked?"disabled":""}>${esc(cSwap(it,g))}</button>`).join("")}</div>
      ${picked?`<button class="btn primary big" id="cNext">Next</button>`:""}</div>`;
    const sayIt=()=>say(it.word); $("#cSay").onclick=sayIt; if(!picked)setTimeout(sayIt,250);
    body.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{CL.pick=+b.dataset.o;const good=opts[CL.pick]===x.g;beep(good);if(good)CL.rv=(CL.rv||0)+1;
      const r=cRec(x.id)||{},d=(r.days||{})[td.date]||[0,0];cSet(x.id,{days:{...(r.days||{}),[td.date]:[d[0]+1,d[1]+(good?1:0)]}});cLesson();});
    const nx=$("#cNext"); if(nx)nx.onclick=()=>{CL.i++;CL.pick=null;CL.opts=null;cLesson();};
    return;
  }
  // 2. learn
  if(td.step===1){
    body.innerHTML=`<div class="m-q eng-page">${head}
      <div class="card cl-teach"><div class="cl-big">${esc(c.g)}</div><div><b>These letters make the sound /${esc(s?s.l:c.k)}/.</b> 这几个字母发 /${esc(s?s.l:c.k)}/ 的音。
        <div class="row" style="gap:8px;margin-top:8px"><button class="btn primary" id="cSnd">${ic("speaker")}Hear the sound 听发音</button></div>
        <div class="muted small" style="margin-top:6px">Say it three times. Then tap each word: tap the sound buttons one by one, then the word. 跟读三遍，再点每个单词的音按钮。</div>
        ${cAlts(c).length?`<div class="muted small">Other ways to write this sound 这个音的其他写法: ${cAlts(c).map(esc).join(", ")}</div>`:""}</div></div>
      <div class="cl-words">${c.items.map((it,i)=>`<div class="cl-w">${cButtons(it,c.k)}<button class="icon-btn sm" data-cw="${i}">${ic("speaker")}</button></div>`).join("")}</div>
      <button class="btn primary big" id="cNext">I’ve got it. Next: read 下一步：读</button></div>`;
    $("#cSnd").onclick=()=>playSound(c.k);
    body.querySelectorAll(".cl-w").forEach((row,i)=>{cBindButtons(row,c.items[i],c);row.querySelector("[data-cw]").onclick=()=>say(c.items[i].word);});
    $("#cNext").onclick=next; setTimeout(()=>playSound(c.k),300); return;
  }
  // 3. read: sound out and blend, then check
  if(td.step===2){
    const list=c.items.slice(0,5);
    if(CL.i>=list.length){body.innerHTML=`<div class="m-q eng-page">${head}<div class="mfb ok">${ic("check")}<div><b>Reading done! ${CL.rr||0} of ${list.length} read right.</b></div></div><button class="btn primary big" id="cNext">Next: spell 下一步：写</button></div>`;$("#cNext").onclick=next;return;}
    const it=list[CL.i], heard=CL.state==="heard";
    body.innerHTML=`<div class="m-q eng-page">${head}<p class="muted" style="margin:0">Read this word. Tap each sound button and say the sounds, then blend them into the word. Say it out loud, then tap “Check”. 点每个音读出来，再连起来读整个词，大声读完后点 Check。</p>
      <div class="cl-read">${cButtons(it,c.k)}</div>
      ${heard?`<div class="row" style="gap:10px;justify-content:center"><button class="btn primary big" data-self="1">${ic("check")}I read it right 读对了</button><button class="btn big" data-self="0">Not yet 没读对</button></div>`
        :`<button class="btn primary big" id="cHear">${ic("speaker")}Check 听正确读音</button>`}
      <div class="muted small" style="text-align:center">${CL.i+1} / ${list.length}</div></div>`;
    cBindButtons(body.querySelector(".cl-read"),it,c);
    const h=$("#cHear"); if(h)h.onclick=()=>{CL.state="heard";say(it.word);cLesson();};
    body.querySelectorAll("[data-self]").forEach(b=>b.onclick=()=>{const ok=b.dataset.self==="1";if(ok)CL.rr=(CL.rr||0)+1;score(ok);CL.i++;CL.state=null;cLesson();});
    return;
  }
  // 4. spell: build sound by sound, then write the whole word
  if(td.step===3){
    const list=c.items.slice(1,6).length>=4?c.items.slice(1,6):c.items.slice(0,5);
    if(CL.i>=list.length){body.innerHTML=`<div class="m-q eng-page">${head}<div class="mfb ok">${ic("check")}<div><b>Spelling done! ${CL.sr||0} of ${list.length} spelt right.</b></div></div><button class="btn primary big" id="cNext">Next: the sentence 下一步：句子</button></div>`;$("#cNext").onclick=next;return;}
    const it=list[CL.i], parts=it.parts.filter(p=>!p.tail);
    const label=p=>p.split?p.t+"-"+p.split:p.t;
    if(!CL.tiles){const alt=shuffle(cAlts(c)).slice(0,2);CL.tiles=shuffle([...parts.map(label),...alt]);CL.built=[];CL.state="build";CL.tries=0;CL.input="";}
    const sayIt=()=>say(it.word);
    if(CL.state==="build"||CL.state==="retry"){
      body.innerHTML=`<div class="m-q eng-page">${head}<p class="muted" style="margin:0">Listen. Say the word slowly, sound by sound. Put one sound in each box. 慢慢读，每个音放进一个格子。</p>
        <div class="ph-q"><button class="icon-btn" id="cSay">${ic("speaker")}</button><button class="icon-btn" id="cSlow">${ic("slow")}</button>
          <div class="sb-slots">${parts.map((p,i)=>`<span class="sb-slot ${CL.built[i]?"full":""}">${esc(CL.built[i]||"")}</span>`).join("")}</div></div>
        ${CL.state==="retry"?`<div class="mfb bad">${ic("x")}<div><b>Not quite. Listen and try again.</b></div></div>`:""}
        <div class="sb-tiles">${CL.tiles.map((g,i)=>`<button class="sb-tile" data-t="${i}" ${(CL.used||[]).includes(i)?"disabled":""}>${esc(g)}</button>`).join("")}</div>
        <div class="row" style="gap:8px;justify-content:center"><button class="btn" id="cUndo">${ic("back")}Undo</button></div></div>`;
      $("#cSay").onclick=sayIt; $("#cSlow").onclick=()=>say(it.word,{slow:true}); if(!CL.built.length&&CL.state==="build")setTimeout(sayIt,250);
      body.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const i=+b.dataset.t;CL.used=[...(CL.used||[]),i];CL.built.push(CL.tiles[i]);
        if(CL.built.length===parts.length){const good=CL.built.every((g,k)=>g===label(parts[k]));CL.tries++;
          if(good||CL.tries>=2){CL.boxOk=good;CL.state="write";if(!good)CL.showBoxes=true;beep(good);}else{CL.state="retry";CL.built=[];CL.used=[];beep(false);}}
        cLesson();});
      $("#cUndo").onclick=()=>{CL.built.pop();(CL.used||[]).pop();cLesson();};
      return;
    }
    // write the whole word
    const done=CL.state==="right"||CL.state==="shown";
    body.innerHTML=`<div class="m-q eng-page">${head}
      <div class="mfb ${CL.boxOk?"ok":"bad"}">${ic(CL.boxOk?"check":"x")}<div><b>${parts.map(p=>esc(label(p))).join(" + ")}</b><span>${CL.boxOk?"Great sound boxes!":"These are the sounds of the word."} Now write the whole word, saying each sound as you write it. 一边读每个音，一边写整个单词。</span></div></div>
      <div class="ph-q"><button class="icon-btn" id="cSay">${ic("speaker")}</button><span class="ps-in ${CL.state}">${CL.state==="shown"?cWord(it):esc(CL.input)||"&nbsp;"}${done?"":`<i class="caret"></i>`}</span></div>
      ${CL.state==="right"?`<div class="mfb ok">${ic("check")}<div><b>Correct! ${esc(it.word)}</b></div></div>`:CL.state==="shown"?`<div class="mfb bad">${ic("x")}<div><b>It is spelt ${esc(it.word)}.</b><span>You wrote <s>${esc(CL.input)}</s></span></div></div>`:""}
      ${done?`<button class="btn primary big" id="cNextW">Next word</button>`:`${cKbd(false)}<button class="btn primary big" id="cCheck" ${CL.input.trim()?"":"disabled"}>Check</button>`}</div>`;
    $("#cSay").onclick=sayIt;
    body.querySelectorAll(".ps-kbd [data-k]").forEach(b=>b.onpointerdown=e=>{e.preventDefault();const k=b.dataset.k;CL.input=k==="⌫"?CL.input.slice(0,-1):(CL.input+k).slice(0,24);cLesson();});
    const ck=$("#cCheck"); if(ck)ck.onclick=()=>{const good=CL.input.trim().toLowerCase()===it.word.toLowerCase()&&CL.boxOk;const wordOk=CL.input.trim().toLowerCase()===it.word.toLowerCase();
      CL.state=wordOk?"right":"shown";beep(wordOk);if(good)CL.sr=(CL.sr||0)+1;score(good);
      if(!wordOk&&typeof diaryAddWords==="function")diaryAddWords([it.word]);cLesson();};
    const nw=$("#cNextW"); if(nw)nw.onclick=()=>{CL.i++;CL.tiles=null;CL.used=[];cLesson();};
    return;
  }
  // 5. sentence: read it, then write it from dictation
  if(td.step===4){
    const sent=c.s, ws=sent.split(" ");
    if(CL.state!=="dict"&&CL.state!=="marked"){
      body.innerHTML=`<div class="m-q eng-page">${head}<p class="muted" style="margin:0">Read the sentence out loud. Tap a word if you need help. 大声读这句话，不会的词点一下听。</p>
        <div class="cl-sent">${ws.map((w,i)=>`<button class="cl-sw ${c.items.some(it=>w.toLowerCase().replace(/[^a-z']/g,"")===it.word.toLowerCase())?"on":""}" data-sw="${i}">${esc(w)}</button>`).join(" ")}</div>
        <div class="row" style="gap:10px;justify-content:center"><button class="btn" id="cSay">${ic("speaker")}Hear it 听整句</button><button class="btn primary big" id="cDict">Now write it 现在听写这句</button></div></div>`;
      body.querySelectorAll("[data-sw]").forEach(b=>b.onclick=()=>say(ws[+b.dataset.sw].replace(/[^A-Za-z']/g,"")));
      $("#cSay").onclick=()=>say(sent); $("#cDict").onclick=()=>{CL.state="dict";CL.input="";cLesson();setTimeout(()=>say(sent),300);};
      return;
    }
    const marked=CL.state==="marked", norm2=w=>w.toLowerCase().replace(/[^a-z']/g,"");
    const want=ws.map(norm2), got=CL.input.trim().split(/\s+/).map(norm2);
    body.innerHTML=`<div class="m-q eng-page">${head}<p class="muted" style="margin:0">Listen and write the sentence. 听写这句话。</p>
      <div class="ph-q"><button class="icon-btn" id="cSay">${ic("speaker")}</button><button class="icon-btn" id="cSlow">${ic("slow")}</button></div>
      <div class="ps-in cl-dict">${marked?want.map((w,i)=>got[i]===w?`<span class="ok-w">${esc(ws[i])}</span>`:`<span class="bad-w"><s>${esc(got[i]||"_")}</s> ${esc(ws[i])}</span>`).join(" "):esc(CL.input)||"&nbsp;"}${marked?"":`<i class="caret"></i>`}</div>
      ${marked?`<div class="mfb ${CL.sentOk?"ok":"bad"}">${ic(CL.sentOk?"check":"x")}<div><b>${CL.sentOk?"Perfect sentence!":`${CL.sentRight} of ${want.length} words right.`}</b></div></div><button class="btn primary big" id="cFinish">${ic("check")}Finish today’s lesson 完成今天的课</button>`
        :`${cKbd(true)}<button class="btn primary big" id="cCheck" ${CL.input.trim()?"":"disabled"}>Check</button>`}</div>`;
    $("#cSay").onclick=()=>say(sent); const sl=$("#cSlow"); if(sl)sl.onclick=()=>say(sent,{slow:true});
    body.querySelectorAll(".ps-kbd [data-k]").forEach(b=>b.onpointerdown=e=>{e.preventDefault();const k=b.dataset.k;CL.input=k==="⌫"?CL.input.slice(0,-1):(CL.input+k).slice(0,120);cLesson();});
    const ck=$("#cCheck"); if(ck)ck.onclick=()=>{const right=want.filter((w,i)=>got[i]===w).length;CL.sentRight=right;CL.sentOk=right===want.length;CL.state="marked";beep(CL.sentOk);
      for(let i=0;i<want.length;i++)if(c.items.some(it=>it.word.toLowerCase()===want[i]))score(got[i]===want[i]);cLesson();};
    const fin=$("#cFinish"); if(fin)fin.onclick=()=>{
      // secure after two days at 80% or more
      const r=cRec(c.id)||{}, good=Object.values(r.days||{}).filter(([n,k])=>n>=5&&k/n>=.8).length;
      if(good>=2)cSet(c.id,{st:"secure"});
      next(); if(typeof beep==="function")beep(true,true);};
    return;
  }
  // finished
  const r=cRec(c.id)||{}, d=(r.days||{})[td.date]||[0,0];
  body.innerHTML=`<div class="m-q m-results"><div class="stars">★★★</div><h2>Lesson done! 今天的课完成了！</h2>
    <p>Today: <b>${esc(c.g)}</b> /${esc(s?s.l:c.k)}/ · ${d[1]} of ${d[0]} right. ${cState(c)==="secure"?"This spelling is now secure. 这个已经掌握了！":"It comes back tomorrow until it is secure. 明天继续练，直到掌握。"}</p>
    <div class="fm-nav"><button class="btn" id="cChart">Sound chart 拼读表</button><button class="btn primary" id="cDone">Done</button></div></div>`;
  $("#cChart").onclick=()=>engShow("chart"); $("#cDone").onclick=closeEnglish;
}
/* the lesson stays on the same spelling until it is secure: a new day repeats it if the last day was under 80% */
const _cToday=cToday;
cToday=function(){
  const t=today(), r=cRec("today");
  if(r&&r.date!==t){const c=COURSE.find(x=>x.id===r.id);if(c&&r.step>=5){const d=((cRec(c.id)||{}).days||{})[r.date]||[0,0];if(d[0]&&d[1]/d[0]<.8&&cState(c)!=="secure"){const v={date:t,id:c.id,step:0};cSet("today",v);return v;}}}
  return _cToday();
};
function courseCard(){
  if(!cPlaced())return `<button class="card snd-open" data-ph="course"><span class="snd-big">1·2·3</span><span><b>Phonics lessons · 系统拼读课</b><span class="muted small">Start with a short check to find which sounds to learn 先做摸底测试</span></span><span class="chev">${ic("chevron")}</span></button>`;
  const td=cToday(), c=td&&COURSE.find(x=>x.id===td.id), sec=COURSE.filter(x=>["known","secure"].includes(cState(x))).length;
  return `<button class="card snd-open" data-ph="course"><span class="snd-big">${c?esc(c.g):"✓"}</span><span><b>Today’s phonics lesson · 今天的拼读课${cDone()?" ✓":""}</b><span class="muted small">${sec} of ${COURSE.length} spellings secure · ${cDone()?"done today":`step ${(td?td.step:0)+1} of 5`}</span><span class="must-bar"><i style="width:${Math.round(sec/COURSE.length*100)}%"></i></span></span><span class="chev">${ic("chevron")}</span></button>`;
}
