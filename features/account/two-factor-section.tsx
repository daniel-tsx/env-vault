"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { authClient } from "@/lib/auth/client";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function TwoFactorSection({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{
    qr: string;
    backupCodes: string[];
  } | null>(null);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function startEnable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await authClient.twoFactor.enable({ password });
    if (result.error || !result.data) {
      setError(result.error?.message || "Failed to start 2FA setup");
      setLoading(false);
      return;
    }
    const qr = await QRCode.toDataURL(result.data.totpURI);
    setSetup({ qr, backupCodes: result.data.backupCodes });
    setPassword("");
    setLoading(false);
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await authClient.twoFactor.verifyTotp({ code });
    if (result.error) {
      setError(result.error.message || "Invalid code");
      setLoading(false);
      return;
    }
    toast.success("Two-factor authentication enabled");
    setSetup(null);
    setCode("");
    setLoading(false);
    router.refresh();
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await authClient.twoFactor.disable({ password });
    if (result.error) {
      setError(result.error.message || "Failed to disable 2FA");
      setLoading(false);
      return;
    }
    toast.success("Two-factor authentication disabled");
    setPassword("");
    setLoading(false);
    router.refresh();
  }

  if (enabled) {
    return (
      <div className="space-y-4 max-w-sm">
        <Badge className="gap-1.5">
          <ShieldCheck className="size-3.5" />
          Enabled
        </Badge>
        <p className="text-sm text-muted-foreground">
          Two-factor authentication is protecting your account. Enter your
          password to turn it off.
        </p>
        <form onSubmit={disable} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disable-2fa-password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="disable-2fa-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" variant="destructive" disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <ShieldOff className="size-4 mr-2" />
            )}
            Disable 2FA
          </Button>
        </form>
      </div>
    );
  }

  if (setup) {
    return (
      <div className="space-y-5 max-w-sm">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Scan this QR code with your authenticator app, then enter the
            generated code to finish.
          </p>
          <Image
            src={setup.qr}
            alt="2FA QR code"
            width={176}
            height={176}
            unoptimized
            className="rounded-lg border border-border bg-white p-2"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Backup codes</Label>
          <p className="text-xs text-muted-foreground">
            Save these somewhere safe. Each can be used once if you lose your
            device.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/50 bg-muted/30 p-3 font-mono text-xs">
            {setup.backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
        <form onSubmit={confirmEnable} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-2fa-code" className="text-sm font-medium">
              Authentication code
            </Label>
            <Input
              id="verify-2fa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              placeholder="123456"
              className="h-11 font-mono tracking-widest"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Verify & enable
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSetup(null);
                setCode("");
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-sm">
      <p className="text-sm text-muted-foreground">
        Add a second step at sign-in using an authenticator app (TOTP).
      </p>
      <form onSubmit={startEnable} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="enable-2fa-password" className="text-sm font-medium">
            Confirm your password
          </Label>
          <Input
            id="enable-2fa-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <ShieldCheck className="size-4 mr-2" />
          )}
          Set up 2FA
        </Button>
      </form>
    </div>
  );
}
