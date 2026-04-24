import { useState, useEffect } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Shield,
  Heart,
  Zap,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Footprints,
  ClipboardList,
  BarChart3,
  Clock,
  CreditCard,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    description: "Reservas online 24/7 con confirmación automática por WhatsApp. Tus pacientes agendan cuando quieran.",
  },
  {
    icon: ClipboardList,
    title: "Ficha Clínica Digital",
    description: "Historial podológico completo con fotos, diagnósticos, tratamientos y evolución del paciente.",
  },
  {
    icon: Users,
    title: "Multi-Podólogo",
    description: "Gestiona todo tu equipo. Cada profesional con su agenda, pacientes y fichas independientes.",
  },
  {
    icon: CreditCard,
    title: "Cobros Integrados",
    description: "Mercado Pago y Stripe integrados. Genera boletas, controla pagos y gestiona deudas.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Métricas",
    description: "Dashboard con KPIs de tu negocio: ingresos, citas, retención de pacientes y más.",
  },
  {
    icon: Shield,
    title: "Seguridad Clínica",
    description: "Datos encriptados, respaldos automáticos y cumplimiento de normativas de protección de datos.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crea tu clínica",
    description: "Registra tu empresa, personaliza tu perfil y configura tus servicios en minutos.",
  },
  {
    number: "02",
    title: "Agrega tu equipo",
    description: "Invita podólogos, asigna horarios y define permisos por rol.",
  },
  {
    number: "03",
    title: "Recibe pacientes",
    description: "Comparte tu link de reservas. Los pacientes agendan solos y tú gestionas todo desde el panel.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    period: "",
    description: "Ideal para comenzar",
    features: ["1 Podólogo", "50 Pacientes", "Agenda básica", "Ficha clínica", "Soporte email"],
    cta: "Comenzar gratis",
    popular: false,
  },
  {
    name: "Professional",
    price: "$29.990",
    period: "/mes",
    description: "Para clínicas en crecimiento",
    features: ["5 Podólogos", "Pacientes ilimitados", "Cobros integrados", "Reportes avanzados", "WhatsApp automático", "Soporte prioritario"],
    cta: "Comenzar ahora",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    period: "",
    description: "Multi-sucursal y a medida",
    features: ["Podólogos ilimitados", "Multi-sucursal", "API personalizada", "Integraciones custom", "Soporte dedicado 24/7", "SLA garantizado"],
    cta: "Contactar ventas",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Dra. Camila Rojas",
    role: "Podóloga Clínica, Santiago",
    text: "Desde que uso PodoAgenda mi consulta se transformó. Los pacientes reservan solos y yo me enfoco en atender.",
    rating: 5,
  },
  {
    name: "Centro PodoSalud",
    role: "Clínica con 4 podólogos",
    text: "Gestionamos 200+ citas mensuales sin estrés. Las fichas clínicas digitales son un antes y después.",
    rating: 5,
  },
  {
    name: "Dr. Andrés Muñoz",
    role: "Podología Deportiva",
    text: "La integración con WhatsApp redujo las inasistencias un 70%. Mis pacientes reciben recordatorios automáticos.",
    rating: 5,
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <SEO
        title="PodoAgenda Pro - Software de Gestión Podológica"
        description="Plataforma integral para clínicas de podología. Agenda online, fichas clínicas, cobros y más."
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Podo<span className="text-teal-600">Agenda</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#servicios" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Servicios</a>
              <a href="#como-funciona" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Cómo funciona</a>
              <a href="#precios" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Precios</a>
              <a href="#testimonios" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Testimonios</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-sm text-gray-700 hover:text-teal-600">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/login">
                <Button className="text-sm bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20">
                  Comenzar gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="absolute bottom-20 right-40 w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              La plataforma #1 para podólogos en Chile
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Tu clínica podológica,{" "}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                100% digital
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
              Agenda online, fichas clínicas, cobros integrados y WhatsApp automático.
              Todo lo que necesitas para gestionar tu consulta de forma profesional.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-base font-semibold bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/20">
                  Comenzar gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-gray-300 text-gray-700 hover:bg-gray-50">
                  Ver cómo funciona
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5,000+</div>
                  <div className="text-sm text-gray-500">Pacientes atendidos</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">12,000+</div>
                  <div className="text-sm text-gray-500">Citas gestionadas</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-sm text-gray-500">4.9/5 satisfacción</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="servicios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200">Funcionalidades</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Todo lo que tu clínica necesita
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para profesionales de la podología
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="p-8 border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-600/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200">Sencillo</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Empieza en 3 pasos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Configura tu clínica en minutos y comienza a recibir pacientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white text-2xl font-bold mb-6 shadow-xl shadow-teal-600/20">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-teal-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200">Precios</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Planes para cada etapa
            </h2>
            <p className="text-lg text-gray-600">
              Comienza gratis y escala cuando lo necesites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, i) => (
              <Card
                key={i}
                className={`p-8 relative ${
                  plan.popular
                    ? "border-2 border-teal-500 shadow-xl shadow-teal-600/10 md:scale-105"
                    : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white shadow-lg">
                    Más Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block">
                  <Button
                    className={`w-full h-12 font-semibold ${
                      plan.popular
                        ? "bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200">Testimonios</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Profesionales que confían en nosotros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-8 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border border-white" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Transforma tu clínica hoy
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            Únete a cientos de podólogos que ya gestionan su consulta de forma profesional con PodoAgenda Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 text-base font-semibold bg-white text-teal-700 hover:bg-teal-50 shadow-xl">
                Comenzar gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-teal-100 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Sin tarjeta de crédito
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Configuración en 5 minutos
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Soporte incluido
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                  <Footprints className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">PodoAgenda Pro</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                La plataforma integral para clínicas de podología. Gestiona tu consulta de forma profesional.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Producto</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#servicios" className="hover:text-white transition-colors">Servicios</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#testimonios" className="hover:text-white transition-colors">Testimonios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contacto@podoagenda.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +56 9 1234 5678
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Santiago, Chile
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-gray-300 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Términos de servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} PodoAgenda Pro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}