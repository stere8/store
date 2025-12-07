// front-store/components/ReachOutToVendorButton.tsx
"use client";
import React from "react";

type Props = {
  vendorName: string;
  vendorPhone: string;
  productName: string;
  className?: string;
};

export function ReachOutToVendorButton({
  vendorName,
  vendorPhone,
  productName,
  className,
}: Props) {
  if (!vendorPhone) return null;
  const normalizedPhone = vendorPhone.replace(/[^\d]/g, "");
  const message = encodeURIComponent(
    `Hello ${vendorName}, I'm interested in "${productName}" that I saw on E‑Store. Is it available for reservation?`
  );
  const href = `https://wa.me/${normalizedPhone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      }
    >
      Reach out to vendor
    </a>
  );
}
