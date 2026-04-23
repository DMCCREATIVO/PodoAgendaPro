import { supabase } from "@/integrations/supabase/client";

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { user: data.user };
  },

  async register(params: {
    email: string;
    password: string;
    full_name: string;
    company_name: string;
    phone?: string;
    plan_id: string; // This is actually the slug
  }) {
    const { email, password, full_name, company_name, phone, plan_id: planSlug } = params;

    // Get the actual plan UUID
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", planSlug)
      .single();
      
    if (planError) throw new Error("Plan inválido seleccionado");

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone: phone || null,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("No se pudo crear el usuario");

    // 2. Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: company_name,
        slug: company_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        plan_id: plan.id,
        status: "trial",
        plan_status: "trial",
        email: email,
        phone: phone || null,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // 3. Add user to company_users with owner role
    const { error: companyUserError } = await supabase
      .from("company_users")
      .insert({
        company_id: company.id,
        user_id: authData.user.id,
        role: "owner",
        permissions: {
          manage_users: true,
          manage_clients: true,
          manage_appointments: true,
          manage_services: true,
          manage_billing: true,
          view_reports: true,
          manage_settings: true,
        },
      });

    if (companyUserError) throw companyUserError;

    return { user: authData.user, company };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  // Helper to get redirect URL based on environment
  getRedirectUrl() {
    if (typeof window === "undefined") return "";
    
    const { protocol, host } = window.location;
    return `${protocol}//${host}/auth/callback`;
  },
};