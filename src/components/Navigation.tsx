import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground">PodoAgenda Pro</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/#servicios" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Servicios
            </Link>
            <Link href="/#podologos" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Podólogos
            </Link>
            <Link href="/#beneficios" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Beneficios
            </Link>
            <Link href="/auth" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Acceso
            </Link>
          </div>

          <Button asChild className="rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Link href="/agenda">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Hora
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}