import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const url = import.meta.env.VITE_REACT_APP_URL;

const ViewDocs = () => {
    const [activeSection, setActiveSection] = useState("ongoing");
    const [error, setError] = useState("");
    const [pendingUCs, setPendingUCs] = useState([]);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCertificateOpen, setIsCertificateOpen] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [comment, setComment] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();

    const fetchPendingUCs = async () => {
        try {
            const response = await fetch(`${url}admin/ucforms/${id}?t=${Date.now()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });
    
            const data = await response.json();
    
            console.log("Fetched Pending UCs:", data);
    
            if (!data.success || !data.data || data.data.length === 0) {
                setError(data.msg || "No pending UCs found for admin approval");
                setPendingUCs([]);
                return;
            }
    
            setPendingUCs(data.data);
        } catch (error) {
            console.error("Error fetching pending UCs:", error);
            setError("Internal Server Error");
        }
    };

    useEffect(() => {


        fetchPendingUCs();
    }, [id]);

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
                alert("Failed to fetch certificate details.");
                return;
            }

            setCertificateData(data.data);
            setIsCertificateOpen(true);
        } catch (error) {
            console.error("Error fetching certificate details:", error);
            alert("Error fetching certificate details.");
        }
    };

    const openCommentModal = (certificate) => {
        setSelectedCertificate(certificate);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setComment("");
    };

    const closeCertificateModal = () => {
        setIsCertificateOpen(false);
        setCertificateData(null);
    };

    const handleSubmitComment = async () => {
        if (!comment.trim()) {
            alert("Comment cannot be empty");
            return;
        }
        try {
            const response = await fetch(`${url}admin/add-comment/${selectedCertificate._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
                body: JSON.stringify({ comment, certificate: selectedCertificate }),
            });

            const data = await response.json();
            if (data.success) {
                alert("Comment added successfully!");
                closeModal();
            } else {
                alert("Failed to add comment.");
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert("Error submitting comment.");
        }
    };

    const handleAdminApproval = async (id, action) => {
        try {
            const response = await fetch(`${url}uc/admin-approval/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            console.log("Admin Approval Response:", data); 

            if (data.success) {
                alert(`UC ${action}d successfully!`);
                fetchPendingUCs(); 
                setReloadKey((prevKey) => prevKey + 1); 
            } else {
                alert(data.message || "Failed to process the request.");
            }
        } catch (error) {
            console.error(`Error during ${action} action:`, error);
            alert("An error occurred while processing the request.");
        }
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />
                <div className="p-6 space-y-1 mt-3">
                    <div key={reloadKey} className="mt-3 bg-white p-7 rounded-lg shadow-md">
                        <table className="w-full border table-fixed">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-4 text-left w-1/4">Certificate ID</th>
                                    <th className="p-4 text-left w-1/4">Type</th>
                                    <th className="p-4 text-left w-1/4">Submission Date</th>
                                    <th className="p-4 text-center w-1/4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingUCs.length > 0 ? (
                                    pendingUCs.map((certificate) => (
                                        <tr key={certificate._id} className="border-b hover:bg-blue-50">
                                            <td
                                                className="p-4 w-1/4 cursor-pointer text-gray-500 hover:underline"
                                                onClick={() => handleViewCertificate(certificate)}
                                            >
                                                {certificate._id}
                                            </td>
                                            <td className="p-4 w-1/4">{certificate.type}</td>
                                            <td className="p-4 w-1/4">
                                                {new Date(certificate.submissionDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 w-1/4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                        onClick={() => openCommentModal(certificate)}
                                                    >
                                                        Add Comments
                                                    </button>
                                                    <button
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                        onClick={() => handleViewCertificate(certificate)}
                                                    >
                                                        View Certificate
                                                    </button>
                                                    <button
                                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                        onClick={() => handleAdminApproval(certificate._id, "approve")}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                        onClick={() => handleAdminApproval(certificate._id, "reject")}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-500">
                                            No Pending Certificates Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="w-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
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
            {isCertificateOpen && certificateData && (
                <div className="w-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold">GFR 12-A</h3>
                            <p className="text-sm font-medium">[See Rule 238 (1)]</p>
                            <h2 className="text-xl font-bold mt-2">
                                FINAL UTILIZATION CERTIFICATE FOR THE YEAR {certificateData.ucData.currentYear} in respect of
                            </h2>
                            <p className="text-lg font-semibold">
                                {certificateData.type === "recurring" ? "Recurring" : "Non-Recurring"}
                            </p>
                            <p className="text-sm font-medium mt-1">
                                as on {new Date(certificateData.submissionDate).toLocaleDateString()} to be submitted to Funding Agency
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-700 mb-4">
                            {certificateData.type === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Title of the Project:</label>
                            <span className="px-3 py-1 w-full">: {certificateData.ucData.title}</span>

                            <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                            <span className="px-3 py-1 w-full">: {certificateData.ucData.scheme}</span>

                            <label className="font-semibold text-gray-700">Name of the Grant Receiving Organisation:</label>
                            <span className="px-3 py-1 w-full">: {certificateData.ucData.instituteName}</span>

                            <label className="font-semibold text-gray-700">Name of the Principal Investigator:</label>
                            <span className="px-3 py-1 w-full">: {certificateData.ucData.principalInvestigator}</span>

                            <label className="font-semibold text-gray-700">Present Year of Project:</label>
                            <span className="px-3 py-1 w-full">: {certificateData.ucData.currentYear}</span>

                            <label className="font-semibold text-gray-700">Start Date of Year:</label>
                            <span className="px-3 py-1 w-full">: {new Date(certificateData.ucData.startDate).toLocaleDateString()}</span>

                            <label className="font-semibold text-gray-700">End Date of Year:</label>
                            <span className="px-3 py-1 w-full">: {new Date(certificateData.ucData.endDate).toLocaleDateString()}</span>
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
                                        <td className="border border-gray-400 px-4 py-2">Rs {certificateData.ucData.CarryForward}</td>
                                        <td className="border border-gray-400 px-4 py-2">Rs {certificateData.ucData.yearTotal}</td>
                                        <td className="border border-gray-400 px-4 py-2">Rs {certificateData.ucData.total}</td>
                                        <td className="border border-gray-400 px-4 py-2">Rs {certificateData.ucData.recurringExp}</td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            Rs {certificateData.ucData.total - certificateData.ucData.recurringExp}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {certificateData.type === "recurring" && (
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
                                                <td className="border border-gray-400 px-4 py-2">Rs {certificateData.ucData.human_resources}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td className="border border-gray-400 px-4 py-2">Consumables</td>
                                                <td className="border border-gray-400 px-4 py-2">Rs {certificateData.ucData.consumables}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td className="border border-gray-400 px-4 py-2">Others</td>
                                                <td className="border border-gray-400 px-4 py-2">Rs {certificateData.ucData.others}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                onClick={closeCertificateModal}
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

export default ViewDocs;