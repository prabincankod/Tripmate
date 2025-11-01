import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    travelPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TravelPackage",
      required: true,
    },

    numberOfTravellers: {
      type: Number,
      required: true,
      min: 1,
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    bookingId: {
      type: String,
      unique: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
  type: String,
  enum: ["Pending", "Paid", "Cancelled", "Refunded", "Confirmed"],
  default: "Pending",
},

    arrived: { type: Boolean, default: false },
    refundInfo: {
  refundedAt: Date,
  refundAmount: Number,
  refundMethod: String,
},



    paymentInfo: {
      transactionId: { type: String },
      method: { type: String }, // e.g. "Card", "Esewa", "Khalti"
      paidAt: { type: Date },
    },
    remarks: {
      type: String,
      default: "",
    },
  },


  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;

