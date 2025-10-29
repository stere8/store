"use server";
import axios from "axios";

export const getProduct = async (slug: string) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/public/products?slug=" + slug
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};

export const getProducts = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/public/products"
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};

export const getProductSearch = async (search: string) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/public/products",
      {
        params: { search: search },
      }
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};
