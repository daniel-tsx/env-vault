// Brand mark — kept in sync with logo.svg / app/favicon.ico (Env "{ }" braces
// around a Vault keyhole). Fixed brand colors so it matches the favicon exactly
// in both light and dark. Size it with a className (e.g. "size-9").
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="EnvVault logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="512" height="512" rx="116" fill="#0D6FD1" />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M170 170 Q140 170 140 200 L140 238 Q140 256 118 256 Q140 256 140 274 L140 312 Q140 342 170 342" />
        <path d="M342 170 Q372 170 372 200 L372 238 Q372 256 394 256 Q372 256 372 274 L372 312 Q372 342 342 342" />
      </g>
      <g fill="#ffffff">
        <circle cx="256" cy="226" r="42" />
        <path d="M243 256 L269 256 L286 332 Q288 340 279 340 L233 340 Q226 340 226 332 Z" />
      </g>
    </svg>
  );
}
