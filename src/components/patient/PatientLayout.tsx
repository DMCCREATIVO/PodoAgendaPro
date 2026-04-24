import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";

interface PatientLayoutProps {
  children: ReactNode;
  activeTab: string;
}

export function PatientLayout({ children, activeTab }: PatientLayoutProps) {
  const router = useRouter();
  const [userName, setUserName] = useState("Paciente");
  const [clinicName, setClinicName] = useState("Clínica");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [secondaryColor, setSecondaryColor] = useState("#8B5CF6");

  useEffect(() => {
    loadUserAndClinic();
  }, []);

  const loadUserAndClinic = async () => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) return;

    const session = JSON.parse(sessionData);
    setUserName(session.userName || "Paciente");

    // Cargar datos de la empresa
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", session.companyId)
      .single();

    if (data) {
      setClinicName(data.name || "Clínica");
      if (data.logo_url) setLogoUrl(data.logo_url);

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
    { label: "Mis Citas", value: "citas", icon: Calendar },
    { label: "Historial", value: "historial", icon: FileText },
    { label: "Pagos", value: "pagos", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 backdrop-blur-xl bg-white/80 border-r border-white/20 shadow-2xl hidden lg:block z-40">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={clinicName} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                {clinicName[0]}
              </div>
            )}
            <div>
              <h1 className="font-bold text-slate-900">{clinicName}</h1>
              <p className="text-xs text-slate-600">Portal Paciente</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <Link key={item.value} href={`/cliente?tab=${item.value}`}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "shadow-lg text-white"
                      : "hover:bg-white/50 text-slate-700 hover:text-slate-900"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }
                      : {}
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/50 rounded-xl mb-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {userName[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 text-sm">{userName}</p>
              <p className="text-xs text-slate-600">Paciente</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={clinicName} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  {clinicName[0]}
                </div>
              )}
              <div>
                <h1 className="font-bold text-slate-900 text-sm">{clinicName}</h1>
                <p className="text-xs text-slate-600">Portal Paciente</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8">{children}</div>

        {/* Bottom Nav Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/90 border-t border-white/20 shadow-2xl">
          <div className="flex items-center justify-around p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              return (
                <Link key={item.value} href={`/cliente?tab=${item.value}`}>
                  <div
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                      isActive ? "text-white" : "text-slate-600"
                    }`}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          }
                        : {}
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}