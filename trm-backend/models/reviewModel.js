import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Either Place or Hotel reference
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;


