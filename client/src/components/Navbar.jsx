import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaFacebook, FaTwitter } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-gray-100 text-gray-900">

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
          <span className="hover:text-gray-300 cursor-pointer">Contact Us</span>
          <span className="hover:text-gray-300 cursor-pointer">Gallery</span>

          <FaUserCircle className="text-2xl cursor-pointer hover:text-gray-300" onClick={() => navigate("/login")} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
