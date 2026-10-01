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
const niceDate=s=>{const d=pdate(s);return `${WEEK[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`;};
const shortDate=s=>{const d=pdate(s);return `${WEEK[d.getDay()]} ${MONTH[d.getMonth()].slice(0,3)} ${d.getDate()}`;};
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
  return {name:d.name||name||"",words:d.words||{},tests:d.tests||{},deleted:d.deleted||{},log:d.log||{},best:d.best||0,prefs:d.prefs||{},updated:d.updated||0};
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
  return {name:a.name||b.name,words:mergeMap(a.words,b.words),tests:mergeMap(a.tests,b.tests),deleted:del,log,
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
    this.writeLocal();
    this.dirty=!!local||create;
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
const SYNC_TEXT={idle:"",saving:"☁️ Saving…",saved:"☁️ Saved",error:"⚠️ Offline: saved on this device",auth:"⚠️ Please log in again"};

/* ---------- Words, lists and tests ---------- */
function wordsOf(book){return Object.values(book.words);}
function testsOf(book){return Object.values(book.tests).sort((a,b)=>a.date.localeCompare(b.date));}
function upcomingTests(book,within=60){const t=today();return testsOf(book).filter(x=>dayDiff(t,x.date)>=0&&dayDiff(t,x.date)<=within);}
/* Words for a day: new words, words due for review, and words in a test coming up within 7 days (practised daily until the test) */
function dueOn(book,day){
  const ws=wordsOf(book), isToday=day===today();
  const fresh=ws.filter(w=>w.stage===0&&(isToday?w.due<=day:w.due===day));
  const review=ws.filter(w=>w.stage>0&&(isToday?w.due<=day:w.due===day));
  const testIds=new Set();
  testsOf(book).forEach(x=>{const d=dayDiff(day,x.date);if(d>=0&&d<=7)(x.wordIds||[]).forEach(id=>testIds.add(id));});
  ws.forEach(w=>{if(testIds.has(w.id)&&w.stage>0&&w.last!==day&&!review.includes(w))review.push(w);});
  return {fresh,review};
}
function streakOf(log){
  let n=0,d=today(); log=log||{};
  if(!log[d])d=addDays(d,-1);
  while(log[d]){n++;d=addDays(d,-1);}
  return n;
}
const masteryOf=w=>w.stage>=MASTER?"mastered":w.stage>=3?"strong":w.stage>=1?"learning":"new";
const MASTERY_LABEL={new:"Not learned",learning:"Learning",strong:"Strong",mastered:"Mastered"};
/* Add words (and optionally a school test with a date). Words already in the list are reused. */
function addWordsToBook(book,list,{due,testDate,testTitle}={}){
  const added=[],reused=[];
  const ids=list.map(w=>{
    const old=wordsOf(book).find(x=>norm(x.w)===norm(w));
    if(old){reused.push(old);if(old.stage===0&&due&&old.due>due){old.due=due;old.u=Date.now();}return old.id;}
    const nw=newWord(w,due||today());book.words[nw.id]=nw;added.push(nw);return nw.id;
  });
  let test=null;
  if(testDate){test={id:uid(),date:testDate,title:testTitle||"Spelling test",wordIds:ids,mocks:[],u:Date.now()};book.tests[test.id]=test;}
  return {added,reused,test};
}
function deleteWord(book,id){
  delete book.words[id]; book.deleted[id]=Date.now();
  Object.values(book.tests).forEach(t=>{if((t.wordIds||[]).includes(id)){t.wordIds=t.wordIds.filter(x=>x!==id);t.u=Date.now();}});
}
function deleteTest(book,id){delete book.tests[id];book.deleted[id]=Date.now();}
