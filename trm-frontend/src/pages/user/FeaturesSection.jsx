import React, { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturesSection = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedPlaces = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/featured-places/features-places"
        );
        setPlaces(data);
      } catch (err) {
        setError("Error fetching featured places");
        console.error("Error fetching featured places:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPlaces();
  }, []);

  if (loading)
    return (
      <p className="text-center py-10 text-gray-600">
        Loading featured destinations...
      </p>
    );
  if (error)
    return (
      <p className="text-center py-10 text-red-500">{error}</p>
    );
  if (!places.length)
    return (
      <p className="text-center py-10 text-gray-500">
        No featured destinations found.
      </p>
    );

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-green-900 text-center mb-6">
          Featured Destinations
        </h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {places.map((place) => {
            const avgRating = place.hotels?.length
              ? (
                  place.hotels.reduce((sum, h) => sum + (h.averageRating || 0), 0) /
                  place.hotels.length
                ).toFixed(1)
              : "N/A";

            const reviewCount =
              place.hotels?.reduce((sum, h) => sum + (h.totalReviews || 0), 0) ||
              0;

            return (
              <div
                key={place._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md overflow-hidden transition cursor-pointer flex flex-col"
                onClick={() => navigate(`/places/${place._id}`)}
              >
                <img
                  src={place.images?.[0] || "https://via.placeholder.com/400x200?text=No+Image"}
                  alt={place.name}
                  className="h-40 w-full object-cover"
                />
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-md font-semibold text-green-900 mb-1 truncate">
                    {place.name}
                  </h3>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                    {place.description || "No description available"}
                  </p>
                  <div className="flex items-center mt-auto">
                    <Star className="text-yellow-400 w-4 h-4 fill-yellow-400" />
                    <span className="ml-1 font-medium text-gray-700 text-sm">{avgRating}</span>
                    <span className="ml-2 text-gray-500 text-xs">({reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;




