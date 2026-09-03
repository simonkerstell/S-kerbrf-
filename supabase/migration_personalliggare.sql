create table if not exists personalliggare (
  id uuid primary key default gen_random_uuid(),
  projekt_id uuid not null references projekt(id) on delete cascade,
  namn text not null,
  foretag text,
  id06_nr text,
  datum date not null default current_date,
  skapad_tid timestamptz not null default now()
);

alter table personalliggare enable row level security;

create policy "personalliggare_select" on personalliggare for select using (auth.role() = 'authenticated');
create policy "personalliggare_insert" on personalliggare for insert with check (auth.role() = 'authenticated');
create policy "personalliggare_delete" on personalliggare for delete using (auth.role() = 'authenticated');
