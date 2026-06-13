"use client";

import { useState } from "react";
import { twoFactor } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { DotGrid } from "@/components/dot-grid";
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

export default function TwoFactorPage() {
  const router = useRouter();
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = useBackup
      ? await twoFactor.verifyBackupCode({ code })
      : await twoFactor.verifyTotp({ code });

    if (result.error) {
      setError(result.error.message || "Invalid code");
      setLoading(false);
      return;
    }

    router.push("/projects");
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <DotGrid fade="center" />
      <Card className="ev-reveal w-full max-w-md rounded-2xl border-border/60 shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <Logo className="size-10" />
            <span className="text-2xl font-bold tracking-tight">EnvVault</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {"// verify"}
          </p>
          <CardTitle className="text-3xl">Two-factor authentication</CardTitle>
          <CardDescription className="text-base">
            {useBackup
              ? "Enter one of your saved backup codes."
              : "Enter the 6-digit code from your authenticator app."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                {useBackup ? "Backup code" : "Authentication code"}
              </Label>
              <Input
                id="code"
                type="text"
                required
                autoFocus
                autoComplete="one-time-code"
                inputMode={useBackup ? "text" : "numeric"}
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                placeholder={useBackup ? "XXXXXXXX" : "123456"}
                className="h-11 font-mono tracking-widest"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-6">
            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loading}
            >
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Verify
            </Button>
            <button
              type="button"
              onClick={() => {
                setUseBackup((v) => !v);
                setCode("");
                setError("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {useBackup
                ? "Use your authenticator app instead"
                : "Use a backup code instead"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
