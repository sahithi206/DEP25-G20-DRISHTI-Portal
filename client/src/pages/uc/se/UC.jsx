import React, { useState,useContext,useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const url = import.meta.env.VITE_REACT_APP_URL;

const UCForm = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);;
        const navigate = useNavigate();
                const [user,setUser]=useState({});
                const {getuser}=useContext(AuthContext);
        
        const [data,setData]=useState({
            projectId:"",
            grantType:"nonRecurring",
            endDate:"",
            startDate:"",
            institute:"",
            name:"",
            title:"",
            scheme:"",
            currentYear:"",
            CarryForward:0,
            nonRecurring:0,
            recurring:0,
            human_resources:0,
            consumables:0,
            others:0,
            yearTotal:0,
            total:0
        });
        const { id } = useParams();

        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
       
        const {getProject}=useContext(AuthContext);
        useEffect(() => {
            const fetchProjectDetails = async () => {
                try {
                    const user= await getuser();
                    setUser(user);
                    const json = await getProject(id);
                    const info = json.data;
                    const newData = {
                        projectId: info.project?._id || "",
                        institute: info.generalInfo?.instituteName || "NA",
                        name: info.generalInfo?.name || "NA",
                        title: info.project?.Title || "NA",
                        scheme: info.project?.Scheme || "NA",
                        currentYear: info.project?.currentYear || "NA",
                        CarryForward: info.project?.CarryForward || 0,
                        grantType: data.grantType
                    };
                    console.log(info.budgetused);
                    if (data.grantType === "recurring") {
                        newData.yearTotal= info.budget?.recurring.total || 0,
                        newData.recurring = info.budgetused?.recurring.total || 0;
                        newData.human_resources = info.budgetused?.recurring.human_resources || 0;
                        newData.consumables = info.budgetused?.recurring.consumables || 0;
                        newData.others = info.budgetused?.recurring.others || 0;
                    } else {
                        newData.yearTotal= info.budget?.nonRecurring || 0,
                        newData.nonRecurring = info.budgetused?.nonRecurring || 0;
                    }
        
                    setData(prevData => ({
                        ...prevData,
                        ...newData,
                        total: newData.CarryForward + newData.yearTotal
                    }));
                } catch (error) {
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProjectDetails();
        }, [id, data.grantType]);
    const handleChange = (e) => {
        setData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication required.");
            return;
        }
        try {
            const endpoint = data.grantType === "recurring" 
              ? `${url}projects/uc/recurring/${id}`
              : `${url}projects/uc/nonRecurring/${id}`;
            
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": ` ${token}`,
                },
                body: JSON.stringify({data}),
            });
    
            if (!response.ok) throw new Error("Submission failed");
            
            const json = await response.json();
            if(json.success)
            {alert("Data submitted successfully!");}
            else{alert("Error in Submitting form");}
            navigate(`/project-dashboard/${id}`)
        } catch (error) {
            console.error("Error:", error);
            alert("Error in submitting data!");
        }
    };
    
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Final Utilization Certificate of the Financial Year</p>
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
                            <span className="px-3 py-1 w-full">: {user.Name}</span>
                            <label className="font-semibold text-gray-700">Title of the Project</label>
                            <span className="px-3 py-1 w-full">: {data.title}</span>
                            <label className="font-semibold text-gray-700">Name of the Scheme</label>
                            <span className="px-3 py-1 w-full">: {data.scheme}</span>
                            <label className="font-semibold text-gray-700">Present Year of Project</label>
                            <span className="px-3 py-1 w-full">: {data.currentYear}</span>
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
                                            <td className="border border-gray-400 px-4 py-2">₹ {data.grantType==="recurring"?data.recurring:data.nonRecurring}</td>
                                            <td className="border border-gray-400 px-4 py-2">₹ {data.grantType==="recurring"?data.total-data.recurring:data.total-data.nonRecurring}</td>
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
                                    <input type="number" name="humanResources" value={data.human_resources || 0} onChange={handleChange} placeholder={data.human_resources}  className="border border-gray-400 rounded px-3 py-1 w-full" />

                                    <label className="font-semibold text-gray-700">Consumables (₹):</label>
                                    <input type="number" name="consumables" value={data.consumables || 0} onChange={handleChange} placeholder={data.consumables}  className="border border-gray-400 rounded px-3 py-1 w-full" />

                                    <label className="font-semibold text-gray-700">Other (₹):</label>
                                    <input type="number" name="Other" value={data.others || 0} onChange={handleChange} placeholder={data.others}  className="border border-gray-400 rounded px-3 py-1 w-full" />
                                </>
                            ) : (
                                <>
                                    <label className="font-semibold text-gray-700">Equipment (₹):</label>
                                    <input type="number" name="equipment" value={data.nonRecurring || 0} onChange={handleChange} placeholder={data.nonRecurring}  className="border border-gray-400 rounded px-3 py-1 w-full" />
                                </>
                            )}
                        </div>
                        <div className="border border-gray-400 rounded px-3 py-3 w-full-4">
                            <label className="font-semibold text-gray-700">Details of Grants Position at the End of the Year</label>
                            <ul className="list-disc pl-7">
                                <li>Balance (Carry forward to Next Year) <span className="text-gray-500">: ₹ {data.CarryForward}</span></li>
                                <li>Total Expenditure incurred <span className="text-gray-500">: ₹ {data.grantType==="recurring"?data.total-data.recurring:data.total-data.nonRecurring}</span></li>
                            </ul>
                        </div>

                        <div className="mb-4 text-center py-4">
                        <button
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-700 transition-all duration-200 shadow-md"
                            onClick={handleSubmit}
                        >
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