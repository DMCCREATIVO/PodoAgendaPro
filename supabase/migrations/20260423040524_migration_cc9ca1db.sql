-- =====================================================
-- PODOS PRO - MULTI-TENANT DATA TABLES
-- Adding company_id to all business tables
-- =====================================================

-- ================== CLIENTS ==================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('lead', 'active', 'inactive', 'blocked')),
  source TEXT,
  assigned_to UUID REFERENCES users(id),
  avatar_url TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  last_contact_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clients_company_email ON clients(company_id, email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_company_phone ON clients(company_id, phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_company_status ON clients(company_id, status, assigned_to) WHERE deleted_at IS NULL;

-- RLS for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clients from their companies"
  ON clients FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert clients in their companies"
  ON clients FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update clients in their companies"
  ON clients FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete clients in their companies"
  ON clients FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

-- ================== SERVICES ==================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  price DECIMAL(10,2),
  color TEXT DEFAULT '#2563EB',
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  buffer_minutes INT DEFAULT 0,
  max_advance_days INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_company_active ON services(company_id, is_active);

-- RLS for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view services from their companies"
  ON services FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ================== SCHEDULES ==================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id, day_of_week, start_time)
);

CREATE INDEX IF NOT EXISTS idx_schedules_company_user ON schedules(company_id, user_id, is_active);

-- RLS for schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules from their companies"
  ON schedules FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage schedules"
  ON schedules FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ================== APPOINTMENTS ==================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  cancellation_reason TEXT,
  notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_company_scheduled ON appointments(company_id, scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_appointments_company_assigned ON appointments(company_id, assigned_to, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_company_client ON appointments(company_id, client_id);

-- RLS for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appointments from their companies"
  ON appointments FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert appointments in their companies"
  ON appointments FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments in their companies"
  ON appointments FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments in their companies"
  ON appointments FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ================== SEED DATA ==================
-- Insert demo services for the demo company
INSERT INTO services (company_id, name, description, duration_minutes, price, color)
SELECT 
  c.id,
  'Consulta Podológica',
  'Evaluación completa del estado de los pies',
  45,
  25000,
  '#2563EB'
FROM companies c
WHERE c.slug = 'clinica-demo-podos'
ON CONFLICT DO NOTHING;

INSERT INTO services (company_id, name, description, duration_minutes, price, color)
SELECT 
  c.id,
  'Quiropodia',
  'Tratamiento de uñas y callosidades',
  30,
  20000,
  '#22C55E'
FROM companies c
WHERE c.slug = 'clinica-demo-podos'
ON CONFLICT DO NOTHING;

INSERT INTO services (company_id, name, description, duration_minutes, price, color)
SELECT 
  c.id,
  'Plantillas Personalizadas',
  'Estudio biomecánico y plantillas a medida',
  60,
  45000,
  '#F59E0B'
FROM companies c
WHERE c.slug = 'clinica-demo-podos'
ON CONFLICT DO NOTHING;

INSERT INTO services (company_id, name, description, duration_minutes, price, color)
SELECT 
  c.id,
  'Tratamiento Pie Diabético',
  'Cuidados especializados para pie diabético',
  50,
  35000,
  '#EF4444'
FROM companies c
WHERE c.slug = 'clinica-demo-podos'
ON CONFLICT DO NOTHING;

-- Insert demo clients
INSERT INTO clients (company_id, name, email, phone, whatsapp, status, source, tags, notes)
SELECT 
  c.id,
  'Ana Silva',
  'ana.silva@email.com',
  '+56912345678',
  '+56912345678',
  'active',
  'web',
  ARRAY['vip'],
  'Cliente frecuente, prefiere horarios matutinos'
FROM companies c
WHERE c.slug = 'clinica-demo-podos'
ON CONFLICT DO NOTHING;

INSERT INTO clients (company_id, name, email, phone, whatsapp, status, source, tags)
SELECT 
  c.id,
  'Carlos López',
  'carlos.lopez@email.com',
  '+56987654321',
  '+56987654321',
  'active',
  'referral',
  ARRAY['nuevo']
FROM companies c
WHERE c.slug = 'clinica-demo-podos'
ON CONFLICT DO NOTHING;

INSERT INTO clients (company_id, name, email, phone, whatsapp, status, source, tags, notes)
SELECT 
  c.id,
  'María González',
  'maria.gonzalez@email.com',
  '+56911223344',
  '+56911223344',
  'active',
  'whatsapp',
  ARRAY['diabetico'],
  'Paciente diabético - requiere cuidado especial'
FROM companies c
WHERE c.slug = 'clinica-demo-podos'
ON CONFLICT DO NOTHING;