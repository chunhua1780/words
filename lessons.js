/* ================= 题型动画课 · A cartoon lesson before a type of question she often gets wrong =================
   Shared by both study sites (uses the player in cartoon.js). Lessons: factors (and how many factors), prime
   numbers, prime factors (factor trees), common factors, multiples, square numbers, cube numbers. Each one is
   a short animation with a recorded British voice (audio/ct/L-<name>-<n>.mp3).
   Before a question of that type, the lesson plays first, then the question:
   - when she often gets that type wrong (under 75% right, or wrong in the last 2 weeks), once a day;
   - for primes and factors, at least once a week anyway.
   Watching is saved with her book (book.maths.q["ct:L-…"]), so the parent can see it. */
const LS_LIST=[ // first match wins
  {k:"L-fraccompare",re:/((compare|order|larger|smaller|bigger|greater|greatest|smallest|largest|biggest|<|>).*\d+\/\d+)|(\d+\/\d+.*(larger|smaller|bigger|greater|greatest|smallest|largest|order))|compare.*fraction|order.*fraction/i,weekly:true},
  {k:"L-negative",re:/negative|below zero|temperature|(^|[\s(,:])[−-]\d/i,weekly:true}, // a minus sign stuck to a number (not "8,398 − 6,098")
  {k:"L-roundrange",re:/round.*(smallest|largest|greatest|least|biggest|lowest)|(smallest|largest|greatest|least|biggest|lowest).*round/i,weekly:true},
  {k:"L-round",re:/round/i},
  {k:"L-pfactor",re:/prime factor/i},
  {k:"L-common",re:/common factor|highest common|HCF/i},
  {k:"L-factors",re:/factor/i,weekly:true},
  {k:"L-prime",re:/prime/i,weekly:true},
  {k:"L-multiples",re:/multiple|LCM/i},
  {k:"L-cubes",re:/cube number|cubed|³/i},
  {k:"L-squares",re:/square number|squared|²/i},
];
const LS_NAME={"L-negative":"Negative numbers on a number line","L-fraccompare":"Comparing fractions","L-roundrange":"Rounding: the smallest and largest number","L-round":"Rounding to the nearest 10, 100, 1000","L-factors":"Factors and how many factors","L-prime":"Prime numbers","L-pfactor":"Prime factors","L-common":"Common factors","L-multiples":"Multiples","L-squares":"Square numbers","L-cubes":"Cube numbers"};
function lessonFor(q){if(!q)return null;return LS_LIST.find(l=>l.re.test(q.q||""))||LS_LIST.find(l=>l.re.test(q.o||""))||null;} // the question itself first, then its objective
/* how she does on this type: all saved answers to questions with the same objective */
function lsWeak(q){
  const st=MB().q, two=addDays(today(),-14); let n=0,r=0,recent=false;
  for(const [id,s] of Object.entries(st)){const x=MQ[id]||(s.q&&id.startsWith("w:")?s.q:null);if(!x||x.o!==q.o)continue;n+=s.n||0;r+=s.r||0;if(s.ok===false&&(s.last||"")>=two)recent=true;}
  return recent||(n>=2&&r/n<.75);
}
function lessonGate(q,body){
  if(typeof MS==="undefined"||!MS||MS.kind==="test"||MS.state!=="ask"||typeof ctPlayerHtml!=="function")return false;
  const L=lessonFor(q); if(!L||!CT_SCENES[L.k])return false;
  MS.lsDone=MS.lsDone||{}; if(MS.lsDone[L.k])return false;
  const rec=MB().q["ct:"+L.k], days=rec?dayDiff(rec.last,today()):99;
  const need=String(q.id||"").startsWith("w:")||lsWeak(q)?days>=1:L.weekly&&days>=7;
  if(!need){MS.lsDone[L.k]=1;return false;}
  body.innerHTML=`<div class="m-q fl-q"><span class="kind-tag">🎬 ${esc(LS_NAME[L.k]||"")} · 先看动画再做题</span>
    <div class="m-text">Before the question: let’s see how to do this type. 先看一看这类题怎么做。</div>${ctPlayerHtml(L.k)}
    <div class="row" style="justify-content:flex-end"><button class="btn primary big" id="lsGo" disabled>Now the question · 现在做题</button></div></div>`;
  const root=body.querySelector(".ct-player"), go=()=>{const b=document.getElementById("lsGo");if(b)b.disabled=false;};
  root.querySelector("[data-ctplay]").onclick=()=>ctPlay(root,go); ctPlay(root,go);
  document.getElementById("lsGo").onclick=()=>{ctStop();MS.lsDone[L.k]=1;MS.t0=Date.now();MS.t0i=MS.i;renderMQ();};
  if(typeof zhFill==="function")zhFill(body);
  return true;
}

/* ---------- drawing helpers for these lessons ---------- */
function lsTitle(S,t){ctBase(S);S.list=[];$s(S,"ctShape").innerHTML=`<text x="${CT_W/2}" y="120" text-anchor="middle" class="ls-title ct-pop">${t}</text>`;return 1800;}
/* n dots in r rows (leftovers in red) on the left, a line added to the list on the right */
async function lsArr(S,n,r,line){
  const c=Math.floor(n/r), left=n-r*c, d=Math.min(22,240/Math.max(c+(left?1:0),1),150/r), x0=20+(250-(c+(left?1:0))*d)/2, y0=40+(170-r*d)/2, g=$s(S,"ctFill"), tok=CT.tok;
  g.innerHTML=""; $s(S,"ctShape").innerHTML=""; let k=0;
  for(let j=0;j<r;j++)for(let i=0;i<c;i++){if((!CT||CT.tok!==tok))return 0;g.insertAdjacentHTML("beforeend",`<circle cx="${x0+i*d+d/2}" cy="${y0+j*d+d/2}" r="${d*.38}" class="ls-dot ct-pop"/>`);if(++k<=24)await ctWait(40);}
  for(let i=0;i<left;i++)g.insertAdjacentHTML("beforeend",`<circle cx="${x0+c*d+d/2}" cy="${y0+i*d+d/2}" r="${d*.38}" class="ls-bad ct-pop"/>`);
  g.insertAdjacentHTML("beforeend",`<text x="145" y="${y0+r*d+22}" text-anchor="middle" class="ct-lab sm ct-pop">${r} row${r>1?"s":""} of ${c}${left?` · ${left} left over ✗`:""}</text>`);
  if(line)lsList(S,line,left?"bad":"ok");
  return 1200;
}
function lsList(S,t,cls="ok"){S.list=S.list||[];S.list.push([t,cls]);$s(S,"ctTop").innerHTML=S.list.map(([x,c],i)=>`<text x="268" y="${50+i*30}" class="ls-li ${c}">${x}</text>`).join("");return 600;}
function lsGrid(S,n,hl){
  ctBase(S); const per=10,w=36, rows=Math.ceil(n/per), x0=(CT_W-per*w)/2, y0=60;
  $s(S,"ctShape").innerHTML=[...Array(n)].map((_,i)=>{const v=i+1,x=x0+(i%per)*w,y=y0+Math.floor(i/per)*(w+8),on=hl.includes(v);
    return `<g class="ct-pop" style="animation-delay:${on?.3+hl.indexOf(v)*.35:0}s"><rect x="${x+2}" y="${y}" width="${w-4}" height="${w-4}" rx="7" class="${on?"ls-on":"ls-off"}"/><text x="${x+w/2}" y="${y+w/2+3}" text-anchor="middle" class="ls-n">${v}</text></g>`;}).join("");
  return 1500+hl.length*350;
}
function lsRow(S,y,label,nums,hl=[]){
  $s(S,"ctFill").insertAdjacentHTML("beforeend",`<g class="ct-pop"><text x="16" y="${y}" class="ct-lab sm">${label}</text>${nums.map((v,i)=>`<g><circle cx="${150+i*42}" cy="${y-6}" r="17" class="${hl.includes(v)?"ls-on":"ls-off"}"/><text x="${150+i*42}" y="${y}" text-anchor="middle" class="ls-n">${v}</text></g>`).join("")}</g>`);
  return 1800;
}
function lsHl(S,hl){S.svg.querySelectorAll("#ctFill circle").forEach(c=>{const v=+c.nextElementSibling.textContent;if(hl.includes(v))c.setAttribute("class","ls-on ls-pulse");});return 2200;}
function lsTree(S,stage){
  if(stage===1){ctBase(S);}
  const node=(x,y,v,prime)=>`<g class="ct-pop"><circle cx="${x}" cy="${y}" r="22" class="${prime?"ls-on":"ls-off"}"/><text x="${x}" y="${y+6}" text-anchor="middle" class="ls-n big">${v}</text></g>`, ln=(a,b,c,d)=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" class="ls-line ct-draw" pathLength="100"/>`;
  let h=node(210,40,18,false);
  if(stage>=1)h+=ln(198,58,140,100)+ln(222,58,280,100)+node(130,115,2,stage>=2)+node(290,115,9,false);
  if(stage>=2)h+=ln(280,135,240,178)+ln(300,135,340,178)+node(230,195,3,true)+node(350,195,3,true);
  $s(S,"ctShape").innerHTML=h; return 1800;
}

/* a number line */
function lsLine(S,lo,hi,labels){
  ctBase(S); const x0=40,x1=380,y=150, X=v=>x0+(v-lo)/(hi-lo)*(x1-x0); S.nl={lo,hi,X,y};
  $s(S,"ctShape").innerHTML=`<line x1="${x0-10}" y1="${y}" x2="${x1+10}" y2="${y}" class="nl-axis ct-draw" pathLength="100"/>`+labels.map(v=>`<g class="ct-pop"><line x1="${X(v)}" y1="${y-9}" x2="${X(v)}" y2="${y+9}" class="nl-tick"/><text x="${X(v)}" y="${y+30}" text-anchor="middle" class="ct-lab sm">${v<0?"−"+Math.abs(v).toLocaleString("en-GB"):v.toLocaleString("en-GB")}</text></g>`).join("");
  return 1600;
}
function lsMark(S,v,cls,label,dy=-22){const {X,y}=S.nl;$s(S,"ctTop").insertAdjacentHTML("beforeend",`<g class="ct-pop"><circle cx="${X(v)}" cy="${y}" r="8" class="${cls}"/>${label?`<text x="${X(v)}" y="${y+dy}" text-anchor="middle" class="ct-lab sm ${cls}-t">${label}</text>`:""}</g>`);return 1500;}
function lsBand(S,a,b,cls){const {X,y}=S.nl;$s(S,"ctFill").insertAdjacentHTML("beforeend",`<rect x="${X(a)}" y="${y-14}" width="${X(b)-X(a)}" height="28" rx="6" class="${cls} ct-grow"/>`);return 1600;}
async function lsMove(S,from,to,label){const {X,y}=S.nl,g=$s(S,"ctTop"),tok=CT.tok;g.insertAdjacentHTML("beforeend",`<g id="lsPt"><text class="ct-bug" font-size="26" text-anchor="middle">📍</text><text class="ct-lab sm" text-anchor="middle" dy="-30">${label}</text></g>`);
  const pt=g.querySelector("#lsPt"); for(let k=0;k<=30;k++){if(!CT||CT.tok!==tok)return 0;const v=from+(to-from)*k/30;pt.setAttribute("transform",`translate(${X(v)},${y-12})`);await ctWait(k===0?700:35);} pt.removeAttribute("id"); return 800;}
/* fraction bars: rows of [parts, shaded, label] */
function lsBars(S,rows,keep){
  if(!keep)ctBase(S); const W=290,x0=100,h=34, g=$s(S,"ctFill"); g.innerHTML="";
  rows.forEach(([n,k,lab],j)=>{const y=40+j*58, w=W/n;
    g.insertAdjacentHTML("beforeend",`<g class="ct-pop" style="animation-delay:${j*.5}s"><text x="${x0-14}" y="${y+h/2+7}" text-anchor="end" class="ls-frac">${lab}</text>${[...Array(n)].map((_,i)=>`<rect x="${x0+i*w}" y="${y}" width="${w}" height="${h}" class="${i<k?"fb-on":"fb-off"}" style="animation-delay:${j*.5+i*.08}s"/>`).join("")}</g>`);});
  return 1800+rows.length*500;
}
Object.assign(CT_SCENES,{
  "L-negative":{steps:[
    ["Negative numbers are numbers below zero, like the temperature on a very cold day.",S=>lsTitle(S,"Negative numbers")],
    ["On a number line, zero is in the middle. Positive numbers go to the right. Negative numbers go to the left.",S=>{lsLine(S,-10,10,[-10,-5,0,5,10]);return lsMark(S,0,"nl-b","0");}],
    ["The further left, the smaller the number. So minus 7 is smaller than minus 2.",S=>{lsMark(S,-7,"nl-r","−7");lsMark(S,-2,"nl-g","−2");return ctSum(S,"−7 < −2");}],
    ["To add, move to the right. Minus 3, add 5: start at minus 3, move 5 to the right, and you land on 2.",S=>{lsLine(S,-10,10,[-10,-5,0,5,10]);return lsMove(S,-3,2,"−3 + 5 = 2");}],
    ["To take away, move to the left. 4 take away 6: start at 4, move 6 to the left, and you land on minus 2.",S=>lsMove(S,4,-2,"4 − 6 = −2")],
    ["The difference between minus 3 and 5: count the steps. 3 steps to zero, then 5 more. That makes 8.",S=>{lsLine(S,-10,10,[-10,-5,0,5,10]);lsBand(S,-3,5,"nl-band");return ctSum(S,"3 + 5 = 8");}],
    ["Remember: add, move right. Take away, move left. Further left means smaller.",S=>ctFormula(S,"+ → right · − ← left","−7 < −2 < 0 < 5")]]},
  "L-fraccompare":{steps:[
    ["Which is bigger: 3 fifths, or 2 fifths?",S=>lsTitle(S,"Comparing fractions")],
    ["When the bottom numbers are the same, the pieces are the same size. 3 pieces is more than 2, so 3 fifths is bigger.",S=>{lsBars(S,[[5,3,"3/5"],[5,2,"2/5"]]);return ctSum(S,"3/5 > 2/5");}],
    ["When the top numbers are the same, look at the bottom. 1 third is bigger than 1 quarter: fewer pieces means bigger pieces.",S=>{lsBars(S,[[3,1,"1/3"],[4,1,"1/4"]]);return ctSum(S,"1/3 > 1/4");}],
    ["Different bottom numbers? Make them the same first. Let's compare 2 thirds and 3 quarters.",S=>lsBars(S,[[3,2,"2/3"],[4,3,"3/4"]])],
    ["Change both into twelfths. 2 thirds is 8 twelfths. 3 quarters is 9 twelfths.",S=>lsBars(S,[[12,8,"8/12"],[12,9,"9/12"]])],
    ["9 twelfths is more than 8 twelfths, so 3 quarters is bigger.",S=>ctSum(S,"3/4 > 2/3")],
    ["Remember: same bottom, compare the tops. Different bottoms, make them the same first.",S=>ctFormula(S,"same bottom → compare tops","different bottoms → make them the same")]]},

  "L-round":{steps:[
    ["Let's round 3,746 to the nearest hundred.",S=>lsTitle(S,"Round 3,746 to the nearest 100")],
    ["3,746 is between 3,700 and 3,800. Let's put it on a number line.",S=>{lsLine(S,3700,3800,[3700,3750,3800]);return lsMove(S,3746,3746,"3,746");}],
    ["Look at the tens digit, the 4. It is less than 5, so we round down.",S=>ctSum(S,"3,7(4)6: 4 is less than 5 → round down")],
    ["3,746 is nearer to 3,700. So 3,746 rounded to the nearest hundred is 3,700.",S=>lsMove(S,3746,3700,"→ 3,700")],
    ["If the digit is 5 or more, we round up. 3,756 rounds up to 3,800.",S=>{lsMark(S,3756,"nl-g","3,756");return lsMove(S,3756,3800,"→ 3,800");}],
    ["Remember: find the digit after the place you round to. 0 to 4, round down. 5 to 9, round up.",S=>ctFormula(S,"0–4 round down · 5–9 round up","look at the next digit to the right")]]},
  "L-roundrange":{steps:[
    ["A number was rounded to the nearest hundred, and the answer was 700. What could the number be?",S=>lsTitle(S,"? → nearest 100 → 700")],
    ["Draw a number line from 600 to 800. 700 is in the middle.",S=>{lsLine(S,600,800,[600,650,700,750,800]);return lsMark(S,700,"nl-b","700");}],
    ["Halfway between 600 and 700 is 650. 650 rounds up, to 700. So the smallest number is 650.",S=>lsMark(S,650,"nl-g","smallest 650",-26)],
    ["Halfway between 700 and 800 is 750. But 750 rounds up to 800, so it is too big!",S=>lsMark(S,750,"nl-r","750 → 800 ✗",-26)],
    ["So every whole number from 650 to 749 rounds to 700. The largest is 749.",S=>{lsBand(S,650,749,"nl-band");return ctSum(S,"650 … 749 → 700");}],
    ["Nearest ten: if the answer is 40, the number is from 35 to 44.",S=>{lsLine(S,30,50,[30,35,40,45,50]);lsBand(S,35,44,"nl-band");return ctSum(S,"35 … 44 → 40");}],
    ["Nearest thousand: if the answer is 3,000, the number is from 2,500 to 3,499.",S=>{lsLine(S,2000,4000,[2000,2500,3000,3500,4000]);lsBand(S,2500,3499,"nl-band");return ctSum(S,"2,500 … 3,499 → 3,000");}],
    ["The trick: smallest equals the answer, take away half. Largest equals the answer, add half, then take away 1.",S=>ctFormula(S,"smallest = N − half · largest = N + half − 1","nearest 100: 700 − 50 = 650 · 700 + 50 − 1 = 749")]]},

  "L-factors":{steps:[
    ["Factors of a number are the numbers that divide into it exactly, with nothing left over.",S=>lsTitle(S,"Factors of 12")],
    ["Let's put 12 dots into equal rows. One row of 12: so 1 and 12 are factors.",S=>lsArr(S,12,1,"1 × 12 ✓")],
    ["Two rows of 6: so 2 and 6 are factors.",S=>lsArr(S,12,2,"2 × 6 ✓")],
    ["Three rows of 4: so 3 and 4 are factors.",S=>lsArr(S,12,3,"3 × 4 ✓")],
    ["Can we make 5 equal rows? No: there are dots left over. So 5 is not a factor.",S=>lsArr(S,12,5,"5 ✗")],
    ["After 3 and 4, the pairs meet in the middle, so we can stop. The factors of 12 are 1, 2, 3, 4, 6 and 12.",S=>ctSum(S,"1, 2, 3, 4, 6, 12")],
    ["How many factors does 12 have? Count them: 6 factors. Always find factors in pairs!",S=>ctFormula(S,"12 has 6 factors","1×12 · 2×6 · 3×4")]]},
  "L-prime":{steps:[
    ["A prime number has exactly two factors: 1, and itself.",S=>lsTitle(S,"Prime numbers")],
    ["Look at 7 dots. We can only make one row of 7. So 7 has just two factors, 1 and 7. 7 is prime.",S=>lsArr(S,7,1,"7 = 1 × 7: prime ✓")],
    ["Can 7 dots make 2 equal rows? No, one is left over. 7 is still prime.",S=>lsArr(S,7,2,"")],
    ["Now 6 dots. We can make 2 rows of 3. So 6 has more factors. 6 is not prime.",S=>lsArr(S,6,2,"6 = 2 × 3: not prime")],
    ["Careful! 1 is not prime, because it has only one factor. And 2 is the only even prime number.",S=>ctSum(S,"1 is not prime · 2 is prime")],
    ["The prime numbers up to 20 are 2, 3, 5, 7, 11, 13, 17 and 19. Learn them by heart!",S=>lsGrid(S,20,[2,3,5,7,11,13,17,19])]]},
  "L-pfactor":{steps:[
    ["A prime factor is a factor that is also a prime number.",S=>lsTitle(S,"Prime factors of 18")],
    ["Let's make a factor tree. 18 is 2 times 9.",S=>lsTree(S,1)],
    ["2 is prime, so it turns green. 9 is not prime: 9 is 3 times 3.",S=>lsTree(S,2)],
    ["3 and 3 are prime too. So the prime factors of 18 are 2 and 3, and the largest prime factor is 3.",S=>ctSum(S,"18 = 2 × 3 × 3")]]},
  "L-common":{steps:[
    ["Common factors are factors that two numbers share.",S=>lsTitle(S,"Common factors of 12 and 18")],
    ["First, the factors of 12: 1, 2, 3, 4, 6 and 12.",S=>{ctBase(S);return lsRow(S,90,"12:",[1,2,3,4,6,12]);}],
    ["Next, the factors of 18: 1, 2, 3, 6, 9 and 18.",S=>lsRow(S,160,"18:",[1,2,3,6,9,18])],
    ["The numbers in both lists are 1, 2, 3 and 6. These are the common factors.",S=>lsHl(S,[1,2,3,6])],
    ["The biggest one is 6. So the highest common factor of 12 and 18 is 6.",S=>ctSum(S,"HCF of 12 and 18 = 6")]]},
  "L-multiples":{steps:[
    ["Multiples of a number are the numbers in its times table.",S=>lsTitle(S,"Multiples")],
    ["Multiples of 4: 4, 8, 12, 16, 20, 24.",S=>{ctBase(S);return lsRow(S,90,"× 4:",[4,8,12,16,20,24]);}],
    ["Multiples of 6: 6, 12, 18, 24, 30, 36.",S=>lsRow(S,160,"× 6:",[6,12,18,24,30,36])],
    ["Numbers in both lists are common multiples: 12 and 24. The lowest common multiple is 12.",S=>{lsHl(S,[12,24]);return ctSum(S,"common multiples: 12, 24");}]]},
  "L-squares":{steps:[
    ["A square number is a number times itself. Its dots make a square.",S=>lsTitle(S,"Square numbers")],
    ["3 rows of 3 is 9. 9 is a square number.",S=>lsArr(S,9,3,"3² = 3 × 3 = 9")],
    ["4 rows of 4 is 16. We write 4 squared, with a little 2.",S=>lsArr(S,16,4,"4² = 4 × 4 = 16")],
    ["Careful: 4 squared means 4 times 4, which is 16. It is not 4 times 2!",S=>ctSum(S,"4² = 16, not 8")],
    ["The square numbers are 1, 4, 9, 16, 25, 36, 49, 64, 81 and 100.",S=>ctFormula(S,"1 4 9 16 25 36 49 64 81 100","n² = n × n")]]},
  "L-cubes":{steps:[
    ["A cube number is a number times itself, and times itself again.",S=>lsTitle(S,"Cube numbers")],
    ["2 cubed: 2 cubes long, 2 wide and 2 high.",S=>{ctBase(S);ctIsoSetup(S,2,2,2);return ctCubes(S,2,2,2,1);}],
    ["2 times 2 times 2 makes 8 little cubes. So 2 cubed is 8.",S=>ctSum(S,"2³ = 2 × 2 × 2 = 8")],
    ["The cube numbers are 1, 8, 27, 64, 125 and 1000.",S=>ctFormula(S,"1 8 27 64 125 … 1000","n³ = n × n × n")]]},
});
if(typeof CT_NAMES!=="undefined")Object.assign(CT_NAMES,LS_NAME); // also in the cartoon library (Maths page)
