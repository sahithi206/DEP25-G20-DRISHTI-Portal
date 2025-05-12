import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import { AuthContext } from "./Context/Authcontext";
import HomeNavbar from "../utils/HomeNavbar";
import { toast } from 'react-toastify';

const ProposalScheme = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState("");
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({
        start: "",
        end: ""
    });
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc"
    });

    const navigate = useNavigate();
    const { submitProposal, incompleteProposals, getSchemes, deleteProposal } = useContext(AuthContext);
    const [incompProposals, setProposals] = useState([]);
    const [filteredProposals, setFilteredProposals] = useState([]);
    const [schemes, setSchemes] = useState([]);

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const schemeList = await getSchemes();
                setSchemes(schemeList);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load schemes");
            }
        };
        fetchSchemes();
    }, []);

    useEffect(() => {
        const filterAndSortProposals = async () => {
            let incompProposals = await incompleteProposals();
            let filtered = [...incompProposals];
            console.log(incompProposals);
            if (searchTerm) {
                filtered = filtered.filter((proposal) =>
                    proposal.schemeName.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            if (dateRange.start) {
                filtered = filtered.filter(proposal =>
                    new Date(proposal.date) >= new Date(dateRange.start)
                );
            }
            if (dateRange.end) {
                filtered = filtered.filter(proposal =>
                    new Date(proposal.date) <= new Date(dateRange.end)
                );
            }

            filtered.sort((a, b) => {
                const dateA = new Date(a[sortConfig.key]);
                const dateB = new Date(b[sortConfig.key]);
                return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
            });

            setFilteredProposals(filtered);
        };

        filterAndSortProposals();
    }, [searchTerm, incompProposals, dateRange, sortConfig]);

    const handleDelete = async (proposalId) => {
        try {
            await deleteProposal(proposalId);
            setProposals(incompProposals.filter(proposal => proposal._id !== proposalId));
            toast.success("Proposal deleted successfully");
        } catch (error) {
            console.error("Error deleting proposal:", error.message);
            toast.error("Failed to delete proposal");
        }
    };

    const handleNext = async () => {
        if (!selectedProposal) {
            toast.warning("Please select a scheme before proceeding.");
            return;
        }

        try {
            const response = await submitProposal(selectedProposal);
            if (response?.success) {
                toast.success(response.msg || "Proposal submitted successfully!");
                localStorage.setItem("ProposalID", response.prop._id);
                navigate("/dashboard");
            } else {
                toast.error(response?.msg || "Failed to submit proposal");
            }
        } catch (error) {
            console.error("Error creating proposal:", error.message);
            toast.error("Failed to submit proposal");
        }
    };

    const handleEdit = (proposal) => {
        if (proposal?._id) {
            localStorage.setItem("ProposalID", proposal._id);
            navigate("/dashboard");
        } else {
            toast.error("Invalid proposal");
        }
    };

    const toggleSortDirection = () => {
        setSortConfig(prev => ({
            ...prev,
            direction: prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const clearFilters = () => {
        setSearchTerm("");
        setDateRange({ start: "", end: "" });
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />

                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
                        <img src="/3.png" alt="ResearchX Logo" className="mx-auto w-84 h-32 object-contain"/>
                        <p className="mt-3 ml-3 text-2xl font-bold text-blue-800">Submission Form</p>
                    </div>

                    <div className="mt-6 mx-auto max-w-2xl bg-blue-100 p-6 rounded-md border">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-white-600">
                                Scheme: <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="p-2 border rounded bg-white w-2/3"
                                value={selectedProposal}
                                onChange={(e) => setSelectedProposal(e.target.value)}
                            >
                                <option value="">Select scheme</option>
                                {schemes.map((scheme) => (
                                    <option key={scheme._id} value={scheme._id}>
                                        {scheme.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                    </div>

                    <div className="text-right text-sm font-semibold text-red-700 mt-2 pr-2">
                        * Mandatory Fields
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all"
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>

                    <div className=" bg-white p-4  rounded-md shadow-md">
                        <div className=" flex  items-center justify-between bg-white hover">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by Scheme"
                                className="w-full outline-none  text-gray-800 placeholder-gray-500 text-sm pr-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                onClick={toggleSortDirection}
                                className="flex items-center mb-2 bg-gray-200 hover:bg-gray-300 px-5  rounded text-sm"
                            >
                                Sort: {sortConfig.direction === "asc" ? "Oldest ↑" : "Newest ↓"}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-700">
                                        <th className="py-2 px-4 text-left">Scheme Name</th>
                                        <th className="py-2 px-4 text-left">
                                            <div className="flex items-center gap-1">
                                                Date
                                                <button
                                                    onClick={toggleSortDirection}
                                                    className="focus:outline-none"
                                                >
                                                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                                                </button>
                                            </div>
                                        </th>
                                        <th className="py-2 px-4 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProposals.map((proposal) => (
                                        <tr key={proposal._id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-4">{proposal.schemeName}</td>
                                            <td className="py-2 px-4">
                                                {new Date(proposal.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-2 px-4 space-x-2">
                                                <button
                                                    onClick={() => handleEdit(proposal)}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(proposal._id)}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalScheme;
