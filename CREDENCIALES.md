# 🔐 CREDENCIALES DE ACCESO - PODOS PRO

## 🎯 ARQUITECTURA DE ACCESO (IMPORTANTE)

El sistema tiene **2 puntos de entrada completamente separados**:

### **1. Acceso Global - SuperAdmin y Registro de Empresas**
**URL:** `/auth`
- Login simple (email + contraseña)
- **SIN selector de roles**
- Para SuperAdmin y registro de nuevas empresas

### **2. Acceso por Empresa - Podólogos y Pacientes**
**URL:** `/[slug]/auth` (ejemplo: `/centro-podosalud/auth`)
- Login **CON selector de roles** (Administrador, Podólogo, Paciente)
- Cada empresa tiene su propia URL personalizada

---

## 👑 SUPERADMIN (Acceso Global)

### **Cómo Acceder:**
1. Ir a: `/auth`
2. Verás: Login simple (NO hay selector de roles)
3. Email: `superadmin@podospro.com`
4. Contraseña: `PodosPro2024!Super`
5. Click "Iniciar Sesión"
6. Redirección automática a `/superadmin`

### **Panel SuperAdmin:**
- Sidebar morado con gradiente
- Badge "SuperAdmin" destacado
- 5 tabs funcionales:
  * Dashboard Global
  * Empresas (crear/gestionar todas)
  * Usuarios (ver todos los usuarios del sistema)
  * Planes (gestionar planes de suscripción)
  * Configuración (settings del sistema)

### **Permisos:**
- ✅ Ver todas las empresas del sistema
- ✅ Crear/editar/suspender empresas
- ✅ Gestionar usuarios globales
- ✅ Configurar planes y precios
- ✅ Acceder a estadísticas globales
- ✅ Configuración del sistema completo

---

## 🏢 EMPRESA DEMO (Centro PodoSalud)

**Slug:** `centro-podosalud`
**URL Pública:** `/centro-podosalud`
**URL de Login:** `/centro-podosalud/auth`

### **Administrador (Owner)**

**Cómo Acceder:**
1. Ir a: `/centro-podosalud/auth`
2. Verás: Selector de 3 roles (cards grandes)
3. Seleccionar: "Administrador"
4. Email: `admin@centropodosalud.cl`
5. Contraseña: `Admin123!`
6. Click "Iniciar Sesión"
7. Redirección automática a `/admin`

**Panel Admin:**
- Sidebar azul glassmorphism
- CompanySwitcher (si tiene múltiples empresas)
- 6 tabs:
  * Dashboard (KPIs, gráficos)
  * Agenda (calendario, citas)
  * Podólogos (gestión de staff)
  * Pacientes (CRUD completo)
  * Cobros (facturación)
  * Configuración (branding, ajustes)

---

### **Podólogo Principal**

**Cómo Acceder:**
1. Ir a: `/centro-podosalud/auth`
2. Seleccionar: "Podólogo"
3. Email: `dra.martinez@centropodosalud.cl`
4. Contraseña: `Podo123!`
5. Click "Iniciar Sesión"
6. Redirección automática a `/podologo`

**Panel Podólogo:**
- Sidebar verde glassmorphism
- 4 tabs:
  * Mi Día (agenda del día, próximo paciente)
  * Atención (ficha clínica completa)
  * Mis Pacientes (lista y detalles)
  * Configuración (perfil personal)

---

### **Podólogo Secundario**

**Email:** `dr.gonzalez@centropodosalud.cl`
**Contraseña:** `Podo123!`
**Panel:** `/podologo` (igual que el principal)

---

### **Paciente 1**

**Cómo Acceder:**
1. Ir a: `/centro-podosalud/auth`
2. Seleccionar: "Paciente"
3. Email: `juan.perez@email.com`
4. Contraseña: `Paciente123!`
5. Click "Iniciar Sesión"
6. Redirección automática a `/cliente`

**Portal Paciente:**
- Sidebar neutral glassmorphism
- 4 tabs:
  * Mis Citas (próximas, historial)
  * Historial (notas clínicas públicas)
  * Pagos (recibos, facturas)
  * Configuración (perfil personal)

---

### **Paciente 2**

**Email:** `maria.lopez@email.com`
**Contraseña:** `Paciente123!`
**Panel:** `/cliente` (igual que paciente 1)

---

## 🔄 FLUJOS DE ACCESO DETALLADOS

### **Flujo 1: SuperAdmin**
```
Paso 1: Abrir navegador
Paso 2: Ir a /auth
Paso 3: Ver login simple (SIN selector de roles)
Paso 4: Email: superadmin@podospro.com
Paso 5: Password: PodosPro2024!Super
Paso 6: Click "Iniciar Sesión"
Paso 7: Sistema detecta is_superadmin: true
Paso 8: Redirección automática → /superadmin
Paso 9: Panel morado con 5 tabs operativas
```

### **Flujo 2: Admin de Empresa**
```
Paso 1: Abrir navegador
Paso 2: Ir a /centro-podosalud/auth
Paso 3: Ver selector de 3 roles (cards grandes)
Paso 4: Click en card "Administrador"
Paso 5: Email: admin@centropodosalud.cl
Paso 6: Password: Admin123!
Paso 7: Click "Iniciar Sesión"
Paso 8: Sistema detecta role: owner
Paso 9: Redirección automática → /admin
Paso 10: Panel azul con 6 tabs
```

### **Flujo 3: Podólogo**
```
Paso 1: Ir a /centro-podosalud/auth
Paso 2: Ver selector de 3 roles
Paso 3: Click en card "Podólogo"
Paso 4: Email: dra.martinez@centropodosalud.cl
Paso 5: Password: Podo123!
Paso 6: Click "Iniciar Sesión"
Paso 7: Sistema detecta role: podiatrist
Paso 8: Redirección automática → /podologo
Paso 9: Panel verde con 4 tabs
```

### **Flujo 4: Paciente**
```
Paso 1: Ir a /centro-podosalud/auth
Paso 2: Ver selector de 3 roles
Paso 3: Click en card "Paciente"
Paso 4: Email: juan.perez@email.com
Paso 5: Password: Paciente123!
Paso 6: Click "Iniciar Sesión"
Paso 7: Sistema detecta role: patient
Paso 8: Redirección automática → /cliente
Paso 9: Panel neutral con 4 tabs
```

---

## 🆕 CREAR NUEVA EMPRESA

### **Desde Landing Pública:**
1. Ir a `/` (landing SaaS)
2. Click "Empezar Ahora"
3. Completar formulario de registro:
   - Nombre completo
   - Email
   - Contraseña
   - Nombre de la clínica
   - Teléfono
4. Seleccionar plan (Starter/Professional/Enterprise)
5. Aceptar términos y condiciones
6. Click "Crear Cuenta Gratis"
7. Sistema crea automáticamente:
   - Usuario owner
   - Empresa nueva
   - URL personalizada (slug)
8. Redirección a `/onboarding`
9. Completar 3 pasos de configuración inicial
10. Redirección a `/admin`

### **Desde SuperAdmin:**
1. Login como SuperAdmin
2. Ir a `/superadmin`
3. Tab "Empresas"
4. Click "Crear Empresa"
5. Completar formulario
6. Sistema genera empresa con slug único

---

## 🛡️ PROTECCIÓN DE RUTAS

El sistema redirige automáticamente según tu rol:

### **Si NO estás autenticado:**
- Intentas ir a `/admin` → Redirige a `/auth`
- Intentas ir a `/podologo` → Redirige a `/auth`
- Intentas ir a `/superadmin` → Redirige a `/auth`

### **Si eres SuperAdmin:**
- Intentas ir a `/admin` → Redirige a `/superadmin`
- Intentas ir a `/podologo` → Redirige a `/superadmin`
- Solo puedes estar en: `/superadmin`

### **Si eres Admin/Owner:**
- Intentas ir a `/superadmin` → Redirige a `/admin`
- Intentas ir a `/podologo` → Redirige a `/admin`
- Puedes estar en: `/admin`, `/configuracion`, `/paciente/[id]`

### **Si eres Podólogo:**
- Intentas ir a `/superadmin` → Redirige a `/podologo`
- Intentas ir a `/admin` → Redirige a `/podologo`
- Puedes estar en: `/podologo`, `/configuracion`, `/paciente/[id]`

### **Si eres Paciente:**
- Intentas ir a `/superadmin` → Redirige a `/cliente`
- Intentas ir a `/admin` → Redirige a `/cliente`
- Puedes estar en: `/cliente`, `/configuracion`

---

## ⚠️ ERRORES COMUNES

### **"No puedo acceder al panel SuperAdmin"**
**Solución:**
1. Verifica que estés usando: `/auth` (NO `/centro-podosalud/auth`)
2. Email exacto: `superadmin@podospro.com`
3. Password exacto: `PodosPro2024!Super`
4. Si ves selector de roles = estás en la URL incorrecta

### **"Me redirige automáticamente"**
**Esto es normal.** El sistema detecta tu rol y te lleva al panel correcto:
- SuperAdmin → `/superadmin`
- Admin → `/admin`
- Podólogo → `/podologo`
- Paciente → `/cliente`

### **"Veo un panel que no me corresponde"**
**Solución:**
1. Cerrar sesión
2. Verificar la URL de login correcta
3. Seleccionar el rol correcto (si aplica)
4. Login nuevamente

---

## 🔐 CAMBIAR CONTRASEÑAS

Todas las contraseñas pueden cambiarse desde:
- Ir a tu panel (admin/podologo/cliente)
- Click en "Configuración"
- Tab "Seguridad"
- Sección "Cambiar Contraseña"

---

## 📝 NOTAS IMPORTANTES

- **Slugs Únicos:** Cada empresa tiene un slug único. Si dos empresas intentan usar el mismo nombre, el sistema agrega un sufijo automático.
- **Multi-Tenant:** Cada empresa ve solo sus propios datos (aislamiento por RLS en Supabase).
- **Branding:** Cada empresa personaliza colores y logo desde `/admin?tab=branding`.
- **Control de Acceso:** El admin decide permisos desde `/admin?tab=ajustes`:
  - ✅/❌ Permitir login de pacientes
  - ✅/❌ Auto-registro de pacientes

---

## 🚀 DESPLIEGUE A PRODUCCIÓN

Al desplegar:
1. ✅ Cambiar TODAS las contraseñas por defecto
2. ✅ Configurar variables de entorno en Vercel
3. ✅ Habilitar 2FA para SuperAdmin
4. ✅ Configurar políticas de seguridad adicionales
5. ✅ Revisar permisos de RLS en Supabase

---

**Última actualización:** 2026-04-23
**Versión del Sistema:** 1.0.0
**Estado:** ✅ Sistema Completamente Operativo