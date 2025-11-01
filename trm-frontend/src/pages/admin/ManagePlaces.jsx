import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/common/Loader";
import PlaceForm from "./placeForm";
import PlaceTable from "./PlaceTable";

const ManagePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editPlace, setEditPlace] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStyle, setFilterStyle] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    images: [],
    bestSeason: "",
    travelTips: "",
    travelStyles: [],
    topAttractions: [{ name: "", type: "", image: null, existingImage: "" }],
    thingsToDo: [{ title: "", description: "", travelStyle: "", image: null, existingImage: "" }],
    localCulture: [{ festival: "", description: "", image: null, existingImage: "" }],
    localCuisine: [{ dish: "", description: "", image: null, existingImage: "" }],
  });

  const API_URL = "http://localhost:4000/api/places";

  // ------------------ FETCH PLACES ------------------
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(API_URL, config);
      setPlaces(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to fetch places" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // ------------------ RESET FORM ------------------
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      images: [],
      bestSeason: "",
      travelTips: "",
      travelStyles: [],
      topAttractions: [{ name: "", type: "", image: null, existingImage: "" }],
      thingsToDo: [{ title: "", description: "", travelStyle: "", image: null, existingImage: "" }],
      localCulture: [{ festival: "", description: "", image: null, existingImage: "" }],
      localCuisine: [{ dish: "", description: "", image: null, existingImage: "" }],
    });
    setEditPlace(null);
  };

  // ------------------ SUBMIT FORM ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("address", formData.address);
      data.append("bestSeason", JSON.stringify([{ season: formData.bestSeason, description: "" }]));
      data.append("travelTips", JSON.stringify([{ title: formData.travelTips, image: "" }]));
      data.append("travelStyles", JSON.stringify(formData.travelStyles));

      formData.images.forEach((img) => {
        if (img instanceof File) data.append("images", img);
      });

      const appendArrayData = (key, fileFieldName) => {
        const payload = formData[key].map((item) => {
          const copy = { ...item };
          delete copy.image;
          delete copy.existingImage;
          return copy;
        });
        data.append(key, JSON.stringify(payload));
        formData[key].forEach((item) => {
          if (item.image instanceof File) data.append(fileFieldName, item.image);
        });
      };

      appendArrayData("topAttractions", "attractionImages");
      appendArrayData("thingsToDo", "thingsToDoImages");
      appendArrayData("localCulture", "localCultureImages");
      appendArrayData("localCuisine", "localCuisineImages");

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editPlace) {
        await axios.put(`${API_URL}/${editPlace._id}`, data, config);
        setMessage({ type: "success", text: "Place updated successfully!" });
      } else {
        await axios.post(API_URL, data, config);
        setMessage({ type: "success", text: "Place added successfully!" });
      }

      setFormVisible(false);
      resetForm();
      fetchPlaces();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ EDIT PLACE ------------------
  const handleEdit = (place) => {
    setEditPlace(place);
    setFormData({
      name: place.name || "",
      description: place.description || "",
      address: place.address || "",
      images: [],
      bestSeason: place.bestSeason?.[0]?.season || "",
      travelTips: place.travelTips?.[0]?.title || "",
      travelStyles: place.travelStyles || [],
      topAttractions: (place.topAttractions || []).map((a) => ({
        name: a.name || "",
        type: a.type || "",
        image: null,
        existingImage: a.image || "",
      })),
      thingsToDo: (place.thingsToDo || []).map((t) => ({
        title: t.title || "",
        description: t.description || "",
        travelStyle: t.travelStyle || "",
        image: null,
        existingImage: t.image || "",
      })),
      localCulture: (place.localCulture || []).map((c) => ({
        festival: c.festival || "",
        description: c.description || "",
        image: null,
        existingImage: c.image || "",
      })),
      localCuisine: (place.localCuisine || []).map((c) => ({
        dish: c.dish || "",
        description: c.description || "",
        image: null,
        existingImage: c.image || "",
      })),
    });
    setFormVisible(true);
  };

  // ------------------ DELETE PLACE ------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this place?")) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      setMessage({ type: "success", text: "Place deleted successfully!" });
      fetchPlaces();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete place" });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ FILTER & SEARCH ------------------
  const filteredPlaces = places.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStyle ? p.travelStyles.includes(filterStyle) : true;
    return matchSearch && matchFilter;
  });

  // ------------------ RETURN JSX ------------------
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🏝️ Manage Places</h2>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍 Search places..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">Filter by Style</option>
            <option value="City">City</option>
            <option value="Food">Food</option>
            <option value="Temple">Temple</option>
            <option value="Adventure">Adventure</option>
          </select>
        </div>

        <button
          onClick={() => setFormVisible(!formVisible)}
          className="px-5 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition"
        >
          {formVisible
            ? "Close Form"
            : editPlace
            ? "Edit Selected Place"
            : "➕ Add New Place"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <p
          className={`mb-4 p-3 rounded-lg text-center font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Form */}
      {formVisible && (
        <div className="mb-6 bg-white rounded-xl shadow-md p-5">
          <PlaceForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
          />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center my-4">
          <Loader />
        </div>
      ) : (
        <PlaceTable
          places={filteredPlaces}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={(place) => setSelectedPlace(place)}
        />
      )}

      {/* Details Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-2xl relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-lg"
              onClick={() => setSelectedPlace(null)}
            >
              ✖
            </button>
            <h3 className="text-2xl font-bold mb-2">{selectedPlace.name}</h3>
            <p className="text-gray-700 mb-3">{selectedPlace.description}</p>
            <p className="text-gray-500 text-sm mb-3">
              📍 {selectedPlace.address}
            </p>
            {selectedPlace.travelStyles?.length > 0 && (
              <p className="text-sm mb-2">
                <span className="font-semibold text-gray-700">Styles:</span>{" "}
                {selectedPlace.travelStyles.join(", ")}
              </p>
            )}
            {selectedPlace.topAttractions?.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold mb-1">Top Attractions:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {selectedPlace.topAttractions.map((a, i) => (
                    <li key={i}>{a.name} ({a.type})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlaces;

