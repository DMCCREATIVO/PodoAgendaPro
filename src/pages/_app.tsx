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
    const publicRoutes = ['/', '/auth', '/terminos', '/privacidad', '/onboarding'];
    const isDynamicPublicRoute = router.pathname.match(/^\/\[slug\](\/.*)?$/);
    
    // Allow access to public routes
    if (publicRoutes.includes(router.pathname) || isDynamicPublicRoute) {
      setIsChecking(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated, redirect to login
      router.push('/auth');
      setIsChecking(false);
      return;
    }

    // User is authenticated - check their role and ensure correct panel
    const isSuperadmin = user.user_metadata?.is_superadmin === true;

    if (isSuperadmin) {
      // SuperAdmin - only allow /superadmin routes
      if (router.pathname.startsWith('/superadmin')) {
        // Already in correct place
        setIsChecking(false);
        return;
      } else {
        // Redirect to superadmin panel
        router.push('/superadmin');
        setIsChecking(false);
        return;
      }
    }

    // Regular user - check company membership
    const { data: companyUser } = await supabase
      .from("company_users")
      .select("role")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!companyUser) {
      // No company found - redirect to auth
      router.push('/auth');
      setIsChecking(false);
      return;
    }

    const role = companyUser.role;
    
    // Define allowed routes per role
    const allowedRoutes: Record<string, string[]> = {
      owner: ['/admin', '/configuracion', '/paciente'],
      admin: ['/admin', '/configuracion', '/paciente'],
      podiatrist: ['/podologo', '/configuracion', '/paciente'],
      staff: ['/podologo', '/configuracion', '/paciente'],
      patient: ['/cliente', '/configuracion'],
    };

    const userAllowedRoutes = allowedRoutes[role] || [];
    const isInAllowedRoute = userAllowedRoutes.some(route => router.pathname.startsWith(route));

    if (isInAllowedRoute) {
      // Already in correct place
      setIsChecking(false);
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

    setIsChecking(false);
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
