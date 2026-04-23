import { ReactNode, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Stethoscope, Users, LogOut, Menu, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CompanySwitcher } from "@/components/CompanySwitcher";

interface PodiatristLayoutProps {
  children: ReactNode;
  activeTab: string;
}

const NAVIGATION = [
  { id: "dia", label: "Mi Día", icon: Home },
  { id: "atencion", label: "Atención", icon: Stethoscope },
  { id: "pacientes", label: "Mis Pacientes", icon: Users },
];

export function PodiatristLayout({ children, activeTab }: PodiatristLayoutProps) {
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
          <p className="text-white/60 text-sm mt-1">Panel Podólogo</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAVIGATION.map((item) => (
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
              <Link href={`/podologo?tab=${item.id}`}>
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
              <p className="text-white/60 text-sm mt-1">Panel Podólogo</p>
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
            {NAVIGATION.map((item) => (
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
                <Link href={`/podologo?tab=${item.id}`}>
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