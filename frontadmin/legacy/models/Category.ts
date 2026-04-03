import { TypeCategoryModel } from "@/types/models";
import { Schema, model, Model } from "mongoose";
import mongoose from "mongoose";

//2. type model
type CategoryModel = Model<TypeCategoryModel>;

// 3. Create schema
const schema = new Schema<TypeCategoryModel, CategoryModel>(
  {
    name: {
      type: String,
      required: true,
      maxLength: 500,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: false,
      maxLength: 500,
      lowercase: true,
    },
    slug: {
      type: String,
      required: true,
      maxLength: 500,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "publish", "archive"],
      default: "draft",
    },
    subCategory: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: false,
      },
    ],
    user_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// 4. create the model
const Category: CategoryModel =
  mongoose.models.Category ||
  model<TypeCategoryModel, CategoryModel>("Category", schema);

export default Category;
