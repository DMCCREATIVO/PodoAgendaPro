import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, Tag, AlertCircle, 
  FileText, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, 
  Activity, Heart, Pill, Shield, Stethoscope, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyId } from "@/hooks/useCompanyId";
import { clientService } from "@/services/clientService";
import { appointmentService } from "@/services/appointmentService";
import { clinicalNotesService } from "@/services/clinicalNotesService";
import { useToast } from "@/hooks/use-toast";

export default function PatientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const companyId = useCompanyId();
  
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [noteModal, setNoteModal] = useState({ open: false, mode: 'create' as 'create' | 'edit', data: null as any });
  const [conditionModal, setConditionModal] = useState({ open: false, mode: 'create' as 'create' | 'edit', data: null as any });

  // Form states
  const [noteForm, setNoteForm] = useState({
    note_type: 'observation' as 'diagnosis' | 'treatment' | 'observation' | 'prescription' | 'follow_up' | 'alert',
    title: '',
    content: '',
    appointment_id: '',
    is_private: false,
  });

  const [conditionForm, setConditionForm] = useState({
    condition_type: 'medical' as 'medical' | 'allergy' | 'medication' | 'precaution',
    name: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  useEffect(() => {
    if (companyId && id) {
      loadPatientData();
    }
  }, [companyId, id]);

  const loadPatientData = async () => {
    setIsLoading(true);
    try {
      const [clientData, appointmentsData, notesData, conditionsData] = await Promise.all([
        clientService.getClientById(companyId, id as string),
        appointmentService.getAppointments(companyId),
        clinicalNotesService.getClientNotes(companyId, id as string),
        clinicalNotesService.getClientConditions(companyId, id as string),
      ]);

      setClient(clientData);
      setAppointments(appointmentsData.filter((a: any) => a.client_id === id));
      setClinicalNotes(notesData);
      setConditions(conditionsData);
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

  const openCreateNoteModal = () => {
    setNoteForm({
      note_type: 'observation',
      title: '',
      content: '',
      appointment_id: '',
      is_private: false,
    });
    setNoteModal({ open: true, mode: 'create', data: null });
  };

  const handleSaveNote = async () => {
    try {
      await clinicalNotesService.createNote(companyId, {
        client_id: id as string,
        ...noteForm,
        appointment_id: noteForm.appointment_id || null,
      });
      toast({ title: "Nota clínica agregada exitosamente" });
      setNoteModal({ open: false, mode: 'create', data: null });
      loadPatientData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openCreateConditionModal = () => {
    setConditionForm({
      condition_type: 'medical',
      name: '',
      description: '',
      severity: 'medium',
    });
    setConditionModal({ open: true, mode: 'create', data: null });
  };

  const handleSaveCondition = async () => {
    try {
      await clinicalNotesService.createCondition(companyId, {
        client_id: id as string,
        ...conditionForm,
      });
      toast({ title: "Condición agregada exitosamente" });
      setConditionModal({ open: false, mode: 'create', data: null });
      loadPatientData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCondition = async (conditionId: string) => {
    if (!confirm('¿Eliminar esta condición?')) return;
    
    try {
      await clinicalNotesService.deleteCondition(companyId, conditionId);
      toast({ title: "Condición eliminada" });
      loadPatientData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      scheduled: { label: "Programada", className: "bg-blue-100 text-blue-700 border-blue-200" },
      confirmed: { label: "Confirmada", className: "bg-green-100 text-green-700 border-green-200" },
      in_progress: { label: "En Curso", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      completed: { label: "Completada", className: "bg-green-100 text-green-700 border-green-200" },
      cancelled: { label: "Cancelada", className: "bg-red-100 text-red-700 border-red-200" },
      no_show: { label: "No Asistió", className: "bg-gray-100 text-gray-700 border-gray-200" },
    };
    
    const variant = variants[status] || variants.scheduled;
    return (
      <Badge variant="outline" className={cn("rounded-full", variant.className)}>
        {variant.label}
      </Badge>
    );
  };

  const getNoteTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      diagnosis: Stethoscope,
      treatment: Activity,
      observation: FileText,
      prescription: Pill,
      follow_up: Calendar,
      alert: AlertCircle,
    };
    return icons[type] || FileText;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-700 border-blue-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      critical: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[severity] || colors.medium;
  };

  if (isLoading) {
    return (
      <AdminLayout activeTab="pacientes">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando paciente...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!client) {
    return (
      <AdminLayout activeTab="pacientes">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-bold text-2xl mb-2">Paciente no encontrado</h2>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/admin?tab=pacientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Pacientes
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="pacientes">
      {/* Note Modal */}
      <Dialog open={noteModal.open} onOpenChange={(open) => setNoteModal({ ...noteModal, open })}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Nueva Nota Clínica</DialogTitle>
            <DialogDescription>Registra observaciones, diagnósticos o indicaciones</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="note-type">Tipo de Nota</Label>
                <Select value={noteForm.note_type} onValueChange={(value: any) => setNoteForm({ ...noteForm, note_type: value })}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnosis">Diagnóstico</SelectItem>
                    <SelectItem value="treatment">Tratamiento</SelectItem>
                    <SelectItem value="observation">Observación</SelectItem>
                    <SelectItem value="prescription">Prescripción</SelectItem>
                    <SelectItem value="follow_up">Seguimiento</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="note-appointment">Asociar a Cita (opcional)</Label>
                <Select value={noteForm.appointment_id} onValueChange={(value) => setNoteForm({ ...noteForm, appointment_id: value })}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue placeholder="Sin asociar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asociar</SelectItem>
                    {appointments.slice(0, 5).map((apt) => (
                      <SelectItem key={apt.id} value={apt.id}>
                        {new Date(apt.scheduled_at).toLocaleDateString('es-CL')} - {apt.service?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="note-title">Título (opcional)</Label>
              <Input
                id="note-title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                placeholder="Ej: Hiperqueratosis plantar"
                className="mt-2 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="note-content">Contenido *</Label>
              <Textarea
                id="note-content"
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="Descripción detallada de la nota clínica..."
                className="mt-2 rounded-xl min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModal({ ...noteModal, open: false })} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSaveNote} className="rounded-xl shadow-lg shadow-primary/20" disabled={!noteForm.content}>
              Guardar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Condition Modal */}
      <Dialog open={conditionModal.open} onOpenChange={(open) => setConditionModal({ ...conditionModal, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Nueva Condición</DialogTitle>
            <DialogDescription>Registra condiciones médicas, alergias o precauciones</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition-type">Tipo</Label>
                <Select value={conditionForm.condition_type} onValueChange={(value: any) => setConditionForm({ ...conditionForm, condition_type: value })}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Condición Médica</SelectItem>
                    <SelectItem value="allergy">Alergia</SelectItem>
                    <SelectItem value="medication">Medicación</SelectItem>
                    <SelectItem value="precaution">Precaución</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition-severity">Severidad</Label>
                <Select value={conditionForm.severity} onValueChange={(value: any) => setConditionForm({ ...conditionForm, severity: value })}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="condition-name">Nombre *</Label>
              <Input
                id="condition-name"
                value={conditionForm.name}
                onChange={(e) => setConditionForm({ ...conditionForm, name: e.target.value })}
                placeholder="Ej: Diabetes Tipo 2"
                className="mt-2 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="condition-description">Descripción</Label>
              <Textarea
                id="condition-description"
                value={conditionForm.description}
                onChange={(e) => setConditionForm({ ...conditionForm, description: e.target.value })}
                placeholder="Detalles adicionales..."
                className="mt-2 rounded-xl min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConditionModal({ ...conditionModal, open: false })} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSaveCondition} className="rounded-xl shadow-lg shadow-primary/20" disabled={!conditionForm.name}>
              Guardar Condición
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="rounded-xl">
            <Link href="/admin?tab=pacientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>

        {/* Patient Header */}
        <Card className="p-6 soft-shadow border-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-3xl mb-2">{client.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Paciente desde {new Date(client.created_at).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full",
                      client.status === "active" && "bg-green-100 text-green-700 border-green-200",
                      client.status === "lead" && "bg-blue-100 text-blue-700 border-blue-200",
                      client.status === "inactive" && "bg-gray-100 text-gray-700 border-gray-200"
                    )}
                  >
                    {client.status === "active" ? "Activo" : client.status === "lead" ? "Lead" : "Inactivo"}
                  </Badge>
                  {client.tags?.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline" className="rounded-full">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </Card>

        {/* Medical Conditions Alert */}
        {conditions.length > 0 && (
          <Card className="p-6 soft-shadow border-0 border-l-4 border-l-orange-500 bg-orange-50/50">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-heading font-bold text-lg mb-3 text-orange-900">Condiciones Médicas Activas</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {conditions.map((condition) => (
                    <div key={condition.id} className="flex items-start justify-between gap-2 p-3 rounded-xl bg-white">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("rounded-full text-xs", getSeverityColor(condition.severity))}>
                            {condition.severity === 'low' ? 'Baja' : 
                             condition.severity === 'medium' ? 'Media' : 
                             condition.severity === 'high' ? 'Alta' : 'Crítica'}
                          </Badge>
                          <span className="font-semibold text-sm">{condition.name}</span>
                        </div>
                        {condition.description && (
                          <p className="text-xs text-muted-foreground">{condition.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => handleDeleteCondition(condition.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={openCreateConditionModal} variant="outline" size="sm" className="mt-3 rounded-xl">
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar Condición
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="appointments" className="rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Citas ({appointments.length})
            </TabsTrigger>
            <TabsTrigger value="clinical" className="rounded-xl">
              <ClipboardList className="w-4 h-4 mr-2" />
              Notas Clínicas ({clinicalNotes.length})
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl">Historial de Citas</h2>
            </div>

            {appointments.length === 0 ? (
              <Card className="p-12 text-center soft-shadow border-0">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay citas registradas</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <Card key={apt.id} className="p-6 soft-shadow border-0 hover-lift">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{apt.service?.name || 'Servicio'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(apt.scheduled_at).toLocaleDateString('es-CL', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })} - {new Date(apt.scheduled_at).toLocaleTimeString('es-CL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        {apt.notes && (
                          <p className="text-sm text-muted-foreground ml-[60px]">{apt.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Clinical Notes Tab */}
          <TabsContent value="clinical" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl">Notas Clínicas</h2>
              <Button onClick={openCreateNoteModal} className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Nota
              </Button>
            </div>

            {clinicalNotes.length === 0 ? (
              <Card className="p-12 text-center soft-shadow border-0">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No hay notas clínicas registradas</p>
                <Button onClick={openCreateNoteModal} variant="outline" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Nota
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {clinicalNotes.map((note) => {
                  const NoteIcon = getNoteTypeIcon(note.note_type);
                  return (
                    <Card key={note.id} className="p-6 soft-shadow border-0">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          note.note_type === 'alert' && "bg-red-100",
                          note.note_type === 'diagnosis' && "bg-blue-100",
                          note.note_type === 'treatment' && "bg-green-100",
                          note.note_type === 'prescription' && "bg-purple-100",
                          note.note_type === 'follow_up' && "bg-yellow-100",
                          note.note_type === 'observation' && "bg-gray-100"
                        )}>
                          <NoteIcon className={cn(
                            "w-5 h-5",
                            note.note_type === 'alert' && "text-red-700",
                            note.note_type === 'diagnosis' && "text-blue-700",
                            note.note_type === 'treatment' && "text-green-700",
                            note.note_type === 'prescription' && "text-purple-700",
                            note.note_type === 'follow_up' && "text-yellow-700",
                            note.note_type === 'observation' && "text-gray-700"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              {note.title && (
                                <h3 className="font-semibold text-lg mb-1">{note.title}</h3>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="rounded-full text-xs">
                                  {note.note_type === 'diagnosis' ? 'Diagnóstico' :
                                   note.note_type === 'treatment' ? 'Tratamiento' :
                                   note.note_type === 'prescription' ? 'Prescripción' :
                                   note.note_type === 'follow_up' ? 'Seguimiento' :
                                   note.note_type === 'alert' ? 'Alerta' : 'Observación'}
                                </Badge>
                                <Clock className="w-3 h-3" />
                                <span>{new Date(note.created_at).toLocaleDateString('es-CL')} - {new Date(note.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                                {note.created_by_user && (
                                  <>
                                    <User className="w-3 h-3" />
                                    <span>{note.created_by_user.full_name || note.created_by_user.email}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          {note.appointment && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Asociado a cita: {new Date(note.appointment.scheduled_at).toLocaleDateString('es-CL')} - {note.appointment.service?.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}