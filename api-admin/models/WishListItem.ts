
import { TypeWishListItemModel } from "@/types/models";
import { Schema, model, Model } from "mongoose";
import mongoose from "mongoose";

//2. type model
type WishListItemModel = Model<TypeWishListItemModel>;

// 3. Create schema
const schema = new Schema<TypeWishListItemModel, WishListItemModel>(
  {
    WishList: {
      type: Schema.Types.ObjectId,
      ref: "WishList",
      required: true,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },

    qty: {
      type: Number,
      default: 1,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 4. create the model
const WishListItem: WishListItemModel =
  mongoose.models.WishListItem ||
  model<TypeWishListItemModel, WishListItemModel>("WishListItem", schema);

export default WishListItem;
