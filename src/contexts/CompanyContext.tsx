<![CDATA[import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { companyService } from "@/services/companyService";
import type { Database } from "@/integrations/supabase/types";

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
      setIsLoading(true);
      const userCompanies = await companyService.getUserCompanies();
      setCompanies(userCompanies);

      // Si hay empresas y no hay una seleccionada, seleccionar la primera
      if (userCompanies.length > 0 && !currentCompany) {
        const savedCompanyId = localStorage.getItem("currentCompanyId");
        const companyToSelect =
          userCompanies.find((c) => c.id === savedCompanyId) ||
          userCompanies[0];
        await selectCompany(companyToSelect);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
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
</file_contents>
