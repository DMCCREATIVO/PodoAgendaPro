import { createContext, useContext, useState, ReactNode } from "react";
import type { Database } from "@/integrations/supabase/types";

type Company = Database["public"]["Tables"]["companies"]["Row"];

interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  isLoading: boolean;
  userRole: string | null;
  switchCompany: (companyId: string) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies] = useState<Company[]>([]);
  const [currentCompany] = useState<Company | null>(null);
  const [isLoading] = useState(false);
  const [userRole] = useState<string | null>(null);

  // COMPLETAMENTE DESACTIVADO - No hace nada
  // Esto evita que cause problemas en páginas públicas o SuperAdmin

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        setCurrentCompany: () => {},
        isLoading,
        userRole,
        switchCompany: () => {},
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}