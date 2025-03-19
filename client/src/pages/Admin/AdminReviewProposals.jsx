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
    const URL = import.meta.env.VITE_REACT_APP_URL;

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

            if (status === "Approved") {
                setShowBudgetForm(true);
                return;
            }

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

            // Ensure comment is defined
            const finalComment = comment?.trim() ? comment : "Proposal approved with budget allocation.";

            // First update the proposal status to Approved (including budget data)
            const approvalResponse = await fetch(`${URL}form/update-proposals/${budgetData.proposalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify({
                    status: "Approved",
                    comment: finalComment,
                    budgetsanctioned: budgetData.budgetSanctioned,
                    budgettotal: budgetData.budgetTotal,
                    TotalCost: budgetData.TotalCost,
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

            // Update the proposal in the list with the new comment
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

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar />
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

                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    {loading ? (
                        <p>Loading proposals...</p>
                    ) : proposals.length === 0 ? (
                        <p>No pending proposals.</p>
                    ) : (
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 text-left">Proposal ID</th>
                                    <th className="p-2 text-left">Institute</th>
                                    <th className="p-2 text-left">Title</th>
                                    <th className="p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposals.map(proposal => (
                                    <tr key={proposal.proposal._id} className="border-b">
                                        <td className="p-2">{proposal.proposal._id}</td>
                                        <td className="p-2">{proposal.generalInfo?.instituteName}</td>
                                        <td className="p-2">{proposal.researchDetails?.Title}</td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => setSelectedProposal(proposal)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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

                {selectedProposal && (
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
                                    onClick={() => requestRevision(selectedProposal.proposal._id)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                >
                                    Request Revision
                                </button>
                                <button
                                    onClick={() => handleApproval(selectedProposal.proposal._id, "Approved")}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleApproval(selectedProposal.proposal._id, "Rejected")}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Reject
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

                {showBudgetForm && selectedProposal && (
                    <BudgetAllocationForm
                        selectedProposal={selectedProposal}
                        onClose={() => setShowBudgetForm(false)}
                        onSubmit={handleBudgetSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminProposalReview;
