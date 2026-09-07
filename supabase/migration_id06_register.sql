-- Centralt ID06-register
create table if not exists id06_register (
  id uuid primary key default gen_random_uuid(),
  id06_nr text unique not null,
  namn text not null,
  foretag text,
  cert_el boolean not null default false,
  cert_vvs boolean not null default false,
  cert_vatten boolean not null default false,
  cert_tatskikt boolean not null default false,
  cert_gas boolean not null default false,
  cert_ovrigt text,
  skapad_tid timestamptz not null default now()
);

alter table id06_register enable row level security;

create policy "id06_register_select" on id06_register for select using (auth.role() = 'authenticated');
create policy "id06_register_insert" on id06_register for insert with check (auth.role() = 'authenticated');

-- Flytta befintliga personalliggare till registret
insert into id06_register (id06_nr, namn, foretag)
select distinct on (id06_nr) id06_nr, namn, foretag
from personalliggare
where id06_nr is not null and id06_nr != ''
on conflict (id06_nr) do nothing;

-- Lägg till nya kolumner i personalliggare
alter table personalliggare
  add column if not exists id06_register_id uuid references id06_register(id),
  add column if not exists bekraftad_av text,
  add column if not exists bekraftad_tid timestamptz;

-- Länka befintliga rader till registret
update personalliggare p
set id06_register_id = r.id
from id06_register r
where p.id06_nr = r.id06_nr and p.id06_register_id is null;
