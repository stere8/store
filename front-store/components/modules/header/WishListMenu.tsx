"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { IRootState } from "@/store";
import { removeFromWishList } from "@/store/WishListSlice";
import { WishListItem } from "@/types";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCardMini from "@/components/custom/ProductCardMini"; // adjust path if needed

export default function WishListMenu({
  openWishList,
  setOpenWishList,
}: {
  openWishList: boolean;
  setOpenWishList: (v: boolean) => void;
}) {
  const wishlistItems = useSelector((state: IRootState) => state.WishList.items);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleRemove = (item: WishListItem) => {
    dispatch(removeFromWishList(item.variant._id));
  };

  return (
    <m.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "hidden absolute top-[65px] right-[80px] w-[464px] z-50 shadow-lg",
        openWishList && "block"
      )}
      onMouseLeave={() => setOpenWishList(false)}
    >
      <Card className="rounded-none">
        <CardHeader className="py-[16px] px-[24px] border-b">
          <CardTitle className="font-medium text-sm">
            Wishlist ({wishlistItems.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="py-4 px-6 flex flex-col gap-4 h-[200px] overflow-auto">
          {wishlistItems.length > 0 ? (
            <AnimatePresence>
              {wishlistItems
                  .filter((item) => item && item.variant && item.variant._id)
                  .map((item) => (
                    <m.div
                      key={item.variant._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                >
                  <ProductCardMini
                    item={item}
                    onRemove={handleRemove}
                    compact
                  />
                </m.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col gap-1 items-center">
              <Heart className="text-slate-700 font-bold" size={100} />
              <h5>Your wishlist is empty</h5>
            </div>
          )}
        </CardContent>

        <CardFooter className="py-4 px-6">
          <RectangleButton
            onClick={() => router.push("/WishList")}
            variant="primary"
            size="lg"
            icon="none"
            className="uppercase w-full"
          >
            View Wishlist
          </RectangleButton>
        </CardFooter>
      </Card>
    </m.div>
  );
}
