-- ════════════════════════════════════════════════════════════
-- (OPCIONAL) Políticas de Supabase Storage
-- ════════════════════════════════════════════════════════════
-- El proyecto usa Cloudinary para subir imágenes/videos (como
-- pediste, "mantener Cloudinary solo para subir imágenes y
-- videos"), así que este archivo NO es necesario para que todo
-- funcione.
--
-- Se incluye por si en el futuro quieres migrar también el
-- almacenamiento de medios a Supabase Storage y dejar de depender
-- de Cloudinary. Bastaría con:
--   1. Crear un bucket llamado "product-media" (público para
--      lectura) desde el dashboard de Supabase → Storage.
--   2. Ejecutar las políticas de abajo.
--   3. Reemplazar las llamadas a `uploadToCloudinary` en
--      `src/lib/uploadMedia.ts` por `supabase.storage.from(...)`.
-- ════════════════════════════════════════════════════════════

-- Lectura pública del bucket (cualquiera puede ver las imágenes).
drop policy if exists "Lectura pública de product-media" on storage.objects;
create policy "Lectura pública de product-media"
  on storage.objects for select
  using (bucket_id = 'product-media');

-- Solo usuarios autenticados pueden subir archivos.
drop policy if exists "Solo admin sube archivos" on storage.objects;
create policy "Solo admin sube archivos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-media');

-- Solo el usuario que subió el archivo puede borrarlo.
drop policy if exists "Solo el owner borra sus archivos" on storage.objects;
create policy "Solo el owner borra sus archivos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-media' and owner = auth.uid());
