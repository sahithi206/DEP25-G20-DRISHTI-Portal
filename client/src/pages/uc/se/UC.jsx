import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";

const url = import.meta.env.VITE_REACT_APP_URL;

const UCForm = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedType, setSelectedType] = useState("");
  const [ucData, setUCData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUCData = async (type) => {
    setLoading(true);
    setError("");
    setUCData(null);

    try {
      const endpoint =
        type === "recurring"
          ? `${url}projects/generate-uc/recurring/${projectId}`
          : `${url}projects/generate-uc/nonRecurring/${projectId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token"),
        },
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.message || `Error fetching ${type} UC data`);
        return;
      }

      setUCData(result.data);
    } catch (err) {
      console.error(`Error fetching ${type} UC data:`, err.message);
      setError(`Failed to fetch ${type} UC data`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelection = (type) => {
    setSelectedType(type);
    fetchUCData(type);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div
        className={`flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"
        }`}
      >
        <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${projectId}`} />
        <div className="p-6 space-y-6 mt-16">
          <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
            <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
            <p className="mt-3 text-2xl font-bold text-blue-800">Generate Utilization Certificate</p>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <select
              value = {selectedType}
              onChange={(e) => handleSelection(e.target.value)}
              className="px-4 py-2 rounded font-medium text-gray-700 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <option value="" disabled>
                Select UC Type
              </option>
              <option value="recurring">Generate Recurring UC</option>
              <option value="nonRecurring">Generate Non-Recurring UC</option>
            </select>
           </div>

          {loading && <p className="text-center mt-6">Loading...</p>}

          {error && <p className="text-center text-red-500 mt-6">{error}</p>}

          {ucData && (
            <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">
                {selectedType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="font-semibold text-gray-700">Title of the Project:</label>
                <span className="px-3 py-1 w-full">: {ucData.title}</span>
                <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                <span className="px-3 py-1 w-full">: {ucData.scheme}</span>
                <label className="font-semibold text-gray-700">Present Year of Project:</label>
                <span className="px-3 py-1 w-full">: {ucData.currentYear}</span>
                <label className="font-semibold text-gray-700">Start Date of Year:</label>
                <span className="px-3 py-1 w-full">: {ucData.startDate}</span>
                <label className="font-semibold text-gray-700">End Date of Year:</label>
                <span className="px-3 py-1 w-full">: {ucData.endDate}</span>
              </div>

              <h3 className="text-lg font-semibold text-blue-700 mb-4">Financial Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-blue-100 text-gray-700">
                      <th className="border border-gray-400 px-4 py-2">Carry Forward</th>
                      <th className="border border-gray-400 px-4 py-2">Grant Received</th>
                      <th className="border border-gray-400 px-4 py-2">Total</th>
                      {selectedType === "recurring" && (
                        <>
                          <th className="border border-gray-400 px-4 py-2">Recurring Expenditure</th>
                          <th className="border border-gray-400 px-4 py-2">Human Resources</th>
                          <th className="border border-gray-400 px-4 py-2">Consumables</th>
                          <th className="border border-gray-400 px-4 py-2">Others</th>
                        </>
                      )}
                      {selectedType === "nonRecurring" && (
                        <th className="border border-gray-400 px-4 py-2">Non-Recurring Expenditure</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td className="border border-gray-400 px-4 py-2">₹ {ucData.CarryForward}</td>
                      <td className="border border-gray-400 px-4 py-2">₹ {ucData.yearTotal}</td>
                      <td className="border border-gray-400 px-4 py-2">₹ {ucData.total}</td>
                      {selectedType === "recurring" && (
                        <>
                          <td className="border border-gray-400 px-4 py-2">₹ {ucData.recurringExp}</td>
                          <td className="border border-gray-400 px-4 py-2">₹ {ucData.human_resources}</td>
                          <td className="border border-gray-400 px-4 py-2">₹ {ucData.consumables}</td>
                          <td className="border border-gray-400 px-4 py-2">₹ {ucData.others}</td>
                        </>
                      )}
                      {selectedType === "nonRecurring" && (
                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.nonRecurringExp}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate(`/comments/${projectId}/${selectedType}`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Comments
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UCForm;