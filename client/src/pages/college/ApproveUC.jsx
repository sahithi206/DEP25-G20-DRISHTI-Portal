import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/InstituteSidebar";
import { AuthContext } from "../Context/Authcontext";
import SignatureCanvas from 'react-signature-canvas';
import TermsAndConditions from "../uc/se/TermsAndConditions";
import jsPDF from "jspdf";
import "jspdf-autotable";

const url = import.meta.env.VITE_REACT_APP_URL;

const ApproveUC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { getInstUser, fetchInstituteOfficials } = useContext(AuthContext);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [ucData, setUcData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("uc");
  const [userRole, setUserRole] = useState("");
  const [showSendToHeadModal, setShowSendToHeadModal] = useState(false);
  const [sentToHoi, setSentToHoi] = useState(false);
  const [authApproved, setAuthApproved] = useState(false);
  const [instituteApproved, setInstituteApproved] = useState(false);
  const [piSignature, setPiSignature] = useState(null);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [authSignature, setAuthSignature] = useState(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [instituteOfficials, setInstituteOfficials] = useState({
    headOfInstitute: "Loading...",
    cfo: "Loading...",
    accountsOfficer: "Loading...",
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const stampCanvas = useRef(null);

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
    const fetchPendingRequests = async () => {
      if (!userRole) return;

      // Set loading state to true at the start of fetch
      setIsLoading(true);

      try {
        let endpoint = `${url}uc/pendingByHOI`;
        if (userRole === "CFO") {
          endpoint = `${url}uc/pending`;
        }

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: localStorage.getItem("token"),
          },
        });

        const result = await res.json();
        if (result.success) {
          setPendingRequests(result.data);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        // Optionally set an error state
      } finally {
        // Ensure loading state is set to false after fetch completes
        setIsLoading(false);
      }
    };

    fetchPendingRequests();
  }, [userRole]);


  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTitle, setSearchTitle] = useState("");
  const [type, setType] = useState("");
  const [filteredUc, setFilteredUc] = useState([]);
  const [ucRequestId, setUcRequestId] = useState(null);

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
      if (type) {
        filtered = filtered.filter(project => project.type === type);
      }

      if (sortOrder === "newest") {
        filtered.sort((a, b) => new Date(b.submissionDate || 0) - new Date(a.submissionDate || 0));
      } else if (sortOrder === "oldest") {
        filtered.sort((a, b) => new Date(a.submissionDate || 0) - new Date(b.submissionDate || 0));
      }
      setFilteredUc(filtered);
    };

    filterrequests();
  }, [searchTitle, sortOrder, pendingRequests, type]);

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    // Store type immediately from the request parameter
    const requestType = request.type;
    setSelectedType(requestType);
    setUcData(request.ucData);

    // console.log("VIEWW - Debug point 1", request.projectId, requestType); 

    if (request.projectId && requestType) { // Use the local variable
      try {
        // console.log(`Making request to: ${url}uc/latest?projectId=${request.projectId}&type=${requestType}`);

        const res = await fetch(`${url}uc/latest?projectId=${request.projectId}&type=${requestType}`);
        // console.log("Response received:", res.status);

        const data = await res.json();
        // console.log("Response data:", data);
        if (data.success && data.data) {
          const uc = data.data;
          const authData = await fetchInstituteOfficials(uc.ucData.instituteName);
          // console.log("Auth Data:", authData);
          setInstituteOfficials(authData);
          setPiSignature(uc.piSignature);
          setUcRequestId(uc._id);
          if (uc.status === "approvedByInst") {
            setInstituteStamp(uc.instituteStamp);
            setAuthSignature(uc.authSignature);
            setInstituteApproved(true);
            setAuthApproved(true)
            setSentToHoi(true)
          }
          else if (uc.status === "pendingByHOI") {
            setAuthSignature(uc.authSignature);
            setSentToHoi(true);
          } else if (uc.status === "approvedByHOI") {
            setSentToHoi(true);
            setInstituteApproved(true);
            setInstituteStamp(uc.instituteStamp);
            setAuthSignature(uc.authSignature);
          } else {
            setInstituteApproved(false);
            setAuthApproved(false);
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
    setSelectedType(null);
    setSentToHoi(false);
    setInstituteApproved(false);
    setAuthApproved(false);
    setUcData(null);
    setPiSignature(null);
    setInstituteStamp(null);
    setAuthSignature(null);
  };

  const handleAddStamp = () => {
    if (!selectedRequest) return;
    setShowStampModal(true);
  };

  const handleStampEnd = () => {
    if (stampCanvas.current) {
      const stampDataUrl = stampCanvas.current.toDataURL();
      if (userRole === "CFO") {
        setAuthSignature(stampDataUrl);
      } else {
        setInstituteStamp(stampDataUrl);
      }
    }
  };

  const clearStamp = () => {
    if (stampCanvas.current) {
      stampCanvas.current.clear();
      if (userRole === "CFO") {
        setAuthSignature(null);
      } else {
        setInstituteStamp(null);
      }
    }
  };

  const saveStamp = () => {
    if (stampCanvas.current && !stampCanvas.current.isEmpty()) {
      const stampDataUrl = stampCanvas.current.toDataURL();
      if (userRole === "CFO") {
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

  const handleSendToHead = async () => {
    if (!selectedRequest || !authSignature) return;
    setLoading(true);

    try {
      const res = await fetch(`${url}uc/send-to-head/${selectedRequest._id}`, {
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
        throw new Error(data.message || "Failed to send to CFO");
      }

      const updatedPendingRequests = pendingRequests.filter(req => req._id !== selectedRequest._id);
      setPendingRequests(updatedPendingRequests);

      setShowSendToHeadModal(false);
      setShowSuccessModal(true);
      setSentToHoi(true);

      setTimeout(() => {
        setSelectedRequest(null);
        setAuthSignature(null);
        setShowSuccessModal(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error("Error sending to CFO:", err.message);
      alert("Failed to send to CFO");
      setLoading(false);
    }
  };

  const handleHeadApprove = async () => {
    if (!selectedRequest || !instituteStamp) return;
    setLoading(true);

    try {
      const res = await fetch(`${url}uc/head-approval/${selectedRequest._id}`, {
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

      const updatedPendingRequests = pendingRequests.filter(req => req._id !== selectedRequest._id);
      setPendingRequests(updatedPendingRequests);

      setShowApproveModal(false);
      setShowSuccessModal(true);
      setInstituteApproved(true)

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

  const handleApprove = async () => {
    if (!selectedRequest || !instituteStamp || !authSignature) return;
    setLoading(true);

    try {
      const res = await fetch(`${url}uc/approve/${selectedRequest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token")
        },
        body: JSON.stringify({
          instituteStamp: instituteStamp,
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
      setInstituteApproved(true);
      setAuthApproved(true);

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
      {
        label: "Name of Principal Investigator (PI)", value: Array.isArray(ucData.principalInvestigator)
          ? ucData.principalInvestigator.join(", ")
          : ucData.principalInvestigator
      },
      { label: "Title of the Project", value: ucData.title },
      { label: "Name of the Scheme", value: ucData.scheme || "N/A" },
      { label: "Whether recurring or non-recurring grants", value: selectedType === "recurring" ? "Recurring" : "Non Recurring" },
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
    pdf.text(`Rs ${ucData.CarryForward.toLocaleString()}`, margin + 120, yPos);
    yPos += 7;

    pdf.text("Others, If any", margin + 20, yPos);
    pdf.text("Rs 0", margin + 120, yPos);
    yPos += 7;

    pdf.text("Total", margin + 20, yPos);
    pdf.text(`Rs ${ucData.CarryForward.toLocaleString()}`, margin + 120, yPos);
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
    const nonRecurringExp = ucData.nonRecurringExp || 0;

    const isRecurring = selectedType === "recurring";
    const usedExp = isRecurring ? recurringExp : nonRecurringExp;

    const data = [
      [
        `Rs ${ucData.CarryForward.toLocaleString()}`,
        "Rs 0",
        "Rs 0",
        ucData.sanctionNumber || "N/A",
        ucData.sanctionDate || "N/A",
        `Rs ${ucData.yearTotal.toLocaleString()}`,
        `Rs ${ucData.total.toLocaleString()}`,
        `Rs ${usedExp.toLocaleString()}`,
        `Rs ${(ucData.total - usedExp).toLocaleString()}`
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

    const amount = isRecurring ? recurringExp : nonRecurringExp;

    pdf.text("Component wise utilization of grants:", margin, yPos);
    yPos += 5;

    const componentHeaders = [["Grant-in-aid-creation of capital assets", "Total"]];
    const formattedAmount = `Rs ${amount.toLocaleString()}`;
    const componentData = [[formattedAmount, formattedAmount]];

    pdf.autoTable({
      head: componentHeaders,
      body: componentData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
      styles: { fontSize: 10, cellPadding: 2, lineWidth: 0.1, lineColor: [0, 0, 0] }
    });

    yPos = pdf.lastAutoTable.finalY + 10;

    pdf.text("Details of grants position at the end of the year", margin, yPos);
    yPos += 7;

    const closingBalance = isRecurring ? (ucData.total - recurringExp) : (ucData.total - nonRecurringExp);

    pdf.text("(i)", margin, yPos);
    pdf.text("Balance available at end of financial year", margin + 10, yPos);
    pdf.text(`Rs ${closingBalance.toLocaleString()}`, margin + 100, yPos);
    yPos += 7;

    pdf.text("(ii)", margin, yPos);
    pdf.text("Unspent balance refunded to Funding Agency(if any)", margin + 10, yPos);
    pdf.text("Rs 0", margin + 100, yPos);
    yPos += 7;

    pdf.text("(iii)", margin, yPos);
    pdf.text("Balance (Carry forward to next financial year)", margin + 10, yPos);
    pdf.text(`Rs ${closingBalance.toLocaleString()}`, margin + 100, yPos);
    yPos += 15;

    pdf.addPage();
    yPos = 20;

    pdf.setFontSize(10);
    pdf.text("Certified that I have satisfied myself that the conditions on which grants were sanctioned have been duly ", margin, yPos);
    pdf.text("fulfilled/are being fulfilled and that I have exercised following checks to see that the money has ", margin, yPos + 5);
    pdf.text("been utilized for the purpose for which it was sanctioned.", margin, yPos + 10);
    yPos += 20;

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
    yPos += 10;

    // Set up signature section
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Signatures", margin, yPos);
    yPos += 5;

    // Create signature table
    const sigWidth = (contentWidth) / 3;
    const sigHeight = 40;
    const startX = margin;

    // Draw signature table outline
    pdf.rect(startX, yPos, contentWidth, sigHeight + 25);
    pdf.line(startX + sigWidth, yPos, startX + sigWidth, yPos + sigHeight + 25); // First vertical divider
    pdf.line(startX + sigWidth * 2, yPos, startX + sigWidth * 2, yPos + sigHeight + 25); // Second vertical divider
    pdf.line(startX, yPos + sigHeight, startX + contentWidth, yPos + sigHeight); // Horizontal divider

    // Add PI signature
    if (piSignature) {
      pdf.addImage(piSignature, 'PNG', startX + sigWidth / 4, yPos + 5, sigWidth / 2, sigHeight - 10);
    } else {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text("No signature added", startX + sigWidth / 2, yPos + sigHeight / 2, { align: "center" });
    }
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Signature of PI : ...........................", startX + sigWidth / 2, yPos + sigHeight + 10, { align: "center" });

    // Add CFO signature
    if (authSignature) {
      pdf.addImage(authSignature, 'PNG', startX + sigWidth + sigWidth / 4, yPos + 5, sigWidth / 2, sigHeight - 10);
    } else {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text(sentToCFO ? "Awaiting approval" : "Not sent for approval yet",
        startX + sigWidth + sigWidth / 2, yPos + sigHeight / 2, { align: "center" });
    }

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Signature ...............", startX + sigWidth + sigWidth / 2, yPos + sigHeight + 5, { align: "center" });
    pdf.text(`Name: ${instituteOfficials.cfo}`, startX + sigWidth + sigWidth / 2, yPos + sigHeight + 10, { align: "center" });
    pdf.text("Chief Finance Officer", startX + sigWidth + sigWidth / 2, yPos + sigHeight + 15, { align: "center" });
    pdf.text("(Head of Finance)", startX + sigWidth + sigWidth / 2, yPos + sigHeight + 20, { align: "center" });

    // Add Institute Head signature and stamp
    if (instituteStamp) {
      pdf.addImage(instituteStamp, 'PNG', startX + sigWidth * 2 + sigWidth / 4, yPos + 5, sigWidth / 2, sigHeight - 10);
    } else {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text("No signature added",
        startX + sigWidth * 2 + sigWidth / 2, yPos + sigHeight / 2, { align: "center" });
    }

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Signature.................", startX + sigWidth * 2 + sigWidth / 2, yPos + sigHeight + 5, { align: "center" });
    pdf.text(`Name: ${instituteOfficials.headOfInstitute}`, startX + sigWidth * 2 + sigWidth / 2, yPos + sigHeight + 10, { align: "center" });
    pdf.text("Head of Organisation", startX + sigWidth * 2 + sigWidth / 2, yPos + sigHeight + 15, { align: "center" });
    pdf.save(`UC_${ucData.title}_${selectedType}.pdf`);
  };

  // Get appropriate page title based on user role
  const getPageTitle = () => {
    if (userRole === "CFO") {
      return "Approve Utilization Certificates (CFO)";
    } else {
      return "Approve Utilization Certificates";
    }
  };

  // Get appropriate stamp modal title based on user role
  const getStampModalTitle = () => {
    if (userRole === "CFO") {
      return "Add CFO Signature";
    } else {
      return "Add Institute Stamp";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar yes={1} />
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">{getPageTitle()}</h1>
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg
                  className="animate-spin h-10 w-10 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-700">
                  Loading Pending Utilization Certificates
                </h2>
                <p className="text-gray-500">
                  Please wait while we retrieve your pending approvals...
                </p>
              </div>
            </div>
          ) : (
            !selectedRequest ? (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Requests</h2>
                <div className="flex space-x-4 mb-6">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search projects by PI name or Type..."
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
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All </option>
                    <option value="nonRecurring">Non Recurring</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
                {filteredUc.length === 0 ? (
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
                        key={request._id}
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
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            request.status === "pendingByHOI" ? "bg-blue-100 text-blue-800" :
                              request.status === "approvedByHOI" ? "bg-green-100 text-green-800" :
                                "bg-yellow-100 text-yellow-800"
                            }`}>
                            {request.status === "pending" ? "Pending CFO" :
                              request.status === "pendingByHOI" ? "Pending HOI" :
                                request.status === "approvedByHOI" ? "Ready for Approval" :
                                  "Pending"}
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
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedRequest.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    selectedRequest.status === "pendingByHOI" ? "bg-blue-100 text-blue-800" :
                      selectedRequest.status === "approvedByHOI" ? "bg-green-100 text-green-800" :
                        "bg-yellow-100 text-yellow-800"
                    }`}>
                    {selectedRequest.status === "pending" ? "Pending CFO Sign" :
                      selectedRequest.status === "pendingByHOI" ? "Pending HOI Sign" :
                        selectedRequest.status === "approvedByHOI" ? "Ready for Approval" :
                          "Pending Approval"}
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <h2 className="text-xl font-semibold">Processing Request</h2>
                    <p className="text-gray-600">Please wait while we process your action...</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-teal-600 mb-4">
                      {selectedType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <label className="font-semibold text-gray-700">Name of the Grant Receiving Organisation:</label>
                      <span className="px-3 py-1 w-full">: {ucData.instituteName}</span>

                      <label className="font-semibold text-gray-700">Name of the Principal Investigator(s):</label>
                      <span className="px-3 py-1 w-full">:{ucData.principalInvestigator?.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {ucData.principalInvestigator.map((name, idx) => (
                            <li key={idx}>{name}</li>
                          ))}
                        </ul>
                      ) : (
                        "N/A"
                      )}
                      </span>

                      <label className="font-semibold text-gray-700">Title of the Project:</label>
                      <span className="px-3 py-1 w-full">: {ucData.title}</span>

                      <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                      <span className="px-3 py-1 w-full">: {ucData.scheme}</span>

                      <label className="font-semibold text-gray-700">Whether recurring or non-recurring:</label>
                      <span className="px-3 py-1 w-full">: {selectedType}</span>

                      <label className="font-semibold text-gray-700">Present Year of Project:</label>
                      <span className="px-3 py-1 w-full">: {ucData.currentYear}</span>

                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                          Grants position at the beginning of the Financial year
                        </h3>
                        <div className="pl-11 grid grid-cols-2 gap-4">
                          <label className="text-gray-700">Carry forward from previous financial year</label>
                          <span className="px-3 py-1 w-full text-gray-700">₹ {ucData.CarryForward.toLocaleString()}</span>

                          <label className="text-gray-700">Others, If any</label>
                          <span className="px-3 py-1 w-full text-gray-700">₹ 0</span>

                          <label className="text-gray-700">Total</label>
                          <span className="px-3 py-1 w-full text-gray-700">₹ {ucData.CarryForward.toLocaleString()}</span>
                        </div>
                      </div>
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
                            <td className="border border-gray-400 px-4 py-2">{ucData.sanctionNumber || '23/2017/003478'}</td>
                            <td className="border border-gray-400 px-4 py-2">{ucData.sanctionDate || '12-03-2025'}</td>
                            <td className="border border-gray-400 px-4 py-2">₹ {ucData.yearTotal}</td>
                            <td className="border border-gray-400 px-4 py-2">₹ {ucData.total}</td>
                            <td className="border border-gray-400 px-4 py-2">
                              ₹ {selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                            </td>
                            <td className="border border-gray-400 px-4 py-2">
                              ₹ {ucData.total - (selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {(selectedType === "recurring" || selectedType !== "recurring") && (
                      <>
                        <h3 className="text-lg font-semibold text-teal-700 mt-6 mb-4">
                          Component-wise Utilization of Grants
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-300 rounded-lg">
                            <thead>
                              <tr className="bg-blue-100 text-gray-700">
                                <th className="border border-gray-400 px-4 py-2">Grant-in-aid-General</th>
                                <th className="border border-gray-400 px-4 py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="text-center">
                                <td className="border border-gray-400 px-4 py-2">
                                  ₹ {selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                                </td>
                                <td className="border border-gray-400 px-4 py-2">
                                  ₹ {selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                                </td>
                              </tr>

                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-green-700 mb-4">
                        Details of grants position at the end of the year
                      </h3>
                      <div className="pl-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex">
                            <span className="mr-2">(i)</span>
                            <span>Balance available at end of financial year</span>
                          </div>
                          <span>
                            : ₹ {ucData.total - (selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                          </span>

                          <div className="flex">
                            <span className="mr-2">(ii)</span>
                            <span>Unspent balance refunded to Funding Agency (if any)</span>
                          </div>
                          <span>: ₹ 0</span>

                          <div className="flex">
                            <span className="mr-2">(iii)</span>
                            <span>Balance (Carry forward to next financial year)</span>
                          </div>
                          <span>
                            : ₹ {ucData.total - (selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <TermsAndConditions />

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
                          <p className="font-medium">Signature of PI : ...........................</p>
                          <p className="font-medium">Name: {ucData.principalInvestigator[0]}</p>
                        </div>

                        <div className="border p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Chief Finance Officer</h4>
                          {authSignature ? (
                            <div className="border p-2 rounded mb-2">
                              <img src={authSignature} alt="CFO Signature" className="h-24 object-contain" />
                            </div>
                          ) : (
                            <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                              <p className="text-gray-500">No signature added</p>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">Signature ...............</p>
                            <p className="font-medium">Name: {instituteOfficials.cfo}</p>
                            <p className="font-medium">Chief Finance Officer</p>
                            <p className="font-medium">(Head of Finance)</p>
                          </div>
                          {!authSignature && userRole === "CFO" && (
                            <button
                              onClick={handleAddStamp}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                              disabled={loading}
                            >
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add CFO Signature
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
                          <div>
                            <p className="font-medium">Signature.................</p>
                            <p className="font-medium">Name: {instituteOfficials.headOfInstitute}</p>
                            <p className="font-medium">Head of Organisation</p>
                          </div>
                          {!instituteStamp && userRole === "Head of Institute" && (
                            <button
                              onClick={handleAddStamp}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                              disabled={loading}
                            >
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Institute Stamp
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        onClick={handleSaveAsPDF}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                      >
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Save as PDF
                        </div>
                      </button>

                      <div className="flex space-x-4">
                        {userRole === "CFO" && selectedRequest.status === "pending" && (
                          <button
                            onClick={() => setShowSendToHeadModal(true)}
                            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                            disabled={loading || !!authSignature === false}
                          >
                            Send to HOI for Signature
                          </button>
                        )}

                        {userRole === "Head of Institute" && selectedRequest.status === "pendingByHOI" && (
                          <button
                            onClick={() => setShowApproveModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                            disabled={loading}
                          >
                            Approve
                          </button>
                        )}

                        {userRole === "CFO" && selectedRequest.status === "approvedByHOI" && (
                          <button
                            onClick={() => setShowApproveModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                            disabled={loading}
                          >
                            Approve UC
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
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
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-teal-700 hover:file:bg-blue-100"
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

      {/* Modal for confirming send to CFO */}
      {showSendToHeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Send to HOI for Signature</h3>
              <button onClick={() => setShowSendToHeadModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mb-6">Are you sure you want to send this Utilization Certificate to the HOI for signature?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSendToHeadModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSendToHead}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-teal-700 transition duration-200"
                disabled={loading || !authSignature}
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
                {userRole === "CFO" ? "Approve UC (CFO)" : "Approve UC (HOI)"}
              </h3>
              <button onClick={() => setShowApproveModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mb-6">
              {userRole === "CFO"
                ? "Are you sure you want to approve this Utilization Certificate? This will add your signature to the document."
                : "Are you sure you want to approve this Utilization Certificate? This will add the institute stamp to the document."}
            </p>
            {userRole === "CFO" && !authSignature ? (
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

            {userRole === "CFO" && selectedRequest.status === "approvedByHOI" && !authSignature ? (
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
                onClick={userRole === "Head of Institute" ? handleHeadApprove : handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                disabled={loading || (userRole === "CFO" ? !authSignature : !instituteStamp)}
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
                {userRole === "CFO" && selectedRequest?.status === "pending"
                  ? "Successfully sent to HOI"
                  : userRole === "Head ofInstitute"
                    ? "Successfully approved"
                    : "Successfully approved UC"}
              </h3>
              <p className="text-sm text-gray-500">
                {userRole === "CFO" && selectedRequest?.status === "pending"
                  ? "The Utilization Certificate has been sent to the HOI for signature."
                  : userRole === "Head of Institute"
                    ? "The UC has been approved and sent back to CFO for final approval."
                    : "The Utilization Certificate has been successfully approved."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveUC;
