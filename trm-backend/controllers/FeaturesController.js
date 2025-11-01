import Place from "../models/PlaceModel.js";
import Hotel from "../models/HotelModel.js";
import Review from "../models/reviewModel.js";


export const getFeaturedPlacesWithHotels = async (req, res) => {
  try {
    // 1️⃣ Get featured places (limit 2)
    let places = await Place.find({ isFeatured: true }).limit(2);

    // 2️⃣ Fallback: if no featured places, get top-rated ones
    if (!places.length) {
      places = await Place.find()
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(2);
    }

    // 3️⃣ Attach hotels with review stats to each place
    const populatedPlaces = await Promise.all(
      places.map(async (place) => {
        const hotels = await Hotel.find({ placeId: place._id });

        const hotelsWithRatings = await Promise.all(
          hotels.map(async (hotel) => {
            const reviews = await Review.find({ hotelId: hotel._id });
            const reviewCount = reviews.length;
            const averageRating =
              reviewCount > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                : 0;

            return {
              ...hotel.toObject(),
              averageRating,
              reviewCount,
            };
          })
        );

        return {
          ...place.toObject(),
          hotels: hotelsWithRatings, // ✅ now real hotels, not IDs
        };
      })
    );

    // 4️⃣ Combine all hotels to get overall top 3
    const allHotels = populatedPlaces.flatMap((p) =>
      p.hotels.map((h) => ({ ...h, placeName: p.name }))
    );

    const topHotels = allHotels
      .sort(
        (a, b) =>
          b.averageRating - a.averageRating || b.reviewCount - a.reviewCount
      )
      .slice(0, 3);

    // 5️⃣ Return clean structured data
    res.json({
      success: true,
      places: populatedPlaces,
      topHotels,
    });
  } catch (err) {
    console.error("Error fetching featured places and top hotels:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};