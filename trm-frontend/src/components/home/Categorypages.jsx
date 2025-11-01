import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";
import { MapPin } from "lucide-react";

const CategoryPage = () => {
  const { category } = useParams(); // e.g., "temple", "food", "adventure"
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`http://localhost:4000/api/places/travel-style/${category}`);
        if (!res.ok) throw new Error("Failed to fetch places");

        const data = await res.json();
        setPlaces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching places:", err);
        setError("Something went wrong while fetching places.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [category]);

  const getTitle = (cat) => {
    const titles = {
      city: "City Adventures",
      temple: "Spiritual Temples",
      food: "Foodie Destinations",
      adventure: "Adventure Spots",
      culture: "Cultural Experiences",
    };
    return titles[cat.toLowerCase()] || `${cat.charAt(0).toUpperCase() + cat.slice(1)} Places`;
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 py-8 font-medium">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{getTitle(category)}</h1>

      {places.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place, index) => (
            <div
              key={`${place.title}-${index}`}
              className="bg-white shadow-lg rounded-2xl p-5 hover:shadow-xl transition cursor-pointer"
              onClick={() => navigate("/info", { state: { selectedItem: place, type: place.category } })}
            >
              {place.image && (
                <img
                  src={`http://localhost:4000${place.image}`}
                  alt={place.title}
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
              )}

              <h2 className="text-2xl font-semibold text-gray-800 mb-2 capitalize">{place.title}</h2>

              <p className="text-gray-600 mb-2 line-clamp-3">
                {place.description || "No description available."}
              </p>

              <div className="flex items-center text-sm text-gray-500 mt-2">
                <MapPin size={16} className="mr-1" />
                {place.location?.address || "Unknown location"}
              </div>

              <button
                className="mt-4 inline-block text-cyan-600 hover:underline font-medium"
                onClick={(e) => {
                  e.stopPropagation(); // prevent double navigate
                  navigate("/info", { state: { selectedItem: place, type: place.category } });
                }}
              >
                Read More →
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center text-lg">No places found for this category yet.</p>
      )}
    </div>
  );
};

export default CategoryPage;
