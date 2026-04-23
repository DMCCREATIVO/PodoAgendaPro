<![CDATA[import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Company = Database["public"]["Tables"]["companies"]["Row"];
type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];
type CompanyUpdate = Database["public"]["Tables"]["companies"]["Update"];
type CompanyUser = Database["public"]["Tables"]["company_users"]["Row"];
type Plan = Database["public"]["Tables"]["plans"]["Row"];

/**
 * Company Service - Gestión de empresas (tenants)
 */
export const companyService = {
  /**
   * Obtener todas las empresas del usuario autenticado
   */
  async getUserCompanies(): Promise<Company[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("No authenticated");

    const { data, error } = await supabase
      .from("company_users")
      .select(`
        company_id,
        role,
        status,
        companies (*)
      `)
      .eq("user_id", session.session.user.id)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching user companies:", error);
      throw error;
    }

    return (data?.map((cu: any) => cu.companies) || []) as Company[];
  },

  /**
   * Obtener empresa por ID
   */
  async getCompanyById(companyId: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (error) {
      console.error("Error fetching company:", error);
      return null;
    }

    return data;
  },

  /**
   * Obtener empresa por slug
   */
  async getCompanyBySlug(slug: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching company by slug:", error);
      return null;
    }

    return data;
  },

  /**
   * Crear nueva empresa
   */
  async createCompany(company: CompanyInsert): Promise<Company> {
    const { data, error } = await supabase
      .from("companies")
      .insert(company)
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error);
      throw error;
    }

    return data;
  },

  /**
   * Actualizar empresa
   */
  async updateCompany(
    companyId: string,
    updates: CompanyUpdate
  ): Promise<Company> {
    const { data, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", companyId)
      .select()
      .single();

    if (error) {
      console.error("Error updating company:", error);
      throw error;
    }

    return data;
  },

  /**
   * Obtener rol del usuario en una empresa
   */
  async getUserRole(companyId: string): Promise<string | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return null;

    const { data, error } = await supabase
      .from("company_users")
      .select("role")
      .eq("company_id", companyId)
      .eq("user_id", session.session.user.id)
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return data?.role || null;
  },

  /**
   * Verificar si usuario tiene permiso específico
   */
  async hasPermission(
    companyId: string,
    module: string,
    action: string
  ): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return false;

    const { data, error } = await supabase
      .from("company_users")
      .select("role, permissions")
      .eq("company_id", companyId)
      .eq("user_id", session.session.user.id)
      .eq("status", "active")
      .single();

    if (error || !data) return false;

    // Owners y admins tienen todos los permisos
    if (data.role === "owner" || data.role === "admin") return true;

    // Verificar permisos granulares en JSONB
    const permissions = data.permissions as any;
    return permissions?.[module]?.includes(action) || false;
  },

  /**
   * Obtener usuarios de una empresa
   */
  async getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
    const { data, error } = await supabase
      .from("company_users")
      .select(`
        *,
        users:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching company users:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Invitar usuario a empresa
   */
  async inviteUser(
    companyId: string,
    email: string,
    role: "admin" | "employee" | "viewer"
  ): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) throw new Error("No authenticated");

    // Aquí se enviaría un email de invitación
    // Por ahora solo creamos el registro pending
    const { error } = await supabase.from("company_users").insert({
      company_id: companyId,
      user_id: session.session.user.id, // Temporal - debería ser el ID del usuario invitado
      role,
      status: "invited",
      invited_by: session.session.user.id,
      invited_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  },

  /**
   * Eliminar usuario de empresa
   */
  async removeUser(companyId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("company_users")
      .delete()
      .eq("company_id", companyId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing user:", error);
      throw error;
    }
  },

  /**
   * Obtener todos los planes disponibles
   */
  async getPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Obtener plan de una empresa
   */
  async getCompanyPlan(companyId: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from("companies")
      .select(`
        plan_id,
        plans (*)
      `)
      .eq("id", companyId)
      .single();

    if (error) {
      console.error("Error fetching company plan:", error);
      return null;
    }

    return (data as any)?.plans || null;
  },

  /**
   * Verificar si empresa puede usar módulo
   */
  async canUseModule(companyId: string, moduleKey: string): Promise<boolean> {
    const plan = await this.getCompanyPlan(companyId);
    if (!plan) return false;

    const features = plan.features as any;
    const modules = features?.modules || [];

    return modules.includes(moduleKey) || modules.includes("all");
  },

  /**
   * Verificar límites del plan
   */
  async checkLimit(
    companyId: string,
    limitKey: string,
    currentUsage: number
  ): Promise<{ allowed: boolean; limit: number; usage: number }> {
    const plan = await this.getCompanyPlan(companyId);
    if (!plan) {
      return { allowed: false, limit: 0, usage: currentUsage };
    }

    const limits = plan.limits as any;
    const limit = limits?.[limitKey] || 0;

    // -1 significa ilimitado
    if (limit === -1) {
      return { allowed: true, limit: -1, usage: currentUsage };
    }

    return {
      allowed: currentUsage < limit,
      limit,
      usage: currentUsage,
    };
  },
};
</file_contents>
