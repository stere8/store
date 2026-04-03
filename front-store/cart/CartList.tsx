"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/custom/Container";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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

export default function Cart() {
  const { cart } = useSelector(memoize((state: IRootState) => ({ ...state })));
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const proceedToShipping = async () => {
    setLoading(true);

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (cart.cartItems.length > 8) {
      setLoading(false);
      return;
    }

    try {
      // 1. Ensure customer
      const customerResponse = await apiClient.post("/api/customers", {
        username: user?.id,
        fullName: user?.fullName || user?.firstName || user?.id,
        phoneNumber: `+250${(user?.id || "000000000")
          .replace(/\D/g, "")
          .slice(0, 9)
          .padEnd(9, "0")}`,
        email: user?.primaryEmailAddress?.emailAddress || null,
        preferredLanguage: "en",
      });

      // 2. Ensure cart
      const ensureCartResponse = await apiClient.post("/api/carts/ensure", {
        customerId: customerResponse.data.id,
      });

      const cartId = ensureCartResponse.data.id;

      // 3. Sync items to backend cart
      for (const item of cart.cartItems) {
        await apiClient.post(`/api/carts/${cartId}/items`, {
          productId: item.variant._id,
          quantity: item.qty,
        });
      }

      // 4. Redirect
      router.push(`/cart/${cartId}`);
    } catch (err) {
      console.error("Error proceeding to shipping:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(subtotal);
  }, [subtotal]);

  return (
    <section className="my-10">
      {loading && <Loading loading={loading} />}

      <Container>
        <div className="flex flex-col gap-12 items-start mt-20 xl:flex-row">
          {/* TABLE */}
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

          {/* CHECKOUT */}
          <Checkout
            loading={loading}
            subtotal={subtotal}
            total={total}
            proceedToShipping={proceedToShipping}
          />
        </div>
      </Container>
    </section>
  );
}