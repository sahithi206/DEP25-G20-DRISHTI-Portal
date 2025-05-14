import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import BudgetAllocationForm from './BudgetAllocationForm';

const AdminProposalReview = () => {
    let navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("sanction");
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const URL = import.meta.env.VITE_REACT_APP_URL;
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
        console.log(schemes);
    }, [URL]);

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
                        <p>Loading Projects...</p>
                    ) : proposals.length === 0 ? (
                        <p>No Sanctioned Projects</p>
                    ) : (
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 text-left">Proposal ID</th>
                                    <th className="p-2 text-left">Title</th>
                                    <th className="p-2 text-left">Scheme</th>
                                    <th className="p-2 text-left">Institute</th>
                                    <th className="p-2 text-left">PIs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedProposals.map(proposal => (
                                    <tr key={proposal.proposal._id} className="border-b">
                                        <td className="p-2 text-sm text-blue-500 hover:underline" onClick={() => {
                                            setSelectedProposal(proposal);
                                            navigate(`/admin/allocate-budget/${proposal.proposal._id}`);
                                        }}>{proposal.proposal._id}</td>
                                        <td className="p-2 text-sm" onClick={() => {
                                            setSelectedProposal(proposal);
                                            navigate(`/admin/allocate-budget/${proposal.proposal._id}`);
                                        }}>{proposal.researchDetails?.Title}</td>
                                        <td className="p-2 text-sm" onClick={() => {
                                            setSelectedProposal(proposal);
                                            navigate(`/admin/allocate-budget/${proposal.proposal._id}`);
                                        }}>{proposal.proposal.Scheme?.name}</td>
                                        <td className="p-2 text-sm" onClick={() => {
                                            setSelectedProposal(proposal);
                                            navigate(`/admin/allocate-budget/${proposal.proposal._id}`);
                                        }}>{proposal.generalInfo?.instituteName}</td>
                                        <td className="p-2 text-sm" onClick={() => {
                                            setSelectedProposal(proposal);
                                            navigate(`/admin/allocate-budget/${proposal.proposal._id}`);
                                        }}>
                                            <ul className="list-disc pl-5">
                                                {proposal.piInfo?.piList?.length > 0
                                                    ? proposal.piInfo.piList.map((member, index) => (
                                                        <li key={index}>{member.Name}</li>
                                                    ))
                                                    : <li>N/A</li>}
                                            </ul>
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