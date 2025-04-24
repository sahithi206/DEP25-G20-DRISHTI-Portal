import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
// import {default as jwtDecode} from "jwt-decode";

const url = import.meta.env.VITE_REACT_APP_URL;

const ViewDocs = () => {
    const [activeSection, setActiveSection] = useState("ongoing");
    const [error, setError] = useState("");
    const [pendingUCs, setPendingUCs] = useState([]);
    const [pendingSEs, setPendingSEs] = useState([]);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCertificateOpen, setIsCertificateOpen] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const [isUCCertificateOpen, setIsUCCertificateOpen] = useState(false);
    const [ucData, setUCData] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const [piSignature, setPiSignature] = useState(null);
    const [instituteStamp, setInstituteStamp] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [user, setUser] = useState();
    const [comment, setComment] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();

    const [sortOrder, setSortOrder] = useState("asc");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const fetchPendingUCs = async () => {
        try {
            const response = await fetch(`${url}admin/ucforms/approved/${id}?t=${Date.now()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            console.log("Fetched Pending UCs:", data);

            if (!data.success || !data.data || data.data.length === 0) {
                setError("No pending UCs found for admin approval");
                setPendingUCs([]);
                return;
            }

            setPendingUCs(data.data);
            setUser(data.user);

        } catch (error) {
            console.error("Error fetching pending UCs:", error);
            setError("Internal Server Error");
        }
    };

    const fetchPendingSEs = async () => {
        try {
            const response = await fetch(`${url}admin/seforms/approved/${id}?t=${Date.now()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            console.log("Fetched Pending SEs:", data);

            if (!data.success || !data.data || data.data.length === 0) {
                setError("No pending SEs found for admin approval");
                setPendingSEs([]);
                return;
            }

            setPendingSEs(data.data);
            setUser(data.user);

        } catch (error) {
            console.error("Error fetching pending SEs:", error);
            setError("Internal Server Error");
        }
    };

    useEffect(() => {
        fetchPendingUCs();
        fetchPendingSEs();
    }, [id]);

    const sortedAndFilteredUCs = pendingUCs
        .filter((uc) => {
            const submissionDate = new Date(uc.submissionDate);
            const startDate = filterStartDate ? new Date(filterStartDate) : null;
            const endDate = filterEndDate ? new Date(filterEndDate) : null;

            return (
                (!startDate || submissionDate >= startDate) &&
                (!endDate || submissionDate <= endDate)
            );
        })
        .sort((a, b) => {
            if (sortOrder === "asc") {
                return new Date(a.submissionDate) - new Date(b.submissionDate);
            } else {
                return new Date(b.submissionDate) - new Date(a.submissionDate);
            }
        });

    const sortedAndFilteredSEs = pendingSEs
        .filter((se) => {
            const submissionDate = new Date(se.date);
            const startDate = filterStartDate ? new Date(filterStartDate) : null;
            const endDate = filterEndDate ? new Date(filterEndDate) : null;

            return (
                (!startDate || submissionDate >= startDate) &&
                (!endDate || submissionDate <= endDate)
            );
        })
        .sort((a, b) => {
            if (sortOrder === "asc") {
                return new Date(a.submissionDate) - new Date(b.submissionDate);
            } else {
                return new Date(b.submissionDate) - new Date(a.submissionDate);
            }
        });

    const handleViewCertificate = async (certificate) => {
        try {
            const response = await fetch(`${url}admin/ucforms/view/${certificate._id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            console.log("datusysapoikldjh:", data);

            if (!data.success) {
                alert("Failed to fetch certificate details.");
                return;
            }

            setIsUCCertificateOpen(true);
            setPiSignature(data.data.piSignature)
            setInstituteStamp(data.data.instituteStamp)
            setSelectedType(data.data.type)
            setUCData(data.data.ucData);

        } catch (error) {
            console.error("Error fetching certificate details:", error);
            alert("Error fetching certificate details.");
        }
    };

    const handleViewSE = async (se) => {
        try {
            const response = await fetch(`${url}admin/view-by-se/${se._id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            if (!data.success) {
                alert("Failed to fetch SE details.");
                return;
            }

            setCertificateData(data.data);
            setIsCertificateOpen(true);
        } catch (error) {
            console.error("Error fetching SE details:", error);
            alert("Error fetching SE details.");
        }
    };

    const openCommentModal = (certificate) => {
        setSelectedCertificate(certificate);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setComment("");
    };

    const closeCertificateModal = () => {
        setIsCertificateOpen(false);
        setCertificateData(null);
    };



    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />
                <div className="p-6 space-y-1 mt-3">
                    <div key={reloadKey} className="mt-3 bg-white p-7 rounded-lg shadow-md">
                        <div>
                            <div className="flex justofy-end items-center space-x-4 bg-gray-100 p-4 rounded-lg shadow-md">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={filterStartDate}
                                        onChange={(e) => setFilterStartDate(e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={filterEndDate}
                                        onChange={(e) => setFilterEndDate(e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="p-2 border rounded"
                                    >
                                        <option value="asc">Date (Ascending)</option>
                                        <option value="desc">Date (Descending)</option>
                                    </select>
                                </div>
                            </div>
                            <h2 className="text-lg font-bold mb-4">Approved UCs</h2>

                            <table className="w-full border table-fixed">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-4 text-left w-1/4">Certificate ID</th>
                                        <th className="p-4 text-left w-1/4">Type</th>
                                        <th className="p-4 text-left w-1/4">Submission Date</th>
                                        <th className="p-4 text-center w-1/4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedAndFilteredUCs.length > 0 ? (
                                        sortedAndFilteredUCs.map((certificate) => (
                                            <tr key={certificate._id} className="border-b hover:bg-blue-50">
                                                <td
                                                    className="p-4 w-1/4 cursor-pointer text-gray-500 hover:underline"
                                                    onClick={() => handleViewCertificate(certificate)}
                                                >
                                                    {certificate._id}
                                                </td>
                                                <td className="p-4 w-1/4">{certificate.type}</td>
                                                <td className="p-4 w-1/4">
                                                    {new Date(certificate.submissionDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 w-1/4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                            onClick={() => handleViewCertificate(certificate)}
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-6 text-center text-gray-500">
                                                No Approved UCs Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <h2 className="text-lg font-bold mt-8 mb-4">Approved SEs</h2>
                            <table className="w-full border table-fixed">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="p-4 text-left w-1/4">Certificate ID</th>
                                        <th className="p-4 text-left w-1/4">Type</th>
                                        <th className="p-4 text-left w-1/4">Submission Date</th>
                                        <th className="p-4 text-center w-1/4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedAndFilteredSEs.length > 0 ? (
                                        sortedAndFilteredSEs.map((se) => (
                                            <tr key={se._id} className="border-b hover:bg-blue-50">
                                                <td className="p-4 w-1/4">{se._id}</td>
                                                <td className="p-4 w-1/4">SE</td>
                                                <td className="p-4 w-1/4">{new Date(se.date).toLocaleDateString()}</td>
                                                <td className="p-4 w-1/4 text-center">
                                                    <button
                                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                                                        onClick={() => handleViewSE(se)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-6 text-center text-gray-500">
                                                No Approved SEs Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {isCertificateOpen && certificateData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto p-6">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                            <p className="mt-3 text-2xl font-bold text-blue-800">
                                Request for Annual Installment with Up-to-Date Statement of Expenditure
                            </p>
                        </div>

                        <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">File Number</label>
                                <span className="px-3 py-1 w-full">: {certificateData.projectId}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">Name of the Grant Receiving Organization</label>
                                <span className="px-3 py-1 w-full">: {certificateData.institute}</span>
                                <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                                <span className="px-3 py-1 w-full">: {certificateData.name}</span>
                                <label className="font-semibold text-gray-700">Name of the Scheme</label>
                                <span className="px-3 py-1 w-full">: {certificateData.scheme}</span>
                                <label className="font-semibold text-gray-700">Present Year of Project</label>
                                <span className="px-3 py-1 w-full">: {certificateData.currentYear}</span>
                                <label className="font-semibold text-gray-700">Total Project Cost</label>
                                <span className="px-3 py-1 w-full">: {certificateData.TotalCost}</span>
                                {/* <label className="font-semibold text-gray-700">Start Date of Year</label>
                                <span className="px-3 py-1 w-full">: {certificateData.startDate}</span>
                                <label className="font-semibold text-gray-700">End Date of Year</label>
                                <span className="px-3 py-1 w-full">: {certificateData.endDate}</span> */}
                            </div>

                            <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                            <ul className="list-disc pl-6">
                                {certificateData.yearlyBudget &&
                                    certificateData.yearlyBudget.map((sanct, index) => (
                                        <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                                            <span>Year {index + 1}: {sanct}</span>
                                        </li>
                                    ))}
                            </ul>

                            <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                                <h2 className="text-center text-2xl font-bold mb-4">Statement of Expenditure</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-300 rounded-lg text-sm">
                                        <thead>
                                            <tr className="bg-blue-100 text-gray-700">
                                                <th className="border border-gray-400 px-4 py-2">S/N</th>
                                                <th className="border border-gray-400 px-4 py-2">Sanctioned Heads</th>
                                                <th className="border border-gray-400 px-4 py-2">Total Funds Sanctioned</th>
                                                <th className="border border-gray-400 px-4 py-2">Expenditure Incurred</th>
                                                <th className="border border-gray-400 px-4 py-2">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { name: "Manpower Costs", key: "human_resources" },
                                                { name: "Consumables", key: "consumables" },
                                                { name: "Travel", key: "travel" },
                                                { name: "Other Costs", key: "others" },
                                                { name: "Equipment", key: "nonRecurring" },
                                                { name: "Overhead Expenses", key: "overhead" },
                                            ].map((head, index) => (
                                                <tr key={index} className="text-center">
                                                    <td className="border border-gray-400 px-4 py-2">{index + 1}</td>
                                                    <td className="border border-gray-400 px-4 py-2">{head.name}</td>
                                                    <td className="border border-gray-400 px-4 py-2">
                                                        {certificateData.budgetSanctioned[head.key] || 0}
                                                    </td>
                                                    <td className="border border-gray-400 px-4 py-2">
                                                        {certificateData.totalExp[head.key] || 0}
                                                    </td>
                                                    <td className="border border-gray-400 px-4 py-2">
                                                        {certificateData.balance[head.key] || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                onClick={() => setIsCertificateOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isUCCertificateOpen && ucData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto p-6">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                            <p className="mt-3 text-2xl font-bold text-blue-800">Utilization Certificate</p>
                        </div>

                        <div id="uc-details" className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">

                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold">GFR 12-A</h3>
                                <p className="text-sm font-medium">[See Rule 238 (1)]</p>
                                <h2 className="text-xl font-bold mt-2">
                                    FINAL UTILIZATION CERTIFICATE FOR THE YEAR {ucData.currentYear} in respect of
                                </h2>
                                <p className="text-lg font-semibold">
                                    {selectedType === "recurring" ? "Recurring" : "Non-Recurring"}
                                </p>
                            </div>

                            <h3 className="text-lg font-semibold text-blue-700 mb-4">
                                {selectedType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">Title of the Project:</label>
                                <span className="px-3 py-1 w-full">: {ucData.title}</span>

                                <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                                <span className="px-3 py-1 w-full">: {ucData.scheme}</span>

                                <label className="font-semibold text-gray-700">Name of the Grant Receiving Organisation:</label>
                                <span className="px-3 py-1 w-full">: {ucData.instituteName}</span>

                                <label className="font-semibold text-gray-700">Name of the Principal Investigator:</label>
                                <span className="px-3 py-1 w-full">: {ucData.principalInvestigator}</span>

                                <label className="font-semibold text-gray-700">Present Year of Project:</label>
                                <span className="px-3 py-1 w-full">: {ucData.currentYear}</span>

                                {/* <label className="font-semibold text-gray-700">Start Date of Year:</label>
                                <span className="px-3 py-1 w-full">: {ucData.startDate}</span>

                                <label className="font-semibold text-gray-700">End Date of Year:</label>
                                <span className="px-3 py-1 w-full">: {ucData.endDate}</span> */}

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                        Grants position at the beginning of the Financial year
                                    </h3>
                                    <div className="pl-11 grid grid-cols-2 gap-4">
                                        <label className="text-gray-700">Carry forward from previous financial year</label>
                                        <span className="px-3 py-1 w-full text-gray-700">₹ {ucData.CarryForward.toLocaleString()}</span>

                                        <label className="text-gray-700">Others, If any</label>
                                        <span className="px-3 py-1 w-full text-gray-700">₹ 0</span>

                                        <label className="text-gray-700">Total</label>
                                        <span className="px-3 py-1 w-full text-gray-700">₹ {ucData.CarryForward.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-blue-700 mb-4">Financial Summary</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-300 rounded-lg">
                                    <thead>
                                        <tr className="bg-blue-100 text-gray-700">
                                            <th className="border border-gray-400 px-4 py-2">Unspent Balances of Grants received years (figure as at Sl. No. 7 (iii))</th>
                                            <th className="border border-gray-400 px-4 py-2">Interest Earned thereon</th>
                                            <th className="border border-gray-400 px-4 py-2">Interest deposited back to Funding Agency</th>
                                            <th className="border border-gray-400 px-4 py-2" colSpan="3">Grant received during the year</th>
                                            <th className="border border-gray-400 px-4 py-2">Total (1+2 - 3+4)</th>
                                            <th className="border border-gray-400 px-4 py-2">Expenditure incurred</th>
                                            <th className="border border-gray-400 px-4 py-2">Closing Balances (5 - 6)</th>
                                        </tr>
                                        <tr className="bg-blue-50 text-gray-700">
                                            <th className="border border-gray-400 px-4 py-2">1</th>
                                            <th className="border border-gray-400 px-4 py-2">2</th>
                                            <th className="border border-gray-400 px-4 py-2">3</th>
                                            <th className="border border-gray-400 px-4 py-2">Sanction No.</th>
                                            <th className="border border-gray-400 px-4 py-2">Date</th>
                                            <th className="border border-gray-400 px-4 py-2">Amount</th>
                                            <th className="border border-gray-400 px-4 py-2">5</th>
                                            <th className="border border-gray-400 px-4 py-2">6</th>
                                            <th className="border border-gray-400 px-4 py-2">7</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center">
                                            <td className="border border-gray-400 px-4 py-2">₹ {ucData.CarryForward}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                                            <td className="border border-gray-400 px-4 py-2">{ucData.sanctionNumber || '23/2017/003478'}</td>
                                            <td className="border border-gray-400 px-4 py-2">{ucData.sanctionDate || '12-03-2025'}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {ucData.yearTotal}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {ucData.total}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {ucData.recurringExp}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {ucData.total - ucData.recurringExp}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {(selectedType === "recurring" || selectedType !== "recurring") && (
                                <>
                                    <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-4">
                                        Component-wise Utilization of Grants
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border border-gray-300 rounded-lg">
                                            <thead>
                                                <tr className="bg-blue-100 text-gray-700">
                                                    <th className="border border-gray-400 px-4 py-2">Component</th>
                                                    <th className="border border-gray-400 px-4 py-2">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="text-center">
                                                    <td className="border border-gray-400 px-4 py-2">Human Resources</td>
                                                    <td className="border border-gray-400 px-4 py-2">Rs {ucData.human_resources}</td>
                                                </tr>
                                                <tr className="text-center">
                                                    <td className="border border-gray-400 px-4 py-2">Consumables</td>
                                                    <td className="border border-gray-400 px-4 py-2">Rs {ucData.consumables}</td>
                                                </tr>
                                                <tr className="text-center">
                                                    <td className="border border-gray-400 px-4 py-2">Others</td>
                                                    <td className="border border-gray-400 px-4 py-2">Rs {ucData.others}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium  mb-1">Principal Investigator Signature</h4>
                                    <p className="text-medium mb-2 text-gray-500">{ucData.principalInvestigator}</p>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                    </div>

                                </div>

                                <div className="border p-4 rounded-lg">

                                    <h4 className="font-medium  mb-1">Institute Approval</h4>
                                    <p className="text-medium mb-2 text-gray-500">{ucData.instituteName}</p>

                                    <div className="border p-2 rounded mb-2">
                                        <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                onClick={() => setIsUCCertificateOpen(false)}
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

export default ViewDocs;