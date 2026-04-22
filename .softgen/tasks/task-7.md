---
title: Availability Page (Shareable)
status: todo
priority: medium
type: feature
tags: [marketing, availability]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 7
---

## Notes
Página compartible tipo marketing para cada podólogo (/disponibilidad/[slug]). Header limpio, foto profesional, descripción, servicios que ofrece, agenda visual con horarios disponibles como pills elegantes. Botón final "Reservar ahora" que lleva a /agenda pre-seleccionando ese podólogo.

## Checklist
- [ ] Ruta dinámica /disponibilidad/[slug]
- [ ] Header limpio con logo + botón "Agendar"
- [ ] Hero section: foto grande del podólogo (profesional), nombre, especialidad, breve bio
- [ ] Servicios section: cards servicios que ofrece este podólogo con duración y precio
- [ ] Agenda visual: calendario semanal, horarios disponibles como pills tipo Calendly
- [ ] Pills horarios: hover elegante, selección animada, estados (disponible/ocupado/seleccionado)
- [ ] Botón CTA: "Reservar ahora" que lleva a /agenda con podólogo pre-seleccionado
- [ ] Datos mock: 2-3 podólogos con slugs únicos, horarios variados

## Acceptance
- Página se ve tipo landing de marketing profesional
- Flujo completo: seleccionar horario → botón reservar → redirect a /agenda
- Diseño premium, compartible en redes sociales