"use client";

import * as React from "react";
import { ClerkProvider as Clerk } from "@clerk/nextjs";

interface ClerkProviderProps {
    children: React.ReactNode;
  }

function ClerkProvider({ children }:ClerkProviderProps ) {
  return (
    <Clerk
    appearance={{
      elements: {
        cardBox: "rounded-none",
        formButtonPrimary:
          "bg-primary-500 border-0  rounded-none p-2 !shadow-none text-xl hover:bg-secondary-700",

        formFieldInput: "rounded-none p-4 ",

        formFieldLabel: "text-sm",

        socialButtons: "flex flex-col",
        socialButtonsBlockButton: "w-full rounded-none p-4 ",

        socialButtonsBlockButton__box: "inline-flex justify-start",

        footer: "hidden",
      },

      layout: {
        logoPlacement: "none",
        socialButtonsVariant: "blockButton",
        socialButtonsPlacement: "bottom",
        logoImageUrl: "/assets/logo/mobile_black.svg",
      },
    }}
    signUpUrl="/sign-up"
    signInUrl="/sign-in"
    afterSignOutUrl="/"
    signInFallbackRedirectUrl="/"
    signUpFallbackRedirectUrl="/"
  >
        {children}
    </Clerk>
  );
}

export default ClerkProvider;
