import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export const clientService = {
  /**
   * Get all clients for a company
   */
  async getClients(companyId: string, filters?: {
    status?: string;
    tags?: string[];
    assignedTo?: string;
    search?: string;
  }) {
    let query = supabase
      .from("clients")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.assignedTo) {
      query = query.eq("assigned_to", filters.assignedTo);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains("tags", filters.tags);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get client by ID
   */
  async getClientById(companyId: string, clientId: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", clientId)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get client by phone or email
   */
  async findClient(companyId: string, params: { phone?: string; email?: string }) {
    let query = supabase
      .from("clients")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (params.phone) {
      query = query.eq("phone", params.phone);
    } else if (params.email) {
      query = query.eq("email", params.email);
    } else {
      throw new Error("Phone or email required");
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create new client
   */
  async createClient(companyId: string, client: Omit<ClientInsert, "company_id">) {
    const { data: session } = await supabase.auth.getSession();
    
    const { data, error } = await supabase
      .from("clients")
      .insert({
        ...client,
        company_id: companyId,
        created_by: session.session?.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update client
   */
  async updateClient(
    companyId: string,
    clientId: string,
    updates: Partial<Omit<ClientUpdate, "company_id" | "id">>
  ) {
    const { data, error } = await supabase
      .from("clients")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId)
      .eq("id", clientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Soft delete client
   */
  async deleteClient(companyId: string, clientId: string) {
    const { error } = await supabase
      .from("clients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("id", clientId);

    if (error) throw error;
  },

  /**
   * Get client statistics
   */
  async getClientStats(companyId: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("status")
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter(c => c.status === "active").length,
      leads: data.filter(c => c.status === "lead").length,
      inactive: data.filter(c => c.status === "inactive").length,
    };

    return stats;
  },
};