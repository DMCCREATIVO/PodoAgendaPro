import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ClinicalNote = Database["public"]["Tables"]["clinical_notes"]["Row"];
type ClinicalNoteInsert = Database["public"]["Tables"]["clinical_notes"]["Insert"];
type ClientCondition = Database["public"]["Tables"]["client_conditions"]["Row"];
type ClientConditionInsert = Database["public"]["Tables"]["client_conditions"]["Insert"];

export const clinicalNotesService = {
  // Clinical Notes
  async getClientNotes(companyId: string, clientId: string) {
    const { data, error } = await supabase
      .from("clinical_notes")
      .select(`
        *,
        appointment:appointments(id, scheduled_at, status, service:services(name)),
        created_by_user:users!clinical_notes_created_by_fkey(id, full_name, email)
      `)
      .eq("company_id", companyId)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createNote(companyId: string, noteData: Omit<ClinicalNoteInsert, "company_id">) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("clinical_notes")
      .insert({
        company_id: companyId,
        created_by: userData?.user?.id,
        ...noteData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNote(companyId: string, noteId: string, updates: Partial<ClinicalNoteInsert>) {
    const { data, error } = await supabase
      .from("clinical_notes")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId)
      .eq("id", noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNote(companyId: string, noteId: string) {
    const { error } = await supabase
      .from("clinical_notes")
      .delete()
      .eq("company_id", companyId)
      .eq("id", noteId);

    if (error) throw error;
  },

  // Client Conditions
  async getClientConditions(companyId: string, clientId: string, activeOnly = true) {
    let query = supabase
      .from("client_conditions")
      .select("*")
      .eq("company_id", companyId)
      .eq("client_id", clientId)
      .order("severity", { ascending: false })
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async createCondition(companyId: string, conditionData: Omit<ClientConditionInsert, "company_id">) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("client_conditions")
      .insert({
        company_id: companyId,
        created_by: userData?.user?.id,
        ...conditionData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCondition(companyId: string, conditionId: string, updates: Partial<ClientConditionInsert>) {
    const { data, error } = await supabase
      .from("client_conditions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId)
      .eq("id", conditionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleConditionStatus(companyId: string, conditionId: string, isActive: boolean) {
    return this.updateCondition(companyId, conditionId, { is_active: isActive });
  },

  async deleteCondition(companyId: string, conditionId: string) {
    const { error } = await supabase
      .from("client_conditions")
      .delete()
      .eq("company_id", companyId)
      .eq("id", conditionId);

    if (error) throw error;
  },
};