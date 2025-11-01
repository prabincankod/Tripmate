import { UserModel } from "../models/userModels.js";
import Place from "../models/PlaceModel.js";
import { TravelJourney } from "../models/JourneyModel.js";
// ------------------ GET HOME RECOMMENDATIONS ------------------
export const getHomeRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // ------------------ Current user's saved places ------------------
    const userJourney = await TravelJourney.findOne({ userId }).select("savedPlaces").lean();
    const savedIds = userJourney?.savedPlaces?.map(p => p.placeId.toString()) || [];

    // ------------------ User clicks / travel styles ------------------
    const user = await UserModel.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let userStyles = Object.keys(user.travelClicks || {});

    // ------------------ Fallback if no clicks ------------------
    if (userStyles.length === 0) {
      userStyles = ["City", "Food", "Temple", "Adventure"];
    }

    // ------------------ Other users saved places (Collaborative filter) ------------------
    const otherJourneys = await TravelJourney.find({ userId: { $ne: userId } }).select("savedPlaces").lean();
    let othersLikedIds = [];
    otherJourneys.forEach(j => {
      j.savedPlaces?.forEach(p => {
        if (!savedIds.includes(p.placeId.toString())) {
          othersLikedIds.push(p.placeId.toString());
        }
      });
    });
    othersLikedIds = [...new Set(othersLikedIds)]; // deduplicate

    // ------------------ Fetch all places ------------------
    const places = await Place.find({}).lean();

    const recommendationsByStyle = {};

    // ------------------ Score places per user style ------------------
    for (const style of userStyles) {
      const regex = new RegExp(`^${style}$`, "i");

      const scoredPlaces = places
        .map(place => {
          let score = 0;
          const isCity = place.travelStyles?.some(s => regex.test(s));

          // ------------------ Personal clicks / style match ------------------
          if (place.travelStyles?.some(s => regex.test(s))) score += 3;
          if (place.thingsToDo?.some(t => regex.test(t.travelStyle))) score += 2;
          if (place.topAttractions?.some(a => regex.test(a.type))) score += 2;
          if (place.localCulture?.some(c => regex.test(c.travelStyle))) score += 1;
          if (place.localCuisine?.some(c => regex.test(c.travelStyle))) score += 1;

          // ------------------ City place boosts ------------------
          if (isCity) {
            if (savedIds.includes(place._id.toString())) score += 3;        // user saved boost
            if (othersLikedIds.includes(place._id.toString())) score += 2;  // collaborative filter
            score += place.averageRating || 0;                              // rating boost
          }

          return { place, score };
        })
        .filter(p => p.score > 0); // only keep relevant

      // Sort by score descending, tie-breaker City first
      scoredPlaces.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const aIsCity = a.place.travelStyles?.includes("City") ? 1 : 0;
        const bIsCity = b.place.travelStyles?.includes("City") ? 1 : 0;
        return bIsCity - aIsCity;
      });

      // Top 4 per style
      const topPlaces = scoredPlaces.map(p => p.place).slice(0, 4);

      recommendationsByStyle[style] = topPlaces;
    }

    res.json({ success: true, recommendations: recommendationsByStyle });

  } catch (err) {
    console.error("Error fetching home recommendations:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching recommendations", 
      error: err.message
    });
  }
};