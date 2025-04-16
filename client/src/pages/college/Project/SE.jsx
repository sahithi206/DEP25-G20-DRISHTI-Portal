import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/InstituteSidebar";
import Navbar from "../../../components/Navbar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SignatureCanvas from 'react-signature-canvas';

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
    const [showStampModal, setShowStampModal] = useState(false);
    const [instituteStamp, setInstituteStamp] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [piSignature, setPiSignature] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showUploadOption, setShowUploadOption] = useState(false);
    const navigate = useNavigate();

    const stampCanvas = useRef(null);
    const fileInputRef = useRef(null);

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

    const fetchSeData = async (seId) => {
        setError("");
        setSeData(null);

        try {
            const response = await fetch(`${url}se/get-se/${seId}`, {
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
            setPiSignature(result.data.piSignature || null);
            setInstituteStamp(result.data.instituteStamp || null);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error fetching SE data:", err.message);
            setError("Failed to fetch SE data");
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Please upload only image files (PNG, JPG, JPEG)");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setInstituteStamp(event.target.result);
                setShowStampModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleApprove = async () => {
        if (!seData || !instituteStamp) return;
        setLoading(true);

        try {
            const res = await fetch(`${url}se/approve/${seData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: localStorage.getItem("token")
                },
                body: JSON.stringify({
                    instituteStamp: instituteStamp
                })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Approval failed");
            }

            const updatedPendingRequests = filteredSe.filter(req => req._id !== seData._id);
            setFilteredSe(updatedPendingRequests);

            setShowApproveModal(false);
            setShowSuccessModal(true);

            setTimeout(() => {
                setSeData(null);
                setInstituteStamp(null);
                setShowSuccessModal(false);
                setLoading(false);
                setIsModalOpen(false);
            }, 2000);
        } catch (err) {
            console.error("Error approving SE request:", err.message);
            alert("Failed to approve request");
            setLoading(false);
        }
    };

    const handleSaveAsPDF = () => {
        if (!seData) return;

        const pdf = new jsPDF("p", "mm", "a4");
        const currentDate = new Date().toLocaleDateString("en-IN");

        const pageWidth = 210;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("STATEMENT OF EXPENDITURE", pageWidth / 2, 20, { align: "center" });
        pdf.setFontSize(12);
        pdf.text(`FOR THE PERIOD: ${seData.startDate} TO ${seData.endDate}`, pageWidth / 2, 28, { align: "center" });

        let yPos = 40;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

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

        pdf.setFontSize(10);
        pdf.text("Certified that the grant of Rs. " + seData.budgetSanctioned.total + " received under the research project entitled", margin, yPos);
        pdf.text(`"${seData.name}" has been utilized for the purpose for which it was sanctioned in accordance with the`, margin, yPos + 6);
        pdf.text("terms and conditions laid down by the funding agency.", margin, yPos + 12);

        yPos += 30;
        pdf.text("Date: " + currentDate, margin, yPos);
        yPos += 20;

        pdf.text("Signature:", margin, yPos);

        if (seData.piSignature) {
            pdf.addImage(seData.piSignature, 'PNG', margin, yPos + 5, 50, 20);
            pdf.text("Principal Investigator", margin, yPos + 30);
        } else {
            pdf.text("Principal Investigator: ________________", margin, yPos + 15);
        }

        if (instituteStamp) {
            pdf.addImage(instituteStamp, 'PNG', pageWidth - 70, yPos + 5, 50, 20);
            pdf.text("Institute Stamp", pageWidth - 70, yPos + 30);
        }

        pdf.save(`SE_${seData.name}_${seData.currentYear}.pdf`);
    };
    const SignatureModal = () => {
        if (!showStampModal) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowStampModal(false)}></div>
                <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Sign here</h3>
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={toggleUploadOption}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-2"
                        >
                            {showUploadOption ? "Draw Signature" : "Upload Signature"}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileUpload}
                        />
                    </div>

                    {showUploadOption ? (
                        <div className="flex flex-col items-center">
                            <button
                                onClick={triggerFileInput}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
                            >
                                Select Image File (PNG, JPG)
                            </button>
                            {instituteStamp && (
                                <div className="mt-2 border border-gray-300 p-2 rounded">
                                    <img src={instituteStamp} alt="Uploaded signature" className="h-24 object-contain" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border border-gray-300 rounded-md mb-4">
                            <SignatureCanvas
                                ref={stampCanvas}
                                penColor="black"
                                canvasProps={{
                                    width: 500,
                                    height: 200,
                                    className: "signature-canvas w-full"
                                }}

                            />
                        </div>
                    )}

                    <div className="flex justify-between">
                        {!showUploadOption && (
                            <button
                                onClick={clearStamp}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={() => setShowStampModal(false)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveStamp}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSeData(null);
    };

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const financialYear =
        currentMonth >= 3
            ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
            : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

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

            {/* SE Details Modal */}
            {isModalOpen && seData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[70%] max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Statement of Expenditure Details</h2>

                        <div id="se-details" className="bg-white rounded-lg p-6 border-t-4 border-blue-800">
                            <h3 className="text-lg font-semibold text-blue-600 mb-4">
                                Statement of Expenditure Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">File Number</label>
                                <span className="px-3 py-1 w-full">: {seData.projectId}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                                <span className="px-3 py-1 w-full">: {seData.institute}</span>
                                <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                                <span className="px-3 py-1 w-full">: {seData.name}</span>
                                <label className="font-semibold text-gray-700">Name of the Scheme</label>
                                <span className="px-3 py-1 w-full">: {seData.scheme}</span>
                                <label className="font-semibold text-gray-700">Present Year of Project</label>
                                <span className="px-3 py-1 w-full">: {seData.currentYear}</span>
                                <label className="font-semibold text-gray-700">Total Project Cost </label>
                                <span className="px-3 py-1 w-full">: {seData.TotalCost}</span>
                                {/* <label className="font-semibold text-gray-700">Start Date of Year</label>
                                <span className="px-3 py-1 w-full">: {seData.startDate}</span>
                                <label className="font-semibold text-gray-700">End Date of Year</label>
                                <span className="px-3 py-1 w-full">: {seData.endDate}</span> */}
                            </div>

                            <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                            <ul className="list-disc pl-6 ">
                                {seData.yearlyBudget && seData.yearlyBudget.map((sanct, index) => (
                                    <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                                        <span>Year {index + 1}: {sanct}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                                <h2 className="text-center text-2xl font-bold mb-4">STATEMENT OF EXPENDITURE (FY {financialYear})</h2>
                                <h3 className="text-center text-lg font-semibold mb-4">Statement of Expenditure (to be submitted financial year wise)</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-300 rounded-lg text-sm">
                                        <thead>
                                            <tr className="bg-blue-100 text-gray-700">
                                                <th className="border border-gray-400 px-2 py-1" rowSpan="2">S/No</th>
                                                <th className="border border-gray-400 px-2 py-1" rowSpan="2">Sanctioned Heads</th>
                                                <th className="border border-gray-400 px-2 py-1" rowSpan="2">Total Funds Sanctioned</th>
                                                <th className="border border-gray-400 px-2 py-1" colSpan="3">Expenditure Incurred</th>
                                                <th className="border border-gray-400 px-2 py-1" rowSpan="2">Total Expenditure (vii=iv+v+vi)</th>
                                                <th className="border border-gray-400 px-2 py-1" rowSpan="2">Balance against sanctioned as on 31.03.{new Date().getFullYear()} (viii=iii-vii)</th>
                                                <th className="border border-gray-400 px-2 py-1" rowSpan="2">Requirement of Funds unto 31st March next year</th>
                                                <th className="border border-gray-400 px-2 py-1" rowSpan="2">Remarks (if any)</th>
                                            </tr>
                                            <tr className="bg-blue-100 text-gray-700">
                                                <th className="border border-gray-400 px-2 py-1">I Yr.</th>
                                                <th className="border border-gray-400 px-2 py-1">II Yr.</th>
                                                <th className="border border-gray-400 px-2 py-1">III Yr.</th>
                                            </tr>
                                            <tr className="bg-blue-100 text-gray-700 text-center">
                                                <th className="border border-gray-400 px-2 py-1">(i)</th>
                                                <th className="border border-gray-400 px-2 py-1">(ii)</th>
                                                <th className="border border-gray-400 px-2 py-1">(iii)</th>
                                                <th className="border border-gray-400 px-2 py-1">(iv)</th>
                                                <th className="border border-gray-400 px-2 py-1">(v)</th>
                                                <th className="border border-gray-400 px-2 py-1">(vi)</th>
                                                <th className="border border-gray-400 px-2 py-1">(vii)</th>
                                                <th className="border border-gray-400 px-2 py-1">(viii)</th>
                                                <th className="border border-gray-400 px-2 py-1"></th>
                                                <th className="border border-gray-400 px-2 py-1"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: 1, name: "Manpower Costs", key: "human_resources" },
                                                { id: 2, name: "Consumables", key: "consumables" },
                                                { id: 3, name: "Travel", key: "travel" },
                                                { id: 4, name: "Contingencies", key: "contingencies" },
                                                { id: 5, name: "Other Cost, if any", key: "others" },
                                                { id: 6, name: "Equipments", key: "nonRecurring" },
                                                { id: 7, name: "Overhead Expenses", key: "overhead" },
                                            ].map((head) => {
                                                // Calculate total expenditure for this head
                                                const year1Value = seData.human_resources && head.key === "human_resources" ? seData.human_resources[0] || 0 :
                                                    seData[head.key] ? seData[head.key][0] || 0 : 0;
                                                const year2Value = seData.human_resources && head.key === "human_resources" ? seData.human_resources[1] || 0 :
                                                    seData[head.key] ? seData[head.key][1] || 0 : 0;
                                                const year3Value = seData.human_resources && head.key === "human_resources" ? seData.human_resources[2] || 0 :
                                                    seData[head.key] ? seData[head.key][2] || 0 : 0;

                                                const totalExpValue = seData.totalExp && seData.totalExp[head.key]
                                                    ? seData.totalExp[head.key]
                                                    : (year1Value + year2Value + year3Value);

                                                const sanctionedValue = seData.budgetSanctioned && seData.budgetSanctioned[head.key]
                                                    ? seData.budgetSanctioned[head.key]
                                                    : 0;

                                                const balance = sanctionedValue - totalExpValue;

                                                // Calculate fund requirement for next year
                                                let fundRequirement = 0;
                                                if (head.key === "overhead" && seData.budgetSanctioned && seData.budgetSanctioned.overhead) {
                                                    fundRequirement = seData.budgetSanctioned.overhead * 0.3;
                                                }

                                                return (
                                                    <tr key={head.id} className="text-center">
                                                        <td className="border border-gray-400 px-2 py-1">{head.id}</td>
                                                        <td className="border border-gray-400 px-2 py-1 text-left">{head.name}</td>
                                                        <td className="border border-gray-400 px-2 py-1">{sanctionedValue}</td>
                                                        <td className="border border-gray-400 px-2 py-1">{year1Value}</td>
                                                        <td className="border border-gray-400 px-2 py-1">{year2Value}</td>
                                                        <td className="border border-gray-400 px-2 py-1">{year3Value}</td>
                                                        <td className="border border-gray-400 px-2 py-1">{totalExpValue}</td>
                                                        <td className="border border-gray-400 px-2 py-1">{balance}</td>
                                                        <td className="border border-gray-400 px-2 py-1">
                                                            {head.key === "overhead" ? fundRequirement.toFixed(0) : 0}
                                                        </td>
                                                        <td className="border border-gray-400 px-2 py-1">
                                                            {head.key === "nonRecurring" ? "Including of commitments" : ""}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="text-center font-bold">
                                                <td className="border border-gray-400 px-2 py-1">8</td>
                                                <td className="border border-gray-400 px-2 py-1 text-center">Total</td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {seData.budgetSanctioned && seData.budgetSanctioned.total ? seData.budgetSanctioned.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {seData.total ? seData.total[0] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {seData.total ? seData.total[1] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {seData.total ? seData.total[2] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {seData.totalExp && seData.totalExp.total ? seData.totalExp.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {((seData.budgetSanctioned && seData.budgetSanctioned.total) || 0) -
                                                        ((seData.totalExp && seData.totalExp.total) || 0)}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {(seData.budgetSanctioned && seData.budgetSanctioned.overhead ? seData.budgetSanctioned.overhead * 0.3 : 0).toFixed(0)}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-6">
                                    <p className="text-sm text-gray-700">
                                        <strong>Note:</strong> The audited statement of expenditure incurred under the Heads, and proper utilization of funds released during the period, may be sent to the agency immediately after the end of the financial year.
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-6 mt-6">
                                <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Principal Investigator</h4>
                                        {piSignature ? (
                                            <div className="border p-2 rounded mb-2">
                                                <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                                                <p className="text-gray-500">No signature added</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Institute Approval</h4>
                                        {instituteStamp ? (
                                            <div className="border p-2 rounded mb-2">
                                                <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                                                <p className="text-gray-500">
                                                    Institute stamp required for approval
                                                </p>
                                            </div>
                                        )}
                                        {!instituteStamp && (
                                            <button
                                                onClick={handleAddStamp}
                                                className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Add Institute Stamp
                                            </button>
                                        )}
                                    </div> */}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={handleSaveAsPDF}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Save as PDF
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                >
                                    Close
                                </button>

                                {/* <button
                                    onClick={() => setShowApproveModal(true)}
                                    disabled={!instituteStamp}
                                    className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center ${instituteStamp
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve SE
                                </button> */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stamp Upload Modal */}
            {showStampModal && (
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-xl font-semibold mb-4">Add Institute Stamp</h3>

                        <div className="mb-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={triggerFileInput}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-2"
                            >
                                Upload Stamp Image
                            </button>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowStampModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Confirmation Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowApproveModal(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-800 mt-2">Confirm Approval</h3>
                            <p className="text-gray-600 mt-1">
                                Are you sure you want to approve this Statement of Expenditure?
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-30"></div>
                    <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
                        <div className="text-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-800 mt-4">Approval Successful</h3>
                            <p className="text-gray-600 mt-1">
                                The Statement of Expenditure has been approved successfully.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SEPage;