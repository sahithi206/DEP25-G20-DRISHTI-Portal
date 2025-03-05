import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";

const ProposalScheme = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleNext = () => {
        if (!selectedProposal) {
            setError("Please select a scheme before proceeding.");
            return;
        }
        navigate("/dashboard");
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <FaUserCircle className="text-2xl" />
                        <span>Welcome, Ms. Varsha</span>
                        <FaPowerOff className="text-xl cursor-pointer text-red-500" />
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Submission Form </p>
                    </div>

                    <div className="mt-6 mx-auto max-w-2xl bg-blue-100 p-6 rounded-md border">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-white-600">
                                Scheme: <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="p-2 border rounded bg-white w-2/3"
                                value={selectedProposal}
                                onChange={(e) => {
                                    setSelectedProposal(e.target.value);
                                    setError("");
                                }}
                            >
                                <option value="">Select scheme</option>
                                <option value="scheme1">Scheme 1</option>
                                <option value="scheme2">Scheme 2</option>
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
                </div>
            </div>
        </div>
    );
};

export default ProposalScheme;
