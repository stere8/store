"use server";
import axios from "axios";

export const updateCampaign = async (id: string) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/user/campaigns?_id=" + id
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};

export const getCampaigns = async (slug: string) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/public/slides?slug=" + slug
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};

export const getCampaign = async (slug: string) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/public/slides?slug=" + slug
    );
    return response.data.data.length > 0 ? response.data.data[0].slideItem : [];
  } catch (error) {
    return error;
  }
};
