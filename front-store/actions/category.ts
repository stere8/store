"use server";
import { apiClient } from "@/lib/epoc-api";
import { EMPTY_CATEGORY, toFrontCategory } from "@/lib/epoc-mappers";

export const getCategory = async (slug: string) => {
  try {
    const response = await apiClient.get("/api/categories");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(toFrontCategory).find((c) => c.slug === slug) || EMPTY_CATEGORY;
  } catch (error) {
    console.error("Error fetching category", error);
    return EMPTY_CATEGORY;
  }
};

export const getCategories = async () => {
  try {
    const response = await apiClient.get("/api/categories");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(toFrontCategory);
  } catch (error) {
    console.error("Error fetching categories", error);
    return [];
  }
};
