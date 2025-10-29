"use client";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import { Grid, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactElement } from "react";
import { PiSignOut } from "react-icons/pi";

export default function LeftSidebar() {
  const routes = [
    {
      name: "dashboard",
      link: "/customer/dashboard",
      icon: <Grid size={20} />,
    },

    {
      name: "orders",
      link: "/customer/orders",
      icon: <Store size={20} />,
    },

    // {
    //   name: "addresses",
    //   link: "/customer/addresses",
    //   icon: <BookUser size={20} />,
    // },
  ];

  const pathname = usePathname();

  return (
    <aside className="shadow-xl bg-white rounded-lg h-fit">
      <ul className="h-auto">
        {routes.map(
          (item: { name: string; link: string; icon: ReactElement }) => (
            <li
              key={item.name}
              className={cn(
                "py-4 px-8 text-gray-600  hover:bg-primary-500 group",
                pathname.endsWith(item.link) && "bg-primary-500"
              )}
            >
              <Link
                href={item.link}
                className="flex item-center gap-8 capitalize"
              >
                <span
                  className={cn(
                    "flex items-center text-gray-600 group-hover:text-white",
                    pathname.endsWith(item.link) && "text-white"
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    "text-gray-600 group-hover:text-white text-body-xl-400",
                    pathname.endsWith(item.link) && "text-white"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          )
        )}

        <li
          className={cn(
            "py-4 px-8 text-gray-600 group hover:bg-primary-500 flex item-center gap-8 capitalize hover:text-white"
          )}
        >
          <PiSignOut className="mt-2" />
          <SignOutButton />
        </li>
      </ul>
    </aside>
  );
}
