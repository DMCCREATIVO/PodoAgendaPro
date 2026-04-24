import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/auth";
import type { Session } from "@/services/auth";
import { SEO } from "@/components/SEO";
import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Activity,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Palette,
  Settings as SettingsIcon,
  Copy,
  Eye,
  EyeOff,
  Crown,
  Zap,
  Rocket,
  AlertCircle,
  Clock,
  Upload,
  Key,
  Infinity,
  MessageSquare,
  CreditCard,
  Webhook,
  Save,
  Pencil,
  Building,
  UserCog
} from "lucide-react";

// Tipos
interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  max_users: number;
  max_podiatrists: number;
  max_monthly_appointments: number;
  features: string[];
}

interface GlobalSetting {
  key: string;
  value: any;
  description: string;
}

export default function SuperAdmin() {
  const router = useRouter();
  const { toast } = useToast();
  const { tab } = router.query;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Estados para datos
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [globalSettings, setGlobalSettings] = useState<Record<string, any>>({});
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeCompanies: 0,
    monthlyRevenue: 0,
  });

  // Estados para modales
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
    companyName?: string;
    companySlug?: string;
    role?: string;
    company?: string;
  } | null>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    address: "",
    primary_color: "#2563EB",
    secondary_color: "#8B5CF6",
    logo_url: "",
    plan: "",
    custom_plan: false,
    max_users: -1,
    max_podiatrists: -1,
    max_monthly_appointments: -1,
    admin_email: "",
    admin_name: "",
    admin_password: "",
    // Integraciones
    whatsapp_enabled: false,
    whatsapp_instance: "",
    whatsapp_use_global: true,
    mercadopago_enabled: false,
    mercadopago_public_key: "",
    mercadopago_access_token: "",
    mercadopago_use_global: true,
  });

  const [userForm, setUserForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    role: "employee",
    company_id: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    company_id: "",
    new_password: "",
  });

  // Global settings states
  const [settingsForm, setSettingsForm] = useState({
    whatsapp_enabled: false,
    whatsapp_server_url: "",
    whatsapp_default_instance: "",
    whatsapp_api_token: "",
    mercadopago_enabled: false,
    mercadopago_public_key: "",
    mercadopago_access_token: "",
    mercadopago_mode: "sandbox",
    stripe_enabled: false,
    stripe_public_key: "",
    stripe_secret_key: "",
    stripe_mode: "test",
  });

  useEffect(() => {
    setMounted(true);
    const currentSession = authService.getSession();
    
    if (!currentSession || !currentSession.isSuperadmin) {
      router.replace("/login");
      return;
    }
    
    setSession(currentSession);
    setLoading(false);
    
    // Cargar datos inmediatamente
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      console.log("🔄 [DEBUG] Iniciando loadData...");
      
      // Cargar empresas
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      console.log("📊 [DEBUG] Empresas query result:", {
        data: companiesData,
        error: companiesError,
        count: companiesData?.length || 0
      });
      
      if (companiesError) {
        console.error("❌ [ERROR] Error cargando empresas:", companiesError);
      }
      
      setCompanies(companiesData || []);

      // Cargar usuarios DIRECTAMENTE con role y company_id
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`
          *,
          companies (
            id,
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false });
      
      console.log("👥 [DEBUG] Usuarios query result:", {
        data: usersData,
        error: usersError,
        count: usersData?.length || 0
      });
      
      if (usersError) {
        console.error("❌ [ERROR] Error cargando usuarios:", usersError);
        setUsers([]);
      } else {
        // Transformar para la tabla
        const transformedUsers = (usersData || []).map((user: any) => ({
          ...user,
          role: user.role || (user.is_superadmin ? 'superadmin' : 'patient'),
          company_name: user.companies?.name || (user.role === 'superadmin' ? 'Sistema' : 'Sin empresa'),
          cu_status: user.is_active ? 'active' : 'inactive'
        }));
        
        console.log("✅ [DEBUG] Usuarios transformados:", transformedUsers);
        setUsers(transformedUsers);
      }

      // Cargar planes
      const { data: plansData, error: plansError } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });
      
      console.log("💎 [DEBUG] Planes query result:", {
        data: plansData,
        error: plansError,
        count: plansData?.length || 0
      });
      
      setPlans((plansData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price_monthly: parseFloat(p.price_monthly) || 0,
        max_users: p.limits?.max_users || -1,
        max_podiatrists: p.limits?.max_podiatrists || -1,
        max_monthly_appointments: p.limits?.max_monthly_appointments || -1,
        features: Array.isArray(p.features) ? p.features : [],
      })));

      if (plansData && plansData.length > 0 && !companyForm.plan) {
        setCompanyForm(prev => ({ ...prev, plan: plansData[0].id }));
      }

      // Cargar configuraciones globales
      const { data: settingsData } = await supabase
        .from("global_settings")
        .select("*");
      
      const settings: Record<string, any> = {};
      (settingsData || []).forEach((s: any) => {
        settings[s.key] = s.value;
      });
      setGlobalSettings(settings);

      if (settings.whatsapp) {
        setSettingsForm(prev => ({
          ...prev,
          whatsapp_enabled: settings.whatsapp.enabled || false,
          whatsapp_server_url: settings.whatsapp.server_url || "",
          whatsapp_default_instance: settings.whatsapp.default_instance || "",
          whatsapp_api_token: settings.whatsapp.api_token || "",
        }));
      }
      if (settings.mercadopago) {
        setSettingsForm(prev => ({
          ...prev,
          mercadopago_enabled: settings.mercadopago.enabled || false,
          mercadopago_public_key: settings.mercadopago.public_key || "",
          mercadopago_access_token: settings.mercadopago.access_token || "",
          mercadopago_mode: settings.mercadopago.mode || "sandbox",
        }));
      }
      if (settings.stripe) {
        setSettingsForm(prev => ({
          ...prev,
          stripe_enabled: settings.stripe.enabled || false,
          stripe_public_key: settings.stripe.public_key || "",
          stripe_secret_key: settings.secret_key || "",
          stripe_mode: settings.stripe.mode || "test",
        }));
      }

      // Calcular estadísticas
      const calculatedStats = {
        totalCompanies: companiesData?.length || 0,
        totalUsers: usersData?.length || 0,
        activeCompanies: companiesData?.filter((c: any) => c.is_active && c.plan_status === 'active').length || 0,
        monthlyRevenue: companiesData?.reduce((sum: number, c: any) => {
          const plan = plansData?.find((p: any) => p.id === c.plan);
          return sum + (Number(plan?.price_monthly) || 0);
        }, 0) || 0,
      };
      
      console.log("📈 [DEBUG] Estadísticas calculadas:", calculatedStats);
      setStats(calculatedStats);

      console.log("✅ [DEBUG] LoadData completado exitosamente");
    } catch (error) {
      console.error("💥 [ERROR] Error crítico en loadData:", error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      setCompanyForm({ ...companyForm, logo_url: data.publicUrl });
      toast({ title: "✅ Logo subido exitosamente" });
    } catch (error: any) {
      toast({
        title: "Error al subir logo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCreateCompany = async () => {
    try {
      console.log("🏢 [SIMPLE] Creando nueva empresa...");

      const slug = companyForm.slug || generateSlug(companyForm.name);
      const adminPassword = companyForm.admin_password || generatePassword();

      let max_users, max_podiatrists, max_monthly_appointments;
      
      if (companyForm.custom_plan) {
        max_users = companyForm.max_users;
        max_podiatrists = companyForm.max_podiatrists;
        max_monthly_appointments = companyForm.max_monthly_appointments;
      } else {
        const selectedPlan = plans.find(p => p.id === companyForm.plan);
        max_users = selectedPlan?.max_users || 5;
        max_podiatrists = selectedPlan?.max_podiatrists || 1;
        max_monthly_appointments = selectedPlan?.max_monthly_appointments || 50;
      }

      const companyData = {
        name: companyForm.name,
        slug: slug,
        email: companyForm.email,
        phone: companyForm.phone,
        address: companyForm.address,
        logo_url: companyForm.logo_url,
        plan: companyForm.custom_plan ? null : companyForm.plan,
        custom_plan: companyForm.custom_plan,
        plan_status: 'trial',
        max_users,
        max_podiatrists,
        max_monthly_appointments,
        default_admin_password: adminPassword,
        metadata: {
          primary_color: companyForm.primary_color,
          secondary_color: companyForm.secondary_color
        },
        integrations: {
          whatsapp: {
            enabled: companyForm.whatsapp_enabled,
            instance_name: companyForm.whatsapp_instance,
            use_global: companyForm.whatsapp_use_global
          },
          mercadopago: {
            enabled: companyForm.mercadopago_enabled,
            public_key: companyForm.mercadopago_public_key,
            access_token: companyForm.mercadopago_access_token,
            use_global: companyForm.mercadopago_use_global
          }
        }
      };

      console.log("📝 Insertando empresa...");
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([companyData])
        .select()
        .single();

      if (companyError) throw companyError;
      console.log("✅ Empresa creada:", company.id);

      const userId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { 
            const r = Math.random() * 16 | 0; 
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); 
          });

      console.log("👤 Creando usuario owner...");
      // SIMPLE: role y company_id directamente en users
      const { data: adminUser, error: userError } = await supabase
        .from("users")
        .insert([{
          id: userId,
          email: companyForm.admin_email,
          full_name: companyForm.admin_name,
          role: 'owner', // ← DIRECTO
          company_id: company.id, // ← DIRECTO
          is_active: true,
          is_superadmin: false,
        }])
        .select()
        .single();

      if (userError) {
        console.error("❌ Error creando usuario:", userError);
        await supabase.from("companies").delete().eq("id", company.id);
        throw userError;
      }

      console.log("✅ Usuario owner creado con role y company_id:", adminUser.id);

      setGeneratedCredentials({
        email: companyForm.admin_email,
        password: adminPassword,
        companyName: company.name,
        companySlug: company.slug,
      });

      toast({ title: "✅ Empresa creada exitosamente" });
      setCompanyDialogOpen(false);
      setCredentialsDialogOpen(true);
      resetCompanyForm();
      
      await loadData();
      console.log("✅ Proceso completado");
    } catch (error: any) {
      console.error("💥 Error:", error);
      toast({
        title: "Error al crear empresa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateCompany = async () => {
    try {
      let max_users, max_podiatrists, max_monthly_appointments;
      
      if (companyForm.custom_plan) {
        max_users = companyForm.max_users;
        max_podiatrists = companyForm.max_podiatrists;
        max_monthly_appointments = companyForm.max_monthly_appointments;
      } else {
        const selectedPlan = plans.find(p => p.id === companyForm.plan);
        max_users = selectedPlan?.max_users || editingCompany.max_users;
        max_podiatrists = selectedPlan?.max_podiatrists || editingCompany.max_podiatrists;
        max_monthly_appointments = selectedPlan?.max_monthly_appointments || editingCompany.max_monthly_appointments;
      }

      const companyData = {
        name: companyForm.name,
        slug: companyForm.slug,
        email: companyForm.email,
        phone: companyForm.phone,
        address: companyForm.address,
        logo_url: companyForm.logo_url,
        plan: companyForm.custom_plan ? null : companyForm.plan,
        custom_plan: companyForm.custom_plan,
        max_users,
        max_podiatrists,
        max_monthly_appointments,
        metadata: {
          ...(editingCompany?.metadata || {}),
          primary_color: companyForm.primary_color,
          secondary_color: companyForm.secondary_color
        },
        integrations: {
          whatsapp: {
            enabled: companyForm.whatsapp_enabled,
            instance_name: companyForm.whatsapp_instance,
            use_global: companyForm.whatsapp_use_global
          },
          mercadopago: {
            enabled: companyForm.mercadopago_enabled,
            public_key: companyForm.mercadopago_public_key,
            access_token: companyForm.mercadopago_access_token,
            use_global: companyForm.mercadopago_use_global
          }
        }
      };

      const { error } = await supabase
        .from("companies")
        .update(companyData)
        .eq("id", editingCompany.id);

      if (error) throw error;

      toast({ title: "✅ Empresa actualizada exitosamente" });
      setCompanyDialogOpen(false);
      setEditingCompany(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al actualizar empresa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const { error } = await supabase
        .from("companies")
        .update({ default_admin_password: passwordForm.new_password })
        .eq("id", passwordForm.company_id);

      if (error) throw error;

      toast({ title: "✅ Contraseña actualizada" });
      setPasswordDialogOpen(false);
      setPasswordForm({ company_id: "", new_password: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al actualizar contraseña",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleCompanyStatus = async (companyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      const { error } = await supabase
        .from("companies")
        .update({ plan_status: newStatus })
        .eq("id", companyId);

      if (error) throw error;

      toast({ 
        title: newStatus === 'active' ? "✅ Empresa activada" : "⚠️ Empresa suspendida" 
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al cambiar estado",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta empresa? Esto eliminará todos sus datos.")) return;

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "✅ Empresa eliminada" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al eliminar empresa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!userForm.email || !userForm.full_name) {
        toast({
          title: "Campos requeridos",
          description: "Email y nombre son obligatorios",
          variant: "destructive",
        });
        return;
      }

      console.log("👤 [SIMPLE] Creando usuario...");

      const finalPassword = userForm.password || generatePassword();
      const userId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { 
            const r = Math.random() * 16 | 0; 
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); 
          });

      // SIMPLE: Todo en una sola inserción
      const { error: userError } = await supabase.from("users").insert([{
        id: userId,
        email: userForm.email,
        full_name: userForm.full_name,
        phone: userForm.phone || null,
        role: userForm.role, // ← DIRECTO
        company_id: userForm.role === "superadmin" ? null : userForm.company_id, // ← DIRECTO
        is_superadmin: userForm.role === "superadmin",
        is_active: true,
      }]);

      if (userError) {
        console.error("❌ Error:", userError);
        toast({
          title: "Error al crear usuario",
          description: userError.message,
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Usuario creado con role:", userForm.role);

      setGeneratedCredentials({
        email: userForm.email,
        password: finalPassword,
        role: userForm.role,
        company: companies.find(c => c.id === userForm.company_id)?.name || "Sistema",
      });
      setCredentialsDialogOpen(true);

      setUserDialogOpen(false);
      setUserForm({ email: "", full_name: "", phone: "", password: "", role: "employee", company_id: "" });
      
      await loadData();
      toast({ title: "✅ Usuario creado exitosamente" });
    } catch (error: any) {
      console.error("💥 Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      full_name: user.full_name || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "employee",
      company_id: user.company_id || "",
    });
    setUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      if (!editingUser) return;

      console.log("✏️ [SIMPLE] Actualizando usuario...");

      // SIMPLE: Actualización directa en users
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: userForm.full_name,
          phone: userForm.phone || null,
          role: userForm.role, // ← DIRECTO
          company_id: userForm.role === "superadmin" ? null : userForm.company_id, // ← DIRECTO
          is_superadmin: userForm.role === "superadmin",
        })
        .eq("id", editingUser.id);

      if (userError) throw userError;

      console.log("✅ Usuario actualizado");

      setUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({ email: "", full_name: "", phone: "", password: "", role: "employee", company_id: "" });
      
      await loadData();
      toast({ title: "✅ Usuario actualizado exitosamente" });
    } catch (error: any) {
      console.error("💥 Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveGlobalSettings = async () => {
    try {
      // WhatsApp
      await supabase
        .from("global_settings")
        .upsert({
          key: 'whatsapp',
          value: {
            enabled: settingsForm.whatsapp_enabled,
            server_url: settingsForm.whatsapp_server_url,
            default_instance: settingsForm.whatsapp_default_instance,
            api_token: settingsForm.whatsapp_api_token,
          }
        });

      // Mercado Pago
      await supabase
        .from("global_settings")
        .upsert({
          key: 'mercadopago',
          value: {
            enabled: settingsForm.mercadopago_enabled,
            public_key: settingsForm.mercadopago_public_key,
            access_token: settingsForm.mercadopago_access_token,
            mode: settingsForm.mercadopago_mode,
          }
        });

      // Stripe
      await supabase
        .from("global_settings")
        .upsert({
          key: 'stripe',
          value: {
            enabled: settingsForm.stripe_enabled,
            public_key: settingsForm.stripe_public_key,
            secret_key: settingsForm.stripe_secret_key,
            mode: settingsForm.stripe_mode,
          }
        });

      toast({ title: "✅ Configuraciones globales guardadas" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error al guardar configuraciones",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `✅ ${label} copiado al portapapeles` });
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: "",
      slug: "",
      email: "",
      phone: "",
      address: "",
      primary_color: "#2563EB",
      secondary_color: "#8B5CF6",
      logo_url: "",
      plan: plans.length > 0 ? plans[0].id : "",
      custom_plan: false,
      max_users: -1,
      max_podiatrists: -1,
      max_monthly_appointments: -1,
      admin_email: "",
      admin_name: "",
      admin_password: "",
      whatsapp_enabled: false,
      whatsapp_instance: "",
      whatsapp_use_global: true,
      mercadopago_enabled: false,
      mercadopago_public_key: "",
      mercadopago_access_token: "",
      mercadopago_use_global: true,
    });
  };

  const getPlanBadge = (planId: string | null, isCustom: boolean) => {
    if (isCustom) {
      return (
        <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">
          <Infinity className="w-3 h-3 mr-1" />
          Custom
        </Badge>
      );
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return <Badge className="bg-gray-500 text-white border-0">Sin plan</Badge>;

    const badges: Record<string, { icon: any; color: string }> = {
      "Free": { icon: Crown, color: "bg-gray-500" },
      "Starter": { icon: Zap, color: "bg-blue-500" },
      "Pro": { icon: Zap, color: "bg-purple-500" },
      "Enterprise": { icon: Rocket, color: "bg-gradient-to-r from-purple-600 to-blue-600" }
    };

    const badge = badges[plan.name] || { icon: Crown, color: "bg-gray-500" };
    const Icon = badge.icon;

    return (
      <Badge className={`${badge.color} text-white border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {plan.name}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      trial: { color: "bg-yellow-500", label: "Prueba" },
      active: { color: "bg-green-500", label: "Activo" },
      suspended: { color: "bg-red-500", label: "Suspendido" },
      cancelled: { color: "bg-gray-500", label: "Cancelado" }
    };
    const badge = badges[status as keyof typeof badges] || badges.trial;
    return <Badge className={`${badge.color} text-white border-0`}>{badge.label}</Badge>;
  };

  if (!mounted || loading || !session) {
    return null;
  }

  const activeTabId = (tab as string) || "dashboard";

  return (
    <SuperAdminLayout activeTab={activeTabId}>
      <SEO title="Panel SuperAdmin - PodoAgenda Pro" />

      {/* Credentials Dialog */}
      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-6 h-6 text-green-500" />
              ¡Credenciales Generadas!
            </DialogTitle>
            <DialogDescription>
              Guarda estas credenciales. No se mostrarán nuevamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            {generatedCredentials?.companyName && (
              <div>
                <Label className="text-sm font-semibold text-gray-700">Empresa</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={generatedCredentials.companyName} readOnly className="bg-white" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generatedCredentials.companyName || "", "Nombre de empresa")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {generatedCredentials?.companySlug && (
              <div>
                <Label className="text-sm font-semibold text-gray-700">URL de la Empresa</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={`https://podoagenda.com/${generatedCredentials.companySlug}`} readOnly className="bg-white" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(`https://podoagenda.com/${generatedCredentials.companySlug}`, "URL")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-gray-700">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={generatedCredentials?.email || ""} readOnly className="bg-white" />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(generatedCredentials?.email || "", "Email")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Contraseña</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={generatedCredentials?.password || ""} 
                  type={showPassword ? "text" : "password"}
                  readOnly 
                  className="bg-white font-mono"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(generatedCredentials?.password || "", "Contraseña")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCredentialsDialogOpen(false)} className="w-full">
              Entendido, he guardado las credenciales
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña del Admin</DialogTitle>
            <DialogDescription>
              Actualiza la contraseña por defecto del administrador de esta empresa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nueva Contraseña</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  placeholder="Ingresa nueva contraseña"
                />
                <Button
                  variant="outline"
                  onClick={() => setPasswordForm({ ...passwordForm, new_password: generatePassword() })}
                >
                  Generar
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePassword}>
              Actualizar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard Tab - MEJORADO CON DEBUG */}
      {activeTabId === "dashboard" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard SuperAdmin</h1>
            <p className="text-gray-600">Vista general del sistema</p>
            {/* DEBUG INFO */}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
              <p className="font-mono">
                DEBUG: Empresas={companies.length} | Usuarios={users.length} | Stats=(C:{stats.totalCompanies}, U:{stats.totalUsers})
              </p>
            </div>
          </div>

          {/* Mostrar mensaje si no hay datos */}
          {stats.totalCompanies === 0 && stats.totalUsers === 0 && (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron datos
              </h3>
              <p className="text-gray-600 mb-4">
                Abre la consola del navegador (F12) para ver los detalles del error
              </p>
              <Button onClick={loadData}>
                Recargar Datos
              </Button>
            </Card>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Empresas */}
            <Card className="p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Empresas</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalCompanies}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.activeCompanies} activas
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            {/* Total Usuarios */}
            <Card className="p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Usuarios</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {users.filter((u: any) => u.is_active).length} activos
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Ingresos Mensuales */}
            <Card className="p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Ingresos Mensuales</p>
                  <p className="text-4xl font-bold text-gray-900">
                    ${stats.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">MRR estimado</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            {/* Empresas Activas */}
            <Card className="p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Empresas Activas</p>
                  <p className="text-4xl font-bold text-gray-900">{stats.activeCompanies}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.totalCompanies > 0 
                      ? `${((stats.activeCompanies / stats.totalCompanies) * 100).toFixed(0)}% del total`
                      : '0%'
                    }
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Gráficos y Distribución */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de Roles */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-blue-600" />
                Distribución de Roles
              </h3>
              <div className="space-y-4">
                {[
                  { 
                    role: 'superadmin', 
                    label: 'SuperAdmins', 
                    count: users.filter((u: any) => u.role === 'superadmin').length,
                    color: 'bg-purple-500',
                    lightColor: 'bg-purple-100',
                    textColor: 'text-purple-700'
                  },
                  { 
                    role: 'owner', 
                    label: 'Owners', 
                    count: users.filter((u: any) => u.role === 'owner').length,
                    color: 'bg-blue-500',
                    lightColor: 'bg-blue-100',
                    textColor: 'text-blue-700'
                  },
                  { 
                    role: 'admin', 
                    label: 'Admins', 
                    count: users.filter((u: any) => u.role === 'admin').length,
                    color: 'bg-green-500',
                    lightColor: 'bg-green-100',
                    textColor: 'text-green-700'
                  },
                  { 
                    role: 'employee', 
                    label: 'Podólogos', 
                    count: users.filter((u: any) => u.role === 'employee').length,
                    color: 'bg-orange-500',
                    lightColor: 'bg-orange-100',
                    textColor: 'text-orange-700'
                  },
                  { 
                    role: 'patient', 
                    label: 'Pacientes', 
                    count: users.filter((u: any) => u.role === 'patient').length,
                    color: 'bg-gray-500',
                    lightColor: 'bg-gray-100',
                    textColor: 'text-gray-700'
                  },
                ].map((item) => {
                  const percentage = stats.totalUsers > 0 
                    ? (item.count / stats.totalUsers) * 100 
                    : 0;
                  
                  return (
                    <div key={item.role}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        </div>
                        <span className={`text-sm font-semibold ${item.textColor}`}>
                          {item.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Distribución de Planes */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Distribución de Planes
              </h3>
              <div className="space-y-4">
                {plans.map((plan) => {
                  const companiesWithPlan = companies.filter((c: any) => c.plan === plan.id).length;
                  const percentage = stats.totalCompanies > 0 
                    ? (companiesWithPlan / stats.totalCompanies) * 100 
                    : 0;
                  
                  const colors = {
                    'Free': { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-700' },
                    'Pro': { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
                    'Enterprise': { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
                  };
                  
                  const color = colors[plan.name as keyof typeof colors] || colors.Free;
                  
                  return (
                    <div key={plan.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.bg}`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            {plan.name} - ${plan.price_monthly}/mes
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${color.text}`}>
                          {companiesWithPlan} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${color.bg} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Últimas Empresas y Usuarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimas Empresas */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Últimas Empresas
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push({ query: { tab: 'empresas' } })}
                >
                  Ver todas →
                </Button>
              </div>
              <div className="space-y-3">
                {companies.slice(0, 5).map((company: any) => (
                  <div 
                    key={company.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-xs text-gray-500">/{company.slug}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={company.is_active ? "default" : "secondary"}
                      className={company.is_active ? "bg-green-500" : "bg-gray-500"}
                    >
                      {company.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Últimos Usuarios */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Últimos Usuarios
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.push({ query: { tab: 'usuarios' } })}
                >
                  Ver todos →
                </Button>
              </div>
              <div className="space-y-3">
                {users.slice(0, 5).map((user: any) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || "Sin nombre"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        user.role === "superadmin" ? "destructive" :
                        user.role === "owner" ? "default" :
                        user.role === "admin" ? "secondary" :
                        user.role === "employee" ? "outline" :
                        "secondary"
                      }
                      className={
                        user.role === "superadmin" ? "bg-purple-600" :
                        user.role === "owner" ? "bg-blue-600" :
                        user.role === "admin" ? "bg-green-600" :
                        user.role === "employee" ? "bg-orange-600" :
                        "bg-gray-500"
                      }
                    >
                      {user.role === "superadmin" ? "SuperAdmin" :
                       user.role === "owner" ? "Owner" :
                       user.role === "admin" ? "Admin" :
                       user.role === "employee" ? "Podólogo" :
                       user.role === "patient" ? "Paciente" :
                       "Sin Asignar"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Resumen Rápido */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Resumen del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter((u: any) => u.role === 'employee').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Podólogos Totales</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {companies.filter((c: any) => c.plan_status === 'active').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Empresas Pagando</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalCompanies > 0 
                    ? (users.filter((u: any) => u.role === 'employee').length / stats.totalCompanies).toFixed(1)
                    : 0
                  }
                </p>
                <p className="text-sm text-gray-600 mt-1">Podólogos por Empresa</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Empresas Tab */}
      {activeTabId === "empresas" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Empresas</h1>
              <p className="text-gray-600">Administra todas las clínicas del sistema</p>
            </div>
            <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-5 h-5" />
                  Nueva Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCompany ? "Editar Empresa" : "Nueva Empresa"}</DialogTitle>
                  <DialogDescription>
                    Complete todos los datos de la empresa y configuraciones
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="plan">Plan</TabsTrigger>
                    <TabsTrigger value="personalizacion">Diseño</TabsTrigger>
                    <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
                  </TabsList>

                  {/* Tab General */}
                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={companyForm.name}
                          onChange={(e) => {
                            setCompanyForm({ ...companyForm, name: e.target.value });
                            if (!editingCompany) {
                              setCompanyForm({ ...companyForm, name: e.target.value, slug: generateSlug(e.target.value) });
                            }
                          }}
                          placeholder="Clínica Podológica"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">URL/Slug *</Label>
                        <Input
                          id="slug"
                          value={companyForm.slug}
                          onChange={(e) => setCompanyForm({ ...companyForm, slug: e.target.value })}
                          placeholder="clinica-podologica"
                        />
                        <p className="text-xs text-gray-500 mt-1">podoagenda.com/{companyForm.slug || "slug"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={companyForm.email}
                          onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                          placeholder="contacto@clinica.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={companyForm.phone}
                          onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                        placeholder="Av. Principal 123"
                      />
                    </div>

                    {!editingCompany && (
                      <>
                        <hr className="my-4" />
                        <h3 className="text-lg font-semibold">Administrador de la Empresa</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="admin_name">Nombre Completo *</Label>
                            <Input
                              id="admin_name"
                              value={companyForm.admin_name}
                              onChange={(e) => setCompanyForm({ ...companyForm, admin_name: e.target.value })}
                              placeholder="Juan Pérez"
                            />
                          </div>
                          <div>
                            <Label htmlFor="admin_email">Email *</Label>
                            <Input
                              id="admin_email"
                              type="email"
                              value={companyForm.admin_email}
                              onChange={(e) => setCompanyForm({ ...companyForm, admin_email: e.target.value })}
                              placeholder="admin@clinica.com"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="admin_password">Contraseña (dejar vacío para generar)</Label>
                          <div className="flex gap-2">
                            <Input
                              id="admin_password"
                              type="text"
                              value={companyForm.admin_password}
                              onChange={(e) => setCompanyForm({ ...companyForm, admin_password: e.target.value })}
                              placeholder="Se generará automáticamente"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setCompanyForm({ ...companyForm, admin_password: generatePassword() })}
                            >
                              Generar
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Tab Plan */}
                  <TabsContent value="plan" className="space-y-4 mt-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Switch
                        checked={companyForm.custom_plan}
                        onCheckedChange={(checked) => setCompanyForm({ ...companyForm, custom_plan: checked })}
                      />
                      <div>
                        <Label className="font-semibold">Plan Personalizado</Label>
                        <p className="text-sm text-gray-600">Activar para configurar límites manualmente</p>
                      </div>
                    </div>

                    {!companyForm.custom_plan ? (
                      <div>
                        <Label htmlFor="plan">Seleccionar Plan *</Label>
                        <Select value={companyForm.plan} onValueChange={(value: any) => setCompanyForm({ ...companyForm, plan: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} - ${plan.price_monthly}/mes
                                {plan.max_users > 0 && ` (${plan.max_users} usuarios, ${plan.max_podiatrists} podólogos)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 text-amber-800 mb-2">
                            <Infinity className="w-5 h-5" />
                            <span className="font-semibold">Plan Personalizado / Ilimitado</span>
                          </div>
                          <p className="text-sm text-amber-700">Usa -1 para ilimitado</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Máximo Usuarios</Label>
                            <Input
                              type="number"
                              value={companyForm.max_users}
                              onChange={(e) => setCompanyForm({ ...companyForm, max_users: parseInt(e.target.value) })}
                              placeholder="-1 = ilimitado"
                            />
                          </div>
                          <div>
                            <Label>Máximo Podólogos</Label>
                            <Input
                              type="number"
                              value={companyForm.max_podiatrists}
                              onChange={(e) => setCompanyForm({ ...companyForm, max_podiatrists: parseInt(e.target.value) })}
                              placeholder="-1 = ilimitado"
                            />
                          </div>
                          <div>
                            <Label>Citas/Mes</Label>
                            <Input
                              type="number"
                              value={companyForm.max_monthly_appointments}
                              onChange={(e) => setCompanyForm({ ...companyForm, max_monthly_appointments: parseInt(e.target.value) })}
                              placeholder="-1 = ilimitado"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Tab Personalización */}
                  <TabsContent value="personalizacion" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary_color">Color Primario</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="primary_color"
                            type="color"
                            value={companyForm.primary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, primary_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={companyForm.primary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, primary_color: e.target.value })}
                            placeholder="#2563EB"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondary_color">Color Secundario</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="secondary_color"
                            type="color"
                            value={companyForm.secondary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, secondary_color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <Input
                            value={companyForm.secondary_color}
                            onChange={(e) => setCompanyForm({ ...companyForm, secondary_color: e.target.value })}
                            placeholder="#8B5CF6"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <p className="text-sm font-semibold mb-2">Vista Previa</p>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-20 h-20 rounded-xl shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${companyForm.primary_color}, ${companyForm.secondary_color})` }}
                        />
                        <div>
                          <p className="text-sm text-gray-600">Gradiente de marca</p>
                          <p className="text-xs text-gray-500">Se aplicará en toda la interfaz de la empresa</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab Integraciones */}
                  <TabsContent value="integraciones" className="space-y-4 mt-4">
                    <div className="space-y-6">
                      {/* WhatsApp */}
                      <div className="p-4 border rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold">WhatsApp</h3>
                          </div>
                          <Switch
                            checked={companyForm.whatsapp_enabled}
                            onCheckedChange={(checked) => setCompanyForm({ ...companyForm, whatsapp_enabled: checked })}
                          />
                        </div>

                        {companyForm.whatsapp_enabled && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={companyForm.whatsapp_use_global}
                                onCheckedChange={(checked) => setCompanyForm({ ...companyForm, whatsapp_use_global: checked })}
                              />
                              <Label className="text-sm">Usar configuración global</Label>
                            </div>

                            {!companyForm.whatsapp_use_global && (
                              <div>
                                <Label>Nombre de Instancia</Label>
                                <Input
                                  value={companyForm.whatsapp_instance}
                                  onChange={(e) => setCompanyForm({ ...companyForm, whatsapp_instance: e.target.value })}
                                  placeholder="mi-clinica-whatsapp"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Mercado Pago */}
                      <div className="p-4 border rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold">Mercado Pago</h3>
                          </div>
                          <Switch
                            checked={companyForm.mercadopago_enabled}
                            onCheckedChange={(checked) => setCompanyForm({ ...companyForm, mercadopago_enabled: checked })}
                          />
                        </div>

                        {companyForm.mercadopago_enabled && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={companyForm.mercadopago_use_global}
                                onCheckedChange={(checked) => setCompanyForm({ ...companyForm, mercadopago_use_global: checked })}
                              />
                              <Label className="text-sm">Usar configuración global</Label>
                            </div>

                            {!companyForm.mercadopago_use_global && (
                              <>
                                <div>
                                  <Label>Public Key</Label>
                                  <Input
                                    value={companyForm.mercadopago_public_key}
                                    onChange={(e) => setCompanyForm({ ...companyForm, mercadopago_public_key: e.target.value })}
                                    placeholder="APP_USR-..."
                                  />
                                </div>
                                <div>
                                  <Label>Access Token</Label>
                                  <Input
                                    type="password"
                                    value={companyForm.mercadopago_access_token}
                                    onChange={(e) => setCompanyForm({ ...companyForm, mercadopago_access_token: e.target.value })}
                                    placeholder="APP_USR-..."
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setCompanyDialogOpen(false);
                    setEditingCompany(null);
                    resetCompanyForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={editingCompany ? handleUpdateCompany : handleCreateCompany}>
                    {editingCompany ? "Guardar Cambios" : "Crear Empresa"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Límites</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${(company.metadata as any)?.primary_color || '#2563EB'}, ${(company.metadata as any)?.secondary_color || '#8B5CF6'})` }}
                          >
                            {company.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{company.name}</p>
                          <p className="text-sm text-gray-600">{company.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(company.plan, company.custom_plan)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(company.plan_status)}
                        {company.plan_status === 'trial' && company.trial_ends_at && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>Termina en {Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>👥 {company.max_users > 0 ? `${company.max_users} usuarios` : '∞'}</div>
                        <div>👨‍⚕️ {company.max_podiatrists > 0 ? `${company.max_podiatrists} podólogos` : '∞'}</div>
                        <div>📅 {company.max_monthly_appointments > 0 ? `${company.max_monthly_appointments} citas/mes` : '∞'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">/{company.slug}</code>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(`https://podoagenda.com/${company.slug}`, "URL")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPasswordForm({ 
                              company_id: company.id, 
                              new_password: company.default_admin_password || "" 
                            });
                            setPasswordDialogOpen(true);
                          }}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCompany(company);
                            const integrations = company.integrations || {};
                            setCompanyForm({
                              name: company.name || "",
                              slug: company.slug || "",
                              email: company.email || "",
                              phone: company.phone || "",
                              address: company.address || "",
                              logo_url: company.logo_url || "",
                              primary_color: (company.metadata as any)?.primary_color || "#2563EB",
                              secondary_color: (company.metadata as any)?.secondary_color || "#8B5CF6",
                              plan: company.plan || "",
                              custom_plan: company.custom_plan || false,
                              max_users: company.max_users || -1,
                              max_podiatrists: company.max_podiatrists || -1,
                              max_monthly_appointments: company.max_monthly_appointments || -1,
                              admin_email: "",
                              admin_name: "",
                              admin_password: "",
                              whatsapp_enabled: integrations.whatsapp?.enabled || false,
                              whatsapp_instance: integrations.whatsapp?.instance_name || "",
                              whatsapp_use_global: integrations.whatsapp?.use_global !== false,
                              mercadopago_enabled: integrations.mercadopago?.enabled || false,
                              mercadopago_public_key: integrations.mercadopago?.public_key || "",
                              mercadopago_access_token: integrations.mercadopago?.access_token || "",
                              mercadopago_use_global: integrations.mercadopago?.use_global !== false,
                            });
                            setCompanyDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={company.plan_status === 'active' ? 'text-orange-600' : 'text-green-600'}
                          onClick={() => handleToggleCompanyStatus(company.id, company.plan_status)}
                        >
                          {company.plan_status === 'active' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Usuarios Tab */}
      {activeTabId === "usuarios" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra todos los usuarios del sistema</p>
            </div>
            <Dialog open={userDialogOpen} onOpenChange={(open) => {
              setUserDialogOpen(open);
              if (!open) {
                setEditingUser(null);
                setUserForm({ email: "", full_name: "", phone: "", password: "", role: "employee", company_id: "" });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-5 h-5" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? "Modifica los datos del usuario" : "Complete los datos del usuario"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="user_email">Email *</Label>
                    <Input
                      id="user_email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="usuario@email.com"
                      disabled={!!editingUser}
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_name">Nombre Completo *</Label>
                    <Input
                      id="user_name"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user_phone">Teléfono</Label>
                    <Input
                      id="user_phone"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  {!editingUser && (
                    <div>
                      <Label htmlFor="user_password">Contraseña (dejar vacío para generar automática)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="user_password"
                          type="text"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          placeholder="Se generará automáticamente"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setUserForm({ ...userForm, password: generatePassword() })}
                        >
                          Generar
                        </Button>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="user_role">Rol *</Label>
                    <Select value={userForm.role} onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superadmin">SuperAdmin (Sistema)</SelectItem>
                        <SelectItem value="owner">Owner (Dueño de Empresa)</SelectItem>
                        <SelectItem value="admin">Admin (Administrador)</SelectItem>
                        <SelectItem value="employee">Employee (Podólogo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {userForm.role !== "superadmin" && (
                    <div>
                      <Label htmlFor="user_company">Empresa *</Label>
                      <Select value={userForm.company_id} onValueChange={(value) => setUserForm({ ...userForm, company_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setUserDialogOpen(false);
                    setEditingUser(null);
                    setUserForm({ email: "", full_name: "", phone: "", password: "", role: "employee", company_id: "" });
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={editingUser ? handleUpdateUser : handleCreateUser}>
                    {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium">{user.full_name || "Sin nombre"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.role === "superadmin" ? "destructive" :
                          user.role === "owner" ? "default" :
                          user.role === "admin" ? "secondary" :
                          user.role === "employee" ? "outline" :
                          "secondary"
                        }
                        className={
                          user.role === "superadmin" ? "bg-purple-600" :
                          user.role === "owner" ? "bg-blue-600" :
                          user.role === "admin" ? "bg-green-600" :
                          user.role === "employee" ? "bg-orange-600" :
                          "bg-gray-500"
                        }
                      >
                        {user.role === "superadmin" ? "SuperAdmin" :
                         user.role === "owner" ? "Owner" :
                         user.role === "admin" ? "Admin" :
                         user.role === "employee" ? "Podólogo" :
                         user.role === "patient" ? "Paciente" :
                         "Sin Asignar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{user.company_name || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.is_active ? "default" : "secondary"} 
                        className={user.is_active ? "bg-green-500" : "bg-gray-500"}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Integraciones Tab */}
      {activeTabId === "integraciones" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Integraciones Globales</h1>
            <p className="text-gray-600">Configuración de APIs y servicios externos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">WhatsApp API</h3>
                    <p className="text-sm text-gray-600">Notificaciones automáticas</p>
                  </div>
                </div>
                <Switch
                  checked={settingsForm.whatsapp_enabled}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, whatsapp_enabled: checked })}
                />
              </div>

              {settingsForm.whatsapp_enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>URL del Servidor</Label>
                    <Input
                      value={settingsForm.whatsapp_server_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_server_url: e.target.value })}
                      placeholder="https://api.whatsapp.com"
                    />
                  </div>
                  <div>
                    <Label>Instancia por Defecto</Label>
                    <Input
                      value={settingsForm.whatsapp_default_instance}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_default_instance: e.target.value })}
                      placeholder="podoagenda-main"
                    />
                  </div>
                  <div>
                    <Label>API Token</Label>
                    <Input
                      type="password"
                      value={settingsForm.whatsapp_api_token}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_api_token: e.target.value })}
                      placeholder="Token de autenticación"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Mercado Pago */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Mercado Pago</h3>
                    <p className="text-sm text-gray-600">Procesamiento de pagos</p>
                  </div>
                </div>
                <Switch
                  checked={settingsForm.mercadopago_enabled}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, mercadopago_enabled: checked })}
                />
              </div>

              {settingsForm.mercadopago_enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Public Key</Label>
                    <Input
                      value={settingsForm.mercadopago_public_key}
                      onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_public_key: e.target.value })}
                      placeholder="APP_USR-..."
                    />
                  </div>
                  <div>
                    <Label>Access Token</Label>
                    <Input
                      type="password"
                      value={settingsForm.mercadopago_access_token}
                      onChange={(e) => setSettingsForm({ ...settingsForm, mercadopago_access_token: e.target.value })}
                      placeholder="APP_USR-..."
                    />
                  </div>
                  <div>
                    <Label>Modo</Label>
                    <Select 
                      value={settingsForm.mercadopago_mode} 
                      onValueChange={(value) => setSettingsForm({ ...settingsForm, mercadopago_mode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                        <SelectItem value="production">Producción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </Card>

            {/* Stripe */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Stripe</h3>
                    <p className="text-sm text-gray-600">Pagos internacionales</p>
                  </div>
                </div>
                <Switch
                  checked={settingsForm.stripe_enabled}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, stripe_enabled: checked })}
                />
              </div>

              {settingsForm.stripe_enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Public Key</Label>
                    <Input
                      value={settingsForm.stripe_public_key}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stripe_public_key: e.target.value })}
                      placeholder="pk_..."
                    />
                  </div>
                  <div>
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      value={settingsForm.stripe_secret_key}
                      onChange={(e) => setSettingsForm({ ...settingsForm, stripe_secret_key: e.target.value })}
                      placeholder="sk_..."
                    />
                  </div>
                  <div>
                    <Label>Modo</Label>
                    <Select 
                      value={settingsForm.stripe_mode} 
                      onValueChange={(value) => setSettingsForm({ ...settingsForm, stripe_mode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="live">Live (Producción)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSaveGlobalSettings}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Save className="w-5 h-5" />
              Guardar Configuración Global
            </Button>
          </div>
        </div>
      )}

      {/* Personalización Tab */}
      {activeTabId === "personalizacion" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalización del Sistema</h1>
            <p className="text-gray-600">Configura colores, temas y logos para cada empresa</p>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Palette className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">Temas por Empresa</h3>
                <p className="text-sm text-gray-600">Cada empresa puede tener su propia identidad visual</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="p-6 border-2">
                  <div className="flex items-center gap-4 mb-4">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${(company.metadata as any)?.primary_color || '#2563EB'}, ${(company.metadata as any)?.secondary_color || '#8B5CF6'})` }}
                      >
                        {company.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{company.name}</h4>
                      <p className="text-sm text-gray-600">{company.slug}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: (company.metadata as any)?.primary_color || '#2563EB' }} />
                      <div>
                        <p className="text-sm font-medium">Color Primario</p>
                        <p className="text-xs text-gray-600">{(company.metadata as any)?.primary_color || '#2563EB'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: (company.metadata as any)?.secondary_color || '#8B5CF6' }} />
                      <div>
                        <p className="text-sm font-medium">Color Secundario</p>
                        <p className="text-xs text-gray-600">{(company.metadata as any)?.secondary_color || '#8B5CF6'}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      setEditingCompany(company);
                      const integrations = company.integrations || {};
                      setCompanyForm({
                        name: company.name || "",
                        slug: company.slug || "",
                        email: company.email || "",
                        phone: company.phone || "",
                        address: company.address || "",
                        logo_url: company.logo_url || "",
                        primary_color: (company.metadata as any)?.primary_color || "#2563EB",
                        secondary_color: (company.metadata as any)?.secondary_color || "#8B5CF6",
                        plan: company.plan || "",
                        custom_plan: company.custom_plan || false,
                        max_users: company.max_users || -1,
                        max_podiatrists: company.max_podiatrists || -1,
                        max_monthly_appointments: company.max_monthly_appointments || -1,
                        admin_email: "",
                        admin_name: "",
                        admin_password: "",
                        whatsapp_enabled: integrations.whatsapp?.enabled || false,
                        whatsapp_instance: integrations.whatsapp?.instance_name || "",
                        whatsapp_use_global: integrations.whatsapp?.use_global !== false,
                        mercadopago_enabled: integrations.mercadopago?.enabled || false,
                        mercadopago_public_key: integrations.mercadopago?.public_key || "",
                        mercadopago_access_token: integrations.mercadopago?.access_token || "",
                        mercadopago_use_global: integrations.mercadopago?.use_global !== false,
                      });
                      setCompanyDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Tema
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Configuración Tab */}
      {activeTabId === "configuracion" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración Global</h1>
            <p className="text-gray-600">Ajustes generales del sistema</p>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">Información del Sistema</h3>
                <p className="text-sm text-gray-600">Versión y configuraciones globales</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Detalles del Sistema</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Versión</p>
                    <p className="text-lg font-semibold">PodoAgenda Pro v1.0</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Base de Datos</p>
                    <p className="text-lg font-semibold">PostgreSQL (Supabase)</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Empresas Totales</p>
                    <p className="text-lg font-semibold">{stats.totalCompanies}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Usuarios Totales</p>
                    <p className="text-lg font-semibold">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Planes Disponibles</h4>
                <div className="grid grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="p-6 border-2">
                      <div className="text-center mb-4">
                        {getPlanBadge(plan.id, false)}
                        <p className="text-3xl font-bold mt-2">${plan.price_monthly}</p>
                        <p className="text-sm text-gray-600">por mes</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{plan.max_users > 0 ? `${plan.max_users} usuarios` : 'Usuarios ilimitados'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{plan.max_podiatrists > 0 ? `${plan.max_podiatrists} podólogos` : 'Podólogos ilimitados'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{plan.max_monthly_appointments > 0 ? `${plan.max_monthly_appointments} citas/mes` : 'Citas ilimitadas'}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </SuperAdminLayout>
  );
}