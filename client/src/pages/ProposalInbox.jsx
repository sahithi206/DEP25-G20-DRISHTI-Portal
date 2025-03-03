import React, { useState } from "react";
import Sidebar from "../utils/Sidebar";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";

const ProposalInbox = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const toggleDropdown = (index) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const dropdownOptions = [
        {
            title: "Upload SE/UC",
            options: ["Upload New SE/UC", "View/Revise Uploaded SE/UC"]
        },
        {
            title: "Upload Progress Report",
            options: ["Upload New Progress Report", "View/Revise Uploaded Progress Report"]
        },
        {
            title: "Upload Publications",
            options: ["Upload SCI Index Paper", "Uploaded Other Conference/Journal Paper"]
        },
    ];

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                {/* Navbar */}
                {/* <HomeNavbar /> */}
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <FaUserCircle className="text-2xl" />
                        <span>Welcome, Ms. Varsha</span>
                        <FaPowerOff className="text-xl cursor-pointer text-red-500" />
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 mt-16">
                    {/* Header Section */}
                    <div className="bg-white shadow-md rounded-lg p-6 text-center border-t-4 border-blue-800">
                        <h1 className="text-2xl font-bold text-gray-900">
                            अनुसंधान नेशनल रिसर्च फाउंडेशन
                        </h1>
                        <h2 className="text-lg font-semibold text-gray-700">
                            Anusandhan National Research Foundation
                        </h2>
                        <p className="mt-2 text-xl font-semibold text-gray-900">
                            Proposal Inbox
                        </p>
                    </div>

                    {/* Buttons Section */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {/* Dropdown Buttons */}
                        {dropdownOptions.map((dropdown, index) => (
                            <div key={index} className="relative">
                                <button
                                    onClick={() => toggleDropdown(index)}
                                    className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium flex items-center"
                                >
                                    {dropdown.title} &nbsp; ▼
                                </button>
                                {dropdownOpen === index && (
                                    <div className="absolute mt-2 w-56 bg-blue-700 text-white rounded-md shadow-lg overflow-hidden">
                                        {dropdown.options.map((option, i) => (
                                            <button
                                                key={i}
                                                className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-800 transition"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Existing Buttons */}
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                            RTGS/Quotations
                        </button>
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                            Release History
                        </button>
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                            Compose Letter
                        </button>
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                            Letters Received
                        </button>
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                            Letters Sent
                        </button>
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                            View Documents
                        </button>
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                            Proceedings
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="mt-6 flex items-center space-x-2 justify-center">
                        <label className="font-semibold text-gray-700">Search:</label>
                        <input
                            type="text"
                            className="border border-gray-400 rounded px-3 py-1 focus:outline-none focus:ring focus:ring-blue-300 w-64"
                            placeholder="Search..."
                        />
                    </div>

                    {/* Table Container */}
                    <div className="mt-6 overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="w-full border border-gray-300">
                            <thead className="bg-blue-800 text-white text-sm">
                                <tr>
                                    {["File Number", "Proposal Title", "Institute", "Scheme", "Area", "Submission Date", "Status", "Action"].map((heading, index) => (
                                        <th key={index} className="p-3 border border-gray-300 text-center">{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-gray-100">
                                    <td className="p-3 border border-gray-300 text-center text-gray-600 font-medium" colSpan="8">
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

export default ProposalInbox;
