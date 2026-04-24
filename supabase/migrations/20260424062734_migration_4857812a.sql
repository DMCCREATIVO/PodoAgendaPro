-- Garantizar que las tablas críticas puedan ser leídas para evitar que los paneles fallen y causen loops
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas que puedan estar bloqueando
DROP POLICY IF EXISTS "public_read_users" ON public.users;
DROP POLICY IF EXISTS "public_read_company_users" ON public.company_users;
DROP POLICY IF EXISTS "public_read_companies" ON public.companies;
DROP POLICY IF EXISTS "superadmin_all_companies" ON public.companies;
DROP POLICY IF EXISTS "superadmin_all_company_users" ON public.company_users;

-- Crear políticas de lectura para asegurar que los paneles puedan cargar los roles y usuarios
CREATE POLICY "public_read_users" ON public.users FOR SELECT USING (true);
CREATE POLICY "public_read_company_users" ON public.company_users FOR SELECT USING (true);
CREATE POLICY "public_read_companies" ON public.companies FOR SELECT USING (true);

-- Permitir inserciones en users y company_users (necesario para cuando el SuperAdmin crea usuarios)
DROP POLICY IF EXISTS "allow_insert_users" ON public.users;
DROP POLICY IF EXISTS "allow_insert_company_users" ON public.company_users;
CREATE POLICY "allow_insert_users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_insert_company_users" ON public.company_users FOR INSERT WITH CHECK (true);