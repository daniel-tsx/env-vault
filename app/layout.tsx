import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_TITLE = "EnvVault — Secure Environment Variable Manager";
const SITE_DESC =
  "Manage environment variables across all your projects. Secure, encrypted, and built for developers.";

export const metadata: Metadata = {
  // Resolves relative OG/icon URLs to absolute. Reuses the deployment base URL.
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: SITE_TITLE,
  description: SITE_DESC,
  // Icons are served automatically from the App Router file conventions:
  // app/favicon.ico, app/icon.svg, and app/apple-icon.png.
  openGraph: {
    type: "website",
    siteName: "EnvVault",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "EnvVault — Secrets that stay secret.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1117" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
