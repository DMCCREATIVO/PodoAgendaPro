import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useCompanyId } from "@/hooks/useCompanyId";
import { companyService } from "@/services/companyService";
import { serviceService } from "@/services/serviceService";
import { 
  CheckCircle, ArrowRight, Building2, Stethoscope, 
  Settings, Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const router = useRouter();
  const { toast } = useToast();
  const companyId = useCompanyId();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Company Details
  const [companyData, setCompanyData] = useState({
    address: "",
    phone: "",
    website: "",
    description: "",
  });

  // Step 2: First Service
  const [serviceData, setServiceData] = useState({
    name: "Consulta Podológica",
    description: "Evaluación completa del pie",
    duration: 60,
    price: 25000,
  });

  // Step 3: Schedule
  const [scheduleData, setScheduleData] = useState({
    opening_hours: "Lunes a Viernes: 9:00 - 18:00\nSábado: 9:00 - 13:00",
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Update company with complete data
      const metadata = {
        description: companyData.description,
        opening_hours: scheduleData.opening_hours,
        onboarding_completed: true,
      };

      await companyService.updateCompany(companyId, {
        address: companyData.address,
        phone: companyData.phone,
        website: companyData.website,
        metadata,
      });

      // Create first service
      await serviceService.createService(companyId, {
        name: serviceData.name,
        description: serviceData.description,
        duration_minutes: serviceData.duration,
        price: serviceData.price,
        color: "#2563EB",
        is_active: true,
      });

      toast({
        title: "¡Configuración completada!",
        description: "Tu clínica está lista para comenzar",
      });

      router.push("/admin");
    } catch (error: any) {
      toast({
        title: "Error completando configuración",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = () => {
    if (currentStep === 1) {
      return companyData.address && companyData.phone;
    }
    if (currentStep === 2) {
      return serviceData.name && serviceData.price > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading font-bold text-3xl mb-2">
            Configura tu Clínica
          </h1>
          <p className="text-muted-foreground">
            Solo unos pasos para comenzar
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Paso {currentStep} de {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <Card className="p-8 soft-shadow border-0">
          {/* Step 1: Company Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl">Datos de tu Clínica</h2>
                  <p className="text-sm text-muted-foreground">Información básica</p>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  placeholder="Av. Providencia 1234, Santiago"
                  className="mt-2 rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                    className="mt-2 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={companyData.website}
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    placeholder="www.miclinica.com"
                    className="mt-2 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  placeholder="Describe brevemente tu clínica..."
                  className="mt-2 rounded-xl min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Step 2: First Service */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl">Primer Servicio</h2>
                  <p className="text-sm text-muted-foreground">Agrega tu servicio principal</p>
                </div>
              </div>

              <div>
                <Label htmlFor="service-name">Nombre del Servicio *</Label>
                <Input
                  id="service-name"
                  value={serviceData.name}
                  onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                  placeholder="Consulta Podológica"
                  className="mt-2 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="service-description">Descripción</Label>
                <Textarea
                  id="service-description"
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                  placeholder="Evaluación completa del pie..."
                  className="mt-2 rounded-xl min-h-[80px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duración (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={serviceData.duration}
                    onChange={(e) => setServiceData({ ...serviceData, duration: parseInt(e.target.value) || 60 })}
                    className="mt-2 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Precio (CLP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={serviceData.price}
                    onChange={(e) => setServiceData({ ...serviceData, price: parseInt(e.target.value) || 0 })}
                    className="mt-2 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl">Horarios de Atención</h2>
                  <p className="text-sm text-muted-foreground">Define tu disponibilidad</p>
                </div>
              </div>

              <div>
                <Label htmlFor="opening-hours">Horarios</Label>
                <Textarea
                  id="opening-hours"
                  value={scheduleData.opening_hours}
                  onChange={(e) => setScheduleData({ ...scheduleData, opening_hours: e.target.value })}
                  placeholder="Lunes a Viernes: 9:00 - 18:00"
                  className="mt-2 rounded-xl min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separa cada día en una línea nueva
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  ¡Casi listo!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Al finalizar podrás agregar más servicios, podólogos y personalizar tu clínica.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="rounded-xl"
              >
                Atrás
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={handleNext}
              disabled={!canContinue() || isLoading}
              className="rounded-xl shadow-lg shadow-primary/20"
            >
              {currentStep === totalSteps ? (
                isLoading ? "Finalizando..." : "Finalizar Configuración"
              ) : (
                "Continuar"
              )}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Saltar configuración (puedes hacerlo después)
          </button>
        </div>
      </div>
    </div>
  );
}