import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, StarHalf, Star as StarEmpty } from "lucide-react";

const FeaturesSection = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  // Card Component
  const Card = ({ image, title, description, id, type, rating, reviews }) => {
    const previewText =
      description && description.length > 100
        ? description.slice(0, 100) + "..."
        : description;

    // Round rating to nearest 0.5 for half stars
    const roundedRating = Math.round((rating || 0) * 2) / 2;

    // Create array for 5 stars
    const stars = Array.from({ length: 5 }, (_, i) => {
      if (i + 1 <= roundedRating) return "full";
      if (i + 0.5 === roundedRating) return "half";
      return "empty";
    });

    return (
      <div
        className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition w-full max-w-xs cursor-pointer"
        onClick={() => {
          if (type === "Place") navigate(`/places/${id}`);
          else if (type === "Hotel")
            navigate("/info", { state: { selectedItem: { id, type } } });
        }}
      >
        {image && (
          <img
            src={`http://localhost:4000${image}`}
            alt={title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        )}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>

          {/* Star Rating */}
          {rating !== undefined && (
            <div className="flex items-center mb-2">
              {stars.map((s, i) => {
                if (s === "full")
                  return <Star key={i} className="text-yellow-400 w-4 h-4" />;
                if (s === "half")
                  return <StarHalf key={i} className="text-yellow-400 w-4 h-4" />;
                return <StarEmpty key={i} className="text-gray-300 w-4 h-4" />;
              })}
              <span className="text-gray-700 text-sm ml-2">{rating?.toFixed(1)}</span>
              {reviews && (
                <span className="text-gray-600 text-sm ml-2">
                  ({reviews} reviews)
                </span>
              )}
            </div>
          )}

          <p className="text-gray-700 text-sm leading-relaxed flex-1">
            {previewText}{" "}
            {description && description.length > 100 && (
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">
                Read More
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-green-900 text-center mb-8">
        Featured Destinations
      </h2>

      {/* Place Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {places.map((place) => (
          <Card
            key={place._id}
            image={place.images?.[0]}
            title={place.name}
            description={place.description || ""}
            id={place._id}
            type="Place"
            rating={place.rating}
            reviews={place.reviews}
          />
        ))}
      </div>

      {/* Hotels Section */}
      {places.map((place) => (
        <div key={place._id} className="mb-12">
          {place.hotels?.length > 0 && (
            <>
              <h3 className="text-2xl font-bold text-green-900 mb-4">
                Top Hotels in {place.name}
              </h3>
              <div className="flex flex-wrap gap-4">
                {place.hotels.map((hotel) => (
                  <Card
                    key={hotel._id}
                    image={hotel.image}
                    title={hotel.name}
                    description={hotel.description || ""}
                    id={hotel._id}
                    type="Hotel"
                    rating={hotel.rating}
                    reviews={hotel.reviews}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeaturesSection;

