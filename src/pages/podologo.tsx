import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { PodiatristLayout } from "@/components/podiatrist/PodiatristLayout";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";

export default function PodiatristPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dia");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace("/auth");
        return;
      }

      if (!companyId) {
        toast({
          title: "Error",
          description: "No se pudo determinar la empresa",
          variant: "destructive",
        });
        router.replace("/auth");
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error("Error verificando auth:", err);
      router.replace("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <PodiatristLayout activeTab={activeTab}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel Podólogo</h1>
          <p className="text-muted-foreground mt-1">Mi día y atención clínica</p>
        </div>

        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">Panel Podólogo en construcción</p>
          <p className="text-sm text-muted-foreground mt-2">Conectado a empresa: {companyId}</p>
        </Card>
      </div>
    </PodiatristLayout>
  );
}