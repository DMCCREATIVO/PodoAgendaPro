import { useCompany } from "@/contexts/CompanyContext";

/**
 * Hook to get current company ID easily
 * Throws error if no company is selected
 */
export function useCompanyId(): string {
  const { currentCompany } = useCompany();
  
  if (!currentCompany) {
    throw new Error("No company selected. Ensure CompanyProvider wraps your component.");
  }
  
  return currentCompany.id;
}

/**
 * Hook to get current company ID safely
 * Returns null if no company is selected
 */
export function useCompanyIdSafe(): string | null {
  const { currentCompany } = useCompany();
  return currentCompany?.id || null;
}