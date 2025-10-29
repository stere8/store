import usePagination from "@/hooks/usePagination";
import { getRatingNote } from "@/lib/utils";
import { Pagination, Rating } from "@mui/material";
import React, { useState } from "react";
import ReviewItem from "./ReviewItem";
import { TypeReviewModel } from "@/types/models";
import { FormattedMessage } from "react-intl";

export default function Reviews({ reviews }: { reviews: TypeReviewModel[] }) {
  const [page, setPage] = useState(1);
  const PER_PAGE = 3;
  const count = Math.ceil(reviews.length / PER_PAGE);
  const _DATA = usePagination(reviews, PER_PAGE);

  const handleChange = (e: React.ChangeEvent<unknown>, p: number) => {
    setPage(p);
    _DATA.jump(p);
  };

 return (
  <div className="flex flex-col gap-4">
    <h6>
      <FormattedMessage id="reviews.average-rate" defaultMessage="Average rate" />
    </h6>

    <div className="flex gap-10 items-center">
      <Rating
        readOnly
        value={reviews ? getRatingNote(reviews) : getRatingNote(reviews)}
        precision={0.5}
      />
      <h5>
        ({reviews ? getRatingNote(reviews) : getRatingNote(reviews)})
      </h5>
      <span>
        <FormattedMessage
          id="reviews.count"
          defaultMessage="{
            count, 
            plural, 
            =0 {No reviews yet}
            one {1 review available}
            other {# reviews available}
          }"
          values={{ count: reviews.length }}
        />
      </span>
    </div>

    <hr />

    <div className="flex flex-col gap-8 my-10">
      {_DATA
        .currentData()
        .toReversed()
        .map((i: TypeReviewModel, idx: number) => (
          <ReviewItem key={idx} item={i} />
        ))}
    </div>

    <div>
      <Pagination
        count={count}
        page={page}
        color="primary"
        variant="outlined"
        shape="rounded"
        onChange={handleChange}
      />
    </div>
  </div>
);
}