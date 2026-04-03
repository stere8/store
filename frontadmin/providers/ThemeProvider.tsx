"use client";

import React from "react";
import { ThemeProvider as NextThemesProviders } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProviders {...props}>{children}</NextThemesProviders>;
};
