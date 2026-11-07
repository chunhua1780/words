/* ================= 笔算 · Division and fractions, every day (Year 5 site) =================
   12 new questions a day, the same on every device (made from the date):
   - 6 divisions of a 4-digit number by a 1-digit number that divide exactly (short division),
   - 6 fraction calculations: add, subtract (same or related denominators), a fraction × a whole number,
     a fraction × a fraction, a fraction ÷ a whole number, and one more add or subtract.
   Each question has its own worked steps (答疑). Marks are kept per day in book.maths.log["cc:<date>"],
   and a wrong answer goes into 错题本 like any other generated question. */
const CC_N=12;
const ccGcd=(a,b)=>b?ccGcd(b,a%b):Math.abs(a);
function ccFrac(n,d){const g=ccGcd(n,d);n/=g;d/=g;if(d===1)return String(n);if(n>d)return `${Math.floor(n/d)} ${n%d}/${d}`;return `${n}/${d}`;}
function ccDiv(r){
  let d,q,n; do{d=3+Math.floor(r()*7);q=Math.ceil(1000/d)+Math.floor(r()*(Math.floor(9999/d)-Math.ceil(1000/d)));n=d*q;}while(n<1000||n>9999||q%10===0&&r()<.7);
  // the short-division steps, digit by digit
  const ds=String(n).split("").map(Number), steps=[]; let carry=0, out="";
  ds.forEach((x,i)=>{const cur=carry*10+x, k=Math.floor(cur/d); carry=cur-k*d; out+=k;
    steps.push(`${cur} ÷ ${d} = ${k}${carry?` remainder ${carry}, so carry ${carry} to the next digit`:""}.`);});
  const fmt=x=>x.toLocaleString("en-GB");
  return {t:"Division",o:"Divide a 4-digit number by a 1-digit number",q:`Work out ${fmt(n)} ÷ ${d}.`,k:"n",a:q,
    w:`Use short division: divide one digit at a time, from the left. ${steps.join(" ")} So ${fmt(n)} ÷ ${d} = ${fmt(q)}. Check: ${fmt(q)} × ${d} = ${fmt(n)}.`};
}
function ccFr(r,kind){
  const pick=(a,b)=>a+Math.floor(r()*(b-a+1));
  if(kind==="add"||kind==="sub"){
    const d=pick(3,12); let a=pick(1,d-1), b=pick(1,d-1); if(kind==="sub"&&a<b)[a,b]=[b,a]; if(kind==="sub"&&a===b)a=Math.min(d-1,a+1);
    const s=kind==="add"?"+":"−", n=kind==="add"?a+b:a-b;
    return {t:"Fractions",o:kind==="add"?"Add fractions with the same denominator":"Subtract fractions with the same denominator",q:`Work out ${a}/${d} ${s} ${b}/${d}. Give your answer in its simplest form.`,k:"f",a:ccFrac(n,d),
      w:`The denominators are the same, so ${kind==="add"?"add":"subtract"} the numerators and keep the denominator: ${a} ${s} ${b} = ${n}, so the answer is ${n}/${d}.${ccFrac(n,d)!==`${n}/${d}`?` Simplify: ${n}/${d} = ${ccFrac(n,d)}.`:""}`};
  }
  if(kind==="rel"){ // related denominators, e.g. 1/4 + 3/8
    const d=pick(2,6), m=pick(2,3), D=d*m, a=pick(1,d-1), b=pick(1,D-1), add=r()<.6||a*m<=b;
    const A=a*m, n=add?A+b:A-b, s=add?"+":"−";
    return {t:"Fractions",o:"Add and subtract fractions with related denominators",q:`Work out ${a}/${d} ${s} ${b}/${D}. Give your answer in its simplest form.`,k:"f",a:ccFrac(n,D),
      w:`Make the denominators the same. ${d} × ${m} = ${D}, so ${a}/${d} = ${A}/${D} (multiply the top and bottom by ${m}). Now ${A}/${D} ${s} ${b}/${D} = ${n}/${D}.${ccFrac(n,D)!==`${n}/${D}`?` Simplify: ${n}/${D} = ${ccFrac(n,D)}.`:""}`};
  }
  if(kind==="mulw"){const d=pick(3,10), a=pick(1,d-1), w=pick(2,9), n=a*w;
    return {t:"Fractions",o:"Multiply a fraction by a whole number",q:`Work out ${a}/${d} × ${w}. Give your answer in its simplest form.`,k:"f",a:ccFrac(n,d),
      w:`Multiply the numerator by the whole number and keep the denominator: ${a} × ${w} = ${n}, so ${n}/${d}.${ccFrac(n,d)!==`${n}/${d}`?` ${n}/${d} = ${ccFrac(n,d)}.`:""}`};}
  if(kind==="mulf"){const d1=pick(2,9), d2=pick(2,9), a=pick(1,d1-1), b=pick(1,d2-1);
    return {t:"Fractions",o:"Multiply two fractions",q:`Work out ${a}/${d1} × ${b}/${d2}. Give your answer in its simplest form.`,k:"f",a:ccFrac(a*b,d1*d2),
      w:`Multiply the numerators: ${a} × ${b} = ${a*b}. Multiply the denominators: ${d1} × ${d2} = ${d1*d2}. So ${a*b}/${d1*d2}.${ccFrac(a*b,d1*d2)!==`${a*b}/${d1*d2}`?` Simplify: ${a*b}/${d1*d2} = ${ccFrac(a*b,d1*d2)}.`:""}`};}
  // a fraction ÷ a whole number
  const d=pick(2,9), a=pick(1,d-1), w=pick(2,6);
  return {t:"Fractions",o:"Divide a fraction by a whole number",q:`Work out ${a}/${d} ÷ ${w}. Give your answer in its simplest form.`,k:"f",a:ccFrac(a,d*w),
    w:`Dividing by ${w} is the same as multiplying by 1/${w}: the denominator gets ${w} times bigger. ${d} × ${w} = ${d*w}, so ${a}/${d} ÷ ${w} = ${a}/${d*w}.${ccFrac(a,d*w)!==`${a}/${d*w}`?` Simplify: ${a}/${d*w} = ${ccFrac(a,d*w)}.`:""}`};
}
function ccSet(date=today()){
  const r=seedRand((Store.user||"")+"|calc|"+date), ids=[];
  const kinds=["add","sub","rel","mulw","mulf","divw"];
  for(let i=0;i<CC_N;i++){
    const q=i<6?ccDiv(r):ccFr(r,kinds[i-6]), id=`g:cc:${date}:${i}`;
    MQ[id]={...q,id,gen:i<6?"cc-div":"cc-fr"}; ids.push(id);
  }
  return ids;
}
function openCalc(){const ids=ccSet(),g=(MB().log||{})["cc:"+today()]||{},done=new Set(g.done||[]),left=ids.filter(id=>!done.has(id.split(":").pop()));
  openMaths({kind:"topic",topic:"笔算 · Division and fractions",ids:left.length?left:ids});}
function calcCard(){
  const g=((MB().log||{})["cc:"+today()])||{n:0,r:0}, nd=(g.done||[]).length;
  return `<div class="card maths-card"><div class="badge lg" style="background:var(--c-purple,#7a5af8);color:#fff">÷</div>
    <div class="grow stack tight" style="gap:4px"><span class="kind-tag">笔算 · Written methods</span><h3 style="margin:0">Division and fractions</h3>
      <div class="muted small">${nd?`${nd} of ${CC_N} done today · ${g.r} right`:"6 short divisions (4-digit ÷ 1-digit) and 6 fraction calculations"}</div></div>
    <button class="btn primary" data-calc>${nd>=CC_N?"Again":nd?"Continue":"Start"}</button></div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-calc]");if(b&&Store.book){e.preventDefault();openCalc();}});
