-- Habilitar RLS en la tabla users (si no está habilitado)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Eliminar política anterior si existe para evitar duplicados
DROP POLICY IF EXISTS "anon_read_users_for_login" ON users;

-- Crear política que permite SELECT para login (sin autenticación)
CREATE POLICY "anon_read_users_for_login" 
  ON users 
  FOR SELECT 
  USING (true);