import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  DollarSign
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
  metadata: {
    primary_color?: string;
    secondary_color?: string;
  } | null;
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

  const [podologist, setPodologist] = useState<Podologist | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableHours, setAvailableHours] = useState<string[]>([]);

  useEffect(() => {
    if (slug) {
      loadPodologistData();
    }
  }, [slug]);

  useEffect(() => {
    if (selectedDate) {
      generateAvailableHours();
    }
  }, [selectedDate]);

  const loadPodologistData = async () => {
    try {
      setLoading(true);

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

      setPodologist({
        id: podologistData.users.id,
        name: podologistData.users.full_name,
        email: podologistData.users.email,
        role: podologistData.role,
        company_id: podologistData.company_id
      });

      // Load company
      const { data: companyData } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url, metadata")
        .eq("id", podologistData.company_id)
        .single();

      if (companyData) {
        setCompany(companyData as unknown as Company);
      }

      // Load services
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, name, description, duration_minutes, price")
        .eq("company_id", podologistData.company_id)
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

  const generateAvailableHours = () => {
    const hours: string[] = [];
    for (let hour = 8; hour < 20; hour++) {
      hours.push(`${hour.toString().padStart(2, "0")}:00`);
      hours.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    setAvailableHours(hours);
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
    if (!currentMonth) return true;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    return false;
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
  };

  const handleBookNow = () => {
    if (podologist) {
      router.push({
        pathname: "/agenda",
        query: { podologistId: podologist.id }
      });
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (notFound || !podologist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Podólogo no encontrado</h1>
          <p className="text-slate-600 mb-6">
            No pudimos encontrar la página de este podólogo.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const primaryColor = company?.metadata?.primary_color || "#2563EB";
  const secondaryColor = company?.metadata?.secondary_color || "#8B5CF6";

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  return (
    <>
      <SEO
        title={`Reservar con ${podologist.name} | ${company?.name || "Podos Pro"}`}
        description={`Agenda tu hora con ${podologist.name}. Disponibilidad en tiempo real y reserva online.`}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="h-10 w-auto" />
                ) : (
                  <div 
                    className="text-2xl font-bold bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                    }}
                  >
                    {company?.name || "Podos Pro"}
                  </div>
                )}
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="mb-12">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-5xl font-bold shadow-2xl">
                    {podologist.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <Badge className="mb-3 bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Disponible para reservas
                    </Badge>
                    <h1 className="text-4xl font-bold mb-2">{podologist.name}</h1>
                    <p className="text-xl text-blue-100 mb-4">Especialista en Podología Clínica</p>
                    <p className="text-blue-50 max-w-2xl">
                      Profesional certificado con amplia experiencia en el tratamiento y cuidado de los pies. 
                      Especializado en evaluación podológica, tratamiento de uñas, pie diabético y podología deportiva.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Services Section */}
          {services.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Servicios Disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                        }}
                      >
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">{service.name}</h3>
                        <p className="text-sm text-slate-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration_minutes} min
                      </div>
                      <div className="flex items-center font-semibold text-lg" style={{ color: primaryColor }}>
                        <DollarSign className="w-5 h-5" />
                        {service.price.toLocaleString("es-CL")}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Availability Calendar */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Disponibilidad</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={previousMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const isDisabled = isDateDisabled(day);
                    const isSelected = selectedDate?.getDate() === day && 
                                      selectedDate?.getMonth() === currentMonth.getMonth();

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        disabled={isDisabled}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                          transition-all
                          ${isDisabled 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-white hover:bg-blue-50 hover:scale-105 cursor-pointer"
                          }
                          ${isSelected ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg" : ""}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Available Hours */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {selectedDate 
                    ? `Horarios ${selectedDate.toLocaleDateString("es-CL", { day: "numeric", month: "long" })}`
                    : "Selecciona una fecha"
                  }
                </h3>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {availableHours.map((hour) => (
                      <button
                        key={hour}
                        className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-sm font-medium text-slate-700 hover:text-blue-700"
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Selecciona una fecha para ver horarios disponibles</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-3">¿Listo para agendar?</h2>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                Reserva tu hora ahora y comienza tu tratamiento con {podologist.name}
              </p>
              <Button
                size="lg"
                onClick={handleBookNow}
                className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all shadow-xl text-lg px-8 py-6"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Reservar con {podologist.name.split(" ")[0]}
              </Button>
            </div>
          </Card>

          {/* Contact Info */}
          {company && (
            <div className="mt-12">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-900">contacto@{company.slug}.cl</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Teléfono</p>
                      <p className="font-medium text-slate-900">+56 9 1234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Ubicación</p>
                      <p className="font-medium text-slate-900">Santiago, Chile</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-slate-400">
                © {new Date().getFullYear()} {company?.name || "Podos Pro"}. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}