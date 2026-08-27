-- Migration: byt roll till ordforande, lägg till noteringar, fixa storage
-- Kör i Supabase SQL-editor

-- 1. Uppdatera roll-constraint på profiles
alter table profiles drop constraint if exists profiles_roll_check;
alter table profiles add constraint profiles_roll_check check (roll in ('ordforande'));

-- 2. Lägg till noteringar-kolumn på projekt_steg (om den inte finns)
alter table projekt_steg add column if not exists noteringar text;

-- 3. Uppdatera befintliga konton till ordforande (om du har testanvändare)
update profiles set roll = 'ordforande' where roll in ('hantverkare', 'besiktningsman');

-- 4. Droppa gamla RLS-policies på projekt (refererade besiktningsman)
drop policy if exists "Hantverkare ser egna projekt" on projekt;
drop policy if exists "Hantverkare skapar projekt" on projekt;
drop policy if exists "Hantverkare uppdaterar egna, besiktningsman alla" on projekt;

-- 5. Nya RLS-policies på projekt (bara ordforande, ser sina egna)
create policy "Ordforande ser egna projekt" on projekt
  for select using (auth.uid() = skapad_av);

create policy "Ordforande skapar projekt" on projekt
  for insert with check (auth.uid() = skapad_av);

create policy "Ordforande uppdaterar egna projekt" on projekt
  for update using (auth.uid() = skapad_av);

-- 6. Droppa gamla RLS-policies på projekt_steg
drop policy if exists "Se projekt-steg via projekt" on projekt_steg;
drop policy if exists "Hantverkare uppdaterar egna steg" on projekt_steg;
drop policy if exists "Skapa projekt-steg" on projekt_steg;

-- 7. Nya RLS-policies på projekt_steg
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

-- 8. Droppa gamla RLS-policies på pdf_dokument
drop policy if exists "Se PDF via projekt" on pdf_dokument;

-- 9. Ny RLS-policy på pdf_dokument
create policy "Se egna PDF" on pdf_dokument
  for select using (
    exists (select 1 from projekt p where p.id = projekt_id and p.skapad_av = auth.uid())
  );

-- 10. Storage: skapa bilder-bucket som publik (kör om den inte finns)
insert into storage.buckets (id, name, public)
values ('bilder', 'bilder', true)
on conflict (id) do update set public = true;

-- 11. Storage: skapa pdf-bucket (privat räcker, används via signerade URL:er eller server)
insert into storage.buckets (id, name, public)
values ('pdf', 'pdf', false)
on conflict (id) do nothing;

-- 12. Storage policies för bilder-bucketen
drop policy if exists "Autentiserade kan ladda upp bilder" on storage.objects;
drop policy if exists "Autentiserade kan se bilder" on storage.objects;
drop policy if exists "Autentiserade kan uppdatera bilder" on storage.objects;

create policy "Autentiserade kan ladda upp bilder" on storage.objects
  for insert with check (bucket_id = 'bilder' and auth.role() = 'authenticated');

create policy "Alla kan se bilder" on storage.objects
  for select using (bucket_id = 'bilder');

create policy "Autentiserade kan uppdatera bilder" on storage.objects
  for update using (bucket_id = 'bilder' and auth.role() = 'authenticated');

-- 13. Storage policies för pdf-bucketen
drop policy if exists "Autentiserade kan ladda upp PDF" on storage.objects;
drop policy if exists "Autentiserade kan se PDF" on storage.objects;

create policy "Autentiserade kan ladda upp PDF" on storage.objects
  for insert with check (bucket_id = 'pdf' and auth.role() = 'authenticated');

create policy "Autentiserade kan se PDF" on storage.objects
  for select using (bucket_id = 'pdf' and auth.role() = 'authenticated');
