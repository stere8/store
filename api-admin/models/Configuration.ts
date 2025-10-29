import { TypeConfigurationModel } from "@/types/models";
import { Schema, model, Model } from "mongoose";
import mongoose from "mongoose";

//2. type model
type ConfigurationModel = Model<TypeConfigurationModel>;

// 3. Create schema
const schema = new Schema<TypeConfigurationModel, ConfigurationModel>(
  {
    name: {
      type: String,
      required: false,
      maxLength: 255,
      lowercase: true,
    },
    description: {
      type: String,
      required: false,
      maxLength: 255,
      lowercase: true,
    },
    copyright: {
      type: String,
      required: true,
      maxLength: 255,
      unique: true,
      lowercase: false,
    },
    phone: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    youtube: {
      type: String,
      required: false,
    },
    logo: {
      type: String,
      required: false,
    },
    tiktok: {
      type: String,
      required: false,
    },
    facebook: {
      type: String,
      required: false,
    },
    twitter: {
      type: String,
      required: false,
    },
    instagram: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// 4. create the model
const Configuration: ConfigurationModel =
  mongoose.models.Configuration ||
  model<TypeConfigurationModel, ConfigurationModel>("Configuration", schema);

export default Configuration;
