import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Eye,
  History,
  Search,
  ArrowDownUp,
  ScrollText,
  Lock,
  RotateCcw,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-2.5">
          <Logo className="size-9" />
          <span className="text-xl font-bold tracking-tight">EnvVault</span>
        </div>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <DotGrid />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pt-20 pb-24 lg:grid-cols-2 lg:px-8 lg:pt-28 lg:pb-32">
        <div>
          <p
            className="ev-reveal mb-5 font-mono text-xs uppercase tracking-[0.2em] text-primary"
            style={{ animationDelay: "0ms" }}
          >
            {"// encrypted secret management"}
          </p>
          <h1
            className="ev-reveal text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Secrets that
            <br />
            stay <span className="text-primary">secret.</span>
          </h1>
          <p
            className="ev-reveal mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            EnvVault encrypts every environment variable with AES-256-GCM, gates
            each reveal behind re-authentication, and records who touched what —
            across all of your projects.
          </p>
          <div
            className="ev-reveal mt-9 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-7 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start for free
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-7 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Sign in
            </Link>
          </div>
          <p
            className="ev-reveal mt-7 font-mono text-xs text-muted-foreground"
            style={{ animationDelay: "320ms" }}
          >
            AES-256-GCM · step-up reveal · 2FA · full audit trail
          </p>
        </div>

        <VaultPreview />
      </div>
    </section>
  );
}

function VaultPreview() {
  return (
    <div className="ev-reveal relative" style={{ animationDelay: "200ms" }}>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl shadow-primary/5">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Logo className="size-6" />
            <span className="text-sm font-medium">payments-api</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            production
          </span>
        </div>
        <div className="divide-y divide-border/50">
          <VarRow name="DATABASE_URL" />
          <VarRow name="STRIPE_SECRET_KEY" />
          <VarRow name="OPENAI_API_KEY" value="sk-or-v1-9f…c2a" revealed />
          <VarRow name="JWT_SECRET" />
        </div>
        <div className="flex items-center gap-2 border-t border-border/60 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          <Lock className="size-3.5 text-primary" />
          Revealing a value requires re-authentication
        </div>
      </div>
    </div>
  );
}

function VarRow({
  name,
  value,
  revealed,
}: {
  name: string;
  value?: string;
  revealed?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <code className="min-w-0 flex-1 truncate font-mono text-xs font-medium">
        {name}
      </code>
      {revealed ? (
        <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
          {value}
        </code>
      ) : (
        <span className="font-mono text-xs tracking-widest text-muted-foreground">
          ••••••••••
        </span>
      )}
      <Eye
        className={`size-4 shrink-0 ${revealed ? "text-primary" : "text-muted-foreground/50"}`}
      />
    </div>
  );
}

function Features() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {"// the toolkit"}
          </p>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Everything you need to run secrets in production
          </h2>
          <p className="text-lg text-muted-foreground">
            From encryption and key rotation to audit trails and bulk .env —
            without the enterprise bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          <Tile className="lg:col-span-7" delay="0ms">
            <TileHead
              icon={<KeyRound className="size-5" />}
              title="Encrypted at rest, rotatable on demand"
              desc="Every value is sealed with authenticated AES-256-GCM. Roll to a new key whenever you like — older data keeps decrypting, with zero downtime."
            />
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="rounded-md border border-border/60 px-2.5 py-1 text-muted-foreground">
                key 0
              </span>
              <ArrowRight className="size-4 text-muted-foreground" />
              <span className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">
                key 1 · primary
              </span>
              <span className="ml-auto hidden rounded-md bg-muted px-2.5 py-1 text-muted-foreground sm:inline">
                $ pnpm rotate-keys
              </span>
            </div>
          </Tile>

          <Tile className="lg:col-span-5" delay="60ms">
            <TileHead
              icon={<ShieldCheck className="size-5" />}
              title="Reveal takes a second factor"
              desc="Even with a live session, showing or exporting a secret needs a quick re-auth — a short-lived grant, then it locks again."
            />
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium">Confirm it&apos;s you</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border border-border/60 bg-background px-3 py-1.5 font-mono text-xs tracking-widest text-muted-foreground">
                  ••••••••
                </div>
                <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  Confirm
                </span>
              </div>
            </div>
          </Tile>

          <Tile className="lg:col-span-4" delay="120ms">
            <TileHead
              icon={<Lock className="size-5" />}
              title="Two-factor sign-in"
              desc="Authenticator-app TOTP with one-time backup codes, challenged at sign-in."
            />
            <div className="flex gap-1.5">
              {["1", "2", "3", "4", "5", "6"].map((digit, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-md border border-border/60 bg-muted/40 py-1.5 text-center font-mono text-sm"
                >
                  {digit}
                </span>
              ))}
            </div>
          </Tile>

          <Tile className="lg:col-span-4" delay="180ms">
            <TileHead
              icon={<ScrollText className="size-5" />}
              title="Every access, on the record"
              desc="Reveals, edits, exports and sign-ins — all logged. The value itself never is."
            />
            <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
              <div>
                <span className="text-primary">reveal</span> STRIPE_SECRET_KEY
              </div>
              <div>
                <span className="text-primary">step_up</span> re-authenticated
              </div>
              <div>
                <span className="text-primary">export</span> production
              </div>
            </div>
          </Tile>

          <Tile className="lg:col-span-4" delay="240ms">
            <TileHead
              icon={<Search className="size-5" />}
              title="Find any key, instantly"
              desc="Search across every project and variable from anywhere."
            />
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <span className="flex-1 text-xs text-muted-foreground">
                Search secrets…
              </span>
              <Kbd>⌘K</Kbd>
            </div>
          </Tile>

          <Tile className="lg:col-span-6" delay="300ms">
            <TileHead
              icon={<ArrowDownUp className="size-5" />}
              title="Bulk .env import and export"
              desc="Paste or upload a .env to import in one shot, and export an environment back out — gated by re-auth."
            />
            <pre className="overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              <code>{`DATABASE_URL=••••••••••••\nSTRIPE_SECRET_KEY=••••••••\nOPENAI_API_KEY=••••••••••`}</code>
            </pre>
          </Tile>

          <Tile className="lg:col-span-6" delay="360ms">
            <TileHead
              icon={<History className="size-5" />}
              title="Version history and restore"
              desc="Every change snapshots the prior value. Reveal an old version or roll back in one click."
            />
            <div className="space-y-2">
              <HistoryRow when="updated · 2 days ago" />
              <HistoryRow when="updated · 5 days ago" />
            </div>
          </Tile>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
          {[
            "dev / staging / prod",
            "rate-limited",
            "light and dark",
            "safe error handling",
            "open source",
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-border/60 px-3 py-1 text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryRow({ when }: { when: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-xs">
      <span className="font-mono text-muted-foreground">{when}</span>
      <span className="inline-flex items-center gap-1 text-primary">
        <RotateCcw className="size-3.5" />
        Restore
      </span>
    </div>
  );
}

function ClosingCta() {
  return (
    <section className="relative overflow-hidden">
      <DotGrid />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
        <Logo className="mx-auto mb-6 size-12" />
        <h2 className="mb-5 text-3xl font-bold md:text-5xl">
          Lock down your secrets today.
        </h2>
        <p className="mx-auto mb-9 max-w-xl text-lg text-muted-foreground">
          Spin up your vault in under a minute. Encrypted, audited, and entirely
          yours.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start for free
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row lg:px-8">
        <div className="flex items-center gap-2.5">
          <Logo className="size-6" />
          <span>EnvVault</span>
        </div>
        <p>Secure environment variable management for developers.</p>
      </div>
    </footer>
  );
}

function Tile({
  className = "",
  delay,
  children,
}: {
  className?: string;
  delay?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`ev-reveal group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40 lg:p-7 ${className}`}
      style={delay ? { animationDelay: delay } : undefined}
    >
      {children}
    </div>
  );
}

function TileHead({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}

function DotGrid() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 size-full text-foreground/[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
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
