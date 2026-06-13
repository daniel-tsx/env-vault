# EnvVault Design System

**Status: current.** Reflects the tokens and patterns actually used in the app
(source of truth: [`app/globals.css`](app/globals.css) and `components/ui/*`).

## Principles

1. **Security-first, calm:** a focused, trustworthy developer tool.
2. **Token-driven:** always use semantic tokens (`bg-primary`,
   `text-muted-foreground`, `border-border`…), never hard-coded colors.
3. **No gradient backgrounds** (project preference) — use solid/subtle token
   surfaces (`bg-muted/30`, `bg-card`).
4. **Light + dark** are first-class and must both look correct.

## Theming

- `next-themes` with the **class** strategy; default `dark`, system enabled
  (`components/theme-provider.tsx`, wired in `app/layout.tsx`).
- Dark variant: `@custom-variant dark (&:is(.dark *))` in `globals.css`.
- Toggle: `components/theme-toggle.tsx` (icons swap via the `dark` class, so
  there's no hydration mismatch). Present in the landing and dashboard headers.

## Color (oklch tokens)

Defined as CSS variables in `:root` (light) and `.dark`, exposed to Tailwind via
`@theme inline`. The brand **primary is a blue/cyan** (light `oklch(0.65 0.18
220)`, dark `oklch(0.75 0.16 200)`). Use:

- `primary` / `primary-foreground` — primary actions, accents, links.
- `background` / `foreground`, `card`, `popover`, `muted`, `accent`,
  `secondary` — surfaces and text.
- `destructive` — delete/danger.
- `border`, `input`, `ring` — chrome and focus.

## Typography

- **Body / sans:** Inter (`--font-inter`).
- **Display / headings:** Space Grotesk (`--font-space-grotesk`), applied to
  `h1–h6` with `-0.02em` letter-spacing.
- **Mono:** `ui-monospace, SFMono-Regular, Menlo, …` — variable keys/values.

Scale: `text-3xl`–`text-7xl` for hero/page titles, `text-xl/2xl` sections,
`text-sm` labels, `text-xs` metadata.

## Radius & spacing

- `--radius: 0.75rem`; derived `--radius-sm…4xl`. Prefer `rounded-lg`/`rounded-xl`.
- Tailwind 4px spacing scale; cards use `p-6`, sections `gap-6`/`mb-8`.

## Components (shadcn + Base UI)

Built on `@base-ui/react`. **Note the Base UI trigger pattern** — composition
uses a `render` prop, not `asChild`:

```tsx
<DialogTrigger render={<Button />}>New</DialogTrigger>
<TooltipTrigger render={<Button variant="ghost" size="icon" />}><Icon /></TooltipTrigger>
```

Available primitives in `components/ui/`: button, card, dialog, alert-dialog,
dropdown-menu, input, textarea, label, select, switch, badge, alert, tooltip,
tabs, sheet, scroll-area, separator, avatar, skeleton, command, input-group,
sonner (toaster).

## Patterns

- **Icons:** `lucide-react`, sized with `size-4`/`size-5`.
- **Loading:** route-level `loading.tsx` with `Skeleton`; button spinners use
  `Loader2 … animate-spin`.
- **Feedback:** `sonner` toasts (`toast.success/error/info`).
- **Destructive actions:** always confirm via `AlertDialog`.
- **Empty states:** dashed `Card` with an icon, title, and helper text.
- **Errors:** friendly boundary (`app/(dashboard)/error.tsx`); never surface raw
  error details.
- **Secret display:** masked `••••••••` by default; revealed values shown in a
  `font-mono` `bg-primary/5` chip and auto-hidden after 30s. Reveal requires
  step-up re-auth.
- **Command palette:** `Cmd/Ctrl+K` global search (`features/search`).
