"use client";
import { LocaleLink } from "@/components/custom/LocaleLink";
import React from "react";
import { IRootState } from "@/store";
import { useSelector } from "react-redux";
import Image from "next/image";

export default function Logo() {
  const { config } = useSelector((state: IRootState) => ({ ...state }));
  const logoSrc = config.siteDetails.logo || "/assets/images/logo.png";
  const logoAlt = config.siteDetails.name || "E-City Commerce Rwanda";

  return (
    <LocaleLink href="/" className="flex items-center">
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={220}
        height={84}
        priority
        className="h-10 w-auto object-contain sm:h-12 lg:h-14"
      />
    </LocaleLink>
  );
}
