#!/usr/bin/env python3
"""Builds maths-rounding.js: 150 mixed rounding questions for Year 5 (nearest 10, 100, 1,000,
10,000 and 100,000, and decimals), in many question styles, none of them "smallest / largest".
They join the "Rounding" topic in the browser with ids x001… so the main bank keeps its ids.
Run from the repo root: python3 tools/build_rounding.py"""
import json, random
from decimal import Decimal, ROUND_HALF_UP

R = random.Random(20261007)
T = "Rounding"
BANK, SEEN = [], set()
NAMES = ["Amelia", "Noah", "Isla", "Leo", "Ava", "Oliver", "Freya", "Jack", "Ruby", "Harry", "Maya", "Zac"]
PL = [10, 100, 1000, 10000, 100000]
COLS = {10: ("tens", "ones"), 100: ("hundreds", "tens"), 1000: ("thousands", "hundreds"), 10000: ("ten thousands", "thousands"), 100000: ("hundred thousands", "ten thousands")}

def fmt(n): return f"{n:,}"
def rnd(n, p): return (n + p // 2) // p * p
def digit_after(n, p): return n // (p // 10) % 10
def why_round(n, p):
    d = digit_after(n, p); r = rnd(n, p)
    return f"To round to the nearest {fmt(p)}, look at the {COLS[p][1]} digit: {d}. {'5 or more, so round up' if d >= 5 else 'Less than 5, so round down'}. {fmt(n)} → {fmt(r)}."
def add(obj, q, kind, ans, why, opts=None):
    if q in SEEN: return False
    SEEN.add(q)
    d = {"t": T, "o": obj, "q": q, "k": kind, "a": ans, "w": why}
    if opts is not None: d["c"] = opts
    BANK.append(d); return True
def mc(obj, q, correct, wrong, why):
    wrong = [w for w in dict.fromkeys(wrong) if w != correct][:3]
    if len(wrong) < 3: return False
    opts = [correct] + wrong; R.shuffle(opts)
    return add(obj, q, "c", opts.index(correct), why, opts)
def number(p):  # a number where rounding to p actually changes it
    hi = {10: 99999, 100: 999999, 1000: 999999, 10000: 999999, 100000: 999999}[p]
    while True:
        n = R.randint(p + 1, hi)
        if n % p: return n

def r_choice():
    """Pick the rounded number: wrong choices are the usual slips."""
    p = R.choice([10, 100, 1000, 1000, 10000]); n = number(p); r = rnd(n, p)
    down, up = n // p * p, n // p * p + p
    wrong = [fmt(down if r == up else up), fmt(rnd(n, p // 10)) if p > 10 else fmt(n - n % 5), fmt(rnd(n, p * 10)), fmt(n // p)]
    mc("Round to the nearest 10, 100, 1,000 and 10,000", f"What is {fmt(n)} rounded to the nearest {fmt(p)}?", fmt(r), wrong, why_round(n, p))
def r_three():
    """One number rounded three ways."""
    n = R.randint(1001, 99999)
    if n % 10 == 0: return
    a, b, c = rnd(n, 10), rnd(n, 100), rnd(n, 1000)
    if len({a, b, c}) < 3: return
    right = f"{fmt(a)}, {fmt(b)}, {fmt(c)}"
    wrong = [f"{fmt(n // 10 * 10)}, {fmt(n // 100 * 100)}, {fmt(n // 1000 * 1000)}", f"{fmt(a)}, {fmt(rnd(a, 100))}, {fmt(rnd(rnd(a, 100), 1000))}",
             f"{fmt(n // 10 * 10 + 10)}, {fmt(n // 100 * 100 + 100)}, {fmt(n // 1000 * 1000 + 1000)}", f"{fmt(b)}, {fmt(a)}, {fmt(c)}"]
    mc("Round to the nearest 10, 100, 1,000 and 10,000", f"Round {fmt(n)} to the nearest 10, the nearest 100 and the nearest 1,000. Which answers are right?", right, wrong,
       f"Always round the original number {fmt(n)}. Nearest 10: look at the ones digit ({n % 10}) → {fmt(a)}. Nearest 100: look at the tens digit ({n // 10 % 10}) → {fmt(b)}. Nearest 1,000: look at the hundreds digit ({n // 100 % 10}) → {fmt(c)}.")
def r_which():
    """Which number rounds to …?"""
    p = R.choice([10, 100, 1000]); t = R.randint(2, 900) * p
    good = t - p // 2 + R.randint(0, p - 1)
    if good == t: return
    bad = [t + p // 2 + R.randint(0, p // 2 - 1), t - p // 2 - R.randint(1, p // 2), t + p + R.randint(1, p // 2 - 1), t - p - R.randint(1, p // 2)]
    bad = [b for b in bad if rnd(b, p) != t and b > 0]
    mc("Reason about rounding", f"Which number rounds to {fmt(t)} when rounded to the nearest {fmt(p)}?", fmt(good), [fmt(b) for b in bad],
       f"Numbers from {fmt(t - p // 2)} up to {fmt(t + p // 2 - 1)} round to {fmt(t)}. {fmt(good)} is in that range. " + why_round(good, p))
def r_not():
    """Which does NOT round to …?"""
    p = R.choice([10, 100, 1000]); t = R.randint(2, 900) * p
    goods = list({t - p // 2 + R.randint(0, p - 1) for _ in range(6)} - {t})[:3]
    bad = R.choice([t + p // 2 + R.randint(0, p // 3), t - p // 2 - R.randint(1, p // 3)])
    if len(goods) < 3 or rnd(bad, p) == t: return
    mc("Reason about rounding", f"Which of these does NOT round to {fmt(t)} to the nearest {fmt(p)}?", fmt(bad), [fmt(g) for g in goods],
       why_round(bad, p) + f" The others are all between {fmt(t - p // 2)} and {fmt(t + p // 2 - 1)}, so they round to {fmt(t)}.")
def r_check():
    """Is this child right? Covers the classic slips."""
    p = R.choice([10, 100, 1000]); n = number(p); r = rnd(n, p); who = R.choice(NAMES)
    slip = R.choice(["right", "right", "down", "chain", "wrong place"])
    said = {"right": r, "down": n // p * p if r != n // p * p else n // p * p + p, "chain": rnd(rnd(n, p // 10), p) if p > 10 else r,
            "wrong place": rnd(n, p * 10)}[slip]
    ok = said == r
    add("Reason about rounding", f"{who} says {fmt(n)} rounded to the nearest {fmt(p)} is {fmt(said)}. Is {who} right?", "c", 0 if ok else 1,
        ("Yes. " if ok else f"No, it is {fmt(r)}. ") + why_round(n, p) + ("" if ok or slip != "chain" else " Don't round in steps (first to the 10, then to the 100): always round the original number."),
        ["Yes", "No"])
def r_place():
    """Which place was it rounded to?"""
    n = R.randint(1001, 999999); opts = []
    for p in (10, 100, 1000, 10000):
        if rnd(n, p) not in [rnd(n, q) for q in (10, 100, 1000, 10000) if q != p]: opts.append(p)
    if not opts: return
    p = R.choice(opts); r = rnd(n, p)
    add("Reason about rounding", f"{fmt(n)} was rounded to {fmt(r)}. What was it rounded to?", "c", [10, 100, 1000, 10000].index(p),
        f"Nearest 10 gives {fmt(rnd(n, 10))}, nearest 100 gives {fmt(rnd(n, 100))}, nearest 1,000 gives {fmt(rnd(n, 1000))}, nearest 10,000 gives {fmt(rnd(n, 10000))}. So {fmt(r)} is to the nearest {fmt(p)}.",
        ["the nearest 10", "the nearest 100", "the nearest 1,000", "the nearest 10,000"])
def r_story():
    """Real-life rounding, typed answer."""
    p = R.choice([10, 100, 1000, 10000])
    ctx = R.choice([("A football stadium holds {n} people", "people"), ("A town has {n} people living in it", "people"), ("A plane flew {n} km this year", "km"),
                    ("A school library has {n} books", "books"), ("The Thames is about {n} metres long", "m"), ("A shop sold {n} apples this year", "apples")])
    n = number(p)
    if n < 5 * p: return
    add("Round to the nearest 10, 100, 1,000 and 10,000", ctx[0].format(n=fmt(n)) + f". Round this to the nearest {fmt(p)}.", "n", rnd(n, p), why_round(n, p))
def r_type():
    p = R.choice([10, 100, 1000, 10000, 100000]); n = number(p)
    if R.random() < 0.4: n = n // (p * 10) * (p * 10) + 9 * p + R.randint(p // 2, p - 1)  # rounds up across a 9
    if n % p == 0 or n > 999999: return
    add("Round to the nearest 10, 100, 1,000 and 10,000", f"Round {fmt(n)} to the nearest {fmt(p)}.", "n", rnd(n, p),
        why_round(n, p) + (" The 9 becomes 10, so carry 1 into the next column." if digit_after(n, p) >= 5 and (n // p) % 10 == 9 else ""))
def r_decimal():
    whole = R.randint(1, 99); x = Decimal(f"{whole}.{R.randint(1, 99):02d}")
    if x * 10 % 10 == 0 or str(x).endswith("0"): return
    to = R.choice(["whole", "1dp"])
    if to == "whole":
        r = int(x.quantize(Decimal(1), rounding=ROUND_HALF_UP)); tenth = int(x * 10) % 10
        wrong = [str(int(x)) if r != int(x) else str(int(x) + 1), str(x.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)), str(r + 10)]
        mc("Round decimals", f"What is {x} rounded to the nearest whole number?", str(r), wrong,
           f"Look at the tenths digit: {tenth}. {'5 or more, so round up' if tenth >= 5 else 'Less than 5, so round down'}: {x} → {r}.")
    else:
        r = x.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP); h = int(x * 100) % 10
        if r == x: return
        wrong = [str((x * 10).to_integral_value(rounding="ROUND_FLOOR") / 10) if r != (x * 10).to_integral_value(rounding="ROUND_FLOOR") / 10 else str(r + Decimal("0.1")), str(int(x.quantize(Decimal(1), rounding=ROUND_HALF_UP))), str(r + 1)]
        mc("Round decimals", f"What is {x} rounded to one decimal place?", str(r), wrong,
           f"Look at the hundredths digit: {h}. {'5 or more, so round up' if h >= 5 else 'Less than 5, so round down'}: {x} → {r}.")

QUOTAS = [(r_choice, 25), (r_three, 15), (r_which, 15), (r_not, 15), (r_check, 20), (r_place, 15), (r_story, 15), (r_type, 15), (r_decimal, 15)]
QUOTA = sum(n for _, n in QUOTAS)
for fn, n in QUOTAS:
    start, tries = len(BANK), 0
    while len(BANK) - start < n:
        tries += 1
        if tries > 100000: raise SystemExit(f"only {len(BANK) - start} for {fn.__name__}")
        fn()

# ---------- checks ----------
import re
def three_ok(q):
    n = int(re.match(r"Round ([\d,]+)", q["q"]).group(1).replace(",", ""))
    return q["c"][q["a"]] == f"{fmt(rnd(n, 10))}, {fmt(rnd(n, 100))}, {fmt(rnd(n, 1000))}"
for i, q in enumerate(BANK):
    q["id"] = f"x{i+1:03d}"
    assert "smallest" not in q["q"] and "largest" not in q["q"]
    if "Which answers" in q["q"]: assert three_ok(q), q
    if q["q"].startswith(tuple(NAMES)):
        n, p, said = [int(x.replace(",", "")) for x in re.match(r"\w+ says ([\d,]+) rounded to the nearest ([\d,]+) is ([\d,]+)", q["q"]).groups()]
        assert q["a"] == (0 if rnd(n, p) == said else 1), q
    if q["k"] == "c": assert 0 <= q["a"] < len(q["c"]) and len(set(q["c"])) == len(q["c"]), q
    m = re.match(r"(?:What is |Round )([\d,]+) (?:rounded )?to the nearest ([\d,]+)", q["q"])
    if m and "Which answers" not in q["q"]:
        n, p = int(m.group(1).replace(",", "")), int(m.group(2).replace(",", ""))
        got = q["c"][q["a"]] if q["k"] == "c" else fmt(q["a"])
        assert got == fmt(rnd(n, p)), q
out = "/* Mixed rounding questions (Year 5). Built by tools/build_rounding.py. */\n"
out += "const ROUNDING_MIX=" + json.dumps(BANK, ensure_ascii=False, separators=(",", ":")) + ";\n"
out += "MATHS.push(...ROUNDING_MIX);\n"
open("maths-rounding.js", "w").write(out)
from collections import Counter
print(len(BANK), "questions", Counter(q["o"] for q in BANK), Counter(q["k"] for q in BANK))
