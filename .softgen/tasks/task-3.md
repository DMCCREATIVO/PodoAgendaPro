---
title: Auth System
status: todo
priority: high
type: feature
tags: [auth, login]
created_by: agent
created_at: 2026-04-22T23:27:36Z
position: 3
---

## Notes
Página de autenticación con selector visual de roles (Admin/Podólogo/Paciente). Cards grandes, animación al seleccionar, diseño moderno y limpio. Por ahora sin backend real, mock login para demostración.

## Checklist
- [ ] Card centrada con título "Acceder al Sistema"
- [ ] Selector de rol: 3 cards grandes (Admin, Podólogo, Paciente) con iconos + descripción
- [ ] Animación de selección (scale, shadow, color)
- [ ] Formulario: email + password con inputs modernos (focus elegante)
- [ ] Botón "Iniciar Sesión" con loading state
- [ ] Mock auth context: simular login y redirección según rol
- [ ] Redirecciones: Admin → /admin, Podólogo → /podologo, Paciente → /cliente

## Acceptance
- Flujo de login funcional con redirecciones correctas
- Animaciones suaves en selector de rol
- Diseño premium y profesional