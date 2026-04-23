import { supabase } from "@/integrations/supabase/client";

/**
 * Servicio de autenticación SIMPLE - Sin Supabase Auth
 * Usa tabla users directamente con verificación de contraseña
 */

export interface LoginResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const authService = {
  /**
   * Login directo - Verifica email y retorna usuario
   * NO verifica contraseña aquí - solo valida que el usuario existe
   */
  async loginSimple(email: string, password: string): Promise<LoginResult> {
    try {
      // Verificar que el usuario existe en public.users
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (error || !user) {
        return {
          success: false,
          error: "Usuario no encontrado"
        };
      }

      // En desarrollo, aceptar cualquier contraseña para usuarios demo
      // En producción, aquí iría la verificación de bcrypt
      const validPasswords = ['Admin123!', 'admin123', 'password'];
      if (!validPasswords.includes(password)) {
        return {
          success: false,
          error: "Contraseña incorrecta"
        };
      }

      // Crear sesión falsa en localStorage para mantener el login
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userEmail', email);
      }

      return {
        success: true,
        user
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error en login"
      };
    }
  },

  /**
   * Obtener usuario actual desde localStorage
   */
  async getCurrentUser(): Promise<any | null> {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Logout - Limpiar localStorage
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userEmail');
    }
  },

  /**
   * Verificar si hay sesión activa
   */
  async hasSession(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
};