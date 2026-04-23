import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Activity,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { superadminService } from "@/services/superadminService";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const activeTab = (router.query.tab as string) || "dashboard";

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [companyModal, setCompanyModal] = useState({ open: false, company: null as any });
  const [userModal, setUserModal] = useState({ open: false, user: null as any });

  // Check auth ONCE on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load data when authorized and tab changes
  useEffect(() => {
    if (authorized && !loading) {
      loadData();
    }
  }, [activeTab, authorized, loading]);

  const checkAuth = async () => {
    try {
      console.log("🛡️ Verificando acceso SuperAdmin...");
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log("❌ No hay sesión, redirigiendo a login");
        router.replace("/superadmin/auth");
        return;
      }

      console.log("✅ Sesión encontrada:", session.user.email);
      console.log("📝 Metadata:", session.user.user_metadata);

      // Check if user is superadmin (handle multiple formats)
      const isSuperadmin = 
        session.user.user_metadata?.is_superadmin === true || 
        session.user.user_metadata?.is_superadmin === "true" ||
        session.user.user_metadata?.is_superadmin === 1 ||
        session.user.user_metadata?.is_superadmin === "1";

      console.log("👑 Es SuperAdmin?", isSuperadmin);

      if (!isSuperadmin) {
        console.log("❌ No es SuperAdmin, redirigiendo");
        router.replace("/superadmin/auth");
        return;
      }

      console.log("✅ SuperAdmin verificado, mostrando panel");
      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error("💥 Error verificando auth:", error);
      router.replace("/superadmin/auth");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "dashboard") {
        const statsData = await superadminService.getSystemStats();
        setStats(statsData);
      } else if (activeTab === "empresas") {
        const companiesData = await superadminService.getAllCompanies();
        setCompanies(companiesData);
      } else if (activeTab === "usuarios") {
        const usersData = await superadminService.getAllUsers();
        setUsers(usersData);
      } else if (activeTab === "auditoria") {
        const logData = await superadminService.getAuditLog(100);
        setAuditLog(logData);
      } else if (activeTab === "configuracion") {
        const settingsData = await superadminService.getSystemSettings();
        setSystemSettings(settingsData);
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

  const handleSuspendCompany = async (companyId: string, reason: string) => {
    try {
      await superadminService.updateCompanyStatus(companyId, "suspended", reason);
      toast({ title: "Empresa suspendida" });
      loadData();
      setCompanyModal({ open: false, company: null });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleActivateCompany = async (companyId: string) => {
    try {
      await superadminService.updateCompanyStatus(companyId, "active");
      toast({ title: "Empresa activada" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMakeSuperAdmin = async (userId: string) => {
    if (!confirm("¿Estás seguro de otorgar permisos de SuperAdmin?")) return;
    
    try {
      await superadminService.makeSuperAdmin(userId);
      toast({ title: "Usuario promovido a SuperAdmin" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveSuperAdmin = async (userId: string) => {
    if (!confirm("¿Estás seguro de remover permisos de SuperAdmin?")) return;
    
    try {
      await superadminService.removeSuperAdmin(userId);
      toast({ title: "Permisos removidos" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <SuperAdminLayout activeTab={activeTab}>
      {/* Company Modal */}
      <Dialog open={companyModal.open} onOpenChange={(open) => setCompanyModal({ ...companyModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Empresa</DialogTitle>
            <DialogDescription>
              {companyModal.company?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {companyModal.company?.status === "active" ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleSuspendCompany(companyModal.company.id, "Suspendida por administrador")}
              >
                Suspender Empresa
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleActivateCompany(companyModal.company?.id)}
              >
                Activar Empresa
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Panel SuperAdmin</h1>
            <p className="text-muted-foreground">Vista general del sistema</p>
          </div>

          {stats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 soft-shadow border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Empresas</p>
                    <p className="font-heading font-bold text-2xl">{stats.total_companies}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 soft-shadow border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Empresas Activas</p>
                    <p className="font-heading font-bold text-2xl">{stats.active_companies}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 soft-shadow border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">En Trial</p>
                    <p className="font-heading font-bold text-2xl">{stats.trial_companies}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 soft-shadow border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Usuarios</p>
                    <p className="font-heading font-bold text-2xl">{stats.total_users}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 soft-shadow border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Citas</p>
                    <p className="font-heading font-bold text-2xl">{stats.total_appointments}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 soft-shadow border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pacientes</p>
                    <p className="font-heading font-bold text-2xl">{stats.total_clients}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Empresas Tab */}
      {activeTab === "empresas" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Gestión de Empresas</h1>
            <p className="text-muted-foreground">Todas las clínicas registradas en el sistema</p>
          </div>

          <Card className="p-6 soft-shadow border-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando empresas...</p>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay empresas registradas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
                          {company.plan_id || "Sin plan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full",
                            company.status === "active" && "bg-green-100 text-green-700 border-green-200",
                            company.status === "trial" && "bg-blue-100 text-blue-700 border-blue-200",
                            company.status === "suspended" && "bg-red-100 text-red-700 border-red-200"
                          )}
                        >
                          {company.status === "active" ? "Activa" :
                           company.status === "trial" ? "Trial" :
                           company.status === "suspended" ? "Suspendida" : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(company.created_at).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => setCompanyModal({ open: true, company })}
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Usuarios Tab */}
      {activeTab === "usuarios" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Todos los usuarios del sistema</p>
          </div>

          <Card className="p-6 soft-shadow border-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando usuarios...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay usuarios registrados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Registrado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <p className="font-semibold">{user.full_name || "Sin nombre"}</p>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.is_superadmin ? (
                          <Badge variant="outline" className="rounded-full bg-red-100 text-red-700 border-red-200">
                            <Shield className="w-3 h-3 mr-1" />
                            SuperAdmin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full">
                            Usuario
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('es-CL')}
                      </TableCell>
                      <TableCell>
                        {user.is_superadmin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-destructive"
                            onClick={() => handleRemoveSuperAdmin(user.id)}
                          >
                            Remover Admin
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => handleMakeSuperAdmin(user.id)}
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Hacer Admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* Auditoria Tab */}
      {activeTab === "auditoria" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Registro de Auditoría</h1>
            <p className="text-muted-foreground">Historial de acciones de SuperAdmin</p>
          </div>

          <Card className="p-6 soft-shadow border-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando registros...</p>
              </div>
            ) : auditLog.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay registros de auditoría</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLog.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{log.action_type}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Por: {log.users?.full_name || log.users?.email || "Usuario"}
                        </p>
                        {log.companies && (
                          <p className="text-sm text-muted-foreground">
                            Empresa: {log.companies.name}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('es-CL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Configuración Tab */}
      {activeTab === "configuracion" && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Configuración del Sistema</h2>
            <p className="text-muted-foreground">Ajustes globales de PodoAgenda Pro</p>
          </div>

          <Card className="p-6 soft-shadow border-0">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando configuración...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {systemSettings.map((setting) => (
                  <div key={setting.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{setting.key}</p>
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {setting.description}
                    </p>
                    <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg overflow-auto">
                      {JSON.stringify(setting.value, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </SuperAdminLayout>
  );
}