import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, Stethoscope, User, Building2, Calendar, Globe, ArrowRight } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-heading font-bold text-gray-900">
            🦶 PodoAgenda Pro - Demo Access
          </h1>
          <p className="text-xl text-gray-600">
            Acceso directo a todos los paneles del sistema (modo desarrollo)
          </p>
          <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
            ⚠️ MODO DEMO - Sin autenticación requerida
          </Badge>
        </div>

        {/* Panel de SuperAdmin */}
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-6 shadow-lg">
              <Crown className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel SuperAdmin</h2>
              <p className="text-gray-600 mb-4">
                Gestión global del sistema. Ver todas las empresas, usuarios, configuración del sistema.
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>5 Tabs:</strong> Dashboard Global, Empresas, Usuarios, Auditoría, Configuración
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Color:</strong> Morado con glassmorphism
                </p>
              </div>
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg"
              >
                <Link href="/superadmin?demo=true">
                  Abrir Panel SuperAdmin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Panel de Admin */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
              <Shield className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel Administrador</h2>
              <p className="text-gray-600 mb-4">
                Gestión de la clínica. Agenda, podólogos, pacientes, cobros, configuración de la empresa.
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>6 Tabs:</strong> Dashboard, Agenda, Podólogos, Pacientes, Cobros, Configuración
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Color:</strong> Azul con glassmorphism
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Empresa Demo:</strong> Centro PodoSalud
                </p>
              </div>
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Link href="/admin?demo=true">
                  Abrir Panel Admin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Panel de Podólogo */}
        <Card className="p-8 bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
              <Stethoscope className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel Podólogo</h2>
              <p className="text-gray-600 mb-4">
                Atención clínica. Mi día, ficha podológica completa, mis pacientes, configuración.
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>4 Tabs:</strong> Mi Día, Atención (Ficha Clínica), Mis Pacientes, Configuración
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Color:</strong> Verde con glassmorphism
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Podólogo Demo:</strong> Dra. Ana Martínez
                </p>
              </div>
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Link href="/podologo?demo=true">
                  Abrir Panel Podólogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Portal de Paciente */}
        <Card className="p-8 bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <div className="flex items-start gap-6">
            <div className="bg-gradient-to-br from-gray-600 to-gray-800 text-white rounded-2xl p-6 shadow-lg">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Portal Paciente</h2>
              <p className="text-gray-600 mb-4">
                Vista del paciente. Mis citas, historial clínico, pagos, configuración personal.
              </p>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>4 Tabs:</strong> Mis Citas, Historial, Pagos, Configuración
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Color:</strong> Neutral/Gris con glassmorphism
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Paciente Demo:</strong> Juan Pérez
                </p>
              </div>
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white shadow-lg"
              >
                <Link href="/cliente?demo=true">
                  Abrir Portal Paciente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Sección de Páginas Públicas */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Landing */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-4 mb-4">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Landing Page</h3>
            <p className="text-sm text-gray-600 mb-4">
              Página pública principal con hero, servicios, testimonios.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Ver Landing</Link>
            </Button>
          </Card>

          {/* Agenda */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reserva Online</h3>
            <p className="text-sm text-gray-600 mb-4">
              Stepper de 5 pasos para agendar citas.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/agenda">Ver Agenda</Link>
            </Button>
          </Card>

          {/* Disponibilidad */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-4 mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Disponibilidad</h3>
            <p className="text-sm text-gray-600 mb-4">
              Página pública por podólogo con horarios.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/disponibilidad/dra-ana-martinez">Ver Ejemplo</Link>
            </Button>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card className="p-8 bg-yellow-50 border-yellow-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">📋 Instrucciones de Uso</h3>
          <div className="space-y-3 text-gray-700">
            <p><strong>1.</strong> Haz click en cualquier botón "Abrir Panel" arriba</p>
            <p><strong>2.</strong> Verás el panel completo SIN necesidad de login</p>
            <p><strong>3.</strong> Todos los datos son MOCK (de prueba) pero completamente funcionales</p>
            <p><strong>4.</strong> Navega por las tabs para ver todas las features</p>
            <p><strong>5.</strong> El parámetro <code className="bg-yellow-100 px-2 py-1 rounded">?demo=true</code> desactiva la verificación de autenticación</p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <p>🦶 PodoAgenda Pro - Sistema Podológico Completo</p>
          <p>Modo Demo - Todas las features implementadas y funcionando</p>
          <p className="text-xs">Para volver aquí: <code className="bg-gray-100 px-2 py-1 rounded">/demo</code></p>
        </div>
      </div>
    </div>
  );
}