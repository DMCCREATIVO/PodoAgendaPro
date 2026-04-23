import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Mail } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function SuperAdminAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🔐 Intentando login SuperAdmin con:", loginForm.email);

      // Primero verificar si el usuario existe
      const { data: users, error: userCheckError } = await supabase
        .from("auth.users")
        .select("email, raw_user_meta_data")
        .eq("email", loginForm.email)
        .limit(1);

      console.log("👤 Usuario en BD:", users, userCheckError);

      // Intentar login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (authError) {
        console.error("❌ Error de login:", authError);
        
        // Si el usuario no existe y es el email de superadmin, créalo
        if (authError.message.includes("Invalid login credentials") && 
            loginForm.email === "superadmin@podoagenda.com") {
          
          console.log("🆕 Creando usuario SuperAdmin...");
          
          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: loginForm.email,
            password: loginForm.password,
            options: {
              data: {
                is_superadmin: true,
                full_name: "Super Administrator",
              },
              emailRedirectTo: `${window.location.origin}/superadmin`,
            },
          });

          if (signupError) {
            console.error("❌ Error al crear SuperAdmin:", signupError);
            throw signupError;
          }

          console.log("✅ SuperAdmin creado:", signupData);

          toast({
            title: "✅ SuperAdmin creado",
            description: "Iniciando sesión...",
          });

          // Esperar un momento y recargar
          setTimeout(() => {
            window.location.href = "/superadmin";
          }, 1000);
          return;
        }
        
        throw authError;
      }

      console.log("✅ Login exitoso:", authData);

      // Verificar metadata
      const isSuperadmin = authData.user?.user_metadata?.is_superadmin === true;
      console.log("👑 Es SuperAdmin?", isSuperadmin, authData.user?.user_metadata);

      if (!isSuperadmin) {
        console.error("❌ Usuario no es SuperAdmin");
        await supabase.auth.signOut();
        throw new Error("Acceso denegado. Solo SuperAdmins pueden acceder.");
      }

      toast({
        title: "✅ Acceso concedido",
        description: "Bienvenido, SuperAdmin",
      });

      console.log("🚀 Redirigiendo a /superadmin...");
      
      // Usar window.location para forzar recarga completa
      window.location.href = "/superadmin";

    } catch (error: any) {
      console.error("💥 Error completo:", error);
      toast({
        title: "❌ Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-background to-purple-600/10 flex items-center justify-center p-4">
      <SEO
        title="SuperAdmin Access - PodoAgenda Pro"
        description="Panel de administración del sistema PodoAgenda Pro"
      />

      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border-2 border-purple-500/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            SuperAdmin Access
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema de administración global PodoAgenda Pro
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email del SuperAdmin
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="superadmin@podoagenda.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="h-12 pl-10 rounded-xl border-purple-500/20 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="h-12 pl-10 rounded-xl border-purple-500/20 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verificando acceso...</span>
              </div>
            ) : (
              "Acceder al Sistema"
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <p>
              Área restringida. Solo usuarios autorizados con permisos de SuperAdmin pueden acceder.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}