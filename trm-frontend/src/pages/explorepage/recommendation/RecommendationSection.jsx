import React from "react";
import { useNavigate } from "react-router-dom";

const RecommendationsSection = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">
          Traveler Recommendations
        </h2>
        <button
          onClick={() => navigate("/recommendation")}
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
        >
          Recommend a Place
        </button>
      </div>

      {/* Here you can render the latest recommendations cards */}
      <p className="text-gray-500">No recommendations yet.</p>
    </div>
  );
};

export default RecommendationsSection; // ✅ must have default export


