// This file is for handling requests related to projects, including submission and approval workflows.

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
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const [comments, setComment] = useState("");
  const [id, setId] = useState();
  const [req, setReq] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchTitle, setSearchTitle] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
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
        const response = await fetch(`${url}requests/requests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: localStorage.getItem("token")
          }
        });

        const data = await res.json();
        const re = await response.json();
        console.log(data.requests);
        await setReq(re?.request);
        await setRequests(data?.requests);

      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

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
  useEffect(() => {
    const filterrequests = () => {
      let filtered = [...requests, ...req];
      if (searchTitle) {
        const searchTerm = searchTitle.toLowerCase();
        filtered = filtered.filter((project) => {
          if (project.userId?.Name?.toLowerCase().includes(searchTerm)) return true;

          if ((project?.requestType ?? "Change Institute").toLowerCase().includes(searchTerm)) return true;

          return false;
        });
      }
      if (statusFilter) {
        filtered = filtered.filter(project => project.status === statusFilter);
      }
      if (sortOrder === "newest") {
        filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      } else if (sortOrder === "oldest") {
        filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
      }
      setFilteredRequests(filtered);
    };

    filterrequests();
  }, [searchTitle, statusFilter, sortOrder, requests]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar yes={1} />
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Request Approvals</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search projects by PI name or Type..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  role="img"
                  aria-label="Search icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Pending For Admin's Approval">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
              </div>
            ) : Array.isArray(filteredRequests) && filteredRequests.length === 0
              ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No {statusFilter} requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests && filteredRequests.length > 0 && filteredRequests
                        .map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request._id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="">{request.userId?.Name || "Unknown"}</span>
                              <p className="text-xs">{request.userId?._id || "N/A"}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request?.requestType ?? "Change Institute"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.status === "Pending For Admin's Approval" ? "bg-green-100 text-green-800" :
                                  request.status === "Rejected" ? "bg-red-100 text-red-800" :
                                    "bg-yellow-100 text-yellow-800"}`}>
                                {request.status === "Sent" ? "Pending for Agency's Approval" : request.status}
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
                </div>
              )}
          </div>
        </main>
      </div>

      {showModal && selectedRequest && selectedRequest.requestType === "Change Institute" && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-11/12 max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Institute Transfer Request</h2>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><span className="font-semibold">User ID:</span> {selectedRequest.userId?._id}</p>
                <p><span className="font-semibold">Name:</span> {selectedRequest.userId?.Name}</p>
                <p><span className="font-semibold">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${selectedRequest.status === "Pending For Admin's Approval" ? "bg-green-500"
                    : selectedRequest.status === "Rejected" ? "bg-red-500"
                      : "bg-yellow-500"
                    }`}>
                    {selectedRequest.status === "Sent" ? "Pending for Agency's Approval" : selectedRequest.status}
                  </span>
                </p>
                <p><span className="font-semibold">Submitted At:</span> {new Date(selectedRequest.date).toLocaleString()}</p>
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
                  className="bg-green-600 text-white px-3 py-1 text-sm rounded-lg shadow hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => { setId(selectedRequest._id); handleSubmit("Rejected") }}
                  className="bg-red-600 text-white px-3 py-1 text-sm rounded-lg shadow hover:bg-red-700 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-800 px-3 py-1 text-sm rounded-lg shadow hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && selectedRequest && selectedRequest.requestType !== "Change Institute" && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-11/12 max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Institute Transfer Request</h2>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><span className="font-semibold">User ID:</span> {selectedRequest.userId?._id}</p>
                <p><span className="font-semibold">Name:</span> {selectedRequest.userId?.Name}</p>
                <p><span className="font-semibold">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-white text-xs ${selectedRequest.status === "Pending For Admin's Approval" ? "bg-green-500"
                    : selectedRequest.status === "Rejected" ? "bg-red-500"
                      : "bg-yellow-500"
                    }`}>
                    {selectedRequest.status === "Sent" ? "Pending for Agency's Approval" : selectedRequest.status}
                  </span>
                </p>
                <p><span className="font-semibold">Submitted At:</span> {new Date(selectedRequest.date).toLocaleString()}</p>
              </div>

              <hr className="my-6 border-gray-300" />

              <h3 className="text-xl font-semibold text-gray-800">Transfer Form Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <p><span className="font-semibold">PI Name:</span> {selectedRequest.userId?.Name}</p>
                <p><span className="font-semibold">Institute:</span> {selectedRequest.userId?.Institute}</p>
              </div>

              <div className="mt-4">
                <p><span className="font-semibold">Justification:</span></p>
                <p className="bg-gray-100 rounded-md p-8 mt-1 text-sm">{selectedRequest.description || 'N/A'}</p>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-800 px-3 py-1 text-sm rounded-lg shadow hover:bg-gray-400 transition"
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