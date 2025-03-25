import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 p-6">
        <AdminNavbar />
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          {activeSection === "dashboard" && <h2 className="text-xl font-semibold">Welcome to Admin Dashboard</h2>}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
