import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { superadminService } from "@/services/superadminService";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [activeTab, loading]);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user || user.email !== "superadmin@demo.com") {
        router.replace("/superadmin/auth");
        return;
      }
      
      setLoading(false);
    } catch (err) {
      router.replace("/superadmin/auth");
    }
  };

  const loadData = async () => {
    try {
      if (activeTab === "dashboard") {
        const [systemStats, allCompanies] = await Promise.all([
          superadminService.getSystemStats(),
          superadminService.getAllCompanies()
        ]);
        setStats(systemStats);
        setCompanies(allCompanies.slice(0, 5));
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
        newStatus === "suspended" ? "Suspendida por SuperAdmin" : undefined
      );
      
      toast({
        title: "Estado actualizado",
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
        toast({ title: "SuperAdmin removido" });
      } else {
        await superadminService.makeSuperAdmin(userId);
        toast({ title: "SuperAdmin otorgado" });
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

  const handleLogout = async () => {
    await authService.logout();
    router.push("/superadmin/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-background to-purple-600/10 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Control Global</h1>
            <p className="text-muted-foreground">Administración del sistema PodoAgenda Pro</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Empresas</p>
                    <p className="text-3xl font-bold">{stats?.totalCompanies || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Usuarios</p>
                    <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Citas Totales</p>
                    <p className="text-3xl font-bold">{stats?.totalAppointments || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pacientes</p>
                    <p className="text-3xl font-bold">{stats?.totalClients || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Empresas Recientes</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Usuarios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-muted-foreground">{company.slug}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.plan_id || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        {company.status === 'active' ? (
                          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Suspendido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{company.user_count || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="empresas" className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-muted-foreground">{company.slug}</TableCell>
                      <TableCell>
                        {company.status === 'active' ? (
                          <Badge className="bg-green-500/10 text-green-700">Activo</Badge>
                        ) : (
                          <Badge variant="destructive">Suspendido</Badge>
                        )}
                      </TableCell>
                      <TableCell>{company.user_count || 0}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={company.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => handleSuspendCompany(company.id, company.status)}
                        >
                          {company.status === 'active' ? 'Suspender' : 'Activar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>SuperAdmin</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || 'Sin nombre'}</TableCell>
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
                        {user.email !== 'superadmin@demo.com' && (
                          <Button
                            size="sm"
                            variant={user.is_superadmin ? 'destructive' : 'default'}
                            onClick={() => handleMakeSuperAdmin(user.id, user.is_superadmin)}
                          >
                            {user.is_superadmin ? 'Quitar SuperAdmin' : 'Hacer SuperAdmin'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{log.user_email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.details || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}