"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/custom/Container";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/epoc-api";
import { CartItem as TypeCartItem } from "@/types";
import { IRootState } from "@/store";
import { memoize } from "proxy-memoize";
import { useAuth, useUser } from "@clerk/nextjs";
import Checkout from "./Checkout";
import Loading from "@/components/custom/Loading";
import { discountPrice } from "@/lib/utils";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { ChevronLeft } from "lucide-react";
import CartItem from "./CartItem";
import { FormattedMessage } from "react-intl";
import { toast } from "@/hooks/use-toast";
import { emptyToCart } from "@/store/cartSlice";
import {
  buildAuthRedirectUrl,
  clearAuthResumeState,
  getCustomerFullName,
  getCustomerPhoneNumber,
  readAuthResumeState,
  upsertCustomerFromUser,
  writeAuthResumeState,
} from "@/lib/customer-auth";

export default function Cart() {
  const dispatch = useDispatch();
  const { cart } = useSelector(memoize((state: IRootState) => ({ ...state })));
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const hasAutoResumedReservation = useRef(false);

  const vendorIds = useMemo(
    () =>
      Array.from(
        new Set(
          cart.cartItems
            .map((item) =>
              typeof item.store === "string" ? item.store : item.store?._id
            )
            .filter((value): value is string => Boolean(value))
        )
      ),
    [cart.cartItems]
  );

  const canReserve = cart.cartItems.length > 0 && vendorIds.length === 1;
  const reservationNotice =
    vendorIds.length > 1
      ? "Reservations currently support one vendor per cart. Remove items from other sellers to continue."
      : undefined;

  const reserveCart = useCallback(async () => {
    setLoading(true);

    if (!isSignedIn) {
      writeAuthResumeState({
        action: "checkout",
        returnPath: pathname,
      });
      setLoading(false);
      router.push(buildAuthRedirectUrl("/sign-in", pathname));
      return;
    }

    if (!canReserve) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Reservation unavailable",
        description:
          reservationNotice || "Your cart must contain at least one item.",
      });
      return;
    }

    if (!user) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Missing customer details",
        description:
          "Sign in with a complete customer profile before reserving your cart.",
      });
      return;
    }

    const customerName = getCustomerFullName(user).trim();
    const customerPhone = getCustomerPhoneNumber(user).trim();
    const customerEmail = user.primaryEmailAddress?.emailAddress?.trim() || null;

    if (!customerName || !customerPhone) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Missing customer details",
        description:
          "Sign in with a complete customer profile before reserving your cart.",
      });
      return;
    }

    try {
      await upsertCustomerFromUser(user);

      const response = await apiClient.post("/api/reservations", {
        vendorId: vendorIds[0],
        customerName,
        customerPhone,
        customerEmail,
        preferredLanguage: "en",
        items: cart.cartItems.map((item) => ({
          productId: item.variant._id,
          quantity: item.qty,
        })),
      });

      clearAuthResumeState();
      dispatch(emptyToCart());
      router.push(`/reservation/${response.data.id}`);
    } catch (err: any) {
      console.error("Error creating reservation:", err);
      toast({
        variant: "destructive",
        title: "Reservation failed",
        description:
          err?.response?.data?.error ||
          "We could not reserve these items. Check vendor and stock availability and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    canReserve,
    cart.cartItems,
    dispatch,
    isSignedIn,
    pathname,
    reservationNotice,
    router,
    user,
    vendorIds,
  ]);

  useEffect(() => {
    if (
      !isLoaded ||
      !isSignedIn ||
      loading ||
      hasAutoResumedReservation.current
    ) {
      return;
    }

    const resumeState = readAuthResumeState();

    if (
      !resumeState ||
      resumeState.action !== "checkout" ||
      resumeState.returnPath !== pathname
    ) {
      return;
    }

    hasAutoResumedReservation.current = true;
    void reserveCart();
  }, [isLoaded, isSignedIn, loading, pathname, reserveCart]);

  const subtotal =
    cart.cartItems.length > 0
      ? cart.cartItems.reduce(
          (acc: number, item: TypeCartItem) =>
            acc +
            discountPrice(item.variant.price, item.variant.discount) *
              item.qty,
          0
        )
      : 0;

  const total = subtotal;

  return (
    <section className="my-10">
      {loading && <Loading loading={loading} />}

      <Container>
        <div className="flex flex-col gap-12 items-start mt-20 xl:flex-row">
          <div className="relative overflow-x-auto flex-1 w-full">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <FormattedMessage id="cart.product" defaultMessage="Product" />
                  </th>
                  <th className="px-6 py-3">
                    <FormattedMessage id="cart.price" defaultMessage="Price" />
                  </th>
                  <th className="px-6 py-3">
                    <FormattedMessage id="cart.quantity" defaultMessage="Quantity" />
                  </th>
                  <th className="px-6 py-3">
                    <FormattedMessage id="cart.subtotal" defaultMessage="Subtotal" />
                  </th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cart.cartItems.map((item: TypeCartItem, idx: number) => (
                  <CartItem item={item} key={idx} />
                ))}

                <tr>
                  <td colSpan={5}>
                    <div className="flex justify-between py-4">
                      <RectangleButton
                        onClick={() => router.push("/products")}
                        icon="none"
                        variant="secondary-outline"
                      >
                        <ChevronLeft />
                        <FormattedMessage
                          id="cart.return-to-shopping"
                          defaultMessage="Return to shopping"
                        />
                      </RectangleButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Checkout
            loading={loading}
            subtotal={subtotal}
            total={total}
            onReserve={reserveCart}
            reservationDisabled={!canReserve}
            reservationNotice={reservationNotice}
          />
        </div>
      </Container>
    </section>
  );
}
