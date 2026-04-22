import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Stethoscope, FileText, Star, Shield, TrendingUp, Award, ArrowRight, ArrowLeft, CheckCircle, User, Mail, Phone, MessageSquare } from "lucide-react";

const STEPS = [
  { number: 1, title: "Servicio", description: "Elige tu tratamiento" },
  { number: 2, title: "Podólogo", description: "Selecciona especialista" },
  { number: 3, title: "Fecha", description: "Escoge el día" },
  { number: 4, title: "Hora", description: "Elige horario" },
  { number: 5, title: "Datos", description: "Completa información" },
  { number: 6, title: "Confirmar", description: "Revisa tu reserva" },
];

const SERVICES = [
  { id: "consulta", icon: Stethoscope, title: "Consulta Podológica", desc: "Evaluación completa", duration: 45, price: 25000 },
  { id: "unas", icon: FileText, title: "Tratamiento de Uñas", desc: "Corte profesional", duration: 30, price: 18000 },
  { id: "quiropodia", icon: Star, title: "Quiropodia", desc: "Eliminación de callos", duration: 40, price: 22000 },
  { id: "diabetico", icon: Shield, title: "Pie Diabético", desc: "Cuidado especializado", duration: 60, price: 35000 },
  { id: "plantillas", icon: TrendingUp, title: "Plantillas Ortopédicas", desc: "Diseño personalizado", duration: 90, price: 45000 },
  { id: "hongos", icon: Award, title: "Tratamiento de Hongos", desc: "Protocolo completo", duration: 50, price: 28000 },
];

const PODIATRISTS = [
  { id: "maria", name: "Dra. María González", specialty: "Podología Clínica", experience: "12 años", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop" },
  { id: "carlos", name: "Dr. Carlos Ramírez", specialty: "Pie Diabético", experience: "10 años", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop" },
  { id: "ana", name: "Dra. Ana Martínez", specialty: "Biomecánica Podal", experience: "8 años", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop" },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function Agenda() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedPodiatrist, setSelectedPodiatrist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", notes: "" });

  const service = SERVICES.find(s => s.id === selectedService);
  const podiatrist = PODIATRISTS.find(p => p.id === selectedPodiatrist);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedService !== null;
      case 2: return selectedPodiatrist !== null;
      case 3: return selectedDate !== undefined;
      case 4: return selectedTime !== null;
      case 5: return formData.name && formData.email && formData.phone;
      default: return true;
    }
  };

  const handleConfirm = () => {
    alert("¡Reserva confirmada! En un sistema real, esto guardaría la cita en la base de datos.");
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="font-heading font-bold text-4xl">Reserva tu Hora</h1>
            <p className="text-muted-foreground">Sigue los pasos para agendar tu cita de manera rápida y sencilla</p>
          </div>

          <BookingStepper currentStep={currentStep} steps={STEPS} />

          <Card className="p-8 soft-shadow border-0 animate-fade-in">
            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-2xl">Selecciona el servicio</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SERVICES.map((s) => (
                    <Card
                      key={s.id}
                      className={cn(
                        "p-6 cursor-pointer transition-all duration-300 hover-lift",
                        selectedService === s.id 
                          ? "border-2 border-primary shadow-lg shadow-primary/20" 
                          : "border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedService(s.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                          selectedService === s.id 
                            ? "bg-primary text-primary-foreground scale-110" 
                            : "bg-primary/10 text-primary"
                        )}>
                          <s.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold mb-1">{s.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{s.desc}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{s.duration} min</span>
                            </div>
                            <span className="font-semibold text-primary">${s.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Podiatrist Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-2xl">Elige tu podólogo</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {PODIATRISTS.map((p) => (
                    <Card
                      key={p.id}
                      className={cn(
                        "overflow-hidden cursor-pointer transition-all duration-300 hover-lift",
                        selectedPodiatrist === p.id 
                          ? "border-2 border-primary shadow-lg shadow-primary/20" 
                          : "border hover:border-primary/50"
                      )}
                      onClick={() => setSelectedPodiatrist(p.id)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        {selectedPodiatrist === p.id && (
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center animate-scale-in">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-heading font-semibold text-lg">{p.name}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="w-4 h-4 text-primary" />
                            <span>{p.specialty}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="w-4 h-4 text-accent fill-accent" />
                            <span>{p.experience} de experiencia</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Date Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-2xl">Selecciona la fecha</h2>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-2xl border soft-shadow"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Time Selection */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="font-heading font-bold text-2xl">Elige el horario</h2>
                {selectedDate && (
                  <div className="text-center mb-4">
                    <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
                      {selectedDate.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </Badge>
                  </div>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      className={cn(
                        "rounded-2xl h-14 font-semibold transition-all",
                        selectedTime === time && "shadow-lg shadow-primary/30 scale-105"
                      )}
                      onClick={() => setSelectedTime(time)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Patient Data */}
            {currentStep === 5 && (
              <div className="space-y-6 max-w-2xl mx-auto">
                <h2 className="font-heading font-bold text-2xl">Tus datos</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ej: Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ej: juan@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Ej: +56 9 1234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Notas adicionales (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="¿Hay algo que debamos saber? Alergias, condiciones especiales, etc."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="rounded-xl min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {currentStep === 6 && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl">Revisa tu reserva</h2>
                  <p className="text-muted-foreground">Verifica que todos los datos sean correctos</p>
                </div>

                <div className="space-y-4">
                  <Card className="p-6 bg-muted/30">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Servicio</span>
                        <span className="font-semibold">{service?.title}</span>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Podólogo</span>
                        <span className="font-semibold">{podiatrist?.name}</span>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Fecha</span>
                        <span className="font-semibold">
                          {selectedDate?.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Hora</span>
                        <span className="font-semibold">{selectedTime}</span>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-muted-foreground">Duración</span>
                        <span className="font-semibold">{service?.duration} minutos</span>
                      </div>
                      <div className="flex items-center justify-between text-lg">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-primary">${service?.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-muted/30">
                    <h3 className="font-heading font-semibold mb-3">Tus datos</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{formData.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{formData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{formData.phone}</span>
                      </div>
                      {formData.notes && (
                        <div className="flex items-start gap-2 pt-2 border-t">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-1" />
                          <span className="text-muted-foreground">{formData.notes}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <Button 
                  size="lg" 
                  className="w-full rounded-2xl h-14 text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                  onClick={handleConfirm}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmar Reserva
                </Button>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 6 && (
              <div className="flex items-center justify-between mt-8 pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}