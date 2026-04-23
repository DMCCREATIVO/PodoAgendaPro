-- Eliminar todas las políticas actuales de company_users
DROP POLICY IF EXISTS "Users can view their own company memberships" ON company_users;
DROP POLICY IF EXISTS "Company admins can manage users" ON company_users;
DROP POLICY IF EXISTS "Users can view active memberships" ON company_users;
DROP POLICY IF EXISTS "Admins can insert users" ON company_users;
DROP POLICY IF EXISTS "Admins can update users" ON company_users;
DROP POLICY IF EXISTS "Admins can delete users" ON company_users;

-- Crear políticas simples SIN recursión
-- SELECT: Los usuarios pueden ver sus propias membresías
CREATE POLICY "select_own_memberships" ON company_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Solo admins/owners pueden agregar usuarios
CREATE POLICY "insert_by_admin" ON company_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users cu
      WHERE cu.company_id = company_users.company_id
        AND cu.user_id = auth.uid()
        AND cu.role IN ('owner', 'admin')
        AND cu.status = 'active'
    )
  );

-- UPDATE: Solo admins/owners pueden actualizar
CREATE POLICY "update_by_admin" ON company_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu
      WHERE cu.company_id = company_users.company_id
        AND cu.user_id = auth.uid()
        AND cu.role IN ('owner', 'admin')
        AND cu.status = 'active'
    )
  );

-- DELETE: Solo owners pueden eliminar
CREATE POLICY "delete_by_owner" ON company_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM company_users cu
      WHERE cu.company_id = company_users.company_id
        AND cu.user_id = auth.uid()
        AND cu.role = 'owner'
        AND cu.status = 'active'
    )
  );

-- Verificar que se crearon correctamente
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'company_users';