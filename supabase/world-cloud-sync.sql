-- FlatCraft signed-in world cloud sync.
-- Run this once in Supabase Dashboard -> SQL Editor.

create table if not exists public.player_worlds (
  user_id uuid not null references auth.users(id) on delete cascade,
  world_id text not null,
  name text,
  seed text,
  mode text,
  day integer,
  played double precision,
  dim text,
  saved bigint,
  world_data jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, world_id)
);

alter table public.player_worlds enable row level security;

revoke all on table public.player_worlds from anon, authenticated;
grant select, insert, update, delete on table public.player_worlds to authenticated;

drop policy if exists "Players can read own worlds" on public.player_worlds;
create policy "Players can read own worlds"
on public.player_worlds
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Players can create own worlds" on public.player_worlds;
create policy "Players can create own worlds"
on public.player_worlds
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Players can update own worlds" on public.player_worlds;
create policy "Players can update own worlds"
on public.player_worlds
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Players can delete own worlds" on public.player_worlds;
create policy "Players can delete own worlds"
on public.player_worlds
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists player_worlds_user_saved_idx
on public.player_worlds (user_id, saved desc);
