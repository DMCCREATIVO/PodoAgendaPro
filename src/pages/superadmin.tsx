import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";

export default function SuperAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        console.log("=== VERIFICACIÓN SUPERADMIN ===");
        
        // Obtener sesión
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("Sesión:", session ? "✅ Existe" : "❌ No existe");
        console.log("Error:", error);

        if (!isMounted) return;

        // Si no hay sesión → redirigir
        if (!session || error) {
          console.log("→ Redirigiendo a /superadmin/auth (no hay sesión)");
          router.replace("/superadmin/auth");
          return;
        }

        // Verificar flag is_superadmin
        const metadata = session.user.user_metadata || {};
        const isSuperadmin = metadata.is_superadmin === true || metadata.is_superadmin === "true";
        
        console.log("Metadata:", metadata);
        console.log("is_superadmin:", metadata.is_superadmin);
        console.log("Es SuperAdmin:", isSuperadmin);

        if (!isSuperadmin) {
          console.log("→ Redirigiendo a /superadmin/auth (no es superadmin)");
          router.replace("/superadmin/auth");
          return;
        }

        console.log("✅ ACCESO AUTORIZADO");
        console.log("==============================");
        
        if (isMounted) {
          setAuthorized(true);
          setLoading(false);
        }

      } catch (err) {
        console.error("Error en verificación:", err);
        if (isMounted) {
          router.replace("/superadmin/auth");
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

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
    return null; // Redirigiendo...
  }

  return (
    <SuperAdminLayout activeTab="dashboard">
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

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="empresas">Empresas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Empresas</p>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">12</p>
                <p className="text-xs text-green-600 mt-2">↑ 2 nuevas este mes</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">145</p>
                <p className="text-xs text-green-600 mt-2">↑ 8% vs mes anterior</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Ingresos MRR</p>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">$3,450</p>
                <p className="text-xs text-green-600 mt-2">↑ 12% crecimiento</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Empresas Activas</p>
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">11</p>
                <p className="text-xs text-amber-600 mt-2">1 suspendida</p>
              </Card>
            </div>

            {/* Empresas Recientes */}
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-lg">Empresas Recientes</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { name: "Centro PodoSalud", plan: "Professional", status: "active", users: 8 },
                    { name: "Clínica Pies Felices", plan: "Starter", status: "active", users: 3 },
                    { name: "PodoClinic Elite", plan: "Enterprise", status: "active", users: 15 },
                  ].map((empresa, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                          {empresa.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{empresa.name}</p>
                          <p className="text-sm text-muted-foreground">{empresa.users} usuarios</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{empresa.plan}</Badge>
                        <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                          Activa
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="empresas">
            <Card className="p-6">
              <p className="text-muted-foreground">Gestión de empresas del sistema</p>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios">
            <Card className="p-6">
              <p className="text-muted-foreground">Gestión de usuarios globales</p>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria">
            <Card className="p-6">
              <p className="text-muted-foreground">Logs y auditoría del sistema</p>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card className="p-6">
              <p className="text-muted-foreground">Configuración global del sistema</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
}