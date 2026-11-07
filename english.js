/* ================= English every day: new words, dictation, phonics, writing, and today's plan =================
   - Daily words: 5 to 10 new words every day (a parent sets how many), taken in order from the statutory
     word lists of the National Curriculum for England (Year 2 common exception words, then the Year 3–4
     and Year 5–6 lists). They go into today's word list, so they use the normal learning steps.
   - Daily dictation: today's new words plus every word due by the memory plan (1, 2, 4, 7, 15, 30, 60 days).
     Right first time moves a word to a longer gap; a mistake brings it back tomorrow.
   - Phonics: 10 questions a day on spelling patterns (which letters make this sound in this word),
     weakest patterns first, with a lesson for each pattern.
   - Writing: a short diary every day about what she did, with a word bank, a live checklist and a
     spelling check. Saved in book.eng.diary so a parent can read it.
   - Today's plan: about an hour, ticked off automatically as each part is done. */

/* ---------- 1. Word lists (statutory spelling lists, National Curriculum English Appendix 1) ---------- */
const DW_STAGES=[
  {k:"y2",name:"Year 2 common exception words",words:"door floor poor because find kind mind behind child children wild climb most only both old cold gold hold told every everybody even great break steak pretty beautiful after fast last past father class grass pass plant path bath hour move prove improve sure sugar eye could should would who whole any many clothes busy people water again half money parents Christmas".split(" ")},
  {k:"y34",name:"Year 3 and 4 word list",words:"accident actually address answer appear arrive believe bicycle breath breathe build business calendar caught centre century certain circle complete consider continue decide describe different difficult disappear early earth eight eighth enough exercise experience experiment extreme famous favourite February forward fruit grammar group guard guide heard heart height history imagine increase important interest island knowledge learn length library material medicine mention minute natural naughty notice occasion often opposite ordinary particular peculiar perhaps popular position possess possible potatoes pressure probably promise purpose quarter question recent regular reign remember sentence separate special straight strange strength suppose surprise therefore though although thought through various weight woman women".split(" ")},
  {k:"y56",name:"Year 5 and 6 word list",words:"accommodate accompany according achieve aggressive amateur ancient apparent appreciate attached available average awkward bargain bruise category cemetery committee communicate community competition conscience conscious controversy convenience correspond criticise curiosity definite desperate determined develop dictionary disastrous embarrass environment equipment especially exaggerate excellent existence explanation familiar foreign forty frequently government guarantee harass hindrance identity immediately individual interfere interrupt language leisure lightning marvellous mischievous muscle necessary neighbour nuisance occupy occur opportunity parliament persuade physical prejudice privilege profession programme pronunciation queue recognise recommend relevant restaurant rhyme rhythm sacrifice secretary shoulder signature sincerely soldier stomach sufficient suggest symbol system temperature thorough twelfth variety vegetable vehicle yacht".split(" ")},
];
const dwCount=()=>Math.min(10,Math.max(5,+((B().prefs||{}).dwN)||8));
function dwPool(){
  const have=new Set(words().map(w=>norm(w.w))), start=(B().prefs||{}).dwStart||"y2", out=[]; let on=false;
  for(const s of DW_STAGES){if(s.k===start)on=true;if(on)for(const w of s.words)if(!have.has(norm(w)))out.push({w,s:s.k});}
  return out;
}
const dwLeft=()=>dwPool().length;
/* Make today's daily words once a day (the same picks on every device: the lists are in a fixed order) */
function ensureDailyWords(){
  const b=B(); if(!b||(b.prefs||{}).dwOff)return null;
  const t=today(); if(b.eng.daily[t])return b.eng.daily[t];
  const pick=dwPool().slice(0,dwCount()); if(!pick.length)return null;
  const {added}=addWordsToBook(b,pick.map(x=>x.w),{date:t});
  const l=b.lists[t]; if(!l.title){l.title="Daily words";l.u=Date.now();}
  b.eng.daily[t]={words:pick.map(x=>x.w),stage:pick[0].s,u:Date.now()};
  Store.save();
  if(typeof enrich==="function")Promise.all(added.map(w=>enrich(w).catch(()=>{}))).then(()=>Store.save());
  return b.eng.daily[t];
}
function dailyWordObjs(t=today()){const d=B().eng.daily[t];if(!d)return [];const set=new Set(d.words.map(norm));return wordsIn(B(),t).filter(w=>set.has(norm(w.w)));}

/* ---------- 2. Daily dictation: today's new words and everything due by the memory plan ---------- */
function dictSet(t=today()){
  return words().filter(w=>w.stage>0&&(w.due<=t||w.learnedOn===t||w.dict===t)&&listOpen(B().lists[w.list]||{date:t}));
}
const dictLeft=(t=today())=>dictSet(t).filter(w=>w.dict!==t);

/* ---------- 3. Phonics: spelling patterns ([ ] marks the letters that make the sound) ---------- */
const PH=[
  {k:"ai",name:"The long a sound",say:"ay",rule:"ai is used in the middle of a word (rain), ay at the end (play), and a-e when an e at the end makes the a say its name (cake).",o:["ai","ay","a-e"],w:"r[ai]n tr[ai]n p[ai]nt w[ai]t d[ay] pl[ay] st[ay] aw[ay] c[a]k[e] m[a]k[e] pl[a]t[e] sn[a]k[e]"},
  {k:"ee",name:"The long e sound",say:"ee",rule:"ee and ea are the most common (green, beach). e-e is used in a few words (these), and ie after other letters (field).",o:["ee","ea","e-e","ie"],w:"gr[ee]n sl[ee]p tr[ee] b[ea]ch dr[ea]m t[ea]ch th[e]s[e] compl[e]t[e] ch[ie]f f[ie]ld th[ie]f"},
  {k:"igh",name:"The long i sound",say:"eye",rule:"igh in the middle (night), y at the end of short words (fly), ie at the end (pie), i-e in many words (time).",o:["igh","ie","i-e","y"],w:"n[igh]t l[igh]t br[igh]t p[ie] t[ie] cr[ie]d t[i]m[e] sm[i]l[e] sl[i]d[e] fl[y] cr[y] sk[y]"},
  {k:"oa",name:"The long o sound",say:"oh",rule:"oa in the middle (boat), ow at the end (snow), o-e when an e at the end makes the o say its name (home).",o:["oa","ow","o-e"],w:"b[oa]t c[oa]t r[oa]d sn[ow] sl[ow] wind[ow] h[o]m[e] b[o]n[e] st[o]n[e]"},
  {k:"oo",name:"The long oo sound",say:"oo",rule:"oo is most common (moon). ue and ew often come at the end (blue, new). u-e in words like cube.",o:["oo","ue","ew","u-e"],w:"m[oo]n sp[oo]n sch[oo]l bl[ue] gl[ue] tr[ue] n[ew] gr[ew] fl[ew] c[u]b[e] t[u]b[e] J[u]n[e]"},
  {k:"ou",name:"The ow sound (as in out)",say:"ow",rule:"ou is usually in the middle of a word (cloud), ow is often at the end or before n or l (cow, town, owl).",o:["ou","ow"],w:"cl[ou]d m[ou]th sh[ou]t f[ou]nd c[ow] t[ow]n br[ow]n fl[ow]er"},
  {k:"er",name:"The ur sound",say:"er",rule:"er, ir and ur all make this sound. You have to learn which one each word uses: her, bird, turn.",o:["er","ir","ur"],w:"h[er] lett[er] aft[er] b[ir]d g[ir]l f[ir]st sh[ir]t t[ur]n b[ur]n h[ur]t p[ur]ple"},
  {k:"or",name:"The or sound",say:"or",rule:"or is most common (horse). aw often at the end (saw), au at the start or middle (August), ore at the end (more).",o:["or","aw","au","ore"],w:"h[or]se st[or]m f[or]k s[aw] dr[aw] cr[aw]l [Au]gust h[au]nted [au]tumn m[ore] sh[ore] bef[ore]"},
  {k:"air",name:"The air sound",say:"air",rule:"air (chair), are (care) and ear (bear) can all make this sound.",o:["air","are","ear"],w:"ch[air] h[air] f[air] c[are] sh[are] sc[are]d b[ear] w[ear] p[ear]"},
  {k:"k",name:"The k sound",say:"k",rule:"c before a, o, u (cat), k before e, i, y (kite), ck straight after a short vowel (duck), ch in some words from Greek (school).",o:["c","k","ck","ch"],w:"[c]at [c]old [c]up [k]ite [k]itten [k]ey du[ck] bla[ck] tri[ck] s[ch]ool e[ch]o [ch]emist"},
  {k:"f",name:"The f sound",say:"f",rule:"f is most common, ff after a short vowel at the end (cliff), and ph in words from Greek (phone, dolphin).",o:["f","ff","ph"],w:"[f]ish [f]un lea[f] cli[ff] sti[ff] o[ff] [ph]one [ph]oto dol[ph]in al[ph]abet"},
  {k:"s",name:"The s sound",say:"s",rule:"s is most common. c says s before e, i or y (city, ice). sc is used in some words from Latin (science).",o:["s","c","sc"],w:"[s]un [s]and ki[s]s [c]ity [c]ircle i[c]e [c]entre [sc]ience [sc]ene [sc]issors"},
  {k:"j",name:"The j sound",say:"j",rule:"j at the start (jump), ge at the end after a long vowel or consonant (huge, large), dge straight after a short vowel (badge).",o:["j","ge","dge"],w:"[j]ump [j]am [j]elly hu[ge] ca[ge] pa[ge] lar[ge] ba[dge] fu[dge] bri[dge] he[dge]"},
  {k:"silent",name:"Silent letters",say:"",rule:"Some words have a letter you do not hear: k in kn (knee), w in wr (write), b in mb (lamb), g in gn (gnome).",o:["kn","wr","mb","gn"],w:"[kn]ee [kn]ife [kn]ow [wr]ite [wr]ong [wr]ap la[mb] thu[mb] cli[mb] [gn]ome si[gn] [gn]aw"},
  {k:"ay2",name:"ei, eigh and ey saying ay",say:"ay",rule:"Some words use ei (vein), eigh (eight) or ey (they) for the ay sound.",o:["ei","eigh","ey"],w:"v[ei]n r[ei]n [eigh]t w[eigh]t n[eigh]bour sl[eigh] th[ey] gr[ey] ob[ey] pr[ey]"},
  {k:"le",name:"Endings: le, el, al, il",say:"ul",rule:"le is the most common ending (table). el after m, n, r, s, v, w (camel, travel). al and il in some words (metal, pencil).",o:["le","el","al","il"],w:"tab[le] app[le] litt[le] cam[el] tunn[el] trav[el] met[al] hospit[al] anim[al] penc[il] foss[il] nostr[il]"},
  {k:"tion",name:"Endings: tion, sion, ssion, cian",say:"shun",rule:"tion is most common (station). sion when the root ends in d, de or se (divide → division). ssion when it ends in ss or mit (permit → permission). cian for people's jobs (musician).",o:["tion","sion","ssion","cian"],w:"sta[tion] ac[tion] inven[tion] educa[tion] televi[sion] divi[sion] deci[sion] mi[ssion] permi[ssion] discu[ssion] magi[cian] musi[cian] electri[cian]"},
  {k:"ture",name:"Endings: ture and sure",say:"cher or zher",rule:"ture sounds like 'cher' (picture). sure sounds like 'zher' (treasure).",o:["ture","sure"],w:"pic[ture] adven[ture] na[ture] crea[ture] mea[sure] trea[sure] plea[sure] enclo[sure]"},
  {k:"ous",name:"Ending: ous",say:"us",rule:"Describing words ending in the sound 'us' are spelt ous: famous, dangerous. Naming words end in us: cactus, bonus.",o:["ous","us"],w:"fam[ous] nerv[ous] danger[ous] enorm[ous] jeal[ous] cact[us] bon[us] camp[us] virus"},
  {k:"ible",name:"Endings: able and ible",say:"uh-bul",rule:"able usually follows a whole root word (enjoy → enjoyable). ible usually follows a part that is not a word on its own (poss → possible).",o:["able","ible"],w:"comfort[able] enjoy[able] reason[able] depend[able] poss[ible] horr[ible] terr[ible] vis[ible] incred[ible]"},
  {k:"ant",name:"Endings: ant and ent",say:"unt",rule:"ant and ent sound the same, so learn them by sight. Tip: if there is an -ation word (hesitation), use ant (hesitant).",o:["ant","ent"],w:"import[ant] dist[ant] eleg[ant] observ[ant] differ[ent] sil[ent] accid[ent] innoc[ent]"},
  {k:"cial",name:"Endings: cial and tial",say:"shul",rule:"cial usually follows a vowel (special, official). tial usually follows a consonant (partial, essential).",o:["cial","tial"],w:"spe[cial] offi[cial] so[cial] cru[cial] par[tial] essen[tial] ini[tial] confiden[tial]"},
  {k:"cious",name:"Endings: cious and tious",say:"shus",rule:"If the root word ends in ce, use cious (grace → gracious). Otherwise tious is common (ambitious, cautious).",o:["cious","tious"],w:"vi[cious] deli[cious] pre[cious] gra[cious] ambi[tious] cau[tious] nutri[tious] fic[tious]"},
  {k:"ie",name:"i before e except after c",say:"ee",rule:"When the sound is ee, write ie (believe, field), but write ei straight after c (receive, ceiling).",o:["ie","ei"],w:"bel[ie]ve f[ie]ld ch[ie]f p[ie]ce rec[ei]ve c[ei]ling dec[ei]ve conc[ei]t"},
];
// a word "c[a]k[e]" -> {word:"cake", g:"a-e", mask:"c_k_"}
const PH_BY=Object.fromEntries(PH.map(p=>[p.k,p]));
function phWord(s){
  const parts=s.split(/\[|\]/), word=parts.join(""), gs=parts.filter((_,i)=>i%2), g=gs.length>1?gs.join("-").toLowerCase():(gs[0]||"").toLowerCase();
  const mask=parts.map((x,i)=>i%2?"_".repeat(x.length):x).join("");
  return {word,g,mask,raw:s};
}
PH.forEach(p=>p.items=p.w.split(" ").filter(x=>x.includes("[")).map(phWord));
const phStat=k=>B().eng.phon[k]||{n:0,r:0};
const phDay=(t=today())=>B().eng.plog[t]||{n:0,r:0};
const phAcc=k=>{const s=phStat(k);return s.n?s.r/s.n:0;};
function phQuiz(n=10,only){
  // weakest and least-practised patterns first; 2 to 3 patterns a day, a few words each
  const ps=(only?[PH_BY[only]]:PH.slice().sort((a,b)=>(phStat(a.k).n?phAcc(a.k)+phStat(a.k).n/40:-1)-(phStat(b.k).n?phAcc(b.k)+phStat(b.k).n/40:-1)).slice(0,3));
  const out=[]; for(let i=0;out.length<n&&i<60;i++){const p=ps[i%ps.length];const it=shuffle(p.items)[0];if(!out.some(x=>x.it.word===it.word))out.push({p,it});}
  return shuffle(out);
}

/* ---------- the English screen (phonics and writing) ---------- */
let EV=null;
function openEnglish(view,arg){if(view==="diary"){openDiary();return;}window.__busy=true;$("#eng").hidden=false;document.body.style.overflow="hidden";engShow(view,arg);}
function closeEnglish(){stopAudio();window.__busy=false;$("#eng").hidden=true;document.body.style.overflow="";EV=null;render();}
function engShow(view,arg){
  EV={view,arg,...(EV&&EV.view===view?EV:{})}; EV.view=view; EV.arg=arg; $("#engBody").scrollTop=0;
  $("#engLabel").textContent={phonics:"Phonics: sounds and spellings",lesson:"Phonics lesson",pq:"Phonics practice",diary:"My diary"}[view]||"English";
  ({phonics:phHub,lesson:phLesson,pq:phRun})[view](arg);
}

function phHub(){
  const d=phDay();
  $("#engBody").innerHTML=`<div class="m-q eng-page">
    <p class="muted" style="margin:0">Phonics means knowing which letters make each sound. Each day: 10 quick questions. Listen to the word, then choose the letters that are missing.</p>
    <div class="card row" style="justify-content:space-between;gap:12px"><div><b>Today: ${d.n} of 10 done</b><div class="muted small">${d.n?`${d.r} right`:"Start with today’s 10"}</div></div>
      <button class="btn primary big" data-ph="go">${ic("headphones")}${d.n>=10?"10 more":"Start today’s 10"}</button></div>
    <div class="section-title"><h3 style="margin:0">Spelling patterns</h3><span class="muted small">Tap one to learn it</span></div>
    <div class="ph-grid">${PH.map(p=>{const s=phStat(p.k),a=s.n?Math.round(s.r/s.n*100):null;return `<button class="ph-tile" data-ph-l="${p.k}"><b>${esc(p.o.join(" · "))}</b><span class="muted small">${esc(p.name)}</span>
      <span class="ph-bar"><i style="width:${a??0}%;background:${a==null?"transparent":a>=80?"var(--green-fill)":a>=50?"var(--orange-fill)":"var(--red)"}"></i></span><span class="tiny muted">${a==null?"not practised":a+"% right"}</span></button>`;}).join("")}</div>
  </div>`;
  const B_=$("#engBody");
  B_.querySelector('[data-ph="go"]').onclick=()=>engShow("pq",{set:phQuiz(),i:0,r:0,pick:null});
  B_.querySelectorAll("[data-ph-l]").forEach(b=>b.onclick=()=>engShow("lesson",b.dataset.phL));
}
function phLesson(k){
  const p=PH_BY[k];
  $("#engBody").innerHTML=`<div class="m-q eng-page">
    <h2 style="margin:0">${esc(p.name)}</h2>
    <div class="card"><p style="margin:0;font:500 20px/1.5 var(--round)">${esc(p.rule)}</p>${zhLine(p.rule)}</div>
    ${p.o.map(g=>`<div class="ph-group"><div class="ph-g">${esc(g)}</div><div class="ph-words">${p.items.filter(it=>it.g===g).map(it=>`<button class="ph-w" data-say-w="${esc(it.word)}">${it.raw.replace(/\[([^\]]+)\]/g,"<b>$1</b>")} ${ic("speaker")}</button>`).join("")}</div></div>`).join("")}
    <div class="fm-nav"><button class="btn" id="phBack">${ic("back")}All patterns</button><button class="btn primary" id="phTry">Practise this pattern</button></div>
  </div>`;
  $("#engBody").querySelectorAll("[data-say-w]").forEach(b=>b.onclick=()=>say(b.dataset.sayW));
  $("#phBack").onclick=()=>engShow("phonics"); $("#phTry").onclick=()=>engShow("pq",{set:phQuiz(8,k),i:0,r:0,pick:null});
  zhFill($("#engBody"));
}
function phRun(st){
  if(st.i>=st.set.length){
    $("#engBody").innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(st.r>=st.set.length*.9?3:st.r>=st.set.length*.7?2:st.r>=st.set.length*.4?1:0)}${"☆".repeat(3-(st.r>=st.set.length*.9?3:st.r>=st.set.length*.7?2:st.r>=st.set.length*.4?1:0))}</div>
      <h2>${st.r} out of ${st.set.length} right</h2><p class="muted">Patterns you find hard come back first next time.</p>
      <div class="fm-nav"><button class="btn" id="phHub">All patterns</button><button class="btn primary" id="phDone">Done</button></div></div>`;
    $("#phHub").onclick=()=>engShow("phonics"); $("#phDone").onclick=closeEnglish; return;
  }
  const {p,it}=st.set[st.i], picked=st.pick!=null, ok=picked&&p.o[st.pick]===it.g;
  $("#engBody").innerHTML=`<div class="m-q eng-page">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:var(--c-pink)">${esc(p.name)}</span><span class="muted small">Question ${st.i+1} of ${st.set.length}</span></div>
    <p class="muted" style="margin:0">Listen to the word. Which letters fill the gap?</p>
    <div class="ph-q"><button class="icon-btn" id="phSay" aria-label="Hear the word">${ic("speaker")}</button><span class="ph-mask">${picked?it.raw.replace(/\[([^\]]+)\]/g,`<b class="${ok?"ok":"bad"}">$1</b>`):esc(it.mask).replace(/_/g,"<i>_</i>")}</span></div>
    <div class="m-opts">${p.o.map((g,i)=>`<button class="opt-btn m-opt ${picked&&g===it.g?"right":""} ${picked&&i===st.pick&&!ok?"wrong":""}" data-g="${i}" ${picked?"disabled":""}>${esc(g)}</button>`).join("")}</div>
    ${picked?`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Yes!":"Not quite."} ${esc(it.word)} is spelt with ${esc(it.g)}.</b><span>${esc(p.rule)}</span></div></div>${zhLine(p.rule)}
      <button class="btn primary big" id="phNext">${st.i+1<st.set.length?"Next":"See results"}</button>`:""}
  </div>`;
  const sayIt=()=>say(it.word); $("#phSay").onclick=sayIt; if(!picked)setTimeout(sayIt,250);
  $("#engBody").querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{
    st.pick=+b.dataset.g; const good=p.o[st.pick]===it.g; beep(good); if(good)st.r++;
    const E=B().eng, t=today(), s=E.phon[p.k]||{n:0,r:0}, d=E.plog[t]||{n:0,r:0};
    E.phon[p.k]={n:s.n+1,r:s.r+(good?1:0),u:Date.now()}; E.plog[t]={n:d.n+1,r:d.r+(good?1:0),u:Date.now()}; Store.save();
    phRun(st); setTimeout(()=>say(it.word),200);});
  const nx=$("#phNext"); if(nx)nx.onclick=()=>{st.i++;st.pick=null;phRun(st);};
  zhFill($("#engBody"));
}

/* ---------- 4. Writing: the diary is in diary.js (own keyboard, spelling checked when handed in) ---------- */

/* ---------- 5. Today's plan: about an hour ---------- */
function planItems(){
  const t=today(), dw=dailyWordObjs(t), dl=dictLeft(t), dset=dictSet(t), ph=phDay(t), rd=readSecs(t), di=B().eng.diary[t]||{};
  const md=typeof dayOf==="function"?dayOf(t):null, cu=typeof cuGet==="function"?cuGet(t):null;
  const mathsDone=(md&&Object.keys(md.ans||{}).length>=md.ids.length)||(cu&&Object.keys(cu.ans||{}).length>=cu.ids.length);
  const newLeft=dw.filter(w=>w.stage===0).length;
  return [
    {k:"words",min:10,icon:"sparkle",title:dw.length?`Learn today’s ${dw.length} new words`:"Learn today’s new words",sub:dw.length?(newLeft?`${newLeft} still to learn: ${dw.slice(0,5).map(w=>w.w).join(", ")}${dw.length>5?"…":""}`:`Learned: ${dw.map(w=>w.w).join(", ")}`):"Ask a parent to switch on daily words",done:dw.length>0&&newLeft===0},
    {k:"dict",min:10,icon:"headphones",title:"Dictation",sub:dset.length?(dl.length?`${dl.length} word${dl.length>1?"s":""} to spell from memory`:"All done for today"):"Learn today’s words first",done:dset.length>0&&dl.length===0},
    {k:"phonics",min:10,icon:"wave",title:"Phonics: 10 questions",sub:ph.n?`${Math.min(ph.n,10)} of 10 done · ${ph.r} right`:"Sounds and spelling patterns",done:ph.n>=10},
    {k:"read",min:15,icon:"book",title:"Reading: today’s story and questions",sub:`${Math.floor(rd/60)} of 10 minutes read`,done:rd>=READ_GOAL},
    {k:"write",min:10,icon:"pencil",title:"Write today’s diary",sub:di.text?`${wordsOfText(di.text).length} of ${DIARY_TARGET()} words${di.done?" · finished":""}`:`About ${DIARY_TARGET()} words: what did you do today?`,done:!!di.done},
    {k:"maths",min:15,icon:"maths",title:"Maths: today’s 20 or the check-up",sub:mathsDone?"Done":"On the Maths page",done:!!mathsDone},
  ];
}
function planCard(){
  ensureDailyWords();
  const it=planItems(), done=it.filter(x=>x.done).length, mins=it.reduce((s,x)=>s+x.min,0), left=it.filter(x=>!x.done).reduce((s,x)=>s+x.min,0);
  return `<div class="card plan-card stack">
    <div class="row" style="justify-content:space-between;align-items:center;gap:12px">
      <div><div class="eyebrow">Today’s plan · about ${mins} minutes</div><h2 style="margin:2px 0 0">${done===it.length?"All done today. Brilliant!":`${done} of ${it.length} done`}</h2>
      <div class="muted small">${done===it.length?"Come back tomorrow for new words.":`About ${left} minutes left. Do them in order, a little at a time.`}</div></div>
      <div class="ring lg" style="--p:${done/it.length*100}"><span>${done}/${it.length}</span></div>
    </div>
    <div class="plan-list">${it.map((x,i)=>`<button class="plan-row ${x.done?"done":""}" data-plan="${x.k}"><span class="plan-n">${x.done?ic("check"):i+1}</span>
      <span class="grow"><b>${esc(x.title)}</b><span class="muted small">${esc(x.sub)}</span></span><span class="muted tiny">${x.min} min</span><span class="chev">${ic("chevron")}</span></button>`).join("")}</div>
  </div>`;
}
function engBind(){
  document.querySelectorAll("#view [data-plan]").forEach(b=>b.onclick=()=>{
    const k=b.dataset.plan, t=today();
    if(k==="words"){const ws=dailyWordObjs(t), fresh=ws.filter(w=>w.stage===0);
      if(fresh.length)startSession("learn",fresh.map(w=>w.id),{listDate:t}); else if(ws.length)startSession("full",ws.map(w=>w.id),{listDate:t}); else toast("No daily words. A parent can switch them on.");}
    else if(k==="dict"){const ws=dictLeft(t).length?dictLeft(t):dictSet(t); if(ws.length)startSession("ddict",ws.map(w=>w.id),{listDate:t}); else toast("Learn today’s new words first.");}
    else if(k==="phonics")openEnglish("pq",{set:phQuiz(),i:0,r:0,pick:null});
    else if(k==="read")openReader(todaysReading().id);
    else if(k==="write")openDiary();
    else if(k==="maths")setTab("maths");
  });
  document.querySelectorAll("#view [data-eng]").forEach(b=>b.onclick=()=>openEnglish(b.dataset.eng));
}
$("#engClose").innerHTML=ic("x"); $("#engClose").onclick=closeEnglish;
