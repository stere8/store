import "./globals.css";
import { font } from "./fonts";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Frontadmin",
  description: "Admin frontend aligned to EStore.Api.",
  icons: {
    icon: "/assets/images/logo_dark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} min-h-screen bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
