import React from "react";

const PlaceActions = ({ place, onEdit, onDelete }) => {
  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={() => onEdit(place)}
        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(place._id)}
        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );
};

export default PlaceActions;
