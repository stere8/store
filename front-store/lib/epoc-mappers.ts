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

export const toFrontCategory = (item: ApiCategory) => ({
  _id: item.id,
  name: item.name,
  description: item.description ?? "",
  slug: toSlug(item.name),
  image: placeholderImage,
  user_id: "",
  status: "publish" as const,
  createdAt: new Date(),
  subCategory: [],
});

export const toFrontProduct = (item: ApiProduct) => {
  const slug = toSlug(item.name);
  const imageUrl = item.imageUrl || placeholderImage;

  const baseVariant = {
    _id: item.id,
    name: "default",
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
    seoDescription: item.description || item.name,
    seoTitle: item.name,
    seoSlug: slug,
    status: "publish" as const,
  };

  return {
    storeId: "",
    _id: item.id,
    featured: false,
    name: item.name,
    slug,
    description: item.description || item.name,
    additionnal: item.description || item.name,
    specification: item.description || item.name,
    store: [{ _id: "estore", user_id: "", name: "EStore", description: "", logo: placeholderImage, products: [], orders: [], slides: [], subscription: {} as any, status: "online" as const, createdAt: new Date() }],
    category: item.category
      ? {
          _id: toSlug(item.category),
          name: item.category,
          description: "",
          slug: toSlug(item.category),
          image: placeholderImage,
          user_id: "",
          status: "publish" as const,
          createdAt: new Date(),
          subCategory: [],
        }
      : undefined,
    subCategories: [],
    brand: { name: "EStore" },
    details: [],
    questions: [],
    reviews: [],
    productVariants: [baseVariant],
    images: [{ url: imageUrl }],
    price: item.price,
    discount: 0,
    seoDescription: item.description || item.name,
    seoTitle: item.name,
    seoSlug: slug,
    status: "publish" as const,
    inventory: item.stockQuantity > 0 ? ("instock" as const) : ("outstock" as const),
    weight: 0,
    sku: baseVariant.sku,
    unit: "pcs",
    user_id: "",
    collections: [],
    tags: [],
  };
};

export const toFrontCart = (cart: ApiCart) => {
  const cartItems = (cart.items || []).map((item) => {
    const product = item.product;
    const imageUrl = product?.imageUrl || placeholderImage;
    const price = Number(product?.price ?? 0);

    return {
      _id: item.id,
      cart: { _id: cart.id },
      store: { _id: "estore", user_id: "", name: "EStore", description: "", logo: placeholderImage, products: [], orders: [], slides: [], subscription: {} as any, status: "online", createdAt: new Date() },
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
    _id: cart.id,
    user_id: cart.customerId,
    cartItems,
    subTotal,
    discount: 0,
    shipping: 0,
    total: subTotal,
  };
};
