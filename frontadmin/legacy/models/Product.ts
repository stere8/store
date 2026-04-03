import { TypeProductModel } from "@/types/models";
import { Schema, model, Model } from "mongoose";
import mongoose from "mongoose";

//type model
type ProductModel = Model<TypeProductModel>;

//Create schema
const schema = new Schema<TypeProductModel, ProductModel>(
  {
    featured: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      maxLength: 255,
      unique: true,
      lowercase: true,
    },
    slug: {
      type: String,
      required: true,
      maxLength: 255,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 1500,
      lowercase: true,
    },

    additionnal: {
      type: String,
      maxLength: 5000,
    },

    specification: {
      type: String,
      maxLength: 5000,
    },

    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    subCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    brand: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Brand",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },

    productVariants: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true
      },
    ],

    images: [
      {
        url: {
          type: String,
          required: true
        },
      },
    ],

    price: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 99,
    },

    status: {
      type: String,
      enum: ["publish", "draft", "archive"],
      default: "draft",
    },

    seoTitle: {
      type: String,
      required: false,
    },
    seoDescription: {
      type: String,
      required: false,
    },
    seoSlug: {
      type: String,
      required: false,
    },

    weight: {
      type: Number,
      required: false,
      default: 0,
    },

    unit: {
      type: String,
      required: false,
      default: "kg",
    },
    inventory: {
      type: String,
      enum: ["instock", "outstock"],
      default: "instock",
    },

    sku: {
      type: String,
      required: false,
    },
    user_id: {
      type: String,
      required: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//create the model
const Product =
  mongoose.models.Product ||
  model<TypeProductModel, ProductModel>("Product", schema);

export default Product;
