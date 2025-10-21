import Place from "../models/PlaceModel.js";
import Hotel from "../models/HotelModel.js";
import Review from "../models/reviewModel.js";

export const getFeaturedPlacesWithHotels = async (req, res) => {
  try {
    // 1️⃣ Fetch featured places (limit 2)
    let places = await Place.find({ isFeatured: true }).limit(2);

    // 2️⃣ Fallback: if no featured places, take top 2 by rating & reviews
    if (!places.length) {
      places = await Place.find()
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(2);
    }

    // 3️⃣ Attach top 3 hotels for each place
    const placesWithHotels = await Promise.all(
      places.map(async (place) => {
        const hotels = await Hotel.find({ placeId: place._id });

        const hotelsWithReviews = await Promise.all(
          hotels.map(async (hotel) => {
            const reviews = await Review.find({ hotelId: hotel._id });
            const reviewCount = reviews.length;
            const averageRating = reviewCount
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              : 0;

            return { ...hotel.toObject(), averageRating, reviewCount };
          })
        );

        // Sort hotels by averageRating first, then reviewCount
        const topHotels = hotelsWithReviews
          .sort(
            (a, b) =>
              b.averageRating - a.averageRating || b.reviewCount - a.reviewCount
          )
          .slice(0, 3);

        return {
          _id: place._id,
          name: place.name,
          description: place.description,
          images: place.images,
          averageRating: place.averageRating || 0,
          reviewCount: place.reviewCount || 0,
          hotels: topHotels,
        };
      })
    );

    res.json({ success: true, places: placesWithHotels });
  } catch (err) {
    console.error("Error fetching featured places with hotels:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
