import type { MetadataRoute } from "next";

// PWA manifest — icons live in /public/icons (generated from the brand mark).
// theme/background use the dark-default app surface.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EnvVault — Secure Environment Variable Manager",
    short_name: "EnvVault",
    description:
      "Manage environment variables across all your projects. Secure, encrypted, and built for developers.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1117",
    theme_color: "#0e1117",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
