import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ProjectDashboard = () => {
    const { id } = useParams();
    console.log(useParams());
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
                const response = await fetch(`http://localhost:8000/form/get-proposal/${id}`, {
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
    const usedAmount=0;
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

    const ActionButton = ({ children, className }) => (
        <button className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-transform transform hover:scale-105 shadow-md ${className}`}>
            <span>{children}</span>
        </button>
    );

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
            <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"}`}>
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, Ms. Varsha</span>
                    </div>
                </header>

                <div className="p-6 space-y-6">
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
                            {/*<p><strong>Start Date:</strong> {projectDetails.generalInfo.startDate}</p>
                            <p><strong>End Date:</strong> {projectDetails.generalInfo.endDate}</p>*/}
                            <p><strong>Sanctioned Amount:</strong> {projectDetails.budgetSummary.total}</p>
                            <p><strong>Used Amount:</strong> 0</p>
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
                            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
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
                            <p><strong>Sanctioned Amount:</strong> {projectDetails.budgetSummary.sanctionedAmount}</p>
                            <p><strong>Used Amount:</strong> {projectDetails.budgetSummary.usedAmount}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-xl font-semibold">Bank Details</h3>
                            <p><strong>Bank Name:</strong> {projectDetails.bankDetails.bankName}</p>
                            <p><strong>Account Number:</strong> {projectDetails.bankDetails.accountNumber}</p>
                            <p><strong>IFSC Code:</strong> {projectDetails.bankDetails.ifscCode}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col items-center">
                            <div className="flex items-center mb-4">
                                <h3 className="text-xl font-semibold">Time Left</h3>
                            </div>
                            <div className="w-full h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={timeData} cx="50%" cy="50%" outerRadius="90%" dataKey="value">
                                            {timeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <p className="text-l text-gray-600 mt-1">Time Left: {timeLeftPercentage}%</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ActionButton className="bg-blue-500 text-white">View Quotations</ActionButton>
                        <ActionButton className="bg-green-500 text-white">Recurring Grant</ActionButton>
                        <ActionButton className="bg-purple-500 text-white">Non-Recurring Grant</ActionButton>
                        <ActionButton className="bg-orange-500 text-white">Apply Next Cycle</ActionButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;



// import React, { useState } from "react";
// import { useParams } from "react-router-dom";
// import Sidebar from "../utils/Sidebar";
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
// import { FaPowerOff, FaUserCircle, FaCalendarAlt, FaMoneyBillWave, FaClipboardList, FaChartLine, FaFileInvoiceDollar, FaRegCalendarCheck, FaRegClock } from "react-icons/fa";

// const ProjectDashboard = () => {
//     const { id } = useParams();
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//     const projectDetails = {
//         id,
//         title: "AI-Based Agriculture Analysis",
//         reference: "ANRF-12345",
//         startDate: "2024-01-01",
//         endDate: "2026-01-01",
//         totalCost: "₹10,00,000",
//         sanctionedAmount: 800000,
//         usedAmount: 450000,
//     };

//     const progressPercentage = ((projectDetails.usedAmount / projectDetails.sanctionedAmount) * 100).toFixed(2);

//     const pieData = [
//         { name: "Used Amount", value: projectDetails.usedAmount },
//         { name: "Remaining Amount", value: projectDetails.sanctionedAmount - projectDetails.usedAmount }
//     ];

//     const COLORS = ["#10B981", "#E5E7EB"];

//     const ActionButton = ({ children, className, icon: Icon }) => (
//         <button className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-transform transform hover:scale-105 shadow-md ${className}`}>
//             {Icon && <Icon className="w-5 h-5" />}
//             <span>{children}</span>
//         </button>
//     );

//     return (
//         <div className="flex min-h-screen bg-gray-100">
//             <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
//             <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"}`}>
//             <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
//                     <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
//                     <div className="flex items-center space-x-4">
//                         <FaUserCircle className="text-2xl" />
//                         <span>Welcome, Ms. Varsha</span>
//                         <FaPowerOff className="text-xl cursor-pointer text-red-500" />
//                     </div>
//                 </header>

//                 <div className="p-6 space-y-6">
//                     <div className="text-center">
//                         <h2 className="text-3xl font-extrabold text-gray-900">{projectDetails.title}</h2>
//                         <p className="text-gray-600 flex items-center justify-center space-x-2">
//                             <FaClipboardList className="text-blue-600" />
//                             <span>Reference: {projectDetails.reference}</span>
//                         </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//                             <div className="flex items-center mb-4">
//                                 <FaCalendarAlt className="text-blue-600 mr-3 w-6 h-6" />
//                                 <h3 className="text-xl font-semibold">Project Timeline</h3>
//                             </div>
//                             <p><strong>Start Date:</strong> {projectDetails.startDate}</p>
//                             <p><strong>End Date:</strong> {projectDetails.endDate}</p>
//                             <p><strong>Total Cost:</strong> {projectDetails.totalCost}</p>
//                         </div>

//                         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col items-center">
//                             <div className="flex items-center mb-4">
//                                 <FaChartLine className="text-green-600 mr-3 w-6 h-6" />
//                                 <h3 className="text-xl font-semibold">Funding Status</h3>
//                             </div>
//                             <div className="w-full h-48 relative">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie data={pieData} cx="50%" cy="50%" outerRadius="90%" dataKey="value">
//                                             {pieData.map((entry, index) => (
//                                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                                             ))}
//                                         </Pie>
//                                         <Tooltip />
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                             </div>
                            
//                             <p className="text-l text-gray-600 mt-1">Progress: {progressPercentage}% Used</p>
                    
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <ActionButton icon={FaFileInvoiceDollar} className="bg-blue-500 text-white">View Quotations</ActionButton>
//                         <ActionButton icon={FaMoneyBillWave} className="bg-green-500 text-white">Recurring Grant</ActionButton>
//                         <ActionButton icon={FaMoneyBillWave} className="bg-purple-500 text-white">Non-Recurring Grant</ActionButton>
//                         <ActionButton icon={FaRegCalendarCheck} className="bg-orange-500 text-white">Apply Next Cycle</ActionButton>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProjectDashboard;
