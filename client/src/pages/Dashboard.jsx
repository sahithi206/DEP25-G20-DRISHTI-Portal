import { useState } from "react";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";
import Footer from "../components/Footer";
import PrincipalInvestigatorForm from "./form/PrincipalInvestigatorForm";
import GeneralInfo from "./form/GeneralInfo";
import TechForm from "./form/TechForm";
import BudgetForm from "./form/BudgetForm";
import BankDetailsForm from "./form/BankDetailsForm";
import Submit from "./form/ReviewAndSubmit";
import HomeNavbar from "../utils/HomeNavbar"

const tabs = [
    "General Information",
    "Principal Investigator",
    "Technical Details",
    "Budget Related Details",
    "Bank Details",
    "Review and Submit",
];

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTab, setCurrentTab] = useState("General Information");

    // State to store form data
    const [formData, setFormData] = useState({
        generalInfo: {},
        principalInvestigator: {},
        technicalDetails: {},
        budgetDetails: {
            recurring: {
                material: [],
                manpower: [],
                others: []
            },
            nonRecurring: {
                items: []
            }
        },
        bankDetails: {}
    });

    // Function to update form data
    const handleFormUpdate = (section, data) => {
        setFormData((prev) => ({ ...prev, [section]: data }));
    };

    const getTabColor = (tab) => {
        const sectionKey = {
            "General Information": "generalInfo",
            "Principal Investigator": "principalInvestigator",
            "Technical Details": "technicalDetails",
            "Budget Related Details": "budgetDetails",
            "Bank Details": "bankDetails",
            "Review and Submit": "reviewSubmit",
        }[tab];

        if (tab === currentTab) {
            return "bg-red-600";
        }

        if (!formData[sectionKey] || Object.keys(formData[sectionKey]).length === 0) {
            return "bg-gray-800";
        }

        let filledFields = 0;
        let totalFields = 0;

        if (sectionKey === "budgetDetails") {
            const budgetSections = formData.budgetDetails || {};
            Object.values(budgetSections).forEach((category) => {
                Object.values(category).forEach((items) => {
                    totalFields += items.length;
                    filledFields += items.filter((val) => val !== "" && val !== null).length;
                });
            });
        } else {
            filledFields = Object.values(formData[sectionKey]).filter((val) => val !== "" && val !== null).length;
            totalFields = Object.keys(formData[sectionKey]).length;
        }

        if (filledFields === totalFields && totalFields > 0) {
            return "bg-green-600";
        } else if (filledFields > 0) {
            return "bg-orange-500";
        }

        return "bg-gray-800";
    };



    const tabContent = {
        "General Information": <GeneralInfo formData={formData.generalInfo} updateForm={handleFormUpdate} />,
        "Principal Investigator": <PrincipalInvestigatorForm formData={formData.principalInvestigator} updateForm={handleFormUpdate} />,
        "Technical Details": <TechForm formData={formData.technicalDetails} updateForm={handleFormUpdate} />,
        "Budget Related Details": <BudgetForm formData={formData.budgetDetails} updateForm={handleFormUpdate} />,
        "Bank Details": <BankDetailsForm formData={formData.bankDetails} updateForm={handleFormUpdate} />,
        "Review and Submit": <Submit formData={formData} />,
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
                <HomeNavbar />

                {/* Main Content Area */}
                <main className="flex-1 p-6">
                    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 border mt-6">
                        <div className="grid grid-cols-7 gap-2 mb-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`py-2 px-3 text-sm font-semibold border rounded transition text-white ${getTabColor(tab)} hover:opacity-90`}
                                    onClick={() => setCurrentTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            {tabContent[currentTab] || <p>Select a tab to view content.</p>}
                        </div>
                        <div className="flex justify-center mt-6 space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded transition hover:bg-gray-400 disabled:opacity-50"
                                onClick={() => {
                                    const index = tabs.indexOf(currentTab);
                                    if (index > 0) setCurrentTab(tabs[index - 1]);
                                }}
                                disabled={currentTab === tabs[0]}
                            >
                                Previous
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded transition hover:bg-blue-700 disabled:opacity-50"
                                onClick={() => {
                                    const index = tabs.indexOf(currentTab);
                                    if (index < tabs.length - 1) setCurrentTab(tabs[index + 1]);
                                }}
                                disabled={currentTab === tabs[tabs.length - 1]}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </main>

                {/* Sticky Footer */}
                <Footer />
            </div>
        </div>
    );
};
export default Dashboard;