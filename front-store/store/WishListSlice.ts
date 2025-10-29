import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WishListItem } from "@/types";

interface WishListState {
  items: WishListItem[];
}

const initialState: WishListState = {
  items: [],
};

export const wishListSlice = createSlice({
  name: "WishList",
  initialState,
  reducers: {
    addToWishList(state, action: PayloadAction<WishListItem>) {
      if (
        action.payload?.variant?._id &&
        !state.items.some(
          (item) => item?.variant?._id === action.payload.variant._id
        )
      ) {
        state.items.push(action.payload);
      }
    },
    updateToWishList(state, action: PayloadAction<WishListItem[]>) {
      state.items = action.payload;
    },
    removeFromWishList(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (item) => item?.variant?._id !== action.payload
      );
    },
    cleanWishList(state) {
      state.items = state.items.filter(
        (item): item is WishListItem =>
          item !== null &&
          typeof item === "object" &&
          item.variant &&
          typeof item.variant.price === "number"
      );
    },
  },
});

export const {
  addToWishList,
  updateToWishList,
  removeFromWishList,
  cleanWishList,
} = wishListSlice.actions;

export default wishListSlice.reducer;
