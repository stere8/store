"use client";
import React, { useState } from "react";
import { ShoppingCart, User2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ShoppingCartMenu from "./ShoppingCartMenu";
import WishListMenu from "./WishListMenu";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import { memoize } from "proxy-memoize";
// import wishlist from "@/store/WishListSlice"; // Not needed here

export default function IconsGroup({ className }: { className?: string }) {
  const router = useRouter();

  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const [openWishList, setOpenWishList] = useState(false); // ✅ New state for WishList

  const { cart, wishList } = useSelector(
    memoize((state: IRootState) => ({
      cart: state.cart,
      wishList: state.WishList, // Make sure your root state has WishList
    }))
  );

  const toggleCart = () => {
    setOpenShoppingCart(!openShoppingCart);
    if (openWishList) setOpenWishList(false); // ✅ close WishList if open
  };

  const toggleWishList = () => {
    setOpenWishList(!openWishList);
    if (openShoppingCart) setOpenShoppingCart(false); // ✅ close cart if open
  };

  return (
    <div className={className}>

      {/* Shopping Cart Button */}
      <Button variant="icon" onClick={toggleCart}>
        <ShoppingCart size={32} />
        <span className="rounded-full grid bg-white place-content-center text-gray-700 font-bold h-6 w-6 -top-1 right-1 absolute">
          {cart.cartItems?.length ?? 0}
        </span>
      </Button>

      {/* Wish List Button */} 
      <Button variant="icon" onClick={toggleWishList}>
        <Heart size={32} />
        <span className="rounded-full grid bg-white place-content-center text-gray-700 font-bold h-6 w-6 -top-1 right-1 absolute">
          {wishList?.items?.length ?? 0}
        </span>
      </Button>
      
      {/* User Account */}
      <Button variant="icon" onClick={() => router.push("/customer/dashboard")}>
        <User2 size={32} />
      </Button>

      {/* Dropdown Menus */}
      <ShoppingCartMenu
        openShoppingCart={openShoppingCart}
        setOpenShoppingCart={setOpenShoppingCart}
      />
      
      <WishListMenu
        openWishList={openWishList}
        setOpenWishList={setOpenWishList}
      />
      
    </div>
  );
}
