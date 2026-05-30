"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message || "Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/projects");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <Card className="w-full max-w-md relative shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="size-5 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">EnvVault</span>
          </div>
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access your vault.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-6">
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Sign in
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
