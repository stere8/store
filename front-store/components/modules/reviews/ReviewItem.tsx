
import { getDate } from "@/lib/utils";
import { TypeReviewModel } from "@/types/models";
import Rating from "@mui/material/Rating";
import Image from "next/image";
import React from "react";
import { FormattedMessage } from "react-intl";

export default function ReviewItem({ item }: { item: TypeReviewModel }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Image
          width="40"
          height="40"
          className="mr-2 w-auto h-auto rounded-full"
          src={item?.user?.imageUrl}
          alt="image"
        />
        <div className="flex flex-col gap-1 items-center [&span]:text-2xl">
          <h6>{item.user?.fullName}</h6>
          <Rating
            size="medium"
            name="size-small"
            readOnly
            value={item.rating}
            precision={0.5}
            className="text-primary-500 text-[20px] inline-flex gap-0.5"
          />
        </div>
      </div>
      <p>{item.review}</p>
      <div className="flex items-center gap-4">
  <em className="text-gray-400">
    <FormattedMessage id="review.by" defaultMessage="Reviewed by" />{" "}
  </em>
  <strong>E-City</strong>
  <FormattedMessage id="review.posted-on" defaultMessage="Posted on" />{" "}
  <em className="text-gray-400">{getDate(item.createdAt)}</em>
</div>
    </div>
  );
}
