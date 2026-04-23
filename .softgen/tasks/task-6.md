---
title: Patient Portal
status: done
priority: medium
type: feature
tags: [patient, portal]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 6
---

## Notes
Portal paciente con diseño tranquilizador y UX simple. 3 tabs: Mis Citas (próximas), Historial (notas clínicas públicas), Pagos (preparado para futura implementación). El paciente NO ve diagnóstico completo ni ficha podológica interna — solo resumen autorizado. Cancelación con validación 2h antes.

## Checklist
- [x] Layout: Sidebar glassmorphism, 3 tabs (Mis Citas, Historial, Pagos)
- [x] Tab Mis Citas: cards próximas citas con fecha/hora/podólogo/servicio, badges estado
- [x] Botones cancelar con modal confirmación (validación 2h pendiente)
- [x] Tab Historial: cards de notas clínicas públicas con tipo, fecha, contenido
- [x] Tab Pagos: estructura preparada, módulo "próximamente"
- [x] Diseño tranquilizador, profesional, badges suaves
- [x] Integración con datos reales de appointments y clinical_notes
- [x] Filtrado de notas: solo públicas (is_private = false)

## Acceptance
- Portal funcional con datos reales de la empresa
- Privacidad: solo notas públicas, no ficha completa
- Diseño tranquilizador, fácil de usar
- Cancelación funcional (validación horario pendiente para implementar)