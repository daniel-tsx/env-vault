# Logo & Brand Notes

> **Status: current.** Source of truth for the EnvVault visual identity — the
> mark, wordmark, animated logo, icons, and where to use each.

## Chosen direction — "Bracket Vault"

The mark is a pair of **engineered config brackets `[ ]` sealing a diamond**.

- The **brackets** are the env/config signal — `[ENV]`, the scope that wraps a
  value. They're drawn as precise, rounded-corner brackets (not floppy braces,
  not a literal monospace `[ ]`), echoing the product's `0.75rem` UI radius.
- The **diamond** is the secret itself: a single, sealed, encrypted value held
  inside that scope. It reads as a cut/locked token, deliberately **not** a
  keyhole, padlock, or shield.

Read together: **`[ ◆ ]`** — "a sealed value, in scope." It encodes exactly what
EnvVault does (`KEY=value`, encrypted and revealed under guard) without leaning
on a single security cliché.

### Why it fits

- **Domain-true, not generic.** The bracket-wraps-value idea is specific to an
  env-var tool; it passes the "swap-the-logo" test where a keyhole/shield would
  fail. (The previous mark — braces around a keyhole — used the exact cliché the
  house standard bans, on a hardcoded blue that didn't match the design tokens.)
- **On-signature.** Uses the product's azure (`#1E80E6`, aligned with the
  `--primary` token), pairs with Space Grotesk + mono, and lives in the same
  precise, hairline, no-gradient atmosphere as the rest of the app.
- **Scales.** Validated at a true 16 px favicon (rendered, downsampled, and
  inspected — not eyeballed from markup): the high-contrast white-on-azure tile
  stays legible, and the mark is crisp and premium at 32–512 px.

### Alternatives explored (and why they lost)

Five directions were rendered and put through an adversarial five-lens critique
(distinctiveness, favicon legibility, premium craft, domain fit, animation fit):

| Direction | Verdict |
| --- | --- |
| **Bracket Vault `[ ◆ ]`** ✅ | Won 4 of 5 lenses. Ownable, premium, scales, animates naturally. |
| Hex Seal (hexagon + keyhole) | The banned security cliché; keyhole turns to mush at 16 px. |
| Redacted Field (`•••` in a pill) | Reads as a search bar / kebab menu / password field — anonymous. |
| Vault Door (frame + dial) | Literal/skeuomorphic; dial reads as a slider; fiddly when small. |
| Core-shape variants (dot / capsule / keystone / facet) | Dot/capsule read as `[o]`/`[i]`; keystone is off-concept; the faceted gem is gorgeous large but its facet vanishes below ~28 px. |

The solid diamond beat the alternatives because it stays a recognizable rhombus
at small sizes while the dot collapses into the rejected "redacted pill" reading.

## Animation concept — "vault clamp"

A single, one-shot micro-interaction on load: the two brackets start slightly
**wider and faded**, then ease **inward to clamp** the diamond (~420 ms, gentle
overshoot settle); the **diamond fades/scales in last** so the eye lands on the
sealed core. It reinforces the product metaphor — *sealing a secret* — and then
holds still. No looping, no spin, no pulse (those read as spinners and break the
calm-security tone).

Why it's appropriate and cheap:

- **CSS-only** transforms/opacity on three SVG nodes — no JS, no library, no
  canvas/Lottie/GIF, no layout shift, GPU-friendly.
- **Reduced-motion safe.** `@media (prefers-reduced-motion: reduce)` disables the
  keyframes; because the final keyframe is the resting state, the mark simply
  appears static. It's also fully visible without JS.
- **Used sparingly** — only the header mark, where it's a calm "the product is
  alive" cue, not navbar noise.

The keyframes live in `app/globals.css` (`.ev-logo-animated …`); the standalone
SVG files embed an equivalent `<style>` so they animate on their own.

## Files

### React components (`components/`)
- `logo.tsx` — `Logo` / `LogoMark` (static mark) + the shared geometry constants.
- `animated-logo.tsx` — `AnimatedLogo` (the vault-clamp mark).

### In-app icons (App Router file conventions, `app/`)
- `favicon.ico` — 16/32/48 multi-size ICO (white-on-azure tile).
- `icon.svg` — modern SVG favicon (tile).
- `apple-icon.png` — 180×180 full-bleed apple-touch icon.
- `manifest.ts` — PWA manifest referencing the icon PNGs.

### Brand exports (`public/brand/`)
| File | What | Static/Animated |
| --- | --- | --- |
| `logo-mark.svg` | Mark, azure | static |
| `logo-mark-mono.svg` | Mark, `currentColor` (inline) | static |
| `logo-mark-animated.svg` | Mark, azure | **animated** |
| `logo.svg` | Full lockup, ink text (light bg) | static |
| `logo-dark.svg` | Full lockup, light text (dark bg) | static |
| `logo-mono.svg` | Full lockup, `currentColor` (inline) | static |
| `logo-animated.svg` | Full lockup (light bg) | **animated** |
| `logo-animated-dark.svg` | Full lockup (dark bg) | **animated** |
| `icon.svg` | App-icon tile | static |
| `brand-preview.png` | This identity on mock surfaces | — |

### Other (`public/`)
- `icons/favicon-16x16.png`, `favicon-32x32.png`, `icon-192.png`, `icon-512.png`,
  `icon-512-maskable.png` — raster icon set.
- `og.png` — 1200×630 Open Graph image (wired via `app/layout.tsx`).
- `logo.png` — 512 tile (legacy/general-purpose raster).
- `/logo.svg` (repo root) — the canonical mark, refreshed.

All assets are regenerated from one source of truth, the locked geometry, so they
can't drift. (The generator lived in a scratch folder and is not committed.)

## Recommended usage

**Use the animated logo** where it's visible and adds a calm brand cue:
- Header / navbar mark (already wired: landing + dashboard).
- A hero or welcome/brand-preview moment, if one is added later.

**Use the static logo** everywhere else — calm, dense, repeated, or small:
- Favicon, browser tab, app icons, OG image (never animate these).
- Footer, the hero vault-preview card, the closing-CTA mark, auth/2FA screens.
- Any dashboard-dense or mobile context.

## Color & background guidance

- **Mark:** azure `#1E80E6` works on both light and dark (contrast verified). On a
  solid azure surface use the **reverse** (white) mark; for one-color stamps use
  the mono mark / `currentColor`.
- **Favicon/app icon:** always the white-on-azure tile — its contrast is what
  keeps it legible at 16 px.
- **Wordmark:** ink (`#0E1117`) on light, near-white (`#F5F7FA`) on dark. In-app
  the header wordmark is live text on the `foreground` token, so it adapts to the
  theme automatically.
- The mark color is the `--ev-brand` token (fixed across themes) so the in-app
  mark always matches the exported favicon.

## Reduced-motion & performance notes

- Animation is CSS-only (transform/opacity), one-shot, ~420 ms, GPU-composited,
  zero layout shift, zero added JS/runtime cost.
- `prefers-reduced-motion: reduce` → the mark renders in its final static state.
- Content is visible without JS; if styles fail, the mark is still the static SVG.

## Future ideas

- A rarer **reveal glint** (~400 ms highlight sweeping the diamond) fired once on a
  successful step-up re-auth, tying motion to "secret revealed."
- A `>=40 px`-only faceted-diamond render detail (a single internal hairline) for
  large hero placements, degrading to the solid diamond at small sizes.
- A dedicated `/brand` route rendering `brand-preview` if a public brand page is
  ever wanted.
