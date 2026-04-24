import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, Globe, DollarSign, MessageSquare, 
  Mail, Phone, Instagram, Facebook, Linkedin, 
  Twitter, Eye, Save, Sparkles, Award, Shield, 
  Zap, Star, Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function SuperAdminLanding() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<LandingConfig>(defaultConfig);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const sessionData = localStorage.getItem("podoagenda_session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    const session = JSON.parse(sessionData);
    if (session.role !== "superadmin" && !session.isSuperadmin) {
      router.push("/login");
      return;
    }

    await loadConfig();
  };

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

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from("saas_landing_config")
        .upsert({
          section: "full_config",
          content: config as any
        }, {
          onConflict: "section"
        });

      if (error) throw error;

      toast({
        title: "Guardado",
        description: "La configuración de la landing ha sido actualizada"
      });
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando configuración...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <SEO title="Personalización Landing SaaS" />
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personalización Landing SaaS
            </h1>
            <p className="text-slate-600 mt-2">
              Personaliza la página principal de marketing
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </span>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="features">Características</TabsTrigger>
            <TabsTrigger value="pricing">Planes</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Sección Hero</h2>
              <div className="space-y-4">
                <div>
                  <Label>Título Principal</Label>
                  <Input
                    value={config.hero.title}
                    onChange={(e) => setConfig({
                      ...config,
                      hero: { ...config.hero, title: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Textarea
                    value={config.hero.subtitle}
                    onChange={(e) => setConfig({
                      ...config,
                      hero: { ...config.hero, subtitle: e.target.value }
                    })}
                    className="mt-2"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Botón CTA Principal</Label>
                    <Input
                      value={config.hero.ctaPrimary}
                      onChange={(e) => setConfig({
                        ...config,
                        hero: { ...config.hero, ctaPrimary: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Botón CTA Secundario</Label>
                    <Input
                      value={config.hero.ctaSecondary}
                      onChange={(e) => setConfig({
                        ...config,
                        hero: { ...config.hero, ctaSecondary: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Características (6 Features)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.features.map((feature, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Feature {index + 1}</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Título</Label>
                        <Input
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...config.features];
                            newFeatures[index].title = e.target.value;
                            setConfig({ ...config, features: newFeatures });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <Input
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...config.features];
                            newFeatures[index].description = e.target.value;
                            setConfig({ ...config, features: newFeatures });
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Plan Free</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Precio</Label>
                    <Input
                      value={config.pricing.free.price}
                      onChange={(e) => setConfig({
                        ...config,
                        pricing: {
                          ...config.pricing,
                          free: { ...config.pricing.free, price: e.target.value }
                        }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Features (una por línea)</Label>
                    <Textarea
                      value={config.pricing.free.features.join("\n")}
                      onChange={(e) => setConfig({
                        ...config,
                        pricing: {
                          ...config.pricing,
                          free: { 
                            ...config.pricing.free, 
                            features: e.target.value.split("\n").filter(f => f.trim()) 
                          }
                        }
                      })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </Card>

              {/* Pro Plan */}
              <Card className="p-6 border-blue-500">
                <h3 className="font-semibold mb-4">Plan Pro</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Precio</Label>
                    <Input
                      value={config.pricing.pro.price}
                      onChange={(e) => setConfig({
                        ...config,
                        pricing: {
                          ...config.pricing,
                          pro: { ...config.pricing.pro, price: e.target.value }
                        }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Features (una por línea)</Label>
                    <Textarea
                      value={config.pricing.pro.features.join("\n")}
                      onChange={(e) => setConfig({
                        ...config,
                        pricing: {
                          ...config.pricing,
                          pro: { 
                            ...config.pricing.pro, 
                            features: e.target.value.split("\n").filter(f => f.trim()) 
                          }
                        }
                      })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </Card>

              {/* Enterprise Plan */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Plan Enterprise</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Precio</Label>
                    <Input
                      value={config.pricing.enterprise.price}
                      onChange={(e) => setConfig({
                        ...config,
                        pricing: {
                          ...config.pricing,
                          enterprise: { ...config.pricing.enterprise, price: e.target.value }
                        }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Features (una por línea)</Label>
                    <Textarea
                      value={config.pricing.enterprise.features.join("\n")}
                      onChange={(e) => setConfig({
                        ...config,
                        pricing: {
                          ...config.pricing,
                          enterprise: { 
                            ...config.pricing.enterprise, 
                            features: e.target.value.split("\n").filter(f => f.trim()) 
                          }
                        }
                      })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Testimonials */}
          <TabsContent value="testimonials">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Testimonios (3)</h2>
              <div className="space-y-6">
                {config.testimonials.map((testimonial, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Testimonio {index + 1}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre</Label>
                        <Input
                          value={testimonial.name}
                          onChange={(e) => {
                            const newTestimonials = [...config.testimonials];
                            newTestimonials[index].name = e.target.value;
                            setConfig({ ...config, testimonials: newTestimonials });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Rol</Label>
                        <Input
                          value={testimonial.role}
                          onChange={(e) => {
                            const newTestimonials = [...config.testimonials];
                            newTestimonials[index].role = e.target.value;
                            setConfig({ ...config, testimonials: newTestimonials });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Testimonio</Label>
                        <Textarea
                          value={testimonial.text}
                          onChange={(e) => {
                            const newTestimonials = [...config.testimonials];
                            newTestimonials[index].text = e.target.value;
                            setConfig({ ...config, testimonials: newTestimonials });
                          }}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Branding */}
          <TabsContent value="branding">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Branding del SaaS</h2>
              <div className="space-y-4">
                <div>
                  <Label>Nombre de la Empresa</Label>
                  <Input
                    value={config.branding.companyName}
                    onChange={(e) => setConfig({
                      ...config,
                      branding: { ...config.branding, companyName: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Color Primario</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={config.branding.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, primaryColor: e.target.value }
                        })}
                        className="h-12 w-20"
                      />
                      <Input
                        value={config.branding.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, primaryColor: e.target.value }
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Color Secundario</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={config.branding.secondaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, secondaryColor: e.target.value }
                        })}
                        className="h-12 w-20"
                      />
                      <Input
                        value={config.branding.secondaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, secondaryColor: e.target.value }
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Información de Contacto</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={config.contact.email}
                      onChange={(e) => setConfig({
                        ...config,
                        contact: { ...config.contact, email: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={config.contact.phone}
                      onChange={(e) => setConfig({
                        ...config,
                        contact: { ...config.contact, phone: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Redes Sociales</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center"><Instagram className="w-4 h-4 mr-2" />Instagram</Label>
                    <Input
                      value={config.contact.instagram}
                      onChange={(e) => setConfig({
                        ...config,
                        contact: { ...config.contact, instagram: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center"><Facebook className="w-4 h-4 mr-2" />Facebook</Label>
                    <Input
                      value={config.contact.facebook}
                      onChange={(e) => setConfig({
                        ...config,
                        contact: { ...config.contact, facebook: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center"><Linkedin className="w-4 h-4 mr-2" />LinkedIn</Label>
                    <Input
                      value={config.contact.linkedin}
                      onChange={(e) => setConfig({
                        ...config,
                        contact: { ...config.contact, linkedin: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center"><Twitter className="w-4 h-4 mr-2" />Twitter</Label>
                    <Input
                      value={config.contact.twitter}
                      onChange={(e) => setConfig({
                        ...config,
                        contact: { ...config.contact, twitter: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}