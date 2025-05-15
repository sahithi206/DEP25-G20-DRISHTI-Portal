// This file is for managing requests, including viewing, approving, rejecting, and commenting on requests.

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { useLocation } from "react-router-dom";
const URL = import.meta.env.VITE_REACT_APP_URL;
import { toast } from "react-toastify";
const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [activeSection, setActiveSection] = useState("requests");
    const location = useLocation();
    const [comments, setComments] = useState({});

    useEffect(() => {
        const pathToSection = {
            "/requests": "requests",
            "/": "dashboard",
            "/schemes": "schemes",
            "/review-proposals": "approvals",
            "/grants": "grants",
            "/fundCycle": "fundCycle"
        };
        setActiveSection(pathToSection[location.pathname] || "requests");
    }, [location]);

    useEffect(() => {
        fetch(`${URL}requests`)
            .then((res) => res.json())
            .then((data) => setRequests(data))
            .catch((error) => console.error("Error fetching requests:", error));
    }, []);

    const updateRequest = async (id, status = null, newComment = null) => {
        try {
            const request = requests.find(req => req._id === id);
            if (!request) return;

            const updatedComments = newComment ? [...(request.comments || []), newComment] : request.comments;

            const response = await fetch(`${URL}requests/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: status || request.status, 
                    comments: Array.isArray(updatedComments) ? updatedComments : []
                }),
            });

            if (response.ok) {
                setRequests(requests.map(req => req._id === id ? { ...req, status: status || req.status, comments: updatedComments } : req));
                setComments(prev => ({ ...prev, [id]: "" }));
            } else {
                const errorData = await response.json();
            console.error("Failed to update request:", errorData);
                toast.error("Failed to update request");
            }
        } catch (error) {
            console.error("Error updating request:", error);
        }
    };



    return (
        <div className="flex">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6">
                <AdminNavbar activeSection={activeSection}  yes={1} />
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">User ID</th>
                            <th className="p-2 border">Request Type</th>
                            <th className="p-2 border">Description</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Comments</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req._id} className="border text-center">
                                <td className="p-2 border">{req.userId}</td>
                                <td className="p-2 border">{req.requestType}</td>
                                <td className="p-2 border">{req.description}</td>
                                <td className={`p-2 border ${req.status === "Approved" ? "text-green-600" : req.status === "Rejected" ? "text-red-600" : "text-gray-600"}`}>
                                    {req.status}
                                </td>
                                <td className="p-2 border">
                                    {Array.isArray(req.comments) && req.comments.length > 0  ? (
                                        <ul className="text-left">
                                            {req.comments.map((comment, index) => (
                                                <li key={index} className="border-b p-1">{comment}</li>
                                            ))}
                                        </ul>
                                    ) : "No comments yet"}
                                </td>
                                <td className="p-2 border">
                                    <input
                                        type="text"
                                        value={comments[req._id] || ""}
                                        onChange={(e) => setComments({ ...comments, [req._id]: e.target.value })}
                                        placeholder="Add Comment"
                                        className="border p-2 rounded mb-2 w-full"
                                    />
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded mb-2 w-full"
                                        onClick={() => updateRequest(req._id, null, comments[req._id])}
                                    >
                                        Submit Comment
                                    </button>
                                    {req.status === "Pending" && (
                                        <>
                                            <button
                                                className="bg-green-500 text-white px-3 py-1 mr-2 rounded w-full"
                                                onClick={() => updateRequest(req._id, "Approved", comments[req._id])}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded w-full"
                                                onClick={() => updateRequest(req._id, "Rejected", comments[req._id])}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRequests;
