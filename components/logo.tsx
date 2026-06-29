// EnvVault brand mark — "Bracket Vault": engineered config brackets [ ] sealing
// a diamond (the encrypted secret value). Kept in exact sync with the exported
// assets (app/icon.svg, app/favicon.ico, public/brand/*). Brand color comes from
// the --ev-brand token so it stays theme-independent and matches the favicon.
// Size it with a className (e.g. "size-9").

// Shared geometry (viewBox 0 0 64 64) — single source of truth for the static
// and animated marks so they can never drift apart.
export const MARK_BRACKET_L =
  "M25 14 H17.2 Q15 14 15 16.2 V47.8 Q15 50 17.2 50 H25";
export const MARK_BRACKET_R =
  "M39 14 H46.8 Q49 14 49 16.2 V47.8 Q49 50 46.8 50 H39";
export const MARK_CORE = "M32 24.4 L39.1 31.5 L32 38.6 L24.9 31.5 Z";
export const MARK_STROKE = 6;

export function Logo({
  className,
  color = "var(--ev-brand)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="EnvVault logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth={MARK_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={MARK_BRACKET_L} />
        <path d={MARK_BRACKET_R} />
      </g>
      <path d={MARK_CORE} fill={color} />
    </svg>
  );
}

// The symbol is the same as the primary mark — exported under both names so
// imports read clearly at the call site.
export { Logo as LogoMark };
