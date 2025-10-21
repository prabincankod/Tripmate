// src/components/agency/AgencyProfile.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../tool/SideBar";
import { Building2, Mail, Phone, MapPin, FileText, Edit2, Save, X } from "lucide-react";
import Loader from "../../common/Loader";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const AgencyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data;
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          description: data.description || "",
          agencyName: data.agencyName || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!profile?._id) return;
    try {
      const res = await axios.put(`/api/auth/${profile._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data.data;
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;

  if (!profile) return <p className="text-center mt-10 text-red-500">Profile not found. Please login.</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-4xl font-bold text-green-600">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{profile.name}</h2>
              <p className="text-gray-500">{profile.role}</p>
              <p className="text-gray-500 font-medium">{profile.agencyName}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Save size={18} /> Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setForm({
                      name: profile.name || "",
                      email: profile.email || "",
                      phoneNumber: profile.phoneNumber || "",
                      address: profile.address || "",
                      description: profile.description || "",
                      agencyName: profile.agencyName || "",
                    });
                  }}
                  className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats / Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <h4 className="text-gray-500 text-sm">Status</h4>
            <p className="text-xl font-bold">{profile.status || "Active"}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <h4 className="text-gray-500 text-sm">Role</h4>
            <p className="text-xl font-bold">{profile.role}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <h4 className="text-gray-500 text-sm">Agency Name</h4>
            <p className="text-xl font-bold">{profile.agencyName}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-3">
            <Building2 className="text-gray-400" />
            <input
              type="text"
              name="name"
              value={form.name}
              disabled={!isEditing}
              onChange={handleChange}
              className={`w-full p-2 border-b focus:outline-none ${
                isEditing ? "border-green-400" : "border-transparent"
              }`}
            />
          </div>

          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-3">
            <Mail className="text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              disabled={!isEditing}
              onChange={handleChange}
              className={`w-full p-2 border-b focus:outline-none ${
                isEditing ? "border-green-400" : "border-transparent"
              }`}
            />
          </div>

          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-3">
            <Phone className="text-gray-400" />
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              disabled={!isEditing}
              onChange={handleChange}
              className={`w-full p-2 border-b focus:outline-none ${
                isEditing ? "border-green-400" : "border-transparent"
              }`}
            />
          </div>

          <div className="bg-white shadow rounded-2xl p-4 flex items-center gap-3">
            <MapPin className="text-gray-400" />
            <input
              type="text"
              name="address"
              value={form.address}
              disabled={!isEditing}
              onChange={handleChange}
              className={`w-full p-2 border-b focus:outline-none ${
                isEditing ? "border-green-400" : "border-transparent"
              }`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 bg-white shadow rounded-2xl p-4 flex gap-3">
          <FileText className="text-gray-400 mt-1" />
          <textarea
            name="description"
            rows="3"
            value={form.description}
            disabled={!isEditing}
            onChange={handleChange}
            className={`w-full p-2 border-b focus:outline-none resize-none ${
              isEditing ? "border-green-400" : "border-transparent"
            }`}
            placeholder="Describe your agency..."
          />
        </div>
      </div>
    </div>
  );
};

export default AgencyProfile;

