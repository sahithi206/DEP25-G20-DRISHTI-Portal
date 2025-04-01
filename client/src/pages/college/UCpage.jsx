import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import InstituteSidebar from "../../components/InstituteSidebar";
import jsPDF from "jspdf";
import "jspdf-autotable";


const url = import.meta.env.VITE_REACT_APP_URL;

const UCPage = () => {
    const { projectId } = useParams();
    const [ucType, setUcType] = useState("recurring");
    const[comments, setComments] = useState([]);
    // const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("uc-page");
      const [error, setError] = useState("");
      const [fetchError, setFetchError] = useState("");
  const [ucData, setUCData] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        const fetchComments = async () => {
            console.log("comments display");
            // setLoading(true);
            try {
              const response = await fetch(`${url}uc-comments/${projectId}/${ucType}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                //   accessToken: localStorage.getItem("token"),
                },
              });
      
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
      
              const result = await response.json();
              if (!result.success) {
                setFetchError(result.message || "Failed to fetch comments");
                return;
              }
      
              setComments(result.data);
            } catch (err) {
              console.error("Error fetching comments:", err.message);
              setFetchError("Failed to fetch comments");
            } 
          };
      
          fetchComments();
        }, [projectId, ucType, url]);
    
    // if (loading) 
    //  <div>Loading...</div>;
    // if (!ucData) return <div>No UC data found.</div>;

    const fetchUCData = async (type) => {
        // setLoading(true);
        setError("");
        setUCData(null);
    
        try {
          const endpoint =
            ucType === "recurring"
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
            setError(result.message || `Error fetching ${ucType} UC data`);
            return;
          }
    
          setUCData(result.data);
          setIsModalOpen(true);
        } catch (err) {
          console.error(`Error fetching ${ucType} UC data:`, err.message);
          setError(`Failed to fetch ${ucType} UC data`);
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
            ...(ucType === "recurring"
              ? ["Recurring Expenditure", "Human Resources", "Consumables", "Others"]
              : ["Non-Recurring Expenditure"]),
          ],
          [
            `Rs ${ucData.CarryForward}`,
            `Rs ${ucData.yearTotal}`,
            `Rs ${ucData.total}`,
            ...(ucType === "recurring"
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
    
        pdf.save(`UC_${ucData.title}_${ucType}.pdf`);
      };




      const closeModal = () => {
        setIsModalOpen(false); 
        setUCData(null);
      };
    
      // const handleSelection = (ucType) => {
      //   setSelectedType(ucType);
      //   fetchUCData(ucType);
      // };



      
    
      return (
        <div className="flex bg-gray-100 min-h-screen">
          <InstituteSidebar />
          <div className="flex-grow p-6">
            <Navbar />
            <div className="bg-white shadow-md rounded-lg p-6">
              <h1 className="text-3xl font-bold text-center mb-6">Utilization Certificate</h1>
              <div className="mb-6">
                <label htmlFor="ucType" className="font-semibold mr-2 text-center">
                  UC Type:
                </label>
                <select
                  id="ucType"
                  value={ucType}
                  onChange={(e) => setUcType(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="recurring">Recurring</option>
                  <option value="nonRecurring">Non-Recurring</option>
                </select>
              </div>
              <button
                onClick={fetchUCData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                View UC
              </button>
            </div>
    
            <div className="bg-white shadow-md rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
              {fetchError ? (
                <p className="text-center text-red-500">{fetchError}</p>
              ) : comments && comments.length > 0 ? (
                <ul className="space-y-4">
                  {comments.map((comment) => (
                    <li key={comment._id} className="p-4 border rounded-lg bg-gray-50">
                      <p className="text-gray-700">
                        <strong>Added By:</strong> {comment.role} ({comment.userId?.Name || "Unknown User"})
                      </p>
                      <p className="text-gray-700">
                        <strong>Comment:</strong> {comment.comment}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Date:</strong> {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No comments available for this UC type.</p>
              )}
            </div>
          </div>
    
          {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-3/4 max-w-6xl">
      <h2 className="text-2xl font-bold mb-4">Utilization Certificate</h2>
      {ucData ? (
        <div id="uc-details" className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">
            {ucType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
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
                  {ucType === "recurring" && (
                    <>
                      <th className="border border-gray-400 px-4 py-2">Recurring Expenditure</th>
                      <th className="border border-gray-400 px-4 py-2">Human Resources</th>
                      <th className="border border-gray-400 px-4 py-2">Consumables</th>
                      <th className="border border-gray-400 px-4 py-2">Others</th>
                    </>
                  )}
                  {ucType === "nonRecurring" && (
                    <th className="border border-gray-400 px-4 py-2">Non-Recurring Expenditure</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border border-gray-400 px-4 py-2">Rs {ucData.CarryForward}</td>
                  <td className="border border-gray-400 px-4 py-2">Rs {ucData.yearTotal}</td>
                  <td className="border border-gray-400 px-4 py-2">Rs {ucData.total}</td>
                  {ucType === "recurring" && (
                    <>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.recurringExp}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.human_resources}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.consumables}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.others}</td>
                    </>
                  )}
                  {ucType === "nonRecurring" && (
                    <td className="border border-gray-400 px-4 py-2">Rs {ucData.nonRecurringExp}</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                handleSaveAsPDF();
                // closeModal();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save as PDF
            </button>
          </div>
        </div>
      ) : (
        <p>Loading UC data...</p>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={closeModal}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      );
    };
    
    export default UCPage;