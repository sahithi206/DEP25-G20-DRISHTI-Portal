
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/InstituteSidebar";
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from "jspdf";
import "jspdf-autotable";

const url = import.meta.env.VITE_REACT_APP_URL;

const ApproveSE = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [seData, setSeData] = useState(null);
  const [piSignature, setPiSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("se-approve");
  const [showUploadOption, setShowUploadOption] = useState(false);
  const navigate = useNavigate();

  const stampCanvas = useRef(null);
  const fileInputRef = useRef(null);
   const [sortOrder, setSortOrder] = useState("newest");
      const [searchTitle, setSearchTitle] = useState("");
      const [filteredUc, setFilteredUc] = useState([]);
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
            setFilteredUc(filtered);
          };
      
          filterrequests();
        }, [searchTitle,sortOrder,pendingRequests]);

  // Fetch pending requests on component mount
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch(`${url}se/pending`, {
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
        console.error("Error fetching pending SE requests:", err);
      }
    };
    fetchPending();
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setSeData(request);
    setPiSignature(request.piSignature);
  };

  const handleBackToList = () => {
    setSelectedRequest(null);
    setSeData(null);
    setPiSignature(null);
    setInstituteStamp(null);
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

  const handleAddStamp = () => {
    if (!selectedRequest) return;
    setShowStampModal(true);
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
      const updatedPendingRequests = filteredUc.filter(req => req._id !== selectedRequest._id);
      setFilteredUc(updatedPendingRequests);

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

    // Add institute stamp if approved
    if (instituteStamp) {
      pdf.addImage(instituteStamp, 'PNG', pageWidth - margin - 50, yPos + 5, 50, 20);
      pdf.text("Head of Institution", pageWidth - margin - 30, yPos + 30);
    }

    pdf.save(`SE_${seData.name}_${seData.currentYear}.pdf`);
  };

  const SignatureModal = () => {
    if (!showStampModal) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowStampModal(false)}></div>
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
              {instituteStamp && (
                <div className="mt-2 border border-gray-300 p-2 rounded">
                  <img src={instituteStamp} alt="Uploaded signature" className="h-24 object-contain" />
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-300 rounded-md mb-4">
              <SignatureCanvas
                ref={stampCanvas}
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
                onClick={clearStamp}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowStampModal(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              onClick={saveStamp}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Approve Statement of Expenditure</h1>

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
              {filteredUc.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No pending SE approval requests</p>
                </div>
              ) : (
                <>
               
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUc.map((request) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <label className="font-semibold text-gray-700">Project Title:</label>
                    <span className="px-3 py-1 w-full">: {seData.name}</span>

                    <label className="font-semibold text-gray-700">Name of the Institution:</label>
                    <span className="px-3 py-1 w-full">: {seData.institute}</span>

                    <label className="font-semibold text-gray-700">Funding Agency/Scheme:</label>
                    <span className="px-3 py-1 w-full">: {seData.scheme}</span>

                    <label className="font-semibold text-gray-700">Project Year:</label>
                    <span className="px-3 py-1 w-full">: {seData.currentYear}</span>

                    <label className="font-semibold text-gray-700">Period of Statement:</label>
                    <span className="px-3 py-1 w-full">: {seData.startDate} to {seData.endDate}</span>

                    <label className="font-semibold text-gray-700">Total Project Cost:</label>
                    <span className="px-3 py-1 w-full">: Rs. {seData.TotalCost}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-blue-700 mb-4">Expenditure Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="border border-gray-400 px-4 py-2">Budget Head</th>
                          <th className="border border-gray-400 px-4 py-2">Sanctioned Amount (Rs)</th>
                          <th className="border border-gray-400 px-4 py-2">Expenditure (Rs)</th>
                          <th className="border border-gray-400 px-4 py-2">Balance (Rs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-center">
                          <td className="border border-gray-400 px-4 py-2">Human Resources</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.human_resources}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.totalExp.human_resources}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.balance.human_resources}</td>
                        </tr>
                        <tr className="text-center">
                          <td className="border border-gray-400 px-4 py-2">Consumables</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.consumables}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.totalExp.consumables}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.balance.consumables}</td>
                        </tr>
                        <tr className="text-center">
                          <td className="border border-gray-400 px-4 py-2">Others</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.others}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.totalExp.others}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.balance.others}</td>
                        </tr>
                        <tr className="text-center">
                          <td className="border border-gray-400 px-4 py-2">Non-Recurring</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.nonRecurring}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.totalExp.nonRecurring}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.balance.nonRecurring}</td>
                        </tr>
                        <tr className="font-bold text-center bg-gray-50">
                          <td className="border border-gray-400 px-4 py-2">Total</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.total}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.totalExp.total}</td>
                          <td className="border border-gray-400 px-4 py-2">{seData.balance.total}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

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
                            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Save as PDF
                    </button>

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
                      Approve SE
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowApproveModal(false)}></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 mt-2">Confirm Approval</h3>
              <p className="text-gray-600 mt-1">
                Are you sure you want to approve this Statement of Expenditure?
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
                The Statement of Expenditure has been approved successfully.
              </p>
            </div>
          </div>
        </div>
      )}
      <SignatureModal />
    </div>
  );
};

export default ApproveSE;
