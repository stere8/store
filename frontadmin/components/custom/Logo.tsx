"use client"
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/assets/images/logo.png"
        alt="E-City Commerce Rwanda"
        width={220}
        height={84}
        priority
        className="h-10 w-auto object-contain sm:h-12"
      />
    </Link>
  );
}
