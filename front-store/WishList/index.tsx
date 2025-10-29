'use client';
import React from "react";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import { memoize } from "proxy-memoize";
import Container from "@/components/custom/Container";
import EmptyWishList from "./EmptyWishList";
import WishListview from "./WishListView";


export default function WishList() {
  const { WishList } = useSelector(memoize((state: IRootState) => ({ ...state })));
  return (
    
    <section className="data-cy=['wishlist-section']mb-4">
      <Container>
         {WishList.items.length === 0 ? <EmptyWishList /> : <WishListview />}
      </Container>
    </section>
  );
}
