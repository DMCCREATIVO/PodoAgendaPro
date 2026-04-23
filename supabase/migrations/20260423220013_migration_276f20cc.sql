-- Agregar política RLS para que SuperAdmins puedan leer todos los usuarios
CREATE POLICY "SuperAdmins can read all users"
ON public.users
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.is_superadmin = true
  )
);

-- Verificar que se creó correctamente
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;