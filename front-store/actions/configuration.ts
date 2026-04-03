"use server";
import { apiClient } from "@/lib/epoc-api";

export const getConfig = async () => {
  try {
    const response = await apiClient.get("/api/admin/confgurations");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching configuration", error);
    return [];
  }
};
