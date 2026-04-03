
import type { TypeWishListModel } from "@/types/models";
import { Schema, model, Model } from "mongoose";
import mongoose from "mongoose";

//2. type model
type WishListModel = Model<TypeWishListModel>;

// 3. Create schema
const schema = new Schema<TypeWishListModel, WishListModel>(
  {
    status: {
      type: String,
      enum: ["draft", "abandoned", "completed"],
      default: "draft",
    },
    WishListItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "WishListItem",
        required: false,
      },
    ],

    subTotal: {
      type: Number,
      default: 0,
    },

    user_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 4. create the model
const WishList: WishListModel =
  mongoose.models.WishList || model<TypeWishListModel, WishListModel>("WishList", schema);

export default WishList;
