import { supabase } from "@/integrations/supabase/client";

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
      console.log("🔐 [SIMPLE] Login:", email);

      // 1. Autenticar en Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        console.error("❌ Error auth:", authError);
        return { success: false, error: "Credenciales incorrectas" };
      }

      // 2. Buscar usuario - SIMPLE: todo en tabla users
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError || !user) {
        console.error("❌ Usuario no encontrado:", userError);
        return { success: false, error: "Usuario no configurado" };
      }

      console.log("✅ Usuario encontrado:", { email: user.email, role: user.role, company_id: user.company_id });

      // 3. SIMPLE: Crear sesión directamente desde users
      const session: Session = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name || email,
        role: (user.role as Session["role"]) || (user.is_superadmin ? "superadmin" : "patient"),
        companyId: user.company_id || undefined,
        isSuperadmin: user.is_superadmin || false,
      };

      localStorage.setItem("podoagenda_session", JSON.stringify(session));
      console.log("✅ Sesión guardada:", session);
      
      return { success: true, session };
    } catch (error: any) {
      console.error("💥 Error login:", error);
      return { success: false, error: error.message };
    }
  },

  getSession(): Session | null {
    try {
      const sessionData = localStorage.getItem("podoagenda_session");
      if (!sessionData) return null;
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
    
    if (session.isSuperadmin || session.role === "superadmin") return "/superadmin";
    if (session.role === "owner" || session.role === "admin") return "/admin";
    if (session.role === "employee") return "/podologo";
    return "/cliente";
  },
};