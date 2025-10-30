import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/common/Loader";
import HotelForm from "../admin/HotelForm";

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // for popup confirmation

  const [formData, setFormData] = useState({
    placeId: "",
    name: "",
    description: "",
    image: null,
    address: "",
    contact: "",
    priceRange: "",
    amenities: [""],
    roomFeatures: [""],
    location: { coordinates: [0, 0] },
  });

  const API_URL = "http://localhost:4000/api/hotels";
  const PLACE_API_URL = "http://localhost:4000/api/places";

  // ------------------ FETCH HOTELS ------------------
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(API_URL, config);
      setHotels(res.data);
      setFilteredHotels(res.data);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch hotels" });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ FETCH PLACES ------------------
  const fetchPlaces = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(PLACE_API_URL, config);
      setPlaces(res.data);
    } catch (err) {
      console.error("Failed to fetch places", err);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchPlaces();
  }, []);

  // ------------------ FILTER LOGIC ------------------
  useEffect(() => {
    let filtered = hotels;
    if (search) {
      filtered = filtered.filter((hotel) =>
        hotel.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterPlace) {
      filtered = filtered.filter(
        (hotel) => hotel.placeId?._id === filterPlace
      );
    }
    setFilteredHotels(filtered);
  }, [search, filterPlace, hotels]);

  // ------------------ RESET FORM ------------------
  const resetForm = () => {
    setFormData({
      placeId: "",
      name: "",
      description: "",
      image: null,
      address: "",
      contact: "",
      priceRange: "",
      amenities: [""],
      roomFeatures: [""],
      location: { coordinates: [0, 0] },
    });
    setEditHotel(null);
  };

  // ------------------ AUTO HIDE MESSAGE ------------------
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ------------------ SUBMIT FORM ------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      if (!formData.placeId || !formData.name) {
        throw new Error("Place ID and hotel name are required");
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "amenities" || key === "roomFeatures") {
          data.append(key, JSON.stringify(value));
        } else if (key === "location") {
          data.append(key, JSON.stringify(value));
        } else if (key === "image" && value instanceof File) {
          data.append("image", value);
        } else {
          data.append(key, value);
        }
      });

      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editHotel) {
        await axios.put(`${API_URL}/${editHotel._id}`, data, config);
        setMessage({ type: "success", text: "Hotel updated successfully!" });
      } else {
        await axios.post(API_URL, data, config);
        setMessage({ type: "success", text: "Hotel added successfully!" });
      }

      setFormVisible(false);
      resetForm();
      fetchHotels();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ DELETE HOTEL ------------------
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      setMessage({ type: "success", text: "Hotel deleted successfully!" });
      setConfirmDelete(null);
      fetchHotels();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete hotel" });
    } finally {
      setLoading(false);
    }
  };

  // ------------------ EDIT HOTEL ------------------
  const handleEdit = (hotel) => {
    setEditHotel(hotel);
    setFormData({
      placeId: hotel.placeId?._id || "",
      name: hotel.name || "",
      description: hotel.description || "",
      image: null,
      address: hotel.address || "",
      contact: hotel.contact || "",
      priceRange: hotel.priceRange || "",
      amenities: hotel.amenities.length ? hotel.amenities : [""],
      roomFeatures: hotel.roomFeatures.length ? hotel.roomFeatures : [""],
      location: hotel.location || { coordinates: [0, 0] },
    });
    setFormVisible(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        Manage Hotels
      </h2>

      {/* Message */}
      {message && (
        <p
          className={`mb-4 p-3 rounded-md text-sm font-medium transition-all duration-500 ${
            message.type === "success"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Filter Section */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Search by hotel name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <select
          value={filterPlace}
          onChange={(e) => setFilterPlace(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">All Places</option>
          {places.map((place) => (
            <option key={place._id} value={place._id}>
              {place.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all"
        >
          {formVisible
            ? "Close Form"
            : editHotel
            ? "Edit Selected Hotel"
            : "Add New Hotel"}
        </button>
      </div>

      {/* Form Section */}
      {formVisible && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-100">
          <HotelForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            places={places}
          />
        </div>
      )}

      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center items-center my-10">
          <Loader />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-100">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Place</th>
                <th className="px-4 py-3 text-left font-medium">Address</th>
                <th className="px-4 py-3 text-left font-medium">Contact</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((hotel) => (
                <tr
                  key={hotel._id}
                  className="border-b hover:bg-gray-50 group transition-all"
                >
                  <td className="px-4 py-3">{hotel.name}</td>
                  <td className="px-4 py-3">{hotel.placeId?.name || "-"}</td>
                  <td className="px-4 py-3">{hotel.address}</td>
                  <td className="px-4 py-3">{hotel.contact}</td>
                  <td className="px-4 py-3">{hotel.priceRange}</td>
                  <td className="px-4 py-3">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                      <button
                        onClick={() => handleEdit(hotel)}
                        className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(hotel._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHotels.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No hotels found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Are you sure you want to delete this hotel?
            </h3>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHotels;


