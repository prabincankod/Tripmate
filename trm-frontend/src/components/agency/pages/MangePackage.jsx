import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../tool/SideBar";
import PackageForm from "./PackageForm";
import { MoreVertical, Trash2, Edit3 } from "lucide-react";
import { toast } from "react-hot-toast";

// Dropdown component
const Dropdown = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-gray-100"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-50 flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
};

const ManagePackage = () => {
  const [packages, setPackages] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:4000/api/packages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPackages(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch packages");
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPackages(packages.filter((p) => p._id !== id));
      toast.success("Package deleted successfully");
      if (expandedRow === id) setExpandedRow(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete package");
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleRowClick = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleCreateClick = () => {
    setEditingPackage(null);
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 sticky top-0 h-screen bg-white shadow-md">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center bg-white shadow rounded-lg p-4 mb-4 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800">Travel Packages</h2>
          <button
            onClick={handleCreateClick}
            className="bg-green-900 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold shadow flex items-center gap-2"
          >
            + Create Package
          </button>
        </div>

        {/* Package Form */}
        {showForm && (
          <div ref={formRef} className="relative mb-4">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-800 text-xl font-bold z-20"
            >
              ×
            </button>
            <PackageForm
              editingPackage={editingPackage}
              onSuccess={() => {
                fetchPackages();
                toast.success("Package saved successfully");
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Packages Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <React.Fragment key={pkg._id}>
                    <tr
                      className="cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => handleRowClick(pkg._id)}
                    >
                      <td className="px-6 py-4">{pkg.name}</td>
                      <td className="px-6 py-4">{pkg.location}</td>
                      <td className="px-6 py-4">Rs. {pkg.price}</td>
                      <td className="px-6 py-4">{pkg.duration}</td>
                      <td className="px-6 py-4">{pkg.category}</td>
                      <td className="px-6 py-4 flex justify-center">
                        <Dropdown>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(pkg);
                            }}
                            className="px-2 py-1 text-sm text-blue-600 hover:bg-gray-100 rounded w-full text-left flex items-center gap-1"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(pkg._id);
                            }}
                            className="px-2 py-1 text-sm text-red-600 hover:bg-gray-100 rounded w-full text-left flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </Dropdown>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRow === pkg._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-3">
                            <p><strong>Overview:</strong> {pkg.overview}</p>
                            {pkg.imageUrl && (
                              <img
                                src={pkg.imageUrl}
                                alt={pkg.name}
                                className="w-64 h-40 object-cover rounded"
                              />
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <p><strong>Transport on Arrival:</strong> {pkg.transportAvailableOnArrival ? "Yes" : "No"}</p>
                              <p><strong>Agency:</strong> {pkg.agency?.name}</p>
                              <p><strong>Agency Location:</strong> {pkg.agency?.location}</p>
                            </div>
                            {pkg.highlights?.length > 0 && (
                              <p><strong>Highlights:</strong> {pkg.highlights.join(", ")}</p>
                            )}
                            {pkg.policy && (
                              <div>
                                <p><strong>Included:</strong> {pkg.policy.included?.join(", ")}</p>
                                <p><strong>Excluded:</strong> {pkg.policy.excluded?.join(", ")}</p>
                                <p><strong>Cancellation:</strong> {pkg.policy.cancellation}</p>
                                <p><strong>Payment:</strong> {pkg.policy.payment}</p>
                              </div>
                            )}
                            {pkg.itinerary?.length > 0 && (
                              <div>
                                <p><strong>Itinerary:</strong></p>
                                <ul className="list-disc ml-5">
                                  {pkg.itinerary.map((day) => (
                                    <li key={day.day}>
                                      Day {day.day}: {day.title} | Activities: {day.activities?.join(", ")} | Meals: {day.meals?.join(", ")} | Accommodation: {day.accommodation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No packages available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePackage;



