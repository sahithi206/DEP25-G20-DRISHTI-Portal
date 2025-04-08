import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaFacebook, FaTwitter } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

const Navbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
          <span className="hover:text-gray-300 cursor-pointer">Gallery</span>
          
           <FaUserCircle className="text-2xl" />
                  {<span>Welcome, Institute</span>}
          <FaUserCircle className="text-2xl cursor-pointer hover:text-gray-300" onClick={() => navigate("/login")} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
