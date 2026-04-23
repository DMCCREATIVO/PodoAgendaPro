import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { superadminService } from "@/services/superadminService";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Estados para datos de BD
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized, activeTab]);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session || error) {
        router.replace("/superadmin/auth");
        return;
      }

      const metadata = session.user.user_metadata || {};
      const isSuperadmin = metadata.is_superadmin === true || metadata.is_superadmin === "true";
      
      if (!isSuperadmin) {
        router.replace("/superadmin/auth");
        return;
      }
      
      setAuthorized(true);
      setLoading(false);

    } catch (err) {
      console.error("Error en verificación:", err);
      router.replace("/superadmin/auth");
    }
  };

  const loadData = async () => {
    try {
      if (activeTab === "dashboard") {
        const systemStats = await superadminService.getSystemStats();
        setStats(systemStats);
        
        const allCompanies = await superadminService.getAllCompanies();
        setCompanies(allCompanies.slice(0, 5)); // Últimas 5
      } else if (activeTab === "empresas") {
        const allCompanies = await superadminService.getAllCompanies();
        setCompanies(allCompanies);
      } else if (activeTab === "usuarios") {
        const allUsers = await superadminService.getAllUsers();
        setUsers(allUsers);
      } else if (activeTab === "auditoria") {
        const logs = await superadminService.getAuditLog(50);
        setAuditLog(logs);
      }
    } catch (error: any) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSuspendCompany = async (companyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      await superadminService.updateCompanyStatus(
        companyId, 
        newStatus as any, 
        newStatus === "suspended" ? "Suspendida manualmente por SuperAdmin" : undefined
      );
      
      toast({
        title: "✅ Estado actualizado",
        description: `Empresa ${newStatus === "active" ? "activada" : "suspendida"}`,
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMakeSuperAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await superadminService.removeSuperAdmin(userId);
        toast({ title: "✅ SuperAdmin removido" });
      } else {
        await superadminService.makeSuperAdmin(userId);
        toast({ title: "✅ SuperAdmin otorgado" });
      }
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-background to-purple-600/10 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-muted-foreground">Verificando acceso SuperAdmin...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminLayout activeTab={activeTab}>
      <SEO title="Panel SuperAdmin - PodoAgenda Pro" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Panel de Administración Global
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión completa del sistema PodoAgenda Pro
            </p>
          </div>
          <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-2 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            SuperAdmin
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
            {stats && (
              <>
                {/* KPIs */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Empresas</p>
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_companies}</p>
                    <p className="text-xs text-green-600 mt-2">
                      {stats.active_companies} activas
                    </p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_users}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      En todas las empresas
                    </p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Citas</p>
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_appointments}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sistema completo
                    </p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Pacientes</p>
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_clients}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Base de datos activa
                    </p>
                  </Card>
                </div>

                {/* Empresas Recientes */}
                <Card>
                  <div className="p-6 border-b border-border">
                    <h3 className="font-semibold text-lg">Empresas Recientes</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {companies.map((empresa) => (
                        <div key={empresa.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                              {empresa.name?.[0] || "?"}
                            </div>
                            <div>
                              <p className="font-medium">{empresa.name}</p>
                              <p className="text-sm text-muted-foreground">/{empresa.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge 
                              className={
                                empresa.status === "active" 
                                  ? "bg-green-500/10 text-green-700 border-green-500/20"
                                  : empresa.status === "trial"
                                  ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                  : "bg-red-500/10 text-red-700 border-red-500/20"
                              }
                            >
                              {empresa.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* EMPRESAS TAB */}
          <TabsContent value="empresas" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Empresa
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>/{company.slug}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            company.status === "active"
                              ? "bg-green-500/10 text-green-700"
                              : company.status === "trial"
                              ? "bg-blue-500/10 text-blue-700"
                              : "bg-red-500/10 text-red-700"
                          }
                        >
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspendCompany(company.id, company.status)}
                          >
                            {company.status === "active" ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Suspender
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Activar
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* USUARIOS TAB */}
          <TabsContent value="usuarios" className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>SuperAdmin</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "Sin nombre"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.is_superadmin ? (
                          <Badge className="bg-purple-500/10 text-purple-700">
                            <Shield className="w-3 h-3 mr-1" />
                            Sí
                          </Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMakeSuperAdmin(user.id, user.is_superadmin)}
                        >
                          {user.is_superadmin ? "Quitar SuperAdmin" : "Hacer SuperAdmin"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* AUDITORIA TAB */}
          <TabsContent value="auditoria" className="space-y-4">
            <Card>
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg">Registro de Acciones del Sistema</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Empresa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action_type}</Badge>
                      </TableCell>
                      <TableCell>{log.users?.email || "Sistema"}</TableCell>
                      <TableCell>{log.companies?.name || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                  {auditLog.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay registros de auditoría
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* CONFIG TAB */}
          <TabsContent value="config">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Configuración del Sistema</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajustes globales que afectan a todas las empresas del SaaS
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Mantenimiento Programado</p>
                      <p className="text-sm text-muted-foreground">Sistema en modo mantenimiento</p>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Límites Globales</p>
                      <p className="text-sm text-muted-foreground">Establecer límites por plan</p>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}