import React, { useEffect, useState } from "react";
import { TypeProductModel, TypeProductVariantModel } from "@/types/models";
import ProductImage from "./ProductImage";
import ProductDetails from "./ProductDetails";

export default function ProductDesription({
  product,
}: {
  product: TypeProductModel;
}) {
  const [activeOption, setActiveOption] = useState<string>();
  const [activeOptionVariant, setActiveOptionVariant] =
    useState<TypeProductVariantModel>();
  const [activeSizes, setActiveSizes] = useState<
    TypeProductVariantModel[] | undefined
  >();
  const [colors, setColors] = useState<TypeProductVariantModel[]>([]);
  useEffect(() => {
    setActiveOptionVariant(
      product.productVariants.find((p) => p._id === activeOption)
    );
    setActiveSizes(
      product.productVariants.filter(
        (p) => activeOptionVariant?.color._id == p.color._id
      )
    );
  }, [activeOption, activeOptionVariant, product.productVariants]);

  product.productVariants.map((p: TypeProductVariantModel) => {
    return colors.find(
      (c: TypeProductVariantModel) => c.color._id === p.color._id
    )
      ? ""
      : setColors([...colors, p]);
  });

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-[56px]`}>
      <ProductImage
        product={product}
        activeOptionVariant={activeOptionVariant}
      />

      <ProductDetails
        product={product}
        activeSizes={activeSizes}
        setActiveOption={setActiveOption}
        activeOptionVariant={activeOptionVariant}
        colors={colors}
      />
    </div>
  );
}
