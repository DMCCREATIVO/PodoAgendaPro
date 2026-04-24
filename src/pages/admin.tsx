import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/auth";
import type { Session } from "@/services/auth";
import { SEO } from "@/components/SEO";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Users, 
  UserCircle, 
  DollarSign, 
  Settings,
  TrendingUp,
  Activity,
  Clock,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";

export default function Admin() {
  const router = useRouter();
  const { toast } = useToast();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Estados de datos
  const [companyData, setCompanyData] = useState<any>(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    monthRevenue: 0,
    newPatients: 0,
    occupancy: 0,
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [podologos, setPodologos] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [cobros, setCobros] = useState<any[]>([]);

  // Estados de modales
  const [podologoDialogOpen, setPodologoDialogOpen] = useState(false);
  const [pacienteDialogOpen, setPacienteDialogOpen] = useState(false);

  // Estados de formularios
  const [podologoForm, setPodologoForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    schedule: "",
  });

  const [pacienteForm, setPacienteForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    birth_date: "",
    medical_conditions: "",
  });

  const [configForm, setConfigForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    opening_hours: "09:00",
    closing_hours: "18:00",
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
    if (mounted && !loading) {
      checkAuth();
    }
  }, [mounted]);

  useEffect(() => {
    if (tab && typeof tab === "string") {
      setActiveTab(tab);
    }
  }, [tab]);

  const checkAuth = async () => {
    try {
      console.log("🔍 Admin - Verificando autenticación...");
      
      const currentSession = authService.getSession();
      
      if (!currentSession) {
        console.log("❌ No hay sesión, redirigiendo a login");
        router.replace("/login");
        return;
      }

      console.log("✅ Sesión encontrada:", currentSession);

      // Verificar que sea admin o owner
      if (currentSession.role !== "owner" && currentSession.role !== "admin") {
        console.log("❌ Usuario no autorizado, rol:", currentSession.role);
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos para acceder al panel de administración",
          variant: "destructive",
        });
        router.replace(authService.getDashboardRoute());
        return;
      }

      if (!currentSession.companyId) {
        console.log("❌ Usuario sin empresa asignada");
        toast({
          title: "Error de Configuración",
          description: "Tu usuario no tiene una empresa asignada",
          variant: "destructive",
        });
        router.replace("/login");
        return;
      }

      setSession(currentSession);
      console.log("✅ Usuario autorizado, cargando datos de empresa:", currentSession.companyId);
      await loadData(currentSession.companyId);
      setLoading(false);
    } catch (error) {
      console.error("💥 Error en checkAuth:", error);
      setLoading(false);
      router.replace("/login");
    }
  };

  const loadData = async (companyId: string) => {
    try {
      console.log("📊 Cargando datos para empresa:", companyId);

      // Cargar datos de la empresa
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (companyError) {
        console.error("Error cargando empresa:", companyError);
        throw companyError;
      }

      console.log("✅ Empresa cargada:", company);
      setCompanyData(company);

      // Cargar podólogos
      const { data: podologosData } = await supabase
        .from("company_users")
        .select(`
          user_id,
          role,
          status,
          users (
            id,
            email,
            full_name,
            phone
          )
        `)
        .eq("company_id", companyId)
        .eq("role", "employee");

      setPodologos((podologosData || []).map((p: any) => ({
        id: p.user_id,
        email: p.users.email,
        full_name: p.users.full_name,
        phone: p.users.phone,
        status: p.status,
      })));

      // Cargar pacientes
      const { data: pacientesData } = await supabase
        .from("clients")
        .select("*")
        .eq("company_id", companyId);

      setPacientes(pacientesData || []);

      // Cargar estadísticas mock (por ahora)
      setStats({
        todayAppointments: 12,
        monthRevenue: 2500000,
        newPatients: 8,
        occupancy: 75,
      });

      // Cargar config
      loadConfig(company);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    }
  };

  const loadConfig = (company: any) => {
    if (!company) return;
    
    setConfigForm({
      name: company.name || "",
      phone: company.phone || "",
      email: company.email || "",
      address: company.address || "",
      opening_hours: company.metadata?.opening_hours || "09:00",
      closing_hours: company.metadata?.closing_hours || "18:00",
      services: company.metadata?.services || [],
    });

    setIntegrations({
      whatsapp_enabled: company.integrations?.whatsapp?.enabled || false,
      mercadopago_enabled: company.integrations?.mercadopago?.enabled || false,
    });
  };

  const handleCreatePodologo = async () => {
    try {
      if (!session?.companyId) throw new Error("No hay empresa asignada");

      const userId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { 
            const r = Math.random() * 16 | 0; 
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); 
          });

      const { error: userError } = await supabase.from("users").insert([{
        id: userId,
        email: podologoForm.email,
        full_name: podologoForm.full_name,
        phone: podologoForm.phone,
        is_active: true,
      }]);

      if (userError) throw userError;

      const { error: relError } = await supabase.from("company_users").insert([{
        company_id: session.companyId,
        user_id: userId,
        role: "employee",
        status: "active"
      }]);

      if (relError) throw relError;

      setPodologoDialogOpen(false);
      setPodologoForm({ full_name: "", email: "", phone: "", specialization: "", schedule: "" });
      loadData(session.companyId);
      
      toast({ title: "✅ Podólogo creado exitosamente" });
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
      loadData(session.companyId);
      
      toast({ title: "✅ Paciente creado exitosamente" });
    } catch (error: any) {
      toast({
        title: "Error al crear paciente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveConfig = async () => {
    try {
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
      
      toast({ title: "✅ Configuración guardada correctamente" });
      loadData(session.companyId);
    } catch (error: any) {
      toast({
        title: "Error al guardar configuración",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      scheduled: { color: "bg-blue-500", label: "Agendada" },
      confirmed: { color: "bg-green-500", label: "Confirmada" },
      in_progress: { color: "bg-yellow-500", label: "En Progreso" },
      completed: { color: "bg-emerald-500", label: "Completada" },
      cancelled: { color: "bg-red-500", label: "Cancelada" },
      no_show: { color: "bg-gray-500", label: "No Asistió" },
    };
    const badge = badges[status] || badges.scheduled;
    return <Badge className={`${badge.color} text-white border-0`}>{badge.label}</Badge>;
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AdminLayout activeTab={activeTab}>
      <SEO title="Panel Admin - PodoAgenda Pro" />

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Vista general de {companyData?.name || "tu clínica"}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Hoy</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Citas de Hoy</p>
              <p className="text-4xl font-bold">{stats.todayAppointments}</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>+12% vs ayer</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Mes</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Ingresos del Mes</p>
              <p className="text-4xl font-bold">${(stats.monthRevenue / 1000).toFixed(0)}K</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>+8% vs mes anterior</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <UserCircle className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Mes</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Pacientes Nuevos</p>
              <p className="text-4xl font-bold">{stats.newPatients}</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>+15% vs mes anterior</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Hoy</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Ocupación</p>
              <p className="text-4xl font-bold">{stats.occupancy}%</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <Clock className="w-4 h-4" />
                <span>Capacidad óptima</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Podólogos Tab */}
      {activeTab === "podologos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Podólogos</h1>
              <p className="text-gray-600">Gestiona el equipo de podólogos</p>
            </div>
            <Dialog open={podologoDialogOpen} onOpenChange={setPodologoDialogOpen}>
              <Button onClick={() => setPodologoDialogOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Podólogo
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Podólogo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <Input
                      value={podologoForm.full_name}
                      onChange={(e) => setPodologoForm({ ...podologoForm, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={podologoForm.email}
                      onChange={(e) => setPodologoForm({ ...podologoForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={podologoForm.phone}
                      onChange={(e) => setPodologoForm({ ...podologoForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPodologoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePodologo}>
                    Crear Podólogo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {podologos.map((podologo) => (
                  <TableRow key={podologo.id}>
                    <TableCell className="font-medium">{podologo.full_name}</TableCell>
                    <TableCell>{podologo.email}</TableCell>
                    <TableCell>{podologo.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge className={podologo.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                        {podologo.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Pacientes Tab */}
      {activeTab === "pacientes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pacientes</h1>
              <p className="text-gray-600">Gestiona los pacientes de la clínica</p>
            </div>
            <Dialog open={pacienteDialogOpen} onOpenChange={setPacienteDialogOpen}>
              <Button onClick={() => setPacienteDialogOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                Nuevo Paciente
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Paciente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nombre Completo</Label>
                    <Input
                      value={pacienteForm.full_name}
                      onChange={(e) => setPacienteForm({ ...pacienteForm, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={pacienteForm.email}
                      onChange={(e) => setPacienteForm({ ...pacienteForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={pacienteForm.phone}
                      onChange={(e) => setPacienteForm({ ...pacienteForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPacienteDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePaciente}>
                    Crear Paciente
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pacientes.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">{paciente.name}</TableCell>
                    <TableCell>{paciente.email}</TableCell>
                    <TableCell>{paciente.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge className={paciente.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                        {paciente.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Configuración Tab */}
      {activeTab === "configuracion" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
            <p className="text-gray-600">Ajustes de la clínica</p>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Información de la Clínica</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={configForm.name}
                    onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={configForm.phone}
                    onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={configForm.email}
                  onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Dirección</Label>
                <Input
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveConfig}>
                  Guardar Configuración
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}