import React, { useContext, useEffect, useState } from "react";
import { Bell, Settings, LogOut } from "lucide-react";
import { AuthContext } from "../pages/Context/Authcontext";
import { useNavigate } from "react-router-dom";

const sectionTitles = {
  dashboard: "Dashboard",
  "scheme-management": "Scheme Management",
  schemes: "Scheme Management",
  approvals: "Proposal Approvals",
  grants: "Quotations/SE/UC Grants",
  fundCycle: "Fund Cycle Approval",
  requests: "Requests Management",
};

const AdminNavbar = ({ activeSection }) => {
  const { getAdmin, logout } = useContext(AuthContext);
  const [admin, setAdmin] = useState(() => {
    // Try to get from sessionStorage first
    const savedAdmin = sessionStorage.getItem("adminData");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminDetails = async () => {
      // Only fetch if admin data is not already in state
      if (!admin) {
        try {
          const adminData = await getAdmin();
          setAdmin(adminData);
          // Store in sessionStorage for persistence
          sessionStorage.setItem("adminData", JSON.stringify(adminData));
        } catch (error) {
          console.error("Error fetching admin details:", error);
        }
      }
    };
    fetchAdminDetails();
  }, [getAdmin, admin]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    // Clear session storage before logout
    sessionStorage.removeItem("adminData");
    logout();
    setShowLogoutModal(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
        <div>
          <img src="/3.png" alt="ResearchX Logo" className="w-56 h-25 object-contain" />
        </div>
        <div className="flex space-x-4">
          {admin && (
            <p className="mx-auto text-sm text-gray-500">
              Welcome, {admin.name}
              <br /> ({admin.role})
            </p>
          )}
          <button
            className="p-2 bg-red-100 text-red-700 rounded-md flex items-center hover:bg-red-200 transition"
            onClick={handleLogoutClick}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={handleCancelLogout}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={handleConfirmLogout}
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

export default AdminNavbar;