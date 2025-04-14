import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";

const url = import.meta.env.VITE_REACT_APP_URL;

export default function Report() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const { getReports } = useContext(AuthContext);

    useEffect(() => {
        const fetchReports = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${url}projects/progress-report/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-type": "application/json",
                        accessToken: token,
                    },
                });
                const fetchedReports = await res.json();
                setReports(fetchedReports.data || []);
                setFilteredReports(fetchedReports.data || []);
            } catch (error) {
                console.error("Error fetching reports:", error.message);
            }
        };
        fetchReports();
    }, [id, getReports]);

    useEffect(() => {
        let filtered = reports;

        if (searchTerm) {
            filtered = filtered.filter(
                (report) => report.projectId.years.toString() === searchTerm
            );
        }

        if (filterType) {
            filtered = filtered.filter((report) => report.type === filterType);
        }

        if (sortOrder) {
            filtered = [...filtered].sort((a, b) => {
                const dateA = new Date(a.dateOfCompletion);
                const dateB = new Date(b.dateOfCompletion);
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            });
        }

        setFilteredReports(filtered);
    }, [searchTerm, filterType, sortOrder, reports]);

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div
                className={`flex flex-col transition-all duration-300 ${
                    isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"
                }`}
            >
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Reports</h1>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                       <div className="flex-grow">
                       <input
                            type="text"
                            placeholder="Search by Year"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                       </div>
                        <div className="flex justify-end gap-3">
                            <select
                            value={filterType || ""}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Filter by Type</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Final">Final</option>
                        </select>
                        <select
                            value={sortOrder || ""}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sort by Date</option>
                            <option value="asc">Oldest First</option>
                            <option value="desc">Newest First</option>
                        </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm bg-white rounded-lg shadow-md overflow-hidden">
                                <thead className="bg-blue-800">
                                    <tr>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">
                                            Report ID
                                        </th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">
                                            Title
                                        </th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">
                                            Type
                                        </th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">
                                            Date
                                        </th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">
                                            Year
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.length > 0 ? (
                                        filteredReports.map((report) => (
                                            <tr
                                                key={report._id}
                                                className="hover:bg-blue-50 transition-colors border-b border-blue-200 last:border-b-0"
                                            >
                                                <td
                                                    className="p-4 text-center text-sm text-blue-600 underline"
                                                    onClick={() => navigate(`/report/${report._id}`)}
                                                >
                                                    {report._id}
                                                </td>
                                                <td className="p-4 text-center text-sm text-gray-600">
                                                    {report.projectTitle}
                                                </td>
                                                <td className="p-4 text-center text-sm text-gray-600">
                                                    {report.type}
                                                </td>
                                                <td className="p-4 text-center text-sm text-gray-600">
                                                    {new Date(report.dateOfStart).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-center text-sm text-gray-600">
                                                    {report.projectId.years}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-gray-500">
                                                No Reports Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
