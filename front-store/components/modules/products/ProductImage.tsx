import {
  Image as TypeImage,
  TypeProductModel,
  TypeProductVariantModel,
} from "@/types/models";
import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ProductImage({
  activeOptionVariant,
  product,
}: {
  activeOptionVariant?: TypeProductVariantModel;
  product: TypeProductModel;
}) {
  const [activeImages, setActiveImages] = useState<TypeImage[] | undefined>(
    product.images
  );

  const [activeImage, setActiveImage] = useState<string>(product.images[0].url);

  const [activeSmallImages, setActiveSmallImages] = useState<TypeImage[]>(
    product.images
  );

  useEffect(() => {
    setActiveImages(
      activeOptionVariant &&
        activeOptionVariant.sizeImages &&
        activeOptionVariant.sizeImages?.length > 0
        ? activeOptionVariant.sizeImages
        : activeOptionVariant && activeOptionVariant.colorImages
    );

    setActiveSmallImages(
      activeImages && activeImages[0] ? activeImages : product.images
    );
    setActiveImage(
      activeImages && activeImages[0]
        ? activeImages[0].url
        : product.images[0].url
    );
  }, [activeOptionVariant, activeImages, activeSmallImages, product.images]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex-1 border border-gray-100">
        <Zoom>
          <Image
            priority
            src={activeImage}
            width={0}
            height={0}
            sizes="100vw"
            alt="product detail picture"
            className="object-contain h-[464px] w-full p-8"
          />
        </Zoom>
      </div>
      <div className="flex gap-2 justify-between">
        <Swiper
          breakpoints={{
            // when window width is >= 340
            360: {
              slidesPerView: 1,
              spaceBetween: 8,
            },
            // when window width is >= 768
            575: {
              slidesPerView: 2,
              spaceBetween: 8,
            },

            768: {
              slidesPerView: 3,
              spaceBetween: 8,
            },
            // when window width is >= 1024
            1024: {
              slidesPerView: 3,
              spaceBetween: 8,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 8,
            },
            1320: {
              slidesPerView: 4,
              spaceBetween: 8,
            },
          }}
          autoplay={{
            delay: 10500,
            disableOnInteraction: false,
          }}
          spaceBetween={8}
          slidesPerView={1}
          navigation={true}
          pagination={false}
          modules={[Autoplay, Navigation, Pagination]}
          className={cn("productSwiper")}
        >
          {activeSmallImages &&
            activeSmallImages.map((item, idx) => (
              <SwiperSlide
                onMouseEnter={() => setActiveImage(item.url)}
                onClick={() => setActiveImage(item.url)}
                key={idx}
                className={cn(
                  "h-full border border-gray-100 hover:border-primary-500 !flex !items-center !justify-center",
                  activeImage == item.url && "border-primary-500 border-2"
                )}
              >
                <Image
                  src={item.url}
                  alt="small image"
                  sizes="100vw"
                  width={0}
                  height={0}
                  className="h-[96px] w-auto  object-contain p-2 cursor-pointer"
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
}
