"use client";
import { cn } from "@/lib/utils";
import { IRootState } from "@/store";
import Link from "next/link";
import React from "react";
import {
  FaTwitter,
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa6";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

export default function SocialIcons({ className }: { className?: string }) {
  const { config } = useSelector((state: IRootState) => ({ ...state }));

  return (
    <div
      className={cn("flex gap-[12px] items-center justify-center", className)}
    >
      <span className="">
        {" "}
        <FormattedMessage id={`header.follow_us`} />
      </span>
      <div className="flex gap-[12px]">
        <Link target="_blank" href={config.siteDetails.twitter}>
          <FaTwitter />
        </Link>
        <Link target="_blank" href={config.siteDetails.youtube}>
          <FaYoutube />
        </Link>
        <Link target="_blank" href={config.siteDetails.instagram}>
          <FaInstagram />
        </Link>
        <Link target="_blank" href={config.siteDetails.facebook}>
          <FaFacebook />
        </Link>
        <Link target="_blank" href={config.siteDetails.tiktok}>
          <FaTiktok />
        </Link>
      </div>
    </div>
  );
}
