# MeshSight Design System

> The design language behind the MeshSight website (and the visual identity
> of the app). Adapted from a broader "Dark Neon" system — dark-first,
> glass-morphism, monospace-for-data — trimmed and re-tinted to MeshSight's
> brand emerald. This file is the source of truth; the site's `/design`
> page is its live showcase.

## 1. Philosophy

| Principle | Meaning |
|-----------|---------|
| Dark-first | Every surface starts dark. Light comes only from accents and subtle borders. |
| Glass, not flat | Overlays use `backdrop-blur` + translucent fills, never solid opaque panels. |
| One accent family | Mint leads (brand, actions), sky informs (links, focus), coral warns (danger). No fourth color. |
| Monospace for data | Numbers, paths, code tokens use a mono font with tabular alignment. |
| Motion with meaning | Animation communicates state and guides attention — it never delays the user. |
| Mobile-first | Design for touch, then enhance for wide screens. |

## 2. Color tokens

### Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#1E1E24` | Page background |
| `bg-surface` | `#28282F` | Cards, panels, content blocks |
| `bg-sidebar` | `#242430` | Navigation, overlays |
| `bg-elevated` | `#333340` | Hover states, active items |

### Accents

Exactly three, per the Dark Neon system — never a fourth:

| Token | Hex | Role |
|-------|-----|------|
| `accent-lime` | `#BCFF5F` | Primary — actions, success, brand, links, focus |
| `accent-sky` | `#5FC9FF` | Secondary — information, step badges, live states |
| `accent-coral` | `#FF5F7E` | Danger — errors, destructive actions only |

Hover on lime buttons goes brighter (`#D4FF99`), never a new hue. The logo
tile keeps its own emerald gradient (`#34C781 → #109669`) — that is brand
identity, not a UI accent, and stays fixed.

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `white` | `#FFFFFF` | Headlines, primary values |
| `text-secondary` | `#C8C8D4` | Body text |
| `text-muted` | `#8888A0` | Labels, captions |
| `text-dim` | `#55556A` | Decorative only — never required reading |

### Borders & shadows

- Default border: `rgba(255,255,255,0.08)` · subtle: `0.04` · strong (overlays): `0.12`
- Glow shadows: `0 0 20px` at 20% opacity of the relevant accent
  (`shadow-glow-lime`, `shadow-glow-sky`, `shadow-glow-coral`)

## 3. Typography

- **Sans:** Geist Sans — UI, prose, headings
- **Mono:** Geist Mono — numbers, code, file paths, step counters
- Scale: page title `text-3xl/4xl bold` · section `text-xl/2xl bold` ·
  body `text-sm` · label `text-xs uppercase tracking-wider text-muted` ·
  micro-label `text-[10px]`

## 4. Shape & elevation

| Element | Radius |
|---------|--------|
| Cards, panels | 16px (`rounded-2xl`) |
| Buttons, inputs | 12px (`rounded-xl`) |
| Badges, chips | 8px (`rounded-lg`) |
| Logo tile, status dots | full / 50% |

Glass recipe for overlays: `bg-sidebar/90 + backdrop-blur-2xl + border-white/[0.12] + shadow-2xl`.

## 5. Background texture

Three layers, all `pointer-events-none`, behind content:
1. **Noise** — 3% opacity fractal-noise SVG tile
2. **Grid dots** — `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`, 24px cells
3. **Orbs** — two blurred floating circles (lime 5%, sky 5%), slow `ease-in-out` drift

## 6. The logo

A **scan frame** (four viewfinder corner brackets) around a **recognition
mesh** (five nodes in a pentagon linked to a bright focus center), on the
brand-gradient rounded square. Meaning: *see what's there → connect it →
recognize it.*

- SVG: `brand/meshsight-logo.svg` (site: `site/public/logo.svg`)
- Android adaptive icon: `drawable/ic_launcher_foreground.xml` +
  `ic_launcher_background.xml` (vector, minSdk 31)
- Rules: white mark on emerald, or emerald mark on dark. Never recolor,
  never add effects, keep the mesh centered in the safe zone.

## 7. Motion

| Pattern | Spec |
|---------|------|
| Logo draw-in | brackets + mesh lines stroke-dash reveal (2.2s ease-out), nodes pop in staggered, focus core pulses |
| Pipeline flow | dashed connectors marching toward the next stage (1.4s linear loop) |
| Live status dot | soft ping ring (1.8s, scale 1→2.4, fade) |
| Hover | `transition-all duration-200/300`, border brightens toward accent |
| Scroll | `scroll-behavior: smooth` |

## 8. Component notes

- **Buttons:** primary = lime fill + `bg-base` text + glow; secondary =
  sky fill; toggle-on = lime/10 fill + lime/20 border; danger = coral tints only.
- **Timeline (guides):** vertical rail with numbered mono nodes; active =
  filled lime, done = lime outline, upcoming = dim.
- **Markdown articles:** h2 sections divided by hairline borders, lime
  bullets, code chips on white/6%, tables with uppercase muted headers,
  blockquotes as lime-tinted callouts.
- **Scrollbars:** 6px, white/10% thumb, transparent track (`.custom-scrollbar`).

## 9. Anti-patterns

- ❌ No light backgrounds anywhere
- ❌ No indigo/violet/blue as primary
- ❌ No solid opaque overlays (always blur + transparency)
- ❌ No `text-dim` for required content
- ❌ No new accent colors outside lime/sky/coral
- ❌ No emoji as UI icons in production surfaces
- ❌ No animating layout properties (width/height) on frequently-updated elements
