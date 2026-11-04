#!/usr/bin/env python3
"""Builds maths-steps.js: the worked, step-by-step solution for every question in the maths banks.
Each builder (tools/build_*.py) writes its steps when run with STEPS_OUT set (it does not touch its bank
file then). The steps are matched to the questions already in the bank files by question text and figure,
so question ids and saved progress never change. Questions without written steps get theirs in the browser,
from the explanation sentence by sentence. Run from the repo root: python3 tools/build_steps.py"""
import json, os, re, subprocess, sys, tempfile

BUILDERS = [  # (builder, bank file, array name)
    ("tools/build_maths.py", "maths-bank.js", "MATHS"),
    ("tools/build_review.py", "maths-review.js", "REVIEW"),
    ("tools/build_roman.py", "maths-roman.js", "ROMAN_QUICK"),
    ("tools/build_rounding.py", "maths-rounding.js", "ROUNDING_MIX"),
]
steps, total, matched = {}, 0, 0
for builder, bank, name in BUILDERS:
    if not (os.path.exists(builder) and os.path.exists(bank)): continue
    if "STEPS_OUT" not in open(builder).read(): continue  # no written steps: the explanation is split into steps in the browser
    tmp = tempfile.mktemp(suffix=".json")
    subprocess.run([sys.executable, builder], check=True, env={**os.environ, "STEPS_OUT": tmp}, stdout=subprocess.DEVNULL)
    have = json.load(open(tmp)); os.remove(tmp)
    src = open(bank).read()
    qs = json.loads(re.search(r"const " + name + r"=(\[.*?\]);\n", src, re.S).group(1))
    n = 0
    for q in qs:
        k = q["q"] + json.dumps(q.get("f"), sort_keys=True)
        if k in have: steps[q["id"]] = have[k]; n += 1
    total += len(qs); matched += n
    print(f"{bank}: {n} of {len(qs)} questions have written steps")
out = "/* Worked step-by-step solutions for the maths questions, by question id. Built by tools/build_steps.py. */\n"
out += "const MSTEPS=" + json.dumps(steps, ensure_ascii=False, separators=(",", ":")) + ";\n"
open("maths-steps.js", "w").write(out)
print(f"maths-steps.js: {matched} of {total} questions, {round(len(out)/1024)} KB")
