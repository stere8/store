import { ShoppingBasket } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { FormattedMessage } from "react-intl";
export default function EmptyCart() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 w-fit justify-center m-auto py-20 items-center">
      <ShoppingBasket className="font-bold text-primary-500" size={100} />
      <FormattedMessage id="shopping.cart-empty" defaultMessage="your Shopping cart is empty" />
      <RectangleButton
        variant="primary-outline"
        size="lg"
        className="capitalize"
        onClick={() => router.push("/products")}
        icon="none"
      >
        {/* shop now*/}
        <FormattedMessage id="shopping.shop-now" defaultMessage="Shop now" />
      </RectangleButton>
    </div>
  );
}
