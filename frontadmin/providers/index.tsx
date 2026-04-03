"use client";
import * as React from "react";
import ToasterProvider from "./ToastProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./ThemeProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsVariant: "blockButton",
          socialButtonsPlacement: "bottom",
          logoImageUrl: "/assets/images/logo_dark.svg",
        },
        // baseTheme: [ dark],
      }}
      signUpUrl="/sign-up"
      signInUrl="/sign-in"
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/stores"
      signUpFallbackRedirectUrl="/stores"
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <ToasterProvider />
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default Providers;
