import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },

    // Broad place-level categories
    travelStyles: [
      { type: String, enum: ["City", "Food", "Temple", "Adventure"] }
    ],

    // Top attractions with their own type
    topAttractions: [
      {
        name: { type: String, required: true },
        image: { type: String, default: "" },
        type: {
          type: String,
          enum: ["Temple", "Park", "Museum", "Adventure", "City"],
          default: "City"
        },
      },
    ],

    // Activities with category
    thingsToDo: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        travelStyle: {
          type: String,
          enum: ["City", "Food", "Temple", "Adventure"],
          default: "City"
        }
      },
    ],

    images: [
      {
        type: String,
      },
    ],
     hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],

    bestSeason: [
      {
        season: {
          type: String,
          enum: ["Spring", "Summer", "Monsoon", "Autumn", "Winter"],
        },
        description: { type: String, default: "" },
      },
    ],

    localCulture: [
      {
        festival: { type: String },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        travelStyle: {
          type: String,
          enum: ["Culture"],
          default: "Culture"
        }
      },
    ],

    localCuisine: [
      {
        dish: { type: String },
        description: { type: String, default: "" },
        image: { type: String, default: "" },
        travelStyle: {
          type: String,
          enum: ["Food"],
          default: "Food"
        }
      },
    ],

    travelTips: [
      {
        title: { type: String }, image: { type: String, default: "" },
      },
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      address: {
        type: String,
        default: "",
      },
    },

    mapLink: { type: String, default: "" },

    weatherInfo: {
      temperature: { type: Number, default: 0 },
      condition: { type: String, default: "" },
      lastUpdated: { type: Date, default: null },
    },

 
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

placeSchema.index({ location: "2dsphere" });

export default mongoose.model("Place", placeSchema);


