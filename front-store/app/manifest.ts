import type { MetadataRoute } from "next";
import {
  BRAND,
  BRAND_ASSETS,
  BRAND_IMAGE_DIMENSIONS,
} from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.fullName,
    short_name: BRAND.shortName,
    description: BRAND.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111827",
    icons: [
      {
        src: BRAND_ASSETS.appIcon,
        sizes: `${BRAND_IMAGE_DIMENSIONS.appIcon.width}x${BRAND_IMAGE_DIMENSIONS.appIcon.height}`,
        type: "image/png",
      },
    ],
  };
}
