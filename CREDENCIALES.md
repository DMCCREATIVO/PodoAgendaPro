# 🔐 CREDENCIALES DE ACCESO - PodoAgenda Pro

## 🎯 ARQUITECTURA DE ACCESO (IMPORTANTE)

El sistema tiene **3 puntos de entrada separados**:

### **1. SuperAdmin - Acceso Global Seguro**
**URL:** `/superadmin/auth` (exclusiva y oculta)
- Login simple para SuperAdmin
- **SIN selector de roles**
- Acceso total al sistema

### **2. Empresas - Login y Registro Público**
**URL:** `/auth`
- **Tab "Iniciar Sesión"** - Para empresas existentes
- **Tab "Crear Empresa"** - Para nuevas clínicas con selector de planes
- Registro público con 3 planes disponibles

### **3. Podólogos/Pacientes - Acceso por Empresa**
**URL:** `/[slug]/auth` (ejemplo: `/centro-podosalud/auth`)
- Login **CON selector de roles** (Administrador, Podólogo, Paciente)
- Cada empresa tiene su propia URL personalizada

---

## 👑 SUPERADMIN (Acceso Global)

### **Cómo Acceder:**
1. Ir a: `/superadmin/auth`
2. Verás: Login simple morado (NO hay selector de roles)
3. Email: `superadmin@example.com`
4. Contraseña: `PodosPro2024!Super`
5. Click "Acceder al Sistema"
6. Redirección automática a `/superadmin`

### **Panel SuperAdmin:**
- Sidebar morado con gradiente
- Badge "SuperAdmin" destacado
- 5 tabs funcionales:
  * Dashboard Global (estadísticas del sistema)
  * Empresas (crear/gestionar todas las clínicas)
  * Usuarios (ver todos los usuarios)
  * Auditoría (logs del sistema)
  * Configuración (settings globales)

### **Permisos:**
- ✅ Ver todas las empresas del sistema
- ✅ Crear/editar/suspender empresas
- ✅ Gestionar usuarios globales
- ✅ Configurar planes y precios
- ✅ Acceder a estadísticas globales
- ✅ Configuración del sistema completo

### **IMPORTANTE:**
- El usuario SuperAdmin se crea automáticamente en el primer login
- Email: `superadmin@example.com` (dominio genérico válido)
- El flag `is_superadmin: true` se configura automáticamente
- Este usuario tiene acceso completo al sistema

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

## 🆕 CREAR NUEVA EMPRESA

### **Desde Página Pública (`/auth`):**
1. Ir a `/auth`
2. Click en tab "Crear Empresa"
3. Completar formulario:
   - Nombre completo
   - Email
   - Contraseña
   - Nombre de la clínica
   - Teléfono
4. **Seleccionar plan:**
   - **Starter** - $29/mes (1 podólogo, 100 pacientes)
   - **Professional** - $79/mes (5 podólogos, ilimitado) [MÁS POPULAR]
   - **Enterprise** - Custom (ilimitado, multi-sucursal)
5. Click "Crear Empresa Gratis"
6. Sistema crea automáticamente:
   - Usuario owner
   - Empresa nueva
   - URL personalizada (slug)
7. Redirección a `/onboarding`
8. Completar 3 pasos de configuración inicial
9. Redirección a `/admin`

### **Desde SuperAdmin:**
1. Login como SuperAdmin
2. Ir a `/superadmin`
3. Tab "Empresas"
4. Click "Crear Empresa"
5. Completar formulario
6. Sistema genera empresa con slug único

---

## 🔄 FLUJOS DE ACCESO DETALLADOS

### **Flujo 1: SuperAdmin**
```
Paso 1: Ir a /superadmin/auth
Paso 2: Ver login simple morado (SIN selector de roles)
Paso 3: Email: superadmin@example.com
Paso 4: Password: PodosPro2024!Super
Paso 5: Click "Acceder al Sistema"
Paso 6: Sistema detecta is_superadmin: true
Paso 7: Redirección automática → /superadmin
Paso 8: Panel morado con 5 tabs operativas
```

### **Flujo 2: Login Empresa Existente**
```
Paso 1: Ir a /auth
Paso 2: Click en tab "Iniciar Sesión"
Paso 3: Email: admin@centropodosalud.cl
Paso 4: Password: Admin123!
Paso 5: Click "Iniciar Sesión"
Paso 6: Sistema detecta empresa existente
Paso 7: Redirección automática → /admin
```

### **Flujo 3: Crear Nueva Empresa**
```
Paso 1: Ir a /auth
Paso 2: Click en tab "Crear Empresa"
Paso 3: Completar formulario (nombre, email, clínica, etc.)
Paso 4: Seleccionar plan (Starter/Professional/Enterprise)
Paso 5: Click "Crear Empresa Gratis"
Paso 6: Sistema crea usuario + empresa + slug
Paso 7: Redirección a /onboarding
Paso 8: Configuración inicial (3 pasos)
Paso 9: Redirección a /admin
```

### **Flujo 4: Login Podólogo/Paciente**
```
Paso 1: Ir a /centro-podosalud/auth
Paso 2: Ver selector de 3 roles
Paso 3: Seleccionar rol (Administrador/Podólogo/Paciente)
Paso 4: Email + Password
Paso 5: Click "Iniciar Sesión"
Paso 6: Sistema detecta role
Paso 7: Redirección según rol:
  - Admin → /admin
  - Podólogo → /podologo
  - Paciente → /cliente
```

---

## 🛡️ PROTECCIÓN DE RUTAS

El sistema redirige automáticamente según tu rol:

### **Si NO estás autenticado:**
- Intentas ir a `/admin` → Redirige a `/auth`
- Intentas ir a `/podologo` → Redirige a `/auth`
- Intentas ir a `/superadmin` → Redirige a `/superadmin/auth`

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
1. Verifica que estés usando: `/superadmin/auth` (NO `/auth`)
2. Email exacto: `superadmin@example.com`
3. Password exacto: `PodosPro2024!Super`
4. Si ves selector de roles = estás en la URL incorrecta
5. Limpia el localStorage: Consola → `localStorage.clear()` → Enter → F5

### **"Me redirige automáticamente"**
**Esto es normal.** El sistema detecta tu rol y te lleva al panel correcto:
- SuperAdmin → `/superadmin`
- Admin → `/admin`
- Podólogo → `/podologo`
- Paciente → `/cliente`

### **"No veo el tab de Login en /auth"**
**Solución:**
1. Refresca la página
2. Verás 2 tabs: "Iniciar Sesión" y "Crear Empresa"
3. Click en "Iniciar Sesión" para empresas existentes

### **"¿Dónde selecciono el plan?"**
El selector de planes aparece en el tab "Crear Empresa" de `/auth`.
Hay 3 opciones: Starter, Professional, Enterprise.

### **"Error 500 - Recursión infinita"**
**Solución:**
Este error ya está corregido. Las políticas RLS fueron optimizadas.
Si persiste: Contacta soporte técnico.

---

## 💰 PLANES DISPONIBLES

### **Starter - $29/mes**
- 1 Podólogo
- Hasta 100 pacientes
- Agenda básica
- Portal paciente
- Soporte email

### **Professional - $79/mes** [MÁS POPULAR]
- Hasta 5 Podólogos
- Pacientes ilimitados
- Ficha podológica completa
- Analytics avanzados
- Personalización de marca
- Recordatorios automáticos
- Soporte prioritario

### **Enterprise - Custom**
- Podólogos ilimitados
- Multi-sucursal
- API & Integraciones
- Branding white-label
- Capacitación dedicada
- Soporte 24/7
- SLA garantizado

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
- **RLS Optimizado:** Las políticas de seguridad fueron reescritas para evitar recursión infinita.
- **Auto-creación SuperAdmin:** El usuario SuperAdmin se crea automáticamente en el primer login.

---

## 🚀 DESPLIEGUE A PRODUCCIÓN

Al desplegar:
1. ✅ Cambiar TODAS las contraseñas por defecto
2. ✅ Configurar variables de entorno en Vercel
3. ✅ Habilitar 2FA para SuperAdmin
4. ✅ Configurar políticas de seguridad adicionales
5. ✅ Revisar permisos de RLS en Supabase
6. ✅ Actualizar dominios de email
7. ✅ Verificar que las políticas RLS no tengan recursión

---

## 📧 CONTACTO

**Soporte Técnico:** soporte@podoagenda.com
**Ventas:** ventas@podoagenda.com
**General:** contacto@podoagenda.com

---

## 🔧 SOLUCIÓN DE PROBLEMAS TÉCNICOS

### **Limpiar caché y sesiones:**
```javascript
// Abrir consola del navegador (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Ver logs de autenticación:**
1. Abrir consola (F12)
2. Ir a pestaña "Console"
3. Intentar login
4. Buscar logs que empiecen con: 🔐, ✅, ❌, 👑

### **Verificar sesión activa:**
```javascript
// En consola (F12):
const { data } = await supabase.auth.getSession();
console.log(data);
```

---

**Última actualización:** 2026-04-23
**Versión del Sistema:** 1.0.0
**Estado:** ✅ Sistema Completamente Operativo
**Branding:** PodoAgenda Pro
**RLS:** ✅ Optimizado sin recursión