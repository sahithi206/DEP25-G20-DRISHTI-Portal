import React, { useState, useEffect } from "react";
import { Bell, Settings, LogOut } from "lucide-react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import FundCyclePage from "./FundCyclePage";
import RequestsPage from "./AdminRequests"; 

const API_BASE_URL = import.meta.env.VITE_REACT_APP_URL;

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [approvals, setApprovals] = useState([]);

  // Fetch proposals from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const proposalsRes = await axios.get(`${API_BASE_URL}/review-proposal`);
        setApprovals(proposalsRes.data.filter((p) => p.status === "Pending"));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Approve or Reject a Proposal
  const handleApproval = async (proposalId, newStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/review-proposal/${proposalId}`, {
        status: newStatus,
      });

      if (response.status === 200) {
        setApprovals((prevApprovals) => prevApprovals.filter((p) => p._id !== proposalId));
        alert(`Proposal ${proposalId} marked as ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating proposal status:", error);
      alert("Failed to update proposal status. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
          <h1 className="text-2xl font-semibold capitalize">{activeSection.replace(/([A-Z])/g, " $1")}</h1>
          <div className="flex space-x-4">
            <button className="p-2 bg-blue-500 text-white rounded-md flex items-center">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-500 text-white rounded-md flex items-center">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 bg-red-500 text-white rounded-md flex items-center">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Content */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          {activeSection === "dashboard" && <h2 className="text-xl font-semibold">Welcome to Admin Dashboard</h2>}

          {activeSection === "approvals" && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Proposal Approvals</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2">Proposal ID</th>
                    <th className="border border-gray-300 p-2">User ID</th>
                    <th className="border border-gray-300 p-2">Status</th>
                    <th className="border border-gray-300 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map((proposal) => (
                    <tr key={proposal._id} className="text-center border-b">
                      <td className="border border-gray-300 p-2">{proposal._id}</td>
                      <td className="border border-gray-300 p-2">{proposal.userId}</td>
                      <td className="border border-gray-300 p-2 font-bold text-blue-600">{proposal.status}</td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleApproval(proposal._id, "Approved")}
                          className="px-3 py-1 bg-green-500 text-white rounded mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(proposal._id, "Rejected")}
                          className="px-3 py-1 bg-red-500 text-white rounded"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeSection === "fundCycle" && <FundCyclePage />} {/* ✅ Fund Cycle Page */}

          {activeSection === "requests" && <RequestsPage />} {/* ✅ Requests Page */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
