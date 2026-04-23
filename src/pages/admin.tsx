import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Users, DollarSign, Clock, Plus, Edit, Trash2, Search, Eye, AlertCircle, CheckCircle, XCircle, User, Mail, Phone, MapPin, CreditCard, Filter, Activity, BarChart3, PieChart, Settings, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyId } from "@/hooks/useCompanyId";
import { clientService } from "@/services/clientService";
import { serviceService } from "@/services/serviceService";
import { appointmentService } from "@/services/appointmentService";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// Mock data for demographics
const DEMOGRAPHICS_DATA = {
  ageDistribution: [
    { range: "18-30", count: 45, percentage: 15 },
    { range: "31-45", count: 78, percentage: 26 },
    { range: "46-60", count: 102, percentage: 34 },
    { range: "61-75", count: 63, percentage: 21 },
    { range: "76+", count: 12, percentage: 4 },
  ],
  genderBreakdown: [
    { gender: "Femenino", count: 168, percentage: 56 },
    { gender: "Masculino", count: 120, percentage: 40 },
    { gender: "Otro", count: 12, percentage: 4 },
  ],
  locationData: [
    { comuna: "Providencia", count: 85 },
    { comuna: "Las Condes", count: 72 },
    { comuna: "Ñuñoa", count: 58 },
    { comuna: "Santiago Centro", count: 45 },
    { comuna: "Otros", count: 40 },
  ],
};

const APPOINTMENT_TRENDS = {
  monthlyVolume: [
    { month: "Ene", appointments: 145, revenue: 3625000 },
    { month: "Feb", appointments: 162, revenue: 4050000 },
    { month: "Mar", appointments: 178, revenue: 4450000 },
    { month: "Abr", appointments: 203, revenue: 5075000 },
  ],
  peakHours: [
    { hour: "09:00", count: 45 },
    { hour: "10:30", count: 62 },
    { hour: "11:00", count: 58 },
    { hour: "12:00", count: 38 },
    { hour: "14:00", count: 52 },
    { hour: "15:00", count: 68 },
    { hour: "16:00", count: 71 },
    { hour: "17:00", count: 55 },
    { hour: "18:00", count: 34 },
  ],
  servicePopularity: [
    { service: "Consulta Podológica", count: 245, revenue: 6125000 },
    { service: "Quiropodia", count: 189, revenue: 3780000 },
    { service: "Plantillas Personalizadas", count: 156, revenue: 7020000 },
    { service: "Pie Diabético", count: 98, revenue: 3430000 },
    { service: "Uñas Encarnadas", count: 87, revenue: 2175000 },
  ],
  cancellationRate: {
    total: 775,
    completed: 682,
    cancelled: 62,
    noShow: 31,
    completionRate: 88,
    cancellationRate: 8,
    noShowRate: 4,
  },
};

const MOCK_PATIENTS = [
  { id: 1, name: "Ana Silva", email: "ana@email.com", phone: "+56912345678", lastVisit: "2026-04-15", totalVisits: 3, balance: 0 },
  { id: 2, name: "Carlos López", email: "carlos@email.com", phone: "+56987654321", lastVisit: "2026-04-10", totalVisits: 1, balance: 25000 },
  { id: 3, name: "María González", email: "maria@email.com", phone: "+56911223344", lastVisit: "2026-03-20", totalVisits: 5, balance: 0 },
];

const MOCK_PODIATRISTS = [
  { id: 1, name: "Dra. Elena Rojas", specialty: "Podología Clínica", active: true, email: "elena@podos.cl", phone: "+56911111111" },
  { id: 2, name: "Dr. Roberto Méndez", specialty: "Pie Diabético", active: true, email: "roberto@podos.cl", phone: "+56922222222" },
  { id: 3, name: "Dra. Carmen Paz", specialty: "Cirugía Menor", active: false, email: "carmen@podos.cl", phone: "+56933333333" },
];

const MOCK_APPOINTMENTS = [
  { id: 1, time: "09:00", patient: "Ana Silva", service: "Consulta Podológica", podiatrist: "Dra. Elena Rojas", status: "confirmed" },
  { id: 2, time: "10:30", patient: "Carlos López", service: "Quiropodia", podiatrist: "Dr. Roberto Méndez", status: "scheduled" },
  { id: 3, time: "11:00", patient: "María González", service: "Plantillas", podiatrist: "Dra. Elena Rojas", status: "in_progress" },
];

const STATUS_CONFIG = {
  scheduled: { label: "Agendada", color: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Confirmada", color: "bg-green-100 text-green-700 border-green-200" },
  in_progress: { label: "En Atención", color: "bg-orange-100 text-orange-700 border-orange-200" },
  completed: { label: "Completada", color: "bg-accent/10 text-accent border-accent/20" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-200" },
  no_show: { label: "No asiste", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const MOCK_PAYMENTS = [
  { id: 1, date: "2026-04-20", patient: "Ana Silva", service: "Consulta Podológica", method: "Tarjeta", amount: 25000, status: "paid" },
  { id: 2, date: "2026-04-21", patient: "Carlos López", service: "Plantillas", method: "Transferencia", amount: 45000, status: "pending" },
];

const PAYMENT_STATUS = {
  paid: { label: "Pagado", color: "bg-green-100 text-green-700 border-green-200" },
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function AdminPanel() {
  const router = useRouter();
  const { toast } = useToast();
  const companyId = useCompanyId();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Real data states
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [clientModal, setClientModal] = useState({ open: false, mode: 'create' as 'create' | 'edit', data: null as any });
  const [serviceModal, setServiceModal] = useState({ open: false, mode: 'create' as 'create' | 'edit', data: null as any });
  const [appointmentModal, setAppointmentModal] = useState({ open: false, mode: 'create' as 'create' | 'edit', data: null as any });

  // Form states - Client
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    status: 'lead' as 'lead' | 'active' | 'inactive',
    tags: '',
    notes: '',
  });

  // Form states - Service
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
    color: '#2563EB',
    requires_approval: false,
    buffer_minutes: 0,
  });

  // Form states - Appointment
  const [appointmentForm, setAppointmentForm] = useState({
    client_id: '',
    service_id: '',
    assigned_to: '',
    scheduled_date: new Date(),
    scheduled_time: '09:00',
    notes: '',
  });

  // Load data on mount and when company changes
  useEffect(() => {
    if (companyId) {
      loadAllData();
    }
  }, [companyId]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [clientsData, servicesData, appointmentsData, usersData] = await Promise.all([
        clientService.getClients(companyId),
        serviceService.getServices(companyId),
        appointmentService.getAppointments(companyId),
        companyService.getCompanyUsers(companyId),
      ]);

      setClients(clientsData);
      setServices(servicesData);
      setAppointments(appointmentsData);
      setCompanyUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Error cargando datos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Client Modal Handlers
  const openCreateClientModal = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      status: 'lead',
      tags: '',
      notes: '',
    });
    setClientModal({ open: true, mode: 'create', data: null });
  };

  const openEditClientModal = (client: any) => {
    setClientForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      whatsapp: client.whatsapp || '',
      status: client.status || 'lead',
      tags: client.tags?.join(', ') || '',
      notes: client.notes || '',
    });
    setClientModal({ open: true, mode: 'edit', data: client });
  };

  const handleSaveClient = async () => {
    try {
      const clientData = {
        name: clientForm.name,
        email: clientForm.email || null,
        phone: clientForm.phone || null,
        whatsapp: clientForm.whatsapp || null,
        status: clientForm.status,
        tags: clientForm.tags ? clientForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        notes: clientForm.notes || null,
      };

      if (clientModal.mode === 'create') {
        await clientService.createClient(companyId, clientData);
        toast({ title: "Cliente creado exitosamente" });
      } else {
        await clientService.updateClient(companyId, clientModal.data.id, clientData);
        toast({ title: "Cliente actualizado exitosamente" });
      }

      setClientModal({ open: false, mode: 'create', data: null });
      loadAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Service Modal Handlers
  const openCreateServiceModal = () => {
    setServiceForm({
      name: '',
      description: '',
      duration_minutes: 30,
      price: 0,
      color: '#2563EB',
      requires_approval: false,
      buffer_minutes: 0,
    });
    setServiceModal({ open: true, mode: 'create', data: null });
  };

  const openEditServiceModal = (service: any) => {
    setServiceForm({
      name: service.name || '',
      description: service.description || '',
      duration_minutes: service.duration_minutes || 30,
      price: service.price || 0,
      color: service.color || '#2563EB',
      requires_approval: service.requires_approval || false,
      buffer_minutes: service.buffer_minutes || 0,
    });
    setServiceModal({ open: true, mode: 'edit', data: service });
  };

  const handleSaveService = async () => {
    try {
      if (serviceModal.mode === 'create') {
        await serviceService.createService(companyId, serviceForm);
        toast({ title: "Servicio creado exitosamente" });
      } else {
        await serviceService.updateService(companyId, serviceModal.data.id, serviceForm);
        toast({ title: "Servicio actualizado exitosamente" });
      }

      setServiceModal({ open: false, mode: 'create', data: null });
      loadAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Appointment Modal Handlers
  const openCreateAppointmentModal = () => {
    setAppointmentForm({
      client_id: '',
      service_id: '',
      assigned_to: '',
      scheduled_date: new Date(),
      scheduled_time: '09:00',
      notes: '',
    });
    setAppointmentModal({ open: true, mode: 'create', data: null });
  };

  const openEditAppointmentModal = (appointment: any) => {
    const scheduledDate = new Date(appointment.scheduled_at);
    setAppointmentForm({
      client_id: appointment.client_id || '',
      service_id: appointment.service_id || '',
      assigned_to: appointment.assigned_to || '',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledDate.toTimeString().slice(0, 5),
      notes: appointment.notes || '',
    });
    setAppointmentModal({ open: true, mode: 'edit', data: appointment });
  };

  const handleSaveAppointment = async () => {
    try {
      // Combine date and time
      const scheduledAt = new Date(appointmentForm.scheduled_date);
      const [hours, minutes] = appointmentForm.scheduled_time.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const selectedService = services.find(s => s.id === appointmentForm.service_id);
      const duration_minutes = selectedService?.duration_minutes || 30;

      const appointmentData = {
        client_id: appointmentForm.client_id,
        service_id: appointmentForm.service_id,
        assigned_to: appointmentForm.assigned_to || null,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes,
        notes: appointmentForm.notes || null,
        status: 'scheduled' as const,
      };

      if (appointmentModal.mode === 'create') {
        await appointmentService.createAppointment(companyId, appointmentData);
        toast({ title: "Cita creada exitosamente" });
      } else {
        await appointmentService.updateAppointment(companyId, appointmentModal.data.id, appointmentData);
        toast({ title: "Cita actualizada exitosamente" });
      }

      setAppointmentModal({ open: false, mode: 'create', data: null });
      loadAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await clientService.deleteClient(companyId, clientId);
      toast({ title: "Cliente eliminado exitosamente" });
      loadAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    
    try {
      await serviceService.deleteService(companyId, serviceId);
      toast({ title: "Servicio eliminado exitosamente" });
      loadAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    try {
      await appointmentService.cancelAppointment(companyId, appointmentId, 'Cancelada por administrador');
      toast({ title: "Cita cancelada exitosamente" });
      loadAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Calculate real KPIs
  const todayAppointments = appointments.filter(a => {
    const today = new Date().toDateString();
    const aptDate = new Date(a.scheduled_at).toDateString();
    return aptDate === today;
  });

  const completedThisMonth = appointments.filter(a => {
    const now = new Date();
    const aptDate = new Date(a.scheduled_at);
    return aptDate.getMonth() === now.getMonth() && 
           aptDate.getFullYear() === now.getFullYear() &&
           a.status === 'completed';
  });

  const monthRevenue = completedThisMonth.reduce((sum, apt) => {
    const service = services.find(s => s.id === apt.service_id);
    return sum + (service?.price || 0);
  }, 0);

  const newClientsThisMonth = clients.filter(c => {
    const now = new Date();
    const created = new Date(c.created_at);
    return created.getMonth() === now.getMonth() && 
           created.getFullYear() === now.getFullYear();
  });

  return (
    <AdminLayout activeTab={activeTab}>
      {/* Client Modal */}
      <Dialog open={clientModal.open} onOpenChange={(open) => setClientModal({ ...clientModal, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {clientModal.mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
            </DialogTitle>
            <DialogDescription>
              {clientModal.mode === 'create' 
                ? 'Completa los datos del nuevo cliente' 
                : 'Actualiza la información del cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="client-name">Nombre Completo *</Label>
              <Input
                id="client-name"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                placeholder="Juan Pérez"
                className="mt-2 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="cliente@ejemplo.cl"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="client-phone">Teléfono</Label>
                <Input
                  id="client-phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="+56 9 1234 5678"
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-whatsapp">WhatsApp</Label>
                <Input
                  id="client-whatsapp"
                  value={clientForm.whatsapp}
                  onChange={(e) => setClientForm({ ...clientForm, whatsapp: e.target.value })}
                  placeholder="+56912345678"
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="client-status">Estado</Label>
                <Select value={clientForm.status} onValueChange={(value: "lead" | "active" | "inactive") => setClientForm({ ...clientForm, status: value })}>
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="client-tags">Etiquetas (separadas por coma)</Label>
              <Input
                id="client-tags"
                value={clientForm.tags}
                onChange={(e) => setClientForm({ ...clientForm, tags: e.target.value })}
                placeholder="vip, nuevo, urgente"
                className="mt-2 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="client-notes">Notas</Label>
              <Textarea
                id="client-notes"
                value={clientForm.notes}
                onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                placeholder="Observaciones adicionales..."
                className="mt-2 rounded-xl min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setClientModal({ ...clientModal, open: false })} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSaveClient} className="rounded-xl shadow-lg shadow-primary/20" disabled={!clientForm.name}>
              {clientModal.mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Modal */}
      <Dialog open={serviceModal.open} onOpenChange={(open) => setServiceModal({ ...serviceModal, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {serviceModal.mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}
            </DialogTitle>
            <DialogDescription>
              {serviceModal.mode === 'create' 
                ? 'Define un nuevo servicio podológico' 
                : 'Actualiza la información del servicio'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="service-name">Nombre del Servicio *</Label>
              <Input
                id="service-name"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                placeholder="Consulta Podológica"
                className="mt-2 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="service-description">Descripción</Label>
              <Textarea
                id="service-description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                placeholder="Evaluación completa del pie..."
                className="mt-2 rounded-xl min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-duration">Duración (minutos) *</Label>
                <Input
                  id="service-duration"
                  type="number"
                  min="5"
                  step="5"
                  value={serviceForm.duration_minutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) || 30 })}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="service-price">Precio ($)</Label>
                <Input
                  id="service-price"
                  type="number"
                  min="0"
                  step="1000"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: parseInt(e.target.value) || 0 })}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-color">Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="service-color"
                    type="color"
                    value={serviceForm.color}
                    onChange={(e) => setServiceForm({ ...serviceForm, color: e.target.value })}
                    className="w-16 h-10 rounded-xl p-1"
                  />
                  <Input
                    value={serviceForm.color}
                    onChange={(e) => setServiceForm({ ...serviceForm, color: e.target.value })}
                    placeholder="#2563EB"
                    className="rounded-xl flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="service-buffer">Buffer (minutos)</Label>
                <Input
                  id="service-buffer"
                  type="number"
                  min="0"
                  step="5"
                  value={serviceForm.buffer_minutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, buffer_minutes: parseInt(e.target.value) || 0 })}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div>
                <Label htmlFor="service-approval" className="cursor-pointer">Requiere Aprobación</Label>
                <p className="text-xs text-muted-foreground mt-1">Las citas deben ser confirmadas manualmente</p>
              </div>
              <Switch
                id="service-approval"
                checked={serviceForm.requires_approval}
                onCheckedChange={(checked) => setServiceForm({ ...serviceForm, requires_approval: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceModal({ ...serviceModal, open: false })} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSaveService} className="rounded-xl shadow-lg shadow-primary/20" disabled={!serviceForm.name || serviceForm.duration_minutes < 1}>
              {serviceModal.mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Modal */}
      <Dialog open={appointmentModal.open} onOpenChange={(open) => setAppointmentModal({ ...appointmentModal, open })}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              {appointmentModal.mode === 'create' ? 'Nueva Cita' : 'Editar Cita'}
            </DialogTitle>
            <DialogDescription>
              {appointmentModal.mode === 'create' 
                ? 'Programa una nueva cita' 
                : 'Actualiza los detalles de la cita'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="appointment-client">Cliente *</Label>
              <Select value={appointmentForm.client_id} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, client_id: value })}>
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appointment-service">Servicio *</Label>
              <Select value={appointmentForm.service_id} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, service_id: value })}>
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter(s => s.is_active).map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min - ${service.price?.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appointment-assigned">Asignar a (opcional)</Label>
              <Select value={appointmentForm.assigned_to} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, assigned_to: value })}>
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Seleccionar podólogo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {companyUsers.filter(u => u.status === 'active').map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.user?.full_name || user.user?.email || 'Usuario'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment-date">Fecha *</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  value={appointmentForm.scheduled_date.toISOString().split('T')[0]}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduled_date: new Date(e.target.value) })}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="appointment-time">Hora *</Label>
                <Input
                  id="appointment-time"
                  type="time"
                  value={appointmentForm.scheduled_time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduled_time: e.target.value })}
                  className="mt-2 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="appointment-notes">Notas</Label>
              <Textarea
                id="appointment-notes"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                placeholder="Motivo de consulta, observaciones..."
                className="mt-2 rounded-xl min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAppointmentModal({ ...appointmentModal, open: false })} className="rounded-xl">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAppointment} 
              className="rounded-xl shadow-lg shadow-primary/20" 
              disabled={!appointmentForm.client_id || !appointmentForm.service_id}
            >
              {appointmentModal.mode === 'create' ? 'Crear Cita' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard Tab - Keep as before with analytics */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Métricas y análisis del sistema</p>
          </div>

          {/* Real KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 soft-shadow border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                  Hoy
                </Badge>
              </div>
              <h3 className="font-heading font-bold text-2xl mb-1">{todayAppointments.length}</h3>
              <p className="text-sm text-muted-foreground">Citas Hoy</p>
            </Card>

            <Card className="p-6 soft-shadow border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                  +18%
                </Badge>
              </div>
              <h3 className="font-heading font-bold text-2xl mb-1">
                ${(monthRevenue / 1000).toFixed(1)}K
              </h3>
              <p className="text-sm text-muted-foreground">Ingresos Mes</p>
            </Card>

            <Card className="p-6 soft-shadow border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                  Nuevos
                </Badge>
              </div>
              <h3 className="font-heading font-bold text-2xl mb-1">{newClientsThisMonth.length}</h3>
              <p className="text-sm text-muted-foreground">Pacientes Nuevos</p>
            </Card>

            <Card className="p-6 soft-shadow border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                  {Math.round((completedThisMonth.length / (appointments.length || 1)) * 100)}%
                </Badge>
              </div>
              <h3 className="font-heading font-bold text-2xl mb-1">
                {Math.round((completedThisMonth.length / (appointments.length || 1)) * 100)}%
              </h3>
              <p className="text-sm text-muted-foreground">Tasa Completitud</p>
            </Card>
          </div>

          {/* Analytics Tabs - Keeping original mock data for demo purposes */}
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl p-1 bg-muted/30">
              <TabsTrigger value="trends" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
                <Activity className="w-4 h-4 mr-2" />
                Tendencias
              </TabsTrigger>
              <TabsTrigger value="demographics" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
                <PieChart className="w-4 h-4 mr-2" />
                Demografía
              </TabsTrigger>
              <TabsTrigger value="performance" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Rendimiento
              </TabsTrigger>
            </TabsList>

            {/* Continue with existing tab content... */}
          </Tabs>
        </div>
      )}

      {/* Pacientes Tab */}
      {activeTab === "pacientes" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Pacientes</h1>
              <p className="text-muted-foreground">Gestión de pacientes</p>
            </div>
            <Button onClick={openCreateClientModal} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar pacientes..."
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando pacientes...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No hay pacientes registrados</p>
                <Button onClick={openCreateClientModal} variant="outline" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Paciente
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Etiquetas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-semibold">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full",
                            client.status === "active" && "bg-green-100 text-green-700 border-green-200",
                            client.status === "lead" && "bg-blue-100 text-blue-700 border-blue-200",
                            client.status === "inactive" && "bg-gray-100 text-gray-700 border-gray-200"
                          )}
                        >
                          {client.status === "active" ? "Activo" : 
                           client.status === "lead" ? "Lead" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {client.tags?.map((tag: string, i: number) => (
                            <Badge key={i} variant="outline" className="rounded-full text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-lg"
                            asChild
                          >
                            <Link href={`/paciente/${client.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => openEditClientModal(client)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-lg text-destructive" onClick={() => handleDeleteClient(client.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}