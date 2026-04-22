import { useState } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp, TrendingDown, Users, Calendar as CalendarIcon, DollarSign, 
  Clock, CheckCircle, XCircle, AlertCircle, Search, Plus, Edit, Trash2,
  Eye, Mail, Phone, MapPin, CreditCard, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_STATS = {
  appointments_today: 12,
  total_patients: 156,
  revenue_month: 1250000,
  pending_payments: 3,
};

const MOCK_APPOINTMENTS = [
  { id: 1, patient: "María González", service: "Consulta Podológica", podiatrist: "Dra. González", date: "2026-04-22", time: "09:00", status: "confirmed" },
  { id: 2, patient: "Carlos Ramírez", service: "Quiropodia", podiatrist: "Dr. Ramírez", date: "2026-04-22", time: "10:30", status: "in_progress" },
  { id: 3, patient: "Ana Martínez", service: "Pie Diabético", podiatrist: "Dra. Martínez", date: "2026-04-22", time: "14:00", status: "scheduled" },
  { id: 4, patient: "Juan Pérez", service: "Plantillas", podiatrist: "Dra. González", date: "2026-04-23", time: "09:30", status: "scheduled" },
];

const MOCK_PODIATRISTS = [
  { id: 1, name: "Dra. María González", specialty: "Podología Clínica", email: "maria@podos.cl", phone: "+56 9 1234 5678", active: true },
  { id: 2, name: "Dr. Carlos Ramírez", specialty: "Pie Diabético", email: "carlos@podos.cl", phone: "+56 9 8765 4321", active: true },
  { id: 3, name: "Dra. Ana Martínez", specialty: "Biomecánica", email: "ana@podos.cl", phone: "+56 9 5555 1234", active: false },
];

const MOCK_PATIENTS = [
  { id: 1, name: "María González", email: "maria@ejemplo.cl", phone: "+56 9 1111 2222", lastVisit: "2026-04-15", totalVisits: 8, balance: 0 },
  { id: 2, name: "Carlos Ramírez", email: "carlos@ejemplo.cl", phone: "+56 9 3333 4444", lastVisit: "2026-04-20", totalVisits: 3, balance: 25000 },
  { id: 3, name: "Ana Martínez", email: "ana@ejemplo.cl", phone: "+56 9 5555 6666", lastVisit: "2026-04-18", totalVisits: 12, balance: 0 },
];

const MOCK_PAYMENTS = [
  { id: 1, patient: "María González", service: "Consulta", amount: 25000, date: "2026-04-22", method: "Efectivo", status: "paid" },
  { id: 2, patient: "Carlos Ramírez", service: "Quiropodia", amount: 22000, date: "2026-04-22", method: "Tarjeta", status: "paid" },
  { id: 3, patient: "Juan Pérez", service: "Plantillas", amount: 45000, date: "2026-04-20", method: "Transferencia", status: "pending" },
];

const STATUS_CONFIG = {
  scheduled: { label: "Agendada", color: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Confirmada", color: "bg-green-100 text-green-700 border-green-200" },
  in_progress: { label: "En Atención", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  completed: { label: "Completada", color: "bg-accent/10 text-accent border-accent/20" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200" },
  no_show: { label: "No Asistió", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const PAYMENT_STATUS = {
  paid: { label: "Pagado", color: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  overdue: { label: "Vencido", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function Admin() {
  const router = useRouter();
  const activeTab = (router.query.tab as string) || "dashboard";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <AdminLayout activeTab={activeTab}>
      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Resumen general del sistema</p>
          </div>

          {/* KPI Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 soft-shadow border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Citas Hoy</p>
                <p className="font-heading font-bold text-3xl">{MOCK_STATS.appointments_today}</p>
              </div>
            </Card>

            <Card className="p-6 soft-shadow border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Pacientes</p>
                <p className="font-heading font-bold text-3xl">{MOCK_STATS.total_patients}</p>
              </div>
            </Card>

            <Card className="p-6 soft-shadow border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-chart-2/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-chart-2" />
                </div>
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Ingresos Mes</p>
                <p className="font-heading font-bold text-3xl">${(MOCK_STATS.revenue_month / 1000).toFixed(0)}k</p>
              </div>
            </Card>

            <Card className="p-6 soft-shadow border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-chart-3/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-chart-3" />
                </div>
                <TrendingDown className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Pagos Pendientes</p>
                <p className="font-heading font-bold text-3xl">{MOCK_STATS.pending_payments}</p>
              </div>
            </Card>
          </div>

          {/* Recent Appointments */}
          <Card className="p-6 soft-shadow border-0">
            <h2 className="font-heading font-bold text-xl mb-4">Citas Recientes</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Podólogo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_APPOINTMENTS.slice(0, 5).map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.patient}</TableCell>
                    <TableCell>{apt.service}</TableCell>
                    <TableCell>{apt.podiatrist}</TableCell>
                    <TableCell>{apt.date} {apt.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].color)}>
                        {STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Agenda Tab */}
      {activeTab === "agenda" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Agenda</h1>
              <p className="text-muted-foreground">Gestión de citas</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-2xl shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Agendar Nueva Cita</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Paciente</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PATIENTS.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Servicio</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consulta">Consulta Podológica</SelectItem>
                          <SelectItem value="quiropodia">Quiropodia</SelectItem>
                          <SelectItem value="diabetico">Pie Diabético</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Podólogo</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Seleccionar podólogo" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PODIATRISTS.filter(p => p.active).map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha y Hora</Label>
                      <Input type="datetime-local" className="rounded-xl" />
                    </div>
                  </div>
                  <Button className="w-full rounded-2xl h-12">Agendar Cita</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 p-6 soft-shadow border-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-2xl"
              />
            </Card>

            <Card className="lg:col-span-2 p-6 soft-shadow border-0">
              <h2 className="font-heading font-bold text-xl mb-4">
                Citas del {selectedDate?.toLocaleDateString("es-CL", { day: "numeric", month: "long" })}
              </h2>
              <div className="space-y-3">
                {MOCK_APPOINTMENTS.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{apt.time}</span>
                      </div>
                      <p className="font-medium">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground">{apt.service} - {apt.podiatrist}</p>
                    </div>
                    <Badge variant="outline" className={cn("rounded-full", STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].color)}>
                      {STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].label}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Podólogos Tab */}
      {activeTab === "podologos" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Podólogos</h1>
              <p className="text-muted-foreground">Gestión de profesionales</p>
            </div>
            <Button className="rounded-2xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Podólogo
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PODIATRISTS.map((pod) => (
              <Card key={pod.id} className="p-6 soft-shadow border-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent" />
                  <Switch checked={pod.active} />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">{pod.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{pod.specialty}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{pod.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{pod.phone}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1 rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pacientes Tab */}
      {activeTab === "pacientes" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Pacientes</h1>
              <p className="text-muted-foreground">Gestión de pacientes</p>
            </div>
            <Button className="rounded-2xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Buscar paciente..." className="pl-10 rounded-xl h-12" />
              </div>
              <Button variant="outline" className="rounded-xl h-12">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Total Visitas</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PATIENTS.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{patient.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{patient.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>{patient.totalVisits}</TableCell>
                    <TableCell>
                      {patient.balance > 0 ? (
                        <span className="text-destructive font-semibold">${patient.balance.toLocaleString()}</span>
                      ) : (
                        <span className="text-accent">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Cobros Tab */}
      {activeTab === "cobros" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Cobros</h1>
            <p className="text-muted-foreground">Gestión de pagos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 soft-shadow border-0">
              <p className="text-muted-foreground text-sm mb-1">Cobrado Hoy</p>
              <p className="font-heading font-bold text-3xl text-accent">$47.000</p>
            </Card>
            <Card className="p-6 soft-shadow border-0">
              <p className="text-muted-foreground text-sm mb-1">Cobrado Mes</p>
              <p className="font-heading font-bold text-3xl">$1.250.000</p>
            </Card>
            <Card className="p-6 soft-shadow border-0">
              <p className="text-muted-foreground text-sm mb-1">Pendientes</p>
              <p className="font-heading font-bold text-3xl text-chart-3">$45.000</p>
            </Card>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PAYMENTS.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="font-medium">{payment.patient}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span>{payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS].color)}>
                        {PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === "config" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Configuración</h1>
            <p className="text-muted-foreground">Ajustes del sistema</p>
          </div>

          <Card className="p-6 soft-shadow border-0 max-w-2xl">
            <h2 className="font-heading font-bold text-xl mb-6">Información de la Clínica</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Clínica</Label>
                <Input defaultValue="PODOS PRO" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input defaultValue="Av. Principal 123, Santiago" className="rounded-xl h-12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input defaultValue="+56 2 1234 5678" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="contacto@podos.cl" className="rounded-xl h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Horario de Atención</Label>
                <Input defaultValue="Lun-Vie 9:00-18:00, Sáb 9:00-13:00" className="rounded-xl h-12" />
              </div>
              <Button className="rounded-2xl h-12 shadow-lg shadow-primary/20">
                Guardar Cambios
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}