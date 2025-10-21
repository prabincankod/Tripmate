// src/pages/user/HomeRecommendationCard.jsx
import React from "react";

const HomeRecommendationCard = ({ rec, navigate }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition w-72 flex flex-col overflow-hidden cursor-pointer">
      
      {/* Image */}
      {rec.images?.length > 0 ? (
        <img
          src={`http://localhost:4000${rec.images[0]}`}
          alt={rec.name || rec.title}
          className="w-full h-40 object-cover"
          onClick={() => navigate("/info", { state: { selectedItem: rec, type: "Place" } })}
        />
      ) : (
        <div
          className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500"
          onClick={() => navigate("/info", { state: { selectedItem: rec, type: "Place" } })}
        >
          🏞️ No Image
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-lg font-semibold text-green-900 mb-1 hover:underline"
          onClick={() => navigate("/info", { state: { selectedItem: rec, type: "Place" } })}
        >
          {rec.name || rec.title}
        </h3>

        {rec.location && (
          <p className="text-sm text-gray-600 mb-2">
            {rec.location}, {rec.country || ""}
          </p>
        )}

        {rec.description && (
          <p className="text-sm text-gray-700 line-clamp-3 mb-3">{rec.description}</p>
        )}

        <button
          onClick={() => navigate("/info", { state: { selectedItem: rec, type: "Place" } })}
          className="mt-auto px-3 py-1 bg-green-900 text-white rounded hover:bg-green-700 transition text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default HomeRecommendationCard;

