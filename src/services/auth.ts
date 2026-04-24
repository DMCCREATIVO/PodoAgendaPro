import { supabase } from "@/integrations/supabase/client";

// Tipos
export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: "superadmin" | "owner" | "admin" | "employee" | "patient";
  companyId?: string;
  isSuperadmin: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    try {
      console.log("🔐 Iniciando login para:", email);

      // 1. Buscar usuario por email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (userError || !user) {
        console.error("❌ Usuario no encontrado:", userError);
        return { success: false, error: "Credenciales incorrectas" };
      }

      console.log("✅ Usuario encontrado:", user);

      // 2. Si es superadmin
      if (user.is_superadmin) {
        const session: Session = {
          userId: user.id,
          email: user.email,
          fullName: user.full_name || "SuperAdmin",
          role: "superadmin",
          isSuperadmin: true,
        };
        
        localStorage.setItem("podoagenda_session", JSON.stringify(session));
        console.log("✅ Sesión SuperAdmin guardada:", session);
        return { success: true, session };
      }

      // 3. Buscar en company_users
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
        .single();

      if (cuError || !companyUser) {
        console.error("❌ Usuario sin empresa asignada:", cuError);
        return { success: false, error: "Usuario sin empresa asignada o inactivo" };
      }

      console.log("✅ Relación empresa encontrada:", companyUser);

      // 4. Crear sesión
      const session: Session = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name || email,
        role: companyUser.role as any,
        companyId: companyUser.company_id,
        isSuperadmin: false,
      };

      localStorage.setItem("podoagenda_session", JSON.stringify(session));
      console.log("✅ Sesión guardada:", session);
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
        console.log("⚠️ No hay sesión en localStorage");
        return null;
      }

      const session = JSON.parse(sessionData) as Session;
      console.log("✅ Sesión recuperada:", session);
      return session;
    } catch (error) {
      console.error("💥 Error parseando sesión:", error);
      localStorage.removeItem("podoagenda_session");
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem("podoagenda_session");
    console.log("✅ Sesión cerrada");
  },

  getDashboardRoute(): string {
    const session = this.getSession();
    if (!session) return "/login";
    
    if (session.isSuperadmin) return "/superadmin";
    if (session.role === "owner") return "/admin";
    if (session.role === "admin") return "/admin";
    if (session.role === "employee") return "/podologo";
    return "/cliente";
  },
};