import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/providers";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "VoiceAI — AI Voice Outreach Platform",
  description: "Upload contacts, launch campaigns, and let AI handle real-time voice conversations at scale.",
  keywords: ["AI calling", "voice AI", "outbound calls", "sales automation", "lead qualification"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
