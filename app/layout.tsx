import type { Metadata } from "next";
import { HQProvider } from "@/context/HQContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATFT HQ",
  description: "The operating system for Arletta The Friendly Trader.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HQProvider>{children}</HQProvider>
      </body>
    </html>
  );
}