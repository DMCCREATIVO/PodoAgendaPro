---
description: Skill de Supabase para PodoAgenda Pro - Esquema de BD, tablas, relaciones, RLS, funciones, tipos y patrones de uso
---

# Supabase Skill - PodoAgenda Pro

## Conexion

- **Project Ref:** `xfikudmztphbtgnmlkmr`
- **URL:** `NEXT_PUBLIC_SUPABASE_URL` (env var)
- **Anon Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` (env var)
- **Client:** `src/integrations/supabase/client.ts`
- **Types:** `src/integrations/supabase/database.types.ts`
- **Migrations:** `supabase/migrations/` (25 archivos SQL)

## Tablas Principales

### `users` - Usuarios del sistema
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | Vinculado a auth.users |
| email | text | Unico |
| full_name | text | Nullable |
| role | text | superadmin, owner, admin, employee, patient |
| company_id | uuid (FK → companies) | Nullable para superadmin |
| is_superadmin | boolean | Flag especial |
| is_active | boolean | |
| avatar_url | text | |
| phone | text | |
| last_login_at | timestamptz | |
| created_by | uuid | |
| created_at | timestamptz | |

### `companies` - Empresas/Clinicas
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| name | text | Nombre de la clinica |
| slug | text (UNIQUE) | URL personalizada |
| email | text | |
| phone | text | |
| address | text | |
| logo_url | text | |
| plan | text | starter, professional, enterprise |
| plan_id | uuid (FK → plans) | |
| plan_status | text | |
| is_active | boolean | |
| status | text | |
| settings | jsonb | Config general |
| metadata | jsonb | |
| integrations | jsonb | |
| max_podiatrists | int | Limite por plan |
| max_users | int | |
| max_monthly_appointments | int | |
| custom_plan | boolean | |
| custom_limits | jsonb | |
| country_code | text | |
| timezone | text | |
| website | text | |
| industry | text | |
| default_admin_password | text | |
| subscription_started_at | timestamptz | |
| subscription_ends_at | timestamptz | |
| trial_ends_at | timestamptz | |
| suspended_at | timestamptz | |
| suspended_reason | text | |
| deleted_at | timestamptz | Soft delete |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `company_users` - Relacion usuarios ↔ empresas (multi-tenant)
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | |
| user_id | uuid | |
| role | text | owner, admin, employee |
| status | text | active, invited, etc. |
| permissions | jsonb | |
| invited_by | uuid | |
| invited_at | timestamptz | |
| accepted_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `clients` - Pacientes
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | Multi-tenant |
| auth_user_id | uuid | Vinculo con auth si tiene login |
| name | text | |
| email | text | |
| phone | text | |
| whatsapp | text | |
| avatar_url | text | |
| status | text | |
| source | text | |
| tags | text[] | Array de tags |
| notes | text | |
| custom_fields | jsonb | |
| assigned_to | uuid (FK → users) | Podologo asignado |
| created_by | uuid (FK → users) | |
| last_contact_at | timestamptz | |
| deleted_at | timestamptz | Soft delete |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `appointments` - Citas
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | Multi-tenant |
| client_id | uuid (FK → clients) | |
| service_id | uuid (FK → services) | |
| assigned_to | uuid (FK → users) | Podologo |
| scheduled_at | timestamptz | Fecha/hora de la cita |
| duration_minutes | int | |
| status | text | scheduled, completed, cancelled, etc. |
| notes | text | |
| cancellation_reason | text | |
| reminder_sent_at | timestamptz | |
| created_by | uuid (FK → users) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `services` - Servicios de podologia
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | Multi-tenant |
| name | text | |
| description | text | |
| duration_minutes | int | |
| price | numeric | |
| color | text | Para UI calendario |
| is_active | boolean | |
| buffer_minutes | int | Tiempo buffer entre citas |
| max_advance_days | int | Max dias anticipacion |
| requires_approval | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `schedules` - Horarios de podologos
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | |
| user_id | uuid (FK → users) | Podologo |
| day_of_week | int | 0=Domingo, 6=Sabado |
| start_time | time | |
| end_time | time | |
| is_active | boolean | |
| created_at | timestamptz | |

### `clinical_notes` - Notas clinicas
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | |
| client_id | uuid (FK → clients) | |
| appointment_id | uuid (FK → appointments) | Opcional |
| note_type | text | |
| title | text | |
| content | text | |
| is_private | boolean | Visible solo para staff |
| created_by | uuid (FK → users) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `client_conditions` - Condiciones medicas del paciente
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| client_id | uuid (FK → clients) | |
| company_id | uuid (FK → companies) | |
| name | text | |
| condition_type | text | |
| description | text | |
| severity | text | |
| is_active | boolean | |
| created_by | uuid (FK → users) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `payments` - Pagos/Cobros
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | |
| client_id | uuid (FK → clients) | |
| appointment_id | uuid (FK → appointments) | Opcional |
| amount | numeric | |
| currency | text | Default CLP |
| payment_method | text | |
| status | text | pending, paid, refunded |
| description | text | |
| internal_notes | text | |
| external_transaction_id | text | |
| paid_at | timestamptz | |
| created_by | uuid (FK → users) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `plans` - Planes SaaS
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| name | text | Starter, Professional, Enterprise |
| slug | text (UNIQUE) | |
| description | text | |
| price_monthly | numeric | |
| price_yearly | numeric | |
| features | jsonb | |
| limits | jsonb | |
| stripe_price_id_monthly | text | |
| stripe_price_id_yearly | text | |
| is_active | boolean | |
| sort_order | int | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `modules` - Modulos del sistema
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| key | text (UNIQUE) | |
| name | text | |
| description | text | |
| icon | text | |
| is_core | boolean | |
| base_price | numeric | |
| config_schema | jsonb | |
| created_at | timestamptz | |

### `company_modules` - Modulos activados por empresa
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies) | |
| module_id | uuid (FK → modules) | |
| is_active | boolean | |
| config | jsonb | |
| activated_at | timestamptz | |
| deactivated_at | timestamptz | |
| created_at | timestamptz | |

### `company_customization` - Branding por empresa
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| company_id | uuid (FK → companies, UNIQUE) | 1:1 |
| theme_id | uuid (FK → theme_templates) | |
| custom_config | jsonb | Colores, logo, fuentes |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `theme_templates` - Temas predefinidos
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| name | text | |
| slug | text (UNIQUE) | |
| description | text | |
| config | jsonb | |
| preview_image_url | text | |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `audit_logs` - Logs de auditoria
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| company_id | uuid (FK → companies) | |
| action | text | |
| entity_type | text | |
| entity_id | text | |
| details | jsonb | |
| created_at | timestamptz | |

### `superadmin_actions` - Acciones de superadmin
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| admin_id | uuid (FK → users) | |
| action_type | text | |
| target_company_id | uuid (FK → companies) | |
| target_user_id | uuid (FK → users) | |
| metadata | jsonb | |
| created_at | timestamptz | |

### `saas_landing_config` - Configuracion de landing page
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid (PK) | |
| section | text | |
| content | jsonb | |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `global_settings` y `system_settings` - Configuracion global
- `global_settings`: key/value con is_active y description
- `system_settings`: key/value con updated_by (FK → users)

## Vista

### `public_companies` - Vista publica de empresas
- Expone: id, name, slug, logo_url, website, created_at, branding, description
- Usada para paginas publicas de empresas sin autenticacion

## Funciones SQL

1. **`check_slug_available(p_slug text)`** → boolean
2. **`company_allows_registration(p_slug text)`** → boolean
3. **`generate_slug(p_name text)`** → text

## Roles del Sistema

| Rol | Descripcion | Acceso |
|-----|------------|--------|
| `superadmin` | Acceso total al sistema | `/superadmin` |
| `owner` | Dueno de empresa | `/admin` |
| `admin` | Administrador de empresa | `/admin` |
| `employee` | Podologo/empleado | `/podologo` |
| `patient` | Paciente | `/cliente` |

## Patrones de Codigo Comunes

### Query con multi-tenant (filtro por company_id)
```typescript
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('company_id', companyId)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });
```

### Insert con company_id
```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    company_id: companyId,
    client_id: clientId,
    service_id: serviceId,
    assigned_to: podologistId,
    scheduled_at: dateTime,
    duration_minutes: 30,
    status: 'scheduled',
    created_by: userId,
  })
  .select()
  .single();
```

### Join con relaciones
```typescript
const { data } = await supabase
  .from('appointments')
  .select(`
    *,
    clients(id, name, email, phone),
    services(id, name, duration_minutes, price, color),
    assigned_user:users!appointments_assigned_to_fkey(id, full_name, email)
  `)
  .eq('company_id', companyId)
  .gte('scheduled_at', startDate)
  .lte('scheduled_at', endDate);
```

### Llamar funciones RPC
```typescript
const { data: isAvailable } = await supabase
  .rpc('check_slug_available', { p_slug: 'mi-clinica' });
```

### Auth - Obtener usuario actual
```typescript
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('users')
  .select('*, companies(*)')
  .eq('id', user.id)
  .single();
```

## Reglas Importantes

1. **SIEMPRE** filtrar por `company_id` en queries multi-tenant
2. **SIEMPRE** verificar `deleted_at IS NULL` para soft-deletes (companies, clients)
3. **SIEMPRE** usar los tipos de `database.types.ts` para type-safety
4. Los tipos importan asi: `import type { Database } from '@/integrations/supabase/types'`
5. El client se importa: `import { supabase } from '@/integrations/supabase/client'`
6. RLS esta activo - las politicas filtran automaticamente por usuario autenticado
7. `company_users` es la tabla pivote para relaciones usuario-empresa. `users.role` y `users.company_id` se mantienen sincronizados para queries rapidas, pero SIEMPRE se debe insertar/actualizar en AMBAS tablas (`users` + `company_users`) al crear o modificar usuarios no-superadmin
8. La session se guarda tambien en localStorage como `podoagenda_session`

## Migraciones

Hay 25 archivos de migracion en `supabase/migrations/`. La ultima migracion agrego `role` y `company_id` directamente a la tabla `users` para simplificar queries (antes dependia solo de `company_users`).
