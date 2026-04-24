import { supabase } from "@/integrations/supabase/client";

// Tipos
export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: "superadmin" | "owner" | "admin" | "employee" | "patient" | "sin_asignar";
  companyId?: string;
  isSuperadmin: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    try {
      console.log("🔐 Iniciando login para:", email);

      // 1. Iniciar sesión REAL en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        console.error("❌ Error de autenticación Supabase:", authError);
        return { success: false, error: "Credenciales incorrectas" };
      }

      // 2. Buscar usuario por ID
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError || !user) {
        console.error("❌ Usuario no encontrado en la BD:", userError);
        return { success: false, error: "Usuario no configurado correctamente" };
      }

      console.log("✅ Usuario encontrado:", user);

      // 3. Si es superadmin
      if (user.is_superadmin) {
        const session: Session = {
          userId: user.id,
          email: user.email,
          fullName: user.full_name || "SuperAdmin",
          role: "superadmin",
          isSuperadmin: true,
        };
        
        localStorage.setItem("podoagenda_session", JSON.stringify(session));
        return { success: true, session };
      }

      // 4. Buscar en company_users
      const { data: companyUser, error: cuError } = await supabase
        .from("company_users")
        .select(`
          role,
          company_id,
          status,
          companies (
            id,
            name,
            slug
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (companyUser) {
        const session: Session = {
          userId: user.id,
          email: user.email,
          fullName: user.full_name || email,
          role: companyUser.role as any,
          companyId: companyUser.company_id,
          isSuperadmin: false,
        };

        localStorage.setItem("podoagenda_session", JSON.stringify(session));
        return { success: true, session };
      }

      // 5. Si es paciente o sin asignar
      const session: Session = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name || email,
        role: "sin_asignar",
        isSuperadmin: false,
      };

      localStorage.setItem("podoagenda_session", JSON.stringify(session));
      return { success: true, session };

    } catch (error: any) {
      console.error("💥 Error en login:", error);
      return { success: false, error: error.message };
    }
  },

  getSession(): Session | null {
    try {
      const sessionData = localStorage.getItem("podoagenda_session");
      if (!sessionData) {
        return null;
      }
      return JSON.parse(sessionData) as Session;
    } catch (error) {
      localStorage.removeItem("podoagenda_session");
      return null;
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem("podoagenda_session");
    console.log("✅ Sesión cerrada");
  },

  getDashboardRoute(): string {
    const session = this.getSession();
    if (!session) return "/login";
    
    if (session.isSuperadmin) return "/superadmin";
    if (session.role === "owner" || session.role === "admin") return "/admin";
    if (session.role === "employee") return "/podologo";
    return "/cliente";
  },
};