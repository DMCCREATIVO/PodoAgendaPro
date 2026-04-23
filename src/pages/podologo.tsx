import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PodiatristLayout } from "@/components/podiatrist/PodiatristLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, User, Phone, Mail, Calendar, AlertCircle, CheckCircle, 
  FileText, Save, DollarSign, ArrowRight, Eye, Search, Activity,
  Stethoscope, Heart, Pill, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyId } from "@/hooks/useCompanyId";
import { appointmentService } from "@/services/appointmentService";
import { clientService } from "@/services/clientService";
import { serviceService } from "@/services/serviceService";
import { clinicalNotesService } from "@/services/clinicalNotesService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function PodiatristPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const companyId = useCompanyId();
  const [activeTab, setActiveTab] = useState("dia");

  // Real data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Atencion tab state
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [clientConditions, setClientConditions] = useState<any[]>([]);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  
  const [ficha, setFicha] = useState({
    generalEval: "",
    nailStatus: "",
    skinStatus: "",
    hasFungus: false,
    hasCalluses: false,
    painLevel: [3],
    diagnosis: "",
    procedures: "",
    recommendations: "",
    nextVisit: "",
  });
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load data on mount and when company changes
  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  // Load selected client data when appointment changes
  useEffect(() => {
    if (selectedAppointment && companyId) {
      loadClientDetails(selectedAppointment.client_id);
    }
  }, [selectedAppointment, companyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [appointmentsData, clientsData, servicesData] = await Promise.all([
        appointmentService.getAppointmentsByDay(companyId, today),
        clientService.getClients(companyId),
        serviceService.getServices(companyId, true), // active only
      ]);

      setAppointments(appointmentsData);
      setClients(clientsData);
      setServices(servicesData);

      // Auto-select first pending appointment if on atencion tab
      if (activeTab === 'atencion' && appointmentsData.length > 0) {
        const pending = appointmentsData.find(a => a.status === 'scheduled' || a.status === 'confirmed');
        if (pending) {
          setSelectedAppointment(pending);
        }
      }
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

  const loadClientDetails = async (clientId: string) => {
    try {
      const [clientData, conditions, notes] = await Promise.all([
        clientService.getClientById(companyId, clientId),
        clinicalNotesService.getClientConditions(companyId, clientId, true),
        clinicalNotesService.getClientNotes(companyId, clientId),
      ]);

      setSelectedClient(clientData);
      setClientConditions(conditions);
      setClientHistory(notes);
    } catch (error: any) {
      toast({
        title: "Error cargando detalles del paciente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveFicha = async () => {
    if (!selectedAppointment || !selectedClient) {
      toast({
        title: "Error",
        description: "Debes seleccionar un paciente primero",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Build clinical note content
      const content = `
EVALUACIÓN GENERAL:
${ficha.generalEval || 'No especificada'}

ESTADO DE UÑAS:
${ficha.nailStatus || 'No especificado'}

ESTADO DE PIEL:
${ficha.skinStatus || 'No especificado'}

HALLAZGOS:
${ficha.hasFungus ? '- Presencia de hongos' : ''}
${ficha.hasCalluses ? '- Presencia de callosidades' : ''}

NIVEL DE DOLOR: ${ficha.painLevel[0]}/10

DIAGNÓSTICO:
${ficha.diagnosis || 'No especificado'}

PROCEDIMIENTOS REALIZADOS:
${ficha.procedures || 'Ninguno'}

RECOMENDACIONES:
${ficha.recommendations || 'Ninguna'}
${ficha.nextVisit ? `\nPróxima visita sugerida: ${ficha.nextVisit}` : ''}
      `.trim();

      // Save clinical note
      await clinicalNotesService.createNote(companyId, {
        client_id: selectedClient.id,
        appointment_id: selectedAppointment.id,
        note_type: 'treatment',
        title: `Atención ${new Date().toLocaleDateString('es-CL')}`,
        content,
        is_private: false,
      });

      // Update appointment status to in_progress if scheduled
      if (selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') {
        await appointmentService.updateAppointment(companyId, selectedAppointment.id, { status: 'in_progress' });
      }

      toast({ 
        title: "Ficha guardada correctamente",
        description: "La evaluación clínica ha sido registrada",
      });

      // Reload data
      await loadData();
      await loadClientDetails(selectedClient.id);
    } catch (error: any) {
      toast({ 
        title: "Error guardando ficha", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishAttention = async () => {
    if (!selectedAppointment) return;

    try {
      await appointmentService.updateAppointment(companyId, selectedAppointment.id, { status: 'completed' });
      
      toast({ 
        title: "Atención finalizada exitosamente",
        description: "La cita ha sido marcada como completada",
      });

      // Reset form and reload
      setFicha({
        generalEval: "",
        nailStatus: "",
        skinStatus: "",
        hasFungus: false,
        hasCalluses: false,
        painLevel: [3],
        diagnosis: "",
        procedures: "",
        recommendations: "",
        nextVisit: "",
      });
      
      await loadData();
      router.push('/podologo?tab=dia');
    } catch (error: any) {
      toast({ 
        title: "Error finalizando atención", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const handleCharge = () => {
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedAppointment) return;

    try {
      // In a real system, this would create a payment record
      await appointmentService.updateAppointment(companyId, selectedAppointment.id, { status: 'completed' });
      
      toast({ 
        title: "Pago registrado correctamente",
        description: "La cita ha sido completada y cobrada",
      });
      
      setShowPaymentModal(false);
      await loadData();
      router.push('/podologo?tab=dia');
    } catch (error: any) {
      toast({ 
        title: "Error registrando pago", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  // Get next appointment
  const nextAppointment = appointments.find(a => a.status === 'scheduled' || a.status === 'confirmed');

  return (
    <PodiatristLayout activeTab={activeTab}>
      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Registrar Cobro</DialogTitle>
            <DialogDescription>
              Confirma el pago del servicio realizado
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-heading font-bold text-3xl mb-2">
                ${selectedAppointment?.service?.price?.toLocaleString() || '0'}
              </h3>
              <p className="text-muted-foreground">
                {selectedAppointment?.service?.name || 'Servicio'}
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paciente:</span>
                <span className="font-semibold">{selectedClient?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Método de pago:</span>
                <span className="font-semibold">Efectivo</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={confirmPayment} className="rounded-xl shadow-lg shadow-accent/20">
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mi Día Tab */}
      {activeTab === "dia" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Mi Día</h1>
            <p className="text-muted-foreground">Agenda de hoy - {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>

          {/* Next Patient Card */}
          {nextAppointment ? (
            <Card className="p-6 soft-shadow border-2 border-accent bg-gradient-to-br from-accent/5 to-background">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <Badge variant="secondary" className="rounded-full mb-2">
                    Próximo Paciente
                  </Badge>
                  <h2 className="font-heading font-bold text-2xl">
                    {nextAppointment.client?.name || "Paciente"}
                  </h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold text-lg text-foreground">
                      {new Date(nextAppointment.scheduled_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{nextAppointment.service?.name || "Servicio"}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button 
                    size="lg" 
                    className="rounded-2xl shadow-lg shadow-accent/30" 
                    onClick={() => {
                      setSelectedAppointment(nextAppointment);
                      router.push('?tab=atencion');
                    }}
                  >
                    Iniciar Atención
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 soft-shadow border-0">
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay citas pendientes para hoy</p>
              </div>
            </Card>
          )}

          {/* Today's Schedule */}
          <Card className="p-6 soft-shadow border-0">
            <h2 className="font-heading font-bold text-xl mb-4">Agenda del Día</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando citas...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay citas programadas para hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => {
                  const isNext = apt.id === nextAppointment?.id;
                  const isSelected = apt.id === selectedAppointment?.id;
                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer",
                        isNext && "bg-accent/5 border-2 border-accent",
                        isSelected && "bg-primary/5 border-2 border-primary",
                        !isNext && !isSelected && "bg-muted/30 hover:bg-muted/50"
                      )}
                      onClick={() => {
                        setSelectedAppointment(apt);
                        router.push('?tab=atencion');
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {new Date(apt.scheduled_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isNext && (
                            <Badge variant="secondary" className="rounded-full bg-accent text-accent-foreground ml-2">
                              Próximo
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-full ml-auto",
                              apt.status === "completed" && "bg-green-100 text-green-700 border-green-200",
                              apt.status === "in_progress" && "bg-yellow-100 text-yellow-700 border-yellow-200",
                              apt.status === "cancelled" && "bg-red-100 text-red-700 border-red-200"
                            )}
                          >
                            {apt.status === "scheduled" ? "Programada" :
                             apt.status === "confirmed" ? "Confirmada" :
                             apt.status === "in_progress" ? "En Curso" :
                             apt.status === "completed" ? "Completada" : "Cancelada"}
                          </Badge>
                        </div>
                        <p className="font-medium">{apt.client?.name || "Paciente"}</p>
                        <p className="text-sm text-muted-foreground">{apt.service?.name || "Servicio"}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Atención Tab - Real Clinical Ficha */}
      {activeTab === "atencion" && (
        <div className="space-y-6 animate-fade-in">
          {!selectedAppointment ? (
            <Card className="p-12 text-center soft-shadow border-0">
              <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading font-bold text-2xl mb-2">No hay paciente seleccionado</h2>
              <p className="text-muted-foreground mb-6">Selecciona una cita desde "Mi Día" para iniciar la atención</p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/podologo?tab=dia">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Volver a Mi Día
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Patient Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Patient Card */}
                <Card className="p-6 soft-shadow border-0">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-heading font-bold text-xl mb-1">
                        {selectedClient?.name || "Cargando..."}
                      </h2>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {selectedClient?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span>{selectedClient.email}</span>
                          </div>
                        )}
                        {selectedClient?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{selectedClient.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Servicio</p>
                      <p className="font-semibold">{selectedAppointment.service?.name}</p>
                    </div>
                  </div>
                </Card>

                {/* Medical Alerts */}
                {clientConditions.length > 0 && (
                  <Card className="p-4 soft-shadow border-l-4 border-l-orange-500 bg-orange-50/50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm mb-2 text-orange-900">Condiciones Activas</h3>
                        <div className="space-y-2">
                          {clientConditions.map((condition) => (
                            <div key={condition.id} className="flex items-start gap-2">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "rounded-full text-xs",
                                  condition.severity === 'critical' && "bg-red-100 text-red-700 border-red-200",
                                  condition.severity === 'high' && "bg-orange-100 text-orange-700 border-orange-200",
                                  condition.severity === 'medium' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                                  condition.severity === 'low' && "bg-blue-100 text-blue-700 border-blue-200"
                                )}
                              >
                                {condition.name}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Recent History */}
                <Card className="p-4 soft-shadow border-0">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Historial Reciente
                  </h3>
                  {clientHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin historial previo</p>
                  ) : (
                    <div className="space-y-2">
                      {clientHistory.slice(0, 3).map((note) => (
                        <div key={note.id} className="text-xs p-2 rounded-lg bg-muted/30">
                          <p className="font-semibold mb-1">{note.title || 'Nota clínica'}</p>
                          <p className="text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column - Clinical Ficha */}
              <div className="lg:col-span-2">
                <Card className="p-6 soft-shadow border-0">
                  <h2 className="font-heading font-bold text-2xl mb-6">Ficha Podológica</h2>

                  <div className="space-y-6">
                    {/* General Evaluation */}
                    <div>
                      <Label htmlFor="general-eval">Evaluación General</Label>
                      <Textarea
                        id="general-eval"
                        value={ficha.generalEval}
                        onChange={(e) => setFicha({ ...ficha, generalEval: e.target.value })}
                        placeholder="Descripción del estado general del pie..."
                        className="mt-2 rounded-xl min-h-[80px]"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Nail Status */}
                      <div>
                        <Label htmlFor="nail-status">Estado de Uñas</Label>
                        <Textarea
                          id="nail-status"
                          value={ficha.nailStatus}
                          onChange={(e) => setFicha({ ...ficha, nailStatus: e.target.value })}
                          placeholder="Color, grosor, forma..."
                          className="mt-2 rounded-xl min-h-[80px]"
                        />
                      </div>

                      {/* Skin Status */}
                      <div>
                        <Label htmlFor="skin-status">Estado de Piel</Label>
                        <Textarea
                          id="skin-status"
                          value={ficha.skinStatus}
                          onChange={(e) => setFicha({ ...ficha, skinStatus: e.target.value })}
                          placeholder="Hidratación, lesiones, color..."
                          className="mt-2 rounded-xl min-h-[80px]"
                        />
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30">
                        <Checkbox
                          id="fungus"
                          checked={ficha.hasFungus}
                          onCheckedChange={(checked) => setFicha({ ...ficha, hasFungus: checked as boolean })}
                        />
                        <Label htmlFor="fungus" className="cursor-pointer">
                          Presencia de hongos
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30">
                        <Checkbox
                          id="calluses"
                          checked={ficha.hasCalluses}
                          onCheckedChange={(checked) => setFicha({ ...ficha, hasCalluses: checked as boolean })}
                        />
                        <Label htmlFor="calluses" className="cursor-pointer">
                          Callosidades
                        </Label>
                      </div>
                    </div>

                    {/* Pain Level */}
                    <div>
                      <Label>Nivel de Dolor: {ficha.painLevel[0]}/10</Label>
                      <Slider
                        value={ficha.painLevel}
                        onValueChange={(value) => setFicha({ ...ficha, painLevel: value })}
                        max={10}
                        step={1}
                        className="mt-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Sin dolor</span>
                        <span>Dolor máximo</span>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <Label htmlFor="diagnosis">Diagnóstico</Label>
                      <Textarea
                        id="diagnosis"
                        value={ficha.diagnosis}
                        onChange={(e) => setFicha({ ...ficha, diagnosis: e.target.value })}
                        placeholder="Diagnóstico clínico..."
                        className="mt-2 rounded-xl min-h-[80px]"
                      />
                    </div>

                    {/* Procedures */}
                    <div>
                      <Label htmlFor="procedures">Procedimientos Realizados</Label>
                      <Textarea
                        id="procedures"
                        value={ficha.procedures}
                        onChange={(e) => setFicha({ ...ficha, procedures: e.target.value })}
                        placeholder="Quiropodia, fresado, etc..."
                        className="mt-2 rounded-xl min-h-[80px]"
                      />
                    </div>

                    {/* Recommendations */}
                    <div>
                      <Label htmlFor="recommendations">Recomendaciones</Label>
                      <Textarea
                        id="recommendations"
                        value={ficha.recommendations}
                        onChange={(e) => setFicha({ ...ficha, recommendations: e.target.value })}
                        placeholder="Cuidados en casa, ejercicios..."
                        className="mt-2 rounded-xl min-h-[80px]"
                      />
                    </div>

                    {/* Next Visit */}
                    <div>
                      <Label htmlFor="next-visit">Próxima Visita Sugerida</Label>
                      <Input
                        id="next-visit"
                        type="date"
                        value={ficha.nextVisit}
                        onChange={(e) => setFicha({ ...ficha, nextVisit: e.target.value })}
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <Button 
                        onClick={handleSaveFicha} 
                        className="rounded-xl shadow-lg shadow-primary/20"
                        disabled={isSaving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Guardando...' : 'Guardar Ficha'}
                      </Button>
                      
                      <Button 
                        onClick={handleFinishAttention}
                        variant="outline"
                        className="rounded-xl bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalizar Atención
                      </Button>

                      <Button 
                        onClick={handleCharge}
                        variant="outline"
                        className="rounded-xl ml-auto"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cobrar
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mis Pacientes Tab - Use real clients data */}
      {activeTab === "pacientes" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Mis Pacientes</h1>
              <p className="text-muted-foreground">Listado de pacientes</p>
            </div>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Buscar paciente..." className="pl-10 rounded-xl h-12" />
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando pacientes...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay pacientes registrados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Etiquetas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full",
                            client.status === "active" && "bg-green-100 text-green-700 border-green-200",
                            client.status === "lead" && "bg-blue-100 text-blue-700 border-blue-200",
                            client.status === "inactive" && "bg-gray-100 text-gray-700 border-gray-200"
                          )}
                        >
                          {client.status === "active" ? "Activo" : 
                           client.status === "lead" ? "Lead" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.tags && client.tags.length > 0 ? (
                          <div className="flex gap-1">
                            {client.tags.map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="rounded-full text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                          <Link href={`/paciente/${client.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </PodiatristLayout>
  );
}