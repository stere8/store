
"use client";

import { TypeProductModel, TypeProductVariantModel } from "@/types/models";
import { useState } from "react";
import { cn, discountPrice, getRatingNote } from "@/lib/utils";
import { Rating } from "@mui/material";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { Badge } from "@/components/custom/Badge";
import ProductColors from "./ProductColors";
import { Separator } from "@/components/ui/separator";
import ProductSizes from "./ProductSizes";
import ProductQty from "./ProductQty";
import { ShoppingCart } from "lucide-react";
import { RectangleButton } from "@/components/custom/RectangleButton";
import ProductShare from "./ProductShare";
import ProductPayments from "./ProductPayments";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import { CartItem } from "@/types";
import { addToCart, updateToCart } from "@/store/cartSlice";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import Loading from "@/components/custom/Loading";
import { memoize } from "proxy-memoize";
import axios from "axios";
import getStripe from "@/lib/get-stripejs";
import { FormattedMessage } from "react-intl";
import { WishListItem } from "@/types";
import React from "react";

export default function ProductDetails({
  product,
  colors,
  activeSizes,
  setActiveOption,
  activeOptionVariant,
}: {
  product: TypeProductModel;
  colors: TypeProductVariantModel[];
  activeSizes?: TypeProductVariantModel[];
  activeOptionVariant?: TypeProductVariantModel;
  setActiveOption: (value: string) => void;
}) {
  const { cart } = useSelector(memoize((state: IRootState) => ({ ...state })));
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState<number>(1);


  const itemForWishlist: WishListItem = {
    store: product?.store[0].name,
    productName: product?.name,
    productImage: product?.images[0].url,
    variant: activeOptionVariant!,
    qty: qty,
  };

  const handleAddToCart = (p: TypeProductVariantModel) => {
    if (!p) {
      toast({
        variant: "destructive",
        title: "OOps",
        description: "Choose a variant",
      });
      return;
    }
    setLoading(true);
    const _id: string = `${p?._id}`;
    const exist: CartItem | undefined = cart.cartItems.find(
      (p: CartItem) => p.variant._id === _id
    );
    if (exist) {
      const newCart = cart.cartItems.map((p: CartItem) => {
        if (p === exist) {
          return { ...p, qty: qty };
        }
        return p;
      });
      dispatch(updateToCart(newCart));
    } else {
      dispatch(
        addToCart({
          store: product?.store,
          productName: product?.name,
          productImage: product?.images[0].url,
          variant: p,
          qty: qty,
        })
      );
    }
    toast({
      variant: "default",
      title: "Well done ✔️",
      description: "Product added to cart",
      action: (
        <ToastAction altText={`Go to cart`}>
          <Link href={`/cart`}>Go to cart</Link>
        </ToastAction>
      ),
    });
    setLoading(false);
  };

  const handleBuyNow = async (p: TypeProductVariantModel) => {
    if (!p) {
      toast({
        variant: "destructive",
        title: "Oops",
        description: "Choose a variant",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/stripe-session`,
        {
          variantId: p._id,
          quantity: qty,
        }
      );

      const stripe = await getStripe();
      await stripe!.redirectToCheckout({
        sessionId: response.data.id,
      });
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "Could not initiate Stripe session.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {loading && <Loading loading={true} />}
      {/* Infos */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex flex-wrap gap-2">
            <Rating
              readOnly
              name="hover-feedback"
              value={getRatingNote(product.reviews)}
              precision={0.5}
              className="text-primary-500 text-[20px] inline-flex gap-0.5"
            />
            <div className="flex gap-2 items-center">
              <span className="text-body-sm-600 text-black">
                {getRatingNote(product.reviews)} Star Rating
              </span>
              <span className="text-gray-600 text-body-sm-400">
                ({product.reviews.length} User feedback)
              </span>
            </div>
          </div>
          <h6 className="capitalize text-body-xl-400 font-bold text-black">
            {product.name}
          </h6>
        </div>
        <div className="flex justify-between items-center flex-wrap capitalize">
          <ul className="flex-col flex gap-2">
            <li>
              <span className="text-body-sm-400 text-gray-600 mr-2">Sku:</span>
              <strong className="text-body-sm-600 text-black">
                {activeOptionVariant ? activeOptionVariant.sku : product.sku}
              </strong>
            </li>
            <li>
              <span className="text-body-sm-400 text-gray-600 mr-2">
                Brand:
              </span>
              <strong className="text-body-sm-600 text-black">
                {product.brand && product.brand.name}
              </strong>
            </li>
          </ul>
          <ul className="flex-col flex gap-2">
            <li>
              <span className="text-body-sm-400 text-gray-600 mr-2">
                Inventory:
              </span>
              <strong
                className={cn(
                  "text-body-sm-600 text-black",
                  product.inventory === "instock" && "text-success-500",
                  activeOptionVariant?.inventory === "instock" &&
                    "text-success-500"
                )}
              >
                {activeOptionVariant
                  ? activeOptionVariant.inventory
                  : product.inventory}
              </strong>
            </li>
            <li>
              <span className="text-body-sm-400 text-gray-600 mr-2">
                Category:
              </span>
              <strong className="text-body-sm-600 text-black">
                {product.category && product.category.name}
              </strong>
            </li>
          </ul>
        </div>
      </div>

    {/* Prices */}
    <div className="flex">
      <div className="grid grid-cols-2">
        {/* Fixed-size price container */}
        <div className="flex gap-3 w-[300px] h-[40px] items-center">
          {product.discount > 0 ? (
            <>
              <CurrencyFormat
                value={discountPrice(product.price, product.discount)}
                className="text-heading1 text-secondary-500 font-bold w-[300px] !max-w-[300px]"
              />
              <CurrencyFormat
                value={product.price}
                className="text-bod-xl-400 line-through"
              />
            </>
          ) : (
            <CurrencyFormat
              value={product.price}
              className="!text-heading1 text-secondary-500 font-bold w-[300px] !max-w-[300px]"
            />
          )}
        </div>

        {/* Discount badge if applicable */}
        {product.discount > 0 && (
          <Badge variant="warning" className="ms-auto">
            {product.discount}% OFF
          </Badge>
        )}
      </div>
      </div>

      <Separator />
      <div className="flex flex-wrap justify-between gap-4">
        {product.productVariants.length > 0 && (
          <ProductColors
            setActiveOption={setActiveOption}
            variants={colors}
            activeOptionVariant={activeOptionVariant}
          />
        )}
        {activeSizes && activeSizes.length > 0 && activeSizes[0].size && (
          <ProductSizes
            activeSizes={activeSizes}
            setActiveOption={setActiveOption}
          />
        )}
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-between gap-4 mt-4">
        <ProductQty qty={qty} setQty={setQty} />

        <RectangleButton
          onClick={() => {
            activeOptionVariant
              ? handleAddToCart(activeOptionVariant)
              : toast({
                  variant: "destructive",
                  title: "Oops",
                  description: "Choose a variant",
                });
          }}
          className="!py-4"
          variant="primary"
          size="lg"
          icon="none"
        >
          ADD TO CART <ShoppingCart color="#ffffff" />
        </RectangleButton>

        <RectangleButton
          onClick={() => {
            activeOptionVariant
              ? handleBuyNow(activeOptionVariant)
              : toast({
                  variant: "destructive",
                  title: "Oops",
                  description: "Choose a variant",
                });
          }}
          size="sm"
          variant="primary-outline"
          icon="none"
          className="w-full"
        >
        
          <FormattedMessage id="product.buy-now" defaultMessage="Buy Now" />
        </RectangleButton>
      </div>

      <ProductShare item={itemForWishlist} />
      <ProductPayments />
    </div>
  );
}
