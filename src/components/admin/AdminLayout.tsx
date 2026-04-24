import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserPlus, 
  DollarSign, 
  Settings, 
  LogOut,
  Menu,
  X,
  Stethoscope,
  UserCircle,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [secondaryColor, setSecondaryColor] = useState("#8B5CF6");

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    const session = JSON.parse(localStorage.getItem("session") || "{}");
    if (!session.companyId) return;

    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", session.companyId)
      .single();

    if (data) {
      setCompanyData(data);
      
      const metadata = data.metadata as any;
      // Aplicar colores personalizados
      if (metadata?.primary_color) setPrimaryColor(metadata.primary_color);
      if (metadata?.secondary_color) setSecondaryColor(metadata.secondary_color);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("session");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Agenda", icon: Calendar, path: "/admin?tab=agenda" },
    { name: "Podólogos", icon: Users, path: "/admin?tab=podologos" },
    { name: "Pacientes", icon: UserCircle, path: "/admin?tab=pacientes" },
    { name: "Cobros", icon: DollarSign, path: "/admin?tab=cobros" },
    { name: "Personalización Web", icon: Palette, path: "/admin-customization" },
    { name: "Configuración", icon: Settings, path: "/admin?tab=configuracion" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {companyData?.logo_url ? (
              <img src={companyData.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div 
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                {companyData?.name?.[0] || "A"}
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-slate-900">{companyData?.name || "Admin Panel"}</h1>
              <p className="text-xs text-slate-500">Panel Administrativo</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full bg-white/60 backdrop-blur-2xl border-r border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              {companyData?.logo_url ? (
                <img src={companyData.logo_url} alt="Logo" className="h-12 w-12 rounded-xl object-cover shadow-lg" />
              ) : (
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  {companyData?.name?.[0] || "A"}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-slate-900">{companyData?.name || "Admin Panel"}</h1>
                <p className="text-xs text-slate-500">Panel Administrativo</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.asPath === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "text-white shadow-lg"
                        : "text-slate-600 hover:bg-white/50"
                    }`}
                    style={isActive ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` } : {}}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-20 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}