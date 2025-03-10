import React, { useContext, useEffect, useState } from "react";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";
import { AuthContext } from "../pages/Context/Authcontext";

const Navbar = () => {
  const { getuser } = useContext(AuthContext);
  const [user, setUser] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getuser();
      setUser(userData);
    };

    fetchUser();
  }, [getuser]);
  console.log(user);

  return (
    <header className="bg-blue-900 text-white p-4 flex justify-between items-center ">
      <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
      <div className="flex items-center space-x-4">
        <FaUserCircle className="text-2xl" />
        {user && (
          <span>Welcome, {user.Name}</span>
        )}
        <FaPowerOff className="text-xl cursor-pointer text-red-500" />
      </div>
    </header>
  );
};

export default Navbar;