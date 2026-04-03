import { Cart, Category, Product } from "@/types";

/* ------------------ API TYPES ------------------ */

type ApiCategory = {
  id: string;
  name: string;
  description?: string;
};

type ApiProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stockQuantity: number;
};

type ApiCartItem = {
  id: string;
  productId: string;
  quantity: number;
  product?: ApiProduct;
};

type ApiCart = {
  id: string;
  customerId: string;
  items: ApiCartItem[];
};

/* ------------------ CONSTANTS ------------------ */

const placeholderImage = "/assets/images/placeholder.png";

export const EMPTY_CATEGORY: Category = {
  _id: "",
  name: "",
  slug: "",
  description: "",
  createdAt: new Date(),
} as any;

export const EMPTY_PRODUCT: Product = {
  _id: "",
  name: "",
  slug: "",
  description: "",
  images: [],
  price: 0,
  category: EMPTY_CATEGORY,
} as any;

export const EMPTY_CART: Cart = {
  _id: "",
  cartItems: [],
  total: 0,
  subTotal: 0,
  user_id: "",
} as any;

/* ------------------ HELPERS ------------------ */

const toSlug = (value: string) =>
  value.toLowerCase().replace(/\s+/g, "-");

/* ------------------ CATEGORY ------------------ */

export const toFrontCategory = (item: ApiCategory): Category => ({
  ...EMPTY_CATEGORY,
  _id: item.id,
  name: item.name,
  slug: toSlug(item.name),
  description: item.description ?? "",
  createdAt: new Date(),
});

/* ------------------ PRODUCT ------------------ */

export const toFrontProduct = (item: ApiProduct): Product => {
  const slug = toSlug(item.name);
  const imageUrl = item.imageUrl || placeholderImage;

  return {
    ...EMPTY_PRODUCT,
    _id: item.id,
    name: item.name,
    slug,
    description: item.description || item.name,
    price: item.price,
    images: [{ url: imageUrl }],
    category: item.category
      ? {
          ...EMPTY_CATEGORY,
          _id: toSlug(item.category),
          name: item.category,
          slug: toSlug(item.category),
        }
      : EMPTY_CATEGORY,
  } as any;
};

/* ------------------ CART ------------------ */

export const toFrontCart = (cart: ApiCart): Cart => {
  const cartItems = (cart.items || []).map((item) => {
    const product = item.product;
    const imageUrl = product?.imageUrl || placeholderImage;
    const price = Number(product?.price ?? 0);

    return {
      _id: item.id,
      cart: { _id: cart.id },
      variant: {
        _id: item.productId,
        price,
        discount: 0,
      },
      productName: product?.name ?? "Product",
      productImage: imageUrl,
      qty: item.quantity,
    };
  });

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.qty,
    0
  );

  return {
    ...EMPTY_CART,
    _id: cart.id,
    user_id: cart.customerId,
    cartItems,
    subTotal,
    total: subTotal,
  } as any;
};