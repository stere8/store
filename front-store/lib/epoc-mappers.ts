const placeholderImage = "/assets/images/placeholder-image.png";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

type ApiCategory = {
  id: string;
  name: string;
  description?: string | null;
};

type ApiProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
  category?: string | null;
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

export const EMPTY_CATEGORY = {
  _id: "",
  name: "Uncategorized",
  description: "",
  slug: "uncategorized",
  image: placeholderImage,
  user_id: "",
  status: "publish" as const,
  createdAt: new Date(0),
  subCategory: [],
};

export const EMPTY_PRODUCT = {
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
  brand: { _id: "", name: "", description: "", slug: "", image: "", user_id: "", status: "publish" as const, createdAt: new Date(0) },
  details: [],
  questions: [],
  reviews: [],
  productVariants: [],
  images: [{ url: placeholderImage }],
  price: 0,
  discount: 0,
  seoDescription: "",
  seoTitle: "",
  seoSlug: "",
  status: "publish" as const,
  inventory: "outstock" as const,
  weight: 0,
  sku: "",
  unit: "pcs",
  user_id: "",
  collections: [],
  tags: [],
};

export const EMPTY_CART = {
  _id: "",
  user_id: "",
  cartItems: [],
  subTotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  status: "draft" as const,
};

export const toFrontCategory = (item: ApiCategory) => ({
  ...EMPTY_CATEGORY,
  _id: item.id,
  name: item.name,
  description: item.description ?? "",
  slug: toSlug(item.name),
  createdAt: new Date(),
} as any);

export const toFrontProduct = (item: ApiProduct) => {
  const slug = toSlug(item.name);
  const imageUrl = item.imageUrl || placeholderImage;
  const category = item.category
    ? {
        ...EMPTY_CATEGORY,
        _id: toSlug(item.category),
        name: item.category,
        slug: toSlug(item.category),
        createdAt: new Date(),
      }
    : EMPTY_CATEGORY;

  return {
    ...EMPTY_PRODUCT,
    storeId: "kigali-city-mall",
    _id: item.id,
    name: item.name,
    slug,
    description: item.description || item.name,
    additionnal: item.description || item.name,
    specification: item.description || item.name,
    category,
    images: [{ url: imageUrl }],
    price: item.price,
    seoDescription: item.description || item.name,
    seoTitle: item.name,
    seoSlug: slug,
    inventory: item.stockQuantity > 0 ? ("instock" as const) : ("outstock" as const),
    sku: `SKU-${item.id.slice(0, 8)}`,
    productVariants: item.id
      ? [
          {
            _id: item.id,
            productId: {} as any,
            name: item.name,
            color: {
              _id: `${item.id}-default-color`,
              name: "default",
              description: "",
              slug: "default",
              images: [{ url: imageUrl }],
              user_id: "",
              status: "publish" as const,
            },
            colorImages: [{ url: imageUrl }],
            sizeImages: [{ url: imageUrl }],
            weight: 0,
            inventory: item.stockQuantity > 0 ? ("instock" as const) : ("outstock" as const),
            sku: `SKU-${item.id.slice(0, 8)}`,
            price: item.price,
            discount: 0,
            status: "publish" as const,
          },
        ]
      : [],
  } as any;
};

export const toFrontCart = (cart: ApiCart) => {
  const cartItems = (cart.items || []).map((item) => {
    const product = item.product;
    const imageUrl = product?.imageUrl || placeholderImage;
    const price = Number(product?.price ?? 0);

    return {
      _id: item.id,
      cart: { _id: cart.id },
      store: { _id: "kigali-city-mall", name: "EStore" },
      variant: { _id: item.productId, productId: {} as any, price, discount: 0 },
      shipping: {} as any,
      productName: product?.name ?? "Product",
      productImage: imageUrl,
      qty: item.quantity,
    };
  });

  const subTotal = cartItems.reduce((sum, item) => sum + item.variant.price * item.qty, 0);

  return {
    ...EMPTY_CART,
    _id: cart.id,
    user_id: cart.customerId,
    cartItems,
    subTotal,
    total: subTotal,
  } as any;
};
