import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import { font } from "./fonts";

export const metadata: Metadata = {
  title: "Vendor-E-store",
  description: "Vendor dashboard for product management on EStore.Api.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
