import Place from "../models/PlaceModel.js";
import Review from "../models/reviewModel.js";
import axios from "axios";

// ------------------ Helper: Geocoding ------------------
async function getCoordinatesFromAddress(address) {
  try {
    if (!address) return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    const res = await axios.get(url);
    if (res.data && res.data.length > 0) {
      return [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)];
    }
    return null;
  } catch (err) {
    console.error("Geocoding error:", err.message);
    return null;
  }
}

// ------------------ CREATE PLACE ------------------
export const createPlace = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      topAttractions: rawAttractions,
      thingsToDo: rawThingsToDo,
      travelStyles: rawTravelStyles,
      hotels: rawHotels,
      bestSeason: rawBestSeason,
      localCulture: rawLocalCulture,
      localCuisine: rawLocalCuisine,
      travelTips: rawTravelTips,
      mapLink,
    } = req.body;

    if (!name || !description)
      return res.status(400).json({ message: "Name and description are required" });

    const validTravelStyles = ["City", "Food", "Temple", "Adventure"];
    let travelStyles = [];
    if (rawTravelStyles) {
      try {
        travelStyles =
          typeof rawTravelStyles === "string" ? JSON.parse(rawTravelStyles) : rawTravelStyles;
        travelStyles = travelStyles.filter((style) => validTravelStyles.includes(style));
      } catch {
        travelStyles = [];
      }
    }

    // ------------------ Top Attractions ------------------
    let topAttractions = [];
    if (rawAttractions) {
      try {
        const parsed = typeof rawAttractions === "string" ? JSON.parse(rawAttractions) : rawAttractions;
        const attractionImages = req.files?.attractionImages || [];
        topAttractions = parsed.map((item, i) => ({
          name: item.name || "",
          image: attractionImages[i] ? `/uploads/${attractionImages[i].filename}` : item.image || "",
          type: validTravelStyles.includes(item.type) ? item.type : "City",
        }));
      } catch (err) {
        console.warn("Invalid topAttractions:", err.message);
      }
    }

    // ------------------ Things To Do ------------------
    let thingsToDo = [];
    if (rawThingsToDo) {
      try {
        const parsed = typeof rawThingsToDo === "string" ? JSON.parse(rawThingsToDo) : rawThingsToDo;
        const thingsToDoImages = req.files?.thingsToDoImages || [];
        thingsToDo = parsed.map((item, i) => ({
          title: item.title || "",
          description: item.description || "",
          image: thingsToDoImages[i] ? `/uploads/${thingsToDoImages[i].filename}` : item.image || "",
          travelStyle: validTravelStyles.includes(item.travelStyle) ? item.travelStyle : "City",
        }));
      } catch (err) {
        console.warn("Invalid thingsToDo:", err.message);
      }
    }

    // ------------------ Hotels ------------------
// ------------------ Hotels (Linked) ------------------
let hotels = [];
if (rawHotels) {
  try {
    const parsed = typeof rawHotels === "string" ? JSON.parse(rawHotels) : rawHotels;
    const hotelsImages = req.files?.hotelsImages || [];
    
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      // Create hotel in Hotel collection
      const hotel = new Hotel({
        name: item.name || "",
        description: item.description || "",
        image: hotelsImages[i] ? `/uploads/${hotelsImages[i].filename}` : item.image || "",
        location: item.location || { type: "Point", coordinates: [0, 0] },
        amenities: item.amenities || [],
      });
      await hotel.save();
      hotels.push(hotel._id); // store hotel IDs in Place
    }
  } catch (err) {
    console.warn("Invalid hotels:", err.message);
  }
}


    // ------------------ Best Season ------------------
    let bestSeason = [];
    if (rawBestSeason) {
      try {
        bestSeason = typeof rawBestSeason === "string" ? JSON.parse(rawBestSeason) : rawBestSeason;
      } catch (err) {
        console.warn("Invalid bestSeason:", err.message);
      }
    }

    // ------------------ Local Culture ------------------
    let localCulture = [];
if (rawLocalCulture) {
  try {
    const parsed = typeof rawLocalCulture === "string" ? JSON.parse(rawLocalCulture) : rawLocalCulture;
    const localCultureImages = req.files?.localCultureImages || [];
    localCulture = parsed.map((item, i) => ({
      festival: item.festival || "",
      description: item.description || "",
      image: localCultureImages[i]
        ? `/uploads/${localCultureImages[i].filename}`
        : typeof item.image === "string"
        ? item.image
        : "",
      travelStyle: "Culture",
    }));
  } catch (err) {
    console.warn("Invalid localCulture:", err.message);
  }
}


    // ------------------ Local Cuisine ------------------
   let localCuisine = [];
if (rawLocalCuisine) {
  try {
    const parsed = typeof rawLocalCuisine === "string" ? JSON.parse(rawLocalCuisine) : rawLocalCuisine;
    const localCuisineImages = req.files?.localCuisineImages || [];
    localCuisine = parsed.map((item, i) => ({
      dish: item.dish || "",
      description: item.description || "",
      image: localCuisineImages[i]
        ? `/uploads/${localCuisineImages[i].filename}`
        : typeof item.image === "string"
        ? item.image
        : "",
      travelStyle: "Food",
    }));
  } catch (err) {
    console.warn("Invalid localCuisine:", err.message);
  }
}


    // ------------------ Travel Tips ------------------
    let travelTips = [];
    if (rawTravelTips) {
      try {
        const parsed = typeof rawTravelTips === "string" ? JSON.parse(rawTravelTips) : rawTravelTips;
        travelTips = parsed.map((item) => ({
          title: item.title || "",
          description: item.description || "",
       
        }));
      } catch (err) {
        console.warn("Invalid travelTips:", err.message);
      }
    }

    // ------------------ Main Images ------------------
    const images = req.files?.images ? req.files.images.map((f) => `/uploads/${f.filename}`) : [];

    // ------------------ Coordinates ------------------
    const coordinates = await getCoordinatesFromAddress(address);

    // ------------------ Create Place ------------------
    const place = new Place({
      name,
      description,
      address,
      travelStyles,
      topAttractions,
      thingsToDo,
    
      bestSeason,
      localCulture,
      localCuisine,
      travelTips,
      images,
      mapLink: mapLink || "",
      location: {
        type: "Point",
        coordinates: coordinates || [0, 0],
        address: address || "",
      },
      averageRating: 0,
      reviewCount: 0,
    });

    await place.save();
    res.status(201).json(place);
  } catch (error) {
    console.error("CreatePlace Error:", error);
    res.status(500).json({ message: "Error creating place", error: error.message });
  }
};

// ------------------ GET ALL PLACES ------------------
export const getPlaces = async (req, res) => {
  try {
    const { travelStyle } = req.query;
    const query = travelStyle
      ? {
          $or: [
            { travelStyles: { $in: [travelStyle] } },
            { "thingsToDo.travelStyle": travelStyle },
            { "topAttractions.type": travelStyle },
            { "localCulture.travelStyle": travelStyle },
            { "localCuisine.travelStyle": travelStyle },
          ],
        }
      : {};
    const places = await Place.find(query);
    res.json(places);
  } catch (error) {
    console.error("GetPlaces Error:", error);
    res.status(500).json({ message: "Error fetching places", error: error.message });
  }
};

// ------------------ GET PLACE BY ID ------------------
export const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id).populate("hotels");

    if (!place) return res.status(404).json({ message: "Place not found" });

    const reviews = await Review.find({ placeId: place._id }).populate("user", "name");
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;

    res.json({ ...place.toObject(), reviews, reviewCount, averageRating });
  } catch (error) {
    console.error("GetPlaceById Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ SEARCH PLACES ------------------
export const searchPlaces = async (req, res) => {
  try {
    const { query } = req.params;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const places = await Place.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { "thingsToDo.title": { $regex: query, $options: "i" } },
        { "thingsToDo.description": { $regex: query, $options: "i" } },
      ],
    });
    res.json(places);
  } catch (error) {
    console.error("SearchPlaces Error:", error);
    res.status(500).json({ message: "Error searching places", error: error.message });
  }
};

// ------------------ UPDATE PLACE ------------------
export const updatePlace = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.mapLink) updateData.mapLink = req.body.mapLink;

    // TravelStyles
    if (req.body.travelStyles) {
      try {
        const validTravelStyles = ["City", "Food", "Temple", "Adventure"];
        let parsedStyles = typeof req.body.travelStyles === "string" ? JSON.parse(req.body.travelStyles) : req.body.travelStyles;
        updateData.travelStyles = parsedStyles.filter((style) => validTravelStyles.includes(style));
      } catch {
        updateData.travelStyles = [];
      }
    }

    // Address + Coordinates
    if (req.body.address) {
      const coords = await getCoordinatesFromAddress(req.body.address);
      updateData.location = {
        type: "Point",
        coordinates: coords || [0, 0],
        address: req.body.address,
      };
    }

    // Images
    if (req.files?.images) updateData.images = req.files.images.map((f) => `/uploads/${f.filename}`);

    // Update all other fields like topAttractions, thingsToDo, hotels, localCulture, localCuisine, travelTips, bestSeason
    const listFields = ["topAttractions", "thingsToDo","localCulture", "localCuisine", "travelTips"];
    listFields.forEach((field) => {
      if (req.body[field]) {
        try {
          const parsed = typeof req.body[field] === "string" ? JSON.parse(req.body[field]) : req.body[field];
          const files = req.files?.[`${field}Images`] || [];
          updateData[field] = parsed.map((item, i) => ({
            ...item,
            image: files[i] ? `/uploads/${files[i].filename}` : item.image || "",
          }));
        } catch {}
      }
    });

    // BestSeason
    if (req.body.bestSeason) {
      try {
        updateData.bestSeason = typeof req.body.bestSeason === "string" ? JSON.parse(req.body.bestSeason) : req.body.bestSeason;
      } catch {}
    }

    const place = await Place.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!place) return res.status(404).json({ message: "Place not found" });

    res.json(place);
  } catch (error) {
    console.error("UpdatePlace Error:", error);
    res.status(500).json({ message: "Error updating place", error: error.message });
  }
};

// ------------------ DELETE PLACE ------------------
export const deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    await Review.deleteMany({ placeId: req.params.id });
    res.json({ message: "Place and related reviews deleted successfully" });
  } catch (error) {
    console.error("DeletePlace Error:", error);
    res.status(500).json({ message: "Error deleting place", error: error.message });
  }
};

// ------------------ GET NEARBY PLACES ------------------
export const getNearbyPlaces = async (req, res) => {
  try {
    const { lng, lat, distance = 5000 } = req.query;
    if (!lng || !lat)
      return res.status(400).json({ message: "Longitude and latitude are required" });

    const places = await Place.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(distance),
        },
      },
    });

    res.json(places);
  } catch (error) {
    console.error("NearbyPlaces Error:", error);
    res.status(500).json({ message: "Error fetching nearby places", error: error.message });
  }
};

// ------------------ GET WEATHER FOR PLACE ------------------
export const getWeatherForPlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    const [lng, lat] = place.location.coordinates;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);

    place.weatherInfo = {
      temperature: response.data.main.temp,
      condition: response.data.weather[0].description,
      lastUpdated: new Date(),
    };
    await place.save();

    res.json(place.weatherInfo);
  } catch (error) {
    console.error("Weather Error:", error);
    res.status(500).json({ message: "Error fetching weather", error: error.message });
  }
};
export const getPlacesByTravelStyle = async (req, res) => {
  try {
    const { style } = req.params;
    if (!style) return res.status(400).json({ message: "Travel style is required" });

    const regex = new RegExp(`^${style}$`, "i");

    const places = await Place.find({
      $or: [
        { travelStyles: { $in: [regex] } },
        { "thingsToDo.travelStyle": regex },
        { "topAttractions.type": regex },
        { "localCulture.travelStyle": regex },
        { "localCuisine.travelStyle": regex },
      ],
    });

    const formattedPlaces = [];

    places.forEach((place) => {
      // If style is City, return everything
      if (regex.test("City") && style.toLowerCase() === "city") {
        formattedPlaces.push({
          category: "City",
          title: place.name,
          description: place.description || "",
          image: place.images?.[0] || "",
          thingsToDo: place.thingsToDo || [],
          topAttractions: place.topAttractions || [],
          localCulture: place.localCulture || [],
          localCuisine: place.localCuisine || [],
          hotels: place.hotels || [],
          location: place.location,
        });
        return; // skip further filtering
      }

      // For other styles, filter only relevant items
      if (place.travelStyles?.some((s) => regex.test(s))) {
        formattedPlaces.push({
          category: "Travel Style",
          title: place.name,
          description: place.description || "",
          image: place.images?.[0] || "",
          location: place.location,
        });
      }

      place.thingsToDo
        ?.filter((t) => regex.test(t.travelStyle))
        .forEach((t) => {
          formattedPlaces.push({
            category: "Things To Do",
            title: t.title || place.name,
            description: t.description || place.description || "",
            image: t.image || place.images?.[0] || "",
            location: place.location,
          });
        });

      place.topAttractions
        ?.filter((a) => regex.test(a.type))
        .forEach((a) => {
          formattedPlaces.push({
            category: a.type || "Top Attraction",
            title: a.name || place.name,
            description: a.description || place.description || "",
            image: a.image || place.images?.[0] || "",
            location: place.location,
          });
        });

      place.localCulture
        ?.filter((c) => regex.test(c.travelStyle))
        .forEach((c) => {
          formattedPlaces.push({
            category: "Local Culture",
            title: c.festival || place.name,
            description: c.description || place.description || "",
            image: c.image || place.images?.[0] || "",
            location: place.location,
          });
        });

      place.localCuisine
        ?.filter((c) => regex.test(c.travelStyle))
        .forEach((c) => {
          formattedPlaces.push({
            category: "Local Cuisine",
            title: c.dish || place.name,
            description: c.description || place.description || "",
            image: c.image || place.images?.[0] || "",
            location: place.location,
          });
        });
    });

    if (formattedPlaces.length === 0)
      return res.status(404).json({ message: "No places found for this travel style" });

    res.status(200).json(formattedPlaces);
  } catch (error) {
    console.error("getPlacesByTravelStyle Error:", error);
    res.status(500).json({
      message: "Error fetching places by travel style",
      error: error.message,
    });
  }
};



