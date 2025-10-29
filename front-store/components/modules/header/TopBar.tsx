 "use client";
// import Container from "@/components/custom/Container";
// import { RectangleButton } from "@/components/custom/RectangleButton";
// import { Button } from "@/components/ui/button";
// import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
// import { cn } from "@/lib/utils";
// import { addConfig } from "@/store/configSlice";
// import { TypeConfigurationModel, TypeSlideItemModel } from "@/types/models";
// import axios from "axios";
// import { X } from "lucide-react";
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import useSWR, { Fetcher } from "swr";

export default function TopBar() {
  //const [showTopBar, setShowTopBar] = useState(true);
}
//   // Client-side data fetching with SWR
//   const fetcher: Fetcher<TypeSlideItemModel[], string> = (args) =>
//     fetch(args)
//       .then((res) => res.json())
//       .then((res) => res.data[0].slideItem.reverse());

//   const fetcher2 = (url: string) => axios.get(url).then((res) => res.data.data);

//   const { data } = useSWR<TypeSlideItemModel[]>(
//     process.env.NEXT_PUBLIC_API_URL +
//       "/api/public/slides?slug=hompage-top-banner",
//     fetcher
//   );

//   //Fecth site config
//   const refreshInterval =
//     process.env.NODE_ENV === "development" ? 1000 : 86400000; // 1 second in dev, 24 hours in prod
//   const { data: conf } = useSWR<TypeConfigurationModel>(
//     process.env.NEXT_PUBLIC_API_URL + "/api/public/configurations",
//     fetcher2,
//     {
//       refreshInterval,
//     }
//   );
//   if (conf) {
//     const dispatch = useDispatch();
//     dispatch(addConfig(conf));
//   }

//   const router = useLocalizedRouter();
//   return (
//     <div
//       onClick={() => router.push(`/products/${data && data[0].product.slug}`)}
//       className={cn(
//         "cursor-pointer hidden lg:block bg-gray-900 w-full h-[80px] relative",
//         !showTopBar && "lg:hidden"
//       )}
//       style={{
//         backgroundImage: `url(${data && data?.length > 0 && data[0].image})`,
//         height: "80",
//         width: "auto",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       <Container>
//         <div className="flex items-center justify-between h-full">
//           {!data && (
//             <>
//               <div className="inline-flex items-center gap-x-4">
//                 <div className="-rotate-[3deg] px-[10px] py-[6px] bg-warning-300">
//                   black
//                 </div>
//                 <span className="text-heading3 text-white ">Friday</span>
//               </div>
//               <div className="inline-flex gap-[8px] items-center">
//                 <span className="font-[500] text-white">Up to </span>
//                 <span className="text-display4 text-warning-500">59%</span>
//                 <span className="font-[600] text-white">OFF</span>
//               </div>
//               <div className="inline-flex">
//                 <RectangleButton
//                   icon="after"
//                   variant="warning"
//                   size="lg"
//                   className="text-black"
//                 >
//                   shop now
//                 </RectangleButton>
//               </div>
//             </>
//           )}
//           <Button
//             title="close"
//             onClick={() => setShowTopBar(!showTopBar)}
//             variant="default"
//             size="icon"
//             className={cn("absolute right-4  inset-y-4 bg-gray-800 text-white")}
//           >
//             <X />
//           </Button>
//         </div>
//       </Container>
//     </div>
//   );
// }
