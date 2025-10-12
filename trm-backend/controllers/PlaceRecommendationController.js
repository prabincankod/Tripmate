import { UserModel } from "../models/userModels.js";
import Place from "../models/PlaceModel.js";

export const getHomeRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("visitedPlaces");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const userStyles = user.clickHistory.map(c => c.travelStyle);

    // 1️⃣ Style-based recommendations
    const styleRecommendations = await Place.find({
      _id: { $nin: user.visitedPlaces.map(p => p._id) },
      travelStyles: { $in: userStyles }
    }).limit(10);

    // 2️⃣ Similar users
    const similarUsers = await User.find({
      _id: { $ne: userId },
      "clickHistory.travelStyle": { $in: userStyles }
    }).populate("visitedPlaces");

    let otherUserPlaces = [];
    similarUsers.forEach(u => {
      otherUserPlaces.push(
        ...u.visitedPlaces.filter(
          p => !user.visitedPlaces.some(vp => vp._id.equals(p._id))
        )
      );
    });

    // Deduplicate
    const uniqueOtherIds = [...new Set(otherUserPlaces.map(p => p._id.toString()))];

    const popularRecommendations = await Place.find({
      _id: { $in: uniqueOtherIds }
    }).limit(5);

    // 3️⃣ Top-rated fallback
    const topRated = await Place.find({
      _id: { $nin: user.visitedPlaces.map(p => p._id) }
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
