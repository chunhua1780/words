/* ================= 拼读表 · The sound chart: the 44 sounds of English and the letters that make them =================
   Each sound has its letters (graphemes), each with a key word: tap a grapheme to hear the sound on its own
   (a short recording, audio/p/<sound>.mp3) and then the key word. Three kinds of practice use it:
   - "Which letters?": hear a sound and its word, choose the letters (from different sounds),
   - "Same sound": see letters, choose the word that has that sound,
   - "Build it": hear a word and build it from sound tiles in order (e.g. r + ai + n), with near-miss tiles.
   Daily: 15 sound questions and 10 words to build, kept in book.eng.plog[date] as cn/cr and bn/br. */
const SOUNDS=[
  // short vowels
  {k:"a",g:"Short vowels",l:"a",tz:"短 a",sp:[["a","cat"]]},
  {k:"e",g:"Short vowels",l:"e",tz:"短 e",sp:[["e","bed"],["ea","bread"]]},
  {k:"i",g:"Short vowels",l:"i",tz:"短 i",sp:[["i","pin"],["y","gym"]]},
  {k:"o",g:"Short vowels",l:"o",tz:"短 o",sp:[["o","dog"],["a","want"]]},
  {k:"u",g:"Short vowels",l:"u",tz:"短 u",sp:[["u","sun"],["o","son"],["ou","young"]]},
  {k:"oo2",g:"Short vowels",l:"oo (book)",tz:"短 oo",sp:[["oo","book"],["u","put"],["ou","could"]]},
  // long vowels
  {k:"ai",g:"Long vowels",l:"ay",tz:"长 a",sp:[["ai","rain"],["ay","day"],["a-e","cake"],["eigh","eight"],["ey","they"]]},
  {k:"ee",g:"Long vowels",l:"ee",tz:"长 e",sp:[["ee","tree"],["ea","sea"],["e-e","these"],["y","happy"],["ie","chief"],["ey","key"]]},
  {k:"igh",g:"Long vowels",l:"igh",tz:"长 i",sp:[["igh","night"],["ie","pie"],["i-e","time"],["y","fly"]]},
  {k:"oa",g:"Long vowels",l:"oa",tz:"长 o",sp:[["oa","boat"],["ow","snow"],["o-e","home"],["oe","toe"]]},
  {k:"oo",g:"Long vowels",l:"oo (moon)",tz:"长 oo",sp:[["oo","moon"],["ue","blue"],["ew","grew"],["u-e","June"]]},
  {k:"yoo",g:"Long vowels",l:"yoo",tz:"长 u",sp:[["u-e","cube"],["ew","few"],["ue","cue"]]},
  // other vowel sounds
  {k:"ar",g:"Other vowel sounds",l:"ar",tz:"ar 音",sp:[["ar","car"],["a","bath"],["al","calm"]]},
  {k:"or",g:"Other vowel sounds",l:"or",tz:"or 音",sp:[["or","fork"],["aw","saw"],["au","August"],["ore","more"],["al","walk"]]},
  {k:"er",g:"Other vowel sounds",l:"ur",tz:"ur 音",sp:[["er","her"],["ir","bird"],["ur","turn"],["or","word"]]},
  {k:"ow",g:"Other vowel sounds",l:"ow (cow)",tz:"ow 音",sp:[["ow","cow"],["ou","cloud"]]},
  {k:"oi",g:"Other vowel sounds",l:"oy",tz:"oy 音",sp:[["oi","coin"],["oy","boy"]]},
  {k:"air",g:"Other vowel sounds",l:"air",tz:"air 音",sp:[["air","chair"],["are","care"],["ear","bear"]]},
  {k:"ear",g:"Other vowel sounds",l:"ear",tz:"ear 音",sp:[["ear","near"],["eer","deer"],["ere","here"]]},
  // consonants
  {k:"b",g:"Consonants",l:"b",sp:[["b","bat"],["bb","rabbit"]]},
  {k:"k",g:"Consonants",l:"c / k",sp:[["c","cat"],["k","kit"],["ck","duck"],["ch","school"],["que","unique"]]},
  {k:"d",g:"Consonants",l:"d",sp:[["d","dog"],["dd","ladder"],["ed","played"]]},
  {k:"f",g:"Consonants",l:"f",sp:[["f","fan"],["ff","cliff"],["ph","phone"],["gh","laugh"]]},
  {k:"g",g:"Consonants",l:"g",sp:[["g","goat"],["gg","egg"],["gu","guess"],["gue","league"]]},
  {k:"h",g:"Consonants",l:"h",sp:[["h","hat"],["wh","who"]]},
  {k:"j",g:"Consonants",l:"j",sp:[["j","jam"],["g","giant"],["ge","huge"],["dge","bridge"]]},
  {k:"l",g:"Consonants",l:"l",sp:[["l","leg"],["ll","bell"],["le","table"]]},
  {k:"m",g:"Consonants",l:"m",sp:[["m","man"],["mm","hammer"],["mb","lamb"]]},
  {k:"n",g:"Consonants",l:"n",sp:[["n","net"],["nn","dinner"],["kn","knee"],["gn","sign"]]},
  {k:"p",g:"Consonants",l:"p",sp:[["p","pin"],["pp","happy"]]},
  {k:"r",g:"Consonants",l:"r",sp:[["r","rat"],["rr","carrot"],["wr","write"]]},
  {k:"s",g:"Consonants",l:"s",sp:[["s","sun"],["ss","dress"],["c","city"],["ce","ice"],["sc","science"]]},
  {k:"t",g:"Consonants",l:"t",sp:[["t","tin"],["tt","letter"],["ed","jumped"]]},
  {k:"v",g:"Consonants",l:"v",sp:[["v","van"],["ve","have"]]},
  {k:"w",g:"Consonants",l:"w",sp:[["w","win"],["wh","when"]]},
  {k:"y",g:"Consonants",l:"y",sp:[["y","yes"]]},
  {k:"z",g:"Consonants",l:"z",sp:[["z","zip"],["zz","buzz"],["s","is"],["se","cheese"]]},
  {k:"ks",g:"Consonants",l:"x",sp:[["x","box"]]},
  {k:"kw",g:"Consonants",l:"qu",sp:[["qu","queen"]]},
  // two letters, one sound
  {k:"sh",g:"Two letters, one sound",l:"sh",sp:[["sh","ship"],["ch","chef"],["ti","station"],["ci","special"],["ssi","mission"]]},
  {k:"ch",g:"Two letters, one sound",l:"ch",sp:[["ch","chip"],["tch","catch"],["t","picture"]]},
  {k:"th",g:"Two letters, one sound",l:"th (thin)",sp:[["th","thin"]]},
  {k:"dh",g:"Two letters, one sound",l:"th (this)",sp:[["th","this"]]},
  {k:"ng",g:"Two letters, one sound",l:"ng",sp:[["ng","sing"],["n","pink"]]},
  {k:"zh",g:"Two letters, one sound",l:"zh",sp:[["s","treasure"],["si","vision"]]},
];
const SOUND_BY=Object.fromEntries(SOUNDS.map(s=>[s.k,s]));
/* words split into sound tiles: letters:sound (the sound is only written where the letters could mean another sound) */
const BUILD=("sh|i|p ch|i|p th|i|n r|ai:ai|n d|ay:ai c|a-e:ai|k n|igh:igh|t p|ie:igh t|i-e:igh|m fl|y:igh b|oa:oa|t sn|ow:oa h|o-e:oa|m t|r|ee:ee s|ea:ee h|a|pp|y:ee "
 +"m|oo:oo|n bl|ue:oo gr|ew:oo c|ar:ar|d p|ar:ar|k f|or:or|k s|aw:or h|er:er b|ir:er|d t|ur:er|n c|ow:ow cl|ou:ow|d c|oi:oi|n b|oy:oi ch|air:air c|are:air n|ear:ear d|eer:ear "
 +"d|u|ck c|a|tch b|r|i|dge ph|o-e:oa|n kn|ee:ee wr|i-e:igh|t l|a|mb s|i|ng wh|e|n ch|ur:er|ch sh|ee:ee|t s|t|ar:ar|t f|igh:igh|t th|r|oa:oa|t s|p|oo:oo|n b|r|ea:e|d "
 +"s|t|or:or|m t|ea:ee|ch sh|ou:ow|t b|oi:oi|l g|r|ow:oa n|ur:er|se f|ir:er|s|t h|igh:igh m|i|l|k|y:ee d|r|ea:ee|m s|n|ai:ai|l p|l|ay:ai qu|ee:ee|n b|o|x f|i|sh").split(" ").filter(Boolean)
  .map(s=>({parts:s.split("|").map(p=>{const [g,k]=p.split(":");return {g,k:k||null};}),get word(){return wordOfParts(this.parts);}}));
function wordOfParts(parts){ // join tiles; a split vowel like a-e wraps the next consonant: c + a-e + k → cake
  let w="", tail=""; for(const p of parts){if(p.g.includes("-")){const [a,b]=p.g.split("-");w+=tail+a;tail=b;}else{w+=p.g;if(tail&&!/[aeiouy]/.test(p.g)){w+=tail;tail="";}}}
  return w+tail;
}
const SOUND_AUDIO=k=>"audio/p/"+k+".mp3";
const playSound=(k,then)=>say(SOUND_BY[k].l,{src:SOUND_AUDIO(k),onend:then});
function playSoundWord(k,word){playSound(k,thenIfQuiet(()=>say(word),250));}
const hiWord=(word,g)=>{if(g.includes("-")){const [a,b]=g.split("-"),i=word.indexOf(a),j=word.indexOf(b,i+a.length+1);if(i>=0&&j>i)return esc(word.slice(0,i))+`<b>${esc(a)}</b>`+esc(word.slice(i+a.length,j))+`<b>${esc(b)}</b>`+esc(word.slice(j+b.length));}
  const i=word.indexOf(g);return i<0?esc(word):esc(word.slice(0,i))+`<b>${esc(g)}</b>`+esc(word.slice(i+g.length));};

/* ---------- the chart ---------- */
function soundChart(){
  const groups=[...new Set(SOUNDS.map(s=>s.g))], st=(B().eng.phon||{});
  $("#engBody").innerHTML=`<div class="m-q eng-page">
    <p class="muted" style="margin:0">English has 44 sounds. Each sound can be written in different ways. Tap the letters to hear the sound, then a word with it. 英语有44个音，每个音有几种写法。点字母听发音和例词。</p>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary big" data-sq="go">${ic("headphones")}Sound practice 发音练习</button><button class="btn big" data-sq="build">${ic("puzzle")}Build words 拼单词</button></div>
    ${groups.map(g=>`<div class="section-title"><h3 style="margin:0">${esc(g)}</h3></div><div class="snd-grid">${SOUNDS.filter(s=>s.g===g).map(s=>{const a=st["s:"+s.k],pc=a&&a.n?Math.round(a.r/a.n*100):null;
      return `<div class="snd-card ${pc==null?"":pc>=80?"good":pc>=50?"mid":"weak"}"><button class="snd-head" data-snd="${s.k}"><span class="snd-l">/${esc(s.l)}/</span>${ic("speaker")}</button>
        <div class="snd-sp">${s.sp.map(([gr,w])=>`<button class="snd-g" data-snd="${s.k}" data-w="${esc(w)}"><b>${esc(gr)}</b><span>${hiWord(w,gr)}</span></button>`).join("")}</div>
        ${pc==null?"":`<span class="tiny muted">${pc}% right</span>`}</div>`;}).join("")}</div>`).join("")}
  </div>`;
  const body=$("#engBody");
  body.querySelectorAll(".snd-head").forEach(b=>b.onclick=()=>{const s=SOUND_BY[b.dataset.snd];playSound(s.k,thenIfQuiet(()=>say(s.sp.map(x=>x[1]).join(", ")),250));});
  body.querySelectorAll(".snd-g").forEach(b=>b.onclick=()=>{body.querySelectorAll(".snd-g.on").forEach(x=>x.classList.remove("on"));b.classList.add("on");playSoundWord(b.dataset.snd,b.dataset.w);});
  body.querySelector('[data-sq="go"]').onclick=()=>engShow("sq",sqStart());
  body.querySelector('[data-sq="build"]').onclick=()=>engShow("sb",sbStart());
}

/* ---------- sound practice: which letters / same sound ---------- */
const SQ_N=15, SB_N=10;
function sqWeak(){const st=B().eng.phon||{};return SOUNDS.slice().sort((a,b)=>{const x=st["s:"+a.k],y=st["s:"+b.k];return (x&&x.n?x.r/x.n+x.n/60:-1)-(y&&y.n?y.r/y.n+y.n/60:-1);});}
function sqStart(n=SQ_N){
  const pool=sqWeak().slice(0,14), set=[];
  for(let i=0;set.length<n&&i<80;i++){
    const s=pool[i%pool.length], [gr,w]=shuffle(s.sp)[0];
    const others=shuffle(SOUNDS.filter(x=>x.k!==s.k&&x.g===s.g)).slice(0,3);
    if(i%2===0){ // hear it, choose the letters
      const opts=shuffle([gr,...others.map(o=>shuffle(o.sp)[0][0]).filter(x=>x!==gr)].slice(0,4));
      set.push({type:"letters",s,gr,w,opts,ans:gr});
    }else{ // see the letters, choose the word with that sound
      const ws=others.map(o=>shuffle(o.sp)[0][1]).filter(x=>x!==w);
      set.push({type:"word",s,gr,w,opts:shuffle([w,...ws].slice(0,4)),ans:w});
    }
  }
  return {set,i:0,r:0,pick:null};
}
function sqRun(st){
  const body=$("#engBody");
  if(st.i>=st.set.length){sqEnd(st,"sound");return;}
  const q=st.set[st.i], picked=st.pick!=null, ok=picked&&q.opts[st.pick]===q.ans;
  body.innerHTML=`<div class="m-q eng-page">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:var(--c-pink)">Sound practice · 发音练习</span><span class="muted small">${st.i+1} of ${st.set.length}</span></div>
    ${q.type==="letters"?`<p class="muted" style="margin:0">Listen to the sound and the word. Which letters make the sound? 听发音，选出发这个音的字母。</p>
      <div class="ph-q"><button class="icon-btn" id="sqSay">${ic("speaker")}</button><span class="ph-mask">${picked?hiWord(q.w,q.gr):"🔊 /?/"}</span></div>`
     :`<p class="muted" style="margin:0">Which word has the sound that these letters make? 哪个单词里有这几个字母发的音？</p>
      <div class="ph-q"><span class="snd-big">${esc(q.gr)}</span><span class="muted">as in a word… /${esc(q.s.l)}/</span></div>`}
    <div class="m-opts">${q.opts.map((o,i)=>`<button class="opt-btn m-opt ${picked&&o===q.ans?"right":""} ${picked&&i===st.pick&&!ok?"wrong":""}" data-o="${i}" ${picked?"disabled":""}>${esc(o)}</button>`).join("")}</div>
    ${picked?`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Yes!":"Not quite."} /${esc(q.s.l)}/ is written ${esc(q.gr)} in “${esc(q.w)}”.</b><span>Other ways to write it: ${q.s.sp.map(x=>`${x[0]} (${x[1]})`).join(", ")}.</span></div></div>
      <button class="btn primary big" id="sqNext">${st.i+1<st.set.length?"Next":"See results"}</button>`:""}
  </div>`;
  const play=()=>playSoundWord(q.s.k,q.w);
  const sb=$("#sqSay"); if(sb)sb.onclick=play; if(!picked&&q.type==="letters")setTimeout(play,250);
  body.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{st.pick=+b.dataset.o;const good=q.opts[st.pick]===q.ans;beep(good);if(good)st.r++;
    const E=B().eng,t=today(),s=E.phon["s:"+q.s.k]||{n:0,r:0},d=E.plog[t]||{n:0,r:0};
    E.phon["s:"+q.s.k]={n:s.n+1,r:s.r+(good?1:0),u:Date.now()};E.plog[t]={...d,cn:(d.cn||0)+1,cr:(d.cr||0)+(good?1:0),u:Date.now()};Store.save();
    sqRun(st);setTimeout(play,200);});
  const nx=$("#sqNext"); if(nx)nx.onclick=()=>{st.i++;st.pick=null;sqRun(st);};
}

/* ---------- build it: hear the word, put the sound tiles in order ---------- */
function sbStart(n=SB_N){
  const weak=new Set(sqWeak().slice(0,12).map(s=>s.k));
  const pick=shuffle(BUILD).sort((a,b)=>(b.parts.some(p=>p.k&&weak.has(p.k))?1:0)-(a.parts.some(p=>p.k&&weak.has(p.k))?1:0)).slice(0,n);
  return {set:shuffle(pick),i:0,r:0,built:[],tries:0,state:"ask"};
}
function sbTiles(item){
  const tiles=item.parts.map(p=>p.g), extra=[];
  for(const p of item.parts)if(p.k){const s=SOUND_BY[p.k];for(const [g] of shuffle(s.sp))if(g!==p.g&&!extra.includes(g)&&!tiles.includes(g)){extra.push(g);break;}}
  return shuffle([...tiles,...extra.slice(0,3)]);
}
function sbRun(st){
  const body=$("#engBody");
  if(st.i>=st.set.length){sqEnd(st,"build");return;}
  const it=st.set[st.i], word=it.word; st.tiles=st.tiles||sbTiles(it);
  const done=st.state==="right"||st.state==="shown";
  body.innerHTML=`<div class="m-q eng-page">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:var(--c-pink)">Build the word · 用发音拼单词</span><span class="muted small">${st.i+1} of ${st.set.length}</span></div>
    <p class="muted" style="margin:0">Listen. Say the word slowly, sound by sound. Tap the tiles in order. 慢慢读出每个音，按顺序点字母块。</p>
    <div class="ph-q"><button class="icon-btn" id="sbSay">${ic("speaker")}</button><button class="icon-btn" id="sbSlow">${ic("slow")}</button>
      <div class="sb-slots">${it.parts.map((p,i)=>`<span class="sb-slot ${st.built[i]?(done&&st.state==="shown"&&st.built[i]!==p.g?"bad":"full"):""}">${esc(done&&st.state==="shown"?p.g:(st.built[i]||""))}</span>`).join("")}</div></div>
    ${done?`<div class="mfb ${st.state==="right"?"ok":"bad"}">${ic(st.state==="right"?"check":"x")}<div><b>${esc(word)}: ${it.parts.map(p=>esc(p.g)).join(" + ")}</b><span>${it.parts.filter(p=>p.k).map(p=>`${esc(p.g)} makes /${esc(SOUND_BY[p.k].l)}/`).join(" · ")}</span></div></div>
      <div class="sb-parts">${it.parts.map(p=>`<button class="snd-g" data-pp="${esc(p.k||"")}" data-g="${esc(p.g)}"><b>${esc(p.g)}</b></button>`).join("")}</div>
      <button class="btn primary big" id="sbNext">${st.i+1<st.set.length?"Next word":"See results"}</button>`
     :`<div class="sb-tiles">${st.tiles.map((g,i)=>`<button class="sb-tile" data-t="${i}" ${st.used&&st.used.includes(i)?"disabled":""}>${esc(g)}</button>`).join("")}</div>
      <div class="row" style="gap:8px;justify-content:center"><button class="btn" id="sbUndo">${ic("back")}Undo</button></div>
      ${st.state==="retry"?`<div class="mfb bad">${ic("x")}<div><b>Not quite. Listen again and try once more.</b></div></div>`:""}`}
  </div>`;
  const sayIt=()=>say(word); $("#sbSay").onclick=sayIt; $("#sbSlow").onclick=()=>say(word,{slow:true});
  if(st.state==="ask"&&!st.built.length)setTimeout(sayIt,250);
  body.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{const i=+b.dataset.t;st.used=[...(st.used||[]),i];st.built.push(st.tiles[i]);
    if(st.built.length===it.parts.length){
      const good=st.built.every((g,k)=>g===it.parts[k].g); st.tries++;
      if(!good&&st.tries<2){st.state="retry";beep(false);st.built=[];st.used=[];sbRun(st);setTimeout(sayIt,300);return;}
      st.state=good?"right":"shown"; beep(good); if(good)st.r++;
      const E=B().eng,t=today(),d=E.plog[t]||{n:0,r:0}; E.plog[t]={...d,bn:(d.bn||0)+1,br:(d.br||0)+(good?1:0),u:Date.now()};
      for(const p of it.parts)if(p.k){const s=E.phon["s:"+p.k]||{n:0,r:0};E.phon["s:"+p.k]={n:s.n+1,r:s.r+(good?1:0),u:Date.now()};}
      Store.save(); setTimeout(sayIt,200);
    }else if(st.state==="retry")st.state="ask2";
    sbRun(st);});
  const un=$("#sbUndo"); if(un)un.onclick=()=>{st.built.pop();(st.used||[]).pop();sbRun(st);};
  body.querySelectorAll("[data-pp]").forEach(b=>b.onclick=()=>{if(b.dataset.pp)playSound(b.dataset.pp);else say(b.dataset.g,{fragment:true});});
  const nx=$("#sbNext"); if(nx)nx.onclick=()=>{st.i++;st.built=[];st.used=[];st.tiles=null;st.tries=0;st.state="ask";sbRun(st);};
}
function sqEnd(st,kind){
  const n=st.set.length, r=st.r, k=r>=n*.9?3:r>=n*.7?2:r>=n*.4?1:0, d=phDay();
  $("#engBody").innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(k)}${"☆".repeat(3-k)}</div><h2>${r} out of ${n} right</h2>
    <p class="muted">Sounds you find hard come back first next time. 不熟的音下次先练。</p>
    <div class="fm-nav"><button class="btn" id="sqChart">Sound chart 拼读表</button>${kind==="sound"&&(d.bn||0)<SB_N?`<button class="btn primary big" id="sqB">${ic("puzzle")}Next: build words 下一步：拼单词</button>`:`<button class="btn primary" id="sqDone">Done</button>`}</div></div>`;
  $("#sqChart").onclick=()=>engShow("chart"); const b=$("#sqB"); if(b)b.onclick=()=>engShow("sb",sbStart()); const dn=$("#sqDone"); if(dn)dn.onclick=()=>typeof phToday==="function"?phToday():closeEnglish();
}
