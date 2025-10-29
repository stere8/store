"use client";

import React from "react";
import { IntlProvider } from "react-intl";
import en from "@/public/locales/messages/en";
import fr from "@/public/locales/messages/fr";
import rw from "@/public/locales/messages/rw";
import sw from "@/public/locales/messages/sw";

const messages: Record<string, Record<string, string>> = { en, fr, rw, sw };

type IntProviderProps = {
  locale: keyof typeof messages;
  children: React.ReactNode;
};

function I18nProvider({ locale, children }: IntProviderProps) {
  return (
    <IntlProvider
      messages={messages[locale]}
      locale={locale}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  );
}

export default I18nProvider;
