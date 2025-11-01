import Review from "../models/reviewModel.js";
import Place from "../models/PlaceModel.js";
import Hotel from "../models/HotelModel.js";

// ------------------ Helper: Update average rating ------------------
const updateRating = async (type, id) => {
  const filter = type === "Place" ? { placeId: id } : { hotelId: id };
  const reviews = await Review.find(filter);
  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const Model = type === "Place" ? Place : Hotel;
  await Model.findByIdAndUpdate(id, { averageRating, reviewCount });
};

// ------------------ Get reviews for Place or Hotel ------------------
export const getReviews = async (req, res) => {
  try {
   const { type, id } = req.query// e.g. /reviews/Place/:id or /reviews/Hotel/:id
    const filter = type === "Place" ? { placeId: id } : { hotelId: id };

    const reviews = await Review.find(filter).populate("user", "_id name");
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

// ------------------ Add review ------------------
export const addReview = async (req, res) => {
  try {
    const { type, id, rating, comment } = req.body;

    console.log("➡️ Received:", { type, id });

    const newReview = new Review({
      user: req.user._id,
      rating,
      comment,
      ...(type === "Place" ? { placeId: id } : { hotelId: id }),
    });

    await newReview.save();

    const populatedReview = await Review.findById(newReview._id).populate(
      "user",
      "_id name"
    );

    let relatedName = null;
    if (type === "Hotel") {
      const hotel = await Hotel.findById(id, "name");
      console.log(" Hotel found:", hotel);
      relatedName = hotel ? hotel.name : null;
    } else if (type === "Place") {
      const place = await Place.findById(id, "name");
      console.log("📍 Place found:", place);
      relatedName = place ? place.name : null;
    }

    await updateRating(type, id);

    res.status(201).json({
      success: true,
      review: {
        ...populatedReview.toObject(),
        relatedName,
      },
    });
  } catch (error) {
    console.error("❌ Add Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding review",
      error: error.message,
    });
  }
};


// ------------------ Update review ------------------
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "_id name"
    );

    const type = review.placeId ? "Place" : "Hotel";
    const id = review.placeId || review.hotelId;

    await updateRating(type, id);

    res.json({ success: true, review: populatedReview });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

// ------------------ Delete review ------------------
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });

    if (review.user.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const type = review.placeId ? "Place" : "Hotel";
    const id = review.placeId || review.hotelId;

    await review.deleteOne();
    await updateRating(type, id);

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};
