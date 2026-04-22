import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-background to-muted border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-heading font-bold text-xl">PODOS PRO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistema podológico profesional para clínicas modernas
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sm mb-4">Enlaces</h3>
            <div className="space-y-2">
              <Link href="/#servicios" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Servicios
              </Link>
              <Link href="/#podologos" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Podólogos
              </Link>
              <Link href="/agenda" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Reservar
              </Link>
              <Link href="/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Acceso
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sm mb-4">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+56 9 1234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contacto@podospro.cl</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Santiago, Chile</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sm mb-4">Síguenos</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all hover-lift">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all hover-lift">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all hover-lift">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PODOS PRO. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}