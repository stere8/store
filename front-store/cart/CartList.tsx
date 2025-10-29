"use client";
import React from "react";
import Container from "@/components/custom/Container";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { CartItem as TypeCartItem } from "@/types";
import { CartItemForm } from "@/types/forms";
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
  const { getToken } = useAuth();

  const proceedToShipping = async () => {
    setLoading(true);
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    const token = await getToken();

    if (cart.cartItems.length > 8) {
      setLoading(false);
      return;
    }

    const reDefinedCartItems: CartItemForm[] = [];
    for (let index = 0; index < cart.cartItems.length; index++) {
      const element = cart.cartItems[index];
      reDefinedCartItems.push({
        store: element.store,
        variant: element.variant._id,
        productImage: element.productImage,
        productName: element.productName,
        qty: element.qty,
      });
    }

    const data = {
      cartItems: reDefinedCartItems,
      subTotal: total,
      user_id: user?.id,
    };

    await axios
      .post(process.env.NEXT_PUBLIC_API_URL + "/api/user/carts", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        router.push("/cart/" + data.data._id);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {});
  };

  const [total, setTotal] = useState(0);
  const subtotal =
    cart.cartItems.length > 0
      ? cart.cartItems.reduce(
          (accumulator: number, currentValue: TypeCartItem) =>
            accumulator +
            discountPrice(
              currentValue.variant.price,
              currentValue.variant.discount
            ) *
              currentValue.qty,
          0
        )
      : 0;

  useEffect(() => {
    setTotal(subtotal);
  }, [subtotal]);

   return (
    <section className="my-10">
      {loading && <Loading loading={loading} />}
      <Container>
        <div className="flex flex-col gap-12 items-start mt-20 xl:flex-row">
          <div className="relative overflow-x-auto flex-1 w-full">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 cursor-move">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    <FormattedMessage id="cart.product" defaultMessage="Product" />
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <FormattedMessage id="cart.price" defaultMessage="Price" />
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <FormattedMessage id="cart.quantity" defaultMessage="Quantity" />
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <FormattedMessage id="cart.subtotal" defaultMessage="Subtotal" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.cartItems.length > 0 &&
                  cart.cartItems.map((item: TypeCartItem, idx: number) => (
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
            className=""
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