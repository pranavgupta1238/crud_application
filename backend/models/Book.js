import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    genre: {
      type: String,
      trim: true,
      default: ""
    },
    publishedYear: {
      type: Number,
      min: 0
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true
    }
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
