import { useState } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle2, Star } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function PodiatristAvailability() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [selectedDate, setSelectedDate] = useState<string>("2026-04-25");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Mock data - podólogo
  const podiatrist = {
    slug: "dra-ana-martinez",
    name: "Dra. Ana Martínez",
    specialty: "Podóloga Clínica",
    bio: "Especialista en tratamientos podológicos integrales con más de 10 años de experiencia. Enfocada en el bienestar y salud de tus pies con tratamientos personalizados y tecnología de vanguardia.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    email: "dra.martinez@centropodosalud.cl",
    phone: "+56 9 8765 4321",
    location: "Centro PodoSalud - Av. Providencia 1234, Santiago",
    rating: 4.9,
    reviews: 127,
    specialties: [
      "Quiropodia",
      "Tratamiento de Hongos",
      "Uñas Encarnadas",
      "Callosidades",
      "Pie Diabético",
      "Biomecánica",
    ],
    certifications: [
      "Podóloga Clínica Universidad de Chile",
      "Diplomado en Pie Diabético",
      "Certificación Internacional en Onicocriptosis",
    ],
  };

  // Mock data - horarios disponibles por fecha
  const availability: Record<string, string[]> = {
    "2026-04-25": ["09:00", "10:00", "11:30", "14:00", "15:30", "16:30"],
    "2026-04-26": ["09:30", "11:00", "14:30", "16:00"],
    "2026-04-28": ["09:00", "10:30", "12:00", "15:00", "17:00"],
    "2026-04-29": ["10:00", "11:30", "14:00", "15:30", "16:30", "17:30"],
    "2026-04-30": ["09:00", "10:00", "11:00", "14:30", "16:00"],
  };

  // Fechas disponibles (próximos 7 días con disponibilidad)
  const availableDates = [
    { date: "2026-04-25", dayName: "Viernes", dayNum: "25", month: "Abril" },
    { date: "2026-04-26", dayName: "Sábado", dayNum: "26", month: "Abril" },
    { date: "2026-04-28", dayName: "Lunes", dayNum: "28", month: "Abril" },
    { date: "2026-04-29", dayName: "Martes", dayNum: "29", month: "Abril" },
    { date: "2026-04-30", dayName: "Miércoles", dayNum: "30", month: "Abril" },
  ];

  const handleBooking = () => {
    if (!selectedTime) return;
    
    // Redirigir a agenda con datos pre-seleccionados
    router.push({
      pathname: "/agenda",
      query: {
        podiatrist: podiatrist.slug,
        date: selectedDate,
        time: selectedTime,
      },
    });
  };

  return (
    <>
      <SEO
        title={`Reserva con ${podiatrist.name} - PodoAgenda Pro`}
        description={`${podiatrist.bio} Agenda tu cita online de forma fácil y rápida.`}
        image={podiatrist.avatar}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <Navigation />

        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 lg:p-12 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
              <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-start">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-4 ring-blue-100 shadow-lg">
                    <AvatarImage src={podiatrist.avatar} alt={podiatrist.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl">
                      {podiatrist.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{podiatrist.rating}</span>
                    <span className="text-sm text-gray-600">({podiatrist.reviews} reseñas)</span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-2">
                      {podiatrist.name}
                    </h1>
                    <p className="text-xl text-blue-600 font-medium">{podiatrist.specialty}</p>
                  </div>

                  <p className="text-lg text-gray-700 leading-relaxed">
                    {podiatrist.bio}
                  </p>

                  {/* Contact Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{podiatrist.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">{podiatrist.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm">{podiatrist.email}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Especialidades:</h3>
                    <div className="flex flex-wrap gap-2">
                      {podiatrist.specialties.map((specialty) => (
                        <Badge
                          key={specialty}
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Certificaciones:</h3>
                    <ul className="space-y-1">
                      {podiatrist.certifications.map((cert) => (
                        <li key={cert} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Booking Section */}
        <section className="pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-3">
                Agenda tu Cita
              </h2>
              <p className="text-lg text-gray-600">
                Selecciona un día y hora que se ajuste a tu disponibilidad
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Selección de Fecha */}
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Selecciona una Fecha
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableDates.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedTime(null);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                        selectedDate === day.date
                          ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-500/20"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-600 mb-1">{day.dayName}</div>
                      <div className="text-3xl font-bold text-gray-900">{day.dayNum}</div>
                      <div className="text-xs text-gray-500 mt-1">{day.month}</div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Selección de Hora */}
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/50">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Horarios Disponibles
                </h3>
                
                {selectedDate && availability[selectedDate] ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availability[selectedDate].map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                          selectedTime === time
                            ? "border-green-600 bg-green-50 text-green-700 shadow-lg shadow-green-500/20"
                            : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Selecciona una fecha para ver horarios disponibles
                  </div>
                )}
              </Card>
            </div>

            {/* CTA Button */}
            {selectedTime && (
              <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="inline-block p-6 bg-gradient-to-br from-blue-600 to-indigo-600 border-0 shadow-xl shadow-blue-500/30">
                  <div className="text-white mb-4">
                    <p className="text-sm font-medium mb-1">Has seleccionado:</p>
                    <p className="text-2xl font-bold">
                      {availableDates.find(d => d.date === selectedDate)?.dayName} {availableDates.find(d => d.date === selectedDate)?.dayNum} de {availableDates.find(d => d.date === selectedDate)?.month} - {selectedTime}
                    </p>
                  </div>
                  <Button
                    onClick={handleBooking}
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg text-lg px-8 py-6 h-auto font-semibold"
                  >
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                    Reservar Ahora
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}