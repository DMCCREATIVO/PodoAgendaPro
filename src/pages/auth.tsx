import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { 
  ArrowRight, Shield, Sparkles, Crown,
  Eye, EyeOff, ArrowLeft
} from "lucide-react";

export default function Auth() {
  const router = useRouter();
  const { toast } = useToast();
  const mode = (router.query.mode as string) || "login";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    company_name: "",
    phone: "",
    plan_id: "professional",
    accept_terms: false,
  });

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if superadmin
      if (user.user_metadata?.is_superadmin === true) {
        router.push("/superadmin");
        return;
      }

      // Check company membership and redirect accordingly
      const { data: companyUsers } = await supabase
        .from("company_users")
        .select("role, company_id, companies(slug)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (companyUsers) {
        const role = companyUsers.role;
        
        if (role === "owner" || role === "admin") {
          router.push("/admin");
        } else if (role === "podiatrist" || role === "staff") {
          router.push("/podologo");
        }
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await authService.login(loginForm.email, loginForm.password);

      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Iniciando sesión...",
      });

      // Check if superadmin
      if (user.user_metadata?.is_superadmin === true) {
        setTimeout(() => {
          router.push("/superadmin");
        }, 1000);
        return;
      }

      // Check company membership
      const { data: companyUsers } = await supabase
        .from("company_users")
        .select("role, company_id, companies(slug)")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (companyUsers) {
        const role = companyUsers.role;
        
        setTimeout(() => {
          if (role === "owner" || role === "admin") {
            router.push("/admin");
          } else if (role === "podiatrist" || role === "staff") {
            router.push("/podologo");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        // No company found
        toast({
          title: "Sin empresa asignada",
          description: "Contacta al administrador del sistema",
          variant: "destructive",
        });
        await authService.logout();
      }
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirm_password) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (!registerForm.accept_terms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        email: registerForm.email,
        password: registerForm.password,
        full_name: registerForm.full_name,
        company_name: registerForm.company_name,
        phone: registerForm.phone,
        plan_id: registerForm.plan_id,
      });

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Redirigiendo...",
      });

      setTimeout(() => {
        router.push("/onboarding");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PLANS = [
    {
      id: "starter",
      name: "Starter",
      price: "$29.990",
      period: "/mes",
      features: ["1 Podólogo", "100 Pacientes", "Agenda básica", "Soporte email"],
    },
    {
      id: "professional",
      name: "Professional",
      price: "$79.990",
      period: "/mes",
      popular: true,
      features: ["5 Podólogos", "Pacientes ilimitados", "Ficha completa", "Soporte prioritario", "Reportes avanzados"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Contactar",
      period: "",
      features: ["Podólogos ilimitados", "Multi-sucursal", "API personalizada", "Soporte 24/7", "Implementación dedicada"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {mode === "login" ? (
          /* LOGIN MODE - SuperAdmin and Company Owners */
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left - Login Form */}
            <Card className="p-8 soft-shadow border-0">
              <div className="mb-8">
                <Link href="/" className="flex items-center gap-3 group mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-xl">PODOS PRO</p>
                    <p className="text-xs text-muted-foreground">Sistema Podológico</p>
                  </div>
                </Link>

                <h1 className="font-heading font-bold text-3xl mb-2">Iniciar Sesión</h1>
                <p className="text-muted-foreground">
                  Acceso para SuperAdmin y Administradores de Empresa
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="mt-2 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="rounded-xl pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={loginForm.remember}
                      onCheckedChange={(checked) => setLoginForm({ ...loginForm, remember: !!checked })}
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">
                      Recordarme
                    </Label>
                  </div>

                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl shadow-lg shadow-primary/20 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    ¿No tienes una empresa registrada?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/auth?mode=register")}
                    className="rounded-xl"
                  >
                    Crear Nueva Empresa
                  </Button>
                </div>
              </form>
            </Card>

            {/* Right - Features */}
            <div className="space-y-6">
              <div className="mb-8">
                <Badge className="mb-4 rounded-full px-4 py-1">Acceso Seguro</Badge>
                <h2 className="font-heading font-bold text-4xl mb-4">
                  Bienvenido a PODOS PRO
                </h2>
                <p className="text-lg text-muted-foreground">
                  El sistema de gestión más completo para clínicas podológicas
                </p>
              </div>

              <div className="grid gap-4">
                <Card className="p-6 soft-shadow border-0 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Seguro y Confiable</h3>
                      <p className="text-sm text-muted-foreground">
                        Datos encriptados y cumplimiento total con normativas de salud
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 soft-shadow border-0 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Fácil de Usar</h3>
                      <p className="text-sm text-muted-foreground">
                        Interfaz intuitiva diseñada para profesionales de la salud
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 soft-shadow border-0 hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Soporte Premium</h3>
                      <p className="text-sm text-muted-foreground">
                        Equipo dedicado para ayudarte en cada paso
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>¿Eres Podólogo o Paciente?</strong>
                  <br />
                  Pide a tu clínica su URL personalizada de acceso
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* REGISTER MODE - New Companies */
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 soft-shadow border-0">
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/auth")}
                  className="mb-6 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Login
                </Button>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="font-heading font-bold text-3xl mb-2">Crear Nueva Empresa</h1>
                    <p className="text-muted-foreground">
                      Regístrate y comienza tu prueba gratuita de 14 días
                    </p>
                  </div>
                  <Badge className="rounded-full px-4 py-1 bg-accent text-accent-foreground">
                    14 días gratis
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-8">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Información Personal</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Nombre Completo *</Label>
                      <Input
                        id="full_name"
                        value={registerForm.full_name}
                        onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                        placeholder="Juan Pérez"
                        className="mt-2 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        placeholder="+56 9 1234 5678"
                        className="mt-2 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg_email">Email *</Label>
                      <Input
                        id="reg_email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="mt-2 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="company_name">Nombre de la Clínica *</Label>
                      <Input
                        id="company_name"
                        value={registerForm.company_name}
                        onChange={(e) => setRegisterForm({ ...registerForm, company_name: e.target.value })}
                        placeholder="Centro PodoSalud"
                        className="mt-2 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reg_password">Contraseña *</Label>
                      <Input
                        id="reg_password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="mt-2 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm_password">Confirmar Contraseña *</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={registerForm.confirm_password}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
                        placeholder="••••••••"
                        className="mt-2 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Plan Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Selecciona tu Plan</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {PLANS.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`p-6 cursor-pointer transition-all hover:shadow-xl ${
                          registerForm.plan_id === plan.id
                            ? "border-2 border-primary shadow-lg shadow-primary/20"
                            : "border-2 border-transparent"
                        } ${plan.popular ? "relative" : ""}`}
                        onClick={() => setRegisterForm({ ...registerForm, plan_id: plan.id })}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 bg-accent text-accent-foreground">
                            Popular
                          </Badge>
                        )}

                        <div className="text-center">
                          <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
                          <div className="mb-4">
                            <span className="text-3xl font-bold">{plan.price}</span>
                            <span className="text-muted-foreground">{plan.period}</span>
                          </div>
                          <ul className="space-y-2 text-sm text-left">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={registerForm.accept_terms}
                    onCheckedChange={(checked) => setRegisterForm({ ...registerForm, accept_terms: !!checked })}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                    Acepto los{" "}
                    <Link href="/terminos" className="text-primary hover:underline">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacidad" className="text-primary hover:underline">
                      política de privacidad
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl shadow-lg shadow-primary/20 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}