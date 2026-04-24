import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, full_name, role, company_id, phone, is_superadmin } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email },
    });

    if (authError) {
      console.error("Error creando auth user:", authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 2. Crear perfil en tabla users
    const isSuperadmin = is_superadmin || role === "superadmin";
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email,
      full_name: full_name || email,
      role: role || "patient",
      company_id: isSuperadmin ? null : (company_id || null),
      is_superadmin: isSuperadmin,
      is_active: true,
      phone: phone || null,
    });

    if (profileError) {
      console.error("Error creando perfil:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: profileError.message });
    }

    // 3. Crear entrada en company_users para usuarios no-superadmin
    if (!isSuperadmin && company_id) {
      const { error: relError } = await supabaseAdmin.from("company_users").insert({
        company_id,
        user_id: userId,
        role: role || "employee",
        status: "active",
      });

      if (relError) {
        console.warn("Error creando company_users (no critico):", relError.message);
      }
    }

    return res.status(200).json({
      success: true,
      userId,
      email,
      role: role || "patient",
    });
  } catch (error: any) {
    console.error("Error en create-user:", error);
    return res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
}
