import Place from "../models/PlaceModel.js";
import Hotel from "../models/HotelModel.js"; // make sure you have this model
export const getFeaturedPlacesWithPopularHotels = async (req, res) => {
  try {
    // 1️⃣ Get featured places
    const places = await Place.find({ isFeatured: true }).limit(5);

    // 2️⃣ Attach top hotels of each place
    const placesWithHotels = await Promise.all(
      places.map(async (place) => {
        const hotels = await Hotel.find({ place: place._id })
          .sort({ averageRating: -1, totalReviews: -1 })
          .limit(3);
        return { ...place.toObject(), hotels };
      })
    );

    // 3️⃣ Optionally get top hotels across all featured places
    const allPlaceIds = places.map(p => p._id);
    const topHotels = await Hotel.find({ place: { $in: allPlaceIds } })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(5);

    res.status(200).json({ places: placesWithHotels, topHotels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching featured places", error: err.message });
  }
};

