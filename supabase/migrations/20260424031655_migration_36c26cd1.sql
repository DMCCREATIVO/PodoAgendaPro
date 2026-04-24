-- Crear bucket para logos en Supabase Storage (via SQL)
-- Nota: Los buckets se crean mejor desde el panel de Supabase, 
-- pero registramos la estructura aquí
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: todos pueden leer
CREATE POLICY "public_read_logos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'company-logos');

-- Política: autenticados pueden subir
CREATE POLICY "authenticated_upload_logos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'company-logos');

-- Política: autenticados pueden actualizar
CREATE POLICY "authenticated_update_logos" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'company-logos');