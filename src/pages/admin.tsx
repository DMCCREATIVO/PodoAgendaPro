import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Users, DollarSign, Clock, Plus, Edit, Trash2, Search, Eye, AlertCircle, CheckCircle, XCircle, User, Mail, Phone, MapPin, CreditCard, Filter, Activity, BarChart3, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

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
    { hour: "10:00", count: 62 },
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

export default function Admin() {
  const router = useRouter();
  const activeTab = (router.query.tab as string) || "dashboard";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <AdminLayout activeTab={activeTab}>
      {/* Dashboard Tab - Enhanced with Analytics */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Métricas y análisis del sistema</p>
          </div>

          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 soft-shadow border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                  +12%
                </Badge>
              </div>
              <h3 className="font-heading font-bold text-2xl mb-1">24</h3>
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
              <h3 className="font-heading font-bold text-2xl mb-1">$5.1M</h3>
              <p className="text-sm text-muted-foreground">Ingresos Mes</p>
            </Card>

            <Card className="p-6 soft-shadow border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                  +8%
                </Badge>
              </div>
              <h3 className="font-heading font-bold text-2xl mb-1">43</h3>
              <p className="text-sm text-muted-foreground">Pacientes Nuevos</p>
            </Card>

            <Card className="p-6 soft-shadow border-0 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
                <Badge variant="outline" className="rounded-full bg-green-100 text-green-700 border-green-200">
                  88%
                </Badge>
              </div>
              <h3 className="font-heading font-bold text-2xl mb-1">88%</h3>
              <p className="text-sm text-muted-foreground">Tasa Ocupación</p>
            </Card>
          </div>

          {/* Analytics Tabs */}
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

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6 mt-6">
              {/* Monthly Volume Chart */}
              <Card className="p-6 soft-shadow border-0">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-heading font-bold text-xl mb-1">Volumen de Citas Mensual</h3>
                    <p className="text-sm text-muted-foreground">Últimos 4 meses</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">2026</Badge>
                </div>

                <div className="space-y-4">
                  {APPOINTMENT_TRENDS.monthlyVolume.map((month, index) => {
                    const maxAppointments = Math.max(...APPOINTMENT_TRENDS.monthlyVolume.map(m => m.appointments));
                    const percentage = (month.appointments / maxAppointments) * 100;
                    
                    return (
                      <div key={month.month}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{month.month}</span>
                          <div className="text-right">
                            <span className="font-bold text-lg">{month.appointments}</span>
                            <span className="text-sm text-muted-foreground ml-2">citas</span>
                          </div>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground text-right">
                          ${(month.revenue / 1000000).toFixed(1)}M ingresos
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Peak Hours */}
              <Card className="p-6 soft-shadow border-0">
                <h3 className="font-heading font-bold text-xl mb-6">Horarios de Mayor Demanda</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
                  {APPOINTMENT_TRENDS.peakHours.map((slot) => {
                    const maxCount = Math.max(...APPOINTMENT_TRENDS.peakHours.map(s => s.count));
                    const isPeak = slot.count === maxCount;
                    
                    return (
                      <div key={slot.hour} className="text-center">
                        <div 
                          className={cn(
                            "rounded-xl p-3 mb-2 transition-all",
                            isPeak 
                              ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg" 
                              : "bg-muted/30"
                          )}
                        >
                          <div className="font-bold text-sm">{slot.hour}</div>
                          <div className="text-xs mt-1">{slot.count}</div>
                        </div>
                        {isPeak && (
                          <Badge variant="outline" className="rounded-full text-xs bg-accent/10 text-accent border-accent/20">
                            Peak
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Service Popularity */}
              <Card className="p-6 soft-shadow border-0">
                <h3 className="font-heading font-bold text-xl mb-6">Servicios Más Solicitados</h3>
                <div className="space-y-4">
                  {APPOINTMENT_TRENDS.servicePopularity.map((service, index) => {
                    const maxCount = Math.max(...APPOINTMENT_TRENDS.servicePopularity.map(s => s.count));
                    const percentage = (service.count / maxCount) * 100;
                    
                    return (
                      <div key={service.service} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                              index === 0 ? "bg-yellow-100 text-yellow-700" :
                              index === 1 ? "bg-gray-100 text-gray-700" :
                              index === 2 ? "bg-orange-100 text-orange-700" :
                              "bg-muted/50 text-muted-foreground"
                            )}>
                              {index + 1}
                            </div>
                            <span className="font-semibold">{service.service}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{service.count} citas</div>
                            <div className="text-sm text-muted-foreground">${(service.revenue / 1000000).toFixed(2)}M</div>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 group-hover:from-accent group-hover:to-primary")}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* Demographics Tab */}
            <TabsContent value="demographics" className="space-y-6 mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Age Distribution */}
                <Card className="p-6 soft-shadow border-0">
                  <h3 className="font-heading font-bold text-xl mb-6">Distribución por Edad</h3>
                  <div className="space-y-4">
                    {DEMOGRAPHICS_DATA.ageDistribution.map((age) => (
                      <div key={age.range}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{age.range} años</span>
                          <span className="text-sm text-muted-foreground">{age.count} pacientes</span>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                            style={{ width: `${age.percentage}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-right text-muted-foreground">{age.percentage}%</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Rango Predominante</p>
                        <p className="text-sm text-muted-foreground">46-60 años (34% del total)</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Gender Breakdown */}
                <Card className="p-6 soft-shadow border-0">
                  <h3 className="font-heading font-bold text-xl mb-6">Distribución por Género</h3>
                  <div className="space-y-6">
                    {DEMOGRAPHICS_DATA.genderBreakdown.map((gender, index) => {
                      const colors = [
                        { bg: "bg-pink-100", text: "text-pink-700", bar: "from-pink-500 to-pink-400" },
                        { bg: "bg-blue-100", text: "text-blue-700", bar: "from-blue-500 to-blue-400" },
                        { bg: "bg-purple-100", text: "text-purple-700", bar: "from-purple-500 to-purple-400" },
                      ];
                      const color = colors[index];
                      
                      return (
                        <div key={gender.gender}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", color.text)}>
                                {gender.gender === "Femenino" ? "F" : gender.gender === "Masculino" ? "M" : "O"}
                              </div>
                              <span className="font-semibold">{gender.gender}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{gender.count}</div>
                              <div className="text-xs text-muted-foreground">{gender.percentage}%</div>
                            </div>
                          </div>
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-gradient-to-r", color.bar)}
                              style={{ width: `${gender.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {DEMOGRAPHICS_DATA.genderBreakdown.map((gender, index) => {
                      const colors = ["bg-pink-500", "bg-blue-500", "bg-purple-500"];
                      return (
                        <div key={gender.gender} className="text-center p-3 rounded-xl bg-muted/30">
                          <div className={cn("w-3 h-3 rounded-full mx-auto mb-2", colors[index])} />
                          <div className="font-bold text-sm">{gender.percentage}%</div>
                          <div className="text-xs text-muted-foreground">{gender.gender}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Location Data */}
              <Card className="p-6 soft-shadow border-0">
                <h3 className="font-heading font-bold text-xl mb-6">Distribución Geográfica</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {DEMOGRAPHICS_DATA.locationData.map((location, index) => (
                    <div key={location.comuna} className="p-4 rounded-xl bg-muted/30 hover-lift">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">{location.comuna}</span>
                      </div>
                      <div className="font-bold text-2xl">{location.count}</div>
                      <div className="text-xs text-muted-foreground mt-1">pacientes</div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6 mt-6">
              {/* Completion Rates */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 soft-shadow border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-3xl mb-1">
                    {APPOINTMENT_TRENDS.cancellationRate.completionRate}%
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Tasa de Completitud</p>
                  <div className="text-xs text-green-600 font-semibold">
                    {APPOINTMENT_TRENDS.cancellationRate.completed} de {APPOINTMENT_TRENDS.cancellationRate.total} citas
                  </div>
                </Card>

                <Card className="p-6 soft-shadow border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-3xl mb-1">
                    {APPOINTMENT_TRENDS.cancellationRate.cancellationRate}%
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Tasa de Cancelación</p>
                  <div className="text-xs text-orange-600 font-semibold">
                    {APPOINTMENT_TRENDS.cancellationRate.cancelled} citas canceladas
                  </div>
                </Card>

                <Card className="p-6 soft-shadow border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <h3 className="font-heading font-bold text-3xl mb-1">
                    {APPOINTMENT_TRENDS.cancellationRate.noShowRate}%
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Tasa de Inasistencia</p>
                  <div className="text-xs text-red-600 font-semibold">
                    {APPOINTMENT_TRENDS.cancellationRate.noShow} pacientes no asistieron
                  </div>
                </Card>
              </div>

              {/* Revenue Breakdown */}
              <Card className="p-6 soft-shadow border-0">
                <h3 className="font-heading font-bold text-xl mb-6">Ingresos por Servicio</h3>
                <div className="space-y-3">
                  {APPOINTMENT_TRENDS.servicePopularity.map((service) => {
                    const totalRevenue = APPOINTMENT_TRENDS.servicePopularity.reduce((sum, s) => sum + s.revenue, 0);
                    const percentage = (service.revenue / totalRevenue) * 100;
                    
                    return (
                      <div key={service.service} className="p-4 rounded-xl bg-muted/30 hover-lift">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{service.service}</span>
                          <span className="font-bold text-accent">${(service.revenue / 1000000).toFixed(2)}M</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 relative h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-green-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[3rem] text-right">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Ingresos Totales</span>
                    <span className="font-bold text-2xl text-accent">
                      ${(APPOINTMENT_TRENDS.servicePopularity.reduce((sum, s) => sum + s.revenue, 0) / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Agenda Tab */}
      {activeTab === "agenda" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Agenda</h1>
              <p className="text-muted-foreground">Gestión de citas</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-2xl shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Agendar Nueva Cita</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Paciente</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PATIENTS.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Servicio</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consulta">Consulta Podológica</SelectItem>
                          <SelectItem value="quiropodia">Quiropodia</SelectItem>
                          <SelectItem value="diabetico">Pie Diabético</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Podólogo</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Seleccionar podólogo" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PODIATRISTS.filter(p => p.active).map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha y Hora</Label>
                      <Input type="datetime-local" className="rounded-xl" />
                    </div>
                  </div>
                  <Button className="w-full rounded-2xl h-12">Agendar Cita</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 p-6 soft-shadow border-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-2xl"
              />
            </Card>

            <Card className="lg:col-span-2 p-6 soft-shadow border-0">
              <h2 className="font-heading font-bold text-xl mb-4">
                Citas del {selectedDate?.toLocaleDateString("es-CL", { day: "numeric", month: "long" })}
              </h2>
              <div className="space-y-3">
                {MOCK_APPOINTMENTS.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{apt.time}</span>
                      </div>
                      <p className="font-medium">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground">{apt.service} - {apt.podiatrist}</p>
                    </div>
                    <Badge variant="outline" className={cn("rounded-full", STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].color)}>
                      {STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG].label}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Podólogos Tab */}
      {activeTab === "podologos" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Podólogos</h1>
              <p className="text-muted-foreground">Gestión de profesionales</p>
            </div>
            <Button className="rounded-2xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Podólogo
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PODIATRISTS.map((pod) => (
              <Card key={pod.id} className="p-6 soft-shadow border-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent" />
                  <Switch checked={pod.active} />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">{pod.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{pod.specialty}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{pod.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{pod.phone}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1 rounded-xl">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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
            <Button className="rounded-2xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Buscar paciente..." className="pl-10 rounded-xl h-12" />
              </div>
              <Button variant="outline" className="rounded-xl h-12">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Total Visitas</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PATIENTS.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{patient.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{patient.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>{patient.totalVisits}</TableCell>
                    <TableCell>
                      {patient.balance > 0 ? (
                        <span className="text-destructive font-semibold">${patient.balance.toLocaleString()}</span>
                      ) : (
                        <span className="text-accent">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <Edit className="w-4 h-4" />
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

      {/* Cobros Tab */}
      {activeTab === "cobros" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Cobros</h1>
            <p className="text-muted-foreground">Gestión de pagos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 soft-shadow border-0">
              <p className="text-muted-foreground text-sm mb-1">Cobrado Hoy</p>
              <p className="font-heading font-bold text-3xl text-accent">$47.000</p>
            </Card>
            <Card className="p-6 soft-shadow border-0">
              <p className="text-muted-foreground text-sm mb-1">Cobrado Mes</p>
              <p className="font-heading font-bold text-3xl">$1.250.000</p>
            </Card>
            <Card className="p-6 soft-shadow border-0">
              <p className="text-muted-foreground text-sm mb-1">Pendientes</p>
              <p className="font-heading font-bold text-3xl text-chart-3">$45.000</p>
            </Card>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PAYMENTS.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="font-medium">{payment.patient}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span>{payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS].color)}>
                        {PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === "config" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Configuración</h1>
            <p className="text-muted-foreground">Ajustes del sistema</p>
          </div>

          <Card className="p-6 soft-shadow border-0 max-w-2xl">
            <h2 className="font-heading font-bold text-xl mb-6">Información de la Clínica</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Clínica</Label>
                <Input defaultValue="PODOS PRO" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input defaultValue="Av. Principal 123, Santiago" className="rounded-xl h-12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input defaultValue="+56 2 1234 5678" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="contacto@podos.cl" className="rounded-xl h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Horario de Atención</Label>
                <Input defaultValue="Lun-Vie 9:00-18:00, Sáb 9:00-13:00" className="rounded-xl h-12" />
              </div>
              <Button className="rounded-2xl h-12 shadow-lg shadow-primary/20">
                Guardar Cambios
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}