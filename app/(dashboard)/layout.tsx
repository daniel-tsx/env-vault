import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions";
import { GlobalSearch } from "@/features/search/global-search";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const userInitials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email[0].toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Lock className="size-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">EnvVault</span>
          </Link>
          <div className="flex items-center gap-3">
          <GlobalSearch />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="relative size-10 rounded-full" />}
            >
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <form action={signOut} className="w-full">
                  <button type="submit" className="w-full flex items-center">
                    <LogOut className="size-4 mr-2" />
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
