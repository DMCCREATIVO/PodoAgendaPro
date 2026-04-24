import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Menu, Calendar, Stethoscope, Users, LogOut, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PodiatristLayoutProps {
  children: ReactNode;
}

export function PodiatristLayout({ children }: PodiatristLayoutProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [secondaryColor, setSecondaryColor] = useState("#7C3AED");

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) return;

    const session = JSON.parse(sessionData);
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", session.companyId)
      .single();

    if (data) {
      setCompanyData(data);
      
      const metadata = data.metadata as any;
      if (metadata?.primary_color) setPrimaryColor(metadata.primary_color);
      if (metadata?.secondary_color) setSecondaryColor(metadata.secondary_color);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("session");
    router.push("/login");
  };

  const navItems = [
    { icon: Calendar, label: "Mi Día", href: "/podologo?tab=mi-dia" },
    { icon: Stethoscope, label: "Atención", href: "/podologo?tab=atencion" },
    { icon: Users, label: "Mis Pacientes", href: "/podologo?tab=pacientes" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
        }}
      >
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto backdrop-blur-xl bg-white/40 border-r border-white/20 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {companyData?.logo_url ? (
                <img src={companyData.logo_url} alt={companyData.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                companyData?.name?.[0] || "P"
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold text-slate-900">{companyData?.name || "Clínica"}</h2>
              <p className="text-xs text-slate-600">Panel Podólogo</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = router.asPath.includes(item.href);
              return (
                <Link key={item.label} href={item.href}>
                  <div
                    className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all ${
                      isActive
                        ? "bg-white shadow-lg text-slate-900"
                        : "text-slate-700 hover:bg-white/50"
                    }`}
                    style={isActive ? {
                      boxShadow: `0 4px 20px ${primaryColor}30`,
                    } : {}}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600" : ""}`} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {companyData?.name?.[0] || "P"}
            </div>
            <div className="ml-3">
              <h2 className="text-sm font-bold text-slate-900">{companyData?.name || "Clínica"}</h2>
              <p className="text-xs text-slate-600">Podólogo</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="px-4 py-3 space-y-2 bg-white border-t">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <div
                  className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 text-slate-600" />
                  {item.label}
                </div>
              </Link>
            ))}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}