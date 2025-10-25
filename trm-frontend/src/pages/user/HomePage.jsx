// src/pages/user/Homepage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeaturesSection from "../../components/home/FeaturesSection";
import TravelInterest from "../../components/home/TravelInterest";
import Loader from "../../components/common/Loader";
import HomePackagesSection from "../../components/home/Hoempackage";
import NavBarLoggedIn from "../../components/common/Navbar1";
import RecommendationsSection from "../../pages/explorepage/recommendation/RecommendationSection";
import HomeRecommendationsSection from "./HomeRecommendation.jsx";
import TravelBlogsSection from "./TravelBlog";
import api from "../../utils/apiUtiles";

const Homepage = () => {
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [homeRecommendations, setHomeRecommendations] = useState({});

  // -------------------- Fetch Places --------------------
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

  // -------------------- Fetch Blogs --------------------
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/blogs");
        const data = await res.json();
        setBlogs(data.data || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  // -------------------- Fetch Home Recommendations --------------------
  useEffect(() => {
    const fetchHomeRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/place-recommendations/home", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.recommendations) {
          setHomeRecommendations(res.data.recommendations);
        }
      } catch (err) {
        console.error("Error fetching home recommendations:", err);
      }
    };

    fetchHomeRecommendations();
  }, []);

  // -------------------- Handle Travel Style Filter --------------------
  const handleSelectTravelStyle = (style) => {
    setSelectedStyle(style);

    if (style) {
      setFilteredPlaces(
        places.filter((place) => place.travelStyles.includes(style))
      );

      setHomeRecommendations((prev) => {
        const filtered = {};
        Object.keys(prev).forEach((category) => {
          filtered[category] = prev[category].filter((rec) =>
            rec.travelStyles?.includes(style)
          );
        });
        return filtered;
      });
    } else {
      setFilteredPlaces(places);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="w-full bg-white text-gray-800">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        <NavBarLoggedIn />
      </div>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Features Section */}
          <div className="mb-8">
            <FeaturesSection />
          </div>

          {/* Travel Interest Selection */}
          <div className="mb-8">
            <TravelInterest onSelect={handleSelectTravelStyle} />
          </div>

          {/* Existing Recommendations */}
          <div className="mb-8">
            <RecommendationsSection />
          </div>

          {/* Home Recommendations Section */}
          <div className="mb-8">
            <HomeRecommendationsSection
              recommendations={homeRecommendations}
              navigate={navigate}
            />
          </div>

          {/* Home Packages Section */}
          <div className="mb-8">
            <HomePackagesSection />
          </div>

          {/* Travel Blogs Section */}
          <div className="mb-8">
            <TravelBlogsSection blogs={blogs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;



