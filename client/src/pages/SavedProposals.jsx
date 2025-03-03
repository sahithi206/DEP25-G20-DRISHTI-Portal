import React, { useState } from "react";
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
                    <div className="mt-4">
                        <table className="w-full border border-gray-300 shadow-md">
                            <thead className="bg-blue-800 text-white">
                                <tr>
                                    <th className="p-2 border border-gray-300">Reference Number</th>
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
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SavedProposals;
