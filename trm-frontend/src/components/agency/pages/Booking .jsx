import React, { useEffect, useState, useRef } from "react";
import api from "../../../utils/apiUtiles";
import Loader from "../../common/Loader";
import Sidebar from "../tool/SideBar";
import { MoreVertical, Trash2 } from "lucide-react";

// Dropdown component
const Dropdown = ({ content }) => {
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
        <div className="absolute right-0 mt-1 w-56 bg-white border rounded shadow-md z-10 p-2 flex flex-col gap-1">
          {content}
        </div>
      )}
    </div>
  );
};

const AgencyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRefunded, setFilterRefunded] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/bookings/agency");
      if (data.success) setBookings(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (bookingId, action) => {
    try {
      const { data } = await api.put(`/bookings/${bookingId}/status`, { action });
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? data.data : b))
        );
        setMessage(`Booking ${data.data.status.toLowerCase()} successfully`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error updating booking");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (booking) => {
    try {
      const { data } = await api.delete(`/bookings/${booking._id}`);
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b._id !== booking._id));
        setMessage("Booking deleted successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error deleting booking");
      setTimeout(() => setMessage(""), 3000);
    }
  };

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
              <tr className="bg-gray-100 text-center">
                <th className="border px-4 py-2">Booking ID</th>
                <th className="border px-4 py-2">User</th>
                <th className="border px-4 py-2">Package</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedBookings.map((booking) => (
                <tr key={booking._id} className="text-center">
                  <td className="border px-4 py-2">{booking.bookingId}</td>

                  {/* User column with dropdown */}
                  <td className="border px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <span className="truncate min-w-0">{booking.user?.name ?? "N/A"}</span>
                      <Dropdown
                        content={
                          <>
                            <p className="text-sm"><strong>Name:</strong> {booking.user?.name}</p>
                            <p className="text-sm"><strong>Phone:</strong> {booking.user?.phoneNumber}</p>
                          </>
                        }
                      />
                    </div>
                  </td>

                  {/* Package column with dropdown */}
                  <td className="border px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <span className="truncate min-w-0">{booking.travelPackage?.name ?? "N/A"}</span>
                      <Dropdown
                        content={
                          <>
                            <p className="text-sm"><strong>Package:</strong> {booking.travelPackage?.name}</p>
                            <p className="text-sm"><strong>Travellers:</strong> {booking.numberOfTravellers}</p>
                            <p className="text-sm"><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleString()}</p>
                            <p className="text-sm"><strong>Days:</strong> {booking.travelPackage?.duration}</p>
                            <p className="text-sm"><strong>Price:</strong> Rs {booking.travelPackage?.price}</p>
                          </>
                        }
                      />
                    </div>
                  </td>

                  <td className={`border px-4 py-2 font-semibold ${booking.status === "Refunded" ? "text-green-600" : booking.status === "Cancelled" ? "text-red-600" : booking.status === "Confirmed" ? "text-blue-600" : "text-gray-600"}`}>
                    {booking.status}
                  </td>

                  {/* Action column dropdown */}
                  <td className="border px-4 py-2">
                    <div className="flex items-center justify-center">
                      <Dropdown
                        content={
                          <>
                            {booking.status !== "Refunded" && (
                              <button
                                onClick={() => handleAction(booking._id, "cancel")}
                                className="px-2 py-1 text-sm text-red-600 hover:bg-gray-100 rounded w-full text-left"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(booking._id, "confirm")}
                              className="px-2 py-1 text-sm text-green-600 hover:bg-gray-100 rounded w-full text-left"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleDelete(booking)}
                              className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left flex items-center gap-1"
                            >
                              <Trash2 size={14}/> Delete
                            </button>
                          </>
                        }
                      />
                    </div>
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








