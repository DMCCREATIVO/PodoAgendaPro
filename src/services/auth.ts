import { supabase } from "@/integrations/supabase/client";

export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: "superadmin" | "owner" | "admin" | "employee" | "patient";
  companyId?: string;
  companyName?: string;
  isSuperadmin: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    try {
      // 1. Autenticar en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        const msg = authError?.message || "Credenciales incorrectas";
        if (msg.includes("Invalid login")) {
          return { success: false, error: "Email o contraseña incorrectos" };
        }
        return { success: false, error: msg };
      }

      // 2. Buscar perfil en tabla users
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*, companies(id, name, slug)")
        .eq("id", authData.user.id)
        .single();

      if (userError || !user) {
        // Si el usuario auth existe pero no tiene perfil, crear uno basico
        const { error: createError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: authData.user.email || email,
          full_name: authData.user.user_metadata?.full_name || email,
          role: "patient",
          is_superadmin: false,
          is_active: true,
        });

        if (createError) {
          return { success: false, error: "Error configurando usuario. Contacta al administrador." };
        }

        const session: Session = {
          userId: authData.user.id,
          email: email,
          fullName: authData.user.user_metadata?.full_name || email,
          role: "patient",
          isSuperadmin: false,
        };

        localStorage.setItem("podoagenda_session", JSON.stringify(session));
        return { success: true, session };
      }

      // 3. Crear sesion con datos completos
      const companyData = user.companies as any;
      const session: Session = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name || email,
        role: (user.role as Session["role"]) || (user.is_superadmin ? "superadmin" : "patient"),
        companyId: user.company_id || undefined,
        companyName: companyData?.name || undefined,
        isSuperadmin: user.is_superadmin || false,
      };

      // Actualizar last_login_at
      await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);

      localStorage.setItem("podoagenda_session", JSON.stringify(session));
      return { success: true, session };
    } catch (error: any) {
      return { success: false, error: "Error de conexión. Verifica tu internet e intenta de nuevo." };
    }
  },

  getSession(): Session | null {
    try {
      if (typeof window === "undefined") return null;
      const sessionData = localStorage.getItem("podoagenda_session");
      if (!sessionData) return null;
      return JSON.parse(sessionData) as Session;
    } catch (error) {
      localStorage.removeItem("podoagenda_session");
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    localStorage.removeItem("podoagenda_session");
  },

  getDashboardRoute(session?: Session | null): string {
    const s = session || this.getSession();
    if (!s) return "/login";

    if (s.isSuperadmin || s.role === "superadmin") return "/superadmin";
    if (s.role === "owner" || s.role === "admin") return "/admin";
    if (s.role === "employee") return "/podologo";
    return "/cliente";
  },

  // Crear usuario via API route (usa service_role key server-side)
  async createUser(data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    company_id?: string;
    phone?: string;
    is_superadmin?: boolean;
  }): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const res = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, error: result.error || "Error creando usuario" };
      }

      return { success: true, userId: result.userId };
    } catch (error: any) {
      return { success: false, error: error.message || "Error de conexión" };
    }
  },
};