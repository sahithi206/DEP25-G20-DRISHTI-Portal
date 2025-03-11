

// import React, { useEffect, useState } from "react";

// const AdminRequests = () => {
//     const [requests, setRequests] = useState([]);

//     // Fetch requests from the backend
//     useEffect(() => {
//         fetch("http://localhost:5000/requests")
//             .then((res) => res.json())
//             .then((data) => setRequests(data))
//             .catch((error) => console.error("Error fetching requests:", error));
//     }, []);

//     // Handle approve/reject action
//     const updateRequestStatus = async (id, status) => {
//         try {
//             const response = await fetch(`http://localhost:5000/requests/${id}`, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ status }),
//             });

//             if (response.ok) {
//                 setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
//             } else {
//                 alert("Failed to update request status");
//             }
//         } catch (error) {
//             console.error("Error updating request:", error);
//         }
//     };

//     return (
//         <div className="p-6">
//             <h2 className="text-2xl font-bold mb-4">Admin Requests Panel</h2>
//             <table className="w-full border">
//                 <thead>
//                     <tr className="bg-gray-200">
//                         <th className="p-2 border">Request Type</th>
//                         <th className="p-2 border">Description</th>
//                         <th className="p-2 border">Status</th>
//                         <th className="p-2 border">Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {requests.map((req) => (
//                         <tr key={req._id} className="border text-center">
//                             <td className="p-2 border">{req.requestType}</td>
//                             <td className="p-2 border">{req.description}</td>
//                             <td className={`p-2 border ${req.status === "Approved" ? "text-green-600" : req.status === "Rejected" ? "text-red-600" : "text-gray-600"}`}>{req.status}</td>
//                             <td className="p-2 border">
//                                 {req.status === "Pending" && (
//                                     <>
//                                         <button className="bg-green-500 text-white px-3 py-1 mr-2 rounded" onClick={() => updateRequestStatus(req._id, "Approved")}>
//                                             Approve
//                                         </button>
//                                         <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => updateRequestStatus(req._id, "Rejected")}>
//                                             Reject
//                                         </button>
//                                     </>
//                                 )}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default AdminRequests;

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar"; // Import the sidebar component
import { useLocation } from "react-router-dom"; // Import this to help with active section

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [activeSection, setActiveSection] = useState("requests"); // Default to requests section
    const location = useLocation();
    
    // Set active section based on current path when component mounts
    useEffect(() => {
        const path = location.pathname;
        const section = path === "/requests" ? "requests" : 
                       path === "/" ? "dashboard" : 
                       path === "/schemes" ? "schemes" : 
                       path === "/review-proposals" ? "approvals" :
                       path === "/grants" ? "grants" :
                       path === "/fundCycle" ? "fundCycle" : "requests";
        setActiveSection(section);
    }, [location]);
    
    // Fetch requests from the backend
    useEffect(() => {
        fetch("http://localhost:8000/requests")
            .then((res) => res.json())
            .then((data) => setRequests(data))
            .catch((error) => console.error("Error fetching requests:", error));
    }, []);
    
    // Handle approve/reject action
    const updateRequestStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:8000/requests/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
            } else {
                alert("Failed to update request status");
            }
        } catch (error) {
            console.error("Error updating request:", error);
        }
    };
    
    return (
        <div className="flex">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6">
                <h2 className="text-2xl font-bold mb-4">Admin Requests Panel</h2>
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">User ID</th>
                            <th className="p-2 border">Request Type</th>
                            <th className="p-2 border">Description</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req._id} className="border text-center">
                                 <td className="p-2 border">{req.userId}</td>
                                <td className="p-2 border">{req.requestType}</td>
                                <td className="p-2 border">{req.description}</td>
                                <td className={`p-2 border ${req.status === "Approved" ? "text-green-600" : req.status === "Rejected" ? "text-red-600" : "text-gray-600"}`}>{req.status}</td>
                                <td className="p-2 border">
                                    {req.status === "Pending" && (
                                        <>
                                            <button className="bg-green-500 text-white px-3 py-1 mr-2 rounded" onClick={() => updateRequestStatus(req._id, "Approved")}>
                                                Approve
                                            </button>
                                            <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => updateRequestStatus(req._id, "Rejected")}>
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