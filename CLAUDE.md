# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build (output: /dist)
npm run preview   # Serve the production build locally
npm run lint      # Run ESLint
```

No test suite is configured.

## Architecture

**Casa del Pollo** is a React 19 + Vite SPA for ordering from a multi-branch chicken restaurant.

### Routing

There is no React Router. Navigation is managed entirely through `vista` state in `AppContext`:
- `'sucursales'` → `<SelectorSucursal />`
- `'menu'` → `<MenuPrincipal />`
- `'carrito'` → `<Carrito />`
- `'confirmado'` → `<Confirmado />`

Change views by calling `setVista()` from context.

### State Management

All global state lives in `src/data/AppContext.jsx`, accessed via `useApp()`. Key state fields:
- `sucursalActiva` — currently selected branch
- `carrito` — array of cart items (each with a unique ID)
- `vista` — active view
- `productos` — products fetched for the active branch
- `diseno` — theme object fetched from backend, applied as CSS custom properties on `<html>` at branch selection time
- `promociones`, `banners` — marketing content
- `slots` — time slots for order scheduling

### Backend API

Base URL: `https://casadelpollo-backend-production.up.railway.app`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/branches` | All locations |
| GET | `/api/products/branch/{branchId}` | Branch product catalog |
| GET | `/api/design/{branchId}` | Theme customization |
| GET | `/api/promotions?branch_id={id}` | Promotions |
| GET | `/api/banners?tipo={tipo}` | Banners (`bienvenida` or `menu`) |
| POST | `/api/orders` | Submit order |

All API calls are in `src/data/api.js`. Error handling uses try/catch with empty-state fallbacks; there is no retry logic.

### Theme System

The backend returns a `diseno` object with color/font/style values. `AppContext` writes these as CSS custom properties on the root element when a branch is selected. Default values are defined in `:root` inside `src/styles/global.css`. Never hardcode colors — use the CSS variables.

### Slot/Scheduling Logic

`src/data/slots.js` models airfryer capacity: 3 slots per 30-minute interval from 10:00–15:30, with a minimum 30-minute buffer from the current time. Marinados and bowls require 20+ minutes of prep time. This logic feeds the cart's time-slot picker.

## Conventions

- All variable names, CSS class names, and component names are in **Spanish** (e.g., `sucursalActiva`, `agregarAlCarrito`, `btn-primario`, `SelectorSucursal`).
- Components in `src/Components/` are menu-section sub-components; `src/pages/` contains full-view pages.
- Shared data/logic (API client, context, slot generation) lives in `src/data/`.
- CSS is imported at the top of each component file; page-level styles live in `src/styles/`.
