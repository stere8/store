import { TypeConfigurationModel } from "@/types/models";
import { createSlice } from "@reduxjs/toolkit";

const defaultSiteLogo = "/assets/images/logo.png";

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
    logo: defaultSiteLogo,
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
      state.siteDetails = {
        ...state.siteDetails,
        ...action.payload,
        logo: action.payload?.logo || defaultSiteLogo,
      };
    },
  },
});

export const { addConfig } = cartSlice.actions;

export default cartSlice.reducer;
