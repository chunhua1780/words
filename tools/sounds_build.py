#!/usr/bin/env python3
"""Recordings of the 44 sounds for the sound chart (sounds.js), British neural voice, into audio/p/<sound>.mp3.
- long vowels and vowel sounds that are words in their own right are spoken directly ("ay", "ee", "eye" …)
- consonants: the start of a word minus the rest, e.g. /s/ = "sit" − "it" (the extra time at the start of "sit")
- short vowels: the vowel at the start of a word, up to the silence of the next stop: /a/ from "at"
- a few sounds that cannot be cut cleanly play their key word instead
Run from the repo root (needs: pip install edge-tts miniaudio lameenc): python3 tools/sounds_build.py"""
import asyncio, io, os, ssl, sys, array
import edge_tts, edge_tts.communicate as c, miniaudio, lameenc
CA=os.environ.get("SSL_CERT_FILE")
if CA: c._SSL_CTX=ssl.create_default_context(cafile=CA)
PROXY=os.environ.get("HTTPS_PROXY"); VOICE="en-GB-SoniaNeural"; SR=24000
SAY={"ai":"ay","ee":"ee","igh":"eye","oa":"oh","oo":"oo","yoo":"you","ar":"are","or":"or","er":"er","ow":"ow","oi":"oy","air":"air","ear":"ear"}
ONSET={"b":("bat","at"),"k":("cat","at"),"d":("din","in"),"f":("fan","an"),"g":("gate","ate"),"h":("hat","at"),"j":("jam","am"),"l":("lit","it"),
  "m":("mat","at"),"n":("nit","it"),"p":("pin","in"),"r":("rat","at"),"s":("sit","it"),"t":("tin","in"),"v":("van","an"),"w":("win","in"),"y":("yam","am"),
  "z":("zit","it"),"sh":("shin","in"),"ch":("chin","in"),"th":("thin","in"),"dh":("that","at"),"kw":("quit","it")}
VOWEL={"a":"at","e":"echo","i":"it","o":"otter","u":"up"}
WORD={"oo2":"book","ng":"sing","zh":"treasure","ks":"box"}
async def tts(text,rate="-15%"):
    buf=io.BytesIO()
    async for ch in edge_tts.Communicate(text,VOICE,rate=rate,proxy=PROXY).stream():
        if ch["type"]=="audio": buf.write(ch["data"])
    d=miniaudio.decode(buf.getvalue(),output_format=miniaudio.SampleFormat.SIGNED16,nchannels=1,sample_rate=SR)
    return array.array("h",d.samples)
def frames(s,ms=10):
    n=SR*ms//1000; return [max((abs(x) for x in s[i:i+n]),default=0) for i in range(0,len(s),n)],n
def span(s):
    e,n=frames(s); th=max(e)*.08; v=[i for i,x in enumerate(e) if x>th]; return v[0]*n,(v[-1]+1)*n
def fade(s):
    s=array.array("h",s); k=min(len(s)//4,SR*15//1000)
    for i in range(k): s[i]=int(s[i]*i/k); s[-1-i]=int(s[-1-i]*i/k)
    return s
def mp3(s,path):
    e=lameenc.Encoder(); e.set_bit_rate(32); e.set_in_sample_rate(SR); e.set_channels(1); e.set_quality(2)
    pad=array.array("h",[0]*(SR//20)); os.makedirs(os.path.dirname(path),exist_ok=True)
    open(path,"wb").write(bytes(e.encode((pad+s+pad).tobytes())+e.flush()))
async def make(k):
    out=f"audio/p/{k}.mp3"
    if k in SAY: w=await tts(SAY[k]); a,b=span(w); mp3(fade(w[a:b]),out)
    elif k in ONSET:
        w=await tts(ONSET[k][0]); r=await tts(ONSET[k][1]); a,b=span(w); ra,rb=span(r)
        L=max(SR*60//1000,min(SR*450//1000,(b-a)-(rb-ra)))
        mp3(fade(w[a:a+L]),out)
    elif k in VOWEL:
        w=await tts(VOWEL[k]); a,b=span(w); e,n=frames(w); th=max(e)*.08; i=a//n
        while i<len(e) and e[i]>th: i+=1
        mp3(fade(w[a:max(a+SR//10,i*n)]),out)
    else: w=await tts(WORD[k],"-25%"); a,b=span(w); mp3(fade(w[a:b]),out)
    return out
async def main():
    keys=[*SAY,*ONSET,*VOWEL,*WORD]; sem=asyncio.Semaphore(6)
    async def one(k):
        async with sem:
            for t in range(3):
                try: return await make(k)
                except Exception as e: err=e; await asyncio.sleep(1+t)
            print("FAIL",k,err)
    r=await asyncio.gather(*[one(k) for k in keys]); print("made",len([x for x in r if x]),"of",len(keys))
asyncio.run(main())
