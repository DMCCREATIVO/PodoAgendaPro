import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/services/auth";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  Mail,
  Footprints,
  ShieldCheck,
  Activity,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = authService.getSession();
    if (session) {
      router.replace(authService.getDashboardRoute(session));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Ingresa tu email y contraseña",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.success && result.session) {
        toast({
          title: `Bienvenido, ${result.session.fullName.split(" ")[0]}`,
          description: "Redirigiendo a tu panel...",
        });

        const route = authService.getDashboardRoute(result.session);
        setTimeout(() => router.replace(route), 400);
      } else {
        toast({
          title: "Error de acceso",
          description: result.error || "Credenciales incorrectas",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo conectar. Intenta de nuevo.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex">
      <SEO title="Iniciar Sesión - PodoAgenda Pro" />

      {/* Panel Izquierdo - Decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600">
        {/* Patron decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute top-40 left-40 w-96 h-96 rounded-full border border-white" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 right-20 w-40 h-40 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Footprints className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              PodoAgenda Pro
            </span>
          </Link>

          {/* Centro - Mensaje principal */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                Gestiona tu clínica
                <br />
                <span className="text-emerald-200">con excelencia</span>
              </h1>
              <p className="text-lg text-teal-100 max-w-md leading-relaxed">
                Plataforma integral para profesionales de la podología.
                Agenda, fichas clínicas, pagos y más en un solo lugar.
              </p>
            </div>

            {/* Caracteristicas */}
            <div className="space-y-4">
              {[
                { icon: Activity, text: "Fichas clínicas digitales completas" },
                { icon: ShieldCheck, text: "Datos protegidos con encriptación" },
                { icon: Footprints, text: "Diseñado para podólogos" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-teal-100">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-emerald-200" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie */}
          <p className="text-sm text-teal-200">
            &copy; {new Date().getFullYear()} PodoAgenda Pro. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Panel Derecho - Formulario */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PodoAgenda Pro</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Iniciar sesión
            </h2>
            <p className="text-gray-500">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@clinica.com"
                  className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}