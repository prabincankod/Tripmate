import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeaturesSection from "../../components/home/FeaturesSection";
import TravelInterest from "../../components/home/TravelInterest";
import Loader from "../../components/common/Loader";
import HomePackagesSection from "../../components/home/Hoempackage";
import NavBarLoggedIn from "../../components/common/Navbar1";
import RecommendationsSection from "../../pages/explorepage/recommendation/RecommendationSection";
import HomeRecommendationsSection from "./HomeRecommendation" // ✅ New section
import TravelBlogsSection from "./TravelBlog"; // ✅ Correct import

const Homepage = () => {
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);

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

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/blogs");
        const data = await res.json();
        setBlogs(data.data); // ✅ Fix here
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
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
    <div className="w-full bg-white text-gray-800">
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        <NavBarLoggedIn />
      </div>

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <FeaturesSection />
          <TravelInterest onSelect={handleSelectTravelStyle} />

          {/* Existing Recommendations */}
          <RecommendationsSection />

          {/* New Home Recommendations Section */}
          <HomeRecommendationsSection />

          <HomePackagesSection />
          <TravelBlogsSection blogs={blogs} />
        </div>
      </div>
    </div>
  );
};

export default Homepage;

