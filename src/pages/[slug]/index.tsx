import { GetServerSideProps } from "next";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BrandedLayout } from "@/components/BrandedLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, Clock, MapPin, Phone, Mail, Globe, 
  Star, CheckCircle2, ArrowRight, Stethoscope,
  Award, Shield, Users
} from "lucide-react";

interface CompanyPageProps {
  company: any;
  services: any[];
  podiatrists: any[];
}

export default function CompanyLandingPage({ company, services, podiatrists }: CompanyPageProps) {
  const router = useRouter();
  const metadata = (company?.metadata as any) || {};
  const branding = metadata.branding || {};
  const settings = metadata.settings || {};

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="p-8 max-w-md text-center">
          <h1 className="font-heading font-bold text-2xl mb-4">Clínica no encontrada</h1>
          <p className="text-muted-foreground mb-6">
            La clínica que buscas no existe o no está disponible.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <BrandedLayout applyBranding={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {company.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-heading font-bold text-lg">{company.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {metadata.description || "Centro Podológico Profesional"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {settings.allow_patient_login && (
                <Link href={`/${company.slug}/auth?mode=login`}>
                  <Button variant="ghost" className="rounded-xl">
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
              {settings.allow_self_booking && (
                <Link href={`/${company.slug}/reservar`}>
                  <Button className="rounded-xl shadow-lg shadow-primary/20">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar Hora
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="rounded-full px-4 py-1">
                <Star className="w-3 h-3 mr-1 inline" />
                Centro Podológico Profesional
              </Badge>
              
              <h2 className="font-heading font-bold text-4xl lg:text-5xl leading-tight">
                {metadata.hero_title || `Bienvenido a ${company.name}`}
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {metadata.hero_description || 
                  "Atención podológica especializada con tecnología de última generación. Cuidamos la salud de tus pies con profesionalismo y dedicación."}
              </p>

              <div className="flex flex-wrap gap-3">
                {settings.allow_self_booking && (
                  <Link href={`/${company.slug}/reservar`}>
                    <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                      <Calendar className="w-5 h-5 mr-2" />
                      Agendar Cita Ahora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                )}
                
                {company.phone && (
                  <a href={`tel:${company.phone}`}>
                    <Button size="lg" variant="outline" className="rounded-xl">
                      <Phone className="w-5 h-5 mr-2" />
                      Llamar Ahora
                    </Button>
                  </a>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-muted-foreground">Profesionales Certificados</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="text-muted-foreground">Atención Personalizada</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-5 h-5 text-accent" />
                  <span className="text-muted-foreground">Tecnología Avanzada</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 p-1">
                <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center">
                  <Stethoscope className="w-32 h-32 text-primary/20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        {services.length > 0 && (
          <section className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <Badge className="rounded-full px-4 py-1 mb-4">
                Nuestros Servicios
              </Badge>
              <h2 className="font-heading font-bold text-3xl mb-4">
                Atención Especializada
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ofrecemos una amplia gama de servicios podológicos profesionales
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="p-6 soft-shadow border-0 hover:shadow-xl transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: service.color || '#2563EB' + '20' }}
                    >
                      <Stethoscope 
                        className="w-6 h-6" 
                        style={{ color: service.color || '#2563EB' }}
                      />
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      ${service.price?.toLocaleString('es-CL')}
                    </Badge>
                  </div>

                  <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Podiatrists Section */}
        {podiatrists.length > 0 && (
          <section className="container mx-auto px-4 py-16 bg-muted/30">
            <div className="text-center mb-12">
              <Badge className="rounded-full px-4 py-1 mb-4">
                Nuestro Equipo
              </Badge>
              <h2 className="font-heading font-bold text-3xl mb-4">
                Profesionales Especializados
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nuestro equipo de podólogos certificados está aquí para cuidar de tus pies
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podiatrists.map((podiatrist) => (
                <Card key={podiatrist.id} className="p-6 soft-shadow border-0 text-center hover:shadow-xl transition-all">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
                    {podiatrist.avatar_url ? (
                      <img 
                        src={podiatrist.avatar_url}
                        alt={podiatrist.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-white" />
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-lg mb-1">
                    {podiatrist.full_name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {podiatrist.role === 'podiatrist' ? 'Podólogo(a)' : 'Especialista'}
                  </p>

                  {settings.allow_self_booking && (
                    <Link href={`/${company.slug}/disponibilidad/${podiatrist.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl w-full">
                        Ver Disponibilidad
                      </Button>
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="p-8 soft-shadow border-0">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="font-heading font-bold text-2xl mb-6">
                  Información de Contacto
                </h2>

                <div className="space-y-4">
                  {company.address && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Dirección</p>
                        <p className="text-sm text-muted-foreground">{company.address}</p>
                        {metadata.city && (
                          <p className="text-sm text-muted-foreground">{metadata.city}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {company.phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Teléfono</p>
                        <a href={`tel:${company.phone}`} className="text-sm text-primary hover:underline">
                          {company.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.email && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <a href={`mailto:${company.email}`} className="text-sm text-primary hover:underline">
                          {company.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Sitio Web</p>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {metadata.opening_hours && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Horarios de Atención</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {metadata.opening_hours}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {settings.allow_self_booking && (
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <Calendar className="w-16 h-16 text-primary mb-4" />
                  <h3 className="font-heading font-bold text-xl mb-2">
                    ¿Listo para Agendar?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Reserva tu hora online de forma rápida y segura
                  </p>
                  <Link href={`/${company.slug}/reservar`}>
                    <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                      Reservar Hora Ahora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {company.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} {company.name}. Todos los derechos reservados.
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Powered by</span>
                <Link href="/" className="font-semibold text-primary hover:underline">
                  PODOS PRO
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrandedLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    // Fetch company by slug
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (companyError || !company) {
      return { props: { company: null, services: [], podiatrists: [] } };
    }

    // Fetch services
    const { data: services } = await supabase
      .from("services")
      .select("*")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .order("name");

    // Fetch podiatrists
    const { data: podiatrists } = await supabase
      .from("company_users")
      .select(`
        user_id,
        role,
        users (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("company_id", company.id)
      .in("role", ["podiatrist", "admin", "owner"])
      .eq("status", "active");

    // Transform podiatrists data
    const transformedPodiatrists = (podiatrists || []).map((p: any) => ({
      id: p.user_id,
      full_name: p.users?.full_name || "Profesional",
      email: p.users?.email,
      avatar_url: p.users?.avatar_url,
      role: p.role,
    }));

    return {
      props: {
        company,
        services: services || [],
        podiatrists: transformedPodiatrists,
      },
    };
  } catch (error) {
    console.error("Error fetching company data:", error);
    return { props: { company: null, services: [], podiatrists: [] } };
  }
};