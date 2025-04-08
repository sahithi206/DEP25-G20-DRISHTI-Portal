import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HomeNavbar from "../../utils/HomeNavbar";
import Sidebar from "../../utils/Sidebar";
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from "jspdf";
import "jspdf-autotable";

const ApproveUC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStampModal, setShowStampModal] = useState(false);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  
  const stampCanvas = useRef(null);

  // Fetch pending requests from localStorage on component mount
  useEffect(() => {
    const storedPendingRequests = localStorage.getItem('pendingUCRequests');
    if (storedPendingRequests) {
      const requests = JSON.parse(storedPendingRequests);
      setPendingRequests(requests);
    }
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
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
      setShowApproveModal(true);
    } else {
      alert("Please provide a stamp before saving");
    }
  };

  const handleApprove = () => {
    if (!selectedRequest || !instituteStamp) return;

    try {
      // Create approved request object
      const approvedRequest = {
        ...selectedRequest,
        instituteStamp: instituteStamp,
        approvalDate: new Date().toISOString(),
        status: "approved"
      };

      // Get existing approved requests from local storage
      const storedApprovedRequests = localStorage.getItem('approvedUCRequests');
      const approvedRequests = storedApprovedRequests ? JSON.parse(storedApprovedRequests) : [];
      
      // Add the new approved request
      approvedRequests.push(approvedRequest);
      
      // Save back to local storage
      localStorage.setItem('approvedUCRequests', JSON.stringify(approvedRequests));
      
      // Remove from pending requests
      const updatedPendingRequests = pendingRequests.filter(req => req.id !== selectedRequest.id);
      setPendingRequests(updatedPendingRequests);
      localStorage.setItem('pendingUCRequests', JSON.stringify(updatedPendingRequests));
      
      // Show success message
      setShowApproveModal(false);
      setShowSuccessModal(true);
      
      // Reset selected request after short delay
      setTimeout(() => {
        setSelectedRequest(null);
        setInstituteStamp(null);
        setShowSuccessModal(false);
      }, 2000);
    } catch (err) {
      console.error("Error approving request:", err.message);
      alert("Failed to approve request");
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedRequest) return;

    const ucData = selectedRequest.ucData;
    const certificateType = selectedRequest.type;
    
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
    pdf.text(`${certificateType === "recurring" ? "Recurring" : "Non - Recurring"}`, pageWidth / 2, 38, { align: "center" });
    pdf.text(`as on ${currentDate} to be submitted to SERB`, pageWidth / 2, 44, { align: "center" });

    // Main Information Section
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const items = [
      { label: "Name of the grant receiving Organization", value: ucData.instituteName },
      { label: "Name of Principal Investigator (PI)", value: ucData.principalInvestigator },
      { label: "SERB Sanction order no. & date", value: "ECR20XXXXXXXX Dated DD-MM-YYYY" },
      { label: "Title of the Project", value: ucData.title },
      { label: "Name of the SERB Scheme", value: ucData.scheme },
      { label: "Whether recurring or non-recurring grants", value: certificateType === "recurring" ? "Recurring" : "Non Recurring" }
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

    // Add signatures if available
    yPos = 150;
    
    if (selectedRequest.piSignature) {
      pdf.text("PI Signature:", margin, yPos);
      pdf.addImage(selectedRequest.piSignature, 'PNG', margin, yPos + 5, 50, 20);
      yPos += 30;
    }
    
    if (instituteStamp) {
      pdf.text("Institute Stamp & Signature:", margin, yPos);
      pdf.addImage(instituteStamp, 'PNG', margin, yPos + 5, 50, 20);
    }

    pdf.save(`UC_${ucData.title}_${certificateType}_Approved.pdf`);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div
        className={`flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"
        }`}
      >
        <HomeNavbar isSidebarOpen={isSidebarOpen} path="/admin-dashboard" />

        <div className="p-6 space-y-6 mt-16">
          <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
            <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
            <p className="mt-3 text-2xl font-bold text-blue-800">Approve Utilization Certificates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="col-span-1 bg-white rounded-lg shadow-md p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Requests</h2>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No pending approval requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`border p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedRequest?.id === request.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      }`}
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

            <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
              {selectedRequest ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Request Details</h2>
                    <div className="space-x-2">
                      <button
                        onClick={handleAddStamp}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Institute Stamp
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Preview PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-700">Project Details</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex">
                          <span className="font-medium w-32">Project ID:</span>
                          <span>{selectedRequest.projectId}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-32">UC Type:</span>
                          <span>{selectedRequest.type === "recurring" ? "Recurring" : "Non-Recurring"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-32">Title:</span>
                          <span>{selectedRequest.ucData.title}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-32">PI:</span>
                          <span>{selectedRequest.ucData.principalInvestigator}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-32">Scheme:</span>
                          <span>{selectedRequest.ucData.scheme}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700">Financial Details</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex">
                          <span className="font-medium w-32">Carry Forward:</span>
                          <span>₹ {selectedRequest.ucData.CarryForward}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-32">Expenditure:</span>
                          <span>₹ {selectedRequest.ucData.recurringExp}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium w-32">Balance:</span>
                          <span>₹ {selectedRequest.ucData.CarryForward - selectedRequest.ucData.recurringExp}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Signatures & Approval</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-medium mb-2">PI Signature:</p>
                        {selectedRequest.piSignature ? (
                          <div className="border border-gray-200 rounded-md p-2 h-32 flex items-center justify-center">
                            <img 
                              src={selectedRequest.piSignature} 
                              alt="PI Signature" 
                              className="max-h-28"
                            />
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-md p-4 h-32 flex items-center justify-center bg-gray-50">
                            <p className="text-gray-500">No signature provided</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">Institute Stamp:</p>
                        {instituteStamp ? (
                          <div className="border border-gray-200 rounded-md p-2 h-32 flex items-center justify-center">
                            <img 
                              src={instituteStamp} 
                              alt="Institute Stamp" 
                              className="max-h-28"
                            />
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-md p-4 h-32 flex items-center justify-center bg-gray-50">
                            <p className="text-gray-500">Institute stamp required for approval</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {instituteStamp && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setShowApproveModal(true)}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Approve UC
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No Request Selected</h3>
                  <p className="text-gray-500">
                    Select a request from the list to view details and approve
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                Confirm Approval
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
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Success!</h3>
            <p className="text-center text-gray-600">
              The Utilization Certificate has been approved successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveUC;