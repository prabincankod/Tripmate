// src/pages/admin/AdminOverview.jsx
import React, { useEffect, useState } from "react";
import {
  Building2,
  Users,
  MapPin,
  PenTool,
  Lightbulb,
  Loader2,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgencies: 0,
    approvedAgencies: 0,
    totalUsers: 0,
    totalPlaces: 0,
    totalRecommendations: 0,
    totalBlogs: 0,
  });
  const [trendData, setTrendData] = useState([
    { month: "Jan", users: 30, agencies: 10 },
    { month: "Feb", users: 40, agencies: 15 },
    { month: "Mar", users: 45, agencies: 20 },
    { month: "Apr", users: 60, agencies: 25 },
  ]);
  const [recentBlogs, setRecentBlogs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [agRes, userRes, placeRes, recRes, blogRes] = await Promise.all([
          axios.get("/api/agency-applications", { headers }),
          axios.get("/api/auth", { headers }),
          axios.get("/api/places", { headers }),
          axios.get("/admin/recommendations/all", { headers }),
          axios.get("/blogs", { headers }),
        ]);

        // Extract data safely
        const agencies = agRes.data.applications || [];
        const approvedAgencies = agencies.filter(
          (a) => a.status === "Approved"
        ).length;
        const users = userRes.data.users || [];
        const places = placeRes.data || [];
        const recs = recRes.data.recommendations || [];

        // ✅ Safely extract blogs array
        let blogsData = [];
        if (Array.isArray(blogRes.data)) {
          blogsData = blogRes.data;
        } else if (Array.isArray(blogRes.data.blogs)) {
          blogsData = blogRes.data.blogs;
        } else if (Array.isArray(blogRes.data.data)) {
          blogsData = blogRes.data.data;
        }

        setStats({
          totalAgencies: agencies.length,
          approvedAgencies,
          totalUsers: users.length,
          totalPlaces: places.length,
          totalRecommendations: recs.length,
          totalBlogs: blogsData.length,
        });

        // Sort and pick recent blogs
        const sortedBlogs = [...blogsData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentBlogs(sortedBlogs.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading Dashboard...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Admin Dashboard Overview
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Total Agencies"
          value={stats.totalAgencies}
          icon={<Building2 className="text-blue-500" size={26} />}
          bg="bg-blue-50"
        />
        <SummaryCard
          title="Approved Agencies"
          value={stats.approvedAgencies}
          icon={<TrendingUp className="text-green-500" size={26} />}
          bg="bg-green-50"
        />
        <SummaryCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="text-purple-500" size={26} />}
          bg="bg-purple-50"
        />
        <SummaryCard
          title="Total Places"
          value={stats.totalPlaces}
          icon={<MapPin className="text-orange-500" size={26} />}
          bg="bg-orange-50"
        />
        <SummaryCard
          title="Total Recommendations"
          value={stats.totalRecommendations}
          icon={<Lightbulb className="text-yellow-500" size={26} />}
          bg="bg-yellow-50"
        />
        <SummaryCard
          title="Total Blogs"
          value={stats.totalBlogs}
          icon={<PenTool className="text-pink-500" size={26} />}
          bg="bg-pink-50"
        />
      </div>

      {/* Analytics Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Platform Growth Overview
        </h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#6366f1"
                strokeWidth={2}
                name="Users"
              />
              <Line
                type="monotone"
                dataKey="agencies"
                stroke="#10b981"
                strokeWidth={2}
                name="Agencies"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Recent Platform Highlights
        </h2>
        <ul className="divide-y divide-gray-200">
          <li className="py-3 text-gray-700">
            🌍 <strong>{stats.totalPlaces}</strong> amazing destinations are
            live.
          </li>
          <li className="py-3 text-gray-700">
            🧭 <strong>{stats.totalRecommendations}</strong> user
            recommendations submitted.
          </li>
          <li className="py-3 text-gray-700">
            🧑‍💼 <strong>{stats.approvedAgencies}</strong> verified travel agencies
            contributing.
          </li>
          <li className="py-3 text-gray-700">
            ✍️ <strong>{stats.totalBlogs}</strong> travel blogs published by
            community.
          </li>
        </ul>

        {/* Recently Published Blogs */}
        {recentBlogs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 text-gray-700">
              📰 Latest Blogs
            </h3>
            <ul className="space-y-2">
              {recentBlogs.map((blog) => (
                <li
                  key={blog._id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <p className="font-medium">{blog.title}</p>
                  <p className="text-xs text-gray-500">
                    By {blog.author?.name || "Unknown"} —{" "}
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Sub Component ----------
const SummaryCard = ({ title, value, icon, bg }) => (
  <div
    className={`${bg} rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all`}
  >
    <div>
      <h3 className="text-gray-600 font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
    <div className="bg-white p-3 rounded-full shadow-sm">{icon}</div>
  </div>
);

export default AdminOverview;


