import Link from "next/link";
import { Lock, FolderKey, Search, Copy, Shield, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="size-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">EnvVault</span>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Sign in
            </Link>
            <Link 
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative">
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Shield className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">Enterprise-grade security for your secrets</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Your secrets,
              <br />
              <span className="text-primary">securely managed.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              One secure vault to store and manage environment variables across all your projects. 
              No more scattered .env files or shared spreadsheets.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
              >
                Start for free
                <ArrowRight className="size-4 ml-2" />
              </Link>
              <Link 
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for developers who ship fast
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage secrets securely, without the complexity.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FolderKey className="size-6" />}
                title="Multi-project support"
                description="Organize variables across all your projects and repositories in one centralized vault."
              />
              <FeatureCard
                icon={<Shield className="size-6" />}
                title="AES-256 encryption"
                description="Every secret is encrypted at rest with authenticated AES-256-GCM, with seamless key rotation."
              />
              <FeatureCard
                icon={<Search className="size-6" />}
                title="Lightning search"
                description="Find any variable instantly across all your projects and environments. No more hunting."
              />
              <FeatureCard
                icon={<Copy className="size-6" />}
                title="One-click copy"
                description="Reveal and copy values with a single click. Secrets auto-hide after 30 seconds."
              />
              <FeatureCard
                icon={<Zap className="size-6" />}
                title="Environment groups"
                description="Separate development, staging, and production variables with clear visual hierarchy."
              />
              <FeatureCard
                icon={<Lock className="size-6" />}
                title="Secure by default"
                description="Values are masked in the UI. Only reveal what you need, when you need it."
              />
            </div>
          </div>
        </section>

        <section className="border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to secure your secrets?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join developers who trust EnvVault with their most sensitive configuration.
              </p>
              <Link 
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
              >
                Get started for free
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
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
    <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="pt-6">
        <div className="mb-4 size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
