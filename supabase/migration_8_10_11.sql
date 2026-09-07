-- #11: Branschregler per steg i mallen
alter table mall_steg add column if not exists branschregler text;

-- #8: Underrubriker på mall-steg (defineras i mallen)
create table if not exists mall_steg_delar (
  id uuid primary key default gen_random_uuid(),
  mall_steg_id uuid not null references mall_steg(id) on delete cascade,
  rubrik text not null,
  ordning int not null default 1,
  skapad_tid timestamptz not null default now()
);
alter table mall_steg_delar enable row level security;
create policy "delar_select" on mall_steg_delar for select using (auth.role() = 'authenticated');
create policy "delar_insert" on mall_steg_delar for insert with check (auth.role() = 'authenticated');
create policy "delar_delete" on mall_steg_delar for delete using (auth.role() = 'authenticated');

-- #8: Avbockningsstatus per projekt-steg
create table if not exists projekt_steg_delar_klar (
  id uuid primary key default gen_random_uuid(),
  projekt_steg_id uuid not null references projekt_steg(id) on delete cascade,
  mall_steg_del_id uuid not null references mall_steg_delar(id) on delete cascade,
  klar boolean not null default false,
  unique(projekt_steg_id, mall_steg_del_id)
);
alter table projekt_steg_delar_klar enable row level security;
create policy "delar_klar_select" on projekt_steg_delar_klar for select using (auth.role() = 'authenticated');
create policy "delar_klar_upsert" on projekt_steg_delar_klar for insert with check (auth.role() = 'authenticated');
create policy "delar_klar_update" on projekt_steg_delar_klar for update using (auth.role() = 'authenticated');

-- #10: Underentreprenörer per projekt
create table if not exists projekt_ue (
  id uuid primary key default gen_random_uuid(),
  projekt_id uuid not null references projekt(id) on delete cascade,
  foretag text not null,
  kontaktperson text,
  telefon text,
  typ_arbete text,
  datum date not null default current_date,
  skapad_tid timestamptz not null default now()
);
alter table projekt_ue enable row level security;
create policy "ue_select" on projekt_ue for select using (auth.role() = 'authenticated');
create policy "ue_insert" on projekt_ue for insert with check (auth.role() = 'authenticated');
create policy "ue_delete" on projekt_ue for delete using (auth.role() = 'authenticated');
