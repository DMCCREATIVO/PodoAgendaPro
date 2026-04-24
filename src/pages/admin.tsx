import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  UserPlus,
  Search,
  Filter,
  Download
} from "lucide-react";

export default function Admin() {
  const router = useRouter();
  const { toast } = useToast();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [planData, setPlanData] = useState<any>(null);

  // States para Dashboard
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasSemana: 0,
    citasMes: 0,
    ingresosMes: 0,
    pacientesActivos: 0,
    podologosActivos: 0,
  });
  const [usageAlerts, setUsageAlerts] = useState<any[]>([]);

  // States para Podólogos
  const [podologos, setPodologos] = useState<any[]>([]);
  const [podologoDialogOpen, setPodologoDialogOpen] = useState(false);
  const [editingPodologo, setEditingPodologo] = useState<any>(null);
  const [podologoForm, setPodologoForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    schedule: "",
  });

  // States para Pacientes
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacienteDialogOpen, setPacienteDialogOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<any>(null);
  const [pacienteForm, setPacienteForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    birth_date: "",
    medical_conditions: "",
  });
  const [searchPaciente, setSearchPaciente] = useState("");

  // States para Agenda
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: "",
    podiatrist_id: "",
    service_id: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  // States para Cobros
  const [payments, setPayments] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");

  // States para Configuración
  const [configForm, setConfigForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    opening_hours: "",
    closing_hours: "",
    services: [] as string[],
  });
  const [integrations, setIntegrations] = useState({
    whatsapp_enabled: false,
    mercadopago_enabled: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkAuth();
    }
  }, [mounted, router]);

  useEffect(() => {
    if (tab && typeof tab === "string") {
      setActiveTab(tab);
    }
  }, [tab]);

  const checkAuth = async () => {
    try {
      const session = authService.getSession();
      
      if (!session) {
        console.log("❌ No hay sesión, redirigiendo a login");
        router.replace("/login");
        return;
      }

      console.log("✅ Sesión encontrada:", session);

      // Verificar que sea admin o owner
      if (session.role !== "owner" && session.role !== "admin") {
        console.log("❌ Usuario no es admin, redirigiendo");
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos para acceder al panel de administración",
          variant: "destructive",
        });
        router.replace(authService.getDashboardRoute());
        return;
      }

      if (!session.companyId) {
        console.log("❌ Usuario admin sin empresa asignada");
        toast({
          title: "Error de Configuración",
          description: "Tu usuario no tiene una empresa asignada",
          variant: "destructive",
        });
        router.replace("/login");
        return;
      }

      console.log("✅ Usuario autorizado, cargando datos");
      await loadData(session.companyId);
    } catch (error) {
      console.error("💥 Error en checkAuth:", error);
      setLoading(false);
    }
  };

  const loadData = async (companyId: string) => {
    setLoading(true);
    const sessionData = JSON.parse(localStorage.getItem("session") || "{}");

    // Cargar datos de la empresa
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", sessionData.companyId)
      .single();
    
    setCompanyData(company);

    // Cargar plan
    if (company?.plan) {
      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .eq("id", company.plan)
        .single();
      setPlanData(plan);
    }

    if (tab === "dashboard") await loadDashboard(sessionData.companyId);
    if (tab === "podologos") await loadPodologos(sessionData.companyId);
    if (tab === "pacientes") await loadPacientes(sessionData.companyId);
    if (tab === "agenda") await loadAgenda(sessionData.companyId);
    if (tab === "cobros") await loadCobros(sessionData.companyId);
    if (tab === "config") await loadConfig(sessionData.companyId);

    setLoading(false);
  };

  const loadDashboard = async (companyId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const startOfWeek = new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split("T")[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    // Cargar citas
    const { data: allAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("company_id", companyId);

    const citasHoy = allAppointments?.filter((a: any) => a.appointment_date === today).length || 0;
    const citasSemana = allAppointments?.filter((a: any) => a.appointment_date >= startOfWeek).length || 0;
    const citasMes = allAppointments?.filter((a: any) => a.appointment_date >= startOfMonth).length || 0;

    // Cargar ingresos
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("amount")
      .eq("company_id", companyId)
      .eq("status", "paid")
      .gte("created_at", startOfMonth);

    const ingresosMes = paymentsData?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

    // Cargar usuarios activos
    const { data: podologosData } = await supabase
      .from("company_users")
      .select("user_id")
      .eq("company_id", companyId)
      .eq("role", "employee")
      .eq("status", "active");

    const { data: pacientesData } = await supabase
      .from("clients")
      .select("*")
      .eq("company_id", companyId)
      .eq("status", "active");

    setStats({
      citasHoy,
      citasSemana,
      citasMes,
      ingresosMes,
      pacientesActivos: pacientesData?.length || 0,
      podologosActivos: podologosData?.length || 0,
    });

    // Alertas de límites
    const alerts = [];
    if (planData?.limits?.max_monthly_appointments && planData.limits.max_monthly_appointments > 0) {
      const usage = (citasMes / planData.limits.max_monthly_appointments) * 100;
      if (usage >= 80) {
        alerts.push({
          type: "warning",
          message: `Has usado ${citasMes} de ${planData.limits.max_monthly_appointments} citas este mes (${Math.round(usage)}%)`,
        });
      }
    }
    setUsageAlerts(alerts);
  };

  const loadPodologos = async (companyId: string) => {
    const { data } = await supabase
      .from("company_users")
      .select(`
        id,
        role,
        status,
        user_id,
        users!inner (
          id,
          full_name,
          email,
          phone,
          is_active
        )
      `)
      .eq("company_id", companyId)
      .eq("role", "employee");

    const mapped = (data || []).map((d: any) => ({
      ...(d.users || {}),
      status: d.status,
      role: d.role
    }));
    setPodologos(mapped);
  };

  const loadPacientes = async (companyId: string) => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    setPacientes(data || []);
  };

  const loadAgenda = async (companyId: string) => {
    const { data } = await supabase
      .from("appointments")
      .select(`
        *,
        clients (name, phone),
        users!appointments_assigned_to_fkey (full_name)
      `)
      .eq("company_id", companyId)
      .order("scheduled_at", { ascending: false });

    setAppointments(data || []);
  };

  const loadCobros = async (companyId: string) => {
    const { data } = await supabase
      .from("payments")
      .select(`
        *,
        appointments (
          scheduled_at
        ),
        clients (name)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    setPayments(data || []);
  };

  const loadConfig = async (companyId: string) => {
    if (!companyData) return;
    
    setConfigForm({
      name: companyData.name || "",
      phone: companyData.phone || "",
      email: companyData.email || "",
      address: companyData.address || "",
      opening_hours: companyData.metadata?.opening_hours || "09:00",
      closing_hours: companyData.metadata?.closing_hours || "18:00",
      services: companyData.metadata?.services || [],
    });

    setIntegrations({
      whatsapp_enabled: companyData.integrations?.whatsapp?.enabled || false,
      mercadopago_enabled: companyData.integrations?.mercadopago?.enabled || false,
    });
  };

  const handleCreatePodologo = async () => {
    try {
      const session = authService.getSession();
      if (!session?.companyId) throw new Error("No hay empresa asignada");

      // Crear usuario via API (Supabase Auth + users + company_users)
      const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
      const createResult = await authService.createUser({
        email: podologoForm.email,
        password: tempPassword,
        full_name: podologoForm.full_name,
        role: "employee",
        company_id: session.companyId,
        phone: podologoForm.phone || undefined,
      });

      if (!createResult.success) {
        throw new Error(createResult.error || "Error creando podólogo");
      }

      setPodologoDialogOpen(false);
      setPodologoForm({ full_name: "", email: "", phone: "", specialization: "", schedule: "" });
      loadPodologos(session.companyId);
      toast({
        title: "Podólogo creado",
        description: `Contraseña temporal: ${tempPassword}`,
      });
    } catch (error: any) {
      toast({
        title: "Error al crear podólogo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePaciente = async () => {
    try {
      const session = authService.getSession();
      if (!session?.companyId) throw new Error("No hay empresa asignada");

      const { error } = await supabase.from("clients").insert([{
        name: pacienteForm.full_name,
        email: pacienteForm.email,
        phone: pacienteForm.phone,
        company_id: session.companyId,
        status: "active",
        notes: pacienteForm.medical_conditions,
        custom_fields: {
          address: pacienteForm.address,
          date_of_birth: pacienteForm.birth_date
        }
      }]);

      if (error) throw error;

      setPacienteDialogOpen(false);
      setPacienteForm({ full_name: "", email: "", phone: "", address: "", birth_date: "", medical_conditions: "" });
      loadPacientes(session.companyId);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const session = authService.getSession();
      if (!session?.companyId) throw new Error("No hay empresa asignada");

      const { error } = await supabase
        .from("companies")
        .update({
          name: configForm.name,
          phone: configForm.phone,
          email: configForm.email,
          address: configForm.address,
          metadata: {
            ...companyData.metadata,
            opening_hours: configForm.opening_hours,
            closing_hours: configForm.closing_hours,
            services: configForm.services,
          },
          integrations: {
            ...companyData.integrations,
            whatsapp: { ...companyData.integrations?.whatsapp, enabled: integrations.whatsapp_enabled },
            mercadopago: { ...companyData.integrations?.mercadopago, enabled: integrations.mercadopago_enabled },
          },
        })
        .eq("id", session.companyId);

      if (error) throw error;
      alert("Configuración guardada correctamente");
      loadData(session.companyId);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
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

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      pending: { variant: "outline", label: "Pendiente", icon: AlertCircle },
      paid: { variant: "default", label: "Pagado", icon: CheckCircle },
      cancelled: { variant: "destructive", label: "Cancelado", icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {tab === "dashboard" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Panel de control de {companyData?.name}</p>
          </div>

          {/* Alertas */}
          {usageAlerts.length > 0 && (
            <div className="space-y-2">
              {usageAlerts.map((alert, idx) => (
                <Card key={idx} className="p-4 bg-orange-50 border-orange-200">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">{alert.message}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Citas Hoy</p>
                  <p className="text-4xl font-bold mt-2">{stats.citasHoy}</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Citas Esta Semana</p>
                  <p className="text-4xl font-bold mt-2">{stats.citasSemana}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Ingresos Este Mes</p>
                  <p className="text-4xl font-bold mt-2">${stats.ingresosMes.toLocaleString()}</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Citas Este Mes</p>
                  <p className="text-4xl font-bold mt-2">{stats.citasMes}</p>
                </div>
                <Calendar className="h-12 w-12 text-orange-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Pacientes Activos</p>
                  <p className="text-4xl font-bold mt-2">{stats.pacientesActivos}</p>
                </div>
                <Users className="h-12 w-12 text-pink-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Podólogos Activos</p>
                  <p className="text-4xl font-bold mt-2">{stats.podologosActivos}</p>
                </div>
                <Stethoscope className="h-12 w-12 text-indigo-200" />
              </div>
            </Card>
          </div>

          {/* Info Plan */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Plan Actual</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{planData?.name || "Free"}</p>
                <p className="text-slate-600 mt-1">
                  {planData?.limits?.max_monthly_appointments > 0 
                    ? `${stats.citasMes} / ${planData.limits.max_monthly_appointments} citas este mes`
                    : "Citas ilimitadas"}
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                ${planData?.price_monthly || 0}/mes
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {tab === "podologos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Podólogos</h1>
              <p className="text-slate-600">Gestiona tu equipo de podólogos</p>
            </div>
            <Button onClick={() => { setPodologoDialogOpen(true); setEditingPodologo(null); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Podólogo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podologos.map((p) => (
              <Card key={p.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {p.full_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{p.full_name}</h3>
                      <p className="text-sm text-slate-600">Podólogo</p>
                    </div>
                  </div>
                  <Badge variant={p.is_active ? "default" : "secondary"}>
                    {p.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    {p.email}
                  </div>
                  {p.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4" />
                      {p.phone}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Dialog open={podologoDialogOpen} onOpenChange={setPodologoDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Podólogo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre Completo</Label>
                  <Input
                    value={podologoForm.full_name}
                    onChange={(e) => setPodologoForm({ ...podologoForm, full_name: e.target.value })}
                    placeholder="Ej: Dr. Juan Pérez"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={podologoForm.email}
                    onChange={(e) => setPodologoForm({ ...podologoForm, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={podologoForm.phone}
                    onChange={(e) => setPodologoForm({ ...podologoForm, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPodologoDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreatePodologo}>Crear Podólogo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {tab === "pacientes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Pacientes</h1>
              <p className="text-slate-600">Gestiona tus pacientes</p>
            </div>
            <Button onClick={() => { setPacienteDialogOpen(true); setEditingPaciente(null); }} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nuevo Paciente
            </Button>
          </div>

          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={searchPaciente}
                onChange={(e) => setSearchPaciente(e.target.value)}
                placeholder="Buscar paciente por nombre, email o teléfono..."
                className="pl-10"
              />
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes
                  .filter((p) =>
                    searchPaciente === "" ||
                    p.name?.toLowerCase().includes(searchPaciente.toLowerCase()) ||
                    p.email?.toLowerCase().includes(searchPaciente.toLowerCase()) ||
                    p.phone?.includes(searchPaciente)
                  )
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {p.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-slate-600">{p.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="h-3 w-3" />
                            {p.phone || "N/A"}
                          </div>
                          {(p.custom_fields as any)?.address && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="h-3 w-3" />
                              {(p.custom_fields as any).address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {p.last_contact_at ? new Date(p.last_contact_at).toLocaleDateString() : "Sin visitas"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.status === "active" ? "default" : "secondary"}>
                          {p.status === "active" ? "Activo" : p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          <Dialog open={pacienteDialogOpen} onOpenChange={setPacienteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Paciente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre Completo</Label>
                  <Input
                    value={pacienteForm.full_name}
                    onChange={(e) => setPacienteForm({ ...pacienteForm, full_name: e.target.value })}
                    placeholder="Ej: María González"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={pacienteForm.email}
                    onChange={(e) => setPacienteForm({ ...pacienteForm, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={pacienteForm.phone}
                    onChange={(e) => setPacienteForm({ ...pacienteForm, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input
                    value={pacienteForm.address}
                    onChange={(e) => setPacienteForm({ ...pacienteForm, address: e.target.value })}
                    placeholder="Calle 123, Ciudad"
                  />
                </div>
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={pacienteForm.birth_date}
                    onChange={(e) => setPacienteForm({ ...pacienteForm, birth_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Condiciones Médicas</Label>
                  <Textarea
                    value={pacienteForm.medical_conditions}
                    onChange={(e) => setPacienteForm({ ...pacienteForm, medical_conditions: e.target.value })}
                    placeholder="Diabético, hipertensión, etc."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPacienteDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreatePaciente}>Crear Paciente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {tab === "agenda" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
              <p className="text-slate-600">Gestiona todas las citas</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cita
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Podólogo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="font-medium">{new Date(apt.scheduled_at).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-600">{new Date(apt.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{apt.clients?.name}</p>
                      <p className="text-sm text-slate-600">{apt.clients?.phone}</p>
                    </TableCell>
                    <TableCell>{apt.users?.full_name}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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

      {tab === "cobros" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Cobros</h1>
              <p className="text-slate-600">Gestiona los pagos de tu clínica</p>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments
                  .filter((p) => filterStatus === "all" || p.status === filterStatus)
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {payment.clients?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        ${Number(payment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.payment_method || "Efectivo"}</Badge>
                      </TableCell>
                      <TableCell>{getPaymentBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {tab === "config" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
            <p className="text-slate-600">Configura tu clínica</p>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Datos de la Clínica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de la Clínica</Label>
                <Input
                  value={configForm.name}
                  onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                  placeholder="Mi Clínica Podológica"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={configForm.phone}
                  onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={configForm.email}
                  onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                  placeholder="contacto@clinica.com"
                />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                  placeholder="Av. Principal 123"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Horarios de Atención</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Hora de Apertura</Label>
                <Input
                  type="time"
                  value={configForm.opening_hours}
                  onChange={(e) => setConfigForm({ ...configForm, opening_hours: e.target.value })}
                />
              </div>
              <div>
                <Label>Hora de Cierre</Label>
                <Input
                  type="time"
                  value={configForm.closing_hours}
                  onChange={(e) => setConfigForm({ ...configForm, closing_hours: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Integraciones</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-bold text-slate-900">WhatsApp</h3>
                  <p className="text-sm text-slate-600">Envía notificaciones por WhatsApp</p>
                </div>
                <Button
                  variant={integrations.whatsapp_enabled ? "default" : "outline"}
                  onClick={() => setIntegrations({ ...integrations, whatsapp_enabled: !integrations.whatsapp_enabled })}
                >
                  {integrations.whatsapp_enabled ? "Activado" : "Desactivado"}
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-bold text-slate-900">Mercado Pago</h3>
                  <p className="text-sm text-slate-600">Acepta pagos online</p>
                </div>
                <Button
                  variant={integrations.mercadopago_enabled ? "default" : "outline"}
                  onClick={() => setIntegrations({ ...integrations, mercadopago_enabled: !integrations.mercadopago_enabled })}
                >
                  {integrations.mercadopago_enabled ? "Activado" : "Desactivado"}
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}