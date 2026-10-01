-- Word Speller accounts: username + password. Run once in Supabase → SQL Editor → Run.
-- Passwords are stored as bcrypt hashes. The table is not readable directly:
-- the web pages can only use the four functions below, and each one checks the password.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.ws_accounts (
  username   text primary key,
  pass_hash  text not null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ws_accounts enable row level security;
revoke all on public.ws_accounts from anon, authenticated;

-- Create an account. If an older name-only word list exists with the same name, its words are brought over.
create or replace function public.ws_register(p_user text, p_pass text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare u text := lower(trim(p_user)); d jsonb;
begin
  if u !~ '^[a-z0-9_.-]{2,24}$' then raise exception 'bad_username'; end if;
  if length(coalesce(p_pass, '')) < 4 then raise exception 'short_password'; end if;
  if exists (select 1 from ws_accounts where username = u) then raise exception 'username_taken'; end if;
  if to_regclass('public.word_books') is not null then
    execute 'select data from public.word_books where name = $1' into d using u;
  end if;
  insert into ws_accounts (username, pass_hash, data)
  values (u, crypt(p_pass, gen_salt('bf')), coalesce(d, '{}'::jsonb));
  return jsonb_build_object('data', coalesce(d, '{}'::jsonb));
end $$;

create or replace function public.ws_login(p_user text, p_pass text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r ws_accounts;
begin
  select * into r from ws_accounts where username = lower(trim(p_user));
  if not found or r.pass_hash <> crypt(p_pass, r.pass_hash) then raise exception 'bad_login'; end if;
  return jsonb_build_object('data', r.data, 'updated_at', r.updated_at);
end $$;

create or replace function public.ws_save(p_user text, p_pass text, p_data jsonb)
returns timestamptz language plpgsql security definer set search_path = public, extensions as $$
declare r ws_accounts; t timestamptz := now();
begin
  select * into r from ws_accounts where username = lower(trim(p_user)) for update;
  if not found or r.pass_hash <> crypt(p_pass, r.pass_hash) then raise exception 'bad_login'; end if;
  if octet_length(p_data::text) > 2000000 then raise exception 'too_big'; end if;
  update ws_accounts set data = p_data, updated_at = t where username = r.username;
  return t;
end $$;

create or replace function public.ws_change_password(p_user text, p_pass text, p_new text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare r ws_accounts;
begin
  select * into r from ws_accounts where username = lower(trim(p_user));
  if not found or r.pass_hash <> crypt(p_pass, r.pass_hash) then raise exception 'bad_login'; end if;
  if length(coalesce(p_new, '')) < 4 then raise exception 'short_password'; end if;
  update ws_accounts set pass_hash = crypt(p_new, gen_salt('bf')) where username = r.username;
  return true;
end $$;

revoke all on function public.ws_register(text, text), public.ws_login(text, text),
  public.ws_save(text, text, jsonb), public.ws_change_password(text, text, text) from public;
grant execute on function public.ws_register(text, text), public.ws_login(text, text),
  public.ws_save(text, text, jsonb), public.ws_change_password(text, text, text) to anon, authenticated;

-- The old name-only table (word_books) was open to anyone who knew a name.
-- Close it to the public; ws_register can still read it to bring old words over.
do $$ begin
  if to_regclass('public.word_books') is not null then
    revoke select, insert, update on public.word_books from anon, authenticated;
  end if;
end $$;
