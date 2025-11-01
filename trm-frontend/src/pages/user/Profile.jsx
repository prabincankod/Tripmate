// src/components/user/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Modal = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white text-black p-6 rounded-md max-w-sm w-full">
      <p>{message}</p>
      <button
        onClick={onClose}
        className="mt-4 px-3 py-1 border rounded-md hover:bg-gray-100"
      >
        Close
      </button>
    </div>
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [tab, setTab] = useState("account");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setProfile(res.data.data);
          setFormData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(`/api/auth/${profile._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProfile(res.data.data);
        setModalMessage("Profile updated successfully!");
      } else {
        setModalMessage(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setModalMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword)
      return setModalMessage("Fill all password fields");
    try {
      setChangingPassword(true);
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `/api/auth/${profile._id}/password`,
        { oldPassword, password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setModalMessage("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        setModalMessage(res.data.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      setModalMessage("Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-50 transition-transform w-56 flex flex-col pt-20 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-4 space-y-2">
          <button
            onClick={() => setTab("account")}
            className={`text-left px-3 py-2 rounded hover:bg-gray-100 ${
              tab === "account" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            My Profile
          </button>

          <button
            onClick={() => (window.location.href = "/homepagecd")}
            className="text-left px-3 py-2 rounded hover:bg-gray-100"
          >
            Go to Homepage
          </button>

          <button
            onClick={() => (window.location.href = "/bookings")}
            className="text-left px-3 py-2 rounded hover:bg-gray-100"
          >
            My Bookings
          </button>

          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Hamburger button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-4 left-4 z-50 w-10 h-10 flex flex-col justify-center items-center space-y-1 bg-white shadow rounded-md p-2"
      >
        <span className="block w-6 h-0.5 bg-black"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
      </button>

      {/* Main Content */}
      <div className={`flex-1 p-6 transition-all ${menuOpen ? "ml-56" : "ml-0"}`}>
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 bg-white shadow rounded p-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-2xl font-bold">
              {profile.name[0]}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600">{profile.role}</p>
            <p className="text-gray-600">{profile.email}</p>
            <span
              className={`inline-block px-2 py-1 text-sm rounded-full ${
                profile.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {profile.status}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b mt-4">
          <button
            className={`pb-2 ${tab === "account" ? "border-b-2 border-black font-semibold" : ""}`}
            onClick={() => setTab("account")}
          >
            Account
          </button>
          <button
            className={`pb-2 ${tab === "security" ? "border-b-2 border-black font-semibold" : ""}`}
            onClick={() => setTab("security")}
          >
            Security
          </button>
        </div>

        {/* Account Section */}
        {tab === "account" && (
          <div className="bg-white shadow rounded p-4 space-y-4 mt-4">
            <h2 className="text-xl font-bold">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Security Section */}
        {tab === "security" && (
          <div className="bg-white shadow rounded p-4 space-y-4 mt-4">
            <h2 className="text-xl font-bold">Change Password</h2>
            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="text"
                value={profile.email}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Old Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={changingPassword}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        {/* Modals */}
        {modalMessage && (
          <Modal message={modalMessage} onClose={() => setModalMessage("")} />
        )}

        {logoutConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
            <div className="bg-white rounded-2xl p-6 w-80 max-w-[90%] flex flex-col items-center shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Are you sure you want to logout?
              </h2>
              <div className="flex justify-between w-full mt-2 space-x-4">
                <button
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
