import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  // COMPLETAMENTE LIMPIO - Sin verificaciones de auth
  // Sin listeners - Sin nada que pueda interferir
  
  return (
    <ThemeProvider>
      <CompanyProvider>
        <Component {...pageProps} />
        <Toaster />
      </CompanyProvider>
    </ThemeProvider>
  );
}