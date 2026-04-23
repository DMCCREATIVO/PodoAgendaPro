import { ReactNode, useEffect, useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";

interface BrandedLayoutProps {
  children: ReactNode;
  applyBranding?: boolean;
}

export function BrandedLayout({ children, applyBranding = true }: BrandedLayoutProps) {
  const { currentCompany } = useCompany();
  const [brandingApplied, setBrandingApplied] = useState(false);

  useEffect(() => {
    if (!applyBranding || !currentCompany) {
      setBrandingApplied(false);
      return;
    }

    try {
      const metadata = currentCompany.metadata as any;
      const branding = metadata?.branding;

      if (branding) {
        const root = document.documentElement;
        
        // Apply primary color
        if (branding.primary_color) {
          const rgb = hexToRgb(branding.primary_color);
          if (rgb) {
            root.style.setProperty("--primary", `${rgb.r} ${rgb.g} ${rgb.b}`);
          }
        }

        // Apply secondary color (maps to accent)
        if (branding.secondary_color) {
          const rgb = hexToRgb(branding.secondary_color);
          if (rgb) {
            root.style.setProperty("--accent", `${rgb.r} ${rgb.g} ${rgb.b}`);
          }
        }

        // Apply favicon if provided
        if (branding.favicon_url) {
          updateFavicon(branding.favicon_url);
        }

        setBrandingApplied(true);
      }
    } catch (error) {
      console.error("Error applying branding:", error);
      setBrandingApplied(false);
    }
  }, [currentCompany, applyBranding]);

  return <>{children}</>;
}

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function updateFavicon(url: string) {
  const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
  (link as HTMLLinkElement).type = "image/x-icon";
  (link as HTMLLinkElement).rel = "shortcut icon";
  (link as HTMLLinkElement).href = url;
  document.getElementsByTagName("head")[0].appendChild(link);
}