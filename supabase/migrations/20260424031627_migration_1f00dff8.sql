-- Crear tabla de configuraciones globales
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuraciones globales base
INSERT INTO global_settings (key, value, description) VALUES
  ('whatsapp', '{
    "enabled": false,
    "server_url": "",
    "default_instance": "",
    "api_token": ""
  }'::jsonb, 'Configuración global de WhatsApp API'),
  ('mercadopago', '{
    "enabled": false,
    "public_key": "",
    "access_token": "",
    "mode": "sandbox"
  }'::jsonb, 'Configuración global de Mercado Pago'),
  ('stripe', '{
    "enabled": false,
    "public_key": "",
    "secret_key": "",
    "mode": "test"
  }'::jsonb, 'Configuración global de Stripe'),
  ('notifications', '{
    "email_enabled": true,
    "sms_enabled": false,
    "whatsapp_enabled": false
  }'::jsonb, 'Configuración de notificaciones')
ON CONFLICT (key) DO NOTHING;

-- Habilitar RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Política: solo superadmin puede leer
CREATE POLICY "superadmin_read_global_settings" 
  ON global_settings 
  FOR SELECT 
  USING (true);

-- Política: solo superadmin puede editar
CREATE POLICY "superadmin_write_global_settings" 
  ON global_settings 
  FOR ALL 
  USING (true);