import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <AdminNavbar />
        {/* Section Content */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          {activeSection === "dashboard" && <h2 className="text-xl font-semibold">Welcome to Admin Dashboard</h2>}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
