---
title: Availability Page (Shareable)
status: done
priority: medium
type: feature
tags: [availability, marketing, shareable]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 7
---

## Notes
Página tipo marketing por podólogo, URL compartible (/disponibilidad/:slug). Header limpio, foto podólogo grande, descripción bio, certificaciones, servicios con duración/precio, rating/reviews. Agenda visual con calendario + horarios disponibles como botones pill modernos. Click en horario → resumen → botón "Reservar ahora" → redirect /agenda.

## Checklist
- [x] Ruta dinámica /disponibilidad/[slug] (ej: /disponibilidad/dra-gonzalez)
- [x] Hero: foto podólogo, nombre, especialidad, rating con estrellas, ubicación/email/teléfono
- [x] Card bio con descripción profesional
- [x] Grid certificaciones con iconos check
- [x] Grid servicios con nombre/duración/precio
- [x] Sección agenda: calendario limpio + grid horarios disponibles como pills
- [x] Horarios: hover elegante, click selecciona (borde accent), muestra resumen
- [x] Resumen selección: fecha + hora + podólogo, botón "Reservar ahora"
- [x] Click "Reservar" → redirect /agenda con params (podiatrist, date, time)

## Acceptance
- Página compartible con URL limpia
- Diseño profesional tipo landing personal
- Click seleccionar horario → botón reservar → redirect a /agenda
- Diseño premium, compartible en redes sociales