#!/usr/bin/env python3
"""Downloads British pronunciations for a fixed list of words and stores them as MP3 in audio/w/,
plus audio/index.js listing them. The site plays these first, so these words never depend on an
outside service. Youdao (British, human voice) is the source; it sends some words as WAV labelled
as MP3, which iPad Safari will not play, so those are re-encoded to real MP3 here. Google's British
voice is used when Youdao has no recording.
Run from the repo root: python3 tools/build_audio.py   (needs: pip install mutagen lameenc)"""
import io, json, os, re, sys, time, urllib.parse, urllib.request, wave
import concurrent.futures as cf
from mutagen.mp3 import MP3
import lameenc

OUT = "audio/w"
UA = {"User-Agent": "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)"}

# English National Curriculum common exception words, Years 1-2
Y12 = """the a do to today of said says are were was is his has you your they be he me she we no go so by my here there where love come
some one once ask friend school put push pull full house our door floor poor because find kind mind behind child children wild climb most
only both old cold gold hold told every everybody even great break steak pretty beautiful after fast last past father class grass pass plant
path bath hour move prove improve sure sugar eye could should would who whole any many clothes busy people water again half money parents Christmas"""
# English National Curriculum statutory spelling words, Years 3-4 and 5-6 (with the listed forms)
Y34 = """accident accidentally actual actually address answer appear arrive believe bicycle breath breathe build busy business calendar caught
centre century certain circle complete consider continue decide describe different difficult disappear early earth eight eighth enough exercise
experience experiment extreme famous favourite February forward forwards fruit grammar group guard guide heard heart height history imagine
increase important interest island knowledge learn length library material medicine mention minute natural naughty notice occasion occasionally
often opposite ordinary particular peculiar perhaps popular position possess possession possible potatoes pressure probably promise purpose
quarter question recent regular reign remember sentence separate special straight strange strength suppose surprise therefore though although
thought through various weight woman women"""
Y56 = """accommodate accompany according achieve aggressive amateur ancient apparent appreciate attached available average awkward bargain bruise
category cemetery committee communicate community competition conscience conscious controversy convenience correspond criticise curiosity
definite desperate determined develop dictionary disastrous embarrass environment equip equipped equipment especially exaggerate excellent
existence explanation familiar foreign forty frequently government guarantee harass hindrance identity immediate immediately individual interfere
interrupt language leisure lightning marvellous mischievous muscle necessary neighbour nuisance occupy occur opportunity parliament persuade
physical prejudice privilege profession programme pronunciation queue recognise recommend relevant restaurant rhyme rhythm sacrifice secretary
shoulder signature sincere sincerely soldier stomach sufficient suggest symbol system temperature thorough twelfth variety vegetable vehicle yacht"""

def slug(w): return re.sub(r"[^a-z0-9]+", "-", w.lower()).strip("-")
def get(url):
    for attempt in range(3):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20)
            return r.read()
        except Exception:
            time.sleep(1 + attempt)
    return None
def duration(mp3):
    try: return MP3(io.BytesIO(mp3)).info.length
    except Exception: return None
def wav_to_mp3(data):
    w = wave.open(io.BytesIO(data))
    if w.getsampwidth() != 2: return None
    enc = lameenc.Encoder()
    enc.set_bit_rate(64); enc.set_in_sample_rate(w.getframerate()); enc.set_channels(w.getnchannels()); enc.set_quality(2)
    return enc.encode(w.readframes(w.getnframes())) + enc.flush()
def fetch(word):
    q = urllib.parse.quote(word)
    data = get("https://dict.youdao.com/dictvoice?type=1&audio=" + q)
    src = "youdao"
    if data and data[:4] == b"RIFF": data, src = wav_to_mp3(data), "youdao (wav→mp3)"
    if not data or data[:1] == b"{" or not (duration(data) or 0) > 0.25:
        data, src = get("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=" + q), "google"
    d = duration(data) if data else None
    if not d or d < 0.25 or d > 4: return word, None, src, d
    return word, data, src, d

def main(words):
    os.makedirs(OUT, exist_ok=True)
    words = sorted({w.strip() for w in words if w.strip()}, key=str.lower)
    todo = [w for w in words if not os.path.exists(f"{OUT}/{slug(w)}.mp3")]
    print(len(words), "words,", len(todo), "to download")
    stats, failed = {}, []
    with cf.ThreadPoolExecutor(6) as ex:
        for word, data, src, d in ex.map(fetch, todo):
            if data is None: failed.append(word); continue
            open(f"{OUT}/{slug(word)}.mp3", "wb").write(data)
            stats[src] = stats.get(src, 0) + 1
    have = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith(".mp3"))
    with open("audio/index.js", "w") as f:
        f.write("/* Words with a stored British recording in audio/w/ (built by tools/build_audio.py). */\n")
        f.write("const WORD_AUDIO=new Set(" + json.dumps(have) + ");\n")
    print("saved:", stats, "failed:", failed, "total stored:", len(have))

if __name__ == "__main__":
    extra = []
    for path in sys.argv[1:]:  # optional word files (one word per line, or a words7.js file)
        text = open(path).read()
        extra += [w for w in re.findall(r'\["([^"]+)",', text) if " " not in w] if path.endswith(".js") else text.split()  # skip week titles
    main((Y12 + " " + Y34 + " " + Y56).split() + extra)
