import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";

const PlaceCard = ({ place, type = "Place" }) => {
  return (
    <div className="border rounded-xl shadow hover:shadow-lg overflow-hidden relative">
      <img
        src={place.images?.length ? `http://localhost:4000${place.images[0]}` : "/no-image.jpg"}
        alt={place.name}
        className="w-full h-48 object-cover"
      />

      {/* Show rating only for hotels */}
      {type === "Hotel" && place.averageRating !== undefined && (
        <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded flex items-center gap-1 shadow">
          <Star className="text-yellow-400 w-4 h-4" />
          <span className="text-sm font-semibold">{place.averageRating.toFixed(1)}</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xl font-semibold">{place.name}</h3>
        <p className="text-gray-600 line-clamp-2">{place.description}</p>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <MapPin size={16} className="mr-1" />
          {place.location?.address || "Unknown location"}
        </div>
        <Link
          to={type === "Hotel" ? `/hotels/${place._id}` : `/places/${place._id}`}
          className="mt-3 inline-block text-cyan-600 hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default PlaceCard;

