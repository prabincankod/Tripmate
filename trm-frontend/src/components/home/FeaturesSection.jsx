import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, StarHalf, Star as StarEmpty } from "lucide-react";

const FeaturesSection = () => {
  const [places, setPlaces] = useState([]);
  const [topHotels, setTopHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/featured-places");
        setPlaces(data.places || []);
        setTopHotels(data.topHotels || []);
      } catch (err) {
        console.error(err);
        setError("Error fetching featured destinations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <p className="text-center py-12 text-gray-600">
        Loading featured destinations...
      </p>
    );
  if (error)
    return <p className="text-center py-12 text-red-500">{error}</p>;
  if (!places.length && !topHotels.length)
    return (
      <p className="text-center py-12 text-gray-500">
        No featured destinations found.
      </p>
    );

  const Card = ({ image, title, description, data, type, rating, reviews }) => {
    const shortDesc =
      description && description.length > 80
        ? description.slice(0, 80) + "..."
        : description || "";

    const roundedRating = Math.round((rating ?? 0) * 2) / 2;
    const stars = Array.from({ length: 5 }, (_, i) => {
      if (i + 1 <= roundedRating) return "full";
      if (i + 0.5 === roundedRating) return "half";
      return "empty";
    });

    return (
      <div
        className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer w-full max-w-[300px]"
        onClick={() => {
          if (type === "Place") navigate(`/places/${data._id}`);
          else if (type === "Hotel")
            navigate("/info", { state: { selectedItem: data, type } });
        }}
      >
        {image && (
          <img
            src={`http://localhost:4000${image}`}
            alt={title}
            className="w-full h-40 object-cover rounded-t-xl"
          />
        )}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-md font-semibold mb-1">{title}</h3>

          <div className="flex items-center mb-1">
            {stars.map((s, i) => {
              if (s === "full")
                return <Star key={i} className="text-yellow-400 w-3.5 h-3.5" />;
              if (s === "half")
                return <StarHalf key={i} className="text-yellow-400 w-3.5 h-3.5" />;
              return <StarEmpty key={i} className="text-gray-300 w-3.5 h-3.5" />;
            })}
            <span className="text-gray-700 text-xs ml-1">{(rating ?? 0).toFixed(1)}</span>
            {reviews !== undefined && (
              <span className="text-gray-500 text-xs ml-1">({reviews})</span>
            )}
          </div>

          <p className="text-gray-700 text-sm leading-snug">
            {shortDesc}{" "}
            {description && description.length > 80 && (
              <span
                className="text-blue-700 hover:text-gray-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (type === "Place") navigate(`/places/${data._id}`);
                  else if (type === "Hotel")
                    navigate("/info", { state: { selectedItem: data, type } });
                }}
              >
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
      <h2 className="text-2xl sm:text-3xl font-bold text-green-900 text-center mb-6">
        Featured Destinations
      </h2>

      {/* Place Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
        {places.map((place) => (
          <Card
            key={place._id}
            image={place.images?.[0]}
            title={place.name}
            description={place.description}
            data={place}
            type="Place"
            rating={place.averageRating}
            reviews={place.reviewCount}
          />
        ))}
      </div>

      {/* Top Hotels Section */}
      {topHotels.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-green-900 mb-3 text-center">
            Top Hotels in Nepal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {topHotels.map((hotel) => (
              <Card
                key={hotel._id}
                image={hotel.image}
                title={hotel.name}
                description={hotel.description || ""}
                data={hotel}
                type="Hotel"
                rating={hotel.averageRating ?? 0}
                reviews={hotel.reviewCount ?? 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesSection;









