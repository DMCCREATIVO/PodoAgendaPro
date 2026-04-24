import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/auth";
import type { Session } from "@/services/auth";
import { SEO } from "@/components/SEO";
import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Activity,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Palette,
  Settings as SettingsIcon,
  Copy,
  Eye,
  EyeOff,
  Crown,
  Zap,
  Rocket,
  AlertCircle,
  Clock,
} from "lucide-react";

// Tipos
interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  max_users: number;
  max_podiatrists: number;
  max_monthly_appointments: number;
  features: string[];
}

export default function SuperAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const { tab } = router.query;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Estados para datos
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeCompanies: 0,
    monthlyRevenue: 0,
  });

  // Estados para modales
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
    companyName?: string;
    companySlug?: string;
  } | null>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    primary_color: "#2563EB",
    secondary_color: "#8B5CF6",
    logo_url: "",
    plan: "free" as "free" | "pro" | "enterprise",
    admin_email: "",
    admin_name: "",
    admin_password: "",
  });

  const [userForm, setUserForm] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "patient" as "patient" | "owner" | "employee",
    company_id: "",
  });

  useEffect(() => {
    setMounted(true);
    const currentSession = authService.getSession();
    
    if (!currentSession || !currentSession.isSuperadmin) {
      router.replace("/login");
      return;
    }
    
    setSession(currentSession);
    setLoading(false);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      // Cargar empresas
      const { data: companiesData } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      setCompanies(companiesData || []);

      // Cargar usuarios
      const { data: usersData } = await supabase
        .from("users")
        .select(`
          *,
          company_users(role, company:companies(name))
        `)
        .order("created_at", { ascending: false });
      
      setUsers(usersData || []);

      // Cargar planes
      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });
      
      setPlans(plansData || []);

      // Calcular estadísticas
      setStats({
        totalCompanies: companiesData?.length || 0,
        totalUsers: usersData?.length || 0,
        activeCompanies: companiesData?.filter((c: any) => c.is_active && c.plan_status === 'active').length || 0,
        monthlyRevenue: companiesData?.reduce((sum: number, c: any) => {
          const plan = plansData?.find((p: any) => p.id === c.plan);
          return sum + (plan?.price_monthly || 0);
        }, 0) || 0,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateCompany = async () => {
    try {
      // Generar slug si está vacío
      const slug = companyForm.slug || generateSlug(companyForm.name);
      
      // Generar contraseña para el admin si está vacía
      const adminPassword = companyForm.admin_password || generatePassword();

      // Obtener límites del plan seleccionado
      const selectedPlan = plans.find(p => p.id === companyForm.plan);

      const companyData = {
        name: companyForm.name,
        slug: slug,
        email: companyForm.email,
        phone: companyForm.phone,
        address: companyForm.address,
        logo_url: companyForm.logo_url,
        plan: companyForm.plan,
        plan_status: 'trial',
        max_users: selectedPlan?.max_users || 5,
        max_podiatrists: selectedPlan?.max_podiatrists || 1,
        max_monthly_appointments: selectedPlan?.max_monthly_appointments || 50,
        default_admin_password: adminPassword,
        metadata: {
          primary_color: companyForm.primary_color,
          secondary_color: companyForm.secondary_color
        }
      };

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([companyData])
        .select()
        .single();

      if (companyError) throw companyError;

      // Crear usuario admin de la empresa
      const userId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { 
            const r = Math.random() * 16 | 0; 
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); 
          });

      const { data: adminUser, error: userError } = await supabase
        .from("users")
        .insert([{
          id: userId,
          email: companyForm.admin_email,
          full_name: companyForm.admin_name,
          is_active: true,
          created_by: session?.userId,
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Crear relación company_users
      const { error: relationError } = await supabase
        .from("company_users")
        .insert([{
          user_id: adminUser.id,
          company_id: company.id,
          role: 'owner',
        }]);

      if (relationError) throw relationError;

      // Guardar credenciales generadas
      setGeneratedCredentials({
        email: companyForm.admin_email,
        password: adminPassword,
        companyName: company.name,
        companySlug: company.slug,
      });

      toast({ title: "✅ Empresa creada exitosamente" });
      setCompanyDialogOpen(false);
      setCredentialsDialogOpen(true);
      setCompanyForm({
        name: "",
        slug: "",
        email: "",
        phone: "",
        address: "",
        primary_color: "#2563EB",
        secondary_color: "#8B5CF6",
        logo_url: "",
        plan: "free",
        admin_email: "",
        admin_name: "",
        admin_password: "",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al crear empresa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateCompany = async () => {
    try {
      const selectedPlan = plans.find(p => p.id === companyForm.plan);

      const companyData = {
        name: companyForm.name,
        slug: companyForm.slug,
        email: companyForm.email,
        phone: companyForm.phone,
        address: companyForm.address,
        logo_url: companyForm.logo_url,
        plan: companyForm.plan,
        max_users: selectedPlan?.max_users || editingCompany.max_users,
        max_podiatrists: selectedPlan?.max_podiatrists || editingCompany.max_podiatrists,
        max_monthly_appointments: selectedPlan?.max_monthly_appointments || editingCompany.max_monthly_appointments,
        metadata: {
          ...(editingCompany?.metadata || {}),
          primary_color: companyForm.primary_color,
          secondary_color: companyForm.secondary_color
        }
      };

      const { error } = await supabase
        .from("companies")
        .update(companyData)
        .eq("id", editingCompany.id);

      if (error) throw error;

      toast({ title: "✅ Empresa actualizada exitosamente" });
      setCompanyDialogOpen(false);
      setEditingCompany(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al actualizar empresa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleCompanyStatus = async (companyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      const { error } = await supabase
        .from("companies")
        .update({ plan_status: newStatus })
        .eq("id", companyId);

      if (error) throw error;

      toast({ 
        title: newStatus === 'active' ? "✅ Empresa activada" : "⚠️ Empresa suspendida" 
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al cambiar estado",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta empresa? Esto eliminará todos sus datos.")) return;

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "✅ Empresa eliminada" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al eliminar empresa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { 
            const r = Math.random() * 16 | 0; 
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); 
          });

      const password = userForm.password || generatePassword();

      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([{
          id: newId,
          email: userForm.email,
          full_name: userForm.full_name,
          is_active: true,
          created_by: session?.userId,
        }])
        .select()
        .single();

      if (userError) throw userError;

      if (userForm.company_id && userForm.role !== "patient") {
        const { error: relationError } = await supabase
          .from("company_users")
          .insert([{
            user_id: userData.id,
            company_id: userForm.company_id,
            role: userForm.role,
          }]);

        if (relationError) throw relationError;
      }

      const company = companies.find(c => c.id === userForm.company_id);

      setGeneratedCredentials({
        email: userForm.email,
        password: password,
        companyName: company?.name,
        companySlug: company?.slug,
      });

      toast({ title: "✅ Usuario creado exitosamente" });
      setUserDialogOpen(false);
      setCredentialsDialogOpen(true);
      setUserForm({
        email: "",
        full_name: "",
        password: "",
        role: "patient",
        company_id: "",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al crear usuario",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `✅ ${label} copiado al portapapeles` });
  };

  const getPlanBadge = (planId: string) => {
    const badges = {
      free: { icon: Crown, color: "bg-gray-500", label: "Gratuito" },
      pro: { icon: Zap, color: "bg-blue-500", label: "Pro" },
      enterprise: { icon: Rocket, color: "bg-purple-500", label: "Enterprise" }
    };
    const badge = badges[planId as keyof typeof badges] || badges.free;
    const Icon = badge.icon;
    return (
      <Badge className={`${badge.color} text-white border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      trial: { color: "bg-yellow-500", label: "Prueba" },
      active: { color: "bg-green-500", label: "Activo" },
      suspended: { color: "bg-red-500", label: "Suspendido" },
      cancelled: { color: "bg-gray-500", label: "Cancelado" }
    };
    const badge = badges[status as keyof typeof badges] || badges.trial;
    return <Badge className={`${badge.color} text-white border-0`}>{badge.label}</Badge>;
  };

  if (!mounted || loading || !session) {
    return null;
  }

  const activeTabId = (tab as string) || "dashboard";

  return (
    <SuperAdminLayout activeTab={activeTabId}>
      <SEO title="Panel SuperAdmin - PodoAgenda Pro" />

      {/* Credentials Dialog */}
      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-500" />
              ¡Credenciales Generadas!
            </DialogTitle>
            <DialogDescription>
              Guarda estas credenciales. No se mostrarán nuevamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            {generatedCredentials?.companyName && (
              <div>
                <Label className="text-sm font-semibold text-gray-700">Empresa</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={generatedCredentials.companyName} readOnly className="bg-white" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generatedCredentials.companyName || "", "Nombre de empresa")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {generatedCredentials?.companySlug && (
              <div>
                <Label className="text-sm font-semibold text-gray-700">URL de la Empresa</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={`https://podoagenda.com/${generatedCredentials.companySlug}`} readOnly className="bg-white" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(`https://podoagenda.com/${generatedCredentials.companySlug}`, "URL")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-gray-700">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={generatedCredentials?.email || ""} readOnly className="bg-white" />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(generatedCredentials?.email || "", "Email")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Contraseña</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={generatedCredentials?.password || ""} 
                  type={showPassword ? "text" : "password"}
                  readOnly 
                  className="bg-white font-mono"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(generatedCredentials?.password || "", "Contraseña")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCredentialsDialogOpen(false)} className="w-full">
              Entendido, he guardado las credenciales
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard Tab */}
      {activeTabId === "dashboard" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Global</h1>
            <p className="text-gray-600">Vista general del sistema</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Total</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Empresas</p>
              <p className="text-4xl font-bold">{stats.totalCompanies}</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.activeCompanies} activas</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Total</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Usuarios</p>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>Sistema global</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Mensual</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Ingresos MRR</p>
              <p className="text-4xl font-bold">${stats.monthlyRevenue}</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>Recurrente</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Estado</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Sistema</p>
              <p className="text-4xl font-bold">98%</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <Check className="w-4 h-4" />
                <span>Operativo</span>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Empresas Recientes</h2>
            <div className="space-y-4">
              {companies.slice(0, 5).map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${(company.metadata as any)?.primary_color || '#2563EB'}, ${(company.metadata as any)?.secondary_color || '#8B5CF6'})` }}
                    >
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-600">{company.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPlanBadge(company.plan)}
                    {getStatusBadge(company.plan_status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Empresas Tab */}
      {activeTabId === "empresas" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Empresas</h1>
              <p className="text-gray-600">Administra todas las clínicas del sistema</p>
            </div>
            <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-5 h-5" />
                  Nueva Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? "Editar Empresa" : "Nueva Empresa"}</DialogTitle>
                  <DialogDescription>
                    Complete todos los datos de la empresa y su administrador
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  {/* Datos de la Empresa */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Datos de la Empresa
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={companyForm.name}
                          onChange={(e) => {
                            setCompanyForm({ ...companyForm, name: e.target.value });
                            if (!editingCompany) {
                              setCompanyForm({ ...companyForm, name: e.target.value, slug: generateSlug(e.target.value) });
                            }
                          }}
                          placeholder="Clínica Podológica"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">URL/Slug *</Label>
                        <Input
                          id="slug"
                          value={companyForm.slug}
                          onChange={(e) => setCompanyForm({ ...companyForm, slug: e.target.value })}
                          placeholder="clinica-podologica"
                        />
                        <p className="text-xs text-gray-500 mt-1">podoagenda.com/{companyForm.slug || "slug"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                          placeholder="contacto@clinica.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                        placeholder="Av. Principal 123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan">Plan *</Label>
                      <Select value={companyForm.plan} onValueChange={(value: any) => setCompanyForm({ ...companyForm, plan: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} - ${plan.price_monthly}/mes
                              {plan.max_users > 0 && ` (Hasta ${plan.max_users} usuarios, ${plan.max_podiatrists} podólogos)`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Personalización */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-600" />
                      Personalización
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary_color">Color Primario</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primary_color"
                            type="color"
                            value={companyForm.primary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, primary_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={companyForm.primary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, primary_color: e.target.value })}
                            placeholder="#2563EB"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondary_color">Color Secundario</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondary_color"
                            type="color"
                            value={companyForm.secondary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, secondary_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={companyForm.secondary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, secondary_color: e.target.value })}
                            placeholder="#8B5CF6"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="logo_url">Logo URL (opcional)</Label>
                      <Input
                        id="logo_url"
                        value={companyForm.logo_url}
                        onChange={(e) => setCompanyForm({ ...companyForm, logo_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Administrador (solo al crear) */}
                  {!editingCompany && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Administrador de la Empresa
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="admin_name">Nombre Completo *</Label>
                          <Input
                            id="admin_name"
                            value={companyForm.admin_name}
                            onChange={(e) => setCompanyForm({ ...companyForm, admin_name: e.target.value })}
                            placeholder="Juan Pérez"
                          />
                        </div>
                        <div>
                          <Label htmlFor="admin_email">Email *</Label>
                          <Input
                            id="admin_email"
                            type="email"
                            value={companyForm.admin_email}
                            onChange={(e) => setCompanyForm({ ...companyForm, admin_email: e.target.value })}
                            placeholder="admin@clinica.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="admin_password">Contraseña (dejar vacío para generar automática)</Label>
                        <Input
                          id="admin_password"
                          type="text"
                          value={companyForm.admin_password}
                          onChange={(e) => setCompanyForm({ ...companyForm, admin_password: e.target.value })}
                          placeholder="Se generará automáticamente"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setCompanyDialogOpen(false);
                    setEditingCompany(null);
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={editingCompany ? handleUpdateCompany : handleCreateCompany}>
                    {editingCompany ? "Guardar Cambios" : "Crear Empresa"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Límites</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${(company.metadata as any)?.primary_color || '#2563EB'}, ${(company.metadata as any)?.secondary_color || '#8B5CF6'})` }}
                        >
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{company.name}</p>
                          <p className="text-sm text-gray-600">{company.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(company.plan)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(company.plan_status)}
                        {company.plan_status === 'trial' && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>Termina en {Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>👥 {company.max_users > 0 ? `${company.max_users} usuarios` : '∞'}</div>
                        <div>👨‍⚕️ {company.max_podiatrists > 0 ? `${company.max_podiatrists} podólogos` : '∞'}</div>
                        <div>📅 {company.max_monthly_appointments > 0 ? `${company.max_monthly_appointments} citas/mes` : '∞'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">/{company.slug}</code>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(`https://podoagenda.com/${company.slug}`, "URL")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCompany(company);
                            setCompanyForm({
                              name: company.name || "",
                              slug: company.slug || "",
                              email: company.email || "",
                              phone: company.phone || "",
                              address: company.address || "",
                              logo_url: company.logo_url || "",
                              primary_color: (company.metadata as any)?.primary_color || "#2563EB",
                              secondary_color: (company.metadata as any)?.secondary_color || "#8B5CF6",
                              plan: company.plan || "free",
                              admin_email: "",
                              admin_name: "",
                              admin_password: "",
                            });
                            setCompanyDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={company.plan_status === 'active' ? 'text-orange-600' : 'text-green-600'}
                          onClick={() => handleToggleCompanyStatus(company.id, company.plan_status)}
                        >
                          {company.plan_status === 'active' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Usuarios Tab */}
      {activeTabId === "usuarios" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra todos los usuarios del sistema</p>
            </div>
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-5 h-5" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Complete los datos del usuario
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="user_email">Email *</Label>
                    <Input
                      id="user_email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_name">Nombre Completo *</Label>
                    <Input
                      id="user_name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_password">Contraseña (dejar vacío para generar automática)</Label>
                    <Input
                      id="user_password"
                      type="text"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Se generará automáticamente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_role">Rol *</Label>
                    <Select value={userForm.role} onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Paciente</SelectItem>
                        <SelectItem value="employee">Podólogo</SelectItem>
                        <SelectItem value="owner">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {userForm.role !== "patient" && (
                    <div>
                      <Label htmlFor="user_company">Empresa *</Label>
                      <Select value={userForm.company_id} onValueChange={(value) => setUserForm({ ...userForm, company_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Crear Usuario
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium">{user.full_name || "Sin nombre"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_superadmin ? "default" : "secondary"}>
                        {user.is_superadmin ? "SuperAdmin" : (user.company_users?.[0]?.role || "Paciente")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.company_users?.[0]?.company?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"} className={user.is_active ? "bg-green-500" : "bg-gray-500"}>
                        {user.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Personalización Tab */}
      {activeTabId === "personalizacion" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalización del Sistema</h1>
            <p className="text-gray-600">Configura colores, temas y logos para cada empresa</p>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Palette className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">Temas por Empresa</h3>
                <p className="text-sm text-gray-600">Cada empresa puede tener su propia identidad visual</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="p-6 border-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${(company.metadata as any)?.primary_color || '#2563EB'}, ${(company.metadata as any)?.secondary_color || '#8B5CF6'})` }}
                    >
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{company.name}</h4>
                      <p className="text-sm text-gray-600">{company.slug}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: (company.metadata as any)?.primary_color || '#2563EB' }} />
                      <div>
                        <p className="text-sm font-medium">Color Primario</p>
                        <p className="text-xs text-gray-600">{(company.metadata as any)?.primary_color || '#2563EB'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: (company.metadata as any)?.secondary_color || '#8B5CF6' }} />
                      <div>
                        <p className="text-sm font-medium">Color Secundario</p>
                        <p className="text-xs text-gray-600">{(company.metadata as any)?.secondary_color || '#8B5CF6'}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      setEditingCompany(company);
                      setCompanyForm({
                        name: company.name || "",
                        slug: company.slug || "",
                        email: company.email || "",
                        phone: company.phone || "",
                        address: company.address || "",
                        logo_url: company.logo_url || "",
                        primary_color: (company.metadata as any)?.primary_color || "#2563EB",
                        secondary_color: (company.metadata as any)?.secondary_color || "#8B5CF6",
                        plan: company.plan || "free",
                        admin_email: "",
                        admin_name: "",
                        admin_password: "",
                      });
                      setCompanyDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Tema
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Configuración Tab */}
      {activeTabId === "configuracion" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración Global</h1>
            <p className="text-gray-600">Ajustes generales del sistema</p>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Información del Sistema</h3>
                <p className="text-sm text-gray-600">Versión y configuraciones globales</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Detalles del Sistema</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Versión</p>
                    <p className="text-lg font-semibold">PodoAgenda Pro v1.0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Base de Datos</p>
                    <p className="text-lg font-semibold">PostgreSQL (Supabase)</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Empresas Totales</p>
                    <p className="text-lg font-semibold">{stats.totalCompanies}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Usuarios Totales</p>
                    <p className="text-lg font-semibold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Planes Disponibles</h4>
                <div className="grid grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="p-6 border-2">
                      <div className="text-center mb-4">
                        {getPlanBadge(plan.id)}
                        <p className="text-3xl font-bold mt-2">${plan.price_monthly}</p>
                        <p className="text-sm text-gray-600">por mes</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{plan.max_users > 0 ? `${plan.max_users} usuarios` : 'Usuarios ilimitados'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{plan.max_podiatrists > 0 ? `${plan.max_podiatrists} podólogos` : 'Podólogos ilimitados'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{plan.max_monthly_appointments > 0 ? `${plan.max_monthly_appointments} citas/mes` : 'Citas ilimitadas'}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </SuperAdminLayout>
  );
}