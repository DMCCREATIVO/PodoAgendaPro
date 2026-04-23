import { useState } from "react";
import { useRouter } from "next/router";
import { PatientLayout } from "@/components/patient/PatientLayout";
import { useAuthGuard } from "@/middleware/authGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, MapPin, Phone, Mail, CreditCard, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function PatientPortal() {
  const router = useRouter();
  const { loading, authorized } = useAuthGuard("patient");
  const [activeTab, setActiveTab] = useState("appointments");

  // Mock data - próximas citas
  const upcomingAppointments = [
    {
      id: "1",
      date: "2026-04-25",
      time: "10:00",
      podiatrist: "Dra. Ana Martínez",
      service: "Consulta General",
      status: "confirmed",
      location: "Consultorio 2",
    },
    {
      id: "2",
      date: "2026-05-02",
      time: "15:30",
      podiatrist: "Dr. Carlos González",
      service: "Tratamiento de Hongos",
      status: "scheduled",
      location: "Consultorio 1",
    },
  ];

  // Mock data - historial de citas
  const pastAppointments = [
    {
      id: "3",
      date: "2026-04-10",
      time: "11:00",
      podiatrist: "Dra. Ana Martínez",
      service: "Quiropodia",
      status: "completed",
      notes: "Tratamiento exitoso. Uñas saludables.",
    },
    {
      id: "4",
      date: "2026-03-15",
      time: "14:00",
      podiatrist: "Dr. Carlos González",
      service: "Evaluación Inicial",
      status: "completed",
      notes: "Primera consulta. Plan de tratamiento establecido.",
    },
    {
      id: "5",
      date: "2026-02-20",
      time: "10:30",
      podiatrist: "Dra. Ana Martínez",
      service: "Tratamiento de Callosidades",
      status: "completed",
      notes: "Eliminación de callosidades plantares. Recomendaciones de cuidado diario.",
    },
  ];

  // Mock data - historial clínico (solo info pública)
  const clinicalHistory = [
    {
      id: "1",
      date: "2026-04-10",
      title: "Quiropodia Completa",
      podiatrist: "Dra. Ana Martínez",
      notes: "Tratamiento de uñas completado. Se realizó limado y pulido. Uñas en buen estado.",
      recommendations: "Mantener higiene diaria. Usar calzado cómodo.",
    },
    {
      id: "2",
      date: "2026-03-15",
      title: "Evaluación Podológica",
      podiatrist: "Dr. Carlos González",
      notes: "Evaluación completa del pie. Análisis de marcha. Estudio biomecánico.",
      recommendations: "Ejercicios de fortalecimiento. Control en 4 semanas.",
    },
    {
      id: "3",
      date: "2026-02-20",
      title: "Tratamiento de Callosidades",
      podiatrist: "Dra. Ana Martínez",
      notes: "Eliminación de hiperqueratosis plantar. Piel suave y saludable.",
      recommendations: "Hidratación diaria. Evitar presión excesiva.",
    },
  ];

  // Mock data - pagos
  const payments = [
    {
      id: "1",
      date: "2026-04-10",
      amount: 35000,
      service: "Quiropodia",
      status: "paid",
      method: "Tarjeta de Crédito",
      invoice: "FAC-2026-0124",
    },
    {
      id: "2",
      date: "2026-03-15",
      amount: 45000,
      service: "Evaluación Podológica Completa",
      status: "paid",
      method: "Efectivo",
      invoice: "FAC-2026-0089",
    },
    {
      id: "3",
      date: "2026-02-20",
      amount: 30000,
      service: "Tratamiento de Callosidades",
      status: "paid",
      method: "Transferencia",
      invoice: "FAC-2026-0045",
    },
    {
      id: "4",
      date: "2026-04-25",
      amount: 40000,
      service: "Consulta General (Próxima)",
      status: "pending",
      method: "-",
      invoice: "-",
    },
  ];

  // Mock data - perfil del paciente
  const [patientProfile, setPatientProfile] = useState({
    fullName: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+56 9 8765 4321",
    address: "Av. Providencia 1234, Santiago",
    birthDate: "1985-06-15",
    emergencyContact: "María Pérez - +56 9 8765 1234",
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      confirmed: { label: "Confirmada", className: "bg-green-500/10 text-green-600 border-green-500/20" },
      scheduled: { label: "Agendada", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      completed: { label: "Completada", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
      cancelled: { label: "Cancelada", className: "bg-red-500/10 text-red-600 border-red-500/20" },
      pending: { label: "Pendiente", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
      paid: { label: "Pagado", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    };
    const { label, className } = variants[status] || variants.scheduled;
    return <Badge className={className}>{label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "pending") return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    if (status === "cancelled") return <XCircle className="h-5 w-5 text-red-600" />;
    return <CheckCircle2 className="h-5 w-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Portal</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {patientProfile.fullName}</p>
          </div>
          <Button
            onClick={() => router.push("/agenda")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Agendar Nueva Cita
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-white/60 backdrop-blur-xl border border-gray-200/50 shadow-sm">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Mis Citas
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Historial
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Pagos
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Tab: Mis Citas */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Próximas Citas */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximas Citas</h2>
              <div className="grid gap-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-gray-200/50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-3">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{appointment.service}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString("es-CL", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 ml-14">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {appointment.podiatrist}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {appointment.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(appointment.status)}
                        <Button variant="outline" size="sm" className="border-gray-200">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Historial de Citas */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Citas</h2>
              <div className="grid gap-3">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-5 bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-gray-900">{appointment.service}</p>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(appointment.date).toLocaleDateString("es-CL")} - {appointment.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            {appointment.podiatrist}
                          </div>
                          {appointment.notes && (
                            <p className="text-gray-600 mt-2 italic">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tab: Historial Clínico */}
          <TabsContent value="history" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Este historial muestra solo la información general de tus tratamientos.
                Los detalles clínicos completos son confidenciales y están disponibles solo para tu podólogo.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
              {clinicalHistory.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-4 ring-white z-10">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <Card className="flex-1 p-6 bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString("es-CL", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                          {entry.podiatrist}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Notas del Tratamiento:</p>
                          <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Recomendaciones:</p>
                          <p className="text-sm text-gray-600 mt-1">{entry.recommendations}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Pagos */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid gap-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-3">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-gray-900">{payment.service}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString("es-CL", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {payment.method !== "-" && (
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="h-4 w-4" />
                              {payment.method}
                            </div>
                          )}
                          {payment.invoice !== "-" && (
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">N° {payment.invoice}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:items-end gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${payment.amount.toLocaleString("es-CL")}
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                      {payment.status === "paid" && (
                        <Button variant="outline" size="sm" className="border-gray-200">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Resumen */}
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border-gray-200/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${payments
                      .filter((p) => p.status === "paid")
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString("es-CL")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Pendiente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${payments
                      .filter((p) => p.status === "pending")
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString("es-CL")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Tratamientos</p>
                  <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Perfil Personal</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      value={patientProfile.fullName}
                      onChange={(e) => setPatientProfile({ ...patientProfile, fullName: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={patientProfile.birthDate}
                      onChange={(e) => setPatientProfile({ ...patientProfile, birthDate: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientProfile.email}
                      onChange={(e) => setPatientProfile({ ...patientProfile, email: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={patientProfile.phone}
                      onChange={(e) => setPatientProfile({ ...patientProfile, phone: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    value={patientProfile.address}
                    onChange={(e) => setPatientProfile({ ...patientProfile, address: e.target.value })}
                    className="bg-white border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="emergencyContact"
                    value={patientProfile.emergencyContact}
                    onChange={(e) => setPatientProfile({ ...patientProfile, emergencyContact: e.target.value })}
                    placeholder="Nombre - Teléfono"
                    className="bg-white border-gray-200"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30">
                    Guardar Cambios
                  </Button>
                  <Button variant="outline" className="border-gray-200">
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>

            {/* Seguridad */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="bg-white border-gray-200"
                  />
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30">
                  Cambiar Contraseña
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
}