const FADES = {
  top: "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]",
  center: "[mask-image:radial-gradient(ellipse_55%_55%_at_50%_45%,black,transparent_75%)]",
} as const;

// Decorative blueprint dot-grid texture (no color gradients — the radial is only
// a mask that fades the dots). Theme-aware via the foreground token.
export function DotGrid({ fade = "top" }: { fade?: keyof typeof FADES }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 size-full text-foreground/[0.07] ${FADES[fade]}`}
    >
      <defs>
        <pattern
          id="ev-dots"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ev-dots)" />
    </svg>
  );
}
