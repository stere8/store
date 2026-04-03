"use server";
import { apiClient } from "@/lib/epoc-api";

export const updateCampaign = async (id: string) => {
  try {
    const response = await apiClient.get("/api/campaigns", { params: { _id: id } });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error updating campaign page", error);
    return [];
  }
};

export const getCampaigns = async (slug: string) => {
  try {
    const response = await apiClient.get("/api/slides", { params: { slug } });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching campaign pages", error);
    return [];
  }
};

export const getPages = async () => {
  try {
    const response = await apiClient.get("/api/pages");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching pages", error);
    return [];
  }
};
