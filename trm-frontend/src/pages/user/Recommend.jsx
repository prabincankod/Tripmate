// src/components/home/RecommendationsSection.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";

const RecommendationsSection = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Fetch approved recommendations for everyone
        const res = await fetch(
          "http://localhost:4000/api/recommendations?status=approved"
        );
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <Loader />;

  if (!recommendations.length)
    return (
      <div className="text-center py-6 text-gray-500">
        No recommendations yet. Start exploring!
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto py-10 w-full">
      <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">
        Recommended for You
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map((place) => (
          <div
            key={place._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3 flex flex-col"
          >
            {place.images?.[0] ? (
              <img
                src={`http://localhost:4000${place.images[0]}`}
                alt={place.placeName}
                className="w-full h-44 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-44 bg-gray-200 flex items-center justify-center text-gray-600 mb-3">
                🏞️ No Image
              </div>
            )}

            <h3 className="text-lg font-semibold text-green-800">
              {place.placeName}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              {place.location || "Unknown Location"}
            </p>

            <button
              onClick={() => navigate(`/places/${place._id}`)}
              className="mt-auto bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;

