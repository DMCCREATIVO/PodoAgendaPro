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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      // Verify is superadmin
      const isSuperadmin = data.user?.user_metadata?.is_superadmin === true;

      if (!isSuperadmin) {
        await supabase.auth.signOut();
        throw new Error("Acceso denegado. Solo SuperAdmins pueden acceder.");
      }

      toast({
        title: "Acceso concedido",
        description: "Bienvenido, SuperAdmin",
      });

      router.push("/superadmin");
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <SEO
        title="SuperAdmin Access - PODOS PRO"
        description="Panel de administración del sistema PODOS PRO"
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-sm border-purple-200 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              SuperAdmin Access
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de administración global PODOS PRO
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  Email SuperAdmin
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="superadmin@podospro.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="border-purple-200 focus:border-purple-600 focus:ring-purple-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className="border-purple-200 focus:border-purple-600 focus:ring-purple-600"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
            >
              {loading ? "Verificando..." : "Acceder al Sistema"}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-xs text-purple-900 text-center">
              <Shield className="w-3 h-3 inline mr-1" />
              Acceso restringido. Solo usuarios con permisos de SuperAdmin pueden acceder.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}