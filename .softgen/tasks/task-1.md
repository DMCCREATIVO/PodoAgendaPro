---
title: Design System + Landing Page
status: in_progress
priority: urgent
type: feature
tags: [design, landing, foundation]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 1
---

## Notes
Foundation: setup completo del design system (globals.css + tailwind.config.ts + fonts) + landing page pública con todas las secciones. El landing debe demostrar inmediatamente el nivel premium del sistema — hero impactante, cards de servicios elegantes, sección de podólogos con fotos profesionales, beneficios en grid, testimonios con avatares, CTA final.

Colores: Blue #2563EB primary, white #FFFFFF, light gray #F8FAFC background, medium gray #E5E7EB muted, green #22C55E success, red #EF4444 destructive. Convertir a HSL para shadcn tokens.

Tipografía: Plus Jakarta Sans (headings, weights 600-700) + Inter (body, weights 400-600). Importar todas las ponderaciones necesarias.

Estilo visual: soft shadows, bordes 16-24px, glassmorphism ligero, animaciones suaves, espaciado amplio.

## Checklist
- [x] Setup fonts (Plus Jakarta Sans headings, Inter body) en globals.css
- [x] Configurar paleta HSL en globals.css (--primary, --background, --foreground, --muted, --accent, --destructive)
- [x] Registrar colores custom + fuentes en tailwind.config.ts
- [x] Crear Navigation component (glassmorphism, logo, links, CTA)
- [x] Hero section: imagen profesional clínica, título, subtítulo, botón grande "Agendar Hora"
- [x] Servicios section: 4-6 cards con iconos Lucide + título + descripción breve
- [x] Podólogos section: 2-3 cards con foto, nombre, especialidad
- [x] Beneficios section: grid 2x2 o 3x2 con iconos + texto
- [x] Testimonios section: 3 cards con avatar circular + nombre + testimonio
- [x] CTA final section: título + botón grande con hover moderno
- [x] Footer component: links, redes, copyright

## Acceptance
- Landing se ve premium, moderno, profesional — nivel SaaS empresarial
- Todas las secciones tienen animaciones suaves y espaciado generoso
- Design system completo permite crear nuevas páginas con tokens consistentes