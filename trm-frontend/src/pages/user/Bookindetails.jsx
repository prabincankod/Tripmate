// src/components/user/UserBookings.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { User, Calendar, CreditCard } from "lucide-react";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBookings(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) return <p className="text-center mt-10">Loading bookings...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!bookings.length)
    return <p className="text-center mt-10">You have no bookings yet.</p>;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-50 transition-transform duration-300 w-56 flex flex-col pt-20 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-4 space-y-2">
          {/* Sidebar buttons stacked */}
          <button
            onClick={() => (window.location.href = "/homepage")}
            className="text-left px-3 py-2 rounded hover:bg-gray-100 font-semibold"
          >
            Go to Homepage
          </button>

          <button
            onClick={() => (window.location.href = "/profile")}
            className="text-left px-3 py-2 rounded hover:bg-gray-100"
          >
            My Profile
          </button>

          <button
            onClick={() => window.location.reload()}
            className="text-left px-3 py-2 rounded hover:bg-gray-100 font-semibold bg-gray-100"
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

      {/* Hamburger Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-4 left-4 z-50 w-10 h-10 flex flex-col justify-center items-center space-y-1 bg-white shadow rounded-md p-2"
      >
        <span className="block w-6 h-0.5 bg-black"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
      </button>

      {/* Main Content */}
      <div className={`flex-1 p-6 transition-all duration-300 ${menuOpen ? "ml-56" : "ml-0"}`}>
        <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>

        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white"
            >
              {/* Left: Avatar + Package */}
              <div className="flex items-center space-x-4 mb-3 md:mb-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
                  {booking.user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-800">
                    {booking.travelPackage?.name || "Package Deleted"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.travelPackage?.duration || ""}
                  </p>
                </div>
              </div>

              {/* Middle: Booking details */}
              <div className="flex flex-col text-sm text-gray-600 space-y-1 mb-3 md:mb-0">
                <p className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />{" "}
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {booking.numberOfTravellers} traveller(s)
                </p>
                <p className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" /> eSewa -{" "}
                  {booking.status.toLowerCase() === "paid" ? "Paid" : "Pending"}
                </p>
              </div>

              {/* Right: Booking status */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(
                    booking.status
                  )}`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
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
  );
}

