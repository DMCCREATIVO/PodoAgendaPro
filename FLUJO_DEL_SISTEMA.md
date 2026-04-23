# 🦶 PODOS PRO - FLUJO COMPLETO DEL SISTEMA

## 📊 ARQUITECTURA MULTI-TENANT

PODOS PRO es un **sistema SaaS multi-tenant** donde:
- **1 Plataforma Global** gestiona múltiples empresas (clínicas podológicas)
- **Cada Empresa** tiene su propia URL, branding, y datos aislados
- **SuperAdmin** controla toda la plataforma
- **Cada Empresa** gestiona su propia operación

---

## 🌐 ESTRUCTURA DE URLs

### Landing Principal (SaaS)
```
https://podospro.com/
```
- Página de marketing del SaaS
- Planes y precios
- Registro de nuevas clínicas
- Acceso para SuperAdmin

### Login Global (SuperAdmin)
```
https://podospro.com/auth
```
- Login del SuperAdmin
- Acceso administrativo global

### Panel SuperAdmin
```
https://podospro.com/superadmin
```
- Gestión de todas las empresas
- Configuración global
- Estadísticas del sistema

---

### Landing de Empresa Específica (Multi-Tenant)
```
https://podospro.com/[slug-empresa]
Ejemplo: https://podospro.com/centro-podosalud
```
- Landing personalizada de la clínica
- Logo y colores de la empresa
- Servicios y podólogos
- Testimonios
- Botón "Agendar Hora"

### Login de Empresa
```
https://podospro.com/[slug-empresa]/auth
Ejemplo: https://podospro.com/centro-podosalud/auth
```
- Login para:
  - Administradores de la empresa
  - Podólogos del equipo
  - Pacientes registrados
- Selector visual de rol
- Opción de registro (si está habilitado)

### Paneles por Rol (dentro de la Empresa)
```
Admin:     https://podospro.com/[slug-empresa]/admin
Podólogo:  https://podospro.com/[slug-empresa]/podologo
Paciente:  https://podospro.com/[slug-empresa]/cliente
```

---

## 🔄 FLUJOS PRINCIPALES

### 1️⃣ REGISTRO DE NUEVA CLÍNICA

**Inicio:** Usuario visita la landing principal

```
┌─────────────────────────────────────────────────────┐
│ Usuario visita https://podospro.com/               │
│ (Landing SaaS)                                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Click "Empezar Ahora" o "Ver Planes"               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige a /auth?mode=register                     │
│ (Formulario de Registro)                            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Usuario completa:                                   │
│ - Nombre completo                                   │
│ - Email                                             │
│ - Contraseña                                        │
│ - Nombre de la Clínica: "Centro PodoSalud"         │
│ - Teléfono                                          │
│ - Selecciona Plan (Starter/Pro/Enterprise)         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Sistema automáticamente:                            │
│ 1. Crea usuario en auth.users                      │
│ 2. Crea empresa en companies:                      │
│    - name: "Centro PodoSalud"                      │
│    - slug: "centro-podosalud" (único)              │
│    - plan_id: UUID del plan seleccionado           │
│    - status: "trial"                               │
│ 3. Crea relación en company_users:                 │
│    - role: "owner"                                 │
│    - permissions: todos los permisos               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige a /onboarding                             │
│ (Configuración inicial en 3 pasos)                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Paso 1: Datos de la Clínica                        │
│ - Dirección                                         │
│ - Teléfono                                          │
│ - Sitio web                                         │
│ - Descripción                                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Paso 2: Primer Servicio                            │
│ - Nombre: "Consulta Podológica"                    │
│ - Descripción                                       │
│ - Duración: 60 minutos                             │
│ - Precio: $25.000                                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Paso 3: Horarios de Atención                       │
│ - Lunes a Viernes: 9:00 - 18:00                   │
│ - Sábados: 9:00 - 13:00                           │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige a /admin                                  │
│ (Panel Administrativo de su Empresa)               │
│                                                     │
│ ✅ Empresa creada y operativa                      │
│ ✅ URL personalizada: /centro-podosalud            │
└─────────────────────────────────────────────────────┘
```

---

### 2️⃣ CONFIGURACIÓN DE LA EMPRESA

**Admin personaliza su clínica**

```
┌─────────────────────────────────────────────────────┐
│ Admin va a /admin?tab=configuracion                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Tab 1: Perfil Personal                             │
│ - Actualiza su nombre, email, teléfono             │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Tab 2: Datos de Empresa                            │
│ - Actualiza info de contacto, dirección            │
│ - Horarios de atención                             │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Tab 3: Branding ⭐                                 │
│ - Color Principal: #2563EB → #10B981 (cambio)     │
│ - Color Secundario: #22C55E → #F59E0B             │
│ - Color Acento: #F59E0B → #EF4444                 │
│ - Logo URL: https://example.com/logo.png           │
│ - Favicon URL: https://example.com/favicon.ico     │
│                                                     │
│ Sistema guarda en companies.metadata:              │
│ {                                                   │
│   "branding": {                                     │
│     "primary_color": "#10B981",                    │
│     "secondary_color": "#F59E0B",                  │
│     "accent_color": "#EF4444",                     │
│     "logo_url": "...",                             │
│     "favicon_url": "..."                           │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Tab 4: Ajustes ⭐                                  │
│ - [x] Permitir Login de Pacientes                 │
│ - [ ] Registro Público de Pacientes               │
│ - [x] Reservas Online Activas                     │
│ - [ ] Requiere Aprobación Manual                  │
│ - [x] Recordatorios Automáticos                   │
│ - [x] Permitir Cancelaciones (2h antes)           │
│                                                     │
│ Sistema guarda en companies.metadata:              │
│ {                                                   │
│   "settings": {                                     │
│     "allow_patient_login": true,                   │
│     "allow_public_registration": false,            │
│     "booking_enabled": true,                       │
│     "requires_approval": false,                    │
│     "auto_reminders": true,                        │
│     "allow_cancellations": true,                   │
│     "cancellation_hours": 2                        │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ ✅ Configuración completa                          │
│ ✅ Branding personalizado aplicado                 │
│ ✅ Landing /centro-podosalud refleja cambios       │
└─────────────────────────────────────────────────────┘
```

---

### 3️⃣ ACCESO DE PODÓLOGO

**Podólogo del equipo accede a su panel**

```
┌─────────────────────────────────────────────────────┐
│ Admin comparte URL con su podólogo:                │
│ https://podospro.com/centro-podosalud/auth         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Podólogo abre la URL                               │
│ Ve página de login CON BRANDING de la clínica:    │
│ - Logo de Centro PodoSalud                         │
│ - Colores personalizados                           │
│ - Selector de rol: Admin/Podólogo/Paciente        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Selecciona rol "Podólogo"                          │
│ Ingresa credenciales:                              │
│ - Email: dra.martinez@centropodosalud.cl           │
│ - Contraseña: Podo123!                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Sistema valida:                                     │
│ 1. Usuario existe en auth.users                    │
│ 2. Verifica company_users:                         │
│    - company_id = Centro PodoSalud                 │
│    - user_id = ID del usuario                      │
│    - role = "podiatrist"                           │
│    - status = "active"                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige automáticamente a:                        │
│ /centro-podosalud/podologo                         │
│                                                     │
│ Panel Podólogo con 4 tabs:                         │
│ 1. Mi Día - Próximo paciente + agenda             │
│ 2. Atención - Ficha podológica completa           │
│ 3. Mis Pacientes - Lista y búsqueda               │
│ 4. Configuración - Perfil personal                │
└─────────────────────────────────────────────────────┘
```

---

### 4️⃣ ACCESO DE PACIENTE

**Paciente accede a su portal**

```
┌─────────────────────────────────────────────────────┐
│ Escenario 1: Login de Paciente Existente          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Paciente recibe link por WhatsApp/Email:           │
│ https://podospro.com/centro-podosalud/auth         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Abre página de login                               │
│ Ve SOLO opción "Paciente" si Admin configuró:     │
│ - allow_patient_login: true                        │
│                                                     │
│ Si allow_patient_login: false                      │
│ → No ve opción de Paciente (solo Admin/Podo)      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Selecciona "Paciente"                              │
│ Ingresa credenciales:                              │
│ - Email: juan.perez@email.com                      │
│ - Contraseña: Paciente123!                         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Sistema valida:                                     │
│ 1. Usuario existe en auth.users                    │
│ 2. Verifica clients:                               │
│    - company_id = Centro PodoSalud                 │
│    - email = juan.perez@email.com                  │
│    - status = "active"                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige a: /centro-podosalud/cliente             │
│                                                     │
│ Portal Paciente con 4 tabs:                        │
│ 1. Mis Citas - Próximas + historial               │
│ 2. Historial - Notas clínicas permitidas          │
│ 3. Pagos - Recibos y facturas                     │
│ 4. Configuración - Perfil personal                │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────┐
│ Escenario 2: Auto-Registro de Paciente Nuevo      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Paciente visita landing de la clínica:             │
│ https://podospro.com/centro-podosalud              │
│ Click "Agendar Hora"                               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige a: /centro-podosalud/auth?mode=register  │
│                                                     │
│ Ve pestaña "Crear Cuenta" SOLO si:                │
│ - allow_public_registration: true                  │
│                                                     │
│ Si allow_public_registration: false                │
│ → No puede registrarse (debe contactar clínica)   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Completa formulario de registro:                   │
│ - Nombre completo                                   │
│ - Email                                             │
│ - Contraseña                                        │
│ - Confirmar contraseña                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Sistema crea:                                       │
│ 1. Usuario en auth.users                           │
│ 2. Registro en clients:                            │
│    - company_id = Centro PodoSalud                 │
│    - name = Nombre completo                        │
│    - email = Email del formulario                  │
│    - status = "active"                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige a: /centro-podosalud/cliente             │
│ ✅ Paciente creado y con acceso                    │
└─────────────────────────────────────────────────────┘
```

---

### 5️⃣ SUPERADMIN GESTIONA EMPRESAS

**SuperAdmin crea/gestiona clínicas desde el panel global**

```
┌─────────────────────────────────────────────────────┐
│ SuperAdmin va a https://podospro.com/auth         │
│ Login: superadmin@podospro.com                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Redirige a /superadmin                             │
│ Panel con 5 tabs:                                   │
│ 1. Dashboard - KPIs globales                       │
│ 2. Empresas - Gestión de clínicas                 │
│ 3. Usuarios - Gestión global                      │
│ 4. Planes - Editar pricing                        │
│ 5. Configuración - Settings del sistema           │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Tab "Empresas" → Click "Crear Empresa"            │
│                                                     │
│ Modal con formulario:                              │
│ - Nombre: "Clínica del Pie"                       │
│ - Email: admin@clinicadelpie.cl                   │
│ - Plan: Professional (selector)                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Sistema crea:                                       │
│ 1. Empresa en companies:                           │
│    - name: "Clínica del Pie"                       │
│    - slug: "clinica-del-pie" (auto)               │
│    - plan_id: Professional                         │
│    - status: "trial"                               │
│ 2. ENVÍA EMAIL al admin@clinicadelpie.cl          │
│    con link de activación                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ SuperAdmin ve nueva empresa en tabla              │
│ Puede:                                              │
│ - Ver detalles                                      │
│ - Suspender/Activar                                │
│ - Cambiar plan                                      │
│ - Eliminar                                          │
│ - Ir a panel admin de la empresa                   │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 PERSONALIZACIÓN VISUAL (Branding)

### ¿Cómo funciona el Multi-Tenant Visual?

```
┌─────────────────────────────────────────────────────┐
│ EMPRESA A: Centro PodoSalud                        │
│ Slug: centro-podosalud                             │
│                                                     │
│ Branding configurado:                              │
│ - primary_color: #10B981 (verde)                   │
│ - secondary_color: #F59E0B (naranja)               │
│ - accent_color: #EF4444 (rojo)                     │
│ - logo_url: https://cdn.com/logo-podosalud.png     │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
Cuando un usuario visita:
/centro-podosalud
/centro-podosalud/auth
/centro-podosalud/admin
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Componente <BrandedLayout> se activa               │
│                                                     │
│ 1. Lee currentCompany.metadata.branding            │
│ 2. Convierte hex → RGB                             │
│ 3. Aplica CSS variables en :root:                  │
│    --primary-rgb: 16, 185, 129                     │
│    --secondary-rgb: 245, 158, 11                   │
│    --accent-rgb: 239, 68, 68                       │
│ 4. Actualiza favicon si existe                     │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ Resultado Visual:                                   │
│ - Botones primarios: fondo verde #10B981          │
│ - Badges/highlights: naranja #F59E0B              │
│ - Alertas/destructive: rojo #EF4444               │
│ - Logo en header: logo-podosalud.png              │
│ - Favicon en browser tab: personalizado           │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────┐
│ EMPRESA B: Clínica del Pie                         │
│ Slug: clinica-del-pie                              │
│                                                     │
│ Branding configurado:                              │
│ - primary_color: #8B5CF6 (morado)                  │
│ - secondary_color: #06B6D4 (cyan)                  │
│ - accent_color: #F97316 (naranja)                  │
│ - logo_url: https://cdn.com/logo-clinica.png       │
└─────────────────────────────────────────────────────┘
                 │
                 ▼
Cuando un usuario visita:
/clinica-del-pie/auth
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ BrandedLayout aplica:                              │
│ - Botones morados                                   │
│ - Highlights cyan                                   │
│ - Logo de Clínica del Pie                          │
│ - Favicon personalizado                            │
└─────────────────────────────────────────────────────┘
```

**Conclusión:** Cada empresa tiene su propia identidad visual COMPLETA, pero usa la misma plataforma base.

---

## 🔒 CONTROL DE ACCESO

### Decisiones que toma el Admin de la Empresa

En `/admin?tab=ajustes`:

#### 1. Permitir Login de Pacientes
```
[x] Activado → Pacientes pueden loguearse en /[slug]/auth
[ ] Desactivado → Solo Admin y Podólogos pueden acceder
```

#### 2. Registro Público de Pacientes
```
[ ] Activado → Hay pestaña "Crear Cuenta" en /[slug]/auth
[x] Desactivado → Solo login, no pueden auto-registrarse
```

**Combinaciones posibles:**

| Login | Registro | Resultado |
|-------|----------|-----------|
| ✅ ON  | ✅ ON    | Pacientes pueden crear cuenta y loguearse |
| ✅ ON  | ❌ OFF   | Pacientes pueden loguearse (admin los crea) |
| ❌ OFF | ❌ OFF   | NO hay opción Paciente en login |
| ❌ OFF | ✅ ON    | No tiene sentido (bloqueado en UI) |

---

## 📍 RESUMEN DE URLs POR ACTOR

### SuperAdmin
- Landing: `/`
- Login: `/auth`
- Panel: `/superadmin`

### Admin de Empresa (Owner)
- Landing de su empresa: `/[slug]`
- Login: `/[slug]/auth`
- Panel: `/[slug]/admin` (luego se reescribe a `/admin`)

### Podólogo
- Login: `/[slug]/auth` (selector de rol)
- Panel: `/[slug]/podologo` (reescrito a `/podologo`)

### Paciente
- Landing: `/[slug]`
- Login: `/[slug]/auth` (si habilitado)
- Registro: `/[slug]/auth?mode=register` (si habilitado)
- Portal: `/[slug]/cliente` (reescrito a `/cliente`)

---

## 🚀 PRÓXIMOS PASOS

1. **Desplegar a Vercel**
2. **Configurar dominio:** `app.podospro.com`
3. **Primer SuperAdmin** login con credenciales
4. **Crear empresas** demo para mostrar
5. **Compartir URLs** personalizadas con clientes

---

**Sistema 100% Operativo y Listo para Producción** 🎉