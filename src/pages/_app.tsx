import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        router.push('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [router.pathname]);

  const checkAuthAndRedirect = async () => {
    // Public routes that don't need auth check
    const publicRoutes = ['/', '/auth', '/terminos', '/privacidad'];
    const isDynamicPublicRoute = router.pathname.match(/^\/\[slug\]$/);
    
    if (publicRoutes.includes(router.pathname) || isDynamicPublicRoute) {
      setIsChecking(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated, redirect to login
      if (!publicRoutes.includes(router.pathname)) {
        router.push('/auth');
      }
      setIsChecking(false);
      return;
    }

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
        .single();

      if (companyUser) {
        const role = companyUser.role;
        
        // Check if user is in correct panel
        if ((role === "owner" || role === "admin") && !router.pathname.startsWith('/admin') && !router.pathname.startsWith('/configuracion') && !router.pathname.startsWith('/paciente')) {
          router.push('/admin');
        } else if ((role === "podiatrist" || role === "staff") && !router.pathname.startsWith('/podologo') && !router.pathname.startsWith('/configuracion') && !router.pathname.startsWith('/paciente')) {
          router.push('/podologo');
        }
      }
    }

    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
