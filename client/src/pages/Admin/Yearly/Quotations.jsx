import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminNavbar from "../../../components/AdminNavbar";

const AdminProposalReview = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("quotations");
    const [quotations, setQuotations] = useState([]);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [schemes, setSchemes] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");

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
                const response = await fetch(`${URL}quotations/admin/get-quotations`, {
                    method: "GET",
                    headers: { accessToken: token },
                });
                const res = await fetch(`${URL}schemes/get-allschemes`, {
                    method: "GET",
                    headers: { accessToken: token },
                });
                const data = await response.json();
                const sxhmes=await res.json();
                console.log("Quotations Data:", data.quotations);
                setQuotations(data.quotations || []);
                setSchemes(sxhmes);
                console.log("Schemes Data:", schemes);

                console.log("Quotations Data:", quotations);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuotations();
    }, []);

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
                        className="px-4  py-2  border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <th className="p-3 text-center border border-gray-200" colSpan={1}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotations.map((q) => (
                                    <tr key={q._id} className="hover:bg-gray-50">
                                        <td className="p-3 border border-gray-200" onClick={() => {
                                                    setSelectedQuotation(q);
                                                    navigate(`/admin/quotations/${q._id}`);
                                                }}>{q._id}</td>
                                        <td className="p-3 border border-gray-200" onClick={() => {
                                                    setSelectedQuotation(q);
                                                    navigate(`/admin/quotations/${q._id}`);
                                                }}>{q.scheme || "N/A"}</td>
                                        <td className="p-3 border border-gray-200" onClick={() => {
                                                    setSelectedQuotation(q);
                                                    navigate(`/admin/quotations/${q._id}`);
                                                }}>{q?.Title || "N/A"}</td>
                                        
                                        <td className="p-3 text-center border border-gray-200">
                                            <button
                                                onClick={() => {
                                                    setSelectedQuotation(q);
                                                    navigate(`/admin/project/${q.projectId}`);
                                                }}
                                                className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                Go to Project Dashboard
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
    );
};

export default AdminProposalReview;
