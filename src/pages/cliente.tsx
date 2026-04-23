import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { PatientLayout } from "@/components/patient/PatientLayout";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function PatientPortal() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");

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
    <PatientLayout activeTab={activeTab}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portal Paciente</h1>
          <p className="text-muted-foreground mt-1">Mis citas y historial</p>
        </div>

        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">Portal Paciente en construcción</p>
        </Card>
      </div>
    </PatientLayout>
  );
}