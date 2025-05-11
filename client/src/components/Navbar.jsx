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
    <nav className="w-full bg-gray-100 text-gray-900">
      <div className="w-full flex justify-between items-center py-2 bg-teal-700 text-white px-4 sm:px-8">
        <div>
          <h1 className="text-3xl font-bold leading-tight">
            <img src="/4.png" alt="ResearchX Logo" className="mx-auto w-56 h-25 object-contain" />
          </h1>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-8">
          <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigate("/aboutus")}>About Us</span>
{/*           <FaUserCircle
            className="text-2xl cursor-pointer hover:text-gray-300"
            onClick={() => navigate("/institute/profile")}
          /> */}
          <FaUserCircle className="text-2xl" onClick={() => navigate("/login")} />
{/*          {yes && <span className="ml-2">Welcome, Institute</span>}  */}
          {yes && <span className="ml-2">Welcome, {profile.name}</span>}
          {yes && (
            <FontAwesomeIcon
              icon={faPowerOff}
              className="text-2xl cursor-pointer hover:text-gray-300 ml-4"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
