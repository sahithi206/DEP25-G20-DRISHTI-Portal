import { useState } from "react";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";
import Footer from "../components/Footer";
import PrincipalInvestigatorForm from "./form/PrincipalInvestigatorForm";
import GeneralInfo from "./form/GeneralInfo";
import TechForm from "./form/TechForm";
import BudgetForm from "./form/BudgetForm";
import BankDetailsForm from "./form/BankDetailsForm";
import InvestigatorBiodata from "./form/InvestigatorBioData";

const tabs = [
    "General Information",
    "Project Investigator",
    "Technical Details",
    "Budget Related Details",
    "Bank Details",
    // "Investigators Biodata",
    // "Declaration Submission",
];

const tabContent = {
    "General Information": <GeneralInfo />,
    "Project Investigator": <PrincipalInvestigatorForm />,
    "Technical Details": <TechForm />,
    "Budget Related Details": <BudgetForm />,
    "Bank Details" : <BankDetailsForm />,

    // "Investigators Biodata": <InvestigatorBiodata />,
    // "Declaration Submission": <div> Declaration Submission </div>,
};

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTab, setCurrentTab] = useState("General Information");

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <FaUserCircle className="text-2xl" />
                        <span>Welcome, Ms. Varsha</span>
                        <FaPowerOff className="text-xl cursor-pointer text-red-500" />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6">
                    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6 border mt-6">
                        <div className="grid grid-cols-7 gap-2 mb-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`py-2 px-3 text-sm font-semibold border rounded transition text-white ${tab === currentTab ? "bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                                    onClick={() => setCurrentTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            {tabContent[currentTab] || <p>Select a tab to view content.</p>}
                        </div>
                        <div className="flex justify-between mt-6">
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
