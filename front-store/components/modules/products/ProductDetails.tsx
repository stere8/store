"use client";

import { TypeProductModel, TypeProductVariantModel } from "@/types/models";
import { useMemo, useState } from "react";
import { cn, discountPrice, getRatingNote } from "@/lib/utils";
import { Rating } from "@mui/material";
import CurrencyFormat from "@/components/custom/CurrencyFormat";
import { Badge } from "@/components/custom/Badge";
import ProductColors from "./ProductColors";
import { Separator } from "@/components/ui/separator";
import ProductSizes from "./ProductSizes";
import ProductQty from "./ProductQty";
import { ShoppingCart, MessageCircleQuestion } from "lucide-react";
import { RectangleButton } from "@/components/custom/RectangleButton";
import ProductShare from "./ProductShare";
import ProductPayments from "./ProductPayments";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import { CartItem, WishListItem } from "@/types";
import { addToCart, updateToCart } from "@/store/cartSlice";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import Loading from "@/components/custom/Loading";
import { memoize } from "proxy-memoize";
import { FormattedMessage } from "react-intl";
import React from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState<number>(1);

  const selectedVariant =
    activeOptionVariant ?? product.productVariants?.[0] ?? undefined;
  const store = product.store?.[0];
  const reviews = product.reviews || [];
  const rating = getRatingNote(reviews);
  const inventory = selectedVariant?.inventory ?? product.inventory;
  const sku = selectedVariant?.sku ?? product.sku;

  const itemForWishlist: WishListItem = useMemo(
    () => ({
      store: store || product.storeId || "",
      productName: product.name,
      productImage: product.images?.[0]?.url || "/assets/products/image.png",
      variant:
        selectedVariant ||
        ({
          _id: product._id,
          name: "Default option",
          price: product.price,
          discount: product.discount,
          colorImages: product.images,
          sizeImages: [],
        } as any),
      qty,
    }),
    [product, qty, selectedVariant, store]
  );

  const handleAddToCart = (variant: TypeProductVariantModel | undefined) => {
    if (!variant) {
      toast({
        variant: "destructive",
        title: "Oops",
        description: "This product is not available yet.",
      });
      return;
    }

    setLoading(true);

    const existingItem: CartItem | undefined = cart.cartItems.find(
      (entry: CartItem) => entry.variant._id === variant._id
    );

    if (existingItem) {
      const updatedCart = cart.cartItems.map((entry: CartItem) => {
        if (entry.variant._id === existingItem.variant._id) {
          return { ...entry, qty };
        }
        return entry;
      });

      dispatch(updateToCart(updatedCart));
    } else {
      dispatch(
        addToCart({
          store: store || { _id: product.storeId, name: "Storefront Vendor" },
          productName: product.name,
          productImage:
            product.images?.[0]?.url || "/assets/products/image.png",
          variant,
          qty,
        })
      );
    }

    toast({
      variant: "default",
      title: "Added to cart",
      description: "You can continue shopping or open the cart.",
      action: (
        <ToastAction altText="Go to cart">
          <Link href={`/cart`}>Go to cart</Link>
        </ToastAction>
      ),
    });

    setLoading(false);
  };

  const handleBuyNow = () => {
    handleAddToCart(selectedVariant);
    router.push("/cart");
  };

  const handleMessageSeller = () => {
    toast({
      variant: "default",
      title: "Seller messaging unavailable",
      description:
        "The current .NET API does not expose storefront chat yet.",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {loading && <Loading loading={true} />}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex flex-wrap gap-2">
            <Rating
              readOnly
              name="hover-feedback"
              value={rating}
              precision={0.5}
              className="text-primary-500 text-[20px] inline-flex gap-0.5"
            />
            <div className="flex gap-2 items-center">
              <span className="text-body-sm-600 text-black">
                {rating} Star Rating
              </span>
              <span className="text-gray-600 text-body-sm-400">
                ({reviews.length} User feedback)
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
                {sku || "Not set"}
              </strong>
            </li>
            <li>
              <span className="text-body-sm-400 text-gray-600 mr-2">
                Brand:
              </span>
              <strong className="text-body-sm-600 text-black">
                {product.brand?.name || "General"}
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
                  inventory === "instock" && "text-success-500"
                )}
              >
                {inventory}
              </strong>
            </li>
            <li>
              <span className="text-body-sm-400 text-gray-600 mr-2">
                Category:
              </span>
              <strong className="text-body-sm-600 text-black">
                {product.category?.name || "Uncategorized"}
              </strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex">
        <div className="grid grid-cols-2">
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

          {product.discount > 0 && (
            <Badge variant="warning" className="ms-auto">
              {product.discount}% OFF
            </Badge>
          )}
        </div>
      </div>

      <Separator />
      <div className="flex flex-wrap justify-between gap-4">
        {colors.length > 0 && (
          <ProductColors
            setActiveOption={setActiveOption}
            variants={colors}
            activeOptionVariant={selectedVariant}
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
          onClick={handleMessageSeller}
          size="sm"
          variant="primary-outline"
          icon="none"
          className="w-full flex items-center justify-center gap-2"
        >
          <MessageCircleQuestion className="w-5 h-5" />
          Seller
        </RectangleButton>

        <RectangleButton
          onClick={() => handleAddToCart(selectedVariant)}
          className="!py-4"
          variant="primary"
          size="lg"
          icon="none"
        >
          ADD TO CART <ShoppingCart color="#ffffff" />
        </RectangleButton>

        <RectangleButton
          onClick={handleBuyNow}
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
