---
title: Patient Portal
status: done
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
- [x] Layout: Sidebar neutral glassmorphism con logo, nav items, responsive bottom nav mobile
- [x] Tab Mis Citas: cards elegantes con próximas citas (fecha, hora, podólogo, estado), historial con badges
- [x] Tab Historial: timeline visual con notas públicas, NO mostrar diagnósticos internos
- [x] Tab Pagos: cards de recibos con fecha, monto, estado (pagado/pendiente), botón descargar PDF
- [x] Tab Configuración: formulario perfil personal (nombre, email, teléfono, dirección)
- [x] Botón "Agendar Nueva Cita" destacado que lleva a /agenda
- [x] Responsive perfecto en mobile

## Acceptance
- Portal paciente completamente funcional con datos mock realistas
- Solo muestra información permitida (sin datos clínicos sensibles)
- Diseño amigable y fácil de usar para pacientes no técnicos