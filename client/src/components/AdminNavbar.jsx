import React, { useContext, useEffect, useState } from "react";
import { Bell, Settings, LogOut } from "lucide-react";
import { AuthContext } from "../pages/Context/Authcontext";
import { useNavigate } from "react-router-dom";

const sectionTitles = {
  dashboard: "Dashboard",
  "scheme-management": "Scheme Management",
  schemes: "Scheme Management",
  approvals: "Proposal Approvals",
  grants: "Quotations/SE/UC Grants",
  fundCycle: "Fund Cycle Approval",
  requests: "Requests Management",
};

const AdminNavbar = ({ activeSection }) => {
  const { getAdmin, logout } = useContext(AuthContext);
  const [admin, setAdmin] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminDetails = async () => {
      const adminData = await getAdmin();
      setAdmin(adminData);
    };
    fetchAdminDetails();
  }, [getAdmin]);


  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
      <div>
           <img src="/3.png" alt="ResearchX Logo" className=" w-56 h-25 object-contain"/>
       

      </div>
      <div className="flex space-x-4">
        {admin && (
          <p className=" mx-auto text-sm text-gray-500">
            Welcome, {admin.name} 
            <br/> ({admin.role})
          </p>
        )}
        <button
          className="p-2 bg-red-100 text-red-700 rounded-md flex items-center hover:bg-red-200 transition"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
