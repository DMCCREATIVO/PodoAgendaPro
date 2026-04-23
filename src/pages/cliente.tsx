import { useState } from "react";
import { useRouter } from "next/router";
import { PatientLayout } from "@/components/patient/PatientLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, User, FileText, DollarSign, CheckCircle, XCircle, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_PATIENT_APPOINTMENTS = [
  { 
    id: 1, 
    date: "2026-04-25", 
    time: "10:30", 
    service: "Consulta Podológica", 
    podiatrist: "Dra. María González", 
    location: "Consulta 1",
    status: "confirmed",
    canCancel: true 
  },
  { 
    id: 2, 
    date: "2026-05-10", 
    time: "14:00", 
    service: "Quiropodia", 
    podiatrist: "Dr. Carlos Ramírez", 
    location: "Consulta 2",
    status: "scheduled",
    canCancel: true 
  },
];

const MOCK_PAST_APPOINTMENTS = [
  { 
    id: 3, 
    date: "2026-04-15", 
    time: "09:00", 
    service: "Consulta Podológica", 
    podiatrist: "Dra. María González",
    summary: "Evaluación general. Estado óptimo. Próximo control en 30 días.",
    status: "completed"
  },
  { 
    id: 4, 
    date: "2026-03-20", 
    time: "11:30", 
    service: "Plantillas Personalizadas", 
    podiatrist: "Dra. Ana Martínez",
    summary: "Entrega de plantillas correctivas para pie plano. Adaptación correcta.",
    status: "completed"
  },
  { 
    id: 5, 
    date: "2026-02-15", 
    time: "15:00", 
    service: "Pie Diabético", 
    podiatrist: "Dra. María González",
    summary: "Control rutinario. Sin lesiones. Continuar cuidados preventivos.",
    status: "completed"
  },
];

const MOCK_PAYMENTS = [
  { id: 1, date: "2026-04-15", service: "Consulta Podológica", amount: 25000, method: "Tarjeta", status: "paid" },
  { id: 2, date: "2026-03-20", service: "Plantillas", amount: 45000, method: "Efectivo", status: "paid" },
  { id: 3, date: "2026-04-25", service: "Consulta Podológica", amount: 25000, method: "Pendiente", status: "pending" },
];

const STATUS_CONFIG = {
  scheduled: { label: "Agendada", color: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Confirmada", color: "bg-green-100 text-green-700 border-green-200" },
  completed: { label: "Completada", color: "bg-accent/10 text-accent border-accent/20" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200" },
};

const PAYMENT_STATUS = {
  paid: { label: "Pagado", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
};

export default function Cliente() {
  const router = useRouter();
  const activeTab = (router.query.tab as string) || "citas";
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);

  const handleCancelAppointment = (id: number) => {
    alert(`Cita ${id} cancelada (mock)`);
  };

  const handleReschedule = (id: number) => {
    router.push("/agenda");
  };

  return (
    <PatientLayout activeTab={activeTab}>
      {/* Mis Citas Tab */}
      {activeTab === "citas" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Mis Citas</h1>
            <p className="text-muted-foreground">Próximas citas agendadas</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {MOCK_PATIENT_APPOINTMENTS.map((apt) => (
              <Card key={apt.id} className="p-6 soft-shadow border-0 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="outline" className={cn("rounded-full", STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].color)}>
                    {STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].label}
                  </Badge>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <h3 className="font-heading font-bold text-xl mb-4">{apt.service}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{new Date(apt.date).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{apt.podiatrist}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{apt.location}</span>
                  </div>
                </div>

                {apt.canCancel && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReschedule(apt.id)}
                      className="flex-1 rounded-xl"
                    >
                      Reprogramar
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 rounded-xl text-destructive hover:text-destructive">
                          Cancelar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-heading text-2xl">Cancelar Cita</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">
                          ¿Estás seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.
                        </p>
                        <DialogFooter className="gap-2">
                          <Button variant="outline" className="rounded-xl">
                            No, mantener
                          </Button>
                          <Button
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="rounded-xl bg-destructive hover:bg-destructive/90"
                          >
                            Sí, cancelar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button size="lg" className="rounded-2xl shadow-lg shadow-primary/20" asChild>
              <a href="/agenda">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Nueva Cita
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Historial Tab */}
      {activeTab === "historial" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Historial Médico</h1>
            <p className="text-muted-foreground">Registro de consultas anteriores</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-muted" />

            <div className="space-y-6">
              {MOCK_PAST_APPOINTMENTS.map((apt, index) => (
                <div key={apt.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-3 top-6 w-6 h-6 rounded-full bg-accent border-4 border-background shadow-lg" />

                  <Card className="p-6 soft-shadow border-0 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-xl mb-1">{apt.service}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(apt.date).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{apt.time}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("rounded-full", STATUS_CONFIG.completed.color)}>
                        Completada
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{apt.podiatrist}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30">
                        <p className="text-sm font-medium mb-1 text-muted-foreground">Resumen:</p>
                        <p className="text-sm">{apt.summary}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pagos Tab */}
      {activeTab === "pagos" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Pagos</h1>
            <p className="text-muted-foreground">Historial de pagos y recibos</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PAYMENTS.map((payment) => {
              const statusInfo = PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS];
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card key={payment.id} className="p-6 soft-shadow border-0 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline" className={cn("rounded-full", statusInfo.color)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-accent" />
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-xl mb-1">${payment.amount.toLocaleString()}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{payment.service}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(payment.date).toLocaleDateString("es-CL")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{payment.method}</span>
                    </div>
                  </div>

                  {payment.status === "paid" && (
                    <Button variant="outline" className="w-full rounded-xl">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Recibo
                    </Button>
                  )}
                  {payment.status === "pending" && (
                    <Button className="w-full rounded-xl shadow-lg shadow-primary/20">
                      Pagar Ahora
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </PatientLayout>
  );
}