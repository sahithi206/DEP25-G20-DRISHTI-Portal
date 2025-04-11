import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/InstituteSidebar";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";

const url = import.meta.env.VITE_REACT_APP_URL;

const ApproveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("requests");
  const [statusFilter, setStatusFilter] = useState("pending");
  const navigate = useNavigate();
  const [comments,setComment]=useState("");
  const [id,setId]=useState();
  // Fetch requests based on status filter
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${url}requests/get-instituteci`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: localStorage.getItem("token")
          }
        });

        const data = await res.json();

        if (data.success) {
          setRequests(data.requests);
        }
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [statusFilter]);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleSubmit = async (status) => {
    if (!selectedRequest) return;
  
    try {
      setLoading(true);
      console.log(selectedRequest._id);
      const res = await fetch(`${url}requests/${selectedRequest._id}/update-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token")
        },
        body: JSON.stringify({
          status,
          comment: comments
        })
      });
  
      const data = await res.json();
      if (data.success) {
        setRequests(prev =>
          prev.map(req =>
            req._id === selectedRequest._id ? { ...req, status } : req
          )
        );
        setShowModal(false);
      }
    } catch (err) {
      console.error(`Error updating request status:`, err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Request Approvals</h1>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setStatusFilter("Pending")}
              className={`px-4 py-2 rounded-md ${statusFilter === "Pending" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("Pending For Admin's Approval")}
              className={`px-4 py-2 rounded-md ${statusFilter === "Pending For Admin's Approval" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("Rejected")}
              className={`px-4 py-2 rounded-md ${statusFilter === "Rejected" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Rejected
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
              </div>
            ) : Array.isArray(requests) && requests.length === 0 
            ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No {statusFilter} requests found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests&&requests.length>0&&requests
    .filter(req => req.status?.toLowerCase() === statusFilter.toLowerCase())
    .map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="">{request.userId?.Name || "Unknown"}</span>
                        <p className="text-xs">{request.userId._id}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${request.status === "Pending For Admin's Approval" ? "bg-green-100 text-green-800" : 
                            request.status === "Rejected" ? "bg-red-100 text-red-800" : 
                            "bg-yellow-100 text-yellow-800"}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {showModal && selectedRequest && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-2xl w-11/12 max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Institute Transfer Request</h2>

      <div className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p><span className="font-semibold">User ID:</span> {selectedRequest.userId?._id}</p>
          <p><span className="font-semibold">Name:</span> {selectedRequest.userId?.Name}</p>
          <p><span className="font-semibold">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${
              selectedRequest.status === "Pending For Admin's Approval" ? "bg-green-500"
              : selectedRequest.status === "Rejected" ? "bg-red-500"
              : "bg-yellow-500"
            }`}>
              {selectedRequest.status}
            </span>
          </p>
          <p><span className="font-semibold">Submitted At:</span> {new Date(selectedRequest.submittedAt).toLocaleString()}</p>
        </div>

        <hr className="my-6 border-gray-300" />

        <h3 className="text-xl font-semibold text-gray-800">Transfer Form Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <p><span className="font-semibold">PI Name:</span> {selectedRequest.FormData?.piName}</p>
          <p><span className="font-semibold">Project Title:</span> {selectedRequest.FormData?.projectTitle}</p>
          <p><span className="font-semibold">Current Institute:</span> {selectedRequest.FormData?.currentInstitute}</p>
          <p><span className="font-semibold">Institute Address:</span> {selectedRequest.FormData?.currentInstituteAddress}</p>
          <p><span className="font-semibold">State:</span> {selectedRequest.FormData?.state}</p>
          <p><span className="font-semibold">District:</span> {selectedRequest.FormData?.district}</p>
          <p><span className="font-semibold">New Institute:</span> {selectedRequest.FormData?.newInstitute}</p>
          <p><span className="font-semibold">Department:</span> {selectedRequest.FormData?.department}</p>
          <p><span className="font-semibold">Designation:</span> {selectedRequest.FormData?.designation}</p>
          <p><span className="font-semibold">Resignation Date:</span> {selectedRequest.FormData?.resignationDate ? new Date(selectedRequest.FormData.resignationDate).toLocaleDateString() : '-'}</p>
          <p><span className="font-semibold">Joining Date:</span> {selectedRequest.FormData?.joiningDate ? new Date(selectedRequest.FormData.joiningDate).toLocaleDateString() : '-'}</p>
        </div>

        <div className="mt-4">
          <p><span className="font-semibold">Justification:</span></p>
          <p className="bg-gray-100 rounded-md p-3 mt-1 text-sm">{selectedRequest.FormData?.justification || 'N/A'}</p>
        </div>

        <hr className="my-6 border-gray-300" />

        <div className="flex flex-col gap-2">
          <label className="text-base font-medium text-gray-700">Add Comment</label>
          <textarea
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={comments}
            onChange={(e) => {
              setId(selectedRequest._id);
              setComment(e.target.value);
            }}
            placeholder="Write your comment here..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => { setId(selectedRequest._id); handleSubmit("Pending For Admin's Approval") }}
            className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => { setId(selectedRequest._id); handleSubmit("Rejected") }}
            className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 transition"
          >
            Reject
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg shadow hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default ApproveRequests;