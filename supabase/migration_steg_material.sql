create table if not exists steg_material (
  id uuid primary key default gen_random_uuid(),
  steg_id uuid not null references projekt_steg(id) on delete cascade,
  material text not null,
  mangd numeric,
  enhet text,
  skapad_tid timestamptz not null default now()
);

alter table steg_material enable row level security;

create policy "steg_material_select" on steg_material for select using (auth.role() = 'authenticated');
create policy "steg_material_insert" on steg_material for insert with check (auth.role() = 'authenticated');
create policy "steg_material_delete" on steg_material for delete using (auth.role() = 'authenticated');
