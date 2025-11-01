// src/components/recommendation/RecommendationCard.jsx
import React, { useState } from "react";

const RecommendationCard = ({ rec }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Recommendation Card */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition w-80 flex flex-col overflow-hidden">
        
        {/* User Info */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-lg font-bold text-green-800">
            {rec.recommendedBy?.name ? rec.recommendedBy.name[0] : "T"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {rec.recommendedBy?.name || "Traveler"}
            </p>
            <p className="text-xs text-gray-600">{rec.credentials}</p>
          </div>
        </div>

        {/* Place Image */}
        {rec.images?.length > 0 ? (
          <img
            src={`http://localhost:4000${rec.images[0]}`}
            alt={rec.placeName}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
            🏞️
          </div>
        )}

        {/* Place Info */}
        <div className="flex-1 p-3 flex flex-col">
          <h3 className="text-lg font-semibold text-green-900">{rec.placeName}</h3>
          <p className="text-sm text-gray-600 mb-1">{rec.location}, {rec.country}</p>
          {rec.description && (
            <p className="text-sm text-gray-700 line-clamp-3 mb-2">{rec.description}</p>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="mt-auto px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Dialog-Style Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative">

            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 text-2xl font-bold hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>

            <div className="flex flex-col gap-4 p-6">

              {/* Main Image */}
              {rec.images?.[0] && (
                <img
                  src={`http://localhost:4000${rec.images[0]}`}
                  alt={rec.placeName}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {/* Place Name & Location */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <h2 className="text-xl font-bold text-green-900">{rec.placeName}</h2>
                  <p className="text-gray-600 text-sm">{rec.location}, {rec.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">
                    Recommended by: <strong>{rec.recommendedBy?.name || "Traveler"}</strong>
                  </p>
                  <p className="text-xs text-gray-500">{rec.credentials}</p>
                </div>
              </div>

              {/* Description */}
              {rec.description && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
                  <p className="text-gray-700">{rec.description}</p>
                </div>
              )}

              {/* Highlights */}
              {rec.highlights?.length > 0 && (
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <h3 className="font-semibold text-green-900 mb-1">Highlights</h3>
                  <div className="flex flex-wrap gap-1">
                    {rec.highlights.map((h, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Tips */}
              {rec.travelTips && (
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <h3 className="font-semibold text-green-900 mb-1">Travel Tips</h3>
                  <p className="text-gray-700">{rec.travelTips}</p>
                </div>
              )}

              {/* Other Info Grid */}
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                {rec.bestTimeToVisit && (
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <strong>Best Time:</strong> {rec.bestTimeToVisit}
                  </div>
                )}
                {rec.culturalInfo && (
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <strong>Cultural Info:</strong> {rec.culturalInfo}
                  </div>
                )}
                {rec.reason && (
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <strong>Reason:</strong> {rec.reason}
                  </div>
                )}
                {rec.experience && (
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <strong>Experience:</strong> {rec.experience}
                  </div>
                )}
              </div>

              {/* Images Grid (wrap instead of horizontal scroll) */}
              {rec.images?.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
                  {rec.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:4000${img}`}
                      alt={`img-${idx}`}
                      className="h-24 w-full object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                      onClick={() => window.open(`http://localhost:4000${img}`, "_blank")}
                    />
                  ))}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="mt-2 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecommendationCard;








