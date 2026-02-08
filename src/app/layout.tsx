import type { Metadata } from "next";
import "./globals.css";
import NavBarWrapper from "@/components/nav-bar-wrapper";

export const metadata: Metadata = {
  title: "Bricks CC - AI-Powered Bricks Builder",
  description:
    "Teaching system and AI agent for generating Bricks Builder components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBarWrapper />
        {children}
      </body>
    </html>
  );
}
