import Link from "next/link";
import { Lock, FolderKey, Search, Copy, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">EnvVault</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Your secrets,
            <br />
            <span className="text-muted-foreground">securely managed.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            One secure place to store and manage environment variables across all
            your projects. No more scattered .env files or shared spreadsheets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Start for free
            </Link>
            <Link
              href="/sign-in"
              className="border border-border px-8 py-3 rounded-md font-medium hover:bg-accent transition-colors"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">
              Built for developers who ship fast
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FolderKey className="w-6 h-6" />}
                title="Multi-project support"
                description="Organize variables across all your projects and repositories in one place."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="AES-256 encryption"
                description="Every secret is encrypted at rest with industry-standard AES-256-GCM."
              />
              <FeatureCard
                icon={<Search className="w-6 h-6" />}
                title="Fast search"
                description="Find any variable instantly across all your projects and environments."
              />
              <FeatureCard
                icon={<Copy className="w-6 h-6" />}
                title="One-click copy"
                description="Reveal and copy values with a single click. Secrets stay hidden by default."
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Environment groups"
                description="Separate development, staging, and production variables cleanly."
              />
              <FeatureCard
                icon={<Lock className="w-6 h-6" />}
                title="Secure by default"
                description="Values are masked in the UI. Only reveal what you need, when you need it."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          EnvVault — Secure environment variable management for developers.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border border-border">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
