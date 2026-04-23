import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { companyService } from "@/services/companyService";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Company = Database["public"]["Tables"]["companies"]["Row"];

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  switchCompany: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
  userRole: string | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Cargar empresas del usuario
  const loadCompanies = async () => {
    try {
      // First check if there's an active session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No session - don't load companies
        setCompanies([]);
        setCurrentCompany(null);
        setIsLoading(false);
        return;
      }

      const companies = await companyService.getUserCompanies();
      setCompanies(companies);

      // Set current company from localStorage or first available
      const stored = localStorage.getItem("currentCompanyId");
      if (stored) {
        const found = companies.find((c) => c.id === stored);
        if (found) {
          setCurrentCompany(found);
          return;
        }
      }

      // Default to first company if available
      if (companies.length > 0) {
        setCurrentCompany(companies[0]);
        localStorage.setItem("currentCompanyId", companies[0].id);
      }
    } catch (error) {
      // Silently handle errors - don't throw on public pages
      console.log("CompanyContext: No companies loaded (public page or no session)");
      setCompanies([]);
      setCurrentCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar empresa actual
  const selectCompany = async (company: Company) => {
    setCurrentCompany(company);
    localStorage.setItem("currentCompanyId", company.id);

    // Cargar rol del usuario en esta empresa
    const role = await companyService.getUserRole(company.id);
    setUserRole(role);
  };

  // Cambiar de empresa
  const switchCompany = async (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      await selectCompany(company);
      // Recargar la página actual para refrescar datos
      router.reload();
    }
  };

  // Refrescar lista de empresas
  const refreshCompanies = async () => {
    await loadCompanies();
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        isLoading,
        switchCompany,
        refreshCompanies,
        userRole,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within CompanyProvider");
  }
  return context;
}