// Animated EnvVault mark — plays the one-shot "vault clamp" on mount: the two
// brackets ease inward to seal the diamond, which settles in last. Pure CSS
// (keyframes live in globals.css under .ev-logo-animated), no JS, no layout
// shift; honors prefers-reduced-motion by snapping to the static mark.
//
// Use this only in high-visibility brand spots (header). Everywhere else —
// favicon, footer, dense UI, repeated instances — use the static <Logo />.
import {
  MARK_BRACKET_L,
  MARK_BRACKET_R,
  MARK_CORE,
  MARK_STROKE,
} from "@/components/logo";

export function AnimatedLogo({
  className,
  color = "var(--ev-brand)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`ev-logo-animated ${className ?? ""}`}
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
        <path className="ev-logo-l" d={MARK_BRACKET_L} />
        <path className="ev-logo-r" d={MARK_BRACKET_R} />
      </g>
      <path className="ev-logo-core" d={MARK_CORE} fill={color} />
    </svg>
  );
}
