import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Lock, User, Phone, ArrowRight, Sparkles, LogIn, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/mes",
    features: [
      "1 podólogo",
      "100 pacientes",
      "Agenda básica",
      "Fichas clínicas",
      "Portal pacientes",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$79",
    period: "/mes",
    popular: true,
    features: [
      "5 podólogos",
      "500 pacientes",
      "Agenda avanzada",
      "Fichas completas",
      "Portal pacientes",
      "Reportes y análisis",
      "Recordatorios SMS",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$149",
    period: "/mes",
    features: [
      "Podólogos ilimitados",
      "Pacientes ilimitados",
      "Múltiples sedes",
      "API completa",
      "Soporte prioritario",
      "Personalización total",
      "Dominio propio",
    ],
  },
];

export default function PublicAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    company_name: "",
    phone: "",
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

      // Check if user is superadmin
      const isSuperadmin = data.user?.user_metadata?.is_superadmin === true;
      
      if (isSuperadmin) {
        router.push("/superadmin");
        return;
      }

      // Check company membership and redirect to appropriate panel
      const { data: companyUser } = await supabase
        .from("company_users")
        .select("role")
        .eq("user_id", data.user.id)
        .limit(1)
        .single();

      if (companyUser) {
        const role = companyUser.role;
        if (role === "owner" || role === "admin") {
          router.push("/admin");
        } else if (role === "podiatrist" || role === "staff") {
          router.push("/podologo");
        } else if (role === "patient") {
          router.push("/cliente");
        }
      } else {
        toast({
          title: "Error",
          description: "No se encontró empresa asociada",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user
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
      if (!authData.user) throw new Error("Error al crear usuario");

      // Create company
      const slug = registerForm.company_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: registerForm.company_name,
          slug: slug,
          phone: registerForm.phone,
          settings: {
            allow_patient_login: true,
            allow_public_registration: false,
            plan: selectedPlan,
          },
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from("company_users")
        .insert({
          company_id: company.id,
          user_id: authData.user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      toast({
        title: "¡Empresa creada exitosamente!",
        description: `Tu URL: /${slug}`,
      });

      router.push("/onboarding");
    } catch (error: any) {
      toast({
        title: "Error al crear empresa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEO
        title="Acceso - PodoAgenda Pro"
        description="Inicia sesión o registra tu clínica podológica en PodoAgenda Pro"
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block space-y-6">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Sistema Profesional SaaS
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PodoAgenda Pro
              </h1>
              <p className="text-lg text-muted-foreground">
                Sistema completo de gestión podológica. Agenda, fichas clínicas, portal de pacientes y más.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">URL Personalizada</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu propia página con tu marca: podoagenda.com/tu-clinica
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gestión Completa</h3>
                  <p className="text-sm text-muted-foreground">
                    Agenda, pacientes, cobros, fichas clínicas y reportes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Portal de Pacientes</h3>
                  <p className="text-sm text-muted-foreground">
                    Tus pacientes pueden agendar y ver su historial online
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Register Tabs */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border shadow-xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Crear Empresa</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Bienvenido</h2>
                  <p className="text-sm text-muted-foreground">
                    Ingresa a tu cuenta
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Contraseña
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Cargando..." : "Iniciar Sesión"}
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Registra tu Clínica</h2>
                  <p className="text-sm text-muted-foreground">
                    Completa el formulario para comenzar
                  </p>
                </div>

                {/* Plan Selection */}
                <div className="space-y-3 mb-6">
                  <Label>Selecciona tu Plan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                          selectedPlan === plan.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        }`}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-2 -right-2 text-xs">Popular</Badge>
                        )}
                        <div className="font-semibold text-sm">{plan.name}</div>
                        <div className="text-lg font-bold text-primary">{plan.price}</div>
                        <div className="text-xs text-muted-foreground">{plan.period}</div>
                      </button>
                    ))}
                  </div>
                  {selectedPlan && (
                    <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-1">
                      {PLANS.find((p) => p.id === selectedPlan)?.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      <User className="w-4 h-4 inline mr-1" />
                      Nombre Completo
                    </Label>
                    <Input
                      id="full_name"
                      placeholder="Dr. Juan Pérez"
                      value={registerForm.full_name}
                      onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@tuclinica.cl"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      <Lock className="w-4 h-4 inline mr-1" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Nombre de la Clínica
                    </Label>
                    <Input
                      id="company_name"
                      placeholder="Centro PodoSalud"
                      value={registerForm.company_name}
                      onChange={(e) => setRegisterForm({ ...registerForm, company_name: e.target.value })}
                      required
                    />
                    {registerForm.company_name && (
                      <p className="text-xs text-muted-foreground">
                        Tu URL será: podoagenda.com/
                        {registerForm.company_name
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Creando..." : "Crear Empresa"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Eres SuperAdmin?{" "}
                <Link
                  href="/superadmin/auth"
                  className="text-primary hover:underline font-medium"
                >
                  Acceder al sistema
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}