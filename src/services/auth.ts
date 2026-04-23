import { supabase } from "@/integrations/supabase/client";

// Tipos
export interface Session {
  userId: string;
  email: string;
  fullName: string;
  role: "superadmin" | "owner" | "employee" | "patient";
  companyId?: string;
  isSuperadmin: boolean;
}

// Clave para localStorage
const SESSION_KEY = "podoagenda_session";

/**
 * Servicio de Autenticación
 * Simple, robusto, directo contra tabla users
 */
export const authService = {
  /**
   * Login: Valida credenciales y crea sesión
   */
  async login(email: string, password: string): Promise<{ success: boolean; session?: Session; error?: string }> {
    try {
      const emailLowerCase = email.toLowerCase().trim();
      
      // DEBUG: Ver exactamente qué email estamos buscando
      console.log("🔍 LOGIN DEBUG:");
      console.log("Email original:", email);
      console.log("Email procesado:", emailLowerCase);
      console.log("Password length:", password.length);
      
      // 1. Buscar usuario por email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, email, full_name, is_superadmin")
        .eq("email", emailLowerCase)
        .single();

      console.log("Query result:", { user, userError });

      if (userError || !user) {
        console.error("❌ Usuario no encontrado:", userError);
        return { 
          success: false, 
          error: `Usuario no encontrado. Email buscado: ${emailLowerCase}` 
        };
      }

      console.log("✅ Usuario encontrado:", user.email);

      // 2. Verificar contraseña (por ahora, demo password)
      if (password !== "Admin123!") {
        console.error("❌ Contraseña incorrecta");
        return { 
          success: false, 
          error: "Contraseña incorrecta. Debe ser: Admin123!" 
        };
      }

      console.log("✅ Contraseña correcta");

      // 3. Determinar rol
      let role: Session["role"] = "patient";
      let companyId: string | undefined;

      if (user.is_superadmin) {
        role = "superadmin";
        console.log("✅ Usuario es SuperAdmin");
      } else {
        // Buscar rol en company_users
        const { data: companyUser } = await supabase
          .from("company_users")
          .select("role, company_id")
          .eq("user_id", user.id)
          .single();

        console.log("Company user data:", companyUser);

        if (companyUser) {
          role = companyUser.role as Session["role"];
          companyId = companyUser.company_id;
          console.log("✅ Rol encontrado:", role);
        } else {
          console.log("ℹ️ Usuario es paciente (sin company_users)");
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

      console.log("✅ Sesión creada:", session);

      // 5. Guardar en localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      console.log("✅ Sesión guardada en localStorage");

      return { success: true, session };
    } catch (error: any) {
      console.error("💥 Error inesperado en login:", error);
      return { success: false, error: error.message || "Error inesperado" };
    }
  },

  /**
   * Logout: Elimina sesión
   */
  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    console.log("✅ Sesión eliminada");
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