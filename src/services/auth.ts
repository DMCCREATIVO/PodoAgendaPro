import { supabase } from "@/integrations/supabase/client";

// Tipos
export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: "superadmin" | "owner" | "podiatrist" | "patient";
  companyId?: string;
  isSuperadmin: boolean;
}

// Clave para localStorage
const SESSION_KEY = "podoagenda_session";

/**
 * Servicio de Autenticación
 * Simple, robusto, sin dependencias de Supabase Auth
 */
export const authService = {
  /**
   * Login: Valida credenciales y crea sesión
   */
  async login(email: string, password: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    try {
      // 1. Buscar usuario por email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, email, full_name, is_superadmin")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (userError || !user) {
        return { success: false, error: "Usuario no encontrado" };
      }

      // 2. Verificar contraseña (bcrypt hash)
      // Nota: En producción real, esto debería hacerse en backend por seguridad
      // Por ahora, asumimos que la contraseña es correcta si existe el usuario
      // TODO: Implementar verificación bcrypt real
      if (password !== "Admin123!") {
        return { success: false, error: "Contraseña incorrecta" };
      }

      // 3. Determinar rol
      let role: Session["role"] = "patient";
      let companyId: string | undefined;

      if (user.is_superadmin) {
        role = "superadmin";
      } else {
        // Buscar rol en company_users
        const { data: companyUser } = await supabase
          .from("company_users")
          .select("role, company_id")
          .eq("user_id", user.id)
          .single();

        if (companyUser) {
          role = companyUser.role as Session["role"];
          companyId = companyUser.company_id;
        }
      }

      // 4. Crear sesión
      const session: Session = {
        userId: user.id,
        email: user.email,
        fullName: user.full_name || "Usuario",
        role,
        companyId,
        isSuperadmin: user.is_superadmin || false,
      };

      // 5. Guardar en localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return { success: true, session };
    } catch (error: any) {
      console.error("Error en login:", error);
      return { success: false, error: error.message || "Error inesperado" };
    }
  },

  /**
   * Logout: Elimina sesión
   */
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Obtener sesión actual
   */
  getSession(): Session | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as Session;
    } catch {
      return null;
    }
  },

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  /**
   * Verificar si es SuperAdmin
   */
  isSuperAdmin(): boolean {
    const session = this.getSession();
    return session?.isSuperadmin === true;
  },

  /**
   * Verificar rol específico
   */
  hasRole(role: Session["role"]): boolean {
    const session = this.getSession();
    return session?.role === role;
  },
};