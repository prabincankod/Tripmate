import React, { useRef } from "react";
import HomeRecommendationCard from "./HomeRecommendationCard";

const categoryTitles = {
  City: "Explore Beautiful Cities",
  Food: "Delicious Foods You’ll Love",
  Temple: "Peaceful Temples & Heritage Sites",
  Adventure: "Adventure Spots",
};

const HomeRecommendationsSection = ({ recommendations, navigate }) => {
  if (!recommendations || Object.keys(recommendations).length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        No recommendations available.
      </p>
    );
  }

  const extractCategoryItems = (category, items) => {
    let extracted = [];

    items.forEach((place) => {
      if (!place) return;

      switch (category.toLowerCase()) {
        case "food":
          if (Array.isArray(place.localCuisine)) {
            extracted.push(
              ...place.localCuisine.map((c) => ({
                ...c,
                parentPlace: place.name,
                type: "Food",
              }))
            );
          }
          break;

        case "temple":
          if (Array.isArray(place.topAttractions)) {
            extracted.push(
              ...place.topAttractions
                .filter((t) => t.type === "Temple")
                .map((t) => ({
                  ...t,
                  parentPlace: place.name,
                  type: "Temple",
                }))
            );
          }
          break;

        case "adventure":
          if (Array.isArray(place.thingsToDo)) {
            extracted.push(
              ...place.thingsToDo
                .filter((t) => t.travelStyle === "Adventure")
                .map((t) => ({
                  ...t,
                  parentPlace: place.name,
                  type: "Adventure",
                }))
            );
          }
          break;

        case "city":
        default:
          extracted.push({
            ...place,
            type: "City",
          });
          break;
      }
    });

    return extracted;
  };

  const scrollRef = useRef({}); // per-category refs

  const scroll = (category, direction) => {
    const ref = scrollRef.current[category];
    if (!ref) return;
    const scrollAmount = 300;
    ref.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-bold text-green-900 mb-8 text-center">
        Recommended for You
      </h2>

      {Object.entries(recommendations).map(([category, items]) => {
        const filteredItems = extractCategoryItems(category, items);
        if (!filteredItems.length) return null;

        const totalCards = filteredItems.length;

        // Calculate padding for centering 1, 2, 3 cards
        let paddingLeftRight = "0";
        let transformStyle = "none";
        if (totalCards === 1) {
          paddingLeftRight = "50%";
          transformStyle = "translateX(-50%)";
        } else if (totalCards === 2) {
          paddingLeftRight = "25%";
        } else if (totalCards === 3) {
          paddingLeftRight = "12.5%";
        }

        return (
          <div key={category} className="mb-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
              {categoryTitles[category] || category}
            </h3>

            <div className="relative">
              {/* Scroll Arrows */}
              <button
                onClick={() => scroll(category, "left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
              >
                &#8592;
              </button>
              <button
                onClick={() => scroll(category, "right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
              >
                &#8594;
              </button>

              {/* Scrollable cards */}
              <div
                ref={(el) => (scrollRef.current[category] = el)}
                className="flex gap-6 overflow-x-scroll scrollbar-hide py-2"
                style={{
                  paddingLeft: paddingLeftRight,
                  paddingRight: paddingLeftRight,
                  transform: transformStyle,
                }}
              >
                {filteredItems.map((rec, i) => (
                  <HomeRecommendationCard
                    key={rec._id || rec.name || i}
                    rec={rec}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default HomeRecommendationsSection;

