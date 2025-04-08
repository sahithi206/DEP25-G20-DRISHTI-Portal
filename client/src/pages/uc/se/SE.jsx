import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
import jsPDF from "jspdf";
import "jspdf-autotable";

const url = import.meta.env.VITE_REACT_APP_URL;

const SEForm = () => {
    const seRef = useRef();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);;
    const navigate = useNavigate();
    const [user, setUser] = useState();
    const { getuser } = useContext(AuthContext);
    const [yearlyBudget, setYearly] = useState([]);
    const [budgetSanctioned, setSanctioned] = useState({});
    const [yearlyExp, setYearlyExp] = useState([]);
    const [budget, setBudget] = useState([]);
    const [manpower, setManpower] = useState([]);
    const [consumables, setConsumables] = useState([]);
    const [travel, setTravel] = useState([]);
    const [overhead, setOverhead] = useState([]);
    const [total, setTotal] = useState([]);
    const [totalExp,setExp]=useState({});
    const [balance,setBalance]=useState({});
    const [others, setOthers] = useState([]);
    const [equipment, setEquipment] = useState([]);

    const [data, setData] = useState({
        name:"",
        projectId: "",
        endDate: "",
        startDate: "",
        institute: "",
        title: "",
        scheme: "",
        currentYear: "",
        TotalCost: 0
    });
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { getProject } = useContext(AuthContext);
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const json = await getProject(id);
                const info = json?.data || {};
                console.log(info);

                setYearlyExp(info.yearlyExp || []);
    
                const today = new Date().toISOString().split("T")[0]; 
                const formattedStartDate = info.project?.startDate
                    ? new Date(info.project.startDate).toLocaleDateString("en-GB")
                    : "NA";
                const formattedEndDate = today
                    ? new Date(today).toLocaleDateString("en-GB")
                    : "NA";

                setData(prevData => ({
                    ...prevData,
                    projectId: info.project?._id || "",
                    name: info.generalInfo?.name || "NA",
                    institute: info.generalInfo?.instituteName || "NA",
                    name: info.generalInfo?.name || "NA",
                    title: info.project?.Title || "NA",
                    scheme: info.project?.Scheme || "NA",
                    currentYear: info.project?.currentYear || "NA",
                    TotalCost: info.project?.TotalCost || 0,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                }));
                if(info.project?.budgetTotal){
                    setSanctioned({
                        "human_resources":info.project.budgetTotal?.recurring?.human_resources,
                        "consumables":info.project.budgetTotal?.recurring?.consumables,
                        "others":info.project.budgetTotal?.recurring?.others,
                        "nonRecurring":info.project.budgetTotal?.nonRecurring,
                        "overhead":info.project.budgetTotal?.overhead,
                        "travel":info.project.budgetTotal?.recurring?.travel,
                        "total":info.project.budgetTotal?.total
                    });

                }
                setYearly(info.yearlySanct || []);
                console.log("Yearly Budget",info.yearlySanct);
                console.log("Yearly Budget",yearly);
                setBudget(info.yearlyExp || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchProjectDetails();
    }, [id]);
    
    // useEffect(() => {
    //     if (!budget || !budgetSanctioned) return;
    
    //     let manpowerExp = 0, consumablesExp = 0, othersExp = 0, equipmentExp = 0, totalExp = 0;
    //     let manpowerArray = [], consumablesArray = [], othersArray = [], equipmentArray = [], totalArray = [], travelArray = [], overheadArray = [];
    //     let travelExp = 0, overheadExp = 0;
    
    //     budget.forEach(val => {
    //         if (val?.recurring?.human_resources !== undefined) {
    //             manpowerExp += val.recurring.human_resources;
    //             manpowerArray.push(val.recurring.human_resources);
    //         }
    //         if (val?.recurring?.consumables !== undefined) {
    //             consumablesExp += val.recurring.consumables;
    //             consumablesArray.push(val.recurring.consumables);
    //         }
    //         if (val?.recurring?.others !== undefined) {
    //             othersExp += val.recurring.others;
    //             othersArray.push(val.recurring.others);
    //         }
    //         if (val?.recurring?.travel !== undefined) {
    //             travelExp += val.recurring.travel;
    //             travelArray.push(val.recurring.travel);
    //         }
    //         if (val?.nonRecurring !== undefined) {
    //             equipmentExp += val.nonRecurring;
    //             equipmentArray.push(val.nonRecurring);
    //         }
    //         if (val?.overhead !== undefined) {
    //             overheadExp += val.overhead;
    //             overheadArray.push(val.overhead);
    //         }
    //         if (val?.yearTotal !== undefined) {
    //             totalExp += val.yearTotal;
    //             totalArray.push(val.yearTotal);
    //         }
    //     });
    
    //     setManpower(manpowerArray);
    //     setConsumables(consumablesArray);
    //     setOthers(othersArray);
    //     setEquipment(equipmentArray);
    //     setTotal(totalArray);
    //     setTravel(travelArray);
    //     setOverhead(overheadArray);
        
    //     setExp({
    //         human_resources: manpowerExp,
    //         consumables: consumablesExp,
    //         others: othersExp,
    //         nonRecurring: equipmentExp,
    //         total: totalExp,
    //         travel: travelExp,
    //         overhead: overheadExp,

    //       });
          
        
    //       setBalance({
    //         human_resources: (budgetSanctioned?.human_resources || 0) - manpowerExp,
    //         consumables: (budgetSanctioned?.consumables || 0) - consumablesExp,
    //         others: (budgetSanctioned?.others || 0) - othersExp,
    //         nonRecurring: (budgetSanctioned?.nonRecurring || 0) - equipmentExp,
    //         total: data.TotalCost - totalExp,
    //         travel: (budgetSanctioned?.travel || 0) - travelExp,
    //         overhead: (budgetSanctioned?.overhead || 0) - overheadExp,
    //       });
          
    
    // }, [budget]);


    useEffect(() => {
        if (!budget || !yearlyExp) return;
    
        let manpowerExp = 0, consumablesExp = 0, othersExp = 0, equipmentExp = 0, totalExp = 0;
        let manpowerArray = [], consumablesArray = [], othersArray = [], equipmentArray = [], totalArray = [], travelArray = [], overheadArray = [];
        let travelExp = 0, overheadExp = 0;
    
        console.log("wjnfewf",yearlyExp)
        yearlyExp.forEach((yearData, index) => {
            console.log("Year Data", yearData);
            if (yearData?.recurring?.human_resources !== undefined) {
                manpowerExp += yearData.recurring.human_resources;
                manpowerArray.push(yearData.recurring.human_resources);
                console.log("Manpower weiuf", manpowerArray);
            }
            if (yearData?.recurring?.consumables !== undefined) {
                consumablesExp += yearData.recurring.consumables;
                consumablesArray.push(yearData.recurring.consumables);
            }
            if (yearData?.recurring?.others !== undefined) {
                othersExp += yearData.recurring.others;
                othersArray.push(yearData.recurring.others);
            }
            if (yearData?.recurring?.travel !== undefined) {
                travelExp += yearData.recurring.travel;
                travelArray.push(yearData.recurring.travel);
            }
            if (yearData?.nonRecurring !== undefined) {
                equipmentExp += yearData.nonRecurring;
                equipmentArray.push(yearData.nonRecurring);
            }
            if (yearData?.overhead !== undefined) {
                overheadExp += yearData.overhead;
                overheadArray.push(yearData.overhead);
            }
            if (yearData?.yearTotal !== undefined) {
                totalExp += yearData.yearTotal;
                totalArray.push(yearData.yearTotal);
            }
        });
    
        setManpower(manpowerArray);
        setConsumables(consumablesArray);
        setOthers(othersArray);
        setEquipment(equipmentArray);
        setTotal(totalArray);
        setTravel(travelArray);
        setOverhead(overheadArray);
    
        setExp({
            human_resources: manpowerExp,
            consumables: consumablesExp,
            others: othersExp,
            nonRecurring: equipmentExp,
            total: totalExp,
            travel: travelExp,
            overhead: overheadExp,
        });
    
        setBalance({
            human_resources: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.human_resources || 0), 0) - manpowerExp,
            consumables: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.consumables || 0), 0) - consumablesExp,
            others: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.others || 0), 0) - othersExp,
            nonRecurring: yearlyBudget.reduce((acc, val, i) => acc + (val?.nonRecurring || 0), 0) - equipmentExp,
            total: yearlyBudget.reduce((acc, val) => acc + (val?.yearTotal || 0), 0) - totalExp,
            travel: yearlyBudget.reduce((acc, val, i) => acc + (val?.recurring?.travel || 0), 0) - travelExp,
            overhead: yearlyBudget.reduce((acc, val, i) => acc + (val?.overhead || 0), 0) - overheadExp,
        });
    }, [yearlyExp]);
    

    console.log(budget);
    console.log("Manpower", manpower);
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
            const response = await fetch(`${url}projects/se`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": ` ${token}`,
                },
                body: JSON.stringify({ data:data,yearlyBudget:yearlyBudget,
                    budgetSanctioned:budgetSanctioned,
                    manpower:manpower,consumables:consumables,
                    others:others,equipment:equipment,
                    total:total,totalExp:totalExp,balance:balance }),
            });

            if (!response.ok) throw new Error("Submission failed");

            const json = await response.json();
            if (json.success) { alert("Data submitted successfully!"); }
            else { alert("Error in Submitting form"); }
            navigate(`/project-dashboard/${id}`)
        } catch (error) {
            console.error("Error:", error);
            alert("Error in submitting data!");
        }
    };

    const handleSaveAsPDF = () => {
        console.log("iqbeff", data);

        const doc = new jsPDF("l", "mm", "a4"); 

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("RESEARCHX", 148.5, 10, { align: "center" });
        doc.setFontSize(14);
        doc.setFont("helvetica");
        doc.text("Statement of Expenditure", 148.5, 15, { align: "center" });

        doc.setFontSize(12);
        doc.text("Request for Annual Installment with Up-to-Date Statement of Expenditure", 148.5, 25, { align: "center" });
        doc.text(`For Financial Year: ${financialYear}`, 148.5, 30, { align: "center" });


        doc.setFontSize(10);
        doc.text(`1.File No.: ${data.projectId || "NA"}`, 10, 35);
        doc.text(`2. Name of the PI: ${data.name || "NA"}`, 10, 40);
        doc.text(`3. Total Project Cost: ${data.TotalCost || "NA"}`, 10, 45);
        doc.text(`4. Date of Commencement: ${data.startDate || "NA"}`, 10, 50);
        doc.text("5. Statement of Expenditure: (Enclosed)", 10, 55);
    
        doc.text("Grant Received in Each Year:", 10, 65);
        yearlyBudget.forEach((amount, index) => {
            doc.text(`Year ${index + 1}: ${amount}`, 15, 70 + index * 5);
        });

        const headers = [
            ["S/N", "Sanctioned Heads", "Total Funds Sanctioned", "Expenditure Incurred", "Balance"],
        ];

        const tableData = [
            { name: "Manpower Costs", key: "human_resources" },
            { name: "Consumables", key: "consumables" },
            { name: "Travel", key: "travel" },
            { name: "Other Costs", key: "others" },
            { name: "Equipment", key: "nonRecurring" },
            { name: "Overhead Expenses", key: "overhead" },
        ].map((head, index) => [
            index + 1,
            head.name,
            budgetSanctioned[head.key] || 0,
            ...yearlyExp.map((yearData) => yearData?.recurring?.[head.key] || yearData?.[head.key] || 0),
            yearlyExp.reduce((acc, val) => acc + (val?.recurring?.[head.key] || val?.[head.key] || 0), 0),
            (budgetSanctioned[head.key] || 0) -
                yearlyExp.reduce((acc, val) => acc + (val?.recurring?.[head.key] || val?.[head.key] || 0), 0),
        ]);

        tableData.push([
            yearlyExp.length + 1,
            "Total",
            budgetSanctioned.total || 0,
            ...yearlyExp.map((yearData) => yearData?.yearTotal || 0),
            yearlyExp.reduce((acc, val) => acc + (val?.yearTotal || 0), 0),
            (budgetSanctioned.total || 0) - yearlyExp.reduce((acc, val) => acc + (val?.yearTotal || 0), 0),
        ]);

        doc.autoTable({
            head: headers,
            body: tableData,
            startY: 80,
            theme: "grid",
            styles: { fontSize: 8, textColor: [50, 50, 50]  },
            headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] }, 
        });

        const note = `
        Note:
        1. The audited statement of expenditure incurred under the Heads, and proper utilization of funds released during the period, 
        may be sent to agency immediately after the end of the financial year.
        `;
        doc.setFontSize(10);
        doc.text(note, 10, doc.lastAutoTable.finalY + 10);

        const currentYear = data?.currentYear || "unknown_year";
        doc.save(`SE_${id}_${currentYear}.pdf`);
    };

    console.log("neirneri", yearlyExp);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); 

const financialYear =
    currentMonth >= 3
        ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
        : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Request for Annual Installment with Up-to-Date Statement of Expenditure</p>
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
                            <span className="px-3 py-1 w-full">: {data.name}</span>
                            <label className="font-semibold text-gray-700">Name of the Scheme</label>
                            <span className="px-3 py-1 w-full">: {data.scheme}</span>
                            <label className="font-semibold text-gray-700">Present Year of Project</label>
                            <span className="px-3 py-1 w-full">: {data.currentYear}</span>
                            <label className="font-semibold text-gray-700">Total Project Cost </label>
                            <span className="px-3 py-1 w-full">: {data.TotalCost}</span>
                            <label className="font-semibold text-gray-700">Start Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.startDate}</span>
                            <label className="font-semibold text-gray-700">End Date of Year</label>
                            <span className="px-3 py-1 w-full">: {data.endDate}</span>
                        </div>

                        <label className="font-semibold text-gray-700">Grant Received in Each Year:</label>
                        <ul className="list-disc pl-6 ">
                            {yearlyBudget && yearlyBudget.map((sanct, index) => (
                                <li key={index} className="px-3 py-1 text-gray-700 font-bold w-full">
                                    <span>Year {index + 1}: {sanct}</span>
                                </li>
                            ))}
                        </ul>


                        <div className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
    <h2 className="text-center text-2xl font-bold mb-4">Statement of Expenditure for FY {financialYear}</h2>
    <h3 className="text-center text-lg font-semibold mb-4">Statement of Expenditure to be submitted financial year wise.</h3>
    <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg text-sm">
            <thead>
                <tr className="bg-blue-100 text-gray-700">
                    <th className="border border-gray-400 px-4 py-2" rowSpan="2">S/N</th>
                    <th className="border border-gray-400 px-4 py-2" rowSpan="2">Sanctioned Heads</th>
                    <th className="border border-gray-400 px-4 py-2" rowSpan="2">Total Funds Sanctioned</th>
                    <th className="border border-gray-400 px-4 py-2" colSpan={yearlyExp.length}>Expenditure Incurred</th>
                    <th className="border border-gray-400 px-4 py-2" rowSpan="2">Total Expenditure</th>
                    <th className="border border-gray-400 px-4 py-2" rowSpan="2">Balance</th>
                </tr>
                <tr className="bg-blue-100 text-gray-700">
                    {yearlyExp.map((_, index) => (
                        <th key={index} className="border border-gray-400 px-4 py-2">Year {index + 1}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
    {[
        { name: "Manpower Costs", key: "human_resources" },
        { name: "Consumables", key: "consumables" },
        { name: "Travel", key: "travel" },
        { name: "Other Costs", key: "others" },
        { name: "Equipment", key: "nonRecurring" },
        { name: "Overhead Expenses", key: "overhead" },
    ].map((head, index) => (
        <tr key={index} className="text-center">
            <td className="border border-gray-400 px-4 py-2">{index + 1}</td>
            <td className="border border-gray-400 px-4 py-2">{head.name}</td>
            <td className="border border-gray-400 px-4 py-2">
                {budgetSanctioned[head.key] || 0}
            </td>
            {yearlyExp.map((yearData, yearIndex) => (
                <td key={yearIndex} className="border border-gray-400 px-4 py-2">
                    {yearData?.recurring?.[head.key] || yearData?.[head.key] || 0}
                </td>
            ))}
            <td className="border border-gray-400 px-4 py-2">
                {yearlyExp.reduce((acc, val) => acc + (val?.recurring?.[head.key] || val?.[head.key] || 0), 0)}
            </td>
            <td className="border border-gray-400 px-4 py-2">
                {(budgetSanctioned[head.key] || 0) -
                    yearlyExp.reduce((acc, val) => acc + (val?.recurring?.[head.key] || val?.[head.key] || 0), 0)}
            </td>
        </tr>
    ))}
    <tr className="text-center font-bold">
        <td className="border border-gray-400 px-4 py-2">{yearlyExp.length + 1}</td>
        <td className="border border-gray-400 px-4 py-2">Total</td>
        <td className="border border-gray-400 px-4 py-2">
            {budgetSanctioned.total || 0}
        </td>
        {yearlyExp.map((yearData, yearIndex) => (
            <td key={yearIndex} className="border border-gray-400 px-4 py-2">
                {yearData?.yearTotal || 0}
            </td>
        ))}
        <td className="border border-gray-400 px-4 py-2">
            {yearlyExp.reduce((acc, val) => acc + (val?.yearTotal || 0), 0)}
        </td>
        <td className="border border-gray-400 px-4 py-2">
            {(budgetSanctioned.total || 0) -
                yearlyExp.reduce((acc, val) => acc + (val?.yearTotal || 0), 0)}
        </td>
    </tr>
</tbody>

        </table>
    </div>
    <div className="mt-6">
        <p className="text-sm text-gray-700">
            <strong>Note:</strong> The audited statement of expenditure incurred under the Heads, and proper utilization of funds released during the period, may be sent to the agency immediately after the end of the financial year.
        </p>
    </div>
</div>

                        <div className="text-center mt-4">
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
                            onClick={handleSaveAsPDF}
                        >
                            Save as PDF
                        </button>
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

export default SEForm;