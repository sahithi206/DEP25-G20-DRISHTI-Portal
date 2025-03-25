import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import BudgetAllocationForm from './BudgetAllocationForm';

const AdminProposalReview = () => {
    let navigate=useNavigate();
    const [activeSection, setActiveSection] = useState("sanction");
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const URL = import.meta.env.VITE_REACT_APP_URL;

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
                const response = await fetch(`${URL}admin/approvedProposals`, {
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

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />
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
                        <p>Loading Projects...</p>
                    ) : proposals.length === 0 ? (
                        <p>No Sanctioned Projects</p>
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
                                    <tr key={proposal._id} className="border-b">
                                        <td className="p-2">{proposal.proposal._id}</td>
                                        <td className="p-2">{proposal.generalInfo?.instituteName}</td>
                                        <td className="p-2">{proposal.researchDetails?.Title}</td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedProposal(proposal)
                                                   navigate(`/admin/allocate-budget/${proposal.proposal._id}`)

                                                }
                                                }
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
            </div>
        </div>
    );
};

export default AdminProposalReview;