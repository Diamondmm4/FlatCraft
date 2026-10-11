-- FlatCraft account profile cloud sync.
-- Run this once in Supabase Dashboard -> SQL Editor.

create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cosmetics jsonb,
  settings jsonb,
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;

revoke all on table public.player_profiles from anon, authenticated;
grant select, insert, update on table public.player_profiles to authenticated;

drop policy if exists "Players can read own profile" on public.player_profiles;
create policy "Players can read own profile"
on public.player_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Players can create own profile" on public.player_profiles;
create policy "Players can create own profile"
on public.player_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update own profile" on public.player_profiles;
create policy "Players can update own profile"
on public.player_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
