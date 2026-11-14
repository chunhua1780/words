/* ================= Quiet updates (both sites; the same file in each repo) =================
   version.txt holds the version of the site (changed with every update). The page checks it every 2 minutes and
   whenever it comes back on screen. When a new version is out, it waits for a quiet moment: no activity open
   (window.__busy), nothing being typed and every answer saved. Then it refreshes the browser's copies of the files
   and reloads, so the child simply sees the new version on the home screen. Progress is kept (it is saved first). */
(function(){
  const KEY="app-ver:"+location.pathname.split("/")[1];
  const seen=()=>{try{return localStorage.getItem(KEY);}catch(e){return null;}};
  const remember=v=>{try{localStorage.setItem(KEY,v);}catch(e){}};
  let pending=null, applying=false;
  async function serverVersion(){
    try{const r=await fetch("version.txt?t="+Date.now(),{cache:"no-store"});if(!r.ok)return null;return (await r.text()).trim().slice(0,64)||null;}catch(e){return null;}
  }
  async function check(){
    const v=await serverVersion(); if(!v)return;
    if(!seen()){remember(v);return;}            // first visit on this device
    if(v!==seen())pending=v;
  }
  const quiet=()=>!window.__busy&&!(document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))
    &&!(window.Store&&(Store.dirty||Store.pushing));
  async function apply(){
    if(applying)return; applying=true;
    const urls=[location.href.split("#")[0],...[...document.querySelectorAll("script[src],link[rel=stylesheet]")].map(e=>e.src||e.href)]
      .filter(u=>u&&u.startsWith(location.origin));
    await Promise.all(urls.map(u=>fetch(u,{cache:"reload"}).catch(()=>{}))); // refresh the cached files
    remember(pending); location.reload();
  }
  check(); setInterval(check,120000);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check();});
  setInterval(()=>{if(pending&&!applying&&quiet())apply();},2000);
})();
