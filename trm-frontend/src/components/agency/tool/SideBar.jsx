import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Calendar, Package, User, LogOut } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard/agency" },
    { id: "bookings", label: "Bookings", icon: Calendar, path: "/agency/manage-booking" },
    { id: "packages", label: "Packages", icon: Package, path: "/agency/manage-package" },
    { id: "profile", label: "Profile", icon: User, path: "/agency/manage-profile" },
  ];

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  return (
    <>
      <div className="bg-white shadow-lg h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tripmate</h1>
              <p className="text-sm text-gray-500">Agency Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col justify-between">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all cursor-pointer duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="flex items-center space-x-3 px-4 py-3 mt-6 text-left rounded-lg text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-80 max-w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;


