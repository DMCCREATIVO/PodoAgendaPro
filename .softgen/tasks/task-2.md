---
title: Booking Flow (Agenda)
status: done
priority: high
type: feature
tags: [booking, stepper, calendar]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 2
---

## Notes
Sistema de reserva en 5 pasos con stepper visual moderno y animaciones fluidas. Cada paso debe tener feedback inmediato, validación clara, transiciones suaves. Calendario limpio estilo premium, horarios como botones tipo pill con hover elegante.

## Checklist
- [x] Stepper component: 5 steps con progreso visual (Servicio → Podólogo → Fecha → Datos → Confirmación)
- [x] Step 1 - Servicios: cards seleccionables con duración y precio
- [x] Step 2 - Podólogo: cards con foto, nombre, especialidad, selección animada
- [x] Step 3 - Fecha: calendario limpio, deshabilitar fechas pasadas y no disponibles
- [x] Step 4 - Horarios: bloques disponibles como pills, validar no solapamiento
- [x] Step 5 - Datos: formulario (nombre, email, teléfono, notas opcionales)
- [x] Step 6 - Confirmación: resumen elegante + botón "Confirmar Reserva"
- [x] Lógica validación: no doble reserva, no fechas pasadas, bloques por duración servicio

## Acceptance
- Flujo completo funcional sin errores
- Animaciones suaves entre pasos
- Feedback visual inmediato en cada interacción