import { useState,useEffect,useContext } from "react";
import Sidebar from "../utils/Sidebar";
import Footer from "../components/Footer";
import PrincipalInvestigatorForm from "./form/PrincipalInvestigatorForm";
import GeneralInfo from "./form/GeneralInfo";
import TechForm from "./form/TechForm";
import BudgetForm from "./form/BudgetForm";
import BankDetailsForm from "./form/BankDetailsForm";
import Submit from "./form/ReviewAndSubmit";
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
    const [prevData,setData]=useState({});
    const {unsavedProposal}=useContext(AuthContext)
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
    
     useEffect(()=>{
            const nochange =async ()=>{
                const data=await unsavedProposal();
                const user=data.data;
                console.log("PrevDetails:",user);
                if(user.msg !=="No details Found"){
                    setData({
                        generalInfo:user.generalInfo,
                        PIdetails:user.PIdetails,
                        researchDetails:user.researchDetails, 
                        budgetSummary:user.budgetSummary,
                        nonRecurring:user.nonRecurring,
                        recurring:user.recurring,
                        bankDetails:user.bankDetails, 
                        acknowledgements:user.acknowledgements
                    })
                }
            }
            nochange();
        },[]);

    const tabContent = {
        "General Information": <GeneralInfo  generalInfo={prevData.generalInfo} />,
        "Principal Investigator": <PrincipalInvestigatorForm PIdetails={prevData.PIdetails} />,
        "Technical Details": <TechForm formData={formData.technicalDetails} updateForm={handleFormUpdate} researchDetails={prevData.researchDetails}/>,
        "Budget Related Details": <BudgetForm  budgetSummary={prevData.budgetSummary} recurring={prevData.recurring} nonRecurring={prevData.nonRecurring}/>,
        "Bank Details": <BankDetailsForm formData={formData.bankDetails} updateForm={handleFormUpdate} bankDetails={prevData.bankDetails} />,
        "Review and Submit": <Submit  generalInfo={prevData.generalInfo} formData={formData}
        PIdetails={prevData.PIdetails}
        researchDetails={prevData.researchDetails}
        budgetSummary={prevData.budgetSummary} recurring={prevData.recurring} nonRecurring={prevData.nonRecurring} bankDetails={prevData.bankDetails}/>
    };
    console.log(prevData.generalInfo);
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col flex-1 transition-all duration-300  ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
            <HomeNavbar isSidebarOpen={isSidebarOpen}/>
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
                {/* Sticky Footer */}
                <Footer />
            </div>
        </div>
    );
};
export default Dashboard;