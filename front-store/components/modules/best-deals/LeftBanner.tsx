// import { Badge } from "@/components/custom/Badge";
// import CurrencyFormat from "@/components/custom/CurrencyFormat";
// import { RectangleButton } from "@/components/custom/RectangleButton";
// import { discountPrice, getRatingNote } from "@/lib/utils";
// import { ToastAction } from "@/components/ui/toast";
// import { toast } from "@/hooks/use-toast";
// import { IRootState } from "@/store";
// import { addToCart, updateToCart } from "@/store/cartSlice";
// import { CartItem } from "@/types";
// import { TypeProductModel, TypeSlideModel } from "@/types/models";
// import Link from "next/link";
// import { memoize } from "proxy-memoize";
// import { useDispatch, useSelector } from "react-redux";
// import { Rating } from "@mui/material";
// import { ShoppingCart } from "lucide-react";
// import Image from "next/image";
// import Loading from "@/components/custom/Loading";
// import { useState } from "react";
import { TypeSlideModel } from "@/types/models";
import { LocaleLink } from "@/components/custom/LocaleLink";
import React from "react";
import { useRouter } from "next/navigation";

export default function LeftBanner({
  campaigns,
}: {
  campaigns: TypeSlideModel[];
}) {
  // const { cart } = useSelector(memoize((state: IRootState) => ({ ...state })));
  // const dispatch = useDispatch();
  // const [loading, setLoading] = useState(false);
  const router = useRouter();

  // const handleAddToCart = (p: TypeProductModel) => {
  //   setLoading(true);
  //   const _id: string = `${p.productVariants[0]._id}`; // get first variant
  //   const exist: CartItem | undefined = cart.cartItems.find(
  //     (p: CartItem) => p.variant._id === _id
  //   );
  //   if (exist) {
  //     //update
  //     const newCart = cart.cartItems.map((p: CartItem) => {
  //       if (p === exist) {
  //         return { ...p, qty: 1 };
  //       }
  //       return p;
  //     });
  //     dispatch(updateToCart(newCart));
  //     toast({
  //       variant: "default",
  //       title: "Well done ✔️",
  //       description: "Product added to cart",
  //       action: (
  //         <ToastAction altText={`Go to cart `}>
  //           <Link href={`/cart`}>Go to cart</Link>
  //         </ToastAction>
  //       ),
  //     });
  //   } else {
  //     dispatch(
  //       addToCart({
  //         store: p.store,
  //         productName: p.name,
  //         productImage: p.images[0].url,
  //         variant: p.productVariants[0],
  //         qty: 1,
  //       })
  //     );
  //     toast({
  //       variant: "default",
  //       title: "Well done ✔️",
  //       description: "Product added to cart",
  //       action: (
  //         <ToastAction altText={`Go to cart `}>
  //           <Link href={`/cart`}>Go to cart</Link>
  //         </ToastAction>
  //       ),
  //     });
  //   }

  //   setLoading(false);
  // };

  // console.log(campaigns);
  // const campaign =
  //   campaigns.length > 0 && campaigns[0].slideItem.length > 0
  //     ? campaigns[0].slideItem[0].product
  //     : {};

  return (
    <>
      {/* {loading && <Loading loading={true} />} */}
      {campaigns[0] && campaigns[0].slideItem.length > 0 ? (
        // <div className="w-full border border-gray-200 lg:max-w-[328px] gap-4 px-4 py-4 col-span-1 md:h-fit flex flex-wrap items-center sm:flex-nowrap lg:w-fit lg:flex-wrap lg:h-max xl:h-auto">
        //   <div className="relative">
        //     <Image
        //       src={campaigns[0].slideItem[0].product.images[0].url}
        //       width={480}
        //       height={268}
        //       alt=""
        //     />
        //     <div className="flex gap-2 flex-col absolute top-4 left-0">
        //       {campaigns[0].slideItem[0].product.discount > 0 && (
        //         <Badge variant="warning" className="text-black">
        //           {campaigns[0].slideItem[0].product.discount}% OFF
        //         </Badge>
        //       )}
        //       {campaigns[0].slideItem[0].product.collections.map(
        //         (item) =>
        //           item.slug == "hot" && (
        //             <Badge
        //               key={item._id}
        //               variant={"danger"}
        //               className="text-white"
        //             >
        //               {item.name}
        //             </Badge>
        //           )
        //       )}
        //     </div>
        //   </div>
        //   <div className="flex flex-col gap-[12px]">
        //     <div className="flex flex-col">
        //       <Rating
        //         readOnly
        //         name="hover-feedback"
        //         value={getRatingNote(campaigns[0].slideItem[0].product.reviews)}
        //         precision={0.5}
        //       />
        //       <h1 className="text-body-md-400 text-black ">
        //         {campaigns[0].slideItem[0].product.name}
        //       </h1>
        //     </div>
        //     <div className="inline-flex items-center gap-[4px]">
        //       {campaigns[0].slideItem[0].product.discount > 0 && (
        //         <>
        //           <CurrencyFormat
        //             value={discountPrice(
        //               campaigns[0].slideItem[0].product.price,
        //               campaigns[0].slideItem[0].product.discount
        //             )}
        //             className="!text-secondary-500 text-body-l-600  text-left"
        //           />

        //           <CurrencyFormat
        //             value={campaigns[0].slideItem[0].product.price}
        //             className="w-20 !text-gray-300 text-body-l-400 line-through"
        //           />
        //         </>
        //       )}
        //       {campaigns[0].slideItem[0].product.discount === 0 && (
        //         <>
        //           <CurrencyFormat
        //             value={campaigns[0].slideItem[0].product.price}
        //             className="!text-secondary-500 text-body-l-600  text-left"
        //           />
        //         </>
        //       )}
        //     </div>
        //     <div className="flex justify-center">
        //       <p className="text-body-sm-400 text-gray-600 text-balance">
        //         {campaigns[0].slideItem[0].product.description}
        //       </p>
        //     </div>

        //     <div className="flex gap-2">
        //       {/* <Badge className="bg-primary-100 p-3 gap-3">
        //       <Heart size={24} className="text-black" />
        //     </Badge> */}
        //       <RectangleButton
        //         onClick={() =>
        //           handleAddToCart(campaigns[0].slideItem[0].product)
        //         }
        //         icon="none"
        //         variant="primary"
        //         className="px-5 w-full"
        //       >
        //         <ShoppingCart size={20} className="text-white" />
        //         <span className="text-heading5 text-white">ADD TO CART</span>
        //       </RectangleButton>
        //       {/* <Badge className="bg-primary-100 p-3 gap-3">
        //       <Eye size={24} className="text-black" />
        //     </Badge> */}
        //     </div>
        //   </div>
        // </div>
        <div
          onClick={() =>
            router.push(
              `/products/${campaigns && campaigns[0].slideItem[0].product.slug}`
            )
          }
          className="cursor-pointer w-full border border-gray-200 lg:max-w-[328px] gap-4 px-4 py-4 col-span-1 md:h-fit flex flex-wrap items-center sm:flex-nowrap lg:w-fit lg:flex-wrap lg:h-max xl:h-auto"
          style={{
            backgroundImage: `url(${campaigns[0].slideItem[0].image})`,
            backgroundSize: "contain",
            backgroundPosition: "top",
            width: "328px",
            height: "592px",
          }}
        ></div>
      ) : (
        <div>
          create campaign for
          <strong className="text-red-500 mx-4"> homepage-bestdeals </strong>
          slide from seller dashboard
          <LocaleLink
            target="_blank"
            href={process.env.NEXT_PUBLIC_API_URL + "/stores"}
            className="mx-4 text-red-500 "
          >
            Here
          </LocaleLink>
        </div>
      )}
    </>
  );
}
