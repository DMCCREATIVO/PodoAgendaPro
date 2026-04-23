import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PodiatristLayout } from "@/components/podiatrist/PodiatristLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { Stethoscope } from "lucide-react";

export default function Podologo() {
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
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/10 via-background to-cyan-600/10 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-cyan-600 animate-pulse" />
          <p className="text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <PodiatristLayout>
      <SEO title="Panel Podólogo - PodoAgenda Pro" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel Podólogo</h1>
            <p className="text-muted-foreground">Bienvenido, {currentUser?.full_name || currentUser?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>

        <Card className="p-8">
          <div className="text-center">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-cyan-600" />
            <h2 className="text-2xl font-bold mb-2">Panel Clínico en Construcción</h2>
            <p className="text-muted-foreground">
              Atención de pacientes y ficha podológica próximamente
            </p>
          </div>
        </Card>
      </div>
    </PodiatristLayout>
  );
}