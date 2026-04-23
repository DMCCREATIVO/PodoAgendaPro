import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Stethoscope, Mail, Lock, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("admin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.loginSimple(email, password);

      if (!result.success || !result.user) {
        setError(result.error || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      toast({
        title: "✅ Acceso Concedido",
        description: `Bienvenido, ${result.user.full_name || 'Usuario'}`,
      });

      // Redirigir según el rol seleccionado en el tab (o podríamos buscar su rol en company_users)
      // Para mantenerlo súper simple y funcional ahora:
      if (email === 'admin@demo.com' || activeTab === 'admin') {
        router.push("/admin");
      } else if (email === 'podologo@demo.com' || activeTab === 'podiatrist') {
        router.push("/podologo");
      } else {
        router.push("/cliente");
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-slate-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">PodoAgenda Pro</h1>
          <p className="text-slate-500">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin" className="text-xs">
              <Shield className="w-4 h-4 mr-1" /> Admin
            </TabsTrigger>
            <TabsTrigger value="podiatrist" className="text-xs">
              <Stethoscope className="w-4 h-4 mr-1" /> Podólogo
            </TabsTrigger>
            <TabsTrigger value="patient" className="text-xs">
              <User className="w-4 h-4 mr-1" /> Paciente
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Acceder"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            ¿Eres SuperAdmin?{" "}
            <Link href="/superadmin/auth" className="text-blue-600 hover:underline">
              Acceder aquí
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}