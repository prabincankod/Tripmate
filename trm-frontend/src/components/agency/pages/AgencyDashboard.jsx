import React, { useEffect, useState } from "react";
import Sidebar from "../tool/SideBar";
import axios from "axios";
import { Calendar, Package, Users, DollarSign } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const AgencyDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingRes, packageRes] = await Promise.all([
          axios.get("http://localhost:4000/api/agencies/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/api/packages", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const allBookings = bookingRes.data.data || [];
        const allPackages = packageRes.data.data || [];

        const payload = JSON.parse(atob(token.split(".")[1]));
        const agencyId = payload.id || payload._id;

        const myPackages = allPackages.filter(
          (pkg) => pkg.createdBy === agencyId || pkg.agency === agencyId
        );

        const myBookings = allBookings.filter(
          (b) => b.travelPackage?.createdBy === agencyId || b.travelPackage?.agency === agencyId
        );

        setBookings(myBookings);
        setPackages(myPackages);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response?.status === 403) {
          setError("Forbidden: You are not authorized. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => (window.location.href = "/login"), 2000);
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-500">
        Loading...
      </div>
    );
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  // Compute dynamic stats
  const totalBookings = bookings.length;
  const totalConfirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const totalCancelled = bookings.filter((b) => b.status === "Cancelled").length;
  const totalRefunded = bookings.filter((b) => b.status === "Refunded").length;
  const totalTravellers = bookings.reduce((sum, b) => sum + (b.numberOfTravellers || 0), 0);
  const totalPackageValue = packages.reduce((sum, p) => sum + (p.price || 0), 0);

  // Correct total earnings calculation
  const totalEarnings = bookings.reduce((sum, b) => {
    const price =
      b.totalAmount ??
      (b.travelPackage?.price
        ? b.travelPackage.price * (b.numberOfTravellers || 1)
        : 0);
    return sum + price;
  }, 0);

  const barData = {
    labels: ["Bookings", "Confirmed", "Cancelled", "Refunded", "Travellers", "Package Value", "Earnings"],
    datasets: [
      {
        label: "Overview",
        data: [
          totalBookings,
          totalConfirmed,
          totalCancelled,
          totalRefunded,
          totalTravellers,
          totalPackageValue,
          totalEarnings,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: ["Confirmed", "Cancelled", "Refunded"],
    datasets: [
      {
        data: [totalConfirmed, totalCancelled, totalRefunded],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)", // green
          "rgba(239, 68, 68, 0.8)",   // red
          "rgba(59, 130, 246, 0.8)",  // blue
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="w-64 sticky top-0 h-screen bg-white shadow-md">
        <Sidebar />
      </div>

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Agency Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-md p-6 rounded-xl flex flex-col justify-between border-l-4 border-blue-500">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <h2 className="text-2xl font-bold">{totalBookings}</h2>
              <p className="text-xs text-gray-600">Confirmed: {totalConfirmed}</p>
              <p className="text-xs text-gray-600">Cancelled: {totalCancelled}</p>
              <p className="text-xs text-gray-600">Refunded: {totalRefunded}</p>
            </div>
            <Calendar size={30} className="text-blue-500 mt-2" />
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl flex flex-col justify-between border-l-4 border-green-500">
            <div>
              <p className="text-sm text-gray-500">Total Packages</p>
              <h2 className="text-2xl font-bold">{packages.length}</h2>
              <p className="text-xs text-gray-600">Value: Rs {totalPackageValue}</p>
            </div>
            <Package size={30} className="text-green-500 mt-2" />
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl flex flex-col justify-between border-l-4 border-orange-500">
            <div>
              <p className="text-sm text-gray-500">Total Travellers</p>
              <h2 className="text-2xl font-bold">{totalTravellers}</h2>
            </div>
            <Users size={30} className="text-orange-500 mt-2" />
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl flex flex-col justify-between border-l-4 border-yellow-500">
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <h2 className="text-2xl font-bold">Rs {totalEarnings}</h2>
            </div>
            <DollarSign size={30} className="text-yellow-500 mt-2" />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Bookings Overview</h3>
            <Doughnut data={doughnutData} />
          </div>

          <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Report</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;




