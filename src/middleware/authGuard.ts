import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

type RequiredRole = "superadmin" | "admin" | "podiatrist" | "patient";

export function useAuthGuard(requiredRole?: RequiredRole) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Verificar sesión
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      // 2. Sin sesión → Login
      if (!session) {
        if (requiredRole === "superadmin") {
          router.replace("/superadmin/auth");
        } else {
          router.replace("/auth");
        }
        setLoading(false);
        setAuthorized(false);
        return;
      }

      // 3. Verificar si es SuperAdmin
      if (requiredRole === "superadmin") {
        const { data: userData } = await supabase
          .from("users")
          .select("is_superadmin")
          .eq("id", session.user.id)
          .single();

        if (!userData?.is_superadmin) {
          router.replace("/superadmin/auth");
          setLoading(false);
          setAuthorized(false);
          return;
        }

        setAuthorized(true);
        setLoading(false);
        return;
      }

      // 4. Si es SuperAdmin intentando acceder a rutas normales → redirigir
      const { data: userData } = await supabase
        .from("users")
        .select("is_superadmin")
        .eq("id", session.user.id)
        .single();

      if (userData?.is_superadmin) {
        router.replace("/superadmin");
        setLoading(false);
        setAuthorized(false);
        return;
      }

      // 5. Verificar rol en empresa
      const { data: companyUser } = await supabase
        .from("company_users")
        .select("role")
        .eq("user_id", session.user.id)
        .limit(1)
        .single();

      if (!companyUser) {
        router.replace("/auth");
        setLoading(false);
        setAuthorized(false);
        return;
      }

      // 6. Validar rol requerido
      if (requiredRole) {
        const roleMap: Record<RequiredRole, string[]> = {
          superadmin: [],
          admin: ["owner", "admin"],
          podiatrist: ["employee"],
          patient: ["viewer"],
        };

        const allowedRoles = roleMap[requiredRole];
        const userRole = companyUser.role;

        if (!allowedRoles.includes(userRole)) {
          // Redirigir al panel correcto según su rol
          if (userRole === "owner" || userRole === "admin") {
            router.replace("/admin");
          } else if (userRole === "employee") {
            router.replace("/podologo");
          } else if (userRole === "viewer") {
            router.replace("/cliente");
          }
          setLoading(false);
          setAuthorized(false);
          return;
        }
      }

      // 7. Autorizado
      setAuthorized(true);
      setLoading(false);

    } catch (error) {
      console.error("Error en authGuard:", error);
      router.replace("/auth");
      setLoading(false);
      setAuthorized(false);
    }
  };

  return { loading, authorized };
}