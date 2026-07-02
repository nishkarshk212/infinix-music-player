import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infinity Music Player",
  description: "Premium Telegram Mini Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
