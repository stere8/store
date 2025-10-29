import * as React from "react";
import "./globals.css";
import { publicSans } from "./fonts";
import Providers from "@/providers";

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
