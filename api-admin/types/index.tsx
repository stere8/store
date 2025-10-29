export type Order = {
  _id: string;
  total: number;
  createdAt: string;
  store: { _id: string };
};

export type People = {
  id: number;
  designation: string;
  image: string;
  name: string;
};

export type TypeSubscriptionPlan = {
  id: number;
  type: string;
  description: string;
  title: string;
  price: number;
  period: string;

  roles: {
    title: string;
    active: boolean;
  }[];
};

// Type definitions
export type ColorPalette = {
  "50": string;
  "100": string;
  "200": string;
  "300": string;
  "400": string;
  "500": string;
  "600": string;
  "700": string;
  "800": string;
  "900": string;
};

export type ColorScheme = {
  _id?: string;
  primary: ColorPalette;
  secondary: ColorPalette;
  isActive: boolean;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// Default color values
export const defaultColors: ColorScheme = {
  primary: {
    "50": "#FFF3EB",
    "100": "#FFE7D6",
    "200": "#FFCEAD",
    "300": "#FFB685",
    "400": "#FF9D5C",
    "500": "#FA8232",
    "600": "#DE732D",
    "700": "#99501F",
    "800": "#663514",
    "900": "#331B0A",
  },
  secondary: {
    "50": "#EAF6FE",
    "100": "#D5EDFD",
    "200": "#ABDBFA",
    "300": "#81C9F8",
    "400": "#57B7F5",
    "500": "#2DA5F3",
    "600": "#2484C2",
    "700": "#1B6392",
    "800": "#124261",
    "900": "#092131",
  },
  isActive: true,
  name: "Default Theme",
};
