//Models types
export type statusAddress = "draft" | "archive";
export type statusStoreEnum = "online" | "pending" | "suspended";
export type Image = {
  url: string;
};

export type TypeAddressModel = {
  _id?: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  country?: string;
  zipCode: string;
  email: string;
  user_id: string;
  status: statusAddress;
};

export type TypeConfigurationModel = {
  name: string;
  description: string;
  copyright: string;
  phone: string;
  logo: string;
  address: string;
  email: string;
  youtube: string;
  tiktok: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

export type TypeStoreModel = {
  _id: string;
  user_id: string; //clerk user_id
  name: string;
  description: string;
  logo: string;
  products: TypeProductModel[];
  orders: TypeOrderModel[];
  slides: TypeSlideModel[];
  subscription: TypeSubscriptionModel;
  status: statusStoreEnum;
  createdAt: Date;
};

export type TypeTrackOrderModel = {
  _id: string;
  orderitem: TypeOrderItemModel;
  trackactivity: TypeTrackActivityModel[];
  status: "opened" | "packaging" | "onroad" | "delivered" | "failed";
  createdAt: Date;
};

export type TypeImageModel = {
  url: string;
  store: TypeStoreModel;
  user_id: string;
};

export type TypeTrackActivityModel = {
  _id: string;
  trackorder: TypeTrackOrderModel;
  activity: string;
  user_id: string;
};

export type TypeProductModel = {
  _id: string;
  featured: boolean;
  name: string;
  slug: string;
  description: string;
  additionnal: string;
  specification: string;
  store: TypeStoreModel[];
  category: TypeCategoryModel;
  subCategories: TypeSubCategoryModel[];
  brand: TypeBrandModel;
  details: TypeDetailModel[];
  questions: TypeQuestionModel[];
  reviews: TypeReviewModel[];
  productVariants: TypeProductVariantModel[];
  images: Image[];
  price: number;
  discount: number;
  seoSlug?: string;
  seoDescription?: string;
  seoTitle?: string;
  status: "draft" | "publish" | "archive";
  inventory: "instock" | "outstock";
  weight: number;
  sku: string;
  unit: string;
  user_id: string;
  collections: TypeCollectionModel[];
  tags: TypeTagModel[];
};

export type TypeTagModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  createdAt: Date;
};

export type TypeCollectionModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  createdAt: Date;
};

export type TypeProductVariantModel = {
  _id: string;
  productId: TypeProductModel;
  name: string;
  color: TypeColorModel;
  colorImages: Image[];
  size?: TypeSizeModel;
  sizeImages?: Image[];
  weight: number;
  inventory: "instock" | "outstock";
  sku: string;
  price: number;
  discount: number;
  colorValue?: string;
  status: "draft" | "publish" | "archive";
};

export type TypeCategoryModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  createdAt: Date;
  subCategory: TypeSubCategoryModel[];
};

export type TypeColorModel = {
  _id?: string;
  name: string;
  description: string;
  slug: string;
  images: Image[];
  user_id: string | null | undefined;
  value?: string;
  store?: TypeStoreModel;
  status: "draft" | "publish" | "archive";
  createdAt?: Date;
};

export type TypeSizeModel = {
  _id?: string;
  name: string;
  description: string;
  slug: string;
  images: Image[];
  user_id: string | null | undefined;
  value?: string;
  store?: TypeStoreModel;
  status: "draft" | "publish" | "archive";
  createdAt?: Date;
};

export type TypeSubCategoryModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  category: TypeCategoryModel;
};

export type TypeBrandModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  createdAt: Date;
};

export type TypeShippingModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  delay: number;
  fixed_amount: number;
  fees: number;
  region: string[];
  unit_price_weight: number;
  price_range_start: number;
  price_range_end: number;
  store: TypeStoreModel;
  createdAt: Date;
};

// export type TypeRegionModels = {
//   image: string;
//   name: string;
// };

export type TypePmethodModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  createdAt: Date;
};

export type TypeSlideItemModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  title?: string;
  subtitle?: string;
  btn?: string;
  textColor?: string;
  status: "draft" | "publish" | "approve" | "reject" | "archive";
  slide: TypeSlideModel;
  product: TypeProductModel;
  store: TypeStoreModel;
  createdAt: Date;
};

export type TypeSlideModel = {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  slideItem: TypeSlideItemModel[];
  createdAt: Date;
};

export type TypePageModel = {
  _id: string;
  icon: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  user_id: string;
  status: "draft" | "publish" | "archive";
  createdAt: Date;
};

export type TypeDetailModel = {
  _id: string;
};
export type TypeReviewModel = {
  _id: string;
  user: {
    imageUrl: string;
    fullName: string;
  };
  review: string;
  rating: number;
  createdAt: Date;
};

export type TypeSubProductModel = {
  _id: string;
  sku: string;
  style: TypeStyleModel;
  options: TypeOptionsModel[];
  subProduct: TypeSubProductModel;
};

export type TypeQuestionModel = { _id: string };
export type TypeOrderModel = {
  _id: string;
  subtotal: number;
  total: number;
  shipping: TypeShippingModel;
  pmethod: TypePmethodModel;
  delivered: boolean;
  earning: number;
  status:
    | "pending"
    | "processing"
    | "onhold"
    | "completed"
    | "refunded"
    | "failed";
  customer: string;
  orderitems: TypeOrderItemModel[];
  createdAt: Date;
};
export type TypeOrderItemModel = {
  _id: string;
  status:
    | "pending"
    | "processing"
    | "onhold"
    | "completed"
    | "refunded"
    | "failed";
  subtotal: number;
  discount: number;
  total: number;
  delivered: boolean;
  earning: number;
  cartItem: TypeCartItemModel;
  store: TypeStoreModel;
  trackorder: TypeTrackOrderModel;
  address: TypeAddressModel;
  shipping: TypeShippingModel;
  shippingAmount: number;
  createdAt?: Date;
};

export type TypeOptionsModel = { _id: string };
export type TypeStyleModel = {
  _id: string;
  color: string;
  image: string;
};

export type TypeSubscriptionModel = {
  store: TypeStoreModel;
  payments: string[];
  startDate: Date;
  endDate?: Date | undefined;
  status: "active" | "ended" | "cancelled";
  type: "basic" | "pro" | "enterprise";
  user_id: string;
};

export type TypeDiscountModel = {
  _id: string;
  code: string;
  startDate: Date;
  endDate: Date;
  validity: "once";
  discount: number;
  status: "available" | "expired";
};

export type TypePaymentModel = {
  _id: string;
  subscription: TypeSubscriptionModel;
  checkout_id: string;
  checkout_status: string;
  payment_intent: TypePaymentIntent;
  payment_status: string;
  amount_subtotal: number;
  amount_total: number;
  amount_discount: number;
  amount_tax: number;
  amount_shipping: number;
};

export type TypeNotificationModel = {
  name: string;
  description: string;
  slug: string;
  status: "unread" | "read";
  user_id?: string;
  store?: TypeStoreModel;
  createdAt: Date;
};

export type TypePaymentIntent = {
  id: {
    type: string;
  };
  amount: {
    type: string;
  };
  amount_received: {
    type: string;
  };
  client_secret: {
    type: string;
  };
  created: {
    type: string;
  };
  currency: {
    type: string;
  };
  shipping: {
    address: {
      city: {
        type: string;
      };
      country: { type: string };
      line1: { type: string };
      line2: { type: string };
      postal_code: { type: string };
      state: { type: string };
    };
  };
};

export type TypeCartItemModel = {
  _id: string;
  cart: TypeCartModel;
  shipping: TypeShippingModel;
  variant: TypeProductVariantModel;
  productName: string;
  productImage: string;
  qty: number;
  store: TypeStoreModel;
};

export type TypeCartModel = {
  _id: string;
  cartItems: TypeCartItemModel[];
  subTotal: number;
  user_id: string;
  status: statusCartEnum;
};
export type statusCartEnum = "draft" | "abandoned" | "completed";

export type TypeWishListItemModel = {
  _id: string;
  user_id?: string | null | undefined;
  product: TypeProductModel;
  store: TypeStoreModel;
  productName: string;
  productImage: string;
  variant: TypeProductVariantModel;
  qty: number;
  wishlist: TypeWishListModel;
};
export type TypeWishListModel = {
  _id: string;
  WishListItems: TypeWishListItemModel[];
  subTotal: number;
  user_id: string;
  status: statusWishListEnum;
};
export type statusWishListEnum = "draft" | "abandoned" | "completed";
