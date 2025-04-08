import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../utils/Sidebar";
import HomeNavbar from "../../utils/HomeNavbar";



const UploadDocuments = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [schemes, setSchemes] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [comments, setComments] = useState([]);
    const [showCommentsModal, setShowCommentsModal] = useState(false);


    const [schemeFilter, setSchemeFilter] = useState("");
    const [instituteFilter, setInstituteFilter] = useState("");

    const URL = import.meta.env.VITE_REACT_APP_URL;

    const filteredQuotations = quotations.filter((q) => {
        const schemeMatch = schemeFilter ? q.scheme === schemeFilter : true;
        const instituteMatch = instituteFilter ? q.Title?.toLowerCase().includes(instituteFilter.toLowerCase()) : true;
        return schemeMatch && instituteMatch;
    });

    useEffect(() => {
        const fetchQuotations = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to view quotations.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${URL}quotations/pi/get-quotations/${id}`, {
                    method: "GET",
                    headers: { accessToken: token },
                });


                const data = await response.json();


                setQuotations(data.quotations || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotations();
    }, []);

    const fetchComments = async (quotationId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please log in to view comments.");
            return;
        }

        try {
            const res = await fetch(`${URL}quotations/comments/${quotationId}`, {
                method: "GET",
                headers: { accessToken: token },
            });

            const data = await res.json();
            setComments(data.comment);
            console.log(data.comment);
        } catch (err) {
            setError("Failed to fetch comments");
            console.error(err);
        }
    };



    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />

                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">View Quotations</h1>
                    </div>
                    <div className="grid grid-cols-2 gap-8 p-4">
                        <input
                            type="text"
                            placeholder="Filter by Title"
                            value={instituteFilter}
                            onChange={(e) => setInstituteFilter(e.target.value)}
                            className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={schemeFilter}
                            onChange={(e) => setSchemeFilter(e.target.value)}
                            className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Schemes</option>
                            {(schemes || []).map((scheme, idx) => (
                                <option key={idx} value={scheme.name}>{scheme.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        {loading ? (
                            <p className="text-gray-500 text-center">Loading Quotations...</p>
                        ) : filteredQuotations.length === 0 ? (
                            <p className="text-gray-500 text-center">No Quotations Found</p>
                        ) : (
                            <table className="w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left border border-gray-200">File. No</th>
                                        <th className="p-3 text-left border border-gray-200">Scheme</th>
                                        <th className="p-3 text-left border border-gray-200">Title</th>
                                        <th className="p-3 text-center border border-gray-200" colSpan={2}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQuotations.map((q) => (
                                        <tr key={q._id} className="hover:bg-gray-50">
                                            <td className="p-3 border border-gray-200">{q._id}</td>
                                            <td className="p-3 border border-gray-200">{q.scheme || "N/A"}</td>
                                            <td className="p-3 border border-gray-200">{q?.Title || "N/A"}</td>
                                            <td className="p-3 text-center border border-gray-200">
                                                <button
                                                    onClick={() => {
                                                        setSelectedQuotation(q);
                                                        navigate(`/viewQuotations/${q._id}`);
                                                    }}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    View Quotation
                                                </button>
                                            </td>
                                            <td className="p-3 text-center border border-gray-200">
                                                <button
                                                    onClick={async () => {
                                                        setSelectedQuotation(q);
                                                        await fetchComments(q._id);
                                                        setShowCommentsModal(true);
                                                    }}

                                                    className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    View Comments
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {showCommentsModal && selectedQuotation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                        <h2 className="text-xl font-bold mb-4">Comments for {selectedQuotation.Title}</h2>
                        <ul className="space-y-2">
                            {comments.length === 0 ? (
                                <li className="text-gray-500">No comments available.</li>
                            ) : (
                                comments.map((commentObj, idx) => (
                                    <li key={commentObj._id} className="p-2 border-b border-gray-200">
                                        {commentObj.comment}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Posted on {new Date(commentObj.createdAt).toLocaleString()}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>

                        <button
                            onClick={() => setShowCommentsModal(false)}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadDocuments;