import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Heart,
  Stethoscope,
  Target,
  Zap,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string | null;
};

type Podologist = {
  id: string;
  full_name: string;
  email: string;
  specialty?: string;
};

export default function AgendaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Service
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Step 2: Podologist
  const [podologists, setPodologists] = useState<Podologist[]>([]);
  const [selectedPodologist, setSelectedPodologist] = useState<Podologist | null>(null);

  // Step 3: Date & Time
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Step 4: Patient Data
  const [patientData, setPatientData] = useState({
    full_name: "",
    email: "",
    phone: "",
    rut: "",
  });

  // Step 5: Confirmation
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadPodologists();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedDate && selectedPodologist) {
      generateAvailableTimes();
    }
  }, [selectedDate, selectedPodologist]);

  const loadServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");

    setServices(data || []);
  };

  const loadPodologists = async () => {
    // Get all active employees from the first company (demo)
    const { data: companyUsers } = await supabase
      .from("company_users")
      .select(`
        user_id,
        users!inner (
          id,
          full_name,
          email,
          is_active
        )
      `)
      .eq("role", "employee")
      .eq("status", "active")
      .limit(1, { foreignTable: "company_id" });

    const mapped = (companyUsers || [])
      .filter((cu: any) => cu.users?.is_active)
      .map((cu: any) => ({
        id: cu.users.id,
        full_name: cu.users.full_name,
        email: cu.users.email,
        specialty: "Podología Clínica",
      }));

    setPodologists(mapped);
  };

  const generateAvailableTimes = () => {
    if (!selectedDate || !selectedService) return;

    const times: string[] = [];
    const duration = selectedService.duration_minutes;
    
    // Generate times from 8:00 to 20:00 in blocks based on duration
    let currentTime = 8 * 60; // 8:00 in minutes
    const endTime = 20 * 60; // 20:00 in minutes

    while (currentTime + duration <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      times.push(timeString);
      currentTime += duration;
    }

    setAvailableTimes(times);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    return false;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedPodologist !== null;
      case 3:
        return selectedDate !== null && selectedTime !== null;
      case 4:
        return (
          patientData.full_name.trim() !== "" &&
          patientData.email.trim() !== "" &&
          patientData.phone.trim() !== "" &&
          patientData.rut.trim() !== ""
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedPodologist || !selectedDate || !selectedTime) {
      return;
    }

    setLoading(true);

    try {
      // 1. Create or get client
      let clientId: string;
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("email", patientData.email)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Get first company (demo)
        const { data: firstCompany } = await supabase
          .from("companies")
          .select("id")
          .limit(1)
          .single();

        const newClientId = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { 
              const r = Math.random() * 16 | 0; 
              return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); 
            });

        const { error: clientError } = await supabase.from("clients").insert([{
          id: newClientId,
          name: patientData.full_name,
          email: patientData.email,
          phone: patientData.phone,
          company_id: firstCompany?.id,
          status: "active",
          custom_fields: { rut: patientData.rut },
        }]);

        if (clientError) throw clientError;
        clientId = newClientId;
      }

      // 2. Create appointment
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Get company_id from podologist
      const { data: podologistCompany } = await supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", selectedPodologist.id)
        .single();

      const { error: appointmentError } = await supabase.from("appointments").insert([{
        client_id: clientId,
        service_id: selectedService.id,
        assigned_to: selectedPodologist.id,
        company_id: podologistCompany?.company_id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: selectedService.duration_minutes,
        status: "scheduled",
      }]);

      if (appointmentError) throw appointmentError;

      setConfirmed(true);
      setLoading(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Hubo un error al crear la cita. Por favor intenta nuevamente.");
      setLoading(false);
    }
  };

  const getServiceIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("evaluación")) return Stethoscope;
    if (nameLower.includes("uñas")) return Heart;
    if (nameLower.includes("diabético")) return Shield;
    if (nameLower.includes("deportiva")) return Sparkles;
    if (nameLower.includes("plantillas")) return Target;
    return Zap;
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (confirmed) {
    return (
      <>
        <SEO
          title="Reserva Confirmada - PODOS PRO"
          description="Tu cita ha sido confirmada exitosamente"
        />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ¡Reserva Confirmada!
            </h1>
            
            <p className="text-slate-600 mb-8">
              Tu cita ha sido agendada exitosamente. Recibirás un correo de confirmación en breve.
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Servicio:</span>
                <span className="font-semibold">{selectedService?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Podólogo:</span>
                <span className="font-semibold">{selectedPodologist?.full_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Fecha:</span>
                <span className="font-semibold">{selectedDate?.toLocaleDateString("es-CL")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Hora:</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-slate-600">Precio:</span>
                <span className="font-bold text-lg">${selectedService?.price.toLocaleString()}</span>
              </div>
            </div>

            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Volver al Inicio
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Agendar Cita - PODOS PRO"
        description="Agenda tu cita de podología en pocos pasos"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agenda tu Cita
              </span>
            </h1>
            <p className="text-slate-600">
              Completa los siguientes pasos para reservar tu hora
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div
                      className={`h-1 w-12 lg:w-24 transition-all ${
                        currentStep > step ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Servicio</span>
              <span>Podólogo</span>
              <span>Fecha</span>
              <span>Datos</span>
              <span>Confirmar</span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="p-8 mb-8">
            {/* Step 1: Select Service */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Selecciona un Servicio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => {
                    const Icon = getServiceIcon(service.name);
                    return (
                      <Card
                        key={service.id}
                        className={`p-6 cursor-pointer transition-all hover:shadow-xl ${
                          selectedService?.id === service.id
                            ? "border-2 border-blue-600 bg-blue-50"
                            : "hover:scale-105"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold mb-1">{service.name}</h3>
                            <p className="text-sm text-slate-600 mb-3">
                              {service.description || "Servicio de podología profesional"}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {service.duration_minutes} min
                              </Badge>
                              <span className="font-bold text-blue-600">
                                ${service.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Podologist */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Selecciona un Podólogo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {podologists.map((podologist) => (
                    <Card
                      key={podologist.id}
                      className={`p-6 cursor-pointer transition-all hover:shadow-xl ${
                        selectedPodologist?.id === podologist.id
                          ? "border-2 border-blue-600 bg-blue-50"
                          : "hover:scale-105"
                      }`}
                      onClick={() => setSelectedPodologist(podologist)}
                    >
                      <div className="text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                          {podologist.full_name[0]}
                        </div>
                        <h3 className="font-bold mb-1">{podologist.full_name}</h3>
                        <p className="text-sm text-slate-600">{podologist.specialty}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Date & Time */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Selecciona Fecha y Hora</h2>
                
                {/* Calendar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-bold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map((day) => (
                      <div key={day} className="text-center text-sm font-semibold text-slate-600">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentMonth).map((day, index) => {
                      const disabled = isDateDisabled(day);
                      const isSelected = day && selectedDate && 
                        day.getDate() === selectedDate.getDate() &&
                        day.getMonth() === selectedDate.getMonth() &&
                        day.getFullYear() === selectedDate.getFullYear();

                      return (
                        <button
                          key={index}
                          disabled={disabled || !day}
                          onClick={() => day && !disabled && setSelectedDate(day)}
                          className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                            !day
                              ? "invisible"
                              : disabled
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                              : "hover:bg-blue-50 hover:scale-110"
                          }`}
                        >
                          {day?.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h3 className="font-bold mb-4">Horarios Disponibles</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={selectedTime === time ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Patient Data */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Tus Datos</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Juan Pérez"
                        className="pl-10"
                        value={patientData.full_name}
                        onChange={(e) => setPatientData({ ...patientData, full_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="juan@ejemplo.com"
                        className="pl-10"
                        value={patientData.email}
                        onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="+56 9 1234 5678"
                        className="pl-10"
                        value={patientData.phone}
                        onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>RUT / DNI</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="12.345.678-9"
                        className="pl-10"
                        value={patientData.rut}
                        onChange={(e) => setPatientData({ ...patientData, rut: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Confirma tu Reserva</h2>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Servicio</p>
                      <p className="font-bold">{selectedService?.name}</p>
                      <p className="text-sm text-slate-600">
                        {selectedService?.duration_minutes} minutos · ${selectedService?.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Podólogo</p>
                      <p className="font-bold">{selectedPodologist?.full_name}</p>
                      <p className="text-sm text-slate-600">{selectedPodologist?.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Fecha y Hora</p>
                      <p className="font-bold">
                        {selectedDate?.toLocaleDateString("es-CL", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-slate-600">{selectedTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Paciente</p>
                      <p className="font-bold">{patientData.full_name}</p>
                      <p className="text-sm text-slate-600">{patientData.email}</p>
                      <p className="text-sm text-slate-600">{patientData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-slate-600">
                    <strong>Nota:</strong> Recibirás un correo de confirmación. Puedes cancelar hasta 2 horas antes de tu cita.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {loading ? "Confirmando..." : "Confirmar Reserva"}
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}