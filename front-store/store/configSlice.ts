import { TypeConfigurationModel } from "@/types/models";
import { createSlice } from "@reduxjs/toolkit";
import { BRAND, BRAND_ASSETS, DEFAULT_COPYRIGHT } from "@/lib/branding";

const defaultSiteLogo = BRAND_ASSETS.primaryLogo;

export interface ConfigState {
  siteDetails: TypeConfigurationModel;
  languages: [];
}

const initialState: ConfigState = {
  siteDetails: {
    name: BRAND.fullName,
    description: BRAND.description,
    copyright: DEFAULT_COPYRIGHT,
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
