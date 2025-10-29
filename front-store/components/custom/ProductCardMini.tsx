import { CartItem } from "@/types";
import Image from "next/image";
import React from "react";
import CurrencyFormat from "./CurrencyFormat";
import { X } from "lucide-react";
import { discountPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
type ProductCardMiniProps = {
  item: CartItem;
  onRemove: (item: CartItem) => void;
  compact?: boolean;
};

export default function ProductCardMini({
  item,
  onRemove,
  compact = false,
}: ProductCardMiniProps) {
  const imageUrl =
    item.variant.sizeImages?.[0]?.url ||
    item.variant.colorImages?.[0]?.url ||
    item.productImage;

  const hasDiscount = item.variant.discount > 0;
  const originalPrice = item.variant.price;
  const finalPrice = discountPrice(originalPrice, item.variant.discount);

  return (
    <div
      className={cn(
        "grid items-center gap-4",
        compact ? "grid-cols-[50px_1fr_20px]" : "grid-cols-3"
      )}
    >
      <Image
        src={imageUrl}
        width={compact ? 50 : 100}
        height={compact ? 50 : 100}
        alt="product"
        className="rounded object-contain"
      />

      <div className="flex flex-col justify-center gap-[2px]">
        <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
        {item.variant?.name && (
          <p className="text-xs text-gray-500">Variant: {item.variant.name}</p>
        )}
        <p className="text-xs text-gray-500">Qty: {item.qty}</p>

        <div className="text-xs mt-1">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <CurrencyFormat
                value={finalPrice}
                className="text-green-600 font-semibold"
                suffix
              />
              <CurrencyFormat
                value={originalPrice}
                className="line-through text-gray-400"
                suffix
              />
            </div>
          ) : (
            <CurrencyFormat
              value={originalPrice}
              className="text-gray-700 font-medium"
              suffix
            />
          )}
        </div>
      </div>

      <X
        className="text-gray-400 hover:text-red-500 cursor-pointer"
        size={16}
        onClick={() => onRemove(item)}
      />
    </div>
  );
}