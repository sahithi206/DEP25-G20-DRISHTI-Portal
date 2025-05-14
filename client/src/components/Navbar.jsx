import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

const url = import.meta.env.VITE_REACT_APP_URL;

const Navbar = ({ yes }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    // Try to get from sessionStorage first
    const savedProfile = sessionStorage.getItem("userProfile");
    return savedProfile ? JSON.parse(savedProfile) : { name: "" };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Get the stakeholder type from localStorage
  const stakeholderType = localStorage.getItem("stakeholderType") || "institute";

  useEffect(() => {
    // Only fetch if logged in (yes=true) and no profile data in sessionStorage
    if (yes && !profile.name) {
      fetchProfile();
    }
  }, [yes]); // Only depend on the "yes" prop

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        return; // Exit if no token
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          "accessToken": token,
        },
      };

      let endpoint = "";
      switch (stakeholderType) {
        case "pi":
          endpoint = `${url}pi/profile`;
          break;
        case "agency":
          endpoint = `${url}agency/profile`;
          break;
        case "institute":
        default:
          endpoint = `${url}institute/profile`;
          break;
      }

      const res = await axios.get(endpoint, config);

      let profileData;
      // Handle different response structures based on stakeholder type
      if (stakeholderType === "pi") {
        profileData = res.data.pi || res.data;
      } else if (stakeholderType === "agency") {
        profileData = res.data.agency || res.data;
      } else {
        profileData = res.data.institute || res.data;
      }

      setProfile(profileData);
      // Store in sessionStorage for persistence
      sessionStorage.setItem("userProfile", JSON.stringify(profileData));

      setError(null);
    } catch (err) {
      console.error(`Error fetching ${stakeholderType} profile:`, err);
      setError(`Error fetching ${stakeholderType} profile`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear both localStorage and sessionStorage on logout
    localStorage.removeItem("token");
    localStorage.removeItem("stakeholderType");
    sessionStorage.removeItem("userProfile");
    sessionStorage.removeItem("instituteUser"); // Clear sidebar user data too
    navigate("/");
  };

  const handleStakeholderSelection = (type) => {
    setShowModal(false);

    switch (type) {
      case "pi":
        navigate("/login");
        break;
      case "agency":
        navigate("/adminLogin");
        break;
      case "institute":
        navigate("/institute-login");
        break;
      default:
        navigate("/login");
    }
  };

  // Dynamic profile navigation based on stakeholder type
  const navigateToProfile = () => {
    if (!yes) {
      setShowModal(true);
      return;
    }

    switch (stakeholderType) {
      case "pi":
        navigate("/pi/profile");
        break;
      case "agency":
        navigate("/agency/profile");
        break;
      case "institute":
      default:
        navigate("/institute/profile");
        break;
    }
  };

  // Get welcome message based on stakeholder type
  const getWelcomeMessage = () => {
    if (!profile.name) return `Welcome, ${stakeholderType.charAt(0).toUpperCase() + stakeholderType.slice(1)}`;
    return `Welcome, ${profile.name}`;
  };

  return (
    <nav className="w-full bg-gray-100 text-gray-900">
      <div className="w-full flex justify-between items-center py-2 bg-teal-700 text-white px-4 sm:px-8">
        <div>
          <h1 className="text-3xl font-bold leading-tight">
            <img
              src="/4.png"
              alt="ResearchX Logo"
              className="mx-auto w-56 h-25 object-contain"
            />
          </h1>
        </div>
        <div className="flex justify-between">
          <FaUserCircle
            className="text-2xl cursor-pointer hover:text-gray-300"
            onClick={yes ? navigateToProfile : () => setShowModal(true)}
          />

          {yes && (
            <>
              <span className="ml-2">{loading ? "Loading..." : getWelcomeMessage()}</span>
              <FontAwesomeIcon
                icon={faPowerOff}
                className="text-2xl cursor-pointer hover:text-gray-300 ml-4"
                onClick={() => setShowLogout(true)}
              />
            </>
          )}
        </div>
      </div>

      {showLogout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowLogout(false)}
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
      {/* Stakeholder Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-teal-800 mb-2 text-center">
              Welcome to ResearchX
            </h2>
            <h3 className="text-xl font-bold text-teal-800 mb-4 text-center"> Sign in as:</h3>

            <div className="space-y-4">
              <button
                onClick={() => handleStakeholderSelection("pi")}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
              >
                Principal Investigator (PI)
              </button>

              <button
                onClick={() => handleStakeholderSelection("agency")}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
              >
                Agency
              </button>

              <button
                onClick={() => handleStakeholderSelection("institute")}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
              >
                Institute
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;