import { useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Building2, Stethoscope, ArrowRight, Mail, Lock, 
  CheckCircle, Sparkles, Shield, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type UserRole = "admin" | "podiatrist" | "patient";

export default function Auth() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    planId: "",
  });

  const roles = [
    {
      id: "admin" as UserRole,
      title: "Administrador de Clínica",
      icon: Building2,
      description: "Gestiona toda tu clínica podológica",
      color: "from-blue-500 to-cyan-500",
      features: ["Gestión completa", "Múltiples podólogos", "Analytics avanzados"]
    },
    {
      id: "podiatrist" as UserRole,
      title: "Podólogo",
      icon: Stethoscope,
      description: "Atiende pacientes y gestiona tu agenda",
      color: "from-green-500 to-emerald-500",
      features: ["Ficha clínica", "Agenda personal", "Historial pacientes"]
    },
    {
      id: "patient" as UserRole,
      title: "Paciente",
      icon: User,
      description: "Agenda citas y consulta tu historial",
      color: "from-purple-500 to-pink-500",
      features: ["Agendar online", "Ver historial", "Gestionar citas"]
    }
  ];

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$29",
      period: "/mes",
      features: ["1 Podólogo", "100 pacientes", "Agenda básica"],
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      price: "$79",
      period: "/mes",
      features: ["5 Podólogos", "Pacientes ilimitados", "Ficha completa"],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: ["Ilimitado", "Multi-sucursal", "Soporte 24/7"],
      popular: false
    }
  ];

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa email y contraseña",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await authService.login(loginEmail, loginPassword);
      
      toast({
        title: "Bienvenido de vuelta",
        description: "Redirigiendo a tu panel...",
      });

      // Redirect based on role (will be handled by role detection)
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
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

  const handleRegister = async () => {
    // Validation
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Contraseñas no coinciden",
        description: "Verifica que ambas contraseñas sean iguales",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!registerData.companyName) {
      toast({
        title: "Nombre de clínica requerido",
        description: "Por favor ingresa el nombre de tu clínica",
        variant: "destructive",
      });
      return;
    }

    if (!registerData.planId) {
      toast({
        title: "Plan requerido",
        description: "Por favor selecciona un plan para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.name,
        company_name: registerData.companyName,
        phone: registerData.phone,
        plan_id: registerData.planId,
      });

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Redirigiendo...",
      });

      // Redirect to admin panel
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl">PODOS PRO</span>
          </Link>
          <h1 className="font-heading font-bold text-4xl mb-2">
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "login" 
              ? "Ingresa a tu panel de control" 
              : "Comienza a gestionar tu clínica hoy"}
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card className="max-w-md mx-auto p-8 soft-shadow-lg border-0">
              {/* Role Selection for Login */}
              {!selectedRole ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="font-heading font-bold text-xl mb-2">Selecciona tu perfil</h2>
                    <p className="text-sm text-muted-foreground">¿Cómo vas a usar PODOS PRO?</p>
                  </div>

                  <div className="space-y-3">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className="w-full text-left p-4 rounded-2xl border-2 border-border hover:border-primary transition-all hover:shadow-lg group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform",
                            role.color
                          )}>
                            <role.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold mb-1">{role.title}</p>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Selected Role Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="rounded-full">
                      {roles.find(r => r.id === selectedRole)?.title}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedRole(null)}
                      className="text-xs"
                    >
                      Cambiar perfil
                    </Button>
                  </div>

                  {/* Login Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="mt-2 rounded-xl"
                        onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="mt-2 rounded-xl"
                        onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-muted-foreground">Recordarme</span>
                      </label>
                      <Link href="#" className="text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <Button 
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="w-full rounded-xl shadow-lg shadow-primary/20"
                      size="lg"
                    >
                      {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card className="max-w-2xl mx-auto p-8 soft-shadow-lg border-0">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Badge variant="outline" className="rounded-full mb-4">
                    <Sparkles className="w-3 h-3 mr-2 inline" />
                    14 días de prueba gratis
                  </Badge>
                  <h2 className="font-heading font-bold text-2xl mb-2">Crea tu clínica en PODOS PRO</h2>
                  <p className="text-sm text-muted-foreground">Sin tarjeta de crédito requerida</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="juan@clinica.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="register-password">Contraseña *</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmar Contraseña *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company-name">Nombre de tu Clínica *</Label>
                    <Input
                      id="company-name"
                      type="text"
                      placeholder="Clínica PodoSalud"
                      value={registerData.companyName}
                      onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="mt-2 rounded-xl"
                    />
                  </div>
                </div>

                {/* Plan Selection */}
                <div>
                  <Label>Selecciona tu Plan *</Label>
                  <div className="grid md:grid-cols-3 gap-4 mt-2">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setRegisterData({ ...registerData, planId: plan.id })}
                        className={cn(
                          "relative p-4 rounded-2xl border-2 transition-all text-left",
                          registerData.planId === plan.id
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent border-0 text-xs">
                            Popular
                          </Badge>
                        )}
                        <h3 className="font-bold mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          <span className="text-sm text-muted-foreground">{plan.period}</span>
                        </div>
                        <ul className="space-y-1">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs">
                              <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        {registerData.planId === plan.id && (
                          <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" className="mt-1 rounded" required />
                  <p>
                    Acepto los <Link href="#" className="text-primary hover:underline">Términos y Condiciones</Link> y la <Link href="#" className="text-primary hover:underline">Política de Privacidad</Link>
                  </p>
                </div>

                <Button 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full rounded-xl shadow-lg shadow-primary/20"
                  size="lg"
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta? <button onClick={() => setMode("login")} className="text-primary hover:underline font-semibold">Inicia sesión</button>
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features Banner */}
        <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Seguro y Confiable</h3>
              <p className="text-sm text-muted-foreground">Datos encriptados y respaldos diarios</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border">
            <Sparkles className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Fácil de Usar</h3>
              <p className="text-sm text-muted-foreground">Interfaz intuitiva y moderna</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-background/50 backdrop-blur-sm border border-border">
            <Crown className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Soporte Premium</h3>
              <p className="text-sm text-muted-foreground">Ayuda cuando la necesites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}