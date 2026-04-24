-- Agregar columnas a companies para configuraciones específicas
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{
  "whatsapp": {
    "enabled": false,
    "instance_name": "",
    "use_global": true
  },
  "mercadopago": {
    "enabled": false,
    "public_key": "",
    "access_token": "",
    "use_global": true
  },
  "stripe": {
    "enabled": false,
    "public_key": "",
    "secret_key": "",
    "use_global": true
  }
}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_plan BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_limits JSONB DEFAULT NULL;

-- Actualizar empresas existentes
UPDATE companies SET integrations = '{
  "whatsapp": {"enabled": false, "instance_name": "", "use_global": true},
  "mercadopago": {"enabled": false, "public_key": "", "access_token": "", "use_global": true},
  "stripe": {"enabled": false, "public_key": "", "secret_key": "", "use_global": true}
}'::jsonb
WHERE integrations IS NULL;