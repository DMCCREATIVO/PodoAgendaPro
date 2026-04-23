import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const checkingRef = useRef(false);

  useEffect(() => {
    // Only check auth once on mount
    if (!checkingRef.current) {
      checkingRef.current = true;
      checkAuthAndRedirect();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        // Redirect based on role after sign in
        await redirectBasedOnRole(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectBasedOnRole = async (user: any) => {
    const isSuperadmin = user.user_metadata?.is_superadmin === true;

    if (isSuperadmin) {
      if (!router.pathname.startsWith('/superadmin')) {
        router.push('/superadmin');
      }
      return;
    }

    // Regular user - check company membership
    const { data: companyUser } = await supabase
      .from("company_users")
      .select("role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (companyUser) {
      const role = companyUser.role;
      
      if ((role === "owner" || role === "admin") && !router.pathname.startsWith('/admin') && !router.pathname.startsWith('/configuracion') && !router.pathname.startsWith('/paciente') && !router.pathname.startsWith('/onboarding')) {
        router.push('/admin');
      } else if ((role === "podiatrist" || role === "staff") && !router.pathname.startsWith('/podologo') && !router.pathname.startsWith('/configuracion') && !router.pathname.startsWith('/paciente')) {
        router.push('/podologo');
      } else if (role === "patient" && !router.pathname.startsWith('/cliente') && !router.pathname.startsWith('/configuracion')) {
        router.push('/cliente');
      }
    }
  };

  const checkAuthAndRedirect = async () => {
    try {
      // Public routes that don't need auth check
      const publicRoutes = ['/', '/auth', '/terminos', '/privacidad', '/onboarding'];
      const isDynamicPublicRoute = router.pathname.match(/^\/\[slug\](\/.*)?$/);
      
      // Allow access to public routes
      if (publicRoutes.includes(router.pathname) || isDynamicPublicRoute) {
        setIsChecking(false);
        checkingRef.current = false;
        return;
      }

      // Use getSession instead of getUser to avoid lock issues
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        // Not authenticated, redirect to login
        router.push('/auth');
        setIsChecking(false);
        checkingRef.current = false;
        return;
      }

      const user = session.user;

      // User is authenticated, check role and correct panel
      const isSuperadmin = user.user_metadata?.is_superadmin === true;

      if (isSuperadmin) {
        // SuperAdmin should only access /superadmin
        if (!router.pathname.startsWith('/superadmin')) {
          router.push('/superadmin');
        }
      } else {
        // Regular user - check company membership
        const { data: companyUser } = await supabase
          .from("company_users")
          .select("role")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (!companyUser) {
          // No company found - might be during onboarding
          if (router.pathname !== '/onboarding') {
            router.push('/onboarding');
          }
          setIsChecking(false);
          checkingRef.current = false;
          return;
        }

        const role = companyUser.role;
        
        // Define allowed routes per role
        const allowedRoutes: Record<string, string[]> = {
          owner: ['/admin', '/configuracion', '/paciente', '/onboarding'],
          admin: ['/admin', '/configuracion', '/paciente', '/onboarding'],
          podiatrist: ['/podologo', '/configuracion', '/paciente'],
          staff: ['/podologo', '/configuracion', '/paciente'],
          patient: ['/cliente', '/configuracion'],
        };

        const userAllowedRoutes = allowedRoutes[role] || [];
        const isInAllowedRoute = userAllowedRoutes.some(route => router.pathname.startsWith(route));

        if (isInAllowedRoute) {
          // Already in correct place
          setIsChecking(false);
          checkingRef.current = false;
          return;
        }

        // Redirect to default panel for role
        if (role === "owner" || role === "admin") {
          router.push('/admin');
        } else if (role === "podiatrist" || role === "staff") {
          router.push('/podologo');
        } else if (role === "patient") {
          router.push('/cliente');
        } else {
          router.push('/auth');
        }
      }

      setIsChecking(false);
      checkingRef.current = false;
    } catch (error) {
      console.error("Auth check error:", error);
      setIsChecking(false);
      checkingRef.current = false;
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <CompanyProvider>
        <Component {...pageProps} />
        <Toaster />
      </CompanyProvider>
    </ThemeProvider>
  );
}