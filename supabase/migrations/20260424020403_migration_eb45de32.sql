-- Primero, agregar columnas faltantes a la tabla companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'trial' CHECK (plan_status IN ('trial', 'active', 'suspended', 'cancelled')),
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_podiatrists INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS max_monthly_appointments INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days');

-- Actualizar empresas existentes con slug generado
UPDATE companies 
SET slug = LOWER(REPLACE(name, ' ', '-')) || '-' || SUBSTRING(id::TEXT FROM 1 FOR 4)
WHERE slug IS NULL;