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
        // Small delay to ensure session is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log("==========================================");
        console.log("🛡️ AUTH GUARD - Verificando acceso");
        console.log("📍 Ruta:", router.pathname);
        console.log("🎯 Rol requerido:", requiredRole);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log("📥 Sesión:", session ? "✅ Existe" : "❌ No existe");

        if (sessionError) {
          console.error("❌ Error:", sessionError);
          throw sessionError;
        }

        if (!isActive) return;

        if (!session) {
          console.log("🚪 Sin sesión → Redirigiendo a login");
          if (requiredRole === "superadmin") {
            router.replace("/superadmin/auth");
          } else {
            router.replace("/auth");
          }
          setLoading(false);
          setAuthorized(false);
          return;
        }

        console.log("✅ Sesión activa");
        console.log("📧 Email:", session.user.email);
        console.log("📝 Metadata:", session.user.user_metadata);

        // Check SuperAdmin
        const isSuperadmin = 
          session.user.user_metadata?.is_superadmin === true || 
          session.user.user_metadata?.is_superadmin === "true";
          
        console.log("👑 Es SuperAdmin?", isSuperadmin);

        if (requiredRole === "superadmin") {
          if (!isSuperadmin) {
            console.log("❌ NO es SuperAdmin → Redirigiendo");
            router.replace("/superadmin/auth");
            setLoading(false);
            setAuthorized(false);
            return;
          }
          
          console.log("✅ SuperAdmin AUTORIZADO");
          console.log("==========================================");
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // If superadmin tries non-superadmin routes
        if (isSuperadmin && requiredRole !== "superadmin") {
          console.log("⚠️ SuperAdmin → Redirigiendo a /superadmin");
          router.replace("/superadmin");
          setLoading(false);
          setAuthorized(false);
          return;
        }

        // Regular user - check company membership
        const { data: companyUser } = await supabase
          .from("company_users")
          .select("role")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();

        if (!isActive) return;

        if (!companyUser) {
          console.log("❌ Sin empresa → Redirigiendo a /auth");
          router.replace("/auth");
          setLoading(false);
          setAuthorized(false);
          return;
        }

        console.log("✅ Empresa encontrada. Rol:", companyUser.role);

        // Check role
        if (requiredRole) {
          const allowedRoles: Record<string, string[]> = {
            admin: ["owner", "admin"],
            podiatrist: ["podiatrist", "staff"],
            patient: ["patient"],
          };

          const userRole = companyUser.role;
          const allowed = allowedRoles[requiredRole]?.includes(userRole);

          if (!allowed) {
            console.log(`❌ Rol ${userRole} no permitido → Redirigiendo`);
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

        console.log("✅ AUTORIZADO");
        console.log("==========================================");
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
  }, []); // Solo ejecutar UNA vez

  return { loading, authorized };
}