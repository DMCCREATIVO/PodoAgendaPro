import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/auth";
import type { Session } from "@/services/auth";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, CheckCircle } from "lucide-react";

export default function Cliente() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = authService.getSession();
    
    // Guard: Solo Pacientes
    if (!currentSession || currentSession.role !== "patient") {
      router.replace("/login");
      return;
    }
    
    setSession(currentSession);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <p className="text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <SEO title="Portal Paciente - PodoAgenda Pro" />

      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Portal Paciente</h1>
              <p className="text-sm text-gray-600">Mis Citas y Datos</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <Card className="p-12 text-center max-w-2xl mx-auto shadow-xl">
          <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Autenticación Exitosa!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Has ingresado correctamente al portal de pacientes.
          </p>
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <p className="text-sm font-semibold text-indigo-900 mb-2">Sesión Activa:</p>
            <p className="text-gray-700">{session.fullName}</p>
            <p className="text-gray-600 text-sm">{session.email}</p>
            <p className="text-indigo-600 text-sm font-semibold mt-2">Rol: {session.role}</p>
          </div>
          <p className="text-gray-500">Portal en construcción - Próximamente funcionalidad completa</p>
        </Card>
      </main>
    </div>
  );
}