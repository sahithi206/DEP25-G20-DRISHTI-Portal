import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar"; 
import { FaCheck, FaTimes } from "react-icons/fa";

const FundCycleApproval = () => {
    const [fundRequests, setFundRequests] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/fund-cycle-requests")
            .then((res) => res.json())
            .then((data) => setFundRequests(data))
            .catch((error) => console.error("Error fetching fund cycle requests:", error));
    }, []);

    const updateFundRequestStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:8000/fund-cycle-requests/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setFundRequests(fundRequests.map(req => req._id === id ? { ...req, status } : req));
            } else {
                alert("Failed to update fund request status");
            }
        } catch (error) {
            console.error("Error updating fund request:", error);
        }
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Header */}
                <div className="bg-white shadow-lg rounded-lg p-5 mb-6">
                    <h2 className="text-3xl font-semibold text-gray-800">Fund Cycle Approval</h2>
                </div>

                {/* Fund Requests Table */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead className="bg-blue-900 text-white text-left">
                            <tr>
                                <th className="p-4 w-1/5">Applicant Name</th>
                                <th className="p-4 w-1/4">Fund Amount</th>
                                <th className="p-4 w-2/5">Reason</th>
                                <th className="p-4 w-1/6 text-center">Status</th>
                                <th className="p-4 w-1/6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fundRequests.length > 0 ? (
                                fundRequests.map((req, index) => (
                                    <tr key={req._id} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"} hover:bg-gray-200 transition`}>
                                        <td className="p-4">{req.applicantName}</td>
                                        <td className="p-4">{req.amount} USD</td>
                                        <td className="p-4 whitespace-pre-wrap">{req.reason}</td>
                                        <td className={`p-4 text-center font-bold ${req.status === "Approved" ? "text-green-600" : req.status === "Rejected" ? "text-red-600" : "text-yellow-600"}`}>
                                            {req.status}
                                        </td>
                                        <td className="p-4 text-center">
                                            {req.status === "Pending" && (
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition"
                                                        onClick={() => updateFundRequestStatus(req._id, "Approved")}
                                                    >
                                                        <FaCheck /> Approve
                                                    </button>
                                                    <button
                                                        className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition"
                                                        onClick={() => updateFundRequestStatus(req._id, "Rejected")}
                                                    >
                                                        <FaTimes /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">No fund cycle requests available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FundCycleApproval;
