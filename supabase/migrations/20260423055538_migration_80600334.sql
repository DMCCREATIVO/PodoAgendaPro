-- =====================================================
-- SUPERADMIN ROLE & PERMISSIONS SYSTEM
-- =====================================================

-- Add superadmin flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;

-- Create superadmin_actions audit log
CREATE TABLE IF NOT EXISTS superadmin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'company_created', 'company_suspended', 'plan_changed', etc.
  target_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE superadmin_actions ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read audit log
CREATE POLICY "superadmin_read_actions" ON superadmin_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_superadmin = true
    )
  );

-- Add company status and customization fields
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Add branding customization to metadata (already JSONB, just document structure)
-- companies.metadata should contain:
-- {
--   "branding": {
--     "primary_color": "#2563EB",
--     "secondary_color": "#22C55E",
--     "logo_url": "https://...",
--     "favicon_url": "https://...",
--     "custom_domain": "clinica.podospro.com"
--   },
--   "settings": {
--     "booking_enabled": true,
--     "requires_approval": false,
--     "auto_reminders": true
--   }
-- }

-- Create system_settings table for global config
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only superadmins can manage system settings
CREATE POLICY "superadmin_manage_settings" ON system_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_superadmin = true
    )
  );

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "Sistema en mantenimiento"}', 'Control de modo mantenimiento'),
  ('registration_enabled', '{"enabled": true, "require_approval": false}', 'Control de registro de nuevas clínicas'),
  ('default_trial_days', '{"days": 14}', 'Días de trial por defecto'),
  ('email_settings', '{"smtp_host": "", "smtp_port": 587, "from_email": "noreply@podospro.com"}', 'Configuración de emails')
ON CONFLICT (key) DO NOTHING;

-- Create demo superadmin user (will be created via companyService after this)
-- We'll mark an existing user as superadmin in the next migration if needed

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_admin ON superadmin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_actions_company ON superadmin_actions(target_company_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_users_superadmin ON users(is_superadmin) WHERE is_superadmin = true;

COMMENT ON TABLE superadmin_actions IS 'Audit log of all superadmin actions for compliance and tracking';
COMMENT ON TABLE system_settings IS 'Global system configuration accessible only by superadmins';