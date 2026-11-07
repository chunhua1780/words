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
  {k:"ar",name:"The ar sound (as in car)",say:"ar",rule:"ar is most common (car, garden). In British English a alone often says ar before s, th or f (grass, bath, after), and al in a few words (calm, half).",o:["ar","a","al"],w:"c[ar] st[ar]t g[ar]den sh[ar]p p[ar]k f[a]ther b[a]th gr[a]ss f[a]st cl[a]ss c[al]m p[al]m h[al]f"},
  {k:"oi",name:"The oy sound",say:"oy",rule:"oi in the middle of a word (coin, noise), oy at the end (boy, enjoy).",o:["oi","oy"],w:"c[oi]n p[oi]nt n[oi]se j[oi]n s[oi]l v[oi]ce b[oy] t[oy] enj[oy] destr[oy] r[oy]al empl[oy]"},
  {k:"ear",name:"The ear sound (as in near)",say:"ear",rule:"ear is most common (near, clear). eer in some words (deer, cheer), ere in a few (here, sphere), ier in a few (pier, fierce).",o:["ear","eer","ere","ier"],w:"n[ear] h[ear] cl[ear] y[ear] app[ear] d[eer] ch[eer] st[eer] h[ere] sph[ere] p[ier] f[ier]ce"},
  {k:"sh",name:"The sh sound",say:"sh",rule:"sh is most common (ship, fish). ch in words from French (chef, machine). ti, ci and ssi make sh in the middle of longer words (station, special, mission).",o:["sh","ch","ti","ci","ssi"],w:"[sh]ip fi[sh] [sh]ell [ch]ef ma[ch]ine bro[ch]ure sta[ti]on pa[ti]ent spe[ci]al musi[ci]an mi[ssi]on discu[ssi]on"},
  {k:"ch",name:"The ch sound",say:"ch",rule:"ch is most common (chip, much). tch straight after a short vowel (catch, kitchen). Exceptions to learn: much, such, rich, which.",o:["ch","tch"],w:"[ch]ip [ch]eese mu[ch] ri[ch] bea[ch] tea[ch] ca[tch] ma[tch] wa[tch] ki[tch]en fe[tch] ske[tch]"},
  {k:"ea",name:"Short e spelt ea (as in bread)",say:"e",rule:"The short e sound is usually e (bed). In some words it is ea: bread, head, weather. Learn these ones by heart.",o:["e","ea"],w:"b[e]d r[e]d t[e]nt sp[e]nd br[ea]d h[ea]d w[ea]ther h[ea]vy inst[ea]d br[ea]th"},
  {k:"uo",name:"Short u spelt o or ou",say:"u",rule:"The short u sound is usually u (sun). Some words use o (mother, son, month) or ou (young, touch, country).",o:["u","o","ou"],w:"s[u]n c[u]p j[u]mp m[o]ther br[o]ther s[o]n m[o]nth y[ou]ng t[ou]ch c[ou]ntry d[ou]ble tr[ou]ble"},
  {k:"yi",name:"y saying i (as in gym)",say:"i",rule:"The short i sound is usually i (pin). In some words from Greek it is y: gym, myth, pyramid, mystery.",o:["i","y"],w:"p[i]n s[i]t l[i]d g[y]m m[y]th p[y]ramid m[y]stery s[y]mbol c[y]linder rh[y]thm"},
  {k:"wh",name:"w and wh",say:"w",rule:"w is most common (wet). Question words and some others start with wh: when, where, white, whale, wheel.",o:["w","wh"],w:"[w]et [w]in [w]ant [w]ater [wh]en [wh]ite [wh]ale [wh]eel [wh]isper [wh]ich"},
  {k:"uu",name:"The short oo sound (as in book)",say:"u as in put",rule:"oo is most common (book, look). u in some words (put, push, bull), and ou in could, would, should.",o:["oo","u","ou"],w:"b[oo]k l[oo]k g[oo]d f[oo]t w[oo]l p[u]t p[u]sh b[u]ll f[u]ll c[ou]ld w[ou]ld sh[ou]ld"},
  {k:"g",name:"The g sound: g, gu, gue",say:"g",rule:"g is most common (game). gu before e or i keeps the g hard (guess, guide). gue at the end of some words (league, tongue).",o:["g","gu","gue"],w:"[g]ame [g]ot bi[g] [gu]ess [gu]ide [gu]itar lea[gue] ton[gue] catalo[gue] fati[gue]"},
  {k:"ough",name:"ough and its sounds",say:"",rule:"ough can sound like uff (rough, enough), off (cough), or (bought, thought), oh (though) or ow (plough). Learn these words by sight.",o:["ough","uff","or","ow"],w:"r[ough] en[ough] t[ough] c[ough] b[ough]t th[ough]t br[ough]t st[uff] p[uff] s[or]t c[ow] n[ow]"},
  {k:"inim",name:"Prefixes: in, im, il, ir (meaning not)",say:"",rule:"in is most common (incorrect). im before m or p (impossible, immature), il before l (illegal), ir before r (irregular).",o:["in","im","il","ir"],w:"[in]correct [in]visible [in]active [im]possible [im]patient [im]mature [il]legal [il]logical [ir]regular [ir]responsible [ir]relevant"},
  {k:"plural",name:"Plurals: s, es or ies",say:"",rule:"Add s to most words (cats). Add es after s, x, z, sh or ch (buses, boxes, dishes). A consonant + y: change y to i and add es (babies). A vowel + y: just add s (boys, days).",o:[],w:"cat[s|es] dog[s|es] bus[es|s] box[es|s] fox[es|s] dish[es|s] church[es|s] bab[ies|ys] part[ies|ys] cit[ies|ys] boy[s|ies] day[s|ies] toy[s|ies]"},
  {k:"double",name:"Adding ing and ed: double, drop e or just add",say:"",rule:"Short vowel + one consonant: double it (hop → hopping). A magic e word: drop the e (hope → hoping, make → making). Two consonants or a long vowel sound: just add (jump → jumping).",o:[],w:"ho[pp|p]ing ho[p|pp]ing ru[nn|n]ing swi[mm|m]ing sto[pp|p]ed pla[nn|n]ed jo[gg|g]ing ma[k|kk]ing ri[d|dd]ing sha[k|kk]ing ju[mp|mpp]ing wa[it|itt]ed"},
  {k:"yrule",name:"y changes to i (happier, cried)",say:"",rule:"A consonant + y: change y to i before er, est, ed, ly or ness (happy → happier, cry → cried). A vowel + y keeps the y (play → played). Before ing, keep the y (crying).",o:[],w:"happ[i|y]er bus[i|y]est cr[i|y]ed carr[i|y]ed eas[i|y]ly lazi[ness|yness] pl[ay|ai]ed enj[oy|oi]ed cr[y|i]ing stud[y|i]ing"},
];
// a word "c[a]k[e]" -> {word:"cake", g:"a-e", mask:"c_k_"}
const PH_BY=Object.fromEntries(PH.map(p=>[p.k,p]));
function phWord(s){
  if(s.includes("|")){ // [right|wrong|…]: this word has its own choices (rules such as doubling and plurals)
    const m=s.match(/^(.*)\[([^\]]+)\](.*)$/), ch=m[2].split("|"), word=m[1]+ch[0]+m[3];
    return {word,g:ch[0].toLowerCase(),mask:m[1]+"▢"+m[3],raw:m[1]+"["+ch[0]+"]"+m[3],opts:ch};
  }
  const parts=s.split(/\[|\]/), word=parts.join(""), gs=parts.filter((_,i)=>i%2), g=gs.length>1?gs.join("-").toLowerCase():(gs[0]||"").toLowerCase();
  const mask=parts.map((x,i)=>i%2?"_".repeat(x.length):x).join("");
  return {word,g,mask,raw:s};
}
PH.forEach(p=>p.items=p.w.split(" ").filter(x=>x.includes("[")).map(phWord));
const phStat=k=>B().eng.phon[k]||{n:0,r:0};
const phDay=(t=today())=>B().eng.plog[t]||{n:0,r:0};
const PH_N=20, PH_SPELL=10; // each day: 20 choose-the-letters questions and 10 hear-and-spell words
const phAcc=k=>{const s=phStat(k);return s.n?s.r/s.n:0;};
function phQuiz(n=PH_N,only){
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
  $("#engLabel").textContent={phonics:"Phonics: sounds and spellings",lesson:"Phonics lesson",pq:"Phonics practice",ps:"Hear it, spell it",diary:"My diary"}[view]||"English";
  ({phonics:phHub,lesson:phLesson,pq:phRun,ps:phSpell})[view](arg);
}

function phHub(){
  const d=phDay();
  $("#engBody").innerHTML=`<div class="m-q eng-page">
    <p class="muted" style="margin:0">Phonics means knowing which letters make each sound. Each day: ${PH_N} questions (listen, choose the missing letters), then ${PH_SPELL} words to spell from their sound. 每天：${PH_N} 道选字母组合 + ${PH_SPELL} 个听音写单词。</p>
    <div class="card row" style="justify-content:space-between;gap:12px;flex-wrap:wrap"><div><b>Today: ${Math.min(d.n,PH_N)} of ${PH_N} questions · ${Math.min(d.sn||0,PH_SPELL)} of ${PH_SPELL} words spelt</b><div class="muted small">${d.n?`${d.r} right`:""}${d.sn?` · ${d.sr||0} spelt right`:""}</div></div>
      <div class="row" style="gap:8px"><button class="btn primary big" data-ph="go">${ic("headphones")}${d.n<PH_N||(d.sn||0)<PH_SPELL?"Continue today’s phonics":"More practice"}</button><button class="btn" data-ph="spell">${ic("pencil")}Hear it, spell it</button></div></div>
    <div class="section-title"><h3 style="margin:0">Spelling patterns</h3><span class="muted small">Tap one to learn it</span></div>
    <div class="ph-grid">${PH.map(p=>{const s=phStat(p.k),a=s.n?Math.round(s.r/s.n*100):null;return `<button class="ph-tile" data-ph-l="${p.k}"><b>${esc(p.o.length?p.o.join(" · "):p.name.split(":")[0])}</b><span class="muted small">${esc(p.name)}</span>
      <span class="ph-bar"><i style="width:${a??0}%;background:${a==null?"transparent":a>=80?"var(--green-fill)":a>=50?"var(--orange-fill)":"var(--red)"}"></i></span><span class="tiny muted">${a==null?"not practised":a+"% right"}</span></button>`;}).join("")}</div>
  </div>`;
  const B_=$("#engBody");
  B_.querySelector('[data-ph="go"]').onclick=phToday; B_.querySelector('[data-ph="spell"]').onclick=()=>engShow("ps",phSpellStart());
  B_.querySelectorAll("[data-ph-l]").forEach(b=>b.onclick=()=>engShow("lesson",b.dataset.phL));
}
function phLesson(k){
  const p=PH_BY[k];
  $("#engBody").innerHTML=`<div class="m-q eng-page">
    <h2 style="margin:0">${esc(p.name)}</h2>
    <div class="card"><p style="margin:0;font:500 20px/1.5 var(--round)">${esc(p.rule)}</p>${zhLine(p.rule)}</div>
    ${(p.o.length?p.o:["Examples"]).map(g=>`<div class="ph-group"><div class="ph-g">${esc(g)}</div><div class="ph-words">${p.items.filter(it=>!p.o.length||it.g===g).map(it=>`<button class="ph-w" data-say-w="${esc(it.word)}">${it.raw.replace(/\[([^\]]+)\]/g,"<b>$1</b>")} ${ic("speaker")}</button>`).join("")}</div></div>`).join("")}
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
      ${(phDay().sn||0)<PH_SPELL?`<div class="notice">Next: hear ${PH_SPELL} words and spell them yourself. 下一步：听音写出整个单词。</div>`:""}
      <div class="fm-nav"><button class="btn" id="phHub">All patterns</button>${(phDay().sn||0)<PH_SPELL?`<button class="btn primary big" id="phSp">${ic("pencil")}Hear it, spell it 听音写单词</button>`:`<button class="btn primary" id="phDone">Done</button>`}</div></div>`;
    $("#phHub").onclick=()=>engShow("phonics"); const dn=$("#phDone"); if(dn)dn.onclick=closeEnglish;
    const sp=$("#phSp"); if(sp)sp.onclick=()=>engShow("ps",phSpellStart(st.missed||[])); return;
  }
  const {p,it}=st.set[st.i], picked=st.pick!=null, ok=picked&&(st.opts||[])[st.pick]&&st.opts[st.pick].toLowerCase()===it.g;
  $("#engBody").innerHTML=`<div class="m-q eng-page">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:var(--c-pink)">${esc(p.name)}</span><span class="muted small">Question ${st.i+1} of ${st.set.length}</span></div>
    <p class="muted" style="margin:0">Listen to the word. Which letters fill the gap?</p>
    <div class="ph-q"><button class="icon-btn" id="phSay" aria-label="Hear the word">${ic("speaker")}</button><span class="ph-mask">${picked?it.raw.replace(/\[([^\]]+)\]/g,`<b class="${ok?"ok":"bad"}">$1</b>`):esc(it.mask).replace(/_/g,"<i>_</i>")}</span></div>
    <div class="m-opts">${(st.opts=st.opts||(it.opts?shuffle(it.opts):p.o)).map((g,i)=>`<button class="opt-btn m-opt ${picked&&g.toLowerCase()===it.g?"right":""} ${picked&&i===st.pick&&!ok?"wrong":""}" data-g="${i}" ${picked?"disabled":""}>${esc(g)}</button>`).join("")}</div>
    ${picked?`<div class="mfb ${ok?"ok":"bad"}">${ic(ok?"check":"x")}<div><b>${ok?"Yes!":"Not quite."} ${esc(it.word)} is spelt with ${esc(it.g)}.</b><span>${esc(p.rule)}</span></div></div>${zhLine(p.rule)}
      <button class="btn primary big" id="phNext">${st.i+1<st.set.length?"Next":"See results"}</button>`:""}
  </div>`;
  const sayIt=()=>say(it.word); $("#phSay").onclick=sayIt; if(!picked)setTimeout(sayIt,250);
  $("#engBody").querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{
    st.pick=+b.dataset.g; const good=st.opts[st.pick].toLowerCase()===it.g; beep(good); if(good)st.r++;
    const E=B().eng, t=today(), s=E.phon[p.k]||{n:0,r:0}, d=E.plog[t]||{n:0,r:0};
    E.phon[p.k]={n:s.n+1,r:s.r+(good?1:0),u:Date.now()}; E.plog[t]={...d,n:d.n+1,r:d.r+(good?1:0),u:Date.now()}; Store.save();
    if(!good)(st.missed=st.missed||[]).push({p,it});
    phRun(st); setTimeout(()=>say(it.word),200);});
  const nx=$("#phNext"); if(nx)nx.onclick=()=>{st.i++;st.pick=null;st.opts=null;phRun(st);};
  zhFill($("#engBody"));
}

/* ---------- 4. Writing: the diary is in diary.js (own keyboard, spelling checked when handed in) ---------- */

/* ---------- Hear it, spell it: the whole word from its sound, on the app's own keyboard (no suggestions) ----------
   10 words a day from the weakest patterns (and the words missed in today's questions). Two tries; a word
   still wrong goes into spelling practice (today's word list), so it comes back in dictation. */
function phSpellStart(missed=[]){
  const ps=PH.slice().sort((a,b)=>(phStat(a.k).n?phAcc(a.k)+phStat(a.k).n/40:-1)-(phStat(b.k).n?phAcc(b.k)+phStat(b.k).n/40:-1)).slice(0,5);
  const out=[]; for(const m of missed)if(out.length<4&&!out.some(x=>x.it.word===m.it.word))out.push(m);
  for(let i=0;out.length<PH_SPELL&&i<80;i++){const p=ps[i%ps.length],it=shuffle(p.items)[0];if(!out.some(x=>x.it.word===it.word))out.push({p,it});}
  return {set:shuffle(out),i:0,r:0,input:"",tries:0,state:"ask",wrong:[]};
}
const PS_KEYS=[["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l"],["z","x","c","v","b","n","m","'","-","⌫"]];
function phSpell(st){
  const body=$("#engBody");
  if(st.i>=st.set.length){
    let added=[]; if(st.wrong.length&&typeof diaryAddWords==="function"){const r=diaryAddWords(st.wrong.map(x=>x.it.word));added=[...r.fresh,...r.again];Store.save();}
    body.innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(st.r>=9?3:st.r>=7?2:st.r>=4?1:0)}${"☆".repeat(3-(st.r>=9?3:st.r>=7?2:st.r>=4?1:0))}</div>
      <h2>${st.r} out of ${st.set.length} spelt right</h2>
      ${st.wrong.length?`<div class="card stack tight"><b>Words to learn · 要练习的单词</b><div class="row" style="gap:8px;flex-wrap:wrap">${st.wrong.map(x=>`<span class="dv-pair">${x.it.raw.replace(/\[([^\]]+)\]/g,"<b>$1</b>")}</span>`).join("")}</div>
        <span class="muted small">${added.length?"These are now in your spelling practice and dictation. 已加入单词练习和听写。":""}</span></div>`:`<p class="muted">Every word spelt right. Brilliant! 全对，太棒了！</p>`}
      <div class="fm-nav"><button class="btn" id="phHub">All patterns</button><button class="btn primary" id="phDone">Done</button></div></div>`;
    $("#phHub").onclick=()=>engShow("phonics"); $("#phDone").onclick=closeEnglish; return;
  }
  const {p,it}=st.set[st.i], done=st.state==="right"||st.state==="shown";
  body.innerHTML=`<div class="m-q eng-page">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:var(--c-pink)">Hear it, spell it · 听音写单词</span><span class="muted small">Word ${st.i+1} of ${st.set.length}</span></div>
    <p class="muted" style="margin:0">Listen, then spell the whole word. Think about the sounds: which letters make each one?</p>
    <div class="ph-q"><button class="icon-btn" id="psSay" aria-label="Hear the word">${ic("speaker")}</button><button class="icon-btn" id="psSlow" aria-label="Hear it slowly">${ic("slow")}</button>
      <span class="ps-in ${st.state}">${done&&st.state==="shown"?it.raw.replace(/\[([^\]]+)\]/g,"<b>$1</b>"):esc(st.input)||"&nbsp;"}${done?"":`<i class="caret"></i>`}</span></div>
    ${st.state==="retry"?`<div class="mfb bad">${ic("x")}<div><b>Not quite. Listen again and try once more.</b><span>Hint: this word uses the pattern “${esc(p.name)}”.</span></div></div>`:""}
    ${st.state==="right"?`<div class="mfb ok">${ic("check")}<div><b>Correct! ${esc(it.word)}</b></div></div>`:""}
    ${st.state==="shown"?`<div class="mfb bad">${ic("x")}<div><b>It is spelt ${esc(it.word)}.</b><span>You wrote: <s>${esc(st.input)}</s>. ${esc(p.rule)}</span></div></div>${zhLine(p.rule)}`:""}
    ${done?`<button class="btn primary big" id="psNext">${st.i+1<st.set.length?"Next word":"See results"}</button>`
      :`<div class="ps-kbd">${PS_KEYS.map(r=>`<div class="kbd-row">${r.map(k=>`<button type="button" class="kb ${k==="⌫"?"kb-fn":""}" data-k="${k}">${k}</button>`).join("")}</div>`).join("")}</div>
        <button class="btn primary big" id="psCheck" ${st.input.trim()?"":"disabled"}>Check</button>`}
  </div>`;
  const sayIt=()=>say(it.word); $("#psSay").onclick=sayIt; $("#psSlow").onclick=()=>say(it.word,{slow:true});
  if(st.state==="ask"&&!st.input)setTimeout(sayIt,250);
  body.querySelectorAll(".ps-kbd [data-k]").forEach(b=>b.onpointerdown=e=>{e.preventDefault();const k=b.dataset.k;
    st.input=k==="⌫"?st.input.slice(0,-1):(st.input+k).slice(0,24); if(st.state==="retry")st.state="ask2"; phSpell(st);});
  const ck=$("#psCheck"); if(ck)ck.onclick=()=>{
    const good=st.input.trim().toLowerCase().replace(/’/g,"'")===it.word.toLowerCase(); st.tries++;
    if(!good&&st.tries<2){st.state="retry";beep(false);phSpell(st);setTimeout(sayIt,300);return;}
    st.state=good?"right":"shown"; beep(good); if(good)st.r++; else st.wrong.push({p,it});
    const E=B().eng,t=today(),s=E.phon[p.k]||{n:0,r:0},d=E.plog[t]||{n:0,r:0};
    E.phon[p.k]={n:s.n+1,r:s.r+(good?1:0),u:Date.now()}; E.plog[t]={...d,sn:(d.sn||0)+1,sr:(d.sr||0)+(good?1:0),u:Date.now()}; Store.save();
    phSpell(st); if(good)setTimeout(()=>{if(EV&&EV.view==="ps"&&st.set[st.i]&&st.set[st.i].it===it&&st.state==="right"){st.i++;st.input="";st.tries=0;st.state="ask";phSpell(st);}},1100);
  };
  const nx=$("#psNext"); if(nx)nx.onclick=()=>{st.i++;st.input="";st.tries=0;st.state="ask";phSpell(st);};
  zhFill(body);
}
/* today's phonics: the 20 questions first, then the 10 words to spell */
function phToday(){const d=phDay();if(d.n<PH_N)return engShow("pq",{set:phQuiz(Math.max(10,PH_N-d.n)),i:0,r:0,pick:null});if((d.sn||0)<PH_SPELL)return engShow("ps",phSpellStart());return engShow("pq",{set:phQuiz(),i:0,r:0,pick:null});}

/* ---------- 5. Today's plan: about an hour ---------- */
function planItems(){
  const t=today(), dw=dailyWordObjs(t), dl=dictLeft(t), dset=dictSet(t), ph=phDay(t), rd=readSecs(t), di=B().eng.diary[t]||{};
  const md=typeof dayOf==="function"?dayOf(t):null, cu=typeof cuGet==="function"?cuGet(t):null;
  const mathsDone=(md&&Object.keys(md.ans||{}).length>=md.ids.length)||(cu&&Object.keys(cu.ans||{}).length>=cu.ids.length);
  const newLeft=dw.filter(w=>w.stage===0).length;
  return [
    {k:"words",min:10,icon:"sparkle",title:dw.length?`Learn today’s ${dw.length} new words`:"Learn today’s new words",sub:dw.length?(newLeft?`${newLeft} still to learn: ${dw.slice(0,5).map(w=>w.w).join(", ")}${dw.length>5?"…":""}`:`Learned: ${dw.map(w=>w.w).join(", ")}`):"Ask a parent to switch on daily words",done:dw.length>0&&newLeft===0},
    {k:"dict",min:10,icon:"headphones",title:"Dictation",sub:dset.length?(dl.length?`${dl.length} word${dl.length>1?"s":""} to spell from memory`:"All done for today"):"Learn today’s words first",done:dset.length>0&&dl.length===0},
    {k:"phonics",min:15,icon:"wave",title:`Phonics: ${PH_N} questions + ${PH_SPELL} words to spell`,sub:`${Math.min(ph.n,PH_N)} of ${PH_N} questions · ${Math.min(ph.sn||0,PH_SPELL)} of ${PH_SPELL} spelt`,done:ph.n>=PH_N&&(ph.sn||0)>=PH_SPELL},
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
    else if(k==="phonics"){openEnglish("phonics");phToday();}
    else if(k==="read")openReader(todaysReading().id);
    else if(k==="write")openDiary();
    else if(k==="maths")setTab("maths");
  });
  document.querySelectorAll("#view [data-eng]").forEach(b=>b.onclick=()=>openEnglish(b.dataset.eng));
}
$("#engClose").innerHTML=ic("x"); $("#engClose").onclick=closeEnglish;
