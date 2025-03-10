import React, { useState } from "react";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";

const MiscRequest = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({
        requestType: "",
        description: "",
    });

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.requestType || !formData.description) {
            alert("Please fill in all fields");
            return;
        }
        const newRequest = {
            id: requests.length + 1,
            type: formData.requestType,
            description: formData.description,
            date: new Date().toLocaleDateString(),
            status: "Pending",
        };
        setRequests([...requests, newRequest]);
        setFormData({ requestType: "", description: "" });
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
            <HomeNavbar isSidebarOpen={isSidebarOpen}/>
                {/* Page Content */}
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
                            Miscellaneous Requests
                        </h3>
                        <p className="text-center text-gray-600">Submit your requests for administrative support</p>
                    </div>


                    {/* Request Form */}
                    <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Request Type</label>
                                <select
                                    name="requestType"
                                    value={formData.requestType}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                    required
                                >
                                    <option value="">Select Request Type</option>
                                    <option value="Technical Support">Technical Support</option>
                                    <option value="Document Request">Document Request</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                    rows="3"
                                    placeholder="Describe your request..."
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                            >
                                Submit 
                            </button>
                        </form>
                    </div>

                    {/* Requests Table */}
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-800">Previous Requests</h2>
                        <div className="mt-2 overflow-x-auto">
                            <table className="w-full border border-gray-300 shadow-md">
                                <thead className="bg-blue-800 text-white">
                                    <tr>
                                        <th className="p-2 border border-gray-300">ID</th>
                                        <th className="p-2 border border-gray-300">Request Type</th>
                                        <th className="p-2 border border-gray-300">Description</th>
                                        <th className="p-2 border border-gray-300">Date</th>
                                        <th className="p-2 border border-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.length > 0 ? (
                                        requests.map((req) => (
                                            <tr key={req.id} className="bg-gray-100 text-center">
                                                <td className="p-2 border border-gray-300">{req.id}</td>
                                                <td className="p-2 border border-gray-300">{req.type}</td>
                                                <td className="p-2 border border-gray-300">{req.description}</td>
                                                <td className="p-2 border border-gray-300">{req.date}</td>
                                                <td className="p-2 border border-gray-300 text-blue-600">{req.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="p-2 border border-gray-300 text-center" colSpan="5">
                                                No requests submitted yet
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

export default MiscRequest;
