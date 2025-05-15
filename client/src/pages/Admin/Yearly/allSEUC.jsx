import { useState, useEffect, useContext } from "react";
import React from 'react';

import { AuthContext } from "../../Context/Authcontext";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminNavbar from "../../../components/AdminNavbar";
import TermsAndConditions from "../../uc/se/TermsAndConditions";
import { toast } from "react-toastify";

const url = import.meta.env.VITE_REACT_APP_URL;

const AllSEUC = () => {
    const { fetchInstituteOfficials } = useContext(AuthContext);
    const [activeSection, setActiveSection] = useState("allRequests");
    const [error, setError] = useState("");
    const [allUCs, setAllUCs] = useState([]);
    const [allSEs, setAllSEs] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [doc,setDoc]=useState({id:"",type:""});
    const [isCertificateOpen, setIsCertificateOpen] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const [isUCCertificateOpen, setIsUCCertificateOpen] = useState(false);
    const [ucData, setUCData] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const [piSignature, setPiSignature] = useState(null);
    const [instituteStamp, setInstituteStamp] = useState(null);
    const [authSignature, setAuthSignature] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [comment, setComment] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [filterInstitute, setFilterInstitute] = useState("");
    const [instituteOfficials, setInstituteOfficials] = useState({
        headOfInstitute: "Loading...",
        cfo: "Loading...",
        accountsOfficer: "Loading...",
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmationDetails, setConfirmationDetails] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [isSortFilterOpen, setIsSortFilterOpen] = useState(false);
    // Get current financial year
    const getCurrentFinancialYear = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        return currentMonth >= 3
            ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
            : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    };

    const currentFY = getCurrentFinancialYear();

    const fetchAllUCs = async () => {
        try {
            const response = await fetch(`${url}admin/all-ucforms?t=${Date.now()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });
            const data = await response.json();

            if (!data.success || !data.data || data.data.length === 0) {
                setError("No UCs found for admin approval");
                setAllUCs([]);
                return;
            }

            setAllUCs(data.data);
        } catch (error) {
            console.error("Error fetching all UCs:", error);
            setError("Internal Server Error");
        }
    };

    const fetchAllSEs = async () => {
        try {
            const response = await fetch(`${url}admin/all-seforms?t=${Date.now()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            if (!data.success || !data.data || data.data.length === 0) {
                setError("No SEs found for admin approval");
                setAllSEs([]);
                return;
            }

            setAllSEs(data.data);
        } catch (error) {
            console.error("Error fetching all SEs:", error);
            setError("Internal Server Error");
        }
    };

    useEffect(() => {
        fetchAllUCs();
        fetchAllSEs();
    }, [reloadKey]);

    useEffect(() => {
        // Group data by project ID and current year
        console.log(allSEs);
        console.log(allUCs);
        const groupData = () => {
            const projectMap = new Map();

            allUCs.forEach(uc => {
                const key = uc.projectId._id; // Use projectId as the key
                if (!projectMap.has(key)) {
                    projectMap.set(key, {
                        projectId: uc?.projectId._id,
                        currentYear: uc?.currentYear,
                        title: uc?.projectId.Title || null,
                        principalInvestigator: Array.isArray(uc?.projectId?.PI) ? uc?.projectId.PI.join(", ") : "N/A",
                        institute: uc?.ucData?.instituteName || "N/A",
                        ...(uc.type === "recurring"
                            ? { recurringuc: uc || [] }
                            : { nonrecurringuc: uc || [] }),
                        se: null
                    });
                } else {
                    // If a project already exists, update the UC
                    const existing = projectMap.get(key);
                    projectMap.set(key, {
                        ...existing,
                   ...(uc.type === "recurring"
                            ? { recurringuc: uc || [] }
                            : { nonrecurringuc: uc || [] }),                    });
                }
            });

            // Then process SEs
            allSEs.forEach(se => {
                const key = se.projectId._id; // Use projectId as the key
                if (!projectMap.has(key)) {
                    // SE without UC
                    projectMap.set(key, {
                        projectId: se.projectId._id,
                        currentYear: se.currentYear,
                        title: se?.projectId?.Title,
                        principalInvestigator: Array.isArray(se?.projectId?.PI) ? se.projectId.PI.join(", ") : "N/A",
                        institute: se.institute || "N/A",
                        recurringuc: null,
                        nonrecurringuc:null,
                        se: se
                    });
                } else {
                    // SE with existing UC or another SE
                    const existing = projectMap.get(key);
                    projectMap.set(key, {
                        ...existing,
                        se: se
                    });
                }
            });

            // Convert to array and sort
            const groupedArray = Array.from(projectMap.values()).sort((a, b) => {
                const dateA = a.uc?.submissionDate || a.se?.date;
                const dateB = b.uc?.submissionDate || b.se?.date;

                if (sortOrder === "asc") {
                    return new Date(dateA) - new Date(dateB);
                } else {
                    return new Date(dateB) - new Date(dateA);
                }
            });

            setGroupedData(groupedArray);
        };

        groupData();
        console.log(groupedData);
    }, [allUCs, allSEs, sortOrder]);
    const handleViewCertificate = async (certificate) => {
        try {
            const response = await fetch(`${url}admin/ucforms/view/${certificate._id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            if (!data.success) {
                toast.error("Failed to fetch certificate details.");
                return;
            }
            const authData = await fetchInstituteOfficials(data.data.ucData.instituteName);
            setInstituteOfficials(authData);
            setIsUCCertificateOpen(true);
            setPiSignature(data.data.piSignature);
            setInstituteStamp(data.data.instituteStamp);
            setAuthSignature(data.data.authSignature);
            setSelectedType(data.data?.type);
            setUCData(data.data.ucData);
        } catch (error) {
            console.error("Error fetching certificate details:", error);
            toast.error("Error fetching certificate details.");
        }
    };

    const handleViewSE = async (se) => {
        try {
            const response = await fetch(`${url}admin/view-by-se/${se._id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            if (!data.success) {
                toast.error("Failed to fetch SE details.");
                return;
            }
            const authData = await fetchInstituteOfficials(data.data.institute);
            setInstituteOfficials(authData);
            setCertificateData(data.data);
            setInstituteStamp(data.data.instituteStamp);
            setPiSignature(data.data.piSignature);
            setAuthSignature(data.data.authSignature);
            setIsCertificateOpen(true);
        } catch (error) {
            console.error("Error fetching SE details:", error);
            toast.error("Error fetching SE details.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setComment("");
    };

    const handleSubmitComment = async () => {
        if (!comment.trim()) {
            toast.error("Comment cannot be empty");
            return;
        }
        try {
            const endpoint = selectedCertificate?.type === "UC"
                ? "admin/add-comment"
                : "admin/add-se-comment";

            const response = await fetch(`${url}${endpoint}/${selectedCertificate._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
                body: JSON.stringify({ comment }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Comment added successfully!");
                closeModal();
                setReloadKey(prev => prev + 1);
            } else {
                toast.error("Failed to add comment.");
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            toast.error("Error submitting comment.");
        }
    };



    const handleAdminApproval = async (id, action, type) => {
        try {
            const endpoint = type === "UC" ? "uc/admin-approval" : "admin/se-admin-approval";
            const response = await fetch(`${url}${endpoint}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`${type} ${action}d successfully!`);
                setReloadKey((prevKey) => prevKey + 1);
            } else {
                toast.error(data.message || "Failed to process the request.");
            }
        } catch (error) {
            console.error(`Error during ${action} action:`, error);
            toast.error("An error occurred while processing the request.");
        }
    };
    const filteredData = groupedData.filter(item => {
        const matchesSearch = searchQuery
            ? item.projectId._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.institute?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.principalInvestigator?.toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        const matchesFilter = filterInstitute ? item.institute === filterInstitute : true;

        return matchesSearch && matchesFilter;
    });
    return (
        <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />
                <div className="space-y-4 mt-3">

                    <div key={reloadKey} className="mt-3 bg-white p-4 lg:p-7 rounded-lg shadow-md">
                        <h2 className="text-lg font-bold mb-4">UC/SE Forms</h2>

                        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
                            <div className="w-full lg:w-[70%]">
                                <input
                                    type="text"
                                    placeholder="Search by Project ID, Title, PI or Institute..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl text-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm"
                                />
                            </div>

                            <div className="flex flex-row gap-3 w-full lg:w-[30%]">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                                >
                                    <option value="asc">Date (A-Z)</option>
                                    <option value="desc">Date (Z-A)</option>
                                </select>

                                <select
                                    value={filterInstitute}
                                    onChange={(e) => setFilterInstitute(e.target.value)}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm min-w-[120px]"
                                >
                                    <option value="">All Institutes</option>
                                    {Array.from(new Set(groupedData.map(item => item.institute))).map(institute => (
                                        <option key={institute} value={institute}>{institute}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-4 text-left">Project ID</th>
                                        <th className="p-4 text-left">Project Title</th>
                                        <th className="p-4 text-left">Principal Investigator</th>
                                        <th className="p-4 text-left">Institute</th>
                                        <th className="p-4 text-left">Status</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, idx) => (
                                            <React.Fragment key={idx}>
                                                {item.recurringuc&& <tr className="border-b hover:bg-blue-50">
                                                    <td className="p-4">{item.projectId}</td>
                                                    <td className="p-4">{item.title}</td>
                                                    <td className="p-4">
                                                        {item.principalInvestigator}
                                                    </td>
                                                    <td className="p-4">{item.institute}</td>
                                                    <td className="p-4">
                                                        {item.recurringuc ? (
                                                            <span className="text-green-600">{`UC-Recurring Submitted`}</span>
                                                        ) : (
                                                            <span className="text-red-600">{item.recurringuc.status==="ApprovedByAdmin"?`UC Verified`:`UC Not Submitted`}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center mb-2">
                                                        {item.recurringuc ? (
                                                            <>

                                                                <button
                                                                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 mr-2 mb-2"
                                                                    onClick={() => handleViewCertificate(item.recurringuc)}
                                                                >
                                                                    View UC
                                                                </button>
                                                                <button
                                                                    className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 mr-2 "
                                                                    onClick={() => {setShowApproveModal(true);
                                                                        setDoc({id:item.recurringuc._id,type:"UC"});}
                                                                    }
                                                                >
                                                                    Approve
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">No Recurring UC available</span>
                                                        )}
                                                    </td>
                                                </tr>}
                                               {item.nonrecurringuc&& <tr className="border-b hover:bg-blue-50">
                                                    <td className="p-4">{item.projectId}</td>
                                                    <td className="p-4">{item.title}</td>
                                                    <td className="p-4">
                                                        {item.principalInvestigator}
                                                    </td>
                                                    <td className="p-4">{item.institute}</td>
                                                    <td className="p-4">
                                                        {item.nonrecurringuc ? (
                                                            <span className="text-green-600">{`UC-${item.nonrecurringuc.type} Submitted`}</span>
                                                        ) : (
                                                            <span className="text-red-600">{item.nonrecurringuc.status==="ApprovedByAdmin"?`UC Verified`:`UC Not Submitted`}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center mb-2">
                                                        {item.nonrecurringuc ? (
                                                            <>

                                                                <button
                                                                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 mr-2 mb-2"
                                                                    onClick={() => handleViewCertificate(item.nonrecurringuc)}
                                                                >
                                                                    View UC
                                                                </button>
                                                                <button
                                                                    className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 mr-2 "
                                                                    onClick={() => {setShowApproveModal(true);
                                                                        setDoc({id:item.nonrecurringuc._id,type:"UC"});}
                                                                    }
                                                                >
                                                                    Approve
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">No Non Recurring UC available</span>
                                                        )}
                                                    </td>
                                                </tr>}
                                               

                                                {/* SE Row */}
                                                {item.se&& <tr className="border-b hover:bg-blue-50 bg-gray-50">
                                                    <td className="p-4 pl-8">{item.projectId}</td>
                                                    <td className="p-4">{item.title}</td>
                                                    <td className="p-4">
                                                        {item.principalInvestigator}
                                                    </td>                                                    <td className="p-4">{item.institute}</td>
                                                    <td className="p-4">
                                                        {item.se ? (
                                                            <span className="text-green-600">SE Submitted</span>
                                                        ) : (
                                                            <span className="text-red-600">{item.se&&item.se.status==="ApprovedByAdmin"?`UC Verified`:`UC Not Submitted`}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center mb-2">
                                                        {item.se ? (
                                                            <>

                                                                <button
                                                                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 mr-2 mb-2"
                                                                    onClick={() => handleViewSE(item.se)}
                                                                >
                                                                    View SE
                                                                </button>
                                                                <button
                                                                    className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 mr-2"
 onClick={() => {setShowApproveModal(true);
                                                                        setDoc({id:item.se._id,type:"SE"});}
                                                                    }                                                                >
                                                                    Approve
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-500">No SE available</span>
                                                        )}
                                                    </td>
                                                </tr>}
                                               
                                                {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>
            <p className="mb-4">Are you sure you want to Approval?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={()=>{handleAdminApproval(doc.id, "approve", doc.type)}}
              >
Approve              </button>
            </div>
          </div>
        </div>
      )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="p-4 text-center" colSpan={7}>No matching records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>


            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add Comment</h2>
                        <textarea
                            className="w-full p-6 border rounded"
                            rows="4"
                            placeholder="Enter your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-4">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={handleSubmitComment}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Confirm Acceptance</h2>
                        <p className="mb-6">
                            Are you sure you want to accept this {confirmationDetails.type} form? This action cannot be undone.
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    handleAdminApproval(confirmationDetails.id, "approve", confirmationDetails.type);
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCertificateOpen && certificateData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto p-6">
                        <div className="text-center mb-6">
                            <p className="mt-3 text-2xl font-bold text-blue-800">
                                Request for Annual Installment with Up-to-Date Statement of Expenditure
                            </p>
                        </div>

                        <div id="se-details" className="bg-white rounded-lg p-6 border-t-4 border-blue-800">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">File Number</label>
                                <span className="px-3 py-1 w-full">: {certificateData.projectId}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                                <span className="px-3 py-1 w-full">: {certificateData.institute}</span>
                                <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                                <span className="px-3 py-1 w-full">: {certificateData.name}</span>
                                <label className="font-semibold text-gray-700">Name of the Scheme</label>
                                <span className="px-3 py-1 w-full">: {certificateData.scheme}</span>
                                <label className="font-semibold text-gray-700">Present Year of Project</label>
                                <span className="px-3 py-1 w-full">: {certificateData.currentYear}</span>
                                <label className="font-semibold text-gray-700">Total Project Cost </label>
                                <span className="px-3 py-1 w-full">: {certificateData.TotalCost}</span>
                            </div>

                            <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                            <ul className="list-disc pl-6 mb-6">
                                {certificateData.yearlyBudget && certificateData.yearlyBudget.map((sanct, index) => (
                                    <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                                        <span>Year {index + 1}: {sanct}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                                <h2 className="text-center text-2xl font-bold mb-4">STATEMENT OF EXPENDITURE</h2>
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
                                                const year1Value = certificateData.human_resources && head.key === "human_resources" ? certificateData.human_resources[0] || 0 :
                                                    certificateData[head.key] ? certificateData[head.key][0] || 0 : 0;
                                                const year2Value = certificateData.human_resources && head.key === "human_resources" ? certificateData.human_resources[1] || 0 :
                                                    certificateData[head.key] ? certificateData[head.key][1] || 0 : 0;
                                                const year3Value = certificateData.human_resources && head.key === "human_resources" ? certificateData.human_resources[2] || 0 :
                                                    certificateData[head.key] ? certificateData[head.key][2] || 0 : 0;

                                                const totalExpValue = certificateData.totalExp && certificateData.totalExp[head.key]
                                                    ? certificateData.totalExp[head.key]
                                                    : (year1Value + year2Value + year3Value);

                                                const sanctionedValue = certificateData.budgetSanctioned && certificateData.budgetSanctioned[head.key]
                                                    ? certificateData.budgetSanctioned[head.key]
                                                    : 0;

                                                const balance = sanctionedValue - totalExpValue;

                                                // Calculate fund requirement for next year
                                                let fundRequirement = 0;
                                                if (head.key === "overhead" && certificateData.budgetSanctioned && certificateData.budgetSanctioned.overhead) {
                                                    fundRequirement = certificateData.budgetSanctioned.overhead * 0.3;
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
                                                    {certificateData.budgetSanctioned && certificateData.budgetSanctioned.total ? certificateData.budgetSanctioned.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.total ? certificateData.total[0] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.total ? certificateData.total[1] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.total ? certificateData.total[2] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.totalExp && certificateData.totalExp.total ? certificateData.totalExp.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {((certificateData.budgetSanctioned && certificateData.budgetSanctioned.total) || 0) -
                                                        ((certificateData.totalExp && certificateData.totalExp.total) || 0)}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {(certificateData.budgetSanctioned && certificateData.budgetSanctioned.overhead ? certificateData.budgetSanctioned.overhead * 0.3 : 0).toFixed(0)}
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
                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-1">Principal Investigator Signature</h4>
                                        <p className="text-medium mb-2 text-gray-500">{certificateData.name}</p>
                                        <div className="border p-2 rounded mb-2">
                                            <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                        </div>
                                    </div>

                                    <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-1">Accounts Officer</h4>
                                        <p className="text-medium mb-2 text-gray-500">{certificateData.institute}</p>
                                        <div className="border p-2 rounded mb-2">
                                            <img src={authSignature} alt="Institute Stamp" className="h-24 object-contain" />
                                        </div>
                                    </div>

                                    <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-1">Institute Approval</h4>
                                        <p className="text-medium mb-2 text-gray-500">{certificateData.institute}</p>
                                        <div className="border p-2 rounded mb-2">
                                            <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4">Add Comment</h2>
                        <textarea
                            className="w-full p-6 border rounded"
                            rows="4"
                            placeholder="Enter your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-4 mr-2">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
                                onClick={() => { setSelectedCertificate(certificateData); handleSubmitComment(); }}
                            >
                                Add Comment
                            </button>
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                onClick={() => setIsCertificateOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isUCCertificateOpen && ucData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto p-6">


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
                        </div>

                        <TermsAndConditions />

                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium  mb-1">Principal Investigator Signature</h4>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature of PI : ...........................</p>
                                    <p className="font-medium">Name: {ucData.principalInvestigator[0]}</p>
                                </div>

                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium  mb-1">CFO Signature</h4>
                                    {/* <p className="text-medium mb-2 text-gray-500">Chief Finance Officer</p> */}
                                    <div className="border p-2 rounded mb-2">
                                        <img src={authSignature} alt="CFO Signature" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature ...............</p>
                                    <p className="font-medium">Name: {instituteOfficials.cfo}</p>
                                    <p className="font-medium">Chief Finance Officer</p>
                                    <p className="font-medium">(Head of Finance)</p>
                                </div>

                                <div className="border p-4 rounded-lg">

                                    <h4 className="font-medium  mb-1">Institute Approval</h4>
                                    {/* <p className="text-medium mb-2 text-gray-500">{ucData.instituteName}</p> */}
                                    <div className="border p-2 rounded mb-2">
                                        <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature.................</p>
                                    <p className="font-medium">Name: {instituteOfficials.headOfInstitute}</p>
                                    <p className="font-medium">Head of Organisation</p>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-4">Add Comment</h2>
                        <textarea
                            className="w-full p-6 border rounded"
                            rows="4"
                            placeholder="Enter your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-4 mr-2">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
                                onClick={() => { setSelectedCertificate(ucData); handleSubmitComment(); }}
                            >
                                Add Comment
                            </button>
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                onClick={() => setIsUCCertificateOpen(false)}
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

export default AllSEUC;