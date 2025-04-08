import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SignatureCanvas from 'react-signature-canvas';

const url = import.meta.env.VITE_REACT_APP_URL;

const UCForm = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [ucData, setUCData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Signature and approval states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [piSignature, setPiSignature] = useState(null);
  const [sentForApproval, setSentForApproval] = useState(false);
  const [instituteApproved, setInstituteApproved] = useState(false);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [showUploadOption, setShowUploadOption] = useState(false);

  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);

  // Check if this UC has been sent for approval or already approved
  useEffect(() => {
    if (projectId && selectedType) {
      // Check pending requests
      const storedPendingRequests = localStorage.getItem('pendingUCRequests');
      if (storedPendingRequests) {
        const pendingRequests = JSON.parse(storedPendingRequests);
        const pendingRequest = pendingRequests.find(req =>
          req.projectId === projectId && req.type === selectedType
        );

        if (pendingRequest) {
          setSentForApproval(true);
          setPiSignature(pendingRequest.piSignature);
        }
      }

      // Check approved requests
      const storedApprovedRequests = localStorage.getItem('approvedUCRequests');
      if (storedApprovedRequests) {
        const approvedRequests = JSON.parse(storedApprovedRequests);
        const approvedRequest = approvedRequests.find(req =>
          req.projectId === projectId && req.type === selectedType
        );

        if (approvedRequest) {
          setSentForApproval(true);
          setInstituteApproved(true);
          setPiSignature(approvedRequest.piSignature);
          setInstituteStamp(approvedRequest.instituteStamp);
        }
      }
    }
  }, [projectId, selectedType]);

  useEffect(() => {
    if (sentForApproval && !instituteApproved) {
      const checkApprovalInterval = setInterval(() => {
        const storedApprovedRequests = localStorage.getItem('approvedUCRequests');
        if (storedApprovedRequests) {
          const approvedRequests = JSON.parse(storedApprovedRequests);
          const approvedRequest = approvedRequests.find(req =>
            req.projectId === projectId && req.type === selectedType
          );

          if (approvedRequest) {
            setInstituteApproved(true);
            setInstituteStamp(approvedRequest.instituteStamp);
            clearInterval(checkApprovalInterval);
          }
        }
      // }, 60000); // Check every 1 min
      });

      return () => clearInterval(checkApprovalInterval);
    }
  }, [sentForApproval, instituteApproved, projectId, selectedType]);

  const handleSendForApproval = async () => {
    try {
      if (!piSignature) {
        setError("PI signature is required before sending for approval");
        return;
      }

      // Create a new request object
      const newRequest = {
        id: `uc-${Date.now()}`,
        projectId: projectId,
        type: selectedType,
        ucData: ucData,
        piSignature: piSignature,
        submissionDate: new Date().toISOString(),
        status: "pending"
      };

      // Get existing pending requests from local storage
      const storedRequests = localStorage.getItem('pendingUCRequests');
      const pendingRequests = storedRequests ? JSON.parse(storedRequests) : [];

      // Add the new request
      pendingRequests.push(newRequest);

      // Save back to local storage
      localStorage.setItem('pendingUCRequests', JSON.stringify(pendingRequests));

      // Show success popup
      setShowSuccessPopup(true);
      setSentForApproval(true);

      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (err) {
      console.error("Error sending for approval:", err.message);
      setError("Failed to send for approval");
    }
  };

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

  // Handle PI signature
  const handleSignatureEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureDataUrl = sigCanvas.current.toDataURL();
      setPiSignature(signatureDataUrl);
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setPiSignature(null);
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureDataUrl = sigCanvas.current.toDataURL();
      setPiSignature(signatureDataUrl);
      setShowSignatureModal(false);
    } else {
      setError("Please provide a signature before saving");
    }
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
        setPiSignature(event.target.result);
        setShowSignatureModal(false);
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

  const ApprovalStatusBanner = () => {
    if (!sentForApproval) return null;

    return (
      <div className={`rounded-lg p-4 mb-6 ${instituteApproved ? 'bg-green-100' : 'bg-yellow-100'}`}>
        <div className="flex items-center">
          {instituteApproved ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-green-800">Approved by Institute on {new Date().toLocaleDateString()}</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-yellow-800">Pending Institute Approval</span>
            </>
          )}
        </div>
      </div>
    );
  };

  // For demo purposes - simulate institute approval
  const simulateInstituteApproval = () => {
    // This would normally be an API call to check if the institute has approved
    // For demo, we'll just set it to approved with a sample stamp
    setInstituteApproved(true);
    // Sample institute stamp - normally would come from backend
    setInstituteStamp("/path/to/institute-stamp.png");
    // For demo, using a placeholder image
    setInstituteStamp("/api/placeholder/150/150");
  };

  useEffect(() => {
    // For demonstration, we'll simulate the institute approving after 10 seconds
    // In a real application, this would be handled by an API call or webhook
    if (sentForApproval) {
      const timer = setTimeout(() => {
        simulateInstituteApproval();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [sentForApproval]);

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
    pdf.text("GFR 12-A", pageWidth / 2, 20, { align: "center" });
    pdf.setFontSize(12);
    pdf.text("[See Rule 238 (1)]", pageWidth / 2, 25, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(`FINAL UTILIZATION CERTIFICATE FOR THE YEAR ${ucData.currentYear} in respect of`, pageWidth / 2, 32, { align: "center" });
    pdf.text(`${selectedType === "recurring" ? "Recurring" : "Non - Recurring"}`, pageWidth / 2, 38, { align: "center" });
    pdf.text(`as on ${currentDate} to be submitted to SERB`, pageWidth / 2, 44, { align: "center" });
    pdf.text("Is the UC Provisional (Provisional/Audited)", pageWidth / 2, 50, { align: "center" });

    // Main Information Section
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const items = [
      { label: "Name of the grant receiving Organization", value: ucData.instituteName },
      { label: "Name of Principal Investigator (PI)", value: ucData.principalInvestigator },
      { label: "SERB Sanction order no. & date", value: "ECR20XXXXXXXX Dated DD-MM-YYYY" },
      { label: "Title of the Project", value: ucData.title },
      { label: "Name of the SERB Scheme", value: ucData.scheme },
      { label: "Whether recurring or non-recurring grants", value: selectedType === "recurring" ? "Recurring" : "Non Recurring" }
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

    // Grants position at beginning of financial year
    yPos += 3;
    pdf.text(`${itemNum}`, margin, yPos);
    pdf.text("Grants position of the beginning of the Financial year", margin + 5, yPos);
    yPos += 7;

    // Financial details
    pdf.text("Carry forward from previous financial year", margin + 20, yPos);
    pdf.text(`₹ ${ucData.CarryForward}`, margin + 120, yPos);
    yPos += 7;

    pdf.text("Others, If any", margin + 20, yPos);
    pdf.text("₹ 0", margin + 120, yPos);
    yPos += 7;

    pdf.text("Total", margin + 20, yPos);
    pdf.text(`₹ ${ucData.CarryForward}`, margin + 120, yPos);
    yPos += 10;

    // Details of grants received section
    pdf.text(`${itemNum + 1}`, margin, yPos);
    pdf.text("Details of grants received, expenditure incurred and closing balances: (Actual)", margin + 5, yPos);
    yPos += 10;

    // Complex table for grant details
    const headers = [
      [{ content: "Unspent Balance of\nGrants received years\n(figure as at Sl. No. 7\n(iii))", colSpan: 1, rowSpan: 2 },
      { content: "Interest Earned\nthereon", colSpan: 1, rowSpan: 2 },
      { content: "Interest\ndeposited\nback to the\nSERB", colSpan: 1, rowSpan: 2 },
      { content: "Grant received during the year", colSpan: 3, rowSpan: 1 },
      { content: "Total\n(1+2 - 3+4)", colSpan: 1, rowSpan: 2 },
      { content: "Expenditur\ne incurred", colSpan: 1, rowSpan: 2 },
      { content: "Closing\nBalances (5 - 6)", colSpan: 1, rowSpan: 2 }]
    ];

    const subHeaders = [
      ["", "", "", "Sanction No.", "Date", "Amount", "", "", ""]
    ];

    const interestAmount = Math.round(ucData.CarryForward * 0.025); // Example interest calculation (2.5%)

    const data = [
      [`₹ ${ucData.CarryForward}`, `₹ ${interestAmount}`, "₹ 0", "ECR20XXXXXXXX",
      `${new Date().getDate()}-${new Date().toLocaleString('default', { month: 'short' })}-${new Date().getFullYear()}`,
        "₹ 0", `₹ ${ucData.CarryForward + interestAmount}`, `₹ ${ucData.recurringExp}`,
      `₹ ${ucData.CarryForward + interestAmount - ucData.recurringExp}`]
    ];

    pdf.autoTable({
      head: [...headers, ...subHeaders],
      body: data,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0] },
      styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak', lineWidth: 0.1, lineColor: [0, 0, 0] },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 20 }, 2: { cellWidth: 20 } }
    });

    yPos = pdf.lastAutoTable.finalY + 10;

    // Component-wise utilization section
    if (selectedType === "recurring") {
      pdf.text("Component wise utilization of grants:", margin, yPos);
      yPos += 5;

      const componentHeaders = [["Component", "Total"]];
      const componentData = [
        ["Human Resources", `₹ ${ucData.human_resources}`],
        ["Consumables", `₹ ${ucData.consumables}`],
        ["Others", `₹ ${ucData.others}`],
        ["Total", `₹ ${ucData.recurringExp}`]
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
      const componentData = [[`₹ ${ucData.recurringExp}`, `₹ ${ucData.recurringExp}`]];

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

    // Details of grants position at end of year
    pdf.text("Details of grants position at the end of the year", margin, yPos);
    yPos += 7;

    const closingBalance = ucData.CarryForward + interestAmount - ucData.recurringExp;

    pdf.text("(i)", margin, yPos);
    pdf.text("Balance available at end of financial year", margin + 10, yPos);
    pdf.text(`₹ ${closingBalance}`, margin + 100, yPos);
    yPos += 7;

    pdf.text("(ii)", margin, yPos);
    pdf.text("Unspent balance refunded to SERB (if any)", margin + 10, yPos);
    pdf.text("₹ 0", margin + 100, yPos);
    yPos += 7;

    pdf.text("(iii)", margin, yPos);
    pdf.text("Balance (Carry forward to next financial year)", margin + 10, yPos);
    pdf.text(`₹ ${closingBalance}`, margin + 100, yPos);
    yPos += 15;

    // Add new page for certification
    pdf.addPage();
    yPos = 20;

    // Certification text
    pdf.setFontSize(10);
    pdf.text("Certified that I have satisfied myself that the conditions on which grants were sanctioned have been duly fulfilled/are being fulfilled and that I", margin, yPos);
    pdf.text("have exercised following checks to see that the money has been actually utilized for the purpose which it was sanctioned:", margin, yPos + 5);
    yPos += 15;

    // Certification items
    const certItems = [
      "The main accounts and other subsidiary accounts and registers (including assets registers) are maintained as prescribed in the relevant Act/Rules/Standing instructions (mention the Act/Rules) and have been duly audited by designated auditors. The figures depicted above tally with the audited figures mentioned in financial statements/accounts.",
      "There exist internal controls for safeguarding public funds/assets, watching outcomes and achievements of physical targets against the financial inputs, ensuring quality in asset creation etc. & the periodic evaluation of internal controls is exercised to ensure their effectiveness.",
      "To the best of our knowledge and belief, no transactions have been entered that are in violation of relevant Act/Rules/standing instructions and scheme guidelines.",
      "The responsibilities among the key functionaries for execution of the scheme have been assigned in clear terms and are not general in nature.",
      "The benefits were extended to the intended beneficiaries and only such areas/districts were covered where the scheme was intended to operate.",
      "The expenditure on various components of the scheme was in the proportions authorized as per the scheme guidelines and terms and conditions of the grants-in-aid.",
      "It has been ensured that the physical and financial performance under ECRA has been according to the requirements, as prescribed in the guidelines issued by Govt. of India and the performance/targets achieved statement for the year to which the utilization of the fund resulted in outcomes given at Annexure-I duly enclosed.",
      "The utilization of the fund resulted in outcomes given at Annexure-II duly enclosed (to be formulated by the Ministry/Department concerned as per their requirements/specifications)",
      "Details of various schemes executed by the agency through grants-in-aid received from the same Ministry or from other Ministries is enclosed at Annexure-II (to be formulated by the Ministry/Department concerned as per their requirements/specifications)"
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
    pdf.text("Place: ", margin, yPos);
    yPos += 15;

    // Signature section with actual signatures
    pdf.text("Signatures:", margin, yPos);
    yPos += 10;

    // Add PI signature if available
    if (piSignature) {
      pdf.addImage(piSignature, 'PNG', margin, yPos, 50, 20);
      pdf.text("Signature of PI", margin, yPos + 25);
    } else {
      pdf.text("Signature of PI: ________________", margin, yPos + 10);
    }

    // Add institute stamp if approved
    if (instituteApproved && instituteStamp) {
      pdf.addImage(instituteStamp, 'PNG', margin + 100, yPos, 50, 20);
      pdf.text("Institute Stamp & Signature", margin + 100, yPos + 25);
    }

    yPos += 35;

    pdf.save(`UC_${ucData.title}_${selectedType}${instituteApproved ? "_Approved" : ""}.pdf`);
  };

  // UI component for signature canvas modal
  const SignatureModal = () => {
    if (!showSignatureModal) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowSignatureModal(false)}></div>
        <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Sign here</h3>
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleUploadOption}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-2"
            >
              {showUploadOption ? "Draw Signature" : "Upload Signature"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileUpload}
            />
          </div>

          {showUploadOption ? (
            <div className="flex flex-col items-center">
              <button
                onClick={triggerFileInput}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
              >
                Select Image File (PNG, JPG)
              </button>
              {piSignature && (
                <div className="mt-2 border border-gray-300 p-2 rounded">
                  <img src={piSignature} alt="Uploaded signature" className="h-24 object-contain" />
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md mb-4">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "signature-canvas w-full"
                }}

              />
            </div>
          )}

          <div className="flex justify-between">
            {!showUploadOption && (
              <button
                onClick={clearSignature}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowSignatureModal(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              onClick={saveSignature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Signature
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SuccessPopup = () => {
    if (!showSuccessPopup) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowSuccessPopup(false)}></div>
        <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Success!</h3>
          <p className="text-center text-gray-600">
            Your Utilization Certificate has been sent for Institute approval.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div
        className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select UC Type</option>
              <option value="recurring">Recurring</option>
              <option value="nonRecurring">Non-Recurring</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}

          {selectedType && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-6">
              <ApprovalStatusBanner />

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                </div>
              ) : ucData ? (
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
                      as on {new Date().toLocaleDateString()} to be submitted to SERB
                    </p>
                    <p className="text-sm font-medium">Is the UC Provisional (Provisional/Audited)</p>
                  </div>

                  <h3 className="text-lg font-semibold text-blue-700 mb-4">
                    {selectedType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex">
                      <span className="w-6">1</span>
                      <span className="font-semibold text-gray-700">Name of the grant receiving Organization:</span>
                      <span className="ml-2">{ucData.instituteName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-6">2</span>
                      <span className="font-semibold text-gray-700">Name of Principal Investigator (PI):</span>
                      <span className="ml-2">{ucData.principalInvestigator}</span>
                    </div>
                    <div className="flex">
                      <span className="w-6">3</span>
                      <span className="font-semibold text-gray-700">SERB Sanction order no. & date:</span>
                      <span className="ml-2">ECR20XXXXXXXX Dated DD-MM-YYYY</span>
                    </div>
                    <div className="flex">
                      <span className="w-6">4</span>
                      <span className="font-semibold text-gray-700">Title of the Project:</span>
                      <span className="ml-2">{ucData.title}</span>
                    </div>
                    <div className="flex">
                      <span className="w-6">5</span>
                      <span className="font-semibold text-gray-700">Name of the SERB Scheme:</span>
                      <span className="ml-2">{ucData.scheme}</span>
                    </div>
                    <div className="flex">
                      <span className="w-6">6</span>
                      <span className="font-semibold text-gray-700">Whether recurring or non-recurring grants:</span>
                      <span className="ml-2">{selectedType === "recurring" ? "Recurring" : "Non Recurring"}</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex">
                      <span className="w-6">7</span>
                      <span className="font-semibold text-gray-700">Grants position of the beginning of the Financial year</span>
                    </div>
                    <div className="pl-8 mt-2">
                      <div className="flex justify-between">
                        <span>Carry forward from previous financial year</span>
                        <span>₹ {ucData.CarryForward}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Others, If any</span>
                        <span>₹ 0</span>
                      </div>
                      <div className="flex justify-between mt-1 font-semibold">
                        <span>Total</span>
                        <span>₹ {ucData.CarryForward}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex mb-2">
                      <span className="w-6">8</span>
                      <span className="font-semibold text-gray-700">Details of grants received, expenditure incurred and closing balances: (Actual)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th rowSpan="2" className="border border-gray-300 p-1">Unspent Balance of Grants received years (figure as at Sl. No. 7 (iii))</th>
                            <th rowSpan="2" className="border border-gray-300 p-1">Interest Earned thereon</th>
                            <th rowSpan="2" className="border border-gray-300 p-1">Interest deposited back to the SERB</th>
                            <th colSpan="3" className="border border-gray-300 p-1">Grant received during the year</th>
                            <th rowSpan="2" className="border border-gray-300 p-1">Total (1+2 - 3+4)</th>
                            <th rowSpan="2" className="border border-gray-300 p-1">Expenditure incurred</th>
                            <th rowSpan="2" className="border border-gray-300 p-1">Closing Balances (5 - 6)</th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-1">Sanction No.</th>
                            <th className="border border-gray-300 p-1">Date</th>
                            <th className="border border-gray-300 p-1">Amount</th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-1">1</th>
                            <th className="border border-gray-300 p-1">2</th>
                            <th className="border border-gray-300 p-1">3</th>
                            <th colSpan="3" className="border border-gray-300 p-1">4</th>
                            <th className="border border-gray-300 p-1">5</th>
                            <th className="border border-gray-300 p-1">6</th>
                            <th className="border border-gray-300 p-1">7</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-center">
                            <td className="border border-gray-300 p-1">₹ {ucData.CarryForward}</td>
                            <td className="border border-gray-300 p-1">₹ {Math.round(ucData.CarryForward * 0.025)}</td>
                            <td className="border border-gray-300 p-1">₹ 0</td>
                            <td className="border border-gray-300 p-1">ECR20XXXXXXXX</td>
                            <td className="border border-gray-300 p-1">{new Date().getDate()}-{new Date().toLocaleString('default', { month: 'short' })}-{new Date().getFullYear()}</td>
                            <td className="border border-gray-300 p-1">₹ 0</td>
                            <td className="border border-gray-300 p-1">₹ {ucData.CarryForward + Math.round(ucData.CarryForward * 0.025)}</td>
                            <td className="border border-gray-300 p-1">₹ {ucData.recurringExp}</td>
                            <td className="border border-gray-300 p-1">₹ {ucData.CarryForward + Math.round(ucData.CarryForward * 0.025) - ucData.recurringExp}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedType === "recurring" ? (
                    <div className="mb-6">
                      <div className="font-semibold text-gray-700 mb-2">Component wise utilization of grants:</div>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2">Component</th>
                              <th className="border border-gray-300 p-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="text-center">
                              <td className="border border-gray-300 p-2">Human Resources</td>
                              <td className="border border-gray-300 p-2">₹ {ucData.human_resources}</td>
                            </tr>
                            <tr className="text-center">
                              <td className="border border-gray-300 p-2">Consumables</td>
                              <td className="border border-gray-300 p-2">₹ {ucData.consumables}</td>
                            </tr>
                            <tr className="text-center">
                              <td className="border border-gray-300 p-2">Others</td>
                              <td className="border border-gray-300 p-2">₹ {ucData.others}</td>
                            </tr>
                            <tr className="text-center font-semibold">
                              <td className="border border-gray-300 p-2">Total</td>
                              <td className="border border-gray-300 p-2">₹ {ucData.recurringExp}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="font-semibold text-gray-700 mb-2">Component wise utilization of grants:</div>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 p-2">Grant-in-aid-creation of capital assets</th>
                              <th className="border border-gray-300 p-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="text-center">
                              <td className="border border-gray-300 p-2">₹ {ucData.recurringExp}</td>
                              <td className="border border-gray-300 p-2">₹ {ucData.recurringExp}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}


                  <div className="mb-6">
                    <div className="font-semibold text-gray-700 mb-2">Details of grants position at the end of the year</div>
                    <div className="pl-4">
                      <div className="flex gap-2 mb-1">
                        <span>(i)</span>
                        <span>Balance available at end of financial year</span>
                        <span className="flex-grow text-right">₹ {ucData.CarryForward + Math.round(ucData.CarryForward * 0.025) - ucData.recurringExp}</span>
                      </div>
                      <div className="flex gap-2 mb-1">
                        <span>(ii)</span>
                        <span>Unspent balance refunded to SERB (if any)</span>
                        <span className="flex-grow text-right">₹ 0</span>
                      </div>
                      <div className="flex gap-2 mb-1">
                        <span>(iii)</span>
                        <span>Balance (Carry forward to next financial year)</span>
                        <span className="flex-grow text-right">₹ {ucData.CarryForward + Math.round(ucData.CarryForward * 0.025) - ucData.recurringExp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="font-semibold text-gray-700 mb-2">Certification</div>
                    <p className="text-sm mb-2">
                      Certified that I have satisfied myself that the conditions on which grants were sanctioned have been duly fulfilled/are being fulfilled and that I
                      have exercised following checks to see that the money has been actually utilized for the purpose which it was sanctioned:
                    </p>
                    <ol className="list-roman pl-6 text-sm space-y-2">
                      <li>The main accounts and other subsidiary accounts and registers (including assets registers) are maintained as prescribed in the relevant Act/Rules/Standing instructions (mention the Act/Rules) and have been duly audited by designated auditors. The figures depicted above tally with the audited figures mentioned in financial statements/accounts.</li>
                      <li>There exist internal controls for safeguarding public funds/assets, watching outcomes and achievements of physical targets against the financial inputs, ensuring quality in asset creation etc. & the periodic evaluation of internal controls is exercised to ensure their effectiveness.</li>
                      <li>To the best of our knowledge and belief, no transactions have been entered that are in violation of relevant Act/Rules/standing instructions and scheme guidelines.</li>
                      <li>The responsibilities among the key functionaries for execution of the scheme have been assigned in clear terms an</li>
                      <li>The responsibilities among the key functionaries for execution of the scheme have been assigned in clear terms and are not general in nature.</li>
                      <li>The benefits were extended to the intended beneficiaries and only such areas/districts were covered where the scheme was intended to operate.</li>
                      <li>The expenditure on various components of the scheme was in the proportions authorized as per the scheme guidelines and terms and conditions of the grants-in-aid.</li>
                      <li>It has been ensured that the physical and financial performance under ECRA has been according to the requirements, as prescribed in the guidelines issued by Govt. of India and the performance/targets achieved statement for the year to which the utilization of the fund resulted in outcomes given at Annexure-I duly enclosed.</li>
                      <li>The utilization of the fund resulted in outcomes given at Annexure-II duly enclosed (to be formulated by the Ministry/Department concerned as per their requirements/specifications)</li>
                      <li>Details of various schemes executed by the agency through grants-in-aid received from the same Ministry or from other Ministries is enclosed at Annexure-II (to be formulated by the Ministry/Department concerned as per their requirements/specifications)</li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-sm">Place: </p>
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
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

                        {!sentForApproval && (
                          <button
                            onClick={() => setShowSignatureModal(true)}
                            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={instituteApproved}
                          >
                            {piSignature ? "Change Signature" : "Add Signature"}
                          </button>
                        )}
                      </div>

                      <div className="border p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Institute Approval</h4>
                        {instituteApproved && instituteStamp ? (
                          <div className="border p-2 rounded mb-2">
                            <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                            <p className="text-gray-500">
                              {sentForApproval ? "Awaiting approval" : "Not sent for approval yet"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleSaveAsPDF}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Save as PDF
                    </button>

                    {!sentForApproval && (
                      <button
                        onClick={handleSendForApproval}
                        disabled={!piSignature}
                        className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center ${piSignature
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Send for Approval
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Select a UC type to generate the certificate</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SignatureModal />
      <SuccessPopup />
    </div>
  );
};

export default UCForm;
