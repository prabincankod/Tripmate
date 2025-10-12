// src/components/places/PlaceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SavePlaceButton from "../TravelJourney/Card/Saveplace";
import { Star, MapPin, Cloud, ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../common/Loader";
import MapView from "./Mapview";
import ReviewSection from "./ReviewSection";

import "leaflet/dist/leaflet.css";

const PlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState(null);

  // Fetch place data
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/places/${id}`);
        const data = await res.json();
        setPlace(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  // Fetch weather
  useEffect(() => {
    if (!place?.location?.coordinates) return;

    const fetchWeather = async () => {
      const [lng, lat] = place.location.coordinates;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${process.env.REACT_APP_OPENWEATHER_KEY}`
        );
        const data = await res.json();
        setWeatherInfo({
          temperature: data.main.temp,
          condition: data.weather[0].description,
        });
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };
    fetchWeather();
  }, [place]);

  // Check if place is saved
  useEffect(() => {
    if (!place) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const checkSaved = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/journey/is-saved/${place._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setIsSaved(data.isSaved);
      } catch (err) {
        console.error(err);
      }
    };
    checkSaved();
  }, [place]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader />
      </div>
    );

  if (!place) return <p className="text-center mt-10">Place not found</p>;

  const nextImage = () =>
    setCurrentImage((prev) =>
      prev === place.images.length - 1 ? 0 : prev + 1
    );
  const prevImage = () =>
    setCurrentImage((prev) =>
      prev === 0 ? place.images.length - 1 : prev - 1
    );

  // Card Component
  const Card = ({ image, title, description, data, type }) => {
    const navigate = useNavigate();

    const previewText =
      description && description.length > 100
        ? description.slice(0, 100) + "..."
        : description;

    return (
      <div className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition w-full max-w-xs">
        {image && (
          <img
            src={`http://localhost:4000${image}`}
            alt={title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        )}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed flex-1">
            {previewText}{" "}
            {description && description.length > 100 && (
              <span
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => navigate("/info", { state: { selectedItem: data, type } })}
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
    <div className="relative">
      {/* Hero section */}
      <div className="relative h-[450px] w-full">
        {place.images?.length > 0 ? (
          <img
            src={`http://localhost:4000${place.images[currentImage]}`}
            alt={place.name}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            No Image
          </div>
        )}

        {place.images?.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
            >
              <ChevronRight />
            </button>
          </>
        )}

        <SavePlaceButton
          place={place}
          onChange={(saved) => setIsSaved(saved)}
        />

        {/* Place Rating on top-right */}
        {place.averageRating && (
          <div className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg z-10">
            <Star className="text-yellow-400" />
            <span className="font-semibold">
              {place.averageRating?.toFixed(1)} ({place.reviewCount || 0})
            </span>
          </div>
        )}

        <div className="absolute bottom-8 left-8 text-white z-10">
          <h1 className="text-4xl font-bold">{place.name}</h1>
          {weatherInfo && (
            <div className="flex items-center gap-1 mt-2">
              <Cloud /> {weatherInfo.temperature}°C, {weatherInfo.condition}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <MapPin />
            <span>{place.address}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6 -mt-16 relative z-20 bg-white rounded-t-3xl shadow-lg p-6 max-w-6xl mx-auto">
        {/* Left Content */}
        <div className="flex-1 space-y-6">
          <p className="text-gray-700 leading-relaxed">{place.description}</p>

          {/* Top Attractions */}
          {place.topAttractions?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Top Attractions</h2>
              <div className="flex flex-wrap gap-4">
                {place.topAttractions.map((attr, i) => (
                  <Card
                    key={i}
                    image={attr.image}
                    title={attr.name}
                    description={attr.description || ""}
                    data={attr}
                    type="Attraction"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Things To Do */}
          {place.thingsToDo?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Things To Do</h2>
              <div className="flex flex-wrap gap-4">
                {place.thingsToDo.map((todo, i) => (
                  <Card
                    key={i}
                    image={todo.image}
                    title={todo.title}
                    description={todo.description || ""}
                    data={todo}
                    type="ThingsToDo"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hotels */}
          {place.hotels?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Hotels</h2>
              <div className="flex flex-wrap gap-4">
                {place.hotels.map((hotel, i) => (
                  <Card
                    key={i}
                    image={hotel.image}
                    title={hotel.name}
                    description={hotel.description || ""}
                    data={hotel}
                    type="Hotel"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Local Culture */}
          {place.localCulture?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Local Culture</h2>
              <div className="flex flex-wrap gap-4">
                {place.localCulture.map((culture, i) => (
                  <Card
                    key={i}
                    image={culture.image}
                    title={culture.festival}
                    description={culture.description || ""}
                    data={culture}
                    type="LocalCulture"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Local Cuisine */}
          {place.localCuisine?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Local Cuisine</h2>
              <div className="flex flex-wrap gap-4">
                {place.localCuisine.map((cuisine, i) => (
                  <Card
                    key={i}
                    image={cuisine.image}
                    title={cuisine.dish}
                    description={cuisine.description || ""}
                    data={cuisine}
                    type="Cuisine"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Best Season */}
          {place.bestSeason?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Best Seasons to Visit</h2>
              <div className="flex flex-wrap gap-2">
                {place.bestSeason.map((seasonObj, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {seasonObj.season}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Travel Tips */}
          {place.travelTips?.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Travel Tips</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {place.travelTips.map((tip, i) => (
                  <li key={i}>{tip.title || tip.description}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Plan Trip Card */}
          <div
            onClick={() =>
              navigate("/journey", {
                state: { selectedPlace: place, scrollToNextTrip: true },
              })
            }
            className="mb-8 p-4 border rounded-xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition"
          >
            <div className=" text-white p-3 rounded-full text-xl flex items-center justify-center"></div>
            <div>
              <h3 className="text-lg font-bold text-green-900">
                Plan Your Next Trip ?{" "}
              </h3>
              <p className="text-gray-600 text-sm">Click here to plantrip.</p>
            </div>
          </div>

          {/* Place Reviews */}
          <div className="mt-12">
            <h2 className="text-3xl font-extrabold mb-2 text-gray-900 border-b-4 border-green-500 inline-block pb-1">
              Let's See What Our Travelers Say
            </h2>
            <p className="text-gray-600 mb-6">
              Hear from fellow travelers who’ve explored this place.
            </p>
            <ReviewSection type="place" itemId={place._id} />
          </div>
        </div>

        {/* Right: Map Sidebar */}
        {place.location?.coordinates?.length === 2 && (
          <div className="w-full lg:w-1/3 h-80 rounded-xl overflow-hidden shadow-md">
            <MapView
              lat={place.location.coordinates[1]}
              long={place.location.coordinates[0]}
              locationName={place.name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;
