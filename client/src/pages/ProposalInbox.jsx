import React, { useEffect, useState } from "react";
import Sidebar from "../utils/Sidebar";
import { FaUserCircle, FaPowerOff, FaFilter, FaSearch } from "react-icons/fa";
import HomeNavbar from "../utils/HomeNavbar";
const ProposalInbox = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const URL=import.meta.env.VITE_REACT_APP_URL;
    useEffect(() => {
        const fetchProposals = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to view proposals.");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${URL}form/proposals`, {
                    method: "GET",
                    headers: {
                        "accessToken": `${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch proposals. Please try again.");
                }
                const data = await response.json();
                console.log(data);
                setProposals(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Rejected": return "bg-red-100 text-red-800 border border-red-300";
            case "Approved": return "bg-green-100 text-green-800 border border-green-300";
            case "Pending": return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            default: return "bg-gray-100 text-gray-800 border border-gray-300";
        }
    };

    const filteredProposals = proposals.filter(proposal =>
        (proposal.generalInfo?.instituteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.generalInfo?.areaOfSpecialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.researchDetails?.Title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filter === "All" || proposal.status === filter)
    );

    return (

       
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen}/>
                <div className="p-6 space-y-6 mt-16"> 
                <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Proposal Inbox</p>
                    </div>
                    <div className="bg-white shadow-md rounded-xl overflow-hidden">
                        <div className="p-4 bg-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4 w-full max-w-md">
                                <FaSearch className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by Institute, Specialization, or Title"
                                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500 text-sm px-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaFilter className="text-gray-500" />
                                <select
                                    className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-blue-700 text-white">
                                    <tr>
                                        {["Institute Name", "Specialization", "Title", "Status"].map(header => (
                                            <th key={header} className="p-4 text-center font-semibold text-xs border-b border-blue-600">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center p-6">Loading proposals...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="4" className="text-center p-6 text-red-600">No proposals Found!!</td></tr>
                                    ) : filteredProposals.length > 0 ? (
                                        filteredProposals.map((proposal, index) => (
                                            <tr key={index} className="group hover:bg-blue-50 transition-colors border-b last:border-b-0">
                                                <td className="p-4 text-center font-semibold text-xs">{proposal.generalInfo?.instituteName}</td>
                                                <td className="p-4 text-center font-semibold text-xs">{proposal.generalInfo?.areaOfSpecialization}</td>
                                                <td className="p-4 text-center font-semibold text-xs">{proposal.researchDetails?.Title}</td>
                                                <td className="p-4 text-center font-semibold text-xs">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor("Pending")}`}>{"Pending"}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center p-6">No proposals found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>

    );
};

export default ProposalInbox;
