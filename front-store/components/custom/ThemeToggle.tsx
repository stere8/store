"use client";

import React from "react";

import { Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        variant="outline"
        size="icon"
        className="rounded-full hover:bg-black hover:text-white border-0 text-gray-500 dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-black"
      >
        <Sun className="h-4 w-4 hover:animate-jump hover:animate-once" />
      </Button>
    </div>
  );
};
