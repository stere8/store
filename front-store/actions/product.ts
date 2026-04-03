"use server";

import { apiClient } from "@/lib/epoc-api";
import {
  createCategoryLookup,
  EMPTY_PRODUCT,
  toFrontProduct,
  toFrontReview,
} from "@/lib/epoc-mappers";

const loadCategoryLookup = async () => {
  const response = await apiClient.get("/api/categories");
  const items = Array.isArray(response.data) ? response.data : [];
  return createCategoryLookup(items);
};

const getProductReviews = async (productId: string) => {
  try {
    const response = await apiClient.get(`/api/products/${productId}/reviews`);
    const payload = response.data;
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
      ? payload.items
      : [];

    return items.map(toFrontReview);
  } catch (error) {
    console.error("Error fetching product reviews", error);
    return [];
  }
};

export const getProduct = async (slug: string) => {
  try {
    const [response, categoryLookup] = await Promise.all([
      apiClient.get("/api/products"),
      loadCategoryLookup(),
    ]);
    const items = Array.isArray(response.data) ? response.data : [];

    const product = items
      .map((item) => toFrontProduct(item, categoryLookup))
      .find((p) => p.slug === slug);

    if (!product?._id) {
      return EMPTY_PRODUCT;
    }

    const reviews = await getProductReviews(product._id);
    return {
      ...product,
      reviews,
    };
  } catch (error) {
    console.error("Error fetching product by slug", error);
    return EMPTY_PRODUCT;
  }
};

export const getProducts = async () => {
  try {
    const [response, categoryLookup] = await Promise.all([
      apiClient.get("/api/products"),
      loadCategoryLookup(),
    ]);
    const items = Array.isArray(response.data) ? response.data : [];

    return items.map((item) => toFrontProduct(item, categoryLookup));
  } catch (error) {
    console.error("Error fetching products", error);
    return [];
  }
};

export const getProductSearch = async (search: string) => {
  try {
    const [response, categoryLookup] = await Promise.all([
      apiClient.get("/api/products", {
        params: { search: search.trim() },
      }),
      loadCategoryLookup(),
    ]);

    const items = Array.isArray(response.data) ? response.data : [];

    if (items.length > 0) {
      return items.map((item) => toFrontProduct(item, categoryLookup));
    }
  } catch {
    // Backend search might not exist → fallback below
  }

  // Fallback (client-side search)
  const products = await getProducts();
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return products;
  }

  return products.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.description.toLowerCase().includes(normalizedSearch)
  );
};
