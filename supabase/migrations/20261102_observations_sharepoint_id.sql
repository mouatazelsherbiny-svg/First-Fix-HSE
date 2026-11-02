-- Link observations back to their original SharePoint list item ID
-- (used by the photo migration to attach SharePoint photos to observations).
alter table public.observations add column if not exists sharepoint_id integer;
alter table public.observations add constraint observations_sharepoint_id_key unique (sharepoint_id);
