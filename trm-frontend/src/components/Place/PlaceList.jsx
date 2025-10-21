import React from "react";
import PlaceCard from "./PlaceCard";

const PlaceList = ({ places }) => {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      }}
    >
      {places.map((place) => (
        <PlaceCard key={place._id} place={place} />
      ))}
    </div>
  );
};

export default PlaceList;

