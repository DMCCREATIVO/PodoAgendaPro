-- Tabla de plantillas de temas para páginas de disponibilidad
CREATE TABLE IF NOT EXISTS theme_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  preview_image_url TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de personalización por empresa (para páginas de disponibilidad)
CREATE TABLE IF NOT EXISTS company_customization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES theme_templates(id) ON DELETE SET NULL,
  custom_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Tabla de configuración de landing del SaaS (global)
CREATE TABLE IF NOT EXISTS saas_landing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE theme_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_landing_config ENABLE ROW LEVEL SECURITY;

-- theme_templates: público puede leer, solo sistema puede escribir
CREATE POLICY "public_read_themes" ON theme_templates FOR SELECT USING (true);
CREATE POLICY "system_manage_themes" ON theme_templates FOR ALL USING (true);

-- company_customization: público puede leer, empresas pueden modificar las suyas
CREATE POLICY "public_read_customization" ON company_customization FOR SELECT USING (true);
CREATE POLICY "companies_manage_own" ON company_customization FOR ALL USING (true);

-- saas_landing_config: público puede leer, solo sistema puede escribir
CREATE POLICY "public_read_landing" ON saas_landing_config FOR SELECT USING (true);
CREATE POLICY "system_manage_landing" ON saas_landing_config FOR ALL USING (true);

-- Insertar 8 temas base
INSERT INTO theme_templates (name, slug, description, config) VALUES
(
  'Medical Professional',
  'medical-professional',
  'Diseño limpio y profesional con tonos azules y blancos. Ideal para clínicas serias y formales.',
  '{
    "colors": {
      "primary": "#2563EB",
      "secondary": "#1E40AF",
      "accent": "#3B82F6",
      "background": "#FFFFFF",
      "text": "#1E293B",
      "muted": "#F1F5F9"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "style": "clean",
    "gradients": {
      "hero": "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
      "cta": "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
    }
  }'::jsonb
),
(
  'Wellness Spa',
  'wellness-spa',
  'Estilo suave y relajante con verdes y beiges. Perfecto para centros de bienestar.',
  '{
    "colors": {
      "primary": "#10B981",
      "secondary": "#059669",
      "accent": "#34D399",
      "background": "#F5F3EE",
      "text": "#1C1917",
      "muted": "#E7E5E4"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Inter"
    },
    "style": "soft",
    "gradients": {
      "hero": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      "cta": "linear-gradient(135deg, #34D399 0%, #10B981 100%)"
    }
  }'::jsonb
),
(
  'Modern Tech',
  'modern-tech',
  'Oscuro y futurista con gradientes neón. Para clínicas modernas y tecnológicas.',
  '{
    "colors": {
      "primary": "#8B5CF6",
      "secondary": "#7C3AED",
      "accent": "#A78BFA",
      "background": "#0F172A",
      "text": "#F1F5F9",
      "muted": "#1E293B"
    },
    "fonts": {
      "heading": "Plus Jakarta Sans",
      "body": "Inter"
    },
    "style": "dark",
    "gradients": {
      "hero": "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
      "cta": "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)"
    }
  }'::jsonb
),
(
  'Natural Health',
  'natural-health',
  'Tonos tierra y verde orgánico. Ideal para tratamientos naturales.',
  '{
    "colors": {
      "primary": "#84CC16",
      "secondary": "#65A30D",
      "accent": "#A3E635",
      "background": "#FEFCE8",
      "text": "#365314",
      "muted": "#F7FEE7"
    },
    "fonts": {
      "heading": "Quicksand",
      "body": "Inter"
    },
    "style": "organic",
    "gradients": {
      "hero": "linear-gradient(135deg, #84CC16 0%, #65A30D 100%)",
      "cta": "linear-gradient(135deg, #A3E635 0%, #84CC16 100%)"
    }
  }'::jsonb
),
(
  'Luxury Clinic',
  'luxury-clinic',
  'Dorado y negro elegante. Para clínicas premium de alto nivel.',
  '{
    "colors": {
      "primary": "#D4AF37",
      "secondary": "#B8860B",
      "accent": "#FFD700",
      "background": "#000000",
      "text": "#FFFFFF",
      "muted": "#1F1F1F"
    },
    "fonts": {
      "heading": "Playfair Display",
      "body": "Libre Franklin"
    },
    "style": "luxury",
    "gradients": {
      "hero": "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
      "cta": "linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)"
    }
  }'::jsonb
),
(
  'Vibrant Energy',
  'vibrant-energy',
  'Naranja y rosa vibrante. Para clínicas juveniles y energéticas.',
  '{
    "colors": {
      "primary": "#F97316",
      "secondary": "#EA580C",
      "accent": "#FB923C",
      "background": "#FFF7ED",
      "text": "#7C2D12",
      "muted": "#FFEDD5"
    },
    "fonts": {
      "heading": "Outfit",
      "body": "Inter"
    },
    "style": "vibrant",
    "gradients": {
      "hero": "linear-gradient(135deg, #F97316 0%, #EC4899 100%)",
      "cta": "linear-gradient(135deg, #FB923C 0%, #F97316 100%)"
    }
  }'::jsonb
),
(
  'Ocean Calm',
  'ocean-calm',
  'Azul marino y turquesa tranquilo. Transmite calma y confianza.',
  '{
    "colors": {
      "primary": "#0891B2",
      "secondary": "#0E7490",
      "accent": "#06B6D4",
      "background": "#F0FDFA",
      "text": "#164E63",
      "muted": "#CCFBF1"
    },
    "fonts": {
      "heading": "Sora",
      "body": "Inter"
    },
    "style": "calm",
    "gradients": {
      "hero": "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)",
      "cta": "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)"
    }
  }'::jsonb
),
(
  'Sunset Warm',
  'sunset-warm',
  'Naranja y púrpura cálido como un atardecer. Acogedor y atractivo.',
  '{
    "colors": {
      "primary": "#F59E0B",
      "secondary": "#D97706",
      "accent": "#FCD34D",
      "background": "#FFFBEB",
      "text": "#78350F",
      "muted": "#FEF3C7"
    },
    "fonts": {
      "heading": "Urbanist",
      "body": "Inter"
    },
    "style": "warm",
    "gradients": {
      "hero": "linear-gradient(135deg, #F59E0B 0%, #C026D3 100%)",
      "cta": "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)"
    }
  }'::jsonb
);

-- Insertar configuración inicial de landing del SaaS
INSERT INTO saas_landing_config (section, content) VALUES
(
  'hero',
  '{
    "title": "Sistema Podológico Profesional",
    "subtitle": "Gestiona tu clínica con tecnología de última generación",
    "cta_text": "Comenzar Gratis",
    "cta_secondary": "Ver Demo",
    "background_image": null
  }'::jsonb
),
(
  'features',
  '{
    "title": "Todo lo que necesitas",
    "items": [
      {
        "icon": "Calendar",
        "title": "Agenda Inteligente",
        "description": "Sistema de reservas online 24/7 con confirmaciones automáticas"
      },
      {
        "icon": "FileText",
        "title": "Ficha Podológica",
        "description": "Historial clínico completo y profesional para cada paciente"
      },
      {
        "icon": "Users",
        "title": "Multi-Usuario",
        "description": "Múltiples podólogos, roles y permisos configurables"
      },
      {
        "icon": "CreditCard",
        "title": "Gestión de Cobros",
        "description": "Control de pagos, recibos y facturación integrada"
      },
      {
        "icon": "Smartphone",
        "title": "100% Responsive",
        "description": "Funciona perfecto en computadora, tablet y móvil"
      },
      {
        "icon": "Shield",
        "title": "Seguro y Privado",
        "description": "Tus datos y los de tus pacientes completamente protegidos"
      }
    ]
  }'::jsonb
),
(
  'pricing',
  '{
    "title": "Planes para cada necesidad",
    "plans": [
      {
        "name": "Free",
        "price": 0,
        "description": "Para comenzar",
        "features": ["1 podólogo", "50 citas/mes", "Agenda básica", "Soporte por email"]
      },
      {
        "name": "Pro",
        "price": 29990,
        "description": "Para clínicas",
        "features": ["Hasta 5 podólogos", "Citas ilimitadas", "Ficha completa", "Reportes", "Soporte prioritario"],
        "featured": true
      },
      {
        "name": "Enterprise",
        "price": 79990,
        "description": "Sin límites",
        "features": ["Podólogos ilimitados", "Multi-sucursal", "API acceso", "Personalización", "Soporte 24/7"]
      }
    ]
  }'::jsonb
),
(
  'testimonials',
  '{
    "title": "Lo que dicen nuestros clientes",
    "items": [
      {
        "name": "Dra. María González",
        "role": "Podóloga",
        "text": "El mejor sistema que he usado. Mis pacientes aman la agenda online.",
        "rating": 5
      },
      {
        "name": "Clínica Salud Total",
        "role": "Santiago",
        "text": "Triplicamos nuestra eficiencia. El sistema es intuitivo y potente.",
        "rating": 5
      },
      {
        "name": "Dr. Carlos Ramírez",
        "role": "Director",
        "text": "La ficha podológica es exactamente lo que necesitábamos. Profesional y completa.",
        "rating": 5
      }
    ]
  }'::jsonb
),
(
  'branding',
  '{
    "logo_url": null,
    "primary_color": "#2563EB",
    "secondary_color": "#8B5CF6",
    "company_name": "Podos Pro"
  }'::jsonb
),
(
  'contact',
  '{
    "email": "contacto@podospro.com",
    "phone": "+56 9 1234 5678",
    "social": {
      "instagram": "https://instagram.com/podospro",
      "facebook": "https://facebook.com/podospro",
      "linkedin": "https://linkedin.com/company/podospro"
    }
  }'::jsonb
);