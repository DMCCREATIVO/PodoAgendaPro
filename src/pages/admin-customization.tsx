import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Globe, Phone, Mail, MapPin, Instagram, Facebook, Linkedin, Twitter, MessageCircle, Eye, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ThemeTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  config: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      muted: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    style: string;
    gradients: {
      hero: string;
      cta: string;
    };
  };
}

interface Company {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCustomization() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState<ThemeTemplate[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  // Customization fields
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroBio, setHeroBio] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [customPrimary, setCustomPrimary] = useState("");
  const [customSecondary, setCustomSecondary] = useState("");
  const [customAccent, setCustomAccent] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    const session = JSON.parse(sessionData);
    if (session.role !== "admin") {
      router.push("/login");
      return;
    }

    await loadData(session.email);
  };

  const loadData = async (email: string) => {
    try {
      // Get user and company
      const { data: userData } = await supabase
        .from("users")
        .select("id, company_id, companies!inner(id, name, slug)")
        .eq("email", email)
        .single();

      if (userData && userData.companies) {
        const comp = userData.companies as any;
        setCompany({
          id: comp.id,
          name: comp.name,
          slug: comp.slug
        });

        // Load themes
        const { data: themesData } = await supabase
          .from("theme_templates")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (themesData) {
          setThemes(themesData as ThemeTemplate[]);
        }

        // Load existing customization
        const { data: customData } = await supabase
          .from("company_customization")
          .select("*")
          .eq("company_id", comp.id)
          .single();

        if (customData) {
          setSelectedTheme(customData.theme_id);
          const config = customData.custom_config as any;
          setHeroTitle(config.hero?.title || "");
          setHeroSubtitle(config.hero?.subtitle || "");
          setHeroBio(config.hero?.bio || "");
          setPhone(config.contact?.phone || "");
          setEmail(config.contact?.email || "");
          setWhatsapp(config.contact?.whatsapp || "");
          setAddress(config.contact?.address || "");
          setInstagram(config.social?.instagram || "");
          setFacebook(config.social?.facebook || "");
          setLinkedin(config.social?.linkedin || "");
          setTwitter(config.social?.twitter || "");
          setCustomPrimary(config.colors?.primary || "");
          setCustomSecondary(config.colors?.secondary || "");
          setCustomAccent(config.colors?.accent || "");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company || !selectedTheme) {
      toast({
        title: "Error",
        description: "Por favor selecciona un tema",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const customConfig = {
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle,
          bio: heroBio
        },
        contact: {
          phone,
          email,
          whatsapp,
          address
        },
        social: {
          instagram,
          facebook,
          linkedin,
          twitter
        },
        colors: {
          primary: customPrimary,
          secondary: customSecondary,
          accent: customAccent
        }
      };

      // Upsert customization
      const { error } = await supabase
        .from("company_customization")
        .upsert({
          company_id: company.id,
          theme_id: selectedTheme,
          custom_config: customConfig
        }, {
          onConflict: "company_id"
        });

      if (error) throw error;

      toast({
        title: "Guardado",
        description: "Tu personalización ha sido guardada exitosamente"
      });
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la personalización",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (company) {
      window.open(`/disponibilidad/${company.slug}`, "_blank");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando personalización...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SEO title="Personalización Web" />
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personalización Web
            </h1>
            <p className="text-slate-600 mt-2">
              Personaliza tu página de disponibilidad pública
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

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme">
              <Palette className="w-4 h-4 mr-2" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="content">
              <Globe className="w-4 h-4 mr-2" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="w-4 h-4 mr-2" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Sparkles className="w-4 h-4 mr-2" />
              Colores
            </TabsTrigger>
          </TabsList>

          {/* Theme Selection */}
          <TabsContent value="theme">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Selecciona tu Tema</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      selectedTheme === theme.id
                        ? "border-blue-500 shadow-lg scale-105"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div
                      className="h-32 rounded-lg mb-3"
                      style={{
                        background: theme.config.gradients.hero
                      }}
                    />
                    <h3 className="font-semibold text-sm mb-1">{theme.name}</h3>
                    <p className="text-xs text-slate-600">{theme.description}</p>
                    <div className="flex gap-1 mt-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: theme.config.colors.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: theme.config.colors.secondary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: theme.config.colors.accent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Content */}
          <TabsContent value="content">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Contenido de la Página</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="hero-title">Título Principal</Label>
                  <Input
                    id="hero-title"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="ej: Bienvenido a Nuestra Clínica"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Subtítulo</Label>
                  <Input
                    id="hero-subtitle"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="ej: Cuidado profesional para tus pies"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-bio">Biografía / Descripción</Label>
                  <Textarea
                    id="hero-bio"
                    value={heroBio}
                    onChange={(e) => setHeroBio(e.target.value)}
                    placeholder="Describe tu clínica o especialidad..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Contact & Social */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Información de Contacto
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+56 9 1234 5678"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contacto@clinica.cl"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+56912345678"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Av. Providencia 123, Santiago"
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Redes Sociales</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instagram" className="flex items-center">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/tu_clinica"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="flex items-center">
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://facebook.com/tu_clinica"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin" className="flex items-center">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/company/tu_clinica"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="flex items-center">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://twitter.com/tu_clinica"
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Custom Colors */}
          <TabsContent value="colors">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Personalizar Colores</h2>
              <p className="text-slate-600 mb-6">
                Deja vacío para usar los colores del tema seleccionado
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="color-primary">Color Primario</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="color-primary"
                      type="color"
                      value={customPrimary || "#2563EB"}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="h-12 w-20"
                    />
                    <Input
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      placeholder="#2563EB"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="color-secondary">Color Secundario</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="color-secondary"
                      type="color"
                      value={customSecondary || "#8B5CF6"}
                      onChange={(e) => setCustomSecondary(e.target.value)}
                      className="h-12 w-20"
                    />
                    <Input
                      value={customSecondary}
                      onChange={(e) => setCustomSecondary(e.target.value)}
                      placeholder="#8B5CF6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="color-accent">Color de Acento</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="color-accent"
                      type="color"
                      value={customAccent || "#3B82F6"}
                      onChange={(e) => setCustomAccent(e.target.value)}
                      className="h-12 w-20"
                    />
                    <Input
                      value={customAccent}
                      onChange={(e) => setCustomAccent(e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}