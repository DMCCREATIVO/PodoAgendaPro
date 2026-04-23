import { useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("superadmin@demo.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.loginSimple(email, password);

      if (!result.success) {
        setError(result.error || "Error en login");
        setLoading(false);
        return;
      }

      // Verificar que sea superadmin
      if (result.user?.email !== "superadmin@demo.com") {
        setError("Solo SuperAdmins pueden acceder a esta área");
        await authService.logout();
        setLoading(false);
        return;
      }

      toast({
        title: "✅ Acceso Concedido",
        description: "Bienvenido, SuperAdmin",
      });

      // Redirección dura
      setTimeout(() => {
        window.location.href = "/superadmin";
      }, 500);
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/10 via-background to-purple-600/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 backdrop-blur-sm bg-card/95 border-purple-200 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">
            SuperAdmin Access
          </h1>
          
          <p className="text-muted-foreground">
            Sistema de administración global<br/>
            PodoAgenda Pro
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email del SuperAdmin</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@demo.com"
                className="pl-10 h-12 border-purple-200 focus:border-purple-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 h-12 border-purple-200 focus:border-purple-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Acceder al Sistema"}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Área restringida. Solo usuarios autorizados con permisos de SuperAdmin.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}