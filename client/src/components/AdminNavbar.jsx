// import React, { useContext, useEffect, useState } from "react";
// import { Bell, Settings, LogOut } from "lucide-react";
// import { AuthContext } from "../pages/Context/Authcontext";
// import { useNavigate, useParams } from "react-router-dom";

// const sectionTitles = {
//   dashboard: "Dashboard",
//   schemes: "Scheme Management",
//   approvals: "Proposal Approvals",
//   grants: "Quotations/SE/UC Grants",
//   fundCycle: "Fund Cycle Approval",
//   requests: "Requests Management",
// };

// const AdminNavbar = ({ activeSection }) => {
//   const { getAdmin, logout } = useContext(AuthContext);
//   const [admin, setAdmin] = useState();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAdminDetails = async () => {
//       const adminData = await getAdmin();
//       setAdmin(adminData);
//     };

//     fetchAdminDetails();
//   }, [getAdmin]);

//   const title = sectionTitles[activeSection] || "Admin Dashboard";
//   console.log("Navbar Title:", title);
//   return (
//     <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
//       <h1 className="text-2xl font-semibold">{title}</h1>
//       <div className="flex space-x-4">
//         <button className="p-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600 transition">
//           <Bell className="w-5 h-5" />
//         </button>
//         <button className="p-2 bg-gray-500 text-white rounded-md flex items-center hover:bg-gray-600 transition">
//           <Settings className="w-5 h-5" />
//         </button>
//         <button className="p-2 bg-red-500 text-white rounded-md flex items-center hover:bg-red-600 transition">
//           <LogOut className="w-5 h-5" onClick={logout} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdminNavbar;

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

  const title = activeSection ? sectionTitles[activeSection] || "Admin Dashboard" : "Admin Dashboard";

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {admin && <p className="text-sm text-gray-500">Welcome, {admin.name}</p>}
      </div>
      <div className="flex space-x-4">
        <button className="p-2 bg-blue-100 text-blue-700 rounded-md flex items-center hover:bg-blue-200 transition">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200 transition">
          <Settings className="w-5 h-5" />
        </button>
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
