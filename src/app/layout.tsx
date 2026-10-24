import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import MetaPixel from "@/components/MetaPixel";
import { getCurrentUser } from "@/lib/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AGI Aeronautics | AITC",
  description:
    "AITC is a browser-based air traffic control simulator from AGI Aeronautics. It runs on an iMac, a MacBook, an iPad, and any modern computer.",
  icons: {
    icon: "/logo/agi-mark.png",
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
      <body className={`${inter.variable} font-body antialiased`}>
        <MetaPixel />
        <Navbar user={user} />
        <main className="min-h-screen pt-12">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
