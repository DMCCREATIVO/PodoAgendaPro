import { useState } from "react";
import { useRouter } from "next/router";
import { PodiatristLayout } from "@/components/podiatrist/PodiatristLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, User, Phone, Mail, Calendar, AlertCircle, CheckCircle, 
  FileText, Save, DollarSign, ArrowRight, Eye, Search, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_TODAY_APPOINTMENTS = [
  { id: 1, time: "09:00", patient: "María González", service: "Consulta Podológica", status: "scheduled", isNext: true },
  { id: 2, time: "10:30", patient: "Carlos Ramírez", service: "Quiropodia", status: "scheduled", isNext: false },
  { id: 3, time: "14:00", patient: "Ana Martínez", service: "Pie Diabético", status: "scheduled", isNext: false },
  { id: 4, time: "15:30", patient: "Juan Pérez", service: "Plantillas", status: "scheduled", isNext: false },
];

const MOCK_PATIENT_DATA = {
  id: 1,
  name: "María González",
  age: 58,
  email: "maria@ejemplo.cl",
  phone: "+56 9 1111 2222",
  conditions: ["Diabético Tipo 2", "Hipertensión"],
  allergies: ["Ninguna conocida"],
  lastVisit: "2026-03-15",
  totalVisits: 8,
};

const MOCK_PATIENT_HISTORY = [
  { id: 1, date: "2026-03-15", diagnosis: "Hiperqueratosis plantar", treatment: "Quiropodia + crema queratolítica", nextVisit: "2026-04-15" },
  { id: 2, date: "2026-02-10", diagnosis: "Onicocriptosis hallux izquierdo", treatment: "Espiculectomía + educación", nextVisit: "2026-03-15" },
];

const MOCK_MY_PATIENTS = [
  { id: 1, name: "María González", lastVisit: "2026-04-15", totalVisits: 8, conditions: ["Diabético"], nextVisit: "2026-04-22" },
  { id: 2, name: "Carlos Ramírez", lastVisit: "2026-04-20", totalVisits: 3, conditions: [], nextVisit: "2026-05-01" },
  { id: 3, name: "Ana Martínez", lastVisit: "2026-04-18", totalVisits: 12, conditions: ["Pie Plano"], nextVisit: "2026-04-25" },
];

export default function Podologo() {
  const router = useRouter();
  const activeTab = (router.query.tab as string) || "dia";

  // Atencion tab state
  const [selectedPatient, setSelectedPatient] = useState<number | null>(1);
  const [ficha, setFicha] = useState({
    generalEval: "",
    nailStatus: "",
    skinStatus: "",
    hasFungus: false,
    hasCalluses: false,
    painLevel: [3],
    diagnosis: "",
    procedures: "",
    recommendations: "",
    nextVisit: "",
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSaveFicha = () => {
    alert("Ficha guardada correctamente (mock)");
  };

  const handleFinishAttention = () => {
    alert("Atención finalizada (mock)");
  };

  const handleCharge = () => {
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    alert("Pago registrado correctamente (mock)");
    setShowPaymentModal(false);
  };

  return (
    <PodiatristLayout activeTab={activeTab}>
      {/* Mi Día Tab */}
      {activeTab === "dia" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Mi Día</h1>
            <p className="text-muted-foreground">Agenda de hoy - {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>

          {/* Next Patient Card */}
          <Card className="p-6 soft-shadow border-2 border-accent bg-gradient-to-br from-accent/5 to-background">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <Badge variant="secondary" className="rounded-full mb-2">
                  Próximo Paciente
                </Badge>
                <h2 className="font-heading font-bold text-2xl">
                  {MOCK_TODAY_APPOINTMENTS.find(a => a.isNext)?.patient}
                </h2>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-lg text-foreground">
                    {MOCK_TODAY_APPOINTMENTS.find(a => a.isNext)?.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{MOCK_TODAY_APPOINTMENTS.find(a => a.isNext)?.service}</span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button size="lg" className="rounded-2xl shadow-lg shadow-accent/30" asChild>
                  <a href="?tab=atencion">
                    Iniciar Atención
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* Today's Schedule */}
          <Card className="p-6 soft-shadow border-0">
            <h2 className="font-heading font-bold text-xl mb-4">Agenda del Día</h2>
            <div className="space-y-3">
              {MOCK_TODAY_APPOINTMENTS.map((apt) => (
                <div
                  key={apt.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-colors",
                    apt.isNext ? "bg-accent/5 border-2 border-accent" : "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{apt.time}</span>
                      {apt.isNext && (
                        <Badge variant="secondary" className="rounded-full bg-accent text-accent-foreground ml-2">
                          Próximo
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium">{apt.patient}</p>
                    <p className="text-sm text-muted-foreground">{apt.service}</p>
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    Ver Ficha
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Atención Tab - CLINICAL CORE */}
      {activeTab === "atencion" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="font-heading font-bold text-3xl mb-2">Atención Clínica</h1>
            <p className="text-muted-foreground">Ficha podológica del paciente</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Patient Info Column */}
            <Card className="lg:col-span-1 p-6 soft-shadow border-0 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto" />
                <div>
                  <h2 className="font-heading font-bold text-xl">{MOCK_PATIENT_DATA.name}</h2>
                  <p className="text-muted-foreground">{MOCK_PATIENT_DATA.age} años</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{MOCK_PATIENT_DATA.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{MOCK_PATIENT_DATA.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Última visita: {MOCK_PATIENT_DATA.lastVisit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{MOCK_PATIENT_DATA.totalVisits} visitas totales</span>
                </div>
              </div>

              {/* Alerts */}
              {MOCK_PATIENT_DATA.conditions.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm font-semibold text-chart-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>Condiciones Especiales</span>
                  </div>
                  {MOCK_PATIENT_DATA.conditions.map((condition, i) => (
                    <Badge key={i} variant="outline" className="rounded-full bg-chart-3/10 text-chart-3 border-chart-3/20">
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}

              {/* History */}
              <div className="pt-4 border-t">
                <h3 className="font-heading font-semibold mb-3">Historial Reciente</h3>
                <div className="space-y-3">
                  {MOCK_PATIENT_HISTORY.map((visit) => (
                    <div key={visit.id} className="p-3 rounded-xl bg-muted/30 text-xs space-y-1">
                      <div className="font-semibold">{visit.date}</div>
                      <div className="text-muted-foreground">{visit.diagnosis}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Clinical Form Column */}
            <Card className="lg:col-span-2 p-6 soft-shadow border-0">
              <h2 className="font-heading font-bold text-2xl mb-6">Ficha Podológica</h2>
              
              <div className="space-y-6">
                {/* Evaluación General */}
                <div className="space-y-3 p-4 rounded-2xl bg-muted/20">
                  <h3 className="font-heading font-semibold text-lg">Evaluación General</h3>
                  <Textarea
                    placeholder="Observaciones generales del estado del pie..."
                    value={ficha.generalEval}
                    onChange={(e) => setFicha({ ...ficha, generalEval: e.target.value })}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                {/* Estado de Uñas */}
                <div className="space-y-3 p-4 rounded-2xl bg-muted/20">
                  <h3 className="font-heading font-semibold text-lg">Estado de Uñas</h3>
                  <Textarea
                    placeholder="Color, grosor, forma, onicomicosis, encarnamiento..."
                    value={ficha.nailStatus}
                    onChange={(e) => setFicha({ ...ficha, nailStatus: e.target.value })}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                {/* Estado de Piel */}
                <div className="space-y-3 p-4 rounded-2xl bg-muted/20">
                  <h3 className="font-heading font-semibold text-lg">Estado de Piel</h3>
                  <Textarea
                    placeholder="Hidratación, grietas, fisuras, color..."
                    value={ficha.skinStatus}
                    onChange={(e) => setFicha({ ...ficha, skinStatus: e.target.value })}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                {/* Checkboxes */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-2xl bg-muted/20">
                    <Checkbox
                      id="fungus"
                      checked={ficha.hasFungus}
                      onCheckedChange={(checked) => setFicha({ ...ficha, hasFungus: checked as boolean })}
                    />
                    <Label htmlFor="fungus" className="font-medium cursor-pointer">
                      Presencia de Hongos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-2xl bg-muted/20">
                    <Checkbox
                      id="calluses"
                      checked={ficha.hasCalluses}
                      onCheckedChange={(checked) => setFicha({ ...ficha, hasCalluses: checked as boolean })}
                    />
                    <Label htmlFor="calluses" className="font-medium cursor-pointer">
                      Callosidades/Durezas
                    </Label>
                  </div>
                </div>

                {/* Pain Level Slider */}
                <div className="space-y-3 p-4 rounded-2xl bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="font-heading font-semibold text-lg">Nivel de Dolor</Label>
                    <Badge variant="secondary" className="rounded-full text-lg px-4 py-1">
                      {ficha.painLevel[0]}/10
                    </Badge>
                  </div>
                  <Slider
                    value={ficha.painLevel}
                    onValueChange={(value) => setFicha({ ...ficha, painLevel: value })}
                    max={10}
                    step={1}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Sin dolor</span>
                    <span>Dolor máximo</span>
                  </div>
                </div>

                {/* Diagnóstico */}
                <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border-2 border-primary/20">
                  <h3 className="font-heading font-semibold text-lg text-primary">Diagnóstico</h3>
                  <Textarea
                    placeholder="Diagnóstico clínico podológico..."
                    value={ficha.diagnosis}
                    onChange={(e) => setFicha({ ...ficha, diagnosis: e.target.value })}
                    className="rounded-xl min-h-[100px] bg-background"
                  />
                </div>

                {/* Procedimientos */}
                <div className="space-y-3 p-4 rounded-2xl bg-muted/20">
                  <h3 className="font-heading font-semibold text-lg">Procedimientos Realizados</h3>
                  <Textarea
                    placeholder="Quiropodia, fresado, corte de uñas, aplicación de productos..."
                    value={ficha.procedures}
                    onChange={(e) => setFicha({ ...ficha, procedures: e.target.value })}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>

                {/* Recomendaciones */}
                <div className="space-y-3 p-4 rounded-2xl bg-accent/5 border-2 border-accent/20">
                  <h3 className="font-heading font-semibold text-lg text-accent">Recomendaciones</h3>
                  <Textarea
                    placeholder="Cuidados en casa, productos recomendados, calzado..."
                    value={ficha.recommendations}
                    onChange={(e) => setFicha({ ...ficha, recommendations: e.target.value })}
                    className="rounded-xl min-h-[100px] bg-background"
                  />
                </div>

                {/* Próxima Visita */}
                <div className="space-y-3 p-4 rounded-2xl bg-muted/20">
                  <Label className="font-heading font-semibold text-lg">Próxima Visita</Label>
                  <Input
                    type="date"
                    value={ficha.nextVisit}
                    onChange={(e) => setFicha({ ...ficha, nextVisit: e.target.value })}
                    className="rounded-xl h-12"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleSaveFicha}
                    className="flex-1 rounded-2xl h-14 text-base"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Ficha
                  </Button>
                  <Button
                    onClick={handleFinishAttention}
                    className="flex-1 rounded-2xl h-14 text-base bg-accent hover:bg-accent/90 shadow-lg shadow-accent/30"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Finalizar Atención
                  </Button>
                  <Button
                    onClick={handleCharge}
                    className="flex-1 rounded-2xl h-14 text-base shadow-lg shadow-primary/30"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Cobrar
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Modal */}
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Registrar Pago</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-2xl bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paciente:</span>
                    <span className="font-semibold">{MOCK_PATIENT_DATA.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Servicio:</span>
                    <span className="font-semibold">Consulta Podológica</span>
                  </div>
                  <div className="flex items-center justify-between text-lg pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary">$25.000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={confirmPayment}
                  className="w-full rounded-2xl h-12 shadow-lg shadow-accent/30 bg-accent hover:bg-accent/90"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirmar Pago
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Mis Pacientes Tab */}
      {activeTab === "pacientes" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">Mis Pacientes</h1>
              <p className="text-muted-foreground">Listado de pacientes</p>
            </div>
          </div>

          <Card className="p-6 soft-shadow border-0">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Buscar paciente..." className="pl-10 rounded-xl h-12" />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Total Visitas</TableHead>
                  <TableHead>Condiciones</TableHead>
                  <TableHead>Próxima Visita</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_MY_PATIENTS.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>{patient.totalVisits}</TableCell>
                    <TableCell>
                      {patient.conditions.length > 0 ? (
                        <div className="flex gap-1">
                          {patient.conditions.map((c, i) => (
                            <Badge key={i} variant="outline" className="rounded-full text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{patient.nextVisit}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </PodiatristLayout>
  );
}