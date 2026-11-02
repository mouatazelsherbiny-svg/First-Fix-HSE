-- Private bucket for observation photos (served to the app via signed URLs).
insert into storage.buckets (id, name, public) values ('observation-photos', 'observation-photos', false)
  on conflict (id) do update set public = false;

-- One row per photo linked to an observation. The same storage object can be
-- linked to several observations (duplicate SharePoint photos are stored once).
create table if not exists public.observation_photos (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  photo_type text not null check (photo_type in ('observation', 'close_out')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (observation_id, photo_type, storage_path)
);
create index if not exists observation_photos_observation_id_idx on public.observation_photos (observation_id);

alter table public.observation_photos enable row level security;
create policy "observation_photos readable by approved users" on public.observation_photos
  for select to authenticated using ((select is_approved_user()));
