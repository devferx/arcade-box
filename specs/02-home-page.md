# 02 — Home Page: Landing `/`

---
id: 02-home-page
title: Home Page — Landing `/`
state: Approved
date: 2026-06-23
depends_on: 01-arcade-box-mvp-ui
---

**Objetivo:** Implementar la Home page en la ruta `/` con siete secciones basadas en el template `references/templates/home-about/home.jsx`, moviendo la Library actual a `/games`.

---

## Scope

### Incluido
- Mover `app/page.tsx` (Library actual) → `app/games/page.tsx`
- Crear nueva `app/page.tsx` (Home) con las 7 secciones del template:
  1. Hero — eyebrow, título, subtítulo, dos CTAs, scroll hint, `FloatingSilhouettes`
  2. ¿Por qué Arcade Vault? — 4 feature cards con íconos pixel SVG
  3. Preview de juegos — mini-rail con los primeros 6 juegos de `GAMES`
  4. Stats — 3 bloques estáticos (12+ juegos, miles de partidas, global ranking)
  5. Actividad en vivo — ticker de últimas puntuaciones + top 5 jugadores (mock hardcodeado)
  6. Precios — plan único $0 + FAQ de 3 ítems
  7. CTA final — título + botón "INSERTAR MONEDA"
- Añadir clases CSS nuevas a `app/globals.css` (`.home-hero`, `.home-title`, `.feature-card`, `.mini-card`, `.ticker`, `.top-list`, `.price-card`, etc.)
- Actualizar el Nav: el logo/marca navega a `/`; los links visibles quedan como están (Games → `/games`, Hall of Fame → `/hall-of-fame`) — Home es implícita

### Excluido
- Página About (no se implementa en este spec)
- Datos reales de actividad (mock estático, sin consumir Context ni backend)
- Animaciones de scroll más allá de `IntersectionObserver` con `.reveal` / `.in`
- Cambios en las demás páginas (`/games/[id]`, `/games/[id]/play`, `/auth`, `/hall-of-fame`)

---

## Implementation Plan

1. **Mover Library a `/games`**
   - Renombrar `app/page.tsx` → `app/games/page.tsx`
   - `app/games/` ya existe por `/games/[id]`

2. **Añadir clases CSS a `app/globals.css`**
   - Variables y clases del template `styles.css` que aún no estén presentes:
     `.home-hero`, `.home-silos`, `.silo`, `.home-hero-inner`, `.hero-eyebrow`,
     `.home-title`, `.home-sub`, `.home-ctas`, `.hero-scroll`,
     `.home-section`, `.section-head`, `.kicker`, `.section-title`, `.section-rule`,
     `.feature-grid`, `.feature-card`, `.ft-icon`, `.ft-title`, `.ft-desc`,
     `.mini-rail`, `.mini-card`, `.mini-cover`, `.mini-meta`, `.mini-title`, `.mini-cat`,
     `.home-stats`, `.stats-inner`, `.stat-block`, `.stat-n`, `.stat-u`, `.stat-s`,
     `.activity-grid`, `.activity-card`, `.ac-head`, `.ac-title`, `.ticker`, `.tick-row`,
     `.top-list`, `.top-row`, `.top1/.top2/.top3`, `.tp-rk`, `.tp-bar`, `.tp-fill`, `.tp-p`, `.tp-s`, `.lb-link`,
     `.pricing-grid`, `.price-card`, `.pc-label`, `.pc-name`, `.pc-amount`, `.pc-tag`, `.pc-list`, `.pc-foot`, `.pc-stamp`,
     `.pricing-faq`, `.faq-item`, `.faq-q`, `.faq-a`,
     `.home-final`, `.final-title`, `.final-cta`, `.final-tag`

3. **Crear `app/page.tsx` (Home)**
   - Componente `FloatingSilhouettes` — 8 SVGs decorativos pixel art
   - Componente `FeatureIcon` — 4 variantes (GAMEPAD, FREE, TROPHY, ROCKET)
   - Componente `MiniCard` — thumbnail + título + categoría, clickeable → `/games/${id}`
   - Hook `useReveal` — `IntersectionObserver` sobre `.reveal`, añade clase `.in`
   - Componente `HomePage` con las 7 secciones; CTAs navegan con `useRouter`:
     - "EXPLORAR JUEGOS" / "VER TODOS" / "INSERTAR MONEDA" → `/games`
     - "CREAR CUENTA" / "EMPEZAR GRATIS" → `/auth`
     - "VER SALÓN" → `/hall-of-fame`
     - Mini-rail items → `/games/${id}`

4. **Actualizar `components/nav.tsx`**
   - El logo/marca pasa a linkear a `/` (si aún no lo hace)
   - Verificar que el link de Games apunte a `/games`

---

## Acceptance Criteria

- [ ] `GET /` renderiza la Home page con las 7 secciones completas
- [ ] `GET /games` renderiza la Library (grilla de juegos con búsqueda y filtros)
- [ ] `GET /` ya no muestra la grilla de juegos ni el hero "ARCADE BOX"
- [ ] Los CTAs del Hero navegan correctamente: "EXPLORAR JUEGOS" → `/games`, "CREAR CUENTA" → `/auth`
- [ ] El mini-rail muestra los primeros 6 juegos; cada tarjeta navega a `/games/[id]`
- [ ] "VER TODOS LOS JUEGOS" navega a `/games`
- [ ] "VER SALÓN" navega a `/hall-of-fame`
- [ ] "EMPEZAR GRATIS" navega a `/auth`
- [ ] Las secciones con `.reveal` aparecen con animación al hacer scroll
- [ ] Los silhouettes pixel art flotan en el Hero (animación CSS)
- [ ] El Nav: logo navega a `/`; link "Games" apunta a `/games`
- [ ] `npm run build` y `npm run lint` pasan sin errores

---

## Decisions Taken and Discarded

- **Library en `/` vs `/games`** → se mueve a `/games`. La Home necesita ocupar la raíz; `/games` es la URL semánticamente correcta para la biblioteca.

- **Datos de actividad en vivo: Context vs mock estático** → mock estático hardcodeado igual que el template. Consistent con el MVP sin backend; el Context no tiene suficientes scores en una sesión real para poblar la sección.

- **Home implícita en el Nav** → el logo linkea a `/`; no se añade un link explícito "Home" en la barra. Evita redundancia y mantiene el Nav limpio (Games + Hall of Fame).

- **CSS: archivo separado vs `globals.css`** → todo en `globals.css`, consistent con la decisión del spec 01 de centralizar los estilos del template en ese archivo.

- **`FloatingSilhouettes` y `FeatureIcon`: componentes separados vs inline** → componentes dentro del mismo `app/page.tsx`. Son pequeños, no se reutilizan en otras páginas y mantener todo en un archivo reduce la dispersión.

---

## Identified Risks

- **Links rotos tras mover la Library.** El Nav y cualquier otro componente que linkeara a `/` (la Library) debe actualizarse a `/games`. Si se omite alguno, los usuarios llegarán a la Home en lugar de la biblioteca.

- **Colisión de clases CSS.** El template usa nombres genéricos como `.title`, `.desc`, `.row` que ya existen en `globals.css` para las cards de la Library. Las nuevas clases de Home usan prefijo `.home-` o nombres propios (`.mini-card`, `.ticker`, etc.) — verificar que no haya solapamientos que rompan el estilo de otras páginas.

- **`useReveal` en Server Component.** El hook usa `useEffect` y `document`, por lo que `app/page.tsx` debe declarar `"use client"`. Sin esa directiva el build falla.
