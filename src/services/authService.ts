import { supabase } from "@/integrations/supabase/client";
import { companyService } from "./companyService";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];
type CompanyInsert = Database["public"]["Tables"]["companies"]["Insert"];

/**
 * Auth Service - Multi-tenant authentication
 */
export const authService = {
  /**
   * Sign up new user with company creation
   */
  async signUpWithCompany(
    email: string,
    password: string,
    fullName: string,
    companyName: string
  ): Promise<{ user: User; companyId: string }> {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Error creating user");
    }

    // 2. Create user record in public.users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
      })
      .select()
      .single();

    if (userError) {
      throw new Error("Error creating user record: " + userError.message);
    }

    // 3. Create company with trial plan
    const { data: trialPlan } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", "starter")
      .single();

    const companySlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        slug: companySlug,
        plan_id: trialPlan?.id,
        plan_status: "trial",
        trial_ends_at: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(), // 14 days trial
      })
      .select()
      .single();

    if (companyError) {
      throw new Error("Error creating company: " + companyError.message);
    }

    // 4. Create company_user relationship (owner)
    const { error: companyUserError } = await supabase
      .from("company_users")
      .insert({
        company_id: company.id,
        user_id: authData.user.id,
        role: "owner",
        status: "active",
      });

    if (companyUserError) {
      throw new Error(
        "Error linking user to company: " + companyUserError.message
      );
    }

    // 5. Activate core modules
    const { data: coreModules } = await supabase
      .from("modules")
      .select("id")
      .in("key", ["crm", "agenda", "settings"]);

    if (coreModules && coreModules.length > 0) {
      const moduleInserts = coreModules.map((module) => ({
        company_id: company.id,
        module_id: module.id,
        is_active: true,
        activated_at: new Date().toISOString(),
      }));

      await supabase.from("company_modules").insert(moduleInserts);
    }

    return { user: userData, companyId: company.id };
  },

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return data.session;
  },

  /**
   * Create demo company for existing user
   */
  async createDemoCompany(userId: string): Promise<string> {
    // Get trial plan
    const { data: trialPlan } = await supabase
      .from("plans")
      .select("id")
      .eq("slug", "starter")
      .single();

    // Create demo company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: "Clínica Demo",
        slug: `demo-${userId.slice(0, 8)}`,
        plan_id: trialPlan?.id,
        plan_status: "trial",
        trial_ends_at: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .select()
      .single();

    if (companyError) {
      throw new Error("Error creating demo company: " + companyError.message);
    }

    // Link user as owner
    const { error: linkError } = await supabase.from("company_users").insert({
      company_id: company.id,
      user_id: userId,
      role: "owner",
      status: "active",
    });

    if (linkError) {
      throw new Error("Error linking user: " + linkError.message);
    }

    // Activate core modules
    const { data: coreModules } = await supabase
      .from("modules")
      .select("id")
      .in("key", ["crm", "agenda", "settings"]);

    if (coreModules && coreModules.length > 0) {
      const moduleInserts = coreModules.map((module) => ({
        company_id: company.id,
        module_id: module.id,
        is_active: true,
        activated_at: new Date().toISOString(),
      }));

      await supabase.from("company_modules").insert(moduleInserts);
    }

    return company.id;
  },
};