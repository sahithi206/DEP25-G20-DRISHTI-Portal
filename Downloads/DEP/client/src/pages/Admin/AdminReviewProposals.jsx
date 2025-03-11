import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Bell, Settings, LogOut } from "lucide-react";

const AdminProposalReview = () => {
    const [activeSection, setActiveSection] = useState("approvals");
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
                const response = await fetch(`${URL}form/proposals?status=Pending`, {
                    method: "GET",
                    headers: { "accessToken": token },
                });
                // if (!response.ok) throw new Error("Failed to fetch proposals");
                const data = await response.json();
                console.log(data);
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
            console.log(`Approving proposal: ${proposalId}`);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated");
    
            const response = await fetch(`${URL}form/update-proposals/${proposalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify({ status, comment }),
            });
    
            console.log("Raw response:", response);
    
            const text = await response.text();  // Get raw response text
            console.log("Response text:", text);
    
            // If response is empty, throw an error
            if (!text.trim()) throw new Error("Empty response from server");
    
            try {
                const data = JSON.parse(text);
                console.log("Parsed response:", data);
    
                if (!response.ok) throw new Error(data.message || "Failed to update proposal status");
    
                setProposals(proposals.filter(proposal => proposal.proposal._id !== proposalId));
                setSelectedProposal(null);
                setComment("");
            } catch (jsonError) {
                throw new Error("Invalid JSON response from server");
            }
        } catch (err) {
            console.error("Network error:", err.message);
            setError(err.message);
        }
    };
    
    
    
    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
                    <h1 className="text-2xl font-semibold">Proposal Approvals</h1>
                    <div className="flex space-x-4">
                        <button className="p-2 bg-blue-500 text-white rounded-md"><Bell className="w-5 h-5" /></button>
                        <button className="p-2 bg-gray-500 text-white rounded-md"><Settings className="w-5 h-5" /></button>
                        <button className="p-2 bg-red-500 text-white rounded-md"><LogOut className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading proposals...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : proposals.length === 0 ? (
                        <p className="text-center text-gray-500">No pending proposals.</p>
                    ) : (
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 p-2">Proposal ID</th>
                                    <th className="border border-gray-300 p-2">Institute</th>
                                    <th className="border border-gray-300 p-2">Title</th>
                                    <th className="border border-gray-300 p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposals.map(proposal => (
                                    <tr key={proposal._id} className="text-center border-b">
                                        <td className="border border-gray-300 p-2">{proposal.proposal._id}</td>
                                        <td className="border border-gray-300 p-2">{proposal.generalInfo?.instituteName}</td>
                                        <td className="border border-gray-300 p-2">{proposal.researchDetails?.Title}</td>
                                        <td className="border border-gray-300 p-2">
                                            <button onClick={() => setSelectedProposal(proposal)} className="px-3 py-1 bg-blue-500 text-white rounded mr-2">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {selectedProposal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                            <h2 className="text-xl font-semibold mb-4">Proposal Details</h2>
                            <p><strong>Title:</strong> {selectedProposal.researchDetails?.Title}</p>
                            <p><strong>Description:</strong> {selectedProposal.researchDetails?.Summary}</p>
                            <p><strong>Submitted By:</strong> {selectedProposal.user?.Name}</p>
                            <p><strong>Institute:</strong> {selectedProposal.generalInfo?.instituteName}</p>
                            <p><strong>Area of Specialization:</strong> {selectedProposal.generalInfo?.areaOfSpecialization}</p>
                            <p><strong>Recurring cost:</strong> {selectedProposal.totalBudget?.recurring_total}</p>
                            <p><strong>Non-Recurring Cost:</strong> {selectedProposal.totalBudget?.non_recurring_total}</p>

                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2 mt-4"
                                placeholder="Add a comment (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => handleApproval(selectedProposal.proposal._id, "Approved")} className="px-4 py-2 bg-green-500 text-white rounded">Approve</button>
                                <button onClick={() => handleApproval(selectedProposal.proposal._id, "Rejected")} className="px-4 py-2 bg-red-500 text-white rounded">Reject</button>
                                <button onClick={() => setSelectedProposal(null)} className="px-4 py-2 bg-gray-500 text-white rounded">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProposalReview;