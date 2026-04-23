import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Mail, Phone, MapPin, CheckCircle, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Disponibilidad() {
  const router = useRouter();
  const { slug } = router.query;
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock podologist data - will be replaced with real data
  const podologist = {
    id: 1,
    name: "Dr. Carlos Ramírez",
    specialty: "Podólogo Especialista",
    avatar: "",
    bio: "Podólogo certificado con más de 10 años de experiencia en tratamiento integral del pie. Especializado en pie diabético, biomecánica y podología deportiva.",
    email: "carlos.ramirez@clinica.cl",
    phone: "+56 9 8765 4321",
    location: "Providencia, Santiago",
    rating: 4.9,
    reviews: 127,
    yearsExperience: 10,
    certifications: ["Podología Clínica", "Pie Diabético", "Biomecánica"],
  };

  // Mock services - will be replaced with real data
  const services = [
    { id: 1, name: "Consulta Podológica", duration: 30, price: 25000, description: "Evaluación completa del pie" },
    { id: 2, name: "Quiropodia", duration: 45, price: 18000, description: "Corte de uñas y tratamiento de callosidades" },
    { id: 3, name: "Tratamiento Hongos", duration: 60, price: 35000, description: "Tratamiento especializado para onicomicosis" },
  ];

  // Mock available times - will be replaced with real schedule
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleBooking = () => {
    if (!selectedTime) {
      toast({
        title: "Selecciona un horario",
        description: "Por favor elige una hora disponible para continuar",
        variant: "destructive",
      });
      return;
    }

    // Redirect to booking flow with pre-selected data
    router.push(`/agenda?podologist=${podologist.id}&date=${selectedDate?.toISOString().split('T')[0]}&time=${selectedTime}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <Badge variant="secondary" className="rounded-full mb-4">
              Agenda Online
            </Badge>
            <h1 className="font-heading font-bold text-4xl mb-4">
              Reserva tu Hora con {podologist.name}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Selecciona el día y hora que más te acomode para tu atención podológica
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Podologist Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card className="p-6 soft-shadow border-0 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="font-heading font-bold text-xl mb-1">{podologist.name}</h2>
                  <p className="text-muted-foreground">{podologist.specialty}</p>
                  
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{podologist.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({podologist.reviews} reseñas)</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Experiencia</p>
                      <p className="text-muted-foreground">{podologist.yearsExperience} años de práctica</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-muted-foreground">{podologist.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Teléfono</p>
                      <p className="text-muted-foreground">{podologist.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Ubicación</p>
                      <p className="text-muted-foreground">{podologist.location}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* About Card */}
              <Card className="p-6 soft-shadow border-0 animate-fade-in">
                <h3 className="font-semibold mb-3">Acerca de</h3>
                <p className="text-sm text-muted-foreground mb-4">{podologist.bio}</p>
                
                <div>
                  <p className="font-semibold text-sm mb-2">Certificaciones</p>
                  <div className="flex flex-wrap gap-2">
                    {podologist.certifications.map((cert, i) => (
                      <Badge key={i} variant="outline" className="rounded-full text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Services Card */}
              <Card className="p-6 soft-shadow border-0 animate-fade-in">
                <h3 className="font-semibold mb-4">Servicios Disponibles</h3>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="p-3 rounded-xl bg-muted/30">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm">{service.name}</p>
                        <Badge variant="outline" className="rounded-full text-xs">
                          ${service.price.toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{service.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Calendar & Time Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Calendar Card */}
              <Card className="p-6 soft-shadow border-0 animate-fade-in">
                <h2 className="font-heading font-bold text-2xl mb-6">Selecciona Fecha y Hora</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Elige un día
                    </h3>
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="rounded-xl border shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-3">
                      * Domingos no disponibles
                    </p>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Elige una hora
                    </h3>
                    
                    {!selectedDate ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Selecciona primero una fecha
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">MAÑANA</p>
                          <div className="grid grid-cols-3 gap-2">
                            {availableTimes.filter(t => parseInt(t.split(':')[0]) < 12).map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "rounded-xl font-semibold transition-all",
                                  selectedTime === time && "shadow-lg shadow-primary/20"
                                )}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">TARDE</p>
                          <div className="grid grid-cols-3 gap-2">
                            {availableTimes.filter(t => parseInt(t.split(':')[0]) >= 12).map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "rounded-xl font-semibold transition-all",
                                  selectedTime === time && "shadow-lg shadow-primary/20"
                                )}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Summary Card */}
              {selectedDate && selectedTime && (
                <Card className="p-6 soft-shadow border-2 border-accent bg-gradient-to-br from-accent/5 to-background animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl">Resumen de tu Reserva</h3>
                      <p className="text-sm text-muted-foreground">Verifica los detalles antes de confirmar</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Podólogo</p>
                          <p className="font-semibold">{podologist.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha</p>
                          <p className="font-semibold">
                            {selectedDate.toLocaleDateString('es-CL', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Hora</p>
                          <p className="font-semibold">{selectedTime} hrs</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBooking}
                    size="lg"
                    className="w-full rounded-xl shadow-lg shadow-accent/30 text-base"
                  >
                    Continuar con Reserva
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Al continuar, serás redirigido al formulario de reserva
                  </p>
                </Card>
              )}

              {/* Help Card */}
              <Card className="p-6 soft-shadow border-0 bg-muted/30 animate-fade-in">
                <h3 className="font-semibold mb-3">¿Necesitas ayuda?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Si tienes dudas o necesitas cambiar tu hora, contáctanos:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="rounded-xl" asChild>
                    <a href={`tel:${podologist.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" asChild>
                    <a href={`mailto:${podologist.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}