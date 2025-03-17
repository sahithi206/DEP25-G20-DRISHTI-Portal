import React, { useState, useEffect } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import HomeNavbar from "../utils/HomeNavbar";

const ProjectDashboard = () => {
    const { id } = useParams();
    console.log(useParams());
    const navigate=useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [projectDetails, setDetails] = useState({
        generalInfo: {},
        PIdetails: { members: [] },
        researchDetails: {},
        budgetSummary: {},
        bankDetails: {}
    });

    useEffect(() => {
        const fetchProjectDetails = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Authentication required.");
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}form/get-proposal/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": token,
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch project details");
                }
                const json = await response.json();
                console.log(json);
                setDetails({
                    generalInfo: json.data.generalInfo,
                    PIdetails: json.data.PIdetails,
                    researchDetails: json.data.researchDetails,
                    budgetSummary: json.data.budgetSummary,
                    bankDetails: json.data.bankDetails
                });
                console.log(projectDetails);
            } catch (error) {
                alert(error.message || "Failed to fetch project details");
            }
        };
        fetchProjectDetails();
    }, [id]);

    const calculateTimeLeft = () => {
        const endDate = new Date(projectDetails.generalInfo.endDate);
        const startDate = new Date(projectDetails.generalInfo.startDate);
        const currentDate = new Date();
        const totalTime = endDate - startDate;
        const timeLeft = endDate - currentDate;
        return ((timeLeft / totalTime) * 100).toFixed(2);
    };
    const usedAmount = 0;
    const progressPercentage = ((usedAmount / projectDetails.budgetSummary.total) * 100).toFixed(2);
    const timeLeftPercentage = calculateTimeLeft();

    const pieData = [
        { name: "Used Amount", value: usedAmount },
        { name: "Remaining Amount", value: projectDetails.budgetSummary.total - usedAmount }
    ];

    const timeData = [
        { name: "Time Left", value: timeLeftPercentage },
        { name: "Time Passed", value: 100 - timeLeftPercentage }
    ];

    const COLORS = ["#10B981", "#E5E7EB"];

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
                    {options&&options.map((option, index) => (
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
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <HoverDropdownButton label="RTGS/Quotations" options={[{label:"View RTGS",onClick:()=>navigate("/") }, {label:"Upload Quotation", onClick:()=>navigate("/")}]} className="bg-blue-500 text-white" />
                        <HoverDropdownButton label="Upload SE/UC" options={[{label:"Upload SE",onClick:()=>navigate(`/se/${id}`) },{label:"Upload UC",onClick:()=>navigate(`/uc/${id}`) } ]} className="bg-green-500 text-white" />
                        <HoverDropdownButton label="Upload Progress Report" options={[{label:"Yearly Report",onClick:()=>navigate("/") },{label:"Final Report",onClick:()=>navigate("/") }]} className="bg-red-500 text-white" />
                        <HoverDropdownButton label="Apply for Next Cycle" options={[{label:"New Cycle Application",onClick:()=>navigate("/") },{label:"Renew Existing",onClick:()=>navigate("/") }]} className="bg-purple-500 text-white" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">{projectDetails.generalInfo.title}</h2>
                        <p className="text-gray-600 flex items-center justify-center space-x-2">
                            <span> {projectDetails.generalInfo.reference}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <div className="flex items-center mb-4">
                                <h3 className="text-xl font-semibold">Project Timeline</h3>
                            </div>
                            <p><strong>Sanctioned Amount:</strong> {projectDetails.budgetSummary.total}</p>
                            <p><strong>Used Amount:</strong>0</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col items-center">
                            <div className="flex items-center mb-4">
                                <h3 className="text-xl font-semibold">Funding Status</h3>
                            </div>
                            <div className="w-full h-48 relative">
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

                            <p className="text-l text-gray-600 mt-1">Progress: {progressPercentage}% Used</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projectDetails.PIdetails.members.map((member, index) => (
                            <div key={index} className={`bg-white rounded-xl shadow-lg p-6 border border-gray-200 ${index === 0 && projectDetails.PIdetails.members.length % 2 !== 0 ? 'col-span-2' : ''}`}>
                                <h3 className="text-xl font-semibold">{member.role} Details</h3>
                                <p><strong>Name:</strong> {member.name}</p>
                                <p><strong>Email:</strong> {member.email}</p>
                                <p><strong>Phone:</strong> {member.mobileNo}</p>
                                <p><strong>Institute Name:</strong> {member.instituteName}</p>
                                <p><strong>Department:</strong> {member.Dept}</p>
                                <p><strong>Ongoing DBT Projects:</strong> {member.DBTproj_ong}</p>
                                <p><strong>Completed DBT Projects:</strong> {member.DBTproj_completed}</p>
                                <p><strong>Ongoing Projects:</strong> {member.Proj_ong}</p>
                                <p><strong>Completed Projects:</strong> {member.Proj_completed}</p>
                                <p><strong>Address:</strong> {member.address}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-xl font-semibold">Budget Summary</h3>
                            <p><strong>Sanctioned Amount:</strong> {projectDetails.budgetSummary.total}</p>
                            <p><strong>Used Amount:</strong> {usedAmount}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-xl font-semibold">Bank Details</h3>
                            <p><strong>Bank Name:</strong> {projectDetails.bankDetails.bankName}</p>
                            <p><strong>Account Number:</strong> {projectDetails.bankDetails.accountNumber}</p>
                            <p><strong>IFSC Code:</strong> {projectDetails.bankDetails.ifscCode}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;

