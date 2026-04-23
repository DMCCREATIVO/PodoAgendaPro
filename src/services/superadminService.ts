import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Company = Database["public"]["Tables"]["companies"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
type CompanyUser = Database["public"]["Tables"]["company_users"]["Row"];

export const superadminService = {
  // =====================================================
  // VERIFICATION
  // =====================================================
  async isSuperAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("users")
      .select("is_superadmin")
      .eq("id", user.id)
      .single();

    if (error || !data) return false;
    return data.is_superadmin || false;
  },

  // =====================================================
  // COMPANY MANAGEMENT
  // =====================================================
  async getAllCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCompanyStats(companyId: string) {
    const [users, clients, appointments] = await Promise.all([
      supabase.from("company_users").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      supabase.from("appointments").select("*", { count: "exact", head: true }).eq("company_id", companyId),
    ]);

    return {
      total_users: users.count || 0,
      total_clients: clients.count || 0,
      total_appointments: appointments.count || 0,
    };
  },

  async updateCompanyStatus(companyId: string, status: "active" | "suspended" | "trial" | "cancelled", reason?: string) {
    const updateData: any = { status };
    
    if (status === "suspended") {
      updateData.suspended_at = new Date().toISOString();
      updateData.suspended_reason = reason || null;
    } else {
      updateData.suspended_at = null;
      updateData.suspended_reason = null;
    }

    const { error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", companyId);

    if (error) throw error;

    // Log action
    await this.logAction("company_status_changed", companyId, { status, reason });
  },

  async updateCompanyPlan(companyId: string, planId: string) {
    const { error } = await supabase
      .from("companies")
      .update({ plan_id: planId })
      .eq("id", companyId);

    if (error) throw error;

    await this.logAction("plan_changed", companyId, { plan_id: planId });
  },

  async deleteCompany(companyId: string) {
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId);

    if (error) throw error;

    await this.logAction("company_deleted", companyId, {});
  },

  // =====================================================
  // USER MANAGEMENT
  // =====================================================
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserCompanies(userId: string) {
    const { data, error } = await supabase
      .from("company_users")
      .select("*, companies(*)")
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  },

  async makeSuperAdmin(userId: string) {
    const { error } = await supabase
      .from("users")
      .update({ is_superadmin: true })
      .eq("id", userId);

    if (error) throw error;

    await this.logAction("user_promoted_superadmin", null, { user_id: userId });
  },

  async removeSuperAdmin(userId: string) {
    const { error } = await supabase
      .from("users")
      .update({ is_superadmin: false })
      .eq("id", userId);

    if (error) throw error;

    await this.logAction("user_demoted_superadmin", null, { user_id: userId });
  },

  // =====================================================
  // SYSTEM SETTINGS
  // =====================================================
  async getSystemSettings() {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("key");

    if (error) throw error;
    return data || [];
  },

  async updateSystemSetting(key: string, value: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("system_settings")
      .update({ 
        value, 
        updated_by: user?.id,
        updated_at: new Date().toISOString() 
      })
      .eq("key", key);

    if (error) throw error;

    await this.logAction("system_setting_updated", null, { key, value });
  },

  // =====================================================
  // AUDIT LOG
  // =====================================================
  async logAction(actionType: string, targetCompanyId: string | null, metadata: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("superadmin_actions").insert({
      admin_id: user.id,
      action_type: actionType,
      target_company_id: targetCompanyId,
      metadata,
    });
  },

  async getAuditLog(limit = 100) {
    const { data, error } = await supabase
      .from("superadmin_actions")
      .select("*, users(full_name, email), companies(name)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // =====================================================
  // ANALYTICS
  // =====================================================
  async getSystemStats() {
    const [companies, users, appointments, clients] = await Promise.all([
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("clients").select("*", { count: "exact", head: true }),
    ]);

    // Active companies (status = 'active')
    const { count: activeCompanies } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Trial companies
    const { count: trialCompanies } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true })
      .eq("status", "trial");

    return {
      total_companies: companies.count || 0,
      active_companies: activeCompanies || 0,
      trial_companies: trialCompanies || 0,
      total_users: users.count || 0,
      total_appointments: appointments.count || 0,
      total_clients: clients.count || 0,
    };
  },
};