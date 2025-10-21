// src/pages/user/HomeRecommendation.jsx
import React, { useState, useEffect } from "react";
import api from "../../utils/apiUtiles";
import Loader from "../../components/common/Loader";
import HomeRecommendationCard from "./HomeRecommendationCard";
import { useNavigate } from "react-router-dom";

const HomeRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/place-recommendations/home", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.recommendations)) {
          setRecommendations(res.data.recommendations);
        }
      } catch (err) {
        console.error("Error fetching home recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <Loader />;

  if (!recommendations.length)
    return (
      <p className="text-center text-gray-500 py-10">
        No recommendations available.
      </p>
    );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-bold text-green-900 mb-6 text-center">
        Recommended for You
      </h2>

      <div className="flex flex-wrap gap-6 justify-center">
        {recommendations.map((rec) => (
          <HomeRecommendationCard
            key={rec._id}
            rec={rec}
            navigate={navigate}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeRecommendation;
