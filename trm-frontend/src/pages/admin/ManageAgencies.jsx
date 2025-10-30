// src/pages/admin/ManageAgencies.jsx
// src/pages/admin/ManageAgencies.jsx
import React, { useState, useEffect, useRef } from "react";
import { Check, X, Eye, Search, MoreHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/apiUtiles";
import Loader from "../../components/common/Loader";

const ManageAgencies = () => {
  const { isAdmin } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [confirmAction, setConfirmAction] = useState({ show: false, id: null, type: "" });
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const dropdownRef = useRef(null);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/agency-applications");
      setAgencies(res.data.applications || []);
    } catch (err) {
      console.error("Error fetching agencies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchAgencies();
  }, [isAdmin]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/agency-applications/${id}/status`, { status });
      fetchAgencies();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteAgency = async (id) => {
    try {
      await api.delete(`/agency-applications/${id}`);
      fetchAgencies();
    } catch (err) {
      console.error("Error deleting agency:", err);
    }
  };

  if (!isAdmin)
    return (
      <p className="text-center text-red-500 font-semibold mt-10">
        Access denied. Admins only.
      </p>
    );

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.agencyEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || agency.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-3xl font-bold text-gray-800">Manage Agencies</h2>
        <div className="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        {loading ? (
          <Loader fullscreen={false} />
        ) : filteredAgencies.length === 0 ? (
          <p className="text-center text-gray-500 p-6">No agencies found.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-700 border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-5 py-3 text-left font-semibold border-b">Agency Name</th>
                <th className="px-5 py-3 text-left font-semibold border-b">Email</th>
                <th className="px-5 py-3 text-left font-semibold border-b">License</th>
                <th className="px-5 py-3 text-left font-semibold border-b">Documents</th>
                <th className="px-5 py-3 text-left font-semibold border-b">Status</th>
                <th className="px-5 py-3 text-center font-semibold border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgencies.map((agency, idx) => (
                <tr key={agency._id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}>
                  <td className="px-5 py-3 font-medium">{agency.agencyName}</td>
                  <td className="px-5 py-3">{agency.agencyEmail}</td>
                  <td className="px-5 py-3">{agency.licenseNumber}</td>
                  <td className="px-5 py-3 flex flex-wrap gap-2">
                    {agency.documents && agency.documents.length > 0 ? (
                      agency.documents.map((doc, i) => {
                        const isImage = /\.(jpg|jpeg|png)$/i.test(doc);
                        const isPdf = /\.pdf$/i.test(doc);
                        return (
                          <button
                            key={i}
                            onClick={() =>
                              setSelectedDoc(`http://localhost:4000/uploads/${doc}`)
                            }
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition text-xs"
                          >
                            <Eye size={14} />
                            {isImage ? "Image" : isPdf ? "PDF" : "File"}
                          </button>
                        );
                      })
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agency.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : agency.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {agency.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center relative" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setDropdownOpen(dropdownOpen === agency._id ? null : agency._id)
                      }
                      className="px-3 py-1.5 bg-gray-700 text-white rounded-md hover:bg-black text-xs flex items-center justify-center gap-1"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {dropdownOpen === agency._id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        {agency.status !== "Approved" && (
                          <button
                            onClick={() =>
                              setConfirmAction({ show: true, id: agency._id, type: "approve" })
                            }
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                          >
                            Approve
                          </button>
                        )}
                        {agency.status !== "Rejected" && (
                          <button
                            onClick={() =>
                              setConfirmAction({ show: true, id: agency._id, type: "reject" })
                            }
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setConfirmAction({ show: true, id: agency._id, type: "delete" })
                          }
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl relative max-w-4xl w-full shadow-2xl">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setSelectedDoc(null)}
            >
              ✕
            </button>
            {selectedDoc.endsWith(".pdf") ? (
              <iframe
                src={selectedDoc}
                className="w-full h-[500px] rounded-md border border-gray-200"
                title="PDF Viewer"
              ></iframe>
            ) : (
              <img
                src={selectedDoc}
                alt="Document"
                className="w-full max-h-[500px] object-contain rounded-md border border-gray-200"
              />
            )}
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {confirmAction.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl text-center max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to{" "}
              {confirmAction.type === "approve"
                ? "approve"
                : confirmAction.type === "reject"
                ? "reject"
                : "delete"}{" "}
              this agency?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  if (confirmAction.type === "approve")
                    await changeStatus(confirmAction.id, "Approved");
                  else if (confirmAction.type === "reject")
                    await changeStatus(confirmAction.id, "Rejected");
                  else if (confirmAction.type === "delete")
                    await deleteAgency(confirmAction.id);

                  setConfirmAction({ show: false, id: null, type: "" });
                  setDropdownOpen(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() =>
                  setConfirmAction({ show: false, id: null, type: "" })
                }
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAgencies;
