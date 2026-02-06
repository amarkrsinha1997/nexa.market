import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import GoogleAuthProviderWrapper from "@/providers/GoogleAuthProviderWrapper";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import PriceSchedulerInitializer from "@/components/providers/PriceSchedulerInitializer";
import MixpanelProvider from "@/components/providers/MixpanelProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexa Market",
  description: "Next Gen DeFi Market",
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
              <PriceSchedulerInitializer />
              <MixpanelProvider />
              {children}
            </AuthProvider>
          </Suspense>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
