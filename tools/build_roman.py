#!/usr/bin/env python3
"""Builds maths-roman.js: quick multiple-choice Roman numeral questions (letter values, reading,
writing, adding, subtracting and comparing). They join the "Roman numerals" topic in the browser with
ids q001… so the main bank keeps its ids. Run from the repo root: python3 tools/build_roman.py"""
import json, random

R = random.Random(20261006)
T = "Roman numerals"
BANK, SEEN = [], set()
QUOTA = 150

RN = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
LETTERS = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
def roman(n):
    s = ""
    for v, r in RN:
        while n >= v: s += r; n -= v
    return s
def parts(n):
    """How a number is built: 49 -> 'XL (40) + IX (9)'"""
    out = []
    for v, r in RN:
        while n >= v: out.append(f"{r} ({v})"); n -= v
    return " + ".join(out)
def value(s):  # independent reader, used to check every answer
    t = 0
    for i, ch in enumerate(s):
        v = LETTERS[ch]
        t += -v if i + 1 < len(s) and LETTERS[s[i + 1]] > v else v
    return t
def misread(s):  # a common slip: adding every letter, ignoring the "smaller before bigger" rule
    return sum(LETTERS[c] for c in s)

def mc(obj, q, correct, wrong, why):
    wrong = [w for w in dict.fromkeys(wrong) if w != correct and w not in ("", "0")][:3]
    key = q + "|" + "|".join(sorted([correct] + wrong))
    if len(wrong) < 3 or key in SEEN or (q in SEEN and not q.startswith("Which of these")): return False
    SEEN.add(key); SEEN.add(q)
    opts = [correct] + wrong; R.shuffle(opts)
    BANK.append({"t": T, "o": obj, "q": q, "k": "c", "a": opts.index(correct), "w": why, "c": opts})
    return True

def near(n, lo=1, hi=1000):
    c = [n + d for d in (1, -1, 2, -2, 4, -4, 5, -5, 9, -9, 10, -10, 11, -11, 50, -50, 100, -100)]
    R.shuffle(c)
    return [x for x in c if lo <= x <= hi]
def num_wrong(n, s):
    w = [misread(s)] if misread(s) != n else []
    return [str(x) for x in w + near(n)]
def rom_wrong(n):
    w = [roman(x) for x in near(n)]
    s = roman(n)  # classic mistakes: IL for 49, IC for 99, VX, XXXX, IIII
    for bad, good in (("IL", "XLIX"), ("IC", "XCIX"), ("XD", "CDXC"), ("VL", "XLV"), ("IIII", "IV"), ("XXXX", "XL"), ("CCCC", "CD")):
        if good in s: w.insert(0, s.replace(good, bad))
    if "IV" in s: w.insert(0, s.replace("IV", "IIII"))
    if "XL" in s: w.insert(0, s.replace("XL", "XXXX"))
    if "IX" in s: w.insert(0, s.replace("IX", "VIIII"))
    return w

def letter_value():
    ch = R.choice(list(LETTERS)); v = LETTERS[ch]
    others = [str(x) for x in R.sample([x for x in LETTERS.values() if x != v], 3)]
    mc("Know what each Roman letter stands for", f"What number does the Roman numeral {ch} stand for?", str(v), others,
       "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1,000." + f" So {ch} = {v}.")
def letter_for():
    ch = R.choice(list(LETTERS)); v = LETTERS[ch]
    mc("Know what each Roman letter stands for", f"Which Roman numeral stands for {v:,}?", ch, R.sample([c for c in LETTERS if c != ch], 3),
       "I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1,000." + f" So {v:,} is {ch}.")
def read():
    n = R.choice([R.randint(1, 50), R.randint(1, 100), R.randint(40, 500), R.randint(100, 1000)]); s = roman(n)
    mc("Read Roman numerals", f"What number is {s}?", f"{n:,}", [f"{int(x):,}" for x in num_wrong(n, s)],
       f"{s} = {parts(n)} = {n:,}. A smaller letter before a bigger one means take it away: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.")
def write():
    n = R.choice([R.randint(1, 50), R.randint(1, 100), R.randint(40, 500), R.randint(100, 1000)]); s = roman(n)
    mc("Write Roman numerals", f"Which is {n:,} in Roman numerals?", s, rom_wrong(n),
       f"Split {n:,} into place values and write each part: {parts(n)} → {s}. Never use the same letter more than three times in a row, and only take away I (from V or X), X (from L or C) and C (from D or M).")
def arith(op):
    big = R.random() < 0.3
    a = R.randint(2, 400 if big else 60); b = R.randint(1, 300 if big else 40)
    if op == "−" and b >= a: a, b = b + 1, a
    r = a + b if op == "+" else a - b
    if r > 1000 or r < 1: return
    sa, sb = roman(a), roman(b)
    in_roman = R.random() < 0.5
    q = f"{sa} {op} {sb} = ?" + (" Give the answer in Roman numerals." if in_roman else "")
    correct = roman(r) if in_roman else f"{r:,}"
    wrong = [roman(x) for x in near(r)] if in_roman else [f"{x:,}" for x in near(r)]
    if op == "+": wrong.insert(0, roman(abs(a - b)) if in_roman else f"{abs(a - b):,}")
    else: wrong.insert(0, roman(a + b) if in_roman and a + b <= 1000 else f"{a + b:,}")
    mc("Add and subtract with Roman numerals", q, correct, wrong,
       f"Change to numbers first: {sa} = {a} and {sb} = {b}. {a} {op} {b} = {r}" + (f", which is {roman(r)}." if in_roman else "."))
def add_q(): arith("+")
def sub_q(): arith("−")
def biggest():
    ns = R.sample(range(4, 400), 4)
    big = max(ns)
    mc("Compare Roman numerals", "Which of these is the biggest number?", roman(big), [roman(x) for x in ns if x != big],
       "In numbers: " + ", ".join(f"{roman(x)} = {x}" for x in sorted(ns)) + f". The biggest is {roman(big)}.")
def double():
    n = R.randint(2, 250); s = roman(n)
    mc("Add and subtract with Roman numerals", f"What is double {s}? Give the answer in Roman numerals.", roman(2 * n), [roman(x) for x in near(2 * n)] + [roman(n + 1)],
       f"{s} = {n}. Double {n} is {2*n}, which is {roman(2*n)}.")

QUOTAS = [(letter_value, 7), (letter_for, 7), (read, 30), (write, 30), (add_q, 30), (sub_q, 30), (biggest, 8), (double, 8)]
assert sum(n for _, n in QUOTAS) == QUOTA
for fn, n in QUOTAS:
    start, tries = len(BANK), 0
    while len(BANK) - start < n:
        tries += 1
        if tries > 100000: raise SystemExit(f"only {len(BANK) - start} for {fn.__name__}")
        fn()

# ---------- check every answer independently ----------
import re
for i, q in enumerate(BANK):
    q["id"] = f"q{i+1:03d}"
    c = q["c"]; ans = c[q["a"]]
    assert len(set(c)) == 4, q
    m = re.match(r"^([IVXLCDM]+) ([+−]) ([IVXLCDM]+) = \?", q["q"])
    if m:
        a, b = value(m.group(1)), value(m.group(3)); r = a + b if m.group(2) == "+" else a - b
        assert (value(ans) if "Roman" in q["q"] else int(ans.replace(",", ""))) == r, q
        assert all(value(x) != r if "Roman" in q["q"] else int(x.replace(",", "")) != r for x in c if x != ans), q
    elif q["q"].startswith("What number is "):
        assert int(ans.replace(",", "")) == value(q["q"][15:-1])
    elif q["q"].startswith("Which is "):
        n = int(q["q"][9:].split(" in")[0].replace(",", "")); assert ans == roman(n) and value(ans) == n
    for x in c:  # every Roman option is spelled the standard way or is a deliberate slip
        assert re.fullmatch(r"[IVXLCDM]+|[\d,]+", x), x

out = "/* Quick Roman numeral multiple-choice questions. Built by tools/build_roman.py. */\n"
out += "const ROMAN_QUICK=" + json.dumps(BANK, ensure_ascii=False, separators=(",", ":")) + ";\n"
out += "MATHS.push(...ROMAN_QUICK);\n"
open("maths-roman.js", "w").write(out)
from collections import Counter
print(len(BANK), "questions;", Counter(q["o"] for q in BANK))
