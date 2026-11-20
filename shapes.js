/* ================= Shapes and formulas: perimeter, area, volume, surface area =================
   A corner on the Maths page for learning and remembering the formulas:
   - Learn: each formula explained step by step with an animated picture (e.g. a cylinder = circles
     stacked up like coins, so V = base area × height = πr²h).
   - Flashcards: picture → formula, marked "I knew it / Not yet" (kept on this device, weakest come first).
   - Formula quiz: 10 questions with a picture every time (which formula, work it out, which shape,
     which units, find a missing length), run on the normal maths screen so 答疑, 中 and read-aloud work.
     Questions are made fresh each time; marks are kept per formula in book.maths.q under "p:fm-<key>".
   - Formula sheet: every formula on one page. */
const FM_PI=3.14;
const fmR=x=>Math.round(x*100)/100;
const fmN=n=>Number(n).toLocaleString("en-GB",{maximumFractionDigits:2});
const fmK=(a,b)=>a+Math.floor(Math.random()*(b-a+1));

/* ---------- drawings: every shape in a 320 × 220 box; lab = side labels, hl = what to highlight or animate ---------- */
const sT=(x,y,t,c="shl",a="middle")=>t==null||t===""?"":`<text x="${x}" y="${y}" text-anchor="${a}" class="${c}">${esc(t)}</text>`;
const sP=(pts,c)=>`<polygon points="${pts.map(p=>p.join(",")).join(" ")}" class="${c}"/>`;
const sL=(x1,y1,x2,y2,c="she")=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}"/>`;
const sRA=(x,y,dx=1)=>`<path d="M${x+10*dx} ${y}V${y-10}H${x}" class="shd2"/>`;
function cuboidPts(x0,y0,W,H,dx,dy){ // front rectangle from (x0,y0) top-left, depth (dx,dy)
  return {F:[[x0,y0],[x0+W,y0],[x0+W,y0+H],[x0,y0+H]],T:[[x0,y0],[x0+W,y0],[x0+W+dx,y0+dy],[x0+dx,y0+dy]],
    R:[[x0+W,y0],[x0+W+dx,y0+dy],[x0+W+dx,y0+H+dy],[x0+W,y0+H]],Bm:[[x0,y0+H],[x0+W,y0+H],[x0+W+dx,y0+H+dy],[x0+dx,y0+H+dy]]};
}
const SHD={
  rect(l,hl){const x=70,y=45,W=180,H=110;let s=`<rect x="${x}" y="${y}" width="${W}" height="${H}" class="shf"/>`;
    if(hl==="grid"){const c=+l.gc||6,r=+l.gr||4,cw=W/c,rh=H/r;for(let j=0;j<r;j++)for(let i=0;i<c;i++)s+=`<rect x="${x+i*cw+1.5}" y="${y+j*rh+1.5}" width="${cw-3}" height="${rh-3}" rx="3" class="sh-cell" style="--d:${(j*c+i)*.05}s"/>`;}
    s+=`<rect x="${x}" y="${y}" width="${W}" height="${H}" class="she ${hl==="perim"?"sh-draw":""}" pathLength="1000"/>`;
    return s+sT(x+W/2,y+H+26,l.l)+sT(x+W+12,y+H/2+6,l.w,"shl","start");},
  square(l,hl){const x=95,y=35,W=130;let s=`<rect x="${x}" y="${y}" width="${W}" height="${W}" class="shf"/>`;
    if(hl==="grid"){const c=+l.gc||4,cw=W/c;for(let j=0;j<c;j++)for(let i=0;i<c;i++)s+=`<rect x="${x+i*cw+1.5}" y="${y+j*cw+1.5}" width="${cw-3}" height="${cw-3}" rx="3" class="sh-cell" style="--d:${(j*c+i)*.06}s"/>`;}
    s+=`<rect x="${x}" y="${y}" width="${W}" height="${W}" class="she ${hl==="perim"?"sh-draw":""}" pathLength="1000"/>`;
    return s+sT(x+W/2,y+W+26,l.s)+sT(x+W+12,y+W/2+6,l.s,"shl","start");},
  tri(l,hl){const A=[50,175],B=[270,175],C=[180,45];let s="";
    if(hl==="box")s+=`<rect x="50" y="45" width="220" height="130" class="shg"/>`+sT(110,100,"half","shn")+sT(240,100,"half","shn");
    s+=sP([A,B,C],"shf "+(hl==="box"?"shx":""))+sP([A,B,C],"she")+sL(180,45,180,175,"shh")+sRA(180,175);
    return s+sT(160,200,l.b)+sT(188,120,l.h,"shl","start");},
  tri3(l,hl){const A=[50,175],B=[270,175],C=[150,45];
    return sP([A,B,C],"shf")+`<polygon points="50,175 270,175 150,45" class="she ${hl==="perim"?"sh-draw":""}" pathLength="1000"/>`+sT(160,200,l.b)+sT(82,105,l.a,"shl","end")+sT(222,105,l.c,"shl","start");},
  par(l,hl){const P=[50,175],Q=[220,175],R=[280,50],S=[110,50];let s=sP([P,Q,R,S],"shf");
    if(hl==="cut")s+=`<polygon points="50,175 110,175 110,50" class="shgap"/><rect x="110" y="50" width="170" height="125" class="shg"/><polygon points="50,175 110,175 110,50" class="shx sh-slide" style="--dx:170px;--dy:0px"/>`;
    return s+sP([P,Q,R,S],"she")+sL(110,50,110,175,"shh")+sRA(110,175)+sT(135,200,l.b)+sT(118,118,l.h,"shl","start");},
  trap(l,hl){const P=[40,175],Q=[280,175],R=[220,55],S=[110,55];let s=sP([P,Q,R,S],"shf");
    if(hl==="mid")s+=sL(75,115,250,115,"shm sh-draw")+sT(162,108,"(a + b) ÷ 2","shn");
    return s+sP([P,Q,R,S],"she")+sL(110,55,110,175,"shh")+sRA(110,175)+sT(160,200,l.b)+sT(165,45,l.a)+sT(102,128,l.h,"shl","end");},
  circle(l,hl){const cx=160,cy=110,r=80;let s=`<circle cx="${cx}" cy="${cy}" r="${r}" class="shf"/>`;
    if(hl==="area")s+=`<rect x="${cx}" y="${cy-r}" width="${r}" height="${r}" class="shx sh-pop"/>`+sT(cx+r/2,cy-r/2+6,"r²","shn");
    s+=`<circle cx="${cx}" cy="${cy}" r="${r}" class="she ${hl==="perim"?"sh-draw":""}" pathLength="1000"/><circle cx="${cx}" cy="${cy}" r="3.5" class="shdot"/>`;
    if(l.d)s+=sL(cx-r,cy,cx+r,cy,"shh")+sT(cx,cy+24,l.d);
    else s+=sL(cx,cy,cx+r,cy,"shh")+sT(cx+r/2,cy+24,l.r);
    return s;},
  cube(l,hl){return cuboidDraw(85,75,120,110,50,-36,{l:"",w:"",h:"",s:l.s},hl,+l.n||3);},
  cuboid(l,hl){return cuboidDraw(55,85,160,100,64,-42,l,hl,+l.n||4);},
  prism(l,hl){const A=[50,185],B=[180,185],C=[115,95],dx=115,dy=-48,mv=p=>[p[0]+dx,p[1]+dy];let s="";
    s+=sP([C,mv(C),mv(B),B],"shf")+sP([A,B,C],"shf "+(hl==="cross"||hl==="slide"?"shx":""));
    if(hl==="slide")for(let i=1;i<=4;i++){const k=i/4;s+=`<polygon points="${[A,B,C].map(p=>[p[0]+dx*k,p[1]+dy*k].join(",")).join(" ")}" class="shx2 sh-rise" style="--d:${i*.35}s"/>`;}
    s+=sL(...A,...mv(A),"shd")+sL(...mv(A),...mv(B),"shd")+sL(...mv(A),...mv(C),"shd");
    s+=sP([A,B,C],"she")+sL(...C,...mv(C))+sL(...B,...mv(B))+sL(...mv(B),...mv(C));
    s+=sL(115,95,115,185,"shh")+sRA(115,185);
    return s+sT(115,207,l.b)+sT(122,148,l.h,"shl","start")+sT(250,172,l.l,"shl","start");},
  cyl(l,hl){const cx=160,rx=85,ry=22,yt=55,yb=178;let s="";
    s+=`<path d="M${cx-rx} ${yt}V${yb}A${rx} ${ry} 0 0 0 ${cx+rx} ${yb}V${yt}" class="shf"/>`;
    if(hl==="base")s+=`<ellipse cx="${cx}" cy="${yb}" rx="${rx}" ry="${ry}" class="shx sh-pop"/>`+sT(cx,yb+6,"πr²","shn");
    if(hl==="stack")for(let i=0;i<6;i++)s+=`<ellipse cx="${cx}" cy="${yb-i*(yb-yt)/5}" rx="${rx}" ry="${ry}" class="shx2 sh-rise" style="--d:${i*.4}s"/>`;
    s+=`<path d="M${cx-rx} ${yb}A${rx} ${ry} 0 0 1 ${cx+rx} ${yb}" class="shd"/><path d="M${cx-rx} ${yb}A${rx} ${ry} 0 0 0 ${cx+rx} ${yb}" class="she"/>`;
    s+=sL(cx-rx,yt,cx-rx,yb)+sL(cx+rx,yt,cx+rx,yb)+`<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" class="shf2"/><ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" class="she"/>`;
    s+=`<circle cx="${cx}" cy="${yt}" r="3" class="shdot"/>`+sL(cx,yt,cx+rx,yt,"shh")+sT(cx+rx/2,yt+20,l.r)+sT(cx+rx+12,(yt+yb)/2+6,l.h,"shl","start");
    return s;},
  cylnet(l,hl){let s=`<rect x="100" y="70" width="190" height="80" class="shf"/><rect x="100" y="70" width="190" height="80" class="she"/>`;
    s+=`<circle cx="62" cy="40" r="30" class="shx"/><circle cx="62" cy="40" r="30" class="she"/><circle cx="62" cy="180" r="30" class="shx"/><circle cx="62" cy="180" r="30" class="she"/>`;
    return s+sT(62,46,"πr²","shn")+sT(62,186,"πr²","shn")+sT(195,170,"2πr (the circumference)","shn")+sT(296,116,"h","shl","start")+sT(195,116,"2πr × h","shn");},
};
function cuboidDraw(x0,y0,W,H,dx,dy,l,hl,n){
  const P=cuboidPts(x0,y0,W,H,dx,dy);let s="";
  s+=sP(P.T,"shf2")+sP(P.R,"shf3")+sP(P.F,"shf");
  if(hl==="base")s+=sP(P.Bm,"shx sh-pop");
  if(hl==="pairs")s+=sP(P.T,"shx sh-pop")+sP(P.F,"shx2 sh-pop")+sP(P.R,"shx3 sh-pop");
  if(hl==="layers"){for(let i=0;i<n;i++){const yb=y0+H-i*H/n,yt=yb-H/n;
    s+=`<g class="sh-rise shly" style="--d:${i*.45}s">${sP([[x0,yt],[x0+W,yt],[x0+W,yb],[x0,yb]],"shx")}${sP([[x0+W,yt],[x0+W+dx,yt+dy],[x0+W+dx,yb+dy],[x0+W,yb]],"shx3")}${i===n-1?sP([[x0,yt],[x0+W,yt],[x0+W+dx,yt+dy],[x0+dx,yt+dy]],"shx2"):""}</g>`;}}
  const B=[x0+dx,y0+H+dy];
  s+=sL(x0,y0+H,...B,"shd")+sL(...B,x0+W+dx,y0+H+dy,"shd")+sL(...B,x0+dx,y0+dy,"shd");
  s+=sP(P.F,"she")+sL(x0,y0,x0+dx,y0+dy)+sL(x0+dx,y0+dy,x0+W+dx,y0+dy)+sL(x0+W,y0,x0+W+dx,y0+dy)+sL(x0+W+dx,y0+dy,x0+W+dx,y0+H+dy)+sL(x0+W,y0+H,x0+W+dx,y0+H+dy);
  if(l.s)return s+sT(x0+W/2,y0+H+24,l.s)+sT(x0-10,y0+H/2+6,l.s,"shl","end")+sT(x0+W+dx/2+10,y0+H+dy/2+12,l.s,"shl","start");
  return s+sT(x0+W/2,y0+H+24,l.l)+sT(x0-10,y0+H/2+6,l.h,"shl","end")+sT(x0+W+dx/2+10,y0+H+dy/2+12,l.w,"shl","start");
}
const shapeSVG=(sh,lab={},hl="",cls="")=>`<svg class="sh-svg ${cls}" viewBox="0 0 320 220" role="img" aria-label="${esc(sh)}">${SHD[sh](lab,hl)}</svg>`;

/* ---------- the formulas ---------- */
const FM_M={Perimeter:"var(--c-blue)",Area:"var(--c-teal)",Volume:"var(--c-purple)","Surface area":"var(--c-orange)"};
const FMS=[
  {k:"rect-p",m:"Perimeter",sh:"rect",name:"Rectangle",f:"P = 2(l + w)",vars:"l = length, w = width",lab:{l:"l",w:"w"},wrong:["P = l × w","P = l + w","P = 4l"],
    frames:[["","A rectangle has two lengths (l) and two widths (w)."],["perim","Perimeter is the distance all the way round: l + w + l + w."],["perim","That is two lots of (l + w), so P = 2(l + w)."]],
    calc:()=>{const l=fmK(3,20),w=fmK(2,15);return {lab:{l:l+" cm",w:w+" cm"},v:{l,w},a:2*(l+w),sub:`P = 2(${l} + ${w})`,work:[`${l} + ${w} = ${l+w}`,`2 × ${l+w} = ${2*(l+w)}`]};},
    miss:()=>{const l=fmK(4,20),w=fmK(2,12);return {q:`A rectangle has perimeter ${2*(l+w)} cm and length ${l} cm. What is its width?`,lab:{l:l+" cm",w:"? cm"},a:w,steps:[`P = 2(l + w), so l + w = P ÷ 2 = ${2*(l+w)} ÷ 2 = ${l+w}.`,`w = ${l+w} − ${l} = ${w} cm.`]};}},
  {k:"sq-p",m:"Perimeter",sh:"square",name:"Square",f:"P = 4s",vars:"s = side",lab:{s:"s"},wrong:["P = s²","P = 2s","P = s + 4"],
    frames:[["","All four sides of a square are the same length, s."],["perim","Go all the way round: s + s + s + s."],["perim","Four lots of s: P = 4s."]],
    calc:()=>{const s=fmK(3,25);return {lab:{s:s+" cm"},v:{s},a:4*s,sub:`P = 4 × ${s}`,work:[`4 × ${s} = ${4*s}`]};}},
  {k:"tri-p",m:"Perimeter",sh:"tri3",name:"Triangle",f:"P = a + b + c",vars:"a, b, c = the three sides",lab:{a:"a",b:"b",c:"c"},wrong:["P = ½ × b × h","P = a × b × c","P = 3a"],
    frames:[["","A triangle has three sides: a, b and c."],["perim","Walk all the way round and add the three sides."],["perim","P = a + b + c."]],
    calc:()=>{const a=fmK(4,15),b=fmK(Math.max(5,a),20),c=fmK(Math.max(4,b-a+1),Math.min(18,a+b-1));return {lab:{a:a+" cm",b:b+" cm",c:c+" cm"},v:{a,b,c},a:a+b+c,sub:`P = ${a} + ${b} + ${c}`,work:[`${a} + ${b} + ${c} = ${a+b+c}`]};}},
  {k:"circ-c",m:"Perimeter",sh:"circle",name:"Circle (circumference)",f:"C = πd = 2πr",vars:"d = diameter, r = radius, π ≈ 3.14",lab:{r:"r"},wrong:["C = πr²","C = 2r","C = πr"],
    frames:[["","The radius r goes from the centre to the edge."],["","The diameter d goes right across through the centre, so d = 2r."],["perim","The circumference is the distance round the circle. It is always about 3.14 times the diameter. This number is π (pi)."],["perim","So C = π × d, and because d = 2r, also C = 2 × π × r."]],
    calc:()=>{const useD=Math.random()<.5,r=fmK(2,12);return useD?{lab:{d:2*r+" cm"},v:{d:2*r},a:fmR(FM_PI*2*r),sub:`C = π × d = 3.14 × ${2*r}`,work:[`3.14 × ${2*r} = ${fmN(fmR(FM_PI*2*r))}`]}
      :{lab:{r:r+" cm"},v:{r},a:fmR(2*FM_PI*r),sub:`C = 2 × π × r = 2 × 3.14 × ${r}`,work:[`2 × ${r} = ${2*r}`,`3.14 × ${2*r} = ${fmN(fmR(FM_PI*2*r))}`]};}},
  {k:"rect-a",m:"Area",sh:"rect",name:"Rectangle",f:"A = l × w",vars:"l = length, w = width",lab:{l:"l",w:"w"},wrong:["A = 2(l + w)","A = l + w","A = ½ × l × w"],
    frames:[["","Area is how many 1 cm squares cover the shape."],["grid","Fill it with squares: l squares along each row, and w rows."],["grid","Rows × squares in each row: A = l × w. Area is in square units, cm²."]],
    calc:()=>{const l=fmK(3,20),w=fmK(2,15);return {lab:{l:l+" cm",w:w+" cm",gc:Math.min(l,12),gr:Math.min(w,8)},v:{l,w},a:l*w,sub:`A = ${l} × ${w}`,work:[`${l} × ${w} = ${l*w}`]};},
    miss:()=>{const l=fmK(3,15),w=fmK(2,12);return {q:`A rectangle has area ${l*w} cm² and length ${l} cm. What is its width?`,lab:{l:l+" cm",w:"? cm"},a:w,steps:["A = l × w, so w = A ÷ l.",`w = ${l*w} ÷ ${l} = ${w} cm.`]};}},
  {k:"sq-a",m:"Area",sh:"square",name:"Square",f:"A = s²",vars:"s = side (s² means s × s)",lab:{s:"s"},wrong:["A = 4s","A = 2s","A = s + s"],
    frames:[["","A square has equal sides s."],["grid","Fill it with squares: s rows of s squares."],["grid","A = s × s, written s² (s squared). It is NOT s × 2."]],
    calc:()=>{const s=fmK(2,15);return {lab:{s:s+" cm",gc:Math.min(s,10)},v:{s},a:s*s,sub:`A = ${s}²`,work:[`${s}² = ${s} × ${s} = ${s*s}`]};},
    miss:()=>{const s=fmK(2,12);return {q:`A square has area ${s*s} cm². How long is each side?`,lab:{s:"? cm"},a:s,steps:["A = s², so s = √A: which number times itself makes the area?",`${s} × ${s} = ${s*s}, so s = ${s} cm.`]};}},
  {k:"tri-a",m:"Area",sh:"tri",name:"Triangle",f:"A = ½ × b × h",vars:"b = base, h = perpendicular height",lab:{b:"b",h:"h"},wrong:["A = b × h","A = a + b + c","A = ½(a + b)h"],
    frames:[["","A triangle with base b and perpendicular height h (the straight-up height, at a right angle to the base)."],["box","Draw a rectangle round it: b wide and h tall. Its area is b × h."],["box","The triangle fills exactly half of that rectangle."],["box","So A = ½ × b × h. Never use the sloping side as the height."]],
    calc:()=>{const b=fmK(2,12)*2,h=fmK(3,15);return {lab:{b:b+" cm",h:h+" cm"},v:{b,h},a:b*h/2,sub:`A = ½ × ${b} × ${h}`,work:[`${b} × ${h} = ${b*h}`,`half of ${b*h} = ${b*h/2}`]};},
    miss:()=>{const b=fmK(2,10)*2,h=fmK(3,14);return {q:`A triangle has area ${b*h/2} cm² and base ${b} cm. What is its perpendicular height?`,lab:{b:b+" cm",h:"? cm"},a:h,steps:["A = ½ × b × h, so b × h = 2 × A.",`b × h = 2 × ${b*h/2} = ${b*h}.`,`h = ${b*h} ÷ ${b} = ${h} cm.`]};}},
  {k:"par-a",m:"Area",sh:"par",name:"Parallelogram",f:"A = b × h",vars:"b = base, h = perpendicular height",lab:{b:"b",h:"h"},wrong:["A = ½ × b × h","A = 2(b + h)","A = b × slanting side"],
    frames:[["","A parallelogram with base b and perpendicular height h."],["cut","Cut the triangle off one end and slide it to the other end…"],["cut","…it becomes a rectangle b wide and h tall."],["cut","So A = b × h. Use the straight-up height, not the slanting side."]],
    calc:()=>{const b=fmK(3,18),h=fmK(2,14);return {lab:{b:b+" cm",h:h+" cm"},v:{b,h},a:b*h,sub:`A = ${b} × ${h}`,work:[`${b} × ${h} = ${b*h}`]};}},
  {k:"trap-a",m:"Area",sh:"trap",name:"Trapezium",f:"A = ½(a + b)h",vars:"a, b = the parallel sides, h = height",lab:{a:"a",b:"b",h:"h"},wrong:["A = (a + b)h","A = a × b × h","A = ½ × a × h"],
    frames:[["","A trapezium has two parallel sides, a (top) and b (bottom), and height h."],["mid","The line halfway up is the average of a and b: (a + b) ÷ 2."],["mid","The trapezium has the same area as a rectangle that wide and h tall."],["mid","So A = (a + b) ÷ 2 × h, written A = ½(a + b)h. Add the parallel sides first!"]],
    calc:()=>{const a=fmK(2,10),b=a+fmK(2,10),h=fmK(2,7)*2;return {lab:{a:a+" cm",b:b+" cm",h:h+" cm"},v:{a,b,h},a:(a+b)*h/2,sub:`A = ½ × (${a} + ${b}) × ${h}`,work:[`${a} + ${b} = ${a+b}`,`half of ${a+b} = ${fmN((a+b)/2)}`,`${fmN((a+b)/2)} × ${h} = ${fmN((a+b)*h/2)}`]};}},
  {k:"circ-a",m:"Area",sh:"circle",name:"Circle",f:"A = πr²",vars:"r = radius, π ≈ 3.14",lab:{r:"r"},wrong:["A = 2πr","A = πd","A = 2r²"],
    frames:[["","A circle with radius r."],["area","Draw a square on the radius. Its area is r × r = r²."],["area","About 3.14 (π) of these squares fill the circle."],["area","So A = π × r × r = πr². Square the radius first, then multiply by π. (If you are given the diameter, halve it first!)"]],
    calc:()=>{const useD=Math.random()<.3,r=fmK(1,10);return {lab:useD?{d:2*r+" cm"}:{r:r+" cm"},v:{r},a:fmR(FM_PI*r*r),sub:`A = 3.14 × ${r}²`,work:[...(useD?[`The diameter is ${2*r}, so the radius is ${2*r} ÷ 2 = ${r}`]:[]),`${r}² = ${r*r}`,`3.14 × ${r*r} = ${fmN(fmR(FM_PI*r*r))}`]};}},
  {k:"cube-v",m:"Volume",sh:"cube",name:"Cube",f:"V = s³",vars:"s = side (s³ means s × s × s)",lab:{s:"s",n:3},wrong:["V = 6s²","V = 3s","V = s²"],
    frames:[["","A cube: every edge is the same length, s."],["base","The bottom layer is s × s cubes."],["layers","There are s layers like that."],["layers","V = s × s × s = s³ (s cubed). Volume is in cubic units, cm³."]],
    calc:()=>{const s=fmK(2,9);return {lab:{s:s+" cm"},v:{s},a:s*s*s,sub:`V = ${s}³`,work:[`${s} × ${s} = ${s*s}`,`${s*s} × ${s} = ${s*s*s}`]};},
    miss:()=>{const s=fmK(2,6);return {q:`A cube has a volume of ${s**3} cm³. How long is each edge?`,lab:{s:"? cm"},a:s,steps:["V = s³: which number × itself × itself makes the volume?",`${s} × ${s} × ${s} = ${s**3}, so s = ${s} cm.`]};}},
  {k:"cuboid-v",m:"Volume",sh:"cuboid",name:"Cuboid",f:"V = l × w × h",vars:"l = length, w = width, h = height",lab:{l:"l",w:"w",h:"h"},wrong:["V = 2(lw + lh + wh)","V = l + w + h","V = ½ × l × w × h"],
    frames:[["","A cuboid with length l, width w and height h."],["base","Step 1: the bottom layer is a rectangle, l × w. That many 1 cm cubes fit on it."],["layers","Step 2: stack h layers like that on top of each other."],["layers","V = l × w × h (base area × height). Volume is in cm³."]],
    calc:()=>{const l=fmK(2,12),w=fmK(2,10),h=fmK(2,10);return {lab:{l:l+" cm",w:w+" cm",h:h+" cm"},v:{l,w,h},a:l*w*h,sub:`V = ${l} × ${w} × ${h}`,work:[`${l} × ${w} = ${l*w} (the base)`,`${l*w} × ${h} = ${l*w*h}`]};},
    miss:()=>{const l=fmK(2,10),w=fmK(2,8),h=fmK(2,9);return {q:`A cuboid has volume ${l*w*h} cm³. It is ${l} cm long and ${w} cm wide. How tall is it?`,lab:{l:l+" cm",w:w+" cm",h:"? cm"},a:h,steps:["V = l × w × h, so h = V ÷ (l × w).",`l × w = ${l} × ${w} = ${l*w}.`,`h = ${l*w*h} ÷ ${l*w} = ${h} cm.`]};}},
  {k:"prism-v",m:"Volume",sh:"prism",name:"Prism",f:"V = area of cross-section × length",vars:"for this triangular prism: (½ × b × h) × l",lab:{b:"b",h:"h",l:"l"},wrong:["V = b × h × l","V = ½ × b × h","V = b + h + l"],
    frames:[["","A prism has the same shape all the way through. This one has a triangle at the end."],["cross","Step 1: find the area of the end shape (the cross-section). For a triangle: ½ × b × h."],["slide","Step 2: the same triangle carries on all the way along the length l."],["slide","V = area of cross-section × length = ½ × b × h × l."]],
    calc:()=>{const b=fmK(2,8)*2,h=fmK(3,10),l=fmK(4,15);return {lab:{b:b+" cm",h:h+" cm",l:l+" cm"},v:{b,h,l},a:b*h/2*l,sub:`V = ½ × ${b} × ${h} × ${l}`,work:[`Cross-section: ½ × ${b} × ${h} = ${b*h/2}`,`${b*h/2} × ${l} = ${b*h/2*l}`]};}},
  {k:"cyl-v",m:"Volume",sh:"cyl",name:"Cylinder",f:"V = πr²h",vars:"r = radius of the base, h = height, π ≈ 3.14",lab:{r:"r",h:"h"},wrong:["V = 2πrh","V = πr²","V = 2πr²h"],
    frames:[["","A cylinder: a circle at each end, radius r, and height h."],["base","Step 1: the base is a circle. Its area is π × r × r = πr²."],["stack","Step 2: a cylinder is lots of those circles stacked up to height h, like a pile of coins."],["stack","Step 3: V = base area × height = πr² × h = πr²h."]],
    calc:()=>{const r=fmK(1,6),h=fmK(2,12);return {lab:{r:r+" cm",h:h+" cm"},v:{r,h},a:fmR(FM_PI*r*r*h),sub:`V = 3.14 × ${r}² × ${h}`,work:[`Base: ${r}² = ${r*r}, 3.14 × ${r*r} = ${fmN(fmR(FM_PI*r*r))}`,`× height: ${fmN(fmR(FM_PI*r*r))} × ${h} = ${fmN(fmR(FM_PI*r*r*h))}`]};}},
  {k:"cube-sa",m:"Surface area",sh:"cube",name:"Cube",f:"SA = 6s²",vars:"s = side",lab:{s:"s"},wrong:["SA = s³","SA = 4s","SA = 6s"],
    frames:[["","Surface area is the total area of all the faces (like the wrapping paper)."],["pairs","A cube has 6 faces, and each one is a square s × s = s²."],["pairs","SA = 6 × s² = 6s². It is an area, so cm²."]],
    calc:()=>{const s=fmK(2,10);return {lab:{s:s+" cm"},v:{s},a:6*s*s,sub:`SA = 6 × ${s}²`,work:[`${s}² = ${s*s}`,`6 × ${s*s} = ${6*s*s}`]};}},
  {k:"cuboid-sa",m:"Surface area",sh:"cuboid",name:"Cuboid",f:"SA = 2(lw + lh + wh)",vars:"l = length, w = width, h = height",lab:{l:"l",w:"w",h:"h"},wrong:["SA = l × w × h","SA = 6lw","SA = lw + lh + wh"],
    frames:[["","A cuboid has 6 faces in 3 matching pairs."],["pairs","Top and bottom: l × w each. Front and back: l × h each. The two sides: w × h each."],["pairs","Add one of each, then double: SA = 2(lw + lh + wh)."]],
    calc:()=>{const l=fmK(2,10),w=fmK(2,8),h=fmK(2,8);return {lab:{l:l+" cm",w:w+" cm",h:h+" cm"},v:{l,w,h},a:2*(l*w+l*h+w*h),sub:`SA = 2(${l}×${w} + ${l}×${h} + ${w}×${h})`,work:[`${l*w} + ${l*h} + ${w*h} = ${l*w+l*h+w*h}`,`2 × ${l*w+l*h+w*h} = ${2*(l*w+l*h+w*h)}`]};}},
  {k:"cyl-sa",m:"Surface area",sh:"cyl",name:"Cylinder",f:"SA = 2πr² + 2πrh",vars:"r = radius, h = height, π ≈ 3.14",lab:{r:"r",h:"h"},wrong:["SA = πr²h","SA = 2πrh","SA = πr² + 2πrh"],
    frames:[["","Open the cylinder out flat (its net)."],["net","There are 2 circles, each πr², and one rectangle."],["net","The rectangle wraps round the circle, so its width is the circumference 2πr; its height is h."],["net","SA = 2πr² + 2πrh."]],
    calc:()=>{const r=fmK(1,5),h=fmK(2,10),c=fmR(2*FM_PI*r*r),s=fmR(2*FM_PI*r*h);return {lab:{r:r+" cm",h:h+" cm"},v:{r,h},a:fmR(c+s),sub:`SA = 2 × 3.14 × ${r}² + 2 × 3.14 × ${r} × ${h}`,work:[`Circles: 2 × 3.14 × ${r*r} = ${fmN(c)}`,`Curved side: 2 × 3.14 × ${r} × ${h} = ${fmN(s)}`,`${fmN(c)} + ${fmN(s)} = ${fmN(fmR(c+s))}`]};}},
];
const FM_BY=Object.fromEntries(FMS.map(F=>[F.k,F]));
const fmMeasure=F=>F.k==="circ-c"?"circumference":F.m.toLowerCase();
const fmUnit=F=>F.m==="Perimeter"?"cm":F.m==="Volume"?"cm³":"cm²";
const fmHl=(F,i)=>F.frames[Math.min(i,F.frames.length-1)][0]==="net"&&F.sh==="cyl"?["cylnet",""]:[F.sh,F.frames[Math.min(i,F.frames.length-1)][0]];

/* ---------- progress: quiz marks (synced) and flashcard boxes (this device) ---------- */
const fmQuiz=k=>(MB().q["p:fm-"+k])||{n:0,r:0};
const fmBox=()=>{try{return JSON.parse(localStorage.getItem("fm-box")||"{}");}catch(e){return {};}};
const fmSetBox=(k,v)=>{const b=fmBox();b[k]=Math.max(0,Math.min(5,v));try{localStorage.setItem("fm-box",JSON.stringify(b));}catch(e){}};
function fmLevel(k){const q=fmQuiz(k),b=fmBox()[k]||0;return Math.min(3,Math.round(((q.n?q.r/q.n:0)*(Math.min(q.n,4)/4))*1.5+b/5*1.5));}

/* ---------- quiz questions (shown on the normal maths screen) ---------- */
const FM_T="Shapes and formulas";
function fmQuestion(F){
  const fig=(lab,hl="")=>({t:"sh",s:F.sh,lab,hl});
  const kinds=["which","which","calc","calc","calc","shape","unit"]; if(F.miss)kinds.push("miss","miss");
  const kind=kinds[Math.floor(Math.random()*kinds.length)];
  const base={t:/Volume|Surface/.test(F.m)?"Volume and measures":"Perimeter and area",o:`${F.m}: ${F.name.toLowerCase()}`};
  const learn=F.frames.map(f=>f[1]);
  if(kind==="which"){
    const opts=shuffle([F.f,...shuffle(F.wrong).slice(0,3)]);
    return {...base,q:`Which formula gives the ${fmMeasure(F)} of this ${F.name.toLowerCase().replace(/ \(.*\)/,"")}?`,k:"c",c:opts,a:opts.indexOf(F.f),f:fig(F.lab),
      w:`${F.f} (${F.vars}).`,steps:[...learn,`So the formula is ${F.f}.`]};
  }
  if(kind==="shape"){
    const others=shuffle(FMS.filter(x=>x.sh!==F.sh&&x.sh!=="cylnet").map(x=>x.sh).filter((s,i,a)=>a.indexOf(s)===i)).slice(0,3), items=shuffle([F.sh,...others]), L="ABCD";
    return {...base,q:`For which shape do you use ${F.f} to find the ${fmMeasure(F)}?`,k:"c",c:["A","B","C","D"],a:items.indexOf(F.sh),f:{t:"sh-grid",items},
      w:`${F.f} is the ${fmMeasure(F)} of a ${F.name.toLowerCase()}: shape ${L[items.indexOf(F.sh)]}.`,steps:[`${F.f}: ${F.vars}.`,...learn.slice(-1),`That is the ${F.name.toLowerCase()}: shape ${L[items.indexOf(F.sh)]}.`]};
  }
  if(kind==="unit"){
    const C=F.calc(), u=fmUnit(F), opts=["cm","cm²","cm³"];
    return {...base,q:`You work out the ${fmMeasure(F)} of this ${F.name.toLowerCase().replace(/ \(.*\)/,"")}. Which unit does the answer have?`,k:"c",c:opts,a:opts.indexOf(u),f:fig(C.lab),
      w:`${F.m} is measured in ${u}.`,steps:["Length (perimeter, circumference) is in cm. Area (squares) is in cm². Volume (cubes) is in cm³.",`The ${fmMeasure(F)} is ${F.m==="Perimeter"?"a length":F.m==="Volume"?"how many cubes fit inside":"an area"}, so ${u}.`]};
  }
  if(kind==="miss"){
    const M=F.miss();
    return {...base,q:M.q,k:"n",a:M.a,u:"cm",f:fig(M.lab),w:M.steps[M.steps.length-1],steps:[`Start with the formula: ${F.f}.`,...M.steps]};
  }
  const C=F.calc(), pi=/π/.test(F.f)?" Use π = 3.14.":"";
  return {...base,q:`Work out the ${fmMeasure(F)} of this ${F.name.toLowerCase().replace(/ \(.*\)/,"")}.${pi}`,k:"n",a:C.a,u:fmUnit(F),f:fig(C.lab),
    w:`${C.sub} = ${fmN(C.a)} ${fmUnit(F)}.`,steps:[`Formula: ${F.f} (${F.vars}).`,`Put the numbers in: ${C.sub}.`,...C.work.map(x=>x+"."),`${F.name.replace(/ \(.*\)/,"")} ${fmMeasure(F)} = ${fmN(C.a)} ${fmUnit(F)}.`]};
}
let fmSeq=0;
function fmSet(keys,n=MTOPIC){
  // weakest formulas first, each at most twice in a set
  const pool=(keys||FMS.map(F=>F.k)).slice().sort((a,b)=>fmLevel(a)-fmLevel(b)||Math.random()-.5), ids=[], seen=new Set();
  for(let g=0;ids.length<n&&g<300;g++){
    const k=pool[g%pool.length]; if(ids.filter(id=>MQ[id].gen==="fm-"+k).length>=2)continue;
    const q=fmQuestion(FM_BY[k]); if(!q||seen.has(q.q+JSON.stringify(q.f)))continue; seen.add(q.q+JSON.stringify(q.f));
    const id=`g:fm:${Date.now().toString(36)}:${++fmSeq}`; MQ[id]={...q,id,gen:"fm-"+k}; ids.push(id);
  }
  return shuffle(ids);
}
/* figures on the maths screen (called from mFig) */
function shapeFig(f){
  if(f.t==="sh-grid")return `<div class="m-fig sh-grid">${f.items.map((s,i)=>`<div><b>${"ABCD"[i]}</b>${shapeSVG(s,{})}</div>`).join("")}</div>`;
  return `<div class="m-fig sh-fig">${shapeSVG(f.s,f.lab||{},f.hl||"")}</div>`;
}

/* ---------- the corner ---------- */
let FMV=null;
function openShapes(view="hub",arg){window.__busy=true;$("#shapes").hidden=false;document.body.style.overflow="hidden";fmShow(view,arg);}
function closeShapes(){window.__busy=false;$("#shapes").hidden=true;document.body.style.overflow="";render();}
function fmShow(view,arg){
  FMV={view,arg}; $("#shBody").scrollTop=0;
  $("#shLabel").textContent={hub:"Shapes and formulas",learn:"Learn a formula",flash:"Formula flashcards",sheet:"Formula sheet"}[view]||"Shapes and formulas";
  ({hub:fmHub,learn:fmLearn,flash:fmFlash,sheet:fmSheet})[view](arg);
  zhFill($("#shBody"));
}
const fmStars=k=>{const l=fmLevel(k);return `<span class="fm-stars" title="How well you know it">${"★".repeat(l)}${"☆".repeat(3-l)}</span>`;};
function fmHub(){
  const groups=Object.keys(FM_M);
  $("#shBody").innerHTML=`<div class="m-q fm-hub">
    <p class="muted" style="margin:0">Perimeter, area and volume formulas, explained with moving pictures. Learn one, test yourself with flashcards, then do the quiz. Stars show how well you know each one.</p>
    <div class="fm-actions">
      <button class="btn primary big" data-fm="quiz">${ic("maths")}Formula quiz · ${MTOPIC} questions</button>
      <button class="btn big" data-fm="flash">${ic("layers")}Flashcards</button>
      <button class="btn big" data-fm="sheet">${ic("doc")}Formula sheet</button>
    </div>
    ${groups.map(m=>`<div class="section-title"><h3 style="margin:0;color:${FM_M[m]}">${m}</h3>
        <button class="btn sm" data-fm-quiz="${m}">Quiz on ${m.toLowerCase()}</button></div>
      <div class="fm-tiles">${FMS.filter(F=>F.m===m).map(F=>`<button class="fm-tile" data-fm-learn="${F.k}" style="--mc:${FM_M[m]}">
        ${shapeSVG(F.sh,F.lab)}<b>${esc(F.name)}</b><span class="fm-f">${esc(F.f)}</span>${fmStars(F.k)}</button>`).join("")}</div>`).join("")}
  </div>`;
  const B=$("#shBody");
  B.querySelector('[data-fm="quiz"]').onclick=()=>fmQuiz2();
  B.querySelector('[data-fm="flash"]').onclick=()=>fmShow("flash");
  B.querySelector('[data-fm="sheet"]').onclick=()=>fmShow("sheet");
  B.querySelectorAll("[data-fm-quiz]").forEach(b=>b.onclick=()=>fmQuiz2(FMS.filter(F=>F.m===b.dataset.fmQuiz).map(F=>F.k),b.dataset.fmQuiz));
  B.querySelectorAll("[data-fm-learn]").forEach(b=>b.onclick=()=>fmShow("learn",{k:b.dataset.fmLearn,i:0}));
}
function fmQuiz2(keys,label){closeShapes();openMaths({kind:"topic",topic:label?`Formulas: ${label.toLowerCase()}`:"Formula quiz",ids:fmSet(keys)});}
function fmLearn({k,i}){
  i=Math.max(0,Math.min(i,FM_BY[k].frames.length-1));
  const F=FM_BY[k], n=F.frames.length, last=i>=n-1, [sh,hl]=fmHl(F,i), list=FMS.filter(x=>x.m===F.m), j=list.indexOf(F);
  $("#shBody").innerHTML=`<div class="m-q fm-learn" style="--mc:${FM_M[F.m]}">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:${FM_M[F.m]}">${esc(F.m)}</span><span class="muted small">Step ${i+1} of ${n}</span></div>
    <h2 style="margin:0">${esc(F.name)}</h2>
    <div class="fm-stage">${shapeSVG(sh,F.lab,hl,"big")}</div>
    <div class="fm-say"><p>${esc(F.frames[i][1])}</p>${zhLine(F.frames[i][1])}<span class="m-tools"><button class="icon-btn sm" id="fmSay" aria-label="Read aloud">${ic("speaker")}</button><button class="icon-btn sm zh-btn ${zhOn()?"on":""}" id="fmZh" aria-label="Chinese">中</button></span></div>
    ${last?`<div class="fm-formula"><span>${esc(F.f)}</span><small>${esc(F.vars)}</small></div>`:""}
    <div class="fm-nav">
      <button class="btn" id="fmPrev" ${i?"":"disabled"}>${ic("back")}Back</button>
      <button class="btn" id="fmReplay">${ic("play")}Play again</button>
      ${last?`<button class="btn primary" id="fmTry">Try 3 questions</button>`:`<button class="btn primary" id="fmNext">Next step · 下一步</button>`}
    </div>
    <div class="fm-nav">
      ${j>0?`<button class="btn ghost" data-go="${list[j-1].k}">← ${esc(list[j-1].name)}</button>`:"<span></span>"}
      <button class="btn ghost" id="fmHub">All formulas</button>
      ${j<list.length-1?`<button class="btn ghost" data-go="${list[j+1].k}">${esc(list[j+1].name)} →</button>`:"<span></span>"}
    </div>
  </div>`;
  const B=$("#shBody"), go=x=>fmShow("learn",x);
  $("#fmSay").onclick=()=>readAloud(F.frames[i][1]+(last?" The formula is "+F.f+".":""),$("#fmSay"));
  if(!last)$("#fmNext").onclick=()=>go({k,i:i+1}); else $("#fmTry").onclick=()=>{closeShapes();openMaths({kind:"topic",topic:`${F.name}: ${F.m.toLowerCase()}`,ids:fmSet([k],3)});};
  $("#fmZh").onclick=()=>{zhToggle();go({k,i});};
  $("#fmPrev").onclick=()=>go({k,i:Math.max(0,i-1)});
  $("#fmReplay").onclick=()=>go({k,i});
  $("#fmHub").onclick=()=>fmShow("hub");
  B.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go({k:b.dataset.go,i:0}));
}
/* Flashcards: weakest first; picture and name on the front, formula on the back */
let FMF=null;
function fmFlash(){
  if(!FMF||FMF.i>=FMF.cards.length){const box=fmBox();FMF={cards:FMS.map(F=>F.k).sort((a,b)=>(box[a]||0)-(box[b]||0)||Math.random()-.5).slice(0,10),i:0,show:false,known:0};}
  if(FMF.i>=FMF.cards.length)return;
  const F=FM_BY[FMF.cards[FMF.i]];
  $("#shBody").innerHTML=`<div class="m-q fm-flash" style="--mc:${FM_M[F.m]}">
    <div class="row" style="justify-content:space-between"><span class="kind-tag" style="--kc:${FM_M[F.m]}">${esc(F.m)}</span><span class="muted small">Card ${FMF.i+1} of ${FMF.cards.length}</span></div>
    <div class="fm-card ${FMF.show?"open":""}">
      ${shapeSVG(F.sh,F.lab)}
      <h3>What is the ${esc(fmMeasure(F))} of a ${esc(F.name.toLowerCase().replace(/ \(.*\)/,""))}?</h3>
      ${FMF.show?`<div class="fm-formula"><span>${esc(F.f)}</span><small>${esc(F.vars)}</small></div>`:`<p class="muted">Say the formula out loud, then turn the card over.</p>`}
    </div>
    ${FMF.show?`<div class="fm-nav"><button class="btn" id="fmNo">Not yet</button><button class="btn primary" id="fmYes">${ic("check")}I knew it</button></div>
      <button class="btn ghost" id="fmWhy">Show me why (step by step)</button>`
      :`<button class="btn primary big" id="fmTurn">Turn over</button>`}
  </div>`;
  const next=ok=>{const b=fmBox()[F.k]||0;fmSetBox(F.k,ok?b+1:b-1);if(ok)FMF.known++;FMF.i++;FMF.show=false;
    if(FMF.i>=FMF.cards.length){const kn=FMF.known,n=FMF.cards.length;FMF=null;fmFlashEnd(kn,n);}else fmShow("flash");};
  if(!FMF.show)$("#fmTurn").onclick=()=>{FMF.show=true;fmShow("flash");};
  else{$("#fmNo").onclick=()=>next(false);$("#fmYes").onclick=()=>next(true);$("#fmWhy").onclick=()=>fmShow("learn",{k:F.k,i:0});}
}
function fmFlashEnd(kn,n){
  $("#shBody").innerHTML=`<div class="m-q m-results"><div class="stars">${"★".repeat(kn>=n?3:kn>=n*.7?2:kn>=n*.4?1:0)}${"☆".repeat(3-(kn>=n?3:kn>=n*.7?2:kn>=n*.4?1:0))}</div>
    <h2>You knew ${kn} of ${n}</h2><p class="muted">The ones you did not know come first next time.</p>
    <div class="fm-nav"><button class="btn" id="fmAgain">More flashcards</button><button class="btn primary" id="fmQ">Formula quiz</button></div>
    <button class="btn ghost" id="fmHub2">All formulas</button></div>`;
  $("#fmAgain").onclick=()=>fmShow("flash"); $("#fmQ").onclick=()=>fmQuiz2(); $("#fmHub2").onclick=()=>fmShow("hub");
}
function fmSheet(){
  $("#shBody").innerHTML=`<div class="m-q fm-sheet">
    <p class="muted" style="margin:0">All the formulas in one place. π ≈ 3.14. Units: length cm, area cm², volume cm³.</p>
    ${Object.keys(FM_M).map(m=>`<h3 style="margin:8px 0 0;color:${FM_M[m]}">${m}</h3><div class="fm-rows">${FMS.filter(F=>F.m===m).map(F=>`<button class="fm-row" data-fm-learn="${F.k}">${shapeSVG(F.sh,F.lab)}<div><b>${esc(F.name)}</b><span class="fm-f">${esc(F.f)}</span><small class="muted">${esc(F.vars)}</small></div></button>`).join("")}</div>`).join("")}
  </div>`;
  $("#shBody").querySelectorAll("[data-fm-learn]").forEach(b=>b.onclick=()=>fmShow("learn",{k:b.dataset.fmLearn,i:0}));
}
/* the card on the Maths page */
function shapesEntry(){
  const lv=FMS.reduce((s,F)=>s+fmLevel(F.k),0);
  return `<button class="card fm-entry" data-shapes>${shapeSVG("cyl",{r:"r",h:"h"},"","mini")}
    <span class="stack tight" style="gap:4px;text-align:left"><b>Shapes and formulas: perimeter, area, volume</b>
    <span class="muted small">See how each formula works with moving pictures, then remember them with flashcards and a picture quiz. ${lv} of ${FMS.length*3} stars.</span></span>
    <span class="chev">${ic("chevron")}</span></button>`;
}
{const c=document.getElementById("shClose");if(c){c.innerHTML=ic("x");c.onclick=closeShapes;}} // only the child page has the formula corner
