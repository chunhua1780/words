#!/usr/bin/env python3
"""Builds maths-bank.js: 2,000 Year 5 maths questions following the National Curriculum in England (Year 5 programme of study).
Every answer is computed here, never typed by hand. Run: python3 tools/build_maths.py"""
import json, math, random
from fractions import Fraction

R = random.Random(20261001)
BANK, SEEN = [], set()

def fmt(n):
    """UK number format: 12,345 and up to 3 decimal places, no trailing zeros."""
    if isinstance(n, Fraction): n = float(n)
    if isinstance(n, float) and n.is_integer(): n = int(n)
    if isinstance(n, int): return f"{n:,}"
    s = f"{n:,.3f}".rstrip("0").rstrip(".")
    return s
def money(p):  # pence -> £x.yy
    return f"£{p//100:,}.{p%100:02d}"
def frac(f):
    f = Fraction(f)
    if f.denominator == 1: return str(f.numerator)
    return f"{f.numerator}/{f.denominator}"
def mixed(f):
    f = Fraction(f); w, r = divmod(f.numerator, f.denominator)
    if r == 0: return str(w)
    return f"{w} {r}/{f.denominator}" if w else f"{r}/{f.denominator}"
def choice(correct, wrong):
    opts = [correct] + [w for w in dict.fromkeys(wrong) if w != correct][:3]
    R.shuffle(opts)
    return opts, opts.index(correct)

def add(topic, obj, q, kind, ans, why, opts=None, fig=None, unit=None):
    key = q + json.dumps(fig, sort_keys=True)
    if key in SEEN: return False
    SEEN.add(key)
    d = {"t": topic, "o": obj, "q": q, "k": kind, "a": ans, "w": why}
    if opts is not None: d["c"] = opts
    if fig: d["f"] = fig
    if unit: d["u"] = unit
    BANK.append(d)
    return True

def mc(topic, obj, q, correct, wrong, why, fig=None):
    opts, i = choice(correct, wrong)
    if len(opts) < 3: return False
    return add(topic, obj, q, "c", i, why, opts=opts, fig=fig)

NAMES = ["Amelia", "Oliver", "Isla", "Noah", "Ava", "Leo", "Freya", "Arthur", "Poppy", "Harry", "Grace", "Jack", "Ruby", "George", "Evie", "Theo", "Lily", "Alfie", "Maya", "Finn", "Zara", "Ethan", "Priya", "Sam"]
nm = lambda: R.choice(NAMES)
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def words(n):
    if n < 20: return ONES[n]
    if n < 100: return TENS[n//10] + ("-" + ONES[n%10] if n % 10 else "")
    if n < 1000: return ONES[n//100] + " hundred" + (" and " + words(n%100) if n % 100 else "")
    if n < 1000000:
        t, r = divmod(n, 1000)
        tail = "" if r == 0 else (" and " + words(r) if r < 100 else " " + words(r))
        return words(t) + " thousand" + tail
    return "one million"

# =============================== Number and place value ===============================
PLACES = [(1, "ones"), (10, "tens"), (100, "hundreds"), (1000, "thousands"), (10000, "ten thousands"), (100000, "hundred thousands")]
def pv_value():
    n = R.randint(100000, 999999); s = str(n); i = R.randrange(6); dig = int(s[i]); val = dig * 10 ** (5 - i)
    if dig == 0: return
    add("Place value", "Know the value of each digit in numbers up to 1,000,000",
        f"What is the value of the digit {dig} in {fmt(n)}?", "n", val,
        f"The {dig} is in the {PLACES[5-i][1]} column, so it is worth {fmt(dig)} × {fmt(10**(5-i))} = {fmt(val)}.")
def pv_words():
    n = R.choice([R.randint(10000, 99999), R.randint(100000, 999999)])
    add("Place value", "Read and write numbers to 1,000,000",
        f"Write this number in digits: {words(n)}.", "n", n, f"{words(n).capitalize()} is written {fmt(n)}.")
def pv_partition():
    n = R.randint(100000, 999999); parts = [int(d) * 10 ** (5 - i) for i, d in enumerate(str(n)) if d != "0"]
    miss = R.randrange(len(parts)); shown = [fmt(p) if j != miss else "?" for j, p in enumerate(parts)]
    add("Place value", "Partition numbers to 1,000,000",
        f"{fmt(n)} = {' + '.join(shown)}. What is the missing number?", "n", parts[miss],
        f"Split {fmt(n)} by place value: {' + '.join(fmt(p) for p in parts)}.")
def pv_powers():
    step = R.choice([10, 100, 1000, 10000, 100000]); start = R.randint(1, 9) * step + R.randint(0, 99) * (step // 10 if step >= 100 else 0)
    k = R.randint(2, 5); up = R.random() < .5
    end = start + k * step if up else start - k * step
    if end < 0 or end > 1000000: return
    add("Place value", "Count forwards or backwards in powers of 10 for any number up to 1,000,000",
        f"Start at {fmt(start)}. Count {'forwards' if up else 'backwards'} {k} steps of {fmt(step)}. What number do you reach?", "n", end,
        f"{fmt(start)} {'+' if up else '−'} {k} × {fmt(step)} = {fmt(start)} {'+' if up else '−'} {fmt(k*step)} = {fmt(end)}.")
def pv_compare():
    a = R.randint(100000, 999999); b = a + R.choice([-1, 1]) * R.choice([1, 10, 100, 1000, 10000, 90, 900])
    if not (0 < b < 1000000) or a == b: return
    big = max(a, b)
    add("Place value", "Order and compare numbers to 1,000,000",
        f"Which is greater: {fmt(a)} or {fmt(b)}?", "c", [fmt(a), fmt(b)].index(fmt(big)),
        f"Compare digits from the left. The first different digit decides: {fmt(big)} is greater.", opts=[fmt(a), fmt(b)])
def pv_order():
    base = R.randint(10, 99) * 1000; nums = list({base + R.randint(0, 999) * R.choice([1, 10]) % 99999 for _ in range(4)})
    if len(nums) < 4: return
    nums = nums[:4]; asc = sorted(nums); R.shuffle(nums)
    cor = ", ".join(fmt(x) for x in asc)
    wrong = [", ".join(fmt(x) for x in sorted(nums, reverse=True)), ", ".join(fmt(x) for x in nums), ", ".join(fmt(x) for x in sorted(nums, key=lambda v: str(v)[::-1]))]
    mc("Place value", "Order and compare numbers to 1,000,000", f"Put these numbers in order, smallest first: {', '.join(fmt(x) for x in nums)}", cor, wrong,
       "Look at the highest place value first, then move right to compare.")
def pv_tenmore():
    n = R.randint(1000, 990000); d = R.choice([10, 100, 1000, 10000, 100000]); more = R.random() < .5
    r = n + d if more else n - d
    if r < 0 or r > 1000000: return
    add("Place value", "Find 10, 100, 1,000, 10,000 or 100,000 more or less", f"What is {fmt(d)} {'more' if more else 'less'} than {fmt(n)}?", "n", r,
        f"Change only the {dict(PLACES)[d]} digit: {fmt(n)} {'+' if more else '−'} {fmt(d)} = {fmt(r)}.")

# =============================== Rounding ===============================
def rd_round():
    to = R.choice([10, 100, 1000, 10000, 100000]); n = R.randint(to, 999999)
    if n % to == 0: return
    r = int(Fraction(n, to) + Fraction(1, 2)) * to
    add("Rounding", "Round any number up to 1,000,000 to the nearest 10, 100, 1,000, 10,000 and 100,000",
        f"Round {fmt(n)} to the nearest {fmt(to)}.", "n", r,
        f"Look at the digit to the right of the {dict(PLACES)[to]} column. It is {str(n).zfill(7)[-len(str(to))+1] if to>1 else ''}: {'5 or more, so round up' if r > n else 'less than 5, so round down'}. Answer: {fmt(r)}.")
def rd_estimate():
    a = R.randint(1000, 9999); b = R.randint(1000, 9999); op = R.choice("+-")
    if op == "-" and b > a: a, b = b, a
    ra, rb = round(a, -3), round(b, -3); est = ra + rb if op == "+" else ra - rb
    exact = a + b if op == "+" else a - b
    sym = "+" if op == "+" else "−"
    wrong = [est + 1000, est - 1000 if est >= 1000 else est + 2000, exact]
    mc("Rounding", "Use rounding to check answers and estimate",
       f"Estimate {fmt(a)} {sym} {fmt(b)} by rounding each number to the nearest 1,000.", fmt(est), [fmt(x) for x in wrong],
       f"{fmt(a)} ≈ {fmt(ra)} and {fmt(b)} ≈ {fmt(rb)}, so the estimate is {fmt(ra)} {sym} {fmt(rb)} = {fmt(est)}.")
def rd_range():
    to = R.choice([10, 100, 1000]); r = R.randint(2, 900) * to
    lo, hi = r - to // 2, r + to // 2 - 1
    which = R.choice(["smallest", "largest"])
    add("Rounding", "Round numbers and reason about rounding", f"A whole number rounds to {fmt(r)} when rounded to the nearest {fmt(to)}. What is the {which} it could be?", "n", lo if which == "smallest" else hi,
        f"Numbers from {fmt(lo)} to {fmt(hi)} all round to {fmt(r)}.")
def rd_decimal():
    n = R.randint(100, 99999) / 100; how = R.choice(["whole number", "one decimal place"])
    if how == "whole number":
        r = math.floor(n + .5 + 1e-9)
        if abs(n - round(n)) < 1e-9: return
        add("Rounding", "Round decimals with two decimal places to the nearest whole number and to one decimal place",
            f"Round {fmt(n)} to the nearest whole number.", "n", r, f"Look at the tenths digit. {fmt(n)} rounds to {fmt(r)}.")
    else:
        r = math.floor(n * 10 + .5 + 1e-9) / 10
        if abs(n * 10 - round(n * 10)) < 1e-9: return
        add("Rounding", "Round decimals with two decimal places to the nearest whole number and to one decimal place",
            f"Round {fmt(n)} to one decimal place.", "n", r, f"Look at the hundredths digit. {fmt(n)} rounds to {fmt(r)}.")

# =============================== Negative numbers ===============================
TOWNS = ["Edinburgh", "Cardiff", "Belfast", "York", "Inverness", "Manchester", "Oslo", "Moscow", "Reykjavik", "Toronto"]
def neg_temp():
    t = R.randint(-12, 8); d = R.randint(2, 15); up = R.random() < .5
    r = t + d if up else t - d
    town = R.choice(TOWNS)
    add("Negative numbers", "Interpret negative numbers in context", f"At midnight the temperature in {town} was {t}°C. By morning it had {'risen' if up else 'fallen'} by {d} degrees. What was the temperature in the morning?", "n", r,
        f"{t} {'+' if up else '−'} {d} = {r}. Count on a number line through zero.", unit="°C")
def neg_diff():
    a = R.randint(-15, -1); b = R.randint(1, 15)
    add("Negative numbers", "Interpret negative numbers in context", f"One day the temperature was {a}°C in the morning and {b}°C in the afternoon. How many degrees warmer was it in the afternoon?", "n", b - a,
        f"From {a} up to 0 is {-a} degrees, then up to {b} is {b} more: {-a} + {b} = {b-a}.", unit="°C")
def neg_count():
    s = R.randint(-5, 20); st = R.choice([2, 3, 4, 5, 10]); k = R.randint(4, 7)
    r = s - k * st
    seq = [s - i * st for i in range(4)]
    add("Negative numbers", "Count forwards and backwards with positive and negative whole numbers, including through zero",
        f"Continue the sequence: {', '.join(str(x) for x in seq)}, … What is the {['','','','','4th','5th','6th','7th','8th'][k+1]} number?", "n", r,
        f"The sequence goes down by {st} each time. Number {k+1} is {s} − {k} × {st} = {r}.")
def neg_order():
    nums = R.sample(range(-20, 20), 4); asc = sorted(nums)
    if nums == asc or nums == asc[::-1]: return
    mc("Negative numbers", "Order negative and positive numbers", f"Which list is in order from coldest to warmest? {', '.join(str(n)+'°C' for n in nums)}",
       ", ".join(f"{n}°C" for n in asc), [", ".join(f"{n}°C" for n in sorted(nums, key=abs)), ", ".join(f"{n}°C" for n in sorted(nums, reverse=True)), ", ".join(f"{n}°C" for n in nums)],
       "Negative numbers further from zero are colder. The order is " + ", ".join(f"{n}°C" for n in asc) + ".")

# =============================== Roman numerals ===============================
RN = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
def roman(n):
    s = ""
    for v, r in RN:
        while n >= v: s += r; n -= v
    return s
def rom_to():
    n = R.choice([R.randint(1, 100), R.randint(100, 1000), R.randint(1900, 2030)])
    if n > 1000 and R.random() < .6: n = R.randint(1, 1000)
    add("Roman numerals", "Read Roman numerals to 1,000 (M) and recognise years written in Roman numerals",
        f"What number is {roman(n)}?", "n", n, f"{roman(n)} = " + f"{' + '.join(str(v) for v in split_rn(n))} = {n}.")
def split_rn(n):
    out = []
    for v, r in RN:
        while n >= v: out.append(v); n -= v
    return out
def rom_from():
    n = R.randint(1, 1000)
    add("Roman numerals", "Read and write Roman numerals to 1,000 (M)", f"Write {n} in Roman numerals.", "r", roman(n),
        f"{n} = {' + '.join(str(v) for v in split_rn(n))}, which is {roman(n)}.")
def rom_year():
    y = R.randint(1066, 2030)
    add("Roman numerals", "Recognise years written in Roman numerals", f"A building has the year {roman(y)} carved above its door. What year is that?", "n", y,
        f"{roman(y)} = {' + '.join(str(v) for v in split_rn(y))} = {y}.")

# =============================== Addition and subtraction ===============================
def as_column():
    d = R.choice([4, 5, 5, 6]); a = R.randint(10 ** (d - 1), 10 ** d - 1); b = R.randint(10 ** (d - 2), 10 ** d - 1); op = R.choice("+-")
    if op == "-" and b > a: a, b = b, a
    r = a + b if op == "+" else a - b
    add("Addition and subtraction", "Add and subtract whole numbers with more than 4 digits, including using formal written methods",
        f"Work out {fmt(a)} {'+' if op=='+' else '−'} {fmt(b)}.", "n", r,
        f"Line up the digits in columns and {'add, carrying' if op=='+' else 'subtract, exchanging'} where needed: {fmt(a)} {'+' if op=='+' else '−'} {fmt(b)} = {fmt(r)}.")
def as_mental():
    a = R.randint(100, 9999); b = R.choice([99, 199, 999, 101, 1001, 98, 990, 2000, 4500, 250])
    op = R.choice("+-")
    if op == "-" and b > a: a, b = b, a
    r = a + b if op == "+" else a - b
    near = round(b, -2) if b < 1000 else round(b, -3)
    add("Addition and subtraction", "Add and subtract numbers mentally with increasingly large numbers",
        f"Work out in your head: {fmt(a)} {'+' if op=='+' else '−'} {fmt(b)}", "n", r,
        f"Use a near number: {fmt(b)} is close to {fmt(near)}. {fmt(a)} {'+' if op=='+' else '−'} {fmt(near)}, then adjust by {abs(near-b)}. Answer: {fmt(r)}.")
def as_missing():
    a = R.randint(1000, 99999); b = R.randint(1000, 99999); s = a + b
    if R.random() < .5:
        add("Addition and subtraction", "Use inverse operations to find missing numbers", f"? + {fmt(b)} = {fmt(s)}. What is the missing number?", "n", a, f"Use the inverse: {fmt(s)} − {fmt(b)} = {fmt(a)}.")
    else:
        add("Addition and subtraction", "Use inverse operations to find missing numbers", f"{fmt(s)} − ? = {fmt(b)}. What is the missing number?", "n", a, f"{fmt(s)} − {fmt(b)} = {fmt(a)}.")
STORY_AS = [
    ("A football stadium holds {a} people. On Saturday {b} people came to the match. How many seats were empty?", "-"),
    ("A library had {a} books. It bought {b} new books. How many books does it have now?", "+"),
    ("A school raised £{a} in the summer fair and £{b} in the winter fair. How much did it raise altogether?", "+"),
    ("A plane flew {a} km on Monday and {b} km on Tuesday. How much further did it fly on Monday?", "-"),
    ("A farmer had {a} sheep. He sold {b} at the market. How many sheep are left?", "-"),
    ("A website had {a} visitors in March and {b} in April. How many visitors was that in total?", "+"),
]
def as_story():
    t, op = R.choice(STORY_AS); a = R.randint(12000, 90000); b = R.randint(1000, 11999)
    r = a + b if op == "+" else a - b
    u = "£" if "£" in t else ("km" if " km " in t else None)
    add("Addition and subtraction", "Solve addition and subtraction multi-step problems in contexts", t.format(a=fmt(a), b=fmt(b)), "n", r,
        f"{fmt(a)} {'+' if op=='+' else '−'} {fmt(b)} = {fmt(r)}.", unit=u)
def as_multistep():
    a = R.randint(2000, 9000); b = R.randint(500, 1999); c = R.randint(500, 1999); n = nm()
    r = a - b - c
    if r <= 0: return
    add("Addition and subtraction", "Solve addition and subtraction multi-step problems, deciding which operations to use",
        f"{n} had £{fmt(a)} saved. {n} spent £{fmt(b)} on a bike and £{fmt(c)} on a holiday. How much money is left?", "n", r,
        f"Spent altogether: {fmt(b)} + {fmt(c)} = {fmt(b+c)}. Left: {fmt(a)} − {fmt(b+c)} = {fmt(r)}.", unit="£")
def as_check():
    a = R.randint(1000, 9999); b = R.randint(1000, 9999); s = a + b; wrong = s + R.choice([-100, 100, -10, 10, 1000])
    mc("Addition and subtraction", "Use inverse operations to check answers", f"{n_()} says {fmt(a)} + {fmt(b)} = {fmt(wrong)}. Which calculation shows the mistake?",
       f"{fmt(wrong)} − {fmt(b)} = {fmt(wrong-b)}, not {fmt(a)}", [f"{fmt(a)} − {fmt(b)} = {fmt(a-b)}", f"{fmt(wrong)} + {fmt(b)} = {fmt(wrong+b)}", f"{fmt(a)} × 2 = {fmt(a*2)}"],
       f"Check with the inverse: subtract {fmt(b)} from the answer. You should get back to {fmt(a)}. The correct total is {fmt(s)}.")
n_ = nm

# =============================== Multiples, factors, primes, squares, cubes ===============================
PRIMES = [p for p in range(2, 101) if all(p % d for d in range(2, int(p ** .5) + 1))]
def factors(n): return [d for d in range(1, n + 1) if n % d == 0]
def mf_factors():
    n = R.choice([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 72, 80, 84, 90, 96, 100])
    f = factors(n); k = R.choice(["how many", "largest-not-self"])
    if k == "how many":
        add("Multiples, factors and primes", "Identify all factor pairs of a number", f"How many factors does {n} have?", "n", len(f), f"The factors of {n} are {', '.join(map(str,f))}. That is {len(f)} factors.")
    else:
        add("Multiples, factors and primes", "Identify all factor pairs of a number", f"What is the largest factor of {n} that is smaller than {n}?", "n", f[-2], f"Factors of {n}: {', '.join(map(str,f))}. The largest one below {n} is {f[-2]}.")
def mf_pair():
    n = R.choice([24, 36, 40, 48, 56, 60, 72, 84, 90, 96, 100, 120]); f = factors(n); a = R.choice(f[1:-1])
    add("Multiples, factors and primes", "Identify all factor pairs of a number", f"{a} × ? = {n}. Find the other number in the factor pair.", "n", n // a, f"{n} ÷ {a} = {n//a}, so {a} and {n//a} are a factor pair of {n}.")
def mf_common():
    a, b = R.sample([12, 16, 18, 20, 24, 30, 32, 36, 40, 42, 45, 48, 54, 60, 72, 84, 90], 2); g = math.gcd(a, b)
    if g < 2: return
    add("Multiples, factors and primes", "Identify common factors of two numbers", f"What is the highest common factor of {a} and {b}?", "n", g,
        f"Factors of {a}: {', '.join(map(str,factors(a)))}. Factors of {b}: {', '.join(map(str,factors(b)))}. The highest one in both lists is {g}.")
def mf_multiple():
    a, b = R.sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 2); l = a * b // math.gcd(a, b)
    add("Multiples, factors and primes", "Identify multiples, including common multiples", f"What is the smallest number that is a multiple of both {a} and {b}?", "n", l,
        f"Multiples of {a}: {', '.join(str(a*i) for i in range(1, l//a+1))}. The first one that is also a multiple of {b} is {l}.")
def mf_ismultiple():
    k = R.choice([3, 4, 6, 7, 8, 9, 11, 12, 25]); good = k * R.randint(12, 90); bad = [good + d for d in (1, 2, k // 2 + 1) if (good + d) % k]
    mc("Multiples, factors and primes", "Identify multiples", f"Which of these is a multiple of {k}?", fmt(good), [fmt(x) for x in bad], f"{fmt(good)} ÷ {k} = {fmt(good//k)} exactly, so it is a multiple of {k}.")
def mf_prime():
    p = R.choice([q for q in PRIMES if q > 10]); comp = R.sample([c for c in range(21, 100) if c not in PRIMES and c % 2 and c % 5], 3)
    mc("Multiples, factors and primes", "Establish whether a number up to 100 is prime", "Which of these numbers is prime?", str(p), [str(c) for c in comp],
       f"{p} has only two factors, 1 and {p}. " + "; ".join(f"{c} = {min(d for d in range(2,c) if c%d==0)} × {c//min(d for d in range(2,c) if c%d==0)}" for c in comp) + ".")
def mf_primecount():
    lo = R.choice([1, 10, 20, 30, 40, 50, 60, 70, 80]); hi = lo + R.choice([10, 20])
    ps = [p for p in PRIMES if lo <= p <= hi]
    add("Multiples, factors and primes", "Know and recall prime numbers", f"How many prime numbers are there between {lo} and {hi}?", "n", len(ps),
        f"The primes between {lo} and {hi} are {', '.join(map(str, ps)) or 'none'}.")
def mf_primefactor():
    n = R.choice([12, 18, 20, 28, 30, 42, 44, 45, 50, 52, 63, 66, 70, 75, 78, 98, 99])
    pf = sorted({p for p in PRIMES if n % p == 0})
    add("Multiples, factors and primes", "Know and use the vocabulary of prime numbers and prime factors", f"What is the largest prime factor of {n}?", "n", pf[-1],
        f"The prime factors of {n} are {', '.join(map(str, pf))}. The largest is {pf[-1]}.")
def mf_square():
    k = R.randint(2, 12); t = R.choice(["sq", "cube", "sqroot", "sum"])
    if t == "sq": add("Squares and cubes", "Recognise and use square numbers and the notation ²", f"What is {k}²?", "n", k * k, f"{k}² means {k} × {k} = {k*k}.")
    elif t == "cube":
        k = R.randint(1, 6); add("Squares and cubes", "Recognise and use cube numbers and the notation ³", f"What is {k}³?", "n", k ** 3, f"{k}³ means {k} × {k} × {k} = {k**3}.")
    elif t == "sqroot": add("Squares and cubes", "Recognise square numbers", f"Which number multiplied by itself makes {k*k}?", "n", k, f"{k} × {k} = {k*k}, so {k*k} is a square number.")
    else:
        a, b = R.sample(range(2, 10), 2); add("Squares and cubes", "Use square numbers and the notation ²", f"Work out {a}² + {b}².", "n", a * a + b * b, f"{a}² = {a*a} and {b}² = {b*b}. {a*a} + {b*b} = {a*a+b*b}.")
def mf_whichsquare():
    sq = R.choice([k * k for k in range(4, 13)]); others = R.sample([n for n in range(15, 145) if int(n ** .5) ** 2 != n], 3)
    mc("Squares and cubes", "Recognise and use square numbers", "Which of these is a square number?", str(sq), [str(o) for o in others], f"{sq} = {int(sq**.5)} × {int(sq**.5)}, so it is a square number.")

# =============================== Multiplication and division ===============================
def md_written():
    t = R.choice(["4x1", "3x2", "4x2", "2x2"])
    if t == "4x1": a, b = R.randint(1000, 9999), R.randint(3, 9)
    elif t == "3x2": a, b = R.randint(100, 999), R.randint(12, 99)
    elif t == "4x2": a, b = R.randint(1000, 4999), R.randint(11, 39)
    else: a, b = R.randint(12, 99), R.randint(12, 99)
    add("Multiplication and division", "Multiply numbers up to 4 digits by a one- or two-digit number using a formal written method",
        f"Work out {fmt(a)} × {b}.", "n", a * b,
        (f"{fmt(a)} × {b} = {fmt(a*b)}." if b < 10 else f"{fmt(a)} × {b//10*10} = {fmt(a*(b//10*10))} and {fmt(a)} × {b%10} = {fmt(a*(b%10))}. Add them: {fmt(a*b)}."))
def md_division():
    b = R.randint(3, 9); q = R.randint(120, 1999); r = R.randint(0, b - 1); a = b * q + r
    if a > 9999: return
    if r == 0:
        add("Multiplication and division", "Divide numbers up to 4 digits by a one-digit number using short division", f"Work out {fmt(a)} ÷ {b}.", "n", q,
            f"Use short division: {fmt(a)} ÷ {b} = {fmt(q)}.")
    else:
        add("Multiplication and division", "Divide numbers up to 4 digits by a one-digit number and interpret remainders", f"Work out {fmt(a)} ÷ {b}. What is the remainder?", "n", r,
            f"{b} × {fmt(q)} = {fmt(b*q)}. {fmt(a)} − {fmt(b*q)} = {r}, so {fmt(a)} ÷ {b} = {fmt(q)} remainder {r}.")
def md_remainder_story():
    k = R.choice([4, 5, 6, 7, 8, 9]); n = R.randint(30, 400)
    if n % k == 0: n += 1
    up = R.random() < .5
    if up:
        add("Multiplication and division", "Interpret remainders appropriately for the context", f"{n} pupils are going on a trip. Each minibus holds {k} pupils. How many minibuses are needed?", "n", -(-n // k),
            f"{n} ÷ {k} = {n//k} remainder {n%k}. The {n%k} pupils left over still need a minibus, so round up to {-(-n//k)}.")
    else:
        add("Multiplication and division", "Interpret remainders appropriately for the context", f"Eggs are packed in boxes of {k}. There are {n} eggs. How many full boxes can be filled?", "n", n // k,
            f"{n} ÷ {k} = {n//k} remainder {n%k}. Only {n//k} boxes can be completely filled.")
def md_powers10():
    n = R.choice([R.randint(1, 999), R.randint(10, 9999) / 10, R.randint(10, 9999) / 100]); p = R.choice([10, 100, 1000]); op = R.choice("×÷")
    r = n * p if op == "×" else n / p
    r = round(r, 6)
    if op == "÷" and len(fmt(r).split(".")[-1]) > 3 and "." in fmt(r): return
    add("Multiplication and division", "Multiply and divide whole numbers and those involving decimals by 10, 100 and 1,000",
        f"Work out {fmt(n)} {op} {fmt(p)}.", "n", r,
        f"{'Multiplying' if op=='×' else 'Dividing'} by {fmt(p)} moves every digit {len(str(p))-1} place{'s' if p>10 else ''} to the {'left' if op=='×' else 'right'}: {fmt(r)}.")
def md_mental():
    t = R.choice(["double", "x25", "x50", "x9", "÷5"])
    if t == "double":
        n = R.randint(120, 4999); add("Multiplication and division", "Multiply and divide numbers mentally drawing upon known facts", f"Double {fmt(n)}.", "n", 2 * n, f"{fmt(n)} × 2 = {fmt(2*n)}.")
    elif t == "x25":
        n = R.randint(4, 48) * 2; add("Multiplication and division", "Multiply and divide numbers mentally drawing upon known facts", f"Work out {n} × 25.", "n", n * 25, f"× 25 is the same as × 100 ÷ 4: {n} × 100 = {n*100}, ÷ 4 = {n*25}.")
    elif t == "x50":
        n = R.randint(12, 98); add("Multiplication and division", "Multiply and divide numbers mentally drawing upon known facts", f"Work out {n} × 50.", "n", n * 50, f"× 50 is the same as × 100 ÷ 2: {n*100} ÷ 2 = {n*50}.")
    elif t == "x9":
        n = R.randint(13, 99); add("Multiplication and division", "Multiply and divide numbers mentally drawing upon known facts", f"Work out {n} × 9.", "n", n * 9, f"{n} × 10 = {n*10}, then subtract {n}: {n*9}.")
    else:
        n = R.randint(3, 199) * 10; add("Multiplication and division", "Multiply and divide numbers mentally drawing upon known facts", f"Work out {fmt(n)} ÷ 5.", "n", n // 5, f"÷ 5 is the same as ÷ 10 × 2: {n//10} × 2 = {n//5}.")
STORY_M = [
    ("A box holds {b} pencils. How many pencils are in {a} boxes?", "×"),
    ("A cinema ticket costs £{b}. How much do {a} tickets cost?", "×"),
    ("A machine makes {b} biscuits every minute. How many biscuits does it make in {a} minutes?", "×"),
    ("{a} stickers are shared equally between {b} children. How many stickers does each child get?", "÷"),
    ("A ribbon {a} cm long is cut into {b} equal pieces. How long is each piece?", "÷"),
]
def md_story():
    t, op = R.choice(STORY_M)
    if op == "×": a, b = R.randint(12, 99), R.randint(6, 48); r = a * b
    else: b = R.randint(3, 9); r = R.randint(12, 250); a = b * r
    u = "£" if "£" in t else ("cm" if "ribbon" in t else None)
    add("Multiplication and division", "Solve problems involving multiplication and division, including scaling and rates", t.format(a=fmt(a), b=b), "n", r,
        f"{fmt(a)} {op} {b} = {fmt(r)}." if op == "÷" else f"{a} × {b} = {fmt(r)}.", unit=u)
def md_scale():
    base = R.choice([("A recipe for 4 people uses {x} g of flour.", "g of flour", 4)]); x = R.choice([150, 200, 250, 300, 350, 400]); k = R.choice([2, 3, 5])
    add("Multiplication and division", "Solve problems involving scaling by simple fractions and rates",
        f"A recipe for 4 people uses {x} g of flour. How much flour is needed for {4*k} people?", "n", x * k, f"{4*k} people is {k} times as many, so use {x} × {k} = {x*k} g.", unit="g")
def md_missing():
    a = R.randint(6, 12); b = R.randint(11, 99); p = a * b
    add("Multiplication and division", "Use inverse operations with multiplication and division", f"? × {a} = {fmt(p)}. What is the missing number?", "n", b, f"{fmt(p)} ÷ {a} = {b}.")

# =============================== Fractions ===============================
def fr_equiv():
    d = R.choice([2, 3, 4, 5, 6, 8, 10]); n = R.randint(1, d - 1); k = R.randint(2, 6)
    if math.gcd(n, d) > 1: return
    if R.random() < .5:
        add("Fractions", "Identify, name and write equivalent fractions of a given fraction", f"{n}/{d} = ?/{d*k}. What is the missing number?", "n", n * k,
            f"The denominator was multiplied by {k}, so multiply the numerator by {k} too: {n} × {k} = {n*k}.", fig={"t": "fracbar", "n": d, "k": n})
    else:
        f = Fraction(n * k, d * k)
        add("Fractions", "Identify equivalent fractions and simplify", f"Write {n*k}/{d*k} in its simplest form.", "f", frac(f),
            f"Divide the numerator and denominator by {k}: {n*k} ÷ {k} = {n}, {d*k} ÷ {k} = {d}. So {n*k}/{d*k} = {n}/{d}.")
def fr_compare():
    d = R.choice([4, 6, 8, 10, 12]); dd = R.choice([x for x in (2, 3, 4, 5, 6) if d % x == 0 and x != d])
    a = Fraction(R.randint(1, dd - 1), dd); b = Fraction(R.randint(1, d - 1), d)
    if a == b: return
    big = max(a, b)
    add("Fractions", "Compare and order fractions whose denominators are all multiples of the same number", f"Which is greater: {frac(a)} or {frac(b)}?", "c", [frac(a), frac(b)].index(frac(big)),
        f"Make the denominators the same: {frac(a)} = {a.numerator*(d//a.denominator)}/{d}. Compare {a.numerator*(d//a.denominator)}/{d} and {frac(b) if b.denominator==d else str(b.numerator*(d//b.denominator))+'/'+str(d)}: {frac(big)} is greater.", opts=[frac(a), frac(b)])
def fr_mixed():
    d = R.choice([2, 3, 4, 5, 6, 8, 10]); w = R.randint(1, 5); n = R.randint(1, d - 1)
    imp = w * d + n
    if R.random() < .5:
        add("Fractions", "Convert from mixed numbers to improper fractions", f"Write {w} {n}/{d} as an improper fraction.", "f", f"{imp}/{d}",
            f"{w} whole{'s' if w>1 else ''} = {w*d}/{d}. Add {n}/{d}: {w*d} + {n} = {imp}, so {imp}/{d}.")
    else:
        fp = Fraction(n, d); simp = f"{w} {fp.numerator}/{fp.denominator}"
        add("Fractions", "Convert from improper fractions to mixed numbers", f"Write {imp}/{d} as a mixed number in its simplest form.", "f", simp,
            f"{imp} ÷ {d} = {w} remainder {n}, so {imp}/{d} = {w} {n}/{d}" + (f" = {simp}." if fp.denominator != d else "."))
def fr_add():
    d = R.choice([5, 6, 8, 9, 10, 12]); a, b = R.randint(1, d - 1), R.randint(1, d - 1); op = R.choice("+-")
    if op == "-" and b > a: a, b = b, a
    r = Fraction(a + b if op == "+" else a - b, d)
    if r == 0: return
    sym = "+" if op == "+" else "−"
    add("Fractions", "Add and subtract fractions with the same denominator", f"Work out {a}/{d} {sym} {b}/{d}. Give your answer as a fraction or mixed number.", "f", frac(r),
        f"The denominators are the same, so {'add' if op=='+' else 'subtract'} the numerators: {a} {sym} {b} = {a+b if op=='+' else a-b}. {a+b if op=='+' else a-b}/{d}" + (f" = {mixed(r)}." if r > 1 or r.denominator != d else "."), )
def fr_related():
    pairs = [(2, 4), (2, 6), (3, 6), (2, 8), (4, 8), (3, 9), (5, 10), (2, 10), (3, 12), (4, 12), (6, 12)]
    d1, d2 = R.choice(pairs); a = R.randint(1, d1 - 1); b = R.randint(1, d2 - 1); op = R.choice("+-")
    A, Bf = Fraction(a, d1), Fraction(b, d2)
    if op == "-" and Bf > A: A, Bf = Bf, A
    r = A + Bf if op == "+" else A - Bf
    if r <= 0: return
    sym = "+" if op == "+" else "−"
    add("Fractions", "Add and subtract fractions with denominators that are multiples of the same number", f"Work out {frac(A)} {sym} {frac(Bf)}. Give your answer in its simplest form.", "f", frac(r) if r < 1 else mixed(r),
        f"Change to {d2}ths: {frac(A)} = {A*d2}/{d2} and {frac(Bf)} = {Bf*d2}/{d2}. Then {A*d2} {sym} {Bf*d2} = {r*d2}, so {r*d2}/{d2} = {frac(r) if r<1 else mixed(r)}.".replace(f"{d2}ths", f"{d2}ths"))
def fr_of():
    d = R.choice([2, 3, 4, 5, 6, 8, 10]); n = R.randint(1, d - 1); amt = d * R.randint(3, 60)
    unit = R.choice(["", "£", "kg", "m"])
    q = f"What is {n}/{d} of {('£'+fmt(amt)) if unit=='£' else fmt(amt)+(' '+unit if unit not in ('','£') else '')}?"
    add("Fractions", "Find fractions of amounts", q, "n", amt // d * n, f"Find 1/{d}: {fmt(amt)} ÷ {d} = {fmt(amt//d)}. Then × {n} = {fmt(amt//d*n)}.", unit=unit or None)
def fr_times():
    d = R.choice([3, 4, 5, 6, 8, 10]); n = R.randint(1, d - 1); k = R.randint(2, 9)
    r = Fraction(n * k, d)
    add("Fractions", "Multiply proper fractions and mixed numbers by whole numbers", f"Work out {n}/{d} × {k}. Give your answer as a mixed number or whole number.", "f", mixed(r),
        f"{n}/{d} × {k} = {n*k}/{d}" + (f" = {mixed(r)}." if r.denominator != d or r >= 1 else "."), fig={"t": "fracbar", "n": d, "k": n})
def fr_order():
    d = R.choice([8, 12, 10]); dens = [x for x in (2, 4, 8, 3, 6, 12, 5, 10) if d % x == 0]
    fs = list({Fraction(R.randint(1, e - 1), e) for e in (R.choice(dens) for _ in range(5))})
    if len(fs) < 3: return
    fs = fs[:4]; asc = sorted(fs); shown = fs[:]; R.shuffle(shown)
    L = math.lcm(*[x.denominator for x in fs])
    cor = ", ".join(frac(x) for x in asc)
    mc("Fractions", "Compare and order fractions", f"Order these fractions from smallest to largest: {', '.join(frac(x) for x in shown)}", cor,
       [", ".join(frac(x) for x in sorted(fs, key=lambda f: f.denominator)), ", ".join(frac(x) for x in sorted(fs, reverse=True)), ", ".join(frac(x) for x in sorted(fs, key=lambda f: f.numerator))],
       f"Change them all to {L}ths: " + ", ".join(f"{frac(x)} = {x*L}/{L}" for x in asc) + ".")
def fr_shaded():
    d = R.choice([4, 5, 6, 8, 10, 12]); k = R.randint(1, d - 1); f = Fraction(k, d)
    wrong = [f"{d-k}/{d}", f"{k}/{d+1}", f"{k+1}/{d}" if k + 1 < d else f"{k-1}/{d}"]
    mc("Fractions", "Recognise fractions shown in a diagram", "What fraction of the bar is shaded? Give the simplest form.", frac(f), wrong + [f"{k}/{d}"] if f.denominator != d else wrong,
       f"{k} out of {d} equal parts are shaded: {k}/{d}" + (f" = {frac(f)}." if f.denominator != d else "."), fig={"t": "fracbar", "n": d, "k": k})

# =============================== Decimals and percentages ===============================
def dp_place():
    n = R.randint(1001, 99999) / 1000; s = f"{n:.3f}"; idx = R.choice([0, 1, 2]); dig = s.split(".")[1][idx]
    if dig == "0": return
    names = ["tenths", "hundredths", "thousandths"]; val = int(dig) / 10 ** (idx + 1)
    mc("Decimals", "Read, write, order and compare numbers with up to three decimal places", f"What is the value of the digit {dig} in {s}?", f"{dig} {names[idx]}",
       [f"{dig} {names[(idx+1)%3]}", f"{dig} {names[(idx+2)%3]}", f"{dig} ones"], f"The digit {dig} is in the {names[idx][:-1]}s column, so it is worth {fmt(val)}.")
def dp_compare():
    a = R.randint(100, 9999) / 1000 + R.randint(0, 9); b = round(a + R.choice([-1, 1]) * R.choice([0.01, 0.001, 0.1, 0.009, 0.09]), 3)
    if b <= 0 or a == b: return
    sa, sb = fmt(round(a, 3)), fmt(b); big = sa if round(a, 3) > b else sb
    add("Decimals", "Order and compare numbers with up to three decimal places", f"Which is greater: {sa} or {sb}?", "c", [sa, sb].index(big),
        f"Compare the ones, then tenths, hundredths and thousandths. {big} is greater.", opts=[sa, sb])
def dp_frac():
    t = R.choice(["tenths", "hundredths", "thousandths"])
    if t == "tenths": n = R.randint(1, 9); f, dec = f"{n}/10", n / 10
    elif t == "hundredths": n = R.randint(1, 99); f, dec = f"{n}/100", n / 100
    else: n = R.randint(1, 999); f, dec = f"{n}/1000", n / 1000
    if R.random() < .5:
        add("Decimals", "Recognise and use thousandths and relate them to tenths, hundredths and decimal equivalents", f"Write {f} as a decimal.", "n", dec, f"{f} means {n} {t}, which is {fmt(dec)}.")
    else:
        add("Decimals", "Read and write decimal numbers as fractions", f"Write {fmt(dec)} as a fraction with denominator {f.split('/')[1]}.", "f", f, f"{fmt(dec)} is {n} {t}, so it is {f}.")
def dp_percent():
    t = R.choice(["frac2pc", "pc2dec", "pc2frac", "of", "rest"])
    if t == "frac2pc":
        f = R.choice([Fraction(1, 2), Fraction(1, 4), Fraction(3, 4), Fraction(1, 5), Fraction(2, 5), Fraction(3, 5), Fraction(4, 5), Fraction(1, 10), Fraction(3, 10), Fraction(7, 10), Fraction(9, 10), Fraction(1, 25), Fraction(3, 25), Fraction(7, 20)])
        pc = int(f * 100)
        add("Percentages", "Know percentage and decimal equivalents of 1/2, 1/4, 1/5, 2/5, 4/5 and fractions with a denominator of 10 or 25", f"Write {frac(f)} as a percentage.", "n", pc,
            f"{frac(f)} = {pc}/100 = {pc}%.", unit="%")
    elif t == "pc2dec":
        pc = R.randint(1, 99); add("Percentages", "Write percentages as a decimal", f"Write {pc}% as a decimal.", "n", pc / 100, f"{pc}% = {pc}/100 = {fmt(pc/100)}.")
    elif t == "pc2frac":
        pc = R.choice([10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]); f = Fraction(pc, 100)
        add("Percentages", "Write percentages as a fraction with denominator 100 and simplify", f"Write {pc}% as a fraction in its simplest form.", "f", frac(f), f"{pc}% = {pc}/100 = {frac(f)}.")
    elif t == "of":
        pc = R.choice([10, 20, 25, 50, 75, 5, 1]); amt = R.choice([20, 40, 60, 80, 100, 120, 200, 240, 300, 400, 500, 800, 1000])
        r = Fraction(pc * amt, 100)
        if r.denominator != 1: return
        add("Percentages", "Solve problems which require knowing percentage equivalents", f"What is {pc}% of {fmt(amt)}?", "n", int(r),
            f"{pc}% = {frac(Fraction(pc,100))}. {fmt(amt)} × {frac(Fraction(pc,100))} = {int(r)}.")
    else:
        pc = R.randint(5, 95)
        add("Percentages", "Recognise the per cent symbol and understand that per cent relates to number of parts per hundred", f"{pc}% of a class walk to school. What percentage of the class do not walk to school?", "n", 100 - pc,
            f"The whole class is 100%. 100 − {pc} = {100-pc}%.", unit="%")
def dp_money():
    t = R.choice(["change", "total", "unit"])
    if t == "change":
        items = R.randint(2, 4); prices = [R.randint(45, 899) for _ in range(items)]; paid = R.choice([1000, 2000, 5000]) if sum(prices) < 1000 else R.choice([2000, 5000])
        if sum(prices) >= paid: return
        add("Money", "Solve problems involving money using decimal notation", f"{nm()} buys items costing {', '.join(money(p) for p in prices)}. They pay with a {money(paid).replace('.00','')} note. How much change do they get?", "n", (paid - sum(prices)) / 100,
            f"Total: {money(sum(prices))}. Change: {money(paid)} − {money(sum(prices))} = {money(paid-sum(prices))}.", unit="£")
    elif t == "total":
        p = R.randint(65, 999); k = R.randint(3, 9)
        add("Money", "Solve problems involving money using decimal notation", f"A notebook costs {money(p)}. How much do {k} notebooks cost?", "n", p * k / 100, f"{money(p)} × {k} = {money(p*k)}.", unit="£")
    else:
        k = R.randint(3, 8); p = R.randint(30, 450); tot = p * k
        add("Money", "Solve problems involving money using decimal notation", f"{k} identical pens cost {money(tot)} altogether. How much does one pen cost?", "n", p / 100, f"{money(tot)} ÷ {k} = {money(p)}.", unit="£")
def dp_add():
    a = R.randint(100, 9999) / 100; b = R.randint(10, 999) / 100; op = R.choice("+-")
    if op == "-" and b > a: a, b = b, a
    r = round(a + b if op == "+" else a - b, 2)
    add("Decimals", "Add and subtract decimals", f"Work out {fmt(a)} {'+' if op=='+' else '−'} {fmt(b)}.", "n", r, f"Line up the decimal points: {fmt(a)} {'+' if op=='+' else '−'} {fmt(b)} = {fmt(r)}.")
def dp_order():
    base = R.randint(1, 9); ds = list({round(base + R.choice([R.randint(1, 9) / 10, R.randint(1, 99) / 100, R.randint(1, 999) / 1000]), 3) for _ in range(5)})
    if len(ds) < 4: return
    ds = ds[:4]; asc = sorted(ds); shown = ds[:]; R.shuffle(shown)
    mc("Decimals", "Order and compare numbers with up to three decimal places", f"Order from smallest to largest: {', '.join(fmt(x) for x in shown)}", ", ".join(fmt(x) for x in asc),
       [", ".join(fmt(x) for x in sorted(ds, key=lambda v: len(fmt(v)))), ", ".join(fmt(x) for x in sorted(ds, reverse=True)), ", ".join(fmt(x) for x in sorted(ds, key=lambda v: fmt(v)[::-1]))],
       "Write them all with three decimal places, then compare: " + ", ".join(f"{x:.3f}" for x in asc) + ".")

# =============================== Measurement ===============================
CONV = [("km", "m", 1000), ("m", "cm", 100), ("cm", "mm", 10), ("kg", "g", 1000), ("l", "ml", 1000), ("m", "mm", 1000)]
def ms_convert():
    big, small, f = R.choice(CONV)
    if R.random() < .5:
        x = R.choice([R.randint(1, 50), R.randint(10, 99) / 10, R.randint(100, 999) / 100])
        r = round(x * f, 3)
        if r != int(r): return
        add("Measurement", "Convert between different units of metric measure", f"How many {small} are in {fmt(x)} {big}?", "n", int(r), f"1 {big} = {fmt(f)} {small}, so {fmt(x)} × {fmt(f)} = {fmt(int(r))} {small}.", unit=small)
    else:
        x = R.randint(1, 99) * R.choice([10, 50, 125, 250, 1])
        r = round(x / f, 3)
        add("Measurement", "Convert between different units of metric measure", f"Write {fmt(x)} {small} in {big}.", "n", r, f"1 {big} = {fmt(f)} {small}, so {fmt(x)} ÷ {fmt(f)} = {fmt(r)} {big}.", unit=big)
def ms_imperial():
    t = R.choice([("inch", "cm", 2.5, "About how many centimetres are in {x} inches?"), ("kg", "lb", 2.2, "About how many pounds (lb) are {x} kg?"), ("pint", "ml", 570, "About how many millilitres are in {x} pints?"), ("mile", "km", 1.6, "About how many kilometres are {x} miles?")])
    x = R.choice([2, 4, 5, 10, 20, 3, 6]); r = round(x * t[2], 1)
    add("Measurement", "Understand and use approximate equivalences between metric units and common imperial units", t[3].format(x=x), "n", r,
        f"1 {t[0]} ≈ {fmt(t[2])} {t[1]}, so {x} × {fmt(t[2])} ≈ {fmt(r)}.", unit=t[1])
def ms_perimeter():
    W, H = R.randint(8, 20), R.randint(6, 16); w, h = R.randint(2, W - 3), R.randint(2, H - 3)
    per = 2 * (W + H)
    add("Measurement", "Measure and calculate the perimeter of composite rectilinear shapes in centimetres and metres",
        f"This L-shape is {W} cm wide and {H} cm tall. A corner piece {w} cm by {h} cm has been cut away. What is its perimeter?", "n", per,
        f"For an L-shape the missing sides add up to the full width and height, so the perimeter is the same as the full rectangle: 2 × ({W} + {H}) = {per} cm.", unit="cm",
        fig={"t": "lshape", "W": W, "H": H, "w": w, "h": h})
def ms_area():
    t = R.choice(["rect", "lshape", "side"])
    if t == "rect":
        a, b = R.randint(3, 25), R.randint(3, 25); u = R.choice(["cm", "m"])
        add("Measurement", "Calculate and compare the area of rectangles, using standard units (cm², m²)", f"A rectangle is {a} {u} long and {b} {u} wide. What is its area?", "n", a * b, f"Area = length × width = {a} × {b} = {a*b} {u}².", unit=u + "²",
            fig={"t": "rect", "a": a, "b": b, "u": u})
    elif t == "side":
        a, b = R.randint(3, 15), R.randint(3, 15)
        add("Measurement", "Calculate the area of rectangles and find missing lengths", f"A rectangle has an area of {a*b} cm². One side is {a} cm. How long is the other side?", "n", b, f"{a*b} ÷ {a} = {b} cm.", unit="cm")
    else:
        W, H = R.randint(8, 16), R.randint(6, 14); w, h = R.randint(2, W - 3), R.randint(2, H - 3)
        add("Measurement", "Calculate the area of rectilinear shapes", f"This L-shape is {W} cm by {H} cm with a {w} cm by {h} cm corner cut away. What is its area?", "n", W * H - w * h,
            f"Whole rectangle: {W} × {H} = {W*H} cm². Cut-away corner: {w} × {h} = {w*h} cm². Area = {W*H} − {w*h} = {W*H-w*h} cm².", unit="cm²", fig={"t": "lshape", "W": W, "H": H, "w": w, "h": h})
def ms_volume():
    a, b, c = R.randint(2, 6), R.randint(2, 6), R.randint(2, 6)
    add("Measurement", "Estimate volume using 1 cm³ blocks to build cuboids", f"A cuboid is built from 1 cm³ cubes. It is {a} cubes long, {b} cubes wide and {c} cubes tall. How many cubes are used?", "n", a * b * c,
        f"{a} × {b} = {a*b} cubes in each layer. {c} layers: {a*b} × {c} = {a*b*c} cm³.", unit="cm³")
def ms_time():
    t = R.choice(["min2h", "h2min", "days", "weeks", "secs", "years", "duration"])
    if t == "min2h":
        m = R.randint(65, 590)
        if m % 60 == 0: return
        mc("Time", "Solve problems involving converting between units of time", f"How long is {m} minutes in hours and minutes?", f"{m//60} h {m%60} min", [f"{m//100} h {m%100} min", f"{m//60+1} h {m%60} min", f"{m//60} h {(m%60+10)%60} min"],
           f"{m} ÷ 60 = {m//60} remainder {m%60}, so {m//60} hours {m%60} minutes.")
    elif t == "h2min":
        h, mm = R.randint(1, 5), R.choice([15, 20, 30, 45, 10, 40, 50])
        add("Time", "Solve problems involving converting between units of time", f"How many minutes are in {h} hours {mm} minutes?", "n", h * 60 + mm, f"{h} × 60 = {h*60}, then + {mm} = {h*60+mm} minutes.", unit="min")
    elif t == "days":
        w = R.randint(2, 12); add("Time", "Convert between units of time", f"How many days are in {w} weeks?", "n", w * 7, f"{w} × 7 = {w*7} days.", unit="days")
    elif t == "weeks":
        d = R.randint(15, 90)
        if d % 7 == 0:
            add("Time", "Convert between units of time", f"How many weeks are in {d} days?", "n", d // 7, f"{d} ÷ 7 = {d//7}.", unit="weeks")
    elif t == "secs":
        m = R.randint(2, 12); s = R.choice([0, 15, 30, 45])
        add("Time", "Convert between units of time", f"How many seconds are in {m} minutes{'' if not s else f' {s} seconds'}?", "n", m * 60 + s, f"{m} × 60 = {m*60}" + (f", + {s} = {m*60+s}" if s else "") + " seconds.", unit="s")
    elif t == "years":
        y = R.randint(2, 10); add("Time", "Convert between units of time", f"How many months are in {y} years?", "n", y * 12, f"{y} × 12 = {y*12} months.", unit="months")
    else:
        h1, m1 = R.randint(7, 15), R.choice([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]); dur = R.randint(25, 200)
        e = h1 * 60 + m1 + dur
        add("Time", "Solve problems involving time, including timetables (24-hour clock)", f"A train leaves at {h1:02d}:{m1:02d} and the journey takes {dur} minutes. At what time does it arrive? Write it like 14:05.", "t", f"{e//60:02d}:{e%60:02d}",
            f"{dur} minutes = {dur//60} h {dur%60} min. {h1:02d}:{m1:02d} + {dur//60} h {dur%60} min = {e//60:02d}:{e%60:02d}.")
def ms_timetable():
    stops = ["Bath", "Bristol", "Swindon", "Reading", "London"]; start = R.randint(6 * 60, 15 * 60); gaps = [R.randint(10, 40) for _ in range(4)]
    times = [start]; [times.append(times[-1] + g) for g in gaps]
    i, j = sorted(R.sample(range(5), 2))
    fig = {"t": "table", "head": ["Station", "Departs"], "rows": [[s, f"{t//60:02d}:{t%60:02d}"] for s, t in zip(stops, times)]}
    add("Time", "Read and solve problems with timetables", f"Use the timetable. How many minutes does the train take from {stops[i]} to {stops[j]}?", "n", times[j] - times[i],
        f"{stops[i]} {times[i]//60:02d}:{times[i]%60:02d} to {stops[j]} {times[j]//60:02d}:{times[j]%60:02d} is {times[j]-times[i]} minutes.", fig=fig, unit="min")

# =============================== Geometry ===============================
def ge_angletype():
    d = R.choice([R.randint(10, 85), R.randint(95, 175), R.randint(185, 350), 90])
    name = "right angle" if d == 90 else "acute" if d < 90 else "obtuse" if d < 180 else "reflex"
    mc("Geometry", "Know angles are measured in degrees; identify acute, obtuse and reflex angles", f"This angle is {d}°. What type of angle is it?", name,
       [x for x in ["acute", "obtuse", "reflex", "right angle"] if x != name],
       "Acute is less than 90°, a right angle is exactly 90°, obtuse is between 90° and 180°, reflex is more than 180°.", fig={"t": "angle", "d": d})
def ge_missing():
    t = R.choice(["line", "point", "right", "triangle-free"])
    if t == "line":
        a = R.randint(20, 160); add("Geometry", "Identify angles on a straight line (total 180°)", f"Two angles sit on a straight line. One is {a}°. What is the other?", "n", 180 - a,
                                    f"Angles on a straight line add up to 180°. 180 − {a} = {180-a}°.", unit="°", fig={"t": "line", "a": a})
    elif t == "point":
        a, b = R.randint(40, 150), R.randint(40, 150)
        if a + b >= 330: return
        add("Geometry", "Identify angles at a point (total 360°)", f"Three angles meet at a point. Two of them are {a}° and {b}°. What is the third angle?", "n", 360 - a - b,
            f"Angles at a point add up to 360°. 360 − {a} − {b} = {360-a-b}°.", unit="°", fig={"t": "point", "a": a, "b": b})
    elif t == "right":
        a = R.randint(10, 80); add("Geometry", "Identify angles in a right angle (90°)", f"A right angle is split into two angles. One is {a}°. What is the other?", "n", 90 - a, f"A right angle is 90°. 90 − {a} = {90-a}°.", unit="°")
    else:
        turns = R.choice([("a quarter turn", 90), ("a half turn", 180), ("three quarters of a turn", 270), ("a whole turn", 360)])
        add("Geometry", "Identify multiples of 90° as turns", f"How many degrees are in {turns[0]}?", "n", turns[1], f"A whole turn is 360°, so {turns[0]} is {turns[1]}°.", unit="°")
SOLIDS = {"cube": (6, 12, 8), "cuboid": (6, 12, 8), "square-based pyramid": (5, 8, 5), "triangular prism": (5, 9, 6), "tetrahedron (triangular-based pyramid)": (4, 6, 4), "pentagonal prism": (7, 15, 10), "hexagonal prism": (8, 18, 12)}
def ge_solids():
    s = R.choice(list(SOLIDS)); i = R.randrange(3); what = ["faces", "edges", "vertices"][i]
    add("Geometry", "Identify 3-D shapes, including cubes and other cuboids, from 2-D representations", f"How many {what} does a {s} have?", "n", SOLIDS[s][i],
        f"A {s} has {SOLIDS[s][0]} faces, {SOLIDS[s][1]} edges and {SOLIDS[s][2]} vertices.")
POLY = {3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon"}
def ge_polygon():
    n = R.choice(list(POLY)); t = R.choice(["name", "perim", "regular"])
    if t == "name":
        mc("Geometry", "Distinguish between regular and irregular polygons", f"What is the name of a polygon with {n} sides?", POLY[n], [POLY[m] for m in R.sample([k for k in POLY if k != n], 3)], f"A polygon with {n} sides is a {POLY[n]}.")
    elif t == "perim":
        s = R.randint(3, 15); add("Geometry", "Use the properties of regular polygons", f"A regular {POLY[n] if n!=4 else 'quadrilateral (a square)'} has sides of {s} cm. What is its perimeter?", "n", n * s,
                                  f"A regular polygon has equal sides. {n} × {s} = {n*s} cm.", unit="cm")
    else:
        mc("Geometry", "Distinguish between regular and irregular polygons based on reasoning about equal sides and angles", "What makes a polygon regular?", "All its sides and all its angles are equal",
           ["It has four sides", "It has at least one right angle", "All its sides are different lengths"], "A regular polygon has all sides equal and all angles equal.")
def ge_coords():
    x, y = R.randint(1, 8), R.randint(1, 8); t = R.choice(["translate", "reflect-x", "reflect-y"])
    if t == "translate":
        dx, dy = R.randint(-4, 5), R.randint(-4, 5)
        if dx == 0 and dy == 0: return
        nx, ny = x + dx, y + dy
        mv = " and ".join([m for m in [f"{abs(dx)} {'right' if dx>0 else 'left'}" if dx else "", f"{abs(dy)} {'up' if dy>0 else 'down'}" if dy else ""] if m])
        add("Geometry", "Describe the position of a shape following a translation", f"Point A is at ({x}, {y}). It is moved {mv}. What are its new coordinates? Write them like (3, 4).", "t", f"({nx}, {ny})",
            f"Change x by {dx:+d} and y by {dy:+d}: ({x}{dx:+d}, {y}{dy:+d}) = ({nx}, {ny}).")
    elif t == "reflect-x":
        add("Geometry", "Describe the position of a shape following a reflection", f"Point B is at ({x}, {y}). It is reflected in the x-axis. What are its new coordinates? Write them like (3, −4).", "t", f"({x}, {-y})",
            f"Reflecting in the x-axis keeps x the same and changes the sign of y: ({x}, {-y}).")
    else:
        add("Geometry", "Describe the position of a shape following a reflection", f"Point C is at ({x}, {y}). It is reflected in the y-axis. What are its new coordinates? Write them like (−3, 4).", "t", f"({-x}, {y})",
            f"Reflecting in the y-axis keeps y the same and changes the sign of x: ({-x}, {y}).")

# =============================== Statistics ===============================
SUBJ = [("Favourite fruit", ["Apples", "Bananas", "Grapes", "Pears", "Plums"]), ("Pets in Year 5", ["Dogs", "Cats", "Fish", "Rabbits", "Hamsters"]), ("Books read", ["Mon", "Tue", "Wed", "Thu", "Fri"]), ("Goals scored", ["Reds", "Blues", "Greens", "Yellows"])]
def st_bar():
    title, labels = R.choice(SUBJ); vals = [R.randint(2, 20) for _ in labels]
    t = R.choice(["most", "diff", "total"])
    fig = {"t": "bar", "title": title, "labels": labels, "values": vals}
    if t == "most":
        if vals.count(max(vals)) > 1: return
        mc("Statistics", "Solve comparison, sum and difference problems using information presented in a bar chart", "Look at the bar chart. Which bar is the tallest?", labels[vals.index(max(vals))], [l for l in labels if l != labels[vals.index(max(vals))]],
           f"{labels[vals.index(max(vals))]} has {max(vals)}, more than any other.", fig=fig)
    elif t == "diff":
        i, j = R.sample(range(len(labels)), 2)
        if vals[i] == vals[j]: return
        if vals[i] < vals[j]: i, j = j, i
        add("Statistics", "Solve comparison, sum and difference problems using information presented in a bar chart", f"Look at the bar chart. How many more for {labels[i]} than for {labels[j]}?", "n", abs(vals[i] - vals[j]),
            f"{labels[i]}: {vals[i]}. {labels[j]}: {vals[j]}. Difference: {abs(vals[i]-vals[j])}.", fig=fig)
    else:
        add("Statistics", "Solve comparison, sum and difference problems using information presented in a bar chart", "Look at the bar chart. What is the total of all the bars?", "n", sum(vals), " + ".join(map(str, vals)) + f" = {sum(vals)}.", fig=fig)
def st_line():
    hours = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"]; vals = [R.randint(6, 12)]
    for _ in range(6): vals.append(max(0, vals[-1] + R.randint(-2, 4)))
    fig = {"t": "lgraph", "title": "Temperature (°C)", "labels": hours, "values": vals}
    t = R.choice(["at", "rise", "max"])
    if t == "at":
        i = R.randrange(7); add("Statistics", "Complete, read and interpret information in line graphs", f"Look at the line graph. What was the temperature at {hours[i]}?", "n", vals[i], f"Find {hours[i]} on the bottom axis, go up to the line and across: {vals[i]}°C.", fig=fig, unit="°C")
    elif t == "rise":
        i, j = sorted(R.sample(range(7), 2))
        add("Statistics", "Complete, read and interpret information in line graphs", f"Look at the line graph. By how many degrees did the temperature change from {hours[i]} to {hours[j]}?", "n", abs(vals[j] - vals[i]),
            f"{hours[i]}: {vals[i]}°C. {hours[j]}: {vals[j]}°C. Change: {abs(vals[j]-vals[i])} degrees.", fig=fig, unit="°C")
    else:
        if vals.count(max(vals)) > 1: return
        mc("Statistics", "Complete, read and interpret information in line graphs", "Look at the line graph. At what time was it warmest?", hours[vals.index(max(vals))], [h for h in hours if h != hours[vals.index(max(vals))]][:3],
           f"The highest point on the line is at {hours[vals.index(max(vals))]} ({max(vals)}°C).", fig=fig)
def st_table():
    names = R.sample(NAMES, 4); m = [R.randint(5, 30) for _ in names]; tu = [R.randint(5, 30) for _ in names]
    fig = {"t": "table", "head": ["Name", "Monday", "Tuesday"], "rows": [[n, str(a), str(b)] for n, a, b in zip(names, m, tu)]}
    i = R.randrange(4)
    add("Statistics", "Complete, read and interpret information in tables", f"The table shows how many pages each child read. How many pages did {names[i]} read altogether?", "n", m[i] + tu[i],
        f"{m[i]} + {tu[i]} = {m[i]+tu[i]}.", fig=fig, unit="pages")

# ------------------------------- Build to quotas -------------------------------
QUOTAS = [
    ("Place value", [pv_value, pv_words, pv_partition, pv_powers, pv_compare, pv_order, pv_tenmore], 240),
    ("Rounding", [rd_round, rd_estimate, rd_range, rd_decimal], 140),
    ("Negative numbers", [neg_temp, neg_diff, neg_count, neg_order], 100),
    ("Roman numerals", [rom_to, rom_from, rom_year], 80),
    ("Addition and subtraction", [as_column, as_mental, as_missing, as_story, as_multistep, as_check], 220),
    ("Multiples, factors and primes", [mf_factors, mf_pair, mf_common, mf_multiple, mf_ismultiple, mf_prime, mf_primecount, mf_primefactor], 150),
    ("Squares and cubes", [mf_square, mf_whichsquare], 50),
    ("Multiplication and division", [md_written, md_division, md_remainder_story, md_powers10, md_mental, md_story, md_scale, md_missing], 260),
    ("Fractions", [fr_equiv, fr_compare, fr_mixed, fr_add, fr_related, fr_of, fr_times, fr_order, fr_shaded], 220),
    ("Decimals", [dp_place, dp_compare, dp_frac, dp_add, dp_order], 110),
    ("Percentages", [dp_percent], 50),
    ("Money", [dp_money], 30),
    ("Measurement", [ms_convert, ms_imperial, ms_perimeter, ms_area, ms_volume], 120),
    ("Time", [ms_time, ms_timetable], 60),
    ("Geometry", [ge_angletype, ge_missing, ge_solids, ge_polygon, ge_coords], 110),
    ("Statistics", [st_bar, st_line, st_table], 60),
]
assert sum(q for *_, q in QUOTAS) == 2000
for topic, fns, quota in QUOTAS:
    start = len(BANK); tries = 0
    while len(BANK) - start < quota:
        tries += 1
        if tries > 200000: raise SystemExit(f"Not enough unique questions for {topic}: {len(BANK)-start}")
        before = len(BANK); R.choice(fns)()
        if len(BANK) > before and BANK[-1]["t"] != topic:  # sub-generators may label a finer topic
            BANK[-1]["t"] = topic
    del BANK[start + quota:]

# ------------------------------- Self-checks -------------------------------
TOPIC_ORDER = [t for t, *_ in QUOTAS]
for i, q in enumerate(BANK):
    q["id"] = f"m{i+1:04d}"
    assert q["k"] in ("n", "c", "f", "r", "t"), q
    if q["k"] == "c": assert 0 <= q["a"] < len(q["c"]) and len(set(q["c"])) == len(q["c"]), q
    if q["k"] == "n": assert isinstance(q["a"], (int, float)), q
assert len(BANK) == 2000 and len({q["q"] + json.dumps(q.get("f")) for q in BANK}) == 2000
out = "/* Word Speller maths: 2,000 Year 5 questions (National Curriculum in England). Built by tools/build_maths.py; answers are computed, not typed. */\n"
out += "const MATHS_TOPICS=" + json.dumps(TOPIC_ORDER) + ";\n"
out += "const MATHS=" + json.dumps(BANK, ensure_ascii=False, separators=(",", ":")) + ";\n"
out += 'if(typeof module!=="undefined"&&module.exports)module.exports={MATHS,MATHS_TOPICS};\n'
open("maths-bank.js", "w").write(out)
from collections import Counter
print(len(BANK), "questions,", round(len(out) / 1024), "KB")
for t in TOPIC_ORDER: print(f"  {t:32s} {sum(1 for q in BANK if q['t']==t)}")
print(Counter(q["k"] for q in BANK))
