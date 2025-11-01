import React from "react";

const PlacesTable = ({ places, onEdit, onDelete }) => {
  return (
    <table className="w-full border border-gray-200 text-sm">
      <thead className="bg-gray-100">
        <tr className="text-left">
          <th className="border p-2">Name</th>
          <th className="border p-2">Address</th>
          <th className="border p-2">Travel Styles</th>
          <th className="border p-2">Top Attractions</th>
          <th className="border p-2">Things To Do</th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {places.map((place) => (
          <tr key={place._id} className="hover:bg-gray-50">
            <td className="border p-2">{place.name}</td>
            <td className="border p-2">{place.address}</td>
            <td className="border p-2">{(place.travelStyles || []).join(", ")}</td>
            <td className="border p-2">
              {(place.topAttractions || []).map((a) => `${a.name} (${a.type || "N/A"})`).join(", ")}
            </td>
            <td className="border p-2">
              {(place.thingsToDo || []).map((t) => `${t.title} (${t.travelStyle || "N/A"})`).join(", ")}
            </td>
            <td className="border p-2 flex gap-2">
              <button
                onClick={() => onEdit(place)}
                className="text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded border border-blue-300 hover:border-blue-500 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(place._id)}
                className="text-red-600 hover:text-red-800 px-2 py-0.5 rounded border border-red-300 hover:border-red-500 transition-colors text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlacesTable;
