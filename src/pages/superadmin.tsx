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
  AlertCircle,
} from "lucide-react";
import { SEO } from "@/components/SEO";
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
    if (loading === false) {
      loadData();
    }
  }, [activeTab, loading]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace("/superadmin/auth");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("is_superadmin")
        .eq("id", session.user.id)
        .single();
      
      if (!userData?.is_superadmin) {
        router.replace("/superadmin/auth");
        return;
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error verificando auth:", err);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Panel de Administración Global
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión completa del sistema PodoAgenda Pro
            </p>
          </div>
          <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-2">
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

          <TabsContent value="dashboard" className="space-y-6">
            {stats && (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Empresas</p>
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_companies}</p>
                    <p className="text-xs text-green-600 mt-2">{stats.active_companies} activas</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_users}</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Citas</p>
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_appointments}</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Pacientes</p>
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold">{stats.total_clients}</p>
                  </Card>
                </div>

                <Card>
                  <div className="p-6 border-b">
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
                          <Badge className={
                            empresa.status === "active" 
                              ? "bg-green-500/10 text-green-700"
                              : "bg-red-500/10 text-red-700"
                          }>
                            {empresa.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

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
                        <Badge className={
                          company.status === "active"
                            ? "bg-green-500/10 text-green-700"
                            : "bg-red-500/10 text-red-700"
                        }>
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

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
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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

          <TabsContent value="auditoria" className="space-y-4">
            <Card>
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg">Registro de Acciones</h3>
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
                      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action_type}</Badge>
                      </TableCell>
                      <TableCell>{log.users?.email || "Sistema"}</TableCell>
                      <TableCell>{log.companies?.name || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Configuración Global</h3>
              <p className="text-muted-foreground">Ajustes que afectan a todo el sistema</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}