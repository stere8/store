"use client";
import MobileNav from "@/components/custom/MobileNav";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavMenu() {
  const routes = [
    {
      name: "dashboard",
      link: "/admin/dashboard",
    },
    {
      name: "categories",
      link: "/admin/categories",
    },
    {
      name: "subs categories",
      link: "/admin/subcategories",
    },
    {
      name: "tags",
      link: "/admin/tags",
    },

    {
      name: "collections",
      link: "/admin/collections",
    },
    {
      name: "brands",
      link: "/admin/brands",
    },

    {
      name: "sellers campaigns",
      link: "/admin/slides",
    },
    {
      name: "pages",
      link: "/admin/pages",
    },
    {
      name: "Payments gateways",
      link: "/admin/pmethods",
    },
    {
      name: "shippings",
      link: "/admin/shippings",
    },
    {
      name: "vendors",
      link: "/admin/stores",
    },
    {
      name: "subscriptions",
      link: "/admin/subscriptions",
    },
    {
      name: "settings",
      link: "/admin/settings",
    },

    //TODO: add analysis content
    // {
    //   name: "analytics",
    //   link: "/admin/analytics",
    // },
    {
      name: "withdrawals",
      link: "/admin/withdrawals",
    },
    {
      name: "configurations",
      link: "/admin/configurations",
    },
  ];

  const pathname = usePathname();

  return (
    <>
      <MobileNav className="lg:hidden">
        <ul className="flex flex-col gap-8 items-center text-heading capitalize">
          {routes &&
            routes.map((item: { name: string; link: string }, idx: number) => (
              <li key={idx} className={cn("flex items-center gap-2")}>
                <Link
                  className={cn(
                    " hover:text-black dark:hover:text-white dark:text-white",
                    pathname.endsWith(item.link) && "text-black font-bold"
                  )}
                  href={`${item.link}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
        </ul>
      </MobileNav>
      <nav>
        <ul className="hidden lg:flex gap-8 items-center justify-center text-heading capitalize">
          {routes &&
            routes.map((item: { name: string; link: string }, idx: number) => (
              <li key={idx} className={cn("flex items-center gap-2")}>
                <Link
                  className={cn(
                    " hover:text-black dark:hover:text-white dark:text-white",
                    pathname.endsWith(item.link) && "text-black font-bold"
                  )}
                  href={`${item.link}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </>
  );
}
