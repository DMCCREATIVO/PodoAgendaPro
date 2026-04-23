import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export function useAuthGuard(requiredRole?: "superadmin" | "owner" | "admin" | "podiatrist" | "patient") {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [router.pathname]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Not authenticated
        const publicRoutes = ["/", "/auth", "/superadmin/auth", "/terminos", "/privacidad"];
        const isDynamicPublic = router.pathname.match(/^\/\[slug\]/);

        if (!publicRoutes.includes(router.pathname) && !isDynamicPublic) {
          router.push("/auth");
        }
        setLoading(false);
        return;
      }

      // Check SuperAdmin
      const isSuperadmin = session.user.user_metadata?.is_superadmin === true;

      if (requiredRole === "superadmin") {
        if (!isSuperadmin) {
          router.push("/auth");
          setLoading(false);
          return;
        }
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // If superadmin tries to access non-superadmin routes
      if (isSuperadmin && requiredRole !== "superadmin") {
        router.push("/superadmin");
        setLoading(false);
        return;
      }

      // Check company role
      const { data: companyUser } = await supabase
        .from("company_users")
        .select("role")
        .eq("user_id", session.user.id)
        .limit(1)
        .single();

      if (!companyUser) {
        router.push("/auth");
        setLoading(false);
        return;
      }

      // Validate role
      if (requiredRole) {
        const roleHierarchy: Record<string, string[]> = {
          owner: ["owner", "admin"],
          admin: ["owner", "admin"],
          podiatrist: ["podiatrist", "staff"],
          patient: ["patient"],
        };

        const allowedRoles = roleHierarchy[requiredRole] || [requiredRole];
        if (!allowedRoles.includes(companyUser.role)) {
          // Redirect to appropriate panel
          if (companyUser.role === "owner" || companyUser.role === "admin") {
            router.push("/admin");
          } else if (companyUser.role === "podiatrist" || companyUser.role === "staff") {
            router.push("/podologo");
          } else if (companyUser.role === "patient") {
            router.push("/cliente");
          }
          setLoading(false);
          return;
        }
      }

      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth");
      setLoading(false);
    }
  };

  return { loading, authorized };
}