import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/auth";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Shield, UserCog, Stethoscope, User } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"superadmin" | "staff" | null>(null);

  useEffect(() => {
    // Si ya está autenticado, redirigir
    if (authService.isAuthenticated()) {
      redirectToDashboard();
    }
  }, []);

  const redirectToDashboard = () => {
    const session = authService.getSession();
    if (!session) return;

    if (session.isSuperadmin) {
      window.location.href = "/superadmin";
    } else if (session.role === "owner") {
      window.location.href = "/admin";
    } else if (session.role === "employee") {
      window.location.href = "/podologo";
    } else {
      window.location.href = "/cliente";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Por favor ingresa email y contraseña",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.success && result.session) {
        toast({
          title: "✅ Acceso Exitoso",
          description: `Bienvenido, ${result.session.fullName}`,
        });

        // Pequeño delay para que se vea el toast
        setTimeout(() => {
          redirectToDashboard();
        }, 500);
      } else {
        toast({
          title: "Error de Acceso",
          description: result.error || "Credenciales incorrectas",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error inesperado",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <SEO title="Acceso al Sistema - PodoAgenda Pro" />

      <Card className="w-full max-w-5xl p-0 overflow-hidden shadow-2xl border-0">
        <div className="grid md:grid-cols-2">
          {/* Panel Izquierdo - Selector de Tipo */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-6">PodoAgenda Pro</h1>
            <p className="text-blue-100 mb-8">Sistema de gestión podológica integral</p>

            <div className="space-y-4">
              <div
                onClick={() => setSelectedRole("superadmin")}
                className={`p-6 rounded-2xl cursor-pointer transition-all ${
                  selectedRole === "superadmin"
                    ? "bg-white/20 backdrop-blur-sm border-2 border-white scale-105"
                    : "bg-white/10 backdrop-blur-sm border-2 border-transparent hover:bg-white/15"
                }`}
              >
                <Shield className="w-10 h-10 mb-3" />
                <h3 className="text-xl font-semibold mb-2">SuperAdmin</h3>
                <p className="text-sm text-blue-100">Administración global del sistema</p>
              </div>

              <div
                onClick={() => setSelectedRole("staff")}
                className={`p-6 rounded-2xl cursor-pointer transition-all ${
                  selectedRole === "staff"
                    ? "bg-white/20 backdrop-blur-sm border-2 border-white scale-105"
                    : "bg-white/10 backdrop-blur-sm border-2 border-transparent hover:bg-white/15"
                }`}
              >
                <div className="flex gap-3 mb-3">
                  <UserCog className="w-8 h-8" />
                  <Stethoscope className="w-8 h-8" />
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personal / Paciente</h3>
                <p className="text-sm text-blue-100">Acceso a clínicas y portal paciente</p>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Formulario */}
          <div className="p-12 bg-white flex flex-col justify-center">
            {selectedRole ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedRole === "superadmin" ? "Acceso SuperAdmin" : "Acceso al Sistema"}
                  </h2>
                  <p className="text-gray-600">
                    {selectedRole === "superadmin"
                      ? "Ingresa tus credenciales de administrador global"
                      : "Ingresa tus credenciales para continuar"}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 mb-2 block">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="pl-12 h-14 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-700 mb-2 block">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-12 h-14 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    {loading ? "Verificando..." : "Acceder al Sistema"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedRole(null);
                      setEmail("");
                      setPassword("");
                    }}
                    className="w-full"
                  >
                    ← Cambiar tipo de acceso
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Selecciona tu tipo de acceso</h2>
                <p className="text-gray-600">Elige una opción en el panel izquierdo para continuar</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}