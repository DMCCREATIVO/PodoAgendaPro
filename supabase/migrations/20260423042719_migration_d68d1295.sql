-- =====================================================
-- CLINICAL NOTES TABLE FOR PATIENT RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('diagnosis', 'treatment', 'observation', 'prescription', 'follow_up', 'alert')),
  title TEXT,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_select ON clinical_notes
  FOR SELECT USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY tenant_isolation_insert ON clinical_notes
  FOR INSERT WITH CHECK (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY tenant_isolation_update ON clinical_notes
  FOR UPDATE USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY tenant_isolation_delete ON clinical_notes
  FOR DELETE USING (company_id = current_setting('app.current_company_id')::UUID);

-- Indexes
CREATE INDEX idx_clinical_notes_company_client ON clinical_notes(company_id, client_id, created_at DESC);
CREATE INDEX idx_clinical_notes_appointment ON clinical_notes(appointment_id);

-- =====================================================
-- CLIENT CONDITIONS/ALERTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS client_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('medical', 'allergy', 'medication', 'precaution')),
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE client_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_select ON client_conditions
  FOR SELECT USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY tenant_isolation_insert ON client_conditions
  FOR INSERT WITH CHECK (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY tenant_isolation_update ON client_conditions
  FOR UPDATE USING (company_id = current_setting('app.current_company_id')::UUID);

CREATE POLICY tenant_isolation_delete ON client_conditions
  FOR DELETE USING (company_id = current_setting('app.current_company_id')::UUID);

-- Indexes
CREATE INDEX idx_client_conditions_company_client ON client_conditions(company_id, client_id, is_active);

-- =====================================================
-- SEED DATA FOR DEMO PATIENT
-- =====================================================

-- Get demo company and client IDs
DO $$
DECLARE
  demo_company_id UUID;
  demo_client_id UUID;
  demo_user_id UUID;
  demo_appointment_id UUID;
BEGIN
  -- Get demo company
  SELECT id INTO demo_company_id FROM companies WHERE slug = 'clinica-demo-podos' LIMIT 1;
  
  IF demo_company_id IS NOT NULL THEN
    -- Get first demo client (María González)
    SELECT id INTO demo_client_id FROM clients WHERE company_id = demo_company_id AND name ILIKE '%María%' LIMIT 1;
    
    -- Get first user
    SELECT user_id INTO demo_user_id FROM company_users WHERE company_id = demo_company_id LIMIT 1;
    
    IF demo_client_id IS NOT NULL THEN
      -- Add medical conditions
      INSERT INTO client_conditions (company_id, client_id, condition_type, name, description, severity, created_by) VALUES
      (demo_company_id, demo_client_id, 'medical', 'Diabetes Tipo 2', 'Diagnosticada hace 8 años, controlada con medicación', 'high', demo_user_id),
      (demo_company_id, demo_client_id, 'medical', 'Hipertensión', 'Bajo control médico', 'medium', demo_user_id),
      (demo_company_id, demo_client_id, 'precaution', 'Pie diabético', 'Requiere cuidado especial en tratamientos', 'high', demo_user_id),
      (demo_company_id, demo_client_id, 'allergy', 'Látex', 'Alergia moderada al látex', 'medium', demo_user_id);
      
      -- Get a recent appointment
      SELECT id INTO demo_appointment_id FROM appointments 
      WHERE company_id = demo_company_id AND client_id = demo_client_id 
      ORDER BY created_at DESC LIMIT 1;
      
      -- Add clinical notes
      INSERT INTO clinical_notes (company_id, client_id, appointment_id, note_type, title, content, created_by, created_at) VALUES
      (demo_company_id, demo_client_id, demo_appointment_id, 'diagnosis', 'Hiperqueratosis plantar bilateral', 'Engrosamiento de la piel en zona de metatarsos. Relacionado con sobrecarga por calzado inadecuado.', demo_user_id, NOW() - INTERVAL '15 days'),
      (demo_company_id, demo_client_id, demo_appointment_id, 'treatment', 'Quiropodia + aplicación queratolítico', 'Tratamiento realizado: eliminación de hiperqueratosis con bisturí estéril. Aplicación de crema queratolítica 20% urea. Educación sobre calzado apropiado.', demo_user_id, NOW() - INTERVAL '15 days'),
      (demo_company_id, demo_client_id, demo_appointment_id, 'prescription', 'Crema queratolítica uso domiciliario', 'Indicado: Aplicar crema con urea 10% dos veces al día en zonas afectadas. Evitar entre dedos.', demo_user_id, NOW() - INTERVAL '15 days'),
      (demo_company_id, demo_client_id, demo_appointment_id, 'follow_up', 'Control en 4 semanas', 'Evaluar evolución de tratamiento. Si persiste hiperqueratosis, considerar plantillas ortopédicas.', demo_user_id, NOW() - INTERVAL '15 days'),
      (demo_company_id, demo_client_id, NULL, 'observation', 'Paciente muy colaboradora', 'Excelente adherencia a tratamientos. Sigue indicaciones al pie de la letra.', demo_user_id, NOW() - INTERVAL '30 days'),
      (demo_company_id, demo_client_id, NULL, 'alert', 'Monitorear sensibilidad', 'Por diabetes, revisar sensibilidad en cada consulta. Usar monofilamento.', demo_user_id, NOW() - INTERVAL '60 days');
    END IF;
  END IF;
END $$;