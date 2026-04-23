import { ReactNode, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Users, Stethoscope, DollarSign, Settings, LogOut, Menu, X, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CompanySwitcher } from "@/components/CompanySwitcher";

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "podologos", label: "Podólogos", icon: Users },
  { id: "pacientes", label: "Pacientes", icon: User },
  { id: "cobros", label: "Cobros", icon: DollarSign },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b z-50 flex items-center justify-between px-4">
        <h1 className="font-heading font-bold text-xl">PODOS PRO</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-xl"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 glass-dark border-r flex-col z-40">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-heading font-bold text-2xl text-white">PODOS PRO</h1>
          <p className="text-white/60 text-sm mt-1">Panel Administrativo</p>
        </div>

        <div className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 bg-background/80 backdrop-blur-xl border-r border-border/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl tracking-tight">PODOS</span>
                <span className="font-heading font-light text-xl tracking-tight text-primary">PRO</span>
              </div>
            </div>
            
            <div className="mb-6">
              <CompanySwitcher />
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start rounded-xl h-12 text-base transition-all",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              asChild
            >
              <Link href={`/admin?tab=${item.id}`}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start rounded-xl h-12 text-white/80 hover:text-white hover:bg-white/10"
            asChild
          >
            <Link href="/auth">
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </Link>
          </Button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <aside className="lg:hidden fixed inset-0 glass-dark z-40 flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl text-white">PODOS PRO</h1>
              <p className="text-white/60 text-sm mt-1">Panel Administrativo</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="text-white rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-xl h-12 text-base",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                onClick={() => setIsSidebarOpen(false)}
                asChild
              >
                <Link href={`/admin?tab=${item.id}`}>
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl h-12 text-white/80 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/auth">
                <LogOut className="w-5 h-5 mr-3" />
                Cerrar Sesión
              </Link>
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}