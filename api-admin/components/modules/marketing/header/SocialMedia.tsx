import { ThemeToggle } from "@/components/custom/ThemeToggle";
import { cn } from "@/lib/utils";
//import { LucideGithub, Youtube } from "lucide-react";
//import Link from "next/link";
import React from "react";

export default function SocialMedia({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <ul className="flex items-center h-full gap-12 text-heading text-base">
        {/* <li>
          <Link
        target="_blank"
        className="hover:text-slate-700 flex items-center gap-4 dark:hover:text-white"
        href="https://www.youtube.com/@sylvaincodes593"
          >
        <Youtube />
        Youtube
          </Link>
        </li>
        <li>
          <Link
        target="_blank"
        className="hover:text-slate-700 flex items-center gap-4 dark:hover:text-white"
        href="https://github.com/sylvaincodes"
          >
        <LucideGithub />
        Github
          </Link>
        </li> */}
      <li>
        <ThemeToggle />
      </li>
    </ul>
  </div>
  );
}
