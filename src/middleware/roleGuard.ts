import { supabase } from "@/integrations/supabase/client";

export type UserRole = "superadmin" | "owner" | "admin" | "podiatrist" | "staff" | "patient";

export const roleGuard = {
  async getCurrentUserRole(companyId?: string): Promise<UserRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check if superadmin
      const isSuperadmin = user.user_metadata?.is_superadmin === true;
      if (isSuperadmin) return "superadmin";

      // If no company context, return null
      if (!companyId) return null;

      // Get user's role in the company
      const { data: companyUser, error } = await supabase
        .from("company_users")
        .select("role")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error || !companyUser) return null;

      return companyUser.role as UserRole;
    } catch (error) {
      console.error("Error getting user role:", error);
      return null;
    }
  },

  async hasPermission(companyId: string, permission: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Superadmins have all permissions
      if (user.user_metadata?.is_superadmin === true) return true;

      const { data: companyUser, error } = await supabase
        .from("company_users")
        .select("permissions, role")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error || !companyUser) return false;

      // Owner and admin have all permissions
      if (companyUser.role === "owner" || companyUser.role === "admin") return true;

      // Check specific permission
      const permissions = companyUser.permissions as any;
      return permissions?.[permission] === true;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  },

  getDefaultRoute(role: UserRole): string {
    const routes: Record<UserRole, string> = {
      superadmin: "/superadmin",
      owner: "/admin",
      admin: "/admin",
      podiatrist: "/podologo",
      staff: "/podologo",
      patient: "/cliente",
    };
    return routes[role] || "/";
  },
};