"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { cn, discountPrice } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";
import { CartItem } from "@/types";
import ProductCardMini from "@/components/custom/ProductCardMini";
import { useSelector, useDispatch } from "react-redux";
import { IRootState } from "@/store";
import { ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateToCart } from "@/store/cartSlice";

export default function ShoppingCartMenu({
  openShoppingCart,
  setOpenShoppingCart,
}: {
  openShoppingCart: boolean;
  setOpenShoppingCart: (v: boolean) => void;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: IRootState) => state.cart.cartItems);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (acc, item) =>
        acc +
        discountPrice(item.variant.price, item.variant.discount) * item.qty,
      0
    );
  }, [cartItems]);

  const handleRemove = (item: CartItem) => {
    const updated = cartItems.filter(
      (i) => i.variant._id !== item.variant._id
    );
    dispatch(updateToCart(updated));
  };

  return (
    <m.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "hidden absolute top-[65px] right-5 w-[464px] z-50 shadow-lg",
        openShoppingCart && "block"
      )}
      onMouseLeave={() => setOpenShoppingCart(false)}
    >
      <Card className="rounded-none">
        <CardHeader className="py-4 px-6 border-b">
          <CardTitle className="text-sm font-medium">
            Shopping Cart ({cartItems.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="py-4 px-6 flex flex-col gap-4 h-[200px] overflow-auto">
          {cartItems.length > 0 ? (
            <AnimatePresence>
              {cartItems.map((item) => (
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
            <div className="flex flex-col items-center gap-1">
              <ShoppingBasket className="text-slate-700" size={100} />
              <h5>Your cart is empty</h5>
            </div>
          )}
        </CardContent>

        <CardFooter className="py-4 px-6 flex flex-col gap-4 border-t">
          <div className="flex justify-between w-full text-body-sm-400">
            <span>Sub-Total:</span>
            <CurrencyFormat
              value={subtotal}
              className="text-right text-body-sm-500 font-medium"
              suffix
            />
          </div>

          <RectangleButton
            onClick={() => router.push("/cart")}
            variant="primary-outline"
            size="lg"
            icon="none"
            className="uppercase w-full"
          >
            View Cart
          </RectangleButton>
        </CardFooter>
      </Card>
    </m.div>
  );
}
