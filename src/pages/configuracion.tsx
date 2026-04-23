import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  User, Building2, Mail, Phone, MapPin, Globe, Clock, 
  Save, Upload, AlertCircle, CheckCircle, Settings, Shield,
  Calendar, Users, CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Configuracion() {
  const router = useRouter();
  const { toast } = useToast();
  const companyId = useCompanyId();
  const activeTab = (router.query.tab as string) || "perfil";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    website: "",
    opening_hours: "",
    logo_url: "",
  });

  const [brandingForm, setBrandingForm] = useState({
    primary_color: "#2563EB",
    secondary_color: "#22C55E",
    accent_color: "#F59E0B",
    logo_url: "",
    favicon_url: "",
    custom_domain: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    booking_enabled: true,
    requires_approval: false,
    auto_reminders: true,
    allow_cancellations: true,
    cancellation_hours: 2,
  });

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/auth");
        return;
      }

      setProfileForm({
        full_name: authUser.user_metadata?.full_name || "",
        email: authUser.email || "",
        phone: authUser.user_metadata?.phone || "",
        avatar_url: authUser.user_metadata?.avatar_url || "",
      });

      // Load company data
      if (companyId) {
        const companyData = await companyService.getCompanyById(companyId);
        setCompany(companyData);
        
        const metadata = (companyData.metadata as any) || {};
        const branding = metadata.branding || {};
        const settings = metadata.settings || {};
        
        setCompanyForm({
          name: companyData.name || "",
          description: metadata.description || "",
          email: companyData.email || "",
          phone: companyData.phone || "",
          whatsapp: metadata.whatsapp || "",
          address: companyData.address || "",
          city: metadata.city || "",
          website: companyData.website || "",
          opening_hours: metadata.opening_hours || "",
          logo_url: companyData.logo_url || "",
        });

        setBrandingForm({
          primary_color: branding.primary_color || "#2563EB",
          secondary_color: branding.secondary_color || "#22C55E",
          accent_color: branding.accent_color || "#F59E0B",
          logo_url: branding.logo_url || companyData.logo_url || "",
          favicon_url: branding.favicon_url || "",
          custom_domain: branding.custom_domain || "",
        });

        setSettingsForm({
          booking_enabled: settings.booking_enabled ?? true,
          requires_approval: settings.requires_approval ?? false,
          auto_reminders: settings.auto_reminders ?? true,
          allow_cancellations: settings.allow_cancellations ?? true,
          cancellation_hours: settings.cancellation_hours || 2,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error cargando configuración",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("No autenticado");

      // We'll use supabase.auth.updateUser for email and user_metadata for other info
      // since the public.users table might not be directly updatable via client without specific RLS,
      // or might not have avatar_url. It's safer to update user_metadata.
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          avatar_url: profileForm.avatar_url,
        }
      });
      
      if (updateError) throw updateError;

      // Update email if changed
      if (profileForm.email !== authUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email,
        });
        
        if (emailError) throw emailError;
        
        toast({
          title: "Verifica tu nuevo email",
          description: "Te hemos enviado un correo de confirmación",
        });
      } else {
        toast({
          title: "Perfil actualizado",
          description: "Tus datos han sido guardados exitosamente",
        });
      }

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error guardando perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyId) return;
    
    setIsSaving(true);
    try {
      const metadata = (company?.metadata as any) || {};
      
      await companyService.updateCompany(companyId, {
        name: companyForm.name,
        email: companyForm.email,
        phone: companyForm.phone,
        address: companyForm.address,
        website: companyForm.website,
        logo_url: companyForm.logo_url,
        metadata: {
          ...metadata,
          description: companyForm.description,
          whatsapp: companyForm.whatsapp,
          city: companyForm.city,
          opening_hours: companyForm.opening_hours,
        }
      });
      
      toast({
        title: "Empresa actualizada",
        description: "Los datos de la empresa han sido guardados exitosamente",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error guardando empresa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!companyId) return;
    
    setIsSaving(true);
    try {
      const metadata = (company?.metadata as any) || {};
      
      await companyService.updateCompany(companyId, {
        logo_url: brandingForm.logo_url,
        metadata: {
          ...metadata,
          branding: brandingForm,
        }
      });
      
      toast({
        title: "Branding actualizado",
        description: "Los colores y diseño de tu clínica han sido guardados",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error guardando branding",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!companyId) return;
    
    setIsSaving(true);
    try {
      const metadata = (company?.metadata as any) || {};
      
      await companyService.updateCompany(companyId, {
        metadata: {
          ...metadata,
          settings: settingsForm,
        }
      });
      
      toast({
        title: "Configuración guardada",
        description: "Las preferencias de tu clínica han sido actualizadas",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error guardando configuración",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("No autenticado");

      // Upload to Supabase Storage (you would need to set up a bucket)
      // For now, we'll just show a placeholder
      toast({
        title: "Función próximamente",
        description: "La carga de imágenes estará disponible pronto",
      });
    } catch (error: any) {
      toast({
        title: "Error subiendo imagen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Supabase Storage (you would need to set up a bucket)
      // For now, we'll just show a placeholder
      toast({
        title: "Función próximamente",
        description: "La carga de logos estará disponible pronto",
      });
    } catch (error: any) {
      toast({
        title: "Error subiendo logo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout activeTab="configuracion">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Cargando configuración...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="configuracion">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-3xl mb-2">Configuración</h1>
          <p className="text-muted-foreground">Gestiona tu perfil, empresa y preferencias</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => router.push(`?tab=${value}`)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-2xl p-1 bg-muted/50">
            <TabsTrigger value="perfil" className="rounded-xl">Perfil Personal</TabsTrigger>
            <TabsTrigger value="empresa" className="rounded-xl">Datos Empresa</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-xl">Branding</TabsTrigger>
            <TabsTrigger value="ajustes" className="rounded-xl">Ajustes</TabsTrigger>
            <TabsTrigger value="seguridad" className="rounded-xl">Seguridad</TabsTrigger>
          </TabsList>

          {/* Perfil Personal Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <Card className="p-6 soft-shadow border-0">
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 rounded-2xl">
                      <AvatarImage src={profileForm.avatar_url || undefined} />
                      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-accent text-white text-2xl font-heading">
                        {profileForm.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-xl mb-1">
                      {profileForm.full_name || "Usuario"}
                    </h3>
                    <p className="text-muted-foreground mb-3">{profileForm.email}</p>
                    <Badge variant="outline" className="rounded-full">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Cuenta Activa
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Nombre Completo *</Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        placeholder="Juan Pérez"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="usuario@ejemplo.cl"
                        className="mt-2 rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Cambiar el email requiere verificación
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+56 9 1234 5678"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="avatar_url">URL de Avatar (opcional)</Label>
                      <Input
                        id="avatar_url"
                        value={profileForm.avatar_url}
                        onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                        placeholder="https://..."
                        className="mt-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !profileForm.full_name || !profileForm.email}
                    className="rounded-xl shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Datos de Empresa Tab */}
          <TabsContent value="empresa" className="space-y-6">
            <Card className="p-6 soft-shadow border-0">
              <div className="space-y-6">
                {/* Logo Section */}
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border-2 border-dashed border-primary/20">
                      {companyForm.logo_url ? (
                        <img src={companyForm.logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Building2 className="w-12 h-12 text-primary/40" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-xl mb-1">
                      {companyForm.name || "Mi Empresa"}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {companyForm.description || "Agrega una descripción de tu empresa"}
                    </p>
                    <Badge variant="outline" className="rounded-full">
                      {company?.plan?.name || "Plan Starter"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Información General */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Información General
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                      <Input
                        id="company_name"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        placeholder="Clínica PODOS"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={companyForm.description}
                        onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                        placeholder="Clínica podológica especializada en..."
                        className="mt-2 rounded-xl min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo_url">URL de Logo (opcional)</Label>
                      <Input
                        id="logo_url"
                        value={companyForm.logo_url}
                        onChange={(e) => setCompanyForm({ ...companyForm, logo_url: e.target.value })}
                        placeholder="https://..."
                        className="mt-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Información de Contacto */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Información de Contacto
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        type="email"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                        placeholder="info@clinica.cl"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company_phone">Teléfono</Label>
                      <Input
                        id="company_phone"
                        value={companyForm.phone}
                        onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                        placeholder="+56 2 1234 5678"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={companyForm.whatsapp}
                        onChange={(e) => setCompanyForm({ ...companyForm, whatsapp: e.target.value })}
                        placeholder="+56912345678"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input
                        id="website"
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                        placeholder="https://www.clinica.cl"
                        className="mt-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ubicación */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                        placeholder="Av. Providencia 123, Oficina 45"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={companyForm.city}
                        onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                        placeholder="Santiago"
                        className="mt-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Horarios */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horarios de Atención
                  </h4>
                  <div>
                    <Label htmlFor="opening_hours">Horarios</Label>
                    <Textarea
                      id="opening_hours"
                      value={companyForm.opening_hours}
                      onChange={(e) => setCompanyForm({ ...companyForm, opening_hours: e.target.value })}
                      placeholder="Lunes a Viernes: 9:00 - 18:00&#10;Sábados: 9:00 - 13:00"
                      className="mt-2 rounded-xl min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separa cada día con salto de línea
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    onClick={handleSaveCompany}
                    disabled={isSaving || !companyForm.name}
                    className="rounded-xl shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card className="p-6 soft-shadow border-0">
              <h2 className="font-heading font-bold text-xl mb-6">Personalización Visual</h2>

              <div className="space-y-6">
                {/* Color Preview */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div 
                      className="w-full h-20 rounded-2xl mb-2 shadow-lg"
                      style={{ backgroundColor: brandingForm.primary_color }}
                    />
                    <p className="text-sm font-medium">Color Principal</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-full h-20 rounded-2xl mb-2 shadow-lg"
                      style={{ backgroundColor: brandingForm.secondary_color }}
                    />
                    <p className="text-sm font-medium">Color Secundario</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-full h-20 rounded-2xl mb-2 shadow-lg"
                      style={{ backgroundColor: brandingForm.accent_color }}
                    />
                    <p className="text-sm font-medium">Color Acento</p>
                  </div>
                </div>

                <Separator />

                {/* Color Pickers */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Color Principal</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={brandingForm.primary_color}
                        onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                        className="w-16 h-12 rounded-xl cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={brandingForm.primary_color}
                        onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                        className="rounded-xl"
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Color Secundario</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={brandingForm.secondary_color}
                        onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                        className="w-16 h-12 rounded-xl cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={brandingForm.secondary_color}
                        onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                        className="rounded-xl"
                        placeholder="#22C55E"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color">Color Acento</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={brandingForm.accent_color}
                        onChange={(e) => setBrandingForm({ ...brandingForm, accent_color: e.target.value })}
                        className="w-16 h-12 rounded-xl cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={brandingForm.accent_color}
                        onChange={(e) => setBrandingForm({ ...brandingForm, accent_color: e.target.value })}
                        className="rounded-xl"
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Logo & Favicon */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo-url">URL del Logo</Label>
                    <Input
                      id="logo-url"
                      type="url"
                      value={brandingForm.logo_url}
                      onChange={(e) => setBrandingForm({ ...brandingForm, logo_url: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="mt-2 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Aparecerá en tu página de reservas y documentos
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="favicon-url">URL del Favicon</Label>
                    <Input
                      id="favicon-url"
                      type="url"
                      value={brandingForm.favicon_url}
                      onChange={(e) => setBrandingForm({ ...brandingForm, favicon_url: e.target.value })}
                      placeholder="https://example.com/favicon.ico"
                      className="mt-2 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Icono en la pestaña del navegador
                    </p>
                  </div>
                </div>

                {/* Custom Domain */}
                <div>
                  <Label htmlFor="custom-domain">Dominio Personalizado (Opcional)</Label>
                  <Input
                    id="custom-domain"
                    type="text"
                    value={brandingForm.custom_domain}
                    onChange={(e) => setBrandingForm({ ...brandingForm, custom_domain: e.target.value })}
                    placeholder="mi-clinica.com"
                    className="mt-2 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Configura tu propio dominio para la página de reservas
                  </p>
                </div>

                <Separator />

                <Button 
                  onClick={handleSaveBranding}
                  className="rounded-xl shadow-lg shadow-primary/20"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar Branding"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Ajustes Tab */}
          <TabsContent value="ajustes" className="space-y-6">
            <Card className="p-6 soft-shadow border-0">
              <h2 className="font-heading font-bold text-xl mb-6">Preferencias de la Clínica</h2>

              <div className="space-y-6">
                {/* Booking Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Sistema de Reservas</h3>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium">Reservas Online Activas</p>
                      <p className="text-sm text-muted-foreground">
                        Permite que pacientes agenden citas desde tu página web
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.booking_enabled}
                      onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, booking_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium">Requiere Aprobación</p>
                      <p className="text-sm text-muted-foreground">
                        Las citas nuevas deben ser confirmadas manualmente
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.requires_approval}
                      onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, requires_approval: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium">Recordatorios Automáticos</p>
                      <p className="text-sm text-muted-foreground">
                        Envía recordatorios por email/WhatsApp 24h antes
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.auto_reminders}
                      onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, auto_reminders: checked })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Cancellation Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Cancelaciones</h3>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium">Permitir Cancelaciones</p>
                      <p className="text-sm text-muted-foreground">
                        Los pacientes pueden cancelar sus citas
                      </p>
                    </div>
                    <Switch
                      checked={settingsForm.allow_cancellations}
                      onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, allow_cancellations: checked })}
                    />
                  </div>

                  {settingsForm.allow_cancellations && (
                    <div>
                      <Label htmlFor="cancellation-hours">Horas mínimas de anticipación</Label>
                      <Input
                        id="cancellation-hours"
                        type="number"
                        min="1"
                        max="72"
                        value={settingsForm.cancellation_hours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cancellation_hours: parseInt(e.target.value) || 2 })}
                        className="mt-2 rounded-xl w-32"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        El paciente debe cancelar al menos {settingsForm.cancellation_hours}h antes
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <Button 
                  onClick={handleSaveSettings}
                  className="rounded-xl shadow-lg shadow-primary/20"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Seguridad Tab */}
          <TabsContent value="seguridad" className="space-y-6">
            <Card className="p-6 soft-shadow border-0">
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-xl mb-2">Seguridad de la Cuenta</h3>
                  <p className="text-muted-foreground">Gestiona la seguridad y privacidad de tu cuenta</p>
                </div>

                <Separator />

                {/* Change Password */}
                <div>
                  <h4 className="font-semibold mb-4">Cambiar Contraseña</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current_password">Contraseña Actual</Label>
                      <Input
                        id="current_password"
                        type="password"
                        placeholder="••••••••"
                        className="mt-2 rounded-xl"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new_password">Nueva Contraseña</Label>
                        <Input
                          id="new_password"
                          type="password"
                          placeholder="••••••••"
                          className="mt-2 rounded-xl"
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          placeholder="••••••••"
                          className="mt-2 rounded-xl"
                        />
                      </div>
                    </div>

                    <Button variant="outline" className="rounded-xl">
                      Actualizar Contraseña
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Session Management */}
                <div>
                  <h4 className="font-semibold mb-4">Gestión de Sesiones</h4>
                  <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sesión Actual</p>
                        <p className="text-sm text-muted-foreground">Última actividad: Ahora</p>
                      </div>
                      <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                        Activa
                      </Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="rounded-xl mt-4">
                    Cerrar Todas las Sesiones
                  </Button>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div>
                  <h4 className="font-semibold mb-4 text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Zona Peligrosa
                  </h4>
                  <div className="p-4 rounded-xl border-2 border-destructive/20 bg-destructive/5 space-y-3">
                    <div>
                      <p className="font-medium mb-1">Eliminar Cuenta</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
                      </p>
                      <Button variant="destructive" className="rounded-xl">
                        Eliminar Mi Cuenta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}