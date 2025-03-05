import React, { useState } from "react";
import Sidebar from "../utils/Sidebar";
import { 
    FaUserCircle, 
    FaPowerOff, 
    FaFilter, 
    FaSearch 
} from "react-icons/fa";

const SubmittedForms = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("All");


    // just kept random details for checking
    const proposals = [
        { 
            id: "P003",  
            status: "Rejected",
            proposalName: "Advanced Machine Learning Techniques",
            InstituteName:"IIT Ropar",
            AreaOfSpecialization: "Compuevdjebsc",
            department: "Computer Science"
        },
        { 
            id: "P004", 
            status: "Pending",
            proposalName: "Sustainable Energy Solutions",
            InstituteName:"IIT Ropar",
            AreaOfSpecialization: "Compuevdjebsc",
            department: "Environmental Studies"
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "Rejected": return "bg-red-100 text-red-800 border border-red-300";
            case "Approved": return "bg-green-100 text-green-800 border border-green-300";
            case "Pending": return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            default: return "bg-gray-100 text-gray-800 border border-gray-300";
        }
    };

    const filteredProposals = proposals.filter(proposal => 
        (proposal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.proposalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.InstituteName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        proposal.AreaOfSpecialization.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filter === "All" || proposal.status === filter)
    );
    
    

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
                    <h2 className="text-2xl font-bold tracking-wider">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FaUserCircle className="text-3xl text-blue-200" />
                            <span className="text-lg font-medium">Ms. Varsha</span>
                        </div>
                        <FaPowerOff className="text-2xl cursor-pointer text-red-400 hover:text-red-500 transition transform hover:scale-110" />
                    </div>
                </header>
                
                <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
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
                                placeholder="Search by ID, Name, Institute, Area of Specialization, Dept " 
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
                                    {[
                                        "Proposal ID", 
                                        "Proposal Name", 
                                        "Department", 
                                        "Institute Name",
                                        "Area of Specialization", 
                                        "Status"
                                    ].map((header) => (
                                        <th 
                                            key={header} 
                                            className="p-4 text-center font-semibold tracking-wide uppercase text-xs border-b border-blue-600"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                    {filteredProposals.length > 0 ? (
                                        filteredProposals.map((proposal, index) => (
                                            <tr 
                                                key={index} 
                                                className="group hover:bg-blue-50 transition-colors duration-200 ease-in-out border-b last:border-b-0"
                                            >
                                                <td className="p-4 text-center text-gray-800 font-medium group-hover:text-blue-700">
                                                    {proposal.id}
                                                </td>
                                                <td className="p-4 text-center text-gray-700 font-semibold group-hover:text-blue-800">
                                                    {proposal.proposalName}
                                                </td>
                                                <td className="p-4 text-center text-gray-600">
                                                    {proposal.department}
                                                </td>
                                                <td className="p-4 text-center text-gray-700"> 
                                                    {proposal.InstituteName}
                                                </td>
                                                <td className="p-4 text-center text-gray-700"> 
                                                    {proposal.AreaOfSpecialization}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(proposal.status)}`}>
                                                        {proposal.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center p-6 text-gray-500">
                                                No proposals found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmittedForms;