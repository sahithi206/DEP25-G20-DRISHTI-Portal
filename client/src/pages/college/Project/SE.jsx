import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../../../components/InstituteSidebar";
import Navbar from "../../../components/Navbar";
import jsPDF from "jspdf";
import "jspdf-autotable";

const url = import.meta.env.VITE_REACT_APP_URL;

const SEPage = () => {
    const { projectId } = useParams();
    const [comments, setComments] = useState([]);
    const [seForms, setSeForms] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [activeSection, setActiveSection] = useState("se");
    const [error, setError] = useState("");
    const [fetchError, setFetchError] = useState("");
    const [seData, setSeData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchTitle, setSearchTitle] = useState("");
    const [filteredSe, setFilteredSe] = useState([]);
    const [statFilter, setStatFilter] = useState("");
      const [SE, setSE] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`${url}se-comments/${projectId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (!result.success) {
                    setFetchError(result.message || "Failed to fetch comments");
                    return;
                }

                setComments(result.data);
            } catch (err) {
                console.error("Error fetching comments:", err.message);
                setFetchError("Failed to fetch comments");
            }
        };

        const fetchSEForms = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${url}institute/ucforms/${projectId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        accessToken: token
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    setSeForms(data.se);
                }
            } catch (err) {
                console.error("Error fetching SE forms:", err.message);
                setFetchError("Failed to fetch SE forms");
            }
        };

        fetchSEForms();
        fetchComments();
    }, [projectId, url]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`${url}se-comments/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: localStorage.getItem("token"),
                },
                body: JSON.stringify({ projectId, comment: newComment }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                setError(result.message || "Failed to add comment");
                return;
            }

            setComments((prevComments) => [...prevComments, result.data]);
            setNewComment("");
        } catch (err) {
            console.error("Error adding comment:", err.message);
            setError("Failed to add comment");
        }
    };
        const fetchSeData = async (seId) => {
        setError("");
        setSeData(null);

        try {
            const response = await fetch(`${url}se/${seId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: localStorage.getItem("token"),
                },
            });

            const result = await response.json();
            if (!result.success) {
                setError(result.message || "Error fetching SE data");
                return;
            }

            setSeData(result.data);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error fetching SE data:", err.message);
            setError("Failed to fetch SE data");
        }
    };

    const handleSaveAsPDF = () => {
        if (!seData) return;

        const pdf = new jsPDF("p", "mm", "a4");
        const currentDate = new Date().toLocaleDateString("en-IN");

        // Set page margins
        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;

        // Title Section
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("STATEMENT OF EXPENDITURE", pageWidth / 2, 20, { align: "center" });
        pdf.setFontSize(12);
        pdf.text(`FOR THE PERIOD: ${seData.startDate} TO ${seData.endDate}`, pageWidth / 2, 28, { align: "center" });

        // Project details
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        let yPos = 40;

        pdf.text(`1. Project Title: ${seData.name}`, margin, yPos);
        yPos += 8;

        pdf.text(`2. Name of the Institution: ${seData.institute}`, margin, yPos);
        yPos += 8;

        pdf.text(`3. Funding Agency: ${seData.scheme}`, margin, yPos);
        yPos += 8;

        pdf.text(`4. Project Year: ${seData.currentYear}`, margin, yPos);
        yPos += 8;

        pdf.text(`5. Total Project Cost: Rs. ${seData.TotalCost}`, margin, yPos);
        yPos += 16;

        // Budget table
        pdf.setFont("helvetica", "bold");
        pdf.text("6. Sanctioned Budget & Expenditure", margin, yPos);
        yPos += 10;

        // Component-wise expenditure table
        const headers = [
            [
                { content: "Budget Head", colSpan: 1 },
                { content: "Sanctioned Amount (Rs)", colSpan: 1 },
                { content: "Expenditure (Rs)", colSpan: 1 },
                { content: "Balance (Rs)", colSpan: 1 }
            ]
        ];

        const data = [
            [
                "Human Resources",
                `${seData.budgetSanctioned.human_resources}`,
                `${seData.totalExp.human_resources}`,
                `${seData.balance.human_resources}`
            ],
            [
                "Consumables",
                `${seData.budgetSanctioned.consumables}`,
                `${seData.totalExp.consumables}`,
                `${seData.balance.consumables}`
            ],
            [
                "Others",
                `${seData.budgetSanctioned.others}`,
                `${seData.totalExp.others}`,
                `${seData.balance.others}`
            ],
            [
                "Non-Recurring",
                `${seData.budgetSanctioned.nonRecurring}`,
                `${seData.totalExp.nonRecurring}`,
                `${seData.balance.nonRecurring}`
            ],
            [
                "Total",
                `${seData.budgetSanctioned.total}`,
                `${seData.totalExp.total}`,
                `${seData.balance.total}`
            ]
        ];

        pdf.autoTable({
            head: headers,
            body: data,
            startY: yPos,
            theme: 'grid',
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                halign: 'center',
                valign: 'middle',
                fontSize: 9
            },
            styles: {
                fontSize: 8,
                cellPadding: 1,
                overflow: 'linebreak',
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 40 },
                2: { cellWidth: 40 },
                3: { cellWidth: 40 }
            }
        });

        yPos = pdf.lastAutoTable.finalY + 20;

        // Certification text
        pdf.setFontSize(10);
        pdf.text("Certified that the grant of Rs. " + seData.budgetSanctioned.total + " received under the research project entitled", margin, yPos);
        pdf.text(`"${seData.name}" has been utilized for the purpose for which it was sanctioned in accordance with the`, margin, yPos + 6);
        pdf.text("terms and conditions laid down by the funding agency.", margin, yPos + 12);

        yPos += 30;
        pdf.text("Date: " + currentDate, margin, yPos);
        yPos += 20;

        // Signature section
        pdf.text("Signature:", margin, yPos);

        // Add PI signature if available
        if (seData.piSignature) {
            pdf.addImage(seData.piSignature, 'PNG', margin, yPos + 5, 50, 20);
            pdf.text("Principal Investigator", margin, yPos + 30);
        } else {
            pdf.text("Principal Investigator: ________________", margin, yPos + 15);
        }

        pdf.save(`SE_${seData.name}_${seData.currentYear}.pdf`);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSeData(null);
    };

    useEffect(() => {
        let filtered = seForms;

        if (statusFilter) {
            filtered = filtered.filter((form) => form.type === statusFilter);
        }
        if (statFilter) {
            filtered = filtered.filter((form) => form.status === statFilter);
        }

        if (searchTitle) {
            filtered = filtered.filter((form) =>
                form.name?.toLowerCase().includes(searchTitle.toLowerCase()) ||
                (form.scheme?.toLowerCase().includes(searchTitle.toLowerCase()) ?? "")
            );
        }

        setFilteredSe(filtered);
    }, [statusFilter, statFilter, searchTitle, seForms]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
                <div className="p-6 space-y-6 mt-5 mr-9 ml-9 flex-grow">
                    <div className="bg-white shadow-md rounded-xl p-6 border-l-8 border-teal-600">
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Statement of Expenditure</h1>
                    </div>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
                        <div className="flex justify-between mb-4 gap-4">
                            <input
                                type="text"
                                placeholder="Search by Title or Scheme"
                                value={searchTitle}
                                onChange={(e) => setSearchTitle(e.target.value)}
                                className="flex-grow border border-gray-300 rounded-md px-4 py-2"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-4 py-2"
                            >
                                <option value="">All Types</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="annual">Annual</option>
                            </select>
                            <select
                                value={statFilter}
                                onChange={(e) => setStatFilter(e.target.value)}
                                className="border border-gray-300 rounded-md px-4 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="approvedByAdmin">Approved By Admin</option>
                                <option value="approvedByInst">Approved By Institute</option>
                                <option value="pendingAdminApproval">Pending By Admin</option>
                                <option value="rejectedByAdmin">Rejected By Admin</option>
                                <option value="pending">Pending By Institute</option>
                            </select>
                        </div>

                        {filteredSe.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">SE ID</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Principal Investigator(s)</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSe.map((se) => (
                                        <tr key={se._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {se._id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{se.name || "No Title"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {se.startDate} to {se.endDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {se.status === "approvedByAdmin" ? "Approved By Admin" : 
                                                 se.status === "approvedByInst" ? "Approved By Institute" :  
                                                 se.status === "pendingAdminApproval" ? "Pending By Admin" :
                                                 se.status === "rejectedByAdmin" ? "Rejected By Admin" : "Pending"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <button
                                                    onClick={() => fetchSeData(se._id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center">No SE forms found for this project.</p>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
                        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Statement of Expenditure Details</h2>

                        {seData ? (
                            <div id="se-details" className="bg-white rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                                <h3 className="text-lg font-semibold text-blue-600 mb-4">
                                    Statement of Expenditure Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <label className="font-semibold text-gray-700">Project Title:</label>
                                    <span className="px-3 py-1 w-full">: {seData.name}</span>

                                    <label className="font-semibold text-gray-700">Name of the Institution:</label>
                                    <span className="px-3 py-1 w-full">: {seData.institute}</span>

                                    <label className="font-semibold text-gray-700">Funding Agency/Scheme:</label>
                                    <span className="px-3 py-1 w-full">: {seData.scheme}</span>

                                    <label className="font-semibold text-gray-700">Project Year:</label>
                                    <span className="px-3 py-1 w-full">: {seData.currentYear}</span>

                                    <label className="font-semibold text-gray-700">Period of Statement:</label>
                                    <span className="px-3 py-1 w-full">: {seData.startDate} to {seData.endDate}</span>

                                    <label className="font-semibold text-gray-700">Total Project Cost:</label>
                                    <span className="px-3 py-1 w-full">: Rs. {seData.TotalCost}</span>
                                </div>

                                <h3 className="text-lg font-semibold text-blue-700 mb-4">Expenditure Summary</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-300 rounded-lg">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-700">
                                                <th className="border border-gray-400 px-4 py-2">Budget Head</th>
                                                <th className="border border-gray-400 px-4 py-2">Sanctioned Amount (Rs)</th>
                                                <th className="border border-gray-400 px-4 py-2">Expenditure (Rs)</th>
                                                <th className="border border-gray-400 px-4 py-2">Balance (Rs)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="text-center">
                                                <td className="border border-gray-400 px-4 py-2">Human Resources</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.human_resources}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.totalExp.human_resources}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.balance.human_resources}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td className="border border-gray-400 px-4 py-2">Consumables</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.consumables}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.totalExp.consumables}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.balance.consumables}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td className="border border-gray-400 px-4 py-2">Others</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.others}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.totalExp.others}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.balance.others}</td>
                                            </tr>
                                            <tr className="text-center">
                                                <td className="border border-gray-400 px-4 py-2">Non-Recurring</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.nonRecurring}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.totalExp.nonRecurring}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.balance.nonRecurring}</td>
                                            </tr>
                                            <tr className="font-bold text-center bg-gray-50">
                                                <td className="border border-gray-400 px-4 py-2">Total</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.budgetSanctioned.total}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.totalExp.total}</td>
                                                <td className="border border-gray-400 px-4 py-2">{seData.balance.total}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleSaveAsPDF}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Save as PDF
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>Loading SE data...</p>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SEPage;