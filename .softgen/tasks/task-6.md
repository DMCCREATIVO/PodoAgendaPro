---
title: Patient Portal
status: in_progress
priority: high
type: feature
tags: [patient, portal, appointments]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 6
---

## Notes
Portal de pacientes con sidebar neutral glassmorphism. 4 tabs: Mis Citas (próximas + historial con badges de estado), Historial Clínico (solo info pública permitida, timeline visual), Pagos (cards de recibos con estados), Configuración (perfil personal del paciente). Diseño limpio y amigable, sin terminología técnica compleja.

## Checklist
- [ ] Layout: Sidebar neutral glassmorphism con logo, nav items, responsive bottom nav mobile
- [ ] Tab Mis Citas: cards elegantes con próximas citas (fecha, hora, podólogo, estado), historial con badges
- [ ] Tab Historial: timeline visual con notas públicas, NO mostrar diagnósticos internos
- [ ] Tab Pagos: cards de recibos con fecha, monto, estado (pagado/pendiente), botón descargar PDF
- [ ] Tab Configuración: formulario perfil personal (nombre, email, teléfono, dirección)
- [ ] Botón "Agendar Nueva Cita" destacado que lleva a /agenda
- [ ] Responsive perfecto en mobile

## Acceptance
- Portal paciente completamente funcional con datos mock realistas
- Solo muestra información permitida (sin datos clínicos sensibles)
- Diseño amigable y fácil de usar para pacientes no técnicos