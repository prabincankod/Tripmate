import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye, MoreHorizontal } from "lucide-react";
import api from "../../utils/apiUtiles";
import Loader from "../../components/common/Loader";

const AdminRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: "", rec: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const backendURL = "http://localhost:4000";

  // Fetch all recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/recommendations/all");
      if (res.data.success) setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Handle approve/reject confirmation
  const handleActionClick = (rec, type) => {
    setActionModal({ open: true, type, rec });
    setDropdownOpen(null);
  };

  const confirmAction = async () => {
    if (!actionModal.rec) return;
    const id = actionModal.rec._id;
    setActionLoading(id);

    try {
      const url =
        actionModal.type === "approve"
          ? `/admin/recommendations/${id}/approve`
          : `/admin/recommendations/${id}/reject`;
      const res = await api.patch(url);
      if (res.data.success) fetchRecommendations();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
      setActionModal({ open: false, type: "", rec: null });
    }
  };

  // Filter recommendations
  const filteredRecs = recommendations
    .filter((rec) =>
      rec.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.recommendedBy?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((rec) => (statusFilter === "all" ? true : rec.status === statusFilter));

  // Summary counts
  const total = recommendations.length;
  const approved = recommendations.filter(r => r.status === "approved").length;
  const rejected = recommendations.filter(r => r.status === "rejected").length;
  const pending = recommendations.filter(r => r.status === "pending").length;

  const statusCards = [
    { title: "Pending", value: pending },
    { title: "Approved", value: approved },
    { title: "Rejected", value: rejected },
    { title: "Total", value: total },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 sticky top-0 bg-gray-50 z-10">Manage Recommendations</h2>

      {/* Status Cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        {statusCards.map((card, idx) => (
          <div key={idx} className="px-4 py-3 rounded-lg shadow bg-white border font-semibold">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center sticky top-[80px] bg-gray-50 z-10 p-2">
        {/* Search */}
        <div className="flex items-center gap-2 max-w-sm">
          <input
            type="text"
            placeholder="Search by place, location, or user"
            className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Loader fullscreen={false} />
      ) : filteredRecs.length === 0 ? (
        <p className="text-center text-gray-600">No recommendations found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-2 border-b text-left">User</th>
                <th className="px-4 py-2 border-b text-left">Place</th>
                <th className="px-4 py-2 border-b text-left">Location</th>
                <th className="px-4 py-2 border-b text-center">Images</th>
                <th className="px-4 py-2 border-b text-center">Status</th>
                <th className="px-4 py-2 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecs.map((rec) => (
                <tr key={rec._id} className="hover:bg-gray-50 transition-all">
                  <td className="px-4 py-2 border-b">{rec.recommendedBy?.name || "User"}</td>
                  <td className="px-4 py-2 border-b">{rec.placeName}</td>
                  <td className="px-4 py-2 border-b">{rec.location}, {rec.country}</td>

                  {/* Image Dots */}
                  <td className="px-4 py-2 border-b text-center">
                    {rec.images?.length > 0 ? (
                      <button
                        onClick={() => setSelectedRec(rec)}
                        className="flex justify-center items-center gap-1 text-gray-600 hover:text-blue-600"
                        title={`View ${rec.images.length} images`}
                      >
                        {rec.images.slice(0, 3).map((_, idx) => (
                          <span key={idx} className="h-2 w-2 bg-gray-400 rounded-full inline-block"></span>
                        ))}
                        {rec.images.length > 3 && (
                          <span className="text-xs text-gray-500">+{rec.images.length - 3}</span>
                        )}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2 border-b text-center capitalize">
                    <span className="px-2 py-1 rounded-full text-xs font-medium border text-gray-600">
                      {rec.status}
                    </span>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-4 py-2 border-b text-center relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === rec._id ? null : rec._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {dropdownOpen === rec._id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-lg z-20">
                        <button
                          onClick={() => handleActionClick(rec, "approve")}
                          className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-600 flex items-center gap-1"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleActionClick(rec, "reject")}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-1"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                        <button
                          onClick={() => setSelectedRec(rec)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 flex items-center gap-1"
                        >
                          <Eye size={16} /> View
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Recommendation Modal */}
      {selectedRec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 text-xl font-bold"
              onClick={() => setSelectedRec(null)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">{selectedRec.placeName}</h3>
            <p className="text-gray-600 mb-1">
              <strong>Location:</strong> {selectedRec.location}, {selectedRec.country}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Recommended by:</strong> {selectedRec.recommendedBy?.name} ({selectedRec.credentials})
            </p>
            {selectedRec.description && <p className="mb-1"><strong>Description:</strong> {selectedRec.description}</p>}
            {selectedRec.highlights?.length > 0 && <p className="mb-1"><strong>Highlights:</strong> {selectedRec.highlights.join(", ")}</p>}
            {selectedRec.travelTips && <p className="mb-1"><strong>Travel Tips:</strong> {selectedRec.travelTips}</p>}
            {selectedRec.bestTimeToVisit && <p className="mb-1"><strong>Best Time:</strong> {selectedRec.bestTimeToVisit}</p>}
            {selectedRec.culturalInfo && <p className="mb-1"><strong>Cultural Info:</strong> {selectedRec.culturalInfo}</p>}
            {selectedRec.reason && <p className="mb-1"><strong>Reason:</strong> {selectedRec.reason}</p>}
            {selectedRec.experience && <p className="mb-1"><strong>Experience:</strong> {selectedRec.experience}</p>}

            {selectedRec.images?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {selectedRec.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${backendURL}${img}`}
                    alt={`img-${idx}`}
                    className="h-24 w-full object-cover rounded cursor-pointer"
                    onClick={() => window.open(`${backendURL}${img}`, "_blank")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve/Reject Confirmation Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg text-center">
            <p className="mb-4">
              Are you sure you want to <strong>{actionModal.type}</strong> <strong>{actionModal.rec.placeName}</strong>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmAction}
                className={`px-4 py-2 rounded text-white ${
                  actionModal.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading === actionModal.rec._id ? "Processing..." : "Yes"}
              </button>
              <button
                onClick={() => setActionModal({ open: false, type: "", rec: null })}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecommendations;

