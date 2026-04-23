import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, Star, Award, MapPin, Mail, Phone, CheckCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock podiatrist data - in real app, fetch by slug
const MOCK_PODIATRIST = {
  slug: "dra-gonzalez",
  name: "Dra. María González",
  specialty: "Podología Clínica",
  bio: "Especialista en podología con más de 15 años de experiencia. Enfocada en tratamientos preventivos y correctivos del pie.",
  rating: 4.9,
  reviews: 127,
  location: "Av. Principal 123, Santiago",
  email: "maria.gonzalez@podos.cl",
  phone: "+56 9 1234 5678",
  services: [
    { id: 1, name: "Consulta Podológica", duration: "45 min", price: 25000 },
    { id: 2, name: "Quiropodia", duration: "60 min", price: 22000 },
    { id: 3, name: "Pie Diabético", duration: "60 min", price: 30000 },
    { id: 4, name: "Plantillas Personalizadas", duration: "90 min", price: 45000 },
  ],
  certifications: [
    "Podóloga Clínica - Universidad de Chile",
    "Certificación en Pie Diabético",
    "Especialización en Biomecánica",
  ],
};

const MOCK_AVAILABILITY = {
  "2026-04-23": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  "2026-04-24": ["09:00", "10:30", "14:00", "15:30"],
  "2026-04-25": ["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"],
  "2026-04-28": ["09:00", "11:00", "14:00", "16:00"],
};

export default function Disponibilidad() {
  const router = useRouter();
  const { slug } = router.query;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const dateKey = selectedDate?.toISOString().split("T")[0] || "";
  const availableSlots = MOCK_AVAILABILITY[dateKey as keyof typeof MOCK_AVAILABILITY] || [];

  const handleReservar = () => {
    if (selectedDate && selectedTime) {
      router.push(`/agenda?podiatrist=${slug}&date=${dateKey}&time=${selectedTime}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 items-start">
                {/* Podiatrist Profile */}
                <div className="md:col-span-1">
                  <Card className="p-6 soft-shadow border-0 text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4" />
                    <h1 className="font-heading font-bold text-2xl mb-2">{MOCK_PODIATRIST.name}</h1>
                    <p className="text-muted-foreground mb-4">{MOCK_PODIATRIST.specialty}</p>

                    <div className="flex items-center justify-center gap-2 mb-6">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-4 h-4", i < Math.floor(MOCK_PODIATRIST.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{MOCK_PODIATRIST.rating}</span>
                      <span className="text-sm text-muted-foreground">({MOCK_PODIATRIST.reviews})</span>
                    </div>

                    <div className="space-y-3 text-sm text-left">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{MOCK_PODIATRIST.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{MOCK_PODIATRIST.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{MOCK_PODIATRIST.phone}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Bio & Certifications */}
                <div className="md:col-span-2 space-y-6">
                  <Card className="p-6 soft-shadow border-0">
                    <h2 className="font-heading font-bold text-xl mb-4">Sobre Mí</h2>
                    <p className="text-muted-foreground mb-6">{MOCK_PODIATRIST.bio}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-accent" />
                        <h3 className="font-heading font-semibold">Certificaciones</h3>
                      </div>
                      {MOCK_PODIATRIST.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 soft-shadow border-0">
                    <h2 className="font-heading font-bold text-xl mb-4">Servicios</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {MOCK_PODIATRIST.services.map((service) => (
                        <div key={service.id} className="p-4 rounded-2xl bg-muted/30">
                          <h3 className="font-semibold mb-2">{service.name}</h3>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {service.duration}
                            </span>
                            <span className="font-semibold text-primary">${service.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                  Agenda tu Consulta
                </h2>
                <p className="text-muted-foreground text-lg">
                  Selecciona fecha y horario disponible
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <Card className="p-6 soft-shadow border-0">
                  <h3 className="font-heading font-semibold text-lg mb-4">Selecciona una Fecha</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    className="rounded-2xl"
                  />
                </Card>

                {/* Available Times */}
                <Card className="p-6 soft-shadow border-0">
                  <h3 className="font-heading font-semibold text-lg mb-4">
                    Horarios Disponibles - {selectedDate?.toLocaleDateString("es-CL", { day: "numeric", month: "long" })}
                  </h3>
                  
                  {availableSlots.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        {availableSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "rounded-xl h-12 transition-all",
                              selectedTime === time && "shadow-lg shadow-primary/30"
                            )}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>

                      {selectedTime && (
                        <div className="pt-6 border-t">
                          <div className="p-4 rounded-2xl bg-accent/5 border-2 border-accent/20 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="w-5 h-5 text-accent" />
                              <span className="font-semibold">Resumen de Reserva</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha:</span>
                                <span className="font-medium">{selectedDate?.toLocaleDateString("es-CL")}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Hora:</span>
                                <span className="font-medium">{selectedTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Podólogo:</span>
                                <span className="font-medium">{MOCK_PODIATRIST.name}</span>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={handleReservar}
                            size="lg"
                            className="w-full rounded-2xl shadow-lg shadow-primary/30"
                          >
                            <CalendarIcon className="w-5 h-5 mr-2" />
                            Reservar Ahora
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No hay horarios disponibles para esta fecha</p>
                      <p className="text-sm text-muted-foreground mt-2">Por favor selecciona otra fecha</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}