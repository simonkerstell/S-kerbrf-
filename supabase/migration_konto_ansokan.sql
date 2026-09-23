-- Ansök om konto: publikt formulär sparar ansökningar som godkänns manuellt (via scripts/konto.mjs)
-- Körs i Supabase SQL-editorn.

create table if not exists konto_ansokan (
  id uuid primary key default gen_random_uuid(),
  namn text not null,
  email text not null,
  brf_namn text,
  telefon text,
  meddelande text,
  status text not null default 'vantar' check (status in ('vantar', 'godkand', 'avvisad')),
  skapad_tid timestamptz not null default now(),
  hanterad_tid timestamptz
);

alter table konto_ansokan enable row level security;

-- Vem som helst (ej inloggad) får skicka in en ansökan.
-- Ingen select-policy: ansökningar läses endast med service-nyckeln (godkännande-scriptet).
create policy "Alla kan ansoka om konto" on konto_ansokan
  for insert with check (true);
