import { useEffect } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/auth";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, CheckCircle } from "lucide-react";

export default function Podologo() {
  const router = useRouter();
  const session = authService.getSession();

  useEffect(() => {
    const session = authService.getSession();
    
    // Guard: Solo empleados (podólogos)
    if (!session || session.role !== "employee") {
      window.location.href = "/login";
      return;
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <SEO title="Panel Podólogo - PodoAgenda Pro" />

      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Panel Clínico</h1>
              <p className="text-sm text-gray-600">Atención Podológica</p>
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
            Has ingresado correctamente al panel clínico.
          </p>
          <div className="bg-teal-50 rounded-xl p-6 mb-6">
            <p className="text-sm font-semibold text-teal-900 mb-2">Sesión Activa:</p>
            <p className="text-gray-700">{session.fullName}</p>
            <p className="text-gray-600 text-sm">{session.email}</p>
            <p className="text-teal-600 text-sm font-semibold mt-2">Rol: {session.role}</p>
            {session.companyId && (
              <p className="text-gray-500 text-xs mt-1">Empresa: {session.companyId}</p>
            )}
          </div>
          <p className="text-gray-500">Panel en construcción - Próximamente funcionalidad completa</p>
        </Card>
      </main>
    </div>
  );
}