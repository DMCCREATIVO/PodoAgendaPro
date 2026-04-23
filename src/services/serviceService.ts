import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];
type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

export const serviceService = {
  /**
   * Get all services for a company
   */
  async getServices(companyId: string, activeOnly: boolean = false) {
    let query = supabase
      .from("services")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get service by ID
   */
  async getServiceById(companyId: string, serviceId: string) {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", serviceId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new service
   */
  async createService(companyId: string, service: Omit<ServiceInsert, "company_id">) {
    const { data, error } = await supabase
      .from("services")
      .insert({
        ...service,
        company_id: companyId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update service
   */
  async updateService(
    companyId: string,
    serviceId: string,
    updates: Partial<Omit<ServiceUpdate, "company_id" | "id">>
  ) {
    const { data, error } = await supabase
      .from("services")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId)
      .eq("id", serviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete service (hard delete)
   */
  async deleteService(companyId: string, serviceId: string) {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("company_id", companyId)
      .eq("id", serviceId);

    if (error) throw error;
  },

  /**
   * Toggle service active status
   */
  async toggleServiceStatus(companyId: string, serviceId: string, isActive: boolean) {
    return this.updateService(companyId, serviceId, { is_active: isActive });
  },
};