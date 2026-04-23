-- 1. Asegurar la tabla de roles (company_users)
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- 2. Conectar la tabla de Pacientes (clients) con Autenticación (auth.users)
-- Solo la agregamos si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='clients' AND column_name='auth_user_id') THEN
        ALTER TABLE public.clients ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        CREATE INDEX idx_clients_auth_user ON public.clients(auth_user_id);
    END IF;
END $$;

-- 3. Reemplazar RLS estricto de current_setting() por políticas Multi-tenant robustas basadas en roles
-- Eliminamos políticas problemáticas
DROP POLICY IF EXISTS "tenant_isolation_select" ON public.clinical_notes;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON public.clinical_notes;
DROP POLICY IF EXISTS "tenant_isolation_update" ON public.clinical_notes;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON public.clinical_notes;

DROP POLICY IF EXISTS "tenant_isolation_select" ON public.client_conditions;
DROP POLICY IF EXISTS "tenant_isolation_insert" ON public.client_conditions;
DROP POLICY IF EXISTS "tenant_isolation_update" ON public.client_conditions;
DROP POLICY IF EXISTS "tenant_isolation_delete" ON public.client_conditions;

-- Nuevas políticas para Notas Clínicas (clinical_notes)
CREATE POLICY "tenant_view_clinical_notes" ON public.clinical_notes FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);
CREATE POLICY "tenant_insert_clinical_notes" ON public.clinical_notes FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);
CREATE POLICY "tenant_update_clinical_notes" ON public.clinical_notes FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);
CREATE POLICY "tenant_delete_clinical_notes" ON public.clinical_notes FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Nuevas políticas para Condiciones (client_conditions)
CREATE POLICY "tenant_view_client_conditions" ON public.client_conditions FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);
CREATE POLICY "tenant_insert_client_conditions" ON public.client_conditions FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);
CREATE POLICY "tenant_update_client_conditions" ON public.client_conditions FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);
CREATE POLICY "tenant_delete_client_conditions" ON public.client_conditions FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- 4. Asegurarnos que el paciente mismo pueda ver su propia información si inicia sesión
CREATE POLICY "patient_view_own_record" ON public.clients FOR SELECT USING (
  auth_user_id = auth.uid()
);