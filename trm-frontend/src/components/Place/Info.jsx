import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ReviewSection from "./ReviewSection";
import MapView from "./Mapview"

const Info = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItem, type } = location.state || {};

  console.log(location.state)
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!selectedItem) 
    return <p className="text-center mt-10">No data available</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <button
        className="mb-6 p-3 rounded-full bg-black text-white hover:bg-gray-800 transition flex items-center justify-center"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6">
        {selectedItem.name || selectedItem.title || selectedItem.dish || selectedItem.festival}
      </h1>

      {/* Image */}
      {selectedItem.image && (
        <img
          src={`http://localhost:4000${selectedItem.image}`}
          alt={selectedItem.name || selectedItem.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      {/* Description + Sticky Map */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Description */}
        <div className="flex-1 text-gray-700 space-y-4">
          {selectedItem.description && <p>{selectedItem.description}</p>}
          {selectedItem.comment && <p>{selectedItem.comment}</p>}

          {/* Conditional Info by Type */}
          {type === "Hotel" && (
            <>
              {selectedItem.amenities?.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">Amenities:</h2>
                  <ul className="list-disc list-inside">
                    {selectedItem.amenities.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItem.roomFeatures?.length > 0 && (
                <div>
                  <h2 className="font-semibold mb-2">Room Features:</h2>
                  <ul className="list-disc list-inside">
                    {selectedItem.roomFeatures.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hotel Reviews */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-green-500 inline-block pb-1">
                  Reviews for {selectedItem.name}
                </h2>
                <ReviewSection type="hotel" itemId={selectedItem._id} />
              </div>
            </>
          )}

          {["ThingsToDo", "Attraction", "LocalCulture", "Cuisine"].includes(type) && selectedItem.description && (
            <p>{selectedItem.description}</p>
          )}
        </div>

        {/* Sticky Map */}
        {selectedItem.location?.coordinates?.length === 2 && (
          <div className="w-full lg:w-96 h-64 lg:h-[400px] rounded-lg shadow-lg overflow-hidden border sticky top-24">
            <MapView
              lat={selectedItem.location.coordinates[1]}
              long={selectedItem.location.coordinates[0]}
              locationName={selectedItem.name || selectedItem.title}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Info;

