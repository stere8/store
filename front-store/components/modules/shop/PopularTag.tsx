import { Badge } from "@/components/custom/Badge";
import { TypeTagModel } from "@/types/models";
import React from "react";

export default function PopularTag({
  item,
  setTag,
}: {
  item: TypeTagModel;
  setTag: (v: string) => void;
}) {
  return (
    <Badge
      variant="primary-outline"
      className="text-black"
      onClick={() => setTag(item._id)}
    >
      {item.name}
    </Badge>
  );
}
