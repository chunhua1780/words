/* ================= 动画讲解 · Cartoons for perimeter, area and volume =================
   Shared by both study sites. Short animated lessons with a recorded British voice (Microsoft
   en-GB-SoniaNeural, audio/ct/<formula>-<n>.mp3) and big subtitles:
   - perimeter: a ladybird walks round the edge, each side is counted and added up;
   - area: 1 cm squares drop in one by one and are counted, then "rows × squares in a row";
   - triangle area: the triangle is half of a rectangle of squares;
   - volume: 1 cm cubes are stacked, a layer at a time, then "layers × cubes in a layer".
   Played first in step 1 of the formula ladder (flad.js), before the formula is shown. */
const CT_U=34, CT_W=420, CT_H=300;
const ctSvg=(inner)=>`<svg class="ct-svg" viewBox="0 0 ${CT_W} ${CT_H}" role="img" aria-label="Cartoon">${inner}</svg>`;
const ctWait=ms=>new Promise(r=>setTimeout(r,ms));
let CT=null; // the cartoon playing now: {tok}
const CT_SCENES={
  "rect-p":{steps:[
    ["This is a rectangle. It is 5 centimetres long and 3 centimetres wide.",S=>ctRect(S,5,3,{labels:true})],
    ["Perimeter means the distance all the way around the outside.",S=>ctGlow(S)],
    ["Let's walk all the way round the edge with the ladybird.",S=>ctWalk(S,[5,3,5,3])],
    ["5, plus 3, plus 5, plus 3. That makes 16 centimetres.",S=>ctSum(S,"5 + 3 + 5 + 3 = 16 cm")],
    ["There are two lengths and two widths. So, perimeter equals 2 times, length plus width.",S=>ctFormula(S,"P = 2 × (l + w)","2 × (5 + 3) = 16 cm")]]},
  "sq-p":{steps:[
    ["This is a square. Every side is 4 centimetres long.",S=>ctRect(S,4,4,{labels:true})],
    ["Perimeter is the distance all the way around the outside.",S=>ctGlow(S)],
    ["Let's walk round the edge with the ladybird. 4, 4, 4 and 4.",S=>ctWalk(S,[4,4,4,4])],
    ["Four sides of 4 centimetres make 16 centimetres.",S=>ctSum(S,"4 + 4 + 4 + 4 = 16 cm")],
    ["A square has four equal sides, so perimeter equals 4 times the side.",S=>ctFormula(S,"P = 4 × s","4 × 4 = 16 cm")]]},
  "tri-p":{steps:[
    ["This is a triangle. Its sides are 3, 4 and 5 centimetres.",S=>ctTri(S,{labels:true})],
    ["Perimeter is the distance all the way around the outside.",S=>ctGlow(S)],
    ["Let's walk round the edge with the ladybird.",S=>ctWalk(S,[3,4,5],"tri")],
    ["3, plus 4, plus 5, makes 12 centimetres.",S=>ctSum(S,"3 + 4 + 5 = 12 cm")],
    ["For any triangle, just add the three sides: a plus b plus c.",S=>ctFormula(S,"P = a + b + c","3 + 4 + 5 = 12 cm")]]},
  "rect-a":{steps:[
    ["This rectangle is 5 centimetres long and 3 centimetres wide.",S=>ctRect(S,5,3,{labels:true})],
    ["Area means how much flat space is inside the shape.",S=>ctShade(S)],
    ["We measure area with little squares. Each one is 1 centimetre by 1 centimetre: one square centimetre.",S=>ctOneSquare(S)],
    ["Let's cover the rectangle with squares, and count them.",S=>ctFill(S,5,3)],
    ["Look: each row has 5 squares, and there are 3 rows.",S=>ctRows(S,5,3)],
    ["3 rows of 5 makes 15. The area is 15 square centimetres.",S=>ctSum(S,"3 rows × 5 = 15 cm²")],
    ["So, area equals length times width. We don't need to count every square!",S=>ctFormula(S,"A = l × w","5 × 3 = 15 cm²")]]},
  "sq-a":{steps:[
    ["This square has sides of 4 centimetres.",S=>ctRect(S,4,4,{labels:true})],
    ["Area means how much flat space is inside.",S=>ctShade(S)],
    ["Let's cover it with 1 centimetre squares, and count them.",S=>ctFill(S,4,4)],
    ["There are 4 rows, with 4 squares in each row.",S=>ctRows(S,4,4)],
    ["4 times 4 makes 16. The area is 16 square centimetres.",S=>ctSum(S,"4 × 4 = 16 cm²")],
    ["Side times side. We write it s squared. Squared means times itself, not times 2.",S=>ctFormula(S,"A = s × s = s²","4² = 4 × 4 = 16 cm²")]]},
  "tri-a":{steps:[
    ["This triangle has a base of 6 centimetres and a height of 4 centimetres.",S=>ctRightTri(S,true)],
    ["Let's draw a rectangle around it, 6 by 4.",S=>ctRightTri(S,false,true)],
    ["Fill the rectangle with squares: 4 rows of 6 is 24 squares.",S=>ctFill(S,6,4,{fast:true})],
    ["The triangle covers exactly half of the rectangle.",S=>ctHalf(S)],
    ["Half of 24 is 12. The triangle's area is 12 square centimetres.",S=>ctSum(S,"24 ÷ 2 = 12 cm²")],
    ["So, area equals a half, times base, times height.",S=>ctFormula(S,"A = ½ × b × h","½ × 6 × 4 = 12 cm²")]]},
  "cuboid-v":{steps:[
    ["Volume means how much space there is inside a solid shape, like a box.",S=>ctBoxOutline(S,4,3,2)],
    ["We measure volume with little cubes. Each one is 1 centimetre long, wide and high: one cubic centimetre.",S=>ctOneCube(S)],
    ["Let's build the bottom layer: 4 cubes long, and 3 cubes wide.",S=>ctCubes(S,4,3,2,0)],
    ["The bottom layer has 4 times 3, which is 12 cubes.",S=>ctSum(S,"one layer: 4 × 3 = 12 cubes")],
    ["Now stack a second layer on top. The box is 2 cubes high.",S=>ctCubes(S,4,3,2,1)],
    ["2 layers of 12 makes 24 cubes. The volume is 24 cubic centimetres.",S=>ctSum(S,"12 × 2 = 24 cm³")],
    ["So, volume equals length times width times height.",S=>ctFormula(S,"V = l × w × h","4 × 3 × 2 = 24 cm³")]]},
  "cube-v":{steps:[
    ["A cube is a box where every edge is the same. This one is 3 centimetres each way.",S=>ctBoxOutline(S,3,3,3)],
    ["Let's fill it with 1 centimetre cubes. First, the bottom layer: 3 by 3 is 9 cubes.",S=>ctCubes(S,3,3,3,0)],
    ["Now the second layer, and the third layer.",S=>ctCubes(S,3,3,3,2)],
    ["3 layers of 9 makes 27 cubes. The volume is 27 cubic centimetres.",S=>ctSum(S,"9 × 3 = 27 cm³")],
    ["Side times side times side. We write it s cubed.",S=>ctFormula(S,"V = s × s × s = s³","3 × 3 × 3 = 27 cm³")]]},
};
/* ---------- drawing ---------- */
const CT_O={x:80,y:60};
function ctBase(S){S.svg.innerHTML=`<g id="ctShape"></g><g id="ctFill"></g><g id="ctTop"></g><text id="ctSum" x="${CT_W/2}" y="${CT_H-14}" text-anchor="middle" class="ct-sum"></text>`;}
const $s=(S,id)=>S.svg.querySelector("#"+id);
function ctRect(S,l,w,{labels}={}){
  ctBase(S); S.l=l;S.w=w;S.kind="rect";
  const x=(CT_W-l*CT_U)/2, y=40, W=l*CT_U, H=w*CT_U; S.x=x;S.y=y;
  S.pts=[[x,y],[x+W,y],[x+W,y+H],[x,y+H]];
  $s(S,"ctShape").innerHTML=`<rect x="${x}" y="${y}" width="${W}" height="${H}" class="ct-shape ct-draw" pathLength="100"/>`
    +(labels?`<text x="${x+W/2}" y="${y-10}" text-anchor="middle" class="ct-lab ct-pop">${l} cm</text><text x="${x+W+10}" y="${y+H/2+6}" class="ct-lab ct-pop">${w} cm</text>`:"");
  return 1600;
}
function ctTri(S,{labels}={}){
  ctBase(S); S.kind="tri"; const u=CT_U*1.3, x=(CT_W-4*u)/2, y=40;
  S.pts=[[x,y+3*u],[x,y],[x+4*u,y+3*u]]; // sides: 3 (left), 5 (slope), 4 (bottom)... walk order 3,5,4 relabelled below
  S.pts=[[x,y],[x,y+3*u],[x+4*u,y+3*u]];
  $s(S,"ctShape").innerHTML=`<polygon points="${S.pts.map(p=>p.join(",")).join(" ")}" class="ct-shape ct-draw" pathLength="100"/>`
    +(labels?`<text x="${x-12}" y="${y+1.5*u}" text-anchor="end" class="ct-lab ct-pop">3 cm</text><text x="${x+2*u}" y="${y+3*u+26}" text-anchor="middle" class="ct-lab ct-pop">4 cm</text><text x="${x+2*u+14}" y="${y+1.5*u-8}" class="ct-lab ct-pop">5 cm</text>`:"");
  return 1600;
}
function ctGlow(S){const sh=$s(S,"ctShape").firstChild; if(sh)sh.classList.add("ct-glow"); return 2200;}
function ctShade(S){const sh=$s(S,"ctShape").firstChild; if(sh)sh.classList.add("ct-shade"); return 2200;}
async function ctWalk(S,sides){
  const pts=S.pts, n=pts.length, top=$s(S,"ctTop"), tok=CT.tok;
  top.innerHTML=`<text class="ct-bug" font-size="28" text-anchor="middle" dominant-baseline="central">🐞</text>`;
  const bug=top.firstChild; let run=[];
  for(let i=0;i<n;i++){
    const [a,b]=[pts[i],pts[(i+1)%n]], steps=40;
    top.insertAdjacentHTML("afterbegin",`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="ct-side"/>`);
    for(let k=0;k<=steps;k++){if(CT.tok!==tok)return 0;const t=k/steps;bug.setAttribute("x",a[0]+(b[0]-a[0])*t);bug.setAttribute("y",a[1]+(b[1]-a[1])*t);await ctWait(22);}
    run.push(sides[i]); $s(S,"ctSum").textContent=run.join(" + ")+" cm";
    top.insertAdjacentHTML("beforeend",`<text x="${(a[0]+b[0])/2}" y="${(a[1]+b[1])/2}" text-anchor="middle" dominant-baseline="central" class="ct-num ct-pop">${sides[i]}</text>`);
    await ctWait(250);
  }
  return 400;
}
function ctSum(S,t){const e=$s(S,"ctSum");e.textContent=t;e.classList.remove("ct-pop");void e.getBBox;e.classList.add("ct-pop");return 2000;}
function ctOneSquare(S){$s(S,"ctTop").innerHTML=`<g class="ct-pop"><rect x="${CT_W-70}" y="${CT_H-110}" width="${CT_U}" height="${CT_U}" class="ct-sq"/><text x="${CT_W-70+CT_U/2}" y="${CT_H-118}" text-anchor="middle" class="ct-lab sm">1 cm²</text></g>`;return 2400;}
async function ctFill(S,c,r,{fast}={}){
  const g=$s(S,"ctFill"), tok=CT.tok, x=S.x!=null?S.x:(CT_W-c*CT_U)/2, y=S.y!=null?S.y:40; let n=0;
  $s(S,"ctTop").innerHTML="";
  for(let j=0;j<r;j++)for(let i=0;i<c;i++){if(CT.tok!==tok)return 0;n++;
    g.insertAdjacentHTML("beforeend",`<g class="ct-drop"><rect x="${x+i*CT_U+2}" y="${y+j*CT_U+2}" width="${CT_U-4}" height="${CT_U-4}" rx="4" class="ct-sq"/>${fast?"":`<text x="${x+i*CT_U+CT_U/2}" y="${y+j*CT_U+CT_U/2+6}" text-anchor="middle" class="ct-cnt">${n}</text>`}</g>`);
    $s(S,"ctSum").textContent=`${n} square${n>1?"s":""}`; await ctWait(fast?60:330);}
  return 500;
}
async function ctRows(S,c,r){
  const g=$s(S,"ctTop"), x=S.x!=null?S.x:(CT_W-c*CT_U)/2, y=S.y!=null?S.y:40, tok=CT.tok;
  for(let j=0;j<r;j++){if(CT.tok!==tok)return 0;g.insertAdjacentHTML("beforeend",`<rect x="${x-3}" y="${y+j*CT_U}" width="${c*CT_U+6}" height="${CT_U}" rx="6" class="ct-row ct-pop"/><text x="${x-12}" y="${y+j*CT_U+CT_U/2+6}" text-anchor="end" class="ct-lab sm ct-pop">row ${j+1}: ${c}</text>`);await ctWait(700);}
  return 600;
}
function ctRightTri(S,first,box){
  if(first){ctBase(S);}
  const c=6,r=4,x=(CT_W-c*CT_U)/2,y=40; S.x=x;S.y=y;
  const tri=`<polygon points="${x},${y} ${x},${y+r*CT_U} ${x+c*CT_U},${y+r*CT_U}" class="ct-shape ${first?"ct-draw":""}" pathLength="100" id="ctTriP"/>`;
  $s(S,"ctShape").innerHTML=(box?`<rect x="${x}" y="${y}" width="${c*CT_U}" height="${r*CT_U}" class="ct-box ct-draw" pathLength="100"/>`:"")+tri
    +`<text x="${x+c*CT_U/2}" y="${y+r*CT_U+24}" text-anchor="middle" class="ct-lab">base 6 cm</text><text x="${x-10}" y="${y+r*CT_U/2}" text-anchor="end" class="ct-lab">height 4 cm</text>`;
  return 1800;
}
function ctHalf(S){
  const x=S.x,y=S.y,c=6,r=4;
  $s(S,"ctTop").innerHTML=`<polygon points="${x},${y} ${x+c*CT_U},${y} ${x+c*CT_U},${y+r*CT_U}" class="ct-other ct-pop"/><polygon points="${x},${y} ${x},${y+r*CT_U} ${x+c*CT_U},${y+r*CT_U}" class="ct-half ct-pop"/><line x1="${x}" y1="${y}" x2="${x+c*CT_U}" y2="${y+r*CT_U}" class="ct-cut ct-draw" pathLength="100"/>`;
  return 2400;
}
/* cubes, drawn in 3D (isometric) */
const CT_A=24;
function ctP(S,x,y,z){return [S.ox+(x-y)*CT_A*.866,S.oy+(x+y)*CT_A*.5-z*CT_A];}
function ctCubeSvg(S,x,y,z,cls=""){const P=(a,b,c)=>ctP(S,a,b,c).map(v=>v.toFixed(1)).join(","), poly=(ps,k)=>`<polygon points="${ps.join(" ")}" class="${k}"/>`;
  return `<g class="ct-cube ${cls}">${poly([P(x,y,z+1),P(x+1,y,z+1),P(x+1,y+1,z+1),P(x,y+1,z+1)],"ct-ctop")}${poly([P(x,y+1,z),P(x+1,y+1,z),P(x+1,y+1,z+1),P(x,y+1,z+1)],"ct-cl")}${poly([P(x+1,y,z),P(x+1,y+1,z),P(x+1,y+1,z+1),P(x+1,y,z+1)],"ct-cr")}</g>`;}
function ctIsoSetup(S,l,w,h){S.ox=CT_W/2+(w-l)*CT_A*.43;S.oy=CT_H/2-((l+w)*CT_A*.5-h*CT_A)/2-20;}
function ctBoxOutline(S,l,w,h){
  ctBase(S); ctIsoSetup(S,l,w,h); const P=(a,b,c)=>ctP(S,a,b,c).join(",");
  const e=[[0,0,0,l,0,0],[0,0,0,0,w,0],[l,0,0,l,w,0],[0,w,0,l,w,0],[0,0,h,l,0,h],[0,0,h,0,w,h],[l,0,h,l,w,h],[0,w,h,l,w,h],[0,0,0,0,0,h],[l,0,0,l,0,h],[0,w,0,0,w,h],[l,w,0,l,w,h]];
  $s(S,"ctShape").innerHTML=e.map(([a,b,c,d,f,g])=>{const[p1,p2]=[ctP(S,a,b,c),ctP(S,d,f,g)];const hidden=(a===0&&b===0)&&(d===0&&f===0)||(a===0&&b===0&&c===0)||(d===0&&f===0&&g===0);
    return `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" class="${hidden?"ct-hid":"ct-edge"} ct-draw" pathLength="100"/>`;}).join("")
    +(()=>{const a=ctP(S,l/2,w,0),b=ctP(S,l,w/2,0),c=ctP(S,l,w,h/2);return `<text x="${a[0]-14}" y="${a[1]+24}" class="ct-lab sm ct-pop" text-anchor="middle">${l} cm</text><text x="${b[0]+20}" y="${b[1]+22}" class="ct-lab sm ct-pop">${w} cm</text><text x="${c[0]+12}" y="${c[1]}" class="ct-lab sm ct-pop">${h} cm</text>`;})();
  S.lwh=[l,w,h]; return 2000;
}
function ctOneCube(S){const s={ox:CT_W-60,oy:CT_H-70};$s(S,"ctTop").innerHTML=`<g class="ct-pop">${ctCubeSvg(s,0,0,0)}<text x="${CT_W-60}" y="${CT_H-110}" text-anchor="middle" class="ct-lab sm">1 cm³</text></g>`;return 2600;}
async function ctCubes(S,l,w,h,upTo){
  const g=$s(S,"ctFill"), tok=CT.tok; $s(S,"ctTop").innerHTML="";
  S.layer=S.layer||0;
  for(let z=S.layer;z<=upTo;z++){let n=0;
    for(let s=0;s<=l+w-2;s++)for(let x=0;x<l;x++){const y=s-x;if(y<0||y>=w)continue;if(CT.tok!==tok)return 0;n++;
      g.insertAdjacentHTML("beforeend",ctCubeSvg(S,x,y,z,"ct-drop"));
      $s(S,"ctSum").textContent=`layer ${z+1}: ${n} cube${n>1?"s":""}`; await ctWait(upTo>0&&z>0?120:260);}
    await ctWait(300);}
  S.layer=upTo+1; return 500;
}
function ctFormula(S,f,ex){$s(S,"ctTop").insertAdjacentHTML("beforeend",`<g class="ct-pop"><rect x="20" y="${CT_H-92}" width="${CT_W-40}" height="62" rx="14" class="ct-fbox"/><text x="${CT_W/2}" y="${CT_H-62}" text-anchor="middle" class="ct-f">${f}</text><text x="${CT_W/2}" y="${CT_H-40}" text-anchor="middle" class="ct-fx">${ex}</text></g>`);$s(S,"ctSum").textContent="";return 3000;}

/* ---------- the player ---------- */
const ctHas=k=>!!CT_SCENES[k];
function ctPlayerHtml(k){return `<div class="ct-player" data-ct="${k}"><div class="ct-stage"></div><div class="ct-cap" aria-live="polite"></div>
  <div class="ct-bar"><button class="btn" data-ctplay>▶ Play the cartoon 播放动画</button><span class="ct-dots"></span></div></div>`;}
function ctAudio(k,i,text,done){
  const a=new Audio(`audio/ct/${k}-${i}.mp3`); let fin=false; const end=()=>{if(!fin){fin=true;done();}};
  a.onended=end; a.onerror=()=>{if(typeof teachSay==="function")teachSay(text,end);else if(typeof say==="function")say(text,{onend:end});else setTimeout(end,1500+text.length*60);};
  const p=a.play(); if(p&&p.catch)p.catch(()=>a.onerror()); setTimeout(end,4000+text.length*90); CT.audio=a;
}
async function ctPlay(root,onDone){
  const k=root.dataset.ct, sc=CT_SCENES[k]; if(!sc)return;
  ctStop(); CT={tok:Date.now()}; const tok=CT.tok;
  const stage=root.querySelector(".ct-stage"), cap=root.querySelector(".ct-cap"), dots=root.querySelector(".ct-dots"), btn=root.querySelector("[data-ctplay]");
  stage.innerHTML=ctSvg(""); const S={svg:stage.firstChild}; btn.textContent="↻ Play again 再看一遍";
  for(let i=0;i<sc.steps.length;i++){
    if(CT.tok!==tok)return;
    const [text,act]=sc.steps[i]; cap.textContent=text; dots.textContent=sc.steps.map((_,j)=>j<=i?"●":"○").join(" ");
    const said=new Promise(r=>ctAudio(k,i,text,r)), acted=Promise.resolve(act(S)).then(ms=>ctWait(ms||0));
    await Promise.all([said,acted]); if(CT&&CT.tok!==tok)return; await ctWait(500);
  }
  if(CT&&CT.tok===tok){try{localStorage.setItem("ct-seen:"+k,"1");}catch(e){} onDone&&onDone();}
}
function ctStop(){if(CT){CT.tok=-1;try{CT.audio&&CT.audio.pause();}catch(e){}}CT=null;if(typeof teachStop==="function")teachStop();}
const ctSeen=k=>{try{return !!localStorage.getItem("ct-seen:"+k);}catch(e){return false;}};
