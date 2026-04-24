-- Permitir a SuperAdmins ver todas las empresas
CREATE POLICY "superadmin_all_companies" ON companies 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_superadmin = true
  )
);

-- Permitir a SuperAdmins ver todos los roles (company_users)
CREATE POLICY "superadmin_all_company_users" ON company_users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_superadmin = true
  )
);