/* Word Speller: shared code for the child page (index.html) and the parent page (parent.html).
   Accounts live in Supabase (table ws_accounts, functions ws_register / ws_login / ws_save, see setup-accounts.sql). */
"use strict";
const SB_URL="https://mztoenhgfuomzrashrqk.supabase.co";
const SB_KEY="sb_publishable_pOM3IfVWYiscQ-cz9vAwvA_F2Ht6zg1";

async function rpc(fn,args){
  let r;
  try{
    r=await fetch(`${SB_URL}/rest/v1/rpc/${fn}`,{method:"POST",cache:"no-store",
      headers:{apikey:SB_KEY,Authorization:"Bearer "+SB_KEY,"Content-Type":"application/json"},body:JSON.stringify(args)});
  }catch(e){const err=new Error("offline");err.offline=true;throw err;}
  const t=await r.text(); let j=null; try{j=t?JSON.parse(t):null;}catch(e){}
  if(!r.ok){const err=new Error((j&&j.message)||("http_"+r.status));err.status=r.status;throw err;}
  return j;
}
const WS={
  register:(u,p)=>rpc("ws_register",{p_user:u,p_pass:p}),
  login:(u,p)=>rpc("ws_login",{p_user:u,p_pass:p}),
  save:(u,p,d)=>rpc("ws_save",{p_user:u,p_pass:p,p_data:d}),
  changePassword:(u,p,n)=>rpc("ws_change_password",{p_user:u,p_pass:p,p_new:n}),
};
const AUTH_MSG={
  bad_login:"Wrong username or password.",
  username_taken:"That username is already taken. Try logging in instead.",
  bad_username:"Use 2 to 24 letters or numbers for the username.",
  short_password:"The password needs at least 4 characters.",
  offline:"Can't reach the internet. Check the connection and try again.",
};
const authMsg=e=>AUTH_MSG[e.message]||(e.status===404?"The account system isn't set up yet (run setup-accounts.sql in Supabase).":"Something went wrong: "+e.message);

/* ---------- small helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const dstr=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const today=()=>dstr(new Date());
const pdate=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);};
const addDays=(s,n)=>{const d=pdate(s);d.setDate(d.getDate()+n);return dstr(d);};
const dayDiff=(a,b)=>Math.round((pdate(b)-pdate(a))/864e5);
const WEEK=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH=["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAY=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const niceDate=s=>{const d=pdate(s);return `${WEEKDAY[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]}`;};
const shortDate=s=>{const d=pdate(s);return `${WEEK[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()].slice(0,3)}`;};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const norm=s=>String(s).toLowerCase().replace(/[’`]/g,"'").replace(/\s+/g," ").trim();
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-3);
const inDays=n=>n===0?"today":n===1?"tomorrow":n===-1?"yesterday":n>0?`in ${n} days`:`${-n} days ago`;

/* Spaced review: learned words come back after 1, 2, 4, 7, 15, 30 and 60 days */
const INTERVAL=[0,1,2,4,7,15,30,60];
const MASTER=7;

function parseWords(text){
  const out=[], seen=new Set();
  String(text).split(/[\n,;，；、]+/).forEach(chunk=>{
    const w=chunk.replace(/[^A-Za-z'’\- ]+/g," ").replace(/\s+/g," ").replace(/^[\s'\-]+|[\s'\-]+$/g,"").trim();
    if(w&&/[a-z]/i.test(w)&&!seen.has(w.toLowerCase())){seen.add(w.toLowerCase());out.push(w);}
  });
  return out;
}
const newWord=(w,due)=>({id:uid(),w,ipa:"",ex:"",stage:0,due,added:today(),lapses:0,seen:0,right:0,u:Date.now()});

/* A child's book: words, school tests, practice log. Two copies (this device and the cloud) are merged item by item. */
function normBook(d,name){
  d=d&&typeof d==="object"?d:{};
  const rd=d.reading||{};
  return {name:d.name||name||"",words:d.words||{},tests:d.tests||{},lists:d.lists||{},listsV:d.listsV||0,deleted:d.deleted||{},log:d.log||{},best:d.best||0,prefs:d.prefs||{},
    reading:{log:rd.log||{},done:rd.done||{},looked:rd.looked||{}},maths:{q:(d.maths||{}).q||{},days:(d.maths||{}).days||{},log:(d.maths||{}).log||{}},updated:d.updated||0};
}
function mergeBooks(a,b){
  a=normBook(a);b=normBook(b);
  const del={...b.deleted};
  for(const [k,v] of Object.entries(a.deleted))del[k]=Math.max(del[k]||0,v);
  const cutoff=Date.now()-60*864e5; for(const k in del)if(del[k]<cutoff)delete del[k];
  const mergeMap=(x,y)=>{const out={};
    for(const id of new Set([...Object.keys(x),...Object.keys(y)])){
      const p=x[id],q=y[id]; const it=!p?q:!q?p:((q.u||0)>(p.u||0)?q:p);
      if(del[id]&&del[id]>=(it.u||0))continue; out[id]=it;}
    return out;};
  const log={...b.log};
  for(const [d,v] of Object.entries(a.log)){const o=log[d];log[d]=!o?v:{done:Math.max(o.done||0,v.done||0),right:Math.max(o.right||0,v.right||0)};}
  // reading: minutes per day (keep the larger), finished passages and looked-up words (keep the newer)
  const rlog={...b.reading.log};
  for(const [d,v] of Object.entries(a.reading.log)){const o=rlog[d];rlog[d]=!o?v:{secs:Math.max(o.secs||0,v.secs||0),ids:[...new Set([...(o.ids||[]),...(v.ids||[])])]};}
  const newer=(x,y)=>{const out={...y};for(const [k,v] of Object.entries(x))if(!out[k]||(v.u||0)>=(out[k].u||0))out[k]=v;return out;};
  const reading={log:rlog,done:newer(a.reading.done,b.reading.done),looked:newer(a.reading.looked,b.reading.looked)};
  // maths: per question and per day keep the newer copy (a daily set keeps the one with more answers); per-day counts keep the larger
  const mdays={...b.maths.days};
  for(const [d,v] of Object.entries(a.maths.days)){const o=mdays[d],na=Object.keys(v.ans||{}).length,no=o?Object.keys(o.ans||{}).length:-1;
    if(!o||na>no||(na===no&&(v.u||0)>=(o.u||0)))mdays[d]=v;}
  const mlog={...b.maths.log};
  for(const [d,v] of Object.entries(a.maths.log)){const o=mlog[d];mlog[d]=!o?v:{n:Math.max(o.n||0,v.n||0),r:Math.max(o.r||0,v.r||0)};}
  const maths={q:newer(a.maths.q,b.maths.q),days:mdays,log:mlog};
  const lists={};
  for(const k of new Set([...Object.keys(a.lists),...Object.keys(b.lists)])){
    const p=a.lists[k],q=b.lists[k],it=!p?q:!q?p:((q.u||0)>(p.u||0)?q:p);
    if(del["L:"+k]&&del["L:"+k]>=(it.u||0))continue; lists[k]=it;
  }
  return {name:a.name||b.name,words:mergeMap(a.words,b.words),tests:mergeMap(a.tests,b.tests),lists,listsV:Math.max(a.listsV,b.listsV),deleted:del,log,reading,maths,
    best:Math.max(a.best,b.best),prefs:((a.prefs.u||0)>=(b.prefs.u||0)?a.prefs:b.prefs),updated:Math.max(a.updated,b.updated)};
}

/* ---------- Login session and sync ---------- */
const SESSION_KEY="ws-session";
const loadSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||"null");}catch(e){return null;}};
const saveSession=(user,pass)=>{try{localStorage.setItem(SESSION_KEY,JSON.stringify({user,pass}));}catch(e){}};
const clearSession=()=>{try{localStorage.removeItem(SESSION_KEY);}catch(e){}};

const Store={
  user:null,pass:null,book:null,status:"idle",dirty:false,timer:null,pushing:false,again:false,
  onStatus:null,onRemote:null,
  key(){return "ws-book-"+this.user;},
  local(){try{return JSON.parse(localStorage.getItem(this.key())||"null");}catch(e){return null;}},
  writeLocal(){try{localStorage.setItem(this.key(),JSON.stringify(this.book));}catch(e){}},
  setStatus(s){this.status=s;this.onStatus&&this.onStatus(s);},
  /* Log in (or create the account) and load the newest words */
  async open(user,pass,create){
    user=String(user).trim().toLowerCase();
    let res;
    try{res=create?await WS.register(user,pass):await WS.login(user,pass);}
    catch(e){
      const s=loadSession();
      if(e.offline&&!create&&s&&s.user===user&&s.pass===pass){ // offline: use the copy on this device
        this.user=user;this.pass=pass;const l=this.local();
        if(l){this.book=normBook(l,user);this.setStatus("error");return this.book;}
      }
      throw e;
    }
    this.user=user;this.pass=pass;saveSession(user,pass);
    const remote=normBook(res&&res.data,user);
    const local=this.local();
    this.book=local?mergeBooks(local,remote):remote;
    if(!this.book.name)this.book.name=user;
    if(migrateLists(this.book))this.dirty=true;
    this.writeLocal();
    this.dirty=this.dirty||!!local||create;
    await this.sync();
    return this.book;
  },
  logout(){clearTimeout(this.timer);this.user=this.pass=this.book=null;clearSession();this.setStatus("idle");},
  save(){
    if(!this.book)return;
    this.book.updated=Date.now();this.dirty=true;this.writeLocal();this.setStatus("saving");
    clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),1500);
  },
  /* Pull the cloud copy, merge it with this device's copy, and upload if anything here changed */
  async sync(){
    if(!this.user)return;
    if(this.pushing){this.again=true;return;}
    this.pushing=true;
    try{
      const r=await WS.login(this.user,this.pass);
      const before=JSON.stringify(this.book);
      const merged=mergeBooks(this.book,normBook(r&&r.data,this.user));
      Object.keys(merged).forEach(k=>this.book[k]=merged[k]);
      if(migrateLists(this.book))this.dirty=true;
      const changed=JSON.stringify(this.book)!==before;
      if(this.dirty){this.dirty=false;await WS.save(this.user,this.pass,this.book);}
      this.writeLocal();this.setStatus("saved");
      if(changed&&this.onRemote)this.onRemote();
    }catch(e){
      this.dirty=true;
      this.setStatus(e.message==="bad_login"?"auth":"error");
      clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),30000);
    }
    this.pushing=false;
    if(this.again){this.again=false;this.sync();}
  },
};
document.addEventListener("visibilitychange",()=>{if(Store.user&&document.visibilityState==="visible")Store.sync();});
window.addEventListener("online",()=>{if(Store.user)Store.sync();});
setInterval(()=>{if(Store.user&&document.visibilityState==="visible"&&!window.__busy)Store.sync();},60000);
const SYNC_TEXT={idle:"",saving:"Saving…",saved:"Saved",error:"Offline · saved on this device",auth:"Please log in again"};

/* ---------- Word lists by study date ----------
   Every word belongs to exactly one list, named by its study date (e.g. 2026-10-09).
   A list is locked until its date. The child always practises one list at a time. */
function wordsOf(book){return Object.values(book.words);}
const wordsIn=(book,date)=>wordsOf(book).filter(w=>w.list===date);
/* A list can be studied from its "open" day (for a test: some days before the test); ordinary lists open on their own date */
const openDay=l=>l.open||l.date;
const listOpen=l=>!!l&&openDay(l)<=today();
function listsOf(book){return Object.values(book.lists).filter(l=>wordsIn(book,l.date).length).sort((a,b)=>a.date.localeCompare(b.date));}
/* Older saved data: tests become lists on their test date; other words go to the date they were added */
function migrateLists(book){
  if(book.listsV>=1)return false;
  const now=Date.now(), inTest={};
  Object.values(book.tests||{}).forEach(t=>{
    const added=(t.wordIds||[]).map(id=>book.words[id]&&book.words[id].added).filter(Boolean).sort();
    const open=[added[0]||today(),t.date].sort()[0];
    book.lists[t.date]={date:t.date,open,title:t.title||"Spelling test",test:true,mocks:t.mocks||[],u:now};
    (t.wordIds||[]).forEach(id=>{if(!inTest[id]||t.date<inTest[id])inTest[id]=t.date;});
  });
  wordsOf(book).forEach(w=>{
    if(!w.list){w.list=inTest[w.id]||w.added||w.due||today();w.u=now;}
    if(!book.lists[w.list])book.lists[w.list]={date:w.list,title:"",test:false,mocks:[],u:now};
  });
  book.listsV=1;
  return true;
}
/* What to do with one list on a given day: new words to learn, and words due for review.
   In the week before a test, every learned word in the list is practised each day. */
function listPlan(book,date,day=today()){
  const l=book.lists[date], ws=wordsIn(book,date);
  if(!listOpen(l))return {fresh:[],review:[],all:ws,locked:true};
  const fresh=ws.filter(w=>w.stage===0);
  const testSoon=l.test&&dayDiff(day,l.date)>=0&&dayDiff(day,l.date)<=7;
  const review=ws.filter(w=>w.stage>0&&(w.due<=day||(testSoon&&w.last!==day)));
  return {fresh,review,all:ws,locked:false};
}
function streakOf(log){
  let n=0,d=today(); log=log||{};
  if(!log[d])d=addDays(d,-1);
  while(log[d]){n++;d=addDays(d,-1);}
  return n;
}
const masteryOf=w=>w.stage>=MASTER?"mastered":w.stage>=3?"strong":w.stage>=1?"learning":"new";
const MASTERY_LABEL={new:"Not learned",learning:"Learning",strong:"Strong",mastered:"Mastered"};
/* Add words to the list for a study date. A word already in that same list is kept; other lists are never touched. */
function addWordsToBook(book,list,{date,title,test,open}={}){
  date=date||today();
  const l=book.lists[date]||(book.lists[date]={date,title:"",test:false,mocks:[],u:Date.now()});
  if(title!=null&&title!==l.title){l.title=title;l.u=Date.now();}
  if(test!=null&&test!==l.test){l.test=test;l.u=Date.now();}
  const op=l.test?(open||l.open||date):date;
  if(op!==l.open){l.open=op>date?date:op;l.u=Date.now();}
  const added=[],reused=[];
  list.forEach(w=>{
    const old=wordsIn(book,date).find(x=>norm(x.w)===norm(w));
    if(old){reused.push(old);return;}
    const nw=newWord(w,openDay(l));nw.list=date;book.words[nw.id]=nw;added.push(nw);
  });
  delete book.deleted["L:"+date];
  return {added,reused,list:l};
}
function deleteWord(book,id){delete book.words[id]; book.deleted[id]=Date.now();}
function deleteList(book,date){wordsIn(book,date).forEach(w=>deleteWord(book,w.id));delete book.lists[date];book.deleted["L:"+date]=Date.now();}
const listName=(l,{short}={})=>(short?shortDate(l.date):niceDate(l.date))+(l.title?` · ${l.title}`:l.test?" · Test":"");

/* ---------- Line icons (drawn in the style of Apple's SF Symbols) ---------- */
const ICON_PATHS={
  speaker:'<path d="M4 9.5h3.2L11.5 6v12l-4.3-3.5H4z"/><path d="M15 9.2a4 4 0 0 1 0 5.6M17.6 6.8a7.5 7.5 0 0 1 0 10.4"/>',
  slow:'<path d="M4 9.5h3.2L11.5 6v12l-4.3-3.5H4z"/><path d="M15 10.2a2.6 2.6 0 0 1 0 3.6"/>',
  wave:'<path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10.5v3"/>',
  abc:'<path d="M3.5 17l3.5-10 3.5 10M4.8 13.5h4.4M14 7v10h3a2.5 2.5 0 0 0 0-5h-3 2.5a2.5 2.5 0 0 0 0-5z"/>',
  quote:'<path d="M5 18c2.5-1 3.8-3 3.8-6V7H4.5v5h4.3M15 18c2.5-1 3.8-3 3.8-6V7h-4.3v5h4.3"/>',
  trash:'<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10.5 10.5v6M13.5 10.5v6"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  book:'<path d="M12 6.5C10 5 7 4.6 4 5v13c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5V5c-3-.4-6 0-8 1.5zM12 6.5v13"/>',
  game:'<path d="M7.5 8h9a4.5 4.5 0 0 1 4.3 5.8l-.8 2.8a2.2 2.2 0 0 1-3.9.6L14.7 15H9.3l-1.4 2.2a2.2 2.2 0 0 1-3.9-.6l-.8-2.8A4.5 4.5 0 0 1 7.5 8z"/><path d="M8 10.5v3M6.5 12h3M15.5 11h.01M17.5 13h.01"/>',
  headphones:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/>',
  puzzle:'<path d="M9 4.5h3a1.8 1.8 0 1 1 3.4 0H19v4a1.8 1.8 0 1 0 0 3.4V19h-4.5a1.8 1.8 0 1 0-3.4 0H5v-5a1.8 1.8 0 1 1 0-3.4V4.5z"/>',
  pencil:'<path d="M15.5 5.5l3 3L8 19l-4 1 1-4z"/><path d="M13.5 7.5l3 3"/>',
  doc:'<path d="M7 3.5h7l4 4V20.5H7z"/><path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6"/>',
  layers:'<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5"/>',
  star:'<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7 6.9 19.4l1-5.6-4.1-4 5.7-.8z"/>',
  flame:'<path d="M12 21c3.6 0 6-2.5 6-5.8 0-3.7-2.9-5.6-3.8-9.2-1.9 1.5-2.6 3.4-2.4 5.2-1.3-.6-2.2-2-2.3-3.4C7.6 9.6 6 12 6 15.2 6 18.5 8.4 21 12 21z"/>',
  person:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 6.1A9.9 9.9 0 0 1 12 6c5 0 8.5 4.5 9.5 6-.5.8-1.6 2.3-3.1 3.6M6.4 7.6C4.5 8.9 3.1 10.8 2.5 12c1 1.5 4.5 6 9.5 6 1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  chevron:'<path d="M9 5.5l6.5 6.5L9 18.5"/>',
  back:'<path d="M15 5.5L8.5 12l6.5 6.5"/>',
  play:'<path d="M8 5.5v13l10.5-6.5z"/>',
  pause:'<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  textsize:'<path d="M3 18l4-11 4 11M4.3 14.5h5.4M13.5 18l3.3-9 3.2 9M14.6 15.3h4.4"/>',
  sparkle:'<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/>',
  lock:'<rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6"/>',
  maths:'<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M7 8.2h3.6M8.8 6.4V10M13.6 8.2h3.6M7.4 14.4l2.8 2.8M10.2 14.4l-2.8 2.8M13.6 14.6h3.6M13.6 17h3.6"/>',
  calendar:'<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 9.5h16M8.5 3.5v4M15.5 3.5v4"/>',
};
const ic=(name,cls="")=>`<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]||""}</svg>`;
