import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PatientLayout } from "@/components/patient/PatientLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, DollarSign, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyId } from "@/hooks/useCompanyId";
import { appointmentService } from "@/services/appointmentService";
import { clinicalNotesService } from "@/services/clinicalNotesService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Cliente() {
  const router = useRouter();
  const { toast } = useToast();
  const companyId = useCompanyId();
  const activeTab = (router.query.tab as string) || "citas";

  const [appointments, setAppointments] = useState<any[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (companyId && currentUser) {
      loadData();
    }
  }, [companyId, currentUser]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el usuario",
        variant: "destructive",
      });
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // In a real system, we would filter by client_id based on authenticated user
      // For demo purposes, we'll show all appointments
      const [appointmentsData, notesData] = await Promise.all([
        appointmentService.getAppointments(companyId),
        clinicalNotesService.getClientNotes(companyId, currentUser?.id || ''),
      ]);

      // Filter only public notes for patient view
      const publicNotes = notesData.filter(note => !note.is_private);

      setAppointments(appointmentsData);
      setClinicalNotes(publicNotes);
    } catch (error: any) {
      toast({
        title: "Error cargando datos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;

    try {
      await appointmentService.cancelAppointment(companyId, appointmentId, 'Cancelada por el paciente');
      toast({ title: "Cita cancelada exitosamente" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(apt => new Date(apt.scheduled_at) >= now);
  const pastAppointments = appointments.filter(apt => new Date(apt.scheduled_at) < now);

  return (
    <PatientLayout activeTab={activeTab}>
      {/* Mis Citas Tab */}
      {activeTab === "citas" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Mis Citas</h1>
            <p className="text-muted-foreground">Agenda de citas programadas y pasadas</p>
          </div>

          {/* Upcoming Appointments */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">Próximas Citas</h2>
            {isLoading ? (
              <Card className="p-8 text-center soft-shadow border-0">
                <p className="text-muted-foreground">Cargando citas...</p>
              </Card>
            ) : upcomingAppointments.length === 0 ? (
              <Card className="p-8 text-center soft-shadow border-0">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tienes citas programadas</p>
                <Button className="rounded-xl shadow-lg shadow-primary/20">
                  Agendar Nueva Cita
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingAppointments.map((apt) => (
                  <Card key={apt.id} className="p-6 soft-shadow border-0 hover-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{apt.service?.name || 'Servicio'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.scheduled_at).toLocaleDateString('es-CL', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full",
                          apt.status === "scheduled" && "bg-blue-100 text-blue-700 border-blue-200",
                          apt.status === "confirmed" && "bg-green-100 text-green-700 border-green-200",
                          apt.status === "cancelled" && "bg-red-100 text-red-700 border-red-200"
                        )}
                      >
                        {apt.status === "scheduled" ? "Programada" :
                         apt.status === "confirmed" ? "Confirmada" : "Cancelada"}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(apt.scheduled_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {apt.assigned_to_user && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{apt.assigned_to_user.full_name || 'Podólogo'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>${apt.service?.price?.toLocaleString()}</span>
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="p-3 rounded-lg bg-muted/30 mb-4">
                        <p className="text-sm text-muted-foreground">{apt.notes}</p>
                      </div>
                    )}

                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl flex-1"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4">Historial de Citas</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastAppointments.slice(0, 6).map((apt) => (
                  <Card key={apt.id} className="p-4 soft-shadow border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          apt.status === "completed" && "bg-green-100",
                          apt.status === "cancelled" && "bg-red-100",
                          apt.status === "no_show" && "bg-gray-100"
                        )}>
                          {apt.status === "completed" ? (
                            <CheckCircle className="w-4 h-4 text-green-700" />
                          ) : apt.status === "cancelled" ? (
                            <XCircle className="w-4 h-4 text-red-700" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-gray-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{apt.service?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(apt.scheduled_at).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full text-xs">
                      {apt.status === "completed" ? "Completada" :
                       apt.status === "cancelled" ? "Cancelada" : "No asistió"}
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial Tab */}
      {activeTab === "historial" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Mi Historial Clínico</h1>
            <p className="text-muted-foreground">Resumen de tus consultas y tratamientos</p>
          </div>

          {isLoading ? (
            <Card className="p-8 text-center soft-shadow border-0">
              <p className="text-muted-foreground">Cargando historial...</p>
            </Card>
          ) : clinicalNotes.length === 0 ? (
            <Card className="p-12 text-center soft-shadow border-0">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aún no tienes registros clínicos</p>
              <p className="text-sm text-muted-foreground mt-2">
                Los registros de tus consultas aparecerán aquí después de cada atención
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {clinicalNotes.map((note) => (
                <Card key={note.id} className="p-6 soft-shadow border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg">{note.title || 'Nota Clínica'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(note.created_at).toLocaleDateString('es-CL', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full",
                        note.note_type === "consultation" && "bg-blue-100 text-blue-700 border-blue-200",
                        note.note_type === "treatment" && "bg-green-100 text-green-700 border-green-200",
                        note.note_type === "followup" && "bg-purple-100 text-purple-700 border-purple-200",
                        note.note_type === "observation" && "bg-orange-100 text-orange-700 border-orange-200"
                      )}
                    >
                      {note.note_type === "consultation" ? "Consulta" :
                       note.note_type === "treatment" ? "Tratamiento" :
                       note.note_type === "followup" ? "Seguimiento" : "Observación"}
                    </Badge>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <div className="p-4 rounded-xl bg-muted/30">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{note.content}</pre>
                    </div>
                  </div>

                  {note.created_by_user && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Atendido por: {note.created_by_user.full_name || 'Profesional'}</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagos Tab */}
      {activeTab === "pagos" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Mis Pagos</h1>
            <p className="text-muted-foreground">Historial de pagos y recibos</p>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Módulo de pagos próximamente</p>
              <p className="text-sm text-muted-foreground">
                Aquí podrás ver tu historial de pagos y descargar recibos
              </p>
            </div>
          </Card>

          {/* Preview of payment history structure */}
          <div className="space-y-3 opacity-50 pointer-events-none">
            <Card className="p-4 soft-shadow border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold">Consulta Podológica</p>
                    <p className="text-sm text-muted-foreground">15 de Marzo, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">$25.000</p>
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    <Download className="w-4 h-4 mr-2" />
                    Recibo
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 soft-shadow border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold">Quiropodia</p>
                    <p className="text-sm text-muted-foreground">1 de Febrero, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">$18.000</p>
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    <Download className="w-4 h-4 mr-2" />
                    Recibo
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}