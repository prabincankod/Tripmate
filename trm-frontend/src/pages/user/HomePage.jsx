// src/pages/home/Homepage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import FeaturesSection from "../../components/home/FeaturesSection";
import TravelInterest from "../../components/home/TravelInterest";
import PlaceList from "../../components/Place/PlaceList";
import Loader from "../../components/common/Loader";
import HomePackagesSection from "../../components/home/Hoempackage";
import NavBarLoggedIn from "../../components/common/Navbar1";
import RecommendationCard from "../../pages/explorepage/recommendation/recommendationCard"
import RecommendationsSection from "../explorepage/recommendation/RecommendationSection";

const Homepage = () => {
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [loading, setLoading] = useState(true);

  const [recommendations, setRecommendations] = useState([]);

  // Fetch places
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/places");
        const data = await res.json();
        setPlaces(data);
        setFilteredPlaces(data);
      } catch (err) {
        console.error("Error fetching places:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Fetch approved recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(
          "http://localhost:4000/api/recommendations?status=approved"
        );
        const data = await res.json();
        setRecommendations(data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };
    fetchRecommendations();
  }, []);

  const handleSelectTravelStyle = (style) => {
    setSelectedStyle(style);
    if (style) {
      setFilteredPlaces(
        places.filter((place) => place.travelStyles.includes(style))
      );
    } else {
      setFilteredPlaces(places);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full bg-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <NavBarLoggedIn />
      </div>

      {/* Page content */}
      <div className="pt-16">
        <div className="w-full py-10 bg-white">
          <FeaturesSection />
        </div>

        <div className="w-full py-10 bg-white">
          <TravelInterest onSelect={handleSelectTravelStyle} />
        </div>

        <div className="w-full py-10 bg-white">
          <HomePackagesSection />
        </div>

        {/* Places Section */}
        <div className="w-full py-10 px-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-green-800 mb-6">
            {selectedStyle
              ? `Explore ${selectedStyle} Places`
              : "Explore Popular Places"}
          </h2>
          {filteredPlaces.length > 0 ? (
            <PlaceList places={filteredPlaces} />
          ) : (
            <p className="text-gray-500 text-center">No places found.</p>
          )}
        </div>

        {/* Recommend a Place Button */}
        <div className="w-full py-10 px-6 max-w-7xl mx-auto flex flex-col items-center">
          <RecommendationsSection/>

          {/* Recommendations Cards */}
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec._id} rec={rec} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No recommendations yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;


