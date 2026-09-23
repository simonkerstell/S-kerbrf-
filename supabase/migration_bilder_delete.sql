-- Tillåt autentiserade att ta bort bilder ur storage-bucketen (DB-raden hade redan delete-policy)
-- Körs i Supabase SQL-editorn.

create policy "Autentiserade kan ta bort bilder" on storage.objects
  for delete using (bucket_id = 'bilder' and auth.role() = 'authenticated');
