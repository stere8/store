export const BRAND = {
  fullName: "E-Mall Rwanda",
  shortName: "E-Mall",
  description:
    "E-Mall Rwanda is a multi-vendor marketplace for discovering and reserving products across Rwanda.",
} as const;

export const BRAND_ASSETS = {
  primaryLogo: "/assets/branding/e-mall-rwanda-primary.png",
  symbol: "/assets/branding/e-mall-rwanda-symbol.png",
  appIcon: "/assets/branding/e-mall-rwanda-app-icon.png",
} as const;

export const BRAND_IMAGE_DIMENSIONS = {
  primaryLogo: {
    width: 651,
    height: 353,
  },
  symbol: {
    width: 275,
    height: 364,
  },
  appIcon: {
    width: 467,
    height: 478,
  },
} as const;

export const DEFAULT_COPYRIGHT = `Copyright © ${BRAND.fullName}. All rights reserved.`;
