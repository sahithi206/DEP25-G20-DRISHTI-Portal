import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/Authcontext";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminNavbar from "../../../components/AdminNavbar";
import TermsAndConditions from "../../uc/se/TermsAndConditions";

const url = import.meta.env.VITE_REACT_APP_URL;

const AllSEUC = () => {
    const { fetchInstituteOfficials } = useContext(AuthContext);
    const [activeSection, setActiveSection] = useState("allRequests");
    const [error, setError] = useState("");
    const [allUCs, setAllUCs] = useState([]);
    const [allSEs, setAllSEs] = useState([]);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCertificateOpen, setIsCertificateOpen] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const [isUCCertificateOpen, setIsUCCertificateOpen] = useState(false);
    const [ucData, setUCData] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const [piSignature, setPiSignature] = useState(null);
    const [instituteStamp, setInstituteStamp] = useState(null);
    const [authSignature, setAuthSignature] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [comment, setComment] = useState("");
    const [searchQueryUC, setSearchQueryUC] = useState("");
    const [searchQuerySE, setSearchQuerySE] = useState("");
    const [sortOrderUC, setSortOrderUC] = useState("asc");
    const [sortOrderSE, setSortOrderSE] = useState("asc");
    const [filterUC, setFilterUC] = useState("");
    const [filterSE, setFilterSE] = useState("");
    const [instituteOfficials, setInstituteOfficials] = useState({
        headOfInstitute: "Loading...",
        cfo: "Loading...",
        accountsOfficer: "Loading...",
    });

    const [isSortFilterOpen, setIsSortFilterOpen] = useState(false);


    const fetchAllUCs = async () => {
        try {
            const response = await fetch(`${url}admin/all-ucforms?t=${Date.now()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            if (!data.success || !data.data || data.data.length === 0) {
                setError("No UCs found for admin approval");
                setAllUCs([]);
                setFilteredUCs([]);
                return;
            }

            setAllUCs(data.data);
            setFilteredUCs(data.data);
        } catch (error) {
            console.error("Error fetching all UCs:", error);
            setError("Internal Server Error");
        }
    };

    const fetchAllSEs = async () => {
        try {
            const response = await fetch(`${url}admin/all-seforms?t=${Date.now()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
            });

            const data = await response.json();

            if (!data.success || !data.data || data.data.length === 0) {
                setError("No SEs found for admin approval");
                setAllSEs([]);
                setFilteredSEs([]);
                return;
            }

            setAllSEs(data.data);
            setFilteredSEs(data.data);
        } catch (error) {
            console.error("Error fetching all SEs:", error);
            setError("Internal Server Error");
        }
    };

    useEffect(() => {
        fetchAllUCs();
        fetchAllSEs();
    }, [reloadKey]);

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

            if (!data.success) {
                alert("Failed to fetch certificate details.");
                return;
            }
            const authData = await fetchInstituteOfficials(data.data.ucData.instituteName);
            setInstituteOfficials(authData);
            setIsUCCertificateOpen(true);
            setPiSignature(data.data.piSignature);
            setInstituteStamp(data.data.instituteStamp);
            setAuthSignature(data.data.authSignature);
            setSelectedType(data.data.type);
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
            const authData = await fetchInstituteOfficials(data.data.institute);
            setInstituteOfficials(authData);
            setCertificateData(data.data);
            setInstituteStamp(data.data.instituteStamp);
            setPiSignature(data.data.piSignature);
            setAuthSignature(data.data.authSignature);
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

    const handleSubmitComment = async () => {
        if (!comment.trim()) {
            alert("Comment cannot be empty");
            return;
        }
        try {
            const response = await fetch(`${url}admin/add-comment/${selectedCertificate._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
                body: JSON.stringify({ comment }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Comment added successfully!");
                closeModal();
            } else {
                alert("Failed to add comment.");
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert("Error submitting comment.");
        }
    };

    const handleAdminApproval = async (id, action, type) => {
        try {
            const endpoint = type === "UC" ? "uc/admin-approval" : "admin/se-admin-approval";
            const response = await fetch(`${url}${endpoint}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token"),
                },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            if (data.success) {
                alert(`${type} ${action}d successfully!`);
                setReloadKey((prevKey) => prevKey + 1);
            } else {
                alert(data.message || "Failed to process the request.");
            }
        } catch (error) {
            console.error(`Error during ${action} action:`, error);
            alert("An error occurred while processing the request.");
        }
    };

    const filteredUCs = allUCs
        .filter((uc) => {
            const matchesSearch = searchQueryUC
                ? uc.projectId?.toLowerCase().includes(searchQueryUC.toLowerCase()) ||
                uc.ucData?.title?.toLowerCase().includes(searchQueryUC.toLowerCase()) ||
                uc.ucData?.instituteName?.toLowerCase().includes(searchQueryUC.toLowerCase()) ||
                uc.ucData?.principalInvestigator?.toLowerCase().includes(searchQueryUC.toLowerCase())
                : true;
            const matchesFilter = filterUC ? uc.ucData?.instituteName === filterUC : true;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortOrderUC === "asc") {
                return new Date(a.submissionDate) - new Date(b.submissionDate);
            } else {
                return new Date(b.submissionDate) - new Date(a.submissionDate);
            }
        });

    const filteredSEs = allSEs
        .filter((se) => {
            const matchesSearch = searchQuerySE
                ? se.projectId?.toLowerCase().includes(searchQuerySE.toLowerCase()) ||
                se.title?.toLowerCase().includes(searchQuerySE.toLowerCase()) ||
                se.institute?.toLowerCase().includes(searchQuerySE.toLowerCase()) ||
                se.name?.toLowerCase().includes(searchQuerySE.toLowerCase())
                : true;
            const matchesFilter = filterSE ? se.institute === filterSE : true;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortOrderSE === "asc") {
                return new Date(a.date) - new Date(b.date);
            } else {
                return new Date(b.date) - new Date(a.date);
            }
        });

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const financialYear =
        currentMonth >= 3
            ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
            : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />
                <div className="p-6 space-y-1 mt-3">
                    <div key={reloadKey} className="mt-3 bg-white p-7 rounded-lg shadow-md">
                        <h2 className="text-lg font-bold mb-4">All UCs</h2>

                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                placeholder="Search UCs..."
                                value={searchQueryUC}
                                onChange={(e) => setSearchQueryUC(e.target.value)}
                                className="p-2 border rounded w-1/3"
                            />
                            <div className="flex items-center space-x-4">
                                <select
                                    value={sortOrderUC}
                                    onChange={(e) => setSortOrderUC(e.target.value)}
                                    className="p-2 border rounded"
                                >
                                    <option value="asc">Sort by Date (Ascending)</option>
                                    <option value="desc">Sort by Date (Descending)</option>
                                </select>
                            </div>
                        </div>
                        <table className="w-full border table-fixed">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-4 text-left w-1/4">Project ID</th>
                                    <th className="p-4 text-left w-1/5">Project Title</th>
                                    <th className="p-4 text-left w-1/5">Principal Investigator</th>
                                    <th className="p-4 text-left w-1/4">Institute</th>
                                    <th className="p-4 text-left w-1/4">Submission Date</th>
                                    <th className="p-4 text-center w-1/4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUCs.length > 0 ? (
                                    filteredUCs.map((certificate) => (
                                        <tr key={certificate._id} className="border-b hover:bg-blue-50">
                                            <td className="p-4 w-1/4">{certificate.projectId}</td>
                                            <td className="p-4 w-1/4">{certificate.ucData.title}</td>
                                            <td className="p-4 w-1/5">{certificate.ucData.principalInvestigator || "N/A"}</td>
                                            <td className="p-4 w-1/4">{certificate.ucData.instituteName}</td>
                                            <td className="p-4 w-1/4">
                                                {new Date(certificate.submissionDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 w-1/4 text-center">
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                                    onClick={() => openCommentModal(certificate)}
                                                >
                                                    Add Comment
                                                </button>
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                                                    onClick={() => handleViewCertificate(certificate)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                                                    onClick={() => handleAdminApproval(certificate._id, "approve", "UC")}
                                                >
                                                    Accept
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-500">
                                            No UCs Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <h2 className="text-lg font-bold mt-8 mb-4">All SEs</h2>
                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                placeholder="Search SEs..."
                                value={searchQuerySE}
                                onChange={(e) => setSearchQuerySE(e.target.value)}
                                className="p-2 border rounded w-1/3"
                            />
                            <div className="flex items-center space-x-4">
                                <select
                                    value={sortOrderSE}
                                    onChange={(e) => setSortOrderSE(e.target.value)}
                                    className="p-2 border rounded"
                                >
                                    <option value="asc">Sort by Date (Ascending)</option>
                                    <option value="desc">Sort by Date (Descending)</option>
                                </select>
                            </div>
                        </div>
                        <table className="w-full border table-fixed">

                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-4 text-left w-1/4">Project ID</th>
                                    <th className="p-4 text-left w-1/5">Principal Investigator</th>
                                    < th className="p-4 text-left w-1/4">Institute</th>
                                    <th className="p-4 text-left w-1/4">Submission Date</th>
                                    <th className="p-4 text-center w-1/4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSEs.length > 0 ? (
                                    filteredSEs.map((se) => (
                                        <tr key={se._id} className="border-b hover:bg-blue-50">

                                            <td className="p-4 w-1/4">{se.projectId}</td>
                                            <td className="p-4 w-1/5">{se.name || "N/A"}</td>
                                            <td className="p-4 w-1/4">{se.institute}</td>
                                            <td className="p-4 w-1/4">
                                                {new Date(se.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 w-1/4 text-center">
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                                    onClick={() => openCommentModal(se)}
                                                >
                                                    Add Comment
                                                </button>
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                                                    onClick={() => handleViewSE(se)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                                                    onClick={() => handleAdminApproval(se._id, "approve", "SE")}
                                                >
                                                    Accept
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-gray-500">
                                            No SEs Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add Comment</h2>
                        <textarea
                            className="w-full p-6 border rounded"
                            rows="4"
                            placeholder="Enter your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-4">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={handleSubmitComment}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isCertificateOpen && certificateData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto p-6">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                            <p className="mt-3 text-2xl font-bold text-blue-800">
                                Request for Annual Installment with Up-to-Date Statement of Expenditure
                            </p>
                        </div>

                        <div id="se-details" className="bg-white rounded-lg p-6 border-t-4 border-blue-800">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">File Number</label>
                                <span className="px-3 py-1 w-full">: {certificateData.projectId}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                                <span className="px-3 py-1 w-full">: {certificateData.institute}</span>
                                <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                                <span className="px-3 py-1 w-full">: {certificateData.name}</span>
                                <label className="font-semibold text-gray-700">Name of the Scheme</label>
                                <span className="px-3 py-1 w-full">: {certificateData.scheme}</span>
                                <label className="font-semibold text-gray-700">Present Year of Project</label>
                                <span className="px-3 py-1 w-full">: {certificateData.currentYear}</span>
                                <label className="font-semibold text-gray-700">Total Project Cost </label>
                                <span className="px-3 py-1 w-full">: {certificateData.TotalCost}</span>
                            </div>

                            <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                            <ul className="list-disc pl-6 mb-6">
                                {certificateData.yearlyBudget && certificateData.yearlyBudget.map((sanct, index) => (
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
                                                const year1Value = certificateData.human_resources && head.key === "human_resources" ? certificateData.human_resources[0] || 0 :
                                                    certificateData[head.key] ? certificateData[head.key][0] || 0 : 0;
                                                const year2Value = certificateData.human_resources && head.key === "human_resources" ? certificateData.human_resources[1] || 0 :
                                                    certificateData[head.key] ? certificateData[head.key][1] || 0 : 0;
                                                const year3Value = certificateData.human_resources && head.key === "human_resources" ? certificateData.human_resources[2] || 0 :
                                                    certificateData[head.key] ? certificateData[head.key][2] || 0 : 0;

                                                const totalExpValue = certificateData.totalExp && certificateData.totalExp[head.key]
                                                    ? certificateData.totalExp[head.key]
                                                    : (year1Value + year2Value + year3Value);

                                                const sanctionedValue = certificateData.budgetSanctioned && certificateData.budgetSanctioned[head.key]
                                                    ? certificateData.budgetSanctioned[head.key]
                                                    : 0;

                                                const balance = sanctionedValue - totalExpValue;

                                                // Calculate fund requirement for next year
                                                let fundRequirement = 0;
                                                if (head.key === "overhead" && certificateData.budgetSanctioned && certificateData.budgetSanctioned.overhead) {
                                                    fundRequirement = certificateData.budgetSanctioned.overhead * 0.3;
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
                                                    {certificateData.budgetSanctioned && certificateData.budgetSanctioned.total ? certificateData.budgetSanctioned.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.total ? certificateData.total[0] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.total ? certificateData.total[1] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.total ? certificateData.total[2] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {certificateData.totalExp && certificateData.totalExp.total ? certificateData.totalExp.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {((certificateData.budgetSanctioned && certificateData.budgetSanctioned.total) || 0) -
                                                        ((certificateData.totalExp && certificateData.totalExp.total) || 0)}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {(certificateData.budgetSanctioned && certificateData.budgetSanctioned.overhead ? certificateData.budgetSanctioned.overhead * 0.3 : 0).toFixed(0)}
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
                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-1">Principal Investigator Signature</h4>
                                        <p className="text-medium mb-2 text-gray-500">{certificateData.name}</p>
                                        <div className="border p-2 rounded mb-2">
                                            <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                        </div>
                                    </div>

                                    <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-1">Accounts Officer</h4>
                                        <p className="text-medium mb-2 text-gray-500">{certificateData.institute}</p>
                                        <div className="border p-2 rounded mb-2">
                                            <img src={authSignature} alt="Institute Stamp" className="h-24 object-contain" />
                                        </div>
                                    </div>

                                    <div className="border p-4 rounded-lg">
                                        <h4 className="font-medium mb-1">Institute Approval</h4>
                                        <p className="text-medium mb-2 text-gray-500">{certificateData.institute}</p>
                                        <div className="border p-2 rounded mb-2">
                                            <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                        </div>
                                    </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <label className="font-semibold text-gray-700">Name of the Grant Receiving Organisation:</label>
                                <span className="px-3 py-1 w-full">: {ucData.instituteName}</span>

                                <label className="font-semibold text-gray-700">Name of the Principal Investigator(s):</label>
                                <span className="px-3 py-1 w-full">:{ucData.principalInvestigator?.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {ucData.principalInvestigator.map((name, idx) => (
                                            <li key={idx}>{name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    "N/A"
                                )}
                                </span>

                                <label className="font-semibold text-gray-700">Title of the Project:</label>
                                <span className="px-3 py-1 w-full">: {ucData.title}</span>

                                <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                                <span className="px-3 py-1 w-full">: {ucData.scheme}</span>

                                <label className="font-semibold text-gray-700">Whether recurring or non-recurring:</label>
                                <span className="px-3 py-1 w-full">: {selectedType}</span>

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
                                            <td className="border border-gray-400 px-4 py-2">
                                                ₹ {selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                                            </td>
                                            <td className="border border-gray-400 px-4 py-2">
                                                ₹ {ucData.total - (selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                                            </td>
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
                                                    <th className="border border-gray-400 px-4 py-2">Grant-in-aid-General</th>
                                                    <th className="border border-gray-400 px-4 py-2">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="text-center">
                                                    <td className="border border-gray-400 px-4 py-2">
                                                        ₹ {selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                                                    </td>
                                                    <td className="border border-gray-400 px-4 py-2">
                                                        ₹ {selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-blue-700 mb-4">
                                    Details of grants position at the end of the year
                                </h3>
                                <div className="pl-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex">
                                            <span className="mr-2">(i)</span>
                                            <span>Balance available at end of financial year</span>
                                        </div>
                                        <span>
                                            : ₹ {ucData.total - (selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                                        </span>

                                        <div className="flex">
                                            <span className="mr-2">(ii)</span>
                                            <span>Unspent balance refunded to Funding Agency (if any)</span>
                                        </div>
                                        <span>: ₹ 0</span>

                                        <div className="flex">
                                            <span className="mr-2">(iii)</span>
                                            <span>Balance (Carry forward to next financial year)</span>
                                        </div>
                                        <span>
                                            : ₹ {ucData.total - (selectedType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <TermsAndConditions />

                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium  mb-1">Principal Investigator Signature</h4>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature of PI : ...........................</p>
                                    <p className="font-medium">Name: {ucData.principalInvestigator[0]}</p>
                                </div>

                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium  mb-1">CFO Signature</h4>
                                    {/* <p className="text-medium mb-2 text-gray-500">Chief Finance Officer</p> */}
                                    <div className="border p-2 rounded mb-2">
                                        <img src={authSignature} alt="CFO Signature" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature ...............</p>
                                    <p className="font-medium">Name: {instituteOfficials.cfo}</p>
                                    <p className="font-medium">Chief Finance Officer</p>
                                    <p className="font-medium">(Head of Finance)</p>
                                </div>

                                <div className="border p-4 rounded-lg">

                                    <h4 className="font-medium  mb-1">Institute Approval</h4>
                                    {/* <p className="text-medium mb-2 text-gray-500">{ucData.instituteName}</p> */}
                                    <div className="border p-2 rounded mb-2">
                                        <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature.................</p>
                                    <p className="font-medium">Name: {instituteOfficials.headOfInstitute}</p>
                                    <p className="font-medium">Head of Organisation</p>
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

export default AllSEUC;