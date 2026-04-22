import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, Clock, Shield, Users, Star, CheckCircle, Stethoscope, FileText, TrendingUp, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <Badge variant="secondary" className="rounded-full px-4 py-1.5 w-fit">
                Sistema Podológico Profesional
              </Badge>
              <h1 className="font-heading font-bold text-5xl lg:text-6xl leading-tight">
                Cuida tus pies con
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> expertos certificados</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Agenda tu hora de manera rápida y sencilla. Atención personalizada con tecnología de punta en un ambiente profesional y acogedor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all text-base">
                  <Link href="/agenda">
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Hora Ahora
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl text-base">
                  <Link href="/#servicios">
                    Ver Servicios
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">200+ pacientes</div>
                    <div className="text-muted-foreground">satisfechos</div>
                  </div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <div className="text-sm">
                    <div className="font-semibold">4.9/5</div>
                    <div className="text-muted-foreground">valoración</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2rem] blur-3xl" />
              <Card className="relative overflow-hidden rounded-[2rem] soft-shadow border-0">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop"
                  alt="Clínica profesional"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 space-y-4">
                  <div className="glass rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span className="font-semibold">Tecnología de punta</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Equipamiento moderno y esterilización garantizada</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              Nuestros Servicios
            </Badge>
            <h2 className="font-heading font-bold text-4xl">Cuidado integral para tus pies</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ofrecemos tratamientos especializados con los más altos estándares de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Stethoscope, title: "Consulta Podológica", desc: "Evaluación completa del estado de tus pies", duration: "45 min", price: "$25.000" },
              { icon: FileText, title: "Tratamiento de Uñas", desc: "Corte profesional y tratamiento de uñas encarnadas", duration: "30 min", price: "$18.000" },
              { icon: Star, title: "Quiropodia", desc: "Eliminación de callos y durezas", duration: "40 min", price: "$22.000" },
              { icon: Shield, title: "Pie Diabético", desc: "Cuidado especializado para pacientes diabéticos", duration: "60 min", price: "$35.000" },
              { icon: TrendingUp, title: "Plantillas Ortopédicas", desc: "Diseño y confección de plantillas personalizadas", duration: "90 min", price: "$45.000" },
              { icon: Award, title: "Tratamiento de Hongos", desc: "Protocolo completo para eliminar hongos", duration: "50 min", price: "$28.000" },
            ].map((service, i) => (
              <Card key={i} className="p-6 hover-lift soft-shadow border-0 group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.desc}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                  <span className="font-semibold text-primary">{service.price}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Podólogos Section */}
      <section id="podologos" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              Nuestro Equipo
            </Badge>
            <h2 className="font-heading font-bold text-4xl">Profesionales certificados</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Podólogos con amplia experiencia y formación continua
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Dra. María González", specialty: "Podología Clínica", experience: "12 años", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop" },
              { name: "Dr. Carlos Ramírez", specialty: "Pie Diabético", experience: "10 años", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop" },
              { name: "Dra. Ana Martínez", specialty: "Biomecánica Podal", experience: "8 años", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop" },
            ].map((doctor, i) => (
              <Card key={i} className="overflow-hidden hover-lift soft-shadow border-0 group">
                <div className="relative h-80 overflow-hidden">
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-heading font-semibold text-xl">{doctor.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4 text-primary" />
                      <span>{doctor.specialty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span>{doctor.experience} de experiencia</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl" asChild>
                    <Link href={`/disponibilidad/${doctor.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}`}>
                      Ver Disponibilidad
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section id="beneficios" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              Por qué elegirnos
            </Badge>
            <h2 className="font-heading font-bold text-4xl">Beneficios de PODOS PRO</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: "Agenda Online 24/7", desc: "Reserva tu hora cuando quieras, desde cualquier lugar" },
              { icon: Clock, title: "Sin Esperas", desc: "Sistema de citas que respeta tu tiempo" },
              { icon: Shield, title: "Protocolos de Higiene", desc: "Máxima esterilización y seguridad" },
              { icon: Users, title: "Atención Personalizada", desc: "Cada paciente es único para nosotros" },
              { icon: FileText, title: "Historial Digital", desc: "Accede a tu historial clínico en cualquier momento" },
              { icon: Star, title: "Garantía de Satisfacción", desc: "Tu bienestar es nuestra prioridad" },
            ].map((benefit, i) => (
              <div key={i} className="text-center space-y-3 p-6 hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              Testimonios
            </Badge>
            <h2 className="font-heading font-bold text-4xl">Lo que dicen nuestros pacientes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Patricia S.", text: "Excelente atención, muy profesionales. El sistema de reservas es súper fácil de usar.", rating: 5 },
              { name: "Roberto M.", text: "Llevo 2 años tratándome aquí. El cuidado es impecable y siempre me siento bien atendido.", rating: 5 },
              { name: "Carmen L.", text: "Como diabética, necesito cuidado especial. Aquí encontré el equipo perfecto.", rating: 5 },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 soft-shadow border-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">Paciente verificado</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-heading font-bold text-4xl lg:text-5xl text-white">
            ¿Listo para cuidar tus pies?
          </h2>
          <p className="text-white/90 text-lg">
            Agenda tu hora ahora y experimenta la diferencia de un servicio profesional
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-2xl text-base shadow-2xl hover:scale-105 transition-transform">
            <Link href="/agenda">
              <Calendar className="w-5 h-5 mr-2" />
              Reservar Hora Ahora
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}