import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminNavbar from "../../../components/AdminNavbar";
import { toast } from "react-toastify";

const AdminProposalReview = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("requests");
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [status, setStatus] = useState("");
    const [id, setId] = useState();
    const [comments, setComment] = useState("");
    const [type] = useState([
        { name: "All" },
        { name: "Technical Support" },
        { name: "Document Request" },
        { name: "Other" },
    ]);
    const [typeFilter, setTypeFilter] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const URL = import.meta.env.VITE_REACT_APP_URL;

    const filteredRequests = requests.filter((r) => {
        const typeMatch = typeFilter
            ? r.Title?.toLowerCase().includes(typeFilter.toLowerCase())
            : true;
        return typeMatch;
    });

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to view requests.");
                setLoading(false);
                return;
            }

            try {
                const requestRes = await fetch(`${URL}requests/`, {
                    method: "GET",
                    headers: { accessToken: token },
                });
                const requestData = await requestRes.json();
                console.log(requestData);
                setRequests(requestData.requests || []);
                console.log(requests);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleSubmit = async (status) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${URL}requests/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: token,
                },
                body: JSON.stringify({ status, comments }),
            });
            const data = await res.json();
            console.log(data);
            if (data.success) {
                toast.success("Request Status Changed Successfully!!")
            } else {
                toast.error("Status Change was Unsuccessful!!")
            }

        } catch (e) {
            console.log(e);
        }
    }


    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                        {error}
                    </div>
                )}

                <div className="flex justify-end p-4 px-1">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-40 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {type.map((scheme, idx) => (
                            <option key={idx} value={scheme}>
                                {scheme.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading ? (
                        <p className="text-gray-500 text-center">Loading Requests...</p>
                    ) : filteredRequests.length === 0 ? (
                        <p className="text-gray-500 text-center">No Requests Found</p>
                    ) : (
                        <table className="w-full border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-left border border-gray-200">File. No</th>
                                    <th className="p-3 text-left border border-gray-200">Type</th>
                                    <th className="p-3 text-center border border-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((r) => (
                                    <tr key={r._id} className="hover:bg-gray-50">
                                        <td className="p-3 border border-gray-200">{r._id}</td>
                                        <td className="p-3 border border-gray-200">
                                            <span
                                                className={`px-4 py-2 rounded-lg font-medium text-sm
                                                        ${r.requestType === "Technical Support"
                                                        ? "bg-blue-200 text-blue-800"
                                                        : r.requestType === "Document Request"
                                                            ? "bg-green-200 text-green-800"
                                                            : r.requestType === "Other"
                                                                ? "bg-yellow-200 text-yellow-800"
                                                                : "bg-gray-200 text-gray-800"
                                                    }`}
                                            >
                                                {r.requestType || "N/A"}
                                            </span>
                                        </td>

                                        <td className="p-3 text-center border border-gray-200">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(r);
                                                    setShowModal(true);
                                                }}
                                                className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                View Request
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {showModal && selectedRequest && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-1/2 shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Request Details</h2>
                            <p><strong>User Id:</strong> {selectedRequest.userId._id}</p>
                            <p><strong>Name:</strong> {selectedRequest.userId.Name}</p>
                            <p><strong>Type:</strong> {selectedRequest.requestType}</p>
                            <p><strong>Description:</strong> {selectedRequest.description}</p>
                            <p><strong>Status:</strong> {selectedRequest.status}</p>
                            <div className="flex flex-col gap-2">
                                <label className="text-lg font-semibold text-gray-700">Add Comment</label>
                                <textarea
                                    className="p-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={comments}
                                    onChange={(e) => {
                                        setId(selectedRequest._id);
                                        setComment(e.target.value)
                                    }}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => { setId(selectedRequest._id); handleSubmit("Approved") }}
                                    className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => { setId(selectedRequest._id); handleSubmit("Rejected") }}
                                    className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-black px-4 py-2 rounded shadow hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default AdminProposalReview;
