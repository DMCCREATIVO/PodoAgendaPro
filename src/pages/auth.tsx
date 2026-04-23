import { useState } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog, Stethoscope, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

type Role = "admin" | "podiatrist" | "patient";
type AuthMode = "login" | "register";

export default function Auth() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const roles = [
    {
      id: "admin" as Role,
      title: "Administrador",
      description: "Gestión completa de la clínica",
      icon: UserCog,
      redirect: "/admin",
    },
    {
      id: "podiatrist" as Role,
      title: "Podólogo",
      description: "Atención clínica y pacientes",
      icon: Stethoscope,
      redirect: "/podologo",
    },
    {
      id: "patient" as Role,
      title: "Paciente",
      description: "Mis citas e historial",
      icon: User,
      redirect: "/cliente",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.signIn(email, password);
      
      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso",
      });

      const roleData = roles.find((r) => r.id === selectedRole);
      if (roleData) {
        router.push(roleData.redirect);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.signUpWithCompany(
        email,
        password,
        fullName,
        companyName
      );

      toast({
        title: "¡Registro exitoso!",
        description: `Empresa "${companyName}" creada con éxito`,
      });

      // Redirect to admin panel
      router.push("/admin");
    } catch (error: any) {
      toast({
        title: "Error en registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {!selectedRole ? (
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h1 className="font-heading font-bold text-4xl mb-4">
                  Acceso al Sistema
                </h1>
                <p className="text-muted-foreground text-lg">
                  Selecciona tu rol para continuar
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className="p-8 soft-shadow border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-300 hover:scale-105 group"
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <role.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading font-bold text-xl mb-2 text-center">
                      {role.title}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {role.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedRole(null);
                  setAuthMode("login");
                }}
                className="mb-6 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cambiar rol
              </Button>

              <Card className="max-w-md mx-auto p-8 soft-shadow border-0">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const RoleIcon = roles.find((r) => r.id === selectedRole)
                        ?.icon;
                      return RoleIcon ? (
                        <RoleIcon className="w-8 h-8 text-white" />
                      ) : null;
                    })()}
                  </div>
                  <h2 className="font-heading font-bold text-2xl mb-2">
                    {authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {roles.find((r) => r.id === selectedRole)?.title}
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Button
                    variant={authMode === "login" ? "default" : "ghost"}
                    onClick={() => setAuthMode("login")}
                    className="rounded-xl"
                  >
                    Ingresar
                  </Button>
                  <Button
                    variant={authMode === "register" ? "default" : "ghost"}
                    onClick={() => setAuthMode("register")}
                    className="rounded-xl"
                  >
                    Registrarse
                  </Button>
                </div>

                <form onSubmit={authMode === "login" ? handleLogin : handleRegister}>
                  {authMode === "register" && (
                    <>
                      <div className="mb-4">
                        <Label htmlFor="fullName">Nombre Completo</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Juan Pérez"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="mt-2 rounded-xl"
                        />
                      </div>

                      <div className="mb-4">
                        <Label htmlFor="companyName">Nombre de la Empresa</Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Clínica Podológica"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="mt-2 rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  <div className="mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-2 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl h-12 text-base shadow-lg shadow-primary/20"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Procesando..."
                      : authMode === "login"
                      ? "Ingresar"
                      : "Crear Cuenta"}
                  </Button>

                  {authMode === "login" && (
                    <div className="text-center mt-4">
                      <a
                        href="#"
                        className="text-sm text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  )}
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}