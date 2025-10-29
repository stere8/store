"use client";
import { LocaleLink } from "@/components/custom/LocaleLink";
import React from "react";
import { IRootState } from "@/store";
import { useSelector } from "react-redux";
import Image from "next/image";

export default function Logo() {
  const { config } = useSelector((state: IRootState) => ({ ...state }));

  return (
    <>
      <LocaleLink href="/" className="lg:hidden"></LocaleLink>

      {/* large screen  */}
      <LocaleLink href="/" className="hidden lg:block">
        <Image
          src={config.siteDetails.logo}
          alt="logo"
          width={64}
          height={48}
        />
      </LocaleLink>
    </>
  );
}
