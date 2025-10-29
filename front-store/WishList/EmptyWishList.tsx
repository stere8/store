import { Heart } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { RectangleButton } from "@/components/custom/RectangleButton";

export default function EmptyWishList() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 w-fit justify-center m-auto py-20 items-center">
      <Heart className="font-bold text-primary-500" size={100} />
      <h3 className="text-xl lg:text-h3">Your Wishlist is empty</h3>
      <RectangleButton
        variant="primary-outline"
        size="lg"
        className="capitalize"
        onClick={() => router.push("/products")}
        icon="none"
      >
        shop now
      </RectangleButton>
    </div>
  );
}
