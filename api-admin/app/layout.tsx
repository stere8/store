import "./globals.css";
import { font } from "./fonts";
import Providers from "@/providers";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={false}>
      <body className={`flex flex-col min-h-screen ${font.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
