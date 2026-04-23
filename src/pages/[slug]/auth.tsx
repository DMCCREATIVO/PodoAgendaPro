import { GetServerSideProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { BrandedLayout } from "@/components/BrandedLayout";
import Link from "next/link";
import { 
  User, Lock, Mail, ArrowRight, ArrowLeft,
  Shield, Stethoscope, UserCircle
} from "lucide-react";

interface TenantAuthProps {
  company: any;
  allowRegistration: boolean;
  allowPatientLogin: boolean;
}

export default function TenantAuth({ company, allowRegistration, allowPatientLogin }: TenantAuthProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { mode: queryMode } = router.query;

  const [mode, setMode] = useState<"login" | "register">(queryMode === "register" ? "register" : "login");
  const [selectedRole, setSelectedRole] = useState<"admin" | "podiatrist" | "patient">("patient");
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="p-8 max-w-md text-center">
          <h1 className="font-heading font-bold text-2xl mb-4">Clínica no encontrada</h1>
          <p className="text-muted-foreground mb-6">
            La clínica que buscas no existe o no está disponible.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(loginForm.email, loginForm.password);

      // Get user role in this company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se pudo obtener el usuario");

      const { data: companyUser } = await supabase
        .from("company_users")
        .select("role")
        .eq("company_id", company.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (!companyUser && selectedRole !== "patient") {
        throw new Error("No tienes acceso a esta clínica");
      }

      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso",
      });

      // Redirect based on role
      const redirectMap: Record<string, string> = {
        owner: `/${company.slug}/admin`,
        admin: `/${company.slug}/admin`,
        podiatrist: `/${company.slug}/podologo`,
        patient: `/${company.slug}/cliente`,
      };

      const redirect = redirectMap[companyUser?.role || "patient"] || `/${company.slug}/cliente`;
      router.push(redirect);
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
    if (!registerForm.full_name || !registerForm.email || !registerForm.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (registerForm.password !== registerForm.password_confirm) {
      toast({
        title: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (!allowRegistration) {
      toast({
        title: "Registro no disponible",
        description: "Esta clínica no permite registro público",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            full_name: registerForm.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // Create client record
      const { error: clientError } = await supabase
        .from("clients")
        .insert({
          company_id: company.id,
          name: registerForm.full_name,
          email: registerForm.email,
          status: "active",
        });

      if (clientError) throw clientError;

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada. Redirigiendo...",
      });

      setTimeout(() => {
        router.push(`/${company.slug}/cliente`);
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

  const ROLE_CONFIG = {
    admin: {
      icon: Shield,
      title: "Administrador",
      description: "Gestión completa de la clínica",
      gradient: "from-purple-500 to-pink-500",
    },
    podiatrist: {
      icon: Stethoscope,
      title: "Podólogo",
      description: "Atención y gestión de pacientes",
      gradient: "from-blue-500 to-cyan-500",
    },
    patient: {
      icon: UserCircle,
      title: "Paciente",
      description: "Mis citas y tratamientos",
      gradient: "from-green-500 to-emerald-500",
    },
  };

  return (
    <BrandedLayout applyBranding={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* Header with Company Branding */}
          <div className="text-center mb-8">
            <Link href={`/${company.slug}`}>
              <Button variant="ghost" className="mb-4 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a {company.name}
              </Button>
            </Link>

            {company.logo_url && (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="h-16 w-auto object-contain mx-auto mb-4"
              />
            )}
            
            <h1 className="font-heading font-bold text-3xl mb-2">
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h1>
            <p className="text-muted-foreground">
              {company.name}
            </p>
          </div>

          <Card className="p-8 soft-shadow border-0 max-w-2xl mx-auto">
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-muted/50 rounded-xl">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  mode === "login"
                    ? "bg-background shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Iniciar Sesión
              </button>
              {allowRegistration && (
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    mode === "register"
                      ? "bg-background shadow-md text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Crear Cuenta
                </button>
              )}
            </div>

            {/* Login Form */}
            {mode === "login" && (
              <div className="space-y-6">
                {/* Role Selector */}
                {allowPatientLogin && (
                  <div>
                    <Label className="mb-3 block">Selecciona tu perfil</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                        const Icon = config.icon;
                        const isSelected = selectedRole === role;
                        
                        return (
                          <button
                            key={role}
                            onClick={() => setSelectedRole(role as any)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-lg"
                                : "border-border hover:border-primary/50 bg-background"
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} mx-auto mb-2 flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="font-medium text-sm">{config.title}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="mt-2 rounded-xl"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-2 rounded-xl"
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <Button 
                  onClick={handleLogin}
                  className="w-full rounded-xl shadow-lg shadow-primary/20"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* Register Form */}
            {mode === "register" && allowRegistration && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="reg-name">Nombre Completo</Label>
                  <Input
                    id="reg-name"
                    value={registerForm.full_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                    placeholder="Juan Pérez"
                    className="mt-2 rounded-xl"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="mt-2 rounded-xl"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-2 rounded-xl"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="reg-password-confirm">Confirmar Contraseña</Label>
                  <Input
                    id="reg-password-confirm"
                    type="password"
                    value={registerForm.password_confirm}
                    onChange={(e) => setRegisterForm({ ...registerForm, password_confirm: e.target.value })}
                    placeholder="••••••••"
                    className="mt-2 rounded-xl"
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  onClick={handleRegister}
                  className="w-full rounded-xl shadow-lg shadow-primary/20"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </BrandedLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (error || !company) {
      return { props: { company: null, allowRegistration: false, allowPatientLogin: false } };
    }

    const metadata = (company.metadata as any) || {};
    const settings = metadata.settings || {};

    return {
      props: {
        company,
        allowRegistration: settings.allow_public_registration || false,
        allowPatientLogin: settings.allow_patient_login || false,
      },
    };
  } catch (error) {
    return { props: { company: null, allowRegistration: false, allowPatientLogin: false } };
  }
};