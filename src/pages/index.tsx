import { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, ArrowRight, Users, Calendar, FileText, BarChart3,
  Shield, Zap, Smartphone, Globe, Star, TrendingUp, Clock,
  Heart, Award, Target, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Sistema de citas avanzado con recordatorios automáticos y gestión de disponibilidad",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Ficha Podológica Digital",
      description: "Registro clínico completo con historial médico y seguimiento de tratamientos",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Gestión de Pacientes",
      description: "Base de datos centralizada con toda la información de tus pacientes",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reportes",
      description: "Métricas en tiempo real de tu clínica para tomar mejores decisiones",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Cumplimiento HIPAA con encriptación de datos y backups automáticos",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Smartphone,
      title: "Portal Paciente",
      description: "Tus pacientes pueden agendar, ver historial y gestionar sus citas online",
      color: "from-teal-500 to-green-500"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Ahorra 10+ horas semanales",
      description: "Automatiza tareas repetitivas y enfócate en lo que importa: tus pacientes"
    },
    {
      icon: TrendingUp,
      title: "Aumenta tus ingresos 30%",
      description: "Optimiza tu agenda, reduce ausencias y mejora la retención de pacientes"
    },
    {
      icon: Clock,
      title: "Implementación en 24 horas",
      description: "Setup rápido sin complicaciones técnicas. Empieza hoy mismo"
    },
    {
      icon: Heart,
      title: "Mejora la experiencia",
      description: "Pacientes más satisfechos con recordatorios y portal self-service"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/mes",
      description: "Perfecto para podólogos independientes",
      features: [
        "1 Podólogo",
        "Hasta 100 pacientes",
        "Agenda básica",
        "Portal paciente",
        "Soporte email"
      ],
      cta: "Empezar gratis",
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/mes",
      description: "Ideal para clínicas pequeñas",
      features: [
        "Hasta 5 Podólogos",
        "Pacientes ilimitados",
        "Ficha podológica completa",
        "Analytics avanzados",
        "Personalización de marca",
        "Recordatorios automáticos",
        "Soporte prioritario"
      ],
      cta: "Prueba 14 días gratis",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Para clínicas grandes y cadenas",
      features: [
        "Podólogos ilimitados",
        "Multi-sucursal",
        "API & Integraciones",
        "Branding white-label",
        "Capacitación dedicada",
        "Soporte 24/7",
        "SLA garantizado"
      ],
      cta: "Contactar ventas",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Dr. Carlos Fernández",
      role: "Podólogo Clínico",
      clinic: "Clínica PodoSalud",
      content: "PodoAgenda Pro transformó completamente mi práctica. Ahora puedo ver 40% más pacientes sin sacrificar calidad de atención.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop"
    },
    {
      name: "Dra. María González",
      role: "Directora Médica",
      clinic: "Centro Podológico Integral",
      content: "La mejor inversión que hemos hecho. El portal de pacientes redujo las llamadas telefónicas en un 70%.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=120&h=120&fit=crop"
    },
    {
      name: "Dr. Juan Pérez",
      role: "Podólogo Deportivo",
      clinic: "SportPodo",
      content: "Impresionante. La ficha digital me permite dar seguimiento preciso a atletas de alto rendimiento.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&h=120&fit=crop"
    },
    {
      name: "Dra. Ana Martínez",
      specialty: "Podología Deportiva",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
      rating: 4.9,
      patients: 250,
      content: "PodoAgenda Pro transformó completamente mi práctica. Ahora puedo ver 40% más pacientes sin sacrificar calidad de atención.",
    }
  ];

  const stats = [
    { value: "5,000+", label: "Citas Mensuales" },
    { value: "98%", label: "Satisfacción" },
    { value: "2,500+", label: "Podólogos" },
    { value: "24/7", label: "Disponibilidad" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="space-y-8 animate-fade-in">
              <Badge variant="outline" className="rounded-full px-4 py-2 border-primary/20 bg-primary/5">
                <Sparkles className="w-3 h-3 mr-2 inline" />
                El Sistema SaaS #1 para Podólogos
              </Badge>

              <div className="space-y-4">
                <h1 className="font-heading font-bold text-5xl lg:text-6xl leading-tight">
                  Gestiona tu Clínica Podológica de Forma
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Inteligente</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Agenda digital, ficha clínica completa y portal para pacientes. 
                  Todo en una plataforma moderna y fácil de usar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-2xl text-lg px-8 shadow-xl shadow-primary/30 group" asChild>
                  <Link href="/auth">
                    Empezar Gratis
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl text-lg px-8" asChild>
                  <Link href="#demo">
                    Ver Demo
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Calificación 5.0 de <span className="font-semibold">2,500+ podólogos</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative animate-fade-in-up">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop" 
                  alt="Dashboard Preview"
                  className="rounded-2xl shadow-xl"
                />
                
                {/* Floating Stats */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">+42%</p>
                      <p className="text-xs text-muted-foreground">Eficiencia</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2,847</p>
                      <p className="text-xs text-muted-foreground">Pacientes Activos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="rounded-full mb-4">
              Funcionalidades Completas
            </Badge>
            <h2 className="font-heading font-bold text-4xl lg:text-5xl mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Diseñado específicamente para podólogos y clínicas podológicas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={cn(
                  "p-6 soft-shadow border-0 hover:scale-105 transition-transform duration-300 cursor-pointer group"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                  feature.color
                )}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="rounded-full mb-4">
              ¿Por qué PodoAgenda Pro?
            </Badge>
            <h2 className="font-heading font-bold text-4xl lg:text-5xl mb-4">
              Beneficios reales para tu práctica
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex gap-4 p-6 rounded-2xl bg-background border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="rounded-full mb-4">
              Testimonios
            </Badge>
            <h2 className="font-heading font-bold text-4xl lg:text-5xl mb-4">
              Amado por podólogos en todo el país
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 soft-shadow border-0">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.clinic}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="rounded-full mb-4">
              Planes & Precios
            </Badge>
            <h2 className="font-heading font-bold text-4xl lg:text-5xl mb-4">
              Elige el plan perfecto para ti
            </h2>
            <p className="text-xl text-muted-foreground">
              Sin contratos. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={cn(
                  "p-8 border-2 transition-all hover:scale-105",
                  plan.popular 
                    ? "border-primary shadow-2xl shadow-primary/20 soft-shadow-lg relative" 
                    : "border-border soft-shadow"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent border-0">
                    Más Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="font-heading font-bold text-2xl mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-heading font-bold text-5xl">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  size="lg" 
                  className={cn(
                    "w-full rounded-xl",
                    plan.popular 
                      ? "shadow-lg shadow-primary/30" 
                      : ""
                  )}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth">
                    {plan.cta}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8">
            ¿Necesitas algo diferente? <Link href="#" className="text-primary hover:underline font-semibold">Contáctanos</Link>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center soft-shadow-lg border-0 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Únete a miles de podólogos que ya optimizaron su práctica con PodoAgenda Pro
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a miles de podólogos que ya optimizaron su práctica con PODOS PRO
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Input 
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl max-w-xs"
              />
              <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/30" asChild>
                <Link href="/auth">
                  Empezar Ahora Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              14 días de prueba gratis • Sin tarjeta de crédito • Cancela cuando quieras
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}