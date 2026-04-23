import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PatientLayout } from "@/components/patient/PatientLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { User } from "lucide-react";

export default function Cliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        router.replace("/auth");
        return;
      }
      
      setCurrentUser(user);
      setLoading(false);
    } catch (err) {
      console.error("Error auth:", err);
      router.replace("/auth");
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500/10 via-background to-green-600/10 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-green-600 animate-pulse" />
          <p className="text-muted-foreground">Cargando portal...</p>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout>
      <SEO title="Portal Paciente - PodoAgenda Pro" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Portal del Paciente</h1>
            <p className="text-muted-foreground">Bienvenido, {currentUser?.full_name || currentUser?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>

        <Card className="p-8">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Portal Paciente en Construcción</h2>
            <p className="text-muted-foreground">
              Gestión de citas e historial próximamente
            </p>
          </div>
        </Card>
      </div>
    </PatientLayout>
  );
}