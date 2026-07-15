import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATFT HQ",
  description: "The operating system for Arletta The Friendly Trader.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
