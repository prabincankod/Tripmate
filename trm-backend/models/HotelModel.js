import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    address: { type: String, default: "" },
    contact: { type: String, default: "" },
    priceRange: { type: String, default: "" },

    ratings: {
      overall: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      rooms: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      cleanliness: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      sleepQuality: { type: Number, default: 0 },
    },
    reviewCount: { type: Number, default: 0 },

    amenities: [{ type: String }],
    roomFeatures: [{ type: String }],

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);
hotelSchema.index({ location: "2dsphere" });

export default mongoose.model("Hotel", hotelSchema);
