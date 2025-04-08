import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
      console.log(result.data);
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

  const handleSaveAsPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
  
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("GFR 12-A", 105, 20, { align: "center" });
    pdf.setFontSize(10);
    pdf.text("[See Rule 238 (1)]", 105, 25, { align: "center" });
  
    pdf.setFontSize(14);
    pdf.text(
      `FINAL UTILIZATION CERTIFICATE FOR THE YEAR ${ucData.currentYear} in respect of`,
      105,
      35,
      { align: "center" }
    );
  
    pdf.setFontSize(12);
    pdf.text(
      `${selectedType === "recurring" ? "Recurring" : "Non-Recurring"}`,
      105,
      42,
      { align: "center" }
    );
  
    pdf.setFontSize(10);
    pdf.text(
      `as on ${new Date().toLocaleDateString()} to be submitted to Funding Agency`,
      105,
      48,
      { align: "center" }
    );
  
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Title of the Project: ${ucData.title}`, 10, 60);
    pdf.text(`Name of the Scheme: ${ucData.scheme}`, 10, 70);
    pdf.text(`Name of the Grant Receiving Organisation: ${ucData.instituteName}`, 10, 80);
    pdf.text(`Name of the Principal Investigator: ${ucData.principalInvestigator}`, 10, 90);
    pdf.text(`Present Year of Project: ${ucData.currentYear}`, 10, 100);
    pdf.text(`Start Date of Year: ${ucData.startDate}`, 10, 110);
    pdf.text(`End Date of Year: ${ucData.endDate}`, 10, 120);
  
    pdf.text("Financial Summary", 10, 130);
    const financialTableData = [
      ["Carry Forward", "Grant Received", "Total", "Recurring Expenditure", "Closing Balance"],
      [
        `Rs ${ucData.CarryForward}`,
        `Rs ${ucData.yearTotal}`,
        `Rs ${ucData.total}`,
        `Rs ${ucData.recurringExp}`,
        `Rs ${ucData.total - ucData.recurringExp}`,
      ],
    ];
  
    pdf.autoTable({
      head: [financialTableData[0]],
      body: [financialTableData[1]],
      startY: 135,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
    });
  
    if (selectedType === "recurring") {
      pdf.text("Component-wise Utilization of Grants", 10, pdf.lastAutoTable.finalY + 10);
  
      const componentTableData = [
        ["Component", "Amount"],
        ["Human Resources", `Rs ${ucData.human_resources}`],
        ["Consumables", `Rs ${ucData.consumables}`],
        ["Others", `Rs ${ucData.others}`],
      ];
  
      pdf.autoTable({
        head: [componentTableData[0]],
        body: componentTableData.slice(1),
        startY: pdf.lastAutoTable.finalY + 15,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
      });
    }
  
    pdf.addPage();
  
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Certified that I have satisfied myself that:", 10, 20);
  
    const terms = [
      "1. The main accounts and other subsidiary accounts and registers (including assets registers) are maintained as prescribed in the relevant Act/Rules/Standing instructions (mention the Act/Rules) and have been duly audited by designated auditors. The figures depicted above tally with the audited figures mentioned in financial statements/accounts.",
      "2. There exist internal controls for safeguarding public funds/assets, watching outcomes and achievements of physical targets against the financial inputs, ensuring quality in asset creation etc. & the periodic evaluation of internal controls is exercised to ensure their effectiveness.",
      "3. To the best of our knowledge and belief, no transactions have been entered that are in violation of relevant Act/Rules/standing instructions and scheme guidelines.",
      "4. The responsibilities among the key functionaries for execution of the scheme have been assigned in clear terms and are not general in nature.",
      "5. The benefits were extended to the intended beneficiaries and only such areas/districts were covered where the scheme was intended to operate.",
      "6. The expenditure on various components of the scheme was in the proportions authorized as per the scheme guidelines and terms and conditions of the grants-in-aid.",
      "7. Details of various schemes executed by the agency through grants-in-aid received from the same Ministry or from other Ministries is enclosed at Annexure-II (to be formulated by the Ministry/Department concerned as per their requirements/specifications).",
    ];
  
    let y = 30;
    terms.forEach((term) => {
      const splitText = pdf.splitTextToSize(term, 190); 
      pdf.text(splitText, 10, y);
      y += splitText.length * 6; 
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
              value={selectedType}
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
            <div id="uc-details" className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold">GFR 12-A</h3>
                <p className="text-sm font-medium">[See Rule 238 (1)]</p>
                <h2 className="text-xl font-bold mt-2">
                  FINAL UTILIZATION CERTIFICATE FOR THE YEAR {ucData.currentYear} in respect of
                </h2>
                <p className="text-lg font-semibold">
                  {selectedType === "recurring" ? "Recurring" : "Non-Recurring"}
                </p>
                <p className="text-sm font-medium mt-1">
                  as on {new Date().toLocaleDateString()} to be submitted to Funding Agency
                </p>
              </div>

              <h3 className="text-lg font-semibold text-blue-700 mb-4">
                {selectedType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="font-semibold text-gray-700">Title of the Project:</label>
                <span className="px-3 py-1 w-full">: {ucData.title}</span>

                <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                <span className="px-3 py-1 w-full">: {ucData.scheme}</span>

                <label className="font-semibold text-gray-700">Name of the Grant Receiving Organisation:</label>
                <span className="px-3 py-1 w-full">: {ucData.instituteName}</span>

                <label className="font-semibold text-gray-700">Name of the Principal Investigator:</label>
                <span className="px-3 py-1 w-full">: {ucData.principalInvestigator}</span>

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
                      <th className="border border-gray-400 px-4 py-2">Recurring Expenditure</th>
                      <th className="border border-gray-400 px-4 py-2">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.CarryForward}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.yearTotal}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.total}</td>
                      <td className="border border-gray-400 px-4 py-2">Rs {ucData.recurringExp}</td>
                      <td className="border border-gray-400 px-4 py-2">
                        Rs {ucData.total - ucData.recurringExp}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedType === "recurring" && (
                <>
                  <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-4">
                    Component-wise Utilization of Grants
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead>
                        <tr className="bg-blue-100 text-gray-700">
                          <th className="border border-gray-400 px-4 py-2">Component</th>
                          <th className="border border-gray-400 px-4 py-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-center">
                          <td className="border border-gray-400 px-4 py-2">Human Resources</td>
                          <td className="border border-gray-400 px-4 py-2">Rs {ucData.human_resources}</td>
                        </tr>
                        <tr className="text-center">
                          <td className="border border-gray-400 px-4 py-2">Consumables</td>
                          <td className="border border-gray-400 px-4 py-2">Rs {ucData.consumables}</td>
                        </tr>
                        <tr className="text-center">
                          <td className="border border-gray-400 px-4 py-2">Others</td>
                          <td className="border border-gray-400 px-4 py-2">Rs {ucData.others}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Terms and Conditions</h3>
              <ul className="list-decimal list-inside text-gray-700 space-y-2">
                <li>
                  The main accounts and other subsidiary accounts and registers (including assets registers) are
                  maintained as prescribed in the relevant Act/Rules/Standing instructions (mention the Act/Rules) and
                  have been duly audited by designated auditors. The figures depicted above tally with the audited
                  figures mentioned in financial statements/accounts.
                </li>
                <li>
                  There exist internal controls for safeguarding public funds/assets, watching outcomes and achievements
                  of physical targets against the financial inputs, ensuring quality in asset creation etc. & the
                  periodic evaluation of internal controls is exercised to ensure their effectiveness.
                </li>
                <li>
                  To the best of our knowledge and belief, no transactions have been entered that are in violation of
                  relevant Act/Rules/standing instructions and scheme guidelines.
                </li>
                <li>
                  The responsibilities among the key functionaries for execution of the scheme have been assigned in
                  clear terms and are not general in nature.
                </li>
                <li>
                  The benefits were extended to the intended beneficiaries and only such areas/districts were covered
                  where the scheme was intended to operate.
                </li>
                <li>
                  The expenditure on various components of the scheme was in the proportions authorized as per the
                  scheme guidelines and terms and conditions of the grants-in-aid.
                </li>
                <li>
                  Details of various schemes executed by the agency through grants-in-aid received from the same
                  Ministry or from other Ministries is enclosed at Annexure-II (to be formulated by the
                  Ministry/Department concerned as per their requirements/specifications).
                </li>
              </ul>
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