export type CartFormData = {
  _id?: string;
  cartItems: CartItemForm[];
  shipping?: string;
  subTotal: number;
  user_id: string;
};

export type WishListFormData = {
  _id?: string;
  WishListItems: WishListItemForm[];
  subTotal: number;
  user_id: string;
  shipping?: string;
};
export type DiscountFormData = {
  discount: string;
};

export type CartItemForm = {
  _id?: string;
  cart?: string;
  shipping?: string;
  shippingAmount?: number;
  store: string;
  variant: string;
  productName: string;
  productImage: string;
  qty: number;
};
export type WishListItemForm = {
  _id?: string;
  wishlist?: string;
  shipping?: string;
  shippingAmount?: number;
  store: string;
  variant: string;
  productName: string;
  productImage: string;
  qty: number;
};

export type AddressFormData = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  country?: string;
  zipCode: string;
  email: string;
  user_id?: string | null | undefined;
};

export type StoreFormData = {
  _id?: string;
  name?: string;
  description?: string;
  status?: "online" | "pending" | "suspended";
  user_id?: string | null | undefined;
};
export type CheckoutFormData = {
  user_id: string;
  amount: number;
};

export type ImageFormData = {
  user_id: string;
  store: string;
  url: string;
};

export type StoreTrackOrderData = {
  _id: string;
  user_id?: string | null | undefined;
};

export type CategoryFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
  createdAt?: string;
  subCategory?: string[];
};

export type SubcategoryFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
};

export type SlideFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
  createdAt?: string;
  subCategory?: string[];
};

export type SlideitemFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  slide: string;
  status: "draft" | "publish" | "archive";
  store?: string;
  user_id?: string | null | undefined;
};

export type TagFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
  createdAt?: string;
};

export type BrandFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
  createdAt?: string;
};

export type ShippingFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
  delay: number;
  fixed_amount: number;
  unit_price_weight: number;
  price_range_start: number;
  price_range_end: number;
  fees: number;
  region: string[];
  createdAt?: string;
};

// export type TypeFormRegion = {
//   image: string;
//   name: string;
// };

export type PmethodFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
  createdAt?: string;
};

export type PageFormData = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "draft" | "publish" | "archive";
  user_id?: string | null | undefined;
  createdAt?: string;
};

export type storeAdminFormData = {
  status: "online" | "pending" | "suspended";
};

export type ImageUrl = {
  url: string;
};

export type NotificationFormData = {
  name: string;
  description: string;
  slug: string;
  store?: string;
  user_id?: string;
  status: "read" | "unread";
};

export type ProductFormData = {
  name: string;
  description: string;
  additionnal: string;
  specification: string;
  slug: string;
  category?: string;
  // subCategories: string[];
  brand?: string;
  images: Image[];
  status: "draft" | "publish" | "archive";
  price: number;
  discount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoSlug?: string;
  unit: string;
  sku: string;
  weight: number;
  user_id?: string | null;
  inventory: "instock" | "outstock";
};

export type Image = {
  url: string;
};

export type ColorFormData = {
  name: string;
  description: string;
  slug: string;
  images: Image[];
  user_id: string | null | undefined;
  value: string | null;
  store: string;
  status: "draft" | "publish" | "archive";
};

export type SubscriptionFormData = {
  store: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "ended" | "cancelled";
  type: "basic" | "pro" | "enterprise";
  user_id?: string | null | undefined;
};

export type SizeFormData = {
  name: string;
  description: string;
  slug: string;
  images: Image[];
  user_id: string | null | undefined;
  value: string;
  store: string;
  status: "draft" | "publish" | "archive";
};

export type ProductVariationFormData = {
  name: string;
  color: string;
  colorImages: ImageUrl[];
  size: string;
  sizeImages: ImageUrl[];
  weight: number;
  inventory: "instock" | "outstock";
  sku: string;
  price: number;
  discount: number;
  status: "publish" | "draft" | "archive";
  product: string;
};
export type TypeProductModel = {
  _id: string;
  name: string;
  description: string;
  additionnal: string;
  specification: string;
  slug: string;
  category?: string;
  subCategories: string[];
  brand?: string;
  images: Image[];
  status: "draft" | "publish" | "archive";
  price: number;
  discount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoSlug?: string;
  unit: string;
  sku: string;
  weight: number;
  user_id?: string | null;
  inventory: "instock" | "outstock";
  store: string;
  createdAt?: string;
  updatedAt?: string;
  variations?: TypeProductVariantModel[];
};
export type TypeProductVariantModel = {
  _id: string;
  name: string;
  color: string;
  colorImages: ImageUrl[];
  size: string;
  sizeImages: ImageUrl[];
  weight: number;
  inventory: "instock" | "outstock";
  sku: string;
  price: number;
  discount: number;
  status: "publish" | "draft" | "archive";
  product: string;
};