/* Word Speller: one simple, single-colour illustration per reading passage.
   Every shape uses currentColor at a few strengths, so each story is drawn in its own colour
   (set with CSS `color`) and works in light and dark mode. */
"use strict";
const ILLU=(()=>{
  const S=(a,body)=>`<svg viewBox="0 0 480 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="currentColor">${body}</svg>`;
  // strengths: faint .10, soft .18, mid .32, strong .55, ink 1
  const f=".10", s=".18", m=".32", g=".55";
  return {
  /* Lighthouse on a cliff at night, beam over the sea, a cat at the door */
  r01:S(0,`<circle cx="70" cy="58" r="22" opacity="${s}"/><circle cx="62" cy="52" r="18" fill="var(--illu-bg)"/>
    <g opacity="${m}"><circle cx="150" cy="40" r="2"/><circle cx="210" cy="70" r="1.6"/><circle cx="420" cy="34" r="2"/><circle cx="110" cy="96" r="1.4"/></g>
    <path d="M326 58 L40 14 L40 120 Z" opacity="${f}"/>
    <path d="M300 240 L300 150 Q330 128 380 132 Q440 136 480 120 L480 240 Z" opacity="${m}"/>
    <g transform="translate(352 152) scale(1.3) translate(-352 -140)"><path d="M334 140 L342 70 L362 70 L370 140 Z" opacity="${g}"/>
    <rect x="336" y="94" width="32" height="9" fill="var(--illu-bg)" opacity=".7"/><rect x="338" y="116" width="30" height="9" fill="var(--illu-bg)" opacity=".7"/>
    <rect x="338" y="58" width="28" height="14" rx="2"/><path d="M334 58 L352 42 L370 58 Z"/><circle cx="352" cy="65" r="4" fill="var(--illu-bg)"/>
    <path d="M378 140 q4 -10 8 0 l2 -6 l3 6 q6 2 4 10 l-17 0 q-3 -6 0 -10z" /></g>
    <path d="M0 196 Q40 186 80 196 T160 196 T240 196 T320 198 L320 240 L0 240Z" opacity="${s}"/>
    <path d="M0 214 Q50 204 100 214 T200 214 T300 214 L300 240 L0 240Z" opacity="${m}"/>
    <path d="M150 182 l40 0 l-8 10 l-26 0z M168 182 l0 -22 l14 18z" opacity="${g}"/>`),
  /* Honeycomb, flowers and a busy bee */
  r02:S(0,`${[0,1,2,3].map(r=>[0,1,2].map(c=>`<path transform="translate(${30+c*46+(r%2)*23} ${30+r*40})" d="M23 0 L46 13 L46 39 L23 52 L0 39 L0 13Z" opacity="${(r+c)%3===0?g:(r+c)%3===1?m:s}"/>`).join("")).join("")}
    <g transform="translate(330 150)"><path d="M0 90 Q4 40 0 0" fill="none" stroke="currentColor" stroke-width="4" opacity="${m}"/>
      ${[0,72,144,216,288].map(a=>`<ellipse rx="14" ry="22" transform="rotate(${a}) translate(0 -22)" opacity="${s}"/>`).join("")}<circle r="11" opacity="${g}"/></g>
    <g transform="translate(420 175)"><path d="M0 70 Q-3 30 0 0" fill="none" stroke="currentColor" stroke-width="3" opacity="${m}"/>
      ${[0,60,120,180,240,300].map(a=>`<ellipse rx="9" ry="15" transform="rotate(${a}) translate(0 -15)" opacity="${s}"/>`).join("")}<circle r="8" opacity="${g}"/></g>
    <g transform="translate(270 70) rotate(-12)"><ellipse cx="0" cy="0" rx="26" ry="18"/><g fill="var(--illu-bg)"><rect x="-8" y="-18" width="6" height="36"/><rect x="6" y="-18" width="6" height="36"/></g>
      <ellipse cx="-6" cy="-24" rx="14" ry="10" opacity="${s}"/><ellipse cx="10" cy="-26" rx="12" ry="9" opacity="${s}"/><circle cx="28" cy="-2" r="9"/></g>
    <path d="M226 92 q-30 10 -40 -10 q-8 -20 -30 -6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 6" opacity="${m}"/>`),
  /* A cottage with smoke from the chimney, ivy and a garden path */
  r03:S(0,`<path d="M0 200 Q120 180 240 196 T480 186 L480 240 L0 240Z" opacity="${s}"/>
    <path d="M300 40 q-10 -14 6 -22 q16 -8 10 -22" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity="${s}"/>
    <rect x="292" y="58" width="20" height="40" opacity="${g}"/>
    <path d="M150 110 L240 50 L330 110 Z" opacity="${g}"/>
    <rect x="166" y="108" width="148" height="88" opacity="${m}"/>
    <rect x="224" y="140" width="32" height="56" rx="16" opacity="1"/>
    <rect x="184" y="126" width="26" height="24" rx="3" fill="var(--illu-bg)"/><rect x="272" y="126" width="26" height="24" rx="3" fill="var(--illu-bg)"/>
    <path d="M184 138 h26 M197 126 v24 M272 138 h26 M285 126 v24" stroke="currentColor" stroke-width="2" opacity="${g}"/>
    ${[[172,118],[180,104],[168,150],[176,172],[300,112],[310,160],[304,186]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" opacity="${g}"/>`).join("")}
    <path d="M240 196 Q230 220 210 240 L270 240 Q250 220 240 196Z" opacity="${f}"/>
    <circle cx="70" cy="120" r="44" opacity="${s}"/><circle cx="96" cy="96" r="30" opacity="${s}"/><rect x="66" y="140" width="10" height="60" opacity="${m}"/>
    ${[350,372,394,416,438,460].map(x=>`<rect x="${x}" y="168" width="8" height="34" rx="3" opacity="${m}"/>`).join("")}<rect x="346" y="178" width="124" height="6" opacity="${m}"/>`),
  /* A straight Roman road to the horizon, an aqueduct and a temple */
  r04:S(0,`<path d="M0 150 L480 150 L480 240 L0 240Z" opacity="${f}"/>
    <path d="M226 150 L254 150 L330 240 L150 240Z" opacity="${m}"/>
    <path d="M240 156 v10 M240 176 v14 M240 200 v18 M240 226 v14" stroke="var(--illu-bg)" stroke-width="3"/>
    <g opacity="${g}"><rect x="20" y="70" width="190" height="14"/>${[0,1,2,3].map(i=>`<path d="M${24+i*46} 84 h40 v66 h-8 v-28 a12 12 0 0 0 -24 0 v28 h-8z"/>`).join("")}</g>
    <g transform="translate(320 64)"><path d="M0 26 L70 0 L140 26Z"/><rect x="0" y="28" width="140" height="8"/>${[8,40,72,104].map(x=>`<rect x="${x}" y="40" width="16" height="44" opacity="${m}"/>`).join("")}<rect x="-6" y="84" width="152" height="10"/></g>
    <circle cx="420" cy="30" r="16" opacity="${s}"/>
    <path d="M0 150 Q60 128 120 150 Z M360 150 Q420 132 480 150Z" opacity="${s}"/>`),
  /* Storm: heavy clouds, lightning, rain and a bending tree */
  r05:S(0,`<g opacity="${g}"><circle cx="120" cy="60" r="38"/><circle cx="170" cy="48" r="46"/><circle cx="226" cy="66" r="34"/><rect x="100" y="60" width="150" height="40" rx="20"/></g>
    <g opacity="${m}"><circle cx="330" cy="54" r="30"/><circle cx="372" cy="44" r="38"/><circle cx="414" cy="60" r="28"/><rect x="310" y="56" width="124" height="34" rx="17"/></g>
    <path d="M190 100 L170 146 L190 146 L172 196 L222 132 L200 132 L216 100Z"/>
    <g stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="${m}">${[110,140,250,280,330,360,400,430].map((x,i)=>`<path d="M${x} ${110+(i%2)*14} l-10 26"/>`).join("")}</g>
    <path d="M0 210 Q240 196 480 210 L480 240 L0 240Z" opacity="${s}"/>
    <path d="M60 212 Q66 160 92 130" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" opacity="${g}"/>
    <path d="M92 130 q34 -10 50 10 q-20 4 -50 -10z M92 130 q20 -30 46 -22 q-14 14 -46 22z M86 150 q28 0 40 18 q-22 0 -40 -18z" opacity="${m}"/>
    <rect x="330" y="150" width="90" height="62" opacity="${m}"/><path d="M322 152 L375 116 L428 152Z" opacity="${g}"/>
    <rect x="360" y="168" width="28" height="24" rx="2" fill="var(--illu-bg)"/><path d="M374 180 v-6" stroke="currentColor" stroke-width="3"/><circle cx="374" cy="172" r="3"/>`),
  /* A polar bear on sea ice under the northern lights */
  r06:S(0,`<path d="M0 60 Q120 20 240 54 T480 40 L480 80 Q360 100 240 84 T0 100Z" opacity="${f}"/>
    <path d="M0 90 Q140 60 260 92 T480 76 L480 104 Q360 124 240 112 T0 124Z" opacity="${s}"/>
    <g opacity="${m}"><circle cx="60" cy="30" r="2"/><circle cx="300" cy="22" r="1.6"/><circle cx="410" cy="120" r="1.8"/><circle cx="160" cy="130" r="1.5"/></g>
    <path d="M0 196 L80 176 L190 182 L300 170 L400 184 L480 176 L480 240 L0 240Z" opacity="${s}"/>
    <path d="M0 222 Q120 214 240 222 T480 220 L480 240 L0 240Z" opacity="${m}"/>
    <g transform="translate(150 118)"><path d="M10 54 Q0 30 20 18 Q50 0 100 6 Q140 8 158 26 Q176 26 186 36 Q188 46 176 48 Q164 52 156 48 L150 64 L138 64 L136 52 Q110 60 80 56 L76 66 L62 66 L60 54 Q40 58 30 52 L28 66 L14 66Z" opacity="${g}"/>
      <circle cx="172" cy="34" r="2.5" fill="var(--illu-bg)"/><circle cx="168" cy="22" r="4" opacity="${g}"/></g>
    <path d="M380 150 L420 100 L460 150Z M400 150 L440 116 L480 150Z" opacity="${s}"/>`),
  /* A rope bridge over a deep gorge with a river below */
  r07:S(0,`<path d="M0 240 L0 90 Q40 84 90 96 L120 110 L130 240Z" opacity="${g}"/>
    <path d="M480 240 L480 80 Q440 76 400 92 L362 108 L350 240Z" opacity="${g}"/>
    <path d="M130 240 Q240 170 350 240Z" opacity="${f}"/>
    <path d="M150 230 Q200 214 240 226 T330 226" fill="none" stroke="currentColor" stroke-width="5" opacity="${m}"/>
    <path d="M118 108 Q240 176 364 106" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M118 88 Q240 150 364 86" fill="none" stroke="currentColor" stroke-width="2.5" opacity="${g}"/>
    ${Array.from({length:15},(_,i)=>{const x=126+i*16.5,t=(x-118)/246,y=108+4*t*(1-t)*68-t*2;return `<path d="M${x} ${y-20+(4*t*(1-t)*-0)} L${x} ${y}" stroke="currentColor" stroke-width="1.5" opacity="${g}"/><rect x="${x-6}" y="${y-2}" width="12" height="5" rx="1"/>`;}).join("")}
    <rect x="112" y="80" width="8" height="32"/><rect x="360" y="78" width="8" height="32"/>
    <g opacity="${s}"><circle cx="90" cy="40" r="16"/><circle cx="110" cy="34" r="20"/><circle cx="132" cy="42" r="14"/><circle cx="360" cy="34" r="14"/><circle cx="380" cy="28" r="18"/></g>
    <path d="M0 90 Q20 66 40 74 Q60 50 86 70 L90 96Z" opacity="${m}"/>`),
  /* Victorian rooftops and chimneys, a sweep's brush, smoke and the moon */
  r08:S(0,`<circle cx="400" cy="50" r="26" opacity="${s}"/>
    <g opacity="${f}"><path d="M70 60 q-12 -16 4 -26 q18 -10 6 -28" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/><path d="M270 50 q-12 -16 4 -26" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/></g>
    <path d="M0 240 L0 130 L40 100 L80 130 L80 120 L130 90 L180 120 L180 110 L240 80 L300 110 L300 124 L350 96 L400 124 L400 112 L440 92 L480 112 L480 240Z" opacity="${m}"/>
    ${[[56,70,16,40],[150,66,14,34],[256,58,18,40],[330,74,14,30],[452,72,14,30]].map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" opacity="${g}"/><rect x="${x-3}" y="${y-5}" width="${w+6}" height="7" opacity="${g}"/>`).join("")}
    <path d="M0 240 L0 170 L60 150 L120 170 L120 160 L200 140 L280 160 L280 150 L360 132 L440 154 L480 146 L480 240Z" opacity="${g}"/>
    ${[[30,190],[90,196],[170,176],[230,186],[320,172],[400,180],[450,192]].map(([x,y])=>`<rect x="${x}" y="${y}" width="16" height="20" rx="2" fill="var(--illu-bg)" opacity=".6"/>`).join("")}
    <g transform="translate(196 92)"><circle cx="0" cy="0" r="9"/><path d="M-9 8 h18 l4 34 h-26z"/><path d="M4 14 L34 -26" stroke="currentColor" stroke-width="3"/>
      <g transform="translate(36 -30)">${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>`<path d="M0 0 L0 -12" transform="rotate(${a})" stroke="currentColor" stroke-width="2.5"/>`).join("")}</g><rect x="-11" y="-12" width="22" height="5" rx="2"/></g>`),
  /* A volcano with a plume of ash, glowing lava and a village */
  r09:S(0,`<g opacity="${s}"><circle cx="232" cy="48" r="30"/><circle cx="270" cy="30" r="34"/><circle cx="310" cy="50" r="26"/><circle cx="252" cy="70" r="24"/><circle cx="292" cy="76" r="20"/></g>
    <path d="M60 240 L210 92 Q236 82 262 92 L420 240Z" opacity="${g}"/>
    <path d="M228 92 Q236 120 224 150 Q214 180 236 220 L246 220 Q232 176 246 146 Q256 118 248 92Z" opacity="1"/>
    <path d="M206 96 Q236 108 266 96" fill="none" stroke="var(--illu-bg)" stroke-width="3" opacity=".7"/>
    <path d="M0 240 L0 200 L80 176 L140 200 Z M480 240 L480 196 L420 180 L360 210Z" opacity="${m}"/>
    ${[[24,206],[52,214],[400,212],[432,206],[456,214]].map(([x,y])=>`<rect x="${x}" y="${y}" width="18" height="14"/><path d="M${x-3} ${y} L${x+9} ${y-9} L${x+21} ${y}Z"/>`).join("")}
    <g opacity="${m}"><circle cx="200" cy="64" r="4"/><circle cx="318" cy="84" r="3"/><circle cx="182" cy="96" r="3"/></g>`),
  /* A football pitch: goal, net, a ball in flight and corner flags */
  r10:S(0,`<path d="M0 140 L480 140 L480 240 L0 240Z" opacity="${f}"/>
    ${[0,1,2,3,4,5].map(i=>`<path d="M${i*80} 140 L${i*80+80} 140 L${i*96+96} 240 L${i*96} 240Z" opacity="${i%2?f:s}"/>`).join("")}
    <path d="M40 200 Q240 170 440 200" fill="none" stroke="var(--illu-bg)" stroke-width="3"/>
    <g transform="translate(150 54)"><rect x="0" y="0" width="180" height="8"/><rect x="0" y="0" width="8" height="90"/><rect x="172" y="0" width="8" height="90"/>
      <g stroke="currentColor" stroke-width="1" opacity="${m}">${Array.from({length:11},(_,i)=>`<path d="M${8+i*16} 8 L${8+i*16} 90"/>`).join("")}${Array.from({length:6},(_,i)=>`<path d="M8 ${16+i*14} L172 ${16+i*14}"/>`).join("")}</g></g>
    <g transform="translate(360 104)"><circle r="20"/><path d="M0 -7 l7 5 l-3 8 h-8 l-3 -8z" fill="var(--illu-bg)"/><path d="M-20 0 h-14 M-16 -10 h-12 M-16 10 h-12" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="${m}"/></g>
    <path d="M40 140 L40 96" stroke="currentColor" stroke-width="3"/><path d="M40 96 L64 104 L40 112Z" opacity="${g}"/>
    <path d="M440 140 L440 96" stroke="currentColor" stroke-width="3"/><path d="M440 96 L416 104 L440 112Z" opacity="${g}"/>`),
  /* The space station above the Earth, stars and a letter */
  r11:S(0,`<g opacity="${m}">${[[30,30],[90,70],[150,20],[410,30],[450,90],[330,24],[200,60],[380,70]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${1.5+i%2}"/>`).join("")}</g>
    <path d="M0 240 Q240 150 480 240Z" opacity="${s}"/><path d="M40 240 Q240 170 440 240Z" opacity="${m}"/>
    <path d="M120 224 q30 -16 60 -6 q20 8 40 -4 M260 214 q30 -10 60 4" fill="none" stroke="var(--illu-bg)" stroke-width="5" stroke-linecap="round" opacity=".5"/>
    <g transform="translate(240 92) rotate(-8)"><rect x="-70" y="-4" width="140" height="8"/><rect x="-18" y="-14" width="36" height="28" rx="6"/>
      ${[-66,-48,30,48].map(x=>`<rect x="${x}" y="-38" width="16" height="30" opacity="${g}"/><rect x="${x}" y="8" width="16" height="30" opacity="${g}"/>`).join("")}<circle cx="0" cy="0" r="6" fill="var(--illu-bg)"/></g>
    <g transform="translate(386 150) rotate(10)"><rect x="-26" y="-17" width="52" height="34" rx="3" opacity="${g}"/><path d="M-26 -17 L0 4 L26 -17" fill="none" stroke="var(--illu-bg)" stroke-width="2.5"/></g>`),
  /* The water cycle: sun, sea, rising vapour, a cloud with rain over hills */
  r12:S(0,`<circle cx="72" cy="58" r="30" opacity="${g}"/>
    <g stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="${m}">${[0,45,90,135,180,225,270,315].map(a=>`<path d="M72 58 m0 -40 l0 -10" transform="rotate(${a} 72 58)"/>`).join("")}</g>
    <g opacity="${g}"><circle cx="330" cy="58" r="28"/><circle cx="366" cy="46" r="34"/><circle cx="404" cy="62" r="24"/><rect x="310" y="58" width="114" height="30" rx="15"/></g>
    <g stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="${m}">${[330,352,374,396,418].map((x,i)=>`<path d="M${x} ${100+(i%2)*8} l-6 16"/>`).join("")}</g>
    <path d="M260 240 L340 150 L400 200 L440 160 L480 190 L480 240Z" opacity="${m}"/>
    <path d="M0 196 Q60 188 120 196 T240 196 L260 240 L0 240Z" opacity="${s}"/>
    <path d="M0 214 Q60 206 120 214 T240 214 L250 240 L0 240Z" opacity="${m}"/>
    <path d="M120 180 q-10 -20 4 -36 q12 -16 2 -34 M160 180 q-10 -20 4 -36 q12 -16 2 -34" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="5 7" stroke-linecap="round" opacity="${g}"/>
    <path d="M200 70 Q260 30 300 52" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 6" opacity="${m}"/><path d="M294 44 L304 54 L290 58Z" opacity="${m}"/>
    <path d="M330 150 Q300 190 250 206" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 6" opacity="${m}"/>`),
  /* The crow with the cheese in an oak tree, the fox looking up */
  r13:S(0,`<path d="M0 210 Q240 196 480 210 L480 240 L0 240Z" opacity="${s}"/>
    <rect x="320" y="60" width="24" height="160" opacity="${g}"/>
    <g opacity="${m}"><circle cx="300" cy="50" r="44"/><circle cx="360" cy="34" r="50"/><circle cx="410" cy="64" r="40"/><circle cx="330" cy="80" r="34"/></g>
    <path d="M340 110 L230 96" stroke="currentColor" stroke-width="8" stroke-linecap="round" opacity="${g}"/>
    <g transform="translate(256 82)"><ellipse cx="0" cy="0" rx="20" ry="13"/><circle cx="16" cy="-12" r="9"/><path d="M24 -14 L36 -10 L24 -6Z"/><path d="M-18 2 L-36 10 L-16 8Z"/>
      <circle cx="18" cy="-14" r="2" fill="var(--illu-bg)"/><path d="M34 -10 l8 -2 l4 8 l-10 2z" opacity="${g}"/></g>
    <g transform="translate(120 172)"><path d="M0 24 Q-6 0 14 -6 L40 -8 Q60 -8 70 -20 L74 -36 L82 -22 L92 -36 L94 -18 Q104 -12 102 -2 L84 0 Q78 6 70 6 L66 30 L56 30 L56 12 L28 12 L26 30 L16 30 L14 14 Q6 20 0 24Z" opacity="${g}"/>
      <path d="M0 22 Q-40 20 -50 -4 Q-30 6 -6 8Z" opacity="${g}"/><path d="M-50 -4 Q-46 4 -38 6" fill="none" stroke="var(--illu-bg)" stroke-width="3"/><circle cx="88" cy="-10" r="2" fill="var(--illu-bg)"/></g>`),
  /* Layered cliffs, a beach and an ammonite fossil */
  r14:S(0,`<path d="M0 0 L300 0 Q290 60 300 110 Q290 150 270 170 L0 170Z" opacity="${s}"/>
    <path d="M0 40 Q150 30 296 46 M0 80 Q150 70 298 92 M0 120 Q140 112 286 140" fill="none" stroke="currentColor" stroke-width="3" opacity="${m}"/>
    <path d="M0 170 L270 170 L480 190 L480 240 L0 240Z" opacity="${f}"/>
    <path d="M300 200 Q380 190 480 196 L480 240 L300 240Z" opacity="${s}"/>
    <g transform="translate(120 120)" opacity="${g}"><circle r="34"/><path d="M0 0 m-4 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -18 0 a15 15 0 1 1 30 0 a21 21 0 1 1 -42 0 a27 27 0 1 1 54 0" fill="none" stroke="var(--illu-bg)" stroke-width="2.5"/></g>
    <g transform="translate(370 186)"><path d="M0 0 h24 q8 0 8 -8 l6 -10 l4 8 l4 -6 l0 12 q0 10 -10 12 l-2 14 h-6 l0 -10 h-18 l-2 10 h-6 l0 -12 q-10 -2 -10 -10z" opacity="${g}"/></g>
    <g transform="translate(420 140)"><circle cx="0" cy="0" r="8"/><path d="M-9 8 h18 l2 30 h-22z"/><path d="M-6 38 v10 M6 38 v10" stroke="currentColor" stroke-width="4"/><path d="M-10 -6 h20 l-4 -8 h-12z" opacity="${g}"/><path d="M9 16 L24 30" stroke="currentColor" stroke-width="3"/></g>`),
  /* A clockwork robin with its key, among turning gears */
  r15:S(0,`${[[90,80,40,10],[150,150,26,8],[400,170,34,9],[60,180,20,7]].map(([x,y,r,t])=>`<g transform="translate(${x} ${y})" opacity="${s}"><circle r="${r}"/>${Array.from({length:t},(_,i)=>`<rect x="-5" y="${-r-8}" width="10" height="12" transform="rotate(${i*360/t})"/>`).join("")}<circle r="${r*.4}" fill="var(--illu-bg)"/></g>`).join("")}
    <path d="M150 200 Q300 186 420 200" stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none" opacity="${m}"/>
    <g transform="translate(276 140)"><ellipse cx="0" cy="0" rx="50" ry="40" opacity="${g}"/><path d="M-30 6 Q0 40 34 16 Q30 -10 0 -16 Q-26 -14 -30 6Z" opacity="1"/>
      <circle cx="40" cy="-30" r="24" opacity="${g}"/><circle cx="48" cy="-36" r="4" fill="var(--illu-bg)"/><path d="M62 -32 L80 -28 L62 -22Z"/>
      <path d="M-46 -6 L-90 -30 L-84 -6Z" opacity="${g}"/><path d="M-6 38 v22 M10 38 v22" stroke="currentColor" stroke-width="4"/>
      <g transform="translate(-30 -48)"><rect x="-3" y="0" width="6" height="16"/><circle cx="-10" cy="-4" r="9" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="10" cy="-4" r="9" fill="none" stroke="currentColor" stroke-width="5"/></g></g>
    <g opacity="${m}"><path d="M360 60 l6 -12 l6 12 l-6 12z"/><path d="M200 50 l4 -8 l4 8 l-4 8z"/></g>`),
  /* A hedgehog in a garden at dusk, with leaves and a gap in the fence */
  r16:S(0,`<circle cx="400" cy="48" r="22" opacity="${s}"/>
    ${Array.from({length:12},(_,i)=>`<rect x="${i*40+4}" y="70" width="30" height="110" rx="4" opacity="${s}"/>`).join("")}<rect x="0" y="96" width="480" height="8" opacity="${s}"/><rect x="0" y="148" width="480" height="8" opacity="${s}"/>
    <path d="M300 180 a20 20 0 0 1 40 0Z" fill="var(--illu-bg)"/>
    <path d="M0 176 Q240 166 480 176 L480 240 L0 240Z" opacity="${m}"/>
    <g transform="translate(200 196)"><path d="M-70 10 Q-74 -40 -20 -50 Q30 -54 50 -20 L80 -6 Q86 0 80 6 L50 10Z" opacity="1"/>
      <g stroke="var(--illu-bg)" stroke-width="2.5" stroke-linecap="round" opacity=".7">${Array.from({length:9},(_,i)=>`<path d="M${-56+i*12} ${-30+Math.abs(i-4)*4} l-8 -10"/>`).join("")}</g>
      <circle cx="58" cy="-10" r="3" fill="var(--illu-bg)"/><circle cx="82" cy="1" r="4"/><path d="M-40 10 v10 M-10 10 v10 M30 10 v10" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></g>
    ${[[60,214,20],[96,224,-30],[380,212,40],[420,226,-10],[330,222,70]].map(([x,y,a])=>`<path d="M0 0 Q12 -12 26 0 Q12 12 0 0Z" transform="translate(${x} ${y}) rotate(${a})" opacity="${g}"/>`).join("")}`),
  };
})();
/* Each story's colour (a calm, readable tone) */
const ILLU_COLOR={r01:"#3d6fb6",r02:"#c98a1b",r03:"#4f8a5b",r04:"#b0623f",r05:"#5d6b8a",r06:"#3f8fb0",r07:"#4f7f4a",r08:"#6b6470",
  r09:"#c25a3a",r10:"#3f9466",r11:"#5a5fc4",r12:"#2f8f9d",r13:"#c4742f",r14:"#a07850",r15:"#c2504a",r16:"#8a6a4a"};
if(typeof module!=="undefined"&&module.exports)module.exports={ILLU,ILLU_COLOR};
