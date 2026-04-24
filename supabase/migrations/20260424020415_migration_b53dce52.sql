-- Agregar columna de contraseña por defecto a companies (para el owner inicial)
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS default_admin_password TEXT DEFAULT 'Admin123!';

-- Agregar columnas de actividad a users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by TEXT;