-- users table for public profile
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_superadmin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  base_price DECIMAL DEFAULT 0,
  is_core BOOLEAN DEFAULT false,
  config_schema JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- company_modules table
CREATE TABLE IF NOT EXISTS company_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, module_id)
);

-- RLS policies for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
-- allow insert during signup trigger or manual from server
CREATE POLICY "Anon or authenticated can insert users" ON users FOR INSERT WITH CHECK (true);

-- RLS for modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules are visible to everyone" ON modules FOR SELECT USING (true);

-- RLS for company_modules
ALTER TABLE company_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company modules" ON company_modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.company_id = company_modules.company_id AND cu.user_id = auth.uid()
  )
);
CREATE POLICY "Company admins can manage company modules" ON company_modules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.company_id = company_modules.company_id AND cu.user_id = auth.uid() AND cu.role IN ('owner', 'admin')
  )
);

-- Seed core modules
INSERT INTO modules (key, name, description, is_core) VALUES
('crm', 'CRM & Clientes', 'Gestión de pacientes e historial clínico', true),
('agenda', 'Agenda Inteligente', 'Reserva de citas y disponibilidad', true),
('settings', 'Configuración', 'Configuración general de la clínica', true)
ON CONFLICT (key) DO NOTHING;