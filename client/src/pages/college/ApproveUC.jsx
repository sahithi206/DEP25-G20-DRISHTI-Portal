import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/InstituteSidebar";
import SignatureCanvas from 'react-signature-canvas';
import TermsAndConditions from "../uc/se/TermsAndConditions";
import jsPDF from "jspdf";
import "jspdf-autotable";

const url = import.meta.env.VITE_REACT_APP_URL;

const ApproveUC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [ucData, setUcData] = useState(null);
  const [piSignature, setPiSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("us-se");
  const navigate = useNavigate();

  const stampCanvas = useRef(null);
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(`${url}uc/pending`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: localStorage.getItem("token")
          }
        });

        const data = await res.json();
        if (data.success) {
          setPendingRequests(data.data);
        }
      } catch (err) {
        console.error("Error fetching pending requests:", err);
      }
    };
    fetchPending();
  }, []);


  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setSelectedType(request.type);
    setUcData(request.ucData);
    setPiSignature(request.piSignature);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    setUcData(null);
    setPiSignature(null);
    setInstituteStamp(null);
  };

  const handleAddStamp = () => {
    if (!selectedRequest) return;
    setShowStampModal(true);
  };

  const handleStampEnd = () => {
    if (stampCanvas.current) {
      const stampDataUrl = stampCanvas.current.toDataURL();
      setInstituteStamp(stampDataUrl);
    }
  };

  const clearStamp = () => {
    if (stampCanvas.current) {
      stampCanvas.current.clear();
      setInstituteStamp(null);
    }
  };

  const saveStamp = () => {
    if (stampCanvas.current && !stampCanvas.current.isEmpty()) {
      const stampDataUrl = stampCanvas.current.toDataURL();
      setInstituteStamp(stampDataUrl);
      setShowStampModal(false);
      setShowApproveModal(false);
    } else {
      alert("Please provide a stamp before saving");
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !instituteStamp) return;
    setLoading(true);

    try {
      const res = await fetch(`${url}uc/approve/${selectedRequest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instituteStamp: instituteStamp
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Approval failed");
      }

      const updatedPendingRequests = pendingRequests.filter(req => req._id !== selectedRequest._id);
      setPendingRequests(updatedPendingRequests);

      setShowApproveModal(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        setSelectedRequest(null);
        setInstituteStamp(null);
        setShowSuccessModal(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Error approving request:", err.message);
      alert("Failed to approve request");
      setLoading(false);
    }
  };

  const handleSaveAsPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const currentDate = new Date().toLocaleDateString("en-IN");
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("GFR 12-A", pageWidth / 2, 20, { align: "center" });
    pdf.setFontSize(12);
    pdf.text("[See Rule 238 (1)]", pageWidth / 2, 25, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(`FINAL UTILIZATION CERTIFICATE FOR THE YEAR ${ucData.currentYear} in respect of`, pageWidth / 2, 32, { align: "center" });
    pdf.text(`${selectedType === "recurring" ? "Recurring" : "Non - Recurring"}`, pageWidth / 2, 38, { align: "center" });
    pdf.text(`as on ${currentDate} to be submitted to Funding Agency`, pageWidth / 2, 44, { align: "center" });
    pdf.text("Is the UC Provisional (Provisional/Audited)", pageWidth / 2, 50, { align: "center" });

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const items = [
      { label: "Name of the grant receiving Organization", value: ucData.instituteName },
      { label: "Name of Principal Investigator (PI)", value: Array.isArray(ucData.principalInvestigator) 
          ? ucData.principalInvestigator.join(", ") 
          : ucData.principalInvestigator },
      { label: "Title of the Project", value: ucData.title },
      { label: "Name of the Scheme", value: ucData.scheme || "N/A" },
      { label: "Whether recurring or non-recurring grants", value: selectedType === "recurring" ? "Recurring" : "Non Recurring" },
      { label: "Present Year of Project", value: ucData.currentYear },
      { label: "Start Date of Year", value: ucData.startDate },
      { label: "End Date of Year", value: ucData.endDate }
    ];

    let yPos = 60;
    let itemNum = 1;

    items.forEach(item => {
      pdf.setFont("helvetica", "normal");
      pdf.text(`${itemNum}`, margin, yPos);
      pdf.text(item.label, margin + 5, yPos);
      pdf.text(`: ${item.value}`, margin + 80, yPos);
      yPos += 7;
      itemNum++;
    });

    yPos += 3;
    pdf.text(`${itemNum}`, margin, yPos);
    pdf.text("Grants position of the beginning of the Financial year", margin + 5, yPos);
    yPos += 7;

    pdf.text("Carry forward from previous financial year", margin + 20, yPos);
    pdf.text(`Rs ${ucData.CarryForward}`, margin + 120, yPos);
    yPos += 7;

    pdf.text("Others, If any", margin + 20, yPos);
    pdf.text("Rs 0", margin + 120, yPos);
    yPos += 7;

    pdf.text("Total", margin + 20, yPos);
    pdf.text(`Rs ${ucData.CarryForward}`, margin + 120, yPos);
    yPos += 10;

    pdf.text(`${itemNum + 1}`, margin, yPos);
    pdf.text("Details of grants received, expenditure incurred and closing balances: (Actual)", margin + 5, yPos);
    yPos += 10;

    const headers = [
      [
        { content: "Unspent Balances of\nGrants received years", colSpan: 1 },
        { content: "Interest Earned\nthereon", colSpan: 1 },
        { content: "Interest deposited\nback to Funding Agency", colSpan: 1 },
        { content: "Grant received during the year", colSpan: 3 },
        { content: "Total\n(1+2-3+4)", colSpan: 1 },
        { content: "Expenditure\nincurred", colSpan: 1 },
        { content: "Closing Balance\n(5-6)", colSpan: 1 }
      ],
      [
        { content: "1", colSpan: 1 },
        { content: "2", colSpan: 1 },
        { content: "3", colSpan: 1 },
        { content: "Sanction No.", colSpan: 1 },
        { content: "Date", colSpan: 1 },
        { content: "Amount", colSpan: 1 },
        { content: "5", colSpan: 1 },  
        { content: "6", colSpan: 1 },
        { content: "7", colSpan: 1 }
      ]
    ];
    const recurringExp = ucData.recurringExp || 0;

    const data = [
      [
        `Rs ${ucData.CarryForward.toLocaleString()}`,
        "Rs 0",
        "Rs 0",
        ucData.sanctionNumber || "N/A",
        ucData.sanctionDate || "N/A",
        `Rs ${ucData.yearTotal.toLocaleString()}`,
        `Rs ${ucData.total.toLocaleString()}`,
        `Rs ${recurringExp.toLocaleString()}`,
        `Rs ${(ucData.total - recurringExp).toLocaleString()}`
      ]
    ];

    pdf.autoTable({
      head: headers,
      body: data,
      startY: yPos,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle',
        fontSize: 8
      },
      styles: {
        fontSize: 8,
        cellPadding: 1,
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 25 }
      }
    });

    yPos = pdf.lastAutoTable.finalY + 10;

    if (selectedType === "recurring" && selectedType !== "recurring") {
      pdf.text("Component wise utilization of grants:", margin, yPos);
      yPos += 5;

      const componentHeaders = [["Component", "Total"]];
      const componentData = [
        ["Human Resources", `Rs ${ucData.human_resources}`],
        ["Consumables", `Rs ${ucData.consumables}`],
        ["Others", `Rs ${ucData.others}`],
        ["Total", `Rs ${ucData.recurringExp}`]
      ];

      pdf.autoTable({
        head: componentHeaders,
        body: componentData,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
        styles: { fontSize: 10, cellPadding: 2, lineWidth: 0.1, lineColor: [0, 0, 0] }
      });

      yPos = pdf.lastAutoTable.finalY + 10;
    } else {
      pdf.text("Component wise utilization of grants:", margin, yPos);
      yPos += 5;

      const componentHeaders = [["Grant-in-aid-creation of capital assets", "Total"]];
      const componentData = [[`Rs ${recurringExp.toLocaleString()}`, `Rs ${recurringExp.toLocaleString()}`]];

      pdf.autoTable({
        head: componentHeaders,
        body: componentData,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
        styles: { fontSize: 10, cellPadding: 2, lineWidth: 0.1, lineColor: [0, 0, 0] }
      });

      yPos = pdf.lastAutoTable.finalY + 10;
    }

    pdf.text("Details of grants position at the end of the year", margin, yPos);
    yPos += 7;

    const closingBalance = ucData.total - ucData.recurringExp;

    pdf.text("(i)", margin, yPos);
    pdf.text("Balance available at end of financial year", margin + 10, yPos);
    pdf.text(`Rs ${closingBalance}`, margin + 100, yPos);
    yPos += 7;

    pdf.text("(ii)", margin, yPos);
    pdf.text("Unspent balance refunded to Funding Agency(if any)", margin + 10, yPos);
    pdf.text("Rs 0", margin + 100, yPos);
    yPos += 7;

    pdf.text("(iii)", margin, yPos);
    pdf.text("Balance (Carry forward to next financial year)", margin + 10, yPos);
    pdf.text(`Rs ${closingBalance}`, margin + 100, yPos);
    yPos += 15;

    pdf.addPage();
    yPos = 20;
    pdf.setFontSize(10);
    pdf.text("Certified that I have satisfied myself that the conditions on which grants were sanctioned have been duly fulfilled/are being fulfilled and that I", margin, yPos);
    pdf.text("have exercised following checks to see that the money has been actually utilized for the purpose which it was sanctioned:", margin, yPos + 5);
    yPos += 15;

    const certItems = [
      "The main accounts and other subsidiary accounts and registers (including assets registers) are maintained as prescribed in the relevant Act/Rules/Standing instructions (mention the Act/Rules) and have been duly audited by designated auditors. The figures depicted above tally with the audited figures mentioned in financial statements/accounts.",
      "There exist internal controls for safeguarding public funds/assets, watching outcomes and achievements of physical targets against the financial inputs, ensuring quality in asset creation etc. & the periodic evaluation of internal controls is exercised to ensure their effectiveness.",
      "To the best of our knowledge and belief, no transactions have been entered that are in violation of relevant Act/Rules/standing instructions and scheme guidelines.",
      "The responsibilities among the key functionaries for execution of the scheme have been assigned in clear terms and are not general in nature.",
      "The benefits were extended to the intended beneficiaries and only such areas/districts were covered where the scheme was intended to operate.",
      "The expenditure on various components of the scheme was in the proportions authorized as per the scheme guidelines and terms and conditions of the grants-in-aid.",
    ];

    certItems.forEach((item, index) => {
      const numeral = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"][index];
      const splitText = pdf.splitTextToSize(item, contentWidth - 15);

      pdf.text(`(${numeral})`, margin, yPos);
      pdf.text(splitText, margin + 10, yPos);

      yPos += (splitText.length * 5) + 5;
    });

    yPos += 10;
    pdf.text("Date: " + new Date().toLocaleDateString("en-IN"), margin, yPos);
    yPos += 5;
    if (piSignature) {
      pdf.addImage(piSignature, 'PNG', margin, yPos, 50, 20);
      pdf.text("Signature of PI", margin, yPos + 25);
    } else {
      pdf.text("Signature of PI: ________________", margin, yPos + 10);
    }
    if (instituteStamp) {
      pdf.addImage(instituteStamp, 'PNG', margin + 100, yPos, 50, 20);
      pdf.text("Institute Stamp & Signature", margin + 100, yPos + 25);
    }

    yPos += 35;

    pdf.save(`UC_${ucData.title}_${selectedType}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Approve Utilization Certificates</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Requests</h2>

              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No pending approval requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border p-4 rounded-lg cursor-pointer transition-all duration-200 hover:border-grey-300 hover:bg-green-50"
                      onClick={() => handleViewDetails(request)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-800">Project ID: {request.projectId}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Type: {request.type === "recurring" ? "Recurring" : "Non-Recurring"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(request.submissionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-xl p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handleBackToList}
                  className="flex items-center text-teal-600 hover:text-teal-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to List
                </button>
                <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending Approval
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-grey-700"></div>
                </div>
              ) : (
                <div id="uc-details" className="bg-white rounded-lg p-6 border-t-4 border-grey-800">
                  <h3 className="text-lg font-semibold text-teal-600 mb-4">
                    {selectedType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <h3 className="text-lg font-semibold text-teal-700 mb-4">Financial Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="border border-gray-400 px-4 py-2">Unspent Balances of Grants received years (figure as at Sl. No. 7 (iii))</th>
                        <th className="border border-gray-400 px-4 py-2">Interest Earned thereon</th>
                        <th className="border border-gray-400 px-4 py-2">Interest deposited back to Funding Agency</th>
                        <th className="border border-gray-400 px-4 py-2" colSpan="3">Grant received during the year</th>
                        <th className="border border-gray-400 px-4 py-2">Total (1+2 - 3+4)</th>
                        <th className="border border-gray-400 px-4 py-2">Expenditure incurred</th>
                        <th className="border border-gray-400 px-4 py-2">Closing Balances (5 - 6)</th>
                    </tr>
                    <tr className="bg-gray-50 text-gray-700">
                        <th className="border border-gray-400 px-4 py-2">1</th>
                        <th className="border border-gray-400 px-4 py-2">2</th>
                        <th className="border border-gray-400 px-4 py-2">3</th>
                        <th className="border border-gray-400 px-4 py-2">Sanction No.</th>
                        <th className="border border-gray-400 px-4 py-2">Date</th>
                        <th className="border border-gray-400 px-4 py-2">Amount</th>
                        <th className="border border-gray-400 px-4 py-2">5</th>
                        <th className="border border-gray-400 px-4 py-2">6</th>
                        <th className="border border-gray-400 px-4 py-2">7</th>
                    </tr>
                      </thead>
                      <tbody>
                      <tr className="text-center">
                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.CarryForward}</td>
                        <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                        <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                        <td className="border border-gray-400 px-4 py-2">{ucData.sanctionNumber || 'N/A'}</td>
                        <td className="border border-gray-400 px-4 py-2">{ucData.sanctionDate || 'N/A'}</td>
                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.yearTotal}</td>
                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.total}</td>
                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.recurringExp}</td>
                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.total - ucData.recurringExp}</td>
                    </tr>
                      </tbody>
                    </table>
                  </div>

                  {(selectedType === "recurring" || selectedType !== "recurring" )&& (
                    <>
                      <h3 className="text-lg font-semibold text-teal-700 mt-6 mb-4">
                        Component-wise Utilization of Grants
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300 rounded-lg">
                          <thead>
                            <tr className="bg-gray-100 text-gray-700">
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

                  <TermsAndConditions />
                  

                  {/* Signature Section */}
                  <div className="border-t border-gray-200 pt-4 mb-6 mt-6">
                    <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Principal Investigator</h4>
                        {piSignature ? (
                          <div className="border p-2 rounded mb-2">
                            <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                            <p className="text-gray-500">No signature added</p>
                          </div>
                        )}
                      </div>

                      <div className="border p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Institute Approval</h4>
                        {instituteStamp ? (
                          <div className="border p-2 rounded mb-2">
                            <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                            <p className="text-gray-500">
                              Institute stamp required for approval
                            </p>
                          </div>
                        )}
                        {!instituteStamp && (
                          <button
                            onClick={handleAddStamp}
                            className="mt-2 w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            Add Institute Stamp
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={handleSaveAsPDF}
                      className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Save as PDF
                    </button>

                    {instituteStamp ? (

                      <button
                        onClick={() => setShowApproveModal(true)}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve UC
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowApproveModal(true)}
                        disabled={!instituteStamp}
                        className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center ${instituteStamp
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve UC
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Stamp Modal */}
      {showStampModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowStampModal(false)}></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Add Institute Stamp</h3>
            <div className="border border-gray-300 rounded-md mb-4">
              <SignatureCanvas
                ref={stampCanvas}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "signature-canvas w-full"
                }}
                onEnd={handleStampEnd}
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={clearStamp}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
              <button
                onClick={saveStamp}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Save Stamp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowApproveModal(false)}></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mt-2">Confirm Approval</h3>
              <p className="text-gray-600 mt-1">
                Are you sure you want to approve this Utilization Certificate?
              </p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-30"></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mt-4">Approval Successful</h3>
              <p className="text-gray-600 mt-1">
                The Utilization Certificate has been approved successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default ApproveUC;
