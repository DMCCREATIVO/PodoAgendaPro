import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PodiatristLayout } from "@/components/podiatrist/PodiatristLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, Calendar as CalendarIcon, User, AlertCircle, FileText, Save, CheckCircle, 
  DollarSign, Activity, TrendingUp, Users, Search, Phone, Mail, MapPin, Heart,
  Pill, AlertTriangle, History, Plus
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PodologoPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("mi-dia");
  
  // Mi Día
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [timeUntilNext, setTimeUntilNext] = useState("");

  // Atención
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [patientConditions, setPatientConditions] = useState<any[]>([]);
  const [clinicalHistory, setClinicalHistory] = useState<any[]>([]);
  
  // Ficha Podológica
  const [fichaData, setFichaData] = useState({
    general_evaluation: "",
    nail_condition: "normal",
    skin_condition: "normal",
    has_fungus: false,
    has_calluses: false,
    has_warts: false,
    has_flat_feet: false,
    has_bunions: false,
    pain_level: 0,
    diagnosis: "",
    procedures: "",
    recommendations: "",
    next_visit_date: null as Date | null,
    recommended_products: "",
  });

  // Cobro
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: "cash",
    description: "Consulta podológica",
  });

  // Mis Pacientes
  const [myPatients, setMyPatients] = useState<any[]>([]);
  const [searchPatient, setSearchPatient] = useState("");

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.push("/login");
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    if (parsedSession.role !== "employee") {
      router.push("/login");
      return;
    }

    setSession(parsedSession);
    const tab = router.query.tab as string || "mi-dia";
    setActiveTab(tab);

    if (tab === "mi-dia") {
      loadTodayAppointments(parsedSession);
    } else if (tab === "atencion") {
      loadActiveAppointments(parsedSession);
    } else if (tab === "pacientes") {
      loadMyPatients(parsedSession);
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (!nextAppointment) return;

    const interval = setInterval(() => {
      const now = new Date();
      const appointmentTime = new Date(nextAppointment.scheduled_at);
      const diff = appointmentTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilNext("¡Es ahora!");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilNext(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextAppointment]);

  const loadTodayAppointments = async (sessionData: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from("appointments")
      .select(`
        *,
        clients (name, phone, email),
        services (name, duration_minutes)
      `)
      .eq("company_id", sessionData.companyId)
      .eq("assigned_to", sessionData.userId)
      .gte("scheduled_at", today.toISOString())
      .lt("scheduled_at", tomorrow.toISOString())
      .order("scheduled_at", { ascending: true });

    setTodayAppointments(data || []);

    // Próxima cita
    const now = new Date();
    const upcoming = (data || []).find(apt => new Date(apt.scheduled_at) > now);
    setNextAppointment(upcoming || null);
  };

  const loadActiveAppointments = async (sessionData: any) => {
    const { data } = await supabase
      .from("appointments")
      .select(`
        *,
        clients (*),
        services (name, duration_minutes)
      `)
      .eq("company_id", sessionData.companyId)
      .eq("assigned_to", sessionData.userId)
      .eq("status", "in_progress")
      .single();

    if (data) {
      setSelectedAppointment(data);
      loadPatientData(data.client_id, sessionData.companyId);
    }
  };

  const loadPatientData = async (clientId: string, companyId: string) => {
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    setPatientData(client);

    const { data: conditions } = await supabase
      .from("client_conditions")
      .select("*")
      .eq("client_id", clientId)
      .eq("is_active", true);

    setPatientConditions(conditions || []);

    const { data: notes } = await supabase
      .from("clinical_notes")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5);

    setClinicalHistory(notes || []);
  };

  const loadMyPatients = async (sessionData: any) => {
    const { data } = await supabase
      .from("appointments")
      .select("client_id")
      .eq("company_id", sessionData.companyId)
      .eq("assigned_to", sessionData.userId);

    const clientIds = [...new Set((data || []).map(a => a.client_id))];

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from("clients")
        .select("*")
        .in("id", clientIds);

      setMyPatients(clients || []);
    }
  };

  const handleStartAttention = async (appointmentId: string) => {
    await supabase
      .from("appointments")
      .update({ status: "in_progress" })
      .eq("id", appointmentId);

    router.push("/podologo?tab=atencion");
  };

  const handleSaveFicha = async () => {
    if (!selectedAppointment) return;

    const conditions: string[] = [];
    if (fichaData.has_fungus) conditions.push("Hongos");
    if (fichaData.has_calluses) conditions.push("Callosidades");
    if (fichaData.has_warts) conditions.push("Verrugas");
    if (fichaData.has_flat_feet) conditions.push("Pie plano");
    if (fichaData.has_bunions) conditions.push("Juanetes");

    await supabase.from("clinical_notes").insert([{
      company_id: session.companyId,
      client_id: selectedAppointment.client_id,
      appointment_id: selectedAppointment.id,
      note_type: "diagnosis",
      title: "Ficha Podológica",
      content: JSON.stringify({
        ...fichaData,
        conditions,
        created_at: new Date().toISOString(),
      }),
      created_by: session.userId,
    }]);

    alert("Ficha guardada exitosamente");
  };

  const handleFinishAttention = async () => {
    if (!selectedAppointment) return;

    await handleSaveFicha();
    
    await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", selectedAppointment.id);

    alert("Atención finalizada");
    router.push("/podologo?tab=mi-dia");
  };

  const handleOpenPayment = () => {
    if (!selectedAppointment?.services) return;
    
    const servicePrice = (selectedAppointment.services as any).price || 0;
    setPaymentForm(prev => ({ ...prev, amount: servicePrice }));
    setPaymentDialogOpen(true);
  };

  const handleCreatePayment = async () => {
    if (!selectedAppointment) return;

    await supabase.from("payments").insert([{
      company_id: session.companyId,
      appointment_id: selectedAppointment.id,
      client_id: selectedAppointment.client_id,
      amount: paymentForm.amount,
      payment_method: paymentForm.method,
      description: paymentForm.description,
      status: "completed",
      paid_at: new Date().toISOString(),
      created_by: session.userId,
    }]);

    setPaymentDialogOpen(false);
    alert("Pago registrado exitosamente");
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      scheduled: { variant: "outline", label: "Agendada" },
      confirmed: { variant: "default", label: "Confirmada" },
      in_progress: { variant: "secondary", label: "En Curso" },
      completed: { variant: "default", label: "Completada" },
      cancelled: { variant: "destructive", label: "Cancelada" },
      no_show: { variant: "destructive", label: "No Asistió" },
    };
    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!session) return null;

  return (
    <PodiatristLayout>
      {activeTab === "mi-dia" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Mi Día</h1>

          {/* Próxima Cita */}
          {nextAppointment ? (
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90">Próxima Cita</p>
                  <h2 className="text-2xl font-bold mt-1">{nextAppointment.clients?.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{timeUntilNext}</div>
                  <p className="text-sm opacity-90">
                    {format(new Date(nextAppointment.scheduled_at), "HH:mm", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm opacity-90">
                <Phone className="h-4 w-4" />
                {nextAppointment.clients?.phone}
              </div>

              <Button
                onClick={() => handleStartAttention(nextAppointment.id)}
                variant="secondary"
                className="w-full bg-white text-blue-600 hover:bg-blue-50"
              >
                <Activity className="mr-2 h-4 w-4" />
                Iniciar Atención
              </Button>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-slate-600">No tienes citas programadas para hoy</p>
            </Card>
          )}

          {/* Citas del Día */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Citas de Hoy ({todayAppointments.length})</h3>
            <div className="space-y-3">
              {todayAppointments.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {apt.clients?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">{apt.clients?.name}</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(apt.scheduled_at), "HH:mm", { locale: es })} • {apt.services?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(apt.status)}
                    {apt.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => handleStartAttention(apt.id)}
                      >
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "atencion" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">Atención Clínica</h1>

          {selectedAppointment && patientData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda - Información del Paciente */}
              <div className="lg:col-span-1 space-y-4">
                {/* Perfil */}
                <Card className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {patientData.name?.[0]}
                    </div>
                    <h3 className="text-xl font-bold mt-4">{patientData.name}</h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    {patientData.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4" />
                        {patientData.email}
                      </div>
                    )}
                    {patientData.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" />
                        {patientData.phone}
                      </div>
                    )}
                    {(patientData.custom_fields as any)?.address && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        {(patientData.custom_fields as any).address}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Alertas Médicas */}
                {patientConditions.length > 0 && (
                  <Card className="p-4 border-2 border-orange-200 bg-orange-50">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h4 className="font-bold text-orange-900">Alertas Médicas</h4>
                    </div>
                    <div className="space-y-2">
                      {patientConditions.map(cond => (
                        <div key={cond.id} className="flex items-start gap-2 text-sm">
                          {cond.condition_type === "allergy" && <Heart className="h-4 w-4 text-red-500 mt-0.5" />}
                          {cond.condition_type === "medication" && <Pill className="h-4 w-4 text-blue-500 mt-0.5" />}
                          {cond.condition_type === "medical" && <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />}
                          <div>
                            <p className="font-medium text-orange-900">{cond.name}</p>
                            {cond.description && <p className="text-orange-700 text-xs">{cond.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Historial Reciente */}
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-5 w-5 text-slate-600" />
                    <h4 className="font-bold">Historial Reciente</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {clinicalHistory.slice(0, 3).map(note => (
                      <div key={note.id} className="p-2 bg-slate-50 rounded">
                        <p className="font-medium text-slate-900">{note.title}</p>
                        <p className="text-xs text-slate-600">{format(new Date(note.created_at), "dd MMM yyyy", { locale: es })}</p>
                      </div>
                    ))}
                    {clinicalHistory.length === 0 && (
                      <p className="text-slate-500 text-center py-2">Sin historial previo</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Columna Derecha - Ficha Podológica */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-slate-900">Ficha Podológica</h3>

                  <div className="space-y-6">
                    {/* Evaluación General */}
                    <div>
                      <Label>Evaluación General</Label>
                      <Textarea
                        placeholder="Describe el estado general del paciente..."
                        value={fichaData.general_evaluation}
                        onChange={(e) => setFichaData(prev => ({ ...prev, general_evaluation: e.target.value }))}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* Estado de Uñas y Piel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Estado de Uñas</Label>
                        <Select
                          value={fichaData.nail_condition}
                          onValueChange={(value) => setFichaData(prev => ({ ...prev, nail_condition: value }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="slight_damage">Daño leve</SelectItem>
                            <SelectItem value="moderate_damage">Daño moderado</SelectItem>
                            <SelectItem value="severe_damage">Daño severo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Estado de Piel</Label>
                        <Select
                          value={fichaData.skin_condition}
                          onValueChange={(value) => setFichaData(prev => ({ ...prev, skin_condition: value }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="dry">Seca</SelectItem>
                            <SelectItem value="cracked">Agrietada</SelectItem>
                            <SelectItem value="infected">Infectada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Condiciones (Checkboxes) */}
                    <div>
                      <Label className="mb-3 block">Condiciones Detectadas</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="fungus"
                            checked={fichaData.has_fungus}
                            onCheckedChange={(checked) => setFichaData(prev => ({ ...prev, has_fungus: !!checked }))}
                          />
                          <label htmlFor="fungus" className="text-sm font-medium cursor-pointer">Hongos</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="calluses"
                            checked={fichaData.has_calluses}
                            onCheckedChange={(checked) => setFichaData(prev => ({ ...prev, has_calluses: !!checked }))}
                          />
                          <label htmlFor="calluses" className="text-sm font-medium cursor-pointer">Callosidades</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="warts"
                            checked={fichaData.has_warts}
                            onCheckedChange={(checked) => setFichaData(prev => ({ ...prev, has_warts: !!checked }))}
                          />
                          <label htmlFor="warts" className="text-sm font-medium cursor-pointer">Verrugas</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="flat_feet"
                            checked={fichaData.has_flat_feet}
                            onCheckedChange={(checked) => setFichaData(prev => ({ ...prev, has_flat_feet: !!checked }))}
                          />
                          <label htmlFor="flat_feet" className="text-sm font-medium cursor-pointer">Pie Plano</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="bunions"
                            checked={fichaData.has_bunions}
                            onCheckedChange={(checked) => setFichaData(prev => ({ ...prev, has_bunions: !!checked }))}
                          />
                          <label htmlFor="bunions" className="text-sm font-medium cursor-pointer">Juanetes</label>
                        </div>
                      </div>
                    </div>

                    {/* Nivel de Dolor */}
                    <div>
                      <Label className="mb-3 block">Nivel de Dolor (0-10)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[fichaData.pain_level]}
                          onValueChange={(value) => setFichaData(prev => ({ ...prev, pain_level: value[0] }))}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                          {fichaData.pain_level}
                        </div>
                      </div>
                    </div>

                    {/* Diagnóstico */}
                    <div>
                      <Label>Diagnóstico</Label>
                      <Textarea
                        placeholder="Escribe el diagnóstico del paciente..."
                        value={fichaData.diagnosis}
                        onChange={(e) => setFichaData(prev => ({ ...prev, diagnosis: e.target.value }))}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* Procedimientos */}
                    <div>
                      <Label>Procedimientos Realizados</Label>
                      <Textarea
                        placeholder="Describe los procedimientos realizados..."
                        value={fichaData.procedures}
                        onChange={(e) => setFichaData(prev => ({ ...prev, procedures: e.target.value }))}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* Recomendaciones */}
                    <div>
                      <Label>Recomendaciones</Label>
                      <Textarea
                        placeholder="Instrucciones y recomendaciones para el paciente..."
                        value={fichaData.recommendations}
                        onChange={(e) => setFichaData(prev => ({ ...prev, recommendations: e.target.value }))}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {/* Productos Recomendados */}
                    <div>
                      <Label>Productos Recomendados</Label>
                      <Input
                        placeholder="Ej: Crema antifúngica, plantillas ortopédicas..."
                        value={fichaData.recommended_products}
                        onChange={(e) => setFichaData(prev => ({ ...prev, recommended_products: e.target.value }))}
                        className="mt-2"
                      />
                    </div>

                    {/* Próxima Visita */}
                    <div>
                      <Label>Próxima Visita Sugerida</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full mt-2 justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fichaData.next_visit_date ? format(fichaData.next_visit_date, "PPP", { locale: es }) : "Seleccionar fecha"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fichaData.next_visit_date || undefined}
                            onSelect={(date) => setFichaData(prev => ({ ...prev, next_visit_date: date || null }))}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={handleSaveFicha}
                        variant="outline"
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </Button>
                      <Button
                        onClick={handleFinishAttention}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Finalizar Atención
                      </Button>
                      <Button
                        onClick={handleOpenPayment}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Cobrar
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Activity className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No hay atención activa</h3>
              <p className="text-slate-600 mb-4">Inicia una atención desde "Mi Día" para comenzar</p>
              <Button onClick={() => router.push("/podologo?tab=mi-dia")}>
                Ir a Mi Día
              </Button>
            </Card>
          )}
        </div>
      )}

      {activeTab === "pacientes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Mis Pacientes</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar paciente..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPatients
              .filter(p => 
                searchPatient === "" ||
                p.name?.toLowerCase().includes(searchPatient.toLowerCase()) ||
                p.email?.toLowerCase().includes(searchPatient.toLowerCase()) ||
                p.phone?.includes(searchPatient)
              )
              .map(patient => (
                <Card key={patient.id} className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {patient.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{patient.name}</h3>
                      <div className="space-y-1 mt-2 text-sm text-slate-600">
                        {patient.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <Badge variant="outline">
                          {patient.status === "active" ? "Activo" : patient.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Modal de Cobro */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Método de Pago</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value) => setPaymentForm(prev => ({ ...prev, method: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="online">Pago Online</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Descripción</Label>
              <Input
                value={paymentForm.description}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePayment}>
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PodiatristLayout>
  );
}