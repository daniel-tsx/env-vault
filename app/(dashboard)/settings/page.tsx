import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRecentActivity } from "@/features/account/actions";
import { ProfileSection } from "@/features/account/profile-section";
import { PasswordSection } from "@/features/account/password-section";
import { TwoFactorSection } from "@/features/account/two-factor-section";
import { DangerZone } from "@/features/account/danger-zone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const twoFactorEnabled = Boolean(
    (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled
  );
  const activity = await getRecentActivity();

  return (
    <div className="max-w-3xl space-y-8">
      <div className="ev-reveal">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          {"// settings"}
        </p>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and account security.
        </p>
      </div>

      <Card className="ev-reveal rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your name and email.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSection name={session.user.name} email={session.user.email} />
        </CardContent>
      </Card>

      <Card className="ev-reveal rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password. Other sessions are signed out on change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordSection />
        </CardContent>
      </Card>

      <Card className="ev-reveal rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>
            Require an authenticator code when signing in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoFactorSection enabled={twoFactorEnabled} />
        </CardContent>
      </Card>

      <Card className="ev-reveal rounded-2xl border-border/60">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Secret access and changes on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="divide-y divide-border/40">
              {activity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs shrink-0"
                    >
                      {event.action}
                    </Badge>
                    {event.label && (
                      <span className="text-muted-foreground truncate">
                        {event.label}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="ev-reveal rounded-2xl border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZone />
        </CardContent>
      </Card>
    </div>
  );
}
