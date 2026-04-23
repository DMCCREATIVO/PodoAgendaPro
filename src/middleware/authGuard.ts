import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isActive = true;

    const checkAuth = async () => {
      try {
        console.log(`🔍 AuthGuard: Verificando acceso para rol "${requiredRole}"...`);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("❌ Error obteniendo sesión:", sessionError);
          throw sessionError;
        }

        if (!isActive) return;

        if (!session) {
          console.log("❌ No hay sesión activa, redirigiendo...");
          if (requiredRole === "superadmin") {
            router.replace("/superadmin/auth");
          } else {
            router.replace("/auth");
          }
          setLoading(false);
          setAuthorized(false);
          return;
        }

        console.log("✅ Sesión activa:", session.user.email);
        console.log("👤 User metadata:", session.user.user_metadata);

        // Check SuperAdmin (handle both boolean and string "true")
        const isSuperadmin = 
          session.user.user_metadata?.is_superadmin === true || 
          session.user.user_metadata?.is_superadmin === "true";
          
        console.log("👑 Es SuperAdmin?", isSuperadmin);

        if (requiredRole === "superadmin") {
          if (!isSuperadmin) {
            console.log("❌ Usuario no es SuperAdmin, redirigiendo...");
            router.replace("/superadmin/auth");
            setLoading(false);
            setAuthorized(false);
            return;
          }
          console.log("✅ SuperAdmin verificado, acceso concedido");
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // If superadmin tries to access non-superadmin routes
        if (isSuperadmin && requiredRole !== "superadmin") {
          console.log("⚠️ SuperAdmin intentando acceder a panel normal, redirigiendo a /superadmin");
          router.replace("/superadmin");
          setLoading(false);
          setAuthorized(false);
          return;
        }

        // Regular user - check company membership
        const { data: companyUser, error: companyError } = await supabase
          .from("company_users")
          .select("role")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();

        if (companyError) {
          console.error("❌ Error verificando membresía:", companyError);
        }

        if (!isActive) return;

        if (!companyUser) {
          console.log("❌ Usuario sin empresa, redirigiendo a /auth");
          router.replace("/auth");
          setLoading(false);
          setAuthorized(false);
          return;
        }

        console.log("✅ Usuario de empresa con rol:", companyUser.role);

        // Check role matches
        if (requiredRole) {
          const allowedRoles: Record<string, string[]> = {
            admin: ["owner", "admin"],
            podiatrist: ["podiatrist", "staff"],
            patient: ["patient"],
          };

          const userRole = companyUser.role;
          const allowed = allowedRoles[requiredRole]?.includes(userRole);

          if (!allowed) {
            console.log(`❌ Rol ${userRole} no tiene permiso para ${requiredRole}`);
            // Redirect to correct panel
            if (userRole === "owner" || userRole === "admin") {
              router.replace("/admin");
            } else if (userRole === "podiatrist" || userRole === "staff") {
              router.replace("/podologo");
            } else if (userRole === "patient") {
              router.replace("/cliente");
            }
            setLoading(false);
            setAuthorized(false);
            return;
          }
        }

        console.log("✅ Autorizado para acceder");
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("💥 Error en authGuard:", error);
        if (isActive) {
          router.replace("/auth");
          setLoading(false);
          setAuthorized(false);
        }
      }
    };

    checkAuth();

    return () => {
      isActive = false;
    };
  }, []);

  return { loading, authorized };
}