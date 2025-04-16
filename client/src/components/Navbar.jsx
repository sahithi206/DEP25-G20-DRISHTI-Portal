import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";

const url = import.meta.env.VITE_REACT_APP_URL;

const Navbar = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: "" }); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

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

      const res = await axios.get(`${url}institute/profile`, config);
      setProfile(res.data.institute); 
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-gray-100 text-gray-900">
      <div className="flex justify-between items-center px-8 py-2 bg-teal-700 text-white">
        <div>
          <h1 className="text-3xl font-bold leading-tight space-y-1">
            <span className="mb-1">ResearchX</span><br />
            <span className="text-sm" onClick={() => navigate("/")}>Research Grant Management portal</span>
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigate("/aboutus")}>About Us</span>
          <span className="hover:text-gray-300 cursor-pointer">Contact Us</span>
          <span className="hover:text-gray-300 cursor-pointer">Gallery </span>

          <FaUserCircle className="text-2xl cursor-pointer hover:text-gray-300" onClick={() => navigate("/institute/profile")} />
          
          <span>Welcome, {profile.name}</span>

          <FontAwesomeIcon
            icon={faPowerOff}
            className="text-2xl cursor-pointer hover:text-gray-300"
            onClick={() => navigate("/login")}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
