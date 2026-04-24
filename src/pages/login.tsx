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
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
    // Redirect if already logged in
    const session = authService.getSession();
    if (session) {
      router.replace(authService.getDashboardRoute());
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos incompletos",
        description: "Por favor ingresa email y contraseña",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Intentando login con:", formData.email);
      const result = await authService.login(formData.email, formData.password);

      if (result.success && result.session) {
        console.log("✅ Login exitoso:", result.session);
        
        toast({
          title: "✅ Acceso Exitoso",
          description: `Bienvenido, ${result.session.fullName}`,
        });

        // Obtener ruta según rol
        const dashboardRoute = authService.getDashboardRoute();
        console.log("🔄 Redirigiendo a:", dashboardRoute);

        // Redirigir usando replace para evitar loops
        setTimeout(() => {
          router.replace(dashboardRoute);
        }, 500);
      } else {
        console.error("❌ Login fallido:", result.error);
        toast({
          title: "Error de Acceso",
          description: result.error || "Credenciales incorrectas",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error: any) {
      console.error("💥 Error en handleLogin:", error);
      toast({
        title: "Error",
        description: error.message || "Error inesperado",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // No renderizar hasta que el componente esté montado (evita hidration mismatch)
  if (!mounted) {
    return null;
  }

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

            <div className="mt-8 p-4 bg-white/10 rounded-xl">
              <p className="text-sm text-blue-100 mb-2">👤 Usuarios Demo:</p>
              <div className="space-y-1 text-xs text-blue-200">
                <p>• superadmin@demo.com</p>
                <p>• admin@demo.com</p>
                <p>• podologo@demo.com</p>
                <p>• paciente@demo.com</p>
                <p className="mt-2">🔑 Password: <span className="font-mono">Admin123!</span></p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 mb-2 block">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                      setFormData({ email: "", password: "" });
                    }}
                    className="w-full"
                    disabled={loading}
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