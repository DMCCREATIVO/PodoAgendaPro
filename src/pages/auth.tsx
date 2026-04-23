import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function PublicAuth() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Intentar login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.session || !authData.user) {
        throw new Error("No se pudo establecer la sesión");
      }

      // 2. Verificar si es SuperAdmin (redirigir a su panel)
      const { data: userData } = await supabase
        .from("users")
        .select("is_superadmin")
        .eq("id", authData.user.id)
        .single();

      if (userData?.is_superadmin) {
        router.push("/superadmin");
        return;
      }

      // 3. Buscar su empresa y rol
      const { data: companyUser, error: companyError } = await supabase
        .from("company_users")
        .select("role, company_id")
        .eq("user_id", authData.user.id)
        .limit(1)
        .single();

      if (companyError || !companyUser) {
        await supabase.auth.signOut();
        throw new Error("No tienes acceso a ninguna empresa");
      }

      // 4. Redirigir según rol
      const role = companyUser.role;
      
      if (role === "owner" || role === "admin") {
        router.push("/admin");
      } else if (role === "employee") {
        router.push("/podologo");
      } else if (role === "viewer") {
        router.push("/cliente");
      } else {
        await supabase.auth.signOut();
        throw new Error("Rol de usuario no reconocido");
      }

      toast({
        title: "✅ Sesión iniciada",
        description: "Bienvenido de vuelta",
      });

    } catch (error: any) {
      toast({
        title: "❌ Error de acceso",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <SEO
        title="Acceso - PodoAgenda Pro"
        description="Inicia sesión en PodoAgenda Pro"
      />

      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PodoAgenda Pro
          </h1>
          <p className="text-muted-foreground">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 rounded-xl"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10 rounded-xl"
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verificando...</span>
              </div>
            ) : (
              <>
                Iniciar Sesión
                <LogIn className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
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
  );
}