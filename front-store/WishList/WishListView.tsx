"use client";
import React, { useEffect, useState } from "react";
import Container from "@/components/custom/Container";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { WishListItem as TypeWishListItem } from "@/types";
import { WishListItemForm } from "@/types/forms";
import { IRootState } from "@/store";
import { useAuth, useUser } from "@clerk/nextjs";
import Loading from "@/components/custom/Loading";
import { discountPrice } from "@/lib/utils";
import { RectangleButton } from "@/components/custom/RectangleButton";
import { ChevronLeft } from "lucide-react";
import WishListItem from "./WishListItem";
import { FormattedMessage } from "react-intl";
import { memoize } from "proxy-memoize";
//import Checkout from "./Checkout";
import { cleanWishList } from "@/store/WishListSlice"; // Ensure this exists

export default function WishListView() {
  const dispatch = useDispatch();
  const { WishList } = useSelector(memoize((state: IRootState) => ({ ...state })));
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Clean null/invalid items on mount
  useEffect(() => {
    const validItems = WishList.items.filter(
      (item): item is TypeWishListItem =>
        item !== null &&
        typeof item === "object" &&
        item.variant &&
        typeof item.variant.price === "number"
    );

    if (validItems.length !== WishList.items.length) {
      dispatch(cleanWishList());
    }
  }, [WishList.items, dispatch]);

  const subtotal = WishList.items.reduce((acc, item) => {
    try {
      if (
        item &&
        item.variant &&
        typeof item.variant.price === "number"
      ) {
        return (
          acc +
          discountPrice(item.variant.price, item.variant.discount) *
            item.qty
        );
      }
      return acc;
    } catch (err) {
      console.error("Error calculating subtotal:", err);
      return acc;
    }
  }, 0);

  useEffect(() => {
    setTotal(subtotal);
  }, [subtotal]);

  const proceedToShipping = async () => {
    setLoading(true);
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const token = await getToken();
    const validItems = WishList.items.filter(
      (item): item is TypeWishListItem =>
        item &&
        typeof item === "object" &&
        item.variant &&
        typeof item.variant.price === "number"
    );

    if (validItems.length > 8) {
      setLoading(false);
      return;
    }

    const reDefineditems: WishListItemForm[] = validItems.map((element) => ({
      store: element.store,
      variant: element.variant._id,
      productImage: element.productImage,
      productName: element.productName,
      qty: element.qty,
    }));

    const data = {
      cartItems: reDefineditems,
      subTotal: total,
      user_id: user?.id,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/wishlist`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push("/wishlist/" + response.data.data._id);
    } catch (err) {
      console.error("Wishlist shipping error:", err);
    } finally {
      setLoading(false);
    }
  };

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
                    <FormattedMessage id="WishList.product" defaultMessage="Product" />
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <FormattedMessage id="WishList.price" defaultMessage="Price" />
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <FormattedMessage id="WishList.quantity" defaultMessage="Quantity" />
                  </th>
                  <th scope="col" className="px-6 py-3">
                    <FormattedMessage id="WishList.subtotal" defaultMessage="Subtotal" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {WishList.items.map((item: TypeWishListItem, idx: number) => (
                  <WishListItem item={item} key={idx} />
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
                          id="WishList.return-to-shopping"
                          defaultMessage="Return to shopping"
                        />
                      </RectangleButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        {/*}
          <Checkout
            className=""
            loading={loading}
            subtotal={subtotal}
            total={total}
            proceedToShipping={proceedToShipping}
          />
          */}
        </div>
      </Container>
    </section>
  );
}
