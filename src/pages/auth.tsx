import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, Lock, User, Phone, ArrowRight, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function PublicAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    company_name: "",
    phone: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            full_name: registerForm.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Error al crear usuario");

      // Create company
      const slug = registerForm.company_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: registerForm.company_name,
          slug: slug,
          owner_id: authData.user.id,
          status: "active",
          phone: registerForm.phone,
          settings: {
            allow_patient_login: true,
            allow_public_registration: false,
          },
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from("company_users")
        .insert({
          company_id: company.id,
          user_id: authData.user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      toast({
        title: "¡Empresa creada exitosamente!",
        description: `Tu URL: /${slug}`,
      });

      router.push("/onboarding");
    } catch (error: any) {
      toast({
        title: "Error al crear empresa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEO
        title="Crear Empresa - PODOS PRO"
        description="Registra tu clínica podológica en PODOS PRO"
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block space-y-6">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Sistema Profesional SaaS
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Crea tu clínica en PODOS PRO
              </h1>
              <p className="text-lg text-muted-foreground">
                Sistema completo de gestión podológica. Agenda, fichas clínicas, portal de pacientes y más.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">URL Personalizada</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu propia página con tu marca: podospro.com/tu-clinica
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gestión Completa</h3>
                  <p className="text-sm text-muted-foreground">
                    Agenda, pacientes, cobros, fichas clínicas y reportes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Portal de Pacientes</h3>
                  <p className="text-sm text-muted-foreground">
                    Tus pacientes pueden agendar y ver su historial online
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Registra tu Clínica</h2>
              <p className="text-sm text-muted-foreground">
                Completa el formulario para comenzar
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  <User className="w-4 h-4 inline mr-1" />
                  Nombre Completo
                </Label>
                <Input
                  id="full_name"
                  placeholder="Dr. Juan Pérez"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tuclinica.cl"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Nombre de la Clínica
                </Label>
                <Input
                  id="company_name"
                  placeholder="Centro PodoSalud"
                  value={registerForm.company_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, company_name: e.target.value })}
                  required
                />
                {registerForm.company_name && (
                  <p className="text-xs text-muted-foreground">
                    Tu URL será: podospro.com/
                    {registerForm.company_name
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creando..." : "Crear Empresa"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Eres SuperAdmin?{" "}
                <Link
                  href="/superadmin/auth"
                  className="text-primary hover:underline font-medium"
                >
                  Acceder al sistema
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}