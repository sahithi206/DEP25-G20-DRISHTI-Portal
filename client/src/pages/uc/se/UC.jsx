import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import jsPDF from "jspdf";

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

  const handleSubmitUC = async () => {
    try {
      console.log("UC Data:", ucData);
      const endpoint =
        selectedType === "recurring"
          ? `${url}projects/uc/recurring/${projectId}`
          : `${url}projects/uc/nonRecurring/${projectId}`;
  
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token"),
        },
        body: JSON.stringify({ data: ucData }),
      });
  
      const result = await response.json();
      if (!result.success) {
        alert(result.msg || "Failed to submit UC");
        return;
      }
  
      alert("UC submitted successfully!");
    } catch (error) {
      console.error("Error submitting UC:", error.message);
      alert("An error occurred while submitting the UC.");
    }
  };

  const handleSaveAsPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4"); 
  
    pdf.setFontSize(16);
    pdf.text("Utilization Certificate", 105, 20, { align: "center" });
  
    pdf.setFontSize(12);
    pdf.text(`Title of the Project: ${ucData.title}`, 10, 40);
    pdf.text(`Name of the Scheme: ${ucData.scheme}`, 10, 50);
    pdf.text(`Present Year of Project: ${ucData.currentYear}`, 10, 60);
    pdf.text(`Start Date of Year: ${ucData.startDate}`, 10, 70);
    pdf.text(`End Date of Year: ${ucData.endDate}`, 10, 80);
  
    const tableData = [
      [
        "Carry Forward",
        "Grant Received",
        "Total",
        ...(selectedType === "recurring"
          ? ["Recurring Expenditure", "Human Resources", "Consumables", "Others"]
          : ["Non-Recurring Expenditure"]),
      ],
      [
        `Rs ${ucData.CarryForward}`,
        `Rs ${ucData.yearTotal}`,
        `Rs ${ucData.total}`,
        ...(selectedType === "recurring"
          ? [
              `Rs ${ucData.recurringExp}`,
              `Rs ${ucData.human_resources}`,
              `Rs ${ucData.consumables}`,
              `Rs ${ucData.others}`,
            ]
          : [`Rs ${ucData.nonRecurringExp}`]),
      ],
    ];
  
    pdf.autoTable({
      head: [tableData[0]], 
      body: [tableData[1]], 
      startY: 90, 
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });
  
    pdf.save(`UC_${ucData.title}_${selectedType}.pdf`);
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
            <div id = "uc-details" className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
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
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.CarryForward}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.yearTotal}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.total}</td>
                      {selectedType === "recurring" && (
                        <>
                          <td className="border border-gray-400 px-4 py-2">Rs {ucData.recurringExp}</td>
                          <td className="border border-gray-400 px-4 py-2">Rs {ucData.human_resources}</td>
                          <td className="border border-gray-400 px-4 py-2">Rs {ucData.consumables}</td>
                          <td className="border border-gray-400 px-4 py-2">Rs {ucData.others}</td>
                        </>
                      )}
                      {selectedType === "nonRecurring" && (
                        <td className="border border-gray-400 px-4 py-2">Rs {ucData.nonRecurringExp}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-center">
              <button
                onClick={handleSaveAsPDF}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save as PDF
              </button>
            </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => handleSubmitUC()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit UC
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate(`/comments/${projectId}/${selectedType}`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Comments
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