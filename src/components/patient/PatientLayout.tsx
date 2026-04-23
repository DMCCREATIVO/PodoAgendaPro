import { ReactNode, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CreditCard, LogOut, Menu, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientLayoutProps {
  children: ReactNode;
  activeTab: string;
}

const NAV_ITEMS = [
  { id: "citas", label: "Mis Citas", icon: Calendar },
  { id: "historial", label: "Historial", icon: FileText },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export function PatientLayout({ children, activeTab }: PatientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold">P</span>
          </div>
          <h1 className="font-heading font-bold text-xl">PodoAgenda Pro</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col bg-gradient-to-br from-muted/30 via-background to-muted/20 border-r border-border/40 backdrop-blur-sm">
        {/* Logo */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-white">PodoAgenda Pro</h1>
              <p className="text-xs text-muted-foreground">Portal Paciente</p>
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
              <Link href={`/cliente?tab=${item.id}`}>
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

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-gradient-to-br from-muted/30 via-background to-muted/20">
          <div className="p-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="font-heading font-bold text-2xl text-white">PodoAgenda Pro</h1>
                <p className="text-xs text-muted-foreground">Portal Paciente</p>
              </div>
            </div>
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
                <Link href={`/cliente?tab=${item.id}`}>
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
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}