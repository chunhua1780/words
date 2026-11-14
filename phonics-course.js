/* ================= 系统拼读课程 · The phonics course: one sound a day, in a fixed order =================
   Order: the Phase 3 sounds first (sh ch th ng, ai ee igh oa oo …), then the Phase 5 other spellings (ay ou ie ea …),
   then the split vowels (a-e …) and the rarer spellings, as in England's Letters and Sounds programmes.
   Each step: the sound (a key in SOUNDS, sounds.js), the letters, 6 words with the letters in [brackets],
   and a short sentence to read and write that uses the sound. Words are everyday words at her level. */
const COURSE=[
  {k:"sh",g:"sh",w:"[sh]op [sh]ip fi[sh] [sh]ell wi[sh] [sh]ut",s:"The fish swam under the ship."},
  {k:"ch",g:"ch",w:"[ch]ip [ch]in mu[ch] ri[ch] [ch]op lun[ch]",s:"I had chips for lunch."},
  {k:"th",g:"th",w:"[th]in [th]ick ba[th] mo[th] [th]ink [th]ree",s:"I think the moth is thin."},
  {k:"ng",g:"ng",w:"ri[ng] si[ng] ki[ng] lo[ng] so[ng] stro[ng]",s:"The king can sing a long song."},
  {k:"ai",g:"ai",w:"r[ai]n w[ai]t p[ai]n tr[ai]n m[ai]l sn[ai]l",s:"Wait for the train in the rain."},
  {k:"ee",g:"ee",w:"s[ee] tr[ee] f[ee]t b[ee] sh[ee]p gr[ee]n",s:"I can see a bee on the green tree."},
  {k:"igh",g:"igh",w:"n[igh]t l[igh]t h[igh] br[igh]t r[igh]t f[igh]t",s:"The light is bright at night."},
  {k:"oa",g:"oa",w:"b[oa]t c[oa]t g[oa]t r[oa]d s[oa]p t[oa]st",s:"The goat is on the road by the boat."},
  {k:"oo",g:"oo",w:"m[oo]n sp[oo]n z[oo] f[oo]d r[oo]m s[oo]n",s:"We will go to the zoo soon."},
  {k:"oo2",g:"oo",w:"b[oo]k l[oo]k c[oo]k g[oo]d f[oo]t w[oo]d",s:"Look at this good book."},
  {k:"ar",g:"ar",w:"c[ar] f[ar] st[ar] p[ar]k sh[ar]k c[ar]d",s:"The car is far from the park."},
  {k:"or",g:"or",w:"f[or]k c[or]n s[or]t sh[or]t st[or]m h[or]se",s:"The horse ran in the storm."},
  {k:"er",g:"ur",w:"t[ur]n b[ur]n h[ur]t f[ur] ch[ur]ch p[ur]ple",s:"It is my turn to go to church."},
  {k:"ow",g:"ow",w:"c[ow] n[ow] h[ow] d[ow]n t[ow]n br[ow]n",s:"The brown cow is in the town now."},
  {k:"oi",g:"oi",w:"c[oi]n j[oi]n p[oi]nt s[oi]l b[oi]l n[oi]se",s:"Boil the water and join me."},
  {k:"ear",g:"ear",w:"n[ear] h[ear] y[ear] d[ear] t[ear] cl[ear]",s:"Can you hear me? I am near."},
  {k:"air",g:"air",w:"f[air] h[air] p[air] ch[air] st[air]s [air]",s:"She sat on the chair by the stairs."},
  {k:"er",g:"er",w:"h[er] p[er]son f[er]n t[er]m v[er]b s[er]ve",s:"Her sister is a kind person."},
  // Phase 5: other spellings of the same sounds
  {k:"ai",g:"ay",w:"d[ay] pl[ay] s[ay] w[ay] st[ay] tod[ay]",s:"Today we play all day."},
  {k:"ow",g:"ou",w:"[ou]t sh[ou]t cl[ou]d m[ou]th h[ou]se f[ou]nd",s:"I found a mouse in the house."},
  {k:"igh",g:"ie",w:"p[ie] t[ie] l[ie] d[ie] cr[ie]d tr[ie]d",s:"He cried when his pie fell."},
  {k:"ee",g:"ea",w:"s[ea] t[ea] [ea]t r[ea]d m[ea]t dr[ea]m",s:"I eat my meal and read by the sea."},
  {k:"oi",g:"oy",w:"b[oy] t[oy] j[oy] enj[oy] r[oy]al empl[oy]",s:"The boy enjoys his new toy."},
  {k:"er",g:"ir",w:"g[ir]l b[ir]d f[ir]st sh[ir]t th[ir]d d[ir]t",s:"The girl saw the first bird."},
  {k:"oo",g:"ue",w:"bl[ue] gl[ue] tr[ue] cl[ue] d[ue]",s:"Is it true that the glue is blue?"},
  {k:"or",g:"aw",w:"s[aw] dr[aw] p[aw] cr[aw]l l[aw]n str[aw]",s:"I saw the cat's paw. Let's draw it."},
  {k:"w",g:"wh",w:"[wh]en [wh]at [wh]ere [wh]ich [wh]ite [wh]eel",s:"When can I ride the white bike?"},
  {k:"f",g:"ph",w:"[ph]one [ph]oto dol[ph]in gra[ph] al[ph]abet ele[ph]ant",s:"I took a photo of the dolphin."},
  {k:"oo",g:"ew",w:"n[ew] gr[ew] fl[ew] cr[ew] dr[ew] thr[ew]",s:"The bird flew over the new house."},
  {k:"oa",g:"oe",w:"t[oe] g[oe]s f[oe] h[oe] J[oe]",s:"Joe hurt his toe."},
  {k:"or",g:"au",w:"[Au]gust [au]thor h[au]nted l[au]nch c[au]se s[au]ce",s:"In August we read a haunted story."},
  {k:"ee",g:"ey",w:"k[ey] monk[ey] donk[ey] hon[ey] mon[ey] vall[ey]",s:"The monkey has a key and some money."},
  // split vowels (magic e)
  {k:"ai",g:"a-e",w:"c[a]k[e] m[a]k[e] g[a]m[e] n[a]m[e] pl[a]t[e] sn[a]k[e]",s:"Make a cake and play a game."},
  {k:"igh",g:"i-e",w:"t[i]m[e] l[i]k[e] b[i]k[e] f[i]v[e] sm[i]l[e] wr[i]t[e]",s:"I like to ride my bike at five."},
  {k:"oa",g:"o-e",w:"h[o]m[e] b[o]n[e] h[o]l[e] r[o]p[e] st[o]n[e] n[o]t[e]",s:"The dog hid a bone in a hole at home."},
  {k:"oo",g:"u-e",w:"J[u]n[e] r[u]l[e] fl[u]t[e] t[u]n[e] br[u]t[e]",s:"In June she plays the flute."},
  {k:"yoo",g:"u-e",w:"c[u]b[e] t[u]b[e] m[u]l[e] c[u]t[e] h[u]g[e] [u]s[e]",s:"Use the huge cube."},
  {k:"ee",g:"e-e",w:"th[e]s[e] [e]v[e] P[e]t[e] compl[e]t[e] th[e]m[e]",s:"Pete has these on Christmas Eve."},
  // other vowel sounds and spellings
  {k:"oa",g:"ow",w:"sn[ow] gr[ow] sl[ow] bl[ow] sh[ow] wind[ow]",s:"Look out of the window at the snow."},
  {k:"ee",g:"y",w:"happ[y] lad[y] sunn[y] bab[y] funn[y] ver[y]",s:"It is a very sunny and happy day."},
  {k:"igh",g:"y",w:"m[y] fl[y] cr[y] sk[y] wh[y] tr[y]",s:"Why does the baby cry? Try to help."},
  {k:"air",g:"are",w:"c[are] sh[are] sc[are] st[are] squ[are] b[are]",s:"Share with care."},
  {k:"or",g:"ore",w:"m[ore] st[ore] sc[ore] sh[ore] bef[ore] w[ore]",s:"We went to the store before lunch."},
  {k:"ai",g:"eigh",w:"[eigh]t w[eigh] w[eigh]t n[eigh]bour sl[eigh] fr[eigh]t",s:"My neighbour has eight sleighs."},
  {k:"e",g:"ea",w:"h[ea]d br[ea]d d[ea]d br[ea]th w[ea]ther h[ea]vy",s:"Put the heavy bread on your head!"},
  {k:"u",g:"o",w:"s[o]n m[o]ther br[o]ther m[o]nth c[o]me s[o]me",s:"My brother and mother come home."},
  {k:"i",g:"y",w:"g[y]m m[y]th s[y]mbol p[y]ramid m[y]stery c[y]linder",s:"The gym has a pyramid on the wall."},
  {k:"s",g:"c",w:"[c]ity [c]ircle i[c]e ri[c]e fa[c]e pen[c]il",s:"Draw a circle on the face with a pencil."},
  {k:"j",g:"g",w:"[g]iant [g]em ma[g]ic ener[g]y hu[g]e pa[g]e",s:"The giant did a magic trick."},
  {k:"j",g:"dge",w:"ba[dge] bri[dge] e[dge] he[dge] fu[dge] ju[dge]",s:"The badge fell off the edge of the bridge."},
  {k:"ch",g:"tch",w:"ca[tch] ma[tch] wa[tch] ki[tch]en fe[tch] pi[tch]",s:"Catch the ball and fetch the bat."},
  {k:"n",g:"kn",w:"[kn]ee [kn]ow [kn]ife [kn]ot [kn]ock [kn]it",s:"I know how to knock and tie a knot."},
  {k:"r",g:"wr",w:"[wr]ite [wr]ong [wr]ap [wr]ist [wr]eck [wr]en",s:"Write it again if it is wrong."},
  {k:"m",g:"mb",w:"la[mb] cli[mb] thu[mb] co[mb] bo[mb] cru[mb]",s:"The lamb tried to climb the hill."},
  {k:"sh",g:"ti",w:"sta[ti]on ac[ti]on lo[ti]on mo[ti]on na[ti]on frac[ti]on",s:"The train left the station."},
  {k:"zh",g:"s",w:"trea[s]ure mea[s]ure plea[s]ure lei[s]ure u[s]ual",s:"It is a pleasure to find treasure."},
  {k:"k",g:"ch",w:"[ch]emist s[ch]ool e[ch]o [ch]orus stoma[ch] [ch]aos",s:"Our school choir sang a chorus."},
  {k:"sh",g:"ch",w:"[ch]ef ma[ch]ine bro[ch]ure [ch]alet para[ch]ute mousta[ch]e",s:"The chef used a machine."},
];
/* a word "c[a]k[e]" → its letters split into sounds, the taught letters marked: [{t:"c"},{t:"a",on:true,split:"e"},{t:"k"},{t:"e",on:true,tail:true}] */
const GR=["tch","dge","igh","eigh","air","ear","eer","ere","are","ore","ure","ough","our","ai","ay","ee","ea","ie","ei","oa","ow","oe","oo","ue","ew","ar","or","er","ir","ur","ou","oi","oy","aw","au","ey","sh","ch","th","ng","nk","ck","ph","wh","qu","kn","wr","mb","gn","ll","ss","ff","zz","bb","dd","gg","mm","nn","pp","rr","tt","cc"];
function phSplit(raw){
  const word=raw.replace(/[\[\]]/g,""), marks=[]; let pos=0;
  raw.split(/(\[[^\]]+\])/).forEach(p=>{if(!p)return;if(p[0]==="["){marks.push([pos,pos+p.length-2]);pos+=p.length-2;}else pos+=p.length;});
  const split=marks.length===2; // c[a]k[e]: a split vowel
  const out=[]; let i=0; const lw=word.toLowerCase();
  while(i<word.length){
    const m=marks.find(x=>x[0]===i);
    if(m){out.push({t:word.slice(m[0],m[1]),on:true,...(split&&m===marks[1]?{tail:true}:{}),...(split&&m===marks[0]?{split:word.slice(marks[1][0],marks[1][1])}:{})});i=m[1];continue;}
    const g=GR.find(g=>lw.startsWith(g,i)&&!marks.some(x=>x[0]>i&&x[0]<i+g.length));
    const t=g?word.slice(i,i+g.length):word[i]; out.push({t}); i+=t.length;
  }
  return {raw,word,parts:out};
}

COURSE.forEach((c,i)=>{c.id=c.k+":"+c.g+(COURSE.findIndex(x=>x.k===c.k&&x.g===c.g)<i?":"+i:"");c.items=c.w.split(" ").filter(x=>x.includes("[")&&!x.includes("?")).map(phSplit);});
