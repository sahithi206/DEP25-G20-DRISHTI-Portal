import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const url = import.meta.env.VITE_REACT_APP_URL;

const SEForm = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const { getuser } = useContext(AuthContext)
    const [user, setUser] = useState({});
    const [yearlyBudget, setYearly] = useState([]);
    const [budgetSanctioned, setSanctioned] = useState({});
    const [budget, setBudget] = useState([]);
    const [manpower, setManpower] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [total, setTotal] = useState([]);
    const [totalExp, setExp] = useState({});
    const [balance, setBalance] = useState({});
    const [others, setOthers] = useState([]);
    const [equipment, setEquipment] = useState([]);

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
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Authentication required.");
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
                    setBudget(json.se?.budget || []);
                    setManpower(json.se?.manpower || []);
                    setConsumables(json.se?.consumables || []);
                    setTotal(json.se?.total || []);
                    setExp(json.se?.totalExp || {});
                    setBalance(json.se?.balance || {});
                    setOthers(json.se?.others || []);
                    setEquipment(json.se?.equipment || []);
                    setData((prevData) => ({
                        ...prevData,
                        projectId: json.se?.projectId || "",
                        institute: json.se?.institute || "",
                        name: json.se?.name || "",
                        scheme: json.se?.scheme || "",
                        currentYear: json.se?.currentYear || "",
                        startDate: json.se?.startDate || "",
                        endDate: json.se?.endDate || "",
                    }));
                } else {
                    alert("Error in Fetching form");
                }
            } catch (e) {
                console.error("Error fetching data:", e);
                alert("Failed to fetch data.");
            }
        };
        fetchSe();
    }, [id]);

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/certificates/${data.projectId}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <p className="mt-3 text-2xl font-bold text-blue-800">
                            Request for Annual Installment with Up-to-Date Statement of Expenditure
                        </p>
                    </div>

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
                            {/* <label className="font-semibold text-gray-700">Start Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.startDate}</span>

                            <label className="font-semibold text-gray-700">End Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.endDate}</span> */}
                        </div>

                        <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                        <ul className="list-disc pl-6">
                            {yearlyBudget.map((sanct, index) => (
                                <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                                    <span>Year {index + 1}: {sanct}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mb-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-300 rounded-lg">
                                    <thead>
                                        <tr className="bg-blue-100 text-gray-700">
                                            <th className="border border-gray-400 px-4 py-2" >Sanctioned Heads</th>
                                            <th className="border border-gray-400 px-4 py-2" >Total Funds Sanctioned</th>
                                            <th className="border border-gray-400 px-4 py-2" colSpan={manpower && manpower.length > 0 ? manpower.length : 1}>Expenditure Incurred</th>
                                            <th className="border border-gray-400 px-4 py-2">Total Expenditure</th>
                                            <th className="border border-gray-400 px-4 py-2">Balance against Sanctioned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >1</th>
                                            <th className="border border-gray-400 px-4 py-2" >2</th>
                                            {total && total.length > 0 ? (
                                                total.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        Year {index + 1}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">Year 1</th>
                                            )} <th className="border border-gray-400 px-4 py-2">3</th>
                                            <th className="border border-gray-400 px-4 py-2">4</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Manpower</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.human_resources || 0}</th>
                                            {manpower && manpower.length > 0 ? (
                                                manpower.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.human_resources || 0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.human_resources || 0}</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Consumables</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.consumables || 0}</th>
                                            {consumables && consumables.length > 0 ? (
                                                consumables.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.consumables || 0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.consumables || 0}</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Others</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.others || 0}</th>
                                            {others && others.length > 0 ? (
                                                others.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.others || 0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.others || 0}</th>
                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Equipment</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.nonRecurring || 0}</th>
                                            {equipment && equipment.length > 0 ? (
                                                equipment.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )}

                                            <th className="border border-gray-400 px-4 py-2">{totalExp?.nonRecurring || 0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.nonRecurring || 0}</th>

                                        </tr>
                                        <tr className="text-center">
                                            <th className="border border-gray-400 px-4 py-2" >Total</th>
                                            <th className="border border-gray-400 px-4 py-2" >{budgetSanctioned?.total}</th>
                                            {total && total.length > 0 ? (
                                                total.map((man, index) => (
                                                    <th className="border border-gray-400 px-4 py-2" key={index}>
                                                        {man}
                                                    </th>
                                                ))
                                            ) : (
                                                <th className="border border-gray-400 px-4 py-2">0</th>
                                            )} <th className="border border-gray-400 px-4 py-2">{totalExp?.total || 0}</th>
                                            <th className="border border-gray-400 px-4 py-2">{balance?.total || 0}</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEForm;
