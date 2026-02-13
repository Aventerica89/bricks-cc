import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBarWrapper from "@/components/nav-bar-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WP Dispatch - AI-Powered WordPress Management",
  description:
    "Teaching system and AI agent for generating Bricks Builder components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#0c0c0c] text-[#f5f5f5] font-[family-name:var(--font-inter)]">
        <NavBarWrapper />
        {children}
      </body>
    </html>
  );
}
