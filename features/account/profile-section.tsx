"use client";

import { useState } from "react";
import { updateProfile } from "@/features/account/actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ProfileSection({
  name: initialName,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="profile-name" className="text-sm font-medium">
          Name
        </Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email" className="text-sm font-medium">
          Email
        </Label>
        <Input id="profile-email" value={email} disabled className="h-11" />
      </div>
      <Button type="submit" disabled={loading || name.trim() === ""}>
        {loading && <Loader2 className="size-4 animate-spin mr-2" />}
        Save changes
      </Button>
    </form>
  );
}
