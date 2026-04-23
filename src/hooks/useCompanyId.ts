import { useCompany } from "@/contexts/CompanyContext";

/**
 * Hook to get current company ID easily
 * Throws error if no company is selected
 */
export function useCompanyId(): string {
  const { currentCompany } = useCompany();
  
  if (!currentCompany) {
    // Instead of throwing, return an empty string to prevent crashes
    // on initial load or public pages. Protected pages will handle auth redirection.
    return "";
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