import React from "react";
import { Bell, Settings, LogOut } from "lucide-react";

const sectionTitles = {
  dashboard: "Dashboard",
  schemes: "Scheme Management",
  approvals: "Proposal Approvals",
  grants: "Quotations/SE/UC Grants",
  fundCycle: "Fund Cycle Approval",
  requests: "Requests Management",
};

const AdminNavbar = ({ activeSection }) => {
  const title = sectionTitles[activeSection] || "Admin Dashboard";
  console.log("Navbar Title:", title); 
  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex space-x-4">
        <button className="p-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600 transition">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 bg-gray-500 text-white rounded-md flex items-center hover:bg-gray-600 transition">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 bg-red-500 text-white rounded-md flex items-center hover:bg-red-600 transition">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
