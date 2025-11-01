// src/pages/admin/ManageUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = localStorage.getItem("token");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out invalid users
      setUsers(res.data.users?.filter(u => u && u._id) || []);
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show temporary messages
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Toggle active/inactive
  // Toggle active/inactive
const toggleStatus = async (userId, currentStatus) => {
  try {
    await axios.put(
      `/api/auth/${userId}/status`,
      { status: currentStatus === "active" ? "inactive" : "active" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showMessage("success", "Status updated successfully");
    fetchUsers();
  } catch (err) {
    showMessage("error", "Failed to update status");
  }
};

// Update role
const updateRole = async (userId, newRole) => {
  try {
    await axios.put(
      `/api/auth/${userId}/role`,
      { role: newRole },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showMessage("success", `Role updated to ${newRole}`);
    fetchUsers();
  } catch (err) {
    showMessage("error", "Failed to update role");
  }
};

  // Delete user
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/auth/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("success", "User deleted successfully");
      fetchUsers();
    } catch (err) {
      showMessage("error", "Failed to delete user");
    }
  };

  // Filter users safely
  const filteredUsers = (users || [])
    .filter(u => u && u._id)
    .filter(u => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Users</h1>

      {/* Alerts */}
      {message.text && (
        <div
          className={`p-2 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="All">All Roles</option>
          <option value="User">User</option>
          <option value="TravelAgency">TravelAgency</option>
          <option value="Admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* User Table */}
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No users found
              </td>
            </tr>
          )}
          {filteredUsers.map((u) => (
            u && u._id && (
              <tr key={u._id} className="border-b">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="User">User</option>
                    <option value="TravelAgency">TravelAgency</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded ${
                      u.status === "active"
                        ? "bg-green-200 text-green-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => toggleStatus(u._id, u.status)}
                    className={`px-3 py-1 rounded ${
                      u.status === "active"
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {u.status === "active" ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => deleteUser(u._id)}
                    className="px-3 py-1 bg-gray-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
