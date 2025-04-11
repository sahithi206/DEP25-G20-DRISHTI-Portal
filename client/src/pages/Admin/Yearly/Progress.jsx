import React, { useState, useEffect } from "react";
import axios from "axios";

const url = import.meta.env.VITE_REACT_APP_URL;


const Progress = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const fetchReports = async () => {
        try {
            const response = await axios.get(`${url}/admin/progress-reports`);
            setReports(response.data.data);
        } catch (error) {
            console.error("Error fetching progress reports:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`${url}/admin/progress-reports/${id}/mark-as-read`);
            setReports(reports.filter((report) => report._id !== id));
        } catch (error) {
            console.error("Error marking report as read:", error);
        }
    };

    const viewReport = (report) => {
        setSelectedReport(report);
        setIsPopupOpen(true);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Progress Reports</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2">Project ID</th>
                        <th className="border border-gray-300 px-4 py-2">Project Title</th>
                        <th className="border border-gray-300 px-4 py-2">Current Year</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report._id}>
                            <td className="border border-gray-300 px-4 py-2">{report.projectId}</td>
                            <td className="border border-gray-300 px-4 py-2">{report.projectTitle}</td>
                            <td className="border border-gray-300 px-4 py-2">{report.currentYear}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <button
                                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                    onClick={() => viewReport(report)}
                                >
                                    View
                                </button>
                                <button
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                    onClick={() => markAsRead(report._id)}
                                >
                                    Mark as Read
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isPopupOpen && selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Progress Report Details</h2>
                        <p><strong>Project Title:</strong> {selectedReport.projectTitle}</p>
                        <p><strong>Principal Investigator:</strong> {selectedReport.principalInvestigator.join(", ")}</p>
                        <p><strong>Research Area:</strong> {selectedReport.researchArea}</p>
                        <p><strong>Approved Objectives:</strong> {selectedReport.approvedObjectives.join(", ")}</p>
                        <p><strong>Methodology:</strong> {selectedReport.methodology}</p>
                        <p><strong>Research Achievements:</strong></p>
                        <ul className="list-disc pl-6">
                            <li><strong>Summary of Progress:</strong> {selectedReport.researchAchievements.summaryOfProgress}</li>
                            <li><strong>New Observations:</strong> {selectedReport.researchAchievements.newObservations}</li>
                            <li><strong>Innovations:</strong> {selectedReport.researchAchievements.innovations}</li>
                            <li><strong>Application Potential (Long Term):</strong> {selectedReport.researchAchievements.applicationPotential.longTerm}</li>
                            <li><strong>Application Potential (Immediate):</strong> {selectedReport.researchAchievements.applicationPotential.immediate}</li>
                            <li><strong>Other Achievements:</strong> {selectedReport.researchAchievements.otherAchievements}</li>
                        </ul>
                        <button
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => setIsPopupOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Progress;