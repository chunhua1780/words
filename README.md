# Word Speller

An English spelling trainer for children, made for iPad (landscape works best).

- **Type your name** (for example `WDY`). Every word, review date and score is saved online under that name, so it's there every day on any device.
- **Add Words**: one word per line. Choose today or tomorrow. Delete any word (or all words) in *My Words*.
- **5 steps for new words**: Look & Listen (syllable chunks, spell-out) → Pick the right spelling → Build with letter tiles → Look, Cover, Write, Check → Dictation.
- **Spaced review**: learned words come back after 1, 2, 4, 7, 15, 30 and 60 days.
- **Practice**: Spelling Game (points, streaks, timer), Dictation, Cover & Write.
- **Pronunciation**: online human voice (Youdao, then Google), falling back to the device voice. US or UK.

## One-time setup: online saving

Open the Supabase project → **SQL Editor** → paste [`setup.sql`](setup.sql) → **Run**.
Until then, words are saved on the device only.

Note: anyone who types the same name opens the same word list.
