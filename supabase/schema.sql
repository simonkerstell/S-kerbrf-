-- Säker BRF – databasschema och RLS
-- Kör detta i Supabase SQL-editor för ett nytt projekt

-- Profiler (utökar auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  roll text not null check (roll in ('ordforande')),
  namn text not null,
  email text not null,
  skapad_tid timestamptz default now()
);

alter table profiles enable row level security;
create policy "Användare ser sin egen profil" on profiles for select using (auth.uid() = id);
create policy "Användare uppdaterar sin profil" on profiles for update using (auth.uid() = id);

-- Mallar
create table if not exists mallar (
  id uuid primary key default gen_random_uuid(),
  namn text not null,
  beskrivning text,
  skapad_tid timestamptz default now()
);

alter table mallar enable row level security;
create policy "Alla inloggade ser mallar" on mallar for select using (auth.role() = 'authenticated');
create policy "Alla kan skapa mallar" on mallar for insert with check (auth.role() = 'authenticated');
create policy "Alla kan uppdatera mallar" on mallar for update using (auth.role() = 'authenticated');

-- Mall-steg
create table if not exists mall_steg (
  id uuid primary key default gen_random_uuid(),
  mall_id uuid not null references mallar on delete cascade,
  ordning int not null,
  rubrik text not null,
  instruktion text not null,
  skapad_tid timestamptz default now()
);

alter table mall_steg enable row level security;
create policy "Alla inloggade ser mall-steg" on mall_steg for select using (auth.role() = 'authenticated');
create policy "Alla kan skapa mall-steg" on mall_steg for insert with check (auth.role() = 'authenticated');
create policy "Alla kan uppdatera mall-steg" on mall_steg for update using (auth.role() = 'authenticated');
create policy "Alla kan ta bort mall-steg" on mall_steg for delete using (auth.role() = 'authenticated');

-- Projekt
create table if not exists projekt (
  id uuid primary key default gen_random_uuid(),
  mall_id uuid not null references mallar,
  brf_adress text not null,
  status text not null default 'pagaende' check (status in ('pagaende', 'klar', 'godkand', 'underkand')),
  skapad_av uuid not null references profiles,
  skapad_tid timestamptz default now()
);

alter table projekt enable row level security;
create policy "Ordforande ser egna projekt" on projekt
  for select using (auth.uid() = skapad_av);
create policy "Ordforande skapar projekt" on projekt
  for insert with check (auth.uid() = skapad_av);
create policy "Ordforande uppdaterar egna projekt" on projekt
  for update using (auth.uid() = skapad_av);

-- Projekt-steg
create table if not exists projekt_steg (
  id uuid primary key default gen_random_uuid(),
  projekt_id uuid not null references projekt on delete cascade,
  mall_steg_id uuid not null references mall_steg,
  bild_url text,
  signerad_av text,
  signerad_tid timestamptz,
  status text not null default 'ej_paborjad' check (status in ('ej_paborjad', 'klar', 'godkand', 'underkand')),
  kommentar text,
  noteringar text,
  uppdaterad_tid timestamptz default now()
);

alter table projekt_steg enable row level security;
create policy "Se egna projekt-steg" on projekt_steg
  for select using (
    exists (select 1 from projekt p where p.id = projekt_id and p.skapad_av = auth.uid())
  );
create policy "Uppdatera egna projekt-steg" on projekt_steg
  for update using (
    exists (select 1 from projekt p where p.id = projekt_id and p.skapad_av = auth.uid())
  );
create policy "Skapa projekt-steg" on projekt_steg
  for insert with check (
    exists (select 1 from projekt p where p.id = projekt_id and p.skapad_av = auth.uid())
  );

-- PDF-dokument
create table if not exists pdf_dokument (
  id uuid primary key default gen_random_uuid(),
  projekt_id uuid not null references projekt on delete cascade,
  fil_url text not null,
  skapad_tid timestamptz default now()
);

alter table pdf_dokument enable row level security;
create policy "Se egna PDF" on pdf_dokument
  for select using (
    exists (select 1 from projekt p where p.id = projekt_id and p.skapad_av = auth.uid())
  );
create policy "Spara PDF" on pdf_dokument
  for insert with check (auth.role() = 'authenticated');

-- Storage: bilder (publik bucket, URL:er innehåller UUID:er)
insert into storage.buckets (id, name, public)
values ('bilder', 'bilder', true)
on conflict (id) do update set public = true;

create policy "Autentiserade kan ladda upp bilder" on storage.objects
  for insert with check (bucket_id = 'bilder' and auth.role() = 'authenticated');
create policy "Alla kan se bilder" on storage.objects
  for select using (bucket_id = 'bilder');
create policy "Autentiserade kan uppdatera bilder" on storage.objects
  for update using (bucket_id = 'bilder' and auth.role() = 'authenticated');

-- Storage: pdf
insert into storage.buckets (id, name, public)
values ('pdf', 'pdf', false)
on conflict (id) do nothing;

create policy "Autentiserade kan ladda upp PDF" on storage.objects
  for insert with check (bucket_id = 'pdf' and auth.role() = 'authenticated');
create policy "Autentiserade kan se PDF" on storage.objects
  for select using (bucket_id = 'pdf' and auth.role() = 'authenticated');
