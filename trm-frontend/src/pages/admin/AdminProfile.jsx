import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";

const AdminProfile = () => {
  const { token } = useAuth(); // JWT token
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        // Mock fallback for testing
        const mock = {
          name: "Admin User",
          email: "admin@example.com",
          phoneNumber: "9800000001",
          address: "Kathmandu",
          role: "Admin",
          status: "active",
        };
        setProfile(mock);
        setForm(mock);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.data);
        setForm(res.data.data);
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile?._id) return;
    try {
      const res = await axios.put(`/api/auth/${profile._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err.response?.data || err.message);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  if (!profile) return <p className="text-center mt-10 text-red-500">Profile not found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-8">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
          {profile.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-semibold mt-4">{profile.name}</h2>
        <p className="text-gray-500">{profile.role}</p>
      </div>

      {/* Profile Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <User className="text-gray-400" />
          <input
            type="text"
            name="name"
            value={form.name}
            disabled={!isEditing}
            onChange={handleChange}
            className={`w-full p-2 border-b focus:outline-none ${isEditing ? "border-blue-400" : "border-transparent"}`}
          />
        </div>

        <div className="flex items-center gap-3">
          <Mail className="text-gray-400" />
          <input
            type="email"
            name="email"
            value={form.email}
            disabled={!isEditing}
            onChange={handleChange}
            className={`w-full p-2 border-b focus:outline-none ${isEditing ? "border-blue-400" : "border-transparent"}`}
          />
        </div>

        <div className="flex items-center gap-3">
          <Phone className="text-gray-400" />
          <input
            type="text"
            name="phoneNumber"
            value={form.phoneNumber}
            disabled={!isEditing}
            onChange={handleChange}
            className={`w-full p-2 border-b focus:outline-none ${isEditing ? "border-blue-400" : "border-transparent"}`}
          />
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="text-gray-400" />
          <input
            type="text"
            name="address"
            value={form.address}
            disabled={!isEditing}
            onChange={handleChange}
            className={`w-full p-2 border-b focus:outline-none ${isEditing ? "border-blue-400" : "border-transparent"}`}
          />
        </div>
      </div>

      {/* Status & Role */}
      <div className="mt-6 flex justify-between">
        <p className="text-sm text-gray-500">
          <strong>Status:</strong> {profile.status}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Role:</strong> {profile.role}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end mt-8 gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Save size={18} /> Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setForm(profile); // reset
              }}
              className="flex items-center gap-2 bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              <X size={18} /> Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Edit2 size={18} /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;


