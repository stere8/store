import { TypeTokenModel } from "@/types/models";
import { Schema, model, Model } from "mongoose";
import mongoose from "mongoose";

//2. type model
type TokenModel = Model<TypeTokenModel>;

// 3. Create schema
const schema = new Schema<TypeTokenModel, TokenModel>(
  {
    template: {
      type: String,
      required: true,
      maxLength: 255,
      unique: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "publish", "archive"],
      default: "draft",
    },
    user_id: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// 4. create the model
const Token: TokenModel =
  mongoose.models.Token || model<TypeTokenModel, TokenModel>("Token", schema);

export default Token;
