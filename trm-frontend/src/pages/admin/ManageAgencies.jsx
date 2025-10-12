import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Eye, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/apiUtiles";
import Loader from "../../components/common/Loader";

const ManageAgencies = () => {
  const { isAdmin } = useAuth();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState({ id: null, show: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  const changeStatus = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/agency-applications/${id}/status`, { status });
      fetchAgencies();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeleteAgency = (id) => setDeleteMessage({ id, show: true });
  const cancelDelete = () => setDeleteMessage({ id: null, show: false });

  const deleteAgency = async (id) => {
    setActionLoading(id);
    try {
      await api.delete(`/agency-applications/${id}`);
      setDeleteMessage({ id: null, show: false });
      fetchAgencies();
    } catch (err) {
      console.error("Error deleting agency:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return <p className="text-red-500 font-semibold text-center mt-6">Access denied. Admins only.</p>;
  }

  // Filter logic
  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.agencyEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || agency.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 bg-opacity-60 backdrop-blur-md px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Manage Agencies
        </h2>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-sm">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <Loader fullscreen={false} />
        ) : filteredAgencies.length === 0 ? (
          <p className="text-center text-gray-600">No agencies found.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-xl border border-gray-200">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-200 text-gray-700 font-semibold">
                <tr>
                  <th className="px-5 py-3 text-left border-b">Agency Name</th>
                  <th className="px-5 py-3 text-left border-b">Email</th>
                  <th className="px-5 py-3 text-left border-b">License</th>
                  <th className="px-5 py-3 text-left border-b">Documents</th>
                  <th className="px-5 py-3 text-left border-b">Status</th>
                  <th className="px-5 py-3 text-left border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgencies.map((agency, i) => (
                  <tr
                    key={agency._id}
                    className={`${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-5 py-3 border-b font-medium text-gray-900">
                      {agency.agencyName}
                    </td>
                    <td className="px-5 py-3 border-b">{agency.agencyEmail}</td>
                    <td className="px-5 py-3 border-b">{agency.licenseNumber}</td>
                    <td className="px-5 py-3 border-b flex flex-wrap gap-2">
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
                    <td className="px-5 py-3 border-b">
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
                    <td className="px-5 py-3 border-b flex flex-wrap gap-2">
                      {agency.status !== "Approved" && (
                        <button
                          onClick={() => changeStatus(agency._id, "Approved")}
                          disabled={actionLoading === agency._id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-black disabled:opacity-50 text-xs"
                        >
                          <CheckCircle size={14} />
                          {actionLoading === agency._id ? "Updating..." : "Approve"}
                        </button>
                      )}
                      {agency.status !== "Rejected" && (
                        <button
                          onClick={() => changeStatus(agency._id, "Rejected")}
                          disabled={actionLoading === agency._id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 text-xs"
                        >
                          <XCircle size={14} />
                          {actionLoading === agency._id ? "Updating..." : "Reject"}
                        </button>
                      )}

                      {deleteMessage.show && deleteMessage.id === agency._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteAgency(agency._id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-3 py-1.5 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => confirmDeleteAgency(agency._id)}
                          disabled={actionLoading === agency._id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 text-xs"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Document Modal */}
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
      </div>
    </div>
  );
};

export default ManageAgencies;


