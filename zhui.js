/* ================= English first, Chinese on request (all pages of both sites; the same file in each repo) =================
   Everything is shown in English. The 中文 button (top right) turns Chinese on or off for every page; the choice is
   kept on this device (localStorage "zh-on", the same switch as the 中 button on maths questions).
   Any Chinese written in the pages (e.g. "今日必做 · Today’s must-do") is moved into a small line under the English
   (<span class="zh-t">), which only shows while Chinese is on. This runs on everything the pages draw, so new
   screens follow the same rule without extra work. */
(function(){
  const CJK=/[　-〿㐀-鿿＀-￯]/;
  const SKIP=new Set(["SCRIPT","STYLE","TEXTAREA","INPUT","OPTION","SELECT","TITLE","NOSCRIPT"]);
  const on=()=>{try{return localStorage.getItem("zh-on")==="1";}catch(e){return false;}};
  const sync=()=>{document.documentElement.classList.toggle("zh-on",on());const b=document.getElementById("zhAll");if(b){b.classList.toggle("on",on());b.setAttribute("aria-pressed",on());}};
  function split(node){
    const t=node.nodeValue; if(!t||!CJK.test(t))return;
    const p=node.parentNode; if(!p||p.nodeType!==1||SKIP.has(p.nodeName)||p.closest(".zh-t,.zh,[contenteditable],.dv-text,.diary-x,.nf-cell,.no-zh"))return;
    // each Chinese run: from a Chinese character to the last one before any English letter (digits and signs inside stay with it)
    const RUN=/[　-〿㐀-鿿＀-￯](?:[^A-Za-z]*?[　-〿㐀-鿿＀-￯])*/g;
    const zh=(t.match(RUN)||[]).join(" ");
    const en=t.replace(RUN," ").replace(/(\s*·\s*)+/g," · ").replace(/^[\s·:：]+|[\s·:：]+$/g,"").replace(/\s{2,}/g," ");
    const keepL=/^\s/.test(t)&&en?" ":"", keepR=/\s$/.test(t)&&en?" ":"";
    node.nodeValue=en?keepL+en+keepR:"";
    const s=document.createElement("span"); s.className="zh-t"; s.textContent=zh.replace(/^[·\s]+|[·\s]+$/g,"");
    p.insertBefore(s,node.nextSibling);
  }
  function walk(root){
    if(root.nodeType===3){split(root);return;}
    if(root.nodeType!==1||SKIP.has(root.nodeName)||root.classList&&root.classList.contains("zh-t"))return;
    const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>CJK.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
    const list=[]; while(tw.nextNode())list.push(tw.currentNode); list.forEach(split);
  }
  function button(){
    if(document.getElementById("zhAll"))return;
    const b=document.createElement("button"); b.id="zhAll"; b.type="button"; b.className="chip zh-all no-zh"; b.textContent="中文"; b.title="Show Chinese under the English";
    b.onclick=()=>{try{localStorage.setItem("zh-on",on()?"0":"1");}catch(e){} sync();
      try{if(typeof renderMQ==="function"&&typeof MS!=="undefined"&&MS&&!document.getElementById("maths").hidden)renderMQ();else if(typeof render==="function")render();}catch(e){}};
    const head=document.querySelector("header.top");
    if(head)head.appendChild(b); else{b.classList.add("zh-float");document.body.appendChild(b);}
  }
  function start(){
    sync(); button(); walk(document.body);
    new MutationObserver(ms=>{for(const m of ms){if(m.type==="characterData")split(m.target);else m.addedNodes.forEach(walk);}})
      .observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener("storage",e=>{if(e.key==="zh-on")sync();});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start); else start();
  // the 中 button on maths questions uses the same switch: keep the page in step with it
  const t0=window.zhToggle; if(typeof t0==="function")window.zhToggle=function(){t0();sync();};
  window.zhSync=sync;
})();
