# Word Speller

An English spelling trainer for children (iPad, landscape works best), with a phone page for parents.

- **Child page** (`index.html`): log in with a username and password. Every word, review date and score is saved in the account.
  - Words are organised in **lists by study date**. A list for a future date stays locked until its day (a test list can open some days before the test). The child picks one list and only practises that list's words.
  - 5 steps for new words: **Sound it out** (phonics chunks such as con·fi·den·**tial** "shul", tricky bits) → **Chunks** in order → **Build** (tap or drag letters) → **Cover & Write** → **Dictation**.
  - Spelling methods: ⌨️ type (Apple Pencil Scribble works), 🔤 letter tiles (tap or drag), ✍️ handwriting (finger or Apple Pencil, then self-check).
  - Practice: Spelling Game, Dictation, Phonics Chunks, Cover & Write, Practice Test (school style), All 5 Steps.
  - Spaced review after 1, 2, 4, 7, 15, 30 and 60 days; test words are practised daily in the week before a test.
- **Parent page** (`parent.html`): same login. Add dictation tests with a date and word list, see each word's level, accuracy, last practice and next review, practice-test marks, and the last 14 days of activity.
- **Pronunciation**: standard British English throughout (Youdao UK recordings for whole words, Google en-GB for phonics chunks, British device voices as a fallback).

## One-time setup

In Supabase → **SQL Editor**, run [`setup-accounts.sql`](setup-accounts.sql). It creates the accounts table and password-checked functions, and brings over any word list saved under the same name by the earlier version ([`setup.sql`](setup.sql)).

## Phonics sounds

`phonics.js` splits each word into spelling chunks and gives every chunk its real sound, taken from the
[CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) (`cmu.txt`, US English, BSD licence, see `CMU-LICENSE.txt`).
Chunk sounds and letter names are read by Google's voice or the device voice, never by the dictionary voice (which is only used for whole words).

The CMU dictionary is American, so `phonics.js` converts each pronunciation to standard British (RP) before splitting: non-rhotic r, BATH and LOT vowels, yod after t/d/n, weak -ary/-ory endings and a list of words that differ in Britain.
