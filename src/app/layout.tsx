import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MediaLightboxProvider } from "@/context/MediaLightboxContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Aquarium Studio | Aquarium Tracker & Media Vault",
  description:
    "Self-hosted aquarium tracker, water parameter logging, livestock & flora media vault with growth slider, and reef & planted dosing calculators.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐠</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[#f0f4f8] antialiased" style={{ backgroundColor: "var(--bg-main, #0d121a)" }}>
        <MediaLightboxProvider>
          {children}
        </MediaLightboxProvider>
      </body>
    </html>
  );
}
