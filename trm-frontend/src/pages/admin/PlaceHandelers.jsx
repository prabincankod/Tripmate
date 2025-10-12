// placeHandlers.js
import axios from "axios";

export const fetchPlaces = async (setPlaces, setLoading, setMessage, API_URL) => {
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

// ---------------- Array & Image Handlers ----------------
export const handleArrayChange = (formData, setFormData, field, index, key, value) => {
  const updated = [...formData[field]];
  updated[index][key] = value;
  setFormData({ ...formData, [field]: updated });
};

export const handleArrayImage = (formData, setFormData, field, index, file) => {
  const updated = [...formData[field]];
  updated[index].image = file;
  setFormData({ ...formData, [field]: updated });
};

export const addArrayItem = (formData, setFormData, field, template) => {
  setFormData({ ...formData, [field]: [...formData[field], template] });
};

export const removeArrayItem = (formData, setFormData, field, index) => {
  const updated = [...formData[field]];
  updated.splice(index, 1);
  setFormData({ ...formData, [field]: updated });
};

export const handlePlaceImages = (formData, setFormData, e) => {
  setFormData({ ...formData, images: Array.from(e.target.files) });
};

// ---------------- Submit Handler ----------------
export const handleSubmitPlace = async (
  e,
  formData,
  setMessage,
  fetchPlaces,
  API_URL,
  editPlace,
  setEditPlace,
  setFormVisible
) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const data = new FormData();

    // Basic info
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("address", formData.address);

    // Travel Styles
    data.append("travelStyles", JSON.stringify(formData.travelStyles));

    // Top Attractions
    formData.topAttractions.forEach((item, i) => {
      data.append(`topAttractions[${i}][name]`, item.name);
      data.append(`topAttractions[${i}][type]`, item.type);
      if (item.image) data.append("topAttractionsImages", item.image);
    });

    // Things To Do
    formData.thingsToDo.forEach((item, i) => {
      data.append(`thingsToDo[${i}][title]`, item.title);
      data.append(`thingsToDo[${i}][description]`, item.description);
      data.append(`thingsToDo[${i}][travelStyle]`, item.travelStyle);
      if (item.image) data.append("thingsToDoImages", item.image);
    });

    // Hotels
    formData.hotels.forEach((item, i) => {
      data.append(`hotels[${i}][name]`, item.name);
      data.append(`hotels[${i}][description]`, item.description);
      data.append(`hotels[${i}][rating]`, item.rating);
      if (item.image) data.append("hotelsImages", item.image);
    });

    // Local Culture
    formData.localCulture.forEach((item, i) => {
      data.append(`localCulture[${i}][festival]`, item.festival);
      data.append(`localCulture[${i}][description]`, item.description);
      data.append(`localCulture[${i}][travelStyle]`, item.travelStyle || "Culture");
      if (item.image) data.append("localCultureImages", item.image);
    });

    // Local Cuisine
    formData.localCuisine.forEach((item, i) => {
      data.append(`localCuisine[${i}][dish]`, item.dish);
      data.append(`localCuisine[${i}][description]`, item.description);
      if (item.image) data.append("localCuisineImages", item.image);
    });

    // Travel Tips
    formData.travelTips.forEach((item, i) => {
      data.append(`travelTips[${i}][title]`, item.title);
      data.append(`travelTips[${i}][description]`, item.description);
      if (item.image) data.append("travelTipsImages", item.image);
    });

    // Best Season
    data.append("bestSeason", JSON.stringify(formData.bestSeason));

    // Place Images
    formData.images.forEach((file) => data.append("images", file));

    const config = {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    };

    if (editPlace) {
      await axios.put(`${API_URL}/${editPlace._id}`, data, config);
      setMessage({ type: "success", text: "Place updated successfully" });
    } else {
      await axios.post(API_URL, data, config);
      setMessage({ type: "success", text: "Place added successfully" });
    }

    fetchPlaces();
    setFormVisible(false);
    setEditPlace(null);
  } catch (err) {
    console.error(err);
    setMessage({ type: "error", text: "Error saving place" });
  }
};

// ---------------- Edit Place ----------------
export const handleEditPlace = (place, setEditPlace, setFormData, setFormVisible) => {
  setEditPlace(place);
  setFormData({
    name: place.name,
    description: place.description,
    address: place.address,
    travelStyles: place.travelStyles || [""],
    images: [],
    topAttractions: (place.topAttractions || []).map((a) => ({
      name: a.name,
      type: a.type || "",
      image: null,
      existingImage: a.image || "",
    })),
    thingsToDo: (place.thingsToDo || []).map((t) => ({
      title: t.title,
      description: t.description || "",
      travelStyle: t.travelStyle || "",
      image: null,
      existingImage: t.image || "",
    })),
    hotels: (place.hotels || []).map((h) => ({
      name: h.name,
      description: h.description || "",
      rating: h.rating || 0,
      image: null,
      existingImage: h.image || "",
    })),
    localCulture: (place.localCulture || []).map((l) => ({
      festival: l.festival,
      description: l.description || "",
      travelStyle: l.travelStyle || "",
      image: null,
      existingImage: l.image || "",
    })),
    localCuisine: (place.localCuisine || []).map((l) => ({
      dish: l.dish,
      description: l.description || "",
      image: null,
      existingImage: l.image || "",
    })),
    travelTips: (place.travelTips || []).map((t) => ({
      title: t.title,
      description: t.description || "",
      image: null,
      existingImage: t.image || "",
    })),
    bestSeason: place.bestSeason || [],
  });
  setFormVisible(true);
};

// ---------------- Delete Place ----------------
export const handleDeletePlace = async (id, setMessage, fetchPlaces, API_URL) => {
  if (!window.confirm("Are you sure to delete this place?")) return;
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchPlaces();
    setMessage({ type: "success", text: "Place deleted successfully" });
  } catch (err) {
    console.error(err);
    setMessage({ type: "error", text: "Error deleting place" });
  }
};
