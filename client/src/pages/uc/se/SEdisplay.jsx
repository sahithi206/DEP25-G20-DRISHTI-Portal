import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const url = import.meta.env.VITE_REACT_APP_URL;
import { toast } from "react-toastify";

const SEForm = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const { getuser } = useContext(AuthContext);
    const [user, setUser] = useState({});
    const [yearlyBudget, setYearly] = useState([]);
    const [budgetSanctioned, setSanctioned] = useState({});
    const [human_resources, setHumanResources] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [travel, setTravel] = useState([]);
    const [contingencies, setContingencies] = useState([]);
    const [others, setOthers] = useState([]);
    const [nonRecurring, setNonRecurring] = useState([]);
    const [overhead, setOverhead] = useState([]);
    const [total, setTotal] = useState([]);
    const [totalExp, setExp] = useState({});
    const [piSignature, setPiSignature] = useState('');
    const [authSignature, setAuthSignature] = useState('');
    const [instituteStamp, setInstituteStamp] = useState('');
    const [loading, setLoading] = useState(true);

    // Get current financial year
    const getCurrentFinancialYear = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Financial year is from April to March
        if (currentMonth >= 3) { // April onwards
            return `${currentYear}-${currentYear + 1}`;
        } else {
            return `${currentYear - 1}-${currentYear}`;
        }
    };

    const financialYear = getCurrentFinancialYear();

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

    useEffect(() => {
        const fetchSe = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                toast.error("Authentication required.");
                return;
            }
            try {
                const get = await getuser();
                setUser(get);
                const response = await fetch(`${url}projects/se/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": token,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch data");

                const json = await response.json();
                if (json.success) {
                    setUser(json.se || {});
                    setYearly(json.se?.yearlyBudget || []);
                    setSanctioned(json.se?.budgetSanctioned || {});
                    setHumanResources(json.se?.human_resources || []);
                    setConsumables(json.se?.consumables || []);
                    setTravel(json.se?.travel || []);
                    setContingencies(json.se?.contingencies || []);
                    setOthers(json.se?.others || []);
                    setNonRecurring(json.se?.nonRecurring || []);
                    setOverhead(json.se?.overhead || []);
                    setTotal(json.se?.total || []);
                    setExp(json.se?.totalExp || {});
                    setPiSignature(json.se?.piSignature || '');
                    setAuthSignature(json.se?.authSignature || '');
                    setInstituteStamp(json.se?.instituteStamp || '');

                    setData((prevData) => ({
                        ...prevData,
                        projectId: json.se?.projectId || "",
                        institute: json.se?.institute || "",
                        name: json.se?.name || "",
                        scheme: json.se?.scheme || "",
                        currentYear: json.se?.currentYear || "",
                        startDate: json.se?.startDate || "",
                        endDate: json.se?.endDate || "",
                        TotalCost: json.se?.TotalCost || 0,
                    }));
                } else {
                    toast.error("Error in Fetching form");
                }
            } catch (e) {
                console.error("Error fetching data:", e);
                toast.error("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };
        fetchSe();
    }, [id]);

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/certificates/${data.projectId}`} />
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-screen">
                        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-700 rounded-full animate-spin"></div>
                        <p className="mt-4 text-lg font-semibold text-gray-700">Loading Statement of Expenditure...</p>
                    </div>
                ) : (

                    <div className="p-6 space-y-6 mt-16">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                            <img src="/3.png" alt="DRISHTI: OneRND India Logo" className="mx-auto w-84 h-32 object-contain" />
                            <p className="mt-3 text-2xl font-bold text-blue-800">
                                Request for Annual Installment with Up-to-Date Statement of Expenditure
                            </p>
                        </div>

                        <div id="se-details" className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-800">
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
                            </div>

                            <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                            <ul className="list-disc pl-6 mb-6">
                                {yearlyBudget.map((sanct, index) => (
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
                                                // Get the correct array based on the key
                                                const getYearValueByKey = (key, yearIndex) => {
                                                    let valueArray = [];
                                                    switch (key) {
                                                        case "human_resources": valueArray = human_resources; break;
                                                        case "consumables": valueArray = consumables; break;
                                                        case "travel": valueArray = travel; break;
                                                        case "contingencies": valueArray = contingencies; break;
                                                        case "others": valueArray = others; break;
                                                        case "nonRecurring": valueArray = nonRecurring; break;
                                                        case "overhead": valueArray = overhead; break;
                                                        default: valueArray = [];
                                                    }
                                                    return valueArray[yearIndex] || 0;
                                                };

                                                const year1Value = getYearValueByKey(head.key, 0);
                                                const year2Value = getYearValueByKey(head.key, 1);
                                                const year3Value = getYearValueByKey(head.key, 2);

                                                const totalExpValue = totalExp && totalExp[head.key]
                                                    ? totalExp[head.key]
                                                    : (year1Value + year2Value + year3Value);

                                                const sanctionedValue = budgetSanctioned && budgetSanctioned[head.key]
                                                    ? budgetSanctioned[head.key]
                                                    : 0;

                                                const balance = sanctionedValue - totalExpValue;

                                                // Calculate fund requirement for next year
                                                let fundRequirement = 0;
                                                if (head.key === "overhead" && budgetSanctioned && budgetSanctioned.overhead) {
                                                    fundRequirement = budgetSanctioned.overhead * 0.3;
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
                                                    {budgetSanctioned && budgetSanctioned.total ? budgetSanctioned.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {total ? total[0] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {total ? total[1] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {total ? total[2] || 0 : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {totalExp && totalExp.total ? totalExp.total : 0}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {((budgetSanctioned && budgetSanctioned.total) || 0) -
                                                        ((totalExp && totalExp.total) || 0)}
                                                </td>
                                                <td className="border border-gray-400 px-2 py-1">
                                                    {(budgetSanctioned && budgetSanctioned.overhead ? budgetSanctioned.overhead * 0.3 : 0).toFixed(0)}
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

                            {/* <div className="border-t border-gray-200 pt-4 mb-6">
                            <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium mb-1">Principal Investigator Signature</h4>
                                    <p className="text-medium mb-2 text-gray-500">{data.name}</p>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                                    </div>
                                </div>

                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium mb-1">Accounts Officer</h4>
                                    <p className="text-medium mb-2 text-gray-500">{data.institute}</p>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={authSignature} alt="Institute Stamp" className="h-24 object-contain" />
                                    </div>
                                </div>

                                <div className="border p-4 rounded-lg">
                                    <h4 className="font-medium mb-1">Institute Approval</h4>
                                    <p className="text-medium mb-2 text-gray-500">{data.institute}</p>
                                    <div className="border p-2 rounded mb-2">
                                        <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                                    </div>
                                </div>
                            </div>
                        </div> */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SEForm;