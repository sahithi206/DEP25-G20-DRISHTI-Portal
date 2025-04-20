
import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/InstituteSidebar";
import { AuthContext } from "../Context/Authcontext";
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from "jspdf";
import "jspdf-autotable";

const url = import.meta.env.VITE_REACT_APP_URL;

const ApproveSE = () => {
  const { getInstUser } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [seData, setSeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("se-approve");
  const [userRole, setUserRole] = useState("");
  const [showSendToAOModal, setShowSendToAOModal] = useState(false);
  const [sentToAO, setSentToAO] = useState(false);
  const [authApproved, setAuthApproved] = useState(false);
  const [instituteApproved, setInstituteApproved] = useState(false);
  const [piSignature, setPiSignature] = useState(null);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [authSignature, setAuthSignature] = useState(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const navigate = useNavigate();

  const stampCanvas = useRef(null);
  const fileInputRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTitle, setSearchTitle] = useState("");
  const [filteredSe, setFilteredSe] = useState([]);

  useEffect(() => {
    const fetchRole = async () => {
      const data = await getInstUser();
      if (data?.role) {
        setUserRole(data.role);
      }
    };
    fetchRole();
  }, []);

  useEffect(() => {
    const filterrequests = () => {
      let filtered = pendingRequests;
      if (searchTitle) {
        const searchTerm = searchTitle.toLowerCase();
        filtered = filtered.filter((project) => {
          if (project.name?.toLowerCase().includes(searchTerm)) return true;

          if ((project?.scheme ?? "Change Institute").toLowerCase().includes(searchTerm)) return true;

          return false;
        });
      }

      if (sortOrder === "newest") {
        filtered.sort((a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0));
      } else if (sortOrder === "oldest") {
        filtered.sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0));
      }
      setFilteredSe(filtered);
    };

    filterrequests();
  }, [searchTitle, sortOrder, pendingRequests]);

  // Fetch pending requests on component mount
  useEffect(() => {
    const fetchPending = async () => {
      if (!userRole) return;

      let endpoint = `${url}se/pending`;
      if (userRole === "Accounts Officer") {
        endpoint = `${url}se/pendingAuthSign`;
      }

      try {
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: localStorage.getItem("token"),
          },
        });

        const data = await res.json();
        if (data.success) {
          setPendingRequests(data.data);
        }
      } catch (err) {
        console.error("Error fetching pending SE requests:", err);
      }
    };
    fetchPending();
  }, [userRole]);

  const handleViewDetails = async (request) => {
    console.log("Handle View IN ApproveSE:", request);
    setSelectedRequest(request);
    setSeData(request);
    setPiSignature(request.piSignature);

    if (request.projectId) { // Use the local variable
      try {
        console.log(`Making request to: ${url}se/latest?projectId=${request.projectId}`);

        const res = await fetch(`${url}se/latest?projectId=${request.projectId}`);
        console.log("Response received:", res.status);

        const data = await res.json();
        console.log("Response data:", data);
        if (data.success && data.data) {
          const se = data.data;
          console.log("SE data received:", se);
          setPiSignature(se.piSignature);
          if (se.status === "approvedByInst") {
            setInstituteStamp(se.instituteStamp);
            setAuthSignature(se.authSignature);
            setInstituteApproved(true);
            setAuthApproved(true)
            setSentToAO(true)
          }
          else if (se.status === "pendingAuthSign") {
            setInstituteStamp(se.instituteStamp);
            setSentToAO(true);
          } else if (se.status === "approvedByAuth") {
            setSentToAO(true);
            setAuthApproved(true);
            setInstituteStamp(se.instituteStamp);
            setAuthSignature(se.authSignature);
          } else {
            setInstituteApproved(false);
          }
        } else {
          setPiSignature(null);
          setInstituteStamp(null);
          setAuthSignature(null);
        }
      } catch (err) {
        console.error("Error fetching approval status:", err);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    setSentToAO(false);
    setInstituteApproved(false);
    setAuthApproved(false);
    setSeData(null);
    setPiSignature(null);
    setInstituteStamp(null);
    setAuthSignature(null);
  };

  // Handle file upload for signature
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError("Please upload only image files (PNG, JPG, JPEG)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setInstituteStamp(event.target.result);
        setShowStampModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleUploadOption = () => {
    setShowUploadOption(!showUploadOption);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleStampEnd = () => {
    if (stampCanvas.current) {
      const stampDataUrl = stampCanvas.current.toDataURL();
      if (userRole === "Accounts Officer") {
        setAuthSignature(stampDataUrl);
      } else {
        setInstituteStamp(stampDataUrl);
      }
    }
  };

  const handleAddStamp = () => {
    if (!selectedRequest) return;
    setShowStampModal(true);
  };

  const clearStamp = () => {
    if (stampCanvas.current) {
      stampCanvas.current.clear();
      if (userRole === "Accounts Officer") {
        setAuthSignature(null);
      } else {
        setInstituteStamp(null);
      }
    }
  };

  const saveStamp = () => {
    if (stampCanvas.current && !stampCanvas.current.isEmpty()) {
      const stampDataUrl = stampCanvas.current.toDataURL();
      if (userRole === "Accounts Officer") {
        setAuthSignature(stampDataUrl);
      } else {
        setInstituteStamp(stampDataUrl);
      }
      setShowStampModal(false);
      setShowApproveModal(false);
    } else {
      alert("Please provide a signature/stamp before saving");
    }
  };

  const handleSendToAO = async () => {
    if (!selectedRequest || !instituteStamp) return;
    setLoading(true);

    try {
      const res = await fetch(`${url}se/send-to-auth/${selectedRequest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token")
        },
        body: JSON.stringify({
          instituteStamp: instituteStamp
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send to AO");
      }

      const updatedPendingRequests = pendingRequests.filter(req => req._id !== selectedRequest._id);
      setPendingRequests(updatedPendingRequests);

      setShowSendToAOModal(false);
      setShowSuccessModal(true);
      setSentToAO(true);

      setTimeout(() => {
        setSelectedRequest(null);
        setInstituteStamp(null);
        setShowSuccessModal(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Error sending to AO:", err.message);
      alert("Failed to send to AO");
      setLoading(false);
    }
  };

  const handleAOApprove = async () => {
    if (!selectedRequest || !authSignature) return;
    setLoading(true);

    try {
      const res = await fetch(`${url}se/auth-approval/${selectedRequest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token")
        },
        body: JSON.stringify({
          authSignature: authSignature
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
      setAuthApproved(true)

      setTimeout(() => {
        setSelectedRequest(null);
        setAuthSignature(null);
        setShowSuccessModal(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Error approving request:", err.message);
      alert("Failed to approve request");
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !instituteStamp) return;
    setLoading(true);

    try {
      // Send approval to backend
      const res = await fetch(`${url}se/approve/${selectedRequest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token")
        },
        body: JSON.stringify({
          instituteStamp: instituteStamp
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Approval failed");
      }

      // Remove approved request from pending list
      const updatedPendingRequests = filteredSe.filter(req => req._id !== selectedRequest._id);
      setFilteredSe(updatedPendingRequests);

      // Show success message
      setShowApproveModal(false);
      setShowSuccessModal(true);

      // Reset UI
      setTimeout(() => {
        setSelectedRequest(null);
        setInstituteStamp(null);
        setShowSuccessModal(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Error approving SE request:", err.message);
      alert("Failed to approve request");
      setLoading(false);
    }
  };

  const handleSaveAsPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const currentDate = new Date().toLocaleDateString("en-IN");

    // Set page margins
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Title Section
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("STATEMENT OF EXPENDITURE", pageWidth / 2, 20, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(`FOR THE PERIOD: ${seData.startDate} TO ${seData.endDate}`, pageWidth / 2, 28, { align: "center" });

    // Project details
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    let yPos = 40;

    pdf.text(`1. Project Title: ${seData.name}`, margin, yPos);
    yPos += 8;

    pdf.text(`2. Name of the Institution: ${seData.institute}`, margin, yPos);
    yPos += 8;

    pdf.text(`3. Funding Agency: ${seData.scheme}`, margin, yPos);
    yPos += 8;

    pdf.text(`4. Project Year: ${seData.currentYear}`, margin, yPos);
    yPos += 8;

    pdf.text(`5. Total Project Cost: Rs. ${seData.TotalCost}`, margin, yPos);
    yPos += 16;

    // Budget table
    pdf.setFont("helvetica", "bold");
    pdf.text("6. Sanctioned Budget & Expenditure", margin, yPos);
    yPos += 10;

    // Component-wise expenditure table
    const headers = [
      [
        { content: "Budget Head", colSpan: 1 },
        { content: "Sanctioned Amount (Rs)", colSpan: 1 },
        { content: "Expenditure (Rs)", colSpan: 1 },
        { content: "Balance (Rs)", colSpan: 1 }
      ]
    ];

    const data = [
      [
        "Human Resources",
        `${seData.budgetSanctioned.human_resources}`,
        `${seData.totalExp.human_resources}`,
        `${seData.balance.human_resources}`
      ],
      [
        "Consumables",
        `${seData.budgetSanctioned.consumables}`,
        `${seData.totalExp.consumables}`,
        `${seData.balance.consumables}`
      ],
      [
        "Others",
        `${seData.budgetSanctioned.others}`,
        `${seData.totalExp.others}`,
        `${seData.balance.others}`
      ],
      [
        "Non-Recurring",
        `${seData.budgetSanctioned.nonRecurring}`,
        `${seData.totalExp.nonRecurring}`,
        `${seData.balance.nonRecurring}`
      ],
      [
        "Total",
        `${seData.budgetSanctioned.total}`,
        `${seData.totalExp.total}`,
        `${seData.balance.total}`
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
        fontSize: 9
      },
      styles: {
        fontSize: 8,
        cellPadding: 1,
        overflow: 'linebreak',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 }
      }
    });

    yPos = pdf.lastAutoTable.finalY + 20;

    // Certification text
    pdf.setFontSize(10);
    pdf.text("Certified that the grant of Rs. " + seData.budgetSanctioned.total + " received under the research project entitled", margin, yPos);
    pdf.text(`"${seData.name}" has been utilized for the purpose for which it was sanctioned in accordance with the`, margin, yPos + 6);
    pdf.text("terms and conditions laid down by the funding agency.", margin, yPos + 12);

    yPos += 30;
    pdf.text("Date: " + currentDate, margin, yPos);
    yPos += 20;

    // Signature section with actual signatures
    pdf.text("Signature:", margin, yPos);

    // Add PI signature if available
    if (piSignature) {
      pdf.addImage(piSignature, 'PNG', margin, yPos + 5, 50, 20);
      pdf.text("Principal Investigator", margin, yPos + 30);
    } else {
      pdf.text("Principal Investigator: ________________", margin, yPos + 15);
    }

    // Adding Authority signature if available
    if (authSignature) {
      pdf.addImage(authSignature, 'PNG', margin + 50, yPos, 50, 20);
      pdf.text("Accounts Officer Signature", margin + 50, yPos + 25);
    }

    // Add institute stamp if approved
    if (instituteStamp) {
      pdf.addImage(instituteStamp, 'PNG', pageWidth - margin - 50, yPos + 5, 50, 20);
      pdf.text("Head of Institution", pageWidth - margin - 30, yPos + 30);
    }

    pdf.save(`SE_${seData.name}_${seData.currentYear}.pdf`);
  };

  // Get appropriate page title based on user role
  const getPageTitle = () => {
    if (userRole === "Accounts Officer") {
      return "Approve Statement of Expenditures (AO)";
    } else {
      return "Approve Statement of Expenditures";
    }
  };

  // Get appropriate stamp modal title based on user role
  const getStampModalTitle = () => {
    if (userRole === "Accounts Officer") {
      return "Add AO Signature";
    } else {
      return "Add Institute Stamp";
    }
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const financialYear =
    currentMonth >= 3
      ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
      : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar yes={1}/>
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">{getPageTitle()}</h1>

          {!selectedRequest ? (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending SE Requests</h2>
              <div className="flex space-x-4 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search projects by PI name ..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      role="img"
                      aria-label="Search icon"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              {filteredSe.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No pending SE approval requests</p>
                </div>
              ) : (
                <>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSe.map((request) => (
                      <div
                        key={request._id}
                        className="border p-4 rounded-lg cursor-pointer transition-all duration-200 hover:border-grey-300 hover:bg-blue-50"
                        onClick={() => handleViewDetails(request)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-800">PI Name: {request.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Year: {request.currentYear}
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: Rs. {request.totalExp.total}
                            </p>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-xl p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handleBackToList}
                  className="flex items-center text-blue-600 hover:text-blue-800"
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
                <div id="se-details" className="bg-white rounded-lg p-6 border-t-4 border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">
                    Statement of Expenditure Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <label className="font-semibold text-gray-700">File Number</label>
                    <span className="px-3 py-1 w-full">: {seData.projectId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                    <span className="px-3 py-1 w-full">: {seData.institute}</span>
                    <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                    <span className="px-3 py-1 w-full">: {seData.name}</span>
                    <label className="font-semibold text-gray-700">Name of the Scheme</label>
                    <span className="px-3 py-1 w-full">: {seData.scheme}</span>
                    <label className="font-semibold text-gray-700">Present Year of Project</label>
                    <span className="px-3 py-1 w-full">: {seData.currentYear}</span>
                    <label className="font-semibold text-gray-700">Total Project Cost </label>
                    <span className="px-3 py-1 w-full">: {seData.TotalCost}</span>
                    <label className="font-semibold text-gray-700">Start Date of Year</label>
                    <span className="px-3 py-1 w-full">: {seData.startDate}</span>
                    <label className="font-semibold text-gray-700">End Date of Year</label>
                    <span className="px-3 py-1 w-full">: {seData.endDate}</span>
                  </div>

                  <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                  <ul className="list-disc pl-6 ">
                    {seData.yearlyBudget && seData.yearlyBudget.map((sanct, index) => (
                      <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                        <span>Year {index + 1}: {sanct}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                    <h2 className="text-center text-2xl font-bold mb-4">STATEMENT OF EXPENDITURE (FY {financialYear})</h2>
                    <h3 className="text-center text-lg font-semibold mb-4">Statement of Expenditure (to be submitted financial year wise)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 rounded-lg text-sm">
                        <thead>
                          <tr className="bg-blue-100 text-gray-700">
                            <th className="border border-gray-400 px-2 py-1" rowSpan="2">S/No</th>
                            <th className="border border-gray-400 px-2 py-1" rowSpan="2">Sanctioned Heads</th>
                            <th className="border border-gray-400 px-2 py-1" rowSpan="2">Total Funds Sanctioned</th>
                            <th className="border border-gray-400 px-2 py-1" colSpan="3">Expenditure Incurred</th>
                            <th className="border border-gray-400 px-2 py-1" rowSpan="2">Total Expenditure (vii=iv+v+vi)</th>
                            <th className="border border-gray-400 px-2 py-1" rowSpan="2">Balance against sanctioned as on 31.03.{new Date().getFullYear()} (viii=iii-vii)</th>
                            <th className="border border-gray-400 px-2 py-1" rowSpan="2">Requirement of Funds unto 31st March next year</th>
                            <th className="border border-gray-400 px-2 py-1" rowSpan="2">Remarks (if any)</th>
                          </tr>
                          <tr className="bg-blue-100 text-gray-700">
                            <th className="border border-gray-400 px-2 py-1">I Yr.</th>
                            <th className="border border-gray-400 px-2 py-1">II Yr.</th>
                            <th className="border border-gray-400 px-2 py-1">III Yr.</th>
                          </tr>
                          <tr className="bg-blue-100 text-gray-700 text-center">
                            <th className="border border-gray-400 px-2 py-1">(i)</th>
                            <th className="border border-gray-400 px-2 py-1">(ii)</th>
                            <th className="border border-gray-400 px-2 py-1">(iii)</th>
                            <th className="border border-gray-400 px-2 py-1">(iv)</th>
                            <th className="border border-gray-400 px-2 py-1">(v)</th>
                            <th className="border border-gray-400 px-2 py-1">(vi)</th>
                            <th className="border border-gray-400 px-2 py-1">(vii)</th>
                            <th className="border border-gray-400 px-2 py-1">(viii)</th>
                            <th className="border border-gray-400 px-2 py-1"></th>
                            <th className="border border-gray-400 px-2 py-1"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: 1, name: "Manpower Costs", key: "human_resources" },
                            { id: 2, name: "Consumables", key: "consumables" },
                            { id: 3, name: "Travel", key: "travel" },
                            { id: 4, name: "Contingencies", key: "contingencies" },
                            { id: 5, name: "Other Cost, if any", key: "others" },
                            { id: 6, name: "Equipments", key: "nonRecurring" },
                            { id: 7, name: "Overhead Expenses", key: "overhead" },
                          ].map((head) => {
                            // Calculate total expenditure for this head
                            const year1Value = seData.human_resources && head.key === "human_resources" ? seData.human_resources[0] || 0 :
                              seData[head.key] ? seData[head.key][0] || 0 : 0;
                            const year2Value = seData.human_resources && head.key === "human_resources" ? seData.human_resources[1] || 0 :
                              seData[head.key] ? seData[head.key][1] || 0 : 0;
                            const year3Value = seData.human_resources && head.key === "human_resources" ? seData.human_resources[2] || 0 :
                              seData[head.key] ? seData[head.key][2] || 0 : 0;

                            const totalExpValue = seData.totalExp && seData.totalExp[head.key]
                              ? seData.totalExp[head.key]
                              : (year1Value + year2Value + year3Value);

                            const sanctionedValue = seData.budgetSanctioned && seData.budgetSanctioned[head.key]
                              ? seData.budgetSanctioned[head.key]
                              : 0;

                            const balance = sanctionedValue - totalExpValue;

                            // Calculate fund requirement for next year
                            let fundRequirement = 0;
                            if (head.key === "overhead" && seData.budgetSanctioned && seData.budgetSanctioned.overhead) {
                              fundRequirement = seData.budgetSanctioned.overhead * 0.3;
                            }

                            return (
                              <tr key={head.id} className="text-center">
                                <td className="border border-gray-400 px-2 py-1">{head.id}</td>
                                <td className="border border-gray-400 px-2 py-1 text-left">{head.name}</td>
                                <td className="border border-gray-400 px-2 py-1">{sanctionedValue}</td>
                                <td className="border border-gray-400 px-2 py-1">{year1Value}</td>
                                <td className="border border-gray-400 px-2 py-1">{year2Value}</td>
                                <td className="border border-gray-400 px-2 py-1">{year3Value}</td>
                                <td className="border border-gray-400 px-2 py-1">{totalExpValue}</td>
                                <td className="border border-gray-400 px-2 py-1">{balance}</td>
                                <td className="border border-gray-400 px-2 py-1">
                                  {head.key === "overhead" ? fundRequirement.toFixed(0) : 0}
                                </td>
                                <td className="border border-gray-400 px-2 py-1">
                                  {head.key === "nonRecurring" ? "Including of commitments" : ""}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="text-center font-bold">
                            <td className="border border-gray-400 px-2 py-1">8</td>
                            <td className="border border-gray-400 px-2 py-1 text-center">Total</td>
                            <td className="border border-gray-400 px-2 py-1">
                              {seData.budgetSanctioned && seData.budgetSanctioned.total ? seData.budgetSanctioned.total : 0}
                            </td>
                            <td className="border border-gray-400 px-2 py-1">
                              {seData.total ? seData.total[0] || 0 : 0}
                            </td>
                            <td className="border border-gray-400 px-2 py-1">
                              {seData.total ? seData.total[1] || 0 : 0}
                            </td>
                            <td className="border border-gray-400 px-2 py-1">
                              {seData.total ? seData.total[2] || 0 : 0}
                            </td>
                            <td className="border border-gray-400 px-2 py-1">
                              {seData.totalExp && seData.totalExp.total ? seData.totalExp.total : 0}
                            </td>
                            <td className="border border-gray-400 px-2 py-1">
                              {((seData.budgetSanctioned && seData.budgetSanctioned.total) || 0) -
                                ((seData.totalExp && seData.totalExp.total) || 0)}
                            </td>
                            <td className="border border-gray-400 px-2 py-1">
                              {(seData.budgetSanctioned && seData.budgetSanctioned.overhead ? seData.budgetSanctioned.overhead * 0.3 : 0).toFixed(0)}
                            </td>
                            <td className="border border-gray-400 px-2 py-1"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> The audited statement of expenditure incurred under the Heads, and proper utilization of funds released during the period, may be sent to the agency immediately after the end of the financial year.
                      </p>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="border-t border-gray-200 pt-4 mb-6 mt-6">
                    <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <h4 className="font-medium mb-2">Accounts Officer</h4>
                        {authSignature ? (
                          <div className="border p-2 rounded mb-2">
                            <img src={authSignature} alt="AO Signature" className="h-24 object-contain" />
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                            <p className="text-gray-500">No signature added</p>
                          </div>
                        )}
                        {!authSignature && userRole === "Accounts Officer" && (
                          <button
                            onClick={handleAddStamp}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                            disabled={loading}
                          >
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add Signature
                            </div>
                          </button>
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
                        {!instituteStamp && userRole === "Head of Institute" && (
                          <button
                            onClick={handleAddStamp}
                            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Add Institute Stamp
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={handleSaveAsPDF}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Save as PDF
                      </div>
                    </button>

                    <div className="flex space-x-4">
                      {userRole === "Head of Institute" && selectedRequest.status === "pending" && (
                        <button
                          onClick={() => setShowSendToAOModal(true)}
                          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                          disabled={loading || !!instituteStamp === false}
                        >
                          Send to AO for Signature
                        </button>
                      )}

                      {userRole === "Accounts Officer" && selectedRequest.status === "pendingAuthSign" && (
                        <button
                          onClick={() => setShowApproveModal(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                          disabled={loading}
                        >
                          Add Signature & Approve
                        </button>
                      )}

                      {userRole === "Head of Institute" && selectedRequest.status === "approvedByAuth" && (
                        <button
                          onClick={() => setShowApproveModal(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                          disabled={loading}
                        >
                          Approve SE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal for adding stamp/signature */}
      {showStampModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{getStampModalTitle()}</h3>
              <button onClick={() => setShowStampModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              {showUploadOption ? (
                <div className="flex flex-col items-center space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (userRole === "CFO") {
                            setAuthSignature(event.target.result);
                          } else {
                            setInstituteStamp(event.target.result);
                          }
                          setShowStampModal(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setShowUploadOption(false)}
                  >
                    or Draw Instead
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="border border-gray-300 rounded-lg w-full">
                    <SignatureCanvas
                      ref={stampCanvas}
                      penColor="black"
                      canvasProps={{
                        width: 450,
                        height: 200,
                        className: 'w-full h-full rounded-lg'
                      }}
                      onEnd={handleStampEnd}
                    />
                  </div>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setShowUploadOption(true)}
                  >
                    or Upload Image Instead
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={clearStamp}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
              >
                Clear
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => setShowStampModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStamp}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for confirming send to AO */}
      {showSendToAOModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Send to AO for Signature</h3>
              <button onClick={() => setShowSendToAOModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mb-6">Are you sure you want to send this Statement of Expenditure to the AO for signature?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSendToAOModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSendToAO}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                disabled={loading || !instituteStamp}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                    Processing...
                  </div>
                ) : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for confirming approval */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {userRole === "Accounts Officer" ? "Approve SE (AO)" : "Approve SE (HOI)"}
              </h3>
              <button onClick={() => setShowApproveModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mb-6">
              {userRole === "Accounts Officer"
                ? "Are you sure you want to approve this Statement of Expenditure? This will add your signature to the document."
                : "Are you sure you want to approve this Statement of Expenditure? This will add the institute stamp to the document."}
            </p>
            {userRole === "Accounts Officer" && !authSignature ? (
              <div className="mb-4">
                <p className="text-amber-600 mb-2">Please add your signature first</p>
                <div className="border border-gray-300 rounded-lg w-full mb-4">
                  <SignatureCanvas
                    ref={stampCanvas}
                    penColor="black"
                    canvasProps={{
                      width: 450,
                      height: 150,
                      className: 'w-full h-full rounded-lg'
                    }}
                    onEnd={handleStampEnd}
                  />
                </div>
                <div className="flex justify-between mb-4">
                  <button
                    onClick={clearStamp}
                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                  >
                    Clear
                  </button>
                  <button
                    onClick={saveStamp}
                    className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                  >
                    Save Signature
                  </button>
                </div>
              </div>
            ) : null}

            {userRole === "Head of Institute" && selectedRequest.status === "approvedByAuth" && !instituteStamp ? (
              <div className="mb-4">
                <p className="text-amber-600 mb-2">Please add institute stamp first</p>
                <div className="border border-gray-300 rounded-lg w-full mb-4">
                  <SignatureCanvas
                    ref={stampCanvas}
                    penColor="black"
                    canvasProps={{
                      width: 450,
                      height: 150,
                      className: 'w-full h-full rounded-lg'
                    }}
                    onEnd={handleStampEnd}
                  />
                </div>
                <div className="flex justify-between mb-4">
                  <button
                    onClick={clearStamp}
                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                  >
                    Clear
                  </button>
                  <button
                    onClick={saveStamp}
                    className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                  >
                    Save Stamp
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={userRole === "Accounts Officer" ? handleAOApprove : handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                disabled={loading || (userRole === "Accounts Officer" ? !authSignature : !instituteStamp)}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
                    Processing...
                  </div>
                ) : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userRole === "Head of Institute" && selectedRequest?.status === "pending"
                  ? "Successfully sent to Accounts Officer"
                  : userRole === "Accounts Officer"
                    ? "Successfully approved"
                    : "Successfully approved SE"}
              </h3>
              <p className="text-sm text-gray-500">
                {userRole === "Head of Institute" && selectedRequest?.status === "pending"
                  ? "The Statement of Expenditure has been sent to the Accounts Officer for signature."
                  : userRole === "Accounts Officer"
                    ? "The SE has been approved and sent back to HOI for final approval."
                    : "The Statement of Expenditure has been successfully approved."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveSE;
