import { Cart, Category, Product } from "@/types";

type ApiCategory = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
};

type ApiProduct = {
  id: string;
  vendorId?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: string | null;
  category?: string;
  stockQuantity: number;
  createdAt?: string;
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

type ApiReview = {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  customerId: string;
  customerName?: string;
};

const placeholderImage = "/assets/products/image.png";
const placeholderAvatar = "/assets/images/logo_dark.svg";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const EMPTY_CATEGORY: Category = {
  _id: "",
  name: "",
  slug: "",
  description: "",
  image: placeholderImage,
  user_id: "",
  status: "publish",
  createdAt: new Date(),
  subCategory: [],
} as any;

export const EMPTY_PRODUCT: Product = {
  storeId: "",
  _id: "",
  featured: false,
  name: "",
  slug: "",
  description: "",
  additionnal: "",
  specification: "",
  store: [],
  category: EMPTY_CATEGORY,
  subCategories: [],
  brand: undefined,
  details: [],
  questions: [],
  reviews: [],
  productVariants: [],
  images: [{ url: placeholderImage }],
  imageUrl: placeholderImage,
  price: 0,
  discount: 0,
  seoSlug: "",
  seoDescription: "",
  seoTitle: "",
  status: "publish",
  inventory: "outstock",
  weight: 0,
  sku: "",
  unit: "pc",
  user_id: "",
  collections: [],
  tags: [],
} as any;

export const EMPTY_CART: Cart = {
  _id: "",
  cartItems: [],
  total: 0,
  subTotal: 0,
  user_id: "",
} as any;

const buildCategory = (name?: string) => {
  if (!name) {
    return EMPTY_CATEGORY;
  }

  return {
    ...EMPTY_CATEGORY,
    _id: toSlug(name),
    name,
    slug: toSlug(name),
  } as any;
};

export const createCategoryLookup = (items: ApiCategory[]) =>
  new Map(items.map((item) => [item.id, toFrontCategory(item)]));

const buildStore = (product: ApiProduct) =>
  ({
    _id: product.vendorId ?? "",
    name: "Storefront Vendor",
    description: "Mapped from the .NET API product catalog.",
    logo: "",
    products: [],
    orders: [],
    slides: [],
    subscription: {},
    status: "online",
    user_id: "",
    createdAt: new Date(),
  }) as any;

const buildVariant = (product: ApiProduct) => {
  const imageUrl = product.imageUrl || placeholderImage;
  const inventory = product.stockQuantity > 0 ? "instock" : "outstock";

  return {
    _id: product.id,
    productId: product.id,
    name: "Default option",
    color: {
      _id: `${product.id}-default-color`,
      name: "Default",
      description: "Default storefront option",
      slug: "default",
      images: [],
      user_id: null,
      value: "#111827",
      status: "publish",
      createdAt: new Date(),
    },
    colorImages: [{ url: imageUrl }],
    sizeImages: [],
    weight: 0,
    inventory,
    sku: `SKU-${product.id.slice(0, 8).toUpperCase()}`,
    price: Number(product.price ?? 0),
    discount: 0,
    colorValue: "#111827",
    status: "publish",
  } as any;
};

export const toFrontCategory = (item: ApiCategory): Category => ({
  ...EMPTY_CATEGORY,
  _id: item.id,
  name: item.name,
  slug: toSlug(item.name),
  description: item.description ?? "",
  createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
});

export const toFrontProduct = (
  item: ApiProduct,
  categoryLookup?: Map<string, Category>
): Product => {
  const imageUrl = item.imageUrl || placeholderImage;
  const category =
    (item.categoryId ? categoryLookup?.get(item.categoryId) : undefined) ||
    buildCategory(item.category);
  const variant = buildVariant(item);
  const store = buildStore(item);
  const description = item.description?.trim() || item.name;

  return {
    ...EMPTY_PRODUCT,
    storeId: item.vendorId ?? "",
    _id: item.id,
    featured: item.stockQuantity > 0,
    name: item.name,
    slug: toSlug(item.name),
    description,
    additionnal: description,
    specification: `<p>Available stock: ${item.stockQuantity}</p>`,
    store: store._id ? [store] : [],
    category,
    images: [{ url: imageUrl }],
    imageUrl,
    price: Number(item.price ?? 0),
    inventory: item.stockQuantity > 0 ? "instock" : "outstock",
    sku: variant.sku,
    seoSlug: toSlug(item.name),
    seoDescription: description,
    seoTitle: item.name,
    reviews: [],
    productVariants: [variant],
  } as any;
};

export const toFrontCart = (cart: ApiCart): Cart => {
  const cartItems = (cart.items || []).map((item) => {
    const fallbackProduct: ApiProduct = {
      id: item.productId,
      name: item.product?.name || "Product",
      description: item.product?.description,
      price: Number(item.product?.price ?? 0),
      imageUrl: item.product?.imageUrl,
      category: item.product?.category,
      stockQuantity: item.product?.stockQuantity ?? item.quantity,
      vendorId: item.product?.vendorId,
    };

    const variant = buildVariant(fallbackProduct);

    return {
      _id: item.id,
      cart: { _id: cart.id },
      store: fallbackProduct.vendorId
        ? {
            _id: fallbackProduct.vendorId,
            name: "Storefront Vendor",
          }
        : undefined,
      variant,
      productName: fallbackProduct.name,
      productImage: fallbackProduct.imageUrl || placeholderImage,
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

export const toFrontReview = (review: ApiReview) =>
  ({
    _id: review.id,
    user: {
      imageUrl: placeholderAvatar,
      fullName: review.customerName || "Customer",
    },
    review: review.comment || review.title || "Review submitted",
    rating: review.rating,
    createdAt: new Date(review.createdAt),
  }) as any;
