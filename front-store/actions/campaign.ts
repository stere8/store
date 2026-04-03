"use server";
import { apiClient } from "@/lib/epoc-api";

export const updateCampaign = async (id: string) => {
  try {
    const response = await apiClient.get("/api/campaigns", { params: { _id: id } });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error updating campaign", error);
    return [];
  }
};

export const getCampaigns = async (slug: string) => {
  try {
    const response = await apiClient.get("/api/slides", { params: { slug } });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching campaigns", error);
    return [];
  }
};

export const getCampaign = async (slug: string) => {
  const campaigns = await getCampaigns(slug);
  return campaigns.length > 0 ? campaigns[0].slideItem : [];
};
