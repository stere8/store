"use server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getCart = async (_id: string) => {
  try {
    const { getToken } = auth();

    const token = await getToken();

    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/user/carts?_id=" + _id,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};
<<<<<<< HEAD
=======

export const addToCart = async (cartId: string, productId: string, quantity: number) => {
  try {
    const response = await apiClient.post(`/api/carts/${cartId}/items`, {
      productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const getCart = async (cartId: string) => {
  try {
    const response = await apiClient.get(`/api/carts/${cartId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
};

export const removeFromCart = async (cartId: string, productId: string) => {
  try {
    await apiClient.delete(`/api/carts/${cartId}/items/${productId}`);
    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};
>>>>>>> origin/772d8p-codex/connect-.net-api-to-frontend
