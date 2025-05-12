import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const url = import.meta.env.VITE_REACT_APP_URL;

const Certificates = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);;
    const navigate = useNavigate();
    const { getuser } = useContext(AuthContext);
    const [data, setData] = useState({});
    const [user, setUser] = useState({});
    const [closing, setClosing] = useState(data.total);
    const { id, type } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("UnAuthorized Access");
                navigate("/");
            }
            try {

                const endpoint = type === "recurring"
                    ? `${url}projects/ucforms/recurring/${id}`
                    : `${url}projects/ucforms/nonRecurring/${id}`;

                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": ` ${token}`,
                    }
                }
                );

                const json = await response.json();

                if (!json.success) {
                    setError(json.msg || "Error fetching certificates");
                    return;
                }
                setData(json.grant);
                const user = await getuser();
                setUser(user);
                console.log(user);
                if (type === "nonRecurring") {
                    console.log(data.nonRecurringExp);
                    console.log("nonRecurring", data.total - data.nonRecurringExp)
                    setClosing(data.total - data.nonRecurringExp);
                } else {
                    console.log(data.nonRecurringExp);
                    console.log("Recurring", data.total - data.recurringExp)
                    setClosing(data.total - data.recurringExp);
                }
            } catch (error) {
                console.error("Error fetching certificates:", error);
                setError("Internal Server Error");
            }
        };

        fetchCertificates();
    }, [id, type]);


    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/certificates/${data.projectId}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                                                <img src="/3.png" alt="ResearchX Logo" className="mx-auto w-84 h-32 object-contain" />

                        <p className="mt-3 text-2xl font-bold text-blue-800">Final Utilization Certificate of the Financial Year</p>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">File Number</label>
                            <span className="px-3 py-1 w-full">: {data.projectId}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                            <span className="px-3 py-1 w-full">: {user.Institute}</span>
                            <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                            <span className="px-3 py-1 w-full">: {user.Name}</span>
                            <label className="font-semibold text-gray-700">Title of the Project</label>
                            <span className="px-3 py-1 w-full">: {data.title}</span>
                            <label className="font-semibold text-gray-700">Name of the Scheme</label>
                            <span className="px-3 py-1 w-full">: {data.scheme}</span>
                            <label className="font-semibold text-gray-700">Present Year of Project</label>
                            <span className="px-3 py-1 w-full">: {data.currentYear}</span>
                            {/* <label className="font-semibold text-gray-700">Start Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.startDate}</span>
                            <label className="font-semibold text-gray-700">End Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.endDate}</span> */}

                        </div>

                        <h3 className="text-lg font-semibold text-blue-700 mb-4">Grant Details</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Whether Recurring or Non-recurring Grants<span className="text-red-500">*</span></label>
                            <span className="px-3 py-1 w-full">: {data.type}</span>

                        </div>
                        <div className="mb-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-300 rounded-lg">
                                    <thead>
                                        <tr className="bg-blue-100 text-gray-700">
                                            <th className="border border-gray-400 px-4 py-2" >Unspent Balances</th>
                                            <th className="border border-gray-400 px-4 py-2" >Grant Received</th>
                                            <th className="border border-gray-400 px-4 py-2">Total</th>
                                            <th className="border border-gray-400 px-4 py-2">Expenditure Incurred</th>
                                            <th className="border border-gray-400 px-4 py-2">Closing Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center">
                                            <td className="border border-gray-400 px-4 py-2">₹ {data.CarryForward}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {data.yearTotal}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {data.total}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {data.type === "recurring" ? data.recurringExp : data.nonRecurringExp}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {closing}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-700 mb-4">Expenditure Breakdown</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {data.type === "recurring" ? (
                                <>
                                    <label className="font-semibold text-gray-700">Human Resources (₹):</label>
                                    <span className="px-3 py-1 w-full">: {data.humanResource}</span>
                                    <label className="font-semibold text-gray-700">Consumables (₹):</label>
                                    <span className="px-3 py-1 w-full">: {data.consumables}</span>
                                    <label className="font-semibold text-gray-700">Other (₹):</label>
                                    <span className="px-3 py-1 w-full">: {data.others}</span>
                                    <label className="font-semibold text-gray-700">Total (₹):</label>
                                    <span className="px-3 py-1 w-full">: {data.recurringExp}</span>
                                </>
                            ) : (
                                <>
                                    <label className="font-semibold text-gray-700">Expenditure (₹):</label>
                                    <span className="px-3 py-1 w-full">: {data.nonRecurringExp}</span>
                                </>
                            )}
                        </div>
                        <div className="border border-gray-400 rounded px-3 py-3 w-full-4">
                            <label className="font-semibold text-gray-700">Details of Grants Position at the End of the Year</label>
                            <ul className="list-disc pl-7">
                                <li>Balance (Carry forward to Next Year) <span className="text-gray-500">: ₹ {data.CarryForward}</span></li>
                                <li>Total Expenditure incurred <span className="text-gray-500">: ₹ {closing}</span></li>
                            </ul>
                        </div>

                        <div className="mb-4 py-4 flex justify-center space-x-10">
                            <button
                                className="mt-4 bg-blue-600 text-white px-6 py-2 w-full rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
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