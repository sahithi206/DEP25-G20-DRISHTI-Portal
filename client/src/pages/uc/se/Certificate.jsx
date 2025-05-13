import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const url = import.meta.env.VITE_REACT_APP_URL;

const Certificates = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { getuser } = useContext(AuthContext);
    const [data, setData] = useState({});
    const [ucData, setucData] = useState({})
    const [user, setUser] = useState({});
    const [closing, setClosing] = useState(0);
    const { id, type } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("UnAuthorized Access");
                navigate("/");
                return;
            }

            try {
                setLoading(true);
                const endpoint = type === "recurring"
                    ? `${url}projects/ucforms/recurring/${id}`
                    : `${url}projects/ucforms/nonRecurring/${id}`;

                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": `${token}`,
                    }
                });

                const json = await response.json();

                if (!json.success) {
                    setError(json.msg || "Error fetching certificates");
                    setLoading(false);
                    return;
                }

                console.log("data:", json.grant);
                setData(json.grant);
                setucData(json.grant.ucData)

                // Calculate closing balance correctly using json.grant directly
                if (type === "recurring") {
                    const closingBalance = json.grant.ucData.total - json.grant.ucData.recurringExp;
                    setClosing(closingBalance);
                } else {
                    const closingBalance = json.grant.ucData.total - json.grant.ucData.nonRecurringExp;
                    setClosing(closingBalance);
                }

                // Fetch user data
                const userData = await getuser();
                setUser(userData);
                console.log("User data:", userData);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching certificates:", error);
                setError("Internal Server Error");
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [id, type, getuser, navigate, url]);

    if (loading) {
        return (
            <div className="flex bg-gray-100 min-h-screen">
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                    <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/certificates/${data.projectId}`} />
                    <div className="flex flex-col items-center justify-center h-screen">
                        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-700 rounded-full animate-spin"></div>
                        <p className="mt-4 text-lg font-semibold text-gray-700">Loading Utilization Certificate...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex bg-gray-100 min-h-screen justify-center items-center">
                <div className="text-xl font-medium text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/certificates/${data.projectId}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Utilization Certificate</p>
                    </div>

                    <div id="uc-details" className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold">GFR 12-A</h3>
                            <p className="text-sm font-medium">[See Rule 238 (1)]</p>
                            <h2 className="text-xl font-bold mt-2">
                                FINAL UTILIZATION CERTIFICATE FOR THE YEAR {data.ucData.currentYear || "2025"} in respect of
                            </h2>
                            <p className="text-lg font-semibold">
                                {type === "recurring" ? "Recurring" : "Non-Recurring"}
                            </p>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-700 mb-4">
                            {type === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Name of the Grant Receiving Organisation:</label>
                            <span className="px-3 py-1 w-full">: {user.Institute || "Research Institute"}</span>

                            <label className="font-semibold text-gray-700">Name of the Principal Investigator(s):</label>
                            <span className="px-3 py-1 w-full">: {user.Name || "Principal Investigator"}</span>

                            <label className="font-semibold text-gray-700">Title of the Project:</label>
                            <span className="px-3 py-1 w-full">: {data.ucData.title || "Research Project"}</span>

                            <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                            <span className="px-3 py-1 w-full">: {data.ucData.scheme || "Research Scheme"}</span>

                            <label className="font-semibold text-gray-700">Whether recurring or non-recurring:</label>
                            <span className="px-3 py-1 w-full">: {type}</span>

                            <div className="mb-6 col-span-2">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                                    Grants position at the beginning of the Financial year
                                </h3>
                                <div className="pl-11 grid grid-cols-2 gap-4">
                                    <label className="text-gray-700">Carry forward from previous financial year</label>
                                    <span className="px-3 py-1 w-full text-gray-700">₹ {(data.ucData.CarryForward || 0).toLocaleString()}</span>

                                    <label className="text-gray-700">Others, If any</label>
                                    <span className="px-3 py-1 w-full text-gray-700">₹ 0</span>

                                    <label className="text-gray-700">Total</label>
                                    <span className="px-3 py-1 w-full text-gray-700">₹ {(ucData.CarryForward || 0).toLocaleString()}</span>
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
                                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.CarryForward || 0}</td>
                                        <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                                        <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                                        <td className="border border-gray-400 px-4 py-2">{ucData.sanctionNumber || '23/2017/003478'}</td>
                                        <td className="border border-gray-400 px-4 py-2">{ucData.sanctionDate || '12-03-2025'}</td>
                                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.yearTotal || 0}</td>
                                        <td className="border border-gray-400 px-4 py-2">₹ {ucData.total || 0}</td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            ₹ {type === "recurring" ? (ucData.recurringExp || 0) : (ucData.nonRecurringExp || 0)}
                                        </td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            ₹ {closing}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

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
                                            ₹ {type === "recurring" ? (ucData.recurringExp || 0) : (ucData.nonRecurringExp || 0)}
                                        </td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            ₹ {type === "recurring" ? (ucData.recurringExp || 0) : (ucData.nonRecurringExp || 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

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
                                        : ₹ {closing}
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
                                        : ₹ {closing}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/*<div className="border-t border-gray-200 pt-4 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium mb-1">Principal Investigator Signature</h4>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature of PI : ...........................</p>
                                    <p className="font-medium">Name: {user.Name || "Principal Investigator"}</p>
                                </div>

                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium mb-1">CFO Signature</h4>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={authSignature} alt="CFO Signature" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature ...............</p>
                                    <p className="font-medium">Name: {instituteOfficials.cfo}</p>
                                    <p className="font-medium">Chief Finance Officer</p>
                                    <p className="font-medium">(Head of Finance)</p>
                                </div>

                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium mb-1">Institute Approval</h4>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                    </div>
                                    <p className="font-medium">Signature.................</p>
                                    <p className="font-medium">Name: {instituteOfficials.headOfInstitute}</p>
                                    <p className="font-medium">Head of Organisation</p>
                                </div>
                            </div>
                        </div> */}

                        <div className="flex justify-between mt-4">
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
                            >
                                Export as PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificates;