"use server";
import { apiClient } from "@/lib/epoc-api";
import { EMPTY_CART, toFrontCart } from "@/lib/epoc-mappers";

type EnsureCustomerInput = {
  externalUserId: string;
  fullName?: string | null;
  email?: string | null;
};

export const ensureCustomer = async ({
  externalUserId,
  fullName,
  email,
}: EnsureCustomerInput) => {
  try {
    const payload = {
      username: externalUserId,
      fullName: fullName || externalUserId,
      phoneNumber: `+250${externalUserId.replace(/\D/g, "").slice(0, 9).padEnd(9, "0")}`,
      email: email || null,
      preferredLanguage: "en",
    };

    const response = await apiClient.post("/api/customers", payload);
    return response.data;
  } catch (error) {
    console.error("Error ensuring customer", error);
    return { id: "" };
  }
};

export const ensureCart = async (customerId: string) => {
  try {
    const response = await apiClient.post("/api/carts/ensure", { customerId });
    return response.data;
  } catch (error) {
    console.error("Error ensuring cart:", error);
    return { id: "" };
  }
};

export const getCart = async (cartId: string) => {
  try {
    const response = await apiClient.get(`/api/carts/${cartId}`);
    return toFrontCart(response.data);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return EMPTY_CART;
  }
};

export const addToCart = async (
  cartId: string,
  productId: string,
  quantity: number
) => {
  try {
    const response = await apiClient.post(`/api/carts/${cartId}/items`, {
      productId,
      quantity,
    });
    return toFrontCart(response.data);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return EMPTY_CART;
  }
};

export const removeFromCart = async (cartId: string, productId: string) => {
  try {
    await apiClient.delete(`/api/carts/${cartId}/items/${productId}`);
    return true;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return false;
  }
};
