import Row from "@/components/custom/Row";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

export default function Nav({ className }: { className?: string }) {
  return (
    <Row className={cn(className)}>
      <ul className="flex items-center h-full gap-12 text-heading text-base">
        {/* <li>
          <Link
            href="/features"
            className="hover:text-slate-700 dark:hover:text-white"
          >
            Features
            <Badge
              className="ms-2  text-slate-700 text-[12px] dark:hover:text-white"
              variant="outline"
            >
              news
            </Badge>
          </Link>
        </li> */}
        {/*
         */}
        <li>
          <Link
            className="hover:text-slate-700 dark:hover:text-white"
            href="/docs"
          >
            Docs
          </Link>
        </li>
        <li>
          <Link
            className="hover:text-slate-700 dark:hover:text-white"
            href="/pricing"
          >
            Pricing
          </Link>
        </li>
      </ul>
    </Row>
  );
}
