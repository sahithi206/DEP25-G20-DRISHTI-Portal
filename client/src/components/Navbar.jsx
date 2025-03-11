import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaFacebook, FaTwitter } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-100 text-gray-900">
      {/* Top Bar - Social Media Icons */}
      <div className="flex justify-end items-center p-2 bg-gray-200 text-sm">
        <FaFacebook className="mx-2 cursor-pointer hover:text-blue-600" />
        <FaTwitter className="mx-2 cursor-pointer hover:text-blue-400" />
      </div>

      {/* Main Navbar */}
      <div className="flex justify-between items-center px-8 py-3 bg-teal-700 text-white">
        {/* Logo & Name */}
        <div>
          <h1 className="text-lg font-bold leading-tight">
            अनुसंधान नेशनल रिसर्च फाउंडेशन <br />
            <span className="text-sm" onClick={() => navigate("/")}>Anusandhan National Research Foundation</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <span className="hover:text-gray-300 cursor-pointer" onClick={() => navigate("/aboutus")}>About Us</span>

          <div className="relative">
            <button
              className="flex items-center space-x-1 hover:text-gray-300"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            >
              <span>ANRF Programs</span>
              <IoMdArrowDropdown />
            </button>
            {isDropdownOpen && (
              <div className="absolute mt-2 bg-white text-black p-2 shadow-md">
                {["Program 1", "Program 2", "Program 3", "Program 4", "Program 5"].map((item, index) => (
                  <p key={index} className="p-1 hover:bg-gray-200 cursor-pointer">{item}</p>
                ))}
              </div>
            )}
          </div>

          <span className="hover:text-gray-300 cursor-pointer">Erstwhile SERB Schemes</span>
          <span className="hover:text-gray-300 cursor-pointer">Downloads</span>
          <span className="hover:text-gray-300 cursor-pointer">Contact Us</span>
          <span className="hover:text-gray-300 cursor-pointer">Guidelines</span>
          <span className="hover:text-gray-300 cursor-pointer">Gallery</span>

          {/* User Profile Icon */}
          <FaUserCircle className="text-2xl cursor-pointer hover:text-gray-300" onClick={() => navigate("/login")} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
