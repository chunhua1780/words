/* ================= 每周必备单词 · School words of the week (set by the school, entered by a parent) =================
   Shared by both study sites (the same file in each repo).
   A parent types or pastes the week's words in any form: numbered, several on a line, mixed with Chinese, misspelt,
   one at a time on different days. Google AI (or, without a key, a simple word finder plus the dictionary) turns that
   into a clean list: the word (spelling checked), a Chinese meaning, a short English meaning and an example sentence.
   The parent checks it, can change anything, and saves.
   The words become a test list (book.lists[testDay] with test:true and school:true), so they
   - are practised every day until the test (the must-do adds "School words" first, see nextTestList in must.js),
   - have their own practice on the Today page: learn, practise, a practice test like the school's, and meanings,
   - go into the meaning quiz, spaced review and the learning report like every other word. */
let SW={text:"",date:null,open:null,rows:null,msg:"",busy:false,src:""};
const swFriday=(t=today())=>addDays(t,(5-pdate(t).getDay()+7)%7); // today when it is Friday
const swLists=b=>Object.values(b.lists||{}).filter(l=>l.school).sort((a,c)=>a.date<c.date?1:-1);
const swIsWord=w=>/^[A-Za-z][A-Za-z'’ -]{0,28}[A-Za-z]$|^[A-Za-z]$/.test(w);

/* without AI: find the English words in what was typed */
function swLocal(text){
  const out=[],seen=new Set();
  for(const line of String(text).split(/[\n,;，；、。|\/\t]+/)){
    const parts=line.replace(/^\s*(\d+|[a-z])[.)、:：]\s*/i,"").replace(/[　-鿿＀-￯]+/g," ").trim();
    if(!parts)continue;
    const ws=parts.match(/[A-Za-z][A-Za-z'’-]*/g)||[];
    const items=ws.length>=2&&ws.length<=3&&!/\s{2,}/.test(parts)&&ws.every(w=>w.length<=3||w===ws[0])?[ws.join(" ")]:ws; // "a lot", "in front" stay together
    for(const w of items){const k=w.toLowerCase();if(w.length<2&&!/^[aI]$/.test(w))continue;if(seen.has(k))continue;seen.add(k);out.push({w:w.replace(/’/g,"'"),zh:"",def:"",ex:"",note:""});}
  }
  return out.slice(0,25);
}
async function swDict(rows){
  await Promise.all(rows.map(async r=>{if(r.def&&r.ex)return;try{
    const j=await (await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(r.w.toLowerCase()))).json();
    if(!Array.isArray(j)){r.note=r.note||"词典里找不到这个词，请检查拼写。";return;}
    const ds=(j[0].meanings||[]).flatMap(m=>m.definitions||[]);
    if(!r.def){const d=ds.map(d=>d.definition||"").find(d=>d.length>8&&d.length<=110);if(d)r.def=d;}
    if(!r.ex){const e=ds.map(d=>d.example||"").find(e=>e&&e.split(" ").length<=14&&new RegExp("\\b"+r.w.split(" ")[0].slice(0,5),"i").test(e));if(e)r.ex=e.replace(/^./,c=>c.toUpperCase());}
  }catch(e){}}));
  return rows;
}
async function swAi(text){
  const y=typeof aiYear==="function"?aiYear():5;
  const system=`You help a parent in England enter the weekly spelling words that their Year ${y} child's school set (usually 10). The parent's text may be messy: numbered, several words on one line, mixed with Chinese, misspelt, with notes. Find the English words the school set. Correct an obvious misspelling to the British spelling and say so in "note" (in Chinese). Keep a phrase only when it is clearly one item. Ignore notes that are not spelling words. Keep the parent's order.
For each word give: "zh" a short Chinese meaning; "def" a short child-friendly English meaning (at most 12 words); "ex" one example sentence for a child aged ${y===5?"9–10":"11–12"} that contains the word exactly as spelt; "note" empty unless you changed or are unsure of something.
Reply only with JSON: {"words":[{"w":"","zh":"","def":"","ex":"","note":""}]}`;
  const r=await aiCall(system,text,true);
  return (r.words||[]).map(x=>({w:String(x.w||"").trim().replace(/’/g,"'"),zh:String(x.zh||""),def:String(x.def||""),ex:String(x.ex||""),note:String(x.note||"")})).filter(x=>swIsWord(x.w)).slice(0,25);
}

/* ---------- the parent page block ---------- */
function schoolWordsBlock(){
  const b=B(), t=today(); SW.date=SW.date||swFriday(t); SW.open=SW.open||(weekStart(SW.date)<t?t:weekStart(SW.date));
  const cur=b.lists[SW.date], curWs=cur?wordsIn(b,SW.date):[], ls=swLists(b).slice(0,6), ai=typeof aiReady==="function"&&aiReady();
  const row=(r,i)=>`<div class="sw-row" data-swi="${i}"><input class="plain sw-w" value="${esc(r.w)}" aria-label="word"><input class="plain" data-f="zh" value="${esc(r.zh)}" placeholder="中文意思"><input class="plain" data-f="def" value="${esc(r.def)}" placeholder="English meaning"><input class="plain sw-ex" data-f="ex" value="${esc(r.ex)}" placeholder="Example sentence"><button class="icon-btn sm" data-swdel="${i}" aria-label="Remove">${ic("x")}</button>${r.note?`<div class="sw-note">${esc(r.note)}</div>`:""}</div>`;
  return `<div class="card stack no-zh sw-card" id="swBox">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><h3 style="margin:0">${ic("doc")} 每周必备单词 · School words of the week</h3><span class="muted small">学校每周规定的单词（一般 10 个）</span></div>
    <div class="muted small">怎么填都可以：一行一个、一行好几个、带编号、夹着中文、拼错了都没关系，也可以每天想起来加一两个。${ai?"点「AI 整理」，AI 会找出单词、改正拼写、配上中文意思、英文解释和例句，":"点「整理」会找出英文单词并从词典配上解释，"}点一下就自动保存。孩子每天先练这些词，直到测验那天。下面的记录里可以看到每个词。</div>
    <div class="row" style="gap:12px;flex-wrap:wrap">
      <label class="field">测验日期 Test day<input type="date" id="swDate" value="${SW.date}"></label>
      <label class="field">从哪天开始练 Practise from<input type="date" id="swOpen" value="${SW.open}"></label></div>
    ${curWs.length?`<div class="small"><b>这一周已经有 ${curWs.length} 个：</b>${curWs.map(w=>esc(w.w)).join(", ")}${curWs.length<10?` · 还差 ${10-curWs.length} 个`:""}</div>`:""}
    <textarea id="swText" rows="4" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="例如：1. beautiful 2.because 3 neighbour, separate  necessary  明天考 / 还有 accomodate">${esc(SW.text)}</textarea>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" id="swParse" ${SW.busy?"disabled":""}>${ic("sparkle")}${SW.busy?"正在整理并保存…":ai?"AI 整理并保存":"整理并保存"}</button>${SW.rows?`<button class="btn" id="swClear">清空</button>`:""}</div>
    ${SW.rows?`<div class="sw-list"><div class="muted small">${esc(SW.src)} 检查一下，可以直接改，不要的点 ✕。</div>${SW.rows.map(row).join("")}
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn primary" id="swSave">${ic("check")}保存为 ${esc(shortDate(SW.date))} 的必备单词（${SW.rows.length} 个）</button></div></div>`:""}
    ${SW.msg?`<div class="notice">${esc(SW.msg)}</div>`:""}
    ${ls.length?`<details ${ls.length?"open":""}><summary><b>每周必备单词记录</b></summary><div class="sw-hist">${ls.map(l=>{const ws=wordsIn(b,l.date),mk=(l.mocks||[]),last=mk[mk.length-1];
      return `<div class="sw-week"><div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px"><b>测验 ${esc(niceDate(l.date))}</b><span class="muted small">${ws.filter(w=>w.stage>0).length}/${ws.length} 学会 · ${ws.filter(w=>w.stage>=3).length} 很牢${mk.length?` · 模拟听写 ${mk.map(m=>`${m.s}/${m.n}`).join("、")}`:" · 还没做模拟听写"}</span></div>
        <div class="sw-words">${ws.map(w=>`<span class="sw-chip ${w.stage>=3?"ok":(w.lapses||0)>0?"bad":""}" title="${esc((w.zh||"")+" "+(w.def||""))}">${esc(w.w)}${w.zh?`<small>${esc(w.zh)}</small>`:""}${w.seen?`<small>${w.right||0}/${w.seen}</small>`:""}</span>`).join("")}</div>
        ${last&&(last.wrong||[]).length?`<div class="small">最近一次模拟听写写错：${last.wrong.map(id=>b.words[id]?esc(b.words[id].w):"").filter(Boolean).join("、")}</div>`:""}</div>`;}).join("")}</div></details>`:""}
  </div>`;
}
function schoolWordsBind(){
  const box=document.getElementById("swBox"); if(!box)return;
  const keepRows=()=>{if(!SW.rows)return;box.querySelectorAll("[data-swi]").forEach(el=>{const r=SW.rows[+el.dataset.swi];if(!r)return;r.w=el.querySelector(".sw-w").value.trim();el.querySelectorAll("[data-f]").forEach(i=>r[i.dataset.f]=i.value.trim());});};
  const dt=$("#swDate"); dt.onchange=()=>{keepRows();SW.date=dt.value||swFriday();if(SW.open>SW.date)SW.open=SW.date;render();};
  const op=$("#swOpen"); op.onchange=()=>{SW.open=op.value&&op.value<=SW.date?op.value:SW.date;};
  const tx=$("#swText"); tx.oninput=()=>{SW.text=tx.value;};
  $("#swParse").onclick=async()=>{SW.text=tx.value; if(!SW.text.trim()){SW.msg="先把单词填进上面的框里。";render();return;}
    SW.busy=true;SW.msg="";render();
    let rows=null;
    if(typeof aiReady==="function"&&aiReady()){try{rows=await swAi(SW.text);SW.src="AI 整理好了。";}catch(e){SW.msg="AI 暂时用不了（"+(typeof aiErr==="function"?aiErr(e):e.message)+"），先用普通方式整理。";}}
    if(!rows||!rows.length){rows=await swDict(swLocal(SW.text));SW.src="已找出英文单词，解释来自词典（没有中文意思，可以自己填）。";}
    else await swDict(rows.filter(r=>!r.def||!r.ex));
    SW.busy=false; swSave(rows);}; // tidied and saved in one go (the words can be seen and changed in the list below)
  const cl=$("#swClear"); if(cl)cl.onclick=()=>{SW.rows=null;SW.msg="";render();};
  box.querySelectorAll("[data-swdel]").forEach(x=>x.onclick=()=>{keepRows();SW.rows.splice(+x.dataset.swdel,1);render();});
  const sv=$("#swSave"); if(sv)sv.onclick=()=>{keepRows();swSave(SW.rows);};
}
function swSave(all){
    const rows=(all||[]).filter(r=>swIsWord(r.w)); if(!rows.length){SW.msg="没有找到可以保存的英文单词。";render();return;}
    const b=B(), date=SW.date, open=SW.open&&SW.open<=date?SW.open:date;
    const res=addWordsToBook(b,rows.map(r=>r.w),{date,title:"School words 每周必备",test:true,open});
    res.list.school=true; res.list.u=Date.now();
    for(const r of rows){const o=wordsIn(b,date).find(x=>norm(x.w)===norm(r.w));if(!o)continue;o.custom=true;o.school=true;
      if(r.zh)o.zh=r.zh; if(r.def)o.def=r.def; if(r.ex)o.ex=r.ex; o.u=Date.now();}
    Store.save(); const n=wordsIn(b,date).length;
    SW.msg=`✅ 已保存 ${rows.length} 个：${rows.map(r=>r.w+(r.zh?`（${r.zh}）`:"")).join("、")}。${rows.some(r=>r.note)?"AI 改动："+rows.filter(r=>r.note).map(r=>r.note).join("；")+"。":""}${niceDate(date)} 测验这一组现在一共 ${n} 个，孩子从 ${niceDate(open)} 开始每天先练。`;
    SW.rows=null; SW.text=""; render();
}
