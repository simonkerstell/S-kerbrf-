-- Tabell för flera bilder per steg
create table if not exists projekt_steg_bilder (
  id uuid primary key default gen_random_uuid(),
  steg_id uuid not null references projekt_steg(id) on delete cascade,
  url text not null,
  skapad_tid timestamptz not null default now()
);

alter table projekt_steg_bilder enable row level security;

create policy "bilder_select" on projekt_steg_bilder for select using (auth.role() = 'authenticated');
create policy "bilder_insert" on projekt_steg_bilder for insert with check (auth.role() = 'authenticated');
create policy "bilder_delete" on projekt_steg_bilder for delete using (auth.role() = 'authenticated');
