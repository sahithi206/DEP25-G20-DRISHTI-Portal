import React, { useContext, useEffect, useState } from "react";
import { FaUserCircle,FaArrowLeft,FaPowerOff,FaChevronLeft } from "react-icons/fa";
import { AuthContext } from "../pages/Context/Authcontext";
import {useNavigate,useParams} from "react-router-dom";
const Navbar = ({isSidebarOpen, path}) => {
  const { getuser,logout } = useContext(AuthContext);
  const [user, setUser] = useState();
  const navigate=useNavigate()
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getuser();
      setUser(userData);
    };

    fetchUser();
  }, [getuser]);

  return (
    <header className={`bg-blue-900 text-white p-4 flex justify-between items-center fixed shadow-md z-50 transition-all duration-300 ${isSidebarOpen ? " w-[calc(100%-16rem)]" : " w-[calc(100%-4rem)]"}`}>
      <h2 className="text-2xl font-semibold">ResearchX</h2>
      <div className="flex items-center space-x-4">
        <FaChevronLeft className="text-2xl" onClick={()=>{navigate(path)}}  />
        <FaUserCircle className="text-2xl" />
        {user && <span>Welcome, {user.Name}</span>}
        <FaPowerOff className="text-xl cursor-pointer text-red-500" onClick={logout}/>
      </div>
    </header>

  );
};

export default Navbar;
