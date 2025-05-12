import { useState, useEffect } from "react";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const URL = import.meta.env.VITE_REACT_APP_URL;

const MiscRequest = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        requestType: "",
        description: "",
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [sortAsc, setSortAsc] = useState(false); // Default to newest first
    const [statusFilter, setStatusFilter] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${URL}requests/user-requests`, {
                headers: {
                    "accessToken": localStorage.getItem("token"),
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch requests");
            }

            const data = await response.json();
            setRequests(data.requests || []);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to fetch requests. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!formData.requestType || !formData.description) {
            toast.error("Please fill in all required fields");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${URL}requests/submit-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setRequests((prevRequests) => [data.newRequest, ...prevRequests]);
                setFormData({ requestType: "", description: "" });
                toast.success("Request submitted successfully!");
            } else {
                toast.error(data.msg || "Failed to submit request");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Network error: Unable to reach server");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800 border-green-200";
            case "Rejected":
                return "bg-red-100 text-red-800 border-red-200";
            case "Pending":
            case "Pending For Admin's Approval":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Format date nicely
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Filter and sort requests
    const filteredRequests = requests
        .filter((req) => {
            const matchesSearchQuery =
                (req.requestType?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (req.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            const matchesStatusFilter = statusFilter ? req.status === statusFilter : true;
            return matchesSearchQuery && matchesStatusFilter;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortAsc ? dateA - dateB : dateB - dateA;
        });

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />
                <ToastContainer position="top-right" autoClose={5000} />

                <div className="p-6 space-y-6 mt-10">
                    <div className="p-6 space-y-6">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center  hover:shadow-xl transition-shadow">
                            <img src="/3.png" alt="ResearchX Logo" className="mx-auto w-84 h-32 object-contain" />
                            {/*  <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <h3 className="text-medium font-semibold text-gray-700">Empowering Research Through Technology</h3>*/}
                            <p className="mt-3 text-2xl font-bold ml-9 text-blue-800">Miscellaneous Requests</p>
                        </div>

                        {/* Request Form */}
                        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                New Request
                            </h2>
                            <h3 className="border-b pb-2 mt-3 mb-6"></h3>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">Request Type</label>
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
                                        <option value="Budget Revision">Budget Revision</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2" >Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded p-2"
                                        rows="3"
                                        placeholder="Describe your request..."
                                        required
                                    ></textarea>
                                    <p className="text-sm text-gray-500 mb-6">* Please ensure all fields are filled before submitting.</p>

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
                        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                    Request History
                                </h2>

                                <div className="flex flex-wrap gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search requests..."
                                            className="pl-10 w-full min-w-[200px] border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">All</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Pending For Admin's Approval">Pending For Admin's Approval</option>
                                    </select>

                                    <button
                                        onClick={() => setSortAsc(!sortAsc)}
                                        className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 transform ${sortAsc ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                        </svg>
                                        {sortAsc ? "Oldest First" : "Newest First"}
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            ) : (
                                <>
                                    {filteredRequests.length > 0 ? (
                                        <div className="overflow-x-auto -mx-4 sm:-mx-6">
                                            <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-6">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Request Type</th>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Description</th>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Date</th>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Comments</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {filteredRequests.map((req) => (
                                                            <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-4 whitespace-nowrap">
                                                                    <div className="font-medium text-gray-900">{req.requestType}</div>
                                                                    <div className="text-xs text-gray-500 mt-1">ID: {req._id.substring(0, 8)}...</div>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="text-sm text-gray-900 line-clamp-2">{req.description}</div>
                                                                </td>
                                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {formatDate(req.date)}
                                                                </td>
                                                                <td className="px-4 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(req.status)}`}>
                                                                        {req.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="text-sm text-gray-900">
                                                                        {req.comments || "-"}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h3 className="mt-4 text-sm font-medium text-gray-900">No requests found</h3>
                                            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                                                {searchQuery || statusFilter
                                                    ? "No requests match your current filters. Try adjusting your search criteria."
                                                    : "You haven't submitted any requests yet. Use the form to submit your first request."}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {filteredRequests.length > 0 && (
                                <div className="mt-4 flex justify-between items-center text-sm text-gray-500 px-4">
                                    <div>Showing {filteredRequests.length} of {requests.length} requests</div>
                                    <div className="flex items-center space-x-1">
                                        <span>Total: </span>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">{requests.length}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MiscRequest;