import { useState, useEffect } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Award,
  Shield,
  Sparkles,
  Heart,
  Target,
  Zap,
  Star,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  ArrowRight,
  Stethoscope
} from "lucide-react";

interface LandingConfig {
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  pricing: {
    free: { price: string; features: string[] };
    pro: { price: string; features: string[] };
    enterprise: { price: string; features: string[] };
  };
  testimonials: Array<{
    name: string;
    role: string;
    text: string;
    rating: number;
  }>;
  branding: {
    companyName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
  };
  contact: {
    email: string;
    phone: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    twitter: string;
  };
}

const defaultConfig: LandingConfig = {
  hero: {
    title: "El Sistema Podológico del Futuro",
    subtitle: "Gestiona tu clínica de forma profesional con tecnología de última generación",
    ctaPrimary: "Comenzar Gratis",
    ctaSecondary: "Ver Demo"
  },
  features: [
    { icon: "calendar", title: "Agenda Inteligente", description: "Sistema de reservas online 24/7" },
    { icon: "heart", title: "Ficha Podológica", description: "Registro clínico completo" },
    { icon: "users", title: "Multi-Usuario", description: "Para todo tu equipo" },
    { icon: "chart", title: "Reportes", description: "Análisis de tu negocio" },
    { icon: "shield", title: "Seguro", description: "Protección de datos" },
    { icon: "zap", title: "Rápido", description: "Optimizado para velocidad" }
  ],
  pricing: {
    free: { price: "Gratis", features: ["1 Podólogo", "50 Pacientes", "Agenda básica", "Soporte email"] },
    pro: { price: "$29", features: ["5 Podólogos", "500 Pacientes", "Todas las funciones", "Soporte prioritario"] },
    enterprise: { price: "Custom", features: ["Ilimitado", "Personalización", "API Access", "Soporte 24/7"] }
  },
  testimonials: [
    { name: "Dr. Juan Pérez", role: "Podólogo Clínico", text: "La mejor herramienta para mi práctica", rating: 5 },
    { name: "Clínica Salud", role: "Centro Médico", text: "Aumentó nuestra eficiencia 300%", rating: 5 },
    { name: "Dra. Ana López", role: "Podología Deportiva", text: "Imprescindible para profesionales", rating: 5 }
  ],
  branding: {
    companyName: "PodosPro",
    logoUrl: "",
    primaryColor: "#2563EB",
    secondaryColor: "#8B5CF6"
  },
  contact: {
    email: "contacto@podospro.com",
    phone: "+56 9 1234 5678",
    instagram: "https://instagram.com/podospro",
    facebook: "https://facebook.com/podospro",
    linkedin: "https://linkedin.com/company/podospro",
    twitter: "https://twitter.com/podospro"
  }
};

export default function Home() {
  const [config, setConfig] = useState<LandingConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from("saas_landing_config")
        .select("*")
        .eq("section", "full_config")
        .single();

      if (data && data.content) {
        setConfig(data.content as unknown as LandingConfig);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading config:", error);
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      calendar: Clock,
      heart: Heart,
      users: Users,
      chart: Award,
      shield: Shield,
      zap: Zap,
      stethoscope: Stethoscope,
      sparkles: Sparkles,
      target: Target
    };
    return icons[iconName] || Sparkles;
  };

  const primaryColor = config.branding.primaryColor;
  const secondaryColor = config.branding.secondaryColor;
  const heroGradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: heroGradient }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={config.branding.companyName}
        description={config.hero.subtitle}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                style={{ background: heroGradient }}
              >
                {config.branding.companyName[0]}
              </div>
              <span className="text-xl font-bold" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {config.branding.companyName}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#servicios" className="text-slate-600 hover:text-slate-900 transition-colors">
                Servicios
              </a>
              <a href="#precios" className="text-slate-600 hover:text-slate-900 transition-colors">
                Precios
              </a>
              <a href="#testimonios" className="text-slate-600 hover:text-slate-900 transition-colors">
                Testimonios
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link href="/agenda">
                <Button style={{ background: heroGradient }}>
                  {config.hero.ctaPrimary}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4" style={{ background: `${heroGradient}, radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)` }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Tecnología de última generación
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {config.hero.title}
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {config.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/agenda">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-blue-50 font-semibold shadow-xl">
                    {config.hero.ctaPrimary}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  {config.hero.ctaSecondary}
                </Button>
              </div>
              <div className="mt-12 flex items-center gap-8">
                <div>
                  <div className="text-3xl font-bold text-white">5000+</div>
                  <div className="text-white/80 text-sm">Pacientes Felices</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">15+</div>
                  <div className="text-white/80 text-sm">Años de Experiencia</div>
                </div>
                <div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-white/80 text-sm mt-1">Excelencia</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8" style={{ color: primaryColor }} />
                  <span className="font-semibold text-lg">Atención Certificada</span>
                </div>
                <p className="text-slate-600">
                  Sistema profesional avalado por expertos en podología y tecnología médica
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="servicios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Todo lo que necesitas
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Un sistema completo para gestionar tu clínica podológica de forma profesional
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.features.map((feature, index) => {
              const Icon = getIcon(feature.icon);
              return (
                <Card key={index} className="p-8 hover:shadow-xl transition-all hover:scale-105">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Planes para todos
            </h2>
            <p className="text-xl text-slate-600">
              Elige el plan que mejor se adapte a tu clínica
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">{config.pricing.free.price}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {config.pricing.free.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline">Comenzar Gratis</Button>
            </Card>

            {/* Pro */}
            <Card className="p-8 border-2 shadow-xl scale-105" style={{ borderColor: primaryColor }}>
              <Badge className="mb-4" style={{ background: primaryColor }}>Más Popular</Badge>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">{config.pricing.pro.price}</span>
                <span className="text-slate-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {config.pricing.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" style={{ background: heroGradient }}>Comenzar Ahora</Button>
            </Card>

            {/* Enterprise */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">{config.pricing.enterprise.price}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {config.pricing.enterprise.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline">Contactar Ventas</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-slate-600">
              Miles de profesionales confían en nosotros
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: heroGradient }}
                  >
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20" style={{ background: heroGradient }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para transformar tu clínica?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a miles de profesionales que ya están usando {config.branding.companyName}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/agenda">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-blue-50 font-semibold shadow-xl">
                {config.hero.ctaPrimary}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Atención Inmediata</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Profesionales Certificados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Tecnología Avanzada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ background: heroGradient }}
                >
                  {config.branding.companyName[0]}
                </div>
                <span className="text-xl font-bold">{config.branding.companyName}</span>
              </div>
              <p className="text-slate-400">
                La mejor plataforma para gestionar tu clínica podológica
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Agenda Online</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ficha Clínica</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reportes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {config.contact.email}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {config.contact.phone}
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Santiago, Chile
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Redes Sociales</h4>
              <div className="flex gap-3">
                {config.contact.instagram && (
                  <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {config.contact.facebook && (
                  <a href={config.contact.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {config.contact.linkedin && (
                  <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {config.contact.twitter && (
                  <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} {config.branding.companyName}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}