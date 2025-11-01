import React from "react";

const travelStyleOptions = ["City", "Food", "Temple", "Adventure"];
const seasonOptions = ["Spring", "Summer", "Autumn", "Winter"];
const attractionTypes = ["City", "Adventure", "Temple", "Park", "Museum"];

const PlaceForm = ({ formData, setFormData, handleSubmit }) => {
  const fileTypes = ".jpg,.jpeg,.png";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
  };

  const handleArrayChange = (key, index, field, value) => {
    const updated = [...formData[key]];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const handleArrayFileChange = (key, index, file) => {
    const updated = [...formData[key]];
    updated[index].image = file;
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const removeArrayItem = (key, index) => {
    const updated = [...formData[key]];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const addArrayItem = (key, newItem = {}) => {
    const updated = formData[key] ? [...formData[key], newItem] : [newItem];
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const sections = [
    { key: "topAttractions", label: "Top Attractions", fields: ["name", "type"] },
    { key: "thingsToDo", label: "Things To Do", fields: ["title", "description", "travelStyle"] },
    { key: "localCulture", label: "Local Culture", fields: ["festival", "description"] },
    { key: "localCuisine", label: "Local Cuisine", fields: ["dish", "description"] },
    { key: "tripPlans", label: "Trip Plans", fields: ["title", "description"] },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">

      {/* Basic Info */}
      <div className="mb-2">
        <label className="font-medium block mb-1">Place Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
          required
        />
      </div>

      <div className="mb-2">
        <label className="font-medium block mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
          rows={3}
          required
        />
      </div>

      <div className="mb-2">
        <label className="font-medium block mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
          required
        />
      </div>

      {/* Best Season */}
      <div className="mb-2">
        <label className="font-medium block mb-1">Best Season</label>
        <select
          name="bestSeason"
          value={formData.bestSeason || ""}
          onChange={handleInputChange}
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
        >
          <option value="">Select Season</option>
          {seasonOptions.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="font-medium block mb-1">Travel Tips</label>
        <textarea
          name="travelTips"
          value={formData.travelTips || ""}
          onChange={handleInputChange}
          className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
          rows={3}
        />
      </div>

      {/* Travel Styles */}
      <div className="mb-2">
        <label className="font-medium block mb-1">Travel Styles</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {travelStyleOptions.map(style => (
            <label key={style} className="flex items-center gap-1">
              <input
                type="checkbox"
                value={style}
                checked={formData.travelStyles.includes(style)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, travelStyles: [...prev.travelStyles, style] }));
                  } else {
                    setFormData(prev => ({ ...prev, travelStyles: prev.travelStyles.filter(s => s !== style) }));
                  }
                }}
              />
              {style}
            </label>
          ))}
        </div>
      </div>

      {/* Main Place Images */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Place Images</label>
        <input
          type="file"
          multiple
          accept={fileTypes}
          onChange={handleImagesChange}
        />
        {formData.images.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {formData.images.map((img, i) => (
              <div key={i} className="w-24 h-24 overflow-hidden rounded border">
                <img
                  src={img instanceof File ? URL.createObjectURL(img) : img}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Sections */}
      {sections.map(section => (
        <div key={section.key} className="mb-4">
          <h3 className="font-semibold mb-2">{section.label}</h3>

          {formData[section.key]?.map((item, idx) => (
            <div key={idx} className="border rounded p-2 mb-2 relative bg-gray-50 hover:bg-gray-100 transition">

              {section.fields.map(field => (
                <div className="mb-1" key={field}>
                  <label className="font-medium block mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>

                  {(field === "type" && section.key === "topAttractions") && (
                    <select
                      value={item[field] || ""}
                      onChange={e => handleArrayChange(section.key, idx, field, e.target.value)}
                      className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
                    >
                      <option value="">Select Type</option>
                      {attractionTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {(field === "travelStyle" && section.key === "thingsToDo") && (
                    <select
                      value={item[field] || ""}
                      onChange={e => handleArrayChange(section.key, idx, field, e.target.value)}
                      className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
                    >
                      <option value="">Select Travel Style</option>
                      {travelStyleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}

                  {/* default text input */}
                  {(!["type", "travelStyle"].includes(field) || section.key === "tripPlans") && (
                    <input
                      type="text"
                      value={item[field] || ""}
                      onChange={e => handleArrayChange(section.key, idx, field, e.target.value)}
                      className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-gray-400 transition"
                    />
                  )}
                </div>
              ))}

              {/* Image Preview (skip for tripPlans) */}
              {section.key !== "tripPlans" && (
                <div className="w-full h-32 overflow-hidden rounded-t-xl mb-1">
                  <input
                    type="file"
                    onChange={e => handleArrayFileChange(section.key, idx, e.target.files[0])}
                    className="border p-1 rounded w-full mb-1"
                  />
                  {item.image || item.existingImage ? (
                    <img
                      src={item.image ? URL.createObjectURL(item.image) : item.existingImage}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              )}

              <button
                type="button"
                onClick={() => removeArrayItem(section.key, idx)}
                className="absolute top-1 right-1 text-red-500 text-xs hover:underline"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addArrayItem(section.key, {})}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm transition"
          >
            Add {section.label.slice(0, -1)}
          </button>
        </div>
      ))}

      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
      >
        Save Place
      </button>
    </form>
  );
};

export default PlaceForm;



