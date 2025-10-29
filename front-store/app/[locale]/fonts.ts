import localFont from "next/font/local";

export const publicSans = localFont({
  src: [
    {
      path: "./fonts/PublicSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PublicSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/PublicSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/PublicSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],

  weight: "400 700",
});
