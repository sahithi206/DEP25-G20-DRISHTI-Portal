import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

const url = import.meta.env.VITE_REACT_APP_URL;

const Navbar = ({ yes }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get the stakeholder type from localStorage
  const stakeholderType = localStorage.getItem("stakeholderType") || "institute";

  useEffect(() => {
    if (yes) {
      fetchProfile();
    }
  }, [yes]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          "accessToken": token,
        },
      };

      // Choose the endpoint based on stakeholder type
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

      // Handle different response structures based on stakeholder type
      if (stakeholderType === "pi") {
        setProfile(res.data.pi || res.data);
      } else if (stakeholderType === "agency") {
        setProfile(res.data.agency || res.data);
      } else {
        setProfile(res.data.institute || res.data);
      }

      setError(null);
    } catch (err) {
      console.error(`Error fetching ${stakeholderType} profile:`, err);
      setError(`Error fetching ${stakeholderType} profile`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("stakeholderType");
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
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />
          </h1>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-8">
          <span
            className="hover:text-gray-300 cursor-pointer"
            onClick={() => navigate("/aboutus")}
          >
            About Us
          </span>

          <FaUserCircle
            className="text-2xl cursor-pointer hover:text-gray-300"
            onClick={navigateToProfile}
          />

          {yes && <span className="ml-2">{getWelcomeMessage()}</span>}

          {yes && (
            <FontAwesomeIcon
              icon={faPowerOff}
              className="text-2xl cursor-pointer hover:text-gray-300 ml-4"
              onClick={handleLogout}
            />
          )}
        </div>
      </div>

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