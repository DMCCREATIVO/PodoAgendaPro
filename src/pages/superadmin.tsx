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
} from "lucide-react";

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
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeCompanies: 0,
    monthlyRevenue: 0,
  });

  // Estados para modales
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    primary_color: "#2563EB",
    secondary_color: "#8B5CF6",
    logo_url: "",
  });

  const [userForm, setUserForm] = useState({
    email: "",
    full_name: "",
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

      // Calcular estadísticas
      setStats({
        totalCompanies: companiesData?.length || 0,
        totalUsers: usersData?.length || 0,
        activeCompanies: companiesData?.filter((c: any) => c.is_active).length || 0,
        monthlyRevenue: 0, // TODO: calcular desde payments
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCreateCompany = async () => {
    try {
      const companyData = {
        name: companyForm.name,
        slug: companyForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000),
        email: companyForm.email,
        phone: companyForm.phone,
        address: companyForm.address,
        logo_url: companyForm.logo_url,
        metadata: {
          primary_color: companyForm.primary_color,
          secondary_color: companyForm.secondary_color
        }
      };

      const { error } = await supabase
        .from("companies")
        .insert([companyData]);

      if (error) throw error;

      toast({ title: "✅ Empresa creada exitosamente" });
      setCompanyDialogOpen(false);
      setCompanyForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        primary_color: "#2563EB",
        secondary_color: "#8B5CF6",
        logo_url: "",
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
      const companyData = {
        name: companyForm.name,
        email: companyForm.email,
        phone: companyForm.phone,
        address: companyForm.address,
        logo_url: companyForm.logo_url,
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

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta empresa?")) return;

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
      // Helper for generating UUID if not available
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { 
            const r = Math.random() * 16 | 0; 
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); 
          });

      // Crear usuario
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([{
          id: newId,
          email: userForm.email,
          full_name: userForm.full_name,
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Si tiene empresa, crear relación
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

      toast({ title: "✅ Usuario creado exitosamente" });
      setUserDialogOpen(false);
      setUserForm({
        email: "",
        full_name: "",
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

  if (!mounted || loading || !session) {
    return null;
  }

  const activeTabId = (tab as string) || "dashboard";

  return (
    <SuperAdminLayout activeTab={activeTabId}>
      <SEO title="Panel SuperAdmin - PodoAgenda Pro" />

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
                <span>+12 este mes</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Mensual</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Ingresos</p>
              <p className="text-4xl font-bold">${stats.monthlyRevenue}</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>+8% vs mes anterior</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">Hoy</Badge>
              </div>
              <p className="text-sm opacity-80 mb-1">Actividad</p>
              <p className="text-4xl font-bold">98%</p>
              <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>Sistema estable</span>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              {companies.slice(0, 5).map((company) => (
                <div key={company.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-600">{company.email}</p>
                    </div>
                  </div>
                  <Badge variant={company.is_active ? "default" : "secondary"}>
                    {company.is_active ? "Activa" : "Inactiva"}
                  </Badge>
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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? "Editar Empresa" : "Nueva Empresa"}</DialogTitle>
                  <DialogDescription>
                    Complete los datos de la empresa
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        placeholder="Clínica Podológica"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                        placeholder="contacto@clinica.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={companyForm.phone}
                        onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                        placeholder="+56 9 1234 5678"
                      />
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
                  </div>
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
                  <TableHead>Contacto</TableHead>
                  <TableHead>Colores</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ background: `linear-gradient(135deg, ${(company.metadata as any)?.primary_color || '#2563EB'}, ${(company.metadata as any)?.secondary_color || '#8B5CF6'})` }}
                        >
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{company.name}</p>
                          <p className="text-sm text-gray-600">{company.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{company.email}</p>
                      <p className="text-sm text-gray-600">{company.phone}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: (company.metadata as any)?.primary_color || '#2563EB' }} />
                        <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: (company.metadata as any)?.secondary_color || '#8B5CF6' }} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.is_active ? "default" : "secondary"}>
                        {company.is_active ? "Activa" : "Inactiva"}
                      </Badge>
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
                              email: company.email || "",
                              phone: company.phone || "",
                              address: company.address || "",
                              logo_url: company.logo_url || "",
                              primary_color: (company.metadata as any)?.primary_color || "#2563EB",
                              secondary_color: (company.metadata as any)?.secondary_color || "#8B5CF6",
                            });
                            setCompanyDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
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
                    <Label htmlFor="user_email">Email</Label>
                    <Input
                      id="user_email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="usuario@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_name">Nombre Completo</Label>
                    <Input
                      id="user_name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_role">Rol</Label>
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
                      <Label htmlFor="user_company">Empresa</Label>
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
                      <Badge variant="default" className="bg-green-500">
                        Activo
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <p className="text-sm text-gray-600">Identidad personalizada</p>
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
                        email: company.email || "",
                        phone: company.phone || "",
                        address: company.address || "",
                        logo_url: company.logo_url || "",
                        primary_color: (company.metadata as any)?.primary_color || "#2563EB",
                        secondary_color: (company.metadata as any)?.secondary_color || "#8B5CF6",
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
                <h3 className="text-lg font-semibold">Configuración del Sistema</h3>
                <p className="text-sm text-gray-600">Parámetros generales y configuraciones globales</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Información del Sistema</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Versión</p>
                    <p className="text-lg font-semibold">PodoAgenda Pro v1.0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Última actualización</p>
                    <p className="text-lg font-semibold">Hoy</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Configuración de Notificaciones</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">Notificaciones de Email</p>
                      <p className="text-sm text-gray-600">Enviar alertas por correo</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      <Check className="w-4 h-4" />
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium">Recordatorios de Citas</p>
                      <p className="text-sm text-gray-600">Enviar 24h antes</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      <Check className="w-4 h-4" />
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </SuperAdminLayout>
  );
}