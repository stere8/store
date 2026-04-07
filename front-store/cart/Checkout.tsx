import CurrencyFormat from "@/components/custom/CurrencyFormat";
import ProductItem from "@/components/custom/ProductItem";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { cn } from "@/lib/utils";
import { TypeCartItemModel, TypeCartModel } from "@/types/models";
import { Loader2Icon } from "lucide-react";
import React from "react";
import { FormattedMessage } from "react-intl";

export default function Checkout({
  coupon,
  subtotal,
  tax,
  shipping,
  total,
  className,
  placeOrder,
  proceedToShipping,
  onReserve,
  loading,
  reservationDisabled,
  reservationNotice,
  cart,
}: {
  coupon?: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  className?: string;
  placeOrder?: () => void;
  proceedToShipping?: () => void;
  onReserve?: () => void;
  loading: boolean;
  reservationDisabled?: boolean;
  reservationNotice?: string;
  cart?: TypeCartModel;
}) {
  void coupon;
  void tax;
  void shipping;
  void placeOrder;
  const reserveAction = onReserve ?? proceedToShipping;

  return (
  <div
    className={`flex h-fit border boder-border p-4 w-full lg:w-fit min-w-[360px] flex-col gap-4 ${className}`}
  >
    {cart && (
      <div className="flex flex-col gap-4 pb-4">
        <h3>
          <FormattedMessage id="checkout.order-summary" defaultMessage="Order summary" />
        </h3>
        <div className="flex flex-col gap-1">
          {cart.cartItems.length > 0 &&
            cart.cartItems.map((item: TypeCartItemModel, idx) => (
              <ProductItem item={item} key={idx} />
            ))}
        </div>
      </div>
    )}
    <div className="flex justify-between">
      <span>
        <FormattedMessage id="checkout.subtotal" defaultMessage="Subtotal" />
      </span>
      <span>
        <CurrencyFormat className="text-right" value={subtotal} />
      </span>
    </div>
    <hr />

    <div className="flex justify-between">
      <strong>
        <FormattedMessage id="checkout.reservation-total" defaultMessage="Reservation total" />
      </strong>
      <strong>
        <CurrencyFormat className="text-right" value={total} />
      </strong>
    </div>

    {reservationNotice && (
      <p className="text-sm text-amber-700">{reservationNotice}</p>
    )}

    <div className="flex flex-col gap-4 mt-4">
      {reserveAction && (
        <RectangleButton
          variant="primary"
          icon="none"
          size="lg"
          onClick={reserveAction}
          disabled={loading || reservationDisabled}
          className="rounded-none"
        >
          <Loader2Icon
            className={cn(
              "hidden mr-2 h-6 w-6 animate-spin ",
              loading && "block"
            )}
          />
          <FormattedMessage id="checkout.reserve-cart" defaultMessage="Reserve cart" />
        </RectangleButton>
      )}
    </div>
  </div>

  );
}
