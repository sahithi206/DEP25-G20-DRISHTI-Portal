import React, { useState,useContext,useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";

const UCForm = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);;
        const navigate = useNavigate();
        const [data,setData]=useState({
            grantType:"recurring"
        });
        const { id } = useParams();
        const [project, setProject] = useState({});
        const [generalInfo, setGeneral] = useState({});
        const [budget, setBudget] = useState({});
        const [budgetused, setbudget] = useState({});
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [pilist, setPI] = useState([]);
        const {getProject}=useContext(AuthContext);
        useEffect(() => {
            const fetchProjectDetails = async () => {
                try {
                    console.log(1);
                    const data = await getProject(id);
                    console.log("data",data);
                    setProject(data.data.project);
                    setGeneral(data.data.generalInfo);
                    setBudget(data.data.budget);
                    setbudget(data.data.budgetused);
                    if (data.data.PIDetails && data.data.PIDetails.piList.length > 0) {
                        setPI(data.data.PIDetails.piList)
                    }
                    
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProjectDetails();
        }, []);
    const handleChange = (e) => {
        setData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Final Utilization Certificate of the Financial Year</p>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">File Number</label>
                            <span className="px-3 py-1 w-full">: {project?project._id:0}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Name of the grant receiving Organization</label>
                            <span className="px-3 py-1 w-full">: {generalInfo?generalInfo.instituteName:"NA"}</span>
                            <label className="font-semibold text-gray-700">Name of Principal Investigator:</label>
                            <span className="px-3 py-1 w-full">: {generalInfo?generalInfo.name:"NA"}</span>
                            <label className="font-semibold text-gray-700">Title of the Project</label>
                            <span className="px-3 py-1 w-full">: {project?project.Title:"NA"}</span>
                            <label className="font-semibold text-gray-700">Name of the Scheme</label>
                            <span className="px-3 py-1 w-full">: {project?project.Scheme:"NA"}</span>
                            <label className="font-semibold text-gray-700">Present Year of Project</label>
                            <span className="px-3 py-1 w-full">: {project?project.currentYear:"NA"}</span>
                            <label className="font-semibold text-gray-700">Start Date of Year</label>
                            <input
                                type="date"
                                name="startDate"
                                value={data.startDate}
                                onChange={handleChange}
                                required
                                className="border border-gray-400 rounded px-3 py-1 w-full"
                            />
                            <label className="font-semibold text-gray-700">End Date of Year</label>
                            <input
                                type="date"
                                name="endDate"
                                value={data.endDate}
                                onChange={handleChange}
                                required
                                className="border border-gray-400 rounded px-3 py-1 w-full"
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-blue-700 mb-4">Grant Details</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Whether Recurring or Non-recurring Grants<span className="text-red-500">*</span></label>
                            <select name="grantType"
                                className="border border-gray-400 rounded px-3 py-1 w-full"
                                onChange={handleChange}
                                value={data.grantType}
                                required>
                                <option value="recurring">Recurring</option>
                                <option value="nonRecurring">Non-Recurring</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-300 rounded-lg">
                                    <thead>
                                        <tr className="bg-blue-100 text-gray-700">
                                            <th className="border border-gray-400 px-4 py-2">Unspent Balances</th>
                                            <th className="border border-gray-400 px-4 py-2" colSpan={3}>Grant Received</th>
                                            <th className="border border-gray-400 px-4 py-2">Total</th>
                                            <th className="border border-gray-400 px-4 py-2">Expenditure Incurred</th>
                                            <th className="border border-gray-400 px-4 py-2">Closing Balance</th>
                                        </tr>
                                        <tr className="bg-blue-50 text-gray-700">
                                            <th className="border border-gray-400 px-4 py-2"></th>
                                            <th className="border border-gray-400 px-4 py-2">Sanction No.</th>
                                            <th className="border border-gray-400 px-4 py-2">Date</th>
                                            <th className="border border-gray-400 px-4 py-2">Amount</th>
                                            <th className="border border-gray-400 px-4 py-2"></th>
                                            <th className="border border-gray-400 px-4 py-2"></th>
                                            <th className="border border-gray-400 px-4 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center">
                                            <td className="border border-gray-400 px-4 py-2"></td>
                                            <td className="border border-gray-400 px-4 py-2">-</td>
                                            <td className="border border-gray-400 px-4 py-2">-</td>
                                            <td className="border border-gray-400 px-4 py-2">-</td>
                                            <td className="border border-gray-400 px-4 py-2">-</td>
                                            <td className="border border-gray-400 px-4 py-2">-</td>
                                            <td className="border border-gray-400 px-4 py-2">-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-700 mb-4">Expenditure Breakdown</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {data.grantType === "recurring" ? (
                                <>
                                    <label className="font-semibold text-gray-700">Human Resources (₹):</label>
                                    <input type="number" name="humanResources" value={data.human_resources || ""} onChange={handleChange} className="border border-gray-400 rounded px-3 py-1 w-full" />

                                    <label className="font-semibold text-gray-700">Consumables (₹):</label>
                                    <input type="number" name="consumables" value={data.consumables || ""} onChange={handleChange} className="border border-gray-400 rounded px-3 py-1 w-full" />

                                    <label className="font-semibold text-gray-700">Other (₹):</label>
                                    <input type="number" name="Other" value={data.Other || ""} onChange={handleChange} className="border border-gray-400 rounded px-3 py-1 w-full" />
                                </>
                            ) : (
                                <>
                                    <label className="font-semibold text-gray-700">Equipment (₹):</label>
                                    <input type="number" name="equipment" value={data.equipment || ""} onChange={handleChange} className="border border-gray-400 rounded px-3 py-1 w-full" />
                                </>
                            )}
                        </div>
                        <div className="border border-gray-400 rounded px-3 py-3 w-full-4">
                            <label className="font-semibold text-gray-700">Details of Grants Position at the End of the Year</label>
                            <ul className="list-disc pl-7">
                                <li>Balance (Carry forward to Next Year) <span className="text-gray-500">:  </span></li>
                                <li>Total Expenditure incurred <span className="text-gray-500">:  </span></li>
                            </ul>
                        </div>

                        <div className="mb-4 text-center py-4">
                            <button className="bg-blue-700 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-800 transition text-sm font-medium">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UCForm;