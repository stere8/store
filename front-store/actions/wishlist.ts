"use server";
import axios from "axios";

export const getWishlist = async (_id: string) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/wishlist?_id=" + _id,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};
