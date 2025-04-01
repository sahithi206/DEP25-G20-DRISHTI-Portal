import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ProjectDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState({});
    const [generalInfo, setGeneral] = useState({});
    const [researchDetails, setResearch] = useState({});
    const [budget, setBudget] = useState({});
    const [budgetused, setbudget] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pilist, setPI] = useState([]);
    const [copilist, setCopi] = useState([]);
    useEffect(() => {
        const fetchProjectDetails = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("Use a valid Token");
                alert("Authentication required.");
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}projects/get-project/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": ` ${token}`,
                    },
                });
                console.log(response);
                if (!response.ok) {
                    throw new Error("Failed to fetch project details");
                }

                const data = await response.json();
                setProject(data.project);
                setGeneral(data.generalInfo);
                setResearch(data.researchDetails);
                setBudget(data.budget);
                setbudget(data.budgetused);
                if (data.PIDetails && data.PIDetails.piList.length > 0) {
                    setPI(data.PIDetails.piList)
                }
                if (data.PIDetails && data.PIDetails.coPiList.length > 0) {
                    setCopi(data.PIDetails.coPiList)
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetails();
    }, [id]);

    const calculateTimeLeft = () => {
        const endDate = new Date(project.endDate);
        const startDate = new Date(project.startDate);
        const currentDate = new Date();
        const totalTime = endDate - startDate;
        const timeLeft = endDate - currentDate;

        return ((timeLeft / totalTime) * 100).toFixed(2);
    };
    const usedAmount = project.TotalUsed;
    const progressPercentage = ((usedAmount / project.TotalCost) * 100).toFixed(2);
    const timeLeftPercentage = calculateTimeLeft();

    const pieData = [
        { name: "Used Amount", value: usedAmount },
        { name: "Remaining Amount", value: project.TotalCost - usedAmount }
    ];

    const timeData = [
        { name: "Time Left", value: Number(timeLeftPercentage) },
        { name: "Time Passed", value: Number(100 - timeLeftPercentage) }
    ];

    const COLORS = ["#3B82F6", "#22C55E"];

    const HoverDropdownButton = ({ label, options, className }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <div
                className="relative"
                onClick={() => { isOpen === true ? setIsOpen(false) : setIsOpen(true) }}
            >
                <button className={`w-full flex items-center justify-center px-6 py-3 rounded-lg transition-transform transform hover:scale-105 shadow-md ${className}`}>
                    {label}
                </button>
                {isOpen && (
                    <div className="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-lg z-10">
                        {options && options.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.onClick}
                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };
    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={"/ongoingproposals"} />

                <div className="p-6 space-y-6 mt-16">
                    <div className="p-6 space-y-6">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">Project Dashboard</h1>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <HoverDropdownButton label="RTGS/Quotations" options={[{ label: "View RTGS", onClick: () => navigate("/") }, { label: "Upload Quotation", onClick: () => navigate(`/quotations/${id}`) }]} className="bg-blue-500 text-white" />
                            <HoverDropdownButton label="Upload SE/UC" options={[{ label: "Upload SE", onClick: () => navigate(`/se/${id}`) }, { label: "Generate UC", onClick: () => navigate(`/uc/${id}`) }, { label: "View Certificates", onClick: () => navigate(`/certificates/${id}`) }]} className="bg-green-500 text-white" />
                            <HoverDropdownButton label="Upload Progress Report" options={[{ label: "Yearly Report", onClick: () => navigate(`/progress-report/${id}`) }, { label: "Final Report", onClick: () => navigate(`/final-report/${id}`) }]} className="bg-red-500 text-white" />
                            <HoverDropdownButton label="Expenses" options={[{ label: "Expense", onClick: () => navigate(`/project-expenses/${id}`) }]} className="bg-purple-500 text-white" />
                        </div>
                        {loading ? (
                            <p className="text-center text-lg font-semibold text-gray-700">Loading project details...</p>
                        ) : error ? (
                            <p className="text-center text-lg font-semibold text-red-600">{error}</p>
                        ) : (
                            <div className="bg-white shadow-md rounded-xl p-6">

                                <div className="border border-gray-300 rounded px-3 py-3 w-full-4">
                                    <h3 className="mt-2 mb-3 text-lg font-semibold text-gray-600 b uppercase tracking-wide">
                                        Basic Information
                                    </h3>
                                    <div className="border-b border-gray-300 my-4"></div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">Name of the Reserch Institute</span> : {generalInfo.instituteName}</label>
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">Name of Principal Investigator</span> : {generalInfo.name}</label>
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">Title of the Project</span> : {project.Title}</label>
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">Name of the Scheme</span> : {project.Scheme}</label>
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">Start Date</span> : {project.startDate}</label>
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">End Date</span> : {project.endDate}</label>
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">Duration of Project</span> : {project.years.toFixed(2)} years </label>
                                        <label className="font-medium text-gray-700 text-sm"><span className="font-semibold">Present Year of Project</span> : {project.currentYear}</label>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">

                                        <div>
                                            <div className="border-b border-gray-300 my-4"></div>
                                            <div className="flex justify-between items-center px-5 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-600 uppercase tracking-wide ">
                                                    Time Left
                                                </h3>
                                                <p className="text-sm text-gray-600 ">
                                                    {timeData[0].value.toFixed(1)}% Time Left, {timeData[1].value.toFixed(1)}% Passed
                                                </p>
                                            </div>

                                            <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-blue-700 transition-all duration-500"
                                                    style={{ width: `${timeData[0].value}%` }}
                                                ></div>
                                            </div>


                                        </div>
                                    </div>

                                </div>
                                <div className="p-4 space-y-3"></div>
                                <div className="border border-gray-300 rounded px-3 py-3 w-full-4">
                                    <h3 className="mt-2 mb-3 text-lg font-semibold text-gray-600 uppercase tracking-wide">
                                        Funding Information
                                    </h3>
                                    <div className="border-b border-gray-300 my-4"></div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="grid grid-cols-1 gap-3 mb-4">
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <label className="font-medium text-gray-700"><span className="font-semibold">Total Cost of Project</span> : {project.TotalCost}</label>
                                                <label className="font-medium text-gray-700"><span className="font-semibold">Total Used Amount : </span>{project.TotalUsed}</label>
                                            </div>
                                            <label className="font-semibold text-gray-700">Budget Summary for Current Financial Year</label>
                                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                                <table className="w-full border-collapse bg-white">
                                                    <thead className="bg-gray-200">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Type</th>
                                                            <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Non-recurring Cost</th>
                                                            <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Recurring cost</th>
                                                            <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b border-gray-200 my-4">
                                                            <td className="px-2 py-2 text-sm">Sanctioned</td>
                                                            <td className="px-6 py-2 text-sm">{budget.nonRecurring}</td>
                                                            <td className="px-6 py-2 text-sm">{budget.recurring.total}</td>
                                                            <td className="px-6 py-2 text-sm">{budget.yearTotal}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-2 py-2 text-sm">Used</td>
                                                            <td className="px-6 py-2 text-sm">{budgetused.nonRecurring || 0}</td>
                                                            <td className="px-6 py-2 text-sm">{budgetused.recurring.total || 0}</td>
                                                            <td className="px-6 py-2 text-sm">{budgetused.yearTotal || 0}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>


                                        </div>
                                        <div className="w-full h-84 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius="90%" dataKey="value">
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3"></div>

                                <div className="border border-gray-300 rounded px-3 py-3 w-full-4">
                                    <h3 className="mt-2 mb-3 text-lg font-semibold text-gray-600 b uppercase tracking-wide">
                                        Techincal Details
                                    </h3>
                                    <div className="border-b border-gray-300 my-2"></div>
                                    <div className="grid grid-cols-1 gap-2 mb-2 p-3 ">
                                        <div>
                                            <p className="font-semibold text-gray-700">Objectives of the Project</p>
                                            {researchDetails?.objectives?.length > 0 ? (
                                                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                                    {researchDetails.objectives.map((obj, index) => (
                                                        <p key={index}>{obj}</p>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-400 italic">No objectives listed.</p>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-700">About Project:</p>
                                            <p className="text-gray-700 text-sm">{researchDetails.Summary || "No summary available."}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-700">Expected Output of the Project:</p>
                                            <p className="text-gray-700 text-sm">{researchDetails.Output ? researchDetails.Output : "N/A"} </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3"></div>

                                <div className="border border-gray-300 rounded px-3 py-3 w-full-4">
                                    <h3 className="mt-2 mb-3 text-lg font-semibold text-gray-600 b uppercase tracking-wide">
                                        PI/Co-PI Details
                                    </h3>
                                    <div className="border-b border-gray-300 my-2"></div>
                                    <div className="grid grid-cols-1 gap-2 p-3 ">
                                        {pilist && pilist.length > 0 ?
                                            (<>
                                                <h2 className="text-m text-gray-600 font-semibold mb-2">PI Information</h2>
                                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                                    <table className="w-full border-collapse bg-white">
                                                        <thead className="bg-gray-200">
                                                            <tr className="bg-gray-100">
                                                                <th className="border p-2">Name</th>
                                                                <th className="border p-2">Institute</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pilist.map((pi, index) => (
                                                                <tr key={index} className="border">
                                                                    <td className="border p-2 text-center">{pi.Name}</td>
                                                                    <td className="border p-2 text-center">{pi.Institute}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                            ) : ([])}
                                    </div>
                                    <div className="p-2 space-y-2"></div>

                                    <div className="border-b border-gray-300 my-2"></div>
                                    <div className="grid grid-cols-1 p-3 ">
                                        {copilist && copilist.length > 0 ?
                                            (
                                                <>
                                                    <h2 className="text-m text-gray-600 font-semibold mb-2">Co-PI Information</h2>
                                                    <div className="overflow-hidden rounded-lg border border-gray-200">
                                                        <table className="w-full border-collapse bg-white">
                                                            <thead className="bg-gray-200">
                                                                <tr className="bg-gray-100">
                                                                    <th className="border p-2">Name</th>
                                                                    <th className="border p-2">Institute</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {copilist.map((pi, index) => (
                                                                    <tr key={index} className="border">
                                                                        <td className="border p-2">{pi.Name}</td>
                                                                        <td className="border p-2">{pi.Institute}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            ) : ([])}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;
