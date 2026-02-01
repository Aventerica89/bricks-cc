import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WP Manager - Claude AI Integration",
  description:
    "Unified client management platform with Claude AI, WordPress, and Basecamp integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
