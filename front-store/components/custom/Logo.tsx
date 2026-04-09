"use client";
import { LocaleLink } from "@/components/custom/LocaleLink";
import { BRAND, BRAND_ASSETS, BRAND_IMAGE_DIMENSIONS } from "@/lib/branding";
import { cn } from "@/lib/utils";
import React from "react";
import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
  variant?: "primary" | "symbol";
};

export default function Logo({
  className,
  priority = true,
  variant = "primary",
}: LogoProps) {
  const logo =
    variant === "symbol"
      ? {
          src: BRAND_ASSETS.symbol,
          alt: `${BRAND.shortName} symbol`,
          width: BRAND_IMAGE_DIMENSIONS.symbol.width,
          height: BRAND_IMAGE_DIMENSIONS.symbol.height,
          imageClassName: "h-9 w-auto object-contain sm:h-10",
        }
      : {
          src: BRAND_ASSETS.primaryLogo,
          alt: BRAND.fullName,
          width: BRAND_IMAGE_DIMENSIONS.primaryLogo.width,
          height: BRAND_IMAGE_DIMENSIONS.primaryLogo.height,
          imageClassName: "h-10 w-auto object-contain sm:h-12 lg:h-14",
        };

  return (
    <LocaleLink
      href="/"
      aria-label={BRAND.fullName}
      className={cn("flex items-center shrink-0", className)}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={logo.imageClassName}
      />
    </LocaleLink>
  );
}
