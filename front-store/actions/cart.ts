"use server";
import axios from "axios";

export const ensureCart = async (userId: string) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_URL + "/api/carts/ensure",
      {
        user_id: userId,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error ensuring cart:", error);
    throw error;
  }
};

export const getCart = async (cartId: string) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + `/api/carts/${cartId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
};

export const addToCart = async (
  cartId: string,
  productId: string,
  quantity: number
) => {
  try {
    const response = await axios.post(
      process.env.NEXT_PUBLIC_API_URL + `/api/carts/${cartId}/items`,
      {
        productId,
        quantity,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const removeFromCart = async (cartId: string, productId: string) => {
  try {
    await axios.delete(
      process.env.NEXT_PUBLIC_API_URL + `/api/carts/${cartId}/items/${productId}`
    );
    return true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};
