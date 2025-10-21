// src/components/home/RecommendationsSection.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/apiUtiles";
import Loader from "../../../components/common/Loader";
import RecommendationCard from "./recommendationCard"

const RecommendationsSection = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // ✅ Correct backend route
        const response = await api.get("/admin/recommendations/approved");
        setRecommendations(response.data.recommendations || []);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-green-900 mb-4 sm:mb-0">
          Traveler Recommendations
        </h2>
        <button
          onClick={() => navigate("/recommendation")}
          className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
        >
          Recommend a Place
        </button>
      </div>

      {/* Loading / Empty / Cards */}
      {loading ? (
        <Loader />
      ) : recommendations.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No recommendations yet. Be the first to recommend a place!
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec._id} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsSection;

