import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import BudgetAllocationForm from './BudgetAllocationForm';

const AdminProposalReview = () => {
    const [activeSection, setActiveSection] = useState("approvals");
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showFullDetails, setShowFullDetails] = useState(false);
    const URL = import.meta.env.VITE_REACT_APP_URL;

    const [searchQuery, setSearchQuery] = useState("");
    const [filterByInstitute, setFilterByInstitute] = useState("");
    const [filterByPI, setFilterByPI] = useState("");

    useEffect(() => {
        if (selectedProposal) {
            console.log("Selected Proposal Data:", selectedProposal);
            console.log("PI Details:", selectedProposal.piInfo);
            console.log("Budget Summary:", selectedProposal.totalBudget);
            console.log("Bank Details:", selectedProposal.bankInfo);
        }
    }, [selectedProposal]);

    useEffect(() => {
        const fetchPendingProposals = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to view proposals.");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${URL}form/pendingProposals`, {
                    method: "GET",
                    headers: { "accessToken": token },
                });
                const data = await response.json();
                console.log("Data:", data);
                setProposals(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPendingProposals();
    }, []);

    const handleApproval = async (proposalId, status) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated");

            console.log("Handling proposal:", proposalId, "with status:", status);

            const response = await fetch(`${URL}form/update-proposals/${proposalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify({
                    status,
                    comment: comment.trim() ? comment : `Proposal ${status.toLowerCase()} by admin.`
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update proposal status");
            }

            const responseData = await response.json();
            console.log("Response data:", responseData);

            setProposals(proposals.filter(proposal => proposal.proposal._id !== proposalId));
            setSelectedProposal(null);
            setComment("");
            setSuccessMessage(`Proposal ${status} successfully`);
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error in handleApproval:", err);
            setError(err.message);
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleBudgetSubmit = async (budgetData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated");

            console.log("Budget data to submit:", budgetData);

            // Validate that all required budget fields are provided
            if (
                !budgetData.TotalCost ||
                !budgetData.budgetTotal ||
                !budgetData.budgetSanctioned ||
                !budgetData.budgetTotal.total ||
                !budgetData.budgetSanctioned.yearTotal
            ) {
                throw new Error("All budget details must be provided!");
            }

            const finalComment = comment?.trim() ? comment : "Proposal approved. Budget Allocation Pending.";

            const approvalResponse = await fetch(`${URL}form/update-proposals/${budgetData.proposalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify({
                    status: "Approved",
                    comment: finalComment
                }),
            });

            const approvalResult = await approvalResponse.json();
            console.log("Approval Response:", approvalResult);

            if (!approvalResponse.ok) {
                throw new Error(approvalResult.msg || "Failed to approve proposal");
            }

            setProposals(proposals.filter(proposal => proposal.proposal._id !== budgetData.proposalId));
            setSelectedProposal(null);
            setComment("");
            setShowBudgetForm(false);
            setSuccessMessage("Proposal approved and budget allocated successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error("Error in handleBudgetSubmit:", err);
            setError(err.message);
            setTimeout(() => setError(""), 3000);
        }
    };

    const requestRevision = async (proposalId) => {
        if (!comment.trim()) {
            setError("Please add a comment detailing the required revisions");
            setTimeout(() => setError(""), 3000);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated");

            const response = await fetch(`${URL}form/update-proposals/${proposalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify({
                    status: "Needs Revision",
                    comment
                }),
            });

            if (!response.ok) throw new Error("Failed to request revision");

            setProposals(proposals.filter(proposal => proposal.proposal._id !== proposalId));
            setSelectedProposal(null);
            setComment("");
            setSuccessMessage("Revision requested successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(""), 3000);
        }
    };

    const submitComment = async (proposalId) => {
        if (!comment.trim()) {
            setError("Please add a comment before submitting");
            setTimeout(() => setError(""), 3000);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated");

            const response = await fetch(`${URL}form/proposals/${proposalId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify({ text: comment }),
            });

            if (!response.ok) throw new Error("Failed to submit comment");

            const data = await response.json();

            const updatedProposals = proposals.map(p => {
                if (p.proposal._id === proposalId) {
                    return {
                        ...p,
                        proposal: {
                            ...p.proposal,
                            comments: [...(p.proposal.comments || []), { text: comment }]
                        }
                    };
                }
                return p;
            });

            setProposals(updatedProposals);
            setComment("");
            setSuccessMessage("Comment added successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(""), 3000);
        }
    };
    const [schemes, setSchemes] = useState([]);
    useEffect(() => {
        const getSchemes = async () => {
            try {
                const res = await fetch(`${URL}schemes/get-allschemes`, {
                    headers: {
                        "Content-Type": "application/json",
                        accessToken: localStorage.getItem("token")
                    }
                })
                const data = await res.json();
                console.log(data);
                setSchemes(data);
            } catch (e) {
                console.log(e);
            }
        }
        getSchemes();
    }, [URL])

    const [schemeFilter, setFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchTitle, setSearchTitle] = useState("");
    const [filteredAndSortedProposals, setFilteredUc] = useState([]);
    useEffect(() => {
        const filteredProjects = async () => {
            let filtered = proposals;

            if (searchTitle) {
                const searchTerm = searchTitle.toLowerCase();
                filtered = filtered.filter((project) => {
                    if (project?.generalInfo?.instituteName?.toLowerCase().includes(searchTerm)) return true;
                    if (project?.piInfo?.piList?.some(member => member.name.toLowerCase().includes(searchTerm))) return true;
                    if (project?.proposal?.Scheme?.name.toLowerCase().includes(searchTerm)) return true;

                    return false;
                });
            }

            if (schemeFilter) {
                filtered = filtered.filter(project => project.proposal.Scheme.name === schemeFilter);
            }

            if (sortOrder) {
                filtered = filtered.sort((a, b) => {
                    const dateA = new Date(a.proposal.date);
                    const dateB = new Date(b.proposal.date);
                    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                });
            }

            setFilteredUc(filtered);
        };

        filteredProjects();
    }, [searchTitle, sortOrder, proposals, schemeFilter]);



    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection}  yes={1}/>
                {/* Success/Error messages */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                        {error}
                    </div>
                )}

                <div className="mt-6 bg-white p-6 rounded-lg shadow-md w-full">
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
                        <select
                            value={schemeFilter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All</option>
                            {schemes && schemes.length > 0 && schemes.map((val, index) => (
                                <option value={val.name} key={val._id}>{val.name}</option>
                            ))}

                        </select>
                    </div>
                    {loading ? (
                        <p>Loading proposals...</p>
                    ) : proposals.length === 0 ? (
                        <p>No pending proposals.</p>
                    ) : (
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 text-left">Title</th>
                                    <th className="p-2 text-left">Proposal ID</th>
                                    <th className="p-2 text-left">Institute</th>
                                    <th className="p-2 text-left">PIs</th>
                                    <th className="p-2 text-left">Submission Date</th>
                                    <th className="p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedProposals.map(proposal => (
                                    <tr key={proposal.proposal._id} className="border-b">
                                        <td className="p-2">{proposal.researchDetails?.Title}</td>
                                        <td className="p-2">{proposal.proposal._id}</td>
                                        <td className="p-2">{proposal.generalInfo?.instituteName}</td>
                                        <td className="p-2">
                                            {(proposal.piInfo?.members && proposal.piInfo.members.length > 0)
                                                ? proposal.piInfo.members.map((member) => member.name || "N/A").join(", ")
                                                : "N/A"}
                                        </td>

                                        <td className="p-2">
                                            {proposal.proposal.date
                                                ? new Date(proposal.proposal.date).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => setSelectedProposal(proposal)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {selectedProposal && !showFullDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-semibold">Proposal Details</h2>
                            <div className="mt-4 space-y-2">
                                <p><strong>Title:</strong> {selectedProposal.researchDetails?.Title}</p>
                                <p><strong>Institute:</strong> {selectedProposal.generalInfo?.instituteName}</p>
                                <p><strong>Description:</strong> {selectedProposal.researchDetails?.Summary}</p>

                                {/* Display existing comments */}
                                {selectedProposal.proposal.comments && selectedProposal.proposal.comments.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="font-medium">Previous Comments:</h3>
                                        <div className="mt-2 bg-gray-50 p-3 rounded">
                                            {selectedProposal.proposal.comments.map((comment, idx) => (
                                                <div key={idx} className="border-b pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                                                    <p>{comment.text}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <label htmlFor="comment" className="block font-medium mb-1">
                                        Add Comment:
                                    </label>
                                    <textarea
                                        id="comment"
                                        className="w-full border p-2 rounded"
                                        placeholder="Add a comment or revision request"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2 mt-6">
                                <button
                                    onClick={() => submitComment(selectedProposal.proposal._id)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add Comment
                                </button>
                                <button
                                    onClick={() => setShowFullDetails(true)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    View More
                                </button>
                                <button
                                    onClick={() => setSelectedProposal(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedProposal && showFullDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Complete Proposal Details</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowFullDetails(false);
                                        }}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Back to Summary
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowFullDetails(false);
                                            setSelectedProposal(null);
                                        }}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>

                            {/* General Information */}
                            {selectedProposal.generalInfo && (
                                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2">
                                        General Information
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            ["Name", selectedProposal.generalInfo.name],
                                            ["Email", selectedProposal.generalInfo.email],
                                            ["Address", selectedProposal.generalInfo.address],
                                            ["Mobile No", selectedProposal.generalInfo.mobileNo],
                                            ["Institute", selectedProposal.generalInfo.instituteName],
                                            ["Department", selectedProposal.generalInfo.areaOfSpecialization],
                                            ["Ongoing DBT Projects", selectedProposal.generalInfo.DBTproj_ong || "0"],
                                            ["Completed DBT Projects", selectedProposal.generalInfo.DBTproj_completed || "0"],
                                            ["Other Ongoing Projects", selectedProposal.generalInfo.Proj_ong || "0"],
                                            ["Other Completed Projects", selectedProposal.generalInfo.Proj_completed || "0"],
                                        ].map(([label, value], index) => (
                                            <li key={index} className="flex">
                                                <span className="w-1/3 font-semibold text-gray-700">{label}:</span>
                                                <span className="w-2/3 text-gray-900">{value || "N/A"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* PI Details */}
                            {selectedProposal.piInfo && (
                                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">

                                    {/* PI List */}
                                    {selectedProposal.piInfo.members?.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2">
                                                Principal Investigator(s)
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full bg-white border border-blue-300 rounded-lg">
                                                    <thead>
                                                        <tr className="bg-blue-100 text-gray-800">
                                                            <th className="p-2 border border-gray-300">Name</th>
                                                            <th className="p-2 border border-gray-300">Email</th>
                                                            <th className="p-2 border border-gray-300">Mobile</th>
                                                            <th className="p-2 border border-gray-300">Institute</th>
                                                            <th className="p-2 border border-gray-300">Department</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedProposal.piInfo.members.map((member, index) => (
                                                            <tr key={index} className="border-b hover:bg-blue-50">
                                                                <td className="p-2 border border-gray-200">{member.name || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{member.email || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{member.mobileNo || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{member.instituteName || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{member.Dept || "N/A"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Co-PI List */}
                                    {selectedProposal.piInfo.coPiList?.length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2">
                                                Co-Principal Investigator(s)
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full bg-white border border-blue-300 rounded-lg">
                                                    <thead>
                                                        <tr className="bg-blue-100 text-gray-800">
                                                            <th className="p-2 border border-gray-300">Name</th>
                                                            <th className="p-2 border border-gray-300">Email</th>
                                                            <th className="p-2 border border-gray-300">Mobile</th>
                                                            <th className="p-2 border border-gray-300">Institute</th>
                                                            <th className="p-2 border border-gray-300">Department</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedProposal.piInfo.coPiList.map((coPi, index) => (
                                                            <tr key={index} className="border-b hover:bg-blue-50">
                                                                <td className="p-2 border border-gray-200">{coPi.Name || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{coPi.email || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{coPi.Mobile || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{coPi.Institute || "N/A"}</td>
                                                                <td className="p-2 border border-gray-200">{coPi.Dept || "N/A"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Research Details */}
                            {selectedProposal.researchDetails && (
                                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2">
                                        Technical Details
                                    </h3>
                                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                                        {selectedProposal.researchDetails.Title}
                                    </h4>

                                    <p className="mb-3">
                                        <span className="font-semibold">Duration:</span> {selectedProposal.researchDetails.Duration} months
                                    </p>

                                    <div className="mb-4">
                                        <span className="font-semibold">Summary:</span>
                                        <p className="mt-1">{selectedProposal.researchDetails.Summary}</p>
                                    </div>

                                    <div className="mb-4">
                                        <span className="font-semibold">Objectives:</span>
                                        {selectedProposal.researchDetails.objectives?.length > 0 ? (
                                            <ul className="list-disc list-inside mt-1">
                                                {selectedProposal.researchDetails.objectives.map((obj, index) => (
                                                    <li key={index}>{obj}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="mt-1 italic text-gray-500">None specified</p>
                                        )}
                                    </div>

                                    <p className="mb-3">
                                        <span className="font-semibold">Expected Output:</span> {selectedProposal.researchDetails.Output}
                                    </p>

                                    {selectedProposal.researchDetails.other && (
                                        <p className="mb-3">
                                            <span className="font-semibold">Other Details:</span> {selectedProposal.researchDetails.other}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Budget Details */}
                            {selectedProposal.totalBudget && (
                                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2">
                                        Budget Summary
                                    </h3>

                                    <div className="flex justify-between mb-3">
                                        <span className="font-semibold">Non-Recurring Cost:</span>
                                        <span className="text-blue-800">₹{selectedProposal.totalBudget.non_recurring_total}</span>
                                    </div>

                                    <div className="flex justify-between mb-3">
                                        <span className="font-semibold">Recurring Cost:</span>
                                        <span className="text-blue-800">₹{selectedProposal.totalBudget.recurring_total}</span>
                                    </div>

                                    <div className="flex justify-between pt-3 border-t-2">
                                        <span className="font-bold">Total Cost:</span>
                                        <span className="font-bold text-green-700">₹{selectedProposal.totalBudget.total}</span>
                                    </div>
                                </div>
                            )}

                            {/* // Bank Details
                            {selectedProposal.bankInfo && (
                                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2">
                                        Bank Details
                                    </h3>
                                    <ul className="space-y-3">
                                        {[
                                            ["Name", selectedProposal.bankInfo.name],
                                            ["Account Number", selectedProposal.bankInfo.accountNumber],
                                            ["Account Type", selectedProposal.bankInfo.accountType],
                                            ["Bank Name", selectedProposal.bankInfo.bankName],
                                            ["IFSC Code", selectedProposal.bankInfo.ifscCode],
                                        ].map(([label, value], index) => (
                                            <li key={index} className="flex">
                                                <span className="w-1/3 font-semibold text-gray-700">{label}:</span>
                                                <span className="w-2/3 text-gray-900">{value || "N/A"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )} */}

                            {/* Action Buttons */}
                            <div className="flex justify-between">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowFullDetails(false);
                                        }}
                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    >
                                        Back
                                    </button>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowFullDetails(false);
                                            requestRevision(selectedProposal.proposal._id);
                                        }}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                    >
                                        Request Revision
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowFullDetails(false);
                                            handleApproval(selectedProposal.proposal._id, "Approved");
                                        }}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowFullDetails(false);
                                            handleApproval(selectedProposal.proposal._id, "Rejected");
                                        }}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProposalReview;