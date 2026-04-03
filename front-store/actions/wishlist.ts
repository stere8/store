"use server";
import { apiClient } from "@/lib/epoc-api";

export const getWishlist = async (_id: string) => {
  try {
    const response = await apiClient.get("/api/wishlist", { params: { _id } });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching wishlist", error);
    return [];
  }
};
