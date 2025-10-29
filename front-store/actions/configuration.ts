"use server";
import axios from "axios";

export const getConfig = async () => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/admin/confgurations"
    );
    return response.data.data;
  } catch (error) {
    return error;
  }
};
