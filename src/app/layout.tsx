import type { Metadata } from "next";
import { Orbitron, Sora, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import RadarBackground from "@/components/RadarBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import MetaPixel from "@/components/MetaPixel";
import { getCurrentUser } from "@/lib/session";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["500", "600", "700", "800"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
});

const mono = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "AGI Aeronautics | AITC - Intelligence for Aviation",
  description:
    "AGI Aeronautics builds AITC, a futuristic, AI-augmented, web-based air traffic control simulator platform for training and research.",
  icons: {
    icon: "/logo/agi-logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${sora.variable} ${mono.variable} font-body antialiased`}
      >
        <MetaPixel />
        <RadarBackground />
        <Navbar user={user} />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
