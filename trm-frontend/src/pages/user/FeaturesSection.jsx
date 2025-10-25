import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, StarHalf } from "lucide-react";

const FeaturesSection = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchFeaturedPlaces = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/featured-places"
        );
        setPlaces(data.places || []);
      } catch (err) {
        console.error(err);
        setError("Error fetching featured places");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPlaces();
  }, []);

  if (loading)
    return (
      <p className="text-center py-12 text-gray-600">
        Loading featured destinations...
      </p>
    );
  if (error)
    return <p className="text-center py-12 text-red-500">{error}</p>;
  if (!places.length)
    return (
      <p className="text-center py-12 text-gray-500">
        No featured destinations found.
      </p>
    );

  // Star Rating Component
  const StarRating = ({ rating }) => {
    const roundedRating = Math.round((rating || 0) * 2) / 2;
    const stars = Array.from({ length: 5 }, (_, i) => {
      if (i + 1 <= roundedRating) return "full";
      if (i + 0.5 === roundedRating) return "half";
      return "empty";
    });

    return (
      <div className="flex items-center mb-1">
        {stars.map((s, i) => {
          if (s === "full")
            return <Star key={i} className="text-yellow-400 w-4 h-4" />;
          if (s === "half")
            return <StarHalf key={i} className="text-yellow-400 w-4 h-4" />;
          return <Star key={i} className="text-gray-300 w-4 h-4" />;
        })}
        <span className="text-gray-700 text-sm ml-2">{rating?.toFixed(1)}</span>
      </div>
    );
  };

  // Card Component
  const Card = ({ item, type }) => {
    const previewText =
      item.description && item.description.length > 100
        ? item.description.slice(0, 100) + "..."
        : item.description || "";

    const imageSrc =
      item.image?.startsWith("http")
        ? item.image
        : item.image
        ? `http://localhost:4000${item.image}`
        : item.images?.[0]?.url
        ? item.images[0].url
        : item.images?.[0]
        ? `http://localhost:4000${item.images[0]}`
        : "/placeholder.png";

    return (
      <div
        className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition w-72 cursor-pointer flex-shrink-0"
        onClick={() => navigate("/info", { state: { selectedItem: item, type } })}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={item.name || item.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        )}

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-1">{item.name || item.title}</h3>

          {item.averageRating !== undefined && <StarRating rating={item.averageRating} />}

          <p className="text-gray-700 text-sm leading-relaxed flex-1">{previewText}</p>
        </div>
      </div>
    );
  };

  // Determine padding to center 1, 2, or 3 cards
  const getPadding = (total) => {
    if (total === 1) return "50%";
    if (total === 2) return "25%";
    if (total === 3) return "12.5%";
    return "0";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-green-900 text-center mb-8">
        Featured Destinations
      </h2>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-scroll scrollbar-hide py-2"
        style={{
          paddingLeft: getPadding(places.length),
          paddingRight: getPadding(places.length),
        }}
      >
        {places.map((place) => (
          <Card key={place._id} item={place} type="Place" />
        ))}
      </div>

      {/* Hotels Section */}
      {places.map(
        (place) =>
          place.hotels?.length > 0 && (
            <div key={place._id} className="mb-12 mt-8">
              <h3 className="text-2xl font-bold text-green-900 mb-4">
                Top Hotels in {place.name}
              </h3>
              <div
                className="flex gap-6 overflow-x-scroll scrollbar-hide py-2"
                style={{
                  paddingLeft: getPadding(place.hotels.length),
                  paddingRight: getPadding(place.hotels.length),
                }}
              >
                {place.hotels.map((hotel) => (
                  <Card key={hotel._id} item={hotel} type="Hotel" />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default FeaturesSection;






