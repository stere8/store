import * as React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { publicSans } from "./fonts";
import Providers from "@/providers";
import { BRAND, BRAND_ASSETS } from "@/lib/branding";
import { mergeOpenGraph } from "@/lib/mergeOpenGraph";

const metadataBase = process.env.NEXT_PUBLIC_SERVER_URL
  ? new URL(process.env.NEXT_PUBLIC_SERVER_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase,
  applicationName: BRAND.fullName,
  title: BRAND.fullName,
  description: BRAND.description,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: BRAND_ASSETS.appIcon,
    shortcut: BRAND_ASSETS.appIcon,
    apple: BRAND_ASSETS.appIcon,
  },
  openGraph: mergeOpenGraph({
    title: BRAND.fullName,
    description: BRAND.description,
    url: "/",
  }),
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const dir = params.locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={params.locale} dir={dir}>
      <body className={`${publicSans.className} antialiased`}>
        <Providers locale={params.locale}>{children}</Providers>
      </body>
    </html>
  );
}
