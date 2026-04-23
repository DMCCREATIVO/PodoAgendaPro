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
        console.log("==========================================");
        console.log("🛡️ AUTH GUARD - Verificando acceso");
        console.log("📍 Ruta actual:", router.pathname);
        console.log("🎯 Rol requerido:", requiredRole);
        console.log("==========================================");

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log("📥 Sesión obtenida:", { session: session ? "✅ Existe" : "❌ No existe", error: sessionError });

        if (sessionError) {
          console.error("❌ Error obteniendo sesión:", sessionError);
          throw sessionError;
        }

        if (!isActive) {
          console.log("⏹️ Componente desmontado, cancelando verificación");
          return;
        }

        if (!session) {
          console.log("❌ No hay sesión activa");
          console.log("🚪 Redirigiendo a login...");
          
          if (requiredRole === "superadmin") {
            console.log("👉 Destino: /superadmin/auth");
            router.replace("/superadmin/auth");
          } else {
            console.log("👉 Destino: /auth");
            router.replace("/auth");
          }
          setLoading(false);
          setAuthorized(false);
          return;
        }

        console.log("✅ Sesión activa encontrada");
        console.log("👤 User ID:", session.user.id);
        console.log("📧 Email:", session.user.email);
        console.log("📝 Metadata completo:", session.user.user_metadata);
        console.log("🔍 is_superadmin value:", session.user.user_metadata?.is_superadmin);
        console.log("🔍 Type:", typeof session.user.user_metadata?.is_superadmin);

        // Check SuperAdmin (handle both boolean and string "true")
        const isSuperadmin = 
          session.user.user_metadata?.is_superadmin === true || 
          session.user.user_metadata?.is_superadmin === "true";
          
        console.log("👑 Resultado verificación SuperAdmin:", isSuperadmin);

        if (requiredRole === "superadmin") {
          console.log("🎯 Verificando acceso a panel SuperAdmin...");
          
          if (!isSuperadmin) {
            console.log("❌ Usuario NO es SuperAdmin");
            console.log("🚪 Redirigiendo a /superadmin/auth");
            router.replace("/superadmin/auth");
            setLoading(false);
            setAuthorized(false);
            return;
          }
          
          console.log("✅ Usuario ES SuperAdmin");
          console.log("🎉 Acceso CONCEDIDO al panel SuperAdmin");
          setAuthorized(true);
          setLoading(false);
          console.log("==========================================");
          return;
        }

        // If superadmin tries to access non-superadmin routes
        if (isSuperadmin && requiredRole !== "superadmin") {
          console.log("⚠️ SuperAdmin intentando acceder a ruta no-superadmin");
          console.log("🚪 Redirigiendo a /superadmin");
          router.replace("/superadmin");
          setLoading(false);
          setAuthorized(false);
          return;
        }

        console.log("👥 Usuario regular - verificando membresía de empresa...");

        // Regular user - check company membership
        const { data: companyUser, error: companyError } = await supabase
          .from("company_users")
          .select("role")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();

        console.log("📥 Membresía de empresa:", { companyUser, companyError });

        if (companyError) {
          console.error("❌ Error verificando membresía:", companyError);
        }

        if (!isActive) return;

        if (!companyUser) {
          console.log("❌ Usuario sin empresa");
          console.log("🚪 Redirigiendo a /auth");
          router.replace("/auth");
          setLoading(false);
          setAuthorized(false);
          return;
        }

        console.log("✅ Usuario de empresa encontrado");
        console.log("🎭 Rol en empresa:", companyUser.role);

        // Check role matches
        if (requiredRole) {
          const allowedRoles: Record<string, string[]> = {
            admin: ["owner", "admin"],
            podiatrist: ["podiatrist", "staff"],
            patient: ["patient"],
          };

          const userRole = companyUser.role;
          const allowed = allowedRoles[requiredRole]?.includes(userRole);

          console.log("🔍 Verificando permiso:", {
            rolUsuario: userRole,
            rolRequerido: requiredRole,
            permitido: allowed,
          });

          if (!allowed) {
            console.log(`❌ Rol ${userRole} no tiene permiso para ${requiredRole}`);
            console.log("🚪 Redirigiendo a panel correcto...");
            
            // Redirect to correct panel
            if (userRole === "owner" || userRole === "admin") {
              console.log("👉 Destino: /admin");
              router.replace("/admin");
            } else if (userRole === "podiatrist" || userRole === "staff") {
              console.log("👉 Destino: /podologo");
              router.replace("/podologo");
            } else if (userRole === "patient") {
              console.log("👉 Destino: /cliente");
              router.replace("/cliente");
            }
            setLoading(false);
            setAuthorized(false);
            return;
          }
        }

        console.log("✅ Autorizado para acceder");
        console.log("==========================================");
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("💥 Error en authGuard:", error);
        console.log("==========================================");
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