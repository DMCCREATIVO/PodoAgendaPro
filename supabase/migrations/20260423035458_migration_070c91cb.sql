-- =====================================================
-- PODOS PRO - MULTI-TENANT CORE TABLES
-- =====================================================

-- 1. PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '{}'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMPANIES TABLE (Tenants)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  industry TEXT,
  timezone TEXT DEFAULT 'America/Santiago',
  country_code TEXT DEFAULT 'CL',
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  plan_status TEXT DEFAULT 'trial' CHECK (plan_status IN ('trial', 'active', 'suspended', 'cancelled')),
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3. COMPANY_USERS TABLE (Pivot - Multi-tenant access)
CREATE TABLE IF NOT EXISTS company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'employee', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Plans indexes
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_plan_status ON companies(plan_status, is_active);
CREATE INDEX IF NOT EXISTS idx_companies_plan_id ON companies(plan_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active) WHERE deleted_at IS NULL;

-- Company_users indexes (critical for multi-tenant queries)
CREATE INDEX IF NOT EXISTS idx_company_users_company ON company_users(company_id, status);
CREATE INDEX IF NOT EXISTS idx_company_users_user ON company_users(user_id, status);
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users(company_id, role);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Plans: Public read (para página pricing)
CREATE POLICY "Plans are viewable by everyone" ON plans
  FOR SELECT USING (is_active = true);

-- Companies: Users can only see companies they belong to
CREATE POLICY "Users can view their companies" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update their companies if admin/owner" ON companies
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() 
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- Company_users: Users can see their own memberships
CREATE POLICY "Users can view their company memberships" ON company_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage company users" ON company_users
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid() 
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at BEFORE UPDATE ON company_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create company owner when company is created
CREATE OR REPLACE FUNCTION create_company_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- If created by an authenticated user, make them owner
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO company_users (company_id, user_id, role, status, accepted_at)
    VALUES (NEW.id, auth.uid(), 'owner', 'active', NOW())
    ON CONFLICT (company_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_create_company_owner AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION create_company_owner();

-- =====================================================
-- SEED DATA - PLANS
-- =====================================================

INSERT INTO plans (name, slug, description, price_monthly, price_yearly, features, limits, sort_order)
VALUES 
  (
    'Free',
    'free',
    'Plan gratuito para probar el sistema',
    0,
    0,
    '{"modules": ["crm", "agenda"], "support": "email", "branding": false}'::jsonb,
    '{"users": 1, "clients": 50, "appointments_monthly": 100, "storage_gb": 1}'::jsonb,
    1
  ),
  (
    'Starter',
    'starter',
    'Plan inicial para pequeños negocios',
    29,
    290,
    '{"modules": ["crm", "agenda", "whatsapp"], "support": "email", "branding": true, "automations": 5}'::jsonb,
    '{"users": 3, "clients": 500, "appointments_monthly": 1000, "whatsapp_instances": 1, "storage_gb": 10}'::jsonb,
    2
  ),
  (
    'Pro',
    'pro',
    'Plan profesional con todas las funcionalidades',
    99,
    990,
    '{"modules": ["crm", "agenda", "whatsapp", "ai", "automations", "campaigns"], "support": "priority", "branding": true, "custom_domain": true, "automations": 50}'::jsonb,
    '{"users": 10, "clients": -1, "appointments_monthly": -1, "whatsapp_instances": 5, "ai_messages_monthly": 10000, "storage_gb": 100}'::jsonb,
    3
  ),
  (
    'Enterprise',
    'enterprise',
    'Plan empresarial con soporte dedicado',
    299,
    2990,
    '{"modules": ["all"], "support": "dedicated", "branding": true, "custom_domain": true, "automations": -1, "api_access": true, "sla": true}'::jsonb,
    '{"users": -1, "clients": -1, "appointments_monthly": -1, "whatsapp_instances": -1, "ai_messages_monthly": -1, "storage_gb": -1}'::jsonb,
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- =====================================================
-- SEED DATA - DEMO COMPANY
-- =====================================================

-- Insert demo company (will be used for current mock data)
INSERT INTO companies (
  name, 
  slug, 
  logo_url,
  industry, 
  timezone,
  country_code,
  phone,
  email,
  address,
  plan_id,
  plan_status,
  trial_ends_at,
  settings
)
SELECT
  'PODOS PRO Demo',
  'podos-pro-demo',
  '/logo.png',
  'healthcare',
  'America/Santiago',
  'CL',
  '+56 2 1234 5678',
  'contacto@podospro.cl',
  'Av. Principal 123, Santiago',
  id,
  'active',
  NOW() + INTERVAL '30 days',
  '{
    "branding": {
      "primary_color": "#2563EB",
      "logo_url": "/logo.png"
    },
    "business_hours": {
      "monday": {"start": "09:00", "end": "18:00"},
      "tuesday": {"start": "09:00", "end": "18:00"},
      "wednesday": {"start": "09:00", "end": "18:00"},
      "thursday": {"start": "09:00", "end": "18:00"},
      "friday": {"start": "09:00", "end": "18:00"},
      "saturday": {"start": "09:00", "end": "13:00"}
    },
    "notifications": {
      "email_reminders": true,
      "whatsapp_reminders": true
    }
  }'::jsonb
FROM plans
WHERE slug = 'pro'
ON CONFLICT (slug) DO NOTHING;