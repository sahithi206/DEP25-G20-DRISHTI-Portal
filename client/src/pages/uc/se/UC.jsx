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

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [piSignature, setPiSignature] = useState(null);
  const [sentForApproval, setSentForApproval] = useState(false);
  const [instituteApproved, setInstituteApproved] = useState(false);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [sentToAdmin, setSentToAdmin] = useState(false);
  const [ucRequestId, setUcRequestId] = useState(null);

  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (projectId && selectedType) {
        try {
          const res = await fetch(`${url}uc/latest?projectId=${projectId}&type=${selectedType}`);
          const data = await res.json();
          if (data.success && data.data) {
            const uc = data.data;
            setSentForApproval(true);
            setPiSignature(uc.piSignature);
            setInstituteStamp(uc.instituteStamp);
            setUcRequestId(uc._id);
            if (uc.status === "approvedByInst") {
              setInstituteApproved(true);
            } else {
              setInstituteApproved(false);
            }
          } else {
            setSentForApproval(false);
          }
        } catch (err) {
          console.error("Error fetching approval status:", err);
        }
      }
    };
    fetchStatus();
  }, [projectId, selectedType]);


  useEffect(() => {
    let checkApprovalInterval;

    if (sentForApproval && !instituteApproved) {
      checkApprovalInterval = setInterval(async () => {
        try {
          const res = await fetch(`${url}uc/approved?projectId=${projectId}&type=${selectedType}`);
          const data = await res.json();

          if (data.success && data.data) {
            setInstituteApproved(true);
            setInstituteStamp(data.data.instituteStamp);
            clearInterval(checkApprovalInterval);
          }
        } catch (err) {
          console.error("Error checking for approval:", err);
        }
      }, 60000); 
    }

    return () => clearInterval(checkApprovalInterval);
  }, [sentForApproval, instituteApproved, projectId, selectedType]);

  useEffect(() => {
    console.log("Institute Approved:", instituteApproved);
    console.log("Sent to Admin:", sentToAdmin);
    console.log("UC Request ID:", ucRequestId);
  }, [instituteApproved, sentToAdmin, ucRequestId]);

  const handleSendForApproval = async () => {
    try {
      if (!piSignature) {
        setError("PI signature is required before sending for approval");
        return;
      }

      const newRequest = {
        projectId: projectId,
        type: selectedType,
        ucData: ucData,
        piSignature: piSignature,
        submissionDate: new Date().toISOString(),
        status: "pending",
      };

      const response = await fetch(`${url}uc/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token"),
        },
        body: JSON.stringify(newRequest),
      });

      const result = await response.json();
      console.log("Response from /uc/submit:", result); 

      if (!result.success) {
        setError(result.message || "Failed to send for approval");
        return;
      }

      setUcRequestId(result.ucId); 
      console.log("UC Request ID:", result.ucId);

      setShowSuccessPopup(true);
      setSentForApproval(true);
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

  // const ApprovalStatusBanner = () => {
  //   if (!sentForApproval) return null;

  //   return (
  //     <div className={`rounded-lg p-4 mb-6 ${instituteApproved ? 'bg-green-100' : 'bg-yellow-100'}`}>
  //       <div className="flex items-center">
  //         {instituteApproved ? (
  //           <>
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  //             </svg>
  //             <span className="font-medium text-green-800">Approved by Institute on {new Date().toLocaleDateString()}</span>
  //           </>
  //         ) : (
  //           <>
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  //             </svg>
  //             <span className="font-medium text-yellow-800">Pending Institute Approval</span>
  //           </>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  const ApprovalStatusBanner = () => {
    if (!sentForApproval) {
      return (
        <div className="rounded-lg p-4 mb-6 bg-gray-100">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-gray-800">
              UC has not been sent for approval yet.
            </span>
          </div>
        </div>
      );
    }
  
    if (instituteApproved && sentToAdmin) {
      return (
        <div className="rounded-lg p-4 mb-6 bg-blue-100">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-blue-800">
              UC has been sent to Admin for final approval.
            </span>
          </div>
        </div>
      );
    }
  
    if (instituteApproved) {
      return (
        <div className="rounded-lg p-4 mb-6 bg-green-100">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-green-800">
              Approved by Institute on {new Date().toLocaleDateString()}.
            </span>
          </div>
        </div>
      );
    }
  }
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
    pdf.text(`as on ${currentDate} to be submitted to Funding Agency`, pageWidth / 2, 44, { align: "center" });
    pdf.text("Is the UC Provisional (Provisional/Audited)", pageWidth / 2, 50, { align: "center" });

    // Main Information Section
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const items = [
      { label: "Name of the grant receiving Organization", value: ucData.instituteName },
      { label: "Name of Principal Investigator (PI)", value: ucData.principalInvestigator },
      // { label: "SERB Sanction order no. & date", value: "ECR20XXXXXXXX Dated DD-MM-YYYY" },
      { label: "Title of the Project", value: ucData.title },
      // { label: "Name of the Scheme", value: ucData.scheme },
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
    pdf.text(`Rs ${ucData.CarryForward}`, margin + 120, yPos);
    yPos += 7;

    pdf.text("Others, If any", margin + 20, yPos);
    pdf.text("Rs 0", margin + 120, yPos);
    yPos += 7;

    pdf.text("Total", margin + 20, yPos);
    pdf.text(`Rs ${ucData.CarryForward}`, margin + 120, yPos);
    yPos += 10;

    // Details of grants received section
    pdf.text(`${itemNum + 1}`, margin, yPos);
    pdf.text("Details of grants received, expenditure incurred and closing balances: (Actual)", margin + 5, yPos);
    yPos += 10;

    // Complex table for grant details
    const headers = [
      [
        { content: "Unspent Balance of Grants\nreceived years", colSpan: 1 },
        { content: "Grant received\nduring the year", colSpan: 1 },
        { content: "Total", colSpan: 1 },
        { content: "Expenditure\nincurred", colSpan: 1 },
        { content: "Closing\nBalance (5 - 6)", colSpan: 1 }
      ]
    ];

    const data = [
      [
        `Rs ${ucData.CarryForward}`,
        `Rs ${ucData.yearTotal}`,
        `Rs ${ucData.total}`,
        `Rs ${ucData.recurringExp}`,
        `Rs ${ucData.total - ucData.recurringExp}`
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
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 }
      }
    });

    yPos = pdf.lastAutoTable.finalY + 10;

    // Component-wise utilization section
    if (selectedType === "recurring") {
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
      const componentData = [[`Rs ${ucData.recurringExp}`, `Rs ${ucData.recurringExp}`]];

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

    if (piSignature) {
      pdf.addImage(piSignature, 'PNG', margin, yPos, 50, 20);
      pdf.text("Signature of PI", margin, yPos + 25);
    } else {
      pdf.text("Signature of PI: ________________", margin, yPos + 10);
    }

    // Add institute stamp if approved (only for recurring type)
    if (instituteApproved && instituteStamp && selectedType === "recurring") {
      pdf.addImage(instituteStamp, 'PNG', margin + 100, yPos, 50, 20);
      pdf.text("Institute Stamp & Signature", margin + 100, yPos + 25);
    }

    if (instituteApproved && instituteStamp && selectedType === "nonRecurring") {
      pdf.addImage(instituteStamp, 'PNG', margin + 100, yPos, 50, 20);
      pdf.text("Institute Stamp & Signature", margin + 100, yPos + 25);
    }

    yPos += 35;

    pdf.save(`UC_${ucData.title}_${selectedType}${instituteApproved ? "_Approved" : ""}.pdf`);
  };

  const sendToAdmin = async () => {
    try {
      const response = await fetch(`${url}uc/send-to-admin/${ucRequestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token"),
        },
      });
  
      const result = await response.json();
  
      if (!result.success) {
        setError(result.message || "Failed to send UC to admin");
        return;
      }
  
      alert("UC sent to admin for approval");
      setSentToAdmin(true);
    } catch (err) {
      console.error("Error sending UC to admin:", err.message);
      setError("Failed to send UC to admin");
    }
  };

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
              <option value="" disabled>
                Select UC Type
              </option>
              <option value="recurring">Recurring</option>
              <option value="nonRecurring">Non-Recurring</option>
            </select>
          </div>

          {loading && <p className="text-center mt-6">Loading...</p>}

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
                      as on {new Date().toLocaleDateString()} to be submitted to Funding Agency
                    </p>
                    {/* <p className="text-sm font-medium">Is the UC Provisional (Provisional/Audited)</p> */}
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
                          <th className="border border-gray-400 px-4 py-2">UnSpent Balances from Previous Years</th>
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

                  {/* Signature Section */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border p-4 rounded-lg">
                      <h4 className="font-medium  mb-1">Principal Investigator Signature</h4>
                      <p className="text-medium mb-2 text-gray-500">{ucData.principalInvestigator}</p>                        {piSignature ? (
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

                        <h4 className="font-medium  mb-1">Institute Approval</h4>
                        <p className="text-medium mb-2 text-gray-500">{ucData.instituteName}</p>

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


                    <button
                      onClick={() => navigate(`/comments/${projectId}/${selectedType}`)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Comments
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
                        Send for Approval to Institute
                      </button>
                    )}

                    {instituteApproved && !sentToAdmin  && ucRequestId && (
                      <button
                        onClick={sendToAdmin}
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                      >
                        Send to Admin
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
