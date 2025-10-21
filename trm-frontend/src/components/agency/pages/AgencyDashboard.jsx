import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Briefcase, CheckCircle, XCircle, Package } from "lucide-react";

const COLORS = ["#34d399", "#f87171", "#fbbf24", "#60a5fa"];

const AgencyDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, packageRes] = await Promise.all([
          axios.get("http://localhost:4000/api/agencies/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/api/packages/agency", {

            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBookings(bookingRes.data.bookings || []);
        setPackages(packageRes.data.packages || []);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading dashboard...</p>;
  if (error)
    return <p className="text-center mt-20 text-red-500">{error}</p>;

  // ✅ Booking stats
  const totalBookings = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
  const refunded = bookings.filter((b) => b.status === "Refunded").length;

  // ✅ Total earnings
  const totalEarnings = bookings
    .filter((b) => b.status === "Confirmed")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // ✅ Chart data
  const bookingStatusData = [
    { name: "Confirmed", value: confirmed },
    { name: "Cancelled", value: cancelled },
    { name: "Refunded", value: refunded },
  ];

  // ✅ Weekly earnings (for demo, based on booking date)
  const weeklyEarnings = bookings.reduce((acc, booking) => {
    const week = new Date(booking.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const existing = acc.find((d) => d.name === week);
    if (existing) existing.value += booking.totalAmount || 0;
    else acc.push({ name: week, value: booking.totalAmount || 0 });
    return acc;
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Agency Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
          <Briefcase className="text-blue-500 w-8 h-8" />
          <div>
            <p className="text-sm text-gray-500">Total Bookings</p>
            <h3 className="text-xl font-bold">{totalBookings}</h3>
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
          <CheckCircle className="text-green-500 w-8 h-8" />
          <div>
            <p className="text-sm text-gray-500">Confirmed</p>
            <h3 className="text-xl font-bold">{confirmed}</h3>
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
          <XCircle className="text-red-500 w-8 h-8" />
          <div>
            <p className="text-sm text-gray-500">Cancelled</p>
            <h3 className="text-xl font-bold">{cancelled}</h3>
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-5 flex items-center gap-4">
          <DollarSign className="text-yellow-500 w-8 h-8" />
          <div>
            <p className="text-sm text-gray-500">Total Earnings</p>
            <h3 className="text-xl font-bold">Rs. {totalEarnings}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Booking Status */}
        <div className="bg-white p-5 shadow rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Booking Status Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {bookingStatusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Weekly Earnings */}
        <div className="bg-white p-5 shadow rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Weekly Earnings
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyEarnings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Package Info */}
      <div className="bg-white p-5 shadow rounded-2xl mt-8">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-indigo-500 w-6 h-6" />
          <h3 className="text-lg font-semibold text-gray-700">
            Your Packages ({packages.length})
          </h3>
        </div>
        {packages.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className="border rounded-xl p-4 hover:shadow-md transition"
              >
                <h4 className="font-semibold text-gray-800">{pkg.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{pkg.location}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Price: Rs. {pkg.price}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No packages added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;



