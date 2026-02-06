import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import GoogleAuthProviderWrapper from "@/providers/GoogleAuthProviderWrapper";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import PriceSchedulerInitializer from "@/components/providers/PriceSchedulerInitializer";
import MixpanelProvider from "@/components/providers/MixpanelProvider";
import { ToastProvider } from "@/lib/hooks/useToast";
import Toaster from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Nexa Market",
    template: "%s | Nexa Market",
  },
  description: "Next Gen DeFi Market - Secure, fast, and decentralized cryptocurrency exchange platform",
  keywords: ["DeFi", "cryptocurrency", "Nexa", "blockchain", "exchange", "crypto market"],
  authors: [{ name: "Nexa Market" }],
  creator: "Nexa Market",
  publisher: "Nexa Market",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Nexa Market",
    description: "Next Gen DeFi Market - Secure, fast, and decentralized cryptocurrency exchange platform",
    siteName: "Nexa Market",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexa Market",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexa Market",
    description: "Next Gen DeFi Market - Secure, fast, and decentralized cryptocurrency exchange platform",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <GoogleAuthProviderWrapper>
          <Suspense fallback={null}>
            <AuthProvider>
              <ToastProvider>
                <PriceSchedulerInitializer />
                <MixpanelProvider />
                <Toaster />
                {children}
              </ToastProvider>
            </AuthProvider>
          </Suspense>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
