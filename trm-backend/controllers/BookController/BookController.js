import Booking from "../../models/BookingModel/BookModel.js";
import TravelPackage from "../../models/travelpackage.js";
import mongoose from "mongoose";

// ✅ Create Booking
export const createBooking = async (req, res) => {
  try {
    const { packageId, numberOfTravellers, travelDate, bookingId } = req.body;

    // Check package exists
    const travelPackage = await TravelPackage.findById(packageId);
    if (!travelPackage) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    // Check user is logged in
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User must be logged in" });
    }

    // Travel date required
    if (!travelDate) {
      return res.status(400).json({
        success: false,
        message: "Travel date is required",
      });
    }

    // ✅ Ensure travelDate is not in the past
    const today = new Date();
    const selectedDate = new Date(travelDate);
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: "Travel date cannot be in the past.",
      });
    }

    // Calculate total price
    const packagePrice = travelPackage.price || 0;
    const totalPrice = packagePrice * Number(numberOfTravellers || 1);

    // Create booking
    const booking = await Booking.create({
      user: userId,
      travelPackage: packageId,
      numberOfTravellers: numberOfTravellers || 1,
      totalPrice,
      bookingDate: new Date(),
      bookingId,
      status: "Pending",
    });

    // Increment package booking count
    await TravelPackage.findByIdAndUpdate(packageId, { $inc: { bookingsCount: 1 } });

    // After creating booking
const populatedBooking = await Booking.findById(booking._id)
  .populate("user", "-password -__v") // includes all registration info except password
  .populate("travelPackage", "title price duration");




    res.status(201).json({
      success: true,
      data: populatedBooking,
      message: "Booking successful!",
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all bookings (Admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("travelPackage", "title price duration")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user bookings
// Get user bookings

export const getUserBookings = async (req, res) => {
  try {
    console.log("Logged-in user id:", req.user._id);

    // Fetch bookings for the logged-in user and populate travelPackage name and price
    const bookings = await Booking.find({ user: req.user._id })
      .populate("travelPackage", "name price duration"); // only fetch fields you need

    console.log("Bookings found for this user:", bookings);

    res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("getUserBookings Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cancel booking (user, agency, or admin)
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?._id;
    const { remark, refundMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User must be logged in" });
    }

    const booking = await Booking.findById(bookingId).populate("travelPackage");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isOwner = booking.user.toString() === userId.toString();
    const isAdmin = req.user.isAdmin;
    const isAgencyOwner =
      req.user.role === "TravelAgency" &&
      booking.travelPackage.createdBy?.toString() === userId.toString();

    if (!isOwner && !isAdmin && !isAgencyOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
    }

    const hasPaid = !!booking.paymentInfo?.paidAt;

    if (hasPaid || isAdmin || isAgencyOwner) {
      // Refund if paid
      booking.status = "Refunded";
      booking.refundInfo = {
        refundedAt: new Date(),
        refundAmount: booking.totalPrice,
        refundMethod: refundMethod || "N/A",
      };
    } else {
      booking.status = "Cancelled";
      // Decrease booking count
      await TravelPackage.findByIdAndUpdate(booking.travelPackage._id, { $inc: { bookingsCount: -1 } });
    }

    if (remark) booking.remarks = remark;

    await booking.save();

    res.status(200).json({ success: true, message: `Booking ${booking.status.toLowerCase()} successfully`, data: booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Agency or admin updates booking status (Confirm/Cancel)
export const updateBookingStatusByAgency = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, remark, refundMethod } = req.body;

    const booking = await Booking.findById(bookingId).populate("travelPackage");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const isAdmin = req.user.isAdmin;
    const isAgencyOwner =
      req.user.role === "TravelAgency" &&
      booking.travelPackage.createdBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isAgencyOwner) {
      return res.status(403).json({ success: false, message: "Only agencies or admins can update booking status" });
    }

    const hasPaid = !!booking.paymentInfo?.paidAt;

    if (action === "confirm") {
      booking.status = "Confirmed";
    } else if (action === "cancel") {
      if (hasPaid || isAdmin || isAgencyOwner) {
        booking.status = "Refunded";
        booking.refundInfo = {
          refundedAt: new Date(),
          refundAmount: booking.totalPrice,
          refundMethod: refundMethod || "N/A",
        };
      } else {
        booking.status = "Cancelled";
        await TravelPackage.findByIdAndUpdate(booking.travelPackage._id, { $inc: { bookingsCount: -1 } });
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    if (remark) booking.remarks = remark;

    await booking.save();

    res.status(200).json({ success: true, message: `Booking ${booking.status.toLowerCase()} successfully`, data: booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ------------------- Get Agency Bookings -------------------
export const getAgencyBookings = async (req, res) => {
  try {
    const agencyId = req.user?._id;
    if (!agencyId)
      return res.status(401).json({ success: false, message: "Agency must be logged in" });

    // Find bookings where the package belongs to this agency
    const bookings = await Booking.find()
      .populate({
        path: "travelPackage",
        match: { agency: agencyId },
        select: "name price duration agency",
      })
      .populate("user", "name email phoneNumber")
      .sort({ createdAt: -1 });

    // Filter out bookings where travelPackage was not matched
    const agencyBookings = bookings
      .filter(b => b.travelPackage)
      .map(b => {
        // Compute isNew (created within last 24 hours)
        const now = new Date();
        const created = new Date(b.createdAt);
        const hoursDiff = (now - created) / (1000 * 60 * 60);
        const isNew = hoursDiff <= 24;

        return {
          ...b.toObject(),
          isNew,
        };
      });

    res.status(200).json({ success: true, data: agencyBookings });
  } catch (error) {
    console.error("Get agency bookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};