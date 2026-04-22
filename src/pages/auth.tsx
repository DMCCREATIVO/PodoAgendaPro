import { useState } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog, Stethoscope, User, ArrowRight, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "admin",
    title: "Administrador",
    description: "Gestión completa del sistema",
    icon: UserCog,
    color: "from-primary to-primary/80",
    route: "/admin",
  },
  {
    id: "podologo",
    title: "Podólogo",
    description: "Panel clínico y atención",
    icon: Stethoscope,
    color: "from-accent to-accent/80",
    route: "/podologo",
  },
  {
    id: "paciente",
    title: "Paciente",
    description: "Portal personal",
    icon: User,
    color: "from-chart-3 to-chart-3/80",
    route: "/cliente",
  },
];

export default function Auth() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setShowLogin(true);
  };

  const handleLogin = () => {
    const role = ROLES.find(r => r.id === selectedRole);
    if (role) {
      // Mock auth - in real system would validate credentials
      router.push(role.route);
    }
  };

  const selectedRoleData = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h1 className="font-heading font-bold text-4xl">Acceso al Sistema</h1>
            <p className="text-muted-foreground text-lg">
              {!showLogin ? "Selecciona tu tipo de usuario" : "Ingresa tus credenciales"}
            </p>
          </div>

          {!showLogin ? (
            <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
              {ROLES.map((role) => (
                <Card
                  key={role.id}
                  className={cn(
                    "p-8 cursor-pointer transition-all duration-300 hover-lift group",
                    "hover:shadow-2xl hover:border-primary/50",
                    selectedRole === role.id && "border-2 border-primary shadow-xl shadow-primary/20 scale-105"
                  )}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div className="space-y-6">
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto",
                      "bg-gradient-to-br transition-transform duration-300",
                      role.color,
                      "group-hover:scale-110"
                    )}>
                      <role.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h3 className="font-heading font-bold text-2xl">{role.title}</h3>
                      <p className="text-muted-foreground">{role.description}</p>
                    </div>

                    <Button
                      variant={selectedRole === role.id ? "default" : "outline"}
                      className="w-full rounded-2xl h-12 transition-all"
                    >
                      {selectedRole === role.id ? "Continuar" : "Seleccionar"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="max-w-md mx-auto p-8 soft-shadow animate-slide-up">
              <div className="space-y-6">
                {selectedRoleData && (
                  <div className="text-center space-y-4">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto",
                      "bg-gradient-to-br",
                      selectedRoleData.color
                    )}>
                      <selectedRoleData.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-2xl">{selectedRoleData.title}</h2>
                      <p className="text-muted-foreground text-sm">{selectedRoleData.description}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleLogin}
                    className="w-full rounded-2xl h-12 shadow-lg shadow-primary/30"
                  >
                    Ingresar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLogin(false);
                      setSelectedRole(null);
                      setCredentials({ email: "", password: "" });
                    }}
                    className="w-full rounded-2xl h-12"
                  >
                    Volver
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>¿Olvidaste tu contraseña?</p>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    Recuperar acceso
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}