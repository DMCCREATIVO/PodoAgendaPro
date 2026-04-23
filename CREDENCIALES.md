# 🔐 CREDENCIALES DE ACCESO - PODOS PRO

## 👑 SUPERADMIN (Acceso Global)

**URL de Acceso:** `/auth`

**Credenciales:**
- **Email:** `superadmin@podospro.com`
- **Contraseña:** `PodosPro2024!Super`

**Panel:** Una vez autenticado, serás redirigido automáticamente a `/superadmin`

**Permisos:**
- Ver todas las empresas del sistema
- Crear/editar/suspender empresas
- Gestionar usuarios globales
- Configurar planes y precios
- Acceder a estadísticas globales
- Configuración del sistema

---

## 🏢 EMPRESA DEMO (Centro PodoSalud)

**URL Pública de la Empresa:** `/centro-podosalud`
**URL de Login:** `/centro-podosalud/auth`

### Administrador (Owner)
- **Email:** `admin@centropodosalud.cl`
- **Contraseña:** `Admin123!`
- **Panel:** `/admin`

### Podólogo Principal
- **Email:** `dra.martinez@centropodosalud.cl`
- **Contraseña:** `Podo123!`
- **Panel:** `/podologo`

### Podólogo Secundario
- **Email:** `dr.gonzalez@centropodosalud.cl`
- **Contraseña:** `Podo123!`
- **Panel:** `/podologo`

### Paciente 1
- **Email:** `juan.perez@email.com`
- **Contraseña:** `Paciente123!`
- **Panel:** `/cliente`

### Paciente 2
- **Email:** `maria.lopez@email.com`
- **Contraseña:** `Paciente123!`
- **Panel:** `/cliente`

---

## 🎯 FLUJO DE ACCESO POR ROL

### SuperAdmin
1. Ir a `/auth`
2. Login con credenciales de SuperAdmin
3. Redirección automática a `/superadmin`
4. Desde ahí puede ver un enlace en cada empresa demo para "Ir a Panel Admin"

### Administrador de Empresa
1. Ir a `/centro-podosalud/auth` (URL de su empresa)
2. Login con credenciales de Admin
3. Redirección automática a `/centro-podosalud/admin`
4. Puede gestionar toda su clínica

### Podólogo
1. Ir a `/centro-podosalud/auth`
2. Seleccionar rol "Podólogo" en el selector visual
3. Login con credenciales de Podólogo
4. Redirección automática a `/centro-podosalud/podologo`
5. Puede atender pacientes y ver su agenda

### Paciente
1. Ir a `/centro-podosalud/auth`
2. Seleccionar rol "Paciente" en el selector visual
3. Login con credenciales de Paciente
4. Redirección automática a `/centro-podosalud/cliente`
5. Puede ver sus citas e historial

---

## 🆕 CREAR NUEVA EMPRESA

### Opción 1: Registro Público
1. Ir a `/` (Landing principal)
2. Click "Empezar Ahora"
3. Completar formulario de registro
4. Seleccionar plan
5. Sistema crea automáticamente:
   - Usuario Owner
   - Empresa nueva
   - URL personalizada basada en el nombre

### Opción 2: Desde SuperAdmin
1. Login como SuperAdmin
2. Ir a `/superadmin`
3. Tab "Empresas"
4. Click "Crear Empresa"
5. Completar formulario
6. Sistema genera URL automática

---

## 📝 NOTAS IMPORTANTES

- **Slugs Únicos:** Cada empresa tiene un slug único (ej: `centro-podosalud`). Si dos empresas intentan usar el mismo nombre, el sistema agregará un sufijo.
- **Multi-Tenant:** Cada empresa ve solo sus propios datos gracias a RLS en Supabase.
- **Branding:** Cada empresa puede personalizar sus colores y logo desde `/admin?tab=branding`.
- **Configuración de Acceso:** El admin de la empresa decide si permite:
  - Login de pacientes
  - Auto-registro de pacientes
  - Desde `/admin?tab=ajustes`

---

## 🔄 CAMBIAR CONTRASEÑAS

Todas las contraseñas pueden cambiarse desde:
- Configuración → Tab "Seguridad" → "Cambiar Contraseña"

O ejecutando en Supabase:
```sql
-- Cambiar contraseña de un usuario específico
UPDATE auth.users 
SET encrypted_password = crypt('NuevaContraseña123!', gen_salt('bf'))
WHERE email = 'email@example.com';
```

---

## 🚀 DESPLIEGUE

Al desplegar en producción:
1. Cambiar TODAS las contraseñas por defecto
2. Configurar variables de entorno en Vercel
3. Habilitar autenticación de 2 factores para SuperAdmin
4. Configurar políticas de seguridad adicionales

---

**Última actualización:** 2026-04-23
**Versión del Sistema:** 1.0.0