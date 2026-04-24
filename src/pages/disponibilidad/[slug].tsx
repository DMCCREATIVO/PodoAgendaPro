import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  MessageCircle
} from "lucide-react";

interface Podologist {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface ThemeConfig {
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
}

interface Customization {
  theme_id: string;
  theme_config: ThemeConfig;
  custom_config: {
    hero?: {
      title?: string;
      subtitle?: string;
      bio?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
      whatsapp?: string;
      address?: string;
    };
    social?: {
      instagram?: string;
      facebook?: string;
      linkedin?: string;
      twitter?: string;
    };
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
}

export default function PodologistAvailability() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [podologist, setPodologist] = useState<Podologist | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [customization, setCustomization] = useState<Customization | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPodologistData();
    }
  }, [slug]);

  const loadPodologistData = async () => {
    try {
      // Extract name from slug (e.g., "dra-maria-gonzalez" -> search for "Maria Gonzalez")
      const nameFromSlug = (slug as string)
        .replace(/^(dr|dra|doctor|doctora)-/i, "")
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Find podologist by name through company_users
      const { data: podologistData, error: podologistError } = await supabase
        .from("company_users")
        .select(`
          role,
          company_id,
          user_id,
          users!inner (
            id,
            full_name,
            email
          )
        `)
        .eq("role", "employee")
        .eq("status", "active")
        .ilike("users.full_name", `%${nameFromSlug}%`)
        .single();

      if (podologistError || !podologistData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const pData = podologistData as any;

      setPodologist({
        id: pData.users.id,
        name: pData.users.full_name,
        email: pData.users.email,
        role: pData.role,
        company_id: pData.company_id
      });

      // Load company
      const { data: companyData } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url")
        .eq("id", pData.company_id)
        .single();

      if (companyData) {
        setCompany(companyData);
      }

      // Load customization (theme + custom config)
      const { data: customData } = await supabase
        .from("company_customization")
        .select(`
          theme_id,
          custom_config,
          theme_templates!inner (
            config
          )
        `)
        .eq("company_id", pData.company_id)
        .single();

      if (customData) {
        const cData = customData as any;
        setCustomization({
          theme_id: cData.theme_id,
          theme_config: cData.theme_templates.config,
          custom_config: cData.custom_config || {}
        });
      }

      // Load services
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, duration_minutes, price")
        .eq("company_id", pData.company_id)
        .eq("is_active", true)
        .order("name");

      if (servicesData) {
        setServices(servicesData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading podologist:", error);
      setNotFound(true);
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Past dates
    if (date < today) return true;

    // Weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;

    return false;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleBookNow = () => {
    if (podologist) {
      router.push({
        pathname: "/agenda",
        query: { podologistId: podologist.id }
      });
    }
  };

  // Get final colors (custom overrides theme)
  const getColor = (type: "primary" | "secondary" | "accent") => {
    if (customization?.custom_config?.colors?.[type]) {
      return customization.custom_config.colors[type];
    }
    return customization?.theme_config?.colors?.[type] || "#2563EB";
  };

  const primaryColor = getColor("primary");
  const secondaryColor = getColor("secondary");
  const accentColor = getColor("accent");

  const heroGradient = customization?.theme_config?.gradients?.hero || `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
  const ctaGradient = customization?.theme_config?.gradients?.cta || `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;

  // Get custom texts
  const heroTitle = customization?.custom_config?.hero?.title || `Agenda con ${podologist?.name?.split(" ")[0] || "Profesional"}`;
  const heroSubtitle = customization?.custom_config?.hero?.subtitle || "Especialista en Podología";
  const heroBio = customization?.custom_config?.hero?.bio || "Profesional certificado con amplia experiencia en el tratamiento y cuidado de los pies. Especializado en evaluación podológica, tratamiento de uñas, pie diabético y podología deportiva.";

  // Contact info
  const contactEmail = customization?.custom_config?.contact?.email || `contacto@${company?.slug || "clinica"}.cl`;
  const contactPhone = customization?.custom_config?.contact?.phone || "+56 9 1234 5678";
  const contactWhatsapp = customization?.custom_config?.contact?.whatsapp || "";
  const contactAddress = customization?.custom_config?.contact?.address || "Santiago, Chile";

  // Social media
  const socialInstagram = customization?.custom_config?.social?.instagram || "";
  const socialFacebook = customization?.custom_config?.social?.facebook || "";
  const socialLinkedin = customization?.custom_config?.social?.linkedin || "";
  const socialTwitter = customization?.custom_config?.social?.twitter || "";

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

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="p-12 text-center max-w-md">
          <User className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Podólogo no encontrado</h1>
          <p className="text-slate-600 mb-8">
            La página que buscas no existe o ha sido eliminada.
          </p>
          <Button onClick={() => router.push("/")} style={{ background: primaryColor }}>
            Volver al inicio
          </Button>
        </Card>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <>
      <SEO
        title={`${podologist?.name} - Disponibilidad`}
        description={`Reserva tu hora con ${podologist?.name}. ${heroBio}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {company?.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ background: heroGradient }}
                >
                  {company?.name?.[0] || "C"}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {company?.name || "Clínica"}
                </h1>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20" style={{ background: heroGradient }}>
          <div className="max-w-7xl mx-auto px-4">
            <Card className="p-12 text-center shadow-2xl border-0">
              <div className="flex justify-center mb-6">
                <div
                  className="relative w-32 h-32 rounded-full shadow-2xl transition-transform hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white text-5xl font-bold">
                    {podologist?.name?.[0] || "P"}
                  </div>
                </div>
              </div>

              <Badge className="mb-4" style={{ background: "#22C55E", color: "white" }}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Disponible para reservas
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                {heroTitle}
              </h1>

              <p className="text-xl text-slate-600 mb-6">
                {heroSubtitle}
              </p>

              <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
                {heroBio}
              </p>
            </Card>
          </div>
        </section>

        {/* Services */}
        {services.length > 0 && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-4" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Servicios Disponibles
              </h2>
              <p className="text-center text-slate-600 mb-12">
                Tratamientos profesionales para el cuidado de tus pies
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}
                      >
                        <Sparkles className="w-6 h-6" style={{ color: primaryColor }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                        <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {service.duration_minutes} min
                          </Badge>
                          <span className="text-xl font-bold" style={{ color: primaryColor }}>
                            ${service.price.toLocaleString("es-CL")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Availability Calendar */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Disponibilidad
            </h2>
            <p className="text-center text-slate-600 mb-12">
              Selecciona una fecha y hora para tu consulta
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="text-xl font-semibold">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-slate-600 p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(startingDayOfWeek)].map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const disabled = isDateDisabled(day);
                    const isSelected = selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === currentMonth.getMonth() &&
                      selectedDate?.getFullYear() === currentMonth.getFullYear();

                    return (
                      <button
                        key={day}
                        onClick={() => !disabled && handleDateSelect(day)}
                        disabled={disabled}
                        className={`
                          p-3 rounded-xl text-center transition-all
                          ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white hover:bg-blue-50 hover:shadow-md"}
                          ${isSelected ? "shadow-lg text-white" : ""}
                        `}
                        style={isSelected ? { background: heroGradient } : {}}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Time Slots */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">
                  {selectedDate
                    ? `Horarios ${selectedDate.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`
                    : "Selecciona una fecha"}
                </h3>

                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {generateTimeSlots().map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="transition-all"
                        style={selectedTime === time ? { background: heroGradient } : {}}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500">
                      Selecciona una fecha para ver horarios disponibles
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20" style={{ background: ctaGradient }}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Listo para agendar?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Reserva tu hora ahora y comienza tu tratamiento con {podologist?.name?.split(" ")[0]}
            </p>
            <Button
              size="lg"
              onClick={handleBookNow}
              className="bg-white hover:bg-blue-50 text-slate-900 font-semibold px-8 py-6 text-lg shadow-xl hover:scale-105 transition-transform"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Reservar con {podologist?.name?.split(" ")[0]}
            </Button>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ background: heroGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Información de Contacto
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}
                >
                  <Mail className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-slate-600">{contactEmail}</p>
              </Card>

              <Card className="p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}
                >
                  <Phone className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Teléfono</h3>
                <p className="text-slate-600">{contactPhone}</p>
                {contactWhatsapp && (
                  <a
                    href={`https://wa.me/${contactWhatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 text-green-600 hover:text-green-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </Card>

              <Card className="p-6 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}
                >
                  <MapPin className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold mb-2">Ubicación</h3>
                <p className="text-slate-600">{contactAddress}</p>
              </Card>
            </div>

            {/* Social Media */}
            {(socialInstagram || socialFacebook || socialLinkedin || socialTwitter) && (
              <div className="mt-12 text-center">
                <h3 className="font-semibold mb-6">Síguenos en Redes Sociales</h3>
                <div className="flex items-center justify-center gap-4">
                  {socialInstagram && (
                    <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}>
                      <Instagram className="w-6 h-6" style={{ color: primaryColor }} />
                    </a>
                  )}
                  {socialFacebook && (
                    <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}>
                      <Facebook className="w-6 h-6" style={{ color: primaryColor }} />
                    </a>
                  )}
                  {socialLinkedin && (
                    <a href={socialLinkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}>
                      <Linkedin className="w-6 h-6" style={{ color: primaryColor }} />
                    </a>
                  )}
                  {socialTwitter && (
                    <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)` }}>
                      <Twitter className="w-6 h-6" style={{ color: primaryColor }} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} {company?.name || "Clínica"}. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
}