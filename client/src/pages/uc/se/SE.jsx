import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SignatureCanvas from 'react-signature-canvas';


const url = import.meta.env.VITE_REACT_APP_URL;

const SEForm = () => {
    const seRef = useRef();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);;
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const { getuser } = useContext(AuthContext);
    const [yearlyBudget, setYearly] = useState([]);
    const [budgetSanctioned, setSanctioned] = useState({});
    const [yearlyExp, setYearlyExp] = useState([]);
    const [budget, setBudget] = useState([]);
    const [manpower, setManpower] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [travel, setTravel] = useState([]);
    const [overhead, setOverhead] = useState([]);
    const [total, setTotal] = useState([]);
    const [totalExp, setExp] = useState({});
    const [balance, setBalance] = useState({});
    const [others, setOthers] = useState([]);
    const [equipment, setEquipment] = useState([]);

    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [piSignature, setPiSignature] = useState(null);
    const [sentForApproval, setSentForApproval] = useState(false);
    const [instituteApproved, setInstituteApproved] = useState(false);
    const [instituteStamp, setInstituteStamp] = useState(null);
    const [authSignature, setauthSignature] = useState(null);
    const [showUploadOption, setShowUploadOption] = useState(false);
    const [sentToAdmin, setSentToAdmin] = useState(false);
    const [adminApproved, setAdminApproved] = useState(false);
    const [adminRejected, setAdminRejected] = useState(false);
    const [seRequestId, setSeRequestId] = useState(null);
    const sigCanvas = useRef(null);
    const fileInputRef = useRef(null);

    const [data, setData] = useState({
        name: "",
        projectId: "",
        endDate: "",
        startDate: "",
        institute: "",
        title: "",
        scheme: "",
        currentYear: "",
        TotalCost: 0
    });
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getProject } = useContext(AuthContext);
    useEffect(() => {
        const fetchStatus = async () => {
            if (id) {
                try {
                    const res = await fetch(`${url}se/latest?projectId=${id}`);
                    console.log("RESSSS:", res);
                    if (!res.ok) {
                        if (res.status === 404) {
                            console.warn("No SE found for this project");
                            setSentForApproval(false);
                            return;
                        }
                        throw new Error(`Failed to fetch SE status: ${res.status} ${res.statusText}`);
                    }

                    const data = await res.json();
                    if (data.success && data.data) {
                        const se = data.data;
                        setSentForApproval(true);
                        setPiSignature(se.piSignature || null);
                        setInstituteStamp(se.instituteStamp || null);
                        setauthSignature(se.authSignature);
                        setSeRequestId(se._id);
                        if (se.status === "approvedByInst") {
                            setInstituteApproved(true);
                        }
                        else if (se.status === "pendingAdminApproval") {
                            setInstituteApproved(true);
                            setSentToAdmin(true);
                        } else if (se.status === "approvedByAdmin") {
                            setInstituteApproved(true);
                            setSentToAdmin(true);
                            setAdminApproved(true);
                        } else if (se.status === "rejectedByAdmin") {
                            setInstituteApproved(true);
                            setSentToAdmin(true);
                            setAdminRejected(true);
                        }
                        else {
                            setInstituteApproved(false);
                        }
                    } else {
                        setSentForApproval(false);
                        setPiSignature(null);
                        setInstituteStamp(null);
                    }
                } catch (err) {
                    console.error("Error fetching SE approval status:", err);
                    setError("Failed to fetch SE approval status. Please try again later.");
                }
            }
        };
        fetchStatus();
    }, [id]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const json = await getProject(id);
                const info = json?.data || {};
                setYearlyExp(info.yearlyExp || []);

                const today = new Date().toISOString().split("T")[0];
                const formattedStartDate = info.project?.startDate
                    ? new Date(info.project.startDate).toLocaleDateString("en-GB")
                    : "NA";
                const formattedEndDate = today
                    ? new Date(today).toLocaleDateString("en-GB")
                    : "NA";

                setData(prevData => ({
                    ...prevData,
                    projectId: info.project?._id || "",
                    name: info.generalInfo?.name || "NA",
                    institute: info.generalInfo?.instituteName || "NA",
                    title: info.project?.Title || "NA",
                    scheme: info.project?.Scheme.name || "NA",
                    currentYear: info.project?.currentYear || "NA",
                    TotalCost: info.project?.TotalCost || 0,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                }));
                if (info.project?.budgetTotal) {
                    setSanctioned({
                        "human_resources": info.project.budgetTotal?.recurring?.human_resources,
                        "consumables": info.project.budgetTotal?.recurring?.consumables,
                        "others": info.project.budgetTotal?.recurring?.others,
                        "nonRecurring": info.project.budgetTotal?.nonRecurring,
                        "overhead": info.project.budgetTotal?.overhead,
                        "travel": info.project.budgetTotal?.recurring?.travel,
                        "total": info.project.budgetTotal?.total
                    });

                }
                setYearly(info.yearlySanct || []);
                setBudget(info.yearlyExp || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);

    useEffect(() => {
        if (!budget || !yearlyExp) return;

        let manpowerExp = 0, consumablesExp = 0, othersExp = 0, equipmentExp = 0, totalExp = 0;
        let manpowerArray = [], consumablesArray = [], othersArray = [], equipmentArray = [], totalArray = [], travelArray = [], overheadArray = [];
        let travelExp = 0, overheadExp = 0;
        yearlyExp.forEach((yearData, index) => {
            if (yearData?.recurring?.human_resources !== undefined) {
                manpowerExp += yearData.recurring.human_resources;
                manpowerArray.push(yearData.recurring.human_resources);
            }
            if (yearData?.recurring?.consumables !== undefined) {
                consumablesExp += yearData.recurring.consumables;
                consumablesArray.push(yearData.recurring.consumables);
            }
            if (yearData?.recurring?.others !== undefined) {
                othersExp += yearData.recurring.others;
                othersArray.push(yearData.recurring.others);
            }
            if (yearData?.recurring?.travel !== undefined) {
                travelExp += yearData.recurring.travel;
                travelArray.push(yearData.recurring.travel);
            }
            if (yearData?.nonRecurring !== undefined) {
                equipmentExp += yearData.nonRecurring;
                equipmentArray.push(yearData.nonRecurring);
            }
            if (yearData?.overhead !== undefined) {
                overheadExp += yearData.overhead;
                overheadArray.push(yearData.overhead);
            }
            if (yearData?.yearTotal !== undefined) {
                totalExp += yearData.yearTotal;
                totalArray.push(yearData.yearTotal);
            }
        });

        setManpower(manpowerArray);
        setConsumables(consumablesArray);
        setOthers(othersArray);
        setEquipment(equipmentArray);
        setTotal(totalArray);
        setTravel(travelArray);
        setOverhead(overheadArray);

        setExp({
            human_resources: manpowerExp,
            consumables: consumablesExp,
            others: othersExp,
            nonRecurring: equipmentExp,
            total: totalExp,
            travel: travelExp,
            overhead: overheadExp,
        });

        setBalance({
            human_resources: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.human_resources || 0), 0) - manpowerExp,
            consumables: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.consumables || 0), 0) - consumablesExp,
            others: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.others || 0), 0) - othersExp,
            nonRecurring: yearlyBudget.reduce((acc, val, i) => acc + (val?.nonRecurring || 0), 0) - equipmentExp,
            total: yearlyBudget.reduce((acc, val) => acc + (val?.yearTotal || 0), 0) - totalExp,
            travel: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.travel || 0), 0) - travelExp,
            overhead: yearlyBudget.reduce((acc, val, i) => acc + (val?.overhead || 0), 0) - overheadExp,
        });
    }, [yearlyExp]);

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
            setPiSignature(null);
        }
    };

    const saveSignature = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const signatureDataUrl = sigCanvas.current.toDataURL();
            setPiSignature(signatureDataUrl);
            setShowSignatureModal(false);
        } else {
            setError("Please provide a signature before saving");
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
                setPiSignature(event.target.result);
                setShowSignatureModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleUploadOption = () => {
        setShowUploadOption(!showUploadOption);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const ApprovalStatusBanner = () => {
        if (!sentForApproval) {
            return (
                <div className="rounded-lg p-4 mb-6 bg-gray-100">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-gray-800">
                            SE has not been sent for approval yet.
                        </span>
                    </div>
                </div>
            );
        }

        if (instituteApproved && sentToAdmin && !adminApproved && !adminRejected) {
            return (
                <div className="rounded-lg p-4 mb-6 bg-blue-100">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-blue-800">
                            SE has been sent to Admin for final approval.
                        </span>
                    </div>
                </div>
            );
        }

        if (instituteApproved && !sentToAdmin) {
            return (
                <div className="rounded-lg p-4 mb-6 bg-green-100">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-green-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-green-800">
                            Approved by Institute on {new Date().toLocaleDateString()}.
                        </span>
                    </div>
                </div>
            );
        }
        if (adminRejected) {
            return (
                <div className="rounded-lg p-4 mb-6 bg-red-100">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-red-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-red-800">
                            Rejected by Admin on {new Date().toLocaleDateString()}.
                        </span>
                    </div>
                </div>
            );
        }
        if (adminApproved) {
            return (
                <div className="rounded-lg p-4 mb-6 bg-green-100">
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-green-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-green-800">
                            Approved by Admin on {new Date().toLocaleDateString()}.
                        </span>
                    </div>
                </div>
            );
        }
    }

    const SignatureModal = () => {
        if (!showSignatureModal) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowSignatureModal(false)}></div>
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
                            {piSignature && (
                                <div className="mt-2 border border-gray-300 p-2 rounded">
                                    <img src={piSignature} alt="Uploaded signature" className="h-24 object-contain" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border border-gray-300 rounded-md mb-4">
                            <SignatureCanvas
                                ref={sigCanvas}
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
                                onClick={clearSignature}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={() => setShowSignatureModal(false)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveSignature}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Save Signature
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const SuccessPopup = () => {
        if (!showSuccessPopup) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowSuccessPopup(false)}></div>
                <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-green-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Success!</h3>
                    <p className="text-center text-gray-600">
                        Your Utilization Certificate has been sent for Institute approval.
                    </p>
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => setShowSuccessPopup(false)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const sendSEToAdmin = async () => {
        try {
            const response = await fetch(`${url}se/send-to-admin/${seRequestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: localStorage.getItem("token"),
                },
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.message || "Failed to send SE to admin");
                return;
            }

            alert("SE sent to admin for approval");
            setSentToAdmin(true);
        } catch (err) {
            console.error("Error sending SE to admin:", err.message);
            alert("Failed to send SE to admin");
        }
    };

    const handleChange = (e) => {
        setData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
    };

    const handleSend = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication required.");
            return;
        }
        try {
            if (!piSignature) {
                setError("PI signature is required before sending for approval");
                return;
            }

            console.log("Sending SE Payload:", {
                data, yearlyBudget, budgetSanctioned, manpower, consumables,
                others, equipment, total, totalExp, balance
            });

            const response = await fetch(`${url}projects/se`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": `${token}`,
                },
                body: JSON.stringify({
                    data: data,
                    yearlyBudget: yearlyBudget,
                    budgetSanctioned: budgetSanctioned,
                    manpower: manpower,
                    consumables: consumables,
                    others: others,
                    equipment: equipment,
                    total: total,
                    totalExp: totalExp,
                    balance: balance,
                    piSignature: piSignature
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Server response:", result);
                throw new Error(`Submission failed: ${response.status} ${response.statusText}`);
            }

            if (!result.success) {
                setError(result.message || "Failed to send for approval");
                return;
            }

            setSeRequestId(result.id);
            setShowSuccessPopup(true);
            setSentForApproval(true);

            setTimeout(() => {
                setShowSuccessPopup(false);
            }, 3000);

        } catch (error) {
            console.error("Error:", error);
            alert(`Error in submitting data: ${error.message}`);
        }
    };

    const handleSaveAsPDF = () => {
        const margin = 10;
        const doc = new jsPDF({
            orientation: "l",
            unit: "mm",
            format: [400, 300], 
          });
          

        doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("RESEARCHX", 148.5, 10, { align: "center" });
            doc.setFontSize(14);
            doc.setFont("helvetica");
            doc.text("STATEMENT OF EXPENDITURE", 148.5, 15, { align: "center" });

            doc.setFontSize(12);
            doc.text("Request for Annual Installment with Up-to-Date Statement of Expenditure", 148.5, 25, { align: "center" });
            doc.text(`For Financial Year: ${financialYear}`, 148.5, 30, { align: "center" });

            doc.setFontSize(10);
            doc.text(`1. File No.: ${data.projectId || "NA"}`, 10, 35);
            doc.text(`2. Name of the PI: ${data.name || "NA"}`, 10, 40);
            doc.text(`3. Name of the grant receiving Organization: ${data.institute || "NA"}`, 10, 45);
            doc.text(`4. Name of the Scheme: ${data.scheme || "NA"}`, 10, 50);
            doc.text(`5. Present Year of Project: ${data.currentYear || "NA"}`, 10, 55);
            doc.text(`6. Total Project Cost: ${data.TotalCost || "NA"}`, 10, 60);
            doc.text(`7. Start Date of Year: ${data.startDate || "NA"}`, 10, 65);
            doc.text(`8. End Date of Year: ${data.endDate || "NA"}`, 10, 70);

            doc.text("Grant Received in Each Year:", 10, 80);
            yearlyBudget.forEach((amount, index) => {
                doc.text(`Year ${index + 1}: ${amount}`, 15, 85 + index * 5);
            });

            const headers = [
                [
                    { content: "S/No", rowSpan: 2 },
                    { content: "Sanctioned Heads", rowSpan: 2 },
                    { content: "Total Funds Sanctioned", rowSpan: 2 },
                    { content: "Expenditure Incurred", colSpan: 3 },
                    { content: "Total Expenditure (vii=iv+v+vi)", rowSpan: 2 },
                    { content: `Balance against sanctioned as on 31.03.${new Date().getFullYear()} (viii=iii-vii)`, rowSpan: 2 },
                    { content: "Requirement of Funds unto 31st March next year", rowSpan: 2 },
                    { content: "Remarks (if any)", rowSpan: 2 }
                ],
                [
                    "", "", "",
                    { content: "I Yr." },
                    { content: "II Yr." },
                    { content: "III Yr." },
                    "", "", "", "" 
                ],
                [
                    { content: "(i)" },
                    { content: "(ii)" },
                    { content: "(iii)" },
                    { content: "(iv)" },
                    { content: "(v)" },
                    { content: "(vi)" },
                    { content: "(vii)" },
                    { content: "(viii)" },
                    { content: "" },
                    { content: "" }
                ]
            ];

            const tableData = [
                { id: 1, name: "Manpower Costs", key: "human_resources" },
                { id: 2, name: "Consumables", key: "consumables" },
                { id: 3, name: "Travel", key: "travel" },
                { id: 4, name: "Contingencies", key: "contingencies" },
                { id: 5, name: "Other Cost, if any", key: "others" },
                { id: 6, name: "Equipments", key: "nonRecurring" },
                { id: 7, name: "Overhead Expenses", key: "overhead" },
            ].map((head) => {
                const totalExpenditure = yearlyExp.reduce(
                    (acc, val) => acc + (val?.recurring?.[head.key] || val?.[head.key] || 0), 
                    0
                );
                const balance = (budgetSanctioned[head.key] || 0) - totalExpenditure;
                const requirementNextYear = head.key === "overhead" ? 
                    (budgetSanctioned[head.key] * 0.3 || 0).toFixed(0) : 0;
                const remarks = head.key === "nonRecurring" ? "Including of commitments" : "";
                
                return [
                    head.id,
                    head.name,
                    budgetSanctioned[head.key] || 0,
                    yearlyExp[0]?.recurring?.[head.key] || yearlyExp[0]?.[head.key] || 0,
                    yearlyExp[1]?.recurring?.[head.key] || yearlyExp[1]?.[head.key] || 0,
                    yearlyExp[2]?.recurring?.[head.key] || yearlyExp[2]?.[head.key] || 0,
                    totalExpenditure,
                    balance,
                    requirementNextYear,
                    remarks
                ];
            });

            const totalExpenditure = yearlyExp.reduce((acc, val) => acc + (val?.yearTotal || 0), 0);
            const totalBalance = (budgetSanctioned.total || 0) - totalExpenditure;
            const totalRequirementNextYear = (budgetSanctioned.overhead * 0.3 || 0).toFixed(0);

            tableData.push([
                8,
                "Total",
                budgetSanctioned.total || 0,
                yearlyExp[0]?.yearTotal || 0,
                yearlyExp[1]?.yearTotal || 0,
                yearlyExp[2]?.yearTotal || 0,
                totalExpenditure,
                totalBalance,
                totalRequirementNextYear,
                ""
            ]);

            doc.autoTable({
                head: headers,
                body: tableData,
                startY: 100,
                theme: "grid",
                styles: { fontSize: 8, textColor: [50, 50, 50] },
                headStyles: { fillColor: [220, 230, 241], textColor: [0, 0, 0], fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 30 },  
                    2: { cellWidth: 20 },  
                    3: { cellWidth: 15 },  
                    4: { cellWidth: 15 },  
                    5: { cellWidth: 15 },  
                    6: { cellWidth: 20 },  
                    7: { cellWidth: 20 },  
                    8: { cellWidth: 20 },  
                    9: { cellWidth: 25 },  
                },
                didParseCell: function (data) {
                    if (data.section === 'head') {
                        data.cell.styles.fillColor = [220, 230, 241];
                        data.cell.styles.textColor = [0, 0, 0];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.section === 'body' && data.row.index === tableData.length - 1) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            const note = `
        Note:
        1. The audited statement of expenditure incurred under the Heads, and proper utilization of funds released during the period, 
        may be sent to agency immediately after the end of the financial year.
        `;
        doc.setFontSize(10);
        let yPos = doc.lastAutoTable.finalY + 10;
        doc.text(note, margin, yPos);

        yPos += 30;

        if (piSignature) {
            doc.addImage(piSignature, 'PNG', margin, yPos, 50, 20);
            doc.text("Signature of PI", margin, yPos + 25);
        } else {
            doc.text("Signature of PI: ________________", margin, yPos + 10);
        }

        if (instituteApproved && authSignature) {
            doc.addImage(authSignature, 'PNG', margin + 40, yPos, 50, 20);
            doc.text("Accounts Officer Signature", margin + 40, yPos + 25);
        }

        if (instituteApproved && instituteStamp) {
            doc.addImage(instituteStamp, 'PNG', margin + 100, yPos, 50, 20);
            doc.text("Institute Stamp & Signature", margin + 100, yPos + 25);
        }

        const currentYear = data?.currentYear || "unknown_year";
        doc.save(`SE_${id}_${currentYear}.pdf`);
    };

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const financialYear =
        currentMonth >= 3
            ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
            : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Request for Annual Installment with Up-to-Date Statement of Expenditure</p>
                    </div>

                    <ApprovalStatusBanner />

                    <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">File Number</label>
                            <span className="px-3 py-1 w-full">: {data.projectId}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                            <span className="px-3 py-1 w-full">: {data.institute}</span>
                            <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                            <span className="px-3 py-1 w-full">: {data.name}</span>
                            <label className="font-semibold text-gray-700">Name of the Scheme</label>
                            <span className="px-3 py-1 w-full">: {data.scheme}</span>
                            <label className="font-semibold text-gray-700">Present Year of Project</label>
                            <span className="px-3 py-1 w-full">: {data.currentYear}</span>
                            <label className="font-semibold text-gray-700">Total Project Cost </label>
                            <span className="px-3 py-1 w-full">: {data.TotalCost}</span>
                            <label className="font-semibold text-gray-700">Start Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.startDate}</span>
                            <label className="font-semibold text-gray-700">End Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.endDate}</span>
                        </div>

                        <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                        <ul className="list-disc pl-6 ">
                            {yearlyBudget && yearlyBudget.map((sanct, index) => (
                                <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                                    <span>Year {index + 1}: {sanct}</span>
                                </li>
                            ))}
                        </ul>


                        <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                            <h2 className="text-center text-2xl font-bold mb-4">STATEMENT OF EXPENDITURE (FY {financialYear})</h2>
                            <h3 className="text-center text-lg font-semibold mb-4">Statement of Expenditure (to be submitted financial year wise )</h3>
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
                                        ].map((head) => (
                                            <tr key={head.id} className="text-center">
                                                <td className="border border-gray-400 px-2 py-1">{head.id}</td>
                                                <td className="border border-gray-400 px-2 py-1 text-left">{head.name}</td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {budgetSanctioned[head.key] || 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {yearlyExp[0]?.recurring?.[head.key] || yearlyExp[0]?.[head.key] || 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {yearlyExp[1]?.recurring?.[head.key] || yearlyExp[1]?.[head.key] || 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {yearlyExp[2]?.recurring?.[head.key] || yearlyExp[2]?.[head.key] || 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {yearlyExp.reduce((acc, val) => acc + (val?.recurring?.[head.key] || val?.[head.key] || 0), 0)}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {(budgetSanctioned[head.key] || 0) - 
                                                        yearlyExp.reduce((acc, val) => acc + (val?.recurring?.[head.key] || val?.[head.key] || 0), 0)}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {head.key === "overhead" ? (budgetSanctioned[head.key] * 0.3 || 0).toFixed(0) : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {head.key === "nonRecurring" ? "Including of commitments" : ""}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="text-center font-bold">
                                            <td className="border border-gray-400 px-2 py-1">8</td>
                                            <td className="border border-gray-400 px-2 py-1 text-center">Total</td>
                                            <td className="border border-gray-400 px-2 py-1">
                                                {budgetSanctioned.total || 0}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1">
                                                {yearlyExp[0]?.yearTotal || 0}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1">
                                                {yearlyExp[1]?.yearTotal || 0}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1">
                                                {yearlyExp[2]?.yearTotal || 0}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1">
                                                {yearlyExp.reduce((acc, val) => acc + (val?.yearTotal || 0), 0)}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1">
                                                {(budgetSanctioned.total || 0) - 
                                                    yearlyExp.reduce((acc, val) => acc + (val?.yearTotal || 0), 0)}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1">
                                                {(budgetSanctioned.overhead * 0.3 || 0).toFixed(0)}
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

                        {/* Signature Section */}
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                                    {!sentForApproval && (
                                        <button
                                            onClick={() => setShowSignatureModal(true)}
                                            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={instituteApproved}
                                        >
                                            {piSignature ? "Change Signature" : "Add Signature"}
                                        </button>
                                    )}
                                </div>

                                <div className="border p-4 rounded-lg">

                                    <h4 className="font-medium  mb-1"> Accounts Officer Signature</h4>
                                    {instituteApproved && authSignature ? (
                                        <div className="border p-2 rounded mb-2">
                                            <img src={authSignature} alt="AO Sign" className="h-24 object-contain" />
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                                            <p className="text-gray-500">
                                                {sentForApproval ? "Awaiting approval" : "Not sent for approval yet"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Institute Approval</h4>
                                    {instituteApproved && instituteStamp ? (
                                        <div className="border p-2 rounded mb-2">
                                            <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-gray-300 p-4 rounded flex justify-center items-center h-24 mb-2">
                                            <p className="text-gray-500">
                                                {sentForApproval ? "Awaiting approval" : "Not sent for approval yet"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleSaveAsPDF}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Save as PDF
                            </button>

                            {!sentForApproval && (
                                <button
                                    onClick={handleSend}
                                    disabled={!piSignature}
                                    className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center ${piSignature
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Send for Approval
                                </button>

                            )}

                            {instituteApproved && !sentToAdmin && seRequestId && (
                                <button
                                    onClick={sendSEToAdmin}
                                    className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center ${piSignature
                                        ? "bg-green-600 text-white hover:bg-green-700"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                                >
                                    Send to Admin
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <SignatureModal />
            <SuccessPopup />
        </div>
    );
};

export default SEForm;