import { useState,useEffect,useContext } from "react";
import Sidebar from "../utils/Sidebar";
import PrincipalInvestigatorForm from "./form/PrincipalInvestigatorForm";
import GeneralInfo from "./form/GeneralInfo";
import TechForm from "./form/TechForm";
import BudgetForm from "./form/BudgetForm";
import BankDetailsForm from "./form/BankDetailsForm";
import {ReviewAndSubmit} from "./form/ReviewAndSubmit";
import HomeNavbar from "../utils/HomeNavbar"
import { AuthContext } from "./Context/Authcontext";
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
    const [prevData, setData] = useState({});
    const { unsavedProposal } = useContext(AuthContext);

    const handleTabChange = async(tabName) => {
        setCurrentTab(tabName);
       await getTabColor(tabName);
    };

    const getTabColor = (tab) => {
        const sectionKey = {
            "General Information": "generalInfo",
            "Principal Investigator": "PIdetails",
            "Technical Details": "researchDetails",
            "Budget Related Details": "budgetSummary",
            "Bank Details": "bankDetails",
            "Review and Submit": "reviewSubmit",
        }[tab];

        if (tab === currentTab) {
            return "bg-blue-600";
        }
        console.log(prevData[sectionKey]);
       /* if (prevData[sectionKey] && sectionKey !== "PIdetails"&& sectionKey !== "budgetSummary") {
            return "bg-green-600";
        } else if (prevData[sectionKey] && sectionKey === "PIdetails" && prevData.PIdetails.piList.length > 0) {
            return "bg-green-600";
        }else if(prevData[sectionKey] && sectionKey ==="budgetSummary"&&prevData.nonRecurring&&prevData.nonRecurring.items.length>0){
            return "bg-green-600";
        }*/
            if (prevData[sectionKey] && Object.keys(prevData[sectionKey]).length > 0) {
                return "bg-green-600"; 
            }

        return "bg-gray-400";
    };

    useEffect(() => {
        const nochange = async () => {
            const data = await unsavedProposal();
            const user = data.data;
            if (data.msg !== "No details Found" && user) {
                setData({
                    generalInfo: user.generalInfo,
                    PIdetails: user.PIdetails,
                    researchDetails: user.researchDetails,
                    budgetSummary: user.budgetSummary,
                    nonRecurring: user.nonRecurring,
                    recurring: user.recurring,
                    bankDetails: user.bankDetails,
                    acknowledgements: user.acknowledgements
                });
            } else {
                setData({});
            }
        };
        nochange();
        console.log("PrevDetails:", prevData);
    }, [unsavedProposal]);

    const tabContent = {
        "General Information": <GeneralInfo generalInfo={prevData.generalInfo} />,
        "Principal Investigator": <PrincipalInvestigatorForm PIdetails={prevData.PIdetails} />,
        "Technical Details": <TechForm researchDetails={prevData.researchDetails} />,
        "Budget Related Details": <BudgetForm budgetSummary={prevData.budgetSummary} recurring={prevData.recurring} nonRecurring={prevData.nonRecurring} />,
        "Bank Details": <BankDetailsForm bankDetails={prevData.bankDetails} />,
        "Review and Submit": (
            <ReviewAndSubmit
                generalInfo={prevData.generalInfo}
                PIdetails={prevData.PIdetails}
                researchDetails={prevData.researchDetails}
                budgetSummary={prevData.budgetSummary}
                recurring={prevData.recurring}
                nonRecurring={prevData.nonRecurring}
                bankDetails={prevData.bankDetails}
                onEditDetails={handleTabChange} 
            />
        )
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col flex-1 transition-all duration-300  ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={"/formsubmission"} />
                <div className="p-6 space-y-6 mt-16">
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;