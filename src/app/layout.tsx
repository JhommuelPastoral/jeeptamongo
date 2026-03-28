import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/lib/queryProvider";
import { SessionProvider } from "next-auth/react";
import "leaflet/dist/leaflet.css";
import { Toaster } from "@/components/ui/sonner"

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JeepTa",
  description: "JeepTa is a real-time jeepney tracking and navigation app designed to help commuters in Davao City travel smarter, faster, and more efficiently.",
  icons:{
    icon:"/logo.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </QueryProvider>
        <Toaster/>
      </body>
    </html>
  );
}
