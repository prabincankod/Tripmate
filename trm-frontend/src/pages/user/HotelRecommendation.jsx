import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HotelRecommendation = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    requestLocationAndFetchHotels();
  }, []);

  const requestLocationAndFetchHotels = () => {
    if (!navigator.geolocation) {
      fetchFallbackHotels();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchNearbyHotels(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation denied or unavailable:", error.message);
        fetchFallbackHotels();
      }
    );
  };

  const fetchNearbyHotels = async (lat, lon) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/api/hotels/recommend-hotel", {
        lat,
        lon,
        radius: 9000, // 9 km
      });

      if (res.data.hotels && res.data.hotels.length > 0) {
        setHotels(res.data.hotels);
      } else {
        fetchFallbackHotels();
      }
    } catch (err) {
      console.error("Error fetching nearby hotels:", err);
      fetchFallbackHotels();
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackHotels = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/hotels");
      const topHotels = res.data
        .sort((a, b) => (b.ratings?.overall || 0) - (a.ratings?.overall || 0))
        .slice(0, 5);
      setHotels(topHotels);
    } catch (err) {
      console.error("Error fetching fallback hotels:", err);
    } finally {
      setLoading(false);
    }
  };

  const Card = ({ hotel }) => {
    const imageSrc = hotel.photo
      ? `http://localhost:4000${hotel.photo}`
      : hotel.image
      ? `http://localhost:4000${hotel.image}`
      : "/placeholder.png";

    const previewDescription =
      hotel.description && hotel.description.length > 100
        ? hotel.description.slice(0, 100) + "..."
        : hotel.description || "";

    return (
      <div
        className="w-72 flex-shrink-0 rounded-xl shadow-md hover:shadow-xl cursor-pointer overflow-hidden bg-white"
        onClick={() =>
          navigate("/info", { state: { selectedItem: hotel, type: "Hotel" } })
        }
      >
        <img src={imageSrc} alt={hotel.name} className="w-full h-48 object-cover" />
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{hotel.address}</p>
          <p className="text-gray-700 text-sm">
            {previewDescription}{" "}
            <span className="text-blue-600 font-semibold">Read More</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Nearby Hotels</h2>

      {loading && <p>Loading hotels...</p>}
      {!loading && hotels.length === 0 && <p>No hotels found.</p>}

      <div className="flex gap-4 overflow-x-scroll scrollbar-hide py-2">
        {hotels.map((hotel) => (
          <Card key={hotel._id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
};

export default HotelRecommendation;

