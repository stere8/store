import React, { useEffect, useMemo, useState } from "react";
import { TypeProductModel, TypeProductVariantModel } from "@/types/models";
import ProductImage from "./ProductImage";
import ProductDetails from "./ProductDetails";

export default function ProductDesription({
  product,
}: {
  product: TypeProductModel;
}) {
  const variants = useMemo(() => product.productVariants || [], [product]);
  const [activeOption, setActiveOption] = useState<string>();
  const [activeOptionVariant, setActiveOptionVariant] =
    useState<TypeProductVariantModel>();
  const [activeSizes, setActiveSizes] = useState<
    TypeProductVariantModel[] | undefined
  >();

  const colors = useMemo(() => {
    const unique = new Map<string, TypeProductVariantModel>();

    variants.forEach((variant) => {
      const colorId = variant.color?._id || variant._id;
      if (!unique.has(colorId)) {
        unique.set(colorId, variant);
      }
    });

    return Array.from(unique.values());
  }, [variants]);

  useEffect(() => {
    if (!activeOption && variants[0]?._id) {
      setActiveOption(variants[0]._id);
    }
  }, [activeOption, variants]);

  useEffect(() => {
    const nextVariant =
      variants.find((variant) => variant._id === activeOption) || variants[0];

    setActiveOptionVariant(nextVariant);

    if (!nextVariant?.color?._id) {
      setActiveSizes(undefined);
      return;
    }

    const matchingSizes = variants.filter(
      (variant) => variant.color?._id === nextVariant.color?._id
    );

    setActiveSizes(matchingSizes.length > 1 ? matchingSizes : undefined);
  }, [activeOption, variants]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[56px]">
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
