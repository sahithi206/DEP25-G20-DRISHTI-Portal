import React, { useState } from "react";
import Sidebar from "../utils/Sidebar";
// import HomeNavbar from "../utils/HomeNavbar";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";


const ChangeOfInstitute = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex bg-gray-100 min-h-screen">
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
<<<<<<< HEAD
                <div className="p-6 mt-16">
                    {/* Page Header */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            अनुसंधान नेशनल रिसर्च फाउंडेशन
                        </h1>
                        <h2 className="text-lg font-semibold text-gray-700">
                            Anusandhan National Research Foundation
                        </h2>
                        <h3 className="mt-3 text-xl font-semibold text-gray-900 border-t-2 pt-2">
                            Change Of Institute
                        </h3>
=======
                <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Change of Institute </p>
>>>>>>> 6f04b4a7b5363b35467593eacbfbe5417f886933
                    </div>

                    {/* Form Section */}
                    <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        {/* File Number */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">
                                File Number <span className="text-red-500">*</span>
                            </label>
                            <select className="border border-gray-400 rounded px-3 py-1 w-full">
                                <option>Select File Number</option>
                            </select>
                        </div>

                        {/* Principal Investigator and Project Title */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                            <input type="text" className="border border-gray-400 rounded px-3 py-1 w-full" disabled />

                            <label className="font-semibold text-gray-700">Project Title:</label>
                            <input type="text" className="border border-gray-400 rounded px-3 py-1 w-full" disabled />
                        </div>

                        {/* Current Institute Details */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Current Institute:</label>
                            <input type="text" className="border border-gray-400 rounded px-3 py-1 w-full" disabled />

                            <label className="font-semibold text-gray-700">Current Institute Address:</label>
                            <input type="text" className="border border-gray-400 rounded px-3 py-1 w-full" disabled />
                        </div>

                        {/* New Institute Section */}
                        <h3 className="text-lg font-semibold text-green-700 mb-4">New Institute Details</h3>

                        {/* State, District, Institute Name */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select className="border border-gray-400 rounded px-3 py-1 w-full">
                                <option>Select</option>
                            </select>

                            <label className="font-semibold text-gray-700">District:</label>
                            <select className="border border-gray-400 rounded px-3 py-1 w-full">
                                <option>Select</option>
                            </select>

                            <label className="font-semibold text-gray-700">
                                Institute Name <span className="text-red-500">*</span>
                            </label>
                            <select className="border border-gray-400 rounded px-3 py-1 w-full">
                                <option>Select</option>
                            </select>
                        </div>

                        {/* Department & Designation */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Department:</label>
                            <input type="text" className="border border-gray-400 rounded px-3 py-1 w-full" />

                            <label className="font-semibold text-gray-700">
                                Designation <span className="text-red-500">*</span>
                            </label>
                            <input type="text" className="border border-gray-400 rounded px-3 py-1 w-full" />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">
                                Date of Resignation In Current Institution <span className="text-red-500">*</span>
                            </label>
                            <input type="date" className="border border-gray-400 rounded px-3 py-1 w-full" />

                            <label className="font-semibold text-gray-700">
                                Effective Date of Transfer (Date of Joining in New Institution) <span className="text-red-500">*</span>
                            </label>
                            <input type="date" className="border border-gray-400 rounded px-3 py-1 w-full" />
                        </div>

                        {/* Justification of Transfer */}
                        <div className="mb-4">
                            <label className="font-semibold text-gray-700">
                                Detailed Justification of Transfer <span className="text-red-500">*</span>
                            </label>
                            {/* Text Editor UI (Only UI, No Functionality) */}
                            <div className="border border-gray-400 rounded px-3 py-2 mt-2">
                                <div className="flex space-x-2 mb-2">
                                    <button className="p-1 border rounded hover:bg-gray-200">A</button>
                                    <button className="p-1 border rounded hover:bg-gray-200">T</button>
                                    <button className="p-1 border rounded hover:bg-gray-200 font-bold">B</button>
                                    <button className="p-1 border rounded hover:bg-gray-200 italic">I</button>
                                    <button className="p-1 border rounded hover:bg-gray-200 underline">U</button>
                                    <button className="p-1 border rounded hover:bg-gray-200">•</button>
                                    <button className="p-1 border rounded hover:bg-gray-200">—</button>
                                    <button className="p-1 border rounded hover:bg-gray-200">🔄</button>
                                    <button className="p-1 border rounded hover:bg-gray-200">↩</button>
                                </div>
                                <textarea className="w-full h-24 border border-gray-300 rounded p-2"></textarea>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button className="bg-blue-700 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeOfInstitute;
