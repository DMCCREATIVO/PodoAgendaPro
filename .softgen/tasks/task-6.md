---
title: Patient Portal
status: todo
priority: medium
type: feature
tags: [patient, portal]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 6
---

## Notes
Portal del paciente con 3 tabs: Mis Citas, Historial, Pagos. IMPORTANTE: paciente NO ve ficha completa del podólogo (diagnóstico interno), solo resumen permitido (fecha, procedimiento general, recomendaciones). Diseño limpio, accesible, tranquilizador.

## Checklist
- [ ] Layout: header simple, 3 tabs
- [ ] Tab "Mis Citas": cards próximas citas con fecha/hora/podólogo/servicio, botones cancelar/reprogramar
- [ ] Regla cancelación: hasta 2 horas antes, mostrar mensaje si fuera de plazo
- [ ] Tab "Historial": timeline vertical con fecha, procedimiento resumido (NO diagnóstico interno), recomendaciones visibles
- [ ] Tab "Pagos": cards recibos con fecha, monto, método, estado (badge pagado/pendiente), botón descargar PDF
- [ ] Filtros: por fecha en historial y pagos

## Acceptance
- Paciente ve solo información permitida
- Diseño tranquilizador, fácil de usar
- Cancelación/reprogramar funcional con validación horario