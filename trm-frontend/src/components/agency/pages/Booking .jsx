import React, { useEffect, useState } from "react";
import api from "../../../utils/apiUtiles";
import Loader from "../../common/Loader";
import Sidebar from "../tool/SideBar";

const AgencyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRefunded, setFilterRefunded] = useState(false);
  const [message, setMessage] = useState("");
  const [remarksInput, setRemarksInput] = useState({});

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/bookings/agency");
      if (data.success) setBookings(data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update booking status
  const handleAction = async (bookingId, action) => {
    const remark = remarksInput[bookingId] || "";
    try {
      const { data } = await api.put(`/bookings/${bookingId}/status`, {
        action,
        remark,
      });

      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? data.data : b))
        );

        // Clear remark input
        setRemarksInput((prev) => {
          const updated = { ...prev };
          delete updated[bookingId];
          return updated;
        });

        setMessage(`Booking ${data.data.status.toLowerCase()} successfully`);
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      setMessage("Error updating booking");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // Filter and search
  const displayedBookings = bookings
    .filter((b) =>
      (b.travelPackage?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((b) => (filterRefunded ? b.status === "Refunded" : true));

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 sticky top-0 h-screen bg-white shadow-md">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">My Bookings</h2>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">{message}</div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by package name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-64"
          />
          <label className="flex items-center gap-2 mt-2 md:mt-0">
            <input
              type="checkbox"
              checked={filterRefunded}
              onChange={() => setFilterRefunded(!filterRefunded)}
            />
            Show only refunded bookings
          </label>
        </div>

        {displayedBookings.length === 0 ? (
          <p>No bookings to display.</p>
        ) : (
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Booking ID</th>
                <th className="border px-4 py-2">User</th>
                <th className="border px-4 py-2">Phone</th>
                <th className="border px-4 py-2">Package</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Duration</th>
                <th className="border px-4 py-2">Travellers</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Booking Date</th>
                <th className="border px-4 py-2">Remarks</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedBookings.map((booking) => (
                <tr key={booking._id} className="text-center">
                  <td className="border px-4 py-2">{booking.bookingId}</td>
                  <td className="border px-4 py-2">{booking.user?.name ?? "N/A"}</td>
                  <td className="border px-4 py-2">{booking.user?.phoneNumber ?? "N/A"}</td>
                  <td className="border px-4 py-2">{booking.travelPackage?.name ?? "N/A"}</td>
                  <td className="border px-4 py-2">Rs {booking.travelPackage?.price}</td>
                  <td className="border px-4 py-2">{booking.travelPackage?.duration}</td>
                  <td className="border px-4 py-2">{booking.numberOfTravellers}</td>
                  <td
                    className={`border px-4 py-2 font-semibold ${
                      booking.status === "Refunded"
                        ? "text-green-600"
                        : booking.status === "Cancelled"
                        ? "text-red-600"
                        : booking.status === "Confirmed"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {booking.status}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(booking.bookingDate).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">{booking.remarks ?? "-"}</td>
                  <td className="border px-4 py-2">
                    {["Refunded", "Cancelled"].includes(booking.status) ? (
                      <span className="font-semibold">{booking.status}</span>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter remark"
                          value={remarksInput[booking._id] || ""}
                          onChange={(e) =>
                            setRemarksInput((prev) => ({
                              ...prev,
                              [booking._id]: e.target.value,
                            }))
                          }
                          className="border px-2 py-1 rounded w-full mb-1"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleAction(booking._id, "cancel")}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAction(booking._id, "confirm")}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Confirm
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AgencyBookings;





