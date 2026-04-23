import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompanySwitcher } from "@/components/CompanySwitcher";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, Calendar, Users, User, DollarSign, Settings,
  Menu, X, LogOut, Bell, ChevronRight, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "podologos", label: "Podólogos", icon: Users },
  { id: "pacientes", label: "Pacientes", icon: User },
  { id: "cobros", label: "Cobros", icon: DollarSign },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

interface AdminLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export function AdminLayout({ children, activeTab = "dashboard" }: AdminLayoutProps) {
  const router = useRouter();
  const { currentCompany } = useCompany();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  useEffect(() => {
    checkSuperadmin();
  }, []);

  const checkSuperadmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsSuperadmin(user?.user_metadata?.is_superadmin === true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-background/80 backdrop-blur-xl border-r border-border shadow-2xl">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-6">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <p className="font-heading font-bold text-lg">PODOS PRO</p>
                <p className="text-xs text-muted-foreground">Panel Admin</p>
              </div>
            </Link>
          </div>

          {/* Company Switcher */}
          <div className="px-4 mb-4">
            <CompanySwitcher />
          </div>

          <Separator className="my-4" />

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Link
                  key={item.id}
                  href={`/admin?tab=${item.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}

            {/* SuperAdmin Link */}
            {isSuperadmin && (
              <>
                <Separator className="my-4" />
                <Link
                  href="/superadmin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-600 hover:from-purple-500/20 hover:to-pink-500/20 transition-all group"
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">SuperAdmin</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Link>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start rounded-xl hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}