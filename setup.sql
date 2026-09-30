-- Word Speller: one row per child. Run once in Supabase → SQL Editor.
create table if not exists public.word_books (
  name text primary key,                 -- child's name, lowercase (e.g. "wdy")
  data jsonb not null default '{}'::jsonb, -- words, review plan, practice log, best score
  updated_at timestamptz not null default now()
);

alter table public.word_books enable row level security;

drop policy if exists "word_books read" on public.word_books;
drop policy if exists "word_books insert" on public.word_books;
drop policy if exists "word_books update" on public.word_books;
create policy "word_books read" on public.word_books for select using (true);
create policy "word_books insert" on public.word_books for insert with check (true);
create policy "word_books update" on public.word_books for update using (true) with check (true);

grant select, insert, update on public.word_books to anon, authenticated;
