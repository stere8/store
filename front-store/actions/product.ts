"use server";
import { apiClient } from "@/lib/epoc-api";
import { EMPTY_PRODUCT, toFrontProduct } from "@/lib/epoc-mappers";

export const getProduct = async (slug: string) => {
  try {
    const response = await apiClient.get("/api/products");
    const items = Array.isArray(response.data) ? response.data : [];
    const product = items.map(toFrontProduct).find((p) => p.slug === slug);
    return product || EMPTY_PRODUCT;
  } catch (error) {
    console.error("Error fetching product by slug", error);
    return EMPTY_PRODUCT;
  }
};

export const getProducts = async () => {
  try {
    const response = await apiClient.get("/api/products");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(toFrontProduct);
  } catch (error) {
    console.error("Error fetching products", error);
    return [];
  }
};

export const getProductSearch = async (search: string) => {
  try {
    const response = await apiClient.get("/api/products", {
      params: { search: search.trim() },
    });

    const items = Array.isArray(response.data) ? response.data : [];
    if (items.length > 0) {
      return items.map(toFrontProduct);
    }
  } catch {
    // Backend search may not be implemented yet; fallback below.
  }

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
