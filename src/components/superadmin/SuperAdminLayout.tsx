import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface SuperAdminLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export function SuperAdminLayout({ children, activeTab }: SuperAdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("podoagenda_session");
    router.push("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/superadmin" },
    { id: "empresas", label: "Empresas", icon: Building2, href: "/superadmin?tab=empresas" },
    { id: "usuarios", label: "Usuarios", icon: Users, href: "/superadmin?tab=usuarios" },
    { id: "personalizacion", label: "Personalización", icon: Palette, href: "/superadmin?tab=personalizacion" },
    { id: "configuracion", label: "Configuración", icon: Settings, href: "/superadmin?tab=configuracion" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="font-bold text-gray-900">SuperAdmin</h1>
              <p className="text-xs text-gray-600">Panel Global</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 bg-white/40 backdrop-blur-xl border-r border-white/20 shadow-2xl">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SuperAdmin</h1>
              <p className="text-sm text-gray-600">Panel Global</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (!activeTab && item.id === "dashboard");
            
            return (
              <Link key={item.id} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group",
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                      : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 group-hover:text-purple-600")} />
                  <span className={cn("font-medium", isActive ? "text-white" : "group-hover:text-purple-600")}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SuperAdmin</h1>
                  <p className="text-sm text-gray-600">Panel Global</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (!activeTab && item.id === "dashboard");
                
                return (
                  <Link key={item.id} href={item.href}>
                    <div
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer",
                        isActive
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 pt-20 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}