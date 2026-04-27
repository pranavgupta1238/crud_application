import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

export const Author = mongoose.model("Author", authorSchema);
