import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PatientLayout } from "@/components/patient/PatientLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  CreditCard,
  Download,
} from "lucide-react";

export default function ClientePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("citas");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Citas
  const [appointments, setAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);

  // Historial clínico
  const [clinicalHistory, setClinicalHistory] = useState<any[]>([]);

  // Pagos
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const tab = router.query.tab as string;
    if (tab) setActiveTab(tab);
  }, [router.query]);

  useEffect(() => {
    if (session?.userId) {
      loadData();
    }
  }, [session]);

  const checkAuth = () => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(sessionData);
    if (parsed.role !== "patient") {
      router.push("/login");
      return;
    }

    setSession(parsed);
    setLoading(false);
  };

  const loadData = async () => {
    if (!session?.userId) return;

    // Buscar cliente
    const { data: clientData } = await supabase
      .from("clients")
      .select("id")
      .eq("email", session.userEmail)
      .single();

    if (!clientData) return;

    const clientId = clientData.id;

    // Cargar citas
    const { data: aptsData } = await supabase
      .from("appointments")
      .select(`
        *,
        services (name, duration, price),
        users!appointments_assigned_to_fkey (full_name)
      `)
      .eq("client_id", clientId)
      .order("scheduled_at", { ascending: false });

    if (aptsData) {
      setAppointments(aptsData);

      const now = new Date();
      const upcoming = aptsData.filter((apt) => new Date(apt.scheduled_at) >= now && apt.status !== "cancelled");
      const past = aptsData.filter((apt) => new Date(apt.scheduled_at) < now || apt.status === "cancelled");

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    }

    // Cargar historial clínico (SOLO información permitida)
    const { data: notesData } = await supabase
      .from("clinical_notes")
      .select(`
        *,
        appointments (scheduled_at),
        users (full_name)
      `)
      .eq("client_id", clientId)
      .eq("note_type", "diagnosis")
      .order("created_at", { ascending: false });

    if (notesData) {
      setClinicalHistory(notesData);
    }

    // Cargar pagos
    const { data: paymentsData } = await supabase
      .from("payments")
      .select(`
        *,
        appointments (scheduled_at, services (name))
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (paymentsData) {
      setPayments(paymentsData);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: any; icon: any }> = {
      scheduled: { label: "Agendada", variant: "outline", icon: Clock },
      confirmed: { label: "Confirmada", variant: "default", icon: CheckCircle },
      in_progress: { label: "En Curso", variant: "secondary", icon: AlertCircle },
      completed: { label: "Completada", variant: "default", icon: CheckCircle },
      cancelled: { label: "Cancelada", variant: "destructive", icon: XCircle },
      no_show: { label: "No Asistió", variant: "destructive", icon: XCircle },
    };

    const config = badges[status] || badges.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const canCancelAppointment = (scheduledAt: string) => {
    const appointmentTime = new Date(scheduledAt);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilAppointment >= 2;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("¿Estás seguro de cancelar esta cita?")) return;

    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId);

    if (!error) {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout activeTab={activeTab}>
      {/* Tab: Mis Citas */}
      {activeTab === "citas" && (
        <div className="space-y-6 pb-20 lg:pb-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Mis Citas</h2>
          </div>

          {/* Próximas Citas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Próximas Citas</h3>
            {upcomingAppointments.length === 0 ? (
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No tienes citas próximas</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.map((apt) => (
                  <Card
                    key={apt.id}
                    className="p-6 bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm border-blue-100 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {new Date(apt.scheduled_at).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(apt.scheduled_at).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="font-medium text-slate-900">{apt.services?.name || "Consulta"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4" />
                        <span>{apt.users?.full_name || "Podólogo"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>{apt.services?.duration || 30} minutos</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {canCancelAppointment(apt.scheduled_at) && apt.status !== "cancelled" && (
                        <Button
                          onClick={() => handleCancelAppointment(apt.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Historial de Citas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Historial</h3>
            {pastAppointments.length === 0 ? (
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No tienes historial de citas</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pastAppointments.map((apt) => (
                  <Card key={apt.id} className="p-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {new Date(apt.scheduled_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-slate-600">{apt.services?.name || "Consulta"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(apt.status)}
                        <p className="text-xs text-slate-600 mt-1">{apt.users?.full_name}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Historial Clínico */}
      {activeTab === "historial" && (
        <div className="space-y-6 pb-20 lg:pb-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Mi Historial Clínico</h2>
          </div>

          {clinicalHistory.length === 0 ? (
            <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No tienes historial clínico registrado</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {clinicalHistory.map((note) => {
                const content = note.content as any;
                return (
                  <Card
                    key={note.id}
                    className="p-6 bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-sm border-blue-100"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg">Consulta Podológica</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(note.appointments?.scheduled_at || note.created_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {note.users?.full_name || "Podólogo"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-200 pt-4">
                      {/* Recomendaciones */}
                      {content?.recomendaciones && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Recomendaciones
                          </h4>
                          <p className="text-slate-700 bg-green-50 p-3 rounded-lg">{content.recomendaciones}</p>
                        </div>
                      )}

                      {/* Productos Recomendados */}
                      {content?.productos_recomendados && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Productos Recomendados</h4>
                          <p className="text-slate-700 bg-blue-50 p-3 rounded-lg">{content.productos_recomendados}</p>
                        </div>
                      )}

                      {/* Próxima Visita */}
                      {content?.proxima_visita && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Próxima Visita Sugerida
                          </h4>
                          <p className="text-slate-700 bg-blue-50 p-3 rounded-lg font-medium">
                            {new Date(content.proxima_visita).toLocaleDateString("es-ES", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      )}

                      {/* Nota informativa */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          Por seguridad y privacidad, solo se muestra información relevante para tu cuidado. El
                          diagnóstico completo está disponible para tu podólogo.
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Pagos */}
      {activeTab === "pagos" && (
        <div className="space-y-6 pb-20 lg:pb-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Mis Pagos</h2>
          </div>

          {payments.length === 0 ? (
            <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
              <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No tienes pagos registrados</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <Card key={payment.id} className="p-4 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${
                          payment.status === "completed"
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-gradient-to-br from-amber-500 to-orange-600"
                        }`}
                      >
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          ${payment.amount?.toLocaleString("es-CL") || "0"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {payment.appointments?.services?.name || payment.description || "Consulta"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(payment.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={payment.status === "completed" ? "default" : "outline"}>
                        {payment.status === "completed" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pagado
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pendiente
                          </>
                        )}
                      </Badge>
                      <p className="text-xs text-slate-600 capitalize">{payment.payment_method || "Efectivo"}</p>
                      {payment.status === "completed" && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Descargar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </PatientLayout>
  );
}