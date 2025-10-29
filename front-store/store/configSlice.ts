import { TypeConfigurationModel } from "@/types/models";
import { createSlice } from "@reduxjs/toolkit";

export interface ConfigState {
  siteDetails: TypeConfigurationModel;
  languages: [];
}

const initialState: ConfigState = {
  siteDetails: {
    name: "",
    description: "",
    copyright: "",
    phone: "",
    address: "",
    email: "",
    youtube: "",
    logo: "",
    tiktok: "",
    facebook: "",
    twitter: "",
    instagram: "",
  },
  languages: [],
};

export const cartSlice = createSlice({
  name: "config",
  initialState,

  reducers: {
    addConfig(state, action) {
      state.siteDetails = action.payload;
    },
  },
});

export const { addConfig } = cartSlice.actions;

export default cartSlice.reducer;
