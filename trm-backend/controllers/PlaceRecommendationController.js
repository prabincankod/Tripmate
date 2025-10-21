import { UserModel } from "../models/userModels.js";
import Place from "../models/PlaceModel.js";

export const getHomeRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user and visited places
    const user = await UserModel.findById(userId).populate("visitedPlaces");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Extract travel styles from travelClicks
    const clicksMap = user.travelClicks || {};
    const userStyles = Object.keys(clicksMap); // array of style names

    // Safely get visited place IDs
    const visitedPlaceIds = (user.visitedPlaces || []).map(p => p._id);

    // 1️⃣ Style-based recommendations
    let styleRecommendations = [];
    if (userStyles.length > 0) {
      styleRecommendations = await Place.find({
        _id: { $nin: visitedPlaceIds },
        travelStyles: { $in: userStyles }
      }).limit(10);
    }

    // 2️⃣ Recommendations from similar users
    const similarUsers = await UserModel.find({
      _id: { $ne: userId },
      "travelClicks": { $exists: true, $ne: {} } // at least one click
    }).populate("visitedPlaces");

    let otherUserPlaces = [];
    similarUsers.forEach(u => {
      const uVisited = u.visitedPlaces || [];
      otherUserPlaces.push(
        ...uVisited.filter(p => !visitedPlaceIds.includes(p._id))
      );
    });

    // Deduplicate
    const uniqueOtherIds = [...new Set(otherUserPlaces.map(p => p._id.toString()))];

    const popularRecommendations = await Place.find({
      _id: { $in: uniqueOtherIds }
    }).limit(5);

    // 3️⃣ Top-rated fallback
    const topRated = await Place.find({
      _id: { $nin: visitedPlaceIds }
    }).sort({ averageRating: -1 }).limit(3);

    // 4️⃣ Combine + Deduplicate + Shuffle
    const combined = [...styleRecommendations, ...popularRecommendations, ...topRated];
    const uniqueCombined = [...new Map(combined.map(p => [p._id.toString(), p])).values()];
    const shuffled = uniqueCombined.sort(() => 0.5 - Math.random());

    res.json({ success: true, recommendations: shuffled });

  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ success: false, message: "Error fetching recommendations" });
  }
};
