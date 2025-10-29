import {
  TypeProductModel,
  TypeProductVariantModel,
  TypeShippingModel,
} from "./models";


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

export type TypeproductCart = {
  id: string;
  name: string;
  images: Image[];
  price: number;
};

export type Image = {
  url: string;
};

export type TypeLocales = "rw" | "fr" | "en" | "sw"| undefined;

export type CartItem = {
  store: string;
  variant: TypeProductVariantModel;
  productName: string;
  productImage: string;
  qty: number;
};

export type Cart = {
  cartItems: CartItem[];
  subTotal: number;
  discount: number;
  shipping: TypeShippingModel;
  products: TypeProductModel[];
};
export type WishListItem = {
 store: string;
  variant: TypeProductVariantModel;
  productName: string;
  productImage: string;
  qty: number;
};
export type WishList = {
  WishListItems: WishListItem[];
  subTotal: number;
  discount: number;
  products: TypeProductModel[];
};
