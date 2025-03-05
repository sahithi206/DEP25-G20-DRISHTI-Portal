import React, { useState } from "react";
<<<<<<< HEAD
import Sidebar from "../utils/Sidebar";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";

const SavedProposals = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <FaUserCircle className="text-2xl" />
                        <span>Welcome, Ms. Varsha</span>
                        <FaPowerOff className="text-xl cursor-pointer text-red-500" />
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 mt-16">
                    <div className="bg-white shadow-md rounded p-4">
                        <h1 className="text-center text-xl font-bold text-gray-900">
                            अनुसंधान नेशनल रिसर्च फाउंडेशन
                        </h1>
                        <h2 className="text-center text-lg font-semibold text-gray-700">
                            Anusandhan National Research Foundation
                        </h2>
                    </div>

                    <div className="text-center mt-4 text-gray-700 text-lg font-semibold">
                        List of Saved Draft Proposals
                    </div>

                    {/* Search & Buttons */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-2">
                            <label className="font-semibold">Search:</label>
                            <input
                                type="text"
                                className="border border-gray-400 rounded px-2 py-1"
                                placeholder="Search..."
                            />
                        </div>

                        <div className="flex space-x-2">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Submit Proposal
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Edit Proposal
                            </button>
                            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Table */}
=======
import { useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";

const SavedProposals = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Sample project data
    const acceptedProjects = [
        { id: 1, title: "AI-Based Agriculture Analysis", reference: "ANRF-12345", cost: "₹10,00,000" },
        { id: 2, title: "Quantum Computing Research", reference: "ANRF-67890", cost: "₹15,00,000" },
    ];

    return (
        <div className="flex min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
                </header>

                <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Accepted Proposals </p>
                    </div>
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                    <div className="mt-4">
                        <table className="w-full border border-gray-300 shadow-md">
                            <thead className="bg-blue-800 text-white">
                                <tr>
                                    <th className="p-2 border border-gray-300">Reference Number</th>
<<<<<<< HEAD
                                    <th className="p-2 border border-gray-300">Proposal Title</th>
                                    <th className="p-2 border border-gray-300">Version</th>
                                    <th className="p-2 border border-gray-300">Scheme</th>
                                    <th className="p-2 border border-gray-300">Area</th>
                                    <th className="p-2 border border-gray-300">Total Cost</th>
                                    <th className="p-2 border border-gray-300">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-gray-100">
                                    <td className="p-2 border border-gray-300 text-center" colSpan="7">
                                        No records found
                                    </td>
                                </tr>
=======
                                    <th className="p-2 border border-gray-300">Project Title</th>
                                    <th className="p-2 border border-gray-300">Total Cost</th>
                                    <th className="p-2 border border-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {acceptedProjects.length > 0 ? (
                                    acceptedProjects.map((project) => (
                                        <tr key={project.id} className="bg-gray-100 hover:bg-gray-200 cursor-pointer">
                                            <td className="p-2 border border-gray-300 text-center">{project.reference}</td>
                                            <td className="p-2 border border-gray-300">{project.title}</td>
                                            <td className="p-2 border border-gray-300">{project.cost}</td>
                                            <td className="p-2 border border-gray-300 text-center">
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                    onClick={() => navigate(`/project-dashboard/${project.id}`)}
                                                >
                                                    View Dashboard
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="bg-gray-100">
                                        <td className="p-2 border border-gray-300 text-center" colSpan="4">
                                            No Accepted Projects
                                        </td>
                                    </tr>
                                )}
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                            </tbody>
                        </table>
                    </div>
                </div>
<<<<<<< HEAD

=======
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
            </div>
        </div>
    );
};

export default SavedProposals;
