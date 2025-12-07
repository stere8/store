import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage extends Document {
  user: string; // Clerk user ID
  store: mongoose.Types.ObjectId; // Seller store ID
  product: mongoose.Types.ObjectId;
  sender: "user" | "store";
  content: string;
  timestamp: Date;
}

const ChatMessageSchema: Schema<IChatMessage> = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "store"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
