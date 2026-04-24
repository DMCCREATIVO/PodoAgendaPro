import { useState } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Heart,
  Shield,
  Clock,
  Award,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Calendar,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Evaluación Podológica",
    description: "Diagnóstico completo del estado de tus pies con tecnología avanzada",
  },
  {
    icon: Heart,
    title: "Tratamiento de Uñas",
    description: "Cuidado profesional de uñas encarnadas, hongos y problemas comunes",
  },
  {
    icon: Shield,
    title: "Pie Diabético",
    description: "Atención especializada y preventiva para pacientes diabéticos",
  },
  {
    icon: Sparkles,
    title: "Podología Deportiva",
    description: "Optimiza tu rendimiento y previene lesiones deportivas",
  },
  {
    icon: Target,
    title: "Plantillas Personalizadas",
    description: "Diseño y fabricación de plantillas ortopédicas a medida",
  },
  {
    icon: Zap,
    title: "Tratamiento de Callos",
    description: "Eliminación profesional de callosidades y durezas",
  },
];

const podiatrists = [
  {
    name: "Dra. María González",
    specialty: "Podología Clínica",
    image: "/podiatrist1.jpg",
    color: "from-blue-500 to-purple-600",
  },
  {
    name: "Dr. Carlos Ramírez",
    specialty: "Pie Diabético",
    image: "/podiatrist2.jpg",
    color: "from-purple-500 to-pink-600",
  },
  {
    name: "Dra. Ana Martínez",
    specialty: "Podología Deportiva",
    image: "/podiatrist3.jpg",
    color: "from-pink-500 to-red-600",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Agenda Online 24/7",
    description: "Reserva tu hora cuando quieras, desde cualquier dispositivo",
  },
  {
    icon: Users,
    title: "Equipo Profesional",
    description: "Podólogos certificados con años de experiencia",
  },
  {
    icon: Award,
    title: "Tecnología Avanzada",
    description: "Equipamiento de última generación para tu cuidado",
  },
  {
    icon: Shield,
    title: "Atención Personalizada",
    description: "Tratamientos adaptados a tus necesidades específicas",
  },
];

const testimonials = [
  {
    name: "Patricia Silva",
    role: "Paciente desde 2023",
    content: "Excelente atención, muy profesionales. Solucionaron mi problema de uñas encarnadas en pocas sesiones.",
    rating: 5,
    avatar: "P",
  },
  {
    name: "Roberto Pérez",
    role: "Paciente diabético",
    content: "El seguimiento que me dan es increíble. Me siento seguro sabiendo que mis pies están en buenas manos.",
    rating: 5,
    avatar: "R",
  },
  {
    name: "Carmen Díaz",
    role: "Atleta amateur",
    content: "Las plantillas personalizadas mejoraron mi rendimiento. No más dolores después de correr.",
    rating: 5,
    avatar: "C",
  },
];

export default function LandingPage() {
  return (
    <>
      <SEO 
        title="PODOS PRO - Sistema Podológico Profesional"
        description="Agenda online, atención profesional y tecnología avanzada para el cuidado de tus pies"
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PODOS PRO
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#servicios" className="text-slate-600 hover:text-blue-600 transition-colors">
                Servicios
              </a>
              <a href="#podologos" className="text-slate-600 hover:text-blue-600 transition-colors">
                Podólogos
              </a>
              <a href="#testimonios" className="text-slate-600 hover:text-blue-600 transition-colors">
                Testimonios
              </a>
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/agenda">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Agendar Hora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)] -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                ✨ Tecnología de última generación
              </Badge>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                Cuidado{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Profesional
                </span>
                <br />
                para tus Pies
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                Agenda online, atención personalizada y los mejores especialistas en podología. 
                Tu bienestar comienza desde los pies.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/agenda">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 w-full sm:w-auto group"
                  >
                    Agendar Hora
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 w-full sm:w-auto"
                  onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Conocer Servicios
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">5000+</div>
                  <div className="text-sm text-slate-600">Pacientes Felices</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">15+</div>
                  <div className="text-sm text-slate-600">Años Experiencia</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-sm text-slate-600">Excelencia</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Stethoscope className="h-32 w-32 text-blue-300" />
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Atención Certificada</div>
                  <div className="text-sm text-slate-600">Podólogos profesionales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 mb-4">
              Nuestros Servicios
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Soluciones Completas para tus Pies
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de tratamientos podológicos con tecnología avanzada
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 group cursor-pointer"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Podiatrists Section */}
      <section id="podologos" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 mb-4">
              Nuestro Equipo
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Conoce a Nuestros Especialistas
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Profesionales certificados con años de experiencia en podología
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {podiatrists.map((podiatrist, index) => (
              <Card 
                key={index}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-slate-200 group"
              >
                <div className="p-8 text-center">
                  <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${podiatrist.color} mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold group-hover:scale-110 transition-transform`}>
                    {podiatrist.name[0]}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{podiatrist.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{podiatrist.specialty}</p>
                  <Button variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Disponibilidad
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 mb-4">
              ¿Por qué elegirnos?
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Tu Salud es Nuestra Prioridad
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0 mb-4">
              Testimonios
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Lo que Dicen Nuestros Pacientes
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Miles de pacientes satisfechos confían en nosotros
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            ¿Listo para Cuidar tus Pies?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Agenda tu hora online en minutos. Atención profesional, tecnología avanzada, resultados garantizados.
          </p>
          <Link href="/agenda">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6 group"
            >
              Agendar Hora Ahora
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <span>Atención Inmediata</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <span>Profesionales Certificados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <span>Tecnología Avanzada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">PODOS PRO</span>
              </div>
              <p className="text-slate-400">
                Sistema podológico profesional para el cuidado integral de tus pies.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Servicios</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Evaluación Podológica</li>
                <li>Tratamiento de Uñas</li>
                <li>Pie Diabético</li>
                <li>Podología Deportiva</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contacto</h3>
              <ul className="space-y-2 text-slate-400">
                <li>📧 info@podospro.com</li>
                <li>📞 +56 9 1234 5678</li>
                <li>📍 Av. Principal 123, Santiago</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Horarios</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Lunes - Viernes: 9:00 - 19:00</li>
                <li>Sábado: 9:00 - 14:00</li>
                <li>Domingo: Cerrado</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} PODOS PRO. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}