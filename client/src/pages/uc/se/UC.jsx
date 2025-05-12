import React, { useRef, useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/Authcontext";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SignatureCanvas from 'react-signature-canvas';
import TermsAndConditions from "./TermsAndConditions";

const url = import.meta.env.VITE_REACT_APP_URL;

const UCForm = () => {
  const { id: projectId } = useParams();
  const { fetchInstituteOfficials } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [ucData, setUCData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [piSignature, setPiSignature] = useState(null);
  const [sentForApproval, setSentForApproval] = useState(false);
  const [instituteApproved, setInstituteApproved] = useState(false);
  const [instituteStamp, setInstituteStamp] = useState(null);
  const [authSignature, setauthSignature] = useState(null);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [sentToAdmin, setSentToAdmin] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);
  const [adminRejected, setAdminRejected] = useState(false);
  const [ucRequestId, setUcRequestId] = useState(null);
  const [instituteOfficials, setInstituteOfficials] = useState({
    headOfInstitute: "Loading...",
    cfo: "Loading...",
    accountsOfficer: "Loading...",
  });

  const sigCanvas = useRef(null);
  const fileInputRef = useRef(null);

  // Cache for approval status to avoid redundant fetches
  const statusCache = useRef({});

  // Memoized fetch status function to prevent unnecessary re-creation
  const fetchStatus = useCallback(async (projectId, type) => {
    if (!projectId || !type) return;

    // Check if we already have this status in cache
    const cacheKey = `${projectId}-${type}`;
    if (statusCache.current[cacheKey]) {
      const cachedData = statusCache.current[cacheKey];
      // Update all states at once to avoid multiple re-renders
      setPiSignature(cachedData.piSignature);
      setInstituteStamp(cachedData.instituteStamp);
      setauthSignature(cachedData.authSignature);
      setUcRequestId(cachedData.ucRequestId);
      setSentForApproval(cachedData.sentForApproval);
      setInstituteApproved(cachedData.instituteApproved);
      setSentToAdmin(cachedData.sentToAdmin);
      setAdminApproved(cachedData.adminApproved);
      setAdminRejected(cachedData.adminRejected);
      setInstituteOfficials(cachedData.instituteOfficials);
      return;
    }

    setStatusLoading(true);
    try {
      const res = await fetch(`${url}uc/latest?projectId=${projectId}&type=${type}`);
      const data = await res.json();

      let newStatus = {
        piSignature: null,
        instituteStamp: null,
        authSignature: null,
        ucRequestId: null,
        sentForApproval: false,
        instituteApproved: false,
        sentToAdmin: false,
        adminApproved: false,
        adminRejected: false,
        instituteOfficials: {
          headOfInstitute: "Loading...",
          cfo: "Loading...",
          accountsOfficer: "Loading...",
        }
      };

      if (data.success && data.data) {
        const uc = data.data;
        const authData = await fetchInstituteOfficials(uc.ucData.instituteName);

        newStatus = {
          piSignature: uc.piSignature,
          instituteStamp: uc.instituteStamp,
          authSignature: uc.authSignature,
          ucRequestId: uc._id,
          sentForApproval: true,
          instituteApproved: ['approvedByInst', 'pendingAdminApproval', 'approvedByAdmin', 'rejectedByAdmin'].includes(uc.status),
          sentToAdmin: ['pendingAdminApproval', 'approvedByAdmin', 'rejectedByAdmin'].includes(uc.status),
          adminApproved: uc.status === 'approvedByAdmin',
          adminRejected: uc.status === 'rejectedByAdmin',
          instituteOfficials: authData
        };
      }

      // Update cache
      statusCache.current[cacheKey] = newStatus;

      // Batch update all states at once
      setPiSignature(newStatus.piSignature);
      setInstituteStamp(newStatus.instituteStamp);
      setauthSignature(newStatus.authSignature);
      setUcRequestId(newStatus.ucRequestId);
      setSentForApproval(newStatus.sentForApproval);
      setInstituteApproved(newStatus.instituteApproved);
      setSentToAdmin(newStatus.sentToAdmin);
      setAdminApproved(newStatus.adminApproved);
      setAdminRejected(newStatus.adminRejected);
      setInstituteOfficials(newStatus.instituteOfficials);
    } catch (err) {
      console.error("Error fetching approval status:", err);
    } finally {
      setStatusLoading(false);
    }
  }, [fetchInstituteOfficials]);

  // When type changes, immediately reset states for a smooth transition
  const handleSelection = (type) => {
    // First set up the new type
    setSelectedType(type);

    // Reset banner states for immediate visual feedback
    resetApprovalStates();

    // Then fetch data
    fetchUCData(type);

    // Then fetch status (with a slight delay to allow the UI to update)
    setTimeout(() => {
      fetchStatus(projectId, type);
    }, 100);
  };

  // Reset approval states function for clean transitions
  const resetApprovalStates = () => {
    setSentForApproval(false);
    setInstituteApproved(false);
    setInstituteStamp(null);
    setauthSignature(null);
    setSentToAdmin(false);
    setAdminApproved(false);
    setAdminRejected(false);
    setUcRequestId(null);
    setPiSignature(null);
  };

  // Initial load of approval status when component mounts
  useEffect(() => {
    if (projectId && selectedType) {
      fetchStatus(projectId, selectedType);
    }
  }, [projectId, selectedType, fetchStatus]);

  // Polling for approval status
  useEffect(() => {
    let checkApprovalInterval;

    if (sentForApproval && !instituteApproved) {
      checkApprovalInterval = setInterval(async () => {
        try {
          const res = await fetch(`${url}uc/approved?projectId=${projectId}&type=${selectedType}`);
          const data = await res.json();

          if (data.success && data.data) {
            // Update cache with new approval data
            const cacheKey = `${projectId}-${selectedType}`;
            if (statusCache.current[cacheKey]) {
              statusCache.current[cacheKey] = {
                ...statusCache.current[cacheKey],
                instituteApproved: true,
                instituteStamp: data.data.instituteStamp
              };
            }

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

  // Memoize the fetchUCData function to avoid recreating it on each render
  const fetchUCData = useCallback(async (type) => {
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

      // Do this asynchronously to not block the UI
      fetchInstituteOfficials(result.data.instituteName)
        .then(authData => {
          setInstituteOfficials(authData);
        })
        .catch(err => {
          console.error("Error fetching institute officials:", err);
        });

    } catch (err) {
      console.error(`Error fetching ${type} UC data:`, err.message);
      setError(`Failed to fetch ${type} UC data`);
    } finally {
      setLoading(false);
    }
  }, [projectId, fetchInstituteOfficials]);

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

      if (!result.success) {
        setError(result.message || "Failed to send for approval");
        return;
      }

      // Update cache with new approval data
      const cacheKey = `${projectId}-${selectedType}`;
      if (statusCache.current[cacheKey]) {
        statusCache.current[cacheKey] = {
          ...statusCache.current[cacheKey],
          sentForApproval: true,
          ucRequestId: result.ucId
        };
      }

      setUcRequestId(result.ucId);
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

  const handleSignatureEnd = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureDataUrl = sigCanvas.current.toDataURL();
      setPiSignature(signatureDataUrl);

      // Update cache with new signature
      const cacheKey = `${projectId}-${selectedType}`;
      if (statusCache.current[cacheKey]) {
        statusCache.current[cacheKey] = {
          ...statusCache.current[cacheKey],
          piSignature: signatureDataUrl
        };
      }
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setPiSignature(null);

      // Update cache to clear signature
      const cacheKey = `${projectId}-${selectedType}`;
      if (statusCache.current[cacheKey]) {
        statusCache.current[cacheKey] = {
          ...statusCache.current[cacheKey],
          piSignature: null
        };
      }
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureDataUrl = sigCanvas.current.toDataURL();
      setPiSignature(signatureDataUrl);

      // Update cache with new signature
      const cacheKey = `${projectId}-${selectedType}`;
      if (statusCache.current[cacheKey]) {
        statusCache.current[cacheKey] = {
          ...statusCache.current[cacheKey],
          piSignature: signatureDataUrl
        };
      }

      setShowSignatureModal(false);
    } else {
      setError("Please provide a signature before saving");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload only image files (PNG, JPG, JPEG)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const signatureDataUrl = event.target.result;
        setPiSignature(signatureDataUrl);

        // Update cache with new signature
        const cacheKey = `${projectId}-${selectedType}`;
        if (statusCache.current[cacheKey]) {
          statusCache.current[cacheKey] = {
            ...statusCache.current[cacheKey],
            piSignature: signatureDataUrl
          };
        }

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

      // Update cache with new admin status
      const cacheKey = `${projectId}-${selectedType}`;
      if (statusCache.current[cacheKey]) {
        statusCache.current[cacheKey] = {
          ...statusCache.current[cacheKey],
          sentToAdmin: true
        };
      }

      alert("UC sent to admin for approval");
      setSentToAdmin(true);
    } catch (err) {
      console.error("Error sending UC to admin:", err.message);
      setError("Failed to send UC to admin");
    }
  };

  const handleSaveAsPDF = () => {
    // PDF generation code remains the same
    const pdf = new jsPDF("p", "mm", "a4");
    const currentDate = new Date().toLocaleDateString("en-IN");

    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("GFR 12-A", pageWidth / 2, 20, { align: "center" });
    // Rest of the PDF generation code...
    pdf.save(`UC_${ucData.title}_${selectedType}${instituteApproved ? "_Approved" : ""}.pdf`);
  };

  const ApprovalStatusBanner = () => {
    // Show loading indicator while fetching status
    if (statusLoading) {
      return (
        <div className="rounded-lg p-4 mb-6 bg-gray-100">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium text-gray-800">Loading approval status...</span>
          </div>
        </div>
      );
    }

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

    if (sentForApproval && !instituteApproved) {
      return (
        <div className="rounded-lg p-4 mb-6 bg-yellow-100">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-500 mr-2"
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
            <span className="font-medium text-yellow-800">
              Pending Institute Approval
            </span>
          </div>
        </div>
      );
    }

    if (instituteApproved && sentToAdmin && !adminApproved && !adminRejected) {
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

    if (instituteApproved && !sentToAdmin) {
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
              Approved by Institute on {new Date().toLocaleDateString()}.
            </span>
          </div>
        </div>
      );
    }

    if (adminRejected) {
      return (
        <div className="rounded-lg p-4 mb-6 bg-red-100">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-2"
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
            <span className="font-medium text-red-800">
              Rejected by Admin on {new Date().toLocaleDateString()}.
            </span>
          </div>
        </div>
      );
    }

    if (adminApproved) {
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
              Approved by Admin on {new Date().toLocaleDateString()}.
            </span>
          </div>
        </div>
      );
    }

    return null;
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
                onEnd={handleSignatureEnd}
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
                  </div>

                  <h3 className="text-lg font-semibold text-blue-700 mb-4">
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

                    {/* <label className="font-semibold text-gray-700">Start Date of Year:</label>
                    <span className="px-3 py-1 w-full">: {ucData.startDate}</span>

                    <label className="font-semibold text-gray-700">End Date of Year:</label>
                    <span className="px-3 py-1 w-full">: {ucData.endDate}</span> */}
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
                  <h3 className="text-lg font-semibold text-blue-700 mb-4">Financial Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead>
                        <tr className="bg-blue-100 text-gray-700">
                          <th className="border border-gray-400 px-4 py-2">Unspent Balances of Grants received years (figure as at Sl. No. 7 (iii))</th>
                          <th className="border border-gray-400 px-4 py-2">Interest Earned thereon</th>
                          <th className="border border-gray-400 px-4 py-2">Interest deposited back to Funding Agency</th>
                          <th className="border border-gray-400 px-4 py-2" colSpan="3">Grant received during the year</th>
                          <th className="border border-gray-400 px-4 py-2">Total (1+2 - 3+4)</th>
                          <th className="border border-gray-400 px-4 py-2">Expenditure incurred</th>
                          <th className="border border-gray-400 px-4 py-2">Closing Balances (5 - 6)</th>
                        </tr>
                        <tr className="bg-blue-50 text-gray-700">
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
                      <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-4">
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
                    <h3 className="text-lg font-semibold text-blue-700 mb-4">
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
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-4 w-1/3">
                              <div className="h-24 mb-4">
                                {piSignature ? (
                                  <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                ) : (
                                  <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24">
                                    <p className="text-gray-500">No signature added</p>
                                  </div>
                                )}
                              </div>
                              <p className="font-medium">Signature of PI : ...........................</p>
                              <p className="font-medium">Name: {ucData.principalInvestigator[0]}</p>
                              {!sentForApproval && (
                                <button
                                  onClick={() => setShowSignatureModal(true)}
                                  className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={instituteApproved}
                                >
                                  {piSignature ? "Change Signature" : "Add Signature"}
                                </button>
                              )}
                            </td>

                            <td className="border border-gray-300 p-4 w-1/3">
                              <div className="h-24 mb-4">
                                {instituteApproved && authSignature ? (
                                  <img src={authSignature} alt="CFO Signature" className="h-24 object-contain" />
                                ) : (
                                  <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24">
                                    <p className="text-gray-500">
                                      {sentForApproval ? "Awaiting approval" : "Not sent for approval yet"}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">Signature ...............</p>
                                <p className="font-medium">Name: {instituteOfficials.cfo}</p>
                                <p className="font-medium">Chief Finance Officer</p>
                                <p className="font-medium">(Head of Finance)</p>
                              </div>
                            </td>

                            <td className="border border-gray-300 p-4 w-1/3">
                              <div className="h-24 mb-4">
                                {instituteApproved && instituteStamp ? (
                                  <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                ) : (
                                  <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24">
                                    <p className="text-gray-500">
                                      {sentForApproval ? "Awaiting approval" : "Not sent for approval yet"}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">Signature.................</p>
                                <p className="font-medium">Name: {instituteOfficials.headOfInstitute}</p>
                                <p className="font-medium">Head of Organisation</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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

                    {instituteApproved && !adminApproved && !sentToAdmin && ucRequestId && (
                      <button
                        onClick={sendToAdmin}
                        className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center ${piSignature
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
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
