import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminNavbar from "../../../components/AdminNavbar";
import axios from "axios";

const url = import.meta.env.VITE_REACT_APP_URL;

const Progress = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [filters, setFilters] = useState({ year: "", researchArea: "", principalInvestigator: "" });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const navigate = useNavigate();

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}admin/progress-reports`);
            setReports(response.data.data);
        } catch (error) {
            console.error("Error fetching progress reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`${url}admin/progress-reports/${id}/mark-as-read`);
            setReports(reports.filter((report) => report._id !== id));
        } catch (error) {
            console.error("Error marking report as read:", error);
        }
    };

    const viewReport = (report) => {
        setSelectedReport(report);
        setIsPopupOpen(true);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const goToProjectDashboard = (projectId) => {
        navigate(`/project-dashboard/${projectId}`);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = reports
        .filter((report) => {
            const matchesYear = filters.year ? report.currentYear === parseInt(filters.year) : true;
            const matchesResearchArea = filters.researchArea
                ? report.researchArea?.toLowerCase().includes(filters.researchArea.toLowerCase())
                : true;
            const matchesPI = filters.principalInvestigator
                ? report.principalInvestigator.some((pi) =>
                    pi.toLowerCase().includes(filters.principalInvestigator.toLowerCase())
                )
                : true;
            return matchesYear && matchesResearchArea && matchesPI;
        })
        .sort((a, b) => {
            if (sortOrder === "asc") {
                return a.currentYear - b.currentYear;
            } else {
                return b.currentYear - a.currentYear;
            }
        })
        .filter((report) =>
            report.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar activeSection="progressReports" />

            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection="Progress Reports" />

                <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Progress Reports</h1>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            Sort & Filter
                        </button>
                    </div>

                    {isFilterOpen && (
                        <div className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 mt-2 w-80 z-10 right-0">
                            <h2 className="text-lg font-bold mb-2 text-gray-800">Sort & Filter Options</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Sort By</label>
                                <select
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    value={sortOrder}
                                    onChange={handleSortChange}
                                >
                                    <option value="asc">Year (Ascending)</option>
                                    <option value="desc">Year (Descending)</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Filter by Project Title</label>
                                <input
                                    type="text"
                                    name="projectTitle"
                                    placeholder="Enter Project Title"
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Filter by Principal Investigator</label>
                                <input
                                    type="text"
                                    name="principalInvestigator"
                                    placeholder="Enter PI Name"
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    value={filters.principalInvestigator}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Filter by Year</label>
                                <input
                                    type="number"
                                    name="year"
                                    placeholder="Enter Year"
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    value={filters.year}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-1">Filter by Research Area</label>
                                <input
                                    type="text"
                                    name="researchArea"
                                    placeholder="Enter Research Area"
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                                    value={filters.researchArea}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    className="bg-gray-400 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-500"
                                    onClick={() => setIsFilterOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
                        </div>
                    ) : (
                        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-blue-500 text-white">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Project ID</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Project Title</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Principal Investigator</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Current Year</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-gray-100">
                                            <td
                                                className="border border-gray-300 px-4 py-2 text-blue-500 cursor-pointer hover:underline"
                                                onClick={() => goToProjectDashboard(report.projectId?._id || report.projectId)}
                                            >
                                                {report.projectId?._id || report.projectId || "N/A"}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">{report.projectTitle || "N/A"}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                {report.principalInvestigator.join(", ") || "N/A"}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">{report.currentYear || "N/A"}</td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                                                    onClick={() => viewReport(report)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                    onClick={() => markAsRead(report._id)}
                                                >
                                                    Mark as Read
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">
                                            No progress reports found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Progress;