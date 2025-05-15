// This file is for managing miscellaneous requests in the admin panel .

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminNavbar from "../../../components/AdminNavbar";
import { toast } from "react-toastify";

// Constants
const REQUEST_TYPES = [
    { value: "", name: "All Types" },
    { value: "Technical Support", name: "Technical Support" },
    { value: "Document Request", name: "Document Request" },
    { value: "Other", name: "Other" },
];

const STATUS_LABELS = {
    Pending: "bg-yellow-200 text-yellow-800",
    Approved: "bg-green-200 text-green-800",
    Rejected: "bg-red-200 text-red-800",
};

const MiscRequests = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("requests");

    // State
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [comments, setComments] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const URL = import.meta.env.VITE_REACT_APP_URL;

    // Filter requests based on selected filters
    const filteredRequests = requests.filter((request) => {
        const typeMatch = typeFilter
            ? request.requestType === typeFilter
            : true;
        const statusMatch = statusFilter
            ? request.status === statusFilter
            : true;
        return typeMatch && statusMatch;
    });

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication required. Please log in.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${URL}requests/`, {
                method: "GET",
                headers: { accessToken: token },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setRequests(data.requests || []);
        } catch (err) {
            setError(`Failed to load requests: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [URL]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Handle status update
    const handleStatusUpdate = async (status) => {
        if (!selectedRequest) return;

        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${URL}requests/${selectedRequest._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: token,
                },
                body: JSON.stringify({ status, comments }),
            });

            if (!response.ok) {
                throw new Error("Failed to update request status");
            }

            const data = await response.json();

            if (data.success) {
                toast.success(`Request ${status.toLowerCase()} successfully!`);
                setShowModal(false);
                setComments("");
                fetchRequests(); // Refresh the list
            } else {
                toast.error(data.message || "Status update failed");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Open request details modal
    const openRequestDetails = (request) => {
        setSelectedRequest(request);
        setComments(""); // Reset comments when opening a new request
        setShowModal(true);
    };

    // Close modal and reset state
    const closeModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
        setComments("");
    };

    // Render request type badge
    const renderTypeBadge = (type) => {
        const badgeClasses = {
            "Technical Support": "bg-blue-200 text-blue-800",
            "Document Request": "bg-green-200 text-green-800",
            "Other": "bg-yellow-200 text-yellow-800",
            "default": "bg-gray-200 text-gray-800"
        };

        const badgeClass = badgeClasses[type] || badgeClasses.default;

        return (
            <span className={`px-3 py-1 rounded-full font-medium text-sm ${badgeClass}`}>
                {type || "N/A"}
            </span>
        );
    };

    // Render status badge
    const renderStatusBadge = (status) => {
        const badgeClass = STATUS_LABELS[status] || "bg-gray-200 text-gray-800";

        return (
            <span className={`px-3 py-1 rounded-full font-medium text-sm ${badgeClass}`}>
                {status || "N/A"}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar activeSection={activeSection} />

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Miscellanous Request Management</h1>
                        <button
                            onClick={fetchRequests}
                            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                            <p className="font-medium">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Type
                                </label>
                                <select
                                    id="typeFilter"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {REQUEST_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Filter by Status
                                </label>
                                <select
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center p-12 text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {typeFilter || statusFilter
                                        ? "Try changing your filters or check back later"
                                        : "No requests have been submitted yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredRequests.map((request) => (
                                            <tr key={request._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {request._id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {renderTypeBadge(request.requestType)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {request.userId?.Name || "Unknown User"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {renderStatusBadge(request.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openRequestDetails(request)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition duration-150"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Details Modal */}
            {showModal && selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Request ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedRequest._id}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {renderStatusBadge(selectedRequest.status)}
                                    </dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">User Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedRequest.userId?.Name || "N/A"}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedRequest.userId?._id || "N/A"}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Request Type</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{renderTypeBadge(selectedRequest.requestType)}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                                    <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200">
                                        {selectedRequest.description || "No description provided"}
                                    </dd>
                                </div>

                                {/* Only show comment input if status is still pending */}
                                {selectedRequest.status === "Pending" && (
                                    <div className="sm:col-span-2">
                                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                                            Admin Comments
                                        </label>
                                        <textarea
                                            id="comments"
                                            rows={4}
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            placeholder="Add your comments here..."
                                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Close
                            </button>

                            {/* Only show action buttons if status is still pending */}
                            {selectedRequest.status === "Pending" && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate("Rejected")}
                                        disabled={submitting}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {submitting ? "Processing..." : "Reject Request"}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate("Approved")}
                                        disabled={submitting}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                    >
                                        {submitting ? "Processing..." : "Approve Request"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MiscRequests;