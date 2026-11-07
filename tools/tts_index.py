#!/usr/bin/env python3
"""Writes audio/index.js from the files in audio/ (run from the repo root after tools/tts_gen.py)."""
import os, json
w=sorted(f[:-4] for f in os.listdir("audio/w") if f.endswith(".mp3")) if os.path.isdir("audio/w") else []
s=sorted(f[:-4] for f in os.listdir("audio/s") if f.endswith(".mp3")) if os.path.isdir("audio/s") else []
open("audio/index.js","w").write("/* Stored British recordings (Microsoft neural voice en-GB-SoniaNeural), made by tools/tts_jobs.js + tools/tts_gen.py.\n"
  "   audio/w/<word>.mp3 normal, audio/ws/<word>.mp3 slow, audio/l/<letter>.mp3 letter names, audio/s/<hash>.mp3 sentences. */\n"
  "const LETTER_AUDIO=true;\nconst WORD_AUDIO=new Set("+json.dumps(w)+");\nconst SENT_AUDIO=new Set("+json.dumps(s)+");\n")
print(len(w),"words",len(s),"sentences")
