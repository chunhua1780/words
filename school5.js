/* ================= 学校进度 · Year 5 maths in the order a British school teaches it =================
   Hartland International School follows the English National Curriculum. These are the Year 5 units in the
   usual order (the White Rose scheme most British schools use), with the week each one usually starts in the
   2026–27 school year. Every day's 20 maths questions include 6 from the unit taught now, so practice keeps
   pace with school. The other 14 keep every topic in review.
   A parent can set the unit school is really on (book.prefs.w5Unit) on the parent page. */
const W5_UNITS=[
  {k:"pv",from:"2026-08-31",name:"Place value",zh:"位值（百万以内的数、四舍五入、负数、罗马数字）",topics:["Place value","Rounding","Negative numbers","Roman numerals"]},
  {k:"as",from:"2026-09-28",name:"Addition and subtraction",zh:"加法和减法（竖式、估算、检验）",topics:["Addition and subtraction"]},
  {k:"md1",from:"2026-10-12",name:"Multiplication and division A",zh:"乘除法 A（倍数、因数、质数、平方数、立方数）",topics:["Multiples, factors and primes","Squares and cubes","Multiplication and division"]},
  {k:"fr1",from:"2026-11-09",name:"Fractions A",zh:"分数 A（等值分数、比较大小、假分数和带分数）",topics:["Fractions"]},
  {k:"md2",from:"2026-12-07",name:"Multiplication and division B",zh:"乘除法 B（竖式乘法、短除法）",topics:["Multiplication and division"]},
  {k:"fr2",from:"2027-01-11",name:"Fractions B",zh:"分数 B（分数加减、分数乘整数、求一个数的几分之几）",topics:["Fractions"]},
  {k:"dp",from:"2027-02-01",name:"Decimals and percentages",zh:"小数和百分数",topics:["Decimals","Percentages","Money"]},
  {k:"pa",from:"2027-03-01",name:"Perimeter and area",zh:"周长和面积",topics:["Measurement"]},
  {k:"st",from:"2027-03-15",name:"Statistics",zh:"统计（表格、折线图）",topics:["Statistics","Time"]},
  {k:"sh",from:"2027-04-19",name:"Shape",zh:"图形（角、量角器、多边形）",topics:["Geometry"]},
  {k:"dec",from:"2027-05-10",name:"Decimals",zh:"小数计算",topics:["Decimals","Money"]},
  {k:"neg",from:"2027-06-07",name:"Negative numbers",zh:"负数",topics:["Negative numbers"]},
  {k:"cu",from:"2027-06-14",name:"Converting units",zh:"单位换算",topics:["Measurement","Time"]},
  {k:"vol",from:"2027-06-28",name:"Volume",zh:"体积",topics:["Measurement"]},
];
const W5_BY=Object.fromEntries(W5_UNITS.map(u=>[u.k,u]));
function w5Current(date=today()){
  const pick=((B()||{}).prefs||{}).w5Unit; if(pick&&W5_BY[pick])return {unit:W5_BY[pick],auto:false};
  let u=W5_UNITS[0]; for(const x of W5_UNITS)if(x.from<=date)u=x; return {unit:u,auto:true};
}
/* 6 questions from the unit taught now (seen longest ago first) */
function w5School(date,st,skip){
  const u=w5Current(date).unit, have=new Set(skip);
  const ids=MATHS.filter(q=>u.topics.includes(q.t)&&!have.has(q.id)).map(q=>q.id);
  const fresh=ids.filter(id=>!st[id]), old=ids.filter(id=>st[id]).sort((a,b)=>lastSeen(a,st)-lastSeen(b,st));
  const rnd=seedRand((Store.user||"")+"|w5|"+date); for(let i=fresh.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[fresh[i],fresh[j]]=[fresh[j],fresh[i]];}
  return [...fresh,...old].slice(0,6);
}
function w5Parent(){
  const {unit,auto}=w5Current(), pick=(B().prefs||{}).w5Unit||"", now=W5_UNITS.reduce((u,x)=>x.from<=today()?x:u,W5_UNITS[0]);
  return `<div class="card stack no-zh"><h3 style="margin:0">${ic("calendar")} 学校数学进度 · Maths at school</h3>
    <div class="muted small">按英国 Year 5 课程的常见顺序（Hartland 用的英国国家课程）。每天 20 道数学题里有 6 道来自学校正在教的单元，其余题目继续覆盖所有题型做复习。如果学校实际进度不一样，在这里选。</div>
    <label class="field">学校现在教到 · Unit at school<select id="w5Unit"><option value="">自动：${esc(now.name)} · ${esc(now.zh)}</option>${W5_UNITS.map(u=>`<option value="${u.k}" ${pick===u.k?"selected":""}>${esc(u.name)} · ${esc(u.zh)}（${esc(shortDate(u.from))} 起）</option>`).join("")}</select></label>
    <div class="small">现在练的单元：<b>${esc(unit.name)}</b> · ${esc(unit.zh)}${auto?"（自动）":"（家长设定）"}</div></div>`;
}
function w5ParentBind(){const s=document.getElementById("w5Unit");if(s)s.onchange=()=>{const b=B();b.prefs={...b.prefs,w5Unit:s.value,u:Date.now()};Store.save();render();};}
