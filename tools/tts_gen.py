"""Generate British English neural speech (Microsoft en-GB-SoniaNeural) for a list of jobs, re-encoded to 24 kbps mono MP3.
Input: JSON [[outpath, text, rate], ...]. Skips files that exist."""
import asyncio, ssl, os, sys, json, io
import edge_tts, edge_tts.communicate as c, miniaudio, lameenc
CA=os.environ.get("SSL_CERT_FILE")
if CA: c._SSL_CTX=ssl.create_default_context(cafile=CA)  # behind a proxy with its own certificate
PROXY=os.environ.get("HTTPS_PROXY")
def reencode(mp3):
    d=miniaudio.decode(mp3,output_format=miniaudio.SampleFormat.SIGNED16,nchannels=1,sample_rate=24000)
    e=lameenc.Encoder(); e.set_bit_rate(24); e.set_in_sample_rate(24000); e.set_channels(1); e.set_quality(2)
    return bytes(e.encode(d.samples.tobytes())+e.flush())
async def one(sem,out,text,rate,voice):
    if os.path.exists(out) and os.path.getsize(out)>0: return 0
    async with sem:
        for a in range(4):
            try:
                buf=io.BytesIO()
                async for ch in edge_tts.Communicate(text,voice,rate=rate,proxy=PROXY).stream():
                    if ch["type"]=="audio": buf.write(ch["data"])
                data=reencode(buf.getvalue())
                os.makedirs(os.path.dirname(out),exist_ok=True)
                open(out,"wb").write(data); return 1
            except Exception as e:
                err=e; await asyncio.sleep(1+a*2)
        print("FAIL",out,text[:40],repr(err)[:120],file=sys.stderr); return 0
async def main(jobs,voice,conc):
    sem=asyncio.Semaphore(conc); n=0
    tasks=[one(sem,o,t,r,voice) for o,t,r in jobs]
    for i,f in enumerate(asyncio.as_completed(tasks)):
        n+=await f
        if i%200==0: print(i,"/",len(tasks),flush=True)
    print("made",n)
jobs=json.load(open(sys.argv[1]))
asyncio.run(main(jobs,sys.argv[2] if len(sys.argv)>2 else "en-GB-SoniaNeural",int(sys.argv[3]) if len(sys.argv)>3 else 8))
# Usage (from the repo root):
#   node tools/tts_jobs.js . <child's book JSON> jobs.json     (lists words, example sentences and reading passages)
#   python3 tools/tts_gen.py jobs.json                          (needs: pip install edge-tts miniaudio lameenc)
#   python3 tools/tts_index.py                                  (writes audio/index.js)
