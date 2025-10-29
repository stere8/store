import React, { useState } from "react";
import Reviews from "./Reviews";
import { TypeProductModel, TypeReviewModel } from "@/types/models";
import AddReview from "./AddReview";

export default function Review({ product }: { product: TypeProductModel }) {
  const [reviews, setReviews] = useState<TypeReviewModel[]>(product.reviews);
  return (
    <div className="flex flex-col gap-16">
      <AddReview product={product} reviews={reviews} setReviews={setReviews} />
      <Reviews reviews={reviews} />
    </div>
  );
}
