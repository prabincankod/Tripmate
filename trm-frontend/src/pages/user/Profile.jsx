import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/common/Loader"
import { Pencil, Save, X } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setProfile(res.data.data);
          setFormData(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save updated profile
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(`/api/users/${profile._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setProfile(res.data.data);
        setEditMode(false);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (!profile)
    return (
      <div className="text-center mt-10 text-gray-600">
        No profile data found.
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {profile.role === "Admin"
            ? "Admin Profile"
            : profile.role === "TravelAgency"
            ? "Travel Agency Profile"
            : "User Profile"}
        </h2>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
          >
            <Pencil size={18} />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setFormData(profile);
              }}
              className="flex items-center gap-1 bg-gray-400 text-white px-3 py-1 rounded-lg hover:bg-gray-500"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          {/* Name */}
          <div>
            <p className="text-sm text-gray-500">Name</p>
            {editMode ? (
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            ) : (
              <p className="font-semibold">{profile.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-gray-500">Email</p>
            {editMode ? (
              <input
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            ) : (
              <p className="font-semibold">{profile.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            {editMode ? (
              <input
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            ) : (
              <p className="font-semibold">{profile.phoneNumber}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <p className="text-sm text-gray-500">Address</p>
            {editMode ? (
              <input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            ) : (
              <p className="font-semibold">{profile.address || "N/A"}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-sm ${
                profile.role === "Admin"
                  ? "bg-blue-600"
                  : profile.role === "TravelAgency"
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
            >
              {profile.role}
            </span>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-white text-sm ${
                profile.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {profile.status}
            </span>
          </div>
        </div>

        {/* Agency-specific field */}
        {profile.role === "TravelAgency" && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">Agency Name</p>
            {editMode ? (
              <input
                name="agencyName"
                value={formData.agencyName || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              />
            ) : (
              <p className="font-semibold">{profile.agencyName || "N/A"}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
