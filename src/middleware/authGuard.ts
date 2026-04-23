import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (!session) {
          // Not authenticated - redirect to appropriate login
          if (requiredRole === "superadmin") {
            router.push("/superadmin/auth");
          } else {
            router.push("/auth");
          }
          setLoading(false);
          setAuthorized(false);
          return;
        }

        // Check SuperAdmin
        const isSuperadmin = session.user.user_metadata?.is_superadmin === true;

        if (requiredRole === "superadmin") {
          // Checking superadmin panel access
          if (!isSuperadmin) {
            router.push("/superadmin/auth");
            setLoading(false);
            setAuthorized(false);
            return;
          }
          // Is superadmin and accessing superadmin panel - AUTHORIZED
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // If superadmin tries to access non-superadmin routes, redirect to superadmin panel
        if (isSuperadmin && requiredRole !== "superadmin") {
          router.push("/superadmin");
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

        if (!isMounted) return;

        if (!companyUser) {
          router.push("/auth");
          setLoading(false);
          setAuthorized(false);
          return;
        }

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
            // Redirect to correct panel
            if (userRole === "owner" || userRole === "admin") {
              router.push("/admin");
            } else if (userRole === "podiatrist" || userRole === "staff") {
              router.push("/podologo");
            } else if (userRole === "patient") {
              router.push("/cliente");
            }
            setLoading(false);
            setAuthorized(false);
            return;
          }
        }

        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("Auth guard error:", error);
        if (isMounted) {
          router.push("/auth");
          setLoading(false);
          setAuthorized(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Solo ejecutar una vez al montar

  return { loading, authorized };
}