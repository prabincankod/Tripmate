import React from "react";

const HomeRecommendationCard = ({ rec, navigate }) => {
  const title = rec.name || rec.dish || rec.title || "Untitled";
  const description = rec.description || "No description available.";

  const backendBaseUrl = "http://localhost:4000";

  const imageSrc = rec.image?.startsWith("http")
    ? rec.image
    : rec.image
    ? `${backendBaseUrl}${rec.image}`
    : rec.images?.[0]?.url
    ? rec.images[0].url
    : rec.images?.[0]?.startsWith("http")
    ? rec.images[0]
    : rec.images?.[0]
    ? `${backendBaseUrl}${rec.images[0]}`
    : "/placeholder.png";

  const truncatedDescription =
    description.length > 120 ? description.slice(0, 120) + "..." : description;

  const handleCardClick = () => {
    if (rec.type?.toLowerCase() === "city" || rec.category?.toLowerCase() === "place") {
      navigate("/info", { state: { selectedItem: rec, type: "Place" } });
    } else {
      navigate("/info", { state: { selectedItem: rec, type: rec.type || "Recommendation" } });
    }
  };

  const handleReadMore = (e) => {
    e.stopPropagation();
    handleCardClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-72 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-transform hover:scale-[1.02] duration-200 flex flex-col cursor-pointer"
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-44 object-cover"
        />
      )}

      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-semibold text-lg capitalize text-green-900 line-clamp-1">
          {title}
        </h4>

        {rec.parentPlace && (
          <p className="text-green-700 text-sm mt-1">({rec.parentPlace})</p>
        )}

        <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-grow">
          {truncatedDescription}{" "}
          {description !== "No description available." && (
            <span
              onClick={handleReadMore}
              className="text-green-900 font-semibold cursor-pointer hover:underline"
            >
              Read More
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default HomeRecommendationCard;







