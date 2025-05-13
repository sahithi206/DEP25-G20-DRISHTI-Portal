import React, { useContext, useEffect, useState } from "react";
import { FaUserCircle, FaChevronLeft, FaPowerOff } from "react-icons/fa";
import { AuthContext } from "../pages/Context/Authcontext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isSidebarOpen, path }) => {
  const { getuser, logout } = useContext(AuthContext);
  const [user, setUser] = useState();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getuser();
      setUser(userData);
    };
    fetchUser();
  }, [getuser]);

  const handleLogout = () => {
    logout();
    setShowModal(false);
  };

  return (
    <>
      <header
        className={`bg-blue-900 text-white p-4 flex justify-between items-center fixed shadow-md z-50 transition-all duration-300 ${
          isSidebarOpen ? "w-[calc(100%-16rem)]" : "w-[calc(100%-4rem)]"
        }`}
      >
        <div className="ml-auto flex items-center space-x-4">
          <FaChevronLeft onClick={() => navigate(path)} className="cursor-pointer" />
          <FaUserCircle className="text-2xl" />
          {user && <span>Welcome, {user.Name || "PI"}</span>}
          <FaPowerOff
            className="text-xl cursor-pointer text-red-500"
            onClick={(e) => {
              e.preventDefault();
              setShowModal(true);
            }}
          />
        </div>
      </header>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleLogout}
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

export default Navbar;
